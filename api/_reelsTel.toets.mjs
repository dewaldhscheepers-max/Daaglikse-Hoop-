/* Die voer se tellings, met 'n vals Firestore agter hulle.
 *
 * Twee dinge wat hierdie toets moet vashou:
 *
 *   · die kliënt kies NOOIT 'n veldnaam nie. Die eindpunt is oop, en wie 'n
 *     `fieldPath` mag stuur, mag enige veld op daardie dokument skryf —
 *     `__proto__` en `constructor` inbegrepe, wat albei waarheidswaardig is;
 *   · 'n clip se id word gekeur met DIESELFDE `geldigeId` as die kliënt s'n, en
 *     'n slegte id mag nooit die TOTAAL kos nie. Die mens het werklik gedeel.
 *
 * Loop met:  node api/_reelsTel.toets.mjs
 */
import crypto from 'node:crypto'

/* 'n EGTE sleutel, want die eindpunt teken 'n JWT en `crypto.sign()` gooi op 'n
   string wat nie 'n sleutel is nie. Met 'n vals sleutel gee elke toets 'n 500 en
   die toets meet dan niks. */
const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })
process.env.FIREBASE_CLIENT_EMAIL = 'toets@voorbeeld.com'
process.env.FIREBASE_PRIVATE_KEY = privateKey
  .export({ type: 'pkcs8', format: 'pem' })
  .replace(/\n/g, '\\n')
process.env.FIREBASE_PROJECT_ID = 'toets-projek'

const { default: handler } = await import('./reels-tel.mjs')

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}

function maakRes() {
  const r = { kode: 0, lyf: null, koppe: {} }
  r.status = k => { r.kode = k; return r }
  r.json = b => { r.lyf = b; return r }
  r.setHeader = (k, v) => { r.koppe[k] = v }
  return r
}

/* Die vals Google: een token, en dan onthou ons die commit se liggaam. */
function saai() {
  const gestuur = []
  globalThis.fetch = async (adres, opsies) => {
    const u = String(adres)
    if (u.includes('oauth2.googleapis.com')) {
      return { ok: true, json: async () => ({ access_token: 'teken' }) }
    }
    gestuur.push(JSON.parse((opsies && opsies.body) || '{}'))
    return { ok: true, json: async () => ({}) }
  }
  return gestuur
}

async function loop(lyf, metode) {
  const gestuur = saai()
  const res = maakRes()
  await handler({ method: metode || 'POST', body: lyf, headers: {}, query: {} }, res)
  return { res, gestuur }
}

function skrywesVan(gestuur) {
  return (gestuur[0] && gestuur[0].writes) || []
}

console.log('\n── Die totale ──')
{
  const { res, gestuur } = await loop({ wat: 'gedeel' })
  is('200', res.kode, 200)
  const w = skrywesVan(gestuur)
  is('een skrywe sonder n clip', w.length, 1)
  is('op die tellers-dokument', /documents\/tellers\/reels$/.test(w[0].transform.document), true)
  is('dit tel `gedeel`', w[0].transform.fieldTransforms[0].fieldPath, 'gedeel')
  is('met een', w[0].transform.fieldTransforms[0].increment.integerValue, '1')
  is('geen kas', res.koppe['Cache-Control'], 'no-store')
}
{
  const { res, gestuur } = await loop({ wat: 'oopgemaak' })
  is('oopgemaak tel ook', res.kode, 200)
  is('op dieselfde dokument', skrywesVan(gestuur).length, 1)
  is('en dit is `oopgemaak`', skrywesVan(gestuur)[0].transform.fieldTransforms[0].fieldPath, 'oopgemaak')
}

console.log('\n── Die telling PER CLIP ──')
{
  const { res, gestuur } = await loop({ wat: 'gedeel', klip: 'dh-0413' })
  is('200', res.kode, 200)
  is('dit se dat die clip getel is', res.lyf.klip, true)
  const w = skrywesVan(gestuur)
  is('TWEE skrywes, in EEN commit', w.length, 2)
  is('die tweede is die clip', /documents\/reels\/dh-0413$/.test(w[1].transform.document), true)
  is('en dit tel `gedeel`', w[1].transform.fieldTransforms[0].fieldPath, 'gedeel')
  is('albei in dieselfde versoek', gestuur.length, 1)
}
{
  /* "Oopgemaak" word NOOIT per clip getel nie — dit sou begin lyk soos 'n
     profiel van wat rondgestuur word. */
  const { res, gestuur } = await loop({ wat: 'oopgemaak', klip: 'dh-0413' })
  is('oopgemaak word NIE per clip getel nie', skrywesVan(gestuur).length, 1)
  is('en dit se so', res.lyf.klip, false)
}

console.log('\n── n Slegte clip-id mag nooit die TOTAAL kos nie ──')
for (const slegte of ['', '   ', 'a/b', 'x'.repeat(200), null, 0, [], {}, true]) {
  const { res, gestuur } = await loop({ wat: 'gedeel', klip: slegte })
  is(`klip=${JSON.stringify(slegte)}: die totaal tel steeds`, res.kode, 200)
  is(`klip=${JSON.stringify(slegte)}: maar net EEN skrywe`, skrywesVan(gestuur).length, 1)
}

console.log('\n── Die veldnaam kom NOOIT van die kliënt nie ──')
for (const boos of ['__proto__', 'constructor', 'toString', 'hasOwnProperty', 'valueOf']) {
  const { res, gestuur } = await loop({ wat: boos })
  is(`wat=${boos}: 400`, res.kode, 400)
  is(`wat=${boos}: niks gestuur nie`, gestuur.length, 0)
}
for (const boos of ['iets', 'gedeel2', 'GEDEEL', 1, null, undefined, [], {}]) {
  const { res } = await loop({ wat: boos })
  is(`wat=${JSON.stringify(boos)}: 400`, res.kode, 400)
}

console.log('\n── Wat verkeerd kan loop ──')
{
  const { res } = await loop({ wat: 'gedeel' }, 'GET')
  is('GET: 405', res.kode, 405)
}
{
  const { res } = await loop(null)
  is('geen liggaam: 400', res.kode, 400)
}
{
  const { res } = await loop('nie json nie')
  is('n string wat nie JSON is nie: 400', res.kode, 400)
}
{
  /* 'n String-liggaam wat WEL JSON is, moet werk — Vercel gee dit soms so. */
  const { res } = await loop(JSON.stringify({ wat: 'gedeel', klip: 'abc' }))
  is('n JSON-string werk', res.kode, 200)
}
{
  globalThis.fetch = async () => { throw new Error('af') }
  const res = maakRes()
  await handler({ method: 'POST', body: { wat: 'gedeel' }, headers: {}, query: {} }, res)
  is('Firestore is af: 500, en dit breek niks', res.kode, 500)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
