/* ── Die e-boekblad se "mees gewild" ──
 *
 *   GET /api/top-boeke   (oop)
 *     → { boeke: [{ bookId, aantal }] }   grootste eerste, hoogstens 50
 *
 * Lees EEN dokument, `berekening/topBoeke`. Is dit ouer as 24 uur (of bestaan
 * dit nie), tel hierdie eindpunt self weer (`telEnStoor`) — die eerste
 * besoeker ná 'n dag betaal 'n paar sekondes, en die rand se
 * stale-while-revalidate gee intussen aan almal die vorige antwoord. Die
 * admin se "Wys die mees afgelaaide boeke" skryf dieselfde dokument.
 *
 * Geen cron nie, met opset: 'n ekstra cron kan op party Vercel-planne die
 * hele ontplooiing laat misluk.
 * Daar is niks persoonliks in nie — net boek-id's en getalle — en die rand kas
 * dit 'n uur, dus is dit een lesing per uur vir die hele wêreld.
 *
 * Bestaan die dokument nog nie, of is Firestore af, gee dit 'n LEË lys en die
 * blad wys sonder 'n gewild-groep, net soos voorheen. Die witlys bou elke
 * inskrywing nuut op: net `bookId` (string) en `aantal` (positiewe heelgetal).
 */
const crypto = require('crypto')
const { telEnStoor, isOud, BASIS } = require('./_boekAflaaie.js')

async function getAccessToken() {
  const now    = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const claim  = Buffer.from(JSON.stringify({
    iss: process.env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  })).toString('base64url')
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(`${header}.${claim}`)
  const sig = sign.sign(privateKey, 'base64url')
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${header}.${claim}.${sig}`,
  })
  const data = await r.json()
  if (!data.access_token) throw new Error('No token')
  return data.access_token
}

function skoonLys(teks) {
  let rou
  try { rou = JSON.parse(String(teks || '[]')) } catch { return [] }
  if (!Array.isArray(rou)) return []
  return rou
    .filter(t => t && typeof t.bookId === 'string' && /^[A-Za-z0-9_-]{1,120}$/.test(t.bookId)
              && Number.isInteger(t.aantal) && t.aantal > 0)
    .slice(0, 50)
    .map(t => ({ bookId: t.bookId, aantal: t.aantal }))
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ fout: 'Net GET' })
  const projectId = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
  let boeke = []
  try {
    const token = await getAccessToken()
    const r = await fetch(`${BASIS(projectId)}/berekening/topBoeke`, { headers: { Authorization: `Bearer ${token}` } })
    const d = r.ok ? await r.json() : null
    const f = (d && d.fields) || {}
    boeke = skoonLys(f.lys && f.lys.stringValue)
    if ((r.ok || r.status === 404) && isOud(f.datum && f.datum.timestampValue, Date.now())) {
      try {
        const uit = await telEnStoor(projectId, token)
        boeke = skoonLys(JSON.stringify(uit.boeke.slice(0, 50)))
      } catch { /* hou die ou lys */ }
    }
  } catch { /* leë lys */ }
  /* 'n Leë antwoord word nie lank gekas nie — dan kom die egte een gouer. */
  res.setHeader('Cache-Control', boeke.length
    ? 'public, s-maxage=3600, stale-while-revalidate=86400'
    : 'public, s-maxage=60')
  return res.status(200).json({ boeke })
}

module.exports.skoonLys = skoonLys
