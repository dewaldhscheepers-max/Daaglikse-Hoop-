/* ────────────────────────────────────────────────────────────
   Vrugtefees — die tuin agter die bord.

   Geen prentlêers nie. Alles hier is geteken, en dit het drie voordele:
   dit kos niks aan lêergrootte nie (die app se voorafgelaaide inhoud is
   reeds 5.6 MB), dit is skerp op enige skerm, en elke hoofstuk kan sy eie
   kleur kry sonder 'n nuwe lêer.

   Dit bly doelbewus sag en wasig. Die bord is waar 'n mens kyk; die tuin is
   die gevoel daaragter. As die agtergrond om aandag meeding, is dit
   verkeerd.
   ──────────────────────────────────────────────────────────── */

/* Elke hoofstuk kry sy eie lig. Die eerste twee is gebou; die res staan
   klaar vir wanneer die res van die reis kom. */
export const TUINE = [
  { naam: 'Liefde',          hemel: ['#1A2138', '#3E2E3C', '#8A4A44'], son: '#E8A06A', heuwel: ['#22303A', '#2C4034', '#35502F'] },
  { naam: 'Vreugde',         hemel: ['#152036', '#33334A', '#8A6A3A'], son: '#F0C070', heuwel: ['#24323C', '#31452F', '#3E5A2E'] },
  { naam: 'Vrede',           hemel: ['#141E33', '#2A3350', '#4A5A78'], son: '#BFD0E8', heuwel: ['#1E2C3A', '#283C42', '#31503E'] },
  { naam: 'Geduld',          hemel: ['#1B1B30', '#3A2E48', '#6A4A66'], son: '#C79ACB', heuwel: ['#242C38', '#2E3C3E', '#3A5238'] },
  { naam: 'Vriendelikheid',  hemel: ['#1E1C2E', '#46303A', '#9A5C48'], son: '#F0A87C', heuwel: ['#26303A', '#324034', '#3D5630'] },
  { naam: 'Goedheid',        hemel: ['#16202C', '#2E3A34', '#6E7A3E'], son: '#D8DC84', heuwel: ['#1E2E30', '#2A4030', '#36562C'] },
  { naam: 'Getrouheid',      hemel: ['#1C1A26', '#3E3630', '#8A7038'], son: '#EFCE7C', heuwel: ['#262C30', '#343E2C', '#44562A'] },
  { naam: 'Sagmoedigheid',   hemel: ['#1A2030', '#343A4E', '#6E7490'], son: '#D6DCEC', heuwel: ['#222E3A', '#2C3E40', '#375238'] },
  { naam: 'Selfbeheersing',  hemel: ['#12182A', '#242E44', '#4A5670'], son: '#AEC0DC', heuwel: ['#1C2632', '#26343A', '#2F4636'] },
]

/* Een boom. Sagte kruin, dun stam. Ons teken hulle klein en dof sodat
   hulle soos 'n boord in die verte lyk. */
function Boom({ x, y, s, kleur, blaar }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity="0.9">
      <path d="M0 0v-13" stroke={kleur} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="0"  cy="-19" r="8.5" fill={blaar} />
      <circle cx="-6" cy="-15" r="6.5" fill={blaar} />
      <circle cx="6"  cy="-15" r="6.5" fill={blaar} />
      <circle cx="0"  cy="-24" r="6"   fill={blaar} opacity="0.85" />
    </g>
  )
}

export default function TuinAgtergrond({ hoofstuk = 0 }) {
  const t = TUINE[hoofstuk % TUINE.length]
  const id = 'tuin' + (hoofstuk % TUINE.length)

  // Bome in twee rye, met 'n vaste patroon sodat dit nie by elke raam spring
  const voorste = [6, 20, 34, 48, 62, 76, 90, 104, 118, 132, 146]
  const agterste = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150]

  return (
    <svg
      className="vf-tuin"
      viewBox="0 0 160 280"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-hemel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={t.hemel[0]} />
          <stop offset="55%"  stopColor={t.hemel[1]} />
          <stop offset="100%" stopColor={t.hemel[2]} />
        </linearGradient>
        <radialGradient id={`${id}-son`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%"   stopColor={t.son} stopOpacity="0.85" />
          <stop offset="45%"  stopColor={t.son} stopOpacity="0.22" />
          <stop offset="100%" stopColor={t.son} stopOpacity="0" />
        </radialGradient>
        {/* Die bord sit in die middel. Ons verdof daar sodat die vrugte
            altyd die helderste ding op die skerm bly. */}
        <radialGradient id={`${id}-verdof`} cx="0.5" cy="0.62" r="0.60">
          <stop offset="0%"   stopColor="#0C1220" stopOpacity="0.62" />
          <stop offset="70%"  stopColor="#0C1220" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#0C1220" stopOpacity="0.55" />
        </radialGradient>
      </defs>

      {/* hemel */}
      <rect width="160" height="280" fill={`url(#${id}-hemel)`} />

      {/* Die bord sit in die middel van die skerm, dus moet die horison HOOG
          wees — anders staan die son en die bome agter die bord waar niemand
          hulle sien nie. */}
      {/* die son laag oor die heuwels */}
      <circle cx="112" cy="88" r="52" fill={`url(#${id}-son)`} />
      <circle cx="112" cy="88" r="8" fill={t.son} opacity="0.6" />

      {/* verste heuwel */}
      <path d="M0 104c26-11 44 4 66-3s40-14 62-6c14 5 24 4 32 0v190H0z" fill={t.heuwel[0]} opacity="0.95" />

      {/* middelste heuwel met die boord */}
      <path d="M0 124c22-8 38 5 58 1s38-12 58-5c18 5 30 4 44 1v164H0z" fill={t.heuwel[1]} />
      <g>
        {agterste.map((x, i) => (
          <Boom key={i} x={x} y={133 + (i % 3)} s={0.44} kleur={t.heuwel[0]} blaar={t.heuwel[0]} />
        ))}
      </g>

      {/* voorste bank met die boord wat 'n mens kan sien */}
      <path d="M0 150c20-7 34 6 54 3s36-10 54-4c16 5 34 4 52 0v134H0z" fill={t.heuwel[2]} />
      <g>
        {voorste.map((x, i) => (
          <Boom key={i} x={x} y={166 + (i % 2) * 3} s={0.62} kleur="#2A3A22" blaar={t.heuwel[1]} />
        ))}
      </g>

      {/* die grond heel voor */}
      <path d="M0 186c24-5 40 4 58 2s40-7 58-3c16 4 30 3 44 1v96H0z" fill="#1C2A1E" />

      {/* verdof waar die bord sit */}
      <rect width="160" height="280" fill={`url(#${id}-verdof)`} />
    </svg>
  )
}
