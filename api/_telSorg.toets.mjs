/* Toets vir /api/tel-sorg.

   Twee dinge kan hier verkeerd loop en albei is stil:

     'n Vreemdeling wat 'n willekeurige veld op daardie dokument skryf, of
     'n vreemdeling wat die getalle LEES. Die getalle self is onskuldig,
     maar 'n stil blad is niks wat buite hoef te wees nie.

       node api/_telSorg.toets.mjs
*/

import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

/* Die admin-geheim moet bestaan VOOR _geheim.js ingelaai word. */
process.env.SORG_ADMIN_GEHEIM = 'n-lang-genoeg-toetsgeheim'

/* 'n Weggooi-sleutel net vir hierdie lopie. Sonder een gooi crypto by die
   ONDERTEKENING, voor enige fetch, en dan toets 'n mens niks. Dit raak
   nooit Google nie: elke fetch hieronder word onderskep. */
import { generateKeyPairSync } from 'node:crypto'
const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
process.env.FIREBASE_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' })
process.env.FIREBASE_CLIENT_EMAIL = 'toets@voorbeeld.iam.gserviceaccount.com'

const telSorg = require('./tel-sorg.js')
const { veldVir, VELDE, DOK } = telSorg

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL  ${naam}\n       kry ${JSON.stringify(kry)}\n       wag ${JSON.stringify(wag)}`) }
}

console.log('\n── Watter velde bestaan ──\n')

is('die drie sporte van die trechter', VELDE, ['oop', 'vorm', 'gestuur'])
is('en die dokument', DOK, 'tellers/sorg')

is('oop',      veldVir({ wat: 'oop' }),     'oop')
is('vorm',     veldVir({ wat: 'vorm' }),    'vorm')
is('gestuur',  veldVir({ wat: 'gestuur' }), 'gestuur')

console.log('\n── Wat geweier moet word ──\n')

is('niks',                 veldVir(undefined), null)
is('leeg',                 veldVir({}), null)
is("'n onbekende naam",    veldVir({ wat: 'iets' }), null)
is('hoofletters',          veldVir({ wat: 'Oop' }), null)
/* 'n Veld wat nie in die lys is nie, mag nooit deurkom nie — anders skryf
   iemand met 'n script 'n willekeurige veld op daardie dokument. */
is("'n Firestore-pad",     veldVir({ wat: 'a.b' }), null)
is('__proto__',            veldVir({ wat: '__proto__' }), null)
is('constructor',          veldVir({ wat: 'constructor' }), null)
is('toString',             veldVir({ wat: 'toString' }), null)
is("'n getal",             veldVir({ wat: 3 }), null)
is("'n voorwerp",          veldVir({ wat: { oop: 1 } }), null)
is("'n string as liggaam", veldVir('oop'), null)

console.log('\n── Die eindpunt ──\n')

function valsAntwoord() {
  const a = { kode: null, koppe: {}, lyf: null }
  a.setHeader = (k, v) => { a.koppe[k.toLowerCase()] = v }
  a.status = k => { a.kode = k; return a }
  a.json = o => { a.lyf = o; return a }
  a.send = b => { a.lyf = b; return a }
  a.end = () => a
  return a
}

const egteFetch = globalThis.fetch
async function metFetch(f, doen) {
  globalThis.fetch = f
  try { return await doen() } finally { globalThis.fetch = egteFetch }
}

/* Niks hiervan raak Google aan nie: elke fetch word onderskep. */
const geenNet = async () => { throw new Error('daar mag geen netwerk-oproep wees nie') }

{
  const r = valsAntwoord()
  await metFetch(geenNet, () => telSorg({ method: 'POST', body: { wat: 'iets' } }, r))
  is("'n onbekende telling gee 400", r.kode, 400)
}

{
  const r = valsAntwoord()
  await metFetch(geenNet, () => telSorg({ method: 'DELETE', body: {} }, r))
  is('DELETE word geweier', r.kode, 405)
}

{
  /* Die belangrikste een: LEES sonder die geheim. */
  const r = valsAntwoord()
  await metFetch(geenNet, () => telSorg({ method: 'GET', headers: {} }, r))
  is('GET sonder die geheim gee 401', r.kode, 401)
}

{
  const r = valsAntwoord()
  await metFetch(geenNet, () => telSorg({ method: 'GET', headers: { 'x-sorg-geheim': 'verkeerd' } }, r))
  is('GET met die verkeerde geheim gee 401', r.kode, 401)
}

{
  /* Nooit geskryf nie is nulle, nie 'n fout nie — anders lyk die admin stukkend
     op die dag waarop dit aangeskakel word. */
  const r = valsAntwoord()
  await metFetch(async (u) => {
    if (String(u).includes('oauth2')) return { json: async () => ({ access_token: 't' }) }
    return { ok: false, status: 404, text: async () => 'not found' }
  }, () => telSorg({ method: 'GET', headers: { 'x-sorg-geheim': process.env.SORG_ADMIN_GEHEIM } }, r))
  is("'n dokument wat nog nie bestaan nie gee nulle", [r.kode, r.lyf], [200, { oop: 0, vorm: 0, gestuur: 0 }])
}

{
  const r = valsAntwoord()
  await metFetch(async (u) => {
    if (String(u).includes('oauth2')) return { json: async () => ({ access_token: 't' }) }
    return {
      ok: true, status: 200,
      json: async () => ({ fields: {
        oop:     { integerValue: '412' },
        vorm:    { integerValue: '37' },
        gestuur: { integerValue: '9' },
      } }),
    }
  }, () => telSorg({ method: 'GET', headers: { 'x-sorg-geheim': process.env.SORG_ADMIN_GEHEIM } }, r))
  is('die drie getalle kom deur', r.lyf, { oop: 412, vorm: 37, gestuur: 9 })
}

{
  /* Die skryf moet EEN increment op EEN veld wees, en niks anders nie. */
  let gestuurLyf = null
  const r = valsAntwoord()
  await metFetch(async (u, o) => {
    if (String(u).includes('oauth2')) return { json: async () => ({ access_token: 't' }) }
    gestuurLyf = JSON.parse(o.body)
    return { ok: true, status: 200, text: async () => '' }
  }, () => telSorg({ method: 'POST', body: { wat: 'vorm' } }, r))
  is('POST gee 200', r.kode, 200)
  is('een skryf', gestuurLyf.writes.length, 1)
  const t = gestuurLyf.writes[0].transform
  is('op tellers/sorg', /\/documents\/tellers\/sorg$/.test(t.document), true)
  is('een veldverandering', t.fieldTransforms.length, 1)
  is('en dit is +1 op vorm', t.fieldTransforms[0], { fieldPath: 'vorm', increment: { integerValue: '1' } })
}

{
  /* 'n Liggaam wat as 'n string aankom — Vercel doen dit soms. */
  let gestuurLyf = null
  const r = valsAntwoord()
  await metFetch(async (u, o) => {
    if (String(u).includes('oauth2')) return { json: async () => ({ access_token: 't' }) }
    gestuurLyf = JSON.parse(o.body)
    return { ok: true, status: 200, text: async () => '' }
  }, () => telSorg({ method: 'POST', body: '{"wat":"gestuur"}' }, r))
  is("'n string-liggaam werk ook", gestuurLyf.writes[0].transform.fieldTransforms[0].fieldPath, 'gestuur')
}

{
  const r = valsAntwoord()
  await metFetch(async () => { throw new Error('die net is af') },
    () => telSorg({ method: 'POST', body: { wat: 'oop' } }, r))
  is("'n dooie net gee 500, nie 'n omval nie", r.kode, 500)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
