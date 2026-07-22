const crypto = require('crypto')

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
  if (!data.access_token) throw new Error('No access token: ' + JSON.stringify(data))
  return data.access_token
}

function parseDoc(fsDoc) {
  const id = fsDoc.name.split('/').pop()
  const f  = fsDoc.fields || {}
  return {
    id,
    title:       f.title?.stringValue       || '',
    description: f.description?.stringValue || '',
    ageRange:    f.ageRange?.stringValue     || '2–5 jaar',
    cover:       f.cover?.stringValue        || '',
    status:      f.status?.stringValue       || 'draft',
    pages:       (f.pages?.arrayValue?.values || []).map(v => v.stringValue || '').filter(Boolean),
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' })

  const projectId = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'

  let token
  try { token = await getAccessToken() } catch (e) {
    return res.status(500).json({ error: 'Auth misluk: ' + e.message })
  }

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/kinderBoeke`
  let r
  try {
    r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  } catch (e) {
    return res.status(500).json({ error: 'Firestore fout: ' + e.message })
  }

  if (!r.ok) {
    const err = await r.text()
    return res.status(500).json({ error: 'Firestore list misluk: ' + err })
  }

  const data = await r.json()
  const books = (data.documents || []).map(parseDoc)

  return res.status(200).json({ books })
}
