/* ── Die week se stemboodskap ──
 *
 * Dewald: "ek wil hê die youtube video moet eerder ’n stemboodskap wees."
 *
 * Dit is die hoofboodskap van die week, en dit speel IN die app. Geen YouTube,
 * geen KYK-modus.
 *
 * ── Wat hier uit Luister.jsx geleer is ──
 *
 * Die stemboodskap-speler op Luister is die duurste stuk kode in hierdie
 * projek, en die lesse geld hier net so:
 *
 *   · 'n speler wat LIEG is erger as een wat stukkend is. `error` word dus
 *     hanteer, nie net `timeupdate` nie. Gaan die pyplyn dood, sê ons dit en
 *     gee 'n knoppie — ons los nie 'n pouse-ikoon wat vir altyd wag nie;
 *   · `duration` word met `Number.isFinite` gekeur voor dit erens beland.
 *     NaN en Infinity het albei al 'n balkie vir altyd stukkend gemaak;
 *   · klank word NOOIT deur die diensketter gekas nie — sien magKas() in
 *     kasBesluit.js. 'n <audio> vra grepe met 'n Range-kop en 'n kas weet niks
 *     daarvan nie.
 *
 * ── Die posisie word onthou ──
 *
 * Dewald: "die klankspeler moet onthou waar die persoon opgehou het; hervat
 * wanneer hulle terugkom; nie van voor af begin wanneer hulle per ongeluk weg
 * navigeer nie."
 *
 * Die posisie staan in localStorage en word elke paar sekondes geskryf. Dit
 * is die verskil tussen 'n boodskap wat 'n mens klaar luister en een wat hy
 * drie keer van voor af begin en dan los.
 */
import { useEffect, useRef, useState } from 'react'
import './Stemboodskap.css'

const SPOEDE = [1, 1.25, 1.5, 0.75]

const fmt = s => {
  if (!Number.isFinite(s) || s < 0) return '--:--'
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

export default function Stemboodskap({ bron, titel, sleutel, transkripsie }) {
  const audioRef = useRef(null)
  const [speel, setSpeel]   = useState(false)
  const [nou, setNou]       = useState(0)
  const [duur, setDuur]     = useState(0)
  const [spoed, setSpoed]   = useState(1)
  const [fout, setFout]     = useState(false)
  const [wysTeks, setWysTeks] = useState(false)   /* by verstek TOEGEVOU */

  const berg = sleutel ? `vj_stem_${sleutel}` : ''

  /* Hervat waar hy opgehou het. Dit gebeur by `loadedmetadata`, want voor die
     duur bekend is, weier die blaaier 'n `currentTime`. */
  useEffect(() => {
    const a = audioRef.current
    if (!a || !bron) return

    function opMeta() {
      const d = a.duration
      if (Number.isFinite(d) && d > 0) setDuur(d)
      if (!berg) return
      try {
        const g = Number(localStorage.getItem(berg))
        /* Nie binne die laaste 5 sekondes nie — dan is hy klaar geluister en
           moet dit van voor af begin, nie op die laaste asem nie. */
        if (Number.isFinite(g) && g > 1 && Number.isFinite(d) && g < d - 5) a.currentTime = g
      } catch {}
    }
    function opTyd() {
      setNou(a.currentTime)
      if (!berg) return
      /* Elke tweede sekonde, nie by elke raam nie. */
      if (Math.floor(a.currentTime) % 2 === 0) {
        try { localStorage.setItem(berg, String(a.currentTime)) } catch {}
      }
    }
    function opFout() { setFout(true); setSpeel(false) }
    function opEinde() {
      setSpeel(false)
      try { localStorage.removeItem(berg) } catch {}
    }

    a.addEventListener('loadedmetadata', opMeta)
    a.addEventListener('timeupdate', opTyd)
    a.addEventListener('error', opFout)
    a.addEventListener('ended', opEinde)
    a.addEventListener('play', () => setSpeel(true))
    a.addEventListener('pause', () => setSpeel(false))
    return () => {
      a.removeEventListener('loadedmetadata', opMeta)
      a.removeEventListener('timeupdate', opTyd)
      a.removeEventListener('error', opFout)
      a.removeEventListener('ended', opEinde)
    }
  }, [bron, berg])

  async function wissel() {
    const a = audioRef.current
    if (!a) return
    setFout(false)
    try {
      if (a.paused) {
        /* Is daar reeds 'n fout, laai eers weer — anders is die eerste tik 'n
           dooie tik. Dieselfde les as Luister.jsx. */
        if (a.error) a.load()
        await a.play()
      } else a.pause()
    } catch { setFout(true) }
  }

  function spring(sek) {
    const a = audioRef.current
    if (!a || !Number.isFinite(a.duration)) return
    a.currentTime = Math.min(Math.max(0, a.currentTime + sek), a.duration)
  }

  function stelSpoed() {
    const volgende = SPOEDE[(SPOEDE.indexOf(spoed) + 1) % SPOEDE.length]
    setSpoed(volgende)
    if (audioRef.current) audioRef.current.playbackRate = volgende
  }

  /* Geen bron nie — sê dit eerlik. 'n Speler wat niks speel nie is erger as
     'n sin wat verduidelik. */
  if (!bron) {
    return (
      <div className="stem">
        <div className="stem-kop">DIE WEEK SE STEMBOODSKAP</div>
        <p className="stem-geen">Die stemboodskap kom binnekort.</p>
        {transkripsie && <Transkripsie teks={transkripsie} oop={wysTeks} stel={setWysTeks} />}
      </div>
    )
  }

  const vordering = duur > 0 ? Math.min(1, nou / duur) : 0

  return (
    <div className="stem">
      <audio ref={audioRef} src={bron} preload="metadata" />

      <div className="stem-kop">DIE WEEK SE STEMBOODSKAP</div>
      {titel && <div className="stem-titel">{titel}</div>}

      <div className="stem-kontroles">
        <button className="stem-spring" onClick={() => spring(-15)} aria-label="15 sekondes terug">
          ‹15
        </button>
        <button className="stem-speel" onClick={wissel}
                aria-label={speel ? 'Wag' : 'Luister nou'}>
          {speel ? '❚❚' : '▶'}
        </button>
        <button className="stem-spring" onClick={() => spring(15)} aria-label="15 sekondes vorentoe">
          15›
        </button>
      </div>

      {!speel && nou < 1 && <div className="stem-nooi">LUISTER NOU</div>}

      <div className="stem-balk-ry">
        <span className="stem-tyd">{fmt(nou)}</span>
        <div className="stem-balk">
          <div className="stem-vul" style={{ width: `${vordering * 100}%` }} />
        </div>
        <span className="stem-tyd">{fmt(duur)}</span>
      </div>

      <button className="stem-spoed" onClick={stelSpoed}>{spoed}×</button>

      {fout && (
        <button className="stem-fout" onClick={wissel}>
          Die boodskap wou nie speel nie. Tik om weer te probeer.
        </button>
      )}

      {transkripsie && <Transkripsie teks={transkripsie} oop={wysTeks} stel={setWysTeks} />}
    </div>
  )
}

/* Die transkripsie is BY VERSTEK TOEGEVOU. 'n Mens moet die boodskap hoor;
   dit is daar vir wie liewer lees of iets wil teruglees. */
function Transkripsie({ teks, oop, stel }) {
  return (
    <div className="stem-teks">
      <button className="stem-teks-knop" onClick={() => stel(!oop)}>
        {oop ? 'Sluit die transkripsie' : 'Lees die transkripsie'}
      </button>
      {oop && <div className="stem-teks-lyf">{teks}</div>}
    </div>
  )
}
