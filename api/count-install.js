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

module.exports = async function handler(req, res) {
  const projectId = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
  const docPath   = `projects/${projectId}/databases/(default)/documents/counters/installs`
  const baseUrl   = `https://firestore.googleapis.com/v1/${docPath}`

  /* ── GET: die telling, en dit is OPENBAAR ──

     Dit was 'n rukkie admin-alleen. Dit was reg toe die getal net in die
     admin gestaan het, maar dit staan nou op die skerm vir elke mens wat die
     blad oopmaak — 'n getal wat gedruk word, kan nie 'n geheim wees nie.

     Daar is niks om te beskerm nie: dit is EEN heelgetal. Geen naam, geen
     toestel, niks wat na iemand teruglei nie.

     Die rand hou dit vyf minute, sodat ses duisend fone wat die blad oopmaak
     nie ses duisend keer by Firestore gaan vra nie. */
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300')
    let token
    try { token = await getAccessToken() } catch (e) {
      return res.status(500).json({ error: 'Auth failed: ' + e.message })
    }
    const r = await fetch(baseUrl, { headers: { Authorization: `Bearer ${token}` } })
    if (!r.ok) return res.status(200).json({ total: 0 })
    const data = await r.json()
    const total = parseInt(data.fields?.total?.integerValue || '0', 10)
    return res.status(200).json({ total })
  }

  // POST — increment install counter
  if (req.method === 'POST') {
    let token
    try { token = await getAccessToken() } catch (e) {
      return res.status(500).json({ error: 'Auth failed: ' + e.message })
    }

    const body = {
      writes: [{
        transform: {
          document: docPath,
          fieldTransforms: [{
            fieldPath: 'total',
            increment: { integerValue: '1' },
          }],
        },
      }],
    }
    const r = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )
    if (!r.ok) {
      const err = await r.text()
      return res.status(500).json({ error: 'Firestore write failed: ' + err })
    }
    return res.status(200).json({ ok: true })
  }

  return res.status(405).send('Method Not Allowed')
}
