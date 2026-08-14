/* ── "Kennisgewings af" — die stil merkie regs bo op Luister ──
 *
 * Waarom dit bestaan
 * ──────────────────
 * Daar is mense wat Daaglikse Hoop op hulle foon het en al maande niks kry
 * nie. Hulle weet dit nie — hulle dink die app is stil. Ons kan hulle nie
 * bereik nie, want ons het geen kanaal na daardie foon nie; die enigste
 * oomblik waarop ons iets kan doen, is wanneer hulle die app oopmaak.
 *
 * Daarom is dit nie 'n uitklap nie. 'n Uitklap kom een keer en gaan weg. Dit
 * is 'n klein merkie wat ELKE KEER daar is totdat dit reg is — en dan
 * verdwyn dit heeltemal.
 *
 * ── Wat dit NIE is nie ──
 *
 * Dit is nie 'n skakelaar wat 'n mens kan afskakel nie. Iemand wat sy
 * kennisgewings wil afsit, doen dit in sy foon se instellings; 'n "af"-stand
 * hier sou 'n derde stel waarheid skep bo-op die blaaier en die stelsel s'n,
 * en dan weet niemand meer wat waar is nie.
 *
 * ── Die reel wat nooit gebreek mag word nie ──
 *
 * Wie GEBLOKKEER het, word nooit weer gevra nie. Die stelsel gee dadelik
 * `denied` terug sonder om iets te wys, en dan het ons 'n knoppie wat niks
 * doen — erger as stilte. Hy kry die stappe. Sien kennisgewingStaat.js.
 */
import { useState } from 'react'
import { STAAT_WOORDE } from '../data/kennisgewingStaat'
import './KennisgewingKnoppie.css'

export default function KennisgewingKnoppie({ staat, opDoen, opStappe }) {
  const [oop, setOop]       = useState(false)
  const [besig, setBesig]   = useState(false)
  const [uitslag, setUitslag] = useState(null)

  const woorde = STAAT_WOORDE[staat]
  if (!woorde) return null

  async function druk() {
    /* Vir wie geblokkeer het of eers moet installeer, is daar niks om te
       probeer nie — net stappe. Ons vra NIE. */
    if (woorde.doen === 'stappe' || woorde.doen === 'installeer') {
      setOop(false)
      opStappe(woorde.doen)
      return
    }
    setBesig(true)
    setUitslag(null)
    try {
      const r = await opDoen(woorde.doen)
      setUitslag(r)
      /* Het dit gewerk, verdwyn die hele ding vanself — die ouer herbereken
         die staat en `wysKnoppie` gee dan false. Ons maak net toe. */
      if (r && r.ok) setTimeout(() => setOop(false), 2600)
    } catch {
      setUitslag({ ok: false, boodskap: 'Iets het verkeerd geloop. Probeer asseblief weer.' })
    } finally {
      setBesig(false)
    }
  }

  return (
    <>
      <button className="kg-merkie" onClick={() => setOop(true)} aria-label={woorde.knoppie}>
        <span className="kg-merkie-klok">🔔</span>
        <span className="kg-merkie-teks">{woorde.knoppie}</span>
      </button>

      {oop && (
        <div className="popup-backdrop" onClick={() => setOop(false)}>
          <div className="popup-card" onClick={e => e.stopPropagation()}>
            <button className="popup-x" onClick={() => setOop(false)}>✕</button>
            <div className="popup-icon">🔔</div>
            <h3 className="popup-title">{woorde.titel}</h3>
            <p className="popup-body">{woorde.lyf}</p>

            {uitslag && (
              <p className={`kg-uitslag ${uitslag.ok ? 'kg-uitslag-goed' : 'kg-uitslag-sleg'}`}>
                {uitslag.boodskap}
              </p>
            )}

            <button className="popup-btn-primary" onClick={druk} disabled={besig}>
              {besig ? 'Een oomblik…' : woorde.knop}
            </button>
            <button className="popup-btn-secondary" onClick={() => setOop(false)}>Later</button>
          </div>
        </div>
      )}
    </>
  )
}

/* ── "Stuur vir my 'n toetsboodskap" ──
 *
 * Wys vir wie ALLES reg lyk. Dit is die enigste eerlike bewys: 'n groen
 * merkie op 'n skerm bewys niks, en 'n boodskap-id uit FCM ook nie. Die
 * bediener stuur een egte boodskap en sê wat gebeur het.
 *
 * Dit staan nie op Luister nie — dit hoort by die instellings, waar iemand
 * wat twyfel dit gaan soek. */
export function ToetsKnoppie({ opToets }) {
  const [besig, setBesig] = useState(false)
  const [uitslag, setUitslag] = useState(null)

  async function druk() {
    setBesig(true)
    setUitslag(null)
    try { setUitslag(await opToets()) }
    catch { setUitslag({ ok: false, boodskap: 'Iets het verkeerd geloop. Probeer asseblief weer.' }) }
    finally { setBesig(false) }
  }

  return (
    <div className="kg-toets">
      <button className="kg-toets-knop" onClick={druk} disabled={besig}>
        {besig ? 'Besig om te stuur…' : 'Stuur vir my ’n toetsboodskap'}
      </button>
      {uitslag && (
        <p className={`kg-uitslag ${uitslag.ok ? 'kg-uitslag-goed' : 'kg-uitslag-sleg'}`}>
          {uitslag.boodskap}
        </p>
      )}
    </div>
  )
}
