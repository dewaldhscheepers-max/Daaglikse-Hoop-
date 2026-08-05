/* Die noodnommers, oral dieselfde. Een druk om te bel.

   Drie maniere om dit te wys:

     alles      al vyf — die Hulp nou-blad
     dringend   SADAG en 112, met die res 'n druk weg — wanneer die
                krisiswoorde tref terwyl iemand tik
     kompak     net die eerste

   Hoekom nie altyd al vyf nie: die volle lys is sowat 'n hele skerm hoog.
   Skuif dit bo die skryfblok in, verdwyn die woorde wat die mens op daardie
   oomblik tik onder in die blad. */

import { useState } from 'react'
import { NOODNOMMERS, belSkakel } from '../data/sorgNommers'
import '../screens/Sorg.css'

/* SADAG en die noodoproep. Dit is wat 'n mens op daardie oomblik nodig het:
   iemand om mee te praat, of iemand wat kan uitkom. */
const DRINGEND = ['0800 567 567', '112']

function Nommer({ n }) {
  return (
    <a className="sorg-nommer" href={belSkakel(n.nommer)}>
      <span className="sorg-nommer-naam">{n.naam}</span>
      <span className="sorg-nommer-syfer">
        {n.nommer}{n.diens ? ` · ${n.diens}` : ''}{n.nota ? ` · ${n.nota}` : ''}
      </span>
    </a>
  )
}

export default function SorgNommers({ wys = 'alles' }) {
  const [almal, setAlmal] = useState(false)

  const lys = almal || wys === 'alles'
    ? NOODNOMMERS
    : wys === 'dringend'
      ? NOODNOMMERS.filter(n => DRINGEND.includes(n.nommer))
      : NOODNOMMERS.slice(0, 1)

  return (
    <div className="sorg-nommers">
      {lys.map(n => <Nommer key={n.nommer} n={n} />)}
      {wys !== 'alles' && !almal && (
        <button className="sorg-nommer-meer" onClick={() => setAlmal(true)}>
          Wys al die noodnommers
        </button>
      )}
    </div>
  )
}
