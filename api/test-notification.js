const crypto = require('crypto')

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
const ADMIN_PIN  = '2025'

async function getAccessToken() {
  const now    = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const claim  = Buffer.from(JSON.stringify({
    iss:   process.env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
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

async function sendFcm(token) {
  const accessToken = await getAccessToken()
  const r = await fetch(`https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        token,
        notification: { title: '🌅 Daaglikse Hoop', body: 'Toets-kennisgewinig — dit werk!' },
        webpush: {
          fcmOptions: { link: 'https://daaglikse-hoop.vercel.app/' },
          notification: {
            icon:  '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
          },
        },
      }
    })
  })
  const data = await r.json()
  console.log('FCM response:', JSON.stringify(data))
  if (!r.ok) throw new Error(JSON.stringify(data))
  return data
}

module.exports = async function handler(req, res) {
  // GET request: ?token=XXX&pin=2025 — open in any browser to test while PWA is closed
  if (req.method === 'GET') {
    const { token, pin } = req.query || {}
    if (pin !== ADMIN_PIN) return res.status(401).send('Unauthorized')
    if (!token) return res.status(400).send('No token')
    try {
      const fcm = await sendFcm(token)
      return res.status(200).send(`<html><body style="font-family:sans-serif;padding:24px">
        <h2>✅ Toets gestuur!</h2>
        <p>FCM het die boodskap aanvaar. Kyk jou foon se kennisgewings.</p>
        <pre style="background:#eee;padding:12px;border-radius:6px">${JSON.stringify(fcm, null, 2)}</pre>
      </body></html>`)
    } catch (e) {
      return res.status(500).send(`<html><body style="font-family:sans-serif;padding:24px">
        <h2>❌ Fout</h2><pre>${e.message}</pre>
      </body></html>`)
    }
  }

  // POST request: { token, pin } — called from Admin panel
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')
  const { token, pin } = req.body || {}
  if (pin !== ADMIN_PIN) return res.status(401).send('Unauthorized')
  if (!token) return res.status(400).send('No token')

  try {
    const fcm = await sendFcm(token)
    return res.status(200).json({ ok: true, fcm })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
