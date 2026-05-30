import { useState, useEffect } from 'react'
import './PopupStyles.css'

export function DonationPopup({ onDonate, onClose }) {
  return (
    <div className="popup-backdrop" onClick={onClose}>
      <div className="popup-card" onClick={e => e.stopPropagation()}>
        <button className="popup-x" onClick={onClose}>✕</button>
        <div className="popup-icon">🙏</div>
        <h3 className="popup-title">Het Daaglikse Hoop jou hierdie maand gehelp?</h3>
        <p className="popup-body">
          As hierdie app vir jou hoop, vrede of krag gebring het, kan jy help dat ons meer mense bereik.
        </p>
        <p className="popup-body">
          Jou bydrae help ons om daaglikse stemnotas, gebed en geestelike hulpbronne beskikbaar te hou vir mense wat swaar dra.
        </p>
        <button className="popup-btn-primary" onClick={onDonate}>Maak 'n bydrae</button>
        <button className="popup-btn-secondary" onClick={onClose}>Nie nou nie</button>
      </div>
    </div>
  )
}

export function InstallPopup({ onInstall, onLater, onHelp }) {
  return (
    <div className="popup-backdrop" onClick={onLater}>
      <div className="popup-card" onClick={e => e.stopPropagation()}>
        <button className="popup-x" onClick={onLater}>✕</button>
        <div className="popup-icon">🏡</div>
        <h3 className="popup-title">Wil jy Daaglikse Hoop soos 'n gewone app oopmaak?</h3>
        <p className="popup-body">
          Sit dit op jou foon se tuisskerm, dan kan jy elke oggend maklik luister.
        </p>
        <button className="popup-btn-primary" onClick={onInstall}>Sit op my foon</button>
        <button className="popup-btn-secondary" onClick={onLater}>Later</button>
        <button
          className="popup-btn-secondary"
          onClick={onHelp}
          style={{ fontSize: 13, marginTop: -4 }}
        >
          Wys my hoe →
        </button>
      </div>
    </div>
  )
}

const SHARE_MSG = 'Ek dink hierdie app gaan jou help. Daaglikse Hoop gee elke oggend \'n kort boodskap van hoop, gebed en bemoediging.\n\nLaai dit hier af: https://daagliksehoop.vercel.app/go'
const WA_GROUP_URL = `https://wa.me/?text=${encodeURIComponent(SHARE_MSG)}`

export function SharePopup({ onShare, onDone, onLater }) {
  const [count, setCount] = useState(0)

  async function handleShare() {
    await onShare()
    setCount(c => c + 1)
  }

  if (count >= 3) {
    return (
      <div className="popup-backdrop" onClick={onDone}>
        <div className="popup-card" onClick={e => e.stopPropagation()}>
          <div className="popup-icon">🙏</div>
          <h3 className="popup-title">Baie dankie!</h3>
          <p className="popup-body">Jy het 3 mense gehelp om elke oggend hoop te ontvang. God seën jou daarvoor.</p>
          <button className="popup-btn-primary" onClick={onDone}>Klaar</button>
        </div>
      </div>
    )
  }

  const titles = [
    'Ken jy iemand wat hoop nodig het?',
    'Mooi! Dink aan nog iemand?',
    'Amper daar — laaste een?',
  ]
  const bodies = [
    'Dink aan 3 mense in jou lewe wat hierdie boodskap nodig het. Deel die app met elkeen — dit kan hulle dag verander.',
    "Een persoon het jy gehelp. Wie anders in jou lewe dra swaar en het 'n woord van hoop nodig?",
    'Nog een stuur en jy het 3 mense se oggend verander. Wie het jy nog nie gestuur nie?',
  ]

  return (
    <div className="popup-backdrop" onClick={onLater}>
      <div className="popup-card" onClick={e => e.stopPropagation()}>
        <button className="popup-x" onClick={onLater}>✕</button>
        <div className="popup-icon">🌱</div>

        <div className="share-dots">
          {[0, 1, 2].map(i => (
            <div key={i} className={`share-dot${i < count ? ' share-dot-filled' : ''}`} />
          ))}
        </div>

        <h3 className="popup-title">{titles[count]}</h3>
        <p className="popup-body">{bodies[count]}</p>

        <button className="popup-btn-primary" onClick={handleShare}>
          {count === 0 ? 'Deel die app 🙏' : 'Deel met nog een →'}
        </button>
        <a
          className="popup-btn-whatsapp"
          href={WA_GROUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => { setTimeout(onDone, 500) }}
        >
          💬 Stuur na 'n WhatsApp groep
        </a>
        <button className="popup-btn-secondary" onClick={count > 0 ? onDone : onLater}>
          {count > 0 ? 'Klaar' : 'Later'}
        </button>
      </div>
    </div>
  )
}

export function EbookPopup({ book, onView, onClose }) {
  return (
    <div className="popup-backdrop" onClick={onClose}>
      <div className="popup-card" onClick={e => e.stopPropagation()}>
        <button className="popup-x" onClick={onClose}>✕</button>
        <div className="popup-book-icon" style={{ background: book.color }}>
          <span>{book.emoji}</span>
        </div>
        <p className="popup-label">Nuwe e-boek beskikbaar</p>
        <h3 className="popup-title">{book.title}</h3>
        <p className="popup-body">{book.desc}</p>
        <button className="popup-btn-primary" onClick={onView}>Kyk na die e-boek</button>
        <button className="popup-btn-secondary" onClick={onClose}>Later</button>
      </div>
    </div>
  )
}
