/* Wat die diensketter mag kas.
 *
 * Hierdie toets bestaan omdat die fout wat hy keer STIL is. Kas jy klank per
 * ongeluk, kry niemand 'n fout nie — die boodskap stop net voor die einde, en
 * dit doen dit weer môre. Die enigste manier om dit vas te hou, is hier.
 */
import { magKas, isKlank, padUit } from './kasBesluit.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

const B = 'https://firebasestorage.googleapis.com/v0/b/daaglikse-hoop.appspot.com/o'
const T = '?alt=media&token=8f3a1c2e-0000-4444-8888-abcdefabcdef'

console.log('\n── Die pad kom heel uit die URL ──\n')
is('n gewone nota', padUit(`${B}/notes%2F2026-08-16.mp3${T}`), 'notes/2026-08-16.mp3')
is('spasies in die naam',
   padUit(`${B}/notes%2F16%20Augustus.m4a${T}`), 'notes/16 Augustus.m4a')
is('geneste vouers',
   padUit(`${B}/sorg%2Fstem%2Fabc123.webm${T}`), 'sorg/stem/abc123.webm')
is('n prent',   padUit(`${B}/wallpapers%2Fvrede.jpg${T}`), 'wallpapers/vrede.jpg')
is('n URL wat nie n URL is nie', padUit('hierdie is nie n url nie'), '')
is('n lee string',               padUit(''), '')

console.log('\n── Klank word herken ──\n')
for (const uit of ['mp3', 'm4a', 'aac', 'ogg', 'opus', 'wav', 'webm', 'flac', 'MP3', 'M4A']) {
  is(`.${uit} is klank`, isKlank(`${B}/notes%2Fboodskap.${uit}${T}`), true)
}
is('destination audio is klank, ook sonder n uitbreiding',
   isKlank(`${B}/notes%2Fsonderpunt${T}`, 'audio'), true)
is('destination video ook',
   isKlank(`${B}/notes%2Fsonderpunt${T}`, 'video'), true)
/* Die belangrikste geval: 'n ou blaaier gee 'n LEe destination. Die
   uitbreiding moet dit dan alleen dra. */
is('n lee destination val terug op die uitbreiding',
   isKlank(`${B}/notes%2F2026-08-16.mp3${T}`, ''), true)
is('en n ontbrekende destination ook',
   isKlank(`${B}/notes%2F2026-08-16.mp3${T}`), true)

console.log('\n── Prente is nie klank nie ──\n')
for (const uit of ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg']) {
  is(`.${uit} is nie klank nie`, isKlank(`${B}/wallpapers%2Fa.${uit}${T}`), false)
}
is('n pdf ook nie', isKlank(`${B}/boeke%2Fhoop.pdf${T}`), false)
is('n json ook nie', isKlank(`${B}/data%2Fx.json${T}`), false)
is('geen punt in die pad nie', isKlank(`${B}/wallpapers%2Fsonderpunt${T}`), false)

console.log('\n── Die EGTE pad wat hierdie app oplaai ──\n')
/* Admin.jsx en SorgOpname.jsx skryf albei na `audio/`. Die uitbreiding kom
   van die mens se leernaam af en kan enigiets wees — die vouer nie. */
is('n gewone oggendnota',
   magKas(`${B}/audio%2FGod_is_naby_1755300000000.mp3${T}`, 'audio'), false)
is('dieselfde nota met n LEe destination',
   magKas(`${B}/audio%2FGod_is_naby_1755300000000.mp3${T}`, ''), false)
is('n Sorg-antwoord in dieselfde vouer',
   magKas(`${B}/audio%2Fsorg-antwoord_1755300000000_ab12c.webm${T}`, ''), false)
/* Die geval wat die uitbreiding-hek alleen sou mis. */
is('n leer sonder n uitbreiding in audio/',
   magKas(`${B}/audio%2Fboodskap_1755300000000${T}`, ''), false)
is('n vreemde uitbreiding in audio/',
   magKas(`${B}/audio%2Fboodskap_1755300000000.MPEG${T}`, ''), false)
is('en n hoofletter-uitbreiding in audio/',
   magKas(`${B}/audio%2Fboodskap.M4A${T}`, ''), false)

console.log('\n── En nou die enigste vraag wat die diensketter vra ──\n')
is('n prent uit Storage word gekas',
   magKas(`${B}/wallpapers%2Fvrede.webp${T}`, 'image'), true)
is('n KLANKLeer word NOOIT gekas nie',
   magKas(`${B}/notes%2F2026-08-16.mp3${T}`, 'audio'), false)
is('ook nie wanneer die blaaier niks van destination weet nie',
   magKas(`${B}/notes%2F2026-08-16.mp3${T}`, ''), false)
is('ook nie n Sorg-stemnota nie',
   magKas(`${B}/sorg%2Fstem%2Fabc.webm${T}`, ''), false)
is('ook nie n kinderboek se klank nie',
   magKas(`${B}/kinderboeke%2Fnoag.m4a${T}`, ''), false)
/* En die geval wat die HELE fout was: die eerste versoek van 'n mediaspeler
   dra dikwels geen Range nie en lyk soos 'n gewone haal. Ons mag hom OOK nie
   kas nie, want dit is presies die volledige liggaam wat later vir 'n
   Range-versoek teruggegee word. */
is('n mediaspeler se EERSTE versoek word ook nie gekas nie',
   magKas(`${B}/notes%2F2026-08-16.mp3${T}`, 'audio'), false)

console.log('\n── Niks buite ons eie Storage nie ──\n')
is('n ander domein se prent',
   magKas('https://voorbeeld.co.za/prent.jpg', 'image'), false)
is('ons eie API', magKas('https://www.dewaldscheepers.com/api/wallpaper?u=x', 'image'), false)
is('n YouTube-blad', magKas('https://www.youtube.com/embed/abc', ''), false)
is('rommel', magKas('nie n url nie', 'image'), false)
is('niks', magKas('', ''), false)
/* googleapis.com is nie firebasestorage.googleapis.com nie. */
is('n ander googleapis-gasheer',
   magKas('https://storage.googleapis.com/daaglikse-hoop/x.jpg', 'image'), false)
/* En iemand wat ons oorsprong as 'n PAD gebruik, mag nie deurglip nie. */
is('die oorsprong as n pad op n ander domein',
   magKas('https://boos.example/https://firebasestorage.googleapis.com/a.jpg', 'image'), false)

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
