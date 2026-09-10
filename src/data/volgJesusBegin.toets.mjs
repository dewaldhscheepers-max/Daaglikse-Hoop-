/* "BEGIN HIER" of "GAAN VOORT" op die kaart.
 *
 * Dewald: "wanneer iemand deel is van 'n groep of dit alleen begin doen het,
 * moet dit nie meer wys BEGIN HIER nie. dan moet dit wys GAAN VOORT."
 *
 * Dit het aan `vj_my_week` gehang, en daardie getal skuif eers wanneer 'n mens
 * 'n hele WEEK klaarmaak. Iemand op Dag 3 het dus steeds "BEGIN HIER" gesien.
 */
import { hetBegin, kaartWeek, kaartKeuse, weekVoltooi, MODUSSE } from './volgJesusBegin.js'

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

const waar = (n, k) => is(n, !!k, true)

console.log('\n── Is n hele week klaar ──\n')
is('al vyf dae', weekVoltooi([1, 2, 3, 4, 5]), true)
is('in enige volgorde', weekVoltooi([5, 3, 1, 4, 2]), true)
is('ook as hulle stringe is', weekVoltooi(['1', '2', '3', '4', '5']), true)
is('vier dae is nie klaar nie', weekVoltooi([1, 2, 3, 4]), false)
is('n leë lys ook nie', weekVoltooi([]), false)
is('en rommel nie', weekVoltooi('alles'), false)
is('n dag wat twee keer tel, tel steeds een keer', weekVoltooi([1, 1, 2, 3, 4]), false)

console.log('\n── WATTER week die kaart wys ──\n')
/* 10 September 2026, met n skermkiekie: "week 4 klaar maar kaart wys nog
   week 4." Die kaart het GAAN VOORT gewys op n week wat hy klaar had. */
{
  /* Geval 1: Week 5 is nog NIE gepubliseer nie. Hy wag. */
  const k = kaartKeuse({
    myne: 5, nommers: [1, 2, 3, 4],
    klaarPerWeek: { 4: [1, 2, 3, 4, 5] }, modus: 'solo',
  })
  is('dit bly by die laaste gepubliseerde week', k.nommer, 4)
  is('maar dit WEET hy wag', k.wag, true)
  is('en dit weet watter week kom', k.volgende, 5)
}
{
  /* Geval 2: Week 5 IS gepubliseer, maar `vj_my_week` het agtergebly — n ou
     weergawe, n foon wat halfpad toegemaak het. Die merkies is die waarheid. */
  const k = kaartKeuse({
    myne: 4, nommers: [1, 2, 3, 4, 5],
    klaarPerWeek: { 4: [1, 2, 3, 4, 5] }, modus: 'solo',
  })
  is('die kaart stel homself reg', k.nommer, 5)
  is('en hy wag nie', k.wag, false)
}
{
  /* Twee weke agter: die selfregstelling loop deur albei. */
  const k = kaartKeuse({
    myne: 3, nommers: [1, 2, 3, 4, 5],
    klaarPerWeek: { 3: [1, 2, 3, 4, 5], 4: [1, 2, 3, 4, 5] }, modus: 'solo',
  })
  is('dit loop tot by die eerste onvoltooide week', k.nommer, 5)
}
{
  const k = kaartKeuse({
    myne: 4, nommers: [1, 2, 3, 4],
    klaarPerWeek: { 4: [1, 2, 3] }, modus: 'solo',
  })
  is('halfpad deur n week bly dit daardie week', k.nommer, 4)
  is('en hy wag nie', k.wag, false)
}
{
  const k = kaartKeuse({
    myne: 1, nommers: [1], klaarPerWeek: {}, modus: '',
  })
  is('wie nog nooit begin het nie, kry week 1', k.nommer, 1)
  is('en die kaart weet hy het nie begin nie', k.begin, false)
}

console.log('\n── Waar die kaart NIKS wys nie ──\n')
is('niks gepubliseer', kaartKeuse({ myne: 1, nommers: [], klaarPerWeek: {}, modus: 'solo' }), null)
is('n gat in die publikasie (week 1 ontbreek)',
   kaartKeuse({ myne: 1, nommers: [2, 3], klaarPerWeek: {}, modus: 'solo' }), null)
is('niks in', kaartKeuse(), null)
is('rommel in', kaartKeuse({ myne: 'x', nommers: 'nee', klaarPerWeek: null, modus: 5 }), null)

console.log('\n── Die perke ──\n')
{
  /* Week 9 voor week 5 gepubliseer: die program loop AANEENLOPEND, dus tel hy
     nie. Dieselfde reël as kiesWeek() s'n. */
  const k = kaartKeuse({ myne: 9, nommers: [1, 2, 9], klaarPerWeek: {}, modus: 'solo' })
  is('n week wat te ver voor is, tel nie', k.nommer, 2)
}
{
  /* Al 52 klaar: daar is geen week 53 om te belowe nie. */
  const nommers = Array.from({ length: 52 }, (_, i) => i + 1)
  const klaarPerWeek = {}
  for (const n of nommers) klaarPerWeek[n] = [1, 2, 3, 4, 5]
  const k = kaartKeuse({ myne: 52, nommers, klaarPerWeek, modus: 'solo' })
  is('dit bly by week 52', k.nommer, 52)
  is('dit wag', k.wag, true)
  is('maar dit belowe geen week 53 nie', k.volgende, null)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
