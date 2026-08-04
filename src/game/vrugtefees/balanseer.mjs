/* Balanseer die vlakke.

   Ek het die teikens vir vlakke 21 tot 90 met die hand geraai, en die
   keurder het gewys dat baie van hulle onhaalbaar is — party op 0%.
   Raai weer sou dieselfde fout wees.

   Hierdie skrif meet elke vlak, stel die getalle, en meet weer, totdat die
   vlak binne sy venster val. Dit skryf niks self nie: dit druk 'n tabel wat
   ek dan toepas, sodat die vlakke-lêer leesbaar bly.

   Loop met:  node src/game/vrugtefees/balanseer.mjs */

import { maakBord, maakRng, kloonBord, magRuil, doenSkuif, versekerSkuif } from './enjin.js'
import { VLAKKE, doelBehaal, doelVordering } from '../../data/vrugtefeesVlakke.js'

const N = 26          // lopies per meting; genoeg om die vorm te sien
const RONDES = 12

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

function leeStand(bord) {
  return {
    punte: 0, versamel: {}, spesiaalGemaak: 0, kombinasies: 0, grootsteKetting: 0,
    grootstePas: 0, spesiaalSoorte: {}, verlig: {}, kettings: [],
    blokkeAanBegin: bord.selle.filter(s => s.blok).length,
  }
}

function voegBy(stand, uit) {
  stand.punte += uit.punte
  for (const [i, n] of Object.entries(uit.versamel)) stand.versamel[i] = (stand.versamel[i] || 0) + n
  stand.spesiaalGemaak += uit.spesiaalGemaak
  stand.kombinasies += uit.kombinasies
  stand.grootsteKetting = Math.max(stand.grootsteKetting, uit.grootsteKetting)
  if (uit.grootsteKetting >= 2) stand.kettings.push(uit.grootsteKetting)
  stand.grootstePas = Math.max(stand.grootstePas, uit.grootstePas || 0)
  for (const [s, n] of Object.entries(uit.spesiaalSoorte || {}))
    stand.spesiaalSoorte[s] = (stand.spesiaalSoorte[s] || 0) + n
  for (const [k, r] of uit.geveeSelle || []) stand.verlig[k + ',' + r] = true
}

function speel(vlak, ent, slordig) {
  const bord = maakBord({ saad: vlak.saad + ent, soorte: vlak.soorte, blokke: vlak.blokke || null })
  const rng = maakRng(vlak.saad * 31 + ent * 7 + 5)
  const stand = leeStand(bord)
  for (let skuif = 0; skuif < vlak.skuiwe; skuif++) {
    if (doelBehaal(vlak.doel, stand, bord)) return true
    const keuses = alleSkuiwe(bord)
    if (!keuses.length) { versekerSkuif(bord, vlak.saad + skuif); if (!alleSkuiwe(bord).length) break; continue }
    let beste = null
    if (rng() < slordig) beste = keuses[Math.floor(rng() * keuses.length)]
    else {
      let besteWaarde = -Infinity
      for (const kan of keuses) {
        const proef = kloonBord(bord)
        const ps = JSON.parse(JSON.stringify(stand))
        const uit = doenSkuif(proef, kan.a, kan.b, { rng: maakRng(999) })
        if (!uit.geldig) continue
        voegBy(ps, uit)
        const bonus =
          vlak.doel.tipe === 'kombo' ? uit.spesiaalGemaak * 300 :
          vlak.doel.tipe === 'soortspesiaal' ? uit.spesiaalGemaak * 200 : 0
        const w = doelVordering(vlak.doel, ps, proef) * 1000 + bonus + uit.punte / 1000
        if (w > besteWaarde) { besteWaarde = w; beste = kan }
      }
    }
    if (!beste) break
    const uit = doenSkuif(bord, beste.a, beste.b, { rng })
    if (!uit.geldig) break
    voegBy(stand, uit)
    versekerSkuif(bord, vlak.saad + skuif * 13)
  }
  return doelBehaal(vlak.doel, stand, bord)
}

function meet(vlak) {
  let wins = 0
  for (let i = 0; i < N; i++) if (speel(vlak, i, 0)) wins++
  return Math.round(wins / N * 100)
}

/* Maak 'n vlak makliker. Ons verlaag eers die teiken, want meer skuiwe maak
   'n vlak lank eerder as lekker. */
function verlig(v) {
  const d = v.doel
  switch (d.tipe) {
    case 'punte':
      d.waarde = Math.round(d.waarde * 0.8 / 500) * 500; return true
    case 'versamel': {
      let iets = false
      for (const k of Object.keys(d.vrugte)) {
        const nuut = Math.max(8, Math.round(d.vrugte[k] * 0.85))
        if (nuut < d.vrugte[k]) { d.vrugte[k] = nuut; iets = true }
      }
      if (iets) return true
      break
    }
    case 'ketting':
      if (d.lengte > 3) { d.lengte -= 1; return true }
      break
    case 'grootpas':
      if (d.grootte > 5) { d.grootte -= 1; return true }
      break
    case 'kombo':
    case 'spesiaal':
    case 'soortspesiaal':
      if (d.aantal > 1) { d.aantal -= 1; return true }
      break
    case 'verlig':
      if (d.selle.length > 4) { d.selle = d.selle.slice(0, d.selle.length - 2); return true }
      break
    case 'skoonmaak':
      if (v.blokke && v.blokke.length > 2) {
        // gooi die versperring weg wat die naaste aan die rand sit
        let ergste = 0, ergsteI = 0
        v.blokke.forEach((bl, i) => {
          const rand = Math.min(bl.k, 7 - bl.k) + Math.min(bl.r, 7 - bl.r)
          if (rand <= ergste || i === 0) { ergste = rand; ergsteI = i }
        })
        v.blokke.splice(ergsteI, 1)
        v.doel.telling = null
        return true
      }
      break
  }
  if (v.skuiwe < 46) { v.skuiwe += 4; return true }
  return false
}

const uit = []
for (const vlak of VLAKKE) {
  const drempel = vlak.nr <= 10 ? 95 : 72
  const oorspronklik = JSON.stringify({ skuiwe: vlak.skuiwe, doel: vlak.doel, blokke: (vlak.blokke || []).length })
  let k = meet(vlak)
  let rondes = 0
  while (k < drempel && rondes < RONDES) {
    if (!verlig(vlak)) break
    if (vlak.doel.tipe === 'skoonmaak') vlak.doel.telling = null
    k = meet(vlak)
    rondes++
  }
  const nuut = { skuiwe: vlak.skuiwe, doel: vlak.doel, blokke: (vlak.blokke || []).length }
  const verander = JSON.stringify(nuut) !== oorspronklik
  uit.push({ nr: vlak.nr, k, rondes, verander, skuiwe: vlak.skuiwe, doel: vlak.doel,
             blokke: vlak.blokke ? vlak.blokke.map(x => [x.tipe, x.k, x.r]) : null })
  console.error(`vlak ${String(vlak.nr).padStart(2)}: ${k}%  ${rondes ? `(${rondes} stellings)` : ''}`)
}

console.log(JSON.stringify(uit, null, 1))
