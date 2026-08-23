/* 'n Plasing gaan DADELIK op die muur — behalwe by krisis.
 *
 * Dewald, 23 Augustus 2026: "ek wil nie alles heeltyd na gaan nie die
 * gemeenskap moet mekaar dra... ek antwoord net nou en dan boodskappe. mense
 * moet kan report."
 *
 * Elke plasing het gewag totdat hy dit met die hand gelees en 'n knoppie
 * gedruk het. Dit was die bottelnek: die blad kon nooit vinniger loop as een
 * mens se aande nie.
 *
 * Die EEN ding wat hierdie verandering kan laat skade doen, is 'n storie oor
 * selfmoordgedagtes wat outomaties openbaar gaan. Daarom is die helfte van
 * hierdie leer oor daardie geval.
 *
 * Daar is geen egte Firestore hier nie — die bergingslaag word vervang.
 */
import crypto from 'node:crypto'

const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })
process.env.FIREBASE_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' })
process.env.FIREBASE_CLIENT_EMAIL = 'toets@voorbeeld.local'
process.env.FIREBASE_PROJECT_ID = 'toets-projek'

/* ── Die vals Firestore ───────────────────────────────────────────────
 *
 * Ons vervang `fetch`, nie die module se uitvoere nie. ESM laat 'n mens in
 * elk geval nie 'n benoemde uitvoer vervang nie — en dit is boonop die
 * eerliker toets, want dit meet die egte REST-pad wat op Vercel loop. */
const berging = new Map()   /* "versameling/id" → plat data */
let skryfFout = null

const uitVeld = v => {
  if (!v) return null
  if ('stringValue' in v) return v.stringValue
  if ('integerValue' in v) return Number(v.integerValue)
  if ('doubleValue' in v) return Number(v.doubleValue)
  if ('booleanValue' in v) return v.booleanValue
  if ('timestampValue' in v) return v.timestampValue
  if ('nullValue' in v) return null
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(uitVeld)
  if ('mapValue' in v) {
    const o = {}
    for (const [k, x] of Object.entries(v.mapValue.fields || {})) o[k] = uitVeld(x)
    return o
  }
  return null
}
const naVeld = w => {
  if (w === null || w === undefined) return { nullValue: null }
  if (typeof w === 'string') return { stringValue: w }
  if (typeof w === 'boolean') return { booleanValue: w }
  if (typeof w === 'number') return Number.isInteger(w)
    ? { integerValue: String(w) } : { doubleValue: w }
  if (w instanceof Date) return { timestampValue: w.toISOString() }
  if (Array.isArray(w)) return { arrayValue: { values: w.map(naVeld) } }
  const fields = {}
  for (const [k, x] of Object.entries(w)) fields[k] = naVeld(x)
  return { mapValue: { fields } }
}
const naVelde = o => {
  const f = {}
  for (const [k, w] of Object.entries(o)) f[k] = naVeld(w)
  return f
}

globalThis.fetch = async (url, opsies = {}) => {
  const u = String(url)
  if (u.includes('oauth2.googleapis.com')) {
    return { ok: true, status: 200, json: async () => ({ access_token: 'vals' }) }
  }
  const m = /\/documents\/([^/?]+)\/([^/?]+)/.exec(u)
  if (!m) throw new Error('onverwagte fetch: ' + u)
  const versameling = decodeURIComponent(m[1])
  const id = decodeURIComponent(m[2])
  const sleutel = `${versameling}/${id}`

  if ((opsies.method || 'GET') === 'GET') {
    const d = berging.get(sleutel)
    if (!d) return { ok: false, status: 404, json: async () => ({}) }
    return { ok: true, status: 200,
             json: async () => ({ name: `x/${sleutel}`, fields: naVelde(d) }) }
  }

  if (opsies.method === 'PATCH') {
    if (skryfFout === versameling) return { ok: false, status: 500, text: async () => '' }
    const inkom = {}
    for (const [k, v] of Object.entries(JSON.parse(opsies.body).fields || {})) {
      inkom[k] = uitVeld(v)
    }
    /* 'n updateMask beteken saamvoeg; sonder een word alles vervang. */
    const saamvoeg = /updateMask/.test(u)
    const was = berging.get(sleutel) || {}
    berging.set(sleutel, saamvoeg ? { ...was, ...inkom, id } : { ...inkom, id })
    return { ok: true, status: 200,
             json: async () => ({ name: `x/${sleutel}`, fields: naVelde(berging.get(sleutel)) }) }
  }
  throw new Error('onverwagte metode: ' + opsies.method)
}

const { default: stuur } = await import('./sorg-stuur.mjs')

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)

function antwoord() {
  const uit = { kode: 0, lyf: null }
  return {
    res: {
      setHeader() {}, end() { return this },
      status(k) { uit.kode = k; return this },
      json(l) { uit.lyf = l; return this },
    },
    uit,
  }
}

async function plaas(teks, toestel = 't1') {
  const { res, uit } = antwoord()
  await stuur({
    method: 'POST',
    headers: {},
    body: { teks, onderwerp: 'ander', toestel, toestemmings: { openbaar: true } },
  }, res)
  return uit
}

const muurDokke = () => [...berging.entries()]
  .filter(([k]) => k.startsWith('sorg_muur/')).map(([, v]) => v)
const inkomendes = () => [...berging.entries()]
  .filter(([k]) => k.startsWith('sorg_inkomend/')).map(([, v]) => v)

const GEWOON = 'My seun praat al agt maande nie met my nie en ek weet nie meer wat om te doen nie.'
const KRISIS = 'Ek wil nie meer lewe nie. Ek dink elke dag daaraan om myself dood te maak.'

console.log('\n── n Gewone plasing gaan DADELIK op ──\n')
{
  berging.clear()
  const uit = await plaas(GEWOON)
  is('dit is aanvaar', uit.lyf && uit.lyf.ok, true)
  is('en die skerm weet dit is op', uit.lyf.opDieMuur, true)

  const muur = muurDokke()
  is('daar is EEN plasing op die muur', muur.length, 1)
  is('met die mens se woorde', muur[0].teks, GEWOON)
  is('dit is gepubliseer', muur[0].gepubliseer, true)
  is('niemand dra dit nog nie', muur[0].saam, 0)
  is('geen antwoord nie', muur[0].antwoord, null)
  is('geen rapporte nie', muur[0].rapporte, 0)
  /* Vrye woorde is oop op 'n gewone storie. */
  is('nie sensitief nie', muur[0].sensitief, false)

  /* Die muur is ALTYD anoniem, ook nou dat niemand dit met die hand nagaan. */
  is('geen naam op die muur', muur[0].naam, '')
  waar('en geen toestel-id daarby', !JSON.stringify(muur[0]).includes('t1'))

  const ink = inkomendes()
  is('die rou boodskap bly staan', ink.length, 1)
  is('en dit is as OUTO gemerk', ink[0].status, 'outo')
  waar('met die muur-id daarby', !!ink[0].muurId)
  is('en hulle wys na mekaar', muur[0].bronId, ink[0].id)
}

console.log('\n── n KRISIS gaan NIE vanself op nie ──\n')
{
  berging.clear()
  const uit = await plaas(KRISIS)
  is('dit is aanvaar', uit.lyf && uit.lyf.ok, true)
  is('die skerm weet dit is n krisis', uit.lyf.krisis, true)
  /* DIE toets. 'n Storie oor selfmoordgedagtes mag nooit outomaties openbaar
     gaan nie — dit is die een geval waar hierdie hele verandering skade kan
     doen. */
  is('en dit is NIE op die muur nie', uit.lyf.opDieMuur, false)
  is('daar is niks op die muur nie', muurDokke().length, 0)

  const ink = inkomendes()
  is('dit wag in die GEVAAR-hopie', ink[0].status, 'gevaar')
  waar('en dit dra die krisiswoorde', (ink[0].krisisWoorde || []).length > 0)
  waar('geen muur-id nie', !ink[0].muurId)
}

console.log('\n── Val die muur-skryf om, is die boodskap NIE verlore nie ──\n')
{
  berging.clear()
  skryfFout = 'sorg_muur'
  const uit = await plaas(GEWOON)
  skryfFout = null
  /* Die mens mag NOOIT 'n fout sien omdat ons interne skryf misluk het nie.
     Sy woorde is veilig; Dewald plaas dit self. */
  is('die indiening slaag steeds', uit.lyf && uit.lyf.ok, true)
  is('maar die skerm lieg nie', uit.lyf.opDieMuur, false)
  is('niks op die muur nie', muurDokke().length, 0)
  const ink = inkomendes()
  is('en die boodskap staan in die hopie', ink.length, 1)
  is('as NUUT, sodat hy dit sien', ink[0].status, 'nuut')
}

console.log('\n── Elke plasing kry sy EIE muur-id ──\n')
{
  berging.clear()
  await plaas(GEWOON, 't1')
  await plaas('Ek het my werk verloor en weet nie hoe om vir my vrou te sê nie.', 't2')
  const muur = muurDokke()
  is('twee plasings', muur.length, 2)
  is('twee verskillende ids', new Set(muur.map(m => m.id)).size, 2)
  is('en twee verskillende bronne', new Set(muur.map(m => m.bronId)).size, 2)
}

console.log('\n── Wat NOOIT op die muur mag beland nie ──\n')
{
  berging.clear()
  await plaas(GEWOON, 'toestel-abc-123')
  const rou = JSON.stringify(muurDokke()[0])
  for (const geheim of ['toestel-abc-123', 'kode', 'toestemDatum', 'krisisWoorde']) {
    is(`geen "${geheim}" op die muur`, rou.includes(geheim), false)
  }
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
