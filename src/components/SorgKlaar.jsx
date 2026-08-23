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

import SorgWag from './SorgWag'
import SorgNommers from './SorgNommers'

export default function SorgKlaar({ uitslag, videoData, onSluit }) {
  const onderwerp = uitslag.onderwerp || 'ander'

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

      {/* ── Wat NOU met sy storie gebeur ──
       *
       * Dit het altyd gesê "ná goedkeuring". Plasings gaan nou dadelik op die
       * muur (sien api/sorg-stuur.mjs), behalwe wanneer die krisis-opsporing
       * iets raaksien — dan wag dit wel vir 'n mens.
       *
       * Die skerm mag nie die verkeerde een sê nie. Iemand wat hoor "dit wag
       * vir goedkeuring" en dit dan dadelik op die muur sien, weet nie meer
       * wat om die app te glo nie; en iemand wat hoor "dit is nou op" en dit
       * nie sien nie, dink hy is weggegooi. */}
      <h2 className="sv-klaar-kop">Dankie. Jou boodskap is ontvang.</h2>
      {uitslag.opDieMuur ? (
        <p className="sv-klaar-teks">
          Jou storie is nou op die Sorg &amp; Ondersteuning-muur. Die gemeenskap
          kan van hier af langs jou kom staan.
        </p>
      ) : (
        <p className="sv-klaar-teks">
          Ons gaan dit eers met sorg lees voordat dit op die Sorg &amp;
          Ondersteuning-muur verskyn.
        </p>
      )}

      {/* ── Terwyl jy wag ──

          'n Video as daar een is, drie stemnotas, en een gratis e-boek.

          Dit was net 'n video. Maar daar is nog nul Sorg-video's, dus was
          hierdie plek leeg — presies waar iemand pas sy hart neergesit het
          en die minste kan bekostig om niks te kry nie. Die stemnotas en die
          e-boeke was al die tyd daar. */}
      <SorgWag onderwerp={onderwerp} videoData={videoData} />

      <button className="sv-groot-knop" onClick={onSluit}>Terug na Sorg &amp; Ondersteuning</button>
    </div>
  )
}
