/* ────────────────────────────────────────────────────────────
   Deel · Ondersteun — een rustige ry.

   Dit sit onder elke antwoord en onder elke video. Twee reels waarom dit so
   klein is:

   · Deel staan EERSTE en is prominenter, want groei is die prioriteit. Elke
     antwoord wat iemand gehelp het, is die beste ding wat gedeel kan word.
   · "Ondersteun", nie "Maak 'n donasie" nie. Dit voel sagter en minder
     geldgedrewe. Dit maak dieselfde blad oop wat reeds bestaan.

   'n Klein teksry raak nooit te veel nie. Groot donasieblokke oral WEL —
   daarom staan die groot een net een keer, heel onderaan die blad.

   Dit wys NOOIT op die skryfkant nie. Nie waar iemand sy seer tik nie.
   ──────────────────────────────────────────────────────────── */

import { deelSorg } from '../data/sorgDeel'

export default function SorgDeelSteun({ soort, id, titel }) {
  return (
    <div className="sds">
      <button className="sds-deel" onClick={() => deelSorg(soort, id, titel)}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
        </svg>
        Deel
      </button>
      <span className="sds-punt" aria-hidden="true">·</span>
      <button
        className="sds-steun"
        onClick={() => window.dispatchEvent(new CustomEvent('open-hoop-vennoot'))}
      >
        Ondersteun
      </button>
    </div>
  )
}
