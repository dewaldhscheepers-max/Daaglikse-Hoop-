/* ────────────────────────────────────────────────────────────
   Die Tuinreis — die reels van een fase.

   Dieselfde storie as oes.js, en om dieselfde rede. Hierdie lêer is die
   enigste plek waar 'n fase se reels leef. Die skerm voer dit in om te
   speel, en die bediener voer PRESIES DIESELFDE lêer in om 'n ingestuurde
   fase oor te speel.

   'n Fase is 'n beter geval as 'n oes-lopie, nie 'n slegter een: die saad
   staan in vrugtefeesVlakke.js vas. Die kliënt kies dus niks. Hy stuur die
   fasenommer en sy lys skuiwe, die bediener bou daardie presiese bord uit
   die data wat hy self het, speel die skuiwe oor, en kyk of die doelwit
   werklik behaal is. Die kliënt se puntetelling word nooit gestuur nie.

   Daarom mag hierdie lêer niks van die blaaier weet nie — geen window,
   geen Date.now(), geen Math.random(). Dieselfde reel as oes.js: as dit
   ooit verander, dryf kliënt en bediener uitmekaar en dan verwerp die
   bediener EERLIKE spelers.
   ──────────────────────────────────────────────────────────── */

import { maakBord, maakRng, doenSkuif, versekerSkuif } from './enjin.js'
import { VLAKKE, vlakBy, doelBehaal } from '../../data/vrugtefeesVlakke.js'

/* Punte vir skuiwe wat oorbly wanneer jy wen. Dit staan hier saam met die
   res van die reels, sodat die bediener dieselfde som doen. */
export const OOR_BONUS = 90

export function beginVlakLopie(nr) {
  const v = vlakBy(nr)
  if (!v) return null
  const bord = maakBord({ saad: v.saad, soorte: v.soorte, blokke: v.blokke || null })
  return {
    vlak: v,
    bord,
    rng: maakRng(v.saad * 977 + 17),
    stand: {
      punte: 0, versamel: {}, spesiaalGemaak: 0, kombinasies: 0,
      grootsteKetting: 0, grootstePas: 0, spesiaalSoorte: {}, verlig: {},
      blokkeAanBegin: bord.selle.filter(s => s.blok).length,
    },
    skuiweOor: v.skuiwe,
    skuiweGedoen: 0,
    klaar: false,
    gewen: false,
  }
}

/* Een skuif. Gee dieselfde vorm terug as die enjin se doenSkuif, plus wat
   van die fase geword het. 'n Ongeldige skuif verander niks en kos niks. */
export function reisSkuif(lopie, a, b) {
  if (lopie.klaar) return { geldig: false, stappe: [], rede: 'die fase is klaar' }

  const uit = doenSkuif(lopie.bord, a, b, { rng: lopie.rng })
  if (!uit.geldig) return { ...uit, rede: 'nie \'n geldige ruil nie' }

  const st = lopie.stand
  st.punte += uit.punte
  for (const [i, n] of Object.entries(uit.versamel)) st.versamel[i] = (st.versamel[i] || 0) + n
  st.spesiaalGemaak += uit.spesiaalGemaak
  st.kombinasies += uit.kombinasies
  st.grootsteKetting = Math.max(st.grootsteKetting, uit.grootsteKetting)
  st.grootstePas = Math.max(st.grootstePas, uit.grootstePas || 0)
  for (const [soort, n] of Object.entries(uit.spesiaalSoorte || {}))
    st.spesiaalSoorte[soort] = (st.spesiaalSoorte[soort] || 0) + n
  for (const [k, r] of uit.geveeSelle || []) st.verlig[k + ',' + r] = true

  lopie.skuiweOor -= 1
  lopie.skuiweGedoen += 1

  /* Die bord kan doodloop. Skommel kos nooit 'n skuif nie, en die saad kom
     uit die fase se eie saad plus die skuiwe wat oorbly — 'n getal wat albei
     kante presies eners bereken. */
  const skommel = versekerSkuif(lopie.bord, lopie.vlak.saad + lopie.skuiweOor * 31)

  if (doelBehaal(lopie.vlak.doel, st, lopie.bord)) {
    st.punte += lopie.skuiweOor * OOR_BONUS
    lopie.gewen = true
    lopie.klaar = true
  } else if (lopie.skuiweOor <= 0) {
    lopie.skuiweOor = 0
    lopie.klaar = true
  }

  return { ...uit, skommel, gewen: lopie.gewen, klaar: lopie.klaar }
}

/* ── Speel 'n fase oor ──
   Dit is wat die bediener doen. `skuiwe` is 'n plat lys viertalle
   [ak, ar, bk, br].

   Ons aanvaar dit net as die doelwit WERKLIK behaal is. 'n Lys skuiwe wat
   die fase nie klaarmaak nie, is nie 'n voltooiing nie, hoeveel punte dit
   ook al opgetel het. */
export function herspeelVlak(nr, skuiwe) {
  if (!Number.isInteger(nr) || nr < 1 || nr > VLAKKE.length)
    return { ok: false, fout: 'onbekende fase' }
  if (!Array.isArray(skuiwe) || !skuiwe.length)
    return { ok: false, fout: 'geen skuiwe' }

  const vlak = vlakBy(nr)
  /* Geen fase kan met meer skuiwe gewen word as wat dit gee nie. Dit bind
     ook die werk wat 'n enkele versoek kan kos. */
  if (skuiwe.length > vlak.skuiwe)
    return { ok: false, fout: 'meer skuiwe as wat die fase toelaat' }

  let lopie
  try { lopie = beginVlakLopie(nr) } catch { return { ok: false, fout: 'kon nie die bord bou nie' } }
  if (!lopie) return { ok: false, fout: 'onbekende fase' }

  for (let i = 0; i < skuiwe.length; i++) {
    const s = skuiwe[i]
    if (!Array.isArray(s) || s.length !== 4 || !s.every(n => Number.isInteger(n) && n >= 0 && n <= 7))
      return { ok: false, fout: `skuif ${i + 1} is nie 'n geldige paar nie` }
    if (lopie.klaar)
      return { ok: false, fout: `skuif ${i + 1} kom na die fase klaar was` }

    const uit = reisSkuif(lopie, { k: s[0], r: s[1] }, { k: s[2], r: s[3] })
    if (!uit.geldig)
      return { ok: false, fout: `skuif ${i + 1} is nie moontlik op daardie bord nie` }
  }

  if (!lopie.gewen)
    return { ok: false, fout: 'daardie skuiwe maak nie die fase klaar nie' }

  return {
    ok: true,
    vlak: nr,
    punte: lopie.stand.punte,
    skuiwe: lopie.skuiweGedoen,
    skuiweOor: lopie.skuiweOor,
    grootsteKetting: lopie.stand.grootsteKetting,
  }
}

export const AANTAL_VLAKKE = VLAKKE.length
