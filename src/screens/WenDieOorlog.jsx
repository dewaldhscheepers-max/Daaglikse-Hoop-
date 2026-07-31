import { useState, useEffect, useRef } from 'react'
import './DaeVanVrede.css'
import { sharePlan } from '../shareUtil'

let cachedData = null

const TOTAL = 58

export default function WenDieOorlog({ onClose }) {
  const [view, setView]           = useState('list')
  const [current, setCurrent]     = useState(null)
  const [inskrywings, setInskrywings] = useState(cachedData || [])
  const [loading, setLoading]     = useState(!cachedData)
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wdo_completed') || '[]') } catch { return [] }
  })
  const [lastDay, setLastDay]     = useState(() => {
    const v = parseInt(localStorage.getItem('wdo_lastDay') || '0')
    return v || null
  })
  const bodyRef = useRef(null)

  useEffect(() => {
    if (cachedData) return
    fetch('/wen-die-oorlog.json')
      .then(r => r.json())
      .then(data => {
        const list = data.inskrywings || data
        cachedData = list
        setInskrywings(list)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }, [view, current])

  function markCompleted(nr) {
    if (completed.includes(nr)) return
    const next = [...completed, nr]
    setCompleted(next)
    localStorage.setItem('wdo_completed', JSON.stringify(next))
  }

  function handleShare() {
    sharePlan('Wen die Oorlog in Jou Gedagtes', `⚡ Wen die Oorlog in Jou Gedagtes — 58 inskrywings\n\nLees dit gratis op Daaglikse Hoop:`)
  }

  function openEntry(nr) {
    const entry = inskrywings.find(e => e.volgorde === nr)
    if (!entry) return
    if (!lastDay && !localStorage.getItem('rp_counted_wdo')) {
      localStorage.setItem('rp_counted_wdo', '1')
      fetch('/api/kinder-boek-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: 'wen-die-oorlog' }),
      }).catch(() => {})
    }
    setCurrent(entry)
    setLastDay(nr)
    localStorage.setItem('wdo_lastDay', String(nr))
    setView('day')
  }

  function finishEntry() {
    markCompleted(current.volgorde)
    if (current.volgorde === TOTAL) setView('closing')
    else setView('list')
  }

  function tipeLabel(entry) {
    if (entry.tipe === 'hoofstuk') return `Hoofstuk ${entry.nommer}`
    return `Dag ${entry.nommer}`
  }

  if (view === 'list') {
    return (
      <div className="dvv-overlay">
        <div className="dvv-screen">
          <div className="dvv-header">
            <button className="dvv-back" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Terug
            </button>
            <span className="dvv-header-title">Wen die Oorlog</span>
            <button className="dvv-header-share" onClick={handleShare} aria-label="Deel">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </button>
            <button className="dvv-header-close" onClick={onClose}>✕</button>
          </div>

          <div className="dvv-list-body" ref={bodyRef}>
            <div className="bmg-intro">
              <div className="bmg-intro-sub">58 inskrywings · Hoofstukke en Dae van Denkvernuwing</div>
              <div className="dvv-opening-progress">
                <div className="dvv-progress-bar">
                  <div className="dvv-progress-fill" style={{ width: `${(completed.length / TOTAL) * 100}%` }} />
                </div>
                <span className="dvv-progress-label">{completed.length} van {TOTAL} voltooi</span>
              </div>
            </div>

            {lastDay && !completed.includes(lastDay) && (
              <button className="dvv-continue-card" onClick={() => openEntry(lastDay)}>
                Gaan voort by #{lastDay} →
              </button>
            )}

            {loading ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>Inhoud word gelaai...</div>
            ) : (
              <div className="dvv-sleutel-group">
                {inskrywings.map(entry => {
                  const done = completed.includes(entry.volgorde)
                  return (
                    <button
                      key={entry.volgorde}
                      className={`dvv-dag-row${done ? ' dvv-dag-done' : ''}`}
                      onClick={() => openEntry(entry.volgorde)}
                    >
                      <div className={`dvv-dag-num${done ? ' dvv-dag-num-done' : ''}`}>
                        {done ? '✓' : entry.volgorde}
                      </div>
                      <div className="dvv-dag-info">
                        <span className="dvv-dag-title">{entry.titel}</span>
                        <span className="dvv-dag-ref" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tipeLabel(entry)}</span>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15" style={{ flexShrink: 0, color: 'var(--text-muted)' }}>
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  )
                })}
              </div>
            )}
            <div style={{ height: 32 }} />
          </div>
        </div>
      </div>
    )
  }

  if (view === 'day' && current) {
    const done = completed.includes(current.volgorde)
    return (
      <div className="dvv-overlay">
        <div className="dvv-screen">
          <div className="dvv-header">
            <button className="dvv-back" onClick={() => setView('list')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Terug
            </button>
            <span className="dvv-header-title">{tipeLabel(current)}</span>
            <button className="dvv-header-share" onClick={handleShare} aria-label="Deel">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </button>
            <button className="dvv-header-close" onClick={onClose}>✕</button>
          </div>

          <div className="dvv-day-body" ref={bodyRef}>
            <div className="bmg-day-header">
              <h2 className="bmg-day-title">{current.titel}</h2>
              <div className="bmg-lees-badge">⚡ {tipeLabel(current)} van {TOTAL}</div>
            </div>

            <section className="dvv-section">
              <div className="dvv-section-body">
                {current.teks.split('\n\n').map((para, i) => {
                  const trimmed = para.trim()
                  const words = trimmed.replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean)
                  const isHeading = words.length >= 1 && words.length <= 12 &&
                    words.every(w => w === w.toUpperCase()) && trimmed.length < 100
                  return isHeading
                    ? <p key={i} style={{ fontWeight: 700, color: 'var(--text)', marginTop: 8 }}>{trimmed}</p>
                    : <p key={i}>{trimmed}</p>
                })}
              </div>
            </section>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {current.volgorde > 1 && (
                <button
                  className="dvv-secondary-btn"
                  style={{ flex: 1 }}
                  onClick={() => openEntry(current.volgorde - 1)}
                >
                  ← Vorige
                </button>
              )}
              {current.volgorde < TOTAL && (
                <button
                  className="dvv-secondary-btn"
                  style={{ flex: 1 }}
                  onClick={() => openEntry(current.volgorde + 1)}
                >
                  Volgende →
                </button>
              )}
            </div>

            <button className="dvv-primary-btn dvv-done-btn" onClick={finishEntry}>
              {done
                ? current.volgorde === TOTAL ? 'Sien slotskerms' : 'Gaan na lys'
                : '✓ Ek het hierdie gelees'}
            </button>

            <div style={{ height: 32 }} />
          </div>
        </div>
      </div>
    )
  }

  if (view === 'closing') {
    return (
      <div className="dvv-overlay">
        <div className="dvv-screen" ref={bodyRef}>
          <button className="dvv-overlay-close" onClick={onClose}>✕</button>
          <div className="dvv-closing">
            <div className="dvv-closing-icon">⚡</div>
            <h1 className="dvv-closing-title">Jy het die oorlog begin wen!</h1>
            <p className="dvv-closing-body">
              Jy het deur al 58 hoofstukke en dae van denkvernuwing gestap. Die stryd in jou gedagtes is werklik — maar so ook jou oorwinning in Christus.
            </p>
            <p className="dvv-closing-body">
              "Ons is meer as oorwinnaars deur Hom wat ons liefgehad het." — Romeine 8:37
            </p>
            <button className="dvv-secondary-btn" onClick={() => setView('list')}>
              Gaan terug na lys
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
