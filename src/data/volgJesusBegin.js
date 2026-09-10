/* ── Het hierdie mens die program BEGIN? ──
 *
 * Dewald: "wanneer iemand deel is van 'n groep of dit alleen begin doen het,
 * moet dit nie meer wys BEGIN HIER nie. dan moet dit wys GAAN VOORT."
 *
 * Die kaart het dit uit `vj_my_week` afgelei, en daardie getal skuif eers
 * wanneer 'n mens 'n hele week KLAARMAAK. Iemand wat pas aangesluit het en op
 * Dag 3 sit, het dus steeds "BEGIN HIER" gesien — die app het gemaak of hy nog
 * niks gedoen het nie.
 *
 * Die oomblik wat tel, is die KEUSE: alleen of saam. Dit is presies wanneer die
 * program vir hierdie mens begin, en dit is ook wanneer ons hom tel (sien
 * `tel('doen')` in VolgJesusLewe).
 *
 * Suiwer, sodat dit sonder 'n blaaier getoets kan word — die kaart is die
 * eerste ding wat duisende mense elke oggend sien, en dit het al twee keer die
 * verkeerde ding gewys.
 */

/* Die twee waardes wat `vj_modus` mag he. Enigiets anders — 'wag', 'onbeslis',
   leeg, rommel — beteken die mens het nog nie gekies nie. */
export const MODUSSE = ['solo', 'groep']

export function hetBegin(modus, klaarDae) {
  if (MODUSSE.includes(modus)) return true
  /* 'n Vangnet. Iemand kan 'n dag klaargemaak het op 'n ouer weergawe wat nog
     nie 'n modus geskryf het nie; sy vordering is dan die bewys. */
  if (Array.isArray(klaarDae) && klaarDae.length > 0) return true
  return false
}

/* Wat die KAART moet wys.
 *
 * Gee null vir "BEGIN HIER", of { nommer, titel } vir "GAAN VOORT". Die
 * komponent besluit self oor die woorde — hier staan net WIE waar is. */
export function kaartWeek({ modus, klaarDae, nommer, titel } = {}) {
  if (!hetBegin(modus, klaarDae)) return null
  const n = Number(nommer)
  if (!Number.isInteger(n) || n < 1 || n > 52) return null
  return { nommer: n, titel: String(titel || '') }
}

/* ── Is 'n hele week klaar? ──
 *
 * Vyf dae, en al vyf moet daar wees. 'n Mens kan hulle in enige volgorde doen
 * en 'n ou weergawe kon hulle as stringe geskryf het. */
export const DAE_PER_WEEK = 5

export function weekVoltooi(klaarDae) {
  if (!Array.isArray(klaarDae)) return false
  const stel = new Set(klaarDae.map(Number))
  for (let d = 1; d <= DAE_PER_WEEK; d++) if (!stel.has(d)) return false
  return true
}

/* ── WATTER week die kaart wys, en of die mens WAG ──
 *
 * 10 September 2026, met 'n skermkiekie: *"week 4 klaar maar kaart wys nog
 * week 4."* Die kaart het "WEEK 4 VAN 52 — GAAN VOORT" gewys aan iemand wat
 * Week 4 klaar had.
 *
 * Twee dinge het dit veroorsaak, en die kaart moet ALBEI oorleef:
 *
 *   1. `vj_my_week` skuif net wanneer Dag 5 IN DIE APP klaargemaak word. Bly
 *      daardie getal agter — 'n ou weergawe, 'n foon wat halfpad toegemaak
 *      het, 'n mens wat die dag op 'n ander toestel klaargemaak het — dan wys
 *      die kaart vir altyd 'n week wat hy klaar het. Ons loop dus VORENTOE
 *      deur die weke wat hy WERKLIK voltooi het; die merkies per week
 *      (`vj_klaar_w<n>`) is die waarheid, nie die teller nie.
 *
 *   2. Is hy by die LAASTE gepubliseerde week en het hy dit klaar, dan is daar
 *      niks om "voort te gaan" met nie. Die kaart het toe steeds GAAN VOORT
 *      gesê — en dit is die kaart wat lieg. Dan is die eerlike ding om te sê
 *      dat die volgende week kom.
 *
 * Suiwer, want dit is die eerste ding wat duisende mense elke oggend sien en
 * dit het nou drie keer die verkeerde ding gewys.
 */
export function kaartKeuse({ myne, nommers, klaarPerWeek, modus } = {}) {
  /* Aaneenlopend vanaf 1 — presies dieselfde reël as kiesWeek() s'n. Word week
     9 per ongeluk voor week 5 gepubliseer, tel hy nie. */
  const gepubliseer = new Set(
    (Array.isArray(nommers) ? nommers : [])
      .map(Number).filter(n => Number.isInteger(n) && n >= 1 && n <= 52),
  )
  let laaste = 0
  while (gepubliseer.has(laaste + 1)) laaste++
  if (laaste < 1) return null            /* niks gepubliseer → geen kaart */

  const klaarVan = n => {
    const v = (klaarPerWeek || {})[n]
    return Array.isArray(v) ? v : []
  }

  let n = Number(myne)
  if (!Number.isInteger(n) || n < 1) n = 1
  if (n > laaste) n = laaste

  /* Selfregstelling — sien punt 1 hierbo. */
  while (n < laaste && weekVoltooi(klaarVan(n))) n++

  const wag = weekVoltooi(klaarVan(n))
  return {
    nommer: n,
    wag,
    /* Die week wat kom. Nooit verby 52 nie. */
    volgende: wag && n < 52 ? n + 1 : null,
    begin: hetBegin(modus, klaarVan(n)),
  }
}
