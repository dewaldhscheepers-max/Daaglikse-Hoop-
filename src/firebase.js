import { initializeApp } from 'firebase/app'
import { getFirestore }  from 'firebase/firestore'
import { getStorage }    from 'firebase/storage'
import { getMessaging, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey:            "AIzaSyD8fB-xYtMc9IOFGdfWIwFCsvFwb6Zj67s",
  authDomain:        "daaglikse-hoop.firebaseapp.com",
  projectId:         "daaglikse-hoop",
  storageBucket:     "daaglikse-hoop.firebasestorage.app",
  messagingSenderId: "395898489739",
  appId:             "1:395898489739:web:a250f1fdf0a8cc981ebd8e"
}

const app        = initializeApp(firebaseConfig)
export const db  = getFirestore(app)
export const storage = getStorage(app)

export const messaging = (async () => {
  const supported = await isSupported()
  return supported ? getMessaging(app) : null
})()
