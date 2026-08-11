/* Loop met:  node api/_eposStuur.toets.mjs

   Op 11 Augustus het 'n uitstuur 2383 gestuur en 600 laat val. Ses honderd is
   presies ses bondels van honderd. Die oorsaak was nie ses honderd slegte
   adresse nie -- dit was sowat ses, en elkeen het sy hele bondel saamgesleep.

   Hierdie toets sit 'n vals Resend agter die kode en hou twee dinge vas:
   die adres-keuring laat nie meer deur wat Resend gaan weier nie, en 'n
   bondel wat val, sleep nie meer die res saam nie. */

import { createRequire } from 'node:module'
const vereis = createRequire('/home/user/Daaglikse-Hoop-/api/')

const { ADRES, ontleedLys } = vereis('./_eposLys.js')
const { stuurBondel }       = vereis('./_eposStuur.js')

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (kry === wag) reg++
  else { val++; console.log(`  VAL  ${naam} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

console.log('\n── Adresse wat MOET deurkom ──')
for (const a of [
  'piet@gmail.com',
  'dellie.vandeventer@gmail.com',
  'zenithms@mweb.co.za',
  'a.b-c@sub.domein.co.za',
  "o'brien@example.com",
  'naam+etiket@gmail.com',
  'x@y.io',
  'jan_van_wyk99@vodamail.co.za',
]) is(a, ADRES.test(a), true)

console.log('\n── Wat Resend weier, en wat ons dus ook moet weier ──')
for (const [a, waarom] of [
  ['piet@gmail..com',   'twee punte in die domein'],
  ['piet@gmail.com;',   'kommapunt aan die einde'],
  ['piet@gmail.com,',   'komma aan die einde'],
  ['piet@gmail.com.',   'punt aan die einde'],
  ['.piet@gmail.com',   "begin met 'n punt"],
  ['piet.@gmail.com',   "plaaslike deel eindig op 'n punt"],
  ['piet@gmail.c0m',    "TLD met 'n syfer"],
  ['pïet@gmail.com',    'nie-ASCII in die plaaslike deel'],
  ['piet@gmäil.com',    'nie-ASCII in die domein'],
  ['piet@gmail',        'geen TLD'],
  ['piet@.gmail.com',   "domein begin met 'n punt"],
  ['piet@-gmail.com',   "domein begin met 'n koppelteken"],
  ['piet gmail.com',    'geen krulstert'],
  ['piet@@gmail.com',   'twee krulsterte'],
  ['piet@gmail.c',      'TLD van een letter'],
]) is(`${a}  (${waarom})`, ADRES.test(a), false)

console.log('\n── Die lys se ontleding ──')
const dok = e => ({ fields: { email: { stringValue: e } } })
const lys = ontleedLys([
  dok('EEN@Gmail.com'), dok('een@gmail.com'),   // dieselfde ná kleinletters
  dok('twee@gmail.com'),
  dok('drie@gmail..com'),                        // die soort wat 'n bondel doodmaak
  dok(''), { fields: {} },
])
is('drie unieke adresse', lys.adresse.length, 2)
is('kleinletters en ontdubbeling', lys.adresse.includes('een@gmail.com'), true)
is('die stukkende een is uit', lys.adresse.some(a => a.includes('..')), false)

/* ── Die vals Resend ──
   Die bondel-eindpunt val sodra een adres 'sleg' in het. Die enkel-eindpunt
   weier net daardie een. Dit is presies hoe Resend hom gedra. */
const egteFetch = globalThis.fetch
let bondelOproepe = 0, enkelOproepe = 0
globalThis.fetch = async (url, opsies) => {
  const lyf = JSON.parse(opsies.body)
  if (String(url).endsWith('/emails/batch')) {
    bondelOproepe++
    if (lyf.some(m => m.to.includes('sleg'))) {
      return { ok: false, json: async () => ({ message: 'Invalid `to` field.' }) }
    }
    return { ok: true, json: async () => ({}) }
  }
  enkelOproepe++
  if (lyf.to.includes('sleg')) {
    return { ok: false, json: async () => ({ message: 'Invalid `to` field.' }) }
  }
  return { ok: true, json: async () => ({}) }
}

const gemeen = { sleutel: 'x', van: 'a@b.c', antwoordNa: 'a@b.c', onderwerp: 'S', html: '<p>H</p>' }

console.log("\n── 'n Skoon bondel ──")
bondelOproepe = enkelOproepe = 0
let u = await stuurBondel({ ...gemeen, adresse: ['a@x.com', 'b@x.com', 'c@x.com'] })
is('almal gestuur', u.gestuur, 3)
is('niks misluk nie', u.misluk, 0)
is('een enkele versoek vir almal', bondelOproepe, 1)
is('geen een-vir-een nodig nie', enkelOproepe, 0)

console.log('\n── Een slegte adres tussen honderd ──')
bondelOproepe = enkelOproepe = 0
const honderd = Array.from({ length: 100 }, (_, i) => `mens${i}@x.com`)
honderd[42] = 'sleg@@x.com'
u = await stuurBondel({ ...gemeen, adresse: honderd })
is('99 kom deur', u.gestuur, 99)
is('net 1 misluk', u.misluk, 1)
is('die bondel is een keer probeer', bondelOproepe, 1)
is('en toe 100 keer een-vir-een', enkelOproepe, 100)
is('die slegte een word by die naam genoem', u.slegtes.length === 1 && u.slegtes[0].adres === 'sleg@@x.com', true)
is("met 'n rede daarby", /Invalid/.test(u.slegtes[0].rede), true)

console.log('\n── Die ou gedrag sou dit anders gedoen het ──')
/* Voor hierdie regstelling: gestuur 0, misluk 100. Dit is die hele punt. */
is('nie meer 0 gestuur nie', u.gestuur === 0, false)
is('nie meer 100 misluk nie', u.misluk === 100, false)

globalThis.fetch = egteFetch
console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
