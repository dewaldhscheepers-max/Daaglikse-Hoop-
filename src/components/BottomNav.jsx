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
      id: 'vredepad',
      label: 'Vredepad',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
        </svg>
      )
    },
    {
      id: 'bidnou',
      label: 'Bid Nou',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/>
          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
          <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
        </svg>
      )
    }
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
          className={`nav-tab${t.id === 'bidnou' ? ' nav-tab-bidnou' : ''}${active === t.id ? ' active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </nav>
  )
}
