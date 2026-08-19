/* Waar 'n prent GAAN GEHAAL word om hom te deel.
 *
 * Die wallpaper op Dag 1 het gewys en nie gedeel nie. Dewald: "hierdie
 * wallpaper wil nie deel nie. die een op dag 5 het gedeel."
 *
 * Die oorsaak is die een wat api/wallpaper.js se opskrif reeds beskryf: 'n
 * `fetch` na firebasestorage.googleapis.com word deur CORS geblokkeer, terwyl
 * 'n <img> daarheen sonder moeite wys. Die prent LYK dus reg en die knoppie
 * doen niks.
 */
import { prentPad } from './prentPad.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

const FB = 'https://firebasestorage.googleapis.com/v0/b/daaglikse-hoop.firebasestorage.app'
  + '/o/covers%2Fvj-w1.jpg?alt=media&token=ec334c82-1049-4e5f-98af-c842e341f5d3'

console.log('\n── Storage gaan DEUR ons eie domein ──\n')
is('n Firebase-adres word geproxy',
   prentPad(FB), `/api/wallpaper?u=${encodeURIComponent(FB)}`)
is('die teken oorleef die enkodering',
   decodeURIComponent(prentPad(FB).slice('/api/wallpaper?u='.length)), FB)
is('storage.googleapis.com ook',
   prentPad('https://storage.googleapis.com/daaglikse-hoop/a.jpg'),
   `/api/wallpaper?u=${encodeURIComponent('https://storage.googleapis.com/daaglikse-hoop/a.jpg')}`)

console.log('\n── Wat NIE geproxy word nie ──\n')
/* Sonder 'n `window` is daar geen "ons eie domein" om teen te meet nie, en
   dan is 'n relatiewe pad die enigste ding wat sonder twyfel plaaslik is. */
is('n relatiewe pad bly soos hy is', prentPad('/beelde/x.jpg'), '/beelde/x.jpg')
is('n data-URI word nie aangeraak nie',
   prentPad('data:image/png;base64,iVBORw0KGgo='), 'data:image/png;base64,iVBORw0KGgo=')
is('n blob-URL ook nie',
   prentPad('blob:https://x/abc'), 'blob:https://x/abc')

console.log('\n── Niks val om op rommel nie ──\n')
for (const sleg of ['', null, undefined, 0]) {
  is(`${JSON.stringify(sleg)} kom net terug`, prentPad(sleg), sleg)
}
is('n stukkende adres kom onveranderd terug', prentPad('nie n adres nie'), 'nie n adres nie')

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
