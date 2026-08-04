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
    <div className="steun-blad" role="dialog" aria-label="Help dra die hoop">
      <div className="steun-blad-binne">
        <div className="steun-hart">♥</div>

        <h1 className="steun-titel">Help dra die hoop</h1>

        <p className="steun-lei">
          Daaglikse Hoop is en bly heeltemal gratis — die daaglikse boodskappe,
          die Bybel, die gebedsmuur en alles anders. Niks gaan ooit agter 'n
          betaling nie.
        </p>
        <p className="steun-lei steun-lei-fyn">
          Jou bydrae betaal die app se kostes, die stemboodskappe en die
          gratis boeke, sodat dit vir die volgende mens ook gratis kan wees.
        </p>

        <button
          className="steun-blad-knop steun-blad-primer"
          onClick={() => window.dispatchEvent(new CustomEvent('open-hoop-vennoot'))}
        >
          Maandelikse ondersteuning
          <small>Word 'n Hoop-Vennoot</small>
        </button>

        <button
          className="steun-blad-knop steun-blad-tweede"
          onClick={() => window.dispatchEvent(new CustomEvent('open-donation'))}
        >
          Eenmalige ondersteuning
          <small>Enige bedrag help</small>
        </button>

        {/* Nooit 'n betaalmuur nie. Hierdie pad moet altyd oop wees. */}
        <button className="steun-blad-verder" onClick={onSluit}>
          Gaan voort na die app
        </button>

        <p className="steun-fyn">
          Elke bydrae gaan deur PayFast. Ons sien nooit jou kaartbesonderhede nie.
        </p>
      </div>
    </div>
  )
}
