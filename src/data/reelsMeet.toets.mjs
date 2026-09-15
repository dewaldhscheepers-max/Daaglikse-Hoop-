/* Word die voer werklik gekyk?
 *
 * Dewald, 15 September 2026: *"i want to make sure this page is actually
 * working. so i need you to count how many people click on reels and how many
 * videos each person watched."*
 *
 * Die twee dinge wat hier moet vasstaan:
 *
 *   · elke drempel word PRESIES EEN keer per sessie gestuur. Word `bereik5` twee
 *     keer gestuur, is die verspreiding 'n leuen — en 'n getal wat lieg, is
 *     erger as geen getal nie;
 *   · die verspreiding lees NOOIT 'n negatiewe getal nie. Die tellers kan dryf
 *     (’n skryf wat misluk, 'n ou weergawe op 'n foon), en "-4 mense" op die
 *     skerm is 'n bladsy wat niemand weer vertrou nie.
 *
 *   node src/data/reelsMeet.toets.mjs
 */
import {
  DREMPELS, OOP, MEET_GEBEURE,
  drempelVir, isMeetGebeurtenis, verspreiding, opsomming,
} from './reelsMeet.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}
const waar = (n, k) => is(n, !!k, true)

console.log('\n── Die drempels ──')
is('vyf van hulle',        DREMPELS, [1, 3, 5, 10, 25])
is('hulle klim',           DREMPELS.every((n, i) => i === 0 || n > DREMPELS[i - 1]), true)
is('die eerste is 1',      DREMPELS[0], 1)
is('die gebeurtenisse',    MEET_GEBEURE, ['oop', 'bereik1', 'bereik3', 'bereik5', 'bereik10', 'bereik25'])
is('en `oop` is daar',     MEET_GEBEURE.includes(OOP), true)

console.log('\n── Elke drempel word PRESIES EEN keer getref ──')
{
  /* Dit is die hele waarborg. Die telling loop 1, 2, 3, … en elke drempel kom
     een keer verby — daar is geen toestand nodig om dit te onthou nie. */
  const gestuur = []
  for (let n = 1; n <= 60; n++) {
    const d = drempelVir(n)
    if (d) gestuur.push(d)
  }
  is('al vyf is gestuur', gestuur.length, 5)
  is('geen een twee keer', gestuur.length, new Set(gestuur).size)
  is('en in volgorde', gestuur, ['bereik1', 'bereik3', 'bereik5', 'bereik10', 'bereik25'])
}
is('2 is geen drempel',   drempelVir(2), null)
is('4 ook nie',           drempelVir(4), null)
is('0 ook nie',           drempelVir(0), null)
is('negatief ook nie',    drempelVir(-5), null)
is('n breuk val af na n heelgetal', drempelVir(3.9), 'bereik3')
is('gemors',              drempelVir('nee'), null)
is('niks',                drempelVir(null), null)

console.log('\n── Die witlys ──')
/* Die eindpunt is OOP. Hierdie lys is die enigste ding tussen 'n vreemdeling en
   enige veld op daardie dokument. */
for (const g of MEET_GEBEURE) waar(`${g} is bekend`, isMeetGebeurtenis(g))
for (const boos of ['bereik2', 'bereik0', 'bereik', 'bereik999', '__proto__',
                    'constructor', 'gedeel', '', null, 42, {}]) {
  is(`${JSON.stringify(boos)} is NIE bekend nie`, isMeetGebeurtenis(boos), false)
}

console.log('\n── Die verspreiding ──')
{
  /* 200 het oopgemaak; 180 het minstens een gekyk; 120 minstens drie; 70
     minstens vyf; 30 minstens tien; 8 minstens vyf-en-twintig. */
  const t = { oop: 200, bereik1: 180, bereik3: 120, bereik5: 70, bereik10: 30, bereik25: 8 }
  const r = verspreiding(t)
  is('ses rye', r.length, 6)
  is('het oopgemaak, niks gekyk', r[0].aantal, 20)
  is('1–2 clips',   r[1].aantal, 60)
  is('3–4 clips',   r[2].aantal, 50)
  is('5–9 clips',   r[3].aantal, 40)
  is('10–24 clips', r[4].aantal, 22)
  is('25+ clips',   r[5].aantal, 8)
  /* Elke sessie word presies EEN keer getel. */
  is('die rye tel op tot die oopmaak-getal',
     r.reduce((s, x) => s + x.aantal, 0), 200)
  is('die woorde lees reg',
     r.map(x => x.woorde),
     ['Het oopgemaak, niks gekyk', '1–2 clips', '3–4 clips', '5–9 clips',
      '10–24 clips', '25+ clips'])
}

console.log('\n── Dit wys NOOIT n negatiewe getal nie ──')
{
  /* Die tellers kan dryf: 'n skryf wat misluk het, 'n foon met 'n ou weergawe,
     'n drempel wat aankom nadat 'n vroeëre een verlore gegaan het. */
  const r = verspreiding({ oop: 5, bereik1: 90, bereik3: 200, bereik5: 1 })
  waar('elke ry is nul of meer', r.every(x => x.aantal >= 0))
  waar('en elkeen is n heelgetal', r.every(x => Number.isInteger(x.aantal)))
}
is('niks in',     verspreiding(null).every(x => x.aantal === 0), true)
is('gemors in',   verspreiding('nee').length, 6)
is('n lee begin', verspreiding({}).every(x => x.aantal === 0), true)

console.log('\n── Die opsomming bo-aan ──')
{
  const o = opsomming({ oop: 200, bereik1: 180, bereik3: 120 })
  is('oopgemaak', o.oop, 200)
  is('het gekyk',  o.gekyk, 180)
  is('persent',    o.persent, 90)
  is('en het gebly', o.bleef, 120)
}
{
  /* Geen oopmaak, geen persentasie. `0/0` is nie 0% nie — dit is "ons weet
     nie", en 'n skerm wat 0% wys waar daar geen data is nie, lieg. */
  const o = opsomming({})
  is('geen data: geen persentasie', o.persent, null)
  is('en die res is nul', [o.oop, o.gekyk, o.bleef], [0, 0, 0])
}
is('niks in', opsomming(null).persent, null)

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
