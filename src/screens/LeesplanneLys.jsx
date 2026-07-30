import { useState } from 'react'
import { db } from '../firebase'
import { doc, setDoc, increment } from 'firebase/firestore'
import './LeesplanneLys.css'

const PLANS = [
  {
    id:           'wanneer-angs-toeslaan',
    event:        'open-wanneer-angs-toeslaan',
    icon:         '🕊️',
    title:        'Wanneer Angs Toeslaan',
    desc:         "Vyf dae deur Filippense 4 — leer om jou te verbly, te bid en vrede te ontvang selfs wanneer die lewe swaar is.",
    meta:         '5 dae · gratis',
    completedKey: 'wat_completed',
    lastDayKey:   'wat_lastDay',
    total:        5,
  },
  {
    id:           'bybel-maklik-gemaak',
    event:        'open-bybel-maklik-gemaak',
    icon:         '📖',
    title:        'Die Bybel Maklik Gemaak',
    desc:         "Stap deur al 66 boeke van die Bybel in 67 dae — met verduidelikings en 'n selftoets elke dag.",
    meta:         '67 dae · gratis',
    completedKey: 'bmg_completed',
    lastDayKey:   'bmg_lastDay',
    total:        67,
  },
  {
    id:           'rustelose-gedagtes',
    event:        'open-rustelose-gedagtes',
    icon:         '🧠',
    title:        'Rustelose Gedagtes',
    desc:         "21 dae, 11 sleutels — leer om gedagtes te vang voordat hulle jou vang.",
    meta:         '21 dae · gratis',
    completedKey: 'rg_completed',
    lastDayKey:   'rg_lastDay',
    total:        21,
  },
  {
    id:           'dinge-verander',
    event:        'open-dinge-verander',
    icon:         '✨',
    title:        'Dinge Wat Jou Lewe Kan Verander',
    desc:         'Dag-vir-dag waarhede wat jou help om anders te dink, bid en leef.',
    meta:         '24 dae · gratis',
    completedKey: 'dvk_completed',
    lastDayKey:   'dvk_lastDay',
    total:        24,
  },
  {
    id:           'seer-na-vryheid',
    event:        'open-seer-na-vryheid',
    icon:         '💙',
    title:        "'N Reis van Seer na Vryheid",
    desc:         'Wanneer mense jou seermaak — genees jou hart, herwin jou lewe, loop vry.',
    meta:         '14 dae · gratis',
    completedKey: 'snv_completed',
    lastDayKey:   'snv_lastDay',
    total:        14,
  },
  {
    id:           'leuens-duiwel',
    event:        'open-leuens-duiwel',
    icon:         '⚔️',
    title:        '7 Leuens van die Duiwel',
    desc:         'Herken die vyand se stem en kies God se waarheid elke dag.',
    meta:         '7 dae · gratis',
    completedKey: 'ld_completed',
    lastDayKey:   'ld_lastDay',
    total:        7,
  },
]

function readProgress(plan) {
  try {
    const completed = JSON.parse(localStorage.getItem(plan.completedKey) || '[]')
    const lastDay   = parseInt(localStorage.getItem(plan.lastDayKey) || '0') || null
    return { completed, lastDay, done: completed.length >= plan.total }
  } catch {
    return { completed: [], lastDay: null, done: false }
  }
}

function ctaLabel(plan, p) {
  if (!p.lastDay && p.completed.length === 0) return 'BEGIN DIE PLAN →'
  if (p.done) return 'VOLTOOI · LEES WEER →'
  const nextDay = p.completed.includes(p.lastDay) ? p.lastDay + 1 : p.lastDay
  return `GAAN VOORT — DAG ${nextDay} VAN ${plan.total} →`
}

function BookmarkIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

export default function LeesplanneLys({ onClose }) {
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem('likedPlans') || '{}') } catch { return {} }
  })
  const [progress] = useState(() => {
    const p = {}
    PLANS.forEach(plan => { p[plan.id] = readProgress(plan) })
    return p
  })

  function handleSave(e, planId) {
    e.stopPropagation()
    const wasSaved = saved[planId]
    const delta = wasSaved ? -1 : 1
    const next  = { ...saved, [planId]: !wasSaved }
    setSaved(next)
    try { localStorage.setItem('likedPlans', JSON.stringify(next)) } catch {}
    setDoc(doc(db, 'readingPlanLikes', planId), { count: increment(delta) }, { merge: true }).catch(() => {})
  }

  function openPlan(plan) {
    window.dispatchEvent(new CustomEvent(plan.event))
  }

  return (
    <div className="lpl-overlay">
      <div className="lpl-screen">
        <div className="lpl-header">
          <button className="lpl-back" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Terug
          </button>
          <div className="lpl-title-row">
            <span className="lpl-heading">📖 Leesplanne</span>
          </div>
          <p className="lpl-sub">Kort Bybelse leesplanne wat jy dag vir dag kan volg.</p>
        </div>

        <div className="lpl-body">
          {PLANS.map(plan => {
            const p = progress[plan.id]
            return (
              <button key={plan.id} className="lpl-card" onClick={() => openPlan(plan)}>
                <span className="lpl-card-icon">{plan.icon}</span>
                <div className="lpl-card-info">
                  <div className="lpl-card-title">{plan.title}</div>
                  <div className="lpl-card-desc">{plan.desc}</div>
                  <div className="lpl-card-meta">{plan.meta}</div>
                  <div className={`lpl-card-cta${p.done ? ' done' : ''}`}>{ctaLabel(plan, p)}</div>
                </div>
                <button
                  className={`lpl-bookmark-btn${saved[plan.id] ? ' saved' : ''}`}
                  onClick={e => handleSave(e, plan.id)}
                  aria-label={saved[plan.id] ? 'Verwyder stoor' : 'Stoor'}
                >
                  <BookmarkIcon filled={!!saved[plan.id]} />
                </button>
              </button>
            )
          })}

          <div className="lpl-donation-section">
            <p className="lpl-donation-text">
              Hierdie leesplanne is gratis. As dit jou gehelp het, help ons om meer inhoud te skep.
            </p>
            <button
              className="lpl-donation-btn"
              onClick={() => window.dispatchEvent(new CustomEvent('open-hoop-vennoot'))}
            >
              💜 Maandelikse Hoopdraer
            </button>
            <button
              className="lpl-donation-btn lpl-donation-once"
              onClick={() => window.dispatchEvent(new CustomEvent('open-donation'))}
            >
              🙏 Eenmalige bydrae
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
