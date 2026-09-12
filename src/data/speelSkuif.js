/* ── "Die speletjies het geskuif" ──
 *
 * Reels vat Speel se plek in die onderste balk. Dewald, 12 September 2026:
 * *"Reels moet die bestaande Speel-oortjie vervang, so daar bly steeds net
 * vyf... Speel skuif na binne die E-boeke-blad as 'n aparte
 * Speletjies-afdeling."*
 *
 * Die skuif is die maklike helfte. Die moeilike helfte is die mens wat gister
 * op Vredepad was: sy maak die app oop, die oortjie is weg, en niks sê hoekom
 * nie. Sy dink die speletjies is verwyder — of erger, dat haar vordering weg
 * is — en sy gaan nie soek nie.
 *
 * Dit is WOORD VIR WOORD dieselfde probleem as toe VOLG JESUS van Luister af
 * weggegaan het, en die antwoord is dieselfde een: `volgJesusSkuif.js`. Ons het
 * geen kanaal na daardie foon nie; die oomblik waarop sy oopmaak, is die
 * enigste een wat ons het.
 *
 * Die reëls:
 *
 *   · NET vir wie werklik gespeel het. Iemand wat nooit 'n speletjie oopgemaak
 *     het nie, moet nooit hoor dat iets geskuif het waarvan hy nie weet nie.
 *   · EEN keer.
 *   · Net op LUISTER. Op die e-boekblad staan die speletjies reg voor haar, en
 *     dan sê die boodskap niks.
 *   · NOOIT bo-op klank of 'n ander skerm nie.
 *   · Die knoppie vat haar na die speletjies, nie na "gaan soek dit self" nie.
 *
 * Suiwer; die onsuiwer helfte staan onderaan en is net localStorage.
 */

export const SLEUTEL = 'speel_skuif_gesien'

/* ── Wat bewys dat hierdie mens gespeel het ──
 *
 * Elke speletjie se eie berging. Ons vra nie of sy GOED gespeel het nie — een
 * oopmaak is genoeg, want dit is presies die mens wat more weer wil speel.
 *
 * Die lys is die speletjies se EIE sleutels; hy staan hier sodat 'n nuwe
 * speletjie se sleutel op een plek bykom en nie in 'n toets wegraak nie. */
export const SPEEL_SLEUTELS = [
  'vredepad_data',   /* Vredepad se vordering */
  'vp_tutorial_done',
  'ark_stoor',       /* Bou die Ark */
  'ark_verste',
  'ark_diere',
  'vf_vordering',    /* Vrugtefees */
  'vf_tutoriaal',
]

/* `gevind` is wat die berging teruggegee het: 'n lys van die waardes wat
   werklik daar is. 'n LEË string tel nie — 'n sleutel wat bestaan maar niks dra
   nie, is nie bewys dat iemand gespeel het nie. */
export function hetGespeel(gevind) {
  if (!Array.isArray(gevind)) return false
  return gevind.some(v => {
    if (v === null || v === undefined) return false
    const s = String(v).trim()
    /* 'n Leë lys of 'n leë voorwerp is ook niks. Dit gebeur wanneer 'n skerm
       homself een keer gestoor het sonder dat iemand gespeel het. */
    return s !== '' && s !== '[]' && s !== '{}' && s !== 'null'
  })
}

export function magWysSkuif(f) {
  const d = f || {}

  /* Al gesien — die goedkoopste hek, en die belangrikste. */
  if (d.gesien) return false

  /* Nooit vir iemand wat nog nooit gespeel het nie. */
  if (!hetGespeel(d.gevind)) return false

  /* Net op Luister. Op die e-boekblad staan die speletjies reg voor haar. */
  if (d.oortjie !== 'luister') return false

  /* Nooit bo-op klank nie. Die stemboodskap is die app. */
  if (d.klankSpeel) return false

  /* En nie oor 'n ander skerm of 'n ander opspringer nie. */
  if (d.oorlegOop) return false

  return true
}

/* ────────────────────────────────────────────────────────────
   Die onsuiwer helfte. Net localStorage; geen besluit hierin.
   ──────────────────────────────────────────────────────────── */

export function leesSpeelSleutels() {
  const uit = []
  try {
    for (const k of SPEEL_SLEUTELS) {
      const v = localStorage.getItem(k)
      if (v !== null) uit.push(v)
    }
  } catch { /* privaat modus */ }
  return uit
}

export function isGesien() {
  try { return localStorage.getItem(SLEUTEL) === '1' } catch { return false }
}

export function merkGesien() {
  try { localStorage.setItem(SLEUTEL, '1') } catch { /* privaat modus */ }
}
