import { useState, useEffect } from 'react'
import './FreeBookModal.css'

export default function FreeBookModal({ book, onClose, installPrompt, isInstalled }) {
  const storageKey = `fb_claimed_${book.id}`

  const alreadyClaimed = localStorage.getItem(storageKey) === '1'
  const isStandalone   = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  const skipInstall    = isInstalled || isStandalone || alreadyClaimed

  const [step,        setStep]        = useState(alreadyClaimed && book.pdfUrl ? 'success' : skipInstall ? 'form' : 'install')
  const [installDone, setInstallDone] = useState(false)
  const [email,       setEmail]       = useState('')
  const [consent,     setConsent]     = useState(false)
  const [busy,        setBusy]        = useState(false)
  const [error,       setError]       = useState('')
  const [result,      setResult]      = useState(alreadyClaimed && book.pdfUrl ? { pdfUrl: book.pdfUrl, title: book.title } : null)
  const [shareToast,  setShareToast]  = useState(false)

  async function handleInstall() {
    if (!installPrompt) return
    try {
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') {
        setInstallDone(true)
        setTimeout(() => setStep('form'), 900)
      }
    } catch {}
  }

  // Close on backdrop click
  function handleBackdropClick(e) {
    if (busy) return
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
    const shareUrl = 'https://dewaldscheepers.com/go'
    const msg = `Ek het sopas "${book.title}" gratis gekry op die Daaglikse Hoop app 🙏\n\nKry ook gratis Bybelse e-boeke:`
    if (navigator.share) {
      try { await navigator.share({ text: msg, url: shareUrl }) } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(`${msg}\n${shareUrl}`)
        setShareToast(true)
        setTimeout(() => setShareToast(false), 2500)
      } catch {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${msg}\n${shareUrl}`)}`,
          '_blank'
        )
      }
    }
  }

  const displayPdfUrl = result?.pdfUrl ?? book.pdfUrl
  const displayTitle  = result?.title  || book.title

  return (
    <div className="fb-backdrop" onClick={handleBackdropClick}>
      <div className="fb-modal" onClick={e => e.stopPropagation()}>
        <button className="fb-close" onClick={onClose} aria-label="Sluit">✕</button>

        {/* ── Install step ── */}
        {step === 'install' && (
          <>
            <div className="fb-book-cover" style={{ background: book.coverUrl ? 'transparent' : book.color }}>
              {book.coverUrl
                ? <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                : <span style={{ fontSize: 36 }}>{book.emoji || '📚'}</span>}
            </div>
            <h2 className="fb-title">Installeer eers die app</h2>
            <p className="fb-sub">Hierdie gratis e-boek is deel van die Daaglikse Hoop-app. Installeer die app sodat jy ook die stemnotas, gebedsmuur en gebede kan gebruik.</p>

            {installDone ? (
              <div className="fb-install-done">✅ App geïnstalleer!</div>
            ) : installPrompt ? (
              <button className="fb-btn-primary" onClick={handleInstall}>📲 Installeer die app</button>
            ) : (
              <div className="fb-ios-tip">
                <strong>Hoe om te installeer:</strong><br />
                Maak die blaaier se menu oop en kies <em>"Add to Home Screen"</em> of <em>"Install app"</em>.
              </div>
            )}

            <button className="fb-btn-skip" onClick={() => setStep('form')}>Ek het reeds die app →</button>
          </>
        )}

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

            <button className="fb-btn-skip" onClick={onClose}>Nie nou nie</button>
          </>
        )}
      </div>
    </div>
  )
}
