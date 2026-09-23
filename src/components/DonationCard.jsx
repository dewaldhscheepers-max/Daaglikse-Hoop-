import { useMemo } from 'react'
import { kaartGesig, siklusVir, SIKLUS_SLEUTEL, VENNOOT_SLEUTEL } from '../data/skenkStatus'
import './DonationCard.css'

/* Die donasie-kaart. Dit staan op Luister, Speel, Bid Nou, Bid Saam, Sorg,
 * Vredepad en Meer — en onder VOLG JESUS se dae.
 *
 * Die WOORDE is 'n prop; die PAD is dit nie. Elke knoppie hier stuur dieselfde
 * twee gebeurtenisse as oral elders, sodat daar een donasie-vloei in die app
 * is. 'n Tweede kaart met sy eie pad is 'n tweede plek wat stilweg agterbly die
 * dag wanneer die betaalstelsel verander.
 *
 * ── DRIE GESIGTE, nie een nie ──
 *
 * Dewald, 23 September 2026: *"hoe kry ek meer donasies as nou maar pla nie die
 * mense nie."*
 *
 * Die kaart het vir almal dieselfde gevra — ook vir die mens wat R50 elke maand
 * gee. Daardie mens is presies wie 'n mens NIE moet vra nie, en sy het dit op
 * agt skerms gesien. `kaartGesig()` in src/data/skenkStatus.js is die besluit,
 * suiwer en met toetse:
 *
 *   vennoot → 'n DANKIE, en geen vraag nie;
 *   gewer   → 'n dankie, met die stil uitnodiging om vennoot te word;
 *   vra     → die gewone kaart.
 *
 * Die gesig word EEN keer per monteer gelees (`useMemo`). Lees 'n mens dit by
 * elke render, verander die kaart onder iemand se vingers op die oomblik dat sy
 * terugkom van 'n betaling af.
 *
 * ── Die BEWYS staan op die kaart, en dit is 'n PROP ──
 *
 * Die e-boekblad gee sy eie getal saam ("R837 625+ se e-boeke reeds gratis
 * weggegee"). Daardie getal LEEF — dit kom uit `eboekTotale()`, dieselfde bron
 * as die banier bo-aan — en dit mag NOOIT in hierdie lêer ingetik word nie.
 * 'n Getal wat hier vasstaan, is oor 'n maand 'n leuen op sewe skerms.
 *
 * Sonder die prop lyk die kaart presies soos altyd.
 */
export default function DonationCard({
  titel = 'Help om Daaglikse Hoop gratis te hou.',
  teks  = 'Jou bydrae help met stemboodskappe, app-kostes, advertensies en gratis geestelike hulpbronne.',
  bewys,         /* die klein bewys-reël bo die titel, bv. die R-bedrag */
  knop,          /* net gegee vir die EEN-knoppie-weergawe */
  fyn,           /* die klein reël onderaan */
  klas = '',
}) {
  /* Een keer, by die monteer. Sien die kop. */
  const gesig = useMemo(() => {
    let gestoorSiklus = '', gestoorVennoot = ''
    try {
      gestoorSiklus  = localStorage.getItem(SIKLUS_SLEUTEL) || ''
      gestoorVennoot = localStorage.getItem(VENNOOT_SLEUTEL) || ''
    } catch { /* privaat modus — dan wys ons die gewone kaart */ }
    return kaartGesig({ siklus: siklusVir(new Date()), gestoorSiklus, gestoorVennoot })
  }, [])

  function handleOnce() {
    window.dispatchEvent(new CustomEvent('open-donation'))
  }

  function handleMonthly() {
    window.dispatchEvent(new CustomEvent('open-hoop-vennoot'))
  }

  /* ── Sy gee ELKE MAAND ──
   * Geen vraag, geen knoppie. Net dankie. */
  if (gesig === 'vennoot') {
    /* GEEN knoppie. Die voorstel was "[ Bestuur my bydrae ] of net geen groot
     * ask nie" — en die eerste een bestaan nie: 'n intekening word by PayFast
     * gekanselleer of verander, nie in hierdie app nie. 'n Knoppie wat niks
     * doen nie, is erger as stilte. Dus die tweede. */
    return (
      <div className={`donation-card is-dankie${klas ? ' ' + klas : ''}`}>
        <span className="donation-card-heart" aria-hidden="true">♥</span>
        <h3 className="donation-card-title">Dankie, Hoop-Vennoot</h3>
        <p className="donation-card-text">
          Jou maandelikse ondersteuning help ons om hoop gratis beskikbaar te hou.
        </p>
      </div>
    )
  }

  /* ── Sy het hierdie maand reeds gegee ──
   * Bedank haar, en nooi haar EEN keer om dit maandeliks te doen. Stil — die
   * groen knoppie bly weg. */
  if (gesig === 'gewer') {
    return (
      <div className={`donation-card is-dankie${klas ? ' ' + klas : ''}`}>
        <span className="donation-card-heart" aria-hidden="true">♥</span>
        <h3 className="donation-card-title">Dankie vir jou bydrae</h3>
        <p className="donation-card-text">
          Jou ondersteuning help ons om Daaglikse Hoop gratis te hou.
        </p>
        {/* EEN knoppie, en dit is die VENNOOT-een.
         *
         * Die voorstel was "[ Gee weer ] of [ Word 'n Hoop-Vennoot ]". "Gee
         * weer" is presies die pla wat ons pas weggevat het: sy het HIERDIE
         * maand klaar gegee. "Word 'n Hoop-Vennoot" vra nie vir nog geld nie —
         * dit vra of sy dit gereeld wil maak, en dit is die waardevolste tree
         * in die hele app.
         *
         * En twee knoppies op 'n dankie-kaart maak dit weer 'n vraag. */}
        <button className="donation-card-btn-once" onClick={handleMonthly}>
          Word 'n Hoop-Vennoot
        </button>
        <p className="donation-card-fyn">
          Kies maandeliks en help om Daaglikse Hoop elke dag gratis te hou.
        </p>
      </div>
    )
  }

  return (
    <div className={`donation-card${klas ? ' ' + klas : ''}`}>
      <span className="donation-card-heart" aria-hidden="true">♥</span>
      {bewys && <p className="donation-card-bewys">{bewys}</p>}
      <h3 className="donation-card-title">{titel}</h3>
      <p className="donation-card-text">{teks}</p>
      {knop ? (
        /* Een knoppie. Twee keuses is 'n besluit; hier vra ons net een ding. */
        <button className="donation-card-btn-enkel" onClick={handleOnce}>{knop}</button>
      ) : (
        <>
          {/* Die maandelikse keuse staan eerste EN dra sy eie rede. Sonder die
              rede lees "R50 eenmalig" teenoor "R50 elke maand" soos dieselfde
              ding, net duurder — en dan kies niemand die tweede nie. */}
          <button className="donation-card-btn-monthly" onClick={handleMonthly}>
            Word 'n Maandelikse Hoop-Vennoot
          </button>
          <p className="donation-card-rede">
            Help elke maand om die app, die e-boeke en die daaglikse boodskap
            gratis te hou.
          </p>
          <button className="donation-card-btn-once" onClick={handleOnce}>
            Eenmalige bydrae
          </button>
        </>
      )}
      {fyn
        ? <p className="donation-card-fyn">{fyn}</p>
        : !knop && <p className="donation-card-fyn">Alles bly gratis. Geen verpligting nie.</p>}
    </div>
  )
}
