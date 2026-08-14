/* Wanneer wys ons "Kennisgewings af", en wat doen daardie knoppie?
 *
 * Die eis is streng: die knoppie verdwyn NET wanneer ons met redelike
 * sekerheid weet hierdie toestel is reg. Alles anders wys, want die alternatief
 * is 'n mens wat dink hy is ingeteken en al maande niks kry nie.
 *
 * En dit mag NOOIT weer vra vir iemand wat geweier het nie. Die stelsel gee
 * dan dadelik `denied` sonder om iets te wys, en dan het ons 'n knoppie wat
 * niks doen — erger as stilte.
 */
import { kennisgewingStaat, wysKnoppie, STAAT_WOORDE } from './kennisgewingStaat.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

console.log('\n── Wanneer alles reg is ──\n')
is('toestemming EN n intekening → reg',
   kennisgewingStaat({ toestemming: 'granted', hetIntekening: true }), 'reg')
is('en dan wys ons niks', wysKnoppie('reg'), false)
is('ook in die Play-app',
   kennisgewingStaat({ inheems: true, kanPush: false, toestemming: 'granted', hetIntekening: true }), 'reg')
is('en op n geinstalleerde iPhone',
   kennisgewingStaat({ isIOS: true, geinstalleer: true, toestemming: 'granted', hetIntekening: true }), 'reg')

console.log('\n── Die duurste geval: "granted" beteken NIKS op sy eie ──\n')
{
  /* Dewald en sy vrou het albei "Toelaat" gedruk en albei niks gekry nie.
     Toestemming sonder 'n intekening is presies daardie foon. */
  is('toestemming sonder n intekening is NIE reg nie',
     kennisgewingStaat({ toestemming: 'granted', hetIntekening: false }), 'herstel')
  is('en die knoppie wys', wysKnoppie('herstel'), true)
  is('en dit teken weer in in plaas van te vra', STAAT_WOORDE.herstel.doen, 'herstel')
}

console.log('\n── Wie geweier het ──\n')
is('geweier → geblokkeer',
   kennisgewingStaat({ toestemming: 'denied' }), 'geblokkeer')
is('ook al is daar n ou intekening',
   kennisgewingStaat({ toestemming: 'denied', hetIntekening: true }), 'geblokkeer')
is('ook in die Play-app',
   kennisgewingStaat({ inheems: true, kanPush: false, toestemming: 'denied' }), 'geblokkeer')
is('en dit VRA NOOIT weer nie — dit wys die stappe',
   STAAT_WOORDE.geblokkeer.doen, 'stappe')
{
  /* Die reel wat nooit gebreek mag word nie: geen staat wat uit 'denied'
     kom, mag 'vra' as sy aksie he. */
  const uitDenied = [true, false].flatMap(inheems =>
    [true, false].flatMap(hetIntekening =>
      [true, false].map(isIOS =>
        kennisgewingStaat({ toestemming: 'denied', inheems, hetIntekening, isIOS, geinstalleer: true }))))
  is('en dit geld oor ELKE kombinasie',
     [...new Set(uitDenied)].filter(s => STAAT_WOORDE[s]?.doen === 'vra'), [])
}

console.log('\n── Nog nooit gevra nie ──\n')
is('nuwe toestel → vra', kennisgewingStaat({}), 'vra')
is('in die Play-app ook',
   kennisgewingStaat({ inheems: true, kanPush: false, toestemming: 'default' }), 'vra')
is('en die knoppie vra werklik', STAAT_WOORDE.vra.doen, 'vra')

console.log('\n── Die iPhone ──\n')
{
  /* Apple gee web push NET aan 'n webapp op die tuisskerm. In Safari self
     kom die vraag glad nie op nie — 'n kennisgewing-knoppie daar sou 'n
     knoppie wees wat niks doen. */
  is('n iPhone in n blaaier moet dit EERS installeer',
     kennisgewingStaat({ isIOS: true, geinstalleer: false }), 'installeer-eers')
  is('ook al is toestemming glo toegestaan',
     kennisgewingStaat({ isIOS: true, geinstalleer: false, toestemming: 'granted', hetIntekening: true }),
     'installeer-eers')
  is('maar op die tuisskerm werk dit gewoon',
     kennisgewingStaat({ isIOS: true, geinstalleer: true }), 'vra')
  is('en in die Play-app is iOS nie n ding nie',
     kennisgewingStaat({ isIOS: true, inheems: true, geinstalleer: false, toestemming: 'granted', hetIntekening: true }),
     'reg')
}

console.log('\n── Blaaiers wat glad nie kan nie ──\n')
is('geen push-ondersteuning → nie-ondersteun',
   kennisgewingStaat({ kanPush: false }), 'nie-ondersteun')
is('maar die Play-app het nie die blaaier se push nodig nie',
   kennisgewingStaat({ inheems: true, kanPush: false, toestemming: 'granted', hetIntekening: true }), 'reg')

console.log('\n── Niemand val deur nie ──\n')
{
  const state = new Set()
  for (const kanPush of [true, false])
  for (const inheems of [true, false])
  for (const toestemming of ['default', 'granted', 'denied'])
  for (const hetIntekening of [true, false])
  for (const isIOS of [true, false])
  for (const geinstalleer of [true, false]) {
    const s = kennisgewingStaat({ kanPush, inheems, toestemming, hetIntekening, isIOS, geinstalleer })
    if (!s) { val++; console.log('  VAL n kombinasie gee NIKS') }
    state.add(s)
  }
  is('elke staat behalwe "reg" het woorde',
     [...state].filter(s => s !== 'reg' && !STAAT_WOORDE[s]), [])
  is('en "reg" is die enigste een wat niks wys nie',
     [...state].filter(s => !wysKnoppie(s)), ['reg'])
  is('geen argumente val ook nie deur nie', typeof kennisgewingStaat(), 'string')
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
