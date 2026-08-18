/* Week 1 se pad: niks herhaal, en niks val weg nie.
 *
 * Dewald het dit op sy foon raakgesien: "Some of the stuff that is in day one
 * is also in day two. Like the text about John that they have to read again in
 * day two."
 *
 * Dit is presies die soort fout wat 'n mens NIE in 'n blaaier sien nie — jy
 * moet twee dae langs mekaar hou om dit raak te sien, en teen die tyd dat jy
 * by Dag 2 kom, het jy Dag 1 vergeet. 'n Toets hou albei gelyk vas.
 *
 * Dit toets REELS, nie 'n oomblik nie: dieselfde Skrifgedeelte mag nie twee
 * dae presies so herhaal nie, twee vrae mag nie dieselfde id deel nie (dan
 * skryf die een die ander se antwoord dood), en elke stap moet 'n knoppie hê
 * om by die volgende uit te kom.
 */
import {
  WEEK1_DAE, WEEK1_REIS, WEEK1_TRANSKRIPSIE, BEGINPUNT, stappeVirDag,
} from './volgJesusWeek1.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)

/* Die volle pad, met 'n area gekies sodat Dag 3 se tak ook meetel. */
const PAD = WEEK1_DAE.map(d => ({ n: d.n, stappe: stappeVirDag(d.n, { area: 'bang', beginpunt: 'onseker' }) }))

console.log('\n── Vyf dae, elkeen met stappe ──\n')
is('daar is vyf dae', WEEK1_DAE.length, 5)
for (const d of PAD) waar(`dag ${d.n} het stappe`, d.stappe.length > 0)
for (const d of WEEK1_DAE) waar(`dag ${d.n} het n titel`, String(d.titel || '').trim().length > 3)

console.log('\n── Geen Skrifgedeelte word twee dae presies herhaal nie ──\n')
/* Die fout wat Dewald gevang het. Johannes 1:1–18 het op Dag 1 EN Dag 2
   gestaan; Dag 2 se hele doel is om Johannes 1 oop te maak, en Dag 1 was
   reeds te lank. */
const lesings = new Map()
for (const d of PAD) {
  for (const s of d.stappe) {
    if (s.soort !== 'lees') continue
    const bestaan = lesings.get(s.skrif)
    if (bestaan) {
      val++
      console.log(`  VAL ${s.skrif} staan op dag ${bestaan} EN dag ${d.n}`)
    } else lesings.set(s.skrif, d.n)
  }
}
reg++
is('Dag 1 lees Matteus 16, nie Johannes nie',
   PAD[0].stappe.filter(s => s.soort === 'lees').map(s => s.skrif), ['Matteus 16:13–17'])
is('Dag 2 lees Johannes 1:1–18',
   PAD[1].stappe.filter(s => s.soort === 'lees').map(s => s.skrif), ['Johannes 1:1–18'])
/* Dag 4 se Johannes 1:14–18 is nie 'n herhaling nie — dit is 'n INZOEM op
   "vol genade en waarheid", en dit staan so in Dewald se dokument. */
is('Dag 4 zoem in op Johannes 1:14–18',
   PAD[3].stappe.filter(s => s.soort === 'lees').map(s => s.skrif), ['Johannes 1:14–18'])

console.log('\n── Dag 1 is nie te lank nie ──\n')
/* Dag 1 dra reeds die hele stemboodskap. Word dit langer as die ander dae,
   maak mense dit nie klaar nie — en 'n eerste dag wat nie klaargemaak word
   nie, is 'n program wat nie begin nie. */
waar('Dag 1 is hoogstens so lank soos die langste ander dag',
     PAD[0].stappe.length <= Math.max(...PAD.slice(1).map(d => d.stappe.length)))
waar('en dit dra die stemboodskap', PAD[0].stappe.some(s => s.soort === 'stem'))
is('die stemboodskap staan NET op Dag 1',
   PAD.filter(d => d.stappe.some(s => s.soort === 'stem')).map(d => d.n), [1])

console.log('\n── Geen twee vrae deel n id nie ──\n')
/* Deel twee velde 'n id, skryf die tweede die eerste se antwoord dood — en
   dan is die terugblik op Dag 5 die verkeerde woorde. */
const ids = new Map()
for (const d of PAD) {
  for (const s of d.stappe) {
    for (const v of (s.velde || [])) {
      const bestaan = ids.get(v.id)
      if (bestaan) { val++; console.log(`  VAL id "${v.id}" staan op dag ${bestaan} EN dag ${d.n}`) }
      else ids.set(v.id, d.n)
    }
    if (s.soort === 'keuse' || s.soort === 'spieel') {
      if (ids.has(s.id)) { val++; console.log(`  VAL keuse-id "${s.id}" is dubbel`) }
      else ids.set(s.id, d.n)
    }
  }
}
reg++
waar('daar is meer as tien private antwoorde', ids.size > 10)

console.log('\n── Geen woorde word woordeliks herhaal nie ──\n')
/* 'n HOU DIT VAS wat twee keer dieselfde sê, laat die tweede dag soos 'n
   herhaling voel. */
const houe = PAD.flatMap(d => d.stappe.filter(s => s.soort === 'hou').map(s => s.lyf))
is('elke HOU DIT VAS is uniek', new Set(houe).size, houe.length)
const gebede = PAD.flatMap(d => d.stappe.filter(s => s.soort === 'bid').map(s => s.gebed))
is('elke gebed is uniek', new Set(gebede).size, gebede.length)

console.log('\n── Elke stap kan by die volgende uitkom ──\n')
let sonderKnop = 0
for (const d of PAD) {
  for (const s of d.stappe) {
    /* 'n Terugblik en 'n spieël dra hulle eie knoppie in die skerm. */
    if (s.soort === 'spieel') continue
    if (!String(s.knop || '').trim()) { sonderKnop++; console.log(`  VAL dag ${d.n}: 'n ${s.soort}-stap sonder knoppie`) }
  }
}
is('geen stap sit vas nie', sonderKnop, 0)

console.log('\n── Die terugblik wys na iets wat werklik bestaan ──\n')
const terugblikke = PAD.flatMap(d => d.stappe.filter(s => s.soort === 'terugblik'))
waar('daar is n terugblik', terugblikke.length >= 1)
for (const t of terugblikke) {
  waar(`die terugblik se bron "${t.bronId}" word werklik gevra`, ids.has(t.bronId))
  waar(`en dit kom van n VROEER dag af`, ids.get(t.bronId) < 5)
}
for (const r of WEEK1_REIS) {
  waar(`die reis se "${r.id}" word werklik gevra`, ids.has(r.id))
}

console.log('\n── Die beginpunt ──\n')
is('drie beginpunte', BEGINPUNT.keuses.length, 3)
for (const k of BEGINPUNT.keuses) waar(`"${k.woorde}" het n antwoord`, String(k.antwoord || '').trim().length > 20)

console.log('\n── Die transkripsie ──\n')
waar('dit is die nuwe boodskap', /wie sit op die troon van jou lewe/i.test(WEEK1_TRANSKRIPSIE))
waar('dit is lank genoeg om die egte een te wees', WEEK1_TRANSKRIPSIE.length > 3000)
is('geen ontsnapte \\u in die woorde', /\\u[0-9a-f]{4}/i.test(WEEK1_TRANSKRIPSIE), false)

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
