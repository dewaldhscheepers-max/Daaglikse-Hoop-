import { useState } from 'react'
import { db } from '../firebase'
import { doc, setDoc, increment } from 'firebase/firestore'
import { sharePlan } from '../shareUtil'
import './LeesplanneLys.css'

const PLANS = [
  {
    id:           'angs-detox',
    event:        'open-angs-detox',
    cover:        '/bg/bg1.webp',
    title:        'Angs Detox',
    desc:         "Leer om angstige gedagtes te herken, te toets en te vervang — 7 dae wat jou vryheid gee om anders te dink.",
    meta:         '7 dae · gratis',
    completedKey: 'angsd_completed',
    lastDayKey:   'angsd_lastDay',
    total:        7,
  },
  {
    id:           'wanneer-angs-toeslaan',
    event:        'open-wanneer-angs-toeslaan',
    cover:        '/bg/bg5.webp',
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
    cover:        '/bg/bg3.webp',
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
    cover:        '/bg/bg0.webp',
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
    cover:        '/bg/bg7.webp',
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
    cover:        '/bg/bg9.webp',
    title:        'Wanneer Mense Jou Seermaak',
    desc:         'Wanneer mense jou seermaak — genees jou hart, herwin jou lewe, loop vry.',
    meta:         '14 dae · gratis',
    completedKey: 'snv_completed',
    lastDayKey:   'snv_lastDay',
    total:        14,
  },
  {
    id:           'leuens-duiwel',
    event:        'open-leuens-duiwel',
    cover:        '/bg/bg6.webp',
    title:        '7 Leuens van die Duiwel',
    desc:         'Herken die vyand se stem en kies God se waarheid elke dag.',
    meta:         '7 dae · gratis',
    completedKey: 'ld_completed',
    lastDayKey:   'ld_lastDay',
    total:        7,
  },
  {
    id:           'dink-nuut-leef-nuut',
    event:        'open-dink-nuut-leef-nuut',
    cover:        '/bg/bg11.webp',
    title:        'Dink Nuut, Leef Nuut',
    desc:         "Vernuw jou gedagtes in 5 dae — leer om toksiese gedagtes te toets, te vang en te vervang met God se waarheid.",
    meta:         '5 dae · gratis',
    completedKey: 'dnln_completed',
    lastDayKey:   'dnln_lastDay',
    total:        5,
  },
  {
    id:           'as-alles-wegval',
    event:        'open-as-alles-wegval',
    cover:        '/bg/bg13.webp',
    title:        'As Alles Wegval',
    desc:         "Job, die duiwel en die God van herstel — vir wanneer lyding jou lewe binneval.",
    meta:         '7 dae · gratis',
    completedKey: 'aaw_completed',
    lastDayKey:   'aaw_lastDay',
    total:        7,
  },
  {
    id:           'toksies',
    event:        'open-toksies',
    cover:        '/bg/bg4.webp',
    title:        'Toksies',
    desc:         'Herken verhoudings wat jou leegmaak, stel grense met liefde, en bewaak die vrede wat God jou gegee het.',
    meta:         '13 dae · gratis',
    completedKey: 'toksies_completed',
    lastDayKey:   'toksies_lastDay',
    total:        13,
  },
  {
    id:           'deursoek-breek-stuur',
    event:        'open-deursoek-breek-stuur',
    cover:        '/bg/bg2.webp',
    title:        'Deursoek my · Breek my · Stuur my',
    desc:         '7 dae van eerlike gebede wat jou lewe verander — van veilige gebede na gevaarlike oorgawe.',
    meta:         '7 dae · gratis',
    completedKey: 'dbs_completed',
    lastDayKey:   'dbs_lastDay',
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
  if (!p.lastDay && p.completed.length === 0) return 'Begin die plan'
  if (p.done) return 'Voltooi — lees weer'
  const nextDay = p.completed.includes(p.lastDay) ? p.lastDay + 1 : p.lastDay
  return `Gaan voort — dag ${nextDay} van ${plan.total}`
}

function BookmarkIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16 6 12 2 8 6"/>
      <line x1="12" y1="2" x2="12" y2="15"/>
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

  function handleShare(e, plan) {
    e.stopPropagation()
    sharePlan(plan.title, `${plan.title} — ${plan.meta}\n\nLees dit gratis op Daaglikse Hoop:`)
  }

  function openPlan(plan) {
    window.dispatchEvent(new CustomEvent(plan.event))
  }

  return (
    <div className="lpl-overlay">
      <div className="lpl-screen">
        <div className="lpl-header">
          <button className="lpl-back" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Terug
          </button>
          <h1 className="lpl-heading">Leesplanne</h1>
          <p className="lpl-sub">Bybelse leesplanne — dag vir dag, gratis.</p>
        </div>

        <div className="lpl-body">
          {PLANS.map(plan => {
            const p = progress[plan.id]
            const pct = p.total > 0 ? (p.completed.length / plan.total) * 100 : 0
            const inProgress = p.lastDay && p.completed.length > 0 && !p.done

            return (
              <button key={plan.id} className="lpl-card" onClick={() => openPlan(plan)}>
                <div className="lpl-cover">
                  <img src={plan.cover} alt="" loading="lazy" draggable="false" />
                </div>

                <div className="lpl-card-body">
                  <div className="lpl-card-top">
                    <div className="lpl-card-text">
                      <p className="lpl-card-title">{plan.title}</p>
                      <p className="lpl-card-desc">{plan.desc}</p>
                    </div>
                    <div className="lpl-card-actions">
                      <button
                        className={`lpl-icon-btn${saved[plan.id] ? ' is-saved' : ''}`}
                        onClick={e => handleSave(e, plan.id)}
                        aria-label={saved[plan.id] ? 'Verwyder stoor' : 'Stoor'}
                      >
                        <BookmarkIcon filled={!!saved[plan.id]} />
                      </button>
                      <button
                        className="lpl-icon-btn"
                        onClick={e => handleShare(e, plan)}
                        aria-label="Deel"
                      >
                        <ShareIcon />
                      </button>
                    </div>
                  </div>

                  <div className="lpl-card-foot">
                    <span className={`lpl-meta-pill${p.done ? ' is-done' : ''}`}>
                      {p.done ? 'Voltooi' : plan.meta}
                    </span>
                    <span className="lpl-cta-label">{ctaLabel(plan, p)}</span>
                  </div>

                  {inProgress && (
                    <div className="lpl-progress-wrap">
                      <div className="lpl-progress-track">
                        <div className="lpl-progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="lpl-progress-label">{p.completed.length} / {plan.total}</span>
                    </div>
                  )}
                </div>
              </button>
            )
          })}

          <div className="lpl-support">
            <p className="lpl-support-text">
              Hierdie leesplanne is gratis. As dit jou gehelp het, help ons om meer te skep.
            </p>
            <button
              className="lpl-support-btn lpl-support-primary"
              onClick={() => window.dispatchEvent(new CustomEvent('open-hoop-vennoot'))}
            >
              Maandelikse Hoopdraer
            </button>
            <button
              className="lpl-support-btn lpl-support-ghost"
              onClick={() => window.dispatchEvent(new CustomEvent('open-donation'))}
            >
              Eenmalige bydrae
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
