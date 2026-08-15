import { useState, useRef, useEffect, useCallback } from 'react'
import { db } from '../firebase'
import { collection, query, orderBy, limit, startAfter, getDocs, getDoc, doc, setDoc, increment, onSnapshot } from 'firebase/firestore'
import '../components/PopupStyles.css'
import './Luister.css'
import './DaeVanVrede.css'
import DonationCard from '../components/DonationCard'

// ── Cache helpers (5-min TTL for first page of notes) ────────────────────────
const NOTES_TTL  = 5 * 60 * 1000
const PAGE_SIZE  = 20

/* Hoe lank ons vir Firestore wag voordat ons dit 'n mislukking noem.

   `getDocs` het self geen tydgrens nie. Sonder hierdie getal kan die belofte
   ná 'n opgeskorte oortjie vir altyd hang, en dan bly die skerm vir altyd op
   "Besig om boodskappe te laai..." staan. Sien fetchNotes. */
const HAAL_TYDGRENS = 12000

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
export default function Luister({ onPlayingChange, installBanner, onAdminAccess, onNoteFinished, onNavigate, kennisgewingMerkie }) {
  const { notes: cached } = readCache()

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
  const [wpBesig, setWpBesig]         = useState(false)
  const [wpFout, setWpFout]           = useState(null)
  const [wpNota, setWpNota]           = useState(null)
  const [search, setSearch]           = useState('')
  const [allNotes, setAllNotes]       = useState([])
  const [loadingAll, setLoadingAll]   = useState(false)
  const fetchedAllRef                 = useRef(false)
  const [playCounts, setPlayCounts] = useState({})
  const [nlEmail,    setNlEmail]    = useState('')
  const [nlState,    setNlState]    = useState(() => localStorage.getItem('nl_subscribed') ? 'done' : 'idle')
  const [featuredVideo, setFeaturedVideo] = useState(null)

  const timerRef      = useRef(null)
  const audioRef      = useRef(null)
  const playedRef     = useRef(false)
  const tapCountRef   = useRef(0)
  const tapTimerRef   = useRef(null)
  const fetchingRef   = useRef(false)
  const lastDocRef    = useRef(null)
  /* Wat ons NOU het. `fetchNotes` het 'n leë afhanklikheidslys en sou
     andersins vir altyd na die eerste render se notas kyk. */
  const notasRef      = useRef(cached)

  const today      = notes[0] || null
  const recent     = notes.slice(1)
  const activeNote = notes.find(n => n.id === activeId) || allNotes.find(n => n.id === activeId) || today
  const progress   = activeNote?.lengthSeconds ? Math.min(elapsed / activeNote.lengthSeconds, 1) : 0
  const todayPlaying = playing && activeId === today?.id
  const playCount  = today ? (playCounts[today.id] || 0) : 0


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

  /* ── Haal die eerste bladsy ──

     Hierdie funksie het twee foute gehad wat albei net opgeduik het wanneer
     'n mens die app 'n rukkie los en dan terugkom. Altwee is gerapporteer as
     dieselfde ding: "dit se Besig om boodskappe te laai en dan is daar niks".

     ── 1. Dit kon vir altyd vashaak ──

     `getDocs` van die Firestore-SDK het GEEN tydgrens nie. Wanneer Android
     die oortjie opskort, sterf die SDK se verbinding, en op 'n slegte
     terugkeer los die belofte nie op EN verwerp dit nie. Dit hang net.

     En dan:
       · `fetchingRef.current` bly vir altyd `true`, dus loop ELKE latere
         oproep — ook die een by visibilitychange wat juis moes red — reguit
         teen die hek vas en doen niks;
       · `setLoading(false)` word nooit bereik nie, dus bly "Besig om
         boodskappe te laai..." vir altyd staan.

     Die app kon homself dus nie herstel nie. 'n Mens moes hom doodmaak.

     Nou is daar 'n tydgrens, en die slot word in 'n `finally` losgelaat —
     nooit weer 'n dooie hek nie.

     ── 2. 'n Halwe antwoord het die goeie data uitgevee ──

     Is die SDK vanlyn, bedien `getDocs` uit sy EIE kas. Daardie kas hou net
     wat die SDK al gesien het — en die enigste ander luisteraar hier vra
     `limit(1)`. Die antwoord was dus soms EEN nota.

     Die ou kode het dit sonder om te kyk aanvaar: `setNotes(loaded)` en
     `writeCache(loaded)`. Twintig notas is met een vervang, en dit is in
     localStorage geskryf, dus het dit 'n herlaai OORLEEF. Dit is presies die
     skermkiekie: die wallpaper wys nog (dis nota 0), en onder die soekkassie
     is daar niks — geen lys, geen "Laai meer", geen "Dit was alles".

     Nou word 'n antwoord wat KLEINER is as wat ons reeds het, weggegooi. Ons
     hou eerder ou data as om goeie data met 'n halwe kas te vervang. */
  const fetchNotes = useCallback(async (silent = false) => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    if (!silent) setLoadingMore(true)
    try {
      const q = query(collection(db, 'notes'), orderBy('publishedAt', 'desc'), limit(PAGE_SIZE))
      const snap = await Promise.race([
        getDocs(q),
        new Promise((_, nee) => setTimeout(() => nee(new Error('te lank')), HAAL_TYDGRENS)),
      ])
      const loaded = snap.docs.map(mapDoc)

      /* Aanvaar dit net as dit nie minder is as wat ons reeds het nie. 'n Leë
         of halwe antwoord beteken die verbinding is stukkend, nie dat die
         notas weg is nie.

         `notasRef` en nie `notes` nie: hierdie useCallback het 'n leë
         afhanklikheidslys, dus sou dit vir altyd na die eerste render se
         notas kyk. */
      const genoeg = loaded.length >= Math.min(PAGE_SIZE, notasRef.current.length)
      if (loaded.length && genoeg) {
        lastDocRef.current = snap.docs[snap.docs.length - 1] || null
        setHasMore(snap.docs.length === PAGE_SIZE)
        setNotes(loaded)
        setActiveId(vorige => vorige || loaded[0]?.id || null)
        writeCache(loaded)
      }
      setLoading(false)
    } catch {
      /* Kon dit nie kry nie. Het ons reeds notas uit die kas, wys hulle
         eerder as 'n leë skerm; het ons niks, wys die leë skerm met sy
         "Probeer weer"-knoppie. */
      setLoading(false)
    } finally {
      fetchingRef.current = false
      if (!silent) setLoadingMore(false)
    }
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

  useEffect(() => { notasRef.current = notes }, [notes])

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

  /* ── Die klank ──
   *
   * Hier was 'n fout wat gelyk het soos 'n stadige net: 'n mens druk speel,
   * niks gebeur nie, en hy moet uit die skerm uit en weer in voor dit werk.
   *
   * Die oorsaak was hierdie twee reels langs mekaar:
   *
   *     audio.src = activeNote.audioUrl
   *     audio.play().catch(() => {})
   *
   * Om `src` te stel begin 'n laai wat 'n RUKKIE vat. `play()` dadelik
   * daarna gee 'n belofte wat die blaaier verwerp met 'n AbortError — "die
   * play()-versoek is deur 'n nuwe laai onderbreek". Daardie `catch` het dit
   * doodgemaak sonder om iets te doen.
   *
   * Die gevolg: `playing` bly WAAR terwyl niks speel nie. Die knoppie wys 'n
   * pouse-ikoon, die balkie staan stil, en die app en die werklikheid stem
   * nie meer ooreen nie. Druk die mens weer, sit hy dit AF; druk hy 'n derde
   * keer, is die leer intussen gelaai en dan werk dit. Presies "ek moet in
   * en uit gaan".
   *
   * Dit tref die NUUTSTE nota die ergste, want daardie leer is nog in
   * niemand se kas nie.
   *
   * Nou: verwerp die belofte, wag ons vir `canplay` en probeer EEN keer
   * weer. Se die blaaier dit mag glad nie speel nie (NotAllowedError), stel
   * ons `playing` terug op vals sodat die knoppie die waarheid wys. */
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !activeNote?.audioUrl) return

    if (audio.src !== activeNote.audioUrl) {
      audio.src = activeNote.audioUrl
      /* Sonder `load()` hou die element soms aan die vorige leer se buffer
         vas en dan speel die VERKEERDE nota se laaste sekondes. */
      audio.load()
      setElapsed(0)
    }

    if (!playing) { audio.pause(); return }

    let dood = false
    let wagLuisteraar = null

    function gee_op() {
      if (dood) return
      setPlaying(false)
      onPlayingChange?.(false)
    }

    audio.play().catch(fout => {
      if (dood) return

      /* Die blaaier weier. Dit gebeur wanneer daar nie 'n mens se tik agter
         hierdie oproep sit nie. Daar is niks om te probeer nie — wys net die
         speel-ikoon weer, sodat 'n tik dit kan regmaak. */
      if (fout && fout.name === 'NotAllowedError') return gee_op()

      /* Alles anders is 'n wedloop met die laai. Wag tot daar genoeg is om
         mee te begin, en probeer een keer weer. */
      wagLuisteraar = () => {
        audio.removeEventListener('canplay', wagLuisteraar)
        wagLuisteraar = null
        if (dood) return
        audio.play().catch(gee_op)
      }
      audio.addEventListener('canplay', wagLuisteraar)
    })

    return () => {
      dood = true
      if (wagLuisteraar) audio.removeEventListener('canplay', wagLuisteraar)
    }
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

  // ── Featured video (date-gated, auto-expires) ──
  useEffect(() => {
    fetch('/featured-video.json?v=' + Date.now())
      .then(r => r.json())
      .then(data => {
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Johannesburg' })
        if (data?.videoId && data?.date === today) setFeaturedVideo(data)
      })
      .catch(() => {})
  }, [])

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

  /* ── Deel vandag se wallpaper ──

     Dit was 'n prent met 'n byskrif wat gese het: "hou jou vinger op die foto
     vir 2 sek en kies Download image". Dit is drie stappe, dit werk anders op
     elke blaaier, en die helfte van die mense doen dit nooit.

     Die prent is klaar 9:16 en die skakel is klaar daarop ingebrand. Dit is
     presies wat 'n mens op WhatsApp Status plaas -- en 'n Status word deur
     ELKE kontak gesien, sonder dat 'n algoritme dit filter. Dit is die
     goedkoopste manier waarop hierdie app kan groei, en dit het agter 'n lang
     druk weggekruip.

     navigator.share met 'n `files`-skikking gee die foon se eie deelvenster:
     WhatsApp, Facebook, Instagram, e-pos, alles. Dieselfde patroon as
     Vredepad se vers-kaart, wat al maande werk.

     ── Waarom die prent deur ons eie bediener kom ──

     Die eerste weergawe het `fetch(today.wallpaperUrl)` direk gedoen en dit
     het NIE gewerk nie: die prent le op firebasestorage.googleapis.com en
     daardie emmer het geen CORS-opstelling nie. 'n <img> wys hom sonder
     moeite, maar 'n `fetch` van 'n ander domein af word geblokkeer. Die
     kode het toe stil na teks-alleen teruggeval, en op WhatsApp het net 'n
     skakel geland -- dit LYK of dit werk.

     `prentPad()` stuur enige vreemde domein deur /api/wallpaper, wat dit
     vanaf ons eie domein teruggee. Daar is geen CORS-vraag oor jou eie
     domein nie.

     ── WhatsApp gooi die byskrif weg ──

     `navigator.share({ files, text })` stuur albei. Elke ander app gebruik
     die teks -- Telegram, Instagram, e-pos, SMS -- maar WhatsApp ignoreer
     dit sodra daar 'n prent by is. Die prent land, die skakel nie. Dit is
     WhatsApp se kant en daar is geen manier om dit van 'n webblad af te
     verander nie.

     Daarom word die sin EERSTE op die knipbord gesit, in dieselfde tik as
     die klik (die knipbord vereis 'n vars aanraking, dus voor die fetch),
     en die kaart se dit dan: plak dit as 'n tweede boodskap. Dit is een
     ekstra lang druk vir die mens, en dit is die enigste ding wat werk.

     ── En as die prent glad nie kom nie ──

     Dan word dit GESE. 'n Stille terugval na teks is presies hoe hierdie
     fout die eerste keer verby gekom het. */
  const DEEL_SIN = 'Luister die volle boodskap by https://dewaldscheepers.com/go'

  function prentPad(url) {
    /* 'n Relatiewe pad of ons eie domein: haal dit soos dit is. */
    try {
      const u = new URL(url, window.location.href)
      if (u.origin === window.location.origin) return u.toString()
      return `/api/wallpaper?u=${encodeURIComponent(u.toString())}`
    } catch {
      return url
    }
  }

  async function deelWallpaper() {
    if (!today?.wallpaperUrl || wpBesig) return
    setWpBesig(true)
    setWpFout(null)
    setWpNota(null)
    const boodskap = `${today.title || 'Daaglikse Hoop'}\n\n${DEEL_SIN}`

    /* Voor enige `await`. Die knipbord werk net terwyl die tik nog "vars" is,
       en 'n fetch oor 'n stadige netwerk kan daardie venster verby laat gaan. */
    let gekopieer = false
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(boodskap)
        gekopieer = true
      }
    } catch {}

    let blob = null
    try {
      const r = await fetch(prentPad(today.wallpaperUrl))
      if (r.ok) {
        const b = await r.blob()
        /* 'n Foutbladsy is ook 'n geldige antwoord. Net 'n prent tel. */
        if (/^image\//.test(b.type) && b.size > 1024) blob = b
      }
    } catch {}

    if (blob) {
      const lêer = new File([blob], 'daaglikse-hoop.jpg', { type: blob.type })
      try {
        /* canShare({ files }) is die enigste betroubare toets. navigator.share
           bestaan op baie blaaiers wat NIE lêers kan deel nie, en dan gooi dit
           eers wanneer 'n mens dit roep. */
        if (navigator.canShare && navigator.canShare({ files: [lêer] })) {
          await navigator.share({ files: [lêer], text: boodskap })
          setWpNota(gekopieer
            ? 'Die prent is gestuur. WhatsApp los die woorde uit by \'n prent — die skakel is gekopieer, plak dit as \'n tweede boodskap.'
            : `Die prent is gestuur. Stuur die skakel ook: ${DEEL_SIN}`)
          setWpBesig(false)
          return
        }
      } catch (e) {
        /* Die mens het die deelvenster toegemaak. Dit is nie 'n fout nie. */
        if (e && e.name === 'AbortError') { setWpBesig(false); return }
      }

      /* Die blaaier kan nie lêers deel nie (meestal 'n rekenaar): laai af. */
      try {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'daaglikse-hoop.jpg'
        document.body.appendChild(a)
        a.click()
        a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 4000)
        setWpNota(gekopieer
          ? 'Die prent is na jou Aflaaie toe, en die skakel is gekopieer.'
          : 'Die prent is na jou Aflaaie toe. Stuur dit van daar af.')
        setWpBesig(false)
        return
      } catch {}
    }

    /* Die prent kon glad nie gekry word nie. Stuur die woorde, en se dit. */
    try {
      if (navigator.share) await navigator.share({ text: boodskap })
      else await navigator.clipboard.writeText(boodskap)
    } catch {}
    setWpFout('Die prent kon nie gestuur word nie — net die skakel is gestuur. Hou jou vinger op die foto en kies "Save image".')
    setWpBesig(false)
  }

  /* Na Pastorale Sorg. Dieselfde navigasie-gebeurtenis wat BidNou en
     SorgVorm reeds gebruik. */
  function naSorg() {
    window.dispatchEvent(new CustomEvent('bidnou-navigate', { detail: 'sorg' }))
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

  async function handleNewsletterSignup(e) {
    e.preventDefault()
    if (!nlEmail.trim()) return
    setNlState('loading')
    try {
      const r = await fetch('/api/newsletter-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: nlEmail.trim() }),
      })
      const data = await r.json()
      if (data.ok || r.ok) {
        localStorage.setItem('nl_subscribed', '1')
        setNlState('done')
      } else {
        setNlState('error')
      }
    } catch {
      setNlState('error')
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
        {/* Die "Kennisgewings af"-merkie. Dit kom van App.jsx af as 'n klaar
            element sodat hierdie skerm niks van toestemmings of tokens hoef
            te weet nie — en sodat die navigasie hier onaangeraak bly. */}
        {kennisgewingMerkie}
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

      {/* ── Die deur na Pastorale Sorg ──

          Sorg het presies EEN deur gehad: die oortjie onderaan. Niks het
          daarheen gewys nie. Die oggendkennisgewing gaan na duisende fone
          en land HIER, op Luister — die hele gehoor kom elke oggend by die
          voordeur in en niks het gesê Sorg bestaan nie.

          Dit staan onder die speler omdat 'n mens dit eers ná die boodskap
          moet sien, nie in plaas daarvan nie.

          EEN reel, en dit moet soos 'n KNOPPIE lyk. Dit was 'n kaart met 'n
          opskrif en twee reels daaronder, en dit het soos nog 'n blok teks
          gelyk — 'n mens lees dit en druk dit nie.

          Dit gaan na die Sorg-BLAD, nie na die vorm nie. Iemand wat hier
          druk, is nuuskierig; hy het nog nie besluit om sy swaarste ding te
          tik nie. 'n Vorm wat oor sy skerm oopklap, is te vinnig. */}
      <button className="sorg-deur" onClick={naSorg}>
        Dra jy iets swaars? Vertel my daarvan →
      </button>

      {nlState !== 'done' && <div className="luister-newsletter">
        <div className="nl-text">
          <span className="nl-desc">Ontvang elke week 'n e-pos vol hoop.</span>
        </div>
          <form className="nl-form" onSubmit={handleNewsletterSignup}>
            <input
              className="nl-input"
              type="email"
              placeholder="jou e-posadres"
              value={nlEmail}
              onChange={e => setNlEmail(e.target.value)}
              disabled={nlState === 'loading'}
            />
            <button className="nl-btn" type="submit" disabled={nlState === 'loading'}>
              {nlState === 'loading' ? '...' : 'INSKRYF'}
            </button>
          </form>
        {nlState === 'error' && <div className="nl-error">Probeer weer.</div>}
      </div>}

      <div className="luister-body">

        {featuredVideo ? (
          <div className="fv-card">
            <p className="fv-eyebrow">Boodskap van hoop</p>
            <p className="fv-text">{featuredVideo.text}</p>
            <div className="fv-iframe-wrap">
              <iframe
                src={`https://www.youtube.com/embed/${featuredVideo.videoId}?rel=0`}
                title="Boodskap van hoop"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="fv-iframe"
              />
            </div>
          </div>
        ) : today.wallpaperUrl ? (
          <div className="wp-card">
            <div className="wp-card-label">📱 Vandag se wallpaper</div>
            {/* Deur ONS eie domein, nie regstreeks van Firebase af nie.

                Op 'n Samsung het hierdie prent glad nie gelaai nie — 'n
                gebreekte prentjie met die woord "Wallpaper" langs dit.
                firebasestorage.googleapis.com is 'n vreemde domein en
                Samsung Internet strem dit.

                /api/wallpaper haal dit bediener-kant en gee dit terug van
                ons eie domein af, met 'n dag se kas op die rand. Dieselfde
                pad wat die deelknoppie reeds gebruik — sien prentPad() en
                api/wallpaper.js. Dit is ook vinniger: een domein minder om
                op te soek en 'n verbinding minder om op te stel. */}
            <img src={prentPad(today.wallpaperUrl)} className="wp-card-img"
                 alt="Wallpaper" loading="lazy" decoding="async" />
            <button className="wp-deel-knop" onClick={deelWallpaper} disabled={wpBesig}>
              {wpBesig ? 'Een oomblik…' : 'Deel hierdie prent'}
            </button>
            <div className="wp-card-fyn">Sit dit op jou WhatsApp-status, of stuur dit vir iemand.</div>
            {wpNota && <div className="wp-card-nota">{wpNota}</div>}
            {wpFout && <div className="wp-card-fout">{wpFout}</div>}
          </div>
        ) : null}
        {installBanner}

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
