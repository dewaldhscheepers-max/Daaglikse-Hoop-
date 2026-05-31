import { db } from '../firebase'
import { doc, setDoc, getDoc, increment } from 'firebase/firestore'

const today = () => new Date().toISOString().slice(0, 10)

// Fire-and-forget helpers — never block the UI
function write(docPath, data) {
  setDoc(doc(db, ...docPath.split('/')), data, { merge: true }).catch(() => {})
}

export function trackInstall() {
  if (localStorage.getItem('statsInstallCounted')) return
  localStorage.setItem('statsInstallCounted', '1')
  write('stats/global', { installs: increment(1) })
}

export function trackOpen() {
  if (sessionStorage.getItem('statsOpenCounted')) return
  sessionStorage.setItem('statsOpenCounted', '1')
  write(`stats/${today()}`, { opens: increment(1) })
}

export function trackNotifSubscriber() {
  if (localStorage.getItem('statsNotifCounted')) return
  localStorage.setItem('statsNotifCounted', '1')
  write('stats/global', { notifSubscribers: increment(1) })
}

export function trackPlay(noteId) {
  const key = `sp_${noteId}`
  if (sessionStorage.getItem(key)) return
  sessionStorage.setItem(key, '1')
  write(`stats/${today()}`, { plays: increment(1) })
  write('stats/global', { totalPlays: increment(1) })
}

export function trackPrayerRequest() {
  write('stats/global', { prayerRequests: increment(1) })
}

export function trackPrayedTap() {
  write('stats/global', { prayedTaps: increment(1) })
}

export function trackShare() {
  write('stats/global', { appShares: increment(1) })
}

export async function readStats() {
  try {
    const [globalSnap, todaySnap] = await Promise.all([
      getDoc(doc(db, 'stats', 'global')),
      getDoc(doc(db, 'stats', today()))
    ])
    return {
      ...(globalSnap.data() || {}),
      opensToday: todaySnap.data()?.opens || 0,
      playsToday: todaySnap.data()?.plays || 0,
    }
  } catch { return {} }
}
