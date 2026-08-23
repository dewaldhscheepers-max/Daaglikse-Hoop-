/* ────────────────────────────────────────────────────────────
   Saam dra — die gesprekke waarby JY gaan sit het.

   Dewald: "Die doel is dat ondersteuning 'n voortdurende gesprek word en
   nie net een los opmerking nie."

   Dit is die hele verskil tussen 'n muur en 'n gemeenskap. Iemand skryf een
   sin onder 'n vreemdeling se storie, gaan weg, en kom nooit weer daar uit
   nie — nie omdat hy nie omgee nie, maar omdat daar geen PAD terug is nie.
   Op 'n muur van veertig plasings kry hy daardie een nooit weer nie.

   Hierdie leer is die pad terug.

   ── Waarom dit op die FOON le en nie op 'n bediener nie ──

   Om dit op 'n bediener te hou, sou beteken ons stoor "toestel X het onder
   storie Y geskryf" as 'n ding wat OPGEVRA kan word. Dit is presies die
   soort rekord wat 'n anonieme muur nie mag he nie: wie dit lees, sien wie
   wie ondersteun.

   Op die foon is dit net 'n lys van id's in localStorage. Dit oorleef nie
   'n herinstallasie nie, en dit is die regte kant om op te fouteer.

   Die leer is SUIWER — die berging kom van buite af. Dit is die enigste
   manier om "drie dae gelede" te toets sonder om drie dae te wag.
   ──────────────────────────────────────────────────────────── */

export const SLEUTEL = 'sorg_saamdra'

/* Hoeveel gesprekke onthou word. Iemand wat elke dag iemand bemoedig, se
   lys sou andersins vir altyd groei en die oortjie sou onbruikbaar word —
   'n mens dra nie tweehonderd gesprekke nie. Die nuutste bly. */
export const MAKS = 60

/* ── Lees ──

   Alles wat nie 'n behoorlike inskrywing is nie, val stil uit. 'n Ou vorm,
   'n halwe skryf, iemand wat met die gereedskapstuk gespeel het — niks
   daarvan mag die oortjie leeg laat lyk nie. */
export function lees(rou) {
  let x
  try { x = JSON.parse(rou || '[]') } catch { return [] }
  if (!Array.isArray(x)) return []
  const uit = []
  const gesien = new Set()
  for (const r of x) {
    if (!r || typeof r !== 'object') continue
    const id = String(r.id || '').trim()
    if (!id || gesien.has(id)) continue
    gesien.add(id)
    uit.push({
      id,
      wanneer: String(r.wanneer || ''),
      /* Wat ons van die gesprek geweet het toe ons laas daar was. Dit is hoe
         "Nuwe antwoord" bepaal word sonder om iets by die bediener te vra. */
      gesienWoorde: Number(r.gesienWoorde) || 0,
    })
  }
  return uit.slice(0, MAKS)
}

/* ── Skryf: ek het by hierdie mens gaan sit ──

   Dit skuif 'n gesprek waarby 'n mens AL was, boontoe — 'n tweede woord op
   dieselfde storie beteken hy is nog daar, en dan hoort dit bo. */
export function voegBy(lys, id, { wanneer = '', woorde = 0 } = {}) {
  const skoon = String(id || '').trim()
  if (!skoon) return lys
  const res = lys.filter(r => r.id !== skoon)
  return [{ id: skoon, wanneer, gesienWoorde: Number(woorde) || 0 }, ...res].slice(0, MAKS)
}

/* ── Ek het nou daar gekyk ──

   Dit merk die gesprek as gesien, sodat "Nuwe antwoord" verdwyn. Dit skuif
   dit NIE boontoe nie: kyk is nie dra nie. */
export function merkGesien(lys, id, woorde) {
  const skoon = String(id || '').trim()
  return lys.map(r => (
    r.id === skoon ? { ...r, gesienWoorde: Math.max(Number(woorde) || 0, r.gesienWoorde) } : r
  ))
}

export function verwyder(lys, id) {
  const skoon = String(id || '').trim()
  return lys.filter(r => r.id !== skoon)
}

/* ── Wat die oortjie wys ──

   Die lys op die foon dra net id's. Die WOORDE kom uit die muur wat reeds
   gelaai is — daar is dus geen tweede oproep nie, en 'n gesprek wat weg is
   (gerapporteer, verwyder) verdwyn eenvoudig uit die oortjie in plaas van
   om as 'n leë kaart te staan.

   `nou` kom van buite af sodat "vra weer" toetsbaar is. */
export const VRA_WEER_DAE = 2

export function saamDraLys(lys, plasings, nou = Date.now()) {
  const byId = new Map((plasings || []).filter(p => p && p.id).map(p => [p.id, p]))
  const uit = []
  for (const r of lys) {
    const p = byId.get(r.id)
    if (!p) continue
    const woorde = Number(p.woordeTotaal) || (Array.isArray(p.woorde) ? p.woorde.length : 0)
    const ms = Date.parse(r.wanneer || '')
    const dae = Number.isFinite(ms) ? Math.floor((nou - ms) / 86400000) : 0
    uit.push({
      plasing: p,
      /* Daar is iets nuuts sedert jy laas gekyk het. Dit is die hele rede
         waarom 'n mens hierdie oortjie oopmaak. */
      nuut: woorde > r.gesienWoorde,
      nuweWoorde: Math.max(0, woorde - r.gesienWoorde),
      dae,
      /* "Gaan vra weer hoe dit gaan." Twee dae, want 'n dag is te gou (die
         mens het dalk nog nie eers gelees nie) en 'n week is te laat.

         Dit vra NIE weer op 'n gesprek waar daar intussen nuwe woorde is
         nie — dan is die gesprek reeds aan die gang en 'n herinnering is
         net geraas. */
      vraWeer: dae >= VRA_WEER_DAE && woorde <= r.gesienWoorde,
    })
  }
  return uit
}
