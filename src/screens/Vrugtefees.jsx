import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  maakBord, maakRng, magRuil, doenSkuif, versekerSkuif, bedekSel,
  RYLIG, KOLOMLIG, OESKRAG, REENBOOGVRUG, FEESMANDJIE,
} from '../game/vrugtefees/enjin'
import { VLAKKE, vlakBy, hoofstukVan, doelTeks, doelBehaal, doelVordering, BLOK_NAAM } from '../data/vrugtefeesVlakke'
import { Vrug, vrugNaam, VRUG_TEKENINGE } from '../data/vrugte'
import { maakTekenaar } from '../game/vrugtefees/teken'
import TuinAgtergrond from '../components/TuinAgtergrond'
import { playHout, playPlanke, playHit, playLevelComplete, toggleMute, isMuted } from '../utils/sound'
import './Vrugtefees.css'

/* ────────────────────────────────────────────────────────────
   Vrugtefees — die skerm.

   Die enjin doen al die dink. Hierdie lêer wys net wat gebeur het.

   Die bord is 'n canvas. My eerste poging was DOM, en dit was verkeerd:
   die selle was aan hul roosterposisie vasgemaak, dus het niks ooit beweeg
   nie — vrugte het net verdwyn en verskyn. 'n Mens moet SIEN hoe hulle gly
   en val, anders voel die spel dood.

   Die doek loop met willReadFrequently, wat Chrome laat kies om dit op die
   SVE te hou in plaas van 'n eie GPU-laag. Daardie laag was Bou die Ark se
   strepe op haar foon. Daar is ook geen border-radius op die doek nie.

   Elke skuif gee 'n lys stappe terug. Die enjin is klaar voordat die eerste
   animasie begin, dus kan die speler nooit die bord in 'n halwe toestand
   vang nie.
   ──────────────────────────────────────────────────────────── */

const STOOR   = 'vf_stoor'
const VORDER  = 'vf_vordering'
const RUSTIG  = 'vf_rustig'      // verminderde beweging

// Tempo van die animasie. Dewald wou dit 'n bietjie stadiger he.
const TEMPO = { vee: 320, val: 300, ruil: 200, terug: 180 }

function leesVordering() {
  try {
    const d = JSON.parse(localStorage.getItem(VORDER) || 'null')
    if (!d || typeof d !== 'object') return { hoogste: 1, bestes: {} }
    return { hoogste: Math.max(1, d.hoogste | 0), bestes: d.bestes || {} }
  } catch { return { hoogste: 1, bestes: {} } }
}
function stoorVordering(v) {
  try { localStorage.setItem(VORDER, JSON.stringify(v)) } catch {}
}
function leesRustig() {
  try {
    if (localStorage.getItem(RUSTIG) === '1') return true
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch { return false }
}

const SPESIAAL_MERK = {
  [RYLIG]: '↔', [KOLOMLIG]: '↕', [OESKRAG]: '✷',
  [REENBOOGVRUG]: '✺', [FEESMANDJIE]: '❉',
}

export default function Vrugtefees({ onClose }) {
  const [toestand, setToestand] = useState('kaart')   // kaart · speel · gewen · verloor · pouse
  const [vlakNr, setVlakNr]     = useState(1)
  const [vordering, setVordering] = useState(() => leesVordering())
  const [stil, setStil]         = useState(isMuted())
  const [rustig, setRustig]     = useState(() => leesRustig())
  const [wenkWys, setWenkWys]   = useState(true)

  // Wat op die skerm is. Die enjin se bord leef in 'n ref; hierdie is die kopie
  // wat React teken, en dit word net tussen animasie-stappe bygewerk.
  const doekRef  = useRef(null)
  const teken    = useRef(null)
  const [punte, setPunte]       = useState(0)
  const [skuiweOor, setSkuiweOor] = useState(0)
  const [vorder, setVorder]     = useState(0)
  const [gekies, setGekies]     = useState(null)
  const [besig, setBesig]       = useState(false)
  const [tik, setTik]           = useState(0)      // dwing 'n hertekening van die telbord
  const [roep, setRoep]         = useState(null)     // "GOEIE PAS!" ens.

  const spel = useRef({ bord: null, rng: null, stand: null, vlak: null })
  const tydsers = useRef([])

  const vlak = vlakBy(vlakNr) || VLAKKE[0]
  const hoofstuk = hoofstukVan(vlakNr)

  const skoonTye = useCallback(() => {
    tydsers.current.forEach(t => clearTimeout(t))
    tydsers.current = []
  }, [])
  useEffect(() => () => skoonTye(), [skoonTye])

  const wag = useCallback((ms) => new Promise(res => {
    const t = setTimeout(res, rustig ? Math.min(ms, 60) : ms)
    tydsers.current.push(t)
  }), [rustig])

  /* ── Begin 'n vlak ── */
  const beginVlak = useCallback((nr) => {
    const v = vlakBy(nr) || VLAKKE[0]
    const bord = maakBord({ saad: v.saad, soorte: v.soorte, blokke: v.blokke || null })
    spel.current = {
      bord,
      rng: maakRng(v.saad * 977 + 17),
      vlak: v,
      stand: {
        punte: 0, versamel: {}, spesiaalGemaak: 0, kombinasies: 0,
        grootsteKetting: 0, blokkeAanBegin: bord.selle.filter(s => s.blok).length,
      },
    }
    skoonTye()
    if (teken.current) { teken.current.stelBord(bord); teken.current.stelKies(null) }
    setPunte(0)
    setSkuiweOor(v.skuiwe)
    setVorder(0)
    setGekies(null); setBesig(false); setRoep(null)
    setWenkWys(!!v.wenk)
    setToestand('speel')
  }, [skoonTye])

  /* ── Een skuif ──
     Die enjin los alles op en gee 'n lys stappe. Die tekenaar speel hulle
     af; ons wag daarvoor en werk dan die telbord by. */
  const speelSkuif = useCallback(async (a, b) => {
    const s = spel.current
    const t = teken.current
    if (!s.bord || !t || besig) return

    setBesig(true)
    setGekies(null); t.stelKies(null)

    const uit = doenSkuif(s.bord, a, b, { rng: s.rng })

    if (!uit.geldig) {
      playHit()
      await t.speelStappe(uit.stappe, s.bord)
      setBesig(false)
      return
    }

    // Die roep gaan saam met die grootste ketting van hierdie skuif
    const ketting = uit.grootsteKetting
    if (uit.kombinasies > 0)  setRoep('GROOT KOMBINASIE!')
    else if (ketting >= 4)    setRoep('VRUGTEFEES!')
    else if (ketting === 3)   setRoep('PRAGTIGE OES!')
    else if (ketting === 2)   setRoep('GOEIE PAS!')
    playPlanke(Math.min(4, Math.max(1, ketting)))

    await t.speelStappe(uit.stappe, s.bord)

    s.stand.punte += uit.punte
    for (const [i, n] of Object.entries(uit.versamel)) s.stand.versamel[i] = (s.stand.versamel[i] || 0) + n
    s.stand.spesiaalGemaak += uit.spesiaalGemaak
    s.stand.kombinasies += uit.kombinasies
    s.stand.grootsteKetting = Math.max(s.stand.grootsteKetting, uit.grootsteKetting)

    setPunte(s.stand.punte)
    setTik(x => x + 1)
    setVorder(doelVordering(s.vlak.doel, s.stand, s.bord))
    const oor = skuiweOor - 1
    setSkuiweOor(oor)

    // Skommel as die bord doodgeloop het. Dit kos nooit 'n skuif nie.
    const sk = versekerSkuif(s.bord, s.vlak.saad + oor * 31)
    if (sk) { setRoep('DIE TUIN SKUIF'); t.stelBord(s.bord); await new Promise(r => setTimeout(r, 320)) }

    setRoep(null)
    setBesig(false)

    if (doelBehaal(s.vlak.doel, s.stand, s.bord)) {
      s.stand.punte += oor * 90
      setPunte(s.stand.punte)
      playLevelComplete()
      const nuut = { ...vordering }
      nuut.hoogste = Math.max(nuut.hoogste, Math.min(VLAKKE.length, s.vlak.nr + 1))
      nuut.bestes = { ...nuut.bestes, [s.vlak.nr]: Math.max(nuut.bestes[s.vlak.nr] || 0, s.stand.punte) }
      setVordering(nuut); stoorVordering(nuut)
      setToestand('gewen')
    } else if (oor <= 0) {
      playHit()
      setToestand('verloor')
    }
  }, [besig, skuiweOor, vordering])

  /* ── Kies en ruil ──
     Die doek weet self watter sel onder 'n punt is. Ons werk in
     doek-pixels, want die doek se buffer is groter as sy CSS-grootte. */
  function selUitGebeurtenis(e) {
    const t = teken.current
    const d = doekRef.current
    if (!t || !d) return null
    const p = e.touches ? e.touches[0] : (e.changedTouches ? e.changedTouches[0] : e)
    const r = d.getBoundingClientRect()
    const skaal = d.width / r.width
    return t.selBy((p.clientX - r.left) * skaal, (p.clientY - r.top) * skaal)
  }

  function kiesSel(pos) {
    if (besig || toestand !== 'speel' || !pos) return
    const sel = spel.current.bord && spel.current.bord.selle[pos.r * 8 + pos.k]
    if (!sel || bedekSel(sel)) return
    if (!gekies) { setGekies(pos); teken.current.stelKies(pos); playHout(0.4); return }
    if (gekies.k === pos.k && gekies.r === pos.r) { setGekies(null); teken.current.stelKies(null); return }
    const naby = Math.abs(gekies.k - pos.k) + Math.abs(gekies.r - pos.r) === 1
    if (!naby) { setGekies(pos); teken.current.stelKies(pos); playHout(0.4); return }
    speelSkuif(gekies, pos)
  }

  /* Sleep. Ons kyk watter kant toe die vinger die VERSTE beweeg het, sodat
     'n skuins veeg nooit per ongeluk 'n skuins ruil word nie. */
  const sleep = useRef(null)
  function raakBegin(e) {
    if (besig || toestand !== 'speel') return
    const pos = selUitGebeurtenis(e)
    if (!pos) return
    const p = e.touches ? e.touches[0] : e
    sleep.current = { ...pos, x: p.clientX, y: p.clientY, gedoen: false }
  }
  function raakBeweeg(e) {
    const s = sleep.current
    if (!s || s.gedoen || besig) return
    const p = e.touches ? e.touches[0] : e
    const dx = p.clientX - s.x, dy = p.clientY - s.y
    if (Math.abs(dx) < 16 && Math.abs(dy) < 16) return
    s.gedoen = true
    const [nk, nr] = Math.abs(dx) > Math.abs(dy)
      ? [s.k + Math.sign(dx), s.r]
      : [s.k, s.r + Math.sign(dy)]
    if (nk < 0 || nr < 0 || nk > 7 || nr > 7) return
    setGekies(null); teken.current.stelKies(null)
    speelSkuif({ k: s.k, r: s.r }, { k: nk, r: nr })
  }
  function raakEinde(e) {
    const s = sleep.current
    sleep.current = null
    if (s && !s.gedoen) kiesSel({ k: s.k, r: s.r })
  }

  /* ── Klank en beweging ── */
  function klank() { setStil(toggleMute()) }
  function wisselRustig() {
    const nuut = !rustig
    setRustig(nuut)
    try { localStorage.setItem(RUSTIG, nuut ? '1' : '0') } catch {}
  }

  /* ── Die tekenaar ──
     Een keer opgestel. Die doek se buffer kom net uit sy BREEDTE; op Android
     skuif Chrome se adresbalk in en uit en dan verander die hoogte
     aanhoudend. Elke skryf na canvas.width maak die doek skoon. */
  useEffect(() => {
    const d = doekRef.current
    if (!d) return
    const t = maakTekenaar(d, { vrugte: VRUG_TEKENINGE, kolomme: 8, rye: 8 })
    teken.current = t
    t.stelRustig(rustig)

    function pas() {
      const breed = d.getBoundingClientRect().width
      if (!breed) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const nuutSy = Math.round(breed * dpr / 8) * 8
      if (d.width === nuutSy) return
      d.width = nuutSy
      d.height = nuutSy
      t.stelPrente()
      if (spel.current.bord) t.stelBord(spel.current.bord)
    }
    pas()
    const t1 = setTimeout(pas, 80)
    window.addEventListener('resize', pas)
    window.addEventListener('orientationchange', pas)
    t.begin()
    return () => {
      clearTimeout(t1)
      window.removeEventListener('resize', pas)
      window.removeEventListener('orientationchange', pas)
      t.stop()
      teken.current = null
    }
  }, [])

  useEffect(() => { if (teken.current) teken.current.stelRustig(rustig) }, [rustig])

  const doelWoorde = useMemo(() => doelTeks(vlak.doel, vrugNaam), [vlak])
  /* Hoeveel versperrings is nog oor? Dieselfde soort toonbank as die
     vrugte s'n, want sonder dit weet 'n mens nie hoe ver jy is nie. */
  const blokLys = useMemo(() => {
    if (vlak.doel.tipe !== 'skoonmaak' || !spel.current.bord) return null
    const tel = vlak.doel.telling || {}
    return vlak.doel.tipes.map(t => {
      const oor = spel.current.bord.selle.filter(s => s.blok === t).length
      const begin = tel[t] || oor
      return { tipe: t, weg: begin - oor, begin }
    })
  }, [vlak, punte, tik, toestand])

  const versamelLys = useMemo(() => {
    if (vlak.doel.tipe !== 'versamel') return null
    const st = spel.current.stand
    return Object.entries(vlak.doel.vrugte).map(([i, n]) => ({
      soort: Number(i), nodig: n, het: Math.min(n, (st && st.versamel[i]) || 0),
    }))
  }, [vlak, punte, tik])

  return (
    <div className="vf-oorleg">

      {/* Die tuin agter alles. Geteken, nie 'n prentlêer nie. */}
      <TuinAgtergrond hoofstuk={hoofstuk.vanaf === 1 ? 0 : 1} />

      {/* ── Le die foon regop ── */}
      <div className="vf-draai">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <rect x="7" y="2" width="10" height="20" rx="2" /><path d="M12 18h.01" />
        </svg>
        <h2>Draai jou foon regop</h2>
        <p>Die tuin het hoogte nodig.</p>
      </div>

      {/* ── Kop ── */}
      <div className="vf-kop">
        <button className="vf-ikoon" onClick={toestand === 'speel' ? () => setToestand('pouse') : onClose} aria-label="Terug">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="vf-titel">{toestand === 'kaart' ? 'Vrugtefees' : hoofstuk.naam}</span>
        <button className="vf-ikoon" onClick={klank} aria-label={stil ? 'Klank aan' : 'Klank af'}>
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H2v6h4l5 4z" />
            {stil ? <><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></>
                  : <><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></>}
          </svg>
        </button>
      </div>

      {toestand === 'speel' && (
        <>
          <div className="vf-tel">
            <div className="vf-tel-item"><span>Punte</span><b>{punte.toLocaleString('af')}</b></div>
            <div className="vf-tel-item"><span>Skuiwe</span><b className={skuiweOor <= 3 ? 'min' : ''}>{skuiweOor}</b></div>
            <div className="vf-tel-item vf-tel-doel">
              <span>Fase {vlak.nr}</span>
              <b>{doelWoorde}</b>
            </div>
          </div>

          <div className="vf-balk"><i style={{ width: `${Math.round(vorder * 100)}%` }} /></div>

          {blokLys && (
            <div className="vf-versamel">
              {blokLys.map(b => (
                <div key={b.tipe} className={`vf-versamel-item${b.weg >= b.begin ? ' klaar' : ''}`}>
                  <i className={'vf-blokmerk blok-' + b.tipe} />
                  <b>{b.weg}/{b.begin}</b>
                </div>
              ))}
            </div>
          )}

          {versamelLys && (
            <div className="vf-versamel">
              {versamelLys.map(v => (
                <div key={v.soort} className={`vf-versamel-item${v.het >= v.nodig ? ' klaar' : ''}`}>
                  <Vrug soort={v.soort} grootte={24} />
                  <b>{v.het}/{v.nodig}</b>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Die bord ── */}
      <div className="vf-bord-wrap">
        <canvas
          ref={doekRef}
          className={'vf-doek' + (toestand === 'kaart' ? ' weg' : '')}
          onTouchStart={raakBegin}
          onTouchMove={raakBeweeg}
          onTouchEnd={raakEinde}
          onMouseDown={raakBegin}
          onMouseMove={raakBeweeg}
          onMouseUp={raakEinde}
          onMouseLeave={() => { sleep.current = null }}
        />

        {roep && <div className="vf-roep">{roep}</div>}

        {/* ── Vlakkaart ── */}
        {toestand === 'kaart' && (
          <div className="vf-blad">
            <span className="vf-merk">{hoofstuk.naam}</span>
            <h2 className="vf-blad-titel">Vrugtefees</h2>
            <p className="vf-blad-teks">
              Skuif twee vrugte langs mekaar om drie of meer te pas.
            </p>

            <button
              className="vf-knop vf-knop-primer vf-speelknop"
              onClick={() => { setVlakNr(vordering.hoogste); beginVlak(vordering.hoogste) }}
            >
              Speel
              <small>Fase {vordering.hoogste}</small>
            </button>

            <p className="vf-fyndruk">of kies 'n fase wat jy klaar oop het</p>
            <div className="vf-vlakrooster">
              {VLAKKE.map(v => {
                const oop = v.nr <= vordering.hoogste
                return (
                  <button
                    key={v.nr}
                    className={`vf-vlakknop${oop ? '' : ' toe'}${v.nr === vordering.hoogste ? ' nou' : ''}`}
                    disabled={!oop}
                    onClick={() => { setVlakNr(v.nr); beginVlak(v.nr) }}
                  >
                    {v.nr}
                    {vordering.bestes[v.nr] ? <i /> : null}
                  </button>
                )
              })}
            </div>
            <button className="vf-knop vf-knop-spook" onClick={wisselRustig}>
              Rustige beweging: {rustig ? 'aan' : 'af'}
            </button>
          </div>
        )}

        {/* ── Wenk ── */}
        {toestand === 'speel' && wenkWys && vlak.wenk && (
          <div className="vf-wenk" onClick={() => setWenkWys(false)}>
            <p>{vlak.wenk}</p>
            <button className="vf-knop vf-knop-primer" onClick={() => setWenkWys(false)}>Goed</button>
          </div>
        )}

        {/* ── Pouse ── */}
        {toestand === 'pouse' && (
          <div className="vf-blad">
            <h2 className="vf-blad-titel">Gepouseer</h2>
            <button className="vf-knop vf-knop-primer" onClick={() => setToestand('speel')}>Speel verder</button>
            <button className="vf-knop vf-knop-spook" onClick={() => beginVlak(vlakNr)}>Begin die fase weer</button>
            <button className="vf-knop vf-knop-spook" onClick={() => setToestand('kaart')}>Terug na die fases</button>
          </div>
        )}

        {/* ── Gewen ── */}
        {toestand === 'gewen' && (
          <div className="vf-blad">
            <span className="vf-merk">Fase {vlak.nr} voltooi</span>
            <h2 className="vf-blad-titel">Die oes is binne!</h2>
            <div className="vf-uitslag">
              <div><span>Punte</span><b>{punte.toLocaleString('af')}</b></div>
              <div><span>Skuiwe oor</span><b>{skuiweOor}</b></div>
              <div><span>Beste ketting</span><b>{spel.current.stand ? spel.current.stand.grootsteKetting : 0}</b></div>
            </div>
            {vlak.nr < VLAKKE.length ? (
              <button className="vf-knop vf-knop-primer" onClick={() => { setVlakNr(vlak.nr + 1); beginVlak(vlak.nr + 1) }}>
                Volgende fase
              </button>
            ) : (
              <p className="vf-blad-teks">Jy het die eerste twee tuine klaargemaak. Meer wag.</p>
            )}
            <button className="vf-knop vf-knop-spook" onClick={() => beginVlak(vlak.nr)}>Speel weer</button>
            <button className="vf-knop vf-knop-spook" onClick={() => setToestand('kaart')}>Terug na die fases</button>
          </div>
        )}

        {/* ── Verloor ── */}
        {toestand === 'verloor' && (
          <div className="vf-blad">
            <h2 className="vf-blad-titel">Die oes was naby</h2>
            <p className="vf-blad-teks">Probeer weer met 'n nuwe plan.</p>
            <div className="vf-uitslag">
              <div><span>Punte</span><b>{punte.toLocaleString('af')}</b></div>
              <div><span>Doel</span><b>{Math.round(vorder * 100)}%</b></div>
            </div>
            <button className="vf-knop vf-knop-primer" onClick={() => beginVlak(vlak.nr)}>Probeer weer</button>
            <button className="vf-knop vf-knop-spook" onClick={() => setToestand('kaart')}>Terug na die fases</button>
          </div>
        )}
      </div>
    </div>
  )
}
