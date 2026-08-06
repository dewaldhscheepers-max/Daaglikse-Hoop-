/* ────────────────────────────────────────────────────────────
   Een plasing op die muur.

   Die vorm is die hele punt, en dit is presies wat Dewald gevra het:

     ┌────────────────────────────────────┐
     │  Moet ek die tablet koop?          │  ← die vraag, in een reel
     │  Anoniem · 6 Augustus · Geld       │
     │                                    │
     │  iemand se woorde (ses reels)      │
     │  Lees verder                       │
     │                                    │
     │  ┌──────────────────────────────┐  │
     │  │ Dewald antwoord              │  │  ← DIREK daaronder
     │  │ Wanneer is 'n groot uitgawe  │  │  ← WAAROP hy antwoord
     │  │ 'n wyse belegging?           │  │
     │  │ ▶ luister                    │  │
     │  └──────────────────────────────┘  │
     │                                    │
     │  ♡ 37 mense dra dit saam met jou   │
     └────────────────────────────────────┘

   Die twee OPSKRIFTE is die belangrikste ding aan hierdie kaart.

   Sonder hulle begin dit as 'n blok teks, en 'n mens moet vyftien reels lees
   voordat hy weet waaroor dit gaan. Op 'n muur met dertig plasings lees
   niemand dan meer nie — dit word 'n muur van uitputting.

   Die storie word tot ses reels afgekort met 'Lees verder' daaronder. Wie
   die opskrif interessant vind, maak dit oop; die res blaai verby sonder om
   moeg te word.

   Die antwoord is nie 'n aparte blad nie en nie 'n draad nie — dit sit binne
   dieselfde kaart, want dit is die enigste manier waarop 'n mens sien dat
   daar op sy ding geantwoord is.

   OP DIE MUUR KOM NET DEWALD SE ANTWOORDE. Niks anders nie.

   Hier was 'n rukkie 'n video by elke plasing sonder 'n antwoord, en daarna
   ook 'n stemnota uit Luister. Dewald het dit reguit gestop: die muur is sy
   antwoorde, nie 'n plek waar die res van die app ingedra word nie. Iemand
   wat hier lees, moet die mens se woorde sien en dan sy stem — nie 'n
   biblioteek nie.

   Die "Terwyl jy wag"-lys bestaan nog, maar net op EEN plek: die skerm direk
   na 'n indiening, waar iemand werklik wag. Sien `SorgWag`.

   Geen kommentaar nie. Geen vreemdeling se raad onder 'n vrou se beskrywing
   van haar huwelik nie.

   Geen transform of opacity op :active nie — net kleur. Sien CLAUDE.md.
   ──────────────────────────────────────────────────────────── */

import { useState } from 'react'
import { onderwerpNaam } from '../data/sorgOnderwerpe'
import { draSaam, draSaamReeds } from '../data/sorgMuur'
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
  const titel = String(a.titel || '').trim()
  if (a.tipe === 'oudio' && bron) return { ...a, bron, teks, titel }
  if (a.tipe === 'video' && bron) return { ...a, bron, teks, titel }
  if (teks) return { ...a, tipe: 'teks', bron: '', teks, titel }
  return null
}

export default function SorgPlasing({ plasing }) {
  const [saam, setSaam] = useState(plasing.saam || 0)
  const [gedra, setGedra] = useState(() => draSaamReeds(plasing.id))
  const [oop, setOop] = useState(false)

  /* Kort stories het nie 'n "Lees verder" nodig nie — dan lyk dit net
     lastig. Ses reels is sowat 240 karakters op 'n foon. */
  const lank = String(plasing.teks || '').length > 260

  const antwoord = egteAntwoord(plasing.antwoord)

  async function dra() {
    if (gedra) return
    setGedra(true)
    setSaam(n => n + 1)          // dadelik, ook op 'n stadige lyn
    const n = await draSaam(plasing.id)
    if (typeof n === 'number') setSaam(n)
  }

  return (
    <article className="sp-kaart" id={`sorg-plasing-${plasing.id}`}>
      {plasing.titel && <h3 className="sp-titel">{plasing.titel}</h3>}

      <p className="sp-wie">
        {plasing.naam || 'Anoniem'}
        {plasing.datum ? ` · ${skryfDatum(plasing.datum)}` : ''}
        {onderwerpNaam(plasing.onderwerp) ? ` · ${onderwerpNaam(plasing.onderwerp)}` : ''}
      </p>

      <p className={`sp-teks${lank && !oop ? ' kort' : ''}`}>{plasing.teks}</p>
      {lank && !oop && (
        <button className="sp-meer" onClick={() => setOop(true)}>Lees verder</button>
      )}

      {/* ── Dewald se antwoord, DIREK onder die woorde ── */}
      {antwoord && (
        <div className="sp-antwoord">
          <p className="sp-antwoord-kop">Dewald antwoord</p>
          {antwoord.titel && <p className="sp-antwoord-titel">{antwoord.titel}</p>}

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
