import { useState } from 'react'
import './BidSaam.css'

/* Sample prayers (replace with Firestore later) */
const SAMPLE_PRAYERS = [
  {
    id: '1',
    text: 'Bid asseblief vir my ma wat siek is. Sy het baie pyn en ons is bekommerd.',
    prayedCount: 14,
    createdAt: new Date()
  },
  {
    id: '2',
    text: 'Ek soek werk al vir drie maande. Bid saam dat God \'n deur sal oopmaak.',
    prayedCount: 31,
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: '3',
    text: 'My huwelik gaan deur \'n moeilike tyd. Bid dat God ons herstel.',
    prayedCount: 47,
    createdAt: new Date(Date.now() - 172800000)
  }
]

function timeLabel(date) {
  const diff = Date.now() - date.getTime()
  if (diff < 86400000) return 'Vandag'
  if (diff < 172800000) return 'Gister'
  const days = Math.floor(diff / 86400000)
  return `${days} dae gelede`
}

function PrayingHandsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M17 11.5V7a2 2 0 0 0-4 0v4.5"/>
      <path d="M11 11.5V5a2 2 0 0 0-4 0v8.5"/>
      <path d="M7 13.5v1a5 5 0 0 0 10 0v-3"/>
      <path d="M17 9a2 2 0 0 1 4 0v5.5"/>
    </svg>
  )
}

export default function BidSaam() {
  const [prayers, setPrayers]   = useState(SAMPLE_PRAYERS)
  const [text, setText]         = useState('')
  const [prayed, setPrayed]     = useState(new Set())
  const [submitted, setSubmitted] = useState(false)

  function submit() {
    if (!text.trim()) return
    const newPrayer = {
      id: String(Date.now()),
      text: text.trim(),
      prayedCount: 0,
      createdAt: new Date()
    }
    setPrayers(prev => [newPrayer, ...prev])
    setText('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  function togglePrayed(id) {
    setPrayed(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        setPrayers(ps => ps.map(p => p.id === id ? { ...p, prayedCount: p.prayedCount - 1 } : p))
      } else {
        next.add(id)
        setPrayers(ps => ps.map(p => p.id === id ? { ...p, prayedCount: p.prayedCount + 1 } : p))
      }
      return next
    })
  }

  return (
    <div className="bidsaam">
      <div className="screen-header">
        <h1>Bid Saam</h1>
        <p>Ons is hier vir mekaar. Deel jou versoek anoniem en laat ons saam bid.</p>
      </div>

      <div className="bidsaam-body">
        {/* Input card */}
        <div className="card prayer-input-card">
          <div className="anon-badge">🔒 Anoniem — geen name word gestoor nie</div>
          <textarea
            className="prayer-textarea"
            placeholder="Deel jou gebedsversoek hier..."
            value={text}
            onChange={e => setText(e.target.value)}
            rows={4}
            maxLength={500}
          />
          <div className="input-footer">
            <span className="char-count">{text.length}/500</span>
            <button
              className="btn-primary submit-btn"
              onClick={submit}
              disabled={!text.trim()}
            >
              Deel jou gebedsversoek
            </button>
          </div>
          {submitted && (
            <div className="submitted-msg">✓ Jou versoek is gedeel. Ons bid saam!</div>
          )}
        </div>

        {/* Wall */}
        <h3 className="section-title">Gebedsversoeke</h3>
        <div className="prayer-list">
          {prayers.map(prayer => (
            <div key={prayer.id} className="prayer-card card">
              <div className="prayer-icon">🙏</div>
              <div className="prayer-content">
                <p className="prayer-text">{prayer.text}</p>
                <span className="prayer-meta">Anoniem · {timeLabel(prayer.createdAt)}</span>
                <button
                  className={`prayed-btn${prayed.has(prayer.id) ? ' prayed' : ''}`}
                  onClick={() => togglePrayed(prayer.id)}
                >
                  <PrayingHandsIcon />
                  Ek het gebid
                  <span className="prayed-count">{prayer.prayedCount}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
