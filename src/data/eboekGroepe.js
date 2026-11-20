/* ────────────────────────────────────────────────────────────
   Die e-boekblad in DRIE groepe.

   Dewald, 20 November 2026: *"die 2 nuutste boeke bo... en dan, mees
   afgelaaide boeke: 5 mees afgelaaide boeke ooit... en dan al die ander
   boeke... die app moet dit altyd outomaties doen"*, en *"die top 5 moet my
   mees famous boeke wees"* — dus ALLE TYD, nie die afgelope maand nie. Net
   die Afrikaanse blad; /english bly soos hy is.

   ── Die reëls ──
   · NUUT: die twee boeke met die jongste tyd (`boekTyd`). 'n Vaste boek in
     books.js het geen tyd nie en is dus nooit "nuut" nie.
   · GEWILD: die vyf met die meeste aflaaie, uit die boeke wat NIE reeds by
     nuut staan nie. Is 'n nuwe boek ook gewild, staan hy net bo, en die
     volgende gewilde boek skuif op — daar bly vyf. 'n Boek met nul aflaaie
     is nooit "gewild" nie.
   · AL DIE ANDER: wat oorbly, in die bestaande orde (uitgelig, dan nuutste).
   · Geen boek twee keer nie.

   Kom die tellings nie (die bediener is af, nog nooit bereken nie), is daar
   geen gewild-groep nie — die blad lyk dan net soos voorheen, met nuut bo.

   Suiwer: die boeke en die tellings kom van buite, niks van die klok nie.
   ──────────────────────────────────────────────────────────── */
import { boekTyd, sorteerNuutsteBo } from './eboekeVolgorde.js'

export const AANTAL_NUUT = 2
export const AANTAL_GEWILD = 5

/* `tellings`: [{ bookId, aantal }] of { [bookId]: aantal }. */
export function telKaart(tellings) {
  const kaart = new Map()
  if (Array.isArray(tellings)) {
    for (const t of tellings) {
      if (t && typeof t.bookId === 'string' && Number.isFinite(t.aantal) && t.aantal > 0) kaart.set(t.bookId, t.aantal)
    }
  } else if (tellings && typeof tellings === 'object') {
    for (const [id, n] of Object.entries(tellings)) if (Number.isFinite(n) && n > 0) kaart.set(id, n)
  }
  return kaart
}

export function groepeerBoeke(boeke, tellings, opsies = {}) {
  const nNuut = opsies.nuut ?? AANTAL_NUUT
  const nGewild = opsies.gewild ?? AANTAL_GEWILD
  const lys = (Array.isArray(boeke) ? boeke : []).filter(b => b && b.id)
  /* Een boek, een keer — ook as die lys hom twee keer dra. */
  const gesien = new Set()
  const uniek = lys.filter(b => (gesien.has(b.id) ? false : (gesien.add(b.id), true)))

  const nuut = uniek
    .map((b, i) => ({ b, i, tyd: boekTyd(b) }))
    .filter(r => r.tyd > 0)
    .sort((x, y) => (y.tyd - x.tyd) || (x.i - y.i))
    .slice(0, nNuut)
    .map(r => r.b)
  const nuutIds = new Set(nuut.map(b => b.id))

  const kaart = telKaart(tellings)
  const gewild = uniek
    .filter(b => !nuutIds.has(b.id) && kaart.has(b.id))
    .map((b, i) => ({ b, i, n: kaart.get(b.id) }))
    .sort((x, y) => (y.n - x.n) || (x.i - y.i))
    .slice(0, nGewild)
    .map(r => r.b)
  const gewildIds = new Set(gewild.map(b => b.id))

  const res = sorteerNuutsteBo(uniek.filter(b => !nuutIds.has(b.id) && !gewildIds.has(b.id)))
  return { nuut, gewild, res, aantalVan: id => kaart.get(id) || 0 }
}
