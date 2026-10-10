/* ────────────────────────────────────────────────────────────
   PDF-teks skoonmaak en in hoofstukke split — vir die LUISTER-knoppie.

   Dewald, 9 Oktober 2026: *"PDF upload → extract text automatically →
   clean/split into chapters or sections → PLAY/LISTEN uses that text."* Geen
   handmatige plak nie.

   Die ONTTREKKING self (die PDF se grepe na rou teks) gebeur op die bediener
   met pdf-parse — sien api/boek-teks-onttrek.mjs. HIERDIE lêer is die suiwer
   helfte: rou teks in, skoon hoofstukke uit. Geen window, geen fetch, geen
   pdf-biblioteek — sodat dit getoets kan word en op die bediener EN in 'n toets
   presies dieselfde loop.

   ── Die een eerlike beperking ──

   Hoofstuk-herkenning is 'n HEURISTIEK. 'n PDF met duidelike "Chapter N"- of
   "Day N"-koppe split skoon; een sonder sulke koppe val terug op gelyke stukke
   by paragraaf-grense. Dit is bruikbaar, nie perfek nie — en dit is hoekom die
   bediener ook 'n vlag stoor sodat die admin kan sien wat gebeur het.
   ──────────────────────────────────────────────────────────── */

/* Hoogstens soveel teks per stuk wanneer daar GEEN koppe is nie. Lank genoeg
   dat 'n mens nie elke minuut 'n nuwe "hoofstuk" kry nie, kort genoeg dat
   "vorige/volgende" iets beteken. ~3 500 karakters is sowat 3–4 minute se
   luister. */
export const MAKS_STUK = 3500

/* Firestore se dokument-perk is 1 MB — in GREPE, nie karakters nie. 'n
   Krul-aanhalingsteken is drie grepe, en die JSON-string ontsnap ook nog; 900 000
   karakters kon dus oor die perk gaan en die skryf het stil misluk. 600 000 laat
   ruim plek. 'n Gewone e-boek (30–60 000 woorde) is 200–400 000 karakters. 'n
   Boek wat groter is, word by 'n hele hoofstuk afgekap. */
export const MAKS_TOTAAL = 600000

/* Korter as dit, en die stuk VOOR die eerste kop is voorblad/kopiereg/inhoud —
   nie 'n inleiding nie. Sien splitHoofstukke. */
export const MAKS_VOORBLAD = 600

/* ── Skoonmaak ──
 *
 * Rou PDF-teks kom as visuele reëls: 'n sin kan oor drie reëls loop, woorde
 * breek oor 'n reël met 'n koppelteken, en bladsynommers staan op hul eie reël.
 * Ons bou PARAGRAWE terug: blokke geskei deur 'n leë reël, en binne 'n blok
 * word die reëls saamgevoeg. */
export function skoonTeks(rou) {
  let t = String(rou || '').replace(/\r\n?/g, '\n')

  /* Woord wat oor 'n reël breek: "ge-\nbreek" → "gebreek". Net wanneer 'n
     kleinletter voor en na die breuk staan, anders vernietig ons 'n
     koppelteken-woord ("self-\nrespect" se koppelteken is eg as dit 'n
     saamgestelde woord is — maar oor 'n reëlbreuk is dit byna altyd afbreek). */
  t = t.replace(/([a-zà-ÿ])-\n([a-zà-ÿ])/g, '$1$2')

  const reels = t.split('\n')
  const blokke = []
  let blok = []
  const isBladsynommer = s => /^\s*[\divxlcIVXLC]{1,5}\s*$/.test(s) || /^\s*(page|bladsy|p\.)\s*\d+\s*$/i.test(s)
    /* pdf-parse se verstek-bladsymerker, "-- 3 of 18 --". Die stem sou dit
       hardop lees ("dash dash three of eighteen"). */
    || /^\s*-{2,}\s*\d+\s*(of|van)\s*\d+\s*-{2,}\s*$/i.test(s)

  for (const roul of reels) {
    const l = roul.trim()
    if (!l) { if (blok.length) { blokke.push(blok.join(' ')); blok = [] } continue }
    if (isBladsynommer(l)) continue        // los bladsynommers / losstaande Romeinse syfers uit
    /* 'n Hoofstuk-kop staan ALLEEN, ook al het die PDF geen leë reël ná hom
       gesit nie. Baie PDF's gee die kop en die eerste sin op opeenvolgende reëls
       sonder 'n blanko tussenin; sonder hierdie reël word hulle een paragraaf en
       die hoofstuk-grens is weg. */
    if (lykKop(l)) {
      if (blok.length) { blokke.push(blok.join(' ')); blok = [] }
      blokke.push(l)
      continue
    }
    blok.push(l)
  }
  if (blok.length) blokke.push(blok.join(' '))

  /* Meervoudige spasies → een, en trim. */
  return blokke
    .map(p => p.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n\n')
}

/* Lyk hierdie REEL soos 'n hoofstuk-kop? Kort, en begin met 'n bekende woord +
   nommer, of 'n nommer/Romeinse syfer en 'n punt/dubbelpunt. Streng met opset:
   ons wil eerder 'n kop MIS (en op gelyke stukke terugval) as 'n gewone sin as
   'n kop lees. Die `\b` ná die nommer keer "Day dreaming" van deurglip. */
const KOP_WOORD = /^(chapter|hoofstuk|day|dag|part|deel|week|lesson|les)\s+(\d+|[ivxlc]+)\b/i
const KOP_NOMMER = /^(\d{1,3}|[ivxlc]{1,4})[.:]\s+\S/i
function lykKop(reel) {
  const r = String(reel || '').trim()
  if (!r || r.length > 80) return false
  return KOP_WOORD.test(r) || KOP_NOMMER.test(r)
}

/* Voorwerk: kopiereg of 'n inhoudsopgawe. */
function lykVoorwerk(teks) {
  return /©|\bcopyright\b|all rights reserved|kopiereg|alle regte voorbehou|\bcontents\b|\binhoud(sopgawe)?\b/i.test(String(teks || ''))
}

/* Op paragraaf-vlak: ná skoonTeks staan 'n kop op sy eie, dus is dit dieselfde
   toets. */
function isKop(p) { return lykKop(p) }

/* ── Split in hoofstukke ──
 *
 * Vind koppe en begin 'n nuwe afdeling by elkeen. Teks VOOR die eerste kop
 * word 'n eie afdeling. Kry ons geen koppe nie, val ons terug op gelyke stukke.
 *
 * Elke afdeling: { titel, teks }. Altyd minstens een; nooit leeg nie. */
export function splitHoofstukke(skoon, { titel = '' } = {}) {
  const paras = String(skoon || '').split('\n\n').map(p => p.trim()).filter(Boolean)
  if (!paras.length) return []

  const hetKoppe = paras.some(isKop)

  let afdelings = []
  if (hetKoppe) {
    let huidig = null
    for (const p of paras) {
      if (isKop(p)) {
        if (huidig) afdelings.push(huidig)
        huidig = { titel: p, lyf: [] }
      } else {
        if (!huidig) huidig = { titel: titel || 'Introduction', lyf: [] }
        huidig.lyf.push(p)
      }
    }
    if (huidig) afdelings.push(huidig)
    /* 'n Kop sonder enige lyf (twee koppe op mekaar) voeg by die volgende. */
    afdelings = afdelings.filter(a => a.lyf.length > 0 || true)
    afdelings = afdelings.map(a => ({ titel: a.titel, teks: a.lyf.join('\n\n') }))
      .filter(a => a.teks.trim().length > 0)
  }

  /* Geen koppe (of die koppe het niks lyf gehad nie) → gelyke stukke. */
  if (!afdelings.length) {
    afdelings = stukkeByLengte(paras, titel)
  }

  /* ── Die INHOUDSOPGAWE en die VOORBLAD ──
   *
   * 'n Egte boek het 'n inhoudsopgawe wat elke hoofstuk se kop een keer VOOR
   * die hoofstuk self noem. Daardie reëls lyk presies soos koppe, en sonder
   * hierdie stap word elkeen 'n "hoofstuk" van een reël — "volgende" spring dan
   * na niks, en die stem lees die inhoudsopgawe twee keer.
   *
   * Twee reëls:
   *  1. Kom dieselfde kop meer as een keer voor, hou die een met die meeste teks.
   *  2. Die stuk VOOR die eerste kop val weg as dit kort is EN soos voorwerk lyk
   *     (©, copyright, inhoudsopgawe). 'n Kort EGTE inleiding bly staan — inhoud
   *     verloor is erger as 'n kopiereg-reël wat voorgelees word.
   */
  if (hetKoppe && afdelings.length > 1) {
    const sleutel = t => String(t || '').toLowerCase().replace(/\s+/g, ' ').trim()
    const beste = new Map()
    afdelings.forEach((a, i) => {
      const k = sleutel(a.titel)
      const b = beste.get(k)
      if (b === undefined || afdelings[b].teks.length < a.teks.length) beste.set(k, i)
    })
    afdelings = afdelings.filter((a, i) => beste.get(sleutel(a.titel)) === i)
    if (afdelings.length > 1 && !isKop(afdelings[0].titel)
        && afdelings[0].teks.length < MAKS_VOORBLAD && lykVoorwerk(afdelings[0].teks)) {
      afdelings = afdelings.slice(1)
    }
  }

  /* 'n Baie lang hoofstuk word self in stukke gebreek, anders is "volgende"
     nutteloos en die TTS-tou te lank. */
  const uit = []
  for (const a of afdelings) {
    if (a.teks.length <= MAKS_STUK * 1.6) { uit.push(a); continue }
    const stukke = stukkeByLengte(a.teks.split('\n\n'), a.titel)
    stukke.forEach((s, i) => uit.push({ titel: stukke.length > 1 ? `${a.titel} (${i + 1})` : a.titel, teks: s.teks }))
  }

  return begrensTotaal(uit)
}

/* Bou stukke van hoogstens MAKS_STUK, altyd by 'n paragraaf-grens. */
function stukkeByLengte(paras, titel) {
  const uit = []
  let buffer = []
  let lengte = 0
  for (const p of paras) {
    if (lengte + p.length > MAKS_STUK && buffer.length) {
      uit.push(buffer.join('\n\n'))
      buffer = []; lengte = 0
    }
    buffer.push(p); lengte += p.length + 2
  }
  if (buffer.length) uit.push(buffer.join('\n\n'))
  const naam = titel || 'Part'
  return uit.map((teks, i) => ({ titel: uit.length > 1 ? `${naam} ${i + 1}` : naam, teks }))
}

/* Hou die totaal onder Firestore se perk. Kap by 'n hele afdeling af, nie
   middel-in 'n sin nie. */
function begrensTotaal(afdelings) {
  const uit = []
  let totaal = 0
  for (const a of afdelings) {
    if (totaal + a.teks.length > MAKS_TOTAAL) break
    uit.push(a); totaal += a.teks.length
  }
  return uit.length ? uit : afdelings.slice(0, 1).map(a => ({ titel: a.titel, teks: a.teks.slice(0, MAKS_TOTAAL) }))
}

/* ── Is daar genoeg LEESBARE teks? ──
 *
 * 'n PDF wat eintlik 'n skandering/prent is, gee pdf-parse 'n paar los grepe of
 * niks. Dan moet die admin 'n waarskuwing sien, nie 'n stukkende "hoofstuk"
 * nie. Ons vra: genoeg letters, en 'n gesonde verhouding letters tot res. */
export function genoegTeks(rou) {
  const t = String(rou || '')
  const letters = (t.match(/[A-Za-zÀ-ÿ]/g) || []).length
  if (letters < 400) return false
  const sigbaar = t.replace(/\s/g, '').length || 1
  return letters / sigbaar > 0.55
}

/* Die hele pyplyn op een plek, sodat die bediener en die toets dit eenders
   loop: rou in → { ok, afdelings } of { ok:false, rede:'geen-teks' }. */
export function verwerkBoekTeks(rou, { titel = '' } = {}) {
  if (!genoegTeks(rou)) return { ok: false, rede: 'geen-teks', afdelings: [] }
  const afdelings = splitHoofstukke(skoonTeks(rou), { titel })
  if (!afdelings.length) return { ok: false, rede: 'geen-teks', afdelings: [] }
  return { ok: true, afdelings }
}
