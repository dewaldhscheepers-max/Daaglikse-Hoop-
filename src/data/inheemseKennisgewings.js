/* ── Kennisgewings in die REGTE Android-app ──
 *
 * Waarom hierdie leer bestaan
 * ───────────────────────────
 * Die eerste Play-weergawe was 'n TWA: nie 'n app nie, maar 'n houer wat vir
 * die foon se: "maak my webwerf oop in die verstek-blaaier, sonder die
 * adresbalk". Op 'n Samsung is daardie blaaier Samsung Internet.
 *
 * Dit beteken die kennisgewing was nooit ons s'n nie. Samsung Internet het
 * dit ontvang en moes dit dan aan ons ikoon OORHANDIG. Daardie oorhandiging
 * is stukkend. Dewald en sy vrou het albei "Toelaat" gedruk, die stelsel het
 * "Managed by Daaglikse Hoop" gewys, FCM het die boodskap aanvaar met 'n
 * boodskap-id — en niks het op die foon verskyn nie.
 *
 * Nou dra die app sy eie WebView saam en praat SELF met Android, deur
 * Firebase se inheemse SDK. Samsung Internet is heeltemal uit die prentjie.
 * Dit is hoe elke ander app in die winkel dit doen.
 *
 * Wat NIE verander nie
 * ────────────────────
 * Die token gaan na presies dieselfde plek as die web s'n: `fcm_tokens/<token>`
 * met 'n `token`-veld. `api/send-notifications.js` lees `fields.token.stringValue`
 * en weet nie — en hoef nie te weet — waar dit vandaan kom nie. Geen
 * bedienerverandering nie.
 *
 * Wat 'n mens moet oppas
 * ──────────────────────
 * Die app laai die LEWENDE webwerf (sien capacitor.config.json). Dieselfde
 * bundel loop dus in Chrome, in Samsung Internet en in die app. Sou die
 * web-kant se push HIER ook registreer, het een mens twee tokens en kry hy
 * die oggendboodskap TWEE keer. Daarom is `isInheems` die skakelaar en moet
 * elke oproeper dit gebruik — nooit albei paaie nie.
 */
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

/* Loop ons binne die Android-app, of in 'n gewone blaaier?
 *
 * Capacitor spuit `window.Capacitor` in voordat die bladsy laai, dus is dit
 * reeds hier teen die tyd dat hierdie module invoer. In 'n blaaier is dit
 * eenvoudig `false` en niks hieronder loop ooit nie. */
export const isInheems = (() => {
  try { return Capacitor.isNativePlatform() } catch { return false }
})()

/* ── Die token kom deur 'n gebeurtenis, nie 'n antwoord nie ──
 *
 * `register()` gee niks terug nie; die token daag later by die
 * `registration`-luisteraar op. Die luisteraars word EEN keer opgestel — 'n
 * nuwe paar by elke probeerslag stapel op en dan loop elke latere token deur
 * al die oues.
 *
 * `wagtendes` is wie tans wag. Kom die token, kry almal dit; misluk dit of
 * loop die tyd uit, kry almal `null`. Niemand hang nie. */
const wagtendes = []
let luisteraarsOp = false

function losAlmal(token) {
  while (wagtendes.length) wagtendes.pop()(token)
}

async function sitLuisteraarsOp() {
  if (luisteraarsOp) return
  luisteraarsOp = true
  try {
    await PushNotifications.addListener('registration', t => losAlmal(t?.value || null))
    await PushNotifications.addListener('registrationError', () => losAlmal(null))
  } catch {
    luisteraarsOp = false
  }
}

/* 20 sekondes. FCM se eerste registrasie op 'n nuwe toestel gaan oor die
 * netwerk en op 'n stadige verbinding vat dit werklik 'n paar sekondes.
 * Korter en ons noem 'n gesonde foon 'n mislukking. */
const TOKEN_TYDGRENS = 20000

function wagVirToken() {
  return new Promise(resolve => {
    let klaar = false
    const eenkeer = t => {
      if (klaar) return
      klaar = true
      /* Haal onsself uit die ry uit. Loop die tyd uit en die token daag 'n
         minuut later op, moet hierdie inskrywing lankal weg wees — anders
         groei die ry by elke probeerslag. */
      const i = wagtendes.indexOf(eenkeer)
      if (i !== -1) wagtendes.splice(i, 1)
      resolve(t)
    }
    wagtendes.push(eenkeer)
    setTimeout(() => eenkeer(null), TOKEN_TYDGRENS)
  })
}

async function stoorToken(token) {
  if (!token) return false
  /* Dieselfde vorm as die web-kant s'n in src/firebase.js. `platform` is
     nuut en word deur die bediener geignoreer — dit is net sodat 'n mens
     later in die admin kan sien waar 'n token vandaan kom. */
  await setDoc(doc(db, 'fcm_tokens', token), {
    token,
    platform: 'android',
    subscribedAt: serverTimestamp(),
  })
  try { localStorage.setItem('fcmToken', token) } catch {}
  return true
}

/* ── Vra, en teken in ──
 *
 * Word geroep wanneer die mens "Ja, stuur dit vir my" druk.
 *
 * Op Android 13+ wys `requestPermissions()` die stelsel se eie venster. Dit
 * is die venster wat in die TWA nooit gekom het nie, want 'n TWA het geen
 * eie toestemming nie — dit het die blaaier s'n geleen.
 *
 * Gee terug `{ ok, reason }`, dieselfde vorm as subscribeToNotifications()
 * sodat App.jsx nie hoef te weet watter pad geloop het nie. */
export async function tekenInInheems() {
  if (!isInheems) return { ok: false, reason: 'nie_inheems' }
  try {
    let staat = await PushNotifications.checkPermissions()
    if (staat.receive === 'prompt' || staat.receive === 'prompt-with-rationale') {
      staat = await PushNotifications.requestPermissions()
    }
    if (staat.receive !== 'granted') return { ok: false, reason: 'permission_denied' }

    await sitLuisteraarsOp()
    const wag = wagVirToken()
    await PushNotifications.register()
    const token = await wag
    if (!token) return { ok: false, reason: 'geen_token' }

    await stoorToken(token)
    return { ok: true }
  } catch (e) {
    return { ok: false, reason: 'fout', fout: String(e && e.message || e) }
  }
}

/* ── Hou die token vars ──
 *
 * 'n FCM-token verander vanself: by 'n herinstallasie, wanneer Android die
 * app se berging skoonmaak, en soms sommer net. Verander dit en niemand
 * skryf die nuwe een op nie, dan bly die foon stil terwyl alles reg lyk.
 *
 * Word by elke oopmaak geroep vir wie REEDS ja gese het. Dit vra niks en wys
 * niks — die toestemming is klaar daar. */
export async function houInheemseTokenVars() {
  if (!isInheems) return
  try {
    const staat = await PushNotifications.checkPermissions()
    if (staat.receive !== 'granted') return

    await sitLuisteraarsOp()
    const wag = wagVirToken()
    await PushNotifications.register()
    const token = await wag
    if (!token) return

    let vorige = null
    try { vorige = localStorage.getItem('fcmToken') } catch {}
    if (vorige === token) return
    await stoorToken(token)
  } catch {}
}

/* ── Wanneer iemand die kennisgewing druk ──
 *
 * Die app is dan reeds oop of word oopgemaak. Ons stuur hom na Luister toe,
 * want dit is waar die oggendboodskap sit — dieselfde plek as waarheen die
 * web-kennisgewing se `data.url` wys.
 *
 * `opTik` word van App.jsx af ingegee sodat hierdie leer niks van skerms of
 * navigasie hoef te weet nie. */
export async function luisterInheemseTikke(opTik) {
  if (!isInheems) return () => {}
  try {
    const handvatsel = await PushNotifications.addListener(
      'pushNotificationActionPerformed',
      () => { try { opTik() } catch {} },
    )
    return () => { try { handvatsel.remove() } catch {} }
  } catch {
    return () => {}
  }
}

/* Is die toestemming reeds geweier? Dan wys ons die stappe eerder as om weer
 * te vra — Android wys die venster nie 'n tweede keer nie. */
export async function inheemseToestemming() {
  if (!isInheems) return null
  try {
    const staat = await PushNotifications.checkPermissions()
    return staat.receive          /* 'granted' | 'denied' | 'prompt' | … */
  } catch {
    return null
  }
}
