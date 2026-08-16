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
const SPOEL = 4

async function spoelLooptyd() {
  const hou = new Set([cacheNames.precache, cacheNames.googleAnalytics, 'dh-spoel'])
  const almal = await caches.keys()
  await Promise.all(almal.filter(n => !hou.has(n)).map(n => caches.delete(n)))
}

self.addEventListener('install', () => self.skipWaiting())

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

    /* En se vir elke oop bladsy om te herlaai. Die app luister hierna in
       main.jsx en in App.jsx, en doen dit al lank — ook die ou weergawes wat
       nou op mense se fone loop. Dit is hoekom hierdie boodskap 'n ou app kan
       red. */
    const clients = await self.clients.matchAll({ type: 'window' })
    clients.forEach(c => c.postMessage({ type: 'SW_UPDATED' }))
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
