/* Wie hoor dat die speletjies geskuif het.
 *
 * Dieselfde toets as `volgJesusSkuif.toets.mjs`, en om dieselfde rede: die
 * skuif self is maklik, maar die mens wat gister op Vredepad was en môre 'n
 * oortjie soek wat nie meer daar is nie, is die een wat ons verloor.
 *
 * Die reël wat die maklikste stilweg breek, is die EERSTE een: iemand wat nooit
 * gespeel het nie, mag nie 'n opspringer kry oor iets waarvan hy niks weet nie.
 *
 * Loop met:  node src/data/speelSkuif.toets.mjs
 */
import { magWysSkuif, hetGespeel, SLEUTEL, SPEEL_SLEUTELS } from './speelSkuif.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}

/* 'n Mens wat gespeel het, op Luister, met niks in die pad nie. */
const SPELER = {
  gesien: false,
  gevind: ['{"vlak":3}'],
  oortjie: 'luister',
  klankSpeel: false,
  oorlegOop: false,
}

console.log('\n── Het hierdie mens gespeel? ──')
is('n gestoorde lopie',   hetGespeel(['{"vlak":3}']), true)
is('n enkele merkie',     hetGespeel(['1']), true)
is('meer as een sleutel', hetGespeel(['', '1']), true)
is('niks gevind',         hetGespeel([]), false)
is('n lee string',        hetGespeel(['']), false)
is('net spasies',         hetGespeel(['   ']), false)
/* Dit gebeur werklik: 'n skerm stoor homself een keer sonder dat iemand
   gespeel het. 'n Leë lys is nie bewys nie. */
is('n lee lys',           hetGespeel(['[]']), false)
is('n lee voorwerp',      hetGespeel(['{}']), false)
is('die woord null',      hetGespeel(['null']), false)
is('n egte null',         hetGespeel([null]), false)
is('undefined',           hetGespeel([undefined]), false)
is('nie n lys nie',       hetGespeel('abc'), false)
is('null in',             hetGespeel(null), false)
is('niks in',             hetGespeel(), false)

console.log('\n── Wie die boodskap kry ──')
is('n mens wat gespeel het', magWysSkuif(SPELER), true)

console.log('\n── En wie NIE ──')
is('wat nooit gespeel het nie', magWysSkuif({ ...SPELER, gevind: [] }), false)
is('wat dit reeds gesien het',  magWysSkuif({ ...SPELER, gesien: true }), false)
is('op die e-boekblad',         magWysSkuif({ ...SPELER, oortjie: 'meer' }), false)
is('op Bid Saam',               magWysSkuif({ ...SPELER, oortjie: 'bidsaam' }), false)
is('op Reels self',             magWysSkuif({ ...SPELER, oortjie: 'reels' }), false)
is('sonder n oortjie',          magWysSkuif({ ...SPELER, oortjie: '' }), false)
is('terwyl klank speel',        magWysSkuif({ ...SPELER, klankSpeel: true }), false)
is('terwyl n skerm oop is',     magWysSkuif({ ...SPELER, oorlegOop: true }), false)
is('niks in',                   magWysSkuif(), false)
is('n lee voorwerp',            magWysSkuif({}), false)
is('null',                      magWysSkuif(null), false)

console.log('\n── "Al gesien" wen oor alles ──')
/* Dit moet die eerste hek wees. 'n Opspringer wat elke dag terugkom, is 'n
   straf, en dit is presies die soort ding wat terugsluip wanneer die volgorde
   van die hekke verander. */
for (const oortjie of ['luister', 'meer', 'bidsaam']) {
  for (const klankSpeel of [true, false]) {
    is(`gesien op ${oortjie} (klank=${klankSpeel})`,
       magWysSkuif({ ...SPELER, gesien: true, oortjie, klankSpeel }), false)
  }
}

console.log('\n── Elke speletjie se sleutel staan op EEN plek ──')
/* Word 'n speletjie bygevoeg, kom sy sleutel hier by. Staan hy nêrens, hoor sy
   spelers nooit dat die oortjie geskuif het nie. */
is('Vredepad',    SPEEL_SLEUTELS.includes('vredepad_data'), true)
is('Bou die Ark', SPEEL_SLEUTELS.includes('ark_stoor'), true)
is('Vrugtefees',  SPEEL_SLEUTELS.includes('vf_vordering'), true)
is('geen duplikate', SPEEL_SLEUTELS.length, new Set(SPEEL_SLEUTELS).size)
is('almal is stringe', SPEEL_SLEUTELS.every(k => typeof k === 'string' && k.trim()), true)
/* Die merkie mag nooit een van die speletjies s'n wees nie — dan vee ons sy
   vordering uit of lees ons ons eie merkie as "hy het gespeel". */
is('die merkie is apart', SPEEL_SLEUTELS.includes(SLEUTEL), false)

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
