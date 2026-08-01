/* ────────────────────────────────────────────────────────────
   Oorspronklike diere-illustrasies vir Bou die Ark.

   Een konsekwente styl deur almal heen:
     · 64×64 blokkie, sy-aansig
     · gevulde vorms, geen buitelyne
     · liggaam + kop + pote + een kenmerk
     · elke dier het 'n hoofkleur en 'n donkerder skakering
   Geen emoji. Alles hier is met die hand geteken.
   ──────────────────────────────────────────────────────────── */

const D = {
  duif: {
    naam: 'Duif',
    kleur: '#D8DEE9', diep: '#A8B4C6',
    dele: (k, d) => (
      <>
        <ellipse cx="30" cy="34" rx="17" ry="12" fill={k} />
        <circle cx="45" cy="26" r="8" fill={k} />
        <path d="M52 25l7 2-7 3z" fill="#E3A857" />
        <circle cx="47" cy="24" r="1.6" fill="#3A3A46" />
        <path d="M24 30c6-5 15-4 18 2-5 6-14 7-20 2z" fill={d} />
        <path d="M13 34c-4 2-6 5-5 8 4 1 8-1 10-4z" fill={d} />
        <path d="M28 45l-1 6M35 45l1 6" stroke="#E3A857" strokeWidth="2.4" strokeLinecap="round" />
      </>
    ),
  },
  skaap: {
    naam: 'Skaap',
    kleur: '#F0EBE2', diep: '#CFC6B6',
    dele: (k, d) => (
      <>
        <circle cx="24" cy="32" r="11" fill={k} />
        <circle cx="34" cy="28" r="10" fill={k} />
        <circle cx="34" cy="38" r="10" fill={k} />
        <circle cx="44" cy="33" r="10" fill={k} />
        <ellipse cx="50" cy="27" rx="7" ry="8" fill="#5B5147" />
        <circle cx="52" cy="25" r="1.7" fill="#F0EBE2" />
        <path d="M44 21c-3-3-2-6 1-6M56 21c3-3 2-6-1-6" stroke="#5B5147" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M26 43v7M36 44v6M46 43v7" stroke={d} strokeWidth="3.4" strokeLinecap="round" />
      </>
    ),
  },
  bok: {
    naam: 'Bok',
    kleur: '#C9A227', diep: '#9A7A18',
    dele: (k, d) => (
      <>
        <ellipse cx="28" cy="34" rx="16" ry="10" fill={k} />
        <path d="M42 28l10-3 3 8-9 4z" fill={k} />
        <path d="M50 24c2-6 0-9-3-10M56 24c3-5 3-9 0-11" stroke={d} strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <circle cx="49" cy="28" r="1.6" fill="#3A3A46" />
        <path d="M20 43v8M28 44v7M36 44v7M42 43v8" stroke={d} strokeWidth="3" strokeLinecap="round" />
        <path d="M13 30c-4-1-6 1-5 4" stroke={d} strokeWidth="2.6" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  olifant: {
    naam: 'Olifant',
    kleur: '#9AA0AC', diep: '#71778A',
    dele: (k, d) => (
      <>
        <ellipse cx="27" cy="31" rx="18" ry="14" fill={k} />
        <circle cx="46" cy="29" r="11" fill={k} />
        <ellipse cx="42" cy="27" rx="8" ry="9" fill={d} />
        <path d="M54 32c3 5 2 11-2 14-2 1-4 0-3-2 3-3 3-8 1-11z" fill={k} />
        <circle cx="50" cy="26" r="1.7" fill="#3A3A46" />
        <path d="M16 44v8M26 45v7M36 45v7M44 44v8" stroke={d} strokeWidth="4" strokeLinecap="round" />
        <path d="M10 28c-4 0-5 3-3 5" stroke={d} strokeWidth="2.6" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  kameel: {
    naam: 'Kameel',
    kleur: '#D2A265', diep: '#A67B43',
    dele: (k, d) => (
      <>
        <ellipse cx="28" cy="35" rx="17" ry="10" fill={k} />
        <path d="M18 30c2-8 8-8 10 0zM32 29c2-9 9-9 11 0z" fill={d} />
        <path d="M44 33c1-8 3-12 7-13l3 3c-3 2-4 6-4 11z" fill={k} />
        <ellipse cx="53" cy="19" rx="6" ry="5" fill={k} />
        <circle cx="55" cy="17" r="1.5" fill="#3A3A46" />
        <path d="M18 44v9M27 45v8M36 45v8M42 44v9" stroke={d} strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  perd: {
    naam: 'Perd',
    kleur: '#8A5A3B', diep: '#63402A',
    dele: (k, d) => (
      <>
        <ellipse cx="27" cy="33" rx="17" ry="11" fill={k} />
        <path d="M40 30l8-11 6 3-6 11z" fill={k} />
        <path d="M50 17l2-6 3 5z" fill={d} />
        <circle cx="49" cy="22" r="1.6" fill="#2A2A34" />
        <path d="M40 26c3-6 7-9 10-10" stroke={d} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M17 43v10M26 44v9M35 44v9M41 43v10" stroke={d} strokeWidth="3" strokeLinecap="round" />
        <path d="M11 28c-5 2-6 8-3 12" stroke={d} strokeWidth="3" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  leeu: {
    naam: 'Leeu',
    kleur: '#D9A441', diep: '#A87B22',
    dele: (k, d) => (
      <>
        <ellipse cx="25" cy="35" rx="16" ry="10" fill={k} />
        <circle cx="45" cy="28" r="13" fill={d} />
        <circle cx="45" cy="28" r="8.5" fill={k} />
        <circle cx="42" cy="26" r="1.6" fill="#3A3A46" />
        <circle cx="48" cy="26" r="1.6" fill="#3A3A46" />
        <path d="M43 31h4" stroke="#8A5A22" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M16 43v9M25 44v8M34 44v8" stroke={d} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M10 31c-5 0-7 5-4 8" stroke={d} strokeWidth="2.8" strokeLinecap="round" fill="none" />
        <circle cx="7" cy="41" r="3" fill={d} />
      </>
    ),
  },
  sebra: {
    naam: 'Sebra',
    kleur: '#EFEFEF', diep: '#33333C',
    dele: (k, d) => (
      <>
        <ellipse cx="27" cy="33" rx="17" ry="11" fill={k} />
        <path d="M20 23v20M27 22v22M34 23v20" stroke={d} strokeWidth="3" strokeLinecap="round" />
        <path d="M40 30l8-11 6 3-6 11z" fill={k} />
        <path d="M44 24l6-4" stroke={d} strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="49" cy="22" r="1.6" fill="#2A2A34" />
        <path d="M50 17l2-6 3 5z" fill={d} />
        <path d="M17 43v10M26 44v9M35 44v9M41 43v10" stroke={d} strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  giraf: {
    naam: 'Giraf',
    kleur: '#E0B562', diep: '#A9762C',
    dele: (k, d) => (
      <>
        <ellipse cx="24" cy="40" rx="14" ry="9" fill={k} />
        <path d="M36 42c0-16 4-24 10-27l4 4c-5 3-7 11-7 23z" fill={k} />
        <ellipse cx="50" cy="15" rx="7" ry="5.5" fill={k} />
        <circle cx="52" cy="13" r="1.5" fill="#3A3A46" />
        <path d="M47 10l-1-4M54 10l1-4" stroke={d} strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="20" cy="38" r="2.6" fill={d} />
        <circle cx="28" cy="42" r="2.4" fill={d} />
        <circle cx="41" cy="30" r="2.2" fill={d} />
        <circle cx="44" cy="20" r="2" fill={d} />
        <path d="M15 48v7M23 49v6M31 48v7" stroke={d} strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  beer: {
    naam: 'Beer',
    kleur: '#8B6B4F', diep: '#5F4632',
    dele: (k, d) => (
      <>
        <ellipse cx="27" cy="35" rx="18" ry="13" fill={k} />
        <circle cx="46" cy="27" r="11" fill={k} />
        <circle cx="41" cy="18" r="4.5" fill={d} />
        <circle cx="52" cy="18" r="4.5" fill={d} />
        <ellipse cx="52" cy="30" rx="5" ry="4" fill={d} />
        <circle cx="53" cy="29" r="1.6" fill="#2A2A34" />
        <circle cx="43" cy="25" r="1.6" fill="#2A2A34" />
        <path d="M17 46v7M27 47v6M37 46v7" stroke={d} strokeWidth="4" strokeLinecap="round" />
      </>
    ),
  },
  haas: {
    naam: 'Haas',
    kleur: '#C6BCAE', diep: '#948A7C',
    dele: (k, d) => (
      <>
        <ellipse cx="28" cy="38" rx="15" ry="11" fill={k} />
        <circle cx="44" cy="31" r="9" fill={k} />
        <path d="M42 22c-2-9 0-13 3-13s4 5 2 13zM50 23c0-9 3-12 5-11s2 6-1 13z" fill={k} />
        <path d="M43 15c-1-5 0-7 1-7M52 16c0-5 1-7 2-6" stroke={d} strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="48" cy="29" r="1.6" fill="#3A3A46" />
        <circle cx="15" cy="35" r="5" fill={d} />
        <path d="M22 48v5M31 48v5M39 47v6" stroke={d} strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  vos: {
    naam: 'Vos',
    kleur: '#D07A3C', diep: '#9C5324',
    dele: (k, d) => (
      <>
        <ellipse cx="28" cy="36" rx="16" ry="10" fill={k} />
        <path d="M42 32l10-4 4 6-10 5z" fill={k} />
        <path d="M56 34l4 1-4 3z" fill="#3A3A46" />
        <path d="M43 26l-2-8 8 4zM51 24l3-8 4 7z" fill={d} />
        <circle cx="49" cy="31" r="1.6" fill="#2A2A34" />
        <path d="M13 34c-6-2-9 3-7 8 3 3 8 1 9-3z" fill={d} />
        <path d="M8 39c-3 0-4 2-3 4" stroke={k} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M21 45v7M30 46v6M38 45v7" stroke={d} strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
}

export const DIERE = D

export function dierNaam(id) {
  return (D[id] && D[id].naam) || id
}

/** Een dier. `paar` teken die tweede een agter met 'n effense verskuiwing. */
export function Dier({ id, grootte = 64, paar = false, dof = false }) {
  const d = D[id]
  if (!d) return null
  const kleur = dof ? '#4A4459' : d.kleur
  const diep  = dof ? '#3A3547' : d.diep

  return (
    <svg width={grootte} height={grootte} viewBox="0 0 64 64" aria-label={d.naam} role="img">
      {paar && (
        <g transform="translate(-9 4) scale(0.82)" opacity={dof ? 0.5 : 0.62}>
          {d.dele(kleur, diep)}
        </g>
      )}
      <g>{d.dele(kleur, diep)}</g>
    </svg>
  )
}
