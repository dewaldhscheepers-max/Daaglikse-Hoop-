/* Die dankie-e-pos ná 'n skenking: EEN keer, watter pad ook al eerste kom.
 *
 *   node api/_skenkDankie.toets.mjs
 *
 * 'n Vals Firestore + Resend agter die egte kode. Die twee paaie (PayFast se
 * ITN en die app se terugkeer) moet saam presies EEN e-pos gee. */
import { createRequire } from 'node:module'
import crypto from 'node:crypto'
const require = createRequire(import.meta.url)

const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })
process.env.FIREBASE_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' })
process.env.FIREBASE_CLIENT_EMAIL = 'x@y'
process.env.RESEND_API_KEY = 'k'

let reg = 0, val = 0
const ok = (n, c) => { if (c) reg++; else { val++; console.log('  VAL ' + n) } }

let docs = {}, eposse = []
globalThis.fetch = async (u, o = {}) => {
  u = String(u)
  const j = (x, s = 200) => ({ ok: s < 300, status: s, json: async () => x, text: async () => JSON.stringify(x) })
  if (u.includes('oauth2')) return j({ access_token: 't' })
  if (u.includes('resend')) { eposse.push(JSON.parse(o.body)); return j({ id: 'e' }) }
  if (u.includes('firestore')) {
    const pad = u.split('/documents/')[1]
    if ((o.method || 'GET') === 'GET') return docs[pad] ? j({ fields: docs[pad] }) : j({}, 404)
    docs[pad] = JSON.parse(o.body).fields; return j({})
  }
  return j({})
}
const { stuurSkenkDankie, VENSTER_MS } = require('./_skenkDankie.js')
const itn = require('./payfast-itn.js')
const terug = require('./skenk-dankie.js')
const res = () => ({ status(c) { this.c = c; return this }, json(b) { this.b = b; return this }, send(b) { this.b = b; return this } })
const skoon = () => { docs = {}; eposse = [] }

console.log('\n── ITN + terugkeer = EEN e-pos ──')
{
  skoon()
  await itn({ method: 'POST', body: 'payment_status=COMPLETE&custom_str1=Dewald%40voorbeeld.co.za&custom_str2=skenking&amount_gross=10.00&pf_payment_id=1' }, res())
  const r = res(); await terug({ method: 'POST', body: { email: 'dewald@voorbeeld.co.za', tipe: 'donation', taal: 'af' } }, r)
  ok('net een e-pos', eposse.length === 1)
  ok('Afrikaanse onderwerp', eposse[0]?.subject === 'Dankie vir jou ondersteuning 🙏')
  ok('terugkeer sê reeds gestuur', r.b?.rede === 'reeds-gestuur')
}
{
  skoon()   /* andersom: die terugkeer kom eerste, die ITN later */
  await terug({ method: 'POST', body: { email: 'a@b.co', tipe: 'donation', taal: 'en' } }, res())
  await itn({ method: 'POST', body: 'payment_status=COMPLETE&custom_str1=a%40b.co&custom_str2=skenking&custom_str3=en' }, res())
  ok('andersom: steeds een e-pos', eposse.length === 1)
  ok('Engelse onderwerp', eposse[0]?.subject === 'Thank you for your support 🙏')
}

console.log('\n── Net die TERUGKEER (die ITN kom nooit) — die fout van vandag ──')
{
  skoon()
  const r = res(); await terug({ method: 'POST', body: { email: 'a@b.co', tipe: 'subscription', taal: 'en' } }, r)
  ok('e-pos gestuur', eposse.length === 1 && r.b?.gestuur === true)
  ok('Engelse vennoot-dankie', eposse[0]?.subject === 'Thank you for becoming a Hope Partner 🙏')
  skoon()
  await terug({ method: 'POST', body: { email: 'a@b.co', tipe: 'subscription', taal: 'af' } }, res())
  ok('Afrikaanse vennoot-dankie', eposse[0]?.subject === "Dankie dat jy 'n Hoop-Vennoot geword het 🙏")
  ok('Afrikaanse woorde onveranderd', eposse[0]?.html.includes('Dankie dat jy \'n Maandelikse Hoop-Vennoot geword het!'))
}

console.log('\n── "Skenk weer" môre — of ná die venster — kry weer \'n dankie ──')
{
  skoon()
  const t0 = Date.parse('2026-10-10T10:00:00Z')
  await stuurSkenkDankie({ email: 'a@b.co', tipe: 'donation', nou: t0 })
  await stuurSkenkDankie({ email: 'a@b.co', tipe: 'donation', nou: t0 + 5 * 60 * 1000 })
  ok('binne 30 min: geen tweede', eposse.length === 1)
  await stuurSkenkDankie({ email: 'a@b.co', tipe: 'donation', nou: t0 + VENSTER_MS + 1000 })
  ok('ná die venster: weer een', eposse.length === 2)
  await stuurSkenkDankie({ email: 'a@b.co', tipe: 'subscription', nou: t0 + VENSTER_MS + 2000 })
  ok('skenking en vennoot is aparte slotte', eposse.length === 3)
}

console.log('\n── Gemors word geweier ──')
{
  skoon()
  for (const [naam, b] of [['geen e-pos', { tipe: 'donation' }], ['slegte e-pos', { email: 'nie-n-adres', tipe: 'donation' }], ['vreemde tipe', { email: 'a@b.co', tipe: 'ebook' }]]) {
    const r = res(); await terug({ method: 'POST', body: b }, r)
    ok(naam + ': geen e-pos', eposse.length === 0 && r.b?.gestuur === false)
  }
  const r = res(); await terug({ method: 'GET' }, r)
  ok('GET geweier', r.c === 405)
}

console.log('\n── Die uitslag word aangeteken ──')
{
  skoon()
  await terug({ method: 'POST', body: { email: 'a@b.co', tipe: 'donation', taal: 'en' } }, res())
  const rekord = Object.entries(docs).find(([k]) => k.startsWith('skenkings/'))
  ok('skenkings-rekord', rekord && rekord[1].emailSent.booleanValue === true && rekord[1].bron.stringValue === 'terugkeer')
}

console.log(`\n${reg} reg, ${val} vals\n`)
if (val) process.exit(1)
