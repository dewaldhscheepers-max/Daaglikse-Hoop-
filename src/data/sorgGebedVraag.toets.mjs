/* node src/data/sorgGebedVraag.toets.mjs — klink 'n Dra Mekaar-boodskap soos
   'n gebedsversoek, en mag die vorm dan voorstel dat dit Bid Saam toe gaan? */
import { klinkSoosGebed, magVoorstel } from './sorgGebedVraag.js'

let n = 0, f = 0
const t = (ok, m) => { n++; if (!ok) { f++; console.log('✗ ' + m) } }

// ── Gebedsversoeke: die vorm moet vra ──
for (const s of [
  'Bid asseblief vir my, ek is so moeg',
  'Bid vir my seun wat in die hospitaal is',
  'bid vir ons gesin, ons gaan deur n moeilike tyd',
  'Sal julle asseblief vir my bid?',
  'Kan iemand vir ons bid',
  'Ek vra gebed vir my ma se operasie môre',
  'Gebed asseblief vir my werk',
  'Ek het julle gebede nodig',
  'Hou my asseblief in jou gebede. Hou my in julle gebede.',
  'Onthou ons in julle gebede',
  'Dit is my gebedsversoek vir hierdie week',
  'Bid saam met my vir n wonderwerk',
  'Ek soek gebed vir my huwelik',
  'Dra my in gebed asb',
  'BID ASSEBLIEF VIR MY',
  'Please pray for me',
  'Bid tog vir hom',
  'Ek het gebede nodig vir my kind',
]) t(klinkSoosGebed(s), 'gebed: ' + s)

// ── Raadsvrae: die vorm moet NIE vra nie ──
for (const s of [
  'Hoe het julle deur n egskeiding gekom? Ek weet nie waar om te begin nie.',
  'Ek bid elke aand maar ek voel steeds alleen. Wat het julle gehelp?',
  'My man het sy werk verloor en ons sukkel met geld. Enige raad?',
  'Ek sukkel met angs in die oggende, hoe hanteer julle dit?',
  'Ons kind wil nie meer kerk toe gaan nie. Hoe praat ek met hom?',
  'My gebed is dat ek eendag weer vrede sal hê, maar hoe kom ek daar?',
  'Ek het al baie gebid oor my verslawing, wat het vir julle gewerk?',
  'Bidsaam is mooi maar ek soek raad oor my skoonma',
  '',
  'kort',
]) t(!klinkSoosGebed(s), 'raad: ' + s)

// ── Gemors ──
t(!klinkSoosGebed(null) && !klinkSoosGebed(undefined) && !klinkSoosGebed(42), 'gemors gee nee')

// ── magVoorstel ──
t(magVoorstel({ teks: 'Bid asseblief vir my' }) === true, 'n gebed sonder krisis: stel voor')
t(magVoorstel({ teks: 'Bid asseblief vir my', krisis: true }) === false, 'KRISIS gaan nooit Bid Saam toe nie')
t(magVoorstel({ teks: 'Bid asseblief vir my', reedsGevra: true }) === false, 'sy het al "nee" gesê: nie weer vra nie')
t(magVoorstel({ teks: 'Hoe hanteer julle rou?' }) === false, 'n raadsvraag: niks')
t(magVoorstel() === false, 'niks ingegee: niks')

console.log(f ? `${f} van ${n} FOUT` : `${n} toetse groen`)
process.exit(f ? 1 : 0)
