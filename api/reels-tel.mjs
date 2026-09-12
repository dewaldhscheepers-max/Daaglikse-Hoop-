/* ────────────────────────────────────────────────────────────
   Wat oor die voer getel word.

   Twee totale op `tellers/reels`:

       gedeel      hoeveel keer die deel-knoppie gedruk is
       oopgemaak   hoeveel keer 'n gedeelde /reels/<id> oopgemaak is

   En, sedert 12 September 2026, EEN getal op die clip self: `gedeel`.

   ── Waarom daar nou 'n telling per clip is ──

   Hier het gestaan dat daar NOOIT een sou wees nie: "'n telling per clip is die
   eerste tree na 'watter video het Sarel gedeel'." Dewald het gevra dat die mees
   gedeelde clips voorkeur kry by nuwe kykers, en dan moet daardie getal bestaan.

   Ek het my eie reël nagegaan en hy was te breed gestel. Wat daardie vraag
   moontlik maak, is 'n telling per clip PLUS 'n mens of 'n tyd daarby. 'n Kaal
   heelgetal op die clip sê net "hierdie een is 400 keer gestuur" en kan aan
   niemand gekoppel word nie — dieselfde vorm as `likes/<id>` per nota en
   `prayedCount` per gebed, wat albei lankal in hierdie app staan.

   Die grens bly dus waar hy was, net skerper: 'n AGGREGAAT per clip mag;
   enigiets per MENS nooit. Geen naam, geen e-pos, geen toestel-id, geen IP,
   geen tydstempel per mens.

   ── Waarom die klient nooit 'n veldnaam stuur nie ──

   Die versoek is OOP: 'n gewone foon roep dit sonder wagwoord, presies soos
   `api/tel-toestemming.js`. Wie 'n veldnaam mag stuur, mag enige veld op daardie
   dokument skryf, en 'n `fieldPath` wat 'n mens self kies, is die pad na 500's
   uit Firestore. Die klient stuur dus 'n GEBEURTENIS en hierdie leer maak die
   naam.

   ── Wat 'n mens hiermee kan doen, en waarom dit aanvaar is ──

   Die eindpunt is oop, dus kan iemand 'n clip se `gedeel` kunsmatig opstoot. Die
   gevolg is dat daardie clip hoër in 'n nuwe kyker se voer staan. Dit is nie
   niks nie, maar dit is ook nie skade nie: die inhoud is in elk geval deur die
   admin gekies en elke clip mag wys. Die kliënt merk homself een keer per clip
   (localStorage), wat toevallige dubbeltellings keer; teen 'n mens wat dit
   doelbewus doen, is daar geen verdediging wat nie 'n aanmelding vereis nie, en
   'n aanmelding vir 'n deel-knoppie is 'n muur wat die hele punt van die voer
   sou breek.

   ── Waarom .mjs ──

   Sodat `geldigeId` uit `src/data/reels.js` kan kom. Die kliënt en die bediener
   keur 'n clip-id met PRESIES dieselfde funksie; twee kopieë van 'n keuring is
   een kopie wat gaan agterbly.
   ──────────────────────────────────────────────────────────── */
import crypto from 'node:crypto'
import { geldigeId } from '../src/data/reels.js'

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
const DOK = 'tellers/reels'

const VELDE = { gedeel: 'gedeel', oopgemaak: 'oopgemaak' }

/* Net 'n DEEL word per clip getel. "Oopgemaak" per clip sou sê hoe gewild 'n
   gedeelde skakel was, en dít begin lyk soos 'n profiel van wat rondgestuur
   word. Die een getal wat ons nodig het om te rangskik, is genoeg. */
const PER_KLIP = new Set(['gedeel'])

async function kryToken() {
  const nou    = Math.floor(Date.now() / 1000)
  const kop    = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const eis    = Buffer.from(JSON.stringify({
    iss:   process.env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud:   'https://oauth2.googleapis.com/token',
    iat:   nou,
    exp:   nou + 3600,
  })).toString('base64url')
  const sleutel = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  const teken = crypto.createSign('RSA-SHA256')
  teken.update(`${kop}.${eis}`)
  const sig = teken.sign(sleutel, 'base64url')
  const jwt = `${kop}.${eis}.${sig}`
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  })
  const data = await r.json()
  if (!data.access_token) throw new Error('No access token')
  return data.access_token
}

/* ATOMIESE optel, en ALBEI skrywes in EEN commit. Twee fone wat op dieselfde
   oomblik druk, tel altwee; 'n lees-dan-skryf sou een van hulle verloor. */
async function telOp(token, veld, klipId) {
  const wortel = `projects/${PROJECT_ID}/databases/(default)/documents`
  const skrywes = [{
    transform: {
      document: `${wortel}/${DOK}`,
      fieldTransforms: [{ fieldPath: veld, increment: { integerValue: '1' } }],
    },
  }]
  if (klipId) {
    skrywes.push({
      transform: {
        document: `${wortel}/reels/${encodeURIComponent(klipId)}`,
        fieldTransforms: [{ fieldPath: 'gedeel', increment: { integerValue: '1' } }],
      },
    })
  }
  const r = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ writes: skrywes }),
    }
  )
  if (!r.ok) throw new Error('commit ' + r.status)
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).json({ fout: 'Method Not Allowed' })

  let lyf = req.body
  if (typeof lyf === 'string') { try { lyf = JSON.parse(lyf) } catch { lyf = null } }
  if (!lyf || typeof lyf !== 'object') return res.status(400).json({ fout: 'geen data nie' })

  /* `hasOwnProperty`, nie net `VELDE[...]` nie. `wat: "__proto__"` gee 'n leë
     voorwerp en `wat: "constructor"` gee die Object-funksie — albei is
     waarheidswaardig, albei sou deur die hek kom, en albei beland as 'n
     `fieldPath` by Firestore, wat elke sulke oproep 'n 500 maak. */
  const veld = Object.prototype.hasOwnProperty.call(VELDE, lyf.wat) ? VELDE[lyf.wat] : undefined
  if (!veld) return res.status(400).json({ fout: 'onbekende gebeurtenis' })

  /* Die clip-id is OPSIONEEL. Is hy onbruikbaar, tel ons die totaal steeds — die
     mens het werklik gedeel, en 'n slegte id mag daardie feit nie uitvee nie. */
  let klipId = ''
  if (PER_KLIP.has(veld) && typeof lyf.klip === 'string') {
    /* `typeof === 'string'`, nie net `!= null` nie. `String(0)` is `"0"` en
       `String(true)` is `"true"` — albei is 'n geldige ID-VORM, en albei sou 'n
       gemors-dokument in `reels` geskep het (`reels/0`, `reels/true`,
       `reels/[object Object]`). Die kliënt stuur altyd 'n string; enigiets
       anders is 'n fout of 'n poging. */
    const k = lyf.klip.trim()
    if (geldigeId(k)) klipId = k
  }

  if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    return res.status(500).json({ fout: 'diensrekening ontbreek' })
  }

  try {
    const token = await kryToken()
    await telOp(token, veld, klipId)
    return res.status(200).json({ ok: true, klip: !!klipId })
  } catch (e) {
    /* 'n Telling wat misluk, mag NIKS vir die mens breek nie — die klient roep
       dit in 'n `catch` wat niks doen nie. Ons sê net wat gebeur het. */
    console.warn('[reels-tel] kon nie optel nie:', e.message)
    return res.status(500).json({ fout: e.message })
  }
}
