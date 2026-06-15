import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'


self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
  /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
  new CacheFirst({
    cacheName: 'audio-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 })]
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
