/* VOLG JESUS — WEEK 9: "HERE, LEER ONS BID"
 *
 * Dewald het die week op 11 Oktober 2026 voluit gestuur. Hierdie toets keur
 * die PERKE (wat keer dat 'n dag soos huiswerk voel), die vorm van 'n week
 * SONDER 'n opname, en die vyf plekke wat CLAUDE.md uitwys — veral die twee
 * wat maklik agterbly: die BRUG van Week 8 af, en die verse teen die GAB.
 *
 *   node src/data/volgJesusWeek9.toets.mjs
 */
import {
  WEEK9_DAE, WEEK9_REIS, WEEK9_OPENING, WEEK9_DEELSIN, WEEK9_VOLGENDE,
  WEEK9_TRANSKRIPSIE, WEEK9_SESSIE, WEEK9_KLAAR, blokkeVirDag9,
} from './volgJesusWeek9.js'
import { WEEK8_VOLGENDE } from './volgJesusWeek8.js'
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
 * 210 en nie 180 nie, en dit is dieselfde keuse as Week 7 s'n: sonder 'n
 * opname staan die hele week se onderrig GESKREWE, ook op Dag 2 tot 5. Die
 * reel self (’n dag mag nie soos huiswerk voel nie) word steeds gedra deur die
 * twee perke wat NIE beweeg het nie — vyf inhoudsblokke en twee antwoorde.
 *
 * Beweeg hierdie getal net saam met 'n rede wat 'n mens kan lees. */
const MAKS_TEKS = 210
const MAKS_BLOKKE = 5
const MAKS_ANTWOORDE = 2

console.log('\n── Vyf dae, en elkeen het n naam ──\n')
{
  is('vyf dae', WEEK9_DAE.length, 5)
  is('genommer 1 tot 5', WEEK9_DAE.map(d => d.n), [1, 2, 3, 4, 5])
  for (const d of WEEK9_DAE) {
    waar(`dag ${d.n} het n titel`, d.titel && d.titel.length > 3)
    waar(`dag ${d.n} het n merk`, d.merk && d.merk.length > 2)
    waar(`dag ${d.n} het n knoppie`, d.knop && d.knop.length > 3)
    waar(`dag ${d.n} het n klaar-kop`, d.klaarKop && d.klaarKop.length > 3)
    waar(`dag ${d.n} het n klaar-sin`, d.klaarLyf && d.klaarLyf.length > 10)
  }
  is('Dag 5 se knoppie voltooi die week', WEEK9_DAE[4].knop, 'VOLTOOI WEEK 9')
}

console.log('\n── Die perke: dit mag nie soos huiswerk voel nie ──\n')
{
  for (const d of WEEK9_DAE) {
    /* Die groepbrug en die wallpaper is nie INHOUD nie — die een is n skakel
       na die groep, die ander n prent om te hou. Dieselfde reel as Week 7 s n. */
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
  for (const d of WEEK9_DAE) {
    const gebed = d.blokke.filter(b => b.soort === 'gebed')
    is(`dag ${d.n} het presies een gebed`, gebed.length, 1)
    waar(`dag ${d.n} se gebed eindig met Amen`, /Amen\.?$/.test(gebed[0].lyf.trim()))
  }
}

console.log('\n── Elke Skrifgedeelte maak die Bybel oop ──\n')
{
  const skrifte = []
  for (const d of WEEK9_DAE) {
    const lees = d.blokke.filter(b => b.soort === 'lees')
    is(`dag ${d.n} het presies een LEES-blok`, lees.length, 1)
    const s = lees[0].skrif
    skrifte.push(s)
    /* Kan die app hom werklik oopmaak? n Verwysing wat nie ontleed nie, is n
       knoppie wat niks doen nie. */
    waar(`dag ${d.n}: "${s}" ontleed`, !!ontleedVerwysing(s))
    /* Dag 1 se LEES-blok dra net die verwysing — Dewald het daar geen leesreel
       gegee nie, en die boodskap direk daaronder begin by die gedeelte. */
    if (d.n === 1) is('dag 1 se LEES-blok versin geen reel nie', lees[0].lyf, undefined)
    else waar(`dag ${d.n} se leesreel se wat om raak te sien`, lees[0].lyf.length > 20)
  }

  /* Geen Skrifgedeelte twee dae na mekaar nie — anders voel die week soos een
     lang les oor een gedeelte. */
  for (let i = 1; i < skrifte.length; i++) {
    is(`dag ${i + 1} se Skrif verskil van dag ${i} s n`, skrifte[i] === skrifte[i - 1], false)
  }
  is('al vyf gedeeltes verskil', new Set(skrifte).size, 5)
}

console.log('\n── GEEN STEMBOODSKAP: die boodskap word GELEES ──\n')
{
  /* Dewald: "Gebruik dieselfde eenvoudige lees-uitleg as Week 8." */
  for (const d of WEEK9_DAE) {
    is(`dag ${d.n} het geen stem-blok`, d.blokke.some(b => b.soort === 'stem'), false)
  }
  is('en geen transkripsie', WEEK9_TRANSKRIPSIE, '')

  const b = WEEK9_DAE[0].blokke.find(x => x.soort === 'boodskap')
  waar('Dag 1 dra n boodskap-blok', !!b)
  is('met Dewald se opskrif', b.kop, 'LEES VANDAG SE BOODSKAP')
  /* Week 7 s n was 400+; hierdie een is korter maar steeds die dag se HELE
     onderrig — dit is wat die opname elke ander week dra. */
  waar(`en die boodskap dra die dag (${b.lyf.trim().split(/\s+/).length} woorde)`,
       b.lyf.trim().split(/\s+/).length > 250)

  /* Die boodskap-blok staan waar `stem` in Week 1 tot 4 staan: NA die lees. */
  const soorte = WEEK9_DAE[0].blokke.map(x => x.soort)
  waar('die boodskap volg op die lees', soorte.indexOf('boodskap') > soorte.indexOf('lees'))
  /* Net Dag 1. Dag 2 tot 5 dra gewone teksblokke. */
  for (const d of WEEK9_DAE.slice(1)) {
    is(`dag ${d.n} het geen boodskap-blok`, d.blokke.some(x => x.soort === 'boodskap'), false)
  }
}

console.log('\n── Albei wallpapers is in die week ──\n')
{
  /* Dewald laai hulle self op; die week se taak is om hulle op die REGTE twee
     plekke te vra. */
  const dag1 = WEEK9_DAE[0].blokke.filter(b => b.soort === 'wallpaper')
  const dag5 = WEEK9_DAE[4].blokke.filter(b => b.soort === 'wallpaper')
  is('Dag 1 sluit met n wallpaper', dag1.length, 1)
  is('uit wallpaperDag1', dag1[0].bronVeld, 'wallpaperDag1')
  is('Dag 5 sluit die week af met een', dag5.length, 1)
  is('uit wallpaper', dag5[0].bronVeld, 'wallpaper')
  /* En nerens anders nie — twee is die week se getal. */
  const almal = WEEK9_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'wallpaper')
  is('presies twee in die hele week', almal.length, 2)
}

console.log('\n── Elke vraag se id is UNIEK ──\n')
{
  /* Twee vrae met dieselfde id skryf oor mekaar in localStorage, en dan
     verdwyn iemand se woorde sonder dat enigiets breek. */
  const ids = WEEK9_DAE.flatMap(d => d.blokke).filter(b => b.id).map(b => b.id)
  is('geen duplikaat', new Set(ids).size, ids.length)
  waar('en daar is vyf', ids.length === 5)
  /* GEEN terugblik-blok nie: Dewald se "KYK TERUG" haal die week se
     KERNWAARHEID aan, en Dag 5 het reeds vyf inhoudsblokke. Die mens se eie
     woorde kom steeds terug, deur die reis op die klaar-skerm. */
  const tb = WEEK9_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'terugblik')
  is('daar is geen terugblik nie', tb.length, 0)
  const kyk = WEEK9_DAE[4].blokke.find(b => b.kop === 'KYK TERUG')
  waar('Dag 5 se KYK TERUG haal die kernwaarheid aan',
       kyk && /Gebed begin nie by alles wat ek van God wil hê nie\./.test(kyk.lyf))
  /* JOU VOLGENDE STAP is n opdrag, nie n vraag nie — geen skryfkassie. */
  const stap = WEEK9_DAE[4].blokke.find(b => b.kop === 'JOU VOLGENDE STAP')
  is('JOU VOLGENDE STAP is n teksblok', stap && stap.soort, 'teks')
  waar('die reis wys Dag 1 se woorde terug', WEEK9_REIS.some(r => r.id === 'getref1'))
  for (const id of ids) waar(`"${id}" is n bruikbare id`, /^[a-z][a-z0-9]*$/.test(id))
}

console.log('\n── Die reis aan die einde wys net wat gevra is ──\n')
{
  const gevra = new Set(WEEK9_DAE.flatMap(d => d.blokke).filter(b => b.id).map(b => b.id))
  for (const r of WEEK9_REIS) {
    waar(`"${r.id}" is werklik n vraag in die week`, gevra.has(r.id))
    waar(`"${r.id}" het n kop`, r.kop && r.kop.length > 20)
  }
  waar('daar is meer as een', WEEK9_REIS.length >= 2)
  is('geen duplikaat in die reis', new Set(WEEK9_REIS.map(r => r.id)).size, WEEK9_REIS.length)
}

console.log('\n── Die opening is kort ──\n')
{
  waar('daar is n opening', WEEK9_OPENING.length > 40)
  waar('maar dit is nie n les nie', WEEK9_OPENING.trim().split(/\s+/).length <= 120)
  waar('dit dra die week se vraag', /“Ons Vader\.”/.test(WEEK9_OPENING))
}

console.log('\n── Die register ken Week 8 ──\n')
{
  is('hetDae(9)', hetDae(9), true)
  is('die dae', weekDae(9), WEEK9_DAE)
  is('die reis', weekReis(9), WEEK9_REIS)
  is('die opening', weekOpening(9), WEEK9_OPENING)
  is('die deelsin', weekDeelsin(9), WEEK9_DEELSIN)
  is('die transkripsie', weekTranskripsie(9), WEEK9_TRANSKRIPSIE)
  is('die sessie', weekSessie(9), WEEK9_SESSIE)
  is('die klaar-skerm', weekKlaar(9), WEEK9_KLAAR)
  is('blokkeVir stem ooreen', blokkeVir(9, 3), blokkeVirDag9(3))
  is('n dag wat nie bestaan nie gee niks', blokkeVirDag9(9), [])
  /* Sonder hierdie inskrywing val die week terug op die ou huiswerk-skerm. */
  is('maar nie week 10 nie', hetDae(10), false)
}

console.log('\n── Week 8 wys nou NA Week 9, en die titel stem ──\n')
{
  waar('WEEK8_VOLGENDE bestaan', !!WEEK8_VOLGENDE)
  is('en dit wys na week 9', WEEK8_VOLGENDE.week, 9)
  is('die register gee dieselfde', weekVolgende(8), WEEK8_VOLGENDE)
  is('die titel is Week 9 se egte titel', WEEK8_VOLGENDE.titel, WEKE[9].titel)
  waar('en dit se iets oor die week', WEEK8_VOLGENDE.lyf.length > 40)
}

console.log('\n── En Week 9 loop nog nie verder nie ──\n')
{
  is('WEEK9_VOLGENDE is null', WEEK9_VOLGENDE, null)
  is('en die register gee ook null', weekVolgende(9), null)
}

console.log('\n── Die klaar-skerm praat oor HIERDIE week ──\n')
{
  const k = weekKlaar(9)
  waar('Week 8 bring sy eie klaar-woorde', !!(k && k.kop && k.lyf))
  is('en dit is die uitgevoerde blok', k, WEEK9_KLAAR)
  /* Dit was vir ELKE week Week 1 s n — "JY HET BEGIN KYK" — sodat iemand wat
     Week 4 klaarmaak, Week 1 se slot gelees het. */
  waar('dit is nie Week 1 se ou slot nie', !/BEGIN KYK/i.test(k.kop))
  waar('dit is nie Week 8 se slot nie', weekKlaar(8).kop !== k.kop)
  waar('dit eindig by die week se sin', /GEBED BRING MY HELE LEWE WEER ONDER GOD\.$/.test(k.lyf))
}

console.log('\n── Die week se rekord kan PUBLISEER, SONDER n opname ──\n')
{
  const w = { ...WEKE[9] }
  const kontroles = { teks: true, konteks: true, jesus: true, toepassing: true, grens: true }
  waar('die week staan in die plat rekord', !!w.weeknommer)
  is('weeknommer 9', w.weeknommer, 9)
  is('daar is geen stemboodskap nie', w.stemboodskapUrl, '')
  is('en geen video nie', w.videoId, '')
  /* Sonder hierdie vlaggie eis die hek n hoofboodskap wat hierdie week
     doelbewus nie het nie, en die week bly vir altyd gesper. */
  waar('maar die boodskap is as GESKREWE gemerk', w.geskreweBoodskap === true)

  const gereed = { ...w, kontroles, hersieningStatus: 'goedgekeur' }
  is('met alles reg is daar geen fout nie', publiseerFoute(gereed), [])
  is('en dit mag publiseer', magPubliseer(gereed), true)

  /* Die hek moet steeds n hek wees. */
  const sonder = { ...gereed, geskreweBoodskap: false }
  waar('sonder die merkie mag dit NIE', !magPubliseer(sonder))
  waar('en die fout se hoekom',
       publiseerFoute(sonder).some(f => /hoofboodskap/i.test(f)))
  const weg = { ...gereed }
  delete weg.geskreweBoodskap
  waar('n ontbrekende merkie tel ook nie', !magPubliseer(weg))
}

console.log('\n── Die dag-titels stem ooreen met die admin se rekord ──\n')
{
  /* Twee lyste titels wat uitmekaar dryf, is hoe die admin een ding wys en die
     app n ander. */
  const w = WEKE[9]
  for (let i = 0; i < 5; i++) {
    is(`dag ${i + 1}`, w[`dag${i + 1}Titel`], WEEK9_DAE[i].titel)
  }
}

console.log('\n── Die admin se Skrifte is geldig ──\n')
{
  const w = WEKE[9]
  waar(`"${w.primereSkrif}" ontleed`, !!ontleedVerwysing(w.primereSkrif))
  /* Dewald het net EEN kernskrif gegee; die ondersteunende veld is opsioneel. */
  is('geen versinde ondersteunende Skrif nie', w.ondersteunendeSkrif, '')
}

console.log('\n── Die fasiliteerder kry sy grens ──\n')
{
  const w = WEKE[9]
  waar('daar is n hoofpunt', w.fasiliteerderHoofpunt.length > 80)
  waar('en n grens', w.fasiliteerderGrens.length > 80)
  /* Dewald se "BELANGRIK": gebed mag nooit n prestasie word nie. */
  waar('die hoofpunt: gebed is verhouding', /Dit is verhouding\./.test(w.fasiliteerderHoofpunt))
  waar('dit waarsku teen indrukwekkende gebede', /indrukwekkende gebede/.test(w.fasiliteerderGrens))
  waar('en hou die fokus op eenvoud', /eenvoud, eerlikheid, vertroue en God se wil/.test(w.fasiliteerderGrens))
}

console.log('\n── Die groepsessie ──\n')
{
  waar('n titel', WEEK9_SESSIE.titel.length > 3)
  is('vier vrae', WEEK9_SESSIE.vrae.length, 4)
  for (const v of WEEK9_SESSIE.vrae) {
    waar(`"${v.slice(0, 30)}…" is n vraag`, v.includes('?'))
    /* n Vraag van 400 karakters vul die halwe skerm van die groepchat. */
    waar(`"${v.slice(0, 30)}…" pas op n kaart (${v.length})`, v.length <= 200)
  }
  waar('n gebed', /Amen\.?$/.test(WEEK9_SESSIE.gebed.trim()))
  for (const s of WEEK9_SESSIE.skrifte) waar(`"${s}" ontleed`, !!ontleedVerwysing(s))
  /* Die sessie se vrae en die admin se vier velde is dieselfde vrae. */
  const w = WEKE[9]
  for (let i = 0; i < 4; i++) {
    is(`groepvraag ${i + 1} stem`, w[`groepVraag${i + 1}`], WEEK9_SESSIE.vrae[i])
  }
}

console.log('\n── Die deelsin ──\n')
{
  waar('daar is een', WEEK9_DEELSIN.length > 30)
  waar('dit pas in n boodskap', WEEK9_DEELSIN.length <= 220)
  is('en dit stem met die admin se eenSin', WEKE[9].eenSin, WEEK9_DEELSIN)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
