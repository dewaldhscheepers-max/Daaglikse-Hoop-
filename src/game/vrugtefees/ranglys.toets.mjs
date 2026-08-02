/* Toets die bediener se keuring van 'n ingestuurde lopie.

   Ons voer die werklike API-lêer in. Dit toets terselfdertyd dat die
   invoerketting werk — api/vrugtefees-ranglys.mjs is ESM en trek
   src/game/vrugtefees/oes.js in, wat weer die enjin intrek. As daardie
   ketting ooit breek, breek hierdie toets voordat dit ontplooi word.

   Loop met:  node src/game/vrugtefees/ranglys.toets.mjs */

import { magRuil } from './enjin.js'
import { beginOes, oesSkuif, dagSleutel, dagSaad } from './oes.js'
import { keurLopie, skoonNaam, rangorde, MAKS_SKUIWE } from '../../../api/vrugtefees-ranglys.mjs'

let geslaag = 0, gedruip = 0
function is(naam, a, b) {
  if (JSON.stringify(a) === JSON.stringify(b)) geslaag++
  else {
    gedruip++
    console.log(`  ✗ ${naam}\n      gekry:   ${JSON.stringify(a)}\n      verwag:  ${JSON.stringify(b)}`)
  }
}
function waar(naam, v) { is(naam, !!v, true) }
function kop(t) { console.log(`\n── ${t} ──`) }

/* Speel 'n eerlike lopie en skryf die skuiwe neer, net soos die skerm. */
function eerlikeLopie(saad, maks = 200) {
  const lopie = beginOes(saad)
  const skuiwe = []
  let wagter = 0
  while (!lopie.klaar && skuiwe.length < maks && wagter++ < 3000) {
    const keuses = []
    for (let r = 0; r < 8; r++)
      for (let k = 0; k < 8; k++)
        for (const [dk, dr] of [[1, 0], [0, 1]]) {
          const a = { k, r }, b = { k: k + dk, r: r + dr }
          if (b.k < 8 && b.r < 8 && magRuil(lopie.bord, a, b)) keuses.push([a, b])
        }
    if (!keuses.length) break
    const [a, b] = keuses[skuiwe.length % keuses.length]
    if (!oesSkuif(lopie, a, b).geldig) break
    skuiwe.push([a.k, a.r, b.k, b.r])
  }
  return { lopie, skuiwe }
}

const NOU = new Date('2026-08-02T12:00:00Z')
const VANDAG = dagSleutel(NOU)

/* ── Name ── */
kop('Name')
is('gewone naam', skoonNaam('Dewald'), 'Dewald')
is('spasies word saamgetrek', skoonNaam('  Dewald   Scheepers '), 'Dewald Scheepers')
is('syfers is toegelaat', skoonNaam('Speler 7'), 'Speler 7')
is('Afrikaanse leestekens bly', skoonNaam("Ma se kind"), 'Ma se kind')
is('aksente bly', skoonNaam('José'), 'José')
is('leeg word geweier', skoonNaam('   '), null)
is('te lank word geweier', skoonNaam('x'.repeat(21)), null)
is('presies 20 is goed', skoonNaam('x'.repeat(20)), 'x'.repeat(20))
is('merktaal word geweier', skoonNaam('<script>'), null)
is('aanhalings word geweier', skoonNaam('hy "sê"'), null)
is('nie-string word geweier', skoonNaam(42), null)
is('beheerkarakters word geweier', skoonNaam('a\u0000b'), null)
// 'n Nuwe reel oorleef nie: \s+ trek dit na 'n gewone spasie saam.
is('nuwe reël word \'n spasie', skoonNaam('a\nb'), 'a b')

/* ── Rangorde ── */
kop('Rangorde')
waar('meer punte kom eerste', rangorde({ punte: 900, rondes: 2 }, { punte: 100, rondes: 9 }) < 0)
waar('gelyke punte word deur rondes geskei', rangorde({ punte: 100, rondes: 5 }, { punte: 100, rondes: 2 }) < 0)
is('heeltemal gelyk bly gelyk', rangorde({ punte: 100, rondes: 2 }, { punte: 100, rondes: 2 }), 0)

/* ── Die oneindige oes ── */
kop('Oneindige Oes — eerlike lopies')
{
  let getoets = 0
  for (const saad of [1, 99, 5000, 123456, 777777]) {
    const { lopie, skuiwe } = eerlikeLopie(saad)
    if (skuiwe.length < 3) continue
    getoets++
    const uit = keurLopie({ soort: 'oneindig', saad, skuiwe }, NOU)
    is(`saad ${saad}: aanvaar`, uit.fout, undefined)
    is(`saad ${saad}: die bediener se punte is die speler s'n`, uit.punte, lopie.punte)
    is(`saad ${saad}: rondes klop`, uit.rondes, lopie.rondesKlaar)
  }
  waar(`vyf lopies is nagegaan (${getoets})`, getoets === 5)
}

kop('Oneindige Oes — wat geweier word')
{
  const { skuiwe } = eerlikeLopie(31337)
  waar('eerlik is goed', !keurLopie({ soort: 'oneindig', saad: 31337, skuiwe }, NOU).fout)

  is('geen soort', keurLopie({ saad: 1, skuiwe }, NOU).fout, 'onbekende soort')
  is('vreemde soort', keurLopie({ soort: 'gratis punte', saad: 1, skuiwe }, NOU).fout, 'onbekende soort')
  is('geen skuiwe', keurLopie({ soort: 'oneindig', saad: 1, skuiwe: [] }, NOU).fout, 'geen skuiwe')
  is('skuiwe is nie \'n lys nie', keurLopie({ soort: 'oneindig', saad: 1, skuiwe: 'baie' }, NOU).fout, 'geen skuiwe')
  is('te veel skuiwe',
     keurLopie({ soort: 'oneindig', saad: 1, skuiwe: new Array(MAKS_SKUIWE + 1).fill([0, 0, 1, 0]) }, NOU).fout,
     'te veel skuiwe')
  is('negatiewe saad', keurLopie({ soort: 'oneindig', saad: -5, skuiwe }, NOU).fout, 'ongeldige saad')
  is('breuk-saad', keurLopie({ soort: 'oneindig', saad: 1.5, skuiwe }, NOU).fout, 'ongeldige saad')
  is('geen liggaam', keurLopie(null, NOU).fout, 'geen lopie')

  waar('\'n ander saad se skuiwe word geweier',
       !!keurLopie({ soort: 'oneindig', saad: 31338, skuiwe }, NOU).fout)

  const gepeuter = skuiwe.map(s => [...s]); gepeuter[2] = [7, 7, 6, 7]
  const uitG = keurLopie({ soort: 'oneindig', saad: 31337, skuiwe: gepeuter }, NOU)
  const eerlik = keurLopie({ soort: 'oneindig', saad: 31337, skuiwe }, NOU)
  waar('\'n veranderde skuif verander die uitslag of word geweier',
       !!uitG.fout || uitG.punte !== eerlik.punte)
}

kop('Die kliënt se eie puntetelling word nooit geglo nie')
{
  const { lopie, skuiwe } = eerlikeLopie(4321)
  const uit = keurLopie({
    soort: 'oneindig', saad: 4321, skuiwe,
    punte: 999999999, rondes: 500, skuiweGedoen: 1,   // alles gelieg
  }, NOU)
  is('die punte kom uit die herspeel', uit.punte, lopie.punte)
  is('die rondes kom uit die herspeel', uit.rondes, lopie.rondesKlaar)
  waar('die leuen kom nie deur nie', uit.punte !== 999999999)
}

/* ── Vandag se Oes ── */
kop('Vandag se Oes')
{
  const saadVandag = dagSaad(VANDAG)
  const { lopie, skuiwe } = eerlikeLopie(saadVandag)

  const uit = keurLopie({ soort: 'daagliks', dag: VANDAG, skuiwe }, NOU)
  is('vandag se lopie word aanvaar', uit.fout, undefined)
  is('punte klop', uit.punte, lopie.punte)
  is('die dag word teruggegee', uit.dag, VANDAG)

  /* Die belangrikste toets van die twee borde: die kliënt mag 'n saad
     saamstuur, maar die bediener bereken dit self uit die dag. Iemand wat
     'n gunstige bord kies, moet niks kry nie. */
  const metVreemdeSaad = keurLopie({ soort: 'daagliks', dag: VANDAG, saad: 12345, skuiwe }, NOU)
  is('die kliënt se saad word geïgnoreer', metVreemdeSaad.punte, lopie.punte)
  is('die bediener gebruik die dag se saad', metVreemdeSaad.saad, saadVandag)

  // 'n Lopie wat op 'n ander bord gespeel is, klop nie met vandag s'n nie.
  const anderBord = eerlikeLopie(saadVandag + 1)
  waar('\'n ander bord se lopie word geweier',
       !!keurLopie({ soort: 'daagliks', dag: VANDAG, skuiwe: anderBord.skuiwe }, NOU).fout)

  is('gister se dag word geweier',
     keurLopie({ soort: 'daagliks', dag: '2026-08-01', skuiwe }, NOU).fout,
     'daardie dag se oes is verby')
  is('môre se dag word geweier',
     keurLopie({ soort: 'daagliks', dag: '2026-08-03', skuiwe }, NOU).fout,
     'daardie dag se oes is verby')
  is('slordige datum word geweier',
     keurLopie({ soort: 'daagliks', dag: '2026-8-2', skuiwe }, NOU).fout, 'ongeldige dag')
  is('geen dag word geweier',
     keurLopie({ soort: 'daagliks', skuiwe }, NOU).fout, 'ongeldige dag')

  // Die dag draai op middernag UTC om, oral op dieselfde oomblik.
  is('net voor middernag is dit nog vandag',
     keurLopie({ soort: 'daagliks', dag: '2026-08-02', skuiwe }, new Date('2026-08-02T23:59:59Z')).fout,
     undefined)
  waar('net na middernag is dit verby',
       !!keurLopie({ soort: 'daagliks', dag: '2026-08-02', skuiwe }, new Date('2026-08-03T00:00:01Z')).fout)
}

console.log('\n' + '─'.repeat(50))
if (gedruip) {
  console.log(`${gedruip} van ${geslaag + gedruip} toetse het gedruip.`)
  process.exit(1)
} else {
  console.log(`Al ${geslaag} toetse slaag.`)
}
