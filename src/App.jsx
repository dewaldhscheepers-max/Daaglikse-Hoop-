import { useState, useEffect } from 'react'
import Luister from './screens/Luister'
import BidSaam from './screens/BidSaam'
import Meer from './screens/Meer'
import Webtuiste from './screens/Webtuiste'
import BottomNav from './components/BottomNav'
import './App.css'

export default function App() {
  const [tab, setTab]               = useState('luister')
  const [paymentResult, setPayment] = useState(null) // 'success' | 'cancel' | null

  // Handle PayFast return redirect
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

  return (
    <div className="app">
      <div className="screen">
        {tab === 'luister'   && <Luister />}
        {tab === 'bidsaam'   && <BidSaam />}
        {tab === 'meer'      && <Meer />}
        {tab === 'webtuiste' && <Webtuiste onNavigate={setTab} />}
      </div>

      <BottomNav active={tab} onChange={setTab} />

      {/* PayFast result banner */}
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
