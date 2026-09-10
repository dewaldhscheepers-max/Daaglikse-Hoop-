/* Wie sien die "VOLG JESUS het geskuif"-boodskap, en wanneer.
 *
 * Twee foute wat hierdie toets moet keer, en albei is stil:
 *   · dit wys vir iemand wat nooit VOLG JESUS gedoen het nie — 'n opspringer
 *     oor 'n ding waarvan hy nie weet nie;
 *   · dit wys NIE vir die mens wat gister by Dag 3 was nie — en hy dink sy
 *     vordering is weg.
 *
 * Loop met:  node src/data/volgJesusSkuif.toets.mjs
 */
import { magWysSkuif, hetProgramBegin, SLEUTEL } from './volgJesusSkuif.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}

/* 'n Mens wat besig is, op die tuisblad, met niks in die pad nie. */
const BESIG = {
  gesien: false,
  modus: 'solo',
  klaarPerWeek: [[1, 2, 3]],
  oortjie: 'luister',
  klankSpeel: false,
  oorlegOop: false,
}

console.log('\n── Het hierdie mens die program begin ──')
is('hy het solo gekies',   hetProgramBegin('solo', []), true)
is('of by n groep aangesluit', hetProgramBegin('groep', []), true)
is('niks gekies, niks gedoen', hetProgramBegin('', []), false)
/* Die vangnet: 'n ouer weergawe het nie 'n modus geskryf nie, maar sy
   vordering is die bewys. */
is('n dag klaar sonder n modus', hetProgramBegin('', [[1]]), true)
is('n dag in n LATER week tel ook', hetProgramBegin('', [[], [], [4]]), true)
/* Die kaart ken een week; hierdie ken almal. Iemand wat Week 2 klaargemaak het
   en Week 3 nog nie oopgemaak het nie, is steeds besig. */
is('leë weke tel nie',      hetProgramBegin('', [[], [], []]), false)
is('gemors tel nie',        hetProgramBegin('gemors', [null, 'x', 5]), false)
is('niks gooi nie',         hetProgramBegin(null, null), false)
is('n onbeslote modus tel nie', hetProgramBegin('wag', []), false)

console.log('\n── Wanneer dit wys ──')
is('die mens wat besig is', magWysSkuif(BESIG), true)

console.log('\n── En wanneer NIE ──')
is('reeds gesien',          magWysSkuif({ ...BESIG, gesien: true }), false)
is('nooit begin nie',       magWysSkuif({ ...BESIG, modus: '', klaarPerWeek: [] }), false)
/* Die stemboodskap is die app. Niks kom bo-op klank nie. */
is('klank speel',           magWysSkuif({ ...BESIG, klankSpeel: true }), false)
is('n ander skerm is oop',  magWysSkuif({ ...BESIG, oorlegOop: true }), false)
/* Op die e-boekblad staan die kaart reg voor jou — daar sê die boodskap niks. */
is('op die e-boekblad',     magWysSkuif({ ...BESIG, oortjie: 'meer' }), false)
is('op Bid Saam',           magWysSkuif({ ...BESIG, oortjie: 'bidsaam' }), false)
is('op Dra mekaar',         magWysSkuif({ ...BESIG, oortjie: 'sorg' }), false)
is('geen oortjie',          magWysSkuif({ ...BESIG, oortjie: '' }), false)

console.log('\n── Niks gooi nie ──')
is('niks in',               magWysSkuif(), false)
is('n leë voorwerp',        magWysSkuif({}), false)
is('null',                  magWysSkuif(null), false)

console.log('\n── Die merkie ──')
/* Verander hierdie sleutel en elke mens wat die boodskap reeds gesien het,
   sien hom weer. */
is('die sleutel se naam bly', SLEUTEL, 'vj_skuif_gesien')

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
