/* ────────────────────────────────────────────────────────────
   Deel · Stuur vir Dewald 'n dankie

   Dit sit onder elke ANTWOORD en onder elke video — nooit onder iemand se
   rou storie voordat hy geantwoord het nie. Daardie plasing is nog 'n vraag
   wat wag; 'n versoek om geld daaronder sou lees of die antwoord te koop is.
   (Op die muur staan hierdie ry binne die `antwoord`-blok, dus gebeur dit
   vanself.)

   ── Waarom "Stuur vir Dewald 'n dankie" ──

   Hier het net "Ondersteun" gestaan. Dit is 'n woord uit 'n bemarkingsblad:
   dit se nie vir wie nie, dit se nie waarvoor nie, en dit vra van iemand om
   'n gulle daad te doen vir 'n instelling.

   Op die oomblik NA iemand na 'n stemboodskap geluister het waarin 'n mens
   met hom gepraat het oor sy huwelik of sy angs, is die eerlike gevoel nie
   "ek wil hierdie bediening ondersteun" nie. Dit is "dankie". Die knoppie sê
   nou daardie ding.

   ── Waarom Deel steeds eerste ──

   Groei is die prioriteit. Elke antwoord wat iemand gehelp het, is die beste
   ding wat gedeel kan word, en 'n deel bring iemand nuut. Geld bring net
   geld.

   Dit wys NOOIT op die skryfkant nie. Nie waar iemand sy seer tik nie.

   Geen transform of opacity op :active nie — net kleur. Sien CLAUDE.md.
   ──────────────────────────────────────────────────────────── */

import { useState } from 'react'
import { deelSorg } from '../data/sorgDeel'
import SorgSteun from './SorgSteun'

export default function SorgDeelSteun({ soort, id, titel, wysDeel = true }) {
  const [steunOop, setSteunOop] = useState(false)

  return (
    <>
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

        <button className="sds-dankie" onClick={() => setSteunOop(true)}>
          <span className="sds-dankie-hart" aria-hidden="true">♡</span>
          <span className="sds-dankie-teks">
            <b>Stuur vir Dewald ’n dankie</b>
            Help om Pastorale Sorg gratis te hou.
          </span>
        </button>
      </div>

      <SorgSteun oop={steunOop} onSluit={() => setSteunOop(false)} />
    </>
  )
}
