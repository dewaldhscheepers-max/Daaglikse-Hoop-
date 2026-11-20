/* node api/_boekAflaaie.toets.mjs — aflaaie per boek uit freeDownloads. */
import { createRequire } from 'module'
const { telPerBoek } = createRequire(import.meta.url)('./_boekAflaaie.js')
let reg = 0, val = 0
const is = (n, kry, wag) => { if (JSON.stringify(kry) === JSON.stringify(wag)) reg++; else { val++; console.log(`  VAL  ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) } }
const d = id => ({ fields: { bookId: { stringValue: id }, email: { stringValue: 'x@y.z' } } })
is('leeg', telPerBoek([]), [])
is('niks', telPerBoek(undefined), [])
is('grootste eerste', telPerBoek([d('a'), d('b'), d('b'), d('c'), d('b'), d('c')]), [{ bookId: 'b', aantal: 3 }, { bookId: 'c', aantal: 2 }, { bookId: 'a', aantal: 1 }])
is('gelykop: alfabeties, altyd dieselfde orde', telPerBoek([d('z'), d('a')]), [{ bookId: 'a', aantal: 1 }, { bookId: 'z', aantal: 1 }])
is('dokument sonder bookId word oorgeslaan', telPerBoek([d('a'), { fields: {} }, {}, null, { fields: { bookId: { integerValue: '3' } } }]), [{ bookId: 'a', aantal: 1 }])
console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
