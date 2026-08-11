import { useState, useEffect } from 'react'
import { KINDER_BOEKE } from '../data/kinderBoeke'
import { boekeWatWys } from '../data/kinderBoekeWys'
import KinderBoekLeser from './KinderBoekLeser'
import './KinderBibloteek.css'

async function shareBook(book) {
  const url  = `https://dewaldscheepers.com/go/boeke/kinders/${book.id}`
  const text = `Hierdie gratis Bybelse prenteboek is gemaak vir klein hartjies. Lees dit saam met jou kind:`
  if (navigator.share) {
    try { await navigator.share({ title: book.title, text: `${text}\n${url}`, url }) } catch {}
  } else {
    try { await navigator.clipboard.writeText(`${text}\n${url}`) } catch {}
  }
}

/* ── Single book card ── */
function BookCard({ book, onRead, onShare }) {
  return (
    <div className="kb-book-card" onClick={onRead}>
      <div className="kb-book-cover">
        <img
          src={book.cover}
          alt={book.title}
          className="kb-book-cover-img"
          onError={e => {
            e.currentTarget.style.display = 'none'
            const fb = e.currentTarget.nextElementSibling
            if (fb) fb.style.display = 'flex'
          }}
        />
        <div className="kb-book-cover-fallback" />
      </div>
      <div className="kb-book-info">
        <h3 className="kb-book-title">{book.title}</h3>
        <p className="kb-book-age">{book.ageRange}</p>
        <div className="kb-book-actions">
          <button
            className="kb-read-btn"
            onClick={e => { e.stopPropagation(); onRead() }}
          >
            Lees nou
          </button>
          <button
            className="kb-share-icon-btn"
            onClick={e => { e.stopPropagation(); onShare() }}
            aria-label={`Deel ${book.title}`}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5"  r="3" />
              <circle cx="6"  cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59"  y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51"  x2="8.59"  y2="10.49" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main library screen ── */
export default function KinderBibloteek({ onClose }) {
  const [activeBook, setActiveBook]   = useState(null)
  const [books, setBooks]             = useState(null)
  const [fsLoading, setFsLoading]     = useState(true)

  /* ── Waarom dit deur die bediener lees en nie deur Firestore nie ──

     Hier het `onSnapshot(collection(db, 'kinderBoeke'))` gestaan. Dit het
     STIL misluk: daar is geen `match /kinderBoeke/{id}` in firestore.rules
     nie, en Firestore weier by verstek. Die foutgeval het toe die ingeboude
     lys gewys, en dit lyk soos 'n app wat werk. Sewe boeke, altyd sewe, hoeveel
     'n mens ook al oplaai — en niks in die app se ooit hoekom nie.

     'n Mens kon 'n reel bygevoeg het, maar dan moet iemand dit in Firebase
     gaan ontplooi voor dit iets doen. /api/kinder-boeke-list bestaan reeds,
     lees met die diensrekening, en die admin gebruik dit al die hele tyd.

     Wat ons verloor is die lewende opdatering — 'n boek wat NOU opgelaai word,
     verskyn by die volgende oopmaak in plaas van dadelik. Vir 'n biblioteek wat
     'n paar keer per maand verander, is dit niks. */
  useEffect(() => {
    let lewendig = true
    fetch('/api/kinder-boeke-list', { headers: { accept: 'application/json' } })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then(d => {
        if (!lewendig) return
        /* Die reel staan in src/data/kinderBoekeWys.js, want die telling op
           die promo-kaart moet dieselfde antwoord kry. */
        setBooks(boekeWatWys(d.books, KINDER_BOEKE))
        setFsLoading(false)
      })
      .catch(() => {
        if (!lewendig) return
        setBooks(KINDER_BOEKE)
        setFsLoading(false)
      })
    return () => { lewendig = false }
  }, [])

  const displayBooks = books ?? KINDER_BOEKE

  return (
    <div className="kb-library">

      {/* ── Header ── */}
      <div className="kb-library-header">
        <button className="kb-back-btn" onClick={onClose} aria-label="Terug">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="kb-library-label">GRATIS HOOP-BIBLIOTEEK</div>
        <h1 className="kb-library-title">Klein Hartjies,<br />Groot Waarhede</h1>
        <p className="kb-library-subtitle">
          Kort Bybelse prenteboeke wat ouers saam met kinders van 2 tot 5 jaar kan lees.
          Elke bladsy help die kind om te kyk, te beweeg en 'n waarheid hardop te sê.
        </p>
      </div>

      {/* ── Body ── */}
      <div className="kb-library-body">

        {/* 2-column book grid */}
        {fsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 15 }}>
            Boeke word gelaai...
          </div>
        ) : (
          <div className="kb-book-grid">
            {displayBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onRead={() => setActiveBook(book)}
                onShare={() => shareBook(book)}
              />
            ))}
          </div>
        )}

        {/* Donation callout */}
        <div className="kb-donation-callout">
          <div className="kb-donation-icon">🌱</div>
          <h3 className="kb-donation-title">Help ons om hierdie boeke gratis te hou</h3>
          <p className="kb-donation-text">
            Hierdie boeke is gratis omdat ons glo dat elke kind toegang moet hê tot Bybelse stories.
            As jy wil help, kan jy 'n donasie maak — elke bydrae help ons om meer boeke te skep.
          </p>
          <button
            className="kb-donation-btn kb-donation-btn-primary"
            onClick={() => window.dispatchEvent(new CustomEvent('open-hoop-vennoot'))}
          >
            💜 Maandelikse Hoopdraer
          </button>
          <button
            className="kb-donation-btn kb-donation-btn-ghost"
            onClick={() => window.dispatchEvent(new CustomEvent('open-donation'))}
          >
            🙏 Eenmalige bydrae
          </button>
        </div>
      </div>

      {/* ── Reader — fullscreen over the library ── */}
      {activeBook && (
        <KinderBoekLeser
          book={activeBook}
          onClose={() => setActiveBook(null)}
        />
      )}
    </div>
  )
}
