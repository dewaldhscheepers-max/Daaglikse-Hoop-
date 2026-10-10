/* Watter boeke is Engels, en die Engelse deel-sin.
 *
 *   node src/data/engelsBoeke.toets.mjs
 */
import { isEngels, verdeelPerTaal, deelBoodskapEn } from './engelsBoeke.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}
const waar = (n, k) => is(n, !!k, true)
const vals = (n, k) => is(n, !!k, false)

console.log('\n── isEngels: die verstek is Afrikaans ──')
{
  vals('geen taal-veld', isEngels({ id: 'toksies' }))
  vals('taal af', isEngels({ taal: 'af' }))
  vals('leë taal', isEngels({ taal: '' }))
  vals('onbekende taal val na af', isEngels({ taal: 'fr' }))
  vals('null', isEngels(null))
  vals('nie n voorwerp nie', isEngels('en'))
  waar('taal en', isEngels({ taal: 'en' }))
  waar('taal English met hoofletter', isEngels({ taal: 'English' }))
  waar('taal met spasies', isEngels({ taal: '  EN  ' }))
  waar('english voluit', isEngels({ taal: 'english' }))
}

console.log('\n── verdeelPerTaal: een boek is nooit op albei nie ──')
{
  const boeke = [
    { id: 'a', taal: 'en' },
    { id: 'b' },                 // af by verstek
    { id: 'c', taal: 'af' },
    { id: 'd', taal: 'ENGLISH' },
  ]
  const { engels, afrikaans } = verdeelPerTaal(boeke)
  is('engels-hoop', engels.map(b => b.id), ['a', 'd'])
  is('afrikaans-hoop', afrikaans.map(b => b.id), ['b', 'c'])
  is('saam is dit die hele lys', engels.length + afrikaans.length, boeke.length)

  const leeg = verdeelPerTaal(null)
  is('null gee twee leë hope', [leeg.engels.length, leeg.afrikaans.length], [0, 0])
}

console.log('\n── deelBoodskapEn: die boek, nie die app ──')
{
  const skakel = 'https://dewaldscheepers.com/boek/restless-thoughts'
  const m = deelBoodskapEn('Restless Thoughts', skakel)
  waar('dra die titel', m.includes('Restless Thoughts'))
  waar('dra die skakel', m.includes(skakel))
  waar('se "free"', m.toLowerCase().includes('free'))
  vals('se NIE "download the app" nie', m.toLowerCase().includes('download'))
  /* Sonder 'n titel bly die sin heel, en sonder 'n skakel ook. */
  waar('geen titel', deelBoodskapEn('', skakel).toLowerCase().includes('free'))
  is('geen skakel: net die sin', deelBoodskapEn('X', ''),
     'This free e-book helped me: "X". It\'s completely free to read.')
}

console.log(`\n${reg} reg, ${val} vals\n`)
if (val) process.exit(1)
