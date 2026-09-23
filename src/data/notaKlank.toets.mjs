/* Het hierdie nota klank?
 *
 * Dewald, 24 September 2026: "hoekom play vandag se stemnota nou nie... ek app
 * oop en toe gmaak dit speel nogsteeds nie."
 *
 *   node src/data/notaKlank.toets.mjs
 */
import { hetKlank, GEEN_KLANK } from './notaKlank.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}

console.log('\n── n Nota MET klank ──')
is('n gewone adres', hetKlank({ audioUrl: 'https://voorbeeld.test/a.mp3' }), true)
is('n relatiewe pad', hetKlank({ audioUrl: '/audio/a.mp3' }), true)

console.log('\n── En SONDER ──')
{
  /* Dit is die geval wat niks gese het nie: die knoppie draai om na n
     pouse-ikoon en niks speel, vir ewig. */
  is('geen veld', hetKlank({ title: 'x' }), false)
  is('n lee string', hetKlank({ audioUrl: '' }), false)
  is('net spasies', hetKlank({ audioUrl: '   ' }), false)
  is('null', hetKlank({ audioUrl: null }), false)
  /* Dit gebeur wanneer n lee veld deur String() gaan — dan is die ADRES
     letterlik die woord "undefined" en die blaaier haal n 404. */
  is('die string "undefined"', hetKlank({ audioUrl: 'undefined' }), false)
  is('die string "null"', hetKlank({ audioUrl: 'null' }), false)
}

console.log('\n── Gemors breek dit nie ──')
is('niks in', hetKlank(), false)
is('null in', hetKlank(null), false)
is('n string in plaas van n nota', hetKlank('nee'), false)
is('n lee voorwerp', hetKlank({}), false)

console.log('\n── Die woorde se wat waar is ──')
{
  /* Dit is nie n "probeer weer"-geval nie — daar is niks om weer te probeer. */
  is('dit belowe niks', /probeer weer/i.test(GEEN_KLANK), false)
  is('dit se dat die KLANK kort', /klank/i.test(GEEN_KLANK), true)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
