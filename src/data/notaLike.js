/* ────────────────────────────────────────────────────────────
   Die ❤️ op 'n stemboodskap — EEN plek.

   Dewald: "there should be a heart button and when they like this voice note
   it should show at the original one on top of the Luister Nou page."

   Dit is dieselfde reël as die res van Vandag se Tyd met God: een aksie, een
   databron, oral dieselfde resultaat. Die hart in die vloei en die hart op
   die hero is nie twee harte nie — dit is EEN hart, op twee plekke geteken.

   ── Waarom hierdie lêer bestaan ──

   Die logika het in `Luister.jsx` se `handleLike` gewoon. Sou die vloei sy
   eie kopie kry, sou die twee stil uitmekaar dryf: die een skryf `likedNotes`
   en die ander vergeet dit, of die een tel plaaslik op en die ander nie. Dan
   is daar 'n dag waarop 'n mens 'n hart in die vloei druk en op die hero staan
   hy leeg — en niemand kan sê hoekom nie.

   Twee plekke op die foon, albei reeds in gebruik voordat hierdie lêer
   bestaan het:

     likedNotes    die id's wat HIERDIE toestel gelike het
     cachedLikes   die getalle, sodat 'n mens hulle sien voor Firestore praat

   ── 'n Hart kan nie afgehaal word nie ──

   `like()` doen niks as die toestel reeds gelike het. Dit is 'n bewuste keuse
   en nie 'n vergetelheid: 'n hart op 'n boodskap wat gehelp het, is nie 'n
   skakelaar nie. Verander dit ooit, moet ALBEI skerms saam verander — en dit
   is presies hoekom die besluit hier staan en nie in 'n skerm nie.
   ──────────────────────────────────────────────────────────── */

import { doc, setDoc, increment } from 'firebase/firestore'
import { db } from '../firebase'

export const SLEUTEL_GELIKE = 'likedNotes'
export const SLEUTEL_TELLINGS = 'cachedLikes'

/* Die gebeurtenis wat elke oop skerm laat herteken. `storage` vuur NIE in
   die oortjie wat geskryf het nie, en die vloei sit bo-op Luister in
   dieselfde oortjie — sonder hierdie sein bly die hero se hart leeg totdat
   'n mens die blad herlaai. */
export const GEBEURTENIS = 'nota-gelike'

export function leesGelike() {
  try {
    const lys = JSON.parse(localStorage.getItem(SLEUTEL_GELIKE) || '[]')
    return Array.isArray(lys) ? lys : []
  } catch { return [] }
}

export function hetGelike(notaId) {
  return !!notaId && leesGelike().includes(notaId)
}

export function leesTellings() {
  try {
    const t = JSON.parse(localStorage.getItem(SLEUTEL_TELLINGS) || '{}')
    return t && typeof t === 'object' ? t : {}
  } catch { return {} }
}

export function telling(notaId) {
  const t = leesTellings()
  const n = Number(t[notaId])
  return Number.isFinite(n) && n > 0 ? n : 0
}

/* ── Like ──
 *
 * Gee die NUWE telling terug, of `0` as hierdie toestel reeds gelike het.
 * Nul is vals, dus lees `if (!like(id)) return` presies soos voorheen.
 *
 * Dat dit die telling teruggee en nie net `true` nie, is 'n regstelling van 'n
 * egte fout. Albei skerms het plaaslik OPGETEL (`t => t + 1`) en boonop na
 * hierdie module se sein geluister, wat `Math.max(t, telling)` doen. React
 * pas hulle in volgorde toe: eers max(0,1) = 1, dan 1 + 1 = 2. Die hart het
 * dus 2 gewys terwyl `cachedLikes` 1 gesê het — 'n skerm wat lieg oor sy eie
 * databron, wat presies is wat hierdie lêer moet keer. Dit is op 'n
 * skermkiekie gevang.
 *
 * Nou stel albei skerms die getal ABSOLUUT uit hierdie een antwoord, en die
 * sein is net vir die ANDER skerm.
 *
 * Die merkie word geskryf VOOR ons stuur — anders tel 'n swak lyn elke
 * mislukte versoek weer. Dieselfde patroon as volgJesusTel.js.
 *
 * Die plaaslike telling word ook dadelik opgetel sodat die hart nie 'n
 * halwe sekonde lank leeg lyk nie. Firestore se `onSnapshot` op Luister
 * oorskryf hom kort daarna met die egte getal.
 */
export function like(notaId) {
  if (!notaId || hetGelike(notaId)) return 0

  try {
    localStorage.setItem(SLEUTEL_GELIKE, JSON.stringify([...leesGelike(), notaId]))
  } catch {}

  let nuweTelling = 1
  try {
    const t = leesTellings()
    nuweTelling = (Number(t[notaId]) || 0) + 1
    localStorage.setItem(SLEUTEL_TELLINGS, JSON.stringify({ ...t, [notaId]: nuweTelling }))
  } catch {}

  /* Dieselfde skryf as wat Luister nog altyd gedoen het: een dokument per
     nota, atomies opgetel. */
  try {
    setDoc(doc(db, 'likes', notaId), { count: increment(1) }, { merge: true }).catch(() => {})
  } catch {}

  try {
    window.dispatchEvent(new CustomEvent(GEBEURTENIS, { detail: { notaId, telling: nuweTelling } }))
  } catch {}

  return nuweTelling
}
