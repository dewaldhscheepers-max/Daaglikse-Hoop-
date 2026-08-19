/* Die uitnodigingskakel.
 *
 * Dewald het die eerste uitnodiging op WhatsApp gestuur en toe lees NIKS die
 * kode nie — 'n mens klik en land op die gewone tuisblad. Die groep bestaan,
 * die kode werk, en die skakel doen niks.
 *
 * Hierdie leer toets die stukkie wat suiwer is: watter adresse 'n uitnodiging
 * is, watter nie, en wat oor 'n herlaai heen oorleef.
 */
import {
  kodeUitAdres, stoorNooi, leesNooi, veeNooi, NOOI_SLEUTEL,
  weekSkakel, weekUitAdres, stoorWeek, leesWeek, veeWeek,
} from './volgJesusNooi.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

console.log('\n── Die egte skakel ──\n')
is('die een wat die app self bou',
   kodeUitAdres('/go/volg-jesus/join', '?kode=DA4055'), 'DA4055')
is('met n skuinsstreep agteraan',
   kodeUitAdres('/go/volg-jesus/join/', '?kode=DA4055'), 'DA4055')
is('hoofletters in die pad',
   kodeUitAdres('/GO/Volg-Jesus/Join', '?kode=DA4055'), 'DA4055')
is('n kode in kleinletters word groot',
   kodeUitAdres('/go/volg-jesus/join', '?kode=da4055'), 'DA4055')
is('met spasies om die kode',
   kodeUitAdres('/go/volg-jesus/join', '?kode=%20DA4055%20'), 'DA4055')

console.log('\n── Vorms wat n mens self tik ──\n')
for (const pad of ['/volg-jesus/join', '/go/vj/join', '/vj/join']) {
  is(pad, kodeUitAdres(pad, '?kode=DA4055'), 'DA4055')
}
is('code in plaas van kode',
   kodeUitAdres('/go/volg-jesus/join', '?code=DA4055'), 'DA4055')
is('n ander parameter saam',
   kodeUitAdres('/go/volg-jesus/join', '?utm_source=whatsapp&kode=DA4055'), 'DA4055')

console.log('\n── vjkode mag op ENIGE pad ──\n')
/* Die ontsnaproete vir 'n plek wat die pad herskryf. */
is('op die tuisblad', kodeUitAdres('/', '?vjkode=DA4055'), 'DA4055')
is('op n vreemde pad', kodeUitAdres('/iets/anders', '?vjkode=DA4055'), 'DA4055')

console.log('\n── Wat NIE n uitnodiging is nie ──\n')
is('die gewone tuisblad', kodeUitAdres('/', ''), '')
is('n kode op die tuisblad tel nie — dit kan enigiets wees',
   kodeUitAdres('/', '?kode=DA4055'), '')
is('die steunblad se skakel',
   kodeUitAdres('/go/steun', '?steun=1'), '')
is('die regte pad sonder kode',
   kodeUitAdres('/go/volg-jesus/join', ''), '')
is('n leë kode', kodeUitAdres('/go/volg-jesus/join', '?kode='), '')
is('net spasies', kodeUitAdres('/go/volg-jesus/join', '?kode=%20%20'), '')

console.log('\n── n Kode wat nie n kode is nie ──\n')
for (const sleg of ['ab', 'DA-4055', 'DA 4055', 'DA4055DA4055X', '<script>', 'DA4055;drop']) {
  is(`${JSON.stringify(sleg)} word geweier`,
     kodeUitAdres('/go/volg-jesus/join', `?kode=${encodeURIComponent(sleg)}`), '')
}

console.log('\n── Niks val om op rommel nie ──\n')
for (const [p, s] of [[null, null], [undefined, undefined], [123, 456], [{}, []]]) {
  is(`${JSON.stringify(p)} gee net niks`, kodeUitAdres(p, s), '')
}

console.log('\n── Die bedoeling oorleef n herlaai ──\n')
{
  /* 'n Nagemaakte sessionStorage. Die egte een bestaan nie in node nie, en die
     punt is juis dat hierdie kode dit sonder 'n blaaier moet kan doen. */
  const winkel = {}
  const berging = {
    getItem: k => (k in winkel ? winkel[k] : null),
    setItem: (k, w) => { winkel[k] = String(w) },
    removeItem: k => { delete winkel[k] },
  }

  is('stoor', stoorNooi('DA4055', berging), true)
  is('dit le onder die regte naam', winkel[NOOI_SLEUTEL], 'DA4055')
  is('en dit kom terug', leesNooi(berging), 'DA4055')

  veeNooi(berging)
  is('ná vee is dit weg', leesNooi(berging), '')

  /* Wat 'n mens self in die winkel sit, mag nie deurkom nie. */
  winkel[NOOI_SLEUTEL] = '<script>'
  is('rommel in die winkel word geweier', leesNooi(berging), '')

  winkel[NOOI_SLEUTEL] = ''
  is('leeg ook', leesNooi(berging), '')

  is('stoor sonder kode doen niks', stoorNooi('', berging), false)
}

console.log('\n── Sonder n winkel val niks om nie ──\n')
{
  /* 'n Blaaier in privaat-modus gooi by setItem. Die app moet steeds werk —
     dan is die uitnodiging net nie meer daar ná 'n herlaai nie, en dit is 'n
     ongerief, nie 'n fout nie. */
  const stukkend = {
    getItem() { throw new Error('nee') },
    setItem() { throw new Error('nee') },
    removeItem() { throw new Error('nee') },
  }
  is('stoor gee false', stoorNooi('DA4055', stukkend), false)
  is('lees gee niks', leesNooi(stukkend), '')
  veeNooi(stukkend)
  is('en vee gooi nie', true, true)
}

console.log('\n── Deel die week, nie die klanklêer nie ──\n')
{
  /* Die knoppie het die rou Firebase-Storage-URL gestuur: 'n kaal klanklêer,
     die Storage-teken vir enigiemand wat dit aanstuur, en 'n adres wat soos
     gemors lyk in 'n gesprek. */
  is('die skakel wys na die APP',
     weekSkakel(1), 'https://dewaldscheepers.com/go/volg-jesus?week=1')
  is('week 12', weekSkakel(12), 'https://dewaldscheepers.com/go/volg-jesus?week=12')
  is('n onmoontlike week val terug op die program self',
     weekSkakel(99), 'https://dewaldscheepers.com/go/volg-jesus')
  is('en rommel ook', weekSkakel('nee'), 'https://dewaldscheepers.com/go/volg-jesus')
  is('daar is NIKS van firebasestorage in nie',
     /firebasestorage|token=/.test(weekSkakel(1)), false)

  is('en die app lees hom terug', weekUitAdres('/go/volg-jesus', '?week=1'), 1)
  is('sonder n week: maak oop by die mens se eie week',
     weekUitAdres('/go/volg-jesus', ''), -1)
  is('n onmoontlike week tel as "net oopmaak"',
     weekUitAdres('/go/volg-jesus', '?week=99'), -1)
  for (const p of ['/volg-jesus', '/go/vj', '/vj']) {
    is(`${p} werk ook`, weekUitAdres(p, '?week=2'), 2)
  }
  is('die tuisblad is NIE n VOLG JESUS-skakel nie', weekUitAdres('/', '?week=1'), 0)
  is('en die steunblad ook nie', weekUitAdres('/go/steun', ''), 0)
  is('n aansluitskakel is nie n weekskakel nie',
     weekUitAdres('/go/volg-jesus/join', '?kode=DA4055'), 0)
  is('en n weekskakel is nie n aansluitskakel nie',
     kodeUitAdres('/go/volg-jesus', '?week=1'), '')

  const winkel = {}
  const berging = {
    getItem: k => (k in winkel ? winkel[k] : null),
    setItem: (k, w) => { winkel[k] = String(w) },
    removeItem: k => { delete winkel[k] },
  }
  stoorWeek(3, berging)
  is('dit oorleef n herlaai', leesWeek(berging), 3)
  veeWeek(berging)
  is('en dan is dit weg', leesWeek(berging), 0)
  stoorWeek(-1, berging)
  is('"net oopmaak" oorleef ook', leesWeek(berging), -1)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
