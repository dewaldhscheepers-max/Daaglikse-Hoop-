/* ────────────────────────────────────────────────────────────
   Vrugtefees — prestasies.

   Klein merke vir dinge wat 'n mens raakloop terwyl jy speel. Nie 'n lys
   take nie: 'n mens moet dit KRY, nie najaag nie. Daarom staan hulle
   nêrens as 'n te-doen-lys nie — hulle verskyn wanneer dit gebeur.

   Alles leef in localStorage. Dit is met opset nie op die bediener nie:
   'n prestasie is vir jouself, en om dit te laat tel sou beteken ons moet
   dit ook kan bewys. Die ranglys is waar bewys saak maak.
   ──────────────────────────────────────────────────────────── */

const SLEUTEL = 'vf_prestasies'

/* Elke prestasie sê self of dit behaal is, uit een stand-objek. So is daar
   nie 'n tweede plek waar die reels dupliseer nie. */
export const PRESTASIES = [
  { id: 'eerste',      naam: 'Die Eerste Vrug',    beskrywing: 'Maak fase 1 klaar.',
    haal: s => s.vlakkeKlaar >= 1 },
  { id: 'tuinier',     naam: 'Tuinier',            beskrywing: 'Maak 10 fases klaar.',
    haal: s => s.vlakkeKlaar >= 10 },
  { id: 'boer',        naam: 'Boer',               beskrywing: 'Maak 30 fases klaar.',
    haal: s => s.vlakkeKlaar >= 30 },
  { id: 'oesmeester',  naam: 'Oesmeester',         beskrywing: 'Maak 60 fases klaar.',
    haal: s => s.vlakkeKlaar >= 60 },
  { id: 'tuinreis',    naam: 'Die Hele Tuinreis',  beskrywing: 'Maak al 90 fases klaar.',
    haal: s => s.vlakkeKlaar >= 90 },

  { id: 'ketting5',    naam: 'Kettingreaksie',     beskrywing: 'Kry \'n ketting van vyf.',
    haal: s => s.besteKetting >= 5 },
  { id: 'grootpas',    naam: 'Oorvloed',           beskrywing: 'Pas ses vrugte in een figuur.',
    haal: s => s.besteGrootpas >= 6 },
  { id: 'reenboog',    naam: 'Vyf in \'n Streep',  beskrywing: 'Maak \'n reënboogvrug.',
    haal: s => s.reenboog >= 1 },
  { id: 'kombinasie',  naam: 'Dubbele Seën',       beskrywing: 'Ruil twee spesiale vrugte met mekaar.',
    haal: s => s.kombinasies >= 1 },
  { id: 'spesiaal50',  naam: 'Groenvingers',       beskrywing: 'Maak 50 spesiale vrugte.',
    haal: s => s.spesiaalGemaak >= 50 },

  { id: 'vroeg',       naam: 'Vroeë Oes',          beskrywing: 'Wen \'n fase met tien skuiwe oor.',
    haal: s => s.besteSkuiweOor >= 10 },
  { id: 'negeTuine',   naam: 'Nege Tuine',         beskrywing: 'Bereik die laaste hoofstuk.',
    haal: s => s.hoogsteHoofstuk >= 9 },

  { id: 'oes5',        naam: 'Volhard',            beskrywing: 'Haal ronde 5 in Die Oneindige Oes.',
    haal: s => s.besteOesRonde >= 5 },
  { id: 'oes10',       naam: 'Die Groot Oes',      beskrywing: 'Haal ronde 10 in Die Oneindige Oes.',
    haal: s => s.besteOesRonde >= 10 },
  { id: 'dag7',        naam: 'Elke Dag Getrou',    beskrywing: 'Speel Vandag se Oes op sewe dae.',
    haal: s => s.dagDae >= 7 },
]

function leeStand() {
  return {
    vlakkeKlaar: 0,
    hoogsteHoofstuk: 1,
    besteKetting: 0,
    besteGrootpas: 0,
    besteSkuiweOor: 0,
    reenboog: 0,
    kombinasies: 0,
    spesiaalGemaak: 0,
    besteOesRonde: 0,
    besteOesPunte: 0,
    dagDae: 0,
    dagLaaste: null,
  }
}

export function lees() {
  try {
    const d = JSON.parse(localStorage.getItem(SLEUTEL) || 'null')
    if (!d || typeof d !== 'object') return { stand: leeStand(), behaal: {} }
    return { stand: { ...leeStand(), ...(d.stand || {}) }, behaal: d.behaal || {} }
  } catch { return { stand: leeStand(), behaal: {} } }
}

function stoor(d) {
  try { localStorage.setItem(SLEUTEL, JSON.stringify(d)) } catch {}
}

/* Werk die stand by en gee terug watter prestasies NUUT behaal is, sodat
   die skerm hulle kan wys. Ons gee nooit 'n prestasie twee keer nie. */
export function boekAan(verandering) {
  const d = lees()
  const s = d.stand

  for (const [k, v] of Object.entries(verandering)) {
    if (v === undefined || v === null) continue
    if (k.startsWith('beste') || k === 'hoogsteHoofstuk' || k === 'vlakkeKlaar') {
      // Hoogtepunte: net as dit werklik hoër is.
      s[k] = Math.max(s[k] || 0, v)
    } else if (k === 'dagLaaste') {
      // 'n Nuwe dag tel een keer, hoeveel keer 'n mens ook al vandag speel.
      if (v && s.dagLaaste !== v) { s.dagLaaste = v; s.dagDae = (s.dagDae || 0) + 1 }
    } else {
      s[k] = (s[k] || 0) + v
    }
  }

  const nuut = []
  for (const p of PRESTASIES) {
    if (d.behaal[p.id]) continue
    let haal = false
    try { haal = !!p.haal(s) } catch { haal = false }
    if (haal) { d.behaal[p.id] = Date.now(); nuut.push(p) }
  }

  stoor(d)
  return { stand: s, behaal: d.behaal, nuut }
}

export function telBehaal() {
  const d = lees()
  return PRESTASIES.filter(p => d.behaal[p.id]).length
}
