/* 'n Video op die Sorg-blad.

   ── Twee toestande, nie twee komponente nie ──

   TOEGEMAAK — 'n kaartjie: klein duimnael links, titel regs. Sowat 'n agtste
   van die skerm. 'n Mens sien vyf video's op een skerm en kan kies.

   OOP — die volle speler, 9:16 en van rand tot rand, met die titel bo. Dit
   gebeur eers wanneer hy die kaartjie druk.

   Voorheen was elke video ALTYD die volle speler: 74% van die skerm elk. 'n
   Biblioteek van veertien was veertien skerms hoog, en 'n mens kon nie sien
   wat daar is nie. 'n Lys moet 'n LYS wees; die speler kom wanneer hy kies.

   Die aksiebalk — reageer, opmerk, deel, dankie — bly in ALBEI toestande
   staan. 'n Mens moet 'n video kan hou van sonder om hom eers te speel, net
   soos op enige muur.

   ── Waarom die speler nie vooraf laai nie ──

   'n YouTube-iframe trek sowat 'n halwe megagreep sodra hy op die bladsy
   staan. 'n Bladsy vol video's sou op 'n swak sein nooit klaar laai nie — en
   'n swak sein is in Suid-Afrika die gewone geval. Ons wys YouTube se eie
   duimnael (een prentjie, 'n paar kilogreep) en ruil dit vir die speler by
   die eerste druk.

   Geen transform of opacity op :active nie — net kleur. Sien CLAUDE.md.
*/

import { useState } from 'react'
import SorgSaamstaan from './SorgSaamstaan'
import './SorgVideo.css'

export default function SorgVideo({ video, etiket = null, wysBalk = true, onSpeel = null }) {
  const [speel, setSpeel] = useState(false)
  if (!video || !video.videoId) return null

  const duim = `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`

  function begin() {
    setSpeel(true)
    if (onSpeel) onSpeel(video)
  }

  return (
    <div className={`sv-kaart${speel ? ' sv-speel-aan' : ''}`}>
      {etiket && <div className="sv-etiket">{etiket}</div>}

      {speel ? (
        <>
          <h3 className="sv-titel">{video.titel}</h3>
          {/* Die raam neem die VIDEO se verhouding aan, dus is daar nerens 'n
              swart kant nie — nie 'n strokie in 'n wye raam nie en nie 'n
              donker band weerskante nie. */}
          <div className={`sv-raam${video.regop ? ' regop' : ''}`}>
            <iframe
              className="sv-speler"
              src={`https://www.youtube.com/embed/${video.videoId}?rel=0&autoplay=1`}
              title={video.titel}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </>
      ) : (
        <button className="sv-ry" onClick={begin} aria-label={`Speel ${video.titel}`}>
          <span className="sv-ry-duim" style={{ backgroundImage: `url(${duim})` }} aria-hidden="true">
            <span className="sv-ry-speel">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <polygon points="7,4 20,12 7,20" />
              </svg>
            </span>
          </span>
          <span className="sv-ry-titel">{video.titel}</span>
        </button>
      )}

      {video.beskrywing && <p className="sv-beskrywing">{video.beskrywing}</p>}

      {/* Dit wys mense dat hul eerlike boodskappe werklik bepaal wat gemaak
          word. Geen mededinger kan dit namaak nie, want hulle het nie 'n muur
          en hulle het nie sy stem nie. */}
      {video.uitPlasing && (
        <p className="sv-uit-plasing">Hierdie video het by iemand se boodskap begin.</p>
      )}

      {wysBalk && (
        <SorgSaamstaan
          plasing={video}
          soort="video"
          deel={{ soort: 'video', id: video.videoId, titel: video.titel }}
        />
      )}
    </div>
  )
}
