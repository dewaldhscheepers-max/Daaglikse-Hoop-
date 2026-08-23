/* Die onsuiwer helfte van `sorgProfiel.js`: localStorage en 'n doek.
   Die reëls self is suiwer en word met plain `node` getoets. */

import { PROFIEL_SLEUTEL, leesProfiel, keurNaam, FOTO_PX, FOTO_KWALITEIT, middelKrop } from './sorgProfiel'

export function myProfiel() {
  try { return leesProfiel(localStorage.getItem(PROFIEL_SLEUTEL)) } catch { return null }
}

export function stoorProfiel({ naam, foto }) {
  const keur = keurNaam(naam)
  if (keur.fout) return { fout: keur.fout }
  const p = { naam: keur.naam, foto: String(foto || '') }
  try { localStorage.setItem(PROFIEL_SLEUTEL, JSON.stringify(p)) } catch { /* privaat venster */ }
  return { profiel: p, fout: '' }
}

export function vergeetProfiel() {
  try { localStorage.removeItem(PROFIEL_SLEUTEL) } catch { /* privaat venster */ }
}

/* ── Die foto, op die FOON gekrop ──
 *
 * Dewald: "Optimaliseer en crop opgelaaide profielfoto's vir mobiele
 * gebruik."
 *
 * 'n Foto uit 'n moderne foon se kamera is agt megagreep. 'n Muur met dertig
 * sulke foto's laai nooit klaar op 'n Suid-Afrikaanse lyn nie, en die
 * oplaai self sou op 'n swak sein misluk. Ons krop dit hier tot 'n vierkant
 * van 256px en stuur 'n data-URI van 'n paar kilogreep.
 *
 * `willReadFrequently` — sien CLAUDE.md. Op Android het 'n doek met sy eie
 * GPU-laag rou geheue as gekleurde strepe gewys.
 *
 * Die krop self (`middelKrop`) is suiwer en getoets; hier is net die doek.
 */
export function kropFoto(leer) {
  return new Promise((los) => {
    if (!leer || !/^image\//.test(leer.type || '')) {
      return los({ fout: 'Kies asseblief ’n prent.' })
    }
    const url = URL.createObjectURL(leer)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      try {
        const { x, y, kant } = middelKrop(img.naturalWidth, img.naturalHeight)
        const doek = document.createElement('canvas')
        doek.width = FOTO_PX
        doek.height = FOTO_PX
        const ctx = doek.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(img, x, y, kant, kant, 0, 0, FOTO_PX, FOTO_PX)
        los({ foto: doek.toDataURL('image/jpeg', FOTO_KWALITEIT), fout: '' })
      } catch {
        los({ fout: 'Ons kon nie daardie prent gebruik nie.' })
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      los({ fout: 'Ons kon nie daardie prent oopmaak nie.' })
    }
    img.src = url
  })
}
