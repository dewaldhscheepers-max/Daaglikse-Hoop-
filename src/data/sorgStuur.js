/* ────────────────────────────────────────────────────────────
   Die kliënt se kant van "Vertel my wat swaar is".

   Twee dinge leef hier, en albei is klein met opset:

   1. Die stuur self. Die skerm hoef nie te weet van HTTP nie.
   2. Wat OP HIERDIE FOON onthou word. Nooit die teks nie — net die
      bestuurskode, die onderwerp en die datum, sodat 'n mens sy eie plasing
      later kan terugkry of laat verwyder.

   Die teks word nooit plaaslik gestoor nie, ook nie as 'n konsep nie. As
   iemand anders die foon optel, moet daar niks van daardie boodskap oor wees
   nie. Dit is 'n gedeelde foon in baie huise.
   ──────────────────────────────────────────────────────────── */

const PAD = '/api/sorg-stuur'
const TOESTEL_SLEUTEL = 'sorg_toestel'
const MYNE_SLEUTEL = 'sorg_myne'

/* ── Die toestel ──

   'n Ewekansige nommer wat op hierdie foon bly. Dit is nie 'n identiteit
   nie: die bediener sien net 'n has daarvan, en ons gebruik dit vir twee
   dinge — 'n perk per dag, en "my eie plasings".

   Wie dit uitvee, verloor sy plasings se koppeling. Dit is reg so; die
   bestuurskode is die egte sleutel. */
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

/* ── My eie plasings ── */
export function myPlasings() {
  try { return JSON.parse(localStorage.getItem(MYNE_SLEUTEL) || '[]') } catch { return [] }
}

function onthouPlasing(p) {
  try {
    const lys = [p, ...myPlasings().filter(x => x.kode !== p.kode)].slice(0, 30)
    localStorage.setItem(MYNE_SLEUTEL, JSON.stringify(lys))
  } catch { /* privaat modus — die kode wys op die skerm, hy kan dit neerskryf */ }
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
      onthouPlasing({ kode: d.kode, onderwerp: d.onderwerp, datum: new Date().toISOString().slice(0, 10) })
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
