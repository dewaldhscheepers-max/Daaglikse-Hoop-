import { useState, useRef, useEffect, useCallback } from 'react'
import { CAMPAIGN } from '../data/campaign'
import './HuiseVanHoop.css'
import { db } from '../firebase'
import { collection, query, orderBy, limit, startAfter, getDocs, getDoc, doc, setDoc, increment, onSnapshot } from 'firebase/firestore'
import '../components/PopupStyles.css'
import './Luister.css'
import './DaeVanVrede.css'
import DonationCard from '../components/DonationCard'

// ── Cache helpers (5-min TTL for first page of notes) ────────────────────────
const NOTES_TTL  = 5 * 60 * 1000
const PAGE_SIZE  = 20

function readCache() {
  try {
    const notes = JSON.parse(localStorage.getItem('cachedNotes') || '[]')
    const time  = parseInt(localStorage.getItem('cachedNotesTime') || '0')
    return { notes, stale: notes.length === 0 || Date.now() - time > NOTES_TTL }
  } catch { return { notes: [], stale: true } }
}

function writeCache(notes) {
  try {
    localStorage.setItem('cachedNotes', JSON.stringify(notes))
    localStorage.setItem('cachedNotesTime', String(Date.now()))
  } catch {}
}

function readSavedNotes() {
  try { return JSON.parse(localStorage.getItem('savedNoteData') || '{}') } catch { return {} }
}
function writeSavedNotes(data) {
  try { localStorage.setItem('savedNoteData', JSON.stringify(data)) } catch {}
}

function readLikesCache() {
  try { return JSON.parse(localStorage.getItem('cachedLikes') || '{}') } catch { return {} }
}

function writeLikesCache(likes) {
  try { localStorage.setItem('cachedLikes', JSON.stringify(likes)) } catch {}
}

// ── Helpers ──────────────────────────────────────────────────────────────────
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

function mapDoc(d) {
  return { id: d.id, ...d.data(), color: noteColor(d.id, d.data().color), lengthSeconds: d.data().lengthSeconds || 0 }
}

// ── Icons ────────────────────────────────────────────────────────────────────
function PlayIcon({ size = 24 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg>
}
function PauseIcon({ size = 24 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="4" height="18" rx="1"/><rect x="15" y="3" width="4" height="18" rx="1"/></svg>
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
function BookmarkIcon({ filled = false, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
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
function SearchIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────
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

function NoteRow({ note, playing, onToggle, liked, likeCount, onLike, bookmarked, onBookmark, onShare }) {
  return (
    <div className="note-row">
      <div className="note-top">
        <div className="note-thumb" style={{ background: note.color }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
        </div>
        <div className="note-info">
          <span className="note-title">{note.title}</span>
          {note.scripture && <span className="note-scripture">{note.scripture}</span>}
          {note.series    && <span className="note-series">{note.series}</span>}
        </div>
        <div className="note-right">
          {note.lengthSeconds > 0 && <span className="note-length">{fmtTime(note.lengthSeconds)}</span>}
          <button className="play-btn-small" onClick={onToggle}>
            {playing ? <PauseIcon size={13} /> : <PlayIcon size={13} />}
          </button>
          <button className={`note-like-btn ${liked ? 'liked' : ''}`} onClick={onLike}>
            <HeartIcon filled={liked} size={20} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
          <button className={`note-bookmark-btn ${bookmarked ? 'bookmarked' : ''}`} onClick={onBookmark}>
            <BookmarkIcon filled={bookmarked} size={20} />
          </button>
        </div>
      </div>
      <button className="note-share-row" onClick={onShare}>
        <ShareIcon size={12} />
        <span>Deel hierdie boodskap</span>
      </button>
    </div>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z"/>
    </svg>
  )
}

function SpotifyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="#1DB954">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.36-.66.48-1.021.24-2.82-1.74-6.36-2.1-10.561-1.14-.418.12-.779-.18-.899-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.479.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.44-1.32 9.84-.66 13.561 1.56.361.18.54.78.24 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  )
}

function SocialLinks() {
  return (
    <div className="social-links">
      <p className="social-label">Volg Dewald Scheepers</p>
      <p className="social-desc">Kry ook kort video's, stemnotas en bemoediging op Facebook, TikTok en Spotify.</p>
      <div className="social-btns">
        <a className="social-btn" href="https://www.facebook.com/share/1DZwDnCjb7/" target="_blank" rel="noopener noreferrer">
          <FacebookIcon /><span>Facebook</span>
        </a>
        <a className="social-btn social-btn-tiktok" href="https://www.tiktok.com/@dewald.h.scheepers?_r=1&_t=ZS-96ncVZUx5yH" target="_blank" rel="noopener noreferrer">
          <TikTokIcon /><span>TikTok</span>
        </a>
        <a className="social-btn" href="https://open.spotify.com/show/76d1oJAAosj1P4aagU7Tb7?si=PJ5v-imGSz-LAUOVT2ZVug" target="_blank" rel="noopener noreferrer">
          <SpotifyIcon /><span>Spotify</span>
        </a>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Luister({ onPlayingChange, installBanner, onAdminAccess, onNoteFinished, onNavigate }) {
  const { notes: cached } = readCache()

  const [campaignCount, setCampaignCount] = useState(null)
  const [campaignCover, setCampaignCover] = useState('')

  const [notes, setNotes]           = useState(cached)
  const [loading, setLoading]       = useState(cached.length === 0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore]       = useState(true)
  const [activeId, setActiveId]     = useState(cached[0]?.id || null)
  const [playing, setPlaying]       = useState(false)
  const [elapsed, setElapsed]       = useState(0)
  const [likes, setLikes]           = useState(readLikesCache)
  const [liked, setLiked]           = useState(() => {
    try { return JSON.parse(localStorage.getItem('likedNotes') || '[]') } catch { return [] }
  })
  const [savedNotes, setSavedNotes]   = useState(readSavedNotes)
  const [shareToast, setShareToast]         = useState(false)
  const [bookmarkToast, setBookmarkToast]   = useState(false)
  const [listenShareNote, setListenShareNote] = useState(null)
  const [search, setSearch]           = useState('')
  const [allNotes, setAllNotes]       = useState([])
  const [loadingAll, setLoadingAll]   = useState(false)
  const fetchedAllRef                 = useRef(false)
  const [playCounts, setPlayCounts] = useState({})
  const [planLikes, setPlanLikes]   = useState({})
  const [likedPlans, setLikedPlans] = useState(() => {
    try { return JSON.parse(localStorage.getItem('likedPlans') || '{}') } catch { return {} }
  })

  const timerRef      = useRef(null)
  const audioRef      = useRef(null)
  const playedRef     = useRef(false)
  const tapCountRef   = useRef(0)
  const tapTimerRef   = useRef(null)
  const fetchingRef   = useRef(false)
  const lastDocRef    = useRef(null)

  const today      = notes[0] || null
  const recent     = notes.slice(1)
  const activeNote = notes.find(n => n.id === activeId) || today
  const progress   = activeNote?.lengthSeconds ? Math.min(elapsed / activeNote.lengthSeconds, 1) : 0
  const todayPlaying = playing && activeId === today?.id
  const playCount  = today ? (playCounts[today.id] || 0) : 0


  useEffect(() => {
    if (!CAMPAIGN.active) return

    function fetchCount() {
      fetch('/api/campaign-count')
        .then(r => r.json())
        .then(d => setCampaignCount(d.total || 0))
        .catch(() => {})
    }

    fetchCount()
    window.addEventListener('campaign-submitted', fetchCount)

    getDocs(collection(db, 'books')).then(snap => {
      const book = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .find(b => b.title?.toLowerCase().includes('rustelose') || b.id?.toLowerCase().includes('rustelose'))
      if (book?.coverUrl) setCampaignCover(book.coverUrl)
    }).catch(() => {})

    return () => window.removeEventListener('campaign-submitted', fetchCount)
  }, [])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'likes'),
      snap => {
        const counts = {}
        snap.docs.forEach(d => { counts[d.id] = d.data().count || 0 })
        setLikes(prev => {
          const next = { ...prev, ...counts }
          writeLikesCache(next)
          return next
        })
      },
      () => {}
    )
    return unsub
  }, [])

  // ── Fetch first page ──
  const fetchNotes = useCallback(async (silent = false) => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    if (!silent) setLoadingMore(true)
    try {
      const q    = query(collection(db, 'notes'), orderBy('publishedAt', 'desc'), limit(PAGE_SIZE))
      const snap = await getDocs(q)
      const loaded = snap.docs.map(mapDoc)
      lastDocRef.current = snap.docs[snap.docs.length - 1] || null
      setHasMore(snap.docs.length === PAGE_SIZE)
      setNotes(loaded)
      setActiveId(prev => prev || loaded[0]?.id || null)
      setLoading(false)
      writeCache(loaded)
    } catch {
      setLoading(false)
    }
    fetchingRef.current = false
    if (!silent) setLoadingMore(false)
  }, [])

  // ── Fetch next page ──
  const fetchMore = useCallback(async () => {
    if (!lastDocRef.current || loadingMore) return
    setLoadingMore(true)
    try {
      const q    = query(collection(db, 'notes'), orderBy('publishedAt', 'desc'), startAfter(lastDocRef.current), limit(PAGE_SIZE))
      const snap = await getDocs(q)
      const more = snap.docs.map(mapDoc)
      lastDocRef.current = snap.docs[snap.docs.length - 1] || null
      setHasMore(snap.docs.length === PAGE_SIZE)
      setNotes(prev => [...prev, ...more])
    } catch {}
    setLoadingMore(false)
  }, [loadingMore])

  // ── On mount: always fetch to set up pagination cursor ──
  useEffect(() => {
    fetchNotes()
  }, [])

  // ── Real-time: silently refetch when a new note is uploaded ──
  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('publishedAt', 'desc'), limit(1))
    const unsub = onSnapshot(q, snap => {
      if (!snap.docs.length) return
      const latestId = snap.docs[0].id
      setNotes(prev => {
        if (prev.length > 0 && prev[0].id !== latestId) fetchNotes(true)
        return prev
      })
    }, () => {})
    return unsub
  }, [fetchNotes])

  // ── Deep-link: ?note=id from a shared URL ──
  useEffect(() => {
    if (notes.length === 0) return
    const noteId = new URLSearchParams(window.location.search).get('note')
    if (!noteId) return
    if (notes.some(n => n.id === noteId)) setActiveId(noteId)
    window.history.replaceState({}, '', '/')
  }, [notes])

  // ── On visibility change: silently refresh if cache is stale or notes empty ──
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== 'visible') return
      const { stale: isStale } = readCache()
      if (isStale || notes.length === 0) fetchNotes(true)
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [fetchNotes, notes.length])

  // ── Real-time: all play counts (fires the moment anyone plays) ──
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'plays'),
      snap => {
        const counts = {}
        snap.docs.forEach(d => { counts[d.id] = d.data().count || 0 })
        setPlayCounts(counts)
      },
      () => {}
    )
    return unsub
  }, [])


  // ── Fetch reading plan like counts ──
  useEffect(() => {
    const PLAN_IDS = ['11-dae-vrede', 'dinge-verander', 'seer-na-vryheid', 'leuens-duiwel']
    Promise.all(PLAN_IDS.map(id => getDoc(doc(db, 'readingPlanLikes', id)))).then(docs => {
      const counts = {}
      docs.forEach((d, i) => { counts[PLAN_IDS[i]] = d.exists() ? (d.data().count || 0) : 0 })
      setPlanLikes(counts)
    }).catch(() => {})
  }, [])

  function handlePlanLike(planId) {
    const alreadyLiked = likedPlans[planId]
    const delta = alreadyLiked ? -1 : 1
    const newLiked = { ...likedPlans, [planId]: !alreadyLiked }
    setLikedPlans(newLiked)
    try { localStorage.setItem('likedPlans', JSON.stringify(newLiked)) } catch {}
    setPlanLikes(prev => ({ ...prev, [planId]: Math.max(0, (prev[planId] || 0) + delta) }))
    setDoc(doc(db, 'readingPlanLikes', planId), { count: increment(delta) }, { merge: true }).catch(() => {})
  }


  // ── MediaSession API ──
  useEffect(() => {
    if (!activeNote || !('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title:  activeNote.title  || 'Daaglikse Hoop',
      artist: 'Dewald Scheepers',
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

  // ── Audio element ──
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !activeNote?.audioUrl) return
    if (audio.src !== activeNote.audioUrl) { audio.src = activeNote.audioUrl; setElapsed(0) }
    if (playing) audio.play().catch(() => {})
    else audio.pause()
  }, [activeNote?.id, playing])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !activeNote?.audioUrl) return
    function onTimeUpdate()     { setElapsed(audio.currentTime) }
    function onEnded() {
      setPlaying(false); onPlayingChange?.(false); setElapsed(0)
      const n = parseInt(localStorage.getItem('completedListens') || '0')
      localStorage.setItem('completedListens', String(n + 1))
      const sharedAt = parseInt(localStorage.getItem('sharePopupSharedAt') || '0')
      const laterAt  = parseInt(localStorage.getItem('sharePopupLaterAt')  || '0')
      if (Date.now() - sharedAt > 10 * 24 * 60 * 60 * 1000 &&
          Date.now() - laterAt  >  3 * 24 * 60 * 60 * 1000) {
        onNoteFinished?.()
      }
    }
    function onLoadedMetadata() {
      if (!activeNote.lengthSeconds) {
        setNotes(prev => prev.map(n => n.id === activeNote.id ? { ...n, lengthSeconds: Math.round(audio.duration) } : n))
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

  // ── Fallback timer (no audio URL) ──
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
    } else { clearInterval(timerRef.current) }
    return () => clearInterval(timerRef.current)
  }, [playing, activeNote?.id])

  // ── Secret tap for admin ──
  function handleTitleTap() {
    tapCountRef.current += 1
    clearTimeout(tapTimerRef.current)
    if (tapCountRef.current >= 5) { tapCountRef.current = 0; onAdminAccess?.(); return }
    tapTimerRef.current = setTimeout(() => { tapCountRef.current = 0 }, 1500)
  }

  async function countTodayPlay() {
    if (playedRef.current || !today) return
    playedRef.current = true
    setPlayCounts(prev => ({ ...prev, [today.id]: (prev[today.id] || 0) + 1 }))
    try { await setDoc(doc(db, 'plays', today.id), { count: increment(1) }, { merge: true }) } catch {}
  }

  function toggle(note) {
    if (activeId === note.id) {
      const next = !playing
      setPlaying(next); onPlayingChange?.(next)
      if (next) {
        if (note.id === today?.id) countTodayPlay()
      }
    } else {
      setActiveId(note.id); setElapsed(0)
      setPlaying(true); onPlayingChange?.(true)
      if (note.id === today?.id) countTodayPlay()
    }
  }

  function skip(seconds) {
    const audio = audioRef.current
    if (audio && activeNote?.audioUrl) audio.currentTime = Math.max(0, audio.currentTime + seconds)
    else setElapsed(e => Math.max(0, Math.min(e + seconds, activeNote?.lengthSeconds || 0)))
  }

  async function handleLike(noteId) {
    if (liked.includes(noteId)) return
    const newLiked = [...liked, noteId]
    setLiked(newLiked)
    localStorage.setItem('likedNotes', JSON.stringify(newLiked))
    setLikes(prev => {
      const next = { ...prev, [noteId]: (prev[noteId] || 0) + 1 }
      writeLikesCache(next)
      return next
    })
    try { await setDoc(doc(db, 'likes', noteId), { count: increment(1) }, { merge: true }) } catch {}
  }

  const BOOKMARK_LIMIT = 10

  function handleBookmark(noteId) {
    const note = notes.find(n => n.id === noteId) || allNotes.find(n => n.id === noteId) || savedNotes[noteId]
    if (savedNotes[noteId]) {
      const newSaved = { ...savedNotes }
      delete newSaved[noteId]
      setSavedNotes(newSaved)
      writeSavedNotes(newSaved)
    } else if (note) {
      let newSaved = { ...savedNotes, [noteId]: { ...note, savedAt: Date.now() } }
      const entries = Object.entries(newSaved).sort((a, b) => (a[1].savedAt || 0) - (b[1].savedAt || 0))
      if (entries.length > BOOKMARK_LIMIT) {
        delete newSaved[entries[0][0]]
      }
      setSavedNotes(newSaved)
      writeSavedNotes(newSaved)
      if (!localStorage.getItem('bookmarkToastShown')) {
        localStorage.setItem('bookmarkToastShown', '1')
        setBookmarkToast(true)
        setTimeout(() => setBookmarkToast(false), 3500)
      }
    }
  }

  async function fetchAllForSearch() {
    if (fetchedAllRef.current) return
    fetchedAllRef.current = true
    setLoadingAll(true)
    try {
      const q = query(collection(db, 'notes'), orderBy('publishedAt', 'desc'))
      const snap = await getDocs(q)
      setAllNotes(snap.docs.map(mapDoc))
    } catch { fetchedAllRef.current = false }
    setLoadingAll(false)
  }

  async function handleShare(note) {
    const msg = `Ek dink hierdie boodskap gaan jou help: "${note.title}"${note.scripture ? ` — ${note.scripture}` : ''} 🙏`
    const url = `${window.location.origin}?note=${note.id}`
    if (navigator.share) {
      try { await navigator.share({ title: 'Daaglikse Hoop', text: msg, url }) } catch {}
    } else {
      try { await navigator.clipboard.writeText(`${msg}\n${url}`); setShareToast(true); setTimeout(() => setShareToast(false), 2500) } catch {}
    }
  }

  async function handleCampaignShare() {
    const msg = `Ek het sopas die Rustelose Gedagtes e-boek gratis gekry via Daaglikse Hoop 🙏🏻\n\nKry joune ook — ons soek 1000 huise van hoop:\nhttps://dewaldscheepers.com/go`
    if (navigator.share) {
      try { await navigator.share({ text: msg, url: 'https://dewaldscheepers.com/go' }) } catch {}
    } else {
      try { await navigator.clipboard.writeText(msg); setShareToast(true); setTimeout(() => setShareToast(false), 2500) } catch {}
    }
  }

  async function handleListenShare() {
    setListenShareNote(null)
    const msg = `Ek luister elke oggend na Daaglikse Hoop — kort boodskappe van hoop en bemoediging. Ek dink jy sal dit ook geniet.\n\nLuister hier: https://dewaldscheepers.com/go`
    if (navigator.share) {
      try { await navigator.share({ title: 'Daaglikse Hoop', text: msg, url: 'https://dewaldscheepers.com/go' }) } catch {}
    } else {
      try { await navigator.clipboard.writeText(msg); setShareToast(true); setTimeout(() => setShareToast(false), 2500) } catch {}
    }
  }

  const titleBlock = (
    <div className="hero-title" onClick={handleTitleTap} style={{ cursor: 'default' }}>
      <div className="hero-title-main">Daaglikse Hoop</div>
      <div className="hero-title-sub">met Dewald Scheepers</div>
    </div>
  )

  if (loading) {
    return (
      <div className="luister">
        <div className="luister-hero luister-hero-loading">{titleBlock}<div className="hero-loading-text">Besig om boodskappe te laai...</div></div>
        <div className="luister-body">{installBanner}</div>
      </div>
    )
  }

  if (!today) {
    return (
      <div className="luister">
        <div className="luister-hero luister-hero-loading">{titleBlock}<div className="hero-loading-text">Geen boodskappe beskikbaar nie.</div></div>
        <div className="luister-body">{installBanner}</div>
      </div>
    )
  }

  const term    = search.trim().toLowerCase()
  const pool    = allNotes.length > 0 ? allNotes : notes
  const results = term ? pool.filter(n =>
    [n.title, n.scripture, n.series, n.scriptureText].some(f => f?.toLowerCase().includes(term))
  ) : []

  const savedList = Object.values(savedNotes).sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))

  const bySeries = recent.reduce((acc, n) => {
    const key = n.series || 'Ouer boodskappe'
    ;(acc[key] = acc[key] || []).push(n)
    return acc
  }, {})

  return (
    <div className="luister">
      <audio ref={audioRef} style={{ display: 'none' }} />

      <div className="luister-hero">
        {titleBlock}

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
          {playCount >= 10 && <div className="hero-play-count">🎧 {playCount} keer geluister</div>}
          <div className="hero-progress">
            <span className="hero-time">{fmtTime(activeId === today.id ? elapsed : 0)}</span>
            <div className="hero-bar">
              <div className="hero-fill" style={{ width: `${activeId === today.id ? progress * 100 : 0}%` }} />
            </div>
            <span className="hero-time">{today.lengthSeconds ? fmtTime(today.lengthSeconds) : '--:--'}</span>
          </div>
          <div className="hero-actions">
            <button className={`hero-like-btn ${liked.includes(today.id) ? 'liked' : ''}`} onClick={() => handleLike(today.id)}>
              <HeartIcon filled={liked.includes(today.id)} size={18} />
              <span>{likes[today.id] || 0}</span>
            </button>
            <button className="hero-share-btn" onClick={() => handleShare(today)}>
              <ShareIcon size={18} /><span>Deel met iemand</span>
            </button>
          </div>
        </div>
      </div>

      <div className="luister-body">

        {CAMPAIGN.active && (() => {
          const count = campaignCount || 0
          const goal  = count < 1000 ? 1000 : Math.floor(count / 500) * 500 + 500
          return (
          <div className="huise-card">
            <div className="huise-card-inner">
              <span className="huise-card-badge">GRATIS</span>
              <div className="huise-card-body-row">
                {campaignCover && (
                  <img
                    src={campaignCover}
                    className="huise-card-cover"
                    alt="Rustelose Gedagtes"
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                )}
                <div className="huise-card-body-text">
                  <h3 className="huise-card-title">{goal.toLocaleString()} Huise van Hoop</h3>
                  <p className="huise-card-subtitle">Rustelose Gedagtes · Gratis e-boek</p>
                  <div className="huise-card-divider" />
                  <p className="huise-card-text">Ons gee {goal.toLocaleString()} gratis e-boeke weg.</p>
                </div>
              </div>
              <p className="huise-card-tagline">Bring hoop na jou huis of stuur dit vir iemand wat dit nodig het.</p>
              {count > 0 && (
                <div className="huise-card-progress">
                  <div className="huise-card-count-label">
                    Hoop gebring na <strong>{count.toLocaleString()} {count === 1 ? 'huis' : 'huise'}</strong> — op pad na {goal.toLocaleString()}
                  </div>
                  <div className="huise-card-bar">
                    <div className="huise-card-fill" style={{ width: `${Math.min(100, (count / goal) * 100)}%` }} />
                  </div>
                </div>
              )}
              <button className="huise-card-btn" onClick={() => window.dispatchEvent(new CustomEvent('open-huise-van-hoop'))}>
                Kry Rustelose Gedagtes Gratis
              </button>
              <button className="huise-card-share" onClick={handleCampaignShare}>
                Deel met iemand
              </button>
            </div>
          </div>
          )
        })()}


        {today.wallpaperUrl && (
          <div className="wp-card">
            <div className="wp-card-label">📱 Vandag se wallpaper — hou jou vinger op die foto vir 2 sek en kies "Download image"</div>
            <img src={today.wallpaperUrl} className="wp-card-img" alt="Wallpaper" />
          </div>
        )}
        {installBanner}

        {/* ── Leesplanne ── */}
        <div className="leesplanne-section">
          <p className="leesplanne-heading">Leesplanne</p>
          <p className="leesplanne-sub">Kort Bybelse leesplanne wat jy dag vir dag kan volg.</p>

          <button className="leesplan-card" onClick={() => window.dispatchEvent(new CustomEvent('open-daevrede'))}>
            <span className="leesplan-icon">🕊️</span>
            <div className="leesplan-info">
              <div className="leesplan-title">11 Dae van Vrede</div>
              <div className="leesplan-desc">'n Kort leesplan vir wanneer jou gedagtes raas en jou hart moeg is.</div>
              <div className="leesplan-meta">11 dae · gratis</div>
            </div>
            <div className="leesplan-right">
              <button
                className={`leesplan-like-btn${likedPlans['11-dae-vrede'] ? ' liked' : ''}`}
                onClick={e => { e.stopPropagation(); handlePlanLike('11-dae-vrede') }}
              >
                <span className="leesplan-like-icon">{likedPlans['11-dae-vrede'] ? '♥' : '♡'}</span>
              </button>
              <span className="leesplan-arrow">›</span>
            </div>
          </button>

          <button className="leesplan-card" onClick={() => window.dispatchEvent(new CustomEvent('open-dinge-verander'))}>
            <span className="leesplan-icon">✨</span>
            <div className="leesplan-info">
              <div className="leesplan-title">Dinge Wat Jou Lewe Kan Verander</div>
              <div className="leesplan-desc">Dag-vir-dag waarhede wat jou help om anders te dink, bid en leef.</div>
              <div className="leesplan-meta">24 dae · gratis</div>
            </div>
            <div className="leesplan-right">
              <button
                className={`leesplan-like-btn${likedPlans['dinge-verander'] ? ' liked' : ''}`}
                onClick={e => { e.stopPropagation(); handlePlanLike('dinge-verander') }}
              >
                <span className="leesplan-like-icon">{likedPlans['dinge-verander'] ? '♥' : '♡'}</span>
              </button>
              <span className="leesplan-arrow">›</span>
            </div>
          </button>

          <button className="leesplan-card" onClick={() => window.dispatchEvent(new CustomEvent('open-seer-na-vryheid'))}>
            <span className="leesplan-icon">💙</span>
            <div className="leesplan-info">
              <div className="leesplan-title">'N Reis van Seer na Vryheid</div>
              <div className="leesplan-desc">Wanneer mense jou seermaak — genees jou hart, herwin jou lewe, loop vry.</div>
              <div className="leesplan-meta">14 dae · gratis</div>
            </div>
            <div className="leesplan-right">
              <button
                className={`leesplan-like-btn${likedPlans['seer-na-vryheid'] ? ' liked' : ''}`}
                onClick={e => { e.stopPropagation(); handlePlanLike('seer-na-vryheid') }}
              >
                <span className="leesplan-like-icon">{likedPlans['seer-na-vryheid'] ? '♥' : '♡'}</span>
              </button>
              <span className="leesplan-arrow">›</span>
            </div>
          </button>

          <button className="leesplan-card" onClick={() => window.dispatchEvent(new CustomEvent('open-leuens-duiwel'))}>
            <span className="leesplan-icon">⚔️</span>
            <div className="leesplan-info">
              <div className="leesplan-title">7 Leuens van die Duiwel</div>
              <div className="leesplan-desc">Herken die vyand se stem en kies God se waarheid elke dag.</div>
              <div className="leesplan-meta">7 dae · gratis</div>
            </div>
            <div className="leesplan-right">
              <button
                className={`leesplan-like-btn${likedPlans['leuens-duiwel'] ? ' liked' : ''}`}
                onClick={e => { e.stopPropagation(); handlePlanLike('leuens-duiwel') }}
              >
                <span className="leesplan-like-icon">{likedPlans['leuens-duiwel'] ? '♥' : '♡'}</span>
              </button>
              <span className="leesplan-arrow">›</span>
            </div>
          </button>
        </div>

        {/* ── Search bar ── */}
        <div className="search-bar">
          <SearchIcon size={16} />
          <input
            className="search-input"
            placeholder="Soek boodskappe, reekse, skrifverwysings..."
            value={search}
            onChange={e => { setSearch(e.target.value); fetchAllForSearch() }}
          />
          {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>

        {search ? (
          /* ── Search results ── */
          <div className="search-results">
            {loadingAll ? (
              <div className="search-status">Besig om te soek...</div>
            ) : results.length === 0 ? (
              <div className="search-status">Geen resultate vir "<strong>{search}</strong>" nie.</div>
            ) : (
              <>
                <div className="search-count">{results.length} resultate</div>
                {results.map(note => (
                  <NoteRow
                    key={note.id}
                    note={note}
                    playing={playing && activeId === note.id}
                    onToggle={() => toggle(note)}
                    liked={liked.includes(note.id)}
                    likeCount={likes[note.id] || 0}
                    onLike={() => handleLike(note.id)}
                    bookmarked={savedNotes[note.id] != null}
                    onBookmark={() => handleBookmark(note.id)}
                    onShare={() => handleShare(note)}
                  />
                ))}
              </>
            )}
          </div>
        ) : (
          /* ── Normal grouped view ── */
          <>
            {recent.length > 0 && (
              <>
                <h3 className="section-title">Onlangse boodskappe</h3>
                {Object.entries(bySeries).map(([series, seriesNotes]) => (
                  <div key={series} className="series-group">
                    <div className="series-label-row">
                      <span className="series-label">{series}</span>
                      {series === 'RUSTELOSE GEDAGTES' && (
                        <span className="series-gewild-badge">GEWILDE REEKS</span>
                      )}
                    </div>
                    {series === 'RUSTELOSE GEDAGTES' && (
                      <div className="series-gebaseer">Gebaseer op die E-boek Rustelose Gedagtes</div>
                    )}
                    {seriesNotes.map(note => (
                      <NoteRow
                        key={note.id}
                        note={note}
                        playing={playing && activeId === note.id}
                        onToggle={() => toggle(note)}
                        liked={liked.includes(note.id)}
                        likeCount={likes[note.id] || 0}
                        onLike={() => handleLike(note.id)}
                        bookmarked={savedNotes[note.id] != null}
                        onBookmark={() => handleBookmark(note.id)}
                        onShare={() => handleShare(note)}
                      />
                    ))}
                  </div>
                ))}
              </>
            )}

            {hasMore && (
              <button className="load-more-btn" onClick={fetchMore} disabled={loadingMore}>
                {loadingMore ? 'Besig...' : 'Laai meer boodskappe'}
              </button>
            )}
            {!hasMore && notes.length > 1 && <div className="notes-end">Dit was alles 🙏</div>}
          </>
        )}

        {/* ── Gestoor vir later (bottom) ── */}
        {savedList.length > 0 && (
          <div className="saved-section">
            <div className="saved-header">
              <BookmarkIcon filled size={14} />
              <span>Gestoor vir later</span>
              <span className="saved-count">{savedList.length}/{BOOKMARK_LIMIT}</span>
            </div>
            {savedList.map(note => (
              <NoteRow
                key={note.id}
                note={note}
                playing={playing && activeId === note.id}
                onToggle={() => toggle(note)}
                liked={liked.includes(note.id)}
                likeCount={likes[note.id] || 0}
                onLike={() => handleLike(note.id)}
                bookmarked={savedNotes[note.id] != null}
                onBookmark={() => handleBookmark(note.id)}
                onShare={() => handleShare(note)}
              />
            ))}
          </div>
        )}

        <DonationCard />
        <SocialLinks />

      </div>

      {activeNote && activeId !== today.id && (
        <MiniPlayer note={activeNote} playing={playing} progress={progress} onToggle={() => toggle(activeNote)} />
      )}


      {shareToast    && <div className="share-toast">Boodskap gekopieër! Plak dit in WhatsApp om te deel.</div>}
      {bookmarkToast && <div className="share-toast">Gestoor! Blaai af na onder om dit te sien 🔖</div>}
    </div>
  )
}
