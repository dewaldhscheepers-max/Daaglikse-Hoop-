/* Die onsuiwer helfte van Vandag se Tyd met God — die deel wat aan die foon
 * raak.
 *
 * `tydMetGod.js` bly suiwer sodat sy reëls sonder 'n blaaier getoets kan word.
 * Alles wat localStorage lees of skryf, staan hier. Dieselfde skeiding as
 * `kennisgewingStaat.js` (suiwer) teenoor `kennisgewingLees.js` (onsuiwer),
 * en om dieselfde rede.
 *
 * Elke skryf laat 'n `tmg-verander` waai. Die kaart op Luister lees dieselfde
 * sleutel, en `storage` vuur NIE in die oortjie wat geskryf het nie — sonder
 * hierdie gebeurtenis wys die kaart nog "BEGIN" nadat 'n mens halfpad deur die
 * vloei is.
 */

import { SLEUTEL, dagSleutel, leegStaat, rolDag, merkGeluister } from './tydMetGod.js'

export function leesStaat() {
  try {
    const rou = JSON.parse(localStorage.getItem(SLEUTEL) || 'null')
    return rolDag(rou || leegStaat(), dagSleutel())
  } catch { return leegStaat() }
}

export function skryfStaat(staat) {
  try { localStorage.setItem(SLEUTEL, JSON.stringify(staat)) } catch {}
  try { window.dispatchEvent(new CustomEvent('tmg-verander')) } catch {}
  return staat
}

/* Luister se hero roep dit wanneer iemand vandag se boodskap speel, sodat die
   vloei se eerste skerm dit kan afvink in plaas van dieselfde boodskap 'n
   tweede keer aan te bied.

   Dit mag NOOIT gooi nie: dit sit binne-in `countTodayPlay`, en 'n uitsondering
   daar sou die speeltelling breek — vir 'n merkie wat niks kos nie. */
export function merkGeluisterNou(notaId) {
  try {
    const s = merkGeluister(leesStaat(), notaId)
    skryfStaat(s)
    return s
  } catch { return null }
}
