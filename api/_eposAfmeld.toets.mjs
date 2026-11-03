/* Loop met:  node api/_eposAfmeld.toets.mjs

   Die afmeld-knoppie onder die weeklikse e-pos. Dewald: "it needs to work
   1000000%." Hierdie toets sit 'n vals Firestore, 'n vals Google en 'n vals
   Resend agter die EGTE eindpunte en loop die hele pad:

     die e-pos dra SY skakel → die skakel wys 'n bladsy (meld NIEMAND af) →
     die knoppie meld af → die volgende weeklikse stuur slaan hom oor.

   En die mislukkings: 'n vervalste skakel, 'n Firestore wat nie skryf nie
   ('n bladsy wat sê "afgemeld" terwyl dit nie waar is nie, is die ergste
   uitslag), en 'n afmeld-lys wat nie gelees kan word nie (dan gaan NIKS uit). */

import { createRequire } from 'node:module'
import crypto from 'node:crypto'
const vereis = createRequire('/home/user/Daaglikse-Hoop-/api/')

process.env.CRON_SECRET = 'toets-geheim-van-genoeg-lengte'
process.env.SORG_ADMIN_GEHEIM = 'admin-wagwoord-123'
process.env.RESEND_API_KEY = 'resend'
process.env.FIREBASE_CLIENT_EMAIL = 'x@y.iam.gserviceaccount.com'
process.env.FIREBASE_PROJECT_ID = 'p'
process.env.FIREBASE_PRIVATE_KEY = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })
  .privateKey.export({ type: 'pkcs8', format: 'pem' })

const af            = vereis('./_eposAfmeld.js')
const { sleutel }   = vereis('./_eposGeblok.js')
const { stuurBondel } = vereis('./_eposStuur.js')
const afmeld        = vereis('./afmeld.js')
const grootStuur    = vereis('./send-bulk-email.js')
const wagry         = vereis('./process-email-queue.js')

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (kry === wag) reg++
  else { val++; console.log(`  VAL  ${naam} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

/* ── Die vals wêreld ── */
const dokke = new Map()              // afgemeld/<sleutel> → velde
const lys = ['een@gmail.com', 'twee@gmail.com', 'drie@gmail.com']
let gestuurAan = []                  // elke e-pos wat by Resend uitgekom het
let eposse = []                      // die volle e-posse, om in te kyk
let fsStukkend = { lees: false, skryf: false }
let kampanje = null                  // vir die wagry

globalThis.fetch = async (url, o = {}) => {
  url = String(url)
  const m = o.method || 'GET'
  const json = (status, data) => ({ ok: status < 300, status, json: async () => data })
  if (url.includes('oauth2.googleapis.com')) return json(200, { access_token: 't' })
  if (url.includes('api.resend.com')) {
    const lyf = JSON.parse(o.body)
    for (const e of Array.isArray(lyf) ? lyf : [lyf]) { gestuurAan.push(e.to); eposse.push(e) }
    return json(200, {})
  }
  if (url.includes('/documents/afgemeld')) {
    const id = url.split('/documents/afgemeld')[1].split('?')[0].replace(/^\//, '')
    if (!id) {                                         // die lys
      if (fsStukkend.lees) return json(500, {})
      return json(200, { documents: [...dokke.keys()].map(k => ({ name: `projects/p/databases/(default)/documents/afgemeld/${k}` })) })
    }
    if (m === 'GET')    return dokke.has(id) ? json(200, {}) : json(404, {})
    if (m === 'PATCH')  { if (fsStukkend.skryf) return json(500, {}); dokke.set(id, JSON.parse(o.body).fields); return json(200, {}) }
    if (m === 'DELETE') { dokke.delete(id); return json(200, {}) }
  }
  if (url.includes('/documents/emailList')) {
    return json(200, { documents: lys.map(e => ({ fields: { email: { stringValue: e } } })) })
  }
  if (url.includes(':runQuery')) {
    if (!kampanje) return json(200, [])
    return json(200, [{ document: { name: 'x/emailCampaigns/k1', fields: {
      status: { stringValue: 'active' }, subject: { stringValue: 'S' }, body: { stringValue: 'B' },
      pendingEmails: { arrayValue: { values: kampanje.map(e => ({ stringValue: e })) } },
    } } }])
  }
  if (url.includes('/documents/emailCampaigns')) return json(200, {})
  throw new Error('onverwagte fetch: ' + m + ' ' + url)
}

function vals(method, query = {}, body) {
  const req = { method, query, body, headers: { 'x-sorg-geheim': 'admin-wagwoord-123' } }
  const res = {
    statusCode: 200, kop: {}, lyf: '',
    setHeader(k, v) { this.kop[k] = v },
    status(s) { this.statusCode = s; return this },
    send(b) { this.lyf = b; return this },
    json(b) { this.lyf = b; return this },
  }
  return [req, res]
}
const vraVan = skakel => Object.fromEntries(new URL(skakel).searchParams)
async function roep(h, method, query, body) { const [q, r] = vals(method, query, body); await h(q, r); return r }

/* ─────────────────────────────────────────────── */
console.log('\n── Die handtekening ──')
const s1 = af.afmeldSkakel('Een@Gmail.com ')
const q1 = vraVan(s1)
is('die skakel gaan na die lewende werf', s1.startsWith('https://www.dewaldscheepers.com/api/afmeld?'), true)
is('die adres kom heel terug (kleinletters)', af.adresUit(q1.e), 'een@gmail.com')
is('die eie teken is reg', af.isRegteTeken('een@gmail.com', q1.t), true)
is("'n ander adres met hierdie teken: nee", af.isRegteTeken('twee@gmail.com', q1.t), false)
is("'n geknoeide teken: nee", af.isRegteTeken('een@gmail.com', q1.t.slice(0, -1) + (q1.t.endsWith('A') ? 'B' : 'A')), false)
is("'n leë teken: nee", af.isRegteTeken('een@gmail.com', ''), false)
is('gemors in e: geen adres', af.adresUit('!!!'), '')

/* ─────────────────────────────────────────────── */
console.log('\n── Die bladsy: kyk is NIE afmeld nie ──')
let r = await roep(afmeld, 'GET', q1)
is('GET wys 200', r.statusCode, 200)
is('GET vra eers', /Wil jy afmeld\?/.test(r.lyf), true)
is('GET het een knoppie wat POST', /<form method="post"/.test(r.lyf) && /Ja, meld my af/.test(r.lyf), true)
is('GET het NIKS gestoor nie (skanderders)', dokke.size, 0)
is('die adres staan op die blad', r.lyf.includes('een@gmail.com'), true)
is('nie gekas nie', r.kop['Cache-Control'], 'no-store')

r = await roep(afmeld, 'GET', { e: q1.e, t: 'vals' })
is("vervalste skakel → 400", r.statusCode, 400)
is("…en sê wat om te doen", /info@dewaldscheepers\.com/.test(r.lyf), true)
r = await roep(afmeld, 'POST', { e: Buffer.from('twee@gmail.com').toString('base64url'), t: q1.t })
is("iemand ANDERS afmeld met my teken → 400", r.statusCode, 400)
is("…en niks gestoor nie", dokke.size, 0)

console.log('\n── Die knoppie meld af ──')
r = await roep(afmeld, 'POST', q1)
is('POST → 200', r.statusCode, 200)
is('sê "Jy is afgemeld"', /Jy is afgemeld/.test(r.lyf), true)
is('gestoor onder die adres se sleutel', dokke.has(sleutel('een@gmail.com')), true)
is('die adres self word NIE gestoor nie', JSON.stringify([...dokke.values()]).includes('gmail'), false)
is('bied "teken weer in" aan', /aksie=weer/.test(r.lyf), true)
r = await roep(afmeld, 'GET', q1)
is('weer oopmaak: "reeds afgemeld"', /reeds afgemeld/.test(r.lyf), true)
r = await roep(afmeld, 'POST', q1)
is('twee keer druk is onskadelik', r.statusCode === 200 && dokke.size === 1, true)

console.log("\n── Gmail se eie knoppie (RFC 8058) ──")
const q2 = vraVan(af.afmeldSkakel('twee@gmail.com'))
r = await roep(afmeld, 'POST', q2, 'List-Unsubscribe=One-Click')
is('een-klik POST meld af', dokke.has(sleutel('twee@gmail.com')), true)
is('…as een-klik aangeteken', dokke.get(sleutel('twee@gmail.com')).bron.stringValue, 'een-klik')
r = await roep(afmeld, 'POST', { ...q2, aksie: 'weer' })
is('"teken weer in" haal die afmelding af', dokke.has(sleutel('twee@gmail.com')), false)
is('…en sê dit', /Welkom terug/.test(r.lyf), true)

console.log("\n── Firestore skryf nie: die bladsy mag NIE lieg nie ──")
fsStukkend.skryf = true
r = await roep(afmeld, 'POST', q2)
is('503', r.statusCode, 503)
is('sê "NOG NIE afgemeld"', /NOG NIE afgemeld/.test(r.lyf), true)
is('sê NIE "Jy is afgemeld"', /Jy is afgemeld/.test(r.lyf), false)
fsStukkend.skryf = false

/* ─────────────────────────────────────────────── */
console.log('\n── Die e-pos self ──')
gestuurAan = []; eposse = []
let u = await stuurBondel({ sleutel: 'x', adresse: ['een@gmail.com', 'twee@gmail.com', 'drie@gmail.com'],
  van: 'a@b.c', antwoordNa: 'a@b.c', onderwerp: 'S', html: '<p>H</p>', afgemeld: await af.haalAfgemeld('p', 't') })
is('die afgemelde een is NIE gestuur nie', gestuurAan.includes('een@gmail.com'), false)
is('die ander twee wel', gestuurAan.length, 2)
is('getel as geblok', u.geblok, 1)
for (const e of eposse) {
  const s = vraVan(af.afmeldSkakel(e.to))
  is(`${e.to}: SY skakel in die e-pos`, e.html.includes(`e=${s.e}&amp;t=${s.t}`) || e.html.includes(`e=${s.e}&t=${s.t}`), true)
  is(`${e.to}: geen ander mens se skakel`, eposse.filter(x => x !== e).some(x => e.html.includes(vraVan(af.afmeldSkakel(x.to)).t)), false)
  is(`${e.to}: List-Unsubscribe-kop`, e.headers['List-Unsubscribe'].includes(af.afmeldSkakel(e.to)), true)
  is(`${e.to}: een-klik-kop`, e.headers['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click')
  is(`${e.to}: die woord "Meld af" staan in die e-pos`, /Meld af/.test(e.html), true)
}
let gooi = ''
try { await stuurBondel({ sleutel: 'x', adresse: ['x@y.com'], van: 'a', antwoordNa: 'a', onderwerp: 'S', html: 'h' }) } catch (e) { gooi = e.message }
is("'n stuur-pad wat die lys vergeet, stuur NIKS", /afmeld-lys ontbreek/.test(gooi), true)

/* ─────────────────────────────────────────────── */
console.log('\n── Die EGTE weeklikse stuur (admin) ──')
gestuurAan = []
r = await roep(grootStuur, 'POST', {}, { subject: 'Hallo', body: 'Die week se boodskap' })
is('stuur slaag', r.lyf && r.lyf.ok, true)
is('afgemelde een NIE gestuur', gestuurAan.includes('een@gmail.com'), false)
is('die res wel', gestuurAan.sort().join(','), 'drie@gmail.com,twee@gmail.com')

console.log("\n── Die afmeld-lys kan nie gelees word nie: NIKS gaan uit ──")
fsStukkend.lees = true; gestuurAan = []
r = await roep(grootStuur, 'POST', {}, { subject: 'Hallo', body: 'B' })
is('500', r.statusCode, 500)
is('nul e-posse gestuur', gestuurAan.length, 0)
kampanje = ['een@gmail.com', 'twee@gmail.com']
r = await roep(wagry, 'POST', {})
is('die wagry ook: 500', r.statusCode, 500)
is('die wagry ook: nul gestuur', gestuurAan.length, 0)
fsStukkend.lees = false

console.log('\n── Die wagry (kampanje wat reeds in die ry staan) ──')
gestuurAan = []
r = await roep(wagry, 'POST', {})
is('slaag', r.lyf && r.lyf.ok, true)
is("afgemeld NÁ die kampanje gemaak is: steeds nie gestuur", gestuurAan.join(','), 'twee@gmail.com')

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
