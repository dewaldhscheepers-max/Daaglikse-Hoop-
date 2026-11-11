/* node src/data/kinderBoekSkakel.toets.mjs — die kinderboek se deelskakel. */
import { kinderBoekSkakel, kinderBoekUitPad } from './kinderBoekSkakel.js'
import { idUitPad as boekIdUitPad } from './boekSkakel.js'
import { appBestemming } from './inheemsBrug.js'

let reg = 0, val = 0
const is = (n, kry, wag) => { if (JSON.stringify(kry) === JSON.stringify(wag)) reg++; else { val++; console.log(`  VAL  ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) } }

is('die skakel', kinderBoekSkakel('noag'), 'https://www.dewaldscheepers.com/boeke/kinders/noag')
is('op www, nie die kaal domein nie', kinderBoekSkakel('x').startsWith('https://www.'), true)
is('heen en terug', kinderBoekUitPad(new URL(kinderBoekSkakel('dawid-en-goliat')).pathname), 'dawid-en-goliat')
is('die OU skakel in WhatsApp werk steeds', kinderBoekUitPad('/go/boeke/kinders/noag'), 'noag')
is('met n skuinsstreep aan die einde', kinderBoekUitPad('/boeke/kinders/noag/'), 'noag')
is('n opgelaaide boek', kinderBoekUitPad('/boeke/kinders/kb_1762000000000'), 'kb_1762000000000')
for (const pad of ['/', '/go', '/boeke', '/boeke/kinders/', '/boek/noag', '/boeke/kinders/a/b', '/boeke/kinders/%3Cscript%3E', '/boeke/kinders/%E0%A4%A'])
  is(`niks uit "${pad}"`, kinderBoekUitPad(pad), null)
/* Die e-boek se /boek/<id> mag NIE 'n kinderboek-skakel opvang nie. */
is('die e-boek-leser gryp dit nie', boekIdUitPad('/boeke/kinders/noag'), null)
/* Die Android-app stuur die skakel deur na dieselfde pad op www. */
is('die app gaan na dieselfde pad', appBestemming('https://www.dewaldscheepers.com/boeke/kinders/noag'), 'https://www.dewaldscheepers.com/boeke/kinders/noag')
is('ook vanaf die kaal domein', appBestemming('https://dewaldscheepers.com/go/boeke/kinders/noag'), 'https://www.dewaldscheepers.com/go/boeke/kinders/noag')

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
