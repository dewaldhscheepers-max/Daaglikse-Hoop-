const crypto = require('crypto')

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'

// ── Get OAuth2 access token using service account ──────────────────────────
async function getAccessToken() {
  const now     = Math.floor(Date.now() / 1000)
  const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const claim   = Buffer.from(JSON.stringify({
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
  if (!data.access_token) throw new Error('No access token: ' + JSON.stringify(data))
  return data.access_token
}

// ── Fetch today's note title from Firestore ────────────────────────────────
async function getTodayTitle() {
  try {
    const url  = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/notes?orderBy=publishedAt%20desc&pageSize=1`
    const r    = await fetch(url)
    const data = await r.json()
    const doc  = data.documents?.[0]
    return doc?.fields?.title?.stringValue || 'Daaglikse Hoop'
  } catch { return 'Daaglikse Hoop' }
}

// ── Fetch all FCM tokens from Firestore ────────────────────────────────────
async function getTokens(accessToken) {
  const tokens = []
  let pageToken = null
  do {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/fcm_tokens?pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`
    const r   = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    const data = await r.json()
    ;(data.documents || []).forEach(d => {
      const t = d.fields?.token?.stringValue
      if (t) tokens.push(t)
    })
    pageToken = data.nextPageToken || null
  } while (pageToken)
  return tokens
}

// ── Send one FCM message ───────────────────────────────────────────────────
async function sendOne(token, title, body, accessToken) {
  const r = await fetch(`https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      message: {
        token,
        notification: { title, body },
        android: {
          notification: {
            sound:        null,
            default_sound: false,
            notification_priority: 'PRIORITY_DEFAULT',
          },
        },
        apns: {
          payload: { aps: { sound: '' } },
        },
        webpush: {
          notification: { silent: true, vibrate: [120] },
        },
      },
    }),
  })
  return r.ok
}

// ── Handler ────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  // Secure the endpoint with a secret
  const secret = process.env.CRON_SECRET
  const auth   = req.headers.authorization || ''
  const query  = req.query?.secret || ''
  if (secret && auth !== `Bearer ${secret}` && query !== secret) {
    return res.status(401).send('Unauthorized')
  }

  if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.error('send-notifications: missing Firebase service account env vars')
    return res.status(500).send('Missing env vars')
  }

  try {
    const accessToken = await getAccessToken()
    const [title, tokens] = await Promise.all([
      getTodayTitle(),
      getTokens(accessToken),
    ])

    if (tokens.length === 0) {
      console.log('send-notifications: no tokens found')
      return res.status(200).send('No tokens')
    }

    const notifTitle = '🌅 Daaglikse Hoop'
    const notifBody  = title

    let sent = 0
    // Send in batches to avoid timeouts
    for (const token of tokens) {
      const ok = await sendOne(token, notifTitle, notifBody, accessToken)
      if (ok) sent++
    }

    console.log(`send-notifications: sent ${sent}/${tokens.length}`)
    return res.status(200).json({ sent, total: tokens.length })
  } catch (e) {
    console.error('send-notifications error', e)
    return res.status(500).send('Error: ' + e.message)
  }
}
