/* Suiwer helfte van api/vj-ou-prente.js — sien daardie kop. */

/* Die twee `sleutel`s wat VolgJesusAdmin.jsx aan PrentOplaai gee — en dus die
   middelste deel van elke lêernaam. NIE die veldname nie: `wallpaperDag1` se
   lêers heet `vj-w8-dag1-…`, `wallpaper` s'n `vj-w8-week-…`. So sedert 7 Sep. */
const VELDE = ['dag1', 'week']

/* Bou die Storage-voorvoegsel. Gee null vir enigiets buite die witlys.
   Die streep ná die sleutel hou elke soek by presies daardie sleutel. */
function voorvoegsel(week, veld) {
  const w = Number(week)
  if (!Number.isInteger(w) || w < 1 || w > 52) return null
  if (!VELDE.includes(veld)) return null
  return `covers/vj-w${w}-${veld}-`
}

/* Storage se lys → wat die admin wys: nuutste eerste, net prente wat 'n
   Firebase-aflaaiteken dra (sonder dit is daar geen skakel wat die app kan
   gebruik nie). */
function ontleedPrente(items, emmer) {
  const uit = []
  for (const it of items || []) {
    if (!it || typeof it.name !== 'string') continue
    const teken = String((it.metadata && it.metadata.firebaseStorageDownloadTokens) || '').split(',')[0].trim()
    if (!teken) continue
    const tyd = Date.parse(it.timeCreated) || 0
    uit.push({
      naam: it.name.slice(it.name.lastIndexOf('/') + 1),
      tyd,
      url: `https://firebasestorage.googleapis.com/v0/b/${emmer}/o/`
         + `${encodeURIComponent(it.name)}?alt=media&token=${encodeURIComponent(teken)}`,
    })
  }
  return uit.sort((a, b) => b.tyd - a.tyd)
}

module.exports = { VELDE, voorvoegsel, ontleedPrente }
