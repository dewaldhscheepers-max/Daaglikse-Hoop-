/* VOLG JESUS — die admin se eindpunt vir een week.
 *
 *   GET  /api/volg-jesus-week            → die lys van al 52 se rugstring
 *   GET  /api/volg-jesus-week?week=1     → een volledige week
 *   PUT  /api/volg-jesus-week            → stoor een week
 *
 * ── Wie mag ──
 *
 * Net 'n mens met `SORG_ADMIN_GEHEIM` in 'n `x-sorg-geheim`-kopstuk. Dieselfde
 * slot as die res van die admin; die vergelyking staan een keer, in
 * _geheim.js, deur timingSafeEqual.
 *
 * Daar is DOELBEWUS geen openbare leeseindpunt nie. Die program is nie in die
 * app tot Week 52 klaar is, en 'n eindpunt wat "net die gepubliseerdes" wys,
 * is presies hoe 'n halwe program per ongeluk lewendig gaan.
 */
const crypto = require('crypto')
const { magAdminDing } = require('./_geheim.js')
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

  res.setHeader('Allow', 'GET, PUT')
  return res.status(405).json({ fout: 'net GET of PUT' })
}

function veiligJson(s) { try { return JSON.parse(s) } catch { return {} } }
