/* Week 4 se pad, teen dieselfde perke as Week 1 tot 3.
 *
 * Dewald het die hele week self geskryf; hierdie toets dwing net af dat dit in
 * die vorige drie weke se vorm PAS — dieselfde rede as hulle: VOLG JESUS MAG
 * NOOIT SOOS HUISWERK VOEL NIE, en die perke is die soort ding wat terugsluip
 * sodra iemand "net nog een kaart" byvoeg.
 */
import {
  WEEK4_DAE, WEEK4_REIS, WEEK4_OPENING, WEEK4_DEELSIN, WEEK4_VOLGENDE,
  WEEK4_TRANSKRIPSIE, WEEK4_SESSIE, WEEK4_KLAAR, blokkeVirDag4,
} from './volgJesusWeek4.js'
import {
  hetDae, weekDae, blokkeVir, weekDeelsin, weekVolgende, weekKlaar,
} from './volgJesusDae.js'
import { WEKE } from './volgJesusWeke.js'
import { magPubliseer, publiseerFoute, ontleedVerwysing } from './volgJesus.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)

console.log('\n── Vyf dae, en elkeen het n naam ──\n')
is('vyf dae', WEEK4_DAE.length, 5)
is('genommer 1 tot 5', WEEK4_DAE.map(d => d.n), [1, 2, 3, 4, 5])
for (const d of WEEK4_DAE) {
  waar(`dag ${d.n} het n titel`, d.titel && d.titel.length > 2)
  waar(`dag ${d.n} het n knoppie`, d.knop && d.knop.length > 2)
  waar(`dag ${d.n} se knoppie SKREEU nie in Engels nie`, !/[a-z]{3,}\s(the|and|your)/i.test(d.knop))
  waar(`dag ${d.n} se klaar-lyn bestaan`, d.klaarLyf && d.klaarLyf.length > 10)
}

console.log('\n── Die perke: dit mag nie soos huiswerk voel nie ──\n')
const EKSTRA = ['wallpaper', 'groepbrug']
for (const d of WEEK4_DAE) {
  const n = d.blokke.filter(b => !EKSTRA.includes(b.soort)).length
  waar(`dag ${d.n} het hoogstens 5 inhoudsblokke (${n})`, n <= 5)
}
for (const d of WEEK4_DAE) {
  const vrae = d.blokke.filter(b => b.soort === 'vraag'
    || (b.soort === 'kies' && b.vraag))
  waar(`dag ${d.n} vra hoogstens 2 antwoorde (${vrae.length})`, vrae.length <= 2)
}
for (const d of WEEK4_DAE) {
  for (const b of d.blokke.filter(x => x.soort === 'teks')) {
    const woorde = String(b.lyf || '').split(/\s+/).filter(Boolean).length
    waar(`dag ${d.n} se teksblok is hoogstens 180 woorde (${woorde})`, woorde <= 180)
  }
}

console.log('\n── Elke dag sluit met n gebed ──\n')
/* Week 1 tot 3 doen dit almal. 'n Dag wat ophou by 'n vraag, voel onklaar. */
for (const d of WEEK4_DAE) {
  waar(`dag ${d.n} het n gebed`, d.blokke.some(b => b.soort === 'gebed'))
}

console.log('\n── Elke Skrifgedeelte maak die Bybel oop ──\n')
{
  const skrifte = WEEK4_DAE.map(d => {
    const lees = d.blokke.find(b => b.soort === 'lees')
    return lees ? lees.skrif : ''
  })
  is('al vyf dae lees Skrif', skrifte.filter(Boolean).length, 5)
  for (const s of skrifte) {
    waar(`"${s}" ontleed as n geldige verwysing`, (ontleedVerwysing(s) || []).length > 0)
  }
  console.log('\n── Geen Skrifgedeelte twee dae na mekaar nie ──\n')
  for (let i = 1; i < skrifte.length; i++) {
    waar(`dag ${i + 1} herhaal nie dag ${i} se skrif nie`, skrifte[i] !== skrifte[i - 1])
  }
}

console.log('\n── Die stemboodskap staan op DAG 4, en dra daardie dag ALLEEN ──\n')
{
  const stemDae = WEEK4_DAE.filter(d => d.blokke.some(b => b.soort === 'stem'))
  is('presies een dag dra die stemboodskap', stemDae.length, 1)
  is('en dit is Dag 4', stemDae[0].n, 4)
  /* Die opname EN 'n teksblok op dieselfde dag is ses blokke waar die perk vyf
     is — en die geskrewe weergawe sou in elk geval dieselfde punte korter
     oorvertel. Dieselfde besluit as Week 3 se Dag 3. */
  is('geen teksblok op die stem-dag', stemDae[0].blokke.filter(b => b.soort === 'teks').length, 0)
  /* Maar die GROOT lyn bly: dit is die week se eie sin. */
  is('die groot lyn bly staan', stemDae[0].blokke.filter(b => b.soort === 'groot').length, 1)
  /* §40: die brug na die groep kom NA die opname, nooit voor nie. */
  const soorte = stemDae[0].blokke.map(b => b.soort)
  waar('die groepbrug staan NA die stemboodskap',
       soorte.lastIndexOf('groepbrug') > soorte.indexOf('stem'))
}

console.log('\n── Twee brûe na die groep, soos elke ander week ──\n')
{
  const brue = WEEK4_DAE.flatMap(d => d.blokke.filter(b => b.soort === 'groepbrug'))
  is('twee groepbrûe', brue.length, 2)
  waar('albei is NET vir n groep', brue.every(b => b.netGroep === true))
}

console.log('\n── Albei wallpapers is in die week ──\n')
{
  const bronne = WEEK4_DAE.flatMap(d => d.blokke.filter(b => b.soort === 'wallpaper').map(b => b.bronVeld))
  is('twee wallpapers', bronne.length, 2)
  waar('een is die vroeë prent', bronne.includes('wallpaperDag1'))
  waar("en een is die week s'n", bronne.includes('wallpaper'))
  const laaste = WEEK4_DAE[4].blokke.filter(b => b.soort === 'wallpaper').map(b => b.bronVeld)
  is("die week se prent sluit Dag 5 af", laaste, ['wallpaper'])
}

console.log('\n── Die reis aan die einde wys net wat gevra is ──\n')
{
  const gevra = new Set(WEEK4_DAE.flatMap(d => d.blokke
    .filter(b => b.soort === 'vraag').map(b => b.id)))
  is('drie terugblikke', WEEK4_REIS.length, 3)
  for (const r of WEEK4_REIS) waar(`"${r.id}" word wel gevra`, gevra.has(r.id))
  is('en hulle kom van Dag 1, 3 en 5', WEEK4_REIS.map(r => r.id), ['vrug1', 'pad3', 'anders5'])
}

console.log('\n── Elke vraag se id is UNIEK ──\n')
{
  const ids = WEEK4_DAE.flatMap(d => d.blokke.flatMap(b => {
    const uit = []
    if (b.soort === 'vraag') uit.push(b.id)
    if (b.soort === 'kies') { uit.push(b.id); if (b.vraag) uit.push(b.vraag.id) }
    return uit
  }))
  is('geen id kom twee keer voor nie', ids.length, new Set(ids).size)
  waar('en hulle dra almal n woord van minstens 4', ids.every(i => i && i.length >= 4))
}

console.log('\n── Die opening is kort ──\n')
waar(`hoogstens 5 paragrawe (${WEEK4_OPENING.split('\n\n').length})`,
     WEEK4_OPENING.split('\n\n').length <= 5)
waar(`en hoogstens 400 karakters (${WEEK4_OPENING.length})`, WEEK4_OPENING.length <= 400)

console.log('\n── Die transkripsie bestaan en eindig soos die ander drie ──\n')
waar('daar is n transkripsie', WEEK4_TRANSKRIPSIE.trim().length > 200)
waar('dit eindig met Amen', /Amen\.\s*$/.test(WEEK4_TRANSKRIPSIE.trim()))
/* Die opname dra Dag 4 alleen; dit moet dus werklik die dag se stof bevat. */
waar('dit praat oor die tafels', /tafels omgekeer/i.test(WEEK4_TRANSKRIPSIE))
waar('en oor die vyeboom', /vyeboom/i.test(WEEK4_TRANSKRIPSIE))

console.log('\n── Die groepsessie ──\n')
waar('n titel', WEEK4_SESSIE.titel.length > 2)
is('twee kern-Skrifte', WEEK4_SESSIE.skrifte.length, 2)
is('vier besprekingsvrae', WEEK4_SESSIE.vrae.length, 4)
waar('n slotgebed', WEEK4_SESSIE.gebed.length > 20)
for (const s of WEEK4_SESSIE.skrifte) {
  waar(`kern-Skrif "${s}" ontleed`, (ontleedVerwysing(s) || []).length > 0)
}

console.log('\n── Die register ken Week 4 ──\n')
is('hetDae(4)', hetDae(4), true)
is('die eerste drie ook', [hetDae(1), hetDae(2), hetDae(3)], [true, true, true])
is('maar nie week 5 nie', hetDae(5), false)
is('weekDae(4) gee vyf dae', weekDae(4).length, 5)
is('blokkeVir(4, 1) gee Dag 1 se blokke', blokkeVir(4, 1).length, blokkeVirDag4(1).length)
is('n onbekende week gee niks', blokkeVir(9, 1), [])
is("en die deelsin is die week s'n", weekDeelsin(4), WEEK4_DEELSIN)
waar('Week 3 en Week 4 se deelsinne verskil', weekDeelsin(3) !== weekDeelsin(4))

console.log('\n── Week 3 wys nou NA Week 4 ──\n')
/* Dit was `null`, en Week 3 het op n doodloopstraat geëindig. */
{
  const brug = weekVolgende(3)
  waar('daar is n brug van Week 3 af', !!brug)
  is('en dit wys na week 4', brug && brug.nommer, 4)
  is('met Week 4 se titel', brug && brug.titel, WEKE[4].titel)
}

console.log('\n── Die klaar-skerm praat oor HIERDIE week ──\n')
/* Die woorde was vir ELKE week Week 1 s'n ("JY HET BEGIN KYK"), dus het iemand
   wat Week 4 klaargemaak het, Week 1 se slot gelees. */
{
  const k = weekKlaar(4)
  waar('Week 4 bring sy eie klaar-woorde', !!(k && k.kop && k.lyf))
  is('en dit is die uitgevoerde blok', k, WEEK4_KLAAR)
  waar('dit noem die week', /WEEK 4/i.test(k.kop))
  is('weke sonder eie woorde kry null', [weekKlaar(1), weekKlaar(2), weekKlaar(3)], [null, null, null])
  is('n onbekende week ook', weekKlaar(9), null)
}

console.log('\n── Nog geen Week 5 nie — die skerm moet dit kan verduur ──\n')
is('WEEK4_VOLGENDE is null', WEEK4_VOLGENDE, null)
is('weekVolgende(4) gee ook null', weekVolgende(4), null)

console.log('\n── Die week se rekord kan PUBLISEER ──\n')
{
  const w = { ...WEKE[4] }
  waar('sonder n stemboodskap mag dit nog nie', !magPubliseer({
    ...w,
    kontroles: { teks: true, konteks: true, jesus: true, toepassing: true, grens: true },
    hersieningStatus: 'goedgekeur',
  }))
  const gereed = {
    ...w,
    stemboodskapUrl: 'https://firebasestorage.googleapis.com/o/audio%2Fw4.m4a?alt=media&token=x',
    kontroles: { teks: true, konteks: true, jesus: true, toepassing: true, grens: true },
    hersieningStatus: 'goedgekeur',
  }
  is('met alles reg is daar geen fout nie', publiseerFoute(gereed), [])
  is('en dit mag publiseer', magPubliseer(gereed), true)
}

console.log('\n── Die dag-titels stem ooreen met die admin se rekord ──\n')
{
  const w = WEKE[4]
  for (const d of WEEK4_DAE) is(`dag ${d.n}`, w[`dag${d.n}Titel`], d.titel)
}

console.log('\n── Die admin se Skrifte is geldig ──\n')
waar('primereSkrif ontleed', (ontleedVerwysing(WEKE[4].primereSkrif) || []).length > 0)
waar('ondersteunendeSkrif ontleed', (ontleedVerwysing(WEKE[4].ondersteunendeSkrif) || []).length > 0)

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
