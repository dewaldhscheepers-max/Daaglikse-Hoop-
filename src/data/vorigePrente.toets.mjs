/* Vorige prente — watter prente, in watter volgorde, en HOEVEEL op 'n slag.
 *
 * Dewald, 24 September 2026: *"moenie al die wallpapers gelyk laai nie...
 * hulle kan mos kliek laai meer."*
 *
 *   node src/data/vorigePrente.toets.mjs
 */
import {
  PER_BLAD, prenteUit, blad, hetMeer, nogOor, datumWoorde,
} from './vorigePrente.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}
const waar = (n, k) => is(n, !!k, true)

const nota = (id, ekstra = {}) => ({
  id, title: `Boodskap ${id}`, date: '2026-09-20',
  audioUrl: `https://voorbeeld.test/${id}.mp3`,
  wallpaperUrl: `https://voorbeeld.test/${id}.jpg`,
  ...ekstra,
})

console.log('\n── n Nota SONDER n prent bestaan hier nie ──')
{
  /* Nie n lee teel nie, nie n plekhouer nie. Die veld is jonger as die app, dus
     dra die ou notas hom eenvoudig nie — en n galery met gate lyk stukkend. */
  const lys = [nota('a'), { id: 'b', title: 'Geen prent' }, nota('c'),
               nota('d', { wallpaperUrl: '' }), nota('e', { wallpaperUrl: '   ' })]
  is('net die drie met n prent', prenteUit(lys).map(p => p.id), ['a', 'c'])
}

console.log('\n── VANDAG se prent staan nie hier nie ──')
{
  /* Hy staan reeds bo-aan die blad waar die knoppie is. Twee keer dieselfde
     prent op een skerm lees soos n fout, en die skerm heet VORIGE prente. */
  const lys = [nota('vandag'), nota('gister'), nota('eergister')]
  is('vandag s n val weg',
     prenteUit(lys, { sonder: 'vandag' }).map(p => p.id), ['gister', 'eergister'])
  is('sonder die uitsluiting is hy daar',
     prenteUit(lys).map(p => p.id), ['vandag', 'gister', 'eergister'])
}

console.log('\n── Die volgorde kom van die NOTAS af ──')
{
  /* Die lys wat Luister kry, is reeds nuutste-eerste. n Tweede sortering hier
     sou van die blad af wegdryf die dag wanneer daardie een verander. */
  const lys = [nota('1', { date: '2026-01-01' }), nota('2', { date: '2026-09-01' })]
  is('die orde bly soos hy inkom', prenteUit(lys).map(p => p.id), ['1', '2'])
}

console.log('\n── Elke prent dra sy BOODSKAP saam ──')
{
  /* Die verbinding is gratis — albei le op dieselfde dokument — en dit is wat
     die galery n tweede pad in die argief in maak. */
  const p = prenteUit([nota('x', { title: 'GOD IS GETROU', date: '2026-09-19' })])[0]
  is('die titel', p.titel, 'GOD IS GETROU')
  is('die datum', p.datum, '2026-09-19')
  is('en die oudio', p.oudio, 'https://voorbeeld.test/x.mp3')
  is('die prent self', p.url, 'https://voorbeeld.test/x.jpg')
}

console.log('\n── AGT op n slag, en n knoppie vir die res ──')
{
  const lys = Array.from({ length: 20 }, (_, i) => nota(`n${i}`))
  const prente = prenteUit(lys)
  is('daar is twintig', prente.length, 20)
  is('per blad is agt', PER_BLAD, 8)

  is('blad 1 wys agt', blad(prente, 1).length, 8)
  is('blad 2 wys sestien', blad(prente, 2).length, 16)
  is('blad 3 wys al twintig', blad(prente, 3).length, 20)
  is('blad 4 wys steeds twintig', blad(prente, 4).length, 20)

  is('na blad 1 is daar meer', hetMeer(prente, 1), true)
  is('na blad 2 ook', hetMeer(prente, 2), true)
  is('na blad 3 NIE', hetMeer(prente, 3), false)

  is('na blad 1 is twaalf oor', nogOor(prente, 1), 12)
  is('na blad 2 is vier oor', nogOor(prente, 2), 4)
  is('na blad 3 niks', nogOor(prente, 3), 0)

  /* Die eerste blad is altyd die EERSTE agt — die mens begin bo. */
  is('die eerste blad begin by die eerste prent', blad(prente, 1)[0].id, 'n0')
}

console.log('\n── Presies agt: geen "laai meer" wat niks laai nie ──')
{
  /* n Knoppie wat niks doen nie is erger as geen knoppie. */
  const agt = prenteUit(Array.from({ length: 8 }, (_, i) => nota(`k${i}`)))
  is('agt wys almal', blad(agt, 1).length, 8)
  is('en daar is GEEN knoppie nie', hetMeer(agt, 1), false)
  is('nege wel', hetMeer(prenteUit(Array.from({ length: 9 }, (_, i) => nota(`m${i}`))), 1), true)
}

console.log('\n── Die datum in woorde ──')
{
  /* n Mens soek "die een van verlede Dinsdag", nie n ISO-string nie. */
  is('n gewone datum', datumWoorde('2026-09-24'), '24 September 2026')
  is('die eerste van die maand', datumWoorde('2026-01-01'), '1 Januarie 2026')
  is('met n tyd daaragter', datumWoorde('2026-12-31T08:00:00.000Z'), '31 Desember 2026')
  /* Leeg bly leeg — NOOIT "Invalid Date" op die skerm nie. */
  is('gemors gee niks', datumWoorde('gister'), '')
  is('niks gee niks', datumWoorde(), '')
  is('n onmoontlike maand gee niks', datumWoorde('2026-13-01'), '')
}

console.log('\n── Gemors breek dit nie ──')
{
  is('niks in', prenteUit(), [])
  is('n string in plaas van n lys', prenteUit('nee'), [])
  is('null in die lys', prenteUit([null, nota('a'), undefined]).map(p => p.id), ['a'])
  is('n nota sonder id', prenteUit([{ wallpaperUrl: 'x.jpg' }]), [])
  /* Twee notas met dieselfde id mag nie twee keer wys nie. */
  is('geen duplikaat', prenteUit([nota('a'), nota('a')]).map(p => p.id), ['a'])
  is('blad sonder lys', blad(null, 1), [])
  is('blad 0 val terug op 1', blad(prenteUit([nota('a')]), 0).length, 1)
  is('hetMeer sonder lys', hetMeer(null, 1), false)
  is('nogOor sonder lys', nogOor(null, 1), 0)
  is('nogOor gaan nooit onder nul nie', nogOor(prenteUit([nota('a')]), 5), 0)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
