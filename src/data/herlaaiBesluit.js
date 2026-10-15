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

/* ── 'n EERSTE installasie is nie 'n nuwe weergawe nie ──
 *
 * Dewald, 15 Oktober 2026: *"op die browser... na die eerste 2/3 sekondes
 * spring die app soos wanneer jy iets update... So die popup wat sê
 * instaleer die app verdwyn."*
 *
 * Op 'n eerste besoek het die bladsy geen diensketter nie. Die nuwe een
 * installeer, `skipWaiting()`, `clients.claim()` — en binne twee of drie
 * sekondes vuur `controllerchange` en stuur die ketter `SW_UPDATED`. Albei het
 * dit gelees as "daar is 'n nuwe weergawe" en die bladsy herlaai: die app self,
 * en die ketter vir elke bladsy wat nie antwoord nie. Daar WAS niks nuuts nie;
 * die bladsy het reeds die nuutste kode gehad. Die enigste gevolg was 'n
 * herlaai wat die installasie-uitklap weggevee het — op presies die besoek
 * waar 'n vreemdeling besluit of hy die app wil hê.
 *
 * Twee hekke, een aan elke kant, want 'n foon wat nog die OU bundel draai, kry
 * net die ketter se helfte. */

/* Die ketter se kant: het daar al ooit 'n weergawe hier geaktiveer? `vorige`
   is die SPOEL-nommer wat die vorige aktivering neergeskryf het, of null as
   daar nog nooit een was nie. Net dan is daar niemand om te herlaai nie. */
export function isEersteAktivering(vorige) {
  return vorige === null || vorige === undefined || Number.isNaN(vorige)
}

/* Die app se kant: is HIERDIE controllerchange 'n egte wissel van weergawe?
 *
 *   hadAanvanklik — was daar 'n beheerder toe die bladsy oopgemaak het?
 *   reedsOorgeneem — het ons die eerste oorname (null → ketter) al gesien?
 *
 * Het die bladsy sonder 'n beheerder begin, is die EERSTE wissel net die
 * installasie wat oorneem. Elke latere wissel is 'n egte nuwe weergawe en
 * word afgedwing, soos altyd. */
export function isEgteWissel({ hadAanvanklik = false, reedsOorgeneem = false } = {}) {
  if (hadAanvanklik) return true
  return !!reedsOorgeneem
}
