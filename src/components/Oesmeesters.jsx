import { useState, useEffect, useCallback } from 'react'
import {
  haalRanglys, kasLys, leesNaam, stoorNaam, keurNaam, wagryLengte,
} from '../data/vrugtefeesRanglys'

/* ────────────────────────────────────────────────────────────
   Die Top 20 Oesmeesters.

   Twee borde. Die eerste is die beste lopie ooit; die tweede is vandag se
   bord, wat almal ter wereld gelyk speel.

   Die reel wat hierdie skerm regeer: 'n leë lys en 'n lys wat ons nie kon
   haal nie, is NIE dieselfde ding nie. As die netwerk stukkend is, sê ons
   dit. Ons wys nooit 'n leë tabel wat lyk of niemand speel nie.
   ──────────────────────────────────────────────────────────── */

function Ry({ e, n, ek }) {
  return (
    <div className={'vf-rang-ry' + (ek ? ' ek' : '')}>
      <span className="vf-rang-nr">{n}</span>
      <span className="vf-rang-naam">{e.naam}</span>
      <span className="vf-rang-punte">{(e.punte || 0).toLocaleString('af')}</span>
    </div>
  )
}

function Bord({ lys, totaal, leegTeks, myUid }) {
  if (!lys || !lys.length) return <p className="vf-blad-teks">{leegTeks}</p>
  return (
    <>
      <div className="vf-rang-lys">
        {lys.map((e, i) => <Ry key={e.uid || i} e={e} n={i + 1} ek={e.uid && e.uid === myUid} />)}
      </div>
      {totaal > lys.length && (
        <p className="vf-fyndruk">{totaal.toLocaleString('af')} spelers altesaam</p>
      )}
    </>
  )
}

export default function Oesmeesters({ terug, myUid, naamNodig, onNaam }) {
  const [blad, setBlad]   = useState('daagliks')   // daagliks · meesters
  const [data, setData]   = useState(null)
  const [besig, setBesig] = useState(true)
  const [fout, setFout]   = useState(null)
  const [kas, setKas]     = useState(null)
  const [naam, setNaam]   = useState(() => leesNaam())
  const [naamFout, setNaamFout] = useState(null)
  const [vraNaam, setVraNaam]   = useState(!!naamNodig)

  const haal = useCallback(async () => {
    setBesig(true); setFout(null)
    const uit = await haalRanglys()
    if (uit.ok) { setData(uit); setKas(null) }
    else {
      setFout(uit.fout)
      // Iets ouds is beter as niks — solank ons sê dis oud.
      const k = kasLys()
      if (k) setKas(k)
    }
    setBesig(false)
  }, [])

  useEffect(() => {
    // Wys dadelik wat ons in die kas het, en gaan haal dan die egte lys.
    const k = kasLys()
    if (k) setKas(k)
    haal()
  }, [haal])

  function stoorDieNaam() {
    const f = keurNaam(naam)
    if (f) { setNaamFout(f); return }
    stoorNaam(naam.trim().replace(/\s+/g, ' '))
    setNaamFout(null)
    setVraNaam(false)
    if (onNaam) onNaam(naam.trim().replace(/\s+/g, ' '))
  }

  const bron = data || (kas ? {
    meesters: kas.meesters, daagliks: kas.daagliks,
    meestersTotaal: kas.meestersTotaal, daagliksTotaal: kas.daagliksTotaal,
  } : null)

  const wag = wagryLengte()

  return (
    <div className="vf-blad vf-blad-rang">
      <span className="vf-merk">Wêreldwyd</span>
      <h2 className="vf-blad-titel">Oesmeesters</h2>

      {vraNaam && (
        <div className="vf-naamvra">
          <p className="vf-blad-teks">Onder watter naam wil jy op die lys wees?</p>
          <input
            className="vf-inset"
            value={naam}
            maxLength={20}
            placeholder="Jou naam"
            onChange={e => { setNaam(e.target.value); setNaamFout(null) }}
          />
          {naamFout && <p className="vf-fout">{naamFout}</p>}
          <button className="vf-knop vf-knop-primer" onClick={stoorDieNaam}>Stoor</button>
        </div>
      )}

      <div className="vf-blaaie">
        <button
          className={'vf-blaai' + (blad === 'daagliks' ? ' aan' : '')}
          onClick={() => setBlad('daagliks')}
        >Vandag se Oes</button>
        <button
          className={'vf-blaai' + (blad === 'meesters' ? ' aan' : '')}
          onClick={() => setBlad('meesters')}
        >Beste ooit</button>
      </div>

      {besig && !bron && <p className="vf-blad-teks">Besig om te laai…</p>}

      {/* 'n Fout word gesê, nie weggesteek nie. */}
      {fout && !bron && (
        <>
          <p className="vf-fout">{fout}</p>
          <button className="vf-knop vf-knop-primer" onClick={haal}>Probeer weer</button>
        </>
      )}
      {fout && bron && (
        <p className="vf-fyndruk vf-fout-sag">
          Ons kon nie nou by die lys uitkom nie — hierdie is die laaste een wat ons gesien het.
        </p>
      )}

      {bron && blad === 'daagliks' && (
        <>
          <p className="vf-blad-teks vf-sag">
            Almal speel vandag dieselfde bord. Dit begin elke nag om middernag oor.
          </p>
          <Bord
            lys={bron.daagliks}
            totaal={bron.daagliksTotaal}
            myUid={myUid}
            leegTeks="Niemand het vandag se oes nog ingebring nie. Jy kan die eerste wees."
          />
        </>
      )}

      {bron && blad === 'meesters' && (
        <>
          <p className="vf-blad-teks vf-sag">
            Die beste lopie wat elke speler nog ooit in Die Oneindige Oes gehad het.
          </p>
          <Bord
            lys={bron.meesters}
            totaal={bron.meestersTotaal}
            myUid={myUid}
            leegTeks="Nog niemand op hierdie lys nie. Speel Die Oneindige Oes."
          />
        </>
      )}

      {wag > 0 && (
        <p className="vf-fyndruk">
          {wag === 1 ? 'Een oes wag' : `${wag} oeste wag`} om ingestuur te word.
        </p>
      )}

      {!vraNaam && (
        <button className="vf-knop vf-knop-spook" onClick={() => setVraNaam(true)}>
          {leesNaam() ? `Naam: ${leesNaam()}` : 'Kies \'n naam'}
        </button>
      )}
      <button className="vf-knop vf-knop-spook" onClick={terug}>Terug</button>
    </div>
  )
}
