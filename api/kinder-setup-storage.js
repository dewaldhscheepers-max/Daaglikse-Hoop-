const crypto = require('crypto')

async function getAccessToken() {
  const now    = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const claim  = Buffer.from(JSON.stringify({
    iss:   process.env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/firebase',
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
  if (!data.access_token) throw new Error('No token: ' + JSON.stringify(data))
  return data.access_token
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { pin } = req.body || {}
  if (pin !== '2025') return res.status(401).json({ error: 'Ongemagtig' })

  const project = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
  const bucket  = `${project}.firebasestorage.app`

  let token
  try { token = await getAccessToken() } catch (e) {
    return res.status(500).json({ error: 'Auth misluk: ' + e.message })
  }

  const rules = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /kinder-boeke/{allPaths=**} {
      allow read;
      allow write: if request.auth != null;
    }
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}`

  // 1. Create ruleset
  const rulesetRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${project}/rulesets`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: { files: [{ name: 'storage.rules', content: rules }] } }),
    }
  )
  const rulesetData = await rulesetRes.json()
  if (!rulesetData.name) return res.status(500).json({ error: 'Ruleset misluk: ' + JSON.stringify(rulesetData) })

  // 2. Publish release
  const releaseName = `projects/${project}/releases/firebase.storage/${bucket}`
  const releaseRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${project}/releases/${encodeURIComponent(`firebase.storage/${bucket}`)}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: releaseName, rulesetName: rulesetData.name }),
    }
  )
  const releaseData = await releaseRes.json()
  if (!releaseData.name) return res.status(500).json({ error: 'Release misluk: ' + JSON.stringify(releaseData) })

  return res.status(200).json({ ok: true })
}
