// ─────────────────────────────────────────────────
// STAP 1: Skep jou Firebase projek op https://console.firebase.google.com
// STAP 2: Plak jou konfigurasie hier in (vervang al die "YOUR_..." waardes)
// ─────────────────────────────────────────────────

import { initializeApp } from 'firebase/app'
import { getFirestore }  from 'firebase/firestore'
import { getStorage }    from 'firebase/storage'
import { getMessaging, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
  measurementId:     "YOUR_MEASUREMENT_ID"
}

const app       = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Messaging is only supported in modern browsers (not iOS Safari as a PWA)
export const messaging = (async () => {
  const supported = await isSupported()
  return supported ? getMessaging(app) : null
})()
