/* VOLG JESUS — WEEK 11: "WAT IS DIE GROOTSTE GEBOD?"
 *
 * Dewald het die week op 21 Oktober 2026 voluit gestuur. Hierdie toets keur
 * die PERKE (wat keer dat 'n dag soos huiswerk voel), die vorm van 'n week
 * SONDER 'n opname, Dag 1 se boodskap woord vir woord, en die vyf plekke wat
 * CLAUDE.md uitwys — veral die twee wat maklik agterbly: die BRUG van Week 10
 * af, en die verse teen die GAB.
 *
 *   node src/data/volgJesusWeek11.toets.mjs
 */
import {
  WEEK11_DAE, WEEK11_REIS, WEEK11_OPENING, WEEK11_DEELSIN, WEEK11_VOLGENDE,
  WEEK11_TRANSKRIPSIE, WEEK11_SESSIE, WEEK11_KLAAR, blokkeVirDag11,
} from './volgJesusWeek11.js'
import { WEEK10_VOLGENDE } from './volgJesusWeek10.js'
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
const WOORDE_DAG1 = 399

console.log('\n── Vyf dae, en elkeen het n naam ──\n')
{
  is('vyf dae', WEEK11_DAE.length, 5)
  is('genommer 1 tot 5', WEEK11_DAE.map(d => d.n), [1, 2, 3, 4, 5])
  for (const d of WEEK11_DAE) {
    waar(`dag ${d.n} het n titel`, d.titel && d.titel.length > 3)
    waar(`dag ${d.n} het n merk`, d.merk && d.merk.length > 2)
    waar(`dag ${d.n} het n knoppie`, d.knop && d.knop.length > 3)
    waar(`dag ${d.n} het n klaar-kop`, d.klaarKop && d.klaarKop.length > 3)
    waar(`dag ${d.n} het n klaar-sin`, d.klaarLyf && d.klaarLyf.length > 10)
  }
  is('Dag 5 se knoppie voltooi die week', WEEK11_DAE[4].knop, 'VOLTOOI WEEK 11')
  is('en die klaar-kop se dit', WEEK11_DAE[4].klaarKop, 'WEEK 11 KLAAR.')
}

console.log('\n── Die perke: dit mag nie soos huiswerk voel nie ──\n')
{
  for (const d of WEEK11_DAE) {
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
  const d1 = WEEK11_DAE[0]
  is('dag 1 het geen aparte gebed-blok', d1.blokke.filter(b => b.soort === 'gebed').length, 0)
  const bood = d1.blokke.find(b => b.soort === 'boodskap')
  waar('want die boodskap eindig met die gebed',
       /Here, help my om U nie net met my woorde lief te hê nie.*Amen\.$/s.test(bood.lyf.trim()))
  for (const d of WEEK11_DAE.slice(1)) {
    const gebed = d.blokke.filter(b => b.soort === 'gebed')
    is(`dag ${d.n} het presies een gebed`, gebed.length, 1)
    waar(`dag ${d.n} se gebed eindig met Amen`, /Amen\.?$/.test(gebed[0].lyf.trim()))
  }
}

console.log('\n── Elke Skrifgedeelte maak die Bybel oop ──\n')
{
  const skrifte = []
  for (const d of WEEK11_DAE) {
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
  is('Dag 1 lees die hele gedeelte', skrifte[0], 'Matteus 22:34–40')
}

console.log('\n── GEEN STEMBOODSKAP: die boodskap word GELEES ──\n')
{
  /* Dewald: "Daar is GEEN stemnota of audio in Week 11 nie." */
  for (const d of WEEK11_DAE) {
    is(`dag ${d.n} het geen stem-blok`, d.blokke.some(b => b.soort === 'stem'), false)
  }
  is('en geen transkripsie', WEEK11_TRANSKRIPSIE, '')

  const b = WEEK11_DAE[0].blokke.find(x => x.soort === 'boodskap')
  waar('Dag 1 dra n boodskap-blok', !!b)
  is('met Dewald se opskrif', b.kop, 'LEES VANDAG SE BOODSKAP')
  waar(`en die boodskap dra die dag (${b.lyf.trim().split(/\s+/).length} woorde)`,
       b.lyf.trim().split(/\s+/).length > 250)
  const soorte = WEEK11_DAE[0].blokke.map(x => x.soort)
  waar('die boodskap volg op die lees', soorte.indexOf('boodskap') > soorte.indexOf('lees'))
  for (const d of WEEK11_DAE.slice(1)) {
    is(`dag ${d.n} het geen boodskap-blok`, d.blokke.some(x => x.soort === 'boodskap'), false)
  }
}

console.log('\n── Dag 1 se boodskap is Dewald s\'n, woord vir woord ──\n')
{
  /* "MOENIE ENIGE WOORD VERANDER NIE." Hierdie ankers staan oor die hele
     boodskap: die begin, elke vorm van die grond, die hoofletter-reels, en die
     einde. Val een, het iemand aan sy teks geraak. */
  const b = WEEK11_DAE[0].blokke.find(x => x.soort === 'boodskap').lyf
  waar('die begin', b.startsWith('Hulle vra vir Jesus wat die grootste gebod is.\n\nHy antwoord:'))
  for (const t of [
    '“Jy moet die Here jou God liefhê met jou hele hart en met jou hele siel en met jou hele verstand.”',
    '“Jy moet jou naaste liefhê soos jouself.”',
    '1 Johannes 4 stel dit baie sterk:',
    'JY KAN NIE AANHOU SÊ JY HET GOD LIEF TERWYL JY MENSE DOELBEWUS VERNIETIG NIE.',
    'Jou pyn gee jou nie die reg om ander mense seer te maak nie.',
    '“KAN MENSE IETS VAN MY LIEFDE VIR GOD SIEN IN HOE EK HULLE BEHANDEL?”',
    'Want die grootste gebod begin by God—\n\nmaar dit stop nie daar nie.',
    'JOU VERHOUDING MET GOD WORD UITEINDELIK SIGBAAR IN HOE JY MENSE BEHANDEL.',
  ]) waar(`"${t.slice(0, 40)}…"`, b.includes(t))
  waar('die einde', b.endsWith('op ’n manier wat wys dat ek aan U behoort. Amen.'))
  is('woordtelling soos hy dit gestuur het', b.trim().split(/\s+/).length, WOORDE_DAG1)
  waar('geen drie newlines agtermekaar', !/\n\n\n/.test(b))
}

console.log('\n── Albei wallpapers is in die week ──\n')
{
  const dag1 = WEEK11_DAE[0].blokke.filter(b => b.soort === 'wallpaper')
  const dag5 = WEEK11_DAE[4].blokke.filter(b => b.soort === 'wallpaper')
  is('Dag 1 sluit met n wallpaper', dag1.length, 1)
  is('uit wallpaperDag1', dag1[0].bronVeld, 'wallpaperDag1')
  is('Dag 5 sluit die week af met een', dag5.length, 1)
  is('uit wallpaper', dag5[0].bronVeld, 'wallpaper')
  const almal = WEEK11_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'wallpaper')
  is('presies twee in die hele week', almal.length, 2)
  is('en die wallpaper is die LAASTE ding op Dag 1', WEEK11_DAE[0].blokke.at(-1).soort, 'wallpaper')
  is('en op Dag 5', WEEK11_DAE[4].blokke.at(-1).soort, 'wallpaper')
}

console.log('\n── Elke vraag se id is UNIEK ──\n')
{
  const ids = WEEK11_DAE.flatMap(d => d.blokke).filter(b => b.id).map(b => b.id)
  is('geen duplikaat', new Set(ids).size, ids.length)
  is('en daar is vyf', ids.length, 5)
  /* Die ids mag nie met 'n VORIGE week s'n bots nie: elke antwoord staan as
     vj_a_w<week>_<id>, dus is die week deel van die sleutel — maar 'n id wat
     elders iets anders beteken, maak die reis verwarrend om te lees. */
  const tb = WEEK11_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'terugblik')
  is('daar is geen terugblik-blok nie', tb.length, 0)
  const kyk = WEEK11_DAE[4].blokke.find(b => b.kop === 'KYK TERUG')
  waar('Dag 5 se KYK TERUG verwys na Dag 1 se kernvraag',
       kyk && /“Kan mense iets van my liefde vir God sien in hoe ek hulle behandel\?”/.test(kyk.lyf))
  const stap = WEEK11_DAE[4].blokke.find(b => b.kop === 'JOU VOLGENDE STAP')
  is('JOU VOLGENDE STAP is n teksblok', stap && stap.soort, 'teks')
  waar('die reis wys Dag 1 se woorde terug', WEEK11_REIS[0].id === 'liefde1')
  for (const id of ids) waar(`"${id}" is n bruikbare id`, /^[a-z][a-z0-9]*$/.test(id))
}

console.log('\n── Dag 2 se tikfout, en net daardie een ──\n')
{
  /* Dewald: "TERSSELFDERtyD" — reggemaak; sien die kop van volgJesusWeek11.js. */
  const t = WEEK11_DAE[1].blokke.find(b => b.soort === 'teks').lyf
  waar('TERSELFDERTYD reg gespel', /HOM TERSELFDERTYD NET ’N KLEIN DEEL/.test(t))
  waar('die tikfout is nêrens nie', !JSON.stringify(WEEK11_DAE).includes('TERSSELFDER'))
  is('daar is geen keuse-blok in hierdie week nie', WEEK11_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'kies').length, 0)
}

console.log('\n── Die reis aan die einde wys net wat gevra is ──\n')
{
  /* Net SKRYF-vrae: 'n keuse is 'n woord soos "geld", en die reis haal 'n
     mens se eie sinne aan. */
  const geskryf = new Set(WEEK11_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'vraag').map(b => b.id))
  for (const r of WEEK11_REIS) {
    waar(`"${r.id}" is werklik n skryfvraag in die week`, geskryf.has(r.id))
    waar(`"${r.id}" het n kop`, r.kop && r.kop.length > 20)
  }
  is('drie stappe', WEEK11_REIS.length, 3)
  is('geen duplikaat in die reis', new Set(WEEK11_REIS.map(r => r.id)).size, WEEK11_REIS.length)
}

console.log('\n── Die opening is kort ──\n')
{
  waar('daar is n opening', WEEK11_OPENING.length > 40)
  waar('maar dit is nie n les nie', WEEK11_OPENING.trim().split(/\s+/).length <= 120)
  waar('dit dra die week se twee dinge', /Liefde vir God\.\n\nLiefde vir mense\./.test(WEEK11_OPENING))
  is('en die admin se openingskerm is dieselfde teks', WEKE[11].openingskerm, WEEK11_OPENING)
}

console.log('\n── Die register ken Week 11 ──\n')
{
  is('hetDae(11)', hetDae(11), true)
  is('die dae', weekDae(11), WEEK11_DAE)
  is('die reis', weekReis(11), WEEK11_REIS)
  is('die opening', weekOpening(11), WEEK11_OPENING)
  is('die deelsin', weekDeelsin(11), WEEK11_DEELSIN)
  is('die transkripsie', weekTranskripsie(11), WEEK11_TRANSKRIPSIE)
  is('die sessie', weekSessie(11), WEEK11_SESSIE)
  is('die klaar-skerm', weekKlaar(11), WEEK11_KLAAR)
  is('blokkeVir stem ooreen', blokkeVir(11, 3), blokkeVirDag11(3))
  is('n dag wat nie bestaan nie gee niks', blokkeVirDag11(9), [])
  /* Sonder hierdie inskrywing val die week terug op die ou huiswerk-skerm. */
  is('maar nie week 13 nie', hetDae(13), false)
}

console.log('\n── Week 10 wys nou NA Week 11, en die titel stem ──\n')
{
  waar('WEEK10_VOLGENDE bestaan', !!WEEK10_VOLGENDE)
  is('en dit wys na week 11', WEEK10_VOLGENDE.week, 11)
  is('die register gee dieselfde', weekVolgende(10), WEEK10_VOLGENDE)
  is('die titel is Week 11 se egte titel', WEEK10_VOLGENDE.titel, WEKE[11].titel)
  waar('en dit se iets oor die week', WEEK10_VOLGENDE.lyf.length > 40)
}

console.log('\n── En Week 11 wys nou NA Week 12 ──\n')
{
  /* Week 12 bestaan sedert 27 Oktober 2026; die brug mag nie meer null wees nie,
     anders eindig Week 11 op 'n doodloopstraat. */
  waar('WEEK11_VOLGENDE bestaan', !!WEEK11_VOLGENDE)
  is('en dit wys na week 12', WEEK11_VOLGENDE.week, 12)
  is('die register gee dieselfde', weekVolgende(11), WEEK11_VOLGENDE)
  is('die titel is Week 12 se egte titel', WEEK11_VOLGENDE.titel, WEKE[12].titel)
  waar('en dit se iets oor die week', WEEK11_VOLGENDE.lyf.length > 40)
}

console.log('\n── Die klaar-skerm praat oor HIERDIE week ──\n')
{
  const k = weekKlaar(11)
  waar('Week 11 bring sy eie klaar-woorde', !!(k && k.kop && k.lyf))
  is('en dit is die uitgevoerde blok', k, WEEK11_KLAAR)
  waar('dit is nie Week 1 se ou slot nie', !/BEGIN KYK/i.test(k.kop))
  waar('dit is nie Week 10 se slot nie', weekKlaar(10).kop !== k.kop)
  is('Dewald se opskrif', k.kop, 'LIEFDE VIR GOD. LIEFDE VIR MENSE.')
  waar('dit eindig by die week se sin', /DIE GROOTSTE GEBOD WORD NIE NET BELY NIE\. DIT WORD GELEEF\.$/.test(k.lyf))
}

console.log('\n── Die week se rekord kan PUBLISEER, SONDER n opname ──\n')
{
  const w = { ...WEKE[11] }
  const kontroles = { teks: true, konteks: true, jesus: true, toepassing: true, grens: true }
  is('weeknommer 11', w.weeknommer, 11)
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
  const w = WEKE[11]
  for (let i = 0; i < 5; i++) {
    is(`dag ${i + 1}`, w[`dag${i + 1}Titel`], WEEK11_DAE[i].titel)
  }
  is('die week se titel is Dag 1 s\'n', w.titel, WEEK11_DAE[0].titel)
  is('môre se teaser noem Dag 2', w.moreTeaser, 'Môre: ' + WEEK11_DAE[1].titel)
}

console.log('\n── Die admin se Skrifte is geldig ──\n')
{
  const w = WEKE[11]
  waar(`"${w.primereSkrif}" ontleed`, !!ontleedVerwysing(w.primereSkrif))
  is('geen versinde ondersteunende Skrif nie', w.ondersteunendeSkrif, '')
  is('kernwaarheid en weekKern is dieselfde sin', w.kernwaarheid, w.weekKern)
}

console.log('\n── Die fasiliteerder kry sy grens ──\n')
{
  const w = WEKE[11]
  waar('daar is n hoofpunt', w.fasiliteerderHoofpunt.length > 80)
  waar('en n grens', w.fasiliteerderGrens.length > 80)
  waar('die hoofpunt se kernvraag', /hoe word dit sigbaar in hoe ek mense behandel\?$/.test(w.fasiliteerderHoofpunt))
  waar('die grens: nie n gesprek oor verhoudings of grense nie', /algemene gesprek oor verhoudings of grense/.test(w.fasiliteerderGrens))
  is('die private vraag is Dewald s\'n', w.privaatRefleksie, 'Pas die manier waarop ek mense behandel by wat ek sê ek oor God glo?')
}

console.log('\n── Die groepsessie ──\n')
{
  waar('n titel', WEEK11_SESSIE.titel.length > 3)
  is('vier vrae', WEEK11_SESSIE.vrae.length, 4)
  for (const v of WEEK11_SESSIE.vrae) {
    waar(`"${v.slice(0, 30)}…" is n vraag`, v.includes('?'))
    waar(`"${v.slice(0, 30)}…" pas op n kaart (${v.length})`, v.length <= 200)
  }
  waar('n gebed', /Amen\.?$/.test(WEEK11_SESSIE.gebed.trim()))
  is('en dit is die admin se weekgebed', WEKE[11].gebed, WEEK11_SESSIE.gebed)
  for (const s of WEEK11_SESSIE.skrifte) waar(`"${s}" ontleed`, !!ontleedVerwysing(s))
  const w = WEKE[11]
  for (let i = 0; i < 4; i++) {
    is(`groepvraag ${i + 1} stem`, w[`groepVraag${i + 1}`], WEEK11_SESSIE.vrae[i])
  }
}

console.log('\n── Die deelsin ──\n')
{
  waar('daar is een', WEEK11_DEELSIN.length > 30)
  waar('dit pas in n boodskap', WEEK11_DEELSIN.length <= 220)
  is('en dit stem met die admin se eenSin', WEKE[11].eenSin, WEEK11_DEELSIN)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
