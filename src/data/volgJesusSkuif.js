/* ── "VOLG JESUS het geskuif" ──
 *
 * Op 10 September 2026 het die VOLG JESUS-kaart van Luister Nou af weggegaan.
 * Dewald: *"I want to remove it from the Luister Now page. It should only be
 * on the e-books page."* Luister Nou is stemboodskappe; E-boeke is boeke en
 * langer programme.
 *
 * Die probleem is nie die skuif nie — dit is die mens wat GISTER by Dag 3 was.
 * Sy maak die app oop, die knoppie is weg, en niks sê hoekom nie. Sy dink haar
 * vordering is weg en sy kom nie terug nie. Ons het geen kanaal na daardie
 * foon nie; die enigste oomblik waarop ons iets kan sê, is wanneer sy oopmaak.
 *
 * Vandaar hierdie een boodskap. Die reëls:
 *
 *   · NET vir wie reeds begin het. 'n Mens wat nooit VOLG JESUS gedoen het
 *     nie, moet nooit hoor dat iets geskuif het waarvan hy nie weet nie.
 *   · EEN keer. 'n Opspringer wat elke dag terugkom, is 'n straf.
 *   · NOOIT bo-op iets anders nie — nie terwyl klank speel, nie terwyl 'n
 *     ander skerm oop is nie. Dieselfde reël as elke ander opspringer in
 *     hierdie app.
 *   · Die knoppie vat 'n mens na die PROGRAM, by sy eie dag, nie na die
 *     e-boekblad nie. "Gaan soek dit self" is hoe 'n mens iemand verloor.
 *
 * Suiwer, sodat dit sonder 'n blaaier getoets kan word. Die onsuiwer helfte —
 * wat localStorage vertel — staan heel onder en is drie reëls.
 */
/* Met die `.js` daarby, want hierdie lêer se toets loop onder plain node en
   node los nie 'n uitbreidinglose pad op nie. Vite gee nie om. */
import { hetBegin } from './volgJesusBegin.js'

/* Die merkie dat hierdie mens die boodskap gesien het. */
export const SLEUTEL = 'vj_skuif_gesien'

/* ── Het hierdie mens die program begin? ──
 *
 * Dieselfde vraag as die kaart s'n, dus dieselfde antwoord: `hetBegin()` in
 * volgJesusBegin.js. Die verskil is dat die kaart EEN week ken en ons oor ALLE
 * weke moet kyk — iemand wat Week 2 klaargemaak het en Week 3 nog nie oopgemaak
 * het nie, is net so seer 'n mens wat besig is.
 *
 * `klaarPerWeek` is wat elke `vj_klaar_w<N>`-sleutel hou. Enige dag, in enige
 * week, tel. */
export function hetProgramBegin(modus, klaarPerWeek) {
  const almal = []
  for (const week of klaarPerWeek || []) {
    if (Array.isArray(week)) almal.push(...week)
  }
  return hetBegin(modus, almal)
}

/* ── Mag ons dit NOU wys? ──
 *
 * Alles kom van buite af in, want die tyd, die berging en die skerm se
 * toestand is nie hierdie lêer se werk nie. */
export function magWysSkuif(f) {
  const d = f || {}

  /* Al gesien. Dit is die eerste hek want dit is die goedkoopste en die
     belangrikste. */
  if (d.gesien) return false

  /* Nooit vir iemand wat die program nog nooit aangeraak het nie. */
  if (!hetProgramBegin(d.modus, d.klaarPerWeek)) return false

  /* Nie op 'n ander oortjie nie. Die boodskap verduidelik iets wat op LUISTER
     verdwyn het; op die e-boekblad staan die kaart reg voor jou en dan is dit
     'n opspringer wat niks sê nie. */
  if (d.oortjie !== 'luister') return false

  /* Nooit bo-op klank nie. Die stemboodskap is die app. */
  if (d.klankSpeel) return false

  /* En nie oor 'n ander skerm nie — Tyd met God, die Bybel, 'n gedeelde
     skakel, 'n ander opspringer. */
  if (d.oorlegOop) return false

  return true
}

/* ────────────────────────────────────────────────────────────
   Die onsuiwer helfte. Net localStorage; geen besluit hierin.
   ──────────────────────────────────────────────────────────── */

/* Elke `vj_klaar_w<N>`-sleutel op hierdie foon. Ons weet nie hoeveel weke daar
   is nie en ons wil dit ook nie hier weet nie — die berging self sê dit. */
export function leesKlaarPerWeek() {
  const uit = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k || !/^vj_klaar_w\d+$/.test(k)) continue
      try {
        const v = JSON.parse(localStorage.getItem(k) || '[]')
        if (Array.isArray(v)) uit.push(v)
      } catch { /* een stukkende sleutel mag nie die res kos nie */ }
    }
  } catch { /* privaat modus */ }
  return uit
}

export function isGesien() {
  try { return localStorage.getItem(SLEUTEL) === '1' } catch { return false }
}

export function merkGesien() {
  try { localStorage.setItem(SLEUTEL, '1') } catch { /* privaat modus */ }
}

export function leesModus() {
  try { return localStorage.getItem('vj_modus') || '' } catch { return '' }
}
