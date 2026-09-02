/* Die ingang na Vandag se Tyd met God, op Luister, onder vandag se boodskap.
 *
 * Hierdie lêer bestaan sodat Luister.jsx EEN reël bykry. Luister is die
 * belangrikste skerm in die app en sy navigasie mag nie aangeraak word nie
 * (CLAUDE.md); die hele besluit oor wat die kaart sê — en of hy hoegenaamd
 * wys — staan dus hier. Dieselfde patroon as VolgJesusKaart.jsx.
 *
 * ── Drie toestande, nie een knoppie nie ──
 *
 * VOLG JESUS het presies hier geval: iemand op Dag 3 het steeds "BEGIN HIER"
 * gesien, en die app het gemaak of hy nooit begin het nie. `volgJesusBegin.js`
 * bestaan net vir daardie fout. Die besluit staan hier in `kaartToestand()`,
 * met toetse.
 *
 *   begin → hy het vandag nog nie begin nie
 *   voort → hy is halfpad
 *   klaar → klaar vandag; GEEN knoppie, net 'n stil reël met 'n klein
 *           "doen dit weer". 'n Knoppie wat 'n mens uitnooi om iets te doen
 *           wat hy klaar gedoen het, maak van 'n gewoonte 'n eis.
 *
 * Is daar vandag geen nota nie, wys die kaart glad nie — 'n knoppie wat op 'n
 * leë skerm uitkom, is erger as geen knoppie, en hierdie blad is waar die
 * oggendkennisgewing elke dag duisende mense laat land.
 */
import { useEffect, useState } from 'react'
import { dagSleutel, kaartToestand } from '../data/tydMetGod'
import { leesStaat } from '../data/tydMetGodBerging'
import TydMetGodSon from './TydMetGodSon'
import './TydMetGodKaart.css'

export default function TydMetGodKaart({ nota, opBegin }) {
  const dag = dagSleutel()
  const [staat, setStaat] = useState(leesStaat)

  /* Die vloei skryf na dieselfde localStorage-sleutel. Kom 'n mens uit die
     vloei terug, moet die kaart die nuwe toestand wys en nie die een van toe
     hy weggegaan het nie. `storage` vuur nie in dieselfde oortjie nie, dus
     luister ons ook na ons eie gebeurtenis. */
  useEffect(() => {
    function herlees() { setStaat(leesStaat()) }
    window.addEventListener('tmg-verander', herlees)
    window.addEventListener('storage', herlees)
    document.addEventListener('visibilitychange', herlees)
    return () => {
      window.removeEventListener('tmg-verander', herlees)
      window.removeEventListener('storage', herlees)
      document.removeEventListener('visibilitychange', herlees)
    }
  }, [])

  const toestand = kaartToestand({ nota, staat, dag })
  if (toestand === 'geen') return null

  if (toestand === 'klaar') {
    return (
      <div className="tmg-klaar-reel">
        <Son klas="tmg-kaart-son" />
        <span>Jy het vandag tyd met God gemaak</span>
        <button className="tmg-klaar-weer" onClick={opBegin}>doen dit weer</button>
      </div>
    )
  }

  const voort = toestand === 'voort'

  return (
    <button className="tmg-kaart" onClick={opBegin}>
      {/* Die geskilderde sonsopkoms, regs, wat in die houtskool inloop. Dit
          is 'n SVG en nie 'n prent nie — sien TydMetGodSon.jsx. */}
      <TydMetGodSon />
      <span className="tmg-kaart-sluier" />

      <span className="tmg-kaart-inhoud">
        <Son klas="tmg-kaart-son" />
        <span className="tmg-kaart-oog">Vandag</span>
        <span className="tmg-kaart-titel">
          {voort ? 'Jou tyd met God wag nog' : 'Jou tyd met God is gereed'}
        </span>
        <span className="tmg-kaart-lei">
          {voort
            ? 'Jy is halfpad. Gaan voort waar jy opgehou het.'
            : "'n Paar minute om te luister, te bid en iemand vandag te dra."}
        </span>
        <span className="tmg-kaart-knop">
          {voort ? 'Gaan voort' : 'Begin jou tyd met God'}
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </span>
      </span>
    </button>
  )
}

/* Dieselfde son as die vloei se eerste skerm. Wanneer 'n mens die kaart druk,
   moet hy die skerm wat oopmaak HERKEN — dit is dieselfde plek. */
function Son({ klas }) {
  return (
    <svg className={klas} viewBox="0 0 40 40" fill="none" stroke="currentColor"
         strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M4 29h32" />
      <path d="M11 29a9 9 0 0 1 18 0" />
      <path d="M20 8v4M8.6 12.6l2.5 2.5M31.4 12.6l-2.5 2.5" />
    </svg>
  )
}
