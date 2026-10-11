/* ── VOLG JESUS: die prente wat VOORHEEN vir 'n week opgelaai is ──
 *
 * Dewald, 11 Oktober 2026, nadat "↓ Laai die geskrewe teks" sy week se
 * wallpaper-skakels leeg gemaak het: *"Het jy nie die ou wallpapers nie."*
 *
 * Die prente was nooit weg nie. PrentOplaai.jsx gee elke oplaai 'n eie naam
 * (`covers/vj-w<week>-<veld>-<tyd>.<uit>`) en niks in hierdie app vee 'n lêer
 * in Storage uit nie — net die SKAKEL in die week se dokument was leeg. Maar
 * om hom terug te kry, moes 'n mens op 'n rekenaar deur die Firebase-konsole
 * se Storage-vouer gaan soek. Hierdie eindpunt lys hulle, sodat die admin dit
 * met een druk kan terugsit.
 *
 * Drie hekke:
 *   · admin-alleen (`magAdminDing`) — dit lys lêers met die diensrekening;
 *   · LEES-alleen: die token se omvang is `devstorage.read_only`;
 *   · die voorvoegsel word hier GEBOU uit 'n weeknommer en 'n veld uit 'n
 *     witlys, nooit uit 'n string wat die kliënt stuur nie — anders is dit 'n
 *     eindpunt wat enige vouer in die emmer kan lys.
 */
const crypto = require('crypto')
const { magAdminDing } = require('./_geheim.js')
const { voorvoegsel, ontleedPrente } = require('./_ouPrente.js')

const EMMER = 'daaglikse-hoop.firebasestorage.app'

async function kryToken() {
  const nou = Math.floor(Date.now() / 1000)
  const kop = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const eis = Buffer.from(JSON.stringify({
    iss:   process.env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/devstorage.read_only',
    aud:   'https://oauth2.googleapis.com/token',
    iat:   nou,
    exp:   nou + 3600,
  })).toString('base64url')
  const sleutel = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  if (!sleutel || !process.env.FIREBASE_CLIENT_EMAIL) throw new Error('die diensrekening is nie opgestel nie')
  const teken = crypto.createSign('RSA-SHA256')
  teken.update(`${kop}.${eis}`)
  const jwt = `${kop}.${eis}.${teken.sign(sleutel, 'base64url')}`
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  })
  const d = await r.json()
  if (!d.access_token) throw new Error('geen toegangstoken')
  return d.access_token
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'GET') return res.status(405).json({ ok: false, fout: 'Net GET' })
  if (!magAdminDing(req)) return res.status(401).json({ ok: false, fout: 'Ongemagtig' })

  const q = req.query || {}
  const pad = voorvoegsel(q.week, q.veld)
  if (!pad) return res.status(400).json({ ok: false, fout: 'Onbekende week of veld' })

  try {
    const token = await kryToken()
    const items = []
    let blad = ''
    /* Bladsye, met 'n perk: 'n week het 'n handjievol oplaaie, nie duisende nie. */
    for (let i = 0; i < 5; i++) {
      const url = `https://storage.googleapis.com/storage/v1/b/${EMMER}/o`
        + `?prefix=${encodeURIComponent(pad)}&maxResults=200`
        + `&fields=${encodeURIComponent('items(name,timeCreated,metadata),nextPageToken')}`
        + (blad ? `&pageToken=${encodeURIComponent(blad)}` : '')
      const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (!r.ok) return res.status(502).json({ ok: false, fout: `Storage (${r.status})` })
      const d = await r.json()
      items.push(...(d.items || []))
      blad = d.nextPageToken || ''
      if (!blad) break
    }
    return res.status(200).json({ ok: true, prente: ontleedPrente(items, EMMER) })
  } catch (e) {
    return res.status(500).json({ ok: false, fout: (e && e.message) || 'Kon nie lys nie' })
  }
}
