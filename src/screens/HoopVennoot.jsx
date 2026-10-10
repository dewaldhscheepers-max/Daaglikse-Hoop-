import { useState } from 'react'
import { checkoutSubscription } from '../utils/payfast'
import EftBesonderhede from '../components/EftBesonderhede'
import './HoopVennoot.css'

const PRESET_AMOUNTS = [30, 50, 100, 200]

/* Twee tale — die Engelse e-boekblad maak hierdie venster in Engels oop. Die
   PayFast-intekening bly presies dieselfde; net die woorde skuif. */
const WOORDE = {
  af: {
    titel: "Word 'n Maandelikse Hoop-Vennoot",
    desc: 'Daaglikse Hoop word elke dag gratis uitgestuur om mense te bemoedig, vir hulle te bid en hulle nader aan God se Woord te bring.',
    doel: 'Jou maandelikse bydrae help dat mense wat swaarkry elke dag hoop, gebed en God se Woord gratis kan ontvang.',
    kies: "Kies 'n bedrag waarmee jy gemaklik is",
    permaand: a => `R${a}/mnd`, eie: 'Eie bedrag',
    eiePlek: 'Bedrag per maand (min. R30)',
    epos: 'Jou e-posadres', eposPlek: 'naam@epos.com',
    nota: 'Jou bydrae loop maandeliks en jy kan enige tyd kanselleer.',
    foutMin: 'Minimum bedrag is R30 per maand.', foutEpos: "Voer asb 'n geldige e-posadres in.",
    besig: 'Besig...', begin: a => `Begin maandelikse bydrae${a ? ` — R${a}/mnd` : ''}`,
    veilig: '🔒 Veilig betaal met PayFast',
    kanselTitel: 'Wil jy jou maandelikse bydrae kanselleer?',
    kanselWoord: 'KANSELLEER',
    kanselVoor: <>Stuur vir ons 'n WhatsApp met die woord </>,
    kanselNa: ', en ons sal jou Hoop-Vennoot bydrae stop.',
  },
  en: {
    titel: 'Become a Monthly Hope Partner',
    desc: "Daaglikse Hoop goes out free every day to encourage people, pray for them and bring them closer to God's Word.",
    doel: "Your monthly gift helps people who are struggling receive hope, prayer and God's Word free every day.",
    kies: "Choose an amount you're comfortable with",
    permaand: a => `R${a}/mo`, eie: 'Own amount',
    eiePlek: 'Amount per month (min. R30)',
    epos: 'Your email address', eposPlek: 'name@email.com',
    nota: 'Your gift runs monthly and you can cancel at any time.',
    foutMin: 'Minimum is R30 per month.', foutEpos: 'Please enter a valid email address.',
    besig: 'Working...', begin: a => `Start monthly gift${a ? ` — R${a}/mo` : ''}`,
    veilig: '🔒 Secure payment with PayFast',
    kanselTitel: 'Want to cancel your monthly gift?',
    kanselWoord: 'CANCEL',
    kanselVoor: <>Send us a WhatsApp with the word </>,
    kanselNa: ", and we'll stop your Hope Partner contribution.",
  },
}

/* `beginBedrag` kom van die Ondersteun-blad op Pastorale Sorg, waar 'n mens
   die bedrag REEDS gekies het. Sonder dit sou hy dit twee keer moes kies, en
   die tweede keuse maak die eerste een 'n leuen. Niks gestuur nie, dan begin
   dit soos altyd. */
export default function HoopVennoot({ onClose, beginBedrag = null, taal = 'af' }) {
  const w = WOORDE[taal] || WOORDE.af
  const preset = PRESET_AMOUNTS.includes(beginBedrag) ? beginBedrag : null
  const [selected, setSelected]   = useState(preset || 50)
  const [custom, setCustom]       = useState('')
  /* Is 'n bedrag gevra wat NIE 'n knoppie is nie — of "Eie bedrag" — maak
     die eie-veld dadelik oop. */
  const [showCustom, setShowCustom] = useState(beginBedrag !== null && preset === null)
  const [email, setEmail]         = useState('')
  const [busy, setBusy]           = useState(false)
  const [error, setError]         = useState('')

  const amount = showCustom && custom ? Number(custom) : selected

  function pay() {
    if (!amount || amount < 30) {
      setError(w.foutMin)
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(w.foutEpos)
      return
    }
    setBusy(true)
    checkoutSubscription(amount, email, { taal })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card hv-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="hv-icon">🌿</div>
        <h3 className="modal-title">{w.titel}</h3>

        <p className="hv-desc">{w.desc}</p>
        <p className="hv-purpose">{w.doel}</p>

        <p className="modal-label">{w.kies}</p>

        <div className="amount-grid">
          {PRESET_AMOUNTS.map(a => (
            <button
              key={a}
              className={`amount-btn${selected === a && !showCustom ? ' selected' : ''}`}
              onClick={() => { setSelected(a); setShowCustom(false); setCustom(''); setError('') }}
            >
              {w.permaand(a)}
            </button>
          ))}
          <button
            className={`amount-btn${showCustom ? ' selected' : ''}`}
            onClick={() => { setShowCustom(true); setError('') }}
          >
            {w.eie}
          </button>
        </div>

        {showCustom && (
          <input
            className="modal-input amount-input"
            type="number"
            placeholder={w.eiePlek}
            value={custom}
            min={30}
            autoFocus
            onChange={e => { setCustom(e.target.value); setError('') }}
          />
        )}

        <p className="modal-label">{w.epos}</p>
        <input
          className="modal-input"
          type="email"
          placeholder={w.eposPlek}
          value={email}
          onChange={e => { setEmail(e.target.value); setError('') }}
        />

        <div className="hv-monthly-note">{w.nota}</div>

        {error && <p className="modal-error">{error}</p>}

        <button className="btn-primary modal-pay-btn hv-pay-btn" onClick={pay} disabled={busy}>
          {busy ? w.besig : w.begin(amount)}
        </button>

        <p className="modal-secure">{w.veilig}</p>

        {/* Dewald: "by maandeliks wys dit nie eers nie." 'n Maandelikse EFT is
            'n debietorder wat 'n mens by sy EIE bank opstel — vir baie mense
            is dit die manier waarop hulle reeds gee, en dit vat geen snytjie
            nie. Dieselfde komponent as die eenmalige vorm s'n. */}
        <EftBesonderhede maandeliks taal={taal} />

        <div className="hv-cancel-section">
          <p className="hv-cancel-title">{w.kanselTitel}</p>
          <p className="hv-cancel-text">
            {w.kanselVoor}<strong>{w.kanselWoord}</strong> {taal === 'en' ? 'to' : 'na'}{' '}
            <a className="hv-wa-link" href={`https://wa.me/27636998098?text=${w.kanselWoord}`} target="_blank" rel="noreferrer">
              063 699 8098
            </a>
            {w.kanselNa}
          </p>
        </div>
      </div>
    </div>
  )
}
