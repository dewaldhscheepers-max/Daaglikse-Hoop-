/* node src/data/eboekGroepe.toets.mjs — nuut, gewild, en al die ander. */
import { groepeerBoeke, telKaart } from './eboekGroepe.js'
let reg = 0, val = 0
const is = (n, kry, wag) => { if (JSON.stringify(kry) === JSON.stringify(wag)) reg++; else { val++; console.log(`  VAL  ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) } }
const ids = l => l.map(b => b.id)
const T = n => 1760000000000 + n * 86400000
/* Opgelaai (id dra die tyd) en vas (geen tyd). */
const op = (naam, dag) => ({ id: `${naam}-${T(dag)}`, title: naam })
const vas = naam => ({ id: naam, title: naam })
const BOEKE = [op('a', 1), op('b', 5), op('c', 3), op('d', 9), vas('bid-nou'), vas('narsis'), vas('wen'), vas('dinge'), vas('rg'), vas('job')]
const TEL = [
  { bookId: 'rg', aantal: 712 }, { bookId: 'bid-nou', aantal: 570 }, { bookId: 'dinge', aantal: 481 },
  { bookId: 'narsis', aantal: 471 }, { bookId: 'wen', aantal: 469 }, { bookId: 'job', aantal: 306 },
  { bookId: `d-${T(9)}`, aantal: 900 }, { bookId: `a-${T(1)}`, aantal: 50 },
]
let g = groepeerBoeke(BOEKE, TEL)
is('nuut: die twee jongstes', ids(g.nuut), [`d-${T(9)}`, `b-${T(5)}`])
is('gewild: top 5, sonder die nuwe een wat ook gewild is', ids(g.gewild), ['rg', 'bid-nou', 'dinge', 'narsis', 'wen'])
is('die res: niks twee keer, niks vergeet', ids(g.res).sort(), [`a-${T(1)}`, `c-${T(3)}`, 'job'].sort())
is('elke boek presies een keer', [...g.nuut, ...g.gewild, ...g.res].length, BOEKE.length)
is('die res is nuutste eerste (opgelaai voor vas)', ids(g.res)[0], `c-${T(3)}`)
is('aantalVan', [g.aantalVan('rg'), g.aantalVan('niemand')], [712, 0])

g = groepeerBoeke(BOEKE, null)
is('geen tellings: geen gewild-groep', g.gewild.length, 0)
is('geen tellings: nuut bly', g.nuut.length, 2)
is('geen tellings: elke boek steeds daar', g.nuut.length + g.res.length, BOEKE.length)

g = groepeerBoeke([vas('x'), vas('y')], [{ bookId: 'x', aantal: 3 }])
is('net vaste boeke: niks is nuut nie', g.nuut.length, 0)
is('nul aflaaie is nooit gewild nie', ids(g.gewild), ['x'])
is('minder as vyf gewildes is reg', ids(g.res), ['y'])

g = groepeerBoeke([vas('x'), vas('x'), op('n', 2)], [{ bookId: 'x', aantal: 2 }])
is('dieselfde boek twee keer in die lys: een keer gewys', [...g.nuut, ...g.gewild, ...g.res].length, 2)

is('telKaart: voorwerp-vorm', [...telKaart({ a: 3, b: 0, c: 'x' })], [['a', 3]])
is('telKaart: gemors', telKaart('gemors').size, 0)
is('telKaart: negatief en NaN weg', telKaart([{ bookId: 'a', aantal: -1 }, { bookId: 'b', aantal: NaN }, { bookId: 5, aantal: 2 }]).size, 0)
g = groepeerBoeke(BOEKE, TEL, { nuut: 1, gewild: 2 })
is('opsies', [g.nuut.length, g.gewild.length], [1, 2])
is('gelykop: die lys se orde wen', ids(groepeerBoeke([vas('p'), vas('q')], [{ bookId: 'q', aantal: 5 }, { bookId: 'p', aantal: 5 }]).gewild), ['p', 'q'])
is('niks', groepeerBoeke(undefined, undefined).res, [])
console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
