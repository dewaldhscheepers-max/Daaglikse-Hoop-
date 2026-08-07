/* ────────────────────────────────────────────────────────────
   Ondersteun — die blad wat oopgaan op Pastorale Sorg.

   Dit is NIE 'n nuwe betaalpad nie. Die twee bestaande modale doen die werk:
   `open-hoop-vennoot` vir maandeliks en `open-donation` vir eenmalig. Hier
   staan net die keuse, met die bedrae sigbaar.

   ── Waarom die bedrae hier wys ──

   Vroeer was daar net "Ondersteun", en dan moes 'n mens eers druk voordat hy
   weet wat dit van hom gaan vra. 'n Getal wat 'n mens kan SIEN, is 'n
   makliker besluit as 'n knoppie wat in die donker vra.

   Die bedrag word saam met die gebeurtenis gestuur, sodat die modaal reeds op
   daardie een staan wanneer dit oopgaan. Niemand hoef twee keer te kies nie.

   ── Waarom "Nie nou nie" ──

   'n Blad oor geld op 'n plek waar mense hul seer bring, moet 'n duidelike
   pad UIT he. Sonder dit voel dit soos 'n hek.

   Geen transform of opacity op :active nie — net kleur. Sien CLAUDE.md.
   ──────────────────────────────────────────────────────────── */

import './SorgSteun.css'

const MAANDELIKS = [50, 100, 200]
const EENMALIG   = [30, 50, 100]

function vra(soort, bedrag) {
  const naam = soort === 'maand' ? 'open-hoop-vennoot' : 'open-donation'
  window.dispatchEvent(new CustomEvent(naam, { detail: { bedrag } }))
}

export default function SorgSteun({ oop, onSluit }) {
  if (!oop) return null

  function kies(soort, bedrag) {
    onSluit()
    vra(soort, bedrag)
  }

  return (
    <>
      <div className="sst-agter" onClick={onSluit} />
      <div className="sst" role="dialog" aria-label="Ondersteun">
        <div className="sst-gryp" />

        <h2 className="sst-titel">Help om Daaglikse Hoop gratis te hou</h2>
        <p className="sst-teks">
          As hierdie bediening jou help en jy wil help dat ons aanhou om mense
          gratis te bedien, kan jy hier ’n bydrae maak.
        </p>

        <p className="sst-kop">Maandeliks ondersteun</p>
        <div className="sst-ry">
          {MAANDELIKS.map(b => (
            <button key={b} className="sst-bedrag" onClick={() => kies('maand', b)}>R{b}</button>
          ))}
          <button className="sst-bedrag sst-eie" onClick={() => kies('maand', null)}>Eie bedrag</button>
        </div>

        <p className="sst-kop">Eenmalig ondersteun</p>
        <div className="sst-ry">
          {EENMALIG.map(b => (
            <button key={b} className="sst-bedrag" onClick={() => kies('een', b)}>R{b}</button>
          ))}
          <button className="sst-bedrag sst-eie" onClick={() => kies('een', null)}>Eie bedrag</button>
        </div>

        <button className="sst-nie" onClick={onSluit}>Nie nou nie</button>
      </div>
    </>
  )
}
