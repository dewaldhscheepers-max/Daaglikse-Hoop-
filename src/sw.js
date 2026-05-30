import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { initializeApp } from 'firebase/app'
import { getMessaging } from 'firebase/messaging/sw'

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

const firebaseApp = initializeApp({
  apiKey:            'AIzaSyD8fB-xYtMc9IOFGdfWIwFCsvFwb6Zj67s',
  authDomain:        'daaglikse-hoop.firebaseapp.com',
  projectId:         'daaglikse-hoop',
  storageBucket:     'daaglikse-hoop.firebasestorage.app',
  messagingSenderId: '395898489739',
  appId:             '1:395898489739:web:a250f1fdf0a8cc981ebd8e'
})

// Handles FCM pushes for Chrome/standard browsers automatically
getMessaging(firebaseApp)

// Handles standard Web Push for Samsung Internet (payload tagged source:'webpush')
self.addEventListener('push', event => {
  if (!event.data) return
  let data = {}
  try { data = event.data.json() } catch { return }
  if (data.source !== 'webpush') return  // let Firebase handle FCM pushes
  const opts = {
    body:               data.body || '',
    icon:               '/icons/icon-192.png',
    badge:              '/icons/icon-192.png',
    requireInteraction: !!data.requireInteraction,
    data:               { url: data.url || '/' }
  }
  if (data.image) opts.image = data.image
  event.waitUntil(self.registration.showNotification(data.title || 'Daaglikse Hoop', opts))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ('focus' in client) return client.focus()
      }
      return clients.openWindow(url)
    })
  )
})
