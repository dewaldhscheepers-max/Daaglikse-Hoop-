const { magAdminDing } = require('./_geheim.js')
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
  if (!data.access_token) throw new Error('No access token: ' + JSON.stringify(data))
  return data.access_token
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { book } = req.body || {}

  if (!magAdminDing(req)) return res.status(401).json({ error: 'Ongemagtig' })
  if (!book) return res.status(400).json({ error: 'book is vereis' })

  let { id, title, description, ageRange, pages, status, audioUrl } = book

  // Generate id from title if not provided
  if (!id || !id.trim()) {
    id = (title || '').trim().toLowerCase()
      .replace(/[àáâäã]/g, 'a').replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i').replace(/[òóôöõ]/g, 'o')
      .replace(/[ùúûü]/g, 'u').replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
    if (!id) id = 'boek-' + Date.now()
  }

  // Cover = explicit cover field if provided, otherwise first page
  const cover = (book.cover || '').trim() || (Array.isArray(pages) && pages.length > 0 ? pages[0] : '')

  const projectId = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'

  let token
  try { token = await getAccessToken() } catch (e) {
    return res.status(500).json({ error: 'Auth misluk: ' + e.message })
  }

  const fields = {
    title:       { stringValue: (title || '').trim() },
    description: { stringValue: (description || '').trim() },
    ageRange:    { stringValue: (ageRange || '2–5 jaar').trim() },
    cover:       { stringValue: cover },
    status:      { stringValue: status || 'draft' },
    audioUrl:    { stringValue: audioUrl || '' },
    pages:       {
      arrayValue: {
        values: (Array.isArray(pages) ? pages : []).map(url => ({ stringValue: url })),
      },
    },
    updatedAt: { timestampValue: new Date().toISOString() },
  }

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/kinderBoeke/${id}`

  /* ── createdAt, en waarom dit nie updatedAt is nie ──

     Nuwe kinderboeke moet bo-aan die biblioteek staan. Daarvoor is 'n datum
     nodig, en `updatedAt` lyk soos die voor die hand liggende keuse.

     Dit is dit nie. Wysig 'n mens 'n drie jaar oue boek se beskrywing, spring
     hy boontoe asof hy vanoggend gemaak is. Die volgorde sou dan wys wanneer
     iets laas AANGERAAK is, nie wanneer dit BYGEKOM het nie.

     Daarom lees ons eers of die dokument reeds 'n createdAt het. Het hy een,
     bly dit staan -- die PATCH stuur die veld glad nie, en Firestore laat 'n
     veld wat nie in die liggaam is nie, onaangeraak. Is dit 'n nuwe boek, sit
     ons dit nou.

     Die sewe ingeboude boeke het nie een nie en kry ook nie een nie; hulle val
     dus onder in die lys, wat presies reg is. */
  try {
    const bestaan = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!bestaan.ok) {
      /* 404 beteken 'n splinternuwe boek. */
      fields.createdAt = { timestampValue: new Date().toISOString() }
    } else {
      const doc = await bestaan.json()
      if (!doc?.fields?.createdAt) {
        /* 'n Boek wat voor hierdie veld bestaan het. Ons vul createdAt in met
           sy BESTAANDE updatedAt, nie met vandag se datum nie -- anders spring
           elke ou boek boontoe die eerste keer dat 'n mens hom oopmaak en
           Stoor druk. */
        const oudDatum = doc?.fields?.updatedAt?.timestampValue
        fields.createdAt = { timestampValue: oudDatum || new Date().toISOString() }
      }
    }
  } catch {
    /* Kan ons nie kyk nie, laat createdAt uit. 'n Boek sonder een val onder in
       die lys; dit is beter as om 'n bestaande een te oorskryf. */
  }

  let r
  try {
    r = await fetch(url, {
      method:  'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ fields }),
    })
  } catch (e) {
    return res.status(500).json({ error: 'Firestore fout: ' + e.message })
  }

  if (!r.ok) {
    const err = await r.text()
    return res.status(500).json({ error: 'Firestore PATCH misluk: ' + err })
  }

  return res.status(200).json({ ok: true, id })
}
