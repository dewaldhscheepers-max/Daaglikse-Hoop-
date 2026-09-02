/* Die sonsopkoms op die kaart — GETEKEN, nie 'n foto nie.
 *
 * Dewald: "I don't like it to just be plain black... I wanted it to look more
 * like this", met 'n voorbeeld waar 'n warm son oor heuwels regs op die kaart
 * uitkom.
 *
 * ── Waarom dit 'n SVG is en nie 'n prent nie ──
 *
 *   · dit is 'n paar honderd grepe in die bondel, nie 'n aflaai nie. Hierdie
 *     kaart staan op Luister, waar die oggendkennisgewing elke dag duisende
 *     fone laat land — 'n ekstra prentversoek daar is duisende versoeke;
 *   · dit skaal presies op elke skerm, van 'n klein foon tot 'n tablet;
 *   · 'n groot `<img>` is die grootste tekstuur op 'n blad en Chrome gee dit
 *     maklik sy eie saamgestelde laag. Dit is presies waar die gekleurde
 *     strepe op Android vandaan gekom het (sien CLAUDE.md). 'n SVG verf in
 *     die kaart se eie laag;
 *   · dit dra geen woorde nie, en kan dus nooit met die teks langsaan veg
 *     soos die wallpaper op die klaar-skerm gedoen het.
 *
 * Die id's dra 'n vaste voorvoegsel. 'n SVG-verloop met 'n kaal id soos
 * "son" bots met enige ander SVG op dieselfde bladsy, en dan verf die
 * verkeerde een — 'n fout wat baie stil is.
 */
export default function TydMetGodSon({ klas = 'tmg-kaart-toneel' }) {
  return (
    <svg className={klas} viewBox="0 0 300 200" fill="none"
         preserveAspectRatio="xMaxYMax slice" aria-hidden="true">
      <defs>
        {/* Die gloed rondom die son. */}
        <radialGradient id="tmgk-gloed" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#FFD9A0" stopOpacity="0.85" />
          <stop offset="45%"  stopColor="#E8A94F" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#E8A94F" stopOpacity="0" />
        </radialGradient>

        {/* Die son self. */}
        <radialGradient id="tmgk-son" cx="50%" cy="55%" r="55%">
          <stop offset="0%"   stopColor="#FFF0CE" />
          <stop offset="55%"  stopColor="#FFC96B" />
          <stop offset="100%" stopColor="#F0A83E" />
        </radialGradient>

        {/* Die hemel agter die heuwels. */}
        <linearGradient id="tmgk-lug" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#2A1F18" stopOpacity="0" />
          <stop offset="60%"  stopColor="#7A4E22" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#C9873A" stopOpacity="0.55" />
        </linearGradient>

        <linearGradient id="tmgk-heuwel-agter" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#3A2A1C" />
          <stop offset="100%" stopColor="#241A12" />
        </linearGradient>

        <linearGradient id="tmgk-heuwel-voor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#241A12" />
          <stop offset="100%" stopColor="#15100B" />
        </linearGradient>
      </defs>

      {/* Die lug */}
      <rect x="0" y="0" width="300" height="200" fill="url(#tmgk-lug)" />

      {/* Die gloed, en dan die son daarin */}
      <circle cx="196" cy="128" r="92" fill="url(#tmgk-gloed)" />
      <circle cx="196" cy="128" r="30" fill="url(#tmgk-son)" />

      {/* Die strale. Dun, ongelyk lank, en hulle raak nie aan die son nie —
          dit is wat dit soos LIG laat lyk in plaas van 'n wiel. */}
      <g stroke="#F5C271" strokeWidth="2" strokeLinecap="round" opacity="0.5">
        <path d="M196 76v-22M196 180v14" />
        <path d="M154 86l-13-17M238 86l13-17" />
        <path d="M136 128h-22M256 128h22" />
        <path d="M152 168l-14 14M240 168l14 14" />
      </g>
      <g stroke="#F5C271" strokeWidth="1.4" strokeLinecap="round" opacity="0.30">
        <path d="M174 82l-7-19M218 82l7-19" />
        <path d="M142 108l-20-8M250 108l20-8" />
        <path d="M142 150l-20 9M250 150l20 9" />
      </g>

      {/* Twee voëls — klein, en nie simmetries nie. */}
      <g stroke="#1B140E" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.75">
        <path d="M112 74c4-5 8-5 11 0M123 74c4-5 8-5 11 0" />
        <path d="M144 58c3-3.6 6-3.6 8 0M152 58c3-3.6 6-3.6 8 0" />
      </g>

      {/* Die heuwels. Twee lae, sodat daar diepte is. */}
      <path d="M0 152c46-30 92-30 140-4 44 24 92 26 160-8v60H0z"
            fill="url(#tmgk-heuwel-agter)" />
      <path d="M0 176c56-24 104-20 150 2 40 19 88 20 150-6v28H0z"
            fill="url(#tmgk-heuwel-voor)" />
    </svg>
  )
}
