/* node src/data/engelseBoekeOpenbaar.toets.mjs */
import { openbareEngelseBoeke, VELDE } from './engelseBoekeOpenbaar.js'
let reg = 0, val = 0
const is = (n, k, w) => { if (JSON.stringify(k) === JSON.stringify(w)) reg++; else { val++; console.log(`  VAL ${n}\n    kry: ${JSON.stringify(k)}\n    wag: ${JSON.stringify(w)}`) } }

const rou = [
  { id: 'a', title: 'Boundaries', taal: 'en', desc: 'D', coverUrl: 'c', pdfUrl: 'p', luisterTeks: 'X'.repeat(9999), luisterStatus: 'gereed', geheim: 's' },
  { id: 'b', title: 'Bid Nou', pdfUrl: 'p' },                 /* Afrikaans (geen taal) */
  { id: 'c', title: 'Old', taal: 'af' },
  { id: 'd', taal: 'en' },                                    /* geen titel */
  { id: 'e', title: 'Engels', taal: 'English', createdAt: '2026-10-09T10:00:00Z' },
  null,
]
const uit = openbareEngelseBoeke(rou)
is('net Engelse boeke met n titel', uit.map(b => b.id), ['a', 'e'])
is('witlys: luisterTeks en geheime velde gaan NIE oor die draad nie', Object.keys(uit[0]).sort(), ['coverUrl', 'desc', 'id', 'pdfUrl', 'taal', 'title'])
is('createdAt bly vir die volgorde', uit[1].createdAt, '2026-10-09T10:00:00Z')
is('gemors gee leeg', openbareEngelseBoeke(null), [])
is('geen interne veld in die witlys', VELDE.some(v => /luister|geheim|epos|email/i.test(v)), false)
console.log(`\n${reg} reg, ${val} vals\n`)
if (val) process.exit(1)
