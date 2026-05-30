const crypto  = require('crypto')
const webpush = require('web-push')

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
const ADMIN_PIN  = '2025'

webpush.setVapidDetails(
  'mailto:dewald.h.scheepers@gmail.com',
  process.env.VAPID_PUBLIC_KEY  || 'BAnuOtTx2mu8dUar_e7CO-6a4edbIue7Qi2SMCav-ilvxJeh-W2uH4p93LCHNt4P_9A2uj3HyUoOfjulI2OmN5o',
  process.env.VAPID_PRIVATE_KEY || ''
)

async function getAccessToken() {
  const now    = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const claim  = Buffer.from(JSON.stringify({
    iss:   process.env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/firebase.messaging https://www.googleapis.com/auth/datastore',
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
          notification: { icon: '/icons/icon-192.png', badge: '/icons/icon-192.png' },
        },
      }
    })
  })
  const data = await r.json()
  if (!r.ok) throw new Error(JSON.stringify(data))
  return data
}

async function getWebPushSubscription(subscriptionId, accessToken) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/webPushSubscriptions/${subscriptionId}`
  const r = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } })
  const data = await r.json()
  if (!r.ok || !data.fields) throw new Error('Subscription nie gevind: ' + subscriptionId)
  const subField = data.fields?.subscription?.mapValue?.fields
  if (!subField?.endpoint?.stringValue) throw new Error('Ongeldige subscription data')
  return {
    endpoint: subField.endpoint.stringValue,
    keys: {
      p256dh: subField.keys?.mapValue?.fields?.p256dh?.stringValue,
      auth:   subField.keys?.mapValue?.fields?.auth?.stringValue,
    }
  }
}

async function sendWebPush(subscriptionId) {
  const accessToken = await getAccessToken()
  const subscription = await getWebPushSubscription(subscriptionId, accessToken)
  await webpush.sendNotification(
    subscription,
    JSON.stringify({
      source: 'webpush',
      title:  '🌅 Daaglikse Hoop',
      body:   'Toets-kennisgewinig — dit werk!',
      url:    'https://daaglikse-hoop.vercel.app/'
    })
  )
  return { ok: true, endpoint: subscription.endpoint.slice(0, 50) + '...' }
}

module.exports = async function handler(req, res) {
  // GET: ?token=XXX&pin=2025  or  ?subscriptionId=XXX&pin=2025
  if (req.method === 'GET') {
    const { token, subscriptionId, pin } = req.query || {}
    if (pin !== ADMIN_PIN) return res.status(401).send('Unauthorized')
    try {
      if (subscriptionId) {
        const result = await sendWebPush(subscriptionId)
        return res.status(200).send(`<html><body style="font-family:sans-serif;padding:24px;background:#111;color:#fff">
          <h2>✅ Samsung Web Push gestuur!</h2>
          <p>Kyk jou Samsung Internet kennisgewings.</p>
          <pre style="background:#222;padding:12px;border-radius:6px">${JSON.stringify(result, null, 2)}</pre>
        </body></html>`)
      }
      if (!token) return res.status(400).send('No token or subscriptionId')
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

  // POST: { token, pin }  or  { subscriptionId, pin }
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')
  const { token, subscriptionId, pin } = req.body || {}
  if (pin !== ADMIN_PIN) return res.status(401).send('Unauthorized')
  try {
    if (subscriptionId) {
      const result = await sendWebPush(subscriptionId)
      return res.status(200).json({ ok: true, webpush: result })
    }
    if (!token) return res.status(400).json({ error: 'No token or subscriptionId' })
    const fcm = await sendFcm(token)
    return res.status(200).json({ ok: true, fcm })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
