/* ── Die klank binne TikTok se speler ──
 *
 * Dewald het vier keer om klank gevra. Die eerste poging het niks gedoen omdat
 * die BOODSKAP verkeerd was, nie omdat die idee verkeerd was nie: 'n JSON-string
 * sonder hulle merker. Hierdie toets hou die vorm vas, want dit is presies die
 * soort ding wat 'n mens "netjies maak" en dan stilweg breek.
 *
 *   node src/data/tiktokKlank.toets.mjs
 */
import {
  klankBoodskappe, isTiktokBoodskap, stelKlank, MERKER, TIKTOK_OORSPRONG,
} from './tiktokKlank.js'

let reg = 0, vals = 0
function is(wat, kry, wag) {
  const ok = JSON.stringify(kry) === JSON.stringify(wag)
  if (ok) { reg++; console.log(`  ok   ${wat}`) }
  else { vals++; console.log(`  VALS ${wat}\n       kry: ${JSON.stringify(kry)}\n       wag: ${JSON.stringify(wag)}`) }
}

console.log('\n── Die boodskap se VORM ──')
{
  const bs = klankBoodskappe(true)
  is('daar is meer as een spelling', bs.length >= 2, true)

  /* Dit is die hele fout van die eerste poging. Albei helftes. */
  is('elke boodskap is n VOORWERP, nooit n string',
    bs.every(b => b && typeof b === 'object' && !Array.isArray(b)), true)
  is('en elkeen dra die merker', bs.every(b => b[MERKER] === true), true)
  is('die merker is presies hulle sleutel', MERKER, 'x-tiktok-player')

  is('elkeen dra n tipe wat n string is',
    bs.every(b => typeof b.type === 'string' && b.type.length > 0), true)
  is('en elkeen dra n value-veld', bs.every(b => 'value' in b), true)

  /* Die gedokumenteerde voorbeeld gebruik `unMute`. Dit moet EERSTE staan: die
     eerste boodskap is die een met die beste kans, en party spelers hanteer net
     die eerste wat hulle ken. */
  is('unMute staan eerste', bs[0].type, 'unMute')

  /* 'n Speler wat ontdemp het maar op volume 0 staan, is steeds stil. */
  is('setVolume 1 is ook daar',
    bs.some(b => b.type === 'setVolume' && b.value === 1), true)

  /* Geen JSON nêrens nie. */
  is('geen boodskap is JSON-gekodeer',
    bs.every(b => typeof b !== 'string'), true)
}

console.log('\n── Klank AF is die spieelbeeld ──')
{
  const bs = klankBoodskappe(false)
  is('daar is boodskappe', bs.length >= 1, true)
  is('elkeen dra die merker', bs.every(b => b[MERKER] === true), true)
  is('mute is daar', bs.some(b => b.type === 'mute'), true)
  is('setVolume 0 is daar', bs.some(b => b.type === 'setVolume' && b.value === 0), true)
  is('en NIKS wat ontdemp', bs.some(b => /^unmute$/i.test(b.type)), false)
}

console.log('\n── Wie mag met ons praat ──')
{
  const goed = { origin: 'https://www.tiktok.com', data: { [MERKER]: true, type: 'onPlayerReady' } }
  is('hulle speler', isTiktokBoodskap(goed), true)
  is('en n ander tiktok-subdomein',
    isTiktokBoodskap({ origin: 'https://embed.tiktok.com', data: { [MERKER]: true } }), true)
  is('en die kaal gasheer',
    isTiktokBoodskap({ origin: 'https://tiktok.com', data: { [MERKER]: true } }), true)

  /* ── Die suffiks-toets, nie `includes` nie ──
     "tiktok.com.boos.net" BEVAT "tiktok.com". Dieselfde les as die kort-skakel-
     oplosser: 'n gasheer word aan sy einde getoets. */
  is('NIE n gasheer wat net so lyk nie',
    isTiktokBoodskap({ origin: 'https://tiktok.com.boos.net', data: { [MERKER]: true } }), false)
  is('NIE n voorvoegsel-truuk nie',
    isTiktokBoodskap({ origin: 'https://nietiktok.com', data: { [MERKER]: true } }), false)
  is('NIE oor http nie',
    isTiktokBoodskap({ origin: 'http://www.tiktok.com', data: { [MERKER]: true } }), false)

  /* Sonder die oorsprong-toets kon enige raam op die bladsy ons klank-knoppie
     laat verskyn deur net daardie sleutel te stuur. */
  is('NIE n vreemde raam met dieselfde sleutel nie',
    isTiktokBoodskap({ origin: 'https://boos.example', data: { [MERKER]: true } }), false)

  is('NIE sonder die merker nie',
    isTiktokBoodskap({ origin: 'https://www.tiktok.com', data: { type: 'iets' } }), false)
  is('NIE n merker wat net waarheidsagtig is nie',
    isTiktokBoodskap({ origin: 'https://www.tiktok.com', data: { [MERKER]: 'true' } }), false)
  is('NIE n string-liggaam nie',
    isTiktokBoodskap({ origin: 'https://www.tiktok.com', data: 'x-tiktok-player' }), false)
  is('NIE niks nie', isTiktokBoodskap(null), false)
  is('NIE n leë voorwerp nie', isTiktokBoodskap({}), false)
  is('NIE n stukkende oorsprong nie',
    isTiktokBoodskap({ origin: 'https://', data: { [MERKER]: true } }), false)
}

console.log('\n── Die stuur self ──')
{
  const gestuur = []
  const raam = { postMessage: (b, o) => gestuur.push([b, o]) }
  is('dit stuur', stelKlank(raam, true), true)
  is('en dit stuur ELKE spelling', gestuur.length, klankBoodskappe(true).length)
  is('na TikTok se oorsprong, nie na *',
    gestuur.every(([, o]) => o === TIKTOK_OORSPRONG), true)
  is('en die oorsprong is https', TIKTOK_OORSPRONG, 'https://www.tiktok.com')
  is('die liggaam is n voorwerp', gestuur.every(([b]) => typeof b === 'object'), true)

  /* 'n Raam wat besig is om te ontlaai, gooi. Dit mag nooit die voer omkantel
     nie — die res van die skerm werk steeds sonder klank. */
  const stukkend = { postMessage: () => { throw new Error('weg') } }
  is('n raam wat gooi, kantel niks om', stelKlank(stukkend, true), false)
  is('en geen raam is nie n fout nie', stelKlank(null, true), false)
  is('en n raam sonder postMessage ook nie', stelKlank({}, true), false)
}

console.log(`\n${reg} reg, ${vals} vals\n`)
if (vals) process.exit(1)
