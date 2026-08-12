/* Toets vir /api/wallpaper.

   Die eindpunt vat 'n URL en gaan haal dit. Dit is die soort ding wat 'n oop
   deurgang word as die hekke stukkend is, en 'n mens sien dit nooit raak nie
   omdat die gewone geval bly werk.

       node api/_wallpaper.toets.mjs
*/

import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const wallpaper = require('./wallpaper.js')
const { veiligeUrl } = wallpaper

let reg = 0, val = 0
function is(naam, kry, wag) {
  const gelyk = JSON.stringify(kry) === JSON.stringify(wag)
  if (gelyk) reg++
  else { val++; console.log(`  VAL  ${naam}\n       kry ${JSON.stringify(kry)}\n       wag ${JSON.stringify(wag)}`) }
}
function isWaar(naam, kry) { is(naam, !!kry, true) }
function isNull(naam, kry) { is(naam, kry, null) }

const EG = 'https://firebasestorage.googleapis.com/v0/b/daaglikse-hoop.firebasestorage.app/o/wallpapers%2Fn1.jpg?alt=media&token=abc-123'

console.log('\n── Die hek: watter URL mag deur ──\n')

isWaar('die egte wallpaper-URL kom deur', veiligeUrl(EG))
is('en dit kom onveranderd terug', veiligeUrl(EG), EG)
isWaar('storage.googleapis.com met ons emmer kom ook deur',
  veiligeUrl('https://storage.googleapis.com/daaglikse-hoop.firebasestorage.app/wp/a.jpg'))

console.log('\n── Wat gekeer moet word ──\n')

isNull('niks',            veiligeUrl(undefined))
isNull('leeg',            veiligeUrl(''))
isNull("'n getal",        veiligeUrl(12345))
isNull("'n voorwerp",     veiligeUrl({ u: EG }))
isNull('gemors',          veiligeUrl('nie eens n url nie'))

/* Die hele rede waarom die hek bestaan: iemand wat die bediener wil gebruik
   om by iets uit te kom wat hy self nie kan bereik nie. */
isNull('die wolk se metadata (SSRF)', veiligeUrl('http://169.254.169.254/latest/meta-data/'))
isNull('en oor https',                veiligeUrl('https://169.254.169.254/latest/meta-data/'))
isNull('localhost',                   veiligeUrl('http://localhost:3000/geheim'))
isNull('die binnenet',                veiligeUrl('https://10.0.0.5/admin'))
isNull('file://',                     veiligeUrl('file:///etc/passwd'))
isNull('http, nie https nie',         veiligeUrl('http://firebasestorage.googleapis.com/v0/b/daaglikse-hoop.firebasestorage.app/o/a.jpg'))
isNull("'n ander webwerf",            veiligeUrl('https://voorbeeld.co.za/prent.jpg'))

/* 'n Ander mens se Google-emmer is nog steeds nie ons emmer nie. */
isNull("iemand anders se Google-emmer",
  veiligeUrl('https://storage.googleapis.com/iemand-anders/prent.jpg'))
isNull('en by firebasestorage ook',
  veiligeUrl('https://firebasestorage.googleapis.com/v0/b/iemand-anders.appspot.com/o/a.jpg'))

/* Die gasheernaam moet PRESIES reg wees. `endsWith` sou hierdie twee deurgelaat
   het, en albei is domeine wat 'n aanvaller self kan registreer. */
isNull('n gasheer wat net so LYK',
  veiligeUrl('https://firebasestorage.googleapis.com.boos.co.za/v0/b/daaglikse-hoop/o/a.jpg'))
isNull('en die emmer as gasheer se voorvoegsel',
  veiligeUrl('https://boosfirebasestorage.googleapis.com/daaglikse-hoop/a.jpg'))

/* Die emmer se naam in die navraag tel nie — net in die pad. */
isNull('die emmer se naam net in die navraagstring',
  veiligeUrl('https://storage.googleapis.com/iemand-anders/a.jpg?x=daaglikse-hoop'))

isNull("'n eindelose URL", veiligeUrl('https://firebasestorage.googleapis.com/v0/b/daaglikse-hoop/o/' + 'a'.repeat(2100)))

console.log('\n── Die eindpunt self ──\n')

function valsAntwoord() {
  const a = { kode: null, koppe: {}, lyf: null, klaar: false }
  a.setHeader = (k, v) => { a.koppe[k.toLowerCase()] = v }
  a.status = k => { a.kode = k; return a }
  a.json = o => { a.lyf = o; a.klaar = true; return a }
  a.send = b => { a.lyf = b; a.klaar = true; return a }
  a.end = () => { a.klaar = true; return a }
  return a
}

const egteFetch = globalThis.fetch
async function metFetch(f, doen) {
  globalThis.fetch = f
  try { return await doen() } finally { globalThis.fetch = egteFetch }
}

const PRENT = Buffer.from('\x89PNG\r\n\x1a\n' + 'x'.repeat(4000), 'binary')
const okPrent = async () => ({
  ok: true,
  status: 200,
  headers: { get: k => (k.toLowerCase() === 'content-type' ? 'image/jpeg' : null) },
  arrayBuffer: async () => PRENT,
})

{
  const r = valsAntwoord()
  await metFetch(okPrent, () => wallpaper({ method: 'GET', query: { u: EG } }, r))
  is('die gewone geval gee 200', r.kode, 200)
  is('met die prent se soort', r.koppe['content-type'], 'image/jpeg')
  is('en die grepe self', Buffer.isBuffer(r.lyf) && r.lyf.length, PRENT.length)
  isWaar('en dit word gekas', /max-age=86400/.test(r.koppe['cache-control'] || ''))
}

{
  const r = valsAntwoord()
  await metFetch(okPrent, () => wallpaper({ method: 'HEAD', query: { u: EG } }, r))
  is('HEAD gee 200 sonder grepe', [r.kode, r.lyf], [200, null])
}

{
  const r = valsAntwoord()
  let geroep = false
  await metFetch(async () => { geroep = true; return okPrent() },
    () => wallpaper({ method: 'POST', query: { u: EG } }, r))
  is('POST word geweier', r.kode, 405)
  is('en niks word gaan haal nie', geroep, false)
}

{
  const r = valsAntwoord()
  let geroep = false
  await metFetch(async () => { geroep = true; return okPrent() },
    () => wallpaper({ method: 'GET', query: { u: 'http://169.254.169.254/' } }, r))
  is("'n geblokte URL gee 400", r.kode, 400)
  is('en die bediener gaan haal NIKS', geroep, false)
}

{
  const r = valsAntwoord()
  await metFetch(async () => ({ ok: false, status: 404, headers: { get: () => null } }),
    () => wallpaper({ method: 'GET', query: { u: EG } }, r))
  is("'n 404 by Firebase word 'n 502", r.kode, 502)
}

{
  /* Firebase gee 'n JSON-fout met 200. Sonder hierdie toets word daardie JSON
     as 'n "prent" gedeel en die mens sien 'n leë lêer. */
  const r = valsAntwoord()
  await metFetch(async () => ({
    ok: true, status: 200,
    headers: { get: () => 'application/json; charset=utf-8' },
    arrayBuffer: async () => Buffer.from('{"error":"nope"}'),
  }), () => wallpaper({ method: 'GET', query: { u: EG } }, r))
  is('JSON met 200 word geweier', r.kode, 415)
}

{
  const r = valsAntwoord()
  await metFetch(async () => ({
    ok: true, status: 200,
    headers: { get: () => 'image/jpeg' },
    arrayBuffer: async () => Buffer.alloc(13 * 1024 * 1024),
  }), () => wallpaper({ method: 'GET', query: { u: EG } }, r))
  is("'n prent van 13 MB word geweier", r.kode, 413)
}

{
  const r = valsAntwoord()
  await metFetch(async () => { throw new Error('die net is af') },
    () => wallpaper({ method: 'GET', query: { u: EG } }, r))
  is("'n dooie net gee 502, nie 'n omval nie", r.kode, 502)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
