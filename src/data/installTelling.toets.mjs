/* Loop met:  node src/data/installTelling.toets.mjs

   Die afronding van die installasie-telling. Klein logika, maar dit staan op
   'n blad wat mense moet oorreed — 'n getal wat verkeerd afrond, maak van
   "meer as" 'n leuen. */

import { rondAf, metSpasies } from './installTelling.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (kry === wag) reg++
  else { val++; console.log(`  VAL  ${naam} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

console.log('\n── Altyd AF, sodat "meer as" waar bly ──')
is('6407 → 6400', rondAf(6407), 6400)
is('6400 → 6400', rondAf(6400), 6400)
is('6499 → 6400', rondAf(6499), 6400)
/* Die belangrikste een: 6499 mag NOOIT 6500 word nie. Dan sê die blad "meer
   as 6 500" terwyl daar 6 499 is, en die een sin wat 'n mens moet kan
   verdedig, is dan onwaar. */
is('6501 → 6500', rondAf(6501), 6500)
is('12345 → 12300', rondAf(12345), 12300)

console.log('\n── Onder duisend wys ons niks ──')
/* 'n Swak getal oorreed niemand nie, en afronding maak dit nog kleiner:
   940 sou "meer as 900" word. Beter om stil te bly. */
is('999 → niks', rondAf(999), 0)
is('940 → niks', rondAf(940), 0)
is('1000 → 1000', rondAf(1000), 1000)
is('0 → niks', rondAf(0), 0)
is('leeg → niks', rondAf(undefined), 0)
is('null → niks', rondAf(null), 0)

console.log('\n── Spasies, soos \'n mens dit skryf ──')
is('6400', metSpasies(6400), '6 400')
is('900', metSpasies(900), '900')
is('12300', metSpasies(12300), '12 300')
is('1000000', metSpasies(1000000), '1 000 000')

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
