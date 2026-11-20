/* ── Aflaaie per e-boek, vir die admin ──
 *
 *   GET /api/boek-aflaaie   (x-sorg-geheim)
 *     → { totaal, boeke: [{ bookId, aantal }] }   grootste eerste
 *
 * Lees `freeDownloads` met net die `bookId`-veld (mask), duisend op 'n bladsy,
 * en tel met `telPerBoek` (_boekAflaaie.js). Admin-alleen: dit is dokumente
 * wat e-posadresse dra, al gaan net die boek-id's terug.
 */
const crypto = require('crypto')
const { magAdminDing } = require('./_geheim.js')
const { telPerBoek } = require('./_boekAflaaie.js')

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

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ fout: 'Net GET' })
  if (!magAdminDing(req)) return res.status(403).json({ fout: 'Nie toegelaat nie' })

  const projectId = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
  let token
  try { token = await getAccessToken() } catch { return res.status(500).json({ fout: 'Auth' }) }

  try {
    const documents = []
    let pageToken = ''
    do {
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/freeDownloads`
        + `?pageSize=1000&mask.fieldPaths=bookId${pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : ''}`
      const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      /* 'n Halwe telling lyk soos 'n feit — val eerder om. */
      if (!r.ok) return res.status(500).json({ fout: 'Kon nie die aflaaie lees nie' })
      const data = await r.json()
      if (data.documents) documents.push(...data.documents)
      pageToken = data.nextPageToken || ''
    } while (pageToken)

    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ totaal: documents.length, boeke: telPerBoek(documents) })
  } catch {
    return res.status(500).json({ fout: 'Kon nie die aflaaie lees nie' })
  }
}
