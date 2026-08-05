/* ────────────────────────────────────────────────────────────
   Pastorale Sorg.

   Die volgorde op hierdie blad is 'n besluit, nie 'n toeval nie:

     Hulp nou            — altyd bo, altyd bereikbaar
     Die week se video   — een ding, die held
     Vertel my wat swaar is
     Vandag se woord
     Dewald antwoord · Die Muur · Die Video's

   HOOP KOM VOOR PYN. Iemand wat in krisis aankom en veertig plasings van
   ander se lyding lees, gaan slegter weg. Daarom staan die video bo en die
   muur onder, en daarom dra elke plasing op die muur iets by wat help.

   Die skryfknoppie sit binne die eerste skerm. Wie huil, moet nie eers verby
   twee video's blaai nie — daarom is daar EEN held bo en sak Vandag se woord
   onder die knoppie.

   En: geen versoek om geld op die skryfkant nie. Die Hoopdraer-uitnodiging
   hoort net onder 'n antwoord of 'n video, nooit waar iemand sy seer tik nie.
   ──────────────────────────────────────────────────────────── */

import { useState, useEffect } from 'react'
import SorgVideo from '../components/SorgVideo'
import SorgNommers from '../components/SorgNommers'
import SorgVorm from '../components/SorgVorm'
import {
  haalVideos, weekVideo, vandagSeWoord, merkWoordGesien, volgensBehoefte,
} from '../data/sorgVideos'
import { NOODNOMMERS, GRENSSIN } from '../data/sorgNommers'
import './Sorg.css'

/* Die noodnommers en die grenssin woon in `src/data/sorgNommers.js` — een
   plek, want 'n dooie noodnommer is die enigste ding hier wat regtig
   verkeerd kan loop. Hulle word hier weer uitgevoer sodat ouer invoere nie
   breek nie. */
export { NOODNOMMERS, GRENSSIN }

export function HulpNou({ oop, onSluit }) {
  if (!oop) return null
  return (
    <>
      <div className="sorg-blad-agter" onClick={onSluit} />
      <div className="sorg-blad" role="dialog" aria-label="Hulp nou">
        <div className="sorg-blad-gryp" />
        <h2 className="sorg-blad-titel">Hulp nou</h2>
        <p className="sorg-blad-teks">
          Is jy, 'n kind of iemand anders op hierdie oomblik in gevaar? Bel een
          van hierdie nommers. Moenie hier wag nie.
        </p>
        <SorgNommers />
        <button className="sorg-blad-toe" onClick={onSluit}>Maak toe</button>
      </div>
    </>
  )
}

const AFDELINGS = [
  { sleutel: 'antwoord', naam: 'Dewald antwoord' },
  { sleutel: 'muur',     naam: 'Die Muur' },
  { sleutel: 'videos',   naam: 'Die Video\'s' },
]

export default function Sorg() {
  const [hulpOop, setHulpOop] = useState(false)
  const [vormOop, setVormOop] = useState(false)
  const [afdeling, setAfdeling] = useState('antwoord')
  const [data, setData] = useState(null)      // null = besig
  const [woord, setWoord] = useState(null)

  useEffect(() => {
    let lewendig = true
    haalVideos().then(d => {
      if (!lewendig) return
      setData(d)
      setWoord(vandagSeWoord(d))
    })
    return () => { lewendig = false }
  }, [])

  const videos = (data && data.videos) || []
  const held   = data ? weekVideo(data) : null
  const groepe = volgensBehoefte(videos)

  return (
    <div className="sorg">
      <div className="sorg-header screen-header">
        <button className="sorg-hulp-knop" onClick={() => setHulpOop(true)}>Hulp nou</button>
        <h1>Pastorale Sorg</h1>
        <p>Bring die swaar ding. Jy hoef dit nie alleen te dra nie.</p>
      </div>

      <div className="sorg-body">

        {/* ── Die held ── */}
        {held && (
          <SorgVideo video={held} groot etiket="Die week se video" />
        )}

        {/* ── Die knoppie, binne die eerste skerm ── */}
        <button className="sorg-vertel" onClick={() => setVormOop(true)}>
          <span className="sorg-vertel-hoof">Vertel my wat swaar is</span>
          <span className="sorg-vertel-fyn">Anoniem as jy wil · Dewald lees dit self</span>
        </button>

        {/* ── Vandag se woord ──
            Een bestaande video, elke dag 'n ander een. Dewald hoef niks
            nuuts te maak nie. */}
        {woord && (
          <SorgVideo
            video={woord}
            etiket="Vandag se woord"
            onSpeel={v => merkWoordGesien(v.id)}
          />
        )}

        {/* ── Die drie afdelings ── */}
        <div className="sorg-oortjies" role="tablist">
          {AFDELINGS.map(a => (
            <button
              key={a.sleutel}
              role="tab"
              aria-selected={afdeling === a.sleutel}
              className={`sorg-oortjie${afdeling === a.sleutel ? ' aktief' : ''}`}
              onClick={() => setAfdeling(a.sleutel)}
            >
              {a.naam}
            </button>
          ))}
        </div>

        {afdeling === 'videos' && (
          data === null ? (
            <p className="sorg-leeg">Besig om te laai…</p>
          ) : !videos.length ? (
            <p className="sorg-leeg">Die eerste video's kom binnekort.</p>
          ) : (
            groepe.map(g => (
              <div key={g.sleutel} className="sorg-groep">
                <h2 className="sorg-groep-sin">{g.sin}</h2>
                {g.videos.map(v => <SorgVideo key={v.id} video={v} />)}
              </div>
            ))
          )
        )}

        {afdeling === 'muur' && (
          <p className="sorg-leeg">Die muur maak binnekort oop.</p>
        )}

        {afdeling === 'antwoord' && (
          <p className="sorg-leeg">Dewald se eerste antwoorde kom binnekort.</p>
        )}

        <p className="sorg-grens">{GRENSSIN}</p>
      </div>

      <HulpNou oop={hulpOop} onSluit={() => setHulpOop(false)} />

      {/* Die vorm dek die hele skerm. Iemand wat sy swaarste ding tik, moet
          niks anders sien nie — geen navigasie, geen ander video's. */}
      <SorgVorm oop={vormOop} onSluit={() => setVormOop(false)} videoData={data} />
    </div>
  )
}
