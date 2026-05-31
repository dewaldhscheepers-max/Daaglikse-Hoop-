module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')
  const { pin, email, bookIds } = req.body || {}
  if (pin !== '2025') return res.status(403).send('Forbidden')
  if (!email || !bookIds) return res.status(400).send('Missing email or bookIds')

  // Reuse the ITN handler logic with fake payment data
  const fakeItnBody = {
    payment_status: 'COMPLETE',
    custom_str1: email,
    custom_str2: Array.isArray(bookIds) ? bookIds.join(',') : bookIds,
    pf_payment_id: 'TEST_' + Date.now(),
    amount_gross: '0.00',
  }

  // Inline the ITN logic for testing
  const crypto = require('crypto')

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

  const projectId = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
  const bookIdList = fakeItnBody.custom_str2.split(',').filter(Boolean)

  const log = { email, bookIds: bookIdList, steps: [] }

  // Step 1: Auth
  let token = null
  try {
    token = await getAccessToken()
    log.steps.push('✅ Firebase auth OK')
  } catch (e) {
    log.steps.push('❌ Firebase auth FAIL: ' + e.message)
  }

  // Step 2: Fetch books
  const bookDocs = await Promise.all(bookIdList.map(async id => {
    try {
      const url     = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/books/${id}`
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const r       = await fetch(url, { headers })
      if (!r.ok) { log.steps.push(`❌ Book fetch ${id}: HTTP ${r.status}`); return { id, pdfUrl: null, title: id } }
      const doc = await r.json()
      const f   = doc.fields || {}
      const title  = f.title?.stringValue  || id
      const pdfUrl = f.pdfUrl?.stringValue || null
      log.steps.push(`✅ Book: "${title}" — PDF: ${pdfUrl ? 'YES' : 'NO'}`)
      return { id, title, pdfUrl }
    } catch (e) { log.steps.push(`❌ Book fetch ${id}: ${e.message}`); return { id, pdfUrl: null, title: id } }
  }))

  // Step 3: Send email
  const booksWithPdf = bookDocs.filter(b => b.pdfUrl)
  const titles = bookDocs.map(b => b.title).join(', ')

  const pdfLinksHtml = booksWithPdf.map(b => `
    <div style="margin:16px 0;padding:16px;background:#f8f5ff;border-radius:10px;border-left:4px solid #5C4E8E;">
      <p style="margin:0 0 10px;font-weight:700;color:#2d2d2d;">${b.title}</p>
      <a href="${b.pdfUrl}" style="display:inline-block;padding:11px 22px;background:#5C4E8E;color:white;text-decoration:none;border-radius:8px;font-weight:700;">📥 Aflaai PDF</a>
    </div>
  `).join('')

  const html = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;">
      <div style="background:#5C4E8E;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:white;margin:0;">Daaglikse Hoop</h1>
      </div>
      <div style="padding:32px 24px;background:white;border-radius:0 0 12px 12px;border:1px solid #e8e4f0;">
        <p style="font-size:20px;font-weight:700;">TOETS E-POS 🧪</p>
        <p><strong>${titles}</strong></p>
        ${pdfLinksHtml || '<p style="color:#888">Geen PDF gevind vir hierdie boeke nie.</p>'}
      </div>
    </div>
  `

  let resendResult = ''
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    'Daaglikse Hoop <onboarding@resend.dev>',
        to:      email,
        subject: `[TOETS] Jou e-boeke: ${titles}`,
        html,
      }),
    })
    resendResult = await r.text()
    log.steps.push(r.ok ? `✅ Resend OK: ${resendResult}` : `❌ Resend FAIL: ${resendResult}`)
  } catch (e) {
    log.steps.push('❌ Resend exception: ' + e.message)
  }

  res.status(200).json(log)
}
