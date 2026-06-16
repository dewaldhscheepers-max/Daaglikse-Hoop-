import { useState, useEffect, useRef } from 'react'
import Luister from './screens/Luister'
import BidSaam from './screens/BidSaam'
import BidNou from './screens/BidNou'
import Meer from './screens/Meer'
import Admin from './screens/Admin'
import { DonationModal } from './screens/Webtuiste'
import NooimyModal from './components/NooimyModal'
import BottomNav from './components/BottomNav'
import { DonationPopup, EbookPopup, InstallPopup, SharePopup } from './components/Popups'
import InstallHelp from './components/InstallHelp'
import { BOOKS } from './data/books'
import { subscribeToNotifications, ensureNotificationToken, isSamsungBrowser, db } from './firebase'
import { getDoc, doc } from 'firebase/firestore'
import ErrorBoundary from './components/ErrorBoundary'
import DaeVanVrede from './screens/DaeVanVrede'
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
    const today = new Date().toISOString().slice(0, 10)
    if (localStorage.getItem('installPopupDate') === today) return
    const t = setTimeout(() => {
      if (!isPlayingRef.current) {
        setShowInstallPopup(true)
        localStorage.setItem('installPopupDate', today)
      }
    }, 3000)
    return () => clearTimeout(t)
  }, [isInstalled])

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

  function dismissInstallPopup() { setShowInstallPopup(false) }

  // ── Notification permission banner + silent auto-resubscribe ──
  useEffect(() => {
    if (isSamsungBrowser) return
    if (!('Notification' in window)) return
    const perm = Notification.permission
    if (perm === 'granted' && localStorage.getItem('fcmToken')) {
      ensureNotificationToken()
      return
    }
    if (perm === 'default' || (perm === 'granted' && !localStorage.getItem('fcmToken'))) {
      // Installed: ask after 3s. Browser: ask after 20s (give time to install first).
      const delay = isInstalled ? 3000 : 20000
      const t = setTimeout(() => setNotifBanner(true), delay)
      return () => clearTimeout(t)
    }
  }, [isInstalled])

  async function handleNotifYes() {
    setNotifBanner(false)
    try {
      const result = await subscribeToNotifications()
      if (!result.ok) {
        if (result.reason === 'permission_denied') {
          alert('Kennisgewings is geblokkeer vir hierdie webtuiste.\n\nOm dit reg te stel:\n1. Tik die 🔒 slotjie in Chrome se adresbalk\n2. Kies "Site settings"\n3. Verander "Notifications" na "Allow"\n4. Herlaai die app')
        } else {
          alert('Kennisgewings kon nie geaktiveer word nie. (' + result.reason + ')')
        }
      }
    } catch (e) {
      alert('Fout: ' + e.message)
    }
  }

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
      setTab('meer')
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
      setTab('meer')
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

  // ── Auto-reload when new service worker takes control ──
  useEffect(() => {
    if (!navigator.serviceWorker) return
    let refreshing = false
    function doRefresh() {
      if (!refreshing && !isPlayingRef.current) { refreshing = true; window.location.reload() }
    }
    function onMessage(e)        { if (e.data?.type === 'SW_UPDATED') doRefresh() }
    function onControllerChange()                                      { doRefresh() }
    navigator.serviceWorker.addEventListener('message',          onMessage)
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
    return () => {
      navigator.serviceWorker.removeEventListener('message',          onMessage)
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])

  function handleNav(id) {
    if (id === 'skenk')   { setDonation(true); return }
    if (id === 'nooiomy') { setNooimy(true);   return }
    setTab(id)
    if (screenRef.current) screenRef.current.scrollTop = 0
  }

  // ── Samsung Internet → open in Chrome banner ──
  const [samsungChromeDismissed, setSamsungChromeDismissed] = useState(
    () => !!localStorage.getItem('samsungChromeDismissed')
  )
  const chromeIntentUrl = `intent://${window.location.host}${window.location.pathname}#Intent;scheme=https;package=com.android.chrome;end`

  const samsungOpenInChromeBanner = isSamsungBrowser && !samsungChromeDismissed ? (
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
      </div>
      <div className="install-persist-actions">
        {installPrompt && (
          <button className="install-persist-btn" onClick={handleInstallCta}>
            Sit op my foon
          </button>
        )}
        <button className="install-persist-help" onClick={() => setShowInstallHelp(true)}>
          {installPrompt ? 'Wys my hoe' : 'Hoe om te installeer'}
        </button>
      </div>
    </div>
  ) : null

  return (
    <div className="app">
      <div className="screen" ref={screenRef}>
        <ErrorBoundary>
          <div style={tab !== 'luister' ? {display:'none'} : undefined}>
            <Luister onPlayingChange={onAudioPlayingChange} installBanner={samsungOpenInChromeBanner || persistBanner} onAdminAccess={() => setShowAdmin(true)} onNoteFinished={() => { if (shouldShowSharePopup()) setActivePopup({ type: 'share' }) }} />
          </div>
          {tab === 'bidsaam' && <BidSaam />}
          {tab === 'bidnou'  && <BidNou />}
          {tab === 'meer'    && <Meer targetBookId={targetBookId} onScrolled={() => setTargetBookId(null)} />}
        </ErrorBoundary>
      </div>

      <BottomNav active={tab} onChange={handleNav} />

      {showAdmin    && <Admin onClose={() => setShowAdmin(false)} />}
      {showDonation && <DonationModal onClose={() => setDonation(false)} />}
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
          onInstall={handleInstallCta}
          onLater={dismissInstallPopup}
          onHelp={() => { setShowInstallPopup(false); setShowInstallHelp(true) }}
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

      {showNotifBanner && (
        <div className="notif-banner">
          <div className="notif-banner-text">
            <strong>🌅 Oggend Kennisgewings</strong>
            Kry elke oggend 'n nuwe oordenking op jou skerm.
          </div>
          <button className="notif-banner-yes" onClick={handleNotifYes}>Ja, graag</button>
          <button className="notif-banner-no" onClick={() => setNotifBanner(false)}>✕</button>
        </div>
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
