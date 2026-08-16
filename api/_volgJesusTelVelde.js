/* Watter tellers 'n VOLG JESUS-gebeurtenis mag optel.
 *
 * Dewald: "en as iemand die program doen moet dit in admin tel hoeveel mense
 * begin het en so."
 *
 * ── Waarom die KLIËNT nooit 'n veldnaam stuur nie ──
 *
 * Die versoek is oop — 'n gewone foon roep dit sonder wagwoord, presies soos
 * `api/tel-toestemming.js`. Wie 'n veldnaam mag stuur, mag enige veld op
 * daardie dokument skryf, en 'n `fieldPath` wat 'n mens self kies, is die pad
 * na `__proto__`-agtige verrassings en na 500's uit Firestore.
 *
 * Die kliënt stuur dus 'n GEBEURTENIS ('n handjievol woorde) en 'n
 * weeknommer; hierdie lêer maak die name. Kom daar iets onbekends in, gebeur
 * daar niks.
 *
 * ── Wat NIE gestoor word nie ──
 *
 * Geen naam, geen e-pos, geen toestel-id, geen IP, geen tydstempel per mens.
 * Heelgetalle op EEN dokument. 'n Mens kan uit hierdie data onmoontlik
 * agterkom wie wie is, want daar is niks om aan iemand te koppel nie. Wat die
 * mens self in die program tik — sy refleksies, sy hartsantwoorde — verlaat
 * nooit sy toestel nie, en niks daarvan raak hierdie lêer nie.
 *
 * ── Waarom die veldname geen koppeltekens het nie ──
 *
 * `w1dag3`, nie `w1-dag-3`. 'n Firestore-`fieldPath` met 'n koppelteken moet
 * aangehaal word, en 'n veld wat soms aangehaal is en soms nie, is 'n veld
 * wat op een pad stil misluk.
 *
 * Suiwer, sodat plain node dit kan toets sonder om aan Firestore te raak.
 */

/* Die vier dinge wat 'n mens in die program doen. Meer as dit is 'n
   dopgehou-app, nie 'n dissipelskapprogram nie. */
const GEBEURE = ['oop', 'begin', 'dag', 'weekKlaar']

/* Die totale langs die per-week getalle. Die admin lees die groot prentjie
   hieruit sonder om 52 velde op te tel. */
const TOTAAL = { oop: 'oop', begin: 'begin', dag: 'dagKlaar', weekKlaar: 'weekKlaar' }

function heelIn(waarde, van, tot) {
  const n = Number(waarde)
  return Number.isInteger(n) && n >= van && n <= tot ? n : null
}

/* Gee die lys `fieldPath`s wat met 1 opgetel moet word — of 'n leë lys.
   'n Leë lys beteken die versoek word geweier voordat Firestore geraak word. */
function velde(lyf) {
  if (!lyf || typeof lyf !== 'object') return []
  const ding = lyf.ding
  if (!GEBEURE.includes(ding)) return []

  const uit = [TOTAAL[ding]]

  /* `oop` is die kaart op Luister. Dit hoort by geen week nie — dit is die
     mens wat kyk wat dit is. */
  if (ding === 'oop') return uit

  const w = heelIn(lyf.week, 1, 52)
  if (w === null) return []

  if (ding === 'begin')     uit.push(`w${w}begin`)
  if (ding === 'weekKlaar') uit.push(`w${w}klaar`)
  if (ding === 'dag') {
    const d = heelIn(lyf.dag, 1, 5)
    if (d === null) return []
    uit.push(`w${w}dag${d}`)
  }
  return uit
}

module.exports = { velde, GEBEURE, TOTAAL }
