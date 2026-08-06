/* ────────────────────────────────────────────────────────────
   Saamstaan — die reels waarvolgens die gemeenskap onder 'n storie reageer.

     node src/data/sorgSaamstaan.toets.mjs

   Twee dinge hier is nie kosmeties nie:

   · 'n Reaksie met NUL mag nooit gewys word nie. Dit is die hele rede
     waarom daar vier is en nie ses nie.
   · Op 'n SENSITIEWE plasing mag daar geen vrye teks wees nie. Dit is die
     enigste reel op hierdie blad wat iemand kan skaad as dit breek.
   ──────────────────────────────────────────────────────────── */

import {
  REAKSIES, keurReaksie, reaksieBy, wysReaksies,
  KLAAR_WOORDE, klaarWoordTeks, MAKS_WOORD,
  skoonWoord, woordVlae, magVryeTeks, woordStatus,
  LEES_VLOER, wysGelees,
} from './sorgSaamstaan.js'

let gedruip = 0
const kyk = (naam, waar, ekstra) => {
  if (waar) console.log('  ok    ' + naam)
  else {
    gedruip++
    console.log('  DRUIP ' + naam + (ekstra !== undefined ? ' — ' + JSON.stringify(ekstra) : ''))
  }
}
const afdeling = n => console.log('\n' + n)

afdeling('Vier reaksies, en hulle bly vier')
{
  kyk('daar is presies vier', REAKSIES.length === 4, REAKSIES.length)
  kyk('elke sleutel is uniek', new Set(REAKSIES.map(r => r.sleutel)).size === 4)
  kyk('elkeen het n teken en n naam', REAKSIES.every(r => r.teken && r.naam))
  kyk('elke naam is uniek', new Set(REAKSIES.map(r => r.naam)).size === 4)
  kyk('n bekende sleutel kom deur', keurReaksie('bid') === 'bid')
  kyk('n onbekende sleutel word niks', keurReaksie('duim') === '')
  kyk('leeg word niks', keurReaksie('') === '')
  kyk('null breek nie', keurReaksie(null) === '')
  kyk('reaksieBy gee die ding', reaksieBy('moed').naam === 'Hou moed')
  kyk('reaksieBy van onbekend gee null', reaksieBy('xyz') === null)
}

afdeling('n Nul word NOOIT gewys nie')
{
  /* Dit is die hele ontwerp. Wys 'n mens nulle, lyk 'n jong muur dooier
     as met een enkele telling. */
  let r = wysReaksies({ bid: 3, hoor: 0, vas: 0, moed: 0 })
  kyk('net die een wat gestuur is wys', r.gewys.length === 1, r.gewys)
  kyk('en dit is die regte een', r.gewys[0].sleutel === 'bid')
  kyk('die totaal is drie', r.totaal === 3, r.totaal)

  r = wysReaksies({})
  kyk('niks gestuur — niks gewys', r.gewys.length === 0 && r.totaal === 0)

  r = wysReaksies(null)
  kyk('null breek nie', r.gewys.length === 0 && r.totaal === 0)

  r = wysReaksies({ bid: 2, hoor: 5, vas: 1, moed: 4 })
  kyk('almal gestuur — almal wys', r.gewys.length === 4)
  kyk('die totaal is die som', r.totaal === 12, r.totaal)
  kyk('die volgorde is vas, nie volgens telling nie',
      r.gewys.map(x => x.sleutel).join(',') === 'bid,hoor,vas,moed',
      r.gewys.map(x => x.sleutel))

  /* Wat mense reeds gedra het, bly gedra. */
  r = wysReaksies({ bid: 2 }, 7)
  kyk('die ou saam-telling tel saam in die totaal', r.totaal === 9, r.totaal)
  r = wysReaksies({}, 5)
  kyk('net die ou telling gee steeds n totaal', r.totaal === 5 && r.gewys.length === 0)

  /* 'n Bediener wat ooit iets simpel stuur, mag nie die skerm breek nie. */
  r = wysReaksies({ bid: -4, hoor: 'twee', vas: null, moed: 1.7 })
  kyk('negatief, teks en null word veilig hanteer',
      r.gewys.length === 1 && r.gewys[0].sleutel === 'moed', r.gewys)
  kyk('n onbekende sleutel in die data word geignoreer',
      wysReaksies({ duim: 99 }).totaal === 0)
}

afdeling('Die klaargemaakte woorde')
{
  kyk('daar is vyf', KLAAR_WOORDE.length === 5, KLAAR_WOORDE.length)
  kyk('elke sleutel is uniek', new Set(KLAAR_WOORDE.map(w => w.sleutel)).size === 5)
  kyk('elkeen is kort genoeg', KLAAR_WOORDE.every(w => w.teks.length <= MAKS_WOORD))
  kyk('nie een is leeg nie', KLAAR_WOORDE.every(w => w.teks.trim().length > 5))

  /* Die kliënt stuur 'n SLEUTEL. Stuur hy die teks, kon iemand enigiets as
     'n "klaargemaakte" woord laat verskyn — sonder hersiening. */
  kyk('n sleutel gee die teks', klaarWoordTeks('alleen') === 'Jy is nie alleen nie.')
  kyk('n onbekende sleutel gee NIKS', klaarWoordTeks('enigiets') === '')
  kyk('leeg gee niks', klaarWoordTeks('') === '')
  kyk('n aanval via die sleutel gee niks',
      klaarWoordTeks('<script>alert(1)</script>') === '')
}

afdeling('n Eie woord word skoongemaak')
{
  kyk('gewone teks bly heel', skoonWoord('Ek bid vir jou.') === 'Ek bid vir jou.')
  kyk('spasies word saamgetrek', skoonWoord('Ek   bid \n\n vir jou') === 'Ek bid vir jou')
  kyk('dit word afgekap op 200', skoonWoord('a'.repeat(400)).length === MAKS_WOORD)
  kyk('leeg bly leeg', skoonWoord('') === '')
  kyk('null breek nie', skoonWoord(null) === '')

  /* Die karakterreeks-valstrik: syfers, spasies en gewone leestekens moet
     deurkom. `[ -<>]` sou hulle almal weggegooi het. */
  kyk('syfers oorleef', skoonWoord('Ek is 3 jaar deur dit') === 'Ek is 3 jaar deur dit')
  kyk('leestekens oorleef', skoonWoord('Sterkte! (regtig) 100%') === 'Sterkte! (regtig) 100%')
  kyk('aksente oorleef', skoonWoord('Mag God jou krag gée') === 'Mag God jou krag gée')
  kyk('n beheerkarakter gaan uit', skoonWoord('Ek' + String.fromCharCode(0) + 'bid') === 'Ek bid')
  kyk('nie een beheerkarakter bly oor',
      !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(skoonWoord('a' + String.fromCharCode(7) + 'b' + String.fromCharCode(31) + 'c')))
}

afdeling('Wat vir Dewald se oog gehou word')
{
  kyk('n skakel word gevlag', woordVlae('kyk by https://x.co').length === 1)
  kyk('www ook', woordVlae('gaan na www.iets.co.za').length === 1)
  kyk('n e-posadres ook', woordVlae('stuur vir my by jan@iets.co.za').length === 1)
  kyk('n telefoonnommer ook', woordVlae('bel my 082 123 4567').length === 1)
  kyk('whatsapp ook', woordVlae('WhatsApp my gerus').length === 1)
  kyk('n gewone sin word nie gevlag nie', woordVlae('Ek bid saam met jou.').length === 0)
  kyk('n jaartal is nie n nommer nie', woordVlae('in 2019 het ek dieselfde beleef').length === 0,
      woordVlae('in 2019 het ek dieselfde beleef'))
  kyk('n vers is nie n nommer nie', woordVlae('Psalm 23 het my gedra').length === 0,
      woordVlae('Psalm 23 het my gedra'))
}

afdeling('SENSITIEWE plasings kry GEEN vrye teks nie')
{
  /* Die belangrikste reel op hierdie blad. Op 'n storie oor iemand wat
     weier om hospitaal toe te gaan, kan "hospitale het my ma doodgemaak"
     iemand se lewe kos — en geen filter vang daardie sin nie, want daar is
     niks verkeerd met die WOORDE nie. */
  kyk('n sensitiewe plasing laat geen vrye teks toe', magVryeTeks({ sensitief: true }) === false)
  kyk('n gewone plasing wel', magVryeTeks({ sensitief: false }) === true)
  kyk('sonder die vlag is dit toegelaat', magVryeTeks({}) === true)

  const s = woordStatus({ teks: 'Net bid, God sal haar genees.', sensitief: true, vertrou: true })
  kyk('selfs n vertroude mens word geweier op n sensitiewe plasing', s.status === 'weier', s)

  const s2 = woordStatus({ teks: 'Net bid.', sensitief: true, vertrou: false })
  kyk('en n nuwe mens ook', s2.status === 'weier', s2)
}

afdeling('Vertroue word verdien')
{
  const gewoon = { teks: 'Ek dink aan jou vandag.', sensitief: false }
  kyk('die eerste keer wag dit', woordStatus({ ...gewoon, vertrou: false }).status === 'wag')
  kyk('daarna gaan dit deur', woordStatus({ ...gewoon, vertrou: true }).status === 'wys')

  kyk('n gevlagde woord wag, ook by n vertroude mens',
      woordStatus({ teks: 'bel my 082 123 4567', sensitief: false, vertrou: true }).status === 'wag')
  kyk('en die rede word gese',
      woordStatus({ teks: 'bel my 082 123 4567', sensitief: false, vertrou: true }).rede
        .includes('telefoonnommer'))

  kyk('te kort word geweier',
      woordStatus({ teks: ' ', sensitief: false, vertrou: true }).status === 'weier')
  kyk('die skoongemaakte teks kom saam terug',
      woordStatus({ teks: '  Ek   bid  ', sensitief: false, vertrou: true }).teks === 'Ek bid')
  kyk('dit word afgekap op 200',
      woordStatus({ teks: 'a'.repeat(500), sensitief: false, vertrou: true }).teks.length === MAKS_WOORD)
}

afdeling('n Klein leestelling word nie gewys nie')
{
  kyk('drie lesers wys niks', wysGelees(3) === 0)
  kyk('nege ook nie', wysGelees(LEES_VLOER - 1) === 0)
  kyk('tien wys wel', wysGelees(LEES_VLOER) === LEES_VLOER)
  kyk('honderd-en-twee-en-veertig wys', wysGelees(142) === 142)
  kyk('nul wys niks', wysGelees(0) === 0)
  kyk('negatief breek nie', wysGelees(-5) === 0)
  kyk('teks breek nie', wysGelees('baie') === 0)
  kyk('null breek nie', wysGelees(null) === 0)
}

console.log(gedruip ? `\n${gedruip} GEDRUIP` : '\nalles geslaag')
process.exit(gedruip ? 1 : 0)
