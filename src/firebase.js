import { initializeApp }              from 'firebase/app'
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { getStorage }                 from 'firebase/storage'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { getMessaging, isSupported, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey:            "AIzaSyD8fB-xYtMc9IOFGdfWIwFCsvFwb6Zj67s",
  authDomain:        "daaglikse-hoop.firebaseapp.com",
  projectId:         "daaglikse-hoop",
  storageBucket:     "daaglikse-hoop.firebasestorage.app",
  messagingSenderId: "395898489739",
  appId:             "1:395898489739:web:a250f1fdf0a8cc981ebd8e"
}

const FCM_VAPID_KEY = 'BBG0lF3YGD7BRhdveAO3ufCkT4ze1EaAbncl2r2nfUZwQ-p77uijz3UMts3KYlbqK5U3Hn7OoD01XacY3j7JhPk'

export const isSamsungBrowser  = /SamsungBrowser/i.test(navigator.userAgent)
export const isFacebookBrowser = /FBAN|FBAV|FBIOS|FB_IAB/.test(navigator.userAgent)

const app        = initializeApp(firebaseConfig)
export const db  = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)

export async function getOrCreateAnonUid() {
  if (auth.currentUser) return auth.currentUser.uid
  const { user } = await signInAnonymously(auth)
  return user.uid
}

export const messaging = (async () => {
  const supported = await isSupported()
  if (!supported) return null
  const msg = getMessaging(app)
  onMessage(msg, payload => {
    navigator.serviceWorker.ready.then(reg => {
      reg.showNotification(payload.notification?.title || 'Daaglikse Hoop', {
        body:  payload.notification?.body || '',
        icon:  '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        data:  { url: '/' }
      })
    }).catch(() => {})
  })
  return msg
})()

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export async function subscribeToNotifications() {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return { ok: false, reason: 'permission_denied' }

  const msg = await messaging
  if (!msg) return { ok: false, reason: 'messaging_not_supported' }
  const swReg = await navigator.serviceWorker.ready
  const token = await getToken(msg, { vapidKey: FCM_VAPID_KEY, serviceWorkerRegistration: swReg })
  if (!token) return { ok: false, reason: 'no_token' }
  await setDoc(doc(db, 'fcm_tokens', token), { token, subscribedAt: serverTimestamp() })
  localStorage.setItem('fcmToken', token)
  return { ok: true }
}

export async function ensureNotificationToken() {
  try {
    if (!('Notification' in window)) return
    if (Notification.permission !== 'granted') return
    const msg = await messaging
    if (!msg) return
    const swReg = await navigator.serviceWorker.ready
    const token = await getToken(msg, { vapidKey: FCM_VAPID_KEY, serviceWorkerRegistration: swReg })
    if (!token) return
    const stored = localStorage.getItem('fcmToken')
    if (stored === token) return
    await setDoc(doc(db, 'fcm_tokens', token), { token, subscribedAt: serverTimestamp() })
    localStorage.setItem('fcmToken', token)
  } catch {}
}
