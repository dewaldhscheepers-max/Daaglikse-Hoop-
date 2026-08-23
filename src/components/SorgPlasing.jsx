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
   moeg te word. Dieselfde knoppie maak dit weer toe — sonder dit bly 'n kaart
   wat 'n mens eenmaal oopgemaak het vir altyd uitgestrek.

   'n GESKREWE antwoord word net so afgekort, met 'Lees meer'. Dewald skryf
   soms lank, en dan is een kaart drie skerms hoog en die volgende plasing
   sien niemand. 'n Stemnota of video word nooit afgekap nie — daar is niks
   om af te kap nie.

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
import SorgDeelSteun from './SorgDeelSteun'
import SorgSaamstaan from './SorgSaamstaan'
import './SorgPlasing.css'

const MAANDE = [
  'Januarie', 'Februarie', 'Maart', 'April', 'Mei', 'Junie',
  'Julie', 'Augustus', 'September', 'Oktober', 'November', 'Desember',
]

/* 1:42. 'n Opname sonder 'n lengte laat 'n mens wonder of dit twintig
   minute is, en dan druk hy nie. Kom die lengte nie deur nie — party
   bedieners stuur nie 'n lengte vir 'n stroom nie — wys ons eenvoudig niks
   eerder as 'n leuen soos 0:00. */
function skryfDuur(sekondes) {
  const s = Number(sekondes)
  if (!Number.isFinite(s) || s <= 0) return ''
  const m = Math.floor(s / 60)
  const r = Math.round(s % 60)
  return `${m}:${String(r === 60 ? 0 : r).padStart(2, '0')}`
}

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

/* Die merkie langs 'n naam. 'n Anonieme mens kry 'n neutrale kolletjie, nie 'n
   letter uit die woord "Anoniem" nie — dit sou lyk of almal dieselfde mens is. */
function voorletter(naam) {
  const n = String(naam || '').trim()
  return n ? n[0].toUpperCase() : '·'
}

export default function SorgPlasing({ plasing, myne = false, wag = false }) {
  const [oop, setOop] = useState(false)
  const [antwOop, setAntwOop] = useState(false)
  const [duur, setDuur] = useState('')

  /* Kort stories het nie 'n "Lees verder" nodig nie — dan lyk dit net
     lastig. Ses reels is sowat 240 karakters op 'n foon. */
  const lank = String(plasing.teks || '').length > 260

  const antwoord = egteAntwoord(plasing.antwoord)

  /* 'n GESKREWE antwoord kry dieselfde behandeling as die storie.
     Dewald skryf soms lank, en dan is die kaart 'n muur van teks en die
     volgende plasing is drie skerms ver. Ag reels, want die antwoord is
     kleiner geset as die storie en dit is die deel waarvoor 'n mens hier
     is — sowat 320 karakters. 'n Stemnota of video word nooit afgekap
     nie; net woorde. */
  const antwLank = String(antwoord?.teks || '').length > 320

  return (
    <article className={`sp-kaart${myne ? ' myne' : ''}`} id={`sorg-plasing-${plasing.id}`}>
      {/* ── Jou storie ──

          Die mens wat geskryf het, het nooit gesien dat ander haar dra nie.
          Sy plaas, sy verdwyn, en daar is geen pad terug nie. Hierdie merkie
          is die hele emosionele betaling van die blad: sy kom terug en sien
          dat vier-en-twintig mense haar ding saamdra.

          Dit wys NET op haar eie foon. Niemand anders sien dit nie. */}
      {myne && <p className="sp-myne">Jou storie</p>}

      {/* "Wag nog" — die enigste merkie op 'n kaart, en dit vra iets van die
          leser in plaas van om iets oor die skrywer te sê. */}
      {wag && !myne && <p className="sp-wag">Nog geen antwoord</p>}

      {/* ── Wie, op EEN ry ──
       *
       * Dit was drie los reels onder mekaar: die titel, "Anoniem het 'n
       * boodskap gedeel", en dan die datum met die onderwerp. Dewald: "die
       * huidige groot wit kaart met 'n groot titel... voel swaar en outyds."
       *
       * Nou lees dit soos 'n mens in 'n gesprek: 'n merkie met sy voorletter,
       * sy naam, hoe lank gelede, en waaroor dit gaan. Die titel kom DAARNA,
       * want die mens kom eerste. */}
      <div className="sp-kop">
        <span className="sp-merk" aria-hidden="true">{voorletter(plasing.naam)}</span>
        <span className="sp-kop-naam">{plasing.naam || 'Anoniem'}</span>
        {/* Net wanneer `skryfDatum` werklik iets teruggee. Die kolletjie kom
            uit CSS (`::before`), dus het 'n leë datum 'n los "·" langs die
            naam laat staan. */}
        {skryfDatum(plasing.datum) && (
          <span className="sp-kop-tyd">{skryfDatum(plasing.datum)}</span>
        )}
        {onderwerpNaam(plasing.onderwerp) && (
          <span className="sp-kop-onderwerp">{onderwerpNaam(plasing.onderwerp)}</span>
        )}
      </div>

      {plasing.titel && <h3 className="sp-titel">{plasing.titel}</h3>}

      <p className={`sp-teks${lank && !oop ? ' kort' : ''}`}>{plasing.teks}</p>
      {/* Dit gaan OOP en dit gaan weer TOE. Die knoppie het verdwyn sodra 'n
          mens dit oopgemaak het, en dan was daar geen pad terug nie — die
          kaart bly vir altyd uitgestrek en 'n mens moet verby die hele storie
          scroll om by die volgende plasing te kom. */}
      {lank && (
        <button className="sp-meer" onClick={() => setOop(o => !o)}>
          {oop ? 'Wys minder' : 'Lees verder'}
        </button>
      )}

      {/* ── Dewald se antwoord, DIREK onder die woorde ── */}
      {/* ── Dewald se antwoord staan NIE meer hier nie ──
       *
       * Dewald: "Vasgespeld moet in die comments wees saam die ander. nie
       * deel van die post nie... 'n pinned post op facebook is in die
       * comments."
       *
       * Hy is reg, en dit is meer as 'n plek: solank sy antwoord IN die
       * plasing gesit het, was dit deel van die storie self — en dan lees die
       * blad weer soos 'n vraag met 'n amptelike antwoord. In die opmerkings,
       * vasgespeld bo die ander, is dit een stem tussen stemme, met meer
       * gewig. Sien SorgOpmerkings.jsx. */}

      {/* ── Die gemeenskap ──
          Vier reaksies en woorde van ondersteuning, in plaas van die een
          knoppie wat op 'n jong muur "1 mens dra dit saam met jou" gesê het. */}
      <SorgSaamstaan plasing={plasing} />

      {/* ── Deel en nooi ──
       *
       * Dit het BINNE die antwoord-blok gestaan, en dus het dit net verskyn
       * op 'n plasing wat Dewald reeds beantwoord het. Die hele groei van die
       * blad was dus aan een mens se arbeid vasgeknoop: geen antwoord, geen
       * deel, geen nuwe mens.
       *
       * Dewald: "die app moet heavy fokken groei" — en tegelyk "ek kan nie
       * almal antw nie." Daardie twee kon nie albei waar wees solank hierdie
       * knoppie hier binne gesit het.
       *
       * Dit staan nou onder ELKE plasing. En dit is juis die ONBEANTWOORDE
       * een wat 'n uitnodiging nodig het: daar is nog niemand wat dra nie. */}
      <SorgDeelSteun soort="plasing" id={plasing.id} titel={plasing.titel} wysNooi wysRapport />
    </article>
  )
}
