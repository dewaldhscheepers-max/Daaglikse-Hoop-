const { onSchedule } = require('firebase-functions/v2/scheduler')
const { onRequest }  = require('firebase-functions/v2/https')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore }  = require('firebase-admin/firestore')
const { getMessaging }  = require('firebase-admin/messaging')

initializeApp()

// ─── Runs every morning at 06:00 SAST ───────────────────────────────────────
exports.sendMorningDevotional = onSchedule(
  { schedule: '0 6 * * *', timeZone: 'Africa/Johannesburg' },
  async () => {
    const db        = getFirestore()
    const messaging = getMessaging()

    // Today's document key  e.g. "2026-05-28"
    const today = new Date().toLocaleDateString('en-CA', {
      timeZone: 'Africa/Johannesburg',
    })

    const devotionalDoc = await db.collection('devotionals').doc(today).get()
    if (!devotionalDoc.exists) {
      console.log('No devotional scheduled for', today)
      return
    }

    const { title = 'Daaglikse Hoop', scripture = '' } = devotionalDoc.data()
    const body = scripture || 'Jou oggend oordenking is gereed. Kom luister.'

    // Fetch all subscriber tokens
    const tokensSnap = await db.collection('fcm_tokens').get()
    if (tokensSnap.empty) {
      console.log('No subscribers — nothing to send.')
      return
    }

    const tokens = tokensSnap.docs.map(d => d.data().token).filter(Boolean)
    console.log(`Sending "${title}" to ${tokens.length} subscriber(s)`)

    // FCM allows max 500 tokens per multicast call
    const BATCH = 500
    for (let i = 0; i < tokens.length; i += BATCH) {
      const chunk = tokens.slice(i, i + BATCH)

      const response = await messaging.sendEachForMulticast({
        tokens: chunk,
        notification: { title, body },
        webpush: {
          notification: {
            icon:  '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
          },
          fcmOptions: { link: '/' },
        },
        android: {
          notification: {
            icon:  'ic_notification',
            color: '#5C4E8E',
          },
        },
      })

      console.log(`Batch ${i / BATCH + 1}: ${response.successCount} sent, ${response.failureCount} failed`)

      // Clean up expired / invalid tokens so the list stays tidy
      const stale = []
      response.responses.forEach((r, idx) => {
        const code = r.error?.code
        if (
          code === 'messaging/invalid-registration-token' ||
          code === 'messaging/registration-token-not-registered'
        ) {
          stale.push(chunk[idx])
        }
      })

      if (stale.length) {
        await Promise.all(stale.map(t => db.collection('fcm_tokens').doc(t).delete()))
        console.log(`Removed ${stale.length} stale token(s)`)
      }
    }
  }
)

// ─── Manual trigger (for testing from the Firebase Console) ─────────────────
// POST https://<region>-daaglikse-hoop.cloudfunctions.net/testNotification
// Body: { "secret": "<ADMIN_SECRET>" }
exports.testNotification = onRequest(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')
  if (req.body?.secret !== process.env.ADMIN_SECRET) {
    return res.status(401).send('Unauthorized')
  }

  const db        = getFirestore()
  const messaging = getMessaging()

  const tokensSnap = await db.collection('fcm_tokens').get()
  if (tokensSnap.empty) return res.status(200).send('No subscribers.')

  const tokens = tokensSnap.docs.map(d => d.data().token).filter(Boolean)

  await messaging.sendEachForMulticast({
    tokens,
    notification: {
      title: 'Daaglikse Hoop — Toets',
      body:  'As jy dit sien, werk die kennisgewings! 🙏',
    },
    webpush: {
      notification: { icon: '/icons/icon-192.png' },
      fcmOptions:   { link: '/' },
    },
  })

  res.status(200).send(`Test notification sent to ${tokens.length} device(s).`)
})
