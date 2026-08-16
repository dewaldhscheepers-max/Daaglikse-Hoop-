/* VOLG JESUS — die admin se eindpunt vir een week.
 *
 *   GET  /api/volg-jesus-week            → die lys van al 52 se rugstring
 *   GET  /api/volg-jesus-week?week=1     → een volledige week
 *   PUT  /api/volg-jesus-week            → stoor een week
 *   DELETE /api/volg-jesus-week?week=7   → vee een week uit
 *   DELETE /api/volg-jesus-week?alles=ja → vee ALLES uit
 *
 * ── Wie mag ──
 *
 * Net 'n mens met `SORG_ADMIN_GEHEIM` in 'n `x-sorg-geheim`-kopstuk. Dieselfde
 * slot as die res van die admin; die vergelyking staan een keer, in
 * _geheim.js, deur timingSafeEqual.
 *
 * ── Die openbare pad staan ELDERS ──
 *
 * Hier het gestaan: "Daar is DOELBEWUS geen openbare leeseindpunt nie ... 'n
 * eindpunt wat 'net die gepubliseerdes' wys, is presies hoe 'n halwe program
 * per ongeluk lewendig gaan."
 *
 * Die program loop nou lewendig terwyl dit groei — Dewald laai een week per
 * dag — en die publiek lees deur `volg-jesus-openbaar.mjs`. Die vrees bly
 * geldig en is 'n toets geword: daardie leer stuur net weke waar
 * `gepubliseer === true` (die APARTE Firestore-veld, nie iets in die JSON
 * nie) en bou sy antwoord uit 'n WITLYS, sodat niks van hierdie eindpunt se
 * fasiliteerder- of hersieningsmateriaal daar kan uitkom nie.
 *
 * HIERDIE leer bly heeltemal toe. Wat hier deurkom, is die volle week.
 */
const crypto = require('crypto')
const { magAdminDing, wieMag } = require('./_geheim.js')
const { dokNaam, naFirestore, uitFirestore, lysInskrywing } = require('./_volgJesusBerging.js')

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
const VERSAMELING = 'volgJesusWeke'

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

module.exports = async function handler(req, res) {
  if (!magAdminDing(req)) return res.status(401).json({ fout: 'Ongemagtig' })

  /* 'n MENS mag uitvee. 'n Cron nie.
   *
   * magAdminDing() laat albei deur, want dit vra net "is daar 'n geldige
   * geheim". Dit is reg vir lees en stoor. Dit is VERKEERD vir DELETE: hierdie
   * is die enigste eindpunt in die kodebasis wat data VERNIETIG, en Vercel
   * stuur CRON_SECRET self by elke geskeduleerde lopie. Wys 'n cron-pad ooit
   * per ongeluk hierheen, is die hele program in een oggend weg.
   *
   * wieMag() gee terug WIE ingekom het; hier tel net 'admin'. Dit staan BO die
   * teken-haal sodat 'n cron omgedraai word voor ons enigiets met Firestore
   * doen. */
  if (req.method === 'DELETE' && wieMag(req) !== 'admin') {
    return res.status(403).json({ fout: 'Net n mens met die admin-geheim mag uitvee' })
  }

  let token
  try { token = await getAccessToken() }
  catch (e) {
    console.error('[volg-jesus]', e && e.message)
    return res.status(500).json({ fout: 'Kon nie by Firestore kom nie' })
  }
  const kop = { Authorization: `Bearer ${token}` }

  /* ── Lys ─────────────────────────────────────────────────────────── */
  if (req.method === 'GET' && !((req.query || {}).week)) {
    try {
      const r = await fetch(`${basis()}?pageSize=100`, { headers: kop })
      if (!r.ok) return res.status(200).json({ weke: [] })
      const j = await r.json()
      const weke = (j.documents || [])
        .map(uitFirestore)
        .map(lysInskrywing)
        .filter(Boolean)
        .sort((a, b) => a.weeknommer - b.weeknommer)
      return res.status(200).json({ weke })
    } catch (e) {
      console.error('[volg-jesus lys]', e && e.message)
      return res.status(500).json({ fout: 'Kon nie die lys laai nie' })
    }
  }

  /* ── Een week ────────────────────────────────────────────────────── */
  if (req.method === 'GET') {
    const naam = dokNaam((req.query || {}).week)
    if (!naam) return res.status(400).json({ fout: 'Weeknommer moet 1 tot 52 wees' })
    try {
      const r = await fetch(`${basis()}/${naam}`, { headers: kop })
      /* 404 is nie 'n fout nie — dit beteken hierdie week is nog nie geskryf
         nie, en die admin moet 'n lee vorm kry. */
      if (r.status === 404) return res.status(200).json({ week: null })
      if (!r.ok) return res.status(500).json({ fout: 'Firestore ' + r.status })
      return res.status(200).json({ week: uitFirestore(await r.json()) })
    } catch (e) {
      console.error('[volg-jesus lees]', e && e.message)
      return res.status(500).json({ fout: 'Kon nie die week laai nie' })
    }
  }

  /* ── Vee uit ─────────────────────────────────────────────────────────
   *
   *   DELETE /api/volg-jesus-week?week=7      → een week
   *   DELETE /api/volg-jesus-week?alles=ja    → ALLES
   *
   * Hoekom dit bestaan: Dewald skryf die program oor. Om die ou weke uit die
   * KODE te haal help niks — die admin lees uit Firestore, en daar staan
   * hulle nog. Sonder hierdie eindpunt sou 'n mens 24 weke se velde met die
   * hand moes leegmaak.
   *
   * Dit is die enigste plek in hierdie kodebasis wat data VERNIETIG, en
   * daarom is `?alles=ja` opsetlik omslagtig: dit is nie 'n verstek nie, dit
   * moet uitgespel word. Die admin vra ook twee keer voor dit hier kom. */
  if (req.method === 'DELETE') {
    const q = req.query || {}
    const alles = String(q.alles || '') === 'ja'

    if (!alles) {
      const naam = dokNaam(q.week)
      if (!naam) return res.status(400).json({ fout: 'Weeknommer moet 1 tot 52 wees' })
      try {
        const r = await fetch(`${basis()}/${naam}`, { method: 'DELETE', headers: kop })
        /* 404 beteken dit was reeds weg. Dit is die uitkoms wat gevra is. */
        if (!r.ok && r.status !== 404) return res.status(500).json({ fout: 'Firestore ' + r.status })
        return res.status(200).json({ ok: true, uitgevee: [Number(q.week)] })
      } catch (e) {
        console.error('[volg-jesus vee]', e && e.message)
        return res.status(500).json({ fout: 'Kon nie uitvee nie' })
      }
    }

    try {
      const r = await fetch(`${basis()}?pageSize=100`, { headers: kop })
      if (!r.ok) return res.status(500).json({ fout: 'Firestore ' + r.status })
      const j = await r.json()
      const name = d => String((d && d.name) || '')
      const dokke = (j.documents || []).map(name).filter(Boolean)

      const uitgevee = [], misluk = []
      for (const volleNaam of dokke) {
        const kort = volleNaam.split('/').pop()
        const n = Number(String(kort).replace(/^week-/, ''))
        try {
          const d = await fetch(`${basis()}/${kort}`, { method: 'DELETE', headers: kop })
          if (d.ok || d.status === 404) uitgevee.push(n); else misluk.push(n)
        } catch { misluk.push(n) }
      }
      uitgevee.sort((a, b) => a - b); misluk.sort((a, b) => a - b)
      return res.status(200).json({ ok: !misluk.length, uitgevee, misluk })
    } catch (e) {
      console.error('[volg-jesus vee alles]', e && e.message)
      return res.status(500).json({ fout: 'Kon nie uitvee nie' })
    }
  }

  /* ── Stoor ───────────────────────────────────────────────────────── */
  if (req.method === 'PUT' || req.method === 'POST') {
    const lyf = typeof req.body === 'string' ? veiligJson(req.body) : (req.body || {})
    const week = lyf.week
    if (!week || typeof week !== 'object') return res.status(400).json({ fout: 'Geen week' })

    const naam = dokNaam(week.weeknommer)
    if (!naam) return res.status(400).json({ fout: 'Weeknommer moet 1 tot 52 wees' })

    let lyf2
    try { lyf2 = naFirestore(week, new Date().toISOString()) }
    catch (e) { return res.status(400).json({ fout: e.message }) }

    try {
      const r = await fetch(`${basis()}/${naam}`, {
        method:  'PATCH',
        headers: { ...kop, 'Content-Type': 'application/json' },
        body:    JSON.stringify(lyf2),
      })
      if (!r.ok) {
        const teks = await r.text().catch(() => '')
        console.error('[volg-jesus stoor]', r.status, teks.slice(0, 300))
        return res.status(500).json({ fout: 'Kon nie stoor nie' })
      }
      return res.status(200).json({ ok: true, week: uitFirestore(await r.json()) })
    } catch (e) {
      console.error('[volg-jesus stoor]', e && e.message)
      return res.status(500).json({ fout: 'Kon nie stoor nie' })
    }
  }

  res.setHeader('Allow', 'GET, PUT, DELETE')
  return res.status(405).json({ fout: 'net GET, PUT of DELETE' })
}

function veiligJson(s) { try { return JSON.parse(s) } catch { return {} } }
