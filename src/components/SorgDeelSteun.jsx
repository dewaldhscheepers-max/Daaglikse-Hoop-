/* ────────────────────────────────────────────────────────────
   Deel · Nooi iemand

   Twee knoppies onder 'n plasing, en hulle vra TWEE verskillende dinge:

     Deel  → "kyk hierna", na almal.
     Nooi  → "JY het iets om te sê vir hierdie mens", na een mens.

   Die tweede is die een wat 'n mens laat kom, want dit is nie 'n
   advertensie nie. Sien nooiOmTeAntwoord() in sorgDeel.js.

   ── Wat hier UIT is ──

   "Stuur vir Dewald 'n dankie" het hier gestaan en die donasie-blad
   oopgemaak. Dewald: "stuur vir dewald dankie moet uit."

   Hy is reg, en die rede is skerper as smaak: hierdie ry sit nou onder ELKE
   plasing, ook onder 'n rou storie wat nog niemand gedra het nie. 'n
   Geldknoppie daar lees soos 'n tolhek voor iemand se seer. Die versoek staan
   heel onder die blad in dieselfde DonationCard as oral elders — ná die hulp,
   nie tussenin nie.

   Dit het ook beteken die video's se ry het net die dankie gedra; hulle het
   reeds hul eie Deel binne die videokaart. Daardie twee gebruike is dus weg.

   Geen transform of opacity op :active nie — net kleur. Sien CLAUDE.md.
   ──────────────────────────────────────────────────────────── */

import { deelSorg, nooiOmTeAntwoord } from '../data/sorgDeel'

export default function SorgDeelSteun({ soort, id, titel, wysDeel = true, wysNooi = false }) {
  if (!wysDeel && !wysNooi) return null

  return (
    <div className="sds">
      {wysDeel && (
        <button className="sds-deel" onClick={() => deelSorg(soort, id, titel)}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
          </svg>
          Deel
        </button>
      )}

      {wysNooi && (
        <button className="sds-nooi" onClick={() => nooiOmTeAntwoord(soort, id, titel)}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
          </svg>
          Nooi iemand
        </button>
      )}
    </div>
  )
}
