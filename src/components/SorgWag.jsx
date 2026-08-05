/* ────────────────────────────────────────────────────────────
   "Terwyl jy wag" — die blok wat iemand kry ná hy geskryf het.

   Een video as daar een is, drie stemnotas, en een gratis e-boek. In
   daardie volgorde, en met opset:

   · Die video is die naaste ding aan 'n antwoord.
   · Die stemnotas is Dewald se eie stem. Vir iemand wat pas sy hart
     neergesit het, is dit die sterkste ding in die hele app — en dit is
     klaar daar, honderde van hulle.
   · Die e-boek staan laaste en klein. Iemand wat pas geskryf het dat hy nie
     meer wil lewe nie, moet nie 'n boekrak in die gesig kry nie.

   Die stemnotas speel HIER, met 'n gewone speler. Ons stuur hom nie na
   Luister toe nie: hy is besig met iets, en 'n mens wat weggestuur word,
   kom nie terug nie.

   Geen prys, nooit. Net gratis boeke kom hier.
   ──────────────────────────────────────────────────────────── */

import { useState, useEffect } from 'react'
import { haalNotas, notasVir, boekVir } from '../data/sorgWag'
import { hoopVir } from '../data/sorgVideos'
import SorgVideo from './SorgVideo'
import './SorgWag.css'

export default function SorgWag({ onderwerp = 'ander', videoData = null, kort = false, notas: gegee = null }) {
  const [gehaal, setGehaal] = useState(null)

  /* `notas` mag van buite af kom. Die muur laai hulle een keer en gee hulle
     aan elke kaart, in plaas daarvan dat elke kaart self gaan haal. */
  useEffect(() => {
    if (gegee) return
    let lewendig = true
    haalNotas().then(n => { if (lewendig) setGehaal(n) })
    return () => { lewendig = false }
  }, [gegee])

  const notas = gegee || gehaal

  const hoop = videoData ? hoopVir(onderwerp, videoData) : null
  const video = hoop && hoop.video
  const gekies = notasVir(onderwerp, notas || [], kort ? 1 : 3)
  const boek = kort ? null : boekVir(onderwerp)

  /* Niks om te wys nie — dan wys ons niks. 'n Leë kop met 'n belofte is
     erger as stilte. */
  if (!video && !gekies.length && !boek) return null

  return (
    <div className="sw">
      <p className="sw-kop">
        {kort ? 'Iets wat jou dalk nou kan help' : 'Terwyl jy wag'}
      </p>

      {video && <SorgVideo video={video} />}

      {gekies.length > 0 && (
        <div className="sw-notas">
          {!kort && <p className="sw-onder-kop">Luister na Dewald</p>}
          {gekies.map(n => (
            <div key={n.id} className="sw-nota">
              <p className="sw-nota-titel">{n.title}</p>
              {n.scripture && <p className="sw-nota-vers">{n.scripture}</p>}
              {/* "metadata", nie "none" nie. Met "none" weet die blaaier nie hoe
                  lank die opname is nie en die speler wys 0:00 / 0:00 — dit lyk
                  stukkend en 'n mens druk dit nie. Dieselfde fout as op die
                  antwoord se speler. */}
              <audio className="sw-speler" controls preload="metadata" src={n.audioUrl}>
                Jou blaaier kan nie hierdie opname speel nie.
              </audio>
            </div>
          ))}
        </div>
      )}

      {boek && (
        <button
          className="sw-boek"
          onClick={() => window.dispatchEvent(new CustomEvent('open-boek', { detail: { id: boek.id } }))}
        >
          <span className="sw-boek-ikoon" aria-hidden="true">{boek.emoji || '📖'}</span>
          <span className="sw-boek-teks">
            <span className="sw-boek-titel">{boek.title}</span>
            <span className="sw-boek-fyn">Gratis om af te laai</span>
          </span>
        </button>
      )}
    </div>
  )
}
