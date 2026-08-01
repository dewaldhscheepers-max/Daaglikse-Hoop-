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

  /* ── Groep 2: die diere van die veld ── */
  bees: {
    naam: 'Bees',
    kleur: '#E8E2D6', diep: '#B9AE9C',
    dele: (k, d) => (
      <>
        <ellipse cx="30" cy="34" rx="19" ry="12" fill={k} />
        <path d="M14 28c7-3 13-2 16 3-4 5-11 6-17 3z" fill="#6B5B4A" />
        <path d="M34 40c6-2 11-1 13 3-4 4-10 4-15 1z" fill="#6B5B4A" />
        <ellipse cx="49" cy="26" rx="9" ry="8" fill={k} />
        <ellipse cx="55" cy="29" rx="4" ry="3.4" fill="#C99AA0" />
        <circle cx="51" cy="23" r="1.7" fill="#3A3128" />
        <path d="M42 19c-3-4-1-7 2-6M56 19c3-4 1-7-2-6" stroke="#8A7B66" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M20 45v8M29 46v7M38 45v8" stroke={d} strokeWidth="3.4" strokeLinecap="round" />
        <path d="M12 30c-4 4-5 9-3 13" stroke={d} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  os: {
    naam: 'Os',
    kleur: '#A9906F', diep: '#7D6A4E',
    dele: (k, d) => (
      <>
        <ellipse cx="29" cy="34" rx="19" ry="12.5" fill={k} />
        <path d="M18 24h22v5H18z" fill="#7A5C33" />
        <ellipse cx="49" cy="27" rx="9" ry="8" fill={k} />
        <ellipse cx="55" cy="30" rx="4" ry="3.2" fill="#5E4E3A" />
        <circle cx="51" cy="24" r="1.7" fill="#2E2519" />
        <path d="M41 20c-5-3-4-8 0-8M57 20c5-3 4-8 0-8" stroke="#EFE7D6" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M19 45v8M28 46v7M37 45v8" stroke={d} strokeWidth="3.6" strokeLinecap="round" />
      </>
    ),
  },
  donkie: {
    naam: 'Donkie',
    kleur: '#9A9AA4', diep: '#71717C',
    dele: (k, d) => (
      <>
        <ellipse cx="29" cy="35" rx="18" ry="11" fill={k} />
        <path d="M44 30l6-10 5 2-4 10z" fill={k} />
        <ellipse cx="52" cy="27" rx="7" ry="6.5" fill={k} />
        <ellipse cx="57" cy="30" rx="3.4" ry="2.8" fill="#54545E" />
        <circle cx="54" cy="24" r="1.6" fill="#2C2C34" />
        <path d="M47 17c-1-6 1-8 3-7 1 1 1 5-1 8zM55 17c1-6 3-7 4-5 1 2-1 6-3 8z" fill={d} />
        <path d="M19 44v8M27 45v7M35 44v8" stroke={d} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M12 32c-4 3-5 8-3 12" stroke={d} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  muil: {
    naam: 'Muil',
    kleur: '#8C7A66', diep: '#665847',
    dele: (k, d) => (
      <>
        <ellipse cx="29" cy="35" rx="18" ry="11.5" fill={k} />
        <path d="M44 29l7-11 5 3-5 11z" fill={k} />
        <ellipse cx="53" cy="26" rx="7" ry="6.5" fill={k} />
        <circle cx="55" cy="23" r="1.6" fill="#2A231C" />
        <path d="M48 16c-1-6 1-8 3-7 1 2 1 5-1 8z" fill={d} />
        <path d="M20 44v8M28 45v7M36 44v8" stroke={d} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M11 31c-4 4-4 9-2 13" stroke={d} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  ram: {
    naam: 'Ram',
    kleur: '#EFE8DA', diep: '#C6BCA8',
    dele: (k, d) => (
      <>
        <circle cx="25" cy="34" r="12" fill={k} />
        <circle cx="36" cy="31" r="11" fill={k} />
        <circle cx="35" cy="41" r="10" fill={k} />
        <ellipse cx="49" cy="30" rx="8" ry="8.5" fill="#6A5B4C" />
        <circle cx="52" cy="28" r="1.7" fill="#EFE8DA" />
        <path d="M43 25c-7 0-10-5-6-9 4-3 8 0 7 5" fill="none" stroke="#A08E72" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M56 25c7 0 10-5 6-9-4-3-8 0-7 5" fill="none" stroke="#A08E72" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M24 45v7M33 46v6M42 45v7" stroke={d} strokeWidth="3.4" strokeLinecap="round" />
      </>
    ),
  },
  kalf: {
    naam: 'Kalf',
    kleur: '#F0E6D2', diep: '#C3B49A',
    dele: (k, d) => (
      <>
        <ellipse cx="29" cy="37" rx="15" ry="10" fill={k} />
        <path d="M17 32c5-2 10-1 12 3-3 4-9 4-14 2z" fill="#7A6650" />
        <ellipse cx="45" cy="30" rx="8" ry="7.5" fill={k} />
        <ellipse cx="50" cy="33" rx="3.6" ry="3" fill="#C99AA0" />
        <circle cx="47" cy="27" r="1.6" fill="#372E24" />
        <path d="M39 23c-2-3 0-5 2-4M51 23c2-3 4-4 4-2" stroke="#8A7B66" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M21 46v6M29 47v5M37 46v6" stroke={d} strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  vark: {
    naam: 'Vark',
    kleur: '#E8B7B7', diep: '#C08E8E',
    dele: (k, d) => (
      <>
        <ellipse cx="30" cy="36" rx="19" ry="12" fill={k} />
        <ellipse cx="48" cy="32" rx="9" ry="8" fill={k} />
        <ellipse cx="56" cy="34" rx="5" ry="4" fill="#C98C8C" />
        <circle cx="55" cy="33" r="1.1" fill="#7A4E4E" />
        <circle cx="57.6" cy="33" r="1.1" fill="#7A4E4E" />
        <circle cx="49" cy="29" r="1.6" fill="#5C3838" />
        <path d="M42 25c-2-4 1-6 4-4 2 1 2 4 0 5zM53 24c1-4 4-5 5-2 1 2-1 5-3 5z" fill={d} />
        <path d="M21 46v6M30 47v5M39 46v6" stroke={d} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M11 34c-4 1-5 4-3 6" stroke={d} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  hond: {
    naam: 'Hond',
    kleur: '#C99A63', diep: '#9C7448',
    dele: (k, d) => (
      <>
        <ellipse cx="28" cy="36" rx="16" ry="10.5" fill={k} />
        <ellipse cx="46" cy="30" rx="9" ry="8" fill={k} />
        <ellipse cx="54" cy="33" rx="4.5" ry="3.4" fill={k} />
        <circle cx="57" cy="32" r="1.8" fill="#3A2A1A" />
        <circle cx="48" cy="28" r="1.7" fill="#3A2A1A" />
        <path d="M39 23c-2-6 1-8 4-6 2 2 2 6 0 8z" fill={d} />
        <path d="M20 45v7M28 46v6M36 45v7" stroke={d} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M13 32c-5-2-7 2-4 5" stroke={d} strokeWidth="2.8" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  kraai: {
    naam: 'Kraai',
    kleur: '#3E3E4A', diep: '#26262F',
    dele: (k, d) => (
      <>
        <ellipse cx="29" cy="34" rx="17" ry="11.5" fill={k} />
        <circle cx="45" cy="26" r="8" fill={k} />
        <path d="M52 25l9 2-9 3.5z" fill="#8C8C96" />
        <circle cx="47" cy="24" r="1.6" fill="#C9C9D2" />
        <path d="M23 30c7-5 16-4 19 3-6 6-15 7-21 2z" fill={d} />
        <path d="M12 33c-5 2-7 5-6 9 5 1 9-2 11-5z" fill={d} />
        <path d="M27 45l-1 6M34 45l1 6" stroke="#8C8C96" strokeWidth="2.4" strokeLinecap="round" />
      </>
    ),
  },
  arend: {
    naam: 'Arend',
    kleur: '#7A6248', diep: '#57452F',
    dele: (k, d) => (
      <>
        <ellipse cx="30" cy="36" rx="16" ry="11" fill={k} />
        <circle cx="45" cy="25" r="8.5" fill="#F0EDE6" />
        <path d="M52 23l9 3-9 4z" fill="#E3A857" />
        <circle cx="47" cy="22" r="1.7" fill="#2E2519" />
        <path d="M40 20c3-3 8-2 9 1" stroke="#CFCABF" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M20 28c9-6 20-4 24 4-8 7-19 8-27 2z" fill={d} />
        <path d="M9 34c-5 3-7 7-5 11 6 0 10-3 12-7z" fill={d} />
        <path d="M28 46l-1 6M36 46l1 6" stroke="#E3A857" strokeWidth="2.6" strokeLinecap="round" />
      </>
    ),
  },
  mossie: {
    naam: 'Mossie',
    kleur: '#B49A78', diep: '#8A7255',
    dele: (k, d) => (
      <>
        <ellipse cx="31" cy="36" rx="12" ry="10" fill={k} />
        <circle cx="42" cy="29" r="7" fill={k} />
        <path d="M48 28l6 2-6 2.5z" fill="#4A4034" />
        <circle cx="44" cy="27" r="1.4" fill="#2E271E" />
        <path d="M26 33c5-4 11-3 13 2-4 4-10 5-15 1z" fill={d} />
        <path d="M20 38c-4 1-6 4-5 7 4 0 7-2 8-4z" fill={d} />
        <path d="M29 45l-1 5M35 45l1 5" stroke="#8A7255" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  volstruis: {
    naam: 'Volstruis',
    kleur: '#4A4038', diep: '#332C26',
    dele: (k, d) => (
      <>
        <ellipse cx="26" cy="36" rx="15" ry="13" fill={k} />
        <path d="M36 28c4-8 6-14 8-18" stroke="#C9B79A" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <circle cx="46" cy="9" r="5.5" fill="#C9B79A" />
        <path d="M51 8l5 1.5-5 2z" fill="#E3A857" />
        <circle cx="47" cy="7.5" r="1.3" fill="#2E271E" />
        <path d="M14 32c-5 2-6 7-3 10" stroke={d} strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M23 48v9M31 48v9" stroke="#C9B79A" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },

  /* ── Groep 3: die wilde diere ── */
  wolf: {
    naam: 'Wolf',
    kleur: '#8A8E96', diep: '#63666D',
    dele: (k, d) => (
      <>
        <ellipse cx="28" cy="35" rx="17" ry="10.5" fill={k} />
        <path d="M40 28l10-4 6 5-8 6z" fill={k} />
        <path d="M54 30l7 2-7 3z" fill={d} />
        <circle cx="50" cy="28" r="1.6" fill="#2A2D33" />
        <path d="M42 22c-1-6 2-7 5-4 2 2 1 5-1 6zM50 20c1-6 4-6 6-3 1 2-1 5-3 6z" fill={d} />
        <path d="M19 44v8M27 45v7M35 44v8" stroke={d} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M12 31c-6 0-8 5-4 8" stroke={d} strokeWidth="2.8" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  luiperd: {
    naam: 'Luiperd',
    kleur: '#E0B45E', diep: '#B58C3C',
    dele: (k, d) => (
      <>
        <ellipse cx="28" cy="35" rx="18" ry="10.5" fill={k} />
        <ellipse cx="47" cy="30" rx="9" ry="8" fill={k} />
        <circle cx="52" cy="28" r="1.7" fill="#3A2E12" />
        <path d="M40 23c-2-4 1-5 3-3M53 22c2-4 5-4 5-1" stroke={d} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <circle cx="22" cy="32" r="2.2" fill="#4A3A16" />
        <circle cx="30" cy="37" r="2.2" fill="#4A3A16" />
        <circle cx="36" cy="31" r="2" fill="#4A3A16" />
        <circle cx="24" cy="41" r="1.9" fill="#4A3A16" />
        <path d="M19 44v8M28 45v7M36 44v8" stroke={d} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M11 31c-6 1-7 6-3 8" stroke={d} strokeWidth="2.6" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  slang: {
    naam: 'Slang',
    kleur: '#6E9E5E', diep: '#4E7541',
    dele: (k, d) => (
      <>
        <path d="M10 46c8 0 8-8 16-8s8 8 16 8" fill="none" stroke={k} strokeWidth="8" strokeLinecap="round" />
        <path d="M42 46c6 0 9-4 9-9s-4-8-9-7" fill="none" stroke={k} strokeWidth="8" strokeLinecap="round" />
        <ellipse cx="44" cy="26" rx="8" ry="6" fill={k} />
        <circle cx="48" cy="24" r="1.6" fill="#26301F" />
        <path d="M52 27l7 2-7 1z" fill="#C4534E" />
        <path d="M16 44c3-3 7-3 10 0M30 42c3-3 7-3 10 0" stroke={d} strokeWidth="2" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  krokodil: {
    naam: 'Krokodil',
    kleur: '#5E7A52', diep: '#425939',
    dele: (k, d) => (
      <>
        <ellipse cx="28" cy="40" rx="20" ry="8" fill={k} />
        <path d="M44 36h16v6H44z" fill={k} />
        <path d="M44 42h15l-2 3H45z" fill={d} />
        <circle cx="47" cy="35" r="2" fill="#E8E0C4" />
        <circle cx="47" cy="35" r="0.9" fill="#26301F" />
        <path d="M46 41l2 2M50 41l2 2M54 41l2 2" stroke="#E8E0C4" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M14 36l3-4 3 4M22 35l3-4 3 4M30 35l3-4 3 4" fill={d} />
        <path d="M18 47v5M28 48v4M37 47v5" stroke={d} strokeWidth="3" strokeLinecap="round" />
        <path d="M9 40c-5 1-6 4-4 6" stroke={d} strokeWidth="3" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  skilpad: {
    naam: 'Skilpad',
    kleur: '#8A7A4E', diep: '#63583A',
    dele: (k, d) => (
      <>
        <path d="M14 40a17 12 0 0 1 34 0z" fill={d} />
        <path d="M18 40a13 9 0 0 1 26 0z" fill={k} />
        <path d="M31 31v9M24 34l3 6M38 34l-3 6" stroke={d} strokeWidth="1.8" strokeLinecap="round" />
        <ellipse cx="52" cy="38" rx="6.5" ry="5" fill="#A89A6E" />
        <circle cx="55" cy="36" r="1.4" fill="#2E2719" />
        <path d="M19 41v6M28 42v5M38 42v5M46 41v6" stroke="#A89A6E" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  muis: {
    naam: 'Muis',
    kleur: '#A8A2A8', diep: '#7D787D',
    dele: (k, d) => (
      <>
        <ellipse cx="28" cy="40" rx="14" ry="9" fill={k} />
        <ellipse cx="43" cy="37" rx="7.5" ry="6.5" fill={k} />
        <circle cx="49" cy="36" r="1.5" fill="#2C2A2C" />
        <path d="M50 39l5 1-5 1z" fill="#C9A0A8" />
        <circle cx="38" cy="29" r="6" fill={d} />
        <circle cx="38" cy="29" r="3.4" fill="#C9A0A8" />
        <path d="M14 40c-6-2-9 2-6 5" stroke={d} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M22 48v4M31 48v4" stroke={d} strokeWidth="2.6" strokeLinecap="round" />
      </>
    ),
  },
  sprinkaan: {
    naam: 'Sprinkaan',
    kleur: '#8AA24E', diep: '#63783A',
    dele: (k, d) => (
      <>
        <ellipse cx="28" cy="38" rx="16" ry="7" fill={k} />
        <ellipse cx="45" cy="34" rx="8" ry="6" fill={k} />
        <circle cx="49" cy="32" r="1.6" fill="#2A3315" />
        <path d="M50 29c4-4 7-5 8-3M50 31c4-2 8-2 9 0" stroke={d} strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M20 33c8-4 16-3 20 2-7 4-16 4-22 1z" fill={d} />
        <path d="M24 43l-4 8 7-2" fill="none" stroke={d} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M34 43l-3 7 6-1" fill="none" stroke={d} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  kwartel: {
    naam: 'Kwartel',
    kleur: '#B08A5E', diep: '#856847',
    dele: (k, d) => (
      <>
        <ellipse cx="29" cy="38" rx="14" ry="11" fill={k} />
        <circle cx="42" cy="30" r="7" fill={k} />
        <path d="M48 29l6 2-6 2z" fill="#3F3427" />
        <circle cx="44" cy="28" r="1.4" fill="#2A2219" />
        <path d="M41 23c-1-5 2-6 4-4 1 2 0 4-2 5z" fill={d} />
        <path d="M23 35c5-4 12-3 15 2-5 4-12 5-18 1z" fill={d} />
        <path d="M27 48l-1 5M34 48l1 5" stroke="#7A6244" strokeWidth="2.2" strokeLinecap="round" />
      </>
    ),
  },
  vis: {
    naam: 'Vis',
    kleur: '#5E8CA8', diep: '#436779',
    dele: (k, d) => (
      <>
        <ellipse cx="31" cy="34" rx="19" ry="11" fill={k} />
        <path d="M12 34l-8-8v16z" fill={d} />
        <path d="M30 23c4-6 9-6 11-2-4 3-8 4-11 2z" fill={d} />
        <path d="M30 45c4 6 9 6 11 2-4-3-8-4-11-2z" fill={d} />
        <circle cx="45" cy="31" r="2.4" fill="#F0EDE6" />
        <circle cx="45.6" cy="31" r="1.2" fill="#26333A" />
        <path d="M38 28c3 4 3 8 0 12" stroke={d} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  aap: {
    naam: 'Aap',
    kleur: '#8A6E52', diep: '#63503A',
    dele: (k, d) => (
      <>
        {/* stert eerste, agter alles */}
        <path d="M17 42c-9 2-12 9-8 14 3 4 8 3 9-1" fill="none" stroke={d} strokeWidth="3.4" strokeLinecap="round" />
        <ellipse cx="27" cy="40" rx="13" ry="11" fill={k} />
        {/* ore opsy van die kop, nie bo-op nie */}
        <circle cx="33" cy="26" r="4.2" fill={d} />
        <circle cx="49" cy="26" r="4.2" fill={d} />
        <circle cx="33" cy="26" r="2.2" fill="#C9A487" />
        <circle cx="49" cy="26" r="2.2" fill="#C9A487" />
        <circle cx="41" cy="26" r="9" fill={k} />
        <ellipse cx="41" cy="29" rx="6.4" ry="6" fill="#D9B999" />
        <circle cx="38.2" cy="25" r="1.5" fill="#2E2419" />
        <circle cx="43.8" cy="25" r="1.5" fill="#2E2419" />
        <ellipse cx="41" cy="31" rx="2" ry="1.4" fill="#A8836A" />
        <path d="M38 33c2 1.6 4 1.6 6 0" fill="none" stroke="#A8836A" strokeWidth="1.4" strokeLinecap="round" />
        {/* arm en bene */}
        <path d="M32 44c-3 5-2 8 1 9" fill="none" stroke={d} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M22 49v4M30 50v3" stroke={d} strokeWidth="3.2" strokeLinecap="round" />
      </>
    ),
  },
  pou: {
    naam: 'Pou',
    kleur: '#2E7A8A', diep: '#1E5563',
    dele: (k, d) => (
      <>
        {/* die waaier: vyf vere wat uit een punt straal, elk met 'n oog */}
        <g>
          {[-58, -30, 0, 30, 58].map((hoek, i) => (
            <g key={i} transform={`rotate(${hoek} 40 40)`}>
              <ellipse cx="40" cy="18" rx="4.6" ry="19" fill={i % 2 ? '#3E9AA8' : '#57B0B8'} />
              <circle cx="40" cy="6" r="3.4" fill="#1E4A57" />
              <circle cx="40" cy="6" r="1.8" fill="#D9B24A" />
            </g>
          ))}
        </g>
        {/* liggaam voor die waaier */}
        <ellipse cx="30" cy="44" rx="11" ry="9" fill={k} />
        <path d="M35 39l4-11" stroke={k} strokeWidth="5" strokeLinecap="round" />
        <circle cx="40" cy="27" r="5.5" fill={k} />
        <path d="M45 26l6 1.6-6 1.8z" fill="#D9B24A" />
        <circle cx="41.5" cy="25.5" r="1.4" fill="#0E2A33" />
        {/* kuif: drie stokkies met 'n bolletjie */}
        <path d="M40 21v-4M37 22l-1.5-3.6M43 22l1.5-3.6" stroke="#1E4A57" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="40" cy="16" r="1.5" fill="#D9B24A" />
        <circle cx="35.2" cy="17.6" r="1.3" fill="#D9B24A" />
        <circle cx="44.8" cy="17.6" r="1.3" fill="#D9B24A" />
        <path d="M27 52l-1 4M33 52l1 4" stroke={d} strokeWidth="2.4" strokeLinecap="round" />
      </>
    ),
  },
  jakkals: {
    naam: 'Jakkals',
    kleur: '#C4763E', diep: '#96562A',
    dele: (k, d) => (
      <>
        <ellipse cx="27" cy="37" rx="16" ry="10" fill={k} />
        <path d="M40 30l10-3 5 5-8 5z" fill={k} />
        <path d="M53 32l7 1-7 3z" fill="#F0EDE6" />
        <circle cx="49" cy="30" r="1.6" fill="#3A2312" />
        <path d="M41 24c-1-7 2-8 5-5 2 2 1 6-1 7zM49 22c1-7 4-7 6-4 1 2-1 6-3 7z" fill={d} />
        <path d="M19 45v7M27 46v6M35 45v7" stroke={d} strokeWidth="3" strokeLinecap="round" />
        <path d="M12 33c-7 0-9 6-4 9" stroke={d} strokeWidth="3.2" strokeLinecap="round" fill="none" />
      </>
    ),
  },

  /* ── Die laaste: Noag en sy gesin (Genesis 7:13) ── */
  noag: {
    naam: 'Noag en sy gesin',
    kleur: '#C9A063', diep: '#8A6E3E',
    dele: (k, d) => (
      <>
        {/* agter: die res van die gesin */}
        <g opacity="0.72">
          <circle cx="14" cy="26" r="5" fill="#D9B48A" />
          <path d="M9 34c0-4 2-6 5-6s5 2 5 6v14H9z" fill="#7C6FAF" />
          <circle cx="50" cy="26" r="5" fill="#D9B48A" />
          <path d="M45 34c0-4 2-6 5-6s5 2 5 6v14h-10z" fill="#6B9E70" />
          <circle cx="24" cy="24" r="4.6" fill="#D9B48A" />
          <path d="M19 32c0-4 2-6 5-6s5 2 5 6v16h-10z" fill="#B5714F" />
          <circle cx="41" cy="24" r="4.6" fill="#D9B48A" />
          <path d="M36 32c0-4 2-6 5-6s5 2 5 6v16H36z" fill="#5A6E96" />
        </g>
        {/* voor: Noag self */}
        <circle cx="32" cy="20" r="7" fill="#E0BC93" />
        <path d="M25 20c0-5 3-8 7-8s7 3 7 8z" fill="#E8E2D6" />
        <path d="M27 24c1 6 3 9 5 9s4-3 5-9z" fill="#E8E2D6" />
        <circle cx="29.6" cy="20" r="1.3" fill="#3A2E1E" />
        <circle cx="34.4" cy="20" r="1.3" fill="#3A2E1E" />
        <path d="M23 32c0-5 4-8 9-8s9 3 9 8v20H23z" fill={k} />
        <path d="M23 40h18" stroke={d} strokeWidth="2.4" strokeLinecap="round" />
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
