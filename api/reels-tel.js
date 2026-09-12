/* ────────────────────────────────────────────────────────────
   Twee getalle oor die voer.

       gedeel      hoeveel keer die deel-knoppie gedruk is
       oopgemaak   hoeveel keer 'n gedeelde /reels/<id> oopgemaak is

   Dit is 'n kopie van `hoop-tel.js` se vorm, met 'n ander dokument, en dit is
   met opset 'n kopie: die twee tellings meet verskillende dinge en 'n gedeelde
   dokument sou hulle vir altyd inmekaar meng.

   ── Waarom hierdie twee, en nie "gekyk" nie ──

   Tyd in die app is nie groei nie — dit is dieselfde mense wat langer bly.
   Groei is die skakel wat UITGAAN. `gedeel` is die enigste getal wat sê of
   hierdie voer werk; `oopgemaak` sê of die woorde by die skakel goed genoeg is.
   Raak 'n mens eers "gekyk" tel, begin 'n mens 'n voer optimeer vir die
   verkeerde ding.

   ── Wat NIE gestoor word nie ──

   Geen naam, geen e-pos, geen toestel-id, geen IP, geen tydstempel per mens,
   en NIE watter clip gedeel is nie. 'n Telling per clip lyk onskuldig en is die
   eerste tree na "watter video het Sarel gedeel" — hierdie app moet daardie
   vraag nie kan beantwoord nie. Dieselfde besluit as by `hoop-tel.js`.

   ── Waarom die klient nooit 'n veldnaam stuur nie ──

   Die versoek is OOP: 'n gewone foon roep dit sonder wagwoord. Wie 'n veldnaam
   mag stuur, mag enige veld op daardie dokument skryf. Die klient stuur dus 'n
   GEBEURTENIS en hierdie leer maak die naam.
   ──────────────────────────────────────────────────────────── */

const crypto = require('crypto')

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
const DOK = 'tellers/reels'

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

/* 'n ATOMIESE optel. Twee fone wat op dieselfde oomblik druk, tel altwee. */
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
     voorwerp en `wat: "constructor"` gee die Object-funksie — albei is
     waarheidswaardig en albei sou as 'n `fieldPath` by Firestore beland. */
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
    /* 'n Telling wat misluk, mag NIKS vir die mens breek nie. */
    console.warn('[reels-tel] kon nie optel nie:', e.message)
    return res.status(500).json({ fout: e.message })
  }
}
