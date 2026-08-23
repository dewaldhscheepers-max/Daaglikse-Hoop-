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
  KLAAR_WOORDE, VIDEO_KLAAR, klaarWoordeVir, klaarWoordTeks, MAKS_WOORD,
  saamTelReaksies,
  skoonWoord, woordVlae, magVryeTeks, woordStatus,
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
  kyk('spasies BINNE n reel word saamgetrek', skoonWoord('Ek   bid  vir jou') === 'Ek bid vir jou')
  /* ── Die PARAGRAWE bly ──
     Hier het `\s+ → ' '` gestaan, en dit het elke reëlbreuk in 'n spasie
     verander. Dewald het 'n pastorale antwoord getik — 'n groet, vier
     paragrawe, 'n gebed — en dit het as EEN blok teks op die muur beland. */
  kyk('n paragraaf bly n paragraaf',
      skoonWoord('Goeiedag.\n\nEk bid vir jou.') === 'Goeiedag.\n\nEk bid vir jou.',
      skoonWoord('Goeiedag.\n\nEk bid vir jou.'))
  kyk('drie of meer lee reels word twee',
      skoonWoord('een\n\n\n\ntwee') === 'een\n\ntwee', skoonWoord('een\n\n\n\ntwee'))
  kyk('spasies aan die einde van n reel val weg',
      skoonWoord('een   \ntwee') === 'een\ntwee', skoonWoord('een   \ntwee'))
  kyk(`dit word afgekap op ${MAKS_WOORD}`, skoonWoord('a'.repeat(4000)).length === MAKS_WOORD)
  /* Dewald se egte boodskap is sowat 1 200 karakters. Dit moet HEEL deurkom. */
  kyk('n boodskap van 1 200 karakters kom heel deur',
      skoonWoord('a'.repeat(1200)).length === 1200)
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

  const s = woordStatus({ teks: 'Net bid, God sal haar genees.', sensitief: true })
  kyk('vrye teks word geweier op n sensitiewe plasing', s.status === 'weier', s)
}

afdeling('n Gewone woord WYS DADELIK')
{
  /* Dit was nie so nie: die eerste woord van elke toestel het gewag. Die
     meeste mense skryf een keer, dus het die meeste mense hul eie woord
     nooit gesien nie — en dit lyk soos 'n app wat stukkend is. */
  const gewoon = { teks: 'Ek dink aan jou vandag.', sensitief: false }
  kyk('die eerste keer wys dadelik', woordStatus(gewoon).status === 'wys')
  kyk('en die tweede ook', woordStatus(gewoon).status === 'wys')
  kyk('dit hang van NIKS anders af nie',
      woordStatus({ ...gewoon, vertrou: false }).status === 'wys')

  /* Ook wat gevlag is, WYS. Die vlag keer niks — dit se net vir Dewald
     waarna om te kyk, en die woord staan intussen op die muur. */
  const nommer = woordStatus({ teks: 'bel my 082 123 4567', sensitief: false })
  kyk('n telefoonnommer WYS ook', nommer.status === 'wys', nommer)
  kyk('maar dit word gevlag', (nommer.vlae || []).length === 1, nommer)
  kyk('en die rede word gese', String(nommer.rede).includes('telefoonnommer'), nommer)

  const skakel = woordStatus({ teks: 'kyk by https://x.co', sensitief: false })
  kyk('n skakel WYS ook', skakel.status === 'wys', skakel)
  kyk('en word gevlag', (skakel.vlae || []).length === 1, skakel)

  kyk('n skoon sin word NIE gevlag nie',
      (woordStatus(gewoon).vlae || []).length === 0, woordStatus(gewoon))

  /* Die enigste ding wat vrye teks nog keer. */
  kyk('n sensitiewe plasing weier steeds',
      woordStatus({ teks: 'Net bid.', sensitief: true }).status === 'weier')

  kyk('te kort word geweier',
      woordStatus({ teks: ' ', sensitief: false }).status === 'weier')
  kyk('die skoongemaakte teks kom saam terug',
      woordStatus({ teks: '  Ek   bid  ', sensitief: false }).teks === 'Ek bid')
  kyk(`dit word afgekap op ${MAKS_WOORD}`,
      woordStatus({ teks: 'a'.repeat(4000), sensitief: false }).teks.length === MAKS_WOORD)
  kyk('en n lang pastorale antwoord kom heel deur',
      woordStatus({ teks: 'a'.repeat(1200), sensitief: false }).teks.length === 1200)
}


afdeling('Die voorgestelde woorde — muur teenoor video')
{
  const muur  = klaarWoordeVir('muur')
  const video = klaarWoordeVir('video')

  kyk('albei lyste is ewe lank', muur.length === video.length && muur.length === 5)

  /* Die klagte: onder 'n video het "Ek bid vandag saam met jou" gestaan.
     Daar is niemand om saam mee te bid nie — dit is Dewald se eie video. */
  kyk('geen muur-sin onder n video nie',
      video.every(v => !muur.some(m => m.teks === v.teks)), video.map(v => v.teks))
  kyk('en geen emoji-blokkie op die muur nie',
      muur.every(m => !video.some(v => v.teks === m.teks)))

  /* Elke video-blokkie moet KORT wees. 'n Sin hier is presies die fout. */
  kyk('elke video-blokkie is kort', video.every(v => v.teks.length <= 14), video.map(v => v.teks))
  kyk('en elkeen dra n emoji', video.every(v => /\p{Extended_Pictographic}/u.test(v.teks)))

  /* Die sleutels woon in EEN naamruimte, want die bediener soek die teks op
     sleutel op. Bots hulle, kry 'n mens die verkeerde sin onder sy video. */
  const alle = [...muur, ...video].map(w => w.sleutel)
  kyk('geen sleutel bots nie', alle.length === new Set(alle).size, alle)

  for (const w of [...muur, ...video]) {
    kyk('die bediener vind ' + w.sleutel, klaarWoordTeks(w.sleutel) === w.teks)
  }
  kyk('n onbekende sleutel gee niks', klaarWoordTeks('bestaan-nie') === '')

  /* Wat NIE 'video' is nie, moet die muur se lys kry. 'n Tikfout in `soort`
     mag nooit 'n leë ry blokkies gee nie. */
  kyk('onbekende soort val op die muur terug',
      klaarWoordeVir('wat').length === 5 && klaarWoordeVir(undefined)[0].teks === muur[0].teks)
}


afdeling('Die telling na ’n druk — 3 eerstes plus myne is 4')
{
  /* Dewald: "as ek op video react dan wys dit een inplaas van 4."

     'n Video begin met DRIE eerste reaksies in `saai`. Hy druk een keer, en
     die skerm het 1 gewys — sy eie druk, sonder die eerstes. Dit het gelyk of
     sy druk die ander drie doodgemaak het.

     Die oorsaak: die LEES-pad het `reaksies + saai` teruggegee, die DRUK-pad
     net `reaksies`. */
  const eerstes = { bid: 1, hoor: 1, vas: 1 }        // wat saaiReaksies gee
  const egte    = { bid: 1 }                          // sy druk

  const naDruk = saamTelReaksies(egte, eerstes)
  const { totaal } = wysReaksies(naDruk, 0)
  kyk('drie eerstes plus een druk is VIER', totaal === 4, { naDruk, totaal })
  kyk('en sy reaksie tel twee', naDruk.bid === 2, naDruk)

  /* Voor hy druk, moet dit drie wees. */
  kyk('voor die druk is dit drie', wysReaksies(saamTelReaksies({}, eerstes), 0).totaal === 3)

  /* Die lees-pad en die druk-pad moet by dieselfde getal uitkom. Dit is die
     hele fout in een reel. */
  kyk('lees-pad en druk-pad stem ooreen',
      JSON.stringify(saamTelReaksies(egte, eerstes)) === JSON.stringify(saamTelReaksies(eerstes, egte)))

  kyk('niks gee niks', JSON.stringify(saamTelReaksies(null, undefined)) === '{}')
  kyk('gemors word geignoreer', JSON.stringify(saamTelReaksies({ bid: 'x' }, { bid: 2 })) === '{"bid":2}')
  kyk('n plasing sonder eerstes werk ook', saamTelReaksies({ bid: 5 }, undefined).bid === 5)
}

console.log(gedruip ? `\n${gedruip} GEDRUIP` : '\nalles geslaag')
process.exit(gedruip ? 1 : 0)
