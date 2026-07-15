import { useState } from 'react'
import './SaturdayVideoCard.css'

export default function SaturdayVideoCard({ videoId, title, subtitle, onNavigate }) {
  const [amenSaid, setAmenSaid] = useState(false)
  return (
    <div className="saturday-card">
      <span className="saturday-badge">🙏 Videogebed</span>
      <h2 className="saturday-title">{title || 'Naweekgebed vir jou'}</h2>
      {subtitle && <p className="saturday-sub">{subtitle}</p>}
      <div className="saturday-video-wrap">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&playsinline=1`}
          title={title || 'Naweekgebed vir jou'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <p className="saturday-body-text">As hierdie week swaar was, as jou gedagtes moeg is, of as jy net vrede nodig het vir die naweek, luister rustig saam. God is naby.</p>
      <p className="saturday-fallback">Kan die video nie speel nie? Probeer later weer, of plaas jou gebedsversoek op Bid Saam.</p>
      <div className="saturday-actions">
        <button
          className={`saturday-amen-btn${amenSaid ? ' amen-done' : ''}`}
          onClick={() => setAmenSaid(true)}
        >
          {amenSaid ? '🙏 Amen gesê ✓' : '🙏 Amen'}
        </button>
        {onNavigate && (
          <button className="saturday-prayer-btn" onClick={() => onNavigate('bidsaam')}>
            Plaas 'n gebedsversoek
          </button>
        )}
      </div>
    </div>
  )
}
