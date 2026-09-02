/* Loop met:  node src/data/tydMetGod.toets.mjs
 *
 * Vandag se Tyd met God se reëls, sonder 'n skerm.
 *
 * Die twee wat die meeste saak maak, staan onder:
 *
 *   · 'n skerm sonder inhoud BESTAAN nie — daar is nooit 'n leë skerm nie;
 *   · het iemand vandag iets in die gebedskassie getik, word daar VANDAG nie
 *     vir geld gevra nie.
 *
 * Albei is die soort reël wat oor ses maande terugsluip sodra iemand "net
 * hierdie een keer" 'n uitsondering maak.
 */

import {
  dagSleutel, maandSleutel, leegStaat, rolDag, bouStappe, kaartToestand,
  slotVraag, magVraGeld, opsomming, maandSin,
  merkGeluister, merkGelees, merkGebid, merkGetik, merkHart, merkStap, merkKlaar,
  DAG_BEGIN_UUR,
} from './tydMetGod.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  const gelyk = JSON.stringify(kry) === JSON.stringify(wag)
  if (gelyk) reg++
  else { val++; console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`) }
}

const VOL = {
  id: 'n1', title: 'Nie my wil nie',
  scripture: 'Lukas 22:42',
  wallpaperUrl: 'https://x/wp.jpg',
}

console.log('\n-- Die dag begin VYFUUR, nie middernag nie --')
/* Dewald: "ek sien dis al reg van middernag al het ek nog nie die nuwe
   boodskap opgelaai nie."

   Om middernag het die vloei teruggestel en die kaart het "Jou tyd met God is
   gereed" gese terwyl die nuutste nota nog GISTER s'n was. */
{
  const op = (d, u, m = 0) => dagSleutel(new Date(2026, 8, d, u, m).getTime())

  is('23:45 is nog dieselfde dag',    op(1, 23, 45), '2026-09-01')
  is('00:30 is NIE al more nie',      op(2, 0, 30),  '2026-09-01')
  is('04:59 ook nog nie',             op(2, 4, 59),  '2026-09-01')
  is('05:00 begin die nuwe dag',      op(2, 5, 0),   '2026-09-02')
  is('en 06:30, die kennisgewing',    op(2, 6, 30),  '2026-09-02')

  /* Die belangrikste hek. Die oggendkennisgewing gaan 06:30 uit; begin die
     dag NA daardie tyd, sien elkeen wat die kennisgewing druk 'n uur lank
     GISTER se toestand, en wie gister klaargemaak het lees "Jy het vandag tyd
     met God gemaak" terwyl hy nog nie begin het nie. */
  is('die begin-uur is voor die 06:30-kennisgewing', DAG_BEGIN_UUR < 6, true)
  is('en na middernag',                              DAG_BEGIN_UUR > 0, true)

  /* Die klok word teruggeskuif en dan word die datum gelees: dit hanteer
     maandeinde en skrikkeljaar sonder dat ons self daaraan hoef te dink. */
  is('maandeinde loop reg', dagSleutel(new Date(2026, 9, 1, 2, 0).getTime()), '2026-09-30')
  is('jaareinde ook',       dagSleutel(new Date(2027, 0, 1, 3, 0).getTime()), '2026-12-31')
  is('skrikkeljaar ook',    dagSleutel(new Date(2028, 2, 1, 1, 0).getTime()), '2028-02-29')

  is('en die maand daarby', maandSleutel(new Date(2026, 8, 2, 9, 30).getTime()), '2026-09')
  is('syfers word opgevul', dagSleutel(new Date(2026, 0, 5, 12).getTime()), '2026-01-05')
}

console.log('\n── \'n Nuwe dag maak die dag skoon, nie die maand nie ──')
{
  const gister = { ...leegStaat(), dag: '2026-09-01', stap: 3, gebid: 2, getik: true, hart: true,
                   geluister: 'n1', gelees: true, klaarOp: '2026-09-01',
                   maand: '2026-09', gebidMaand: 14, daeMaand: 6 }
  const vandag = rolDag(gister, '2026-09-02')
  is('die stap begin oor',      vandag.stap, 0)
  is('gister se gebede is weg', vandag.gebid, 0)
  is('en die kassie ook',       vandag.getik, false)
  is('en die hart',             vandag.hart, false)
  is('en die luister',          vandag.geluister, '')
  is('en die lees',             vandag.gelees, false)
  /* Dit is die veld wat NOOIT hier gewis word nie — daaraan hang "het hy
     vandag reeds klaargemaak". */
  is('klaarOp bly staan',       vandag.klaarOp, '2026-09-01')
  is('die maand se gebede bly', vandag.gebidMaand, 14)
  is('en die dae ook',          vandag.daeMaand, 6)
}
{
  const augustus = { ...leegStaat(), dag: '2026-08-31', maand: '2026-08', gebidMaand: 40, daeMaand: 20 }
  const september = rolDag(augustus, '2026-09-01')
  is('\'n nuwe maand stel die maand terug', september.gebidMaand, 0)
  is('en die dae ook',                      september.daeMaand, 0)
}

console.log('\n── \'n Skerm sonder inhoud BESTAAN nie ──')
is('alles daar → ses skerms', bouStappe(VOL),
   ['luister', 'woord', 'wallpaper', 'dra', 'hart', 'klaar'])
is('geen Skrifverwysing → geen "Lees die Woord"',
   bouStappe({ ...VOL, scripture: '' }),
   ['luister', 'wallpaper', 'dra', 'hart', 'klaar'])
is('geen wallpaper → geen "Vat dit saam"',
   bouStappe({ ...VOL, wallpaperUrl: '' }),
   ['luister', 'woord', 'dra', 'hart', 'klaar'])
is('nie een van die twee nie',
   bouStappe({ id: 'n1' }),
   ['luister', 'dra', 'hart', 'klaar'])
/* Die veld is ingevul, maar met iets wat die Bybel nie kan oopmaak nie. 'n
   Knoppie wat niks doen nie is erger as geen knoppie — dus geen skerm. */
is('onleesbare verwysing → geen skerm',
   bouStappe({ ...VOL, scripture: 'Boek van Elvis 3' }),
   ['luister', 'wallpaper', 'dra', 'hart', 'klaar'])
is('\'n reeks tel wel',
   bouStappe({ ...VOL, scripture: 'Matteus 6:25–34' }),
   ['luister', 'woord', 'wallpaper', 'dra', 'hart', 'klaar'])
is('geen nota → steeds nooit \'n stukkende lys nie',
   bouStappe(null), ['luister', 'dra', 'hart', 'klaar'])
/* 'luister' staan altyd daar, ook wanneer hy reeds geluister het — anders
   maak die vloei op "Lees die Woord" oop en niemand weet waar hy is nie. */
is('luister staan altyd eerste', bouStappe(VOL)[0], 'luister')

console.log('\n── Die kaart op Luister: vier toestande ──')
const DAG = '2026-09-01'
is('geen nota → geen kaart',
   kaartToestand({ nota: null, staat: leegStaat(), dag: DAG }), 'geen')
is('nog nie begin nie',
   kaartToestand({ nota: VOL, staat: leegStaat(), dag: DAG }), 'begin')
is('halfpad → GAAN VOORT',
   kaartToestand({ nota: VOL, staat: { ...leegStaat(), dag: DAG, stap: 2 }, dag: DAG }), 'voort')
is('klaar vandag',
   kaartToestand({ nota: VOL, staat: { ...leegStaat(), dag: DAG, klaarOp: DAG }, dag: DAG }), 'klaar')
/* Die fout wat volgJesusBegin.js laat bestaan het: gister se vordering mag
   nie vandag as "GAAN VOORT" wys nie. */
is('gister se stap tel nie vandag nie',
   kaartToestand({ nota: VOL, staat: { ...leegStaat(), dag: '2026-08-31', stap: 4 }, dag: DAG }), 'begin')
is('gister se klaar tel nie vandag nie',
   kaartToestand({ nota: VOL, staat: { ...leegStaat(), dag: '2026-08-31', klaarOp: '2026-08-31' }, dag: DAG }), 'begin')

console.log('\n── Die een vraag aan die einde ──')
const OOP = { staat: leegStaat(), daeOop: 30 }
is('die meeste dae: deel',   slotVraag({ ...OOP }), 'deel')
is('skenk-venster oop',      slotVraag({ ...OOP, skenkDue: true }), 'skenk')
is('wie reeds gee, word bedank', slotVraag({ ...OOP, skenkDue: true, reedsGegee: true }), 'dankie')
is('en nie gevra nie, ook sonder venster', slotVraag({ ...OOP, reedsGegee: true }), 'dankie')

console.log('\n── Nooit geld op \'n dag wat iemand sy hart oopgemaak het nie ──')
/* Die belangrikste reël in hierdie lêer. Iemand wat pas geskryf het dat sy
   huwelik in stukke lê, is nie die mens vir 'n R50-vraag drie skerms later
   nie. Dit geld ONGEAG die venster. */
{
  const getik = { ...leegStaat(), getik: true }
  is('getik → deel, nie skenk nie',
     slotVraag({ staat: getik, skenkDue: true, daeOop: 300 }), 'deel')
  is('getik → ook nie "dankie" nie, net deel',
     slotVraag({ staat: getik, skenkDue: true, reedsGegee: true, daeOop: 300 }), 'deel')
  is('en die popup word ook gekeer', magVraGeld(getik), false)
  is('op \'n gewone dag mag die popup', magVraGeld(leegStaat()), true)
  is('geen staat → mag',               magVraGeld(null), true)
}

console.log('\n── \'n Nuwe mens word nooit vir geld gevra nie ──')
is('dag 1',  slotVraag({ staat: leegStaat(), skenkDue: true, daeOop: 1 }), 'deel')
is('dag 0',  slotVraag({ staat: leegStaat(), skenkDue: true, daeOop: 0 }), 'deel')
is('dag 2 mag', slotVraag({ staat: leegStaat(), skenkDue: true, daeOop: 2 }), 'skenk')

console.log('\n── Die kwitansie lieg nooit ──')
{
  const s = merkGetik(merkGebid(merkGebid(merkGelees(merkGeluister(leegStaat(), 'n1')))))
  is('alles wat hy gedoen het',
     opsomming({ staat: s, nota: VOL, skrifOpskrif: 'Lukas 22:42' }),
     ['Jy het na vandag se boodskap geluister',
      'Jy het Lukas 22:42 gelees',
      'Jy het vir 2 mense gebid',
      'Jy het jou hart voor God gebring'])

  /* Wie niks getik het nie, mag NIE lees dat hy sy hart voor God gebring
     het nie. Een vals reël maak die hele skerm 'n leuen. */
  const sonder = merkGebid(merkGeluister(leegStaat(), 'n1'))
  is('niks getik → daardie reël bestaan nie',
     opsomming({ staat: sonder, nota: VOL, skrifOpskrif: 'Lukas 22:42' }),
     ['Jy het na vandag se boodskap geluister', 'Jy het vir iemand anders gebid'])

  is('niks gedoen → geen reëls', opsomming({ staat: leegStaat(), nota: VOL }), [])

  /* Het hy na 'n ANDER nota geluister (die vorige dag s'n in die lys), tel
     dit nie as vandag se boodskap nie. */
  is('\'n ander nota tel nie',
     opsomming({ staat: merkGeluister(leegStaat(), 'ander'), nota: VOL }), [])

  /* Gelees sonder 'n opskrif om te noem, sê niks — beter as "jy het  gelees". */
  is('gelees sonder opskrif sê niks',
     opsomming({ staat: merkGelees(leegStaat()), nota: VOL, skrifOpskrif: '' }), [])

  is('een gebed is enkelvoud',
     opsomming({ staat: merkGebid(leegStaat()), nota: VOL }), ['Jy het vir iemand anders gebid'])
}

console.log('\n── Die maandreël wys nooit \'n nul nie ──')
/* "Jy het hierdie maand vir 0 mense gebid" is die teenoorgestelde van wat
   hierdie skerm moet doen. */
is('nul sê niks',   maandSin({ ...leegStaat(), gebidMaand: 0 }), '')
is('een',           maandSin({ ...leegStaat(), gebidMaand: 1 }), 'Hierdie maand het jy vir iemand gebid.')
is('sestien',       maandSin({ ...leegStaat(), gebidMaand: 16 }), 'Hierdie maand het jy vir 16 mense gebid.')
is('geen staat',    maandSin(null), '')

console.log('\n── Die merke ──')
{
  is('geluister hou die nota-id', merkGeluister(leegStaat(), 'n7').geluister, 'n7')
  is('leë id doen niks',          merkGeluister(leegStaat(), '').geluister, '')
  is('twee keer tel een keer',    merkGeluister(merkGeluister(leegStaat(), 'n7'), 'n7').geluister, 'n7')

  const twee = merkGebid(merkGebid(leegStaat()))
  is('twee gebede, dag',   twee.gebid, 2)
  is('twee gebede, maand', twee.gebidMaand, 2)

  /* Die stap gaan net vorentoe. Gaan iemand terug na skerm 2, mag die kaart
     op Luister nie skielik weer "BEGIN" sê nie. */
  is('stap gaan vorentoe',       merkStap(leegStaat(), 3).stap, 3)
  is('en nooit terug nie',       merkStap(merkStap(leegStaat(), 4), 2).stap, 4)
  is('gemors verander niks',     merkStap(merkStap(leegStaat(), 4), NaN).stap, 4)
  is('en \'n string ook nie',    merkStap(merkStap(leegStaat(), 4), 'x').stap, 4)

  /* Twee keer klaarmaak op een dag is EEN dag. Anders tel iemand wat drie
     keer deurgaan as drie dae, en dan is die getal 'n leuen. */
  const een = merkKlaar(leegStaat(), DAG)
  is('klaar merk die dag',   een.klaarOp, DAG)
  is('en tel een dag',       een.daeMaand, 1)
  is('weer klaar tel nie weer', merkKlaar(een, DAG).daeMaand, 1)
  is('môre tel wel weer',    merkKlaar(een, '2026-09-02').daeMaand, 2)
}

console.log('\n── Niks gooi op gemors nie ──')
for (const gemors of [null, undefined, {}, { dag: 5 }, 'x']) {
  const s = rolDag(gemors, DAG)
  is(`rolDag(${JSON.stringify(gemors)}) gee 'n volledige staat`,
     Object.keys(leegStaat()).every(k => k in s), true)
}


console.log('\n-- "Hy het sy hart gebring" is NIE dieselfde as "hy het getik" nie --')
/* Dit is 'n fout wat ek amper gestuur het. Albei was EEN veld, en elke pad
   deur skerm 5 het dit gemerk -- ook 'n mens wat niks getik het nie. Die klein
   skenk-knoppies op die klaar-skerm sou dus NOOIT gewys het nie, nie een dag
   nie.

   Die reel wat hulle skei is die regte een: die geldvraag word deur WOORDE
   gekeer, want dit is die woorde wat se dat iemand swaarkry. */
{
  const netHart = merkHart(leegStaat())
  is('privaat sonder woorde: die kwitansie eis dit wel',
     opsomming({ staat: netHart, nota: VOL }), ['Jy het jou hart voor God gebring'])
  is('maar die geldvraag word NIE gekeer nie', magVraGeld(netHart), true)
  is('en die slotvraag mag skenk',
     slotVraag({ staat: netHart, skenkDue: true, daeOop: 30 }), 'skenk')

  const metWoorde = merkGetik(leegStaat())
  is('woorde getik: die kwitansie eis dit ook',
     opsomming({ staat: metWoorde, nota: VOL }), ['Jy het jou hart voor God gebring'])
  is('en NOU word die geldvraag gekeer', magVraGeld(metWoorde), false)
  is('en die slotvraag word deel',
     slotVraag({ staat: metWoorde, skenkDue: true, daeOop: 30 }), 'deel')

  /* getik impliseer altyd hart -- die twee mag nooit uitmekaar dryf nie. */
  is('getik merk die hart ook', metWoorde.hart, true)
  is('hart alleen merk nie getik nie', netHart.getik, false)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
