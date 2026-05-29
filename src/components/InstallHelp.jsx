import './PopupStyles.css'
import './InstallHelp.css'

function detectBrowser() {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/.test(ua) && !window.MSStream) return 'ios'
  if (/SamsungBrowser/.test(ua)) return 'samsung'
  return 'chrome'
}

function ChromeSteps() {
  return (
    <div className="install-help-section">
      <div className="install-help-browser">Android Chrome</div>
      <ol className="install-steps">
        <li className="install-step">Tik die &#8942; knoppie regs bo in Chrome</li>
        <li className="install-step">Kies "Voeg by tuisskerm"</li>
        <li className="install-step">Tik "Installeer" — klaar!</li>
      </ol>
    </div>
  )
}

function SamsungSteps() {
  return (
    <div className="install-help-section">
      <div className="install-help-browser">Samsung Internet</div>
      <ol className="install-steps">
        <li className="install-step">Tik die &#9776; knoppie regs onder op jou skerm</li>
        <li className="install-step">Tik "Voeg by"</li>
        <li className="install-step">Kies "Tuisskerm"</li>
        <li className="install-step">Tik "Voeg by" om te bevestig — klaar!</li>
      </ol>
      <div className="install-help-tip">
        Tip: Of maak die skakel oop in Chrome vir makliker installasie
      </div>
    </div>
  )
}

function IosSteps() {
  return (
    <div className="install-help-section">
      <div className="install-help-browser">iPhone/iPad (Safari)</div>
      <ol className="install-steps">
        <li className="install-step">Maak die bladsy oop in Safari</li>
        <li className="install-step">Tik die &#9633;&#8593; knoppie onderaan jou skerm</li>
        <li className="install-step">Blaai af en tik "Voeg by tuisskerm"</li>
        <li className="install-step">Tik "Voeg by" regs bo — klaar!</li>
      </ol>
    </div>
  )
}

const SECTIONS = {
  chrome:  <ChromeSteps />,
  samsung: <SamsungSteps />,
  ios:     <IosSteps />,
}

export default function InstallHelp({ onClose }) {
  const current = detectBrowser()
  const others = Object.keys(SECTIONS).filter(k => k !== current)

  return (
    <div className="popup-backdrop" onClick={onClose}>
      <div
        className="popup-card"
        style={{ maxHeight: '80vh', overflowY: 'auto', textAlign: 'left' }}
        onClick={e => e.stopPropagation()}
      >
        <button className="popup-x" onClick={onClose}>&#10005;</button>

        <h3 className="popup-title" style={{ textAlign: 'center', width: '100%' }}>
          Hoe sit ek dit op my foon?
        </h3>

        {/* Current browser section — prominent */}
        {SECTIONS[current]}

        {/* Other browsers — compact */}
        <hr className="install-help-divider" />
        <div className="install-help-browser" style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Ander blaaiers
        </div>
        {others.map(key => (
          <div key={key}>
            {SECTIONS[key]}
          </div>
        ))}

        <p className="install-help-note">
          Na installasie maak dit oop soos 'n gewone app — sonder die blaaier.
        </p>

        <button className="popup-btn-primary" onClick={onClose} style={{ marginTop: 4 }}>
          Verstaan
        </button>
      </div>
    </div>
  )
}
