/* ────────────────────────────────────────────────────────────
   Die groei-oorsig.

     POST /api/sorg-meet { gebeurtenis, bron }   → oop, tel een op
     GET  /api/sorg-meet                          → die trechter (admin)

   Dewald se punt 18. Wat gemeet word en wat NOOIT, staan in
   `src/data/sorgMeet.js` — suiwer, met 124 toetse.

   ── Hoekom dit nie `api/tel-sorg.js` is nie ──

   Daardie een is CommonJS (`api/package.json` sê so vir `.js`) en kan dus nie
   uit `src/` invoer nie. Sy drie getalle — oop, vorm, gestuur — bly presies
   soos hulle is; hulle het 'n geskiedenis en 'n mens kan hulle oor maande
   heen vergelyk. Hierdie lêer is `.mjs` en deel die witlys met die skerm.

   ── Die POST is OOP ──

   Presies soos `tel-toestemming.js` en die installasie-teller. Gewone mense
   roep dit en hulle het geen wagwoord nie.

   Daarom stuur die kliënt NOOIT 'n veldnaam nie — hy stuur 'n gebeurtenis en
   'n bron, en die name word uit twee witlyste gebou. Wie 'n `fieldPath` mag
   kies, mag enige veld op daardie dokument skryf, insluitend een wat 'n ander
   telling oorskryf. Dieselfde reël as `api/_volgJesusTelVelde.js`.

   Die GET is toe: hierdie getalle staan nêrens op 'n skerm nie, en dit is met
   opset. 'n Publieke teller op 'n blad waar mense oor hul huwelike skryf, is
   'n wedstryd.

   ── Wat op die dokument staan ──

   Heelgetalle. Geen naam, geen toestel-id, geen tydstempel per mens, geen
   plasing-id. Daar is niks om aan 'n mens te koppel nie.
   ──────────────────────────────────────────────────────────── */

import { veldVir, bronVeld, keurGebeurtenis, trechter } from '../src/data/sorgMeet.js'

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
const DOK = 'tellers/sorgMeet'

/* Die admin-hek staan op EEN plek, en die vergelyking is in konstante tyd.
   Sien CLAUDE.md: 'n geheim wat op sewe plekke vergelyk word, is een wat op
   ses plekke agterbly wanneer dit verander. */
/* `_geheim.js` is CommonJS (api/package.json sê so vir .js). 'n Verstek-invoer
   uit 'n ESM-lêer gee die hele `module.exports`. */
import geheim from './_geheim.js'
const { magAdminDing } = geheim

async function token() {
  const { default: crypto } = await import('node:crypto')
  const nou = Math.floor(Date.now() / 1000)
  const kop = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const eis = Buffer.from(JSON.stringify({
    iss: process.env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    exp: nou + 3600,
    iat: nou,
  })).toString('base64url')
  const teken = crypto.createSign('RSA-SHA256')
  teken.update(`${kop}.${eis}`)
  const handtekening = teken.sign(
    (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'), 'base64url')
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${kop}.${eis}.${handtekening}`,
    }),
  })
  const d = await r.json()
  if (!d.access_token) throw new Error('geen toegangstoken')
  return d.access_token
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Sorg-Geheim')
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    if (!magAdminDing(req)) return res.status(401).json({ fout: 'Nee.' })
    try {
      const t = await token()
      const r = await fetch(
        `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${DOK}`,
        { headers: { Authorization: `Bearer ${t}` } })
      /* Nog nooit geskryf nie is nie 'n fout nie — dit is nulle. */
      if (!r.ok) return res.status(200).json(trechter({}))
      const d = await r.json()
      const plat = {}
      for (const [k, v] of Object.entries((d.fields || {}))) {
        plat[k] = parseInt(v.integerValue || '0', 10)
      }
      return res.status(200).json(trechter(plat))
    } catch (e) {
      return res.status(500).json({ fout: String(e && e.message) })
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ fout: 'Method Not Allowed' })
  }

  let lyf = req.body
  if (typeof lyf === 'string') { try { lyf = JSON.parse(lyf) } catch { lyf = null } }
  if (!lyf || typeof lyf !== 'object') return res.status(400).json({ fout: 'geen data nie' })

  /* Die kliënt stuur 'n GEBEURTENIS, nooit 'n veldnaam nie. */
  if (!keurGebeurtenis(lyf.gebeurtenis)) {
    return res.status(400).json({ fout: 'onbekende gebeurtenis' })
  }

  /* Watter velde optel. Die bron word net by 'besoek' getel — sou elke
     gebeurtenis sy bron optel, sou een mens se sessie die bron ses keer tel en
     dan lieg die verhouding tussen die bronne. */
  const velde = [veldVir(lyf.gebeurtenis)]
  if (lyf.gebeurtenis === 'besoek') velde.push(bronVeld(lyf.bron))

  try {
    const t = await token()
    const r = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writes: velde.map(veld => ({
            transform: {
              document: `projects/${PROJECT_ID}/databases/(default)/documents/${DOK}`,
              fieldTransforms: [{ fieldPath: veld, increment: { integerValue: '1' } }],
            },
          })),
        }),
      })
    if (!r.ok) return res.status(500).json({ fout: 'HTTP ' + r.status })
    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(500).json({ fout: String(e && e.message) })
  }
}
