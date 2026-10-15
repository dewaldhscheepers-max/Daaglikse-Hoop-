/* node src/data/reelsStres.toets.mjs
 *
 * Die voer se WAARBORGE, oor honderde ewekansige voere — nie 'n handvol
 * uitgesoekte gevalle nie. Dewald, 15 Oktober 2026: "maak seker dat die
 * algoritme 100% reg werk en betroubaar is." Hierdie toets het op daardie dag
 * vyf egte foute gevind wat die eenheidstoetse almal groen gelaat het:
 *
 *   · een clip het drie, vyf keer onder mekaar gestaan (234 uit 4000 voere);
 *   · 'n klein lys het een clip uitgehonger — hy het elke rondte agter geraak;
 *   · die naat tussen twee passe het twee van een maker langs mekaar gesit;
 *   · 'n ruil het twee Engelse clips langs mekaar gesit;
 *   · dieselfde clips in 'n ander VOLGORDE het 'n ander voer gegee (200/200).
 *
 * Elke eienskap hieronder is een van Dewald se eie reëls, of die vangnet vir
 * een van daardie foute. 'n Ewekansige generator met 'n VASTE saad: dieselfde
 * gevalle elke lopie, dus is 'n mislukking herhaalbaar. */
import { bouVoer, skoonLys, taalVan, SPASIE } from './reels.js'

let reg = 0, val = 0
const foute = {}
function moet(t, soort, info) { if (t) { reg++; return } val++; (foute[soort] ||= []).push(info) }
function rng(s) { return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 } }

function lysVir(r, { klein = false, realisties = false } = {}) {
  const n = realisties ? 200 + Math.floor(r() * 60) : 1 + Math.floor(r() * (klein ? 12 : 120))
  const makers = realisties ? 10 + Math.floor(r() * 21) : 1 + Math.floor(r() * Math.min(n, 15))
  const enDeel = realisties ? r() * 0.2 : (r() < .4 ? r() * .4 : 0)
  return Array.from({ length: n }, (_, i) => {
    const m = Math.floor(Math.pow(r(), realisties ? 1.4 : 1.7) * makers)
    return { id: String(7500000000000000000n + BigInt(Math.floor(r() * 1e15))), bron: 'tiktok', bronId: 'b' + i,
      naam: 'maker' + m, handvatsel: '@m' + m, gedeel: r() < .3 ? Math.floor(r() * 50) : 0,
      taal: r() < enDeel ? 'en' : undefined }
  })
}
function geskiedenis(r, ids) {
  const g = {}, s = r()
  if (s > .25) for (const id of ids) if (r() < (s > .75 ? 1 : .5)) g[id] = Math.floor(r() * (s > .9 ? 3 : 2))
  return g
}

function keur(lys, r, soort) {
  const skoon = skoonLys(lys), ids = skoon.map(k => k.id), n = ids.length
  const g = geskiedenis(r, ids)
  const deepId = r() < .4 ? ids[Math.floor(r() * n)] : null
  const o = { deepId, gesien: g, saad: 1 + Math.floor(r() * 1e6), passe: 1 + Math.floor(r() * 5), nuut: !Object.keys(g).length }
  const ry = bouVoer(lys, o).map(i => i.klip)
  const id = ry.map(k => k.id)

  if (deepId) moet(id[0] === deepId, 'die gedeelde clip staan eerste', soort)
  moet(id.every((x, i) => !i || id[i - 1] !== x), 'nooit dieselfde clip langs homself nie', soort)

  // "moet nooit video 2 keer wys as daar ander videos is wat hul nog nie gekyk het nie":
  // geen clip loop ooit meer as EEN kyk voor die res nie
  const c = Object.fromEntries(ids.map(x => [x, g[x] || 0])); let voor = 0
  ry.forEach((k, i) => { const min = Math.min(...Object.values(c)); if (!(i === 0 && k.id === deepId) && c[k.id] > min + 1) voor++; c[k.id]++ })
  moet(voor === 0, 'nooit meer as een kyk voor die res nie', soort)

  // die voer groei sonder om te herskommel (sy rol, 'n pas kom by)
  const groter = bouVoer(lys, { ...o, passe: o.passe + 2 }).map(i => i.klip.id)
  const veilig = Math.max(0, id.length - n)
  moet(id.slice(0, veilig).every((x, i) => groter[i] === x), 'n groter voer begin presies soos die kleiner een', soort)

  // dieselfde clips in 'n ander volgorde (die kas teenoor die bediener) is DIESELFDE voer
  const geskommel = [...lys].reverse()
  moet(bouVoer(geskommel, o).map(i => i.klip.id).join() === id.join(), 'die volgorde van die invoer maak nie saak nie', soort)

  // spasie tussen herhalings, as sy nog niks gesien het nie
  if (n > SPASIE * 2 && !Object.keys(g).length) {
    const laas = {}; let min = Infinity
    id.forEach((x, i) => { if (x in laas) min = Math.min(min, i - laas[x]); laas[x] = i })
    moet(min >= SPASIE, `'n herhaling minstens ${SPASIE} plekke weg`, soort)
  }
  return ry
}

console.log('\n── Ewekansige voere, 1 tot 120 clips ──')
for (let g = 0; g < 500; g++) keur(lysVir(rng(g * 7919 + 1)), rng(g * 31 + 7), 'algemeen')
console.log('── Klein lyste (1 tot 12): die vreemdeling op \'n stadige lyn ──')
for (let g = 0; g < 300; g++) keur(lysVir(rng(g * 104723 + 5), { klein: true }), rng(g * 17 + 3), 'klein')

console.log('── Realisties: 200-260 clips, 10-30 makers, tot 20% Engels ──')
let items = 0, mk = 0, ee = 0
for (let g = 0; g < 120; g++) {
  const r = rng(g * 104729 + 3)
  const ry = keur(lysVir(r, { realisties: true }), r, 'realisties')
  items += ry.length
  ry.forEach((k, i) => { if (i && ry[i - 1].naam === k.naam) mk++; if (i && taalVan(k) === 'en' && taalVan(ry[i - 1]) === 'en') ee++ })
}
moet(ee === 0, 'realisties: nooit twee Engelse langs mekaar nie', ee)
moet(mk / items < 0.0005, `realisties: twee van een maker langs mekaar hoogstens 0,05% (${mk} uit ${items})`, mk)

console.log('── Gemors en duplikate ──')
let ontplof = false, u = []
try { u = bouVoer([null, 5, 'x', {}, { id: 'a/b', bron: 'tiktok', bronId: 'x', naam: 'n' }], { saad: 1, passe: 3, gesien: 'stukkend', deepId: {} }) } catch { ontplof = true }
moet(!ontplof && u.length === 0, 'gemors ontplof nie en kom nie deur nie', u.length)
const dup = [{ id: '1', bron: 'tiktok', bronId: 'x', naam: 'a' }, { id: '1', bron: 'tiktok', bronId: 'x', naam: 'a' }, { id: '2', bron: 'tiktok', bronId: 'y', naam: 'b' }]
moet(bouVoer(dup, { saad: 1, passe: 1 }).length === 2, "'n duplikaat-id kom een keer in 'n rondte", 'dup')

for (const [soort, lys] of Object.entries(foute)) console.log(`  VAL  ${soort}  x${lys.length}  ${JSON.stringify(lys.slice(0, 3))}`)
console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
