/* Skakels wat op die REGTE skerm land, en die veldtog wat saamkom.
 *
 * Dewald: "Moenie die gebruiker eers na die algemene app-tuisblad stuur nie."
 *
 * Dit is presies die fout wat installasie in hierdie projek maande lank
 * stukkend gehou het — elke skakel het op / geland, waar daar niks van die
 * ding is waarvoor die mens gekom het nie.
 */
import {
  WORTEL, SKERMS, skakel, uitPad, leesUtm, utmSnaar,
  saamvoegVeldtog, wysInstalleer,
} from './sorgSkakels.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)

console.log('\n── Elke skerm het n eie skakel ──\n')
{
  is('die blad',   skakel('sorg'),   WORTEL + '/sorg')
  is('deel',       skakel('deel'),   WORTEL + '/sorg/deel')
  is('wag',        skakel('wag'),    WORTEL + '/sorg/wag')
  is('saam dra',   skakel('saam'),   WORTEL + '/sorg/saam')
  is('videos',     skakel('videos'), WORTEL + '/sorg/videos')
  is('n gesprek',  skakel('gesprek', { id: 'm123' }), WORTEL + '/sorg/m123')
  is('n video',    skakel('video', { id: 'abc' }), WORTEL + '/sorg/video/abc')

  /* NOOIT die tuisblad nie. */
  for (const s of ['sorg', 'deel', 'wag', 'saam', 'videos']) {
    waar(`"${s}" gaan nie na /`, skakel(s) !== WORTEL + '/')
    waar(`"${s}" dra geen hash`, !skakel(s).includes('#'))
  }
  is('n onbekende sleutel val terug op die blad', skakel('bloupers'), WORTEL + '/sorg')
  is('n gesprek sonder n id ook', skakel('gesprek', { id: '' }), WORTEL + '/sorg')
  is('n video sonder n id gaan na die lys', skakel('video', {}), WORTEL + '/sorg/videos')
}

console.log('\n── En elkeen lees terug ──\n')
{
  for (const s of SKERMS) {
    is(`${s.pad} lees terug`, uitPad(s.pad), { skerm: s.sleutel, id: '' })
  }
  is('n gesprek', uitPad('/sorg/m123'), { skerm: 'gesprek', id: 'm123' })
  is('n video', uitPad('/sorg/video/abc'), { skerm: 'video', id: 'abc' })
  is('die video-lys', uitPad('/sorg/video'), { skerm: 'videos', id: '' })

  is('met n skuinsstreep aan die einde', uitPad('/sorg/wag/'), { skerm: 'wag', id: '' })
  is('met n navraagstring', uitPad('/sorg/wag?utm_source=facebook'), { skerm: 'wag', id: '' })
  is('met n hash', uitPad('/sorg/saam#iets'), { skerm: 'saam', id: '' })
  is('met albei', uitPad('/sorg/m1?a=b#c'), { skerm: 'gesprek', id: 'm1' })
}

console.log('\n── n Gereserveerde woord is NIE n gesprek nie ──\n')
{
  /* Sonder die lys sou /sorg/wag as 'n gesprek met die id "wag" gelees word,
     en dan land 'n mens op 'n leë skerm met geen idee hoekom nie. */
  for (const w of ['deel', 'wag', 'saam', 'videos']) {
    is(`"${w}" is n skerm, nie n id nie`, uitPad('/sorg/' + w).skerm, w)
    is(`  → en dra geen id`, uitPad('/sorg/' + w).id, '')
  }
  is('/sorg/sorg is niks', uitPad('/sorg/sorg'), null)
}

console.log('\n── n Pad wat niks beteken nie, gee niks ──\n')
{
  is('die tuisblad', uitPad('/'), null)
  is('leeg', uitPad(''), null)
  is('null', uitPad(null), null)
  is('n ander blad', uitPad('/bid/xyz'), null)
  is('n blad wat so BEGIN maar nie is nie', uitPad('/sorgeloos'), null)
  is('n Bybel-pad', uitPad('/bybel/joh/3'), null)
}

console.log('\n── n Rare id oorleef die rondreis ──\n')
{
  const raar = 'a b/c?d'
  const u = skakel('gesprek', { id: raar })
  waar('dit word geskryf sonder spasies', !u.includes(' '))
  is('en dit lees terug', uitPad('/sorg/' + encodeURIComponent(raar)), { skerm: 'gesprek', id: raar })
}

console.log('\n── UTM word gehou — maar net wat n VELDTOG is ──\n')
{
  const u = leesUtm('?utm_source=facebook&utm_medium=paid&utm_campaign=volg-jesus&utm_content=video1')
  is('bron', u.bron, 'facebook')
  is('medium', u.medium, 'paid')
  is('veldtog', u.veldtog, 'volg-jesus')
  is('inhoud', u.inhoud, 'video1')

  /* Facebook en TikTok plak 'n klik-id aan wat 'n MENS identifiseer. Dit word
     NIE gehou nie, en dit is met opset. */
  const met = leesUtm('?utm_source=tiktok&fbclid=ABC123&ttclid=XYZ&gclid=Q')
  is('geen fbclid', met.fbclid, undefined)
  waar('en dit is nêrens in die voorwerp nie', !JSON.stringify(met).includes('ABC123'))
  is('maar die bron kom deur', met.bron, 'tiktok')

  /* Die oggendkennisgewing dra nie UTM nie — hy dra ?k=1. Dit is die grootste
     enkele bron in hierdie app en dit mag nie as "direk" tel nie. */
  is('die kennisgewing tel as n bron', leesUtm('?k=1').bron, 'kennisgewing')
  is('maar n eie bron wen', leesUtm('?k=1&utm_source=whatsapp').bron, 'whatsapp')

  is('niks gee null', leesUtm(''), null)
  is('null gee null', leesUtm(null), null)
  is('n string sonder utm gee null', leesUtm('?a=b&c=d'), null)
  is('sonder die vraagteken werk ook', leesUtm('utm_source=whatsapp').bron, 'whatsapp')
}

console.log('\n── Rommel in n UTM kom nie deur nie ──\n')
{
  const vuil = leesUtm('?utm_source=<script>alert(1)</script>&utm_campaign=' + 'x'.repeat(200))
  waar('geen hakies', !/[<>]/.test(vuil.bron || ''))
  waar('die veldtog word afgekap', (vuil.veldtog || '').length <= 40)
  is('n lee waarde val uit', leesUtm('?utm_source=&utm_medium=epos').bron, undefined)
}

console.log('\n── Die snaar heen en terug ──\n')
{
  const v = { bron: 'facebook', medium: 'organies', veldtog: 'sorg-aug' }
  const s = utmSnaar(v)
  waar('dit begin met n vraagteken', s.startsWith('?'))
  is('en dit lees terug', leesUtm(s), v)
  is('niks gee n lee string', utmSnaar(null), '')
  is('n lee voorwerp ook', utmSnaar({}), '')

  const u = skakel('wag', { veldtog: { bron: 'whatsapp' } })
  is('n skakel dra die veldtog', u, WORTEL + '/sorg/wag?utm_source=whatsapp')
  is('en die pad lees steeds reg', uitPad('/sorg/wag?utm_source=whatsapp').skerm, 'wag')
}

console.log('\n── Die EERSTE veldtog wen ──\n')
{
  /* 'n Mens kom van Facebook af, kom 'n week later direk terug. Sou die tweede
     besoek sy herkoms uitvee, sou dit lyk of Facebook niemand gebring het. */
  const eerste = saamvoegVeldtog(null, { bron: 'facebook' })
  is('die eerste word gestoor', eerste.bron, 'facebook')
  is('en dit is as die eerste gemerk', eerste.eerste, true)

  const later = saamvoegVeldtog(eerste, { bron: 'whatsapp' })
  is('die eerste bron BLY', later.bron, 'facebook')
  is('maar die laaste word onthou', later.laasteBron, 'whatsapp')

  is('geen nuwe veldtog verander niks', saamvoegVeldtog(eerste, null), eerste)
  is('en niks op niks gee niks', saamvoegVeldtog(null, null), null)
}

console.log('\n── Die installeerknoppie ──\n')
{
  is('reeds geinstalleer: geen knoppie', wysInstalleer({ geinstalleer: true, pad: '/sorg' }), false)
  is('nie geinstalleer: wel', wysInstalleer({ geinstalleer: false, pad: '/sorg' }), true)
  is('op wag ook', wysInstalleer({ geinstalleer: false, pad: '/sorg/wag' }), true)
  /* NIE op die vorm nie. Iemand wat sy swaarste ding tik, moet niks anders
     sien nie — dieselfde reël as die res van hierdie blad. */
  is('op die VORM nooit', wysInstalleer({ geinstalleer: false, pad: '/sorg/deel' }), false)
  is('sonder argumente breek dit nie', wysInstalleer(), true)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
