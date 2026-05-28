import { useState } from 'react'
import './BidSaam.css'

const SAMPLE_PRAYERS = [
  {
    id: '1',
    text: 'Bid asb vir my ma wat siek is. Ek vertrou die Here, maar my hart is soms onrustig.',
    heartCount: 24,
    createdAt: new Date()
  },
  {
    id: '2',
    text: 'Dankie Here vir U troue goedheid elke oggend. U dra my deur die moeilikste dae.',
    heartCount: 31,
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    id: '3',
    text: "Bid vir genesing vir my ma. Sy is in die hospitaal en ons het behoefte aan 'n wonderwerk.",
    heartCount: 18,
    createdAt: new Date(Date.now() - 86400000)
  }
]

function timeLabel(date) {
  const diff = Date.now() - date.getTime()
  if (diff < 3600000)   return 'Nou'
  if (diff < 86400000)  return 'Vandag'
  if (diff < 172800000) return 'Gister'
  return `${Math.floor(diff / 86400000)} dae gelede`
}

function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}

export default function BidSaam() {
  const [prayers, setPrayers]     = useState(SAMPLE_PRAYERS)
  const [text, setText]           = useState('')
  const [liked, setLiked]         = useState(new Set())
  const [submitted, setSubmitted] = useState(false)
  const [showInput, setShowInput] = useState(false)

  function submit() {
    if (!text.trim()) return
    setPrayers(prev => [{
      id: String(Date.now()),
      text: text.trim(),
      heartCount: 0,
      createdAt: new Date()
    }, ...prev])
    setText('')
    setSubmitted(true)
    setShowInput(false)
    setTimeout(() => setSubmitted(false), 3000)
  }

  function toggleLike(id) {
    setLiked(prev => {
      const next = new Set(prev)
      const delta = next.has(id) ? -1 : 1
      next.has(id) ? next.delete(id) : next.add(id)
      setPrayers(ps => ps.map(p => p.id === id ? { ...p, heartCount: p.heartCount + delta } : p))
      return next
    })
  }

  const icons = ['🌿', '✝️', '🕊️', '🌸', '🙏']

  return (
    <div className="bidsaam">
      {/* Header */}
      <div className="bidsaam-header screen-header">
        <h1>Bid Saam</h1>
        <div className="bidsaam-heart-icon">♡</div>
        <div className="subtitle">ONS BID VIR MEKAAR</div>
        <p>'n Anonieme gebedsruimte vir almal. Wat op jou hart is, maak saak.</p>
      </div>

      {/* Success message */}
      {submitted && (
        <div className="submitted-banner">✓ Jou versoek is gedeel. Ons bid saam!</div>
      )}

      {/* Prayer wall */}
      <div className="bidsaam-body">
        <div className="prayer-list">
          {prayers.map((prayer, i) => (
            <div key={prayer.id} className="prayer-card card">
              <div className="prayer-icon">{icons[i % icons.length]}</div>
              <div className="prayer-content">
                <p className="prayer-text">{prayer.text}</p>
                <div className="prayer-footer">
                  <span className="prayer-meta">Anoniem · {timeLabel(prayer.createdAt)}</span>
                  <button
                    className={`heart-btn${liked.has(prayer.id) ? ' liked' : ''}`}
                    onClick={() => toggleLike(prayer.id)}
                  >
                    <HeartIcon filled={liked.has(prayer.id)} />
                    <span>{prayer.heartCount}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input area — always at bottom above nav */}
      {showInput ? (
        <div className="prayer-input-overlay">
          <div className="anon-badge">🔒 Anoniem — geen name word gestoor nie</div>
          <textarea
            className="prayer-textarea"
            placeholder="Deel jou gebedsversoek hier..."
            value={text}
            onChange={e => setText(e.target.value)}
            rows={4}
            maxLength={500}
            autoFocus
          />
          <div className="input-row">
            <button className="cancel-btn" onClick={() => { setShowInput(false); setText('') }}>Kanselleer</button>
            <button className="btn-primary submit-btn" onClick={submit} disabled={!text.trim()}>
              Deel
            </button>
          </div>
        </div>
      ) : (
        <div className="prayer-cta">
          <button className="btn-primary share-btn" onClick={() => setShowInput(true)}>
            ✏️ Deel jou gebedsversoek (anoniem)
          </button>
        </div>
      )}
    </div>
  )
}
