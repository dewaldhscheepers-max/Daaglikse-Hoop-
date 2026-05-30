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
  console.log('[FCM-SW] Received background message', JSON.stringify(payload))
  self.registration.showNotification(payload.notification?.title || 'Daaglikse Hoop', {
    body:  payload.notification?.body || '',
    icon:  '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data:  { url: payload.fcmOptions?.link || '/' }
  })
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data?.url || '/'))
})
