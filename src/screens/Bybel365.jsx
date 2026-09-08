/* ── DIE HELE BYBEL IN 365 DAE ──
 *
 * Elke dag: 'n paar hoofstukke uit DRIE kante van die Bybel tegelyk — die
 * verhaal, die wysheid en profete, en Jesus. Dit is die rede waarom 'n mens
 * nie negentig dae lank net Levitikus kry nie, en dit is die enigste ding wat
 * hierdie plan van "lees van voor af" onderskei.
 *
 * ── Dit skep GEEN Bybel nie ──
 *
 * Elke "Lees"-knoppie stuur `open-bybel` met die GAB se eie boekkode. Die
 * mens lees in die app se eie Bybel, in sy eie vertaling, met die
 * kruisverwysings en die soek wat reeds daar is. Hierdie skerm is 'n PAD
 * daarheen, nie 'n tweede leser nie. Word dit ooit sy eie teks, is die hele
 * punt weg.
 *
 * ── Daarom sit dit op z-index 239 en nie 400 nie ──
 *
 * Die ander leesplanne (`DaeVanVrede.css`) sit op 400. Hulle wys hul teks
 * INLYN en maak nooit die Bybel oop nie, dus is dit reg vir hulle.
 *
 * Hierdie een stuur mense na die Bybel, en die Bybel sit op 250. Op 400 sou
 * die Bybel AGTER hierdie skerm oopmaak en die knoppie sou niks doen nie.
 * VolgJesusLewe het presies hier geval; sien CLAUDE.md.
 *
 * ── Die plan word GEHAAL, nie gebundel nie ──
 *
 * `public/bybel365.json`, 29 KB, gebou deur `skrifte/bou-bybel365.mjs` uit
 * Dewald se bronpakket en by die bou teen die GAB gekeur. Dit is 29 KB wat
 * elke mens wat hierdie plan NIE doen nie, nooit aflaai nie — dieselfde
 * besluit as die GAB se 66 boeke.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  leesteVan, dagVan, dagKlaar, huidigeDag, allesKlaar,
  vordering, merk, merkDag, spoorNaam, standUit, SLEUTEL, STAND_SLEUTEL,
} from '../data/bybel365'
import { boekNaam } from '../data/bybelBoeke'
import { sharePlan } from '../shareUtil'
import './Bybel365.css'

/* Een keer per sessie gehaal, soos die ander planne. */
let gekasPlan = null

function leesGelees() {
  try { return JSON.parse(localStorage.getItem(SLEUTEL) || '[]') } catch { return [] }
}
function skryfGelees(lys) {
  try { localStorage.setItem(SLEUTEL, JSON.stringify(lys)) } catch { /* privaat modus */ }
}

export default function Bybel365({ onClose }) {
  const [plan, setPlan]     = useState(gekasPlan)
  const [besig, setBesig]   = useState(!gekasPlan)
  const [fout, setFout]     = useState(false)
  const [gelees, setGelees] = useState(leesGelees)
  const [dagNr, setDagNr]   = useState(null)
  const lyfRef = useRef(null)

  useEffect(() => {
    if (gekasPlan) return
    let lewendig = true
    fetch('/bybel365.json')
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(d => {
        if (!lewendig) return
        gekasPlan = d; setPlan(d); setBesig(false)
      })
      .catch(() => { if (lewendig) { setFout(true); setBesig(false) } })
    return () => { lewendig = false }
  }, [])

  /* Waar hierdie mens staan. Dit word EEN keer bereken wanneer die plan land;
     daarna stap hy self met die pyle. Sou ons dit by elke merk herbereken, sou
     die skerm onder sy vingers na die volgende dag spring. */
  useEffect(() => {
    if (plan && dagNr === null) setDagNr(huidigeDag(plan, gelees))
  }, [plan, dagNr, gelees])

  /* EEN plek waar vordering geskryf word: die waarheid (`b365_gelees`) en die
     klein opsomming waaruit die kaart op die leesplan-lys sy "Gaan voort —
     dag 47" haal. Twee skrywers hier sou beteken die kaart kan van die plan
     af wegdryf. */
  const stel = useCallback(lys => {
    setGelees(lys)
    skryfGelees(lys)
    if (plan) {
      try { localStorage.setItem(STAND_SLEUTEL, JSON.stringify(standUit(plan, lys))) }
      catch { /* privaat modus */ }
    }
  }, [plan])

  if (besig) {
    return (
      <div className="b365">
        <Kop onClose={onClose} />
        <div className="b365-lyf"><p className="b365-laai">Een oomblik…</p></div>
      </div>
    )
  }
  if (fout || !plan) {
    return (
      <div className="b365">
        <Kop onClose={onClose} />
        <div className="b365-lyf">
          <p className="b365-laai">
            Ons kon nie die plan laai nie. Kyk of jy aanlyn is en probeer weer.
          </p>
        </div>
      </div>
    )
  }

  const nr    = dagNr || 1
  const dag   = dagVan(plan, nr)
  const lys   = leesteVan(dag)
  const klaar = dagKlaar(dag, gelees)
  const v     = vordering(plan, gelees)
  const eindeBereik = allesKlaar(plan, gelees)

  function lees(l) {
    /* Presies dieselfde gebeurtenis as VOLG JESUS se LEES-kaart. Geen vers en
       geen versTot: 'n mens lees die HELE hoofstuk. */
    window.dispatchEvent(new CustomEvent('open-bybel', {
      detail: { boek: l.boek, hoofstuk: l.hoofstuk },
    }))
  }

  function wissel(l) {
    stel(merk(gelees, l.sleutel, !gelees.includes(l.sleutel)))
  }

  function heleDag() {
    const nuut = merkDag(gelees, dag, !klaar)
    stel(nuut)
    /* Klaargemaak? Skuif vorentoe — maar NOOIT verby die laaste dag, en nooit
       wanneer 'n mens pas ONgemerk het nie. */
    if (!klaar && nr < plan.totaalDae) {
      setDagNr(nr + 1)
      if (lyfRef.current) lyfRef.current.scrollTop = 0
    }
  }

  function skuif(na) {
    const n = Math.min(plan.totaalDae, Math.max(1, na))
    setDagNr(n)
    if (lyfRef.current) lyfRef.current.scrollTop = 0
  }

  /* Die spore, in die volgorde waarin hulle op die dag staan. */
  const groepe = []
  for (const l of lys) {
    const laaste = groepe[groepe.length - 1]
    if (laaste && laaste.spoor === l.spoor) laaste.items.push(l)
    else groepe.push({ spoor: l.spoor, items: [l] })
  }

  return (
    <div className="b365">
      <Kop onClose={onClose} />

      <div className="b365-lyf" ref={lyfRef}>
        <div className="b365-blad">

          {/* ── Waar hierdie mens staan ── */}
          <div className="b365-vorder">
            <div className="b365-vorder-balk">
              <div className="b365-vorder-vul" style={{ width: `${v.persent}%` }} />
            </div>
            <p className="b365-vorder-teks">
              <b>{v.dae}</b> van {v.totaalDae} dae · {v.gelees} van {v.totaal} hoofstukke
            </p>
          </div>

          {eindeBereik && (
            <div className="b365-klaar-blok">
              <p className="b365-klaar-kop">JY HET DIE HELE BYBEL GELEES.</p>
              <p className="b365-klaar-lyf">
                Al 66 boeke, al {v.totaal} hoofstukke. Dit is nie 'n klein ding nie.
              </p>
            </div>
          )}

          {/* ── Die dag ── */}
          <div className="b365-dagkop">
            <button className="b365-pyl" onClick={() => skuif(nr - 1)}
                    disabled={nr <= 1} aria-label="Vorige dag">‹</button>
            <div className="b365-dagnaam">
              <span className="b365-dagnr">DAG {nr}</span>
              <span className="b365-dagvan">van {plan.totaalDae}</span>
            </div>
            <button className="b365-pyl" onClick={() => skuif(nr + 1)}
                    disabled={nr >= plan.totaalDae} aria-label="Volgende dag">›</button>
          </div>

          {groepe.map((g, i) => (
            <div className="b365-groep" key={i}>
              <div className="b365-spoor">{spoorNaam(g.spoor)}</div>
              {g.items.map(l => {
                const gedoen = gelees.includes(l.sleutel)
                return (
                  <div className={`b365-ry${gedoen ? ' gedoen' : ''}`} key={l.sleutel}>
                    {/* Twee dinge, twee knoppies. Die merkie sê "ek het gelees";
                        die res van die ry maak die Bybel oop. Een knoppie wat
                        albei doen, sou beteken 'n mens kan nie 'n merkie
                        regmaak sonder om die Bybel oop te maak nie. */}
                    <button
                      className="b365-merk"
                      onClick={() => wissel(l)}
                      aria-label={gedoen ? 'Merk as ongelees' : 'Merk as gelees'}
                    >
                      {gedoen ? '✓' : ''}
                    </button>
                    <button className="b365-oop" onClick={() => lees(l)}>
                      {/* Die NAAM, nooit die kode. Die plan dra `GEN` omdat
                          dit is wat `open-bybel` verwag; `boekNaam` is die
                          app se eie tabel — dieselfde een wat die Bybel se
                          eie kop gebruik, sodat die twee skerms nooit
                          verskillende name vir een boek wys nie. */}
                      <span className="b365-verwysing">{boekNaam(l.boek)} {l.hoofstuk}</span>
                      <span className="b365-lees">Lees ›</span>
                    </button>
                  </div>
                )
              })}
            </div>
          ))}

          <button className={`b365-knop${klaar ? ' b365-knop-uit' : ''}`} onClick={heleDag}>
            {klaar ? 'Dag gelees ✓' : 'Merk die dag as gelees'}
          </button>

          {klaar && nr < plan.totaalDae && (
            <button className="b365-stil" onClick={() => skuif(nr + 1)}>
              Gaan aan na Dag {nr + 1}
            </button>
          )}

          <button
            className="b365-stil"
            onClick={() => sharePlan(
              'Die hele Bybel in 365 dae',
              'Ek lees die hele Bybel in 365 dae saam met Daaglikse Hoop. Kom saam?',
            )}
          >
            Deel hierdie plan
          </button>
        </div>
      </div>
    </div>
  )
}

function Kop({ onClose }) {
  return (
    <div className="b365-kop">
      <button className="b365-x" onClick={onClose} aria-label="Maak toe">✕</button>
      <span className="b365-titel">DIE HELE BYBEL IN 365 DAE</span>
      <span className="b365-kop-leeg" />
    </div>
  )
}
