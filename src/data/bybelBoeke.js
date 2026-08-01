// USFM-kodes → Afrikaanse boeknaam.
// Die API gee net kodes ("GEN"), so ons vertaal dit self.
export const BOEKE = {
  GEN: 'Genesis',        EXO: 'Eksodus',       LEV: 'Levitikus',
  NUM: 'Numeri',         DEU: 'Deuteronomium', JOS: 'Josua',
  JDG: 'Rigters',        RUT: 'Rut',           '1SA': '1 Samuel',
  '2SA': '2 Samuel',     '1KI': '1 Konings',   '2KI': '2 Konings',
  '1CH': '1 Kronieke',   '2CH': '2 Kronieke',  EZR: 'Esra',
  NEH: 'Nehemia',        EST: 'Ester',         JOB: 'Job',
  PSA: 'Psalms',         PRO: 'Spreuke',       ECC: 'Prediker',
  SNG: 'Hooglied',       ISA: 'Jesaja',        JER: 'Jeremia',
  LAM: 'Klaagliedere',   EZK: 'Esegiël',       DAN: 'Daniël',
  HOS: 'Hosea',          JOL: 'Joël',          AMO: 'Amos',
  OBA: 'Obadja',         JON: 'Jona',          MIC: 'Miga',
  NAM: 'Nahum',          HAB: 'Habakuk',       ZEP: 'Sefanja',
  HAG: 'Haggai',         ZEC: 'Sagaria',       MAL: 'Maleagi',

  MAT: 'Matteus',        MRK: 'Markus',        LUK: 'Lukas',
  JHN: 'Johannes',       ACT: 'Handelinge',    ROM: 'Romeine',
  '1CO': '1 Korintiërs', '2CO': '2 Korintiërs', GAL: 'Galasiërs',
  EPH: 'Efesiërs',       PHP: 'Filippense',    COL: 'Kolossense',
  '1TH': '1 Tessalonisense', '2TH': '2 Tessalonisense',
  '1TI': '1 Timoteus',   '2TI': '2 Timoteus',  TIT: 'Titus',
  PHM: 'Filemon',        HEB: 'Hebreërs',      JAS: 'Jakobus',
  '1PE': '1 Petrus',     '2PE': '2 Petrus',    '1JN': '1 Johannes',
  '2JN': '2 Johannes',   '3JN': '3 Johannes',  JUD: 'Judas',
  REV: 'Openbaring',
}

// Waar die Nuwe Testament begin — vir die skeiding in die boeklys
export const NT_EERSTE = 'MAT'

export function boekNaam(kode) {
  return BOEKE[kode] || kode
}
