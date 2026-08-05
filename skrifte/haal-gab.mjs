/* ────────────────────────────────────────────────────────────
   Haal die Getroue Afrikaanse Bybel se teks, een keer.

     node skrifte/haal-gab.mjs

   ── Wat ons haal, en hoekom dit reg is ──

   Hul leser haal die Bybel as gewone statiese JSON-lêers: 'n index.json plus
   een lêer per boek onder books/. Dit staan in hul eie bondel:

       Ye + "index.json"
       Ye + "books/" + e + ".json"

   Geen sleutel, geen databasis, geen RLS. Om daardie lêers te lees is
   presies dieselfde as om hul bladsy oop te maak. Die teks self staan onder
   CC BY-NC-ND 4.0, wat reproduksie en verspreiding van die ONVERANDERDE teks
   vir nie-kommersiele doeleindes toelaat.

   ── Hoe ons dit doen ──

   · Die basispad word uit hul eie kode gelees, nooit geraai nie.
   · Een versoek elke twee sekondes. Geen parallelle versoeke.
   · 'n Kontrolepunt, sodat 'n onderbroke lopie hervat en nooit 'n boek wat
     klaar gehaal is weer trek nie.
   · 401 of 403: hou dadelik op. 429: eer Retry-After, anders wag 60 s, en
     hou op na drie agtereenvolgens. 404: teken aan en hou op, want dan is
     ons kartering verkeerd.
   · Die ROU antwoord word gestoor voor enige verwerking, met 'n SHA-256.
     Met 'n GeenAfgeleides-lisensie is bewys dat jy niks verander het die
     hele punt.
   · Die teks word NOOIT aangeraak nie. Geen spelling, geen leesteken, geen
     hoofletter, geen ontbrekende vers wat uit 'n ander bron aangevul word.

   Na hierdie lopie praat die app nooit weer met hulle nie. Sy lees net
   public/gab/.
   ──────────────────────────────────────────────────────────── */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { BOEKE } from '../src/data/bybelBoeke.js'

const WERF  = 'https://getroueafrikaansebybel.com'
const AGENT = 'DaaglikseHoop-GAB-Importer/1.0; one-time non-commercial import; dewaldscheepers.com'

const POUSE_MS   = 2000
const MAKS_PROBE = 3

const ROU     = 'data/gab-rou'
const STAND   = path.join(ROU, 'stand.json')
const UIT     = 'public/gab'
const HERKOMS = 'docs/gab-herkoms.json'

/* Hoeveel hoofstukke elke boek het. Dit is die KJV-telling, wat die GAB volg
   omdat dit 'n vertaling van die KJV is. Ons gebruik dit om te KEUR, nooit om
   iets aan te vul nie. */
const HOOFSTUKKE = {
  GEN: 50, EXO: 40, LEV: 27, NUM: 36, DEU: 34, JOS: 24, JDG: 21, RUT: 4,
  '1SA': 31, '2SA': 24, '1KI': 22, '2KI': 25, '1CH': 29, '2CH': 36, EZR: 10,
  NEH: 13, EST: 10, JOB: 42, PSA: 150, PRO: 31, ECC: 12, SNG: 8, ISA: 66,
  JER: 52, LAM: 5, EZK: 48, DAN: 12, HOS: 14, JOL: 3, AMO: 9, OBA: 1, JON: 4,
  MIC: 7, NAM: 3, HAB: 3, ZEP: 3, HAG: 2, ZEC: 14, MAL: 4,
  MAT: 28, MRK: 16, LUK: 24, JHN: 21, ACT: 28, ROM: 16, '1CO': 16, '2CO': 13,
  GAL: 6, EPH: 6, PHP: 4, COL: 4, '1TH': 5, '2TH': 3, '1TI': 6, '2TI': 4,
  TIT: 3, PHM: 1, HEB: 13, JAS: 5, '1PE': 5, '2PE': 3, '1JN': 5, '2JN': 1,
  '3JN': 1, JUD: 1, REV: 22,
}

/* 'n Handjievol hoofstukke waarvan die verstelling bekend is. Ook net om te
   keur. */
const STEEKPROEF = [
  ['PSA', 23, 6], ['JHN', 3, 36], ['ROM', 8, 39], ['REV', 22, 21],
]

const VERWAGTE_VERSE = 31102
const KODES = Object.keys(BOEKE)

function se(...d) { console.log(...d) }
function pouse(ms) { return new Promise(r => setTimeout(r, ms)) }
function hash(s) { return crypto.createHash('sha256').update(s).digest('hex') }

function stop(boodskap) {
  console.error('')
  console.error('  ' + boodskap)
  console.error('')
  process.exit(1)
}

let versoeke = 0
let laasteVersoek = 0
let agtereenvolgende429 = 0

async function haal(url, { mag404 = false } = {}) {
  const wag = POUSE_MS - (Date.now() - laasteVersoek)
  if (versoeke > 0 && wag > 0) await pouse(wag)

  for (let probe = 1; probe <= MAKS_PROBE; probe++) {
    laasteVersoek = Date.now()
    versoeke++
    let r
    try {
      r = await fetch(url, { headers: { 'user-agent': AGENT, accept: 'application/json' } })
    } catch (e) {
      if (probe === MAKS_PROBE) stop(`Kon ${url} nie bereik nie: ${e.message}`)
      await pouse(POUSE_MS * probe * 2)
      continue
    }

    if (r.status === 401 || r.status === 403) {
      stop(`${url} gee ${r.status}. Die werf wil dit nie he nie. Ons hou op.`)
    }
    if (r.status === 404) {
      if (mag404) return { status: 404, lyf: '' }
      stop(`${url} gee 404. Ons kartering is verkeerd — moenie raai nie, gaan dit na.`)
    }
    if (r.status === 429) {
      agtereenvolgende429++
      if (agtereenvolgende429 >= 3) stop('Drie keer agtereenvolgens 429. Ons hou op.')
      const na = Number(r.headers.get('retry-after'))
      const wagMs = Number.isFinite(na) && na > 0 ? na * 1000 : 60000
      se(`   429 — wag ${Math.round(wagMs / 1000)} s`)
      await pouse(wagMs)
      continue
    }
    agtereenvolgende429 = 0

    if (!r.ok) {
      if (probe === MAKS_PROBE) stop(`${url} gee ${r.status}.`)
      await pouse(POUSE_MS * probe * 2)
      continue
    }
    return { status: r.status, lyf: await r.text() }
  }
  stop(`${url} het ${MAKS_PROBE} keer misluk.`)
}

/* ── Die basispad, uit hul eie kode ── */
async function vindBasis() {
  const tuis = await haal(WERF + '/')
  const bates = [...new Set(
    [...tuis.lyf.matchAll(/(?:src|href)=["']([^"']+\.(?:js|mjs))(?:\?[^"']*)?["']/gi)].map(m => m[1])
  )]
  for (const b of bates) {
    const url = b.startsWith('http') ? b : WERF + (b.startsWith('/') ? b : '/' + b)
    const d = await haal(url)
    const m = d.lyf.match(/([A-Za-z_$][\w$]*)\s*\+\s*["']index\.json["']/)
    if (!m) continue
    const naam = m[1]
    const t = d.lyf.match(new RegExp('(?:const |let |var |,|;|\\{|\\()\\s*' + naam + '\\s*=\\s*["\'`]([^"\'`]{1,120})["\'`]'))
    if (!t) continue
    const rou = t[1]
    const vol = rou.startsWith('http') ? rou : WERF + (rou.startsWith('/') ? rou : '/' + rou)
    return vol.endsWith('/') ? vol : vol + '/'
  }
  stop('Kon die basispad nie uit hul kode lees nie. Ons raai nie.')
}

/* Ander spellings wat 'n mens by so 'n werf kan kry. Hul eie id vir Genesis
   is "gen", dus is dit waarskynlik USFM in kleinletters, maar ons vang die
   gewone afwykings sodat 'n lopie nie halfpad omval nie. */
const ANDERS = {
  JUDG: 'JDG', SONG: 'SNG', EZEK: 'EZK', JOEL: 'JOL', NAH: 'NAM', ZECH: 'ZEC',
  MARK: 'MRK', JOHN: 'JHN', ACTS: 'ACT', PHIL: 'PHP', JAMES: 'JAS',
  MATT: 'MAT', LUKE: 'LUK', ROMANS: 'ROM', REVELATION: 'REV', REVE: 'REV',
  ESTH: 'EST', PROV: 'PRO', ECCL: 'ECC', ISAIAH: 'ISA', OBAD: 'OBA',
  ZEPH: 'ZEP', HAGG: 'HAG', PHILEM: 'PHM', TITUS: 'TIT',
  '1SAM': '1SA', '2SAM': '2SA', '1KGS': '1KI', '2KGS': '2KI',
  '1CHR': '1CH', '2CHR': '2CH', '1COR': '1CO', '2COR': '2CO',
  '1THESS': '1TH', '2THESS': '2TH', '1TIM': '1TI', '2TIM': '2TI',
  '1PET': '1PE', '2PET': '2PE', '1JOHN': '1JN', '2JOHN': '2JN', '3JOHN': '3JN',
}

/* ── Kartering: hul boeksleutel → ons USFM-kode ── */
function naarKode(inskrywing) {
  const kandidate = typeof inskrywing === 'string'
    ? [inskrywing]
    : [inskrywing.id, inskrywing.slug, inskrywing.code, inskrywing.abbr, inskrywing.osis,
       inskrywing.usfm, inskrywing.key, inskrywing.file, inskrywing.name, inskrywing.naam]
        .filter(Boolean)

  for (const k of kandidate) {
    const bo = String(k).toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (KODES.includes(bo)) return bo
    if (ANDERS[bo]) return ANDERS[bo]
  }
  /* Op naam, met en sonder aksente */
  const plat = s => String(s).toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
  for (const k of kandidate) {
    const p = plat(k)
    const opNaam = KODES.find(c => plat(BOEKE[c]) === p)
    if (opNaam) return opNaam
  }
  return null
}

/* ── Die verse uit 'n boeklêer, sonder om een karakter te verander ── */

/* Hul vorm, soos die verkenning dit gewys het:

     { "id": "gen", "name": "Génesis", "abbr": "Gén",
       "chapters": {
         "1": {
           "1": { "a": "In die begin het God ...",     <- Afrikaans, die GAB
                  "e": "In the beginning God ...",     <- die KJV
                  "x":  [...], "xi": [...] }           <- kruisverwysings
         }
       } }

   Ons vat NET "a".

   Die "e"-veld is die King James, en die regte daarop berus by die Kroon,
   gepubliseer met toestemming van Cambridge University Press. Dit is nie
   ons s'n om te versprei nie en dit hoort ook nie in 'n Afrikaanse Bybel
   nie.

   Die kruisverwysings is TSK (publieke domein) plus OpenBible.info onder
   CC BY 4.0. Hulle sou 'n eie erkenning verg en hulle maak die lêers baie
   groter. Later, dalk. Nou nie.

   Ontbreek "a" by 'n vers, gee ons null terug en die keuring vang dit. Ons
   vul niks aan nie — dit is 'n GeenAfgeleides-lisensie. */
function verseUit(data) {
  const h = data && data.chapters
  if (!h || typeof h !== 'object' || Array.isArray(h)) return null

  const hoofstukNommers = Object.keys(h).filter(k => /^\d+$/.test(k)).map(Number).sort((a, b) => a - b)
  if (!hoofstukNommers.length) return null

  /* Hoofstukke moet by 1 begin en aaneenlopend wees. */
  for (let i = 0; i < hoofstukNommers.length; i++) {
    if (hoofstukNommers[i] !== i + 1) return null
  }

  return hoofstukNommers.map(nr => {
    const verse = h[String(nr)]
    if (!verse || typeof verse !== 'object') return null
    const vNommers = Object.keys(verse).filter(k => /^\d+$/.test(k)).map(Number).sort((a, b) => a - b)
    /* Ook hier: by 1 begin, aaneenlopend. Anders gee ons null en die keuring
       se presies waar. */
    for (let i = 0; i < vNommers.length; i++) {
      if (vNommers[i] !== i + 1) return null
    }
    return vNommers.map(v => {
      const teks = verse[String(v)] && verse[String(v)].a
      return typeof teks === 'string' ? teks : null
    })
  })
}

/* ── Die kruisverwysings ──

   Hul data dra by elke vers 'n "x": ["Joh 1:1-3", "Heb 11:3", ...]. Dit is
   die Treasury of Scripture Knowledge (publieke domein) saam met
   OpenBible.info se rangorde (CC BY 4.0) — sowat 340 000 verwysings, in
   volgorde van hoe sterk hulle is.

   Ons los die Afrikaanse afkortings HIER op, een keer, en stoor die antwoord
   as kodes. Die app hoef dan niks te ontleed nie; sy wys net die naam en
   spring. 'n Afkorting wat ons nie ken nie, kom hier uit — nie stil op
   iemand se foon nie.

   Die kaart word uit HUL EIE indeks gebou. Elke boek dra 'n "abbr" ("Gén")
   en 'n "name" ("Génesis"), dus raai ons niks.

   OpenBible se lisensie is CC BY 4.0 — erkenning verplig. Dit staan op die
   "Oor hierdie vertaling"-blad. */

const MAKS_PER_VERS = 20


function bouAfkortings(lys) {
  const plat = t => String(t).toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\./g, '').replace(/\s+/g, ' ').trim()

  const kaart = new Map()
  for (const b of lys) {
    const kode = naarKode(b)
    if (!kode) continue
    for (const vorm of [b.abbr, b.name, b.id]) {
      if (vorm) kaart.set(plat(vorm), kode)
    }
    /* Ons eie Afrikaanse naam ook, vir die geval hulle iewers anders spel */
    kaart.set(plat(BOEKE[kode]), kode)
  }
  return { kaart, plat }
}

/* "Joh 1:1-3" → ['JHN', 1, 1, 3] · "Heb 11:3" → ['HEB', 11, 3, null]
   Gee null as ons dit nie kan lees nie; die roeper tel dit op. */
function leesVerwysing(rou, kaart, plat) {
  const m = String(rou).trim().match(/^([1-3]?\s*[^\d]+?)\s*(\d+)\s*[:.]\s*(\d+)(?:\s*[-–]\s*(\d+))?/)
  if (!m) return null
  const kode = kaart.get(plat(m[1]))
  if (!kode) return { onbekend: plat(m[1]) }
  const h = Number(m[2]), v = Number(m[3]), tot = m[4] ? Number(m[4]) : null
  if (!h || !v) return null
  return [kode, h, v, tot]
}

function verwysingsUit(data, kaart, plat, onbekendes) {
  const h = data && data.chapters
  if (!h || typeof h !== 'object') return null
  const uit = {}
  let aantal = 0

  for (const [hNr, verse] of Object.entries(h)) {
    if (!/^\d+$/.test(hNr) || !verse || typeof verse !== 'object') continue
    for (const [vNr, vers] of Object.entries(verse)) {
      if (!/^\d+$/.test(vNr)) continue
      const rou = Array.isArray(vers && vers.x) ? vers.x : null
      if (!rou || !rou.length) continue

      const lys = []
      for (const r of rou) {
        if (lys.length >= MAKS_PER_VERS) break
        const g = leesVerwysing(r, kaart, plat)
        if (!g) continue
        if (g.onbekend) { onbekendes.set(g.onbekend, (onbekendes.get(g.onbekend) || 0) + 1); continue }
        lys.push(g)
      }
      if (!lys.length) continue
      if (!uit[hNr]) uit[hNr] = {}
      uit[hNr][vNr] = lys
      aantal += lys.length
    }
  }
  return { verwysings: uit, aantal }
}

/* ── Loop ── */
fs.mkdirSync(ROU, { recursive: true })

let stand = { basis: null, boeke: {} }
if (fs.existsSync(STAND)) {
  try { stand = JSON.parse(fs.readFileSync(STAND, 'utf8')) } catch { /* begin oor */ }
}

se('')
se('== Die basispad ==')
const VOL = stand.basis || await vindBasis()
stand.basis = VOL
se('   ' + VOL)

se('')
se('== index.json ==')
const idxRou = (await haal(VOL + 'index.json')).lyf
fs.writeFileSync(path.join(ROU, 'index.json'), idxRou)
let idx
try { idx = JSON.parse(idxRou) } catch { stop('index.json is nie geldige JSON nie.') }

let lys = Array.isArray(idx) ? idx : null
if (!lys && idx && typeof idx === 'object') {
  for (const v of Object.values(idx)) if (Array.isArray(v) && v.length >= 60) { lys = v; break }
}
if (!lys || !lys.length) stop('Kon geen boeklys in index.json kry nie.')
se('   ' + lys.length + ' boeke')

/* Kartering vooraf, sodat 'n onbekende boek nou uitkom en nie halfpad nie. */
const kaart = []
for (const b of lys) {
  const kode = naarKode(b)
  if (!kode) stop('Onbekende boek in hul indeks: ' + JSON.stringify(b).slice(0, 200))
  const sleutel = typeof b === 'string' ? b
    : (b.id || b.slug || b.file || b.code || b.abbr || b.osis || b.key)
  kaart.push({ kode, sleutel })
}
const ontbreek = KODES.filter(k => !kaart.some(x => x.kode === k))
if (ontbreek.length) se('   LET OP — nie in hul indeks nie: ' + ontbreek.map(k => BOEKE[k]).join(', '))

se('')
se('== Die boeke ==')
const boekData = {}
for (const { kode, sleutel } of kaart) {
  const lêer = path.join(ROU, kode + '.json')
  if (stand.boeke[kode] && fs.existsSync(lêer)) {
    boekData[kode] = JSON.parse(fs.readFileSync(lêer, 'utf8'))
    se(`   ${BOEKE[kode]} — reeds gehaal`)
    continue
  }
  const d = await haal(VOL + 'books/' + sleutel + '.json')
  fs.writeFileSync(lêer, d.lyf)
  stand.boeke[kode] = { sleutel, sha256: hash(d.lyf), grepe: d.lyf.length }
  fs.writeFileSync(STAND, JSON.stringify(stand, null, 2))
  boekData[kode] = JSON.parse(d.lyf)
  se(`   ${BOEKE[kode]} · ${(d.lyf.length / 1024).toFixed(0)} kB`)
}

/* ── Omskakel, sonder om iets te verander ── */
se('')
se('== Keur ==')
const foute = []
let totaalVerse = 0
let totaalHoofstukke = 0
const uitgee = []

for (const { kode } of kaart) {
  const hoofstukke = verseUit(boekData[kode])
  if (!hoofstukke) { foute.push(`${BOEKE[kode]}: kon die vorm nie lees nie`); continue }

  const verwag = HOOFSTUKKE[kode]
  if (verwag && hoofstukke.length !== verwag)
    foute.push(`${BOEKE[kode]}: ${hoofstukke.length} hoofstukke, verwag ${verwag}`)

  hoofstukke.forEach((verse, i) => {
    if (!Array.isArray(verse) || !verse.length) { foute.push(`${BOEKE[kode]} ${i + 1}: leeg`); return }
    verse.forEach((t, j) => {
      if (typeof t !== 'string' || !t.trim()) foute.push(`${BOEKE[kode]} ${i + 1}:${j + 1} is leeg`)
    })
    totaalVerse += verse.length
  })
  totaalHoofstukke += hoofstukke.length
  uitgee.push({ kode, hoofstukke })
}

for (const [kode, h, aantal] of STEEKPROEF) {
  const b = uitgee.find(x => x.kode === kode)
  const kry = b && b.hoofstukke[h - 1] && b.hoofstukke[h - 1].length
  if (kry !== aantal) foute.push(`${BOEKE[kode]} ${h}: ${kry} verse, verwag ${aantal}`)
}

se(`   ${uitgee.length} boeke · ${totaalHoofstukke} hoofstukke · ${totaalVerse.toLocaleString('af-ZA')} verse`)
if (totaalVerse !== VERWAGTE_VERSE)
  se(`   LET OP — verwag ${VERWAGTE_VERSE.toLocaleString('af-ZA')} verse.`)

if (foute.length) {
  se('')
  se(`   ${foute.length} probleem/probleme:`)
  foute.slice(0, 40).forEach(f => se('     ' + f))
  if (foute.length > 40) se(`     … en ${foute.length - 40} meer`)
  se('')
  se('   Ons publiseer NIE. Die teks word nie aangevul of reggemaak nie —')
  se("   dit is 'n GeenAfgeleides-lisensie. Die rou lêers bly in " + ROU + ".")
  process.exit(1)
}

/* ── Skryf ── */
const weergawe = idx.version || idx.weergawe || idx.date || new Date().toISOString().slice(0, 10)
fs.mkdirSync(UIT, { recursive: true })
for (const f of fs.readdirSync(UIT)) if (f.endsWith('.json')) fs.unlinkSync(path.join(UIT, f))

let grepe = 0
for (const { kode, hoofstukke } of uitgee) {
  const lyf = JSON.stringify({ boek: kode, weergawe, hoofstukke })
  fs.writeFileSync(path.join(UIT, kode + '.json'), lyf)
  grepe += Buffer.byteLength(lyf)
}

/* ── Die kruisverwysings, in hul eie gids ──
   Aparte lêers, want gewone lees moet hulle nooit laai nie. */
se('')
se('== Kruisverwysings ==')
const { kaart: afkKaart, plat } = bouAfkortings(lys)
const onbekendes = new Map()
const XUIT = path.join(UIT, 'x')
fs.mkdirSync(XUIT, { recursive: true })
for (const f of fs.readdirSync(XUIT)) if (f.endsWith('.json')) fs.unlinkSync(path.join(XUIT, f))

let xTotaal = 0, xGrepe = 0, xBoeke = 0
for (const { kode } of uitgee) {
  const r = verwysingsUit(boekData[kode], afkKaart, plat, onbekendes)
  if (!r || !r.aantal) continue
  const lyf = JSON.stringify({ boek: kode, weergawe, verwysings: r.verwysings })
  fs.writeFileSync(path.join(XUIT, kode + '.json'), lyf)
  xTotaal += r.aantal
  xGrepe += Buffer.byteLength(lyf)
  xBoeke++
}
se(`   ${xBoeke} boeke · ${xTotaal.toLocaleString('af-ZA')} verwysings · ${(xGrepe / 1048576).toFixed(1)} MB`)
if (onbekendes.size) {
  se('')
  se(`   LET OP — ${onbekendes.size} afkorting(s) wat ons nie ken nie:`)
  ;[...onbekendes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30)
    .forEach(([a, n]) => se(`     "${a}" × ${n}`))
  se('   Hulle is oorgeslaan. Voeg hulle by en loop weer.')
}
fs.writeFileSync(path.join(UIT, 'indeks.json'),
  JSON.stringify({ weergawe, konsep: true, boeke: uitgee.map(x => x.kode) }))

fs.mkdirSync(path.dirname(HERKOMS), { recursive: true })
fs.writeFileSync(HERKOMS, JSON.stringify({
  gehaal: new Date().toISOString(),
  bron: VOL,
  werf: WERF,
  lisensie: 'CC BY-NC-ND 4.0',
  lisensieBlad: WERF + '/#terms',
  weergawe,
  konsep: true,
  versoeke,
  boeke: uitgee.length,
  hoofstukke: totaalHoofstukke,
  verse: totaalVerse,
  kruisverwysings: { boeke: xBoeke, aantal: xTotaal, bron: 'Treasury of Scripture Knowledge (publieke domein) + OpenBible.info (CC BY 4.0)' },
  ontbrekendeBoeke: ontbreek,
  rou: Object.fromEntries(Object.entries(stand.boeke).map(([k, v]) => [k, v.sha256])),
}, null, 2))

se('')
se(`   ${uitgee.length} lêers geskryf na ${UIT} · ${(grepe / 1048576).toFixed(1)} MB`)
se(`   herkoms in ${HERKOMS}`)
se(`   ${versoeke} versoeke in totaal`)
se('')
