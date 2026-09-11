/* ── Wat gebeur met die opspringer NÁ Vandag se Tyd met God ──
 *
 * Die e-boek- en donasie-opspringer word teruggehou terwyl die vloei oop is —
 * dieselfde meganisme as die een wat hulle terughou terwyl klank speel
 * (`pendingPopup` in App.jsx). Die vraag is wat daarna met hulle gebeur.
 *
 * ── Wat dit was, en hoekom dit verander het ──
 *
 * Dit was: klaargemaak → die dag is GEVRA, en die opspringer verdwyn. Die
 * gedagte was "een vraag per dag", en die klaar-skerm se eie deel-vraag was
 * daardie een.
 *
 * Die gevolg was egter iets anders. Tyd met God is die DAAGLIKSE ritueel — wie
 * dit doen, doen dit elke dag. Daardie mens het dus NOOIT weer 'n nuwe e-boek
 * gesien nie, en nooit weer 'n donasievraag nie. Die trouste mense in die app
 * was presies dié wat niks meer gewys is nie.
 *
 * Dewald, 11 September 2026: *"Die popups wat wys nadat iemand klaar op luister
 * nou geluister het — werk dit ook vir die kaart wat sê spandeer tyd met God?
 * As hulle al die skerms op daai kaart klaargemaak het moet daai selfde popups
 * wys... en maak seker dat die nuwe e-boeke nog wys en die donasie popups."*
 *
 * Klaarmaak LAAT die opspringer nou DEUR, presies soos wanneer 'n nota
 * klaar gespeel het.
 *
 * ── Die een reël wat NIE verander nie ──
 *
 * **Nooit geld op 'n dag wat iemand WOORDE in die gebedskassie getik het nie.**
 * Nie donasie nie, nie e-boek nie — ook nie een wat gewag het nie. Iemand wat
 * pas geskryf het dat sy huwelik in stukke lê, is nie die mens vir 'n
 * R50-vraag drie skerms later nie. `magVraGeld()` in tydMetGod.js bly die hek,
 * en hierdie lêer eerbiedig dit.
 *
 * Suiwer: alles kom van buite af in.
 */

/* Die drie dinge wat kan gebeur:
 *
 *   'wys'  — laat die teruggehoue opspringer DEUR, nou.
 *   'stil' — laat hom val, en merk die dag as gevra. Niks vra weer vandag nie.
 *   'niks' — laat hom val, maar merk NIE. Môre is daar weer 'n kans.
 */
export const UITKOMSTE = ['wys', 'stil', 'niks']

export function naTydMetGod(f) {
  const d = f || {}

  /* Hy is REEDS vandag gevra — hy het 'n skenk-knoppie op die klaar-skerm
     gedruk (`tmgMerkGevra`). Twee geldvrae ná mekaar is presies wat hierdie
     app nie doen nie. */
  if (d.reedsGevra) return 'stil'

  /* Hy het woorde in die gebedskassie getik. Vandag word daar nie oor geld
     gepraat nie — ook nie deur 'n opspringer wat gewag het nie. */
  if (!d.magGeld) return 'stil'

  /* Halfpad uitgeklim. 'n Opspringer op pad uit is 'n straf, en die dag word
     NIE gemerk nie: kom hy later terug en maak klaar, kan dit dan wys. */
  if (!d.voltooi) return 'niks'

  /* Klaargemaak, en niks in die pad nie. Dieselfde as 'n nota wat klaar
     gespeel het. */
  return 'wys'
}
