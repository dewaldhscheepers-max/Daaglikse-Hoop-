/* Die gebedskaart in die voer: wanneer hy staan, waar hy staan, en wanneer die
 * ondersteuner-reël van hom af weg is.
 *
 * Dewald, 14 September 2026: EEN kaart, een keer per dag, ná die 5de clip,
 * waarby 'n mens net so verby kan swiep — en *"net as ek op deel
 * gebedsversoek kliek"* navigeer.
 *
 * Die duurste reël hier is die LAASTE blok: 'n mens wat vandag reeds in 'n
 * gebedskassie getik het, mag nie oor geld gevra word nie. Dit is die app se
 * eie reël en dit is die een wat 'n mens per ongeluk weggooi wanneer 'n kaart
 * "net 'n klein reëltjie onder" bykry.
 *
 *   node src/data/reelsGebed.toets.mjs
 */
import {
  NA_KLIPS, GEBED_DAG, dagVan, magWysGebed, magWysSteun, voegGebedIn,
} from './reelsGebed.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}

const VANDAG = '2026-09-14'
const GISTER = '2026-09-13'

function klips(n) {
  return Array.from({ length: n }, (_, i) => ({ tipe: 'klip', klip: { id: `k${i}` } }))
}

console.log('\n── Die dag ──')
/* Dieselfde vorm as `lastPopupDate` s'n, anders beteken "vandag" twee dinge. */
is('n Date in',        dagVan(new Date('2026-09-14T08:00:00Z')), VANDAG)
is('n getal in',       dagVan(Date.parse('2026-09-14T08:00:00Z')), VANDAG)
is('n string in',      dagVan('2026-09-14T23:59:00Z'), VANDAG)
is('gemors gee niks',  dagVan('nee'), '')

console.log('\n── Een keer per DAG ──')
is('nog nooit gewys',      magWysGebed({ vandag: VANDAG, laasGewys: '' }), true)
is('gister gewys',         magWysGebed({ vandag: VANDAG, laasGewys: GISTER }), true)
is('VANDAG reeds gewys',   magWysGebed({ vandag: VANDAG, laasGewys: VANDAG }), false)
is('geen dag: nooit',      magWysGebed({ vandag: '', laasGewys: '' }), false)
is('niks in',              magWysGebed(), false)

console.log('\n── Die VREEMDELING op n gedeelde skakel ──')
/* Sy word reeds gevra om te installeer. Twee volskerm-vrae op een besoek is 'n
   tolhek, en sy het op ÉÉN ding gedruk om ÉÉN video te sien. */
is('n gedeelde skakel: nooit',
  magWysGebed({ vandag: VANDAG, laasGewys: '', gedeel: true }), false)
is('en dit wen bo alles',
  magWysGebed({ vandag: VANDAG, laasGewys: GISTER, gedeel: true }), false)

console.log('\n── Die ondersteuner-reël ──')
is('n gewone dag',        magWysSteun({ vandag: VANDAG, dagGevra: '' }), true)
is('gister gevra',        magWysSteun({ vandag: VANDAG, dagGevra: GISTER }), true)
/* Sy het vanoggend deur Tyd met God gegaan en in die gebedskassie getik. Dan
   praat hierdie app vandag glad nie oor geld nie. */
is('VANDAG reeds gevra',  magWysSteun({ vandag: VANDAG, dagGevra: VANDAG }), false)
is('geen dag: nooit',     magWysSteun({ vandag: '', dagGevra: '' }), false)
is('niks in',             magWysSteun(), false)

/* En die kaart self BLY — die uitnodiging om te bid is nie 'n geldvraag nie. */
is('die KAART bly staan op so n dag',
  magWysGebed({ vandag: VANDAG, laasGewys: GISTER }), true)

console.log('\n── Waar die kaart staan ──')
{
  const uit = voegGebedIn(klips(20), { wys: true })
  is('daar is presies EEN kaart', uit.filter(i => i.tipe === 'gebed').length, 1)
  is('hy staan ná die 5de clip', uit.findIndex(i => i.tipe === 'gebed'), NA_KLIPS)
  is('die vyf voor hom is clips', uit.slice(0, NA_KLIPS).every(i => i.tipe === 'klip'), true)
  is('en niks is weg nie', uit.filter(i => i.tipe === 'klip').length, 20)
  is('die volgorde van die clips bly', uit.filter(i => i.tipe === 'klip').map(i => i.klip.id),
    klips(20).map(i => i.klip.id))
}
{
  const in_ = klips(20)
  voegGebedIn(in_, { wys: true })
  is('die INSET word nie aangeraak nie', in_.length, 20)
}
is('n eie plek werk ook',
  voegGebedIn(klips(20), { wys: true, na: 3 }).findIndex(i => i.tipe === 'gebed'), 3)

console.log('\n── Wanneer hy NIE ingevoeg word nie ──')
is('wys: false',   voegGebedIn(klips(20), { wys: false }).length, 20)
is('geen opsies',  voegGebedIn(klips(20)).length, 20)
/* 'n Kaart heel onderaan is 'n doodloopstraat: sy swiep verby en daar is niks.
   Die hele punt is dat 'n mens hom net so mag verbygaan. */
is('presies 5 clips: geen kaart',
  voegGebedIn(klips(5), { wys: true }).some(i => i.tipe === 'gebed'), false)
is('4 clips: geen kaart',
  voegGebedIn(klips(4), { wys: true }).some(i => i.tipe === 'gebed'), false)
is('6 clips: WEL n kaart',
  voegGebedIn(klips(6), { wys: true }).some(i => i.tipe === 'gebed'), true)
is('en dan is daar nog een ná hom',
  voegGebedIn(klips(6), { wys: true }).slice(NA_KLIPS + 1).length, 1)
is('n lee voer',   voegGebedIn([], { wys: true }), [])
is('gemors in',    voegGebedIn(null, { wys: true }), [])

console.log('\n── Die sleutel ──')
/* Verander hierdie naam en elke foon wat vandag die kaart gesien het, sien hom
   vandag weer. */
is('die bergingsleutel staan vas', GEBED_DAG, 'reels_gebed_dag')
is('en die plek ook', NA_KLIPS, 5)

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
