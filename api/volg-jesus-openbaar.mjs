/* ── VOLG JESUS, soos die publiek dit sien ──
 *
 *   GET /api/volg-jesus-openbaar          → { klaar, binnekort, weke: [...], doen }
 *   GET /api/volg-jesus-openbaar?week=1   → { week: {...} }  of  { week: null }
 *
 * Geen geheim. Dit is die eindpunt wat 'n gewone foon roep.
 *
 * ── Die hek ──
 *
 * `openbareWeek()` in src/data/volgJesusOpenbaar.js. Dit doen twee dinge en
 * albei tel:
 *
 *   1. dit gee null vir enigiets waar `gepubliseer !== true`. Daardie veld
 *      staan APART in Firestore — dit kom nie uit die week se JSON nie, dus
 *      kan 'n week wat nog geskryf word dit nie per ongeluk aanskakel nie;
 *   2. dit bou 'n NUWE voorwerp uit 'n witlys. Die week wat uit Firestore kom,
 *      word nooit deurgestuur nie, en daarom kan die fasiliteerdermateriaal,
 *      die groepvrae en die hersieningsnotas nie hier uitkom nie.
 *
 * ── Hoekom .mjs ──
 *
 * Sodat dit uit `src/` kan invoer. Die app en die bediener gebruik presies
 * dieselfde `openbareWeek`; twee kopieë van 'n witlys is een kopie wat gaan
 * agterbly.
 *
 * ── Kas ──
 *
 * Die inhoud verander een keer per dag, en 'n paar duisend fone maak die app
 * binne dieselfde uur oop. `s-maxage` laat Vercel se rand dit hou; die
 * `stale-while-revalidate` beteken 'n stadige Firestore laat niemand wag nie.
 * Dit is 'n minuut, nie 'n dag nie — publiseer hy 'n week, moet dit binne 'n
 * minuut op die fone wees, nie môre nie.
 */
import crypto from 'node:crypto'
import { openbareWeek, gepubliseerdeNommers, binnekort, tot } from '../src/data/volgJesusOpenbaar.js'
import berging from './_volgJesusBerging.js'

const { dokNaam, uitFirestore } = berging

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
const VERSAMELING = 'volgJesusWeke'

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

const basis = () =>
  `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${VERSAMELING}`

/* ── Hoeveel mense die program DOEN ──
 *
 * Een heelgetal, en niks anders van daardie dokument nie. Dewald wil dit op die
 * e-boekblad by die gratis-weggegee-som tel: elke mens wat VOLG JESUS doen, is
 * R280 se materiaal wat hy nie betaal het nie.
 *
 * Dit is `doen`, nie `begin` nie. `begin` tel WEEK-beginne — dieselfde mens tel
 * weer wanneer hy Week 2 oopmaak — en 'n mens-telling wat stadig opblaas, is
 * presies die soort getal wat later soos 'n feit aangehaal word terwyl dit dit
 * nie is nie. Sien api/_volgJesusTelVelde.js.
 *
 * Val dit om, is die antwoord 0 en nie 'n fout nie. Die e-boekblad se getalle
 * mag nooit op 'n teller wag nie. */
async function kryDoen(kop) {
  try {
    const r = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/tellers/volgJesus`,
      { headers: kop },
    )
    if (!r.ok) return 0
    const j = await r.json()
    const w = ((j.fields || {}).doen || {}).integerValue
    const n = Number(w)
    return Number.isInteger(n) && n >= 0 ? n : 0
  } catch { return 0 }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ fout: 'net GET' })
  }
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=600')

  let token
  try { token = await kryToken() }
  catch (e) {
    console.error('[vj openbaar]', e && e.message)
    /* 'n Leë program, nie 'n 500. Val Firestore om, moet die kaart op Luister
       eenvoudig nie wys nie — 'n foutboodskap op die tuisblad is erger as
       stilte. */
    return res.status(200).json({ klaar: 0, binnekort: null, weke: [] })
  }
  const kop = { Authorization: `Bearer ${token}` }

  /* ── Een week ─────────────────────────────────────────────────────── */
  const gevra = (req.query || {}).week
  if (gevra !== undefined && gevra !== '') {
    const naam = dokNaam(gevra)
    /* 'n Onmoontlike nommer kry dieselfde antwoord as 'n ongepubliseerde
       week: niks. Nie 'n 400 nie — 'n foutkode is 'n antwoord, en ons wil
       niks vertel oor wat bestaan nie. */
    if (!naam) return res.status(200).json({ week: null })
    try {
      const r = await fetch(`${basis()}/${naam}`, { headers: kop })
      if (!r.ok) return res.status(200).json({ week: null })
      return res.status(200).json({ week: openbareWeek(uitFirestore(await r.json())) })
    } catch (e) {
      console.error('[vj openbaar week]', e && e.message)
      return res.status(200).json({ week: null })
    }
  }

  /* ── Die lys ──────────────────────────────────────────────────────── */
  try {
    const r = await fetch(`${basis()}?pageSize=100`, { headers: kop })
    if (!r.ok) return res.status(200).json({ klaar: 0, binnekort: null, weke: [] })
    const j = await r.json()
    const rou = (j.documents || []).map(uitFirestore).filter(Boolean)

    const nommers = gepubliseerdeNommers(rou)
    const klaar = tot(nommers)

    /* Net nommer en titel, en net die AANEENLOPENDE lopie vanaf week 1. Die
       volle week kom eers wanneer iemand hom oopmaak; en 'n week wat oorkant
       'n gat lê, word nie gelys nie, want dan sou die app 'n skakel wys na 'n
       plek waar niemand kan kom nie. */
    const weke = rou
      .filter(w => w.gepubliseer === true && Number(w.weeknommer) <= klaar)
      .map(w => ({ weeknommer: Number(w.weeknommer), titel: String(w.titel || '') }))
      .sort((a, b) => a.weeknommer - b.weeknommer)

    const doen = await kryDoen(kop)
    return res.status(200).json({ klaar, binnekort: binnekort(nommers), weke, doen })
  } catch (e) {
    console.error('[vj openbaar lys]', e && e.message)
    return res.status(200).json({ klaar: 0, binnekort: null, weke: [], doen: 0 })
  }
}
