import { useState } from 'react'
import { KINDER_BOEKE } from '../data/kinderBoeke'
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
  const [activeBook, setActiveBook] = useState(null)

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
        <div className="kb-book-grid">
          {KINDER_BOEKE.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onRead={() => setActiveBook(book)}
              onShare={() => shareBook(book)}
            />
          ))}
        </div>

        {/* Donation callout */}
        <div className="kb-donation-callout">
          <div className="kb-donation-icon">🌱</div>
          <h3 className="kb-donation-title">Help ons om hierdie boeke gratis te hou</h3>
          <p className="kb-donation-text">
            Hierdie boeke is gratis omdat ons glo dat elke kind toegang moet hê tot Bybelse stories.
            As jy wil help, kan jy 'n donasie maak — elke bydrae help ons om meer boeke te skep.
          </p>
          <button
            className="kb-donation-btn"
            onClick={() => window.dispatchEvent(new CustomEvent('open-donation'))}
          >
            Maak 'n donasie
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
