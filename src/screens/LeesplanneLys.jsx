import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { doc, setDoc, increment } from 'firebase/firestore'
import './LeesplanneLys.css'

const PLANS = [
  {
    id:    'bybel-maklik-gemaak',
    event: 'open-bybel-maklik-gemaak',
    icon:  '📖',
    title: 'Die Bybel Maklik Gemaak',
    desc:  'Stap deur al 66 boeke van die Bybel in 67 dae — met verduidelikings en 'n selftoets elke dag.',
    meta:  '67 dae · gratis',
  },
  {
    id:    '11-dae-vrede',
    event: 'open-daevrede',
    icon:  '🕊️',
    title: '11 Dae van Vrede',
    desc:  "'n Kort leesplan vir wanneer jou gedagtes raas en jou hart moeg is.",
    meta:  '11 dae · gratis',
  },
  {
    id:    'dinge-verander',
    event: 'open-dinge-verander',
    icon:  '✨',
    title: 'Dinge Wat Jou Lewe Kan Verander',
    desc:  'Dag-vir-dag waarhede wat jou help om anders te dink, bid en leef.',
    meta:  '24 dae · gratis',
  },
  {
    id:    'seer-na-vryheid',
    event: 'open-seer-na-vryheid',
    icon:  '💙',
    title: "'N Reis van Seer na Vryheid",
    desc:  'Wanneer mense jou seermaak — genees jou hart, herwin jou lewe, loop vry.',
    meta:  '14 dae · gratis',
  },
  {
    id:    'leuens-duiwel',
    event: 'open-leuens-duiwel',
    icon:  '⚔️',
    title: '7 Leuens van die Duiwel',
    desc:  'Herken die vyand se stem en kies God se waarheid elke dag.',
    meta:  '7 dae · gratis',
  },
]

export default function LeesplanneLys({ onClose }) {
  const [likedPlans, setLikedPlans] = useState(() => {
    try { return JSON.parse(localStorage.getItem('likedPlans') || '{}') } catch { return {} }
  })

  function handlePlanLike(e, planId) {
    e.stopPropagation()
    const alreadyLiked = likedPlans[planId]
    const delta = alreadyLiked ? -1 : 1
    const next = { ...likedPlans, [planId]: !alreadyLiked }
    setLikedPlans(next)
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
          {PLANS.map(plan => (
            <button
              key={plan.id}
              className="lpl-card"
              onClick={() => openPlan(plan)}
            >
              <span className="lpl-card-icon">{plan.icon}</span>
              <div className="lpl-card-info">
                <div className="lpl-card-title">{plan.title}</div>
                <div className="lpl-card-desc">{plan.desc}</div>
                <div className="lpl-card-meta">{plan.meta}</div>
              </div>
              <div className="lpl-card-right">
                <button
                  className={`lpl-like-btn${likedPlans[plan.id] ? ' liked' : ''}`}
                  onClick={e => handlePlanLike(e, plan.id)}
                  aria-label={likedPlans[plan.id] ? 'Ongedoen hou' : 'Hou'}
                >
                  {likedPlans[plan.id] ? '♥' : '♡'}
                </button>
                <span className="lpl-arrow">›</span>
              </div>
            </button>
          ))}

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
