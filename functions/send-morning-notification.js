const { initializeApp }  = require('firebase-admin/app')
const { getFirestore }   = require('firebase-admin/firestore')
const { getMessaging }   = require('firebase-admin/messaging')

// Credentials come from GOOGLE_APPLICATION_CREDENTIALS set by the GitHub Actions auth step
initializeApp()

async function main() {
  const db        = getFirestore()
  const messaging = getMessaging()

  const today = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Africa/Johannesburg',
  })
  console.log('Date:', today)

  const devotionalDoc = await db.collection('devotionals').doc(today).get()
  if (!devotionalDoc.exists) {
    console.log('No devotional found for', today, '— skipping.')
    return
  }

  const { title = 'Daaglikse Hoop', scripture = '' } = devotionalDoc.data()
  const body = scripture || 'Jou oggend oordenking is gereed. Kom luister.'

  const tokensSnap = await db.collection('fcm_tokens').get()
  if (tokensSnap.empty) {
    console.log('No subscribers yet.')
    return
  }

  const tokens = tokensSnap.docs.map(d => d.data().token).filter(Boolean)
  console.log(`Sending "${title}" to ${tokens.length} subscriber(s)`)

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
        notification: { icon: 'ic_notification', color: '#5C4E8E' },
      },
    })

    console.log(`Sent: ${response.successCount}, Failed: ${response.failureCount}`)

    // Remove stale tokens automatically
    const stale = response.responses
      .map((r, idx) => {
        const code = r.error?.code
        return (code === 'messaging/invalid-registration-token' ||
                code === 'messaging/registration-token-not-registered')
          ? chunk[idx] : null
      })
      .filter(Boolean)

    if (stale.length) {
      await Promise.all(stale.map(t => db.collection('fcm_tokens').doc(t).delete()))
      console.log(`Removed ${stale.length} stale token(s)`)
    }
  }
}

main().catch(err => { console.error(err); process.exit(1) })
