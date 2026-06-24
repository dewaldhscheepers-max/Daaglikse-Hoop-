import './DonationCard.css'

export default function DonationCard() {
  function handleClick() {
    window.dispatchEvent(new CustomEvent('open-donation'))
  }

  return (
    <div className="donation-card">
      <div className="donation-card-heart">♥</div>
      <h3 className="donation-card-title">Help om Daaglikse Hoop gratis te hou.</h3>
      <p className="donation-card-text">
        Jou bydrae help met stemboodskappe, app-kostes, advertensies en gratis geestelike hulpbronne.
      </p>
      <button className="donation-card-btn" onClick={handleClick}>
        Ondersteun die Bediening
      </button>
    </div>
  )
}
