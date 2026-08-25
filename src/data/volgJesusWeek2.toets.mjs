/* Week 2 se pad, teen dieselfde perke as Week 1.
 *
 * Dewald se reel bly staan: VOLG JESUS MAG NOOIT SOOS HUISWERK VOEL NIE. Die
 * perke is die soort ding wat terugsluip sodra iemand "net nog een kaart"
 * byvoeg, en daarom staan hulle in 'n toets en nie in 'n kommentaar nie.
 */
import {
  WEEK2_DAE, WEEK2_REIS, WEEK2_OPENING, WEEK2_DEELSIN, WEEK2_VOLGENDE,
} from './volgJesusWeek2.js'
import { hetDae, weekDae, blokkeVir, weekDeelsin } from './volgJesusDae.js'
import { WEKE } from './volgJesusWeke.js'
import { magPubliseer, publiseerFoute, ontleedVerwysing } from './volgJesus.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)

console.log('\n── Vyf dae, en elkeen het n naam ──\n')
is('vyf dae', WEEK2_DAE.length, 5)
is('genommer 1 tot 5', WEEK2_DAE.map(d => d.n), [1, 2, 3, 4, 5])
for (const d of WEEK2_DAE) {
  waar(`dag ${d.n} het n titel`, d.titel && d.titel.length > 2)
  waar(`dag ${d.n} het n knoppie`, d.knop && d.knop.length > 2)
  waar(`dag ${d.n} se knoppie SKREEU nie in Engels nie`, !/[a-z]{3,}\s(the|and|your)/i.test(d.knop))
}

console.log('\n── Die perke: dit mag nie soos huiswerk voel nie ──\n')
/* Die wallpaper en die groepbrug tel NIE saam nie — sien volgJesusWeek1.toets.
   Hulle saamtel het presies die fout gemaak wat Dag 5 se Skrifverwysing sonder
   'n Bybel-knoppie gelaat het. */
const EKSTRA = ['wallpaper', 'groepbrug']
for (const d of WEEK2_DAE) {
  const n = d.blokke.filter(b => !EKSTRA.includes(b.soort)).length
  waar(`dag ${d.n} het hoogstens 5 inhoudsblokke (${n})`, n <= 5)
}
/* Hoogstens twee private antwoorde per dag. */
for (const d of WEEK2_DAE) {
  const vrae = d.blokke.filter(b => b.soort === 'vraag'
    || (b.soort === 'kies' && b.vraag))
  waar(`dag ${d.n} vra hoogstens 2 antwoorde (${vrae.length})`, vrae.length <= 2)
}
/* Woorde, nie paragrawe nie — sien volgJesusWeek1.toets.mjs vir hoekom. */
for (const d of WEEK2_DAE) {
  for (const b of d.blokke.filter(x => x.soort === 'teks')) {
    const woorde = String(b.lyf || '').split(/\s+/).filter(Boolean).length
    waar(`dag ${d.n} se teksblok is hoogstens 180 woorde (${woorde})`, woorde <= 180)
  }
}

/* Staan daar 'n Skrifverwysing op 'n blok, MOET die Bybel daar oopmaak.
   Week 2 se Dag 5 het "JAKOBUS 4:7–8" as opskrif gehad met niks agter hom nie,
   en dit lees soos 'n stukkende LEES-kaart. Dewald: "waar de vok staan daar
   maak die bybel ook". Dit is 'n perk, nie 'n eenmalige regmaak nie. */
console.log('\n── Elke Skrifverwysing maak die Bybel oop ──\n')
for (const d of WEEK2_DAE) {
  for (const b of d.blokke) {
    const kopIsSkrif = (ontleedVerwysing(b.kop || '') || []).length > 0
    if (!kopIsSkrif) continue
    /* Die knoppie kom uit `skrif`, nooit uit die opskrif nie — 'n LEES-kaart en
       'n teksblok werk albei so. Ontbreek `skrif`, is daar geen knoppie. */
    const kanOopmaak = (ontleedVerwysing(b.skrif || '') || []).length > 0
    waar(`dag ${d.n} se "${b.kop}" maak die Bybel oop`, kanOopmaak)
  }
}

console.log('\n── Geen Skrifgedeelte twee dae na mekaar nie ──\n')
{
  const skrifte = WEEK2_DAE.map(d => {
    const lees = d.blokke.find(b => b.soort === 'lees')
    return lees ? lees.skrif : ''
  })
  for (let i = 1; i < skrifte.length; i++) {
    if (!skrifte[i] || !skrifte[i - 1]) { reg++; continue }
    waar(`dag ${i + 1} herhaal nie dag ${i} se skrif nie`, skrifte[i] !== skrifte[i - 1])
  }
  /* Al VYF dae lees nou Skrif. Dag 5 s'n het ontbreek en die verwysing het as
     'n blote opskrif gestaan — die fout wat hierdie blok nou vashou. */
  is('al vyf dae lees Skrif', skrifte.filter(Boolean).length, 5)
}

console.log('\n── Die stemboodskap staan op DAG 1 ──\n')
{
  const stemDae = WEEK2_DAE.filter(d => d.blokke.some(b => b.soort === 'stem'))
  is('presies een dag dra die stemboodskap', stemDae.length, 1)
  is('en dit is Dag 1', stemDae[0].n, 1)
}

console.log('\n── Albei wallpapers is in die week ──\n')
{
  const bronne = WEEK2_DAE.flatMap(d => d.blokke.filter(b => b.soort === 'wallpaper').map(b => b.bronVeld))
  is('twee wallpapers', bronne.length, 2)
  waar('een is die Dag 1-prent', bronne.includes('wallpaperDag1'))
  waar('en een is die week s\'n', bronne.includes('wallpaper'))
}

console.log('\n── Die terugblik wys n antwoord wat WERKLIK gevra is ──\n')
{
  /* Dag 5 dra nie meer 'n terugblik-blok nie; die weekoorsig (WEEK2_REIS) gee
     die mens sy Dag 1-woorde terug. Is daar wel een op 'n dag, moet sy bron
     steeds werklik gevra word — 'n terugblik na 'n id wat nerens bestaan nie,
     is 'n lee aanhaling op die skerm. */
  const terug = WEEK2_DAE.flatMap(d => d.blokke.filter(b => b.soort === 'terugblik'))
  const gevra = new Set(WEEK2_DAE.flatMap(d => d.blokke
    .filter(b => b.soort === 'vraag').map(b => b.id)))
  waar('die weekoorsig wys Dag 1 se woorde terug', WEEK2_REIS.some(r => r.id === 'stem1'))
  for (const t of terug) waar(`terugblik "${t.bronId}" word wel gevra`, gevra.has(t.bronId))
  if (!terug.length) { reg++; console.log('  (geen terugblik-blok op n dag — die weekoorsig dra dit)') }
}
console.log('\n── Die reis aan die einde wys net wat gevra is ──\n')
{
  const gevra = new Set(WEEK2_DAE.flatMap(d => d.blokke
    .filter(b => b.soort === 'vraag').map(b => b.id)))
  for (const r of WEEK2_REIS) waar(`"${r.id}" word wel gevra`, gevra.has(r.id))
}

console.log('\n── Elke vraag se id is UNIEK ──\n')
{
  const ids = WEEK2_DAE.flatMap(d => d.blokke.flatMap(b => {
    const uit = []
    if (b.soort === 'vraag') uit.push(b.id)
    if (b.soort === 'kies') { uit.push(b.id); if (b.vraag) uit.push(b.vraag.id) }
    return uit
  }))
  is('geen id kom twee keer voor nie', ids.length, new Set(ids).size)
  /* En hulle mag NIE met Week 1 s'n bots nie — die sleutel is vj_a_w<week>_<id>,
     dus is 'n botsing binne dieselfde week die enigste gevaar, maar 'n unieke
     naam maak die berging leesbaar wanneer iets ondersoek word. */
  waar('en hulle dra almal n nommer of n woord', ids.every(i => i && i.length >= 4))
}

console.log('\n── Die opening is kort ──\n')
waar(`hoogstens 5 paragrawe (${WEEK2_OPENING.split('\n\n').length})`,
     WEEK2_OPENING.split('\n\n').length <= 5)
waar(`en hoogstens 400 karakters (${WEEK2_OPENING.length})`, WEEK2_OPENING.length <= 400)

console.log('\n── Die register ken Week 2 ──\n')
is('hetDae(2)', hetDae(2), true)
is('hetDae(1) ook', hetDae(1), true)
/* Week 3 het intussen bygekom (sien volgJesusWeek3.js) — hierdie toets vra
   net of die register Week 2 self ken, nie of Week 3 nog ontbreek nie. */
is('en n week wat nog nie bestaan nie, gee niks', hetDae(9), false)
is('weekDae(2) gee vyf dae', weekDae(2).length, 5)
/* Dag 1 dra vyf inhoudsblokke plus die groepbrug (§40: die brug kom NA die
   stemboodskap). Die brug is nie werk nie — sien die perke hierbo. */
is('blokkeVir(2, 1) gee Dag 1 se blokke', blokkeVir(2, 1).length, 6)
is('waarvan vyf inhoud is',
   blokkeVir(2, 1).filter(b => !['wallpaper', 'groepbrug'].includes(b.soort)).length, 5)
is('n onbekende week gee niks', blokkeVir(9, 1), [])
is('en die deelsin is die week s\'n', weekDeelsin(2), WEEK2_DEELSIN)
waar('Week 1 en Week 2 se deelsinne verskil', weekDeelsin(1) !== weekDeelsin(2))

console.log('\n── Die week se rekord kan PUBLISEER ──\n')
{
  const w = { ...WEKE[2] }
  /* Sonder 'n stemboodskap kort die hoofboodskap — dit is reg, en Dewald laai
     dit self op. */
  waar('sonder n stemboodskap mag dit nog nie', !magPubliseer({
    ...w,
    kontroles: { teks: true, konteks: true, jesus: true, toepassing: true, grens: true },
    hersieningStatus: 'goedgekeur',
  }))
  const gereed = {
    ...w,
    stemboodskapUrl: 'https://firebasestorage.googleapis.com/o/audio%2Fw2.m4a?alt=media&token=x',
    kontroles: { teks: true, konteks: true, jesus: true, toepassing: true, grens: true },
    hersieningStatus: 'goedgekeur',
  }
  is('met alles reg is daar geen fout nie', publiseerFoute(gereed), [])
  is('en dit mag publiseer', magPubliseer(gereed), true)
}

console.log('\n── Die dag-titels stem ooreen met die admin se rekord ──\n')
{
  const w = WEKE[2]
  for (const d of WEEK2_DAE) {
    is(`dag ${d.n}`, w[`dag${d.n}Titel`], d.titel)
  }
}

console.log('\n── Volgende week ──\n')
is('dit wys na Week 3', WEEK2_VOLGENDE.nommer, 3)
waar('met n titel', WEEK2_VOLGENDE.titel.length > 2)

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
