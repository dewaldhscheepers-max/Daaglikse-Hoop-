/* ── Bou public/bybel365.json ──
 *
 * Dewald het 'n pakket gestuur met 'n 365-dae-plan om die hele Bybel te lees.
 * Die brondata is goed — sien die keuring onder — maar sy vorm is nie wat
 * hierdie app nodig het nie:
 *
 *   · 222 KB, met `book_id` (Engels) EN `book_af` NAAS mekaar by elke lees,
 *     plus velde wat die skerm nooit gebruik nie;
 *   · die boekname is TEKS. Die app sou hulle by elke oopmaak moes ontleed,
 *     en 'n naam wat nie ontleed nie, is 'n knoppie wat niks doen nie.
 *
 * Hierdie skrip los albei EEN keer, hier, in plaas van 365 keer op 'n foon:
 * elke lees word `[boekkode, hoofstuk]` met die GAB se eie kode — dieselfde
 * kode wat `open-bybel` verwag. Die uitset is sowat 'n vyfde van die bron.
 *
 * DIT KEUR OOK. 'n Verwysing wat nie 'n bestaande GAB-hoofstuk oopmaak nie,
 * laat die skrip omval — hy skryf niks. Die pakket dra sy eie validator, maar
 * dit keur teen sy EIE hoofstuk-tabel; dit sê dus net "my lys stem ooreen met
 * my lys". Wat saak maak, is die Bybel wat die app werklik oopmaak.
 *
 * Loop:  node skrifte/bou-bybel365.mjs <pad-na-bible365-plan.json>
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { ontleedSkrif } from '../src/data/skrifVerwysing.js'

const BRON = process.argv[2]
if (!BRON) {
  console.error('Gebruik: node skrifte/bou-bybel365.mjs <pad-na-plan.json>')
  process.exit(1)
}
const UIT = new URL('../public/bybel365.json', import.meta.url)
const GAB = new URL('../public/gab/', import.meta.url)

const kas = {}
function leesBoek(kode) {
  if (kas[kode] !== undefined) return kas[kode]
  const pad = new URL(`${kode}.json`, GAB)
  kas[kode] = existsSync(pad) ? JSON.parse(readFileSync(pad, 'utf8')) : null
  return kas[kode]
}

const plan = JSON.parse(readFileSync(BRON, 'utf8'))
if (!Array.isArray(plan.days) || plan.days.length !== 365) {
  console.error(`Die bron het ${plan.days ? plan.days.length : 0} dae, nie 365 nie.`)
  process.exit(1)
}

/* Die drie spore. Die plan lees elke dag uit drie kante van die Bybel, en dit
   is die rede waarom 'n mens nie 90 dae lank net Levitikus kry nie. */
const SPOOR = {
  story: 'verhaal',
  law_wisdom_prophets: 'wysheid',
  jesus_new_covenant: 'jesus',
}

const foute = []
const dekking = new Set()
const dae = []

for (const dag of plan.days) {
  const leeste = []
  for (const r of dag.readings) {
    const verwysing = `${r.book_af} ${r.chapter}`
    const span = ontleedSkrif(verwysing)
    if (!span) { foute.push(`dag ${dag.day}: "${verwysing}" ontleed nie`); continue }
    const boek = leesBoek(span.boek)
    if (!boek) { foute.push(`dag ${dag.day}: "${verwysing}" → geen ${span.boek}.json`); continue }
    if (!boek.hoofstukke[span.hoofstuk - 1]) {
      foute.push(`dag ${dag.day}: "${verwysing}" → ${span.boek} het ${boek.hoofstukke.length} hoofstukke`)
      continue
    }
    const spoor = SPOOR[r.track] || 'verhaal'
    leeste.push([span.boek, span.hoofstuk, spoor])
    dekking.add(`${span.boek} ${span.hoofstuk}`)
  }
  dae.push({ d: dag.day, l: leeste })
}

/* ── Die hekke. Val enigeen, skryf ons NIKS ── */

if (foute.length) {
  console.error(`\n${foute.length} verwysing(s) maak nie 'n bestaande hoofstuk oop nie:`)
  for (const f of foute.slice(0, 20)) console.error('  ' + f)
  process.exit(1)
}

const alleBoeke = readdirSync(new URL('.', GAB))
  .filter(n => n.endsWith('.json') && n !== 'indeks.json')
  .map(n => n.replace('.json', ''))

let gabHoofstukke = 0
const mis = []
for (const kode of alleBoeke) {
  const b = leesBoek(kode)
  gabHoofstukke += b.hoofstukke.length
  for (let h = 1; h <= b.hoofstukke.length; h++) {
    if (!dekking.has(`${kode} ${h}`)) mis.push(`${kode} ${h}`)
  }
}
if (mis.length) {
  console.error(`\n${mis.length} hoofstuk(ke) word NOOIT gelees nie — dit is nie "die hele Bybel" nie:`)
  for (const m of mis.slice(0, 20)) console.error('  ' + m)
  process.exit(1)
}

const uit = {
  weergawe: 2,
  titel: 'DIE HELE BYBEL IN 365 DAE',
  dae,
  /* Die twee getalle wat die skerm wys. Ons bereken hulle HIER sodat die foon
     dit nie 365 keer hoef te doen nie, en sodat 'n verkeerde getal by die bou
     omval in plaas van op iemand se skerm. */
  totaalDae: dae.length,
  totaalHoofstukke: dekking.size,
  boeke: alleBoeke.length,
}

writeFileSync(UIT, JSON.stringify(uit))
const grootte = readFileSync(UIT).length

console.log('\nGEKEUR EN GESKRYF')
console.log(`  ${dae.length} dae`)
console.log(`  ${dekking.size} hoofstukke, uit ${gabHoofstukke} in die GAB`)
console.log(`  ${alleBoeke.length} boeke, almal geraak`)
console.log(`  ${Math.round(grootte / 1024)} KB (bron was ${Math.round(readFileSync(BRON).length / 1024)} KB)`)
