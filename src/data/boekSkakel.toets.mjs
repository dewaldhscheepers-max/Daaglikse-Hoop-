/* Die gedeelde boek-skakel: /boek/<boek-id>
 *
 * Dewald, 1 Oktober 2026: "daar is geen deel knoppie op enige eboek. En dis
 * juis hoe die app groei."
 *
 *   node src/data/boekSkakel.toets.mjs
 */
import { BASIS, geldigeId, boekSkakel, idUitPad, deelBoodskap } from './boekSkakel.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}
const waar = (n, k) => is(n, !!k, true)

console.log('\n── Die skakel dra die BOEK ──')
{
  is('n vaste boek', boekSkakel('toksies'), 'https://dewaldscheepers.com/boek/toksies')
  /* n Opgelaaide boek dra n tydstempel in sy id. */
  is('n opgelaaide boek', boekSkakel('skinderstories-1758500000000'),
     'https://dewaldscheepers.com/boek/skinderstories-1758500000000')
  is('die basis kan verander', boekSkakel('toksies', 'https://toets.co.za'),
     'https://toets.co.za/boek/toksies')
  is('n skuinsstreep aan die einde van die basis val weg',
     boekSkakel('toksies', 'https://toets.co.za/'), 'https://toets.co.za/boek/toksies')
}

console.log('\n── En die pad gee hom terug ──')
{
  /* Die rondreis is die enigste ding wat werklik tel: wat gedeel word, moet
     land. Val dit, deel die knoppie n doodloopstraat. */
  for (const id of ['toksies', 'bid-nou', 'skinderstories-1758500000000', 'as-alles-wegval']) {
    is(`rondreis: ${id}`, idUitPad(new URL(boekSkakel(id)).pathname), id)
  }
  is('met n skuinsstreep aan die einde', idUitPad('/boek/toksies/'), 'toksies')
  is('hoofletters in die PAD tel nie', idUitPad('/BOEK/toksies'), 'toksies')
  /* Maar die ID self bly presies soos hy is — Firestore se dokumentname is
     hooflettergevoelig. */
  is('die id se eie kas bly', idUitPad('/boek/Bid-Nou'), 'Bid-Nou')
}

console.log('\n── Enigiets anders gee NIKS ──')
{
  /* Dan gaan die app eenvoudig sy gewone gang. */
  is('die tuisblad', idUitPad('/'), null)
  is('n ander pad', idUitPad('/hoop/abc'), null)
  is('n leë id', idUitPad('/boek/'), null)
  is('twee vlakke diep', idUitPad('/boek/a/b'), null)
  is('niks', idUitPad(), null)
  is('null', idUitPad(null), null)
  /* `idUitPad` kry `window.location.pathname`, en n pathname dra NOOIT n
     soekstring nie — die vraagteken leef in `location.search`. Kry dit tog een
     (iemand gee die volle URL), gee dit null eerder as om te raai. Dieselfde
     vorm as hoopSkakel.js s'n. */
  is('n pad met n soekstring is nie n pathname nie', idUitPad('/boek/toksies?x=1'), null)
  is('en n fragment ook nie', idUitPad('/boek/toksies#x'), null)
}

console.log('\n── Gemors word geweier ──')
{
  is('n lee id', geldigeId(''), false)
  is('net spasies', geldigeId('   '), false)
  is('n skuinsstreep', geldigeId('a/b'), false)
  is('beheerkarakters', geldigeId('a\u0007b'), false)
  is('iets absurd lank', geldigeId('a'.repeat(200)), false)
  is('niks', geldigeId(), false)
  /* En n gewone id kom deur — anders is die hek nutteloos. */
  is('n gewone id', geldigeId('toksies'), true)
  is('een met syfers', geldigeId('skinderstories-1758500000000'), true)
  is('n skakel van gemors gee null', boekSkakel('a/b'), null)
}

console.log('\n── Die woorde ──')
{
  const s = boekSkakel('toksies')
  const b = deelBoodskap('TOKSIES', s)
  /* Dit is NIE "laai hierdie app af" nie — n mens stuur n BOEK aan n vriendin. */
  is('dit noem die app nie', /daaglikse hoop|laai.*af/i.test(b.split('\n')[0]), false)
  waar('die titel staan daar', b.includes('TOKSIES'))
  waar('en die skakel', b.includes(s))
  /* "gratis" is die woord wat die ontvanger laat kliek. */
  waar('dit se dat dit gratis is', /gratis/i.test(b))

  /* Sonder n titel bly dit n hele sin, nooit n gat. */
  const sonder = deelBoodskap('', s)
  waar('sonder n titel werk dit ook', sonder.length > 20 && !sonder.includes('""'))
  waar('en die skakel is steeds daar', sonder.includes(s))
  /* Sonder n skakel gee dit die sin alleen — nooit "undefined". */
  waar('sonder n skakel', !/undefined|null/.test(deelBoodskap('TOKSIES', '')))
}

console.log('\n── Die basis ──')
is('die app se eie domein', BASIS, 'https://dewaldscheepers.com')

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
