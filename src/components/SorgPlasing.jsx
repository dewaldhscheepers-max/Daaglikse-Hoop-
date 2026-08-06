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
  const [oop, setOop] = useState(false)
  const [antwOop, setAntwOop] = useState(false)

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
    <article className="sp-kaart" id={`sorg-plasing-${plasing.id}`}>
      {plasing.titel && <h3 className="sp-titel">{plasing.titel}</h3>}

      {/* ── Wie ──

          Dit was "Anoniem · 6 Augustus · Angs en bekommernis" — 'n ry velde
          uit 'n databasis. "Anoniem" op sy eie is 'n nul; dit se NIEMAND,
          terwyl daar 'n mens agter sit wat besluit het om te praat.

          "Anoniem het 'n boodskap gedeel" is dieselfde inligting, maar dit
          is iemand wat iets DOEN. Die datum en die onderwerp sak na 'n
          tweede, fyner reel — hulle is konteks, nie die hoofsaak nie. */}
      <p className="sp-wie">
        <span className="sp-wie-naam">{plasing.naam || 'Anoniem'}</span>
        {' het ’n boodskap gedeel'}
      </p>
      {(plasing.datum || onderwerpNaam(plasing.onderwerp)) && (
        <p className="sp-wanneer">
          {skryfDatum(plasing.datum)}
          {plasing.datum && onderwerpNaam(plasing.onderwerp) ? ' · ' : ''}
          {onderwerpNaam(plasing.onderwerp)}
        </p>
      )}

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
      {antwoord && (
        <div className="sp-antwoord">
          {/* ── Wie praat ──

              "Dewald antwoord" is 'n etiket op 'n boks. Met die gesig
              daarby is dit 'n mens wat praat, en dit is die hele verskil
              tussen 'n vraag-en-antwoord-blad en 'n pastorale een.

              "Vasgespeld" doen nog iets: sodra ander mense se woorde van
              ondersteuning hieronder kom, sê dit hoekom hierdie een bo bly
              staan. Dit maak van Dewald die stem met die meeste gewig
              sonder om hom die enigste stem te maak. */}
          <div className="sp-antwoord-wie">
            <img
              className="sp-antwoord-gesig"
              src="/beelde/dewald.jpg"
              alt="Dewald Scheepers"
              width="34"
              height="34"
              loading="lazy"
            />
            <div className="sp-antwoord-wie-teks">
              <p className="sp-antwoord-kop">Dewald se pastorale begeleiding</p>
              <p className="sp-vasgespeld">Vasgespeld</p>
            </div>
          </div>
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

          {antwoord.teks && (
            <>
              <p className={`sp-antwoord-teks${antwLank && !antwOop ? ' kort' : ''}`}>
                {antwoord.teks}
              </p>
              {antwLank && (
                <button className="sp-meer" onClick={() => setAntwOop(o => !o)}>
                  {antwOop ? 'Wys minder' : 'Lees meer'}
                </button>
              )}
            </>
          )}

          {/* Deel eerste. 'n Antwoord wat iemand gehelp het, is die beste
              ding wat gedeel kan word — en elke deel bring iemand nuut. */}
          <SorgDeelSteun soort="plasing" id={plasing.id} />
        </div>
      )}

      {/* ── Die gemeenskap ──
          Vier reaksies en woorde van ondersteuning, in plaas van die een
          knoppie wat op 'n jong muur "1 mens dra dit saam met jou" gesê het. */}
      <SorgSaamstaan plasing={plasing} />
    </article>
  )
}
