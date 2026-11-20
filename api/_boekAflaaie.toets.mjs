/* node api/_boekAflaaie.toets.mjs — aflaaie per boek uit freeDownloads. */
import { createRequire } from 'module'
import crypto from 'crypto'
const req = createRequire(import.meta.url)
const { telPerBoek, isOud } = req('./_boekAflaaie.js')
let reg = 0, val = 0
const is = (n, kry, wag) => { if (JSON.stringify(kry) === JSON.stringify(wag)) reg++; else { val++; console.log(`  VAL  ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) } }
const d = id => ({ fields: { bookId: { stringValue: id }, email: { stringValue: 'x@y.z' } } })
is('leeg', telPerBoek([]), [])
is('niks', telPerBoek(undefined), [])
is('grootste eerste', telPerBoek([d('a'), d('b'), d('b'), d('c'), d('b'), d('c')]), [{ bookId: 'b', aantal: 3 }, { bookId: 'c', aantal: 2 }, { bookId: 'a', aantal: 1 }])
is('gelykop: alfabeties, altyd dieselfde orde', telPerBoek([d('z'), d('a')]), [{ bookId: 'a', aantal: 1 }, { bookId: 'z', aantal: 1 }])
is('dokument sonder bookId word oorgeslaan', telPerBoek([d('a'), { fields: {} }, {}, null, { fields: { bookId: { integerValue: '3' } } }]), [{ bookId: 'a', aantal: 1 }])
/* ── Wanneer is die gestoorde lys te oud? ── */
const N = Date.parse('2026-11-20T10:00:00Z')
is('vanoggend: nie oud', isOud('2026-11-20T01:00:00Z', N), false)
is('eergister: oud', isOud('2026-11-18T01:00:00Z', N), true)
is('geen datum: oud', isOud(undefined, N), true)
is('gemors: oud', isOud('gister', N), true)

/* ── Die oop eindpunt, met 'n vals Google en Firestore ── */
const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })
process.env.FIREBASE_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' })
process.env.FIREBASE_CLIENT_EMAIL = 'toets@example.com'
const topBoeke = req('./top-boeke.js')
async function roep(doc, leesStatus = 200) {
  const log = []
  globalThis.fetch = async (url, o = {}) => {
    const u = String(url); log.push((o.method || 'GET') + ' ' + u.split('/documents/')[1]?.split('?')[0])
    if (u.includes('oauth2')) return { ok: true, json: async () => ({ access_token: 't' }) }
    if (u.includes('berekening/topBoeke') && (o.method || 'GET') === 'GET')
      return doc ? { ok: true, status: 200, json: async () => doc } : { ok: false, status: leesStatus, json: async () => ({}) }
    if (u.includes('freeDownloads')) return { ok: true, json: async () => ({ documents: [
      { fields: { bookId: { stringValue: 'x' } } }, { fields: { bookId: { stringValue: 'x' } } }, { fields: { bookId: { stringValue: 'y' } } } ] }) }
    if (o.method === 'PATCH') return { ok: true, json: async () => ({}) }
    return { ok: false, status: 500, json: async () => ({}) }
  }
  let kop = {}, lyf
  await topBoeke({ method: 'GET' }, { setHeader: (k, v) => { kop[k] = v }, status: () => ({ json: j => { lyf = j } }) })
  return { log, kop, lyf }
}
const vars = { fields: { lys: { stringValue: JSON.stringify([{ bookId: 'rg', aantal: 712 }]) }, datum: { timestampValue: new Date().toISOString() } } }
let u = await roep(vars)
is('vars lys: net een lesing, geen hertelling', u.log.filter(l => l.includes('freeDownloads') || l.startsWith('PATCH')).length, 0)
is('vars lys: die boeke gaan uit', u.lyf.boeke, [{ bookId: 'rg', aantal: 712 }])
is('vars lys: die rand kas dit n uur', /s-maxage=3600/.test(u.kop['Cache-Control']), true)
const oud = { fields: { lys: vars.fields.lys, datum: { timestampValue: '2020-01-01T00:00:00Z' } } }
u = await roep(oud)
is('ou lys: tel weer en stoor', [u.log.some(l => l.includes('freeDownloads')), u.log.some(l => l.startsWith('PATCH'))], [true, true])
is('ou lys: die NUWE telling gaan uit', u.lyf.boeke, [{ bookId: 'x', aantal: 2 }, { bookId: 'y', aantal: 1 }])
u = await roep(null, 404)
is('nog nooit bereken: tel nou', u.lyf.boeke.length, 2)
u = await roep(null, 403)
is('Firestore weier: geen hertelling, leë lys', [u.log.some(l => l.includes('freeDownloads')), u.lyf.boeke], [false, []])
is('n leë antwoord word kort gekas', /s-maxage=60\b/.test(u.kop['Cache-Control']), true)
const ander = await topBoeke.call(null, { method: 'POST' }, { setHeader() {}, status: c => ({ json: () => c }) })
is('net GET', ander, 405)

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
