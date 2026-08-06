const crypto  = require('crypto')
const webpush = require('web-push')

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'

// ── VAPID mag NIE die hele funksie doodmaak nie ────────────────────────────
//
// Dit was 'n kaal `webpush.setVapidDetails(...)` op module-vlak met
// `process.env.VAPID_PRIVATE_KEY || ''` daarin. `web-push` GOOI as die
// sleutel leeg is — en dit gebeur by INVOER, voordat enige versoek eens by
// die handler kom.
//
// Die gevolg: as VAPID_PRIVATE_KEY nie op Vercel opgestel is nie, val die
// hele eindpunt om met 'n 500 en NIEMAND kry 'n kennisgewing nie. Nie een.
// Die admin wys 'n netwerkfout sonder om te sê hoekom.
//
// En dit is 'n onnodige koppeling: FCM — waarmee Android en Chrome se
// kennisgewings gaan — het glad nie VAPID nodig nie. Net egte nie-Google
// eindpunte (Firefox) het dit nodig. 'n Ontbrekende sleutel behoort dus te
// beteken "Firefox kry niks", nie "niemand kry iets nie".
let vapidGereed = false
try {
  const geheim = process.env.VAPID_PRIVATE_KEY || ''
  if (geheim) {
    webpush.setVapidDetails(
      'mailto:dewald.h.scheepers@gmail.com',
      process.env.VAPID_PUBLIC_KEY  || 'BAnuOtTx2mu8dUar_e7CO-6a4edbIue7Qi2SMCav-ilvxJeh-W2uH4p93LCHNt4P_9A2uj3HyUoOfjulI2OmN5o',
      geheim
    )
    vapidGereed = true
  } else {
    console.warn('[kennisgewings] VAPID_PRIVATE_KEY ontbreek — FCM werk, egte web-push nie')
  }
} catch (e) {
  console.warn('[kennisgewings] VAPID kon nie opgestel word nie:', e.message)
}

// ── OAuth2 access token ────────────────────────────────────────────────────
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
  const sig  = sign.sign(privateKey, 'base64url')
  const jwt  = `${header}.${claim}.${sig}`
  const r    = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  })
  const data = await r.json()
  if (!data.access_token) throw new Error('No access token: ' + JSON.stringify(data))
  return data.access_token
}

// ── Today's note title ─────────────────────────────────────────────────────
async function getTodayTitle() {
  try {
    const url  = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/notes?orderBy=publishedAt%20desc&pageSize=1`
    const r    = await fetch(url)
    const data = await r.json()
    const doc  = data.documents?.[0]
    return doc?.fields?.title?.stringValue || 'Daaglikse Hoop'
  } catch { return 'Daaglikse Hoop' }
}

// ── Fetch FCM tokens ───────────────────────────────────────────────────────
async function getFcmTokens(accessToken) {
  const tokens = []
  let pageToken = null
  do {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/fcm_tokens?pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`
    const r   = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } })
    const data = await r.json()
    ;(data.documents || []).forEach(d => {
      const t = d.fields?.token?.stringValue
      if (t) tokens.push(t)
    })
    pageToken = data.nextPageToken || null
  } while (pageToken)
  return tokens
}

// ── Fetch Samsung web-push subscriptions ──────────────────────────────────
async function getWebPushSubscriptions(accessToken) {
  const subs = []
  let pageToken = null
  do {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/webPushSubscriptions?pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`
    const r   = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } })
    const data = await r.json()
    ;(data.documents || []).forEach(d => {
      const subField = d.fields?.subscription?.mapValue?.fields
      if (subField?.endpoint?.stringValue) {
        subs.push({
          endpoint: subField.endpoint.stringValue,
          keys: {
            p256dh: subField.keys?.mapValue?.fields?.p256dh?.stringValue,
            auth:   subField.keys?.mapValue?.fields?.auth?.stringValue,
          }
        })
      }
    })
    pageToken = data.nextPageToken || null
  } while (pageToken)
  return subs
}

// ── Stuur baie, maar nie een vir een nie ───────────────────────────────────
//
// Dit was 'n `for`-lus met 'n `await` in: elke token wag vir die vorige een.
// Een FCM-oproep is 'n reis na Google en terug, sowat 'n vyfde van 'n
// sekonde. Met vyfhonderd tokens is dit sowat honderd sekondes — en die
// funksie het NIE 'n maxDuration gehad nie, dus het Vercel hom na tien
// sekondes doodgemaak. Die eerste handjievol mense het die kennisgewing
// gekry en die res het niks gekry nie, en die admin het 'n netwerkfout
// gewys sonder om te sê hoekom.
//
// Nou loop hulle vyf-en-twintig op 'n slag. Vyfhonderd tokens is twintig
// rondtes, sowat vyf sekondes. Vyf-en-twintig is met opset nie honderd nie:
// FCM knyp 'n kliënt wat te vinnig stoot, en dan begin regte foute inkom.
const GELYK = 25

async function inGroepe(items, doen) {
  let geslaag = 0
  let misluk = 0
  for (let i = 0; i < items.length; i += GELYK) {
    const groep = items.slice(i, i + GELYK)
    const uitslae = await Promise.all(groep.map(x => doen(x).catch(() => false)))
    for (const ok of uitslae) ok ? geslaag++ : misluk++
  }
  return { geslaag, misluk }
}

// ── Send one FCM message ───────────────────────────────────────────────────
async function sendFcm(token, title, body, accessToken, includeImage = true) {
  const r = await fetch(`https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        token,
        notification: { title, body },
        data: {
          ...(includeImage ? { image: 'https://dewaldscheepers.com/notification-image.jpg' } : {}),
          url: 'https://dewaldscheepers.com/',
        },
        webpush: {
          headers: { Urgency: 'high', TTL: '86400' },
        },
      },
    }),
  })
  if (!r.ok) {
    const err = await r.json().catch(() => ({}))
    /* UNREGISTERED en INVALID_ARGUMENT beteken die foon het die app
       verwyder of die token is verval. Dit is nie 'n fout wat oorgaan nie —
       daardie token gaan vir altyd misluk en elke stuur stadiger maak. Ons
       tel hulle apart sodat Dewald weet hoeveel van sy lys dood is. */
    const kode = err && err.error && err.error.status
    if (kode === 'UNREGISTERED' || kode === 'NOT_FOUND' || kode === 'INVALID_ARGUMENT') dood++
    console.warn('FCM failed:', token.slice(0, 20), JSON.stringify(err))
  }
  return r.ok
}

/* Hoeveel tokens dood is. Dit word per oproep teruggestel. */
let dood = 0

// ── Send one standard Web Push or FCM if endpoint is Google's ─────────────
async function sendWebPush(subscription, title, body, accessToken, includeImage = true) {
  // Samsung Internet on Android uses FCM as its push backend.
  // Extract the registration token and send via FCM v1 API.
  if (subscription.endpoint.startsWith('https://fcm.googleapis.com/')) {
    const token = subscription.endpoint.split('/').pop()
    return sendFcm(token, title, body, accessToken, includeImage)
  }
  // Genuine non-Google web push endpoint (e.g. Mozilla)
  if (!vapidGereed) return false
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ source: 'webpush', title, body, url: 'https://dewaldscheepers.com/', requireInteraction: true })
    )
    return true
  } catch (e) {
    console.warn('Web push failed:', e.message)
    return false
  }
}

// ── Handler ────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  const secret = process.env.CRON_SECRET
  const auth   = req.headers.authorization || ''
  const query  = req.query?.secret || ''
  if (secret && auth !== `Bearer ${secret}` && query !== secret) {
    return res.status(401).send('Unauthorized')
  }

  if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    return res.status(500).send('Missing Firebase env vars')
  }

  const body = req.body || {}
  const customTitle = body.title?.trim()
  const customBody  = body.body?.trim()
  const isCustom    = !!(customTitle || customBody)

  try {
    const accessToken = await getAccessToken()
    const [todayTitle, fcmTokens, webPushSubs] = await Promise.all([
      customTitle ? Promise.resolve(customTitle) : getTodayTitle(),
      getFcmTokens(accessToken),
      getWebPushSubscriptions(accessToken),
    ])

    const notifTitle   = todayTitle || 'Daaglikse Hoop'
    const notifBody    = customBody || 'Jou Daaglikse Hoop vir vandag is gereed. Tik om te luister.'
    const includeImage = !isCustom

    dood = 0

    const f = await inGroepe(fcmTokens,
      t => sendFcm(t, notifTitle, notifBody, accessToken, includeImage))
    const w = await inGroepe(webPushSubs,
      s => sendWebPush(s, notifTitle, notifBody, accessToken, includeImage))

    const result = {
      fcm:     { sent: f.geslaag, misluk: f.misluk, total: fcmTokens.length },
      webpush: { sent: w.geslaag, misluk: w.misluk, total: webPushSubs.length },
      /* Tokens van fone wat die app verwyder het. Hulle gaan nooit weer werk
         nie; dit is nie 'n fout wat oorgaan nie. */
      dood,
      /* Sonder VAPID gaan egte web-push (Firefox) nie deur nie. FCM werk
         steeds, en dit is die oorgrote meerderheid. */
      vapid: vapidGereed,
    }
    console.log('send-notifications:', JSON.stringify(result))
    return res.status(200).json(result)
  } catch (e) {
    console.error('send-notifications error', e)
    return res.status(500).send('Error: ' + e.message)
  }
}
