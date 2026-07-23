import { useState } from 'react'
import { checkoutSubscription } from '../utils/payfast'
import './HoopVennoot.css'

const PRESET_AMOUNTS = [30, 50, 100, 200]

export default function HoopVennoot({ onClose }) {
  const [selected, setSelected]   = useState(50)
  const [custom, setCustom]       = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [email, setEmail]         = useState('')
  const [busy, setBusy]           = useState(false)
  const [error, setError]         = useState('')

  const amount = showCustom && custom ? Number(custom) : selected

  function pay() {
    if (!amount || amount < 30) {
      setError('Minimum bedrag is R30 per maand.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Voer asb 'n geldige e-posadres in.")
      return
    }
    setBusy(true)
    checkoutSubscription(amount, email)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card hv-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="hv-icon">🌿</div>
        <h3 className="modal-title">Word 'n Maandelikse Hoop-Vennoot</h3>

        <p className="hv-desc">
          Daaglikse Hoop word elke dag gratis uitgestuur om mense te bemoedig, vir hulle te bid en hulle nader aan God se Woord te bring.
        </p>
        <p className="hv-purpose">
          Jou maandelikse bydrae help dat mense wat swaarkry elke dag hoop, gebed en God se Woord gratis kan ontvang.
        </p>

        <p className="modal-label">Kies 'n bedrag waarmee jy gemaklik is</p>

        <div className="amount-grid">
          {PRESET_AMOUNTS.map(a => (
            <button
              key={a}
              className={`amount-btn${selected === a && !showCustom ? ' selected' : ''}`}
              onClick={() => { setSelected(a); setShowCustom(false); setCustom(''); setError('') }}
            >
              R{a}/mnd
            </button>
          ))}
          <button
            className={`amount-btn${showCustom ? ' selected' : ''}`}
            onClick={() => { setShowCustom(true); setError('') }}
          >
            Eie bedrag
          </button>
        </div>

        {showCustom && (
          <input
            className="modal-input amount-input"
            type="number"
            placeholder="Bedrag per maand (min. R30)"
            value={custom}
            min={30}
            autoFocus
            onChange={e => { setCustom(e.target.value); setError('') }}
          />
        )}

        <p className="modal-label">Jou e-posadres</p>
        <input
          className="modal-input"
          type="email"
          placeholder="naam@epos.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setError('') }}
        />

        <div className="hv-monthly-note">
          Jou bydrae loop maandeliks en jy kan enige tyd kanselleer.
        </div>

        {error && <p className="modal-error">{error}</p>}

        <button className="btn-primary modal-pay-btn hv-pay-btn" onClick={pay} disabled={busy}>
          {busy ? 'Besig...' : `Begin maandelikse bydrae${amount ? ` — R${amount}/mnd` : ''}`}
        </button>

        <p className="modal-secure">🔒 Veilig betaal met PayFast</p>

        <div className="hv-cancel-section">
          <p className="hv-cancel-title">Wil jy jou maandelikse bydrae kanselleer?</p>
          <p className="hv-cancel-text">
            Stuur vir ons 'n WhatsApp met die woord <strong>KANSELLEER</strong> na{' '}
            <a className="hv-wa-link" href="https://wa.me/27636998098?text=KANSELLEER" target="_blank" rel="noreferrer">
              063 699 8098
            </a>
            , en ons sal jou Hoop-Vennoot bydrae stop.
          </p>
        </div>
      </div>
    </div>
  )
}
