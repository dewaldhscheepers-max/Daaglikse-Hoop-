import { useState } from 'react'
import { blaaierSoort } from '../data/kennisgewingVra'
import './KennisgewingAf.css'

/* ────────────────────────────────────────────────────────────
   Die pad terug.

   Wie een keer die blaaier se "Block" gedruk het, is vir die app dood. Sy
   `Notification.requestPermission()` gee dadelik 'denied' terug sonder om
   iets te wys, vir altyd. Net die mens self kan dit in sy blaaier omkeer.

   Tot nou toe het die app hom NIKS gewys nie. Die instruksies het wel
   bestaan, maar hulle het binne die "Ja, graag"-knoppie se hanteerder gesit —
   'n knoppie wat presies hierdie mense nooit te sien kry nie.

   Dit is dus nie 'n popup nie en dit vra niks. Dit is 'n stil reël wat oop-
   gaan as 'n mens hom druk. Hy onderbreek niks en hy jaag niemand nie.

   Die stappe verskil werklik per blaaier, en die verkeerde stappe is erger as
   geen stappe nie: 'n mens soek 'n slotjie wat nie daar is nie en gee op.
   ──────────────────────────────────────────────────────────── */

const STAPPE = {
  chrome: [
    'Tik die 🔒 slotjie links in die adresbalk',
    'Kies “Permissions” of “Site settings”',
    'Sit “Notifications” op “Allow”',
    'Maak die app toe en weer oop',
  ],
  samsung: [
    'Tik die ⋮ knoppie regs onder',
    'Gaan na Instellings → Webwerwe en aflaaie',
    'Kies “Kennisgewings”, soek Daaglikse Hoop',
    'Sit dit op “Toelaat”, en maak die app weer oop',
  ],
  ios: [
    'Maak Instellings op jou iPhone oop',
    'Blaai af na Daaglikse Hoop',
    'Sit “Kennisgewings” aan',
    'Maak die app weer oop',
  ],
  /* Facebook se ingeboude blaaier kan glad nie kennisgewings doen nie, hoe
     'n mens ook al instellings verander. Die enigste eerlike antwoord is om
     dit in 'n regte blaaier oop te maak. */
  facebook: [
    'Tik die ⋮ of ⋯ knoppie regs bo',
    'Kies “Open in browser” / “Maak in blaaier oop”',
    'Voeg dit dan by jou tuisskerm',
    'Dan kan kennisgewings werk',
  ],
}

export default function KennisgewingAf() {
  const [oop, setOop] = useState(false)
  const soort  = blaaierSoort(typeof navigator !== 'undefined' ? navigator.userAgent : '')
  const stappe = STAPPE[soort] || STAPPE.chrome

  return (
    <div className="kga">
      <button className="kga-reel" onClick={() => setOop(o => !o)}>
        <span className="kga-punt" aria-hidden="true">🔕</span>
        <span className="kga-teks">
          <strong>Jy kry nie die oggendboodskap nie</strong>
          Kennisgewings is vir hierdie app afgeskakel.
        </span>
        <span className="kga-pyl" aria-hidden="true">{oop ? '⌃' : '⌄'}</span>
      </button>

      {oop && (
        <ol className="kga-stappe">
          {stappe.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      )}
    </div>
  )
}
