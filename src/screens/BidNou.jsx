import { useState, useEffect, useRef } from 'react'
import './BidNou.css'

const CATEGORIES = [
  { id: 'emosies',    label: 'Hoe ek voel',     emoji: '😔' },
  { id: 'seer',       label: 'Seer & Verlies',   emoji: '💔' },
  { id: 'familie',    label: 'Familie',           emoji: '🏠' },
  { id: 'werk',       label: 'Werk & Geld',       emoji: '💼' },
  { id: 'gesondheid', label: 'Gesondheid',        emoji: '🌿' },
  { id: 'geloof',     label: 'Geloof & Gees',     emoji: '🙏' },
  { id: 'alledaags',  label: 'Alledaags',         emoji: '✨' },
]

let cachedGebede = null

export default function BidNou() {
  const [gebede, setGebede]           = useState(cachedGebede || [])
  const [loading, setLoading]         = useState(!cachedGebede)
  const [category, setCategory]       = useState(null)
  const [selectedGebed, setSelected]  = useState(null)
  const [prayedToast, setPrayedToast] = useState(false)
  const [search, setSearch]           = useState('')
  const toastTimer = useRef(null)

  useEffect(() => {
    if (cachedGebede) return
    fetch('/gebede.json')
      .then(r => r.json())
      .then(data => {
        cachedGebede = data
        setGebede(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function handlePrayed() {
    clearTimeout(toastTimer.current)
    setPrayedToast(true)
    toastTimer.current = setTimeout(() => setPrayedToast(false), 2500)
  }

  async function handleShare() {
    const msg = 'Daaglikse Hoop – elke oggend \'n kort boodskap van hoop, gebed en bemoediging.\n\nhttps://dewaldscheepers.com/go'
    if (navigator.share) {
      try { await navigator.share({ title: 'Daaglikse Hoop', text: msg, url: 'https://dewaldscheepers.com/go' }) } catch {}
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
    }
  }

  // ── Prayer detail view ──
  if (selectedGebed) {
    return (
      <div className="bidnou-screen">
        <div className="bidnou-header">
          <button className="bidnou-back" onClick={() => setSelected(null)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Terug
          </button>
        </div>

        <div className="bidnou-prayer-body">
          <div className="bidnou-prayer-card">
            <h2 className="bidnou-prayer-title">{selectedGebed.title}</h2>
            <div className="bidnou-prayer-text">
              {selectedGebed.text.split('\n').map((line, i) => (
                line.trim()
                  ? <p key={i} className={line.startsWith('In Jesus') || line === 'Amen.' ? 'bidnou-prayer-amen' : ''}>{line}</p>
                  : null
              ))}
            </div>
          </div>

          <div className="bidnou-actions">
            <button className="bidnou-prayed-btn" onClick={handlePrayed}>
              🙏 Ek het hierdie gebed gebid
            </button>
            <button className="bidnou-share-btn" onClick={handleShare}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Deel die app
            </button>
            <button className="bidnou-bidsaam-btn" onClick={() => {
              window.__bidNouNavTarget = 'bidsaam'
              window.dispatchEvent(new CustomEvent('bidnou-navigate', { detail: 'bidsaam' }))
            }}>
              ✍️ Plaas 'n gebedsversoek
            </button>
          </div>
        </div>

        {prayedToast && (
          <div className="bidnou-toast">
            🙏 Goed gedaan. God hoor jou gebed.
          </div>
        )}
      </div>
    )
  }

  // ── Category prayer list ──
  if (category) {
    const cat = CATEGORIES.find(c => c.id === category)
    const filtered = gebede.filter(g => g.category === category)
    return (
      <div className="bidnou-screen">
        <div className="bidnou-header">
          <button className="bidnou-back" onClick={() => setCategory(null)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Terug
          </button>
          <h2 className="bidnou-cat-heading">{cat.emoji} {cat.label}</h2>
        </div>

        <div className="bidnou-list">
          {filtered.map(g => (
            <button key={g.id} className="bidnou-list-item" onClick={() => setSelected(g)}>
              <span className="bidnou-list-title">{g.title}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Main view ──
  const searchTrimmed = search.trim().toLowerCase()
  const searchResults = searchTrimmed.length >= 2
    ? gebede.filter(g => g.title.toLowerCase().includes(searchTrimmed))
    : []

  const daily = gebede.length > 0
    ? gebede[new Date().getDate() % gebede.length]
    : null

  return (
    <div className="bidnou-screen">
      <div className="bidnou-header bidnou-header-main">
        <h1 className="bidnou-heading">Bid Nou</h1>
        <p className="bidnou-sub">Wanneer jy nie weet wat om te bid nie, begin hier.</p>
        <p className="bidnou-desc">Kies hoe jy vandag voel, tik op die onderwerp, en bid die gebed dadelik saam.</p>
      </div>

      <div className="bidnou-body">
        {/* Search */}
        <div className="bidnou-search-wrap">
          <svg className="bidnou-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="bidnou-search"
            type="search"
            placeholder="Soek bv. angs, slaap, kind, geld…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {searchTrimmed.length >= 2 ? (
          <div className="bidnou-list">
            {searchResults.length === 0
              ? <p className="bidnou-empty">Geen gebede gevind vir "{search}"</p>
              : searchResults.map(g => (
                <button key={g.id} className="bidnou-list-item" onClick={() => setSelected(g)}>
                  <span className="bidnou-list-title">{g.title}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              ))
            }
          </div>
        ) : (
          <>
            {/* Categories */}
            <section>
              <h2 className="bidnou-section-label">Kies jou gebed</h2>
              <div className="bidnou-cat-grid">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} className="bidnou-cat-btn" onClick={() => setCategory(cat.id)}>
                    <span className="bidnou-cat-emoji">{cat.emoji}</span>
                    <span className="bidnou-cat-label">{cat.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Gebed van die dag */}
            {daily && (
              <section>
                <h2 className="bidnou-section-label">Gebed van die dag</h2>
                <button className="bidnou-daily-card" onClick={() => setSelected(daily)}>
                  <div className="bidnou-daily-top">
                    <span className="bidnou-daily-badge">Gebed van die dag</span>
                  </div>
                  <p className="bidnou-daily-title">{daily.title}</p>
                  <p className="bidnou-daily-preview">
                    {daily.text.slice(0, 120).trim()}…
                  </p>
                  <span className="bidnou-daily-cta">Lees gebed →</span>
                </button>
              </section>
            )}

            {loading && <p className="bidnou-empty">Laai gebede…</p>}
          </>
        )}
      </div>
    </div>
  )
}
