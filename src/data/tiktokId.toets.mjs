/* Die skakel wat Dewald van sy foon af plak.
 *
 * Twee dinge moet hierdie toets keer:
 *
 *   · dat 'n onbruikbare string as 'n "ID" gestoor word en weke later as 'n leë
 *     speler opdaag — daarom gee alles wat nie pas nie 'n LEË string;
 *   · dat 'n KORT skakel as onbruikbaar afgemaak word. Hy is nie stukkend nie;
 *     hy moet net deur die bediener oopgemaak word, en die verskil tussen
 *     "verkeerd" en "nog nie gelees nie" is die hele punt van hierdie lêer.
 *
 * Loop met:  node src/data/tiktokId.toets.mjs
 */
import { tiktokIdUit, isKortSkakel, keurTiktokInset, spelerAdres, handvatselUit } from './tiktokId.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}

const ID = '7412345678901234567'

console.log('\n── Die volle adres, in elke vorm wat TikTok uitdeel ──')
is('gewone video',        tiktokIdUit(`https://www.tiktok.com/@iemand/video/${ID}`), ID)
is('sonder www',          tiktokIdUit(`https://tiktok.com/@iemand/video/${ID}`), ID)
is('met n skuinsstreep',  tiktokIdUit(`https://www.tiktok.com/@iemand/video/${ID}/`), ID)
is('met n navraag',       tiktokIdUit(`https://www.tiktok.com/@iemand/video/${ID}?is_from_webapp=1&sender_device=pc`), ID)
is('met n fragment',      tiktokIdUit(`https://www.tiktok.com/@iemand/video/${ID}#iets`), ID)
is('n foto-post',         tiktokIdUit(`https://www.tiktok.com/@iemand/photo/${ID}`), ID)
is('die speler self',     tiktokIdUit(`https://www.tiktok.com/player/v1/${ID}`), ID)
is('die ou inbed',        tiktokIdUit(`https://www.tiktok.com/embed/v2/${ID}`), ID)
is('inbed sonder v2',     tiktokIdUit(`https://www.tiktok.com/embed/${ID}`), ID)
is('die m.-vorm',         tiktokIdUit(`https://m.tiktok.com/v/${ID}.html`), ID)
is('item_id',             tiktokIdUit(`https://www.tiktok.com/iets?item_id=${ID}`), ID)
is('n kaal id',           tiktokIdUit(ID), ID)
is('n kaal id met spasies', tiktokIdUit(`  ${ID}  `), ID)

console.log('\n── Wat GEEN id is nie, gee LEEG ──')
/* Dit is die belangrikste blok. 'n Funksie wat die inset teruggee wanneer sy
   niks weet nie, stoor gemors onder die naam van 'n id. */
is('leeg',            tiktokIdUit(''), '')
is('net spasies',     tiktokIdUit('   '), '')
is('null',            tiktokIdUit(null), '')
is('undefined',       tiktokIdUit(undefined), '')
is('n getal',         tiktokIdUit(12345), '')
is('n YouTube-skakel', tiktokIdUit('https://youtu.be/jACGS5QkLkQ'), '')
is('n Vimeo-skakel',  tiktokIdUit('https://vimeo.com/123456789'), '')
is('net n gebruiker', tiktokIdUit('https://www.tiktok.com/@iemand'), '')
is('los woorde',      tiktokIdUit('kyk hierdie video'), '')
is('n halwe adres',   tiktokIdUit('tiktok.com/@iemand/video/'), '')

console.log('\n── Die lengte word gekeur ──')
/* 'n Patroon wat nie anker nie, sny 'n langer syferstring in die middel deur en
   gee 'n id terug wat nie bestaan nie. */
is('te kort (16)',  tiktokIdUit('https://www.tiktok.com/@i/video/1234567890123456'), '')
is('te lank (22)',  tiktokIdUit('https://www.tiktok.com/@i/video/1234567890123456789012'), '')
is('kaal te kort',  tiktokIdUit('1234567890123456'), '')
is('kaal te lank',  tiktokIdUit('1234567890123456789012'), '')
is('letters in',    tiktokIdUit('741234567890123456a'), '')

console.log('\n── Die KORT skakel: nie stukkend nie, net nog nie gelees nie ──')
is('vt.tiktok.com',        isKortSkakel('https://vt.tiktok.com/ZSqa9Knhv/'), true)
is('vt sonder streep',     isKortSkakel('https://vt.tiktok.com/ZSqa9Knhv'), true)
is('vm.tiktok.com',        isKortSkakel('https://vm.tiktok.com/ZMabc123/'), true)
is('tiktok.com/t/',        isKortSkakel('https://www.tiktok.com/t/ZTabc123/'), true)
is('sonder skema',         isKortSkakel('vt.tiktok.com/ZSqa9Knhv/'), true)
is('n volle adres is nie kort nie', isKortSkakel(`https://www.tiktok.com/@i/video/${ID}`), false)
is('n kaal id is nie kort nie',     isKortSkakel(ID), false)
is('leeg is nie kort nie',          isKortSkakel(''), false)
is('n YouTube-skakel is nie kort nie', isKortSkakel('https://youtu.be/jACGS5QkLkQ'), false)
is('n ander gasheer tel nie',       isKortSkakel('https://vt.example.com/ZSqa9Knhv/'), false)

console.log('\n── Die vorm se drie uitkomste ──')
is('leeg',        keurTiktokInset(''),   { id: '', kort: false, leeg: true, geldig: true })
is('n volle adres', keurTiktokInset(`https://www.tiktok.com/@i/video/${ID}`),
   { id: ID, kort: false, leeg: false, geldig: true, wasSkakel: true })
is('n kaal id',   keurTiktokInset(ID),
   { id: ID, kort: false, leeg: false, geldig: true, wasSkakel: false })
is('n kort skakel', keurTiktokInset('https://vt.tiktok.com/ZSqa9Knhv/'),
   { id: '', kort: true, leeg: false, geldig: true })
is('gemors',      keurTiktokInset('kyk hier'),
   { id: '', kort: false, leeg: false, geldig: false })
is('n YouTube-skakel is gemors HIER', keurTiktokInset('https://youtu.be/jACGS5QkLkQ'),
   { id: '', kort: false, leeg: false, geldig: false })

console.log('\n── Die speler se adres ──')
{
  const a = spelerAdres(ID)
  is('dra die id',        a.startsWith(`https://www.tiktok.com/player/v1/${ID}?`), true)
  is('begin STIL',        /autoplay=0/.test(a), true)
  is('herhaal',           /loop=1/.test(a), true)
  is('geen musiekblok',   /music_info=0/.test(a), true)
  is('geen beskrywing',   /description=0/.test(a), true)
  const b = spelerAdres(ID, { speel: true })
  is('speel wanneer gevra', /autoplay=1/.test(b), true)
  is('n slegte id gee niks', spelerAdres('abc'), '')
  is('leeg gee niks',        spelerAdres(''), '')
  is('null gee niks',        spelerAdres(null), '')
}

console.log('\n── Die handvatsel: die ERKENNING ──')
/* `magWys()` laat 'n clip sonder 'n naam glad nie wys nie, en by 'n geplakte
   skakel is die handvatsel die enigste naam wat ons het. */
is('uit n volle adres',   handvatselUit(`https://www.tiktok.com/@iemand/video/${ID}`), '@iemand')
is('met punte en strepe', handvatselUit(`https://www.tiktok.com/@ds.jan_smit/video/${ID}`), '@ds.jan_smit')
is('sonder www',          handvatselUit(`https://tiktok.com/@iemand/video/${ID}`), '@iemand')
is('net die profiel',     handvatselUit('https://www.tiktok.com/@iemand'), '@iemand')
is('met n navraag',       handvatselUit(`https://www.tiktok.com/@iemand/video/${ID}?x=1`), '@iemand')
is('n punt aan die einde word afgehaal', handvatselUit('https://www.tiktok.com/@iemand./video/1'), '@iemand')
is('n kort skakel dra dit nie', handvatselUit('https://vt.tiktok.com/ZSqa9Knhv/'), '')
is('n YouTube-skakel',    handvatselUit('https://youtu.be/jACGS5QkLkQ'), '')
is('leeg',                handvatselUit(''), '')
is('null',                handvatselUit(null), '')
is('undefined',           handvatselUit(undefined), '')
is('n getal',             handvatselUit(12345), '')
is('net n apestert',      handvatselUit('https://www.tiktok.com/@'), '')
is('n absurd lang naam',  handvatselUit(`https://www.tiktok.com/@${'x'.repeat(80)}/video/1`), '')

console.log('\n── Niks gooi nie ──')
for (const x of [null, undefined, 0, 1, '', '   ', [], {}, true, false, NaN]) {
  is(`tiktokIdUit(${JSON.stringify(x)}) gee n string`, typeof tiktokIdUit(x), 'string')
  is(`isKortSkakel(${JSON.stringify(x)}) gee n boolean`, typeof isKortSkakel(x), 'boolean')
  is(`handvatselUit(${JSON.stringify(x)}) gee n string`, typeof handvatselUit(x), 'string')
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
