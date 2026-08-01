/* ────────────────────────────────────────────────────────────
   Vrugtefees — die enjin.

   Suiwer logika. Geen React, geen DOM, geen tydsberekening. Alles hier
   loop net so goed in Node as in die blaaier, wat beteken ons kan dit met
   duisende sade toets sonder om 'n blaaier oop te maak — en later dieselfde
   kode op die bediener laat loop om 'n lopie na te speel.

   Twee reëls hou hierdie lêer eerlik:

     1. Niks hier raak die skerm nie. Elke stap gee 'n lys GEBEURE terug wat
        die skerm kan animeer. Die logika weet nie hoe lank 'n animasie
        neem nie en wag nie daarvoor nie.

     2. Alle ewekansigheid kom uit 'n saad. Dieselfde saad plus dieselfde
        skuiwe gee altyd dieselfde bord. Sonder dit kan 'n telling nooit
        nagegaan word nie.
   ──────────────────────────────────────────────────────────── */

export const VRUGTE = [
  'liefde', 'vreugde', 'vrede', 'geduld', 'vriendelikheid',
  'goedheid', 'getrouheid', 'sagmoedigheid', 'selfbeheersing',
]

/* ── Spesiale vrugte ──
   Name uit die fees self, nie uit ander speletjies nie. */
export const RYLIG        = 'rylig'        // vier langs mekaar → vee 'n ry
export const KOLOMLIG     = 'kolomlig'     // vier bo-op mekaar → vee 'n kolom
export const OESKRAG      = 'oeskrag'      // T- of L-vorm → vee 'n area
export const REENBOOGVRUG = 'reenboog'     // vyf in 'n streep → vee 'n hele soort
export const FEESMANDJIE  = 'feesmandjie'  // skaars; vee 'n breë kruis

/* ── Versperrings ── */
export const DROE_BLAAR = 'droeblaar'   // 1 slag, langsaan
export const ONKRUID    = 'onkruid'     // 2 slae
export const DORING     = 'doring'      // 3 slae
export const KLIP       = 'klip'        // blokkeer beweging tot dit weg is
export const KRAT       = 'krat'        // 2 slae, hou 'n vrug vas

const SLAE = { [DROE_BLAAR]: 1, [ONKRUID]: 2, [DORING]: 3, [KLIP]: 2, [KRAT]: 2 }

// 'n Versperring wat op 'n sel sit, keer dat die vrug daar geruil of geval
// kan word. Droë blare en onkruid lê ONDER die vrug; klippe en kratte vat
// die sel heeltemal.
const BEDEK = new Set([KLIP, KRAT])

export function bedekSel(sel) {
  return !!sel.blok && BEDEK.has(sel.blok)
}

/* ── Saadgedrewe ewekansigheid ──
   mulberry32. Klein, vinnig, en dieselfde in Node en die blaaier. */
export function maakRng(saad) {
  let a = saad >>> 0
  return function rng() {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ── Bord ──
   Die bord is 'n plat lys van selle. Elke sel:
     { vrug, spesiaal, blok, blokSlae }
   'n Leë sel het vrug === null. */

export function selIndeks(bord, k, r) { return r * bord.kolomme + k }
export function selBy(bord, k, r) {
  if (k < 0 || r < 0 || k >= bord.kolomme || r >= bord.rye) return null
  return bord.selle[r * bord.kolomme + k]
}

function leeSel() { return { vrug: null, spesiaal: null, blok: null, blokSlae: 0 } }

export function kloonBord(bord) {
  return {
    kolomme: bord.kolomme,
    rye: bord.rye,
    soorte: bord.soorte,
    selle: bord.selle.map(s => ({ ...s })),
  }
}

/* ── Passings vind ──
   Ons soek horisontale en vertikale lope van drie of meer. 'n Sel kan aan
   albei behoort; dit is presies wat 'n T of L is. */
export function vindLope(bord) {
  const lope = []
  const { kolomme, rye } = bord

  for (let r = 0; r < rye; r++) {
    let begin = 0
    for (let k = 1; k <= kolomme; k++) {
      const vorige = selBy(bord, k - 1, r)
      const huidige = k < kolomme ? selBy(bord, k, r) : null
      const selfde = huidige && vorige && huidige.vrug !== null &&
                     huidige.vrug === vorige.vrug &&
                     !bedekSel(huidige) && !bedekSel(vorige)
      if (!selfde) {
        const lengte = k - begin
        if (lengte >= 3 && vorige && vorige.vrug !== null) {
          lope.push({ rigting: 'h', k: begin, r, lengte, vrug: vorige.vrug })
        }
        begin = k
      }
    }
  }

  for (let k = 0; k < kolomme; k++) {
    let begin = 0
    for (let r = 1; r <= rye; r++) {
      const vorige = selBy(bord, k, r - 1)
      const huidige = r < rye ? selBy(bord, k, r) : null
      const selfde = huidige && vorige && huidige.vrug !== null &&
                     huidige.vrug === vorige.vrug &&
                     !bedekSel(huidige) && !bedekSel(vorige)
      if (!selfde) {
        const lengte = r - begin
        if (lengte >= 3 && vorige && vorige.vrug !== null) {
          lope.push({ rigting: 'v', k, r: begin, lengte, vrug: vorige.vrug })
        }
        begin = r
      }
    }
  }
  return lope
}

function loopSelle(loop) {
  const uit = []
  for (let i = 0; i < loop.lengte; i++) {
    uit.push(loop.rigting === 'h' ? [loop.k + i, loop.r] : [loop.k, loop.r + i])
  }
  return uit
}

/* Groepeer oorvleuelende lope. Twee lope wat 'n sel deel is een figuur —
   dis hoe ons 'n T of 'n L herken. */
export function vindGroepe(bord) {
  const lope = vindLope(bord)
  if (!lope.length) return []

  const groepe = []
  const gebruik = new Set()

  for (let i = 0; i < lope.length; i++) {
    if (gebruik.has(i)) continue
    const groep = [i]
    gebruik.add(i)
    const selle = new Set(loopSelle(lope[i]).map(([k, r]) => k + ',' + r))
    let gegroei = true
    while (gegroei) {
      gegroei = false
      for (let j = 0; j < lope.length; j++) {
        if (gebruik.has(j)) continue
        if (lope[j].vrug !== lope[i].vrug) continue
        const eie = loopSelle(lope[j])
        if (eie.some(([k, r]) => selle.has(k + ',' + r))) {
          gebruik.add(j); groep.push(j); gegroei = true
          eie.forEach(([k, r]) => selle.add(k + ',' + r))
        }
      }
    }
    const lys = groep.map(x => lope[x])
    groepe.push({
      vrug: lope[i].vrug,
      lope: lys,
      selle: [...selle].map(s => s.split(',').map(Number)),
      langste: Math.max(...lys.map(l => l.lengte)),
      hoek: lys.length > 1,
    })
  }
  return groepe
}

/* Watter spesiale vrug verdien hierdie figuur?
   Volgorde is belangrik: vyf in 'n streep klop 'n hoek. */
export function spesiaalVir(groep) {
  if (groep.langste >= 5) return REENBOOGVRUG
  if (groep.hoek) return OESKRAG
  if (groep.langste === 4) {
    return groep.lope[0].rigting === 'h' ? RYLIG : KOLOMLIG
  }
  return null
}

/* ── Bord maak ──
   Vul die bord sonder om 'n enkele passing te laat staan, en herbegin as
   daar geen geldige skuif is nie. */
export function maakBord({ kolomme = 8, rye = 8, soorte = 6, saad = 1, blokke = null } = {}) {
  const rng = maakRng(saad)
  for (let poging = 0; poging < 200; poging++) {
    const bord = { kolomme, rye, soorte, selle: [] }
    for (let i = 0; i < kolomme * rye; i++) bord.selle.push(leeSel())

    if (blokke) {
      for (const b of blokke) {
        const sel = selBy(bord, b.k, b.r)
        if (sel) { sel.blok = b.tipe; sel.blokSlae = SLAE[b.tipe] || 1 }
      }
    }

    for (let r = 0; r < rye; r++) {
      for (let k = 0; k < kolomme; k++) {
        const sel = selBy(bord, k, r)
        if (bedekSel(sel)) continue
        // Kies 'n vrug wat nie dadelik 'n passing maak nie
        const verbode = new Set()
        const l1 = selBy(bord, k - 1, r), l2 = selBy(bord, k - 2, r)
        if (l1 && l2 && l1.vrug !== null && l1.vrug === l2.vrug) verbode.add(l1.vrug)
        const b1 = selBy(bord, k, r - 1), b2 = selBy(bord, k, r - 2)
        if (b1 && b2 && b1.vrug !== null && b1.vrug === b2.vrug) verbode.add(b1.vrug)

        const keuses = []
        for (let v = 0; v < soorte; v++) if (!verbode.has(v)) keuses.push(v)
        sel.vrug = keuses[Math.floor(rng() * keuses.length)]
      }
    }

    if (vindLope(bord).length === 0 && hetGeldigeSkuif(bord)) return bord
  }
  throw new Error('kon nie \'n geldige bord bou nie')
}

/* ── Is hierdie ruil toegelaat? ──
   Twee spesiale vrugte mag altyd ruil. Andersins moet die ruil 'n passing
   maak, anders is dit nie 'n skuif nie en kos dit niks. */
export function isBuurman(a, b) {
  return Math.abs(a.k - b.k) + Math.abs(a.r - b.r) === 1
}

export function magRuil(bord, a, b) {
  if (!isBuurman(a, b)) return false
  const sa = selBy(bord, a.k, a.r), sb = selBy(bord, b.k, b.r)
  if (!sa || !sb) return false
  if (bedekSel(sa) || bedekSel(sb)) return false
  if (sa.vrug === null || sb.vrug === null) return false
  if (sa.spesiaal && sb.spesiaal) return true
  if (sa.spesiaal === REENBOOGVRUG || sb.spesiaal === REENBOOGVRUG) return true

  const proef = kloonBord(bord)
  ruilSelle(proef, a, b)
  return vindLope(proef).length > 0
}

function ruilSelle(bord, a, b) {
  const ia = selIndeks(bord, a.k, a.r), ib = selIndeks(bord, b.k, b.r)
  const t = bord.selle[ia]
  bord.selle[ia] = bord.selle[ib]
  bord.selle[ib] = t
}

/* ── Is daar enige geldige skuif? ── */
export function hetGeldigeSkuif(bord) {
  return !!vindEersteSkuif(bord)
}

export function vindEersteSkuif(bord) {
  for (let r = 0; r < bord.rye; r++) {
    for (let k = 0; k < bord.kolomme; k++) {
      for (const [dk, dr] of [[1, 0], [0, 1]]) {
        const a = { k, r }, b = { k: k + dk, r: r + dr }
        if (b.k >= bord.kolomme || b.r >= bord.rye) continue
        if (magRuil(bord, a, b)) return { a, b }
      }
    }
  }
  return null
}

/* ── Skommel ──
   Hou versperrings presies waar hulle is; skud net die los vrugte om.
   Die nuwe bord mag nie 'n gratis passing hê nie en moet 'n skuif hê. */
export function skommel(bord, saad) {
  const rng = maakRng(saad)
  const posisies = []
  const vrugte = []
  for (let r = 0; r < bord.rye; r++) {
    for (let k = 0; k < bord.kolomme; k++) {
      const sel = selBy(bord, k, r)
      if (bedekSel(sel) || sel.vrug === null) continue
      posisies.push([k, r])
      vrugte.push({ vrug: sel.vrug, spesiaal: sel.spesiaal })
    }
  }
  for (let poging = 0; poging < 300; poging++) {
    for (let i = vrugte.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[vrugte[i], vrugte[j]] = [vrugte[j], vrugte[i]]
    }
    posisies.forEach(([k, r], i) => {
      const sel = selBy(bord, k, r)
      sel.vrug = vrugte[i].vrug
      sel.spesiaal = vrugte[i].spesiaal
    })
    if (vindLope(bord).length === 0 && hetGeldigeSkuif(bord)) return true
  }
  return false
}

/* ── Punte ──
   Klein vaste waarde per vrug, meer vir langer passings, en 'n
   ketting-vermenigvuldiger wat met elke cascade groei. Vaardige spel moet
   duidelik beter tel as lukraak ruil. */
export const PUNTE = {
  vrug: 30,
  lengte: { 3: 1, 4: 1.6, 5: 2.4 },
  hoek: 2.0,
  spesiaalGemaak: 120,
  spesiaalGebruik: 60,
  kombinasie: 400,
  versperring: 50,
  skuifOor: 90,
}

export function kettingMaal(ketting) {
  // 1, 1.5, 2, 2.5 ... met 'n plafon sodat 'n lang cascade nie ontplof nie
  return Math.min(1 + (ketting - 1) * 0.5, 6)
}

/* ────────────────────────────────────────────────────────────
   Die oplossing van 'n skuif.

   doenSkuif() gee 'n lys STAPPE terug. Elke stap is een ding wat op die
   skerm moet gebeur, in volgorde. Die skerm animeer hulle een vir een; die
   logika is klaar teen die tyd dat die eerste animasie begin. So kan die
   speler nooit die bord in 'n halwe toestand vang nie.
   ──────────────────────────────────────────────────────────── */

const sleutel = (k, r) => k + ',' + r
const uitSleutel = s => s.split(',').map(Number)

/* Wat vee hierdie spesiale vrug? Gee die selle terug, en enige ander
   spesiale vrugte wat daardeur aan die gang gesit word. */
function veegVanSpesiaal(bord, k, r, soort, vrugSoort) {
  const uit = []
  const { kolomme, rye } = bord
  if (soort === RYLIG) {
    for (let x = 0; x < kolomme; x++) uit.push([x, r])
  } else if (soort === KOLOMLIG) {
    for (let y = 0; y < rye; y++) uit.push([k, y])
  } else if (soort === OESKRAG) {
    for (let y = r - 1; y <= r + 1; y++)
      for (let x = k - 1; x <= k + 1; x++)
        if (selBy(bord, x, y)) uit.push([x, y])
  } else if (soort === FEESMANDJIE) {
    for (let x = 0; x < kolomme; x++) { uit.push([x, r]); if (r > 0) uit.push([x, r - 1]); if (r < rye - 1) uit.push([x, r + 1]) }
    for (let y = 0; y < rye; y++) { uit.push([k, y]); if (k > 0) uit.push([k - 1, y]); if (k < kolomme - 1) uit.push([k + 1, y]) }
  } else if (soort === REENBOOGVRUG) {
    // Op sy eie (deur 'n ontploffing geraak) vat dit een soort saam
    const doel = vrugSoort != null ? vrugSoort : null
    if (doel === null) return [[k, r]]
    for (let y = 0; y < rye; y++)
      for (let x = 0; x < kolomme; x++) {
        const s = selBy(bord, x, y)
        if (s && s.vrug === doel && !bedekSel(s)) uit.push([x, y])
      }
    uit.push([k, r])
  }
  return uit
}

/* Twee spesiale vrugte saam. Elke paar het sy eie, duidelike gevolg. */
function kombinasieVee(bord, a, b, sa, sb) {
  const paar = [sa.spesiaal, sb.spesiaal].sort().join('+')
  const uit = []
  const voegRy = r => { for (let x = 0; x < bord.kolomme; x++) uit.push([x, r]) }
  const voegKol = k => { for (let y = 0; y < bord.rye; y++) uit.push([k, y]) }
  const voegArea = (k, r, straal) => {
    for (let y = r - straal; y <= r + straal; y++)
      for (let x = k - straal; x <= k + straal; x++)
        if (selBy(bord, x, y)) uit.push([x, y])
  }
  const alleVan = soort => {
    for (let y = 0; y < bord.rye; y++)
      for (let x = 0; x < bord.kolomme; x++) {
        const s = selBy(bord, x, y)
        if (s && s.vrug === soort && !bedekSel(s)) uit.push([x, y])
      }
  }

  switch (paar) {
    // 'n Kruis: die hele ry en die hele kolom
    case [RYLIG, KOLOMLIG].sort().join('+'):
    case [RYLIG, RYLIG].sort().join('+'):
    case [KOLOMLIG, KOLOMLIG].sort().join('+'):
      voegRy(b.r); voegKol(b.k)
      return { selle: uit, naam: 'kruis' }

    // Lig plus krag: drie rye en drie kolomme
    case [RYLIG, OESKRAG].sort().join('+'):
    case [KOLOMLIG, OESKRAG].sort().join('+'):
      for (let d = -1; d <= 1; d++) { if (b.r + d >= 0 && b.r + d < bord.rye) voegRy(b.r + d) }
      for (let d = -1; d <= 1; d++) { if (b.k + d >= 0 && b.k + d < bord.kolomme) voegKol(b.k + d) }
      return { selle: uit, naam: 'breekruis' }

    // Krag plus krag: 'n groot sirkel
    case [OESKRAG, OESKRAG].sort().join('+'):
      voegArea(b.k, b.r, 2)
      return { selle: uit, naam: 'groot-oes' }

    // Reënboog plus 'n lig: elke vrug van daardie soort word 'n lig
    case [REENBOOGVRUG, RYLIG].sort().join('+'):
    case [REENBOOGVRUG, KOLOMLIG].sort().join('+'): {
      const ander = sa.spesiaal === REENBOOGVRUG ? sb : sa
      const soort = ander.vrug
      const rigting = ander.spesiaal
      const selle = []
      for (let y = 0; y < bord.rye; y++)
        for (let x = 0; x < bord.kolomme; x++) {
          const s = selBy(bord, x, y)
          if (s && s.vrug === soort && !bedekSel(s)) selle.push([x, y])
        }
      selle.forEach(([x, y]) => {
        if (rigting === RYLIG) voegRy(y); else voegKol(x)
      })
      uit.push([a.k, a.r], [b.k, b.r])
      return { selle: uit, naam: 'ligreën' }
    }

    // Reënboog plus krag: elke vrug van daardie soort ontplof
    case [REENBOOGVRUG, OESKRAG].sort().join('+'): {
      const ander = sa.spesiaal === REENBOOGVRUG ? sb : sa
      const soort = ander.vrug
      const punte = []
      for (let y = 0; y < bord.rye; y++)
        for (let x = 0; x < bord.kolomme; x++) {
          const s = selBy(bord, x, y)
          if (s && s.vrug === soort && !bedekSel(s)) punte.push([x, y])
        }
      punte.forEach(([x, y]) => voegArea(x, y, 1))
      uit.push([a.k, a.r], [b.k, b.r])
      return { selle: uit, naam: 'oesstorm' }
    }

    // Twee reënboë: die hele bord
    case [REENBOOGVRUG, REENBOOGVRUG].sort().join('+'):
      for (let y = 0; y < bord.rye; y++)
        for (let x = 0; x < bord.kolomme; x++) uit.push([x, y])
      return { selle: uit, naam: 'volle-fees' }

    // Feesmandjie saam met enigiets: die breë kruis, en die ander werk ook
    default: {
      const va = veegVanSpesiaal(bord, a.k, a.r, sa.spesiaal, sb.vrug)
      const vb = veegVanSpesiaal(bord, b.k, b.r, sb.spesiaal, sa.vrug)
      return { selle: [...va, ...vb, [a.k, a.r], [b.k, b.r]], naam: 'fees' }
    }
  }
}

/* Versamel alles wat gevee moet word, en laat spesiale vrugte wat in die
   ontploffing beland self ook afgaan. */
function bouVeeg(bord, begin, alReedsVeilig) {
  const teVee = new Set()
  const wagtery = [...begin]
  const veilig = alReedsVeilig || new Set()

  while (wagtery.length) {
    const [k, r] = wagtery.shift()
    const s = selBy(bord, k, r)
    if (!s) continue
    const sl = sleutel(k, r)
    if (teVee.has(sl)) continue
    if (bedekSel(s)) continue           // klippe en kratte word langsaan geraak
    if (s.vrug === null) continue
    teVee.add(sl)
    if (s.spesiaal && !veilig.has(sl)) {
      const meer = veegVanSpesiaal(bord, k, r, s.spesiaal, s.vrug)
      meer.forEach(p => wagtery.push(p))
    }
  }
  return teVee
}

/* Skade aan versperrings. Onderliggende versperrings kry 'n slag wanneer
   die vrug bo-op hulle verdwyn; bedekkende versperrings kry 'n slag
   wanneer iets LANGS hulle verdwyn. */
function slaanVersperrings(bord, geveeSleutels) {
  const geraak = []
  const langsaan = new Set()

  for (const sl of geveeSleutels) {
    const [k, r] = uitSleutel(sl)
    const sel = selBy(bord, k, r)
    if (sel && sel.blok && !BEDEK.has(sel.blok)) {
      sel.blokSlae -= 1
      geraak.push({ k, r, tipe: sel.blok, oor: Math.max(0, sel.blokSlae) })
      if (sel.blokSlae <= 0) { sel.blok = null; sel.blokSlae = 0 }
    }
    for (const [dk, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) langsaan.add(sleutel(k + dk, r + dr))
  }

  for (const sl of langsaan) {
    if (geveeSleutels.has(sl)) continue
    const [k, r] = uitSleutel(sl)
    const sel = selBy(bord, k, r)
    if (!sel || !sel.blok || !BEDEK.has(sel.blok)) continue
    sel.blokSlae -= 1
    geraak.push({ k, r, tipe: sel.blok, oor: Math.max(0, sel.blokSlae) })
    if (sel.blokSlae <= 0) {
      const wasKrat = sel.blok === KRAT
      sel.blok = null; sel.blokSlae = 0
      if (!wasKrat) sel.vrug = null       // klip laat 'n leë sel wat hervul word
      else sel.vrug = null                // die krat gee sy vrug af by hervul
    }
  }
  return geraak
}

/* Swaartekrag. Bedekte selle is 'n vloer: niks val daardeur nie. */
function laatVal(bord, rng) {
  const bewegings = []
  const nuwe = []
  for (let k = 0; k < bord.kolomme; k++) {
    let skryf = bord.rye - 1
    for (let r = bord.rye - 1; r >= 0; r--) {
      const sel = selBy(bord, k, r)
      if (bedekSel(sel)) {
        // alles bo hierdie punt val net tot hier
        for (let y = skryf; y > r; y--) {
          const leeg = selBy(bord, k, y)
          if (leeg.vrug === null) {
            leeg.vrug = Math.floor(rng() * bord.soorte)
            leeg.spesiaal = null
            nuwe.push({ k, r: y, vrug: leeg.vrug })
          }
        }
        skryf = r - 1
        continue
      }
      if (sel.vrug !== null) {
        if (skryf !== r) {
          const doel = selBy(bord, k, skryf)
          doel.vrug = sel.vrug; doel.spesiaal = sel.spesiaal
          sel.vrug = null; sel.spesiaal = null
          bewegings.push({ van: [k, r], na: [k, skryf] })
        }
        skryf -= 1
      }
    }
    for (let y = skryf; y >= 0; y--) {
      const leeg = selBy(bord, k, y)
      if (bedekSel(leeg)) break
      leeg.vrug = Math.floor(rng() * bord.soorte)
      leeg.spesiaal = null
      nuwe.push({ k, r: y, vrug: leeg.vrug })
    }
  }
  return { bewegings, nuwe }
}

/* ── Een skuif, van begin tot einde ── */
export function doenSkuif(bord, a, b, { rng, telVersamel = true } = {}) {
  const stappe = []
  const versamel = {}        // vrug-indeks → hoeveel
  const versperrings = {}    // tipe → hoeveel weg
  let punte = 0
  let grootsteKetting = 0
  let spesiaalGemaak = 0
  let kombinasies = 0

  if (!magRuil(bord, a, b)) {
    stappe.push({ tipe: 'ongeldig', a, b })
    return { geldig: false, stappe, punte: 0, versamel, versperrings,
             grootsteKetting: 0, spesiaalGemaak: 0, kombinasies: 0 }
  }

  const sa0 = { ...selBy(bord, a.k, a.r) }
  const sb0 = { ...selBy(bord, b.k, b.r) }
  ruilSelle(bord, a, b)
  stappe.push({ tipe: 'ruil', a, b })

  // Ná die ruil sit sa0 se inhoud op b, en sb0 s'n op a.
  const opA = selBy(bord, a.k, a.r)   // was sb0
  const opB = selBy(bord, b.k, b.r)   // was sa0

  let beginVeeg = null
  let veilig = new Set()

  if (sa0.spesiaal && sb0.spesiaal) {
    const uit = kombinasieVee(bord, a, b, opA, opB)
    beginVeeg = uit.selle
    veilig = new Set([sleutel(a.k, a.r), sleutel(b.k, b.r)])
    kombinasies += 1
    punte += PUNTE.kombinasie
    stappe.push({ tipe: 'kombinasie', naam: uit.naam, a, b })
  } else if (sa0.spesiaal === REENBOOGVRUG || sb0.spesiaal === REENBOOGVRUG) {
    // Reënboog geruil met 'n gewone vrug: vat elke vrug van daardie soort
    const reenSel = sa0.spesiaal === REENBOOGVRUG ? opB : opA
    const reenPos = sa0.spesiaal === REENBOOGVRUG ? b : a
    const anderSoort = sa0.spesiaal === REENBOOGVRUG ? sb0.vrug : sa0.vrug
    const selle = []
    for (let y = 0; y < bord.rye; y++)
      for (let x = 0; x < bord.kolomme; x++) {
        const s = selBy(bord, x, y)
        if (s && s.vrug === anderSoort && !bedekSel(s)) selle.push([x, y])
      }
    selle.push([reenPos.k, reenPos.r])
    beginVeeg = selle
    veilig = new Set([sleutel(reenPos.k, reenPos.r)])
    kombinasies += 1
    punte += PUNTE.kombinasie
    stappe.push({ tipe: 'kombinasie', naam: 'reënboog', a, b })
  }

  let ketting = 0
  let eersteRonde = true

  for (;;) {
    let teVee
    let groepe = []

    if (eersteRonde && beginVeeg) {
      teVee = bouVeeg(bord, beginVeeg, veilig)
    } else {
      groepe = vindGroepe(bord)
      if (!groepe.length) break
      const begin = []
      groepe.forEach(g => g.selle.forEach(p => begin.push(p)))
      teVee = bouVeeg(bord, begin, new Set())
    }
    eersteRonde = false
    if (!teVee.size) break

    ketting += 1
    grootsteKetting = Math.max(grootsteKetting, ketting)
    const maal = kettingMaal(ketting)

    // Nuwe spesiale vrugte: een per figuur, op die sel waar die speler geruil het
    const nuweSpesiaal = []
    for (const g of groepe) {
      const soort = spesiaalVir(g)
      if (!soort) continue
      const opRuil = g.selle.find(([k, r]) =>
        (k === a.k && r === a.r) || (k === b.k && r === b.r))
      const plek = opRuil || g.selle[Math.floor(g.selle.length / 2)]
      nuweSpesiaal.push({ k: plek[0], r: plek[1], soort, vrug: g.vrug })
      punte += PUNTE.spesiaalGemaak
      spesiaalGemaak += 1
    }

    let rondePunte = 0
    for (const sl of teVee) {
      const [k, r] = uitSleutel(sl)
      const sel = selBy(bord, k, r)
      if (!sel || sel.vrug === null) continue
      if (telVersamel) versamel[sel.vrug] = (versamel[sel.vrug] || 0) + 1
      if (sel.spesiaal) rondePunte += PUNTE.spesiaalGebruik
      rondePunte += PUNTE.vrug
    }
    for (const g of groepe) {
      const lengteMaal = PUNTE.lengte[Math.min(5, g.langste)] || 2.4
      rondePunte += PUNTE.vrug * g.selle.length * (lengteMaal - 1)
      if (g.hoek) rondePunte += PUNTE.vrug * PUNTE.hoek
    }
    punte += Math.round(rondePunte * maal)

    const geraak = slaanVersperrings(bord, teVee)
    geraak.filter(v => v.oor === 0).forEach(v => {
      versperrings[v.tipe] = (versperrings[v.tipe] || 0) + 1
    })

    for (const sl of teVee) {
      const [k, r] = uitSleutel(sl)
      const sel = selBy(bord, k, r)
      if (sel) { sel.vrug = null; sel.spesiaal = null }
    }

    for (const ns of nuweSpesiaal) {
      const sel = selBy(bord, ns.k, ns.r)
      if (sel && !bedekSel(sel)) { sel.vrug = ns.vrug; sel.spesiaal = ns.soort }
    }

    stappe.push({
      tipe: 'vee',
      selle: [...teVee].map(uitSleutel),
      spesiaalGemaak: nuweSpesiaal,
      versperrings: geraak,
      ketting,
      punte: Math.round(rondePunte * maal),
    })

    const val = laatVal(bord, rng)
    stappe.push({ tipe: 'val', ...val })
  }

  return { geldig: true, stappe, punte, versamel, versperrings,
           grootsteKetting, spesiaalGemaak, kombinasies }
}

/* Ná 'n skuif: is die bord nog speelbaar? Skommel indien nodig, en dit kos
   nooit 'n skuif nie. */
export function versekerSkuif(bord, saad) {
  if (hetGeldigeSkuif(bord)) return null
  const reg = skommel(bord, saad)
  return { tipe: 'skommel', geslaag: reg }
}
