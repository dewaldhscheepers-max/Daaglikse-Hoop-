/* VOLG JESUS — WEEK 8: "DIE KONINKRYK VAN GOD HET NABY GEKOM"
 *
 * Dewald het die week op 29 September 2026 voluit gestuur. Hierdie toets keur
 * die PERKE (wat keer dat 'n dag soos huiswerk voel), die vorm van 'n week
 * SONDER 'n opname, en die vyf plekke wat CLAUDE.md uitwys — veral die twee
 * wat maklik agterbly: die BRUG van Week 7 af, en die verse teen die GAB.
 *
 *   node src/data/volgJesusWeek7.toets.mjs
 */
import {
  WEEK8_DAE, WEEK8_REIS, WEEK8_OPENING, WEEK8_DEELSIN, WEEK8_VOLGENDE,
  WEEK8_TRANSKRIPSIE, WEEK8_SESSIE, WEEK8_KLAAR, blokkeVirDag8,
} from './volgJesusWeek8.js'
import { WEEK7_VOLGENDE } from './volgJesusWeek7.js'
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
  is('vyf dae', WEEK8_DAE.length, 5)
  is('genommer 1 tot 5', WEEK8_DAE.map(d => d.n), [1, 2, 3, 4, 5])
  for (const d of WEEK8_DAE) {
    waar(`dag ${d.n} het n titel`, d.titel && d.titel.length > 3)
    waar(`dag ${d.n} het n merk`, d.merk && d.merk.length > 2)
    waar(`dag ${d.n} het n knoppie`, d.knop && d.knop.length > 3)
    waar(`dag ${d.n} het n klaar-kop`, d.klaarKop && d.klaarKop.length > 3)
    waar(`dag ${d.n} het n klaar-sin`, d.klaarLyf && d.klaarLyf.length > 10)
  }
  is('Dag 5 se knoppie voltooi die week', WEEK8_DAE[4].knop, 'VOLTOOI WEEK 8')
}

console.log('\n── Die perke: dit mag nie soos huiswerk voel nie ──\n')
{
  for (const d of WEEK8_DAE) {
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
  for (const d of WEEK8_DAE) {
    const gebed = d.blokke.filter(b => b.soort === 'gebed')
    is(`dag ${d.n} het presies een gebed`, gebed.length, 1)
    waar(`dag ${d.n} se gebed eindig met Amen`, /Amen\.?$/.test(gebed[0].lyf.trim()))
  }
}

console.log('\n── Elke Skrifgedeelte maak die Bybel oop ──\n')
{
  const skrifte = []
  for (const d of WEEK8_DAE) {
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
  /* Dewald: "WEEK 8 HET GEEN STEMBOODSKAP OF AUDIO NIE." */
  for (const d of WEEK8_DAE) {
    is(`dag ${d.n} het geen stem-blok`, d.blokke.some(b => b.soort === 'stem'), false)
  }
  is('en geen transkripsie', WEEK8_TRANSKRIPSIE, '')

  const b = WEEK8_DAE[0].blokke.find(x => x.soort === 'boodskap')
  waar('Dag 1 dra n boodskap-blok', !!b)
  is('met Dewald se opskrif', b.kop, 'LEES VANDAG SE BOODSKAP')
  /* Week 7 s n was 400+; hierdie een is korter maar steeds die dag se HELE
     onderrig — dit is wat die opname elke ander week dra. */
  waar(`en die boodskap dra die dag (${b.lyf.trim().split(/\s+/).length} woorde)`,
       b.lyf.trim().split(/\s+/).length > 250)

  /* Die boodskap-blok staan waar `stem` in Week 1 tot 4 staan: NA die lees. */
  const soorte = WEEK8_DAE[0].blokke.map(x => x.soort)
  waar('die boodskap volg op die lees', soorte.indexOf('boodskap') > soorte.indexOf('lees'))
  /* Net Dag 1. Dag 2 tot 5 dra gewone teksblokke. */
  for (const d of WEEK8_DAE.slice(1)) {
    is(`dag ${d.n} het geen boodskap-blok`, d.blokke.some(x => x.soort === 'boodskap'), false)
  }
}

console.log('\n── Albei wallpapers is in die week ──\n')
{
  /* Dewald laai hulle self op; die week se taak is om hulle op die REGTE twee
     plekke te vra. */
  const dag1 = WEEK8_DAE[0].blokke.filter(b => b.soort === 'wallpaper')
  const dag5 = WEEK8_DAE[4].blokke.filter(b => b.soort === 'wallpaper')
  is('Dag 1 sluit met n wallpaper', dag1.length, 1)
  is('uit wallpaperDag1', dag1[0].bronVeld, 'wallpaperDag1')
  is('Dag 5 sluit die week af met een', dag5.length, 1)
  is('uit wallpaper', dag5[0].bronVeld, 'wallpaper')
  /* En nerens anders nie — twee is die week se getal. */
  const almal = WEEK8_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'wallpaper')
  is('presies twee in die hele week', almal.length, 2)
}

console.log('\n── Elke vraag se id is UNIEK ──\n')
{
  /* Twee vrae met dieselfde id skryf oor mekaar in localStorage, en dan
     verdwyn iemand se woorde sonder dat enigiets breek. */
  const ids = WEEK8_DAE.flatMap(d => d.blokke).filter(b => b.id).map(b => b.id)
  is('geen duplikaat', new Set(ids).size, ids.length)
  waar('en daar is vyf', ids.length === 5)
  /* Die terugblik op Dag 5 wys Dag 1 se antwoord — die belangrikste oomblik
     van die week. Wys hy na n id wat nie bestaan nie, is die blok vir altyd
     leeg en niemand sou dit agterkom nie. */
  const tb = WEEK8_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'terugblik')
  is('daar is een terugblik', tb.length, 1)
  waar('en dit wys na n egte vraag', ids.includes(tb[0].bronId))
  is('naamlik Dag 1 s n', tb[0].bronId, 'troon1')
  for (const id of ids) waar(`"${id}" is n bruikbare id`, /^[a-z][a-z0-9]*$/.test(id))
}

console.log('\n── Die reis aan die einde wys net wat gevra is ──\n')
{
  const gevra = new Set(WEEK8_DAE.flatMap(d => d.blokke).filter(b => b.id).map(b => b.id))
  for (const r of WEEK8_REIS) {
    waar(`"${r.id}" is werklik n vraag in die week`, gevra.has(r.id))
    waar(`"${r.id}" het n kop`, r.kop && r.kop.length > 20)
  }
  waar('daar is meer as een', WEEK8_REIS.length >= 2)
  is('geen duplikaat in die reis', new Set(WEEK8_REIS.map(r => r.id)).size, WEEK8_REIS.length)
}

console.log('\n── Die opening is kort ──\n')
{
  waar('daar is n opening', WEEK8_OPENING.length > 40)
  waar('maar dit is nie n les nie', WEEK8_OPENING.trim().split(/\s+/).length <= 120)
  waar('dit dra die week se vraag', /Koninkryk van God het naby gekom/i.test(WEEK8_OPENING))
}

console.log('\n── Die register ken Week 8 ──\n')
{
  is('hetDae(8)', hetDae(8), true)
  is('die dae', weekDae(8), WEEK8_DAE)
  is('die reis', weekReis(8), WEEK8_REIS)
  is('die opening', weekOpening(8), WEEK8_OPENING)
  is('die deelsin', weekDeelsin(8), WEEK8_DEELSIN)
  is('die transkripsie', weekTranskripsie(8), WEEK8_TRANSKRIPSIE)
  is('die sessie', weekSessie(8), WEEK8_SESSIE)
  is('die klaar-skerm', weekKlaar(8), WEEK8_KLAAR)
  is('blokkeVir stem ooreen', blokkeVir(8, 3), blokkeVirDag8(3))
  is('n dag wat nie bestaan nie gee niks', blokkeVirDag8(9), [])
  /* Sonder hierdie inskrywing val die week terug op die ou huiswerk-skerm. */
  is('maar nie week 9 nie', hetDae(9), false)
}

console.log('\n── Week 7 wys nou NA Week 8, en die titel stem ──\n')
{
  /* Die BRUG. Dit was `null`, en dan eindig Week 7 op n doodloopstraat: die
     mens maak Dag 5 klaar en kry niks. Week 3 het n dag lank so gestaan. */
  waar('WEEK7_VOLGENDE bestaan', !!WEEK7_VOLGENDE)
  is('en dit wys na week 8', WEEK7_VOLGENDE.week, 8)
  is('die register gee dieselfde', weekVolgende(7), WEEK7_VOLGENDE)
  /* n Brug wat n titel VOORSPEL is n belofte wat ons nie kan hou nie. Hierdie
     titel moet die week se EGTE titel wees. */
  is('die titel is Week 8 se egte titel', WEEK7_VOLGENDE.titel, WEKE[8].titel)
  waar('en dit se iets oor die week', WEEK7_VOLGENDE.lyf.length > 40)
}

console.log('\n── En Week 8 loop nog nie verder nie ──\n')
{
  /* `null` totdat Dewald Week 9 stuur. n Brug wat n titel VOORSPEL, is n
     belofte wat ons nie kan hou nie. Skuif dit saam; sien CLAUDE.md. */
  is('WEEK8_VOLGENDE is null', WEEK8_VOLGENDE, null)
  is('en die register gee ook null', weekVolgende(8), null)
}

console.log('\n── Die klaar-skerm praat oor HIERDIE week ──\n')
{
  const k = weekKlaar(8)
  waar('Week 8 bring sy eie klaar-woorde', !!(k && k.kop && k.lyf))
  is('en dit is die uitgevoerde blok', k, WEEK8_KLAAR)
  /* Dit was vir ELKE week Week 1 s n — "JY HET BEGIN KYK" — sodat iemand wat
     Week 4 klaarmaak, Week 1 se slot gelees het. */
  waar('dit is nie Week 1 se ou slot nie', !/BEGIN KYK/i.test(k.kop))
  waar('dit is nie Week 7 se slot nie', weekKlaar(7).kop !== k.kop)
  waar('dit vra die week se vraag', /WYS MY LEWE DIT/i.test(k.lyf))
}

console.log('\n── Die week se rekord kan PUBLISEER, SONDER n opname ──\n')
{
  const w = { ...WEKE[8] }
  const kontroles = { teks: true, konteks: true, jesus: true, toepassing: true, grens: true }
  waar('die week staan in die plat rekord', !!w.weeknommer)
  is('weeknommer 7', w.weeknommer, 8)
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
  const w = WEKE[8]
  for (let i = 0; i < 5; i++) {
    is(`dag ${i + 1}`, w[`dag${i + 1}Titel`], WEEK8_DAE[i].titel)
  }
}

console.log('\n── Die admin se Skrifte is geldig ──\n')
{
  const w = WEKE[8]
  waar(`"${w.primereSkrif}" ontleed`, !!ontleedVerwysing(w.primereSkrif))
  waar(`"${w.ondersteunendeSkrif}" ontleed`, !!ontleedVerwysing(w.ondersteunendeSkrif))
}

console.log('\n── Die fasiliteerder kry sy grens ──\n')
{
  const w = WEKE[8]
  waar('daar is n hoofpunt', w.fasiliteerderHoofpunt.length > 80)
  waar('en n grens', w.fasiliteerderGrens.length > 80)
  /* Dewald se eie waarskuwings vir hierdie week. */
  /* Die belangrikste grens van hierdie week: "Jesus is Koning" mag NOOIT n
     groepleier se gesag word nie. Dewald het dit self geskryf. */
  waar('dit waarsku teen n leier wat mense beheer', /beheer/i.test(w.fasiliteerderGrens))
  waar('en teen "God se wil" as jou eie mening', /God se wil/i.test(w.fasiliteerderGrens))
  waar('dit se redding is genade', /genade/i.test(w.fasiliteerderHoofpunt))
}

console.log('\n── Die groepsessie ──\n')
{
  waar('n titel', WEEK8_SESSIE.titel.length > 3)
  is('vier vrae', WEEK8_SESSIE.vrae.length, 4)
  for (const v of WEEK8_SESSIE.vrae) {
    waar(`"${v.slice(0, 30)}…" is n vraag`, v.includes('?'))
    /* n Vraag van 400 karakters vul die halwe skerm van die groepchat. */
    waar(`"${v.slice(0, 30)}…" pas op n kaart (${v.length})`, v.length <= 200)
  }
  waar('n gebed', /Amen\.?$/.test(WEEK8_SESSIE.gebed.trim()))
  for (const s of WEEK8_SESSIE.skrifte) waar(`"${s}" ontleed`, !!ontleedVerwysing(s))
  /* Die sessie se vrae en die admin se vier velde is dieselfde vrae. */
  const w = WEKE[8]
  for (let i = 0; i < 4; i++) {
    is(`groepvraag ${i + 1} stem`, w[`groepVraag${i + 1}`], WEEK8_SESSIE.vrae[i])
  }
}

console.log('\n── Die deelsin ──\n')
{
  waar('daar is een', WEEK8_DEELSIN.length > 30)
  waar('dit pas in n boodskap', WEEK8_DEELSIN.length <= 220)
  is('en dit stem met die admin se eenSin', WEKE[8].eenSin, WEEK8_DEELSIN)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
