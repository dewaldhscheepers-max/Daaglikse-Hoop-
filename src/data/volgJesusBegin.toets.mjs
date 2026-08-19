/* "BEGIN HIER" of "GAAN VOORT" op die kaart.
 *
 * Dewald: "wanneer iemand deel is van 'n groep of dit alleen begin doen het,
 * moet dit nie meer wys BEGIN HIER nie. dan moet dit wys GAAN VOORT."
 *
 * Dit het aan `vj_my_week` gehang, en daardie getal skuif eers wanneer 'n mens
 * 'n hele WEEK klaarmaak. Iemand op Dag 3 het dus steeds "BEGIN HIER" gesien.
 */
import { hetBegin, kaartWeek, MODUSSE } from './volgJesusBegin.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

console.log('\n── Wie het begin ──\n')
is('wie alleen begin het', hetBegin('solo'), true)
is('wie in n groep is', hetBegin('groep'), true)
is('en dit is presies daardie twee', MODUSSE, ['solo', 'groep'])

console.log('\n── Wie NIE begin het nie ──\n')
for (const m of ['', null, undefined, 'wag', 'onbeslis', 'SOLO', 'groepie', 0, {}]) {
  is(`${JSON.stringify(m)} het nog nie begin nie`, hetBegin(m), false)
}

console.log('\n── Die vangnet: n dag klaar sonder n modus ──\n')
/* Iemand kan 'n dag klaargemaak het op 'n ouer weergawe wat nog nie 'n modus
   geskryf het nie. Sy vordering is dan die bewys. */
is('een dag klaar tel', hetBegin('', [1]), true)
is('vyf dae ook', hetBegin('', [1, 2, 3, 4, 5]), true)
is('n lee lys nie', hetBegin('', []), false)
is('en rommel nie', hetBegin('', 'nee'), false)

console.log('\n── Wat die kaart wys ──\n')
is('wie nog nie begin het nie, kry NIKS — dus "BEGIN HIER"',
   kaartWeek({ modus: '', klaarDae: [], nommer: 1, titel: 'Wie sê jý is Jesus?' }), null)
is('wie alleen begin het, kry sy week — dus "GAAN VOORT"',
   kaartWeek({ modus: 'solo', nommer: 1, titel: 'Wie sê jý is Jesus?' }),
   { nommer: 1, titel: 'Wie sê jý is Jesus?' })
is('n groeplid ook',
   kaartWeek({ modus: 'groep', nommer: 3, titel: 'Derde' }),
   { nommer: 3, titel: 'Derde' })
is('sonder n titel bly dit n string',
   kaartWeek({ modus: 'solo', nommer: 2 }), { nommer: 2, titel: '' })

console.log('\n── n Onmoontlike week wys NIKS ──\n')
/* Eerder "BEGIN HIER" as "Week 0 van 52" of "Week NaN". 'n Kaart wat rommel
   wys, is erger as een wat te beskeie is. */
for (const n of [0, -1, 53, 1.5, null, undefined, 'een', NaN]) {
  is(`week ${JSON.stringify(n)} gee niks`, kaartWeek({ modus: 'solo', nommer: n }), null)
}
is('en 52 werk wel', kaartWeek({ modus: 'solo', nommer: 52 }), { nommer: 52, titel: '' })

console.log('\n── Niks val om op rommel nie ──\n')
is('geen invoer', kaartWeek(), null)
is('n lee voorwerp', kaartWeek({}), null)

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
