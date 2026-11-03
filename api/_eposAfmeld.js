/* ────────────────────────────────────────────────────────────
   Die afmeld-knoppie onder die weeklikse e-pos.

   Dewald, 3 November 2026: *"Is it possible to put an unsubscribe button on
   the emails that i send out in admin every week. But it needs to work
   1000000%."*

   Tot nou toe was die enigste pad af 'n e-pos aan Dewald, en dan 'n reël met
   die hand in `_eposGeblok.js`. Dit werk, maar dit hang aan een mens se
   inmandjie. Hier is die knoppie, en vier dinge maak dit betroubaar:

   1. ELKE adres kry sy eie skakel, met 'n HANDTEKENING (HMAC). Sonder die
      handtekening kon enigiemand enige ander mens van die lys afhaal deur net
      'n adres in die skakel te tik.

   2. Die skakel self meld NIEMAND af nie — 'n GET wys net 'n bladsy met een
      knoppie. Skanderders (Outlook se "Safe Links", 'n regering se
      e-posfilter) maak elke skakel in 'n e-pos oop voordat die mens dit sien.
      'n Skakel wat by oopmaak afmeld, sou mense stilweg afmeld wat nooit iets
      gedruk het nie. Die afmelding self is 'n POST.

   3. Gmail en Apple se EIE "Unsubscribe"-knoppie bo-aan die e-pos werk ook:
      die `List-Unsubscribe`- en `List-Unsubscribe-Post`-koppe (RFC 8058).
      Daardie knoppie stuur 'n POST na dieselfde adres, sonder 'n bladsy.

   4. Die blok staan by die STUUR, nie by die lys nie (`stuurBondel`), net
      soos `_eposGeblok.js`. 'n Adres kom weer by `emailList` sodra daardie
      mens 'n boek aflaai; 'n afmelding is 'n besluit oor die MENS en oorleef
      dit. En kan die afmeld-lys nie gelees word nie, word daar NIKS gestuur
      nie (`haalAfgemeld` gooi) — 'n weeklikse e-pos wat 'n dag later gaan, is
      beter as een wat 'n afgemelde mens kry.

   Die dokument se naam is die SHA-256 van die adres (dieselfde `sleutel()` as
   die blok-lys), en die adres self word nie gestoor nie: om te weet of
   HIERDIE adres afgemeld is, is al wat ons hoef te weet.
   ──────────────────────────────────────────────────────────── */

const crypto = require('crypto')
const { sleutel } = require('./_eposGeblok')
const { tekenSleutel } = require('./_geheim')

const WERF = 'https://www.dewaldscheepers.com'
const VERSAMELING = 'afgemeld'

function skoon(adres) {
  return String(adres || '').toLowerCase().trim()
}

/* Die handtekening se sleutel word AFGELEI van CRON_SECRET, met 'n eie
   etiket, sodat 'n afmeld-handtekening nooit ook 'n aflaai-handtekening kan
   wees nie (dieselfde geheim teken albei). */
function afmeldTeken(adres) {
  const sl = crypto.createHmac('sha256', tekenSleutel()).update('afmeld-v1').digest()
  return crypto.createHmac('sha256', sl).update(skoon(adres)).digest('base64url').slice(0, 32)
}

function isRegteTeken(adres, teken) {
  const a = Buffer.from(String(teken || ''))
  const b = Buffer.from(afmeldTeken(adres))
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

function afmeldSkakel(adres) {
  const e = Buffer.from(skoon(adres)).toString('base64url')
  return `${WERF}/api/afmeld?e=${e}&t=${afmeldTeken(adres)}`
}

/* Lees `e` terug. Gee '' as dit nie 'n adres is nie. */
function adresUit(e) {
  try {
    const a = skoon(Buffer.from(String(e || ''), 'base64url').toString('utf8'))
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a) && a.length < 255 ? a : ''
  } catch { return '' }
}

/* Die voet wat onder ELKE e-pos kom, per ontvanger. Gewone teks en 'n
   onderstreepte skakel — 'n mens wat af wil, moet dit kan vind, en dit hoef
   nie te skree nie. */
function afmeldVoet(adres) {
  const s = afmeldSkakel(adres)
  return `
    <div style="font-family:Georgia,serif;max-width:600px;margin:14px auto 0;text-align:center;">
      <p style="color:#999;font-size:12px;line-height:1.6;margin:0;">
        Jy kry hierdie e-pos omdat jy by Daaglikse Hoop ingeteken het.<br>
        <a href="${s}" style="color:#777;text-decoration:underline;">Meld af — ek wil nie meer hierdie e-posse kry nie</a>
      </p>
    </div>`
}

/* Die koppe vir Gmail/Apple se eie knoppie (RFC 8058). */
function afmeldKoppe(adres) {
  return {
    'List-Unsubscribe': `<${afmeldSkakel(adres)}>, <mailto:info@dewaldscheepers.com?subject=Meld%20my%20af>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  }
}

const fsBasis = projectId =>
  `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`

/* Al die afgemelde sleutels. GOOI as dit nie gelees kan word nie — die
   oproeper mag dan NIE stuur nie. */
async function haalAfgemeld(projectId, token) {
  const stel = new Set()
  let pageToken = ''
  do {
    const url = `${fsBasis(projectId)}/${VERSAMELING}?pageSize=300&mask.fieldPaths=datum${pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : ''}`
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!r.ok) throw new Error(`Kon nie die afmeld-lys lees nie (${r.status}) — niks is gestuur nie`)
    const data = await r.json()
    for (const d of data.documents || []) stel.add(String(d.name).split('/').pop())
    pageToken = data.nextPageToken || ''
  } while (pageToken)
  return stel
}

async function isAfgemeld(projectId, token, adres) {
  const r = await fetch(`${fsBasis(projectId)}/${VERSAMELING}/${sleutel(adres)}`,
    { headers: { Authorization: `Bearer ${token}` } })
  if (r.status === 404) return false
  if (!r.ok) throw new Error(`lees ${r.status}`)
  return true
}

async function meldAf(projectId, token, adres, bron) {
  const r = await fetch(`${fsBasis(projectId)}/${VERSAMELING}/${sleutel(adres)}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: {
      datum: { timestampValue: new Date().toISOString() },
      bron:  { stringValue: String(bron || 'blad').slice(0, 20) },
    } }),
  })
  if (!r.ok) throw new Error(`skryf ${r.status}`)
}

async function tekenWeer(projectId, token, adres) {
  const r = await fetch(`${fsBasis(projectId)}/${VERSAMELING}/${sleutel(adres)}`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
  })
  if (!r.ok && r.status !== 404) throw new Error(`vee ${r.status}`)
}

module.exports = {
  afmeldTeken, isRegteTeken, afmeldSkakel, adresUit, afmeldVoet, afmeldKoppe,
  haalAfgemeld, isAfgemeld, meldAf, tekenWeer, VERSAMELING,
}
