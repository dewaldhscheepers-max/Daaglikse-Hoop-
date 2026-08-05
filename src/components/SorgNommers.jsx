/* Die noodnommers, oral dieselfde. Een druk om te bel.

   `kompak` is daar vir EEN plek: die band wat verskyn terwyl iemand tik.
   Al vyf nommers is sowat 'n hele skerm hoog, en as hulle bo die skryfblok
   inskuif, verdwyn die woorde wat die mens op daardie oomblik tik onder in
   die blad. Kompak wys die een wat 99% van die tyd die regte een is, met
   die res 'n druk weg. */

import { useState } from 'react'
import { NOODNOMMERS, belSkakel } from '../data/sorgNommers'
import '../screens/Sorg.css'

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

export default function SorgNommers({ kompak = false }) {
  const [almal, setAlmal] = useState(false)
  const wys = kompak && !almal ? NOODNOMMERS.slice(0, 1) : NOODNOMMERS

  return (
    <div className="sorg-nommers">
      {wys.map(n => <Nommer key={n.nommer} n={n} />)}
      {kompak && !almal && (
        <button className="sorg-nommer-meer" onClick={() => setAlmal(true)}>
          Wys al die nommers
        </button>
      )}
    </div>
  )
}
