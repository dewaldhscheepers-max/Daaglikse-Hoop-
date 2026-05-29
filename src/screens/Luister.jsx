import { useState, useRef, useEffect } from 'react'
import { db } from '../firebase'
import { doc, getDoc, setDoc, increment } from 'firebase/firestore'
import './Luister.css'

const SAMPLE_NOTES = [
  {
    id: '1',
    title: 'Hy Sien Jou Trane',
    scripture: 'Psalm 56:9',
    scriptureText: '"U tel my omswerwinge; berg my trane in u kruik."',
    series: 'God Sien Jou Trane',
    lengthSeconds: 312,
    audioUrl: null,
    isToday: true,
    color: '#EDE8F8'
  },
  {
    id: '2',
    title: 'Wanneer Jy Uitgeput Is',
    scripture: 'Matteus 11:28',
    scriptureText: '"Kom na My toe, almal wat vermoeid en belas is."',
    series: 'Rustelose Gedagtes',
    lengthSeconds: 284,
    audioUrl: null,
    isToday: false,
    color: '#F8EDE8'
  },
  {
    id: '3',
    title: 'Giftige Gedagtes',
    scripture: 'Romeine 12:2',
    scriptureText: '"Word verander deur die vernuwing van julle gemoed."',
    series: 'TOKSIES',
    lengthSeconds: 398,
    audioUrl: null,
    isToday: false,
    color: '#E8F0EE'
  }
]

function fmtTime(sec) {
  const m = Math.floor(sec / 60)
  const s = String(Math.floor(sec % 60)).padStart(2, '0')
  return `${m}:${s}`
}

function PlayIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="6,3 20,12 6,21"/>
    </svg>
  )
}
function PauseIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="5" y="3" width="4" height="18" rx="1"/>
      <rect x="15" y="3" width="4" height="18" rx="1"/>
    </svg>
  )
}
function SkipIcon({ direction = 'forward', seconds = 15 }) {
  const flip = direction === 'back' ? 'scale(-1,1)' : ''
  return (
    <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
      <g transform={flip ? `translate(36,0) ${flip}` : ''}>
        <path d="M18 6 A12 12 0 1 0 30 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <polyline points="28,10 30,18 22,18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </g>
      <text x="18" y="23" textAnchor="middle" fontSize="9" fontWeight="600" fill="currentColor" fontFamily="Inter,sans-serif">{seconds}</text>
    </svg>
  )
}
function HeartIcon({ filled = false, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}
function ShareIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  )
}

function MiniPlayer({ note, playing, progress, onToggle }) {
  if (!note) return null
  return (
    <div className="mini-player">
      <div className="mini-info">
        <span className="mini-title">{note.title}</span>
        <span className="mini-series">{note.series}</span>
      </div>
      <button className="mini-play" onClick={onToggle}>
        {playing ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
      </button>
      <div className="mini-bar">
        <div className="mini-fill" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  )
}

function NoteRow({ note, playing, onToggle, liked, likeCount, onLike }) {
  return (
    <div className="note-row">
      <div className="note-thumb" style={{ background: note.color }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
      </div>
      <div className="note-info">
        <span className="note-title">{note.title}</span>
        <span className="note-scripture">{note.scripture}</span>
        <span className="note-series">{note.series}</span>
      </div>
      <div className="note-right">
        <span className="note-length">{fmtTime(note.lengthSeconds)}</span>
        <button className="play-btn-small" onClick={onToggle}>
          {playing ? <PauseIcon size={13} /> : <PlayIcon size={13} />}
        </button>
        <button className={`note-like-btn ${liked ? 'liked' : ''}`} onClick={onLike}>
          <HeartIcon filled={liked} size={13} />
          {likeCount > 0 && <span>{likeCount}</span>}
        </button>
      </div>
    </div>
  )
}

export default function Luister({ onPlayingChange, installBanner }) {
  const [activeId, setActiveId]     = useState('1')
  const [playing, setPlaying]       = useState(false)
  const [elapsed, setElapsed]       = useState(0)
  const [likes, setLikes]           = useState({})
  const [liked, setLiked]           = useState(() => {
    try { return JSON.parse(localStorage.getItem('likedNotes') || '[]') }
    catch { return [] }
  })
  const [shareToast, setShareToast] = useState(false)
  const [playCount, setPlayCount]   = useState(0)
  const timerRef    = useRef(null)
  const audioRef    = useRef(null)
  const playedRef   = useRef(false)

  const today      = SAMPLE_NOTES.find(n => n.isToday)
  const recent     = SAMPLE_NOTES.filter(n => !n.isToday)
  const activeNote = SAMPLE_NOTES.find(n => n.id === activeId) || today
  const progress   = activeNote ? Math.min(elapsed / activeNote.lengthSeconds, 1) : 0
  const todayPlaying = playing && activeId === today.id

  // ── Fetch play count for today's note ──
  useEffect(() => {
    async function fetchPlayCount() {
      try {
        const d = await getDoc(doc(db, 'plays', today.id))
        if (d.exists()) setPlayCount(d.data().count || 0)
      } catch { /* offline */ }
    }
    fetchPlayCount()
  }, [])

  // ── Fetch like counts ──
  useEffect(() => {
    async function fetchLikes() {
      const counts = {}
      await Promise.all(SAMPLE_NOTES.map(async note => {
        try {
          const d = await getDoc(doc(db, 'likes', note.id))
          counts[note.id] = d.exists() ? (d.data().count || 0) : 0
        } catch { counts[note.id] = 0 }
      }))
      setLikes(counts)
    }
    fetchLikes()
  }, [])

  // ── MediaSession API — lock screen controls ──
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title:  activeNote?.title  || 'Daaglikse Hoop',
      artist: 'Ds. Dewald Scheepers',
      album:  activeNote?.series || 'Daaglikse Hoop',
      artwork: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    })
    navigator.mediaSession.setActionHandler('play',         () => { setPlaying(true);  onPlayingChange?.(true)  })
    navigator.mediaSession.setActionHandler('pause',        () => { setPlaying(false); onPlayingChange?.(false) })
    navigator.mediaSession.setActionHandler('seekbackward', () => skip(-15))
    navigator.mediaSession.setActionHandler('seekforward',  () => skip(15))
    navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'
  }, [activeNote, playing])

  // ── Real audio element ──
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !activeNote?.audioUrl) return
    audio.src = activeNote.audioUrl
    if (playing) audio.play().catch(() => {})
    else audio.pause()
  }, [activeNote, playing])

  // ── Simulated timer (fallback when no real audio) ──
  useEffect(() => {
    if (activeNote?.audioUrl) return
    if (playing) {
      timerRef.current = setInterval(() => {
        setElapsed(e => {
          if (e >= (activeNote?.lengthSeconds || 300)) { setPlaying(false); onPlayingChange?.(false); return 0 }
          return e + 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [playing, activeNote])

  async function countTodayPlay() {
    if (playedRef.current) return
    playedRef.current = true
    setPlayCount(c => c + 1)
    try {
      await setDoc(doc(db, 'plays', today.id), { count: increment(1) }, { merge: true })
    } catch { /* offline */ }
  }

  function toggle(note) {
    if (activeId === note.id) {
      const next = !playing
      setPlaying(next)
      onPlayingChange?.(next)
      if (next && note.id === today.id) countTodayPlay()
    } else {
      setActiveId(note.id)
      setElapsed(0)
      setPlaying(true)
      onPlayingChange?.(true)
      if (note.id === today.id) countTodayPlay()
    }
  }

  function skip(seconds) {
    setElapsed(e => Math.max(0, Math.min(e + seconds, activeNote?.lengthSeconds || 0)))
    if (audioRef.current && activeNote?.audioUrl) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + seconds)
    }
  }

  async function handleLike(noteId) {
    if (liked.includes(noteId)) return
    try {
      await setDoc(doc(db, 'likes', noteId), { count: increment(1) }, { merge: true })
    } catch { /* offline — still update locally */ }
    const newLiked = [...liked, noteId]
    setLiked(newLiked)
    localStorage.setItem('likedNotes', JSON.stringify(newLiked))
    setLikes(prev => ({ ...prev, [noteId]: (prev[noteId] || 0) + 1 }))
  }

  async function handleShare(note) {
    const msg = `Ek dink vandag se boodskap gaan jou help: "${note.title}" — ${note.scripture} 🙏`
    const data = { title: 'Daaglikse Hoop', text: msg, url: window.location.origin }
    if (navigator.share) {
      try { await navigator.share(data) } catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(`${msg}\n${window.location.origin}`)
        setShareToast(true)
        setTimeout(() => setShareToast(false), 2500)
      } catch { /* clipboard not available */ }
    }
  }

  const bySeries = recent.reduce((acc, n) => {
    ;(acc[n.series] = acc[n.series] || []).push(n)
    return acc
  }, {})

  return (
    <div className="luister">
      <audio ref={audioRef} style={{ display: 'none' }} />

      <div className="luister-hero">
        <div className="hero-title">
          <div className="hero-title-main">Daaglikse Hoop</div>
          <div className="hero-title-sub">met Dewald Scheepers</div>
        </div>

        <div className="hero-controls">
          <button className="hero-skip" onClick={() => skip(-15)}><SkipIcon direction="back" seconds={15} /></button>
          <button className="hero-play-btn" onClick={() => toggle(today)}>
            {todayPlaying ? <PauseIcon size={36} /> : <PlayIcon size={36} />}
          </button>
          <button className="hero-skip" onClick={() => skip(15)}><SkipIcon direction="forward" seconds={15} /></button>
        </div>

        <div className="hero-song-info">
          <div className="hero-song-title">{today.title}</div>
          <div className="hero-song-ref">{today.scripture}</div>
          {playCount >= 10 && (
            <div className="hero-play-count">🎧 {playCount} keer geluister</div>
          )}
          <div className="hero-progress">
            <span className="hero-time">{fmtTime(activeId === today.id ? elapsed : 0)}</span>
            <div className="hero-bar">
              <div className="hero-fill" style={{ width: `${activeId === today.id ? progress * 100 : 0}%` }} />
            </div>
            <span className="hero-time">{fmtTime(today.lengthSeconds)}</span>
          </div>

          <div className="hero-actions">
            <button
              className={`hero-like-btn ${liked.includes(today.id) ? 'liked' : ''}`}
              onClick={() => handleLike(today.id)}
            >
              <HeartIcon filled={liked.includes(today.id)} size={18} />
              <span>{likes[today.id] || 0}</span>
            </button>
            <button className="hero-share-btn" onClick={() => handleShare(today)}>
              <ShareIcon size={18} />
              <span>Deel met iemand</span>
            </button>
          </div>
        </div>
      </div>

      <div className="luister-body">
        {installBanner}
        <h3 className="section-title">Onlangse boodskappe</h3>
        {Object.entries(bySeries).map(([series, notes]) => (
          <div key={series} className="series-group">
            <div className="series-label">{series}</div>
            {notes.map(note => (
              <NoteRow
                key={note.id}
                note={note}
                playing={playing && activeId === note.id}
                onToggle={() => toggle(note)}
                liked={liked.includes(note.id)}
                likeCount={likes[note.id] || 0}
                onLike={() => handleLike(note.id)}
              />
            ))}
          </div>
        ))}
      </div>

      {activeId !== today.id && (
        <MiniPlayer
          note={activeNote}
          playing={playing}
          progress={progress}
          onToggle={() => toggle(activeNote)}
        />
      )}

      {shareToast && (
        <div className="share-toast">Boodskap gekopieër! Plak dit in WhatsApp om te deel.</div>
      )}
    </div>
  )
}
