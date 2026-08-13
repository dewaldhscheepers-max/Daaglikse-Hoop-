/* ────────────────────────────────────────────────────────────
   WAT IS MYNE OM TE DRA? — vyf dae.

   Dewald se e-boek, woord vir woord, as 'n leesplan. Die teks staan in
   `public/wat-is-myne.json`; hierdie lêer is net die skerm.

   Dieselfde vorm as die ander leesplanne (AngsDetox, Toksies, ...) en
   dieselfde DaeVanVrede.css. Dit is opsetlik: 'n mens wat een leesplan
   geloop het, moet hierdie een sonder om te dink kan loop.

   Twee dinge verskil, en albei kom uit die boek self:
     · die afdeling heet "Om oor na te dink", nie "Vandag se praktyk" nie,
       en dit is DRIE vrae, elkeen op sy eie reel;
     · die slotskerm is sy Slotwoord.

   Die Bybelaanhalings kom net so uit die boek. Hulle is NIE hier nagegaan
   nie — sien CLAUDE.md: Bybelverse moet deur Dewald teen sy Bybel
   nagegaan word.
   ──────────────────────────────────────────────────────────── */

import { useState, useEffect, useRef } from 'react'
import './DaeVanVrede.css'
import { sharePlan } from '../shareUtil'

let cachedDae = null

const TOTAL = 5

export default function WatIsMyne({ onClose }) {
  const [view, setView]             = useState('list')
  const [currentDay, setCurrentDay] = useState(null)
  const [dae, setDae]               = useState(cachedDae || [])
  const [loading, setLoading]       = useState(!cachedDae)
  const [completed, setCompleted]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('wimotd_completed') || '[]') } catch { return [] }
  })
  const [lastDay, setLastDay]       = useState(() => {
    const v = parseInt(localStorage.getItem('wimotd_lastDay') || '0')
    return v || null
  })
  const bodyRef = useRef(null)

  useEffect(() => {
    if (cachedDae) return
    fetch('/wat-is-myne.json')
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
    localStorage.setItem('wimotd_completed', JSON.stringify(next))
  }

  function handleShare() {
    sharePlan('WAT IS MYNE OM TE DRA?', `🤲 WAT IS MYNE OM TE DRA? — 5 dae\n\nLees dit gratis op Daaglikse Hoop:`)
  }

  function openDay(dagNr) {
    const dag = dae.find(d => d.dag === dagNr)
    if (!dag) return
    if (!lastDay && !localStorage.getItem('rp_counted_wimotd')) {
      localStorage.setItem('rp_counted_wimotd', '1')
      fetch('/api/kinder-boek-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: 'wat-is-myne' }),
      }).catch(() => {})
    }
    setCurrentDay(dag)
    setLastDay(dagNr)
    localStorage.setItem('wimotd_lastDay', String(dagNr))
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
            <span className="dvv-header-title">Wat is myne om te dra?</span>
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
              <div className="bmg-intro-sub">5 dae · Wat is joune om te dra, en wat nie</div>
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
                <h3 className="dvv-section-title">Om oor na te dink</h3>
                {/* Elke reel is 'n VRAAG uit die boek, nie 'n paragraaf nie —
                    hulle kry elkeen 'n punt sodat 'n mens hulle een vir een
                    lees in plaas van as een blok. */}
                <div className="dvv-section-body">
                  {d.dinkHieroor.split('\n\n').map((vraag, i) => (
                    <p key={i} className="dvv-joernaal-q">• {vraag}</p>
                  ))}
                </div>
              </section>
            )}

            {d.gebed && (
              <section className="dvv-section">
                <h3 className="dvv-section-title">Gebed</h3>
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
            <div className="dvv-closing-icon">🤲</div>
            <h1 className="dvv-closing-title">Jy hoef nie alles te dra nie</h1>
            <p className="dvv-closing-body">
              As jy tot hier gelees het, is daar waarskynlik iets wat jy al lank dra. Ek weet
              nie wat dit is nie. Maar God weet.
            </p>
            <p className="dvv-closing-body">
              Jy is nie geroep om alles te dra nie. Jy is geroep om te dra wat God vir jou
              gegee het — en om die res in Sy hande te los.
            </p>
            <p className="dvv-closing-body">
              En as jy dit weer optel, gee dit weer terug. Sonder skuld. Dit is nie swak
              geloof nie. Dit ís geloof.
            </p>
            <button className="dvv-primary-btn" onClick={handleShare}>
              Stuur dit vir iemand wat dit nodig het
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
