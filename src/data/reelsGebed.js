/* ── DIE GEBEDSKAART IN DIE VOER ──
 *
 * Dewald, 14 September 2026, met sy eie ontwerp aangeheg: *"dont code. what
 * about this.. Los die e-boeks uit."* — EEN kaart, 'n gebedskaart, een keer per
 * dag, ná die 5de clip, waarby 'n mens net so verby kan swiep. En daarna:
 * *"net as ek op deel gebedsversoek kliek...... word Daaglikse Hoop
 * ondersteuner moet bietjie groter."*
 *
 * Hierdie lêer is suiwer. Die skerm staan in `src/components/ReelsGebedKaart.jsx`
 * en die berging in `Reels.jsx`; hier staan net die besluite.
 *
 * ── Wat hierdie kaart is, en wat hy NIE is nie ──
 *
 * Dit is dieselfde besluit as Vandag se Tyd met God s'n: dit SKEP NIKS. Die
 * knoppie maak die BESTAANDE gebedsvorm op Bid Saam oop, tot IN die kassie
 * (`bidsaam_fokus`, dieselfde vlag wat SorgVorm.jsx al gebruik), en die twee
 * klein skakels onder maak die BESTAANDE skenk-vorms oop (`open-donation` en
 * `open-hoop-vennoot`). Daar is geen tweede gebedsmuur, geen tweede betaalpad,
 * en geen tikkassie in die voer nie.
 *
 * Daardie laaste een is nie 'n detail nie: 'n vrye teksblok wat DIREK op die
 * muur land, gaan verby die krisis-keuring wat SorgVorm en Bid Saam reeds doen,
 * en 'n sleutelbord in 'n snap-voer veg in elk geval met die voer.
 *
 * ── Net die KNOPPIE navigeer ──
 *
 * Dewald se eie regstelling, en dit is die belangrikste besluit hierin. 'n
 * Volskerm-tikteiken in 'n swiep-voer vuur op SWIEP-bedoeling: sy trek op, haar
 * vinger lig 'n oomblik, en sy is skielik op 'n ander skerm. Dan voel die kaart
 * soos 'n strik en die volgende keer swiep sy vinniger daaroor.
 *
 * ── Een keer per dag, ná die 5de clip ──
 *
 * Vroeër was daar 'n voorstel van 'n kaart elke agt clips. Dit is ses vrae in
 * een sessie, en dit is 'n tolhek. Een keer per dag is die hele verskil.
 *
 * Vyf clips is waar sy self besluit het om aan te hou — dieselfde logika as
 * `magVraInstalleer()` s'n, net later, want hierdie vraag vra meer van 'n mens
 * as 'n installasie.
 *
 * ── Die VREEMDELING op 'n gedeelde skakel sien hom NIE ──
 *
 * Sy word reeds gevra om die app te installeer (`SWIEPE_VOOR_VRA_GEDEEL`), en
 * twee volskerm-vrae op een besoek is presies die tolhek wat hierdie app oral
 * elders vermy. Sy het op ÉÉN ding gedruk om ÉÉN video te sien.
 *
 * ── Die ondersteuner-reël, en die een reël wat nie skuif nie ──
 *
 * Die reël staan op die KAART, en hy is met opset bietjie groter as die
 * klein ry op Tyd met God se klaar-skerm — Dewald het dit so gevra.
 *
 * Maar hy mag NIE saam met haar deur die knoppie gaan nie. Die app se eie reël,
 * uit hierdie kodebasis se geskiedenis: *"Nooit geld op 'n dag wat iemand iets
 * in die gebedskassie getik het nie... Iemand wat pas geskryf het dat sy huwelik
 * in stukke lê, is nie die mens vir 'n R50-vraag drie skerms later nie."*
 *
 * Dus twee dinge:
 *
 *   · druk sy DEEL MY GEBEDSVERSOEK, word die dag as gevra gemerk. Sy is op pad
 *     om haar hart neer te skryf; daar kom vandag geen opspringer meer nie —
 *     nie donasie nie, nie 'n e-boek nie;
 *   · en is die dag REEDS gevra (sy het vanoggend deur Tyd met God gegaan en
 *     daar getik), val die ondersteuner-reël van die kaart af weg. Die
 *     UITNODIGING om te bid bly staan; dit is nie 'n geldvraag nie.
 */

/* Ná hoeveel clips die kaart staan. Sy is dan by die 6de ding in die voer, dus
   het sy vyf clips gekyk. */
export const NA_KLIPS = 5

/* Watter dag die kaart laas gewys is. Dieselfde vorm as `lastPopupDate` s'n —
   'n ISO-datum in UTC — sodat "vandag" in hierdie app EEN ding beteken en nie
   twee. */
export const GEBED_DAG = 'reels_gebed_dag'

/* Die dag, presies soos App.jsx dit oral elders skryf. Suiwer: die klok kom van
   buite af. */
export function dagVan(nou) {
  const d = nou instanceof Date ? nou : new Date(nou == null ? Date.now() : nou)
  const t = d.getTime()
  if (!Number.isFinite(t)) return ''
  return d.toISOString().slice(0, 10)
}

/* Mag die kaart vandag in hierdie voer staan? */
export function magWysGebed(f) {
  const d = f || {}
  /* 'n Vreemdeling op 'n gedeelde skakel word nie gevra nie. Sien die kop. */
  if (d.gedeel) return false
  const vandag = String(d.vandag || '')
  if (!vandag) return false
  return String(d.laasGewys || '') !== vandag
}

/* Mag die ondersteuner-reël op die kaart staan? Nie op 'n dag wat daar reeds oor
   geld gepraat is nie. */
export function magWysSteun(f) {
  const d = f || {}
  const vandag = String(d.vandag || '')
  if (!vandag) return false
  return String(d.dagGevra || '') !== vandag
}

/* ── Waar die kaart in die lys beland ──
 *
 * Ná `na` clips, en NET as daar nog iets ná hom kom. 'n Kaart heel onderaan die
 * gebouide voer is 'n doodloopstraat: sy swiep verby en daar is niks — en die
 * hele punt is dat 'n mens hom net so mag verbygaan.
 *
 * Dit raak die inset-lys nie aan nie en dit voeg presies EEN kaart by.
 */
export function voegGebedIn(items, opsies) {
  const lys = Array.isArray(items) ? [...items] : []
  const o = opsies || {}
  if (!o.wys) return lys
  const na = Math.max(1, Number(o.na) || NA_KLIPS)
  /* Streng groter: by gelykheid sou die kaart die LAASTE ding wees. */
  if (lys.length <= na) return lys
  lys.splice(na, 0, { tipe: 'gebed' })
  return lys
}
