/* ────────────────────────────────────────────────────────────
   Die opmerkings-blad.

   Druk 'n mens die spraakborrel, skuif hierdie blad van onder af oop:

     ─────────                                   ← die greep
     🙏❤️🤗 24                          142 gelees
     ─────────────────────────────────────────────
     ◯  Anoniem · 6 Augustus
        Jy is nie alleen nie.
     ◯  Anoniem · 6 Augustus
        Ek dra jou vandag in gebed.
     ─────────────────────────────────────────────
     [ Ek bid vandag saam met jou. ] [ Jy is ... ]
     ◯  Skryf 'n opmerking…                 Plaas

   Dit is die vorm wat Dewald gewys het, en dit is die vorm wat elke mens
   met 'n foon al ken. Waarom dit 'n BLAD is en nie 'n uitvou op die kaart
   nie: 'n gesprek van twintig opmerkings stoot die volgende plasing twintig
   reels weg, en dan lees niemand meer verder nie. 'n Blad wat oopskuif laat
   die muur staan waar hy is.

   Die tikbalk is VAS onderaan. Dit is die hele rede waarom 'n mens hierdie
   blad oopmaak, en dit mag nooit iewers bo-aan 'n lang lys wegraak nie.

   Die opmerkings self is plat teks met 'n naam bo — nie borrels nie. Op 'n
   blad waar mense oor 'n sterwende ma skryf, lees borrels soos 'n
   kletsprogram.

   Geen transform of opacity op :active nie, en 100svh en nie 100dvh nie —
   sien CLAUDE.md.
   ──────────────────────────────────────────────────────────── */

import { useState, useEffect, useRef } from 'react'
import { KLAAR_WOORDE, wysReaksies, wysGelees, MAKS_WOORD } from '../data/sorgSaamstaan'
import { stuurWoord, rapporteerWoord } from '../data/sorgMuur'
import './SorgOpmerkings.css'

const MAANDE = [
  'Januarie', 'Februarie', 'Maart', 'April', 'Mei', 'Junie',
  'Julie', 'Augustus', 'September', 'Oktober', 'November', 'Desember',
]

function skryfDag(d) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d || ''))
  if (!m) return ''
  return `${Number(m[3])} ${MAANDE[Number(m[2]) - 1] || ''}`
}

export default function SorgOpmerkings({ plasing, soort = 'muur', oop, onSluit, woorde, onNuut, tellings }) {
  const [eie, setEie] = useState('')
  const [besig, setBesig] = useState(false)
  const [fout, setFout] = useState('')
  const lysRef = useRef(null)

  const { gewys, totaal } = wysReaksies(tellings, plasing.saam)
  const gelees = wysGelees(plasing.gelees)

  /* Elke keer wat dit oopmaak, begin dit skoon. In baie huise is die foon
     gedeel, en niemand se halwe sin mag vir die volgende mens wag nie. */
  useEffect(() => {
    if (!oop) return
    setEie('')
    setBesig(false)
    setFout('')
  }, [oop])

  /* Terug op die foon maak die blad toe, nie die hele app nie. Sonder dit
     verlaat 'n mens die Sorg-blad heeltemal net omdat hy 'n lys wou toemaak. */
  useEffect(() => {
    if (!oop) return
    const sluit = e => { if (e.key === 'Escape') onSluit() }
    document.addEventListener('keydown', sluit)
    return () => document.removeEventListener('keydown', sluit)
  }, [oop, onSluit])

  if (!oop) return null

  async function stuur(sleutel) {
    if (besig) return
    setBesig(true)
    setFout('')
    const d = await stuurWoord(plasing.id, sleutel ? { woord: sleutel } : { teks: eie.trim() }, soort)
    setBesig(false)
    if (d && d.fout) { setFout(d.fout); return }
    setEie('')

    if (d && d.woord) {
      onNuut({ id: d.woord.id, teks: d.woord.teks, myne: true })
      setFout('')
      /* Rol na die nuwe een toe, sodat 'n mens sien dit is daar. */
      setTimeout(() => {
        if (lysRef.current) lysRef.current.scrollTop = lysRef.current.scrollHeight
      }, 60)
      return
    }

    if (d && d.wag) {
      setFout('Dankie. Dewald kyk gou daarna voordat dit wys.')
      return
    }

    /* ── Nooit stil nie ──

       Kom daar geen woord en geen wag terug nie, HET iets misgeloop. Dit het
       vroeer 'n dankie gewys terwyl niks verskyn het nie, en dan lyk die app
       stukkend op die presiese oomblik waarop iemand moed bymekaargeskraap
       het om iets te sê. */
    setFout('Ons kon dit nie plaas nie. Probeer asseblief weer.')
  }

  async function rapporteer(id) {
    if (!window.confirm('Rapporteer hierdie opmerking?\n\nDit gaan dadelik weg en Dewald kyk daarna.')) return
    onNuut(null, id)
    await rapporteerWoord(id)
  }

  return (
    <>
      <div className="op-agter" onClick={onSluit} />
      <div className="op-blad" role="dialog" aria-modal="true" aria-label="Opmerkings">
        <button className="op-greep" onClick={onSluit} aria-label="Maak toe" />

        <div className="op-kop">
          {totaal > 0 && (
            <span className="op-kop-links">
              <span className="op-tekens" aria-hidden="true">
                {gewys.map(r => <span key={r.sleutel} className="op-teken">{r.teken}</span>)}
              </span>
              <span className="op-totaal">{totaal}</span>
            </span>
          )}
          <span className="op-kop-regs">
            {woorde.length} {woorde.length === 1 ? 'opmerking' : 'opmerkings'}
            {gelees > 0 && ` · ${gelees} gelees`}
          </span>
        </div>

        <div className="op-lys" ref={lysRef}>
          {!woorde.length && (
            <p className="op-leeg">
              Nog niemand het iets gesê nie. Jy kan die eerste wees.
            </p>
          )}

          {woorde.map(w => (
            <div key={w.id} className="op-item">
              <span className={`op-avatar${w.hoop ? ' hoop' : ''}`} aria-hidden="true" />
              <div className="op-item-teks">
                <p className="op-wie">
                  {w.hoop ? (w.naam || 'Daaglikse Hoop') : (w.myne ? 'Jy' : 'Anoniem')}
                  {/* Die merkie sê wie praat. Dit is die enigste opmerking op
                      die hele muur wat 'n naam dra, en dit moet duidelik wees
                      dat dit die bediening is en nie 'n vreemdeling nie. */}
                  {w.hoop && <span className="op-merk" aria-label="Geverifieer">✓</span>}
                  {w.wanneer ? <span className="op-wanneer"> · {skryfDag(w.wanneer)}</span> : null}
                </p>
                <p className="op-teks">{w.teks}</p>
              </div>
              {!w.myne && !w.hoop && (
                <button
                  className="op-rap"
                  aria-label="Rapporteer hierdie opmerking"
                  title="Rapporteer"
                  onClick={() => rapporteer(w.id)}
                >
                  ⋯
                </button>
              )}
            </div>
          ))}
        </div>

        {/* ── Die tikbalk, VAS onderaan ── */}
        <div className="op-voet">
          {/* Die tikbalk bly staan nadat 'n mens iets gestuur het. 'n Gesprek
              is 'n gesprek; niemand word na een sin toegemaak nie. */}
          {(
            <>
              {/* Dewald se sinne, vir wie nie weet wat om te sê nie. */}
              <div className="op-vinnig">
                {KLAAR_WOORDE.map(w => (
                  <button
                    key={w.sleutel}
                    className="op-vinnig-knop"
                    disabled={besig}
                    onClick={() => stuur(w.sleutel)}
                  >
                    {w.teks}
                  </button>
                ))}
              </div>

              {plasing.sensitief ? (
                <p className="op-riglyn">
                  Hierdie storie is swaar. Kies een van die woorde hier bo —
                  dit is genoeg, en dit is die veiligste ding om te stuur.
                </p>
              ) : (
                <div className="op-tik">
                  <span className="op-avatar" aria-hidden="true" />
                  <input
                    className="op-invoer"
                    value={eie}
                    onChange={e => setEie(e.target.value.slice(0, MAKS_WOORD))}
                    maxLength={MAKS_WOORD}
                    placeholder="Skryf ’n opmerking…"
                    onKeyDown={e => { if (e.key === 'Enter' && eie.trim()) stuur('') }}
                  />
                  <button
                    className="op-plaas"
                    disabled={besig || !eie.trim()}
                    onClick={() => stuur('')}
                  >
                    Plaas
                  </button>
                </div>
              )}

              {fout && <p className="op-fout">{fout}</p>}
            </>
          )}
        </div>
      </div>
    </>
  )
}
