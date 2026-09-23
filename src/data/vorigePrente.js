/* ── VORIGE PRENTE ──
 *
 * Dewald, 24 September 2026: *"voeg knopie by 'Vorige Prente'. al die prente is
 * opgelaai saam vorige stemboodskappe... en hul moet dit kan aflaai en deel."*
 *
 * Elke nota dra 'n `wallpaperUrl`. Dewald maak een per dag, hy wys vir presies
 * EEN dag op die kaart bo-aan Luister, en daarna is hy vir altyd onsigbaar.
 * Dit is die enigste ding in hierdie app wat daagliks geskep word en dan
 * weggegooi word.
 *
 * ── Hulle laai NIE almal gelyk nie ──
 *
 * Dewald: *"moenie al die wallpapers gelyk laai nie... hulle kan mos kliek laai
 * meer."*
 *
 * Hy is reg, en dit is die eenvoudiger antwoord as duimnaels (wat in elk geval
 * nie bestaan nie — /api/wallpaper is 'n aanstuurder, nie 'n verkleiner nie).
 * Honderd telefoongrootte-prente op een skerm is baie megagrepe op 'n
 * Suid-Afrikaanse lyn, en die mens wat die derde een wou sien, betaal vir al
 * honderd.
 *
 * Agt per blad, en 'n knoppie vir die res. Dit is twee volle skerms — genoeg om
 * te laat sien dat daar meer is, klein genoeg om vinnig te laai.
 *
 * ── Vandag s'n staan nie hier nie ──
 *
 * Hy staan reeds bo-aan die blad waar die knoppie is. Twee keer dieselfde prent
 * op een skerm lees soos 'n fout, en die skerm heet VORIGE prente.
 *
 * ── 'n Nota sonder 'n prent bestaan hier nie ──
 *
 * Nie 'n leë teël nie, nie 'n plekhouer nie. Die veld is jonger as die app, dus
 * dra die ou notas hom eenvoudig nie, en 'n galery met gate lyk stukkend.
 *
 * Hierdie lêer is SUIWER: notas in, 'n lys prente uit. Geen fetch, geen
 * `Date.now()`, geen window.
 */

/* Hoeveel prente 'n mens per druk kry. */
export const PER_BLAD = 8

function skoonUrl(u) {
  const s = String(u || '').trim()
  return s
}

/* Die prente, nuutste eerste.
 *
 * Die volgorde kom van die NOTAS af en word nie hier herskik nie: die lys wat
 * Luister kry, is reeds nuutste-eerste, en 'n tweede sortering hier sou van die
 * blad af wegdryf die dag wanneer daardie een verander.
 *
 *   sonder — die nota wie se prent reeds bo-aan die blad staan (vandag s'n) */
export function prenteUit(notas, { sonder } = {}) {
  const lys = Array.isArray(notas) ? notas : []
  const weg = String(sonder || '')
  const uit = []
  const gesien = new Set()
  for (const n of lys) {
    if (!n || typeof n !== 'object') continue
    const id = String(n.id || '')
    if (!id || id === weg || gesien.has(id)) continue
    const url = skoonUrl(n.wallpaperUrl)
    if (!url) continue
    gesien.add(id)
    uit.push({
      id,
      url,
      titel: String(n.title || '').trim(),
      datum: String(n.date || '').trim(),
      /* Die prent HOORT aan 'n boodskap, en daardie verbinding is gratis —
         albei lê op dieselfde dokument. Dit is wat die galery 'n tweede pad in
         die argief in maak in plaas van net 'n prentekas. */
      oudio: String(n.audioUrl || '').trim(),
    })
  }
  return uit
}

/* Wat NOU gewys word. */
export function blad(prente, blaaie) {
  const lys = Array.isArray(prente) ? prente : []
  const b = Math.max(1, Math.floor(Number(blaaie) || 1))
  return lys.slice(0, b * PER_BLAD)
}

/* Is daar nog? Dan staan die knoppie daar. */
export function hetMeer(prente, blaaie) {
  const lys = Array.isArray(prente) ? prente : []
  const b = Math.max(1, Math.floor(Number(blaaie) || 1))
  return lys.length > b * PER_BLAD
}

/* Hoeveel nog oor — die knoppie sê dit, want "Laai meer" alleen laat 'n mens
   wonder of dit nog tien of nog tweehonderd is. */
export function nogOor(prente, blaaie) {
  const lys = Array.isArray(prente) ? prente : []
  const b = Math.max(1, Math.floor(Number(blaaie) || 1))
  return Math.max(0, lys.length - b * PER_BLAD)
}

/* "2026-09-24" → "24 September 2026". 'n Mens soek "die een van verlede
   Dinsdag", nie 'n ISO-string nie. Leeg bly leeg — nooit "Invalid Date". */
const MAANDE = ['Januarie', 'Februarie', 'Maart', 'April', 'Mei', 'Junie',
  'Julie', 'Augustus', 'September', 'Oktober', 'November', 'Desember']

export function datumWoorde(iso) {
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return ''
  const maand = MAANDE[Number(m[2]) - 1]
  if (!maand) return ''
  return `${Number(m[3])} ${maand} ${m[1]}`
}
