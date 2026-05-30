import { useState, useEffect, useRef } from 'react'
import Luister from './screens/Luister'
import BidSaam from './screens/BidSaam'
import Meer from './screens/Meer'
import Admin from './screens/Admin'
import { DonationModal } from './screens/Webtuiste'
import NooimyModal from './components/NooimyModal'
import BottomNav from './components/BottomNav'
import { DonationPopup, EbookPopup, InstallPopup, SharePopup } from './components/Popups'
import InstallHelp from './components/InstallHelp'
import { BOOKS } from './data/books'
import { subscribeToNotifications, ensureNotificationToken, isSamsungBrowser } from './firebase'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

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
  const [showAdmin, setShowAdmin] = useState(false)
  const [targetBookId, setTargetBookId] = useState(null)

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
    function onPrompt(e) { e.preventDefault(); setInstallPrompt(e) }
    function onInstalled() { setIsInstalled(true) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
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
      // Don't show donation/ebook popup on same day as install popup
      const today     = new Date().toISOString().slice(0, 10)
      if (!isInstalled) return
      if (localStorage.getItem('installPopupDate') === today) return

      const thisMonth = new Date().toISOString().slice(0, 7)

      if (localStorage.getItem('lastPopupDate') === today) return

      const seenEbooks  = JSON.parse(localStorage.getItem('seenEbooks') || '[]')
      const unseenBook  = BOOKS.find(b => !seenEbooks.includes(b.id))
      const donationDue = localStorage.getItem('donationPopupMonth') !== thisMonth

      const appOpenDays      = JSON.parse(localStorage.getItem('appOpenDays') || '[]')
      const completedListens = parseInt(localStorage.getItem('completedListens') || '0')
      const shareSharedAt    = parseInt(localStorage.getItem('sharePopupSharedAt') || '0')
      const shareLaterAt     = parseInt(localStorage.getItem('sharePopupLaterAt') || '0')
      const hasReceivedValue = appOpenDays.length >= 2 || completedListens >= 2
      const shareDue = hasReceivedValue &&
        Date.now() - shareSharedAt > 30 * 24 * 60 * 60 * 1000 &&
        Date.now() - shareLaterAt  >  7 * 24 * 60 * 60 * 1000

      let popup = null
      if (unseenBook) {
        popup = { type: 'ebook', book: unseenBook }
      } else if (donationDue) {
        popup = { type: 'donation' }
      } else if (shareDue) {
        popup = { type: 'share' }
      }

      if (!popup) return

      if (isPlayingRef.current) {
        setPendingPopup(popup)
      } else {
        setActivePopup(popup)
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [isInstalled])

  function dismissPopup() {
    const today     = new Date().toISOString().slice(0, 10)
    const thisMonth = new Date().toISOString().slice(0, 7)
    localStorage.setItem('lastPopupDate', today)

    if (activePopup?.type === 'ebook') {
      const seen = JSON.parse(localStorage.getItem('seenEbooks') || '[]')
      seen.push(activePopup.book.id)
      localStorage.setItem('seenEbooks', JSON.stringify(seen))
    } else if (activePopup?.type === 'donation') {
      localStorage.setItem('donationPopupMonth', thisMonth)
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
    dismissPopup()
    const msg = 'Ek dink hierdie app gaan jou help. Daaglikse Hoop gee elke oggend \'n kort boodskap van hoop, gebed en bemoediging.\n\nLaai dit hier af: https://daagliksehoop.vercel.app'
    if (navigator.share) {
      try { await navigator.share({ title: 'Daaglikse Hoop', text: msg, url: 'https://daagliksehoop.vercel.app' }) } catch {}
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
    }
  }

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
    const params = new URLSearchParams(window.location.search)
    const status = params.get('payment')
    const title  = params.get('title')
    if (status === 'success') {
      setPayment({ status: 'success', title: decodeURIComponent(title || '') })
      setTab('meer')
      window.history.replaceState({}, '', '/')
    } else if (status === 'cancel') {
      setPayment({ status: 'cancel' })
      setTab('meer')
      window.history.replaceState({}, '', '/')
    }
  }, [])

  const screenRef = useRef(null)

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
  const persistBanner = !isInstalled && !installBannerDismissed ? (
    <div className="install-persist-banner">
      <div className="install-persist-text">
        <strong>Sit Daaglikse Hoop op jou foon</strong>
        <span>Luister maklik elke oggend sonder om deur jou browser te soek.</span>
      </div>
      <div className="install-persist-actions">
        <button className="install-persist-btn" onClick={handleInstallCta}>
          Sit op my foon
        </button>
        <button className="install-persist-help" onClick={() => setShowInstallHelp(true)}>
          Wys my hoe
        </button>
      </div>
      <button className="install-persist-close" onClick={() => setInstallBannerDismissed(true)}>✕</button>
    </div>
  ) : null

  return (
    <div className="app">
      <div className="screen" ref={screenRef}>
        <ErrorBoundary>
          {tab === 'luister' && <Luister onPlayingChange={onAudioPlayingChange} installBanner={samsungOpenInChromeBanner || persistBanner} onAdminAccess={() => setShowAdmin(true)} />}
          {tab === 'bidsaam' && <BidSaam />}
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
            <div className="payment-popup-icon">🎉</div>
            <div className="payment-popup-title">Betaling geslaag!</div>
            <p className="payment-popup-msg">
              Jou PDF{paymentResult.count > 1 ? "'s is" : ' is'} op pad na jou e-pos.<br />
              <strong>Geen wag nie — dit kom outomaties.</strong>
            </p>
            <p className="payment-popup-note">Kyk ook jou spam-vouer as jy dit nie sien nie.</p>
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
