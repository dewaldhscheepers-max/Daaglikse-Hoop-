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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  // Vercel parses url-encoded bodies automatically, but guard against raw string
  let data = req.body
  if (typeof data === 'string') {
    data = Object.fromEntries(new URLSearchParams(data))
  }

  if (!data || data.payment_status !== 'COMPLETE') return res.status(200).send('OK')

  const email   = data.custom_str1
  const bookIds = (data.custom_str2 || '').split(',').filter(Boolean).filter(id => id !== 'skenking')
  if (!email || bookIds.length === 0) return res.status(200).send('OK')

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

  res.status(200).send('OK')
}
