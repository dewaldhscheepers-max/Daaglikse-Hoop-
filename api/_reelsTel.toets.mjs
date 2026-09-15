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
process.env.SORG_ADMIN_GEHEIM = 'n-geheim-wat-lank-genoeg-is'

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
function saai(lees) {
  const gestuur = []
  globalThis.fetch = async (adres, opsies) => {
    const u = String(adres)
    if (u.includes('oauth2.googleapis.com')) {
      return { ok: true, json: async () => ({ access_token: 'teken' }) }
    }
    gestuur.push(JSON.parse((opsies && opsies.body) || '{}'))
    /* Die LEES: Firestore se batchGet gee 'n ry per dokument. Ons gee die
       skerwe wat `lees` beskryf; die res "bestaan nie", presies soos 'n skerf
       wat nog nooit geskryf is nie. */
    if (u.includes(':batchGet')) {
      const rye = (lees || []).map(velde => ({
        found: {
          fields: Object.fromEntries(
            Object.entries(velde).map(([k, v]) => [k, { integerValue: String(v) }])
          ),
        },
      }))
      return { ok: true, json: async () => rye }
    }
    return { ok: true, json: async () => ({}) }
  }
  return gestuur
}

async function loop(lyf, metode, opsies = {}) {
  const gestuur = saai(opsies.lees)
  const res = maakRes()
  const koppe = opsies.geheim ? { 'x-sorg-geheim': opsies.geheim } : {}
  await handler({ method: metode || 'POST', body: lyf, headers: koppe, query: {} }, res)
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
  /* Op 'n SKERF van `tellers/reels` — skerf 0 IS die ou dokument, dus is albei
     vorme reg. Sien `api/_telSkerwe.js`. */
  is('op n skerf van die tellers-dokument',
     /documents\/tellers\/reels(_s[1-9])?$/.test(w[0].transform.document), true)
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

console.log('\n── WORD DIE VOER GEKYK? ──')
/* Dewald, 15 September 2026: *"i want to make sure this page is actually
   working. so i need you to count how many people click on reels and how many
   videos each person watched."* Die drempels is die antwoord; sien
   `src/data/reelsMeet.js`. */
{
  const { res, gestuur } = await loop({ wat: 'oop' })
  is('n oopmaak tel', res.kode, 200)
  const w = skrywesVan(gestuur)
  is('een skrywe', w.length, 1)
  is('en dit tel `oop`', w[0].transform.fieldTransforms[0].fieldPath, 'oop')
}
for (const n of [1, 3, 5, 10, 25]) {
  const { res, gestuur } = await loop({ wat: `bereik${n}` })
  is(`bereik${n} tel`, res.kode, 200)
  is(`en die veld is bereik${n}`,
     skrywesVan(gestuur)[0].transform.fieldTransforms[0].fieldPath, `bereik${n}`)
}
{
  /* 'n Drempel wat NIE bestaan nie, is nie 'n veld nie. Die eindpunt is oop,
     dus is die witlys die enigste ding tussen 'n vreemdeling en enige veld op
     daardie dokument. */
  for (const boos of ['bereik2', 'bereik0', 'bereik999', 'bereik', 'oopgemaak_x']) {
    const { res } = await loop({ wat: boos })
    is(`${boos}: 400`, res.kode, 400)
  }
}
{
  /* Die drempels is GLOBAAL. 'n Clip-id daarby mag nooit 'n clip-dokument
     aanraak nie — dít sou 'n kyk-telling PER CLIP wees, en dit is die een ding
     wat hierdie voer nooit mag hê nie. */
  const { gestuur } = await loop({ wat: 'bereik5', klip: '7412345678901234567' })
  is('geen tweede skrywe na die clip', skrywesVan(gestuur).length, 1)
}

console.log('\n── Die getalle LEES ──')
{
  const { res } = await loop(null, 'GET')
  is('sonder die geheim: 401', res.kode, 401)
}
{
  const { res } = await loop(null, 'GET', {
    geheim: 'verkeerd-maar-lank-genoeg',
  })
  is('met die verkeerde geheim: 401', res.kode, 401)
}
{
  /* Die skerwe word OPGETEL — dit is die hele punt van die skerwe. */
  const { res } = await loop(null, 'GET', {
    geheim: 'n-geheim-wat-lank-genoeg-is',
    lees: [
      { oop: 100, bereik1: 90, bereik3: 60 },
      { oop: 40,  bereik1: 35, bereik3: 20 },
      { oop: 10 },
    ],
  })
  is('200', res.kode, 200)
  is('die oopmaak-tellings word opgetel', res.lyf.tellers.oop, 150)
  is('en die drempels ook', res.lyf.tellers.bereik1, 125)
  is('en die derde een', res.lyf.tellers.bereik3, 80)
}
{
  /* Nog nooit geskryf nie: elke skerf ontbreek, en dan is alles nul — nie 'n
     fout nie. */
  const { res } = await loop(null, 'GET', { geheim: 'n-geheim-wat-lank-genoeg-is', lees: [] })
  is('n leeg begin is 200', res.kode, 200)
  is('met geen getalle', res.lyf.tellers, {})
}

console.log('\n── Wat verkeerd kan loop ──')
{
  /* Die GET bestaan nou — hy LEES die tellers — maar hy is admin-alleen. Sonder
     die geheim is dit 401 en nie 405 nie. */
  const { res } = await loop({ wat: 'gedeel' }, 'GET')
  is('GET sonder die geheim: 401', res.kode, 401)
}
{
  const { res } = await loop({ wat: 'gedeel' }, 'PUT')
  is('PUT: 405', res.kode, 405)
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
