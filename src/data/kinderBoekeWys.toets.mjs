/* Die reel wat bepaal of 'n kinderboek in die app verskyn.
   Dit was `status === 'published'`; nou is dit "het hy bladsye". */
function watWys(uitFirestore, statiese) {
  const metBladsye = uitFirestore.filter(b => (b.pages || []).length > 0)
  return metBladsye.length > 0 ? metBladsye : statiese
}
let reg=0, val=0
const is=(n,k,w)=>{ if(JSON.stringify(k)===JSON.stringify(w)) reg++; else {val++; console.log(`  VAL ${n} — kry ${JSON.stringify(k)}`)} }
const STATIES = [{id:'s1'},{id:'s2'},{id:'s3'},{id:'s4'},{id:'s5'},{id:'s6'}]

console.log('\n── Die geval wat vandag gebreek het ──')
/* Ses gepubliseerde boeke, plus 'n nuwe een wat op "Konsep" bly staan het. */
const nou = [
  ...STATIES.map(b => ({ ...b, status:'published', pages:['a.jpg'] })),
  { id:'nuut', status:'draft', pages:['p1.jpg','p2.jpg','p3.jpg'] },
]
is('die nuwe boek wys nou ook, al se status "draft"',
   watWys(nou, STATIES).map(b=>b.id), ['s1','s2','s3','s4','s5','s6','nuut'])

console.log('\n── \'n Halfklaar boek ──')
const half = [{ id:'a', status:'published', pages:['x.jpg'] }, { id:'leeg', status:'published', pages:[] }]
is('een sonder bladsye wys nie', watWys(half, STATIES).map(b=>b.id), ['a'])

console.log('\n── Niks in Firestore nie ──')
is('dan wys die statiese lys', watWys([], STATIES).length, 6)
is("en 'n lys van net lee boeke ook", watWys([{id:'x',pages:[]}], STATIES).length, 6)

console.log('\n── Ou data sonder \'n pages-veld ──')
is('breek nie', watWys([{ id:'oud', status:'published' }], STATIES).length, 6)

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
