/* Wat mag die diensketter uit Firebase Storage kas — en wat NOOIT nie.
 *
 * ── Hoekom hierdie lêer bestaan ──
 *
 * Die diensketter het 'n `CacheFirst` op ALLES by firebasestorage.googleapis.com
 * gehad, klank inkluis. Dit is die duurste soort fout in hierdie projek: dit
 * lyk soos 'n optimalisering en dit breek die een ding wat die app is.
 *
 * 'n `<audio>` vra nooit 'n lêer in een stuk nie. Dit stuur 'n `Range`-kop en
 * vra stukke: `bytes=0-`, dan `bytes=482000-`, en so aan. 'n Kas antwoord op
 * die URL, nie op die Range nie. Die speler vra dus 'n stuk en kry die hele
 * (of erger, 'n half-geskrewe) liggaam terug met die verkeerde status. Chrome
 * verdra die eerste een soms; die tweede een — en elke keer wat 'n mens
 * vorentoe spring — is 'n dooie speler.
 *
 * En omdat dit CacheFirst met 30 dae was, is 'n stukkende inskrywing nie 'n
 * slegte oggend nie. Dit is dieselfde stukkende inskrywing MôRE weer, en die
 * dag daarna. Presies wat gerapporteer is: "speel nou al vir 3 dae nie deur
 * tot die einde nie."
 *
 * ── Die besluit ──
 *
 * Prente uit Storage word gekas: hulle vra nooit Ranges nie, hulle verander
 * nooit, en hulle kos data.
 *
 * Klank word NOOIT gekas nie. Dit gaan reguit na die netwerk, presies soos in
 * elke ander podgooi-app. Ons verloor die vermoë om gister se boodskap sonder
 * data te herspeel; ons kry 'n speler wat werk. Daardie ruil is nie naby nie.
 *
 * Twee hekke, want 'n mens mag nie op een steun nie:
 *
 *   1. `request.destination` is `'audio'` vir enige `<audio>`-versoek. Dit is
 *      die skoon antwoord — maar ouer blaaiers gee 'n leë string.
 *   2. Die VOUER. Elke stemboodskap wat hierdie app ooit opgelaai het, gaan
 *      na `audio/` — sien Admin.jsx en SorgOpname.jsx. Die uitbreiding kom
 *      van die mens se lêernaam af en kan enigiets wees; die vouer nie.
 *   3. Die uitbreiding in die pad, vir alles wat nie in `audio/` sit nie.
 *
 * Enigeen van die drie is genoeg om dit uit die kas te hou.
 */

/* Alles wat 'n mediaspeler kan oopmaak. Wees ruim: 'n tipe wat hier ontbreek
   se straf is 'n stil speler, en 'n tipe wat te veel is se straf is 'n bietjie
   meer data. */
const KLANKTIPES = [
  'mp3', 'm4a', 'mp4', 'aac', 'ogg', 'oga', 'opus', 'wav', 'weba', 'webm',
  'flac', 'caf', 'amr', '3gp', 'm4b', 'mov',
]

export const STORAGE_OORSPRONG = 'https://firebasestorage.googleapis.com'

/* Die pad wat in die URL ingebed is. Firebase kodeer hom een keer:
   .../o/notes%2F2026-08-16.mp3?alt=media&token=... */
export function padUit(url) {
  let u
  try { u = new URL(url) } catch { return '' }
  const na = u.pathname.indexOf('/o/')
  const rou = na === -1 ? u.pathname : u.pathname.slice(na + 3)
  try { return decodeURIComponent(rou) } catch { return rou }
}

/* Vouers waarin hierdie app klank oplaai. Alles hierin is klank, ook 'n lêer
   sonder 'n uitbreiding of met 'n vreemde een. */
const KLANKVOUERS = ['audio/', 'notes/', 'sorg/']

export function isKlank(url, destination) {
  if (destination === 'audio' || destination === 'video') return true

  const pad = padUit(url)
  if (KLANKVOUERS.some(v => pad.startsWith(v))) return true

  const punt = pad.lastIndexOf('.')
  if (punt === -1) return false
  /* Net die uitbreiding self, en niks wat na 'n skuinsstreep kom nie. */
  const uit = pad.slice(punt + 1).toLowerCase()
  if (uit === '' || uit.includes('/')) return false
  return KLANKTIPES.includes(uit)
}

/* Die enigste vraag wat die diensketter vra. */
export function magKas(url, destination) {
  let u
  try { u = new URL(url) } catch { return false }
  if (u.origin !== STORAGE_OORSPRONG) return false
  return !isKlank(url, destination)
}
