/* Nooi iemand om te ANTWOORD.
 *
 * Dewald: "die app moet heavy fokken groei. so mense moet kan share en
 * invite."
 *
 * Deel en Nooi is nie dieselfde ding nie, en die verskil is die hele punt:
 *
 *   Deel  → "kyk hierna", na almal.
 *   Nooi  → "JY het iets om te sê vir hierdie mens", na een mens.
 *
 * Die tweede werk omdat die versoek nie 'n advertensie is nie. Hierdie leer
 * hou daardie verskil vas, want dit is presies die soort ding wat 'n mens
 * later "vereenvoudig" deur hulle een te maak.
 */
import { sorgSkakel, leesSorgSkakel, uitSorgPad, nooiWoorde, DEEL_WORTEL } from './sorgDeel.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)

console.log('\n── Die uitnodiging vra om ERVARING, nie om n aflaai nie ──\n')
{
  const w = nooiWoorde('My man het my verlaat')
  waar('dit noem die storie', w.includes('My man het my verlaat'))
  waar('dit sê waaroor dit gaan', /iets waardevols om vir hierdie persoon te sê/.test(w))
  waar('dit noem die blad', /Sorg & Ondersteuning/.test(w))
  /* DIE reël. Sodra hierdie woorde "laai die app af" word, is dit 'n
     advertensie en hou mense op om dit te stuur. */
  waar('dit vra NIE dat iemand die app aflaai nie', !/laai.*af|installeer|download/i.test(w))
  waar('en dit bedel nie', !/asseblief deel|deel asseblief|help my groei/i.test(w))
}

console.log('\n── Sonder n titel werk dit steeds ──\n')
{
  for (const leeg of [undefined, null, '', '   ']) {
    const w = nooiWoorde(leeg)
    waar(`titel ${JSON.stringify(leeg)}: geen lee aanhaling`, !/“”|""|: \.$/.test(w))
    waar(`titel ${JSON.stringify(leeg)}: geen "undefined"`, !/undefined|null/.test(w))
    waar(`titel ${JSON.stringify(leeg)}: dit sê steeds wat gevra word`,
         /iets waardevols om vir hierdie persoon te sê/.test(w))
  }
}

console.log('\n── Dit is n WhatsApp-boodskap, nie n opstel nie ──\n')
{
  const kort = nooiWoorde('')
  const lank = nooiWoorde('n Baie lang storie-opskrif wat iemand geskryf het oor sy huwelik')
  waar(`sonder titel is dit kort (${kort.length})`, kort.length <= 200)
  waar(`met titel bly dit hanteerbaar (${lank.length})`, lank.length <= 320)
  waar('een paragraaf, geen reëlbreuke', !/\n/.test(lank))
}

console.log('\n── Die skakel lyk soos Bid Nou s\'n: n PAD, nie n hash nie ──\n')
{
  /* Dewald: "dit moet soos bid nou se deel links werk." Bid Nou deel
     https://dewaldscheepers.com/bid/<id>. 'n Hash oorleef nie altyd 'n plak
     nie, en WhatsApp wys niks van hom nie. */
  const u = sorgSkakel('plasing', 'm123')
  is('die plasing se skakel', u, `${DEEL_WORTEL}/sorg/m123`)
  is('die video s\'n', sorgSkakel('video', 'abc'), `${DEEL_WORTEL}/sorg/video/abc`)
  waar('geen hash meer nie', !u.includes('#'))
  waar('en dit is dieselfde gasheer as Bid Nou', u.startsWith('https://dewaldscheepers.com/'))

  /* Heen en terug. */
  is('die pad lees terug', uitSorgPad('/sorg/m123'), { soort: 'plasing', id: 'm123' })
  is('die video-pad ook', uitSorgPad('/sorg/video/abc'), { soort: 'video', id: 'abc' })
  is('met n skuinsstreep aan die einde', uitSorgPad('/sorg/m123/'), { soort: 'plasing', id: 'm123' })
  is('die tuisblad gee niks', uitSorgPad('/'), null)
  is('n ander pad ook nie', uitSorgPad('/bid/xyz'), null)
  is('en /sorg op sy eie ook nie', uitSorgPad('/sorg'), null)

  /* 'n Rare id oorleef die rondreis. */
  const raar = 'a b/c'
  const u2 = sorgSkakel('plasing', raar)
  waar('n rare id word geskryf', !u2.includes(' '))
  is('en dit lees terug', uitSorgPad('/sorg/' + encodeURIComponent(raar)),
     { soort: 'plasing', id: raar })

  /* Die OU hash moet bly werk — daar loop skakels in mense se gesprekke rond. */
  is('n ou hash-skakel werk nog', leesSorgSkakel('#sorg-plasing-oud1'),
     { soort: 'plasing', id: 'oud1' })
}

console.log('\n── Die skakel land BY die plasing, nie op die tuisblad nie ──\n')
{
  /* Dit is die verskil tussen 'n mens wat die storie sien en 'n mens wat op 'n
     vreemde blad land en weggaan. */
  const u = sorgSkakel('plasing', 'abc123')
  waar('dit dra die plasing se id', u.includes('abc123'))
  is('en dit lees weer reg terug', uitSorgPad('/sorg/abc123'),
     { soort: 'plasing', id: 'abc123' })
}

console.log('\n── n Skakel wat niks beteken nie, gee niks ──\n')
{
  is('leeg', leesSorgSkakel(''), null)
  is('n ander hash', leesSorgSkakel('#iets-anders'), null)
  is('half', leesSorgSkakel('#sorg-plasing-'), null)
  is('n onbekende soort', leesSorgSkakel('#sorg-gedig-1'), null)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
