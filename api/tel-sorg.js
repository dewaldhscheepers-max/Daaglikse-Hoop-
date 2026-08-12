/* ────────────────────────────────────────────────────────────
   Drie getalle vir Pastorale Sorg.

   ── Waarom dit bestaan ──

   Die vraag was: "gister het net 3 mense gedeel — wat gaan aan?" Daar was
   geen manier om dit te antwoord nie. Die app het NIKS getel nie: geen
   Google Analytics, geen Plausible, niks. Die getal 3 het dus geen noemer
   gehad.

   Dit maak 'n reuse verskil watter noemer dit is. Het 8 mense die blad
   oopgemaak en 3 het geskryf, is dit 38% en buitengewoon goed vir die
   moeilikste ding wat 'n mens op hierdie app kan doen. Het 400 oopgemaak,
   is iets stukkend. Sonder hierdie drie getalle is elke herontwerp van
   daardie blad 'n raaiskoot, en 'n mens kan agterna nie eens sien of dit
   gehelp het nie.

   Drie oomblikke, in volgorde:

     oop      — die Sorg-oortjie is oopgemaak
     vorm     — "Vertel my wat swaar is" is gedruk
     gestuur  — 'n boodskap het werklik deurgekom

   Dit is 'n trechter. Val dit tussen `oop` en `vorm`, is die blad self die
   probleem. Val dit tussen `vorm` en `gestuur`, is die VORM die probleem.
   Is `oop` self klein, is dit nie 'n bladprobleem nie maar 'n padprobleem,
   en dan help geen herontwerp nie.

   ── Wat hier NIE gestoor word nie ──

   Geen naam, geen e-pos, geen toestel-id, geen IP, geen tydstempel per
   mens, en niks van wat iemand getik het nie. DRIE heelgetalle op EEN
   dokument. Daar is niks om aan 'n mens te koppel nie, en dit is die punt:
   die mense wat hierdie blad gebruik, deel die swaarste goed in hul lewens.

   Dit tel OOPMAKE, nie mense nie. Maak dieselfde persoon dit vyf keer oop,
   tel dit vyf. Dit is 'n eerlike getal solank 'n mens weet wat dit is; om
   unieke mense te tel sou 'n toestel-id vereis, en daardie prys is hier nie
   die moeite werd nie.

   ── Wie mag wat ──

   POST is oop, presies soos `tel-toestemming.js` en die installasie-teller.
   Gewone mense roep dit en hulle het geen wagwoord nie. Die ergste wat
   iemand met 'n script kan doen, is die drie getalle verkeerd maak — nie
   data lees nie, nie iets stuur nie, en niks bereik wat aan 'n mens raak
   nie. Ons aanvaar net die drie bekende name; enigiets anders word geweier
   voordat dit by Firestore kom.

   GET is admin-alleen. Anders as die installasie-teller staan hierdie
   getalle nêrens op 'n skerm nie, en 'n stil blad is niks wat 'n vreemdeling
   hoef te weet nie.
   ──────────────────────────────────────────────────────────── */

const crypto = require('crypto')
const { magAdminDing } = require('./_geheim')

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
const DOK = 'tellers/sorg'

/* Die enigste velde wat mag bestaan.

   'n LYS, nie 'n voorwerp waarin opgesoek word nie. Met
   `VELDE[lyf.wat]` gee `wat: "__proto__"` 'n leë voorwerp terug en
   `wat: "constructor"` gee die Object-funksie — albei is waarheidswaardig,
   albei kom deur die hek, en albei beland as 'n `fieldPath` by Firestore.
   Dit breek nie die dokument nie, maar dit maak elke sulke oproep 'n 500.
   `includes` op 'n lys het nie daardie gat nie. */
const VELDE = ['oop', 'vorm', 'gestuur']

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

/* Watter veld 'n versoek wil optel, of null. Apart sodat dit sonder 'n
   bediener getoets kan word. */
function veldVir(lyf) {
  if (!lyf || typeof lyf !== 'object') return null
  return VELDE.includes(lyf.wat) ? lyf.wat : null
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'GET') {
    if (!magAdminDing(req)) return res.status(401).json({ fout: 'Nee.' })
    let token
    try { token = await getAccessToken() } catch (e) {
      return res.status(500).json({ fout: e.message })
    }
    const r = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${DOK}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    /* Nog nooit geskryf nie is nie 'n fout nie — dit is nulle. */
    if (!r.ok) return res.status(200).json({ oop: 0, vorm: 0, gestuur: 0 })
    const d = await r.json()
    const g = n => parseInt(d.fields?.[n]?.integerValue || '0', 10)
    return res.status(200).json({ oop: g('oop'), vorm: g('vorm'), gestuur: g('gestuur') })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ fout: 'Method Not Allowed' })
  }

  let lyf = req.body
  if (typeof lyf === 'string') { try { lyf = JSON.parse(lyf) } catch { lyf = null } }

  const veld = veldVir(lyf)
  if (!veld) return res.status(400).json({ fout: 'onbekende telling' })

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
              fieldTransforms: [{ fieldPath: veld, increment: { integerValue: '1' } }],
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
module.exports.veldVir = veldVir
