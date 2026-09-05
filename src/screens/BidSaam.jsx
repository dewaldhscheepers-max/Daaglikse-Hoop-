import { useState, useEffect, useRef } from 'react'
import { db } from '../firebase'
import {
  collection, addDoc, updateDoc, doc, getDoc,
  serverTimestamp, orderBy, query, where, limit,
  increment, Timestamp, onSnapshot
} from 'firebase/firestore'
import { magDeel, gebedSkakel, deelBoodskap } from '../data/gebedDeel'
import { toestelId } from '../data/sorgStuur'
import { merkGebidNou } from '../data/tydMetGodBerging'
import './BidSaam.css'
import DonationCard from '../components/DonationCard'
import SaturdayVideoCard from '../components/SaturdayVideoCard'

/* Die "Bid Nou sit nou hier"-strokie is vir mense wat die ou balk geken het.
   Dit wys 'n paar keer en gaan dan weg — 'n permanente banier word meubels. */
const BIDNOU_WYS = 4
function bidnouAlGesien() {
  try {
    const n = Number(localStorage.getItem('bidnou_skuif_gesien') || 0)
    if (n >= BIDNOU_WYS) return true
    localStorage.setItem('bidnou_skuif_gesien', String(n + 1))
    return false
  } catch { return true }
}

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
  if (!count || count < 1) return null
  if (count === 1) return '1 persoon het saam gebid'
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


/* ── Hier was "Jou gebedsversoek" ──

   'n Kaart bo-aan Bid Saam wat gese het hoeveel mense saam met jou gebid het,
   en 'n paar dae later gevra het hoe dit gaan.

   Dit is weg. Die skerm het met drie kaarte bo mekaar oopgemaak voordat 'n
   mens by die versoeke self gekom het, en die getal het in elk geval op die
   muur onder jou eie versoek gestaan.

   Saam daarmee is die localStorage-boekhouding weg. Dit het die id's van 'n
   mens se eie versoeke op sy foon gehou net sodat hierdie kaart hulle kon
   opsoek; niks anders het dit ooit gelees nie, en 'n lys van jou eie
   gebedsversoeke op 'n toestel is nie iets om te stoor as niemand dit gebruik
   nie. `saamSin` en `magVraHoeGaanDit` bly in src/data/gebedDeel.js met hul
   toetse -- die reels is reg; die kaart was net in die pad. */

/* ── Community prayer flow — full-screen, one by one ── */
function SaamgebedFlow({ prayers, prayed, gereed, fout, onClose, onPray, onHerprobeer }) {
  const [queueIdx,     setQueueIdx]     = useState(0)
  const [prayedInFlow, setPrayedInFlow] = useState(new Set())
  const [done,         setDone]         = useState(false)

  /* Die wagry word EEN keer gebou en dan vasgehou, sodat 'n versoek nie
     onder jou uitskuif terwyl jy bid nie.

     Dit is gebou op die eerste render, wat 'n fout was: maak jy hierdie
     skerm oop terwyl die gebede nog laai, was die lys leeg, en 'n leë
     skikking is truthy — dus is dit NOOIT weer gebou nie. 'n Mens het
     "Geen nuwe versoeke tans" gesien totdat jy uitgaan en weer inkom.

     Nou wag ons tot die data werklik terug is voordat ons dit vasmaak. */
  const queueRef = useRef(null)
  if (queueRef.current === null && gereed && !fout) {
    const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000
    queueRef.current = [...prayers]
      .filter(p => !p.reported && !prayed.has(p.id) && (p.createdAt?.seconds || 0) * 1000 >= twoDaysAgo)
      .sort((a, b) => {
        const cd = (a.prayedCount || 0) - (b.prayedCount || 0)
        if (cd !== 0) return cd
        return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
      })
  }

  // Nog besig om te laai: sê dit, moenie maak of daar niks is nie.
  if (queueRef.current === null && !fout) {
    return (
      <div className="sg-overlay">
        <button className="sg-close-btn" onClick={onClose} aria-label="Maak toe">✕</button>
        <div className="sg-done-body">
          <div className="sg-done-cross">✦</div>
          <p className="sg-done-title">Besig om die versoeke te haal…</p>
          <p className="sg-done-sub">Net 'n oomblik.</p>
        </div>
      </div>
    )
  }

  if (fout) {
    return (
      <div className="sg-overlay">
        <button className="sg-close-btn" onClick={onClose} aria-label="Maak toe">✕</button>
        <div className="sg-done-body">
          <div className="sg-done-cross">✦</div>
          <p className="sg-done-title">Ons kon die versoeke nie haal nie.</p>
          <p className="sg-done-sub">Kyk of jy aanlyn is.</p>
          <button className="sg-back-btn" onClick={onHerprobeer}>Probeer weer</button>
          <button className="sg-back-btn" onClick={onClose}>Terug</button>
        </div>
      </div>
    )
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
  /* Het Firestore al EEN keer geantwoord? 'loading' is nie genoeg nie: dit
     begin vals sodra daar 'n kas is, en dan sou die saamgebed-wagry uit ou
     data gebou word voordat die egte lys kom. */
  const [gereed, setGereed]       = useState(false)
  const [herlaai, setHerlaai]     = useState(0)
  const [error, setError]         = useState('')
  const [submitted, setSubmitted] = useState(false)
  /* "Bid vir my" — sien gebedDeel.js. `nuweId` is die id van die versoek wat
     pas geplaas is; is dit null, was die versoek nie deelbaar nie en wys ons
     geen deel-knoppie nie. */
  const [nuweId,      setNuweId]      = useState(null)
  const [krisisGewys, setKrisisGewys] = useState(false)
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

  const [showScrollHint, setShowScrollHint] = useState(true)
  const [saamgebedOpen,  setSaamgebedOpen]  = useState(false)
  /* Een keer per opening bepaal, sodat die strokie nie tydens 'n herteken
     wegflikker nie. */
  const [bidnouGesien] = useState(bidnouAlGesien)
  const versoekRef = useRef(null)

  /* Kom 'n mens van Bid Nou se "Wil jy hê ons moet saam met jou bid?", moet
     hierdie blad by die TIKKASSIE oopmaak, nie heel bo nie. Hy het pas gebid
     en wil nou skryf; om hom bo te laat begin, is om hom te laat soek.

     App.jsx stel die skerm se scrollTop na 0 wanneer die oortjie verander,
     dus wag ons een raam en skuif dan self. */
  useEffect(() => {
    let fokus = null
    try {
      fokus = sessionStorage.getItem('bidsaam_fokus')
      if (fokus) sessionStorage.removeItem('bidsaam_fokus')
      /* ── Woorde wat van Sorg af saamkom ──
       *
       * Dewald: "Indien die persoon reeds teks ingetik het, dra die teks waar
       * moontlik na Bid Saam se gebedsversoekveld oor."
       *
       * 'n Mens wat in Sorg begin tik het en dan besef dit is eintlik 'n
       * gebed, moet nie kies tussen sy woorde en die regte plek nie. Ons vul
       * dit net in as die kassie leeg is — sy eie halwe sin hier weeg
       * swaarder as iets wat van 'n ander skerm af kom. */
      const dra = sessionStorage.getItem('bidsaam_teks')
      if (dra) {
        sessionStorage.removeItem('bidsaam_teks')
        setText(t => (t.trim() ? t : dra.slice(0, 500)))
      }
    } catch { /* privaat modus */ }
    if (fokus !== 'versoek') return

    const t = setTimeout(() => {
      const n = versoekRef.current
      if (!n) return
      n.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const kassie = n.querySelector('textarea')
      if (kassie) kassie.focus({ preventScroll: true })
    }, 260)
    return () => clearTimeout(t)
  }, [])
  const [satVid,         setSatVid]         = useState({ active: false, videoId: '', title: '', subtitle: '' })

  useEffect(() => {
    getDoc(doc(db, 'config', 'saturdayVideo')).then(d => {
      if (d.exists()) setSatVid(d.data())
    }).catch(() => {})
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
        setGereed(true)
        setError('')
        try { localStorage.setItem('cachedPrayers', JSON.stringify(list)) } catch {}
      },
      () => { setError('Iets het nie reg gelaai nie.'); setLoading(false); setGereed(true) }
    )
    return unsub
  }, [herlaai])

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


  async function submit() {
    if (!text.trim()) return

    /* Die hek loop VOOR die skryf, sodat `deelbaar` reeds reg op die dokument
       staan. Die bediener doen dit weer — 'n kliënt kan lieg — maar dit hou
       die data self skoon. */
    const keuring = magDeel({ teks: text })

    try {
      const ref = await addDoc(collection(db, 'prayers'), {
        text: text.trim(),
        prayedCount: 0,
        createdAt: serverTimestamp(),
        reported: false,
        deelbaar: keuring.mag,
      })

      /* Wys die krisisnommers wanneer die woorde daarop dui. Dit gebeur ook
         wanneer die mens NIE gevra het om te deel nie — die hulp hang nie van
         'n blokkie af nie. */
      setKrisisGewys(keuring.rede === 'krisis')
      setNuweId(keuring.mag ? ref.id : null)

      setText('')
      setSubmitted(true)
      /* Nie meer 'n tydhouer van vier sekondes nie. Is daar 'n deel-knoppie,
         moet dit bly staan tot die mens self kies. */
      if (!keuring.mag && keuring.rede !== 'krisis') {
        setTimeout(() => setSubmitted(false), 6000)
      }
    } catch {
      setError('Kon nie stuur nie. Probeer asseblief weer.')
    }
  }

  /* ── Stuur my gebedsversoek ──

     Die gewone deelvenster van die foon, met WhatsApp as die natuurlike
     keuse. Die boodskap vra een ding en noem nie die app nie — sien
     deelBoodskap(). */
  async function stuurMyVersoek() {
    if (!nuweId) return
    const skakel = gebedSkakel(nuweId, window.location.origin)
    const teks   = deelBoodskap(skakel)
    if (navigator.share) {
      try { await navigator.share({ text: teks }) } catch {}
      return
    }
    try {
      await navigator.clipboard.writeText(teks)
      alert('Die boodskap is gekopieer. Plak dit in WhatsApp.')
    } catch {
      window.prompt('Kopieer hierdie boodskap:', teks)
    }
  }

  /* ── Die muur se "Gebid"-knoppie ──

     Hier het `updateDoc(doc(db, 'prayers', id), { prayedCount: increment(1) })`
     gestaan, in 'n try/catch wat niks doen nie.

     firestore.rules se `allow update: if false` op prayers. Daardie skryf het
     dus ELKE KEER stil misluk. Die getal het net plaaslik opgeloop -- op die
     mens se eie foon, in sy eie sessie -- en het nog NOOIT in die databasis
     opgegaan nie. Elke telling wat enigiemand tot vandag op hierdie muur
     gesien het, was syne alleen.

     Dit gaan nou deur dieselfde eindpunt as die gedeelde skakel, met die
     diensrekening. Een pad, een gedrag. */
  async function togglePrayed(id) {
    if (prayed.has(id)) return
    const next = new Set(prayed)
    next.add(id)
    setPrayed(next)
    localStorage.setItem('prayedFor', JSON.stringify([...next]))
    setPrayers(ps => ps.map(p => p.id === id ? { ...p, prayedCount: (p.prayedCount || 0) + 1 } : p))
    /* Dieselfde gebed, dieselfde getal: die klaar-skerm van Vandag se Tyd met
       God tel hierdie een saam. Sien merkGebidNou — dit kan nie dubbel tel nie,
       want albei paaie weier 'n versoek wat reeds in `prayedFor` staan. */
    merkGebidNou()
    setPrayedToast(true)
    setTimeout(() => setPrayedToast(false), 3500)
    try {
      const r = await fetch('/api/gebed-deel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, toestel: toestelId() }),
      })
      const d = await r.json().catch(() => ({}))
      /* Die bediener se getal wen -- ander mense het intussen ook gebid. */
      if (typeof d.saam === 'number') {
        setPrayers(ps => ps.map(p => p.id === id ? { ...p, prayedCount: d.saam } : p))
      }
    } catch { /* die gebed het gebeur, ook al het die telling nie */ }
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

        {/* ── Bid Nou ──

            Bid Nou was 'n oortjie in die balk; Sorg het daardie plek gevat.
            Die kaart staan DIREK hier, tweede op die blad, want wie Bid Nou
            elke dag gebruik, moet dit dadelik sien en nie dink dit is weg
            nie. Die bidnou-navigate-gebeurtenis is dieselfde een wat Bid Nou
            self gebruik om hierheen te kom — ons voeg niks nuuts by nie. */}
        <div className="card bidnou-kaart">
          <h3 className="bidnou-kaart-titel">
            Bid Nou
            {!bidnouGesien && <span className="bidnou-nuut">sit nou hier</span>}
          </h3>
          <p className="bidnou-kaart-teks">
            Wanneer jy nie weet wat om te bid nie, begin hier. Kies hoe jy
            vandag voel, tik op die gevoel, en bid die gebed dadelik saam.
          </p>
          <button
            className="bidnou-kaart-knop btn-primary"
            onClick={() => window.dispatchEvent(new CustomEvent('bidnou-navigate', { detail: 'bidnou' }))}
          >
            Maak Bid Nou oop
          </button>
        </div>

        {/* ── Gebedspoort Video ── */}
        {satVid.active && satVid.videoId && (
          <SaturdayVideoCard videoId={satVid.videoId} title={satVid.title} subtitle={satVid.subtitle} />
        )}

        {/* ── Prayer input ── */}
        <div className="card prayer-input-card" ref={versoekRef}>
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
              Plaas my gebedsversoek
            </button>
          </div>

          {/* ── Ná die indiening ──

              Die eerste gevoel moet wees "ek is gehoor", nie "DEEL NOU" nie.
              Daarom die sagte reël eerste, die vraag daarna, en die knoppie
              heel laaste. */}
          {submitted && (
            <div className="bvm-na">
              <p className="bvm-na-kop">Dankie. Jou gebedsversoek is geplaas. 🙏🏻</p>
              <p className="bvm-na-sag">Ons bid saam met jou.</p>

              {nuweId ? (
                <>
                  <p className="bvm-na-vra">Wil jy iemand wat jy vertrou vra om ook saam met jou te bid?</p>
                  <button className="bvm-na-knop" onClick={stuurMyVersoek}>
                    Vra iemand om saam te bid
                  </button>
                </>
              ) : (
                /* Geen skakel nie. Dit gebeur wanneer die versoek nie deelbaar
                   is nie — geen toestemming, 'n nommer in die teks, of die
                   krisishek. In AL daardie gevalle sê ons niks oor hoekom.
                   Die versoek is geplaas en dit is wat saak maak. */
                <p className="bvm-na-sag">Ander mense bid ook vir jou. Jy is nie alleen nie.</p>
              )}
            </div>
          )}

          {/* Die krisisvloei. Dit is die enigste ding wat hier BO die res
              uitkom, en dit het niks met deel te doen nie. */}
          {krisisGewys && (
            <div className="bvm-krisis">
              <p className="bvm-krisis-kop">Ons wil seker maak jy is veilig.</p>
              <p className="bvm-krisis-teks">
                Wat jy geskryf het, klink of dit dringend is. Praat asseblief nou met iemand:
              </p>
              <a className="bvm-krisis-nommer" href="tel:0800567567">SADAG · 0800 567 567</a>
              <a className="bvm-krisis-nommer" href="tel:10111">Nood · 10111</a>
              <p className="bvm-krisis-fyn">
                Jou versoek is geplaas en mense bid daarvoor. Hierdie een word net nie met 'n skakel gedeel nie.
              </p>
            </div>
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

        <DonationCard />
      </div>

      {/* ── Community prayer flow overlay ── */}
      {saamgebedOpen && (
        <SaamgebedFlow
          prayers={prayers}
          prayed={prayed}
          gereed={gereed}
          fout={!!error}
          onClose={() => setSaamgebedOpen(false)}
          onPray={togglePrayed}
          onHerprobeer={() => { setError(''); setGereed(false); setHerlaai(n => n + 1) }}
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
