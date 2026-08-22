/* MAG die app homself NOU herlaai?
 *
 * ── Die geskiedenis, want dit het twee keer omgedraai ──
 *
 * 20 Augustus 2026, Dewald: "die app refresh heeltyd en skop mense uit!!!!!!"
 * Hy was reg. Elke ontplooiing het elke oop bladsy onmiddellik herlaai, party
 * mense middel-in 'n stemboodskap. Ons het toe 'n reel bygesit: nooit terwyl
 * die app op die skerm is nie, en eers nadat dit vyf minute weg is.
 *
 * Daardie reel het 'n prys gehad wat hy nie wou betaal nie: die enigste pad na
 * 'n nuwe weergawe was om die app toe te maak en weer oop te maak. Ek het 'n
 * strokie aangebied wat dit een tik maak. Sy antwoord: "vergeet di fokken blok
 * en forseer dit. almal kry nou dadelik die nuwe weergawe."
 *
 * Dit is sy oproep om te maak, en dit is nou die reel: 'n nuwe weergawe land
 * SODRA sy daar is.
 *
 * ── Die een hek wat bly ──
 *
 * KLANK. Nie as 'n voorkeur nie — 'n herlaai middel-in 'n stemboodskap is die
 * duurste enkele fout in hierdie app se geskiedenis, en die stemboodskap is
 * die app. Speel daar klank, wag ons; die oomblik wat dit stop, herlaai dit.
 *
 * Dit is die enigste ding wat 'n herlaai nou keer.
 *
 * Hierdie leer is suiwer sodat die besluit met plain node getoets kan word.
 * Die onsuiwer helfte — die luisteraars — staan in App.jsx.
 */

export function magHerlaai({
  wagtend = false,        /* wag daar 'n nuwe weergawe? */
  speelKlank = false,
  herlaaiTans = false,
} = {}) {
  if (herlaaiTans) return false
  if (!wagtend) return false
  /* Die enigste hek. 'n Stemboodskap speel dikwels met die skerm af, dus is
     "versteek" nooit bewys dat niemand luister nie. */
  if (speelKlank) return false
  return true
}
