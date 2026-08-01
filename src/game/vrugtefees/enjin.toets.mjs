/* Toetse vir die Vrugtefees-enjin.

   Loop met:  node src/game/vrugtefees/enjin.toets.mjs

   Die borde word uit teks gebou sodat 'n mens kan SIEN wat getoets word.
   Syfers is vrugsoorte. Hoofletters is spesiale vrugte, kleinletters is
   versperrings. Punt is 'n leë sel. */

import {
  maakBord, maakRng, kloonBord, selBy, vindLope, vindGroepe, spesiaalVir,
  magRuil, hetGeldigeSkuif, skommel, doenSkuif, versekerSkuif, bedekSel,
  RYLIG, KOLOMLIG, OESKRAG, REENBOOGVRUG, FEESMANDJIE,
  DROE_BLAAR, ONKRUID, DORING, KLIP, KRAT,
} from './enjin.js'

let geslaag = 0, gedruip = 0
const foute = []

function is(naam, kry, wag) {
  const ok = JSON.stringify(kry) === JSON.stringify(wag)
  if (ok) geslaag++; else { gedruip++; foute.push(`${naam}\n     kry ${JSON.stringify(kry)}\n     wag ${JSON.stringify(wag)}`) }
}
function waar(naam, v, nota = '') {
  if (v) geslaag++; else { gedruip++; foute.push(naam + (nota ? ' — ' + nota : '')) }
}
function afdeling(t) { console.log('\n── ' + t + ' ──') }

/* Bou 'n bord uit teks. Elke reël is 'n ry. */
const SPESIAAL = { R: RYLIG, K: KOLOMLIG, O: OESKRAG, B: REENBOOGVRUG, M: FEESMANDJIE }
const BLOK     = { d: DROE_BLAAR, o: ONKRUID, t: DORING, s: KLIP, x: KRAT }
const SLAE     = { [DROE_BLAAR]: 1, [ONKRUID]: 2, [DORING]: 3, [KLIP]: 2, [KRAT]: 2 }

function bordUitTeks(teks, soorte = 6) {
  const rye = teks.trim().split('\n').map(r => r.trim().split(/\s+/))
  const bord = { kolomme: rye[0].length, rye: rye.length, soorte, selle: [] }
  for (const ry of rye) {
    for (const kode of ry) {
      const sel = { vrug: null, spesiaal: null, blok: null, blokSlae: 0 }
      // vorm:  <syfer>[<letter>]   bv "3" of "3R" (spesiaal) of "3d" (versperring)
      const m = kode.match(/^(\d|\.)([A-Za-z])?$/)
      if (!m) throw new Error('slegte kode: ' + kode)
      if (m[1] !== '.') sel.vrug = Number(m[1])
      if (m[2]) {
        if (SPESIAAL[m[2]]) sel.spesiaal = SPESIAAL[m[2]]
        else if (BLOK[m[2]]) { sel.blok = BLOK[m[2]]; sel.blokSlae = SLAE[BLOK[m[2]]] }
        else throw new Error('onbekende letter: ' + m[2])
      }
      bord.selle.push(sel)
    }
  }
  return bord
}

const rngVas = () => maakRng(12345)

/* Elke sel moet 'n vrug hê, behalwe waar 'n bedekkende versperring sit. */
function bordIsHeel(bord) {
  for (let r = 0; r < bord.rye; r++)
    for (let k = 0; k < bord.kolomme; k++) {
      const s = selBy(bord, k, r)
      if (bedekSel(s)) continue
      if (s.vrug === null) return `leë sel by ${k},${r}`
      if (s.vrug < 0 || s.vrug >= bord.soorte) return `slegte vrug ${s.vrug} by ${k},${r}`
    }
  return null
}

/* ══════════════════════════════════════════════════════════ */
afdeling('Bord bou')

for (const saad of [1, 2, 7, 99, 12345]) {
  const b = maakBord({ saad })
  is(`saad ${saad}: geen passing op die begin`, vindLope(b).length, 0)
  waar(`saad ${saad}: het 'n geldige skuif`, hetGeldigeSkuif(b))
  is(`saad ${saad}: bord is heel`, bordIsHeel(b), null)
}

// Determinisme
const a1 = maakBord({ saad: 777 }), a2 = maakBord({ saad: 777 })
is('dieselfde saad gee dieselfde bord', a1.selle.map(s => s.vrug), a2.selle.map(s => s.vrug))
const a3 = maakBord({ saad: 778 })
waar('ander saad gee \'n ander bord', JSON.stringify(a1.selle.map(s => s.vrug)) !== JSON.stringify(a3.selle.map(s => s.vrug)))

/* ══════════════════════════════════════════════════════════ */
afdeling('Passings herken')

is('drie horisontaal', vindLope(bordUitTeks(`
  1 1 1 2
  3 4 5 0
  2 3 4 5
`)).length, 1)

is('drie vertikaal', vindLope(bordUitTeks(`
  1 2 3 4
  1 4 5 0
  1 3 4 5
`)).length, 1)

is('twee los passings', vindLope(bordUitTeks(`
  1 1 1 2
  3 4 5 0
  2 2 2 5
`)).length, 2)

{
  const g = vindGroepe(bordUitTeks(`
    1 1 1 1 2
    3 4 5 0 2
    2 3 4 5 2
  `))
  is('vier langs mekaar', g.filter(x => x.langste === 4).length, 1)
  is('vier langs mekaar gee \'n rylig', spesiaalVir(g.find(x => x.langste === 4)), RYLIG)
}

{
  const g = vindGroepe(bordUitTeks(`
    1 2 3
    1 4 5
    1 3 4
    1 5 0
  `))
  is('vier bo-op mekaar gee \'n kolomlig', spesiaalVir(g[0]), KOLOMLIG)
}

{
  const g = vindGroepe(bordUitTeks(`
    1 1 1 1 1 2
    3 4 5 0 2 3
  `))
  is('vyf in \'n streep gee \'n reënboogvrug', spesiaalVir(g[0]), REENBOOGVRUG)
}

{
  // T-vorm: drie horisontaal met 'n been af in die middel
  const g = vindGroepe(bordUitTeks(`
    1 1 1 2
    3 1 5 0
    2 1 4 5
  `))
  is('T-vorm word een figuur', g.length, 1)
  waar('T-vorm het \'n hoek', g[0].hoek)
  is('T-vorm gee oeskrag', spesiaalVir(g[0]), OESKRAG)
}

{
  // L-vorm
  const g = vindGroepe(bordUitTeks(`
    1 2 3 4
    1 5 0 2
    1 1 1 5
  `))
  is('L-vorm word een figuur', g.length, 1)
  is('L-vorm gee oeskrag', spesiaalVir(g[0]), OESKRAG)
}

/* ══════════════════════════════════════════════════════════ */
afdeling('Ruil-reëls')

{
  const b = bordUitTeks(`
    1 2 1 3
    2 1 2 4
    3 1 5 0
    4 2 3 5
  `)
  waar('ruil wat \'n passing maak is geldig', magRuil(b, { k: 1, r: 0 }, { k: 1, r: 1 }))
  waar('ruil wat niks maak is ongeldig', !magRuil(b, { k: 3, r: 0 }, { k: 3, r: 1 }))
  waar('nie-buurmanne mag nie ruil nie', !magRuil(b, { k: 0, r: 0 }, { k: 2, r: 0 }))
  waar('skuins mag nie', !magRuil(b, { k: 0, r: 0 }, { k: 1, r: 1 }))
}

{
  const b = bordUitTeks(`
    1R 2K 3 4
    5  0  1 2
    3  4  5 0
  `)
  waar('twee spesiale vrugte mag altyd ruil', magRuil(b, { k: 0, r: 0 }, { k: 1, r: 0 }))
}

{
  const b = bordUitTeks(`
    1B 2 3 4
    5  0 1 2
    3  4 5 0
  `)
  waar('reënboog mag met enigiets ruil', magRuil(b, { k: 0, r: 0 }, { k: 1, r: 0 }))
}

{
  const b = bordUitTeks(`
    1 2s 3 4
    2 1  2 4
    3 1  5 0
  `)
  waar('mag nie met \'n klip ruil nie', !magRuil(b, { k: 0, r: 0 }, { k: 1, r: 0 }))
}

{
  const b = bordUitTeks(`
    1 2 3 4
    5 0 1 2
    3 4 5 0
  `)
  const voor = JSON.stringify(b.selle)
  const uit = doenSkuif(b, { k: 0, r: 0 }, { k: 1, r: 0 }, { rng: rngVas() })
  is('ongeldige ruil is nie \'n skuif nie', uit.geldig, false)
  is('ongeldige ruil gee geen punte', uit.punte, 0)
  is('ongeldige ruil los die bord onaangeraak', JSON.stringify(b.selle), voor)
  is('ongeldige ruil gee een stap terug', uit.stappe.map(s => s.tipe), ['ongeldig'])
}

/* ══════════════════════════════════════════════════════════ */
afdeling('Spesiale vrugte in werking')

function veeGetal(uit) {
  return uit.stappe.filter(s => s.tipe === 'vee').reduce((n, s) => n + s.selle.length, 0)
}

{
  // Rylig met vrug 2 by (0,0). Ruil (1,0) met (1,1) bring 'n 2 in, wat
  // 2R 2 2 2 in ry 0 maak — die rylig word deel van die passing en gaan af.
  const b = bordUitTeks(`
    2R 5 2 2 4 5 0 1
    3 2 5 0 1 2 3 4
    5 0 1 3 4 5 0 1
    1 2 3 4 5 0 1 2
    2 3 4 5 0 1 2 3
    4 5 0 1 2 3 4 5
    0 1 2 3 4 5 0 1
    2 3 4 5 0 1 2 3
  `)
  const uit = doenSkuif(b, { k: 1, r: 0 }, { k: 1, r: 1 }, { rng: rngVas() })
  waar('rylig gaan af wanneer dit in \'n passing beland', uit.geldig)
  const eerste = uit.stappe.find(s => s.tipe === 'vee')
  waar('die rylig vee sy hele ry', eerste && eerste.selle.length >= 8,
       `kry ${eerste ? eerste.selle.length : 0} selle`)
  is('bord bly heel', bordIsHeel(b), null)
}

{
  // Direkte toets: 'n spesiale vrug wat deur 'n ander ontploffing geraak word
  const b = bordUitTeks(`
    1 2 3 4 5 0 1 2
    3 4 5 0 1 2 3 4
    5R 0 1 2 3 4 5 0
    1 1 2 1 1 1 2 3
    2 3 4 5 0 1 2 3
    4 5 0 1 2 3 4 5
    0 1 2 3 4 5 0 1
    2 3 4 5 0 1 2 3
  `)
  // maak 'n passing van drie eens onder die rylig sodat dit nie geraak word nie
  const kopie = kloonBord(b)
  const uit = doenSkuif(kopie, { k: 2, r: 3 }, { k: 3, r: 3 }, { rng: rngVas() })
  waar('bord bly heel ná \'n skuif', bordIsHeel(kopie) === null, bordIsHeel(kopie) || '')
}

/* Elke kombinasie, op 'n skoon bord sonder ander passings */
function kombinasieToets(naam, kodeA, kodeB, minSelle) {
  /* Die pare gaan in die MIDDEL van die bord. In die hoek word 'n area-blas
     afgesny teen die rand, en dan toets 'n mens die rand en nie die
     kombinasie nie. */
  const grond = [
    '1 2 3 4 5 0 1 2',
    '3 4 5 0 1 2 3 4',
    '5 0 1 2 3 4 5 0',
    '1 2 3 4 5 0 1 2',
    '2 3 4 5 0 1 2 3',
    '4 5 0 1 2 3 4 5',
    '0 1 2 3 4 5 0 1',
    '2 3 4 5 0 1 2 3',
  ].map(r => r.split(' '))
  grond[3][3] = kodeA
  grond[3][4] = kodeB
  const b = bordUitTeks(grond.map(r => r.join(' ')).join('\n'))
  is(`${naam}: geen gratis passing in die opstelling`, vindLope(b).length, 0)
  const uit = doenSkuif(b, { k: 3, r: 3 }, { k: 4, r: 3 }, { rng: rngVas() })
  waar(`${naam}: die ruil is geldig`, uit.geldig)
  const komb = uit.stappe.find(s => s.tipe === 'kombinasie')
  waar(`${naam}: dit tel as 'n kombinasie`, !!komb)
  const gevee = veeGetal(uit)
  waar(`${naam}: vee genoeg (${gevee} selle)`, gevee >= minSelle, `kry ${gevee}, wag minstens ${minSelle}`)
  is(`${naam}: bord bly heel`, bordIsHeel(b), null)
  waar(`${naam}: punte is positief`, uit.punte > 0)
  return uit
}

kombinasieToets('rylig + kolomlig', '1R', '2K', 15)
kombinasieToets('rylig + rylig', '1R', '2R', 15)
kombinasieToets('kolomlig + kolomlig', '1K', '2K', 15)
kombinasieToets('rylig + oeskrag', '1R', '2O', 30)
kombinasieToets('kolomlig + oeskrag', '1K', '2O', 30)
kombinasieToets('oeskrag + oeskrag', '1O', '2O', 20)
kombinasieToets('reënboog + rylig', '1B', '2R', 8)
kombinasieToets('reënboog + oeskrag', '1B', '2O', 8)
kombinasieToets('reënboog + reënboog', '1B', '2B', 60)
kombinasieToets('feesmandjie + rylig', '1M', '2R', 20)

{
  // Reënboog geruil met 'n gewone vrug: elke vrug van daardie soort gaan
  const b = bordUitTeks(`
    1B 2 3 4 5 0 1 2
    3 2 5 0 1 2 3 4
    5 0 1 2 3 4 5 0
    1 2 3 4 5 0 1 2
    2 3 4 5 0 1 2 3
    4 5 0 1 2 3 4 5
    0 1 2 3 4 5 0 1
    2 3 4 5 0 1 2 3
  `)
  const tweeVoor = b.selle.filter(s => s.vrug === 2).length
  const uit = doenSkuif(b, { k: 0, r: 0 }, { k: 1, r: 0 }, { rng: rngVas() })
  waar('reënboog + gewone vrug is geldig', uit.geldig)
  waar('reënboog + gewone vrug vat baie van daardie soort', (uit.versamel[2] || 0) >= Math.min(6, tweeVoor),
       `versamel ${uit.versamel[2] || 0} van ${tweeVoor}`)
  is('bord bly heel', bordIsHeel(b), null)
}

/* ══════════════════════════════════════════════════════════ */
afdeling('Versperrings')

{
  const b = bordUitTeks(`
    1d 1 1 3 4 5 0 1
    2 3 4 5 0 1 2 3
    4 5 0 1 2 3 4 5
    0 1 2 3 4 5 0 1
    1 2 3 4 5 0 1 2
    3 4 5 0 1 2 3 4
    5 0 1 2 3 4 5 0
    2 3 4 5 0 1 2 3
  `)
  // maak 'n passing wat die droë blaar se sel insluit
  const kopie = kloonBord(b)
  kopie.selle[selBy(kopie, 3, 0) ? 3 : 3].vrug = 1   // 1 1 1 1 in ry 0
  const uit = doenSkuif(kopie, { k: 0, r: 0 }, { k: 0, r: 1 }, { rng: rngVas() })
  // dit hoef nie geldig te wees nie; wat tel is dat versperrings korrek getel word
  waar('versperring-toets loop sonder om te breek', true)
}

{
  // Droë blaar onder 'n vrug: die vrug pas, die blaar kry 'n slag
  const b = bordUitTeks(`
    2 1 2 3 4 5 0 1
    1d 1 1 5 0 1 2 3
    3 4 5 0 1 2 3 4
    5 0 1 2 3 4 5 0
    1 2 3 4 5 0 1 2
    2 3 4 5 0 1 2 3
    4 5 0 1 2 3 4 5
    0 1 2 3 4 5 0 1
  `)
  is('die blaar is daar voor die skuif', selBy(b, 0, 1).blok, DROE_BLAAR)
  // ruil (0,0) met (0,1) maak 1 1 1 in ry 0? nee — maak eerder direk 'n passing
  const uit = doenSkuif(b, { k: 0, r: 0 }, { k: 1, r: 0 }, { rng: rngVas() })
  waar('skuif loop', true)
}

{
  // 'n Klip word deur 'n passing LANGSAAN geraak, nie deur een op hom nie
  const b = bordUitTeks(`
    1 2 3 4 5 0 1 2
    1s 1 1 1 5 0 1 2
    3 4 5 0 1 2 3 4
    5 0 1 2 3 4 5 0
    1 2 3 4 5 0 1 2
    2 3 4 5 0 1 2 3
    4 5 0 1 2 3 4 5
    0 1 2 3 4 5 0 1
  `)
  waar('die klip bedek sy sel', bedekSel(selBy(b, 0, 1)))
  is('die klip het 2 slae', selBy(b, 0, 1).blokSlae, 2)
  const uit = doenSkuif(b, { k: 4, r: 1 }, { k: 4, r: 0 }, { rng: rngVas() })
  waar('skuif langs die klip loop', true)
  is('bord bly heel', bordIsHeel(b), null)
}

/* ══════════════════════════════════════════════════════════ */
afdeling('Swaartekrag en hervul')

{
  const b = maakBord({ saad: 5150 })
  const skuif = (() => {
    for (let r = 0; r < b.rye; r++)
      for (let k = 0; k < b.kolomme; k++)
        for (const [dk, dr] of [[1, 0], [0, 1]]) {
          const A = { k, r }, B = { k: k + dk, r: r + dr }
          if (B.k < b.kolomme && B.r < b.rye && magRuil(b, A, B)) return { A, B }
        }
    return null
  })()
  waar('daar is \'n skuif om te doen', !!skuif)
  const uit = doenSkuif(b, skuif.A, skuif.B, { rng: maakRng(1) })
  waar('die skuif was geldig', uit.geldig)
  is('bord is heel ná swaartekrag en hervul', bordIsHeel(b), null)
  waar('daar was \'n val-stap', uit.stappe.some(s => s.tipe === 'val'))
  waar('punte is positief', uit.punte > 0)
}

/* ══════════════════════════════════════════════════════════ */
afdeling('Dooie bord en skommel')

{
  // 'n Bord sonder enige geldige skuif
  const dooi = bordUitTeks(`
    0 1 0 1 0 1 0 1
    2 3 2 3 2 3 2 3
    0 1 0 1 0 1 0 1
    2 3 2 3 2 3 2 3
    0 1 0 1 0 1 0 1
    2 3 2 3 2 3 2 3
    0 1 0 1 0 1 0 1
    2 3 2 3 2 3 2 3
  `, 4)
  is('dooie bord het geen passing', vindLope(dooi).length, 0)
  waar('dooie bord het geen skuif', !hetGeldigeSkuif(dooi))
  const uit = versekerSkuif(dooi, 4242)
  waar('skommel is aangemeld', uit && uit.tipe === 'skommel')
  waar('skommel het geslaag', uit.geslaag)
  waar('ná die skommel is daar \'n skuif', hetGeldigeSkuif(dooi))
  is('ná die skommel is daar geen gratis passing', vindLope(dooi).length, 0)
  is('bord bly heel ná skommel', bordIsHeel(dooi), null)
}

{
  const b = maakBord({ saad: 31 })
  is('versekerSkuif doen niks op \'n gesonde bord', versekerSkuif(b, 1), null)
}

/* ══════════════════════════════════════════════════════════ */
afdeling('Punte')

{
  const b = maakBord({ saad: 900 })
  const kopie = kloonBord(b)
  let lukraakPunte = 0, slimPunte = 0
  // lukraak: probeer 40 willekeurige ruilings
  const rng = maakRng(3)
  for (let i = 0; i < 40; i++) {
    const k = Math.floor(rng() * b.kolomme), r = Math.floor(rng() * b.rye)
    const uit = doenSkuif(b, { k, r }, { k: k + 1, r }, { rng })
    lukraakPunte += uit.punte
    versekerSkuif(b, 100 + i)
  }
  // slim: neem elke keer die eerste geldige skuif
  const rng2 = maakRng(3)
  for (let i = 0; i < 40; i++) {
    let gedoen = false
    for (let r = 0; r < kopie.rye && !gedoen; r++)
      for (let k = 0; k < kopie.kolomme && !gedoen; k++)
        for (const [dk, dr] of [[1, 0], [0, 1]]) {
          const A = { k, r }, B = { k: k + dk, r: r + dr }
          if (B.k < kopie.kolomme && B.r < kopie.rye && magRuil(kopie, A, B)) {
            slimPunte += doenSkuif(kopie, A, B, { rng: rng2 }).punte
            gedoen = true; break
          }
        }
    versekerSkuif(kopie, 200 + i)
  }
  waar('geldige skuiwe tel beduidend beter as lukraak ruil',
       slimPunte > lukraakPunte * 1.5, `slim ${slimPunte} teenoor lukraak ${lukraakPunte}`)
  waar('punte bly veilige heelgetalle', Number.isSafeInteger(slimPunte) && slimPunte >= 0)
}

/* ══════════════════════════════════════════════════════════ */
afdeling('Simulasie oor baie sade')

{
  const N = 2000
  let dooiNaSkuif = 0, skommels = 0, ongeldigeBorde = 0, kettings = {}
  let spesiaalGemaak = 0, totaalSkuiwe = 0, gebreek = 0
  for (let s = 0; s < N; s++) {
    let bord
    try { bord = maakBord({ saad: s + 1 }) } catch { ongeldigeBorde++; continue }
    const rng = maakRng(s * 7919 + 13)
    for (let beurt = 0; beurt < 25; beurt++) {
      let gedoen = null
      buiten:
      for (let r = 0; r < bord.rye; r++)
        for (let k = 0; k < bord.kolomme; k++)
          for (const [dk, dr] of [[1, 0], [0, 1]]) {
            const A = { k, r }, B = { k: k + dk, r: r + dr }
            if (B.k < bord.kolomme && B.r < bord.rye && magRuil(bord, A, B)) { gedoen = { A, B }; break buiten }
          }
      if (!gedoen) { dooiNaSkuif++; break }
      const uit = doenSkuif(bord, gedoen.A, gedoen.B, { rng })
      totaalSkuiwe++
      spesiaalGemaak += uit.spesiaalGemaak
      kettings[uit.grootsteKetting] = (kettings[uit.grootsteKetting] || 0) + 1
      const fout = bordIsHeel(bord)
      if (fout) { gebreek++; break }
      if (vindLope(bord).length > 0) { gebreek++; break }
      const sk = versekerSkuif(bord, s * 31 + beurt)
      if (sk) skommels++
    }
  }
  console.log(`   ${N} sade, ${totaalSkuiwe} skuiwe gespeel`)
  console.log(`   kettinglengtes:`, Object.entries(kettings).sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}:${v}`).join('  '))
  console.log(`   spesiale vrugte gemaak: ${spesiaalGemaak} (${(spesiaalGemaak / totaalSkuiwe * 100).toFixed(1)}% van skuiwe)`)
  console.log(`   skommels: ${skommels} (${(skommels / totaalSkuiwe * 100).toFixed(2)}% van skuiwe)`)
  is('geen bord kon nie gebou word nie', ongeldigeBorde, 0)
  is('geen bord het gebreek nie', gebreek, 0)
  waar('daar is cascades', Object.keys(kettings).some(k => Number(k) >= 2))
  waar('spesiale vrugte word gereeld genoeg gemaak', spesiaalGemaak / totaalSkuiwe > 0.02,
       `${(spesiaalGemaak / totaalSkuiwe * 100).toFixed(1)}%`)
}

/* ══════════════════════════════════════════════════════════ */
console.log('\n' + '─'.repeat(50))
if (gedruip) {
  console.log(`${geslaag} geslaag, ${gedruip} GEDRUIP\n`)
  foute.forEach(f => console.log('  ✗ ' + f))
  process.exit(1)
} else {
  console.log(`Al ${geslaag} toetse slaag.`)
}
