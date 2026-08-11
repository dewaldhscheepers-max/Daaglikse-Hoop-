const crypto = require('crypto')
const { magAdminDing } = require('./_geheim.js')

async function getAccessToken() {
  const now    = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const claim  = Buffer.from(JSON.stringify({
    iss:   process.env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/devstorage.read_write',
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

function getContentType(filename, isAudio) {
  const ext = (filename || '').toLowerCase().split('.').pop()
  if (isAudio) {
    if (ext === 'm4a') return 'audio/mp4'
    if (ext === 'ogg') return 'audio/ogg'
    return 'audio/mpeg'
  }
  if (ext === 'png') return 'image/png'
  if (ext === 'gif') return 'image/gif'
  if (ext === 'webp') return 'image/webp'
  return 'image/jpeg'
}

module.exports.config = { api: { bodyParser: { sizeLimit: '20mb' } } }

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-sorg-geheim')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  /* Hier het `if (pin !== '2025')` gestaan. Daardie string het in die
     openbare bondel geship, en hierdie eindpunt skryf met die diensrekening
     na Firebase Storage -- enigiemand wat die pad geken het, kon lêers in
     die emmer gooi. Sien CLAUDE.md se afdeling oor geheime. */
  if (!magAdminDing(req)) return res.status(401).json({ error: 'Ongemagtig' })

  const { bookId, filename, imageBase64, fileBase64, isAudio } = req.body || {}

  const base64Data = fileBase64 || imageBase64
  if (!bookId || !filename || !base64Data) {
    return res.status(400).json({ error: 'bookId, filename en lêerdata is vereis' })
  }

  let token
  try { token = await getAccessToken() } catch (e) {
    return res.status(500).json({ error: 'Auth misluk: ' + e.message })
  }

  const bucket      = 'daaglikse-hoop.firebasestorage.app'
  const storagePath = `kinder-boeke/${bookId}/${filename}`
  const contentType = getContentType(filename, isAudio)

  let buffer
  try {
    buffer = Buffer.from(base64Data, 'base64')
  } catch (e) {
    return res.status(400).json({ error: 'Ongeldige lêerdata: ' + e.message })
  }

  /* ── Die aflaai-teken ──

     Toe die blaaier nog self opgelaai het, het `getDownloadURL()` 'n URL met
     `?alt=media&token=…` teruggegee. Daardie teken is wat 'n prent laat wys
     sonder dat die Storage-reels dit vir die wereld hoef oop te maak.

     Ons moet dit dus SELF skep. Storage lees die teken uit die objek se eie
     metadata, uit 'n veld met die naam `firebaseStorageDownloadTokens`. Skryf
     'n mens die objek sonder daardie veld -- soos hierdie eindpunt vroeer
     gedoen het -- laai die prent wel op, maar elke poging om hom te WYS gee
     403. Die admin sou gese het dit is opgelaai, en die boek sou leeg gewees
     het.

     Daarom die multipart-oplaai: een versoek wat die metadata EN die grepe
     saam stuur. */
  const afTeken = crypto.randomUUID()
  const grens   = 'grens-' + crypto.randomBytes(12).toString('hex')
  const metadata = {
    name:        storagePath,
    contentType,
    metadata:    { firebaseStorageDownloadTokens: afTeken },
    cacheControl: 'public, max-age=31536000',
  }

  const lyf = Buffer.concat([
    Buffer.from(
      `--${grens}\r\n` +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) + '\r\n' +
      `--${grens}\r\n` +
      `Content-Type: ${contentType}\r\n\r\n`
    ),
    buffer,
    Buffer.from(`\r\n--${grens}--\r\n`),
  ])

  try {
    /* Die gewone Cloud Storage-API, nie die Firebase-een nie. Dit is presies
       wat die rol "Storage Object Admin" toelaat, en dit aanvaar die
       metadata saam met die grepe. */
    const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=multipart`
    const r = await fetch(uploadUrl, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${grens}`,
      },
      body: lyf,
    })
    if (!r.ok) {
      const err = await r.text()
      return res.status(500).json({ error: `Storage upload misluk (${r.status}): ` + err.slice(0, 400) })
    }
  } catch (e) {
    return res.status(500).json({ error: 'Storage fout: ' + e.message })
  }

  const downloadUrl =
    `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/` +
    `${encodeURIComponent(storagePath)}?alt=media&token=${afTeken}`
  return res.status(200).json({ ok: true, url: downloadUrl })
}
