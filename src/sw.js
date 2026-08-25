import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { cacheNames } from 'workbox-core'
import { registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { magKas } from './data/kasBesluit.js'


/* Verhoog hierdie getal om elke geinstalleerde app te dwing om sy
   looptyd-kasse weg te gooi en van voor af te laai.

   Hoekom dit bestaan: 'n geinstalleerde PWA op Android hou sy bladsy lewend
   in die agtergrond. 'n Mens "maak die app oop" en dit is dieselfde document
   as gister — dieselfde JavaScript, dieselfde veranderlikes in die geheue.
   Nuwe kode kan ontplooi wees, en 'n nuwe bate soos public/gab/ kan lewend
   wees, en die app sien dit nooit.

   Die enigste lêer wat 'n blaaier ALTYD vars gaan haal, is hierdie een
   (vercel.json sit max-age=0, must-revalidate op /sw.js). Die diensketter is
   dus die enigste hefboom wat van buite af werk.

   LET OP: die vooraf-kas word NOOIT hier uitgevee nie. Workbox bou hom
   tydens install, en om hom in activate weg te gooi laat die app met niks —
   dan werk aflyn nie meer nie. cleanupOutdatedCaches() vat die ou weergawes;
   hierdie een vat net die looptyd-kasse. */
/* 4: die ou `audio-cache` moet van ELKE foon af weg. Solank een stukkende
      klank-inskrywing daar staan, bly die stemboodskap stukkend — CacheFirst
      gee dieselfde liggaam elke dag weer terug. Hierdie is die enigste
      hefboom wat 'n foon bereik wat ons nie kan raak nie. */
/* ── SPOEL ──
 *
 * Verhoog dit wanneer 'n foon wat ons nie kan raak nie, se ou kas moet gaan.
 * Dit is die enigste hefboom wat daardie foon bereik. Sien CLAUDE.md.
 *
 * 5: Dra Mekaar se Laste — die name, die foto's en die opmerkings het almal
 * verander, en Dewald se vrou moes die app toe- en oopmaak voordat sy die
 * nuwe weergawe gesien het.
 * 6: die opmerkings mag 2 000 karakters wees en behou hul paragrawe; die muur
 * word nie meer op die rand gekas nie.
 * 7: die uitnodiging se woorde en die installasie-trechter.
 * 8: die dubbele `anoniem`-sleutel wat elke storie anoniem laat gaan het.
 * 9: die daaglikse plafon is weg — "Vandag se plekke is vol" mag nooit wys.
 * 10: "Luister na iemand" is nou Bid Saam se vloei, met 'n kassie.
 * 11: die storiekaart in daardie vloei het leeg gestaan — .sg-body se
 *     flex-kolom het die storieteks tot niks laat krimp. Nuwe muur-plasings
 *     wys nou dadelik agter die vloei, nie eers wanneer dit toemaak nie.
 * 12: die vloei wys nou net stories wat hierdie foon nog nie geantwoord het
 *     nie, en niks ouer as vier dae nie — soos Bid Saam s'n.
 * 13: die donasie-opspringer vra nou vir 'n Maandelikse Hoop-Vennoot OF 'n
 *     eenmalige bydrae, nie net eenmalig nie; en die Bybel-knoppie is nou 'n
 *     leesbare pil in plaas van "BYBEL" in 7.5px.
 * 14: daardie pil was te wyd en het oor "Vandag se wallpaper" se kaart gesit.
 *     Nou staan hy regs onder, kleiner.
 * 15: die Bybel-pil skuif 6mm hoër bo die balk, en is 'n bietjie groter.
 * 16: die admin kan nou een tik 'n video "vandag s'n" maak — voorheen het 'n
 *     bulk-invoer se video vir altyd agter die ou een gestaan.
 * 17: Week 3 — "Kom, volg My" — is bygekom. Die admin se voorskou het ook
 *     Week 2 se dae al die verkeerde (ou) skerm gewys sedert Week 2 bygekom
 *     het; dit gebruik nou dieselfde hetDae()-register as die egte skerm.
 * 18: die stemboodskap het op die verkeerde dag gestaan. Dit hoort by Dag 3
 *     ("Gee vir Jesus jou leë boot"), nie Dag 1 nie — met Dewald se egte
 *     woorde as transkripsie, ongewysig.
 * 19: "Maak in Bybel oop" het net die EERSTE stuk van 'n gedeelte met twee
 *     los verse-reekse in dieselfde hoofstuk gemerk en oopgemaak (bv.
 *     "Johannes 6:26–27, 66–69") — die tweede stuk het nooit gewys nie.
 * 20: nee, nie EEN knoppie wat albei stukke oopmaak nie — 'n LEES-kaart met
 *     twee los reekse kry nou twee aparte "Maak in Bybel oop"-knoppies.
 * 21: nuwe speletjie: Hou die Vlam.
 * 22: die tik-teiken was HELFTE so breed as die getekende goue sone — 'n
 *     tik binne die sigbare sone is soms as 'n mis getel. En die
 *     donasie-kaart is van die spel se skerm af weg. */
const SPOEL = 22

async function spoelLooptyd() {
  const hou = new Set([cacheNames.precache, cacheNames.googleAnalytics, 'dh-spoel'])
  const almal = await caches.keys()
  await Promise.all(almal.filter(n => !hou.has(n)).map(n => caches.delete(n)))
}

self.addEventListener('install', () => self.skipWaiting())

/* ── Wie sê hy hanteer sy eie herlaai ──
 *
 * 'n NUWE weergawe antwoord `EK_HANTEER` op `SW_UPDATED` en herlaai homself,
 * met sy eie hek vir klank (sien herlaaiBesluit.js). Daardie bladsy laat ons
 * uit.
 *
 * 'n OU weergawe antwoord niks. Sy kode ken hierdie ooreenkoms nie, en dit is
 * juis daardie fone wat vasgesteek sit — die reel wat forseer, sit ín die nuwe
 * weergawe, en 'n foon kan net gehoorsaam aan kode wat hy reeds het. Vir hulle
 * doen die diensketter dit self.
 *
 * Dewald: "push it hard so it is live on all phones. no need for them to press
 * the button." */
const hanteerders = new Set()
self.addEventListener('message', e => {
  const d = e && e.data
  if (d && d.type === 'EK_HANTEER' && e.source && e.source.id) hanteerders.add(e.source.id)
})

/* Hoe lank ons vir daardie antwoord wag. Lank genoeg dat 'n besige bladsy kan
   antwoord, kort genoeg dat 'n mens nie sit en kyk nie. */
const ANTWOORD_MS = 2000

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    try {
      const k = await caches.open('dh-spoel')
      const r = await k.match('nommer')
      const vorige = r ? Number(await r.text()) : null
      if (vorige !== SPOEL) {
        await spoelLooptyd()
        await k.put('nommer', new Response(String(SPOEL)))
      }
    } catch { /* 'n kas wat nie oopmaak nie mag nooit die aktivering keer nie */ }

    await self.clients.claim()

    /* Se vir elke oop bladsy om te herlaai. */
    const clients = await self.clients.matchAll({ type: 'window' })
    clients.forEach(c => c.postMessage({ type: 'SW_UPDATED' }))

    /* En herlaai self elkeen wat NIE geantwoord het nie.
     *
     * Dit is die enigste ding wat 'n foon bereik wat nog op die ou bundel
     * loop: hierdie leer is die een lêer wat 'n blaaier altyd vars gaan haal,
     * dus loop HIERDIE kode daar, ook al is die res van die app oud.
     *
     * Dit gebeur EEN keer per weergawe — `activate` vuur een keer — dus is
     * daar geen lus nie. Die bladsy wat hierna laai, word deur dieselfde
     * reeds-geaktiveerde ketter bedien en kry niks meer nie. */
    await new Promise(r => setTimeout(r, ANTWOORD_MS))
    const oor = await self.clients.matchAll({ type: 'window' })
    for (const c of oor) {
      if (hanteerders.has(c.id)) continue
      try { await c.navigate(c.url) } catch { /* 'n bladsy wat weg is, is klaar */ }
    }
  })())
})

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

/* Firebase Storage.
 *
 * LET WEL: hier was 'n CacheFirst op ALLES by hierdie gasheer, en die kas se
 * naam was `audio-cache`. Dit was die fout wat die stemboodskap laat stop het
 * voor die einde — dae aanmekaar, want CacheFirst gee dieselfde stukkende
 * liggaam weer en weer terug.
 *
 * 'n <audio> vra stukke met 'n Range-kop; 'n kas antwoord op die URL en weet
 * niks van Ranges nie. Sien src/data/kasBesluit.js vir die volle verhaal.
 *
 * Klank gaan nou reguit na die netwerk. Prente word steeds gekas — hulle vra
 * nooit Ranges nie en hulle kos data. `magKas()` is suiwer en het 'n toets;
 * moenie hierdie voorwaarde hier inlyn herskryf nie. */
registerRoute(
  ({ url, request }) => magKas(url.href, request.destination),
  new CacheFirst({
    cacheName: 'storage-prente',
    plugins: [
      /* Net 'n volledige 200 mag in die kas. Sonder hierdie hek kan 'n 206 of
         'n ondeursigtige antwoord land, en dan is die kas self die fout. */
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
)

/* Die Afrikaanse Bybel se boeke (/gab/GEN.json ...).

   Hulle word NIE vooraf gekas nie — dit is sowat 4 MB en dit sou die
   installasie opblaas vir mense wat die Bybel dalk nooit oopmaak nie.
   (globPatterns in vite.config.js sluit json doelbewus uit.)

   Wat wel gebeur: 'n boek wat jy een keer oopgemaak het, bly. Dit is die
   groot voordeel bo die Engelse vertalings, wat elke keer 'n bediener nodig
   het. Iemand met min data lees Johannes een keer en het hom daarna altyd.

   CacheFirst is reg omdat 'n vertaling se teks nie verander nie. Verander
   dit wel, verander die weergawe in indeks.json en dan haal ons die boeke
   opnuut — 66 inskrywings is genoeg vir die hele Bybel plus die indeks. */
registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/gab/'),
  new CacheFirst({
    cacheName: 'gab-bybel',
    plugins: [new ExpirationPlugin({ maxEntries: 70, maxAgeSeconds: 180 * 24 * 60 * 60 })]
  })
)

self.addEventListener('push', event => {
  if (!event.data) return
  let p = {}
  try { p = event.data.json() } catch { return }

  const title = p.notification?.title || p.data?.title || p.title
  if (!title) return

  const body  = p.notification?.body  || p.data?.body  || p.body  || ''
  const image = p.data?.image || p.notification?.image || p.image || ''
  const url   = p.data?.url   || p.url   || self.registration.scope

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:               '/icons/icon-192.png',
      badge:              '/icons/badge-72.svg',
      ...(image ? { image } : {}),
      requireInteraction: true,
      data:               { url }
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.startsWith(self.registration.scope) && 'focus' in client) {
          return client.focus()
        }
      }
      return clients.openWindow(self.registration.scope)
    })
  )
})
