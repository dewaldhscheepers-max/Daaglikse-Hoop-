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

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
