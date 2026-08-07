const crypto  = require('crypto')
const webpush = require('web-push')
const { wieMag } = require('./_geheim.js')
const { saDatum, eisDag, geeDagTerug, merkKlaar, lopieVir } = require('./_dagslot.js')

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'

// ── VAPID mag NIE die hele funksie doodmaak nie ────────────────────────────
//
// Dit was 'n kaal `webpush.setVapidDetails(...)` op module-vlak met
// `process.env.VAPID_PRIVATE_KEY || ''` daarin. `web-push` GOOI as die
// sleutel leeg is — en dit gebeur by INVOER, voordat enige versoek eens by
// die handler kom.
//
// Die gevolg: as VAPID_PRIVATE_KEY nie op Vercel opgestel is nie, val die
// hele eindpunt om met 'n 500 en NIEMAND kry 'n kennisgewing nie. Nie een.
// Die admin wys 'n netwerkfout sonder om te sê hoekom.
//
// En dit is 'n onnodige koppeling: FCM — waarmee Android en Chrome se
// kennisgewings gaan — het glad nie VAPID nodig nie. Net egte nie-Google
// eindpunte (Firefox) het dit nodig. 'n Ontbrekende sleutel behoort dus te
// beteken "Firefox kry niks", nie "niemand kry iets nie".
let vapidGereed = false
try {
  const geheim = process.env.VAPID_PRIVATE_KEY || ''
  if (geheim) {
    webpush.setVapidDetails(
      'mailto:dewald.h.scheepers@gmail.com',
      process.env.VAPID_PUBLIC_KEY  || 'BAnuOtTx2mu8dUar_e7CO-6a4edbIue7Qi2SMCav-ilvxJeh-W2uH4p93LCHNt4P_9A2uj3HyUoOfjulI2OmN5o',
      geheim
    )
    vapidGereed = true
  } else {
    console.warn('[kennisgewings] VAPID_PRIVATE_KEY ontbreek — FCM werk, egte web-push nie')
  }
} catch (e) {
  console.warn('[kennisgewings] VAPID kon nie opgestel word nie:', e.message)
}

// ── OAuth2 access token ────────────────────────────────────────────────────
async function getAccessToken() {
  const now    = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const claim  = Buffer.from(JSON.stringify({
    iss:   process.env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/firebase.messaging https://www.googleapis.com/auth/datastore',
    aud:   'https://oauth2.googleapis.com/token',
    iat:   now,
    exp:   now + 3600,
  })).toString('base64url')
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(`${header}.${claim}`)
  const sig  = sign.sign(privateKey, 'base64url')
  const jwt  = `${header}.${claim}.${sig}`
  const r    = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  })
  const data = await r.json()
  if (!data.access_token) throw new Error('No access token: ' + JSON.stringify(data))
  return data.access_token
}

// ── Today's note title ─────────────────────────────────────────────────────
/* Die titel van vandag se nota is die kennisgewing se opskrif. Dit is die
   boodskap wat mense elke oggend sien, en dit moet nooit weer stilweg
   'Daaglikse Hoop' word omdat 'n leesreel verander het nie.

   Hierdie oproep het GEEN Authorization-kopstuk gehad nie — dit het net
   gewerk omdat `notes` toevallig openbaar leesbaar is. Word daardie reel
   ooit reggemaak (en dit moet), sou hierdie stil na die terugval val en die
   oggendkennisgewing sou elke dag 'Daaglikse Hoop' se in plaas van die nota
   se naam. Niks sou breek nie; dit sou net verkeerd wees.

   Die diensrekening se teken is reeds in die hand en het `datastore` in sy
   omvang. Gebruik hom. */
async function getTodayTitle(accessToken) {
  try {
    const url  = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/notes?orderBy=publishedAt%20desc&pageSize=1`
    const r    = await fetch(url, accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined)
    const data = await r.json()
    const doc  = data.documents?.[0]
    return doc?.fields?.title?.stringValue || 'Daaglikse Hoop'
  } catch { return 'Daaglikse Hoop' }
}

/* ── Waar toestelle staan ──

   Drie getalle uit `tellers/toestemming`: ja, geblokkeer, nog nie geantwoord
   nie. Dit vervang 'n aftreksom tussen die installasie-teller en die aantal
   FCM-tokens, wat na 'n feit gelyk het en dit nie was — die twee meet nie
   dieselfde ding nie.

   Bestaan die dokument nog nie (niemand het nog die nuwe app oopgemaak nie),
   gee dit `null` en die admin sê so, eerder as om nulle te wys wat soos 'n
   antwoord lyk. */
async function leesToestemming(accessToken) {
  try {
    const r = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/tellers/toestemming`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    if (!r.ok) return null
    const f = (await r.json()).fields || {}
    const g = k => Number(f[k]?.integerValue || 0)
    return { ja: g('ja'), geblok: g('geblok'), stil: g('stil') }
  } catch { return null }
}

// ── Fetch FCM tokens ───────────────────────────────────────────────────────
async function getFcmTokens(accessToken) {
  const tokens = []
  let pageToken = null
  do {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/fcm_tokens?pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`
    const r   = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } })
    const data = await r.json()
    ;(data.documents || []).forEach(d => {
      const t = d.fields?.token?.stringValue
      if (t) tokens.push(t)
    })
    pageToken = data.nextPageToken || null
  } while (pageToken)
  return tokens
}

// ── Fetch Samsung web-push subscriptions ──────────────────────────────────
async function getWebPushSubscriptions(accessToken) {
  const subs = []
  let pageToken = null
  do {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/webPushSubscriptions?pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`
    const r   = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } })
    const data = await r.json()
    ;(data.documents || []).forEach(d => {
      const subField = d.fields?.subscription?.mapValue?.fields
      if (subField?.endpoint?.stringValue) {
        subs.push({
          endpoint: subField.endpoint.stringValue,
          keys: {
            p256dh: subField.keys?.mapValue?.fields?.p256dh?.stringValue,
            auth:   subField.keys?.mapValue?.fields?.auth?.stringValue,
          }
        })
      }
    })
    pageToken = data.nextPageToken || null
  } while (pageToken)
  return subs
}

// ── Stuur baie, maar nie een vir een nie ───────────────────────────────────
//
// Dit was 'n `for`-lus met 'n `await` in: elke token wag vir die vorige een.
// Een FCM-oproep is 'n reis na Google en terug, sowat 'n vyfde van 'n
// sekonde. Met vyfhonderd tokens is dit sowat honderd sekondes — en die
// funksie het NIE 'n maxDuration gehad nie, dus het Vercel hom na tien
// sekondes doodgemaak. Die eerste handjievol mense het die kennisgewing
// gekry en die res het niks gekry nie, en die admin het 'n netwerkfout
// gewys sonder om te sê hoekom.
//
// Nou loop hulle vyftig op 'n slag. Ses duisend tokens is honderd-en-twintig
// rondtes, sowat vier-en-twintig sekondes.
//
// Vyftig en nie tweehonderd nie: FCM knyp 'n kliënt wat te vinnig stoot, en
// dan kom daar 429's terug wat NIKS met die foon te doen het nie. En vyftig
// en nie vyf-en-twintig nie, want by ses duisend is die verskil tussen
// vier-en-twintig en agt-en-veertig sekondes die verskil tussen ruim en
// naby die rand — en op 'n Hobby-plan is die perk sestig sekondes, nie
// driehonderd nie.
const GELYK = 50

/* ── Wat 'n tweede kans verdien ──
   'n Foon wat die app verwyder het, gaan nooit werk nie — dit is klaar. Maar
   'n 429 of 'n 503 is FCM wat sê "nie nou nie", en dit is presies die soort
   fout wat by ses duisend begin voorkom. Om daardie mens 'n kennisgewing te
   ontsê omdat Google 'n oomblik besig was, is 'n jammerte wat een herhaling
   oplos. */
async function inGroepe(items, doen) {
  let geslaag = 0
  const weer = []

  for (let i = 0; i < items.length; i += GELYK) {
    const groep = items.slice(i, i + GELYK)
    const uitslae = await Promise.all(groep.map(async x => {
      try { return await doen(x) } catch { return false }
    }))
    uitslae.forEach((ok, j) => { ok ? geslaag++ : weer.push(groep[j]) })
  }

  /* Een herhaling, en net vir wat nie klaarblyklik dood is nie. */
  const probeerWeer = weer.filter(x => !isDood(x))
  let misluk = weer.length - probeerWeer.length

  if (probeerWeer.length) {
    await new Promise(r => setTimeout(r, 1200))
    for (let i = 0; i < probeerWeer.length; i += GELYK) {
      const groep = probeerWeer.slice(i, i + GELYK)
      const uitslae = await Promise.all(groep.map(async x => {
        try { return await doen(x) } catch { return false }
      }))
      for (const ok of uitslae) ok ? geslaag++ : misluk++
    }
  }

  return { geslaag, misluk, herhaal: probeerWeer.length }
}

/* ── Vra FCM watter tokens dood is, sonder om iets te stuur ──

   FCM se `validate_only` doen ALLES wat 'n gewone stuur doen — dit gaan die
   boodskap na en dit gaan die TOKEN na — en lewer dan niks af nie. Dit is die
   enigste manier om te weet hoeveel van 'n lys nog leef sonder om vir almal
   'n kennisgewing te stuur.

   Dit is nodig omdat 'n token gereeld verander en `ensureNotificationToken`
   'n NUWE dokument skryf sonder om die oue uit te vee. Die versameling groei
   dus vinniger as die aantal mense, en die verhouding "gestuur van totaal"
   lyk elke maand slegter sonder dat iets breek. */
async function isTokenLewendig(token, accessToken) {
  try {
    const r = await fetch(`https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        validate_only: true,
        message: { token, notification: { title: 'x', body: 'x' } },
      }),
    })
    if (r.ok) return true
    const err = await r.json().catch(() => ({}))
    const kode = err && err.error && err.error.status
    if (kode === 'UNREGISTERED' || kode === 'NOT_FOUND' || kode === 'INVALID_ARGUMENT') return false
    /* 'n 429 of 'n 503 se niks oor die foon nie. Ons noem dit lewendig —
       liewer 'n dooie token oorskat as 'n lewende een doodverklaar. */
    return true
  } catch { return true }
}

// ── Send one FCM message ───────────────────────────────────────────────────
async function sendFcm(token, title, body, accessToken, includeImage = true) {
  const r = await fetch(`https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        token,
        notification: { title, body },
        data: {
          ...(includeImage ? { image: 'https://dewaldscheepers.com/notification-image.jpg' } : {}),
          url: 'https://dewaldscheepers.com/',
        },
        webpush: {
          headers: { Urgency: 'high', TTL: '86400' },
        },
      },
    }),
  })
  if (!r.ok) {
    const err = await r.json().catch(() => ({}))
    /* UNREGISTERED en INVALID_ARGUMENT beteken die foon het die app
       verwyder of die token is verval. Dit is nie 'n fout wat oorgaan nie —
       daardie token gaan vir altyd misluk en elke stuur stadiger maak. Ons
       tel hulle apart sodat Dewald weet hoeveel van sy lys dood is. */
    const kode = err && err.error && err.error.status
    if (kode === 'UNREGISTERED' || kode === 'NOT_FOUND' || kode === 'INVALID_ARGUMENT') {
      dood++
      dooies.add(token)
    }
    console.warn('FCM failed:', token.slice(0, 20), JSON.stringify(err))
  }
  return r.ok
}

/* Hoeveel tokens dood is, en WATTER. Word per oproep teruggestel.

   Ons hou die dooies apart sodat 'n herhaling hulle nie weer probeer nie —
   'n foon wat die app verwyder het, gaan nie oor 'n sekonde terugkom nie. */
let dood = 0
let dooies = new Set()

/* ── Een sleutel vir dieselfde foon ──

   Samsung Internet se web-push loop deur FCM: die intekening se endpoint is
   `https://fcm.googleapis.com/…/<token>`, en `sendWebPush` haal daardie
   token uit en stuur hom deur `sendFcm`. Wanneer FCM sê die foon het die app
   verwyder, is dit dus die TOKEN wat in `dooies` beland.

   `isDood` het toe die volle endpoint gaan opsoek. Dié stem nooit ooreen
   nie, en die gevolg was stil: elke dooie Samsung-foon is by ELKE stuur
   weer geprobeer, en dan 'n tweede keer as dood getel. Die toets het dit
   uitgevang — 122 stuurpogings vir 120 intekenaars.

   Nou normaliseer albei kante dieselfde. */
function sleutelVir(x) {
  const s = typeof x === 'string' ? x : (x && x.endpoint) || ''
  return s.startsWith('https://fcm.googleapis.com/') ? s.split('/').pop() : s
}

function isDood(x) {
  return dooies.has(sleutelVir(x))
}

// ── Send one standard Web Push or FCM if endpoint is Google's ─────────────
async function sendWebPush(subscription, title, body, accessToken, includeImage = true) {
  // Samsung Internet on Android uses FCM as its push backend.
  // Extract the registration token and send via FCM v1 API.
  if (subscription.endpoint.startsWith('https://fcm.googleapis.com/')) {
    const token = subscription.endpoint.split('/').pop()
    return sendFcm(token, title, body, accessToken, includeImage)
  }
  // Genuine non-Google web push endpoint (e.g. Mozilla)
  if (!vapidGereed) return false
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ source: 'webpush', title, body, url: 'https://dewaldscheepers.com/', requireInteraction: true })
    )
    return true
  } catch (e) {
    console.warn('Web push failed:', e.message)
    return false
  }
}

// ── Handler ────────────────────────────────────────────────────────────────
/* ── Wie mag 'n kennisgewing aan ses duisend mense stuur ──

   Hier het gestaan: 'n geheim in die URL, en die admin het dit as
   `?secret=DaaglikseHoop2025Cron` saamgestuur. Daardie oproep sit in die
   app se JavaScript, en daardie JavaScript is openbaar. Enigiemand wat die
   lêer oopmaak, kon dus enige titel en enige boodskap aan al ses duisend
   mense stuur.

   Dit is presies dieselfde fout as die ou `ADMIN_PIN = '2025'` wat ons vir
   Pastorale Sorg reggemaak het: 'n string in die bondel beskerm niks.

   Nou is daar twee paaie in, en albei se geheim bestaan NET op Vercel:

     · die MENS stuur SORG_ADMIN_GEHEIM in 'n kopstuk — dieselfde wagwoord
       waarmee hy die admin oopgesluit het, wat nooit in die bondel is nie;
     · die OGGEND-OPROEP stuur CRON_SECRET, want 'n cron kan nie 'n
       wagwoord tik nie.

   Die vergelyking self staan in `_geheim.js`, want dieselfde slot sit ook op
   die e-poswerkry en op die toets-e-pos, en 'n geheim wat op vier plekke
   vergelyk word, is 'n geheim wat op drie plekke agterbly wanneer dit
   verander. */
module.exports = async function handler(req, res) {
  const wie = wieMag(req)
  if (!wie) {
    return res.status(401).send('Unauthorized')
  }

  const soek = req.query || {}
  /* ── Wat as die OUTOMATIESE oggendlopie tel ──

     Vercel se cron roep `/api/send-notifications?outo=1`. Maar hierdie
     kennisgewing mag nie aan 'n navraagstring hang nie: laat 'n herskrywing
     of 'n roete-reel daardie `?outo=1` ooit val, sou die oggendlopie as 'n
     HANDLOPIE tel, en dan is die dag-slot weg en kan almal twee
     kennisgewings kry.

     Dus tel enige lopie wat met CRON_SECRET ingekom het as outomaties. Net
     'n mens met die admin-wagwoord kry die vrye pad — en dit is presies
     reg, want dit is die een wat moet kan stuur wanneer hy wil. */
  const outomaties = wie === 'cron' || soek.outo === '1' || soek.outo === 'true'
  /* 'n Droëloop. Gaan alles na en stuur vir niemand. */
  const kykNet = soek.kyk === '1' || soek.kyk === 'true'

  if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    return res.status(500).json({ fout: 'FIREBASE_CLIENT_EMAIL of FIREBASE_PRIVATE_KEY ontbreek op Vercel' })
  }

  const body = req.body || {}
  const customTitle = body.title?.trim()
  const customBody  = body.body?.trim()
  const isCustom    = !!(customTitle || customBody)

  /* ── Die repetisie ──

     Die droëloop hierbo gaan alles na behalwe die een ding wat 'n mens
     werklik wil weet: kom daar 'n kennisgewing op 'n foon uit?

     Dit is die volle oggendlopie — dieselfde opskrif uit dieselfde nota,
     dieselfde teks, dieselfde prent, dieselfde stuurkode — maar die
     ontvangerslys is EEN token in plaas van ses duisend.

     Net 'n mens met die admin-wagwoord mag dit doen. 'n Cron nooit: dit sou
     beteken 'n verkeerd opgestelde cron kan stilweg net vir een mens stuur
     terwyl alles reg lyk. */
  const netEen = wie === 'admin' && typeof body.net === 'string' && body.net.trim()
    ? body.net.trim()
    : ''

  const begin = Date.now()

  /* ── Die droëloop ──

     Alles wat 'n egte lopie doen, tot NET voor die stuur: die diensrekening
     se teken, die twee lyste, die titel wat mense sou sien. Dan hou dit op.

     Dit bestaan omdat die enigste ander manier om te toets, is om ses duisend
     mense 'n kennisgewing te stuur. 'n Mens wil om nege-uur die aand kan weet
     of half-sewe die oggend gaan werk. */
  if (kykNet) {
    try {
      const accessToken = await getAccessToken()
      const [titel, tokens, subs] = await Promise.all([
        getTodayTitle(accessToken),
        getFcmTokens(accessToken),
        getWebPushSubscriptions(accessToken),
      ])
      /* ── Tel die dooies, sonder om te stuur ──

         Dit loop deur ELKE token met `validate_only`, dus vat dit sowat 'n
         halwe minuut by vyfduisend. Daarom is dit 'n APARTE knoppie en nie
         deel van die gewone nagaan nie — 'n mens wil nie dertig sekondes wag
         net om te sien of CRON_SECRET daar is nie. */
      let dooieTelling = null
      if (soek.dooies === '1') {
        let dooies = 0, lewend = 0
        for (let i = 0; i < tokens.length; i += GELYK) {
          const groep = tokens.slice(i, i + GELYK)
          const uitslae = await Promise.all(groep.map(x => isTokenLewendig(x, accessToken)))
          for (const ok of uitslae) ok ? lewend++ : dooies++
        }
        dooieTelling = { dooies, lewend, totaal: tokens.length }
      }

      const vandag = saDatum()
      const [vandagLopie, gisterLopie, toestemming] = await Promise.all([
        lopieVir({ projectId: PROJECT_ID, accessToken, dag: vandag }),
        lopieVir({ projectId: PROJECT_ID, accessToken, dag: saDatum(Date.now() - 86400000) }),
        leesToestemming(accessToken),
      ])
      return res.status(200).json({
        kyk: true,
        firebase: true,
        vapid: vapidGereed,
        cronGeheim: !!process.env.CRON_SECRET,
        adminGeheim: (process.env.SORG_ADMIN_GEHEIM || '').length >= 12,
        ontvangers: { fcm: tokens.length, webpush: subs.length, totaal: tokens.length + subs.length },
        boodskap: {
          titel: titel || 'Daaglikse Hoop',
          teks:  'Jou Daaglikse Hoop vir vandag is gereed. Tik om te luister.',
        },
        vandagSA: vandag,
        oggendlopies: { vandag: vandagLopie, gister: gisterLopie },
        dooieTelling,
        /* Waar toestelle staan — getel, nie afgetrek nie. Sien
           `api/tel-toestemming.js`. */
        toestemming,
        sekondes: Math.round((Date.now() - begin) / 100) / 10,
      })
    } catch (e) {
      return res.status(500).json({ kyk: true, fout: e.message })
    }
  }

  /* ── Die dag-slot ──

     Net vir die outomatiese lopie; 'n mens in die admin gaan altyd deur.
     Sien `_dagslot.js` vir waarom dit atomies moet wees. */
  const dag = saDatum()
  /* 'n Repetisie eis nooit die dag op nie. Sou dit, sou 'n toets om
     tienuur die aand die egte oggendlopie stilweg laat oorslaan het — en
     dan sou ses duisend mense niks gekry het nie, presies omdat iemand
     seker wou maak dit werk. */
  let hetGeeis = false
  let accessToken = null

  /* Een teken vir die hele lopie. Dit was twee — een vir die slot en een vir
     die stuur — en dit is twee kanse om te misluk waar een genoeg is. */
  try {
    accessToken = await getAccessToken()
  } catch (e) {
    console.error('send-notifications: geen toegangsteken', e)
    return res.status(500).json({ fout: 'Firebase-diensrekening werk nie: ' + e.message })
  }

  if (outomaties && !netEen) {
    const eis = await eisDag({ projectId: PROJECT_ID, accessToken, dag })
    if (!eis.geeis) {
      console.log('send-notifications: oorgeslaan —', eis.rede)
      return res.status(200).json({ oorgeslaan: true, dag, rede: eis.rede })
    }
    hetGeeis = true
  }

  let uitGestuur = 0

  try {
    const [todayTitle, fcmTokens, webPushSubs] = await Promise.all([
      customTitle ? Promise.resolve(customTitle) : getTodayTitle(accessToken),
      /* By 'n repetisie word die lyste glad nie gehaal nie. Dit is nie 'n
         optimering nie: dit maak dit onmoontlik dat 'n repetisie ooit by
         iemand anders se foon uitkom. */
      netEen ? Promise.resolve([netEen]) : getFcmTokens(accessToken),
      netEen ? Promise.resolve([])       : getWebPushSubscriptions(accessToken),
    ])

    const notifTitle   = todayTitle || 'Daaglikse Hoop'
    const notifBody    = customBody || 'Jou Daaglikse Hoop vir vandag is gereed. Tik om te luister.'
    const includeImage = !isCustom

    dood = 0
    dooies = new Set()

    const f = await inGroepe(fcmTokens,
      t => { uitGestuur++; return sendFcm(t, notifTitle, notifBody, accessToken, includeImage) })
    const w = await inGroepe(webPushSubs,
      s => { uitGestuur++; return sendWebPush(s, notifTitle, notifBody, accessToken, includeImage) })

    const result = {
      fcm:     { sent: f.geslaag, misluk: f.misluk, herhaal: f.herhaal, total: fcmTokens.length },
      webpush: { sent: w.geslaag, misluk: w.misluk, herhaal: w.herhaal, total: webPushSubs.length },
      /* Tokens van fone wat die app verwyder het. Hulle gaan nooit weer werk
         nie; dit is nie 'n fout wat oorgaan nie. */
      dood,
      /* Sonder VAPID gaan egte web-push (Firefox) nie deur nie. FCM werk
         steeds, en dit is die oorgrote meerderheid. */
      vapid: vapidGereed,
      /* Hoe lank dit gevat het.

         Dit is die getal wat 'n mens waarsku VOORDAT dit weer breek. Die
         vorige weergawe het een-vir-een gestuur, en toe die lys groei het
         die stuur oor Vercel se perk gegaan — die verbinding is halfpad
         gesny en die admin het 'Failed to fetch' gewys. Die kode het nie
         verander nie; die GETAL het.

         Sien Dewald hierdie sekondes opkruip na driehonderd toe, weet hy
         dit kom weer, en dan is dit 'n groter groep of 'n tweede lopie —
         nie 'n verrassing nie. */
      sekondes: Math.round((Date.now() - begin) / 100) / 10,
      ...(netEen ? { repetisie: true, opskrif: notifTitle, teks: notifBody } : {}),
      ...(outomaties && !netEen ? { outomaties: true, dag } : {}),
    }

    if (hetGeeis) {
      await merkKlaar({
        projectId: PROJECT_ID, accessToken, dag,
        uitslag: {
          gestuur:  f.geslaag + w.geslaag,
          totaal:   fcmTokens.length + webPushSubs.length,
          misluk:   f.misluk + w.misluk,
          /* Sonder hierdie getal is 'n lopie van "2589 van 4651" nie te
             verklaar nie: 'n mens weet nie of tweeduisend fone die app
             verwyder het en of daar iets stukkend is nie. Dit is die verskil
             tussen "die lys is oud" en "dit werk nie". */
          dood:     dood,
          sekondes: result.sekondes,
        },
      })
    }

    console.log('send-notifications:', JSON.stringify(result))
    return res.status(200).json(result)
  } catch (e) {
    console.error('send-notifications error', e)

    /* ── Gee die dag terug, maar net as niemand geraak is nie ──

       Val dit om by die teken of by die lys van tokens, is daar nog geen
       boodskap uit en 'n tweede probeerslag is skoon. Val dit halfpad om,
       bly die slot staan: die helfte wat reeds gekry het, moenie dit weer
       kry nie, en Dewald kan die res met die hand in die admin klaarmaak. */
    if (hetGeeis && uitGestuur === 0) {
      await geeDagTerug({ projectId: PROJECT_ID, accessToken, dag })
    }
    return res.status(500).json({ fout: e.message, dag, uitGestuur })
  }
}
