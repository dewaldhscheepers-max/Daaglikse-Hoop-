/* VOLG JESUS — WEEK 15: "DIE MELAATSE WAT NIEMAND WOU AANRAAK NIE"
 *
 * Dewald het die week op 21 November 2026 voluit gestuur. Hierdie toets keur
 * die PERKE (wat keer dat 'n dag soos huiswerk voel), die vorm van 'n week
 * SONDER 'n opname, Dag 1 se boodskap woord vir woord, en die vyf plekke wat
 * CLAUDE.md uitwys — veral die twee wat maklik agterbly: die BRUG van Week 14
 * af, en die verse teen die GAB.
 *
 *   node src/data/volgJesusWeek15.toets.mjs
 */
import {
  WEEK15_DAE, WEEK15_REIS, WEEK15_OPENING, WEEK15_DEELSIN, WEEK15_VOLGENDE,
  WEEK15_TRANSKRIPSIE, WEEK15_SESSIE, WEEK15_KLAAR, blokkeVirDag15,
} from './volgJesusWeek15.js'
import { WEEK14_VOLGENDE } from './volgJesusWeek14.js'
import {
  hetDae, weekDae, weekReis, weekOpening, weekDeelsin, weekVolgende,
  weekTranskripsie, weekSessie, weekKlaar, blokkeVir,
} from './volgJesusDae.js'
import { WEKE } from './volgJesusWeke.js'
import { magPubliseer, publiseerFoute, ontleedVerwysing } from './volgJesus.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}
const waar = (n, k) => is(n, !!k, true)

/* ── Die perke ── Dieselfde as Week 6 tot 14: sonder 'n opname staan die hele
   week se onderrig GESKREWE, dus 210. Vyf inhoudsblokke en twee antwoorde het
   nie geskuif nie. */
const MAKS_TEKS = 210
const MAKS_BLOKKE = 5
const MAKS_ANTWOORDE = 2
/* Dag 1 se boodskap, soos Dewald dit gestuur het. */
const WOORDE_DAG1 = 457

console.log('\n── Vyf dae, en elkeen het n naam ──\n')
{
  is('vyf dae', WEEK15_DAE.length, 5)
  is('genommer 1 tot 5', WEEK15_DAE.map(d => d.n), [1, 2, 3, 4, 5])
  for (const d of WEEK15_DAE) {
    waar(`dag ${d.n} het n titel`, d.titel && d.titel.length > 3)
    waar(`dag ${d.n} het n merk`, d.merk && d.merk.length > 2)
    waar(`dag ${d.n} het n knoppie`, d.knop && d.knop.length > 3)
    waar(`dag ${d.n} het n klaar-kop`, d.klaarKop && d.klaarKop.length > 3)
    waar(`dag ${d.n} het n klaar-sin`, d.klaarLyf && d.klaarLyf.length > 10)
  }
  is('Dag 5 se knoppie voltooi die week', WEEK15_DAE[4].knop, 'VOLTOOI WEEK 15')
  is('en die klaar-kop se dit', WEEK15_DAE[4].klaarKop, 'WEEK 15 KLAAR.')
}

console.log('\n── Die perke: dit mag nie soos huiswerk voel nie ──\n')
{
  for (const d of WEEK15_DAE) {
    const EKSTRA = ['wallpaper', 'groepbrug']
    const inhoud = d.blokke.filter(b => !EKSTRA.includes(b.soort))
    waar(`dag ${d.n} het hoogstens ${MAKS_BLOKKE} blokke (${inhoud.length})`,
         inhoud.length <= MAKS_BLOKKE)
    const antwoorde = d.blokke.filter(b => b.soort === 'vraag' || b.soort === 'kies').length
    waar(`dag ${d.n} vra hoogstens ${MAKS_ANTWOORDE} antwoorde (${antwoorde})`,
         antwoorde <= MAKS_ANTWOORDE)
    for (const b of d.blokke.filter(b => b.soort === 'teks')) {
      const woorde = b.lyf.trim().split(/\s+/).length
      waar(`dag ${d.n} se teksblok is hoogstens ${MAKS_TEKS} woorde (${woorde})`,
           woorde <= MAKS_TEKS)
    }
  }
  /* Dag 5 vra EEN ding om te skryf: KYK TERUG se vraag. Die stap is 'n opdrag. */
  is('Dag 5 het presies een skryfkassie', WEEK15_DAE[4].blokke.filter(b => b.soort === 'vraag').length, 1)
}

console.log('\n── Elke dag sluit met n gebed ──\n')
{
  const d1 = WEEK15_DAE[0]
  is('dag 1 het geen aparte gebed-blok', d1.blokke.filter(b => b.soort === 'gebed').length, 0)
  const bood = d1.blokke.find(b => b.soort === 'boodskap')
  waar('want die boodskap eindig met die gebed',
       /Vader, dankie dat Jesus nie terugstaan vir die plekke waarvoor ek skaam is nie\..*my seer en my verlede\. Amen\.$/s.test(bood.lyf.trim()))
  for (const d of WEEK15_DAE.slice(1)) {
    const gebed = d.blokke.filter(b => b.soort === 'gebed')
    is(`dag ${d.n} het presies een gebed`, gebed.length, 1)
    waar(`dag ${d.n} se gebed eindig met Amen`, /Amen\.?$/.test(gebed[0].lyf.trim()))
  }
}

console.log('\n── Elke Skrifgedeelte maak die Bybel oop ──\n')
{
  const skrifte = []
  for (const d of WEEK15_DAE) {
    const lees = d.blokke.filter(b => b.soort === 'lees')
    is(`dag ${d.n} het presies een LEES-blok`, lees.length, 1)
    const s = lees[0].skrif
    skrifte.push(s)
    waar(`dag ${d.n}: "${s}" ontleed`, !!ontleedVerwysing(s))
    if (d.n === 1) is('dag 1 se LEES-blok versin geen reel nie', lees[0].lyf, undefined)
    else waar(`dag ${d.n} se leesreel se wat om raak te sien`, lees[0].lyf && lees[0].lyf.length > 20)
  }
  for (let i = 1; i < skrifte.length; i++) {
    is(`dag ${i + 1} se Skrif verskil van dag ${i} s n`, skrifte[i] === skrifte[i - 1], false)
  }
  is('al vyf gedeeltes verskil', new Set(skrifte).size, 5)
  is('Dag 1 lees die hele gedeelte', skrifte[0], 'Markus 1:40–45')
  is('Dag 4 se gedeelte is twee verse', ontleedVerwysing(skrifte[3]).map(s => [s.hoofstuk, s.van, s.tot]), [[1, 41, 42]])
}

console.log('\n── GEEN STEMBOODSKAP: die boodskap word GELEES ──\n')
{
  for (const d of WEEK15_DAE) {
    is(`dag ${d.n} het geen stem-blok`, d.blokke.some(b => b.soort === 'stem'), false)
  }
  is('en geen transkripsie', WEEK15_TRANSKRIPSIE, '')
  const b = WEEK15_DAE[0].blokke.find(x => x.soort === 'boodskap')
  waar('Dag 1 dra n boodskap-blok', !!b)
  is('met die opskrif', b.kop, 'LEES VANDAG SE BOODSKAP')
  const soorte = WEEK15_DAE[0].blokke.map(x => x.soort)
  waar('die boodskap volg op die lees', soorte.indexOf('boodskap') > soorte.indexOf('lees'))
  for (const d of WEEK15_DAE.slice(1)) {
    is(`dag ${d.n} het geen boodskap-blok`, d.blokke.some(x => x.soort === 'boodskap'), false)
  }
}

console.log('\n── Dag 1 se boodskap is Dewald s\'n, woord vir woord ──\n')
{
  const b = WEEK15_DAE[0].blokke.find(x => x.soort === 'boodskap').lyf
  waar('die begin', b.startsWith('’n Man met ’n ernstige velsiekte kom na Jesus toe, val op sy knieë en sê:\n\n“As U wil, kan U my rein maak.”'))
  for (const t of [
    '“Sal U?”',
    'Hy moes van ander mense af wegbly, en sy toestand het hom nie net fisiek geraak nie; dit het hom ook van mense afgesonder.',
    'Markus sê Jesus kry hom innig jammer, steek Sy hand uit en raak aan hom.',
    'DIE PLEK WAAR MENSE VAN JOU WEGSTAAN, IS NIE NOODWENDIG DIE PLEK WAAR JESUS WEGSTAAN NIE.',
    '“Ek wil. Word rein.”',
    'Jesus se reinheid oorwin die man se onreinheid.',
    'buite op afgeleë plekke gebly het.',
    'Die man kom na Jesus toe soos hy is — en Jesus stuur hom nie weg nie.',
    'En Jesus se antwoord was:\n\n“Ek wil.”',
  ]) waar(`"${t.slice(0, 40)}…"`, b.includes(t))
  waar('die einde', b.endsWith('Dankie dat Sy genade groter is as my sonde, my seer en my verlede. Amen.'))
  is('woordtelling soos hy dit gestuur het', b.trim().split(/\s+/).length, WOORDE_DAG1)
  waar('geen drie newlines agtermekaar', !/\n\n\n/.test(b))
  waar("geen reguit apostrof in 'n (sy teks gebruik ’)", !/(^|\s)'n\s/.test(b))
}

console.log('\n── Albei wallpapers is in die week ──\n')
{
  const dag1 = WEEK15_DAE[0].blokke.filter(b => b.soort === 'wallpaper')
  const dag5 = WEEK15_DAE[4].blokke.filter(b => b.soort === 'wallpaper')
  is('Dag 1 sluit met n wallpaper', dag1.length, 1)
  is('uit wallpaperDag1', dag1[0].bronVeld, 'wallpaperDag1')
  is('Dag 5 sluit die week af met een', dag5.length, 1)
  is('uit wallpaper', dag5[0].bronVeld, 'wallpaper')
  const almal = WEEK15_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'wallpaper')
  is('presies twee in die hele week', almal.length, 2)
  is('en die wallpaper is die LAASTE ding op Dag 1', WEEK15_DAE[0].blokke.at(-1).soort, 'wallpaper')
  is('en op Dag 5', WEEK15_DAE[4].blokke.at(-1).soort, 'wallpaper')
}

console.log('\n── Elke vraag se id is UNIEK ──\n')
{
  const ids = WEEK15_DAE.flatMap(d => d.blokke).filter(b => b.id).map(b => b.id)
  is('geen duplikaat', new Set(ids).size, ids.length)
  is('en daar is vyf', ids.length, 5)
  const kyk = WEEK15_DAE[4].blokke.find(b => b.kop === 'KYK TERUG')
  is('KYK TERUG is die skryfkassie (dit eindig met n vraag)', kyk && kyk.soort, 'vraag')
  waar('met Dewald se vraag', kyk && /Wat keer my nog om eerlik na Jesus toe te kom\?$/.test(kyk.lyf))
  const stap = WEEK15_DAE[4].blokke.find(b => b.kop === 'JOU VOLGENDE STAP')
  is('JOU VOLGENDE STAP is n teksblok (n opdrag)', stap && stap.soort, 'teks')
  waar('en dit staan NA KYK TERUG', WEEK15_DAE[4].blokke.indexOf(stap) > WEEK15_DAE[4].blokke.indexOf(kyk))
  for (const id of ids) waar(`"${id}" is n bruikbare id`, /^[a-z][a-z0-9]*$/.test(id))
}

console.log('\n── Dewald se aanhaling staan soos HY dit geskryf het ──\n')
{
  /* 1:40 stem met die GAB; "Ek wil. Word rein." is SY bewoording (sien die kop). */
  const alles = JSON.stringify(WEEK15_DAE)
  waar('Dag 2: "As U wil, kan U my rein maak."', alles.includes('“As U wil, kan U my rein maak.”'))
  waar('Dag 4: "Ek wil. Word rein."', alles.includes('“Ek wil. Word rein.”'))
  is('daar is geen keuse-blok nie', WEEK15_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'kies').length, 0)
}

console.log('\n── Die reis aan die einde wys net wat gevra is ──\n')
{
  const geskryf = new Set(WEEK15_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'vraag').map(b => b.id))
  for (const r of WEEK15_REIS) {
    waar(`"${r.id}" is werklik n skryfvraag in die week`, geskryf.has(r.id))
    waar(`"${r.id}" het n kop`, r.kop && r.kop.length > 20)
  }
  is('drie stappe', WEEK15_REIS.length, 3)
  is('dit begin by Dag 1', WEEK15_REIS[0].id, 'afstand1')
  is('en eindig by Dag 5 se vraag', WEEK15_REIS[2].id, 'eerlik5')
}

console.log('\n── Die opening is kort ──\n')
{
  waar('maar dit is nie n les nie', WEEK15_OPENING.trim().split(/\s+/).length <= 120)
  waar('dit dra die week se kern', /En die man wat buite moes bly, kan weer teruggaan\.$/.test(WEEK15_OPENING))
  is('en die admin se openingskerm is dieselfde teks', WEKE[15].openingskerm, WEEK15_OPENING)
}

console.log('\n── Die register ken Week 15 ──\n')
{
  is('hetDae(15)', hetDae(15), true)
  is('die dae', weekDae(15), WEEK15_DAE)
  is('die reis', weekReis(15), WEEK15_REIS)
  is('die opening', weekOpening(15), WEEK15_OPENING)
  is('die deelsin', weekDeelsin(15), WEEK15_DEELSIN)
  is('die transkripsie', weekTranskripsie(15), WEEK15_TRANSKRIPSIE)
  is('die sessie', weekSessie(15), WEEK15_SESSIE)
  is('die klaar-skerm', weekKlaar(15), WEEK15_KLAAR)
  is('blokkeVir stem ooreen', blokkeVir(15, 3), blokkeVirDag15(3))
  is('n dag wat nie bestaan nie gee niks', blokkeVirDag15(9), [])
  is('maar nie week 17 nie', hetDae(17), false)
}

console.log('\n── Week 14 wys nou NA Week 15, en die titel stem ──\n')
{
  waar('WEEK14_VOLGENDE bestaan', !!WEEK14_VOLGENDE)
  is('en dit wys na week 15', WEEK14_VOLGENDE.week, 15)
  is('die register gee dieselfde', weekVolgende(14), WEEK14_VOLGENDE)
  is('die titel is Week 15 se egte titel', WEEK14_VOLGENDE.titel, WEKE[15].titel)
  waar('en dit se iets oor die week', WEEK14_VOLGENDE.lyf.length > 40)
}

console.log('\n── Week 15 wys nou NA Week 16 ──\n')
{
  waar('WEEK15_VOLGENDE bestaan', !!WEEK15_VOLGENDE)
  is('en dit wys na week 16', WEEK15_VOLGENDE.week, 16)
  is('die register gee dieselfde', weekVolgende(15), WEEK15_VOLGENDE)
  is('die titel is Week 16 se egte titel', WEEK15_VOLGENDE.titel, WEKE[16].titel)
}

console.log('\n── Die klaar-skerm praat oor HIERDIE week ──\n')
{
  const k = weekKlaar(15)
  is('Dewald se opskrif', k.kop, 'KOM NA JESUS TOE')
  waar('dit is nie Week 14 se slot nie', weekKlaar(14).kop !== k.kop)
  waar('dit eindig by die week se kernwaarheid', /DIE PLEK WAAR JESUS WEGSTAAN NIE\.$/.test(k.lyf))
}

console.log('\n── Die week se rekord kan PUBLISEER, SONDER n opname ──\n')
{
  const w = { ...WEKE[15] }
  const kontroles = { teks: true, konteks: true, jesus: true, toepassing: true, grens: true }
  is('weeknommer 15', w.weeknommer, 15)
  is('daar is geen stemboodskap nie', w.stemboodskapUrl, '')
  is('en geen video nie', w.videoId, '')
  waar('maar die boodskap is as GESKREWE gemerk', w.geskreweBoodskap === true)
  const gereed = { ...w, kontroles, hersieningStatus: 'goedgekeur' }
  is('met alles reg is daar geen fout nie', publiseerFoute(gereed), [])
  is('en dit mag publiseer', magPubliseer(gereed), true)
  waar('sonder die merkie mag dit NIE', !magPubliseer({ ...gereed, geskreweBoodskap: false }))
  waar('sonder die vyf kontroles mag dit NIE', !magPubliseer({ ...w, hersieningStatus: 'goedgekeur' }))
}

console.log('\n── Die dag-titels stem ooreen met die admin se rekord ──\n')
{
  const w = WEKE[15]
  for (let i = 0; i < 5; i++) is(`dag ${i + 1}`, w[`dag${i + 1}Titel`], WEEK15_DAE[i].titel)
  is('die week se titel is Dag 1 s\'n', w.titel, WEEK15_DAE[0].titel)
  is('môre se teaser noem Dag 2', w.moreTeaser, 'Môre: ' + WEEK15_DAE[1].titel)
  waar(`"${w.primereSkrif}" ontleed`, !!ontleedVerwysing(w.primereSkrif))
  is('kernwaarheid en weekKern is dieselfde sin', w.kernwaarheid, w.weekKern)
  is('die private vraag is Dewald s\'n', w.privaatRefleksie, 'Is daar iets waarvoor ek skaam is wat maak dat ek van Jesus af wil wegkruip?')
  waar('die groepleier: bly by Markus 1', /Hou die groep by die beweging van Markus 1/.test(w.fasiliteerderHoofpunt))
  waar('die grens: die siekte is nie n beeld vir n spesifieke sonde nie', /spesifieke sonde of moderne siekte/.test(w.fasiliteerderGrens))
}

console.log('\n── Die groepsessie ──\n')
{
  is('vier vrae', WEEK15_SESSIE.vrae.length, 4)
  for (const v of WEEK15_SESSIE.vrae) {
    waar(`"${v.slice(0, 30)}…" is n vraag`, v.includes('?'))
    waar(`"${v.slice(0, 30)}…" pas op n kaart (${v.length})`, v.length <= 200)
  }
  waar('n gebed', /Amen\.?$/.test(WEEK15_SESSIE.gebed.trim()))
  is('en dit is die admin se weekgebed', WEKE[15].gebed, WEEK15_SESSIE.gebed)
  for (let i = 0; i < 4; i++) is(`groepvraag ${i + 1} stem`, WEKE[15][`groepVraag${i + 1}`], WEEK15_SESSIE.vrae[i])
}

console.log('\n── Die deelsin ──\n')
{
  waar('dit pas in n boodskap', WEEK15_DEELSIN.length <= 220)
  is('en dit stem met die admin se eenSin', WEKE[15].eenSin, WEEK15_DEELSIN)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
