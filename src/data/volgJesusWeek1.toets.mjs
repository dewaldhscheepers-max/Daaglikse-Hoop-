/* Week 1 moet LIG voel, en niks mag herhaal nie.
 *
 * Dewald: "VOLG JESUS MAG NOOIT SOOS HUISWERK VOEL NIE ... Die probleem met
 * die huidige implementasie is dat dit soos 'n kursus voel: lees, klik, lees,
 * klik, luister, klik, skryf, klik."
 *
 * Die vorige weergawe het agt skermpies per dag gehad. Hierdie toets hou die
 * nuwe reels vas, want hulle is die soort ding wat stilweg terugsluip sodra
 * iemand "net nog een kaart" byvoeg:
 *
 *   · een BLAD per dag, nie 'n ketting skerms nie;
 *   · hoogstens twee private antwoorde per dag;
 *   · geen Skrifgedeelte twee dae presies so nie;
 *   · Dag 5 wys die mens sy eie Dag 1-woorde terug.
 *
 * Dewald se eie toets vir elke nuwe stuk teks: "Sal die gebruiker iets verloor
 * as ons hierdie verwyder?" Hierdie leer is die weergawe daarvan wat 'n mens
 * kan loop.
 */
import {
  WEEK1_DAE, WEEK1_REIS, WEEK1_TRANSKRIPSIE, WEEK1_OPENING, WEEK1_DEELSIN,
  WEEK1_VOLGENDE, blokkeVirDag,
} from './volgJesusWeek1.js'
import { ontleedVerwysing } from './volgJesus.js'
import { weekOpening } from './volgJesusDae.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)

const DAE = WEEK1_DAE.map(d => ({ n: d.n, dag: d, blokke: blokkeVirDag(d.n) }))

console.log('\n── Vyf dae, elkeen EEN blad ──\n')
is('daar is vyf dae', DAE.length, 5)
for (const d of DAE) {
  waar(`dag ${d.n} het blokke`, d.blokke.length > 0)
  waar(`dag ${d.n} het n titel`, String(d.dag.titel || '').trim().length > 3)
  waar(`dag ${d.n} het EEN knoppie`, String(d.dag.knop || '').trim().length > 3)
}

console.log('\n── Dit mag nie soos huiswerk voel nie ──\n')
/* Die getal blokke is die naaste ding aan "hoe lank voel dit". Meer as vyf op
   een dag, en 'n mens skuif deur 'n werkboek. Dag 1 dra die stemboodskap en
   mag die grootste wees. */
/* Die wallpaper en die groepbrug tel NIE saam nie. Hulle is nie werk wat 'n
   mens moet deurwerk — die een is 'n prent om te hou, die ander 'n deur na die
   groep. Hulle saamgetel het my Week 2 se Dag 5 se LEES-kaart laat uitgooi om
   binne vyf te bly, en toe staan daar 'n Skrifverwysing sonder 'n knoppie.
   Dewald: "waar de vok staan daar maak die bybel ook". Ons meet dus die INHOUD. */
const EKSTRA = ['wallpaper', 'groepbrug']
const inhoudBlokke = d => d.blokke.filter(b => !EKSTRA.includes(b.soort))
for (const d of DAE) {
  const n = inhoudBlokke(d).length
  waar(`dag ${d.n} het hoogstens 5 inhoudsblokke (${n})`, n <= 5)
}
/* Hoogstens twee private antwoorde per dag. Dit is Dewald se eie perk. */
for (const d of DAE) {
  const vrae = d.blokke.flatMap(b =>
    b.soort === 'vraag' ? [b.id] : (b.soort === 'kies' && b.vraag ? [b.vraag.id] : []))
  waar(`dag ${d.n} vra hoogstens 2 antwoorde (${vrae.length})`, vrae.length <= 2)
}
/* Dit was "hoogstens 3 paragrawe". Daardie getal het die verkeerde ding gemeet:
   Dewald skryf in kort paragrawe met wit tussenin, en dit LEES makliker as drie
   dig gepakte blokke. Wat werklik saak maak, is hoeveel daar is om te lees. */
for (const d of DAE) {
  for (const b of d.blokke) {
    if (b.soort !== 'teks') continue
    const woorde = String(b.lyf || '').split(/\s+/).filter(Boolean).length
    waar(`dag ${d.n} se teksblok is hoogstens 180 woorde (${woorde})`, woorde <= 180)
  }
}

/* Staan daar 'n Skrifverwysing op 'n blok, MOET die Bybel daar oopmaak. Die
   knoppie kom uit `skrif`, nooit uit die opskrif nie. Week 2 se Dag 5 het 'n
   verwysing as opskrif gehad met niks agter hom nie, en dit lees soos 'n
   stukkende LEES-kaart. Dieselfde perk geld hier. */
console.log('\n── Elke Skrifverwysing maak die Bybel oop ──\n')
for (const d of DAE) {
  for (const b of d.blokke) {
    if (!(ontleedVerwysing(b.kop || '') || []).length) continue
    waar(`dag ${d.n} se "${b.kop}" maak die Bybel oop`,
         (ontleedVerwysing(b.skrif || '') || []).length > 0)
  }
}

console.log('\n── Geen Skrifgedeelte word twee dae herhaal nie ──\n')
const gesien = new Map()
for (const d of DAE) {
  for (const b of d.blokke) {
    if (b.soort !== 'lees') continue
    if (gesien.has(b.skrif)) { val++; console.log(`  VAL ${b.skrif} staan op dag ${gesien.get(b.skrif)} EN dag ${d.n}`) }
    else gesien.set(b.skrif, d.n)
  }
}
reg++
is('Dag 1 lees Matteus 16', DAE[0].blokke.filter(b => b.soort === 'lees').map(b => b.skrif), ['Matteus 16:13–17'])
is('Dag 2 lees Johannes 1', DAE[1].blokke.filter(b => b.soort === 'lees').map(b => b.skrif), ['Johannes 1:1–18'])
/* Dewald het die week oorgeskryf en ELKE dag lees nou Skrif. Die reel wat oor
   is, is die belangrike een: staan daar 'n verwysing, moet die Bybel daar
   oopmaak, en geen gedeelte kom twee dae voor nie (hierbo afgedwing). */
is('al vyf dae lees Skrif',
   DAE.flatMap(d => d.blokke.filter(b => b.soort === 'lees')).length, 5)
is('Dag 3 lees Lukas 6', DAE[2].blokke.filter(b => b.soort === 'lees').map(b => b.skrif), ['Lukas 6:46–49'])
is('Dag 4 lees Lukas 9', DAE[3].blokke.filter(b => b.soort === 'lees').map(b => b.skrif), ['Lukas 9:23–25'])
is('en Dag 5 kom terug by Matteus 16',
   DAE[4].blokke.filter(b => b.soort === 'lees').map(b => b.skrif), ['Matteus 16:15–17'])

console.log('\n── Die stemboodskap ──\n')
is('dit staan NET op Dag 1', DAE.filter(d => d.blokke.some(b => b.soort === 'stem')).map(d => d.n), [1])
/* Die twee sinne wat moet bly brand nadat die klank klaar is. Die eerste is
   ook Dag 1 se stemblok se titel — die sin wat 'n mens hoor, is die sin wat op
   die skerm staan. */
waar('die kernsin staan daarin',
     /Jesus pas nie by jou lewe aan nie\. Jou lewe verander rondom Hom\./i.test(WEEK1_TRANSKRIPSIE))
waar('en die tweede een ook',
     /“Here” beteken: Jesus kry die laaste sê|U kry die laaste sê/i.test(WEEK1_TRANSKRIPSIE))
{
  const stem = DAE[0].blokke.find(b => b.soort === 'stem')
  waar('en Dag 1 se stemblok dra dieselfde sin',
       WEEK1_TRANSKRIPSIE.includes(String(stem.titel || '').trim()))
}
waar('en dit begin waar Dewald begin het, nie by teologie nie',
     /^Ek moet vandag iets eerlik sê/.test(WEEK1_TRANSKRIPSIE))
waar('dit eindig met die gebed', /Amen\.$/.test(WEEK1_TRANSKRIPSIE.trim()))
/* Die paragrawe moet BREEK — een blok van 3 400 karakters is onleesbaar. */
waar(`dit is in paragrawe (${(WEEK1_TRANSKRIPSIE.match(/\n\n/g) || []).length})`,
     (WEEK1_TRANSKRIPSIE.match(/\n\n/g) || []).length > 20)
is('geen ontsnapte \\u in die woorde', /\\u[0-9a-f]{4}/i.test(WEEK1_TRANSKRIPSIE), false)

/* Dewald oor hierdie weergawe: "Ek sou hom nie langer maak nie ... Ek sou nie
   Billy Graham, Joyce Meyer, Josh Howerton of enige ander prediker daarin noem
   nie. Jesus moet die enigste groot Naam wees wat die luisteraar onthou." */
is('geen ander prediker word genoem nie',
   /Graham|Joyce Meyer|Howerton|Furtick|Lentz/i.test(WEEK1_TRANSKRIPSIE), false)

/* "Ek sou die opname onder 5 minute hou." Teen 'n natuurlike ~150 woorde per
   minuut is dit sowat 750 woorde. 'n Transkripsie wat stilweg groei, is 'n
   ses-minute teologiese marathon wat niemand klaar luister nie. */
const woorde = WEEK1_TRANSKRIPSIE.trim().split(/\s+/).length
waar(`dit bly onder ~5 minute (${woorde} woorde)`, woorde <= 820)
waar('en dit is nie n stukkie nie', woorde >= 500)

/* Die vraag waarmee die hele week begin, moet in die boodskap self staan. */
waar('die vraag van Matteus 16 staan daarin',
     /wie, sê julle, is Ek\?/i.test(WEEK1_TRANSKRIPSIE))
waar('en dit noem VOLG JESUS by die naam', /VOLG JESUS/.test(WEEK1_TRANSKRIPSIE))

console.log('\n── Geen twee antwoorde deel n id nie ──\n')
/* Deel twee velde 'n id, skryf die een die ander dood — en dan is die
   terugblik op Dag 5 die verkeerde woorde. */
const ids = new Map()
for (const d of DAE) {
  for (const b of d.blokke) {
    const lys = []
    if (b.soort === 'vraag') lys.push(b.id)
    if (b.soort === 'kies') { lys.push(b.id); if (b.vraag) lys.push(b.vraag.id) }
    for (const id of lys) {
      if (ids.has(id)) { val++; console.log(`  VAL id "${id}" staan op dag ${ids.get(id)} EN dag ${d.n}`) }
      else ids.set(id, d.n)
    }
  }
}
reg++
waar('daar is minstens ses antwoorde oor die week', ids.size >= 6)

console.log('\n── Die terugblik ──\n')
const terug = DAE.flatMap(d => d.blokke.filter(b => b.soort === 'terugblik').map(b => ({ ...b, dag: d.n })))
is('daar is presies een terugblik', terug.length, 1)
is('en dit staan op Dag 5', terug[0].dag, 5)
waar('sy bron word werklik gevra', ids.has(terug[0].bronId))
waar('en dit kom van Dag 1 af', ids.get(terug[0].bronId) === 1)

console.log('\n── Wat die week afsluit ──\n')
for (const r of WEEK1_REIS) waar(`die weekoorsig se "${r.id}" word werklik gevra`, ids.has(r.id))
waar('die deelsin is die week se kernlyn',
     /jou lewe wys uiteindelik wie die laaste sê kry/i.test(WEEK1_DEELSIN))
is('volgende week is week 2', WEEK1_VOLGENDE.nommer, 2)
waar('en dit gee n rede om terug te kom', String(WEEK1_VOLGENDE.lyf || '').length > 40)

console.log('\n── Die opening kom uit die KODE ──\n')
/* Die skerm het `week.openingskerm || weekOpening(w)` gedoen, dus het die
   Firestore-rekord gewen. Toe die week se teks verander, het die dae verander
   en die openingsblad nie — want daardie rekord is uit die ou saad geskryf.
   Die kode is nou die bron vir 'n week wat sy dae dra. */
waar('weekOpening(1) gee die NUWE opening', weekOpening(1) === WEEK1_OPENING)
waar('en dit is Dewald se nuwe woorde',
     /Voordat ons vra hoe om Jesus te volg/.test(weekOpening(1)))
waar('nie die ou een nie', !/Jy hoef nie hierdie week alles uit te werk nie/.test(weekOpening(1)))
/* 'n Week sonder 'n dag-pad gee '' — dan val die skerm op die rekord terug. */
is('n onbekende week gee n lee opening', weekOpening(9), '')

console.log('\n── Die opening is KORT ──\n')
/* Die vorige opening was sewe paragrawe. Dewald: "Moenie die huidige lang
   openingsblad gebruik nie ... Geen verdere intro." */
waar(`hoogstens 5 paragrawe (${WEEK1_OPENING.split('\n\n').length})`,
     WEEK1_OPENING.split('\n\n').length <= 5)
waar('en hoogstens 400 karakters', WEEK1_OPENING.length <= 400)

console.log('\n── Elke gebed is kort genoeg om hardop te bid, en uniek ──\n')
const gebede = DAE.flatMap(d => d.blokke.filter(b => b.soort === 'gebed').map(b => b.lyf))
is('elke gebed is uniek', new Set(gebede).size, gebede.length)
for (const g of gebede.slice(0, gebede.length - 1)) {
  /* 140 was te styf sodra 'n gebed die dag se vraag opneem. 300 is steeds
     hoogstens 'n paar sinne — genoeg om in een asem hardop te bid. */
  waar(`"${g.slice(0, 28)}…" is kort (${g.length})`, g.length <= 300)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
