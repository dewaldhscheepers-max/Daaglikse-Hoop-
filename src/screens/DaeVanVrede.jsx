import { useState, useEffect, useRef } from 'react'
import './DaeVanVrede.css'

const SLEUTELS = [
  { label: 'Sleutel 1: Praat met Iemand',            dae: [1, 2] },
  { label: 'Sleutel 2: Bewaak Jou Hart',             dae: [3, 4] },
  { label: 'Sleutel 3: Stort Jou Hart Uit Voor God', dae: [5, 6] },
  { label: 'Sleutel 4: Vang die Gedagte',            dae: [7, 8] },
  { label: 'Sleutel 5: Spreek Waarheid Hardop',      dae: [9, 10] },
  { label: 'Sleutel 6: Bid en Dank',                 dae: [11] },
]

let cachedDae = null

export default function DaeVanVrede({ onClose, onBuyBook }) {
  const [view, setView]           = useState('opening')
  const [currentDay, setCurrentDay] = useState(null)
  const [dae, setDae]             = useState(cachedDae || [])
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dvv_completed') || '[]') } catch { return [] }
  })
  const [lastDay, setLastDay]     = useState(() => {
    const v = parseInt(localStorage.getItem('dvv_lastDay') || '0')
    return v || null
  })
  const bodyRef = useRef(null)

  useEffect(() => {
    if (cachedDae) return
    fetch('/11-dae.json')
      .then(r => r.json())
      .then(data => { cachedDae = data; setDae(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }, [view, currentDay])

  function markCompleted(dagNr) {
    if (completed.includes(dagNr)) return
    const next = [...completed, dagNr]
    setCompleted(next)
    localStorage.setItem('dvv_completed', JSON.stringify(next))
  }

  function openDay(dagNr) {
    const dag = dae.find(d => d.dag === dagNr)
    if (!dag) return
    setCurrentDay(dag)
    setLastDay(dagNr)
    localStorage.setItem('dvv_lastDay', String(dagNr))
    setView('day')
  }

  function finishDay() {
    markCompleted(currentDay.dag)
    if (currentDay.dag === 11) {
      setView('closing')
    } else {
      setView('list')
    }
  }

  // ── Opening screen ──
  if (view === 'opening') {
    const allDone = completed.length >= 11
    return (
      <div className="dvv-overlay">
        <div className="dvv-screen" ref={bodyRef}>
          <button className="dvv-overlay-close" onClick={onClose}>✕</button>
          <div className="dvv-opening">
            <div className="dvv-opening-badge">Gratis · 11 dae · geen slotjies</div>
            <h1 className="dvv-opening-title">11 Dae van Vrede</h1>
            <p className="dvv-opening-sub">Een dag op 'n slag. Een sleutel op 'n slag.</p>
            <p className="dvv-opening-desc">
              Hierdie gratis reis kom uit <em>Rustelose Gedagtes</em>. Stap deur 11 dae van vrede, waarheid, gebed en praktiese opdragte. Begin enige tyd. Daar is geen slotjies nie.
            </p>
            {allDone ? (
              <>
                <button className="dvv-primary-btn" onClick={() => setView('closing')}>
                  Sien jou voltooiing
                </button>
                <button className="dvv-secondary-btn" onClick={() => setView('list')}>
                  Sien alle dae
                </button>
              </>
            ) : lastDay ? (
              <>
                <button className="dvv-primary-btn" onClick={() => openDay(lastDay)}>
                  Gaan voort by Dag {lastDay}
                </button>
                <button className="dvv-secondary-btn" onClick={() => setView('list')}>
                  Sien alle dae
                </button>
              </>
            ) : (
              <button className="dvv-primary-btn" onClick={() => openDay(1)}>
                Begin by Dag 1
              </button>
            )}
            <div className="dvv-opening-progress">
              <div className="dvv-progress-bar">
                <div className="dvv-progress-fill" style={{ width: `${(completed.length / 11) * 100}%` }} />
              </div>
              <span className="dvv-progress-label">{completed.length} van 11 dae voltooi</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── List screen ──
  if (view === 'list') {
    return (
      <div className="dvv-overlay">
        <div className="dvv-screen">
          <div className="dvv-header">
            <button className="dvv-back" onClick={() => setView('opening')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Terug
            </button>
            <span className="dvv-header-title">11 Dae van Vrede</span>
            <button className="dvv-header-close" onClick={onClose}>✕</button>
          </div>

          <div className="dvv-list-body" ref={bodyRef}>
            {lastDay && !completed.includes(lastDay) && (
              <button className="dvv-continue-card" onClick={() => openDay(lastDay)}>
                Gaan voort by Dag {lastDay} →
              </button>
            )}

            {SLEUTELS.map(sleutel => (
              <div key={sleutel.label} className="dvv-sleutel-group">
                <div className="dvv-sleutel-label">{sleutel.label}</div>
                {sleutel.dae.map(dagNr => {
                  const dag  = dae.find(d => d.dag === dagNr)
                  const done = completed.includes(dagNr)
                  return (
                    <button key={dagNr} className={`dvv-dag-row${done ? ' dvv-dag-done' : ''}`} onClick={() => openDay(dagNr)}>
                      <div className={`dvv-dag-num${done ? ' dvv-dag-num-done' : ''}`}>
                        {done ? '✓' : dagNr}
                      </div>
                      <div className="dvv-dag-info">
                        <span className="dvv-dag-title">Dag {dagNr}</span>
                        {dag && <span className="dvv-dag-ref">{dag.versRef}</span>}
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15" style={{ flexShrink: 0, color: 'var(--text-muted)' }}>
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  )
                })}
              </div>
            ))}

            <div style={{ height: 32 }} />
          </div>
        </div>
      </div>
    )
  }

  // ── Day screen ──
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
            <span className="dvv-header-title">Dag {d.dag} van 11</span>
            <button className="dvv-header-close" onClick={onClose}>✕</button>
          </div>

          <div className="dvv-day-body" ref={bodyRef}>
            <div className="dvv-day-sleutel">{d.sleutel}</div>

            <div className="dvv-verse-card">
              <p className="dvv-verse-text">"{d.vers}"</p>
              <p className="dvv-verse-ref">— {d.versRef}</p>
            </div>

            <section className="dvv-section">
              <h3 className="dvv-section-title">Vandag se waarheid</h3>
              <div className="dvv-section-body">
                {d.waarheid.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
              </div>
            </section>

            <section className="dvv-section dvv-opdrag">
              <h3 className="dvv-section-title">Vandag se opdrag</h3>
              <div className="dvv-section-body">
                {d.opdrag.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
              </div>
            </section>

            <section className="dvv-section dvv-gebed">
              <h3 className="dvv-section-title">Vandag se gebed</h3>
              <div className="dvv-section-body dvv-gebed-text">
                <p>{d.gebed}</p>
              </div>
            </section>

            <section className="dvv-section dvv-joernaal">
              <h3 className="dvv-section-title">
                {d.joernaal.length > 1 ? 'Joernaalvrae' : 'Joernaalvraag'}
              </h3>
              <div className="dvv-section-body">
                {d.joernaal.map((q, i) => (
                  <p key={i} className="dvv-joernaal-q">✏ {q}</p>
                ))}
              </div>
            </section>

            <button className="dvv-primary-btn dvv-done-btn" onClick={finishDay}>
              {done
                ? d.dag === 11 ? 'Sien slotkerm' : 'Gaan na daglys'
                : '✓ Ek het hierdie dag voltooi'}
            </button>

            <button className="dvv-koop-btn" onClick={onBuyBook}>
              Kry die volle 21 dae hier →
            </button>

            <div style={{ height: 32 }} />
          </div>
        </div>
      </div>
    )
  }

  // ── Closing screen ──
  if (view === 'closing') {
    return (
      <div className="dvv-overlay">
        <div className="dvv-screen" ref={bodyRef}>
          <button className="dvv-overlay-close" onClick={onClose}>✕</button>
          <div className="dvv-closing">
            <div className="dvv-closing-icon">🕊️</div>
            <h1 className="dvv-closing-title">Jy het die 11 dae voltooi</h1>
            <p className="dvv-closing-body">
              Jy het deur 6 sleutels gestap: praat met iemand, bewaak jou hart, stort jou hart uit voor God, vang die gedagte, spreek waarheid hardop, en bid met danksegging.
            </p>
            <p className="dvv-closing-body">
              Hierdie was net die gratis begin. Die volle 21-dae pad wag in <em>Rustelose Gedagtes</em>, met die res van die sleutels, dieper lering, gebede en praktiese stappe.
            </p>
            <button className="dvv-primary-btn" onClick={onBuyBook}>
              Kry Rustelose Gedagtes
            </button>
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
