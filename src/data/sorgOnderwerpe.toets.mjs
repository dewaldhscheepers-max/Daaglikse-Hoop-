/* Loop met:  node src/data/sorgOnderwerpe.toets.mjs

   Die eerste blok is Dewald se EGTE veertien titels, presies soos hy hulle
   gestuur het, emoji en al. 'n Raaiskoot wat op versinde titels werk en op
   die egtes misluk, is niks werd nie. */

import { raaiOnderwerpe, onderwerpNaam } from './sorgOnderwerpe.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`) }
}

console.log('\n── Dewald se veertien ──')
const EGTE = [
  ['Slegte Geselskap Bederf Jou Stadig‼️',                                                  ['grense']],
  ['4 Dinge wat vergifnis nie beteken nie🔥‼️',                                             ['vergifnis']],
  ['God sien jou moegheid',                                                                 ['donker']],
  ['3 Dinge wat jy moet doen wanneer negatiewe gedagtes jou aanval🔥‼️',                    ['angs']],
  ['3 Dinge wat jy moet doen wanneer Angstige gedagtes jou vrede steel🔥‼️',                ['angs']],
  ['4 Dinge wat jou finansies en perspektief kan verander',                                 ['geld']],
  ['3 Dinge wanneer  verwerping  jou laat voel jy is nie goed genoeg nie',                  ['eensaam', 'waarde']],
  ['3 Dinge wat jy moet doen as daar geestelike aanvalle op jou huwelik en jou gesin is 🔥‼️', ['huwelik', 'kinders']],
  ['5 Dinge wat jy moet weet oor rustelose gedagtes🔥‼️',                                   ['angs']],
  ['4 Dinge wanneer die vyand jou kinders aanval🙏🏻‼️',                                     ['kinders']],
  ['As iemand  jou bitter seergemaak het🙏🏻‼️',                                             ['woede']],
  ['As jy voel jy het te veel verloor om weer op te staan🙏🏻🔥‼️',                          ['rou']],
  ['As familie jou seermaak🙏🏻‼️',                                                          ['kinders', 'woede']],
  ['Wanneer  jou gedagtes jou wakker hou🔥🙏🏻‼️',                                           ['angs']],
]
for (const [titel, wag] of EGTE) {
  const kry = raaiOnderwerpe(titel)
  is(titel.slice(0, 46), kry, wag)
}

console.log('\n── Hele woorde, nie stukke nie ──')
/* Elkeen hiervan sou met 'n substring-soektog verkeerd geraai het. */
is('“vrou” is nie “rou”',      raaiOnderwerpe("Wanneer 'n vrou moeg is").includes('rou'), false)
is('“berou” is nie “rou”',     raaiOnderwerpe('Berou en die pad vorentoe').includes('rou'), false)
is('maar “rou” self tel wel',  raaiOnderwerpe('Wanneer rou nie ligter word nie'), ['rou'])
is('“skuldig” is skaamte, nie geld', raaiOnderwerpe('Wanneer jy skuldig voel'), ['skaamte'])

console.log('\n── Wat dit NIE raai nie ──')
/* Konserwatief is die punt. 'n Verkeerde onderwerp stuur 'n rouende mens 'n
   video oor geld; niks stuur hom na "Nog boodskappe van hoop", waar niemand
   seerkry nie. */
is('leeg bly leeg',            raaiOnderwerpe(''), [])
is('niks herkenbaar nie',      raaiOnderwerpe('Boodskap 47'), [])
is('en null val nie om nie',   raaiOnderwerpe(null), [])

console.log('\n── Hoogstens drie, altyd dieselfde volgorde ──')
const baie = raaiOnderwerpe('Angs, depressie, rou, siekte, huwelik en kinders')
is('nooit meer as drie', baie.length <= 3, true)
is('en dit is stabiel',  raaiOnderwerpe('Angs, depressie, rou, siekte, huwelik en kinders'), baie)

console.log('\n── Wat dit vir Dewald sou wys ──')
for (const [titel] of EGTE) {
  const name = raaiOnderwerpe(titel).map(onderwerpNaam)
  console.log(`   ${name.length ? name.join(' + ') : '— geen —'}\n      ${titel.slice(0, 60)}`)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
