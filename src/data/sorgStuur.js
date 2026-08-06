/* ────────────────────────────────────────────────────────────
   Die kliënt se kant van "Vertel my wat swaar is".

   Twee dinge leef hier, en albei is klein met opset:

   1. Die stuur self. Die skerm hoef nie te weet van HTTP nie.
   2. Die toestel se nommer, en niks anders nie.

      Hier is 'n rukkie ook 'n lys van "my eie plasings" gestoor. Niks het dit
      ooit gelees nie — die private kode is van die skerm af weg — dus was dit
      data wat op mense se fone le vir geen doel nie. Op 'n blad oor
      privaatheid is dit die verkeerde soort oorblyfsel.

   Die teks word nooit plaaslik gestoor nie, ook nie as 'n konsep nie. As
   iemand anders die foon optel, moet daar niks van daardie boodskap oor wees
   nie. Dit is 'n gedeelde foon in baie huise.
   ──────────────────────────────────────────────────────────── */

const PAD = '/api/sorg-stuur'
const TOESTEL_SLEUTEL = 'sorg_toestel'

/* ── Die toestel ──

   'n Ewekansige nommer wat op hierdie foon bly. Dit is nie 'n identiteit
   nie: die bediener sien net 'n has daarvan, en dit doen EEN ding — die perk
   van drie boodskappe per dag.

   Wie dit uitvee, kry weer drie. Dit is reg so: die perk bestaan om die dag
   se ry leesbaar te hou, nie om iemand uit te sluit nie. */
export function toestelId() {
  try {
    let id = localStorage.getItem(TOESTEL_SLEUTEL)
    if (!id) {
      id = (crypto.randomUUID && crypto.randomUUID()) ||
        String(Math.random()).slice(2) + String(Date.now())
      localStorage.setItem(TOESTEL_SLEUTEL, id)
    }
    return id
  } catch {
    /* Privaat modus. Dan is daar net geen perk per toestel nie; die daaglikse
       plafon staan nog. */
    return ''
  }
}

/* ── Stuur ──

   Gee altyd 'n objek terug, nooit 'n uitsondering nie. Iemand wat pas sy
   swaarste ding getik het, mag nie 'n stukkende skerm sien nie.

     { ok: true,  kode, onderwerp, krisis }
     { ok: false, vol: true, boodskap }        die dag is vol
     { ok: false, fout: 'boodskap vir die mens' }
*/
export async function stuurBoodskap({ teks, onderwerp, naam, anoniem, toestemmings }) {
  try {
    const r = await fetch(PAD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teks, onderwerp, naam, anoniem,
        toestemmings,
        toestel: toestelId(),
      }),
    })

    let d = null
    try { d = await r.json() } catch { d = null }

    if (!d) return { ok: false, fout: 'Ons kon nie deurkom nie. Probeer asseblief weer.' }
    if (d.ok) {
      /* Stil onthou. Dit word nooit gewys nie — dit is net hoe die foon
         later weet watter plasing op die muur hierdie mens s'n is. */
      try {
        const { onthouMyKode } = await import('./sorgMuur')
        onthouMyKode(d.kode)
      } catch { /* dan is daar bloot geen "Jou storie"-merkie nie */ }
      return d
    }
    if (d.vol) return d
    return { ok: false, fout: d.fout || 'Ons kon dit nie stoor nie. Probeer asseblief weer.' }
  } catch {
    return {
      ok: false,
      fout: 'Dit lyk of jy nou aflyn is. Jou woorde is nog hier — probeer weer sodra jy netwerk het.',
    }
  }
}
