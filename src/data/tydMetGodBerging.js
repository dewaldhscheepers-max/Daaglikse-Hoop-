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

import { SLEUTEL, dagSleutel, leegStaat, rolDag, merkGeluister, merkGebid } from './tydMetGod.js'

export function leesStaat() {
  try {
    const rou = JSON.parse(localStorage.getItem(SLEUTEL) || 'null')
    return rolDag(rou || leegStaat(), dagSleutel())
  } catch {
    /* Ook hier deur `rolDag`, en dit is nie netheid nie. `leegStaat()` het 'n
       LEE `dag` en `maand`; skryf 'n mens dit terug, wis die volgende lees dit
       weer uit — want die dag verskil. 'n Gebed op die muur, aangeteken op 'n
       foon met stukkende berging, was dus weg voor die klaar-skerm dit kon
       wys. */
    return rolDag(leegStaat(), dagSleutel())
  }
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

/* ── 'n Gebed op die MUUR tel ook ──
 *
 * "Hierdie maand het jy vir 5 mense gebid" het net getel wat BINNE die vloei
 * gebeur het. Wie op Bid Saam vir tien mense gebid het en die vloei se een
 * stap oorgeslaan het, het 'n nul gesien — en dan lieg die reël oor die enigste
 * ding wat hy die maand gedoen het.
 *
 * Dewald: "een aksie, een databron, oral dieselfde resultaat." Die gebed is
 * dieselfde gebed, waar hy ook al gedruk word, en die getal is dieselfde getal.
 *
 * Dit kan nie DUBBEL tel nie, en dit is nie 'n toevalligheid nie: albei paaie
 * skryf `prayedFor` en albei weier 'n versoek wat reeds daarin staan. Elke
 * versoek tel dus presies een keer, op watter skerm dit ook al gebeur het.
 *
 * Dit mag NOOIT gooi nie: dit sit binne-in die muur se knoppie, en 'n
 * uitsondering daar sou 'n gebed kos vir 'n getal wat niks kos nie. */
export function merkGebidNou() {
  try {
    const s = merkGebid(leesStaat())
    skryfStaat(s)
    return s
  } catch { return null }
}
