/* ────────────────────────────────────────────────────────────
   Die oggend-kennisgewing, van punt tot punt.

   Ses duisend mense se fone hang hieraan, en die enigste ander manier om dit
   te toets, is om ses duisend mense 'n kennisgewing te stuur. Dus staan hier
   'n vals Google: elke oproep na OAuth, na Firestore en na FCM word
   onderskep en beantwoord, en dan word gekyk wat die funksie WERKLIK gedoen
   het — nie wat sy antwoord se nie.

   Loop met:  node api/_kennisgewings.toets.mjs
   ──────────────────────────────────────────────────────────── */

import { createRequire } from 'node:module'
import { generateKeyPairSync } from 'node:crypto'

/* 'n Egte RSA-sleutel, want die kode teken 'n JWT en 'n string soos 'x' laat
   OpenSSL val. Dit hoef nie Google se sleutel te wees nie — net 'n geldige
   een, want die vals Google hierdie kant vra nooit of die handtekening klop
   nie. Hy moet net GEMAAK kan word. */
const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding:  { type: 'spki',  format: 'pem' },
})

process.env.FIREBASE_PROJECT_ID   = 'toets-projek'
process.env.FIREBASE_CLIENT_EMAIL = 'toets@toets.iam.gserviceaccount.com'
process.env.FIREBASE_PRIVATE_KEY  = privateKey
process.env.CRON_SECRET           = 'n-cron-geheim-wat-lank-genoeg-is'
process.env.SORG_ADMIN_GEHEIM     = 'n-admin-wagwoord-lank-genoeg'
process.env.VAPID_PRIVATE_KEY     = ''

const require = createRequire(import.meta.url)

let reg = 0, val = 0
function is(naam, kry, wag) {
  const gelyk = JSON.stringify(kry) === JSON.stringify(wag)
  if (gelyk) { reg++ } else { val++; console.log(`  VAL  ${naam}\n         kry:  ${JSON.stringify(kry)}\n         wag:  ${JSON.stringify(wag)}`) }
}
function waar(naam, x) { is(naam, !!x, true) }

/* ── Die vals Google ──

   `dae` is die enigste blywende toestand: dit is die kennisgewing_dae-
   versameling, en dit is presies waaroor die dag-slot gaan. */
function maakWereld({ tokens = 10, subs = 0, dae = new Set(), oauthVal = false, lysVal = false } = {}) {
  const w = {
    dae,
    fcmGestuur: [],
    eise: 0,
    teruggegee: 0,
    klaarGemerk: 0,
    titelMetTeken: null,
    titels: new Set(),
    tekste: new Set(),
    metPrent: new Set(),
  }

  w.haal = async (url, opsies = {}) => {
    const u = String(url)
    const metode = (opsies.method || 'GET').toUpperCase()

    if (u.includes('oauth2.googleapis.com')) {
      if (oauthVal) return { ok: false, status: 500, json: async () => ({ error: 'nee' }), text: async () => 'nee' }
      return { ok: true, status: 200, json: async () => ({ access_token: 'teken-123' }) }
    }

    /* Die dag-slot */
    if (u.includes('kennisgewing_dae')) {
      const dag = u.includes('documentId=') ? u.split('documentId=')[1] : u.split('kennisgewing_dae/')[1]?.split('?')[0]
      if (metode === 'POST') {
        w.eise++
        if (w.dae.has(dag)) return { ok: false, status: 409, text: async () => 'ALREADY_EXISTS' }
        w.dae.add(dag)
        return { ok: true, status: 200, json: async () => ({}) }
      }
      if (metode === 'DELETE') { w.teruggegee++; w.dae.delete(dag); return { ok: true, status: 200 } }
      if (metode === 'PATCH')  { w.klaarGemerk++; return { ok: true, status: 200, json: async () => ({}) } }
      if (!w.dae.has(dag)) return { ok: false, status: 404, json: async () => ({}) }
      return { ok: true, status: 200, json: async () => ({ fields: { klaar: { booleanValue: true }, gestuur: { integerValue: '5' }, totaal: { integerValue: '6' } } }) }
    }

    /* Vandag se nota — die kennisgewing se opskrif */
    if (u.includes('/documents/notes')) {
      w.titelMetTeken = !!(opsies.headers && opsies.headers.Authorization)
      return { ok: true, status: 200, json: async () => ({ documents: [{ fields: { title: { stringValue: 'Die Here is my Herder' } } }] }) }
    }

    /* Die twee lyste, met blaaie soos Firestore dit werklik gee */
    if (u.includes('/documents/fcm_tokens') || u.includes('/documents/webPushSubscriptions')) {
      if (lysVal) return { ok: false, status: 500, json: async () => { throw new Error('Firestore is af') } }
      const isFcm = u.includes('fcm_tokens')
      const hoeveel = isFcm ? tokens : subs
      const bladsy = Number((u.match(/pageToken=(\d+)/) || [])[1] || 0)
      const grootte = 300
      const stukkie = []
      for (let i = bladsy; i < Math.min(bladsy + grootte, hoeveel); i++) {
        stukkie.push(isFcm
          ? { fields: { token: { stringValue: `tok-${i}` } } }
          : { fields: { subscription: { mapValue: { fields: {
              endpoint: { stringValue: `https://fcm.googleapis.com/wp/sub-${i}` },
              keys: { mapValue: { fields: { p256dh: { stringValue: 'p' }, auth: { stringValue: 'a' } } } },
            } } } } })
      }
      const volgende = bladsy + grootte < hoeveel ? String(bladsy + grootte) : null
      return { ok: true, status: 200, json: async () => ({ documents: stukkie, ...(volgende ? { nextPageToken: volgende } : {}) }) }
    }

    /* FCM self. Elke vyftigste token is 'n foon wat die app verwyder het. */
    if (u.includes('fcm.googleapis.com/v1/projects')) {
      const boodskap = JSON.parse(opsies.body).message
      const tok = boodskap.token
      w.fcmGestuur.push(tok)
      w.titels.add(boodskap.notification.title)
      w.tekste.add(boodskap.notification.body)
      w.metPrent.add(!!boodskap.data.image)
      const nommer = Number((tok.match(/(\d+)$/) || [])[1] || 0)
      if (nommer % 50 === 49) {
        return { ok: false, status: 404, json: async () => ({ error: { status: 'UNREGISTERED' } }) }
      }
      return { ok: true, status: 200, json: async () => ({ name: 'ok' }) }
    }

    throw new Error('Onverwagte oproep in die toets: ' + u)
  }
  return w
}

function maakRes() {
  const r = { kode: 0, lyf: null }
  r.status = c => { r.kode = c; return r }
  r.json = d => { r.lyf = d; return r }
  r.send = d => { r.lyf = d; return r }
  return r
}

const CRON  = { headers: { authorization: `Bearer ${process.env.CRON_SECRET}` }, query: { outo: '1' }, method: 'GET' }
const ADMIN = { headers: { 'x-sorg-geheim': process.env.SORG_ADMIN_GEHEIM }, query: {}, method: 'POST', body: {} }

/* Elke lopie kry 'n skoon module, want `dood`/`dooies` is module-toestand. */
async function loop(req, wereld) {
  const eg = globalThis.fetch
  globalThis.fetch = wereld.haal
  try {
    for (const k of Object.keys(require.cache)) {
      if (k.includes('send-notifications') || k.includes('_dagslot') || k.includes('_geheim')) delete require.cache[k]
    }
    const handler = require('./send-notifications.js')
    const res = maakRes()
    await handler({ query: {}, headers: {}, body: undefined, ...req }, res)
    return res
  } finally { globalThis.fetch = eg }
}

console.log('\n── Die oggend-cron ──')
{
  const w = maakWereld({ tokens: 6000, subs: 120 })
  const res = await loop(CRON, w)
  is('gee 200', res.kode, 200)
  is('al 6000 tokens is geprobeer', w.fcmGestuur.filter(t => t.startsWith('tok-')).length, 6000)
  /* Presies 120, nie 122 nie: 'n dooie Samsung-foon mag NIE herprobeer word
     nie. Dit was die fout wat hierdie toets uitgevang het. */
  is('al 120 web-push subs ook, elk EEN keer', w.fcmGestuur.filter(t => t.startsWith('sub-')).length, 120)
  is('FCM se telling', res.lyf.fcm.total, 6000)
  is('web-push se telling', res.lyf.webpush.total, 120)
  is('geslaag = 6000 min die 120 dooies', res.lyf.fcm.sent, 5880)
  is('dooies word getel', res.lyf.dood, 120 + 2)
  waar('gemerk as outomaties', res.lyf.outomaties)
  is('die dag is een keer geeis', w.eise, 1)
  is('en klaar gemerk', w.klaarGemerk, 1)
  is('niks is teruggegee nie', w.teruggegee, 0)
  waar('die opskrif is met die diensrekening gehaal', w.titelMetTeken)
}

console.log('\n── Twee crons op dieselfde oggend ──')
{
  const dae = new Set()
  const a = await loop(CRON, maakWereld({ tokens: 100, dae }))
  const tweedeWereld = maakWereld({ tokens: 100, dae })
  const b = await loop(CRON, tweedeWereld)
  is('die eerste stuur', a.lyf.fcm.sent > 0, true)
  is('die tweede gee 200', b.kode, 200)
  waar('die tweede is oorgeslaan', b.lyf.oorgeslaan)
  is('en het VIR NIEMAND gestuur nie', tweedeWereld.fcmGestuur.length, 0)
}

console.log('\n── Die admin druk die knoppie ──')
{
  const dae = new Set([new Date(Date.now() + 2 * 3600000).toISOString().slice(0, 10)])
  const w = maakWereld({ tokens: 50, dae })
  const res = await loop({ ...ADMIN, body: { title: 'Ek bid vir jou', body: 'God is by jou' } }, w)
  is('gee 200 al is die dag klaar geeis', res.kode, 200)
  is('stuur aan almal', w.fcmGestuur.length, 50)
  is('gebruik SY titel', [...w.titels], ['Ek bid vir jou'])
  is('en SY teks', [...w.tekste], ['God is by jou'])
  is('sonder die daaglikse prent', [...w.metPrent], [false])
  is('eis nooit die dag nie', w.eise, 0)
  is('en merk niks klaar nie', w.klaarGemerk, 0)
}

console.log('\n── Die oggendboodskap self ──')
{
  const w = maakWereld({ tokens: 20 })
  await loop(CRON, w)
  is('die opskrif is vandag se nota', [...w.titels], ['Die Here is my Herder'])
  is('en die teks is die een wat mense ken', [...w.tekste],
    ['Jou Daaglikse Hoop vir vandag is gereed. Tik om te luister.'])
  is('met die daaglikse prent', [...w.metPrent], [true])
}

console.log('\n── Val die ?outo=1 weg, tel dit STEEDS as die oggendlopie ──')
{
  const dae = new Set()
  const w1 = maakWereld({ tokens: 20, dae })
  /* Presies dieselfde oproep, maar sonder die navraagstring. */
  const a = await loop({ headers: { authorization: `Bearer ${process.env.CRON_SECRET}` }, method: 'GET' }, w1)
  is('dit stuur', a.lyf.fcm.sent > 0, true)
  is('en eis die dag', w1.eise, 1)

  const w2 = maakWereld({ tokens: 20, dae })
  const b = await loop({ headers: { authorization: `Bearer ${process.env.CRON_SECRET}` }, method: 'GET' }, w2)
  waar('die tweede word oorgeslaan', b.lyf.oorgeslaan)
  is('en stuur vir niemand', w2.fcmGestuur.length, 0)
}

console.log('\n── Die repetisie: die egte oggendboodskap, net aan een foon ──')
{
  const dae = new Set()
  const w = maakWereld({ tokens: 6000, subs: 200, dae })
  const res = await loop({ ...ADMIN, body: { net: 'my-eie-token' } }, w)
  is('gee 200', res.kode, 200)
  is('EEN ontvanger, en dit is myne', w.fcmGestuur, ['my-eie-token'])
  is('die 6000 se lyste word nie eens gehaal nie', res.lyf.fcm.total, 1)
  is('en geen web-push nie', res.lyf.webpush.total, 0)
  is('dieselfde opskrif as die oggend', res.lyf.opskrif, 'Die Here is my Herder')
  is('dieselfde teks', res.lyf.teks, 'Jou Daaglikse Hoop vir vandag is gereed. Tik om te luister.')
  is('met die daaglikse prent', [...w.metPrent], [true])
  waar('gemerk as repetisie', res.lyf.repetisie)

  /* Die belangrikste een: 'n repetisie mag NOOIT die oggendlopie
     stilmaak nie. Toets dit deur die egte lopie hierna te laat loop. */
  is('die dag is NIE geeis nie', w.eise, 0)
  const w2 = maakWereld({ tokens: 30, dae })
  const oggend = await loop(CRON, w2)
  is('die oggendlopie loop steeds', oggend.lyf.fcm.sent > 0, true)
  is('en stuur aan almal', w2.fcmGestuur.length, 30)
}

console.log('\n── \'n Cron mag NOOIT \'n repetisie doen nie ──')
{
  const w = maakWereld({ tokens: 40 })
  const res = await loop({ ...CRON, method: 'POST', body: { net: 'my-eie-token' } }, w)
  is('die cron stuur aan ALMAL, nie aan een nie', w.fcmGestuur.length, 40)
  is('en \'net\' word geïgnoreer', res.lyf.fcm.total, 40)
  is('en die dag word wel geeis', w.eise, 1)
}

console.log('\n── Die droëloop stuur vir niemand ──')
{
  const w = maakWereld({ tokens: 6000, subs: 40 })
  const res = await loop({ ...ADMIN, query: { kyk: '1' } }, w)
  is('gee 200', res.kode, 200)
  is('STUUR VIR NIEMAND', w.fcmGestuur.length, 0)
  is('eis nie die dag nie', w.eise, 0)
  is('tel die ontvangers', res.lyf.ontvangers, { fcm: 6000, webpush: 40, totaal: 6040 })
  is('wys die opskrif', res.lyf.boodskap.titel, 'Die Here is my Herder')
  waar('sien CRON_SECRET', res.lyf.cronGeheim)
  waar('sien die admin-wagwoord', res.lyf.adminGeheim)
  is('sê VAPID ontbreek', res.lyf.vapid, false)
}

console.log('\n── Wie mag nie ──')
{
  const gevalle = [
    ['die ou openbare geheim', { query: { secret: 'DaaglikseHoop2025Cron', outo: '1' } }],
    ['geen geheim',            { query: { outo: '1' } }],
    ['\'n raaiskoot',          { headers: { authorization: 'Bearer yster' }, query: { outo: '1' } }],
    ['leë kopstuk',            { headers: { 'x-sorg-geheim': '' } }],
    ['die admin se geheim as Bearer', { headers: { authorization: `Bearer ${process.env.SORG_ADMIN_GEHEIM}` } }],
  ]
  for (const [naam, req] of gevalle) {
    const w = maakWereld({ tokens: 10 })
    const res = await loop(req, w)
    is(`${naam} → 401`, res.kode, 401)
    is(`${naam} stuur niks`, w.fcmGestuur.length, 0)
  }
}

console.log('\n── Val dit om VOOR die eerste boodskap, kom die dag terug ──')
{
  const dae = new Set()
  const w = maakWereld({ tokens: 100, subs: 0, lysVal: true, dae })
  const res = await loop(CRON, w)
  is('gee 500', res.kode, 500)
  is('niks is gestuur nie', w.fcmGestuur.length, 0)
  is('die dag is teruggegee', w.teruggegee, 1)
  is('en die slot is oop vir \'n tweede probeerslag', dae.size, 0)

  /* Die tweede probeerslag moet nou werk. */
  const w2 = maakWereld({ tokens: 100, dae })
  const res2 = await loop(CRON, w2)
  is('die herprobeerslag stuur wel', res2.lyf.fcm.sent > 0, true)
}

console.log('\n── Is die diensrekening stukkend, se dit so ──')
{
  const w = maakWereld({ tokens: 10, oauthVal: true })
  const res = await loop(CRON, w)
  is('gee 500', res.kode, 500)
  waar('en sê wat verkeerd is', String(res.lyf.fout).includes('diensrekening'))
  is('die dag word nooit geeis nie', w.eise, 0)
}

console.log('\n── Die datum in Suid-Afrikaanse tyd ──')
{
  const { saDatum } = require('./_dagslot.js')
  is('23:30 UTC is reeds die volgende dag by ons', saDatum(Date.parse('2026-08-06T23:30:00Z')), '2026-08-07')
  is('04:30 UTC — die cron self', saDatum(Date.parse('2026-08-07T04:30:00Z')), '2026-08-07')
  is('21:00 UTC is nog dieselfde dag', saDatum(Date.parse('2026-08-07T21:00:00Z')), '2026-08-07')
  is('22:00 UTC rol oor', saDatum(Date.parse('2026-08-07T22:00:00Z')), '2026-08-08')
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
