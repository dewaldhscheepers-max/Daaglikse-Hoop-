import { useState, useEffect, useRef } from 'react'
import './DaeVanVrede.css'

let cachedDae = null

export default function LeuensDuiwel({ onClose }) {
  const [view, setView]         = useState('opening')
  const [currentDay, setCurrentDay] = useState(null)
  const [dae, setDae]           = useState(cachedDae || [])
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ld_completed') || '[]') } catch { return [] }
  })
  const [lastDay, setLastDay]   = useState(() => {
    const v = parseInt(localStorage.getItem('ld_lastDay') || '0')
    return v || null
  })
  const bodyRef = useRef(null)

  useEffect(() => {
    if (cachedDae) return
    fetch('/7-leuens.json')
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
    localStorage.setItem('ld_completed', JSON.stringify(next))
  }

  function openDay(dagNr) {
    const dag = dae.find(d => d.dag === dagNr)
    if (!dag) return
    setCurrentDay(dag)
    setLastDay(dagNr)
    localStorage.setItem('ld_lastDay', String(dagNr))
    setView('day')
  }

  function finishDay() {
    markCompleted(currentDay.dag)
    if (currentDay.dag === 7) setView('closing')
    else setView('list')
  }

  // ── Opening screen ──
  if (view === 'opening') {
    const allDone = completed.length >= 7
    return (
      <div className="dvv-overlay">
        <div className="dvv-screen" ref={bodyRef}>
          <button className="dvv-overlay-close" onClick={onClose}>✕</button>
          <div className="dvv-opening">
            <div className="dvv-opening-badge">Gratis · 7 dae · geen slotjies</div>
            <h1 className="dvv-opening-title">7 Leuens van die Duiwel</h1>
            <p className="dvv-opening-sub">& 7 Waarhede van God</p>
            <p className="dvv-opening-desc">
              Jy veg 'n oorlog in jou gedagtes. Die duiwel se wapen is leuens — maar God se Woord is sterker. Stap deur 7 dae en leer om die vyand se stem te herken en die Here se waarheid te kies.
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
                <div className="dvv-progress-fill" style={{ width: `${(completed.length / 7) * 100}%` }} />
              </div>
              <span className="dvv-progress-label">{completed.length} van 7 dae voltooi</span>
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
            <span className="dvv-header-title">7 Leuens van die Duiwel</span>
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
                      <span className="dvv-dag-title">Dag {dag.dag}: {dag.titel}</span>
                      <span className="dvv-dag-ref">❌ "{dag.leuen}"</span>
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
            <span className="dvv-header-title">Dag {d.dag} van 7</span>
            <button className="dvv-header-close" onClick={onClose}>✕</button>
          </div>

          <div className="dvv-day-body" ref={bodyRef}>

            <div className="dvv-day-sleutel" style={{ background: '#FFF0F0', color: '#c0392b', borderRadius: 10, padding: '10px 14px', marginBottom: 8 }}>
              ❌ Leuen: "{d.leuen}"
            </div>

            <div className="dvv-verse-card" style={{ background: '#F0FFF4', borderLeft: '4px solid #27713f' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#27713f', marginBottom: 6, letterSpacing: '0.05em' }}>✅ WAARHEID VAN GOD</p>
              <p className="dvv-verse-text">"{d.vers}"</p>
              <p className="dvv-verse-ref">— {d.versRef}</p>
            </div>

            <section className="dvv-section">
              <h3 className="dvv-section-title">{d.titel}</h3>
              <div className="dvv-section-body">
                {d.waarheid.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
              </div>
            </section>

            <section className="dvv-section dvv-opdrag">
              <h3 className="dvv-section-title">Vandag se uitdaging</h3>
              <div className="dvv-section-body">
                <p>{d.opdrag}</p>
              </div>
            </section>

            <section className="dvv-section dvv-gebed">
              <h3 className="dvv-section-title">Vandag se gebed</h3>
              <div className="dvv-section-body dvv-gebed-text">
                <p>{d.gebed}</p>
              </div>
            </section>

            <section className="dvv-section dvv-joernaal">
              <h3 className="dvv-section-title">Joernaalvraag</h3>
              <div className="dvv-section-body">
                {d.joernaal.map((q, i) => (
                  <p key={i} className="dvv-joernaal-q">✏ {q}</p>
                ))}
              </div>
            </section>

            <button className="dvv-primary-btn dvv-done-btn" onClick={finishDay}>
              {done
                ? d.dag === 7 ? 'Sien slotkerm' : 'Gaan na daglys'
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
            <div className="dvv-closing-icon">⚔️</div>
            <h1 className="dvv-closing-title">Die duiwel is 'n leuenaar</h1>
            <p className="dvv-closing-body">
              Hy het probeer om jou vas te vang in skaamte, in stilte, in jou verlede, in jou pyn, in die gedagte dat niks ooit sal verander nie.
            </p>
            <p className="dvv-closing-body">Maar God se waarheid is sterker. Onthou dit:</p>
            <div className="dvv-closing-truths">
              <p>Jy is nie 'n fout nie. <strong>Jy behoort aan God.</strong></p>
              <p>Jy is nie vergete nie. <strong>Hy is by jou.</strong></p>
              <p>Jy is nie jou verlede nie. <strong>Jy is nuut in Christus.</strong></p>
              <p>Jy is nie te stukkend nie. <strong>God kan herstel.</strong></p>
              <p>Jy is nie alleen nie. <strong>Hy bly by jou.</strong></p>
              <p>Jy is nie vas nie. <strong>Verandering is moontlik.</strong></p>
              <p>Jy is nie klaar nie. <strong>Jou storie leef nog.</strong></p>
            </div>
            <p className="dvv-closing-body">
              Hou aan om God se waarheid oor jou lewe te spreek. Nie net wanneer jy dit voel nie. Ook wanneer jy dit moet glo terwyl jou gedagtes nog baklei.
            </p>
            <p className="dvv-closing-body">
              Want waarheid breek kettings. En die waarheid van God sal harder praat as elke leuen.
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
