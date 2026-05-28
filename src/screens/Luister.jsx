import { useState, useRef, useEffect } from 'react'
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

function NoteRow({ note, playing, onToggle }) {
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
      </div>
    </div>
  )
}

export default function Luister() {
  const [activeId, setActiveId] = useState('1')
  const [playing, setPlaying]   = useState(false)
  const [elapsed, setElapsed]   = useState(0)
  const timerRef                = useRef(null)

  const today      = SAMPLE_NOTES.find(n => n.isToday)
  const recent     = SAMPLE_NOTES.filter(n => !n.isToday)
  const activeNote = SAMPLE_NOTES.find(n => n.id === activeId) || today
  const progress   = activeNote ? Math.min(elapsed / activeNote.lengthSeconds, 1) : 0
  const todayPlaying = playing && activeId === today.id

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setElapsed(e => {
          if (e >= (activeNote?.lengthSeconds || 300)) {
            setPlaying(false)
            return 0
          }
          return e + 1
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
      setElapsed(0)
      setPlaying(true)
    }
  }

  function skip(seconds) {
    setElapsed(e => Math.max(0, Math.min(e + seconds, activeNote?.lengthSeconds || 0)))
  }

  const bySeries = recent.reduce((acc, n) => {
    ;(acc[n.series] = acc[n.series] || []).push(n)
    return acc
  }, {})

  return (
    <div className="luister">
      {/* ── Hero ── */}
      <div className="luister-hero">
        {/* Title — top, subtle dark band behind it */}
        <div className="hero-title">
          <div className="hero-title-main">Daaglikse Hoop</div>
          <div className="hero-title-sub">met Dewald Scheepers</div>
        </div>

        {/* Play button only — centred over face */}
        <div className="hero-controls">
          <button className="hero-skip" onClick={() => skip(-15)}><SkipIcon direction="back" seconds={15} /></button>
          <button className="hero-play-btn" onClick={() => toggle(today)}>
            {todayPlaying ? <PauseIcon size={36} /> : <PlayIcon size={36} />}
          </button>
          <button className="hero-skip" onClick={() => skip(15)}><SkipIcon direction="forward" seconds={15} /></button>
        </div>

        {/* Song info + progress — bottom of hero */}
        <div className="hero-song-info">
          <div className="hero-song-title">{today.title}</div>
          <div className="hero-song-ref">{today.scripture}</div>
          <div className="hero-progress">
            <span className="hero-time">{fmtTime(activeId === today.id ? elapsed : 0)}</span>
            <div className="hero-bar">
              <div className="hero-fill" style={{ width: `${activeId === today.id ? progress * 100 : 0}%` }} />
            </div>
            <span className="hero-time">{fmtTime(today.lengthSeconds)}</span>
          </div>
        </div>
      </div>

      {/* ── Recent messages — frosted, see-through ── */}
      <div className="luister-body">
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

      {activeId !== today.id && (
        <MiniPlayer
          note={activeNote}
          playing={playing}
          progress={progress}
          onToggle={() => toggle(activeNote)}
        />
      )}
    </div>
  )
}
