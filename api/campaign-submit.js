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
  if (!data.access_token) throw new Error('No access token')
  return data.access_token
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { name, email } = req.body || {}

  if (!name || !email) return res.status(400).json({ error: 'Naam en e-pos is vereis' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Ongeldige e-posadres' })

  const projectId  = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
  const cleanEmail = email.toLowerCase().trim()
  const docId      = Buffer.from(cleanEmail).toString('base64').replace(/[^a-zA-Z0-9]/g, '_')
  const baseUrl    = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`

  let token
  try { token = await getAccessToken() } catch (e) {
    return res.status(500).json({ error: 'Auth failed' })
  }

  // Check if email already exists — if so, just return success (no duplicate)
  const checkRes = await fetch(`${baseUrl}/emailList/${docId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  const existing = await checkRes.json()
  const alreadyExists = checkRes.ok && existing.fields

  if (!alreadyExists) {
    // Save to emailList (same collection used for all bulk email sends)
    await fetch(`${baseUrl}/emailList/${docId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          email:    { stringValue: cleanEmail },
          name:     { stringValue: name.trim() },
          source:   { stringValue: '1000-huise-van-hoop' },
          campaign: { stringValue: '1000 Huise van Hoop' },
          addedAt:  { timestampValue: new Date().toISOString() },
        }
      })
    })

    // Increment campaign counter
    const counter = await fetch(`${baseUrl}/stats/campaign_huise`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.ok ? r.json() : null)
    const currentTotal = parseInt(counter?.fields?.total?.integerValue ?? '0')
    await fetch(`${baseUrl}/stats/campaign_huise?updateMask.fieldPaths=total`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { total: { integerValue: String(currentTotal + 1) } } }),
    })
  }

  return res.status(200).json({ success: true })
}
