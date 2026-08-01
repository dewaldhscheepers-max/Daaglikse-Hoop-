/* ────────────────────────────────────────────────────────────
   Vrugtefees — Die Tuinreis, fase 1.

   Twintig vlakke. Nie twintig keer dieselfde met groter getalle nie: elke
   paar vlakke bring iets nuuts by, en die vroeë vlakke leer die speler
   sonder om 'n les te wees.

   Elke vlak:
     saad      — dieselfde vlak lyk elke keer dieselfde
     doel      — wat gedoen moet word
     skuiwe    — hoeveel skuiwe die speler het
     soorte    — hoeveel vrugsoorte op die bord (minder = makliker)
     blokke    — versperrings, met hul plek
     wenk      — een kort sin, net waar iets nuuts opduik

   Doel-tipes:
     versamel  { vrugte: { 0: 12, 3: 8 } }
     punte     { waarde: 4000 }
     skoonmaak { tipes: ['droeblaar'] }  — vee al daardie versperrings weg
     spesiaal  { aantal: 3 }             — maak soveel spesiale vrugte
     kombo     { aantal: 2 }             — maak soveel kombinasies
     ketting   { lengte: 4 }             — bereik 'n cascade van dié lengte
   ──────────────────────────────────────────────────────────── */

import { DROE_BLAAR, ONKRUID, DORING, KLIP, KRAT } from '../game/vrugtefees/enjin.js'

/* Die nege hoofstukke van die volle reis. Fase 1 dek die eerste twee. */
export const HOOFSTUKKE = [
  { naam: 'Die Tuin van Liefde',        eienskap: 'Liefde',          vanaf: 1,  tot: 10 },
  { naam: 'Die Pad van Vreugde',        eienskap: 'Vreugde',         vanaf: 11, tot: 20 },
]

const b = (tipe, ...paare) => paare.map(([k, r]) => ({ tipe, k, r }))

export const VLAKKE = [
  /* ── Die Tuin van Liefde ── */
  { nr: 1, saad: 1041, soorte: 4, skuiwe: 20,
    doel: { tipe: 'versamel', vrugte: { 0: 10 } },
    wenk: 'Skuif twee vrugte langs mekaar om drie of meer te pas.' },

  { nr: 2, saad: 1188, soorte: 4, skuiwe: 20,
    doel: { tipe: 'versamel', vrugte: { 0: 12, 1: 12 } } },

  { nr: 3, saad: 1273, soorte: 5, skuiwe: 22,
    doel: { tipe: 'punte', waarde: 3000 },
    wenk: 'Wanneer vrugte val en weer pas, groei jou telling vinniger.' },

  { nr: 4, saad: 1355, soorte: 5, skuiwe: 22,
    doel: { tipe: 'spesiaal', aantal: 2 },
    wenk: 'Pas vier in \'n ry vir \'n Rylig, of vier bo-op mekaar vir \'n Kolomlig.' },

  { nr: 5, saad: 1402, soorte: 5, skuiwe: 16,
    doel: { tipe: 'skoonmaak', tipes: [DROE_BLAAR] },
    blokke: b(DROE_BLAAR, [2, 5], [3, 5], [4, 5], [5, 5], [3, 6], [4, 6]),
    wenk: 'Droë blare verdwyn wanneer jy die vrug bo-op hulle pas.' },

  { nr: 6, saad: 1519, soorte: 5, skuiwe: 18,
    doel: { tipe: 'versamel', vrugte: { 2: 16, 4: 16 } },
    blokke: b(DROE_BLAAR, [0, 7], [1, 7], [6, 7], [7, 7]) },

  { nr: 7, saad: 1630, soorte: 5, skuiwe: 22,
    doel: { tipe: 'skoonmaak', tipes: [ONKRUID] },
    blokke: b(ONKRUID, [1, 4], [6, 4], [1, 6], [6, 6], [3, 7], [4, 7]),
    wenk: 'Onkruid het twee slae nodig.' },

  { nr: 8, saad: 1744, soorte: 5, skuiwe: 14,
    doel: { tipe: 'ketting', lengte: 3 },
    wenk: 'Beplan \'n skuif wat laat val, sodat die volgende passing vanself kom.' },

  { nr: 9, saad: 1866, soorte: 6, skuiwe: 26,
    doel: { tipe: 'versamel', vrugte: { 0: 18, 3: 14, 5: 14 } },
    blokke: [...b(DROE_BLAAR, [3, 3], [4, 3]), ...b(ONKRUID, [3, 4], [4, 4])] },

  { nr: 10, saad: 1970, soorte: 5, skuiwe: 18,
    doel: { tipe: 'skoonmaak', tipes: [KLIP] },
    blokke: b(KLIP, [3, 3], [4, 3], [3, 4], [4, 4]),
    wenk: 'Klippe kan nie geruil word nie. Pas langs hulle om hulle te breek.' },

  /* ── Die Pad van Vreugde ── */
  { nr: 11, saad: 2085, soorte: 6, skuiwe: 24,
    doel: { tipe: 'punte', waarde: 9000 } },

  { nr: 12, saad: 2143, soorte: 6, skuiwe: 22,
    doel: { tipe: 'spesiaal', aantal: 4 } },

  { nr: 13, saad: 2266, soorte: 5, skuiwe: 20,
    doel: { tipe: 'kombo', aantal: 1 },
    wenk: 'Ruil twee spesiale vrugte met mekaar vir \'n groot oes.' },

  { nr: 14, saad: 2371, soorte: 6, skuiwe: 30,
    doel: { tipe: 'skoonmaak', tipes: [DORING] },
    blokke: b(DORING, [2, 3], [5, 3], [3, 1], [4, 1]),
    wenk: 'Dorings vat drie slae. \'n Spesiale vrug help.' },

  { nr: 15, saad: 2480, soorte: 6, skuiwe: 24,
    doel: { tipe: 'versamel', vrugte: { 1: 22, 5: 22 } },
    blokke: b(KLIP, [0, 0], [7, 0], [0, 7], [7, 7]) },

  { nr: 16, saad: 2597, soorte: 6, skuiwe: 22,
    doel: { tipe: 'ketting', lengte: 4 } },

  { nr: 17, saad: 2688, soorte: 6, skuiwe: 26,
    doel: { tipe: 'skoonmaak', tipes: [KRAT] },
    blokke: b(KRAT, [2, 2], [5, 2], [2, 5], [5, 5]),
    wenk: 'Kratte hou \'n vrug vas. Breek hulle oop.' },

  { nr: 18, saad: 2790, soorte: 6, skuiwe: 26,
    doel: { tipe: 'punte', waarde: 8500 },
    blokke: [...b(ONKRUID, [1, 1], [6, 1]), ...b(DORING, [1, 6], [6, 6])] },

  { nr: 19, saad: 2904, soorte: 5, skuiwe: 30,
    doel: { tipe: 'kombo', aantal: 2 } },

  { nr: 20, saad: 3011, soorte: 6, skuiwe: 28,
    doel: { tipe: 'skoonmaak', tipes: [DROE_BLAAR, ONKRUID, DORING, KLIP] },
    blokke: [
      ...b(DROE_BLAAR, [0, 6], [1, 6], [6, 6], [7, 6]),
      ...b(ONKRUID, [2, 4], [5, 4]),
      ...b(DORING, [3, 2], [4, 2]),
      ...b(KLIP, [3, 5], [4, 5]),
    ],
    wenk: 'Die laaste tuin van hierdie pad. Maak alles skoon.' },
]

export function vlakBy(nr) {
  const v = VLAKKE.find(x => x.nr === nr)
  if (!v) return null
  // Die skoonmaak-doelwitte kry hul telling uit die bord self, sodat 'n mens
  // dit nie op twee plekke moet regsit nie.
  if (v.doel.tipe === 'skoonmaak' && !v.doel.telling) v.doel.telling = blokTelling(v)
  return v
}

export function hoofstukVan(nr) {
  return HOOFSTUKKE.find(h => nr >= h.vanaf && nr <= h.tot) || HOOFSTUKKE[0]
}

/* Die versperrings se name, sodat die doelwit kan sê wat om weg te maak
   in plaas van 'maak die tuin skoon'. */
export const BLOK_NAAM = {
  [DROE_BLAAR]: { een: 'droë blaar', meer: 'droë blare' },
  [ONKRUID]:    { een: 'onkruid',    meer: 'onkruid' },
  [DORING]:     { een: 'doring',     meer: 'dorings' },
  [KLIP]:       { een: 'klip',       meer: 'klippe' },
  [KRAT]:       { een: 'krat',       meer: 'kratte' },
}

/* Hoeveel van elke soort staan op die bord aan die begin? */
export function blokTelling(vlak) {
  const uit = {}
  for (const b of vlak.blokke || []) uit[b.tipe] = (uit[b.tipe] || 0) + 1
  return uit
}

/* Wat moet die skerm as die doelwit wys? Een kort sin, in Afrikaans. */
export function doelTeks(doel, vrugNaam) {
  switch (doel.tipe) {
    case 'versamel':
      return Object.entries(doel.vrugte)
        .map(([i, n]) => `${n} ${vrugNaam(Number(i)).toLowerCase()}`)
        .join(' en ')
    case 'punte':     return `${doel.waarde.toLocaleString('af')} punte`
    case 'skoonmaak': {
      /* Dit het net 'maak die tuin skoon' gesê, wat nooit verklap het wát
         of hoeveel. Nou noem dit die ding by die naam. */
      const tel = doel.telling || {}
      const dele = doel.tipes.map(t => {
        const n = tel[t] || 0
        const naam = BLOK_NAAM[t] || { een: t, meer: t }
        return n ? `${n} ${n === 1 ? naam.een : naam.meer}` : naam.meer
      })
      return 'verwyder ' + dele.join(' en ')
    }
    case 'spesiaal':  return `maak ${doel.aantal} spesiale vrugte`
    case 'kombo':     return `${doel.aantal} spesiale kombinasie${doel.aantal > 1 ? 's' : ''}`
    case 'ketting':   return `'n ketting van ${doel.lengte}`
    default:          return ''
  }
}

/* Is die doelwit behaal? Kry die lopie se opgetelde syfers. */
export function doelBehaal(doel, stand, bord) {
  switch (doel.tipe) {
    case 'versamel':
      return Object.entries(doel.vrugte).every(([i, n]) => (stand.versamel[i] || 0) >= n)
    case 'punte':
      return stand.punte >= doel.waarde
    case 'skoonmaak':
      return !bord.selle.some(s => s.blok && doel.tipes.includes(s.blok))
    case 'spesiaal':
      return stand.spesiaalGemaak >= doel.aantal
    case 'kombo':
      return stand.kombinasies >= doel.aantal
    case 'ketting':
      return stand.grootsteKetting >= doel.lengte
    default:
      return false
  }
}

/* Hoe ver is die speler? 0..1, vir die balkie op die skerm. */
export function doelVordering(doel, stand, bord) {
  switch (doel.tipe) {
    case 'versamel': {
      const inskrywings = Object.entries(doel.vrugte)
      const som = inskrywings.reduce((a, [i, n]) => a + Math.min(1, (stand.versamel[i] || 0) / n), 0)
      return som / inskrywings.length
    }
    case 'punte':     return Math.min(1, stand.punte / doel.waarde)
    case 'skoonmaak': {
      const oor = bord.selle.filter(s => s.blok && doel.tipes.includes(s.blok)).length
      const begin = stand.blokkeAanBegin || oor || 1
      return Math.min(1, (begin - oor) / begin)
    }
    case 'spesiaal':  return Math.min(1, stand.spesiaalGemaak / doel.aantal)
    case 'kombo':     return Math.min(1, stand.kombinasies / doel.aantal)
    case 'ketting':   return Math.min(1, stand.grootsteKetting / doel.lengte)
    default:          return 0
  }
}
