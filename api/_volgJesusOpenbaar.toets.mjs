/* Die openbare VOLG JESUS-eindpunt.
 *
 * Hierdie eindpunt het jare lank NIE bestaan nie, en die rede staan in
 * volg-jesus-week.js se opskrif: "'n eindpunt wat 'net die gepubliseerdes'
 * wys, is presies hoe 'n halwe program per ongeluk lewendig gaan."
 *
 * Nou bestaan dit, want die program moet lewe terwyl dit groei. Die vrees
 * word dus 'n TOETS: hierdie leer sit 'n vals Firestore agter die funksie en
 * eis dat 'n ongepubliseerde week nie een keer, in geen antwoord, oor die
 * draad kom nie.
 *
 * Daar is geen egte netwerk hier nie — `fetch` word vervang.
 */
import crypto from 'node:crypto'

/* 'n Egte RSA-sleutel, want die funksie teken 'n JWT voordat sy enigiets
   doen. Dit word hier gemaak en verlaat nooit hierdie proses nie. */
const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })
process.env.FIREBASE_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' })
process.env.FIREBASE_CLIENT_EMAIL = 'toets@voorbeeld.local'
process.env.FIREBASE_PROJECT_ID = 'toets-projek'

const { default: handler } = await import('./volg-jesus-openbaar.mjs')

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)
const vals = (n, k) => is(n, !!k, false)

/* ── Die vals Firestore ─────────────────────────────────────────────── */
function dok(week) {
  return {
    name: `projects/p/databases/(default)/documents/volgJesusWeke/week-${String(week.weeknommer).padStart(2, '0')}`,
    fields: {
      weeknommer:  { integerValue: String(week.weeknommer) },
      data:        { stringValue: JSON.stringify(week) },
      gepubliseer: { booleanValue: week.gepubliseer === true },
      opgedateer:  { timestampValue: '2026-08-16T05:00:00Z' },
    },
  }
}

function week(n, pub, ekstra = {}) {
  return {
    weeknommer: n,
    titel: `Week ${n} se titel`,
    openingskerm: 'Die opening.',
    primereSkrif: 'Johannes 1:1–18',
    videoId: 'jACGS5QkLkQ',
    kernwaarheid: 'Die kernwaarheid.',
    privaatRefleksie: 'Wees eerlik.',
    gehoorsaamheidStap: 'Doen dit.',
    doel: 'GEHEIM-DOEL',
    weekKern: 'GEHEIM-KERN',
    fasiliteerderHoofpunt: 'GEHEIM-HOOFPUNT',
    fasiliteerderGrens: 'GEHEIM-GRENS',
    fasiliteerderWaarskuwing: 'GEHEIM-WAARSKUWING',
    groepVraag1: 'GEHEIM-GROEP',
    hersieningStatus: 'GEHEIM-HERSIENING',
    gepubliseer: pub,
    ...ekstra,
  }
}

let bediener = []          /* wat Firestore "in" het */
let firestoreVal = false   /* laat Firestore omval */

globalThis.fetch = async (url, opsies) => {
  const u = String(url)
  if (u.includes('oauth2.googleapis.com')) {
    return { ok: true, status: 200, json: async () => ({ access_token: 'teken-123' }) }
  }
  if (firestoreVal) return { ok: false, status: 503, json: async () => ({}), text: async () => '' }

  const m = u.match(/volgJesusWeke\/week-(\d+)/)
  if (m) {
    const n = Number(m[1])
    const w = bediener.find(x => x.weeknommer === n)
    if (!w) return { ok: false, status: 404, json: async () => ({}), text: async () => '' }
    return { ok: true, status: 200, json: async () => dok(w) }
  }
  return { ok: true, status: 200, json: async () => ({ documents: bediener.map(dok) }) }
}

/* ── Die vals res ───────────────────────────────────────────────────── */
async function roep(query = {}, metode = 'GET') {
  let kode = 0, lyf = null
  const koppe = {}
  const res = {
    setHeader: (k, v) => { koppe[k] = v },
    status(k) { kode = k; return this },
    json(j) { lyf = j; return this },
  }
  await handler({ method: metode, query }, res)
  return { kode, lyf, koppe }
}

/* Die hele antwoord as een string. Die enigste eerlike manier om te vra of
   iets gelek het: nie na velde kyk wat ons verwag nie, maar na die WOORDE
   soek wat nooit daar mag wees nie. */
const teks = lyf => JSON.stringify(lyf)

console.log('\n── Niks gepubliseer nie ──\n')
bediener = [week(1, false), week(2, false)]
let r = await roep()
is('die lys is leeg', r.lyf.weke, [])
is('en daar is geen binnekort-boodskap', r.lyf.binnekort, null)
is('en klaar is 0', r.lyf.klaar, 0)
vals('niks van die inhoud lek nie', /GEHEIM/.test(teks(r.lyf)))
vals('en nie eens n titel nie', /Week 1 se titel/.test(teks(r.lyf)))

console.log('\n── n Ongepubliseerde week word DIREK gevra ──\n')
/* Die belangrikste toets in hierdie leer. Iemand wat weet die eindpunt
   bestaan, gaan ?week=2 probeer. */
r = await roep({ week: '2' })
is('hy kry niks', r.lyf.week, null)
vals('en niks van sy inhoud nie', /GEHEIM|Week 2 se titel/.test(teks(r.lyf)))
is('en dit is nie n foutkode nie', r.kode, 200)

console.log('\n── Week 1 lewe ──\n')
bediener = [week(1, true), week(2, false)]
r = await roep()
is('die lys het een week', r.lyf.weke.length, 1)
is('en dit is week 1', r.lyf.weke[0], { weeknommer: 1, titel: 'Week 1 se titel' })
is('klaar is 1', r.lyf.klaar, 1)
is('en die boodskap praat van week 2', r.lyf.binnekort.volgende, 2)
vals('week 2 se titel lek nie in die lys nie', /Week 2 se titel/.test(teks(r.lyf)))

r = await roep({ week: '1' })
waar('week 1 kom deur', r.lyf.week)
is('met sy titel', r.lyf.week.titel, 'Week 1 se titel')
vals('sonder EEN van die geheime velde', /GEHEIM/.test(teks(r.lyf)))
vals('sonder gepubliseer', Object.prototype.hasOwnProperty.call(r.lyf.week, 'gepubliseer'))
vals('sonder opgedateer', Object.prototype.hasOwnProperty.call(r.lyf.week, 'opgedateer'))

r = await roep({ week: '2' })
is('en week 2 bly toe', r.lyf.week, null)

console.log('\n── Week 2 gaan lewendig; die boodskap skuif vanself ──\n')
/* Dewald: "as ek week 2 oplaai skryf die boodskap agter week 2 en se week 3
   kom binnekort." Niemand verander 'n reël kode nie — hy druk Publiseer. */
bediener = [week(1, true), week(2, true), week(3, false)]
r = await roep()
is('twee weke lewe', r.lyf.weke.map(w => w.weeknommer), [1, 2])
is('en nou praat die boodskap van week 3', r.lyf.binnekort.volgende, 3)
is('en die kop ook', r.lyf.binnekort.kop, 'WEEK 3 KOM BINNEKORT')

console.log('\n── n Gat in die program ──\n')
/* Publiseer hy per ongeluk week 9 voor week 2, mag die app nie daarheen wys
   nie — 'n mens wat by week 2 vasval sonder om te weet hoekom, is erger as
   'n week wat 'n dag later wys. */
bediener = [week(1, true), week(2, false), week(9, true)]
r = await roep()
is('net die aaneenlopende lopie word gelys', r.lyf.weke.map(w => w.weeknommer), [1])
is('klaar bly 1', r.lyf.klaar, 1)
is('en die boodskap praat van week 2', r.lyf.binnekort.volgende, 2)

console.log('\n── Onmoontlike navrae ──\n')
bediener = [week(1, true)]
for (const sleg of ['0', '53', 'abc', '-1', '1.5', '__proto__', '']) {
  r = await roep({ week: sleg })
  /* 'n Lee string beteken "geen week gevra" en gee die lys; die res gee niks.
     Nie een van hulle gee 'n fout of 'n week. */
  if (sleg === '') { waar(`n lee ?week= gee die lys`, Array.isArray(r.lyf.weke)) }
  else is(`?week=${sleg} gee niks`, r.lyf.week, null)
  is(`?week=${sleg} is nie n foutkode nie`, r.kode, 200)
}

console.log('\n── Net GET ──\n')
for (const m of ['POST', 'PUT', 'DELETE', 'PATCH']) {
  r = await roep({}, m)
  is(`${m} word geweier`, r.kode, 405)
}

console.log('\n── Firestore val om ──\n')
/* 'n Foutboodskap op die tuisblad is erger as stilte: die kaart op Luister
   moet eenvoudig nie wys nie. */
firestoreVal = true
r = await roep()
is('die lys is leeg, nie n 500', r.kode, 200)
is('en heeltemal leeg', r.lyf, { klaar: 0, binnekort: null, weke: [] })
r = await roep({ week: '1' })
is('een week ook', r.lyf.week, null)
is('en ook nie n 500', r.kode, 200)
firestoreVal = false

console.log('\n── Die kas ──\n')
/* Publiseer hy 'n week, moet dit binne 'n minuut op die fone wees. Nie more
   nie, en nie by elke oproep 'n vars Firestore-lees nie. */
r = await roep()
waar('daar is n Cache-Control', r.koppe['Cache-Control'])
waar('dit is publiek', /public/.test(r.koppe['Cache-Control']))
const sec = Number((r.koppe['Cache-Control'].match(/s-maxage=(\d+)/) || [])[1])
waar('en die rand hou dit hoogstens n paar minute', sec > 0 && sec <= 300)

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
