/* ────────────────────────────────────────────────────────────
   Pastorale Sorg se suiwer logika.

     node src/data/sorg.toets.mjs

   Wat hier getoets word, is die goed wat 'n mens NIE op die skerm sien
   verkeerd loop nie:

   · Die karakterreeks-fout. '[ -<>]' lyk soos vier karakters maar is 'n
     reeks van spasie tot <. Dit het al twee keer in hierdie projek gebeur en
     dit gooi stil-stil syfers en spasies uit iemand se boodskap. Sien
     CLAUDE.md.
   · Die krisiswoorde. 'n Gemiste tref laat iemand alleen.
   · Die bestuurskode. Dit is die enigste bewys dat 'n anonieme plasing syne
     is; dit mag nooit botsende of onleesbare kodes maak nie.
   ──────────────────────────────────────────────────────────── */

import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { krisisTreffers, kontakTreffers, plat, isKrisis } from './sorgKrisis.js'
import { keurOnderwerp, ONDERWERPE, BREE_ONDERWERP, onderwerpBy } from './sorgOnderwerpe.js'
import { versVir, SORG_VERSE } from './sorgVerse.js'
import { hoopVir, volgensBehoefte, weekVideo } from './sorgVideos.js'

const hier = path.dirname(fileURLToPath(import.meta.url))
const wortel = path.resolve(hier, '..', '..')

let gedruip = 0
const kyk = (naam, waar, ekstra) => {
  if (waar) console.log('  ok    ' + naam)
  else {
    gedruip++
    console.log('  DRUIP ' + naam + (ekstra !== undefined ? ' — ' + JSON.stringify(ekstra) : ''))
  }
}
const afdeling = n => console.log('\n' + n)

/* ── Die suiwer funksies uit api/sorg-stuur.mjs ──
   Ons kan die lêer nie invoer nie — hy voer Firestore in en hy verwag 'n
   diensrekening. Ons sny die suiwer stukke uit en loop hulle. */
const bron = fs.readFileSync(path.join(wortel, 'api', 'sorg-stuur.mjs'), 'utf8')
const begin = bron.indexOf('function vandagSAST')
const eind = bron.indexOf('async function haalInstellings')
const M = new Function('crypto', bron.slice(begin, eind) +
  '\nreturn { vandagSAST, skoonTeks, skoonNaam, hasToestel, maakKode }')(
  (await import('node:crypto')).default)

afdeling('Beheerkarakters — die karakterreeks-fout')
{
  const T = M.skoonTeks
  kyk('syfers bly', T('Ek is 43 en ek is moeg', 100) === 'Ek is 43 en ek is moeg', T('Ek is 43 en ek is moeg', 100))
  kyk('spasies bly', T('een twee drie', 100) === 'een twee drie', T('een twee drie', 100))
  kyk('koppeltekens bly', T('my ma-hulle', 100) === 'my ma-hulle', T('my ma-hulle', 100))
  kyk('kleiner-as bly', T('5 < 10', 100) === '5 < 10', T('5 < 10', 100))
  kyk('groter-as bly', T('a > b', 100) === 'a > b', T('a > b', 100))
  kyk('ampersand bly', T('ek & my man', 100) === 'ek & my man', T('ek & my man', 100))
  kyk('aanhalings bly', T('sy het "nee" gese', 100) === 'sy het "nee" gese', T('sy het "nee" gese', 100))
  kyk('aksente bly', T('ek is moeg, dit gaan sleg mét alles', 100) === 'ek is moeg, dit gaan sleg mét alles')

  const metNul = 'a' + String.fromCharCode(0) + 'b'
  kyk('NUL uit', T(metNul, 100) === 'a b', T(metNul, 100))
  const metEsc = 'a' + String.fromCharCode(27) + 'b'
  kyk('ESC uit', T(metEsc, 100) === 'a b', T(metEsc, 100))
  const metDel = 'a' + String.fromCharCode(127) + 'b'
  kyk('DEL uit', T(metDel, 100) === 'a b', T(metDel, 100))

  /* Nuwe reels is die vorm van iemand se boodskap. Hulle MOET bly — 'n mens
     skryf sy swaar ding in paragrawe. */
  kyk('nuwe reels bly', T('een\ntwee', 100) === 'een\ntwee', T('een\ntwee', 100))
  kyk('drie of meer nuwe reels word twee', T('een\n\n\n\ntwee', 100) === 'een\n\ntwee', T('een\n\n\n\ntwee', 100))
  kyk('afgekap op lengte', T('abcdefghij', 4) === 'abcd')
  kyk('leeg is leeg', T(null, 100) === '' && T(undefined, 100) === '')
}

afdeling('Die naam')
{
  const N = M.skoonNaam
  kyk('voornaam bly', N('Dewald') === 'Dewald')
  kyk('van val weg', N('Dewald Scheepers') === 'Dewald', N('Dewald Scheepers'))
  kyk('nommer val weg', N('Dewald 0821234567') === 'Dewald', N('Dewald 0821234567'))
  kyk('aksente bly', N('Reneé') === 'Reneé', N('Reneé'))
  kyk('leeg is leeg', N('') === '' && N(null) === '')
  kyk('net syfers gee niks', N('0821234567') === '', N('0821234567'))
}

afdeling('Die bestuurskode')
{
  const kodes = new Set()
  for (let i = 0; i < 3000; i++) kodes.add(M.maakKode())
  kyk('3000 kodes, geen botsing', kodes.size === 3000, kodes.size)
  const een = M.maakKode()
  kyk('vorm is XXXX-XXXX-XXXX', /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(een), een)
  kyk('geen 0 O 1 I', ![...kodes].some(k => /[01OI]/.test(k)))
}

afdeling('Die toestel-has')
{
  const H = M.hasToestel
  kyk('leeg gee leeg', H('') === '' && H(null) === '')
  kyk('dieselfde toestel, dieselfde has', H('abc') === H('abc'))
  kyk('ander toestel, ander has', H('abc') !== H('abd'))
  kyk('die rou waarde kom nie deur nie', !H('abc').includes('abc'))
  kyk('vaste lengte', H('abc').length === 32)
}

afdeling('Die dag (SAST)')
{
  kyk('vorm is JJJJ-MM-DD', /^\d{4}-\d{2}-\d{2}$/.test(M.vandagSAST()), M.vandagSAST())
}

afdeling('Die krisiswoorde')
{
  const tref = t => krisisTreffers(t).length > 0

  kyk('selfmoord', tref('ek dink heeltyd aan selfmoord'))
  kyk('Selfmoord met hoofletter', tref('Selfmoord is al waaraan ek dink'))
  kyk('self-moord met koppelteken', tref('ek dink aan self-moord'), krisisTreffers('ek dink aan self-moord'))
  kyk('nie meer wil lewe', tref('ek wil nie meer lewe nie'))
  kyk('myself seermaak', tref('ek wil myself seermaak'))
  kyk('pille', tref('ek het al die pille gedrink'))
  kyk('kind in gevaar', tref('my kind word geslaan by die skool'))
  kyk('geweld', tref('hy slaan my as hy drink'))
  kyk('verkragting', tref('ek is verkrag toe ek jonk was'))
  kyk('Engels tref ook', tref('I want to kill myself'))

  kyk('gewone hartseer tref NIE', !tref('ek is baie hartseer oor my werk'), krisisTreffers('ek is baie hartseer oor my werk'))
  kyk('geldnood tref NIE', !tref('ek weet nie hoe ek die maand gaan klaarmaak nie'))
  kyk('leeg tref NIE', !tref('') && !tref(null))

  kyk('isKrisis stem saam', isKrisis('ek dink aan selfmoord') && !isKrisis('ek is moeg'))
  kyk('plat slaan aksente plat', plat('MÉT Aksénte') === 'met aksente', plat('MÉT Aksénte'))
}

afdeling('Kontakbesonderhede word gemerk')
{
  kyk('telefoonnommer', kontakTreffers('bel my by 0821234567').length === 1, kontakTreffers('bel my by 0821234567'))
  kyk('nommer met spasies', kontakTreffers('082 123 4567').length === 1)
  kyk('e-posadres', kontakTreffers('stuur vir my by iemand@voorbeeld.co.za').includes('n e-posadres'))
  kyk('adres', kontakTreffers('ek bly by 12 Kerkstraat').includes('n adres'), kontakTreffers('ek bly by 12 Kerkstraat'))
  kyk('gewone teks word nie gemerk nie', kontakTreffers('ek is moeg en ek weet nie meer nie').length === 0)
  kyk('dit verander die teks nie', typeof kontakTreffers('0821234567') === 'object')
}

afdeling('Die onderwerpe')
{
  kyk('elke sleutel is uniek', new Set(ONDERWERPE.map(o => o.sleutel)).size === ONDERWERPE.length)
  kyk('elkeen het \'n naam en \'n sin', ONDERWERPE.every(o => o.naam && o.sin))
  kyk('onbekend word ander', keurOnderwerp('bloupers') === 'ander')
  kyk('leeg word ander', keurOnderwerp('') === 'ander' && keurOnderwerp(null) === 'ander')
  kyk('bekende bly', keurOnderwerp('angs') === 'angs')
  kyk('die bree onderwerp bestaan', !!onderwerpBy(BREE_ONDERWERP))
}

afdeling('Die vers en die gebed')
{
  kyk('elke onderwerp het een', ONDERWERPE.every(o => !!SORG_VERSE[o.sleutel]), ONDERWERPE.filter(o => !SORG_VERSE[o.sleutel]).map(o => o.sleutel))
  kyk('onbekend val terug', versVir('bloupers') === SORG_VERSE.ander)
  kyk('elkeen het \'n verwysing en \'n gebed', Object.values(SORG_VERSE).every(v => v.verwysing && v.verwysing.kode && v.verwysing.hoofstuk && v.verwysing.vers && v.gebed))

  /* GEEN VERSTEKS IN DIE KODE NIE. Die woorde kom uit die GAB in die app.
     'n Afrikaanse vers wat 'n mens uit die geheue tik, is verkeerd, en die
     GAB is CC BY-NC-ND — die teks mag nooit oorgetik word nie. */
  kyk('geen versteks in die lêer nie', !fs.readFileSync(path.join(wortel, 'src', 'data', 'sorgVerse.js'), 'utf8').includes('teks:'))

  /* Die boekkodes moet in die Bybel se lys bestaan, anders wys daar niks. */
  const boeke = fs.readFileSync(path.join(wortel, 'src', 'data', 'bybelBoeke.js'), 'utf8')
  const stukkend = Object.values(SORG_VERSE)
    .map(v => v.verwysing.kode)
    .filter(k => !new RegExp(`['"]?${k}['"]?\\s*:`).test(boeke))
  kyk('elke boekkode bestaan', stukkend.length === 0, stukkend)
}

afdeling('Die onmiddellike hoop — daar mag nooit \'n leë hand wees nie')
{
  const v = (id, onderwerpe) => ({ id, videoId: 'x' + id, titel: id, onderwerpe })

  kyk('geen video\'s gee null', hoopVir('angs', { videos: [], week: null }) === null)

  const presies = hoopVir('angs', { videos: [v('a', ['angs']), v('b', ['rou'])], week: null })
  kyk('presies die onderwerp', presies.video.id === 'a', presies)

  const bree = hoopVir('geld', { videos: [v('a', ['rou']), v('b', [BREE_ONDERWERP])], week: null })
  kyk('val terug op die bree een', bree.video.id === 'b', bree)

  const enige = hoopVir('geld', { videos: [v('a', ['rou'])], week: 'a' })
  kyk('val terug op die week se video', enige.video.id === 'a', enige)

  const geenMerk = hoopVir('geld', { videos: [v('a', [])], week: null })
  kyk('val terug op enige video', geenMerk.video.id === 'a', geenMerk)

  kyk('elke onderwerp kry iets', ONDERWERPE.every(o =>
    hoopVir(o.sleutel, { videos: [v('a', [])], week: null }) !== null))
}

afdeling('Die biblioteek')
{
  const v = (id, onderwerpe) => ({ id, videoId: 'x' + id, titel: id, onderwerpe })
  const g = volgensBehoefte([v('a', ['angs']), v('b', ['angs', 'rou']), v('c', [])])
  kyk('geen leë groep nie', g.every(x => x.videos.length > 0))
  kyk('n video by twee onderwerpe wys twee keer', g.filter(x => x.videos.some(y => y.id === 'b')).length === 2)
  kyk('ongemerkte video verdwyn nie', g.some(x => x.videos.some(y => y.id === 'c')))
  kyk('week se video is altyd iets', weekVideo({ videos: [v('a', [])], week: null }).id === 'a')
  kyk('geen video\'s gee null', weekVideo({ videos: [], week: null }) === null)
}

afdeling('Die noodnommers')
{
  const nommers = fs.readFileSync(path.join(wortel, 'src', 'data', 'sorgNommers.js'), 'utf8')
  const skerms = ['src/screens/Sorg.jsx', 'src/components/SorgVorm.jsx', 'src/components/SorgKlaar.jsx']
  /* EEN plek. 'n Nommer wat op 'n skerm hardgekodeer staan, is die nommer wat
     eendag verkeerd bly wanneer die res reggemaak is. */
  const oortree = skerms.filter(s =>
    /\b(0800\s?567\s?567|10111|10177)\b/.test(fs.readFileSync(path.join(wortel, s), 'utf8')))
  kyk('geen skerm het \'n nommer in die kode nie', oortree.length === 0, oortree)
  kyk('SADAG is daar', nommers.includes('0800 567 567'))
  kyk('Childline is daar', nommers.includes('116'))
}

console.log(gedruip ? `\n${gedruip} GEDRUIP` : '\nalles geslaag')
process.exit(gedruip ? 1 : 0)
