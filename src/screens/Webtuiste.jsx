import './Webtuiste.css'

const links = [
  {
    title: 'E-boeke',
    desc: 'Lees my e-boeke.',
    url: 'https://dewaldscheepers.com/e-boeke',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    )
  },
  {
    title: 'Nooi My Om Te Preek',
    desc: 'Vra my om by jou gemeente of geleentheid te kom praat.',
    url: 'https://dewaldscheepers.com/preek',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    )
  },
  {
    title: "Maak 'n Skenking",
    desc: 'Ondersteun die bediening van Daaglikse Hoop.',
    url: 'https://dewaldscheepers.com/skenking',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    )
  }
]

export default function Webtuiste() {
  return (
    <div className="webtuiste">
      <div className="screen-header">
        <h1>Besoek Webtuiste</h1>
        <p>Meer inhoud, boeke en kontak</p>
      </div>

      <div className="webtuiste-body">
        {/* Welcome card */}
        <div className="card welcome-card">
          <div className="welcome-logo">DH</div>
          <h2>Dewald Scheepers</h2>
          <p>Besoek die amptelike webtuiste vir preke, e-boeke, en meer.</p>
          <a href="https://dewaldscheepers.com" target="_blank" rel="noopener noreferrer">
            <button className="btn-dark open-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Open webtuiste
            </button>
          </a>
        </div>

        {/* Link cards */}
        <div className="link-cards">
          {links.map(link => (
            <a
              key={link.title}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-card"
            >
              <div className="link-icon">{link.icon}</div>
              <div className="link-text">
                <span className="link-title">{link.title}</span>
                <span className="link-desc">{link.desc}</span>
              </div>
              <svg className="link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
