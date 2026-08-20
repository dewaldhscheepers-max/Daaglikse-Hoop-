/* Watter adres agter die groepchat mag staan.
 *
 * Dit word in 'n CSS `url("...")` gesit. 'n Aanhaling of 'n hakie daarin is hoe
 * 'n prent stil verdwyn — of erger, hoe iemand iets anders in die styl inspuit.
 * Die adres kom uit Firestore, en Firestore-inhoud word deur 'n MENS geskryf.
 */
import { keurAdres } from './vjChatPrent.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

const FB = 'https://firebasestorage.googleapis.com/v0/b/daaglikse-hoop.firebasestorage.app'
  + '/o/covers%2Fvj-chat-agtergrond-1.webp?alt=media&token=abc-123'

console.log('\n── Wat deur mag ──\n')
is('n egte Firebase-adres', keurAdres(FB), FB)
is('met spasies om', keurAdres(`  ${FB}  `), FB)

console.log('\n── Geen agtergrond is n GELDIGE antwoord ──\n')
/* Die chat werk sonder een. 'n Lee waarde is nie 'n fout nie. */
for (const leeg of ['', '   ', null, undefined]) {
  is(`${JSON.stringify(leeg)} gee niks`, keurAdres(leeg), '')
}

console.log('\n── Net https ──\n')
for (const sleg of [
  'http://x/y.jpg',
  '//x/y.jpg',
  'javascript:alert(1)',
  'data:image/png;base64,iVBORw0KGgo=',
  '/beelde/x.jpg',
]) {
  is(`${JSON.stringify(sleg)} word geweier`, keurAdres(sleg), '')
}

console.log('\n── Niks wat die CSS kan breek ──\n')
/* Hierdie is die belangrikste toets. `url("...")` word gebou met hierdie
   string in; 'n aanhaling sluit dit vroeg af. */
for (const sleg of [
  'https://x/y.jpg")',
  'https://x/y.jpg\');background:red;/*',
  'https://x/y(1).jpg',
  'https://x/y.jpg;}',
  'https://x/ y.jpg',
  'https://x/y.jpg\\',
]) {
  is(`${JSON.stringify(sleg)} word geweier`, keurAdres(sleg), '')
}
is('n nuwe reel ook', keurAdres('https://x/y.jpg\nbackground:red'), '')

console.log('\n── Rommel ──\n')
for (const sleg of [{}, [], 0, true, 42]) {
  is(`${JSON.stringify(sleg)} gee niks`, keurAdres(sleg), '')
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
