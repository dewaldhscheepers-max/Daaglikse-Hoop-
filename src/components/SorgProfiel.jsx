/* ────────────────────────────────────────────────────────────
   "Antwoord met jou profiel."

   Dewald: "Wanneer iemand die eerste keer antwoord, laat hulle 'n eenvoudige
   profiel opstel... Moenie hulle by elke antwoord weer hul naam laat intik
   nie. Hou die profielopstelling so kort as moontlik."

   Dus: EEN KEER, TWEE VELDE, en dit is klaar.

     ┌──────────────────────────────┐
     │  Antwoord met jou profiel    │
     │  Mense moet weet wie saam    │
     │  met hulle praat.            │
     │                              │
     │   (E)   [ Kies foto ]        │
     │                              │
     │  Vertoonnaam                 │
     │  [ Elna                    ] │
     │                              │
     │  [ Stoor en gaan voort ]     │
     └──────────────────────────────┘

   Die foto is OPSIONEEL. Sonder een kry 'n mens sy voorletters in 'n kring,
   en dit is genoeg — 'n verpligte foto is 'n muur voor iemand wat net wou
   sê "ek bid vanaand vir jou".

   Wat hier NIE is nie: geen e-pos, geen nommer, geen van, geen wagwoord,
   geen registrasie. Niks waarmee 'n mens buite hierdie app opgespoor kan
   word nie. Lees vra ook niks — 'n mens mag elke storie lees sonder om ooit
   'n naam te kies.

   Geen transform of opacity op :active nie — sien CLAUDE.md.
   ──────────────────────────────────────────────────────────── */

import { useState } from 'react'
import { voorletters, vraKode, MAKS_NAAM } from '../data/sorgProfiel'
import { stoorProfiel, kropFoto } from '../data/sorgProfielBerging'
import './SorgProfiel.css'

export default function SorgProfiel({ profiel, onKlaar, onSluit, kop, fyn }) {
  const [naam, setNaam] = useState(profiel ? profiel.naam : '')
  const [foto, setFoto] = useState(profiel ? profiel.foto : '')
  const [fout, setFout] = useState('')
  const [besig, setBesig] = useState(false)
  /* ── Die kode ──
   *
   * Dewald: "As ek Dewald Scheepers intik moet dit vra vir kode."
   *
   * Die veld verskyn sodra die naam een van die twee beskermde name is. Die
   * kode word NOOIT hier vergelyk nie — hierdie lêer ship in 'n openbare
   * JavaScript-lêer wat enigiemand kan oopmaak. Die hek staan op die
   * bediener; sien api/_geheim.js. */
  const [kode, setKode] = useState(profiel ? (profiel.kode || '') : '')

  async function kiesFoto(e) {
    const leer = e.target.files && e.target.files[0]
    /* Die veld word skoongemaak sodat dieselfde foto twee keer gekies kan
       word — anders vuur `change` nie 'n tweede keer nie en dan lyk die
       knoppie stukkend. */
    e.target.value = ''
    if (!leer) return
    setBesig(true)
    const r = await kropFoto(leer)
    setBesig(false)
    if (r.fout) { setFout(r.fout); return }
    setFout('')
    setFoto(r.foto)
  }

  function stoor() {
    if (vraKode(naam) && !kode.trim()) {
      setFout('Daardie naam is beskerm. Tik die kode in om dit te gebruik.')
      return
    }
    const r = stoorProfiel({ naam, foto, kode: kode.trim() })
    if (r.fout) { setFout(r.fout); return }
    onKlaar(r.profiel)
  }

  const letters = voorletters(naam)

  return (
    <div className="sp-profiel">
      <h3>{kop || 'Antwoord met jou profiel'}</h3>
      <p className="sp-profiel-fyn">
        {fyn || 'Mense moet weet wie saam met hulle praat. Jou naam en foto bly dieselfde in elke gesprek.'}
      </p>

      <div className="sp-profiel-ry">
        {/* Die kring wys NOU al hoe dit gaan lyk. 'n Mens wat sy naam tik en
            dadelik sy voorletters sien verskyn, verstaan sonder om te lees
            wat gaan gebeur. */}
        <span className="sp-profiel-kring">
          {foto
            ? <img src={foto} alt="" width="52" height="52" />
            : <span aria-hidden="true">{letters || '·'}</span>}
        </span>
        <label className="sp-profiel-kies">
          {foto ? 'Verander foto' : 'Kies foto'}
          <input type="file" accept="image/*" onChange={kiesFoto} hidden />
        </label>
        {foto && (
          <button className="sp-profiel-weg" onClick={() => setFoto('')}>
            Haal foto af
          </button>
        )}
      </div>

      <label className="sp-profiel-etiket" htmlFor="sp-naam">Vertoonnaam</label>
      <input
        id="sp-naam"
        className="sp-profiel-invoer"
        value={naam}
        maxLength={MAKS_NAAM}
        placeholder="Elna"
        onChange={e => { setNaam(e.target.value); setFout('') }}
        onKeyDown={e => { if (e.key === 'Enter' && naam.trim()) stoor() }}
      />

      {vraKode(naam) && (
        <>
          <label className="sp-profiel-etiket" htmlFor="sp-kode">
            Hierdie naam is beskerm — tik die kode
          </label>
          <input
            id="sp-kode"
            className="sp-profiel-invoer"
            value={kode}
            inputMode="numeric"
            maxLength={12}
            placeholder="••••"
            onChange={e => { setKode(e.target.value); setFout('') }}
          />
          <p className="sp-profiel-fyn">
            Sonder die regte kode verskyn jou opmerking anoniem.
          </p>
        </>
      )}

      {fout && <p className="sp-profiel-fout">{fout}</p>}

      <button className="sp-profiel-stoor" onClick={stoor} disabled={besig || !naam.trim()}>
        {besig ? 'Besig…' : 'Stoor en gaan voort'}
      </button>

      {onSluit && (
        <button className="sp-profiel-anon" onClick={onSluit}>
          Ek wil eerder anoniem bly
        </button>
      )}
    </div>
  )
}
