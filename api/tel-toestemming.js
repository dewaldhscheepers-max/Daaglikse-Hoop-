/* ────────────────────────────────────────────────────────────
   Drie getalle, en niks anders nie.

   Hoeveel toestelle het ja gesê vir kennisgewings, hoeveel het nee gesê, en
   hoeveel het nog nie geantwoord nie.

   ── Waarom dit bestaan ──

   Die beste antwoord op "hoeveel van my mense kan ek nog bereik" was tot
   dusver 'n aftreksom tussen die installasie-teller en die aantal
   FCM-tokens. Daardie twee getalle meet nie dieselfde ding nie: die een tel
   toestelle wat OOIT geïnstalleer het (ook dié wat sedertdien afgehaal het),
   en die ander tel token-dokumente, wat opgeblaas is omdat 'n token gereeld
   verander en die ou dokument nooit uitgevee word nie.

   Die aftreksom was dus 'n raaiskoot wat na 'n feit gelyk het, en dit is die
   gevaarlikste soort getal. Nou word die ding self getel.

   ── Wat hier NIE gestoor word nie ──

   Geen naam, geen e-pos, geen toestel-id, geen IP, geen tydstempel per mens.
   Drie heelgetalle op EEN dokument. 'n Mens kan uit hierdie data onmoontlik
   agterkom wie wie is, want daar is niks om aan iemand te koppel nie.

   ── Waarom dit oop is ──

   Gewone mense roep dit, en hulle het geen wagwoord nie. Dieselfde as die
   installasie-teller wat reeds so werk. Die ergste wat iemand met 'n script
   kan doen, is die drie getalle verkeerd maak — nie data lees nie, nie iets
   stuur nie, en niks bereik nie wat aan 'n mens raak. Ons aanvaar net die
   drie bekende name; enigiets anders word geweier voordat dit by Firestore
   kom.
   ──────────────────────────────────────────────────────────── */

const crypto = require('crypto')

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
const DOK = 'tellers/toestemming'

/* Die enigste velde wat mag bestaan. Kom daar iets anders in, gebeur daar
   niks — dan kan niemand 'n willekeurige veld op daardie dokument skryf nie. */
const VELDE = { granted: 'ja', denied: 'geblok', default: 'stil' }

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
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).json({ fout: 'Method Not Allowed' })

  let lyf = req.body
  if (typeof lyf === 'string') { try { lyf = JSON.parse(lyf) } catch { lyf = null } }
  if (!lyf || typeof lyf !== 'object') return res.status(400).json({ fout: 'geen data nie' })

  const opVeld = VELDE[lyf.nuwe]
  /* Die ou toestand mag leeg wees — dit is die eerste keer dat hierdie
     toestel getel word. Dan word net opgetel. */
  const afVeld = lyf.oue ? VELDE[lyf.oue] : null
  if (!opVeld) return res.status(400).json({ fout: 'onbekende toestand' })
  if (lyf.oue && !afVeld) return res.status(400).json({ fout: 'onbekende ou toestand' })
  if (afVeld === opVeld) return res.status(200).json({ ok: true, niks: true })

  const transforms = [{ fieldPath: opVeld, increment: { integerValue: '1' } }]
  if (afVeld) transforms.push({ fieldPath: afVeld, increment: { integerValue: '-1' } })

  try {
    const token = await getAccessToken()
    const r = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writes: [{
            transform: {
              document: `projects/${PROJECT_ID}/databases/(default)/documents/${DOK}`,
              fieldTransforms: transforms,
            },
          }],
        }),
      }
    )
    if (!r.ok) {
      const t = await r.text().catch(() => '')
      return res.status(500).json({ fout: t.slice(0, 200) })
    }
    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(500).json({ fout: e.message })
  }
}

module.exports.VELDE = VELDE
module.exports.DOK = DOK
