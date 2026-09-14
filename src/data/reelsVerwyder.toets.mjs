/* Wat 'n mens mag inplak om EEN clip uit die voer te haal.
 *
 * Dewald, 14 September 2026: *"how to remove only this one that isn't playing
 * how will i know what link it is."*
 *
 * Die belangrikste ding wat hierdie toets vashou, is wat dit WEIER. 'n
 * Verwyder-kassie wat 'n string half verstaan en dan die verkeerde clip uitvee,
 * is erger as een wat niks doen nie.
 *
 *   node src/data/reelsVerwyder.toets.mjs
 */
import { leesInset, beskryf } from './reelsVerwyder.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}

const ID = '7412345678901234567'

console.log('\n── Ons eie DEEL-skakel ──')
/* Dit is die pad wat Dewald werklik gaan loop: die Deel-knoppie langs die clip
   gee hierdie skakel, en die id daarin is die dokumentnaam. */
is('die lewende gasheer', leesInset(`https://dewaldscheepers.com/reels/${ID}`), { soort: 'id', id: ID })
is('n ander gasheer ook', leesInset(`https://daaglikse-hoop.vercel.app/reels/${ID}`), { soort: 'id', id: ID })
is('met n streep agter',  leesInset(`https://dewaldscheepers.com/reels/${ID}/`), { soort: 'id', id: ID })
is('enkelvoud werk ook',  leesInset(`https://dewaldscheepers.com/reel/${ID}`), { soort: 'id', id: ID })
is('met spasies om',      leesInset(`  https://dewaldscheepers.com/reels/${ID}  `), { soort: 'id', id: ID })

console.log('\n── n KAAL id ──')
is('net die syfers', leesInset(ID), { soort: 'id', id: ID })
is('met spasies',    leesInset(` ${ID} `), { soort: 'id', id: ID })

console.log('\n── TikTok se eie adresse ──')
is('die volle adres',
  leesInset(`https://www.tiktok.com/@annelie.janse/video/${ID}`), { soort: 'id', id: ID })
/* 'n KORT skakel dra die id NIE. Hy moet oopgemaak word, en dit kan net die
   bediener doen — hierdie lêer raak nooit die netwerk nie. */
is('n kort skakel word as KORT teruggegee',
  leesInset('https://vt.tiktok.com/ZSqHxCETq/'),
  { soort: 'kort', skakel: 'https://vt.tiktok.com/ZSqHxCETq/' })

console.log('\n── Wat dit WEIER ──')
/* Dit raai nooit. Elke een hier gee 'n rede wat 'n mens kan lees. */
for (const [wat, s] of [
  ['leeg',            ''],
  ['net spasies',     '   '],
  ['niks',            null],
  ['gewone woorde',   'kyk hierdie video'],
  /* Die GASHEER maak nie saak nie (hy plak dalk 'n voorskou-adres), maar die
     id moet soos 'n TikTok-post-id lyk. `123` is 'n string wat toevallig soos
     'n pad lyk, nie 'n clip nie. */
  ['n te kort id in n pad', 'https://iemand-anders.com/reels/123'],
  ['n YouTube-skakel', 'https://www.youtube.com/watch?v=aaaaaaaaaaa'],
  ['ons tuisblad',    'https://dewaldscheepers.com/'],
  ['die voer self',   'https://dewaldscheepers.com/reels'],
  ['n te kort id',    '12345'],
]) {
  is(`NIE ${wat} nie`, leesInset(s).soort, null)
  is(`en ${wat} kry n rede`, typeof leesInset(s).fout === 'string' && leesInset(s).fout.length > 5, true)
}

/* Die suffiks-les, weer: "tiktok.com.boos.net" bevat "tiktok.com". */
is('NIE n gasheer wat net so lyk nie',
  leesInset('https://vt.tiktok.com.boos.net/ZSqHxCETq/').soort, null)

console.log('\n── Die beskrywing op die knoppie ──')
/* 'n Verwyder-knoppie wat die VERKEERDE naam wys, is hoe 'n mens die verkeerde
   ding uitvee. */
is('naam en id',        beskryf({ naam: '@annelie', id: ID }), `@annelie · ${ID}`)
is('val terug op die handvatsel', beskryf({ handvatsel: '@ander', id: ID }), `@ander · ${ID}`)
is('sonder n naam bly die id',    beskryf({ id: ID }), ID)
is('niks in',           beskryf(null), '')
is('n lee voorwerp',    beskryf({}), '')

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
