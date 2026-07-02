const crypto = require('crypto')

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

async function runQuery(projectId, token, structuredQuery) {
  const r = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ structuredQuery }),
    }
  )
  if (!r.ok) return []
  return r.json()
}

async function getAllEmails(projectId, token) {
  const emails = []
  let pageToken = ''
  do {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/emailList?pageSize=300${pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : ''}`
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!r.ok) break
    const data = await r.json()
    if (data.documents) {
      for (const doc of data.documents) {
        const email = doc.fields?.email?.stringValue
        if (email) emails.push(email.toLowerCase().trim())
      }
    }
    pageToken = data.nextPageToken || ''
  } while (pageToken)
  return [...new Set(emails)]
}

async function getActiveCampaign(projectId, token) {
  const results = await runQuery(projectId, token, {
    from: [{ collectionId: 'emailCampaigns' }],
    where: { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'active' } } },
    limit: 1,
  })
  const doc = results.find(r => r.document)?.document
  if (!doc) return null
  const f  = doc.fields || {}
  return {
    id:            doc.name.split('/').pop(),
    subject:       f.subject?.stringValue || '',
    sentCount:     parseInt(f.sentCount?.integerValue || 0),
    total:         parseInt(f.total?.integerValue || 0),
    pendingEmails: (f.pendingEmails?.arrayValue?.values || []).map(v => v.stringValue).filter(Boolean),
  }
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
        <a href="https://www.dewaldscheepers.com/go" style="display:block;background:#f5f3ff;color:#5C4E8E;text-decoration:none;border-radius:10px;padding:13px 10px;font-size:13px;font-weight:700;text-align:center;font-family:Georgia,serif;margin-bottom:24px;">
          📱 Maak die Daaglikse Hoop App oop
        </a>
        <hr style="border:none;border-top:1px solid #e8e4f0;margin:0 0 20px;">
        <p style="color:#888;font-size:13px;line-height:1.6;">
          Daaglikse Hoop &middot;
          <a href="mailto:info@dewaldscheepers.com" style="color:#5C4E8E;">info@dewaldscheepers.com</a><br>
          Jy ontvang hierdie e-pos omdat jy 'n e-boek gekoop het.
        </p>
      </div>
    </div>
  `
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Not Allowed')
  const { pin, subject, body } = req.body || {}
  if (pin !== '2025') return res.status(403).send('Forbidden')
  if (!subject?.trim() || !body?.trim()) return res.status(400).json({ error: 'Onderwerp en boodskap is verpligtend' })

  const projectId = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
  let token
  try { token = await getAccessToken() } catch (e) {
    return res.status(500).json({ error: 'Auth misluk: ' + e.message })
  }

  const existing = await getActiveCampaign(projectId, token)
  if (existing) return res.status(400).json({ error: 'Aktiewe kampanje loop reeds', campaign: existing })

  const emails = await getAllEmails(projectId, token)
  if (emails.length === 0) return res.status(400).json({ error: 'Geen inskrywers nie. Voer eers die lys in.' })

  const batch     = emails.slice(0, 100)
  const remaining = emails.slice(100)
  const html      = buildHtml(body)

  let sentCount = 0
  try {
    const r = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(batch.map(to => ({
        from:     'Daaglikse Hoop <info@dewaldscheepers.com>',
        to,
        reply_to: 'info@dewaldscheepers.com',
        subject:  subject.trim(),
        html,
      }))),
    })
    const result = await r.json()
    if (r.ok) sentCount = batch.length
    else console.error('Resend batch error:', JSON.stringify(result))
  } catch (e) {
    console.error('Send error:', e.message)
  }

  const campaignId = `campaign_${Date.now()}`
  const isComplete = remaining.length === 0
  await fsWrite(projectId, token, `emailCampaigns/${campaignId}`, {
    subject:       { stringValue: subject.trim() },
    body:          { stringValue: body.trim() },
    status:        { stringValue: isComplete ? 'completed' : 'active' },
    total:         { integerValue: String(emails.length) },
    sentCount:     { integerValue: String(sentCount) },
    pendingEmails: { arrayValue: { values: remaining.map(e => ({ stringValue: e })) } },
    createdAt:     { timestampValue: new Date().toISOString() },
    ...(isComplete ? { completedAt: { timestampValue: new Date().toISOString() } } : {}),
  })

  return res.json({
    ok: true,
    campaignId,
    total:     emails.length,
    sentCount,
    remaining: remaining.length,
    daysLeft:  remaining.length > 0 ? Math.ceil(remaining.length / 100) : 0,
  })
}
