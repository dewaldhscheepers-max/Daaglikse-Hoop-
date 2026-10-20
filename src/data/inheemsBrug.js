/* ── Die brug tussen die webkode en die Android-app ──
 *
 * Die app (Capacitor, `android/`) laai die LEWENDE webwerf in sy eie WebView.
 * Dieselfde bundel loop dus in Chrome en in die app — en drie dinge wat in
 * Chrome werk, doen in 'n WebView NIKS:
 *
 *   1. `navigator.share` bestaan nie. Elke Deel-knoppie val terug op 'n
 *      knipbord of 'n wa.me-skakel, en 'n PRENT kan glad nie gedeel word nie.
 *   2. 'n Blob-aflaai (`<a download href="blob:…">`, "Stoor die wallpaper")
 *      doen niks: Capacitor gee die WebView geen aflaai-hanteerder nie. Die
 *      mens druk en daar gebeur stilweg niks — die ergste soort knoppie.
 *   3. `window.open` na 'n ander werf maak geen tweede venster nie.
 *   5. 'n Gedeelde skakel (/hoop/…, /bid/…, /reels/…) wat die app oopmaak,
 *      land op die TUISBLAD: Capacitor laai altyd `server.url`. Die brug lees
 *      die skakel en gaan daarheen. Sien `appBestemming`.
 *   4. Die foon se TERUG-knoppie op die tuisblad doen niks. Sonder 'n
 *      luisteraar gaan Capacitor net terug as daar geskiedenis is; daarna is
 *      die knoppie dood en 'n mens kan nie uit die app kom nie.
 *   6. Die stemboodskap hou op speel kort nadat die SKERM afgaan. Chrome het
 *      'n voorgronddiens vir klank; 'n WebView nie, en dan vries Android die
 *      app. Sien `klankBrug`.
 *
 * Hierdie lêer maak al drie reg op EEN plek, sodat geen skerm hoef te weet of
 * hy in 'n app loop nie. Dit doen NIKS buite die app nie: `installeer()` kyk
 * eers na `Capacitor.isNativePlatform()` en gaan dan terug.
 *
 * Die besluite (`isVreemdeAdres`, `veiligeNaam`, `isKanselleer`) is suiwer en
 * het toetse in `inheemsBrug.toets.mjs`. Die draad (die inproppe) kan net op
 * 'n regte foon getoets word — sien docs/android-app.md se toetslys.
 */
import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { App } from '@capacitor/app'
import { MediaSession } from '@capgo/capacitor-media-session'

/* Is hierdie adres 'n ANDER werf as die app s'n?
 *
 * Net http(s) na 'n ander gasheer tel. `mailto:`, `tel:` en relatiewe paaie
 * gaan hul gewone gang. Gaan iets mis met die ontleding, is die antwoord nee —
 * dan gebeur presies wat altyd gebeur het. */
export function isVreemdeAdres(url, eieGasheer) {
  try {
    const u = new URL(String(url), 'https://' + eieGasheer + '/')
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false
    return u.host.toLowerCase() !== String(eieGasheer).toLowerCase()
  } catch {
    return false
  }
}

const UITBREIDING = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
  'application/pdf': 'pdf', 'application/json': 'json', 'text/csv': 'csv', 'text/plain': 'txt',
  'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/webm': 'webm',
}

/* 'n Lêernaam wat veilig op die foon se skyf kan staan.
 *
 * Die naam kom van die bladsy af, en 'n naam met `/` of `..` sou buite die
 * kas-vouer kon skryf. Alles behalwe letters, syfers, `-`, `_` en `.` word 'n
 * streep. Het die naam geen uitbreiding nie, kry dit een uit die tipe — anders
 * weet die ontvangende app nie wat dit is nie. */
export function veiligeNaam(naam, tipe) {
  let n = String(naam || '').split(/[\\/]/).pop() || ''
  n = n.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^[.-]+/, '').slice(0, 80)
  if (!n) n = 'daaglikse-hoop'
  if (!/\.[A-Za-z0-9]{2,5}$/.test(n)) {
    const ext = UITBREIDING[String(tipe || '').split(';')[0].trim().toLowerCase()]
    if (ext) n += '.' + ext
  }
  return n
}

/* Het die mens die deel-venster self toegemaak? Dan moet dit 'n AbortError
 * word — elke skerm in hierdie app vang JUIS daardie naam en sê dan niks. */
export function isKanselleer(e) {
  const m = String((e && (e.message || e.errorMessage)) || e || '')
  return /cancel/i.test(m)
}

function abortFout() {
  try { return new DOMException('Share canceled', 'AbortError') }
  catch { const e = new Error('Share canceled'); e.name = 'AbortError'; return e }
}

function na64(blob) {
  return new Promise((los, verwerp) => {
    const r = new FileReader()
    r.onload = () => los(String(r.result).split(',')[1] || '')
    r.onerror = () => verwerp(r.error)
    r.readAsDataURL(blob)
  })
}

/* Skryf 'n blob na die app se KAS en gee sy adres terug. Die kas, want die
   foon ruim dit self op, en die deel-venster het net 'n adres nodig. */
async function skryfNaKas(blob, naam) {
  const r = await Filesystem.writeFile({
    path: veiligeNaam(naam, blob.type),
    data: await na64(blob),
    directory: Directory.Cache,
  })
  return r.uri
}

async function deel(data = {}) {
  const leers = Array.from((data && data.files) || [])
  try {
    const files = []
    for (let i = 0; i < leers.length; i++) {
      files.push(await skryfNaKas(leers[i], leers[i].name || ('prent-' + (i + 1))))
    }
    await Share.share({
      title: data.title || undefined,
      text: data.text || undefined,
      url: data.url || undefined,
      files: files.length ? files : undefined,
      dialogTitle: 'Deel',
    })
  } catch (e) {
    if (isKanselleer(e)) throw abortFout()
    throw e
  }
}

/* "Stoor" in die app: dieselfde deel-venster, met die lêer daarin. Daar
   kies 'n mens Galery, Lêers, Drive of WhatsApp — 'n WebView het geen
   Aflaaie-vouer wat ons kan bereik nie. */
async function stoor(href, naam) {
  try {
    const blob = await (await fetch(href)).blob()
    const uri = await skryfNaKas(blob, naam)
    await Share.share({ files: [uri], dialogTitle: 'Stoor of deel' })
  } catch (e) {
    if (!isKanselleer(e)) console.warn('Stoor het misluk:', e)
  }
}

/* Waarheen moet 'n skakel wat die app oopgemaak het, binne die app gaan?
 *
 * Net ons eie twee gashere tel; enigiets anders is `null` en dan gebeur
 * niks. Die bestemming is altyd op `www`, want dit is die gasheer wat die
 * app laai (die brug word net daar ingespuit). `/go` is die
 * INSTALLEERblad — vir iemand wat die app reeds het, is die tuisblad die
 * regte plek. `/api/…` is nooit 'n blad nie. */
export const APP_GASHEER = 'www.dewaldscheepers.com'
export function appBestemming(url) {
  let u
  try { u = new URL(String(url)) } catch { return null }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null
  const h = u.host.toLowerCase()
  if (h !== APP_GASHEER && h !== 'dewaldscheepers.com') return null
  let pad = u.pathname || '/'
  if (/^\/api(\/|$)/i.test(pad) || /^\/\.well-known(\/|$)/i.test(pad)) return null
  if (/^\/go\/?$/i.test(pad)) return 'https://' + APP_GASHEER + '/'
  return 'https://' + APP_GASHEER + pad + u.search + u.hash
}

/* ── Klank met die skerm af ──
 *
 * Dewald, 20 Oktober 2026, op die Play-app: *"If i press play and screen
 * eventually goes black after few sec it stops playing the voicenote. Also if
 * i lock screen... it plays but eventually just stops."*
 *
 * In Chrome hou die blaaier se eie mediadiens die klank aan die lewe. In die
 * app is daar niks: Android sien 'n app sonder 'n VOORGRONDDIENS, en 'n paar
 * sekondes nadat die skerm afgaan, word hy gevries — die klank hou op. Die
 * diens kom nou van @capgo/capacitor-media-session (vasgepen op 8.0.31): hy
 * begin wanneer die staat 'playing' of 'paused' word en stop by 'none', met 'n
 * kennisgewing en knoppies op die sluitskerm.
 *
 * Die STAAT kom net uit die klank-element self (`klankStaat`), nooit uit wat
 * 'n skerm in `navigator.mediaSession.playbackState` skryf nie. Luister skryf
 * daar 'paused' sodra die nota gelaai is — voordat iemand iets gedruk het — en
 * dan sou die diens (en sy kennisgewing) by elke oopmaak opkom. Die elemente
 * se gebeurtenisse geld vir ELKE speler: Luister, die VOLG JESUS-stem, 'n
 * gedeelde /hoop-skakel en Tyd met God, ook dié wat self niks van 'n
 * mediasessie weet nie.
 *
 * Die skerms se mediasessie (titel, en die sluitskerm se knoppies) word deur
 * 'n plaasvervanger van `navigator.mediaSession` na die inprop deurgegee. */
export function klankStaat(tipe) {
  if (tipe === 'playing' || tipe === 'play') return 'playing'
  if (tipe === 'pause') return 'paused'
  if (tipe === 'ended') return 'none'
  /* 'emptied' is GEEN einde nie: dit vuur wanneer Luister se herstel 'n
     vasgehakte stroom herlaai, dikwels met die skerm af. Stop die diens dan en
     begin hy weer, is dit 'n voorgronddiens wat uit die AGTERGROND begin — en
     dit verbied Android 12+. Die klank sou juis daar sterf. */
  return null
}

/* Hoe lank 'none' wag voordat die diens stop. Luister probeer 'n te vroeë
   einde EEN keer weer; kom die klank binne hierdie tyd terug, het die diens
   nooit gestop nie — sien die kop van `klankStaat`. */
export const STOP_WAG_MS = 5000

/* Die inprop haal die prent self oor HTTP; 'n relatiewe pad ken hy nie. */
export function kunsVir(artwork, oorsprong) {
  const uit = []
  for (const a of Array.from(artwork || [])) {
    if (!a || !a.src) continue
    try {
      const u = new URL(String(a.src), String(oorsprong))
      if (u.protocol !== 'https:' && u.protocol !== 'http:') continue
      uit.push({ src: u.href, sizes: a.sizes || undefined, type: a.type || undefined })
    } catch {}
  }
  return uit
}

const STANDAARD_TITEL = { title: 'Daaglikse Hoop', artist: 'Dewald Scheepers', album: 'Daaglikse Hoop' }

function klankBrug(w) {
  const veilig = p => { try { Promise.resolve(p).catch(() => {}) } catch {} }
  let staat = 'none'
  let metaGestel = false
  let stopKlok = null
  const stuur = (s) => { staat = s; veilig(MediaSession.setPlaybackState({ playbackState: s })) }
  const stel = (s) => {
    if (!s) return
    if (stopKlok) { clearTimeout(stopKlok); stopKlok = null }
    if (s === staat) return
    if (s === 'none') { stopKlok = setTimeout(() => { stopKlok = null; stuur('none') }, STOP_WAG_MS); return }
    stuur(s)
  }

  const isKlank = el => !!el && (el.tagName === 'AUDIO' || el.tagName === 'VIDEO')
  const opGebeurtenis = (e) => {
    if (!isKlank(e.target)) return
    const s = klankStaat(e.type)
    if (s === 'playing' && !metaGestel) veilig(MediaSession.setMetadata({ ...STANDAARD_TITEL }))
    stel(s)
  }
  for (const t of ['playing', 'pause', 'ended']) {
    w.document.addEventListener(t, opGebeurtenis, true)
  }

  /* Die sluitskerm se knoppies: een inheemse hanteerder per aksie, wat die
     skerm se NUUTSTE hanteerder roep. Luister stel hulle by elke verandering
     weer; elke keer 'n nuwe inheemse oproep sou hulle laat opstapel. */
  const hanteerders = Object.create(null)
  const geregistreer = new Set()
  const sessie = {
    get metadata() { return this._meta || null },
    set metadata(m) {
      this._meta = m || null
      if (!m) return
      metaGestel = true
      veilig(MediaSession.setMetadata({
        title: m.title || STANDAARD_TITEL.title,
        artist: m.artist || STANDAARD_TITEL.artist,
        album: m.album || STANDAARD_TITEL.album,
        artwork: kunsVir(m.artwork, w.location.href),
      }))
    },
    /* Gelees, nooit deurgegee nie — sien die kop. */
    get playbackState() { return staat },
    set playbackState(_s) {},
    setActionHandler(aksie, h) {
      hanteerders[aksie] = typeof h === 'function' ? h : null
      if (geregistreer.has(aksie) || typeof h !== 'function') return
      geregistreer.add(aksie)
      veilig(MediaSession.setActionHandler({ action: aksie }, (d) => {
        const f = hanteerders[aksie]
        if (f) { try { f({ action: aksie, seekTime: d && d.seekTime }) } catch {} }
      }))
    },
    setPositionState(p) {
      if (!p) return
      const d = Number(p.duration), pos = Number(p.position)
      if (!Number.isFinite(d) || d <= 0 || !Number.isFinite(pos) || pos < 0) return
      veilig(MediaSession.setPositionState({ duration: d, position: Math.min(pos, d), playbackRate: Number(p.playbackRate) || 1 }))
    },
  }
  try {
    if (typeof w.MediaMetadata !== 'function') {
      w.MediaMetadata = function MediaMetadata(o) { Object.assign(this, o || {}) }
    }
    Object.defineProperty(w.navigator, 'mediaSession', { value: sessie, configurable: true, writable: true })
  } catch {}
}

let geinstalleer = false

export function installeerInheemseBrug(w = window) {
  if (geinstalleer) return true
  let inheems = false
  try { inheems = Capacitor.isNativePlatform() } catch {}
  if (!inheems) return false
  geinstalleer = true

  // 1. Deel
  try {
    Object.defineProperty(w.navigator, 'share', { value: deel, configurable: true, writable: true })
    Object.defineProperty(w.navigator, 'canShare', { value: () => true, configurable: true, writable: true })
  } catch {}

  // 2. Blob- en data-aflaaie
  const ouKlik = w.HTMLAnchorElement.prototype.click
  w.HTMLAnchorElement.prototype.click = function () {
    const href = this.href || ''
    if (this.hasAttribute('download') && /^(blob|data):/i.test(href)) {
      stoor(href, this.getAttribute('download') || 'daaglikse-hoop')
      return
    }
    return ouKlik.call(this)
  }

  /* 3. window.open na 'n ander werf.
     Om die adres te NAVIGEER, laat Capacitor dit vang (`launchIntent`) en aan
     die regte app gee — WhatsApp, of Chrome vir 'n PDF — terwyl die app se
     eie bladsy bly staan. Sonder dit kon die WebView self na die PDF gaan, en
     'n WebView kan nie 'n PDF wys nie: 'n wit skerm sonder 'n pad terug. */
  const ouOpen = w.open
  w.open = function (url, ...res) {
    if (url && isVreemdeAdres(url, w.location.host)) {
      try { w.location.href = new URL(String(url), w.location.href).href } catch {}
      return null
    }
    return ouOpen.call(w, url, ...res)
  }

  /* 4. Die terug-knoppie. `history.back()` en nie `goBack()` nie: dan loop
     dit deur presies dieselfde `popstate` as in Chrome, en elke skerm wat
     homself op terug toemaak (terugRef, die oorlae) werk net so. Is daar
     niks om na terug te gaan nie, sit die app weg — soos elke Android-app. */
  /* 5. Skakels wat die app oopmaak.
     Koue begin: die skakel staan in `getLaunchUrl`. Die bladsy wat dit lees,
     is die tuisblad wat Capacitor gelaai het — gaan dus EEN keer daarheen.
     Die merkie in sessionStorage is die hek: die app vee self die pad uit
     (`replaceState('/')` ná /boek, /english, …), en sonder die merkie sou
     elke herlaai weer na die skakel spring. 'n Nuwe oopmaak van die app is
     'n nuwe sessie, dus werk dieselfde skakel môre weer.
     Warm (die app is reeds oop): `appUrlOpen`. */
  const gaanNa = (url, eenKeer) => {
    const doel = appBestemming(url)
    if (!doel) return
    if (eenKeer) {
      try {
        if (w.sessionStorage.getItem('inheems_lanseer') === doel) return
        w.sessionStorage.setItem('inheems_lanseer', doel)
      } catch {}
    }
    if (doel === w.location.href) return
    w.location.replace(doel)
  }
  try {
    App.getLaunchUrl().then(r => { if (r && r.url) gaanNa(r.url, true) }).catch(() => {})
    App.addListener('appUrlOpen', (e) => { if (e && e.url) gaanNa(e.url, false) })
  } catch {}

  // 6. Klank met die skerm af
  try { klankBrug(w) } catch {}

  try {
    App.addListener('backButton', (e) => {
      /* Net 'n egte ja/nee. 'n Gebeurtenis sonder die veld mag die app
         nooit wegsit nie. */
      if (!e || typeof e.canGoBack !== 'boolean') return
      if (e.canGoBack) w.history.back()
      else App.minimizeApp()
    })
  } catch {}
  return true
}
