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
  try {
    if (auth.currentUser) return auth.currentUser.uid
    const { user } = await signInAnonymously(auth)
    return user.uid
  } catch {
    let uid = localStorage.getItem('vp_anon_uid')
    if (!uid) {
      uid = 'loc-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
      localStorage.setItem('vp_anon_uid', uid)
    }
    return uid
  }
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

/* ── Samsung Internet ──

   Samsung Internet kry al hierdie tyd GEEN kennisgewing-vraag nie. Die app
   wys hom 'n "maak in Chrome oop"-balkie en verder niks, en druk hy daardie
   balkie weg, is dit vir altyd weg. Die bewys staan in Firestore: die
   `webPushSubscriptions`-versameling het presies EEN inskrywing, en dit is
   Dewald se eie toets.

   Op 'n Suid-Afrikaanse app waar Samsung-fone oral is, is dit nie 'n randgeval
   nie. Dit is 'n hele groep mense wat nooit gevra is nie.

   Samsung Internet doen nie Firebase se `getToken()` nie, maar dit doen wel
   die gewone `pushManager` van die web. En sy eindpunt is Google s'n —
   `https://fcm.googleapis.com/…` — wat beteken die bediener herken dit en
   stuur dit deur FCM met die diensrekening, presies soos 'n gewone token.
   Daardie kode bestaan reeds in `api/send-notifications.js`; dit het net
   nooit iemand gehad om na te stuur nie.

   Dieselfde VAPID-sleutel as Firebase s'n, want die intekening moet aan
   hierdie projek behoort. */
function grepeUitBasis64(basis64) {
  const opgevul = (basis64 + '='.repeat((4 - basis64.length % 4) % 4))
    .replace(/-/g, '+').replace(/_/g, '/')
  const rou = atob(opgevul)
  const uit = new Uint8Array(rou.length)
  for (let i = 0; i < rou.length; i++) uit[i] = rou.charCodeAt(i)
  return uit
}

export async function subscribeSamsung() {
  if (!('Notification' in window)) return { ok: false, reason: 'nie_ondersteun' }
  if (!('PushManager' in window))  return { ok: false, reason: 'nie_ondersteun' }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return { ok: false, reason: 'permission_denied' }

  const swReg = await navigator.serviceWorker.ready

  /* 'n Bestaande intekening word hergebruik. Sou ons blindelings weer
     inteken, kry ons 'n fout omdat daar reeds een is — en dan sou dit lyk
     of dit nie werk nie terwyl alles reg is. */
  let sub = await swReg.pushManager.getSubscription()
  if (!sub) {
    sub = await swReg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: grepeUitBasis64(FCM_VAPID_KEY),
    })
  }
  if (!sub) return { ok: false, reason: 'geen_intekening' }

  const rou = sub.toJSON()
  if (!rou.endpoint || !rou.keys?.p256dh || !rou.keys?.auth) {
    return { ok: false, reason: 'onvolledige_intekening' }
  }

  /* Die dokument se naam is 'n has van die eindpunt, nie die eindpunt self
     nie: 'n eindpunt is lank en bevat karakters wat nie in 'n Firestore-naam
     mag wees nie. Dieselfde foon skryf dus altyd dieselfde dokument oor in
     plaas van 'n nuwe een by te sit. */
  const id = await hasVanTeks(rou.endpoint)
  await setDoc(doc(db, 'webPushSubscriptions', id), {
    subscription: { endpoint: rou.endpoint, keys: { p256dh: rou.keys.p256dh, auth: rou.keys.auth } },
    subscribedAt: serverTimestamp(),
  })
  localStorage.setItem('webPushId', id)
  return { ok: true }
}

async function hasVanTeks(teks) {
  const grepe  = new TextEncoder().encode(teks)
  const digest = await crypto.subtle.digest('SHA-256', grepe)
  return [...new Uint8Array(digest)].slice(0, 16)
    .map(b => b.toString(16).padStart(2, '0')).join('')
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
