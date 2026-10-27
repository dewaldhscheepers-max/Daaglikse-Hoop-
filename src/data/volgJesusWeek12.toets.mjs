/* VOLG JESUS — WEEK 12: "JESUS SÊ: JULLE MOET JULLE VYANDE LIEFHÊ"
 *
 * Dewald het die week op 27 Oktober 2026 voluit gestuur. Hierdie toets keur
 * die PERKE (wat keer dat 'n dag soos huiswerk voel), die vorm van 'n week
 * SONDER 'n opname, Dag 1 se boodskap woord vir woord, en die vyf plekke wat
 * CLAUDE.md uitwys — veral die twee wat maklik agterbly: die BRUG van Week 11
 * af, en die verse teen die GAB.
 *
 *   node src/data/volgJesusWeek12.toets.mjs
 */
import {
  WEEK12_DAE, WEEK12_REIS, WEEK12_OPENING, WEEK12_DEELSIN, WEEK12_VOLGENDE,
  WEEK12_TRANSKRIPSIE, WEEK12_SESSIE, WEEK12_KLAAR, blokkeVirDag12,
} from './volgJesusWeek12.js'
import { WEEK11_VOLGENDE } from './volgJesusWeek11.js'
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

/* ── Die perke ──
 *
 * 210 en nie 180 nie — dieselfde keuse as Week 6 tot 9: sonder 'n opname staan
 * die hele week se onderrig GESKREWE. Die reel self word steeds gedra deur die
 * twee perke wat NIE beweeg het nie — vyf inhoudsblokke en twee antwoorde. */
const MAKS_TEKS = 210
const MAKS_BLOKKE = 5
const MAKS_ANTWOORDE = 2
/* Dag 1 se boodskap, soos Dewald dit gestuur het — getel met die
   vergelyking teen sy teks, nie gekies nie. */
const WOORDE_DAG1 = 460

console.log('\n── Vyf dae, en elkeen het n naam ──\n')
{
  is('vyf dae', WEEK12_DAE.length, 5)
  is('genommer 1 tot 5', WEEK12_DAE.map(d => d.n), [1, 2, 3, 4, 5])
  for (const d of WEEK12_DAE) {
    waar(`dag ${d.n} het n titel`, d.titel && d.titel.length > 3)
    waar(`dag ${d.n} het n merk`, d.merk && d.merk.length > 2)
    waar(`dag ${d.n} het n knoppie`, d.knop && d.knop.length > 3)
    waar(`dag ${d.n} het n klaar-kop`, d.klaarKop && d.klaarKop.length > 3)
    waar(`dag ${d.n} het n klaar-sin`, d.klaarLyf && d.klaarLyf.length > 10)
  }
  is('Dag 5 se knoppie voltooi die week', WEEK12_DAE[4].knop, 'VOLTOOI WEEK 12')
  is('en die klaar-kop se dit', WEEK12_DAE[4].klaarKop, 'WEEK 12 KLAAR.')
}

console.log('\n── Die perke: dit mag nie soos huiswerk voel nie ──\n')
{
  for (const d of WEEK12_DAE) {
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
}

console.log('\n── Elke dag sluit met n gebed ──\n')
{
  /* Dag 1 se gebed is die SLOT van Dewald se boodskap — hy het daar geen aparte
     GEBED gegee nie, en om dit uit te haal of te herhaal, verander sy boodskap
     of sit dit twee keer op een blad. */
  const d1 = WEEK12_DAE[0]
  is('dag 1 het geen aparte gebed-blok', d1.blokke.filter(b => b.soort === 'gebed').length, 0)
  const bood = d1.blokke.find(b => b.soort === 'boodskap')
  waar('want die boodskap eindig met die gebed',
       /Here, U weet wie my seergemaak het.*Amen\.$/s.test(bood.lyf.trim()))
  for (const d of WEEK12_DAE.slice(1)) {
    const gebed = d.blokke.filter(b => b.soort === 'gebed')
    is(`dag ${d.n} het presies een gebed`, gebed.length, 1)
    waar(`dag ${d.n} se gebed eindig met Amen`, /Amen\.?$/.test(gebed[0].lyf.trim()))
  }
}

console.log('\n── Elke Skrifgedeelte maak die Bybel oop ──\n')
{
  const skrifte = []
  for (const d of WEEK12_DAE) {
    const lees = d.blokke.filter(b => b.soort === 'lees')
    is(`dag ${d.n} het presies een LEES-blok`, lees.length, 1)
    const s = lees[0].skrif
    skrifte.push(s)
    waar(`dag ${d.n}: "${s}" ontleed`, !!ontleedVerwysing(s))
    /* Dag 1 se LEES-blok dra net die verwysing — Dewald het daar geen
       leesreel gegee nie; die boodskap begin direk daaronder. */
    if (d.n === 1) is('dag 1 se LEES-blok versin geen reel nie', lees[0].lyf, undefined)
    else waar(`dag ${d.n} se leesreel se wat om raak te sien`, lees[0].lyf && lees[0].lyf.length > 20)
  }
  for (let i = 1; i < skrifte.length; i++) {
    is(`dag ${i + 1} se Skrif verskil van dag ${i} s n`, skrifte[i] === skrifte[i - 1], false)
  }
  is('al vyf gedeeltes verskil', new Set(skrifte).size, 5)
  is('Dag 1 lees die hele gedeelte', skrifte[0], 'Matteus 5:43–48')
}

console.log('\n── GEEN STEMBOODSKAP: die boodskap word GELEES ──\n')
{
  /* Dewald: "Daar is GEEN stemnota, audio of klankspeler in Week 12 nie." */
  for (const d of WEEK12_DAE) {
    is(`dag ${d.n} het geen stem-blok`, d.blokke.some(b => b.soort === 'stem'), false)
  }
  is('en geen transkripsie', WEEK12_TRANSKRIPSIE, '')

  const b = WEEK12_DAE[0].blokke.find(x => x.soort === 'boodskap')
  waar('Dag 1 dra n boodskap-blok', !!b)
  is('met Dewald se opskrif', b.kop, 'LEES VANDAG SE BOODSKAP')
  waar(`en die boodskap dra die dag (${b.lyf.trim().split(/\s+/).length} woorde)`,
       b.lyf.trim().split(/\s+/).length > 250)
  const soorte = WEEK12_DAE[0].blokke.map(x => x.soort)
  waar('die boodskap volg op die lees', soorte.indexOf('boodskap') > soorte.indexOf('lees'))
  for (const d of WEEK12_DAE.slice(1)) {
    is(`dag ${d.n} het geen boodskap-blok`, d.blokke.some(x => x.soort === 'boodskap'), false)
  }
}

console.log('\n── Dag 1 se boodskap is Dewald s\'n, woord vir woord ──\n')
{
  /* "MOENIE ENIGE WOORD VERANDER NIE." Hierdie ankers staan oor die hele
     boodskap: die begin, elke vorm van die grond, die hoofletter-reels, en die
     einde. Val een, het iemand aan sy teks geraak. */
  const b = WEEK12_DAE[0].blokke.find(x => x.soort === 'boodskap').lyf
  waar('die begin', b.startsWith('Hier raak Jesus ongemaklik.\n\nHy sê:'))
  for (const t of [
    '“Hê julle vyande lief en bid vir dié wat julle vervolg.”',
    'Hy sê ook nie jy moet iemand onbeperkte toegang tot jou lewe gee nie.',
    'En dan het daardie persoon jou twee keer seergemaak:',
    'JOU VYAND HET JOU DALK SEERGEMAAK. MOENIE HOM OOK TOELAAT OM TE BESLUIT WATTER MENS JY WORD NIE.',
    'God laat die son opgaan oor goeie én slegte mense en laat reën oor regverdiges én onregverdiges.',
    'Vir wie moet ek begin bid, sodat haat nie begin bepaal wie ek word nie?',
    'MOENIE TOELAAT DAT IEMAND ANDERS SE SONDE JOU KARAKTER BEGIN VORM NIE.',
  ]) waar(`"${t.slice(0, 40)}…"`, b.includes(t))
  waar('die einde', b.endsWith('verander my hart sodat ek meer soos U word. Amen.'))
  is('woordtelling soos hy dit gestuur het', b.trim().split(/\s+/).length, WOORDE_DAG1)
  waar('geen drie newlines agtermekaar', !/\n\n\n/.test(b))
}

console.log('\n── Albei wallpapers is in die week ──\n')
{
  const dag1 = WEEK12_DAE[0].blokke.filter(b => b.soort === 'wallpaper')
  const dag5 = WEEK12_DAE[4].blokke.filter(b => b.soort === 'wallpaper')
  is('Dag 1 sluit met n wallpaper', dag1.length, 1)
  is('uit wallpaperDag1', dag1[0].bronVeld, 'wallpaperDag1')
  is('Dag 5 sluit die week af met een', dag5.length, 1)
  is('uit wallpaper', dag5[0].bronVeld, 'wallpaper')
  const almal = WEEK12_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'wallpaper')
  is('presies twee in die hele week', almal.length, 2)
  is('en die wallpaper is die LAASTE ding op Dag 1', WEEK12_DAE[0].blokke.at(-1).soort, 'wallpaper')
  is('en op Dag 5', WEEK12_DAE[4].blokke.at(-1).soort, 'wallpaper')
}

console.log('\n── Elke vraag se id is UNIEK ──\n')
{
  const ids = WEEK12_DAE.flatMap(d => d.blokke).filter(b => b.id).map(b => b.id)
  is('geen duplikaat', new Set(ids).size, ids.length)
  is('en daar is vyf', ids.length, 5)
  /* Die ids mag nie met 'n VORIGE week s'n bots nie: elke antwoord staan as
     vj_a_w<week>_<id>, dus is die week deel van die sleutel — maar 'n id wat
     elders iets anders beteken, maak die reis verwarrend om te lees. */
  const tb = WEEK12_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'terugblik')
  is('daar is geen terugblik-blok nie', tb.length, 0)
  const kyk = WEEK12_DAE[4].blokke.find(b => b.kop === 'KYK TERUG')
  waar('Dag 5 se KYK TERUG verwys na Dag 1 se kernvraag',
       kyk && /“Wie se optrede het nog te veel invloed op my hart\?”/.test(kyk.lyf))
  const stap = WEEK12_DAE[4].blokke.find(b => b.kop === 'JOU VOLGENDE STAP')
  is('JOU VOLGENDE STAP is n teksblok', stap && stap.soort, 'teks')
  waar('die reis wys Dag 1 se woorde terug', WEEK12_REIS[0].id === 'invloed1')
  for (const id of ids) waar(`"${id}" is n bruikbare id`, /^[a-z][a-z0-9]*$/.test(id))
}

console.log('\n── Dewald se aanhalings staan soos HY dit geskryf het ──\n')
{
  /* Hulle is sy bewoording, nie die GAB s'n nie (sien die kop van
     volgJesusWeek12.js). Niemand mag hulle stilweg na die GAB "regmaak" nie. */
  const alles = JSON.stringify(WEEK12_DAE)
  waar('Dag 2: "Bid vir dié wat julle vervolg."', alles.includes('“Bid vir dié wat julle vervolg.”'))
  waar('Dag 3: "Moenie deur die kwaad oorwin word nie…"', alles.includes('“Moenie deur die kwaad oorwin word nie, maar oorwin die kwaad deur die goeie.”'))
  is('daar is geen keuse-blok in hierdie week nie', WEEK12_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'kies').length, 0)
}

console.log('\n── Die reis aan die einde wys net wat gevra is ──\n')
{
  /* Net SKRYF-vrae: 'n keuse is 'n woord soos "geld", en die reis haal 'n
     mens se eie sinne aan. */
  const geskryf = new Set(WEEK12_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'vraag').map(b => b.id))
  for (const r of WEEK12_REIS) {
    waar(`"${r.id}" is werklik n skryfvraag in die week`, geskryf.has(r.id))
    waar(`"${r.id}" het n kop`, r.kop && r.kop.length > 20)
  }
  is('drie stappe', WEEK12_REIS.length, 3)
  is('geen duplikaat in die reis', new Set(WEEK12_REIS.map(r => r.id)).size, WEEK12_REIS.length)
}

console.log('\n── Die opening is kort ──\n')
{
  waar('daar is n opening', WEEK12_OPENING.length > 40)
  waar('maar dit is nie n les nie', WEEK12_OPENING.trim().split(/\s+/).length <= 120)
  waar('dit dra Jesus se opdrag', /Julle moet julle vyande liefhê\./.test(WEEK12_OPENING))
  is('en die admin se openingskerm is dieselfde teks', WEKE[12].openingskerm, WEEK12_OPENING)
}

console.log('\n── Die register ken Week 12 ──\n')
{
  is('hetDae(12)', hetDae(12), true)
  is('die dae', weekDae(12), WEEK12_DAE)
  is('die reis', weekReis(12), WEEK12_REIS)
  is('die opening', weekOpening(12), WEEK12_OPENING)
  is('die deelsin', weekDeelsin(12), WEEK12_DEELSIN)
  is('die transkripsie', weekTranskripsie(12), WEEK12_TRANSKRIPSIE)
  is('die sessie', weekSessie(12), WEEK12_SESSIE)
  is('die klaar-skerm', weekKlaar(12), WEEK12_KLAAR)
  is('blokkeVir stem ooreen', blokkeVir(12, 3), blokkeVirDag12(3))
  is('n dag wat nie bestaan nie gee niks', blokkeVirDag12(9), [])
  /* Sonder hierdie inskrywing val die week terug op die ou huiswerk-skerm. */
  is('maar nie week 13 nie', hetDae(13), false)
}

console.log('\n── Week 11 wys nou NA Week 12, en die titel stem ──\n')
{
  waar('WEEK11_VOLGENDE bestaan', !!WEEK11_VOLGENDE)
  is('en dit wys na week 12', WEEK11_VOLGENDE.week, 12)
  is('die register gee dieselfde', weekVolgende(11), WEEK11_VOLGENDE)
  is('die titel is Week 11 se egte titel', WEEK11_VOLGENDE.titel, WEKE[12].titel)
  waar('en dit se iets oor die week', WEEK11_VOLGENDE.lyf.length > 40)
}

console.log('\n── En Week 12 loop nog nie verder nie ──\n')
{
  is('WEEK12_VOLGENDE is null', WEEK12_VOLGENDE, null)
  is('en die register gee ook null', weekVolgende(12), null)
}

console.log('\n── Die klaar-skerm praat oor HIERDIE week ──\n')
{
  const k = weekKlaar(12)
  waar('Week 12 bring sy eie klaar-woorde', !!(k && k.kop && k.lyf))
  is('en dit is die uitgevoerde blok', k, WEEK12_KLAAR)
  waar('dit is nie Week 1 se ou slot nie', !/BEGIN KYK/i.test(k.kop))
  waar('dit is nie Week 11 se slot nie', weekKlaar(11).kop !== k.kop)
  is('Dewald se opskrif', k.kop, 'JESUS SÊ: JULLE MOET JULLE VYANDE LIEFHÊ')
  waar('dit eindig by die week se sin', /WAT IEMAND AAN JOU GEDOEN HET, HOEF NIE TE BEPAAL WAT IN JOU HART GROEI NIE\.$/.test(k.lyf))
}

console.log('\n── Die week se rekord kan PUBLISEER, SONDER n opname ──\n')
{
  const w = { ...WEKE[12] }
  const kontroles = { teks: true, konteks: true, jesus: true, toepassing: true, grens: true }
  is('weeknommer 12', w.weeknommer, 12)
  is('daar is geen stemboodskap nie', w.stemboodskapUrl, '')
  is('en geen video nie', w.videoId, '')
  waar('maar die boodskap is as GESKREWE gemerk', w.geskreweBoodskap === true)

  const gereed = { ...w, kontroles, hersieningStatus: 'goedgekeur' }
  is('met alles reg is daar geen fout nie', publiseerFoute(gereed), [])
  is('en dit mag publiseer', magPubliseer(gereed), true)

  const sonder = { ...gereed, geskreweBoodskap: false }
  waar('sonder die merkie mag dit NIE', !magPubliseer(sonder))
  waar('en die fout se hoekom', publiseerFoute(sonder).some(f => /hoofboodskap/i.test(f)))
  const weg = { ...gereed }
  delete weg.geskreweBoodskap
  waar('n ontbrekende merkie tel ook nie', !magPubliseer(weg))
  /* Die kontroles is Dewald se eie daad in die admin — sonder hulle mag niks uit. */
  waar('sonder die vyf kontroles mag dit NIE', !magPubliseer({ ...w, hersieningStatus: 'goedgekeur' }))
}

console.log('\n── Die dag-titels stem ooreen met die admin se rekord ──\n')
{
  const w = WEKE[12]
  for (let i = 0; i < 5; i++) {
    is(`dag ${i + 1}`, w[`dag${i + 1}Titel`], WEEK12_DAE[i].titel)
  }
  is('die week se titel is Dag 1 s\'n', w.titel, WEEK12_DAE[0].titel)
  is('môre se teaser noem Dag 2', w.moreTeaser, 'Môre: ' + WEEK12_DAE[1].titel)
}

console.log('\n── Die admin se Skrifte is geldig ──\n')
{
  const w = WEKE[12]
  waar(`"${w.primereSkrif}" ontleed`, !!ontleedVerwysing(w.primereSkrif))
  is('geen versinde ondersteunende Skrif nie', w.ondersteunendeSkrif, '')
  is('kernwaarheid en weekKern is dieselfde sin', w.kernwaarheid, w.weekKern)
}

console.log('\n── Die fasiliteerder kry sy grens ──\n')
{
  const w = WEKE[12]
  waar('daar is n hoofpunt', w.fasiliteerderHoofpunt.length > 80)
  waar('en n grens', w.fasiliteerderGrens.length > 80)
  waar('die hoofpunt se kern', /nie dat mense verkeerde gedrag moet verdra nie/.test(w.fasiliteerderHoofpunt))
  waar('die grens: nie n lang bespreking oor grense nie', /lang bespreking oor grense/.test(w.fasiliteerderGrens))
  waar('en geen druk om n verhouding weer aan te knoop nie', /nie druk op mense plaas om onmiddellik weer ’n verhouding aan te knoop/.test(w.fasiliteerderGrens))
  is('die pastorale risiko is medium (seer en mishandeling)', w.pastoraleRisiko, 'medium')
  is('die private vraag is Dewald s\'n', w.privaatRefleksie, 'Het iemand wat my seergemaak het nog te veel invloed op my gedagtes, emosies of reaksies?')
}

console.log('\n── Die groepsessie ──\n')
{
  waar('n titel', WEEK12_SESSIE.titel.length > 3)
  is('vier vrae', WEEK12_SESSIE.vrae.length, 4)
  for (const v of WEEK12_SESSIE.vrae) {
    waar(`"${v.slice(0, 30)}…" is n vraag`, v.includes('?'))
    waar(`"${v.slice(0, 30)}…" pas op n kaart (${v.length})`, v.length <= 200)
  }
  waar('n gebed', /Amen\.?$/.test(WEEK12_SESSIE.gebed.trim()))
  is('en dit is die admin se weekgebed', WEKE[12].gebed, WEEK12_SESSIE.gebed)
  for (const s of WEEK12_SESSIE.skrifte) waar(`"${s}" ontleed`, !!ontleedVerwysing(s))
  const w = WEKE[12]
  for (let i = 0; i < 4; i++) {
    is(`groepvraag ${i + 1} stem`, w[`groepVraag${i + 1}`], WEEK12_SESSIE.vrae[i])
  }
}

console.log('\n── Die deelsin ──\n')
{
  waar('daar is een', WEEK12_DEELSIN.length > 30)
  waar('dit pas in n boodskap', WEEK12_DEELSIN.length <= 220)
  is('en dit stem met die admin se eenSin', WEKE[12].eenSin, WEEK12_DEELSIN)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
