/* ────────────────────────────────────────────────────────────
   "Matteus 6:25–34" → 'n plek in die Bybel.

   ── Waarom hierdie lêer bestaan ──

   Elke nota dra 'n `scripture`-veld wat Dewald met die hand tik. Dit is vrye
   teks: "Lukas 22:42", "1 Konings 19", "Matteus 6:25–34". Om daarop 'n
   knoppie te sit wat die Bybel op die REGTE plek oopmaak, moet iemand
   daardie string kan lees.

   Bybel.jsx het reeds 'n ontleder (`ontleedVerwysing`) vir die soekkassie,
   en dit kan NIE 'n reeks lees nie. Gee 'n mens hom "Matteus 6:25–34", kry
   hy `null` terug en die knoppie doen NIKS — geen fout, geen boodskap, net
   'n knoppie wat nie werk nie. Dit is presies die soort stil mislukking wat
   in hierdie projek al 'n paar keer 'n dag gekos het.

   Dit staan apart en is suiwer sodat dit getoets kan word sonder 'n blaaier.
   Bybel.jsx se soekkassie bly soos hy is; hierdie een dien die knoppie.

   ── Die aandagstreep ──

   'n Mens tik nie 'n koppelteken nie. Word 'n verwysing uit 'n dokument of
   'n boodskap geplak, kom daar 'n AANDAGSTREEP (–) of 'n KASSTREEP (—) saam,
   en op 'n foon se sleutelbord maak outokorreksie dit vanself. 'n Ontleder
   wat net `-` ken, val op presies die verwysings wat 'n mens werklik tik.
   ──────────────────────────────────────────────────────────── */

/* Met die `.js` daarby, want hierdie lêer se toets loop met plain node en
   node se ESM los 'n uitbreidinglose pad nie op nie. Vite gee om nie. */
import { BOEKE } from './bybelBoeke.js'

/* Spellings wat 'n mens werklik tik. Die volle Afrikaanse naam en die
   USFM-kode kom vanself uit BOEKE; hierdie is die afkortings en die
   spellings sonder deeltekens.

   Dit is 'n WITLYS en nie 'n raaiery nie: 'n afkorting wat hier staan, wys
   presies een boek. Wat nie hier staan nie, val terug op 'n
   voorvoegsel-soektog wat weier om te raai (sien onder). */
const ALIASSE = {
  // Ou Testament
  'gen': 'GEN', 'genesis': 'GEN',
  'eks': 'EXO', 'eksodus': 'EXO', 'exodus': 'EXO',
  'lev': 'LEV', 'levitikus': 'LEV',
  'num': 'NUM', 'numeri': 'NUM',
  'deut': 'DEU', 'deuteronomium': 'DEU',
  'jos': 'JOS', 'josua': 'JOS',
  'rig': 'JDG', 'rigters': 'JDG',
  'rut': 'RUT',
  '1 sam': '1SA', '1sam': '1SA', '1 samuel': '1SA',
  '2 sam': '2SA', '2sam': '2SA', '2 samuel': '2SA',
  '1 kon': '1KI', '1kon': '1KI', '1 konings': '1KI',
  '2 kon': '2KI', '2kon': '2KI', '2 konings': '2KI',
  '1 kron': '1CH', '1 kronieke': '1CH',
  '2 kron': '2CH', '2 kronieke': '2CH',
  'esra': 'EZR', 'neh': 'NEH', 'nehemia': 'NEH',
  'ester': 'EST', 'job': 'JOB',
  'ps': 'PSA', 'psalm': 'PSA', 'psalms': 'PSA',
  'spr': 'PRO', 'spreuke': 'PRO',
  'pred': 'ECC', 'prediker': 'ECC',
  'hoogl': 'SNG', 'hooglied': 'SNG',
  'jes': 'ISA', 'jesaja': 'ISA',
  'jer': 'JER', 'jeremia': 'JER',
  'klaagl': 'LAM', 'klaagliedere': 'LAM',
  'eseg': 'EZK', 'esegiel': 'EZK', 'esegiël': 'EZK',
  'dan': 'DAN', 'daniel': 'DAN', 'daniël': 'DAN',
  'hos': 'HOS', 'hosea': 'HOS',
  'joel': 'JOL', 'joël': 'JOL',
  'amos': 'AMO', 'obadja': 'OBA', 'jona': 'JON',
  'miga': 'MIC', 'nahum': 'NAM', 'hab': 'HAB', 'habakuk': 'HAB',
  'sef': 'ZEP', 'sefanja': 'ZEP', 'haggai': 'HAG',
  'sag': 'ZEC', 'sagaria': 'ZEC', 'mal': 'MAL', 'maleagi': 'MAL',

  // Nuwe Testament
  'matt': 'MAT', 'mat': 'MAT', 'matteus': 'MAT', 'matteüs': 'MAT', 'mattheus': 'MAT',
  'mark': 'MRK', 'markus': 'MRK',
  'luk': 'LUK', 'lukas': 'LUK',
  'joh': 'JHN', 'johannes': 'JHN',
  'hand': 'ACT', 'handelinge': 'ACT',
  'rom': 'ROM', 'romeine': 'ROM',
  '1 kor': '1CO', '1kor': '1CO', '1 korintiers': '1CO', '1 korintiërs': '1CO',
  '2 kor': '2CO', '2kor': '2CO', '2 korintiers': '2CO', '2 korintiërs': '2CO',
  'gal': 'GAL', 'galasiers': 'GAL', 'galasiërs': 'GAL',
  'ef': 'EPH', 'efes': 'EPH', 'efesiers': 'EPH', 'efesiërs': 'EPH',
  'fil': 'PHP', 'filip': 'PHP', 'filippense': 'PHP',
  'kol': 'COL', 'kolossense': 'COL',
  '1 tess': '1TH', '1 tessalonisense': '1TH',
  '2 tess': '2TH', '2 tessalonisense': '2TH',
  '1 tim': '1TI', '1tim': '1TI', '1 timoteus': '1TI',
  '2 tim': '2TI', '2tim': '2TI', '2 timoteus': '2TI',
  'titus': 'TIT', 'filemon': 'PHM',
  'heb': 'HEB', 'hebr': 'HEB', 'hebreers': 'HEB', 'hebreërs': 'HEB',
  'jak': 'JAS', 'jakobus': 'JAS',
  '1 pet': '1PE', '1pet': '1PE', '1 petrus': '1PE',
  '2 pet': '2PE', '2pet': '2PE', '2 petrus': '2PE',
  '1 joh': '1JN', '1joh': '1JN', '1 johannes': '1JN',
  '2 joh': '2JN', '2joh': '2JN', '2 johannes': '2JN',
  '3 joh': '3JN', '3joh': '3JN', '3 johannes': '3JN',
  'judas': 'JUD',
  'op': 'REV', 'openb': 'REV', 'openbaring': 'REV',
}

/* Kode → genormaliseerde naam, een keer gebou. */
let indeks = null
function kryIndeks() {
  if (indeks) return indeks
  indeks = new Map()
  for (const [kode, naam] of Object.entries(BOEKE)) {
    indeks.set(normaliseer(naam), kode)
    indeks.set(normaliseer(kode), kode)
    /* "1 Samuel" word ook as "1samuel" aanvaar — 'n mens laat die spasie
       gereeld uit, en die kode ('1SA') dra hom in elk geval nie. */
    indeks.set(normaliseer(naam).replace(/\s+/g, ''), kode)
  }
  for (const [naam, kode] of Object.entries(ALIASSE)) {
    if (BOEKE[kode]) indeks.set(normaliseer(naam), kode)
  }
  return indeks
}

/* Kleinletters, een spasie, geen punte. Die Romeinse voorvoegsels wat soms
   in ouer materiaal staan (I, II, III) word syfers. */
function normaliseer(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\./g, ' ')
    .replace(/^iii\s+/, '3 ')
    .replace(/^ii\s+/,  '2 ')
    .replace(/^i\s+/,   '1 ')
    .replace(/\s+/g, ' ')
    .trim()
}

/* Elke streep wat 'n mens ooit tik of plak word 'n gewone koppelteken.
   Die laaste twee is die aandagstreep en die kasstreep; die minusteken
   (U+2212) kom uit party sleutelborde. */
function streepSkoon(s) {
  /* Uitgeskryf as \u-ontsnappings, nie as 'n karakterreeks nie. `[‐-―]` LYK
     soos drie karakters en is 'n reeks van U+2010 tot U+2015 — presies die
     fout wat in hierdie kodebasis al twee keer voorgekom het. */
  return String(s || '').replace(
    /[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-')
}

/* Vind die boek. Eers presies, dan 'n voorvoegsel — maar 'n voorvoegsel wat
   op MEER as een boek pas, is 'n raaiskoot en gee niks terug nie.

   "jo" pas op Job, Joël, Johannes, Jona en Josua. Om die eerste te kies is
   hoe 'n mens iemand na die verkeerde boek stuur en dit nooit agterkom nie.
   "joh" pas op presies een, en dit werk. */
function vindBoek(naam) {
  const skoon = normaliseer(naam)
  if (!skoon) return null

  const kaart = kryIndeks()
  const presies = kaart.get(skoon) || kaart.get(skoon.replace(/\s+/g, ''))
  if (presies) return presies

  const treffers = new Set()
  for (const [sleutel, kode] of kaart) {
    if (sleutel.startsWith(skoon)) treffers.add(kode)
  }
  return treffers.size === 1 ? [...treffers][0] : null
}

/* ── Lees 'n verwysing ──
 *
 * Gee `{ boek, hoofstuk, vers, versTot }` terug, of `null`.
 *
 * `vers` en `versTot` is null wanneer daar net 'n hoofstuk is — dan maak die
 * Bybel bo-aan die hoofstuk oop en niks word gemerk nie, wat reg is: "1
 * Konings 19" is 'n hoofstuk, nie 'n vers nie.
 *
 * 'n Reeks OOR twee hoofstukke ("Joh 6:25–7:2") kan die Bybel nie merk nie —
 * hy laai een hoofstuk. Ons gee dan die BEGIN terug sonder 'n einde: die
 * mens land op die regte plek en lees self verder. Dit is beter as niks, en
 * dit is eerlik oor wat gemerk word.
 */
export function ontleedSkrif(verwysing) {
  if (!verwysing || typeof verwysing !== 'string') return null

  /* "Ps 23.1" bedoel "Ps 23:1". Dit moet VOOR normaliseer() gebeur, want
     dié maak van elke punt 'n spasie sodat "Matt." kan werk. */
  const metDubbelpunt = streepSkoon(verwysing).replace(/(\d)\s*\.\s*(\d)/g, '$1:$2')

  const skoon = normaliseer(metDubbelpunt)
    .replace(/[,;]+$/, '')
    .replace(/\s*-\s*/g, '-')
    .trim()
  if (!skoon) return null

  /* boek · hoofstuk · [: vers [- eindvers | - eindhoofstuk:eindvers]] */
  const m = skoon.match(/^(.*?)\s*(\d+)\s*(?::\s*(\d+)(?:-(?:(\d+):)?(\d+))?)?$/)
  if (m) {
    const boek = vindBoek(m[1])
    if (!boek) return null

    const hoofstuk = parseInt(m[2], 10)
    if (!hoofstuk) return null

    const vers = m[3] ? parseInt(m[3], 10) : null
    if (m[3] && !vers) return null

    /* m[4] is 'n EINDHOOFSTUK ("6:25-7:2"). Dan strek dit oor hoofstukke en
       ons merk niks. */
    if (m[4]) return { boek, hoofstuk, vers, versTot: null }

    let versTot = m[5] ? parseInt(m[5], 10) : null
    /* "6:25-20" is 'n tikfout, nie 'n reeks nie. Merk dan net die begin —
       nooit 'n reeks agteruit nie. */
    if (versTot !== null && (!versTot || versTot <= vers)) versTot = null

    return { boek, hoofstuk, vers, versTot }
  }

  /* Net 'n boeknaam. Iets sinvols doen is beter as 'n knoppie wat niks doen
     nie — ons maak by hoofstuk 1 oop. */
  const boek = vindBoek(skoon)
  return boek ? { boek, hoofstuk: 1, vers: null, versTot: null } : null
}

/* ── Die verwysing netjies terug ──
 *
 * Vir die skerm, sodat "matt 6:25-34" as "Matteus 6:25–34" wys. Die
 * aandagstreep is die regte een vir 'n reeks.
 *
 * Kan ons dit nie lees nie, gee ons die mens se EIE teks terug en nie 'n leë
 * string nie — hy het iets getik en dit moet wys. */
export function skrifOpskrif(verwysing) {
  const s = ontleedSkrif(verwysing)
  if (!s) return String(verwysing || '').trim()

  const naam = BOEKE[s.boek] || s.boek
  if (!s.vers) return `${naam} ${s.hoofstuk}`
  if (!s.versTot) return `${naam} ${s.hoofstuk}:${s.vers}`
  return `${naam} ${s.hoofstuk}:${s.vers}–${s.versTot}`
}

/* Kan ons hierdie verwysing in die Bybel oopmaak? Die skerm gebruik dit om
   te besluit of die knoppie hoegenaamd bestaan — 'n knoppie wat niks doen
   nie, is erger as geen knoppie. */
export function kanOopmaak(verwysing) {
  return ontleedSkrif(verwysing) !== null
}
