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

// Initialising Firebase messaging registers its own push event handler
// which automatically displays notifications when the app is in the background.
getMessaging(firebaseApp)

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data?.url || '/'))
})
