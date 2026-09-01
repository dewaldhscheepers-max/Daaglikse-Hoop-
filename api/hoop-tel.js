/* ────────────────────────────────────────────────────────────
   Twee getalle oor die gedeelde skakel.

       gedeel      hoeveel keer die deel-knoppie gedruk is
       oopgemaak   hoeveel keer 'n gedeelde skakel oopgemaak is

   Dit is die HELE meting vir nou, en dit is met opset. Die volle trechter —
   gedeel → oopgemaak → geluister → geinstalleer — is vier gebeurtenisse maal
   duisende, en dit verander nie wat ons eerste bou nie. Is hierdie een
   verhouding goed, dan instrumenteer ons die res.

   ── Wat NIE gestoor word nie ──

   Geen naam, geen e-pos, geen toestel-id, geen IP, geen tydstempel per mens,
   en NIE watter nota gedeel is nie. Twee heelgetalle op een dokument. 'n Mens
   kan uit hierdie data onmoontlik agterkom wie wie is, want daar is niks om
   aan iemand te koppel nie.

   Die nota-id word doelbewus NIE getel nie. 'n Telling per nota lyk onskuldig
   en is dit meestal ook, maar dit is die eerste tree na "watter boodskap het
   Sarel gedeel" — en hierdie app moet daardie vraag nie kan beantwoord nie.

   ── Waarom die klient nooit 'n veldnaam stuur nie ──

   Die versoek is OOP: 'n gewone foon roep dit sonder wagwoord, presies soos
   `api/tel-toestemming.js`. Wie 'n veldnaam mag stuur, mag enige veld op
   daardie dokument skryf, en 'n `fieldPath` wat 'n mens self kies, is die pad
   na 500's uit Firestore. Die klient stuur dus 'n GEBEURTENIS en hierdie leer
   maak die naam.
   ──────────────────────────────────────────────────────────── */

const crypto = require('crypto')

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
const DOK = 'tellers/hoopDeel'

/* Die enigste velde wat mag bestaan. Kom daar iets anders in, gebeur daar
   niks. */
const VELDE = { gedeel: 'gedeel', oopgemaak: 'oopgemaak' }

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

/* Firestore se `commit` met 'n `transform`. Dit is 'n ATOMIESE optel: twee
   fone wat op dieselfde oomblik druk, tel altwee. 'n Lees-dan-skryf sou een
   van hulle verloor. */
async function telOp(token, veld) {
  const pad = `projects/${PROJECT_ID}/databases/(default)/documents/${DOK}`
  const r = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        writes: [{
          transform: {
            document: pad,
            fieldTransforms: [{ fieldPath: veld, increment: { integerValue: '1' } }],
          },
        }],
      }),
    }
  )
  if (!r.ok) throw new Error('commit ' + r.status)
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).json({ fout: 'Method Not Allowed' })

  let lyf = req.body
  if (typeof lyf === 'string') { try { lyf = JSON.parse(lyf) } catch { lyf = null } }
  if (!lyf || typeof lyf !== 'object') return res.status(400).json({ fout: 'geen data nie' })

  /* `hasOwnProperty`, nie net `VELDE[...]` nie. `wat: "__proto__"` gee 'n leë
     voorwerp terug en `wat: "constructor"` gee die Object-funksie — albei is
     waarheidswaardig, albei sou deur die hek kom, en albei beland as 'n
     `fieldPath` by Firestore, wat elke sulke oproep 'n 500 maak. Dieselfde
     hek as `api/tel-toestemming.js`. */
  const veld = Object.prototype.hasOwnProperty.call(VELDE, lyf.wat) ? VELDE[lyf.wat] : undefined
  if (!veld) return res.status(400).json({ fout: 'onbekende gebeurtenis' })

  if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    return res.status(500).json({ fout: 'diensrekening ontbreek' })
  }

  try {
    const token = await getAccessToken()
    await telOp(token, veld)
    return res.status(200).json({ ok: true })
  } catch (e) {
    /* 'n Telling wat misluk, mag NIKS vir die mens breek nie — die klient
       roep dit in 'n `catch` wat niks doen nie. Ons sê net wat gebeur het. */
    console.warn('[hoop-tel] kon nie optel nie:', e.message)
    return res.status(500).json({ fout: e.message })
  }
}
