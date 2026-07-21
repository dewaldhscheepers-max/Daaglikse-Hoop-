const crypto = require('crypto')

const BOOK_VALUES = {
  'bid-nou': 105, 'narsistiese-verhoudings': 105, 'wen-die-oorlog': 105,
  'die-duiwel-is-n-leuenaar': 100, 'wanneer-mense-jou-seermaak': 50,
  'toksies': 50, 'deursoek-my': 30, 'angs-detox': 30,
  'wanneer-angs-toeslaan': 30, 'dink-nuut-leef-nuut': 30,
  'verander-jou-hart': 30, 'as-alles-wegval': 30,
  '7-leuens': 50, 'bybel-hulpbron': 50, 'rustelose-gedagtes': 110,
}

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

async function fsIncrement(projectId, token, docPath, ...fieldIncrements) {
  await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        writes: [{
          transform: {
            document: `projects/${projectId}/databases/(default)/documents/${docPath}`,
            fieldTransforms: fieldIncrements.map(({ field, value }) => ({
              fieldPath: field,
              increment: { integerValue: String(value) },
            })),
          },
        }],
      }),
    }
  )
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { email, bookId, consent } = req.body || {}

  if (!email || !bookId) return res.status(400).json({ error: 'E-posadres en boek-ID is vereis' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Ongeldige e-posadres' })

  const projectId  = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
  const cleanEmail = email.toLowerCase().trim()

  let token
  try { token = await getAccessToken() } catch (e) {
    return res.status(500).json({ error: 'Auth failed' })
  }

  // Get book data from Firestore
  let bookTitle = bookId
  let pdfUrl    = null
  try {
    const bookDoc = await fsGet(projectId, token, `books/${bookId}`)
    if (bookDoc?.fields) {
      bookTitle = bookDoc.fields.title?.stringValue  || bookId
      pdfUrl    = bookDoc.fields.pdfUrl?.stringValue || null
    }
  } catch {}

  // Deduplication check
  const dedupId    = crypto.createHash('sha256').update(`${cleanEmail}:${bookId}`).digest('hex').slice(0, 40)
  let isDuplicate  = false
  try {
    const existing = await fsGet(projectId, token, `freeDownloads/${dedupId}`)
    if (existing?.fields?.downloadedAt) isDuplicate = true
  } catch {}

  if (!isDuplicate) {
    // Save email to emailList
    const emailId = Buffer.from(cleanEmail).toString('base64').replace(/[^a-zA-Z0-9]/g, '_')
    await fsWrite(projectId, token, `emailList/${emailId}`, {
      email:   { stringValue: cleanEmail },
      source:  { stringValue: 'free-ebook' },
      bookId:  { stringValue: bookId },
      consent: { booleanValue: !!consent },
      addedAt: { timestampValue: new Date().toISOString() },
    })

    // Increment ebooks_given counter
    const bookValue = BOOK_VALUES[bookId] ?? 50
    await fsIncrement(projectId, token, 'counters/ebooks_given',
      { field: 'count', value: 1 },
      { field: 'value', value: bookValue }
    )

    // Special campaign counter for rustelose-gedagtes
    if (bookId === 'rustelose-gedagtes') {
      await fsIncrement(projectId, token, 'counters/campaign_huise',
        { field: 'total', value: 1 }
      )
    }

    // Log download for deduplication
    await fsWrite(projectId, token, `freeDownloads/${dedupId}`, {
      email:        { stringValue: cleanEmail },
      bookId:       { stringValue: bookId },
      downloadedAt: { timestampValue: new Date().toISOString() },
    })
  }

  // Send delivery email via Resend (only if pdfUrl exists)
  if (pdfUrl) {
    const html = `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#2d2d2d;">
        <div style="background:#5C4E8E;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:28px;">Daaglikse Hoop</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">met Dewald Scheepers</p>
        </div>
        <div style="padding:32px 24px;background:white;border-radius:0 0 12px 12px;border:1px solid #e8e4f0;">
          <p style="font-size:20px;font-weight:700;margin:0 0 8px;">Jou gratis e-boek is hier! 🎁</p>
          <p style="color:#555;line-height:1.6;margin:0 0 6px;">Hierdie boek is gratis vir jou:</p>
          <p style="color:#2d2d2d;font-weight:700;line-height:1.6;margin:0 0 20px;">${bookTitle}</p>
          <p style="color:#666;line-height:1.7;margin:0 0 20px;">
            Klik hieronder om jou gratis e-boek af te laai:
          </p>
          <div style="margin:16px 0;padding:16px;background:#f8f5ff;border-radius:10px;border-left:4px solid #5C4E8E;">
            <p style="margin:0 0 10px;font-weight:700;color:#2d2d2d;font-size:16px;">${bookTitle}</p>
            <a href="${pdfUrl}" style="display:inline-block;padding:11px 22px;background:#5C4E8E;color:white;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">
              📥 Laai af
            </a>
          </div>
          <hr style="border:none;border-top:1px solid #e8e4f0;margin:28px 0 24px;">
          <p style="font-size:15px;font-weight:700;color:#2d2d2d;margin:0 0 18px;text-align:center;">Help sodat die volgende persoon ook gratis hoop kan ontvang:</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:0 4px 10px 0;" width="50%">
                <a href="https://www.dewaldscheepers.com/go" style="display:block;background:#5C4E8E;color:white;text-decoration:none;border-radius:10px;padding:13px 10px;font-size:13px;font-weight:700;text-align:center;font-family:Georgia,serif;">
                  💜 Maandelikse Vennoot
                </a>
              </td>
              <td style="padding:0 0 10px 4px;" width="50%">
                <a href="https://www.dewaldscheepers.com/go" style="display:block;background:white;color:#5C4E8E;text-decoration:none;border-radius:10px;padding:12px 10px;font-size:13px;font-weight:700;text-align:center;border:2px solid #5C4E8E;font-family:Georgia,serif;">
                  🙏 Eenmalige Bydrae
                </a>
              </td>
            </tr>
          </table>
          <hr style="border:none;border-top:1px solid #e8e4f0;margin:0 0 20px;">
          <p style="color:#888;font-size:13px;line-height:1.6;">
            Daaglikse Hoop &middot;
            <a href="mailto:info@dewaldscheepers.com" style="color:#5C4E8E;">info@dewaldscheepers.com</a><br>
            Jy ontvang hierdie e-pos omdat jy 'n gratis e-boek afgelaai het. Uitteken: stuur 'n e-pos na info@dewaldscheepers.com
          </p>
        </div>
      </div>
    `
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:     'Daaglikse Hoop <noreply@dewaldscheepers.com>',
          to:       cleanEmail,
          reply_to: 'info@dewaldscheepers.com',
          subject:  `Jou gratis e-boek: ${bookTitle} 🎁`,
          html,
        }),
      })
    } catch {}
  }

  return res.status(200).json({ ok: true, pdfUrl, title: bookTitle, duplicate: isDuplicate })
}
