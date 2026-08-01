/* Die ark bou homself op soos die speler rye voltooi.
   Alles word twee keer geteken: eers dof as buitelyn, dan vol
   binne 'n masker wat van onder af styg. */

const ROMP  = 'M12 60 Q12 84 44 88 L156 88 Q188 84 188 60 Z'
const KAJUIT = 'M50 30 H150 V60 H50 Z'
const DAK   = 'M42 30 L60 14 H140 L158 30 Z'

export default function ArkBou({ vordering = 0, grootte = 'klein' }) {
  const v = Math.max(0, Math.min(1, vordering))
  // Bou van onder (y=88) na bo (y=14)
  const hoogte = 74 * v
  const y = 88 - hoogte

  return (
    <svg viewBox="0 0 200 96" className={`arkbou arkbou-${grootte}`} role="img" aria-label="Die ark">
      <defs>
        <clipPath id="ark-vlak">
          <rect x="0" y={y} width="200" height={hoogte + 1} />
        </clipPath>
        <linearGradient id="ark-hout" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#C08B4E" />
          <stop offset="100%" stopColor="#8A5F31" />
        </linearGradient>
      </defs>

      {/* dof raamwerk */}
      <g fill="none" stroke="rgba(214,196,232,0.20)" strokeWidth="2" strokeLinejoin="round">
        <path d={ROMP} />
        <path d={KAJUIT} />
        <path d={DAK} />
      </g>

      {/* gebou */}
      <g clipPath="url(#ark-vlak)">
        <path d={ROMP}   fill="url(#ark-hout)" />
        <path d={KAJUIT} fill="#A6743E" />
        <path d={DAK}    fill="#7A5128" />

        {/* planke */}
        <g stroke="rgba(60,36,14,0.28)" strokeWidth="1.4" strokeLinecap="round">
          <path d="M18 68 H182M24 76 H176M40 84 H160" />
          <path d="M52 38 H148M52 46 H148M52 54 H148" />
        </g>

        {/* deur en vensters */}
        <rect x="92" y="42" width="16" height="18" rx="2" fill="#5E3E1C" />
        <circle cx="68"  cy="44" r="4" fill="#E4C07A" />
        <circle cx="132" cy="44" r="4" fill="#E4C07A" />

        {/* dakrand */}
        <path d="M42 30 H158" stroke="#5E3E1C" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    </svg>
  )
}
