/* Die voer se reëls.
 *
 * Vier dinge wat hierdie toets moet vashou, en elkeen kom uit 'n fout wat
 * hierdie app al gemaak het of wat 'n mens maklik maak:
 *
 *   · die installasievraag kom NÁ die tweede swiep. Vroeër is hoe 'n mens 'n
 *     vreemdeling verloor;
 *   · 'n gedeelde skakel maak DAARDIE clip oop, nie clip 1 nie. Anders is die
 *     boodskap wat sy gekry het 'n leuen;
 *   · 'n clip sonder 'n NAAM wys glad nie. Erkenning is 'n hek;
 *   · die deelboodskap is nooit 'n kaal skakel nie.
 *
 * Loop met:  node src/data/reels.toets.mjs
 */
import {
  BASIS, BRONNE, GEBEURE, SWIEPE_VOOR_VRA, NUUT_BO,
  geldigeId, reelSkakel, idUitPad,
  magWys, skoonLys, volgordeVanaf,
  deelBoodskap, magVraInstalleer, brugVir,
  saaiRnd, meng, ontklont, nuutsteEerste, eenPas, bouVoer,
  BESTE_BO, meesteGedeelEerste, tydVan, versprei, nuutsteVanElkeMaker,
  gesienTel,
  laagsteTel,
  huidigeRondte,
  SWIEPE_VOOR_VRA_GEDEEL,
  vraByEinde,
  SEKONDES_VOOR_EINDE,
} from './reels.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}

const klip = (o) => ({ id: 'k1', bron: 'tiktok', bronId: '7412345678901234567', naam: 'Daaglikse Hoop', ...o })

console.log('\n── Die id ──')
is('n gewone id',      geldigeId('dh-0413'), true)
is('leeg',             geldigeId(''), false)
is('net spasies',      geldigeId('   '), false)
is('null',             geldigeId(null), false)
is('n skuinsstreep',   geldigeId('a/b'), false)
is('te lank',          geldigeId('x'.repeat(121)), false)
is('presies 120',      geldigeId('x'.repeat(120)), true)
is('n beheerkarakter', geldigeId('a\u0000b'), false)
is('n nuwe reel',      geldigeId('a\nb'), false)
/* Die klassieke fout: `[ -<]` sou syfers en spasies verwerp. */
is('syfers is fyn',    geldigeId('0123456789'), true)
is('n koppelteken',    geldigeId('dh-0413'), true)

console.log('\n── Die skakel ──')
is('die volle skakel', reelSkakel('dh-0413'), `${BASIS}/reels/dh-0413`)
is('n ander basis',    reelSkakel('dh-0413', 'https://x.co'), 'https://x.co/reels/dh-0413')
is('n basis met n streep', reelSkakel('dh-0413', 'https://x.co/'), 'https://x.co/reels/dh-0413')
is('n slegte id',      reelSkakel('a/b'), null)
is('leeg',             reelSkakel(''), null)

console.log('\n── Die id uit die pad ──')
is('die gewone pad',   idUitPad('/reels/dh-0413'), 'dh-0413')
is('met n streep',     idUitPad('/reels/dh-0413/'), 'dh-0413')
is('enkelvoud werk ook', idUitPad('/reel/dh-0413'), 'dh-0413')
is('hoofletters',      idUitPad('/REELS/dh-0413'), 'dh-0413')
is('n ander pad',      idUitPad('/hoop/abc'), null)
is('die voer self',    idUitPad('/reels'), null)
is('die tuisblad',     idUitPad('/'), null)
is('leeg',             idUitPad(''), null)
is('null',             idUitPad(null), null)
is('geënkodeer',       idUitPad('/reels/dh%2D0413'), 'dh-0413')
is('twee vlakke diep', idUitPad('/reels/a/b'), null)

console.log('\n── Erkenning is n HEK ──')
/* Dít is die reël wat keer dat ander mense se werk hier sonder hul naam beland. */
is('n volledige klip',       magWys(klip()), true)
is('sonder n naam',          magWys(klip({ naam: '' })), false)
is('n naam van spasies',     magWys(klip({ naam: '   ' })), false)
is('sonder n naam-veld',     magWys({ id: 'k1', bron: 'tiktok', bronId: '7412345678901234567' }), false)
is('sonder n bron',          magWys(klip({ bron: '' })), false)
is('n onbekende bron',       magWys(klip({ bron: 'vimeo' })), false)
is('sonder n bronId',        magWys(klip({ bronId: '' })), false)
is('sonder n id',            magWys(klip({ id: '' })), false)
is('niks',                   magWys(null), false)
is('n lee voorwerp',         magWys({}), false)
for (const b of BRONNE) is(`bron "${b}" mag`, magWys(klip({ bron: b })), true)

console.log('\n── Die lys word skoongemaak ──')
{
  const rou = [klip({ id: 'a' }), klip({ id: 'b', naam: '' }), klip({ id: 'c' }), null, {}]
  is('net wat mag', skoonLys(rou).map(k => k.id), ['a', 'c'])
  is('niks in',     skoonLys(null), [])
  is('nie n lys nie', skoonLys('abc'), [])
}

console.log('\n── Die gedeelde clip staan EERSTE ──')
{
  const lys = [klip({ id: 'a' }), klip({ id: 'b' }), klip({ id: 'c' })]
  is('die derde kom vorentoe', volgordeVanaf(lys, 'c').map(k => k.id), ['c', 'a', 'b'])
  is('die tweede ook',         volgordeVanaf(lys, 'b').map(k => k.id), ['b', 'a', 'c'])
  /* Hy is reeds eerste — dan skuif niks, en die res bly in hul volgorde. */
  is('die eerste bly',         volgordeVanaf(lys, 'a').map(k => k.id), ['a', 'b', 'c'])
  is('n onbekende id',         volgordeVanaf(lys, 'zz').map(k => k.id), ['a', 'b', 'c'])
  is('geen id',                volgordeVanaf(lys, null).map(k => k.id), ['a', 'b', 'c'])
  is('niks verdwyn ooit',      volgordeVanaf(lys, 'c').length, 3)
  is('n lee lys',              volgordeVanaf([], 'c'), [])
  /* 'n Clip wat nie mag wys nie, kan ook nie deur 'n skakel ingebring word nie. */
  is('n verborge clip bly weg',
     volgordeVanaf([klip({ id: 'a' }), klip({ id: 'g', naam: '' })], 'g').map(k => k.id), ['a'])
}

console.log('\n── Die deelboodskap ──')
{
  const skakel = `${BASIS}/reels/dh-0413`
  const eie = deelBoodskap(klip({ eie: true }), skakel)
  const ander = deelBoodskap(klip({ naam: 'Ander bediening' }), skakel)

  is('nooit n kale skakel nie', eie.trim() !== skakel, true)
  is('die skakel is daarin',    eie.includes(skakel), true)
  is('n eie clip noem geen naam', /Ander bediening/.test(eie), false)
  is('n ander se clip NOEM hom', ander.includes('Ander bediening'), true)
  is('dit klink soos n mens',    /aan jou gedink/.test(ander), true)
  /* Dit mag nooit advertensietaal word nie — 'n mens stuur dit aan 'n vriendin. */
  is('geen "laai af"',           /laai.*af/i.test(ander), false)
  is('geen "installeer"',        /installeer/i.test(ander), false)
  is('sonder n skakel bly die sin', deelBoodskap(klip({ eie: true }), '').includes('gedink'), true)
  is('sonder n klip gooi dit nie', typeof deelBoodskap(null, skakel), 'string')
  is('n naamlose clip val terug op die eie sin',
     /van\s+van/.test(deelBoodskap({ }, skakel)), false)
}

console.log('\n── Die installasievraag kom NA die tweede swiep ──')
is('by clip 1 nog nie',   magVraInstalleer({ gesien: 1 }), false)
is('by clip 2 nog nie',   magVraInstalleer({ gesien: 2 }), false)
is('by clip 3 WEL',       magVraInstalleer({ gesien: 3 }), true)
is('en daarna ook',       magVraInstalleer({ gesien: 7 }), true)
is('twee swiepe is die grens', SWIEPE_VOOR_VRA, 2)

console.log('\n── Maar n mens op n GEDEELDE skakel word na EEN swiep gevra ──')
/* Dewald, 12 September 2026: "wanneer iemand die video share en hulle kyk moet
   die popup opkom so 3 sekondes voor die video eindig...... nie na hul paar
   videos gekyk het nie... of as hul op scroll die eerste keer moet popup dadelik
   wys."

   'n Vreemdeling op 'n skakel het op EEN ding gedruk om EEN video te sien. Wag
   ons vir drie clips, is sy weg en die hele skakel was verniet. */
is('gedeel, by clip 1 nog nie',  magVraInstalleer({ gesien: 1, gedeel: true }), false)
is('gedeel, NA die eerste swiep WEL', magVraInstalleer({ gesien: 2, gedeel: true }), true)
is('en daarna ook',              magVraInstalleer({ gesien: 5, gedeel: true }), true)
is('een swiep is die grens',     SWIEPE_VOOR_VRA_GEDEEL, 1)
/* Die drie hekke geld PRESIES dieselfde vir haar. */
is('gedeel: sy het dit reeds',   magVraInstalleer({ gesien: 5, gedeel: true, geinstalleer: true }), false)
is('gedeel: sy is reeds gevra',  magVraInstalleer({ gesien: 5, gedeel: true, reedsGevra: true }), false)
is('gedeel: iets anders is oop', magVraInstalleer({ gesien: 5, gedeel: true, ietsOop: true }), false)
/* En dit mag NIE die gewone kyker se drempel raak nie. */
is('n gewone kyker bly by twee swiepe', magVraInstalleer({ gesien: 2 }), false)

console.log('\n── Drie sekondes voor die einde ──')
/* Die getal is klein met opset: vra te vroeg en jy onderbreek juis die ding
   waarvoor sy gekom het; vra na die einde en die video het klaar weer begin
   (loop=1) en die oomblik is verby. */
is('drie sekondes',        SEKONDES_VOOR_EINDE, 3)
is('by die begin nie',     vraByEinde({ nou: 0, duur: 30 }), false)
is('by die helfte nie',    vraByEinde({ nou: 15, duur: 30 }), false)
is('by 26 van 30 nie',     vraByEinde({ nou: 26, duur: 30 }), false)
is('by 27 van 30 WEL',     vraByEinde({ nou: 27, duur: 30 }), true)
is('by 29 van 30 WEL',     vraByEinde({ nou: 29, duur: 30 }), true)
is('by die einde WEL',     vraByEinde({ nou: 30, duur: 30 }), true)
/* 'n Speler rapporteer soms 30.02 van 30. Dit is nog steeds die einde. */
is('n bietjie oor die einde', vraByEinde({ nou: 30.2, duur: 30 }), true)

/* 'n Video KORTER as die venster self: daar is dan geen "drie sekondes voor die
   einde" nie, en die veiligste oomblik is sodra hy loop. */
is('n video van 2s, by 0',  vraByEinde({ nou: 0, duur: 2 }), false)
is('n video van 2s, by 0.5', vraByEinde({ nou: 0.5, duur: 2 }), true)

/* Gemors mag NOOIT die opspringer laat opkom nie — dit is een van drie kere in
   'n leeftyd. */
is('geen getalle',      vraByEinde({}), false)
is('niks in',           vraByEinde(null), false)
is('n string',          vraByEinde({ nou: 'x', duur: 30 }), false)
is('n lengte van nul',  vraByEinde({ nou: 0, duur: 0 }), false)
is('n negatiewe lengte', vraByEinde({ nou: 1, duur: -5 }), false)
is('n negatiewe posisie', vraByEinde({ nou: -2, duur: 30 }), false)
is('Infinity',          vraByEinde({ nou: Infinity, duur: 30 }), false)
is('NaN',               vraByEinde({ nou: NaN, duur: 30 }), false)

console.log('\n── En die drie dinge wat hom stilhou ──')
is('sy het dit reeds',        magVraInstalleer({ gesien: 5, geinstalleer: true }), false)
is('sy is reeds gevra',       magVraInstalleer({ gesien: 5, reedsGevra: true }), false)
is('iets anders is oop',      magVraInstalleer({ gesien: 5, ietsOop: true }), false)
is('geinstalleer wen oor alles', magVraInstalleer({ gesien: 99, geinstalleer: true }), false)
is('niks in',                 magVraInstalleer(), false)
is('n lee voorwerp',          magVraInstalleer({}), false)
is('null',                    magVraInstalleer(null), false)
is('gesien is n string',      magVraInstalleer({ gesien: '5' }), true)
is('gesien is gemors',        magVraInstalleer({ gesien: 'abc' }), false)

console.log('\n── Die brug bestaan NET vir ons eie clips ──')
{
  const eie = klip({ eie: true, gebeurtenis: 'open-bybel365', brug: 'Begin dag 1' })
  is('n eie clip met n brug', brugVir(eie), { gebeurtenis: 'open-bybel365', woorde: 'Begin dag 1' })
  /* Dit sou lyk of ons iemand anders se werk gebruik om ons bladsye te bemark. */
  is('n ander se clip kry geen brug',
     brugVir({ ...eie, eie: false }), null)
  is('n eie clip sonder gebeurtenis', brugVir(klip({ eie: true, brug: 'Begin' })), null)
  is('n eie clip sonder woorde',      brugVir(klip({ eie: true, gebeurtenis: 'x' })), null)
  is('niks',                          brugVir(null), null)
}

console.log('\n── Wat gemeet word, en wat NOOIT ──')
is('twee gebeure',      GEBEURE, ['gedeel', 'oopgemaak'])
/* 'n Telling per clip is die eerste tree na "watter video het Sarel gedeel". */
is('niks per clip nie', GEBEURE.some(g => /klip|video|id/i.test(g)), false)

/* ════════════════════════════════════════════════════════════
   DIE SKOMMELING

   Dewald, 12 September 2026: *"die nuwe videos moet random bo speel.. nie in
   volgorde soos ek dit paste nie. want anders speel almal van dieselfde persoon
   na mekaar"* — en oor die einde-skerm: *"nee man fok haal dit af... dis
   onvriendelik... dit moet aangaan."*

   Drie dinge word hier vasgehou, en al drie kan stilweg breek:
     · die voer HOU AAN — daar is nooit 'n laaste item nie;
     · geen twee clips van dieselfde mens volg op mekaar nie;
     · die orde is DETERMINISTIES uit 'n saad, want die voer word herbou
       elke keer as 'n pas bykom.
   ════════════════════════════════════════════════════════════ */

const mk = (id, naam, datum) => ({
  id, bron: 'youtube', bronId: 'x'.repeat(11), naam, ...(datum ? { datum } : {}),
})

function klipse(items) { return items.filter(i => i.tipe === 'klip').map(i => i.klip) }
function klonte(items) {
  let n = 0, vorige = null
  for (const it of items) {
    if (it.tipe !== 'klip') continue
    if (vorige && vorige === it.klip.naam) n++
    vorige = it.klip.naam
  }
  return n
}

console.log('\n── Die saad gee ALTYD dieselfde antwoord ──')
{
  const a = meng([1, 2, 3, 4, 5, 6, 7, 8], saaiRnd(42))
  const b = meng([1, 2, 3, 4, 5, 6, 7, 8], saaiRnd(42))
  is('dieselfde saad, dieselfde orde', a, b)
  const c = meng([1, 2, 3, 4, 5, 6, 7, 8], saaiRnd(43))
  is('n ander saad, n ander orde', JSON.stringify(a) !== JSON.stringify(c), true)
  is('niks gaan verlore nie', [...a].sort((x, y) => x - y), [1, 2, 3, 4, 5, 6, 7, 8])
  is('die inset word nie aangeraak nie', (() => {
    const inset = [1, 2, 3]
    meng(inset, saaiRnd(1))
    return inset
  })(), [1, 2, 3])
  is('n lee lys',   meng([], saaiRnd(1)), [])
  is('niks in',     meng(null, saaiRnd(1)), [])
  is('sonder n rnd gooi dit nie', Array.isArray(meng([1, 2, 3])), true)
  /* Elke getal moet tussen 0 en 1 wees, anders is die indeks buite die lys. */
  {
    const r = saaiRnd(9)
    let goed = true
    for (let i = 0; i < 500; i++) { const v = r(); if (!(v >= 0 && v < 1)) goed = false }
    is('elke getal is in [0,1)', goed, true)
  }
}

console.log('\n── Geen twee van dieselfde mens na mekaar nie ──')
{
  /* Drie uit vyf: dit KAN slaag (D _ D _ D), en dit moet. */
  const lys = [mk('a', 'D'), mk('b', 'D'), mk('c', 'A'), mk('d', 'D'), mk('e', 'E')]
  const uit = ontklont(lys, '')
  is('niks gaan verlore nie', uit.length, 5)
  is('elke clip presies een keer', new Set(uit.map(k => k.id)).size, 5)
  let naasmekaar = 0
  for (let i = 1; i < uit.length; i++) if (uit[i].naam === uit[i - 1].naam) naasmekaar++
  is('geen klont', naasmekaar, 0)

  /* Die naat: die clip DIREK hierbo is van 'n ander pas. */
  is('dit begin nie met die vorige naam nie', ontklont([mk('a', 'A'), mk('b', 'B')], 'A')[0].naam, 'B')

  /* Alles van een mens — dit kan nie slaag nie, en dit mag nie omval nie. */
  const een = [mk('a', 'D'), mk('b', 'D'), mk('c', 'D')]
  is('dit gee steeds alles terug', ontklont(een, '').length, 3)
  is('en nie n duplikaat nie', new Set(ontklont(een, '').map(k => k.id)).size, 3)

  is('n lee lys', ontklont([], ''), [])
  is('niks in',   ontklont(null, ''), [])
  is('een item',  ontklont([mk('a', 'D')], 'D').length, 1)
}

console.log('\n── Wanneer n clip GEPOS is ──')
/* Die POST-ID is die waarheid. `datum` is die INVOERTYD — dit loop in happe van
   24, dus kry 24 clips presies dieselfde "nuutste" tydstempel, en dan vul een
   maker se clips die hele bokant. Dewald het dit op 'n regte foon gesien. */
{
  const oud  = { ...mk('a', 'A'), bronId: '7400000000000000000' }
  const nuwe = { ...mk('b', 'B'), bronId: '7400000000000999999' }
  is('n groter post-id is nuwer', tydVan(nuwe) > tydVan(oud), true)
  is('en die sortering volg dit', nuutsteEerste([oud, nuwe]).map(k => k.id), ['b', 'a'])

  /* Die INVOERTYD mag dit nie omkeer nie. Hier is die OU video laas ingevoer. */
  const oudLaasIn  = { ...oud,  datum: '2026-09-12T10:05:00Z' }
  const nuweEersIn = { ...nuwe, datum: '2026-09-12T10:00:00Z' }
  is('die post-id wen oor die invoertyd',
     nuutsteEerste([oudLaasIn, nuweEersIn]).map(k => k.id), ['b', 'a'])

  /* Sonder 'n numeriese id (YouTube) is `datum` die terugval. */
  const y1 = { ...mk('y1', 'A'), bron: 'youtube', bronId: 'aaaaaaaaaaa', datum: '2026-01-01' }
  const y2 = { ...mk('y2', 'B'), bron: 'youtube', bronId: 'bbbbbbbbbbb', datum: '2026-06-01' }
  is('sonder n numeriese id geld datum', nuutsteEerste([y1, y2]).map(k => k.id), ['y2', 'y1'])
  is('n Snowflake groter as MAX_SAFE_INTEGER sorteer reg',
     tydVan({ bronId: '7412345678901234567' }) < tydVan({ bronId: '7412345678901234568' }), true)
  is('niks in gee n leë sleutel', tydVan(null), '')
  is('gemors gee n leë sleutel',  tydVan({ bronId: 'abc' }), '')
}

console.log('\n── Die boonste blok is die nuutste van ELKE maker ──')
/* Die erger helfte van Dewald se klag: was die vyf nuutste clips van EEN mens,
   was die hele bokant syne. */
{
  const p = 7400000000000000000n
  const lys = []
  for (let i = 0; i < 5; i++) lys.push({ ...mk('j' + i, 'Johandre'), bronId: String(p + BigInt(900 + i)) })
  for (let i = 0; i < 5; i++) lys.push({ ...mk('d' + i, 'Dewald'),   bronId: String(p + BigInt(100 + i)) })
  for (let i = 0; i < 3; i++) lys.push({ ...mk('a' + i, 'Ander'),    bronId: String(p + BigInt(50 + i)) })

  const bo = nuutsteVanElkeMaker(lys, 5)
  is('een per maker', new Set(bo.map(k => k.naam)).size, bo.length)
  is('en net drie makers bestaan', bo.length, 3)
  is('Johandre se NUUTSTE is daarby', bo.some(k => k.id === 'j4'), true)
  is('nie sy tweede-nuutste nie',     bo.some(k => k.id === 'j3'), false)
  is('n lee lys', nuutsteVanElkeMaker([], 5), [])
  is('niks in',   nuutsteVanElkeMaker(null, 5), [])
}

console.log('\n── Versprei: elke maker kry n steek eweredig aan sy aandeel ──')
{
  const p = 7400000000000000000n
  const lys = []
  for (let i = 0; i < 60; i++) lys.push({ ...mk('d' + i, 'Dewald'),   bronId: String(p + BigInt(i)) })
  for (let i = 0; i < 30; i++) lys.push({ ...mk('j' + i, 'Johandre'), bronId: String(p + BigInt(200 + i)) })
  for (let i = 0; i < 34; i++) lys.push({ ...mk('x' + i, 'Ander ' + (i % 4)), bronId: String(p + BigInt(100 + i)) })

  function gaping(ry, naam) {
    const pos = ry.map((n, i) => (n === naam ? i : -1)).filter(i => i >= 0)
    let kleinste = Infinity
    for (let i = 1; i < pos.length; i++) kleinste = Math.min(kleinste, pos[i] - pos[i - 1])
    return { aantal: pos.length, kleinste }
  }

  let slegsteBo = 0, slegsteKlont = 0, slegsteGaping = Infinity
  for (let saad = 1; saad <= 60; saad++) {
    const ry = bouVoer(lys, { saad, passe: 1 }).map(i => i.klip.naam)
    /* Geen maker mag die bokant besit nie. */
    slegsteBo = Math.max(slegsteBo, ry.slice(0, 12).filter(n => n === 'Johandre').length)
    for (let i = 1; i < ry.length; i++) if (ry[i] === ry[i - 1]) slegsteKlont++
    slegsteGaping = Math.min(slegsteGaping, gaping(ry, 'Dewald').kleinste)
  }
  /* Johandre het 30 van 124 — sowat 'n kwart. Meer as 4 uit die eerste 12 sou
     beteken die bokant is syne. */
  is('hoogstens 4 van een maker in die eerste 12', slegsteBo <= 4, true)
  is('geen klonte oor 60 sade', slegsteKlont, 0)
  is('en die maker met die MEESTE clips staan nooit langs homself nie',
     slegsteGaping >= 2, true)

  /* Die een met meer clips moet MEER wys. Dit is die hele punt. */
  const ry = bouVoer(lys, { saad: 11, passe: 1 }).map(i => i.klip.naam)
  is('Dewald (60) wys meer as Johandre (30)',
     ry.filter(n => n === 'Dewald').length > ry.filter(n => n === 'Johandre').length, true)

  is('versprei verloor niks', versprei(lys, saaiRnd(3)).length, lys.length)
  is('en dit raak nie die inset nie', lys[0].id, 'd0')
  is('n lys van twee bly',  versprei([mk('a', 'A'), mk('b', 'B')], saaiRnd(1)).length, 2)
  is('n lee lys',           versprei([], saaiRnd(1)), [])
  is('niks in',             versprei(null, saaiRnd(1)), [])
}

console.log('\n── Wat sy REEDS GESIEN het ──')
/* Dewald, 12 September 2026: "as ek uit die app gaan en weer terug gaan wys dit
   dieselfde videos alweer. die kyker mag dit net 2 keer sien as hulle deur al
   die videos gegaan het en nuwe videos altyd eerste.... bo. moet nooit video 2
   keer wys as daar ander videos is wat hul nog nie gekyk het nie."

   Dit was 'n PLEK in die ry (`begin`, uit `reels_laaste`), en dit kon nooit
   werk nie: die ry word by elke oopmaak met 'n nuwe saad herskommel, dus is 'n
   plek in daardie ry niks. Dit is nou 'n LYS van tellings. */
{
  const lys = Array.from({ length: 6 }, (_, i) => mk('k' + i, 'M' + (i % 3)))
  const ids = o => bouVoer(lys, o).filter(i => i.tipe === 'klip').map(i => i.klip.id)

  /* Die hele reël, in een meting: drie is gesien, dus moet die ANDER DRIE
     eerste kom — in watter orde ook al — voordat enigiets herhaal. */
  {
    const ry = ids({ saad: 5, passe: 3, gesien: { k0: 1, k1: 1, k2: 1 } })
    is('die ONGESIENE kom eerste', new Set(ry.slice(0, 3)), new Set(['k3', 'k4', 'k5']))
    is('en niks herhaal voor hulle almal was nie', new Set(ry.slice(0, 3)).size, 3)
  }

  /* Tellings hoef nie almal 1 te wees nie: die LAAGSTE telling is die rondte. */
  {
    const ry = ids({ saad: 8, passe: 2, gesien: { k0: 3, k1: 2, k2: 2, k3: 2, k4: 2, k5: 2 } })
    is('die minste-gesien kom eerste', ry[0] !== 'k0', true)
  }

  /* Alles een keer gesien: dan MAG dit herhaal, en dan net herhaal. */
  {
    const alles = { k0: 1, k1: 1, k2: 1, k3: 1, k4: 1, k5: 1 }
    is('alles gesien: die volle lys kom weer', new Set(ids({ saad: 5, passe: 1, gesien: alles })).size, 6)
    /* En die mylpaal-kaart kom NIE weer nie — "jy het alles gesien" se niks
       nuuts vir iemand wat dit reeds weet, en dan staan die kaart by elke
       oopmaak in die pad. */
    is('en GEEN mylpaal meer nie',
       bouVoer(lys, { saad: 5, passe: 3, gesien: alles }).some(i => i.tipe === 'mylpaal'), false)
  }

  /* 'n Vars kyker: die mylpaal hoort WEL daar, want dit is waar. */
  is('n vars kyker kry die mylpaal',
     bouVoer(lys, { saad: 5, passe: 3, gesien: {} }).some(i => i.tipe === 'mylpaal'), true)

  /* 'n NUWE clip wat hy vandag inplak, het telling 0 — hy staan dus in die
     eerste rondte, by die ongesiene. Dewald: "nuwe videos altyd eerste.... bo." */
  {
    const met = [...lys, mk('nuweklip', 'M9', '2026-09-12')]
    const ry = bouVoer(met, { saad: 4, passe: 2, gesien: { k0: 1, k1: 1, k2: 1, k3: 1, k4: 1, k5: 1 } })
      .filter(i => i.tipe === 'klip').map(i => i.klip.id)
    is('n nuwe clip staan heel bo', ry[0], 'nuweklip')
  }

  /* 'n GEDEELDE skakel wen oor die tellings: daardie clip is die rede waarom sy
     hier is, ook al het sy hom gesien. */
  is('n gedeelde skakel wen oor die tellings',
     ids({ saad: 5, passe: 2, gesien: { k1: 4 }, deepId: 'k1' })[0], 'k1')
  is('en hy kom nie dadelik weer nie',
     ids({ saad: 5, passe: 2, gesien: {}, deepId: 'k1' })[1] !== 'k1', true)

  is('niks gaan verlore nie', new Set(ids({ saad: 5, passe: 1, gesien: {} })).size, 6)
  is('geen tellings',  ids({ saad: 5, passe: 1, gesien: null }).length, 6)
  is('stukkende tellings', ids({ saad: 5, passe: 1, gesien: { k0: 'x', k1: -3 } }).length, 6)
}

console.log('\n── gesienTel, laagsteTel en huidigeRondte ──')
{
  const lys = Array.from({ length: 4 }, (_, i) => mk('k' + i, 'M' + i))
  is('n onbekende id is 0',   gesienTel({}, 'k0'), 0)
  is('n telling kom deur',    gesienTel({ k0: 3 }, 'k0'), 3)
  is('n Map werk ook',        gesienTel(new Map([['k0', 2]]), 'k0'), 2)
  is('niks in',               gesienTel(null, 'k0'), 0)
  is('geen id',               gesienTel({ k0: 1 }, ''), 0)
  /* 'n Stukkende waarde mag nooit 'n clip vorentoe of agtertoe stoot nie. */
  is('n string is 0',         gesienTel({ k0: 'baie' }, 'k0'), 0)
  is('n negatiewe is 0',      gesienTel({ k0: -5 }, 'k0'), 0)
  is('n breuk word afgerond', gesienTel({ k0: 2.9 }, 'k0'), 2)

  is('die laagste telling',   laagsteTel(lys, { k0: 2, k1: 1, k2: 5 }), 0)
  is('almal gesien',          laagsteTel(lys, { k0: 2, k1: 2, k2: 2, k3: 2 }), 2)
  is('n lee lys',             laagsteTel([], { k0: 1 }), 0)

  is('die rondte is die ongesiene',
     huidigeRondte(lys, { k0: 1, k1: 1 }).map(k => k.id), ['k2', 'k3'])
  is('almal gelyk: almal in die rondte',
     huidigeRondte(lys, {}).length, 4)
}

console.log('\n── Die nuutstes staan BO ──')
{
  /* Met datums: die nuutste eerste. */
  const met = [mk('oud', 'A', '2026-01-01'), mk('nuut', 'B', '2026-09-12'), mk('mid', 'C', '2026-05-05')]
  is('op datum gesorteer', nuutsteEerste(met).map(k => k.id), ['nuut', 'mid', 'oud'])
  /* Sonder datums: die LAASTE inskrywing is die nuutste, want dit is hoe 'n
     mens byvoeg. Die plak-volgorde word dus omgekeer, nie gevolg nie. */
  const sonder = [mk('een', 'A'), mk('twee', 'B'), mk('drie', 'C')]
  is('sonder datums is die laaste die nuutste', nuutsteEerste(sonder).map(k => k.id), ['drie', 'twee', 'een'])
  is('die inset word nie aangeraak nie', sonder.map(k => k.id), ['een', 'twee', 'drie'])
  is('n lee lys', nuutsteEerste([]), [])
  is('niks in',   nuutsteEerste(null), [])

  /* Die boonste blok is die nuutste van ELKE maker, nie die nuutste vyf nie —
     anders besit een mens die bokant sodra hy die laaste paar videos gepos het.
     Met 12 clips en 4 makers is dit dus VIER clips, een per mens. */
  const baie = Array.from({ length: 12 }, (_, i) => mk('k' + i, 'M' + (i % 4), '2026-01-' + String(i + 1).padStart(2, '0')))
  const bo = nuutsteVanElkeMaker(baie, NUUT_BO)
  is('een per maker', bo.length, 4)
  is('en elkeen n ander mens', new Set(bo.map(k => k.naam)).size, 4)

  const pas = eenPas(baie, saaiRnd(5), '')
  const boonste = pas.slice(0, bo.length).map(k => k.id)
  is('daardie blok staan bo-aan die pas',
     bo.map(k => k.id).every(id => boonste.includes(id)), true)
  is('vyf is die perk', NUUT_BO, 5)
}

console.log('\n── Die voer HOU AAN ──')
{
  const lys = Array.from({ length: 6 }, (_, i) => mk('k' + i, 'M' + (i % 3)))
  const een  = bouVoer(lys, { saad: 11, passe: 1 })
  const drie = bouVoer(lys, { saad: 11, passe: 3 })
  is('een pas gee een pas',        klipse(een).length, 6)
  is('drie passe gee drie passe',  klipse(drie).length, 18)
  /* Dit is waarom die saad bestaan: die voer word HERBOU wanneer 'n pas bykom,
     en wat sy reeds gesien het, mag nie onder haar vingers herskommel nie. */
  is('die begin bly PRESIES dieselfde',
     klipse(drie).slice(0, 6).map(k => k.id), klipse(een).map(k => k.id))

  const vyf = bouVoer(lys, { saad: 11, passe: 5 })
  is('en dit bly so by vyf passe',
     klipse(vyf).slice(0, 18).map(k => k.id), klipse(drie).map(k => k.id))

  /* Elke pas is 'n ANDER orde — anders is dit dieselfde lys wat herhaal. */
  const p1 = klipse(drie).slice(0, 6).map(k => k.id).join(',')
  const p2 = klipse(drie).slice(6, 12).map(k => k.id).join(',')
  is('pas 2 is n ander orde as pas 1', p1 !== p2, true)
}

console.log('\n── Die mylpaal kom EEN keer, en die voer loop daarna aan ──')
{
  const lys = Array.from({ length: 5 }, (_, i) => mk('k' + i, 'M' + (i % 3)))
  const items = bouVoer(lys, { saad: 3, passe: 4 })
  const mylpale = items.filter(i => i.tipe === 'mylpaal')
  is('presies een mylpaal', mylpale.length, 1)
  const waar = items.findIndex(i => i.tipe === 'mylpaal')
  is('hy staan NA die eerste volle pas', waar, 5)
  /* Dit is die hele punt van Dewald se klag: dit mag nie die einde wees nie. */
  is('daar is nog clips NA hom', items.slice(waar + 1).some(i => i.tipe === 'klip'), true)
  is('en die laaste item is n CLIP, nie die kaart nie', items[items.length - 1].tipe, 'klip')

  /* Een pas alleen: dan is daar nog niks om "alles gesien" te sê. */
  is('een pas dra geen mylpaal', bouVoer(lys, { saad: 3, passe: 1 }).some(i => i.tipe === 'mylpaal'), false)
}

console.log('\n── Die gedeelde clip staan steeds EERSTE ──')
{
  const lys = Array.from({ length: 6 }, (_, i) => mk('k' + i, 'M' + (i % 3)))
  for (const saad of [1, 2, 3, 7, 99]) {
    const items = bouVoer(lys, { saad, passe: 3, deepId: 'k4' })
    is(`saad ${saad}: die belowede clip is eerste`, items[0].klip.id, 'k4')
    /* En hy word nie DADELIK weer gewys nie. */
    is(`saad ${saad}: nie twee keer agter mekaar`, items[1].klip.id !== 'k4', true)
  }
  const items = bouVoer(lys, { saad: 1, passe: 1, deepId: 'k4' })
  is('niks gaan verlore nie', new Set(klipse(items).map(k => k.id)).size, 6)
  is('n onbekende id verander niks', bouVoer(lys, { saad: 1, passe: 1, deepId: 'zz' }).length, 6)
}

console.log('\n── Geen klonte in die egte geval ──')
{
  /* 20 clips van 6 makers — wat die voer werklik gaan wees. */
  const makers = ['Daaglikse Hoop', 'Ander bediening', 'Derde stem', 'Vierde', 'Vyfde', 'Sesde']
  const lys = Array.from({ length: 20 }, (_, i) => mk('k' + i, makers[i % 6]))
  let slegste = 0
  for (let saad = 1; saad <= 120; saad++) {
    slegste = Math.max(slegste, klonte(bouVoer(lys, { saad, passe: 4 })))
  }
  is('oor 120 sade: NUL klonte', slegste, 0)

  /* En dieselfde CLIP mag nooit twee keer agter mekaar nie. */
  let herhaal = 0
  for (let saad = 1; saad <= 120; saad++) {
    const k = klipse(bouVoer(lys, { saad, passe: 4 }))
    for (let i = 1; i < k.length; i++) if (k[i].id === k[i - 1].id) herhaal++
  }
  is('en geen clip twee keer agter mekaar', herhaal, 0)
}

console.log('\n── n NUWE kyker sien die BESTE eerste ──')
/* Dewald: "die wat die meeste ge deel is kry voorkeer by nuwe kykers."
   'n Vreemdeling het nog geen rede om te bly nie; die eerlikste ding wat ons
   vir haar kan wys, is wat ander mense goed genoeg gevind het om te STUUR. */
{
  const met = (id, naam, gedeel) => ({ ...mk(id, naam), gedeel })
  const lys = [
    met('stil', 'A', 0), met('ok', 'B', 30), met('gunsteling', 'C', 900),
    met('goed', 'D', 400), met('swak', 'E', 2), met('niks', 'F', 0),
    met('mid', 'G', 100), met('laag', 'H', 5),
  ]

  is('meeste eerste', meesteGedeelEerste(lys).map(k => k.id).slice(0, 4),
     ['gunsteling', 'goed', 'mid', 'ok'])
  is('n ontbrekende telling is nul',
     meesteGedeelEerste([mk('a', 'A'), met('b', 'B', 5)]).map(k => k.id), ['b', 'a'])
  is('die inset word nie aangeraak nie', lys[0].id, 'stil')
  is('n lee lys', meesteGedeelEerste([]), [])
  is('niks in',   meesteGedeelEerste(null), [])
  is('vyf staan bo', BESTE_BO, 5)

  /* Net die BEWESE clips staan in die voorkeur-blok. Vyf van die agt is gedeel;
     die drie met nul mag NIE in die boonste vyf wees nie. */
  const bewys = meesteGedeelEerste(lys).filter(k => Number(k.gedeel || 0) > 0)
  is('ses clips is werklik gedeel', bewys.length, 6)
  /* Die blok is hoogstens BESTE_BO groot, dus die TOP VYF daarvan. Die sesde
     (die swakste van die gedeeldes) val onder saam met die nulle. */
  const beste = bewys.slice(0, BESTE_BO).map(k => k.id)
  let altyd = true
  for (let saad = 1; saad <= 80; saad++) {
    const eerste = bouVoer(lys, { saad, passe: 2, nuut: true })
      .filter(i => i.tipe === 'klip').slice(0, BESTE_BO).map(i => i.klip.id)
    if (!eerste.every(id => beste.includes(id))) altyd = false
  }
  is('die boonste vyf is ALTYD die top vyf gedeeldes', altyd, true)
  /* En 'n clip met NUL dele kom nooit in daardie blok nie. */
  is('geen ongedeelde clip in die blok', beste.includes('stil') || beste.includes('niks'), false)

  /* Is daar NIKS gedeel nie, val dit terug op die nuutste bo — daar is dan
     niks om voorkeur aan te gee. */
  {
    const geen = [mk('p', 'A'), mk('q', 'B'), mk('r', 'C')]
    const a = bouVoer(geen, { saad: 4, passe: 1, nuut: true }).map(i => i.klip.id)
    const b = bouVoer(geen, { saad: 4, passe: 1 }).map(i => i.klip.id)
    is('sonder enige dele is die orde dieselfde as n bekende kyker s\'n', a, b)
  }

  /* En hulle is nie in dieselfde orde elke keer nie — dit bly geskommel. */
  const a = bouVoer(lys, { saad: 3, passe: 1, nuut: true }).map(i => i.klip.id).join()
  const b = bouVoer(lys, { saad: 44, passe: 1, nuut: true }).map(i => i.klip.id).join()
  is('dit bly geskommel', a !== b, true)

  /* 'n BEKENDE kyker kry die nuutste bo, nie die beste nie. */
  let bekendeKryOokDieBeste = true
  for (let saad = 1; saad <= 80; saad++) {
    const eerste = bouVoer(lys, { saad, passe: 2 })
      .filter(i => i.tipe === 'klip').slice(0, BESTE_BO).map(i => i.klip.id)
    if (!eerste.every(id => beste.includes(id))) bekendeKryOokDieBeste = false
  }
  is('n bekende kyker se orde is ANDERS', bekendeKryOokDieBeste, false)

  /* Die tweede pas is nie meer "nuut" nie: sy het alles een keer gesien. */
  {
    const items = bouVoer(lys, { saad: 9, passe: 3, nuut: true })
    const klips = items.filter(i => i.tipe === 'klip')
    const grens = items.findIndex(i => i.tipe === 'mylpaal')
    const naMylpaal = items.slice(grens + 1).filter(i => i.tipe === 'klip')
      .slice(0, BESTE_BO).map(i => i.klip.id)
    is('en niks gaan verlore nie', new Set(klips.map(k => k.klip.id)).size, lys.length)
    is('die tweede pas is nie weer die top vyf nie',
       naMylpaal.every(id => beste.includes(id)), false)
  }

  /* Die gedeelde clip staan STEEDS eerste — die belofte wen oor die rangorde. */
  is('n gedeelde skakel wen oor die rangorde',
     bouVoer(lys, { saad: 3, passe: 2, nuut: true, deepId: 'niks' })[0].klip.id, 'niks')

  /* Geen klonte nie, ook met die nuwe orde. */
  let slegste = 0
  for (let saad = 1; saad <= 80; saad++) {
    slegste = Math.max(slegste, klonte(bouVoer(lys, { saad, passe: 3, nuut: true })))
  }
  is('steeds geen klonte', slegste, 0)
}

console.log('\n── Niks gooi nie ──')
is('n lee lys',      bouVoer([], { saad: 1, passe: 3 }), [])
is('niks in',        bouVoer(null, { saad: 1, passe: 3 }), [])
is('geen opsies',    Array.isArray(bouVoer([mk('a', 'A')])), true)
is('een clip',       bouVoer([mk('a', 'A')], { saad: 1, passe: 3 }).filter(i => i.tipe === 'klip').length, 3)
is('nul passe word een', bouVoer([mk('a', 'A')], { saad: 1, passe: 0 }).length >= 1, true)
is('n clip wat nie mag wys nie kom nie in',
   bouVoer([mk('a', 'A'), { id: 'b', bron: 'youtube', bronId: 'x' }], { saad: 1, passe: 1 }).length, 1)

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
