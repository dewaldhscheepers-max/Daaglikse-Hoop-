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
import { sorgSkakel, leesSorgSkakel } from './sorgDeel.js'
import { notasVir, boekVir } from './sorgWag.js'

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

afdeling('Deel — die skakel moet by die REGTE ding uitkom')
{
  globalThis.window = globalThis.window || { location: { origin: 'https://daagliksehoop.co.za' } }
  kyk('plasing', sorgSkakel('plasing', 'm1').endsWith('#sorg-plasing-m1'), sorgSkakel('plasing', 'm1'))
  kyk('video', sorgSkakel('video', 'LK-kieYHZJA').endsWith('#sorg-video-LK-kieYHZJA'))
  kyk('lees plasing terug', JSON.stringify(leesSorgSkakel('#sorg-plasing-m1')) === '{"soort":"plasing","id":"m1"}',
      leesSorgSkakel('#sorg-plasing-m1'))
  kyk('lees video terug', leesSorgSkakel('#sorg-video-abc123').id === 'abc123')
  kyk('gewone hash gee niks', leesSorgSkakel('#iets-anders') === null)
  kyk('leeg gee niks', leesSorgSkakel('') === null)
  /* 'n ID met vreemde karakters moet heen en weer oorleef */
  const raar = 'a b/c'
  kyk('ontsnapte id oorleef', leesSorgSkakel('#sorg-plasing-' + encodeURIComponent(raar)).id === raar,
      leesSorgSkakel('#sorg-plasing-' + encodeURIComponent(raar)))
}

afdeling('Wat NIE meer op die skerm mag wees nie')
{
  /* Kommentaar tel nie — daar verduidelik ons juis hoekom hierdie goed weg
     is. Ons kyk net na die kode wat werklik loop. */
  const sonderKommentaar = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  const vorm = sonderKommentaar(fs.readFileSync(path.join(wortel, 'src', 'components', 'SorgVorm.jsx'), 'utf8'))
  const klaar = sonderKommentaar(fs.readFileSync(path.join(wortel, 'src', 'components', 'SorgKlaar.jsx'), 'utf8'))

  /* Die private kode is weg van die skerm af. Hy bestaan nog op die
     bediener — Dewald het hom nodig — maar niemand moet hom verstaan,
     kopieer of bere nie. */
  kyk('geen kode op die vorm', !/uitslag\.kode|Kopieer die kode|private kode/i.test(vorm + klaar),
      (vorm + klaar).match(/.{0,40}kode.{0,40}/i))

  /* Een blokkie, nie drie nie. */
  const blokkies = (vorm.match(/type="checkbox"/g) || []).length
  kyk('een toestemmingsblokkie', blokkies === 1, blokkies)

  /* Geen aparte gevaarskerm wat elke mens moet verbygaan nie. */
  kyk('geen aparte gevaarskerm', !/Ja, dit is nou|Nee — ek wil skryf/.test(vorm))

  /* Dit moet BO die kassie staan dat dit openbaar is. */
  const iOpenbaar = vorm.indexOf('sv-openbaar')
  const iKassie = vorm.indexOf('<textarea')
  kyk('die openbaar-waarskuwing staan BO die tekskassie', iOpenbaar > 0 && iOpenbaar < iKassie, [iOpenbaar, iKassie])

  /* Geen versoek om geld op die skryfkant nie. */
  kyk('geen steunversoek op die vorm', !/Ondersteun|donation|hoop-vennoot/i.test(vorm + klaar),
      (vorm + klaar).match(/.{0,30}(Ondersteun|donation).{0,30}/i))
}

afdeling('Geen wagwoord in die app se kode nie')
{
  const admin = fs.readFileSync(path.join(wortel, 'src', 'screens', 'Admin.jsx'), 'utf8')
  const sorgAdmin = fs.readFileSync(path.join(wortel, 'src', 'screens', 'SorgAdmin.jsx'), 'utf8')

  /* Die ou PIN is weg as 'n VERGELYKING. Hy mag in kommentaar staan waar ons
     verduidelik hoekom hy weg is. */
  const kode = admin.split('\n').filter(r => !r.trim().startsWith('*') && !r.trim().startsWith('/*')).join('\n')
  kyk('geen ADMIN_PIN-vergelyking', !/pin\s*===\s*ADMIN_PIN|===\s*['"]2025['"]/.test(kode),
      kode.match(/.{0,50}ADMIN_PIN.{0,50}/))
  kyk('die bediener keur die wagwoord', /api\/sorg-sluit/.test(admin))
  kyk('SorgAdmin het geen tweede wagwoordskerm nie', !/Sorg-wagwoord/.test(sorgAdmin))
}

afdeling('Terwyl jy wag — stemnotas en n e-boek')
{
  const N = [
    { id: 'a', title: 'Wanneer die bekommernis nie stil raak nie', series: 'Angs', scripture: 'Fil 4:6' },
    { id: 'b', title: 'Wanneer rou nie ligter word nie', series: 'Rou', scripture: 'Ps 34' },
    { id: 'c', title: 'Oor geld en werk', series: '', scripture: '' },
    { id: 'd', title: 'Iets heeltemal anders', series: '', scripture: '' },
    { id: 'e', title: 'Nog iets anders', series: '', scripture: '' },
  ]

  kyk('drie kom terug', notasVir('angs', N).length === 3, notasVir('angs', N).length)
  kyk('die passende een staan EERSTE', notasVir('angs', N)[0].id === 'a', notasVir('angs', N).map(x => x.id))
  kyk('rou kry die rou-een', notasVir('rou', N)[0].id === 'b', notasVir('rou', N).map(x => x.id))
  kyk('geld kry die geld-een', notasVir('geld', N)[0].id === 'c', notasVir('geld', N).map(x => x.id))
  kyk('geen duplikate', new Set(notasVir('angs', N).map(x => x.id)).size === 3)

  /* Tref niks, kry hy die nuutstes — nooit 'n lee hand nie. */
  kyk('onbekende onderwerp gee steeds drie', notasVir('bloupers', N).length === 3)
  kyk('ander gee steeds drie', notasVir('ander', N).length === 3)

  /* Minder notas as gevra */
  kyk('twee notas gee twee', notasVir('angs', N.slice(0, 2)).length === 2)
  kyk('geen notas gee niks', notasVir('angs', []).length === 0)
  kyk('null gee niks', notasVir('angs', null).length === 0)
  kyk('een op die muurkaart', notasVir('angs', N, 1).length === 1)

  /* Elke onderwerp moet iets kry sodra daar enige notas is. */
  kyk('elke onderwerp kry stemnotas', ONDERWERPE.every(o => notasVir(o.sleutel, N).length === 3),
      ONDERWERPE.filter(o => notasVir(o.sleutel, N).length !== 3).map(o => o.sleutel))

  /* Die e-boek moet ALTYD gratis wees. Nooit 'n prys waar iemand seer is. */
  const boeke = ONDERWERPE.map(o => boekVir(o.sleutel)).filter(Boolean)
  kyk('elke onderwerp kry n boek', boeke.length === ONDERWERPE.length, boeke.length)
  kyk('elke boek is GRATIS', boeke.every(b => b.free === true), boeke.filter(b => !b.free).map(b => b.title))
  kyk('geen boek dra n prys nie', boeke.every(b => !b.price), boeke.filter(b => b.price).map(b => b.title))
}

console.log(gedruip ? `\n${gedruip} GEDRUIP` : '\nalles geslaag')
process.exit(gedruip ? 1 : 0)
