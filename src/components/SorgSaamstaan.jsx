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
import { stuurReaksie, myReaksie } from '../data/sorgMuur'
import SorgOpmerkings from './SorgOpmerkings'
import './SorgSaamstaan.css'

/* Die een wat die hart wys wanneer 'n mens nog niks gekies het nie. */
const VOORAF = 'hoor'

export default function SorgSaamstaan({ plasing }) {
  const [tellings, setTellings] = useState(plasing.reaksies || {})
  const [myne, setMyne] = useState(() => myReaksie(plasing.id))
  const [woorde, setWoorde] = useState(plasing.woorde || [])
  const [kiesOop, setKiesOop] = useState(false)
  const [bladOop, setBladOop] = useState(false)
  const [besig, setBesig] = useState(false)
  const balkRef = useRef(null)

  const { gewys, totaal } = wysReaksies(tellings, plasing.saam)
  const gelees = wysGelees(plasing.gelees)
  const myReak = myne ? REAKSIES.find(r => r.sleutel === myne) : null

  /* ── Wat van die bediener af inkom, wen ──

     Die muur verfris homself elke halfminuut. Sonder hierdie stuk sou 'n
     kaart sy eerste getalle vir altyd vashou en niemand sou ooit iemand
     anders se reaksie sien nie — die hele punt van 'n lewendige muur weg.

     Ons vat die HOOGSTE van die twee per reaksie, nie eenvoudig die
     bediener s'n nie. Anders gebeur dit: 'n mens druk, ons tel dadelik een
     by (want 'n stadige lyn mag nie soos 'n stukkende knoppie voel nie), en
     dan land 'n verfrissing wat 'n oomblik voor sy druk gehaal is — en die
     telling spring terug. */
  useEffect(() => {
    const nuut = plasing.reaksies || {}
    setTellings(ou => {
      const uit = { ...ou }
      let anders = false
      for (const k of new Set([...Object.keys(ou), ...Object.keys(nuut)])) {
        const w = Math.max(Number(ou[k]) || 0, Number(nuut[k]) || 0)
        if (w !== (Number(ou[k]) || 0)) anders = true
        uit[k] = w
      }
      return anders ? uit : ou
    })
  }, [plasing.reaksies])

  /* Dieselfde vir die opmerkings: alles wat die bediener stuur, plus wat
     hierdie foon pas bygesit het en die bediener nog nie teruggegee het nie. */
  useEffect(() => {
    const bediener = plasing.woorde || []
    setWoorde(ou => {
      const ids = new Set(bediener.map(w => w.id))
      const myne = ou.filter(w => w.myne && !ids.has(w.id))
      if (!myne.length && bediener.length === ou.length &&
          bediener.every((w, i) => w.id === ou[i].id)) return ou
      return [...bediener, ...myne]
    })
  }, [plasing.woorde])

  /* Druk 'n mens buite die kiesers, gaan hulle toe. Sonder dit bly hulle oop
     terwyl 'n mens verder lees, en dan is daar drie oop kiesers op die skerm. */
  useEffect(() => {
    if (!kiesOop) return
    const weg = e => { if (!balkRef.current || !balkRef.current.contains(e.target)) setKiesOop(false) }
    document.addEventListener('pointerdown', weg)
    return () => document.removeEventListener('pointerdown', weg)
  }, [kiesOop])

  /* Terwyl die blad oop is, mag die muur agter hom nie rol nie. */
  useEffect(() => {
    if (!bladOop) return
    const ou = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = ou }
  }, [bladOop])

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

  /* Die blad gee 'n nuwe opmerking terug, of 'n id om weg te vat. */
  function opmerkingVerander(nuut, weg) {
    if (weg) { setWoorde(w => w.filter(x => x.id !== weg)); return }
    if (nuut) setWoorde(w => [...w, nuut])
  }

  return (
    <div className="ss">

      {/* ── Die opsomming ──
          Links wat gestuur is; regs die leestelling. */}
      {(totaal > 0 || gelees > 0) && (
        <div className="ss-som">
          {totaal > 0 && (
            <span className="ss-som-links">
              <span className="ss-tekens" aria-hidden="true">
                {gewys.map(r => <span key={r.sleutel} className="ss-teken">{r.teken}</span>)}
              </span>
              <span className="ss-totaal">{totaal}</span>
            </span>
          )}
          {gelees > 0 && <span className="ss-gelees">{gelees} gelees</span>}
        </div>
      )}

      {/* ── Die aksiebalk ──
          Ikoon met die GETAL langsaan, soos elke muur wat 'n mens ken. Sonder
          die getal is die knoppie 'n bevel; met die getal is dit 'n plek waar
          iets gebeur het. */}
      <div className="ss-balk" ref={balkRef}>
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
          onClick={() => { if (!myne) setKiesOop(o => !o) }}
          aria-expanded={kiesOop}
        >
          <span className="ss-aksie-teken" aria-hidden="true">{myReak ? myReak.teken : '♡'}</span>
          <span>{myReak ? myReak.naam : 'Hou van'}</span>
        </button>

        <button
          className="ss-aksie"
          onClick={() => { setKiesOop(false); setBladOop(true) }}
        >
          <span className="ss-aksie-teken" aria-hidden="true">💬</span>
          <span>{woorde.length > 0 ? `${woorde.length}` : 'Reageer'}</span>
        </button>
      </div>

      {/* ── Twee opmerkings as voorskou ──
          Soos 'n mens dit in 'n stroom sien: die gesprek is daar, maar dit
          neem nie die kaart oor nie. Druk op enigeen maak die blad oop. */}
      {woorde.length > 0 && (
        <button className="ss-voorskou" onClick={() => setBladOop(true)}>
          {woorde.slice(0, 2).map(w => (
            <span key={w.id} className="ss-voorskou-ry">
              <span className={`ss-avatar${w.hoop ? ' hoop' : ''}`} aria-hidden="true" />
              <span className="ss-voorskou-teks">
                <b>{w.hoop ? (w.naam || 'Daaglikse Hoop') : (w.myne ? 'Jy' : 'Anoniem')}</b>
                {w.hoop && <span className="ss-merk" aria-hidden="true">✓</span>}
                {' '}{w.teks}
              </span>
            </span>
          ))}
          {woorde.length > 2 && (
            <span className="ss-voorskou-meer">Wys al {woorde.length} opmerkings</span>
          )}
        </button>
      )}

      <SorgOpmerkings
        plasing={plasing}
        oop={bladOop}
        onSluit={() => setBladOop(false)}
        woorde={woorde}
        onNuut={opmerkingVerander}
        tellings={tellings}
      />
    </div>
  )
}
