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

import {
  DROE_BLAAR, ONKRUID, DORING, KLIP, KRAT,
  RYLIG, KOLOMLIG, OESKRAG, REENBOOGVRUG,
} from '../game/vrugtefees/enjin.js'

/* Die nege hoofstukke van die volle reis. Fase 1 dek die eerste twee. */
export const HOOFSTUKKE = [
  { naam: 'Die Tuin van Liefde',         eienskap: 'Liefde',          vanaf: 1,  tot: 10 },
  { naam: 'Die Pad van Vreugde',         eienskap: 'Vreugde',         vanaf: 11, tot: 20 },
  { naam: 'Die Vallei van Vrede',        eienskap: 'Vrede',           vanaf: 21, tot: 30 },
  { naam: 'Die Land van Geduld',         eienskap: 'Geduld',          vanaf: 31, tot: 40 },
  { naam: 'Die Boord van Vriendelikheid', eienskap: 'Vriendelikheid', vanaf: 41, tot: 50 },
  { naam: 'Die Oes van Goedheid',        eienskap: 'Goedheid',        vanaf: 51, tot: 60 },
  { naam: 'Die Wingerd van Getrouheid',  eienskap: 'Getrouheid',      vanaf: 61, tot: 70 },
  { naam: 'Die Tuin van Sagmoedigheid',  eienskap: 'Sagmoedigheid',   vanaf: 71, tot: 80 },
  { naam: 'Die Berg van Selfbeheersing', eienskap: 'Selfbeheersing',  vanaf: 81, tot: 90 },
]

/* Een kort woord van bemoediging aan die einde van elke hoofstuk. Nie 'n
   les nie — een sin, en dan speel 'n mens verder. */
export const HOOFSTUK_WOORD = [
  'Goeie vrug groei nie altyd vinnig nie, maar dit groei wanneer dit versorg word.',
  'Vreugde is nie die afwesigheid van moeite nie. Dit is iets wat bly wanneer die moeite kom.',
  'Vrede is nie ’n stil tuin nie. Dit is om rustig te bly terwyl dinge roer.',
  'Geduld beteken nie dat niks gebeur nie. Soms groei die belangrikste dinge stil.',
  'Vriendelikheid kan klein lyk en tog iemand se hele dag verander.',
  'Goedheid is nie wat ’n mens sê nie, maar wat oorbly wanneer die woorde weg is.',
  'Getrouheid is om môre weer te doen wat jy vandag gedoen het.',
  'Sagmoedigheid is krag wat geleer het om stil te wees.',
  'Selfbeheersing is nie om minder lewe te hê nie. Dit is om nie deur elke impuls beheer te word nie.',
]

const b = (tipe, ...paare) => paare.map(([k, r]) => ({ tipe, k, r }))

export const VLAKKE = [
  /* ── Die Tuin van Liefde (1–10) ──
     Hier leer 'n mens die spel. Hierdie vlakke moet vriendelik wees; 'n mens
     jaag nie iemand weg by vlak drie nie. */

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

  { nr: 7, saad: 1630, soorte: 5, skuiwe: 26,
    doel: { tipe: 'skoonmaak', tipes: [ONKRUID] },
    blokke: b(ONKRUID, [2, 3], [5, 3], [3, 5], [4, 5]),
    wenk: 'Onkruid het twee slae nodig. Pas twee keer op dieselfde plek.' },

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

  /* ── Die Pad van Vreugde (11–20) ──
     Spesiale vrugte en kombinasies kom by. */

  { nr: 11, saad: 2085, soorte: 5, skuiwe: 18,
    doel: { tipe: 'punte', waarde: 10500 } },

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

  { nr: 18, saad: 2790, soorte: 6, skuiwe: 30,
    doel: { tipe: 'punte', waarde: 7500 },
    blokke: [...b(ONKRUID, [1, 1], [6, 1]), ...b(DORING, [1, 6], [6, 6])] },

  { nr: 19, saad: 2904, soorte: 5, skuiwe: 30,
    doel: { tipe: 'kombo', aantal: 2 } },

  { nr: 20, saad: 3011, soorte: 5, skuiwe: 26,
    doel: { tipe: 'skoonmaak', tipes: [DROE_BLAAR, ONKRUID, DORING, KLIP] },
    blokke: [...b(DROE_BLAAR, [0, 6], [1, 6], [6, 6], [7, 6]), ...b(ONKRUID, [2, 4], [5, 4]), ...b(DORING, [3, 2], [4, 2]), ...b(KLIP, [3, 5], [4, 5])],
    wenk: 'Die laaste tuin van hierdie pad. Maak alles skoon.' },

  /* ── Die Vallei van Vrede (21–30) ──
     Klippe en kratte. Die bord word voller; hier leer 'n mens om plek te maak
     eerder as om te jaag. */

  { nr: 21, saad: 3120, soorte: 6, skuiwe: 26,
    doel: { tipe: 'versamel', vrugte: { 2: 26, 5: 24 } } },

  { nr: 22, saad: 3231, soorte: 6, skuiwe: 26,
    doel: { tipe: 'skoonmaak', tipes: [KLIP] },
    blokke: b(KLIP, [0, 3], [7, 3], [0, 4], [7, 4]) },

  { nr: 23, saad: 3344, soorte: 6, skuiwe: 24,
    doel: { tipe: 'grootpas', grootte: 5 },
    wenk: 'Vyf in een figuur. Kyk waar twee rye mekaar kan raak.' },

  { nr: 24, saad: 3452, soorte: 6, skuiwe: 30,
    doel: { tipe: 'punte', waarde: 10000 },
    blokke: b(DROE_BLAAR, [3, 3], [4, 3], [3, 4], [4, 4]) },

  { nr: 25, saad: 3561, soorte: 6, skuiwe: 28,
    doel: { tipe: 'skoonmaak', tipes: [KRAT, ONKRUID] },
    blokke: [...b(KRAT, [2, 2], [5, 2]), ...b(ONKRUID, [2, 5], [5, 5])] },

  { nr: 26, saad: 3670, soorte: 5, skuiwe: 28,
    doel: { tipe: 'soortspesiaal', soort: OESKRAG, aantal: 2 },
    wenk: 'n L- of T-vorm gee ’n Oeskrag.' },

  { nr: 27, saad: 3782, soorte: 6, skuiwe: 26,
    doel: { tipe: 'versamel', vrugte: { 0: 26, 3: 22, 5: 20 } } },

  { nr: 28, saad: 3891, soorte: 6, skuiwe: 28,
    doel: { tipe: 'skoonmaak', tipes: [DORING] },
    blokke: b(DORING, [2, 2], [5, 2], [2, 5]) },

  { nr: 29, saad: 3903, soorte: 6, skuiwe: 24,
    doel: { tipe: 'ketting', lengte: 4 } },

  { nr: 30, saad: 4015, soorte: 5, skuiwe: 36,
    doel: { tipe: 'skoonmaak', tipes: [KLIP, KRAT, DROE_BLAAR] },
    blokke: [...b(KLIP, [3, 3], [4, 4]), ...b(KRAT, [4, 3], [3, 4]), ...b(DROE_BLAAR, [0, 7])] },

  /* ── Die Land van Geduld (31–40) ──
     Langer doelwitte. Niks hier word vinnig gedoen nie. */

  { nr: 31, saad: 4126, soorte: 6, skuiwe: 28,
    doel: { tipe: 'punte', waarde: 12000 } },

  { nr: 32, saad: 4237, soorte: 5, skuiwe: 34,
    doel: { tipe: 'skoonmaak', tipes: [DORING] },
    blokke: b(DORING, [1, 2], [6, 2], [3, 4], [4, 4]) },

  { nr: 33, saad: 4348, soorte: 6, skuiwe: 26,
    doel: { tipe: 'versamel', vrugte: { 1: 30, 4: 26 } } },

  { nr: 34, saad: 4459, soorte: 5, skuiwe: 30,
    doel: { tipe: 'soortspesiaal', soort: REENBOOGVRUG, aantal: 1 },
    wenk: 'Vyf in ’n reguit streep gee ’n Reënboogvrug.' },

  { nr: 35, saad: 4561, soorte: 6, skuiwe: 30,
    doel: { tipe: 'skoonmaak', tipes: [ONKRUID, DORING] },
    blokke: [...b(ONKRUID, [0, 4]), ...b(DORING, [3, 2], [4, 2])] },

  { nr: 36, saad: 4672, soorte: 6, skuiwe: 26,
    doel: { tipe: 'kombo', aantal: 1 } },

  { nr: 37, saad: 4783, soorte: 7, skuiwe: 30,
    doel: { tipe: 'versamel', vrugte: { 0: 15, 2: 15, 6: 12 } } },

  { nr: 38, saad: 4894, soorte: 6, skuiwe: 28,
    doel: { tipe: 'grootpas', grootte: 5 } },

  { nr: 39, saad: 4906, soorte: 6, skuiwe: 28,
    doel: { tipe: 'punte', waarde: 8500 },
    blokke: b(KRAT, [3, 3], [4, 3], [3, 4], [4, 4]) },

  { nr: 40, saad: 5017, soorte: 6, skuiwe: 32,
    doel: { tipe: 'skoonmaak', tipes: [DORING, KLIP] },
    blokke: [...b(DORING, [2, 3], [5, 3], [2, 4], [5, 4]), ...b(KLIP, [0, 0], [7, 0])] },

  /* ── Die Boord van Vriendelikheid (41–50) ──
     Hier kom die lig. Jy moet op spesifieke plekke pas — nie net vinnig wees
     nie, maar op die regte plek wees. */

  { nr: 41, saad: 5128, soorte: 6, skuiwe: 24,
    doel: { tipe: 'verlig', selle: [[3, 3], [4, 3], [3, 4], [4, 4]] },
    wenk: 'Pas op die gemerkte plekke om die tuin te verlig.' },

  { nr: 42, saad: 5239, soorte: 6, skuiwe: 42,
    doel: { tipe: 'verlig', selle: [[0, 0], [7, 0], [0, 7], [7, 7]] } },

  { nr: 43, saad: 5341, soorte: 6, skuiwe: 42,
    doel: { tipe: 'versamel', vrugte: { 3: 26, 4: 22 } } },

  { nr: 44, saad: 5452, soorte: 6, skuiwe: 28,
    doel: { tipe: 'verlig', selle: [[1, 1], [2, 1], [5, 1], [6, 1], [1, 6], [2, 6], [5, 6], [6, 6]] },
    blokke: b(DROE_BLAAR, [3, 3], [4, 3], [3, 4], [4, 4]) },

  { nr: 45, saad: 5563, soorte: 6, skuiwe: 26,
    doel: { tipe: 'soortspesiaal', soort: RYLIG, aantal: 3 } },

  { nr: 46, saad: 5674, soorte: 7, skuiwe: 30,
    doel: { tipe: 'punte', waarde: 6000 } },

  { nr: 47, saad: 5786, soorte: 6, skuiwe: 30,
    doel: { tipe: 'verlig', selle: [[0, 3], [1, 3], [2, 3], [5, 3], [6, 3], [7, 3]] },
    blokke: b(ONKRUID, [3, 3], [4, 3]) },

  { nr: 48, saad: 5897, soorte: 6, skuiwe: 28,
    doel: { tipe: 'ketting', lengte: 4 } },

  { nr: 49, saad: 5908, soorte: 6, skuiwe: 30,
    doel: { tipe: 'skoonmaak', tipes: [KRAT] },
    blokke: b(KRAT, [1, 1], [6, 1], [1, 6], [6, 6], [3, 4], [4, 4]) },

  { nr: 50, saad: 6019, soorte: 6, skuiwe: 32,
    doel: { tipe: 'verlig', selle: [[2, 2], [3, 2], [4, 2], [5, 2], [2, 5], [3, 5], [4, 5], [5, 5]] },
    blokke: b(DORING, [0, 4], [7, 4]) },

  /* ── Die Oes van Goedheid (51–60) ──
     Groot oeste. Hier tel dit wat jy bymekaar bring. */

  { nr: 51, saad: 6120, soorte: 7, skuiwe: 30,
    doel: { tipe: 'versamel', vrugte: { 0: 22, 1: 22 } } },

  { nr: 52, saad: 6231, soorte: 6, skuiwe: 28,
    doel: { tipe: 'grootpas', grootte: 5 } },

  { nr: 53, saad: 6342, soorte: 7, skuiwe: 32,
    doel: { tipe: 'versamel', vrugte: { 2: 19, 4: 19, 6: 16 } } },

  { nr: 54, saad: 6453, soorte: 6, skuiwe: 30,
    doel: { tipe: 'punte', waarde: 11500 },
    blokke: b(ONKRUID, [2, 2], [5, 2], [2, 5], [5, 5]) },

  { nr: 55, saad: 6564, soorte: 6, skuiwe: 28,
    doel: { tipe: 'soortspesiaal', soort: KOLOMLIG, aantal: 3 } },

  { nr: 56, saad: 6675, soorte: 6, skuiwe: 36,
    doel: { tipe: 'skoonmaak', tipes: [DORING, ONKRUID] },
    blokke: b(DORING, [3, 2], [4, 2], [3, 5]) },

  { nr: 57, saad: 6786, soorte: 6, skuiwe: 30,
    doel: { tipe: 'verlig', selle: [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7]] } },

  { nr: 58, saad: 6897, soorte: 7, skuiwe: 42,
    doel: { tipe: 'kombo', aantal: 1 } },

  { nr: 59, saad: 6908, soorte: 7, skuiwe: 46,
    doel: { tipe: 'versamel', vrugte: { 1: 26, 3: 24, 5: 20 } } },

  { nr: 60, saad: 7019, soorte: 7, skuiwe: 34,
    doel: { tipe: 'punte', waarde: 7000 },
    blokke: [...b(KLIP, [3, 3], [4, 4]), ...b(KRAT, [4, 3], [3, 4])] },

  /* ── Die Wingerd van Getrouheid (61–70) ──
     Spesiale vrugte en kombinasies. Hier betaal dit om te beplan. */

  { nr: 61, saad: 7130, soorte: 5, skuiwe: 34,
    doel: { tipe: 'soortspesiaal', soort: OESKRAG, aantal: 2 } },

  { nr: 62, saad: 7241, soorte: 6, skuiwe: 30,
    doel: { tipe: 'kombo', aantal: 1 } },

  { nr: 63, saad: 7352, soorte: 7, skuiwe: 32,
    doel: { tipe: 'versamel', vrugte: { 0: 23, 4: 20 } } },

  { nr: 64, saad: 7463, soorte: 5, skuiwe: 32,
    doel: { tipe: 'soortspesiaal', soort: REENBOOGVRUG, aantal: 1 } },

  { nr: 65, saad: 7574, soorte: 7, skuiwe: 32,
    doel: { tipe: 'skoonmaak', tipes: [KRAT, KLIP] },
    blokke: [...b(KRAT, [2, 2], [5, 2], [2, 5], [5, 5]), ...b(KLIP, [3, 3], [4, 4])] },

  { nr: 66, saad: 7685, soorte: 6, skuiwe: 30,
    doel: { tipe: 'ketting', lengte: 4 } },

  { nr: 67, saad: 7796, soorte: 7, skuiwe: 34,
    doel: { tipe: 'punte', waarde: 7000 } },

  { nr: 68, saad: 7807, soorte: 6, skuiwe: 32,
    doel: { tipe: 'grootpas', grootte: 5 } },

  { nr: 69, saad: 7918, soorte: 7, skuiwe: 34,
    doel: { tipe: 'verlig', selle: [[1, 0], [3, 0], [5, 0], [1, 7]] } },

  { nr: 70, saad: 8029, soorte: 7, skuiwe: 36,
    doel: { tipe: 'skoonmaak', tipes: [DORING, ONKRUID, DROE_BLAAR] },
    blokke: [...b(DORING, [3, 3], [4, 4]), ...b(ONKRUID, [4, 3], [3, 4]), ...b(DROE_BLAAR, [0, 0])] },

  /* ── Die Tuin van Sagmoedigheid (71–80) ──
     Alles kom saam, maar met genoeg ruimte om te dink. */

  { nr: 71, saad: 8130, soorte: 7, skuiwe: 32,
    doel: { tipe: 'versamel', vrugte: { 2: 19, 5: 19 } } },

  { nr: 72, saad: 8241, soorte: 7, skuiwe: 34,
    doel: { tipe: 'punte', waarde: 7000 },
    blokke: b(ONKRUID, [0, 2], [7, 2], [0, 5], [7, 5]) },

  { nr: 73, saad: 8352, soorte: 6, skuiwe: 30,
    doel: { tipe: 'soortspesiaal', soort: RYLIG, aantal: 4 } },

  { nr: 74, saad: 8463, soorte: 7, skuiwe: 36,
    doel: { tipe: 'verlig', selle: [[2, 1], [3, 1], [4, 1], [5, 1], [2, 6], [3, 6], [4, 6], [5, 6], [3, 3], [4, 4]] } },

  { nr: 75, saad: 8574, soorte: 7, skuiwe: 34,
    doel: { tipe: 'skoonmaak', tipes: [DORING] },
    blokke: b(DORING, [3, 2], [4, 2]) },

  { nr: 76, saad: 8685, soorte: 7, skuiwe: 48,
    doel: { tipe: 'kombo', aantal: 1 } },

  { nr: 77, saad: 8796, soorte: 7, skuiwe: 36,
    doel: { tipe: 'versamel', vrugte: { 0: 22, 3: 20, 6: 19 } } },

  { nr: 78, saad: 8807, soorte: 6, skuiwe: 32,
    doel: { tipe: 'ketting', lengte: 4 } },

  { nr: 79, saad: 8918, soorte: 7, skuiwe: 34,
    doel: { tipe: 'grootpas', grootte: 5 } },

  { nr: 80, saad: 9029, soorte: 7, skuiwe: 38,
    doel: { tipe: 'skoonmaak', tipes: [KLIP, KRAT, ONKRUID, DORING] },
    blokke: [...b(KLIP, [0, 0]), ...b(ONKRUID, [3, 3], [4, 4]), ...b(DORING, [4, 3], [3, 4])] },

  /* ── Die Berg van Selfbeheersing (81–90) ──
     Die laaste klim. Elke skuif tel. */

  { nr: 81, saad: 9130, soorte: 7, skuiwe: 34,
    doel: { tipe: 'punte', waarde: 5500 } },

  { nr: 82, saad: 9241, soorte: 6, skuiwe: 40,
    doel: { tipe: 'skoonmaak', tipes: [DORING, KLIP] },
    blokke: b(DORING, [1, 3], [6, 3]) },

  { nr: 83, saad: 9352, soorte: 5, skuiwe: 36,
    doel: { tipe: 'soortspesiaal', soort: OESKRAG, aantal: 2 } },

  { nr: 84, saad: 9463, soorte: 8, skuiwe: 38,
    doel: { tipe: 'versamel', vrugte: { 1: 14, 4: 14, 7: 12 } } },

  { nr: 85, saad: 9574, soorte: 6, skuiwe: 40,
    doel: { tipe: 'verlig', selle: [[1, 1], [6, 1], [1, 6], [6, 6]] } },

  { nr: 86, saad: 9685, soorte: 5, skuiwe: 40,
    doel: { tipe: 'kombo', aantal: 2 } },

  { nr: 87, saad: 9796, soorte: 8, skuiwe: 38,
    doel: { tipe: 'punte', waarde: 6000 },
    blokke: b(ONKRUID, [2, 2], [5, 2], [2, 5], [5, 5]) },

  { nr: 88, saad: 9807, soorte: 7, skuiwe: 36,
    doel: { tipe: 'grootpas', grootte: 5 } },

  { nr: 89, saad: 9918, soorte: 5, skuiwe: 38,
    doel: { tipe: 'soortspesiaal', soort: REENBOOGVRUG, aantal: 2 } },

  { nr: 90, saad: 10029, soorte: 7, skuiwe: 40,
    doel: { tipe: 'skoonmaak', tipes: [DROE_BLAAR, ONKRUID, DORING, KLIP, KRAT] },
    blokke: [...b(ONKRUID, [2, 3], [5, 3]), ...b(DORING, [2, 4]), ...b(KRAT, [3, 3], [4, 4])],
    wenk: 'Die laaste tuin. Alles wat jy geleer het, op een bord.' },
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
    case 'verlig':    return `verlig ${doel.selle.length} plekke in die tuin`
    case 'grootpas':  return `maak 'n passing van ${doel.grootte}`
    case 'soortspesiaal': {
      const naam = { rylig: 'Rylig', kolomlig: 'Kolomlig', oeskrag: 'Oeskrag',
                     reenboog: 'Reënboogvrug', feesmandjie: 'Feesmandjie' }[doel.soort] || doel.soort
      return `maak ${doel.aantal} ${naam}${doel.aantal > 1 ? 'e' : ''}`
    }
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
    case 'verlig':
      return doel.selle.every(([k, r]) => stand.verlig && stand.verlig[k + ',' + r])
    case 'grootpas':
      return stand.grootstePas >= doel.grootte
    case 'soortspesiaal':
      return (stand.spesiaalSoorte[doel.soort] || 0) >= doel.aantal
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
    case 'verlig': {
      const aan = doel.selle.filter(([k, r]) => stand.verlig && stand.verlig[k + ',' + r]).length
      return aan / doel.selle.length
    }
    case 'grootpas':  return Math.min(1, stand.grootstePas / doel.grootte)
    case 'soortspesiaal':
      return Math.min(1, (stand.spesiaalSoorte[doel.soort] || 0) / doel.aantal)
    default:          return 0
  }
}
