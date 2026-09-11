/* Wat met die opspringer gebeur nadat Vandag se Tyd met God toemaak.
 *
 * Die fout wat hierdie toets moet keer, is die een wat dit veroorsaak het: die
 * trouste mense — dié wat die vloei ELKE dag doen — het nooit weer 'n nuwe
 * e-boek of 'n donasievraag gesien nie, want klaarmaak het die dag as gevra
 * gemerk.
 *
 * En die reël wat NIE mag skuif nie: wie woorde in die gebedskassie getik het,
 * hoor vandag niks oor geld nie.
 *
 * Loop met:  node src/data/tmgPopup.toets.mjs
 */
import { naTydMetGod, UITKOMSTE } from './tmgPopup.js'
import { magVraGeld, leegStaat } from './tydMetGod.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}

console.log('\n── Klaargemaak: die opspringer gaan DEUR ──')
/* Dit is die hele verandering. Dit was 'stil'. */
is('klaargemaak, niks getik', naTydMetGod({ voltooi: true, magGeld: true }), 'wys')

console.log('\n── Maar nooit op n dag wat hy WOORDE getik het nie ──')
is('klaargemaak, maar hy het getik', naTydMetGod({ voltooi: true, magGeld: false }), 'stil')
is('halfpad uit, en hy het getik',   naTydMetGod({ voltooi: false, magGeld: false }), 'stil')

console.log('\n── Halfpad uitgeklim ──')
/* 'n Opspringer op pad uit is 'n straf. En die dag word NIE gemerk nie — kom hy
   later terug en maak klaar, mag dit dan wys. */
is('halfpad uit', naTydMetGod({ voltooi: false, magGeld: true }), 'niks')

console.log('\n── Hy is REEDS vandag gevra ──')
/* Hy het 'n skenk-knoppie op die klaar-skerm gedruk. Twee geldvrae ná mekaar
   is presies wat hierdie app nie doen nie. */
is('reeds gevra, klaargemaak', naTydMetGod({ voltooi: true, magGeld: true, reedsGevra: true }), 'stil')
is('reeds gevra, halfpad uit', naTydMetGod({ voltooi: false, magGeld: true, reedsGevra: true }), 'stil')
is('reeds gevra wen oor alles', naTydMetGod({ voltooi: true, magGeld: false, reedsGevra: true }), 'stil')

console.log('\n── Niks gooi nie ──')
is('niks in',        naTydMetGod(), 'stil')
is('n leë voorwerp', naTydMetGod({}), 'stil')
is('null',           naTydMetGod(null), 'stil')
/* Dit is die veilige kant om op te fouteer: sonder inligting word daar NIE
   oor geld gepraat nie. */

console.log('\n── Elke antwoord is een van drie ──')
for (const voltooi of [true, false]) {
  for (const magGeld of [true, false]) {
    for (const reedsGevra of [true, false]) {
      const uit = naTydMetGod({ voltooi, magGeld, reedsGevra })
      is(`v=${voltooi} g=${magGeld} r=${reedsGevra} gee n geldige antwoord`,
         UITKOMSTE.includes(uit), true)
    }
  }
}
is('drie uitkomste', UITKOMSTE, ['wys', 'stil', 'niks'])

console.log('\n── En dit hang aan DIESELFDE hek as die vloei self ──')
/* `magVraGeld` is die een plek waar "hy het getik" oor geld besluit. Loop die
   twee uitmekaar, praat die app oor geld op presies die dag wat dit nie moet
   nie. */
{
  const getik   = { ...leegStaat(), getik: true, hart: true }
  const nieGetik = { ...leegStaat(), hart: true }
  is('wie getik het, mag nie gevra word nie', magVraGeld(getik), false)
  is('en die opspringer bly stil',
     naTydMetGod({ voltooi: true, magGeld: magVraGeld(getik) }), 'stil')
  is('wie sy hart gebring het sonder woorde, mag', magVraGeld(nieGetik), true)
  is('en dan gaan die opspringer deur',
     naTydMetGod({ voltooi: true, magGeld: magVraGeld(nieGetik) }), 'wys')
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
