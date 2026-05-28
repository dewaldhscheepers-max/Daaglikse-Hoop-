import { useState, useRef, useEffect } from 'react'
import './Luister.css'

/* ── Sample data (replace with Firebase later) ── */
const SAMPLE_NOTES = [
  {
    id: '1',
    title: 'Hy Sien Jou Trane',
    scripture: 'Psalm 56:9 — "U tel my omswerwinge; berg my trane in u kruik."',
    series: 'God Sien Jou Trane',
    lengthSeconds: 312,
    audioUrl: null,
    isToday: true,
    color: '#E8E0F0'
  },
  {
    id: '2',
    title: 'Wanneer Jy Uitgeput Is',
    scripture: 'Matteus 11:28 — "Kom na My toe, almal wat vermoeid en belas is."',
    series: 'Rustelose Gedagtes',
    lengthSeconds: 284,
    audioUrl: null,
    isToday: false,
    color: '#F2C9A8'
  },
  {
    id: '3',
    title: 'Giftige Gedagtes',
    scripture: 'Romeine 12:2 — "Word verander deur die vernuwing van julle gemoed."',
    series: 'TOKSIES',
    lengthSeconds: 398,
    audioUrl: null,
    isToday: false,
    color: '#D4E8C8'
  }
]

function fmtTime(sec) {
  const m = Math.floor(sec / 60)
  const s = String(sec % 60).padStart(2, '0')
  return `${m}:${s}`
}

/* ── Mini Player ── */
function MiniPlayer({ note, playing, progress, onToggle }) {
  if (!note) return null
  return (
    <div className="mini-player">
      <div className="mini-info">
        <span className="mini-title">{note.title}</span>
        <span className="mini-series">{note.series}</span>
      </div>
      <button className="mini-play" onClick={onToggle}>
        {playing ? <PauseIcon /> : <PlayIcon size={16} />}
      </button>
      <div className="mini-bar">
        <div className="mini-fill" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  )
}

/* ── Featured card (today's note) ── */
function FeaturedCard({ note, playing, progress, onToggle }) {
  return (
    <div className="featured-card card">
      <div className="featured-badge">Vandag se boodskap</div>
      <h2 className="featured-title">{note.title}</h2>
      <p className="featured-scripture">{note.scripture}</p>

      <div className="featured-controls">
        <button className="play-btn-big" onClick={onToggle}>
          {playing ? <PauseIcon size={28} /> : <PlayIcon size={28} />}
        </button>
        <span className="featured-time">{fmtTime(note.lengthSeconds)}</span>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>

      {note.audioUrl === null && (
        <p className="demo-notice">Demo — koppel Firebase om oudio te laai</p>
      )}
    </div>
  )
}

/* ── List row ── */
function NoteRow({ note, playing, onToggle }) {
  return (
    <div className="note-row">
      <div className="note-thumb" style={{ background: note.color }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--brown)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
      </div>
      <div className="note-info">
        <span className="note-title">{note.title}</span>
        <span className="note-scripture">{note.scripture.split('—')[0].trim()}</span>
        <span className="note-series">{note.series}</span>
      </div>
      <div className="note-right">
        <span className="note-length">{fmtTime(note.lengthSeconds)}</span>
        <button className="play-btn-small" onClick={onToggle}>
          {playing ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
        </button>
      </div>
    </div>
  )
}

/* ── Icons ── */
function PlayIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21"/>
    </svg>
  )
}
function PauseIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16"/>
      <rect x="14" y="4" width="4" height="16"/>
    </svg>
  )
}

/* ── Main screen ── */
export default function Luister() {
  const [activeId, setActiveId]   = useState(null)
  const [playing, setPlaying]     = useState(false)
  const [progress, setProgress]   = useState(0)
  const audioRef                  = useRef(null)
  const timerRef                  = useRef(null)

  const today    = SAMPLE_NOTES.find(n => n.isToday)
  const recent   = SAMPLE_NOTES.filter(n => !n.isToday)
  const activeNote = SAMPLE_NOTES.find(n => n.id === activeId) || today

  /* Simulate playback progress for demo */
  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 1) { setPlaying(false); return 0 }
          return p + (1 / (activeNote?.lengthSeconds || 300))
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [playing, activeNote])

  function toggle(note) {
    if (activeId === note.id) {
      setPlaying(p => !p)
    } else {
      setActiveId(note.id)
      setProgress(0)
      setPlaying(true)
    }
  }

  /* Group recent by series */
  const bySeries = recent.reduce((acc, n) => {
    ;(acc[n.series] = acc[n.series] || []).push(n)
    return acc
  }, {})

  return (
    <div className="luister">
      {/* Header */}
      <div className="luister-header screen-header">
        <h1>Daaglikse Hoop</h1>
        <p>Jou daaglikse woord van hoop</p>
      </div>

      <div className="luister-body">
        {/* Featured */}
        <FeaturedCard
          note={today}
          playing={playing && activeId === today.id}
          progress={activeId === today.id ? progress : 0}
          onToggle={() => toggle(today)}
        />

        {/* Recent by series */}
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
              />
            ))}
          </div>
        ))}
      </div>

      {/* Mini player (shows when playing a note while scrolled away from featured) */}
      {activeId && activeId !== today.id && (
        <MiniPlayer
          note={activeNote}
          playing={playing}
          progress={progress}
          onToggle={() => setPlaying(p => !p)}
        />
      )}
    </div>
  )
}
