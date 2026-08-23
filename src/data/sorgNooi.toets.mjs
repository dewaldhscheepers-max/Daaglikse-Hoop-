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
import { sorgSkakel, leesSorgSkakel, uitSorgPad, nooiWoorde, algemeneWoorde,
         magBuiteDeel, WORTEL_UITNODIGING, DEEL_WORTEL } from './sorgDeel.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)

console.log('\n── Dewald se eie woorde ──\n')
{
  /* Hy het die vorige weergawe gelees: "dit klink fokken dom."

     Wat sy weergawe reg doen: dit praat met die MENS wat dit kry, nie oor die
     blad nie. "Ek het gedink jy het dalk iets" is 'n rede om te kom; "daar is
     mense wat wag" is 'n advertensie. */
  const SKAKEL = 'https://dewaldscheepers.com/sorg/m123'
  const w = nooiWoorde(SKAKEL)

  waar('dit begin met "Ek het hierdie storie"', /^Ek het hierdie storie/.test(w))
  waar('dit noem Dra Mekaar', /Daaglikse Hoop se Dra Mekaar/.test(w))
  waar('dit sê hy het dalk iets om te gee',
       /gedink jy het dalk iets wat hierdie persoon kan bemoedig/.test(w))
  waar('en dit nooi hom om te lees en woorde te deel',
       /lees hulle storie en deel .{0,3}n paar woorde van hoop/.test(w))

  /* DIE fout wat Dewald gesien het: die adres het TWEE keer verskyn. Dit kom
     daarvan dat ons `{ text, url }` aan navigator.share gegee het terwyl die
     adres al in die teks was — WhatsApp plak dan albei aan mekaar. */
  is('die skakel staan presies EEN keer', (w.match(/https:\/\//g) || []).length, 1)
  waar('en dit staan heel onder', w.trim().endsWith(SKAKEL))

  /* Dit verklap NIKS. Wie dit kry, moet dit oopmaak om te sien waaroor dit
     gaan — en dan is hy op die blad. */
  waar('geen naam', !/Maria|Johan|Elna|Anoniem/.test(w))
  waar('geen aanhaling uit die storie', !/[\u201c\u201d"]/.test(w))
  waar('geen onderwerp', !/huwelik|selfmoord|kind|geld|rou/i.test(w))

  /* DIE reël. Sodra hierdie woorde "laai die app af" word, is dit 'n
     advertensie en hou mense op om dit te stuur. */
  waar('dit vra NIE dat iemand die app aflaai nie', !/laai.*af|installeer|download/i.test(w))
  waar('en dit bedel nie', !/asseblief deel|deel asseblief|help my groei/i.test(w))
}

console.log('\n── Dit stuur soos Bid Nou stuur ──\n')
{
  /* Bid Nou sit die adres IN die teks en gee nooit `url` saam nie. Dit is
     presies waarom syne nie dubbel wys nie. Ons vorm moet dieselfde wees:
     reëls, met die skakel op sy eie onderaan. */
  const w = nooiWoorde('https://x/y')
  waar('dit is n paar reëls, nie een lang sin nie', w.includes('\n'))
  const reels = w.split('\n')
  is('die laaste reël is die skakel', reels[reels.length - 1], 'https://x/y')
  is('en daar is n leë reël voor hom', reels[reels.length - 2], '')

  /* Sonder 'n skakel breek dit nie — dit lyk net leeg onderaan. */
  waar('geen skakel breek nie', typeof nooiWoorde() === 'string')
  waar('en geen "undefined"', !/undefined|null/.test(nooiWoorde()))
}

console.log('\n── Die skakel lyk soos Bid Nou s\'n: n PAD, nie n hash nie ──\n')
{
  /* Dewald: "dit moet soos bid nou se deel links werk." Bid Nou deel
     https://dewaldscheepers.com/bid/<id>. 'n Hash oorleef nie altyd 'n plak
     nie, en WhatsApp wys niks van hom nie. */
  const u = sorgSkakel('plasing', 'm123')
  waar('die plasing se skakel', u.startsWith(`${DEEL_WORTEL}/sorg/m123`))
  waar('die video s\'n', sorgSkakel('video', 'abc').startsWith(`${DEEL_WORTEL}/sorg/video/abc`))
  waar('geen hash meer nie', !u.includes('#'))

  /* Elke gedeelde skakel dra 'n VELDTOG. Sonder dit lyk elke mens wat deur 'n
     uitnodiging kom soos "direk", en dan lyk dit of deel niemand bring nie. */
  waar('dit dra n veldtog', /utm_source=uitnodiging/.test(u))
  is('sonder die veldtog, as ons dit vra', sorgSkakel('plasing', 'm123', { veldtog: false }),
     `${DEEL_WORTEL}/sorg/m123`)

  /* En die veldtog mag NIE keer dat die pad gelees word nie — anders land die
     mens wat die skakel kry, op die tuisblad. */
  is('n pad MET n veldtog lees steeds reg', uitSorgPad('/sorg/m123?utm_source=uitnodiging'),
     { soort: 'plasing', id: 'm123' })
  is('en met n hash ook', uitSorgPad('/sorg/m123?a=b#c'), { soort: 'plasing', id: 'm123' })
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
  const u2 = sorgSkakel('plasing', raar, { veldtog: false })
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

console.log('\n── Die ALGEMENE uitnodiging verklap NIKS ──\n')
{
  /* Dewald: "Die algemene uitnodiging mag nie die skrywer se naam wys nie.
     Mag nie hul storie of sensitiewe besonderhede wys nie."

     Dit is die een wat 'n mens op Facebook kan plak. Sou 'n naam of 'n sin uit
     iemand se storie hier inglip, sit ons iemand se seer in 'n openbare
     tydlyn — en dan is die hele blad se belofte weg. */
  const w = algemeneWoorde()
  waar('dit noem geen mens nie', !/Maria|Johan|Elna|Anoniem/.test(w))
  waar('dit dra geen aanhaling nie', !/[""\u201c\u201d]/.test(w))
  waar('dit noem geen onderwerp nie', !/huwelik|selfmoord|kind|geld|rou/i.test(w))
  waar('dit is kort genoeg vir WhatsApp', w.length <= 320)
  /* Dit is NIE meer een paragraaf nie — Bid Nou se boodskap het ook reels, en
     die skakel staan op sy eie onderaan sodat WhatsApp hom herken. */
  waar('die skakel staan op sy eie reel', /\n\nhttps:/.test(w))

  /* Dit lei DIREK na "Wag nog vir iemand", nooit na die tuisblad nie. */
  waar('dit dra die skakel', w.includes(WORTEL_UITNODIGING))
  waar('en die skakel gaan na /sorg/wag', WORTEL_UITNODIGING.includes('/sorg/wag'))
  waar('nie na die tuisblad nie', !/dewaldscheepers\.com\/?$/.test(WORTEL_UITNODIGING))
  waar('en dit dra n veldtog', /utm_source=uitnodiging/.test(WORTEL_UITNODIGING))

  /* En dit is nie 'n advertensie nie — dieselfde reël as nooiWoorde. */
  waar('dit vra NIE dat iemand die app aflaai nie', !/laai.*af|installeer|download/i.test(w))
  waar('en dit bedel nie', !/asseblief deel|help my groei|donasie/i.test(w))
}

console.log('\n── Buite Sorg deel is STANDAARD AF ──\n')
{
  /* "Plaas my storie op die muur" en "sit my storie op Facebook" is vir die
     mens wat dit geskryf het, twee heeltemal verskillende dinge. */
  is('geen veld: af', magBuiteDeel({ id: 'm1' }), false)
  is('n ou plasing: af', magBuiteDeel({ id: 'm1', toestemmings: { openbaar: true } }), false)
  is('uitdruklik af', magBuiteDeel({ deelBuite: false }), false)
  /* 'n String is nie 'n ja nie — presies die soort ding wat 'n ou rekord dra. */
  is('die string "true" tel NIE', magBuiteDeel({ deelBuite: 'true' }), false)
  is('die getal 1 ook nie', magBuiteDeel({ deelBuite: 1 }), false)
  is('null breek nie', magBuiteDeel(null), false)
  is('net n egte ja', magBuiteDeel({ deelBuite: true }), true)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
