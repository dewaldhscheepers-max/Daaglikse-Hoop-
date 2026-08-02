import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  doenSkuif, versekerSkuif, bedekSel, maakBord, maakRng, REENBOOGVRUG,
} from '../game/vrugtefees/enjin'
import { beginOes, oesSkuif, dagSleutel, dagSaad } from '../game/vrugtefees/oes'
import {
  VLAKKE, HOOFSTUKKE, HOOFSTUK_WOORD, vlakBy, hoofstukVan,
  doelTeks, doelBehaal, doelVordering, doelTelling,
} from '../data/vrugtefeesVlakke'
import { Vrug, vrugNaam, VRUG_TEKENINGE } from '../data/vrugte'
import { maakTekenaar } from '../game/vrugtefees/teken'
import TuinAgtergrond from '../components/TuinAgtergrond'
import Oesmeesters from '../components/Oesmeesters'
import { PRESTASIES, boekAan, lees as leesPrestasies } from '../data/vrugtefeesPrestasies'
import { stuurOes, stuurWagry, leesNaam, naamAfgewys, wysNaamAf, keurNaam, stoorNaam } from '../data/vrugtefeesRanglys'
import { getOrCreateAnonUid } from '../firebase'
import {
  playVrugPas, playSpesiaal, playKombinasie, playOesRonde, playOesKlaar,
  playHit, playLevelComplete, toggleMute, isMuted,
} from '../utils/sound'
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

   Drie speelwyses deel hierdie een skerm:

     · Die Tuinreis — negentig fases met doelwitte.
     · Die Oneindige Oes — speel tot die skuiwe op is.
     · Vandag se Oes — dieselfde as die oes, maar die bord kom uit die
       datum, sodat almal ter wereld dieselfde een speel.

   Die twee oes-wyses loop deur src/game/vrugtefees/oes.js, wat DIESELFDE
   lêer is wat die bediener gebruik om 'n ingestuurde lopie oor te speel.
   Daarom skryf hierdie skerm elke geldige skuif neer: dit is wat ingestuur
   word, nie 'n puntetelling nie.
   ──────────────────────────────────────────────────────────── */

const VORDER    = 'vf_vordering'
const RUSTIG    = 'vf_rustig'      // verminderde beweging
const TUTORIAAL = 'vf_tutoriaal'

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
function tutoriaalGesien() {
  try { return localStorage.getItem(TUTORIAAL) === '1' } catch { return true }
}
function merkTutoriaal() {
  try { localStorage.setItem(TUTORIAAL, '1') } catch {}
}

/* Die tutoriaal. Drie kaarte, nie meer nie. Dewald se eerste woorde oor
   hierdie spel was dat die Ark hom te lank besig gehou het — 'n tutoriaal
   wat 'n mens deur tien skerms sleep, is presies daardie fout. */
const TUT = [
  { titel: 'Skuif twee vrugte',
    teks: 'Sleep \'n vrug na \'n buurman, of tik altwee. Drie of meer eenders pas, en hulle is geoes.' },
  { titel: 'Kyk na die doel',
    teks: 'Bo-aan staan wat hierdie fase van jou vra. Die balkie daaronder wys hoe ver jy is.' },
  { titel: 'Vier of meer gee krag',
    teks: 'Pas vier, en jy kry \'n spesiale vrug. Ruil twee spesiales met mekaar vir iets groots.' },
]

export default function Vrugtefees({ onClose }) {
  // kaart · speel · gewen · verloor · pouse · oesklaar · oesmeesters · prestasies
  const [toestand, setToestand] = useState('kaart')
  const [modus, setModus]       = useState('reis')   // reis · oneindig · daagliks
  const [vlakNr, setVlakNr]     = useState(1)
  const [vordering, setVordering] = useState(() => leesVordering())
  const [stil, setStil]         = useState(isMuted())
  const [rustig, setRustig]     = useState(() => leesRustig())
  const [wenkWys, setWenkWys]   = useState(true)
  const [tutStap, setTutStap]   = useState(-1)
  const [kaartHoofstuk, setKaartHoofstuk] = useState(0)

  const doekRef = useRef(null)
  const teken   = useRef(null)
  const [punte, setPunte]         = useState(0)
  const [skuiweOor, setSkuiweOor] = useState(0)
  const [vorder, setVorder]       = useState(0)
  const [gekies, setGekies]       = useState(null)
  const [besig, setBesig]         = useState(false)
  const [tik, setTik]             = useState(0)
  const [roep, setRoep]           = useState(null)

  // Die oes se eie toonbank op die skerm
  const [oesRonde, setOesRonde]   = useState(1)
  const [oesSoort, setOesSoort]   = useState(0)
  const [oesHet, setOesHet]       = useState(0)
  const [oesTeiken, setOesTeiken] = useState(0)
  const [uitslag, setUitslag]     = useState(null)   // wat die bediener gesê het
  const [stuurBesig, setStuurBesig] = useState(false)
  const [nuutBehaal, setNuutBehaal] = useState([])
  const [naamIn, setNaamIn]       = useState(() => leesNaam())
  const [naamFout, setNaamFout]   = useState(null)

  const spel = useRef({ bord: null, rng: null, stand: null, vlak: null })
  const oes  = useRef({ lopie: null, skuiwe: [], saad: 0, dag: null })
  const tydsers = useRef([])

  const vlak = vlakBy(vlakNr) || VLAKKE[0]
  const hoofstuk = hoofstukVan(vlakNr)
  const hoofstukNr = Math.max(0, HOOFSTUKKE.findIndex(h => vlakNr >= h.vanaf && vlakNr <= h.tot))
  const isOes = modus !== 'reis'
  const agtergrondNr = isOes ? (oesRonde - 1) % HOOFSTUKKE.length : hoofstukNr

  const skoonTye = useCallback(() => {
    tydsers.current.forEach(t => clearTimeout(t))
    tydsers.current = []
  }, [])
  useEffect(() => () => skoonTye(), [skoonTye])

  /* Punte wat nie deurgekom het nie, probeer weer wanneer die spel oopmaak. */
  useEffect(() => { stuurWagry().catch(() => {}) }, [])

  /* Ons eie uid, net om die speler se eie ry op die ranglys uit te lig. */
  const [myUid, setMyUid] = useState(null)
  useEffect(() => { getOrCreateAnonUid().then(setMyUid).catch(() => {}) }, [])

  /* ── Begin 'n fase van die Tuinreis ── */
  const beginVlak = useCallback((nr) => {
    const v = vlakBy(nr) || VLAKKE[0]
    const bord = maakBord({ saad: v.saad, soorte: v.soorte, blokke: v.blokke || null })
    spel.current = {
      bord,
      rng: maakRng(v.saad * 977 + 17),
      vlak: v,
      stand: {
        punte: 0, versamel: {}, spesiaalGemaak: 0, kombinasies: 0,
        grootsteKetting: 0, grootstePas: 0, spesiaalSoorte: {}, verlig: {},
        blokkeAanBegin: bord.selle.filter(s => s.blok).length,
      },
    }
    oes.current = { lopie: null, skuiwe: [], saad: 0, dag: null }
    skoonTye()
    if (teken.current) { teken.current.stelBord(bord); teken.current.stelKies(null) }
    setModus('reis')
    setVlakNr(nr)
    setPunte(0)
    setSkuiweOor(v.skuiwe)
    setVorder(0)
    setGekies(null); setBesig(false); setRoep(null); setUitslag(null)
    setNuutBehaal([])
    setWenkWys(!!v.wenk)
    setTutStap(tutoriaalGesien() ? -1 : 0)
    setToestand('speel')
  }, [skoonTye])

  /* ── Begin 'n oes-lopie ──
     Die saad is die enigste verskil tussen die twee wyses. By Vandag se Oes
     kom dit uit die datum, en die bediener bereken presies dieselfde een uit
     die dag — dus kan niemand 'n gunstige bord kies nie. */
  const beginOesLopie = useCallback((soort) => {
    const dag = dagSleutel(new Date())
    const saad = soort === 'daagliks'
      ? dagSaad(dag)
      : Math.floor(Math.random() * 2000000000)

    let lopie
    try { lopie = beginOes(saad) } catch { return }

    oes.current = { lopie, skuiwe: [], saad, dag: soort === 'daagliks' ? dag : null }
    spel.current = { bord: lopie.bord, rng: null, stand: null, vlak: null }
    skoonTye()
    if (teken.current) { teken.current.stelBord(lopie.bord); teken.current.stelKies(null) }
    setModus(soort)
    setPunte(0)
    setSkuiweOor(lopie.skuiweOor)
    setOesRonde(lopie.ronde)
    setOesSoort(lopie.soort)
    setOesHet(0)
    setOesTeiken(lopie.teiken)
    setVorder(0)
    setGekies(null); setBesig(false); setRoep(null); setUitslag(null)
    setNuutBehaal([])
    setWenkWys(false)
    setTutStap(tutoriaalGesien() ? -1 : 0)
    setToestand('speel')
  }, [skoonTye])

  const wagVir = useCallback((ms) => new Promise(res => {
    const t = setTimeout(res, rustig ? Math.min(ms, 60) : ms)
    tydsers.current.push(t)
  }), [rustig])

  /* ── Klank vir een skuif ──
     Vrugte, nie planke nie. Die spel het tot nou Bou die Ark se hout geleen
     en dit het klaar geklink of iets breek eerder as of iets gepluk word. */
  function klankVir(uit) {
    if (uit.kombinasies > 0) playKombinasie()
    else if (uit.spesiaalGemaak > 0) playSpesiaal()
    else playVrugPas(Math.max(1, uit.grootsteKetting), uit.grootstePas || 3)
  }

  function roepVir(uit) {
    if (uit.kombinasies > 0)            return 'GROOT KOMBINASIE!'
    /* 'n Spesiale vrug is die belangrikste ding wat op die bord kan gebeur,
       en dit het tot nou heeltemal stil gebeur. */
    if (uit.spesiaalGemaak > 1)         return 'TWEE SPESIALE VRUGTE!'
    if (uit.spesiaalGemaak === 1)       return 'SPESIALE VRUG!'
    if (uit.grootsteKetting >= 4)       return 'VRUGTEFEES!'
    if (uit.grootsteKetting === 3)      return 'PRAGTIGE OES!'
    if (uit.grootsteKetting === 2)      return 'GOEIE PAS!'
    return null
  }

  /* Wat die skuif aan die prestasies gedoen het. Ons boek dit een keer per
     skuif aan, sodat 'n mens 'n merk kry op die oomblik dat dit gebeur. */
  function boekSkuif(uit, ekstra = {}) {
    const reenboog = Object.entries(uit.spesiaalSoorte || {})
      .filter(([s]) => s === REENBOOGVRUG).reduce((n, [, v]) => n + v, 0)
    const r = boekAan({
      besteKetting: uit.grootsteKetting,
      besteGrootpas: uit.grootstePas || 0,
      kombinasies: uit.kombinasies,
      spesiaalGemaak: uit.spesiaalGemaak,
      reenboog,
      ...ekstra,
    })
    if (r.nuut.length) setNuutBehaal(n => [...n, ...r.nuut])
    return r
  }

  /* ── Een skuif in die Tuinreis ── */
  const speelReisSkuif = useCallback(async (a, b) => {
    const s = spel.current
    const t = teken.current

    const uit = doenSkuif(s.bord, a, b, { rng: s.rng })

    if (!uit.geldig) {
      playHit()
      await t.speelStappe(uit.stappe, s.bord)
      setBesig(false)
      return
    }

    setRoep(roepVir(uit))
    klankVir(uit)

    await t.speelStappe(uit.stappe, s.bord)

    s.stand.punte += uit.punte
    for (const [i, n] of Object.entries(uit.versamel)) s.stand.versamel[i] = (s.stand.versamel[i] || 0) + n
    s.stand.spesiaalGemaak += uit.spesiaalGemaak
    s.stand.kombinasies += uit.kombinasies
    s.stand.grootsteKetting = Math.max(s.stand.grootsteKetting, uit.grootsteKetting)
    s.stand.grootstePas = Math.max(s.stand.grootstePas, uit.grootstePas || 0)
    for (const [soort, n] of Object.entries(uit.spesiaalSoorte || {}))
      s.stand.spesiaalSoorte[soort] = (s.stand.spesiaalSoorte[soort] || 0) + n
    for (const [k, r] of uit.geveeSelle || []) s.stand.verlig[k + ',' + r] = true

    boekSkuif(uit)

    setPunte(s.stand.punte)
    setTik(x => x + 1)
    setVorder(doelVordering(s.vlak.doel, s.stand, s.bord))
    const oor = skuiweOor - 1
    setSkuiweOor(oor)

    const sk = versekerSkuif(s.bord, s.vlak.saad + oor * 31)
    if (sk) { setRoep('DIE TUIN SKUIF'); t.stelBord(s.bord); await wagVir(320) }

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
      const hs = Math.max(1, HOOFSTUKKE.findIndex(h => s.vlak.nr >= h.vanaf && s.vlak.nr <= h.tot) + 1)
      const r = boekAan({
        vlakkeKlaar: Math.max(s.vlak.nr, nuut.hoogste - 1),
        hoogsteHoofstuk: hs,
        besteSkuiweOor: oor,
      })
      if (r.nuut.length) setNuutBehaal(n => [...n, ...r.nuut])
      setToestand('gewen')
    } else if (oor <= 0) {
      playHit()
      setToestand('verloor')
    }
  }, [skuiweOor, vordering, wagVir])

  /* ── Een skuif in 'n oes-lopie ──
     Alles loop deur oesSkuif, want dit is die kode wat die bediener ook
     gebruik. Elke GELDIGE skuif word neergeskryf; dit is die bewys wat
     ingestuur word. */
  const speelOesSkuif = useCallback(async (a, b) => {
    const o = oes.current
    const t = teken.current
    const lopie = o.lopie
    if (!lopie) { setBesig(false); return }

    const uit = oesSkuif(lopie, a, b)

    if (!uit.geldig) {
      playHit()
      if (uit.stappe && uit.stappe.length) await t.speelStappe(uit.stappe, lopie.bord)
      setBesig(false)
      return
    }

    o.skuiwe.push([a.k, a.r, b.k, b.r])

    setRoep(roepVir(uit))
    klankVir(uit)

    await t.speelStappe(uit.stappe, lopie.bord)

    boekSkuif(uit)

    setPunte(lopie.punte)
    setSkuiweOor(lopie.skuiweOor)
    setOesHet(lopie.het)
    setTik(x => x + 1)

    if (uit.rondeKlaar) {
      playOesRonde()
      setRoep('RONDE ' + (lopie.ronde - 1) + ' BINNE!')
      setOesRonde(lopie.ronde)
      setOesSoort(lopie.soort)
      setOesTeiken(lopie.teiken)
      boekAan({ besteOesRonde: lopie.rondesKlaar, besteOesPunte: lopie.punte })
      await wagVir(520)
    }

    setVorder(lopie.teiken ? Math.min(1, lopie.het / lopie.teiken) : 0)

    if (uit.skommel) { setRoep('DIE TUIN SKUIF'); t.stelBord(lopie.bord); await wagVir(320) }

    setRoep(null)
    setBesig(false)

    if (lopie.klaar) {
      playOesKlaar()
      const r = boekAan({
        besteOesRonde: lopie.rondesKlaar,
        besteOesPunte: lopie.punte,
        ...(modus === 'daagliks' ? { dagLaaste: o.dag } : {}),
      })
      if (r.nuut.length) setNuutBehaal(n => [...n, ...r.nuut])
      setToestand('oesklaar')
      stuurDieOes()
    }
  }, [modus, wagVir])

  /* ── Stuur die lopie in ──
     Ons stuur die saad en die skuiwe. Nie die punte nie: die bediener speel
     dit oor en tel self. Daar is dus niks om te oordryf nie. */
  const stuurDieOes = useCallback(async () => {
    const o = oes.current
    if (!o.lopie || !o.skuiwe.length) return
    const naam = leesNaam()
    if (!naam) return            // die skerm vra dit; ons stuur daarna
    if (naamAfgewys()) return

    setStuurBesig(true)
    const lopie = modus === 'daagliks'
      ? { soort: 'daagliks', dag: o.dag, skuiwe: o.skuiwe }
      : { soort: 'oneindig', saad: o.saad, skuiwe: o.skuiwe }
    const uit = await stuurOes(naam, lopie)
    setUitslag(uit)
    setStuurBesig(false)
  }, [modus])

  function stoorNaamEnStuur() {
    const f = keurNaam(naamIn)
    if (f) { setNaamFout(f); return }
    stoorNaam(naamIn.trim().replace(/\s+/g, ' '))
    setNaamFout(null)
    stuurDieOes()
  }

  /* ── Een skuif ── */
  const speelSkuif = useCallback(async (a, b) => {
    const t = teken.current
    if (!t || besig) return
    setBesig(true)
    setGekies(null); t.stelKies(null)
    if (modus === 'reis') await speelReisSkuif(a, b)
    else await speelOesSkuif(a, b)
  }, [besig, modus, speelReisSkuif, speelOesSkuif])

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

  function huidigeBord() {
    return modus === 'reis' ? spel.current.bord : (oes.current.lopie && oes.current.lopie.bord)
  }

  function kiesSel(pos) {
    if (besig || toestand !== 'speel' || !pos) return
    const bord = huidigeBord()
    const sel = bord && bord.selle[pos.r * 8 + pos.k]
    if (!sel || bedekSel(sel)) return
    if (!gekies) { setGekies(pos); teken.current.stelKies(pos); return }
    if (gekies.k === pos.k && gekies.r === pos.r) { setGekies(null); teken.current.stelKies(null); return }
    const naby = Math.abs(gekies.k - pos.k) + Math.abs(gekies.r - pos.r) === 1
    if (!naby) { setGekies(pos); teken.current.stelKies(pos); return }
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
  function raakEinde() {
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

  /* ── Deel ── */
  async function deel() {
    const wat = isOes
      ? `Ek het ${punte.toLocaleString('af')} punte in ${modus === 'daagliks' ? 'Vandag se Oes' : 'Die Oneindige Oes'} gehaal — ronde ${oesRonde}.`
      : `Ek het fase ${vlak.nr} van Vrugtefees klaargemaak met ${punte.toLocaleString('af')} punte.`
    const teks = `${wat}\n\nVrugtefees, in Daaglikse Hoop.`
    try {
      if (navigator.share) { await navigator.share({ text: teks, url: window.location.origin }) ; return }
      await navigator.clipboard.writeText(`${teks}\n${window.location.origin}`)
      setRoep('GEKOPIEER')
      setTimeout(() => setRoep(null), 1400)
    } catch { /* die speler het gekanselleer; dis nie 'n fout nie */ }
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
      const bord = modus === 'reis' ? spel.current.bord : (oes.current.lopie && oes.current.lopie.bord)
      if (bord) t.stelBord(bord)
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

  useEffect(() => {
    const h = HOOFSTUKKE.findIndex(x => vordering.hoogste >= x.vanaf && vordering.hoogste <= x.tot)
    if (h >= 0) setKaartHoofstuk(h)
  }, [])

  const doelWoorde = useMemo(() => doelTeks(vlak.doel, vrugNaam), [vlak])

  /* Die toonbank. Een lys vir ELKE doelwit-tipe.

     Dit het net vir 'versamel' en 'skoonmaak' bestaan; die ander sewe tipes
     het niks gewys nie behalwe 'n balkie. Op fase 12 — maak vier spesiale
     vrugte — was daar dus letterlik niks om na te kyk nie. */
  const doelLys = useMemo(() => {
    if (isOes) return null
    const st = spel.current.stand
    if (!st) return null
    return doelTelling(vlak.doel, st, spel.current.bord)
  }, [vlak, punte, tik, toestand, isOes])

  const prestasieStand = useMemo(() => leesPrestasies(), [toestand, nuutBehaal.length])

  /* Wat in die kop staan. Die ranglys en die prestasies is nie 'n tuin nie,
     dus mag die hoofstuk se naam nie daar bly staan nie. */
  const kopNaam = toestand === 'kaart'       ? 'Vrugtefees'
                : toestand === 'oesmeesters' ? 'Oesmeesters'
                : toestand === 'prestasies'  ? 'Prestasies'
                : modus === 'daagliks'       ? 'Vandag se Oes'
                : modus === 'oneindig'       ? 'Die Oneindige Oes'
                : hoofstuk.naam

  return (
    <div className="vf-oorleg">

      {/* Die tuin agter alles. Elke hoofstuk het sy eie.

          Dit het lank net 0 of 1 deurgegee, wat beteken al nege hoofstukke
          het twee agtergronde gedeel — sewe geskilderde tuine wat niemand
          ooit gesien het nie. */}
      <TuinAgtergrond hoofstuk={agtergrondNr} />

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
        <span className="vf-titel">{kopNaam}</span>
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
              {isOes ? <>
                <span>Ronde {oesRonde}</span>
                <b>oes {oesTeiken} {vrugNaam(oesSoort)}</b>
              </> : <>
                <span>Fase {vlak.nr}</span>
                <b>{doelWoorde}</b>
              </>}
            </div>
          </div>

          <div className="vf-balk"><i style={{ width: `${Math.round(vorder * 100)}%` }} /></div>

          {isOes && (
            <div className="vf-versamel">
              <div className={`vf-versamel-item${oesHet >= oesTeiken ? ' klaar' : ''}`}>
                <Vrug soort={oesSoort} grootte={34} />
                <b>{oesHet}/{oesTeiken}</b>
              </div>
            </div>
          )}

          {doelLys && doelLys.length > 0 && (
            <div className="vf-versamel">
              {doelLys.map(d => (
                <div key={d.sleutel} className={`vf-versamel-item${d.het >= d.nodig ? ' klaar' : ''}`}>
                  {d.soort === 'vrug' ? <Vrug soort={d.vrug} grootte={34} />
                   : d.soort === 'blok' ? <i className={'vf-blokmerk blok-' + d.blok} />
                   : <i className="vf-merkie">{d.merk}</i>}
                  <b>{d.het}/{d.nodig}</b>
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
          className={'vf-doek' + (toestand === 'kaart' || toestand === 'oesmeesters' || toestand === 'prestasies' ? ' weg' : '')}
          onTouchStart={raakBegin}
          onTouchMove={raakBeweeg}
          onTouchEnd={raakEinde}
          onMouseDown={raakBegin}
          onMouseMove={raakBeweeg}
          onMouseUp={raakEinde}
          onMouseLeave={() => { sleep.current = null }}
        />

        {roep && <div className="vf-roep">{roep}</div>}

        {/* 'n Nuwe prestasie. Dit onderbreek niks: dit gly in en weer weg. */}
        {nuutBehaal.length > 0 && toestand === 'speel' && (
          <div className="vf-nuut" onClick={() => setNuutBehaal([])}>
            <b>{nuutBehaal[nuutBehaal.length - 1].naam}</b>
            <span>{nuutBehaal[nuutBehaal.length - 1].beskrywing}</span>
          </div>
        )}

        {/* ── Vlakkaart ── */}
        {toestand === 'kaart' && (
          <div className="vf-blad">
            <span className="vf-merk">{HOOFSTUKKE[kaartHoofstuk].naam}</span>
            <h2 className="vf-blad-titel">Vrugtefees</h2>
            <p className="vf-blad-teks">
              Skuif twee vrugte langs mekaar om drie of meer te pas.
            </p>

            <button
              className="vf-knop vf-knop-primer vf-speelknop"
              onClick={() => beginVlak(vordering.hoogste)}
            >
              Speel
              <small>Fase {vordering.hoogste}</small>
            </button>

            <div className="vf-modusknoppe">
              <button className="vf-modusknop" onClick={() => beginOesLopie('daagliks')}>
                <b>Vandag se Oes</b>
                <small>Almal speel dieselfde bord</small>
              </button>
              <button className="vf-modusknop" onClick={() => beginOesLopie('oneindig')}>
                <b>Die Oneindige Oes</b>
                <small>Speel tot die skuiwe op is</small>
              </button>
            </div>

            <div className="vf-hoofstukbalk">
              <button
                className="vf-pyl"
                onClick={() => setKaartHoofstuk(h => Math.max(0, h - 1))}
                disabled={kaartHoofstuk === 0}
                aria-label="Vorige tuin"
              >‹</button>
              <span>{HOOFSTUKKE[kaartHoofstuk].naam}</span>
              <button
                className="vf-pyl"
                onClick={() => setKaartHoofstuk(h => Math.min(HOOFSTUKKE.length - 1, h + 1))}
                disabled={kaartHoofstuk >= HOOFSTUKKE.length - 1 ||
                          HOOFSTUKKE[kaartHoofstuk + 1].vanaf > vordering.hoogste}
                aria-label="Volgende tuin"
              >›</button>
            </div>

            <div className="vf-vlakrooster">
              {VLAKKE.filter(v => v.nr >= HOOFSTUKKE[kaartHoofstuk].vanaf &&
                                   v.nr <= HOOFSTUKKE[kaartHoofstuk].tot).map(v => {
                const oop = v.nr <= vordering.hoogste
                return (
                  <button
                    key={v.nr}
                    className={`vf-vlakknop${oop ? '' : ' toe'}${v.nr === vordering.hoogste ? ' nou' : ''}`}
                    disabled={!oop}
                    onClick={() => beginVlak(v.nr)}
                  >
                    {v.nr}
                    {vordering.bestes[v.nr] ? <i /> : null}
                  </button>
                )
              })}
            </div>
            <p className="vf-fyndruk">Fase {vordering.hoogste} van {VLAKKE.length} oop</p>

            <button className="vf-knop vf-knop-spook" onClick={() => setToestand('oesmeesters')}>
              Top 20 Oesmeesters
            </button>
            <button className="vf-knop vf-knop-spook" onClick={() => setToestand('prestasies')}>
              Prestasies ({Object.keys(prestasieStand.behaal).length} van {PRESTASIES.length})
            </button>
            <button className="vf-knop vf-knop-spook" onClick={wisselRustig}>
              Rustige beweging: {rustig ? 'aan' : 'af'}
            </button>
          </div>
        )}

        {/* ── Tutoriaal ── */}
        {toestand === 'speel' && tutStap >= 0 && (
          <div className="vf-wenk vf-tut">
            <span className="vf-merk">{tutStap + 1} van {TUT.length}</span>
            <h3>{TUT[tutStap].titel}</h3>
            <p>{TUT[tutStap].teks}</p>
            <button
              className="vf-knop vf-knop-primer"
              onClick={() => {
                if (tutStap + 1 < TUT.length) setTutStap(tutStap + 1)
                else { merkTutoriaal(); setTutStap(-1) }
              }}
            >
              {tutStap + 1 < TUT.length ? 'Volgende' : 'Kom ons speel'}
            </button>
            <button className="vf-knop vf-knop-spook" onClick={() => { merkTutoriaal(); setTutStap(-1) }}>
              Slaan oor
            </button>
          </div>
        )}

        {/* ── Wenk ── */}
        {toestand === 'speel' && tutStap < 0 && wenkWys && vlak.wenk && !isOes && (
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
            {!isOes && (
              <button className="vf-knop vf-knop-spook" onClick={() => beginVlak(vlakNr)}>Begin die fase weer</button>
            )}
            <button className="vf-knop vf-knop-spook" onClick={() => { setModus('reis'); setToestand('kaart') }}>
              Terug na die fases
            </button>
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
            {(() => {
              const h = HOOFSTUKKE.findIndex(x => x.tot === vlak.nr)
              return h >= 0 ? <p className="vf-hoofstukwoord">{HOOFSTUK_WOORD[h]}</p> : null
            })()}

            {nuutBehaal.length > 0 && (
              <div className="vf-nuut-lys">
                {nuutBehaal.map(p => (
                  <div key={p.id}><b>{p.naam}</b><span>{p.beskrywing}</span></div>
                ))}
              </div>
            )}

            {vlak.nr < VLAKKE.length ? (
              <button className="vf-knop vf-knop-primer" onClick={() => beginVlak(vlak.nr + 1)}>
                Volgende fase
              </button>
            ) : (
              <p className="vf-blad-teks">
                Jy het al {VLAKKE.length} fases klaargemaak — die hele Tuinreis.
              </p>
            )}
            <button className="vf-knop vf-knop-spook" onClick={deel}>Deel</button>
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

        {/* ── 'n Oes-lopie is klaar ── */}
        {toestand === 'oesklaar' && (
          <div className="vf-blad">
            <span className="vf-merk">{modus === 'daagliks' ? 'Vandag se Oes' : 'Die Oneindige Oes'}</span>
            <h2 className="vf-blad-titel">Die mandjies is vol</h2>
            <div className="vf-uitslag">
              <div><span>Punte</span><b>{punte.toLocaleString('af')}</b></div>
              <div><span>Rondes</span><b>{oes.current.lopie ? oes.current.lopie.rondesKlaar : 0}</b></div>
              <div><span>Skuiwe</span><b>{oes.current.lopie ? oes.current.lopie.skuiweGedoen : 0}</b></div>
            </div>

            {nuutBehaal.length > 0 && (
              <div className="vf-nuut-lys">
                {nuutBehaal.map(p => (
                  <div key={p.id}><b>{p.naam}</b><span>{p.beskrywing}</span></div>
                ))}
              </div>
            )}

            {/* Die ranglys. Ons vra die naam eers hier — nie voor die spel
                nie, want dan vra ons iets voordat 'n mens weet of jy wil. */}
            {!leesNaam() && !naamAfgewys() && (
              <div className="vf-naamvra">
                <p className="vf-blad-teks">Wil jy hierdie oes op die wêreldwye lys sit?</p>
                <input
                  className="vf-inset"
                  value={naamIn}
                  maxLength={20}
                  placeholder="Jou naam"
                  onChange={e => { setNaamIn(e.target.value); setNaamFout(null) }}
                />
                {naamFout && <p className="vf-fout">{naamFout}</p>}
                <button className="vf-knop vf-knop-primer" onClick={stoorNaamEnStuur}>Stuur in</button>
                <button className="vf-knop vf-knop-spook" onClick={() => { wysNaamAf(); setUitslag(null) }}>
                  Nee dankie
                </button>
              </div>
            )}

            {stuurBesig && <p className="vf-blad-teks">Besig om in te stuur…</p>}

            {uitslag && uitslag.ok && (
              <p className="vf-blad-teks">
                {uitslag.rang
                  ? <>Jy is <b>nommer {uitslag.rang}</b> van {uitslag.totaal.toLocaleString('af')}.</>
                  : <>Ingestuur.</>}
                {!uitslag.beterAs && <><br /><small>Jou vorige lopie was beter, dus bly daardie een staan.</small></>}
              </p>
            )}
            {uitslag && !uitslag.ok && (
              <p className="vf-fout">{uitslag.fout}</p>
            )}

            <button className="vf-knop vf-knop-primer" onClick={() => beginOesLopie(modus)}>
              Nog 'n keer
            </button>
            <button className="vf-knop vf-knop-spook" onClick={deel}>Deel</button>
            <button className="vf-knop vf-knop-spook" onClick={() => setToestand('oesmeesters')}>
              Top 20 Oesmeesters
            </button>
            <button className="vf-knop vf-knop-spook" onClick={() => { setModus('reis'); setToestand('kaart') }}>
              Terug na die fases
            </button>
          </div>
        )}

        {/* ── Oesmeesters ── */}
        {toestand === 'oesmeesters' && (
          <Oesmeesters
            myUid={myUid}
            terug={() => setToestand(oes.current.lopie && modus !== 'reis' ? 'oesklaar' : 'kaart')}
            naamNodig={!leesNaam() && !naamAfgewys()}
            onNaam={() => stuurDieOes()}
          />
        )}

        {/* ── Prestasies ── */}
        {toestand === 'prestasies' && (
          <div className="vf-blad">
            <span className="vf-merk">
              {Object.keys(prestasieStand.behaal).length} van {PRESTASIES.length}
            </span>
            <h2 className="vf-blad-titel">Prestasies</h2>
            <div className="vf-prestasie-lys">
              {PRESTASIES.map(p => {
                const behaal = !!prestasieStand.behaal[p.id]
                return (
                  <div key={p.id} className={'vf-prestasie' + (behaal ? ' behaal' : '')}>
                    <b>{behaal ? p.naam : '—'}</b>
                    <span>{p.beskrywing}</span>
                  </div>
                )
              })}
            </div>
            <button className="vf-knop vf-knop-spook" onClick={() => setToestand('kaart')}>Terug</button>
          </div>
        )}
      </div>
    </div>
  )
}
