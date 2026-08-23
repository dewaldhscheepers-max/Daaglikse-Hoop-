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

   Dieselfde balk staan onder 'n VIDEO. `soort` sê vir die bediener in
   watter versameling die tellings le; alles anders is identies. Sonder dit
   is die Video's-oortjie 'n rak en die muur 'n plek, en dan gaan niemand na
   die rak toe nie.

   Geen transform of opacity op :active nie — net kleur. Sien CLAUDE.md.
   ──────────────────────────────────────────────────────────── */

import { useState, useRef, useEffect } from 'react'
import { REAKSIES, wysReaksies } from '../data/sorgSaamstaan'
import { stuurReaksie, myReaksie } from '../data/sorgMuur'
import { deelSorg } from '../data/sorgDeel'
import SorgOpmerkings from './SorgOpmerkings'
import './SorgSaamstaan.css'

/* Die een wat die hart wys wanneer 'n mens nog niks gekies het nie. */
const VOORAF = 'hoor'

/* 'n Antwoord met NIKS in nie, is geen antwoord nie. */
function egteAntwoord(a) {
  if (!a) return null
  const teks = String(a.teks || '').trim()
  const bron = String(a.bron || '').trim()
  return teks || bron ? a : null
}

export default function SorgSaamstaan({ plasing, soort = 'muur', deel = null }) {
  const [tellings, setTellings] = useState(plasing.reaksies || {})
  const [myne, setMyne] = useState(() => myReaksie(plasing.id))
  const [woorde, setWoorde] = useState(plasing.woorde || [])
  const [kiesOop, setKiesOop] = useState(false)
  const [bladOop, setBladOop] = useState(false)
  /* Dewald se antwoord. Dit staan vasgespeld bo in die voorskou EN bo in die
     opmerkingsblad — sien SorgOpmerkings.jsx. */
  const antwoord = egteAntwoord(plasing && plasing.antwoord)
  const [besig, setBesig] = useState(false)
  const balkRef = useRef(null)

  const { gewys, totaal } = wysReaksies(tellings, plasing.saam)
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

  async function druk(keuse) {
    setKiesOop(false)
    if (myne || besig) return
    setBesig(true)
    /* Dadelik, ook op 'n stadige lyn. Die bediener se antwoord oorskryf dit. */
    setMyne(keuse)
    setTellings(t => ({ ...t, [keuse]: (Number(t[keuse]) || 0) + 1 }))
    const nuut = await stuurReaksie(plasing.id, keuse, soort)
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
          Net WATTER reaksies gestuur is. Die getal staan langs die hartjie,
          waar 'n mens dit soek. Die LEESTELLING is heeltemal weg van hier af
          — sien `sorgSaamstaan.js`. */}
      {gewys.length > 0 && (
        <div className="ss-som">
          <span className="ss-tekens" aria-hidden="true">
            {gewys.map(r => <span key={r.sleutel} className="ss-teken">{r.teken}</span>)}
          </span>
        </div>
      )}

      {/* ── BEMOEDIG HIERDIE PERSOON ──
       *
       * Dewald: "BEMOEDIG IEMAND VANDAG MOET ORAL SIGBAAR WEES. Bo-aan. Bo
       * die gemeenskapsvoer. En op elke individuele plasing."
       *
       * Dit is die HOOFaksie op 'n plasing, nie 'n ikoon in 'n ry nie. Dit
       * maak dieselfde blad oop as "Reageer" — dieselfde pad, sigbaarder
       * deur.
       *
       * Die reël daarbo verskyn net wanneer daar werklik min is. 'n Plasing
       * wat reeds gedra word, hoef nie soos 'n versoek te lees nie. */}
      {woorde.length < 2 && (
        <p className="ss-min">
          Hierdie persoon het vandag nog min woorde van bemoediging ontvang.
        </p>
      )}
      <button
        className="ss-bemoedig"
        onClick={() => { setKiesOop(false); setBladOop(true) }}
      >
        Bemoedig hierdie persoon
      </button>

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
          <span>{totaal > 0 ? totaal : 'Hou van'}</span>
        </button>

        <button
          className="ss-aksie"
          onClick={() => { setKiesOop(false); setBladOop(true) }}
        >
          <span className="ss-aksie-teken" aria-hidden="true">💬</span>
          <span>{woorde.length > 0 ? `${woorde.length}` : 'Reageer'}</span>
        </button>

        {/* Deel het in 'n aparte reeltjie ONDER die kaart gestaan. Op elke
            muur wat 'n mens ken, is dit die derde knoppie in hierdie balk —
            en dit is waar sy hand dit gaan soek. */}
        {deel && (
          <button
            className="ss-aksie"
            onClick={() => { setKiesOop(false); deelSorg(deel.soort, deel.id, deel.titel) }}
          >
            <span className="ss-aksie-teken" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
                   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
              </svg>
            </span>
            <span>Deel</span>
          </button>
        )}
      </div>

      {/* ── Twee opmerkings as voorskou ──
          Soos 'n mens dit in 'n stroom sien: die gesprek is daar, maar dit
          neem nie die kaart oor nie. Druk op enigeen maak die blad oop. */}
      {/* Ook wanneer die gemeenskap nog niks gesê het nie: as Dewald geantwoord
          het, moet dit hier wys. Andersins lyk die kaart of niemand daar was
          nie terwyl hy juis geantwoord het. */}
      {(woorde.length > 0 || antwoord) && (
        <button className="ss-voorskou" onClick={() => setBladOop(true)}>
          {/* ── Dewald se antwoord staan EERSTE ──
           *
           * Dewald: "waar daaglikse hoop wys moet my comment wys eerste."
           *
           * Sy antwoord het net in die opmerkingsblad gelewe, dus moes 'n mens
           * eers alles oopmaak om te sien dat hy geantwoord het. Op die kaart
           * self het die eerste twee gesaaide woorde gestaan en syne was
           * nêrens. Vasgespeld beteken BO, ook in die voorskou. */}
          {antwoord && (
            <span className="ss-voorskou-ry vasgespeld">
              <span className="ss-avatar dewald" aria-hidden="true" />
              <span className="ss-voorskou-teks">
                <b>Dewald Scheepers</b>
                <span className="ss-merk" aria-hidden="true">✓</span>
                {' '}
                {String(antwoord.teks || 'het met ’n stemboodskap geantwoord.').slice(0, 120)}
              </span>
            </span>
          )}
          {woorde.slice(0, antwoord ? 1 : 2).map(w => (
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
        soort={soort}
        oop={bladOop}
        onSluit={() => setBladOop(false)}
        woorde={woorde}
        onNuut={opmerkingVerander}
        tellings={tellings}
      />
    </div>
  )
}
