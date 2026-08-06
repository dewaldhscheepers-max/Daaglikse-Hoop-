/* ────────────────────────────────────────────────────────────
   Stuur EEN kennisgewing, aan een toestel, om te sien of die pad werk.

   Dit is die knoppie wat 'n mens druk voordat hy ses duisend mense iets
   stuur. Dus moet dit self nooit stukkend wees nie — en dit was, op twee
   maniere.

   ── 1. Dit het by INVOER omgeval ──

   Hier het 'n kaal `webpush.setVapidDetails(..., process.env.VAPID_PRIVATE_KEY
   || '')` op module-vlak gestaan. `web-push` GOOI op 'n leë sleutel, en dit
   gebeur voordat enige versoek by die handler kom. Ontbreek daardie
   veranderlike op Vercel, gee die hele eindpunt 'n 500 en die admin wys
   "Misluk" sonder om te sê hoekom — terwyl FCM, waarmee elke Android- en
   Chrome-foon werk, glad nie VAPID nodig het nie.

   Presies dieselfde fout as in `send-notifications.js`. Nou lui dit lui, en
   'n ontbrekende sleutel beteken net "Firefox kry niks".

   ── 2. Die PIN was 2025, in die openbare bondel ──

   `ADMIN_PIN = '2025'`, en die app het `?pin=2025` saamgestuur. Dieselfde
   soort fout as die ou `?secret=` op die stuur-aan-almal.

   Nou:
     · POST gaan deur `magAdminDing` — die admin se wagwoord in 'n kopstuk.
     · GET dra 'n GETEKENDE skakel, want 'n mens moet die toets kan doen
       terwyl die app TOE is, en 'n adresbalk kan nie 'n kopstuk stuur nie.
       Die handtekening geld vir vandag en gister, is aan die token vas, en
       word met CRON_SECRET geteken — 'n mens kan hom nie self uitdink nie.
   ──────────────────────────────────────────────────────────── */

const crypto  = require('crypto')
const webpush = require('web-push')
const { magAdminDing, tekenSleutel } = require('./_geheim.js')

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'

let vapidGereed = false
try {
  const geheim = process.env.VAPID_PRIVATE_KEY || ''
  if (geheim) {
    webpush.setVapidDetails(
      'mailto:dewald.h.scheepers@gmail.com',
      process.env.VAPID_PUBLIC_KEY || 'BAnuOtTx2mu8dUar_e7CO-6a4edbIue7Qi2SMCav-ilvxJeh-W2uH4p93LCHNt4P_9A2uj3HyUoOfjulI2OmN5o',
      geheim
    )
    vapidGereed = true
  }
} catch (e) {
  console.warn('[toets-kennisgewing] VAPID kon nie opgestel word nie:', e.message)
}

/* ── Die geteken skakel ──
   Aan die toestel vas en aan die dag vas, sodat 'n ou skakel wat in iemand
   se blaaiergeskiedenis bly le, more niks meer beteken nie. */
function dagString(offset = 0) {
  return new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10)
}

function tekenVir(wat, dag) {
  return crypto.createHmac('sha256', tekenSleutel())
    .update('toets:' + wat + ':' + dag).digest('hex').slice(0, 32)
}

function geldig(wat, gegee) {
  if (!wat || !gegee) return false
  for (const dag of [dagString(0), dagString(-1)]) {
    const reg = Buffer.from(tekenVir(wat, dag))
    const kry = Buffer.from(String(gegee))
    if (reg.length === kry.length && crypto.timingSafeEqual(reg, kry)) return true
  }
  return false
}

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
        notification: { title: 'Het jy 3 minute vir God?', body: 'Toets-kennisgewing — dit werk!' },
        data: {
          image: 'https://dewaldscheepers.com/notification-image.jpg',
          url:   'https://dewaldscheepers.com/',
        },
        webpush: {
          headers: { Urgency: 'high', TTL: '86400' },
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
  const accessToken  = await getAccessToken()
  const subscription = await getWebPushSubscription(subscriptionId, accessToken)

  // Samsung Internet on Android uses FCM as its push backend
  if (subscription.endpoint.startsWith('https://fcm.googleapis.com/')) {
    const token = subscription.endpoint.split('/').pop()
    const data  = await sendFcm(token)
    return { ok: true, via: 'fcm-from-samsung-endpoint', data }
  }

  if (!vapidGereed) {
    throw new Error('VAPID_PRIVATE_KEY ontbreek op Vercel — egte web-push (Firefox) kan nie stuur nie. FCM werk wel.')
  }

  await webpush.sendNotification(
    subscription,
    JSON.stringify({
      source:             'webpush',
      title:              'Het jy 3 minute vir God?',
      body:               'Toets-kennisgewing — dit werk!',
      url:                'https://dewaldscheepers.com/',
      requireInteraction: true,
    })
  )
  return { ok: true, endpoint: subscription.endpoint.slice(0, 50) + '...' }
}

module.exports = async function handler(req, res) {
  /* ── GET: die geteken skakel, vir 'n toets terwyl die app toe is ── */
  if (req.method === 'GET') {
    const { token, subscriptionId, s } = req.query || {}
    const wat = subscriptionId || token || ''
    if (!geldig(wat, s)) return res.status(401).send('Unauthorized')
    try {
      const result = subscriptionId ? await sendWebPush(subscriptionId) : await sendFcm(token)
      return res.status(200).send(`<html><body style="font-family:sans-serif;padding:24px">
        <h2>✅ Toets gestuur!</h2>
        <p>Kyk jou foon se kennisgewings.</p>
        <pre style="background:#eee;padding:12px;border-radius:6px;white-space:pre-wrap;word-break:break-all">${JSON.stringify(result, null, 2)}</pre>
      </body></html>`)
    } catch (e) {
      return res.status(500).send(`<html><body style="font-family:sans-serif;padding:24px">
        <h2>❌ Fout</h2><pre style="white-space:pre-wrap;word-break:break-all">${e.message}</pre>
      </body></html>`)
    }
  }

  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')
  if (!magAdminDing(req)) return res.status(401).json({ error: 'Unauthorized' })

  const { token, subscriptionId, maakSkakel } = req.body || {}

  /* Die admin kan nie self teken nie — die sleutel is nie in die blaaier nie,
     en dit is juis die punt. Hy vra hier vir 'n skakel. */
  if (maakSkakel) {
    const wat = subscriptionId || token
    if (!wat) return res.status(400).json({ error: 'No token or subscriptionId' })
    const veld = subscriptionId ? 'subscriptionId' : 'token'
    try {
      return res.status(200).json({
        ok: true,
        pad: `/api/test-notification?${veld}=${encodeURIComponent(wat)}&s=${tekenVir(wat, dagString(0))}`,
      })
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  try {
    if (subscriptionId) return res.status(200).json({ ok: true, webpush: await sendWebPush(subscriptionId) })
    if (!token) return res.status(400).json({ error: 'No token or subscriptionId' })
    return res.status(200).json({ ok: true, fcm: await sendFcm(token) })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
