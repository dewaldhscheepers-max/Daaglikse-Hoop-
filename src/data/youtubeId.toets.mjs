/* Die video-skakel wat Dewald plak.
 *
 * Hierdie toets bestaan omdat die fout wat hy keer STIL is: word 'n verkeerde
 * string as die "video-ID" gestoor, kla niks. Die week word gestoor, die
 * admin sê "Gestoor", en die leë speler daag eers weke later op wanneer
 * iemand die video wil kyk.
 */
import { videoIdUit, keurVideoInset } from './youtubeId.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

const ID = 'jACGS5QkLkQ'

console.log('\n── Die skakel wat Dewald werklik gestuur het ──\n')
is('youtu.be met ?si=',
   videoIdUit('https://youtu.be/jACGS5QkLkQ?si=DjVIhhIlhHKS4Hg6'), ID)

console.log('\n── Elke vorm wat YouTube uitdeel ──\n')
for (const [naam, skakel] of [
  ['youtu.be kaal',        'https://youtu.be/jACGS5QkLkQ'],
  ['youtu.be met tyd',     'https://youtu.be/jACGS5QkLkQ?t=42'],
  ['watch',                'https://www.youtube.com/watch?v=jACGS5QkLkQ'],
  ['watch met tyd',        'https://www.youtube.com/watch?v=jACGS5QkLkQ&t=30s'],
  ['watch met speellys',   'https://www.youtube.com/watch?v=jACGS5QkLkQ&list=PLabcdefghij'],
  ['watch, v nie eerste',  'https://www.youtube.com/watch?app=desktop&v=jACGS5QkLkQ'],
  ['m.youtube',            'https://m.youtube.com/watch?v=jACGS5QkLkQ'],
  ['sonder skema',         'youtube.com/watch?v=jACGS5QkLkQ'],
  ['embed',                'https://www.youtube.com/embed/jACGS5QkLkQ'],
  ['embed met rel',        'https://www.youtube.com/embed/jACGS5QkLkQ?rel=0'],
  ['shorts',               'https://www.youtube.com/shorts/jACGS5QkLkQ'],
  ['live',                 'https://www.youtube.com/live/jACGS5QkLkQ?feature=share'],
  ['ou /v/',               'https://www.youtube.com/v/jACGS5QkLkQ'],
  ['met spasies om',       '  https://youtu.be/jACGS5QkLkQ?si=xyz  '],
  ['reeds n kaal ID',      'jACGS5QkLkQ'],
]) {
  is(naam, videoIdUit(skakel), ID)
}

console.log('\n── Die ?si= mag NOOIT die ID word nie ──\n')
/* Dit is die gevaarlike een: `si` staan direk langs die ID en gebruik
   dieselfde karakters. 'n Patroon wat nie op die skuinsstreep en die lengte
   anker nie, gryp hom. */
is('n si van presies 11 karakters word nie gegryp nie',
   videoIdUit('https://youtu.be/jACGS5QkLkQ?si=ABCDEFGHIJK'), ID)
is('en n si sonder n video-ID gee niks',
   videoIdUit('https://youtu.be/?si=ABCDEFGHIJK'), '')

console.log('\n── Wat NIE deur mag glip nie ──\n')
for (const [naam, sleg] of [
  ['n lee string',            ''],
  ['net spasies',             '   '],
  ['null',                    null],
  ['undefined',               undefined],
  ['n getal',                 12345],
  ['gewone woorde',           'die video van vandag'],
  ['n Vimeo-skakel',          'https://vimeo.com/123456789'],
  ['n YouTube-kanaal',        'https://www.youtube.com/@daaglikshoop'],
  ['n speellys sonder video', 'https://www.youtube.com/playlist?list=PLabcdefghij'],
  ['n te kort ID',            'jACGS5Qk'],
  ['n te lang ID',            'jACGS5QkLkQXX'],
  ['n ID met n punt in',      'jACGS5Qk.kQ'],
  ['n halwe URL',             'https://youtu.be/'],
  ['die woord youtu.be',      'youtu.be'],
]) {
  is(`${naam} gee n lee string`, videoIdUit(sleg), '')
}

/* Die ou uittrekker in Admin.jsx het die HELE string teruggegee wanneer niks
   pas nie. Dan word 'n Vimeo-skakel as 'n "video-ID" gestoor. */
is('n Vimeo-skakel word nie as ID gestoor nie',
   videoIdUit('https://vimeo.com/123456789') === 'https://vimeo.com/123456789', false)

console.log('\n── Wat die vorm moet wys ──\n')
is('n lee inset is nie n fout nie',
   keurVideoInset(''), { id: '', leeg: true, geldig: true })
is('n goeie skakel',
   keurVideoInset('https://youtu.be/jACGS5QkLkQ?si=xyz'),
   { id: ID, leeg: false, geldig: true, wasSkakel: true })
is('n kaal ID is geldig maar was nie n skakel nie',
   keurVideoInset(ID), { id: ID, leeg: false, geldig: true, wasSkakel: false })
is('rommel is n fout',
   keurVideoInset('nee wat'), { id: '', leeg: false, geldig: false, wasSkakel: false })

/* Onderstreep en koppelteken is geldige ID-karakters — 'n patroon wat hulle
   uitlaat sou stil die verkeerde video haal. */
console.log('\n── Onderstreep en koppelteken ──\n')
is('n ID met n koppelteken',   videoIdUit('https://youtu.be/a-B_c1D2e3F'), 'a-B_c1D2e3F')
is('en in n watch-skakel',     videoIdUit('https://www.youtube.com/watch?v=a-B_c1D2e3F&t=1'), 'a-B_c1D2e3F')

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
