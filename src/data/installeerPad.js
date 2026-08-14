/* ── Watter pad kry hierdie besoeker om die app te installeer? ──
 *
 * Dewald: "I don't want any users to go on this website and have not the
 * option to install this thing on their phone."
 *
 * Die enigste plek waar daardie besluit geneem word. Dit is suiwer — 'n
 * string in, 'n string uit, geen `window`, geen Date — sodat dit met plain
 * node getoets kan word oor elke blaaier wat mense werklik gebruik.
 *
 * `public/go.html` kan nie invoer nie (dit moet sonder die bundel werk) en
 * dra dus 'n kopie van hierdie reels. `installeerPad.toets.mjs` voer ALBEI
 * uit en eis dat hulle dieselfde antwoord gee, sodat hulle nooit uitmekaar
 * dryf nie.
 *
 * ── Die paaie ──
 *
 *   'geinstalleer'  dit staan reeds op sy foon — se niks
 *   'prompt'        die blaaier gee ons sy eie installeervenster: EEN tik
 *   'chrome'        Android, maar hierdie blaaier kan dit nie ordentlik doen
 *                   nie — stuur hom Chrome toe
 *   'safari'        iPhone, maar nie Safari nie — net Safari kan installeer
 *   'ios'           iPhone met Safari — wys die Deel-stappe
 *   'stappe'        Chrome, maar geen venster nie — die spyskaart is al wat
 *                   oorbly
 *   'rekenaar'      'n rekenaar; hier gaan dit nie oor 'n foon nie
 */

/* Blaaiers wat BINNE 'n ander app woon. Nie een van hulle kan 'n app
 * installeer nie — daar is geen spyskaart, geen installeervenster, niks. 'n
 * Mens wat uit 'n Facebook-plasing kom, is hier, en dit is 'n groot deel van
 * hierdie app se verkeer. */
const IN_APP = /FBAN|FBAV|FBIOS|FB_IAB|FB4A|Instagram|TikTok|Twitter|Line\/|MicroMessenger|Snapchat|Pinterest|LinkedInApp/i

/* iPhone-blaaiers wat NIE Safari is nie. Op iOS kan net Safari iets op die
 * tuisskerm sit; Chrome, Firefox en Edge op 'n iPhone is Safari se enjin in
 * 'n ander jas, sonder daardie een vermoe. */
const IOS_NIE_SAFARI = /CriOS|FxiOS|EdgiOS|OPT\/|YaBrowser/i

export function kiesPad({ ua = '', kanPrompt = false, geinstalleer = false } = {}) {
  if (geinstalleer) return 'geinstalleer'

  const isIOS     = /iPhone|iPad|iPod/i.test(ua)
  const isAndroid = /Android/i.test(ua)
  const isMobiel  = isIOS || isAndroid || /Mobi/i.test(ua)

  if (isIOS) {
    /* Die volgorde tel: Facebook se blaaier op 'n iPhone bevat nie CriOS
       nie, maar dit is net so min Safari. */
    return (IN_APP.test(ua) || IOS_NIE_SAFARI.test(ua)) ? 'safari' : 'ios'
  }

  /* 'n Rekenaar kan wel installeer — Chrome en Edge sit dit in die
     programmelys. Kry ons die venster, bied dit aan; kry ons dit nie, is
     daar niks sinvols om vir 'n rekenaar te se nie en bly ons stil. */
  if (!isMobiel) return kanPrompt ? 'prompt' : 'rekenaar'

  /* Vanaf hier is dit Android. */

  /* Binne 'n ander app se blaaier is daar niks om te doen nie. Chrome toe. */
  if (IN_APP.test(ua)) return 'chrome'

  /* Samsung Internet, doelbewus.
   *
   * Samsung Internet KAN installeer — dit vuur selfs `beforeinstallprompt`.
   * Maar dan loop die geinstalleerde app op SAMSUNG se enjin, en dit is
   * presies waar die oggendkennisgewing stilweg verdwyn. Ses duisend fone
   * hang aan daardie kennisgewing.
   *
   * Een tik meer, maar dit werk. Sien CLAUDE.md en docs/android-app.md. */
  if (/SamsungBrowser/i.test(ua)) return 'chrome'

  /* Firefox op Android gee ons nooit 'n installeervenster nie. */
  if (/Firefox|FxiOS/i.test(ua)) return 'chrome'

  /* Chromium op Android: Chrome, Edge, Opera, Brave, Vivaldi. */
  if (kanPrompt) return 'prompt'

  /* Chromium, maar die venster het nie gekom nie. Dit gebeur wanneer die
     blaaier besluit die mens is nog nie gereed nie, of dit reeds gevra het.
     Die spyskaart is dan al wat oorbly — nie goed nie, maar eerlik. */
  return 'stappe'
}

/* Vir 'n mens: wat gaan die knoppie se? Een plek, sodat die uitklap, die
 * balk en /go dieselfde woorde gebruik. */
export const KNOP_WOORDE = {
  prompt:  'Sit op my foon',
  chrome:  'Maak oop in Chrome',
  safari:  'Maak oop in Safari',
  ios:     'Wys my hoe',
  stappe:  'Wys my hoe',
  rekenaar: 'Maak die app oop',
}
