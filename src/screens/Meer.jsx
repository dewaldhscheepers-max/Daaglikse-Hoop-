import { useState, useEffect, useRef } from 'react'
import { BOOKS as STATIC_BOOKS } from '../data/books'
import { db } from '../firebase'
import { collection, onSnapshot, doc } from 'firebase/firestore'
import { CAMPAIGN } from '../data/campaign'
import DonationCard from '../components/DonationCard'
import FreeBookModal from '../components/FreeBookModal'
import './Meer.css'
import './HuiseVanHoop.css'
import KinderBibloteek from './KinderBibloteek'
import LeesplanneLys from './LeesplanneLys'
import { KINDER_BOEKE } from '../data/kinderBoeke'
import { sorteerNuutsteBo } from '../data/eboekeVolgorde'
import { boekeWatWys } from '../data/kinderBoekeWys'
import { ToetsKnoppie } from '../components/KennisgewingKnoppie'
import { huidigeToken } from '../data/kennisgewingLees'

const STATIC_IDS = new Set(STATIC_BOOKS.map(b => b.id))

function fmtNum(n) { return n.toLocaleString('af-ZA') }

/* ── Free book card ── */
function FreeBookCard({ book, claimed, onClaim, downloadCount }) {
  const pdfUrl = book.pdfUrl
  return (
    <div className="book-card">
      <div className="book-cover" style={{ background: book.coverUrl ? 'transparent' : book.color }}>
        {book.coverUrl
          ? <img src={book.coverUrl} className="book-cover-img" alt={book.title} />
          : <span className="book-emoji">{book.emoji || '📚'}</span>}
        <span className="book-badge free-badge">GRATIS</span>
      </div>
      <div className="book-info">
        {book.badge && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span className="book-new-badge">{book.badge}</span>
            {downloadCount > 0 && (
              <span className="book-download-count">{downloadCount.toLocaleString('af-ZA')} keer afgelaai</span>
            )}
          </div>
        )}
        <h4 className="book-title">{book.title}</h4>
        <p className="book-desc">{book.desc}</p>
        <div className="book-footer">
          {claimed
            ? pdfUrl
              ? <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="btn-free book-buy-btn">📥 Laai af</a>
              : <button className="btn-free book-buy-btn" onClick={onClaim}>📥 Laai af</button>
            : <button className="btn-primary book-buy-btn" onClick={onClaim}>Kry gratis →</button>
          }
        </div>
      </div>
    </div>
  )
}

/* ── Main screen ── */
/* Die laaste totale wat ons WEL geken het. Een keer gelees, buite die
   komponent, sodat dit nie by elke render weer uit localStorage kom nie. */
const gekasteTotale = (() => {
  try {
    const d = JSON.parse(localStorage.getItem('eboekTotale') || 'null')
    if (d && typeof d.b === 'number' && typeof d.w === 'number') return d
  } catch {}
  return { b: null, w: null }
})()

export default function Meer({ targetBookId, onScrolled, installPrompt, isInstalled }) {
  /* ── "Stuur vir my 'n toetsboodskap" ──

     Die enigste eerlike bewys dat hierdie foon ons kan hoor. Daar is geen
     "is hierdie token lewendig"-navraag by Google nie; 'n mens leer dit eers
     wanneer 'n stuur UNREGISTERED teruggee. Die bediener stuur dus EEN egte
     boodskap en se wat gebeur het. Sien api/toets-kennisgewing.js. */
  async function toetsKennisgewing() {
    const token = huidigeToken()
    if (!token) {
      return { ok: false, boodskap: 'Hierdie foon is nie ingeteken nie. Tik op "Kennisgewings af" bo-aan Luister.' }
    }
    const r = await fetch('/api/toets-kennisgewing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const j = await r.json().catch(() => ({}))
    return {
      ok: !!j.ok,
      boodskap: j.boodskap || 'Iets het verkeerd geloop. Probeer asseblief weer.',
    }
  }

  const [bookOverrides,       setBookOverrides]       = useState({})
  /* ── Die twee groot getalle bo-aan ──

     Hulle het voor 'n mens se oe gespring: eers 7 681, en sowat tien
     sekondes later 8 545. Die rede is dat hulle uit TWEE bronne kom —
     `rgCount` uit /api/campaign-count en `liveCount` uit Firestore — en
     albei het 'n plekhouer gehad wat soos 'n antwoord gelyk het:
     CAMPAIGN.goal en 0.

     'n Getal oor hoeveel boeke weggegee is en wat dit werd is, wat voor
     iemand se oe met 900 verander, lyk soos 'n leuen. Dit is die laaste
     plek waar 'n mens 'n raaiskoot moet wys.

     Nou: die laaste GOEIE totale word in localStorage gehou en dadelik
     gewys, en 'n vars bladlaai wys 'n rustige — totdat albei bronne in is.
     Niks spring meer nie. */
  const [rgCount,             setRgCount]             = useState(null)
  const [liveCount,           setLiveCount]           = useState(null)
  const [liveValue,           setLiveValue]           = useState(null)
  const [activeBook,          setActiveBook]          = useState(null)
  const [claimedMap,          setClaimedMap]          = useState({})
  const [showKinderBibloteek, setShowKinderBibloteek] = useState(false)
  const [showLeesplanne,     setShowLeesplanne]     = useState(false)

  // Scroll to target book
  useEffect(() => {
    if (!targetBookId) return
    const t = setTimeout(() => {
      const el = document.getElementById(`book-${targetBookId}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        if (onScrolled) onScrolled()
      }
    }, 150)
    return () => clearTimeout(t)
  }, [targetBookId])

  // Load book overrides from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'books'), snap => {
      const overrides = {}
      snap.docs.forEach(d => { overrides[d.id] = d.data() })
      setBookOverrides(overrides)
    })
    return unsub
  }, [])

  /* ── Hoeveel kinderboeke daar WERKLIK is ──

     Die banier het `KINDER_BOEKE.length` gewys — die ingeboude lys. Dit staan
     vir altyd op sewe, ook nadat 'n agtste boek opgelaai is. Die banier het
     dus 'n ander getal gewys as die blad waarheen hy lei.

     Dieselfde reel as die biblioteek self, uit dieselfde lêer, sodat die twee
     nie weer kan verskil nie. */
  const [kinderBoeke, setKinderBoeke] = useState(KINDER_BOEKE)
  useEffect(() => {
    let lewendig = true
    fetch('/api/kinder-boeke-list', { headers: { accept: 'application/json' } })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then(d => { if (lewendig) setKinderBoeke(boekeWatWys(d.books, KINDER_BOEKE)) })
      .catch(() => {})
    return () => { lewendig = false }
  }, [])

  /* Kom die API nie deur nie, val ons terug op die ou plekhouer. Sonder
     hierdie terugval bly `rgCount` vir altyd null en die twee getalle wys
     vir altyd 'n strepie — 'n dooie eindpunt sou dus die hele banier
     doodmaak. */
  function fetchRgCount() {
    fetch('/api/campaign-count')
      .then(r => r.json())
      .then(d => setRgCount(d && d.total ? d.total : CAMPAIGN.goal))
      .catch(() => setRgCount(CAMPAIGN.goal))
  }

  useEffect(() => {
    fetchRgCount()
  }, [])

  // Load liveCount + liveValue from stats/ebooks_given
  useEffect(() => {
    /* Bestaan die dokument nie, is die antwoord NUL en nie "ons weet nie" —
       anders hang die banier vir altyd op 'n strepie. Dieselfde by 'n fout. */
    const unsub = onSnapshot(doc(db, 'stats', 'ebooks_given'), snap => {
      const data = snap.exists() ? snap.data() : {}
      setLiveCount(data.count ?? 0)
      setLiveValue(data.value ?? 0)
    }, () => { setLiveCount(0); setLiveValue(0) })
    return unsub
  }, [])

  // Build claimedMap from localStorage
  function buildClaimedMap(overrides) {
    const map = {}
    STATIC_BOOKS.forEach(b => {
      if (localStorage.getItem(`fb_claimed_${b.id}`) === '1') map[b.id] = true
    })
    Object.keys(overrides).forEach(id => {
      if (!STATIC_IDS.has(id) && localStorage.getItem(`fb_claimed_${id}`) === '1') map[id] = true
    })
    // Also accept old huise_claimed key for RG (backwards compat)
    if (localStorage.getItem('huise_claimed') === '1') map['rustelose-gedagtes'] = true
    return map
  }

  useEffect(() => {
    setClaimedMap(buildClaimedMap(bookOverrides))
  }, [bookOverrides])

  const BOOKS = [
    /* ── Die opgelaaide boeke, NUUTSTE BO ──

       Hier het 'n sortering gestaan wat net die een boek met die
       NUUT-baadjie laat dryf het. Al die ander het gebly in die volgorde
       waarin Firestore hulle gee — alfabeties op die dokument se id — dus
       het 'n vars opgelaaide boek iewers in die middel geland.

       Die reel is nou een reel, en dit staan met sy toetse in
       src/data/eboekeVolgorde.js: uitgelig eerste, dan nuutste eerste. */
    ...sorteerNuutsteBo(
      Object.entries(bookOverrides)
        .filter(([id, d]) => !STATIC_IDS.has(id) && d.title)
        .map(([id, d]) => {
          const isRG = id === 'rustelose-gedagtes' || (d.title || '').toLowerCase().includes('rustelose')
          return { id, color: '#EDE8F8', emoji: '📚', ...d, ...(isRG ? { badge: 'NUUT', isRG: true } : {}) }
        })
    ),
    // Static books with Firestore overrides for pdfUrl/coverUrl
    ...STATIC_BOOKS.map(b => {
      const ov = bookOverrides[b.id] || {}
      return { ...b, pdfUrl: ov.pdfUrl ?? b.pdfUrl ?? null, coverUrl: ov.coverUrl ?? null }
    }),
  ]

  // Omslae vir die Leesplanne-kaart — Bybel Maklik Gemaak, Rustelose Gedagtes, Dink Nuut
  const LP_PROMO_IDS = ['bybel-hulpbron', 'rustelose-gedagtes', 'dink-nuut-leef-nuut']
  const lpPromoCovers = LP_PROMO_IDS
    .map(id => {
      const ov = bookOverrides[id] || {}
      const st = BOOKS.find(b => b.id === id) || {}
      return ov.coverUrl || st.coverUrl || null
    })
    .filter(Boolean)

  /* Albei bronne moet in wees voordat ons 'n getal wys. */
  const getalleGereed = rgCount !== null && liveCount !== null && liveValue !== null
  const totalBooks = getalleGereed ? rgCount + 3000 + liveCount        : null
  const totalValue = getalleGereed ? rgCount * 110 + 150000 + liveValue : null

  /* Hou die laaste goeie paar, sodat 'n mens wat terugkom dadelik iets sien
     in plaas van 'n strepie wat dan 'n getal word. */
  useEffect(() => {
    if (!getalleGereed) return
    try { localStorage.setItem('eboekTotale', JSON.stringify({ b: totalBooks, w: totalValue })) } catch {}
  }, [getalleGereed, totalBooks, totalValue])

  const wysBoeke = totalBooks !== null ? totalBooks : gekasteTotale.b
  const wysWaarde = totalValue !== null ? totalValue : gekasteTotale.w

  return (
    <div className="meer">
      {/* Impact Header */}
      <div className="screen-header meer-header">
        <div className="meer-header-label">GRATIS HOOP-BIBLIOTEEK</div>
        <h1 className="meer-header-title">Elke e-boek is gratis</h1>
        <p className="meer-header-sub">Hoop behoort nie net beskikbaar te wees vir mense wat kan betaal nie.</p>
        <div className="meer-stats-row">
          <div className="meer-stat-box">
            <span className="meer-stat-num">{wysBoeke === null ? '—' : `${fmtNum(wysBoeke)}+`}</span>
            <span className="meer-stat-lbl">e-boeke afgelaai</span>
          </div>
          <div className="meer-stat-box">
            <span className="meer-stat-num">{wysWaarde === null ? '—' : `R${Math.floor(wysWaarde).toLocaleString('af-ZA')}+`}</span>
            <span className="meer-stat-lbl">se e-boeke gratis weggegee</span>
          </div>
        </div>
      </div>

      <div className="meer-body">
        <DonationCard />

        {/* ── Kinder promo card ── */}
        <div
          className="kinder-promo"
          role="button"
          tabIndex={0}
          onClick={() => setShowKinderBibloteek(true)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowKinderBibloteek(true) }}
        >
          <div className="kinder-promo-row">
            <div className="kinder-promo-text">
              <span className="kinder-promo-badge">NUUT</span>
              <h2 className="kinder-promo-title">Klein Hartjies, Groot Waarhede</h2>
              <p className="kinder-promo-subtitle">Interaktiewe Bybelse prenteboeke vir kinders van 2–5 jaar.</p>
              <p className="kinder-promo-tagline">Lees saam. Beweeg saam. Plant God se waarheid in klein hartjies.</p>
              <div className="kinder-promo-count">{kinderBoeke.length} gratis kinderboeke beskikbaar</div>
            </div>
            <div className="kinder-promo-covers" aria-hidden="true">
              {[KINDER_BOEKE[0], KINDER_BOEKE[3], KINDER_BOEKE[4]].map((b, i) => (
                <div key={i} className="kinder-promo-cover">
                  <img src={b.cover} alt="" />
                </div>
              ))}
            </div>
          </div>
          <button className="kinder-promo-btn" onClick={e => { e.stopPropagation(); setShowKinderBibloteek(true) }}>
            SIEN DIE KINDERBOEKE →
          </button>
        </div>

        {/* ── Leesplanne promo card ── */}
        <div
          className="lp-promo"
          role="button"
          tabIndex={0}
          onClick={() => setShowLeesplanne(true)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowLeesplanne(true) }}
        >
          <div className="lp-promo-row">
            <div className="lp-promo-left">
              <h2 className="lp-promo-title">Leesplanne</h2>
              <p className="lp-promo-sub">Kort en langer Bybelse leesplanne wat jy dag vir dag kan volg. Almal gratis.</p>
            </div>
            {lpPromoCovers.length > 0 && (
              <div className="lp-promo-covers" aria-hidden="true">
                {lpPromoCovers.map((src, i) => (
                  <div key={i} className="lp-promo-cover">
                    <img src={src} alt="" loading="lazy" draggable="false" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="lp-promo-btn" onClick={e => { e.stopPropagation(); setShowLeesplanne(true) }}>
            SIEN PLANNE →
          </button>
        </div>

        {/* ── "Kry ek kennisgewings?" ──

            Vir die mense vir wie ALLES reg lyk en wat steeds niks kry nie.
            Hulle sien geen merkie op Luister nie, want toestemming is daar
            en die intekening is daar — maar hulle token is by FCM dood en
            net die bediener weet dit.

            'n Groen merkie op 'n skerm bewys niks. Een egte boodskap wel. */}
        <div className="meer-section">
          <div className="section-header">
            <h3 className="section-title">🔔 Kennisgewings</h3>
          </div>
          <p className="kg-toets-lyf">
            Kry jy nie elke oggend jou boodskap nie? Stuur vir jouself een nou,
            dan weet ons of hierdie foon ons kan hoor.
          </p>
          <ToetsKnoppie opToets={toetsKennisgewing} />
        </div>

        {/* All books */}
        <div className="meer-section">
          <div className="section-header">
            <h3 className="section-title">📚 Al die e-boeke</h3>
            <span className="section-count">{BOOKS.length} boeke</span>
          </div>
          <div className="book-list">
            {BOOKS.map(b => (
              <div key={b.id} id={`book-${b.id}`}>
                <FreeBookCard
                  book={b}
                  claimed={!!claimedMap[b.id]}
                  onClaim={() => setActiveBook(b)}
                  downloadCount={b.isRG ? rgCount : undefined}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Die privaatheidsbeleid ──
             Google Play se User Data-beleid vra dat die beleid op TWEE plekke
             staan: op die winkelblad EN binne die app self. Een van die twee is
             nie genoeg nie — dit is 'n gewone rede vir 'n afgekeurde aansoek.

             Dit staan hier onderaan die Meer-blad omdat dit die enigste skerm is
             waar 'n mens tot heel onder rol en waar 'n stil reël niks in die pad
             is nie. Dit is 'n gewone <a>, nie 'n roete in die app nie: die
             bladsy is 'n statiese HTML-lêer wat laai al sou die app se
             JavaScript val, en Google se keurders maak dit in 'n blaaier oop. */}
        <p className="meer-privaatheid">
          <a href="/privaatheid" target="_blank" rel="noopener noreferrer">Privaatheidsbeleid</a>
        </p>
      </div>

      {showKinderBibloteek && (
        <KinderBibloteek onClose={() => setShowKinderBibloteek(false)} />
      )}

      {showLeesplanne && (
        <LeesplanneLys onClose={() => setShowLeesplanne(false)} />
      )}

      {activeBook && (
        <FreeBookModal
          book={activeBook}
          installPrompt={installPrompt}
          isInstalled={isInstalled}
          onClose={() => {
            setClaimedMap(buildClaimedMap(bookOverrides))
            setActiveBook(null)
            // Refresh RG count in case they just downloaded it
            if (activeBook.isRG) fetchRgCount()
          }}
        />
      )}
    </div>
  )
}
