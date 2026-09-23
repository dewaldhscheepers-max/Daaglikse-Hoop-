/* Wie reeds gee, word nie weer gevra nie.
 *
 * Twee egte foute, albei teen presies die verkeerde mens gerig:
 *
 *   1. 'n MAANDELIKSE VENNOOT is nerens neergeskryf nie en is dus ELKE MAAND
 *      gevra of sy nie wil begin gee nie. Sy gee klaar R50 per maand.
 *   2. 'n Skenking op enige dag BUITE die vra-venster is vergeet — sowat 21
 *      van elke 31 dae.
 *
 *   node src/data/skenkStatus.toets.mjs
 */
import {
  siklusVir, vensterVir, isVennoot, reedsGegee, kaartGesig,
  SIKLUS_SLEUTEL, VENNOOT_SLEUTEL, SIKLUS_BEGIN, SIKLUS_EINDE,
} from './skenkStatus.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}
/* Plaaslike tyd, want die app se dag is die mens se dag. */
const D = (j, m, d) => new Date(j, m - 1, d, 12, 0, 0)

console.log('\n── FOUT 1: n maandelikse vennoot word NOOIT weer gevra nie ──')
{
  const vennoot = { siklus: '2026-09', gestoorSiklus: '', gestoorVennoot: '2026-09-23T10:00:00.000Z' }
  is('sy gee reeds', reedsGegee(vennoot), true)
  /* Volgende maand, en die maand daarna, en oor n jaar. */
  is('ook volgende siklus', reedsGegee({ ...vennoot, siklus: '2026-10' }), true)
  is('ook oor n jaar', reedsGegee({ ...vennoot, siklus: '2027-09' }), true)

  /* En die kontrole: sonder die merk is sy net n gewone mens. */
  is('sonder die merk word sy wel gevra',
     reedsGegee({ siklus: '2026-10', gestoorSiklus: '', gestoorVennoot: '' }), false)

  is('n lee string is nie n vennoot nie', isVennoot(''), false)
  is('spasies ook nie', isVennoot('   '), false)
  is('n datum wel', isVennoot('2026-09-23T10:00:00.000Z'), true)
}

console.log('\n── FOUT 2: n skenking BUITE die venster tel ook ──')
{
  /* Die 10de. Die app vra daardie dag niks, maar sy betaal. Die eersvolgende
     vraag is die 25ste van dieselfde maand — dit moet stil bly. */
  is('die 10de val in hierdie maand se siklus', siklusVir(D(2026, 9, 10)), '2026-09')
  is('en die 25ste vra oor dieselfde siklus', vensterVir(D(2026, 9, 25)).cycleId, '2026-09')
  is('sy word dus nie weer gevra nie',
     reedsGegee({ siklus: '2026-09', gestoorSiklus: '2026-09' }), true)

  /* Die ou gedrag: op die 10de was daar geen venster, dus is niks geskryf. */
  is('op die 10de is daar geen VRAAG nie', vensterVir(D(2026, 9, 10)), null)
  is('maar wel n SIKLUS — dit is die hele regstelling',
     siklusVir(D(2026, 9, 10)) !== '', true)
}

console.log('\n── Die siklus loop van die 25ste tot die 3de ──')
{
  /* Een siklus, met die naam van die EERSTE maand, en twee vrae daaroor. */
  is('die 25ste September', siklusVir(D(2026, 9, 25)), '2026-09')
  is('die 30ste September', siklusVir(D(2026, 9, 30)), '2026-09')
  is('die 1ste Oktober is nog September s n', siklusVir(D(2026, 10, 1)), '2026-09')
  is('die 3de Oktober ook', siklusVir(D(2026, 10, 3)), '2026-09')
  is('maar die 4de Oktober is n nuwe een', siklusVir(D(2026, 10, 4)), '2026-10')

  /* Die twee kanse is twee vrae oor DIESELFDE siklus. Een betaling maak albei
     stil — dit is hoekom die naam van die eerste maand kom. */
  is('kans 1 is die 25ste+', vensterVir(D(2026, 9, 26)), { cycleId: '2026-09', chance: 1 })
  is('kans 2 is die 2de', vensterVir(D(2026, 10, 2)), { cycleId: '2026-09', chance: 2 })
  is('en die 3de', vensterVir(D(2026, 10, 3)), { cycleId: '2026-09', chance: 2 })
  is('dieselfde siklus, twee kanse',
     vensterVir(D(2026, 9, 26)).cycleId === vensterVir(D(2026, 10, 2)).cycleId, true)
}

console.log('\n── Die jaarwending breek dit nie ──')
{
  is('die 2de Januarie hoort by Desember', siklusVir(D(2027, 1, 2)), '2026-12')
  is('en die venster ook', vensterVir(D(2027, 1, 2)), { cycleId: '2026-12', chance: 2 })
  is('die 25ste Desember', siklusVir(D(2026, 12, 25)), '2026-12')
  is('die 4de Januarie is n nuwe siklus', siklusVir(D(2027, 1, 4)), '2027-01')
}

console.log('\n── Op watter dae word daar GEVRA ──')
{
  const vra = []
  for (let d = 1; d <= 30; d++) if (vensterVir(D(2026, 9, d))) vra.push(d)
  is('agt dae in September (30 dae)', vra, [2, 3, 25, 26, 27, 28, 29, 30])

  /* Nege in n maand van 31. Die punt is watter dae STIL is — dit is presies
     die dae waarop n skenking voorheen vergeet is. */
  const okt = []
  for (let d = 1; d <= 31; d++) if (vensterVir(D(2026, 10, d))) okt.push(d)
  is('nege dae in Oktober (31 dae)', okt, [2, 3, 25, 26, 27, 28, 29, 30, 31])
  is('en 22 stil dae in Oktober', 31 - okt.length, 22)
  is('die 12de is stil', vensterVir(D(2026, 9, 12)), null)
  is('die 24ste ook', vensterVir(D(2026, 9, 24)), null)
  is('die 1ste ook', vensterVir(D(2026, 9, 1)), null)
}

console.log('\n── Die 1ste is stil, maar dit tel by die VORIGE siklus ──')
{
  /* Iemand wat op die 1ste gee, het gister-ish gegee. Die 2de se vraag moet
     stil bly. */
  is('die 1ste Oktober', siklusVir(D(2026, 10, 1)), '2026-09')
  is('en die 2de vra oor September', vensterVir(D(2026, 10, 2)).cycleId, '2026-09')
  is('sy word dus nie more gevra nie',
     reedsGegee({ siklus: '2026-09', gestoorSiklus: siklusVir(D(2026, 10, 1)) }), true)
}

console.log('\n── n Ou betaling hou nie vir ewig nie ──')
{
  /* Net n VENNOOT is permanent. n Eenmalige skenking geld vir SY siklus. */
  is('verlede maand se skenking',
     reedsGegee({ siklus: '2026-10', gestoorSiklus: '2026-09' }), false)
  is('hierdie maand s n wel',
     reedsGegee({ siklus: '2026-10', gestoorSiklus: '2026-10' }), true)
}

console.log('\n── Gemors breek dit nie ──')
{
  is('niks in', reedsGegee(), false)
  is('n lee voorwerp', reedsGegee({}), false)
  is('geen siklus', reedsGegee({ siklus: '', gestoorSiklus: '' }), false)
  /* Twee lee stringe is NIE "hy het gegee" nie. Dit was n egte gevaar: n
     vergelyking van '' === '' is waar. */
  is('twee lee stringe tel nie as n betaling nie',
     reedsGegee({ siklus: '', gestoorSiklus: '', gestoorVennoot: '' }), false)
  is('n ongeldige datum', siklusVir('gister'), '')
  is('en die venster ook', vensterVir('gister'), null)
  is('niks in siklusVir', siklusVir(undefined), '')
}

console.log('\n── Die sleutels staan vas ──')
{
  /* n Tikfout in een van die plekke wat hulle lees, is n stil "nooit gegee". */
  is('die siklus-sleutel', SIKLUS_SLEUTEL, 'skenkPaid')
  is('die vennoot-sleutel', VENNOOT_SLEUTEL, 'skenkVennoot')
  is('die siklus begin op die 25ste', SIKLUS_BEGIN, 25)
  is('en eindig op die 3de', SIKLUS_EINDE, 3)
}

console.log('\n── Die steun-kaart se DRIE gesigte ──')
{
  /* n Kaart wat vir almal dieselfde se, lieg vir twee uit die drie. */
  is('n vennoot kry n DANKIE',
     kaartGesig({ siklus: '2026-09', gestoorVennoot: '2026-03-14T08:00:00.000Z' }), 'vennoot')
  is('ook al het sy nooit eenmalig gegee nie',
     kaartGesig({ siklus: '2026-09', gestoorSiklus: '', gestoorVennoot: '2026-03-14T08:00:00.000Z' }), 'vennoot')

  is('wie hierdie siklus gegee het, kry n dankie + n uitnodiging',
     kaartGesig({ siklus: '2026-09', gestoorSiklus: '2026-09' }), 'gewer')

  is('almal anders kry die gewone kaart',
     kaartGesig({ siklus: '2026-09', gestoorSiklus: '', gestoorVennoot: '' }), 'vra')
  is('ook wie VERLEDE siklus gegee het',
     kaartGesig({ siklus: '2026-09', gestoorSiklus: '2026-08' }), 'vra')

  /* n Vennoot wat OOK eenmalig gegee het, bly n vennoot — die stiller gesig
     wen, want dit is die een wat niks vra nie. */
  is('vennoot wen bo gewer',
     kaartGesig({ siklus: '2026-09', gestoorSiklus: '2026-09', gestoorVennoot: '2026-03-14T08:00:00.000Z' }),
     'vennoot')

  is('gemors gee die gewone kaart', kaartGesig(), 'vra')
  is('n lee voorwerp ook', kaartGesig({}), 'vra')
  /* Twee lee stringe is NIE "sy het gegee" nie. */
  is('twee lee stringe ook',
     kaartGesig({ siklus: '', gestoorSiklus: '', gestoorVennoot: '' }), 'vra')

  /* Die gesig en `reedsGegee` mag nooit uitmekaar dryf nie: albei paaie moet
     dieselfde mens herken. */
  for (const geval of [
    { siklus: '2026-09', gestoorVennoot: 'x' },
    { siklus: '2026-09', gestoorSiklus: '2026-09' },
    { siklus: '2026-09', gestoorSiklus: '2026-08' },
    { siklus: '2026-09' },
  ]) {
    is(`gesig en reedsGegee stem ooreen: ${JSON.stringify(geval)}`,
       kaartGesig(geval) !== 'vra', reedsGegee(geval))
  }
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
