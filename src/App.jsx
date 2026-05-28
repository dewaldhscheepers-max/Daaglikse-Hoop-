import { useState } from 'react'
import Luister from './screens/Luister'
import BidSaam from './screens/BidSaam'
import Webtuiste from './screens/Webtuiste'
import BottomNav from './components/BottomNav'

export default function App() {
  const [tab, setTab] = useState('luister')

  return (
    <div className="app">
      <div className="screen">
        {tab === 'luister'   && <Luister />}
        {tab === 'bidsaam'   && <BidSaam />}
        {tab === 'webtuiste' && <Webtuiste />}
      </div>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
