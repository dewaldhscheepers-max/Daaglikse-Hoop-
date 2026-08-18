/* ── VOLG JESUS gaan LEWENDIG ──
 *
 * Tot nou was die hele program admin-alleen. Die eindpunt het met die
 * admin-geheim gesluit en die opskrif daarvan het gesê waarom: "'n eindpunt
 * wat 'net die gepubliseerdes' wys, is presies hoe 'n halwe program per
 * ongeluk lewendig gaan."
 *
 * Dewald: "ek dink week een is volledig en mense kan dit solaank begin doen.
 * ek sal elke dag een week by voeg. maar more begin ek met die whatsapp
 * devotional so dan wil ek mense na die program toe wys ook."
 *
 * Die vrees bly geldig; net die antwoord verander. Nie "geen openbare
 * eindpunt nie", maar 'n openbare eindpunt met 'n hek wat 'n mens kan LEES:
 *
 *   · `gepubliseer` is 'n APARTE Firestore-veld, nie iets in die JSON nie.
 *     Dit word deur `naFirestore` geskryf en deur `uitFirestore` teruggelees;
 *     'n week wat halfpad geskryf is, kan dit nie per ongeluk aanskakel nie.
 *   · Die openbare eindpunt filter op DAARDIE veld, en dan bou hy 'n NUWE
 *     voorwerp uit hierdie witlys. Dit stuur nooit die week deur wat hy
 *     gekry het nie.
 *
 * ── Waarom 'n witlys en nie 'n swartlys nie ──
 *
 * 'n Swartlys is 'n belofte oor die verlede. Voeg iemand more 'n veld by —
 * `interneNota`, `hersienerKommentaar` — dan lek dit stil, want niemand
 * onthou om die swartlys by te werk nie. 'n Witlys is 'n belofte oor die
 * TOEKOMS: 'n nuwe veld kom eers uit wanneer iemand dit hier bysit.
 *
 * Wat dus NOOIT uitgaan nie: `doel`, `weekKern`, die drie
 * fasiliteerder-velde, `pastoraleRisiko`, die vier groepvrae, en enigiets
 * van die hersiening. Die gewone mens loop in `rol='solo'` en sien niks
 * daarvan op sy skerm nie — maar "die skerm wys dit nie" is nie sekuriteit
 * nie. Die netwerk-oortjie is.
 *
 * Suiwer, en met `.js`, sodat plain node dit kan invoer — die bediener en die
 * app gebruik dieselfde lêer en kan dus nie uitmekaar dryf nie.
 */

/* Presies wat 'n solo-mens se skerm nodig het. Vergelyk met VolgJesusWeek.jsx:
   as 'n veld nie daar geteken word nie, hoort dit nie hier nie. */
export const OPENBARE_VELDE = [
  'weeknommer',
  'titel',
  'openingskerm',
  'moreTeaser',
  'primereSkrif',
  'ondersteunendeSkrif',
  'videoId',
  'stemboodskapUrl',
  'kernwaarheid',
  'eenSin',
  'gebed',
  'privaatRefleksie',
  'gehoorsaamheidStap',
  'wallpaper',
  'wallpaperDag1',
  'dag1Titel', 'dag2Titel', 'dag3Titel', 'dag4Titel', 'dag5Titel',
  'dag2Skrif', 'dag3Skrif', 'dag4Skrif', 'dag5Skrif',
  'dag2Prompt', 'dag3Prompt', 'dag4Vraag', 'dag5Prompt',
]

/* 'n Week soos die publiek dit mag sien — of null.
 *
 * Null in twee gevalle, en albei is opsetlik stil: die week bestaan nie, of
 * hy is nie gepubliseer nie. Die eindpunt gee dieselfde antwoord vir albei,
 * sodat 'n vreemdeling nie kan aflei hoeveel weke reeds geskryf is nie. */
export function openbareWeek(week) {
  if (!week || typeof week !== 'object') return null
  if (week.gepubliseer !== true) return null
  const n = Number(week.weeknommer)
  if (!Number.isInteger(n) || n < 1 || n > 52) return null

  const uit = {}
  for (const veld of OPENBARE_VELDE) {
    const w = week[veld]
    if (w === undefined || w === null || w === '') continue
    uit[veld] = w
  }
  uit.weeknommer = n
  return uit
}

/* Die lys van weeknommers wat lewendig is, in volgorde en sonder duplikate. */
export function gepubliseerdeNommers(weke) {
  if (!Array.isArray(weke)) return []
  const gesien = new Set()
  for (const w of weke) {
    if (!w || w.gepubliseer !== true) continue
    const n = Number(w.weeknommer)
    if (Number.isInteger(n) && n >= 1 && n <= 52) gesien.add(n)
  }
  return [...gesien].sort((a, b) => a - b)
}

/* Hoe ver die program lewendig loop.
 *
 * Dit is die AANEENLOPENDE lopie vanaf week 1, nie die hoogste nommer nie.
 * Publiseer iemand per ongeluk week 9 voor week 2, mag die program nie by 9
 * spring nie — 52 weke saam met Jesus is 'n pad, en 'n gat daarin is 'n mens
 * wat by week 2 vasval sonder om te weet hoekom. */
export function tot(nommers) {
  const lys = Array.isArray(nommers) ? nommers : []
  let n = 0
  while (lys.includes(n + 1)) n++
  return n
}

/* ── Die boodskap wat vanself vorentoe skuif ──
 *
 * Dewald: "daar kan net kort boodskap na week een wees wat sê week 2 kom
 * binnekort. en as ek week 2 oplaai skryf die boodskap agter week 2 en sê
 * week 3 kom binnekort. sal dit werk????"
 *
 * Ja — want die boodskap word nooit GETIK nie. Sy nommer word AFGELEI uit
 * wat gepubliseer is. Skakel hy week 2 aan, verskuif hierdie sin homself na
 * agter week 2 en praat van week 3. Daar is niks om te onthou om by te werk
 * nie, en dus niks wat kan agterbly nie.
 *
 * Twee ente wat 'n mens maklik mis:
 *   · niks gepubliseer nie — dan is daar geen program om aan te kondig nie;
 *   · week 52 — dan is die pad klaar, nie "week 53 kom binnekort" nie. */
export function binnekort(nommers) {
  const klaar = tot(nommers)
  if (klaar < 1) return null
  if (klaar >= 52) {
    return {
      volgende: null,
      kop: 'JY HET DIE HELE PAD GELOOP',
      lyf: 'Al 52 weke is klaar. Begin weer by Week 1 — die tweede keer sien ’n mens ander dinge.',
    }
  }
  return {
    volgende: klaar + 1,
    kop: `WEEK ${klaar + 1} KOM BINNEKORT`,
    lyf: 'Nuwe weke kom een vir een by. Kom môre weer kyk — en loop intussen weer deur wat jy reeds gedoen het.',
  }
}

/* ── Watter week wys ons vir HIERDIE mens ──
 *
 * `myne` is waar hy self is (uit sy eie toestel, nooit van 'n bediener af).
 * Dit word begrens deur wat gepubliseer is, en dit is die hele slot:
 *
 *   · is hy voor die program (of nog nooit hier nie), begin hy by 1;
 *   · is hy verby die laaste lewende week, kry hy die binnekort-boodskap in
 *     plaas van 'n leë skerm;
 *   · is niks gepubliseer nie, is daar niks om te wys nie — en dan wys die
 *     kaart op Luister ook nie. Beter niks as 'n knoppie wat nêrens gaan nie.
 */
export function kiesWeek(myne, nommers) {
  const klaar = tot(nommers)
  if (klaar < 1) return { nommer: null, wag: false, klaar: 0 }

  let n = Number(myne)
  if (!Number.isInteger(n) || n < 1) n = 1

  if (n > klaar) return { nommer: null, wag: true, klaar }
  return { nommer: n, wag: false, klaar }
}
