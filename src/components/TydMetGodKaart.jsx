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
        <span>Jy het vandag tyd met God gemaak ❤️</span>
        <button className="tmg-klaar-weer" onClick={opBegin}>doen dit weer</button>
      </div>
    )
  }

  const voort = toestand === 'voort'

  return (
    <button className="tmg-kaart" onClick={opBegin}>
      <div className="tmg-kaart-oog">Vandag</div>
      <div className="tmg-kaart-titel">
        {voort ? 'Jou tyd met God wag nog' : 'Jou tyd met God is gereed'}
      </div>
      <div className="tmg-kaart-lei">
        {voort
          ? 'Jy is halfpad. Gaan voort waar jy opgehou het.'
          : "'n Paar minute om te luister, te bid en iemand vandag te dra."}
      </div>
      <span className="tmg-kaart-knop">
        {voort ? 'Gaan voort →' : 'Begin my tyd met God'}
      </span>
    </button>
  )
}
