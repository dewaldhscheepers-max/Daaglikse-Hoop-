/* VOLG JESUS — WEEK 10: "DIESELFDE SAAD. VERSKILLENDE GROND."
 *
 * Dewald het die week op 16 Oktober 2026 voluit gestuur. Hierdie toets keur
 * die PERKE (wat keer dat 'n dag soos huiswerk voel), die vorm van 'n week
 * SONDER 'n opname, Dag 1 se boodskap woord vir woord, en die vyf plekke wat
 * CLAUDE.md uitwys — veral die twee wat maklik agterbly: die BRUG van Week 9
 * af, en die verse teen die GAB.
 *
 *   node src/data/volgJesusWeek10.toets.mjs
 */
import {
  WEEK10_DAE, WEEK10_REIS, WEEK10_OPENING, WEEK10_DEELSIN, WEEK10_VOLGENDE,
  WEEK10_TRANSKRIPSIE, WEEK10_SESSIE, WEEK10_KLAAR, blokkeVirDag10,
} from './volgJesusWeek10.js'
import { WEEK9_VOLGENDE } from './volgJesusWeek9.js'
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

console.log('\n── Vyf dae, en elkeen het n naam ──\n')
{
  is('vyf dae', WEEK10_DAE.length, 5)
  is('genommer 1 tot 5', WEEK10_DAE.map(d => d.n), [1, 2, 3, 4, 5])
  for (const d of WEEK10_DAE) {
    waar(`dag ${d.n} het n titel`, d.titel && d.titel.length > 3)
    waar(`dag ${d.n} het n merk`, d.merk && d.merk.length > 2)
    waar(`dag ${d.n} het n knoppie`, d.knop && d.knop.length > 3)
    waar(`dag ${d.n} het n klaar-kop`, d.klaarKop && d.klaarKop.length > 3)
    waar(`dag ${d.n} het n klaar-sin`, d.klaarLyf && d.klaarLyf.length > 10)
  }
  is('Dag 5 se knoppie voltooi die week', WEEK10_DAE[4].knop, 'VOLTOOI WEEK 10')
  is('en die klaar-kop se dit', WEEK10_DAE[4].klaarKop, 'WEEK 10 KLAAR.')
}

console.log('\n── Die perke: dit mag nie soos huiswerk voel nie ──\n')
{
  for (const d of WEEK10_DAE) {
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
  const d1 = WEEK10_DAE[0]
  is('dag 1 het geen aparte gebed-blok', d1.blokke.filter(b => b.soort === 'gebed').length, 0)
  const bood = d1.blokke.find(b => b.soort === 'boodskap')
  waar('want die boodskap eindig met die gebed',
       /Here, ondersoek my hart\..*Amen\.$/s.test(bood.lyf.trim()))
  for (const d of WEEK10_DAE.slice(1)) {
    const gebed = d.blokke.filter(b => b.soort === 'gebed')
    is(`dag ${d.n} het presies een gebed`, gebed.length, 1)
    waar(`dag ${d.n} se gebed eindig met Amen`, /Amen\.?$/.test(gebed[0].lyf.trim()))
  }
}

console.log('\n── Elke Skrifgedeelte maak die Bybel oop ──\n')
{
  const skrifte = []
  for (const d of WEEK10_DAE) {
    const lees = d.blokke.filter(b => b.soort === 'lees')
    is(`dag ${d.n} het presies een LEES-blok`, lees.length, 1)
    const s = lees[0].skrif
    skrifte.push(s)
    waar(`dag ${d.n}: "${s}" ontleed`, !!ontleedVerwysing(s))
    /* Hierdie keer het Dewald ook op Dag 1 'n leesreel gegee. */
    waar(`dag ${d.n} se leesreel se wat om raak te sien`, lees[0].lyf && lees[0].lyf.length > 20)
  }
  for (let i = 1; i < skrifte.length; i++) {
    is(`dag ${i + 1} se Skrif verskil van dag ${i} s n`, skrifte[i] === skrifte[i - 1], false)
  }
  is('al vyf gedeeltes verskil', new Set(skrifte).size, 5)
  is('Dag 1 lees die hele gelykenis', skrifte[0], 'Markus 4:1–20')
}

console.log('\n── GEEN STEMBOODSKAP: die boodskap word GELEES ──\n')
{
  /* Dewald: "Daar is GEEN stemnota of klank in Week 10 nie." */
  for (const d of WEEK10_DAE) {
    is(`dag ${d.n} het geen stem-blok`, d.blokke.some(b => b.soort === 'stem'), false)
  }
  is('en geen transkripsie', WEEK10_TRANSKRIPSIE, '')

  const b = WEEK10_DAE[0].blokke.find(x => x.soort === 'boodskap')
  waar('Dag 1 dra n boodskap-blok', !!b)
  is('met Dewald se opskrif', b.kop, 'LEES VANDAG SE BOODSKAP')
  waar(`en die boodskap dra die dag (${b.lyf.trim().split(/\s+/).length} woorde)`,
       b.lyf.trim().split(/\s+/).length > 250)
  const soorte = WEEK10_DAE[0].blokke.map(x => x.soort)
  waar('die boodskap volg op die lees', soorte.indexOf('boodskap') > soorte.indexOf('lees'))
  for (const d of WEEK10_DAE.slice(1)) {
    is(`dag ${d.n} het geen boodskap-blok`, d.blokke.some(x => x.soort === 'boodskap'), false)
  }
}

console.log('\n── Dag 1 se boodskap is Dewald s\'n, woord vir woord ──\n')
{
  /* "MOENIE ENIGE WOORD VERANDER NIE." Hierdie ankers staan oor die hele
     boodskap: die begin, elke vorm van die grond, die hoofletter-reels, en die
     einde. Val een, het iemand aan sy teks geraak. */
  const b = WEEK10_DAE[0].blokke.find(x => x.soort === 'boodskap').lyf
  waar('die begin', b.startsWith('Jesus vertel van ’n saaier wat saad saai.\n\nDieselfde saaier.'))
  for (const s of [
    '“Die saaier saai die woord.”',
    'WAT GEBEUR MET DIE WOORD WANNEER DIT MY HART BEREIK?',
    'Eerstens: party saad val op die pad.',
    'Tweedens: party saad val op klipperige grond.',
    '’N STERK BEGIN IS NIE DIESELFDE AS DIEP WORTELS NIE.',
    'Derdens: van die saad val tussen dorings.',
    'die bekommernisse van hierdie wêreld, die verleiding van rykdom, en die begeertes na ander dinge.',
    'En dan is die Woord daar—\n\nmaar Jesus sê dit word onvrugbaar.',
    'hoor die Woord, neem dit aan en dra vrug — dertig-, sestig- en honderdvoudig.',
    'ALMAL HOOR DIESELFDE WOORD. DIE VERSKIL LÊ IN WAT DIE HART DAARMEE DOEN.',
    'DIT HELP NIE DIE WOORD BEREIK JOU ORE AS JY DIT NOOIT TOELAAT OM WORTEL TE SKIET NIE.',
  ]) waar(`"${s.slice(0, 40)}…"`, b.includes(s))
  waar('die einde', b.endsWith('sodat my lewe vrug kan dra. Amen.'))
  is('525 woorde, soos hy dit gestuur het', b.trim().split(/\s+/).length, 525)
  /* Elke reel staan apart, met 'n lee reel tussenin — sy uitleg. */
  waar('geen drie newlines agtermekaar', !/\n\n\n/.test(b))
}

console.log('\n── Albei wallpapers is in die week ──\n')
{
  const dag1 = WEEK10_DAE[0].blokke.filter(b => b.soort === 'wallpaper')
  const dag5 = WEEK10_DAE[4].blokke.filter(b => b.soort === 'wallpaper')
  is('Dag 1 sluit met n wallpaper', dag1.length, 1)
  is('uit wallpaperDag1', dag1[0].bronVeld, 'wallpaperDag1')
  is('Dag 5 sluit die week af met een', dag5.length, 1)
  is('uit wallpaper', dag5[0].bronVeld, 'wallpaper')
  const almal = WEEK10_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'wallpaper')
  is('presies twee in die hele week', almal.length, 2)
  is('en die wallpaper is die LAASTE ding op Dag 1', WEEK10_DAE[0].blokke.at(-1).soort, 'wallpaper')
  is('en op Dag 5', WEEK10_DAE[4].blokke.at(-1).soort, 'wallpaper')
}

console.log('\n── Elke vraag se id is UNIEK ──\n')
{
  const ids = WEEK10_DAE.flatMap(d => d.blokke).filter(b => b.id).map(b => b.id)
  is('geen duplikaat', new Set(ids).size, ids.length)
  is('en daar is vyf', ids.length, 5)
  /* Die ids mag nie met 'n VORIGE week s'n bots nie: elke antwoord staan as
     vj_a_w<week>_<id>, dus is die week deel van die sleutel — maar 'n id wat
     elders iets anders beteken, maak die reis verwarrend om te lees. */
  const tb = WEEK10_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'terugblik')
  is('daar is geen terugblik-blok nie', tb.length, 0)
  const kyk = WEEK10_DAE[4].blokke.find(b => b.kop === 'KYK TERUG')
  waar('Dag 5 se KYK TERUG verwys na Dag 1 se vraag',
       kyk && /“Watter soort grond is my hart\?”/.test(kyk.lyf))
  const stap = WEEK10_DAE[4].blokke.find(b => b.kop === 'JOU VOLGENDE STAP')
  is('JOU VOLGENDE STAP is n teksblok', stap && stap.soort, 'teks')
  waar('die reis wys Dag 1 se woorde terug', WEEK10_REIS[0].id === 'grond1')
  for (const id of ids) waar(`"${id}" is n bruikbare id`, /^[a-z][a-z0-9]*$/.test(id))
}

console.log('\n── Dag 3 se keuse: Dewald se ses dorings ──\n')
{
  const k = WEEK10_DAE[2].blokke.find(b => b.soort === 'kies')
  waar('daar is n keuse', !!k)
  is('met sy vraag', k.lyf, 'Watter “doring” neem tans te veel plek in jou lewe in?')
  is('en sy ses keuses, in sy volgorde', k.opsies.map(o => o.woorde),
     ['Bekommernis', 'Geld', 'Mense se goedkeuring', '’n Begeerte', '’n Oorvol lewe', 'Iets anders'])
  is('elke waarde is uniek', new Set(k.opsies.map(o => o.waarde)).size, 6)
  is('geen opvolgvraag nie — hy het geen gegee nie', k.vraag, undefined)
}

console.log('\n── Die reis aan die einde wys net wat gevra is ──\n')
{
  /* Net SKRYF-vrae: 'n keuse is 'n woord soos "geld", en die reis haal 'n
     mens se eie sinne aan. */
  const geskryf = new Set(WEEK10_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'vraag').map(b => b.id))
  for (const r of WEEK10_REIS) {
    waar(`"${r.id}" is werklik n skryfvraag in die week`, geskryf.has(r.id))
    waar(`"${r.id}" het n kop`, r.kop && r.kop.length > 20)
  }
  is('drie stappe', WEEK10_REIS.length, 3)
  is('geen duplikaat in die reis', new Set(WEEK10_REIS.map(r => r.id)).size, WEEK10_REIS.length)
}

console.log('\n── Die opening is kort ──\n')
{
  waar('daar is n opening', WEEK10_OPENING.length > 40)
  waar('maar dit is nie n les nie', WEEK10_OPENING.trim().split(/\s+/).length <= 120)
  waar('dit dra die week se vraag',
       /“WAT GEBEUR IN MY HART NADAT EK DIT GEHOOR HET\?”$/.test(WEEK10_OPENING))
  is('en die admin se openingskerm is dieselfde teks', WEKE[10].openingskerm, WEEK10_OPENING)
}

console.log('\n── Die register ken Week 10 ──\n')
{
  is('hetDae(10)', hetDae(10), true)
  is('die dae', weekDae(10), WEEK10_DAE)
  is('die reis', weekReis(10), WEEK10_REIS)
  is('die opening', weekOpening(10), WEEK10_OPENING)
  is('die deelsin', weekDeelsin(10), WEEK10_DEELSIN)
  is('die transkripsie', weekTranskripsie(10), WEEK10_TRANSKRIPSIE)
  is('die sessie', weekSessie(10), WEEK10_SESSIE)
  is('die klaar-skerm', weekKlaar(10), WEEK10_KLAAR)
  is('blokkeVir stem ooreen', blokkeVir(10, 3), blokkeVirDag10(3))
  is('n dag wat nie bestaan nie gee niks', blokkeVirDag10(9), [])
  /* Sonder hierdie inskrywing val die week terug op die ou huiswerk-skerm. */
  is('maar nie week 11 nie', hetDae(11), false)
}

console.log('\n── Week 9 wys nou NA Week 10, en die titel stem ──\n')
{
  waar('WEEK9_VOLGENDE bestaan', !!WEEK9_VOLGENDE)
  is('en dit wys na week 10', WEEK9_VOLGENDE.week, 10)
  is('die register gee dieselfde', weekVolgende(9), WEEK9_VOLGENDE)
  is('die titel is Week 10 se egte titel', WEEK9_VOLGENDE.titel, WEKE[10].titel)
  waar('en dit se iets oor die week', WEEK9_VOLGENDE.lyf.length > 40)
}

console.log('\n── En Week 10 loop nog nie verder nie ──\n')
{
  is('WEEK10_VOLGENDE is null', WEEK10_VOLGENDE, null)
  is('en die register gee ook null', weekVolgende(10), null)
}

console.log('\n── Die klaar-skerm praat oor HIERDIE week ──\n')
{
  const k = weekKlaar(10)
  waar('Week 10 bring sy eie klaar-woorde', !!(k && k.kop && k.lyf))
  is('en dit is die uitgevoerde blok', k, WEEK10_KLAAR)
  waar('dit is nie Week 1 se ou slot nie', !/BEGIN KYK/i.test(k.kop))
  waar('dit is nie Week 9 se slot nie', weekKlaar(9).kop !== k.kop)
  is('Dewald se opskrif', k.kop, 'WATTER GROND IS JOU HART?')
  waar('dit eindig by die week se vraag', /WAT DOEN GOD SE WOORD IN JOU LEWE\?$/.test(k.lyf))
}

console.log('\n── Die week se rekord kan PUBLISEER, SONDER n opname ──\n')
{
  const w = { ...WEKE[10] }
  const kontroles = { teks: true, konteks: true, jesus: true, toepassing: true, grens: true }
  is('weeknommer 10', w.weeknommer, 10)
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
  const w = WEKE[10]
  for (let i = 0; i < 5; i++) {
    is(`dag ${i + 1}`, w[`dag${i + 1}Titel`], WEEK10_DAE[i].titel)
  }
  is('die week se titel is Dag 1 s\'n', w.titel, WEEK10_DAE[0].titel)
  is('môre se teaser noem Dag 2', w.moreTeaser, 'Môre: ' + WEEK10_DAE[1].titel)
}

console.log('\n── Die admin se Skrifte is geldig ──\n')
{
  const w = WEKE[10]
  waar(`"${w.primereSkrif}" ontleed`, !!ontleedVerwysing(w.primereSkrif))
  is('geen versinde ondersteunende Skrif nie', w.ondersteunendeSkrif, '')
  is('kernwaarheid en weekKern is dieselfde sin', w.kernwaarheid, w.weekKern)
}

console.log('\n── Die fasiliteerder kry sy grens ──\n')
{
  const w = WEKE[10]
  waar('daar is n hoofpunt', w.fasiliteerderHoofpunt.length > 80)
  waar('en n grens', w.fasiliteerderGrens.length > 80)
  waar('die hoofpunt: nie vier vaste groepe nie',
       /nie om mense in vier vaste geestelike groepe te verdeel nie/.test(w.fasiliteerderHoofpunt))
  waar('die vier reaksies staan daar', (w.fasiliteerderHoofpunt.match(/^- /gm) || []).length === 4)
  waar('emosie is nie verkeerd nie', /emosie verkeerd is nie/.test(w.fasiliteerderGrens))
  waar('en bekommernis is nie sonde nie', /bekommernis of finansiële behoefte as sonde/.test(w.fasiliteerderGrens))
  waar('die private vraag is Dewald s\'n',
       /^Wat neem tans die meeste plek in my hart in — God se Woord/.test(w.privaatRefleksie))
}

console.log('\n── Die groepsessie ──\n')
{
  waar('n titel', WEEK10_SESSIE.titel.length > 3)
  is('vier vrae', WEEK10_SESSIE.vrae.length, 4)
  for (const v of WEEK10_SESSIE.vrae) {
    waar(`"${v.slice(0, 30)}…" is n vraag`, v.includes('?'))
    waar(`"${v.slice(0, 30)}…" pas op n kaart (${v.length})`, v.length <= 200)
  }
  waar('n gebed', /Amen\.?$/.test(WEEK10_SESSIE.gebed.trim()))
  is('en dit is die admin se weekgebed', WEKE[10].gebed, WEEK10_SESSIE.gebed)
  for (const s of WEEK10_SESSIE.skrifte) waar(`"${s}" ontleed`, !!ontleedVerwysing(s))
  const w = WEKE[10]
  for (let i = 0; i < 4; i++) {
    is(`groepvraag ${i + 1} stem`, w[`groepVraag${i + 1}`], WEEK10_SESSIE.vrae[i])
  }
}

console.log('\n── Die deelsin ──\n')
{
  waar('daar is een', WEEK10_DEELSIN.length > 30)
  waar('dit pas in n boodskap', WEEK10_DEELSIN.length <= 220)
  is('en dit stem met die admin se eenSin', WEKE[10].eenSin, WEEK10_DEELSIN)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
