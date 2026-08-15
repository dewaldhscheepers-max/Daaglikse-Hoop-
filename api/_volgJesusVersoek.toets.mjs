/* Wanneer iemand vra dat sy gemeente hom kontak.
 *
 * Die spanning: ons het deurgaans gese die kerk sien niks persoonliks nie,
 * maar 'n mens kan nie "kontak my" he sonder iets om mee te kontak nie.
 *
 * Die antwoord is nie om die reel te breek nie — dit is om dit PRESIES te
 * stel. Die kerk kry 'n naam en EEN kontakbesonderheid, self ingetik vir
 * daardie doel. Nooit 'n refleksie, 'n joernaal of 'n hartsantwoord nie.
 *
 * Die belangrikste toets hier is die laaste een: wat ook al iemand instuur,
 * net vier velde oorleef.
 */
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { maakVersoek, virDieKerk, skoonTeks, skoonKontak } = require('./_volgJesusVersoek.js')

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

const NOU = '2026-08-15T12:00:00Z'
const GOED = { mylpaal: 'doop', waarde: 'wil', naam: 'Anna Meyer', kontak: 'anna@voorbeeld.co.za' }

console.log('\n── n Geldige versoek ──\n')
{
  const { versoek, fout } = maakVersoek(GOED, NOU)
  is('geen fout nie', fout, undefined)
  is('die naam kom deur',   versoek.naam, 'Anna Meyer')
  is('die kontak ook',      versoek.kontak, 'anna@voorbeeld.co.za')
  is('met die regte opskrif', versoek.opskrif, 'Doopgesprek versoek')
  is('en dit begin onhanteerd', versoek.hanteer, false)
  is('vrae oor doop kry n ander opskrif',
     maakVersoek({ ...GOED, waarde: 'vrae' }, NOU).versoek.opskrif, 'Vrae oor doop')
  is('en die volg-mylpaal ook',
     maakVersoek({ mylpaal: 'volg', waarde: 'ja', naam: 'Jan', kontak: '082 123 4567' }, NOU)
       .versoek.opskrif, 'Wil oor sy volgende tree praat')
}

console.log('\n── Die hek: net keuses wat WERKLIK kontak aanbied ──\n')
{
  /* Iemand wat "ek is reeds gedoop" gekies het, mag NOOIT in 'n pastor se lys
     beland nie — ook nie as iemand die versoek self saamstel nie. */
  for (const [m, w] of [
    ['doop', 'reeds'], ['doop', 'nieGereed'],
    ['volg', 'ondersoek'], ['volg', 'nieGereed'], ['volg', 'reeds'],
  ]) {
    is(`${m}/${w} skep GEEN versoek nie`,
       !!maakVersoek({ ...GOED, mylpaal: m, waarde: w }, NOU).fout, true)
  }
  is('n onbekende mylpaal ook nie',
     !!maakVersoek({ ...GOED, mylpaal: 'gebed' }, NOU).fout, true)
  is('en n ontbrekende waarde ook nie',
     !!maakVersoek({ ...GOED, waarde: undefined }, NOU).fout, true)
}

console.log('\n── Die naam ──\n')
for (const [naam, rou] of [
  ['leeg',            ''],
  ['net spasies',     '   '],
  ['nie n string',    12345],
  ['ontbrekend',      undefined],
  ['n NUL-greep',     'Anna\u0000Meyer'],
  ['te lank',         'a'.repeat(81)],
]) {
  is(`${naam} word geweier`, !!maakVersoek({ ...GOED, naam: rou }, NOU).fout, true)
}
/* 'n Nuwe reel binne 'n naam word 'n spasie, nie 'n afwysing nie. Iemand wat
   sy naam geplak het, moet nie afgewys word nie. */
is('n nuwe reel word n spasie',
   maakVersoek({ ...GOED, naam: 'Anna\nMeyer' }, NOU).versoek.naam, 'Anna Meyer')
is('spasies word saamgevou', maakVersoek({ ...GOED, naam: '  Anna   Meyer ' }, NOU).versoek.naam, 'Anna Meyer')

console.log('\n── Die kontakbesonderheid ──\n')
for (const goed of ['anna@voorbeeld.co.za', '0821234567', '082 123 4567', '+27 82 123 4567', '(021) 555-1234']) {
  is(`${goed} gaan deur`, skoonKontak(goed), goed.trim())
}
for (const sleg of ['', 'abc', 'anna@', '@voorbeeld.co.za', 'Anna Meyer', 'a'.repeat(121), null, 42]) {
  is(`${JSON.stringify(sleg)} word geweier`, skoonKontak(sleg), null)
}

console.log('\n── Die gemeente is opsioneel ──\n')
is('sonder gemeente werk dit', maakVersoek(GOED, NOU).versoek.gemeente, null)
is('met een word dit gehou',
   maakVersoek({ ...GOED, gemeente: 'K8M42' }, NOU).versoek.gemeente, 'K8M42')

console.log('\n── NET VIER VELDE OORLEEF ──\n')
{
  /* Dit is die belangrikste toets in hierdie leer. 'n Eindpunt wat alles vat
     wat gestuur word, is 'n eindpunt wat eendag 'n refleksie sal stoor omdat
     iemand 'n veld bygevoeg het. */
  const gemors = {
    ...GOED,
    refleksie:   'Ek haat my man en ek het niemand om mee te praat nie.',
    joernaal:    'my privaat antwoorde',
    dag4Antwoord:'my diepste vrees',
    hartsvraag:  'iets baie persoonliks',
    hanteer:     true,          /* iemand wat probeer om dit klaar te merk */
    opskrif:     'HACKED',      /* iemand wat die opskrif probeer stel */
    geskep:      '1999-01-01',  /* iemand wat die tyd probeer stel */
    id:          'ander-se-id',
  }
  const { versoek } = maakVersoek(gemors, NOU)
  is('presies hierdie velde, niks meer nie',
     Object.keys(versoek).sort(),
     ['gemeente', 'geskep', 'hanteer', 'kontak', 'mylpaal', 'naam', 'opskrif', 'waarde'])

  const teks = JSON.stringify(versoek)
  is('geen refleksie nie',  /haat my man/.test(teks), false)
  is('geen joernaal nie',   /privaat antwoorde/.test(teks), false)
  is('geen hartsvraag nie', /diepste vrees/.test(teks), false)

  /* En die drie velde wat die BEDIENER stel, kan nie deur die versoek gestel
     word nie. */
  is('die opskrif kom van ons af', versoek.opskrif, 'Doopgesprek versoek')
  is('die tyd ook',                versoek.geskep, NOU)
  is('en dit begin onhanteerd',    versoek.hanteer, false)
}

console.log('\n── Wat die pastor sien ──\n')
{
  const v = { ...maakVersoek(GOED, NOU).versoek, id: 'abc123' }
  const ry = virDieKerk(v)
  is('presies ses velde', Object.keys(ry).sort(),
     ['geskep', 'hanteer', 'id', 'kontak', 'naam', 'opskrif'])
  /* Die mylpaal en die rou keuse hoef die pastor nie te bereik nie — die
     opskrif se reeds wat hy moet weet. */
  is('nie die rou keuse nie', 'waarde' in ry, false)
  is('null gee null', virDieKerk(null), null)
}

console.log('\n── Rommel val om, dit breek nie ──\n')
for (const [naam, lyf] of [
  ['niks',           undefined],
  ['null',           null],
  ['n string',       'kontak my'],
  ['n getal',        42],
  ['n lee voorwerp', {}],
  ['n lys',          []],
]) {
  const r = maakVersoek(lyf, NOU)
  is(`${naam} gee n fout, nie n ongeluk nie`, typeof r.fout === 'string', true)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
