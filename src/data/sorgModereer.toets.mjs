/* Een rapport verwyder NIKS, en nood is nie oortreding nie.
 *
 * Twee dinge word hier vasgehou omdat albei al 'n keer verkeerd om was:
 *
 *   1. 'n Enkele druk het 'n opmerking DADELIK laat verdwyn. Op 'n groot muur
 *      is dit 'n knoppie waarmee enige mens enige ander mens kan stilmaak.
 *   2. "Dit klink of iemand in gevaar is" is nie 'n klag nie. Dit mag NIKS
 *      versteek nie — dit moet iemand laat kyk.
 */
import {
  REDES, keurRede, redeNaam, DREMPEL, DRINGEND, naRapport,
  AKSIES, keurAksie, pasAksieToe,
  leesBlok, blokBy, blokWeg, sonderGeblok, blokMerk, kanBlok,
} from './sorgModereer.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)

console.log('\n── EEN rapport verwyder NIKS ──\n')
{
  /* DIE toets. Dit was voorheen een druk en dit was weg. */
  const een = naRapport({ rapporte: 1, redes: ['onvriendelik'] })
  is('een rapport: dit bly staan', een.wys, true)
  const twee = naRapport({ rapporte: 2, redes: ['onvriendelik', 'spam'] })
  is('twee ook', twee.wys, true)
  const drie = naRapport({ rapporte: DREMPEL, redes: ['onvriendelik'] })
  is(`by ${DREMPEL} is dit weg`, drie.wys, false)
  waar('en die admin weet hoekom', /gerapporteer/.test(drie.rede))
  is('en dit staan bo', drie.dringend, true)

  is('geen rapporte, geen probleem', naRapport({}).wys, true)
  is('en dit is nie dringend nie', naRapport({}).dringend, false)
}

console.log('\n── "Iemand is in gevaar" versteek NIKS ──\n')
{
  /* Dit is nie moderering nie — dit is 'n mens wat sê daar is iemand in nood.
     Dieselfde onderskeid as in sorgVeilig.js: nood is nie oortreding nie. */
  const g = naRapport({ rapporte: 1, redes: ['gevaarlik'] })
  is('dit BLY op die muur', g.wys, true)
  is('maar dit is DRINGEND', g.dringend, true)
  waar('en "gevaarlik" is die rede wat dit doen', DRINGEND.includes('gevaarlik'))

  /* Ook wanneer dit die enigste rapport is. */
  is('een enkele gevaar-rapport is genoeg om te laat kyk',
     naRapport({ rapporte: 1, redes: ['gevaarlik'] }).dringend, true)
}

console.log('\n── n OUTOMATIESE merk versteek WEL dadelik ──\n')
{
  /* Dit is 'n patroon in die teks self, nie een mens se stem teen 'n ander
     nie. Sien src/data/sorgVeilig.js. */
  const o = naRapport({ rapporte: 0, outoOnveilig: true })
  is('dit is weg', o.wys, false)
  is('dit is dringend', o.dringend, true)
  is('en die rede sê dis outomaties', o.rede, 'outomaties gemerk')
}

console.log('\n── Die redes ──\n')
{
  is('elke sleutel is uniek', new Set(REDES.map(r => r.sleutel)).size, REDES.length)
  waar('elkeen het n naam', REDES.every(r => r.naam && r.naam.length > 3))
  is('"Iets anders" staan LAASTE', REDES[REDES.length - 1].sleutel, 'anders')

  is('n geldige rede kom deur', keurRede('spam'), 'spam')
  is('n uitgedinkte rede val uit', keurRede('bloupers'), '')
  is('leeg val uit', keurRede(''), '')
  is('null val uit', keurRede(null), '')
  waar('n naam kom terug', redeNaam('spam').length > 0)
  is('n onbekende naam gee niks', redeNaam('bloupers'), '')

  /* Rommel in die lys mag nie 'n telling laat lieg nie. */
  const r = naRapport({ rapporte: 2, redes: ['spam', 'bloupers', '', null, 'spam'] })
  is('rommel val uit en duplikate vou in', r.redes, ['spam'])
}

console.log('\n── Die aksies ──\n')
{
  is('elke sleutel is uniek', new Set(AKSIES.map(a => a.sleutel)).size, AKSIES.length)
  waar('elkeen het n naam en n verduideliking', AKSIES.every(a => a.naam && a.fyn))
  is('n uitgedinkte aksie val uit', keurAksie('vernietig'), '')
  is('en gee null', pasAksieToe('vernietig'), null)
  is('leeg ook', pasAksieToe(''), null)
}

console.log('\n── Wat elke aksie DOEN ──\n')
{
  const nou = '2026-08-23'
  const behou = pasAksieToe('behou', { rede: 'niks fout', wanneer: nou })
  is('behou wys weer', behou.status, 'wys')
  is('en sit die rapporte terug op nul', behou.rapporte, 0)

  is('versteek haal dit af', pasAksieToe('versteek', {}).status, 'weg')
  is('herstel sit dit terug', pasAksieToe('herstel', {}).status, 'wys')
  is('en vee die rapporte skoon', pasAksieToe('herstel', {}).rapporte, 0)
  is('spam is weg', pasAksieToe('spam', {}).status, 'spam')
  is('verwyder is permanent', pasAksieToe('verwyder', {}).status, 'verwyder')
  is('blokkeer merk die mens', pasAksieToe('blokkeer', {}).geblokkeer, true)

  /* Waarsku raak NIE aan die inhoud nie — dit is 'n nota aan die mens. */
  const w = pasAksieToe('waarsku', {})
  is('waarsku merk die mens', w.gewaarsku, true)
  is('en laat die inhoud staan', w.status, undefined)
}

console.log('\n── Elke aksie dra n REDE en n DATUM ──\n')
{
  /* "Versteek" op sy eie is geen rekord nie. Ses maande later moet 'n mens kan
     sien waarom iets weg is. */
  for (const a of AKSIES) {
    const uit = pasAksieToe(a.sleutel, { rede: 'want X', wanneer: '2026-08-23' })
    is(`${a.sleutel}: die aksie staan`, uit.modAksie, a.sleutel)
    is(`  → die rede staan`, uit.modRede, 'want X')
    is(`  → die datum staan`, uit.modDatum, '2026-08-23')
  }
  /* 'n Lang rede word afgekap; dit mag nooit 'n dokument opblaas nie. */
  is('n lang rede word afgekap',
     pasAksieToe('versteek', { rede: 'x'.repeat(500) }).modRede.length, 200)
  is('geen rede is n lee string, nie undefined nie',
     pasAksieToe('versteek', {}).modRede, '')
}

console.log('\n── Blokkeer le op die FOON ──\n')
{
  is('niks', leesBlok(null), [])
  is('stukkende JSON', leesBlok('{{{'), [])
  is('nie n lys nie', leesBlok('{"a":1}'), [])
  is('rommel binne-in val uit', leesBlok('[null,3,"",{"x":1},"abc"]'), ['abc'])
  is('duplikate vou in', leesBlok('["abc","abc"]'), ['abc'])

  let b = []
  b = blokBy(b, 'skrywer1')
  is('een geblok', b, ['skrywer1'])
  b = blokBy(b, 'skrywer1')
  is('twee keer blok verander niks', b, ['skrywer1'])
  b = blokBy(b, 'skrywer2')
  is('twee mense', b.length, 2)
  is('n lee merk doen niks', blokBy(b, '').length, 2)
  is('n spasie ook nie', blokBy(b, '  ').length, 2)
  b = blokWeg(b, 'skrywer1')
  is('deblokkeer werk', b, ['skrywer2'])
  is('n onbekende merk verander niks', blokWeg(b, 'weg').length, 1)
}

console.log('\n── Net iemand met n NAAM kan geblokkeer word ──\n')
{
  /* Om 'n ANONIEME mens te kan blokkeer, sou beteken die skerm kry 'n stabiele
     merk vir hom — en daardie merk laat enigiemand sien watter "Anoniem"-
     plasings van dieselfde mens af kom, oor onderwerpe heen. Op hierdie muur
     is dit die lek wat die anonimiteit waardeloos maak. */
  is('n anonieme mens het geen merk', blokMerk({ anoniem: true, naam: 'Maria' }), '')
  is('en kan nie geblok word nie', kanBlok({ anoniem: true, naam: 'Maria' }), false)
  is('n genoemde mens wel', blokMerk({ anoniem: false, naam: 'Elna' }), 'naam:elna')
  is('en kan geblok word', kanBlok({ anoniem: false, naam: 'Elna' }), true)
  is('hoofletters maak nie saak nie', blokMerk({ anoniem: false, naam: 'ELNA' }), 'naam:elna')
  is('spasies rondom ook nie', blokMerk({ anoniem: false, naam: '  Elna  ' }), 'naam:elna')
  is('geen naam, geen merk', blokMerk({ anoniem: false, naam: '' }), '')
  is('niks breek nie', blokMerk(null), '')
}

console.log('\n── Wat n geblokte mens skryf, verdwyn ──\n')
{
  const items = [
    { id: 'a', anoniem: false, naam: 'Elna', teks: 'een' },
    { id: 'b', anoniem: false, naam: 'Johan', teks: 'twee' },
    { id: 'c', anoniem: false, naam: 'Elna', teks: 'drie' },
    { id: 'd', anoniem: true, teks: 'anoniem' },
  ]
  is('sonder n blok bly alles', sonderGeblok(items, []).length, 4)
  is('null blok ook', sonderGeblok(items, null).length, 4)

  const uit = sonderGeblok(items, ['naam:elna'])
  is('Elna se twee is weg', uit.length, 2)
  is('en die regtes bly', uit.map(x => x.id), ['b', 'd'])

  /* DIE toets. 'n Anonieme item mag NOOIT deur 'n blok verdwyn nie — dit
     dra geen merk, en 'n filter wat op 'n ontbrekende veld tref, sou die hele
     muur laat verdwyn sodra iemand een mens blokkeer. */
  is('anoniem bly ALTYD', sonderGeblok(items, ['naam:elna', 'naam:johan', '']).map(x => x.id), ['d'])
  is('n lee lys breek nie', sonderGeblok([], ['naam:elna']), [])
  is('null items breek nie', sonderGeblok(null, ['naam:elna']), [])
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
