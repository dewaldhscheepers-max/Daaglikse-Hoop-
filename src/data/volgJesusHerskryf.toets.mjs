/* VOLG JESUS — vordering wanneer 'n week HERSKRYF word.
 *
 * Dewald, 11 Oktober 2026: "Hoekom wys dit gedoen... ek het nog niks gedoen
 * nie." Die ou Week 8 se merkies het op die nuwe Week 8 gestaan.
 *
 *   node src/data/volgJesusHerskryf.toets.mjs
 */
import { HERSKRYF, herskryfBesluit, herstelHerskryfdeWeke } from './volgJesusHerskryf.js'
import { WEEK8_DAE } from './volgJesusWeek8.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}

/* 'n Vals localStorage wat net die API dra wat die kode gebruik. */
function berging(begin = {}) {
  const d = new Map(Object.entries(begin))
  return {
    get length() { return d.size },
    key: i => [...d.keys()][i] ?? null,
    getItem: k => (d.has(k) ? d.get(k) : null),
    setItem: (k, v) => d.set(k, String(v)),
    removeItem: k => d.delete(k),
    alles: () => Object.fromEntries(d),
  }
}
const M = HERSKRYF[8].merk

console.log('\n── Die nuwe id\'s is WERKLIK die week se vrae ──\n')
{
  /* Dryf die lys van die week af weg, word elke nuwe gebruiker as "ou" gelees
     en skoongemaak. */
  const ids = WEEK8_DAE.flatMap(d => d.blokke).filter(b => b.id).map(b => b.id).sort()
  is('dieselfde stel', [...HERSKRYF[8].nuweIds].sort(), ids)
}

console.log('\n── Die besluit ──\n')
{
  is('n week wat nie herskryf is nie: niks', herskryfBesluit(7, {}), { vee: false, myWeek: null, merk: null })
  is('reeds gesien: niks', herskryfBesluit(8, { gesien: M }), { vee: false, myWeek: null, merk: null })
  is('ou merkies, geen antwoorde: vee', herskryfBesluit(8, {}), { vee: true, myWeek: null, merk: M })
  is('ou antwoorde tel nie as nuut', herskryfBesluit(8, { antwoordIds: ['troon1', 'regeer2'] }),
     { vee: true, myWeek: null, merk: M })
  is('n NUWE antwoord: los alles, merk net', herskryfBesluit(8, { antwoordIds: ['troon1', 'draai2'] }),
     { vee: false, myWeek: null, merk: M })
  is('ou Week 8 klaar (my_week 9): skuif terug na 8', herskryfBesluit(8, { myWeek: 9 }),
     { vee: true, myWeek: 8, merk: M })
  is('my_week 8 bly', herskryfBesluit(8, { myWeek: 8 }).myWeek, null)
  is('my_week 3 bly', herskryfBesluit(8, { myWeek: 3 }).myWeek, null)
  is('n ou merk van n vorige herskrywing tel nie', herskryfBesluit(8, { gesien: '2020-01-01' }).vee, true)
}

console.log('\n── Op die foon: Dewald se geval ──\n')
{
  const b = berging({
    vj_klaar_w8: '[1,2,3,4]', vj_plek_w8: '5', vj_a_w8_troon1: 'my ou woorde',
    vj_klaar_w7: '[1,2,3,4,5]', vj_my_week: '8',
  })
  herstelHerskryfdeWeke(b)
  const a = b.alles()
  is('Week 8 se merkies is weg', a.vj_klaar_w8, undefined)
  is('en die plek', a.vj_plek_w8, undefined)
  is('sy ou woorde bly', a.vj_a_w8_troon1, 'my ou woorde')
  is('Week 7 word nie aangeraak nie', a.vj_klaar_w7, '[1,2,3,4,5]')
  is('my_week bly 8', a.vj_my_week, '8')
  is('en die merk is geskryf', a.vj_herskryf_w8, M)

  /* Die tweede oopmaak: hy het intussen die nuwe Dag 1 gedoen. */
  b.setItem('vj_klaar_w8', '[1]')
  herstelHerskryfdeWeke(b)
  is('die tweede keer word NIKS gevee nie', b.getItem('vj_klaar_w8'), '[1]')
}

console.log('\n── Op die foon: iemand wat die NUWE week reeds begin het ──\n')
{
  const b = berging({ vj_klaar_w8: '[1,2]', vj_plek_w8: '3', vj_a_w8_draai2: 'nuwe woorde' })
  herstelHerskryfdeWeke(b)
  is('sy merkies bly', b.getItem('vj_klaar_w8'), '[1,2]')
  is('sy plek bly', b.getItem('vj_plek_w8'), '3')
  is('gemerk, sodat dit nooit weer vra nie', b.getItem('vj_herskryf_w8'), M)
}

console.log('\n── Op die foon: die ou week KLAAR gemaak ──\n')
{
  const b = berging({ vj_klaar_w8: '[1,2,3,4,5]', vj_my_week: '9' })
  herstelHerskryfdeWeke(b)
  is('die merkies is weg', b.getItem('vj_klaar_w8'), null)
  is('en hy staan weer by Week 8', b.getItem('vj_my_week'), '8')
}

console.log('\n── Op die foon: niks van VOLG JESUS nie ──\n')
{
  const b = berging({ ander: 'x' })
  herstelHerskryfdeWeke(b)
  is('niks verander behalwe die merk', b.alles(), { ander: 'x', vj_herskryf_w8: M })
}

console.log('\n── Stukkende berging laat die app NIE val nie ──\n')
{
  let gegooi = false
  try {
    herstelHerskryfdeWeke({ get length() { throw new Error('af') } })
    herstelHerskryfdeWeke(null)
  } catch { gegooi = true }
  is('geen fout', gegooi, false)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
