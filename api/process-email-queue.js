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

async function getActiveCampaign(projectId, token) {
  const results = await runQuery(projectId, token, {
    from: [{ collectionId: 'emailCampaigns' }],
    where: { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'active' } } },
    limit: 1,
  })
  const doc = results.find(r => r.document)?.document
  if (!doc) return null
  const f = doc.fields || {}
  return {
    id:            doc.name.split('/').pop(),
    subject:       f.subject?.stringValue || '',
    body:          f.body?.stringValue    || '',
    sentCount:     parseInt(f.sentCount?.integerValue || 0),
    total:         parseInt(f.total?.integerValue     || 0),
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
  /* ── Wie mag die e-poswerkry laat loop ──

     Hier het twee geheime in die KODE gestaan — 'DaaglikseHoop2025Cron' en
     '2025' — en die admin het die eerste een in die URL saamgestuur. Daardie
     oproep sit in die app se openbare JavaScript, dus kon enigiemand die ry
     laat loop en Dewald se e-poskwota deurbrand.

     Nou net twee paaie, en albei se geheim bestaan NET op Vercel: die MENS
     met SORG_ADMIN_GEHEIM in 'n kopstuk, of die CRON met CRON_SECRET. */
  const crypto = require('crypto')
  const selfde = (a, b) => {
    const x = Buffer.from(String(a || ''))
    const y = Buffer.from(String(b || ''))
    if (!x.length || x.length !== y.length) return false
    return crypto.timingSafeEqual(x, y)
  }
  const cron  = process.env.CRON_SECRET || ''
  const admin = process.env.SORG_ADMIN_GEHEIM || ''
  const gegee = req.query?.secret || req.body?.secret || ''
  const kop   = req.headers['x-sorg-geheim'] || ''

  const magCron  = !!cron && selfde(gegee, cron)
  const magAdmin = admin.length >= 12 && selfde(kop, admin)
  if (!magCron && !magAdmin) return res.status(403).send('Forbidden')

  const projectId = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
  let token
  try { token = await getAccessToken() } catch (e) {
    return res.status(500).json({ error: e.message })
  }

  const campaign = await getActiveCampaign(projectId, token)
  if (!campaign) return res.json({ ok: true, message: 'Geen aktiewe kampanje' })

  if (campaign.pendingEmails.length === 0) {
    await fsWrite(projectId, token, `emailCampaigns/${campaign.id}`, {
      subject:       { stringValue: campaign.subject },
      body:          { stringValue: campaign.body },
      status:        { stringValue: 'completed' },
      total:         { integerValue: String(campaign.total) },
      sentCount:     { integerValue: String(campaign.sentCount) },
      pendingEmails: { arrayValue: { values: [] } },
      completedAt:   { timestampValue: new Date().toISOString() },
    })
    return res.json({ ok: true, message: 'Kampanje voltooi!', total: campaign.total })
  }

  const html = buildHtml(campaign.body)
  let sentCount = 0

  for (let i = 0; i < campaign.pendingEmails.length; i += 100) {
    const chunk = campaign.pendingEmails.slice(i, i + 100)
    try {
      const r = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(chunk.map(to => ({
          from:     'Daaglikse Hoop <info@dewaldscheepers.com>',
          to,
          reply_to: 'info@dewaldscheepers.com',
          subject:  campaign.subject,
          html,
        }))),
      })
      if (r.ok) sentCount += chunk.length
      else console.error('Resend error:', await r.text())
    } catch (e) {
      console.error('Send error:', e.message)
    }
  }

  const newSentCount = campaign.sentCount + sentCount

  await fsWrite(projectId, token, `emailCampaigns/${campaign.id}`, {
    subject:       { stringValue: campaign.subject },
    body:          { stringValue: campaign.body },
    status:        { stringValue: 'completed' },
    total:         { integerValue: String(campaign.total) },
    sentCount:     { integerValue: String(newSentCount) },
    pendingEmails: { arrayValue: { values: [] } },
    completedAt:   { timestampValue: new Date().toISOString() },
  })

  return res.json({
    ok:        true,
    sent:      sentCount,
    totalSent: newSentCount,
    total:     campaign.total,
    remaining: 0,
    message:   'Kampanje voltooi!',
  })
}
