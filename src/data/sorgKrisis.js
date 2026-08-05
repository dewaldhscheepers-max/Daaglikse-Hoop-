/* ────────────────────────────────────────────────────────────
   Die krisis-vangnet.

   Twee dinge, en hulle moet nie verwar word nie:

   1. Hierdie lys is 'n VANGNET, nie 'n hek nie. Die hek is 'n mens wat elke
      boodskap lees voordat dit openbaar gaan. 'n Woordlys vang "ek wil myself
      doodmaak"; net 'n mens vang "ek dink nie ek gaan hier uitkom nie".

   2. Wanneer dit tref, is die doel NIE om die boodskap te keer nie. Die doel
      is om die HULPNOMMERS dadelik aan die persoon te wys. Sy hulp kan nie
      wag tot Dewald môre die boodskap lees nie.

   Die lys loop op die bediener EN op die skerm. Op die skerm sodat die
   nommers dadelik wys; op die bediener sodat 'n mens dit nie kan omseil deur
   die JavaScript te verander nie.

   Woorde word teen 'n PLATGESLAANDE weergawe van die teks getoets — sonder
   aksente, sonder hoofletters — sodat "Selfmoord" en "selfmoord" en
   "self-moord" almal tref.
   ──────────────────────────────────────────────────────────── */

/* Woorde en frases wat op onmiddellike gevaar dui. Liewer te veel as te min:
   'n vals tref wys iemand 'n nommer wat hy nie nodig het nie, en 'n gemiste
   tref laat iemand alleen. */
export const KRISIS_WOORDE = [
  // selfmoord en selfskade
  'selfmoord', 'self moord', 'myself doodmaak', 'my eie lewe neem',
  'nie meer wil lewe', 'nie meer lewe nie', 'wil doodgaan', 'wil sterf',
  'beter as ek weg is', 'beter sonder my', 'niemand sal my mis',
  'myself seermaak', 'myself sny', 'ek sny myself', 'oordosis',
  'pille drink', 'pille gedrink', 'end aan my lewe', 'einde aan my lewe',
  'kill myself', 'suicide', 'end it all',

  // 'n kind in gevaar
  'my kind word geslaan', 'kind word mishandel', 'kind aangerand',
  'iemand raak aan my kind', 'my kind is in gevaar',

  // onmiddellike geweld
  'hy slaan my', 'sy slaan my', 'word geslaan', 'gaan my doodmaak',
  'dreig om my dood te maak', 'is nou hier', 'ek is bang vir my lewe',
  'verkrag', 'aangerand',
]

/* Slaan die teks plat sodat aksente, hoofletters en ekstra spasies nie saak
   maak nie. Koppeltekens word spasies, sodat "self-moord" ook tref. */
export function plat(t) {
  return String(t || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_.,;:!?'"()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/* Watter woorde het getref? Gee die lys terug — die adminpaneel wys dit,
   sodat Dewald dadelik sien HOEKOM iets in die Gevaar-hopie is. */
export function krisisTreffers(teks) {
  const p = plat(teks)
  if (!p) return []
  return KRISIS_WOORDE.filter(w => p.includes(plat(w)))
}

export function isKrisis(teks) {
  return krisisTreffers(teks).length > 0
}

/* ── Kontakbesonderhede ──

   Nommers, e-posadresse en adresse hoort nooit op 'n openbare muur nie, ook
   nie wanneer die persoon self dit bygesit het nie. Dit merk die boodskap
   sodat die mens wat keur, dit dadelik sien.

   Dit VERANDER die teks nie. Dewald besluit wat uitgehaal word; die stelsel
   raai nie. */
export function kontakTreffers(teks) {
  const uit = []
  const t = String(teks || '')
  /* Sewe of meer syfers agtermekaar, met of sonder spasies — 'n SA-nommer */
  if (/(\d[\s-]?){7,}/.test(t)) uit.push('n telefoonnommer')
  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(t)) uit.push('n e-posadres')
  if (/\b\d+\s+[A-Za-z]+(straat|laan|weg|rylaan|street|road|avenue)\b/i.test(t)) uit.push('n adres')
  return uit
}
