/* node src/data/tiktokDuim.toets.mjs — die TikTok-voorskouprent: watter adres
   ons by oEmbed vra, en wat ons uit die antwoord vat. Plus die eindpunt self
   teen 'n vals TikTok. */
import { oembedAdres, duimUit, geldigeHandvatsel } from './tiktokDuim.js'

let n = 0, f = 0
const t = (ok, m) => { n++; if (!ok) { f++; console.log('✗ ' + m) } }

// ── oembedAdres ──
const a = oembedAdres('7412345678901234567', '@dewaldscheepers')
t(a === 'https://www.tiktok.com/oembed?url=' + encodeURIComponent('https://www.tiktok.com/@dewaldscheepers/video/7412345678901234567'), 'met handvatsel: ' + a)
t(oembedAdres('7412345678901234567', '').includes(encodeURIComponent('/@tiktok/video/7412345678901234567')), 'sonder handvatsel: plekhouer')
t(oembedAdres('7412345678901234567', '@boos/../x').includes(encodeURIComponent('/@tiktok/')), 'n vreemde handvatsel word nie gebruik nie')
t(oembedAdres('123', '@x') === '', 'n kort ID gee niks')
t(oembedAdres('7412345678901234567abc', '@x') === '', 'n ID met letters gee niks')
t(oembedAdres('https://evil.com/7412345678901234567', '@x') === '', 'n adres in die ID-veld gee niks')
t(oembedAdres(null) === '' && oembedAdres() === '', 'niks gee niks')
t(oembedAdres('7412345678901234567', '@x').startsWith('https://www.tiktok.com/oembed?'), 'die gasheer is altyd TikTok s\'n')

// ── duimUit ──
t(duimUit({ thumbnail_url: 'https://p16-sign.tiktokcdn.com/obj/abc.jpeg?x-expires=1&x-signature=z' }) === 'https://p16-sign.tiktokcdn.com/obj/abc.jpeg?x-expires=1&x-signature=z', 'n egte prent-adres')
t(duimUit({ thumbnail_url: 'http://p16.tiktokcdn.com/a.jpg' }) === '', 'http word nie aanvaar nie')
t(duimUit({ thumbnail_url: 'javascript:alert(1)' }) === '', 'javascript: nooit')
t(duimUit({ thumbnail_url: 'https://x.com/a.jpg") , url("https://boos' }) === '', 'aanhalingstekens en hakies wat uit CSS kan breek, nooit')
t(duimUit({}) === '' && duimUit(null) === '' && duimUit('x') === '', 'gemors gee niks')

t(geldigeHandvatsel('@dewald.scheepers_1') === '@dewald.scheepers_1' && geldigeHandvatsel('dewald') === '', 'handvatsel moet met @ begin')

// ── Die eindpunt, met 'n vals TikTok ──
const { default: handler } = await import('../../api/tiktok-duim.mjs')
function vals() {
  const r = { kode: 0, kop: {}, lyf: null }
  return { status(k) { r.kode = k; return this }, setHeader(k, v) { r.kop[k] = v }, json(l) { r.lyf = l; return this }, r }
}
const egteFetch = globalThis.fetch
let gevra = []
globalThis.fetch = async (url) => { gevra.push(url); return { ok: true, json: async () => ({ thumbnail_url: 'https://p16-sign.tiktokcdn.com/obj/x.jpeg' }) } }
let res = vals(); await handler({ method: 'GET', query: { id: '7412345678901234567', h: '@dewald' } }, res)
t(res.r.kode === 200 && res.r.lyf.duim === 'https://p16-sign.tiktokcdn.com/obj/x.jpeg', 'die eindpunt gee die prent: ' + JSON.stringify(res.r))
t(/s-maxage=21600/.test(res.r.kop['Cache-Control'] || ''), 'en kas dit ses uur')
t(gevra.length === 1 && gevra[0].startsWith('https://www.tiktok.com/oembed?'), 'dit vra NET by TikTok')

gevra = []
res = vals(); await handler({ method: 'GET', query: { id: 'https://boos.net/', h: '@x' } }, res)
t(res.r.kode === 400 && gevra.length === 0, 'n slegte ID: geen versoek uit nie')

globalThis.fetch = async () => { throw new Error('af') }
res = vals(); await handler({ method: 'GET', query: { id: '7412345678901234567' } }, res)
t(res.r.kode === 200 && res.r.lyf.duim === '' && res.r.kop['Cache-Control'] === 'no-store', 'TikTok af: leë duim, nie gekas nie')

globalThis.fetch = async () => ({ ok: false, json: async () => ({}) })
res = vals(); await handler({ method: 'GET', query: { id: '7412345678901234567' } }, res)
t(res.r.lyf.duim === '' && res.r.kop['Cache-Control'] === 'no-store', 'TikTok sê nee: leë duim')

res = vals(); await handler({ method: 'POST', query: {} }, res)
t(res.r.kode === 405, 'net GET')
globalThis.fetch = egteFetch

console.log(f ? `${f} van ${n} FOUT` : `${n} toetse groen`)
process.exit(f ? 1 : 0)
