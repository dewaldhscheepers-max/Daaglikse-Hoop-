import './WelcomeModal.css'

export default function WelcomeModal({ onClose }) {
  return (
    <div className="welcome-backdrop" onClick={onClose}>
      <div className="welcome-card" onClick={e => e.stopPropagation()}>

        <div className="welcome-photo">
          <img src="/bidsaam-bg.png" alt="Dewald Scheepers" />
          <div className="welcome-photo-overlay" />
        </div>

        <div className="welcome-body">
          <div className="welcome-greeting">Hallo, ek is bly jy is hier 👋</div>

          <h2 className="welcome-title">Welkom by Daaglikse Hoop</h2>

          <p className="welcome-msg">
            Elke oggend laai ek 'n kort stemnota op — 'n boodskap van hoop, geloof en bemoediging
            vir jou dag. Geen lang preke nie. Net 'n oomblik met God.
          </p>

          <p className="welcome-sig">— Dewald Scheepers</p>

          <button className="btn-primary welcome-btn" onClick={onClose}>
            Kom ons begin 🙏
          </button>
        </div>

      </div>
    </div>
  )
}
