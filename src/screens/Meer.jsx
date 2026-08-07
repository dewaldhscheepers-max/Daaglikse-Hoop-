import { useState, useEffect, useRef } from 'react'
import { BOOKS as STATIC_BOOKS } from '../data/books'
import { db } from '../firebase'
import { collection, onSnapshot, doc } from 'firebase/firestore'
import { CAMPAIGN } from '../data/campaign'
import DonationCard from '../components/DonationCard'
import FreeBookModal from '../components/FreeBookModal'
import './Meer.css'
import './HuiseVanHoop.css'
import KinderBibloteek from './KinderBibloteek'
import LeesplanneLys from './LeesplanneLys'
import { KINDER_BOEKE } from '../data/kinderBoeke'

const STATIC_IDS = new Set(STATIC_BOOKS.map(b => b.id))

function fmtNum(n) { return n.toLocaleString('af-ZA') }

/* ── Free book card ── */
function FreeBookCard({ book, claimed, onClaim, downloadCount }) {
  const pdfUrl = book.pdfUrl
  return (
    <div className="book-card">
      <div className="book-cover" style={{ background: book.coverUrl ? 'transparent' : book.color }}>
        {book.coverUrl
          ? <img src={book.coverUrl} className="book-cover-img" alt={book.title} />
          : <span className="book-emoji">{book.emoji || '📚'}</span>}
        <span className="book-badge free-badge">GRATIS</span>
      </div>
      <div className="book-info">
        {book.badge && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span className="book-new-badge">{book.badge}</span>
            {downloadCount > 0 && (
              <span className="book-download-count">{downloadCount.toLocaleString('af-ZA')} keer afgelaai</span>
            )}
          </div>
        )}
        <h4 className="book-title">{book.title}</h4>
        <p className="book-desc">{book.desc}</p>
        <div className="book-footer">
          {claimed
            ? pdfUrl
              ? <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="btn-free book-buy-btn">📥 Laai af</a>
              : <button className="btn-free book-buy-btn" onClick={onClaim}>📥 Laai af</button>
            : <button className="btn-primary book-buy-btn" onClick={onClaim}>Kry gratis →</button>
          }
        </div>
      </div>
    </div>
  )
}

/* ── Main screen ── */
export default function Meer({ targetBookId, onScrolled, installPrompt, isInstalled }) {
  const [bookOverrides,       setBookOverrides]       = useState({})
  const [rgCount,             setRgCount]             = useState(CAMPAIGN.goal)
  const [liveCount,           setLiveCount]           = useState(0)
  const [liveValue,           setLiveValue]           = useState(0)
  const [activeBook,          setActiveBook]          = useState(null)
  const [claimedMap,          setClaimedMap]          = useState({})
  const [showKinderBibloteek, setShowKinderBibloteek] = useState(false)
  const [showLeesplanne,     setShowLeesplanne]     = useState(false)

  // Scroll to target book
  useEffect(() => {
    if (!targetBookId) return
    const t = setTimeout(() => {
      const el = document.getElementById(`book-${targetBookId}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        if (onScrolled) onScrolled()
      }
    }, 150)
    return () => clearTimeout(t)
  }, [targetBookId])

  // Load book overrides from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'books'), snap => {
      const overrides = {}
      snap.docs.forEach(d => { overrides[d.id] = d.data() })
      setBookOverrides(overrides)
    })
    return unsub
  }, [])

  // Load rgCount from campaign-count API
  function fetchRgCount() {
    fetch('/api/campaign-count')
      .then(r => r.json())
      .then(d => { if (d.total) setRgCount(d.total) })
      .catch(() => {})
  }

  useEffect(() => {
    fetchRgCount()
  }, [])

  // Load liveCount + liveValue from stats/ebooks_given
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'stats', 'ebooks_given'), snap => {
      if (snap.exists()) {
        const data = snap.data()
        setLiveCount(data.count ?? 0)
        setLiveValue(data.value ?? 0)
      }
    })
    return unsub
  }, [])

  // Build claimedMap from localStorage
  function buildClaimedMap(overrides) {
    const map = {}
    STATIC_BOOKS.forEach(b => {
      if (localStorage.getItem(`fb_claimed_${b.id}`) === '1') map[b.id] = true
    })
    Object.keys(overrides).forEach(id => {
      if (!STATIC_IDS.has(id) && localStorage.getItem(`fb_claimed_${id}`) === '1') map[id] = true
    })
    // Also accept old huise_claimed key for RG (backwards compat)
    if (localStorage.getItem('huise_claimed') === '1') map['rustelose-gedagtes'] = true
    return map
  }

  useEffect(() => {
    setClaimedMap(buildClaimedMap(bookOverrides))
  }, [bookOverrides])

  const BOOKS = [
    // Dynamic Firestore books not in static list (featured at top)
    ...Object.entries(bookOverrides)
      .filter(([id, d]) => !STATIC_IDS.has(id) && d.title)
      .map(([id, d]) => {
        const isRG = id === 'rustelose-gedagtes' || (d.title || '').toLowerCase().includes('rustelose')
        return { id, color: '#EDE8F8', emoji: '📚', ...d, ...(isRG ? { badge: 'NUUT', isRG: true } : {}) }
      })
      .sort((a, b) => { if (a.badge === 'NUUT') return -1; if (b.badge === 'NUUT') return 1; return 0 }),
    // Static books with Firestore overrides for pdfUrl/coverUrl
    ...STATIC_BOOKS.map(b => {
      const ov = bookOverrides[b.id] || {}
      return { ...b, pdfUrl: ov.pdfUrl ?? b.pdfUrl ?? null, coverUrl: ov.coverUrl ?? null }
    }),
  ]

  // Omslae vir die Leesplanne-kaart — Bybel Maklik Gemaak, Rustelose Gedagtes, Dink Nuut
  const LP_PROMO_IDS = ['bybel-hulpbron', 'rustelose-gedagtes', 'dink-nuut-leef-nuut']
  const lpPromoCovers = LP_PROMO_IDS
    .map(id => {
      const ov = bookOverrides[id] || {}
      const st = BOOKS.find(b => b.id === id) || {}
      return ov.coverUrl || st.coverUrl || null
    })
    .filter(Boolean)

  const totalBooks = rgCount + 3000 + liveCount
  const totalValue = rgCount * 110 + 150000 + liveValue

  return (
    <div className="meer">
      {/* Impact Header */}
      <div className="screen-header meer-header">
        <div className="meer-header-label">GRATIS HOOP-BIBLIOTEEK</div>
        <h1 className="meer-header-title">Elke e-boek is gratis</h1>
        <p className="meer-header-sub">Hoop behoort nie net beskikbaar te wees vir mense wat kan betaal nie.</p>
        <div className="meer-stats-row">
          <div className="meer-stat-box">
            <span className="meer-stat-num">{fmtNum(totalBooks)}+</span>
            <span className="meer-stat-lbl">e-boeke afgelaai</span>
          </div>
          <div className="meer-stat-box">
            <span className="meer-stat-num">R{Math.floor(totalValue).toLocaleString('af-ZA')}+</span>
            <span className="meer-stat-lbl">se e-boeke gratis weggegee</span>
          </div>
        </div>
      </div>

      <div className="meer-body">
        <DonationCard />

        {/* ── Kinder promo card ── */}
        <div
          className="kinder-promo"
          role="button"
          tabIndex={0}
          onClick={() => setShowKinderBibloteek(true)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowKinderBibloteek(true) }}
        >
          <div className="kinder-promo-row">
            <div className="kinder-promo-text">
              <span className="kinder-promo-badge">NUUT</span>
              <h2 className="kinder-promo-title">Klein Hartjies, Groot Waarhede</h2>
              <p className="kinder-promo-subtitle">Interaktiewe Bybelse prenteboeke vir kinders van 2–5 jaar.</p>
              <p className="kinder-promo-tagline">Lees saam. Beweeg saam. Plant God se waarheid in klein hartjies.</p>
              <div className="kinder-promo-count">{KINDER_BOEKE.length} gratis kinderboeke beskikbaar</div>
            </div>
            <div className="kinder-promo-covers" aria-hidden="true">
              {[KINDER_BOEKE[0], KINDER_BOEKE[3], KINDER_BOEKE[4]].map((b, i) => (
                <div key={i} className="kinder-promo-cover">
                  <img src={b.cover} alt="" />
                </div>
              ))}
            </div>
          </div>
          <button className="kinder-promo-btn" onClick={e => { e.stopPropagation(); setShowKinderBibloteek(true) }}>
            SIEN DIE KINDERBOEKE →
          </button>
        </div>

        {/* ── Leesplanne promo card ── */}
        <div
          className="lp-promo"
          role="button"
          tabIndex={0}
          onClick={() => setShowLeesplanne(true)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowLeesplanne(true) }}
        >
          <div className="lp-promo-row">
            <div className="lp-promo-left">
              <h2 className="lp-promo-title">Leesplanne</h2>
              <p className="lp-promo-sub">Kort en langer Bybelse leesplanne wat jy dag vir dag kan volg. Almal gratis.</p>
            </div>
            {lpPromoCovers.length > 0 && (
              <div className="lp-promo-covers" aria-hidden="true">
                {lpPromoCovers.map((src, i) => (
                  <div key={i} className="lp-promo-cover">
                    <img src={src} alt="" loading="lazy" draggable="false" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="lp-promo-btn" onClick={e => { e.stopPropagation(); setShowLeesplanne(true) }}>
            SIEN PLANNE →
          </button>
        </div>

        {/* All books */}
        <div className="meer-section">
          <div className="section-header">
            <h3 className="section-title">📚 Al die e-boeke</h3>
            <span className="section-count">{BOOKS.length} boeke</span>
          </div>
          <div className="book-list">
            {BOOKS.map(b => (
              <div key={b.id} id={`book-${b.id}`}>
                <FreeBookCard
                  book={b}
                  claimed={!!claimedMap[b.id]}
                  onClaim={() => setActiveBook(b)}
                  downloadCount={b.isRG ? rgCount : undefined}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Die privaatheidsbeleid ──
             Google Play se User Data-beleid vra dat die beleid op TWEE plekke
             staan: op die winkelblad EN binne die app self. Een van die twee is
             nie genoeg nie — dit is 'n gewone rede vir 'n afgekeurde aansoek.

             Dit staan hier onderaan die Meer-blad omdat dit die enigste skerm is
             waar 'n mens tot heel onder rol en waar 'n stil reël niks in die pad
             is nie. Dit is 'n gewone <a>, nie 'n roete in die app nie: die
             bladsy is 'n statiese HTML-lêer wat laai al sou die app se
             JavaScript val, en Google se keurders maak dit in 'n blaaier oop. */}
        <p className="meer-privaatheid">
          <a href="/privaatheid" target="_blank" rel="noopener noreferrer">Privaatheidsbeleid</a>
        </p>
      </div>

      {showKinderBibloteek && (
        <KinderBibloteek onClose={() => setShowKinderBibloteek(false)} />
      )}

      {showLeesplanne && (
        <LeesplanneLys onClose={() => setShowLeesplanne(false)} />
      )}

      {activeBook && (
        <FreeBookModal
          book={activeBook}
          installPrompt={installPrompt}
          isInstalled={isInstalled}
          onClose={() => {
            setClaimedMap(buildClaimedMap(bookOverrides))
            setActiveBook(null)
            // Refresh RG count in case they just downloaded it
            if (activeBook.isRG) fetchRgCount()
          }}
        />
      )}
    </div>
  )
}
