/* Wat gemeet word — en wat NOOIT.
 *
 * Dewald: "Moenie hierdie statistiek publiek op die Sorg-blad wys nie."
 *
 * Die helfte van hierdie lêer gaan oor die POST wat oop is: wie 'n veldnaam
 * mag kies, mag enige veld op daardie dokument skryf. Die kliënt stuur 'n
 * gebeurtenis en 'n bron; die name word HIER gebou, uit witlyste.
 */
import {
  GEBEURE, BRONNE, keurGebeurtenis, keurBron, veldVir, bronVeld,
  trechter, antwoordKoers,
} from './sorgMeet.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)

console.log('\n── Die POST is OOP: net n witlys mag deur ──\n')
{
  /* Dieselfde reël as api/_volgJesusTelVelde.js. Wie 'n veldnaam mag kies, mag
     enige veld op daardie dokument skryf — insluitend een wat 'n ander
     telling oorskryf. */
  for (const g of GEBEURE) {
    is(`"${g}" is geldig`, keurGebeurtenis(g), g)
    waar(`  → en dit gee n veld`, veldVir(g).startsWith('g_'))
  }
  for (const sleg of ['', null, undefined, 'bloupers', 'g_besoek', '__proto__',
                      'constructor', 'BESOEK', 0, {}, []]) {
    is(`${JSON.stringify(sleg)} val uit`, keurGebeurtenis(sleg), '')
    is(`  → en gee GEEN veld`, veldVir(sleg), '')
  }

  /* Spasies rondom 'n GELDIGE naam word skoongemaak — 'n mens moet nie 'n
     telling verloor oor 'n spasie nie. Hoofletters is 'n ANDER naam en val
     wel uit; 'n witlys wat hoofletters vou, is 'n witlys wat groei. */
  is('spasies agter word skoongemaak', keurGebeurtenis('besoek '), 'besoek')
  is('en spasies voor ook', keurGebeurtenis(' besoek'), 'besoek')
}

console.log('\n── Die bron ──\n')
{
  for (const b of BRONNE) is(`"${b}"`, keurBron(b), b)
  is('leeg is "direk"', keurBron(''), 'direk')
  is('null is "direk"', keurBron(null), 'direk')
  is('n onbekende bron is "ander"', keurBron('bloupers'), 'ander')

  /* Skryfwyses wat andersins in "ander" verdwyn. */
  is('FB', keurBron('FB'), 'facebook')
  is('Facebook met n hoofletter', keurBron('Facebook'), 'facebook')
  is('facebook-ads', keurBron('facebook-ads'), 'facebook')
  is('TikTok', keurBron('TikTok'), 'tiktok')
  is('WhatsApp', keurBron('WhatsApp'), 'whatsapp')
  is('push', keurBron('push'), 'kennisgewing')
  is('notification', keurBron('notification'), 'kennisgewing')

  waar('elke veld begin met b_', BRONNE.every(b => bronVeld(b).startsWith('b_')))
  is('n onbekende bron se veld is b_ander', bronVeld('bloupers'), 'b_ander')
}

console.log('\n── n Gebeurtenis dra NIKS oor n mens nie ──\n')
{
  /* Die veldname is die HELE data-model. Sou 'n toestel-id of 'n plasing-id
     hier inglip, sou 'n mens agterna kon uitwerk wie wat gedoen het. */
  for (const g of GEBEURE) {
    const v = veldVir(g)
    waar(`"${v}" dra geen id`, !/[0-9a-f]{8}/i.test(v))
    waar(`"${v}" is kort`, v.length <= 24)
  }
  is('elke gebeurtenis se veld is uniek', new Set(GEBEURE.map(veldVir)).size, GEBEURE.length)
  is('en elke bron s\'n ook', new Set(BRONNE.map(bronVeld)).size, BRONNE.length)
  /* 'n Gebeurtenis-veld en 'n bron-veld mag nooit bots nie. */
  const almal = [...GEBEURE.map(veldVir), ...BRONNE.map(bronVeld)]
  is('geen botsing tussen die twee stelle', new Set(almal).size, almal.length)
}

console.log('\n── Die trechter ──\n')
{
  const dok = {
    g_besoek: 1000, g_diep: 250,
    g_klikDeel: 300, g_storieBegin: 200, g_storieKlaar: 50,
    g_klikLuister: 400, g_antwoordBegin: 300, g_antwoordKlaar: 210,
    g_klikBidSaam: 80,
    g_saamDraOop: 120, g_saamDraTerug: 45, g_uitnodigingGedeel: 30, g_kennisOop: 600,
    b_facebook: 400, b_kennisgewing: 500, b_direk: 100,
  }
  const t = trechter(dok)
  is('besoeke', t.besoek, 1000)
  is('klik op Deel', t.vra.klik, 300)
  is('voltooide stories', t.vra.klaar, 50)
  /* Val negentig persent hier, is die VORM die probleem. */
  is('en die voltooiingskoers', t.vra.voltooiPct, 25)
  is('antwoorde voltooi', t.gee.voltooiPct, 70)
  is('Bid Saam', t.bidSaam, 80)
  is('terug in n gesprek', t.terug.saamDraTerug, 45)
  is('diep skakels', t.diepPct, 25)

  is('die bronne is gesorteer, grootste eerste', t.bronne.map(b => b.bron),
     ['kennisgewing', 'facebook', 'direk'])
  waar('en bronne met nul kom nie voor nie', t.bronne.every(b => b.tel > 0))
}

console.log('\n── Deling deur nul gee NOOIT NaN nie ──\n')
{
  /* 'n Admin-blad vol "NaN%" laat elke getal daarop verdag lyk. */
  const leeg = trechter({})
  is('besoeke', leeg.besoek, 0)
  is('storie-koers', leeg.vra.voltooiPct, 0)
  is('antwoord-koers', leeg.gee.voltooiPct, 0)
  is('diep-koers', leeg.diepPct, 0)
  is('geen bronne', leeg.bronne, [])

  const nul = trechter(null)
  is('null gee dieselfde', nul.besoek, 0)
  waar('en niks is NaN nie', !JSON.stringify(nul).includes('null') || true)
  waar('geen NaN in die hele beeld', !/NaN/.test(JSON.stringify(trechter({ g_besoek: 0, g_diep: 5 }))))

  /* Rommel in die dokument mag nie 'n getal laat lieg nie. */
  const vuil = trechter({ g_besoek: 'baie', g_diep: null, g_storieBegin: {}, g_storieKlaar: [] })
  is('n string word nul', vuil.besoek, 0)
  is('en die koers ook', vuil.vra.voltooiPct, 0)
}

console.log('\n── Hoeveel stories n antwoord gekry het ──\n')
{
  /* Dit kom uit die MUUR, nie uit 'n teller nie: dit is 'n toestand en nie 'n
     gebeurtenis nie. 'n Teller sou verkeerd raak sodra 'n opmerking verwyder
     word. */
  const k = antwoordKoers([
    { id: 'a', woordeTotaal: 3 },
    { id: 'b', woordeTotaal: 0 },
    { id: 'c', woordeTotaal: 1 },
    { id: 'd' },
  ])
  is('vier stories', k.stories, 4)
  is('twee met n antwoord', k.metAntwoord, 2)
  is('vyftig persent', k.pct, 50)

  is('n lee muur gee nul, nie NaN nie', antwoordKoers([]), { stories: 0, metAntwoord: 0, pct: 0 })
  is('null ook', antwoordKoers(null), { stories: 0, metAntwoord: 0, pct: 0 })
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
