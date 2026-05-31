function track(type) {
  fetch('/api/track-stat', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ type }),
  }).catch(() => {})
}

export function trackInstall() {
  if (localStorage.getItem('statsInstallCounted')) return
  localStorage.setItem('statsInstallCounted', '1')
  track('install')
}

export function trackOpen() {
  if (sessionStorage.getItem('statsOpenCounted')) return
  sessionStorage.setItem('statsOpenCounted', '1')
  track('open')
}

export function trackNotifSubscriber() {
  if (localStorage.getItem('statsNotifCounted')) return
  localStorage.setItem('statsNotifCounted', '1')
  track('notif')
}

export function trackPlay(noteId) {
  const key = `sp_${noteId}`
  if (sessionStorage.getItem(key)) return
  sessionStorage.setItem(key, '1')
  track('play')
}

export function trackPrayerRequest() { track('prayer') }
export function trackPrayedTap()     { track('prayed') }
export function trackShare()         { track('share') }

export async function readStats() {
  try {
    const r = await fetch('/api/admin-stats?pin=2025')
    if (!r.ok) return {}
    return r.json()
  } catch { return {} }
}
