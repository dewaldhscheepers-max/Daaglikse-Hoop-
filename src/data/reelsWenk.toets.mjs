/* "Gly jou vinger boontoe" — wanneer die wenk wys, en wanneer NOOIT.
 *
 * Dewald, 16 September 2026: *"Wys op die eerste Reel vir die gebruiker hierdie
 * boodskap... wys hulle hoe."*
 *
 * Die twee dinge wat hier moet vasstaan, is albei die soort wat 'n wenk in 'n
 * plaag verander:
 *
 *   · hy wys NET op die eerste clip, en verdwyn sodra sy swiep;
 *   · en 'n mens wat die voer al gebruik het, sien hom NOOIT. Sonder daardie
 *     hek kry elke bestaande kyker môre 'n beginnerswenk.
 *
 *   node src/data/reelsWenk.toets.mjs
 */
import { GESWIEP, SWIEP_WOORDE, magWysSwiep } from './reelsWenk.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}

/* 'n Splinternuwe mens op die eerste clip — die een geval waar dit wel wys. */
const NUUT = { gesienNiks: true, geswiep: false, aktief: 0, anderWenk: false }

console.log('\n── Die een mens wat dit sien ──')
is('splinternuut, op clip 1', magWysSwiep(NUUT), true)

console.log('\n── Dit verdwyn sodra sy swiep ──')
/* Geen toestand nodig nie: sy is by clip twee, en dit is waar sy staan. */
is('op clip 2', magWysSwiep({ ...NUUT, aktief: 1 }), false)
is('op clip 9', magWysSwiep({ ...NUUT, aktief: 8 }), false)

console.log('\n── En dit kom NOOIT weer nie ──')
is('sy het al geswiep', magWysSwiep({ ...NUUT, geswiep: true }), false)
/* Ook al is sy weer terug by clip 1 — 'n mens leer dit nie twee keer nie. */
is('ook terug op clip 1', magWysSwiep({ ...NUUT, geswiep: true, aktief: 0 }), false)

console.log('\n── n Gewone kyker sien dit NOOIT ──')
/* Dit is die belangrike hek: sonder dit kry elke bestaande kyker môre 'n
   beginnerswenk oor iets wat sy 'n week laas gedoen het. */
is('sy het reeds clips gekyk', magWysSwiep({ ...NUUT, gesienNiks: false }), false)
is('ook al het sy nog nie in HIERDIE sessie geswiep nie',
   magWysSwiep({ gesienNiks: false, geswiep: false, aktief: 0 }), false)

console.log('\n── Nooit twee wenke oor een video nie ──')
/* "Tik vir klank" staan in die middel van dieselfde skerm. */
is('die klank-wenk staan reeds', magWysSwiep({ ...NUUT, anderWenk: true }), false)
is('en sodra hy weg is, kom hierdie een', magWysSwiep({ ...NUUT, anderWenk: false }), true)

console.log('\n── Gemors gee nooit n wenk nie ──')
is('niks in',        magWysSwiep(), false)
is('n lee voorwerp', magWysSwiep({}), false)
is('null',           magWysSwiep(null), false)
is('n string',       magWysSwiep('nee'), false)
/* 'n Ontbrekende `aktief` tel as die eerste plek — dit is waar 'n voer begin. */
is('geen aktief', magWysSwiep({ gesienNiks: true, geswiep: false }), true)

console.log('\n── Die woorde is Dewald se eie ──')
/* Hy het die sin gestuur; dit word nie "verbeter" nie. */
is('woord vir woord', SWIEP_WOORDE,
   'Gly jou vinger boontoe om die volgende video te sien.')
is('die sleutel staan vas', GESWIEP, 'reels_geswiep')

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
