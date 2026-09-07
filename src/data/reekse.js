/* ── Watter reekse reeds bestaan ──
 *
 * Dewald tik 'n reeks se naam met die hand, en 'n reeks BEGIN altyd by die
 * tweede boodskap daaroor: hy laai vandag een op, besef dis 'n reeks, en dan
 * moet die vorige een ook onder daardie naam staan.
 *
 * Dit is die plek waar 'n stil fout inkom. "Gejaagdheid, druk en uitbranding"
 * en "GEJAAGDHEID, DRUK EN UITBRANDING" is vir Firestore TWEE reekse, en dan
 * staan een boodskap alleen onder 'n naam wat amper reg is. Niemand sien dit
 * nie — die admin wys albei, en die blad wys twee reekse met een item elk.
 *
 * Hierdie lys voed 'n `datalist` by albei plekke waar 'n reeks getik word: die
 * skep-vorm en die "📖"-vorm by 'n bestaande nota. Dit is nie gerief nie, dit
 * is die hek.
 *
 * Suiwer, sodat dit sonder 'n blaaier getoets kan word.
 */

/* Die naam soos 'n mens dit vergelyk: sonder kas, sonder los spasies, en met
   elke ry spasies as een. "Gejaagdheid,  druk" en "gejaagdheid, druk" is
   dieselfde reeks. */
export function reeksSleutel(rou) {
  return String(rou == null ? '' : rou).trim().replace(/\s+/g, ' ').toLowerCase()
}

/* Die reekse uit 'n lys notas, elkeen EEN keer, alfabeties.
 *
 * Die EERSTE spelling wat ons teëkom, wen. Die notas kom nuutste-eerste uit
 * die admin, dus is dit die spelling wat Dewald die LAASTE getik het — en dit
 * is die een wat hy nou in gedagte het. */
export function reekseUit(notas) {
  const gesien = new Map()
  for (const n of Array.isArray(notas) ? notas : []) {
    const naam = String((n && n.series) || '').trim().replace(/\s+/g, ' ')
    if (!naam) continue
    const sleutel = reeksSleutel(naam)
    if (!gesien.has(sleutel)) gesien.set(sleutel, naam)
  }
  return [...gesien.values()].sort((a, b) => a.localeCompare(b, 'af'))
}

/* Pas hierdie nuwe naam by een wat reeds bestaan? Gee die BESTAANDE spelling
   terug, sodat 'n mens wat "gejaagdheid, druk en uitbranding" tik nie 'n
   tweede reeks maak nie. Pas dit by niks, kom sy eie naam terug. */
export function stelReeksGelyk(rou, bestaandes) {
  const naam = String(rou == null ? '' : rou).trim().replace(/\s+/g, ' ')
  if (!naam) return ''
  const sleutel = reeksSleutel(naam)
  for (const b of Array.isArray(bestaandes) ? bestaandes : []) {
    if (reeksSleutel(b) === sleutel) return String(b)
  }
  return naam
}
