/* ────────────────────────────────────────────────────────────
   Saamstaan — die strook onder 'n storie.

     ♥🙏🤗  24 mense dra dit saam met jou       142 het gelees
     [🙏 Ek bid saam] [❤️ Ek hoor jou] [🤗 ...] [💪 ...]

     "Jy is nie alleen nie."
     "Ek bid vandag saam met jou."
     Lees al 7 woorde

     [Stuur 'n woord van ondersteuning]

   Twee ontwerpbesluite dra hierdie hele ding, en albei kom uit een feit: die
   muur is JONK. 'n Plasing kry vyf drukke, nie vyfhonderd nie.

   1. 'n Reaksie wat niemand gedruk het nie, wys GEEN telling nie. Ses
      knoppies met ses nulle onder iemand se storie lyk dooier as een enkele
      1. Wat 'n mens sien, is wat gestuur IS, plus een groot totaal.

   2. Die klaargemaakte woorde staan eerste, want hulle werk van dag een af.
      Dewald het hulle geskryf, dus is daar niks om te modereer nie, en hulle
      verskyn dadelik. Vrye teks is die tweede stap.

   Op 'n SENSITIEWE plasing is daar geen vrye teks nie — net die
   klaargemaakte woorde. Die bediener besluit dit, nie hierdie kode nie; ons
   wys net wat hy sê. Sien `sorgSaamstaan.js`.

   Geen transform of opacity op :active nie — net kleur. Sien CLAUDE.md.
   ──────────────────────────────────────────────────────────── */

import { useState } from 'react'
import { REAKSIES, KLAAR_WOORDE, wysReaksies, wysGelees, MAKS_WOORD } from '../data/sorgSaamstaan'
import { stuurReaksie, stuurWoord, myReaksie, rapporteerWoord } from '../data/sorgMuur'
import './SorgSaamstaan.css'

export default function SorgSaamstaan({ plasing }) {
  const [tellings, setTellings] = useState(plasing.reaksies || {})
  const [myne, setMyne] = useState(() => myReaksie(plasing.id))
  const [woorde, setWoorde] = useState(plasing.woorde || [])
  const [totaalWoorde, setTotaalWoorde] = useState(plasing.woordeTotaal || 0)
  const [alleWoorde, setAlleWoorde] = useState(false)
  const [skryfOop, setSkryfOop] = useState(false)
  const [eie, setEie] = useState('')
  const [besig, setBesig] = useState(false)
  const [gestuur, setGestuur] = useState('')
  const [fout, setFout] = useState('')

  const { gewys, totaal } = wysReaksies(tellings, plasing.saam)
  const gelees = wysGelees(plasing.gelees)

  async function druk(soort) {
    if (myne || besig) return
    setBesig(true)
    /* Dadelik, ook op 'n stadige lyn. Die bediener se antwoord oorskryf dit. */
    setMyne(soort)
    setTellings(t => ({ ...t, [soort]: (Number(t[soort]) || 0) + 1 }))
    const nuut = await stuurReaksie(plasing.id, soort)
    if (nuut) setTellings(nuut)
    setBesig(false)
  }

  async function stuurKlaar(sleutel, teks) {
    if (besig || gestuur) return
    setBesig(true)
    setFout('')
    const d = await stuurWoord(plasing.id, { woord: sleutel })
    setBesig(false)
    if (d && d.fout) { setFout(d.fout); return }
    setGestuur(teks)
    if (d && d.woord) {
      setWoorde(w => [...w, { id: d.woord.id, teks: d.woord.teks }])
      setTotaalWoorde(n => n + 1)
    }
  }

  async function stuurEie() {
    const t = eie.trim()
    if (!t || besig || gestuur) return
    setBesig(true)
    setFout('')
    const d = await stuurWoord(plasing.id, { teks: t })
    setBesig(false)
    if (d && d.fout) { setFout(d.fout); return }
    setEie('')
    setSkryfOop(false)
    if (d && d.wag) {
      /* Eerlik wees. 'n Mens wat sy woord nie sien nie en niks hoor nie,
         dink die app is stukkend. */
      setGestuur('Dankie. Dewald kyk gou daarna voor dit wys.')
      return
    }
    setGestuur(t)
    if (d && d.woord) {
      setWoorde(w => [...w, { id: d.woord.id, teks: d.woord.teks }])
      setTotaalWoorde(n => n + 1)
    }
  }

  async function rapporteer(id) {
    if (!window.confirm('Rapporteer hierdie woord?\n\nDit gaan dadelik van die muur af en Dewald kyk daarna.')) return
    setWoorde(w => w.filter(x => x.id !== id))
    setTotaalWoorde(n => Math.max(0, n - 1))
    await rapporteerWoord(id)
  }

  const sigbaar = alleWoorde ? woorde : woorde.slice(0, 2)
  const nogWoorde = totaalWoorde - sigbaar.length

  return (
    <div className="ss">

      {/* ── Wat gestuur is ── */}
      {(totaal > 0 || gelees > 0) && (
        <div className="ss-som">
          {totaal > 0 && (
            <>
              <span className="ss-tekens" aria-hidden="true">
                {gewys.map(r => <span key={r.sleutel}>{r.teken}</span>)}
              </span>
              <span className="ss-totaal">
                {totaal} {totaal === 1 ? 'mens dra' : 'mense dra'} dit saam met jou
              </span>
            </>
          )}
          {gelees > 0 && <span className="ss-gelees">{gelees} het gelees</span>}
        </div>
      )}

      {/* ── Die vier knoppies ── */}
      <div className="ss-knoppe">
        {REAKSIES.map(r => (
          <button
            key={r.sleutel}
            className={`ss-knop${myne === r.sleutel ? ' myne' : ''}`}
            onClick={() => druk(r.sleutel)}
            disabled={!!myne}
            aria-pressed={myne === r.sleutel}
          >
            <span className="ss-knop-teken" aria-hidden="true">{r.teken}</span>
            <span className="ss-knop-naam">{r.naam}</span>
          </button>
        ))}
      </div>

      {/* ── Die woorde ── */}
      {sigbaar.length > 0 && (
        <ul className="ss-woorde">
          {sigbaar.map(w => (
            <li key={w.id} className="ss-woord">
              <span className="ss-woord-teks">{w.teks}</span>
              {/* Een druk haal dit dadelik af en sit dit in Dewald se hopie.
                  Klein met opset — dit is 'n uitweg, nie 'n uitnodiging nie. */}
              <button
                className="ss-rap"
                title="Rapporteer hierdie woord"
                aria-label="Rapporteer hierdie woord"
                onClick={() => rapporteer(w.id)}
              >
                Rapporteer
              </button>
            </li>
          ))}
        </ul>
      )}

      {totaalWoorde > 2 && (
        <button className="ss-meer" onClick={() => setAlleWoorde(o => !o)}>
          {alleWoorde ? 'Wys minder' : `Lees al ${totaalWoorde} woorde`}
        </button>
      )}

      {/* ── Self een stuur ── */}
      {gestuur ? (
        <p className="ss-dankie">{gestuur}</p>
      ) : (
        <>
          {!skryfOop && (
            <div className="ss-klaar">
              <p className="ss-klaar-kop">Stuur ’n woord van ondersteuning</p>
              <div className="ss-klaar-lys">
                {KLAAR_WOORDE.map(w => (
                  <button
                    key={w.sleutel}
                    className="ss-klaar-knop"
                    disabled={besig}
                    onClick={() => stuurKlaar(w.sleutel, w.teks)}
                  >
                    {w.teks}
                  </button>
                ))}
                {/* Op 'n sensitiewe plasing is daar geen vrye teks nie. Geen
                    filter vang "hospitale het my ma doodgemaak" — daar is
                    niks verkeerd met die woorde nie, net met die raad. */}
                {!plasing.sensitief && (
                  <button className="ss-eie-knop" onClick={() => setSkryfOop(true)}>
                    Skryf jou eie
                  </button>
                )}
              </div>
            </div>
          )}

          {skryfOop && (
            <div className="ss-skryf">
              <textarea
                className="ss-invoer"
                value={eie}
                onChange={e => setEie(e.target.value.slice(0, MAKS_WOORD))}
                maxLength={MAKS_WOORD}
                rows={3}
                placeholder="Hou dit kort en sag."
                autoFocus
              />
              <p className="ss-riglyn">
                Hou dit kort, sag en ondersteunend. Geen raad, diagnoses of
                kontakbesonderhede nie. {MAKS_WOORD - eie.length} karakters oor.
              </p>
              <div className="ss-skryf-knoppe">
                <button className="ss-stuur" disabled={besig || !eie.trim()} onClick={stuurEie}>
                  Stuur
                </button>
                <button className="ss-los" onClick={() => { setSkryfOop(false); setEie(''); setFout('') }}>
                  Los
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {fout && <p className="ss-fout">{fout}</p>}
    </div>
  )
}
