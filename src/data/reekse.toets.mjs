/* Watter reekse bestaan, en hoe 'n mens keer dat een reeks twee word.
 *
 * Loop met:  node src/data/reekse.toets.mjs
 */
import { reeksSleutel, reekseUit, stelReeksGelyk } from './reekse.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}
const waar = (n, k) => is(n, !!k, true)

const GEJAAGD = 'Gejaagdheid, druk en uitbranding'

console.log('\n── Die reekse uit die notas ──')
is('een reeks', reekseUit([{ series: GEJAAGD }]), [GEJAAGD])
is('twee, alfabeties', reekseUit([{ series: 'Vergifnis' }, { series: GEJAAGD }]),
   [GEJAAGD, 'Vergifnis'])
is('dieselfde reeks twee keer tel een keer',
   reekseUit([{ series: GEJAAGD }, { series: GEJAAGD }]), [GEJAAGD])
is('n nota sonder reeks tel nie', reekseUit([{ series: '' }, { series: '   ' }, {}]), [])
is('geen notas', reekseUit([]), [])
is('en niks wat n lys is nie, gooi nie', reekseUit(null), [])
is('ook nie n nota wat null is nie', reekseUit([null, { series: 'A' }]), ['A'])

console.log('\n── Die HEK: een reeks mag nie twee word nie ──')
/* Dit is die hele punt van hierdie leer. Firestore sien twee stringe; 'n mens
   sien een reeks met die verkeerde helfte daarin. */
is('ander kas is DIESELFDE reeks',
   reekseUit([{ series: GEJAAGD }, { series: GEJAAGD.toUpperCase() }]), [GEJAAGD])
is('los spasies ook',
   reekseUit([{ series: GEJAAGD }, { series: `  ${GEJAAGD}  ` }]), [GEJAAGD])
is('en n dubbele spasie binne-in',
   reekseUit([{ series: 'Gejaagdheid,  druk en uitbranding' }, { series: GEJAAGD }]),
   ['Gejaagdheid, druk en uitbranding'])
/* Die EERSTE spelling wen. Die notas kom nuutste-eerste, dus is dit die een
   wat hy die laaste getik het. */
is('die eerste spelling wen',
   reekseUit([{ series: GEJAAGD.toUpperCase() }, { series: GEJAAGD }]),
   [GEJAAGD.toUpperCase()])

console.log('\n── Die sleutel self ──')
is('kas maak nie saak nie', reeksSleutel('ABC'), reeksSleutel('abc'))
is('spasies ook nie', reeksSleutel('  a  b  '), 'a b')
is('leeg bly leeg', reeksSleutel(''), '')
is('null gooi nie', reeksSleutel(null), '')
is('n getal ook nie', reeksSleutel(7), '7')
/* Twee WERKLIK verskillende reekse mag nooit saamsmelt nie. */
waar('verskillende reekse bly verskillend',
     reeksSleutel('Vergifnis') !== reeksSleutel(GEJAAGD))

console.log('\n── Tik hy dit half oor, kry hy die bestaande naam ──')
is('presies dieselfde', stelReeksGelyk(GEJAAGD, [GEJAAGD]), GEJAAGD)
is('ander kas gee die BESTAANDE spelling terug',
   stelReeksGelyk(GEJAAGD.toLowerCase(), [GEJAAGD]), GEJAAGD)
is('los spasies ook', stelReeksGelyk(`  ${GEJAAGD} `, [GEJAAGD]), GEJAAGD)
is('n nuwe naam bly sy eie', stelReeksGelyk('Iets nuuts', [GEJAAGD]), 'Iets nuuts')
is('maar netjies afgerond', stelReeksGelyk('  Iets  nuuts ', []), 'Iets nuuts')
is('leeg bly leeg', stelReeksGelyk('', [GEJAAGD]), '')
is('en niks gooi op gemors nie', stelReeksGelyk(null, null), '')

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
