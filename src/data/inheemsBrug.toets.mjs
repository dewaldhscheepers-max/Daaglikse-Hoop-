/* node src/data/inheemsBrug.toets.mjs — die brug se suiwer besluite. */
import { isVreemdeAdres, veiligeNaam, isKanselleer } from './inheemsBrug.js'
let n = 0, f = 0
const t = (ok, m) => { n++; if (!ok) { f++; console.log('✗ ' + m) } }
const G = 'www.dewaldscheepers.com'

// isVreemdeAdres
t(isVreemdeAdres('https://wa.me/?text=x', G) === true, 'wa.me is vreemd')
t(isVreemdeAdres('https://firebasestorage.googleapis.com/v0/b/x.pdf', G) === true, 'Storage-PDF is vreemd')
t(isVreemdeAdres('https://dewaldscheepers.com/go', G) === true, "apex is 'n ander gasheer")
t(isVreemdeAdres('https://www.dewaldscheepers.com/english', G) === false, 'eie gasheer is nie vreemd')
t(isVreemdeAdres('https://WWW.DewaldScheepers.com/x', G) === false, 'kas maak nie saak')
t(isVreemdeAdres('/english', G) === false, 'relatiewe pad')
t(isVreemdeAdres('?give=once', G) === false, 'navraag alleen')
t(isVreemdeAdres('mailto:a@b.c', G) === false, 'mailto gaan sy gang')
t(isVreemdeAdres('tel:0123', G) === false, 'tel gaan sy gang')
t(isVreemdeAdres('javascript:alert(1)', G) === false, 'javascript word nie genavigeer nie')
t(isVreemdeAdres('', G) === false, 'leeg')
t(isVreemdeAdres(null, G) === false, 'null')
t(isVreemdeAdres('http://wa.me/x', G) === true, 'http na vreemd')
t(isVreemdeAdres('https://www.dewaldscheepers.com.boos.net/', G) === true, 'suffiks-truuk is vreemd')
t(isVreemdeAdres('https://www.payfast.co.za/eng/process', G) === true, 'PayFast is vreemd (allowNavigation hou hom in die app)')

// veiligeNaam
t(veiligeNaam('daaglikse-hoop.jpg', 'image/jpeg') === 'daaglikse-hoop.jpg', 'gewone naam bly')
t(veiligeNaam('../../etc/passwd', '') === 'passwd', 'geen pad-ontsnapping')
t(!veiligeNaam('a/b\\c.png', 'image/png').includes('/'), 'geen skuinsstreep')
t(veiligeNaam('', 'image/webp') === 'daaglikse-hoop.webp', 'leë naam kry verstek + uitbreiding')
t(veiligeNaam('prent', 'image/png') === 'prent.png', 'uitbreiding uit tipe')
t(veiligeNaam('prent', 'image/jpeg; charset=x') === 'prent.jpg', 'tipe met parameter')
t(veiligeNaam('prent', 'iets/vreemd') === 'prent', 'onbekende tipe: geen uitbreiding')
t(veiligeNaam('volg jesus week 9.jpg', 'image/jpeg') === 'volg-jesus-week-9.jpg', 'spasies word strepe')
t(veiligeNaam('.verborge', 'image/png').startsWith('verborge'), 'geen verborge lêer')
t(veiligeNaam('x'.repeat(200) + '.jpg', 'image/jpeg').length <= 84, 'lengte afgekap')
t(veiligeNaam('sorg-migrasie-rugsteun.json', 'application/json') === 'sorg-migrasie-rugsteun.json', 'json bly')

// isKanselleer
t(isKanselleer(new Error('Share canceled')) === true, 'Capacitor se kanselleer')
t(isKanselleer({ errorMessage: 'Share cancelled' }) === true, 'errorMessage-vorm')
t(isKanselleer(new Error('File not found')) === false, 'egte fout is nie kanselleer')
t(isKanselleer(undefined) === false, 'niks')

console.log(f ? `${f} van ${n} FOUT` : `${n} toetse groen`)
process.exit(f ? 1 : 0)
