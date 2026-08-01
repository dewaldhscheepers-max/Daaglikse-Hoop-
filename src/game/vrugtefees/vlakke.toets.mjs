/* Keur elke vlak van Die Tuinreis.

   'n Vlak wat nie gehaal kan word nie, hoort nie in die spel nie. Hierdie
   toets laat 'n bot elke vlak baie keer speel en rapporteer hoe dikwels dit
   klaarkom.

   Die bot is doelbewus GEWOON: hy kyk een skuif vooruit en kies die skuif
   wat die doelwit die meeste vorentoe stoot. Dit is omtrent 'n gemiddelde
   speler. As die bot 'n vlak nie kan klaarmaak nie, kan 'n mens dit ook nie.

   Loop met:  node src/game/vrugtefees/vlakke.toets.mjs */

import {
  maakBord, maakRng, kloonBord, magRuil, doenSkuif, versekerSkuif,
} from './enjin.js'
import { VLAKKE, doelBehaal, doelVordering } from '../../data/vrugtefeesVlakke.js'

function alleSkuiwe(bord) {
  const uit = []
  for (let r = 0; r < bord.rye; r++)
    for (let k = 0; k < bord.kolomme; k++)
      for (const [dk, dr] of [[1, 0], [0, 1]]) {
        const a = { k, r }, b = { k: k + dk, r: r + dr }
        if (b.k < bord.kolomme && b.r < bord.rye && magRuil(bord, a, b)) uit.push({ a, b })
      }
  return uit
}

function leeStand(bord, vlak) {
  return {
    punte: 0, versamel: {}, spesiaalGemaak: 0, kombinasies: 0, grootsteKetting: 0,
    blokkeAanBegin: bord.selle.filter(s => s.blok).length,
  }
}

function voegBy(stand, uit) {
  stand.punte += uit.punte
  for (const [i, n] of Object.entries(uit.versamel)) stand.versamel[i] = (stand.versamel[i] || 0) + n
  stand.spesiaalGemaak += uit.spesiaalGemaak
  stand.kombinasies += uit.kombinasies
  stand.grootsteKetting = Math.max(stand.grootsteKetting, uit.grootsteKetting)
}

/* Speel een lopie. `slordig` is hoe dikwels die bot 'n lukrake skuif kies
   in plaas van die beste — so boots ons 'n swakker speler na. */
function speelVlak(vlak, saadBykomend, slordig = 0) {
  const bord = maakBord({
    saad: vlak.saad + saadBykomend,
    soorte: vlak.soorte,
    blokke: vlak.blokke || null,
  })
  const rng = maakRng(vlak.saad * 31 + saadBykomend * 7 + 5)
  const stand = leeStand(bord, vlak)
  let skommels = 0

  for (let skuif = 0; skuif < vlak.skuiwe; skuif++) {
    if (doelBehaal(vlak.doel, stand, bord)) {
      return { gewen: true, skuiweGebruik: skuif, stand, skommels }
    }
    const keuses = alleSkuiwe(bord)
    if (!keuses.length) {
      const sk = versekerSkuif(bord, vlak.saad + skuif)
      if (sk) skommels++
      if (!alleSkuiwe(bord).length) break
      continue
    }

    let beste = null
    if (rng() < slordig) {
      beste = keuses[Math.floor(rng() * keuses.length)]
    } else {
      let besteWaarde = -Infinity
      for (const kandidaat of keuses) {
        const proef = kloonBord(bord)
        const proefStand = JSON.parse(JSON.stringify(stand))
        const uit = doenSkuif(proef, kandidaat.a, kandidaat.b, { rng: maakRng(999) })
        if (!uit.geldig) continue
        voegBy(proefStand, uit)
        /* By 'n kombo-doelwit gee vordering alleen die bot geen rede om
           spesiale vrugte te MAAK nie — en 'n mens doen dit doelbewus. Ons
           gee dus 'n bonus vir spesiale vrugte, sodat die bot ongeveer soos
           'n speler dink wat 'n kombinasie beplan. */
        const spesiaalBonus = vlak.doel.tipe === 'kombo' ? uit.spesiaalGemaak * 300 : 0
        const waarde = doelVordering(vlak.doel, proefStand, proef) * 1000 + spesiaalBonus + uit.punte / 1000
        if (waarde > besteWaarde) { besteWaarde = waarde; beste = kandidaat }
      }
    }
    if (!beste) break

    const uit = doenSkuif(bord, beste.a, beste.b, { rng })
    if (!uit.geldig) break
    voegBy(stand, uit)
    const sk = versekerSkuif(bord, vlak.saad + skuif * 13)
    if (sk) skommels++
  }

  return {
    gewen: doelBehaal(vlak.doel, stand, bord),
    skuiweGebruik: vlak.skuiwe, stand, skommels,
  }
}

const N = 60
console.log(`Elke vlak ${N} keer gespeel deur 'n gemiddelde bot, en ${N} keer deur 'n slordige een.\n`)
console.log('vlak  doelwit'.padEnd(34) + 'gemiddeld'.padStart(11) + 'slordig'.padStart(10) + '  skuiwe gebruik')
console.log('─'.repeat(74))

let probleme = []
for (const vlak of VLAKKE) {
  let winsG = 0, winsS = 0, skuiweSom = 0, skommelSom = 0
  for (let i = 0; i < N; i++) {
    const g = speelVlak(vlak, i, 0)
    if (g.gewen) { winsG++; skuiweSom += g.skuiweGebruik }
    skommelSom += g.skommels
    if (speelVlak(vlak, i, 0.35).gewen) winsS++
  }
  const kG = Math.round(winsG / N * 100)
  const kS = Math.round(winsS / N * 100)
  const gemSkuiwe = winsG ? (skuiweSom / winsG).toFixed(0) : '—'
  const naam = `${String(vlak.nr).padStart(2)}.   ${vlak.doel.tipe}`
  console.log(naam.padEnd(34) + `${kG}%`.padStart(11) + `${kS}%`.padStart(10) +
              `   ${gemSkuiwe} van ${vlak.skuiwe}`)

  if (kG < 70) probleme.push(`vlak ${vlak.nr}: te moeilik — 'n gemiddelde speler wen dit net ${kG}% van die tyd`)
  /* Die eerste tien vlakke MAG maklik wees — hulle leer die speler, en 'n
     mens jaag nie iemand weg by vlak drie nie. Van vlak elf af moet
     slordige spel wel kan misluk. */
  if (vlak.nr > 10 && kG === 100 && kS === 100) probleme.push(`vlak ${vlak.nr}: te maklik — selfs slordige spel wen altyd`)
}

console.log()
if (probleme.length) {
  console.log('Vlakke wat aandag verg:')
  probleme.forEach(p => console.log('  · ' + p))
  process.exit(1)
} else {
  console.log('Elke vlak is haalbaar en nie een is triviaal nie.')
}
