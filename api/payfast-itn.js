const crypto = require('crypto')

// ── Get Firebase service-account access token (same pattern as send-notifications) ──
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
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  })
  const data = await r.json()
  if (!data.access_token) throw new Error('No access token: ' + JSON.stringify(data))
  return data.access_token
}

// ── Write a document to Firestore via REST ──
async function fsWrite(projectId, token, path, fields) {
  try {
    await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`,
      {
        method:  'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ fields }),
      }
    )
  } catch {}
}

// ── Log subscription ITN to Firestore ─────────────────────────────────────
async function handleSubscriptionItn(data, projectId) {
  let token = null
  try { token = await getAccessToken() } catch (e) { console.error('Sub auth failed:', e.message) }

  const docId = `${Date.now()}_${(data.pf_payment_id || 'unknown').replace(/\W/g, '')}`
  const fields = {
    pf_payment_id:  { stringValue: data.pf_payment_id  || '' },
    payment_status: { stringValue: data.payment_status  || '' },
    amount_gross:   { stringValue: data.amount_gross    || '' },
    amount_fee:     { stringValue: data.amount_fee      || '' },
    amount_net:     { stringValue: data.amount_net      || '' },
    name_first:     { stringValue: data.name_first      || '' },
    name_last:      { stringValue: data.name_last       || '' },
    email_address:  { stringValue: data.email_address   || '' },
    item_name:      { stringValue: data.item_name       || '' },
    token:          { stringValue: data.token           || '' },
    billing_date:   { stringValue: data.billing_date    || '' },
    success:        { booleanValue: data.payment_status === 'COMPLETE' },
    timestamp:      { timestampValue: new Date().toISOString() },
  }

  if (token) {
    await fsWrite(projectId, token, `payfast_itn/${docId}`, fields)
    console.log('payfast-itn sub logged:', data.pf_payment_id, data.payment_status, data.token)
    // Save subscriber email to emailList
    const subEmail = (data.email_address || '').toLowerCase().trim()
    if (subEmail) {
      const emailId = Buffer.from(subEmail).toString('base64').replace(/[^a-zA-Z0-9]/g, '_')
      fsWrite(projectId, token, `emailList/${emailId}`, {
        email:   { stringValue: subEmail },
        source:  { stringValue: 'subscription' },
        addedAt: { timestampValue: new Date().toISOString() },
      }).catch(() => {})
    }
    // Send thank you email for new successful subscriptions
    if (data.payment_status === 'COMPLETE' && subEmail) {
      const welcomeHtml = `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#2d2d2d;">
          <div style="background:#5C4E8E;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;font-size:28px;">Daaglikse Hoop</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">met Dewald Scheepers</p>
          </div>
          <div style="padding:32px 24px;background:white;border-radius:0 0 12px 12px;border:1px solid #e8e4f0;">
            <p style="font-size:17px;line-height:1.8;margin:0 0 16px;">Goeiedag,</p>
            <p style="font-size:16px;line-height:1.8;margin:0 0 14px;">Dankie dat jy 'n Maandelikse Hoop-Vennoot geword het! Baie baie dankie vir die ondersteuning.</p>
            <p style="font-size:16px;line-height:1.8;margin:0 0 24px;">Ek waardeer dit regtig uit my hart uit. Jou maandelikse bydrae help ons om aan te hou om hoop, gebed en God se Woord by mense uit te kry wat dit elke dag nodig het.</p>
            <p style="font-size:16px;line-height:1.8;margin:0 0 28px;">Mag die Here u ryklik seën. 🙏🏻</p>
            <hr style="border:none;border-top:1px solid #e8e4f0;margin:0 0 24px;">
            <p style="margin:0;font-size:15px;line-height:1.6;color:#2d2d2d;">Seënwense</p>
            <p style="margin:4px 0 24px;font-size:15px;font-weight:700;color:#2d2d2d;">Dewald Scheepers</p>
            <p style="color:#aaa;font-size:12px;line-height:1.6;margin:0;">
              Vrae? Kontak ons by
              <a href="mailto:info@dewaldscheepers.com" style="color:#5C4E8E;">info@dewaldscheepers.com</a>
            </p>
          </div>
        </div>
      `
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from:     'Dewald Scheepers <noreply@dewaldscheepers.com>',
            to:       subEmail,
            reply_to: 'info@dewaldscheepers.com',
            subject:  "Dankie dat jy 'n Hoop-Vennoot geword het 🙏",
            html:     welcomeHtml,
          }),
        })
      } catch (e) {
        console.error('Sub thank-you email failed:', e.message)
      }
    }
  } else {
    console.log('payfast-itn sub (no auth):', JSON.stringify(data))
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  // Vercel parses url-encoded bodies automatically, but guard against raw string
  let data = req.body
  if (typeof data === 'string') {
    data = Object.fromEntries(new URLSearchParams(data))
  }

  // Respond 200 immediately so PayFast doesn't time out waiting for us
  res.status(200).send('OK')

  if (!data) return

  // ── Subscription ITN (has a recurring token, no bookIds) ──────────────────
  if (data.token) {
    await handleSubscriptionItn(data, process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop')
    return
  }

  if (data.payment_status !== 'COMPLETE') return

  const email   = data.custom_str1
  const bookIds = (data.custom_str2 || '').split(',').filter(Boolean).filter(id => id !== 'skenking')

  // Save donation email even if no bookIds (once-off donations use id 'skenking')
  if (email && bookIds.length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
    let token = null
    try { token = await getAccessToken() } catch {}
    if (token) {
      const emailId = Buffer.from(email.toLowerCase()).toString('base64').replace(/[^a-zA-Z0-9]/g, '_')
      fsWrite(projectId, token, `emailList/${emailId}`, {
        email:   { stringValue: email.toLowerCase() },
        source:  { stringValue: 'donation' },
        addedAt: { timestampValue: new Date().toISOString() },
      }).catch(() => {})
    }
    // Send thank-you email for once-off donation
    const donationHtml = `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#2d2d2d;">
        <div style="background:#5C4E8E;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:28px;">Daaglikse Hoop</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">met Dewald Scheepers</p>
        </div>
        <div style="padding:32px 24px;background:white;border-radius:0 0 12px 12px;border:1px solid #e8e4f0;">
          <p style="font-size:17px;line-height:1.8;margin:0 0 16px;">Goeiedag,</p>
          <p style="font-size:16px;line-height:1.8;margin:0 0 14px;">Baie baie dankie vir die ondersteuning. Ek waardeer dit regtig uit my hart uit.</p>
          <p style="font-size:16px;line-height:1.8;margin:0 0 24px;">Jou ondersteuning help ons om aan te hou om hoop, gebed en God se Woord by mense uit te kry.</p>
          <p style="font-size:16px;line-height:1.8;margin:0 0 28px;">Mag die Here u ryklik seën. 🙏🏻</p>
          <hr style="border:none;border-top:1px solid #e8e4f0;margin:0 0 24px;">
          <p style="margin:0;font-size:15px;line-height:1.6;color:#2d2d2d;">Seënwense</p>
          <p style="margin:4px 0 24px;font-size:15px;font-weight:700;color:#2d2d2d;">Dewald Scheepers</p>
          <p style="color:#aaa;font-size:12px;line-height:1.6;margin:0;">
            Vrae? Kontak ons by
            <a href="mailto:info@dewaldscheepers.com" style="color:#5C4E8E;">info@dewaldscheepers.com</a>
          </p>
        </div>
      </div>
    `
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:     'Dewald Scheepers <noreply@dewaldscheepers.com>',
          to:       email.toLowerCase(),
          reply_to: 'info@dewaldscheepers.com',
          subject:  'Dankie vir jou ondersteuning 🙏',
          html:     donationHtml,
        }),
      })
    } catch (e) {
      console.error('Donation thank-you email failed:', e.message)
    }
    return
  }

  if (!email || bookIds.length === 0) return

  const projectId = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'

  // Auth token for Firestore reads + purchase logging
  let token = null
  try { token = await getAccessToken() } catch (e) { console.error('Auth failed:', e.message) }

  // ── Fetch book data from Firestore ──
  const bookDocs = await Promise.all(bookIds.map(async id => {
    try {
      const url     = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/books/${id}`
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const r       = await fetch(url, { headers })
      if (!r.ok) return { id, pdfUrl: null, title: id }
      const doc = await r.json()
      const f   = doc.fields || {}
      return {
        id,
        title:  f.title?.stringValue  || id,
        pdfUrl: f.pdfUrl?.stringValue || null,
      }
    } catch { return { id, pdfUrl: null, title: id } }
  }))

  const booksWithPdf = bookDocs.filter(b => b.pdfUrl)
  const booksNoPdf   = bookDocs.filter(b => !b.pdfUrl)
  const titles       = bookDocs.map(b => b.title).join(', ')

  // ── Save buyer email to emailList ──
  if (token && email) {
    const emailId = Buffer.from(email.toLowerCase()).toString('base64').replace(/[^a-zA-Z0-9]/g, '_')
    fsWrite(projectId, token, `emailList/${emailId}`, {
      email:   { stringValue: email.toLowerCase() },
      source:  { stringValue: 'purchase' },
      addedAt: { timestampValue: new Date().toISOString() },
    }).catch(() => {})
  }

  // ── Log purchase to Firestore so admin can see it regardless of email outcome ──
  const purchaseId = `${Date.now()}`
  if (token) {
    await fsWrite(projectId, token, `purchases/${purchaseId}`, {
      email:      { stringValue: email },
      bookIds:    { stringValue: bookIds.join(',') },
      bookTitles: { stringValue: titles },
      pdfCount:   { integerValue: booksWithPdf.length },
      paymentId:  { stringValue: data.pf_payment_id || '' },
      amount:     { stringValue: data.amount_gross  || '' },
      timestamp:  { timestampValue: new Date().toISOString() },
      emailSent:  { booleanValue: false },
    })
  }

  // ── Build email HTML ──
  const pdfLinksHtml = booksWithPdf.map(b => `
    <div style="margin:16px 0;padding:16px;background:#f8f5ff;border-radius:10px;border-left:4px solid #5C4E8E;">
      <p style="margin:0 0 10px;font-weight:700;color:#2d2d2d;font-size:16px;">${b.title}</p>
      <a href="${b.pdfUrl}" style="display:inline-block;padding:11px 22px;background:#5C4E8E;color:white;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">
        📥 Aflaai PDF
      </a>
    </div>
  `).join('')

  const noPdfHtml = booksNoPdf.length ? `
    <p style="color:#888;font-size:13px;margin-top:16px;">
      Ons stuur die volgende binnekort per e-pos: ${booksNoPdf.map(b => `<strong>${b.title}</strong>`).join(', ')}
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
        <p style="color:#555;line-height:1.6;margin:0 0 6px;">
          Jy het die volgende gekoop:
        </p>
        <p style="color:#2d2d2d;font-weight:700;line-height:1.6;margin:0 0 20px;">
          ${titles}
        </p>
        <p style="color:#666;line-height:1.7;margin:0 0 20px;">
          Jou betaling is suksesvol ontvang. Klik hieronder om jou e-boek${booksWithPdf.length !== 1 ? 'e' : ''} af te laai:
        </p>
        ${pdfLinksHtml || '<p style="color:#888;font-size:14px;">Jou aflaai-skakel word binnekort gestuur.</p>'}
        ${noPdfHtml}
        <hr style="border:none;border-top:1px solid #e8e4f0;margin:28px 0 20px;">
        <p style="color:#888;font-size:13px;line-height:1.6;">
          Probleme? Kontak ons by
          <a href="mailto:info@dewaldscheepers.com" style="color:#5C4E8E;">info@dewaldscheepers.com</a>
        </p>
      </div>
    </div>
  `

  // ── Send email via Resend ──
  let emailSent    = false
  let resendResult = ''

  try {
    const r    = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:     'Daaglikse Hoop <noreply@dewaldscheepers.com>',
        to:       email,
        reply_to: 'info@dewaldscheepers.com',
        subject:  `Jou e-boek${booksWithPdf.length !== 1 ? 'e' : ''}: ${titles}`,
        html,
      }),
    })
    resendResult = await r.text()
    if (r.ok) {
      emailSent = true
      console.log('Email sent OK to', email, '| Books:', titles)
    } else {
      console.error('Resend rejected:', resendResult)
    }
  } catch (e) {
    resendResult = e.message
    console.error('Email exception:', e.message)
  }

  // ── Update purchase log with email outcome ──
  if (token) {
    await fsWrite(projectId, token, `purchases/${purchaseId}`, {
      emailSent:      { booleanValue: emailSent },
      resendResponse: { stringValue: resendResult.slice(0, 500) },
    })
  }
}
