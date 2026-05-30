import { initializeApp }              from 'firebase/app'
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { getStorage }                 from 'firebase/storage'
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

export const isSamsungBrowser = /SamsungBrowser/i.test(navigator.userAgent)

const app        = initializeApp(firebaseConfig)
export const db  = getFirestore(app)
export const storage = getStorage(app)

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
  if (permission !== 'granted') return false

  // Samsung Internet uses FCM under the hood — subscribe via pushManager with
  // Firebase's VAPID key so the token is valid for the FCM v1 API
  if (isSamsungBrowser) {
    const reg = await navigator.serviceWorker.ready
    const existing = await reg.pushManager.getSubscription()
    if (existing) await existing.unsubscribe()
    const sub   = await reg.pushManager.subscribe({
      userVisibleOnly:      true,
      applicationServerKey: urlBase64ToUint8Array(FCM_VAPID_KEY)
    })
    const token = sub.endpoint.split('/').pop()
    await setDoc(doc(db, 'fcm_tokens', token), { token, subscribedAt: serverTimestamp() })
    localStorage.setItem('fcmToken', token)
    localStorage.removeItem('webPushSubscribed')
    return true
  }

  const msg = await messaging
  if (!msg) return false
  const swReg = await navigator.serviceWorker.ready
  const token = await getToken(msg, { vapidKey: FCM_VAPID_KEY, serviceWorkerRegistration: swReg })
  if (token) {
    await setDoc(doc(db, 'fcm_tokens', token), { token, subscribedAt: serverTimestamp() })
    localStorage.setItem('fcmToken', token)
    return true
  }
  return false
}

export async function ensureNotificationToken() {
  try {
    if (!('Notification' in window)) return
    if (Notification.permission !== 'granted') return
    if (localStorage.getItem('fcmToken')) return
    await subscribeToNotifications()
  } catch {}
}
