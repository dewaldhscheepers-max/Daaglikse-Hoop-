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

// Firebase VAPID key (for Chrome/standard FCM)
const FCM_VAPID_KEY = 'BBG0lF3YGD7BRhdveAO3ufCkT4ze1EaAbncl2r2nfUZwQ-p77uijz3UMts3KYlbqK5U3Hn7OoD01XacY3j7JhPk'

// Our own VAPID public key (for Samsung Internet native web push)
const WEB_PUSH_VAPID_PUBLIC = 'BAnuOtTx2mu8dUar_e7CO-6a4edbIue7Qi2SMCav-ilvxJeh-W2uH4p93LCHNt4P_9A2uj3HyUoOfjulI2OmN5o'

export const isSamsungBrowser = /SamsungBrowser/i.test(navigator.userAgent)

const app        = initializeApp(firebaseConfig)
export const db  = getFirestore(app)
export const storage = getStorage(app)

export const messaging = (async () => {
  if (isSamsungBrowser) return null
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

async function subscribeWebPush() {
  const reg = await navigator.serviceWorker.ready
  // Unsubscribe first to force fresh subscription
  const existing = await reg.pushManager.getSubscription()
  if (existing) await existing.unsubscribe()
  return reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(WEB_PUSH_VAPID_PUBLIC)
  })
}

export async function subscribeToNotifications() {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return false

    if (isSamsungBrowser) {
      const sub = await subscribeWebPush()
      const subJson = sub.toJSON()
      const id = btoa(sub.endpoint).replace(/[^a-zA-Z0-9]/g, '').slice(0, 40)
      await setDoc(doc(db, 'webPushSubscriptions', id), {
        subscription: subJson,
        subscribedAt: serverTimestamp()
      })
      localStorage.setItem('webPushSubscribed', id)
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
  } catch {
    return false
  }
}

export async function ensureNotificationToken() {
  try {
    if (!('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    if (isSamsungBrowser) {
      if (localStorage.getItem('webPushSubscribed')) return
      await subscribeToNotifications()
      return
    }

    if (localStorage.getItem('fcmToken')) return
    const msg = await messaging
    if (!msg) return
    const swReg = await navigator.serviceWorker.ready
    const token = await getToken(msg, { vapidKey: FCM_VAPID_KEY, serviceWorkerRegistration: swReg })
    if (token) {
      await setDoc(doc(db, 'fcm_tokens', token), { token, subscribedAt: serverTimestamp() })
      localStorage.setItem('fcmToken', token)
    }
  } catch {}
}
