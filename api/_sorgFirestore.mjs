/* ────────────────────────────────────────────────────────────
   Firestore-toegang vir Pastorale Sorg.

   Hoekom hierdie lêer bestaan, en hoekom dit anders werk as die res van die
   app:

   Die meeste versamelings in hierdie projek laat 'n kliënt direk skryf
   (`allow write: if true` in firestore.rules). Vir "watter stemnota is
   uitgelig" is dit heeltemal reg. Vir 'n muur waar iemand mishandeling of
   selfmoordgedagtes beskryf, is dit nie: dan sou enigiemand elke ongekeurde,
   ongeredigeerde boodskap kon lees.

   Sorg werk dus soos die ranglyste: die kliënt raak NOOIT aan die
   versamelings nie. Die enigste pad in en uit is 'n bediener-funksie met die
   diensrekening.

   Die naam begin met 'n onderstreep sodat Vercel dit nie as 'n eindpunt
   aansien nie — dit is 'n hulpmiddel, nie 'n roete nie.
   ──────────────────────────────────────────────────────────── */

import crypto from 'node:crypto'

export const PROJEK = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
const BASIS = `https://firestore.googleapis.com/v1/projects/${PROJEK}/databases/(default)/documents`

/* ── Die diensrekening se toegangstoken ──
   Een keer per lopie gehaal en dan gehou; 'n koue funksie leef 'n paar
   minute en die token 'n uur. */
let _token = { tot: 0, waarde: null }

export async function kryToken() {
  if (_token.waarde && Date.now() < _token.tot) return _token.waarde

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
  if (!sleutel || !process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error('die diensrekening is nie opgestel nie')
  }

  const teken = crypto.createSign('RSA-SHA256')
  teken.update(`${kop}.${eis}`)
  const jwt = `${kop}.${eis}.${teken.sign(sleutel, 'base64url')}`

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  })
  const d = await r.json()
  if (!d.access_token) throw new Error('geen toegangstoken')

  _token = { waarde: d.access_token, tot: Date.now() + 55 * 60 * 1000 }
  return d.access_token
}

/* ── Firestore se waardevorm, heen en terug ──
   Firestore se REST-API dra elke veld met sy tipe. Dit is lomp om met die
   hand te skryf, dus doen ons dit een keer hier. */
export function naVeld(w) {
  if (w === null || w === undefined) return { nullValue: null }
  if (typeof w === 'boolean') return { booleanValue: w }
  if (typeof w === 'number') {
    return Number.isInteger(w) ? { integerValue: String(w) } : { doubleValue: w }
  }
  if (Array.isArray(w)) return { arrayValue: { values: w.map(naVeld) } }
  if (w instanceof Date) return { timestampValue: w.toISOString() }
  if (typeof w === 'object') {
    return { mapValue: { fields: Object.fromEntries(Object.entries(w).map(([k, v]) => [k, naVeld(v)])) } }
  }
  return { stringValue: String(w) }
}

export function uitVeld(v) {
  if (!v || typeof v !== 'object') return null
  if ('nullValue'    in v) return null
  if ('booleanValue' in v) return v.booleanValue
  if ('integerValue' in v) return Number(v.integerValue)
  if ('doubleValue'  in v) return v.doubleValue
  if ('timestampValue' in v) return v.timestampValue
  if ('stringValue'  in v) return v.stringValue
  if ('arrayValue'   in v) return (v.arrayValue.values || []).map(uitVeld)
  if ('mapValue'     in v) return uitDok({ fields: v.mapValue.fields })
  return null
}

export function uitDok(dok) {
  const uit = {}
  for (const [k, v] of Object.entries((dok && dok.fields) || {})) uit[k] = uitVeld(v)
  if (dok && dok.name) uit.id = dok.name.split('/').pop()
  return uit
}

export function naVelde(o) {
  return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, naVeld(v)]))
}

/* ── Lees, skryf, vee uit ── */

export async function lysDokke(versameling, { grootte = 300 } = {}) {
  const token = await kryToken()
  const r = await fetch(`${BASIS}/${versameling}?pageSize=${grootte}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (r.status === 404) return []          // die versameling bestaan nog nie
  if (!r.ok) throw new Error(`kon ${versameling} nie lees nie (${r.status})`)
  const d = await r.json()
  return (d.documents || []).map(uitDok)
}

export async function leesDok(versameling, id) {
  const token = await kryToken()
  const r = await fetch(`${BASIS}/${versameling}/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (r.status === 404) return null
  if (!r.ok) throw new Error(`kon ${versameling}/${id} nie lees nie (${r.status})`)
  return uitDok(await r.json())
}

/* Skryf 'n hele dokument. Sonder `velde` word alles vervang; met `velde`
   word net daardie velde saamgevoeg. */
export async function skryfDok(versameling, id, data, { velde = null } = {}) {
  const token = await kryToken()
  const masker = (velde || Object.keys(data))
    .map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&')
  const r = await fetch(`${BASIS}/${versameling}/${encodeURIComponent(id)}?${masker}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: naVelde(data) }),
  })
  if (!r.ok) throw new Error(`kon ${versameling}/${id} nie skryf nie (${r.status})`)
  return uitDok(await r.json())
}

export async function veeDok(versameling, id) {
  const token = await kryToken()
  const r = await fetch(`${BASIS}/${versameling}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!r.ok && r.status !== 404) throw new Error(`kon ${versameling}/${id} nie uitvee nie (${r.status})`)
  return true
}

/* ── Wie mag skryf ──

   Nie die kliënt-PIN nie. Daardie PIN staan in die bondel wat elke besoeker
   aflaai; dit hou niemand uit nie. Hier moet 'n egte geheim wees wat net op
   Vercel bestaan en wat Dewald een keer in die admin tik.

   Is die geheim nie opgestel nie, weier ons alles. 'n Stelsel wat oopgaan
   omdat iemand vergeet het om 'n veranderlike te stel, is erger as een wat
   glad nie werk nie. */
export function magSkryf(req) {
  const verwag = process.env.SORG_ADMIN_GEHEIM
  if (!verwag || verwag.length < 16) return { ok: false, rede: 'die admin-geheim is nie opgestel nie' }

  const gegee = (req.headers['x-sorg-geheim'] || '').toString()
  if (!gegee) return { ok: false, rede: 'geen geheim gestuur nie' }

  /* Vergelyking in konstante tyd, sodat 'n mens dit nie letter vir letter
     kan raai deur te meet hoe lank die antwoord vat nie. */
  const a = Buffer.from(gegee)
  const b = Buffer.from(verwag)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, rede: 'verkeerde geheim' }
  }
  return { ok: true }
}
