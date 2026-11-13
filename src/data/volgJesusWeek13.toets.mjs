/* VOLG JESUS — WEEK 13: "TWEE HUISE. EEN STORM."
 *
 * Dewald het die week op 5 November 2026 voluit gestuur. Hierdie toets keur
 * die PERKE (wat keer dat 'n dag soos huiswerk voel), die vorm van 'n week
 * SONDER 'n opname, Dag 1 se boodskap woord vir woord, en die vyf plekke wat
 * CLAUDE.md uitwys — veral die twee wat maklik agterbly: die BRUG van Week 12
 * af, en die verse teen die GAB.
 *
 *   node src/data/volgJesusWeek13.toets.mjs
 */
import {
  WEEK13_DAE, WEEK13_REIS, WEEK13_OPENING, WEEK13_DEELSIN, WEEK13_VOLGENDE,
  WEEK13_TRANSKRIPSIE, WEEK13_SESSIE, WEEK13_KLAAR, blokkeVirDag13,
} from './volgJesusWeek13.js'
import { WEEK12_VOLGENDE } from './volgJesusWeek12.js'
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

/* ── Die perke ── Dieselfde as Week 6 tot 12: sonder 'n opname staan die hele
   week se onderrig GESKREWE, dus 210. Vyf inhoudsblokke en twee antwoorde het
   nie geskuif nie. */
const MAKS_TEKS = 210
const MAKS_BLOKKE = 5
const MAKS_ANTWOORDE = 2
/* Dag 1 se boodskap, soos Dewald dit gestuur het. */
const WOORDE_DAG1 = 417

console.log('\n── Vyf dae, en elkeen het n naam ──\n')
{
  is('vyf dae', WEEK13_DAE.length, 5)
  is('genommer 1 tot 5', WEEK13_DAE.map(d => d.n), [1, 2, 3, 4, 5])
  for (const d of WEEK13_DAE) {
    waar(`dag ${d.n} het n titel`, d.titel && d.titel.length > 3)
    waar(`dag ${d.n} het n merk`, d.merk && d.merk.length > 2)
    waar(`dag ${d.n} het n knoppie`, d.knop && d.knop.length > 3)
    waar(`dag ${d.n} het n klaar-kop`, d.klaarKop && d.klaarKop.length > 3)
    waar(`dag ${d.n} het n klaar-sin`, d.klaarLyf && d.klaarLyf.length > 10)
  }
  is('Dag 5 se knoppie voltooi die week', WEEK13_DAE[4].knop, 'VOLTOOI WEEK 13')
  is('en die klaar-kop se dit', WEEK13_DAE[4].klaarKop, 'WEEK 13 KLAAR.')
}

console.log('\n── Die perke: dit mag nie soos huiswerk voel nie ──\n')
{
  for (const d of WEEK13_DAE) {
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
  /* Dag 5 vra EEN ding om te skryf: die stap. KYK TERUG is 'n herinnering. */
  is('Dag 5 het presies een skryfkassie', WEEK13_DAE[4].blokke.filter(b => b.soort === 'vraag').length, 1)
}

console.log('\n── Elke dag sluit met n gebed ──\n')
{
  const d1 = WEEK13_DAE[0]
  is('dag 1 het geen aparte gebed-blok', d1.blokke.filter(b => b.soort === 'gebed').length, 0)
  const bood = d1.blokke.find(b => b.soort === 'boodskap')
  waar('want die boodskap eindig met die gebed',
       /Vader, wys my waar ek U Woord hoor.*Amen\.$/s.test(bood.lyf.trim()))
  for (const d of WEEK13_DAE.slice(1)) {
    const gebed = d.blokke.filter(b => b.soort === 'gebed')
    is(`dag ${d.n} het presies een gebed`, gebed.length, 1)
    waar(`dag ${d.n} se gebed eindig met Amen`, /Amen\.?$/.test(gebed[0].lyf.trim()))
  }
}

console.log('\n── Elke Skrifgedeelte maak die Bybel oop ──\n')
{
  const skrifte = []
  for (const d of WEEK13_DAE) {
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
  is('Dag 1 lees die hele gedeelte', skrifte[0], 'Matteus 7:24–27')
  /* Dag 4 se "Matteus 7:25, 27" is TWEE verse in een hoofstuk: die skerm
     wys albei, elkeen met sy eie knoppie. */
  is('Dag 4 se twee verse ontleed as twee stukke',
     ontleedVerwysing(skrifte[3]).map(s => [s.hoofstuk, s.van, s.tot]), [[7, 25, 25], [7, 27, 27]])
}

console.log('\n── GEEN STEMBOODSKAP: die boodskap word GELEES ──\n')
{
  for (const d of WEEK13_DAE) {
    is(`dag ${d.n} het geen stem-blok`, d.blokke.some(b => b.soort === 'stem'), false)
  }
  is('en geen transkripsie', WEEK13_TRANSKRIPSIE, '')
  const b = WEEK13_DAE[0].blokke.find(x => x.soort === 'boodskap')
  waar('Dag 1 dra n boodskap-blok', !!b)
  is('met die opskrif', b.kop, 'LEES VANDAG SE BOODSKAP')
  const soorte = WEEK13_DAE[0].blokke.map(x => x.soort)
  waar('die boodskap volg op die lees', soorte.indexOf('boodskap') > soorte.indexOf('lees'))
  for (const d of WEEK13_DAE.slice(1)) {
    is(`dag ${d.n} het geen boodskap-blok`, d.blokke.some(x => x.soort === 'boodskap'), false)
  }
}

console.log('\n── Dag 1 se boodskap is Dewald s\'n, woord vir woord ──\n')
{
  const b = WEEK13_DAE[0].blokke.find(x => x.soort === 'boodskap').lyf
  waar('die begin', b.startsWith('Jesus eindig die Bergrede met ’n eenvoudige beeld:\n\nTwee mense bou elkeen ’n huis.'))
  for (const t of [
    'Die wind slaan teen albei huise.',
    'DIE VERSKIL TUSSEN DIE TWEE HUISE WAS NIE WIE JESUS GEHOOR HET NIE. DIT WAS WIE GEDOEN HET WAT HY SÊ.',
    'Jy kan preke luister, verse ken en selfs saamstem met wat Jesus sê, maar as dit nooit begin verander hoe jy leef nie, bly dit net kennis.',
    'JY BOU NIE JOU FONDAMENT WANNEER DIE STORM BEGIN NIE. JY ONTDEK IN DIE STORM WAAROP JY REEDS GEBOU HET.',
    'Daarom is die vraag nie net:\n\n“Wat weet ek van Jesus?”\n\nnie.',
    '“Wat doen ek met wat Jesus reeds vir my gesê het?”',
    'OM JESUS TE HOOR GEE JOU DIE WAARHEID. OM HOM TE GEHOORSAAM BOU JOU LEWE DAAROP.',
  ]) waar(`"${t.slice(0, 40)}…"`, b.includes(t))
  waar('die einde', b.endsWith('Bou my lewe op ’n fondament wat sal bly staan wanneer die storms kom. Amen.'))
  is('woordtelling soos hy dit gestuur het', b.trim().split(/\s+/).length, WOORDE_DAG1)
  waar('geen drie newlines agtermekaar', !/\n\n\n/.test(b))
  waar("geen reguit apostrof in 'n (sy teks gebruik ’)", !/(^|\s)'n\s/.test(b))
}

console.log('\n── Albei wallpapers is in die week ──\n')
{
  const dag1 = WEEK13_DAE[0].blokke.filter(b => b.soort === 'wallpaper')
  const dag5 = WEEK13_DAE[4].blokke.filter(b => b.soort === 'wallpaper')
  is('Dag 1 sluit met n wallpaper', dag1.length, 1)
  is('uit wallpaperDag1', dag1[0].bronVeld, 'wallpaperDag1')
  is('Dag 5 sluit die week af met een', dag5.length, 1)
  is('uit wallpaper', dag5[0].bronVeld, 'wallpaper')
  const almal = WEEK13_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'wallpaper')
  is('presies twee in die hele week', almal.length, 2)
  is('en die wallpaper is die LAASTE ding op Dag 1', WEEK13_DAE[0].blokke.at(-1).soort, 'wallpaper')
  is('en op Dag 5', WEEK13_DAE[4].blokke.at(-1).soort, 'wallpaper')
}

console.log('\n── Elke vraag se id is UNIEK ──\n')
{
  const ids = WEEK13_DAE.flatMap(d => d.blokke).filter(b => b.id).map(b => b.id)
  is('geen duplikaat', new Set(ids).size, ids.length)
  is('en daar is vyf', ids.length, 5)
  const kyk = WEEK13_DAE[4].blokke.find(b => b.kop === 'KYK TERUG')
  is('KYK TERUG is n teksblok', kyk && kyk.soort, 'teks')
  waar('wat na die week se kernvraag verwys',
       kyk && /“Wat doen ek met wat Jesus reeds vir my gesê het\?”/.test(kyk.lyf))
  const stap = WEEK13_DAE[4].blokke.find(b => b.kop === 'JOU VOLGENDE STAP')
  is('JOU VOLGENDE STAP is die skryfkassie', stap && stap.soort, 'vraag')
  waar('en dit staan NA KYK TERUG', WEEK13_DAE[4].blokke.indexOf(stap) > WEEK13_DAE[4].blokke.indexOf(kyk))
  for (const id of ids) waar(`"${id}" is n bruikbare id`, /^[a-z][a-z0-9]*$/.test(id))
}

console.log('\n── Dewald se aanhaling staan soos HY dit geskryf het ──\n')
{
  /* Sy bewoording, nie die GAB s'n nie (sien die kop van volgJesusWeek13.js). */
  const alles = JSON.stringify(WEEK13_DAE)
  waar('Dag 5: "Waarom noem julle My ‘Here, Here!’…"',
       alles.includes('“Waarom noem julle My ‘Here, Here!’ maar julle doen nie wat Ek sê nie?”'))
  is('daar is geen keuse-blok nie', WEEK13_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'kies').length, 0)
}

console.log('\n── Die reis aan die einde wys net wat gevra is ──\n')
{
  const geskryf = new Set(WEEK13_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'vraag').map(b => b.id))
  for (const r of WEEK13_REIS) {
    waar(`"${r.id}" is werklik n skryfvraag in die week`, geskryf.has(r.id))
    waar(`"${r.id}" het n kop`, r.kop && r.kop.length > 20)
  }
  is('drie stappe', WEEK13_REIS.length, 3)
  is('dit begin by Dag 1', WEEK13_REIS[0].id, 'doen1')
  is('en eindig by die stap', WEEK13_REIS[2].id, 'stap5')
}

console.log('\n── Die opening is kort ──\n')
{
  waar('maar dit is nie n les nie', WEEK13_OPENING.trim().split(/\s+/).length <= 120)
  waar('dit dra die week se kern', /Die een hoor wat Jesus sê en doen dit\.$/.test(WEEK13_OPENING))
  is('en die admin se openingskerm is dieselfde teks', WEKE[13].openingskerm, WEEK13_OPENING)
}

console.log('\n── Die register ken Week 13 ──\n')
{
  is('hetDae(13)', hetDae(13), true)
  is('die dae', weekDae(13), WEEK13_DAE)
  is('die reis', weekReis(13), WEEK13_REIS)
  is('die opening', weekOpening(13), WEEK13_OPENING)
  is('die deelsin', weekDeelsin(13), WEEK13_DEELSIN)
  is('die transkripsie', weekTranskripsie(13), WEEK13_TRANSKRIPSIE)
  is('die sessie', weekSessie(13), WEEK13_SESSIE)
  is('die klaar-skerm', weekKlaar(13), WEEK13_KLAAR)
  is('blokkeVir stem ooreen', blokkeVir(13, 3), blokkeVirDag13(3))
  is('n dag wat nie bestaan nie gee niks', blokkeVirDag13(9), [])
  is('maar nie week 15 nie', hetDae(15), false)
}

console.log('\n── Week 12 wys nou NA Week 13, en die titel stem ──\n')
{
  waar('WEEK12_VOLGENDE bestaan', !!WEEK12_VOLGENDE)
  is('en dit wys na week 13', WEEK12_VOLGENDE.week, 13)
  is('die register gee dieselfde', weekVolgende(12), WEEK12_VOLGENDE)
  is('die titel is Week 13 se egte titel', WEEK12_VOLGENDE.titel, WEKE[13].titel)
  waar('en dit se iets oor die week', WEEK12_VOLGENDE.lyf.length > 40)
}

console.log('\n── Week 13 wys nou NA Week 14 ──\n')
{
  /* Week 14 bestaan sedert 13 November 2026 — sien volgJesusWeek14.toets.mjs. */
  waar('WEEK13_VOLGENDE bestaan', !!WEEK13_VOLGENDE)
  is('en dit wys na week 14', WEEK13_VOLGENDE.week, 14)
  is('die register gee dieselfde', weekVolgende(13), WEEK13_VOLGENDE)
}

console.log('\n── Die klaar-skerm praat oor HIERDIE week ──\n')
{
  const k = weekKlaar(13)
  is('Dewald se opskrif', k.kop, 'WAAROP BOU JY?')
  waar('dit is nie Week 12 se slot nie', weekKlaar(12).kop !== k.kop)
  waar('dit eindig by die week se vraag', /WAT DOEN JY MET WAT JESUS VIR JOU SÊ\?$/.test(k.lyf))
}

console.log('\n── Die week se rekord kan PUBLISEER, SONDER n opname ──\n')
{
  const w = { ...WEKE[13] }
  const kontroles = { teks: true, konteks: true, jesus: true, toepassing: true, grens: true }
  is('weeknommer 13', w.weeknommer, 13)
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
  const w = WEKE[13]
  for (let i = 0; i < 5; i++) is(`dag ${i + 1}`, w[`dag${i + 1}Titel`], WEEK13_DAE[i].titel)
  is('die week se titel is Dag 1 s\'n', w.titel, WEEK13_DAE[0].titel)
  is('môre se teaser noem Dag 2', w.moreTeaser, 'Môre: ' + WEEK13_DAE[1].titel)
  waar(`"${w.primereSkrif}" ontleed`, !!ontleedVerwysing(w.primereSkrif))
  is('kernwaarheid en weekKern is dieselfde sin', w.kernwaarheid, w.weekKern)
  is('die private vraag is Dewald s\'n', w.privaatRefleksie, 'Waar hoor ek wat Jesus sê, maar doen ek dit nog nie?')
  waar('die groepleier: hoor en doen', /Jesus se hoofpunt is hoor en doen\./.test(w.fasiliteerderHoofpunt))
  waar('die grens: nie redding verdien nie', /Ons word deur genade gered\./.test(w.fasiliteerderGrens))
}

console.log('\n── Die groepsessie ──\n')
{
  is('vier vrae', WEEK13_SESSIE.vrae.length, 4)
  for (const v of WEEK13_SESSIE.vrae) {
    waar(`"${v.slice(0, 30)}…" is n vraag`, v.includes('?'))
    waar(`"${v.slice(0, 30)}…" pas op n kaart (${v.length})`, v.length <= 200)
  }
  waar('n gebed', /Amen\.?$/.test(WEEK13_SESSIE.gebed.trim()))
  is('en dit is die admin se weekgebed', WEKE[13].gebed, WEEK13_SESSIE.gebed)
  for (let i = 0; i < 4; i++) is(`groepvraag ${i + 1} stem`, WEKE[13][`groepVraag${i + 1}`], WEEK13_SESSIE.vrae[i])
}

console.log('\n── Die deelsin ──\n')
{
  waar('dit pas in n boodskap', WEEK13_DEELSIN.length <= 220)
  is('en dit stem met die admin se eenSin', WEKE[13].eenSin, WEEK13_DEELSIN)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
