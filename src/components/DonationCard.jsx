import './DonationCard.css'

/* Die donasie-kaart. Dit staan op Luister, Speel, Bid Nou, Bid Saam, Sorg,
   Vredepad en Meer — en nou ook onder VOLG JESUS se dae.
 *
 * Die WOORDE is 'n prop; die PAD is dit nie. Elke knoppie hier stuur dieselfde
 * twee gebeurtenisse as oral elders, sodat daar een donasie-vloei in die app
 * is. 'n Tweede kaart met sy eie pad is 'n tweede plek wat stilweg agterbly
 * die dag wanneer die betaalstelsel verander.
 *
 * Sonder props lyk dit presies soos altyd. */
export default function DonationCard({
  titel = 'Help om Daaglikse Hoop gratis te hou.',
  teks  = 'Jou bydrae help met stemboodskappe, app-kostes, advertensies en gratis geestelike hulpbronne.',
  knop,          /* net gegee vir die EEN-knoppie-weergawe */
  fyn,           /* die klein reël onderaan */
  klas = '',
}) {
  function handleOnce() {
    window.dispatchEvent(new CustomEvent('open-donation'))
  }

  function handleMonthly() {
    window.dispatchEvent(new CustomEvent('open-hoop-vennoot'))
  }

  return (
    <div className={`donation-card${klas ? ' ' + klas : ''}`}>
      <div className="donation-card-heart">♥</div>
      <h3 className="donation-card-title">{titel}</h3>
      <p className="donation-card-text">{teks}</p>
      {knop ? (
        /* Een knoppie. Twee keuses is 'n besluit; hier vra ons net een ding. */
        <button className="donation-card-btn-enkel" onClick={handleOnce}>{knop}</button>
      ) : (
        <>
          <button className="donation-card-btn-monthly" onClick={handleMonthly}>
            Word 'n Maandelikse Hoop-Vennoot
          </button>
          <button className="donation-card-btn-once" onClick={handleOnce}>
            Eenmalige bydrae
          </button>
        </>
      )}
      {fyn && <p className="donation-card-fyn">{fyn}</p>}
    </div>
  )
}
