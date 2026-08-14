/* Die toetsboodskap se besluite.
 *
 * Dit is die enigste eerlike bewys dat 'n foon kennisgewings kry, dus mag dit
 * nie self lieg nie. Twee dinge tel: wat 'n token mag wees voordat ons dit
 * na Google stuur, en wat FCM se antwoord vir 'n MENS beteken.
 */
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { geldigeToken, lesUitslag, UITSLAG_WOORDE, moetUitvee } = require('./_toetsStuur.js')

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

const EG = 'fJ8kQ2mVR0aBcDeF:APA91bH-_xYz0123456789abcdefGHIJKLMNOPqrstuvwx'

console.log('\n── Wat mag n token wees ──\n')
is('n egte token gaan deur', geldigeToken(EG), EG)
is('spasies word afgesny',   geldigeToken(`  ${EG}  `), EG)

for (const [naam, rou] of [
  ['niks',            undefined],
  ['nul',             null],
  ['n getal',         12345],
  ['n voorwerp',      { token: EG }],
  ['n lys',           [EG]],
  ['leeg',            ''],
  ['te kort',         'abc'],
  ['n spasie binne',  'abc def ghijklmnopqrstuvwxyz'],
  ['n nuwe reel',     `${EG}\nX`],
  ['n skuinsstreep',  `${EG}/../x`],
  ['n vraagteken',    `${EG}?x=1`],
  ['n punt',          `${EG}.json`],
  ['aanhalings',      `${EG}"`],
  ['n NUL-greep',     EG + '\u0000'],
]) {
  is(`${naam} word geweier`, geldigeToken(rou), null)
}
is('en n absurd lange string ook', geldigeToken('a'.repeat(5000)), null)

console.log('\n── Wat FCM se antwoord beteken ──\n')
is('n 200 is gestuur',
   lesUitslag({ ok: true, status: 200 }), { ok: true, staat: 'gestuur' })
is('UNREGISTERED is n dooie foon',
   lesUitslag({ ok: false, status: 404, foutKode: 'UNREGISTERED' }), { ok: false, staat: 'dood' })
is('NOT_FOUND ook',
   lesUitslag({ ok: false, status: 404, foutKode: 'NOT_FOUND' }), { ok: false, staat: 'dood' })
is('INVALID_ARGUMENT is n token van n ander projek',
   lesUitslag({ ok: false, status: 400, foutKode: 'INVALID_ARGUMENT' }), { ok: false, staat: 'ongeldig' })

/* Die belangrikste onderskeid in hierdie leer. */
for (const status of [429, 503, 500]) {
  is(`n ${status} se NIKS oor die foon nie`,
     lesUitslag({ ok: false, status }), { ok: false, staat: 'probeer_weer' })
}
is('en n onbekende fout bly n fout',
   lesUitslag({ ok: false, status: 418 }), { ok: false, staat: 'fout' })

console.log('\n── Die dooies word uitgevee ──\n')
is('n dooie token word uitgevee',    moetUitvee('dood'), true)
is('n ongeldige een ook',            moetUitvee('ongeldig'), true)
is('maar n gestuurde NOOIT nie',     moetUitvee('gestuur'), false)
/* 'n 503 mag NIE 'n gesonde foon uitvee nie. Dit sou beteken dat 'n uur
   waarin Google sukkel, mense permanent van die lys afvee. */
is('en n "probeer weer" ook nie',    moetUitvee('probeer_weer'), false)
is('en n onbekende fout ook nie',    moetUitvee('fout'), false)

console.log('\n── Elke uitslag het woorde vir n mens ──\n')
{
  const state = new Set()
  for (const ok of [true, false])
  for (const status of [200, 400, 404, 429, 500, 503, 418])
  for (const foutKode of [null, 'UNREGISTERED', 'NOT_FOUND', 'INVALID_ARGUMENT', 'INTERNAL']) {
    state.add(lesUitslag({ ok, status, foutKode }).staat)
  }
  is('geen staat sonder woorde nie', [...state].filter(s => !UITSLAG_WOORDE[s]), [])
  is('en geen woorde wat leeg is nie',
     Object.values(UITSLAG_WOORDE).filter(w => !w || w.length < 10), [])
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
