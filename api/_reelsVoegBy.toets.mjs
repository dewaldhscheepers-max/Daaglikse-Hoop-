/* Die klomp-oplosser, met 'n vals TikTok EN 'n vals Firestore agter hom.
 *
 * Dewald het 124 kort skakels aanmekaar geplak. Vier dinge moet hier vashou, en
 * elkeen sou stilweg skade doen:
 *
 *   · dit werk in HAPPE. Honderd-vier-en-twintig netwerk-versoeke in een
 *     Vercel-funksie is die oggendkennisgewing se fout, weer;
 *   · 'n clip sonder die maker se HANDVATSEL word NIE geskryf nie. Erkenning is
 *     'n hek, en 'n naamlose clip sou in elk geval nooit wys nie;
 *   · die skryf is 'n `update` met 'n MASKER. Sonder dit sit 'n tweede lopie
 *     elke `gedeel`-telling op nul en die "mees gedeelde bo"-rangorde is weg;
 *   · een stukkende skakel mag nie die ander 23 kos nie.
 *
 * Loop met:  node api/_reelsVoegBy.toets.mjs
 */
import crypto from 'node:crypto'

const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })
process.env.FIREBASE_CLIENT_EMAIL = 'toets@voorbeeld.com'
process.env.FIREBASE_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' }).replace(/\n/g, '\\n')
process.env.FIREBASE_PROJECT_ID = 'toets-projek'
process.env.SORG_ADMIN_GEHEIM = 'n-geheim-wat-lank-genoeg-is'

const { default: handler, MAKS_PER_HAP } = await import('./reels-voeg-by.mjs')

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}

function maakRes() {
  const r = { kode: 0, lyf: null, koppe: {} }
  r.status = k => { r.kode = k; return r }
  r.json = b => { r.lyf = b; return r }
  r.setHeader = (k, v) => { r.koppe[k] = v }
  return r
}

const kort = (k) => `https://vt.tiktok.com/${k}/`
const lank = (h, id) => `https://www.tiktok.com/@${h}/video/${id}`
const ID = (n) => String(7412345678901234567n + BigInt(n))

/* Die vals wêreld. `wys` sê waarheen elke kort kode herlei; `bestaan` is wat al
   in Firestore is. */
function saai({ wys = {}, bestaan = [], gooiSkryf = false } = {}) {
  const gesien = { gehaal: [], commits: [], batchGet: [] }
  globalThis.fetch = async (adres, opsies) => {
    const u = String(adres)

    if (u.includes('oauth2.googleapis.com')) {
      return { ok: true, json: async () => ({ access_token: 'teken' }) }
    }
    if (u.includes(':batchGet')) {
      const lyf = JSON.parse(opsies.body)
      gesien.batchGet.push(lyf.documents)
      return {
        ok: true,
        json: async () => lyf.documents.map(naam => {
          const id = naam.split('/').pop()
          return bestaan.includes(id) ? { found: { name: naam } } : { missing: naam }
        }),
      }
    }
    if (u.includes(':commit')) {
      if (gooiSkryf) return { ok: false, status: 503 }
      gesien.commits.push(JSON.parse(opsies.body))
      return { ok: true, json: async () => ({}) }
    }

    /* TikTok. */
    gesien.gehaal.push(u)
    const kode = (u.match(/vt\.tiktok\.com\/([A-Za-z0-9]+)/) || [])[1]
    const na = wys[kode] || null
    return { headers: { get: k => (k.toLowerCase() === 'location' ? na : null) } }
  }
  return gesien
}

async function loop(lyf, opsies = {}) {
  const gesien = saai(opsies)
  const res = maakRes()
  await handler({
    method: opsies.method || 'POST',
    headers: opsies.geenGeheim ? {} : { 'x-sorg-geheim': 'n-geheim-wat-lank-genoeg-is' },
    body: lyf,
    query: {},
  }, res)
  return { res, gesien }
}

console.log('\n── Die slot ──')
{
  const { res, gesien } = await loop({ skakels: [kort('AAA111222')] }, { geenGeheim: true })
  is('sonder n geheim: 401', res.kode, 401)
  is('en niks is gehaal nie', gesien.gehaal.length, 0)
}
{
  const { res } = await loop({ skakels: [kort('AAA111222')] }, { method: 'GET' })
  is('GET: 405', res.kode, 405)
}

console.log('\n── Die gelukkige pad ──')
{
  const { res, gesien } = await loop(
    { skakels: [kort('AAA111222'), kort('BBB333444')] },
    { wys: { AAA111222: lank('ds.jan', ID(1)), BBB333444: lank('tannie.mar', ID(2)) } }
  )
  is('200', res.kode, 200)
  is('twee clips', res.lyf.gedoen.length, 2)
  is('niks misluk', res.lyf.misluk, [])
  is('niks oor', res.lyf.oor, 0)
  const name = res.lyf.gedoen.map(g => g.naam).sort()
  is('die MAKERS se name is die clips se name', name, ['@ds.jan', '@tannie.mar'])
  is('die id is die post-id', res.lyf.gedoen.map(g => g.id).sort(), [ID(1), ID(2)].sort())

  const w = gesien.commits[0].writes
  is('twee skrywes', w.length, 2)
  is('op die reels-versameling', /\/documents\/reels\//.test(w[0].update.name), true)
  is('bron is tiktok', w[0].update.fields.bron.stringValue, 'tiktok')
  /* Die MASKER is die belangrike helfte: sonder hom word `gedeel` uitgevee. */
  is('daar is n updateMask', Array.isArray(w[0].updateMask.fieldPaths), true)
  is('en die masker noem NIE gedeel nie', w[0].updateMask.fieldPaths.includes('gedeel'), false)
  is('n nuwe clip kry n datum', w[0].updateMask.fieldPaths.includes('datum'), true)
}

console.log('\n── Erkenning is n HEK ──')
{
  /* Die skakel los op, maar die adres dra geen @handvatsel nie. Daardie clip mag
     NIE geskryf word nie — hy sou in elk geval nooit wys nie. */
  const { res, gesien } = await loop(
    { skakels: [kort('AAA111222')] },
    { wys: { AAA111222: `https://www.tiktok.com/video/${ID(3)}` } }
  )
  is('geen clip', res.lyf.gedoen.length, 0)
  is('dit word gerapporteer', res.lyf.misluk.length, 1)
  is('met n leesbare rede', /maker se naam/i.test(res.lyf.misluk[0].fout), true)
  is('en NIKS is geskryf nie', gesien.commits.length, 0)
}

console.log('\n── n Clip wat AL bestaan ──')
{
  const { res, gesien } = await loop(
    { skakels: [kort('AAA111222')] },
    { wys: { AAA111222: lank('ds.jan', ID(1)) }, bestaan: [ID(1)] }
  )
  is('hy tel nie as nuut nie', res.lyf.gedoen.length, 0)
  is('en dit word gese', res.lyf.oorgeslaan.length, 1)
  /* Hy word WEL bygewerk — die naam kan verander het — maar sonder `datum`,
     anders keer 'n herhaalde lopie die hele voer se orde om. */
  const w = gesien.commits[0].writes
  is('hy word steeds bygewerk', w.length, 1)
  is('maar KRY GEEN nuwe datum nie', w[0].updateMask.fieldPaths.includes('datum'), false)
}

console.log('\n── Een stukkende skakel mag nie die res kos nie ──')
{
  const { res } = await loop(
    { skakels: [kort('AAA111222'), kort('STUKKEND1'), kort('BBB333444')] },
    { wys: { AAA111222: lank('a', ID(1)), BBB333444: lank('b', ID(2)) } }
  )
  is('twee kom deur', res.lyf.gedoen.length, 2)
  is('een misluk', res.lyf.misluk.length, 1)
  is('en dit se WATTER een', res.lyf.misluk[0].skakel, kort('STUKKEND1'))
}

console.log('\n── Inbraakpogings ──')
for (const [naam, skakel] of [
  ['n ander gasheer', 'https://boos.net/iets'],
  ['n gasheer wat net so LYK', 'https://tiktok.com.boos.net/t/ZT1/'],
  ['n YouTube-skakel', 'https://youtu.be/jACGS5QkLkQ'],
]) {
  const { res, gesien } = await loop({ skakels: [skakel] })
  is(`${naam}: 400, en niks gehaal nie`, [res.kode, gesien.gehaal.length], [400, 0])
}
{
  /* `http://` word OPGEGRADEER, nie geweier nie — TikTok bedien niks oor http
     nie, dus is dit 'n mens se kopie van 'n egte skakel. Die ding wat tel, is
     dat die versoek wat UITGAAN https is. Sien `gelykeSkakel()` se kop. */
  const { gesien } = await loop(
    { skakels: ['http://vt.tiktok.com/AAA111222/'] },
    { wys: { AAA111222: lank('a', ID(1)) } }
  )
  is('http word na https opgegradeer', gesien.gehaal[0], 'https://vt.tiktok.com/AAA111222/')
  is('en niks gaan OOIT oor http uit nie', gesien.gehaal.some(u => /^http:\/\//.test(u)), false)
}
{
  /* 'n SPRONG weg van TikTok af. */
  const { res, gesien } = await loop(
    { skakels: [kort('AAA111222')] },
    { wys: { AAA111222: 'https://boos.net/steel' } }
  )
  is('n sprong weg van TikTok: geen clip', res.lyf.gedoen.length, 0)
  is('en niks geskryf nie', gesien.commits.length, 0)
}
{
  const { res, gesien } = await loop(
    { skakels: [kort('AAA111222')] },
    { wys: { AAA111222: 'http://169.254.169.254/latest/meta-data/' } }
  )
  is('n sprong na die metadata-adres: geen clip', res.lyf.gedoen.length, 0)
  is('en niks geskryf nie', gesien.commits.length, 0)
}

console.log('\n── Dit werk in HAPPE ──')
{
  const baie = Array.from({ length: MAKS_PER_HAP + 30 }, (_, i) => kort(`Z${String(i).padStart(8, '0')}`))
  const wys = {}
  baie.forEach((s, i) => { wys[s.match(/com\/([A-Za-z0-9]+)/)[1]] = lank('m' + (i % 5), ID(100 + i)) })
  const { res, gesien } = await loop({ skakels: baie }, { wys })
  is('net een hap word gehaal', gesien.gehaal.length, MAKS_PER_HAP)
  is('en dit se hoeveel oorbly', res.lyf.oor, 30)
  is('en GEE die res terug', res.lyf.volgende.length, 30)
  is('die res is die STERTE van die lys', res.lyf.volgende[0], baie[MAKS_PER_HAP])
}

console.log('\n── Die rou plaksel werk ook ──')
{
  /* Dewald se vorm: aanmekaar, geen spasie. */
  const plak = `${kort('AAA111222')}${kort('BBB333444')}${kort('CCC555666')}`
  const wys = {
    AAA111222: lank('a', ID(1)), BBB333444: lank('b', ID(2)), CCC555666: lank('c', ID(3)),
  }
  const { res } = await loop({ plaksel: plak }, { wys })
  is('al drie uit een string', res.lyf.gedoen.length, 3)
}
{
  /* Dieselfde VIDEO onder twee kort skakels — ontdubbel op die ID. */
  const { res, gesien } = await loop(
    { skakels: [kort('AAA111222'), kort('BBB333444')] },
    { wys: { AAA111222: lank('a', ID(9)), BBB333444: lank('a', ID(9)) } }
  )
  is('een clip, nie twee', res.lyf.gedoen.length, 1)
  is('en een skrywe', gesien.commits[0].writes.length, 1)
}

console.log('\n── Wat verkeerd kan loop ──')
{
  const { res } = await loop({ skakels: [] })
  is('n lee lys: 400', res.kode, 400)
}
{
  const { res } = await loop({ plaksel: 'kyk hier' })
  is('geen skakels in die plaksel: 400', res.kode, 400)
}
{
  const { res } = await loop(null)
  is('geen liggaam: 400', res.kode, 400)
}
{
  const { res } = await loop(
    { skakels: [kort('AAA111222')] },
    { wys: { AAA111222: lank('a', ID(1)) }, gooiSkryf: true }
  )
  is('Firestore weier: 500', res.kode, 500)
  is('en dit se hoeveel opgelos is', res.lyf.opgelos, 1)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
