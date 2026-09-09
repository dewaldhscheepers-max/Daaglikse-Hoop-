/* Die hele Bybel in 365 dae — die reëls, en die EGTE plan.
 *
 * Twee helftes. Die eerste toets die reëls met 'n handjievol dae. Die tweede
 * loop die werklike `public/bybel365.json` deur en keur hom teen die GAB —
 * want 'n plan wat 'n hoofstuk noem wat nie bestaan nie, is 'n knoppie wat
 * niks doen nie, en dit is 'n fout wat hierdie kodebasis al gemaak het.
 *
 * Loop met:  node src/data/bybel365.toets.mjs
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import {
  sleutelVir, leesteVan, dagVan, dagKlaar, huidigeDag, allesKlaar,
  vordering, merk, merkDag, spoorNaam, SPORE, kaartStand, standUit,
} from './bybel365.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}
const waar = (n, k) => is(n, !!k, true)

/* 'n Klein plan met dieselfde vorm as die egte een. */
const PLAN = {
  totaalDae: 3,
  totaalHoofstukke: 7,
  dae: [
    { d: 1, l: [['GEN', 1, 'verhaal'], ['LEV', 1, 'wysheid'], ['MAT', 1, 'jesus']] },
    { d: 2, l: [['GEN', 2, 'verhaal'], ['LEV', 2, 'wysheid']] },
    { d: 3, l: [['GEN', 3, 'verhaal'], ['MAT', 2, 'jesus']] },
  ],
}
const ALLES = ['GEN 1', 'LEV 1', 'MAT 1', 'GEN 2', 'LEV 2', 'GEN 3', 'MAT 2']

console.log('\n── Die sleutel ──')
is('boek en hoofstuk', sleutelVir('GEN', 1), 'GEN 1')
is('spasies val weg',  sleutelVir('  GEN  ', 1), 'GEN 1')
is('n string-hoofstuk tel ook', sleutelVir('GEN', '12'), 'GEN 12')
is('gemors gooi nie', sleutelVir(null, null), ' 0')

console.log('\n── n Dag se leeste ──')
{
  const l = leesteVan(PLAN.dae[0])
  is('drie leeste', l.length, 3)
  is('met die GAB se kode', l[0].boek, 'GEN')
  is('en die sleutel klaar gemaak', l[0].sleutel, 'GEN 1')
  is('en die spoor', l.map(x => x.spoor), ['verhaal', 'wysheid', 'jesus'])
  is('n dag wat nie bestaan nie gee niks', leesteVan(null), [])
  is('en een sonder leeste ook', leesteVan({ d: 9 }), [])
}
is('dagVan kry die regte een', dagVan(PLAN, 2).d, 2)
is('en niks vir n dag wat nie bestaan nie', dagVan(PLAN, 99), null)

console.log('\n── Wanneer n dag KLAAR is ──')
is('niks gelees', dagKlaar(PLAN.dae[0], []), false)
is('twee van drie',  dagKlaar(PLAN.dae[0], ['GEN 1', 'LEV 1']), false)
is('al drie',        dagKlaar(PLAN.dae[0], ['GEN 1', 'LEV 1', 'MAT 1']), true)
is('n Set werk ook', dagKlaar(PLAN.dae[0], new Set(['GEN 1', 'LEV 1', 'MAT 1'])), true)
is('n leë dag is nooit klaar nie', dagKlaar({ d: 9, l: [] }, ALLES), false)

console.log('\n── Die huidige dag is die EERSTE onvoltooide ──')
/* Dit is die belangrikste reël hier. 'n Plan wat aan die kalender vasgemaak
   is, straf wie 'n naweek mis. */
is('niks gelees → dag 1', huidigeDag(PLAN, []), 1)
is('dag 1 klaar → dag 2', huidigeDag(PLAN, ['GEN 1', 'LEV 1', 'MAT 1']), 2)
is('halfpad deur dag 1 → steeds dag 1', huidigeDag(PLAN, ['GEN 1']), 1)
/* Wie dag 2 klaarmaak maar dag 1 oorslaan, gaan TERUG na dag 1. Die plan is
   die hele Bybel; 'n oorgeslaande dag is 'n gat, nie 'n keuse nie. */
is('dag 2 klaar maar dag 1 nie → dag 1', huidigeDag(PLAN, ['GEN 2', 'LEV 2']), 1)
is('alles klaar → die LAASTE dag, nooit 366', huidigeDag(PLAN, ALLES), 3)
is('n leë plan gee dag 1', huidigeDag({ dae: [] }, []), 1)
is('en niks gooi nie', huidigeDag(null, null), 1)

console.log('\n── Alles klaar ──')
is('nog nie', allesKlaar(PLAN, ['GEN 1']), false)
is('nou wel',  allesKlaar(PLAN, ALLES), true)
is('n leë plan is nooit klaar nie', allesKlaar({ dae: [] }, []), false)

console.log('\n── Die getalle op die skerm ──')
{
  const v = vordering(PLAN, ['GEN 1', 'LEV 1', 'MAT 1', 'GEN 2'])
  is('vier hoofstukke gelees', v.gelees, 4)
  is('uit sewe',               v.totaal, 7)
  is('en dit is 57%',          v.persent, 57)
  is('een hele dag klaar',     v.dae, 1)
  is('uit drie',               v.totaalDae, 3)
}
/* Die hek: 'n sleutel wat NIE in die plan staan nie, mag nooit tel nie —
   anders stoot 'n ou inskrywing die persentasie verby honderd. */
{
  const v = vordering(PLAN, [...ALLES, 'REV 22', 'GEN 99', 'gemors'])
  is('vreemde sleutels tel nie', v.gelees, 7)
  is('en die persentasie bly 100', v.persent, 100)
}
is('niks gelees is 0%', vordering(PLAN, []).persent, 0)
is('n leë plan gee 0%', vordering({ dae: [] }, ['GEN 1']).persent, 0)

console.log('\n── Merk, en ONMERK ──')
/* Wie per ongeluk tik, moet dit kan regmaak — anders lieg die telling vir
   altyd. */
is('merk een',        merk([], 'GEN 1'), ['GEN 1'])
is('twee keer merk tel een keer', merk(['GEN 1'], 'GEN 1'), ['GEN 1'])
is('onmerk haal dit weg', merk(['GEN 1', 'LEV 1'], 'GEN 1', false), ['LEV 1'])
is('n leë sleutel doen niks', merk(['GEN 1'], '', true), ['GEN 1'])
is('die hele dag in een druk', merkDag([], PLAN.dae[0]).sort(),
   ['GEN 1', 'LEV 1', 'MAT 1'])
is('en die hele dag terug', merkDag(ALLES, PLAN.dae[0], false).sort(),
   ['GEN 2', 'GEN 3', 'LEV 2', 'MAT 2'])
/* Suiwer: die invoer word nooit verander nie. */
{
  const voor = ['GEN 1']
  merk(voor, 'LEV 1')
  is('die oorspronklike lys bly heel', voor, ['GEN 1'])
}

console.log('\n── Die kaart op die e-boekblad ──')
/* Die REËL bly altyd dieselfde vorm; net die KNOPPIE praat oor waar 'n mens
   staan. Dieselfde woorde as VOLG JESUS se kaart, wat direk daarbo sit. */
{
  const nuut = kaartStand(null)
  is('n mens wat nog nooit oopgemaak het', [nuut.lyn, nuut.knop], ['Dag 1 van 365', 'BEGIN HIER'])
  is('en die kaart weet dit', [nuut.begin, nuut.klaar], [true, false])
  is('n stukkende opsomming lyk dieselfde', kaartStand('gemors').knop, 'BEGIN HIER')
  is('en een sonder n dag ook', kaartStand({ dae: 3 }).knop, 'BEGIN HIER')
}
{
  const besig = kaartStand({ dag: 47, dae: 46 })
  is('halfpad',        [besig.lyn, besig.knop], ['Dag 47 van 365', 'GAAN VOORT'])
  is('en nie klaar nie', [besig.begin, besig.klaar], [false, false])
}
{
  const klaar = kaartStand({ dag: 365, dae: 365 })
  is('die hele Bybel gelees', [klaar.lyn, klaar.knop], ['Al 365 dae klaar', 'LEES WEER'])
  is('en dit weet dit',       klaar.klaar, true)
}
/* Die kaart mag NOOIT 'n dag noem wat nie bestaan nie — 'n ou opsomming, 'n
   plan wat korter word, 'n handgeskrewe sleutel. */
is('dag 900 word by 365 gekeer', kaartStand({ dag: 900, dae: 2 }).lyn, 'Dag 365 van 365')
is('dag 0 begin by 1',           kaartStand({ dag: 0, dae: 0 }).lyn, 'Dag 1 van 365')
is('n negatiewe dag ook',        kaartStand({ dag: -5, dae: 0 }).knop, 'BEGIN HIER')
is('n dag met kommas word heel', kaartStand({ dag: 12.7, dae: 11 }).lyn, 'Dag 12 van 365')
is('meer dae as die plan is klaar', kaartStand({ dag: 300, dae: 999 }).knop, 'LEES WEER')
is('n korter plan tel korter',   kaartStand({ dag: 3, dae: 2 }, 5).lyn, 'Dag 3 van 5')

console.log('\n── Die spore ──')
is('drie spore', Object.keys(SPORE).length, 3)
is('die verhaal', spoorNaam('verhaal'), 'DIE VERHAAL')
is('n onbekende spoor val terug', spoorNaam('iets'), 'DIE VERHAAL')

/* ────────────────────────────────────────────────────────────
   Die EGTE plan, teen die EGTE Bybel.
   ──────────────────────────────────────────────────────────── */

const PAD = new URL('../../public/bybel365.json', import.meta.url)
console.log('\n── Die egte plan ──')
if (!existsSync(PAD)) {
  val++
  console.log('  VAL  public/bybel365.json bestaan nie — loop skrifte/bou-bybel365.mjs')
} else {
  const egte = JSON.parse(readFileSync(PAD, 'utf8'))
  is('365 dae', egte.dae.length, 365)
  is('en die teller stem', egte.totaalDae, 365)
  is('1 189 hoofstukke', egte.totaalHoofstukke, 1189)
  is('66 boeke', egte.boeke, 66)
  is('genommer 1 tot 365', [egte.dae[0].d, egte.dae[364].d], [1, 365])
  {
    const stukkend = egte.dae.filter((d, i) => d.d !== i + 1).map(d => d.d)
    is('geen dag uit volgorde nie', stukkend, [])
    is('geen leë dag nie', egte.dae.filter(d => !d.l || !d.l.length).length, 0)
  }

  const gab = new URL('../../public/gab/', import.meta.url)
  const kas = {}
  const leesBoek = k => {
    if (kas[k] !== undefined) return kas[k]
    const p = new URL(`${k}.json`, gab)
    kas[k] = existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null
    return kas[k]
  }

  console.log('\n── Elke verwysing maak n EGTE hoofstuk oop ──')
  const stukkend = []
  const dekking = new Set()
  let leeste = 0
  for (const d of egte.dae) {
    for (const l of leesteVan(d)) {
      leeste++
      const b = leesBoek(l.boek)
      if (!b) { stukkend.push(`dag ${d.d}: geen ${l.boek}.json`); continue }
      if (!b.hoofstukke[l.hoofstuk - 1]) {
        stukkend.push(`dag ${d.d}: ${l.boek} ${l.hoofstuk} bestaan nie (${b.hoofstukke.length} hoofstukke)`)
        continue
      }
      dekking.add(l.sleutel)
    }
  }
  is(`al ${leeste} verwysings bestaan`, stukkend.slice(0, 10), [])

  console.log('\n── Die HELE Bybel, nie amper nie ──')
  {
    const boeke = readdirSync(new URL('.', gab))
      .filter(n => n.endsWith('.json') && n !== 'indeks.json')
      .map(n => n.replace('.json', ''))
    is('die GAB het 66 boeke', boeke.length, 66)
    const mis = []
    for (const k of boeke) {
      const b = leesBoek(k)
      for (let h = 1; h <= b.hoofstukke.length; h++) {
        if (!dekking.has(`${k} ${h}`)) mis.push(`${k} ${h}`)
      }
    }
    is('geen hoofstuk word uitgelaat nie', mis.slice(0, 10), [])
    is('en niks word dubbel getel nie', dekking.size, egte.totaalHoofstukke)
  }

  console.log('\n── Hoeveel per dag ──')
  {
    const per = egte.dae.map(d => d.l.length)
    const maks = Math.max(...per), min = Math.min(...per)
    waar(`hoogstens vyf op n dag (${maks})`, maks <= 5)
    waar(`en minstens twee (${min})`, min >= 2)
  }

  console.log('\n── En die reëls werk op die EGTE plan ──')
  is('niks gelees → dag 1', huidigeDag(egte, []), 1)
  is('en 0%',               vordering(egte, []).persent, 0)
  {
    const naDag1 = merkDag([], egte.dae[0])
    is('dag 1 klaar → dag 2', huidigeDag(egte, naDag1), 2)
  }
  /* Die skerm SKRYF `standUit`; die kaart LEES dit. Loop hulle uitmekaar, wys
     die e-boekblad 'n ander dag as die plan self — en dit is die soort fout
     wat niemand raaksien nie. */
  console.log('\n── Wat die skerm skryf, is wat die kaart lees ──')
  {
    is('nog niks gelees nie', kaartStand(standUit(egte, [])).lyn, 'Dag 1 van 365')
    const naDag1 = merkDag([], egte.dae[0])
    is('ná dag 1',            kaartStand(standUit(egte, naDag1)).lyn, 'Dag 2 van 365')
    is('en die knoppie skuif', kaartStand(standUit(egte, naDag1)).knop, 'GAAN VOORT')
  }
  {
    let alles = []
    for (const d of egte.dae) alles = merkDag(alles, d)
    is('alles gelees → LEES WEER', kaartStand(standUit(egte, alles)).knop, 'LEES WEER')
  }
  {
    let alles = []
    for (const d of egte.dae) alles = merkDag(alles, d)
    is('alles gelees is 1 189', alles.length, 1189)
    is('en 100%',               vordering(egte, alles).persent, 100)
    is('en 365 dae',            vordering(egte, alles).dae, 365)
    is('en die huidige dag bly 365', huidigeDag(egte, alles), 365)
    waar('en dit is klaar', allesKlaar(egte, alles))
  }
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
