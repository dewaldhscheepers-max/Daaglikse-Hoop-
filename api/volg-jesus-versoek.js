/* VOLG JESUS — "kontak my".
 *
 *   POST  /api/volg-jesus-versoek         'n mens vra dat sy gemeente hom bel
 *   GET   /api/volg-jesus-versoek         die pastor se lys        (admin)
 *   PATCH /api/volg-jesus-versoek         merk een as hanteer      (admin)
 *
 * ── Hoekom POST geen geheim dra nie ──
 *
 * Dit word deur die APP geroep, en 'n geheim in `src/` is geen geheim nie.
 * Dieselfde besluit as api/toets-kennisgewing.js.
 *
 * Die hek is dus nie 'n wagwoord nie — dit is die VORM. Net vier velde
 * oorleef, die opskrif en die tyd word deur ONS gestel, en 'n keuse wat nie
 * kontak aanbied nie word verwerp. Sien api/_volgJesusVersoek.js.
 *
 * Die ergste wat iemand kan doen is 'n vals doopversoek instuur. 'n Pastor bel
 * dit, kry niemand, en merk dit as hanteer. Dit is 'n ongerief, nie 'n lek nie.
 *
 * ── Wat NOOIT hier kom nie ──
 *
 * Geen refleksie, geen joernaal, geen hartsantwoord. Daardie goed word nooit
 * na 'n bediener gestuur nie — hulle bly op die toestel.
 */
const crypto = require('crypto')
const { magAdminDing } = require('./_geheim.js')
const { maakVersoek, virDieKerk } = require('./_volgJesusVersoek.js')

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
const VERSAMELING = 'volgJesusVersoeke'

async function getAccessToken() {
  const now    = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const claim  = Buffer.from(JSON.stringify({
    iss:   process.env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud:   'https://oauth2.googleapis.com/token',
    exp:   now + 3600,
    iat:   now,
  })).toString('base64url')

  const sleutel = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  const teken   = crypto.createSign('RSA-SHA256')
  teken.update(`${header}.${claim}`)
  const handtekening = teken.sign(sleutel, 'base64url')

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion:  `${header}.${claim}.${handtekening}`,
    }),
  })
  if (!r.ok) throw new Error(`oauth ${r.status}`)
  return (await r.json()).access_token
}

const basis = () =>
  `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${VERSAMELING}`

/* Firestore se veldkodering. Hier is dit die moeite werd om dit uit te skryf
   in plaas van een JSON-string: die pastor se lys moet op `hanteer` kan
   filter, en 'n string sou dit onmoontlik maak. */
function naVelde(v) {
  const f = {
    mylpaal: { stringValue: v.mylpaal },
    waarde:  { stringValue: v.waarde },
    naam:    { stringValue: v.naam },
    kontak:  { stringValue: v.kontak },
    opskrif: { stringValue: v.opskrif },
    geskep:  { timestampValue: v.geskep },
    hanteer: { booleanValue: v.hanteer === true },
  }
  if (v.gemeente) f.gemeente = { stringValue: v.gemeente }
  return { fields: f }
}

function uitVelde(dok) {
  if (!dok || !dok.fields) return null
  const f = dok.fields
  const s = k => (f[k] && f[k].stringValue) || null
  return {
    id:      (dok.name || '').split('/').pop() || null,
    mylpaal: s('mylpaal'),
    waarde:  s('waarde'),
    naam:    s('naam'),
    kontak:  s('kontak'),
    opskrif: s('opskrif'),
    gemeente: s('gemeente'),
    geskep:  (f.geskep && f.geskep.timestampValue) || null,
    hanteer: f.hanteer ? f.hanteer.booleanValue === true : false,
  }
}

module.exports = async function handler(req, res) {
  /* ── 'n Mens vra dat sy gemeente hom kontak ─────────────────────── */
  if (req.method === 'POST') {
    const lyf = typeof req.body === 'string' ? veiligJson(req.body) : (req.body || {})
    const { versoek, fout } = maakVersoek(lyf, new Date().toISOString())
    if (fout) return res.status(400).json({ fout })

    try {
      const token = await getAccessToken()
      const r = await fetch(basis(), {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify(naVelde(versoek)),
      })
      if (!r.ok) {
        const teks = await r.text().catch(() => '')
        console.error('[vj-versoek]', r.status, teks.slice(0, 200))
        return res.status(500).json({ fout: 'Kon nie stuur nie' })
      }
      return res.status(200).json({ ok: true })
    } catch (e) {
      console.error('[vj-versoek]', e && e.message)
      return res.status(500).json({ fout: 'Kon nie stuur nie' })
    }
  }

  /* Alles hierna is die pastor s'n. */
  if (!magAdminDing(req)) return res.status(401).json({ fout: 'Ongemagtig' })

  let token
  try { token = await getAccessToken() }
  catch (e) {
    console.error('[vj-versoek]', e && e.message)
    return res.status(500).json({ fout: 'Kon nie by Firestore kom nie' })
  }
  const kop = { Authorization: `Bearer ${token}` }

  if (req.method === 'GET') {
    try {
      const r = await fetch(`${basis()}?pageSize=200`, { headers: kop })
      if (!r.ok) return res.status(200).json({ versoeke: [] })
      const j = await r.json()
      const versoeke = (j.documents || [])
        .map(uitVelde).filter(Boolean)
        /* Nuutste eerste, en die onhanteerdes bo. */
        .sort((a, b) => (a.hanteer === b.hanteer)
          ? String(b.geskep).localeCompare(String(a.geskep))
          : (a.hanteer ? 1 : -1))
        .map(virDieKerk)
      return res.status(200).json({ versoeke })
    } catch (e) {
      console.error('[vj-versoek lys]', e && e.message)
      return res.status(500).json({ fout: 'Kon nie die lys laai nie' })
    }
  }

  if (req.method === 'PATCH') {
    const lyf = typeof req.body === 'string' ? veiligJson(req.body) : (req.body || {})
    const id = typeof lyf.id === 'string' ? lyf.id.trim() : ''
    /* 'n Firestore-dokumentnaam, niks anders. 'n Rou string in 'n pad is hoe
       'n mens per ongeluk 'n ander versameling raak. */
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) return res.status(400).json({ fout: 'Geen geldige id' })

    try {
      const r = await fetch(
        `${basis()}/${id}?updateMask.fieldPaths=hanteer`,
        {
          method:  'PATCH',
          headers: { ...kop, 'Content-Type': 'application/json' },
          body:    JSON.stringify({ fields: { hanteer: { booleanValue: lyf.hanteer !== false } } }),
        },
      )
      if (!r.ok) return res.status(500).json({ fout: 'Kon nie merk nie' })
      return res.status(200).json({ ok: true })
    } catch (e) {
      console.error('[vj-versoek merk]', e && e.message)
      return res.status(500).json({ fout: 'Kon nie merk nie' })
    }
  }

  res.setHeader('Allow', 'POST, GET, PATCH')
  return res.status(405).json({ fout: 'net POST, GET of PATCH' })
}

function veiligJson(s) { try { return JSON.parse(s) } catch { return {} } }
