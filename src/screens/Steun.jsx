import './Steun.css'

/* ────────────────────────────────────────────────────────────
   Die steunblad agter die eie skakel.

   Dit maak NET oop wanneer iemand die spesiale skakel gebruik —
   /steun, /support, /go/support, of ?steun=1. 'n Gewone besoeker aan die
   app sien dit nooit vanself nie.

   Dit is nie 'n betaalmuur nie. Die "Gaan voort na die app"-knoppie is
   altyd daar, en niks word toegemaak as jy nie gee nie. Die twee
   betaalknoppies stuur presies dieselfde gebeurtenisse as die res van die
   app, dus loop dit deur die bestaande PayFast-vloei — daar is nie 'n
   tweede betaalpad om reg te hou nie.
   ──────────────────────────────────────────────────────────── */

export default function Steun({ onSluit }) {
  return (
    <div className="steun-blad" role="dialog" aria-label="Help my om Daaglikse Hoop gratis te hou">
      <div className="steun-blad-binne">
        <div className="steun-hart">♥</div>

        <h1 className="steun-titel">Help my om Daaglikse Hoop gratis te hou</h1>

        <p className="steun-lei">
          Alles op Daaglikse Hoop is en bly gratis — die daaglikse
          stemboodskappe, die Bybel, die gebedsmuur, e-boeke en alles wat nog
          kom.
        </p>
        <p className="steun-lei steun-lei-fyn">
          As Daaglikse Hoop iets vir jou beteken, kan jy my vrywillig help om
          met hierdie bediening voort te gaan. Jou ondersteuning help om die
          werk van Daaglikse Hoop moontlik te maak en elke dag meer mense te
          bereik.
        </p>

        <button
          className="steun-blad-knop steun-blad-primer"
          onClick={() => window.dispatchEvent(new CustomEvent('open-hoop-vennoot'))}
        >
          Maandelikse ondersteuning
          <small>Word 'n maandelikse ondersteuner</small>
        </button>

        <button
          className="steun-blad-knop steun-blad-tweede"
          onClick={() => window.dispatchEvent(new CustomEvent('open-donation'))}
        >
          Eenmalige ondersteuning
          <small>Gee enige bedrag</small>
        </button>

        {/* Nooit 'n betaalmuur nie. Hierdie pad moet altyd oop wees. */}
        <button className="steun-blad-verder" onClick={onSluit}>
          Gaan voort na die app
        </button>

        <p className="steun-fyn">
          Betalings word veilig deur PayFast verwerk. Ons kry nooit toegang tot
          jou kaartbesonderhede nie.
        </p>
      </div>
    </div>
  )
}
