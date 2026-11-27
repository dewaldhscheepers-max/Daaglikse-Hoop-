/* Loop met:  node api/_payfast.toets.mjs
 * PayFast se sleutels op die bediener (api/_payfast.js): die ondertekening,
 * die keuring van wat die app stuur, en die ITN-kontrole. */
import { createRequire } from 'module'
import crypto from 'crypto'
const require = createRequire(import.meta.url)
const P = require('./_payfast.js')

let reg = 0, val = 0
const is = (n, kry, wag) => { if (JSON.stringify(kry) === JSON.stringify(wag)) reg++; else { val++; console.log(`  VAL  ${n}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`) } }
const waar = (n, c) => is(n, !!c, true)

const ENV = { PAYFAST_MERCHANT_KEY: 'toetssleutel', PAYFAST_PASSPHRASE: 'Toets Frase!' }
const BASIS = 'https://www.dewaldscheepers.com'
const skenking = {
  return_url: `${BASIS}/?payment=success&type=donation&books=skenking&em=a%40b.co`,
  cancel_url: `${BASIS}/?payment=cancel`,
  notify_url: `${BASIS}/api/payfast-itn`,
  email_address: 'a@b.co', amount: '50.00', item_name: 'Skenking aan Daaglikse Hoop',
  custom_str1: 'a@b.co', custom_str2: 'skenking',
}

/* Die OU kliënt se algoritme, woord vir woord uit src/utils/payfast.js voor
   27 November 2026 — PayFast het daardie handtekeninge aanvaar. */
function ouPhp(v) { return encodeURIComponent(String(v).trim()).replace(/%20/g, '+').replace(/[!'()*~]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase()) }
function ouHandtekening(params, frase) {
  let s = Object.entries(params).map(([k, v]) => `${k}=${ouPhp(v)}`).join('&')
  if (frase) s += `&passphrase=${ouPhp(frase)}`
  return crypto.createHash('md5').update(s).digest('hex')
}

console.log('── Sonder sleutels op die bediener ──')
is('geen passphrase: 503', P.bouBetaling(skenking, { PAYFAST_MERCHANT_KEY: 'x' }).kode, 503)
is('geen merchant key: 503', P.bouBetaling(skenking, { PAYFAST_PASSPHRASE: 'x' }).kode, 503)

console.log('── Die handtekening ──')
const uit = P.bouBetaling(skenking, ENV)
waar('slaag', uit.ok)
is('aksie is PayFast', uit.aksie, 'https://www.payfast.co.za/eng/process')
is('merchant_id uit die kode', uit.velde.merchant_id, '26753445')
is('merchant_key uit die OMGEWING', uit.velde.merchant_key, 'toetssleutel')
const sonderSig = { ...uit.velde }; delete sonderSig.signature
is('presies dieselfde handtekening as die ou kliënt (PayFast aanvaar dit)', uit.velde.signature, ouHandtekening(sonderSig, ENV.PAYFAST_PASSPHRASE))
is('die volgorde is PayFast s\'n', Object.keys(uit.velde), ['merchant_id', 'merchant_key', 'return_url', 'cancel_url', 'notify_url', 'email_address', 'amount', 'item_name', 'custom_str1', 'custom_str2', 'signature'])
is('PAYFAST_MERCHANT_ID oorskryf die vaste een', P.bouBetaling(skenking, { ...ENV, PAYFAST_MERCHANT_ID: '999' }).velde.merchant_id, '999')

console.log('── Die app kan nie die merchant of handtekening stuur nie ──')
const boos = P.bouBetaling({ ...skenking, merchant_key: 'vals', merchant_id: '1', signature: 'abc', passphrase: 'x' }, ENV)
is('merchant_key bly die bediener s\'n', boos.velde.merchant_key, 'toetssleutel')
is('merchant_id bly die bediener s\'n', boos.velde.merchant_id, '26753445')
waar('passphrase nooit in die velde', !('passphrase' in boos.velde))
is('handtekening is die bediener s\'n', boos.velde.signature, uit.velde.signature)

console.log('── Die keuring ──')
is('bedrag sonder sente', P.bouBetaling({ ...skenking, amount: '50' }, ENV).kode, 400)
is('bedrag nul', P.bouBetaling({ ...skenking, amount: '0.00' }, ENV).kode, 400)
is('negatief', P.bouBetaling({ ...skenking, amount: '-5.00' }, ENV).kode, 400)
is('vreemde notify_url', P.bouBetaling({ ...skenking, notify_url: 'https://boos.net/api/payfast-itn' }, ENV).kode, 400)
is('notify_url na n ander pad', P.bouBetaling({ ...skenking, notify_url: `${BASIS}/api/iets` }, ENV).kode, 400)
is('dewaldscheepers.com.boos.net', P.bouBetaling({ ...skenking, return_url: 'https://dewaldscheepers.com.boos.net/' }, ENV).kode, 400)
is('http na n vreemde gasheer', P.bouBetaling({ ...skenking, cancel_url: 'http://www.dewaldscheepers.com/' }, ENV).kode, 400)
waar('n Vercel-voorskou mag', P.bouBetaling({ ...skenking, return_url: 'https://dh-abc.vercel.app/?x=1' }, ENV).ok)
is('beheerkarakter', P.bouBetaling({ ...skenking, item_name: 'a\u0000b' }, ENV).kode, 400)
is('geen item_name', P.bouBetaling({ ...skenking, item_name: '' }, ENV).kode, 400)
is('item_name afgekap by 100', P.bouBetaling({ ...skenking, item_name: 'x'.repeat(300) }, ENV).velde.item_name.length, 100)
is('nie n voorwerp nie', P.bouBetaling(null, ENV).kode, 400)

console.log('── n Maandelikse Hoop-Vennoot ──')
const sub = P.bouBetaling({
  return_url: `${BASIS}/?payment=success&type=subscription`, cancel_url: `${BASIS}/?payment=cancel&type=subscription`,
  notify_url: `${BASIS}/api/payfast-itn`, amount: '100.00', item_name: 'Maandelikse Hoop-Vennoot',
  subscription_type: '1', billing_date: '2026-12-27', recurring_amount: '100.00', frequency: '3', cycles: '0',
  email_address: 'v@b.co',   // die ou kliënt het dit AGTER gestuur; die bediener sit dit op sy plek
}, ENV)
waar('slaag', sub.ok)
is('email_address voor amount, intekening-velde agter', Object.keys(sub.velde).slice(0, 7), ['merchant_id', 'merchant_key', 'return_url', 'cancel_url', 'notify_url', 'email_address', 'amount'])
is('cycles 0 bly (nie leeg nie)', sub.velde.cycles, '0')
is('ongeldige maandbedrag', P.bouBetaling({ ...skenking, recurring_amount: 'R100' }, ENV).kode, 400)

console.log('── Die ITN: is dit PayFast? ──')
const itn = { m_payment_id: '', pf_payment_id: '123', payment_status: 'COMPLETE', item_name: 'Skenking', amount_gross: '50.00', email_address: 'a@b.co', custom_str1: 'a@b.co', custom_str2: 'skenking', merchant_id: '26753445' }
const sig = crypto.createHash('md5').update(P.itnString(itn) + '&passphrase=' + P.phpUrlencode(ENV.PAYFAST_PASSPHRASE)).digest('hex')
waar('egte handtekening klop', P.handtekeningKlop({ ...itn, signature: sig }, ENV.PAYFAST_PASSPHRASE))
waar('bedrag verander: klop nie', !P.handtekeningKlop({ ...itn, amount_gross: '5000.00', signature: sig }, ENV.PAYFAST_PASSPHRASE))
waar('geen handtekening: klop nie', !P.handtekeningKlop(itn, ENV.PAYFAST_PASSPHRASE))
waar('leë veld (m_payment_id) tel in die ITN-string', P.itnString(itn).startsWith('m_payment_id=&'))

const nooit = async () => { throw new Error('mag nie roep nie') }
is('handtekening klop: geen netwerk nodig', await P.isEgteItn({ ...itn, signature: sig }, { env: ENV, haal: nooit }), { egte: true, hoe: 'handtekening' })
const geldig = async (u, o) => { is('PayFast word gevra by validate', u, P.VALIDEER_URL); is('met die ITN-string', o.body, P.itnString(itn)); return { ok: true, text: async () => 'VALID' } }
is('handtekening klop nie, PayFast sê VALID: egte', await P.isEgteItn({ ...itn, signature: 'x'.repeat(32) }, { env: ENV, haal: geldig }), { egte: true, hoe: 'payfast' })
is('PayFast sê INVALID: vals', await P.isEgteItn({ ...itn, signature: 'x'.repeat(32) }, { env: ENV, haal: async () => ({ ok: true, text: async () => 'INVALID' }) }), { egte: false, hoe: 'payfast-weier' })
is('PayFast onbereikbaar: vals', await P.isEgteItn({ ...itn }, { env: ENV, haal: async () => { throw new Error('af') } }), { egte: false, hoe: 'payfast-onbereikbaar' })
is('nog geen passphrase op die bediener: PayFast besluit', await P.isEgteItn({ ...itn, signature: sig }, { env: {}, haal: async () => ({ ok: true, text: async () => 'VALID' }) }), { egte: true, hoe: 'payfast' })
is('leeg', await P.isEgteItn(null, { env: ENV, haal: nooit }), { egte: false, hoe: 'leeg' })

console.log('── Geen geheim in die app se kode nie ──')
const fs = await import('fs')
const kliënt = fs.readFileSync(new URL('../src/utils/payfast.js', import.meta.url), 'utf8')
waar('geen ou passphrase in src/utils/payfast.js', !kliënt.includes('DaaglikseHoop5320'))
waar('geen ou merchant key in src/utils/payfast.js', !kliënt.includes('acdbj7mteeup0'))
waar('geen md5 meer in die kliënt', !/from 'md5'/.test(kliënt))

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
