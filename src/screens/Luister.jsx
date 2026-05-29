import { useState, useRef, useEffect } from 'react'
import { db } from '../firebase'
import { collection, query, orderBy, limit, doc, getDoc, setDoc, increment, onSnapshot } from 'firebase/firestore'
import './Luister.css'

const FALLBACK_COLORS = ['#EDE8F8','#F8EDE8','#E8F0EE','#F8E8F0','#E8F8EC','#F0F4E8','#E8EEF8']

function noteColor(id, stored) {
  if (stored) return stored
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff
  return FALLBACK_COLORS[h % FALLBACK_COLORS.length]
}

function fmtTime(sec) {
  if (!sec) return '0:00'
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
        {note.scripture && <span className="note-scripture">{note.scripture}</span>}
        {note.series    && <span className="note-series">{note.series}</span>}
      </div>
      <div className="note-right">
        {note.lengthSeconds > 0 && (
          <span className="note-length">{fmtTime(note.lengthSeconds)}</span>
        )}
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

function getCachedNotes() {
  try {
    const cached = localStorage.getItem('cachedNotes')
    return cached ? JSON.parse(cached) : []
  } catch { return [] }
}

export default function Luister({ onPlayingChange, installBanner, onAdminAccess }) {
  const cached = getCachedNotes()
  const [notes, setNotes]           = useState(cached)
  const [notesLoading, setLoading]  = useState(cached.length === 0)
  const [activeId, setActiveId]     = useState(cached[0]?.id || null)
  const [playing, setPlaying]       = useState(false)
  const [elapsed, setElapsed]       = useState(0)
  const [likes, setLikes]           = useState(() => {
    try { return JSON.parse(localStorage.getItem('cachedLikes') || '{}') } catch { return {} }
  })
  const [liked, setLiked]           = useState(() => {
    try { return JSON.parse(localStorage.getItem('likedNotes') || '[]') }
    catch { return [] }
  })
  const [shareToast, setShareToast] = useState(false)
  const [playCount, setPlayCount]   = useState(0)
  const timerRef    = useRef(null)
  const audioRef    = useRef(null)
  const playedRef   = useRef(false)
  const tapCountRef = useRef(0)
  const tapTimerRef = useRef(null)

  function handleTitleTap() {
    tapCountRef.current += 1
    clearTimeout(tapTimerRef.current)
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0
      onAdminAccess?.()
      return
    }
    tapTimerRef.current = setTimeout(() => { tapCountRef.current = 0 }, 1500)
  }

  const today      = notes[0] || null
  const recent     = notes.slice(1)
  const activeNote = notes.find(n => n.id === activeId) || today
  const progress   = activeNote?.lengthSeconds
    ? Math.min(elapsed / activeNote.lengthSeconds, 1)
    : 0
  const todayPlaying = playing && activeId === today?.id

  // ── Real-time notes from Firestore ──
  useEffect(() => {
    const q = query(
      collection(db, 'notes'),
      orderBy('publishedAt', 'desc'),
      limit(30)
    )
    const unsub = onSnapshot(q,
      snap => {
        const loaded = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          color: noteColor(d.id, d.data().color),
          lengthSeconds: d.data().lengthSeconds || 0
        }))
        setNotes(loaded)
        setActiveId(prev => prev || (loaded.length > 0 ? loaded[0].id : null))
        setLoading(false)
        try { localStorage.setItem('cachedNotes', JSON.stringify(loaded)) } catch {}
      },
      e => {
        console.error('Notes fetch error:', e)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  // ── Real-time play count for today's note ──
  useEffect(() => {
    if (!today) return
    const unsub = onSnapshot(doc(db, 'plays', today.id),
      snap => setPlayCount(snap.exists() ? (snap.data().count || 0) : 0),
      () => {}
    )
    return unsub
  }, [today?.id])

  // ── Real-time like counts for all loaded notes ──
  useEffect(() => {
    if (notes.length === 0) return
    const unsubs = notes.map(note =>
      onSnapshot(doc(db, 'likes', note.id),
        snap => setLikes(prev => {
          const next = { ...prev, [note.id]: snap.exists() ? (snap.data().count || 0) : 0 }
          try { localStorage.setItem('cachedLikes', JSON.stringify(next)) } catch {}
          return next
        }),
        () => {}
      )
    )
    return () => unsubs.forEach(u => u())
  }, [notes.length])

  // ── MediaSession API — lock screen controls ──
  useEffect(() => {
    if (!activeNote || !('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title:  activeNote.title  || 'Daaglikse Hoop',
      artist: 'Ds. Dewald Scheepers',
      album:  activeNote.series || 'Daaglikse Hoop',
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
    if (audio.src !== activeNote.audioUrl) {
      audio.src = activeNote.audioUrl
      setElapsed(0)
    }
    if (playing) audio.play().catch(() => {})
    else audio.pause()
  }, [activeNote?.id, playing])

  // ── Sync elapsed from real audio ──
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !activeNote?.audioUrl) return
    function onTimeUpdate() { setElapsed(audio.currentTime) }
    function onEnded() { setPlaying(false); onPlayingChange?.(false); setElapsed(0) }
    function onLoadedMetadata() {
      if (!activeNote.lengthSeconds || activeNote.lengthSeconds === 0) {
        setNotes(prev => prev.map(n =>
          n.id === activeNote.id ? { ...n, lengthSeconds: Math.round(audio.duration) } : n
        ))
      }
    }
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
    }
  }, [activeNote?.id])

  // ── Simulated timer (fallback when no real audio) ──
  useEffect(() => {
    if (activeNote?.audioUrl) return
    if (playing) {
      timerRef.current = setInterval(() => {
        setElapsed(e => {
          const max = activeNote?.lengthSeconds || 300
          if (e >= max) { setPlaying(false); onPlayingChange?.(false); return 0 }
          return e + 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [playing, activeNote?.id])

  async function countTodayPlay() {
    if (playedRef.current || !today) return
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
      if (next && note.id === today?.id) countTodayPlay()
    } else {
      setActiveId(note.id)
      setElapsed(0)
      setPlaying(true)
      onPlayingChange?.(true)
      if (note.id === today?.id) countTodayPlay()
    }
  }

  function skip(seconds) {
    const audio = audioRef.current
    if (audio && activeNote?.audioUrl) {
      audio.currentTime = Math.max(0, audio.currentTime + seconds)
    } else {
      setElapsed(e => Math.max(0, Math.min(e + seconds, activeNote?.lengthSeconds || 0)))
    }
  }

  async function handleLike(noteId) {
    if (liked.includes(noteId)) return
    try {
      await setDoc(doc(db, 'likes', noteId), { count: increment(1) }, { merge: true })
    } catch { /* offline */ }
    const newLiked = [...liked, noteId]
    setLiked(newLiked)
    localStorage.setItem('likedNotes', JSON.stringify(newLiked))
    setLikes(prev => ({ ...prev, [noteId]: (prev[noteId] || 0) + 1 }))
  }

  async function handleShare(note) {
    const msg = `Ek dink vandag se boodskap gaan jou help: "${note.title}"${note.scripture ? ` — ${note.scripture}` : ''} 🙏`
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
    const key = n.series || 'Ouer boodskappe'
    ;(acc[key] = acc[key] || []).push(n)
    return acc
  }, {})

  // ── Loading state ──
  if (notesLoading) {
    return (
      <div className="luister">
        <div className="luister-hero luister-hero-loading">
          <div className="hero-title" onClick={handleTitleTap} style={{ cursor: 'default' }}>
            <div className="hero-title-main">Daaglikse Hoop</div>
            <div className="hero-title-sub">met Dewald Scheepers</div>
          </div>
          <div className="hero-loading-text">Besig om boodskappe te laai...</div>
        </div>
        <div className="luister-body">
          {installBanner}
        </div>
      </div>
    )
  }

  // ── Empty state ──
  if (!today) {
    return (
      <div className="luister">
        <div className="luister-hero luister-hero-loading">
          <div className="hero-title" onClick={handleTitleTap} style={{ cursor: 'default' }}>
            <div className="hero-title-main">Daaglikse Hoop</div>
            <div className="hero-title-sub">met Dewald Scheepers</div>
          </div>
          <div className="hero-loading-text">Geen boodskappe beskikbaar nie.</div>
        </div>
        <div className="luister-body">
          {installBanner}
        </div>
      </div>
    )
  }

  return (
    <div className="luister">
      <audio ref={audioRef} style={{ display: 'none' }} />

      <div className="luister-hero">
        <div className="hero-title" onClick={handleTitleTap} style={{ cursor: 'default' }}>
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
          {today.scripture && <div className="hero-song-ref">{today.scripture}</div>}
          {playCount >= 10 && (
            <div className="hero-play-count">🎧 {playCount} keer geluister</div>
          )}
          <div className="hero-progress">
            <span className="hero-time">{fmtTime(activeId === today.id ? elapsed : 0)}</span>
            <div className="hero-bar">
              <div className="hero-fill" style={{ width: `${activeId === today.id ? progress * 100 : 0}%` }} />
            </div>
            <span className="hero-time">{today.lengthSeconds ? fmtTime(today.lengthSeconds) : '--:--'}</span>
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

        {recent.length > 0 && (
          <>
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
          </>
        )}
      </div>

      {activeNote && activeId !== today.id && (
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
