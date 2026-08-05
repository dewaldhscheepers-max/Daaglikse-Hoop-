export default function BottomNav({ active, onChange, onBybel }) {
  const tabs = [
    {
      id: 'luister',
      label: 'Luister',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
          <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
        </svg>
      )
    },
    {
      id: 'bidsaam',
      label: 'Bid Saam',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="3" x2="12" y2="21"/>
          <line x1="5" y1="8" x2="19" y2="8"/>
        </svg>
      )
    },
    {
      /* Sorg vat Bid Nou se plek in die balk. Bid Nou is nie weg nie — hy sit
         nou 'n kaart hoog op Bid Saam, en die bidnou-navigate-gebeurtenis
         bring 'n mens steeds daarheen. Ses oortjies sou op 'n klein foon
         begin knyp. */
      id: 'sorg',
      label: 'Sorg',
      icon: (
        /* 'n Hand wat 'n hart dra. Nie 'n hart alleen nie — die punt is dat
           iemand dit vir jou vashou. */
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8.6c-.9-1.3-2.7-1.7-3.9-.6-1.2 1.1-1.2 2.9-.1 4L12 16l4-4c1.1-1.1 1.1-2.9-.1-4-1.2-1.1-3-.7-3.9.6z"/>
          <path d="M3 14.5c1.6 0 2.4.6 3.3 1.4l2 1.8c.5.5 1.2.8 1.9.8h3.6c1 0 1.9-.5 2.5-1.3l2.6-3.4"/>
          <path d="M3 14.5V21"/>
        </svg>
      )
    },
    {
      id: 'meer',
      label: 'E-boeke',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      )
    },
    {
      id: 'speel',
      label: 'Speel',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2.5" y="6" width="19" height="12" rx="4"/>
          <path d="M7 10.5v3M5.5 12h3"/>
          <circle cx="16" cy="11" r="1"/>
          <circle cx="18" cy="13.5" r="1"/>
        </svg>
      )
    },
  ]

  return (
    <nav className="bottom-nav">
      {/* Bybel — sweef links bo die balk, altyd sigbaar */}
      <button className="nav-bybel" onClick={onBybel} aria-label="Bybel">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 6.5C10.5 5.2 8.4 4.6 6 4.6c-.9 0-1.7.1-2.5.3v12.4c.8-.2 1.6-.3 2.5-.3 2.4 0 4.5.6 6 1.9"/>
          <path d="M12 6.5c1.5-1.3 3.6-1.9 6-1.9.9 0 1.7.1 2.5.3v12.4c-.8-.2-1.6-.3-2.5-.3-2.4 0-4.5.6-6 1.9"/>
          <path d="M12 6.5v12.4"/>
        </svg>
        <span>BYBEL</span>
      </button>

      {tabs.map(t => (
        <button
          key={t.id}
          className={`nav-tab${t.id === 'sorg' ? ' nav-tab-sorg' : ''}${active === t.id ? ' active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </nav>
  )
}
