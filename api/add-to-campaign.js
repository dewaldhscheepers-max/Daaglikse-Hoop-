const crypto = require('crypto')
const { magAdminDing } = require('./_geheim.js')

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

  // Get active campaign
  const r = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ structuredQuery: {
        from: [{ collectionId: 'emailCampaigns' }],
        where: { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'active' } } },
        limit: 1,
      }}),
    }
  )
  const results = await r.json()
  const doc = results.find(d => d.document)?.document
  if (!doc) return res.status(404).json({ error: 'Geen aktiewe kampanje nie' })

  const f               = doc.fields || {}
  const campaignId      = doc.name.split('/').pop()
  const existing        = (f.pendingEmails?.arrayValue?.values || []).map(v => v.stringValue)
  const sentCount       = parseInt(f.sentCount?.integerValue || 0)
  const total           = parseInt(f.total?.integerValue || 0)

  const clean    = [...new Set(emails.map(e => e.toLowerCase().trim()).filter(Boolean))]
  const toAdd    = clean.filter(e => !existing.includes(e))
  const newPending = [...existing, ...toAdd]
  const newTotal   = total + toAdd.length

  // Update campaign with added emails
  await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/emailCampaigns/${campaignId}`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: {
        subject:       f.subject,
        body:          f.body,
        status:        { stringValue: 'active' },
        total:         { integerValue: String(newTotal) },
        sentCount:     { integerValue: String(sentCount) },
        pendingEmails: { arrayValue: { values: newPending.map(e => ({ stringValue: e })) } },
        createdAt:     f.createdAt,
      }}),
    }
  )

  return res.json({ ok: true, added: toAdd.length, skipped: clean.length - toAdd.length, newTotal })
}
