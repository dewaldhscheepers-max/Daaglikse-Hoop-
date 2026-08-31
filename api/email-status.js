const crypto = require('crypto')
const { haalEnOntleed } = require('./_eposLys')

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
  const projectId = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
  let token
  try { token = await getAccessToken() } catch (e) {
    return res.json({ emailCount: 0, activeCampaign: null })
  }

  // Get active campaign
  let activeCampaign = null
  try {
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
    if (doc) {
      const f = doc.fields || {}
      activeCampaign = {
        id:        doc.name.split('/').pop(),
        subject:   f.subject?.stringValue  || '',
        sentCount: parseInt(f.sentCount?.integerValue || 0),
        total:     parseInt(f.total?.integerValue     || 0),
        remaining: (f.pendingEmails?.arrayValue?.values || []).length,
      }
    }
  } catch {}

  /* Die lys word deur _eposLys.js ontleed — dieselfde lêer wat send-bulk-email
     gebruik. Dit het vroeer die ROU dokumente getel terwyl die stuurder die
     UNIEKE adresse gestuur het, en daarom het die paneel "2731" belowe en
     "2131" gelewer. */
  let lys = { totaal: 0, aktief: 0, duplikate: 0, ongeldig: 0, sonderVeld: 0, uitgesluit: 0, geblok: 0, afgemeld: null }
  try { lys = await haalEnOntleed(projectId, token) } catch {}

  return res.json({
    // emailCount is nou die getal wat WERKLIK gestuur gaan word.
    emailCount: lys.aktief,
    lys: {
      totaal:     lys.totaal,
      aktief:     lys.aktief,
      uitgesluit: lys.uitgesluit,
      duplikate:  lys.duplikate,
      ongeldig:   lys.ongeldig,
      sonderVeld: lys.sonderVeld,
      /* Mense wat gevra het om af te kom. Sien _eposGeblok.js. */
      geblok:     lys.geblok,
      afgemeld:   lys.afgemeld,
    },
    activeCampaign,
  })
}
