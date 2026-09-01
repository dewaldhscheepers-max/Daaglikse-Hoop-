/* Loop met:  node src/data/skrifVerwysing.toets.mjs
 *
 * Die Skrifverwysing op 'n nota is VRYE TEKS wat Dewald met die hand tik.
 * Daarop staan die "LEES DIE WOORD"-skerm van Vandag se Tyd met God, en 'n
 * ontleder wat 'n verwysing nie kan lees nie, gee 'n knoppie wat NIKS doen
 * nie — geen fout, geen boodskap. Dit is die stilste manier waarop hierdie
 * app al gebreek het.
 *
 * Daarom toets dit die vorme wat 'n MENS werklik tik, nie die vorme wat 'n
 * ontleder gerieflik vind nie.
 */

import { ontleedSkrif, skrifOpskrif, kanOopmaak } from './skrifVerwysing.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  const gelyk = JSON.stringify(kry) === JSON.stringify(wag)
  if (gelyk) reg++
  else { val++; console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`) }
}
const s = (boek, hoofstuk, vers = null, versTot = null) => ({ boek, hoofstuk, vers, versTot })

console.log('\n── Wat werklik op die notas staan ──')
/* Albei hiervan bestaan vandag in Firestore. */
is('Lukas 22:42',    ontleedSkrif('Lukas 22:42'),   s('LUK', 22, 42))
is('1 Konings 19',   ontleedSkrif('1 Konings 19'),  s('1KI', 19))
is('Psalm 56:9',     ontleedSkrif('Psalm 56:9'),    s('PSA', 56, 9))

console.log('\n── Die reeks: die hele rede vir hierdie lêer ──')
/* Bybel.jsx se eie ontleder gee op ELKEEN hiervan null terug. */
is('koppelteken',    ontleedSkrif('Matteus 6:25-34'), s('MAT', 6, 25, 34))
is('aandagstreep',   ontleedSkrif('Matteus 6:25–34'), s('MAT', 6, 25, 34))
is('kasstreep',      ontleedSkrif('Matteus 6:25—34'), s('MAT', 6, 25, 34))
is('minusteken',     ontleedSkrif('Matteus 6:25−34'), s('MAT', 6, 25, 34))
is('spasies om die streep', ontleedSkrif('Matteus 6:25 - 34'), s('MAT', 6, 25, 34))
is('Johannes 6:66-69', ontleedSkrif('Johannes 6:66-69'), s('JHN', 6, 66, 69))

console.log('\n── Boeke wat met \'n syfer begin ──')
is('1 Korintiërs 13:4-8', ontleedSkrif('1 Korintiërs 13:4-8'), s('1CO', 13, 4, 8))
is('sonder deelteken',    ontleedSkrif('1 Korintiers 13:4'),   s('1CO', 13, 4))
is('afgekort',            ontleedSkrif('1 Kor 13'),            s('1CO', 13))
is('sonder spasie',       ontleedSkrif('1Kor 13:4'),           s('1CO', 13, 4))
is('2 Timoteus',          ontleedSkrif('2 Timoteus 1:7'),      s('2TI', 1, 7))
is('3 Johannes',          ontleedSkrif('3 Johannes 1:4'),      s('3JN', 1, 4))
is("Romeinse II",         ontleedSkrif('II Korintiërs 5:17'),  s('2CO', 5, 17))

console.log('\n── Afkortings en spelling ──')
is('Joh',        ontleedSkrif('Joh 3:16'),      s('JHN', 3, 16))
is('Matt.',      ontleedSkrif('Matt. 5:14'),    s('MAT', 5, 14))
is('Ps',         ontleedSkrif('Ps 23'),         s('PSA', 23))
is('Ps 23.1',    ontleedSkrif('Ps 23.1'),       s('PSA', 23, 1))
is('Op',         ontleedSkrif('Op 21:4'),       s('REV', 21, 4))
is('kode self',  ontleedSkrif('JHN 3:16'),      s('JHN', 3, 16))
is('kleinletters', ontleedSkrif('lukas 22:42'), s('LUK', 22, 42))
is('ekstra spasies', ontleedSkrif('  Lukas   22 : 42  '), s('LUK', 22, 42))
is('deeltekens', ontleedSkrif('Matteüs 6:33'),  s('MAT', 6, 33))
is('sonder deeltekens', ontleedSkrif('Matteus 6:33'), s('MAT', 6, 33))
is('Esegiël',    ontleedSkrif('Esegiel 37:5'),  s('EZK', 37, 5))

console.log('\n── \'n Voorvoegsel wat RAAI, mag niks gee nie ──')
/* "Jo" pas op Job, Joël, Johannes, Jona en Josua. Om die eerste te kies is
   hoe 'n mens iemand na die verkeerde boek stuur en dit nooit agterkom nie. */
is('"Jo" is dubbelsinnig',  ontleedSkrif('Jo 3:16'), null)
is('"J" is dubbelsinnig',   ontleedSkrif('J 3:16'),  null)
/* Maar 'n voorvoegsel wat op presies EEN boek pas, moet werk. */
is('"Johann" pas op een',   ontleedSkrif('Johann 3:16'), s('JHN', 3, 16))
is('"Genes" pas op een',    ontleedSkrif('Genes 1:1'),   s('GEN', 1, 1))

console.log('\n── Wat NIKS moet gee nie ──')
for (const slegte of ['', '   ', null, undefined, 42, {}, 'Boek van Elvis 3:16', 'xyz 1:1', '3:16', '???']) {
  is(`${JSON.stringify(slegte)} → null`, ontleedSkrif(slegte), null)
}
is('hoofstuk 0',  ontleedSkrif('Lukas 0:1'),  null)
is('vers 0',      ontleedSkrif('Lukas 22:0'), null)

console.log('\n── Net \'n boeknaam: hoofstuk 1, nie niks nie ──')
/* 'n Knoppie wat niks doen nie is erger as een wat by hoofstuk 1 oopmaak. */
is('Johannes',   ontleedSkrif('Johannes'),   s('JHN', 1))
is('Filippense', ontleedSkrif('Filippense'), s('PHP', 1))

console.log('\n── \'n Reeks agteruit is \'n tikfout, nie \'n reeks nie ──')
is('25-20 merk net die begin', ontleedSkrif('Matteus 6:25-20'), s('MAT', 6, 25))
is('34-34 merk net die begin', ontleedSkrif('Matteus 6:34-34'), s('MAT', 6, 34))

console.log('\n── Oor twee hoofstukke: begin daar, merk niks ──')
/* Die Bybel laai EEN hoofstuk. 'n Merk oor twee is 'n leuen; die begin is
   die waarheid. */
is('Joh 6:25-7:2', ontleedSkrif('Johannes 6:25-7:2'), s('JHN', 6, 25))

console.log('\n── Die opskrif wat die mens sien ──')
is('enkele vers',  skrifOpskrif('luk 22:42'),        'Lukas 22:42')
is('reeks kry \'n aandagstreep', skrifOpskrif('matt 6:25-34'), 'Matteus 6:25–34')
is('net \'n hoofstuk', skrifOpskrif('1 kon 19'),     '1 Konings 19')
is('kode word naam', skrifOpskrif('PSA 23:1'),       'Psalms 23:1')
/* Kan ons dit nie lees nie, wys ons SY teks — nooit 'n leë string nie. */
is('onleesbaar bly soos getik', skrifOpskrif('Boek van Elvis 3'), 'Boek van Elvis 3')
is('leeg bly leeg',  skrifOpskrif(''),  '')
is('null bly leeg',  skrifOpskrif(null), '')

console.log('\n── kanOopmaak besluit of die knoppie bestaan ──')
is('leesbaar',    kanOopmaak('Lukas 22:42'), true)
is('reeks',       kanOopmaak('Matteus 6:25–34'), true)
is('onleesbaar',  kanOopmaak('Boek van Elvis'), false)
is('leeg',        kanOopmaak(''), false)

console.log('\n── Elke boek in die Bybel is bereikbaar ──')
/* Die hele punt van die veld is dat enige verwysing werk. Tik Dewald môre
   'n boek wat niemand aan gedink het nie, moet dit steeds oopmaak. */
{
  const { BOEKE } = await import('./bybelBoeke.js')
  const kodes = Object.keys(BOEKE)
  const stukkend = kodes.filter(k => {
    const uit = ontleedSkrif(`${BOEKE[k]} 1:1`)
    return !uit || uit.boek !== k
  })
  is(`al ${kodes.length} boeke se volle naam werk`, stukkend, [])

  const kodesStukkend = kodes.filter(k => {
    const uit = ontleedSkrif(`${k} 1:1`)
    return !uit || uit.boek !== k
  })
  is('en al hulle kodes ook', kodesStukkend, [])
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
