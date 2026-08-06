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

/* ── Wat onder 'n VIDEO staan ──

   Die woorde hierbo is vir die MUUR geskryf. Daar het iemand pas sy hart
   uitgestort, en "Daar word vir jou gebid, jy is gesien" is presies reg.

   Onder 'n video is dieselfde sin verkeerd. Niemand het iets gedeel nie —
   dit is 'n video wat Dewald gemaak het. 'n Opmerking wat se "jy is nie
   alleen nie" praat met 'n mens wat nie daar is nie, en dan lees die hele
   ding vals.

   Kyk 'n mens na wat mense WERKLIK onder sy Shorts skryf, is dit kort en
   dit is meestal emoji. Dus is dit hier ook so.

   Daaglikse Hoop se eie naam staan nie hier nie: dit is sy eie video, en 'n
   kanaal wat sy eie video prys, lyk soos 'n kanaal wat niemand anders het
   nie. */
export const VIDEO_WOORDE = [
  '\u{1F64F}\u{1F3FB}',
  '\u{1F525}\u{1F64F}\u{1F3FB}',
  '\u{1F64C}\u{1F3FB}\u{1F64F}\u{1F3FB}',
  '\u2764\uFE0F\u{1F64F}\u{1F3FB}',
  '\u{1F64F}\u{1F3FB}\u{1F64F}\u{1F3FB}\u{1F64F}\u{1F3FB}',
  '\u{1F525}\u{1F525}\u{1F64F}\u{1F3FB}',
  'Amen \u{1F64F}\u{1F3FB}',
  'Dankie \u{1F64F}\u{1F3FB}',
  '\u{1F64F}\u{1F3FB}\u2764\uFE0F',
  '\u{1F525}\u{1F64C}\u{1F3FB}',
  'Amen \u{1F525}\u{1F64F}\u{1F3FB}',
  '\u{1F64F}\u{1F3FB}\u{1F525}',
  '\u{1F64C}\u{1F3FB}\u{1F525}\u{1F64F}\u{1F3FB}',
  'Dankie Pastoor \u{1F64F}\u{1F3FB}',
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

/* Twee VERSKILLENDE trekke uit dieselfde lys. Die tweede sprong is nooit
   nul en nooit 'n veelvoud van die lengte nie, sodat hulle nie op dieselfde
   een kan land nie. */
function tweeUit(lys, muurId) {
  const n = lys.length
  const a = saad('w:' + muurId) % n
  const b = (a + 1 + (saad('b:' + muurId) % (n - 1))) % n
  return [lys[a], lys[b]]
}

/* ── Wat onder 'n plasing of 'n video staan ──

   Op die MUUR: een van Daaglikse Hoop, dan twee anoniem. Die volgorde is met
   opset — wie die blad oopmaak, sien eerste die een wat 'n naam dra.

   Onder 'n VIDEO: drie kort emoji-opmerkings en geen naam nie. Daar is
   niemand om te troos; dit is Dewald se eie video. Sien `VIDEO_WOORDE`. */
export function saaiWoorde(muurId, soort = 'muur') {
  if (soort === 'video') {
    const [a, b] = tweeUit(VIDEO_WOORDE, muurId)
    const c = VIDEO_WOORDE[(saad('c:' + muurId) + 1) % VIDEO_WOORDE.length]
    /* Die derde mag met een van die eerste twee bots — dan word dit die
       volgende een in die lys. Twee dieselfde emoji onder mekaar lyk soos 'n
       fout, ook al gebeur dit in die egte lewe heeltyd. */
    const derde = (c === a || c === b)
      ? VIDEO_WOORDE.find(w => w !== a && w !== b)
      : c
    return [
      { bron: 'saai', naam: '', teks: a },
      { bron: 'saai', naam: '', teks: b },
      { bron: 'saai', naam: '', teks: derde },
    ]
  }

  const hoop = HOOP_WOORDE[saad('w:' + muurId) % HOOP_WOORDE.length]
  const [a, b] = tweeUit(ANONIEME_WOORDE, muurId)

  return [
    { bron: 'hoop', naam: DAAGLIKSE_HOOP, teks: hoop },
    { bron: 'saai', naam: '', teks: a },
    { bron: 'saai', naam: '', teks: b },
  ]
}
