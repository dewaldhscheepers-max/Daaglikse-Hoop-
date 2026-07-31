import { useState, useEffect, useRef } from 'react'
import './DaeVanVrede.css'
import { sharePlan } from '../shareUtil'

let cachedDae = null

const TOTAL = 7

export default function AngsDetox({ onClose }) {
  const [view, setView]             = useState('list')
  const [currentDay, setCurrentDay] = useState(null)
  const [dae, setDae]               = useState(cachedDae || [])
  const [loading, setLoading]       = useState(!cachedDae)
  const [completed, setCompleted]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('angsd_completed') || '[]') } catch { return [] }
  })
  const [lastDay, setLastDay]       = useState(() => {
    const v = parseInt(localStorage.getItem('angsd_lastDay') || '0')
    return v || null
  })
  const bodyRef = useRef(null)

  useEffect(() => {
    if (cachedDae) return
    fetch('/angs-detox.json')
      .then(r => r.json())
      .then(data => { cachedDae = data; setDae(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }, [view, currentDay])

  function markCompleted(dagNr) {
    if (completed.includes(dagNr)) return
    const next = [...completed, dagNr]
    setCompleted(next)
    localStorage.setItem('angsd_completed', JSON.stringify(next))
  }

  function handleShare() {
    sharePlan('Angs Detox', `🌿 Angs Detox — 7 dae\n\nLees dit gratis op Daaglikse Hoop:`)
  }

  function openDay(dagNr) {
    const dag = dae.find(d => d.dag === dagNr)
    if (!dag) return
    if (!lastDay && !localStorage.getItem('rp_counted_angsd')) {
      localStorage.setItem('rp_counted_angsd', '1')
      fetch('/api/kinder-boek-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: 'angs-detox' }),
      }).catch(() => {})
    }
    setCurrentDay(dag)
    setLastDay(dagNr)
    localStorage.setItem('angsd_lastDay', String(dagNr))
    setView('day')
  }

  function finishDay() {
    markCompleted(currentDay.dag)
    if (currentDay.dag === TOTAL) setView('closing')
    else setView('list')
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
            <span className="dvv-header-title">Angs Detox</span>
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
              <div className="bmg-intro-sub">7 dae · Bevry jou gedagtes van angs</div>
              <div className="dvv-opening-progress">
                <div className="dvv-progress-bar">
                  <div className="dvv-progress-fill" style={{ width: `${(completed.length / TOTAL) * 100}%` }} />
                </div>
                <span className="dvv-progress-label">{completed.length} van {TOTAL} dae voltooi</span>
              </div>
            </div>

            {lastDay && !completed.includes(lastDay) && (
              <button className="dvv-continue-card" onClick={() => openDay(lastDay)}>
                Gaan voort by Dag {lastDay} →
              </button>
            )}

            {loading ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>Dae word gelaai...</div>
            ) : (
              <div className="dvv-sleutel-group">
                {dae.map(dag => {
                  const done = completed.includes(dag.dag)
                  return (
                    <button key={dag.dag} className={`dvv-dag-row${done ? ' dvv-dag-done' : ''}`} onClick={() => openDay(dag.dag)}>
                      <div className={`dvv-dag-num${done ? ' dvv-dag-num-done' : ''}`}>
                        {done ? '✓' : dag.dag}
                      </div>
                      <div className="dvv-dag-info">
                        <span className="dvv-dag-title">Dag {dag.dag}: {dag.titel}</span>
                        <span className="dvv-dag-ref" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{dag.vers}</span>
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

  if (view === 'day' && currentDay) {
    const d    = currentDay
    const done = completed.includes(d.dag)

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
            <span className="dvv-header-title">Dag {d.dag} van {TOTAL}</span>
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
              <h2 className="bmg-day-title">{d.titel}</h2>
              <div className="bmg-lees-badge">📖 {d.vers}</div>
            </div>

            <section className="dvv-section">
              <div className="dvv-section-body">
                {d.inhoud.split('\n\n').map((para, i) => {
                  const words = para.replace(/[^\w\s]/g, '').trim().split(/\s+/).filter(Boolean)
                  const isHeading = words.length > 1 && words.length < 12 &&
                    words.every(w => w === w.toUpperCase()) && para.trim().length < 100
                  return isHeading
                    ? <p key={i} style={{ fontWeight: 700, color: 'var(--text)', marginTop: 8 }}>{para}</p>
                    : <p key={i}>{para}</p>
                })}
              </div>
            </section>

            {d.dinkHieroor && (
              <section className="dvv-section dvv-joernaal">
                <h3 className="dvv-section-title">Vandag se praktyk</h3>
                <div className="dvv-section-body">
                  {d.dinkHieroor.split('\n\n').map((para, i) => (
                    <p key={i} className={i === 0 ? 'dvv-joernaal-q' : ''}>{i === 0 ? '✏ ' : ''}{para}</p>
                  ))}
                </div>
              </section>
            )}

            {d.gebed && (
              <section className="dvv-section">
                <h3 className="dvv-section-title">Stil gebed</h3>
                <div className="dvv-section-body" style={{ fontStyle: 'italic' }}>
                  {d.gebed.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </section>
            )}

            <button className="dvv-primary-btn dvv-done-btn" onClick={finishDay}>
              {done
                ? d.dag === TOTAL ? 'Sien slotskerms' : 'Gaan na daglys'
                : '✓ Ek het hierdie dag voltooi'}
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
            <div className="dvv-closing-icon">🌿</div>
            <h1 className="dvv-closing-title">Jy het sewe dae lank anders begin dink</h1>
            <p className="dvv-closing-body">
              Vernuwing van jou denke is nie 'n eenmalige gebeurtenis nie. Dit is 'n daaglikse praktyk — en jy het begin.
            </p>
            <p className="dvv-closing-body">
              Jou gebrokenheid diskwalifiseer jou nie. Dit is juis die plek waar God se genade begin skyn.
            </p>
            <p className="dvv-closing-body">
              "My genade is vir jou genoeg, want my krag kom juis tot volle werking wanneer jy swak is." — 2 Korintiërs 12:9
            </p>
            <button className="dvv-secondary-btn" onClick={() => setView('list')}>
              Gaan terug na daglys
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
