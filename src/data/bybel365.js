/* ── Die hele Bybel in 365 dae — al die besluite, sonder 'n skerm ──
 *
 * Die plan self staan in `public/bybel365.json` en word GEHAAL, nie gebundel
 * nie: 29 KB is niks vir wie die plan doen, en dit is 29 KB wat elke ander
 * mens nooit aflaai nie. Dieselfde besluit as die GAB se 66 boeke.
 *
 * Hierdie leer is suiwer. Alles wat kan wissel — die plan, wat gelees is —
 * kom van buite af in, sodat die reëls sonder 'n blaaier getoets kan word.
 *
 * ── Die twee besluite wat saak maak ──
 *
 * 1. VORDERING IS PER HOOFSTUK, nie per dag nie. 'n Mens lees twee van die
 *    drie, sy foon lui, en sy kom vanaand terug. Tel ons per dag, is daardie
 *    twee weg en sy begin oor. Dit is die vinnigste manier om iemand op dag
 *    drie te verloor.
 *
 * 2. DIE HUIDIGE DAG IS DIE EERSTE ONVOLTOOIDE DAG, nooit 'n datum nie.
 *    'n Plan wat aan die kalender vasgemaak is, straf wie 'n naweek mis: sy
 *    maak die app oop en is "vier dae agter", en dan hou sy op. Hier skuif
 *    die dag wanneer SY klaarmaak. Vandaar ook die naam: 365 dae se LEES, nie
 *    365 kalenderdae nie.
 *
 * Dieselfde reël as VOLG JESUS se `vj_my_week` en die ander leesplanne se
 * `lastDayKey`.
 */

/* Waar die gelese hoofstukke op die foon lê. Een sleutel, een lys. Dit is die
   WAARHEID; alles anders word daaruit afgelei. */
export const SLEUTEL = 'b365_gelees'

/* ── En 'n klein opsomming, net vir die kaart op die leesplan-lys ──
 *
 * Daardie kaart moet "Gaan voort — dag 47" kan sê. Om die DAG te weet, moet 'n
 * mens die plan hê, en die plan is 'n 29 KB-aflaai — dit is te veel om te
 * haal net om 'n kaart te teken wat dalk nooit gedruk word nie.
 *
 * Dus skryf die skerm twee getalle hierheen elke keer as iets verander.
 * EEN skrywer, en die waarheid bly `b365_gelees`: raak hierdie sleutel weg of
 * verkeerd, wys die kaart hoogstens 'n ou getal — die plan self tel altyd uit
 * die hoofstukke. Sonder dit sou die kaart "Begin die plan" gesê het vir
 * iemand wat op dag 47 is, en 'n kaart wat lieg is erger as een wat swyg. */
export const STAND_SLEUTEL = 'b365_stand'

export function standUit(plan, gelees) {
  const v = vordering(plan, gelees)
  return { dag: huidigeDag(plan, gelees), hoofstukke: v.gelees, dae: v.dae }
}

/* Hoe 'n hoofstuk in daardie lys lyk. Die boekkode kom uit die GAB, dieselfde
   kode wat `open-bybel` verwag — daar word niks ontleed op 'n foon nie. */
export function sleutelVir(boek, hoofstuk) {
  return `${String(boek || '').trim()} ${Number(hoofstuk) || 0}`
}

/* Die leeste van een dag, as 'n gewone voorwerp. Die JSON is kort geskryf
   (`{d, l:[[boek, hoofstuk, spoor]]}`) omdat dit 365 keer herhaal; die skerm
   moet nie daardie vorm ken nie. */
export function leesteVan(dag) {
  if (!dag || !Array.isArray(dag.l)) return []
  return dag.l.map(([boek, hoofstuk, spoor]) => ({
    boek, hoofstuk, spoor: spoor || 'verhaal',
    sleutel: sleutelVir(boek, hoofstuk),
  }))
}

export function dagVan(plan, n) {
  const dae = (plan && plan.dae) || []
  return dae.find(d => d.d === Number(n)) || null
}

/* Is elke hoofstuk van hierdie dag gelees? */
export function dagKlaar(dag, gelees) {
  const lys = leesteVan(dag)
  if (!lys.length) return false
  const stel = gelees instanceof Set ? gelees : new Set(gelees || [])
  return lys.every(l => stel.has(l.sleutel))
}

/* ── Waar staan hierdie mens ──
 *
 * Die EERSTE dag wat nie klaar is nie. Is alles klaar, gee ons die laaste dag
 * terug — nie 366 nie, want daar is geen dag 366 om te wys nie.
 *
 * Dit is 'n lus oor hoogstens 365 dae met 'n `Set`-opsoek per hoofstuk. Dit
 * loop een keer wanneer die skerm oopmaak; dit is nie 'n warm pad nie. */
export function huidigeDag(plan, gelees) {
  const dae = (plan && plan.dae) || []
  if (!dae.length) return 1
  const stel = gelees instanceof Set ? gelees : new Set(gelees || [])
  for (const d of dae) if (!dagKlaar(d, stel)) return d.d
  return dae[dae.length - 1].d
}

export function allesKlaar(plan, gelees) {
  const dae = (plan && plan.dae) || []
  if (!dae.length) return false
  const stel = gelees instanceof Set ? gelees : new Set(gelees || [])
  return dae.every(d => dagKlaar(d, stel))
}

/* ── Die getalle op die skerm ──
 *
 * Die noemer kom uit die PLAN, nooit uit wat gelees is. Tel 'n mens 'n
 * hoofstuk wat nie in die plan staan nie — 'n ou sleutel, 'n handgeskrewe
 * inskrywing — mag dit die persentasie nie verby honderd stoot nie. */
export function vordering(plan, gelees) {
  const totaal = Number(plan && plan.totaalHoofstukke) || 0
  const stel = gelees instanceof Set ? gelees : new Set(gelees || [])
  const inPlan = new Set()
  for (const d of (plan && plan.dae) || []) {
    for (const l of leesteVan(d)) if (stel.has(l.sleutel)) inPlan.add(l.sleutel)
  }
  const klaar = inPlan.size
  return {
    gelees: klaar,
    totaal,
    persent: totaal ? Math.floor((klaar / totaal) * 100) : 0,
    /* Hoeveel HELE dae klaar is. Dit is die getal wat 'n mens aan iemand
       anders vertel, nie die hoofstukke nie. */
    dae: ((plan && plan.dae) || []).filter(d => dagKlaar(d, stel)).length,
    totaalDae: Number(plan && plan.totaalDae) || 0,
  }
}

/* ── Merk ──
 *
 * Suiwer: gee 'n NUWE lys terug. 'n Hoofstuk kan af- en aangeskakel word — 'n
 * mens wat per ongeluk tik, moet dit kan regmaak, anders lieg die telling vir
 * altyd. */
export function merk(gelees, sleutel, aan = true) {
  const stel = new Set(gelees || [])
  if (!sleutel) return [...stel]
  if (aan) stel.add(sleutel)
  else stel.delete(sleutel)
  return [...stel]
}

/* Die hele dag in een druk. Dit is die knoppie onderaan: wie al drie gelees
   het, moet nie drie keer tik nie. */
export function merkDag(gelees, dag, aan = true) {
  let uit = [...new Set(gelees || [])]
  for (const l of leesteVan(dag)) uit = merk(uit, l.sleutel, aan)
  return uit
}

/* ── Die spore ──
 *
 * Elke dag lees uit drie kante van die Bybel tegelyk. Dit is die rede waarom
 * 'n mens nie negentig dae lank net Levitikus kry nie — en dit is die enigste
 * ding wat hierdie plan van 'n gewone "lees van voor af" onderskei. */
export const SPORE = {
  verhaal: 'DIE VERHAAL',
  wysheid: 'WYSHEID EN PROFETE',
  jesus:   'JESUS EN DIE NUWE VERBOND',
}

export function spoorNaam(spoor) {
  return SPORE[spoor] || SPORE.verhaal
}
