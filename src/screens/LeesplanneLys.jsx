import { useState } from 'react'
import { db } from '../firebase'
import { doc, setDoc, increment } from 'firebase/firestore'
import { sharePlan } from '../shareUtil'
import './LeesplanneLys.css'

/* ── Ikone: dun lyn-ikone in plaas van emoji's ── */
const ICONS = {
  leaf: (
    <><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></>
  ),
  dove: (
    <><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/></>
  ),
  book: (
    <><path d="M2 5.5A2.5 2.5 0 0 1 4.5 3H10a2 2 0 0 1 2 2v15a1.5 1.5 0 0 0-1.5-1.5H4.5A2.5 2.5 0 0 1 2 16Z"/><path d="M22 5.5A2.5 2.5 0 0 0 19.5 3H14a2 2 0 0 0-2 2v15a1.5 1.5 0 0 1 1.5-1.5h6A2.5 2.5 0 0 0 22 16Z"/></>
  ),
  mind: (
    <><path d="M12 4.5a3.5 3.5 0 0 0-3.4 2.7A3 3 0 0 0 6 13a3 3 0 0 0 1.5 5.2A3 3 0 0 0 12 20a3 3 0 0 0 4.5-1.8A3 3 0 0 0 18 13a3 3 0 0 0-2.6-5.8A3.5 3.5 0 0 0 12 4.5Z"/><path d="M12 4.5V20"/></>
  ),
  sunrise: (
    <><path d="M12 3v2M5.6 5.6l1.4 1.4M3 12h2M19 12h2M17 7l1.4-1.4"/><path d="M8 17a4 4 0 1 1 8 0"/><path d="M3 21h18"/></>
  ),
  heart: (
    <path d="M19 14c1.5-1.5 2-3.4 2-5a5 5 0 0 0-9-3 5 5 0 0 0-9 3c0 1.6.5 3.5 2 5l7 7Z"/>
  ),
  shield: (
    <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M9 12l2 2 4-4"/></>
  ),
  bulb: (
    <><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.4.3.5.7.5 1.1v1h6v-1c0-.4.1-.8.5-1.1A6 6 0 0 0 12 3Z"/></>
  ),
  anchor: (
    <><circle cx="12" cy="5" r="2.5"/><path d="M12 7.5V21"/><path d="M5 13a7 7 0 0 0 14 0"/><path d="M3 13h4M17 13h4"/></>
  ),
  boundary: (
    <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M12 8v5"/><path d="M12 16h.01"/></>
  ),
  hands: (
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z"/>
  ),
}

const PLANS = [
  {
    id:           'angs-detox',
    event:        'open-angs-detox',
    icon:         'leaf',
    tint:         '#E8F1EA',
    stroke:       '#4A7C5E',
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
    icon:         'dove',
    tint:         '#EAEFF7',
    stroke:       '#4E6A96',
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
    icon:         'book',
    tint:         '#F3EFE6',
    stroke:       '#8A6E42',
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
    icon:         'mind',
    tint:         '#EDE8F8',
    stroke:       '#6B5C9E',
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
    icon:         'sunrise',
    tint:         '#F8F1E4',
    stroke:       '#A67C3D',
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
    icon:         'heart',
    tint:         '#F6EBEF',
    stroke:       '#9E5E76',
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
    icon:         'shield',
    tint:         '#EEEAF3',
    stroke:       '#6B5C9E',
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
    icon:         'bulb',
    tint:         '#E6F0F0',
    stroke:       '#4A7B7B',
    title:        'Dink Nuut, Leef Nuut',
    desc:         "Vernuw jou gedagtes in 5 dae — leer om toksiese gedagtes te toets, te vang en te vervang met Godse waarheid.",
    meta:         '5 dae · gratis',
    completedKey: 'dnln_completed',
    lastDayKey:   'dnln_lastDay',
    total:        5,
  },
  {
    id:           'as-alles-wegval',
    event:        'open-as-alles-wegval',
    icon:         'anchor',
    tint:         '#EDEDEF',
    stroke:       '#6A6478',
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
    icon:         'boundary',
    tint:         '#EFEEE9',
    stroke:       '#7A7255',
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
    icon:         'hands',
    tint:         '#EDE8F8',
    stroke:       '#6B5C9E',
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
  if (p.done) return 'Lees weer'
  const nextDay = p.completed.includes(p.lastDay) ? p.lastDay + 1 : p.lastDay
  return `Gaan voort — dag ${nextDay}`
}

function PlanIcon({ plan }) {
  return (
    <div className="lpl-tile" style={{ background: plan.tint }}>
      <svg viewBox="0 0 24 24" fill="none" stroke={plan.stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {ICONS[plan.icon]}
      </svg>
    </div>
  )
}

function BookmarkIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Terug
          </button>
          <h1 className="lpl-heading">Leesplanne</h1>
          <p className="lpl-sub">Bybelse leesplanne wat jy dag vir dag kan volg. Almal gratis.</p>
        </div>

        <div className="lpl-body">
          {PLANS.map(plan => {
            const p = progress[plan.id]
            const pct = Math.min(100, (p.completed.length / plan.total) * 100)
            const inProgress = p.completed.length > 0 && !p.done

            return (
              <button key={plan.id} className="lpl-card" onClick={() => openPlan(plan)}>
                <PlanIcon plan={plan} />

                <div className="lpl-card-info">
                  <div className="lpl-card-title">{plan.title}</div>
                  <div className="lpl-card-desc">{plan.desc}</div>

                  <div className="lpl-card-foot">
                    <span className={`lpl-pill${p.done ? ' done' : ''}`}>
                      {p.done ? 'Voltooi' : plan.meta}
                    </span>
                    <span className="lpl-cta">{ctaLabel(plan, p)}</span>
                  </div>

                  {inProgress && (
                    <div className="lpl-prog">
                      <div className="lpl-prog-track">
                        <div className="lpl-prog-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="lpl-prog-pct">{p.completed.length} / {plan.total}</span>
                    </div>
                  )}
                </div>

                <div className="lpl-card-actions">
                  <button
                    className={`lpl-icon-btn${saved[plan.id] ? ' saved' : ''}`}
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
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                      <polyline points="16 6 12 2 8 6"/>
                      <line x1="12" y1="2" x2="12" y2="15"/>
                    </svg>
                  </button>
                </div>
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
              Maandelikse Hoopdraer
            </button>
            <button
              className="lpl-donation-btn lpl-donation-once"
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
