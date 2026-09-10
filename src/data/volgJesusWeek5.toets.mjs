/* Week 5 se pad, teen dieselfde perke as Week 1 tot 4.
 *
 * Hierdie week is die eerste een SONDER 'n stemboodskap — die hoofboodskap is
 * die lang leesstuk op Dag 1. Twee dinge moet dus hier vasstaan wat nêrens
 * anders getoets word nie:
 *
 *   · daar is presies EEN hoofboodskap, en dit is 'n `boodskap`-blok;
 *   · die week kan WERKLIK publiseer sonder 'n opname. Dit is die hek wat hom
 *     andersins vir altyd sou gesper het.
 */
import {
  WEEK5_DAE, WEEK5_REIS, WEEK5_OPENING, WEEK5_DEELSIN, WEEK5_VOLGENDE,
  WEEK5_TRANSKRIPSIE, WEEK5_SESSIE, WEEK5_KLAAR, blokkeVirDag5,
} from './volgJesusWeek5.js'
import {
  hetDae, weekDae, blokkeVir, weekDeelsin, weekVolgende, weekKlaar,
  weekTranskripsie,
} from './volgJesusDae.js'
import { WEKE } from './volgJesusWeke.js'
import { magPubliseer, publiseerFoute, ontleedVerwysing, HOOFBOODSKAP_VELDE } from './volgJesus.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)

console.log('\n── Vyf dae, en elkeen het n naam ──\n')
is('vyf dae', WEEK5_DAE.length, 5)
is('genommer 1 tot 5', WEEK5_DAE.map(d => d.n), [1, 2, 3, 4, 5])
for (const d of WEEK5_DAE) {
  waar(`dag ${d.n} het n titel`, d.titel && d.titel.length > 2)
  waar(`dag ${d.n} het n knoppie`, d.knop && d.knop.length > 2)
  waar(`dag ${d.n} se klaar-lyn bestaan`, d.klaarLyf && d.klaarLyf.length > 10)
}

console.log('\n── Die perke: dit mag nie soos huiswerk voel nie ──\n')
const EKSTRA = ['wallpaper', 'groepbrug']
for (const d of WEEK5_DAE) {
  const n = d.blokke.filter(b => !EKSTRA.includes(b.soort)).length
  waar(`dag ${d.n} het hoogstens 5 inhoudsblokke (${n})`, n <= 5)
}
for (const d of WEEK5_DAE) {
  const vrae = d.blokke.filter(b => b.soort === 'vraag'
    || (b.soort === 'kies' && b.vraag))
  waar(`dag ${d.n} vra hoogstens 2 antwoorde (${vrae.length})`, vrae.length <= 2)
}
/* Die 180 woorde geld vir 'n TEKSblok. Die `boodskap`-blok is vrygestel — dit
   is wat die opname elke ander week gedra het. */
for (const d of WEEK5_DAE) {
  for (const b of d.blokke.filter(x => x.soort === 'teks')) {
    const woorde = String(b.lyf || '').split(/\s+/).filter(Boolean).length
    waar(`dag ${d.n} se teksblok is hoogstens 180 woorde (${woorde})`, woorde <= 180)
  }
}

console.log('\n── Elke dag sluit met n gebed ──\n')
for (const d of WEEK5_DAE) {
  waar(`dag ${d.n} het n gebed`, d.blokke.some(b => b.soort === 'gebed'))
}

console.log('\n── Elke Skrifgedeelte maak die Bybel oop ──\n')
{
  const skrifte = WEEK5_DAE.map(d => {
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

console.log('\n── GEEN STEMBOODSKAP: die boodskap word GELEES ──\n')
{
  const stemDae = WEEK5_DAE.filter(d => d.blokke.some(b => b.soort === 'stem'))
  is('geen enkele stem-blok in die hele week', stemDae.length, 0)
  is('en geen transkripsie nie', WEEK5_TRANSKRIPSIE, '')
  is('die register gee ook niks', weekTranskripsie(5), '')

  const boodskapDae = WEEK5_DAE.filter(d => d.blokke.some(b => b.soort === 'boodskap'))
  is('presies EEN dag dra die hoofboodskap', boodskapDae.length, 1)
  is('en dit is Dag 1', boodskapDae[0].n, 1)

  const b = boodskapDae[0].blokke.find(x => x.soort === 'boodskap')
  waar('dit is n lang leesstuk', b.lyf.split(/\s+/).filter(Boolean).length > 400)
  waar('met n opskrif', !!b.kop)
  /* Dieselfde besluit as Week 3 se Dag 3 en Week 4 se Dag 4: die dag wat die
     hoofboodskap dra, dra GEEN gewone teksblok nie. */
  is('geen teksblok op die boodskap-dag', boodskapDae[0].blokke.filter(x => x.soort === 'teks').length, 0)
  /* §40: die brug na die groep kom NA die hoofboodskap. */
  const soorte = boodskapDae[0].blokke.map(x => x.soort)
  waar('die groepbrug staan NA die boodskap',
       soorte.lastIndexOf('groepbrug') > soorte.indexOf('boodskap'))

  console.log('\n── En die boodskap dra werklik die week se stof ──\n')
  waar('dit praat oor Jesus se eie doop', /Jordaan/i.test(b.lyf))
  waar('oor genade voor gehoorsaamheid', /uit genade, deur geloof/i.test(b.lyf))
  waar('oor die Etiopiër se vraag', /Wat verhinder my/i.test(b.lyf))
  waar('en dit eindig by die Verlosser', /perfekte Verlosser nodig\.$/.test(b.lyf.trim()))
}

console.log('\n── Twee brûe na die groep, soos elke ander week ──\n')
{
  const brue = WEEK5_DAE.flatMap(d => d.blokke.filter(b => b.soort === 'groepbrug'))
  is('twee groepbrûe', brue.length, 2)
  waar('albei is NET vir n groep', brue.every(b => b.netGroep === true))
}

console.log('\n── Albei wallpapers is in die week ──\n')
{
  const bronne = WEEK5_DAE.flatMap(d => d.blokke.filter(b => b.soort === 'wallpaper').map(b => b.bronVeld))
  is('twee wallpapers', bronne.length, 2)
  waar('een is die vroeë prent', bronne.includes('wallpaperDag1'))
  waar("en een is die week s'n", bronne.includes('wallpaper'))
  /* Dewald het die eerste een op DAG 1 gesit, nie op Dag 2 soos Week 2 tot 4
     nie. Dit is sy uitleg en dit bly so. */
  const dag1 = WEEK5_DAE[0].blokke.filter(b => b.soort === 'wallpaper').map(b => b.bronVeld)
  is('die eerste prent sluit DAG 1 af', dag1, ['wallpaperDag1'])
  const laaste = WEEK5_DAE[4].blokke.filter(b => b.soort === 'wallpaper').map(b => b.bronVeld)
  is("die week se prent sluit Dag 5 af", laaste, ['wallpaper'])
}

console.log('\n── Die mens kry sy eie woorde terug ──\n')
{
  /* Op Dag 5 wys die app die Dag 1-antwoord terug. Wys dit na 'n id wat nooit
     gevra word nie, verdwyn die blok stilweg en niemand sien dit nie. */
  const gevra = new Set(WEEK5_DAE.flatMap(d => d.blokke
    .filter(b => b.soort === 'vraag').map(b => b.id)))
  const terug = WEEK5_DAE.flatMap(d => d.blokke.filter(b => b.soort === 'terugblik'))
  is('een terugblik', terug.length, 1)
  waar('dit staan op Dag 5', WEEK5_DAE[4].blokke.some(b => b.soort === 'terugblik'))
  waar(`dit wys na "${terug[0].bronId}", wat wel gevra word`, gevra.has(terug[0].bronId))
  is('en dit is Dag 1 se vraag', terug[0].bronId, 'getref1')
}

console.log('\n── Die reis aan die einde wys net wat gevra is ──\n')
{
  const gevra = new Set(WEEK5_DAE.flatMap(d => d.blokke.flatMap(b => {
    if (b.soort === 'vraag') return [b.id]
    if (b.soort === 'kies' && b.vraag) return [b.vraag.id]
    return []
  })))
  is('drie terugblikke', WEEK5_REIS.length, 3)
  for (const r of WEEK5_REIS) waar(`"${r.id}" word wel gevra`, gevra.has(r.id))
  /* Dag 1 se antwoord staan NIE hier nie: Dag 5 se terugblik wys hom reeds, en
     twee keer agtermekaar lees soos 'n fout. */
  waar('Dag 1 se antwoord word nie twee keer gewys nie',
       !WEEK5_REIS.some(r => r.id === 'getref1'))
}

console.log('\n── Elke vraag se id is UNIEK ──\n')
{
  const ids = WEEK5_DAE.flatMap(d => d.blokke.flatMap(b => {
    const uit = []
    if (b.soort === 'vraag') uit.push(b.id)
    if (b.soort === 'kies') { uit.push(b.id); if (b.vraag) uit.push(b.vraag.id) }
    return uit
  }))
  is('geen id kom twee keer voor nie', ids.length, new Set(ids).size)
  waar('en hulle dra almal n woord van minstens 4', ids.every(i => i && i.length >= 4))
}

console.log('\n── Die keuse op Dag 4 ──\n')
{
  const kies = WEEK5_DAE[3].blokke.find(b => b.soort === 'kies')
  waar('daar is n keuse', !!kies)
  is('vyf opsies', kies.opsies.length, 5)
  waar('elke opsie het n waarde en woorde', kies.opsies.every(o => o.waarde && o.woorde))
  waar('geen twee opsies deel n waarde nie',
       new Set(kies.opsies.map(o => o.waarde)).size === kies.opsies.length)
  waar('en EEN opvolgvraag', !!(kies.vraag && kies.vraag.id))
}

console.log('\n── Die opening is kort ──\n')
waar(`hoogstens 5 paragrawe (${WEEK5_OPENING.split('\n\n').length})`,
     WEEK5_OPENING.split('\n\n').length <= 5)
waar(`en hoogstens 400 karakters (${WEEK5_OPENING.length})`, WEEK5_OPENING.length <= 400)

console.log('\n── Die register ken Week 5 ──\n')
is('hetDae(5)', hetDae(5), true)
is('die eerste vier ook', [hetDae(1), hetDae(2), hetDae(3), hetDae(4)], [true, true, true, true])
is('maar nie week 6 nie', hetDae(6), false)
is('weekDae(5) gee vyf dae', weekDae(5).length, 5)
is('blokkeVir(5, 1) gee Dag 1 se blokke', blokkeVir(5, 1).length, blokkeVirDag5(1).length)
is("en die deelsin is die week s'n", weekDeelsin(5), WEEK5_DEELSIN)
waar('Week 4 en Week 5 se deelsinne verskil', weekDeelsin(4) !== weekDeelsin(5))

console.log('\n── Week 4 wys nou NA Week 5 ──\n')
{
  const brug = weekVolgende(4)
  waar('daar is n brug van Week 4 af', !!brug)
  is('en dit wys na week 5', brug && brug.nommer, 5)
  is('met Week 5 se titel', brug && brug.titel, WEKE[5].titel)
}

console.log('\n── En Week 5 wys reeds na Week 6 ──\n')
{
  /* Dewald het Week 6 se titel saamgestuur. Die brug bestaan dus reeds, ook al
     is die week nog nie geskryf nie — dit is 'n BELOFTE op die skerm, nie 'n
     pad nie, en dit is presies wat hy gegee het. */
  is('WEEK5_VOLGENDE wys na 6', WEEK5_VOLGENDE.nommer, 6)
  waar('met n titel', WEEK5_VOLGENDE.titel.length > 3)
  waar('en n sin daarby', WEEK5_VOLGENDE.lyf.length > 20)
  is('weekVolgende(5) gee dieselfde', weekVolgende(5), WEEK5_VOLGENDE)
}

console.log('\n── Die klaar-skerm praat oor HIERDIE week ──\n')
{
  const k = weekKlaar(5)
  waar('Week 5 bring sy eie klaar-woorde', !!(k && k.kop && k.lyf))
  is('en dit is die uitgevoerde blok', k, WEEK5_KLAAR)
  waar('dit is nie Week 1 se ou slot nie', !/BEGIN KYK/i.test(k.kop))
}

console.log('\n── Die week se rekord kan PUBLISEER, SONDER n opname ──\n')
{
  const w = { ...WEKE[5] }
  const kontroles = { teks: true, konteks: true, jesus: true, toepassing: true, grens: true }
  is('daar is geen stemboodskap nie', w.stemboodskapUrl, '')
  is('en geen video nie', w.videoId, '')
  waar('maar die boodskap is as GESKREWE gemerk', w.geskreweBoodskap === true)

  const gereed = { ...w, kontroles, hersieningStatus: 'goedgekeur' }
  is('met alles reg is daar geen fout nie', publiseerFoute(gereed), [])
  is('en dit mag publiseer', magPubliseer(gereed), true)

  /* Die hek moet steeds 'n hek wees. Haal die merkie af en die week staan. */
  const sonder = { ...gereed, geskreweBoodskap: false }
  waar('sonder die merkie mag dit NIE', !magPubliseer(sonder))
  waar('en die fout sê hoekom',
       publiseerFoute(sonder).some(f => /hoofboodskap/i.test(f)))
  /* En ook nie wanneer die veld heeltemal weg is nie. */
  const weg = { ...gereed }
  delete weg.geskreweBoodskap
  waar('n ontbrekende merkie tel ook nie', !magPubliseer(weg))
}

console.log('\n── Die derde vorm van n hoofboodskap ──\n')
is('drie vorme', HOOFBOODSKAP_VELDE.length, 3)
waar('die video bly', HOOFBOODSKAP_VELDE.includes('videoId'))
waar('die stemboodskap bly', HOOFBOODSKAP_VELDE.includes('stemboodskapUrl'))
waar('en die geskrewe boodskap kom by', HOOFBOODSKAP_VELDE.includes('geskreweBoodskap'))
/* Weke 1 tot 4 mag NIE deur die nuwe vorm verander nie. */
for (const n of [1, 2, 3, 4]) {
  is(`week ${n} dra nog geen geskrewe vlaggie nie`, WEKE[n].geskreweBoodskap, undefined)
}

console.log('\n── Die dag-titels stem ooreen met die admin se rekord ──\n')
{
  const w = WEKE[5]
  for (const d of WEEK5_DAE) is(`dag ${d.n}`, w[`dag${d.n}Titel`], d.titel)
}

console.log('\n── Die admin se Skrifte is geldig ──\n')
waar('primereSkrif ontleed', (ontleedVerwysing(WEKE[5].primereSkrif) || []).length > 0)
waar('ondersteunendeSkrif ontleed', (ontleedVerwysing(WEKE[5].ondersteunendeSkrif) || []).length > 0)

console.log('\n── Die groepsessie ──\n')
waar('n titel', WEEK5_SESSIE.titel.length > 2)
is('twee kern-Skrifte', WEEK5_SESSIE.skrifte.length, 2)
is('vier besprekingsvrae', WEEK5_SESSIE.vrae.length, 4)
waar('n slotgebed', WEEK5_SESSIE.gebed.length > 20)
for (const s of WEEK5_SESSIE.skrifte) {
  waar(`kern-Skrif "${s}" ontleed`, (ontleedVerwysing(s) || []).length > 0)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
