/* Die ENGELSE e-posse: die templates, en die draad deur die twee eindpunte.
 *
 * Die belangrikste ding hier is nie die woorde nie — dit is dat 'n Engelse
 * boek of skenking na `emailListEn` gaan en NOOIT na `emailList` nie, en dat
 * 'n Afrikaanse een presies die ou pad loop. Daarvoor sit 'n vals Firestore en
 * 'n vals Resend agter die egte eindpunte.
 *
 *   node api/_eposEngels.toets.mjs
 */
import { createRequire } from 'node:module'
import crypto from 'node:crypto'
import { isEngels } from '../src/data/engelsBoeke.js'

const require = createRequire(import.meta.url)
const E = require('./_eposEngels.js')

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}
const waar = (n, k) => is(n, !!k, true)
const vals = (n, k) => is(n, !!k, false)

/* Woorde wat net in die AFRIKAANSE e-posse staan. Een hiervan in 'n Engelse
   e-pos beteken die verkeerde sjabloon het deurgeglip. */
const AFRIKAANS = ['Jou gratis', 'Laai af', 'Dankie', 'Seënwense', 'Goeiedag', 'Maandelikse Vennoot', 'Eenmalige', 'ondersteuning']

console.log('\n── Die lys is apart ──')
{
  is('die Engelse lys se naam', E.ENGELSE_LYS, 'emailListEn')
  vals('nooit die Afrikaanse lys nie', E.ENGELSE_LYS === 'emailList')
}

console.log('\n── isEngelseTaal is woord vir woord isEngels ──')
{
  for (const t of ['en', 'EN', ' english ', 'Engels', 'eng', 'af', '', null, undefined, 'fr', 'english!']) {
    is(`pariteit: ${JSON.stringify(t)}`, E.isEngelseTaal(t), isEngels({ taal: t }))
  }
}

console.log('\n── Die boek-e-pos ──')
{
  const m = E.boekEpos({ titel: 'Restless Thoughts', pdfUrl: 'https://x.test/b.pdf' })
  waar('Engelse onderwerp', m.onderwerp.startsWith('Your free e-book'))
  waar('dra die titel', m.html.includes('Restless Thoughts'))
  waar('dra die PDF', m.html.includes('https://x.test/b.pdf'))
  waar('steun wys na /english', m.html.includes('dewaldscheepers.com/english'))
  vals('NIE na die Afrikaanse steunblad nie', m.html.includes('/go/support'))
  for (const w of AFRIKAANS) vals(`geen Afrikaans: "${w}"`, m.html.includes(w) || m.onderwerp.includes(w))

  const s = E.boekEpos({ titel: 'X', pdfUrl: null })
  waar('sonder PDF: "coming soon"', s.onderwerp.includes('coming soon'))
  vals('sonder PDF: geen aflaai-knoppie', s.html.includes('📥 Download'))

  /* 'n Titel uit Firestore beland in HTML. */
  const h = E.boekEpos({ titel: '<script>x</script>', pdfUrl: null })
  vals('titel word ontsnap', h.html.includes('<script>'))
}

console.log('\n── Die dankie-e-posse ──')
{
  for (const [naam, m] of [['skenking', E.skenkDankie()], ['vennoot', E.vennootDankie()]]) {
    waar(`${naam}: Engelse onderwerp`, /^Thank you/.test(m.onderwerp))
    for (const w of AFRIKAANS) vals(`${naam}: geen Afrikaans "${w}"`, m.html.includes(w))
  }
}

/* ── Die draad: 'n vals Firestore + Resend ──────────────────── */
const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })
process.env.FIREBASE_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' })
process.env.FIREBASE_CLIENT_EMAIL = 'toets@x.iam.gserviceaccount.com'
process.env.FIREBASE_PROJECT_ID = 'toets'
process.env.RESEND_API_KEY = 'rk'

let roepe = []
function vervangFetch(boekTaal) {
  roepe = []
  globalThis.fetch = async (url, opts = {}) => {
    const u = String(url)
    roepe.push({ url: u, method: opts.method || 'GET', body: opts.body || '' })
    const json = (o, status = 200) => ({ ok: status < 300, status, json: async () => o, text: async () => JSON.stringify(o) })
    if (u.includes('oauth2.googleapis.com')) return json({ access_token: 't' })
    if (u.includes('/documents/books/')) {
      const fields = { title: { stringValue: 'Boek X' }, pdfUrl: { stringValue: 'https://x.test/b.pdf' } }
      if (boekTaal) fields.taal = { stringValue: boekTaal }
      return json({ fields })
    }
    if (u.includes('/documents/freeDownloads/') && (opts.method || 'GET') === 'GET') return json({}, 404)
    if (u.includes('/documents/stats/') && (opts.method || 'GET') === 'GET') return json({ fields: {} })
    return json({ ok: true })
  }
}
function vangRes() {
  const r = { kode: 0, liggaam: null }
  r.status = k => { r.kode = k; return r }
  r.json = o => { r.liggaam = o; return r }
  r.send = o => { r.liggaam = o; return r }
  r.setHeader = () => {}
  r.end = () => r
  return r
}
const geskryfNa = () => roepe.filter(c => c.method === 'PATCH' && /\/documents\/emailList(En)?\//.test(c.url))
  .map(c => c.url.match(/\/documents\/(emailList(?:En)?)\//)[1])
const resend = () => roepe.filter(c => c.url.includes('api.resend.com')).map(c => JSON.parse(c.body))

console.log('\n── free-book-download: n ENGELSE boek ──')
{
  vervangFetch('en')
  const h = require('./free-book-download.js')
  const res = vangRes()
  await h({ method: 'POST', body: { email: 'a@b.co', bookId: 'restless-1', consent: true } }, res)
  is('200', res.kode, 200)
  is('net die Engelse lys geskryf', geskryfNa(), ['emailListEn'])
  const e = resend()
  is('een e-pos', e.length, 1)
  waar('Engelse onderwerp', e[0] && e[0].subject.startsWith('Your free e-book'))
  waar('die teller tel steeds (stats/ebooks_given)', roepe.some(c => c.method === 'PATCH' && c.url.includes('/stats/ebooks_given')))
}

console.log('\n── free-book-download: n AFRIKAANSE boek loop die ou pad ──')
{
  vervangFetch(null)
  const h = require('./free-book-download.js')
  const res = vangRes()
  await h({ method: 'POST', body: { email: 'a@b.co', bookId: 'toksies', consent: true } }, res)
  is('net die Afrikaanse lys geskryf', geskryfNa(), ['emailList'])
  const e = resend()
  waar('Afrikaanse onderwerp', e[0] && e[0].subject.startsWith('Jou gratis e-boek'))
}

const wag = () => new Promise(r => setTimeout(r, 30))

console.log('\n── payfast-itn: n ENGELSE skenking ──')
{
  vervangFetch(null)
  const h = require('./payfast-itn.js')
  await h({ method: 'POST', body: { payment_status: 'COMPLETE', custom_str1: 'a@b.co', custom_str2: 'skenking', custom_str3: 'en' } }, vangRes())
  await wag()
  is('Engelse lys', geskryfNa(), ['emailListEn'])
  waar('Engelse dankie', resend()[0] && resend()[0].subject.startsWith('Thank you'))
}

console.log('\n── payfast-itn: n AFRIKAANSE skenking loop die ou pad ──')
{
  vervangFetch(null)
  const h = require('./payfast-itn.js')
  await h({ method: 'POST', body: { payment_status: 'COMPLETE', custom_str1: 'a@b.co', custom_str2: 'skenking' } }, vangRes())
  await wag()
  is('Afrikaanse lys', geskryfNa(), ['emailList'])
  is('Afrikaanse dankie', resend()[0] && resend()[0].subject, 'Dankie vir jou ondersteuning 🙏')
}

console.log('\n── payfast-itn: n ENGELSE vennoot ──')
{
  vervangFetch(null)
  const h = require('./payfast-itn.js')
  await h({ method: 'POST', body: { token: 'sub-1', payment_status: 'COMPLETE', email_address: 'a@b.co', custom_str3: 'en' } }, vangRes())
  await wag()
  is('Engelse lys', geskryfNa(), ['emailListEn'])
  waar('Engelse welkom', resend()[0] && resend()[0].subject.startsWith('Thank you for becoming'))
}

console.log('\n── payfast-itn: n AFRIKAANSE vennoot loop die ou pad ──')
{
  vervangFetch(null)
  const h = require('./payfast-itn.js')
  await h({ method: 'POST', body: { token: 'sub-2', payment_status: 'COMPLETE', email_address: 'a@b.co' } }, vangRes())
  await wag()
  is('Afrikaanse lys', geskryfNa(), ['emailList'])
  is('Afrikaanse welkom', resend()[0] && resend()[0].subject, "Dankie dat jy 'n Hoop-Vennoot geword het 🙏")
}

console.log(`\n${reg} reg, ${val} vals\n`)
if (val) process.exit(1)
