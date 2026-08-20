/* MAG die app homself NOU herlaai?
 *
 * Dewald, 20 Augustus 2026: "die app refresh heeltyd en skop mense uit!!!!!!"
 *
 * Hy was reg, en dit was nie 'n raaisel nie. Die ketting was:
 *
 *   ontplooi → sw.js install → skipWaiting() → activate → clients.claim()
 *            → `controllerchange` by elke oop bladsy
 *            → main.jsx se luisteraar → window.location.reload()
 *
 * Daardie luisteraar in main.jsx het GEEN voorwaarde gehad nie. Hy het ook
 * eerste geregistreer, wat beteken App.jsx se `isPlayingRef`-hek — die een wat
 * juis moes keer dat 'n herlaai oor 'n stemboodskap heen loop — nooit 'n kans
 * gekry het nie. Op 'n dag waarop ons tien keer ontplooi, is elke mens wat die
 * app oophet tien keer uit sy blad geskop, party van hulle middel-in 'n
 * stemboodskap.
 *
 * Die versoeking is om die herlaai heeltemal weg te vat. Dit mag nie: sien
 * CLAUDE.md se "Die wit skerm". 'n Nuwe weergawe MOET die foon bereik.
 *
 * Die punt is dus nie OF nie, maar WANNEER. Die reels:
 *
 *   1. nooit terwyl klank speel nie — 'n stemboodskap speel dikwels met die
 *      skerm af, dus is "versteek" nie bewys dat niemand luister nie;
 *   2. nooit terwyl die app op die skerm is nie — dit is die hele klagte;
 *   3. wel wanneer die app al 'n RUK weg is. Iemand wat vinnig WhatsApp toe
 *      gaan en terugkom, moet terugkom waar hy was. Iemand wat 'n halfuur weg
 *      is, verwag in elk geval om by die begin te land;
 *   4. hoogstens een keer.
 *
 * Gebeur niks hiervan nie — die mens los die app oop — dan bly hy op die ou
 * kode tot die volgende koue begin. Dit is reg so: die diensketter het sy
 * vooraf-kas reeds omgeruil, dus is die VOLGENDE oopmaak die nuwe weergawe.
 * Ons verloor 'n sessie; ons breek niemand se dag nie.
 *
 * Hierdie leer is suiwer sodat die besluit met plain node getoets kan word.
 * Die onsuiwer helfte — die luisteraars en die tydhouer — staan in App.jsx.
 */

/* Hoe lank die app weg moet wees voordat 'n herlaai niemand kos nie. */
export const WAG_MS = 5 * 60 * 1000

export function magHerlaai({
  wagtend = false,        /* wag daar 'n nuwe weergawe? */
  versteekSedert = null,  /* wanneer die app weggeraak het, of null as dit wys */
  nou = 0,
  speelKlank = false,
  herlaaiTans = false,
} = {}) {
  if (herlaaiTans) return false
  if (!wagtend) return false
  /* Reel 1. 'n Stemboodskap speel met die skerm af — die duurste herlaai in
     hierdie app se geskiedenis sou hierdie een wees. */
  if (speelKlank) return false
  /* Reel 2. Wys die app, dan raak ons hom nie aan nie. */
  if (!Number.isFinite(versteekSedert) || versteekSedert === null) return false
  /* Reel 3. Lank genoeg weg dat 'n mens nie sy plek verloor nie. */
  return nou - versteekSedert >= WAG_MS
}
