import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot, doc } from 'firebase/firestore'
import { eboekTotale } from '../data/eboekTotale'
import { verdeelPerTaal, deelBoodskapEn } from '../data/engelsBoeke'
import { sorteerNuutsteBo } from '../data/eboekeVolgorde'
import { openbareEngelseBoeke } from '../data/engelseBoekeOpenbaar'
import { CAMPAIGN } from '../data/campaign'
import DonationCard from '../components/DonationCard'
import FreeBookModal from '../components/FreeBookModal'
import './EngelseBoeke.css'

/* Dewald, 10 Oktober 2026: *"As ek engelse eboek share moet dit die link deel
   nie die laai app op jou foon... www.dewaldscheepers.com/english"*. Die
   ontvanger land by die Engelse boeke, nie by die Afrikaanse installeerblad. */
const DEEL_SKAKEL = 'https://www.dewaldscheepers.com/english'

/* Die laaste Engelse boekelys op HIERDIE foon — sodat 'n tweede besoek dadelik
   boeke wys. Net die witlys se velde word bewaar (`openbareEngelseBoeke`). */
const BOEKE_KAS = 'engelseBoekeKas'
function leesBoekeKas() {
  try {
    const lys = JSON.parse(localStorage.getItem(BOEKE_KAS) || '[]')
    return Array.isArray(lys) ? Object.fromEntries(lys.filter(b => b && b.id).map(b => [b.id, b])) : {}
  } catch { return {} }
}
function skryfBoekeKas(lys) {
  try {
    const skoon = openbareEngelseBoeke(lys)
    if (skoon.length) localStorage.setItem(BOEKE_KAS, JSON.stringify(skoon))
  } catch {}
}

/* Een keer gelees — die Afrikaanse blad skryf dit wanneer al die bronne in is. */
const gekasteTotale = (() => {
  try {
    const d = JSON.parse(localStorage.getItem('eboekTotale') || 'null')
    if (d && typeof d.b === 'number' && typeof d.w === 'number') return d
  } catch {}
  return { b: null, w: null }
})()

/* ── DIE ENGELSE E-BOEKBLAD ──  /english
 *
 * Dewald, 9 Oktober 2026: 'n aparte Engelse ingang wat hy met Engelssprekendes
 * kan deel sonder dat hulle eers deur die Afrikaanse app hoef te gaan.
 *
 * ── Dit skep NIKS ──
 *
 * Dieselfde besluit as Vandag se Tyd met God s'n. Die boeke leef in dieselfde
 * `books`-versameling; die teller is dieselfde `stats/ebooks_given`; die READ
 * loop deur dieselfde `/api/free-book-download`, wat die teller optel. Daar is
 * GEEN aparte Engelse teller nie — die twee getalle hierbo is woord vir woord
 * die som van die Afrikaanse blad (`eboekTotale`), en 'n Engelse aflaai tel
 * reg daar by.
 *
 * ── Die vier bronne ──
 *
 * Presies soos Meer.jsx: `liveCount/liveValue` uit Firestore, `rgCount` uit
 * /api/campaign-count, `vjDoen` uit /api/volg-jesus-openbaar. Val enige om, bly
 * die getal net kleiner — 'n blad wat op 'n teller wag, is erger. Sien
 * eboekTotale.js vir die reël wat alles bind.
 *
 * ── Die deel-knoppie ──
 *
 * Dewald, 10 Oktober 2026: *"it also needs a share button next to ebook."* Die
 * skakel gaan na /english (sien DEEL_SKAKEL). Die sin is Engels (`deelBoodskapEn`).
 *
 * ── Geen LUISTER nie ──
 *
 * Daar was 'n ▶ LISTEN-knoppie wat die blaaier se spraak gebruik het. Dewald,
 * 10 Oktober 2026: *"Just remove the audio versions it isnt right. Just keep
 * the ebooks."* Die stem verskil per foon en klink soos 'n masjien. Moet dit nie
 * terugsit nie; 'n egte opname per boek is die enigste weergawe wat sou werk.
 */
export default function EngelseBoeke({ onClose, isInstalled, installPrompt }) {
  const [bookOverrides, setBookOverrides] = useState(leesBoekeKas)
  /* Het EEN bron al geantwoord (kas, eindpunt of Firestore)? Tot dan sê die
     blad "Loading", nie "on the way" nie — daardie sin het gelieg terwyl die
     boeke nog net nie aangekom het nie. */
  const [gelaai, setGelaai] = useState(() => Object.keys(leesBoekeKas()).length > 0)
  const [rgCount,   setRgCount]   = useState(null)
  const [liveCount, setLiveCount] = useState(null)
  const [liveValue, setLiveValue] = useState(null)
  const [vjDoen,    setVjDoen]    = useState(0)
  const [activeBook, setActiveBook] = useState(null)
  const [claimedMap, setClaimedMap] = useState({})
  const [deelKopie,  setDeelKopie]  = useState(false)

  // ── Books ──
  /* Drie bronne, vinnigste eerste, en geen een mag 'n beter antwoord met 'n
     swakker een vervang nie:
       1. die foon se eie kas (`engelseBoekeKas`) — dadelik, by elke terugkeer;
       2. /api/engelse-boeke — een gewone GET wat die rand vyf minute kas; dit
          is wat 'n VREEMDELING op 'n gedeelde skakel binne 'n oomblik sien;
       3. Firestore se lewendige luisteraar — stadig om op te bou, maar hy hou
          die blad by wanneer die admin iets verander.
     Sien die kop van api/engelse-boeke.mjs vir hoekom. */
  useEffect(() => {
    let dood = false
    fetch('/api/engelse-boeke')
      .then(r => r.json())
      .then(j => {
        if (dood) return
        const lys = Array.isArray(j && j.boeke) ? j.boeke : []
        if (lys.length) {
          const o = Object.fromEntries(lys.map(b => [b.id, b]))
          setBookOverrides(prev => ({ ...prev, ...o }))   /* voeg by, vervang nooit met minder nie */
          skryfBoekeKas(lys)
        }
        setGelaai(true)
      })
      .catch(() => {})
    return () => { dood = true }
  }, [])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'books'), snap => {
      /* 'n Leë antwoord uit die SDK se eie kas is nie "geen boeke nie" — dit is
         "nog niks gehoor nie". Aanvaar dit nooit bo wat ons reeds wys nie. */
      if (snap.empty && snap.metadata.fromCache) return
      const o = {}
      snap.docs.forEach(d => { o[d.id] = d.data() })
      setBookOverrides(o)
      setGelaai(true)
      skryfBoekeKas(Object.entries(o).map(([id, d]) => ({ id, ...d })))
    }, () => {})
    return unsub
  }, [])

  // ── The four counter sources (same as Meer) ──
  useEffect(() => {
    fetch('/api/campaign-count')
      .then(r => r.json())
      .then(d => setRgCount(d && d.total ? d.total : CAMPAIGN.goal))
      .catch(() => setRgCount(CAMPAIGN.goal))
  }, [])

  useEffect(() => {
    let dood = false
    fetch('/api/volg-jesus-openbaar')
      .then(r => r.json())
      .then(j => { if (!dood) setVjDoen(Number(j && j.doen) || 0) })
      .catch(() => { if (!dood) setVjDoen(0) })
    return () => { dood = true }
  }, [])

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'stats', 'ebooks_given'), snap => {
      const data = snap.exists() ? snap.data() : {}
      setLiveCount(data.count ?? 0)
      setLiveValue(data.value ?? 0)
    }, () => { setLiveCount(0); setLiveValue(0) })
    return unsub
  }, [])

  // ── Which uploaded books are English ──
  const alleBoeke = Object.entries(bookOverrides)
    .filter(([, d]) => d && d.title)
    .map(([id, d]) => ({ id, color: '#EDE8F8', emoji: '📚', ...d }))
  const { engels } = verdeelPerTaal(alleBoeke)
  const boeke = sorteerNuutsteBo(engels)

  useEffect(() => {
    const map = {}
    boeke.forEach(b => {
      try { if (localStorage.getItem(`fb_claimed_${b.id}`) === '1') map[b.id] = true } catch {}
    })
    setClaimedMap(map)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookOverrides])

  // ── Counter (same pure sum as the Afrikaans page) ──
  const { boeke: totalBooks, waarde: totalValue } =
    eboekTotale({ rgCount, liveCount, liveValue, vjDoen })
  /* Die laaste goeie paar, dieselfde as die Afrikaanse blad s'n (`eboekTotale`
     in localStorage) — sodat 'n mens 'n getal sien in plaas van "—" terwyl die
     bronne nog laai. */
  const wysBoeke  = totalBooks !== null ? totalBooks : gekasteTotale.b
  const wysWaarde = totalValue !== null ? totalValue : gekasteTotale.w

  /* ── Deel ──
     Dewald, 10 Oktober 2026: 'n gedeelde Engelse boek gaan na /english. Die ou
     `/boek/<id>` het op die AFRIKAANSE e-boekblad geland, waar Engelse boeke
     juis weggesteek is — die ontvanger sou die boek nooit gekry het nie. */
  async function deelBoek(boek) {
    const skakel = DEEL_SKAKEL
    const boodskap = deelBoodskapEn(boek.title, skakel)
    try {
      if (navigator.share) { await navigator.share({ title: boek.title, text: boodskap }); return }
    } catch (e) { if (e && e.name === 'AbortError') return }
    try {
      await navigator.clipboard.writeText(boodskap)
      setDeelKopie(true)
      setTimeout(() => setDeelKopie(false), 2500)
    } catch { /* no clipboard — then we say nothing */ }
  }

  const fmt = n => Number(n).toLocaleString('en-ZA').replace(/,/g, ' ')

  return (
    <div className="en-screen">
      {/* Top: back (for readers already in the app) + download the app.
          Dewald, 10 Oktober 2026: twee knoppies — 'n TERUG vir wie reeds in die
          app is (dit maak die Engelse blad toe en land op die Afrikaanse
          e-boekblad), en 'n AFLAAI-knoppie na /go. */}
      <div className="en-appbar">
        <button className="en-terug" onClick={onClose} aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
               strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
        {/* Net vir wie die app NOG NIE het nie — 'n mens wat reeds in die
            geïnstalleerde app is (standalone), sien net Terug. */}
        {!isInstalled && (
          <a className="en-kry" href="/go">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v11m0 0l-4-4m4 4l4-4M5 19h14" />
            </svg>
            Download the Daaglikse Hoop app
          </a>
        )}
      </div>

      {/* Header + shared counter */}
      <div className="en-header">
        <div className="en-header-label">Free English Library</div>

        {/* ── A word from Dewald ──
         *
         * Dewald, 10 Oktober 2026: die persoonlike kaart (foto, naam, boodskap)
         * staan nou heel BO — direk onder "Free English Library", VOOR die
         * hoofopskrif — sodat 'n gesig en 'n hart die eerste ding is wat 'n mens
         * sien. Dieselfde kaart, net 'n ander plek. Die foto is 'n klein, ronde
         * <img> (geen volskerm-tekstuur, dus geen Android-strepe-risiko). */}
        <div className="en-oor en-oor-bo">
          <img className="en-oor-foto" src="/beelde/dewald-en.webp" alt="Dewald Scheepers"
               width="72" height="72" loading="lazy" />
          <div className="en-oor-lyf">
            <p className="en-oor-naam">Dewald Scheepers</p>
            <p className="en-oor-teks">
              Out of my own brokenness, God has used these e-books to touch thousands of
              lives with hope. My prayer is that these words will encourage you, strengthen
              your faith, and remind you that you are not alone.
            </p>
          </div>
        </div>

        <h1 className="en-header-title">Free English e-books</h1>
        <p className="en-header-sub">
          Practical, biblical encouragement for your thoughts, faith and everyday life.
        </p>
        <div className="en-stats-row">
          <div className="en-stat-box">
            <span className="en-stat-num">{wysBoeke === null ? '—' : `${fmt(wysBoeke)}+`}</span>
            <span className="en-stat-lbl">e-books given away</span>
          </div>
          <div className="en-stat-box">
            <span className="en-stat-num">{wysWaarde === null ? '—' : `R${fmt(Math.floor(wysWaarde))}+`}</span>
            <span className="en-stat-lbl">in free books given away</span>
          </div>
        </div>
      </div>

      <div className="en-body">
        {/* Same donation card, in English */}
        <DonationCard
          taal="en"
          bewys={wysWaarde === null ? null : `R${fmt(Math.floor(wysWaarde))}+ in free books already given away`}
          titel="Help the next person receive free hope too."
          teks="Your gift helps keep the app, e-books and daily messages free."
        />

        <div className="en-sec-head">
          <h3 className="en-sec-title">📚 English books</h3>
          {boeke.length > 0 && <span className="en-sec-count">{boeke.length} {boeke.length === 1 ? 'book' : 'books'}</span>}
        </div>

        {boeke.length === 0 && !gelaai ? (
          <p className="en-leeg">Loading the books…</p>
        ) : boeke.length === 0 ? (
          <p className="en-leeg">
            New English books are on the way. Check back soon — or open the full app below.
          </p>
        ) : (
          <div className="en-book-list">
            {boeke.map(b => (
              <div key={b.id} className="en-book-wrap">
                <div className="en-book">
                  <div className="en-cover" style={{ background: b.coverUrl ? 'transparent' : (b.color || '#EDE8F8') }}>
                    {b.coverUrl
                      ? <img src={b.coverUrl} className="en-cover-img" alt={b.title} />
                      : <span className="en-emoji">{b.emoji || '📚'}</span>}
                    <span className="en-badge">FREE</span>
                  </div>
                  <div className="en-info">
                    <h4 className="en-title">{b.title}</h4>
                    {b.desc && <p className="en-desc">{b.desc}</p>}
                    <div className="en-foot">
                      {claimedMap[b.id] && b.pdfUrl
                        ? <a href={b.pdfUrl} target="_blank" rel="noopener noreferrer" className="en-read">📖 Read free</a>
                        : <button className="en-read" onClick={() => setActiveBook(b)}>📖 Read free</button>}
                      <button className="en-deel" onClick={() => deelBoek(b)} aria-label={`Share ${b.title}`}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                          <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
                        </svg>
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom: open the full app — net vir wie dit nog NIE het nie,
            dieselfde reël as die aflaai-knoppie bo. 'n Mens in die
            geïnstalleerde app sien dit nie. */}
        {!isInstalled && (
          <a className="en-openapp" href="/go">
            Open the full Daaglikse Hoop app
            <small>Daily voice notes · prayer wall · Bible · games</small>
          </a>
        )}
      </div>

      {deelKopie && <div className="en-toast">✓ Link copied — paste it to share</div>}

      {activeBook && (
        <FreeBookModal
          book={activeBook}
          taal="en"
          installPrompt={installPrompt}
          isInstalled={isInstalled}
          onClose={() => {
            const map = { ...claimedMap }
            try { if (localStorage.getItem(`fb_claimed_${activeBook.id}`) === '1') map[activeBook.id] = true } catch {}
            setClaimedMap(map)
            setActiveBook(null)
          }}
        />
      )}
    </div>
  )
}
