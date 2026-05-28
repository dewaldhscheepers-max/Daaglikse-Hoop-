import { useState } from 'react'
import './BidSaam.css'

const SAMPLE_PRAYERS = [
  {
    id: '1',
    text: 'Bid asb vir my ma wat siek is. Ek vertrou die Here, maar my hart is soms onrustig.',
    prayedCount: 14,
    createdAt: new Date()
  },
  {
    id: '2',
    text: "Ek soek werk al vir drie maande. Bid saam dat God 'n deur sal oopmaak.",
    prayedCount: 31,
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: '3',
    text: "My huwelik gaan deur 'n moeilike tyd. Bid dat God ons herstel.",
    prayedCount: 47,
    createdAt: new Date(Date.now() - 172800000)
  }
]

function timeLabel(date) {
  const diff = Date.now() - date.getTime()
  if (diff < 86400000)  return 'Vandag'
  if (diff < 172800000) return 'Gister'
  return `${Math.floor(diff / 86400000)} dae gelede`
}

function PrayingHandsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
      <path d="M9 12V7a2 2 0 0 1 4 0v5"/>
      <path d="M7 10V8a2 2 0 0 1 4 0"/>
      <path d="M13 10V8a2 2 0 0 1 4 0v6a5 5 0 0 1-10 0v-4a2 2 0 0 1 4 0"/>
    </svg>
  )
}

export default function BidSaam() {
  const [prayers, setPrayers]     = useState(SAMPLE_PRAYERS)
  const [text, setText]           = useState('')
  const [prayed, setPrayed]       = useState(new Set())
  const [submitted, setSubmitted] = useState(false)

  function submit() {
    if (!text.trim()) return
    setPrayers(prev => [{
      id: String(Date.now()),
      text: text.trim(),
      prayedCount: 0,
      createdAt: new Date()
    }, ...prev])
    setText('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  function togglePrayed(id) {
    setPrayed(prev => {
      const next = new Set(prev)
      const delta = next.has(id) ? -1 : 1
      next.has(id) ? next.delete(id) : next.add(id)
      setPrayers(ps => ps.map(p => p.id === id ? { ...p, prayedCount: p.prayedCount + delta } : p))
      return next
    })
  }

  return (
    <div className="bidsaam">
      <div className="bidsaam-header screen-header">
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
            <button className="btn-primary submit-btn" onClick={submit} disabled={!text.trim()}>
              Deel jou gebedsversoek
            </button>
          </div>
          {submitted && (
            <div className="submitted-msg">✓ Jou versoek is gedeel. Ons bid saam!</div>
          )}
        </div>

        {/* Prayer wall */}
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
