import { useState, useEffect, useRef } from 'react'
import Luister from './screens/Luister'
import BidSaam from './screens/BidSaam'
import Meer from './screens/Meer'
import { DonationModal } from './screens/Webtuiste'
import NooimyModal from './components/NooimyModal'
import BottomNav from './components/BottomNav'
import { DonationPopup, EbookPopup } from './components/Popups'
import { BOOKS } from './data/books'
import { subscribeToNotifications } from './firebase'
import './App.css'

export default function App() {
  const [tab, setTab]               = useState('luister')
  const [showDonation, setDonation] = useState(false)
  const [showNooimy, setNooimy]     = useState(false)
  const [paymentResult, setPayment] = useState(null)
  const [showNotifBanner, setNotifBanner] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [activePopup, setActivePopup] = useState(null)
  const [pendingPopup, setPendingPopup] = useState(null)
  const isPlayingRef = useRef(false)

  function onAudioPlayingChange(playing) {
    isPlayingRef.current = playing
    if (!playing && pendingPopup) {
      setActivePopup(pendingPopup)
      setPendingPopup(null)
    }
  }

  // ── Popup manager ──
  useEffect(() => {
    const timer = setTimeout(() => {
      const today     = new Date().toISOString().slice(0, 10)
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
  }, [])

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

  // ── Install to home screen prompt ──
  useEffect(() => {
    const alreadyInstalled =
      window.navigator.standalone ||
      window.matchMedia('(display-mode: standalone)').matches
    if (alreadyInstalled) return
    if (localStorage.getItem('installDismissed')) return

    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream
    if (ios) {
      setIsIos(true)
      setTimeout(() => setShowInstallBanner(true), 2000)
      return
    }

    function onPrompt(e) {
      e.preventDefault()
      setInstallPrompt(e)
      setTimeout(() => setShowInstallBanner(true), 2000)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  async function handleInstall() {
    if (installPrompt) {
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') localStorage.setItem('installDismissed', '1')
      setInstallPrompt(null)
    }
    setShowInstallBanner(false)
  }

  function dismissInstall() {
    setShowInstallBanner(false)
    localStorage.setItem('installDismissed', '1')
  }

  // ── Notification permission banner ──
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      const t = setTimeout(() => setNotifBanner(true), 3000)
      return () => clearTimeout(t)
    }
  }, [])

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

  function handleNav(id) {
    if (id === 'skenk')   { setDonation(true); return }
    if (id === 'nooiomy') { setNooimy(true);   return }
    setTab(id)
  }

  return (
    <div className="app">
      <div className="screen">
        {tab === 'luister' && <Luister onPlayingChange={onAudioPlayingChange} />}
        {tab === 'bidsaam' && <BidSaam />}
        {tab === 'meer'    && <Meer />}
      </div>

      <BottomNav active={tab} onChange={handleNav} />

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

      {showInstallBanner && (
        <div className="install-banner">
          <span className="install-banner-icon">📱</span>
          <div className="install-banner-text">
            <strong>Voeg by jou tuisskerm</strong>
            {isIos
              ? 'Tik die deel-knoppie onderaan en kies "Voeg by tuisskerm"'
              : "Maak Daaglikse Hoop 'n app op jou foon — gratis en vinnig."}
          </div>
          {!isIos && (
            <button className="install-banner-yes" onClick={handleInstall}>Voeg by</button>
          )}
          <button className="install-banner-no" onClick={dismissInstall}>✕</button>
        </div>
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

      {paymentResult && (
        <div className={`payment-banner ${paymentResult.status}`}>
          {paymentResult.status === 'success'
            ? `✓ Betaling geslaag! Ons stuur "${paymentResult.title}" na jou e-pos.`
            : '✕ Betaling gekanselleer.'}
          <button onClick={() => setPayment(null)}>✕</button>
        </div>
      )}
    </div>
  )
}
