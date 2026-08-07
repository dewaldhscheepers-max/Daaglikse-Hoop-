/* 'n Video op die Sorg-blad.

   Die vorm is Facebook s'n, want dit is die vorm wat elke mens in hierdie
   land al ken:

       Titel                      ← bo, plat, sonder etiket
       [ volle video, geen kante ]
       👍  💬  ↗                  ← reageer · opmerk · deel
       Ondersteun

   Wat WEG is en hoekom:

   · Die "VANDAG SE VIDEO"-etiket en sy verduidelikende sin. Twee reels bo
     elke video wat niks byvoeg nie — die titel se reeds waaroor dit gaan.
   · Die titel wat ONDER die video gestaan het. Op Facebook staan die woorde
     bo en die video onder, en 'n mens lees eers waaroor dit gaan voordat hy
     besluit om te druk.

   Die speler laai NIE totdat 'n mens hom druk nie. 'n YouTube-iframe trek
   sowat 'n halwe megagreep sodra hy op die bladsy staan, en 'n bladsy vol
   video's sou op 'n swak sein nooit klaar laai nie — en 'n swak sein is in
   Suid-Afrika die gewone geval. Ons wys dus YouTube se eie duimnael (een
   prentjie, 'n paar kilogreep) en ruil dit vir die speler by die eerste druk.

   Geen transform of opacity op :active nie — net kleur. Sien CLAUDE.md.
*/

import { useState } from 'react'
import SorgSaamstaan from './SorgSaamstaan'
import './SorgVideo.css'

export default function SorgVideo({ video, groot = false, onSpeel = null }) {
  const [speel, setSpeel] = useState(false)
  if (!video || !video.videoId) return null

  const duim = `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`

  return (
    <div className={`sv-kaart${groot ? ' sv-groot' : ''}`}>
      {/* Die titel staan BO die video, soos op Facebook. */}
      <h3 className="sv-titel">{video.titel}</h3>
      {video.beskrywing && <p className="sv-beskrywing">{video.beskrywing}</p>}

      {/* Dit wys mense dat hul eerlike boodskappe werklik bepaal wat gemaak
          word. Geen mededinger kan dit namaak nie, want hulle het nie 'n
          muur en hulle het nie sy stem nie. */}
      {video.uitPlasing && (
        <p className="sv-uit-plasing">Hierdie video het by iemand se boodskap begin.</p>
      )}

      {/* Regop wanneer Dewald dit so gemerk het. Die raam neem die video se
          eie verhouding aan, dus is daar NOOIT 'n swart kant nie — nie 'n
          strokie in 'n wye raam nie en nie 'n donker band weerskante nie. */}
      <div className={`sv-raam${video.regop ? ' regop' : ''}`}>
        {speel ? (
          <iframe
            className="sv-speler"
            src={`https://www.youtube.com/embed/${video.videoId}?rel=0&autoplay=1`}
            title={video.titel}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            className="sv-duim"
            style={{ backgroundImage: `url(${duim})` }}
            onClick={() => { setSpeel(true); if (onSpeel) onSpeel(video) }}
            aria-label={`Speel ${video.titel}`}
          >
            <span className="sv-speel">
              <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
                <polygon points="7,4 20,12 7,20" />
              </svg>
            </span>
          </button>
        )}
      </div>

      {/* Reageer · opmerk · deel, in EEN ry. Deel het voorheen in 'n aparte
          reeltjie onder die kaart gestaan; op Facebook is dit die derde
          knoppie in dieselfde balk, en dit is waar 'n mens dit soek. */}
      <SorgSaamstaan
        plasing={video}
        soort="video"
        deel={{ soort: 'video', id: video.videoId, titel: video.titel }}
      />
    </div>
  )
}
