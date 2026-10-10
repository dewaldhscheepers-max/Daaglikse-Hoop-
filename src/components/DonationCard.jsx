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
 *
 * ── Die kaart is KORT ──
 *
 * Dewald, 24 September 2026: *"dit lyk te groot... haal dalk die harjie weg.
 * Dis net wit... dit voel weird."* Die hartjie in sy kring, die strook bo en 'n
 * reël wat die knoppie se rede herhaal, het dit saam 'n venster gemaak in
 * plaas van 'n afdeling van die blad. Sien DonationCard.css se kop.
 */
/* ── Twee tale ──
 *
 * Die Engelse e-boekblad (/english) gebruik dieselfde kaart en dieselfde twee
 * gebeurtenisse. Net die vaste woorde — die drie gesigte se opskrifte en die
 * knoppie-etikette — skuif met `taal`. Die props (titel/teks/bewys) kom reeds
 * in die regte taal van die beller af. */
const KAART_WOORDE = {
  af: {
    vennootTitel: 'Dankie, Hoop-Vennoot',
    vennootTeks:  'Jou maandelikse ondersteuning help ons om hoop gratis beskikbaar te hou.',
    gewerTitel:   'Dankie vir jou bydrae',
    gewerTeks:    'Jou ondersteuning help ons om Daaglikse Hoop gratis te hou.',
    wordVennoot:  "Word 'n Hoop-Vennoot",
    skenkWeer:    'Skenk weer',
    gewerFyn:     'Kies maandeliks en help om Daaglikse Hoop elke dag gratis te hou.',
    maandeliks:   "Word 'n maandelikse Hoop-Vennoot",
    eenmalig:     'Gee eenmalig',
    geenFyn:      'Alles bly gratis. Geen verpligting nie.',
  },
  en: {
    vennootTitel: 'Thank you, Hope Partner',
    vennootTeks:  'Your monthly support helps us keep hope freely available.',
    gewerTitel:   'Thank you for your gift',
    gewerTeks:    'Your support helps us keep Daaglikse Hoop free.',
    wordVennoot:  'Become a Hope Partner',
    skenkWeer:    'Donate again',
    gewerFyn:     'Choose monthly and help keep Daaglikse Hoop free every day.',
    maandeliks:   'Become a monthly Hope Partner',
    eenmalig:     'Give once',
    geenFyn:      'Everything stays free. No obligation.',
  },
}

export default function DonationCard({
  titel = 'Help om Daaglikse Hoop gratis te hou.',
  teks  = 'Jou bydrae help met stemboodskappe, app-kostes, advertensies en gratis geestelike hulpbronne.',
  bewys,         /* die klein bewys-reël bo die titel, bv. die R-bedrag */
  knop,          /* net gegee vir die EEN-knoppie-weergawe */
  fyn,           /* die klein reël onderaan */
  klas = '',
  taal = 'af',
}) {
  const w = KAART_WOORDE[taal] || KAART_WOORDE.af
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
        <h3 className="donation-card-title">{w.vennootTitel}</h3>
        <p className="donation-card-text">{w.vennootTeks}</p>
      </div>
    )
  }

  /* ── Sy het hierdie maand reeds gegee ──
   * Bedank haar, en nooi haar EEN keer om dit maandeliks te doen. Stil — die
   * groen knoppie bly weg. */
  if (gesig === 'gewer') {
    return (
      <div className={`donation-card is-dankie${klas ? ' ' + klas : ''}`}>
        <h3 className="donation-card-title">{w.gewerTitel}</h3>
        <p className="donation-card-text">{w.gewerTeks}</p>
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
          {w.wordVennoot}
        </button>
        <p className="donation-card-fyn">{w.gewerFyn}</p>
        {/* ── "Skenk weer" — 'n SKAKEL, nie 'n tweede knoppie nie ──
         * Dewald, 10 Oktober 2026, ná sy eie skenking: *"Nadat ek geskenk het
         * moet daar steeds 'n eenmalige donate knoppie wees... as hul weer wil
         * skenk."* Hy is reg: wie wil gee, moet nie eers 'n maand wag nie. Dit
         * staan as stil teks onder die fyn reël, sodat die dankie 'n dankie bly
         * en die vennoot-knoppie die enigste ding is wat soos 'n knoppie lyk. */}
        <button className="donation-card-weer" onClick={handleOnce}>
          {w.skenkWeer}
        </button>
      </div>
    )
  }

  return (
    <div className={`donation-card${klas ? ' ' + klas : ''}`}>
      {bewys && <p className="donation-card-bewys">{bewys}</p>}
      <h3 className="donation-card-title">{titel}</h3>
      <p className="donation-card-text">{teks}</p>
      {knop ? (
        /* Een knoppie. Twee keuses is 'n besluit; hier vra ons net een ding. */
        <button className="donation-card-btn-enkel" onClick={handleOnce}>{knop}</button>
      ) : (
        <>
          {/* Die maandelikse keuse is die HOOFpad en die enigste sterk ding op
              die kaart. Die rede daarvoor staan in die sin BO die knoppie
              ("die app, e-boeke en daaglikse boodskappe") — hier het dit 'n
              tweede keer onder die knoppie gestaan, en dit het die kaart
              langer gemaak sonder om iets by te sê. */}
          <button className="donation-card-btn-monthly" onClick={handleMonthly}>
            {w.maandeliks}
          </button>
          <button className="donation-card-btn-once" onClick={handleOnce}>
            {w.eenmalig}
          </button>
        </>
      )}
      {fyn
        ? <p className="donation-card-fyn">{fyn}</p>
        : !knop && <p className="donation-card-fyn">{w.geenFyn}</p>}
    </div>
  )
}
