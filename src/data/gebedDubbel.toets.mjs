/* Loop met:  node src/data/gebedDubbel.toets.mjs
 * Dieselfde gebedsversoek drie keer op Bid Saam — sien gebedDubbel.js. */
import { normaal, isPasGestuur, sonderDuplikate, HERHAAL_VENSTER_MS } from './gebedDubbel.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`) }
}
const s = sek => ({ seconds: sek })
const NOU = 1795400000000

console.log('── normaal ──')
is('hoofletters en spasies', normaal('  Bid  vir MY ma  '), 'bid vir my ma')
is('leestekens aan die einde', normaal('Bid vir my ma!!!'), 'bid vir my ma')
is('leeg', normaal(null), '')

console.log('── isPasGestuur ──')
is('niks gestuur nie', isPasGestuur('Bid vir my', null, NOU), false)
is('dieselfde woorde 2 minute gelede', isPasGestuur('Bid vir my', { teks: 'bid vir my.', tyd: NOU - 120000 }, NOU), true)
is('dieselfde woorde 11 minute gelede', isPasGestuur('Bid vir my', { teks: 'Bid vir my', tyd: NOU - HERHAAL_VENSTER_MS - 1 }, NOU), false)
is('ander woorde', isPasGestuur('Bid vir my pa', { teks: 'Bid vir my ma', tyd: NOU - 1000 }, NOU), false)
is('gemors in die berging', isPasGestuur('x', { teks: 'x', tyd: 'nee' }, NOU), false)
is('tyd in die toekoms (klok verstel)', isPasGestuur('x', { teks: 'x', tyd: NOU + 5000 }, NOU), false)

console.log('── sonderDuplikate ──')
const a1 = { id: 'a1', text: 'Bid vir my werk', createdAt: s(1000), prayedCount: 0 }
const a2 = { id: 'a2', text: 'bid vir my werk ', createdAt: s(1010), prayedCount: 3 }
const a3 = { id: 'a3', text: 'Bid vir my werk!', createdAt: s(1020), prayedCount: 1 }
const b  = { id: 'b',  text: 'Bid vir my kind', createdAt: s(1005), prayedCount: 0 }
const lys = [a3, a2, b, a1]   /* nuutste eerste, soos die muur */
const uit = sonderDuplikate(lys)
is('drie keer dieselfde word een', uit.map(p => p.id), ['a2', 'b'])
is('die een met die meeste gebede bly', uit.some(p => p.id === 'a2'), true)
is('gelyk aan gebede: die oudste bly', sonderDuplikate([{ ...a3, prayedCount: 0 }, { ...a2, prayedCount: 0 }, a1]).map(p => p.id), ['a1'])
is('niks dubbel: dieselfde lys terug', sonderDuplikate([a1, b]).length, 2)
is('dieselfde woorde n week later is nie dubbel nie',
   sonderDuplikate([{ id: 'n', text: 'Bid vir my', createdAt: s(1000 + 7 * 86400) }, { id: 'o', text: 'Bid vir my', createdAt: s(1000) }]).length, 2)
is('nog nie bevestig (geen createdAt): steeds een', sonderDuplikate([{ id: 'x', text: 'Help', createdAt: null }, { id: 'y', text: 'Help', createdAt: null }]).length, 1)
is('nie-lys', sonderDuplikate(null), [])

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
