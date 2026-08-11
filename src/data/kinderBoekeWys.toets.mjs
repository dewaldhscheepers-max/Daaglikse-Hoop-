/* Loop met:  node src/data/kinderBoekeWys.toets.mjs

   Die reel wat bepaal of 'n kinderboek in die app verskyn. Dit was
   `status === 'published'`; nou is dit "het hy bladsye".

   Twee plekke gebruik dit -- die biblioteek en die telling op die
   promo-kaart -- en die telling het vantevore die INGEBOUDE lys getel. Dit
   het dus vir altyd op sewe bly staan terwyl die biblioteek agt gewys het.
   Daarom woon die reel nou op een plek, en toets ons daardie een. */

import { boekeWatWys } from './kinderBoekeWys.js'

let reg = 0, val = 0
const is = (n, k, w) => {
  if (JSON.stringify(k) === JSON.stringify(w)) reg++
  else { val++; console.log(`  VAL  ${n} — kry ${JSON.stringify(k)}, wag ${JSON.stringify(w)}`) }
}

const STATIES = ['s1','s2','s3','s4','s5','s6','s7'].map(id => ({ id }))

console.log('\n── Die geval wat vandag gebreek het ──')
/* Sewe boeke wat wys, plus 'n agtste wat op "Konsep" bly staan het. */
const nou = [
  ...STATIES.map(b => ({ ...b, status: 'published', pages: ['a.jpg'] })),
  { id: 'ek-luister-na-my-magie', status: 'draft', pages: Array(11).fill('p.jpg') },
]
is('al agt wys, al se die agtste se status "draft"',
   boekeWatWys(nou, STATIES).length, 8)
is('die nuwe boek is by',
   boekeWatWys(nou, STATIES).some(b => b.id === 'ek-luister-na-my-magie'), true)

console.log('\n── \'n Halfklaar boek ──')
is('een sonder bladsye wys nie',
   boekeWatWys([{ id: 'a', pages: ['x.jpg'] }, { id: 'leeg', pages: [] }], STATIES).map(b => b.id),
   ['a'])

console.log('\n── Wanneer Firestore niks gee nie ──')
is('leeg gee die ingeboude lys', boekeWatWys([], STATIES).length, 7)
is('net lee boeke gee ook die ingeboude lys', boekeWatWys([{ id: 'x', pages: [] }], STATIES).length, 7)
is('null breek nie', boekeWatWys(null, STATIES).length, 7)

console.log('\n── Ou data ──')
is('geen pages-veld nie', boekeWatWys([{ id: 'oud', status: 'published' }], STATIES).length, 7)
is('n stukkende inskrywing breek nie', boekeWatWys([null, { id: 'goed', pages: ['a'] }], STATIES).map(b => b.id), ['goed'])

console.log("\n── Die volgorde: nuutste bo ──")
const metDatums = [
  { id: 'oud',   pages: ['a'], createdAt: '2026-01-05T08:00:00.000Z' },
  { id: 'nuut',  pages: ['a'], createdAt: '2026-08-11T15:00:00.000Z' },
  { id: 'middel',pages: ['a'], createdAt: '2026-05-20T08:00:00.000Z' },
]
is('nuutste eerste', boekeWatWys(metDatums, STATIES).map(b => b.id), ['nuut','middel','oud'])

is('boeke sonder \'n datum val onder',
   boekeWatWys([
     { id: 'ingebou-a', pages: ['a'] },
     { id: 'nuut',      pages: ['a'], createdAt: '2026-08-11T15:00:00.000Z' },
     { id: 'ingebou-b', pages: ['a'] },
   ], STATIES).map(b => b.id),
   ['nuut','ingebou-a','ingebou-b'])

is('sonder datums bly die volgorde stabiel',
   boekeWatWys([{ id: 'c', pages: ['a'] }, { id: 'a', pages: ['a'] }, { id: 'b', pages: ['a'] }], STATIES).map(b => b.id),
   ['a','b','c'])

/* updatedAt mag NIE die volgorde bepaal nie -- 'n ou boek wat gewysig word,
   moet bly waar hy is. */
is("'n ou boek wat vandag gewysig is, bly onder",
   boekeWatWys([
     { id: 'oud',  pages: ['a'], createdAt: '2026-01-05T08:00:00.000Z', updatedAt: '2026-08-11T16:00:00.000Z' },
     { id: 'nuut', pages: ['a'], createdAt: '2026-08-01T08:00:00.000Z', updatedAt: '2026-08-01T08:00:00.000Z' },
   ], STATIES).map(b => b.id),
   ['nuut','oud'])

is('die oorspronklike lys word nie omgekrap nie', (() => {
  const in_ = [{ id: 'b', pages: ['a'], createdAt: '2026-01-01' }, { id: 'a', pages: ['a'], createdAt: '2026-09-01' }]
  boekeWatWys(in_, STATIES)
  return in_.map(b => b.id)
})(), ['b','a'])

console.log("\n── Boeke wat voor createdAt opgelaai is ──")
/* Presies Dewald se data op 11 Augustus: sewe ingeboudes wat 'n ruk gelede
   gesaai is, en twee wat vandag opgelaai is. Nie een het 'n createdAt nie. */
const soosVandag = [
  ...['klein-leeu','klein-leeu-leer-luister','die-donker','foutjies','lelike-woorde','my-woorde','gevoelens']
     .map(id => ({ id, pages: ['a'], updatedAt: '2026-06-01T10:00:00.000Z' })),
  { id: 'ek-luister-na-my-magie', pages: Array(11).fill('a'), updatedAt: '2026-08-11T15:41:00.000Z' },
  { id: 'klein-proe',             pages: Array(9).fill('a'),  updatedAt: '2026-08-11T15:52:00.000Z' },
]
is('albei nuwes staan bo, sonder dat iemand hulle oopmaak',
   boekeWatWys(soosVandag, STATIES).slice(0, 2).map(b => b.id),
   ['klein-proe', 'ek-luister-na-my-magie'])

is("createdAt wen bo updatedAt",
   boekeWatWys([
     { id: 'oud-maar-nou-gewysig', pages: ['a'], createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-08-11T17:00:00.000Z' },
     { id: 'nuut',                 pages: ['a'], createdAt: '2026-08-01T00:00:00.000Z' },
   ], STATIES).map(b => b.id),
   ['nuut', 'oud-maar-nou-gewysig'])

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
