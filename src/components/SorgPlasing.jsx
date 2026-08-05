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
import { hoopVir } from '../data/sorgVideos'
import SorgVideo from './SorgVideo'
import SorgDeelSteun from './SorgDeelSteun'
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

/* Net http en https, nooit iets anders nie.

   Die bediener keur dit reeds wanneer 'n antwoord geskryf word, maar dit is
   die verkeerde plek om op te vertrou: die skakel word HIER 'n klikbare ding
   op 'n openbare bladsy. 'n `javascript:`-skakel wat op enige manier
   deurkom — 'n toekomstige admin-gereedskap, 'n herstel uit 'n rugsteun, 'n
   fout — sou kode laat loop by elke mens wat daarop druk.

   Kom daar iets anders as http of https, wys ons NIKS. */
function veiligeSkakel(u) {
  const s = String(u || '').trim()
  return /^https?:\/\//i.test(s) ? s : ''
}

/* Is daar werklik 'n antwoord om te wys?

   'n Antwoord met 'n onbekende tipe, of 'n stemnota sonder klank, het 'n leë
   "Dewald antwoord"-blok laat verskyn. Dit is erger as geen antwoord nie:
   dit belowe iets wat nie daar is nie, en dan slaan die valpad na 'n video
   ook nie aan nie. */
function egteAntwoord(a) {
  if (!a) return null
  const bron = veiligeSkakel(a.bron)
  const teks = String(a.teks || '').trim()
  if (a.tipe === 'oudio' && bron) return { ...a, bron, teks }
  if (a.tipe === 'video' && bron) return { ...a, bron, teks }
  if (teks) return { ...a, tipe: 'teks', bron: '', teks }
  return null
}

export default function SorgPlasing({ plasing, videos = [] }) {
  const [saam, setSaam] = useState(plasing.saam || 0)
  const [gedra, setGedra] = useState(() => draSaamReeds(plasing.id))

  const antwoord = egteAntwoord(plasing.antwoord)

  /* ── Elke plasing moet iets dra wat help ──

     Dit is die reel waarop die hele muur staan: nooit net iemand se pyn
     alleen op 'n skerm nie. Dit was gebreek. Die video by 'n plasing is
     opsioneel in die keurpaneel, dus was 'n plasing sonder antwoord EN
     sonder 'n gekose video heeltemal kaal — en dit is die gewone geval,
     want Dewald antwoord nie binne die eerste uur nie.

     Nou val ons terug op die biblioteek: 'n video wat by die onderwerp pas,
     anders die bree een, anders enige. Presies dieselfde valpad as die een
     wat iemand kry direk nadat hy gestuur het. */
  const gekies = plasing.videoId
    ? (videos.find(v => v.videoId === plasing.videoId) ||
       { id: plasing.id + '-v', videoId: plasing.videoId, titel: 'Iets wat dalk nou kan help' })
    : null

  const terugval = !antwoord && !gekies && videos.length
    ? (hoopVir(plasing.onderwerp, { videos, week: null }) || {}).video || null
    : null

  const video = gekies || terugval

  async function dra() {
    if (gedra) return
    setGedra(true)
    setSaam(n => n + 1)          // dadelik, ook op 'n stadige lyn
    const n = await draSaam(plasing.id)
    if (typeof n === 'number') setSaam(n)
  }

  return (
    <article className="sp-kaart" id={`sorg-plasing-${plasing.id}`}>
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
            /* `preload="metadata"`, nie "none" nie. Met "none" weet die
               blaaier nie hoe lank die opname is nie en die speler wys
               0:00 / 0:00 — dit lyk stukkend, en 'n mens druk dit nie. Net
               die metadata is 'n paar kilogreep; die klank self laai steeds
               eers wanneer iemand speel. */
            <audio className="sp-oudio" controls preload="metadata" src={antwoord.bron}>
              Jou blaaier kan nie hierdie opname speel nie.
            </audio>
          )}

          {antwoord.tipe === 'video' && (
            <a className="sp-antwoord-skakel" href={antwoord.bron} target="_blank" rel="noopener noreferrer">
              Kyk Dewald se antwoord
            </a>
          )}

          {antwoord.teks && <p className="sp-antwoord-teks">{antwoord.teks}</p>}

          {/* Deel eerste. 'n Antwoord wat iemand gehelp het, is die beste
              ding wat gedeel kan word — en elke deel bring iemand nuut. */}
          <SorgDeelSteun soort="plasing" id={plasing.id} />
        </div>
      )}

      {/* ── Is daar nog nie 'n antwoord nie, dan iets wat wel help ── */}
      {!antwoord && video && (
        <div className="sp-hoop">
          <p className="sp-hoop-kop">Iets wat jou dalk nou kan help</p>
          <SorgVideo video={video} />
          <SorgDeelSteun soort="video" id={video.videoId} titel={video.titel} />
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
