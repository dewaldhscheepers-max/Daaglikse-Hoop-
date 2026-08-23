/* ────────────────────────────────────────────────────────────
   Die opmerkings-blad.

   Druk 'n mens die spraakborrel, skuif hierdie blad van onder af oop:

     ─────────                                   ← die greep
     🙏❤️🤗 24                          3 opmerkings
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
import { klaarWoordeVir, wysReaksies, MAKS_WOORD } from '../data/sorgSaamstaan'
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

/* 'n Antwoord met NIKS in nie, is geen antwoord nie. Sien SorgPlasing.jsx. */
function egteAntwoord(a) {
  if (!a) return null
  const teks = String(a.teks || '').trim()
  const bron = String(a.bron || '').trim()
  return teks || bron ? a : null
}

export default function SorgOpmerkings({ plasing, soort = 'muur', oop, onSluit, woorde, onNuut, tellings }) {
  const [antwOop, setAntwOop] = useState(false)
  const antwoord = egteAntwoord(plasing && plasing.antwoord)
  const antwLank = String(antwoord?.teks || '').length > 320
  const [eie, setEie] = useState('')
  const [besig, setBesig] = useState(false)
  const [fout, setFout] = useState('')
  const lysRef = useRef(null)

  const { gewys, totaal } = wysReaksies(tellings, plasing.saam)

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
          </span>
        </div>

        <div className="op-lys" ref={lysRef}>
          {/* ── Vasgespeld, BO die ander opmerkings ──
           *
           * Dewald: "Vasgespeld moet in die comments wees saam die ander. nie
           * deel van die post nie... 'n pinned post op facebook is in die
           * comments."
           *
           * Dit het binne die PLASING gesit, en dan lees die blad soos 'n
           * vraag met 'n amptelike antwoord — die ding wat die hele blad op
           * een mens laat rus het. Hier is dit een stem tussen stemme, met
           * meer gewig. */}
      {antwoord && (
        <div className="sp-antwoord">
          {/* ── Wie praat ──

              "Dewald antwoord" is 'n etiket op 'n boks. Met die gesig
              daarby is dit 'n mens wat praat, en dit is die hele verskil
              tussen 'n vraag-en-antwoord-blad en 'n pastorale een.

              "Vasgespeld" doen nog iets: sodra ander mense se woorde van
              ondersteuning hieronder kom, sê dit hoekom hierdie een bo bly
              staan. Dit maak van Dewald die stem met die meeste gewig
              sonder om hom die enigste stem te maak. */}
          <div className="sp-antwoord-wie">
            <img
              className="sp-antwoord-gesig"
              src="/beelde/dewald.jpg"
              alt="Dewald Scheepers"
              width="34"
              height="34"
              loading="lazy"
            />
            <div className="sp-antwoord-wie-teks">
              <p className="sp-antwoord-kop">Dewald se pastorale begeleiding</p>
              <p className="sp-vasgespeld">Vasgespeld</p>
            </div>
          </div>
          {antwoord.titel && <p className="sp-antwoord-titel">{antwoord.titel}</p>}

          {antwoord.tipe === 'oudio' && (
            /* `preload="metadata"`, nie "none" nie. Met "none" weet die
               blaaier nie hoe lank die opname is nie en die speler wys
               0:00 / 0:00 — dit lyk stukkend, en 'n mens druk dit nie. Net
               die metadata is 'n paar kilogreep; die klank self laai steeds
               eers wanneer iemand speel. */
            <>
              {/* Die lengte, sodra die blaaier dit weet. Dit is die verskil
                  tussen "gaan dit 'n minuut of twintig vat?" en 'n mens wat
                  druk. Ons stoor dit nie — dit kom uit die lêer self. */}
              <p className="sp-oudio-kop">
                Luister na Dewald se begeleiding
                {duur ? <span className="sp-duur"> · {duur}</span> : null}
              </p>
              <audio
                className="sp-oudio"
                controls
                preload="metadata"
                src={antwoord.bron}
                onLoadedMetadata={e => setDuur(skryfDuur(e.target.duration))}
              >
                Jou blaaier kan nie hierdie opname speel nie.
              </audio>
            </>
          )}

          {antwoord.tipe === 'video' && (
            <a className="sp-antwoord-skakel" href={antwoord.bron} target="_blank" rel="noopener noreferrer">
              Kyk Dewald se antwoord
            </a>
          )}

          {antwoord.teks && (
            <>
              <p className={`sp-antwoord-teks${antwLank && !antwOop ? ' kort' : ''}`}>
                {antwoord.teks}
              </p>
              {antwLank && (
                <button className="sp-meer" onClick={() => setAntwOop(o => !o)}>
                  {antwOop ? 'Wys minder' : 'Lees meer'}
                </button>
              )}
            </>
          )}

        </div>
      )}

          {!woorde.length && !antwoord && (
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
              {/* Vir wie nie weet wat om te sê nie.

                  Op die MUUR is dit sinne: daar het iemand pas sy hart
                  uitgestort. Onder 'n VIDEO is dit emoji — daar is niemand om
                  saam mee te bid nie, dit is 'n video wat Dewald gemaak het,
                  en "jy is nie alleen nie" praat met iemand wat nie daar is
                  nie. */}
              <div className="op-vinnig">
                {klaarWoordeVir(soort).map(w => (
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

              {/* ── ELKE plasing kan geskryf word ──
               *
               * Hier het 'n hek gestaan: op 'n `sensitief`-plasing kon 'n mens
               * NET 'n klaargemaakte frase kies. Die bedoeling was om iemand
               * in 'n donker plek te beskerm teen verkeerde raad.
               *
               * Dewald: "hoe de fok moet hulle mekaar bemoedig as hul nie kan
               * komment nie."
               *
               * Hy is reg, en die hek het die hele blad se punt weerspreek.
               * 'n Gemeenskap wat mekaar dra, moet kan PRAAT. Die beskerming
               * bly, net op die regte plek: die swaarste stories (selfmoord,
               * selfbesering, geweld) gaan nie vanself op die muur nie — 'n
               * mens kyk eers daarna (sien api/sorg-stuur.mjs) — en elke
               * opmerking kan gerapporteer word.
               *
               * Op 'n swaar storie staan die riglyn nou BO die kassie in
               * plaas van in die plek daarvan. */}
              {plasing.sensitief && (
                <p className="op-riglyn">
                  Hierdie storie is swaar. Praat sag, deel jou eie ervaring, en
                  moenie raad gee oor medisyne of behandeling nie.
                </p>
              )}
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

              {fout && <p className="op-fout">{fout}</p>}
            </>
          )}
        </div>
      </div>
    </>
  )
}
