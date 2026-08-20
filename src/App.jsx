import { useState, useEffect, useRef } from 'react'
import Luister from './screens/Luister'
import BidSaam from './screens/BidSaam'
import BidNou from './screens/BidNou'
import Sorg from './screens/Sorg'
import Meer from './screens/Meer'
import Admin from './screens/Admin'
import { DonationModal } from './screens/Webtuiste'
import NooimyModal from './components/NooimyModal'
import BottomNav from './components/BottomNav'
import { DonationPopup, EbookPopup, InstallPopup, SharePopup, KennisgewingPopup, KennisgewingStappe } from './components/Popups'
import InstallHelp from './components/InstallHelp'
import { BOOKS } from './data/books'
import { subscribeToNotifications, ensureNotificationToken, subscribeSamsung, isSamsungBrowser, isFacebookBrowser, isInApp, db } from './firebase'
import { isInheems, tekenInInheems, houInheemseTokenVars, luisterInheemseTikke, inheemseToestemming } from './data/inheemseKennisgewings'
import { kiesPad } from './data/installeerPad'
import { wysKnoppie } from './data/kennisgewingStaat'
import { leesKennisgewingStaat, huidigeToken } from './data/kennisgewingLees'
import KennisgewingKnoppie from './components/KennisgewingKnoppie'
import { magVra, wysPadTerug, telVerandering } from './data/kennisgewingVra'
import KennisgewingAf from './components/KennisgewingAf'
import InstallTelling from './components/InstallTelling'
import { getDoc, doc } from 'firebase/firestore'
import ErrorBoundary from './components/ErrorBoundary'
import { magHerlaai, WAG_MS } from './data/herlaaiBesluit'
import DaeVanVrede from './screens/DaeVanVrede'
import DingeVerander from './screens/DingeVerander'
import SeerNaVryheid from './screens/SeerNaVryheid'
import Vredepad from './screens/Vredepad'
import HoopVennoot from './screens/HoopVennoot'
import Steun from './screens/Steun'
import LeuensDuiwel from './screens/LeuensDuiwel'
import BybelMaklikGemaak from './screens/BybelMaklikGemaak'
import WanneerAngsToeslaan from './screens/WanneerAngsToeslaan'
import RustelosGedagtes from './screens/RustelosGedagtes'
import AsAllesWegval from './screens/AsAllesWegval'
import AngsDetox from './screens/AngsDetox'
import WatIsMyne from './screens/WatIsMyne'
import DinkNuutLeefNuut from './screens/DinkNuutLeefNuut'
import DeursoekBreekStuur from './screens/DeursoekBreekStuur'
import Toksies from './screens/Toksies'
import HuiseVanHoop from './screens/HuiseVanHoop'
import Bybel from './screens/Bybel'
import Speel from './screens/Speel'
import BouDieArk from './screens/BouDieArk'
import Vrugtefees from './screens/Vrugtefees'
import VolgJesusLewe from './screens/VolgJesusLewe'
import {
  kodeUitAdres, stoorNooi, leesNooi,
  weekUitAdres, stoorWeek, leesWeek,
} from './data/volgJesusNooi'
import BidVirMy from './components/BidVirMy'
import { idUitPad } from './data/gebedDeel'
import './App.css'

function shouldShowSharePopup() {
  const today        = new Date().toISOString().slice(0, 10)
  const appOpenDays  = JSON.parse(localStorage.getItem('appOpenDays') || '[]')
  const lastShown    = localStorage.getItem('sharePopupLastShownDate')
  const sharedAt     = parseInt(localStorage.getItem('sharePopupSharedAt') || '0')
  const laterAt      = parseInt(localStorage.getItem('sharePopupLaterAt')  || '0')
  if (appOpenDays.length < 2)                              return false
  if (lastShown === today)                                 return false
  if (Date.now() - sharedAt <= 10 * 24 * 60 * 60 * 1000) return false
  if (Date.now() - laterAt  <=  3 * 24 * 60 * 60 * 1000) return false
  return true
}

function getSkenkWindow() {
  const now   = new Date()
  const day   = now.getDate()
  const year  = now.getFullYear()
  const month = now.getMonth()
  if (day >= 25) {
    return { cycleId: `${year}-${String(month + 1).padStart(2, '0')}`, chance: 1 }
  }
  if (day === 2 || day === 3) {
    const pm = month === 0 ? 11 : month - 1
    const py = month === 0 ? year - 1 : year
    return { cycleId: `${py}-${String(pm + 1).padStart(2, '0')}`, chance: 2 }
  }
  return null
}

export default function App() {
  const [tab, setTab]               = useState('luister')
  const [showDonation, setDonation] = useState(false)
  const [showNooimy, setNooimy]     = useState(false)
  const [paymentResult, setPayment] = useState(null)
  const [showNotifBanner, setNotifBanner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installBannerDismissed, setInstallBannerDismissed] = useState(false)
  const [showInstallPopup, setShowInstallPopup] = useState(false)
  const [samsungBannerDismissed, setSamsungBannerDismissed] = useState(
    () => !!localStorage.getItem('samsungBannerDismissed')
  )
  const [showInstallHelp, setShowInstallHelp] = useState(false)
  const [activePopup, setActivePopup] = useState(null)
  const [pendingPopup, setPendingPopup] = useState(null)
  const isPlayingRef = useRef(false)
  const [showAdmin, setShowAdmin]       = useState(false)
  const [targetBookId, setTargetBookId] = useState(null)
  const [showJourney, setShowJourney]   = useState(false)
  const [showDingeVerander, setShowDingeVerander] = useState(false)
  const [showSeerNaVryheid, setShowSeerNaVryheid] = useState(false)
  const [showVredepad, setShowVredepad]           = useState(false)
  const [showHoopVennoot, setShowHoopVennoot]     = useState(false)
  const [wysSteun, setWysSteun]                   = useState(false)
  const [showLeuensDuiwel,    setShowLeuensDuiwel]    = useState(false)
  const [showBybelMaklik,     setShowBybelMaklik]     = useState(false)
  const [showWanneerAngs,     setShowWanneerAngs]     = useState(false)
  const [showRustelosGedagtes, setShowRustelosGedagtes] = useState(false)
  const [showAsAllesWegval,    setShowAsAllesWegval]    = useState(false)
  const [showAngsDetox,        setShowAngsDetox]        = useState(false)
  const [showWatIsMyne,        setShowWatIsMyne]        = useState(false)
  const [showDinkNuut,         setShowDinkNuut]         = useState(false)
  const [showDeursoekBreekStuur, setShowDeursoekBreekStuur] = useState(false)
  const [showToksies,            setShowToksies]            = useState(false)
  const [showHuise, setShowHuise]                 = useState(false)
  const [showBybel, setShowBybel]                 = useState(false)
  const [bybelBeginBy, setBybelBeginBy]           = useState(null)
  const [showArk, setShowArk]                     = useState(false)
  const [showVrugtefees, setShowVrugtefees]       = useState(false)
  const [showVolgJesus, setShowVolgJesus]         = useState(false)
  const [showLeesplanNotice, setShowLeesplanNotice] = useState(false)
  /* Die id van 'n gedeelde gebedsversoek — /bid/<id>. Dit staan HIER by die
     res van die toestand en nie langs sy eie effek nie: die
     installasie-uitklap se effek noem dit in sy afhanklikheidslys, en daardie
     lys word tydens die render gelees. Staan die verklaring later, val die
     hele app om met "Cannot access before initialization". */
  const [gebedId, setGebedId] = useState(null)
  const [gebedGebid, setGebedGebid] = useState(false)

  function onAudioPlayingChange(playing) {
    isPlayingRef.current = playing
    if (!playing && pendingPopup) {
      setActivePopup(pendingPopup)
      setPendingPopup(null)
    }
  }

  // ── Track unique app-open days (for share popup eligibility) ──
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    const days  = JSON.parse(localStorage.getItem('appOpenDays') || '[]')
    if (!days.includes(today)) {
      localStorage.setItem('appOpenDays', JSON.stringify([...days, today].slice(-30)))
    }
  }, [])

  // ── Capture beforeinstallprompt (Chrome/Edge) ──
  useEffect(() => {
    if (isInstalled) return
    // Pick up any prompt captured before React mounted
    if (window.__installPrompt) {
      setInstallPrompt(window.__installPrompt)
      window.__installPrompt = null
    }
    function onPrompt(e) { e.preventDefault(); setInstallPrompt(e) }
    function onInstalled() { setIsInstalled(true); recordInstall() }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [isInstalled])

  // ── Count installs once per device ──
  function recordInstall() {
    if (localStorage.getItem('installCounted')) return
    localStorage.setItem('installCounted', '1')
    fetch('/api/count-install', { method: 'POST' }).catch(() => {})
  }

  useEffect(() => {
    if (isInstalled) recordInstall()
  }, [isInstalled])

  // ── Once-per-day install popup (3s delay, not while audio plays) ──
  useEffect(() => {
    if (isInstalled) return
    /* Nie oor 'n gedeelde gebedsversoek nie. Die mens wat daar land, het 'n
       boodskap gekry wat vra dat sy vir iemand bid — 'n installasie-uitklap
       drie sekondes later maak van daardie oomblik 'n advertensie.

       Dit is UITGESTEL, nie afgeskakel nie. Sodra sy gebid het, mag die app
       vra -- presies dieselfde vloei as 'n nuwe mens wat die app in 'n
       blaaier oopmaak. Sien gebedGebidHanteer(). */
    if (gebedId && !gebedGebid) return
    const today = new Date().toISOString().slice(0, 10)
    if (localStorage.getItem('installPopupDate') === today) return
    const t = setTimeout(() => {
      if (!isPlayingRef.current) {
        setShowInstallPopup(true)
        localStorage.setItem('installPopupDate', today)
      }
    }, 3000)
    return () => clearTimeout(t)
  }, [isInstalled, gebedId, gebedGebid])

  // ── Popup manager ──
  useEffect(() => {
    const timer = setTimeout(() => {
      const today     = new Date().toISOString().slice(0, 10)
      if (!isInstalled) return
      if (localStorage.getItem('lastPopupDate') === today) return

      const thisMonth = new Date().toISOString().slice(0, 7)
      const appOpenDays = JSON.parse(localStorage.getItem('appOpenDays') || '[]')

      // Don't show ebook/donation to someone who only opened the app once
      if (appOpenDays.length < 2) return

      const seenEbooks = JSON.parse(localStorage.getItem('seenEbooks') || '[]')
      const unseenBook = BOOKS.find(b => !seenEbooks.includes(b.id))

      const sw = getSkenkWindow()
      let donationDue = false
      if (sw) {
        const { cycleId, chance } = sw
        const paid = localStorage.getItem('skenkPaid') === cycleId
        const c1   = localStorage.getItem('skenkChance1') === cycleId
        const c2   = localStorage.getItem('skenkChance2') === cycleId
        if (!paid && chance === 1 && !c1) donationDue = true
        if (!paid && chance === 2 && !c2) donationDue = true
      }

      let popup = null
      if (donationDue) {
        popup = { type: 'donation' }
      } else if (unseenBook) {
        popup = { type: 'ebook', book: unseenBook }
      }

      if (!popup) return

      if (isPlayingRef.current) {
        setPendingPopup(popup)
      } else {
        setActivePopup(popup)
      }
    }, 30000)

    return () => clearTimeout(timer)
  }, [isInstalled])

  function dismissPopup() {
    const today = new Date().toISOString().slice(0, 10)

    if (activePopup?.type === 'ebook') {
      localStorage.setItem('lastPopupDate', today)
      const seen = JSON.parse(localStorage.getItem('seenEbooks') || '[]')
      seen.push(activePopup.book.id)
      localStorage.setItem('seenEbooks', JSON.stringify(seen))
    } else if (activePopup?.type === 'donation') {
      localStorage.setItem('lastPopupDate', today)
      const sw = getSkenkWindow()
      if (sw) {
        const key = sw.chance === 1 ? 'skenkChance1' : 'skenkChance2'
        localStorage.setItem(key, sw.cycleId)
      }
    } else if (activePopup?.type === 'share') {
      localStorage.setItem('sharePopupLastShownDate', today)
    }
    setActivePopup(null)
  }

  function handleEbookView() {
    const bookId = activePopup?.book?.id || null
    dismissPopup()
    setTab('meer')
    setTargetBookId(bookId)
  }

  function handleDonationCta() {
    dismissPopup()
    setDonation(true)
  }

  async function handleShareApp() {
    localStorage.setItem('sharePopupSharedAt', String(Date.now()))
    const msg = 'Ek dink hierdie app gaan jou help. Daaglikse Hoop gee elke oggend \'n kort boodskap van hoop, gebed en bemoediging.\n\nLaai dit hier af: https://dewaldscheepers.com/go'
    if (navigator.share) {
      try { await navigator.share({ title: 'Daaglikse Hoop', text: msg, url: 'https://dewaldscheepers.com/go' }) } catch {}
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
    }
  }

  function handleShareDone() { dismissPopup() }

  function handleShareLater() {
    localStorage.setItem('sharePopupLaterAt', String(Date.now()))
    dismissPopup()
  }

  // ── Install handlers ──
  async function handleInstallCta() {
    if (installPrompt) {
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') setIsInstalled(true)
      setInstallPrompt(null)
    } else {
      setShowInstallPopup(false)
      setShowInstallHelp(true)
    }
  }

  function dismissInstallPopup() {
    setShowInstallPopup(false)
    /* Kom die uitklap uit die gebedsvloei, is die kennisgewing-vraag die
       volgende stap. Andersins bly alles soos dit was. */
    if (gebedGebid) vraKennisgewingsDalk()
  }

  // ── Forward install requests from FreeBookModal ──
  useEffect(() => {
    function onInstallRequest() { handleInstallCta() }
    window.addEventListener('trigger-install-prompt', onInstallRequest)
    return () => window.removeEventListener('trigger-install-prompt', onInstallRequest)
  }, [installPrompt])

  /* ── Kennisgewings: die stil deel ──

     Hier het 'n tydhouer gestaan wat die balkie drie sekondes ná elke
     oopmaak gewys het, sonder enige geheue. Sien `src/data/kennisgewingVra.js`
     vir waarom dit teen homself gewerk het. Die VRAAG gebeur nou ná 'n nota
     klaar gespeel het; hier bly net wat stil moet gebeur.

     Samsung Internet val nie meer hier uit nie. Dit het `if (isSamsungBrowser)
     return` gehad, en dit is die rede waarom `webPushSubscriptions` een
     inskrywing het. */
  useEffect(() => {
    /* Tel waar hierdie toestel staan — drie getalle, niks wat na 'n mens
       teruglei nie. Net wanneer dit VERANDER, sodat dieselfde foon nie elke
       oggend weer getel word nie.

       In die Android-app moet dit die INHEEMSE toestemming tel. Die WebView
       se `Notification.permission` is 'n ander ding en het niks te doen met
       of hierdie foon die oggendboodskap gaan kry nie; dit sou die drie
       getalle stilweg bederf. */
    function tel(perm) {
      if (!perm) return
      const verandering = telVerandering({
        toestemming: perm,
        laasGetel: localStorage.getItem('toestemmingGetel') || '',
      })
      if (!verandering) return
      fetch('/api/tel-toestemming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verandering),
      }).then(r => { if (r.ok) localStorage.setItem('toestemmingGetel', verandering.nuwe) })
        .catch(() => {})
    }

    /* Wie reeds ja gesê het: hou net die token vars.

       Albei kante is nodig. Sou net die Chrome-kant hier gestaan het, sou 'n
       Samsung-mens wat REEDS toestemming gegee het nooit 'n intekening kry
       nie — hy word nie gevra nie (want hy het klaar ja gesê) en niks skryf
       hom in nie. Hy sou vir altyd stil bly terwyl alles reg lyk.

       `subscribeSamsung` hergebruik 'n bestaande intekening en die
       toestemming is reeds gegee, dus wys dit niks en vra dit niks.
       `houInheemseTokenVars` kyk self na die toestemming en doen niks as dit
       nie gegee is nie — daarom hoef ons hier nie te wag nie. */
    if (isInheems) {
      houInheemseTokenVars()
      inheemseToestemming().then(staat => {
        tel(staat === 'granted' ? 'granted' : staat === 'denied' ? 'denied' : 'default')
      })
      return
    }

    if (!('Notification' in window)) return
    const perm = Notification.permission
    tel(perm)
    if (perm === 'granted') {
      if (isSamsungBrowser) subscribeSamsung().catch(() => {})
      else                  ensureNotificationToken()
    }
  }, [])

  /* ── Die vraag self ──

     Word geroep wanneer 'n nota klaar gespeel het. Op daardie oomblik het
     iemand pas gekry waarvoor hy gekom het, en "wil jy môre weer hoor?" is
     'n redelike vraag eerder as 'n onderbreking. */
  /* ── Wie se toestemming tel? ──

     In die Android-app is `Notification.permission` die WEBVIEW se
     toestemming, en dit is nie die een wat saak maak nie. Die een wat saak
     maak is POST_NOTIFICATIONS, wat aan die APP behoort.

     Die twee stem nie ooreen nie. 'n WebView wat nooit gevra is nie, gee
     dikwels `denied` terug — en `magVra` sou dan vir altyd nee se en die
     mens sou nooit die vraag sien nie, in presies die app waar dit die
     meeste saak maak.

     Ons lees dus die INHEEMSE staat een keer by die oopmaak en hou dit in 'n
     ref, want `vraKennisgewingsDalk` moet sinchroon 'n antwoord gee.
     'prompt' en 'prompt-with-rationale' is Android se manier om "nog nooit
     gevra nie" te se — dieselfde as die web se 'default'. */
  const inheemsePermRef = useRef(null)
  useEffect(() => {
    if (!isInheems) return
    let leef = true
    inheemseToestemming().then(staat => {
      if (!leef || !staat) return
      inheemsePermRef.current =
        staat === 'granted' ? 'granted' : staat === 'denied' ? 'denied' : 'default'
    })
    return () => { leef = false }
  }, [])

  function huidigeToestemming() {
    if (isInheems) return inheemsePermRef.current || 'default'
    return 'Notification' in window ? Notification.permission : null
  }

  function vraKennisgewingsDalk() {
    const toestemming = huidigeToestemming()
    if (!toestemming) return false
    const mag = magVra({
      toestemming,
      kere: parseInt(localStorage.getItem('vraKennisgewingKere') || '0', 10),
      laas: parseInt(localStorage.getItem('vraKennisgewingLaas') || '0', 10),
      nou:  Date.now(),
    })
    if (!mag) return false
    setNotifBanner(true)
    return true
  }

  /* ── "Kennisgewings af" — die merkie regs bo op Luister ──

     Daar is mense wat die app op hulle foon het en al maande niks kry nie.
     Hulle weet dit nie; hulle dink die app is stil. Ons het geen kanaal na
     daardie foon nie — die enigste oomblik waarop ons iets kan doen, is
     wanneer hulle die app oopmaak.

     Daarom is dit nie 'n uitklap nie. 'n Uitklap kom een keer en gaan weg.
     Dit is 'n merkie wat ELKE KEER daar is totdat dit reg is.

     `null` beteken "ons weet nog nie" — dan wys ons niks, want 'n merkie wat
     'n halwe sekonde flikker en verdwyn, lyk soos 'n fout. */
  const [kgStaat, setKgStaat] = useState(null)

  async function herlaaiKgStaat() {
    try { setKgStaat(await leesKennisgewingStaat()) } catch { setKgStaat(null) }
  }

  useEffect(() => {
    let leef = true
    leesKennisgewingStaat()
      .then(s => { if (leef) setKgStaat(s) })
      .catch(() => {})
    /* Kom die mens terug van sy foon se instellings af, is die antwoord dalk
       nou anders. Dit is die pad wat 'n mens loop nadat hy "Wys my hoe"
       gedruk het. */
    const opWys = () => { if (document.visibilityState === 'visible') herlaaiKgStaat() }
    document.addEventListener('visibilitychange', opWys)
    return () => { leef = false; document.removeEventListener('visibilitychange', opWys) }
  }, [])

  /* Wat die merkie se knoppie doen. Nooit "vra" vir iemand wat geblokkeer
     het nie — sien kennisgewingStaat.js. */
  async function kgDoen(watter) {
    if (watter === 'vra' || watter === 'herstel') {
      const gelukt = await probeerKennisgewings()
      await herlaaiKgStaat()
      return gelukt
        ? { ok: true,  boodskap: 'Klaar! Jy kry môreoggend jou eerste boodskap.' }
        : { ok: false, boodskap: 'Dit het nie gewerk nie. Kom ons kyk wat jou foon sê.' }
    }
    return { ok: false, boodskap: 'Iets het verkeerd geloop. Probeer asseblief weer.' }
  }

  /* "Wys my hoe" — die stappe. Vir wie geblokkeer het is dit die ENIGSTE pad
     terug; vir 'n iPhone wat dit nog nie geinstalleer het nie, is die
     volgende stap die tuisskerm. */
  function kgStappe(watter) {
    if (watter === 'installeer') setShowInstallPopup(true)
    else if (isInApp)            setWysStappe(true)
    else                         setToestemmingAf(true)
  }

  const kennisgewingMerkie = kgStaat && wysKnoppie(kgStaat)
    ? <KennisgewingKnoppie staat={kgStaat} opDoen={kgDoen} opStappe={kgStappe} />
    : null

  /* Druk iemand die oggendkennisgewing, maak Android die app oop. Bring hom
     na Luister toe — dit is waar die boodskap sit. Dieselfde bestemming as
     die web-kennisgewing se `data.url`. */
  useEffect(() => {
    let opruim = () => {}
    luisterInheemseTikke(() => setTab('luister')).then(f => { opruim = f })
    return () => opruim()
  }, [])

  /* ── In die GEÏNSTALLEERDE app vra ons by die oopmaak ──

     Die vraag het net gekom NADAT 'n nota klaar gespeel het. In 'n blaaier
     is dit reg: iemand wat toevallig op 'n webblad beland, moet nie 'n
     toestemmingsvraag in sy gesig kry voordat hy weet wat die plek is nie.

     Maar in die app wat 'n mens SELF van Google Play af geïnstalleer het,
     is dit verkeerd. Hy het reeds gekies. Hy maak dit oop, kyk rond, maak
     dit toe — en word nooit gevra nie. En kennisgewings is die hele rede
     waarom hierdie app werk: dit is die ding wat mense elke oggend
     terugbring.

     Dus: in die app vra ons by die oopmaak, EEN keer, met dieselfde
     `magVra`-reels as altyd — hoogstens drie keer in 'n leeftyd, minstens
     sewe dae uitmekaar, en nooit vir iemand wat reeds ja of nee gesê het
     nie. Groter en vroeër beteken nie MEER nie; sien
     src/data/kennisgewingVra.js vir waarom dit so moet bly.

     Die kort wag is sodat die app eers kan gaan staan. 'n Vraag wat oor 'n
     halwe skerm oopklap terwyl dit nog laai, voel soos 'n fout. */
  useEffect(() => {
    if (!isInApp) return
    const t = setTimeout(() => { vraKennisgewingsDalk() }, 2500)
    return () => clearTimeout(t)
  }, [])

  /* Weggedruk of geantwoord — albei tel as 'n keer. Iemand wat drie keer
     weggedruk het, het geantwoord, en ons vra nie 'n vierde keer nie. */
  function merkGevra() {
    const kere = parseInt(localStorage.getItem('vraKennisgewingKere') || '0', 10)
    localStorage.setItem('vraKennisgewingKere', String(kere + 1))
    localStorage.setItem('vraKennisgewingLaas', String(Date.now()))
  }

  /* ── Wanneer die vraag misluk ──

     BINNE die app is 'n mislukking amper altyd dieselfde ding, en dit is
     NIE dat die mens nee gesê het nie. Op Android 13+ moet die app self
     toestemming he om kennisgewings te wys, en die app se venster kry dit
     nie aangeskakel nie — 'n oop fout in die TWA-gereedskap. Die stelsel
     wys niks, en die webvraag word dadelik geweier.

     Dewald en sy vrou het albei "Ja" gedruk en albei niks gekry nie. Toe sy
     dit handmatig in Android se instellings aangeskakel het, het dit
     dadelik gewerk. Die weg is dus daar; die app moet net vertel waar.

     Daarom: in die app wys ons die stappe DADELIK, as 'n uitklap, op die
     oomblik waar die mens dit wil he. In 'n blaaier bly dit soos dit was —
     die stil reel onderaan, want daar het 'n mens werklik "Block" gedruk en
     'n uitklap sou niks help nie. */
  const [wysStappe, setWysStappe] = useState(false)

  async function probeerKennisgewings() {
    /* Drie paaie, en presies EEN mag loop.

       1. Die Android-app uit Google Play. Ons praat self met Android deur
          Firebase se inheemse SDK — geen blaaier in die middel nie. Dit is
          die enigste pad wat op 'n Samsung werk.
       2. Samsung Internet as blaaier. Doen nie Firebase se getToken nie,
          maar wel die gewone pushManager. Sien `subscribeSamsung`.
       3. Alles anders.

       Loop twee van hulle, kry een mens twee tokens en die oggendboodskap
       kom twee keer. Die app laai die LEWENDE webwerf, dus is dit dieselfde
       bundel wat in al drie gevalle loop — `isInheems` is die skakelaar. */
    const result = isInheems
      ? await tekenInInheems()
      : isSamsungBrowser
        ? await subscribeSamsung()
        : await subscribeToNotifications()
    return !!(result && result.ok)
  }

  async function handleNotifYes() {
    setNotifBanner(false)
    merkGevra()
    let gelukt = false
    try { gelukt = await probeerKennisgewings() } catch { gelukt = false }
    if (gelukt) {
      setWysStappe(false)
      setToestemmingAf(false)
      if (isInheems) inheemsePermRef.current = 'granted'
      return
    }
    /* Misluk dit, hou die inheemse staat by. Android wys sy venster nie 'n
       tweede keer nie, en 'n knoppie wat niks doen nie is erger as stilte. */
    if (isInheems) {
      const staat = await inheemseToestemming()
      inheemsePermRef.current =
        staat === 'granted' ? 'granted' : staat === 'denied' ? 'denied' : 'default'
    }
    if (isInApp) setWysStappe(true)
    else         setToestemmingAf(Notification.permission === 'denied')
  }

  /* "Ek het dit aangesit" — probeer weer sonder om die mens weer te vra. */
  async function stappeKlaar() {
    let gelukt = false
    try { gelukt = await probeerKennisgewings() } catch { gelukt = false }
    if (gelukt) { setWysStappe(false); setToestemmingAf(false) }
  }

  /* Is kennisgewings geblokkeer, wys 'n stil reël met die stappe om dit self
     aan te sit. Dit vra niks en onderbreek niks — dit is die enigste pad
     terug wat bestaan, want die app self mag nie weer vra nie. */
  const [toestemmingAf, setToestemmingAf] = useState(
    () => typeof Notification !== 'undefined' && wysPadTerug(Notification.permission)
  )

  useEffect(() => {
    const params   = new URLSearchParams(window.location.search)
    const status   = params.get('payment')
    const type     = params.get('type') || 'ebook'
    const urlBooks    = (params.get('books') || '').split(',').filter(Boolean)
    const storedBooks = (localStorage.getItem('pendingPurchase') || '').split(',').filter(Boolean)
    const bookIds     = urlBooks.length > 0 ? urlBooks : storedBooks
    const email       = params.get('em') ? decodeURIComponent(params.get('em')) : (localStorage.getItem('pendingEmail') || '')
    localStorage.removeItem('pendingPurchase')
    localStorage.removeItem('pendingEmail')
    if (status === 'success') {
      if (type !== 'subscription') setTab('meer')
      window.history.replaceState({}, '', '/')
      if (type === 'donation') {
        const sw = getSkenkWindow()
        if (sw) localStorage.setItem('skenkPaid', sw.cycleId)
      }
      if (type === 'ebook' && bookIds.length > 0) {
        // Trigger immediate email delivery and get download tokens
        const deliverPromise = email
          ? fetch('/api/deliver-purchase', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, bookIds }),
            }).then(r => r.json()).catch(() => ({}))
          : Promise.resolve({})

        Promise.all([
          deliverPromise,
          Promise.all(bookIds.map(async id => {
            try {
              const snap       = await getDoc(doc(db, 'books', id))
              const fsData     = snap.data() || {}
              const staticBook = BOOKS.find(b => b.id === id) || {}
              return { id, title: staticBook.title || id, pdfUrl: fsData.pdfUrl || staticBook.pdfUrl || null }
            } catch {
              const staticBook = BOOKS.find(b => b.id === id) || {}
              return { id, title: staticBook.title || id, pdfUrl: staticBook.pdfUrl || null }
            }
          }))
        ]).then(([deliverResult, purchasedBooks]) => {
          const tokens = deliverResult?.downloadTokens || {}
          const booksWithDownload = purchasedBooks.map(b => ({
            ...b,
            downloadUrl: tokens[b.id]
              ? `/api/download-pdf?bookId=${b.id}&token=${tokens[b.id]}`
              : null,
          }))
          setPayment({ status: 'success', type, count: bookIds.length, purchasedBooks: booksWithDownload })
        })
      } else {
        setPayment({ status: 'success', type, count: bookIds.length })
      }
    } else if (status === 'cancel') {
      setPayment({ status: 'cancel' })
      if (type !== 'subscription') setTab('meer')
      window.history.replaceState({}, '', '/')
    }
  }, [])

  const screenRef = useRef(null)

  // ── BidNou → BidSaam navigation ──
  useEffect(() => {
    function onBidNouNav(e) {
      setTab(e.detail)
      if (screenRef.current) screenRef.current.scrollTop = 0
    }
    window.addEventListener('bidnou-navigate', onBidNouNav)
    return () => window.removeEventListener('bidnou-navigate', onBidNouNav)
  }, [])

  // ── 11 Dae van Vrede journey ──
  useEffect(() => {
    function onOpen() { setShowJourney(true) }
    window.addEventListener('open-daevrede', onOpen)
    return () => window.removeEventListener('open-daevrede', onOpen)
  }, [])

  // ── Rustelose Gedagtes leesplan ──
  useEffect(() => {
    function onOpen() { setShowRustelosGedagtes(true) }
    window.addEventListener('open-rustelose-gedagtes', onOpen)
    return () => window.removeEventListener('open-rustelose-gedagtes', onOpen)
  }, [])

  // ── As Alles Wegval leesplan ──
  useEffect(() => {
    function onOpen() { setShowAsAllesWegval(true) }
    window.addEventListener('open-as-alles-wegval', onOpen)
    return () => window.removeEventListener('open-as-alles-wegval', onOpen)
  }, [])

  // ── Angs Detox leesplan ──
  useEffect(() => {
    function onOpen() { setShowAngsDetox(true) }
    window.addEventListener('open-angs-detox', onOpen)
    return () => window.removeEventListener('open-angs-detox', onOpen)
  }, [])

  // ── WAT IS MYNE OM TE DRA? leesplan ──
  useEffect(() => {
    function onOpen() { setShowWatIsMyne(true) }
    window.addEventListener('open-wat-is-myne', onOpen)
    return () => window.removeEventListener('open-wat-is-myne', onOpen)
  }, [])

  // ── Dink Nuut, Leef Nuut leesplan ──
  useEffect(() => {
    function onOpen() { setShowDinkNuut(true) }
    window.addEventListener('open-dink-nuut-leef-nuut', onOpen)
    return () => window.removeEventListener('open-dink-nuut-leef-nuut', onOpen)
  }, [])

  // ── Deursoek my · Breek my · Stuur my leesplan ──
  useEffect(() => {
    function onOpen() { setShowDeursoekBreekStuur(true) }
    window.addEventListener('open-deursoek-breek-stuur', onOpen)
    return () => window.removeEventListener('open-deursoek-breek-stuur', onOpen)
  }, [])

  // ── Toksies leesplan ──
  useEffect(() => {
    function onOpen() { setShowToksies(true) }
    window.addEventListener('open-toksies', onOpen)
    return () => window.removeEventListener('open-toksies', onOpen)
  }, [])

  // ── Dinge Wat Jou Lewe Kan Verander journey ──
  useEffect(() => {
    function onOpen() { setShowDingeVerander(true) }
    window.addEventListener('open-dinge-verander', onOpen)
    return () => window.removeEventListener('open-dinge-verander', onOpen)
  }, [])

  // ── Seer na Vryheid journey ──
  useEffect(() => {
    function onOpen() { setShowSeerNaVryheid(true) }
    window.addEventListener('open-seer-na-vryheid', onOpen)
    return () => window.removeEventListener('open-seer-na-vryheid', onOpen)
  }, [])

  /* ── Die eie steunskakel ──
     Dit maak NET oop wanneer iemand die spesiale skakel gebruik. 'n Gewone
     besoeker aan die app kom nooit hier uit nie — dit is die hele punt.

     Ons aanvaar 'n paar vorms, want die skakel word in e-pos, WhatsApp en
     Facebook gedeel en 'n mens tik dit nie altyd eners nie:
       /steun · /support · /go/support · /go/steun · ?steun=1 · ?support=true

     Sodra dit oop is, vee ons die pad uit die adresbalk uit. Anders bly 'n
     mens op /steun sit en sien dit weer by elke herlaai, en dan begin dit
     na 'n muur voel. */
  useEffect(() => {
    try {
      const pad = (window.location.pathname || '').toLowerCase().replace(/\/+$/, '')
      const vraag = new URLSearchParams(window.location.search)
      const perPad = ['/steun', '/support', '/go/support', '/go/steun'].includes(pad)
      const perVraag = ['1', 'true', 'ja'].includes((vraag.get('steun') || vraag.get('support') || '').toLowerCase())
      /* Die bedoeling gaan in sessionStorage, NIE net in die toestand nie.

         Die diensketter herlaai die bladsy by 'n eerste besoek wanneer daar
         'n nuwe weergawe is. Ons het toe die pad klaar na '/' herskryf, en
         ná die herlaai was daar niks meer om op te gaan nie — die steunblad
         het eenvoudig nie verskyn nie. Presies wat 'n mens in 'n e-pos of op
         WhatsApp sou klik.

         Die vlag oorleef die herlaai; ons vee dit uit wanneer die mens die
         blad toemaak. */
      if (perPad || perVraag) {
        sessionStorage.setItem('steun_versoek', '1')
        window.history.replaceState({}, '', '/')
      }
      if (sessionStorage.getItem('steun_versoek') === '1') setWysSteun(true)
    } catch {}
  }, [])

  /* ── 'n Gedeelde Sorg-skakel ──

     Elke Deel-knoppie op Pastorale Sorg maak 'n skakel soos
     #sorg-plasing-m1 of #sorg-video-abc123. Iemand wat dit op WhatsApp kry,
     moet die DING sien waaroor die persoon gepraat het — nie 'n vreemde
     tuisblad nie. Sorg self rol na die regte plek toe; hier maak ons net die
     oortjie oop. */
  useEffect(() => {
    try {
      const h = window.location.hash || ''
      const pad = (window.location.pathname || '').toLowerCase().replace(/\/+$/, '')

      /* 'n Kaal #sorg (of /sorg) maak net die blad oop. Dit is die skakel wat
         in 'n WhatsApp-groep geplak word: sonder dit land 'n mens op Luister
         en moet hy self gaan soek — en dan gaan die helfte van hulle nie.

         Die bedoeling gaan in sessionStorage, NIE net in die toestand nie.
         Die diensketter herlaai die bladsy by 'n eerste besoek wanneer daar
         'n nuwe weergawe is, en dan is die hash weg. Presies dieselfde fout
         het die Steun-blad gehad; sien die kommentaar daar bo. */
      if (h === '#sorg' || pad === '/sorg') {
        sessionStorage.setItem('sorg_versoek', '1')
        window.history.replaceState({}, '', '/')
      }
      /* Die vlag word HIER nie uitgevee nie. Doen 'n mens dit, en die
         diensketter herlaai die bladsy 'n oomblik later, is die bedoeling
         weg en land hy weer op Luister. Hy word uitgevee wanneer die mens
         self 'n ander oortjie kies — sien handleNav. */
      if (sessionStorage.getItem('sorg_versoek') === '1') {
        setTab('sorg')
        return
      }

      if (/^#sorg-(plasing|video)-/.test(h)) setTab('sorg')
    } catch {}
  }, [])

  /* ── 'n Gedeelde gebedsversoek ──

     /bid/<id> — iemand het aan 'n vriend gestuur: "Sal jy asseblief saam met
     my bid?" Daardie vriend moet DADELIK by die versoek land, sonder om die
     app te installeer en sonder om iets te registreer.

     Dieselfde sessionStorage-patroon as Sorg en Steun hierbo, en om dieselfde
     rede: die diensketter herlaai die bladsy by 'n eerste besoek wanneer daar
     'n nuwe weergawe is, en dan is die pad weg. Sonder die vlag land 'n
     splinternuwe mens op Luister en die gebed is verlore.

     Die id bly in die toestand nadat die pad uit die adresbalk gevee is —
     anders sit dit in die geskiedenis en 'n mens deel per ongeluk sy eie
     blaaierblad. */
  useEffect(() => {
    try {
      const pad = window.location.pathname || ''
      const uitPad = idUitPad(pad)
      if (uitPad) {
        sessionStorage.setItem('gebed_versoek', uitPad)
        window.history.replaceState({}, '', '/')
      }
      const onthou = sessionStorage.getItem('gebed_versoek')
      if (onthou) setGebedId(onthou)
    } catch {}
  }, [])

  /* Die blad is klaar. Wat nou gebeur, hang af van wat sy gekies het.

     'bidsaam' beteken sy wil self 'n versoek plaas — dan vat ons haar tot IN
     die kassie, dieselfde vlag wat Bid Saam self al lees. */
  /* ── Sy het gebid ──

     Nou doen die app wat hy vir enige nuwe mens doen: vra of sy dit op haar
     foon wil hê, en daarna of sy kennisgewings wil kry. Niks nuuts nie —
     dieselfde twee vensters, net op die regte oomblik.

     Die volgorde is installasie eerst, kennisgewings daarna. Vra 'n mens vir
     kennisgewings in 'n blaaier waar die app nie geinstalleer is nie, is die
     toestemming in elk geval minder werd. */
  function gebedGebidHanteer() {
    setGebedGebid(true)
    if (!isInstalled) {
      setShowInstallPopup(true)
    } else {
      vraKennisgewingsDalk()
    }
  }

  function gebedKlaar(waarheen) {
    try { sessionStorage.removeItem('gebed_versoek') } catch {}
    setGebedId(null)
    setGebedGebid(false)
    if (waarheen === 'bidsaam') {
      try { sessionStorage.setItem('bidsaam_fokus', '1') } catch {}
      setTab('bidsaam')
    }
  }

  // ── Donation card CTA ──
  /* Die bedrag wat 'n mens reeds gekies het, byvoorbeeld op Pastorale Sorg
     se Ondersteun-blad. Niks gestuur nie, dan begin die modaal soos altyd. */
  const [steunBedrag, setSteunBedrag] = useState(null)

  useEffect(() => {
    function onOpen(e) { setSteunBedrag(e?.detail?.bedrag ?? null); setDonation(true) }
    window.addEventListener('open-donation', onOpen)
    return () => window.removeEventListener('open-donation', onOpen)
  }, [])

  // ── Maandelikse Hoop-Vennoot CTA ──
  useEffect(() => {
    function onOpen(e) { setSteunBedrag(e?.detail?.bedrag ?? null); setShowHoopVennoot(true) }
    window.addEventListener('open-hoop-vennoot', onOpen)
    return () => window.removeEventListener('open-hoop-vennoot', onOpen)
  }, [])

  // ── 7 Leuens van die Duiwel ──
  useEffect(() => {
    function onOpen() { setShowLeuensDuiwel(true) }
    window.addEventListener('open-leuens-duiwel', onOpen)
    return () => window.removeEventListener('open-leuens-duiwel', onOpen)
  }, [])

  useEffect(() => {
    function onOpen() { setShowBybelMaklik(true) }
    window.addEventListener('open-bybel-maklik-gemaak', onOpen)
    return () => window.removeEventListener('open-bybel-maklik-gemaak', onOpen)
  }, [])

  useEffect(() => {
    function onOpen() { setShowWanneerAngs(true) }
    window.addEventListener('open-wanneer-angs-toeslaan', onOpen)
    return () => window.removeEventListener('open-wanneer-angs-toeslaan', onOpen)
  }, [])

  // ── Vredepad, vanaf die Speel-blad ──
  useEffect(() => {
    function onOpen() { setShowVredepad(true) }
    window.addEventListener('open-vredepad', onOpen)
    return () => window.removeEventListener('open-vredepad', onOpen)
  }, [])

  // ── Bou die Ark, vanaf die Speel-blad ──
  useEffect(() => {
    function onOpen() { setShowArk(true) }
    window.addEventListener('open-bou-die-ark', onOpen)
    return () => window.removeEventListener('open-bou-die-ark', onOpen)
  }, [])

  // ── Vrugtefees, vanaf die Speel-blad ──
  useEffect(() => {
    function onOpen() { setShowVrugtefees(true) }
    window.addEventListener('open-vrugtefees', onOpen)
    return () => window.removeEventListener('open-vrugtefees', onOpen)
  }, [])

  // ── VOLG JESUS ──
  // Die kaart op Luister staan direk onder die speler en stuur hierheen.
  useEffect(() => {
    function onOpen() { setShowVolgJesus(true) }
    window.addEventListener('open-volg-jesus', onOpen)
    return () => window.removeEventListener('open-volg-jesus', onOpen)
  }, [])

  /* ── 'n Uitnodiging na 'n groep ──
   *
   *   /go/volg-jesus/join?kode=DA4055
   *
   * Dewald het die eerste uitnodiging op WhatsApp gestuur, en toe lees NIKS
   * daardie kode nie: 'n mens het geklik en op die gewone tuisblad geland.
   * Die kode is gemaak, die skakel is gebou, die groep het bestaan — en die
   * een ding wat moes gebeur, het nêrens gestaan nie.
   *
   * Die kode gaan in sessionStorage voor ons die adresbalk skoonmaak. Presies
   * die les van die steunblad hierbo: die diensketter herlaai die blad by 'n
   * eerste besoek wanneer daar 'n nuwe weergawe is, en 'n bedoeling wat net in
   * React se toestand lê, oorleef dit nie. */
  useEffect(() => {
    try {
      const kode = kodeUitAdres(window.location.pathname, window.location.search)
      if (kode) {
        stoorNooi(kode)
        window.history.replaceState({}, '', '/')
      }
      /* En 'n gedeelde week: /go/volg-jesus?week=1. Dit is wat die
         "Deel die stemboodskap"-knoppie stuur. */
      const w = weekUitAdres(window.location.pathname, window.location.search)
      if (w) {
        stoorWeek(w)
        window.history.replaceState({}, '', '/')
      }
      if (leesNooi() || leesWeek()) setShowVolgJesus(true)
    } catch {}
  }, [])

  // ── Bybel ──
  // Die gebeurtenis mag 'n gedeelte saambring: VOLG JESUS stuur mense hierheen
  // om die week se Skrif te gaan lees, en dan moet die Bybel by daardie
  // hoofstuk oopmaak en nie by die boekelys nie.
  useEffect(() => {
    function onOpen(e) {
      const d = (e && e.detail) || null
      setBybelBeginBy(d && d.boek && d.hoofstuk ? d : null)
      setShowBybel(true)
    }
    window.addEventListener('open-bybel', onOpen)
    return () => window.removeEventListener('open-bybel', onOpen)
  }, [])

  // ── 1000 Huise van Hoop veldtog ──
  useEffect(() => {
    function onOpen() { setShowHuise(true) }
    window.addEventListener('open-huise-van-hoop', onOpen)
    return () => window.removeEventListener('open-huise-van-hoop', onOpen)
  }, [])

  // ── Leesplanne-verhuis notice (once, only if user has an active plan) ──
  useEffect(() => {
    if (localStorage.getItem('leesplan_moved_notice') === '1') return
    const plans = [
      { prefix: 'dvv', total: 11 },
      { prefix: 'dvk', total: 24 },
      { prefix: 'snv', total: 14 },
      { prefix: 'ld',  total: 7  },
    ]
    const hasActive = plans.some(({ prefix, total }) => {
      const lastDay   = parseInt(localStorage.getItem(`${prefix}_lastDay`) || '0')
      const completed = (() => { try { return JSON.parse(localStorage.getItem(`${prefix}_completed`) || '[]') } catch { return [] } })()
      return lastDay > 0 && completed.length < total
    })
    if (!hasActive) return
    const t = setTimeout(() => setShowLeesplanNotice(true), 4000)
    return () => clearTimeout(t)
  }, [])

  // ── Auto-reload when new service worker takes control ──
  useEffect(() => {
    if (!navigator.serviceWorker) return
    let refreshing = false

    // Chrome kyk net by 'n vars navigasie vir 'n nuwe weergawe. 'n Tab wat
    // oop bly kan dus vir dae op ou kode sit. Vra self.
    let stop = false
    async function kykVirNuut() {
      if (stop) return
      try {
        const reg = await navigator.serviceWorker.getRegistration()
        if (reg) await reg.update()
      } catch {}
    }
    kykVirNuut()
    const tik = setInterval(kykVirNuut, 15 * 60 * 1000)
    function opWakker() { if (!document.hidden) kykVirNuut() }
    document.addEventListener('visibilitychange', opWakker)
    window.addEventListener('focus', opWakker)
    /* 'n Nuwe weergawe WAG; hy word nie afgedwing nie. Sien magHerlaai() in
       src/data/herlaaiBesluit.js vir hoekom. Kortom: die vorige kode het by
       elke ontplooiing elke oop app herlaai, en Dewald het dit reg gelees as
       "die app skop mense uit". */
    let wagtend = false
    /* Word die app in die agtergrond gemonteer, tel daardie tyd van NOU af. */
    let versteekSedert = document.hidden ? Date.now() : null
    let wekker = null

    function weeg() {
      if (magHerlaai({
        wagtend, versteekSedert, nou: Date.now(),
        speelKlank: isPlayingRef.current, herlaaiTans: refreshing,
      })) { refreshing = true; window.location.reload() }
    }
    /* Terwyl die app weg is, weeg ons dit weer sodra die wagtyd verby is. 'n
       Tydhouer in die agtergrond word deur die blaaier gerem en kan laat vuur
       — laat is heeltemal goed genoeg, want niemand kyk nie. */
    function stelWekker() {
      clearTimeout(wekker)
      if (!wagtend || versteekSedert === null) return
      wekker = setTimeout(weeg, Math.max(1000, WAG_MS - (Date.now() - versteekSedert)) + 500)
    }
    function opSigbaarheid() {
      versteekSedert = document.hidden ? Date.now() : null
      if (!document.hidden) clearTimeout(wekker)
      else stelWekker()
    }
    function merkWagtend() { wagtend = true; stelWekker(); weeg() }

    function onMessage(e)        { if (e.data?.type === 'SW_UPDATED') merkWagtend() }
    function onControllerChange()                                      { merkWagtend() }
    document.addEventListener('visibilitychange', opSigbaarheid)
    navigator.serviceWorker.addEventListener('message',          onMessage)
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
    return () => {
      stop = true
      clearInterval(tik)
      clearTimeout(wekker)
      document.removeEventListener('visibilitychange', opWakker)
      window.removeEventListener('focus', opWakker)
      document.removeEventListener('visibilitychange', opSigbaarheid)
      navigator.serviceWorker.removeEventListener('message',          onMessage)
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])

  function handleNav(id) {
    /* Kies die mens self 'n ander oortjie, is die skakel se werk gedoen. */
    try { if (id !== 'sorg') sessionStorage.removeItem('sorg_versoek') } catch {}
    if (id === 'nooiomy') { setNooimy(true); return }
    setTab(id)
    if (screenRef.current) screenRef.current.scrollTop = 0
  }

  /* ────────────────────────────────────────────────────────────
     Die Android terug-knoppie

     In die Play-app (die TWA) IS die stelsel se terug-knoppie die blaaier
     se terug. Daar was geen geskiedenis-hantering nie, dus het die eerste
     druk 'n mens reguit UIT die app uit gegooi — ook al was hy diep binne
     'n leesplan of 'n speletjie. Dit laat die app stukkend voel op die
     enigste knoppie wat elke Android-mens outomaties druk.

     Hoe dit nou werk: elke keer wat 'n laag OOPGAAN, sit ons 'n inskrywing
     in die geskiedenis. Die terug-knoppie eet dan daardie inskrywing en ons
     maak die boonste laag toe. Is niks meer oop nie en staan ons op
     Luister, is daar geen inskrywing oor nie en die stelsel doen sy gewone
     ding — die app gaan toe. Dit is presies wat 'n mens verwag.

     Twee reels wat maklik is om te mis:

     · Maak die mens iets toe met die app se EIE knoppie, moet die
       inskrywing ook weg, anders is die volgende terug-druk 'n dooie een.
       Daarom `history.go(-n)` — en `negeerPop`, sodat daardie terugspring
       nie weer 'n laag toemaak nie.
     · Kom die toemaak UIT 'n terug-druk, het die blaaier reeds teruggegaan
       en mag ons nie weer nie. Daarvoor is `uitPop`.
     ──────────────────────────────────────────────────────────── */

  /* Onderste eerste, boonste laaste. Is meer as een oop, maak ons die
     laaste een toe — die modale sit bo-op die skerms. */
  const oorlegLae = [
    { oop: showAdmin,               toe: () => setShowAdmin(false) },
    { oop: showVolgJesus,           toe: () => setShowVolgJesus(false) },
    { oop: showBybel,               toe: () => setShowBybel(false) },
    { oop: showArk,                 toe: () => setShowArk(false) },
    { oop: showVrugtefees,          toe: () => setShowVrugtefees(false) },
    { oop: showVredepad,            toe: () => setShowVredepad(false) },
    { oop: showHuise,               toe: () => setShowHuise(false) },
    { oop: showJourney,             toe: () => setShowJourney(false) },
    { oop: showDingeVerander,       toe: () => setShowDingeVerander(false) },
    { oop: showSeerNaVryheid,       toe: () => setShowSeerNaVryheid(false) },
    { oop: showLeuensDuiwel,        toe: () => setShowLeuensDuiwel(false) },
    { oop: showBybelMaklik,         toe: () => setShowBybelMaklik(false) },
    { oop: showWanneerAngs,         toe: () => setShowWanneerAngs(false) },
    { oop: showRustelosGedagtes,    toe: () => setShowRustelosGedagtes(false) },
    { oop: showAsAllesWegval,       toe: () => setShowAsAllesWegval(false) },
    { oop: showAngsDetox,           toe: () => setShowAngsDetox(false) },
    { oop: showWatIsMyne,           toe: () => setShowWatIsMyne(false) },
    { oop: showDinkNuut,            toe: () => setShowDinkNuut(false) },
    { oop: showDeursoekBreekStuur,  toe: () => setShowDeursoekBreekStuur(false) },
    { oop: showToksies,             toe: () => setShowToksies(false) },
    { oop: wysSteun,                toe: () => { setWysSteun(false); try { sessionStorage.removeItem('steun_versoek') } catch {} } },
    { oop: showNooimy,              toe: () => setNooimy(false) },
    { oop: showLeesplanNotice,      toe: () => setShowLeesplanNotice(false) },
    { oop: showInstallHelp,         toe: () => setShowInstallHelp(false) },
    { oop: showInstallPopup,        toe: () => setShowInstallPopup(false) },
    { oop: showHoopVennoot,         toe: () => setShowHoopVennoot(false) },
    { oop: showDonation,            toe: () => setDonation(false) },
  ]
  const boonsteLaag = [...oorlegLae].reverse().find(l => l.oop) || null

  /* Hoeveel lae die terug-knoppie kan afpel: die oortjie (as ons nie op
     Luister is nie) plus 'n oop oorlegblad. */
  const oopLae = (tab !== 'luister' ? 1 : 0) + (boonsteLaag ? 1 : 0)

  const diepteRef  = useRef(0)
  const negeerPop  = useRef(0)
  const uitPop     = useRef(false)
  const boonsteRef = useRef(null)
  const tabRef     = useRef(tab)
  useEffect(() => { boonsteRef.current = boonsteLaag })
  useEffect(() => { tabRef.current = tab }, [tab])

  useEffect(() => {
    const vorige = diepteRef.current
    if (oopLae === vorige) return
    diepteRef.current = oopLae

    if (oopLae > vorige) {
      for (let i = vorige; i < oopLae; i++) {
        try { window.history.pushState({ dh: i + 1 }, '') } catch {}
      }
      return
    }
    /* Dit het toegegaan. Kom dit uit 'n terug-druk, het die blaaier reeds
       teruggegaan; anders moet ons die inskrywing self gaan haal. */
    if (uitPop.current) { uitPop.current = false; return }
    const aantal = vorige - oopLae
    negeerPop.current += aantal
    try { window.history.go(-aantal) } catch {}
  }, [oopLae])

  useEffect(() => {
    function opTerug() {
      if (negeerPop.current > 0) { negeerPop.current--; return }
      const laag = boonsteRef.current
      if (laag) { uitPop.current = true; laag.toe(); return }
      if (tabRef.current !== 'luister') { uitPop.current = true; setTab('luister'); return }
      /* Niks oop en ons is op Luister — daar is geen inskrywing meer nie en
         die stelsel maak die app toe. Presies wat 'n mens verwag. */
    }
    window.addEventListener('popstate', opTerug)
    return () => window.removeEventListener('popstate', opTerug)
  }, [])

  // ── Samsung Internet → open in Chrome banner ──
  const [samsungChromeDismissed, setSamsungChromeDismissed] = useState(
    () => !!localStorage.getItem('samsungChromeDismissed')
  )
  /* Na /go toe, NIE na die bladsy waarop hy nou staan nie.

     Dit was dieselfde fout as in public/go.html: die skakel het Chrome op
     die APP oopgemaak, waar daar geen installeerknoppie is nie, en die mens
     se enigste pad was daarna die drie kolletjies in Chrome se spyskaart.

     /go is die installeerblad. Chrome vuur daar `beforeinstallprompt` en die
     groot knoppie wys — een tik en dit is klaar. */
  const installIntentUrl = `intent://${window.location.host}/go#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(`https://${window.location.host}/go`)};end`
  const chromeIntentUrl = installIntentUrl

  /* Wat KAN hierdie besoeker werklik doen? Een besluit, een plek — dieselfde
     funksie wat /go gebruik. Sien src/data/installeerPad.js.

     Binne die Play-app is daar niks om te installeer nie; dit staan reeds op
     sy foon. */
  const installeerPad = isInApp
    ? 'geinstalleer'
    : kiesPad({ ua: navigator.userAgent, kanPrompt: !!installPrompt, geinstalleer: isInstalled })

  // ── Facebook in-app browser → open externally banner ──
  const [fbBannerDismissed, setFbBannerDismissed] = useState(
    () => !!localStorage.getItem('fbBannerDismissed')
  )
  const isiOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
  /* Ook hier `!isInApp` — dieselfde klas fout. 'n Balk wat se die app werk
     nie, hoort nooit BINNE die app nie. */
  const fbBanner = isFacebookBrowser && !isInApp && !fbBannerDismissed ? (
    <div className="fb-browser-banner">
      <div className="fb-browser-text">
        <strong>Daaglikse Hoop werk nie in Facebook se browser nie.</strong>
        {isiOS
          ? <span>Tik op <strong>···</strong> regs bo en kies <strong>"Open in Safari"</strong>.</span>
          : <span>Maak die app oop in Chrome vir die beste ervaring.</span>
        }
      </div>
      {!isiOS && (
        <a className="fb-browser-btn" href={`intent://${window.location.host}${window.location.pathname}#Intent;scheme=https;package=com.android.chrome;end`}>
          Maak in Chrome oop
        </a>
      )}
      <button className="fb-browser-close" onClick={() => {
        setFbBannerDismissed(true)
        localStorage.setItem('fbBannerDismissed', '1')
      }}>✕</button>
    </div>
  ) : null

  /* `!isInApp` is die belangrike deel.

     Die Play-app word deur die foon se verstekblaaier gehuisves. Op 'n
     Samsung is dit Samsung Internet, dus was `isSamsungBrowser` WAAR
     binne-in ons eie app — en die eerste ding wat 'n mens ná 'n
     Play-installasie gesien het, was 'n balk wat hom uit die app uit
     stuur. Druk hy dit, kry hy 'n "Open with"-keuse en dan 'n leë
     Chrome-oortjie.

     Buite die app bly die balk soos hy was: Samsung Internet se web-push
     is onbetroubaar en Chrome is daar die regte raad. */
  const samsungOpenInChromeBanner = isSamsungBrowser && !isInApp && !samsungChromeDismissed ? (
    <div className="samsung-chrome-banner">
      <div className="samsung-chrome-text">
        <strong>Kry kennisgewings elke oggend</strong>
        <span>Maak Daaglikse Hoop in Chrome oop vir daaglikse kennisgewings.</span>
      </div>
      <a className="samsung-chrome-btn" href={chromeIntentUrl}>
        Maak in Chrome oop
      </a>
      <button className="samsung-chrome-close" onClick={() => {
        setSamsungChromeDismissed(true)
        localStorage.setItem('samsungChromeDismissed', '1')
      }}>✕</button>
    </div>
  ) : null

  // ── Persistent install banner ──
  const persistBanner = !isInstalled ? (
    <div className="install-persist-banner">
      <div className="install-persist-text">
        <strong>Sit Daaglikse Hoop op jou foon</strong>
        <span>Luister maklik elke oggend sonder om deur jou browser te soek.</span>
        {/* Die getal oorreed beter as die sin daarbo. Iemand wat twyfel, wil
            weet of ander mense dit gedoen het. */}
        <InstallTelling klas="install-persist-telling" />
      </div>
      {/* Die balk het twee knoppies gehad, en op die meeste fone was albei
          dood: "Sit op my foon" het net gewys as die blaaier ons sy venster
          gegee het, en "Hoe om te installeer" het die drie-kolletjies-les
          oopgemaak — ook in Facebook se blaaier, waar daar geen kolletjies
          is nie.

          Nou is daar EEN knoppie, en dit maak die uitklap oop. Die uitklap
          weet watter pad hierdie foon het (sien kiesPad) en wys 'n knoppie
          wat werklik iets doen. */}
      <div className="install-persist-actions">
        <button className="install-persist-btn" onClick={() => setShowInstallPopup(true)}>
          {installeerPad === 'prompt' ? 'Sit op my foon' : 'Wys my hoe'}
        </button>
      </div>
    </div>
  ) : null

  return (
    <div className="app">
      {fbBanner}
      <div className="screen" ref={screenRef}>
        <ErrorBoundary>
          <div style={tab !== 'luister' ? {display:'none'} : undefined}>
            {/* Net vir wie geblokkeer het. Vir almal anders bestaan dit nie. */}
            {toestemmingAf && <KennisgewingAf />}
            <Luister onPlayingChange={onAudioPlayingChange} installBanner={samsungOpenInChromeBanner || persistBanner} onAdminAccess={() => setShowAdmin(true)} onNoteFinished={() => {
              /* Die kennisgewing-vraag kry voorrang. Sy nie: dit gebeur
                 hoogstens drie keer in 'n mens se lewe, en die deel-popup
                 kom weer. Twee dinge op een slag is nie 'n keuse nie — dit
                 is 'n muur. */
              if (vraKennisgewingsDalk()) return
              if (shouldShowSharePopup()) setActivePopup({ type: 'share' })
            }} onNavigate={handleNav} kennisgewingMerkie={kennisgewingMerkie} />
          </div>
          {tab === 'bidsaam' && <BidSaam />}
          {tab === 'bidnou'  && <BidNou />}
          {tab === 'sorg'    && <Sorg />}
          {tab === 'speel'   && <Speel />}
          {tab === 'meer'    && <Meer targetBookId={targetBookId} onScrolled={() => setTargetBookId(null)} installPrompt={installPrompt} isInstalled={isInstalled} onNavigate={handleNav} />}
        </ErrorBoundary>
      </div>

      {/* Bid Nou is nie meer 'n oortjie nie — hy sit onder Bid Saam. Wys dus
          Bid Saam as die aktiewe een terwyl 'n mens op Bid Nou is, anders lyk
          dit of niks gekies is nie. */}
      <BottomNav active={tab === 'bidnou' ? 'bidsaam' : tab} onChange={handleNav} onBybel={() => setShowBybel(true)} />

      {/* 'n Gedeelde gebedsversoek sit BO-OP alles.

          Die mens wat hier land, het waarskynlik nog nooit van Daaglikse Hoop
          gehoor nie. Sy het 'n boodskap van iemand gekry wat vra dat sy bid.
          Sien sy eers 'n tuisblad, 'n installasie-uitklap en 'n onderste
          navigasie, is sy weg voor sy by die gebed kom. */}
      {gebedId && (
        <BidVirMy
          id={gebedId}
          onKlaar={gebedKlaar}
          onGebid={gebedGebidHanteer}
        />
      )}

      {showAdmin    && <Admin onClose={() => setShowAdmin(false)} />}
      {/* Die steunblad sit onder die twee betaalvensters, sodat 'n mens
          daarheen kan gaan en weer terugkom sonder om dit te verloor. */}
      {wysSteun     && <Steun onSluit={() => {
        setWysSteun(false)
        try { sessionStorage.removeItem('steun_versoek') } catch {}
      }} />}
      {showDonation && <DonationModal beginBedrag={steunBedrag} onClose={() => setDonation(false)} />}
      {showNooimy   && <NooimyModal   onClose={() => setNooimy(false)} />}

      {activePopup?.type === 'ebook' && (
        <EbookPopup
          book={activePopup.book}
          onView={handleEbookView}
          onClose={dismissPopup}
        />
      )}

      {activePopup?.type === 'donation' && (
        <DonationPopup
          onDonate={handleDonationCta}
          onClose={dismissPopup}
        />
      )}

      {activePopup?.type === 'share' && (
        <SharePopup
          onShare={handleShareApp}
          onDone={handleShareDone}
          onLater={handleShareLater}
        />
      )}

      {showInstallPopup && !activePopup && (
        <InstallPopup
          pad={installeerPad}
          onInstall={handleInstallCta}
          onLater={dismissInstallPopup}
          onHelp={() => { setShowInstallPopup(false); setShowInstallHelp(true) }}
          chromeUrl={installIntentUrl}
        />
      )}

      {showInstallHelp && (
        <InstallHelp onClose={() => setShowInstallHelp(false)} />
      )}

      {showJourney && (
        <DaeVanVrede
          onClose={() => setShowJourney(false)}
          onBuyBook={() => {
            setShowJourney(false)
            setTab('meer')
            if (screenRef.current) screenRef.current.scrollTop = 0
          }}
        />
      )}

      {showDingeVerander && (
        <DingeVerander onClose={() => setShowDingeVerander(false)} />
      )}

      {showSeerNaVryheid && (
        <SeerNaVryheid onClose={() => setShowSeerNaVryheid(false)} />
      )}

      {showVredepad && (
        <Vredepad onClose={() => setShowVredepad(false)} />
      )}

      {showHoopVennoot && (
        <HoopVennoot beginBedrag={steunBedrag} onClose={() => setShowHoopVennoot(false)} />
      )}

      {showBybelMaklik && (
        <BybelMaklikGemaak onClose={() => setShowBybelMaklik(false)} />
      )}
      {showWanneerAngs && (
        <WanneerAngsToeslaan onClose={() => setShowWanneerAngs(false)} />
      )}
      {showRustelosGedagtes && (
        <RustelosGedagtes onClose={() => setShowRustelosGedagtes(false)} />
      )}
      {showAsAllesWegval && (
        <AsAllesWegval onClose={() => setShowAsAllesWegval(false)} />
      )}
      {showAngsDetox && (
        <AngsDetox onClose={() => setShowAngsDetox(false)} />
      )}
      {showWatIsMyne && (
        <WatIsMyne onClose={() => setShowWatIsMyne(false)} />
      )}
      {showDinkNuut && (
        <DinkNuutLeefNuut onClose={() => setShowDinkNuut(false)} />
      )}
      {showDeursoekBreekStuur && (
        <DeursoekBreekStuur onClose={() => setShowDeursoekBreekStuur(false)} />
      )}
      {showToksies && (
        <Toksies onClose={() => setShowToksies(false)} />
      )}
      {showLeuensDuiwel && (
        <LeuensDuiwel onClose={() => setShowLeuensDuiwel(false)} />
      )}

      {showVrugtefees && (
        <Vrugtefees onClose={() => setShowVrugtefees(false)} />
      )}

      {showVolgJesus && (
        <VolgJesusLewe onClose={() => setShowVolgJesus(false)} />
      )}

      {showArk && (
        <BouDieArk onClose={() => setShowArk(false)} />
      )}

      {showBybel && (
        <Bybel onClose={() => { setShowBybel(false); setBybelBeginBy(null) }} beginBy={bybelBeginBy} />
      )}

      {showHuise && (
        <HuiseVanHoop
          onClose={() => setShowHuise(false)}
          installPrompt={installPrompt}
          isInstalled={isInstalled}
          onNavigate={handleNav}
        />
      )}

      {showLeesplanNotice && (
        <div className="payment-popup-backdrop" onClick={() => { setShowLeesplanNotice(false); localStorage.setItem('leesplan_moved_notice', '1') }}>
          <div className="payment-popup" onClick={e => e.stopPropagation()}>
            <div className="payment-popup-icon">📖</div>
            <div className="payment-popup-title">Leesplanne is verhuis</div>
            <p className="payment-popup-msg">
              Jou leesplanne is nou op die <strong>e-boek blad</strong>. Alle vordering is bewaar.
            </p>
            <button
              className="payment-popup-btn"
              onClick={() => {
                setShowLeesplanNotice(false)
                localStorage.setItem('leesplan_moved_notice', '1')
                setTab('meer')
                if (screenRef.current) screenRef.current.scrollTop = 0
              }}
            >
              Gaan na Meer →
            </button>
            <button
              className="payment-popup-cancel"
              onClick={() => { setShowLeesplanNotice(false); localStorage.setItem('leesplan_moved_notice', '1') }}
            >
              Ek verstaan
            </button>
          </div>
        </div>
      )}

      {/* 'n Regte uitklap, nie 'n balkie onderaan nie. Dit vra nie meer
          dikwels nie — sien KennisgewingPopup se kop en
          src/data/kennisgewingVra.js. */}
      {wysStappe && (
        <KennisgewingStappe
          opProbeerWeer={stappeKlaar}
          onLater={() => setWysStappe(false)}
        />
      )}

      {showNotifBanner && (
        <KennisgewingPopup
          onJa={handleNotifYes}
          onLater={() => { setNotifBanner(false); merkGevra() }}
        />
      )}

      {paymentResult?.status === 'success' && (
        <div className="payment-popup-backdrop" onClick={() => setPayment(null)}>
          <div className="payment-popup" onClick={e => e.stopPropagation()}>
            {paymentResult.type === 'donation' ? (
              <>
                <div className="payment-popup-icon">🙏</div>
                <div className="payment-popup-title">Baie dankie!</div>
                <p className="payment-popup-msg">
                  Jou skenking is ontvang.<br />
                  <strong>Mag God jou oorvloedig seën.</strong>
                </p>
                <p className="payment-popup-note">"Elke gewer wat vrolik gee, is vir God aangenaam." — 2 Kor. 9:7</p>
              </>
            ) : paymentResult.type === 'subscription' ? (
              <>
                <div className="payment-popup-icon">🌿</div>
                <div className="payment-popup-title">Dankie dat jy 'n Hoop-Vennoot geword het</div>
                <p className="payment-popup-msg">
                  Jou maandelikse bydrae help ons om Daaglikse Hoop gratis beskikbaar te hou vir mense wat hoop, gebed en God se Woord nodig het.
                </p>
                <p className="payment-popup-note">Mag die Here jou ryklik seën.</p>
              </>
            ) : (
              <>
                <div className="payment-popup-icon">🎉</div>
                <div className="payment-popup-title">Betaling geslaag!</div>
                <p className="payment-popup-msg">
                  Jou e-boek{paymentResult.count > 1 ? 'e is' : ' is'} op pad na jou e-pos.<br />
                  <strong>Geen wag nie — dit kom outomaties.</strong>
                </p>
                {paymentResult.purchasedBooks?.some(b => b.pdfUrl) && (
                  <div className="payment-popup-downloads">
                    <p className="payment-popup-download-label">Laai direk af na jou foon:</p>
                    {paymentResult.purchasedBooks.filter(b => b.pdfUrl).map(b => (
                      <a key={b.id}
                        href={b.downloadUrl || b.pdfUrl}
                        download={b.title + '.pdf'}
                        className="payment-popup-download-btn">
                        📥 {b.title}
                      </a>
                    ))}
                  </div>
                )}
                <p className="payment-popup-note">Kyk ook jou spam-houer as jy die e-pos nie sien nie.</p>
              </>
            )}
            <button className="btn-primary payment-popup-btn" onClick={() => setPayment(null)}>
              Dankie! 🙏
            </button>
          </div>
        </div>
      )}

      {paymentResult?.status === 'cancel' && (
        <div className="payment-popup-backdrop" onClick={() => setPayment(null)}>
          <div className="payment-popup" onClick={e => e.stopPropagation()}>
            <div className="payment-popup-icon">😔</div>
            <div className="payment-popup-title">Betaling gekanselleer</div>
            <p className="payment-popup-msg">Geen betaling is verwerk nie. Jy kan enige tyd weer probeer.</p>
            <button className="btn-primary payment-popup-btn" onClick={() => setPayment(null)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
