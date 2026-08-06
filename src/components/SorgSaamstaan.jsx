/* ────────────────────────────────────────────────────────────
   Saamstaan — die voet van 'n storie.

     🙏❤️🤗 12                              3 kommentaar
     ────────────────────────────────────────────────────
        ♡  Hou van              💬  Reageer
     ────────────────────────────────────────────────────
     ◯  Ek bid vandag saam met jou.
     ◯  Jy is nie alleen nie.
     Wys al 7 kommentaar

   Dit was 'n ry pille met woorde op — "Ek bid saam", "Ek hoor jou" — en dit
   het gelyk soos 'n VORM, nie soos 'n muur nie. Elke mens met 'n foon ken
   Facebook en Instagram se vorm: 'n opsomming bo, 'n dun balk met twee of
   drie aksies, en die gesprek daaronder. Niemand hoef dit te leer nie.

   Drie besluite:

   1. Die aksiebalk het TWEE knoppies, nie vier nie. 'n Hart en 'n
      spraakborrel. Vier knoppies met woorde op is 'n keuselys; twee is 'n
      balk.

   2. Druk 'n mens die hart, gaan die emoji-kiesers oop — soos Facebook se
      lang druk, maar met 'n gewone druk, want 'n lang druk op die web is
      onbetroubaar en niemand weet dit is daar nie.

   3. Die opsomming wys net wat GESTUUR is. 'n Reaksie wat niemand gedruk
      het nie, wys geen nul nie.

   Op 'n SENSITIEWE plasing is daar geen vrye teks nie — die bediener besluit
   dit, nie hierdie kode nie. Sien `sorgSaamstaan.js`.

   Geen transform of opacity op :active nie — net kleur. Sien CLAUDE.md.
   ──────────────────────────────────────────────────────────── */

import { useState, useRef, useEffect } from 'react'
import { REAKSIES, KLAAR_WOORDE, wysReaksies, wysGelees, MAKS_WOORD } from '../data/sorgSaamstaan'
import { stuurReaksie, stuurWoord, myReaksie, rapporteerWoord } from '../data/sorgMuur'
import './SorgSaamstaan.css'

/* Die een wat die hart wys wanneer 'n mens nog niks gekies het nie. */
const VOORAF = 'hoor'

export default function SorgSaamstaan({ plasing }) {
  const [tellings, setTellings] = useState(plasing.reaksies || {})
  const [myne, setMyne] = useState(() => myReaksie(plasing.id))
  const [woorde, setWoorde] = useState(plasing.woorde || [])
  const [totaalWoorde, setTotaalWoorde] = useState(plasing.woordeTotaal || 0)
  const [alleWoorde, setAlleWoorde] = useState(false)
  const [kiesOop, setKiesOop] = useState(false)
  const [skryfOop, setSkryfOop] = useState(false)
  const [eie, setEie] = useState('')
  const [besig, setBesig] = useState(false)
  const [gestuur, setGestuur] = useState(false)
  const [fout, setFout] = useState('')
  const balkRef = useRef(null)

  const { gewys, totaal } = wysReaksies(tellings, plasing.saam)
  const gelees = wysGelees(plasing.gelees)
  const myReak = myne ? REAKSIES.find(r => r.sleutel === myne) : null

  /* Druk 'n mens buite die kiesers, gaan hulle toe. Sonder dit bly hulle oop
     terwyl 'n mens verder lees, en dan is daar drie oop kiesers op die skerm. */
  useEffect(() => {
    if (!kiesOop) return
    const weg = e => { if (!balkRef.current || !balkRef.current.contains(e.target)) setKiesOop(false) }
    document.addEventListener('pointerdown', weg)
    return () => document.removeEventListener('pointerdown', weg)
  }, [kiesOop])

  async function druk(soort) {
    setKiesOop(false)
    if (myne || besig) return
    setBesig(true)
    /* Dadelik, ook op 'n stadige lyn. Die bediener se antwoord oorskryf dit. */
    setMyne(soort)
    setTellings(t => ({ ...t, [soort]: (Number(t[soort]) || 0) + 1 }))
    const nuut = await stuurReaksie(plasing.id, soort)
    if (nuut) setTellings(nuut)
    setBesig(false)
  }

  function hartDruk() {
    if (myne) return          // klaar gekies; die kiesers help nie meer nie
    setKiesOop(o => !o)
  }

  async function stuurKlaar(sleutel) {
    if (besig || gestuur) return
    setBesig(true)
    setFout('')
    const d = await stuurWoord(plasing.id, { woord: sleutel })
    setBesig(false)
    if (d && d.fout) { setFout(d.fout); return }
    klaarNaStuur(d)
  }

  async function stuurEie() {
    const t = eie.trim()
    if (!t || besig || gestuur) return
    setBesig(true)
    setFout('')
    const d = await stuurWoord(plasing.id, { teks: t })
    setBesig(false)
    if (d && d.fout) { setFout(d.fout); return }
    klaarNaStuur(d)
  }

  /* Een plek waar 'n geslaagde stuur afgehandel word.

     Dit was twee plekke, en die een het die woord by die lys gesit terwyl
     die ander 'n aparte "dankie"-blokkie met DIESELFDE sin gewys het. Op die
     skerm het jou opmerking dus twee keer verskyn. */
  function klaarNaStuur(d) {
    setEie('')
    setSkryfOop(false)
    setGestuur(true)
    if (d && d.woord) {
      setWoorde(w => [...w, { id: d.woord.id, teks: d.woord.teks, myne: true }])
      setTotaalWoorde(n => n + 1)
      setAlleWoorde(true)          // wys dit, ook al is dit die derde
    } else if (d && d.wag) {
      setFout('Dankie. Dewald kyk gou daarna voor dit wys.')
    }
  }

  async function rapporteer(id) {
    if (!window.confirm('Rapporteer hierdie opmerking?\n\nDit gaan dadelik weg en Dewald kyk daarna.')) return
    setWoorde(w => w.filter(x => x.id !== id))
    setTotaalWoorde(n => Math.max(0, n - 1))
    await rapporteerWoord(id)
  }

  const sigbaar = alleWoorde ? woorde : woorde.slice(0, 2)
  const versteek = totaalWoorde - sigbaar.length

  return (
    <div className="ss">

      {/* ── Die opsomming ── */}
      {(totaal > 0 || totaalWoorde > 0 || gelees > 0) && (
        <div className="ss-som">
          {totaal > 0 && (
            <span className="ss-som-links">
              <span className="ss-tekens" aria-hidden="true">
                {gewys.map(r => <span key={r.sleutel} className="ss-teken">{r.teken}</span>)}
              </span>
              <span className="ss-totaal">{totaal}</span>
            </span>
          )}
          <span className="ss-som-regs">
            {totaalWoorde > 0 && (
              <button className="ss-som-knop" onClick={() => setAlleWoorde(true)}>
                {totaalWoorde} {totaalWoorde === 1 ? 'opmerking' : 'opmerkings'}
              </button>
            )}
            {gelees > 0 && <span className="ss-gelees">{gelees} gelees</span>}
          </span>
        </div>
      )}

      {/* ── Die aksiebalk ── */}
      <div className="ss-balk" ref={balkRef}>
        {/* Die kiesers dryf BO die balk, soos op Facebook. */}
        {kiesOop && (
          <div className="ss-kies" role="menu">
            {REAKSIES.map(r => (
              <button
                key={r.sleutel}
                className="ss-kies-knop"
                role="menuitem"
                aria-label={r.naam}
                title={r.naam}
                onClick={() => druk(r.sleutel)}
              >
                {r.teken}
              </button>
            ))}
          </div>
        )}

        <button
          className={`ss-aksie${myne ? ' myne' : ''}`}
          onClick={hartDruk}
          aria-expanded={kiesOop}
        >
          <span className="ss-aksie-teken" aria-hidden="true">{myReak ? myReak.teken : '♡'}</span>
          <span>{myReak ? myReak.naam : 'Hou van'}</span>
        </button>

        <button
          className="ss-aksie"
          onClick={() => { setKiesOop(false); setSkryfOop(o => !o); setAlleWoorde(true) }}
        >
          <span className="ss-aksie-teken" aria-hidden="true">💬</span>
          <span>Reageer</span>
        </button>
      </div>

      {/* ── Die opmerkings ── */}
      {sigbaar.length > 0 && (
        <ul className="ss-woorde">
          {sigbaar.map(w => (
            <li key={w.id} className="ss-woord">
              <span className="ss-avatar" aria-hidden="true" />
              <div className="ss-borrel">
                <p className="ss-wie">{w.myne ? 'Jy' : 'Anoniem'}</p>
                <p className="ss-woord-teks">{w.teks}</p>
              </div>
              {!w.myne && (
                <button
                  className="ss-rap"
                  aria-label="Rapporteer hierdie opmerking"
                  title="Rapporteer"
                  onClick={() => rapporteer(w.id)}
                >
                  ⋯
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {versteek > 0 && (
        <button className="ss-meer" onClick={() => setAlleWoorde(true)}>
          Wys al {totaalWoorde} opmerkings
        </button>
      )}
      {alleWoorde && woorde.length > 2 && (
        <button className="ss-meer" onClick={() => setAlleWoorde(false)}>Wys minder</button>
      )}

      {/* ── Skryf iets ── */}
      {skryfOop && !gestuur && (
        <div className="ss-skryf">
          {/* Dewald se sinne as vinnige keuses, nie as 'n opskrif met 'n
              instruksie nie. Wie wil tik, tik; wie nie weet wat om te sê nie,
              druk een. */}
          <div className="ss-vinnig">
            {KLAAR_WOORDE.map(w => (
              <button
                key={w.sleutel}
                className="ss-vinnig-knop"
                disabled={besig}
                onClick={() => stuurKlaar(w.sleutel)}
              >
                {w.teks}
              </button>
            ))}
          </div>

          {!plasing.sensitief && (
            <>
              <div className="ss-invoer-ry">
                <span className="ss-avatar" aria-hidden="true" />
                <textarea
                  className="ss-invoer"
                  value={eie}
                  onChange={e => setEie(e.target.value.slice(0, MAKS_WOORD))}
                  maxLength={MAKS_WOORD}
                  rows={2}
                  placeholder="Skryf iets sags…"
                />
              </div>
              <div className="ss-skryf-voet">
                <span className="ss-oor">{MAKS_WOORD - eie.length}</span>
                <button className="ss-stuur" disabled={besig || !eie.trim()} onClick={stuurEie}>
                  Plaas
                </button>
              </div>
              <p className="ss-riglyn">
                Hou dit kort en sag. Geen raad, diagnoses of kontakbesonderhede nie.
              </p>
            </>
          )}

          {plasing.sensitief && (
            <p className="ss-riglyn">
              Hierdie storie is swaar. Kies een van die woorde hier bo — dit is
              genoeg, en dit is die veiligste ding om te stuur.
            </p>
          )}
        </div>
      )}

      {fout && <p className="ss-fout">{fout}</p>}
    </div>
  )
}
