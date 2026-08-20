/* Wanneer die app homself mag herlaai.
 *
 * Die fout wat hierdie toets vashou: main.jsx het op `controllerchange`
 * onvoorwaardelik herlaai. Elke ontplooiing het elke oop app uit sy blad
 * geskop, ook middel-in 'n stemboodskap.
 */
import { magHerlaai, WAG_MS } from './herlaaiBesluit.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

const NOU = 1_700_000_000_000
const weg = ms => ({ wagtend: true, versteekSedert: NOU - ms, nou: NOU })

console.log('\n── Sonder n nuwe weergawe gebeur daar niks ──\n')
is('geen update, app weg', magHerlaai({ ...weg(WAG_MS * 10), wagtend: false }), false)
is('geen argumente hoegenaamd', magHerlaai(), false)
is('n lee voorwerp', magHerlaai({}), false)

console.log('\n── Nooit terwyl die app op die skerm is nie ──\n')
is('sigbaar, update wag', magHerlaai({ wagtend: true, versteekSedert: null, nou: NOU }), false)
is('sigbaar, veld heeltemal weg', magHerlaai({ wagtend: true, nou: NOU }), false)
is('sigbaar, undefined', magHerlaai({ wagtend: true, versteekSedert: undefined, nou: NOU }), false)
/* Dit is die presiese geval waaroor Dewald gekla het. */
is('DIE KLAG: iemand lees, ons ontplooi', magHerlaai({ wagtend: true, versteekSedert: null, nou: NOU }), false)

console.log('\n── Nooit oor n stemboodskap heen nie ──\n')
/* 'n Stemboodskap speel met die skerm af. "Versteek" is dus GEEN bewys dat
   niemand luister nie — dit is juis wanneer hulle luister. */
is('klank speel, app al n uur weg',
   magHerlaai({ ...weg(60 * 60 * 1000), speelKlank: true }), false)
is('klank speel, app sigbaar',
   magHerlaai({ wagtend: true, versteekSedert: null, nou: NOU, speelKlank: true }), false)
is('klank stil, app lank weg', magHerlaai({ ...weg(WAG_MS + 1), speelKlank: false }), true)

console.log('\n── Weg, maar nog nie lank genoeg nie ──\n')
is('net weg (0 s)',        magHerlaai(weg(0)), false)
is('10 sekondes',          magHerlaai(weg(10_000)), false)
is('een minuut',           magHerlaai(weg(60_000)), false)
is('vier minute 59',       magHerlaai(weg(WAG_MS - 1000)), false)
is('een millisekonde kort', magHerlaai(weg(WAG_MS - 1)), false)

console.log('\n── Lank genoeg weg: nou kos dit niemand niks ──\n')
is('presies vyf minute', magHerlaai(weg(WAG_MS)), true)
is('vyf minute en een', magHerlaai(weg(WAG_MS + 1)), true)
is('n halfuur',        magHerlaai(weg(30 * 60 * 1000)), true)
is('n hele dag',       magHerlaai(weg(24 * 60 * 60 * 1000)), true)

console.log('\n── Hoogstens een keer ──\n')
is('herlaai loop reeds', magHerlaai({ ...weg(WAG_MS * 10), herlaaiTans: true }), false)
is('herlaai loop reeds, klank stil ook',
   magHerlaai({ ...weg(WAG_MS * 10), herlaaiTans: true, speelKlank: false }), false)

console.log('\n── Rommel breek niks ──\n')
is('versteekSedert is NaN',      magHerlaai({ wagtend: true, versteekSedert: NaN, nou: NOU }), false)
is('versteekSedert is Infinity', magHerlaai({ wagtend: true, versteekSedert: Infinity, nou: NOU }), false)
is('versteekSedert is n string', magHerlaai({ wagtend: true, versteekSedert: '123', nou: NOU }), false)
is('n horlosie wat agteruit loop', magHerlaai({ wagtend: true, versteekSedert: NOU + 99_999, nou: NOU }), false)

console.log('\n── WAG_MS is n redelike getal ──\n')
is('minstens n minuut', WAG_MS >= 60_000, true)
is('hoogstens n halfuur', WAG_MS <= 30 * 60 * 1000, true)

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
