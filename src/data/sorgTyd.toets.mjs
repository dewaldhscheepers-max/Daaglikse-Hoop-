/* "3 u" in plaas van "6 Augustus", en 'n kring wat verskil.
 *
 * Dewald: "vergelyk dit teen facebook se comments."
 *
 * Die twee dinge wat hier getoets word, is die twee wat 'n mens die
 * vinnigste weer verloor: die leer se rande (nou / gister / die datum wat
 * terugkom) en die belofte dat 'n kleur STABIEL is.
 */
import { gelede, kringKleur, naMs, KRINGE } from './sorgTyd.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)

/* 'n Vaste "nou": 23 Augustus 2026, 14:00 SAST = 12:00 UTC. */
const NOU = Date.parse('2026-08-23T12:00:00Z')
const min = n => new Date(NOU - n * 60000).toISOString()
const uur = n => new Date(NOU - n * 3600000).toISOString()
const dae = n => new Date(NOU - n * 86400000).toISOString()

console.log('\n── Die leer, soos Facebook s\'n ──\n')
{
  is('pas nou', gelede(min(0), NOU), 'nou')
  is('30 sekondes is nog nou', gelede(new Date(NOU - 30000).toISOString(), NOU), 'nou')
  is('een minuut', gelede(min(1), NOU), '1 min')
  is('vyf minute', gelede(min(5), NOU), '5 min')
  is('59 minute', gelede(min(59), NOU), '59 min')
  is('een uur', gelede(min(60), NOU), '1 u')
  is('drie uur', gelede(uur(3), NOU), '3 u')
  is('23 uur', gelede(uur(23), NOU), '23 u')
  /* Presies hier draai dit. Bo 'n dag is 'n getal ure 'n som. */
  is('25 uur is gister', gelede(uur(25), NOU), 'Gister')
  is('twee dae', gelede(dae(2), NOU), '2 d')
  is('ses dae', gelede(dae(6), NOU), '6 d')
  /* En bo 'n week is 'n getal dae weer 'n som. */
  is('agt dae is n datum', gelede(dae(8), NOU), '15 Aug')
  is('verlede jaar dra die jaar', gelede('2025-08-15T10:00:00Z', NOU), '15 Aug 2025')
}

console.log('\n── n Tydstempel uit die TOEKOMS lyk nie stukkend nie ──\n')
{
  /* Bedienerhorlosies dryf. "-1 min" op jou eie splinternuwe opmerking is
     die soort ding wat 'n mens laat dink die app is stukkend. */
  is('een sekonde vorentoe', gelede(new Date(NOU + 1000).toISOString(), NOU), 'nou')
  is('n minuut vorentoe', gelede(new Date(NOU + 60000).toISOString(), NOU), 'nou')
}

console.log('\n── Die OU veld dra net n dag, en lieg dus nie oor ure nie ──\n')
{
  /* `w.dag` is "2026-08-23". Daar is geen uur in nie, en dus mag daar ook
     geen uur uit kom nie. */
  is('vandag', gelede('2026-08-23', NOU), 'Vandag')
  is('gister', gelede('2026-08-22', NOU), 'Gister')
  is('drie dae', gelede('2026-08-20', NOU), '3 d')
  is('verby n week', gelede('2026-08-10', NOU), '10 Aug')
  is('verlede jaar', gelede('2025-12-25', NOU), '25 Des 2025')

  const dagVorme = ['2026-08-23', '2026-08-22', '2026-08-20']
  for (const d of dagVorme) {
    waar(`${d}: geen ure`, !/\bu\b|min|nou/.test(gelede(d, NOU)))
  }
}

console.log('\n── Die SA-dag, nie die bediener se dag nie ──\n')
{
  /* 22:30 SAST op die 23ste is 20:30 UTC. In UTC is dit nog die 23ste, dus
     lyk dit reg — maar 01:00 SAST op die 24ste is 23:00 UTC op die 23ste.
     Vir 'n mens in Pretoria is dit MoRE. */
  const laatNou = Date.parse('2026-08-23T23:30:00Z')   /* = 01:30 SAST, 24ste */
  /* Binne 'n dag bly dit ure, ook oor middernag heen — dit is presies wat
     Facebook doen, en dit is die eerlike getal. */
  is('drie en n half uur bly ure', gelede('2026-08-23T20:00:00Z', laatNou), '3 u')
  /* Maar 'n DAG-vorm het geen ure om te tel nie, en dan moet die SA-kalender
     tel: die 24ste is "Vandag" al is dit in UTC nog die 23ste. */
  is('die 24ste is dan vandag', gelede('2026-08-24', laatNou), 'Vandag')
  is('en die 23ste is gister', gelede('2026-08-23', laatNou), 'Gister')
  /* En bo 'n dag draai die ISO-vorm ook op die SA-kalender. */
  is('26 uur terug is gister', gelede('2026-08-22T21:30:00Z', laatNou), 'Gister')
}

console.log('\n── Rommel gee NIKS, nooit "NaN" of "Invalid Date" nie ──\n')
{
  for (const rommel of [undefined, null, '', '   ', 'more', {}, [], NaN, 'x-y-z']) {
    is(`${JSON.stringify(rommel)} gee n lee string`, gelede(rommel, NOU), '')
  }
  is('n ongeldige "nou" gee ook niks', gelede(min(5), 'more'), '')
  is('naMs op rommel gee null', naMs('more'), null)
  /* Die skerm wys dit met `{tyd ? ... : null}` — 'n leë string mag dus nooit
     'n los kolletjie langs 'n naam laat staan nie. */
  waar('en dit is vals-agtig', !gelede(null, NOU))
}

console.log('\n── n Date werk ook ──\n')
{
  is('n Date-voorwerp', gelede(new Date(NOU - 3600000), NOU), '1 u')
  is('n Date as "nou"', gelede(uur(2), new Date(NOU)), '2 u')
  is('n ongeldige Date gee niks', gelede(new Date('more'), NOU), '')
}

console.log('\n── Die kring is STABIEL en dit VERSKIL ──\n')
{
  is('dieselfde id gee dieselfde kleur', kringKleur('w123'), kringKleur('w123'))
  waar('elke kleur kom uit die lys', KRINGE.includes(kringKleur('w123')))
  waar('n leë saad breek nie', KRINGE.includes(kringKleur('')))
  waar('null breek nie', KRINGE.includes(kringKleur(null)))

  /* Die hele punt: twintig opmerkings langs mekaar mag nie een kleur wees
     nie. Met agt kleure en 'n goeie verspreiding moet twintig ids minstens
     ses verskillende kringe gee. */
  const ids = Array.from({ length: 20 }, (_, i) => `wrd_${i}abc${i * 7}`)
  const kleure = new Set(ids.map(kringKleur))
  waar(`twintig ids gee baie kleure (${kleure.size})`, kleure.size >= 6)

  /* En elke kleur moet werklik gebruik kan word — 'n kleur wat nooit uitkom
     nie, is 'n kleur wat iemand later "opruim". */
  const baie = new Set(Array.from({ length: 400 }, (_, i) => kringKleur('m' + i)))
  is('al agt kleure kom voor', baie.size, KRINGE.length)

  waar('elke kleur is n geldige heks', KRINGE.every(k => /^#[0-9A-F]{6}$/i.test(k)))
  is('geen twee kleure is dieselfde', new Set(KRINGE).size, KRINGE.length)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
