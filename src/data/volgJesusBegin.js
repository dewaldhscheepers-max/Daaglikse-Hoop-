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
