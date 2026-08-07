import { useState } from 'react'
import { checkoutBook } from '../utils/payfast'
import NooimyModal from '../components/NooimyModal'
import './Webtuiste.css'

const PRESET_AMOUNTS = [50, 100, 250, 1000]

export function DonationModal({ onClose, beginBedrag = null }) {
  const preset = PRESET_AMOUNTS.includes(beginBedrag) ? beginBedrag : null
  const [selected, setSelected] = useState(preset || 100)
  const [custom, setCustom]     = useState('')
  /* Sien HoopVennoot: 'n bedrag wat nie 'n knoppie is nie, maak die eie-veld
     dadelik oop sodat niemand twee keer hoef te kies nie. */
  const [showCustom, setShowCustom] = useState(beginBedrag != null && preset === null)
  const [showEft, setShowEft]   = useState(false)
  const [email, setEmail]       = useState('')
  const [error, setError]       = useState('')
  const [busy, setBusy]         = useState(false)

  const amount = showCustom && custom ? Number(custom) : selected

  function validate() {
    if (!amount || amount < 10) { setError('Minimum skenking is R10.'); return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Voer asb 'n geldige e-posadres in."); return false }
    return true
  }

  function pay() {
    if (!validate()) return
    setBusy(true)
    checkoutBook(
      { id: 'skenking', title: 'Skenking — Daaglikse Hoop', desc: 'Skenking vir die bediening van Daaglikse Hoop', price: amount },
      email,
      'donation'
    )
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card donation-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="donation-icon">❤️</div>
        <h3 className="modal-title">Ondersteun die Bediening</h3>
        <p className="donation-purpose">
          Help ons om daaglikse hoop by meer mense te kry. Jou bydrae help met stemnotas, tegnologie, advertensies en gratis geestelike hulpbronne.
        </p>
        <p className="donation-verse">"Elke gewer wat vrolik gee, is vir God aangenaam." — 2 Kor. 9:7</p>

        <p className="modal-label">Kies 'n bedrag</p>
        <div className="amount-grid">
          {PRESET_AMOUNTS.map(a => (
            <button
              key={a}
              className={`amount-btn${selected === a && !showCustom ? ' selected' : ''}`}
              onClick={() => { setSelected(a); setShowCustom(false); setCustom(''); setError('') }}
            >
              R{a}
            </button>
          ))}
          <button
            className={`amount-btn${showCustom ? ' selected' : ''}`}
            onClick={() => { setShowCustom(true); setError('') }}
          >
            Ander
          </button>
        </div>

        {showCustom && (
          <input
            className="modal-input amount-input"
            type="number"
            placeholder="Tik bedrag (bv. 350)"
            value={custom}
            min={10}
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

        {error && <p className="modal-error">{error}</p>}

        <button className="btn-primary modal-pay-btn donate-btn" onClick={pay} disabled={busy}>
          {busy ? 'Besig...' : `Skenk R${amount || '?'} via PayFast`}
        </button>

        <p className="modal-secure">🔒 Kaart, EFT, SnapScan · Veilige betaling via PayFast</p>

        <button className="eft-toggle" onClick={() => setShowEft(v => !v)}>
          {showEft ? '▲ Verberg' : '▼ Skenk via direkte EFT'}
        </button>

        {showEft && (
          <div className="eft-details">
            <p className="eft-row"><span>Bank</span><strong>Capitec</strong></p>
            <p className="eft-row"><span>Naam</span><strong>Dewald Scheepers</strong></p>
            <p className="eft-row"><span>Rekening</span><strong>2427361174</strong></p>
            <p className="eft-row"><span>Tak-kode</span><strong>470010</strong></p>
            <p className="eft-note">Gebruik jou selfoonnommer as verwysing.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Webtuiste({ onNavigate }) {
  const [showDonation, setShowDonation] = useState(false)
  const [showNooimy, setShowNooimy]     = useState(false)

  return (
    <div className="webtuiste">
      <div className="webtuiste-header screen-header">
        <div className="cross-icon">✝</div>
        <h1>Webtuiste</h1>
        <div className="subtitle">BRONNE VAN HOOP EN BEMOEDIGING</div>
      </div>

      <div className="webtuiste-body">
        {/* Welcome card */}
        <div className="card welcome-card">
          <div className="welcome-logo">DH</div>
          <h2>Dewald Scheepers</h2>
          <p>Daaglikse stemnotas, gebed en geestelike hulpbronne vir elke oggend.</p>
        </div>

        {/* Skenking — EERSTE (bo-aan) */}
        <button className="link-card in-app-link donation-link" onClick={() => setShowDonation(true)}>
          <div className="link-icon" style={{ background: '#FFF0F3' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#E05A7A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <div className="link-text">
            <span className="link-title">Maak 'n Skenking</span>
            <span className="link-desc">Ondersteun die bediening van Daaglikse Hoop.</span>
          </div>
          <svg className="link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        {/* Nooi my — in-app form */}
        <button className="link-card in-app-link" onClick={() => setShowNooimy(true)}>
          <div className="link-icon" style={{ background: '#F8EDE8' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div className="link-text">
            <span className="link-title">Nooi My Om Te Preek</span>
            <span className="link-desc">Vra my om by jou gemeente of geleentheid te kom praat.</span>
          </div>
          <svg className="link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        {/* E-boeke — LAASTE (onder-aan) */}
        <button className="link-card in-app-link" onClick={() => onNavigate('meer')}>
          <div className="link-icon" style={{ background: '#EDE8F8' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div className="link-text">
            <span className="link-title">E-boeke</span>
            <span className="link-desc">Koop of laai gratis e-boeke af.</span>
          </div>
          <svg className="link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        <p className="closing-verse">
          "Mag hierdie bronne jou geloof versterk<br/>en jou hart aanmoedig."
        </p>
      </div>

      {showDonation && <DonationModal onClose={() => setShowDonation(false)} />}
      {showNooimy  && <NooimyModal   onClose={() => setShowNooimy(false)} />}
    </div>
  )
}
