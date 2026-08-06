/* ────────────────────────────────────────────────────────────
   Die eerste reaksies en woorde op 'n plasing.

   Elke plasing wat op die muur gaan, begin met drie reaksies en drie
   opmerkings: EEN van Daaglikse Hoop, met sy merkie, en twee anoniem.

   ── Hoekom ──

   'n Vars plasing met 'n nul onder hom lees soos "niemand gee om nie", en
   dit is die wreedste ding wat 'n leë muur aan iemand kan sê wat pas oor
   haar sterwende ma geskryf het. Die muur is jonk; die stilte is 'n
   ontwerpfout, nie 'n eerlike sein nie.

   ── Wat waar is en wat nie ──

   Die een van DAAGLIKSE HOOP dra die naam en die merkie van die bediening.
   Dit is waar: die bediening bid vir elke boodskap wat inkom, en dit sê so.
   Niemand word mislei oor wie praat nie.

   Die twee anonieme is Dewald se besluit, en dit is nie 'n klein een nie —
   hulle lees soos vreemdelinge wat geantwoord het. Twee reels hou die skade
   so klein as moontlik:

     · NIE EEN is raad nie. Nie een sê iets oor die storie self nie. Hulle
       is gebed en teenwoordigheid — "Ek bid saam", "Jy is nie alleen nie" —
       en dit is waar van elke mens wat hierdie muur lees.
     · Nie een sê of impliseer "ek het jou storie gelees" nie. Dit sou 'n
       leuen wees oor 'n spesifieke daad; die res is 'n staande houding.

   ── Nooit dieselfde nie ──

   Watter woorde en watter reaksies 'n plasing kry, kom uit 'n has van sy
   id — nie uit toeval nie. Dieselfde plasing kry dus altyd dieselfde stel
   (dit spring nie rond by elke herlaai nie), maar twee plasings langs
   mekaar kry verskillende. Daarom geen Math.random() en geen Date.now() in
   hierdie lêer nie: die bediener en die skerm moet by dieselfde antwoord
   uitkom.
   ──────────────────────────────────────────────────────────── */

import { REAKSIES } from './sorgSaamstaan.js'

export const DAAGLIKSE_HOOP = 'Daaglikse Hoop'

/* Die bediening se woorde. Elkeen moet waar bly as 'n STAANDE ding, ook op
   die swaarste storie op die muur. */
export const HOOP_WOORDE = [
  'Ons bid vandag saam met jou. Jy is nie alleen hierin nie.',
  'Jou woorde is gelees en jy word gedra. Ons bid vir jou.',
  'Ons bring jou vandag voor die Here. Hou vas.',
  'Daar word vir jou gebid. Jy is gesien.',
  'Ons staan saam met jou. Mag daar vandag rus wees vir jou hart.',
  'Jy hoef dit nie alleen te dra nie. Ons bid saam met jou.',
]

/* Die anonieme woorde.

   Nie een is raad. Nie een gaan oor die storie self. Dit is die enigste
   manier waarop 'n sin veilig is op 'n muur waar die volgende plasing oor
   selfmoordgedagtes kan gaan. */
export const ANONIEME_WOORDE = [
  'Ek bid saam met jou.',
  'Jy is nie alleen nie.',
  'Sterkte. Jy word gedra.',
  'Ek dink vandag aan jou.',
  'Mag die Here jou vashou.',
  'Ek bid vir krag vir jou.',
  'Jy is in my gebede.',
  'Mag God naby wees aan jou hart.',
  'Ek dra jou vandag in gebed.',
  'Hou vas. Daar word vir jou gebid.',
  'Ek bid dat daar vrede vir jou sal wees.',
  'Jy is kosbaar, ook wanneer dit nie so voel nie.',
  'Ons bid saam met jou vanaand.',
  'Mag daar lig wees vir jou vandag.',
]

/* 'n Klein, stabiele has. Geen Math.random en geen Date.now nie — die
   bediener en die skerm moet by dieselfde antwoord uitkom. */
export function saad(teks) {
  let h = 2166136261
  const s = String(teks || '')
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/* ── Drie reaksies ──

   Nie altyd dieselfde drie nie: dit sou 'n patroon wees wat 'n mens oor
   drie plasings raaksien. Die has kies watter van die vier oorgeslaan word. */
export function saaiReaksies(muurId) {
  const h = saad('r:' + muurId)
  const oor = h % REAKSIES.length          // hierdie een kry niks
  const uit = {}
  REAKSIES.forEach((r, i) => { if (i !== oor) uit[r.sleutel] = 1 })
  return uit
}

/* ── Drie opmerkings: een van Daaglikse Hoop, twee anoniem ──

   Die volgorde is met opset: die bediening s'n eerste. Wie die blad oopmaak,
   sien eerste die een wat 'n naam dra. */
export function saaiWoorde(muurId) {
  const h = saad('w:' + muurId)
  const hoop = HOOP_WOORDE[h % HOOP_WOORDE.length]

  /* Twee VERSKILLENDE anonieme sinne. 'n Tweede sprong wat nie 'n deler van
     die lengte is nie, sodat hulle nooit op dieselfde een land nie. */
  const n = ANONIEME_WOORDE.length
  const a = h % n
  const b = (a + 1 + (saad('b:' + muurId) % (n - 1))) % n

  return [
    { bron: 'hoop', naam: DAAGLIKSE_HOOP, teks: hoop },
    { bron: 'saai', naam: '', teks: ANONIEME_WOORDE[a] },
    { bron: 'saai', naam: '', teks: ANONIEME_WOORDE[b] },
  ]
}
