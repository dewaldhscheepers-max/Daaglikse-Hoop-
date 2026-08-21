/* Die verspreide tellers.
 *
 * Twee dinge mag NOOIT gebeur nie, en albei is stil:
 *
 *   1. 'n getal wat verlore gaan — skerf 0 MOET die ou dokument bly, anders
 *      begin die hele program by nul op die dag wat ons dit ontplooi;
 *   2. 'n som wat NaN word — een vreemde veld op een skerf, en die admin wys
 *      'n leë blok in plaas van 'n getal.
 */
import skerwe from './_telSkerwe.js'
const { SKERWE, BASIS, skerfPad, alleSkerfPaaie, kiesSkerf, telOp, telVeld } = skerwe

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)

console.log('\n── Skerf 0 IS die ou dokument ──\n')
{
  /* Dit is die belangrikste toets in hierdie leer. Verander skerf 0 se naam,
     en elke getal wat vandag bestaan, verdwyn uit die admin. */
  is('skerf 0', skerfPad(0), 'tellers/volgJesus')
  is('en dit is die basis', skerfPad(0), BASIS)
  is('n negatiewe skerf land ook daar', skerfPad(-1), BASIS)
  is('rommel ook', skerfPad('appelkoos'), BASIS)
  is('null ook', skerfPad(null), BASIS)
  is('n gebroke getal ook', skerfPad(0.4), BASIS)
}

console.log('\n── Die res van die skerwe ──\n')
{
  is('skerf 1', skerfPad(1), 'tellers/volgJesus_s1')
  is('skerf 9', skerfPad(9), 'tellers/volgJesus_s9')
  is(`daar is ${SKERWE}`, alleSkerfPaaie().length, SKERWE)
  is('almal uniek', new Set(alleSkerfPaaie()).size, SKERWE)
  waar('en die eerste is die ou dokument', alleSkerfPaaie()[0] === BASIS)
  /* Bo die getal skerwe word dit vasgeklem — nooit 'n dokument wat niemand
     lees nie, want dan gaan daardie tellings stil verlore. */
  is('bo die perk klem dit vas', skerfPad(99), skerfPad(SKERWE - 1))
  waar('elke pad is deur Firestore aanvaarbaar',
       alleSkerfPaaie().every(p => /^tellers\/[A-Za-z0-9_]+$/.test(p)))
}

console.log('\n── Die keuse tref elke skerf ──\n')
{
  is('0 gee skerf 0', kiesSkerf(0), 0)
  is('net onder 1 gee die laaste', kiesSkerf(0.9999), SKERWE - 1)
  is('die helfte', kiesSkerf(0.5), Math.floor(0.5 * SKERWE))
  /* Rommel mag nooit 'n ongeldige skerf gee nie — dan misluk die skryf en die
     mens se telling gaan verlore. */
  for (const r of [undefined, null, NaN, Infinity, -1, 1, 1.5, 'half', {}]) {
    const i = kiesSkerf(r)
    if (!Number.isInteger(i) || i < 0 || i >= SKERWE) {
      val++; console.log(`  VAL ${String(r)} gee ${i}`)
    } else reg++
  }
  /* Oor baie lopies moet elke skerf gebruik word — anders help die verspreiding
     niks en bly ons met dieselfde bottelnek sit. */
  const getref = new Set()
  for (let i = 0; i < 10000; i++) getref.add(kiesSkerf(i / 10000))
  is('al die skerwe word gebruik', getref.size, SKERWE)
}

console.log('\n── Optel ──\n')
{
  const d = n => ({ fields: { oop: { integerValue: String(n) } } })
  is('een skerf', telOp([d(5)]), { oop: 5 })
  is('drie skerwe', telOp([d(5), d(7), d(1)]), { oop: 13 })
  is('geen skerwe', telOp([]), {})
  /* 'n Skerf wat nog nooit geskryf is nie, bestaan nie. Dit is nul, nie 'n
     fout nie. */
  is('n ontbrekende skerf tel as nul', telOp([d(4), null, undefined, {}]), { oop: 4 })
  is('rommel in plaas van n lys', telOp('nee'), {})
  is('null in plaas van n lys', telOp(null), {})

  is('verskillende velde', telOp([
    { fields: { oop: { integerValue: '3' }, doen: { integerValue: '1' } } },
    { fields: { oop: { integerValue: '4' }, w2begin: { integerValue: '9' } } },
  ]), { oop: 7, doen: 1, w2begin: 9 })
}

console.log('\n── Een vreemde veld mag NIE die som breek nie ──\n')
{
  const d = n => ({ fields: { oop: { integerValue: String(n) } } })
  /* Iemand redigeer 'n veld met die hand in die Firebase-konsole en dit word 'n
     string. Sonder hierdie hek word die hele som NaN en die admin wys niks. */
  const vuil = { fields: { oop: { stringValue: 'baie' }, doen: { integerValue: '2' } } }
  is('die string word oorgeslaan', telOp([d(6), vuil]), { oop: 6, doen: 2 })
  const leeg = { fields: { oop: {} } }
  is('n veld sonder waarde ook', telOp([d(6), leeg]), { oop: 6 })
  const nie = { fields: { oop: { integerValue: 'nie n getal' } } }
  is('n onleesbare getal ook', telOp([d(6), nie]), { oop: 6 })
  waar('en die som bly n getal', Number.isFinite(telOp([d(6), vuil, leeg, nie]).oop))
}

console.log('\n── Een veld, vir die e-boekblad ──\n')
{
  const d = n => ({ fields: { doen: { integerValue: String(n) } } })
  is('drie skerwe', telVeld([d(10), d(20), d(5)], 'doen'), 35)
  /* Val alles om, is die antwoord 0 en nooit NaN of undefined — die e-boekblad
     se getal mag nie 'n leë plek word nie. */
  is('niks', telVeld([], 'doen'), 0)
  is('n veld wat nie bestaan nie', telVeld([d(10)], 'niksie'), 0)
  is('rommel', telVeld(null, 'doen'), 0)
  is('n negatiewe som word nooit gewys nie',
     telVeld([{ fields: { doen: { integerValue: '-5' } } }], 'doen'), 0)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
