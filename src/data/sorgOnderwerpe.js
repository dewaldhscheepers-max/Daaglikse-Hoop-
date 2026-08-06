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

/* ── Hoekom daar so baie is ──

   Daar was tien. Die eerste twee plasings op die muur het albei oor 'n
   sterwende ma gegaan, en albei het "Angs en bekommernis" gesê — want dit
   was die naaste ding in die lys. Op die kaart lyk dit dan of die blad
   iemand se pyn verkeerd benoem.

   Die persoon kies self, en niemand gaan dit agterna regmaak nie. Die lys
   moet dus fyn genoeg wees dat die eerste keuse reeds die regte een is. */
export const ONDERWERPE = [
  { sleutel: 'angs',        naam: 'Angs en bekommernis',     sin: 'Wanneer die bekommernis nie stil raak nie' },
  { sleutel: 'donker',      naam: 'Depressie en donkerte',   sin: 'Wanneer jy nie meer krag het om op te staan nie' },
  { sleutel: 'rou',         naam: 'Rou en verlies',          sin: 'Wanneer rou nie ligter word nie' },
  /* Die gat wat die eerste twee plasings oopgemaak het: nog nie rou nie,
     want die mens leef nog, maar ook nie bloot bekommernis nie. */
  { sleutel: 'sterwend',    naam: 'Iemand wat sterwend is',  sin: 'Wanneer jy iemand sien wegraak' },
  { sleutel: 'siekte',      naam: 'Siekte en gesondheid',    sin: 'Wanneer jou liggaam jou in die steek laat' },
  { sleutel: 'ouerword',    naam: "'n Ouer wat oud word",    sin: 'Wanneer jy nou vir jou ma of pa moet sorg' },
  { sleutel: 'huwelik',     naam: 'Huwelik en verhoudings',  sin: 'Wanneer jy alleen voel binne jou eie huwelik' },
  { sleutel: 'skeiding',    naam: 'Egskeiding en skeiding',  sin: "Wanneer 'n huwelik tot 'n einde kom" },
  { sleutel: 'kinders',     naam: 'Kinders en familie',      sin: 'Wanneer jy bekommerd is oor jou kind' },
  { sleutel: 'eensaam',     naam: 'Verwerping en eensaamheid', sin: 'Wanneer dit voel of niemand jou wil hê nie' },
  { sleutel: 'vergifnis',   naam: 'Vergifnis',               sin: 'Wanneer jy nie kan vergewe nie' },
  { sleutel: 'woede',       naam: 'Woede en bitterheid',     sin: 'Wanneer die kwaad nie wil gaan lê nie' },
  { sleutel: 'skaamte',     naam: 'Skuld en skaamte',        sin: 'Wanneer jy voel jy is te ver heen om vergewe te word' },
  { sleutel: 'waarde',      naam: 'Selfbeeld en waarde',     sin: 'Wanneer jy voel jy is nie genoeg nie' },
  /* Albei staan in die uitnodiging op die blad self. Hulle was nie in die
     lys nie, en dan belowe die teks iets wat die vorm nie aanbied nie. */
  { sleutel: 'grense',      naam: 'Grense',                  sin: 'Wanneer jy nie nee kan sê nie' },
  { sleutel: 'besluit',     naam: "'n Moeilike besluit",     sin: 'Wanneer jy nie weet watter pad om te vat nie' },
  { sleutel: 'twyfel',      naam: 'Geloof en twyfel',        sin: 'Wanneer jy voel God het jou vergeet' },
  { sleutel: 'verslawing',  naam: 'Verslawing',              sin: 'Wanneer iets jou vashou en jy nie loskom nie' },
  { sleutel: 'geld',        naam: 'Finansiële druk',         sin: 'Wanneer jy bang is oor geld' },
  { sleutel: 'werk',        naam: 'Werk en roeping',         sin: 'Wanneer jy nie weet of jy op die regte plek is nie' },
  /* Hierdie twee bly LAASTE. Hulle is die uitweg vir wie nie wil kies nie. */
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

/* ────────────────────────────────────────────────────────────
   Raai die onderwerp uit 'n video se titel.

   ── Waarom ──

   Dewald plaas elke dag 'n video, en die onderwerp is die ding wat bepaal
   wie daardie video later kry — iemand wat pas sy hart uitgestort het oor
   angs, moet 'n video oor angs sien, nie een oor geld nie. Dit is dus die
   belangrikste veld op 'n video, en dit is ook die veld wat 'n mens laaste
   invul en die eerste oorslaan wanneer hy haastig is.

   Hy het dit self so gestel: "ek wil nie elkeen self onder onderwerpe sit
   nie, ek het nie die tyd daarvoor nie."

   ── Waarom dit KONSERWATIEF raai ──

   'n Verkeerde onderwerp is erger as geen onderwerp nie. Iemand wat oor die
   dood van sy kind geskryf het en 'n video oor finansiële druk terugkry, is
   nie 'n klein irritasie nie — dit is die blad wat wys dat niemand geluister
   het nie.

   Daarom raai dit net op DUIDELIKE woorde. Kry dit niks, gee dit niks terug,
   en die video land onder "Nog boodskappe van hoop" waar hy niemand seermaak
   nie. 'n Leë antwoord is 'n geldige antwoord.

   ── Waarom hele woorde ──

   'rou' sit in 'vrou', 'grou' en 'berou'. 'skuld' sit in 'skuldig'. 'n
   Substring-soektog sou 'n video oor 'n huwelik onder Rou en verlies sit.
   Alles hier loop dus teen woordgrense.
   ──────────────────────────────────────────────────────────── */

/* Let op wat NIE hier is nie: 'skuld' (dit beteken in Afrikaans skuld-geld
   en skuld-gevoel, en die raaiskoot sou albei kere kon misluk), en 'werk'
   (te algemeen — "wat werk" staan in enige titel). Waar 'n woord dubbelsinnig
   is, bly hy uit. */
const RAAI_WOORDE = {
  angs:       ['angs', 'angstig', 'angstige', 'bekommernis', 'bekommerd', 'paniek', 'onrus', 'rusteloos', 'rustelose', 'negatiewe', 'wakker'],
  donker:     ['depressie', 'donkerte', 'moeg', 'moegheid', 'uitgebrand', 'hopeloos', 'opgee'],
  rou:        ['rou', 'verlies', 'verloor', 'treur', 'begrafnis'],
  sterwend:   ['sterwend', 'sterwe'],
  siekte:     ['siekte', 'siek', 'kanker', 'gesondheid'],
  huwelik:    ['huwelik', 'huwelike', 'eggenoot', 'verhouding'],
  skeiding:   ['egskeiding'],
  kinders:    ['kind', 'kinders', 'gesin', 'familie', 'seun', 'dogter'],
  eensaam:    ['verwerping', 'verwerp', 'eensaam', 'eensaamheid', 'alleen'],
  vergifnis:  ['vergifnis', 'vergewe', 'vergeef'],
  woede:      ['woede', 'bitter', 'bitterheid', 'wrok', 'haat', 'kwaad'],
  skaamte:    ['skaamte', 'skaam', 'skuldig', 'skande'],
  waarde:     ['selfbeeld', 'waardeloos'],
  grense:     ['grense', 'geselskap', 'vriende'],
  besluit:    ['besluit'],
  twyfel:     ['twyfel', 'geloof'],
  verslawing: ['verslawing', 'verslaaf', 'drank', 'dwelms', 'pornografie'],
  geld:       ['geld', 'finansies', 'finansiële', 'finansiele', 'skulde', 'armoede'],
  werk:       ['werkloos', 'roeping', 'afgedank'],
}

/* Frases wat 'n hele gedagte dra en nie uit een woord blyk nie. */
const RAAI_FRASES = [
  ['nie goed genoeg', 'waarde'],
  ['nie genoeg nie',  'waarde'],
  ['nee kan sê',      'grense'],
  ['nee te sê',       'grense'],
  ['god vergeet',     'twyfel'],
  ['seergemaak',      'woede'],
  ['seermaak',        'woede'],
]

function normaliseer(teks) {
  return String(teks || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function raaiOnderwerpe(titel) {
  const t = normaliseer(titel)
  if (!t) return []

  /* Hele woorde: alles wat nie 'n letter of syfer is nie, is 'n grens. */
  const woorde = new Set(t.split(/[^a-z0-9]+/).filter(Boolean))
  const kry = []

  for (const [sleutel, lys] of Object.entries(RAAI_WOORDE)) {
    if (lys.some(w => woorde.has(normaliseer(w)))) kry.push(sleutel)
  }
  for (const [frase, sleutel] of RAAI_FRASES) {
    if (t.includes(normaliseer(frase)) && !kry.includes(sleutel)) kry.push(sleutel)
  }

  /* Hoogstens drie. 'n Video wat onder ses onderwerpe hang, is 'n video wat
     oral opduik en nêrens spesifiek is nie. Die volgorde volg ONDERWERPE
     s'n, sodat die uitslag altyd dieselfde is vir dieselfde titel. */
  const rang = new Map(ONDERWERPE.map((o, i) => [o.sleutel, i]))
  return kry.sort((a, b) => rang.get(a) - rang.get(b)).slice(0, 3)
}
