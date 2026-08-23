/* Die terugkeerkring — en die reëls wat keer dat dit 'n plaag word.
 *
 * Ses duisend fone hang aan hierdie app se kennisgewings, en dit is al twee
 * keer stil gebreek. Die ding wat hier die duurste kan skeefloop, is nie 'n
 * gemiste kennisgewing nie — dit is VYF trillings vir een gesprek. Dit is hoe
 * 'n mens leer om die app se kennisgewings af te skakel, en dan is hy vir
 * altyd weg.
 */
import {
  SOORTE, keurSoort, sleutel, magStuur, pad, boodskap,
  kiesVirLuisteraars, WAG_UUR,
} from './sorgKennis.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)

const NOU = Date.parse('2026-08-23T12:00:00Z')
const uurTerug = n => NOU - n * 3600000

console.log('\n── Die soorte ──\n')
{
  for (const k of Object.keys(SOORTE)) {
    is(`"${k}" is geldig`, keurSoort(k), k)
    waar(`  → en dit het n titel`, SOORTE[k].titel.length > 5)
  }
  for (const sleg of ['', null, undefined, 'bloupers', '__proto__', 'constructor', 'toString']) {
    is(`${JSON.stringify(sleg)} val uit`, keurSoort(sleg), '')
  }
}

console.log('\n── EEN keer per gebeurtenis ──\n')
{
  const g = { soort: 'antwoord', wie: 'w1', deur: 'w2', waaroor: 'm1' }
  const eerste = magStuur(g, { gestuur: {}, nou: NOU })
  is('die eerste gaan deur', eerste.stuur, true)

  /* DIE toets. Vyf antwoorde binne 'n uur is EEN kennisgewing. */
  const gestuur = { [eerste.sleutel]: NOU }
  is('n tweede binne die uur nie', magStuur(g, { gestuur, nou: NOU + 60000 }).stuur, false)
  waar('en dit sê hoekom', /te gou/.test(magStuur(g, { gestuur, nou: NOU + 60000 }).rede))
  is('drie uur later ook nie', magStuur(g, { gestuur, nou: NOU + 3 * 3600000 }).stuur, false)
  /* Ná die afkoeltyd wel — die gesprek het intussen aangegaan. */
  is('sewe uur later wel', magStuur(g, { gestuur, nou: NOU + 7 * 3600000 }).stuur, true)

  /* 'n ANDER gesprek is 'n ander gebeurtenis. */
  const ander = { ...g, waaroor: 'm2' }
  is('n ander gesprek gaan deur', magStuur(ander, { gestuur, nou: NOU + 60000 }).stuur, true)
  /* En 'n ander mens ook. */
  is('n ander mens ook', magStuur({ ...g, wie: 'w9' }, { gestuur, nou: NOU + 60000 }).stuur, true)
}

console.log('\n── Dewald se antwoord kom ALTYD deur ──\n')
{
  /* Dit is 'n aparte soort, met opset: dit moet deurkom ook al het iemand 'n
     uur gelede 'n gewone antwoord gekry. */
  const gewoon = { soort: 'antwoord', wie: 'w1', deur: 'w2', waaroor: 'm1' }
  const s = magStuur(gewoon, { gestuur: {}, nou: NOU }).sleutel
  const d = { soort: 'dewald', wie: 'w1', deur: 'dewald', waaroor: 'm1' }
  is('ook direk ná n gewone antwoord', magStuur(d, { gestuur: { [s]: NOU }, nou: NOU + 60000 }).stuur, true)

  /* Maar Dewald se eie een kom nie TWEE keer nie. */
  const ds = magStuur(d, { gestuur: {}, nou: NOU }).sleutel
  is('en dit kom nie twee keer nie', magStuur(d, { gestuur: { [ds]: NOU }, nou: NOU + 999 * 3600000 }).stuur, false)
  waar('  → want die afkoeltyd is nul, dus NOOIT weer',
       /reeds gestuur/.test(magStuur(d, { gestuur: { [ds]: NOU }, nou: NOU + 999 * 3600000 }).rede))
}

console.log('\n── NOOIT vir jou eie doen nie ──\n')
{
  /* Jy antwoord op jou eie storie en die foon trill in jou hand. Dit lyk
     stukkend, en dit is die soort ding wat niemand rapporteer nie. */
  const eie = { soort: 'antwoord', wie: 'w1', deur: 'w1', waaroor: 'm1' }
  is('dit gaan nie uit nie', magStuur(eie, { gestuur: {}, nou: NOU }).stuur, false)
  waar('en dit sê hoekom', /eie doen/.test(magStuur(eie, { gestuur: {}, nou: NOU }).rede))
}

console.log('\n── Wie kennisgewings AF het, kry niks ──\n')
{
  const g = { soort: 'antwoord', wie: 'w1', deur: 'w2', waaroor: 'm1' }
  is('af beteken af', magStuur(g, { gestuur: {}, nou: NOU, aan: false }).stuur, false)
  waar('en dit sê hoekom', /af/.test(magStuur(g, { gestuur: {}, nou: NOU, aan: false }).rede))
}

console.log('\n── Niks om aan te stuur nie ──\n')
{
  is('geen ontvanger', magStuur({ soort: 'antwoord', deur: 'w2' }, {}).stuur, false)
  is('onbekende soort', magStuur({ soort: 'bloupers', wie: 'w1' }, {}).stuur, false)
  is('niks', magStuur(null, {}).stuur, false)
  is('n lee voorwerp', magStuur({}, {}).stuur, false)
  /* Elke weier dra 'n REDE. 'n Stelsel wat stil niks doen nie, is een wat 'n
     mens nooit kan regmaak nie. */
  for (const g of [null, {}, { soort: 'antwoord' }, { soort: 'x', wie: 'w' }]) {
    waar(`${JSON.stringify(g)} dra n rede`, magStuur(g, {}).rede.length > 0)
  }
}

console.log('\n── Elke kennisgewing maak die REGTE gesprek oop ──\n')
{
  is('n antwoord', pad({ soort: 'antwoord', waaroor: 'm123' }), '/sorg/m123?k=1')
  is('Dewald s\'n', pad({ soort: 'dewald', waaroor: 'm123' }), '/sorg/m123?k=1')
  is('n luisteraar sonder n storie gaan na WAG', pad({ soort: 'luisteraar' }), '/sorg/wag?k=1')
  is('n luisteraar MET n storie gaan daarheen', pad({ soort: 'luisteraar', waaroor: 'm9' }), '/sorg/m9?k=1')
  is('sonder enigiets: die blad', pad({ soort: 'antwoord' }), '/sorg?k=1')

  /* NOOIT die tuisblad nie — 'n kennisgewing wat op / land, is een wat 'n mens
     leer om te ignoreer. */
  for (const s of Object.keys(SOORTE)) {
    waar(`"${s}" land nie op /`, pad({ soort: s, waaroor: 'm1' }).startsWith('/sorg'))
  }
  /* En elke een dra ?k=1, sodat die groei-oorsig weet waar dit vandaan kom. */
  waar('elkeen dra ?k=1', Object.keys(SOORTE).every(s => pad({ soort: s, waaroor: 'm1' }).includes('k=1')))

  const raar = 'a b/c'
  waar('n rare id word ontsnap', !pad({ soort: 'antwoord', waaroor: raar }).includes(' '))
}

console.log('\n── Die boodskap dra NIKS van die storie nie ──\n')
{
  /* 'n Kennisgewing verskyn op 'n TOE skerm, waar enigiemand dit kan sien —
     'n man se vrou, 'n kind se ouer. Die inhoud van iemand se storie hoort
     nie daar nie. */
  for (const s of Object.keys(SOORTE)) {
    const b = boodskap({ soort: s, waaroor: 'm1', teks: 'Ek dink aan selfmoord', naam: 'Maria' })
    const rou = JSON.stringify(b)
    is(`"${s}" verklap geen teks`, rou.includes('selfmoord'), false)
    is(`"${s}" verklap geen naam`, rou.includes('Maria'), false)
    waar(`"${s}" het n titel`, b.titel.length > 5)
    waar(`"${s}" het n pad`, b.pad.startsWith('/sorg'))
  }
  is('n onbekende soort gee niks', boodskap({ soort: 'bloupers' }), null)
  is('niks gee niks', boodskap(null), null)
}

console.log('\n── Die luisteraars word NIE gespam nie ──\n')
{
  const plasings = [
    { id: 'oud',  geskep: new Date(uurTerug(30)).toISOString(), woordeTotaal: 0 },
    { id: 'wag',  geskep: new Date(uurTerug(8)).toISOString(),  woordeTotaal: 0 },
    { id: 'vars', geskep: new Date(uurTerug(1)).toISOString(),  woordeTotaal: 0 },
    { id: 'klaar', geskep: new Date(uurTerug(20)).toISOString(), woordeTotaal: 3 },
  ]
  const k = kiesVirLuisteraars(plasings, { nou: NOU })
  /* EEN storie, nie 'n lys nie — sodat die kennisgewing "iemand wag" kan sê en
     waar wees. En die OUDSTE, want dit is die mens wat die langste gewag het. */
  is('die oudste wat nog wag', k.id, 'oud')

  /* 'n Betekenisvolle antwoord stop dit. */
  const sonderOud = plasings.filter(p => p.id !== 'oud')
  is('n beantwoorde storie tel nie', kiesVirLuisteraars(sonderOud, { nou: NOU }).id, 'wag')

  /* Te vars: die gemeenskap moet eers self die kans kry. */
  const netVars = [{ id: 'vars', geskep: new Date(uurTerug(1)).toISOString(), woordeTotaal: 0 }]
  is(`onder ${WAG_UUR} uur: niemand word geroep nie`, kiesVirLuisteraars(netVars, { nou: NOU }), null)

  /* Almal beantwoord: niks om te stuur nie. */
  is('alles beantwoord gee niks',
     kiesVirLuisteraars([{ id: 'a', geskep: new Date(uurTerug(30)).toISOString(), woordeTotaal: 1 }],
                        { nou: NOU }), null)
  is('n lee muur gee niks', kiesVirLuisteraars([], { nou: NOU }), null)
  is('null gee niks', kiesVirLuisteraars(null, { nou: NOU }), null)

  /* 'n Rekord sonder 'n datum mag nie 'n Invalid Date deur die vergelyking
     stuur nie. */
  is('geen datum, geen keuse',
     kiesVirLuisteraars([{ id: 'x', woordeTotaal: 0 }], { nou: NOU }), null)
  /* Die ou `woorde`-vorm tel ook. */
  is('die ou vorm tel ook',
     kiesVirLuisteraars([{ id: 'x', geskep: new Date(uurTerug(30)).toISOString(), woorde: [{ id: 'a' }] }],
                        { nou: NOU }), null)
}

console.log('\n── Die sleutel ──\n')
{
  is('dieselfde ding gee dieselfde sleutel',
     sleutel('antwoord', 'w1', 'm1'), sleutel('antwoord', 'w1', 'm1'))
  waar('n ander soort verskil', sleutel('antwoord', 'w1', 'm1') !== sleutel('dewald', 'w1', 'm1'))
  waar('n ander mens verskil', sleutel('antwoord', 'w1', 'm1') !== sleutel('antwoord', 'w2', 'm1'))
  waar('n ander gesprek verskil', sleutel('antwoord', 'w1', 'm1') !== sleutel('antwoord', 'w1', 'm2'))
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
