import DonationCard from '../components/DonationCard'
import './Speel.css'

/* Die hele punt van hierdie blad is om die app in mense se hande te kry.
   Elke speletjie kry dus sy eie deel-knoppie. */
const APP = 'https://dewaldscheepers.com/go'

async function deelSpel(spel) {
  const teks = `${spel.titel} — ${spel.beskryf}\n\nGratis in Daaglikse Hoop.`
  try {
    if (navigator.share) { await navigator.share({ title: spel.titel, text: teks, url: APP }); return }
    await navigator.clipboard.writeText(`${teks}\n${APP}`)
    window.dispatchEvent(new CustomEvent('wys-kennis', { detail: 'Geskakel gekopieer' }))
  } catch { /* die speler het gekanselleer; dis nie 'n fout nie */ }
}

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
  {
    id:      'bou-die-ark',
    event:   'open-bou-die-ark',
    titel:   'Bou die Ark',
    beskryf: 'Laat die planke sak en pak hulle netjies. Elke volle ry bou \'n stuk van die ark.',
    merk:    'Speel nou',
    tint:    '#F3EEE4',
    stroke:  '#9A7340',
    ikoon: (
      <>
        <path d="M3 14h18l-2.2 5.2a2 2 0 0 1-1.84 1.2H7.04a2 2 0 0 1-1.84-1.2Z"/>
        <path d="M5.5 14V9.5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2V14"/>
        <path d="M9.5 7.5V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2.5"/>
      </>
    ),
  },
  {
    id:      'vrugtefees',
    event:   'open-vrugtefees',
    titel:   'Vrugtefees',
    beskryf: 'Pas die vrugte, bou groot kombinasies en kyk hoe ver jou oes kan groei.',
    merk:    'Speel nou',
    tint:    '#F5EDE0',
    stroke:  '#B4762F',
    ikoon: (
      <>
        <path d="M12 21c-4 0-7-3.2-7-7 0-3 2-5.4 4.2-6.2C10.4 7.3 11.2 6.2 12 4.6c.8 1.6 1.6 2.7 2.8 3.2C17 8.6 19 11 19 14c0 3.8-3 7-7 7Z"/>
        <path d="M12 4.6C11 3 9.5 2.4 8 3c.6 1.9 2.2 2.7 4 1.6Z"/>
        <path d="M9 13.5c1.6 1.8 4.4 1.8 6 0"/>
      </>
    ),
  },
  {
    id:      'hou-die-vlam',
    event:   'open-hou-die-vlam',
    titel:   'Hou die Vlam',
    beskryf: 'Tik wanneer die vlam in die goue sone is. Hoe langer jy hou, hoe vinniger word dit.',
    merk:    'Speel nou',
    tint:    '#2A2140',
    stroke:  '#E0B872',
    ikoon: (
      <>
        <path d="M12 3c1 2.5 3.5 4 3.5 7.5A3.5 3.5 0 0 1 12 14a3.5 3.5 0 0 1-3.5-3.5C8.5 7 11 5.5 12 3Z"/>
        <path d="M9 17.5c0 1.9 1.34 3.5 3 3.5s3-1.6 3-3.5"/>
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
          /* Die kaart was een groot <button>. 'n Deel-knoppie kan nie binne
             'n knoppie sit nie, dus is die kaart nou 'n houer met twee
             knoppies langs mekaar. */
          <div key={spel.id} className="speel-kaart">
            <button className="speel-kaart-hoof" onClick={() => open(spel)}>
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
            <button
              className="speel-deel"
              onClick={() => deelSpel(spel)}
              aria-label={`Deel ${spel.titel}`}
            >
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
              </svg>
              <span>Deel</span>
            </button>
          </div>
        ))}

        <p className="speel-binnekort">Meer speletjies is op pad.</p>

        <DonationCard />
      </div>
    </div>
  )
}
