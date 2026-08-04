/* ────────────────────────────────────────────────────────────
   Skakels na BibleSA vir die Afrikaanse Bybel.

   Hoekom die Afrikaanse teks NIE in hierdie app is nie:

   Die Bybelgenootskap van Suid-Afrika het die versoek skriftelik geweier.
   Hulle woorde: "we are unable to grant permission for the direct inclusion
   of our Bible texts within third-party applications" en "no digital
   copyright permissions are currently being considered or granted".

   Wat hulle WEL voorgestel het, is presies dit: skakel na die vers op
   BibleSA, ook vanaf 'n verwysing.

     www.biblesa.co.za/af/bybel/AFR83/MAT.18.21

   Moet dus nooit AFR83- of AFR53-teks in hierdie kodebasis plak nie, hoe
   klein die stukkie ook al is. Die pad is die skakel.

   Die Engelse vertalings loop deur YouVersion se Platform-API (api/bible.js).
   Daardie API gee net die weergawes waarvoor ons sleutel gelisensieer is, en
   dit is 19 Engelses — nie een Afrikaans nie. Dit is hoekom die twee kante
   van hierdie app verskillend werk: die een het 'n lisensie, die ander een
   het 'n weiering.
   ──────────────────────────────────────────────────────────── */

/* Die Afrikaanse vertalings wat BibleSA aanbied. AFR83 is die 1983-vertaling
   wat Dewald teen sy Bybel nagaan; die ander is daar as iemand dit verkies. */
export const BIBLESA_VERTALINGS = [
  { kode: 'AFR83', naam: 'Afrikaans 1983' },
  { kode: 'AFR53', naam: 'Afrikaans 1953' },
  { kode: 'ABA',   naam: 'Afrikaans 2020' },
]

const BASIS = 'https://www.biblesa.co.za/af/bybel'

/* USFM-kode ("MAT"), hoofstuk en opsioneel 'n vers → 'n BibleSA-skakel. */
export function bibleSaSkakel(boekKode, hoofstuk, vers, vertaling = 'AFR83') {
  if (!boekKode) return null
  const dele = [String(boekKode).toUpperCase()]
  if (hoofstuk) dele.push(String(hoofstuk))
  if (hoofstuk && vers) dele.push(String(vers))
  return `${BASIS}/${vertaling}/${dele.join('.')}`
}

/* Die name wat in ons eie data staan, terug na USFM-kodes.

   Ons het BOEKE (kode → Afrikaanse naam) maar 'n verwysing soos
   "1 Konings 10:22" kom as teks. Ons draai die kaart om, en aanvaar 'n paar
   spellings wat werklik in hierdie kodebasis voorkom. */
function bouIndeks(BOEKE) {
  const uit = new Map()
  for (const [kode, naam] of Object.entries(BOEKE)) {
    uit.set(naam.toLowerCase(), kode)
    uit.set(kode.toLowerCase(), kode)
  }
  // Spellings wat in die verse en die speletjies gebruik word
  const ekstra = {
    'psalm': 'PSA', 'psalms': 'PSA',
    'openbaring': 'REV', 'handelinge': 'ACT',
    'prediker': 'ECC', 'hooglied': 'SNG',
    'klaagliedere': 'LAM', 'esegiel': 'EZK', 'esegiël': 'EZK',
    'daniel': 'DAN', 'daniël': 'DAN',
    'joel': 'JOL', 'joël': 'JOL',
    'sagaria': 'ZEC', 'maleagi': 'MAL',
    'matteus': 'MAT', 'matteüs': 'MAT', 'mattheus': 'MAT',
    'markus': 'MRK', 'lukas': 'LUK', 'johannes': 'JHN',
    'romeine': 'ROM', 'galasiers': 'GAL', 'galasiërs': 'GAL',
    'efesiers': 'EPH', 'efesiërs': 'EPH',
    'filippense': 'PHP', 'kolossense': 'COL',
    'hebreers': 'HEB', 'hebreërs': 'HEB',
    'jakobus': 'JAS', 'judas': 'JUD',
  }
  for (const [naam, kode] of Object.entries(ekstra)) if (!uit.has(naam)) uit.set(naam, kode)
  return uit
}

let indeks = null

/* "Genesis 7:13" · "1 Konings 10:22" · "Job 40:20" → 'n BibleSA-skakel.
   Gee null terug as ons dit nie kan lees nie — dan wys die app net die
   verwysing as gewone teks, soos altyd. */
export function verwysingSkakel(verwysing, BOEKE, vertaling = 'AFR83') {
  if (!verwysing || typeof verwysing !== 'string') return null
  if (!indeks) indeks = bouIndeks(BOEKE || {})

  /* Boeknaam kan met 'n syfer begin ("1 Konings"), dus vat ons die syfer
     saam as dit heel voor staan. */
  const m = verwysing.trim().match(/^([1-3]?\s*[A-Za-zÀ-ÿ'.\s]+?)\s*(\d+)(?:\s*[:.]\s*(\d+))?/)
  if (!m) return null

  const naam = m[1].toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ').trim()
  const kode = indeks.get(naam) || indeks.get(naam.replace(/\s+/g, ''))
  if (!kode) return null

  return bibleSaSkakel(kode, m[2], m[3], vertaling)
}
