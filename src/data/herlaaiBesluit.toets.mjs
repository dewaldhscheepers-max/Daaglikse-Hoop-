/* MAG die app homself NOU herlaai?
 *
 * Die reel het twee keer omgedraai, en hierdie leer hou die HUIDIGE een vas.
 *
 * Eers: "die app refresh heeltyd en skop mense uit." Toe 'n vyf-minute-reel.
 * Toe, nadat dit beteken het dat 'n mens die app moet toemaak en oopmaak om
 * iets nuuts te sien: "vergeet di fokken blok en forseer dit. almal kry nou
 * dadelik die nuwe weergawe."
 *
 * Een hek bly: KLANK. 'n Herlaai middel-in 'n stemboodskap is die duurste
 * enkele fout in hierdie app se geskiedenis.
 */
import { magHerlaai } from './herlaaiBesluit.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (kry === wag) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

console.log('\n── Sonder n wagtende weergawe gebeur NIKS ──\n')
is('niks wag',                 magHerlaai({}), false)
is('wagtend: false',           magHerlaai({ wagtend: false }), false)
is('en klank speel ook nie',   magHerlaai({ wagtend: false, speelKlank: false }), false)
is('geen argumente',           magHerlaai(), false)
is('rommel in',                magHerlaai({ wagtend: 'ja' }), true)

console.log('\n── Wag daar een, kom dit DADELIK ──\n')
/* Dit is die hele verandering: geen wagtyd, geen "eers versteek" nie. */
is('wagtend, app op die skerm', magHerlaai({ wagtend: true }), true)
is('wagtend, klank stil',       magHerlaai({ wagtend: true, speelKlank: false }), true)

console.log('\n── Behalwe terwyl klank speel ──\n')
is('n stemboodskap speel', magHerlaai({ wagtend: true, speelKlank: true }), false)
/* 'n Stemboodskap speel dikwels met die skerm af. Daar is dus geen toestand
   waarin klank oorgeslaan mag word nie. */
is('en dit bly so, ongeag wat nog waar is',
   magHerlaai({ wagtend: true, speelKlank: true, herlaaiTans: false }), false)

console.log('\n── En nooit twee keer nie ──\n')
is('n herlaai loop reeds', magHerlaai({ wagtend: true, herlaaiTans: true }), false)
is('selfs met klank stil',  magHerlaai({ wagtend: true, speelKlank: false, herlaaiTans: true }), false)

console.log('\n── Die volgorde van die hekke ──\n')
/* `herlaaiTans` wen oor alles: 'n tweede herlaai terwyl die eerste loop, is 'n
   lus. */
is('herlaaiTans wen oor wagtend', magHerlaai({ wagtend: true, herlaaiTans: true }), false)
is('en klank wen oor wagtend',    magHerlaai({ wagtend: true, speelKlank: true }), false)

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
