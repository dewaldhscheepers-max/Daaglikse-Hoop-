/* Die LUISTER-speler se suiwer helfte: spreek-stukke en stemkeuse.
 *
 *   node src/data/luisterStukke.toets.mjs
 */
import { maakStukke, totaleStukke, kiesStem, isManstem, MAKS_STUK } from './luisterStukke.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}
const waar = (n, k) => is(n, !!k, true)

console.log('\n── maakStukke ──')
{
  is('leeg', maakStukke(''), [])
  is('een kort sin', maakStukke('Hello there.'), ['Hello there.'])
  /* Kort sinne word saamgepak tot een stuk. */
  is('kort sinne saam', maakStukke('One. Two. Three.'), ['One. Two. Three.'])
  /* Vraag- en uitroeptekens tel ook as sin-grense. */
  const q = maakStukke('Are you sure? Yes! Go.')
  is('vraag en uitroep', q, ['Are you sure? Yes! Go.'])

  /* Elke stuk bly onder die grens. */
  const lang = Array.from({ length: 40 }, (_, i) => `This is sentence number ${i}.`).join(' ')
  const s = maakStukke(lang)
  waar('meer as een stuk', s.length > 1)
  waar('elke stuk onder die grens', s.every(x => x.length <= MAKS_STUK))
  is('niks gaan verlore nie', s.join(' ').replace(/\s+/g,' '), lang.replace(/\s+/g,' '))
}

console.log('\n── Een baie lang sin word hard gebreek ──')
{
  const woord = 'word'
  const reusesin = Array.from({ length: 120 }, () => woord).join(' ') + '.'  // ~600 chars, geen punt binne-in
  const s = maakStukke(reusesin)
  waar('in stukke gebreek', s.length > 1)
  waar('elke stuk onder die grens', s.every(x => x.length <= MAKS_STUK))
  waar('geen stuk begin/eindig met spasie', s.every(x => x === x.trim()))
}

console.log('\n── totaleStukke ──')
{
  const afdelings = [{ teks: 'One. Two.' }, { teks: 'Three sentence here. Four.' }]
  is('tel oor afdelings', totaleStukke(afdelings),
     maakStukke('One. Two.').length + maakStukke('Three sentence here. Four.').length)
  is('null is 0', totaleStukke(null), 0)
}

console.log('\n── kiesStem ──')
{
  const stemme = [
    { name: 'Afrikaans', lang: 'af-ZA', localService: true },
    { name: 'US English', lang: 'en-US', localService: false },
    { name: 'SA English', lang: 'en-ZA', localService: true },
    { name: 'UK English', lang: 'en-GB', localService: true },
  ]
  is('verkies en-ZA plaaslik', kiesStem(stemme).name, 'SA English')
  /* Sonder en-ZA val dit na en-GB. */
  is('val na en-GB', kiesStem(stemme.filter(s => s.lang !== 'en-ZA')).name, 'UK English')
  /* Geen Engels → null (blaaier kies self). */
  is('geen Engels gee null', kiesStem([{ name: 'Afr', lang: 'af-ZA' }]), null)
  is('leeg gee null', kiesStem([]), null)
  is('null gee null', kiesStem(null), null)
  /* 'n Nie-plaaslike Engelse stem word steeds gekies as daar niks beters is. */
  is('nie-plaaslik is ok', kiesStem([{ name: 'Cloud EN', lang: 'en-US', localService: false }]).name, 'Cloud EN')
}


console.log('\n── kiesStem: MANSTEM, so natuurlik as moontlik ──')
{
  const v = (name, lang, localService = true, voiceURI = '') => ({ name, lang, localService, voiceURI })
  /* Chrome op 'n rekenaar: vrou eerste in die lys, man moet wen. */
  is('Google: Male bo Female', kiesStem([v('Google UK English Female','en-GB',false), v('Google UK English Male','en-GB',false)]).name, 'Google UK English Male')
  /* "Female" bevat "male" — mag NOOIT as man tel nie. */
  is('Female is nie Male nie', isManstem(v('Google UK English Female','en-GB')), false)
  /* iPhone: Daniel (Brits, man) bo Samantha en Karen. */
  is('iPhone: Daniel', kiesStem([v('Samantha','en-US'), v('Karen','en-AU'), v('Daniel','en-GB')]).name, 'Daniel')
  /* Edge: 'n NATUURLIKE manstem bo 'n gewone manstem. */
  is('Edge: Natural man wen', kiesStem([v('Microsoft David - English (United States)','en-US'), v('Microsoft Ryan Online (Natural) - English (United Kingdom)','en-GB',false), v('Microsoft Sonia Online (Natural) - English (United Kingdom)','en-GB',false)]).name, 'Microsoft Ryan Online (Natural) - English (United Kingdom)')
  /* Man wen selfs oor die taal-voorkeur: 'n Amerikaanse man bo 'n SA-vrou. */
  is('man bo taal', kiesStem([v('SA Female','en-ZA'), v('Aaron','en-US')]).name, 'Aaron')
  /* Android: die stemkode in voiceURI. */
  is('Android: gbd is man', kiesStem([v('English United Kingdom','en-GB',true,'en-gb-x-gba-local'), v('English United Kingdom','en-GB',true,'en-gb-x-gbd-local')]).voiceURI, 'en-gb-x-gbd-local')
  /* Geen manstem nie → steeds 'n Engelse stem, nie null nie. */
  is('geen man: beste Engels', kiesStem([v('Samantha','en-US'), v('Afrikaans','af-ZA')]).name, 'Samantha')
}

console.log(`\n${reg} reg, ${val} vals\n`)
if (val) process.exit(1)
