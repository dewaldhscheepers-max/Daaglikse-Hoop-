/* Week 6 se pad, teen dieselfde perke as Week 1 tot 5.
 *
 * Dit is die TWEEDE week sonder 'n stemboodskap — Dewald: *"WEEK 6 HET GEEN
 * STEMBOODSKAP OF KLANKLÊER NIE."* Twee dinge moet dus hier vasstaan:
 *
 *   · daar is nêrens in die week 'n `stem`-blok nie, en presies EEN
 *     `boodskap`-blok;
 *   · die week kan WERKLIK publiseer sonder 'n opname. Dit is die hek wat hom
 *     andersins vir altyd sou gesper het.
 *
 * ── Waarom die teks-perk hier 210 is en nie 180 nie ──
 *
 * Die 180 woorde is gekalibreer toe ELKE week 'n opname gehad het: die opname
 * het die onderrig gedra en die blokke op die skerm was kort. Week 6 het geen
 * opname nie, dus staan die hele week se onderrig geskrewe — ook op Dag 2 tot
 * 5, nie net in die een `boodskap`-blok nie.
 *
 * Dewald se opdrag was uitdruklik: *"MOENIE ENIGE WOORDE VERANDER NIE"*, en
 * *"moenie dit verkort nie"*. Die keuse was dus tussen sy woorde sny en die
 * getal skuif. Die getal skuif, en dit staan HIER as een sigbare konstante in
 * plaas van stilweg in 'n lus.
 *
 * Die reël self — 'n dag mag nie soos huiswerk voel nie — word steeds gedra
 * deur die twee perke wat NIE beweeg het nie: hoogstens vyf inhoudsblokke per
 * dag en hoogstens twee private antwoorde per dag.
 */
import {
  WEEK6_DAE, WEEK6_REIS, WEEK6_OPENING, WEEK6_DEELSIN, WEEK6_VOLGENDE,
  WEEK6_TRANSKRIPSIE, WEEK6_SESSIE, WEEK6_KLAAR, blokkeVirDag6,
} from './volgJesusWeek6.js'
import {
  hetDae, weekDae, blokkeVir, weekDeelsin, weekVolgende, weekKlaar,
  weekTranskripsie,
} from './volgJesusDae.js'
import { WEKE } from './volgJesusWeke.js'
import { magPubliseer, publiseerFoute, ontleedVerwysing } from './volgJesus.js'

/* Sien die kop. Beweeg hierdie getal net saam met 'n rede wat 'n mens kan
   lees. */
const MAKS_TEKS = 210

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)

console.log('\n── Vyf dae, en elkeen het n naam ──\n')
is('vyf dae', WEEK6_DAE.length, 5)
is('genommer 1 tot 5', WEEK6_DAE.map(d => d.n), [1, 2, 3, 4, 5])
for (const d of WEEK6_DAE) {
  waar(`dag ${d.n} het n titel`, d.titel && d.titel.length > 2)
  waar(`dag ${d.n} het n knoppie`, d.knop && d.knop.length > 2)
  waar(`dag ${d.n} se klaar-lyn bestaan`, d.klaarLyf && d.klaarLyf.length > 10)
}
is('die laaste dag sluit die WEEK af', WEEK6_DAE[4].knop, 'VOLTOOI WEEK 6')

console.log('\n── Die perke: dit mag nie soos huiswerk voel nie ──\n')
const EKSTRA = ['wallpaper', 'groepbrug']
for (const d of WEEK6_DAE) {
  const n = d.blokke.filter(b => !EKSTRA.includes(b.soort)).length
  waar(`dag ${d.n} het hoogstens 5 inhoudsblokke (${n})`, n <= 5)
}
for (const d of WEEK6_DAE) {
  const vrae = d.blokke.filter(b => b.soort === 'vraag'
    || (b.soort === 'kies' && b.vraag))
  waar(`dag ${d.n} vra hoogstens 2 antwoorde (${vrae.length})`, vrae.length <= 2)
}
/* Die `boodskap`-blok is vrygestel — dit is wat die opname elke ander week
   gedra het. */
for (const d of WEEK6_DAE) {
  for (const b of d.blokke.filter(x => x.soort === 'teks')) {
    const woorde = String(b.lyf || '').split(/\s+/).filter(Boolean).length
    waar(`dag ${d.n} se teksblok is hoogstens ${MAKS_TEKS} woorde (${woorde})`,
         woorde <= MAKS_TEKS)
  }
}

console.log('\n── Elke dag sluit met n gebed ──\n')
for (const d of WEEK6_DAE) {
  waar(`dag ${d.n} het n gebed`, d.blokke.some(b => b.soort === 'gebed'))
}

console.log('\n── Elke Skrifgedeelte maak die Bybel oop ──\n')
{
  const skrifte = WEEK6_DAE.map(d => {
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
  /* En geen gedeelte kom TWEE keer in die week voor nie. */
  is('vyf verskillende gedeeltes', new Set(skrifte).size, 5)
}

console.log('\n── GEEN STEMBOODSKAP: die boodskap word GELEES ──\n')
{
  /* Dewald: "Daar moet geen speelknoppie, klankspeler, tydsduur, klankgolf of
     stemboodskap-ikoon wees nie." Die `stem`-blok is die enigste ding wat 'n
     speler teken; bestaan hy nêrens, bestaan die speler nêrens. */
  const stemDae = WEEK6_DAE.filter(d => d.blokke.some(b => b.soort === 'stem'))
  is('geen enkele stem-blok in die hele week', stemDae.length, 0)
  is('en geen transkripsie nie', WEEK6_TRANSKRIPSIE, '')
  is('die register gee ook niks', weekTranskripsie(6), '')

  const boodskapDae = WEEK6_DAE.filter(d => d.blokke.some(b => b.soort === 'boodskap'))
  is('presies EEN dag dra die hoofboodskap', boodskapDae.length, 1)
  is('en dit is Dag 1', boodskapDae[0].n, 1)

  const b = boodskapDae[0].blokke.find(x => x.soort === 'boodskap')
  is('met Dewald se eie opskrif', b.kop, 'LEES VANDAG SE BOODSKAP')
  waar('dit is n lang leesstuk', b.lyf.split(/\s+/).filter(Boolean).length > 250)
  /* Dieselfde besluit as Week 3 se Dag 3, Week 4 se Dag 4 en Week 5 se Dag 1:
     die dag wat die hoofboodskap dra, dra GEEN gewone teksblok nie. */
  is('geen teksblok op die boodskap-dag', boodskapDae[0].blokke.filter(x => x.soort === 'teks').length, 0)
  /* §40: die brug na die groep kom NA die hoofboodskap. */
  const soorte = boodskapDae[0].blokke.map(x => x.soort)
  waar('die groepbrug staan NA die boodskap',
       soorte.lastIndexOf('groepbrug') > soorte.indexOf('boodskap'))

  console.log('\n── Die boodskap is WOORD VIR WOORD Dewald se teks ──\n')
  /* Hy het dit uitdruklik gevra: "PLAAS DIE VOLGENDE TEKS PRESIES SOOS DIT HIER
     STAAN. MOENIE ENIGE WOORDE VERANDER NIE." Hierdie blok is die wag daarteen
     dat iemand dit later "netjieser" maak. */
  waar('dit begin by sy eie opskrif',
       b.lyf.startsWith('JESUS HET NOOIT GESÊ DIT GAAN JOU NIKS KOS NIE'))
  waar('die kruis-lyn uit Lukas 9 staan daar',
       /Verloën jouself, neem elke dag jou kruis op en volg My\./.test(b.lyf))
  waar('die toring uit Lukas 14 ook',
       /toring wil bou en eers gaan sit om uit te werk wat dit gaan kos/.test(b.lyf))
  waar('die drie botsings staan daar',
       /Ek wil terugbaklei — Jesus sê vergewe\./.test(b.lyf))
  waar('en die twee vrae aan die einde',
       /WAAR BOTS MY WIL TANS MET JESUS SE WIL\?/.test(b.lyf)
       && /WAT GAAN DIT MY KOS AS EK AANHOU OM MYSELF TE VOLG\?/.test(b.lyf))
  waar('dit eindig by die roep', /“VOLG MY\.”$/.test(b.lyf.trim()))
}

console.log('\n── Twee brûe na die groep, soos elke ander week ──\n')
{
  const brue = WEEK6_DAE.flatMap(d => d.blokke.filter(b => b.soort === 'groepbrug'))
  is('twee groepbrûe', brue.length, 2)
  waar('albei is NET vir n groep', brue.every(b => b.netGroep === true))
}

console.log('\n── Albei wallpapers is in die week ──\n')
{
  const bronne = WEEK6_DAE.flatMap(d => d.blokke.filter(b => b.soort === 'wallpaper').map(b => b.bronVeld))
  is('twee wallpapers', bronne.length, 2)
  /* Dewald: "Wallpaper 1: aan die einde van Dag 1. Wallpaper 2: aan die einde
     van Dag 5." Hy laai albei self op — daar word niks gemaak nie. */
  is('die eerste prent sluit DAG 1 af',
     WEEK6_DAE[0].blokke.filter(b => b.soort === 'wallpaper').map(b => b.bronVeld),
     ['wallpaperDag1'])
  is("die week se prent sluit Dag 5 af",
     WEEK6_DAE[4].blokke.filter(b => b.soort === 'wallpaper').map(b => b.bronVeld),
     ['wallpaper'])
  /* Die velde bestaan in die rekord sodat die admin se oplaai iets het om in te
     skryf. Leeg is reg: hy laai hulle self op. */
  is('die rekord hou plek vir albei', [WEKE[6].wallpaperDag1, WEKE[6].wallpaper], ['', ''])
}

console.log('\n── Die mens kry sy eie woorde terug ──\n')
{
  const gevra = new Set(WEEK6_DAE.flatMap(d => d.blokke
    .filter(b => b.soort === 'vraag').map(b => b.id)))
  const terug = WEEK6_DAE.flatMap(d => d.blokke.filter(b => b.soort === 'terugblik'))
  is('een terugblik', terug.length, 1)
  waar('dit staan op Dag 5', WEEK6_DAE[4].blokke.some(b => b.soort === 'terugblik'))
  waar(`dit wys na "${terug[0].bronId}", wat wel gevra word`, gevra.has(terug[0].bronId))
  is('en dit is Dag 1 se vraag', terug[0].bronId, 'sukkel1')
}

console.log('\n── Die reis aan die einde wys net wat gevra is ──\n')
{
  const gevra = new Set(WEEK6_DAE.flatMap(d => d.blokke.flatMap(b => {
    if (b.soort === 'vraag') return [b.id]
    if (b.soort === 'kies' && b.vraag) return [b.vraag.id]
    return []
  })))
  is('drie terugblikke', WEEK6_REIS.length, 3)
  for (const r of WEEK6_REIS) waar(`"${r.id}" word wel gevra`, gevra.has(r.id))
  waar('Dag 1 se antwoord word nie twee keer gewys nie',
       !WEEK6_REIS.some(r => r.id === 'sukkel1'))
}

console.log('\n── Elke vraag se id is UNIEK ──\n')
{
  const ids = WEEK6_DAE.flatMap(d => d.blokke.flatMap(b => {
    const uit = []
    if (b.soort === 'vraag') uit.push(b.id)
    if (b.soort === 'kies') { uit.push(b.id); if (b.vraag) uit.push(b.vraag.id) }
    return uit
  }))
  is('geen id kom twee keer voor nie', ids.length, new Set(ids).size)
  waar('en hulle dra almal n woord van minstens 4', ids.every(i => i && i.length >= 4))
}

console.log('\n── Die keuse op Dag 2 ──\n')
{
  const kies = WEEK6_DAE[1].blokke.find(b => b.soort === 'kies')
  waar('daar is n keuse', !!kies)
  is('sewe gevoelens', kies.opsies.length, 7)
  waar('elke opsie het n waarde en woorde', kies.opsies.every(o => o.waarde && o.woorde))
  waar('geen twee opsies deel n waarde nie',
       new Set(kies.opsies.map(o => o.waarde)).size === kies.opsies.length)
  waar('en EEN opvolgvraag', !!(kies.vraag && kies.vraag.id))
  /* "Iets anders" moet daar wees: 'n lys gevoelens sonder 'n uitgang laat
     iemand wat nie pas nie, lieg of ophou. */
  waar('daar is n uitgang vir wie nie pas nie',
       kies.opsies.some(o => /iets anders/i.test(o.woorde)))
}

console.log('\n── Die opening is kort ──\n')
waar(`hoogstens 5 paragrawe (${WEEK6_OPENING.split('\n\n').length})`,
     WEEK6_OPENING.split('\n\n').length <= 5)
waar(`en hoogstens 400 karakters (${WEEK6_OPENING.length})`, WEEK6_OPENING.length <= 400)
waar('en dit eindig by die week se vraag', /WIE KRY DIE LAASTE SÊ\?$/.test(WEEK6_OPENING))

console.log('\n── Die register ken Week 6 ──\n')
is('hetDae(6)', hetDae(6), true)
is('die eerste vyf ook', [1, 2, 3, 4, 5].map(hetDae), [true, true, true, true, true])
is('maar nie week 8 nie', hetDae(8), false)
is('weekDae(6) gee vyf dae', weekDae(6).length, 5)
is('blokkeVir(6, 1) gee Dag 1 se blokke', blokkeVir(6, 1).length, blokkeVirDag6(1).length)
is('n onbekende week gee niks', blokkeVir(9, 1), [])
is("en die deelsin is die week s'n", weekDeelsin(6), WEEK6_DEELSIN)
waar('Week 5 en Week 6 se deelsinne verskil', weekDeelsin(5) !== weekDeelsin(6))

console.log('\n── Week 5 wys nou NA Week 6, en die titel stem ──\n')
{
  const brug = weekVolgende(5)
  waar('daar is n brug van Week 5 af', !!brug)
  is('en dit wys na week 6', brug && brug.nommer, 6)
  /* Die brug het Week 6 se titel BELOWE voordat die week bestaan het. Nou moet
     die belofte waar wees. */
  is('met Week 6 se titel', brug && brug.titel, WEKE[6].titel)
}

console.log('\n── En Week 6 loop DEUR na Week 7 ──\n')
{
  /* Dit was `null`, en dan eindig Week 6 op n doodloopstraat: die mens maak
     Dag 5 klaar en kry niks. Week 3 het n dag lank so gestaan.

     Die brug is een van die vyf plekke wat CLAUDE.md uitwys, en die maklikste
     om te vergeet, want die week SELF werk sonder hom. */
  waar('WEEK6_VOLGENDE bestaan', !!WEEK6_VOLGENDE)
  is('en dit wys na week 7', WEEK6_VOLGENDE.week, 7)
  is('met Week 7 se egte titel', WEEK6_VOLGENDE.titel, 'Wat soek jy?')
  is('die register gee dieselfde', weekVolgende(6), WEEK6_VOLGENDE)
  /* n Brug wat n titel VOORSPEL is n belofte wat ons nie kan hou nie. Hierdie
     een kom uit Week 7 se eie rekord. */
  waar('die titel is nie versin nie', WEEK6_VOLGENDE.titel.length > 3)
}

console.log('\n── Die klaar-skerm praat oor HIERDIE week ──\n')
{
  const k = weekKlaar(6)
  waar('Week 6 bring sy eie klaar-woorde', !!(k && k.kop && k.lyf))
  is('en dit is die uitgevoerde blok', k, WEEK6_KLAAR)
  waar('dit is nie Week 1 se ou slot nie', !/BEGIN KYK/i.test(k.kop))
  waar('dit is nie Week 5 se slot nie', weekKlaar(5).kop !== k.kop)
  waar('dit vra die week se eie vraag', /LAASTE SÊ/i.test(k.kop))
  /* Die genade-lyn mag nooit uitval nie: die hele week kan andersins lees soos
     "verdien dit". Dewald se fasiliteerdernota sê dit twee keer. */
  waar('en dit sê dat redding genade is', /Redding is genade/i.test(k.lyf))
}

console.log('\n── Die week se rekord kan PUBLISEER, SONDER n opname ──\n')
{
  const w = { ...WEKE[6] }
  const kontroles = { teks: true, konteks: true, jesus: true, toepassing: true, grens: true }
  is('daar is geen stemboodskap nie', w.stemboodskapUrl, '')
  is('en geen video nie', w.videoId, '')
  waar('maar die boodskap is as GESKREWE gemerk', w.geskreweBoodskap === true)

  const gereed = { ...w, kontroles, hersieningStatus: 'goedgekeur' }
  is('met alles reg is daar geen fout nie', publiseerFoute(gereed), [])
  is('en dit mag publiseer', magPubliseer(gereed), true)

  /* Die hek moet steeds 'n hek wees. */
  const sonder = { ...gereed, geskreweBoodskap: false }
  waar('sonder die merkie mag dit NIE', !magPubliseer(sonder))
  waar('en die fout sê hoekom',
       publiseerFoute(sonder).some(f => /hoofboodskap/i.test(f)))
  const weg = { ...gereed }
  delete weg.geskreweBoodskap
  waar('n ontbrekende merkie tel ook nie', !magPubliseer(weg))
}

console.log('\n── Die dag-titels stem ooreen met die admin se rekord ──\n')
{
  const w = WEKE[6]
  for (const d of WEEK6_DAE) is(`dag ${d.n}`, w[`dag${d.n}Titel`], d.titel)
}

console.log('\n── Die admin se Skrifte is geldig ──\n')
waar('primereSkrif ontleed', (ontleedVerwysing(WEKE[6].primereSkrif) || []).length > 0)
waar('ondersteunendeSkrif ontleed', (ontleedVerwysing(WEKE[6].ondersteunendeSkrif) || []).length > 0)

console.log('\n── Die fasiliteerder kry sy grens ──\n')
{
  const w = WEKE[6]
  waar('daar is n hoofpunt', w.fasiliteerderHoofpunt.length > 40)
  waar('en n grens', w.fasiliteerderGrens.length > 40)
  /* Die duurste sin in Dewald se nota: verloën is nie haat nie, en dit is nie
     'n opdrag om mishandeling te verdra nie. */
  waar('dit sê verloën is nie haat nie', /nie dat jy jouself moet haat nie/i.test(w.fasiliteerderGrens))
  waar('en dit noem mishandeling', /mishandeling/i.test(w.fasiliteerderGrens))
  waar('en dat niemand anders jou mag beheer nie', /mag beheer nie/i.test(w.fasiliteerderGrens))
}

console.log('\n── Die groepsessie ──\n')
waar('n titel', WEEK6_SESSIE.titel.length > 2)
is('twee kern-Skrifte', WEEK6_SESSIE.skrifte.length, 2)
is('vier besprekingsvrae', WEEK6_SESSIE.vrae.length, 4)
waar('n slotgebed', WEEK6_SESSIE.gebed.length > 20)
for (const s of WEEK6_SESSIE.skrifte) {
  waar(`kern-Skrif "${s}" ontleed`, (ontleedVerwysing(s) || []).length > 0)
}
/* Die groepchat lees hierdie vrae direk; sien vjChatOnderwerp.js. Staan hulle
   nie ook in die plat rekord nie, wys die admin iets anders as die app. */
for (let i = 0; i < 4; i++) {
  is(`groepVraag${i + 1} stem ooreen`, WEKE[6][`groepVraag${i + 1}`], WEEK6_SESSIE.vrae[i])
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
