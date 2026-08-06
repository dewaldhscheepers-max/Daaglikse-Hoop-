/* 'n Video op die Sorg-blad.

   Die speler laai NIE totdat 'n mens hom druk nie. 'n YouTube-iframe trek
   sowat 'n halwe megagreep sodra hy op die bladsy staan, en op hierdie blad
   is daar 'n held bo, Vandag se woord, en 'n hele biblioteek. Sou hulle almal
   dadelik laai, sou die blad op 'n swak sein onbruikbaar wees — en 'n swak
   sein is in Suid-Afrika die gewone geval, nie die uitsondering nie.

   Ons wys dus YouTube se eie duimnael (een prentjie, 'n paar kilogreep) en
   ruil dit vir die speler by die eerste druk.

   Geen transform of opacity op :active nie — net kleur. Sien CLAUDE.md.
*/

import { useState } from 'react'
import './SorgVideo.css'

export default function SorgVideo({ video, groot = false, etiket = null, etiketFyn = null, onSpeel = null }) {
  const [speel, setSpeel] = useState(false)
  if (!video || !video.videoId) return null

  const duim = `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`

  return (
    <div className={`sv-kaart${groot ? ' sv-groot' : ''}`}>
      {etiket && <div className="sv-etiket">{etiket}</div>}
      {/* Hoekom hierdie een die week se video is. Sonder dit lyk dit soos
          enige video; met dit sien 'n mens die kring: mense deel, en dit
          word 'n video. */}
      {etiketFyn && <div className="sv-etiket-fyn">{etiketFyn}</div>}

      {/* Regop wanneer Dewald dit so gemerk het. Hy neem met sy foon op en
          laai dit as 'n Short; 'n 16:9-raam sou dit 'n dun strokie maak. */}
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

      <div className="sv-onder">
        <h3 className="sv-titel">{video.titel}</h3>
        {video.beskrywing && <p className="sv-beskrywing">{video.beskrywing}</p>}

        {/* Dit wys mense dat hul eerlike boodskappe werklik bepaal wat gemaak
            word. Geen mededinger kan dit namaak nie, want hulle het nie 'n
            muur en hulle het nie sy stem nie. */}
        {video.uitPlasing && (
          <p className="sv-uit-plasing">Hierdie video het by iemand se boodskap begin.</p>
        )}
      </div>
    </div>
  )
}
