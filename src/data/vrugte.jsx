/* ────────────────────────────────────────────────────────────
   Vrugtefees — die nege vrugte.

   Elke vrug moet op 'n foon van 36 pixels af uitkenbaar wees, en nie net
   aan sy kleur nie. Iemand wat kleure swak sien moet hulle steeds uitmekaar
   ken. Elkeen kry daarom drie dinge wat verskil:

     · 'n eie silhoeët  (rond, druppel, tros, aar, punt)
     · 'n eie oppervlak (kolle, segmente, strepe, korrels, skoon)
     · 'n eie kroontjie (blaar, steel, twee blare, niks)

   Die vorms is SVG-TEKS, nie JSX nie, want die spel teken hulle op 'n
   canvas. Die React-komponent hieronder gebruik dieselfde teks, sodat daar
   net een weergawe van elke vrug bestaan om reg te hou.

   Die nege stem ooreen met die nege eienskappe, maar die spel preek dit nie
   tydens spel nie. Dit wys in die name van die hoofstukke.
   ──────────────────────────────────────────────────────────── */

const V = [
  {
    id: 'granaat', naam: 'Granaat', eienskap: 'Liefde',
    kleur: '#C2413F', diep: '#8E2A29', lig: '#E27A6A',
    vorm: (k, d, l) => `
      <circle cx="32" cy="35" r="21" fill="${k}"/>
      <path d="M32 14c-6 6-9 12-9 21h18c0-9-3-15-9-21z" fill="${d}" opacity="0.35"/>
      <path d="M32 9l-4 5h8z" fill="#5E7C43"/>
      <path d="M32 14c-2-4-5-5-8-4 1 4 4 5 8 4z" fill="#5E7C43"/>
      <circle cx="26" cy="34" r="3" fill="${l}"/>
      <circle cx="36" cy="31" r="3" fill="${l}"/>
      <circle cx="33" cy="42" r="3" fill="${l}"/>
      <circle cx="24" cy="43" r="2.4" fill="${l}"/>`,
  },
  {
    id: 'lemoen', naam: 'Lemoen', eienskap: 'Vreugde',
    kleur: '#E8963C', diep: '#B06A1E', lig: '#F7C67A',
    vorm: (k, d, l) => `
      <circle cx="32" cy="35" r="21" fill="${k}"/>
      <circle cx="32" cy="35" r="14" fill="${l}" opacity="0.55"/>
      <path d="M32 21v28M18 35h28M22 25l20 20M42 25L22 45" stroke="${d}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="32" cy="35" r="4" fill="${d}"/>
      <path d="M32 14v-4" stroke="#6B4A22" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="38" cy="12" rx="7" ry="4" fill="#5E7C43" transform="rotate(-18 38 12)"/>`,
  },
  {
    id: 'druiwe', naam: 'Druiwe', eienskap: 'Vrede',
    kleur: '#7B5EA8', diep: '#54407A', lig: '#A98CD0',
    vorm: (k, d, l) => `
      <path d="M32 30V16" stroke="#6B4A22" stroke-width="3" stroke-linecap="round"/>
      <path d="M32 17c5-6 11-6 14-2-4 5-10 6-14 2z" fill="#5E7C43"/>
      <circle cx="24" cy="30" r="8" fill="${k}"/>
      <circle cx="40" cy="30" r="8" fill="${k}"/>
      <circle cx="32" cy="38" r="8.5" fill="${k}"/>
      <circle cx="20" cy="43" r="7.5" fill="${d}"/>
      <circle cx="44" cy="43" r="7.5" fill="${d}"/>
      <circle cx="32" cy="51" r="7" fill="${d}"/>
      <circle cx="22" cy="27" r="2.6" fill="${l}"/>
      <circle cx="38" cy="27" r="2.6" fill="${l}"/>`,
  },
  {
    id: 'vy', naam: 'Vy', eienskap: 'Geduld',
    kleur: '#6E4F7C', diep: '#4A3455', lig: '#9C7BAA',
    vorm: (k, d, l) => `
      <path d="M32 55c-11 0-18-8-18-16 0-7 5-12 10-15 3-2 5-5 8-9 3 4 5 7 8 9 5 3 10 8 10 15 0 8-7 16-18 16z" fill="${k}"/>
      <path d="M24 40c4 5 12 5 16 0" stroke="${l}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
      <path d="M27 47c3 3 7 3 10 0" stroke="${l}" stroke-width="2" stroke-linecap="round" fill="none"/>
      <path d="M32 15c-4-5-9-6-13-3 2 5 7 7 13 3z" fill="#5E7C43"/>
      <path d="M32 15c4-5 9-6 13-3-2 5-7 7-13 3z" fill="#4F6B38"/>`,
  },
  {
    id: 'appel', naam: 'Appel', eienskap: 'Vriendelikheid',
    kleur: '#D0524E', diep: '#9B3532', lig: '#F09A8E',
    vorm: (k, d, l) => `
      <path d="M32 20c-4-4-11-4-15 1-5 6-4 17 1 25 3 5 7 9 11 9h6c4 0 8-4 11-9 5-8 6-19 1-25-4-5-11-5-15-1z" fill="${k}"/>
      <path d="M25 27c-2 4-2 9 0 13" stroke="${l}" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M32 20V9" stroke="#6B4A22" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M33 13c5-5 11-4 13 0-4 4-10 4-13 0z" fill="#5E7C43"/>`,
  },
  {
    id: 'olyf', naam: 'Olyf', eienskap: 'Goedheid',
    kleur: '#6B8A4A', diep: '#4A6432', lig: '#9DBA78',
    vorm: (k, d, l) => `
      <path d="M26 25c0-8 6-13 14-14-1 8-6 13-14 14z" fill="#4F6B38"/>
      <path d="M26 25c-4-6-3-12 1-15 3 5 3 11-1 15z" fill="#5E7C43"/>
      <ellipse cx="26" cy="38" rx="10" ry="13" fill="${k}"/>
      <ellipse cx="42" cy="42" rx="8.5" ry="11" fill="${d}"/>
      <ellipse cx="23" cy="33" rx="3" ry="4" fill="${l}"/>
      <circle cx="26" cy="38" r="2.6" fill="${d}"/>`,
  },
  {
    id: 'koring', naam: 'Koring', eienskap: 'Getrouheid',
    kleur: '#D6A93F', diep: '#A07C22', lig: '#F0D488',
    vorm: (k, d, l) => `
      <path d="M32 58V24" stroke="${d}" stroke-width="3" stroke-linecap="round"/>
      ${[0, 1, 2, 3].map(i => `
        <ellipse cx="24" cy="${24 + i * 8}" rx="7" ry="4.4" fill="${k}" transform="rotate(-28 24 ${24 + i * 8})"/>
        <ellipse cx="40" cy="${24 + i * 8}" rx="7" ry="4.4" fill="${d}" transform="rotate(28 40 ${24 + i * 8})"/>`).join('')}
      <ellipse cx="32" cy="15" rx="5" ry="8" fill="${l}"/>`,
  },
  {
    id: 'perske', naam: 'Perske', eienskap: 'Sagmoedigheid',
    kleur: '#E88A72', diep: '#B85D46', lig: '#F8BFA8',
    vorm: (k, d, l) => `
      <circle cx="32" cy="36" r="21" fill="${k}"/>
      <path d="M32 15c-5 6-7 13-7 21s2 15 7 20" stroke="${d}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <ellipse cx="24" cy="28" rx="6" ry="4.5" fill="${l}" transform="rotate(-30 24 28)"/>
      <path d="M32 15V8" stroke="#6B4A22" stroke-width="3" stroke-linecap="round"/>
      <path d="M33 11c6-3 11-1 12 3-5 2-10 1-12-3z" fill="#5E7C43"/>`,
  },
  {
    id: 'amandel', naam: 'Amandel', eienskap: 'Selfbeheersing',
    kleur: '#C9A279', diep: '#96754F', lig: '#E6CBA8',
    vorm: (k, d, l) => `
      <path d="M32 10c9 8 14 18 14 27 0 10-6 17-14 17s-14-7-14-17c0-9 5-19 14-27z" fill="${k}"/>
      <path d="M32 18c5 6 8 13 8 19 0 7-3 12-8 12" stroke="${d}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M26 30c-2 5-2 10 0 14" stroke="${l}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <circle cx="32" cy="46" r="2.4" fill="${d}"/>`,
  },
]

export const VRUGTE = V
export const VRUG_IDS = V.map(v => v.id)

export function vrugNaam(i) { return (V[i] && V[i].naam) || '?' }
export function vrugEienskap(i) { return (V[i] && V[i].eienskap) || '' }

/** Die vrugte in die vorm wat die tekenaar nodig het: klaar SVG-teks. */
export const VRUG_TEKENINGE = V.map(v => ({
  naam: v.naam,
  svg: v.vorm(v.kleur, v.diep, v.lig),
}))

/** Een vrug, vir die menu's. Die spelbord teken op 'n canvas. */
export function Vrug({ soort, grootte = 44, dof = false }) {
  const v = V[soort]
  if (!v) return null
  const k = dof ? '#4A4459' : v.kleur
  const d = dof ? '#3A3547' : v.diep
  const l = dof ? '#5C5670' : v.lig
  return (
    <svg
      width={grootte} height={grootte} viewBox="0 0 64 64"
      role="img" aria-label={v.naam}
      dangerouslySetInnerHTML={{ __html: v.vorm(k, d, l) }}
    />
  )
}
