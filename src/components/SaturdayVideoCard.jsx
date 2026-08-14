import { useState, useEffect } from 'react'
import './SaturdayVideoCard.css'
import { db } from '../firebase'
import { doc, onSnapshot, setDoc, increment } from 'firebase/firestore'

export default function SaturdayVideoCard({ videoId, title, subtitle, onNavigate }) {
  const amenKey = `amened_video_${videoId}`
  const [amenSaid, setAmenSaid] = useState(() => {
    try { return localStorage.getItem(amenKey) === '1' } catch { return false }
  })
  const [amenCount, setAmenCount] = useState(0)
  const [speel, setSpeel] = useState(false)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'saturdayVideo'), snap => {
      if (snap.exists()) setAmenCount(snap.data().amenCount || 0)
    })
    return unsub
  }, [])

  async function handleAmen() {
    if (amenSaid) return
    setAmenSaid(true)
    setAmenCount(c => c + 1)
    try { localStorage.setItem(amenKey, '1') } catch {}
    try {
      await setDoc(doc(db, 'config', 'saturdayVideo'), { amenCount: increment(1) }, { merge: true })
    } catch {}
  }

  return (
    <div className="saturday-card">
      <span className="saturday-badge">🙏 Videogebed</span>
      <h2 className="saturday-title">{title || 'Naweekgebed vir jou'}</h2>
      {subtitle && <p className="saturday-sub">{subtitle}</p>}
      {/* ── Die duimnael, nie die speler nie ──

          Die iframe het dadelik gelaai en op 'n swak sein was dit sekondes
          lank 'n leë swart of wit blok — en 'n leë blok lyk soos 'n stukkende
          app, nie soos iets wat laai nie. 'n Swak sein is in Suid-Afrika die
          gewone geval.

          Nou wys ons YouTube se eie duimnael (een prentjie, 'n paar
          kilogreep) met 'n speelknoppie daarop, en ruil dit vir die speler
          by die eerste druk. Dieselfde patroon as SorgVideo, wat al maande
          so werk. */}
      <div className="saturday-video-wrap">
        {speel ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&playsinline=1&autoplay=1`}
            title={title || 'Naweekgebed vir jou'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            className="saturday-duim"
            onClick={() => setSpeel(true)}
            aria-label={`Speel ${title || 'die videogebed'}`}
            style={{ backgroundImage: `url(https://i.ytimg.com/vi/${videoId}/hqdefault.jpg)` }}
          >
            <span className="saturday-duim-speel" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
                <polygon points="7,4 20,12 7,20" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <div className="saturday-actions">
        <button
          className={`saturday-amen-btn${amenSaid ? ' amen-done' : ''}`}
          onClick={handleAmen}
        >
          {amenSaid ? '🙏 Amen gesê ✓' : '🙏 Amen'}
          {amenCount > 0 && <span className="saturday-amen-count">{amenCount.toLocaleString()}</span>}
        </button>
        {onNavigate && (
          <button className="saturday-prayer-btn" onClick={() => onNavigate('bidsaam')}>
            Plaas 'n gebedsversoek
          </button>
        )}
      </div>
    </div>
  )
}
