/* Wat 'n oop teller mag optel.
 *
 * Die POST na /api/volg-jesus-telling dra geen geheim nie — 'n gewone foon
 * roep dit. Die enigste ding wat tussen die internet en 'n Firestore-skryf
 * staan, is hierdie funksie.
 *
 * `tel-toestemming.js` het presies hierdie fout al gehad en dit is met 'n
 * toets gevang: 'n kliënt wat 'n veldnaam kies, kan `__proto__` stuur, en dan
 * beland 'n voorwerp of 'n funksie as 'n `fieldPath` by Firestore en die
 * oproep word 'n 500. Die antwoord hier is strenger: die kliënt stuur nooit
 * 'n naam nie. Hy stuur 'n gebeurtenis, en hierdie leer maak die name.
 */
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { velde } = require('./_volgJesusTelVelde.js')

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

console.log('\n── Die vier dinge wat getel word ──\n')
is('die kaart oopgemaak', velde({ ding: 'oop' }), ['oop'])
is('begin met week 1', velde({ ding: 'begin', week: 1 }), ['begin', 'w1begin'])
is('dag 3 van week 2 klaar', velde({ ding: 'dag', week: 2, dag: 3 }), ['dagKlaar', 'w2dag3'])
is('week 7 klaar', velde({ ding: 'weekKlaar', week: 7 }), ['weekKlaar', 'w7klaar'])

/* Die totaal staan LANGS die per-week getal. Sonder dit sou die admin 52
   velde moes optel om een sin te skryf. */
is('elke gebeurtenis tel ook n totaal op', velde({ ding: 'begin', week: 9 })[0], 'begin')

console.log('\n── Die rande van die program ──\n')
is('week 52', velde({ ding: 'begin', week: 52 }), ['begin', 'w52begin'])
is('dag 5', velde({ ding: 'dag', week: 1, dag: 5 }), ['dagKlaar', 'w1dag5'])
is('week 0 bestaan nie', velde({ ding: 'begin', week: 0 }), [])
is('week 53 bestaan nie', velde({ ding: 'begin', week: 53 }), [])
is('dag 0 bestaan nie', velde({ ding: 'dag', week: 1, dag: 0 }), [])
is('dag 6 bestaan nie', velde({ ding: 'dag', week: 1, dag: 6 }), [])
is('n halwe week', velde({ ding: 'begin', week: 1.5 }), [])
is('geen week by begin', velde({ ding: 'begin' }), [])
is('geen dag by dag', velde({ ding: 'dag', week: 1 }), [])

/* 'oop' hoort by geen week nie — dit is die mens wat kyk wat dit is. 'n Week
   wat saamkom, word stilweg geïgnoreer eerder as om die versoek te laat val. */
is('oop het geen week nodig nie', velde({ ding: 'oop', week: 99 }), ['oop'])

console.log('\n── Wat NIE by Firestore mag kom nie ──\n')
for (const [naam, lyf] of [
  ['null',                 null],
  ['undefined',            undefined],
  ['n string',             'begin'],
  ['n getal',              7],
  ['n lee voorwerp',       {}],
  ['n onbekende ding',     { ding: 'iets anders', week: 1 }],
  ['n lee ding',           { ding: '', week: 1 }],
  ['ding as n getal',      { ding: 1, week: 1 }],
  ['ding as n voorwerp',   { ding: {}, week: 1 }],
]) {
  is(`${naam} gee niks`, velde(lyf), [])
}

/* Die gevaarlike een. 'n Naam wat oorerf word, is waarheidswaardig en kom
   deur 'n toets soos `if (TABEL[naam])`. */
for (const sleg of ['__proto__', 'constructor', 'toString', 'hasOwnProperty', 'valueOf']) {
  is(`${sleg} as die ding`, velde({ ding: sleg, week: 1 }), [])
}

/* En 'n kliënt wat probeer om self 'n veld te noem, word eenvoudig geignoreer
   — die naam kom NOOIT uit die versoek nie. */
const gepoog = velde({ ding: 'begin', week: 1, veld: 'iets', fieldPath: 'iets', naam: '__proto__' })
is('n kliënt kan nie n veldnaam saamstuur nie', gepoog, ['begin', 'w1begin'])

console.log('\n── Elke naam is n veilige fieldPath ──\n')
/* 'n Firestore-`fieldPath` met 'n koppelteken of 'n punt moet aangehaal word.
   'n Veld wat soms aangehaal is en soms nie, is 'n veld wat op een pad stil
   misluk. Elke naam wat hierdie leer maak, moet dus kaal veilig wees. */
const VEILIG = /^[A-Za-z_][A-Za-z0-9_]*$/
let almalVeilig = true
for (const ding of ['oop', 'begin', 'weekKlaar']) {
  for (let w = 1; w <= 52; w++) {
    for (const p of velde({ ding, week: w })) if (!VEILIG.test(p)) almalVeilig = false
  }
}
for (let w = 1; w <= 52; w++) {
  for (let d = 1; d <= 5; d++) {
    for (const p of velde({ ding: 'dag', week: w, dag: d })) if (!VEILIG.test(p)) almalVeilig = false
  }
}
is('al 52 weke se name is kaal veilig', almalVeilig, true)

/* En hulle bots nie: w1dag1 mag nooit dieselfde string wees as iets anders
   nie, anders tel twee verskillende dinge op dieselfde plek. */
const alles = new Set()
let dubbel = 0
for (let w = 1; w <= 52; w++) {
  for (const p of [...velde({ ding: 'begin', week: w }), ...velde({ ding: 'weekKlaar', week: w })]) {
    if (p === 'begin' || p === 'weekKlaar') continue
    if (alles.has(p)) dubbel++; alles.add(p)
  }
  for (let d = 1; d <= 5; d++) {
    const p = velde({ ding: 'dag', week: w, dag: d })[1]
    if (alles.has(p)) dubbel++; alles.add(p)
  }
}
is('geen twee gebeurtenisse deel n veld nie', dubbel, 0)
is('en daar is presies 52 x 7 per-week velde', alles.size, 52 * 7)

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
