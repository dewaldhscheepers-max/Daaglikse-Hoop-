/* ── Die "Lees die hele Bybel in 365 dae"-kaart ──
 *
 * Op die e-boekblad, DIREK onder VOLG JESUS s'n. Dewald, 9 September 2026:
 * *"sit ook die lees die Bybel in 365 dae op die e-boekblad net onderkant volg
 * Jesus se kaart... en dan kan jy net self skryf bo op hierdie kaart elke dag,
 * soos dag 1 van dit, dag 2 van dit, dag 3 van dit."*
 *
 * ── Dit gaan na dieselfde plek as die leesplan-lys ──
 *
 * Een gebeurtenis, `open-bybel-365`, en dieselfde skerm. Die kaart is 'n tweede
 * INGANG, nie 'n tweede plan nie: hy skryf niks, hy hou geen eie toestand nie,
 * en hy lees net die klein opsomming wat die skerm reeds skryf.
 *
 * ── Hy lees NIE die plan nie ──
 *
 * Die plan is 'n 29 KB-aflaai en hierdie kaart word geteken op 'n blad wat
 * baie mense oopmaak sonder om ooit die plan te doen. Hy lees `b365_stand` —
 * drie getalle in localStorage — en `kaartStand()` maak die woorde daaruit.
 *
 * ── Waarom hy na 'n sein luister ──
 *
 * Die e-boekblad bly agter die plan STAAN. Maak 'n mens 'n dag klaar en kom
 * terug, moet die kaart die nuwe dag wys. `storage` vuur nie in dieselfde
 * oortjie nie — dieselfde probleem as die hart op Luister — dus waai die
 * skerm 'n `b365-stand`-sein en ons luister daarna.
 */
import { useEffect, useState } from 'react'
import { kaartStand, STAND_SLEUTEL } from '../data/bybel365'
import './Bybel365Kaart.css'

function lees() {
  try { return JSON.parse(localStorage.getItem(STAND_SLEUTEL) || 'null') }
  catch { return null }
}

export default function Bybel365Kaart() {
  const [stand, setStand] = useState(lees)

  useEffect(() => {
    function opnuut() { setStand(lees()) }
    window.addEventListener('b365-stand', opnuut)
    window.addEventListener('storage', opnuut)
    return () => {
      window.removeEventListener('b365-stand', opnuut)
      window.removeEventListener('storage', opnuut)
    }
  }, [])

  const k = kaartStand(stand)

  return (
    <button
      className="b365k"
      onClick={() => window.dispatchEvent(new CustomEvent('open-bybel-365'))}
    >
      {/* Die sluier lê NET oor die onderste strook. Die kunswerk dra sy eie
          woorde bo-aan — anders as VOLG JESUS se prent — en 'n sluier oor die
          hele kaart sou hulle dof maak. Dieselfde les as die wallpaper agter
          Tyd met God se klaar-skerm: moenie twee stelle woorde oor mekaar
          laat veg nie. */}
      <span className="b365k-sluier" />

      <span className="b365k-binne">
        <span className="b365k-lyn">{k.lyn}</span>
        <span className="b365k-knop">
          {k.knop} <span aria-hidden="true">›</span>
        </span>
      </span>
    </button>
  )
}
