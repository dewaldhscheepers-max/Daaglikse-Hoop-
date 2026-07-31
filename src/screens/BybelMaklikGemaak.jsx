import { useState, useEffect, useRef } from 'react'
import './DaeVanVrede.css'
import './BybelMaklikGemaak.css'
import { sharePlan } from '../shareUtil'

let cachedDae = null

export default function BybelMaklikGemaak({ onClose }) {
  const [view, setView]         = useState('list')
  const [currentDay, setCurrentDay] = useState(null)
  const [dae, setDae]           = useState(cachedDae || [])
  const [loading, setLoading]   = useState(!cachedDae)
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bmg_completed') || '[]') } catch { return [] }
  })
  const [lastDay, setLastDay]   = useState(() => {
    const v = parseInt(localStorage.getItem('bmg_lastDay') || '0')
    return v || null
  })
  const [answers, setAnswers]   = useState({}) // { qNr: 'A'|'B'|'C'|'D' }
  const bodyRef = useRef(null)

  useEffect(() => {
    if (cachedDae) return
    fetch('/bybel-maklik-gemaak.json')
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
    localStorage.setItem('bmg_completed', JSON.stringify(next))
  }

  function handleShare() {
    sharePlan('Die Bybel Maklik Gemaak', `📖 Die Bybel Maklik Gemaak — 67 dae\n\nLees dit gratis op Daaglikse Hoop:`)
  }

  function openDay(dagNr) {
    const dag = dae.find(d => d.dag === dagNr)
    if (!dag) return
    if (!lastDay && !localStorage.getItem('rp_counted_bmg')) {
      localStorage.setItem('rp_counted_bmg', '1')
      fetch('/api/kinder-boek-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: 'bybel-maklik-gemaak' }),
      }).catch(() => {})
    }
    setAnswers({})
    setCurrentDay(dag)
    setLastDay(dagNr)
    localStorage.setItem('bmg_lastDay', String(dagNr))
    setView('day')
  }

  function finishDay() {
    markCompleted(currentDay.dag)
    if (currentDay.dag === 67) setView('closing')
    else setView('list')
  }

  function handleAnswer(qNr, letter) {
    setAnswers(prev => ({ ...prev, [qNr]: letter }))
  }

  const TOTAL = 67

  // ── List ──
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
            <span className="dvv-header-title">Die Bybel Maklik Gemaak</span>
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
              <div className="bmg-intro-sub">67 dae · een boek per dag</div>
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
                        <span className="dvv-dag-ref" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{dag.bybellees}</span>
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

  // ── Day ──
  if (view === 'day' && currentDay) {
    const d    = currentDay
    const done = completed.includes(d.dag)
    const answeredAll = d.vrae.length > 0 && d.vrae.every(q => answers[q.nr])

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
              <div className="bmg-lees-badge">📖 Lees: {d.bybellees}</div>
            </div>

            <section className="dvv-section">
              <div className="dvv-section-body">
                {d.inhoud.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
              </div>
            </section>

            {d.vrae.length > 0 && (
              <section className="dvv-section bmg-toets">
                <h3 className="dvv-section-title">Toets jouself</h3>
                <div className="bmg-vrae">
                  {d.vrae.map(q => {
                    const chosen = answers[q.nr]
                    return (
                      <div key={q.nr} className="bmg-vraag">
                        <p className="bmg-vraag-text">{q.nr}. {q.vraag}</p>
                        <div className="bmg-opsies">
                          {['A', 'B', 'C', 'D'].map(letter => {
                            const isChosen  = chosen === letter
                            const isCorrect = q.antwoord === letter
                            let cls = 'bmg-opsie'
                            if (chosen) {
                              if (isChosen && isCorrect) cls += ' bmg-opsie-correct'
                              else if (isChosen && !isCorrect) cls += ' bmg-opsie-wrong'
                              else if (isCorrect) cls += ' bmg-opsie-reveal'
                            }
                            return (
                              <button
                                key={letter}
                                className={cls}
                                onClick={() => !chosen && handleAnswer(q.nr, letter)}
                                disabled={!!chosen}
                              >
                                <span className="bmg-letter">{letter}</span>
                                <span>{q.opsies[letter]}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {d.dinkHieroor && (
              <section className="dvv-section dvv-joernaal">
                <h3 className="dvv-section-title">Dink hieroor</h3>
                <div className="dvv-section-body">
                  <p className="dvv-joernaal-q">✏ {d.dinkHieroor}</p>
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

  // ── Closing ──
  if (view === 'closing') {
    return (
      <div className="dvv-overlay">
        <div className="dvv-screen" ref={bodyRef}>
          <button className="dvv-overlay-close" onClick={onClose}>✕</button>
          <div className="dvv-closing">
            <div className="dvv-closing-icon">📖</div>
            <h1 className="dvv-closing-title">Jy het die hele Bybel deurgewerk</h1>
            <p className="dvv-closing-body">
              67 dae. 66 boeke. Een groot storie van begin tot einde — en jy het dit verstaan.
            </p>
            <p className="dvv-closing-body">
              Die Bybel is nie 'n versameling los reëls nie. Dit is een verhaal van 'n God wat sy skepping liefhet, sy volk terugsoek, en in Jesus alles nuut maak.
            </p>
            <p className="dvv-closing-body">
              Hou aan om daarin te lees. Hou aan om daarin te leef.
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
