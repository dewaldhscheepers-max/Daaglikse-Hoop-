import { useState, useEffect, useRef } from 'react'
import { BOOKS as STATIC_BOOKS } from '../data/books'

const STATIC_IDS = new Set(STATIC_BOOKS.map(b => b.id))
import { checkoutCart } from '../utils/payfast'
import { db } from '../firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import './Meer.css'

function validate(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

/* ── Cart modal ── */
function CartModal({ books, total, onClose }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy,  setBusy]  = useState(false)

  function pay() {
    if (!validate(email)) { setError("Voer asb 'n geldige e-posadres in."); return }
    setBusy(true)
    checkoutCart(books, email)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <h3 className="modal-title">Jou Mandjie 🛒</h3>
        <p className="modal-note">{books.length} boek{books.length > 1 ? 'e' : ''} geselekteer</p>

        <div className="cart-book-list">
          {books.map(b => (
            <div key={b.id} className="cart-book-row">
              <span className="cart-book-emoji">{b.emoji}</span>
              <span className="cart-book-title">{b.title}</span>
              <span className="cart-book-price">R{b.price}</span>
            </div>
          ))}
          <div className="cart-total-row">
            <span>Totaal</span>
            <span className="cart-total-amount">R{total}</span>
          </div>
        </div>

        <p className="modal-note" style={{ marginTop: 4 }}>
          Na betaling stuur ons die PDF{books.length > 1 ? "'s" : ''} <strong>outomaties</strong> na jou e-pos. Geen wag nie.
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

        <button className="btn-primary modal-pay-btn" onClick={pay} disabled={busy}>
          {busy ? 'Besig...' : `Betaal R${total} via PayFast`}
        </button>

        <p className="modal-secure">🔒 Veilige betaling · Kaart, EFT, SnapScan</p>

        <div className="eft-divider"><span>of</span></div>

        <div className="eft-option">
          <p className="eft-label">Verkies direkte EFT?</p>
          <a className="eft-email" href={
            `mailto:info@dewaldscheepers.com?subject=${encodeURIComponent('EFT Betaling — E-boeke')}&body=${encodeURIComponent(
              `Hallo Dewald,\n\nEk wil graag die volgende boeke bestel:\n${books.map(b => `- ${b.title} (R${b.price})`).join('\n')}\n\nTotaal: R${total}\n\nEk sal bewys van betaling aanheg.\n\nMy e-posadres:`
            )}`
          }>
            info@dewaldscheepers.com
          </a>
          <p className="eft-note">Stuur bewys van betaling en jou e-posadres — ons stuur die PDF handmatig.</p>
        </div>
      </div>
    </div>
  )
}

/* ── Cart bar ── */
function CartBar({ count, total, onClick }) {
  if (count === 0) return null
  return (
    <div className="cart-bar" onClick={onClick}>
      <div className="cart-bar-left">
        <span className="cart-bar-badge">{count}</span>
        <span className="cart-bar-label">{count} boek{count > 1 ? 'e' : ''} in mandjie</span>
      </div>
      <div className="cart-bar-right">
        <span className="cart-bar-total">R{total}</span>
        <span className="cart-bar-btn">Betaal →</span>
      </div>
    </div>
  )
}

/* ── Book card ── */
function BookCard({ book, inCart, onToggle }) {
  return (
    <div className={`book-card${inCart ? ' in-cart' : ''}`}>
      <div className="book-cover" style={{ background: book.coverUrl ? 'transparent' : book.color }}>
        {book.coverUrl
          ? <img src={book.coverUrl} className="book-cover-img" alt={book.title} />
          : <span className="book-emoji">{book.emoji}</span>}
        {book.price === 105 && !inCart && <span className="book-badge">Gewild</span>}
        {inCart && <span className="book-badge cart-check">✓</span>}
      </div>
      <div className="book-info">
        <h4 className="book-title">{book.title}</h4>
        <p className="book-desc">{book.desc}</p>
        <div className="book-footer">
          <span className="book-price">R{book.price}</span>
          <button
            className={`book-buy-btn ${inCart ? 'btn-in-cart' : 'btn-primary'}`}
            onClick={() => onToggle(book.id)}
          >
            {inCart ? '✓ Geselekteer' : 'Voeg by'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Free book card ── */
function FreeCard({ book }) {
  function download() {
    if (book.pdfUrl) window.open(book.pdfUrl, '_blank')
    else alert('Hierdie boek word binnekort beskikbaar. Kontak ons by info@dewaldscheepers.com')
  }

  return (
    <div className="book-card free">
      <div className="book-cover" style={{ background: book.coverUrl ? 'transparent' : book.color }}>
        {book.coverUrl
          ? <img src={book.coverUrl} className="book-cover-img" alt={book.title} />
          : <span className="book-emoji">{book.emoji}</span>}
        <span className="book-badge free-badge">GRATIS</span>
      </div>
      <div className="book-info">
        <h4 className="book-title">{book.title}</h4>
        <p className="book-desc">{book.desc}</p>
        <div className="book-footer">
          <span className="book-price free-price">Gratis</span>
          <button className="btn-free book-buy-btn" onClick={download}>Aflaai PDF</button>
        </div>
      </div>
    </div>
  )
}

/* ── Main screen ── */
export default function Meer({ targetBookId, onScrolled }) {
  const [cart,          setCart]          = useState([])
  const [showCart,      setShowCart]      = useState(false)
  const [bookOverrides, setBookOverrides] = useState({})

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

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'books'), snap => {
      const overrides = {}
      snap.docs.forEach(d => { overrides[d.id] = d.data() })
      setBookOverrides(overrides)
    })
    return unsub
  }, [])

  const BOOKS = [
    ...STATIC_BOOKS.map(b => {
      const ov = bookOverrides[b.id] || {}
      return { ...b, pdfUrl: ov.pdfUrl ?? b.pdfUrl ?? null, coverUrl: ov.coverUrl ?? null }
    }),
    ...Object.entries(bookOverrides)
      .filter(([id, d]) => !STATIC_IDS.has(id) && d.title)
      .map(([id, d]) => ({ id, color: '#EDE8F8', emoji: '📚', price: 0, free: false, ...d }))
  ]
  const paid = BOOKS.filter(b => !b.free)
  const free = BOOKS.filter(b => b.free)
  const cartBooks = paid.filter(b => cart.includes(b.id))
  const total     = cartBooks.reduce((sum, b) => sum + b.price, 0)

  function toggleCart(id) {
    setCart(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <div className="meer">
      <div className="screen-header meer-header">
        <h1>E-boeke</h1>
        <div className="subtitle">DEUR DEWALD SCHEEPERS</div>
        <p>Voeg boeke by jou mandjie en betaal alles saam. PDFs word outomaties na jou e-pos gestuur.</p>
      </div>

      <div className="meer-body">
        <div className="meer-section">
          <div className="section-header">
            <h3 className="section-title">🎁 Gratis Aflaai</h3>
            <span className="section-count">{free.length} boeke</span>
          </div>
          <div className="book-list">
            {free.map(b => (
              <div key={b.id} id={`book-${b.id}`}>
                <FreeCard book={b} />
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        <div className="meer-section" style={{ paddingBottom: cart.length ? 80 : 20 }}>
          <div className="section-header">
            <h3 className="section-title">📚 Winkel</h3>
            <span className="section-count">{paid.length} boeke</span>
          </div>
          <div className="book-list">
            {paid.map(b => (
              <div key={b.id} id={`book-${b.id}`}>
                <BookCard book={b} inCart={cart.includes(b.id)} onToggle={toggleCart} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <CartBar count={cartBooks.length} total={total} onClick={() => setShowCart(true)} />

      {showCart && (
        <CartModal books={cartBooks} total={total} onClose={() => setShowCart(false)} />
      )}
    </div>
  )
}
