/* ────────────────────────────────────────────────────────────
   Een plasing op die muur.

   Die vorm is die hele punt, en dit is presies wat Dewald gevra het:

     ┌────────────────────────────────────┐
     │  iemand se woorde                  │
     │  — Anoniem · 5 Augustus            │
     │                                    │
     │  ┌──────────────────────────────┐  │
     │  │ Dewald antwoord              │  │  ← DIREK daaronder
     │  │ ▶ luister                    │  │
     │  └──────────────────────────────┘  │
     │                                    │
     │  ♡ 37 mense dra dit saam met jou   │
     └────────────────────────────────────┘

   Die antwoord is nie 'n aparte blad nie en nie 'n draad nie — dit sit binne
   dieselfde kaart, want dit is die enigste manier waarop 'n mens sien dat
   daar op sy ding geantwoord is.

   Is daar nog nie 'n antwoord nie, dra die plasing 'n VIDEO. Nooit net
   iemand se pyn alleen op 'n skerm nie.

   Geen kommentaar nie. Geen vreemdeling se raad onder 'n vrou se beskrywing
   van haar huwelik nie.

   Geen transform of opacity op :active nie — net kleur. Sien CLAUDE.md.
   ──────────────────────────────────────────────────────────── */

import { useState } from 'react'
import { onderwerpNaam } from '../data/sorgOnderwerpe'
import { draSaam, draSaamReeds } from '../data/sorgMuur'
import SorgVideo from './SorgVideo'
import './SorgPlasing.css'

const MAANDE = [
  'Januarie', 'Februarie', 'Maart', 'April', 'Mei', 'Junie',
  'Julie', 'Augustus', 'September', 'Oktober', 'November', 'Desember',
]

function skryfDatum(d) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d || ''))
  if (!m) return ''
  return `${Number(m[3])} ${MAANDE[Number(m[2]) - 1] || ''}`
}

export default function SorgPlasing({ plasing, videos = [] }) {
  const [saam, setSaam] = useState(plasing.saam || 0)
  const [gedra, setGedra] = useState(() => draSaamReeds(plasing.id))

  const antwoord = plasing.antwoord
  const video = plasing.videoId
    ? (videos.find(v => v.videoId === plasing.videoId) ||
       { id: plasing.id + '-v', videoId: plasing.videoId, titel: 'Iets wat dalk nou kan help' })
    : null

  async function dra() {
    if (gedra) return
    setGedra(true)
    setSaam(n => n + 1)          // dadelik, ook op 'n stadige lyn
    const n = await draSaam(plasing.id)
    if (typeof n === 'number') setSaam(n)
  }

  return (
    <article className="sp-kaart">
      <p className="sp-teks">{plasing.teks}</p>

      <p className="sp-wie">
        {plasing.naam || 'Anoniem'}
        {plasing.datum ? ` · ${skryfDatum(plasing.datum)}` : ''}
        {onderwerpNaam(plasing.onderwerp) ? ` · ${onderwerpNaam(plasing.onderwerp)}` : ''}
      </p>

      {/* ── Dewald se antwoord, DIREK onder die woorde ── */}
      {antwoord && (
        <div className="sp-antwoord">
          <p className="sp-antwoord-kop">Dewald antwoord</p>

          {antwoord.tipe === 'oudio' && (
            <audio className="sp-oudio" controls preload="none" src={antwoord.bron}>
              Jou blaaier kan nie hierdie opname speel nie.
            </audio>
          )}

          {antwoord.tipe === 'video' && (
            <a className="sp-antwoord-skakel" href={antwoord.bron} target="_blank" rel="noopener noreferrer">
              Kyk Dewald se antwoord
            </a>
          )}

          {antwoord.teks && <p className="sp-antwoord-teks">{antwoord.teks}</p>}
        </div>
      )}

      {/* ── Is daar nog nie 'n antwoord nie, dan iets wat wel help ── */}
      {!antwoord && video && (
        <div className="sp-hoop">
          <p className="sp-hoop-kop">Iets wat jou dalk nou kan help</p>
          <SorgVideo video={video} />
        </div>
      )}

      {/* ── Geselskap, nie 'n punt nie ── */}
      <button className={`sp-saam${gedra ? ' gedra' : ''}`} onClick={dra} disabled={gedra}>
        <span className="sp-saam-hart" aria-hidden="true">♡</span>
        {saam > 0
          ? `${saam} ${saam === 1 ? 'mens dra' : 'mense dra'} dit saam met jou`
          : 'Ek dra dit saam met jou'}
      </button>
    </article>
  )
}
