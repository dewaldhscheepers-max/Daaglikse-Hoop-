/* ────────────────────────────────────────────────────────────
   Klink hierdie Dra Mekaar-boodskap soos 'n GEBEDSVERSOEK?

   Dewald, 21 Oktober 2026, met 'n skermkiekie van die vorm: *"Mense hou steeds
   aan om op dra mekaar gebeds versoeke te plaas."* Die afrit na Bid Saam het
   bo die kassie gestaan, en mense het steeds verby hom getik.

   Hierdie besluit loop wanneer iemand DRUK om te plaas. Klink die woorde soos
   'n gebedsversoek, vra die vorm een keer of dit eerder op Bid Saam moet gaan —
   met die woorde saam. Sê sy "nee, ek soek raad", gaan dit deur soos altyd.

   Twee dinge is met opset:

   · 'n FOUT KOS NIKS. Lees ons 'n raadsvraag verkeerd as 'n gebed, druk sy een
     keer "Nee" en dit gaan deur. Mis ons 'n gebedsversoek, is dit net soos
     vandag. Daarom vra die reëls na wat 'n VERSOEK lees ("bid vir my", "julle
     gebede"), nie na elke keer wat die woord "bid" voorkom nie — "ek bid elke
     aand" is iemand wat raad vra en self bid.
   · KRISIS gaan nooit Bid Saam toe nie (`magVoorstel`). 'n Storie oor
     selfmoordgedagtes moet deur 'n MENS op Dra Mekaar gaan; Bid Saam se muur
     is direk vanaf die kliënt en het geen mens tussenin nie.

   Suiwer: geen window, geen DOM. Toetse in sorgGebedVraag.toets.mjs.
   ──────────────────────────────────────────────────────────── */

function skoon(teks) {
  return String(teks == null ? '' : teks)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[’‘`]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/* Elke patroon lees soos iemand wat VRA dat ander bid. */
const PATRONE = [
  // "bid vir my", "bid asseblief vir ons", "bid tog vir my seun"
  /\bbid (asseblief |asb |tog |net |ook )*(saam )?vir (my|ons|hom|haar|hulle|my\s\w+|ons\s\w+)\b/,
  /\b(sal|kan|wil) (julle|jy|u|iemand|mense) (asseblief |tog |net |ook )*(vir (my|ons|hom|haar|hulle)\s+)?bid\b/,
  /\bbid (asseblief|asb|tog)\b/,
  /\bbid saam\b/,
  /\bgebedsversoeke?\b/,
  /\b(julle|jul|u|jou|almal se) gebede\b/,
  /\bgebed(e)? (asseblief|asb|nodig|gevra|vra)\b/,
  /\b(het|soek) (ek|ons) gebed(e)?\b/,
  /\b(ek|ons) (vra|soek|benodig) (vir )?gebed(e)?\b/,
  /\bhou (my|ons|hom|haar|hulle) in (jou|julle|u) gebede\b/,
  /\bonthou (my|ons|hom|haar|hulle) in (jou|julle|u)? ?gebed(e)?\b/,
  /\bin (jou|julle|u) gebede\b/,
  /\bdra (my|ons|hom|haar|hulle) in gebed\b/,
  // Engels, vir wie dit so tik
  /\bpray(ing)? for (me|us|him|her|them|my)\b/,
  /\bprayer requests?\b/,
  /\bplease pray\b/,
]

export function klinkSoosGebed(teks) {
  const t = skoon(teks)
  if (t.length < 6) return false
  return PATRONE.some(p => p.test(t))
}

/* Mag die vorm voorstel dat dit Bid Saam toe gaan?
   Net as dit soos 'n gebed klink EN daar geen krisiswoorde in is nie, en net
   een keer per boodskap — sê sy "nee", vra ons nie weer nie. */
export function magVoorstel({ teks, krisis = false, reedsGevra = false } = {}) {
  if (reedsGevra || krisis) return false
  return klinkSoosGebed(teks)
}

/* Bid Saam se kassie vat 500 karakters (sien SorgVorm se naBidSaam). */
export const BID_SAAM_MAKS = 500
