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
/* Elke adres wat WERKLIK by Resend uitgekom het. 'n Blok wat 'n mens uit die
   telling hou maar hom steeds stuur, is geen blok nie — dit is die een ding
   wat hierdie lys kan bewys. */
let gestuurAan = []
globalThis.fetch = async (url, opsies) => {
  const lyf = JSON.parse(opsies.body)
  if (String(url).endsWith('/emails/batch')) {
    bondelOproepe++
    lyf.forEach(m => gestuurAan.push(m.to))
    if (lyf.some(m => m.to.includes('sleg'))) {
      return { ok: false, json: async () => ({ message: 'Invalid `to` field.' }) }
    }
    return { ok: true, json: async () => ({}) }
  }
  enkelOproepe++
  gestuurAan.push(lyf.to)
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

/* ── Die blok-lys ──
 *
 * Op 31 Augustus 2026 het Dewald drie adresse gegee met "verwyder die email
 * addresses dat ek nie aan hulle stuur nie". Die toets wat saak maak, is nie
 * dat die TELLING kleiner word nie — dit is dat daardie adres nooit by
 * Resend uitkom nie, langs watter pad ook al. */
const { isGeblok, sifGeblok } = vereis('./_eposGeblok.js')
const GEBLOK_EEN = 'geralinetb@gmail.com'

console.log('\n── Wie geblok is ──')
is('die adres self', isGeblok(GEBLOK_EEN), true)
is('met hoofletters ook', isGeblok('GeralineTB@Gmail.com'), true)
is('met spasies om', isGeblok('  geralinetb@gmail.com  '), true)
is("'n ander mens nie", isGeblok('piet@gmail.com'), false)
is('leeg is nie geblok nie', isGeblok(''), false)
is('undefined ook nie', isGeblok(undefined), false)
/* 'n Blok mag NIE op 'n voorvoegsel pas nie — daardie soort fout sny stil 'n
   ander mens af wat toevallig 'n langer adres by dieselfde diens het. */
is('nie \'n ander adres met dieselfde begin nie', isGeblok('geralinetb@gmail.com.au'), false)
is('nie sonder die domein nie', isGeblok('geralinetb'), false)

console.log('\n── Die sif ──')
{
  const u = sifGeblok(['a@x.com', GEBLOK_EEN, 'b@x.com'])
  is('twee kom deur', u.adresse.length, 2)
  is('een is geblok', u.geblok, 1)
  is('en die geblokte een is weg', u.adresse.includes(GEBLOK_EEN), false)
}

console.log('\n── stuurBondel stuur NOOIT aan \'n geblokte adres nie ──')
bondelOproepe = enkelOproepe = 0
gestuurAan = []
{
  const u = await stuurBondel({ ...gemeen, adresse: ['a@x.com', GEBLOK_EEN, 'b@x.com'] })
  is('twee gestuur', u.gestuur, 2)
  is('een geblok', u.geblok, 1)
  is('en dit tel NIE as \'n mislukking nie', u.misluk, 0)
  is('die geblokte adres het Resend nooit gesien nie', gestuurAan.includes(GEBLOK_EEN), false)
  is('die ander twee wel', gestuurAan.length, 2)
}

console.log('\n── Ook wanneer die bondel val en dit een-vir-een gaan ──')
/* Dit is die pad wat 'n mens vergeet: die bondel val op 'n slegte adres, die
   kode probeer weer een vir een, en 'n blok wat net bo-aan staan sou hier
   verby wees. */
bondelOproepe = enkelOproepe = 0
gestuurAan = []
{
  const u = await stuurBondel({ ...gemeen, adresse: ['a@x.com', GEBLOK_EEN, 'sleg@@x.com', 'b@x.com'] })
  is('die bondel het geval', bondelOproepe, 1)
  is('drie is een-vir-een geprobeer, nie vier nie', enkelOproepe, 3)
  is('die geblokte adres ook hier nooit', gestuurAan.includes(GEBLOK_EEN), false)
  is('twee kom deur', u.gestuur, 2)
  is('een misluk werklik', u.misluk, 1)
  is('en een is geblok', u.geblok, 1)
}

console.log('\n── \'n Bondel van net geblokte adresse raak Resend glad nie ──')
bondelOproepe = enkelOproepe = 0
gestuurAan = []
{
  const u = await stuurBondel({ ...gemeen, adresse: [GEBLOK_EEN] })
  is('niks gestuur nie', u.gestuur, 0)
  is('niks misluk nie', u.misluk, 0)
  is('een geblok', u.geblok, 1)
  is('geen versoek na Resend hoegenaamd', bondelOproepe + enkelOproepe, 0)
}

console.log('\n── Die lys tel hom apart, nie as \'n fout nie ──')
{
  const lys = ontleedLys([
    { fields: { email: { stringValue: 'piet@gmail.com' } } },
    { fields: { email: { stringValue: 'GeralineTB@gmail.com' } } },
    /* Dieselfde mens, 'n tweede dokument — soos wat werklik gebeur wanneer
       iemand 'n boek kry EN skenk. Dit mag nie twee keer tel nie. */
    { fields: { email: { stringValue: 'geralinetb@gmail.com' } } },
    { fields: { email: { stringValue: 'anna@x.co.za' } } },
  ])
  is('twee bly oor', lys.aktief, 2)
  is('een mens geblok, nie twee nie', lys.geblok, 1)
  is('die tweede dokument tel as \'n duplikaat', lys.duplikate, 1)
  is('en dit is NIE ongeldig nie', lys.ongeldig, 0)
  is('die adres is nie in die lys nie', lys.adresse.includes('geralinetb@gmail.com'), false)
}

console.log('\n── Al drie wat Dewald gegee het ──')
for (const a of ['geralinetb@gmail.com', 'n.s.vivier@gmail.com', 'cjmdebeer1944@gmail.com']) {
  const u = await stuurBondel({ ...gemeen, adresse: [a] })
  is(`${a.replace(/^(.).*(.)@/, '$1…$2@')} kry niks`, u.gestuur, 0)
}

globalThis.fetch = egteFetch
console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
