import { useState, useEffect } from 'react'
import './FreeBookModal.css'

export default function FreeBookModal({ book, onClose }) {
  const storageKey = `fb_claimed_${book.id}`

  // If already claimed and pdfUrl is available as prop, skip form
  const alreadyClaimed = localStorage.getItem(storageKey) === '1'
  const [step,       setStep]       = useState(alreadyClaimed && book.pdfUrl ? 'success' : 'form')
  const [email,      setEmail]      = useState('')
  const [consent,    setConsent]    = useState(false)
  const [busy,       setBusy]       = useState(false)
  const [error,      setError]      = useState('')
  const [result,     setResult]     = useState(alreadyClaimed && book.pdfUrl ? { pdfUrl: book.pdfUrl, title: book.title } : null)
  const [shareToast, setShareToast] = useState(false)

  // Close on backdrop click
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  async function handleSubmit() {
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Voer asb 'n geldige e-posadres in.")
      return
    }
    if (!consent) {
      setError('Gee asb toestemming om voort te gaan.')
      return
    }

    setBusy(true)
    setError('')
    try {
      const r = await fetch('/api/free-book-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, bookId: book.id, consent }),
      })
      const data = await r.json()
      if (!r.ok) {
        setError(data.error || 'Iets het fout gegaan. Probeer asb weer.')
        return
      }
      localStorage.setItem(storageKey, '1')
      setResult(data)
      setStep('success')
    } catch {
      setError('Iets het fout gegaan. Probeer asb weer.')
    } finally {
      setBusy(false)
    }
  }

  async function handleShare() {
    const msg = `Ek het sopas "${book.title}" gratis gekry op die Daaglikse Hoop app 🙏\n\nKry ook gratis Bybelse e-boeke:\nhttps://dewaldscheepers.com/go`
    if (navigator.share) {
      try { await navigator.share({ text: msg, url: 'https://dewaldscheepers.com/go' }) } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(msg)
        setShareToast(true)
        setTimeout(() => setShareToast(false), 2500)
      } catch {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(msg)}`,
          '_blank'
        )
      }
    }
  }

  const displayPdfUrl = result?.pdfUrl || book.pdfUrl
  const displayTitle  = result?.title  || book.title

  return (
    <div className="fb-backdrop" onClick={handleBackdropClick}>
      <div className="fb-modal" onClick={e => e.stopPropagation()}>
        <button className="fb-close" onClick={onClose} aria-label="Sluit">✕</button>

        {/* ── Form step ── */}
        {step === 'form' && (
          <>
            <div className="fb-book-cover" style={{ background: book.coverUrl ? 'transparent' : book.color }}>
              {book.coverUrl
                ? <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                : <span style={{ fontSize: 36 }}>{book.emoji || '📚'}</span>}
            </div>

            <h2 className="fb-title">Kry "{book.title}" gratis</h2>
            <p className="fb-sub">Vul jou e-posadres in — ons stuur ook 'n kopie na jou e-pos.</p>

            <label className="fb-label">E-posadres</label>
            <input
              className="fb-input"
              type="email"
              placeholder="naam@epos.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              autoFocus
            />

            <label className="fb-consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={e => { setConsent(e.target.checked); setError('') }}
              />
              <span>
                Ek sluit aan by die Daaglikse Hoop e-posgemeenskap en gee toestemming dat Dewald Scheepers vir my boodskappe van hoop, gratis hulpbronne en nuus mag stuur. Ek kan enige tyd uitteken.
              </span>
            </label>

            {error && <p className="fb-error">{error}</p>}

            <button className="fb-btn-primary" onClick={handleSubmit} disabled={busy}>
              {busy ? 'Besig...' : 'Kry my gratis e-boek →'}
            </button>

            <p className="fb-privacy">🔒 Jou besonderhede word veilig bewaar.</p>
          </>
        )}

        {/* ── Success step ── */}
        {step === 'success' && (
          <>
            <div className="fb-success-icon">🎁</div>
            <h2 className="fb-title">Jou boek is gereed!</h2>
            <p className="fb-sub">Ons het ook 'n kopie na jou e-pos gestuur.</p>

            {displayPdfUrl ? (
              <a
                href={displayPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="fb-btn-primary"
                style={{ textDecoration: 'none', textAlign: 'center' }}
              >
                📥 Laai {displayTitle} af
              </a>
            ) : (
              <p className="fb-sub">Hierdie boek word binnekort beskikbaar. Kyk jou e-pos.</p>
            )}

            <button className="fb-btn-share" onClick={handleShare}>
              {shareToast ? '✓ Gekopieer!' : '🔗 Deel met \'n vriend'}
            </button>

            <div className="fb-donate-block">
              <p>Help sodat die volgende persoon ook gratis hoop kan ontvang:</p>
              <div className="fb-donate-row">
                <button
                  className="fb-btn-monthly"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-hoop-vennoot'))
                    onClose()
                  }}
                >
                  💜 Maandelikse Vennoot
                </button>
                <button
                  className="fb-btn-once"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-donation'))
                    onClose()
                  }}
                >
                  🙏 Eenmalige Bydrae
                </button>
              </div>
            </div>

            <div className="fb-install-block">
              <div className="fb-install-inner">
                <span className="fb-install-icon-sm">📱</span>
                <div>
                  <p className="fb-install-title">Daaglikse hoop op jou foon</p>
                  <p className="fb-install-sub">Installeer die app vir 'n nuwe boodskap elke dag</p>
                </div>
              </div>
              <button className="fb-btn-install" onClick={() => {
                window.dispatchEvent(new CustomEvent('trigger-install-prompt'))
                onClose()
              }}>
                Installeer die app →
              </button>
            </div>

            <button className="fb-btn-skip" onClick={onClose}>Nie nou nie</button>
          </>
        )}
      </div>
    </div>
  )
}
