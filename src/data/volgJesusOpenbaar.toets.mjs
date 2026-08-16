/* Wat die publiek van VOLG JESUS mag sien.
 *
 * Hierdie toets bestaan om twee foute te keer wat albei STIL is:
 *
 *   1. 'n week wat lewendig gaan voordat Dewald hom gepubliseer het. Niks
 *      kla nie — dit staan net eendag op duisende fone;
 *   2. 'n veld wat uitlek. Die fasiliteerdermateriaal en die groepvrae is
 *      nie geheim nie, maar hulle is ook nie vir die solo-mens geskryf nie,
 *      en 'n hersieningsnota op 'n openbare eindpunt is 'n ding wat 'n mens
 *      eers ontdek wanneer iemand dit aanhaal.
 *
 * En een fout wat LUIDRUGTIG is en juis daarom onthou moet word: die
 * "Week N+1 kom binnekort"-boodskap wat nie saam met die program skuif nie.
 */
import {
  openbareWeek, gepubliseerdeNommers, tot, binnekort, kiesWeek, OPENBARE_VELDE,
} from './volgJesusOpenbaar.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar  = (n, k) => is(n, !!k, true)
const vals  = (n, k) => is(n, !!k, false)

/* 'n Volledige week soos dit uit Firestore kom — met alles wat NIE uit mag
   nie ook in. */
const VOL = {
  weeknommer: 1,
  titel: 'Wie is Jesus?',
  openingskerm: 'Die opening.',
  moreTeaser: 'More gaan ons kyk na...',
  primereSkrif: 'Johannes 1:1–18',
  videoId: 'jACGS5QkLkQ',
  kernwaarheid: 'As Jesus werklik Here is — gaan jy Hom volg?',
  eenSin: 'Wie sit op die troon?',
  gebed: 'Here Jesus...',
  privaatRefleksie: 'Wees eerlik.',
  gehoorsaamheidStap: 'Doen dit.',
  wallpaper: '/beelde/vj-w1-wallpaper.webp',
  dag2Skrif: 'Johannes 1:1–5',
  dag2Prompt: 'Kyk weer.',
  /* Alles hieronder is NIE openbaar nie. */
  doel: 'Die doel van die week',
  weekKern: 'Die week se kernwaarheid vir die leier',
  fasiliteerderHoofpunt: 'Die hoofpunt',
  fasiliteerderGrens: 'Wat ons nie moet aflei nie',
  fasiliteerderWaarskuwing: 'Wees versigtig',
  pastoraleRisiko: 'medium',
  groepVraag1: 'Groepvraag een',
  groepVraag2: 'Groepvraag twee',
  groepVraag3: 'Groepvraag drie',
  groepVraag4: 'Groepvraag vier',
  hersieningStatus: 'wag',
  kontroles: { teks: true },
  gepubliseer: true,
}

console.log('\n── Die hek: net gepubliseerde weke ──\n')
waar('n gepubliseerde week kom deur', openbareWeek(VOL))
is('n ongepubliseerde week gee niks', openbareWeek({ ...VOL, gepubliseer: false }), null)
is('gepubliseer ontbreek heeltemal', openbareWeek({ ...VOL, gepubliseer: undefined }), null)

/* Die veld is 'n BOOLEAN in Firestore. 'n String "true" of 'n 1 wat iewers
   ingesluip het, mag nooit as ja tel nie — dit is presies hoe 'n halwe
   program lewendig gaan. */
for (const sleg of ['true', 'ja', 1, 'yes', {}, []]) {
  is(`gepubliseer as ${JSON.stringify(sleg)} tel nie`, openbareWeek({ ...VOL, gepubliseer: sleg }), null)
}
is('null is nie n week nie', openbareWeek(null), null)
is('n string is nie n week nie', openbareWeek('week 1'), null)
is('n week sonder nommer', openbareWeek({ ...VOL, weeknommer: undefined }), null)
is('week 0', openbareWeek({ ...VOL, weeknommer: 0 }), null)
is('week 53', openbareWeek({ ...VOL, weeknommer: 53 }), null)
is('week 1.5', openbareWeek({ ...VOL, weeknommer: 1.5 }), null)

console.log('\n── Wat NOOIT oor die netwerk mag gaan nie ──\n')
const uit = openbareWeek(VOL)
for (const veld of [
  'doel', 'weekKern',
  'fasiliteerderHoofpunt', 'fasiliteerderGrens', 'fasiliteerderWaarskuwing',
  'pastoraleRisiko',
  'groepVraag1', 'groepVraag2', 'groepVraag3', 'groepVraag4',
  'hersieningStatus', 'kontroles',
  'gepubliseer', 'opgedateer',
]) {
  vals(`${veld} gaan nie uit nie`, Object.prototype.hasOwnProperty.call(uit, veld))
}

/* Die witlys is die belofte oor die TOEKOMS. Voeg iemand more 'n veld by en
   vergeet daarvan, moet dit NIE uitkom nie. */
uit && is('n onbekende nuwe veld kom nie deur nie',
  Object.prototype.hasOwnProperty.call(openbareWeek({ ...VOL, interneNota: 'moet nog nagegaan word' }), 'interneNota'),
  false)

console.log('\n── Wat WEL moet deurkom ──\n')
for (const veld of ['weeknommer', 'titel', 'openingskerm', 'primereSkrif', 'videoId',
                    'kernwaarheid', 'eenSin', 'gebed', 'privaatRefleksie',
                    'gehoorsaamheidStap', 'wallpaper', 'dag2Skrif', 'dag2Prompt',
                    'moreTeaser']) {
  is(`${veld} kom deur`, uit[veld], VOL[veld])
}
is('die weeknommer is n GETAL', typeof openbareWeek({ ...VOL, weeknommer: '1' }).weeknommer, 'number')

/* 'n Leë veld word weggelaat, nie as leë string gestuur nie — dan kan die
   skerm se `{week.eenSin && ...}` sy werk doen. */
vals('n lee veld word weggelaat',
  Object.prototype.hasOwnProperty.call(openbareWeek({ ...VOL, eenSin: '' }), 'eenSin'))

/* Elke veld op die witlys moet ook werklik iets wees wat die skerm teken.
   Hierdie toets is 'n rem op 'n witlys wat oor tyd slordig groei. */
is('die witlys het geen duplikate nie', new Set(OPENBARE_VELDE).size, OPENBARE_VELDE.length)

console.log('\n── Watter nommers is lewendig ──\n')
const W = (n, pub) => ({ weeknommer: n, gepubliseer: pub })
is('net die gepubliseerdes',
   gepubliseerdeNommers([W(1, true), W(2, false), W(3, true)]), [1, 3])
is('in volgorde, nie soos hulle kom nie',
   gepubliseerdeNommers([W(3, true), W(1, true), W(2, true)]), [1, 2, 3])
is('duplikate val weg', gepubliseerdeNommers([W(1, true), W(1, true)]), [1])
is('rommel val weg', gepubliseerdeNommers([W(0, true), W(53, true), W('x', true), null, W(1, true)]), [1])
is('geen lys nie', gepubliseerdeNommers(null), [])
is('n lee lys', gepubliseerdeNommers([]), [])

console.log('\n── Hoe ver loop die program ──\n')
/* AANEENLOPEND vanaf 1. Publiseer iemand per ongeluk week 9 voor week 2, mag
   die program nie daarheen spring nie — dan val 'n mens by week 2 vas sonder
   om te weet hoekom. */
is('niks', tot([]), 0)
is('net week 1', tot([1]), 1)
is('1 tot 3', tot([1, 2, 3]), 3)
is('n gat by 2 stop by 1', tot([1, 3, 4, 9]), 1)
is('sonder week 1 is daar niks', tot([2, 3]), 0)
is('al 52', tot(Array.from({ length: 52 }, (_, i) => i + 1)), 52)

console.log('\n── Die boodskap wat vanself skuif ──\n')
/* Dewald: "as ek week 2 oplaai skryf die boodskap agter week 2 en se week 3
   kom binnekort." Die nommer word AFGELEI, nooit getik. */
is('niks gepubliseer, geen boodskap', binnekort([]), null)
is('net week 1 → week 2 kom', binnekort([1]).volgende, 2)
is('en die kop se dit ook', binnekort([1]).kop, 'WEEK 2 KOM BINNEKORT')
is('week 1 en 2 → week 3 kom', binnekort([1, 2]).volgende, 3)
is('week 1..12 → week 13 kom', binnekort([1,2,3,4,5,6,7,8,9,10,11,12]).volgende, 13)
/* Die einde. Nie "week 53 kom binnekort" nie. */
const alles = Array.from({ length: 52 }, (_, i) => i + 1)
is('by 52 is daar geen volgende', binnekort(alles).volgende, null)
waar('en die kop se die pad is klaar', /HELE PAD/.test(binnekort(alles).kop))
/* 'n Gat beteken die program loop nie verder nie, en die boodskap moet
   daaroor eerlik wees. */
is('n gat: die boodskap praat van week 2', binnekort([1, 5, 6]).volgende, 2)

console.log('\n── Watter week wys ons vir hierdie mens ──\n')
is('niks gepubliseer', kiesWeek(1, []), { nommer: null, wag: false, klaar: 0 })
is('nuwe mens, week 1 lewendig', kiesWeek(1, [1]), { nommer: 1, wag: false, klaar: 1 })
is('geen geheue, begin by 1', kiesWeek(null, [1]), { nommer: 1, wag: false, klaar: 1 })
is('rommel in localStorage', kiesWeek('abc', [1]), { nommer: 1, wag: false, klaar: 1 })
is('n 0 word 1', kiesWeek(0, [1]), { nommer: 1, wag: false, klaar: 1 })
is('n negatiewe word 1', kiesWeek(-4, [1]), { nommer: 1, wag: false, klaar: 1 })
is('by week 2 met 3 lewendig', kiesWeek(2, [1, 2, 3]), { nommer: 2, wag: false, klaar: 3 })
/* Die geval waaroor dit gaan: hy het week 1 klaargemaak en week 2 bestaan
   nog nie. Hy kry die binnekort-skerm, nie 'n lee blad nie. */
is('verby die laaste week', kiesWeek(2, [1]), { nommer: null, wag: true, klaar: 1 })
is('ver verby die laaste week', kiesWeek(40, [1]), { nommer: null, wag: true, klaar: 1 })

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
