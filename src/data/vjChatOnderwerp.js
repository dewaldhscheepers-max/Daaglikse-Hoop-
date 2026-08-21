/* ── Waaroor die groepchat praat ──
 *
 * Dewald het na sy eie groep se gesprek gekyk en gesien wat daar staan:
 * "help toets", "Plesier my dier", "Dankie", "Hi boet, dankie vir al jou
 * insperasie". Vier lede, en nie EEN boodskap oor die week se inhoud nie.
 *
 * Dit is nie omdat hulle nie wil nie. 'n Leë kassie wat "Skryf iets…" sê, vra
 * van elke mens om self 'n onderwerp uit te dink, en niemand wil die eerste
 * wees wat iets ernstigs sê nie. So val almal terug op wat veilig is.
 *
 * 'n Gesprek sonder 'n onderwerp word altyd 'n groetkanaal.
 *
 * Twee dinge staan hierin, en hulle los TWEE verskillende probleme op:
 *
 *   `onderwerp()`  — WAAROOR gepraat word. Dit staan bo-aan die chat en is
 *                    altyd daar; dit is nie 'n knoppie wat iemand moet gaan
 *                    soek nie, want die mens wat ons wil bereik, is juis die
 *                    een wat inkom, niks sien om oor te praat nie, en weer
 *                    uitgaan.
 *   `BEGINNE`      — HOE om te begin. Dit is 'n ander probleem: 'n mens kan
 *                    weet waaroor dit gaan en steeds nie weet hoe om die
 *                    eerste sin te skryf nie.
 *
 * Die vrae kom uit die week se GROEPSESSIE — dieselfde vrae wat 'n groep wat
 * bymekaarkom, gebruik. Dus is daar niks nuuts om te skryf nie: vul Week 3 se
 * sessie in soos altyd, en die chat kry sy onderwerp gratis.
 *
 * Dit kom uit die KODE, nie uit die openbare eindpunt nie. Die groepvrae is
 * doelbewus nie in daardie witlys nie (sien CLAUDE.md), en hierdie module is
 * nie 'n rede om daardie grens oop te maak nie.
 */

import { weekSessie } from './volgJesusDae.js'

/* OPENINGE, nie klaargemaakte sinne nie.
 *
 * Gee jy 'n mens vier voltooide sinne, tik almal dieselfde een en dan staan
 * daar vier identiese boodskappe — wat minder werd is as niks. 'n Opening
 * eindig middel-in en die mens moet self klaarmaak. */
export const BEGINNE = [
  { id: 'getref', woorde: 'Wat my getref het…', aanset: 'Wat my hierdie week getref het, is ' },
  { id: 'sukkel', woorde: 'Ek sukkel met…',     aanset: 'Ek sukkel met ' },
  { id: 'vraag',  woorde: 'Ek het ’n vraag…',   aanset: 'Ek het ’n vraag oor ' },
]

/* Die week se groepvrae, skoongemaak. 'n Leë string in die lys is 'n vraag wat
   nooit geskryf is nie — dit mag nooit as 'n leë kaart op die skerm beland
   nie. */
export function weekVrae(weeknommer) {
  const sessie = weekSessie(weeknommer)
  const vrae = sessie && Array.isArray(sessie.vrae) ? sessie.vrae : []
  return vrae.map(v => String(v == null ? '' : v).trim()).filter(Boolean)
}

/* Die onderwerp-kaart, of `null` as daar niks is om te wys nie.
 *
 * `null` is die belangrike geval: 'n week sonder groepvrae — of 'n weeknommer
 * wat nog nie bestaan nie — moet GEEN kaart wys nie. 'n Leë kaart bo-aan die
 * gesprek is erger as geen kaart, want dit vat plek en sê niks. */
export function onderwerp(weeknommer, indeks) {
  const vrae = weekVrae(weeknommer)
  if (!vrae.length) return null

  const n = Number(weeknommer)
  const week = Number.isInteger(n) && n >= 1 ? n : 1

  /* Die indeks rol om, en 'n rommelwaarde land op 0. Dit word deur 'n knoppie
     opgetel wat 'n mens onbeperk kan druk, dus moet dit nooit buite die lys
     val nie. */
  const rou = Number(indeks)
  const i = Number.isFinite(rou)
    ? ((Math.trunc(rou) % vrae.length) + vrae.length) % vrae.length
    : 0

  return {
    week,
    kop: `WEEK ${week} · PRAAT SAAM OOR`,
    vraag: vrae[i],
    indeks: i,
    aantal: vrae.length,
  }
}
