/* node src/data/inheemsBrug.toets.mjs — die brug se suiwer besluite. */
import { isVreemdeAdres, veiligeNaam, isKanselleer, appBestemming, klankStaat, kunsVir, STOP_WAG_MS } from './inheemsBrug.js'
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

// appBestemming
const W = 'https://www.dewaldscheepers.com'
t(appBestemming(W + '/hoop/abc123') === W + '/hoop/abc123', 'hoop-skakel')
t(appBestemming('https://dewaldscheepers.com/bid/xyz') === W + '/bid/xyz', 'apex word www')
t(appBestemming(W + '/reels/7300000000000000000') === W + '/reels/7300000000000000000', 'reels')
t(appBestemming(W + '/go') === W + '/', '/go is die installeerblad → tuis')
t(appBestemming(W + '/go/') === W + '/', '/go/ ook')
t(appBestemming(W + '/go/support') === W + '/go/support', '/go/support bly')
t(appBestemming(W + '/go/volg-jesus/join?kode=AB12') === W + '/go/volg-jesus/join?kode=AB12', 'groepkode se navraag bly')
t(appBestemming(W + '/english?give=once') === W + '/english?give=once', 'english met navraag')
t(appBestemming(W + '/') === W + '/', 'tuis')
t(appBestemming(W) === W + '/', 'sonder skuinsstreep')
t(appBestemming(W + '/api/reels-lys') === null, 'nooit /api')
t(appBestemming(W + '/.well-known/assetlinks.json') === null, 'nooit .well-known')
t(appBestemming('https://boos.net/hoop/x') === null, 'vreemde gasheer')
t(appBestemming('https://www.dewaldscheepers.com.boos.net/hoop/x') === null, 'suffiks-truuk')
t(appBestemming('https://boos.dewaldscheepers.com/hoop/x') === null, 'ander subdomein')
t(appBestemming('javascript:alert(1)') === null, 'javascript')
t(appBestemming('daaglikshoop://hoop/x') === null, 'eie skema nie')
t(appBestemming('') === null && appBestemming(null) === null, 'leeg')
t(appBestemming(W + '/hoop/x#y') === W + '/hoop/x#y', 'hutsie bly')

// klankStaat — die voorgronddiens se staat kom NET uit die klank-element
t(klankStaat('playing') === 'playing', 'playing → playing')
t(klankStaat('play') === 'playing', 'play → playing')
t(klankStaat('pause') === 'paused', 'pause → paused (die diens bly, met n speel-knoppie)')
t(klankStaat('ended') === 'none', 'ended → none')
t(klankStaat('emptied') === null, "emptied is GEEN einde nie (herlaai met die skerm af)")
t(klankStaat('waiting') === null && klankStaat('timeupdate') === null && klankStaat(undefined) === null, 'ander gebeure verander niks')
t(STOP_WAG_MS >= 3000 && STOP_WAG_MS <= 15000, 'die stop wag n paar sekondes, nie niks en nie vir altyd nie')

// kunsVir — die inprop haal die prent self; net volle http(s)-adresse
const kuns = kunsVir([{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }], W + '/')
t(kuns.length === 1 && kuns[0].src === W + '/icons/icon-192.png', 'relatiewe prent word n volle adres')
t(kuns[0].sizes === '192x192' && kuns[0].type === 'image/png', 'grootte en tipe bly')
t(kunsVir([{ src: 'data:image/png;base64,xx' }, { src: 'blob:abc' }, { src: 'javascript:x' }], W).length === 0, 'data:, blob: en javascript: val uit')
t(kunsVir([{ src: 'https://firebasestorage.googleapis.com/v0/x.jpg' }], W)[0].src.startsWith('https://firebasestorage'), 'n volle adres bly')
t(kunsVir(null, W).length === 0 && kunsVir([null, {}], W).length === 0, 'gemors gee niks')

console.log(f ? `${f} van ${n} FOUT` : `${n} toetse groen`)
process.exit(f ? 1 : 0)
