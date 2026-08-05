import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'


self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', event => {
  event.waitUntil(
    self.clients.claim().then(() =>
      self.clients.matchAll({ type: 'window' }).then(clients =>
        clients.forEach(c => c.postMessage({ type: 'SW_UPDATED' }))
      )
    )
  )
})

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
  /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
  new CacheFirst({
    cacheName: 'audio-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 })]
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
