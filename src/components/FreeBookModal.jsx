import { useState } from 'react'
import './FreeBookModal.css'

/* ── Die gratis-boek-venster ──
 *
 * Dit vang 'n e-pos, roep `/api/free-book-download` (wat die EEN gedeelde
 * teller `stats/ebooks_given` optel) en wys die aflaai-skakel.
 *
 * ── Twee tale, EEN vloei ──
 *
 * Dewald, 9 Oktober 2026: 'n Engelse e-boekblad vir Engelssprekendes. Hulle gaan
 * deur PRESIES dieselfde venster en dieselfde eindpunt — net die woorde skuif.
 * 'n Tweede venster met sy eie pad is 'n tweede plek wat stilweg agterbly die
 * dag wanneer die telling of die e-pos verander. Die `taal`-prop kies net die
 * string-tabel; die logika bly een. */
const WOORDE = {
  af: {
    installTitel: 'Installeer eers die app',
    installSub:   'Hierdie gratis e-boek is deel van die Daaglikse Hoop-app. Installeer die app sodat jy ook die stemnotas, gebedsmuur en gebede kan gebruik.',
    installKnop:  '📲 Installeer die app',
    installKlaar: '✅ App geïnstalleer!',
    installHoe:   'Hoe om te installeer:',
    installHoe2:  'Maak die blaaier se menu oop en kies',
    reedsApp:     'Ek het reeds die app →',
    vormTitel:    (t) => `Kry "${t}" gratis`,
    vormSub:      "Vul jou e-posadres in — ons stuur ook 'n kopie na jou e-pos.",
    epos:         'E-posadres',
    toestem:      'Ek sluit aan by die Daaglikse Hoop e-posgemeenskap en gee toestemming dat Dewald Scheepers vir my boodskappe van hoop, gratis hulpbronne en nuus mag stuur. Ek kan enige tyd uitteken.',
    foutEpos:     "Voer asb 'n geldige e-posadres in.",
    foutToestem:  'Gee asb toestemming om voort te gaan.',
    foutAlg:      'Iets het fout gegaan. Probeer asb weer.',
    stuur:        'Kry my gratis e-boek →',
    besig:        'Besig...',
    privaat:      '🔒 Jou besonderhede word veilig bewaar.',
    klaarTitel:   'Jou boek is gereed!',
    klaarSub:     "Ons het ook 'n kopie na jou e-pos gestuur.",
    laai:         (t) => `📥 Laai ${t} af`,
    komBinnekort: 'Hierdie boek word binnekort beskikbaar. Kyk jou e-pos.',
    deel:         "🔗 Deel met 'n vriend",
    gekopieer:    '✓ Gekopieer!',
    deelMsg:      (t) => `Ek het sopas "${t}" gratis gekry op die Daaglikse Hoop app 🙏\n\nKry ook gratis Bybelse e-boeke:`,
    steunReel:    'Help sodat die volgende persoon ook gratis hoop kan ontvang:',
    maandeliks:   '💜 Maandelikse Vennoot',
    eenmalig:     '🙏 Eenmalige Bydrae',
    nieNou:       'Nie nou nie',
    sluit:        'Sluit',
  },
  en: {
    installTitel: 'Install the app first',
    installSub:   'This free e-book is part of the Daaglikse Hoop app. Install it so you can also use the voice notes, prayer wall and prayers.',
    installKnop:  '📲 Install the app',
    installKlaar: '✅ App installed!',
    installHoe:   'How to install:',
    installHoe2:  "Open your browser's menu and choose",
    reedsApp:     'I already have the app →',
    vormTitel:    (t) => `Get "${t}" free`,
    vormSub:      "Enter your email — we'll also send a copy to your inbox.",
    epos:         'Email address',
    toestem:      'I join the Daaglikse Hoop email community and give permission for Dewald Scheepers to send me messages of hope, free resources and news. I can unsubscribe at any time.',
    foutEpos:     'Please enter a valid email address.',
    foutToestem:  'Please give permission to continue.',
    foutAlg:      'Something went wrong. Please try again.',
    stuur:        'Get my free e-book →',
    besig:        'Working...',
    privaat:      '🔒 Your details are kept safe.',
    klaarTitel:   'Your book is ready!',
    klaarSub:     'We also sent a copy to your inbox.',
    laai:         (t) => `📥 Download ${t}`,
    komBinnekort: 'This book is coming soon. Check your email.',
    deel:         '🔗 Share with a friend',
    gekopieer:    '✓ Copied!',
    deelMsg:      (t) => `I just got "${t}" free on the Daaglikse Hoop app 🙏\n\nGet free Christian e-books too:`,
    steunReel:    'Help the next person receive free hope too:',
    maandeliks:   '💜 Monthly Partner',
    eenmalig:     '🙏 Give once',
    nieNou:       'Not now',
    sluit:        'Close',
  },
}

export default function FreeBookModal({ book, onClose, installPrompt, isInstalled, taal = 'af' }) {
  const t = WOORDE[taal] || WOORDE.af
  const storageKey = `fb_claimed_${book.id}`

  const alreadyClaimed = localStorage.getItem(storageKey) === '1'
  const isStandalone   = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  /* Die Engelse blad vra NOOIT eers om te installeer nie. Dewald, 10 Oktober
     2026: *"wanneer iemand op die Engelse blad eboek aflaai moet dit kan
     aflaai... Moenie vir hulle vra om eers app te install nie."* 'n Engelse
     besoeker het vir 'n BOEK gekom, en die app is Afrikaans — 'n installasie-
     muur voor die boek is net 'n rede om weg te gaan. Die Afrikaanse pad bly
     presies soos dit was. */
  const skipInstall    = taal === 'en' || isInstalled || isStandalone || alreadyClaimed

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
      setError(t.foutEpos)
      return
    }
    if (!consent) {
      setError(t.foutToestem)
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
        setError(data.error || t.foutAlg)
        return
      }
      localStorage.setItem(storageKey, '1')
      setResult(data)
      setStep('success')
    } catch {
      setError(t.foutAlg)
    } finally {
      setBusy(false)
    }
  }

  async function handleShare() {
    /* Engels deel die Engelse blad — die ontvanger moet by die BOEKE land. */
    const shareUrl = taal === 'en' ? 'https://www.dewaldscheepers.com/english' : 'https://dewaldscheepers.com/go'
    const msg = t.deelMsg(book.title)
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
        <button className="fb-close" onClick={onClose} aria-label={t.sluit}>✕</button>

        {/* ── Install step ── */}
        {step === 'install' && (
          <>
            <div className="fb-book-cover" style={{ background: book.coverUrl ? 'transparent' : book.color }}>
              {book.coverUrl
                ? <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                : <span style={{ fontSize: 36 }}>{book.emoji || '📚'}</span>}
            </div>
            <h2 className="fb-title">{t.installTitel}</h2>
            <p className="fb-sub">{t.installSub}</p>

            {installDone ? (
              <div className="fb-install-done">{t.installKlaar}</div>
            ) : installPrompt ? (
              <button className="fb-btn-primary" onClick={handleInstall}>{t.installKnop}</button>
            ) : (
              <div className="fb-ios-tip">
                <strong>{t.installHoe}</strong><br />
                {t.installHoe2} <em>"Add to Home Screen"</em> / <em>"Install app"</em>.
              </div>
            )}

            <button className="fb-btn-skip" onClick={() => setStep('form')}>{t.reedsApp}</button>
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

            <h2 className="fb-title">{t.vormTitel(book.title)}</h2>
            <p className="fb-sub">{t.vormSub}</p>

            <label className="fb-label">{t.epos}</label>
            <input
              className="fb-input"
              type="email"
              placeholder={taal === 'en' ? 'name@email.com' : 'naam@epos.com'}
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
              <span>{t.toestem}</span>
            </label>

            {error && <p className="fb-error">{error}</p>}

            <button className="fb-btn-primary" onClick={handleSubmit} disabled={busy}>
              {busy ? t.besig : t.stuur}
            </button>

            <p className="fb-privacy">{t.privaat}</p>
          </>
        )}

        {/* ── Success step ── */}
        {step === 'success' && (
          <>
            <div className="fb-success-icon">🎁</div>
            <h2 className="fb-title">{t.klaarTitel}</h2>
            <p className="fb-sub">{t.klaarSub}</p>

            {displayPdfUrl ? (
              <a
                href={displayPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="fb-btn-primary"
                style={{ textDecoration: 'none', textAlign: 'center' }}
              >
                {t.laai(displayTitle)}
              </a>
            ) : (
              <p className="fb-sub">{t.komBinnekort}</p>
            )}

            <button className="fb-btn-share" onClick={handleShare}>
              {shareToast ? t.gekopieer : t.deel}
            </button>

            <div className="fb-donate-block">
              <p>{t.steunReel}</p>
              <div className="fb-donate-row">
                <button
                  className="fb-btn-monthly"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-hoop-vennoot'))
                    onClose()
                  }}
                >
                  {t.maandeliks}
                </button>
                <button
                  className="fb-btn-once"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-donation'))
                    onClose()
                  }}
                >
                  {t.eenmalig}
                </button>
              </div>
            </div>

            <button className="fb-btn-skip" onClick={onClose}>{t.nieNou}</button>
          </>
        )}
      </div>
    </div>
  )
}
