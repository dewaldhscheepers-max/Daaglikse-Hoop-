import DonationCard from '../components/DonationCard'
import './Speel.css'

// Speletjies wat vrede help bou. Vredepad staan boaan.
// Om een by te voeg: nog 'n inskrywing hier, en 'n luisteraar in App.jsx.
const SPELETJIES = [
  {
    id:      'vredepad',
    event:   'open-vredepad',
    titel:   'Vredepad',
    beskryf: 'Stap die pad van vrede — versamel blomme, vermy die dorings, en verdien gratis boeke langs die pad.',
    merk:    'Speel nou',
    tint:    '#E8F1EA',
    stroke:  '#4A7C5E',
    ikoon: (
      <>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
      </>
    ),
  },
]

export default function Speel() {
  function open(spel) {
    window.dispatchEvent(new CustomEvent(spel.event))
  }

  return (
    <div className="speel">
      <div className="screen-header speel-header">
        <h1 className="speel-title">Speel</h1>
        <p className="speel-sub">
          Speletjies wat jou help om te ontspan en vrede te vind. Almal gratis.
        </p>
      </div>

      <div className="speel-body">
        {SPELETJIES.map(spel => (
          <button key={spel.id} className="speel-kaart" onClick={() => open(spel)}>
            <div className="speel-teel" style={{ background: spel.tint }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={spel.stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                {spel.ikoon}
              </svg>
            </div>
            <div className="speel-info">
              <span className="speel-kaart-titel">{spel.titel}</span>
              <span className="speel-kaart-beskryf">{spel.beskryf}</span>
              <span className="speel-kaart-merk">{spel.merk} →</span>
            </div>
          </button>
        ))}

        <p className="speel-binnekort">Meer speletjies is op pad.</p>

        <DonationCard />
      </div>
    </div>
  )
}
