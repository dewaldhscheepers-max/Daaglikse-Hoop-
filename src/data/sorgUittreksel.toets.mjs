/* Die muur as een tekslêer — en wat NOOIT daarin mag beland nie.
 *
 * Die helfte van hierdie toetse is 'n LEKTOETS. Die lêer verlaat die app en
 * gaan na 'n ander maatskappy se rekenaar; wat een keer uitgaan, kom nie
 * terug nie. Elke veld wat 'n mens kan identifiseer, word hier per naam
 * gesoek en moet ontbreek.
 *
 *   node src/data/sorgUittreksel.toets.mjs
 */
import {
  dagVan, skoonStorie, tellPerOnderwerp, bouUittreksel, leernaam,
} from './sorgUittreksel.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}
const waar = (n, k) => is(n, !!k, true)

/* 'n Plasing soos die admin hom werklik kry — met alles wat NIE mag uitgaan
   nie, met opset ingesit. */
const VOL = {
  id: 'm8x2kq01',
  teks: 'Ek is lief vir my skoonouers, maar ek voel asof ek vasgevang is.',
  titel: 'Vasgevang',
  onderwerp: 'huwelik',
  datum: '2026-09-19',
  geskep: '2026-09-19T04:12:55.113Z',
  naam: 'Marlene van Wyk',
  foto: 'data:image/jpeg;base64,/9j/4AAQSkZJRg',
  epos: 'marlene@voorbeeld.co.za',
  toestel: 'a91f77c0de3b',
  anoniem: false,
  woorde: [{ id: 'w1', teks: 'Ek bid saam met jou.', skrywerNaam: 'Pieter' }],
  saam: 4,
}

console.log('\n── Die storie kom deur ──')
{
  const uit = bouUittreksel([VOL])
  waar('die storie self staan daar', uit.includes('Ek is lief vir my skoonouers'))
  waar('die titel ook', uit.includes('Vasgevang'))
  waar('die datum ook', uit.includes('2026-09-19'))
  waar('en die onderwerp se NAAM, nie sy sleutel nie', uit.includes('Huwelik'))
  waar('die kop se hoeveel daar is', uit.includes('Stories op die muur: 1'))
}

console.log('\n── En NIKS wat n mens kan identifiseer nie ──')
{
  /* Val een van hierdie, het iemand se naam die app verlaat. */
  const uit = bouUittreksel([VOL])
  is('geen naam',        uit.includes('Marlene'), false)
  is('geen van',         uit.includes('van Wyk'), false)
  is('geen foto',        uit.includes('base64'), false)
  is('geen e-pos',       uit.includes('marlene@'), false)
  is('geen toestel-id',  uit.includes('a91f77c0de3b'), false)
  is('geen dokument-id', uit.includes('m8x2kq01'), false)
  /* Opmerkings is ANDER mense se woorde. Die vraag gaan oor wat gevra word. */
  is('geen opmerkings',        uit.includes('Ek bid saam met jou'), false)
  is('ook nie n opmerker se naam nie', uit.includes('Pieter'), false)
}

console.log('\n── Die uur gaan nie saam nie ──')
{
  /* 'n Tydstempel tot op die sekonde is 'n vingerafdruk. */
  is('net die dag', dagVan(VOL), '2026-09-19')
  is('ook uit geskep alleen', dagVan({ geskep: '2026-09-19T04:12:55.113Z' }), '2026-09-19')
  is('gemors gee niks', dagVan({ datum: 'gister' }), '')
  is('niks gee niks', dagVan(), '')
  is('die uur staan nerens', bouUittreksel([VOL]).includes('04:12'), false)
}

console.log('\n── Waaroor die meeste geskryf word ──')
{
  const lys = [
    { teks: 'a', onderwerp: 'huwelik' },
    { teks: 'b', onderwerp: 'angs' },
    { teks: 'c', onderwerp: 'huwelik' },
    { teks: 'd', onderwerp: 'huwelik' },
    { teks: 'e', onderwerp: 'angs' },
    { teks: 'f', onderwerp: 'geld' },
  ]
  const t = tellPerOnderwerp(lys)
  is('die grootste staan eerste', t[0].sleutel, 'huwelik')
  is('en sy getal is reg', t[0].getal, 3)
  is('daarna die tweede', t[1].sleutel, 'angs')
  is('drie onderwerpe', t.length, 3)
  /* 'n Ontbrekende onderwerp is 'ander', nie 'n leë ry nie. */
  is('sonder n onderwerp is dit ander', tellPerOnderwerp([{ teks: 'x' }])[0].sleutel, 'ander')

  /* Twee lopies moet dieselfde lêer gee, anders lyk 'n tweede aflaai soos 'n
     verandering wat nie gebeur het nie. */
  is('n gelykop telling is stabiel',
     JSON.stringify(tellPerOnderwerp(lys)), JSON.stringify(tellPerOnderwerp(lys)))
}

console.log('\n── Die paragrawe bly ──')
{
  /* 'n Mens skryf sy swaar ding in paragrawe. Vou dit plat, lees dit anders
     as wat hy bedoel het. */
  is('twee paragrawe bly twee', skoonStorie('een\n\ntwee'), 'een\n\ntwee')
  is('drie leë reëls word twee', skoonStorie('een\n\n\n\ntwee'), 'een\n\ntwee')
  is('spasies binne n reël vou in', skoonStorie('ek   bid'), 'ek bid')
  is('beheerkarakters gaan uit', skoonStorie('ek\u0007bid'), 'ek bid')
  is('niks gee n leë string', skoonStorie(), '')
}

console.log('\n── n Leë storie staan nie in die lêer nie ──')
{
  /* 'n Genommerde blok met niks in nie, lyk soos 'n fout in die uittrekker. */
  const uit = bouUittreksel([VOL, { teks: '   ', onderwerp: 'angs' }, { onderwerp: 'geld' }])
  is('net die een met woorde tel', uit.includes('Stories op die muur: 1'), true)
  is('en daar is net een blok', (uit.match(/^1\. /m) || []).length, 1)
  is('geen tweede blok', uit.includes('\n2. '), false)
}

console.log('\n── Gemors breek dit nie ──')
{
  waar('niks in', bouUittreksel().includes('Stories op die muur: 0'))
  waar('n leë lys', bouUittreksel([]).includes('Stories op die muur: 0'))
  waar('null in die lys', bouUittreksel([null, VOL]).includes('Stories op die muur: 1'))
  waar('n string in plaas van n lys', bouUittreksel('nee').includes('Stories op die muur: 0'))
}

console.log('\n── Die lêernaam dra die dag ──')
{
  /* Twee lêers met dieselfde naam in een aflaai-vouer is nutteloos. */
  is('met n dag', leernaam('2026-09-21'), 'dra-mekaar-2026-09-21.txt')
  is('sonder een', leernaam(), 'dra-mekaar.txt')
  is('gemors word nie ingesit nie', leernaam('../../etc/passwd'), 'dra-mekaar.txt')
}

console.log('\n── Die lêer sê self wat hy is ──')
{
  /* Veertig rou stories sonder 'n konteks-reël is 'n lêer wat verkeerd gelees
     kan word. */
  const uit = bouUittreksel([VOL], { opTrek: '2026-09-21' })
  waar('die opskrif staan bo', uit.startsWith('DAAGLIKSE HOOP — DRA MEKAAR'))
  waar('dit sê dat daar geen naam in is nie', uit.includes('Geen naam'))
  waar('die datum van die uittrek staan daar', uit.includes('Uitgetrek: 2026-09-21'))
  waar('en sonder daardie datum breek niks', bouUittreksel([VOL]).length > 0)

  /* ── Die leë reëls IS die uitleg ──
   *
   * Die eerste weergawe het die kop deur 'n `.filter(r => r !== '')` gestuur
   * om die opsionele datum-reël te laat val, en dit het ELKE leë reël saam
   * weggevat. Die kop het toe soos een blok gelees — 'n blaaierlopie het dit
   * gewys. Dit is die soort ding wat geen "bevat" -toets vang. */
  waar('daar is n leë reël na die opskrif', uit.includes('DRA MEKAAR\n\n'))
  waar('en een voor die tallie', uit.includes('daarby.\n\n'))
  waar('ook sonder die opsionele datum',
       bouUittreksel([VOL]).includes('DRA MEKAAR\n\n'))
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
