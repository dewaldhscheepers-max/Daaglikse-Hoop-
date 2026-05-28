import { useState, useEffect } from 'react'
import Luister from './screens/Luister'
import BidSaam from './screens/BidSaam'
import Meer from './screens/Meer'
import { DonationModal } from './screens/Webtuiste'
import NooimyModal from './components/NooimyModal'
import BottomNav from './components/BottomNav'
import './App.css'

export default function App() {
  const [tab, setTab]               = useState('luister')
  const [showDonation, setDonation] = useState(false)
  const [showNooimy, setNooimy]     = useState(false)
  const [paymentResult, setPayment] = useState(null)

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
        {tab === 'luister' && <Luister />}
        {tab === 'bidsaam' && <BidSaam />}
        {tab === 'meer'    && <Meer />}
      </div>

      <BottomNav active={tab} onChange={handleNav} />

      {showDonation && <DonationModal onClose={() => setDonation(false)} />}
      {showNooimy   && <NooimyModal   onClose={() => setNooimy(false)} />}

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
