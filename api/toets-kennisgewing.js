/* POST /api/toets-kennisgewing   { token }
 *
 * Stuur EEN egte kennisgewing na EEN foon, en sê wat FCM geantwoord het.
 *
 * Dit is die enigste eerlike toets wat bestaan. Daar is geen "is hierdie
 * token lewendig"-navraag by Google nie; 'n mens leer dit eers wanneer 'n
 * stuur `UNREGISTERED` teruggee. Alles anders — 'n groen merkie, 'n
 * `permission === 'granted'`, selfs 'n boodskap-id uit 'n droëlopie — het
 * al gelieg.
 *
 * ── Wie mag dit roep ──
 *
 * Enigiemand, maar net vir 'n token wat ONS REEDS HET. Die versoek dra geen
 * geheim nie, want dit word deur die app self geroep wanneer 'n mens sy eie
 * knoppie druk, en 'n geheim in `src/` is geen geheim nie.
 *
 * Die hek is dat die token in `fcm_tokens` moet staan. 'n Token is 'n lang
 * ondeursigtige string van Google wat niemand kan raai of opnoem nie, en die
 * boodskap se woorde staan HIER vas — daar is niks om in te spuit nie. Die
 * ergste wat iemand met 'n gesteelde token kan doen, is daardie een mens een
 * keer dieselfde vaste sinnetjie stuur.
 *
 * ── Wat dit BUITEN stuur ook doen ──
 *
 * Is die token dood, vee ons die dokument uit. Anders probeer die
 * oggendlopie dit elke dag weer, en dit is presies hoe daar 2 170 dooies in
 * die versameling beland het.
 */
const crypto = require('crypto')
const { geldigeToken, lesUitslag, UITSLAG_WOORDE, moetUitvee } = require('./_toetsStuur.js')

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'

async function getAccessToken() {
  const now    = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const claim  = Buffer.from(JSON.stringify({
    iss:   process.env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/firebase.messaging https://www.googleapis.com/auth/datastore',
    aud:   'https://oauth2.googleapis.com/token',
    exp:   now + 3600,
    iat:   now,
  })).toString('base64url')

  const sleutel = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  const teken   = crypto.createSign('RSA-SHA256')
  teken.update(`${header}.${claim}`)
  const handtekening = teken.sign(sleutel, 'base64url')

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion:  `${header}.${claim}.${handtekening}`,
    }),
  })
  if (!r.ok) throw new Error(`oauth ${r.status}`)
  const j = await r.json()
  return j.access_token
}

/* Ken ons hierdie token? Die dokument se naam IS die token, dus is dit een
   trefslag en geen soektog nie. */
async function kenOnsHom(token, accessToken) {
  const naam = encodeURIComponent(token)
  const r = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/fcm_tokens/${naam}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  return r.ok
}

async function veeUit(token, accessToken) {
  const naam = encodeURIComponent(token)
  await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/fcm_tokens/${naam}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } },
  ).catch(() => {})
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ fout: 'net POST' })
  }

  const lyf   = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {})
  const token = geldigeToken(lyf.token)
  if (!token) return res.status(400).json({ fout: 'geen geldige token' })

  try {
    const accessToken = await getAccessToken()

    if (!await kenOnsHom(token, accessToken)) {
      /* Ons ken hom nie. Dit is nie 'n fout van die mens nie — sy token het
         verander en die app moet weer inteken. */
      return res.status(200).json({
        ok: false, staat: 'onbekend',
        boodskap: 'Hierdie foon was nie ingeteken nie. Ons het dit reggestel — probeer weer.',
      })
    }

    /* PRESIES dieselfde vorm as die oggendboodskap — dieselfde prent,
       dieselfde webpush-kopstukke. 'n Toets met 'n ANDER boodskap sou 'n
       ander vraag beantwoord het: dit is juis die vorm van die boodskap wat
       al 'n derde van die lys stilweg laat misluk het. */
    const r = await fetch(`https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          token,
          notification: {
            title: 'Daaglikse Hoop',
            body:  'Kennisgewings werk. Jy is gereed vir môre se boodskap.',
          },
          data: {
            image: 'https://dewaldscheepers.com/notification-image.jpg',
            url:   'https://dewaldscheepers.com/',
          },
          webpush: { headers: { Urgency: 'high', TTL: '86400' } },
        },
      }),
    })

    let foutKode = null
    if (!r.ok) {
      const fout = await r.json().catch(() => ({}))
      foutKode = fout && fout.error && fout.error.status
    }

    const uitslag = lesUitslag({ ok: r.ok, status: r.status, foutKode })
    if (moetUitvee(uitslag.staat)) await veeUit(token, accessToken)

    return res.status(200).json({
      ...uitslag,
      boodskap: UITSLAG_WOORDE[uitslag.staat] || UITSLAG_WOORDE.fout,
    })
  } catch (e) {
    console.error('[toets-kennisgewing]', e && e.message)
    return res.status(200).json({
      ok: false, staat: 'fout', boodskap: UITSLAG_WOORDE.fout,
    })
  }
}

function safeJson(s) { try { return JSON.parse(s) } catch { return {} } }
