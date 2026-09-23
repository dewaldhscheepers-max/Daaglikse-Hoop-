/* VOLG JESUS — WEEK 7: "WAT SOEK JY?"
 *
 * Dewald het die week op 24 September 2026 voluit gestuur. Hierdie toets keur
 * die PERKE (wat keer dat 'n dag soos huiswerk voel), die vorm van 'n week
 * SONDER 'n opname, en die vyf plekke wat CLAUDE.md uitwys — veral die twee
 * wat maklik agterbly: die BRUG van Week 6 af, en die verse teen die GAB.
 *
 *   node src/data/volgJesusWeek7.toets.mjs
 */
import {
  WEEK7_DAE, WEEK7_REIS, WEEK7_OPENING, WEEK7_DEELSIN, WEEK7_VOLGENDE,
  WEEK7_TRANSKRIPSIE, WEEK7_SESSIE, WEEK7_KLAAR, blokkeVirDag7,
} from './volgJesusWeek7.js'
import { WEEK6_VOLGENDE } from './volgJesusWeek6.js'
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
 * 210 en nie 180 nie, en dit is dieselfde keuse as Week 6 s'n: sonder 'n
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
  is('vyf dae', WEEK7_DAE.length, 5)
  is('genommer 1 tot 5', WEEK7_DAE.map(d => d.n), [1, 2, 3, 4, 5])
  for (const d of WEEK7_DAE) {
    waar(`dag ${d.n} het n titel`, d.titel && d.titel.length > 3)
    waar(`dag ${d.n} het n merk`, d.merk && d.merk.length > 2)
    waar(`dag ${d.n} het n knoppie`, d.knop && d.knop.length > 3)
    waar(`dag ${d.n} het n klaar-kop`, d.klaarKop && d.klaarKop.length > 3)
    waar(`dag ${d.n} het n klaar-sin`, d.klaarLyf && d.klaarLyf.length > 10)
  }
  is('Dag 5 se knoppie voltooi die week', WEEK7_DAE[4].knop, 'VOLTOOI WEEK 7')
}

console.log('\n── Die perke: dit mag nie soos huiswerk voel nie ──\n')
{
  for (const d of WEEK7_DAE) {
    /* Die groepbrug en die wallpaper is nie INHOUD nie — die een is n skakel
       na die groep, die ander n prent om te hou. Dieselfde reel as Week 6 s n. */
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
  for (const d of WEEK7_DAE) {
    const gebed = d.blokke.filter(b => b.soort === 'gebed')
    is(`dag ${d.n} het presies een gebed`, gebed.length, 1)
    waar(`dag ${d.n} se gebed eindig met Amen`, /Amen\.?$/.test(gebed[0].lyf.trim()))
  }
}

console.log('\n── Elke Skrifgedeelte maak die Bybel oop ──\n')
{
  const skrifte = []
  for (const d of WEEK7_DAE) {
    const lees = d.blokke.filter(b => b.soort === 'lees')
    is(`dag ${d.n} het presies een LEES-blok`, lees.length, 1)
    const s = lees[0].skrif
    skrifte.push(s)
    /* Kan die app hom werklik oopmaak? n Verwysing wat nie ontleed nie, is n
       knoppie wat niks doen nie. */
    waar(`dag ${d.n}: "${s}" ontleed`, !!ontleedVerwysing(s))
    waar(`dag ${d.n} se leesreel se wat om raak te sien`, lees[0].lyf.length > 20)
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
  /* Dewald: "WEEK 7 HET GEEN STEMBOODSKAP OF AUDIO NIE." */
  for (const d of WEEK7_DAE) {
    is(`dag ${d.n} het geen stem-blok`, d.blokke.some(b => b.soort === 'stem'), false)
  }
  is('en geen transkripsie', WEEK7_TRANSKRIPSIE, '')

  const b = WEEK7_DAE[0].blokke.find(x => x.soort === 'boodskap')
  waar('Dag 1 dra n boodskap-blok', !!b)
  is('met Dewald se opskrif', b.kop, 'LEES VANDAG SE BOODSKAP')
  waar('en die boodskap is die lang een', b.lyf.trim().split(/\s+/).length > 400)

  /* Die boodskap-blok staan waar `stem` in Week 1 tot 4 staan: NA die lees. */
  const soorte = WEEK7_DAE[0].blokke.map(x => x.soort)
  waar('die boodskap volg op die lees', soorte.indexOf('boodskap') > soorte.indexOf('lees'))
  /* Net Dag 1. Dag 2 tot 5 dra gewone teksblokke. */
  for (const d of WEEK7_DAE.slice(1)) {
    is(`dag ${d.n} het geen boodskap-blok`, d.blokke.some(x => x.soort === 'boodskap'), false)
  }
}

console.log('\n── Albei wallpapers is in die week ──\n')
{
  /* Dewald laai hulle self op; die week se taak is om hulle op die REGTE twee
     plekke te vra. */
  const dag1 = WEEK7_DAE[0].blokke.filter(b => b.soort === 'wallpaper')
  const dag5 = WEEK7_DAE[4].blokke.filter(b => b.soort === 'wallpaper')
  is('Dag 1 sluit met n wallpaper', dag1.length, 1)
  is('uit wallpaperDag1', dag1[0].bronVeld, 'wallpaperDag1')
  is('Dag 5 sluit die week af met een', dag5.length, 1)
  is('uit wallpaper', dag5[0].bronVeld, 'wallpaper')
  /* En nerens anders nie — twee is die week se getal. */
  const almal = WEEK7_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'wallpaper')
  is('presies twee in die hele week', almal.length, 2)
}

console.log('\n── Elke vraag se id is UNIEK ──\n')
{
  /* Twee vrae met dieselfde id skryf oor mekaar in localStorage, en dan
     verdwyn iemand se woorde sonder dat enigiets breek. */
  const ids = WEEK7_DAE.flatMap(d => d.blokke).filter(b => b.id).map(b => b.id)
  is('geen duplikaat', new Set(ids).size, ids.length)
  waar('en daar is vyf', ids.length === 5)
  /* Die terugblik op Dag 5 wys Dag 1 se antwoord — die belangrikste oomblik
     van die week. Wys hy na n id wat nie bestaan nie, is die blok vir altyd
     leeg en niemand sou dit agterkom nie. */
  const tb = WEEK7_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'terugblik')
  is('daar is een terugblik', tb.length, 1)
  waar('en dit wys na n egte vraag', ids.includes(tb[0].bronId))
  is('naamlik Dag 1 s n', tb[0].bronId, 'soek1')
  for (const id of ids) waar(`"${id}" is n bruikbare id`, /^[a-z][a-z0-9]*$/.test(id))
}

console.log('\n── Die reis aan die einde wys net wat gevra is ──\n')
{
  const gevra = new Set(WEEK7_DAE.flatMap(d => d.blokke).filter(b => b.id).map(b => b.id))
  for (const r of WEEK7_REIS) {
    waar(`"${r.id}" is werklik n vraag in die week`, gevra.has(r.id))
    waar(`"${r.id}" het n kop`, r.kop && r.kop.length > 20)
  }
  waar('daar is meer as een', WEEK7_REIS.length >= 2)
  is('geen duplikaat in die reis', new Set(WEEK7_REIS.map(r => r.id)).size, WEEK7_REIS.length)
}

console.log('\n── Die opening is kort ──\n')
{
  waar('daar is n opening', WEEK7_OPENING.length > 40)
  waar('maar dit is nie n les nie', WEEK7_OPENING.trim().split(/\s+/).length <= 120)
  waar('dit dra die week se groot lyn', /HELE PAD TE SIEN/.test(WEEK7_OPENING))
}

console.log('\n── Die register ken Week 7 ──\n')
{
  is('hetDae(7)', hetDae(7), true)
  is('die dae', weekDae(7), WEEK7_DAE)
  is('die reis', weekReis(7), WEEK7_REIS)
  is('die opening', weekOpening(7), WEEK7_OPENING)
  is('die deelsin', weekDeelsin(7), WEEK7_DEELSIN)
  is('die transkripsie', weekTranskripsie(7), WEEK7_TRANSKRIPSIE)
  is('die sessie', weekSessie(7), WEEK7_SESSIE)
  is('die klaar-skerm', weekKlaar(7), WEEK7_KLAAR)
  is('blokkeVir stem ooreen', blokkeVir(7, 3), blokkeVirDag7(3))
  is('n dag wat nie bestaan nie gee niks', blokkeVirDag7(9), [])
  /* Sonder hierdie inskrywing val die week terug op die ou huiswerk-skerm. */
  is('maar nie week 8 nie', hetDae(8), false)
}

console.log('\n── Week 6 wys nou NA Week 7, en die titel stem ──\n')
{
  /* Die BRUG. Dit was `null`, en dan eindig Week 6 op n doodloopstraat: die
     mens maak Dag 5 klaar en kry niks. Week 3 het n dag lank so gestaan. */
  waar('WEEK6_VOLGENDE bestaan', !!WEEK6_VOLGENDE)
  is('en dit wys na week 7', WEEK6_VOLGENDE.week, 7)
  is('die register gee dieselfde', weekVolgende(6), WEEK6_VOLGENDE)
  /* n Brug wat n titel VOORSPEL is n belofte wat ons nie kan hou nie. Hierdie
     titel moet die week se EGTE titel wees. */
  is('die titel is Week 7 se egte titel', WEEK6_VOLGENDE.titel, WEKE[7].titel)
  waar('en dit se iets oor die week', WEEK6_VOLGENDE.lyf.length > 40)
}

console.log('\n── En Week 7 loop nog nie verder nie ──\n')
{
  /* `null` totdat Dewald Week 8 stuur. Skuif dit saam; sien CLAUDE.md. */
  is('WEEK7_VOLGENDE is null', WEEK7_VOLGENDE, null)
  is('en die register gee ook null', weekVolgende(7), null)
}

console.log('\n── Die klaar-skerm praat oor HIERDIE week ──\n')
{
  const k = weekKlaar(7)
  waar('Week 7 bring sy eie klaar-woorde', !!(k && k.kop && k.lyf))
  is('en dit is die uitgevoerde blok', k, WEEK7_KLAAR)
  /* Dit was vir ELKE week Week 1 s n — "JY HET BEGIN KYK" — sodat iemand wat
     Week 4 klaarmaak, Week 1 se slot gelees het. */
  waar('dit is nie Week 1 se ou slot nie', !/BEGIN KYK/i.test(k.kop))
  waar('dit is nie Week 6 se slot nie', weekKlaar(6).kop !== k.kop)
  waar('dit vra die week se vraag', /GAAN JY HOM VOLG/.test(k.lyf))
}

console.log('\n── Die week se rekord kan PUBLISEER, SONDER n opname ──\n')
{
  const w = { ...WEKE[7] }
  const kontroles = { teks: true, konteks: true, jesus: true, toepassing: true, grens: true }
  waar('die week staan in die plat rekord', !!w.weeknommer)
  is('weeknommer 7', w.weeknommer, 7)
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
  const w = WEKE[7]
  for (let i = 0; i < 5; i++) {
    is(`dag ${i + 1}`, w[`dag${i + 1}Titel`], WEEK7_DAE[i].titel)
  }
}

console.log('\n── Die admin se Skrifte is geldig ──\n')
{
  const w = WEKE[7]
  waar(`"${w.primereSkrif}" ontleed`, !!ontleedVerwysing(w.primereSkrif))
  waar(`"${w.ondersteunendeSkrif}" ontleed`, !!ontleedVerwysing(w.ondersteunendeSkrif))
}

console.log('\n── Die fasiliteerder kry sy grens ──\n')
{
  const w = WEKE[7]
  waar('daar is n hoofpunt', w.fasiliteerderHoofpunt.length > 80)
  waar('en n grens', w.fasiliteerderGrens.length > 80)
  /* Dewald se eie waarskuwings vir hierdie week. */
  waar('dit waarsku teen raai oor die vyeboom', /vyeboom/i.test(w.fasiliteerderGrens))
  waar('en teen druk om private antwoorde te deel', /private antwoorde/i.test(w.fasiliteerderGrens))
}

console.log('\n── Die groepsessie ──\n')
{
  waar('n titel', WEEK7_SESSIE.titel.length > 3)
  is('vier vrae', WEEK7_SESSIE.vrae.length, 4)
  for (const v of WEEK7_SESSIE.vrae) {
    waar(`"${v.slice(0, 30)}…" is n vraag`, v.includes('?'))
    /* n Vraag van 400 karakters vul die halwe skerm van die groepchat. */
    waar(`"${v.slice(0, 30)}…" pas op n kaart (${v.length})`, v.length <= 200)
  }
  waar('n gebed', /Amen\.?$/.test(WEEK7_SESSIE.gebed.trim()))
  for (const s of WEEK7_SESSIE.skrifte) waar(`"${s}" ontleed`, !!ontleedVerwysing(s))
  /* Die sessie se vrae en die admin se vier velde is dieselfde vrae. */
  const w = WEKE[7]
  for (let i = 0; i < 4; i++) {
    is(`groepvraag ${i + 1} stem`, w[`groepVraag${i + 1}`], WEEK7_SESSIE.vrae[i])
  }
}

console.log('\n── Die deelsin ──\n')
{
  waar('daar is een', WEEK7_DEELSIN.length > 30)
  waar('dit pas in n boodskap', WEEK7_DEELSIN.length <= 220)
  is('en dit stem met die admin se eenSin', WEKE[7].eenSin, WEEK7_DEELSIN)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
