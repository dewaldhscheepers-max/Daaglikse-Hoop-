const crypto = require('crypto')
const { magAdminDing } = require('./_geheim.js')
const { sifGeblok } = require('./_eposGeblok')

async function getAccessToken() {
  const now    = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const claim  = Buffer.from(JSON.stringify({
    iss: process.env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  })).toString('base64url')
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(`${header}.${claim}`)
  const sig = sign.sign(privateKey, 'base64url')
  const jwt = `${header}.${claim}.${sig}`
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  })
  const data = await r.json()
  if (!data.access_token) throw new Error('No token')
  return data.access_token
}

function buildHtml(body) {
  const paragraphs = body.trim().split(/\n\n+/).map(p =>
    `<p style="color:#555;line-height:1.8;margin:0 0 16px;">${p.replace(/\n/g, '<br>')}</p>`
  ).join('')
  return `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#2d2d2d;">
      <div style="background:#5C4E8E;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:white;margin:0;font-size:28px;">Daaglikse Hoop</h1>
        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">met Dewald Scheepers</p>
      </div>
      <div style="padding:32px 24px;background:white;border-radius:0 0 12px 12px;border:1px solid #e8e4f0;">
        ${paragraphs}
        <hr style="border:none;border-top:1px solid #e8e4f0;margin:28px 0 24px;">
        <p style="font-size:15px;font-weight:700;color:#2d2d2d;margin:0 0 18px;text-align:center;">Indien jy die bediening wil ondersteun:</p>
        <a href="https://www.dewaldscheepers.com/go/support" style="display:block;background:#5C4E8E;color:white;text-decoration:none;border-radius:10px;padding:15px 12px;font-size:14px;font-weight:700;text-align:center;font-family:Georgia,serif;letter-spacing:0.03em;margin-bottom:10px;">
          &#9829; HELP DRA DIE HOOP
        </a>
        <a href="https://www.dewaldscheepers.com/go" style="display:block;background:#f5f3ff;color:#5C4E8E;text-decoration:none;border-radius:10px;padding:14px 12px;font-size:14px;font-weight:700;text-align:center;font-family:Georgia,serif;letter-spacing:0.03em;border:1px solid #ddd6f5;margin-bottom:24px;">
          &#128241; MAAK DAAGLIKSE HOOP OOP
        </a>
        <hr style="border:none;border-top:1px solid #e8e4f0;margin:0 0 20px;">
        <p style="color:#888;font-size:13px;line-height:1.6;">
          Daaglikse Hoop &middot;
          <a href="mailto:info@dewaldscheepers.com" style="color:#5C4E8E;">info@dewaldscheepers.com</a>
        </p>
      </div>
    </div>
  `
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Not Allowed')
  /* Hier het `if (pin !== '2025')` gestaan -- 'n openbare string as slot.
     Sien CLAUDE.md: die vergelyking hoort een keer, in _geheim.js. */
  if (!magAdminDing(req)) return res.status(403).send('Forbidden')

  const { emails } = req.body || {}
  if (!emails || emails.length === 0) return res.status(400).json({ error: 'Geen e-posadresse nie' })

  const projectId = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
  let token
  try { token = await getAccessToken() } catch (e) {
    return res.status(500).json({ error: e.message })
  }

  // Get last campaign (active or completed) for subject + body
  const r = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ structuredQuery: {
        from: [{ collectionId: 'emailCampaigns' }],
        orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
        limit: 1,
      }}),
    }
  )
  const results = await r.json()
  const doc = results.find(d => d.document)?.document
  if (!doc) return res.status(404).json({ error: 'Geen vorige kampanje gevind nie' })

  const f       = doc.fields || {}
  const subject = f.subject?.stringValue || ''
  const body    = f.body?.stringValue    || ''
  if (!subject || !body) return res.status(400).json({ error: 'Kampanje het geen inhoud nie' })

  const html  = buildHtml(body)
  /* Hierdie eindpunt stuur 'n kampanje OOR na 'n handjievol adresse — gewoonlik
     die wat die eerste keer geval het. Dit is 'n derde pad na Resend toe wat
     nie deur `stuurBondel` loop nie, en 'n mens wat gevra het om af te kom,
     sou juis hier weer 'n e-pos kry. Sien `_eposGeblok.js`. */
  const { adresse: clean, geblok } = sifGeblok(
    [...new Set(emails.map(e => e.toLowerCase().trim()).filter(Boolean))]
  )
  if (!clean.length) return res.json({ sent: 0, geblok, boodskap: 'Almal is geblok' })

  let sent = 0
  try {
    const resp = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(clean.map(to => ({
        from:     'Daaglikse Hoop <info@dewaldscheepers.com>',
        to,
        reply_to: 'info@dewaldscheepers.com',
        subject,
        html,
      }))),
    })
    if (resp.ok) sent = clean.length
    else console.error('Resend error:', await resp.text())
  } catch (e) {
    console.error('Send error:', e.message)
  }

  return res.json({ ok: true, sent, subject })
}
