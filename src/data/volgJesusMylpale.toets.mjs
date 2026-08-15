/* Die twee groot mylpale: "wil jy Jesus volg?" en "waar staan jy met doop?"
 *
 * Hierdie is die duurste reels in die hele program, want hulle raak mense se
 * gewete en hulle privaatheid. Twee toetse hier is nie-onderhandelbaar:
 *
 *   · 'n mylpaal mag NOOIT die volgende week toesluit nie;
 *   · die kerk sien NIKS sonder uitdruklike toestemming nie.
 */
import {
  MYLPALE, mylpaalVir, blokkeerVolgendeWeek, biedKontak, magKerkSien, antwoordVir,
} from './volgJesusMylpale.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

const ALLE_KEUSES = Object.values(MYLPALE)
  .flatMap(m => m.keuses.map(k => [m, k.waarde]))

console.log('\n── Watter week dra watter mylpaal ──\n')
is('week 6 dra die volg-mylpaal', mylpaalVir(6).sleutel, 'volg')
is('week 7 dra die doop-mylpaal', mylpaalVir(7).sleutel, 'doop')
for (const n of [1, 5, 8, 22, 52, 0, null, 'ses']) {
  is(`week ${JSON.stringify(n)} dra geen mylpaal nie`, mylpaalVir(n), null)
}

console.log('\n── n MYLPAAL IS NIE n TRONK NIE ──\n')
{
  /* Punt 1 §12. Se iemand by Week 7 "ek is nog nie gedoop nie", word Week 8
     NIE toegesluit nie. Die app ken nie sy gewete, sy omstandighede of sy
     plaaslike kerk nie. */
  const geblokkeer = ALLE_KEUSES.filter(([, w]) => blokkeerVolgendeWeek(w) !== false)
  is('geen keuse sluit die volgende week toe nie', geblokkeer, [])
  is('ook nie wanneer daar glad nie gekies is nie', blokkeerVolgendeWeek(null), false)
  is('en ook nie met n onbekende waarde nie', blokkeerVolgendeWeek('iets'), false)
}

console.log('\n── Elke keuse het woorde terug ──\n')
for (const [m, w] of ALLE_KEUSES) {
  const a = antwoordVir(m, w)
  is(`${m.sleutel}/${w} kry n antwoord`, typeof a === 'string' && a.length > 20, true)
}
{
  /* Geen antwoord mag iemand verneder of skuld gebruik. */
  const alles = ALLE_KEUSES.map(([m, w]) => antwoordVir(m, w)).join(' ')
  is('geen skuldtaal nie', /moet jy skaam|jy faal|teleurgestel|nie n regte Christen/i.test(alles), false)
}

console.log('\n── Wie word gevra of die kerk mag kontak ──\n')
is('wie "ja" se op volg',            biedKontak(MYLPALE.volg, 'ja'), true)
/* Iemand wat nog ONDERSOEK moet nie 'n telefoonoproep kry as gevolg van 'n
   knoppie nie. Dit is presies hoe 'n app manipulerend voel. */
is('maar wie nog ondersoek NIE',     biedKontak(MYLPALE.volg, 'ondersoek'), false)
is('en wie nog nie gereed is NIE',   biedKontak(MYLPALE.volg, 'nieGereed'), false)
is('wie gedoop wil word',            biedKontak(MYLPALE.doop, 'wil'), true)
is('en wie vrae het',                biedKontak(MYLPALE.doop, 'vrae'), true)
is('maar wie reeds gedoop is NIE',   biedKontak(MYLPALE.doop, 'reeds'), false)
is('en wie nog nie gereed is NIE',   biedKontak(MYLPALE.doop, 'nieGereed'), false)
is('geen mylpaal, geen kontak',      biedKontak(null, 'wil'), false)
is('geen waarde, geen kontak',       biedKontak(MYLPALE.doop, null), false)

console.log('\n── DIE KERK SIEN NIKS SONDER TOESTEMMING NIE ──\n')
{
  is('met toestemming sien die kerk die versoek',
     magKerkSien(MYLPALE.doop, { waarde: 'wil', toestemming: true }),
     { mylpaal: 'doop', waarde: 'wil', versoek: 'Doopgesprek versoek' })

  /* Alles hieronder moet null gee. Null beteken die kerk kry NIKS — nie die
     keuse nie, nie 'n telling nie, niks. */
  for (const [naam, staat] of [
    ['sonder toestemming',        { waarde: 'wil', toestemming: false }],
    ['met n ontbrekende vlag',    { waarde: 'wil' }],
    ['met n string "true"',       { waarde: 'wil', toestemming: 'true' }],
    ['met 1 in plaas van true',   { waarde: 'wil', toestemming: 1 }],
    ['met null',                  null],
    ['met n lee voorwerp',        {}],
  ]) {
    is(`${naam} sien die kerk NIKS`, magKerkSien(MYLPALE.doop, staat), null)
  }

  /* En toestemming op 'n keuse wat NIE kontak aanbied nie, tel ook nie —
     anders sou 'n ou vlaggie wat bly staan, iemand se "reeds gedoop" na die
     kerk stuur. */
  is('toestemming op "reeds gedoop" stuur niks',
     magKerkSien(MYLPALE.doop, { waarde: 'reeds', toestemming: true }), null)
  is('en op "nog nie gereed" ook nie',
     magKerkSien(MYLPALE.volg, { waarde: 'nieGereed', toestemming: true }), null)
}

console.log('\n── Wat die kerk WEL sien, is min ──\n')
{
  const gesig = magKerkSien(MYLPALE.doop, { waarde: 'wil', toestemming: true })
  is('presies drie velde', Object.keys(gesig).sort(), ['mylpaal', 'versoek', 'waarde'])
  /* Nooit 'n naam, 'n refleksie of 'n private antwoord nie. */
  is('geen private inhoud nie',
     Object.keys(gesig).filter(k => /naam|refleksie|joernaal|teks|epos/i.test(k)), [])
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
