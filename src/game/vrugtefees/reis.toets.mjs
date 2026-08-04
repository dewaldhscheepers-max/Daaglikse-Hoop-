/* Toets Die Tuinreis se fase-lopie en die herspeel-validasie.

   Dieselfde aanname as by die oes: dieselfde fase en dieselfde skuiwe gee
   altyd dieselfde punte. As dit ooit nie waar is nie, verwerp die bediener
   eerlike spelers.

   Loop met:  node src/game/vrugtefees/reis.toets.mjs */

import { magRuil, doenSkuif, kloonBord, maakRng } from './enjin.js'
import { VLAKKE, doelVordering } from '../../data/vrugtefeesVlakke.js'
import { beginVlakLopie, reisSkuif, herspeelVlak, OOR_BONUS } from './reis.js'

let geslaag = 0, gedruip = 0
function is(naam, a, b) {
  if (JSON.stringify(a) === JSON.stringify(b)) geslaag++
  else {
    gedruip++
    console.log(`  ✗ ${naam}\n      gekry:   ${JSON.stringify(a)}\n      verwag:  ${JSON.stringify(b)}`)
  }
}
function waar(naam, v) { is(naam, !!v, true) }
function kop(t) { console.log(`\n── ${t} ──`) }

/* 'n Bot wat 'n fase probeer wen en sy skuiwe neerskryf — presies wat die
   skerm doen. Ons gebruik geen ander pad na die enjin nie. */
function speelVlak(nr) {
  const lopie = beginVlakLopie(nr)
  const skuiwe = []
  let wagter = 0
  while (!lopie.klaar && wagter++ < 500) {
    const keuses = []
    for (let r = 0; r < 8; r++)
      for (let k = 0; k < 8; k++)
        for (const [dk, dr] of [[1, 0], [0, 1]]) {
          const a = { k, r }, b = { k: k + dk, r: r + dr }
          if (b.k < 8 && b.r < 8 && magRuil(lopie.bord, a, b)) keuses.push([a, b])
        }
    if (!keuses.length) break
    let beste = keuses[0], besteW = -Infinity
    for (const [a, b] of keuses) {
      const proef = kloonBord(lopie.bord)
      const proefStand = JSON.parse(JSON.stringify(lopie.stand))
      const u = doenSkuif(proef, a, b, { rng: maakRng(999) })
      if (!u.geldig) continue
      proefStand.punte += u.punte
      for (const [i, n] of Object.entries(u.versamel)) proefStand.versamel[i] = (proefStand.versamel[i] || 0) + n
      proefStand.spesiaalGemaak += u.spesiaalGemaak
      proefStand.kombinasies += u.kombinasies
      proefStand.grootsteKetting = Math.max(proefStand.grootsteKetting, u.grootsteKetting)
      proefStand.grootstePas = Math.max(proefStand.grootstePas, u.grootstePas || 0)
      for (const [so, n] of Object.entries(u.spesiaalSoorte || {}))
        proefStand.spesiaalSoorte[so] = (proefStand.spesiaalSoorte[so] || 0) + n
      for (const [k, r] of u.geveeSelle || []) proefStand.verlig[k + ',' + r] = true
      const bonus = lopie.vlak.doel.tipe === 'kombo' ? u.spesiaalGemaak * 300
                  : lopie.vlak.doel.tipe === 'soortspesiaal' ? u.spesiaalGemaak * 200 : 0
      const w = doelVordering(lopie.vlak.doel, proefStand, proef) * 1000 + bonus + u.punte / 1000
      if (w > besteW) { besteW = w; beste = [a, b] }
    }
    const uit = reisSkuif(lopie, beste[0], beste[1])
    if (!uit.geldig) break
    skuiwe.push([beste[0].k, beste[0].r, beste[1].k, beste[1].r])
  }
  return { lopie, skuiwe }
}

/* ── Determinisme ── */
kop('Dieselfde fase gee dieselfde lopie')
for (const nr of [1, 5, 12, 41, 90]) {
  const a = speelVlak(nr), b = speelVlak(nr)
  is(`fase ${nr}: dieselfde skuiwe`, a.skuiwe, b.skuiwe)
  is(`fase ${nr}: dieselfde punte`, a.lopie.stand.punte, b.lopie.stand.punte)
  is(`fase ${nr}: dieselfde uitslag`, a.lopie.gewen, b.lopie.gewen)
}

/* ── Die bediener kom by dieselfde antwoord uit as die speler ──
   Dit is die toets waarvoor die lêer bestaan. */
kop('Herspeel gee presies dieselfde punte as die gespeelde fase')
let gewenTe = 0, nagegaan = 0
for (const v of VLAKKE) {
  const { lopie, skuiwe } = speelVlak(v.nr)
  if (!lopie.gewen) continue
  gewenTe++
  const uit = herspeelVlak(v.nr, skuiwe)
  if (uit.ok && uit.punte === lopie.stand.punte && uit.skuiwe === lopie.skuiweGedoen) { geslaag += 3; nagegaan++ }
  else {
    gedruip++
    console.log(`  ✗ fase ${v.nr}: ${uit.fout || `punte ${uit.punte} teenoor ${lopie.stand.punte}`}`)
  }
}
console.log(`  ${nagegaan} van ${gewenTe} gewende fases klop presies`)
waar(`die bot wen die meeste fases (${gewenTe} van ${VLAKKE.length})`, gewenTe >= 80)
is('elke gewende fase klop', nagegaan, gewenTe)

/* ── Wat die bediener moet weier ── */
kop('Vervalsing')
{
  const { skuiwe } = speelVlak(1)
  waar('die eerlike fase word aanvaar', herspeelVlak(1, skuiwe).ok)

  is('onbekende fase 0', herspeelVlak(0, skuiwe).fout, 'onbekende fase')
  is('onbekende fase 91', herspeelVlak(91, skuiwe).fout, 'onbekende fase')
  is('nie-heelgetal', herspeelVlak(1.5, skuiwe).fout, 'onbekende fase')
  is('geen skuiwe', herspeelVlak(1, []).fout, 'geen skuiwe')
  is('nie-lys', herspeelVlak(1, 'gee my punte').fout, 'geen skuiwe')
  waar('te veel skuiwe word geweier',
       !herspeelVlak(1, new Array(200).fill([0, 0, 1, 0])).ok)
  waar('buite die bord word geweier', !herspeelVlak(1, [[0, 0, 0, 9]]).ok)
  waar('nie-getalle word geweier', !herspeelVlak(1, [[0, 0, 1, 'x']]).ok)

  // 'n Ander fase se skuiwe op hierdie bord
  const ander = speelVlak(5)
  waar('fase 5 se skuiwe word op fase 1 geweier', !herspeelVlak(1, ander.skuiwe).ok)

  // Skuiwe wat NIE die fase klaarmaak nie, is nie 'n voltooiing nie
  const half = skuiwe.slice(0, Math.max(1, skuiwe.length - 1))
  const uitHalf = herspeelVlak(1, half)
  waar('n halwe fase word geweier', !uitHalf.ok)
  is('en dit se hoekom', uitHalf.fout, 'daardie skuiwe maak nie die fase klaar nie')

  // Ekstra skuiwe na die wen
  waar('ekstra skuiwe na die wen word geweier',
       !herspeelVlak(1, [...skuiwe, [0, 0, 1, 0]]).ok)
}

kop('Ongeldige skuiwe kos niks')
{
  const l = beginVlakLopie(3)
  const voor = { punte: l.stand.punte, oor: l.skuiweOor, gedoen: l.skuiweGedoen }
  const uit = reisSkuif(l, { k: 0, r: 0 }, { k: 7, r: 7 })
  is('die skuif is ongeldig', uit.geldig, false)
  is('punte onveranderd', l.stand.punte, voor.punte)
  is('skuiwe oor onveranderd', l.skuiweOor, voor.oor)
  is('skuiwe gedoen onveranderd', l.skuiweGedoen, voor.gedoen)
}

kop('Elke fase begin soos sy data se')
{
  let almal = true
  for (const v of VLAKKE) {
    const l = beginVlakLopie(v.nr)
    if (l.skuiweOor !== v.skuiwe) almal = false
    if (l.stand.punte !== 0 || l.klaar || l.gewen) almal = false
    if (l.bord.selle.length !== 64) almal = false
  }
  waar('al 90 fases begin met hul eie aantal skuiwe, nul punte en nie klaar nie', almal)
  is('n onbekende fase gee niks', beginVlakLopie(999), null)
}

kop('Die oorskuif-bonus')
{
  const { lopie, skuiwe } = speelVlak(1)
  waar('fase 1 word gewen', lopie.gewen)
  const uit = herspeelVlak(1, skuiwe)
  waar('die bonus is in die punte',
       uit.punte >= lopie.skuiweOor * OOR_BONUS)
  is('die bediener se skuiwe-oor klop', uit.skuiweOor, lopie.skuiweOor)
}

console.log('\n' + '─'.repeat(50))
if (gedruip) {
  console.log(`${gedruip} van ${geslaag + gedruip} toetse het gedruip.`)
  process.exit(1)
} else {
  console.log(`Al ${geslaag} toetse slaag.`)
}
