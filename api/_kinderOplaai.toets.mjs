/* Keur die multipart-liggaam en die URL wat teruggegee word — geen netwerk.
   Ons vang die fetch af en kyk wat sou uitgegaan het. */
import { createRequire } from 'node:module'
const vereis = createRequire('/home/user/Daaglikse-Hoop-/api/')
process.env.SORG_ADMIN_GEHEIM = 'n-lang-genoeg-geheim-vir-toets'

const egteFetch = globalThis.fetch
let gevang = null
globalThis.fetch = async (url, opsies) => {
  if (String(url).includes('oauth2.googleapis.com')) {
    return { json: async () => ({ access_token: 'vals-teken' }) }
  }
  gevang = { url: String(url), opsies }
  return { ok: true, text: async () => '' }
}
/* Die eindpunt teken 'n JWT — gee dit 'n geldige sleutel om mee te werk. */
const { generateKeyPairSync } = await import('node:crypto')
const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
process.env.FIREBASE_CLIENT_EMAIL = 'toets@daaglikse-hoop.iam.gserviceaccount.com'
process.env.FIREBASE_PRIVATE_KEY  = privateKey.export({ type: 'pkcs8', format: 'pem' })

const h = vereis('./kinder-upload.js')
const res = { kode: null, liggaam: null, koppe: {},
  setHeader(k,v){this.koppe[k]=v}, status(k){this.kode=k;return this}, json(b){this.liggaam=b;return this}, end(){return this} }

await h({ method:'POST', headers:{ 'x-sorg-geheim': process.env.SORG_ADMIN_GEHEIM }, query:{},
  body:{ bookId:'boek-toets', filename:'page_001.jpg', fileBase64: Buffer.from('prentgrepe').toString('base64') } }, res)

let reg=0, val=0
const is=(n,k,w)=>{ if(k===w) reg++; else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(k)}`)} }

console.log('\n── Wat na Google sou gaan ──')
is('gebruik die Cloud Storage-API', /storage\.googleapis\.com\/upload\/storage\/v1/.test(gevang.url), true)
is('uploadType=multipart', /uploadType=multipart/.test(gevang.url), true)
is('Content-Type is multipart/related', /^multipart\/related; boundary=grens-/.test(gevang.opsies.headers['Content-Type']), true)

const lyf = gevang.opsies.body.toString('latin1')
is('metadata dra die pad', lyf.includes('"name":"kinder-boeke/boek-toets/page_001.jpg"'), true)
is('metadata dra die aflaai-teken', /firebaseStorageDownloadTokens":"[0-9a-f-]{36}"/.test(lyf), true)
is('die prentgrepe is in die liggaam', lyf.includes('prentgrepe'), true)
is('die grens sluit die liggaam af', /--grens-[0-9a-f]+--\r\n$/.test(lyf), true)

console.log('\n── Wat teruggegee word ──')
is('ok', res.liggaam.ok, true)
const u = res.liggaam.url
is('URL wys na firebasestorage', u.startsWith('https://firebasestorage.googleapis.com/v0/b/'), true)
is('URL dra alt=media', u.includes('alt=media'), true)
is('URL dra \'n teken', /[?&]token=[0-9a-f-]{36}$/.test(u), true)
const tekenInLyf = lyf.match(/firebaseStorageDownloadTokens":"([0-9a-f-]{36})"/)[1]
is('die teken in die URL is DIESELFDE een as in die metadata', u.endsWith(tekenInLyf), true)

globalThis.fetch = egteFetch
console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
