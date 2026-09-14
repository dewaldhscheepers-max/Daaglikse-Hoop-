/* Een clip uit die voer haal, met 'n vals Firestore EN 'n vals TikTok agter hom.
 *
 * Dewald, 14 September 2026, met 'n skermkiekie van "Video currently
 * unavailable": *"how to remove only this one that isn't playing how will i
 * know what link it is."*
 *
 * Dit is 'n eindpunt wat DATA UITVEE, en dit is die soort ding wat 'n mens net
 * een keer verkeerd doen. Vier dinge moet vashou:
 *
 *   · dit is ADMIN-alleen. 'n Oop verwyder-eindpunt is die hele voer;
 *   · sonder `verwyder: true` VEE dit NIKS uit — dit kyk net en sê wie dit is.
 *     Die admin wys daardie naam voordat die rooi knoppie kom;
 *   · 'n clip wat nie bestaan nie is nie 'n FOUT nie — hy is reeds weg, en dit
 *     moet so gesê word;
 *   · en dit vee PRESIES EEN dokument uit, nooit meer nie.
 *
 * Loop met:  node api/_reelsVerwyder.toets.mjs
 */
import crypto from 'node:crypto'

const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })
process.env.FIREBASE_CLIENT_EMAIL = 'toets@voorbeeld.com'
process.env.FIREBASE_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' }).replace(/\n/g, '\\n')
process.env.FIREBASE_PROJECT_ID = 'toets-projek'
process.env.SORG_ADMIN_GEHEIM = 'n-geheim-wat-lank-genoeg-is'

const { default: handler } = await import('./reels-verwyder.mjs')

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

const ID = '7412345678901234567'

/* Die vals wêreld. `daar` is die clips wat in Firestore staan; `wys` sê waarheen
   'n kort skakel herlei. */
function saai({ daar = {}, wys = {} } = {}) {
  const gesien = { gelees: [], gevee: [], gehaal: [] }
  globalThis.fetch = async (adres, opsies = {}) => {
    const u = String(adres)

    if (u.includes('oauth2.googleapis.com')) {
      return { ok: true, json: async () => ({ access_token: 'teken' }) }
    }

    /* Die kort skakel se herleiding. */
    if (u.includes('vt.tiktok.com')) {
      gesien.gehaal.push(u)
      const kode = u.split('/').filter(Boolean).pop()
      const na = wys[kode]
      if (!na) return { status: 404, ok: false, headers: { get: () => null } }
      return { status: 301, ok: false, headers: { get: k => (k === 'location' ? na : null) } }
    }

    /* Firestore se REST vir een dokument. */
    if (u.includes('firestore.googleapis.com')) {
      const id = decodeURIComponent(u.split('/reels/').pop().split('?')[0])
      if ((opsies.method || 'GET') === 'DELETE') {
        gesien.gevee.push(id)
        return { ok: true, status: 200, json: async () => ({}) }
      }
      gesien.gelees.push(id)
      const d = daar[id]
      if (!d) return { ok: false, status: 404, json: async () => ({}) }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          name: `projects/toets-projek/databases/(default)/documents/reels/${id}`,
          fields: Object.fromEntries(Object.entries(d).map(([k, v]) => [
            k, typeof v === 'number' ? { integerValue: String(v) } : { stringValue: String(v) },
          ])),
        }),
      }
    }

    throw new Error('onverwagte adres: ' + u)
  }
  return gesien
}

async function loop(lyf, wereld, { geheim = 'n-geheim-wat-lank-genoeg-is', metode = 'POST' } = {}) {
  const gesien = saai(wereld)
  const res = maakRes()
  const req = { method: metode, body: lyf, headers: geheim ? { 'x-sorg-geheim': geheim } : {} }
  await handler(req, res)
  return { res, gesien }
}

console.log('\n── Die HEK ──')
/* 'n Oop verwyder-eindpunt is die hele voer. */
{
  const { res, gesien } = await loop({ inset: ID, verwyder: true }, { daar: { [ID]: { naam: '@a' } } }, { geheim: '' })
  is('sonder die geheim: 401', res.kode, 401)
  is('en NIKS is gevee nie', gesien.gevee, [])
}
{
  const { res, gesien } = await loop({ inset: ID, verwyder: true }, { daar: { [ID]: { naam: '@a' } } }, { geheim: 'verkeerd' })
  is('met die verkeerde geheim: 401', res.kode, 401)
  is('en NIKS is gevee nie', gesien.gevee, [])
}
{
  const { res } = await loop({ inset: ID }, {}, { metode: 'GET' })
  is('GET word geweier', res.kode, 405)
}

console.log('\n── KYK: dit vee niks uit nie ──')
/* Dit is die hele rede vir twee stappe. Die enigste ding wat 'n mens van die
   skerm af in die hand het, is 'n id van negentien syfers. */
{
  const { res, gesien } = await loop(
    { inset: `https://dewaldscheepers.com/reels/${ID}` },
    { daar: { [ID]: { naam: '@annelie', handvatsel: '@annelie', gedeel: 7 } } }
  )
  is('dit kry die clip',        res.kode, 200)
  is('en dit is die regte een', res.lyf.id, ID)
  is('dit gee die MAKER se naam', res.lyf.naam, '@annelie')
  is('en die deel-telling',     res.lyf.gedeel, 7)
  is('dit se hy is gevind',     res.lyf.gevind, true)
  is('maar NIKS is gevee nie',  res.lyf.verwyder, false)
  is('en Firestore is nooit gevra om te vee nie', gesien.gevee, [])
}

console.log('\n── VEE: presies EEN dokument ──')
{
  const { res, gesien } = await loop(
    { inset: ID, verwyder: true },
    { daar: { [ID]: { naam: '@annelie', gedeel: 7 } } }
  )
  is('dit is gevee',        res.lyf.verwyder, true)
  is('presies een dokument', gesien.gevee, [ID])
  /* Dit lees EERS en vee dan — die naam in die antwoord moet die egte een wees. */
  is('en dit het eers gelees', gesien.gelees, [ID])
  is('die naam kom saam terug', res.lyf.naam, '@annelie')
}

console.log('\n── n Clip wat reeds WEG is ──')
/* Dit is nie 'n fout wat 'n mens moet oplos nie. */
{
  const { res, gesien } = await loop({ inset: ID, verwyder: true }, { daar: {} })
  is('dit is nie n fout nie', res.kode, 200)
  is('dit se hy is nie gevind nie', res.lyf.gevind, false)
  is('en niks is gevee nie', gesien.gevee, [])
}

console.log('\n── n KORT skakel word oopgemaak ──')
/* 'n Kort skakel dra die id nie. Dit is die een vorm wat die BEDIENER moet
   oplos, en dit gebruik dieselfde volger as die invoer. */
{
  const { res, gesien } = await loop(
    { inset: 'https://vt.tiktok.com/ZSqHxCETq/', verwyder: true },
    { daar: { [ID]: { naam: '@annelie' } }, wys: { ZSqHxCETq: `https://www.tiktok.com/@annelie/video/${ID}` } }
  )
  is('die skakel is gevolg', gesien.gehaal.length > 0, true)
  is('en die regte clip is gevee', gesien.gevee, [ID])
}
{
  /* Herlei hy nêrens heen nie, word NIKS gevee nie. */
  const { res, gesien } = await loop(
    { inset: 'https://vt.tiktok.com/ZSqDOOD11/', verwyder: true },
    { daar: { [ID]: { naam: '@annelie' } }, wys: {} }
  )
  is('n dooie kort skakel: 400', res.kode, 400)
  is('en NIKS is gevee nie', gesien.gevee, [])
}

console.log('\n── Gemors vee NIKS uit nie ──')
for (const [wat, inset] of [
  ['leeg',          ''],
  ['niks',          undefined],
  ['gewone woorde', 'kyk hierdie video'],
  ['n YouTube-skakel', 'https://www.youtube.com/watch?v=aaaaaaaaaaa'],
  ['n te kort id',  '123'],
]) {
  const { res, gesien } = await loop({ inset, verwyder: true }, { daar: { [ID]: { naam: '@a' } } })
  is(`${wat}: 400`, res.kode, 400)
  is(`${wat}: niks gevee`, gesien.gevee, [])
}
{
  /* Geen liggaam nie. */
  const { res, gesien } = await loop(undefined, { daar: { [ID]: { naam: '@a' } } })
  is('geen liggaam: 400', res.kode, 400)
  is('en niks gevee', gesien.gevee, [])
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
