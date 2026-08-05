/* ────────────────────────────────────────────────────────────
   Wat iemand sien nadat hy gestuur het.

   Hierdie skerm was 'n bladsy lank: 'n vers, 'n gebed, 'n private kode met
   'n kopieerknoppie, 'n verduideliking oor hoe om jou plasing later te laat
   verwyder, en 'n kennisgewingstap. Dewald was reg — dit maak die oomblik
   swaar in plaas van lig.

   Nou is dit drie dinge:

     1. Is dit dringend, die nommers — eerste.
     2. Dankie, en wat nou gaan gebeur. Twee sinne.
     3. Iets om NOU te kyk. Die video was die enigste deel wat werk.

   Die vers en die gebed is nie weg uit die app nie — hulle het net nie hier
   gehoort nie. Iemand wat pas sy hart neergesit het, wil nie 'n bladsy lees
   nie.
   ──────────────────────────────────────────────────────────── */

import { hoopVir } from '../data/sorgVideos'
import SorgVideo from './SorgVideo'
import SorgNommers from './SorgNommers'

export default function SorgKlaar({ uitslag, videoData, onSluit }) {
  const onderwerp = uitslag.onderwerp || 'ander'
  const hoop = videoData ? hoopVir(onderwerp, videoData) : null

  return (
    <div className="sv-blok">

      {uitslag.krisis && (
        <div className="sv-krisis">
          <p className="sv-krisis-kop">Wat jy geskryf het, klink dringend.</p>
          <p className="sv-krisis-teks">
            Moenie vir 'n antwoord hier wag nie. Bel asseblief nou.
          </p>
          <SorgNommers wys="dringend" />
        </div>
      )}

      <h2 className="sv-klaar-kop">Dankie. Jou boodskap is ontvang.</h2>
      <p className="sv-klaar-teks">
        Ons gaan dit eers met sorg lees. Ná goedkeuring sal dit openbaar op die
        Pastorale Sorg-muur verskyn.
      </p>

      {hoop && hoop.video && (
        <>
          <p className="sv-klaar-rede">Iets wat jou dalk nou kan help</p>
          <SorgVideo video={hoop.video} />
        </>
      )}

      <button className="sv-groot-knop" onClick={onSluit}>Terug na Pastorale Sorg</button>
    </div>
  )
}
