/* ── PayFast se geheime sleutels leef op die BEDIENER ──
 *
 * Dewald, 27 November 2026: PayFast het hom gevra om sy wagwoord, sy
 * "passphrase" en sy "merchant key" te vervang. Die passphrase het in
 * `src/utils/payfast.js` gestaan — in die app se kode, wat enigiemand in die
 * blaaier kan oopmaak. Dit is presies die fout wat CLAUDE.md se "Geheime" vyf
 * keer beskryf, en dit is die sesde.
 *
 * Nou:
 *   · die app stuur die betaling se velde na `/api/payfast-teken`;
 *   · hierdie lêer sit die merchant-besonderhede by, keur elke veld, en teken
 *     dit met `PAYFAST_PASSPHRASE` uit Vercel se omgewing;
 *   · die app stuur die getekende vorm na PayFast, soos altyd.
 *
 * En die ITN (PayFast se "betaling ontvang"-boodskap aan ons bediener) word nou
 * GEKEUR voordat iets gebeur. Daar was geen kontrole nie: enigiemand kon 'n vals
 * "COMPLETE" na `/api/payfast-itn` stuur en 'n dankie-e-pos of 'n aankoop-rekord
 * laat uitgaan. `isEgteItn` vra eers die handtekening, en val dit, PayFast self
 * (`/eng/query/validate`) — 'n egte boodskap kom deur een van die twee.
 *
 * Suiwer waar dit kan, sodat `_payfast.toets.mjs` dit sonder 'n bediener keur. */

const crypto = require('crypto')

const PAYFAST_URL      = 'https://www.payfast.co.za/eng/process'
const VALIDEER_URL     = 'https://www.payfast.co.za/eng/query/validate'
const MERCHANT_ID_VAST = '26753445'   // nie geheim nie — dit staan op elke kwitansie

/* PayFast se EIE volgorde vir 'n betaalversoek. Die handtekening word oor die
   velde in hierdie volgorde bereken, en die vorm word in dieselfde volgorde
   gebou — dan stem die twee altyd ooreen, wat die app ook al stuur. */
const VOLGORDE = [
  'merchant_id', 'merchant_key', 'return_url', 'cancel_url', 'notify_url',
  'name_first', 'name_last', 'email_address',
  'm_payment_id', 'amount', 'item_name', 'item_description',
  'custom_str1', 'custom_str2', 'custom_str3',
  'subscription_type', 'billing_date', 'recurring_amount', 'frequency', 'cycles',
]

/* Wat die APP mag stuur. merchant_id, merchant_key en signature kom NOOIT van
   die app af nie. */
const VAN_DIE_APP = new Set(VOLGORDE.filter(k => k !== 'merchant_id' && k !== 'merchant_key'))

function phpUrlencode(val) {
  return encodeURIComponent(String(val).trim())
    .replace(/%20/g, '+')
    .replace(/[!'()*~]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())
}

/* Die handtekening van 'n BETAALVERSOEK: leë velde word uitgelaat (PayFast se
   reël), dan die wagwoordfrase heel agter. */
function handtekening(velde, passphrase) {
  let str = Object.entries(velde)
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
    .map(([k, v]) => `${k}=${phpUrlencode(v)}`)
    .join('&')
  if (passphrase) str += `&passphrase=${phpUrlencode(passphrase)}`
  return crypto.createHash('md5').update(str).digest('hex')
}

const BEDRAG = /^\d{1,7}\.\d{2}$/

function isOnsAdres(url) {
  try {
    const u = new URL(String(url))
    if (u.protocol === 'http:' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1')) return true
    if (u.protocol !== 'https:') return false
    const h = u.hostname.toLowerCase()
    return h === 'dewaldscheepers.com' || h.endsWith('.dewaldscheepers.com') || h.endsWith('.vercel.app') || h === 'localhost'
  } catch { return false }
}

/* Bou die getekende vorm. `invoer` kom van die app (onvertrou), `env` is
   process.env. Gee { ok, velde, aksie } of { ok:false, kode, fout }. */
function bouBetaling(invoer, env = process.env) {
  const sleutel    = String(env.PAYFAST_MERCHANT_KEY || '').trim()
  const passphrase = String(env.PAYFAST_PASSPHRASE || '').trim()
  if (!sleutel || !passphrase) {
    return { ok: false, kode: 503, fout: 'PayFast is nie op die bediener opgestel nie (PAYFAST_MERCHANT_KEY / PAYFAST_PASSPHRASE).' }
  }
  if (!invoer || typeof invoer !== 'object' || Array.isArray(invoer)) {
    return { ok: false, kode: 400, fout: 'Geen betaling ontvang nie.' }
  }

  const skoon = {}
  for (const [k, v] of Object.entries(invoer)) {
    if (!VAN_DIE_APP.has(k)) continue
    if (v === undefined || v === null) continue
    const s = String(v).trim()
    if (!s) continue
    if (/[\u0000-\u001f\u007f]/.test(s)) return { ok: false, kode: 400, fout: `Ongeldige ${k}.` }
    skoon[k] = s.slice(0, k === 'item_name' ? 100 : 255)
  }

  if (!BEDRAG.test(skoon.amount || '') || Number(skoon.amount) <= 0) return { ok: false, kode: 400, fout: 'Ongeldige bedrag.' }
  if (skoon.recurring_amount && !BEDRAG.test(skoon.recurring_amount)) return { ok: false, kode: 400, fout: 'Ongeldige maandbedrag.' }
  for (const k of ['return_url', 'cancel_url', 'notify_url']) {
    if (!isOnsAdres(skoon[k])) return { ok: false, kode: 400, fout: `Ongeldige ${k}.` }
  }
  if (!/\/api\/payfast-itn$/.test(new URL(skoon.notify_url).pathname)) return { ok: false, kode: 400, fout: 'Ongeldige notify_url.' }
  if (!skoon.item_name) return { ok: false, kode: 400, fout: 'Geen item_name nie.' }

  const alles = { merchant_id: String(env.PAYFAST_MERCHANT_ID || MERCHANT_ID_VAST).trim(), merchant_key: sleutel, ...skoon }
  const velde = {}
  for (const k of VOLGORDE) if (alles[k] !== undefined) velde[k] = alles[k]
  velde.signature = handtekening(velde, passphrase)
  return { ok: true, velde, aksie: PAYFAST_URL }
}

/* Die ITN se parameterstring, in die volgorde waarin PayFast dit gestuur het,
   ALLES behalwe `signature` (ook leë velde — PayFast se ITN-reël). */
function itnString(data) {
  return Object.entries(data || {})
    .filter(([k]) => k !== 'signature')
    .map(([k, v]) => `${k}=${phpUrlencode(v == null ? '' : v)}`)
    .join('&')
}

function handtekeningKlop(data, passphrase) {
  if (!data || !data.signature) return false
  let str = itnString(data)
  if (passphrase) str += `&passphrase=${phpUrlencode(passphrase)}`
  const verwag = crypto.createHash('md5').update(str).digest('hex')
  const kry    = String(data.signature).toLowerCase()
  if (kry.length !== verwag.length) return false
  return crypto.timingSafeEqual(Buffer.from(kry), Buffer.from(verwag))
}

/* Is hierdie ITN werklik van PayFast? Eers die handtekening (geen netwerk);
   klop dit nie (of is daar nog geen passphrase op die bediener), vra PayFast
   self. `haal` is inspuitbaar vir die toetse. */
async function isEgteItn(data, { env = process.env, haal = fetch, tydgrens = 4000 } = {}) {
  if (!data || typeof data !== 'object') return { egte: false, hoe: 'leeg' }
  const passphrase = String(env.PAYFAST_PASSPHRASE || '').trim()
  if (passphrase && handtekeningKlop(data, passphrase)) return { egte: true, hoe: 'handtekening' }
  try {
    const beheer = typeof AbortController !== 'undefined' ? new AbortController() : null
    const t = beheer ? setTimeout(() => beheer.abort(), tydgrens) : null
    const r = await haal(VALIDEER_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    itnString(data),
      ...(beheer ? { signal: beheer.signal } : {}),
    })
    if (t) clearTimeout(t)
    const teks = (await r.text()).trim()
    if (r.ok && teks === 'VALID') return { egte: true, hoe: 'payfast' }
    return { egte: false, hoe: 'payfast-weier' }
  } catch {
    return { egte: false, hoe: 'payfast-onbereikbaar' }
  }
}

module.exports = { bouBetaling, isEgteItn, handtekening, handtekeningKlop, itnString, phpUrlencode, VOLGORDE, PAYFAST_URL, VALIDEER_URL }
