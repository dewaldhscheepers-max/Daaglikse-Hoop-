import { useState, useEffect, useRef } from 'react'
import './SaturdayVideoCard.css'
import { db } from '../firebase'
import { doc, onSnapshot, setDoc, increment } from 'firebase/firestore'
import { spelerAdres } from '../data/tiktokId'
import { stelKlank, isTiktokBoodskap } from '../data/tiktokKlank'

/* `bron` is 'youtube' of 'tiktok' (src/data/videoBron.js). Elke video wat voor
   26 Oktober 2026 gestoor is, dra geen `bron` nie en is YouTube.

   ── 'n TikTok-video wys TikTok se EIE speler, dadelik ──
   Dewald: *"Bestudeer die reels blad... en maak seker die preview wys."* Ons
   het TikTok se voorskouprent deur hulle oEmbed probeer haal, en dit het op sy
   foon nie gewerk nie. Die Reels-blad wys elke dag dat TikTok se speler self
   werk: met `autoplay=0` teken die speler die video se OMSLAG met 'n
   speelknoppie (Dewald het dit in Reels gesien: *"dit wys nou eers i play
   button"*). Dit IS die voorskou, en dit kom van TikTok self. */
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
   * Hulle speler begin ALTYD gedemp (src/data/tiktokKlank.js). Die mens druk
   * hulle EIE speelknoppie, BINNE hulle raam, en daardie druk sien ons nie —
   * behalwe dat die venster sy fokus aan die raam afgee (`blur`, met die raam
   * as `document.activeElement`). Dan stuur ons die ontdemp-boodskappe op 'n
   * kort, begrensde ry tydhouers, en een keer weer by hulle eerste antwoord
   * daarna. Nooit 'n interval nie, en nooit 'n antwoord op elke boodskap nie —
   * hulle speler antwoord op 'n opdrag, en dit sou 'n eindelose pingpong wees. */
  useEffect(() => {
    if (!isTiktok) return
    const raam = raamRef.current
    if (!raam) return
    let ts = []
    let wagVirAntwoord = false
    const stuur = () => stelKlank(raam.contentWindow, true)
    function opBlur() {
      if (document.activeElement !== raam) return
      ts.forEach(clearTimeout)
      ts = [0, 200, 600, 1200, 2000, 3500].map(ms => setTimeout(stuur, ms))
      wagVirAntwoord = true
    }
    function opBoodskap(e) {
      if (!wagVirAntwoord || !isTiktokBoodskap(e)) return
      wagVirAntwoord = false
      stuur()
    }
    window.addEventListener('blur', opBlur)
    window.addEventListener('message', opBoodskap)
    return () => {
      window.removeEventListener('blur', opBlur)
      window.removeEventListener('message', opBoodskap)
      ts.forEach(clearTimeout)
    }
  }, [isTiktok, videoId])

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
        {isTiktok ? (
          <iframe
            ref={raamRef}
            /* Presies die Reels-voer se speler, en NIE eers ná 'n tik nie. */
            src={spelerAdres(videoId, { speel: false })}
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
