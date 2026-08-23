/* Wie praat hier — en wie mag NIE sê hy is Dewald nie.
 *
 * Die helfte van hierdie lêer gaan oor een geval: 'n vreemdeling met die
 * vertoonnaam "Dewald Scheepers" wat pastorale raad gee aan iemand in 'n
 * donker plek. Dit is die ergste ding wat op hierdie blad kan gebeur, en dit
 * kos net 'n teksveld.
 *
 * Die ander helfte gaan oor die teenoorgestelde risiko: 'n vrou wat ANONIEM
 * oor haar huwelik geskryf het en wie se naam per ongeluk deurkom.
 */
import {
  keurNaam, isBeskerm, plat, voorletters, wieWys, leesProfiel,
  middelKrop, MAKS_NAAM, BESKERM,
} from './sorgProfiel.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)

console.log('\n── Niemand mag Dewald wees nie ──\n')
{
  /* Elke een van hierdie is 'n manier waarop 'n mens 'n naamfilter omseil.
     Hulle moet ALMAL val. */
  const pogings = [
    'Dewald Scheepers', 'dewald scheepers', 'DEWALD SCHEEPERS',
    'Dewald  Scheepers', 'Dewald.Scheepers', 'Dewald-Scheepers',
    'D e w a l d', 'Déwald Schéépers', 'Dewa1d', 'Dew4ld', 'Sch33pers',
    'Scheepers', 'Ps Dewald', 'Pastoor Dewald', 'Dewald S',
    'Daaglikse Hoop', 'DaaglikseHoop', 'Daagliks3 Hoop',
    'Admin', 'admin', 'Moderator', 'Die egte Dewald',
    'Dewald Scheepers Bediening',
  ]
  for (const p of pogings) {
    const r = keurNaam(p)
    is(`"${p}" word geweier`, r.naam, '')
    waar(`"${p}" kry n rede`, /gereserveer/.test(r.fout))
  }
}

console.log('\n── Gewone name werk WEL ──\n')
{
  /* 'n Filter wat te wyd vat, is net so sleg: dan kan Elna nie antwoord nie. */
  for (const n of ['Elna', 'Johan', 'Maria K.', 'Liezl', 'Pieter van Wyk',
                   'Sarie', 'Anna-Marie', 'Nadia', 'Deon', 'Hoop']) {
    is(`"${n}" gaan deur`, keurNaam(n).naam, n)
  }
  is('spasies word skoongemaak', keurNaam('   Elna   ').naam, 'Elna')
  is('dubbele spasies vou in', keurNaam('Elna   van   Wyk').naam, 'Elna van Wyk')
}

console.log('\n── Wat NIE n naam is nie ──\n')
{
  is('leeg', keurNaam('').naam, '')
  is('net spasies', keurNaam('   ').naam, '')
  is('een letter', keurNaam('E').naam, '')
  waar('en dit sê hoekom', /te kort/.test(keurNaam('E').fout))

  /* 'n Vertoonnaam is nie 'n advertensie nie. */
  for (const rommel of ['www.iets.co.za', 'https://x.com', 'koop@my.co.za',
                        'Bel my 0821234567', 'Kyk hier .com']) {
    is(`"${rommel}" val uit`, keurNaam(rommel).naam, '')
  }

  is('n lang naam word afgekap', keurNaam('A'.repeat(80)).naam.length, MAKS_NAAM)
  is('undefined', keurNaam(undefined).naam, '')
  is('n getal', keurNaam(12345).naam, '')
}

console.log('\n── plat() en die beskermde lys ──\n')
{
  is('aksente weg', plat('Déwald'), 'dewald')
  is('syfers wat soos letters lyk', plat('Dewa1d'), 'dewald')
  is('spasies en punte weg', plat('D.e w a.l d'), 'dewald')
  is('leeg gee leeg', plat(''), '')
  is('null gee leeg', plat(null), '')
  waar('elke inskrywing in die lys is reeds plat', BESKERM.every(b => plat(b) === b))
  is('n gewone naam is nie beskerm nie', isBeskerm('Elna'), false)
  is('en leeg ook nie', isBeskerm(''), false)
}

console.log('\n── Voorletters ──\n')
{
  is('een naam', voorletters('Elna'), 'E')
  is('twee name', voorletters('Elna van Wyk'), 'EW')
  is('drie name gee die eerste en die laaste', voorletters('Anna Maria Botha'), 'AB')
  is('klein letters word groot', voorletters('elna'), 'E')
  is('spasies rondom', voorletters('  Elna  '), 'E')
  is('leeg gee niks', voorletters(''), '')
  is('null gee niks', voorletters(null), '')
  waar('nooit meer as twee', ['Elna', 'Elna van Wyk', 'A B C D E']
    .every(n => voorletters(n).length <= 2))
}

console.log('\n── ANONIEM wen ALTYD ──\n')
{
  /* DIE toets. 'n Vrou het anoniem oor haar huwelik geskryf. Kom haar naam
     hier deur, is dit onherstelbaar — en dit is presies die soort ding wat
     deur 'n ou rekord of 'n vergete veld gebeur. */
  is('anoniem gee net "Anoniem"', wieWys({ anoniem: true, naam: 'Maria', foto: 'https://x/y.jpg' }),
     { naam: 'Anoniem', foto: '', letters: '', anoniem: true, geverifieer: false })

  /* Die VERSTEK is anoniem. 'n Rekord sonder die veld — 'n ou plasing, 'n
     halwe skryf — mag nooit 'n naam wys nie. */
  is('geen veld = anoniem', wieWys({ naam: 'Maria' }).naam, 'Anoniem')
  is('null = anoniem', wieWys(null).naam, 'Anoniem')
  is('anoniem as string tel NIE as vals nie', wieWys({ anoniem: 'false', naam: 'Maria' }).naam, 'Anoniem')
  is('n lee naam met anoniem:false is steeds Anoniem', wieWys({ anoniem: false, naam: '' }).naam, 'Anoniem')
}

console.log('\n── n Genoemde storie wys die regte naam ──\n')
{
  const w = wieWys({ anoniem: false, naam: 'Maria K.', foto: 'https://f/x.jpg' })
  is('die naam', w.naam, 'Maria K.')
  is('die foto', w.foto, 'https://f/x.jpg')
  is('en die voorletters vir wanneer daar geen foto is nie', w.letters, 'MK')
  is('nie anoniem nie', w.anoniem, false)

  /* Net http en https. Hierdie adres word 'n <img src> op 'n openbare blad. */
  for (const sleg of ['javascript:alert(1)', 'data:text/html,x', 'file:///etc/passwd', '  ']) {
    is(`n "${sleg.trim()}"-foto val uit`, wieWys({ anoniem: false, naam: 'Elna', foto: sleg }).foto, '')
  }
}

console.log('\n── Die merk kom uit die ROL, nooit uit die naam nie ──\n')
{
  /* Sou die merk uit die naam kom, was die hele beskermde lys 'n string-
     vergelyking wat een keer omseil moet word. Dit kom uit 'n veld wat die
     BEDIENER stel. */
  is('n lid kry geen merk', wieWys({ anoniem: false, naam: 'Elna', rol: 'lid' }).geverifieer, false)
  is('geen rol, geen merk', wieWys({ anoniem: false, naam: 'Elna' }).geverifieer, false)
  is('n gestelde rol tel', wieWys({ anoniem: false, naam: 'Dewald Scheepers', rol: 'dewald' }).geverifieer, true)
  is('die bediening ook', wieWys({ anoniem: false, naam: 'Daaglikse Hoop', rol: 'bediening' }).geverifieer, true)
  /* 'n Kliënt wat "rol" self kies, kry niks — want die bediener oorskryf dit.
     Hier toets ons net dat 'n VREEMDE rol nie tel nie. */
  is('n uitgedinkte rol tel nie', wieWys({ anoniem: false, naam: 'X', rol: 'geverifieer' }).geverifieer, false)
}

console.log('\n── Die profiel op die foon ──\n')
{
  is('niks', leesProfiel(null), null)
  is('stukkende JSON', leesProfiel('{{{'), null)
  is('geen naam', leesProfiel('{"foto":"https://x/y.jpg"}'), null)
  is('n beskermde naam word nie gestoor nie', leesProfiel('{"naam":"Dewald Scheepers"}'), null)
  is('n gewone profiel', leesProfiel('{"naam":"Elna","foto":""}'), { naam: 'Elna', foto: '' })

  const dataUri = 'data:image/jpeg;base64,/9j/4AAQ'
  is('n gekropte foto oorleef', leesProfiel(JSON.stringify({ naam: 'Elna', foto: dataUri })).foto, dataUri)
  is('n SVG-data-uri NIE', leesProfiel('{"naam":"Elna","foto":"data:image/svg+xml,<svg/>"}').foto, '')
  is('en javascript: ook nie', leesProfiel('{"naam":"Elna","foto":"javascript:1"}').foto, '')
}

console.log('\n── Die foto word in die MIDDEL gekrop ──\n')
{
  is('n landskapfoto', middelKrop(1000, 600), { x: 200, y: 0, kant: 600 })
  is('n portretfoto', middelKrop(600, 1000), { x: 0, y: 200, kant: 600 })
  is('n vierkant bly heel', middelKrop(500, 500), { x: 0, y: 0, kant: 500 })
  /* 'n Onewe verskil mag nie 'n halwe pixel gee nie — dit gee 'n dun lyn
     langs die kring op sommige fone. */
  is('onewe getalle word afgerond', middelKrop(101, 100), { x: 1, y: 0, kant: 100 })
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
