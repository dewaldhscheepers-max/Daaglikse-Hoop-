/* Die kort-skakel-oplosser, met 'n vals TikTok agter hom.
 *
 * Hierdie eindpunt HAAL 'N ADRES OP, en dit is die gevaarlikste soort eindpunt
 * wat 'n mens kan skryf: 'n bediener wat gaan haal wat jy vir hom gee, kan by
 * alles uitkom wat hy kan bereik. Die helfte van hierdie toets is dus
 * inbraakpogings, nie gelukkige paaie nie.
 *
 * Die reël wat die maklikste stilweg breek, is die SPRONG: `redirect: 'follow'`
 * lyk eenvoudiger en sou elke keuring hierna oorslaan.
 *
 * Loop met:  node api/_reelsSkakel.toets.mjs
 */
process.env.SORG_ADMIN_GEHEIM = 'n-geheim-wat-lank-genoeg-is'

const { default: handler } = await import('./reels-skakel.mjs')

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}

const ID = '7412345678901234567'
const LANK = `https://www.tiktok.com/@iemand/video/${ID}`

/* 'n Vals res wat onthou wat gebeur het. */
function maakRes() {
  const r = { kode: 0, lyf: null, koppe: {} }
  r.status = k => { r.kode = k; return r }
  r.json = b => { r.lyf = b; return r }
  r.setHeader = (k, v) => { r.koppe[k] = v }
  return r
}

function versoek(skakel, opsies) {
  const o = opsies || {}
  return {
    method: o.method || 'POST',
    headers: o.geenGeheim ? {} : { 'x-sorg-geheim': 'n-geheim-wat-lank-genoeg-is' },
    body: { skakel },
    query: {},
  }
}

/* Die vals TikTok. `ketting` is 'n lys: elke inskrywing is die `location` wat
   daardie sprong teruggee, of null vir "geen herlei meer". */
function saaiFetch(ketting, gooi) {
  const gesien = []
  globalThis.fetch = async (adres) => {
    gesien.push(String(adres))
    if (gooi) throw new Error('netwerk')
    const na = ketting.shift()
    return {
      headers: { get: k => (k.toLowerCase() === 'location' ? (na || null) : null) },
    }
  }
  return gesien
}

async function loop(skakel, ketting, opsies) {
  const gesien = saaiFetch(Array.isArray(ketting) ? [...ketting] : [], opsies && opsies.gooi)
  const res = maakRes()
  await handler(versoek(skakel, opsies), res)
  return { res, gesien }
}

console.log('\n── Die slot ──')
{
  const { res } = await loop(LANK, [], { geenGeheim: true })
  is('sonder n geheim: 401', res.kode, 401)
}
{
  const { res, gesien } = await loop(LANK, [], { geenGeheim: true })
  /* Belangriker as die kode: dit mag NIKS gaan haal het nie. */
  is('sonder n geheim raak dit nooit die netwerk', gesien.length, 0)
  is('en gee niks terug', res.lyf && res.lyf.id, undefined)
}
{
  const { res } = await loop(LANK, [], { method: 'GET' })
  is('GET: 405', res.kode, 405)
  is('en dit sê wat wel mag', res.koppe.Allow, 'POST')
}

console.log('\n── n Volle adres raak nooit die netwerk nie ──')
{
  const { res, gesien } = await loop(LANK, [])
  is('200', res.kode, 200)
  is('die id', res.lyf.id, ID)
  is('geen spronge', res.lyf.spronge, 0)
  is('niks gehaal nie', gesien.length, 0)
}
{
  const { res, gesien } = await loop(ID, [])
  is('n kaal id werk ook', res.lyf.id, ID)
  is('en raak ook nie die netwerk nie', gesien.length, 0)
}

console.log('\n── Die kort skakel word gevolg ──')
{
  const { res, gesien } = await loop('https://vt.tiktok.com/ZSqa9Knhv/', [LANK])
  is('200', res.kode, 200)
  is('die id', res.lyf.id, ID)
  is('een sprong', res.lyf.spronge, 1)
  is('dit het die KORT adres gehaal', gesien[0], 'https://vt.tiktok.com/ZSqa9Knhv/')
}
{
  /* Twee spronge: TikTok doen dit werklik. */
  const { res } = await loop('https://vm.tiktok.com/ZMabc123/',
    ['https://www.tiktok.com/t/ZTabc123/', LANK])
  is('twee spronge kom deur', res.lyf.id, ID)
  is('en dit sê hoeveel', res.lyf.spronge, 2)
}
{
  const { res } = await loop('vt.tiktok.com/ZSqa9Knhv/', [LANK])
  is('sonder n skema werk ook', res.lyf.id, ID)
}

console.log('\n── Inbraakpogings ──')
/* Dít is waarvoor hierdie toets bestaan. */
{
  const { res, gesien } = await loop('https://boos.net/iets', [])
  is('n ander gasheer: 400', res.kode, 400)
  is('en niks is gehaal nie', gesien.length, 0)
}
{
  const { res, gesien } = await loop('https://tiktok.com.boos.net/t/ZT1/', [])
  /* "tiktok.com.boos.net" bevat "tiktok.com". 'n `includes` sou hier deurgaan. */
  is('n gasheer wat net so LYK: 400', res.kode, 400)
  is('en niks is gehaal nie', gesien.length, 0)
}
{
  const { res, gesien } = await loop('http://vt.tiktok.com/ZS1/', [])
  is('http in plaas van https: 400', res.kode, 400)
  is('en niks is gehaal nie', gesien.length, 0)
}
{
  const { res } = await loop('https://vt.tiktok.com/ZS1/', ['https://boos.net/steel'])
  is('n SPRONG weg van TikTok: 400', res.kode, 400)
  is('en geen id', res.lyf.id, undefined)
}
{
  const { res } = await loop('https://vt.tiktok.com/ZS1/', ['http://www.tiktok.com/x'])
  is('n sprong na http: 400', res.kode, 400)
}
{
  const { res } = await loop('https://vt.tiktok.com/ZS1/', ['http://169.254.169.254/latest/meta-data/'])
  is('n sprong na die metadata-adres: 400', res.kode, 400)
}
{
  const { res } = await loop('https://vt.tiktok.com/ZS1/',
    ['https://www.tiktok.com/a', 'https://www.tiktok.com/b',
     'https://www.tiktok.com/c', 'https://www.tiktok.com/d', 'https://www.tiktok.com/e'])
  is('te veel spronge: 504', res.kode, 504)
}

console.log('\n── Wat verkeerd kan loop ──')
{
  const { res } = await loop('', [])
  is('geen skakel: 400', res.kode, 400)
}
{
  const { res } = await loop('kyk hierdie video', [])
  is('los woorde: 400', res.kode, 400)
}
{
  const { res } = await loop('https://youtu.be/jACGS5QkLkQ', [])
  is('n YouTube-skakel: 400', res.kode, 400)
}
{
  const { res } = await loop('https://vt.tiktok.com/ZS1/', [null])
  is('dit wys nêrens heen: 404', res.kode, 404)
}
{
  const { res } = await loop('https://vt.tiktok.com/ZS1/', [LANK], { gooi: true })
  is('TikTok is af: 502', res.kode, 502)
  is('en die boodskap blameer nie die mens nie', /Probeer weer/.test(res.lyf.fout), true)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
