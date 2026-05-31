const { onSchedule } = require('firebase-functions/v2/scheduler')
const { onRequest }  = require('firebase-functions/v2/https')
const functions      = require('firebase-functions')
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

// ─── PayFast ITN — receives payment confirmation, sends PDF email ────────────
exports.payfastItn = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  const data = req.body
  if (data.payment_status !== 'COMPLETE') return res.status(200).send('OK')

  const email   = data.custom_str1
  const bookIds = (data.custom_str2 || '').split(',').filter(Boolean)

  if (!email || bookIds.length === 0) return res.status(200).send('OK')

  const db       = getFirestore()
  const bookDocs = await Promise.all(bookIds.map(id => db.collection('books').doc(id).get()))

  const booksWithPdf = bookDocs.map(d => ({ id: d.id, ...d.data() })).filter(b => b.pdfUrl)
  const booksNoPdf   = bookDocs.map(d => ({ id: d.id, ...d.data() })).filter(b => !b.pdfUrl)

  const pdfLinksHtml = booksWithPdf.map(b => `
    <div style="margin:16px 0;padding:16px;background:#f8f5ff;border-radius:10px;border-left:4px solid #5C4E8E;">
      <p style="margin:0 0 10px;font-weight:700;color:#2d2d2d;font-size:16px;">${b.title || b.id}</p>
      <a href="${b.pdfUrl}" style="display:inline-block;padding:11px 22px;background:#5C4E8E;color:white;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">
        📥 Aflaai PDF
      </a>
    </div>
  `).join('')

  const noPdfHtml = booksNoPdf.length ? `
    <p style="color:#888;font-size:13px;margin-top:8px;">
      Ons stuur die volgende boeke${booksNoPdf.length > 1 ? 'e' : ''} binne 24 uur:
      ${booksNoPdf.map(b => `<strong>${b.title || b.id}</strong>`).join(', ')}
    </p>
  ` : ''

  const html = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#2d2d2d;">
      <div style="background:#5C4E8E;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:white;margin:0;font-size:28px;">Daaglikse Hoop</h1>
        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">met Dewald Scheepers</p>
      </div>
      <div style="padding:32px 24px;background:white;border-radius:0 0 12px 12px;border:1px solid #e8e4f0;">
        <p style="font-size:20px;font-weight:700;margin:0 0 8px;">Dankie vir jou aankoop! 🙏</p>
        <p style="color:#666;line-height:1.7;margin:0 0 20px;">
          Jou betaling is suksesvol ontvang. Hier is jou e-boek${booksWithPdf.length > 1 ? 'e' : ''} — klik om af te laai:
        </p>
        ${pdfLinksHtml}
        ${noPdfHtml}
        <hr style="border:none;border-top:1px solid #e8e4f0;margin:28px 0 20px;">
        <p style="color:#888;font-size:13px;line-height:1.6;">
          Hierdie is 'n outomatiese e-pos. Vir enige vrae, kontak ons by
          <a href="mailto:info@dewaldscheepers.com" style="color:#5C4E8E;">info@dewaldscheepers.com</a>
        </p>
      </div>
    </div>
  `

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from:     'Daaglikse Hoop <noreply@dewaldscheepers.com>',
        to:       email,
        reply_to: 'info@dewaldscheepers.com',
        subject:  `Jou e-boek${booksWithPdf.length > 1 ? 'e' : ''} van Daaglikse Hoop 📚`,
        html
      })
    })
    if (!r.ok) console.error('Resend error:', await r.text())
    else console.log('Email sent to', email, 'for books:', bookIds.join(', '))
  } catch (e) {
    console.error('Email send failed:', e)
  }

  res.status(200).send('OK')
})
