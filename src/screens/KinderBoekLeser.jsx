import { useState, useEffect, useRef, useCallback } from 'react'
import './KinderBoekLeser.css'

export default function KinderBoekLeser({ book, onClose }) {
  const [currentPage, setCurrentPage]       = useState(0)
  const [showResume, setShowResume]         = useState(false)
  const [resumePage, setResumePage]         = useState(0)
  const [showCompletion, setShowCompletion] = useState(false)
  const scrollRef          = useRef(null)
  const completionTimer    = useRef(null)
  const lastScrolledPage   = useRef(0)

  const totalPages = book.pages.length

  // ── On mount: check for saved page ──
  useEffect(() => {
    const saved = parseInt(localStorage.getItem(`kb_page_${book.id}`) || '0', 10)
    if (!isNaN(saved) && saved > 0 && saved < totalPages) {
      setResumePage(saved)
      setShowResume(true)
    }
  }, [book.id, totalPages])

  // ── Persist current page ──
  useEffect(() => {
    localStorage.setItem(`kb_page_${book.id}`, String(currentPage))
  }, [currentPage, book.id])

  // ── Completion detection (600ms after landing on last page) ──
  useEffect(() => {
    clearTimeout(completionTimer.current)
    if (currentPage === totalPages - 1 && !showCompletion) {
      completionTimer.current = setTimeout(() => setShowCompletion(true), 600)
    }
    return () => clearTimeout(completionTimer.current)
  }, [currentPage, totalPages, showCompletion])

  // ── Scroll helpers ──
  const scrollToPage = useCallback((page, instant = false) => {
    const el = scrollRef.current
    if (!el) return
    if (instant) {
      el.scrollLeft = page * window.innerWidth
    } else {
      el.scrollTo({ left: page * window.innerWidth, behavior: 'smooth' })
    }
  }, [])

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    const page = Math.round(el.scrollLeft / window.innerWidth)
    if (page !== lastScrolledPage.current) {
      lastScrolledPage.current = page
      setCurrentPage(page)
    }
  }

  function goBack() {
    if (currentPage > 0) scrollToPage(currentPage - 1)
  }

  function goForward() {
    if (currentPage < totalPages - 1) scrollToPage(currentPage + 1)
  }

  // ── Tap-zone click navigation (left 35% / right 35%) ──
  function handleScrollAreaClick(e) {
    const w = window.innerWidth
    const x = e.clientX
    if (x < w * 0.35)      goBack()
    else if (x > w * 0.65) goForward()
    // Middle 30% does nothing
  }

  // ── Resume handlers ──
  function handleResumeContinue() {
    scrollToPage(resumePage, true)
    setShowResume(false)
  }

  function handleResumeRestart() {
    localStorage.setItem(`kb_page_${book.id}`, '0')
    setShowResume(false)
  }

  // ── Share ──
  async function handleShare() {
    const url  = `https://dewaldscheepers.com/go/boeke/kinders/${book.id}`
    const text = `Hierdie gratis Bybelse prenteboek is gemaak vir klein hartjies. Lees dit saam met jou kind:`
    if (navigator.share) {
      try { await navigator.share({ title: book.title, text: `${text}\n${url}`, url }) } catch {}
    } else {
      try { await navigator.clipboard.writeText(`${text}\n${url}`) } catch {}
    }
  }

  // ── Completion actions ──
  function handleReadAgain() {
    setShowCompletion(false)
    scrollToPage(0, true)
    localStorage.setItem(`kb_page_${book.id}`, '0')
  }

  function handleDonation() {
    window.dispatchEvent(new CustomEvent('open-donation'))
  }

  return (
    <div className="kbl-reader">

      {/* ── Horizontal scroll strip ── */}
      <div
        ref={scrollRef}
        className="kbl-scroll"
        onScroll={handleScroll}
        onClick={handleScrollAreaClick}
      >
        {book.pages.map((src, i) => (
          <div key={i} className="kbl-page">
            <img
              src={src}
              alt={`${book.title} — bladsy ${i + 1}`}
              className="kbl-page-img"
              onError={e => {
                e.currentTarget.style.display = 'none'
                const fb = e.currentTarget.nextElementSibling
                if (fb) fb.style.display = 'flex'
              }}
            />
            {/* Colored fallback shown when image is missing */}
            <div className="kbl-page-fallback" />

            {/* Parent tip only on the cover page */}
            {i === 0 && (
              <div
                className="kbl-parent-tip"
                onClick={e => e.stopPropagation()}
              >
                <span className="kbl-parent-tip-label">Vir die grootmens:</span>
                {' '}Lees die sin. Doen die aksie saam. Herhaal daarna die waarheid.
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Top controls ── */}
      <div className="kbl-controls">
        <button className="kbl-ctrl-btn" onClick={onClose} aria-label="Terug na kinderboeke">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <span className="kbl-page-indicator">{currentPage + 1} van {totalPages}</span>

        <button className="kbl-ctrl-btn" onClick={handleShare} aria-label="Deel hierdie boek">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5"  r="3" />
            <circle cx="6"  cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59"  y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51"  x2="8.59"  y2="10.49" />
          </svg>
        </button>
      </div>

      {/* ── Side arrows (hidden at first/last page) ── */}
      {currentPage > 0 && (
        <button
          className="kbl-arrow kbl-arrow-left"
          onClick={goBack}
          aria-label="Vorige bladsy"
        >
          ‹
        </button>
      )}
      {currentPage < totalPages - 1 && (
        <button
          className="kbl-arrow kbl-arrow-right"
          onClick={goForward}
          aria-label="Volgende bladsy"
        >
          ›
        </button>
      )}

      {/* ── Resume prompt ── */}
      {showResume && (
        <div className="kbl-overlay">
          <div className="kbl-resume-card">
            <div className="kbl-resume-icon">📖</div>
            <h3 className="kbl-resume-title">Welkom terug!</h3>
            <p className="kbl-resume-msg">
              Jy was by bladsy {resumePage + 1} van {totalPages}.<br />
              Wil jy aangaan waar jy opgehou het?
            </p>
            <button className="kbl-btn-primary" onClick={handleResumeContinue}>
              Gaan aan
            </button>
            <button className="kbl-btn-ghost" onClick={handleResumeRestart}>
              Begin weer
            </button>
          </div>
        </div>
      )}

      {/* ── Completion overlay ── */}
      {showCompletion && (
        <div className="kbl-overlay kbl-overlay-dark">
          <div className="kbl-completion-card">
            <div className="kbl-completion-icon">🦁</div>
            <h2 className="kbl-completion-title">Julle het die boek klaar gelees!</h2>
            <p className="kbl-completion-msg">
              Lees dit weer, deel dit met 'n ander ouer, of help ons om nog gratis kinderboeke te maak.
            </p>
            <div className="kbl-completion-actions">
              <button className="kbl-btn-primary" onClick={handleShare}>
                Deel hierdie boek
              </button>
              <button className="kbl-btn-secondary" onClick={handleReadAgain}>
                Lees weer
              </button>
              <button className="kbl-btn-secondary" onClick={handleDonation}>
                Maak 'n donasie
              </button>
              <button className="kbl-btn-ghost" onClick={onClose}>
                Terug na kinderboeke
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
