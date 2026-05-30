import { useState, useEffect } from 'react'
import { db } from '../firebase'
import {
  collection, addDoc, updateDoc, doc,
  serverTimestamp, orderBy, query, where, increment, Timestamp, onSnapshot
} from 'firebase/firestore'
import './BidSaam.css'

function timeLabel(ts) {
  if (!ts) return 'Nou net'
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  const diff = Date.now() - date.getTime()
  if (diff < 86400000)  return 'Vandag'
  if (diff < 172800000) return 'Gister'
  return `${Math.floor(diff / 86400000)} dae gelede`
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

export default function BidSaam() {
  const [prayers, setPrayers]     = useState(() => {
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
      () => {
        setError('Iets het nie reg gelaai nie. Probeer asseblief weer.')
        setLoading(false)
      }
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
    } catch { /* offline — already updated locally */ }
  }

  async function reportPrayer(id) {
    if (reported.has(id)) return
    const next = new Set(reported)
    next.add(id)
    setReported(next)
    localStorage.setItem('reportedPrayers', JSON.stringify([...next]))
    try {
      await updateDoc(doc(db, 'prayers', id), { reported: true })
    } catch { /* offline */ }
  }

  return (
    <div className="bidsaam">
      <div className="bidsaam-header screen-header">
        <h1>Bid Saam</h1>
        <p>Ons is hier vir mekaar. Deel jou versoek anoniem en laat ons saam bid.</p>
      </div>

      <div className="bidsaam-body">
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
            <div className="submitted-msg">🙏 Jou gebedsversoek is gedeel. Jy is nie alleen nie.</div>
          )}
        </div>

        <h3 className="section-title">Gebedsversoeke</h3>

        {loading && (
          <div className="prayers-loading">Besig om gebedsversoeke te laai...</div>
        )}

        {!loading && error && (
          <div className="prayers-error">{error}</div>
        )}

        {!loading && !error && prayers.length === 0 && (
          <div className="prayers-empty">Wees die eerste om 'n versoek te deel. Jy is nie alleen nie.</div>
        )}

        <div className="prayer-list">
          {prayers.map(prayer => (
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
                  {!reported.has(prayer.id) && (
                    <button className="report-btn" onClick={() => reportPrayer(prayer.id)}>
                      Rapporteer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {prayedToast && (
        <div className="prayed-toast">Dankie. Iemand weet nou hulle dra dit nie alleen nie. 🙏</div>
      )}
    </div>
  )
}
