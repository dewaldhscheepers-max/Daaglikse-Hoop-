/* ────────────────────────────────────────────────────────────
   "Vertel my wat swaar is" — die vorm.

   Dit is die skerm waar iemand sy swaarste ding tik. Elke besluit hier is
   daarvoor gemaak, en nie vir netheid nie:

   · DIE GEVAAR-VRAAG KOM EERSTE. Voordat iemand 'n woord tik, vra ons of
     hy nou in gevaar is. Antwoord hy ja, kry hy die nommers dadelik en nie
     ná drie skerms nie. Sy hulp kan nie wag tot Dewald môre lees nie.

   · DIE KRISISBAND LOOP TERWYL HY TIK. Tref die woordlys, verskyn die
     nommers bo-aan die vorm — sonder om hom te keer, sonder om te preek, en
     sonder om die boodskap te blokkeer.

   · GEEN VERSOEK OM GELD OP HIERDIE SKERM NIE. Nooit waar iemand sy seer
     tik nie.

   · DIE TEKS WORD NÊRENS PLAASLIK GESTOOR NIE, ook nie as 'n konsep nie.
     In baie huise is die foon gedeel.

   · DIE DRIE TOESTEMMINGS IS NIE 'N FORMALITEIT NIE. Die boodskap gaan
     openbaar, dit mag verkort word om die persoon te beskerm, en niemand
     hou wag by die muur nie. Al drie moet gemerk wees.

   Geen transform of opacity op :active nie — net kleur. Sien CLAUDE.md.
   ──────────────────────────────────────────────────────────── */

import { useState, useEffect, useRef } from 'react'
import { ONDERWERPE } from '../data/sorgOnderwerpe'
import { krisisTreffers } from '../data/sorgKrisis'
import { stuurBoodskap } from '../data/sorgStuur'
import { GRENSSIN } from '../data/sorgNommers'
import SorgNommers from './SorgNommers'
import SorgKlaar from './SorgKlaar'
import './SorgVorm.css'

const MIN_LENGTE = 15
const MAKS_LENGTE = 2000

export default function SorgVorm({ oop, onSluit, videoData }) {
  const [stap, setStap] = useState('gevaar')       // gevaar · nommers · skryf · klaar
  const [onderwerp, setOnderwerp] = useState('')
  const [teks, setTeks] = useState('')
  const [anoniem, setAnoniem] = useState(true)
  const [naam, setNaam] = useState('')
  const [toestemmings, setToestemmings] = useState({ openbaar: false, redigeer: false, geenWaarborg: false })
  const [besig, setBesig] = useState(false)
  const [fout, setFout] = useState('')
  const [uitslag, setUitslag] = useState(null)
  const bo = useRef(null)

  /* Elke keer wat die vorm oopmaak, begin dit skoon. Niks van die vorige
     mens se boodskap mag oorbly nie. */
  useEffect(() => {
    if (!oop) return
    setStap('gevaar')
    setOnderwerp('')
    setTeks('')
    setAnoniem(true)
    setNaam('')
    setToestemmings({ openbaar: false, redigeer: false, geenWaarborg: false })
    setBesig(false)
    setFout('')
    setUitslag(null)
  }, [oop])

  /* Rol na bo wanneer die stap verander — anders begin die nuwe skerm halfpad
     af, presies die fout wat Dewald op die gebedskaart uitgewys het. */
  useEffect(() => {
    if (bo.current) bo.current.scrollTop = 0
  }, [stap])

  if (!oop) return null

  const treffers = krisisTreffers(teks)
  const langGenoeg = teks.trim().length >= MIN_LENGTE
  const almalGemerk = toestemmings.openbaar && toestemmings.redigeer && toestemmings.geenWaarborg
  const magStuur = langGenoeg && almalGemerk && !besig

  const merk = s => setToestemmings(t => ({ ...t, [s]: !t[s] }))

  async function stuur() {
    if (!magStuur) return
    setBesig(true)
    setFout('')
    const d = await stuurBoodskap({
      teks,
      onderwerp: onderwerp || 'ander',
      naam: anoniem ? '' : naam,
      anoniem,
      toestemmings,
    })
    setBesig(false)

    if (d.ok) {
      /* Die teks gaan hier uit die geheue uit. Ons het dit nie meer nodig
         nie, en dit hoort nie in 'n React-toestand rond te lê nie. */
      setTeks('')
      setUitslag(d)
      setStap('klaar')
      return
    }
    setFout(d.boodskap || d.fout || 'Ons kon dit nie stuur nie. Probeer asseblief weer.')
  }

  return (
    <div className="sv-oor" role="dialog" aria-label="Vertel my wat swaar is">
      <div className="sv-kop">
        <button className="sv-terug" onClick={onSluit} aria-label="Maak toe">
          {stap === 'klaar' ? 'Klaar' : 'Terug'}
        </button>
        <span className="sv-kop-titel">
          {stap === 'klaar' ? 'Ons het jou boodskap' : 'Vertel my wat swaar is'}
        </span>
      </div>

      <div className="sv-rol" ref={bo}>

        {/* ── Die gevaar-vraag, voor alles ── */}
        {stap === 'gevaar' && (
          <div className="sv-blok">
            <h2 className="sv-vraag">
              Voordat jy skryf — is jy, 'n kind, of iemand anders op hierdie
              oomblik in gevaar?
            </h2>
            <p className="sv-fyn">
              Ons lees elke boodskap self, maar nie noodwendig vanaand nie.
              Wanneer dit nou is, is 'n oproep vinniger as ons.
            </p>
            <button className="sv-groot-knop sv-rooi" onClick={() => setStap('nommers')}>
              Ja, dit is nou
            </button>
            <button className="sv-groot-knop" onClick={() => setStap('skryf')}>
              Nee — ek wil skryf
            </button>
          </div>
        )}

        {/* ── Die nommers, sonder om iets terug te hou ── */}
        {stap === 'nommers' && (
          <div className="sv-blok">
            <h2 className="sv-vraag">Bel asseblief nou een van hierdie nommers.</h2>
            <p className="sv-fyn">
              Hulle is gratis en hulle antwoord. Moenie hier wag nie.
            </p>
            <SorgNommers />
            <p className="sv-fyn sv-fyn-mid">
              Jy kan daarna nog steeds skryf. Ons wil ook hoor.
            </p>
            <button className="sv-groot-knop" onClick={() => setStap('skryf')}>
              Ek wil ook skryf
            </button>
          </div>
        )}

        {/* ── Die vorm self ── */}
        {stap === 'skryf' && (
          <div className="sv-blok">

            {treffers.length > 0 && (
              <div className="sv-krisis">
                <p className="sv-krisis-kop">Ons het gelees wat jy skryf.</p>
                <p className="sv-krisis-teks">
                  Jou boodskap gaan deur — moet dit asseblief nie uitvee nie.
                  Maar iemand kan nou met jou praat, en dit is vinniger as ons.
                </p>
                {/* Kompak, want dit skuif bo-in terwyl iemand nog tik. Al vyf
                    nommers sou sy eie woorde onder uit die skerm stoot. */}
                <SorgNommers kompak />
              </div>
            )}

            <label className="sv-etiket" htmlFor="sv-teks">Wat is swaar?</label>
            <textarea
              id="sv-teks"
              className="sv-teks"
              value={teks}
              maxLength={MAKS_LENGTE}
              placeholder="Skryf dit net soos dit is. Jy hoef dit nie mooi te maak nie."
              onChange={e => setTeks(e.target.value)}
            />
            <div className="sv-teller">
              {teks.length > MAKS_LENGTE - 300
                ? `${MAKS_LENGTE - teks.length} karakters oor`
                : !langGenoeg && teks.length > 0
                  ? 'Skryf net \'n bietjie meer, sodat ons kan verstaan.'
                  : ' '}
            </div>

            <label className="sv-etiket">Waaroor gaan dit?</label>
            <p className="sv-fyn sv-fyn-eng">
              Dit help ons om vir jou dadelik iets te wys wat kan help.
            </p>
            <div className="sv-onderwerpe">
              {ONDERWERPE.map(o => (
                <button
                  key={o.sleutel}
                  className={`sv-onderwerp${onderwerp === o.sleutel ? ' gekies' : ''}`}
                  onClick={() => setOnderwerp(onderwerp === o.sleutel ? '' : o.sleutel)}
                >
                  {o.naam}
                </button>
              ))}
            </div>

            <label className="sv-etiket">Hoe moet dit wys?</label>
            <div className="sv-naam-keuse">
              <button
                className={`sv-keuse${anoniem ? ' gekies' : ''}`}
                onClick={() => setAnoniem(true)}
              >
                Anoniem
              </button>
              <button
                className={`sv-keuse${!anoniem ? ' gekies' : ''}`}
                onClick={() => setAnoniem(false)}
              >
                Met my naam
              </button>
            </div>
            {!anoniem && (
              <>
                <input
                  className="sv-naam"
                  value={naam}
                  maxLength={24}
                  placeholder="Jou voornaam"
                  onChange={e => setNaam(e.target.value)}
                />
                <p className="sv-fyn sv-fyn-eng">
                  Net 'n voornaam. Ons wys nooit 'n van, 'n nommer of 'n
                  e-posadres nie — ook nie as jy dit in jou boodskap sit nie.
                </p>
              </>
            )}

            {/* ── Die drie ── */}
            <div className="sv-toestemmings">
              <label className="sv-blok-merk">
                <input type="checkbox" checked={toestemmings.openbaar} onChange={() => merk('openbaar')} />
                <span>
                  Ek gee toestemming dat my boodskap openbaar op die muur mag
                  wys, sodat ander wat dieselfde deurgaan, kan sien hulle is
                  nie alleen nie.
                </span>
              </label>
              <label className="sv-blok-merk">
                <input type="checkbox" checked={toestemmings.redigeer} onChange={() => merk('redigeer')} />
                <span>
                  Ek verstaan dat my boodskap verkort of verander mag word om
                  my en ander mense te beskerm, en dat dit dalk glad nie wys
                  nie.
                </span>
              </label>
              <label className="sv-blok-merk">
                <input type="checkbox" checked={toestemmings.geenWaarborg} onChange={() => merk('geenWaarborg')} />
                <span>
                  Ek verstaan dat dit nie 'n nooddiens of terapie is nie, en
                  dat 'n persoonlike antwoord nie gewaarborg is nie.
                </span>
              </label>
            </div>

            {fout && <p className="sv-fout">{fout}</p>}

            <button className="sv-groot-knop sv-stuur" disabled={!magStuur} onClick={stuur}>
              {besig ? 'Besig om te stuur…' : 'Stuur my boodskap'}
            </button>

            <p className="sv-grens">{GRENSSIN}</p>
          </div>
        )}

        {/* ── Ná die stuur ── */}
        {stap === 'klaar' && uitslag && (
          <SorgKlaar uitslag={uitslag} videoData={videoData} onSluit={onSluit} />
        )}
      </div>
    </div>
  )
}
