/* ────────────────────────────────────────────────────────────
   Die onderwerpe van Pastorale Sorg.

   Hulle doen drie dinge tegelyk, en dit is hoekom hulle in hul eie lêer sit:

   1. Iemand kies een op die vorm wanneer hy sy boodskap stuur.
   2. Dit bepaal watter video of stemnota hy DADELIK terugkry — nie 'n koue
      "dankie" nie, maar iets wat vandag help.
   3. Elke video en elke stemnota word met dieselfde onderwerpe gemerk, sodat
      die biblieteek volgens BEHOEFTE gerangskik kan word en nie volgens
      datum nie.

   Die `sin` is hoe die biblioteek dit wys — die sin wat 'n mens oor homself
   sou sê, nie 'n kategorie-etiket nie. "Wanneer jy moeg geword het om sterk
   te wees" help iemand; "Emosionele welstand" help niemand.

   Die sleutels mag NOOIT verander nie. Hulle sit in gestoorde boodskappe en
   in elke video se merke. 'n Nuwe naam is reg; 'n nuwe sleutel breek die
   verband met alles wat reeds gemerk is.
   ──────────────────────────────────────────────────────────── */

export const ONDERWERPE = [
  { sleutel: 'angs',        naam: 'Angs en bekommernis',     sin: 'Wanneer die bekommernis nie stil raak nie' },
  { sleutel: 'rou',         naam: 'Rou en verlies',          sin: 'Wanneer rou nie ligter word nie' },
  { sleutel: 'huwelik',     naam: 'Huwelik en verhoudings',  sin: 'Wanneer jy alleen voel binne jou eie huwelik' },
  { sleutel: 'vergifnis',   naam: 'Vergifnis',               sin: 'Wanneer jy nie kan vergewe nie' },
  { sleutel: 'eensaam',     naam: 'Verwerping en eensaamheid', sin: 'Wanneer dit voel of niemand jou wil hê nie' },
  { sleutel: 'kinders',     naam: 'Kinders en familie',      sin: 'Wanneer jy bekommerd is oor jou kind' },
  { sleutel: 'twyfel',      naam: 'Geloof en twyfel',        sin: 'Wanneer jy voel God het jou vergeet' },
  { sleutel: 'geld',        naam: 'Finansiële druk',         sin: 'Wanneer jy bang is oor geld' },
  { sleutel: 'onseker',     naam: 'Ek is nie seker nie',     sin: 'Wanneer alles net te veel geword het' },
  { sleutel: 'ander',       naam: 'Iets anders',             sin: 'Wanneer alles net te veel geword het' },
]

/* Wanneer iemand nie weet wat om te kies nie, of "iets anders" kies, val ons
   hierop terug. Daar moet ALTYD iets wees om te wys. */
export const BREE_ONDERWERP = 'onseker'

const OP_SLEUTEL = new Map(ONDERWERPE.map(o => [o.sleutel, o]))

export function onderwerpBy(sleutel) {
  return OP_SLEUTEL.get(sleutel) || null
}

export function onderwerpNaam(sleutel) {
  const o = OP_SLEUTEL.get(sleutel)
  return o ? o.naam : ''
}

export function onderwerpSin(sleutel) {
  const o = OP_SLEUTEL.get(sleutel)
  return o ? o.sin : ''
}

/* Is dit 'n sleutel wat ons ken? Word gebruik om te keur wat ingestuur word —
   'n onbekende sleutel word 'ander', nooit gestoor soos dit gekom het nie. */
export function keurOnderwerp(sleutel) {
  return OP_SLEUTEL.has(sleutel) ? sleutel : 'ander'
}
