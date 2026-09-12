/* Wat van 'n clip oor die draad gaan.
 *
 * 'n WITLYS, nie 'n swartlys nie — dieselfde vorm as volgJesusOpenbaar.js. Die
 * toets wat saak maak, is die LAASTE een: sit iemand more 'n veld by 'n clip,
 * moet dit NIE vanself uitkom nie.
 *
 * Loop met:  node src/data/reelsOpenbaar.toets.mjs
 */
import { openbareKlip, openbareLys, VELDE } from './reelsOpenbaar.js'
import { magWys } from './reels.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}

const VOL = {
  id: 'k1', bron: 'tiktok', bronId: '7412345678901234567',
  naam: '@ds.jan', handvatsel: '@ds.jan', woorde: 'n Sin.',
  eie: true, gebeurtenis: 'gaan-luister', brug: 'Luister', gedeel: 42,
  datum: '2026-09-12T10:00:00.000Z',
}

console.log('\n── Alles wat mag, kom deur ──')
{
  const u = openbareKlip(VOL)
  for (const v of ['id', 'bron', 'bronId', 'naam', 'handvatsel', 'woorde', 'gebeurtenis', 'brug']) {
    is(`${v} kom deur`, u[v], VOL[v])
  }
  is('eie kom deur',    u.eie, true)
  is('gedeel kom deur', u.gedeel, 42)
  is('datum kom deur',  u.datum, VOL.datum)
  is('en dit kan wys',  magWys(u), true)
}

console.log('\n── Wat NIE bygesit is nie, kom NIE uit nie ──')
/* Dít is die hele punt van 'n witlys. */
{
  const met = openbareKlip({
    ...VOL,
    /* Alles hieronder is versin, en niks daarvan mag oor die draad gaan. */
    notaVanDewald: 'hierdie een is nog nie gekeur nie',
    gestuurDeur: 'sarel@voorbeeld.com',
    ipAdres: '10.0.0.1',
    interneStatus: 'wag',
    toestelId: 'abc-123',
    __proto__marker: 'x',
  })
  is('geen interne nota',  met.notaVanDewald, undefined)
  is('geen e-pos',         met.gestuurDeur, undefined)
  is('geen IP',            met.ipAdres, undefined)
  is('geen status',        met.interneStatus, undefined)
  is('geen toestel-id',    met.toestelId, undefined)
  /* Die enigste sleutels wat bestaan, staan in VELDE. */
  is('elke sleutel staan in VELDE', Object.keys(met).every(k => VELDE.includes(k)), true)
}

console.log('\n── Leë velde kom nie saam nie ──')
/* 'n Leë string op elke clip is bandwydte vir niks. */
{
  const kaal = openbareKlip({ id: 'k1', bron: 'youtube', bronId: 'aaaaaaaaaaa', naam: '@x' })
  is('geen handvatsel',  'handvatsel' in kaal, false)
  is('geen woorde',      'woorde' in kaal, false)
  is('geen eie',         'eie' in kaal, false)
  is('geen brug',        'brug' in kaal, false)
  is('geen gedeel',      'gedeel' in kaal, false)
  is('geen datum',       'datum' in kaal, false)
  is('maar die vier wat moet, is daar', Object.keys(kaal).sort(), ['bron', 'bronId', 'id', 'naam'])
}

console.log('\n── eie is NET vir n egte true ──')
/* 'n Clip wat per ongeluk `eie: 'ja'` dra, mag nie 'n brug na ons bladsye kry
   nie — dieselfde les as `gepubliseer === true` by VOLG JESUS. */
for (const w of ['true', 1, 'ja', {}, [], 'false']) {
  is(`eie=${JSON.stringify(w)} tel nie`, 'eie' in openbareKlip({ ...VOL, eie: w }), false)
}
is('eie=true tel wel', openbareKlip({ ...VOL, eie: true }).eie, true)

console.log('\n── gedeel word n heelgetal, of niks ──')
is('n string word n getal', openbareKlip({ ...VOL, gedeel: '42' }).gedeel, 42)
is('n komma word afgekap',  openbareKlip({ ...VOL, gedeel: 42.9 }).gedeel, 42)
is('nul kom nie saam nie',  'gedeel' in openbareKlip({ ...VOL, gedeel: 0 }), false)
is('gemors kom nie saam nie', 'gedeel' in openbareKlip({ ...VOL, gedeel: 'baie' }), false)
is('NaN kom nie saam nie',  'gedeel' in openbareKlip({ ...VOL, gedeel: NaN }), false)
is('Infinity kom nie saam nie', 'gedeel' in openbareKlip({ ...VOL, gedeel: Infinity }), false)

console.log('\n── datum word altyd n string ──')
/* Die voer sorteer met `localeCompare`; 'n voorwerp daar is 'n stil fout. */
is('n Date word ISO', openbareKlip({ ...VOL, datum: new Date('2026-01-02T03:04:05Z') }).datum,
   '2026-01-02T03:04:05.000Z')
is('n string bly',    openbareKlip({ ...VOL, datum: '2026-05-05' }).datum, '2026-05-05')
is('n voorwerp val weg', 'datum' in openbareKlip({ ...VOL, datum: { seconds: 1 } }), false)
is('null val weg',    'datum' in openbareKlip({ ...VOL, datum: null }), false)

console.log('\n── Niks gooi nie ──')
is('null',       openbareKlip(null), null)
is('undefined',  openbareKlip(undefined), null)
is('n string',   openbareKlip('abc'), null)
is('n getal',    openbareKlip(7), null)
is('n lee voorwerp gee die vier kaal velde',
   Object.keys(openbareKlip({})).sort(), ['bron', 'bronId', 'id', 'naam'])
/* En so 'n kaal ding mag NIE wys nie — magWys is die tweede hek. */
is('en dit mag nie wys nie', magWys(openbareKlip({})), false)

console.log('\n── Die lys ──')
is('elke clip word omgeskakel', openbareLys([VOL, VOL]).length, 2)
is('gemors val weg',           openbareLys([VOL, null, 'abc', 7]).length, 1)
is('n lee lys',                openbareLys([]), [])
is('niks in',                  openbareLys(null), [])
is('nie n lys nie',            openbareLys({}), [])

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
