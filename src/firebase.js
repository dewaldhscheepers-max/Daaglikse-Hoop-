import { initializeApp }              from 'firebase/app'
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { getStorage }                 from 'firebase/storage'
import { getMessaging, isSupported, getToken } from 'firebase/messaging'

const firebaseConfig = {
  apiKey:            "AIzaSyD8fB-xYtMc9IOFGdfWIwFCsvFwb6Zj67s",
  authDomain:        "daaglikse-hoop.firebaseapp.com",
  projectId:         "daaglikse-hoop",
  storageBucket:     "daaglikse-hoop.firebasestorage.app",
  messagingSenderId: "395898489739",
  appId:             "1:395898489739:web:a250f1fdf0a8cc981ebd8e"
}

const VAPID_KEY = 'BBG0lF3YGD7BRhdveAO3ufCkT4ze1EaAbncl2r2nfUZwQ-p77uijz3UMts3KYlbqK5U3Hn7OoD01XacY3j7JhPk'

const app        = initializeApp(firebaseConfig)
export const db  = getFirestore(app)
export const storage = getStorage(app)

export const messaging = (async () => {
  const supported = await isSupported()
  return supported ? getMessaging(app) : null
})()

async function getFcmToken(msg) {
  // Explicitly register the Firebase SW so getToken always finds it
  let swReg
  try {
    swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' })
  } catch {
    swReg = await navigator.serviceWorker.ready
  }
  return getToken(msg, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg })
}

export async function subscribeToNotifications() {
  try {
    const msg = await messaging
    if (!msg) return false
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return false
    const token = await getFcmToken(msg)
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

// Called silently on app load — re-subscribes if permission is granted but token was never saved
export async function ensureNotificationToken() {
  try {
    if (!('Notification' in window)) return
    if (Notification.permission !== 'granted') return
    if (localStorage.getItem('fcmToken')) return
    const msg = await messaging
    if (!msg) return
    const token = await getFcmToken(msg)
    if (token) {
      await setDoc(doc(db, 'fcm_tokens', token), { token, subscribedAt: serverTimestamp() })
      localStorage.setItem('fcmToken', token)
    }
  } catch {}
}
