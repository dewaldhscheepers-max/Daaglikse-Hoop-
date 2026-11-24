/* ── Dieselfde gebedsversoek drie keer op die muur ──
 *
 * Dewald, 24 November 2026: "Why do some people post 3 of the same prayer
 * request on the bid saam page... Are they trying to force prayer?"
 *
 * Nee, en dit was die app. Bid Saam se "Plaas my gebedsversoek" het geen
 * "Besig…" gehad nie en kon herhaaldelik gedruk word. `addDoc` los eers op
 * wanneer die BEDIENER die skryf bevestig; op 'n swak lyn gebeur daar dus
 * sigbaar NIKS — die woorde bly in die kassie, die knoppie bly lewendig — en die
 * mens druk weer, en weer. Die SDK hou elke druk in 'n tou en stuur almal sodra
 * die lyn terug is: drie identiese versoeke.
 *
 * Twee helftes, albei suiwer:
 *   · `isPasGestuur` keer dat dieselfde woorde binne tien minute weer van
 *     hierdie foon af gestuur word (ook ná 'n herlaai);
 *   · `sonderDuplikate` steek op die muur die duplikate weg wat reeds bestaan —
 *     die data self word nie aangeraak nie.
 */

export const HERHAAL_VENSTER_MS = 10 * 60 * 1000
export const MUUR_VENSTER_MS    = 24 * 60 * 60 * 1000

/* Hoofletters, spasies en leestekens aan die einde maak nie 'n ander gebed nie. */
export function normaal(teks) {
  return String(teks || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[\s.!?…,;:]+$/u, '')
    .trim()
}

/* Het hierdie foon pas presies hierdie woorde gestuur? `laaste` is
   `{ teks, tyd }` uit localStorage, of niks. */
export function isPasGestuur(teks, laaste, nou = Date.now()) {
  if (!laaste || typeof laaste !== 'object') return false
  const n = normaal(teks)
  if (!n || normaal(laaste.teks) !== n) return false
  const tyd = Number(laaste.tyd)
  return Number.isFinite(tyd) && nou - tyd >= 0 && nou - tyd < HERHAAL_VENSTER_MS
}

function sekondes(p) {
  const c = p && p.createdAt
  if (c && Number.isFinite(Number(c.seconds))) return Number(c.seconds)
  return Number.POSITIVE_INFINITY   /* nog nie deur die bediener bevestig nie: die nuutste */
}

/* Hou EEN van elke groep dieselfde woorde binne 24 uur: die een met die meeste
   gebede (dit is die een waarvoor mense reeds bid), anders die oudste. Die
   volgorde van die lys bly soos dit was. */
export function sonderDuplikate(lys) {
  if (!Array.isArray(lys)) return []
  const groepe = new Map()
  for (const p of lys) {
    const n = normaal(p && p.text)
    if (!n) continue
    if (!groepe.has(n)) groepe.set(n, [])
    groepe.get(n).push(p)
  }
  const weg = new Set()
  for (const lede of groepe.values()) {
    if (lede.length < 2) continue
    /* Oudste eerste, en dan in vensters van 24 uur: dieselfde woorde 'n week
       later is 'n nuwe versoek, nie 'n duplikaat nie. */
    const ry = [...lede].sort((a, b) => sekondes(a) - sekondes(b))
    let groep = []
    const sluit = () => {
      if (groep.length < 2) { groep = []; return }
      const hou = groep.reduce((beste, p) =>
        (Number(p.prayedCount) || 0) > (Number(beste.prayedCount) || 0) ? p : beste, groep[0])
      for (const p of groep) if (p !== hou) weg.add(p)
      groep = []
    }
    for (const p of ry) {
      if (groep.length && (sekondes(p) - sekondes(groep[0])) * 1000 > MUUR_VENSTER_MS) sluit()
      groep.push(p)
    }
    sluit()
  }
  return weg.size ? lys.filter(p => !weg.has(p)) : lys
}
