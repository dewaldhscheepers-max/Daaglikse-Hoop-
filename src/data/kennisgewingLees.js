/* Die onsuiwer helfte van `kennisgewingStaat`.
 *
 * Alles wat 'n blaaier of 'n foon moet vertel, word HIER gelees en dan aan
 * die suiwer funksie oorhandig. Die besluit self staan in
 * kennisgewingStaat.js en word met plain node getoets; hierdie leer het net
 * een taak en dit is om eerlik te rapporteer.
 */
import { isInApp } from '../firebase'
import { isInheems, inheemseToestemming } from './inheemseKennisgewings'
import { kennisgewingStaat } from './kennisgewingStaat'

/* Android se 'prompt' en 'prompt-with-rationale' beteken albei "nog nooit
   gevra nie" — dieselfde as die web se 'default'. */
function normeer(staat) {
  return staat === 'granted' ? 'granted' : staat === 'denied' ? 'denied' : 'default'
}

/* Is daar 'n LEWENDE intekening op hierdie toestel?
 *
 * `localStorage` alleen is nie genoeg nie: dit oorleef 'n herinstallasie van
 * die app terwyl die intekening self weg is, en dan lyk 'n stil foon soos 'n
 * gesonde een. Waar die blaaier ons die egte antwoord kan gee — die
 * pushManager — gebruik ons dit. */
async function hetIntekening() {
  if (isInheems) {
    /* In die Play-app is die token die intekening. Ons skryf dit by elke
       oopmaak oor (houInheemseTokenVars), dus is dit vars of dit is weg. */
    try { return !!localStorage.getItem('fcmToken') } catch { return false }
  }

  try {
    if (!('serviceWorker' in navigator)) return false
    /* 'n Tydgrens, want `serviceWorker.ready` los soms nooit op nie — dit is
       dieselfde klas fout as Firestore se getDocs, en 'n merkie wat vir
       ewig "besig" is, is 'n merkie wat niemand vertrou nie. */
    const reg = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise(r => setTimeout(() => r(null), 4000)),
    ])
    if (!reg) return false
    if (reg.pushManager) {
      const sub = await reg.pushManager.getSubscription()
      if (sub) return true
    }
  } catch {}

  /* Firebase se getToken gebruik nie altyd 'n pushManager-intekening wat ons
     so kan sien nie. Wat ons laas geskryf het, is dan die beste antwoord. */
  try { return !!localStorage.getItem('fcmToken') } catch { return false }
}

export async function leesKennisgewingStaat() {
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

  let toestemming = 'default'
  if (isInheems) {
    toestemming = normeer(await inheemseToestemming())
  } else if (typeof Notification !== 'undefined') {
    toestemming = normeer(Notification.permission)
  }

  return kennisgewingStaat({
    kanPush: typeof Notification !== 'undefined' && 'PushManager' in window,
    inheems: isInheems,
    toestemming,
    hetIntekening: await hetIntekening(),
    isIOS,
    geinstalleer: isInApp,
  })
}

/* Die token wat die bediener moet toets. Sonder een is daar niks om te
   stuur nie, en dan is die eerlike antwoord dat hierdie foon nie ingeteken
   is nie. */
export function huidigeToken() {
  try { return localStorage.getItem('fcmToken') || null } catch { return null }
}
