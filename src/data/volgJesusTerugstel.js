/* ── Begin VOLG JESUS heeltemal oor op hierdie foon ──
 *
 * Dewald: "ek wil dit nou heeltemal oor toets. my Daaglikse Hoop Groep verwyder
 * en heeltemal oor begin ... reset dit dat ons dit kan toets PRESIES hoe ander
 * mense dit sien."
 *
 * Dit is 'n egte behoefte en dit was tot nou onmoontlik:
 *
 *   * die EIENAAR van 'n groep kan nie sommer loop nie (§46) — 'n groep sonder
 *     eienaar is 'n groep wat niemand kan regmaak nie. Met Nadia nog binne het
 *     "Verlaat die groep" dus geweier, en daar was geen skerm om haar mee te
 *     verwyder nie;
 *   * en al het hy geloop, sou sy foon steeds sy ou merkies dra: die modus, sy
 *     week, watter dae klaar is, sy geskrewe antwoorde, die wenke wat een keer
 *     wys. Dan toets hy nie wat 'n vreemde mens sien nie.
 *
 * Die volgorde is die enigste deel wat saak maak, en dit is die omgekeerde van
 * wat 'n mens sou dink:
 *
 *   1. eers die ANDER lede uit — anders weier die bediener die volgende stap;
 *   2. dan self loop, wat die groep argiveer omdat die eienaar laaste is;
 *   3. en HEEL LAASTE die foon skoonmaak.
 *
 * Andersom sou 'n mislukte netwerkoproep die foon skoon los met die groep nog
 * lewendig, en dan sit daar 'n groep wat niemand meer kan bereik nie.
 */
/* Hierdie leer voer GEEN Firebase in nie, en dit is met opset.
 *
 * Die netwerk-kant word ingegee (sien `api` hieronder) sodat die VOLGORDE met
 * plain `node` getoets kan word. Die volgorde is die enigste deel wat werklik
 * kan breek, en 'n mens sien nie 'n volgorde op 'n skermkiekie nie.
 *
 * Die skerm (VolgJesusAdmin) gee die egte funksies in. */
import { skoonFoon } from './volgJesusSkoon.js'

export { skoonFoon, skoonmaakSleutels, VOORVOEGSELS, HOU } from './volgJesusSkoon.js'

/* ── Die hele terugstelling ──
 *
 * Gee 'n verslag terug sodat die skerm kan SE wat gebeur het. 'n Knoppie wat
 * "klaar" se sonder om te se wat dit gedoen het, is 'n knoppie wat 'n mens 'n
 * tweede keer druk. */
export async function beginOor({ stap, api } = {}) {
  const se = w => { if (stap) { try { stap(w) } catch {} } }
  /* Die netwerk-kant word ingegee sodat die VOLGORDE getoets kan word. Dit is
     die enigste deel wat werklik kan breek, en 'n blaaier is die verkeerde
     gereedskap daarvoor: 'n mens sien nie 'n volgorde op 'n skermkiekie nie. */
  const {
    myne = async () => ({ ok: true, groepe: [] }),
    lede: kryLede = async () => [],
    verwyder = async () => ({ ok: true }),
    verlaat = async () => ({ ok: true }),
    skoon = skoonFoon,
  } = api || {}
  const verslag = { groepe: 0, lede: 0, sleutels: 0, foute: [] }

  se('Kyk waar jy hoort…')
  let groepe = []
  try {
    const r = await myne()
    groepe = (r && r.ok && Array.isArray(r.groepe)) ? r.groepe : []
  } catch { verslag.foute.push('Kon nie jou groepe kry nie.') }

  for (const g of groepe) {
    /* 1 · die ander lede eers. 'n Eienaar met lede binne mag nie loop nie. */
    if (g.myRol === 'fasiliteerder') {
      se(`Haal die ander lede uit ${g.naam}…`)
      let lede = []
      try { lede = await kryLede(g.id) } catch { verslag.foute.push(`Kon nie ${g.naam} se lede kry nie.`) }

      for (const l of lede) {
        if (!l || !l.uid || l.uid === g.eienaar) continue
        try {
          const r = await verwyder(g.id, l.uid)
          if (r && r.ok) verslag.lede++
          else if (r && r.fout) verslag.foute.push(r.fout)
        } catch { verslag.foute.push(`Kon nie ${l.naam || 'n lid'} verwyder nie.`) }
      }
    }

    /* 2 · en dan self. Die eienaar as laaste lid argiveer die groep. */
    se(`Verlaat ${g.naam}…`)
    try {
      const r = await verlaat(g.id)
      if (r && r.ok) verslag.groepe++
      else if (r && r.fout) verslag.foute.push(r.fout)
    } catch { verslag.foute.push(`Kon nie ${g.naam} verlaat nie.`) }
  }

  /* 3 · HEEL LAASTE die foon. Andersom sou 'n mislukte oproep die foon skoon
     los met die groep nog lewendig, en dan is daar 'n groep wat niemand meer
     kan bereik nie. */
  se('Maak hierdie foon skoon…')
  verslag.sleutels = skoon()
  return verslag
}
