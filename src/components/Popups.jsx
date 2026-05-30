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

export function SharePopup({ onShare, onLater }) {
  return (
    <div className="popup-backdrop" onClick={onLater}>
      <div className="popup-card" onClick={e => e.stopPropagation()}>
        <button className="popup-x" onClick={onLater}>✕</button>
        <div className="popup-icon">🌱</div>
        <h3 className="popup-title">Ken jy iemand wat hoop nodig het?</h3>
        <p className="popup-body">
          As Daaglikse Hoop jou gehelp het, deel asseblief die app met iemand wat ook elke oggend 'n woord van hoop nodig het.
        </p>
        <button className="popup-btn-primary" onClick={onShare}>Deel die app</button>
        <button className="popup-btn-secondary" onClick={onLater}>Later</button>
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
