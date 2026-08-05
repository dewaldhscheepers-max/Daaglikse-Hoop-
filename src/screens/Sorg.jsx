/* ────────────────────────────────────────────────────────────
   Pastorale Sorg.

   Die volgorde op hierdie blad is 'n besluit, nie 'n toeval nie:

     Hulp nou            — altyd bo, altyd bereikbaar
     Die week se video   — een ding, die held
     Vertel my wat swaar is
     Vandag se woord
     Dewald antwoord · Die Muur · Die Video's

   HOOP KOM VOOR PYN. Iemand wat in krisis aankom en veertig plasings van
   ander se lyding lees, gaan slegter weg. Daarom staan die video bo en die
   muur onder, en daarom dra elke plasing op die muur iets by wat help.

   Die skryfknoppie sit binne die eerste skerm. Wie huil, moet nie eers verby
   twee video's blaai nie.

   En: geen versoek om geld op hierdie blad se skryfkant nie. Die
   Hoopdraer-uitnodiging hoort net onder 'n antwoord of 'n video, nooit waar
   iemand sy seer tik nie.
   ──────────────────────────────────────────────────────────── */

import { useState } from 'react'
import './Sorg.css'

const NOODNOMMERS = [
  { naam: 'Selfmoord of selfskade', diens: 'SADAG', nommer: '0800 567 567', nota: '24 uur' },
  { naam: 'Polisie of noodgeval',   diens: 'SAPS',  nommer: '10111' },
  { naam: 'Noodoproep vanaf \'n selfoon', diens: '', nommer: '112' },
  { naam: 'Ambulans',               diens: '',      nommer: '10177' },
  { naam: '\'n Kind in gevaar',     diens: 'Childline', nommer: '116' },
]

export const GRENSSIN =
  'Pastorale Sorg bied Bybelse hoop en bemoediging. Dit is nie \'n nooddiens, ' +
  'terapie of mediese sorg nie en waarborg nie \'n persoonlike antwoord nie. ' +
  'Hierdie muur word nie voortdurend gemonitor nie. Wanneer jy of iemand ' +
  'anders in onmiddellike gevaar is, gebruik die hulpnommers en moenie hier ' +
  'vir \'n antwoord wag nie.'

export function HulpNou({ oop, onSluit }) {
  if (!oop) return null
  return (
    <>
      <div className="sorg-blad-agter" onClick={onSluit} />
      <div className="sorg-blad" role="dialog" aria-label="Hulp nou">
        <div className="sorg-blad-gryp" />
        <h2 className="sorg-blad-titel">Hulp nou</h2>
        <p className="sorg-blad-teks">
          Is jy, 'n kind of iemand anders op hierdie oomblik in gevaar? Bel een
          van hierdie nommers. Moenie hier wag nie.
        </p>
        <div className="sorg-nommers">
          {NOODNOMMERS.map(n => (
            <a key={n.nommer} className="sorg-nommer" href={`tel:${n.nommer.replace(/\s/g, '')}`}>
              <span className="sorg-nommer-naam">{n.naam}</span>
              <span className="sorg-nommer-syfer">
                {n.nommer}{n.diens ? ` · ${n.diens}` : ''}{n.nota ? ` · ${n.nota}` : ''}
              </span>
            </a>
          ))}
        </div>
        <button className="sorg-blad-toe" onClick={onSluit}>Maak toe</button>
      </div>
    </>
  )
}

export default function Sorg() {
  const [hulpOop, setHulpOop] = useState(false)

  return (
    <div className="sorg">
      <div className="sorg-header screen-header">
        <button className="sorg-hulp-knop" onClick={() => setHulpOop(true)}>
          Hulp nou
        </button>
        <h1>Pastorale Sorg</h1>
        <p>Bring die swaar ding. Jy hoef dit nie alleen te dra nie.</p>
      </div>

      <div className="sorg-body">
        <p className="sorg-binnekort">
          Hierdie blad word nou gebou.
        </p>
      </div>

      <HulpNou oop={hulpOop} onSluit={() => setHulpOop(false)} />
    </div>
  )
}
