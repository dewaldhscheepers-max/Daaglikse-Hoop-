/* VOLG JESUS: die vorige prente van 'n week — die witlys en die lys.
 *
 *   node api/_ouPrente.toets.mjs
 */
import { createRequire } from 'node:module'
const vereis = createRequire('/home/user/Daaglikse-Hoop-/api/')
const { voorvoegsel, ontleedPrente } = vereis('./_ouPrente.js')
process.env.SORG_ADMIN_GEHEIM = 'n-lang-genoeg-geheim-vir-toets'

let reg = 0, val = 0
const is = (n, k, w) => { if (JSON.stringify(k) === JSON.stringify(w)) reg++; else { val++; console.log(`  VAL ${n}\n    kry ${JSON.stringify(k)}\n    wag ${JSON.stringify(w)}`) } }

console.log('\n── Die voorvoegsel kom uit n WITLYS ──\n')
is('Dag 1 se wallpaper', voorvoegsel('8', 'dag1'), 'covers/vj-w8-dag1-')
is('die week s n', voorvoegsel(8, 'week'), 'covers/vj-w8-week-')
/* Die admin se VELDNAAM is nie die lêernaam nie — dit was die eerste fout. */
is('wallpaperDag1 is NIE n sleutel nie', voorvoegsel(8, 'wallpaperDag1'), null)
is('week 0', voorvoegsel(0, 'dag1'), null)
is('week 53', voorvoegsel(53, 'dag1'), null)
is('n breuk', voorvoegsel('8.5', 'dag1'), null)
is('n pad as week', voorvoegsel('8/../../', 'dag1'), null)
is('n pad as veld', voorvoegsel(8, '../audio'), null)
is('leeg', voorvoegsel('', ''), null)

console.log('\n── Die lys ──\n')
{
  const items = [
    { name: 'covers/vj-w8-dag1-1.jpg', timeCreated: '2026-09-29T10:00:00Z', metadata: { firebaseStorageDownloadTokens: 'aaa' } },
    { name: 'covers/vj-w8-dag1-2.png', timeCreated: '2026-10-11T10:00:00Z', metadata: { firebaseStorageDownloadTokens: 'bbb,ccc' } },
    { name: 'covers/vj-w8-dag1-3.jpg', timeCreated: '2026-10-01T10:00:00Z', metadata: {} },
    null, { name: 5 },
  ]
  const l = ontleedPrente(items, 'emmer.app')
  is('net prente met n aflaaiteken', l.length, 2)
  is('nuutste eerste', l.map(p => p.naam), ['vj-w8-dag1-2.png', 'vj-w8-dag1-1.jpg'])
  is('die skakel is die Firebase-vorm, met die EERSTE teken',
     l[0].url, 'https://firebasestorage.googleapis.com/v0/b/emmer.app/o/covers%2Fvj-w8-dag1-2.png?alt=media&token=bbb')
  is('niks in, niks uit', ontleedPrente(undefined, 'x'), [])
}

console.log('\n── Die eindpunt: hekke, en wat na Storage gaan ──\n')
{
  const { generateKeyPairSync } = await import('node:crypto')
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  process.env.FIREBASE_CLIENT_EMAIL = 'toets@daaglikse-hoop.iam.gserviceaccount.com'
  process.env.FIREBASE_PRIVATE_KEY  = privateKey.export({ type: 'pkcs8', format: 'pem' })
  const gevang = []
  globalThis.fetch = async (url, o) => {
    url = String(url)
    if (url.includes('oauth2.googleapis.com')) {
      gevang.push({ url, liggaam: o.body }); return { json: async () => ({ access_token: 't' }) }
    }
    gevang.push({ url, o })
    return { ok: true, json: async () => ({ items: [
      { name: 'covers/vj-w8-dag1-9.jpg', timeCreated: '2026-09-29T10:00:00Z', metadata: { firebaseStorageDownloadTokens: 'x' } } ] }) }
  }
  const h = vereis('./vj-ou-prente.js')
  const roep = async (query, geheim = process.env.SORG_ADMIN_GEHEIM, method = 'GET') => {
    const res = { kode: 0, b: null, setHeader() {}, status(k) { this.kode = k; return this }, json(b) { this.b = b; return this } }
    await h({ method, headers: geheim ? { 'x-sorg-geheim': geheim } : {}, query }, res)
    return res
  }
  is('sonder geheim: 401', (await roep({ week: '8', veld: 'dag1' }, '')).kode, 401)
  is('verkeerde geheim: 401', (await roep({ week: '8', veld: 'dag1' }, 'verkeerd-maar-lank-genoeg')).kode, 401)
  is('POST: 405', (await roep({ week: '8', veld: 'dag1' }, undefined, 'POST')).kode, 405)
  is('onbekende veld: 400', (await roep({ week: '8', veld: 'audio' })).kode, 400)
  gevang.length = 0
  const r = await roep({ week: '8', veld: 'dag1' })
  is('reg: 200', r.kode, 200)
  is('een prent terug', r.b.prente.length, 1)
  const lys = gevang.find(g => g.url.includes('storage.googleapis.com/storage/v1'))
  is('die soek is presies covers/vj-w8-dag1-', new URL(lys.url).searchParams.get('prefix'), 'covers/vj-w8-dag1-')
  const jwt = decodeURIComponent(gevang.find(g => g.url.includes('oauth2')).liggaam.split('assertion=')[1])
  const eis = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString())
  is('die token mag net LEES', eis.scope, 'https://www.googleapis.com/auth/devstorage.read_only')
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
