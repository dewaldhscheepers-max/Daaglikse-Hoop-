module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  const data = req.body
  if (!data || data.payment_status !== 'COMPLETE') return res.status(200).send('OK')

  const email   = data.custom_str1
  const bookIds = (data.custom_str2 || '').split(',').filter(Boolean)
  if (!email || bookIds.length === 0) return res.status(200).send('OK')

  const projectId = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'

  // Fetch book data from Firestore REST API (no admin SDK needed)
  const bookDocs = await Promise.all(bookIds.map(async id => {
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/books/${id}`
      const r   = await fetch(url)
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

  const pdfLinksHtml = booksWithPdf.map(b => `
    <div style="margin:16px 0;padding:16px;background:#f8f5ff;border-radius:10px;border-left:4px solid #5C4E8E;">
      <p style="margin:0 0 10px;font-weight:700;color:#2d2d2d;font-size:16px;">${b.title}</p>
      <a href="${b.pdfUrl}" style="display:inline-block;padding:11px 22px;background:#5C4E8E;color:white;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">📥 Aflaai PDF</a>
    </div>
  `).join('')

  const noPdfHtml = booksNoPdf.length ? `
    <p style="color:#888;font-size:13px;margin-top:8px;">
      Ons stuur die volgende binnekort: ${booksNoPdf.map(b => `<strong>${b.title}</strong>`).join(', ')}
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
          Vrae? Kontak ons by <a href="mailto:info@dewaldscheepers.com" style="color:#5C4E8E;">info@dewaldscheepers.com</a>
        </p>
      </div>
    </div>
  `

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({
        from:     'Daaglikse Hoop <onboarding@resend.dev>',
        to:       email,
        reply_to: 'info@dewaldscheepers.com',
        subject:  `Jou e-boek${booksWithPdf.length > 1 ? 'e' : ''} van Daaglikse Hoop 📚`,
        html
      })
    })
    if (!r.ok) console.error('Resend error:', await r.text())
    else console.log('Email sent to', email, 'for books:', bookIds.join(', '))
  } catch (e) {
    console.error('Email failed:', e)
  }

  res.status(200).send('OK')
}
