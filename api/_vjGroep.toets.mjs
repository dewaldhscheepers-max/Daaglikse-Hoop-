/* Die groep-eindpunt, met 'n vals Firestore agter hom.
 *
 * Dewald: "daar is GEEN PLEKKE VIR FOUTE NIE." Hierdie leer is waar die
 * sekuriteit gemeet word, en dit probeer werklik inbreek:
 *
 *   · sonder token, met 'n vervalste token, met 'n verlope token;
 *   · met 'n uid uit die LIGGAAM in plaas van uit die token;
 *   · iemand wat homself 'n fasiliteerder wil maak;
 *   · iemand wat 'n ander groep se lede wil verwyder;
 *   · 'n kode wat geraai word, oor en oor.
 *
 * Die token-verifikasie word NIE afgeskakel nie. Ons maak 'n egte RSA-sleutel,
 * teken 'n egte JWT, en gee die vals "Google" die publieke sleutel terug. Wat
 * hier deurkom, kom deur die regte pad.
 */
import crypto from 'node:crypto'

const PROJEK = 'toets-projek'
process.env.FIREBASE_PROJECT_ID = PROJEK
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })
process.env.FIREBASE_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' })
process.env.FIREBASE_CLIENT_EMAIL = 'toets@voorbeeld.local'

const KID = 'toets-kid'
const PUB = publicKey.export({ type: 'spki', format: 'pem' })

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)

/* ── 'n Egte ID-token vir 'n toets-uid ── */
function maakToken(uid, { verval = false, verkeerdeProjek = false, verkeerdeSleutel = false } = {}) {
  const nou = Math.floor(Date.now() / 1000)
  const kop = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: KID })).toString('base64url')
  const eis = Buffer.from(JSON.stringify({
    sub: uid,
    aud: verkeerdeProjek ? 'ander-projek' : PROJEK,
    iss: `https://securetoken.google.com/${verkeerdeProjek ? 'ander-projek' : PROJEK}`,
    iat: nou - 60,
    exp: verval ? nou - 10 : nou + 3600,
  })).toString('base64url')
  const teken = crypto.createSign('RSA-SHA256')
  teken.update(`${kop}.${eis}`)
  const sleutel = verkeerdeSleutel
    ? crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey
    : privateKey
  return `${kop}.${eis}.${teken.sign(sleutel, 'base64url')}`
}

/* ── Die vals Firestore ──
 *
 * 'n Plat kaart van pad → data, met net genoeg REST-gedrag om die eindpunt
 * eerlik te toets: 404 vir wat nie bestaan nie, en 'n runQuery wat op die kode
 * soek. */
let winkel = new Map()

const inW = v => {
  if (v === null || v === undefined) return { nullValue: null }
  if (v instanceof Date) return { timestampValue: v.toISOString() }
  if (typeof v === 'boolean') return { booleanValue: v }
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v }
  if (Array.isArray(v)) return { arrayValue: { values: v.map(inW) } }
  if (typeof v === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, inW(x)])) } }
  return { stringValue: String(v) }
}
const dokUit = (pad, data) => ({
  name: `projects/${PROJEK}/databases/(default)/documents/${pad}`,
  fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, inW(v)])),
})
const uitW = v => {
  if ('stringValue' in v) return v.stringValue
  if ('booleanValue' in v) return v.booleanValue
  if ('integerValue' in v) return Number(v.integerValue)
  /* Firestore gee 'n Date terug as `timestampValue`. Sonder hierdie reël het
     die vals winkel elke tydstempel na `null` verander — en dan lyk die
     raai-teller se venster elke keer leeg en blokkeer nooit. Dit was 'n fout
     in die TOETS, maar dit sou 'n egte fout perfek weggesteek het. */
  if ('timestampValue' in v) return v.timestampValue
  if ('doubleValue' in v) return v.doubleValue
  if ('nullValue' in v) return null
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(uitW)
  return null
}

const WORTEL = `https://firestore.googleapis.com/v1/projects/${PROJEK}/databases/(default)/documents`

globalThis.fetch = async (url, opsies = {}) => {
  const u = String(url)
  const ok = (body, status = 200) => ({ ok: status < 400, status, json: async () => body, text: async () => JSON.stringify(body), headers: new Map() })

  if (u.includes('securetoken@system')) {
    return { ok: true, status: 200, json: async () => ({ [KID]: PUB }), headers: { get: () => 'max-age=3600' } }
  }
  if (u.includes('oauth2.googleapis.com')) return ok({ access_token: 'diens-teken' })

  if (u.endsWith(':runQuery')) {
    const q = JSON.parse(opsies.body).structuredQuery
    const filters = q.where.compositeFilter.filters
    const kode = filters[0].fieldFilter.value.stringValue
    for (const [pad, data] of winkel) {
      if (!/^vjGroepe\/[^/]+$/.test(pad)) continue
      if (data.kode === kode && data.kodeAan === true) return ok([{ document: dokUit(pad, data) }])
    }
    return ok([{}])
  }

  const pad = decodeURIComponent(u.replace(WORTEL + '/', '').split('?')[0])
  const metode = (opsies.method || 'GET').toUpperCase()

  if (metode === 'GET') {
    /* 'n Lys? */
    if (!winkel.has(pad) && /^vjGroepe\/[^/]+\/lede$/.test(pad)) {
      const uit = []
      for (const [p, d] of winkel) if (p.startsWith(pad + '/')) uit.push(dokUit(p, d))
      return ok({ documents: uit })
    }
    if (!winkel.has(pad)) return ok({}, 404)
    return ok(dokUit(pad, winkel.get(pad)))
  }
  if (metode === 'PATCH') {
    const nuut = Object.fromEntries(Object.entries(JSON.parse(opsies.body).fields).map(([k, v]) => [k, uitW(v)]))
    const maskers = u.includes('updateMask')
    winkel.set(pad, maskers ? { ...(winkel.get(pad) || {}), ...nuut } : nuut)
    return ok(dokUit(pad, winkel.get(pad)))
  }
  return ok({}, 400)
}

const { default: handler } = await import('./vj-groep.mjs')

async function roep(uid, lyf, opsies = {}) {
  let status = 0, uit = null
  const res = {
    setHeader: () => {}, status(k) { status = k; return this }, json(j) { uit = j; return this },
  }
  const koppe = {}
  if (uid) koppe.authorization = `Bearer ${opsies.rouToken || maakToken(uid, opsies)}`
  await handler({ method: 'POST', headers: koppe, body: lyf }, res)
  /* `status` staan APART van die liggaam. Die eindpunt gee self 'n veld wat
     `kode` heet — die groepkode — en 'n plat spreier het die HTTP-status
     daarmee oorgeskryf. */
  return { status, ...(uit || {}) }
}

/* ══════════════════════════════════════════════════════════════════ */
console.log('\n── Sonder n geldige token kom niemand in nie ──\n')
is('geen token', (await roep(null, { doen: 'myne' })).status, 401)
is('n verlope token', (await roep('a', { doen: 'myne' }, { verval: true })).status, 401)
is('n token vir n ANDER projek', (await roep('a', { doen: 'myne' }, { verkeerdeProjek: true })).status, 401)
is('n token wat met n ander sleutel geteken is', (await roep('a', { doen: 'myne' }, { verkeerdeSleutel: true })).status, 401)
is('rommel in plaas van n token', (await roep('a', { doen: 'myne' }, { rouToken: 'nee.wat.nie' })).status, 401)
is('n token sonder handtekening', (await roep('a', { doen: 'myne' }, { rouToken: 'aaa.bbb' })).status, 401)

console.log('\n── n Groep skep ──\n')
winkel = new Map()
const skep = await roep('dewald', { doen: 'skep', naam: 'Fontana Jongmense', gemeente: 'Fontana', vertoonnaam: 'Dewald' })
is('dit werk', skep.status, 200)
waar('daar is n groep-id', !!skep.groep.id)
waar('en n geldige kode', /^[A-Z]{2}[0-9]{4}$/.test(skep.groep.kode))
is('die skepper is die eienaar', skep.groep.eienaar, 'dewald')
is('en n fasiliteerder', winkel.get(`vjGroepe/${skep.groep.id}/lede/dewald`).rol, 'fasiliteerder')
is('en aktief', winkel.get(`vjGroepe/${skep.groep.id}/lede/dewald`).status, 'aktief')
is('elke lid mag by verstek nooi', winkel.get(`vjGroepe/${skep.groep.id}`).ledeMagNooi, true)
const GID = skep.groep.id
const KODE = skep.groep.kode

console.log('\n── n Slegte naam kom nie deur nie ──\n')
is('te kort', (await roep('x', { doen: 'skep', naam: 'FJ', vertoonnaam: 'X' })).status, 400)
is('geen vertoonnaam', (await roep('x', { doen: 'skep', naam: 'Goeie Groep', vertoonnaam: '' })).status, 400)

console.log('\n── Kyk wat agter die kode is ──\n')
const kyk = await roep('maria', { doen: 'kyk', kode: KODE })
is('dit werk', kyk.status, 200)
is('die naam', kyk.groep.naam, 'Fontana Jongmense')
is('die fasiliteerder', kyk.groep.fasiliteerder, 'Dewald')
is('een lid', kyk.groep.aantalLede, 1)
is('n verkeerde kode se niks oor die groep nie', (await roep('maria', { doen: 'kyk', kode: 'ZZ9999' })).status, 404)
is('n stukkende kode', (await roep('maria', { doen: 'kyk', kode: 'nee' })).status, 400)

console.log('\n── Sluit aan ──\n')
const aan = await roep('maria', { doen: 'sluitaan', kode: KODE, vertoonnaam: 'Maria' })
is('dit werk', aan.status, 200)
is('sy is n DEELNEMER, nie n fasiliteerder nie', winkel.get(`vjGroepe/${GID}/lede/maria`).rol, 'deelnemer')
is('en nou is daar twee lede', aan.groep.aantalLede, 2)

console.log('\n── Die uid kom uit die TOKEN, nooit uit die liggaam nie ──\n')
/* Dewald se §15. Iemand stuur 'n ander se uid saam en hoop dit tel. */
await roep('indringer', { doen: 'sluitaan', kode: KODE, vertoonnaam: 'Indringer', uid: 'dewald', user_id: 'dewald' })
is('die liggaam se uid word geignoreer', winkel.get(`vjGroepe/${GID}/lede/indringer`).naam, 'Indringer')
is('en Dewald se rol is onaangeraak', winkel.get(`vjGroepe/${GID}/lede/dewald`).rol, 'fasiliteerder')
is('die indringer is nie n fasiliteerder nie', winkel.get(`vjGroepe/${GID}/lede/indringer`).rol, 'deelnemer')

console.log('\n── Niemand maak homself n fasiliteerder nie ──\n')
is('n deelnemer probeer', (await roep('maria', { doen: 'rol', groepId: GID, uid: 'maria', rol: 'fasiliteerder' })).status, 403)
is('en sy rol het nie verander nie', winkel.get(`vjGroepe/${GID}/lede/maria`).rol, 'deelnemer')
is('die eienaar mag wel', (await roep('dewald', { doen: 'rol', groepId: GID, uid: 'maria', rol: 'fasiliteerder' })).status, 200)
is('en dan is sy een', winkel.get(`vjGroepe/${GID}/lede/maria`).rol, 'fasiliteerder')
is('die eienaar kan nie sy eie fasiliteerderskap afhaal nie',
   (await roep('dewald', { doen: 'rol', groepId: GID, uid: 'dewald', rol: 'deelnemer' })).status, 409)

console.log('\n── Verwyder ──\n')
is('n deelnemer mag nie verwyder nie',
   (await roep('indringer', { doen: 'verwyder', groepId: GID, uid: 'maria' })).status, 403)
is('n fasiliteerder mag', (await roep('maria', { doen: 'verwyder', groepId: GID, uid: 'indringer' })).status, 200)
is('en dan is hy verwyder', winkel.get(`vjGroepe/${GID}/lede/indringer`).status, 'verwyder')
is('wie verwyder is, kom nie weer in nie',
   (await roep('indringer', { doen: 'sluitaan', kode: KODE, vertoonnaam: 'Indringer' })).status, 403)
is('die eienaar kan nie verwyder word nie',
   (await roep('maria', { doen: 'verwyder', groepId: GID, uid: 'dewald' })).status, 409)

console.log('\n── Verlaat ──\n')
is('die eienaar met ander lede mag nie', (await roep('dewald', { doen: 'verlaat', groepId: GID })).status, 409)
is('n gewone lid mag', (await roep('maria', { doen: 'verlaat', groepId: GID })).status, 200)
is('en dan is sy weg', winkel.get(`vjGroepe/${GID}/lede/maria`).status, 'weg')
is('die eienaar alleen mag nou', (await roep('dewald', { doen: 'verlaat', groepId: GID })).status, 200)
is('en die groep is geargiveer', !!winkel.get(`vjGroepe/${GID}`).geargiveer, true)
is('n geargiveerde groep se kode werk nie meer nie',
   (await roep('nuwe', { doen: 'kyk', kode: KODE })).status, 404)

console.log('\n── Die kode roteer ──\n')
winkel = new Map()
const g2 = (await roep('dewald', { doen: 'skep', naam: 'Tweede Groep', vertoonnaam: 'Dewald' })).groep
await roep('maria', { doen: 'sluitaan', kode: g2.kode, vertoonnaam: 'Maria' })
is('n gewone lid mag nie roteer nie', (await roep('maria', { doen: 'kode', groepId: g2.id })).status, 403)
const nuweKode = await roep('dewald', { doen: 'kode', groepId: g2.id })
is('die eienaar mag', nuweKode.status, 200)
waar('en die nuwe kode verskil', nuweKode.kode !== g2.kode)
is('die OU kode werk nie meer nie', (await roep('nuwe', { doen: 'kyk', kode: g2.kode })).status, 404)
is('maar die lede bly', winkel.get(`vjGroepe/${g2.id}/lede/maria`).status, 'aktief')
is('en die kode kan afgeskakel word', (await roep('dewald', { doen: 'kode', groepId: g2.id, aan: false })).kodeAan, false)

console.log('\n── n Kode kan nie geraai word nie ──\n')
winkel = new Map()
const g3 = (await roep('dewald', { doen: 'skep', naam: 'Derde Groep', vertoonnaam: 'Dewald' })).groep
let geblok = 0
for (let i = 0; i < 14; i++) {
  const r = await roep('raaier', { doen: 'kyk', kode: `ZZ${String(1000 + i)}` })
  if (r.status === 429) geblok++
}
waar('na n paar pogings word dit geblokkeer', geblok > 0)
is('en dan kom die REGTE kode ook nie deur nie — die venster is per mens',
   (await roep('raaier', { doen: 'kyk', kode: g3.kode })).status, 429)
is('maar iemand anders kom steeds in',
   (await roep('onskuldig', { doen: 'kyk', kode: g3.kode })).status, 200)

console.log('\n── My groepe kom terug na n herinstallasie ──\n')
const myne = await roep('dewald', { doen: 'myne' })
is('dit werk', myne.status, 200)
is('een groep', myne.groepe.length, 1)
is('en die rol is reg', myne.groepe[0].myRol, 'fasiliteerder')
is('iemand sonder groepe kry n lee lys', (await roep('vreemdeling', { doen: 'myne' })).groepe, [])

console.log('\n── n Onbekende versoek ──\n')
is('word geweier', (await roep('dewald', { doen: 'iets-anders' })).status, 400)
is('n leë liggaam ook', (await roep('dewald', null)).status, 400)

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
