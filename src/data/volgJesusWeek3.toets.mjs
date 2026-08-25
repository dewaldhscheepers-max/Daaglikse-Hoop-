/* Week 3 se pad, teen dieselfde perke as Week 1 en 2.
 *
 * Dewald het die hele week self geskryf; hierdie toets dwing net af dat dit
 * in Week 1 en 2 se vorm PAS — dieselfde rede as die ander twee: VOLG JESUS
 * MAG NOOIT SOOS HUISWERK VOEL NIE, en die perke is die soort ding wat
 * terugsluip sodra iemand "net nog een kaart" byvoeg.
 */
import {
  WEEK3_DAE, WEEK3_REIS, WEEK3_OPENING, WEEK3_DEELSIN, WEEK3_VOLGENDE,
  WEEK3_TRANSKRIPSIE, WEEK3_SESSIE, blokkeVirDag3,
} from './volgJesusWeek3.js'
import { hetDae, weekDae, blokkeVir, weekDeelsin, weekVolgende } from './volgJesusDae.js'
import { WEKE } from './volgJesusWeke.js'
import { magPubliseer, publiseerFoute, ontleedVerwysing } from './volgJesus.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)

console.log('\n── Vyf dae, en elkeen het n naam ──\n')
is('vyf dae', WEEK3_DAE.length, 5)
is('genommer 1 tot 5', WEEK3_DAE.map(d => d.n), [1, 2, 3, 4, 5])
for (const d of WEEK3_DAE) {
  waar(`dag ${d.n} het n titel`, d.titel && d.titel.length > 2)
  waar(`dag ${d.n} het n knoppie`, d.knop && d.knop.length > 2)
  waar(`dag ${d.n} se knoppie SKREEU nie in Engels nie`, !/[a-z]{3,}\s(the|and|your)/i.test(d.knop))
}

console.log('\n── Die perke: dit mag nie soos huiswerk voel nie ──\n')
const EKSTRA = ['wallpaper', 'groepbrug']
for (const d of WEEK3_DAE) {
  const n = d.blokke.filter(b => !EKSTRA.includes(b.soort)).length
  waar(`dag ${d.n} het hoogstens 5 inhoudsblokke (${n})`, n <= 5)
}
for (const d of WEEK3_DAE) {
  const vrae = d.blokke.filter(b => b.soort === 'vraag'
    || (b.soort === 'kies' && b.vraag))
  waar(`dag ${d.n} vra hoogstens 2 antwoorde (${vrae.length})`, vrae.length <= 2)
}
for (const d of WEEK3_DAE) {
  for (const b of d.blokke.filter(x => x.soort === 'teks')) {
    const woorde = String(b.lyf || '').split(/\s+/).filter(Boolean).length
    waar(`dag ${d.n} se teksblok is hoogstens 180 woorde (${woorde})`, woorde <= 180)
  }
}

console.log('\n── Elke Skrifverwysing maak die Bybel oop ──\n')
for (const d of WEEK3_DAE) {
  for (const b of d.blokke) {
    const kopIsSkrif = (ontleedVerwysing(b.kop || '') || []).length > 0
    if (!kopIsSkrif) continue
    const kanOopmaak = (ontleedVerwysing(b.skrif || '') || []).length > 0
    waar(`dag ${d.n} se "${b.kop}" maak die Bybel oop`, kanOopmaak)
  }
}

console.log('\n── Geen Skrifgedeelte twee dae na mekaar nie ──\n')
{
  const skrifte = WEEK3_DAE.map(d => {
    const lees = d.blokke.find(b => b.soort === 'lees')
    return lees ? lees.skrif : ''
  })
  for (let i = 1; i < skrifte.length; i++) {
    if (!skrifte[i] || !skrifte[i - 1]) { reg++; continue }
    waar(`dag ${i + 1} herhaal nie dag ${i} se skrif nie`, skrifte[i] !== skrifte[i - 1])
  }
  is('al vyf dae lees Skrif', skrifte.filter(Boolean).length, 5)
  /* Elke Skrifverwysing moet ook werklik ontleed, anders maak "LEES EERS"
     se knoppie niks oop nie. */
  for (const s of skrifte) {
    waar(`"${s}" ontleed as n geldige verwysing`, (ontleedVerwysing(s) || []).length > 0)
  }
}

console.log('\n── Die stemboodskap staan op DAG 3 ──\n')
{
  /* Dewald se egte opname is "Gee vir Jesus jou leë boot" — dieselfde
     verhaal as Dag 3 se LEES-blok (Lukas 5). Dit was eers verkeerdelik op
     Dag 1 geplaas. */
  const stemDae = WEEK3_DAE.filter(d => d.blokke.some(b => b.soort === 'stem'))
  is('presies een dag dra die stemboodskap', stemDae.length, 1)
  is('en dit is Dag 3', stemDae[0].n, 3)
}

console.log('\n── Albei wallpapers is in die week ──\n')
{
  const bronne = WEEK3_DAE.flatMap(d => d.blokke.filter(b => b.soort === 'wallpaper').map(b => b.bronVeld))
  is('twee wallpapers', bronne.length, 2)
  waar('een is die Dag 1-prent', bronne.includes('wallpaperDag1'))
  waar('en een is die week s\'n', bronne.includes('wallpaper'))
}

console.log('\n── Geen terugblik-blok wat na n nooit-gevraagde antwoord wys nie ──\n')
{
  const terug = WEEK3_DAE.flatMap(d => d.blokke.filter(b => b.soort === 'terugblik'))
  const gevra = new Set(WEEK3_DAE.flatMap(d => d.blokke
    .filter(b => b.soort === 'vraag').map(b => b.id)))
  for (const t of terug) waar(`terugblik "${t.bronId}" word wel gevra`, gevra.has(t.bronId))
  if (!terug.length) { reg++; console.log('  (geen terugblik-blok op n dag — die weekoorsig dra dit, soos Week 2)') }
}

console.log('\n── Die reis aan die einde wys net wat gevra is ──\n')
{
  const gevra = new Set(WEEK3_DAE.flatMap(d => d.blokke
    .filter(b => b.soort === 'vraag').map(b => b.id)))
  for (const r of WEEK3_REIS) waar(`"${r.id}" word wel gevra`, gevra.has(r.id))
}

console.log('\n── Elke vraag se id is UNIEK ──\n')
{
  const ids = WEEK3_DAE.flatMap(d => d.blokke.flatMap(b => {
    const uit = []
    if (b.soort === 'vraag') uit.push(b.id)
    if (b.soort === 'kies') { uit.push(b.id); if (b.vraag) uit.push(b.vraag.id) }
    return uit
  }))
  is('geen id kom twee keer voor nie', ids.length, new Set(ids).size)
  waar('en hulle dra almal n nommer of n woord van minstens 4', ids.every(i => i && i.length >= 4))
}

console.log('\n── Die opening is kort ──\n')
waar(`hoogstens 5 paragrawe (${WEEK3_OPENING.split('\n\n').length})`,
     WEEK3_OPENING.split('\n\n').length <= 5)
waar(`en hoogstens 400 karakters (${WEEK3_OPENING.length})`, WEEK3_OPENING.length <= 400)

console.log('\n── Die transkripsie bestaan en eindig soos die ander twee ──\n')
waar('daar is n transkripsie', WEEK3_TRANSKRIPSIE.trim().length > 200)
waar('dit eindig met Amen', /Amen\.\s*$/.test(WEEK3_TRANSKRIPSIE.trim()))

console.log('\n── Die groepsessie ──\n')
waar('n titel', WEEK3_SESSIE.titel.length > 2)
is('twee kern-Skrifte', WEEK3_SESSIE.skrifte.length, 2)
is('vier besprekingsvrae', WEEK3_SESSIE.vrae.length, 4)
waar('n slotgebed', WEEK3_SESSIE.gebed.length > 20)
for (const s of WEEK3_SESSIE.skrifte) {
  waar(`kern-Skrif "${s}" ontleed`, (ontleedVerwysing(s) || []).length > 0)
}

console.log('\n── Die register ken Week 3 ──\n')
is('hetDae(3)', hetDae(3), true)
is('hetDae(1) en hetDae(2) ook', [hetDae(1), hetDae(2)], [true, true])
is('maar nie week 4 nie', hetDae(4), false)
is('weekDae(3) gee vyf dae', weekDae(3).length, 5)
is('blokkeVir(3, 1) gee Dag 1 se blokke', blokkeVir(3, 1).length, blokkeVirDag3(1).length)
is('n onbekende week gee niks', blokkeVir(9, 1), [])
is('en die deelsin is die week s\'n', weekDeelsin(3), WEEK3_DEELSIN)
waar('Week 2 en Week 3 se deelsinne verskil', weekDeelsin(2) !== weekDeelsin(3))

console.log('\n── Nog geen Week 4 nie — die skerm moet dit kan verduur ──\n')
is('WEEK3_VOLGENDE is null', WEEK3_VOLGENDE, null)
is('weekVolgende(3) gee ook null', weekVolgende(3), null)

console.log('\n── Die week se rekord kan PUBLISEER ──\n')
{
  const w = { ...WEKE[3] }
  waar('sonder n stemboodskap mag dit nog nie', !magPubliseer({
    ...w,
    kontroles: { teks: true, konteks: true, jesus: true, toepassing: true, grens: true },
    hersieningStatus: 'goedgekeur',
  }))
  const gereed = {
    ...w,
    stemboodskapUrl: 'https://firebasestorage.googleapis.com/o/audio%2Fw3.m4a?alt=media&token=x',
    kontroles: { teks: true, konteks: true, jesus: true, toepassing: true, grens: true },
    hersieningStatus: 'goedgekeur',
  }
  is('met alles reg is daar geen fout nie', publiseerFoute(gereed), [])
  is('en dit mag publiseer', magPubliseer(gereed), true)
}

console.log('\n── Die dag-titels stem ooreen met die admin se rekord ──\n')
{
  const w = WEKE[3]
  for (const d of WEEK3_DAE) {
    is(`dag ${d.n}`, w[`dag${d.n}Titel`], d.titel)
  }
}

console.log('\n── Die primêre Skrif in die admin stem ooreen met Dag 1 se lees nie noodwendig nie — dit is die week s\'n ──\n')
waar('primereSkrif is n geldige verwysing', (ontleedVerwysing(WEKE[3].primereSkrif) || []).length > 0)

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
