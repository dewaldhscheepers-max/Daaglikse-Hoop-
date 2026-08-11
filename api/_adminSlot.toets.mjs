/* Keur die drie eindpunte se nuwe slot. Geen netwerk, geen Firebase. */
import { createRequire } from 'node:module'
const vereis = createRequire('/home/user/Daaglikse-Hoop-/api/')

process.env.SORG_ADMIN_GEHEIM = 'n-lang-genoeg-geheim-vir-toets'
process.env.CRON_SECRET       = 'n-ander-lang-cron-geheim'

let reg = 0, val = 0
const is = (naam, kry, wag) => {
  if (kry === wag) { reg++ }
  else { val++; console.log(`  VAL  ${naam} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

function valsRes() {
  const r = { kode: null, liggaam: null, koppe: {} }
  r.setHeader = (k, v) => { r.koppe[k] = v }
  r.status = k => { r.kode = k; return r }
  r.json = b => { r.liggaam = b; return r }
  r.send = b => { r.liggaam = b; return r }
  r.end  = () => r
  return r
}

const versoek = (kop, lyf) => ({
  method: 'POST',
  headers: kop,
  query: {},
  body: lyf || {},
})

for (const [naam, pad, geweier] of [
  ['kinder-upload',    './kinder-upload.js',    401],
  ['add-to-campaign',  './add-to-campaign.js',  403],
  ['resend-to-emails', './resend-to-emails.js', 403],
]) {
  const handler = vereis(pad)
  const h = typeof handler === 'function' ? handler : handler.default

  console.log(`\n── ${naam} ──`)

  /* Geen geheim */
  let res = valsRes()
  await h(versoek({}), res)
  is('sonder geheim word geweier', res.kode, geweier)

  /* Die OU pin mag NIE meer werk nie */
  res = valsRes()
  await h(versoek({}, { pin: '2025', emails: ['a@b.c'], bookId: 'x', filename: 'y.jpg', fileBase64: 'AA==' }), res)
  is("die ou pin '2025' werk nie meer nie", res.kode, geweier)

  /* Verkeerde geheim */
  res = valsRes()
  await h(versoek({ 'x-sorg-geheim': 'verkeerd' }), res)
  is('verkeerde geheim word geweier', res.kode, geweier)

  /* Regte geheim — dit moet VERBY die slot kom. Sonder Firebase-veranderlikes
     val dit daarna om, en dit is presies wat bewys die slot oop is. */
  res = valsRes()
  await h(versoek({ 'x-sorg-geheim': process.env.SORG_ADMIN_GEHEIM },
                  { emails: ['a@b.c'], bookId: 'x', filename: 'y.jpg', fileBase64: 'AA==' }), res)
  is('regte geheim kom verby die slot', res.kode !== geweier, true)

  /* CORS moet die kopstuk toelaat, anders keer die blaaier self */
  if (naam === 'kinder-upload') {
    is('CORS laat x-sorg-geheim toe',
       /x-sorg-geheim/.test(res.koppe['Access-Control-Allow-Headers'] || ''), true)
  }
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
