/* Hoeveel mense loop VOLG JESUS.
 *
 *   POST /api/volg-jesus-telling   { ding, week, dag }   → oop, tel op
 *   GET  /api/volg-jesus-telling                          → net die admin
 *
 * Die POST is oop, soos die installasie-teller en `tel-toestemming`. Die
 * ergste wat iemand met 'n script kan doen, is die getalle verkeerd maak —
 * nie data lees nie, nie iets stuur nie, en niks bereik nie wat aan 'n mens
 * raak. Watter velde bestaan, staan in `_volgJesusTelVelde.js`; die kliënt
 * kies nooit 'n veldnaam nie.
 *
 * Die GET is toe, want dit is die admin se blad. Nie omdat die getalle
 * persoonlik is nie — hulle is dit nie — maar omdat 'n oop leespad 'n ding is
 * wat 'n mens later moet onthou het bestaan.
 *
 * Elke TOESTEL tel homself een keer per ding; sien `volgJesusTel.js` in die
 * app. Hier is niks wat weet watter toestel dit was nie.
 */
const crypto = require('crypto')
const { magAdminDing } = require('./_geheim.js')
const { velde } = require('./_volgJesusTelVelde.js')

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
const DOK = 'tellers/volgJesus'

async function kryToken() {
  const nou = Math.floor(Date.now() / 1000)
  const kop = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const eis = Buffer.from(JSON.stringify({
    iss:   process.env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud:   'https://oauth2.googleapis.com/token',
    iat:   nou,
    exp:   nou + 3600,
  })).toString('base64url')
  const sleutel = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  const teken = crypto.createSign('RSA-SHA256')
  teken.update(`${kop}.${eis}`)
  const jwt = `${kop}.${eis}.${teken.sign(sleutel, 'base64url')}`
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  if (!r.ok) throw new Error(`oauth ${r.status}`)
  const j = await r.json()
  if (!j.access_token) throw new Error('geen teken')
  return j.access_token
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  /* ── Lees: net die admin ──────────────────────────────────────────── */
  if (req.method === 'GET') {
    if (!magAdminDing(req)) return res.status(401).json({ fout: 'Ongemagtig' })
    try {
      const token = await kryToken()
      const r = await fetch(
        `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${DOK}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      /* 404 beteken niemand het nog begin nie. Dit is 'n geldige antwoord,
         nie 'n fout nie — die admin moet nulle sien en nie 'n rooi blok. */
      if (r.status === 404) return res.status(200).json({ tellers: {} })
      if (!r.ok) return res.status(500).json({ fout: 'Firestore ' + r.status })
      const j = await r.json()
      const tellers = {}
      for (const [k, v] of Object.entries((j && j.fields) || {})) {
        const n = Number(v && v.integerValue)
        if (Number.isFinite(n)) tellers[k] = n
      }
      return res.status(200).json({ tellers })
    } catch (e) {
      console.error('[vj telling lees]', e && e.message)
      return res.status(500).json({ fout: 'Kon nie die tellers laai nie' })
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ fout: 'net GET of POST' })
  }

  let lyf = req.body
  if (typeof lyf === 'string') { try { lyf = JSON.parse(lyf) } catch { lyf = null } }

  const paaie = velde(lyf)
  if (!paaie.length) return res.status(400).json({ fout: 'onbekende gebeurtenis' })

  try {
    const token = await kryToken()
    const r = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writes: [{
            transform: {
              document: `projects/${PROJECT_ID}/databases/(default)/documents/${DOK}`,
              fieldTransforms: paaie.map(p => ({
                fieldPath: p, increment: { integerValue: '1' },
              })),
            },
          }],
        }),
      }
    )
    if (!r.ok) {
      const t = await r.text().catch(() => '')
      console.error('[vj telling]', r.status, t.slice(0, 200))
      return res.status(500).json({ fout: 'Kon nie tel nie' })
    }
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('[vj telling]', e && e.message)
    return res.status(500).json({ fout: 'Kon nie tel nie' })
  }
}

module.exports.DOK = DOK
