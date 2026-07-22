const crypto = require('crypto')

async function getAccessToken() {
  const now    = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const claim  = Buffer.from(JSON.stringify({
    iss:   process.env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/devstorage.read_write',
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

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { pin, bookId, filename, imageBase64 } = req.body || {}

  if (pin !== '2025') return res.status(401).json({ error: 'Ongemagtig' })
  if (!bookId || !filename || !imageBase64) {
    return res.status(400).json({ error: 'bookId, filename en imageBase64 is vereis' })
  }

  let token
  try { token = await getAccessToken() } catch (e) {
    return res.status(500).json({ error: 'Auth misluk: ' + e.message })
  }

  const bucket      = 'daaglikse-hoop.firebasestorage.app'
  const storagePath = `kinder-boeke/${bookId}/${filename}`
  const ext         = filename.toLowerCase().split('.').pop()
  const contentType = ext === 'png' ? 'image/png' : 'image/jpeg'

  let buffer
  try {
    buffer = Buffer.from(imageBase64, 'base64')
  } catch (e) {
    return res.status(400).json({ error: 'Ongeldige base64: ' + e.message })
  }

  try {
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(storagePath)}`
    const r = await fetch(uploadUrl, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': contentType },
      body:    buffer,
    })
    if (!r.ok) {
      const err = await r.text()
      return res.status(500).json({ error: 'Storage upload misluk: ' + err })
    }
  } catch (e) {
    return res.status(500).json({ error: 'Storage fout: ' + e.message })
  }

  const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(storagePath)}?alt=media`
  return res.status(200).json({ ok: true, url: downloadUrl })
}
