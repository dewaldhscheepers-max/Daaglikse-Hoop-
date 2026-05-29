// Firebase Cloud Messaging service worker
// This file must stay in /public so it is served from the root of your site.

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

// Paste the same firebaseConfig here when you connect Firebase
firebase.initializeApp({
  apiKey:            "AIzaSyD8fB-xYtMc9IOFGdfWIwFCsvFwb6Zj67s",
  authDomain:        "daaglikse-hoop.firebaseapp.com",
  projectId:         "daaglikse-hoop",
  storageBucket:     "daaglikse-hoop.firebasestorage.app",
  messagingSenderId: "395898489739",
  appId:             "1:395898489739:web:a250f1fdf0a8cc981ebd8e"
})

const messaging = firebase.messaging()

// Show notification when app is in the background
messaging.onBackgroundMessage(payload => {
  self.registration.showNotification(payload.notification.title, {
    body:    payload.notification.body,
    icon:    '/icons/icon-192.png',
    badge:   '/icons/icon-192.png',
    silent:  true,
    vibrate: [120],
    data:    { url: '/' }
  })
})

// Open the app when the user taps the notification
self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data?.url || '/'))
})
