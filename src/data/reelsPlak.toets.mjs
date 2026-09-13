/* Wat 'n mens werklik plak.
 *
 * Die een geval wat hierdie lêer bestaan om te hanteer, is Dewald se eie
 * plaksel van 12 September 2026: 124 skakels AANMEKAAR, sonder 'n enkele
 * spasie. 'n Splitser wat op `\n` of `,` staatmaak, sien EEN string en gooi al
 * 124 weg.
 *
 * Loop met:  node src/data/reelsPlak.toets.mjs
 */
import { splitsSkakels, gelykeSkakel, keurPlaksel, MAKS_SKAKELS } from './reelsPlak.js'
import { REELS_INVOER, REELS_INVOER_2 } from './reelsInvoer.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}

console.log('\n── AANMEKAAR geplak, geen spasie ──')
{
  const plak = 'https://vt.tiktok.com/ZSqmNv24S/https://vt.tiktok.com/ZSqmN3j62/https://vt.tiktok.com/ZSqmNsfJ4/'
  is('al drie word gevind', splitsSkakels(plak).length, 3)
  is('en in die plak-orde', splitsSkakels(plak), [
    'https://vt.tiktok.com/ZSqmNv24S/',
    'https://vt.tiktok.com/ZSqmN3j62/',
    'https://vt.tiktok.com/ZSqmNsfJ4/',
  ])
}
{
  /* Die LAASTE een sonder 'n skuinsstreep — 'n foon laat dit soms val. */
  const plak = 'https://vt.tiktok.com/ZSqmNv24S/https://vt.tiktok.com/ZSqmN3j62'
  is('die laaste sonder n streep kom ook deur', splitsSkakels(plak).length, 2)
}

console.log('\n── Die gewone maniere ──')
is('een per reel', splitsSkakels('https://vt.tiktok.com/AAA111222/\nhttps://vt.tiktok.com/BBB333444/').length, 2)
is('met spasies',  splitsSkakels('https://vt.tiktok.com/AAA111222/ https://vt.tiktok.com/BBB333444/').length, 2)
is('met kommas',   splitsSkakels('https://vt.tiktok.com/AAA111222/, https://vt.tiktok.com/BBB333444/').length, 2)
is('vm.tiktok.com', splitsSkakels('https://vm.tiktok.com/ZMabc1234/').length, 1)
is('tiktok.com/t/', splitsSkakels('https://www.tiktok.com/t/ZTabc1234/').length, 1)
is('n VOLLE adres', splitsSkakels('https://www.tiktok.com/@iemand/video/7412345678901234567'),
   ['https://www.tiktok.com/@iemand/video/7412345678901234567/'])
is('n volle adres met n navraag',
   splitsSkakels('https://www.tiktok.com/@iemand/video/7412345678901234567?is_from_webapp=1'),
   ['https://www.tiktok.com/@iemand/video/7412345678901234567/'])
is('sonder n skema', splitsSkakels('vt.tiktok.com/ZSqmNv24S/'), ['https://vt.tiktok.com/ZSqmNv24S/'])
is('kort EN lank saam',
   splitsSkakels('https://vt.tiktok.com/AAA111222/https://www.tiktok.com/@i/video/7412345678901234567/').length, 2)

console.log('\n── Duplikate val weg, die eerste wen ──')
{
  const plak = 'https://vt.tiktok.com/AAA111222/https://vt.tiktok.com/BBB333444/https://vt.tiktok.com/AAA111222/'
  is('drie in, twee uit', splitsSkakels(plak).length, 2)
  is('en die orde bly', splitsSkakels(plak)[0], 'https://vt.tiktok.com/AAA111222/')
}
{
  /* Dieselfde skakel, anders gespel. Sonder `gelykeSkakel` was dit drie
     inskrywings en drie dokumente in Firestore. */
  const plak = 'https://vt.tiktok.com/AAA111222/ vt.tiktok.com/AAA111222 HTTPS://VT.TIKTOK.COM/AAA111222/'
  is('een skakel, drie spellings', splitsSkakels(plak).length, 1)
}

console.log('\n── gelykeSkakel ──')
is('n navraag val weg', gelykeSkakel('https://vt.tiktok.com/AAA111222/?x=1'), 'https://vt.tiktok.com/AAA111222/')
is('n fragment ook',    gelykeSkakel('https://vt.tiktok.com/AAA111222/#iets'), 'https://vt.tiktok.com/AAA111222/')
is('n skema kom by',    gelykeSkakel('vt.tiktok.com/AAA111222/'), 'https://vt.tiktok.com/AAA111222/')
is('die gasheer word klein', gelykeSkakel('https://VT.TikTok.com/AAA111222/'), 'https://vt.tiktok.com/AAA111222/')
is('n streep kom by',   gelykeSkakel('https://vt.tiktok.com/AAA111222'), 'https://vt.tiktok.com/AAA111222/')
is('leeg',              gelykeSkakel(''), '')
is('null',              gelykeSkakel(null), '')
/* Gemors gee 'n LEE string, en `splitsSkakels` slaan dit dan oor. Dit is die
   regte kant om op te fouteer: 'n onbruikbare skakel mag nooit as 'n clip
   beland nie. */
is('gemors gee leeg',   gelykeSkakel('nie n adres nie'), '')
is('n halwe ding',      gelykeSkakel('http://'), '')

console.log('\n── Wat NIE ingekom moet word nie ──')
is('n YouTube-skakel', splitsSkakels('https://youtu.be/jACGS5QkLkQ'), [])
is('los woorde',       splitsSkakels('kyk hierdie videos'), [])
is('n ander gasheer',  splitsSkakels('https://vt.tiktok.com.boos.net/AAA111222/').length, 0)
is('leeg',             splitsSkakels(''), [])
is('net spasies',      splitsSkakels('   '), [])
is('null',             splitsSkakels(null), [])
is('undefined',        splitsSkakels(undefined), [])
is('n getal',          splitsSkakels(12345), [])
is('n absurd lang plaksel', splitsSkakels('x'.repeat(200001)), [])

console.log('\n── Die perk ──')
{
  const baie = Array.from({ length: MAKS_SKAKELS + 40 }, (_, i) =>
    `https://vt.tiktok.com/Z${String(i).padStart(8, '0')}/`).join('')
  is('dit kap by die perk af', splitsSkakels(baie).length, MAKS_SKAKELS)
  is('en die vorm se so', keurPlaksel(baie).afgekap, true)
}

console.log('\n── Die vorm se antwoord ──')
is('leeg', keurPlaksel(''), { skakels: [], aantal: 0, leeg: true, niksGevind: false, afgekap: false })
is('niks gevind', keurPlaksel('kyk hier').niksGevind, true)
is('drie gevind', keurPlaksel('https://vt.tiktok.com/AAA111222/https://vt.tiktok.com/BBB333444/').aantal, 2)
is('niksGevind is vals as daar iets is',
   keurPlaksel('https://vt.tiktok.com/AAA111222/').niksGevind, false)

console.log('\n── Dewald se EGTE plaksel ──')
{
  /* Nie 'n versinde geval nie: hierdie is die eerste ses skakels uit die
     124 wat hy werklik gestuur het, presies soos hulle aangekom het. */
  const egte = 'https://vt.tiktok.com/ZSqmNv24S/https://vt.tiktok.com/ZSqmN3j62/' +
               'https://vt.tiktok.com/ZSqmNsfJ4/https://vt.tiktok.com/ZSqmNscRU/' +
               'https://vt.tiktok.com/ZSqmNtoXV/https://vt.tiktok.com/ZSqmNn1UC/'
  const uit = splitsSkakels(egte)
  is('al ses', uit.length, 6)
  is('die eerste', uit[0], 'https://vt.tiktok.com/ZSqmNv24S/')
  is('die laaste',  uit[5], 'https://vt.tiktok.com/ZSqmNn1UC/')
  is('elkeen is n geldige kort skakel',
     uit.every(s => /^https:\/\/vt\.tiktok\.com\/[A-Za-z0-9]{9}\/$/.test(s)), true)
}

console.log('\n── Die twee werklyste ──')
/* Dewald het hulle twee keer gestuur: 124 op 12 September, 86 op die 13de.
   Hulle staan in KODE omdat hy hulle EEN keer gestuur het en dit nie weer moet
   doen nie. */
{
  for (const [naam, lys] of [['klomp 1', REELS_INVOER], ['klomp 2', REELS_INVOER_2]]) {
    is(`${naam}: elke inskrywing is n egte kort skakel`,
      lys.every(s => /^https:\/\/vt\.tiktok\.com\/[A-Za-z0-9]{6,16}\/$/.test(s)), true)
    is(`${naam}: geen duplikate binne homself`,
      new Set(lys.map(gelykeSkakel)).size, lys.length)
    /* Die generator het een keer dubbele kommas geskryf en 124 inskrywings het
       247 geword, met gate tussenin. Hierdie meting is die hek daarteen. */
    is(`${naam}: geen lee inskrywings`, lys.every(s => typeof s === 'string' && s.length > 20), true)
  }
  is('klomp 1 is 124', REELS_INVOER.length, 124)
  is('klomp 2 is 86',  REELS_INVOER_2.length, 86)

  /* ── En die belangrikste ding wat hierdie toets NIE beweer nie ──
     Dat die twee lyste nie oorvleuel nie, sê NIKS oor of dieselfde VIDEOS in
     albei staan nie. 'n Kort skakel is nie die video se ID nie — TikTok gee 'n
     nuwe een elke keer as 'n mens deel. Die egte ontdubbeling gebeur NA die
     oplos, teen die post-ID, in `api/reels-voeg-by.mjs`, en dit word daar
     getoets ("Dieselfde VIDEO onder twee kort skakels"). */
  const een = new Set(REELS_INVOER.map(gelykeSkakel))
  is('geen SKAKEL staan in albei lyste',
    REELS_INVOER_2.some(s => een.has(gelykeSkakel(s))), false)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
