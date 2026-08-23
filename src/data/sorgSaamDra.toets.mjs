/* Saam dra — die pad terug na 'n gesprek waarby jy gaan sit het.
 *
 * Dewald: "Die doel is dat ondersteuning 'n voortdurende gesprek word en nie
 * net een los opmerking nie."
 *
 * Twee dinge word hier vasgehou omdat hulle die soort ding is wat later
 * stilweg breek: 'n gesprek wat WEG is mag nooit as 'n leë kaart staan nie,
 * en "vra weer" mag nooit op 'n lewendige gesprek afgaan nie.
 */
import {
  lees, voegBy, merkGesien, verwyder, saamDraLys, MAKS, VRA_WEER_DAE,
} from './sorgSaamDra.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)

const NOU = Date.parse('2026-08-23T12:00:00Z')
const daeTerug = n => new Date(NOU - n * 86400000).toISOString()

console.log('\n── Lees oorleef rommel ──\n')
{
  is('niks', lees(null), [])
  is('lee string', lees(''), [])
  is('stukkende JSON', lees('{{{'), [])
  is('nie n lys nie', lees('{"a":1}'), [])
  is('lee lys', lees('[]'), [])
  is('rommel binne-in val uit', lees('[null,3,"x",{"id":"m1"}]'),
     [{ id: 'm1', wanneer: '', gesienWoorde: 0 }])
  is('n inskrywing sonder id val uit', lees('[{"wanneer":"x"}]'), [])
  is('duplikate val uit', lees('[{"id":"m1"},{"id":"m1"}]'),
     [{ id: 'm1', wanneer: '', gesienWoorde: 0 }])
  is('n vreemde telling word n getal', lees('[{"id":"m1","gesienWoorde":"drie"}]'),
     [{ id: 'm1', wanneer: '', gesienWoorde: 0 }])
}

console.log('\n── Voeg by: die nuutste staan bo ──\n')
{
  let l = []
  l = voegBy(l, 'm1', { wanneer: daeTerug(3), woorde: 2 })
  l = voegBy(l, 'm2', { wanneer: daeTerug(1), woorde: 5 })
  is('twee gesprekke', l.length, 2)
  is('die nuutste is eerste', l[0].id, 'm2')

  /* 'n Tweede woord op dieselfde storie beteken hy is nog daar. */
  l = voegBy(l, 'm1', { wanneer: daeTerug(0), woorde: 4 })
  is('dit skuif boontoe', l[0].id, 'm1')
  is('en dit verdubbel nie', l.length, 2)

  is('n lee id verander niks', voegBy(l, '', {}).length, 2)
  is('n spasie-id ook nie', voegBy(l, '   ', {}).length, 2)
}

console.log('\n── Die lys groei nie sonder einde nie ──\n')
{
  let l = []
  for (let i = 0; i < MAKS + 25; i++) l = voegBy(l, 'm' + i, { wanneer: daeTerug(0) })
  is(`hoogstens ${MAKS}`, l.length, MAKS)
  is('en die NUUTSTE bly', l[0].id, 'm' + (MAKS + 24))
}

console.log('\n── Merk gesien skuif NIKS ──\n')
{
  let l = voegBy(voegBy([], 'm1', { woorde: 1 }), 'm2', { woorde: 1 })
  const voor = l.map(r => r.id)
  l = merkGesien(l, 'm1', 7)
  is('die volgorde bly', l.map(r => r.id), voor)
  is('die telling is op', l.find(r => r.id === 'm1').gesienWoorde, 7)
  /* 'n LAER getal mag nooit die merk terugdraai nie — anders wys "nuwe
     antwoord" weer op iets wat 'n mens reeds gelees het. */
  l = merkGesien(l, 'm1', 3)
  is('n laer getal draai dit nie terug nie', l.find(r => r.id === 'm1').gesienWoorde, 7)
  is('n onbekende id breek niks', merkGesien(l, 'weg', 9).length, 2)
}

console.log('\n── Verwyder ──\n')
{
  const l = voegBy(voegBy([], 'm1', {}), 'm2', {})
  is('een gaan weg', verwyder(l, 'm1').map(r => r.id), ['m2'])
  is('n onbekende id verander niks', verwyder(l, 'weg').length, 2)
}

console.log('\n── Die oortjie wys net gesprekke wat NOG BESTAAN ──\n')
{
  /* DIE toets. 'n Gesprek wat gerapporteer of verwyder is, is nie meer op
     die muur nie. Sou ons hom steeds wys, staan daar 'n kaart met 'n naam
     en geen woorde — en 'n mens druk dit en niks gebeur. */
  const lys = [
    { id: 'm1', wanneer: daeTerug(1), gesienWoorde: 2 },
    { id: 'weg', wanneer: daeTerug(1), gesienWoorde: 0 },
  ]
  const plasings = [{ id: 'm1', teks: 'iets', woordeTotaal: 2 }]
  const uit = saamDraLys(lys, plasings, NOU)
  is('net die een wat bestaan', uit.length, 1)
  is('en dit is die regte een', uit[0].plasing.id, 'm1')
}

console.log('\n── "Nuwe antwoord" ──\n')
{
  const plasings = [{ id: 'm1', woordeTotaal: 5 }]
  const stil = saamDraLys([{ id: 'm1', wanneer: daeTerug(1), gesienWoorde: 5 }], plasings, NOU)
  is('niks nuuts nie', stil[0].nuut, false)
  is('en geen getal nie', stil[0].nuwe_woorde, undefined)

  const nuut = saamDraLys([{ id: 'm1', wanneer: daeTerug(1), gesienWoorde: 2 }], plasings, NOU)
  is('daar is iets nuuts', nuut[0].nuut, true)
  is('drie nuwes', nuut[0].nuweWoorde, 3)

  /* Word 'n woord gerapporteer, val die totaal. Dit mag nie 'n negatiewe
     getal op die skerm gee nie. */
  const minder = saamDraLys([{ id: 'm1', wanneer: daeTerug(1), gesienWoorde: 9 }], plasings, NOU)
  is('nooit n negatiewe getal nie', minder[0].nuweWoorde, 0)
  is('en dit is nie "nuut" nie', minder[0].nuut, false)

  /* `woorde` in plaas van `woordeTotaal` — die ou vorm. */
  const ou = saamDraLys([{ id: 'm1', wanneer: daeTerug(1), gesienWoorde: 0 }],
                        [{ id: 'm1', woorde: [{ id: 'a' }, { id: 'b' }] }], NOU)
  is('die ou vorm tel ook', ou[0].nuweWoorde, 2)
}

console.log('\n── "Gaan vra weer hoe dit gaan" ──\n')
{
  const plasings = [{ id: 'm1', woordeTotaal: 1 }]
  const vandag = saamDraLys([{ id: 'm1', wanneer: daeTerug(0), gesienWoorde: 1 }], plasings, NOU)
  is('vandag nog nie', vandag[0].vraWeer, false)
  const gister = saamDraLys([{ id: 'm1', wanneer: daeTerug(1), gesienWoorde: 1 }], plasings, NOU)
  is('gister nog nie', gister[0].vraWeer, false)
  const twee = saamDraLys([{ id: 'm1', wanneer: daeTerug(VRA_WEER_DAE), gesienWoorde: 1 }], plasings, NOU)
  is(`na ${VRA_WEER_DAE} dae wel`, twee[0].vraWeer, true)

  /* DIE ander helfte. Is die gesprek AAN DIE GANG, is 'n herinnering geraas.
     'n Mens moet gevra word waar dit stil geword het, nie waar mense praat
     nie. */
  const besig = saamDraLys([{ id: 'm1', wanneer: daeTerug(5), gesienWoorde: 0 }], plasings, NOU)
  is('nie op n lewendige gesprek nie', besig[0].vraWeer, false)
  is('daar staan "nuut" in plaas daarvan', besig[0].nuut, true)

  /* Sonder 'n datum raai ons nie. */
  const geenDatum = saamDraLys([{ id: 'm1', wanneer: '', gesienWoorde: 1 }], plasings, NOU)
  is('geen datum, geen herinnering', geenDatum[0].vraWeer, false)
  is('en geen NaN op die skerm', geenDatum[0].dae, 0)
}

console.log('\n── Niks val om op n lee muur nie ──\n')
{
  is('geen plasings', saamDraLys([{ id: 'm1' }], [], NOU), [])
  is('null plasings', saamDraLys([{ id: 'm1' }], null, NOU), [])
  is('geen lys', saamDraLys([], [{ id: 'm1' }], NOU), [])
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
