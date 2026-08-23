/* Die migrasie-eindpunt, met 'n vals Firestore.
 *
 * `sorgMigrasie.toets.mjs` toets die BESLUIT. Hierdie lêer toets die DRAAD:
 * dat die droëloop werklik niks skryf nie, dat 'n tweede druk niks verdubbel
 * nie, en dat die geheim werklik 'n hek is.
 *
 * Daar is geen egte Firestore hier nie — `fetch` word vervang, want ESM laat
 * 'n mens in elk geval nie 'n benoemde uitvoer vervang nie, en dit meet die
 * egte REST-pad wat op Vercel loop.
 */
import crypto from 'node:crypto'

const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })
process.env.FIREBASE_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' })
process.env.FIREBASE_CLIENT_EMAIL = 'toets@voorbeeld.local'
process.env.FIREBASE_PROJECT_ID = 'toets-projek'
process.env.SORG_ADMIN_GEHEIM = 'n-baie-lang-toetsgeheim'

const berging = new Map()          /* "versameling/id" → plat data */
let skryfFout = null               /* versameling waarvan die skryf omval */
let skryfTel = 0

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

  /* 'n LYS: /documents/<versameling>?pageSize=… */
  const lys = /\/documents\/([^/?]+)(\?|$)/.exec(u)
  if (lys && (opsies.method || 'GET') === 'GET') {
    const versameling = decodeURIComponent(lys[1])
    const documents = []
    for (const [k, v] of berging.entries()) {
      if (!k.startsWith(versameling + '/')) continue
      documents.push({ name: `x/${k}`, fields: naVelde(v) })
    }
    return { ok: true, status: 200, json: async () => ({ documents }) }
  }

  const m = /\/documents\/([^/?]+)\/([^/?]+)/.exec(u)
  if (!m) throw new Error('onverwagte fetch: ' + u)
  const versameling = decodeURIComponent(m[1])
  const id = decodeURIComponent(m[2])
  const sleutel = `${versameling}/${id}`

  if ((opsies.method || 'GET') === 'GET') {
    const d = berging.get(sleutel)
    if (!d) return { ok: false, status: 404, json: async () => ({}) }
    return { ok: true, status: 200, json: async () => ({ name: `x/${sleutel}`, fields: naVelde(d) }) }
  }

  if (opsies.method === 'PATCH') {
    skryfTel++
    if (skryfFout === versameling) return { ok: false, status: 500, text: async () => '' }
    const inkom = {}
    for (const [k, v] of Object.entries(JSON.parse(opsies.body).fields || {})) inkom[k] = uitVeld(v)
    const saamvoeg = /updateMask/.test(u)
    const was = berging.get(sleutel) || {}
    berging.set(sleutel, saamvoeg ? { ...was, ...inkom, id } : { ...inkom, id })
    return { ok: true, status: 200,
             json: async () => ({ name: `x/${sleutel}`, fields: naVelde(berging.get(sleutel)) }) }
  }
  throw new Error('onverwagte metode: ' + opsies.method)
}

const { default: migreer } = await import('./sorg-migreer.mjs')

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

async function loop({ droog = false, geheim = 'n-baie-lang-toetsgeheim' } = {}) {
  const { res, uit } = antwoord()
  await migreer({
    method: 'POST',
    headers: geheim ? { 'x-sorg-geheim': geheim } : {},
    query: droog ? { kyk: '1' } : {},
  }, res)
  return uit
}

const muurDokke = () => [...berging.entries()]
  .filter(([k]) => k.startsWith('sorg_muur/')).map(([, v]) => v)

function sitIn(n, ekstra = {}) {
  berging.set('sorg_inkomend/b' + n, {
    id: 'b' + n,
    teks: 'Storie nommer ' + n + ', lank genoeg om regtig iets te wees.',
    onderwerp: 'ander',
    dag: '2026-06-1' + (n % 10),
    geskep: '2026-06-1' + (n % 10) + 'T08:00:00.000Z',
    status: 'nuut',
    anoniem: true,
    toestemmings: { openbaar: true, redigeer: true },
    toestel: 'has-geheim-' + n,
    kode: 'ABCD-EFGH-IJK' + n,
    ...ekstra,
  })
}

console.log('\n── Die geheim is n HEK ──\n')
{
  berging.clear()
  sitIn(1)
  const sonder = await loop({ geheim: '' })
  is('sonder n geheim: 401', sonder.kode, 401)
  const verkeerd = await loop({ geheim: 'verkeerd' })
  is('met die verkeerde geheim: 401', verkeerd.kode, 401)
  is('en niks is geskryf nie', muurDokke().length, 0)
}

console.log('\n── Die DROELOOP skryf NIKS ──\n')
{
  berging.clear()
  for (let i = 1; i <= 5; i++) sitIn(i)
  berging.set('sorg_inkomend/b9', { id: 'b9', teks: 'x', toestemmings: {}, status: 'nuut' })

  skryfTel = 0
  const d = await loop({ droog: true })
  is('dit slaag', d.kode || 200, 200)
  is('dit sê dit is droog', d.lyf.droog, true)
  /* DIE toets. Nie een skryf nie. */
  is('geen enkele skryf', skryfTel, 0)
  is('en niks op die muur nie', muurDokke().length, 0)

  is('vyf gaan publiseer', d.lyf.gepubliseer, 5)
  is('een is uitgesluit', d.lyf.uitgesluit, 1)
  is('niks bestaan reeds nie', d.lyf.reedsDaar, 0)
  waar('met n rede daarby', Object.keys(d.lyf.redes).length > 0)

  /* Die rugsteun is die hele punt van "neem eers 'n rugsteun". */
  is('die rugsteun dra vyf plasings', d.lyf.rugsteun.length, 5)
  waar('met die volle teks in', /Storie nommer/.test(JSON.stringify(d.lyf.rugsteun)))
  /* En dit dra NIE die rou rekord se geheime nie. */
  const rou = JSON.stringify(d.lyf.rugsteun)
  for (const geheim of ['has-geheim-', 'ABCD-EFGH-IJK']) {
    is(`geen "${geheim}" in die rugsteun`, rou.includes(geheim), false)
  }
}

console.log('\n── Die EGTE lopie ──\n')
{
  berging.clear()
  for (let i = 1; i <= 4; i++) sitIn(i)
  const e = await loop()
  is('vier gepubliseer', e.lyf.gepubliseer, 4)
  is('vier op die muur', muurDokke().length, 4)
  is('niks het misluk nie', e.lyf.misluk, 0)
  is('en niks is oor nie', e.lyf.nogOor, 0)

  const m = muurDokke()[0]
  is('dit is gepubliseer', m.gepubliseer, true)
  is('dit is as gemigreer gemerk', m.gemigreer, true)
  waar('dit dra die oorspronklike datum', /^2026-06-1\d$/.test(m.datum))
  waar('en dit wys terug na sy bron', /^b\d$/.test(m.bronId))

  /* Die bron ken nou sy muur-plasing, sodat 'n tweede druk hom dadelik sien. */
  const bron = berging.get('sorg_inkomend/b1')
  is('die bron is gemerk', bron.status, 'gemigreer')
  waar('met die muur-id daarby', !!bron.muurId)
}

console.log('\n── TWEE keer druk maak GEEN duplikaat nie ──\n')
{
  /* Die duurste fout wat hierdie lopie kan maak. Vir die mens wat geskryf
     het, lyk dieselfde storie twee keer op die muur soos 'n lek. */
  berging.clear()
  for (let i = 1; i <= 3; i++) sitIn(i)
  await loop()
  is('die eerste lopie: drie', muurDokke().length, 3)

  const tweede = await loop()
  is('die tweede lopie publiseer NIKS', tweede.lyf.gepubliseer, 0)
  is('en tel hulle as "reeds daar"', tweede.lyf.reedsDaar, 3)
  is('daar is steeds net drie op die muur', muurDokke().length, 3)

  const derde = await loop()
  is('en n derde druk ook nie', muurDokke().length, 3)
  is('  → steeds nul nuwes', derde.lyf.gepubliseer, 0)
}

console.log('\n── Val n skryf om, gaan die res deur ──\n')
{
  /* Een mislukking mag nie die res kos nie — dieselfde reel as die
     e-poswerkry: een slegte adres mag nie 99 mense kos nie. */
  berging.clear()
  for (let i = 1; i <= 3; i++) sitIn(i)
  skryfFout = 'sorg_muur'
  const stukkend = await loop()
  skryfFout = null
  is('niks is geskryf nie', muurDokke().length, 0)
  is('en dit SE dit het misluk', stukkend.lyf.misluk, 3)
  is('en niks is as gepubliseer getel nie', stukkend.lyf.gepubliseer, 0)

  /* En daarna werk dieselfde knoppie. */
  const weer = await loop()
  is('n tweede druk werk', weer.lyf.gepubliseer, 3)
  is('en die muur het drie', muurDokke().length, 3)
}

console.log('\n── Wat NIE mag gaan nie, gaan nie ──\n')
{
  berging.clear()
  sitIn(1)                                        // gaan
  sitIn(2, { toestemmings: {} })                  // geen toestemming
  sitIn(3, { status: 'gevaar' })                  // krisis
  sitIn(4, { status: 'weg' })                     // Dewald het dit weggesteek
  sitIn(5, { spam: true })                        // spam
  sitIn(6, { gerapporteer: 2 })                   // gerapporteer
  sitIn(7, { teks: '   ' })                       // niks

  const d = await loop()
  is('net EEN gaan op', muurDokke().length, 1)
  is('en die res is uitgesluit', d.lyf.uitgesluit, 6)
  is('die een wat deurkom is die regte een', muurDokke()[0].bronId, 'b1')

  /* Elke rede staan uitgeskryf — "uitgesluit: 6" op sy eie is geen inligting. */
  waar('die redes is opgesom', Object.values(d.lyf.redes).reduce((a, b) => a + b, 0) === 6)
}

console.log('\n── Die rou rekord se geheime kom NIE op die muur nie ──\n')
{
  berging.clear()
  sitIn(1, { krisisWoorde: ['selfmoord'], toestemDatum: '2026-06-11' })
  await loop()
  const rou = JSON.stringify(muurDokke()[0])
  for (const geheim of ['has-geheim-1', 'ABCD-EFGH-IJK1', 'krisisWoorde', 'toestemDatum', 'kode']) {
    is(`geen "${geheim}"`, rou.includes(geheim), false)
  }
}

console.log('\n── n GROOT lopie word in hoppe gedoen ──\n')
{
  /* Vercel maak 'n funksie ná sy tydgrens dood. Die knoppie moet dus gedruk
     kan word totdat "nog oor" nul is. */
  berging.clear()
  for (let i = 1; i <= 130; i++) {
    berging.set('sorg_inkomend/x' + i, {
      id: 'x' + i, teks: 'Storie ' + i + ' met genoeg woorde daarin.',
      onderwerp: 'ander', dag: '2026-06-11', status: 'nuut', anoniem: true,
      toestemmings: { openbaar: true },
    })
  }
  const een = await loop()
  is('die eerste lopie doen 60', een.lyf.gepubliseer, 60)
  is('en sê hoeveel oor is', een.lyf.nogOor, 70)

  const twee = await loop()
  is('die tweede doen die volgende 60', twee.lyf.gepubliseer, 60)
  is('nog tien oor', twee.lyf.nogOor, 10)

  const drie = await loop()
  is('die derde maak klaar', drie.lyf.gepubliseer, 10)
  is('en niks is oor nie', drie.lyf.nogOor, 0)
  is('130 op die muur, geen duplikaat', muurDokke().length, 130)
  is('en 130 verskillende bronne', new Set(muurDokke().map(m => m.bronId)).size, 130)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
