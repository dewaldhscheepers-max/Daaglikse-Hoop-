import { useState, useEffect } from 'react'
import { BOOKS as STATIC_BOOKS } from '../data/books'
import { checkoutBook } from '../utils/payfast'
import { db } from '../firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import './Meer.css'

/* ── Checkout modal ── */
function CheckoutModal({ book, onClose }) {
  const [email, setEmail]   = useState('')
  const [busy, setBusy]     = useState(false)
  const [error, setError]   = useState('')

  function validate(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
  }

  function pay() {
    if (!validate(email)) { setError("Voer asb 'n geldige e-posadres in."); return }
    setBusy(true)
    checkoutBook(book, email)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-book-icon" style={{ background: book.color }}>
          <span>{book.emoji}</span>
        </div>
        <h3 className="modal-title">{book.title}</h3>
        <p className="modal-price">R{book.price}</p>
        <p className="modal-note">
          Na betaling stuur ons die PDF outomaties na jou e-pos.
        </p>

        <label className="modal-label">Jou e-posadres</label>
        <input
          className="modal-input"
          type="email"
          placeholder="naam@epos.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setError('') }}
          autoFocus
        />
        {error && <p className="modal-error">{error}</p>}

        <button
          className="btn-primary modal-pay-btn"
          onClick={pay}
          disabled={busy}
        >
          {busy ? 'Besig...' : `Betaal R${book.price} met PayFast`}
        </button>

        <p className="modal-secure">🔒 Veilige betaling via PayFast · Kaart, EFT, SnapScan</p>
      </div>
    </div>
  )
}

/* ── Book card ── */
function BookCard({ book, onBuy }) {
  return (
    <div className="book-card">
      <div className="book-cover" style={{ background: book.color }}>
        <span className="book-emoji">{book.emoji}</span>
        {book.price === 105 && <span className="book-badge">Gewild</span>}
      </div>
      <div className="book-info">
        <h4 className="book-title">{book.title}</h4>
        <p className="book-desc">{book.desc}</p>
        <div className="book-footer">
          <span className="book-price">R{book.price}</span>
          <button className="btn-primary book-buy-btn" onClick={() => onBuy(book)}>
            Koop
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Free book card ── */
function FreeCard({ book }) {
  function download() {
    if (book.pdfUrl) {
      window.open(book.pdfUrl, '_blank')
    } else {
      alert('Hierdie boek word binnekort beskikbaar. Kontak ons by info@dewaldscheepers.com')
    }
  }

  return (
    <div className="book-card free">
      <div className="book-cover" style={{ background: book.color }}>
        <span className="book-emoji">{book.emoji}</span>
        <span className="book-badge free-badge">GRATIS</span>
      </div>
      <div className="book-info">
        <h4 className="book-title">{book.title}</h4>
        <p className="book-desc">{book.desc}</p>
        <div className="book-footer">
          <span className="book-price free-price">Gratis</span>
          <button className="btn-free book-buy-btn" onClick={download}>
            Aflaai PDF
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main screen ── */
export default function Meer() {
  const [checkout, setCheckout] = useState(null)
  const [bookOverrides, setBookOverrides] = useState({})

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'books'), snap => {
      const overrides = {}
      snap.docs.forEach(d => { overrides[d.id] = d.data() })
      setBookOverrides(overrides)
    })
    return unsub
  }, [])

  const BOOKS = STATIC_BOOKS.map(b => ({ ...b, ...(bookOverrides[b.id] || {}) }))
  const paid = BOOKS.filter(b => !b.free)
  const free = BOOKS.filter(b => b.free)

  return (
    <div className="meer">
      <div className="screen-header meer-header">
        <h1>E-boeke</h1>
        <div className="subtitle">DEUR DEWALD SCHEEPERS</div>
        <p>Lees op enige toestel. Na betaling stuur ons die PDF dadelik na jou e-pos.</p>
      </div>

      <div className="meer-body">
        {/* Free section */}
        <div className="meer-section">
          <div className="section-header">
            <h3 className="section-title">🎁 Gratis Aflaai</h3>
            <span className="section-count">{free.length} boeke</span>
          </div>
          <div className="book-list">
            {free.map(b => <FreeCard key={b.id} book={b} />)}
          </div>
        </div>

        <div className="divider" />

        {/* Paid section */}
        <div className="meer-section">
          <div className="section-header">
            <h3 className="section-title">📚 Winkel</h3>
            <span className="section-count">{paid.length} boeke</span>
          </div>
          <div className="book-list">
            {paid.map(b => (
              <BookCard key={b.id} book={b} onBuy={setCheckout} />
            ))}
          </div>
        </div>
      </div>

      {checkout && (
        <CheckoutModal book={checkout} onClose={() => setCheckout(null)} />
      )}
    </div>
  )
}
