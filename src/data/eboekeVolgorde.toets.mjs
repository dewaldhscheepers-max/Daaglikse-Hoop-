/* Wat nuut is, is bo.

   Dewald se reel, en dit is al twee keer stil gebreek — een keer by die
   kinderboeke en een keer hier.

     node src/data/eboekeVolgorde.toets.mjs
*/
import { boekTyd, sorteerNuutsteBo } from './eboekeVolgorde.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL  ${naam}\n       kry ${JSON.stringify(kry)}\n       wag ${JSON.stringify(wag)}`) }
}
const name = lys => sorteerNuutsteBo(lys).map(b => b.id)

console.log('\n── Waar die tyd vandaan kom ──\n')

is('uit die id se stert', boekTyd({ id: 'wat-is-myne-om-te-dra-1755000000000' }), 1755000000000)
is('createdAt as ISO',    boekTyd({ id: 'x', createdAt: '2026-08-13T05:00:00.000Z' }), Date.parse('2026-08-13T05:00:00.000Z'))
is('createdAt as getal',  boekTyd({ id: 'x', createdAt: 1755000000000 }), 1755000000000)
is('updatedAt as die tweede keuse', boekTyd({ id: 'x', updatedAt: 1700000000000 }), 1700000000000)
is("Firestore se Timestamp", boekTyd({ id: 'x', createdAt: { seconds: 1755000000 } }), 1755000000000)

/* createdAt moet die id klop — anders kan 'n mens 'n boek nooit later
   herrangskik nie. */
is('createdAt wen bo die id',
  boekTyd({ id: 'ou-boek-1600000000000', createdAt: 1755000000000 }), 1755000000000)

console.log('\n── Wat NIE n tydstempel is nie ──\n')

is('geen boek',            boekTyd(null), 0)
is("'n string",            boekTyd('boek'), 0)
is('n ou statiese id',     boekTyd({ id: 'rustelose-gedagtes' }), 0)
is('n bladsynommer aan die stert', boekTyd({ id: 'boek-deel-2' }), 0)
is('n jaartal aan die stert',      boekTyd({ id: 'jaarboek-2024' }), 0)
/* 13 syfers maar lank voor 2000 — dit is nie 'n oplaai-oomblik nie. */
is('n getal voor 2000',    boekTyd({ id: 'boek-0000000000123' }), 0)
is('n stukkende createdAt', boekTyd({ id: 'x', createdAt: 'more' }), 0)
is('createdAt van 1970',    boekTyd({ id: 'x', createdAt: 5 }), 0)

console.log('\n── Die volgorde ──\n')

const LYS = [
  { id: 'bybel-maklik-1700000000000' },
  { id: 'wat-is-myne-om-te-dra-1755000000000' },
  { id: 'rustelose-gedagtes' },
  { id: 'dink-nuut-1720000000000' },
]

is('die nuutste boek staan eerste', name(LYS)[0], 'wat-is-myne-om-te-dra-1755000000000')
is('en die hele volgorde is nuutste eerste', name(LYS), [
  'wat-is-myne-om-te-dra-1755000000000',
  'dink-nuut-1720000000000',
  'bybel-maklik-1700000000000',
  'rustelose-gedagtes',
])

/* Die ding wat werklik gaan gebeur: hy laai MORE weer een op. */
const MORE = [...LYS, { id: 'nog-n-nuwe-boek-1755600000000' }]
is('en more se boek is dan bo', name(MORE)[0], 'nog-n-nuwe-boek-1755600000000')

console.log('\n── Uitgelig ──\n')

const METSTER = [
  { id: 'nuutste-1755000000000' },
  { id: 'rustelose-gedagtes', featured: true },
  { id: 'ouer-1700000000000' },
]
is('n uitgeligte boek staan bo die nuutste', name(METSTER)[0], 'rustelose-gedagtes')
is('en die res bly nuutste eerste', name(METSTER).slice(1), ['nuutste-1755000000000', 'ouer-1700000000000'])
is('featured moet WAAR wees, nie net bestaan nie',
  name([{ id: 'a-1755000000000' }, { id: 'b', featured: false }]), ['a-1755000000000', 'b'])

console.log('\n── Dit mag niks verloor of omval nie ──\n')

is('geen lys',   sorteerNuutsteBo(null), [])
is("'n leë lys", sorteerNuutsteBo([]), [])
is('een boek',   name([{ id: 'een' }]), ['een'])
is('elke boek kom deur', sorteerNuutsteBo(LYS).length, LYS.length)
/* Twee boeke sonder enige tyd mag nie oor mekaar spring nie — 'n lys wat by
   elke render van volgorde verander, laat die blad flikker. */
is('gelykes bly in hul volgorde', name([{ id: 'p' }, { id: 'q' }, { id: 'r' }]), ['p', 'q', 'r'])
is('en dit bly so as jy dit weer doen', name(sorteerNuutsteBo([{ id: 'p' }, { id: 'q' }, { id: 'r' }])), ['p', 'q', 'r'])
/* Die ou vergelyker was nie antisimmetries nie. Hierdie een moet wees. */
const albeiSter = [{ id: 'a', featured: true }, { id: 'b', featured: true }]
is('twee uitgeligtes bly stabiel', name(albeiSter), ['a', 'b'])
is('en die oorspronklike lys word nie verander nie',
  (() => { const l = [{ id: 'x' }, { id: 'y-1755000000000' }]; sorteerNuutsteBo(l); return l.map(b => b.id) })(),
  ['x', 'y-1755000000000'])

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
