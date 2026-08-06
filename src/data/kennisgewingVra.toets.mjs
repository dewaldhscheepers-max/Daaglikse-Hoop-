/* Loop met:  node src/data/kennisgewingVra.toets.mjs */

import {
  magVra, wysPadTerug, blaaierSoort, telVerandering,
  MAKS_KERE, DAE_TUSSENIN,
} from './kennisgewingVra.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`) }
}

const DAG = 24 * 60 * 60 * 1000
const NOU = Date.parse('2026-08-07T06:00:00Z')

console.log('\n── Wie ons vra ──')
is('nog nooit gevra, nog nie geantwoord',
  magVra({ toestemming: 'default', kere: 0, laas: 0, nou: NOU }), true)
is('reeds ja gesê — daar is niks om te vra nie',
  magVra({ toestemming: 'granted', kere: 0, laas: 0, nou: NOU }), false)

/* Die belangrikste een in hierdie lêer. 'n Vraag aan iemand wat geblokkeer
   het, wys NIKS — die blaaier antwoord dadelik 'denied'. Die knoppie sou dus
   lyk of hy stukkend is. */
is('reeds geblokkeer — moenie vra nie, dit sou niks doen',
  magVra({ toestemming: 'denied', kere: 0, laas: 0, nou: NOU }), false)

is('\'n blaaier wat dit nie ken nie',
  magVra({ toestemming: undefined, kere: 0, laas: 0, nou: NOU }), false)

console.log('\n── Die week tussenin ──')
is('gister weggedruk — nie weer nie',
  magVra({ toestemming: 'default', kere: 1, laas: NOU - 1 * DAG, nou: NOU }), false)
is('ses dae gelede — nog nie',
  magVra({ toestemming: 'default', kere: 1, laas: NOU - 6 * DAG, nou: NOU }), false)
is('presies sewe dae — nou mag ons',
  magVra({ toestemming: 'default', kere: 1, laas: NOU - DAE_TUSSENIN * DAG, nou: NOU }), true)
is('agt dae',
  magVra({ toestemming: 'default', kere: 1, laas: NOU - 8 * DAG, nou: NOU }), true)

console.log('\n── Drie keer, en dan hou dit op ──')
is('tweede keer mag',
  magVra({ toestemming: 'default', kere: 2, laas: NOU - 30 * DAG, nou: NOU }), true)
is('ná drie keer nooit weer nie, hoe lank ook al',
  magVra({ toestemming: 'default', kere: MAKS_KERE, laas: NOU - 365 * DAG, nou: NOU }), false)

console.log('\n── Die pad terug ──')
is('wys net vir wie geblokkeer het', wysPadTerug('denied'), true)
is('nie vir wie nog kan antwoord nie',  wysPadTerug('default'), false)
is('en nie vir wie reeds ja gesê het nie', wysPadTerug('granted'), false)

console.log('\n── Watter stappe ──')
is('Samsung', blaaierSoort('Mozilla/5.0 (Linux; Android 14) SamsungBrowser/23.0 Chrome/115'), 'samsung')
/* Facebook se in-app blaaier op Android sê OOK "Chrome" in sy user agent.
   Sou ons eers vir Chrome getoets het, sou elke Facebook-mens die verkeerde
   stappe gekry het — en Facebook s'n is die enigste geval waar die antwoord
   "maak dit in 'n regte blaaier oop" is. */
is('Facebook, al sê hy Chrome', blaaierSoort('Mozilla/5.0 (Linux; Android 13) Chrome/120 [FB_IAB/FB4A;]'), 'facebook')
is('iPhone', blaaierSoort('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Version/17.0 Safari'), 'ios')
is('gewone Chrome', blaaierSoort('Mozilla/5.0 (Linux; Android 14) Chrome/120 Mobile Safari'), 'chrome')

console.log('\n── Die anonieme teller ──')
is('eerste keer: tel die nuwe, trek niks af',
  telVerandering({ toestemming: 'default', laasGetel: '' }), { nuwe: 'default', oue: '' })
is('niks verander nie — moenie weer tel nie',
  telVerandering({ toestemming: 'granted', laasGetel: 'granted' }), null)
is('van nog-nie na ja: tel om',
  telVerandering({ toestemming: 'granted', laasGetel: 'default' }), { nuwe: 'granted', oue: 'default' })
is('van nog-nie na geblokkeer',
  telVerandering({ toestemming: 'denied', laasGetel: 'default' }), { nuwe: 'denied', oue: 'default' })
is('gemors in localStorage word geïgnoreer',
  telVerandering({ toestemming: 'granted', laasGetel: 'aaaa' }), { nuwe: 'granted', oue: '' })
is('en \'n onbekende toestemming word nooit getel nie',
  telVerandering({ toestemming: 'wat', laasGetel: '' }), null)

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
