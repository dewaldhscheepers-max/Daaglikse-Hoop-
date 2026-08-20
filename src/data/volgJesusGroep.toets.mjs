/* Die groep se reels, voordat enige skerm of Firestore bestaan.
 *
 * Dewald: "ek wil he dit moet 100000% werk soos dit moet ... daar is GEEN
 * PLEKKE VIR FOUTE NIE."
 *
 * Hierdie leer is waar die meeste van daardie foute gevang word, want alles
 * hier is suiwer: 'n kode, 'n naam, 'n boodskap, 'n telling. Wat hier deurkom,
 * kom by 'n mens se skerm uit.
 *
 * Die beheerkarakters hieronder staan as UITGESKRYFDE ontsnappings. Skryf 'n
 * mens hulle rou, is die leer 'n "binary file" met 'n NUL-greep in — sien
 * CLAUDE.md se "Twee foute wat oor en oor gebeur". Ek het daardie fout in
 * hierdie einste leer gemaak terwyl ek hom skryf.
 */
import {
  keurGroepkode, maakGroepkode, KODE_LETTERS,
  keurVertoonnaam, keurGroepnaam, keurGemeente,
  keurBoodskap, MAKS_BOODSKAP,
  isFasiliteerder, isEienaar, magLees, magStuur, magNooi,
  magUitvee, magVasspeld, magChatVerwyder, inChat, wysNaam, magVerlaat,
  ongeleesTel, ongeleesWoorde, uitnodiging, nooiNudge,
} from './volgJesusGroep.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)
const vals = (n, k) => is(n, !!k, false)

console.log('\n── Die groepkode ──\n')
is('n gewone kode', keurGroepkode('FJ4827'), 'FJ4827')
is('kleinletters word groot', keurGroepkode('fj4827'), 'FJ4827')
is('spasies val weg', keurGroepkode(' FJ 4827 '), 'FJ4827')
is('n koppelteken ook', keurGroepkode('FJ-4827'), 'FJ4827')
for (const [naam, sleg] of [
  ['leeg', ''], ['null', null], ['undefined', undefined],
  ['te kort', 'FJ482'], ['te lank', 'FJ48277'],
  ['syfers voor', '48FJ27'], ['net letters', 'FJABCD'],
  ['n punt in', 'FJ.4827'], ['n getal', 4827],
  ['n hele sin', 'ons groep se kode is FJ4827'],
]) is(`${naam} gee niks`, keurGroepkode(sleg), '')

console.log('\n── Die kode word gebou ──\n')
is('uit die naam — let op: die O word oorgeslaan omdat dit soos n 0 lyk',
   maakGroepkode('Fontana Jongmense', [0, 0, 0.4827]), 'FN4827')
is('spasies en leestekens tel nie', maakGroepkode('St. Marks!', [0, 0, 0.1]), 'ST1000')
vals('geen I in die letterstel', KODE_LETTERS.includes('I'))
vals('geen O nie', KODE_LETTERS.includes('O'))
{
  /* Elke moontlike uitkoms moet 'n GELDIGE kode wees — anders maak die
     bediener 'n kode wat sy eie keuring weier. */
  let almalGeldig = true
  for (let i = 0; i < 400; i++) {
    const e = [i / 400, (i * 7 % 400) / 400, (i * 13 % 400) / 400]
    for (const naam of ['', '1234', 'Ω', 'Fontana', 'a', 'Ida']) {
      if (!keurGroepkode(maakGroepkode(naam, e))) almalGeldig = false
    }
  }
  waar('elke gemaakte kode kom deur sy eie keuring', almalGeldig)
}
is('n 0.9999 loop nie oor na 5 syfers nie', maakGroepkode('AB', [0, 0, 0.99999]).length, 6)

console.log('\n── Name ──\n')
is('n gewone naam', keurVertoonnaam('Dewald').waarde, 'Dewald')
is('spasies word ingekort', keurVertoonnaam('  Dewald   Scheepers ').waarde, 'Dewald Scheepers')
vals('een karakter is te kort', keurVertoonnaam('D').ok)
vals('leeg', keurVertoonnaam('').ok)
vals('net spasies', keurVertoonnaam('    ').ok)
vals('n opstel', keurVertoonnaam('x'.repeat(31)).ok)
waar('presies 30 pas', keurVertoonnaam('x'.repeat(30)).ok)
is('n groepnaam', keurGroepnaam('Fontana Jongmense').waarde, 'Fontana Jongmense')
vals('n groepnaam van twee', keurGroepnaam('FJ').ok)
waar('die gemeente mag leeg wees', keurGemeente('').ok)
is('en dit gee n lee string', keurGemeente('').waarde, '')
is('n gemeente', keurGemeente(' Fontana ').waarde, 'Fontana')

console.log('\n── Beheerkarakters kom nerens in nie ──\n')
/* Die fout wat hierdie kodebasis al twee keer gemaak het. Sien CLAUDE.md. */
is('n NUL in n naam word gestroop', keurVertoonnaam('De\u0000wald').waarde, 'Dewald')
is('n regsafleier ook', keurVertoonnaam('Dew\u200fald').waarde, 'Dewald')
is('en n reelskeier', keurVertoonnaam('Dew\u2028ald').waarde, 'Dewald')
is('en n onsigbare spasie', keurVertoonnaam('Dew\u200bald').waarde, 'Dewald')
is('maar syfers en spasies bly', keurVertoonnaam('Groep 3').waarde, 'Groep 3')
is('en aksente bly', keurVertoonnaam('André').waarde, 'André')

console.log('\n── n Boodskap ──\n')
is('n gewone boodskap', keurBoodskap('Hierdie het my getref.').waarde, 'Hierdie het my getref.')
waar('en dit is ok', keurBoodskap('Hallo').ok)
vals('leeg is nie ok nie', keurBoodskap('').ok)
is('en leeg se niks — die knoppie is net dood', keurBoodskap('').fout, '')
vals('net spasies', keurBoodskap('   \n  ').ok)
is('nuwe reels BLY', keurBoodskap('Een\n\nTwee').waarde, 'Een\n\nTwee')
is('windows-reels word skoongemaak', keurBoodskap('Een\r\nTwee').waarde, 'Een\nTwee')
is('ses lee reels word drie', keurBoodskap('A\n\n\n\n\n\nB').waarde, 'A\n\n\nB')
is('n NUL word gestroop', keurBoodskap('Hal\u0000lo').waarde, 'Hallo')

{
  /* §51: MOENIE stilweg afkap nie. */
  const lank = 'x'.repeat(MAKS_BOODSKAP + 1)
  const r = keurBoodskap(lank)
  vals('een karakter te veel word geweier', r.ok)
  is('en dit word NIE afgekap nie', r.waarde, '')
  waar('en dit se hoeveel te veel', /1 karakters te lank/.test(r.fout))
  waar('presies 4000 pas', keurBoodskap('x'.repeat(MAKS_BOODSKAP)).ok)
}
{
  /* 'n Emoji is EEN karakter vir 'n mens en twee vir JavaScript. 'n Perk wat
     met .length tel, sny halfpad deur 'n emoji. */
  const emoji = '🙏'.repeat(2000)
  is('2000 emoji is 2000 karakters, nie 4000 nie', keurBoodskap(emoji).telling, 2000)
  waar('en dit pas', keurBoodskap(emoji).ok)
  vals('4001 emoji pas nie', keurBoodskap('🙏'.repeat(4001)).ok)
}

console.log('\n── Wie mag wat ──\n')
const deelnemer = { uid: 'a', rol: 'deelnemer', status: 'aktief' }
const fasil     = { uid: 'f', rol: 'fasiliteerder', status: 'aktief' }
const weg       = { uid: 'w', rol: 'deelnemer', status: 'weg' }
const verwyder  = { uid: 'v', rol: 'fasiliteerder', status: 'verwyder' }
const groep     = { eienaar: 'f', ledeMagNooi: true, naam: 'Fontana', kode: 'FJ4827' }

waar('n aktiewe lid lees', magLees(deelnemer))
vals('wie weg is, lees nie', magLees(weg))
vals('wie verwyder is, lees nie — ook n fasiliteerder nie', magLees(verwyder))
vals('niks is nie n lid nie', magLees(null))
waar('n aktiewe lid stuur', magStuur(deelnemer))
vals('wie weg is, stuur nie', magStuur(weg))
vals('n verwyderde fasiliteerder is nie n fasiliteerder nie', isFasiliteerder(verwyder))
waar('die eienaar', isEienaar(groep, 'f'))
vals('nie iemand anders nie', isEienaar(groep, 'a'))
vals('en nie sonder uid nie', isEienaar(groep, ''))

console.log('\n── Nooi ──\n')
waar('by verstek mag elke lid nooi', magNooi(groep, deelnemer))
vals('wie weg is, nooi nie', magNooi(groep, weg))
{
  const toe = { ...groep, ledeMagNooi: false }
  vals('is dit toegemaak, mag n deelnemer nie', magNooi(toe, deelnemer))
  waar('maar die fasiliteerder wel', magNooi(toe, fasil))
}

console.log('\n── Uitvee en modereer ──\n')
const myne  = { uid: 'a', teks: 'x' }
const ander = { uid: 'b', teks: 'x' }
waar('ek vee my eie uit', magUitvee(deelnemer, myne))
vals('nie iemand anders sn nie', magUitvee(deelnemer, ander))
waar('die fasiliteerder modereer', magUitvee(fasil, ander))
vals('maar nie as hy weg is nie', magUitvee({ ...fasil, status: 'weg' }, ander))
waar('die fasiliteerder speld vas', magVasspeld(fasil))
vals('n deelnemer nie', magVasspeld(deelnemer))

console.log('\n── Die eienaar mag nie sommer loop nie ──\n')
waar('n gewone lid loop vry', magVerlaat(groep, 'a', 5).ok)
vals('die eienaar met ander lede nie', magVerlaat(groep, 'f', 5).ok)
waar('en dit se hoekom', /Dra eers die groep/.test(magVerlaat(groep, 'f', 5).fout))
waar('die eienaar alleen mag loop', magVerlaat(groep, 'f', 1).ok)
waar('en dan word die groep geargiveer', magVerlaat(groep, 'f', 1).argiveer)

console.log('\n── Die ongeleesde telling ──\n')
const B = (id, uid) => ({ id, uid, teks: 'x' })
const lys = [B('1', 'b'), B('2', 'a'), B('3', 'b'), B('4', 'b')]
is('niks gelees nie: al die ander se boodskappe', ongeleesTel(lys, null, 'a'), 3)
is('my eie tel nooit', ongeleesTel(lys, null, 'b'), 1)
is('na boodskap 2', ongeleesTel(lys, '2', 'a'), 2)
is('na die laaste', ongeleesTel(lys, '4', 'a'), 0)
is('n lee lys', ongeleesTel([], '4', 'a'), 0)
is('geen lys', ongeleesTel(null, '4', 'a'), 0)
is('uitgevee tel nie', ongeleesTel([B('1', 'b'), { ...B('2', 'b'), uitgevee: true }], null, 'a'), 1)
is('n onbekende merk gee alles', ongeleesTel(lys, 'weg-99', 'a'), 3)

console.log('\n── Die woorde op die knoppie ──\n')
is('niks', ongeleesWoorde(0), 'GROEP')
is('een', ongeleesWoorde(1), '1 NUWE BOODSKAP')
is('vier', ongeleesWoorde(4), '4 NUWE BOODSKAPPE')
is('honderd', ongeleesWoorde(100), '99+ NUWE BOODSKAPPE')
is('rommel', ongeleesWoorde(null), 'GROEP')

console.log('\n── Die uitnodiging ──\n')
{
  const t = uitnodiging(groep, 'https://voorbeeld.local')
  waar('die groep se naam', /Fontana/.test(t))
  waar('die kode staan in die TEKS', /Groepkode: FJ4827/.test(t))
  waar('en ook in die skakel', /join\?kode=FJ4827/.test(t))
  waar('en dit se waaroor dit gaan', /Jesus beter te leer ken/.test(t))
}

console.log('\n── Die nudge hou op sodra die groep lewe ──\n')
waar('alleen', /saam met jou begin/.test(nooiNudge(1)))
waar('twee', /reeds twee/.test(nooiNudge(2)))
is('drie of meer: stil', nooiNudge(3), '')
is('en dit tel nie soos n wedstryd nie', nooiNudge(40), '')

console.log('\n── Uit die GROEPCHAT, maar nie uit die groep nie ──\n')
{
  const groep = { id: 'g1', eienaar: 'u-dewald' }
  const fasil = { uid: 'u-dewald', rol: 'fasiliteerder', status: 'aktief' }
  const tweedeFasil = { uid: 'u-tweede', rol: 'fasiliteerder', status: 'aktief' }
  const lid = { uid: 'u-maria', rol: 'deelnemer', status: 'aktief' }
  const bMaria = { id: 'b1', uid: 'u-maria', teks: 'nonsens' }
  const bDewald = { id: 'b2', uid: 'u-dewald', teks: 'my eie' }

  is('n fasiliteerder mag', magChatVerwyder(fasil, bMaria, groep), true)
  is('n deelnemer nie', magChatVerwyder(lid, bMaria, groep), false)
  is('nie op sy EIE boodskap nie', magChatVerwyder(fasil, bDewald, groep), false)
  /* Sou 'n tweede fasiliteerder die eienaar kon stilmaak, kon hy die groep
     oorneem. */
  is('en nooit op die EIENAAR nie', magChatVerwyder(tweedeFasil, bDewald, groep), false)
  is('n tweede fasiliteerder mag wel n gewone lid', magChatVerwyder(tweedeFasil, bMaria, groep), true)

  is('geen boodskap', magChatVerwyder(fasil, null, groep), false)
  is('n boodskap sonder uid', magChatVerwyder(fasil, { id: 'x' }, groep), false)
  is('geen lid', magChatVerwyder(null, bMaria, groep), false)
  is('sonder n groep werk dit steeds', magChatVerwyder(fasil, bMaria, null), true)

  console.log('\n── Wie in die chat is ──\n')
  is('n gewone lid is binne', inChat(lid), true)
  is('wie voor hierdie dag aangesluit het ook', inChat({ status: 'aktief' }), true)
  is('wie uitgehaal is, is buite', inChat({ ...lid, chatAf: true }), false)
  is('en false beteken binne', inChat({ ...lid, chatAf: false }), true)
  /* Die veld mag nooit 'n string wees nie, maar as dit een word, moet dit NIE
     stilweg as "uit" tel nie — dan is 'n datafout 'n mens wat stilgemaak is. */
  is('n string tel nie as uit nie', inChat({ ...lid, chatAf: 'true' }), true)
  is('wie nie meer n lid is nie, is buite', inChat({ ...lid, status: 'verwyder' }), false)
}

console.log('\n── Wanneer die naam bo n boodskap wys ──\n')
{
  const nadia1 = { id: 'b1', uid: 'u-nadia', naam: 'Nadia' }
  const nadia2 = { id: 'b2', uid: 'u-nadia', naam: 'Nadia' }
  const dewald = { id: 'b3', uid: 'u-dewald', naam: 'Dewald' }
  const weg    = { id: 'b4', uid: 'u-nadia', naam: 'Nadia', uitgevee: true }

  is('die eerste boodskap kry n naam', wysNaam(null, nadia1), true)
  is('twee agtereen van dieselfde mens: net een naam', wysNaam(nadia1, nadia2), false)
  is('n ander spreker kry n naam', wysNaam(nadia1, dewald), true)

  /* Dewald: "nadat Nadia haar boodskap verwyder het en weer n boodskap gestuur
     het, toe wys haar naam nie saam die laaste boodskap nie."
     Die uitgeveede boodskap bly in die lys, maar op die skerm staan daar
     "Hierdie boodskap is verwyder" in die middel — en dan hang 'n naamlose bel
     onder 'n vreemde reel. */
  is('NA n uitgeveede boodskap kom die naam terug', wysNaam(weg, nadia2), true)
  is('ook al is dit dieselfde mens', wysNaam(weg, nadia2), true)
  is('en ook vir n ander mens', wysNaam(weg, dewald), true)

  is('geen boodskap', wysNaam(nadia1, null), false)
  is('geen vorige EN geen boodskap', wysNaam(null, null), false)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
