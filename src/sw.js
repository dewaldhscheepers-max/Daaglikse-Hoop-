import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
  /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
  new CacheFirst({
    cacheName: 'audio-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 })]
  })
)

// ── Firebase Cloud Messaging ──
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey:            'AIzaSyD8fB-xYtMc9IOFGdfWIwFCsvFwb6Zj67s',
  authDomain:        'daaglikse-hoop.firebaseapp.com',
  projectId:         'daaglikse-hoop',
  storageBucket:     'daaglikse-hoop.firebasestorage.app',
  messagingSenderId: '395898489739',
  appId:             '1:395898489739:web:a250f1fdf0a8cc981ebd8e'
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage(payload => {
  self.registration.showNotification(payload.notification?.title || 'Daaglikse Hoop', {
    body:  payload.notification?.body || '',
    icon:  '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data:  { url: '/' }
  })
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data?.url || '/'))
})
