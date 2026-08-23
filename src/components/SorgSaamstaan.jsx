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
import { REAKSIES, wysReaksies, telOpmerkings } from '../data/sorgSaamstaan'
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
  /* Wat die spraakborrel wys: die gemeenskap se woorde PLUS Dewald se
     vasgespelde antwoord. Ons gebruik die lys wat hierdie skerm werklik het —
     `woorde` groei wanneer 'n mens pas iets gestuur het en die bediener dit
     nog nie teruggegee het nie. */
  const aantal = telOpmerkings({ ...plasing, woordeTotaal: woorde.length })
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

  /* ── Wat van die bediener af kom, word met MYNE saamgevoeg ──
   *
   * Dewald: "ek het gecomment toe wys my naam. toe ek uit die comments gaan is
   * my naam weg toe ek terug gaan."
   *
   * Hier het gestaan: alles wat die bediener stuur, plus my eie woorde wat hy
   * nog nie ken nie. Sodra hy die opmerking WEL terugstuur, is my plaaslike
   * kopie weggegooi — en met haar die naam en die foto wat ek pas gekies het.
   *
   * Dit lyk soos 'n bediener-fout en dit is dit nie: die bediener se antwoord
   * kan 'n oomblik ouer wees as my druk, of 'n randkas kan 'n ou weergawe
   * teruggee. Wat ook al die rede is, my eie naam mag nie uit die skerm
   * verdwyn nie.
   *
   * Ons hou dus per id die BESTE van albei: die bediener se velde wen, maar
   * waar hy niks het nie, bly myne staan. */
  useEffect(() => {
    const bediener = plasing.woorde || []
    setWoorde(ou => {
      const myneOp = new Map(ou.filter(w => w.myne).map(w => [w.id, w]))
      const saam = bediener.map(w => {
        const m = myneOp.get(w.id)
        if (!m) return w
        myneOp.delete(w.id)
        return {
          ...w,
          myne: true,
          naam: w.naam || m.naam || '',
          foto: w.foto || m.foto || '',
          geverifieer: w.geverifieer || m.geverifieer || false,
        }
      })
      /* Wat die bediener nog glad nie ken nie, bly agteraan staan. */
      const oor = [...myneOp.values()]
      const nuutLys = [...saam, ...oor]
      /* Niks verander nie? Gee dieselfde verwysing terug, anders teken React
         hierdie kaart elke vyftien sekondes oor. */
      if (nuutLys.length === ou.length &&
          nuutLys.every((w, i) => w.id === ou[i].id && w.naam === ou[i].naam &&
                                  w.teks === ou[i].teks && w.foto === ou[i].foto)) {
        return ou
      }
      return nuutLys
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

      {/* Die emoji-opsomming bo die balk is WEG. Dewald: "Hou net die
          reaction icon en die comment icon en share icon en die getalle."

          Die getal het in elk geval twee keer gestaan — een keer hier en een
          keer langs die hartjie in die balk. */}

      {/* Die "Bemoedig hierdie persoon"-knoppie is WEG. Dewald: "hulle kan
          net op die comment icon kliek."

          Hy is reg: die knoppie het presies dieselfde blad oopgemaak as die
          spraakborrel langsaan. Twee deure na een kamer laat 'n mens dink hy
          mis iets, en 'n groot knoppie op elke kaart maak van 'n gesprek 'n
          versoek. */}

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
          <span>{totaal > 0 ? totaal : ''}</span>
        </button>

        <button
          className="ss-aksie"
          onClick={() => { setKiesOop(false); setBladOop(true) }}
        >
          <span className="ss-aksie-teken" aria-hidden="true">💬</span>
          {/* Dewald se vasgespelde antwoord TEL saam. Dit het in 'n aparte
              veld gelewe en die borrel het "0" gewys op 'n plasing wat hy
              beantwoord het. Sien `telOpmerkings`. */}
          <span>{aantal > 0 ? `${aantal}` : ''}</span>
        </button>

        {/* Deel het in 'n aparte reeltjie ONDER die kaart gestaan. Op elke
            muur wat 'n mens ken, is dit die derde knoppie in hierdie balk —
            en dit is waar sy hand dit gaan soek. */}
        {deel && (
          <button
            className="ss-aksie"
            onClick={() => {
              setKiesOop(false)
              deelSorg(deel.soort, deel.id, deel.titel)
            }}
          >
            <span className="ss-aksie-teken" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
                   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
              </svg>
            </span>
            <span />
          </button>
        )}
      </div>

      {/* ── Die VOORSKOU is weg ──
       *
       * Dewald: "Verwyder die preview comments op elke post. Hou net die
       * reaction icon en die comment icon en share icon."
       *
       * Twee opmerkings onder elke kaart het van 'n voer 'n muur van teks
       * gemaak: 'n mens moes deur ander se antwoorde lees om by die volgende
       * MENS te kom. Die drie ikone sê alles wat 'n mens moet weet, en die
       * gesprek is een druk weg. */}

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
