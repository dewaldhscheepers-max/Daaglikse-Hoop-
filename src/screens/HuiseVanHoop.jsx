import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import { CAMPAIGN } from '../data/campaign'
import './HuiseVanHoop.css'

const SHARE_MSG = `Ek het sopas die Rustelose Gedagtes e-boek gratis gekry via Daaglikse Hoop 🙏🏻\n\nKry joune ook — ons soek 1000 huise van hoop:\nhttps://dewaldscheepers.com/go`

export default function HuiseVanHoop({ onClose, installPrompt, isInstalled, onNavigate }) {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  const alreadyClaimed = !!localStorage.getItem('huise_claimed')
  const skipInstall    = isInstalled || isStandalone || alreadyClaimed

  const [step,         setStep]        = useState(alreadyClaimed ? 'success' : skipInstall ? 'form' : 'install')
  const [naam,         setNaam]        = useState('')
  const [epos,         setEpos]        = useState('')
  const [consent,      setConsent]     = useState(false)
  const [busy,         setBusy]        = useState(false)
  const [error,        setError]       = useState('')
  const [installDone,  setInstallDone] = useState(false)
  const [shareToast,   setShareToast]  = useState(false)
  const [ebookUrl,     setEbookUrl]    = useState('')

  useEffect(() => {
    getDocs(collection(db, 'books')).then(snap => {
      const book = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .find(b => b.title?.toLowerCase().includes('rustelose') || b.id?.toLowerCase().includes('rustelose'))
      if (book?.pdfUrl) setEbookUrl(book.pdfUrl)
    }).catch(() => {})
  }, [])

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

  async function handleSubmit() {
    if (!naam.trim())                                      { setError('Voer asb jou naam in.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epos.trim())) { setError("Voer asb 'n geldige e-posadres in."); return }
    if (!consent)                                          { setError('Gee asb toestemming om voort te gaan.'); return }

    setBusy(true)
    setError('')
    try {
      await fetch('/api/campaign-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: naam.trim(), email: epos.toLowerCase().trim() }),
      })
      localStorage.setItem('huise_claimed', '1')
      setStep('success')
    } catch {
      setError('Iets het fout gegaan. Probeer asb weer.')
    } finally {
      setBusy(false)
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try { await navigator.share({ text: SHARE_MSG, url: 'https://dewaldscheepers.com/go' }) } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(SHARE_MSG)
        setShareToast(true)
        setTimeout(() => setShareToast(false), 2500)
      } catch {}
    }
  }

  return (
    <div className="huise-backdrop" onClick={onClose}>
      <div className="huise-modal" onClick={e => e.stopPropagation()}>
        <button className="huise-close" onClick={onClose}>✕</button>

        {/* ── Stap 1: Installeer ── */}
        {step === 'install' && (
          <div className="huise-step">
            <div className="huise-emoji">📱</div>
            <h2 className="huise-title">Installeer eers die app</h2>
            <p className="huise-text">
              Hierdie gratis e-boek is deel van die Daaglikse Hoop-app. Installeer die app sodat jy ook die stemnotas, gebedsmuur en gebede kan gebruik.
            </p>

            {installDone ? (
              <div className="huise-install-done">✅ App geïnstalleer!</div>
            ) : installPrompt ? (
              <button className="huise-btn-primary" onClick={handleInstall}>
                📲 Installeer die app
              </button>
            ) : (
              <div className="huise-ios-tip">
                <strong>Hoe om te installeer:</strong><br />
                Maak die blaaier se menu oop en kies <em>"Add to Home Screen"</em> of <em>"Install app"</em>.
              </div>
            )}

            <button className="huise-btn-ghost" onClick={() => setStep('form')}>
              Ek het reeds die app →
            </button>
          </div>
        )}

        {/* ── Stap 2: Vorm ── */}
        {step === 'form' && (
          <div className="huise-step">
            <div className="huise-emoji">🙏🏻</div>
            <h2 className="huise-title">Kry jou gratis e-boek</h2>
            <p className="huise-text">Vul jou besonderhede in en kry <strong>Rustelose Gedagtes</strong> gratis.</p>

            <div className="huise-field">
              <label>Naam</label>
              <input
                value={naam}
                onChange={e => { setNaam(e.target.value); setError('') }}
                placeholder="Jou naam"
                autoFocus
              />
            </div>
            <div className="huise-field">
              <label>E-posadres</label>
              <input
                type="email"
                value={epos}
                onChange={e => { setEpos(e.target.value); setError('') }}
                placeholder="naam@epos.com"
              />
            </div>

            <label className="huise-consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={e => { setConsent(e.target.checked); setError('') }}
              />
              <span>Ek gee toestemming dat Daaglikse Hoop my e-pos gebruik om vir my die gratis e-boek en verdere bemoediging te stuur. Ek kan enige tyd uitteken.</span>
            </label>

            {error && <div className="huise-error">{error}</div>}

            <button className="huise-btn-primary" onClick={handleSubmit} disabled={busy}>
              {busy ? 'Besig...' : 'Kry my e-boek →'}
            </button>
          </div>
        )}

        {/* ── Stap 3: Sukses ── */}
        {step === 'success' && (
          <div className="huise-step">
            <div className="huise-emoji">🎉</div>
            <h2 className="huise-title">Jou e-boek is gereed 🙏🏻</h2>
            <p className="huise-text">Mag hierdie boek hoop in jou huis bring.</p>

            {ebookUrl ? (
              <a
                className="huise-btn-primary"
                href={ebookUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                📥 Laai e-boek af
              </a>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                E-boek word gelaai...
              </div>
            )}

            <button className="huise-btn-share" onClick={handleShare}>
              {shareToast ? '✓ Gekopieer!' : '🔗 Deel met \'n vriend'}
            </button>

            <div className="huise-nav-links">
              <button className="huise-btn-ghost" onClick={() => { onClose(); onNavigate('bidsaam') }}>
                🙏 Plaas 'n gebedsversoek
              </button>
              <button className="huise-btn-ghost" onClick={() => { onClose(); onNavigate('luister') }}>
                🎧 Luister na Rustelose Gedagtes
              </button>
            </div>

            <div className="huise-donation-block">
              <p>As hierdie bediening jou help, oorweeg dit om 'n Hoopdraer te word sodat ons meer mense gratis kan bedien.</p>
              <div className="huise-donation-row">
                <button
                  className="huise-btn-donate"
                  onClick={() => { onClose(); window.dispatchEvent(new CustomEvent('open-hoop-vennoot')) }}
                >
                  Word 'n Hoopdraer
                </button>
                <button
                  className="huise-btn-donate-ghost"
                  onClick={() => { onClose(); window.dispatchEvent(new CustomEvent('open-donation')) }}
                >
                  Gee eenmalig
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
