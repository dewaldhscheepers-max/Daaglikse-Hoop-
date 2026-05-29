import { useState, useEffect, useRef } from 'react'
import Luister from './screens/Luister'
import BidSaam from './screens/BidSaam'
import Meer from './screens/Meer'
import Admin from './screens/Admin'
import { DonationModal } from './screens/Webtuiste'
import NooimyModal from './components/NooimyModal'
import BottomNav from './components/BottomNav'
import { DonationPopup, EbookPopup, InstallPopup } from './components/Popups'
import InstallHelp from './components/InstallHelp'
import { BOOKS } from './data/books'
import { subscribeToNotifications } from './firebase'
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
  const [showInstallHelp, setShowInstallHelp] = useState(false)
  const [activePopup, setActivePopup] = useState(null)
  const [pendingPopup, setPendingPopup] = useState(null)
  const isPlayingRef = useRef(false)
  const [showAdmin, setShowAdmin] = useState(false)

  function onAudioPlayingChange(playing) {
    isPlayingRef.current = playing
    if (!playing && pendingPopup) {
      setActivePopup(pendingPopup)
      setPendingPopup(null)
    }
  }

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

      let popup = null
      if (unseenBook) {
        popup = { type: 'ebook', book: unseenBook }
      } else if (donationDue) {
        popup = { type: 'donation' }
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
    dismissPopup()
    setTab('meer')
  }

  function handleDonationCta() {
    dismissPopup()
    setDonation(true)
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

  // ── Notification permission banner ──
  useEffect(() => {
    if (!isInstalled) return
    if ('Notification' in window && Notification.permission === 'default') {
      const t = setTimeout(() => setNotifBanner(true), 3000)
      return () => clearTimeout(t)
    }
  }, [isInstalled])

  async function handleNotifYes() {
    setNotifBanner(false)
    await subscribeToNotifications()
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
        {tab === 'luister' && <Luister onPlayingChange={onAudioPlayingChange} installBanner={persistBanner} onAdminAccess={() => setShowAdmin(true)} />}
        {tab === 'bidsaam' && <BidSaam />}
        {tab === 'meer'    && <Meer />}
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
