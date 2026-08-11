/* Loop met:  node src/data/gebedDeel.toets.mjs

   Die "Bid vir my"-lus. Die meeste toetse hier gaan oor wat NIE mag gebeur
   nie, want dit is 'n funksie wat 'n mens se swaarste woorde oor WhatsApp
   stuur.

   Die belangrikste een: 'n krisisversoek mag nooit deelbaar wees nie, ook nie
   wanneer die persoon self die toestemmingsblokkie gemerk het nie. */

import {
  magDeel, saamSin, saamSinVirOntvanger, gebedSkakel, idUitPad,
  deelBoodskap, magVraHoeGaanDit, MIN_LENGTE,
} from './gebedDeel.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL  ${naam} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

console.log('\n── Die krisishek. Niks anders in hierdie lêer maak saak as dit lek nie ──')
for (const teks of [
  'Ek wil myself doodmaak en ek weet nie wat om te doen nie',
  'Ek dink al dae lank aan selfmoord',
  'My man slaan my en ek is bang vir my lewe',
  'Ek wil nie meer lewe nie asseblief bid vir my',
]) {
  const u = magDeel({ teks, toestemming: true })
  is(`geweier ondanks toestemming: "${teks.slice(0, 34)}…"`, u.mag, false)
  is('  en die rede is krisis', u.rede, 'krisis')
  is('  en die woorde word genoem', u.krisis.length > 0, true)
}

console.log('\n── Kontakbesonderhede gaan nie oor WhatsApp nie ──')
for (const teks of [
  'Bid asseblief vir my, bel my by 0821234567 as jy wil',
  'My nommer is 083 555 1234, bid vir my huwelik asseblief',
]) {
  const u = magDeel({ teks, toestemming: true })
  is(`geweier: "${teks.slice(0, 34)}…"`, u.mag, false)
  is('  en die rede is kontak', u.rede, 'kontak')
}

console.log('\n── Toestemming is nie opsioneel nie ──')
is('sonder toestemming, geen deel',
   magDeel({ teks: 'Bid asseblief vir my huwelik, dit gaan swaar', toestemming: false }).mag, false)
is('  rede', magDeel({ teks: 'Bid asseblief vir my huwelik, dit gaan swaar', toestemming: false }).rede, 'geen-toestemming')

console.log('\n── Te kort ──')
is(`onder ${MIN_LENGTE} karakters`, magDeel({ teks: 'bid', toestemming: true }).mag, false)
is('  rede', magDeel({ teks: 'bid', toestemming: true }).rede, 'te-kort')
is('leeg', magDeel({ teks: '', toestemming: true }).mag, false)
is('niks', magDeel({ teks: null, toestemming: true }).mag, false)

console.log('\n── Wat WEL deur moet kom ──')
for (const teks of [
  'Bid asseblief vir my huwelik. Dit gaan al maande sleg en ek weet nie meer nie.',
  'My werk is weg en ek weet nie hoe ek volgende maand gaan betaal nie.',
  'Ek is bang oor my kind se toekoms en ek slaap sleg.',
  'Bid asseblief vir my ma se gesondheid.',
]) is(`deur: "${teks.slice(0, 40)}…"`, magDeel({ teks, toestemming: true }).mag, true)

console.log('\n── Die teller. 0 mag NOOIT as "0 mense" wys nie ──')
is('nul is stil en warm', saamSin(0), 'Jou gebedsversoek is nou deel van ons gebedsgemeenskap.')
is('  ook vir undefined', saamSin(undefined), 'Jou gebedsversoek is nou deel van ons gebedsgemeenskap.')
is('  ook vir negatief', saamSin(-3), 'Jou gebedsversoek is nou deel van ons gebedsgemeenskap.')
is('een is enkelvoud', saamSin(1), '1 persoon bid saam met jou.')
is('vier', saamSin(4), '4 mense bid saam met jou.')
is('elf', saamSin(11), '11 mense bid saam met jou.')
is('nooit die woord "like" of "gewild" nie',
   [0, 1, 5, 100].every(n => !/like|gewild|top|beste|meeste/i.test(saamSin(n))), true)
is('altyd oor SAAMSTAAN',
   [1, 5, 100].every(n => /saam/i.test(saamSin(n))), true)

console.log('\n── Wat die ontvanger sien ──')
is('nul wys niks — hy hoef nie te weet hy is die eerste nie', saamSinVirOntvanger(0), '')
is('een', saamSinVirOntvanger(1), '1 persoon bid reeds saam.')
is('sewe', saamSinVirOntvanger(7), '7 mense bid reeds saam.')

console.log('\n── Die skakel ──')
is('word gebou', gebedSkakel('abc123XYZ'), 'https://dewaldscheepers.com/bid/abc123XYZ')
is('geen dubbele skuinsstreep', gebedSkakel('abc123', 'https://x.com/'), 'https://x.com/bid/abc123')
is('lees terug uit die pad', idUitPad('/bid/abc123XYZ'), 'abc123XYZ')
is("met 'n skuinsstreep agteraan", idUitPad('/bid/abc123XYZ/'), 'abc123XYZ')
is('ander paaie is null', idUitPad('/sorg'), null)
is('geen id is null', idUitPad('/bid/'), null)
is('te kort is null', idUitPad('/bid/ab'), null)
is('gemors is null', idUitPad('/bid/../../etc/passwd'), null)
is('spasies is null', idUitPad('/bid/abc 123'), null)

console.log('\n── Die WhatsApp-boodskap ──')
const bood = deelBoodskap('https://dewaldscheepers.com/bid/xyz789')
is('vra om saam te bid', /Sal jy asseblief saam met my bid/.test(bood), true)
is('dra die skakel', bood.includes('https://dewaldscheepers.com/bid/xyz789'), true)
is('sê NIE "laai af" nie', /laai.*af|download|installeer/i.test(bood), false)
is('sê NIE "deel" of "help ons groei" nie', /help ons|groei|deel hierdie|share/i.test(bood), false)

console.log('\n── Hoe gaan dit vandag? ──')
const dag = (n) => new Date(2026, 7, n, 12, 0, 0).toISOString()
is('nie op dag 1 nie', magVraHoeGaanDit({ geplaasOp: dag(1), laasGevraOp: null, nou: dag(2) }), false)
is('nie op dag 2 nie', magVraHoeGaanDit({ geplaasOp: dag(1), laasGevraOp: null, nou: dag(3) }), false)
is('wel op dag 4', magVraHoeGaanDit({ geplaasOp: dag(1), laasGevraOp: null, nou: dag(4) }), true)
is('maar net een keer', magVraHoeGaanDit({ geplaasOp: dag(1), laasGevraOp: dag(4), nou: dag(9) }), false)
is('stukkende datum breek nie', magVraHoeGaanDit({ geplaasOp: 'gemors', laasGevraOp: null, nou: dag(9) }), false)

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
