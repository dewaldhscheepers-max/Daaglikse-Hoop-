import { useState, useEffect, useRef } from 'react'
import './SaturdayVideoCard.css'
import { db } from '../firebase'
import { doc, onSnapshot, setDoc, increment } from 'firebase/firestore'
import { spelerAdres } from '../data/tiktokId'
import { stelKlank, isTiktokBoodskap } from '../data/tiktokKlank'

/* `bron` is 'youtube' of 'tiktok' (src/data/videoBron.js). Elke video wat voor
   26 Oktober 2026 gestoor is, dra geen `bron` nie en is YouTube. */
export default function SaturdayVideoCard({ videoId, bron, title, subtitle, onNavigate }) {
  const isTiktok = bron === 'tiktok'
  const raamRef = useRef(null)
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

  /* ── TikTok se klank ──
   *
   * Hulle speler begin ALTYD gedemp, ook ná 'n tik. Dieselfde boodskappe as die
   * Reels-voer (src/data/tiktokKlank.js, met die hele rede daar): by die raam se
   * `load`, by hulle EERSTE antwoord, en op 'n kort, begrensde ry tydhouers —
   * nooit 'n interval nie. Die tik op die duimnael is die aanraking wat die
   * blaaier vra; `allow="autoplay"` gee dit aan die raam deur. */
  useEffect(() => {
    if (!isTiktok || !speel) return
    const raam = raamRef.current
    if (!raam) return
    const stuur = () => stelKlank(raam.contentWindow, true)
    let geantwoord = false
    function opBoodskap(e) {
      if (!isTiktokBoodskap(e) || geantwoord) return
      geantwoord = true
      stuur()
    }
    window.addEventListener('message', opBoodskap)
    raam.addEventListener('load', stuur)
    const ts = [200, 600, 1200, 2000, 3500].map(ms => setTimeout(stuur, ms))
    return () => {
      window.removeEventListener('message', opBoodskap)
      raam.removeEventListener('load', stuur)
      ts.forEach(clearTimeout)
    }
  }, [isTiktok, speel])

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
        {speel && isTiktok ? (
          <iframe
            ref={raamRef}
            src={spelerAdres(videoId, { speel: true })}
            title={title || 'Naweekgebed vir jou'}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : speel ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&playsinline=1&autoplay=1`}
            title={title || 'Naweekgebed vir jou'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            className={`saturday-duim${isTiktok ? ' saturday-duim-tiktok' : ''}`}
            onClick={() => setSpeel(true)}
            aria-label={`Speel ${title || 'die videogebed'}`}
            /* TikTok gee nie 'n duimnael by 'n vaste adres nie (YouTube wel),
               dus kry 'n TikTok-video die kaart se eie grond en die
               speelknoppie. 'n Geraaide prent-adres sou 'n gat wys. */
            style={isTiktok ? undefined : { backgroundImage: `url(https://i.ytimg.com/vi/${videoId}/hqdefault.jpg)` }}
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
