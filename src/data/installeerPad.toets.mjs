/* Kry ELKE soort besoeker 'n werkende pad om die app te installeer?
 *
 * Die reel is eenvoudig: niemand mag 'n knoppie kry wat niks doen nie. 'n
 * Mens in Facebook se blaaier wat "tik die drie kolletjies" gelees het,
 * loop weg — daar IS geen drie kolletjies nie.
 *
 * Die laaste blok voer ook `public/go.html` se kopie van hierdie reels uit
 * en eis dat dit dieselfde antwoord gee. Go.html kan nie invoer nie (dit
 * moet sonder die bundel werk), en twee kopiee wat uitmekaar dryf is presies
 * hoe hierdie soort ding stil breek.
 */
import { readFileSync } from 'node:fs'
import { kiesPad, KNOP_WOORDE } from './installeerPad.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

const UA = {
  chromeAndroid:  'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  samsung:        'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36',
  firefoxAndroid: 'Mozilla/5.0 (Android 14; Mobile; rv:127.0) Gecko/127.0 Firefox/127.0',
  edgeAndroid:    'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36 EdgA/126.0.0.0',
  operaAndroid:   'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36 OPR/79.0.0.0',
  braveAndroid:   'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  fbAndroid:      'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/450.0.0.0;]',
  igAndroid:      'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36 Instagram 300.0.0.0 Android',
  tiktokAndroid:  'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36 trill_320 BytedanceWebview TikTok 32.0.0',
  waAndroid:      'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36 MicroMessenger/8.0',
  safariIphone:   'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  chromeIphone:   'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.0.0 Mobile/15E148 Safari/604.1',
  firefoxIphone:  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/127.0 Mobile/15E148 Safari/605.1.15',
  edgeIphone:     'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/126.0.0.0 Mobile/15E148 Safari/605.1.15',
  fbIphone:       'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/450.0.0.0;]',
  igIphone:       'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 300.0.0.0 (iPhone15,2)',
  ipad:           'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  rekenaar:       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  mac:            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
}

console.log('\n── Chromium op Android: een tik ──\n')
for (const naam of ['chromeAndroid', 'edgeAndroid', 'operaAndroid', 'braveAndroid']) {
  is(`${naam} kry die egte installeervenster`,
     kiesPad({ ua: UA[naam], kanPrompt: true }), 'prompt')
}

console.log('\n── Wie NIE kan installeer nie, word Chrome toe gestuur ──\n')
for (const naam of ['samsung', 'firefoxAndroid', 'fbAndroid', 'igAndroid', 'tiktokAndroid', 'waAndroid']) {
  is(`${naam} → Chrome`, kiesPad({ ua: UA[naam], kanPrompt: false }), 'chrome')
}

/* Die belangrikste een in hierdie leer.
 *
 * Samsung Internet VUUR `beforeinstallprompt`. Sou ons dit glo, kry die mens
 * een tik en 'n app op Samsung se enjin — waar sy oggendkennisgewing nooit
 * kom nie. Die hele Play-storie het hieruit ontstaan. */
is('Samsung word Chrome toe gestuur SELFS as sy venster beskikbaar is',
   kiesPad({ ua: UA.samsung, kanPrompt: true }), 'chrome')
is('en Facebook se blaaier ook',
   kiesPad({ ua: UA.fbAndroid, kanPrompt: true }), 'chrome')

console.log('\n── iPhone ──\n')
is('Safari op n iPhone kry die Deel-stappe', kiesPad({ ua: UA.safariIphone }), 'ios')
is('en n iPad ook',                          kiesPad({ ua: UA.ipad }), 'ios')
for (const naam of ['chromeIphone', 'firefoxIphone', 'edgeIphone', 'fbIphone', 'igIphone']) {
  is(`${naam} → Safari, want net Safari kan dit doen`,
     kiesPad({ ua: UA[naam] }), 'safari')
}
is('en n installeervenster op n iPhone beteken niks — dit bestaan nie',
   kiesPad({ ua: UA.chromeIphone, kanPrompt: true }), 'safari')

console.log('\n── Die res ──\n')
is('n rekenaar met die venster kan ook installeer', kiesPad({ ua: UA.rekenaar, kanPrompt: true }), 'prompt')
is('maar sonder die venster is daar niks te se nie', kiesPad({ ua: UA.rekenaar }), 'rekenaar')
is('n Mac ook',                          kiesPad({ ua: UA.mac }), 'rekenaar')
is('Chrome sonder n venster kry die spyskaart-stappe',
   kiesPad({ ua: UA.chromeAndroid, kanPrompt: false }), 'stappe')
is('wie dit reeds het, word nie gepla nie',
   kiesPad({ ua: UA.chromeAndroid, kanPrompt: true, geinstalleer: true }), 'geinstalleer')
is('ook nie op n iPhone nie',
   kiesPad({ ua: UA.safariIphone, geinstalleer: true }), 'geinstalleer')

console.log('\n── Niemand kry n lee hand nie ──\n')
{
  /* Die eintlike eis: daar is GEEN besoeker vir wie ons niks het nie. */
  const paaie = new Set()
  for (const naam of Object.keys(UA)) {
    for (const kanPrompt of [true, false]) {
      const pad = kiesPad({ ua: UA[naam], kanPrompt })
      if (!pad) { val++; console.log(`  VAL ${naam} kry NIKS`) }
      paaie.add(pad)
    }
  }
  is('elke pad het woorde vir sy knoppie',
     [...paaie].filter(p => p !== 'geinstalleer' && !KNOP_WOORDE[p]), [])
  is('n onbekende blaaier val nie deur nie', kiesPad({ ua: 'iets vreemds Mobi' }), 'stappe')
  is('n LEE user-agent val nie deur nie',    kiesPad({ ua: '' }), 'rekenaar')
  is('en geen argumente ook nie',            typeof kiesPad(), 'string')
}

console.log('\n── go.html dra dieselfde reels ──\n')
{
  /* Trek die kopie uit go.html en voer dit uit. Twee stelle reels wat
     uitmekaar dryf, is presies hoe hierdie ding stil breek. */
  const bron = readFileSync(new URL('../../public/go.html', import.meta.url), 'utf8')
  const blok = bron.match(/\/\* KIESPAD-BEGIN \*\/([\s\S]*?)\/\* KIESPAD-EINDE \*\//)
  is('die blok staan in go.html', !!blok, true)
  if (blok) {
    const goKiesPad = new Function(`${blok[1]}; return kiesPad`)()
    let selfde = 0, verskil = []
    for (const naam of Object.keys(UA)) {
      for (const kanPrompt of [true, false]) {
        for (const geinstalleer of [true, false]) {
          const a = kiesPad({ ua: UA[naam], kanPrompt, geinstalleer })
          const c = goKiesPad({ ua: UA[naam], kanPrompt, geinstalleer })
          if (a === c) selfde++
          else verskil.push(`${naam} prompt=${kanPrompt} geinst=${geinstalleer}: app=${a} go=${c}`)
        }
      }
    }
    is(`al ${selfde} gevalle stem ooreen`, verskil, [])
  }
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
