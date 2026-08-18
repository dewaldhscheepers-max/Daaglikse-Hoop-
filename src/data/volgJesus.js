/* ── VOLG JESUS — die week se datamodel en sy hekke ──
 *
 * Dit is die houer waarin al 52 weke pas, en die reels wat keer dat 'n week
 * lewendig gaan voor hy gereed is.
 *
 * Suiwer. Geen `window`, geen netwerk, geen Date — sodat elke reel met plain
 * node getoets kan word, en sodat die admin en die bediener presies dieselfde
 * antwoord gee oor of 'n week mag publiseer.
 *
 * ── Die een reel wat alles dra ──
 *
 * Uit Punt 3: "Geen les word gepubliseer voordat al vyf groen is nie."
 *
 * Dit is nie 'n voorstel nie. `magPubliseer()` is die enigste plek waar
 * daardie besluit geneem word, en die admin sowel as die eindpunt vra dit.
 */

/* ── Die etikette ──
 *
 * Uit die Jesus-kaart §3 en Punt 1 §21. Hulle bestaan om 'n enorme
 * hoeveelheid swak teologie te keer: 'n mens mag nie 'n praktyk wat Jesus
 * GEMODELLEER het in 'n universele wet verander nie, en 'n instruksie aan die
 * twaalf vir een spesifieke sending is nie 'n bevel aan elke Christen nie. */
export const ETIKETTE = {
  I: 'Identiteit',
  K: 'Kern-Evangelie / redding',
  D: 'Direkte opdrag',
  L: 'Lering',
  M: 'Gemodelleer',
  E: 'Ontmoeting',
  S: 'Spesifieke sending',
  P: 'Praktyk / gehoorsaamheidsmylpaal',
  W: 'Waarskuwing',
  A: 'Apostoliese uitwerking',
}

/* Die agt bewegings uit Punt 2. Die weeknommers is die FINALE argitektuur —
   die meesterdokument dra nog 'n ouer lys met sewe bewegings en ander
   weeknommers (Nagmaal by 41 in plaas van 44). Punt 2 wen. */
export const BEWEGINGS = [
  { nommer: 1, naam: 'Ontmoet Jesus',                    van: 1,  tot: 6  },
  { nommer: 2, naam: 'Begin Hom gehoorsaam',             van: 7,  tot: 12 },
  { nommer: 3, naam: 'Wees by Jesus',                    van: 13, tot: 18 },
  { nommer: 4, naam: 'Laat Jesus jou lewe vorm',         van: 19, tot: 29 },
  { nommer: 5, naam: 'Leef soos Jesus met mense',        van: 30, tot: 37 },
  { nommer: 6, naam: 'Plaas jou hele lewe onder Jesus',  van: 38, tot: 42 },
  { nommer: 7, naam: 'Bly in Jesus',                     van: 43, tot: 47 },
  { nommer: 8, naam: 'Gaan',                             van: 48, tot: 52 },
]

export function bewegingVir(weeknommer) {
  return BEWEGINGS.find(b => weeknommer >= b.van && weeknommer <= b.tot) || null
}

/* ── Die vyf kontroles ──
 *
 * Punt 2 §16 en Punt 1 §22. Al vyf moet groen wees. */
export const KONTROLES = [
  { sleutel: 'teks',      vraag: 'Is die Skrifgedeelte korrek aangehaal en volledig?' },
  { sleutel: 'konteks',   vraag: 'Wie praat, met wie, en wat gebeur rondom die teks?' },
  { sleutel: 'jesus',     vraag: 'Kom die hoofpunt werklik uit Jesus se lering of lewe?' },
  { sleutel: 'toepassing',vraag: 'Vloei die praktiese stap verantwoordelik uit die teks?' },
  { sleutel: 'grens',     vraag: 'Maak ons iets universeel wat die teks nie universeel maak nie?' },
]

/* ── Die week se velde ──
 *
 * Uit Punt 3 §45, minus `audio_only`: Dewald het besluit daar is net video.
 * YouTube laat 'n mens self 144p kies, wat minder data gebruik as die app se
 * stemnotas — die laedata-geval bly dus gedek. */
export const VERPLIGTE_VELDE = [
  'weeknommer',
  'titel',
  'doel',
  'openingskerm',
  'primereSkrif',
  'videoId',
  'kernwaarheid',
  'privaatRefleksie',
  'gehoorsaamheidStap',
  'gebed',
  'groepVraag1',
  'groepVraag2',
  'groepVraag3',
  'fasiliteerderHoofpunt',
  'fasiliteerderGrens',
]

/* Leeg maar toegelaat: 'n week kan geldig wees sonder 'n dag 4-vraag as die
   week se vorm dit nie vra nie. Hulle staan hier sodat die admin weet om
   hulle te WYS, nie om hulle te EIS nie. */
export const OPSIONELE_VELDE = [
  /* Die week se stemboodskap. Dit VERVANG die video: Dewald neem dit self op
     en laai dit op, en die app speel dit. Sien Stemboodskap.jsx. */
  'stemboodskapUrl',
  'ondersteunendeSkrif',
  /* 'n Vierde groepvraag. Party weke het drie, party vier — die vierde is
     die een wat gewoonlik die diepste sny, en dit mag nie wegval bloot omdat
     die vorm net drie plekke gehad het nie. */
  'groepVraag4',
  /* "Die een sin wat vandag moet bly." Dit staan aan die einde van Dag 1 en
     is die sin wat 'n mens die dag saamdra. Nie dieselfde as die
     kernwaarheid nie: die kernwaarheid dra die WEEK, hierdie een dra die DAG
     en is bedoel om skerp te wees. */
  'eenSin',
  /* "Hierdie week se kernwaarheid" uit Dewald se metadata-blok. Dit is nie
     dieselfde as `kernwaarheid` nie: dit staan by die Beweging en die
     kerntekste, en dit is fasiliteerder-taal. */
  'weekKern',
  /* Die week se wallpaper: dieselfde sin, op 'n prent vir 'n sluitskerm.
     Dit is die enigste deel van die program wat buite die app gesien word. */
  'wallpaper',
  /* Die week se eie opskrif vir elke dag. Sonder hulle val die skerm terug
     op generiese name, en dan heet 'n dag oor die menswording "Gehoorsaam". */
  'dag1Titel', 'dag2Titel', 'dag3Titel', 'dag4Titel', 'dag5Titel',
  /* Elke dag gee Skrif, nie net Dag 1 en 2 nie. Sonder hierdie velde is die
     verwysing net 'n sin binne-in die prompt, en dan is daar niks om groot te
     wys en niks om die Bybel mee oop te maak nie. */
  'dag2Skrif', 'dag3Skrif', 'dag4Skrif', 'dag5Skrif',
  'dag2Prompt',
  'dag3Prompt',
  'dag4Vraag',
  'dag5Prompt',
  'pastoraleRisiko',
  'kerkAksie',
  'mylpaal',
  'jesusKaartItems',
  'etikette',
  'watDieWeekNieDoenNie',
  'hoofgevaar',
]

export const RISIKO_VLAKKE = ['laag', 'medium', 'hoog']

/* ── Mag hierdie week publiseer? ──
 *
 * Gee 'n LYS redes terug, nie 'n boolean nie. 'n Admin wat "nee" sien sonder
 * te weet hoekom, raai — en raai lei tot 'n week wat halfpad gepubliseer word
 * omdat iemand 'n vlaggie geforseer het. */
export function publiseerFoute(week = {}) {
  const foute = []

  for (const veld of VERPLIGTE_VELDE) {
    const w = week[veld]
    if (w === undefined || w === null || String(w).trim() === '') {
      foute.push(`Ontbreek: ${veld}`)
    }
  }

  const n = Number(week.weeknommer)
  if (!Number.isInteger(n) || n < 1 || n > 52) {
    foute.push('Weeknommer moet 1 tot 52 wees')
  }

  /* Geen video, geen week. Die hele enjin hang aan die verduideliking. */
  if (week.videoId && !geldigeVideoId(week.videoId)) {
    foute.push('Die YouTube-ID lyk nie reg nie')
  }

  /* Die vyf kontroles. Dit is die belangrikste hek in die hele stelsel. */
  const k = week.kontroles || {}
  for (const { sleutel, vraag } of KONTROLES) {
    if (k[sleutel] !== true) foute.push(`Kontrole nie groen nie: ${sleutel} — ${vraag}`)
  }

  /* Teologiese hersiening. Punt 1 §23: geen week gaan nasionaal sonder dit. */
  if (week.hersieningStatus !== 'goedgekeur') {
    foute.push('Teologiese hersiening is nie goedgekeur nie')
  }

  /* 'n Week met hoe pastorale risiko MOET die fasiliteerder waarsku. Week 22
     (huwelik) en Week 30 (vergifnis) kan mishandeling oopmaak; 'n
     fasiliteerder wat dit sonder waarskuwing lei, kan werklike skade doen. */
  if (week.pastoraleRisiko === 'hoog' &&
      String(week.fasiliteerderWaarskuwing || '').trim() === '') {
    foute.push('Hoe pastorale risiko sonder n fasiliteerderwaarskuwing')
  }

  return foute
}

export function magPubliseer(week) {
  return publiseerFoute(week).length === 0
}

/* 'n YouTube-video-id is 11 karakters uit 'n vaste stel. Skryf die stel UIT —
   'n reeks soos [A-z] sluit stilweg leestekens in. */
export function geldigeVideoId(rou) {
  if (typeof rou !== 'string') return false
  return /^[A-Za-z0-9_-]{11}$/.test(rou.trim())
}

/* ── Skrifverwysings ──
 *
 * Die reel in hierdie projek is dat Dewald elke vers teen sy Bybel moet
 * nagaan. Maar 'n TIKFOUT hoef nie 'n mens se tyd te kos nie: die GAB staan
 * reeds in die repo (public/gab/, 31 102 verse), en 'n verwysing kan dus
 * masjinaal getoets word — bestaan die boek, die hoofstuk, die verse?
 *
 * Dewald gaan dan die KEUSES na, nie of ek 'n hoofstuknommer verkeerd getik
 * het nie. */
export const BOEKKODES = {
  'genesis': 'GEN', 'eksodus': 'EXO', 'exodus': 'EXO', 'levitikus': 'LEV',
  'numeri': 'NUM', 'deuteronomium': 'DEU', 'josua': 'JOS', 'rigters': 'JDG',
  'rut': 'RUT', '1 samuel': '1SA', '2 samuel': '2SA', '1 konings': '1KI',
  '2 konings': '2KI', '1 kronieke': '1CH', '2 kronieke': '2CH', 'esra': 'EZR',
  'nehemia': 'NEH', 'ester': 'EST', 'job': 'JOB', 'psalm': 'PSA',
  'psalms': 'PSA', 'spreuke': 'PRO', 'prediker': 'ECC', 'hooglied': 'SNG',
  'jesaja': 'ISA', 'jeremia': 'JER', 'klaagliedere': 'LAM', 'esegiel': 'EZK',
  'esegiël': 'EZK', 'daniel': 'DAN', 'daniël': 'DAN', 'hosea': 'HOS',
  'joel': 'JOL', 'joël': 'JOL', 'amos': 'AMO', 'obadja': 'OBA', 'jona': 'JON',
  'miga': 'MIC', 'nahum': 'NAM', 'habakuk': 'HAB', 'sefanja': 'ZEP',
  'haggai': 'HAG', 'sagaria': 'ZEC', 'maleagi': 'MAL', 'maleagí': 'MAL',
  'matteus': 'MAT', 'matteüs': 'MAT', 'markus': 'MRK', 'lukas': 'LUK',
  'johannes': 'JHN', 'handelinge': 'ACT', 'romeine': 'ROM',
  '1 korintiers': '1CO', '1 korintiërs': '1CO', '2 korintiers': '2CO',
  '2 korintiërs': '2CO', 'galasiers': 'GAL', 'galasiërs': 'GAL',
  'efesiers': 'EPH', 'efesiërs': 'EPH', 'filippense': 'PHP',
  'kolossense': 'COL', '1 tessalonisense': '1TH', '2 tessalonisense': '2TH',
  '1 timoteus': '1TI', '2 timoteus': '2TI', 'titus': 'TIT', 'filemon': 'PHM',
  'hebreers': 'HEB', 'hebreërs': 'HEB', 'jakobus': 'JAS', '1 petrus': '1PE',
  '2 petrus': '2PE', '1 johannes': '1JN', '2 johannes': '2JN',
  '3 johannes': '3JN', 'judas': 'JUD', 'openbaring': 'REV',
}

/* Streepies: die teks gebruik en-strepies (–) en gewone koppeltekens (-)
   deurmekaar. Albei beteken "tot". */
const STREEP = /[‐-―−-]/

/* Ontleed 'n verwysing soos:
 *
 *   "Matteus 5:21–26"
 *   "Lukas 24:1–12, 44–49"
 *   "Matteus 5:31–32; 19:3–12"
 *   "Johannes 4"                  (hele hoofstuk)
 *   "Johannes 19–20"              (hoofstukreeks)
 *   "Markus 10:45"
 *
 * Gee 'n lys spanne terug: { boek, hoofstuk, van, tot }.
 * `van`/`tot` is null vir 'n hele hoofstuk.
 */
export function ontleedVerwysing(rou) {
  if (typeof rou !== 'string' || !rou.trim()) return []

  /* Die boeknaam staan heel voor. Neem die langste naam wat pas, sodat
     "1 Johannes" nie as "Johannes" gelees word nie. */
  const skoon = rou.trim().replace(new RegExp(STREEP.source, 'g'), '-')
  const laer = skoon.toLowerCase()
  let boek = null, naamLengte = 0
  for (const naam of Object.keys(BOEKKODES)) {
    if (laer.startsWith(naam) && naam.length > naamLengte) {
      boek = BOEKKODES[naam]
      naamLengte = naam.length
    }
  }
  if (!boek) return []

  const res = skoon.slice(naamLengte).trim()
  if (!res) return [{ boek, hoofstuk: null, van: null, tot: null }]

  const spanne = []
  let huidigeHoofstuk = null

  for (const stuk of res.split(';')) {
    const s = stuk.trim()
    if (!s) continue

    if (s.includes(':')) {
      const [hDeel, vDeel] = s.split(':')
      const h = parseInt(hDeel.trim(), 10)
      if (!Number.isInteger(h)) continue
      huidigeHoofstuk = h
      for (const reeks of vDeel.split(',')) {
        const r = reeks.trim()
        if (!r) continue
        const [a, b] = r.split('-').map(x => parseInt(x.trim(), 10))
        if (!Number.isInteger(a)) continue
        spanne.push({ boek, hoofstuk: h, van: a, tot: Number.isInteger(b) ? b : a })
      }
    } else {
      /* Geen dubbelpunt: hoofstuk of hoofstukreeks, of 'n vervolg-versreeks
         wat by die vorige hoofstuk hoort. */
      const [a, b] = s.split('-').map(x => parseInt(x.trim(), 10))
      if (!Number.isInteger(a)) continue
      if (huidigeHoofstuk === null) {
        const tot = Number.isInteger(b) ? b : a
        for (let h = a; h <= tot; h++) spanne.push({ boek, hoofstuk: h, van: null, tot: null })
      } else {
        spanne.push({ boek, hoofstuk: huidigeHoofstuk, van: a, tot: Number.isInteger(b) ? b : a })
      }
    }
  }

  return spanne
}

/* Bestaan hierdie verwysing werklik in die Bybel wat ons dra?
 *
 * `leesBoek` word ingegee sodat hierdie funksie suiwer bly — die toets gee
 * 'n leser wat van die skyf af lees, die app een wat oor die net gaan. */
export function keurVerwysing(rou, leesBoek) {
  const spanne = ontleedVerwysing(rou)
  if (!spanne.length) return [`Kan nie "${rou}" ontleed nie`]

  const foute = []
  for (const s of spanne) {
    const boek = leesBoek(s.boek)
    if (!boek) { foute.push(`Boek nie gevind nie: ${s.boek}`); continue }
    const hoofstukke = boek.hoofstukke || []
    if (s.hoofstuk === null) continue
    if (s.hoofstuk < 1 || s.hoofstuk > hoofstukke.length) {
      foute.push(`${s.boek} het nie hoofstuk ${s.hoofstuk} nie (net ${hoofstukke.length})`)
      continue
    }
    if (s.van === null) continue
    const verse = hoofstukke[s.hoofstuk - 1] || []
    if (s.van < 1 || s.tot > verse.length) {
      foute.push(`${s.boek} ${s.hoofstuk} het ${verse.length} verse, nie ${s.van}-${s.tot} nie`)
    }
    if (s.tot < s.van) {
      foute.push(`${s.boek} ${s.hoofstuk}:${s.van}-${s.tot} loop agteruit`)
    }
  }
  return foute
}
