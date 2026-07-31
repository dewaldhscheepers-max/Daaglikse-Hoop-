import { useState, useEffect, useRef } from 'react'
import './DaeVanVrede.css'
import { sharePlan } from '../shareUtil'

let cachedDae = null

export default function SeerNaVryheid({ onClose }) {
  const [view, setView]             = useState('list')
  const [currentDay, setCurrentDay] = useState(null)
  const [dae, setDae]               = useState(cachedDae || [])
  const [completed, setCompleted]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('snv_completed') || '[]') } catch { return [] }
  })
  const [lastDay, setLastDay]       = useState(() => {
    const v = parseInt(localStorage.getItem('snv_lastDay') || '0')
    return v || null
  })
  const [journalText, setJournalText] = useState('')
  const bodyRef = useRef(null)

  const totalDae = dae.length

  useEffect(() => {
    if (cachedDae) return
    fetch('/seer-na-vryheid.json')
      .then(r => r.json())
      .then(data => { cachedDae = data; setDae(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }, [view, currentDay])

  useEffect(() => {
    if (view === 'day' && currentDay) {
      const saved = localStorage.getItem(`snv_journal_${currentDay.dag}`) || ''
      setJournalText(saved)
    }
  }, [view, currentDay])

  function saveJournal(dagNr, text) {
    try { localStorage.setItem(`snv_journal_${dagNr}`, text) } catch {}
  }

  function markCompleted(dagNr) {
    if (completed.includes(dagNr)) return
    const next = [...completed, dagNr]
    setCompleted(next)
    localStorage.setItem('snv_completed', JSON.stringify(next))
  }

  function handleShare() {
    sharePlan('Wanneer Mense Jou Seermaak', `💙 Wanneer Mense Jou Seermaak — 14 dae\n\nLees dit gratis op Daaglikse Hoop:`)
  }

  function openDay(dagNr) {
    const dag = dae.find(d => d.dag === dagNr)
    if (!dag) return
    if (!lastDay && !localStorage.getItem('rp_counted_snv')) {
      localStorage.setItem('rp_counted_snv', '1')
      fetch('/api/kinder-boek-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: 'seer-na-vryheid' }),
      }).catch(() => {})
    }
    setCurrentDay(dag)
    setLastDay(dagNr)
    localStorage.setItem('snv_lastDay', String(dagNr))
    setView('day')
  }

  function finishDay() {
    if (journalText.trim()) saveJournal(currentDay.dag, journalText)
    markCompleted(currentDay.dag)
    if (currentDay.dag === totalDae) {
      setView('closing')
    } else {
      setView('list')
    }
  }

  // ── Opening screen ──
  if (view === 'opening') {
    const allDone = totalDae > 0 && completed.length >= totalDae
    return (
      <div className="dvv-overlay">
        <div className="dvv-screen" ref={bodyRef}>
          <button className="dvv-overlay-close" onClick={onClose}>✕</button>
          <div className="dvv-opening">
            <div className="dvv-opening-badge">Gratis · {totalDae} dae · geen slotjies</div>
            <h1 className="dvv-opening-title">Wanneer Mense Jou Seermaak</h1>
            <p className="dvv-opening-sub">Vergifnis · Genesing · Vryheid</p>
            <p className="dvv-opening-desc">
              Genees jou hart, herwin jou lewe en loop vry. 'n Dag-vir-dag reis deur vergifnis, heling en nuwe begin.
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
            {totalDae > 0 && (
              <div className="dvv-opening-progress">
                <div className="dvv-progress-bar">
                  <div className="dvv-progress-fill" style={{ width: `${(completed.length / totalDae) * 100}%` }} />
                </div>
                <span className="dvv-progress-label">{completed.length} van {totalDae} dae voltooi</span>
              </div>
            )}
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
            <button className="dvv-back" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Terug
            </button>
            <span className="dvv-header-title">Wanneer Mense Jou Seermaak</span>
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
            {lastDay && !completed.includes(lastDay) && (
              <button className="dvv-continue-card" onClick={() => openDay(lastDay)}>
                Gaan voort by Dag {lastDay} →
              </button>
            )}

            <div className="dvv-sleutel-group">
              {dae.map(dag => {
                const done = completed.includes(dag.dag)
                return (
                  <button key={dag.dag} className={`dvv-dag-row${done ? ' dvv-dag-done' : ''}`} onClick={() => openDay(dag.dag)}>
                    <div className={`dvv-dag-num${done ? ' dvv-dag-num-done' : ''}`}>
                      {done ? '✓' : dag.dag}
                    </div>
                    <div className="dvv-dag-info">
                      <span className="dvv-dag-title">Dag {dag.dag}</span>
                      {dag.titel && <span className="dvv-dag-ref">{dag.titel}</span>}
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15" style={{ flexShrink: 0, color: 'var(--text-muted)' }}>
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                )
              })}
            </div>

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
    const canFinish = done || journalText.trim().length > 0

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
            <span className="dvv-header-title">Dag {d.dag} van {totalDae}</span>
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
            {d.titel && <div className="dvv-day-sleutel">{d.titel}</div>}

            <div className="dvv-verse-card">
              <p className="dvv-verse-text">"{d.vers}"</p>
              {d.versRef && <p className="dvv-verse-ref">— {d.versRef}</p>}
            </div>

            {d.waarheid && (
              <section className="dvv-section">
                <h3 className="dvv-section-title">Vandag se waarheid</h3>
                <div className="dvv-section-body">
                  {d.waarheid.split('\n\n').map((para, i) => {
                    const trimmed = para.trim()
                    const isNumbered = /^\d+\./.test(trimmed)
                    const wordCount = trimmed.split(/\s+/).length
                    const hasPunctuation = /[.!?]["»]?$/.test(trimmed)
                    const isHeading = isNumbered || (wordCount <= 12 && !hasPunctuation)
                    return isHeading
                      ? <p key={i} style={{ fontWeight: 700, color: 'var(--text)', marginTop: 8 }}>{para}</p>
                      : <p key={i}>{para}</p>
                  })}
                </div>
              </section>
            )}

            {d.opdrag && (
              <section className="dvv-section dvv-opdrag">
                <h3 className="dvv-section-title">Vandag se opdrag</h3>
                <div className="dvv-section-body">
                  {d.opdrag.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
                </div>
              </section>
            )}

            {d.gebed && (
              <section className="dvv-section dvv-gebed">
                <h3 className="dvv-section-title">Vandag se gebed</h3>
                <div className="dvv-section-body dvv-gebed-text">
                  <p>{d.gebed}</p>
                </div>
              </section>
            )}

            {d.joernaal && d.joernaal.length > 0 && (
              <section className="dvv-section dvv-joernaal">
                <h3 className="dvv-section-title">
                  {d.joernaal.length > 1 ? 'Joernaalvrae' : 'Joernaalvraag'}
                </h3>
                <div className="dvv-section-body">
                  {d.joernaal.map((q, i) => (
                    <p key={i} className="dvv-joernaal-q">✏ {q}</p>
                  ))}
                </div>
                <textarea
                  className="dvv-journal-input"
                  placeholder="Skryf jou antwoord hier..."
                  value={journalText}
                  onChange={e => {
                    setJournalText(e.target.value)
                    saveJournal(d.dag, e.target.value)
                  }}
                  rows={4}
                />
              </section>
            )}

            <button
              className="dvv-primary-btn dvv-done-btn"
              onClick={finishDay}
              disabled={!canFinish}
              style={{ opacity: canFinish ? 1 : 0.45 }}
            >
              {done
                ? d.dag === totalDae ? 'Sien slotkerm' : 'Gaan na daglys'
                : '✓ Ek het hierdie dag voltooi'}
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
            <div className="dvv-closing-icon">💙</div>
            <h1 className="dvv-closing-title">Jy het dit voltooi!</h1>
            <p className="dvv-closing-body">
              Jy het deur al {totalDae} dae gestap. Dag-vir-dag het jy eerlik gekyk na die seer, die woede, die verlies — en jy het bly stap.
            </p>
            <p className="dvv-closing-body">
              Vergifnis is nie 'n dag se werk nie — dit is 'n reis. En jy het dit begin. Mag God jou hart heel maak en jou in vryheid laat leef.
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
