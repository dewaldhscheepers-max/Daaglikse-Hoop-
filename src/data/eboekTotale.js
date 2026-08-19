/* ── Die twee getalle bo-aan die e-boekblad ──
 *
 *     8 866+  e-boeke afgelaai
 *     R576 540+  se e-boeke gratis weggegee
 *
 * Dewald het VOLG JESUS hierby gevoeg: "almal wat daar op daai page kliek begin
 * alleen of in 'n groep moet getel word by die eboeke ... Tel R280 vir elke
 * persoon wat die program doen."
 *
 * Dit is reg, en dit is nie 'n truuk nie: 'n mens wat die program doen, kry 'n
 * jaar se materiaal wat hy nie betaal het nie. Dit hoort by dieselfde sin —
 * "hoop behoort nie net beskikbaar te wees vir mense wat kan betaal nie."
 *
 * ── Waarom dit hier staan en nie in die skerm nie ──
 *
 * Hierdie som het al een keer 'n fout gehad wat soos 'n feit gelyk het: die
 * teller het van 7 681 na 8 545 gespring omdat 'n vaste getal by 'n lewende een
 * gevoeg is sonder om te kyk. 'n Som wat 'n mens aan die wêreld wys, moet
 * getoets kan word — en 'n som binne-in 'n JSX-blok kan dit nie.
 *
 * ── Die reël wat alles hier bind ──
 *
 * Ontbreek EEN bron, wys ons NIKS. Nie 'n nul nie en nie 'n halwe som nie: 'n
 * getal wat eers laer is en dan spring, is 'n getal wat 'n mens nie weer glo.
 */

/* Wat 'n mens sou betaal het. */
export const BOEK_WAARDE = 110
export const VJ_WAARDE = 280

/* Wat voor die lewende tellers gebeur het en nie meer beweeg nie. Dit is
   geskiedenis, nie 'n raaiskoot: die e-boeke wat weggegee is voordat die app
   self getel het. */
export const VASTE_BOEKE = 3000
export const VASTE_WAARDE = 150000

/* `null` beteken "ons weet nog nie", en dit moet ANDERS wees as nul.
 *
 * `Number(null)` is 0, en dus sou 'n bron wat nog nie gelaai het nie, as 'n
 * egte nul deurgekom het — en dan wys die blad 'n te lae getal wat 'n oomblik
 * later spring. Dit is presies die fout wat hierdie som al een keer gehad het. */
const heel = w => {
  if (w === null || w === undefined || w === '' || typeof w === 'boolean') return null
  const n = Number(w)
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null
}

/* Gee { boeke, waarde } — of { boeke: null, waarde: null } as enige bron nog
   nie daar is nie. */
export function eboekTotale({ rgCount, liveCount, liveValue, vjDoen } = {}) {
  const rg = heel(rgCount)
  const lc = heel(liveCount)
  const lw = heel(liveValue)
  /* VOLG JESUS is die JONGSTE bron en mag nie die res ophou nie. Val daardie
     eindpunt om, is die antwoord 0 — die twee getalle bly reg, hulle is net
     kleiner. 'n Blad wat op 'n teller wag, is erger as 'n effens laer getal. */
  const vj = heel(vjDoen) ?? 0

  if (rg === null || lc === null || lw === null) return { boeke: null, waarde: null }

  return {
    boeke: rg + VASTE_BOEKE + lc + vj,
    waarde: rg * BOEK_WAARDE + VASTE_WAARDE + lw + vj * VJ_WAARDE,
  }
}
