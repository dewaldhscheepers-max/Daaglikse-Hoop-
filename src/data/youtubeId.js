/* Haal die video-ID uit enigiets wat YouTube 'n mens gee.
 *
 * Dewald: "maak seker ek kan in admin by die series die hele link insit en nie
 * net die ID nie."
 *
 * Hy plak wat sy foon hom gee, en dit is nooit die rou ID nie:
 *
 *     https://youtu.be/jACGS5QkLkQ?si=DjVIhhIlhHKS4Hg6
 *
 * ── Hoekom hierdie lêer bestaan ──
 *
 * Daar WAS al 'n `extractYoutubeId` in Admin.jsx, maar dit was plaaslik,
 * ongetoets, en het twee gate gehad wat albei stil is:
 *
 *   · dit gee die hele string terug wanneer niks pas nie. Plak iemand 'n
 *     Vimeo-skakel of 'n halwe URL, word DAARDIE ding as die "video-ID"
 *     gestoor, en die speler wys 'n leë blok;
 *   · dit keur nie die lengte nie. 'n YouTube-ID is PRESIES 11 karakters uit
 *     [A-Za-z0-9_-]. Sonder daardie toets vang 'n gulsige patroon te veel of
 *     te min en niks kla nie.
 *
 * Die tweede gat is die gevaarlike een by `?si=`. Daardie deelparameter is
 * ook [A-Za-z0-9_-] en staan DIREK langs die ID. 'n Patroon wat nie op die
 * skuinsstreep en die lengte anker nie, kan hom maklik gryp.
 *
 * Hierdie funksie gee 'n LEE string terug wanneer sy niks seker kan kry nie.
 * Dit is die punt: die vorm kan dan sê "dit lyk nie soos 'n skakel nie" in
 * plaas daarvan om gemors te stoor wat eers weke later as 'n leë speler
 * opdaag.
 */

/* Presies 11, en niks meer nie. */
const ID = /^[A-Za-z0-9_-]{11}$/

/* Elke vorm wat YouTube uitdeel. Die groep is altyd presies 11 lank, en daar
   moet 'n grens (einde, ?, &, /, #) direk daarna wees — anders sny ons 'n
   langer string in die middel deur en gee 'n ID terug wat nie bestaan nie. */
const PATRONE = [
  /youtu\.be\/([A-Za-z0-9_-]{11})(?:[?&/#]|$)/,
  /[?&]v=([A-Za-z0-9_-]{11})(?:[?&/#]|$)/,
  /\/embed\/([A-Za-z0-9_-]{11})(?:[?&/#]|$)/,
  /\/shorts\/([A-Za-z0-9_-]{11})(?:[?&/#]|$)/,
  /\/live\/([A-Za-z0-9_-]{11})(?:[?&/#]|$)/,
  /\/v\/([A-Za-z0-9_-]{11})(?:[?&/#]|$)/,
]

export function videoIdUit(inset) {
  const s = String(inset == null ? '' : inset).trim()
  if (!s) return ''

  /* Reeds 'n kaal ID. Dit moet EERSTE wees: 'n ID mag toevallig soos 'n
     woord lyk, en ons wil hom nie deur die URL-patrone jaag nie. */
  if (ID.test(s)) return s

  for (const p of PATRONE) {
    const m = s.match(p)
    if (m && ID.test(m[1])) return m[1]
  }
  return ''
}

/* Vir die vorm: is dit bruikbaar, en wat gaan gestoor word? */
export function keurVideoInset(inset) {
  const s = String(inset == null ? '' : inset).trim()
  if (!s) return { id: '', leeg: true, geldig: true }
  const id = videoIdUit(s)
  return { id, leeg: false, geldig: !!id, wasSkakel: !!id && id !== s }
}
