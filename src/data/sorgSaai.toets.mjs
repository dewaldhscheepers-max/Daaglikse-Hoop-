/* Loop met:  node src/data/sorgSaai.toets.mjs

   Die eerste reaksies en opmerkings onder 'n plasing of 'n video.

   Twee dinge moet hier vasstaan:

     1. dit is DETERMINISTIES. Dieselfde id gee altyd dieselfde antwoord.
        Die bediener skryf dit in Firestore en die skerm reken dit uit; dryf
        hulle uitmekaar, spring die opmerkings rond by elke laai.

     2. 'n VIDEO kry ander woorde as die MUUR. Op die muur het iemand pas sy
        hart uitgestort en "jy is nie alleen nie" is presies reg. Onder 'n
        video is dieselfde sin verkeerd — daar is niemand om te troos nie. */

import {
  saaiReaksies, saaiWoorde, DAAGLIKSE_HOOP,
  HOOP_WOORDE, ANONIEME_WOORDE, VIDEO_WOORDE,
} from './sorgSaai.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`) }
}
function waar(naam, x) { is(naam, !!x, true) }

const VIDEOS = ['v1YSaNpP6Wrs', 'v8CbMCUVzHeE', 'vzJFAjk0qIV8', 'vyGDuxCjp3mo', 'vfkMWJ6Zgm7A']
const MURE   = ['m1abc', 'm2def', 'm3ghi']

console.log('\n── Onder \'n VIDEO ──')
for (const id of VIDEOS) {
  const w = saaiWoorde(id, 'video')
  is(`${id}: drie opmerkings`, w.length, 3)
  waar(`${id}: almal uit die video-lys`, w.every(x => VIDEO_WOORDE.includes(x.teks)))
  /* Geen naam nie. Dit is Dewald se eie video; 'n kanaal wat sy eie video
     prys, lyk soos 'n kanaal wat niemand anders het nie. */
  is(`${id}: geen Daaglikse Hoop nie`, w.filter(x => x.naam === DAAGLIKSE_HOOP).length, 0)
  waar(`${id}: nie een is 'n muur-sin nie`,
    w.every(x => !HOOP_WOORDE.includes(x.teks) && !ANONIEME_WOORDE.includes(x.teks)))
  /* Drie dieselfde emoji onder mekaar lyk soos 'n fout. */
  is(`${id}: al drie verskil`, new Set(w.map(x => x.teks)).size, 3)
}

console.log('\n── Op die MUUR bly alles soos dit was ──')
for (const id of MURE) {
  const w = saaiWoorde(id)
  is(`${id}: drie opmerkings`, w.length, 3)
  is(`${id}: die eerste dra die naam`, w[0].naam, DAAGLIKSE_HOOP)
  waar(`${id}: en dit is 'n hoop-sin`, HOOP_WOORDE.includes(w[0].teks))
  waar(`${id}: die ander twee is anoniem`, w.slice(1).every(x => x.naam === '' && ANONIEME_WOORDE.includes(x.teks)))
  is(`${id}: die twee anonieme verskil`, w[1].teks === w[2].teks, false)
  waar(`${id}: geen emoji-opmerking op die muur nie`,
    w.every(x => !VIDEO_WOORDE.includes(x.teks)))
}

console.log('\n── Deterministies ──')
waar('dieselfde video, dieselfde antwoord',
  JSON.stringify(saaiWoorde('v1YSaNpP6Wrs', 'video')) === JSON.stringify(saaiWoorde('v1YSaNpP6Wrs', 'video')))
waar('dieselfde plasing, dieselfde antwoord',
  JSON.stringify(saaiWoorde('m1abc')) === JSON.stringify(saaiWoorde('m1abc')))
waar('en die reaksies ook',
  JSON.stringify(saaiReaksies('v1YSaNpP6Wrs')) === JSON.stringify(saaiReaksies('v1YSaNpP6Wrs')))

console.log('\n── Verskillende id\'s gee verskillende antwoorde ──')
const almal = new Set(VIDEOS.map(id => JSON.stringify(saaiWoorde(id, 'video').map(w => w.teks))))
waar('nie almal dieselfde nie', almal.size > 1)

console.log('\n── Drie reaksies, altyd ──')
for (const id of [...VIDEOS, ...MURE]) {
  const r = saaiReaksies(id)
  is(`${id}: drie van die vier`, Object.keys(r).length, 3)
  waar(`${id}: elkeen een druk`, Object.values(r).every(n => n === 1))
}

console.log('\n── Wat dit sou wys ──')
for (const id of VIDEOS) {
  console.log(`   ${id}  →  ${saaiWoorde(id, 'video').map(w => w.teks).join('   ')}`)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
