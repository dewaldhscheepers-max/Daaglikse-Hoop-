const crypto = require('crypto')
const { tekenSleutel } = require('./_geheim.js')

function todayStr() { return new Date().toISOString().slice(0, 10) }
function yesterdayStr() {
  const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10)
}

/* Die sleutel het 'n openbare terugval gehad; sien `_geheim.js`. Die teken
   self bly presies dieselfde vorm, dus verander niks aan hoe skakels werk
   nie — net WIE een kan uitreken. */
function makeToken(bookId, date) {
  return crypto.createHmac('sha256', tekenSleutel())
    .update(bookId + ':' + date).digest('hex').slice(0, 32)
}

function validToken(bookId, token) {
  return token === makeToken(bookId, todayStr()) || token === makeToken(bookId, yesterdayStr())
}

async function getAccessToken() {
  const now    = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const claim  = Buffer.from(JSON.stringify({
    iss:   process.env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud:   'https://oauth2.googleapis.com/token',
    iat:   now,
    exp:   now + 3600,
  })).toString('base64url')
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(`${header}.${claim}`)
  const sig = sign.sign(privateKey, 'base64url')
  const jwt = `${header}.${claim}.${sig}`
  const r   = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  })
  const data = await r.json()
  if (!data.access_token) throw new Error('No access token')
  return data.access_token
}

module.exports = async function handler(req, res) {
  const { bookId, token } = req.query || {}
  if (!bookId || !token) return res.status(400).send('Missing params')
  if (!validToken(bookId, token)) return res.status(403).send('Invalid token')

  // Get pdfUrl from Firestore
  let pdfUrl = null
  let title  = bookId
  try {
    const fsToken = await getAccessToken()
    const projectId = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
    const r   = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/books/${bookId}`,
      { headers: { Authorization: `Bearer ${fsToken}` } }
    )
    if (r.ok) {
      const doc = await r.json()
      pdfUrl = doc.fields?.pdfUrl?.stringValue || null
      title  = doc.fields?.title?.stringValue  || bookId
    }
  } catch (e) {
    return res.status(500).send('Firestore error: ' + e.message)
  }

  if (!pdfUrl) return res.status(404).send('PDF nie gevind nie')

  // Fetch PDF and stream with attachment header
  try {
    const pdf = await fetch(pdfUrl)
    if (!pdf.ok) return res.status(502).send('PDF fetch failed')

    const filename = title.replace(/[^a-zA-Z0-9 ]/g, '').trim() + '.pdf'
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Cache-Control', 'private, max-age=3600')

    const buffer = await pdf.arrayBuffer()
    res.send(Buffer.from(buffer))
  } catch (e) {
    res.status(500).send('Download error: ' + e.message)
  }
}
