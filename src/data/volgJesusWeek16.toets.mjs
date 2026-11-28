/* VOLG JESUS — WEEK 16: "HULLE BREEK DIE DAK OOP"
 *
 * Dewald het die week op 28 November 2026 voluit gestuur. Hierdie toets keur
 * die PERKE (wat keer dat 'n dag soos huiswerk voel), die vorm van 'n week
 * SONDER 'n opname, Dag 1 se boodskap woord vir woord, en die vyf plekke wat
 * CLAUDE.md uitwys — veral die twee wat maklik agterbly: die BRUG van Week 15
 * af, en die verse teen die GAB.
 *
 *   node src/data/volgJesusWeek16.toets.mjs
 */
import {
  WEEK16_DAE, WEEK16_REIS, WEEK16_OPENING, WEEK16_DEELSIN, WEEK16_VOLGENDE,
  WEEK16_TRANSKRIPSIE, WEEK16_SESSIE, WEEK16_KLAAR, blokkeVirDag16,
} from './volgJesusWeek16.js'
import { WEEK15_VOLGENDE } from './volgJesusWeek15.js'
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

/* ── Die perke ── Dieselfde as Week 6 tot 15: sonder 'n opname staan die hele
   week se onderrig GESKREWE, dus 210. Vyf inhoudsblokke en twee antwoorde het
   nie geskuif nie. */
const MAKS_TEKS = 210
const MAKS_BLOKKE = 5
const MAKS_ANTWOORDE = 2
/* Dag 1 se boodskap, soos Dewald dit gestuur het. */
const WOORDE_DAG1 = 643

console.log('\n── Vyf dae, en elkeen het n naam ──\n')
{
  is('vyf dae', WEEK16_DAE.length, 5)
  is('genommer 1 tot 5', WEEK16_DAE.map(d => d.n), [1, 2, 3, 4, 5])
  for (const d of WEEK16_DAE) {
    waar(`dag ${d.n} het n titel`, d.titel && d.titel.length > 3)
    waar(`dag ${d.n} het n merk`, d.merk && d.merk.length > 2)
    waar(`dag ${d.n} het n knoppie`, d.knop && d.knop.length > 3)
    waar(`dag ${d.n} het n klaar-kop`, d.klaarKop && d.klaarKop.length > 3)
    waar(`dag ${d.n} het n klaar-sin`, d.klaarLyf && d.klaarLyf.length > 10)
  }
  is('Dag 5 se knoppie voltooi die week', WEEK16_DAE[4].knop, 'VOLTOOI WEEK 16')
  is('en die klaar-kop se dit', WEEK16_DAE[4].klaarKop, 'WEEK 16 KLAAR.')
}

console.log('\n── Die perke: dit mag nie soos huiswerk voel nie ──\n')
{
  for (const d of WEEK16_DAE) {
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
  /* Dewald se KYK TERUG eindig hierdie week NIE met 'n vraag nie, en die stap is
     'n opdrag: Dag 5 vra niks om te skryf nie. Ons sit niks by wat hy nie gestuur het nie. */
  is('Dag 5 het geen skryfkassie', WEEK16_DAE[4].blokke.filter(b => b.soort === 'vraag').length, 0)
  for (const d of WEEK16_DAE.slice(0, 4)) {
    is(`dag ${d.n} het presies een vraag`, d.blokke.filter(b => b.soort === 'vraag').length, 1)
  }
}

console.log('\n── Elke dag sluit met n gebed ──\n')
{
  const d1 = WEEK16_DAE[0]
  is('dag 1 het geen aparte gebed-blok', d1.blokke.filter(b => b.soort === 'gebed').length, 0)
  const bood = d1.blokke.find(b => b.soort === 'boodskap')
  waar('want die boodskap eindig met die gebed',
       /Vader, dankie dat Jesus die hele mens sien\..*nader aan Jesus kan help bring\. Amen\.$/s.test(bood.lyf.trim()))
  for (const d of WEEK16_DAE.slice(1)) {
    const gebed = d.blokke.filter(b => b.soort === 'gebed')
    is(`dag ${d.n} het presies een gebed`, gebed.length, 1)
    waar(`dag ${d.n} se gebed eindig met Amen`, /Amen\.?$/.test(gebed[0].lyf.trim()))
  }
}

console.log('\n── Elke Skrifgedeelte maak die Bybel oop ──\n')
{
  const skrifte = []
  for (const d of WEEK16_DAE) {
    const lees = d.blokke.filter(b => b.soort === 'lees')
    is(`dag ${d.n} het presies een LEES-blok`, lees.length, 1)
    const s = lees[0].skrif
    skrifte.push(s)
    waar(`dag ${d.n}: "${s}" ontleed`, !!ontleedVerwysing(s))
    if (d.n === 1) is('dag 1 se LEES-blok versin geen reel nie', lees[0].lyf, undefined)
    else waar(`dag ${d.n} se leesreel se wat om raak te sien`, lees[0].lyf && lees[0].lyf.length > 20)
  }
  /* DIE EEN UITSONDERING, met die rede in die kop van volgJesusWeek16.js:
     Dewald se Dag 3 en Dag 4 lees albei Markus 2:5 — die twee HELFTES van die
     vers, met 'n ander aanhaling en 'n ander fokus. Elke ander paar verskil. */
  const UITSONDERING = new Set(['3-4'])
  for (let i = 1; i < skrifte.length; i++) {
    const paar = `${i}-${i + 1}`
    if (UITSONDERING.has(paar)) {
      is(`dag ${i} en ${i + 1} lees albei Dewald se Markus 2:5`, [skrifte[i - 1], skrifte[i]], ['Markus 2:5', 'Markus 2:5'])
      waar('maar die leesreel verskil', WEEK16_DAE[i - 1].blokke[0].lyf !== WEEK16_DAE[i].blokke[0].lyf)
    } else {
      is(`dag ${i + 1} se Skrif verskil van dag ${i} s n`, skrifte[i] === skrifte[i - 1], false)
    }
  }
  is('vier verskillende gedeeltes', new Set(skrifte).size, 4)
  is('Dag 1 lees die hele gedeelte', skrifte[0], 'Markus 2:1–12')
  is('Dag 5 se gedeelte is drie verse', ontleedVerwysing(skrifte[4]).map(s => [s.hoofstuk, s.van, s.tot]), [[2, 10, 12]])
}

console.log('\n── GEEN STEMBOODSKAP: die boodskap word GELEES ──\n')
{
  for (const d of WEEK16_DAE) {
    is(`dag ${d.n} het geen stem-blok`, d.blokke.some(b => b.soort === 'stem'), false)
  }
  is('en geen transkripsie', WEEK16_TRANSKRIPSIE, '')
  const b = WEEK16_DAE[0].blokke.find(x => x.soort === 'boodskap')
  waar('Dag 1 dra n boodskap-blok', !!b)
  is('met die opskrif', b.kop, 'LEES VANDAG SE BOODSKAP')
  const soorte = WEEK16_DAE[0].blokke.map(x => x.soort)
  waar('die boodskap volg op die lees', soorte.indexOf('boodskap') > soorte.indexOf('lees'))
  for (const d of WEEK16_DAE.slice(1)) {
    is(`dag ${d.n} het geen boodskap-blok`, d.blokke.some(x => x.soort === 'boodskap'), false)
  }
}

console.log('\n── Dag 1 se boodskap is Dewald s\'n, woord vir woord ──\n')
{
  const b = WEEK16_DAE[0].blokke.find(x => x.soort === 'boodskap').lyf
  waar('die begin', b.startsWith('Jesus is in ’n huis in Kapernaum.\n\nSoveel mense kom luister dat daar nie meer plek is nie.'))
  for (const t of [
    'Hulle klim op die dak, maak ’n opening en laat die man op sy mat afsak tot reg voor Jesus.',
    '“Toe Jesus hulle geloof sien…”',
    'SOMS HET JY MENSE NODIG WAT JOU HELP DRA WANNEER JY NIE MEER SELF KAN NIE.',
    'Moenie skaam wees om hulp nodig te hê nie.',
    '“Seun, jou sondes word vergewe.”',
    'JESUS SIEN SOMS ’N DIEPER BEHOEFTE AS DIE EEN WAARVOOR JY HOM GEVRA HET.',
    '“Here, verander my omstandighede.”\n\n“Neem hierdie probleem weg.”\n\n“Maak ’n deur vir my oop.”\n\n“Maak my gesond.”\n\n“Help my finansieel.”',
    'Hy sien skuld.\n\nSkaamte.\n\nVrees.\n\nTrots.\n\nAfstand van God.',
    '“Staan op, vat jou mat en gaan huis toe.”',
    'DIE MAN HET GEKOM OM WEER TE LOOP. JESUS WYS DAT HY GEKOM HET OM IETS NOG GROTER TE DOEN: SONDES TE VERGEWE.',
    'JY HOEF NIE IEMAND SE REDDER TE WEES OM HULLE TE HELP NIE. SOMS IS JOU WERK NET OM HULLE NADER AAN JESUS TE BRING.',
    'Maar jy kan bid.\n\nJy kan help.\n\nJy kan saam dra.',
    'WARE GELOOF KYK NIE NET NA DIE HINDERNIS NIE. DIT SOEK ’N MANIER OM BY JESUS UIT TE KOM.',
  ]) waar(`"${t.slice(0, 40)}…"`, b.includes(t))
  waar('die einde', b.endsWith('en wys my wie ek vandag nader aan Jesus kan help bring. Amen.'))
  is('woordtelling soos hy dit gestuur het', b.trim().split(/\s+/).length, WOORDE_DAG1)
  waar('geen drie newlines agtermekaar', !/\n\n\n/.test(b))
  waar("geen reguit apostrof in 'n (sy teks gebruik ’)", !/(^|\s)'n\s/.test(b))
}

console.log('\n── Albei wallpapers is in die week ──\n')
{
  const dag1 = WEEK16_DAE[0].blokke.filter(b => b.soort === 'wallpaper')
  const dag5 = WEEK16_DAE[4].blokke.filter(b => b.soort === 'wallpaper')
  is('Dag 1 sluit met n wallpaper', dag1.length, 1)
  is('uit wallpaperDag1', dag1[0].bronVeld, 'wallpaperDag1')
  is('Dag 5 sluit die week af met een', dag5.length, 1)
  is('uit wallpaper', dag5[0].bronVeld, 'wallpaper')
  const almal = WEEK16_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'wallpaper')
  is('presies twee in die hele week', almal.length, 2)
  is('en die wallpaper is die LAASTE ding op Dag 1', WEEK16_DAE[0].blokke.at(-1).soort, 'wallpaper')
  is('en op Dag 5', WEEK16_DAE[4].blokke.at(-1).soort, 'wallpaper')
}

console.log('\n── Elke vraag se id is UNIEK ──\n')
{
  const ids = WEEK16_DAE.flatMap(d => d.blokke).filter(b => b.id).map(b => b.id)
  is('geen duplikaat', new Set(ids).size, ids.length)
  is('en daar is vier', ids.length, 4)
  const kyk = WEEK16_DAE[4].blokke.find(b => b.kop === 'KYK TERUG')
  is('KYK TERUG is n teksblok (dit eindig NIE met n vraag nie)', kyk && kyk.soort, 'teks')
  waar('met Dewald se slot', kyk && /het Jesus gewys dat Hy gesag het om sondes te vergewe\.$/.test(kyk.lyf))
  const stap = WEEK16_DAE[4].blokke.find(b => b.kop === 'JOU VOLGENDE STAP')
  is('JOU VOLGENDE STAP is n teksblok (n opdrag)', stap && stap.soort, 'teks')
  waar('en dit staan NA KYK TERUG', WEEK16_DAE[4].blokke.indexOf(stap) > WEEK16_DAE[4].blokke.indexOf(kyk))
  waar('en eindig by Dewald se sin', /Help hulle om nader aan Jesus te kom\.$/.test(stap.lyf))
  for (const id of ids) waar(`"${id}" is n bruikbare id`, /^[a-z][a-z0-9]*$/.test(id))
}

console.log('\n── Dewald se aanhalings staan soos HY dit geskryf het ──\n')
{
  /* "Toe Jesus hulle geloof sien" stem met die GAB; die ander twee is SY bewoording. */
  const alles = JSON.stringify(WEEK16_DAE)
  waar('Dag 3: "Toe Jesus hulle geloof sien…"', alles.includes('“Toe Jesus hulle geloof sien…”'))
  waar('Dag 4: "Seun, jou sondes word vergewe."', alles.includes('“Seun, jou sondes word vergewe.”'))
  waar('Dag 5: "Staan op, vat jou mat en gaan huis toe."', alles.includes('“Staan op, vat jou mat en gaan huis toe.”'))
  is('daar is geen keuse-blok nie', WEEK16_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'kies').length, 0)
}

console.log('\n── Die reis aan die einde wys net wat gevra is ──\n')
{
  const geskryf = new Set(WEEK16_DAE.flatMap(d => d.blokke).filter(b => b.soort === 'vraag').map(b => b.id))
  for (const r of WEEK16_REIS) {
    waar(`"${r.id}" is werklik n skryfvraag in die week`, geskryf.has(r.id))
    waar(`"${r.id}" het n kop`, r.kop && r.kop.length > 20)
  }
  is('drie stappe', WEEK16_REIS.length, 3)
  is('dit begin by Dag 1', WEEK16_REIS[0].id, 'dieper1')
  is('en eindig by Dag 4 se vraag (Dag 5 het geen skryfkassie)', WEEK16_REIS[2].id, 'hart4')
}

console.log('\n── Die opening is kort ──\n')
{
  waar('maar dit is nie n les nie', WEEK16_OPENING.trim().split(/\s+/).length <= 120)
  waar('dit dra die week se kern', /“Jou sondes word vergewe\.”$/.test(WEEK16_OPENING))
  is('en die admin se openingskerm is dieselfde teks', WEKE[16].openingskerm, WEEK16_OPENING)
}

console.log('\n── Die register ken Week 16 ──\n')
{
  is('hetDae(16)', hetDae(16), true)
  is('die dae', weekDae(16), WEEK16_DAE)
  is('die reis', weekReis(16), WEEK16_REIS)
  is('die opening', weekOpening(16), WEEK16_OPENING)
  is('die deelsin', weekDeelsin(16), WEEK16_DEELSIN)
  is('die transkripsie', weekTranskripsie(16), WEEK16_TRANSKRIPSIE)
  is('die sessie', weekSessie(16), WEEK16_SESSIE)
  is('die klaar-skerm', weekKlaar(16), WEEK16_KLAAR)
  is('blokkeVir stem ooreen', blokkeVir(16, 3), blokkeVirDag16(3))
  is('n dag wat nie bestaan nie gee niks', blokkeVirDag16(9), [])
  is('maar nie week 17 nie', hetDae(17), false)
}

console.log('\n── Week 15 wys nou NA Week 16, en die titel stem ──\n')
{
  waar('WEEK15_VOLGENDE bestaan', !!WEEK15_VOLGENDE)
  is('en dit wys na week 16', WEEK15_VOLGENDE.week, 16)
  is('die register gee dieselfde', weekVolgende(15), WEEK15_VOLGENDE)
  is('die titel is Week 16 se egte titel', WEEK15_VOLGENDE.titel, WEKE[16].titel)
  waar('en dit se iets oor die week', WEEK15_VOLGENDE.lyf.length > 40)
}

console.log('\n── En Week 16 loop nog nie verder nie ──\n')
{
  is('WEEK16_VOLGENDE is null', WEEK16_VOLGENDE, null)
  is('en die register gee ook null', weekVolgende(16), null)
}

console.log('\n── Die klaar-skerm praat oor HIERDIE week ──\n')
{
  const k = weekKlaar(16)
  is('Dewald se opskrif', k.kop, 'BRING HOM NA JESUS TOE')
  waar('dit is nie Week 15 se slot nie', weekKlaar(15).kop !== k.kop)
  waar('dit eindig by Dewald se slotsin', /HULLE NET HELP OM NADER AAN JESUS TE KOM\.$/.test(k.lyf))
}

console.log('\n── Die week se rekord kan PUBLISEER, SONDER n opname ──\n')
{
  const w = { ...WEKE[16] }
  const kontroles = { teks: true, konteks: true, jesus: true, toepassing: true, grens: true }
  is('weeknommer 16', w.weeknommer, 16)
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
  const w = WEKE[16]
  for (let i = 0; i < 5; i++) is(`dag ${i + 1}`, w[`dag${i + 1}Titel`], WEEK16_DAE[i].titel)
  is('die week se titel is Dag 1 s\'n', w.titel, WEEK16_DAE[0].titel)
  is('môre se teaser noem Dag 2', w.moreTeaser, 'Môre: ' + WEEK16_DAE[1].titel)
  waar(`"${w.primereSkrif}" ontleed`, !!ontleedVerwysing(w.primereSkrif))
  is('kernwaarheid en weekKern is dieselfde sin', w.kernwaarheid, w.weekKern)
  is('die private vraag is Dewald s\'n', w.privaatRefleksie, 'Wat is die probleem in my lewe wat almal kan sien, en wat is dalk die dieper behoefte wat net Jesus sien?')
  waar('die groepleier: Jesus en Sy gesag is die middelpunt', /Die middelpunt van Markus 2:1–12 is Jesus en Sy gesag\./.test(w.fasiliteerderHoofpunt))
  waar('die grens: die verlamming is nie deur sy sonde veroorsaak nie', /Moenie leer dat die man se verlamming deur sy sonde veroorsaak is nie\./.test(w.fasiliteerderGrens))
}

console.log('\n── Die groepsessie ──\n')
{
  is('vier vrae', WEEK16_SESSIE.vrae.length, 4)
  for (const v of WEEK16_SESSIE.vrae) {
    waar(`"${v.slice(0, 30)}…" is n vraag`, v.includes('?'))
    waar(`"${v.slice(0, 30)}…" pas op n kaart (${v.length})`, v.length <= 200)
  }
  waar('n gebed', /Amen\.?$/.test(WEEK16_SESSIE.gebed.trim()))
  is('en dit is die admin se weekgebed', WEKE[16].gebed, WEEK16_SESSIE.gebed)
  for (let i = 0; i < 4; i++) is(`groepvraag ${i + 1} stem`, WEKE[16][`groepVraag${i + 1}`], WEEK16_SESSIE.vrae[i])
}

console.log('\n── Die deelsin ──\n')
{
  waar('dit pas in n boodskap', WEEK16_DEELSIN.length <= 220)
  is('en dit stem met die admin se eenSin', WEKE[16].eenSin, WEEK16_DEELSIN)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
