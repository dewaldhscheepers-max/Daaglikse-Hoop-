import { useState, useEffect, useRef } from 'react'
import './BidNou.css'
import DonationCard from '../components/DonationCard'

const CATEGORIES = [
  {
    id: 'emosies',
    label: 'Gedagtes & emosies',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <line x1="9" y1="18" x2="15" y2="18"/>
        <line x1="10" y1="22" x2="14" y2="22"/>
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
      </svg>
    )
  },
  {
    id: 'seer',
    label: 'Seer & verlies',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    )
  },
  {
    id: 'familie',
    label: 'Familie',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )
  },
  {
    id: 'werk',
    label: 'Werk & geld',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    )
  },
  {
    id: 'gesondheid',
    label: 'Gesondheid',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    )
  },
  {
    id: 'geloof',
    label: 'Geloof & gees',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="22"/>
        <line x1="5" y1="8" x2="19" y2="8"/>
      </svg>
    )
  },
  {
    id: 'alledaags',
    label: 'Alledaags',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    )
  },
]

let cachedGebede = null

export default function BidNou() {
  const [gebede, setGebede]             = useState(cachedGebede || [])
  const [loading, setLoading]           = useState(!cachedGebede)
  const [category, setCategory]         = useState(null)
  const [selectedGebed, setSelected]    = useState(null)
  const [showPrayedModal, setShowModal] = useState(false)
  const [search, setSearch]             = useState('')

  useEffect(() => {
    const screen = document.querySelector('.screen')
    if (screen) screen.scrollTop = 0
  }, [category, selectedGebed])

  useEffect(() => {
    if (cachedGebede) return
    fetch('/gebede.json')
      .then(r => r.json())
      .then(data => { cachedGebede = data; setGebede(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleShare() {
    const msg = 'Daaglikse Hoop – elke oggend \'n kort boodskap van hoop, gebed en bemoediging.\n\nhttps://dewaldscheepers.com/go'
    if (navigator.share) {
      try { await navigator.share({ title: 'Daaglikse Hoop', text: msg, url: 'https://dewaldscheepers.com/go' }) } catch {}
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
    }
  }

  function goToBidSaam() {
    setShowModal(false)
    window.dispatchEvent(new CustomEvent('bidnou-navigate', { detail: 'bidsaam' }))
  }

  function stripTitle(g) {
    return g.text.startsWith(g.title)
      ? g.text.slice(g.title.length).trimStart()
      : g.text
  }

  // ── Post-prayer modal ──
  const PrayedModal = showPrayedModal ? (
    <div className="bidnou-modal-backdrop" onClick={() => setShowModal(false)}>
      <div className="bidnou-modal" onClick={e => e.stopPropagation()}>
        <p className="bidnou-modal-eyebrow">Hoop vir nou</p>
        <h3 className="bidnou-modal-title">God het jou gehoor</h3>
        <div className="bidnou-modal-body">
          <p>Jy het nie net woorde gelees nie. Jy het met jou Vader gepraat.</p>
          <p>Moenie dieselfde las dadelik weer optel nie. Gee vandag net die volgende tree.</p>
          <p className="bidnou-modal-highlight">Haal asem. Drink water. Sê stadig: <em>"Here, help my deur vandag."</em></p>
          <p>Jy het vandag jou las by God neergesit.</p>
        </div>
        <button className="bidnou-modal-cta" onClick={goToBidSaam}>
          Wil jy hê ons moet saam met jou bid?
        </button>
        <button className="bidnou-modal-dismiss" onClick={() => setShowModal(false)}>
          Maak toe
        </button>
      </div>
    </div>
  ) : null

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
          <p className="bidnou-read-tip">Lees stadig. Moenie jaag nie. Hierdie is jou oomblik saam met God.</p>

          <div className="bidnou-prayer-card">
            <h2 className="bidnou-prayer-title">{selectedGebed.title}</h2>
            <div className="bidnou-prayer-text">
              {stripTitle(selectedGebed).split('\n').map((line, i) => (
                line.trim()
                  ? <p key={i} className={line.startsWith('In Jesus') || line === 'Amen.' ? 'bidnou-prayer-amen' : ''}>{line}</p>
                  : null
              ))}
            </div>
          </div>

          <div className="bidnou-actions">
            <button className="bidnou-prayed-btn" onClick={() => setShowModal(true)}>
              🙏 Ek het hierdie gebed gebid
            </button>
            <button className="bidnou-share-btn" onClick={handleShare}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Deel die app
            </button>
          </div>
        </div>

        {PrayedModal}
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
          <h2 className="bidnou-cat-heading">{cat.label}</h2>
        </div>

        <div className="bidnou-list">
          {filtered.map(g => (
            <button key={g.id} className="bidnou-list-item" onClick={() => setSelected(g)}>
              <span className="bidnou-list-title">{g.title}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15" style={{flexShrink:0,color:'var(--text-muted)'}}>
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

  const dailyPreview = daily ? stripTitle(daily).slice(0, 110).trim() : ''

  return (
    <div className="bidnou-screen">
      <div className="bidnou-header-main">
        <h1 className="bidnou-heading">Bid Nou</h1>
        <div className="bidnou-info-card">
          <p className="bidnou-info-sub">Wanneer jy nie weet wat om te bid nie, begin hier.</p>
          <p className="bidnou-info-desc">Kies hoe jy vandag voel, tik op die onderwerp, en bid die gebed dadelik saam.</p>
        </div>
        <div className="bidnou-breath-card">
          <span className="bidnou-breath-dot">🌬</span>
          <p className="bidnou-breath-text">
            Haal eers asem. Jy is nie hier per toeval nie — kies net hoe jy voel en bring dit voor God.
          </p>
        </div>
      </div>

      <div className="bidnou-body">
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
          <>
            {searchResults.length === 0
              ? <p className="bidnou-empty">Geen gebede gevind vir "{search}"</p>
              : searchResults.map(g => (
                <button key={g.id} className="bidnou-list-item bidnou-list-item-inline" onClick={() => setSelected(g)}>
                  <span className="bidnou-list-title">{g.title}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15" style={{flexShrink:0,color:'var(--text-muted)'}}>
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              ))
            }
          </>
        ) : (
          <>
            <section>
              <h2 className="bidnou-section-label">Kies jou gebed</h2>
              <div className="bidnou-cat-grid">
                {CATEGORIES.map((cat, idx) => (
                  <button
                    key={cat.id}
                    className={`bidnou-cat-btn${idx === CATEGORIES.length - 1 && CATEGORIES.length % 2 !== 0 ? ' bidnou-cat-btn-wide' : ''}`}
                    onClick={() => setCategory(cat.id)}
                  >
                    <span className="bidnou-cat-icon">{cat.icon}</span>
                    <span className="bidnou-cat-label">{cat.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {daily && (
              <section>
                <h2 className="bidnou-section-label">Gebed van die dag</h2>
                <button className="bidnou-daily-card" onClick={() => setSelected(daily)}>
                  <p className="bidnou-daily-title">{daily.title}</p>
                  <p className="bidnou-daily-preview">{dailyPreview}…</p>
                  <span className="bidnou-daily-cta">Lees gebed →</span>
                </button>
              </section>
            )}

            {loading && <p className="bidnou-empty">Laai gebede…</p>}
          </>
        )}
        <DonationCard />
      </div>
    </div>
  )
}
