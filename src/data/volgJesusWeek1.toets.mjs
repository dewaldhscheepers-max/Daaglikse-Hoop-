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
for (const d of DAE) {
  waar(`dag ${d.n} het hoogstens 5 blokke (${d.blokke.length})`, d.blokke.length <= 5)
}
/* Hoogstens twee private antwoorde per dag. Dit is Dewald se eie perk. */
for (const d of DAE) {
  const vrae = d.blokke.flatMap(b =>
    b.soort === 'vraag' ? [b.id] : (b.soort === 'kies' && b.vraag ? [b.vraag.id] : []))
  waar(`dag ${d.n} vra hoogstens 2 antwoorde (${vrae.length})`, vrae.length <= 2)
}
/* Geen "DINK HIERAAN"-blok van ses paragrawe nie. */
for (const d of DAE) {
  for (const b of d.blokke) {
    if (b.soort !== 'teks') continue
    const paragrawe = String(b.lyf || '').split('\n\n').length
    waar(`dag ${d.n} se teksblok is hoogstens 3 paragrawe (${paragrawe})`, paragrawe <= 3)
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
is('Dag 3, 4 en 5 lees niks nuuts nie',
   DAE.slice(2).flatMap(d => d.blokke.filter(b => b.soort === 'lees')).length, 0)

console.log('\n── Die stemboodskap ──\n')
is('dit staan NET op Dag 1', DAE.filter(d => d.blokke.some(b => b.soort === 'stem')).map(d => d.n), [1])
waar('dit is die nuwe boodskap', /die kruis vir jou skuld vat en die troon vir jouself hou/i.test(WEEK1_TRANSKRIPSIE))
waar('en dit begin by n werklike lewe, nie by teologie nie',
     /^As Jesus vandag niks vir jou regmaak nie/.test(WEEK1_TRANSKRIPSIE))
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

/* Die twee sinne wat moet bly brand nadat die klank klaar is. */
waar('die eerste kern: wil ek Jesus he, of net wat Hy kan doen',
     /vir Wie Hy is… of net vir wat ek hoop Hy vir my sal doen/.test(WEEK1_TRANSKRIPSIE))
waar('en dit eindig by die lewe, nie by n les nie',
     /Jou lewe wys wie jy glo Jesus is\.$/.test(WEEK1_TRANSKRIPSIE.trim()))

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
     /kruis vir jou skuld vat en die troon vir jouself hou/i.test(WEEK1_DEELSIN))
is('volgende week is week 2', WEEK1_VOLGENDE.nommer, 2)
waar('en dit gee n rede om terug te kom', String(WEEK1_VOLGENDE.lyf || '').length > 40)

console.log('\n── Die opening is KORT ──\n')
/* Die vorige opening was sewe paragrawe. Dewald: "Moenie die huidige lang
   openingsblad gebruik nie ... Geen verdere intro." */
waar(`hoogstens 5 paragrawe (${WEEK1_OPENING.split('\n\n').length})`,
     WEEK1_OPENING.split('\n\n').length <= 5)
waar('en hoogstens 400 karakters', WEEK1_OPENING.length <= 400)

console.log('\n── Elke gebed is een kort reel, en uniek ──\n')
const gebede = DAE.flatMap(d => d.blokke.filter(b => b.soort === 'gebed').map(b => b.lyf))
is('elke gebed is uniek', new Set(gebede).size, gebede.length)
for (const g of gebede.slice(0, gebede.length - 1)) {
  waar(`"${g.slice(0, 28)}…" is kort`, g.length < 140)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
