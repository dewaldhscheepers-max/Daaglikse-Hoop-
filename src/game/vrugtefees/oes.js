/* ────────────────────────────────────────────────────────────
   Die Oneindige Oes — die reels van 'n lopie.

   Hierdie lêer is die enigste plek waar die oes se reels leef. Die skerm
   voer dit in om te speel, en die bediener voer PRESIES DIESELFDE lêer in
   om 'n ingestuurde lopie oor te speel.

   Dit is die hele punt. Bou die Ark se ranglys moes raai of 'n lopie
   moontlik is — dit kon net vra "is veertig lyne met twaalf stukke fisies
   moontlik?" en die antwoord was 'n skatting. Hier hoef ons nie te raai
   nie. Die enjin is deterministies: dieselfde saad en dieselfde skuiwe gee
   altyd dieselfde bord en dieselfde punte. Die kliënt stuur die saad en sy
   lys skuiwe; die bediener speel dit oor en tel die punte SELF.

   Die kliënt se eie puntetelling word nooit geglo nie. Dit word nie eens
   ingestuur nie.

   Daarom mag hierdie lêer niks van die blaaier weet nie — geen window,
   geen Date, geen Math.random. Alles wat 'n toevalsgetal nodig het, kom
   uit 'n saad. As dit ooit verander, dryf die twee kante uitmekaar en dan
   verwerp die bediener eerlike spelers. Die toetse in oes.toets.mjs speel
   lopies oor en kyk dat dieselfde saad altyd dieselfde antwoord gee.
   ──────────────────────────────────────────────────────────── */

import { maakBord, maakRng, doenSkuif, versekerSkuif } from './enjin.js'

/* Die bord. Ses soorte, geen versperrings: 'n oop tuin waar dit net oor
   die oes gaan. Sonder versperrings is die lopie ook goedkoper om oor te
   speel, en die bediener moet dit vinnig kan doen. */
export const OES_SOORTE  = 6
export const OES_KOLOMME = 8
export const OES_RYE     = 8

export const BEGIN_SKUIWE  = 25   // waarmee 'n mens begin
export const RONDE_SKUIWE   = 9   // wat elke voltooide ronde bysit
export const RONDE_BONUS    = 400 // maal die rondenommer

/* Hoeveel van die gevraagde vrug elke ronde verg.

   My eerste raaiskoot was 18 met 4 by elke ronde, en toe ek dit gemeet het,
   was die "oneindige" oes in ronde een dood — die gemiddelde speler het
   NUL rondes klaargemaak. 'n Modus wat oneindig heet en by die eerste hek
   toemaak, is 'n leuen.

   Agt met drie by is gemeet, nie geraai nie: 'n goeie speler haal omtrent
   sewe rondes, 'n gemiddelde een drie, en niemand kry nul nie. Die eerste
   ronde moet 'n mens INLAAT.

   Let op dat die teiken lineêr groei terwyl elke ronde 'n vaste aantal
   skuiwe teruggee. Daarom eindig elke lopie noodwendig, hoe goed 'n mens
   ook al speel — die bediener se perk op die aantal skuiwe kan dus nooit
   'n eerlike speler afsny nie. */
export function rondeTeiken(ronde) {
  return 8 + (ronde - 1) * 3
}

/* Watter vrug 'n ronde vra. Dit kom uit sy EIE saad, nie uit die lopie se
   lopende rng nie. As dit die lopende rng gebruik het, sou die volgorde
   van oproepe tussen skerm en bediener presies moes ooreenstem, en dan is
   een verdwaalde oproep genoeg om eerlike lopies te laat sak. So is dit
   'n suiwer funksie van (saad, ronde) en kan dit nie verskuif nie. */
export function rondeVrug(saad, ronde) {
  const r = maakRng(saad * 7919 + ronde * 104729 + 13)
  return Math.floor(r() * OES_SOORTE) % OES_SOORTE
}

/* ── Begin 'n lopie ── */
export function beginOes(saad) {
  const s = saad | 0
  const bord = maakBord({
    kolomme: OES_KOLOMME, rye: OES_RYE, soorte: OES_SOORTE, saad: s,
  })
  return {
    saad: s,
    bord,
    rng: maakRng(s * 977 + 17),
    punte: 0,
    ronde: 1,
    soort: rondeVrug(s, 1),
    teiken: rondeTeiken(1),
    het: 0,
    skuiweOor: BEGIN_SKUIWE,
    skuiweGedoen: 0,
    grootsteKetting: 0,
    grootstePas: 0,
    spesiaalGemaak: 0,
    kombinasies: 0,
    rondesKlaar: 0,
    klaar: false,
  }
}

/* ── Een skuif ──
   Gee dieselfde vorm terug as die enjin se doenSkuif, plus wat van die
   lopie geword het. 'n Ongeldige skuif verander niks en kos niks: die
   enjin raak nie aan die bord as magRuil nee sê nie. */
export function oesSkuif(lopie, a, b) {
  if (lopie.klaar) return { geldig: false, stappe: [], rede: 'die lopie is klaar' }

  const uit = doenSkuif(lopie.bord, a, b, { rng: lopie.rng })
  if (!uit.geldig) return { ...uit, rede: 'nie \'n geldige ruil nie' }

  lopie.punte += uit.punte
  lopie.het   += uit.versamel[lopie.soort] || 0
  lopie.grootsteKetting = Math.max(lopie.grootsteKetting, uit.grootsteKetting)
  lopie.grootstePas     = Math.max(lopie.grootstePas, uit.grootstePas || 0)
  lopie.spesiaalGemaak += uit.spesiaalGemaak
  lopie.kombinasies    += uit.kombinasies
  lopie.skuiweOor  -= 1
  lopie.skuiweGedoen += 1

  /* 'n Ronde klaar. Ons gee hoogstens een ronde per skuif, selfs al het 'n
     groot ketting genoeg vir twee gebring — anders kan een gelukkige
     kettingreaksie die hele lopie oorspring. */
  let rondeKlaar = false
  if (lopie.het >= lopie.teiken) {
    rondeKlaar = true
    lopie.rondesKlaar += 1
    lopie.punte     += lopie.ronde * RONDE_BONUS
    lopie.skuiweOor += RONDE_SKUIWE
    lopie.ronde     += 1
    lopie.soort  = rondeVrug(lopie.saad, lopie.ronde)
    lopie.teiken = rondeTeiken(lopie.ronde)
    lopie.het    = 0
  }

  /* Die bord kan doodloop. Skommel kos nooit 'n skuif nie, en die saad kom
     uit die telling skuiwe wat gedoen is — 'n getal wat albei kante presies
     eners bereken. */
  const skommel = versekerSkuif(lopie.bord, lopie.saad + lopie.skuiweGedoen * 31)

  if (lopie.skuiweOor <= 0) {
    lopie.skuiweOor = 0
    lopie.klaar = true
  }

  return { ...uit, rondeKlaar, skommel }
}

/* ── Speel 'n lys skuiwe oor ──
   Dit is wat die bediener doen. `skuiwe` is 'n plat lys van viertalle
   [ak, ar, bk, br] — plat, want dit gaan oor die draad en 'n paar honderd
   skuiwe as objekte is onnodig lomp.

   Ons stop by die EERSTE skuif wat nie klop nie en sê waar. 'n Eerlike
   kliënt stuur nooit 'n ongeldige skuif nie, want hy speel dieselfde kode.

   `maksSkuiwe` bind hoeveel werk 'n enkele versoek kan kos. Sonder dit kan
   iemand 'n lys van 'n miljoen skuiwe stuur en die bediener laat sit. */
export function herspeel(saad, skuiwe, { maksSkuiwe = 3000 } = {}) {
  if (!Number.isInteger(saad) || saad < 0 || saad > 2147483647)
    return { ok: false, fout: 'saad buite perke' }
  if (!Array.isArray(skuiwe))
    return { ok: false, fout: 'geen skuiwe' }
  if (skuiwe.length > maksSkuiwe)
    return { ok: false, fout: 'te veel skuiwe' }

  let lopie
  try { lopie = beginOes(saad) } catch { return { ok: false, fout: 'kon nie die bord bou nie' } }

  for (let i = 0; i < skuiwe.length; i++) {
    const s = skuiwe[i]
    if (!Array.isArray(s) || s.length !== 4 || !s.every(n => Number.isInteger(n) && n >= 0 && n <= 7))
      return { ok: false, fout: `skuif ${i + 1} is nie 'n geldige paar nie` }
    if (lopie.klaar)
      return { ok: false, fout: `skuif ${i + 1} kom na die lopie klaar was` }

    const uit = oesSkuif(lopie, { k: s[0], r: s[1] }, { k: s[2], r: s[3] })
    if (!uit.geldig)
      return { ok: false, fout: `skuif ${i + 1} is nie moontlik op daardie bord nie` }
  }

  return {
    ok: true,
    punte: lopie.punte,
    rondes: lopie.rondesKlaar,
    skuiwe: lopie.skuiweGedoen,
    skuiweOor: lopie.skuiweOor,
    grootsteKetting: lopie.grootsteKetting,
    klaar: lopie.klaar,
  }
}

/* ── Vandag se Oes ──
   Almal speel dieselfde bord. Die saad kom uit die datum in UTC, sodat
   die dag oral op dieselfde oomblik omdraai en niemand deur 'n tydsone te
   kies 'n tweede beurt kry nie.

   Neem 'n Date in, eerder as om self Date.now() te roep, sodat hierdie
   lêer suiwer bly en die toetse enige dag kan naboots. */
export function dagSleutel(d) {
  const j = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const g = String(d.getUTCDate()).padStart(2, '0')
  return `${j}-${m}-${g}`
}

export function dagSaad(sleutel) {
  // FNV-1a oor die datumstring. Ons wil net 'n stabiele, goed verspreide
  // getal hê; enige kant kan dit uit die sleutel alleen herbereken.
  let h = 2166136261
  for (let i = 0; i < sleutel.length; i++) {
    h ^= sleutel.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) % 2000000000
}

export function isDagSleutel(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
}
