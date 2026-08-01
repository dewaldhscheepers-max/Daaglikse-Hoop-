import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  maakBord, maakRng, magRuil, doenSkuif, versekerSkuif, bedekSel,
  RYLIG, KOLOMLIG, OESKRAG, REENBOOGVRUG, FEESMANDJIE,
} from '../game/vrugtefees/enjin'
import { VLAKKE, vlakBy, hoofstukVan, doelTeks, doelBehaal, doelVordering } from '../data/vrugtefeesVlakke'
import { Vrug, vrugNaam } from '../data/vrugte'
import { playHout, playPlanke, playHit, playLevelComplete, toggleMute, isMuted } from '../utils/sound'
import './Vrugtefees.css'

/* ────────────────────────────────────────────────────────────
   Vrugtefees — die skerm.

   Die enjin doen al die dink. Hierdie lêer wys net wat gebeur het.

   Die bord is gewone DOM, nie 'n canvas nie. 'n Canvas kry sy eie
   grafiese laag, en dit is presies wat op haar foon strepe gemaak het in
   Bou die Ark. Vier-en-sestig blokkies is niks vir die blaaier nie.

   Elke skuif gee 'n lys stappe terug. Ons speel hulle een vir een af met 'n
   tydlyn. Die logika is klaar voordat die eerste animasie begin, dus kan
   die speler nooit die bord in 'n halwe toestand vang nie.
   ──────────────────────────────────────────────────────────── */

const STOOR   = 'vf_stoor'
const VORDER  = 'vf_vordering'
const RUSTIG  = 'vf_rustig'      // verminderde beweging

const TEMPO = { vee: 260, val: 220, ruil: 150, terug: 150 }

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
  const [selle, setSelle]       = useState([])
  const [punte, setPunte]       = useState(0)
  const [skuiweOor, setSkuiweOor] = useState(0)
  const [vorder, setVorder]     = useState(0)
  const [gekies, setGekies]     = useState(null)
  const [besig, setBesig]       = useState(false)
  const [roep, setRoep]         = useState(null)     // "GOEIE PAS!" ens.
  const [glim, setGlim]         = useState([])       // selle wat nou verdwyn
  const [skud, setSkud]         = useState(null)     // ongeldige ruil

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
    setSelle(bord.selle.map(s => ({ ...s })))
    setPunte(0)
    setSkuiweOor(v.skuiwe)
    setVorder(0)
    setGekies(null); setBesig(false); setRoep(null); setGlim([]); setSkud(null)
    setWenkWys(!!v.wenk)
    setToestand('speel')
  }, [skoonTye])

  const wysBord = useCallback(() => {
    setSelle(spel.current.bord.selle.map(s => ({ ...s })))
  }, [])

  /* ── Een skuif, met sy animasie ── */
  const speelSkuif = useCallback(async (a, b) => {
    const s = spel.current
    if (!s.bord || besig) return
    if (!magRuil(s.bord, a, b)) {
      setSkud([a, b]); playHit()
      await wag(TEMPO.terug * 2)
      setSkud(null)
      return
    }

    setBesig(true)
    setGekies(null)
    const uit = doenSkuif(s.bord, a, b, { rng: s.rng })

    // Die enjin is klaar. Nou wys ons wat gebeur het, stap vir stap.
    for (const stap of uit.stappe) {
      if (stap.tipe === 'ruil') {
        wysBord()
        await wag(TEMPO.ruil)
      } else if (stap.tipe === 'kombinasie') {
        setRoep('GROOT KOMBINASIE!')
        playPlanke(4)
        await wag(TEMPO.vee)
      } else if (stap.tipe === 'vee') {
        setGlim(stap.selle.map(([k, r]) => k + ',' + r))
        if (stap.ketting >= 4)      { setRoep('VRUGTEFEES!'); playPlanke(4) }
        else if (stap.ketting === 3) { setRoep('PRAGTIGE OES!'); playPlanke(3) }
        else if (stap.ketting === 2) { setRoep('GOEIE PAS!'); playPlanke(2) }
        else                         { playPlanke(1) }
        await wag(TEMPO.vee)
        setGlim([])
        wysBord()
      } else if (stap.tipe === 'val') {
        wysBord()
        await wag(TEMPO.val)
      }
    }

    // Tel op
    s.stand.punte += uit.punte
    for (const [i, n] of Object.entries(uit.versamel)) s.stand.versamel[i] = (s.stand.versamel[i] || 0) + n
    s.stand.spesiaalGemaak += uit.spesiaalGemaak
    s.stand.kombinasies += uit.kombinasies
    s.stand.grootsteKetting = Math.max(s.stand.grootsteKetting, uit.grootsteKetting)

    setPunte(s.stand.punte)
    setVorder(doelVordering(s.vlak.doel, s.stand, s.bord))
    const oor = skuiweOor - 1
    setSkuiweOor(oor)

    // Skommel as die bord doodgeloop het. Dit kos nooit 'n skuif nie.
    const sk = versekerSkuif(s.bord, s.vlak.saad + oor * 31)
    if (sk) { setRoep('DIE TUIN SKUIF'); wysBord(); await wag(TEMPO.val) }

    setRoep(null)
    setBesig(false)

    if (doelBehaal(s.vlak.doel, s.stand, s.bord)) {
      const bonus = oor * 90
      s.stand.punte += bonus
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
  }, [besig, wag, wysBord, skuiweOor, vordering])

  /* ── Kies en ruil ── */
  function tikSel(k, r) {
    if (besig || toestand !== 'speel') return
    const sel = spel.current.bord && spel.current.bord.selle[r * 8 + k]
    if (!sel || bedekSel(sel)) return
    if (!gekies) { setGekies({ k, r }); playHout(0.4); return }
    if (gekies.k === k && gekies.r === r) { setGekies(null); return }
    const naby = Math.abs(gekies.k - k) + Math.abs(gekies.r - r) === 1
    if (!naby) { setGekies({ k, r }); playHout(0.4); return }
    speelSkuif(gekies, { k, r })
  }

  /* Sleep. Ons hou die beginpunt vas en kyk watter kant toe die vinger die
     verste beweeg het — so kan 'n skuins veeg nooit per ongeluk 'n skuins
     ruil word nie. */
  const sleep = useRef(null)
  function raakBegin(e, k, r) {
    if (besig || toestand !== 'speel') return
    const t = e.touches ? e.touches[0] : e
    sleep.current = { k, r, x: t.clientX, y: t.clientY, gedoen: false }
  }
  function raakBeweeg(e) {
    const s = sleep.current
    if (!s || s.gedoen || besig) return
    const t = e.touches ? e.touches[0] : e
    const dx = t.clientX - s.x, dy = t.clientY - s.y
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return
    s.gedoen = true
    const [nk, nr] = Math.abs(dx) > Math.abs(dy)
      ? [s.k + Math.sign(dx), s.r]
      : [s.k, s.r + Math.sign(dy)]
    if (nk < 0 || nr < 0 || nk > 7 || nr > 7) return
    setGekies(null)
    speelSkuif({ k: s.k, r: s.r }, { k: nk, r: nr })
  }
  function raakEinde() {
    const s = sleep.current
    sleep.current = null
    if (s && !s.gedoen) tikSel(s.k, s.r)
  }

  /* ── Klank en beweging ── */
  function klank() { setStil(toggleMute()) }
  function wisselRustig() {
    const nuut = !rustig
    setRustig(nuut)
    try { localStorage.setItem(RUSTIG, nuut ? '1' : '0') } catch {}
  }

  const doelWoorde = useMemo(() => doelTeks(vlak.doel, vrugNaam), [vlak])
  const versamelLys = useMemo(() => {
    if (vlak.doel.tipe !== 'versamel') return null
    const st = spel.current.stand
    return Object.entries(vlak.doel.vrugte).map(([i, n]) => ({
      soort: Number(i), nodig: n, het: Math.min(n, (st && st.versamel[i]) || 0),
    }))
  }, [vlak, punte, selle])

  return (
    <div className="vf-oorleg">

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
        {toestand !== 'kaart' && (
          <div
            className="vf-bord"
            onTouchMove={raakBeweeg}
            onTouchEnd={raakEinde}
            onMouseUp={raakEinde}
            onMouseLeave={() => { sleep.current = null }}
          >
            {selle.map((sel, i) => {
              const k = i % 8, r = Math.floor(i / 8)
              const sl = k + ',' + r
              const isGekies = gekies && gekies.k === k && gekies.r === r
              const isSkud = skud && skud.some(p => p.k === k && p.r === r)
              return (
                <div
                  key={i}
                  className={
                    'vf-sel' +
                    (isGekies ? ' gekies' : '') +
                    (glim.includes(sl) ? ' glim' : '') +
                    (isSkud ? ' skud' : '') +
                    (sel.blok ? ' blok-' + sel.blok : '')
                  }
                  style={{ left: `${k * 12.5}%`, top: `${r * 12.5}%` }}
                  onTouchStart={e => raakBegin(e, k, r)}
                  onMouseDown={e => raakBegin(e, k, r)}
                  role="button"
                  tabIndex={-1}
                  aria-label={sel.vrug != null ? vrugNaam(sel.vrug) : 'leeg'}
                >
                  {sel.blok && <span className="vf-blok" data-slae={sel.blokSlae} />}
                  {sel.vrug != null && !bedekSel(sel) && (
                    <span className="vf-vrug">
                      <Vrug soort={sel.vrug} grootte="100%" />
                      {sel.spesiaal && <i className="vf-spesiaal">{SPESIAAL_MERK[sel.spesiaal]}</i>}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {roep && <div className="vf-roep">{roep}</div>}

        {/* ── Vlakkaart ── */}
        {toestand === 'kaart' && (
          <div className="vf-blad">
            <span className="vf-merk">{hoofstuk.naam}</span>
            <h2 className="vf-blad-titel">Vrugtefees</h2>
            <p className="vf-blad-teks">
              Pas die vrugte, bou groot kombinasies en kyk hoe ver jou oes kan groei.
            </p>
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
            <p className="vf-fyndruk">Fase {vordering.hoogste} van {VLAKKE.length} oop</p>
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
