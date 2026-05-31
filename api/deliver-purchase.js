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
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  })
  const data = await r.json()
  if (!data.access_token) throw new Error('No access token')
  return data.access_token
}

async function fsGet(projectId, token, path) {
  const r = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!r.ok) return null
  return r.json()
}

async function fsWrite(projectId, token, path, fields) {
  await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    }
  )
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  const { email, bookIds } = req.body || {}
  if (!email || !Array.isArray(bookIds) || bookIds.length === 0) {
    return res.status(400).json({ error: 'Missing email or bookIds' })
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' })
  }

  // Filter out non-ebook IDs
  const ids = bookIds.filter(id => id && id !== 'skenking')
  if (ids.length === 0) return res.status(200).json({ ok: true, skipped: true })

  const projectId = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'

  let token = null
  try { token = await getAccessToken() } catch (e) {
    return res.status(500).json({ error: 'Auth failed: ' + e.message })
  }

  // Deduplication: check if already delivered in the last 2 hours
  const dedupKey = `deliveries/${Buffer.from(email + '|' + ids.sort().join(',')).toString('base64').slice(0, 40)}`
  try {
    const existing = await fsGet(projectId, token, dedupKey)
    if (existing?.fields?.deliveredAt?.timestampValue) {
      const deliveredAt = new Date(existing.fields.deliveredAt.timestampValue).getTime()
      if (Date.now() - deliveredAt < 2 * 60 * 60 * 1000) {
        return res.status(200).json({ ok: true, duplicate: true })
      }
    }
  } catch {}

  // Fetch book data
  const bookDocs = await Promise.all(ids.map(async id => {
    try {
      const doc = await fsGet(projectId, token, `books/${id}`)
      if (!doc?.fields) return { id, pdfUrl: null, title: id }
      return {
        id,
        title:  doc.fields.title?.stringValue  || id,
        pdfUrl: doc.fields.pdfUrl?.stringValue || null,
      }
    } catch { return { id, pdfUrl: null, title: id } }
  }))

  const booksWithPdf = bookDocs.filter(b => b.pdfUrl)
  if (booksWithPdf.length === 0) {
    return res.status(200).json({ ok: true, noPdf: true })
  }

  const titles = bookDocs.map(b => b.title).join(', ')

  const pdfLinksHtml = booksWithPdf.map(b => `
    <div style="margin:16px 0;padding:16px;background:#f8f5ff;border-radius:10px;border-left:4px solid #5C4E8E;">
      <p style="margin:0 0 10px;font-weight:700;color:#2d2d2d;font-size:16px;">${b.title}</p>
      <a href="${b.pdfUrl}" style="display:inline-block;padding:11px 22px;background:#5C4E8E;color:white;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">
        📥 Aflaai PDF
      </a>
    </div>
  `).join('')

  const html = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#2d2d2d;">
      <div style="background:#5C4E8E;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:white;margin:0;font-size:28px;">Daaglikse Hoop</h1>
        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">met Dewald Scheepers</p>
      </div>
      <div style="padding:32px 24px;background:white;border-radius:0 0 12px 12px;border:1px solid #e8e4f0;">
        <p style="font-size:20px;font-weight:700;margin:0 0 8px;">Dankie vir jou aankoop! 🙏</p>
        <p style="color:#555;line-height:1.6;margin:0 0 6px;">Jy het die volgende gekoop:</p>
        <p style="color:#2d2d2d;font-weight:700;line-height:1.6;margin:0 0 20px;">${titles}</p>
        <p style="color:#666;line-height:1.7;margin:0 0 20px;">
          Klik hieronder om jou e-boek${booksWithPdf.length !== 1 ? 'e' : ''} af te laai:
        </p>
        ${pdfLinksHtml}
        <hr style="border:none;border-top:1px solid #e8e4f0;margin:28px 0 20px;">
        <p style="color:#888;font-size:13px;line-height:1.6;">
          Probleme? Kontak ons by
          <a href="mailto:info@dewaldscheepers.com" style="color:#5C4E8E;">info@dewaldscheepers.com</a>
        </p>
      </div>
    </div>
  `

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:     'Daaglikse Hoop <noreply@dewaldscheepers.com>',
        to:       email,
        reply_to: 'info@dewaldscheepers.com',
        subject:  `Jou e-boek${booksWithPdf.length !== 1 ? 'e' : ''}: ${titles}`,
        html,
      }),
    })
    if (!r.ok) {
      const err = await r.text()
      return res.status(500).json({ error: 'Resend failed: ' + err })
    }
  } catch (e) {
    return res.status(500).json({ error: 'Email failed: ' + e.message })
  }

  // Log delivery for deduplication
  try {
    await fsWrite(projectId, token, dedupKey, {
      email:       { stringValue: email },
      bookIds:     { stringValue: ids.join(',') },
      deliveredAt: { timestampValue: new Date().toISOString() },
    })
  } catch {}

  return res.status(200).json({ ok: true })
}
