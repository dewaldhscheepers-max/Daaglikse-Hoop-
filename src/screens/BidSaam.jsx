import { useState, useEffect, useRef } from 'react'
import { db } from '../firebase'
import {
  collection, addDoc, updateDoc, doc,
  serverTimestamp, orderBy, query, where, limit,
  increment, Timestamp, onSnapshot
} from 'firebase/firestore'
import './BidSaam.css'
import DonationCard from '../components/DonationCard'

function timeLabel(ts) {
  if (!ts) return 'Nou net'
  const date = ts.toDate ? ts.toDate()
             : ts.seconds ? new Date(ts.seconds * 1000)
             : new Date(ts)
  const diff = Date.now() - date.getTime()
  if (isNaN(diff) || diff < 0) return 'Nou net'
  if (diff < 86400000)  return 'Vandag'
  if (diff < 172800000) return 'Gister'
  return `${Math.floor(diff / 86400000)} dae gelede`
}

function getTodaySAST() {
  return new Date(Date.now() + 2 * 3600000).toISOString().slice(0, 10)
}

function formatSASTDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('af-ZA', { day: 'numeric', month: 'long' })
}

function getPrayedMilestone(count) {
  if (!count || count < 3) return null
  if (count >= 15) return 'Baie mense staan saam in gebed'
  if (count >= 7)  return 'Hierdie versoek is in gebed gedra'
  return `${count} mense het saam gebid`
}

function PrayingHandsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
      <path d="M9 12V7a2 2 0 0 1 4 0v5"/>
      <path d="M7 10V8a2 2 0 0 1 4 0"/>
      <path d="M13 10V8a2 2 0 0 1 4 0v6a5 5 0 0 1-10 0v-4a2 2 0 0 1 4 0"/>
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28" style={{flexShrink:0}}>
      <polygon points="5,3 19,12 5,21"/>
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28" style={{flexShrink:0}}>
      <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('af-ZA', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDuration(secs) {
  if (!secs || isNaN(secs)) return ''
  return `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, '0')}`
}

function EveningPrayerPlayer({ prayer }) {
  const [playing, setPlaying]   = useState(false)
  const [progress, setProgress] = useState(0)
  const [elapsed,  setElapsed]  = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

  const [amened, setAmened] = useState(() => {
    try { return JSON.parse(localStorage.getItem('amenedPrayers') || '[]').includes(prayer.id) }
    catch { return false }
  })
  const amenCount = prayer.amenCount || 0

  async function handleAmen() {
    if (amened) return
    setAmened(true)
    try {
      const list = JSON.parse(localStorage.getItem('amenedPrayers') || '[]')
      localStorage.setItem('amenedPrayers', JSON.stringify([...list, prayer.id]))
    } catch {}
    try { await updateDoc(doc(db, 'aandgebede', prayer.id), { amenCount: increment(1) }) } catch {}
  }

  function togglePlay() {
    const a = audioRef.current
    if (!a) return
    if (playing) { a.pause() } else { a.play() }
    setPlaying(p => !p)
  }

  function seek(e) {
    const a = audioRef.current
    if (!a || !a.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct  = (e.clientX - rect.left) / rect.width
    a.currentTime = pct * a.duration
  }

  async function share() {
    const text = `Luister hoe daar vanaand saam met ons gebid is:\nhttps://dewaldscheepers.com/go`
    if (navigator.share) {
      try { await navigator.share({ title: 'Daaglikse Hoop Saamgebed', text, url: 'https://dewaldscheepers.com/go' }) }
      catch {}
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    }
  }

  return (
    <div className="ep-player">
      <audio
        ref={audioRef}
        src={prayer.audioUrl}
        preload="none"
        onTimeUpdate={() => {
          const a = audioRef.current
          if (!a) return
          setElapsed(a.currentTime)
          setProgress(a.duration ? a.currentTime / a.duration * 100 : 0)
        }}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => { setPlaying(false); setProgress(0); setElapsed(0) }}
      />
      <div className="ep-controls">
        <button className="ep-play-btn" onClick={togglePlay}>
          {playing ? <PauseIcon /> : <PlayIcon />}
          <span>{playing ? 'Pouseer' : 'Luister na die gebed'}</span>
        </button>
        <button className={`ep-amen-btn${amened ? ' amened' : ''}`} onClick={handleAmen}>
          <span className="ep-amen-emoji">🙏</span>
          <span className="ep-amen-label">{amened ? 'Amen!' : 'Amen'}</span>
          {amenCount > 0 && <span className="ep-amen-count">{amenCount}</span>}
        </button>
        <button className="ep-share-btn" onClick={share}>
          <ShareIcon />
        </button>
      </div>
      <div className="ep-progress-track" onClick={seek}>
        <div className="ep-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      {duration > 0 && (
        <div className="ep-time">{formatDuration(elapsed)} / {formatDuration(duration)}</div>
      )}
    </div>
  )
}

/* ── Community prayer flow — full-screen, one by one ── */
function SaamgebedFlow({ prayers, prayed, onClose, onPray }) {
  const [queueIdx,     setQueueIdx]     = useState(0)
  const [prayedInFlow, setPrayedInFlow] = useState(new Set())
  const [done,         setDone]         = useState(false)

  const queueRef = useRef(null)
  if (!queueRef.current) {
    const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000
    queueRef.current = [...prayers]
      .filter(p => !p.reported && !prayed.has(p.id) && (p.createdAt?.seconds || 0) * 1000 >= twoDaysAgo)
      .sort((a, b) => {
        const cd = (a.prayedCount || 0) - (b.prayedCount || 0)
        if (cd !== 0) return cd
        return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
      })
  }
  const queue   = queueRef.current
  const total   = queue.length
  const current = queue[queueIdx]

  function handlePray() {
    if (!current) return
    onPray(current.id)
    setPrayedInFlow(s => new Set([...s, current.id]))
    if (queueIdx + 1 >= total) {
      setDone(true)
    } else {
      setQueueIdx(i => i + 1)
    }
  }

  if (total === 0) {
    return (
      <div className="sg-overlay">
        <button className="sg-close-btn" onClick={onClose} aria-label="Maak toe">✕</button>
        <div className="sg-done-body">
          <div className="sg-done-cross">✦</div>
          <p className="sg-done-title">Geen nuwe versoeke tans.</p>
          <p className="sg-done-sub">Kom later terug — God hoor elke gebed.</p>
          <button className="sg-back-btn" onClick={onClose}>Terug</button>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="sg-overlay">
        <button className="sg-close-btn" onClick={onClose} aria-label="Maak toe">✕</button>
        <div className="sg-done-body">
          <div className="sg-done-cross">✦</div>
          <p className="sg-done-eyebrow">Saamgebed voltooi</p>
          <p className="sg-done-title">Jy het vir {prayedInFlow.size} {prayedInFlow.size === 1 ? 'persoon' : 'mense'} gebid.</p>
          <p className="sg-done-sub">Geen versoek staan vandag alleen nie.<br/>God het jou stem gehoor.</p>
          <button className="sg-back-btn" onClick={onClose}>Terug na Gebedsmuur</button>
        </div>
      </div>
    )
  }

  const progress = total > 0 ? ((queueIdx) / total) * 100 : 0

  return (
    <div className="sg-overlay">
      <div className="sg-top-bar">
        <div className="sg-progress-track">
          <div className="sg-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="sg-top-row">
          <span className="sg-progress-label">{queueIdx + 1} van {total}</span>
          <button className="sg-close-btn" onClick={onClose} aria-label="Maak toe">✕</button>
        </div>
      </div>

      <div className="sg-body">
        <p className="sg-eyebrow">Neem 'n oomblik. Bid vir hierdie persoon.</p>

        <div className="sg-prayer-card-inner">
          <div className="sg-card-accent" />
          <p className="sg-prayer-text">{current.text}</p>
          <span className="sg-prayer-meta">Anoniem · {timeLabel(current.createdAt)}</span>
        </div>

        <p className="sg-verse">"Dra mekaar se laste, en vervul so die wet van Christus."</p>
        <p className="sg-verse-ref">Galasiërs 6:2</p>

        <button className="sg-prayed-btn" onClick={handlePray}>
          <span className="sg-prayed-icon">🙏</span>
          Ek het gebid
        </button>

        <button className="sg-stop-btn" onClick={onClose}>Ek wil ophou</button>
      </div>
    </div>
  )
}

export default function BidSaam() {
  const [prayers, setPrayers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cachedPrayers') || '[]') }
    catch { return [] }
  })
  const [text, setText]           = useState('')
  const [prayed, setPrayed]       = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('prayedFor') || '[]')) }
    catch { return new Set() }
  })
  const cachedHasPrayers = (() => { try { return JSON.parse(localStorage.getItem('cachedPrayers') || '[]').length > 0 } catch { return false } })()
  const [loading, setLoading]     = useState(!cachedHasPrayers)
  const [error, setError]         = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [prayedToast, setPrayedToast] = useState(false)
  const [reported, setReported]   = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('reportedPrayers') || '[]')) }
    catch { return new Set() }
  })
  const [visibleCount, setVisibleCount] = useState(5)

  const [testimonies, setTestimonies]               = useState(() => {
    try { return JSON.parse(localStorage.getItem('cachedTestimonies') || '[]') }
    catch { return [] }
  })
  const [visibleTestimonies, setVisibleTestimonies] = useState(3)
  const [testimonyText, setTestimonyText]           = useState('')
  const [testimonySubmitted, setTestimonySubmitted] = useState(false)
  const [amenedTestimonies, setAmenedTestimonies]   = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('amenedTestimonies') || '[]')) }
    catch { return new Set() }
  })
  const [reportedTestimonies, setReportedTestimonies] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('reportedTestimonies') || '[]')) }
    catch { return new Set() }
  })

  const [todayPrayer, setTodayPrayer] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cachedTodayPrayer') || 'null') }
    catch { return null }
  })
  const [prevPrayers, setPrevPrayers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cachedPrevPrayers') || '[]') } catch { return [] }
  })
  const [showArchive,   setShowArchive]   = useState(false)
  const [archivePlayer, setArchivePlayer] = useState(null)
  const archiveAudioRef = useRef(null)
  const [archivePlaying, setArchivePlaying] = useState(false)
  const [showScrollHint, setShowScrollHint] = useState(true)
  const [saamgebedOpen,  setSaamgebedOpen]  = useState(false)

  useEffect(() => {
    return () => {
      if (archiveAudioRef.current) { archiveAudioRef.current.pause(); archiveAudioRef.current = null }
    }
  }, [])

  useEffect(() => {
    function onScroll() { if (window.scrollY > 30) setShowScrollHint(false) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sevenDaysAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    const q = query(
      collection(db, 'prayers'),
      where('createdAt', '>=', sevenDaysAgo),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q,
      snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setPrayers(list)
        setLoading(false)
        try { localStorage.setItem('cachedPrayers', JSON.stringify(list)) } catch {}
      },
      () => { setError('Iets het nie reg gelaai nie.'); setLoading(false) }
    )
    return unsub
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'testimonies'), orderBy('createdAt', 'desc'), limit(60))
    const unsub = onSnapshot(q,
      snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setTestimonies(list)
        try { localStorage.setItem('cachedTestimonies', JSON.stringify(list)) } catch {}
      },
      () => {}
    )
    return unsub
  }, [])

  useEffect(() => {
    const q    = query(collection(db, 'aandgebede'), orderBy('date', 'desc'), limit(8))
    const unsub = onSnapshot(q,
      snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        if (list.length === 0) return
        setTodayPrayer(list[0])
        setPrevPrayers(list.slice(1))
        try {
          localStorage.setItem('cachedTodayPrayer', JSON.stringify(list[0]))
          localStorage.setItem('cachedPrevPrayers', JSON.stringify(list.slice(1)))
        } catch {}
      },
      () => {}
    )
    return unsub
  }, [])

  async function submit() {
    if (!text.trim()) return
    try {
      await addDoc(collection(db, 'prayers'), {
        text: text.trim(),
        prayedCount: 0,
        createdAt: serverTimestamp(),
        reported: false
      })
      setText('')
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 4000)
    } catch {
      setError('Kon nie stuur nie. Probeer asseblief weer.')
    }
  }

  async function togglePrayed(id) {
    if (prayed.has(id)) return
    const next = new Set(prayed)
    next.add(id)
    setPrayed(next)
    localStorage.setItem('prayedFor', JSON.stringify([...next]))
    setPrayers(ps => ps.map(p => p.id === id ? { ...p, prayedCount: (p.prayedCount || 0) + 1 } : p))
    setPrayedToast(true)
    setTimeout(() => setPrayedToast(false), 3500)
    try {
      await updateDoc(doc(db, 'prayers', id), { prayedCount: increment(1) })
    } catch {}
  }

  async function submitTestimony() {
    if (!testimonyText.trim()) return
    try {
      await addDoc(collection(db, 'testimonies'), {
        text: testimonyText.trim(),
        likeCount: 0,
        createdAt: serverTimestamp(),
      })
      setTestimonyText('')
      setTestimonySubmitted(true)
      setTimeout(() => setTestimonySubmitted(false), 4000)
    } catch {
      setError('Kon nie stuur nie. Probeer asseblief weer.')
    }
  }

  async function reportTestimony(id) {
    if (reportedTestimonies.has(id)) return
    const next = new Set(reportedTestimonies)
    next.add(id)
    setReportedTestimonies(next)
    localStorage.setItem('reportedTestimonies', JSON.stringify([...next]))
    try { await updateDoc(doc(db, 'testimonies', id), { reported: true }) } catch {}
  }

  async function likeTestimony(id) {
    if (amenedTestimonies.has(id)) return
    const next = new Set(amenedTestimonies)
    next.add(id)
    setAmenedTestimonies(next)
    localStorage.setItem('amenedTestimonies', JSON.stringify([...next]))
    setTestimonies(ts => ts.map(t => t.id === id ? { ...t, likeCount: (t.likeCount || 0) + 1 } : t))
    try { await updateDoc(doc(db, 'testimonies', id), { likeCount: increment(1) }) } catch {}
  }

  async function reportPrayer(id) {
    if (reported.has(id)) return
    const next = new Set(reported)
    next.add(id)
    setReported(next)
    localStorage.setItem('reportedPrayers', JSON.stringify([...next]))
    try { await updateDoc(doc(db, 'prayers', id), { reported: true }) } catch {}
  }

  function toggleArchivePlayer(prayer) {
    if (archiveAudioRef.current) {
      archiveAudioRef.current.pause()
      archiveAudioRef.current = null
    }
    if (archivePlayer?.id === prayer.id && archivePlaying) {
      setArchivePlaying(false)
      setArchivePlayer(null)
      return
    }
    const audio = new Audio(prayer.audioUrl)
    archiveAudioRef.current = audio
    audio.play()
    audio.onended = () => { setArchivePlaying(false); setArchivePlayer(null) }
    setArchivePlayer(prayer)
    setArchivePlaying(true)
  }

  async function shareArchivePrayer(prayer) {
    const dateLabel = prayer.coveredFrom && prayer.coveredTo && prayer.coveredFrom !== prayer.coveredTo
      ? `${formatSASTDate(prayer.coveredFrom)} tot ${formatSASTDate(prayer.coveredTo)}`
      : formatDate(prayer.coveredTo || prayer.date)
    const text = `Luister hoe daar op ${dateLabel} saam gebid is:\nhttps://dewaldscheepers.com/go`
    if (navigator.share) {
      try { await navigator.share({ title: 'Daaglikse Hoop Saamgebed', text, url: 'https://dewaldscheepers.com/go' }) }
      catch {}
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    }
  }

  // Compute live prayer count from already-loaded prayers state
  const todaySAST = getTodaySAST()
  function getLivePrayerCount(prayer) {
    if (!prayer) return 0
    const from = prayer.coveredFrom || prayer.date
    const to   = prayer.coveredTo   || prayer.date
    if (to !== todaySAST) return prayer.prayerCount || 0
    const fromMs     = from ? new Date(from + 'T00:00:00+02:00').getTime() : 0
    const toMs       = new Date(to + 'T23:59:59+02:00').getTime()
    const windowDays = (Date.now() - fromMs) / 86400000
    if (windowDays > 7) return prayer.prayerCount || 0
    const live = prayers.filter(p => {
      if (p.reported) return false
      const ts = (p.createdAt?.seconds || 0) * 1000
      return ts >= fromMs && ts <= toMs
    }).length
    return Math.max(live, prayer.prayerCount || 0)
  }

  return (
    <div className="bidsaam">
      <div className="bidsaam-header screen-header">
        <h1>Stort jou hart uit.</h1>
        <p>Jy hoef nie jou gebed mooi te laat klink nie. Skryf net wat regtig in jou hart is.</p>
        <p className="bidsaam-scripture">"Stort julle hart uit voor sy aangesig! God is 'n toevlug vir ons."</p>
        <p className="bidsaam-scripture-ref">Psalm 62:9</p>
        <p className="bidsaam-community-note">Ander mense bid ook hierdie oomblik vir versoeke op die muur.</p>
      </div>

      <div className="bidsaam-body">

        {/* ── Community prayer card ── */}
        <div className="community-prayer-card card">
          <h3 className="community-prayer-title">Bid vandag vir 3 mense</h3>
          <p className="community-prayer-verse">"Dra mekaar se laste…" — Galasiërs 6:2</p>
          <p className="community-prayer-verse">"Bid vir mekaar…" — Jakobus 5:16</p>
          <p className="community-prayer-desc">
            Wanneer jy iemand anders in gebed dra, staan daardie persoon nie meer alleen nie — en jou eie hart word ook dikwels ligter.
          </p>
          <p className="community-prayer-tagline">Geen versoek staan alleen nie.</p>
          <button className="community-prayer-btn btn-primary" onClick={() => setSaamgebedOpen(true)}>
            Begin Saamgebed
          </button>
        </div>

        {/* ── Latest Saamgebed / Aandgebed ── */}
        {todayPrayer && (() => {
          const from      = todayPrayer.coveredFrom || todayPrayer.date
          const to        = todayPrayer.coveredTo   || todayPrayer.date
          const isSameDay = from === to
          const isOld     = to !== todaySAST
          const count     = getLivePrayerCount(todayPrayer)
          const label     = isOld ? 'Laaste Saamgebed' : (isSameDay ? 'Aandgebed' : 'Saamgebed')
          const title     = isSameDay
            ? `Gebed vir ${formatSASTDate(to)} se versoeke`
            : `Saamgebed vir ${formatSASTDate(from)} tot ${formatSASTDate(to)}`
          const dateLabel = isSameDay
            ? formatDate(to)
            : `${formatSASTDate(from)} – ${formatSASTDate(to)}`
          return (
            <div className="ep-card">
              <div className="ep-card-top">
                <span className="ep-card-label">{label}</span>
                <span className="ep-card-date">{dateLabel}</span>
              </div>
              <p className="ep-card-title">{title}</p>
              <p className="ep-card-desc">
                {isSameDay
                  ? <>Dewald het oor <strong>{count}</strong> gebedsversoeke gebid.</>
                  : <>Hierdie gebed dra <strong>{count}</strong> gebedsversoeke van hierdie tydperk.</>
                }
              </p>
              <EveningPrayerPlayer prayer={todayPrayer} />
            </div>
          )
        })()}

        {/* ── Prayer input ── */}
        <div className="card prayer-input-card">
          <div className="anon-badge">🔒 Anoniem — geen name word gestoor nie</div>
          <textarea
            className="prayer-textarea"
            placeholder="Deel jou gebedsversoek hier..."
            value={text}
            onChange={e => setText(e.target.value)}
            rows={4}
            maxLength={500}
          />
          <div className="input-footer">
            <span className="char-count">{text.length}/500</span>
            <button className="btn-primary submit-btn" onClick={submit} disabled={!text.trim()}>
              Deel jou gebedsversoek
            </button>
          </div>
          {submitted && (
            <div className="submitted-msg">🙏 Jou gebedsversoek is gedeel. Ander mense bid ook vir jou. Jy is nie alleen nie.</div>
          )}
        </div>

        <h3 className="section-title">Gebedsversoeke</h3>

        {loading && <div className="prayers-loading">Besig om gebedsversoeke te laai...</div>}
        {!loading && error && <div className="prayers-error">{error}</div>}
        {!loading && !error && prayers.length === 0 && (
          <div className="prayers-empty">Wees die eerste om 'n versoek te deel. Jy is nie alleen nie.</div>
        )}

        <div className="prayer-list">
          {prayers.filter(p => !p.reported).slice(0, visibleCount).map(prayer => {
            const milestone = getPrayedMilestone(prayer.prayedCount)
            return (
              <div key={prayer.id} className="prayer-card card">
                <div className="prayer-icon">🙏</div>
                <div className="prayer-content">
                  <p className="prayer-text">{prayer.text}</p>
                  <span className="prayer-meta">Anoniem · {timeLabel(prayer.createdAt)}</span>
                  <div className="prayer-actions">
                    <button
                      className={`prayed-btn${prayed.has(prayer.id) ? ' prayed' : ''}`}
                      onClick={() => togglePrayed(prayer.id)}
                    >
                      <PrayingHandsIcon />
                      {prayed.has(prayer.id) ? 'Gebid' : 'Ek het gebid'}
                      <span className="prayed-count">{prayer.prayedCount || 0}</span>
                    </button>
                    {milestone && (
                      <span className="prayer-milestone">{milestone}</span>
                    )}
                    {!reported.has(prayer.id) && (
                      <button className="report-btn" onClick={() => reportPrayer(prayer.id)}>
                        Rapporteer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {prayers.filter(p => !p.reported).length > visibleCount && (
          <button className="load-more-btn" onClick={() => setVisibleCount(v => v + 10)}>
            Laai meer gebede
          </button>
        )}

        <div className="testimony-section">
          <div className="testimony-header">
            <div className="testimony-flame">🕊️</div>
            <h3 className="testimony-title">Getuienisse</h3>
            <p className="testimony-sub">Wat God gedoen het, was dalk nooit net vir jou bedoel nie. Jou getuienis kan iemand anders help om weer te glo.</p>
          </div>

          <div className="card testimony-input-card">
            <textarea
              className="prayer-textarea"
              placeholder="Wat het God vir jou gedoen? Hoe het Hy jou gebed beantwoord?"
              value={testimonyText}
              onChange={e => setTestimonyText(e.target.value)}
              rows={3}
              maxLength={900}
            />
            <div className="input-footer">
              <span className="char-count">{testimonyText.length}/900</span>
              <button className="testimony-submit-btn" onClick={submitTestimony} disabled={!testimonyText.trim()}>
                Deel my getuienis
              </button>
            </div>
            {testimonySubmitted && (
              <div className="submitted-msg">🕊️ Dankie. Jou getuienis kan iemand se geloof aansteek.</div>
            )}
          </div>

          {testimonies.filter(t => !t.reported).slice(0, visibleTestimonies).map(t => (
            <div key={t.id} className="testimony-card card">
              <div className="testimony-icon">✨</div>
              <div className="testimony-content">
                <p className="testimony-text">{t.text}</p>
                <span className="prayer-meta">Anoniem · {timeLabel(t.createdAt)}</span>
                <div className="prayer-actions">
                  <button
                    className={`testimony-like-btn${amenedTestimonies.has(t.id) ? ' liked' : ''}`}
                    onClick={() => likeTestimony(t.id)}
                  >
                    God is goed 🙌
                    <span className="prayed-count">{t.likeCount || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {testimonies.filter(t => !t.reported).length > visibleTestimonies && (
            <button className="load-more-btn" onClick={() => setVisibleTestimonies(v => v + 5)}>
              Laai meer getuienisse
            </button>
          )}

          {testimonies.filter(t => !t.reported).length === 0 && (
            <div className="prayers-empty">Wees die eerste om te deel wat God gedoen het.</div>
          )}
        </div>

        {prevPrayers.length > 0 && (
          <div className="ep-archive">
            <button className="ep-archive-toggle" onClick={() => setShowArchive(v => !v)}>
              Vorige Saamgebede {showArchive ? '▲' : '▼'}
            </button>
            {showArchive && (
              <div className="ep-archive-list">
                {prevPrayers.map(p => {
                  const from   = p.coveredFrom || p.date
                  const to     = p.coveredTo   || p.date
                  const label  = from !== to
                    ? `${formatSASTDate(from)} – ${formatSASTDate(to)}`
                    : formatDate(to)
                  return (
                    <div key={p.id} className="ep-archive-item">
                      <div className="ep-archive-info">
                        <span className="ep-archive-date">{label}</span>
                        <span className="ep-archive-count">Gebed oor {p.prayerCount} versoeke</span>
                      </div>
                      <div className="ep-archive-btns">
                        <button className="ep-archive-share" onClick={() => shareArchivePrayer(p)}>
                          <ShareIcon />
                        </button>
                        <button
                          className={`ep-archive-play${archivePlayer?.id === p.id && archivePlaying ? ' playing' : ''}`}
                          onClick={() => toggleArchivePlayer(p)}
                        >
                          {archivePlayer?.id === p.id && archivePlaying ? <PauseIcon /> : <PlayIcon />}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <DonationCard />
      </div>

      {/* ── Community prayer flow overlay ── */}
      {saamgebedOpen && (
        <SaamgebedFlow
          prayers={prayers}
          prayed={prayed}
          onClose={() => setSaamgebedOpen(false)}
          onPray={togglePrayed}
        />
      )}

      {prayedToast && (
        <div className="prayed-toast">Dankie. Iemand weet nou hulle dra dit nie alleen nie. 🙏</div>
      )}

      {showScrollHint && (
        <div className="scroll-hint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          <span>meer</span>
        </div>
      )}
    </div>
  )
}
