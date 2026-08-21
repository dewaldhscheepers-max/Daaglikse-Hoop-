/* Die teller-eindpunt met 'n vals Firestore agter hom.
 *
 * `_telSkerwe.toets.mjs` toets die somme. Hierdie leer toets die DRAAD: land
 * die skryf werklik op verskillende dokumente, en tel die lees werklik almal
 * op. Daardie twee dinge is waar 'n verspreide teller stil verkeerd gaan —
 * die somme kan perfek wees terwyl elke skryf steeds op een dokument land.
 *
 * Daar is geen egte netwerk hier nie; `fetch` word vervang.
 */
import crypto from 'node:crypto'

const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })
process.env.FIREBASE_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' })
process.env.FIREBASE_CLIENT_EMAIL = 'toets@voorbeeld.local'
process.env.FIREBASE_PROJECT_ID = 'toets-projek'
process.env.SORG_ADMIN_GEHEIM = 'n-lang-genoeg-geheim'

const { default: handler } = await import('./volg-jesus-telling.js')
const { default: skerwe } = await import('./_telSkerwe.js')
const { SKERWE, BASIS } = skerwe

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)

const WORTEL = 'projects/toets-projek/databases/(default)/documents'

/* Die vals Firestore. `berging` is 'n kaart van dokumentpad → velde. */
let berging = new Map()
let geskryf = []          /* elke skryf se dokumentpad, in volgorde */

globalThis.fetch = async (url, opsies = {}) => {
  const u = String(url)
  if (u.includes('oauth2.googleapis.com')) {
    return { ok: true, status: 200, json: async () => ({ access_token: 'vals' }) }
  }
  const lyf = opsies.body ? JSON.parse(opsies.body) : {}

  if (u.endsWith(':batchGet')) {
    return {
      ok: true, status: 200,
      json: async () => (lyf.documents || []).map(naam => {
        const pad = naam.slice(WORTEL.length + 1)
        const velde = berging.get(pad)
        return velde ? { found: { name: naam, fields: velde } } : { missing: naam }
      }),
    }
  }

  if (u.endsWith(':commit')) {
    for (const w of lyf.writes || []) {
      const pad = w.transform.document.slice(WORTEL.length + 1)
      geskryf.push(pad)
      const velde = berging.get(pad) || {}
      for (const t of w.transform.fieldTransforms || []) {
        const was = Number((velde[t.fieldPath] || {}).integerValue) || 0
        velde[t.fieldPath] = { integerValue: String(was + Number(t.increment.integerValue)) }
      }
      berging.set(pad, velde)
    }
    return { ok: true, status: 200, json: async () => ({}) }
  }
  throw new Error('onverwagte fetch: ' + u)
}

function antwoord() {
  const uit = { kode: 0, lyf: null, koppe: {} }
  return {
    res: {
      setHeader(k, v) { uit.koppe[k] = v },
      status(k) { uit.kode = k; return this },
      json(l) { uit.lyf = l; return this },
    },
    uit,
  }
}
const post = async lyf => {
  const { res, uit } = antwoord()
  await handler({ method: 'POST', body: lyf, headers: {} }, res)
  return uit
}
const kry = async (geheim = 'n-lang-genoeg-geheim') => {
  const { res, uit } = antwoord()
  await handler({ method: 'GET', headers: { 'x-sorg-geheim': geheim } }, res)
  return uit
}

console.log('\n── Die skryf land op VERSKILLENDE dokumente ──\n')
{
  berging = new Map(); geskryf = []
  for (let i = 0; i < 600; i++) await post({ ding: 'oop' })
  const uniek = new Set(geskryf)
  is('600 skrywes het geland', geskryf.length, 600)
  /* Dit is die hele punt. Land alles op een dokument, help die verspreiding
     niks en die bottelnek is presies waar hy was. */
  is(`hulle is oor al ${SKERWE} skerwe versprei`, uniek.size, SKERWE)
  waar('en die ou dokument is een van hulle', uniek.has(BASIS))
  /* Niemand mag meer as sowat 'n derde van die las kry nie — dan is die
     verspreiding skeef en die grootste skerf word weer die bottelnek. */
  const tel = {}
  for (const p of geskryf) tel[p] = (tel[p] || 0) + 1
  const grootste = Math.max(...Object.values(tel))
  waar(`die grootste skerf dra hoogstens n derde (${grootste}/600)`, grootste <= 200)
}

console.log('\n── En die lees tel hulle almal op ──\n')
{
  const uit = await kry()
  is('die admin kry 200', uit.kode, 200)
  /* 600 skrywes, versprei — die TOTAAL moet presies 600 wees. Word een skerf
     nie gelees nie, is hierdie getal te laag en niemand sou dit agterkom nie. */
  is('en die som is presies 600', uit.lyf.tellers.oop, 600)
}

console.log('\n── n Skerf wat nog nooit geskryf is nie, is NUL ──\n')
{
  berging = new Map(); geskryf = []
  /* Net EEN skryf: nege van die tien skerwe bestaan glad nie. */
  await post({ ding: 'doen' })
  const uit = await kry()
  is('die som is 1, nie n fout nie', uit.lyf.tellers.doen, 1)
  is('en niks anders is daar nie', Object.keys(uit.lyf.tellers).length, 1)
}

console.log('\n── Niks geskryf nie: nulle, nie n rooi blok nie ──\n')
{
  berging = new Map(); geskryf = []
  const uit = await kry()
  is('200', uit.kode, 200)
  is('en n lee stel tellers', uit.lyf.tellers, {})
}

console.log('\n── Die weeknommers tel saam met die totaal ──\n')
{
  berging = new Map(); geskryf = []
  for (let i = 0; i < 50; i++) await post({ ding: 'begin', week: 2 })
  const t = (await kry()).lyf.tellers
  is('die totaal', t.begin, 50)
  is('en die week s\'n', t.w2begin, 50)
}

console.log('\n── Die GET bly toe ──\n')
{
  const { res, uit } = antwoord()
  await handler({ method: 'GET', headers: {} }, res)
  is('sonder die geheim: 401', uit.kode, 401)
  is('en geen tellers', uit.lyf.tellers, undefined)
  const mis = await kry('verkeerde-geheim-hier')
  is('met die verkeerde geheim: 401', mis.kode, 401)
}

console.log('\n── n Onbekende gebeurtenis skryf NIKS ──\n')
{
  berging = new Map(); geskryf = []
  const uit = await post({ ding: '__proto__' })
  is('400', uit.kode, 400)
  is('en niks is geskryf nie', geskryf.length, 0)
  const leeg = await post({ ding: 'niksie' })
  is('n onbekende ding ook: 400', leeg.kode, 400)
  is('steeds niks geskryf nie', geskryf.length, 0)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
