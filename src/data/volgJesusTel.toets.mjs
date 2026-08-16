/* Een keer per TOESTEL, nie een keer per tik.
 *
 * Dit is die verskil tussen "hoeveel mense het begin" en "hoeveel keer is op
 * die knoppie gedruk", en die verkeerde getal lyk presies soos die regte een
 * — net groter. Iemand wat die app vyf keer oopmaak en elke keer by die week
 * ingaan, is EEN mens.
 *
 * Net die suiwer helfte word hier getoets: watter sleutel 'n gebeurtenis kry
 * en of dit nog getel mag word. Die ander helfte raak aan localStorage en die
 * netwerk en hoort in 'n blaaier.
 */
import { sleutelVir, magTel } from './volgJesusTel.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

console.log('\n── Die sleutels ──\n')
is('oop',        sleutelVir('oop'),                 'vj_getel_oop')
is('begin',      sleutelVir('begin', 1),            'vj_getel_begin_1')
is('dag',        sleutelVir('dag', 2, 3),           'vj_getel_dag_2_3')
is('week klaar', sleutelVir('weekKlaar', 7),        'vj_getel_klaar_7')

/* Elke week en elke dag kry sy EIE sleutel. Deel twee dinge een sleutel, tel
   die tweede een nooit. */
const gesien = new Set()
let bots = 0
for (let w = 1; w <= 52; w++) {
  for (const s of [sleutelVir('begin', w), sleutelVir('weekKlaar', w)]) {
    if (gesien.has(s)) bots++; gesien.add(s)
  }
  for (let d = 1; d <= 5; d++) {
    const s = sleutelVir('dag', w, d)
    if (gesien.has(s)) bots++; gesien.add(s)
  }
}
is('geen twee gebeurtenisse deel n sleutel nie', bots, 0)
is('52 x 7 sleutels', gesien.size, 52 * 7)

console.log('\n── Wat geen sleutel kry nie ──\n')
for (const [naam, args] of [
  ['n onbekende ding',   ['iets', 1]],
  ['geen ding',          [undefined, 1]],
  ['begin sonder week',  ['begin']],
  ['week 0',             ['begin', 0]],
  ['week 53',            ['begin', 53]],
  ['n halwe week',       ['begin', 2.5]],
  ['dag sonder dag',     ['dag', 1]],
  ['dag 0',              ['dag', 1, 0]],
  ['dag 6',              ['dag', 1, 6]],
  ['__proto__',          ['__proto__', 1]],
  ['constructor',        ['constructor', 1]],
]) {
  is(`${naam} gee n lee sleutel`, sleutelVir(...args), '')
}

console.log('\n── Wanneer mag ons tel ──\n')
is('n vars toestel',        magTel(new Set(), 'begin', 1), true)
is('sonder enige geheue',   magTel(null, 'begin', 1), true)
is('reeds getel',           magTel(new Set(['vj_getel_begin_1']), 'begin', 1), false)
is('n ANDER week tel wel',  magTel(new Set(['vj_getel_begin_1']), 'begin', 2), true)
is('n ander dag tel wel',   magTel(new Set(['vj_getel_dag_1_1']), 'dag', 1, 2), true)
is('dieselfde dag nie',     magTel(new Set(['vj_getel_dag_1_1']), 'dag', 1, 1), false)
is('n lys werk ook',        magTel(['vj_getel_oop'], 'oop'), false)
is('en n lys sonder dit',   magTel(['vj_getel_oop'], 'begin', 1), true)

/* Wat geen sleutel het, word NOOIT getel nie — anders stuur 'n stukkende
   oproep 'n versoek na die bediener wat hy in elk geval gaan weier. */
is('rommel tel nooit', magTel(new Set(), 'iets anders', 1), false)
is('week 99 tel nooit', magTel(new Set(), 'begin', 99), false)

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
