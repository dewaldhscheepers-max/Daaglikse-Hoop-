import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { playHout, playPlanke, playHit, playLevelComplete, toggleMute, isMuted } from '../utils/sound'
import { stadiumBy, doelTeks, WOLKE_VANAF, REEN_VANAF, WATER_VANAF } from '../data/arkStadiums'
import { Dier, dierNaam } from '../data/arkDiere'
import {
  leesNaam, stoorNaam, keurNaam, haalRanglys, kasLys,
  stuurPunt, stuurWagry, naamAfgewys, wysNaamAf,
} from '../data/arkRanglys'
import ArkBou from '../components/ArkBou'
import './BouDieArk.css'

/* ────────────────────────────────────────────────────────────
   Bou die Ark
   Kern-meganika, stadiums met doelwitte, die ark wat opbou,
   dierepare, versameling, weer, en die wereldwye ranglys.

   Die ranglys is werklik wereldwyd: die punte leef in Firestore en die
   kliënt mag nie daarheen skryf nie. Alles gaan deur /api/ark-ranglys,
   wat die speler se Firebase-token verifieer en toets of die lopie fisies
   moontlik is. Sien src/data/arkRanglys.js vir die kliënt se kant.
   ──────────────────────────────────────────────────────────── */

const KOL = 10
const RY  = 20

// Stukke in SRS-vorm. Elke rotasie is 'n eksplisiete matriks — geen
// draai-berekening tydens spel nie, dus geen afrondingsfoute.
const STUKKE = {
  I: { kleur: '#3E7C8C', vorms: [
    [[0,1],[1,1],[2,1],[3,1]], [[2,0],[2,1],[2,2],[2,3]],
    [[0,2],[1,2],[2,2],[3,2]], [[1,0],[1,1],[1,2],[1,3]] ] },
  O: { kleur: '#C9A961', vorms: [
    [[1,0],[2,0],[1,1],[2,1]], [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]], [[1,0],[2,0],[1,1],[2,1]] ] },
  T: { kleur: '#7C6FAF', vorms: [
    [[1,0],[0,1],[1,1],[2,1]], [[1,0],[1,1],[2,1],[1,2]],
    [[0,1],[1,1],[2,1],[1,2]], [[1,0],[0,1],[1,1],[1,2]] ] },
  S: { kleur: '#6B9E70', vorms: [
    [[1,0],[2,0],[0,1],[1,1]], [[1,0],[1,1],[2,1],[2,2]],
    [[1,1],[2,1],[0,2],[1,2]], [[0,0],[0,1],[1,1],[1,2]] ] },
  Z: { kleur: '#B5714F', vorms: [
    [[0,0],[1,0],[1,1],[2,1]], [[2,0],[1,1],[2,1],[1,2]],
    [[0,1],[1,1],[1,2],[2,2]], [[1,0],[0,1],[1,1],[0,2]] ] },
  J: { kleur: '#5A6E96', vorms: [
    [[0,0],[0,1],[1,1],[2,1]], [[1,0],[2,0],[1,1],[1,2]],
    [[0,1],[1,1],[2,1],[2,2]], [[1,0],[1,1],[0,2],[1,2]] ] },
  L: { kleur: '#C2803F', vorms: [
    [[2,0],[0,1],[1,1],[2,1]], [[1,0],[1,1],[1,2],[2,2]],
    [[0,1],[1,1],[2,1],[0,2]], [[0,0],[1,0],[1,1],[1,2]] ] },
}
const SLEUTELS = Object.keys(STUKKE)

// Muurstampe: as 'n rotasie bots, probeer hierdie verskuiwings.
const STAMPE = [[0,0], [-1,0], [1,0], [-2,0], [2,0], [0,-1], [-1,-1], [1,-1]]

// Spoedkurwe — begin vriendelik, bereik 'n getoetste maksimum en bly daar.
const BEGIN_MS = 1000
const STAP_MS  = 70
const MIN_MS   = 220        // getoetste maksimum spoed; nooit vinniger nie
/* Die spoed volg die stadium. Daar is net een vorderingsgetal in die spel:
   die stadium van Noag se verhaal. Stadium 1 val stadig, stadium 12 — die
   einde van die verhaal — val naby die vinnigste wat ons toelaat. */
function valTempo(stadium) {
  return Math.max(MIN_MS, BEGIN_MS - (stadium - 1) * STAP_MS)
}

const PUNTE = { 1: 100, 2: 300, 3: 500, 4: 800 }

const STOOR   = 'ark_stoor'
const VERSAMEL = 'ark_diere'
const VERSTE   = 'ark_verste'

/* Hoe ver jy al ooit in die verhaal gekom het. 'n Nuwe spel begin twee
   stadiums hieronder: jy herdoen nooit die hele verhaal en herwin nooit
   diere wat lankal in die ark is nie, maar jy kry darem 'n paar stadiums
   om warm te word voordat die spoed weer is waar jy dit gelos het. */
const TERUG_BY_NUWE = 2

function leesVerste() {
  try { return Math.max(1, Number(localStorage.getItem(VERSTE)) || 1) } catch { return 1 }
}
function stoorVerste(nr) {
  try { if (nr > leesVerste()) localStorage.setItem(VERSTE, String(nr)) } catch {}
}
function beginStadium() {
  return Math.max(1, leesVerste() - TERUG_BY_NUWE)
}

function leesDiere() {
  try { return JSON.parse(localStorage.getItem(VERSAMEL) || '[]') } catch { return [] }
}
function stoorDier(id) {
  try {
    const h = leesDiere()
    if (!h.includes(id)) localStorage.setItem(VERSAMEL, JSON.stringify([...h, id]))
  } catch {}
}

// roundRect is eers Chrome 99+. Sonder 'n terugval gooi die hele
// tekenfunksie op ouer toestelle en die spel vries.
function ronde(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r)
    return
  }
  const rr = Math.min(r, w / 2, h / 2)
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y,     x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x,     y + h, rr)
  ctx.arcTo(x,     y + h, x,     y,     rr)
  ctx.arcTo(x,     y,     x + w, y,     rr)
  ctx.closePath()
}

function leegBord() {
  return Array.from({ length: RY }, () => Array(KOL).fill(null))
}

// 7-sak: elke stuk kom een keer per sak voor. Geen wrede reekse nie.
function nuweSak() {
  const s = [...SLEUTELS]
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[s[i], s[j]] = [s[j], s[i]]
  }
  return s
}

function maakStuk(tipe) {
  return { tipe, rot: 0, x: 3, y: -1 }
}

function selle(stuk) {
  return STUKKE[stuk.tipe].vorms[stuk.rot].map(([dx, dy]) => [stuk.x + dx, stuk.y + dy])
}

function bots(bord, stuk) {
  return selle(stuk).some(([x, y]) => {
    if (x < 0 || x >= KOL || y >= RY) return true
    if (y < 0) return false
    return bord[y][x] !== null
  })
}

/* Die bord se afgeronde hoeke. Dit was 'n border-radius in CSS, maar 'n
   afgeronde rand op 'n saamgestelde laag dwing die blaaier om 'n masker-laag
   te maak — nog 'n laag wat op haar foon ongeverf gewys kan word. Ons teken
   die ronding nou binne-in die doek, dus lyk dit presies dieselfde en is
   daar geen masker nie. */
function bordRonding(w) {
  return Math.max(6, (w / KOL) * 0.6)
}

/* Die stil agtergrond: agtergrondkleur, wolke en die leë selle. Word een
   keer gebou en daarna net oorgeplak. */
function bouAgtergrond(w, h, stNr) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const g = c.getContext('2d', { willReadFrequently: true })
  const bg = w / KOL

  // Alles binne die afgeronde vorm; die hoeke bly deursigtig.
  g.beginPath()
  ronde(g, 0, 0, w, h, bordRonding(w))
  g.clip()

  g.fillStyle = stNr >= WOLKE_VANAF ? '#141020' : '#1B1626'
  g.fillRect(0, 0, w, h)

  if (stNr >= WOLKE_VANAF) {
    g.fillStyle = 'rgba(120,110,150,0.10)'
    for (let i = 0; i < 3; i++) {
      g.beginPath()
      g.ellipse(w * (0.2 + i * 0.3), h * 0.05, w * 0.3, h * 0.035, 0, 0, Math.PI * 2)
      g.fill()
    }
  }

  g.fillStyle = 'rgba(255,255,255,0.035)'
  const r = Math.max(2, bg * 0.16)
  for (let y = 0; y < RY; y++) {
    for (let x = 0; x < KOL; x++) {
      g.beginPath()
      ronde(g, x * bg + 1.5, y * bg + 1.5, bg - 3, bg - 3, r)
      g.fill()
    }
  }
  return c
}

export default function BouDieArk({ onClose }) {
  const [toestand, setToestand] = useState('menu')  // menu · speel · pouse · verloor
  const [telling, setTelling]   = useState(0)
  const [lyne, setLyne]         = useState(0)
  const [volgende, setVolgende] = useState(null)
  const [stil, setStil]         = useState(isMuted())
  // Die gestoorde spel se opsomming, of null. Ons wys dit in die telbord
  // terwyl die menu oop is, sodat dit duidelik is dat niks verlore is nie.
  const [bewaar, setBewaar]     = useState(null)
  const [stadiumNr, setStadiumNr] = useState(1)
  const [vorder, setVorder]     = useState(0)      // 0..1 na die doelwit toe
  const [klaar, setKlaar]       = useState(null)   // stadium-klaar oorlegblad
  const [diere, setDiere]       = useState(() => leesDiere())
  const [wysDiere, setWysDiere] = useState(false)
  // Verander elke keer as die spel-lus van voor af moet begin
  const [rondte, setRondte]     = useState(0)

  /* ── Ranglys ──
     ranglys is null solank ons nie 'n antwoord het nie. 'n Leë lys en 'n
     mislukte oproep is nie dieselfde ding nie, dus hou ons die fout apart
     en wys nooit 'n leë lys as die waarheid nie. */
  const [wysRanglys, setWysRanglys]   = useState(false)
  const [ranglys, setRanglys]         = useState(null)     // { lys, totaal }
  const [ranglysFout, setRanglysFout] = useState(null)
  const [ranglysLaai, setRanglysLaai] = useState(false)
  const [ranglysOud, setRanglysOud]   = useState(null)     // wanneer die kas gemaak is
  const [naam, setNaam]               = useState(() => leesNaam())
  const [afgewys, setAfgewys]         = useState(() => naamAfgewys())
  const [naamInvoer, setNaamInvoer]   = useState('')
  const [naamFout, setNaamFout]       = useState(null)
  const [stuur, setStuur]             = useState(null)     // { besig, rang, totaal, fout, beterAs }

  const vorderRef = useRef(0)
  const doekRef  = useRef(null)
  const wrapRef  = useRef(null)
  const beheerRef = useRef(null)

  // Spel-toestand leef in 'n ref sodat die lus nie by elke raam herbou nie
  const spel = useRef({
    bord: leegBord(),
    stuk: null,
    sak: [],
    volgende: null,
    telling: 0, lyne: 0,
    // Wat die bediener nodig het om te keur of die lopie moontlik is
    stukke: 0, speelMs: 0,
    val: 0, laas: 0,
    loop: false,
    // stadium
    stadium: 1,
    sLyne: 0, sPunte: 0, sBesteMulti: 0, sKombo: 0, sTyd: 0,
    weer: { druppels: [], water: 0 },
  })

  /* ── Hoeveel van die doelwit is klaar ── */
  function doelVordering(s) {
    const st = stadiumBy(s.stadium)
    const d = st.doel
    switch (d.tipe) {
      case 'lyne':    return Math.min(1, s.sLyne / d.waarde)
      case 'punte':   return Math.min(1, s.sPunte / d.waarde)
      case 'multi':   return Math.min(1, s.sBesteMulti / d.waarde)
      case 'kombo':   return Math.min(1, s.sKombo / d.waarde)
      case 'oorleef': return Math.min(1, s.sTyd / d.waarde)
      default:        return 0
    }
  }

  /* ── Teken ── */
  // Merk dat daar iets nuuts is om te teken. Sonder dit herteken die lus
  // 60 keer per sekonde al staan alles stil, wat op swakker toestelle
  // flikker en strepe veroorsaak.
  const vuil = useRef(true)
  const merkVuil = useCallback(() => { vuil.current = true }, [])

  /* ── Die stil agtergrond ──
     Die rooster was 1-pixel haarlyne. 'n Doek se buffer pas selde presies op
     die skerm se pixels (haar foon se DPR is 2.81, die buffer is tot 2×
     beperk), dus word alles met 'n nie-heeltallige faktor verklein. 'n Lyn
     van een pixel land dan soms op 'n pixelgrens en soms tussenin: party
     lyne word helder, party verdwyn, en dit skuif heen en weer. Dit is die
     strepe. Sagte teels het geen dun rand nie en verklein skoon.
     Ons bou dit een keer en plak dit daarna net oor. */
  const agtergrond = useRef({ sleutel: '', doek: null })

  const teken = useCallback(() => {
    const doek = doekRef.current
    if (!doek) return
    vuil.current = false
    /* willReadFrequently laat Chrome die doek op die SVE hou in plaas van
       op die GPU. Dit is die hele punt hier: 'n GPU-doek is 'n aparte
       grafiese laag, en alles wat ná daardie laag kom — die knoppiebalk —
       beland in 'n eie laag daarbo. Op haar foon word daardie laag gewys
       voordat dit geverf is, en dan sien sy rou geheue. Vredepad het geen
       doek nie, en daarom glitch Vredepad nie.
       Die bord is klein en word net herteken wanneer iets verander, dus
       kos die SVE-pad ons niks wat 'n mens kan sien nie. */
    const ctx = doek.getContext('2d', { willReadFrequently: true })
    const s   = spel.current
    const bg  = doek.width / KOL

    // Die agtergrond word donkerder soos die storm nader kom, dus is die
    // stadium deel van die sleutel.
    const st = stadiumBy(s.stadium)
    const sleutel = doek.width + ':' + doek.height + ':' + (st.nr >= WOLKE_VANAF ? 'storm' : 'kalm')
    if (agtergrond.current.sleutel !== sleutel) {
      agtergrond.current = { sleutel, doek: bouAgtergrond(doek.width, doek.height, st.nr) }
    }
    // Die agtergrond se hoeke is deursigtig, dus moet ons wel skoonmaak.
    ctx.clearRect(0, 0, doek.width, doek.height)
    ctx.drawImage(agtergrond.current.doek, 0, 0)
    // Alles hierna bly binne die afgeronde bord.
    ctx.save()
    ctx.beginPath()
    ronde(ctx, 0, 0, doek.width, doek.height, bordRonding(doek.width))
    ctx.clip()

    const blok = (x, y, kleur, deurskyn) => {
      if (y < 0) return
      const px = x * bg, py = y * bg, r = Math.max(2, bg * 0.16)
      ctx.globalAlpha = deurskyn ? 0.22 : 1
      ctx.fillStyle = kleur
      ctx.beginPath()
      ronde(ctx, px + 1.5, py + 1.5, bg - 3, bg - 3, r)
      ctx.fill()
      if (!deurskyn) {
        // sagte hoogtepunt bo — gee die blok diepte sonder om luidrugtig te wees
        ctx.fillStyle = 'rgba(255,255,255,0.16)'
        ctx.beginPath()
        ronde(ctx, px + 1.5, py + 1.5, bg - 3, (bg - 3) * 0.36, r)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    // reeds geplaas
    for (let y = 0; y < RY; y++) {
      for (let x = 0; x < KOL; x++) if (s.bord[y][x]) blok(x, y, s.bord[y][x], false)
    }

    // reën en stygende water — altyd agter die stukke, nooit oor die spel nie
    if (st.nr >= REEN_VANAF) {
      ctx.strokeStyle = 'rgba(170,190,225,0.22)'
      ctx.lineWidth = Math.max(1, bg * 0.045)
      s.weer.druppels.forEach(d => {
        ctx.beginPath()
        ctx.moveTo(d.x * doek.width, d.y * doek.height)
        ctx.lineTo(d.x * doek.width, d.y * doek.height + doek.height * 0.035)
        ctx.stroke()
      })
    }
    if (st.nr >= WATER_VANAF && s.weer.water > 0) {
      const wy = doek.height * (1 - s.weer.water * 0.22)
      const g = ctx.createLinearGradient(0, wy, 0, doek.height)
      g.addColorStop(0, 'rgba(70,120,160,0.30)')
      g.addColorStop(1, 'rgba(40,80,120,0.42)')
      ctx.fillStyle = g
      ctx.fillRect(0, wy, doek.width, doek.height - wy)
    }

    // skaduwee waar die stuk sal land
    if (s.stuk) {
      const skadu = { ...s.stuk }
      while (!bots(s.bord, { ...skadu, y: skadu.y + 1 })) skadu.y++
      selle(skadu).forEach(([x, y]) => blok(x, y, STUKKE[s.stuk.tipe].kleur, true))
      selle(s.stuk).forEach(([x, y]) => blok(x, y, STUKKE[s.stuk.tipe].kleur, false))
    }
    ctx.restore()
  }, [])

  /* ── Grootte pas by die skerm ──
     Die doek se agtergrondbuffer word net uit die BREEDTE bereken, nooit uit
     die hoogte nie. Op Android skuif Chrome se adresbalk in en uit sodra jy
     naby die onderkant raak, en dan verander die skerm se hoogte tientalle
     kere in 'n sekonde. Elke skryf na canvas.width maak die doek skoon en
     dwing 'n nuwe uitleg af — dit is wat die strepe en die geflikker maak.
     Die breedte verander nooit tydens daardie animasie nie, dus bly die
     buffer stil. CSS (max-height) krimp die doek visueel as die hoogte min
     word; dit kos die GPU niks en maak niks skoon nie. */
  useEffect(() => {
    function pas() {
      const doek = doekRef.current, wrap = wrapRef.current
      if (!doek || !wrap) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      // clientWidth sluit die houer se 14px-kantvulling in
      const ruimte = wrap.clientWidth > 60 ? wrap.clientWidth - 28 : window.innerWidth - 28
      const breed  = Math.max(120, ruimte)

      const bg = Math.max(8, Math.floor((breed / KOL) * dpr))
      const nw = bg * KOL, nh = bg * RY

      if (doek.width === nw && doek.height === nh) return
      doek.width  = nw
      doek.height = nh
      vuil.current = true
      teken()
    }
    pas()
    // Die uitleg gaan eers ná 'n raam of twee sit.
    const t1 = setTimeout(pas, 60)
    const t2 = setTimeout(pas, 300)
    // resize bly aan vir 'n werklike breedte-verandering (draai die foon om).
    // 'n Blote hoogte-verandering laat pas() dadelik terugkeer sonder om
    // enigiets aan die DOM te skryf, dus kos die adresbalk se animasie niks.
    window.addEventListener('resize', pas)
    window.addEventListener('orientationchange', pas)
    return () => {
      clearTimeout(t1); clearTimeout(t2)
      window.removeEventListener('resize', pas)
      window.removeEventListener('orientationchange', pas)
    }
  }, [teken, toestand])

  /* ── Stukbestuur ── */
  function trekVolgende(s) {
    if (s.sak.length < 2) s.sak.push(...nuweSak())
    return s.sak.shift()
  }

  const plaasNuwe = useCallback(() => {
    const s = spel.current
    const tipe = s.volgende || trekVolgende(s)
    s.volgende = trekVolgende(s)
    setVolgende(s.volgende)
    s.stuk = maakStuk(tipe)
    if (bots(s.bord, s.stuk)) {
      s.loop = false
      s.stuk = null
      try { localStorage.removeItem(STOOR) } catch {}
      setBewaar(null)
      setToestand('verloor')
      playHit()
      return false
    }
    return true
  }, [])

  const voltooiStadium = useCallback(() => {
    const s = spel.current
    const st = stadiumBy(s.stadium)
    s.loop = false
    // Was hierdie dier al in die ark? Dan moet die kaart nie maak of jy hom
    // nou eers gewen het nie.
    const reeds = leesDiere().includes(st.dier)
    stoorDier(st.dier)
    setDiere(leesDiere())
    // Wanneer die stadium klaar is deurdat 'n stuk pas vasgemaak het, is daar
    // niks meer op die bord nie. Sit dadelik 'n nuwe stuk neer sodat die spel
    // se toestand heel bly: "Hou hier op" moet kan stoor, en die lus moet iets
    // he om te laat val wanneer jy weer begin.
    if (!s.stuk && !plaasNuwe()) return    // die ark het volgeraak
    setKlaar({ ...st, reeds })
    playLevelComplete()
  }, [plaasNuwe])

  function volgendeStadium() {
    const s = spel.current
    s.stadium += 1
    stoorVerste(s.stadium)
    s.sLyne = 0; s.sPunte = 0; s.sBesteMulti = 0; s.sKombo = 0
    s.sTyd = 0
    s.weer.druppels = []; s.weer.water = 0
    setStadiumNr(s.stadium)
    setVorder(0)
    setKlaar(null)
    vuil.current = true
    setToestand('speel')
    // Kritiek: toestand was reeds 'speel', dus sou React die spel-lus se
    // effek nie weer laat loop nie en die lus bly dood. Hierdie teller
    // verander wel, dus begin die lus van voor af.
    setRondte(r => r + 1)
  }

  /* ── Vasmaak en lyne skoonmaak ── */
  const vasmaak = useCallback(() => {
    const s = spel.current
    s.stukke += 1
    selle(s.stuk).forEach(([x, y]) => { if (y >= 0) s.bord[y][x] = STUKKE[s.stuk.tipe].kleur })
    vuil.current = true

    const oor = s.bord.filter(ry => ry.some(c => c === null))
    const skoon = RY - oor.length
    if (skoon > 0) {
      while (oor.length < RY) oor.unshift(Array(KOL).fill(null))
      s.bord = oor
      const wins = (PUNTE[skoon] || 0) * s.stadium
      s.lyne += skoon
      s.telling += wins
      s.sLyne += skoon
      s.sPunte += wins
      s.sBesteMulti = Math.max(s.sBesteMulti, skoon)
      s.sKombo += 1
      playPlanke(skoon)
      setLyne(s.lyne)
    } else {
      s.sKombo = 0          // kombo breek wanneer 'n stuk geen ry maak nie
      playHout()   // 'n plank kom tot rus
    }
    setTelling(s.telling)

    const v = doelVordering(s)
    setVorder(v)
    if (v >= 1) { s.stuk = null; voltooiStadium(); return }

    plaasNuwe()
  }, [plaasNuwe])

  /* ── Bewegings ── */
  const skuif = useCallback((dx) => {
    const s = spel.current
    if (!s.loop || !s.stuk) return
    const p = { ...s.stuk, x: s.stuk.x + dx }
    if (!bots(s.bord, p)) { s.stuk = p; teken() }
  }, [teken])

  const draai = useCallback(() => {
    const s = spel.current
    if (!s.loop || !s.stuk) return
    const rot = (s.stuk.rot + 1) % 4
    for (const [dx, dy] of STAMPE) {
      const p = { ...s.stuk, rot, x: s.stuk.x + dx, y: s.stuk.y + dy }
      if (!bots(s.bord, p)) { s.stuk = p; merkVuil(); teken(); return }
    }
  }, [teken])

  const sagVal = useCallback(() => {
    const s = spel.current
    if (!s.loop || !s.stuk) return
    const p = { ...s.stuk, y: s.stuk.y + 1 }
    if (!bots(s.bord, p)) { s.stuk = p; s.telling += 1; setTelling(s.telling); s.val = 0; teken() }
    else vasmaak()
  }, [teken, vasmaak])

  const hardVal = useCallback(() => {
    const s = spel.current
    if (!s.loop || !s.stuk) return
    let n = 0
    while (!bots(s.bord, { ...s.stuk, y: s.stuk.y + 1 })) { s.stuk.y++; n++ }
    s.telling += n * 2
    setTelling(s.telling)
    merkVuil()
    vasmaak()
    teken()
  }, [teken, vasmaak])

  /* ── Spel-lus ── */
  useEffect(() => {
    if (toestand !== 'speel') return
    const s = spel.current
    s.loop = true
    s.laas = performance.now()
    let id

    function raam(nou) {
      if (!s.loop) return
      const dt = nou - s.laas
      s.laas = nou
      s.val += dt
      s.speelMs += dt

      // oorleef-doelwit tel saam met werklike speeltyd
      const st = stadiumBy(s.stadium)
      if (st.doel.tipe === 'oorleef') {
        s.sTyd += dt / 1000
        const v = Math.min(1, s.sTyd / st.doel.waarde)
        if (Math.abs(v - vorderRef.current) > 0.01) { vorderRef.current = v; setVorder(v) }
        if (v >= 1) { voltooiStadium(); return }
      }

      // weer
      if (st.nr >= REEN_VANAF) {
        const w = s.weer
        if (w.druppels.length < 34) w.druppels.push({ x: Math.random(), y: Math.random(), s: 0.5 + Math.random() * 0.7 })
        w.druppels.forEach(d => { d.y += (dt / 1000) * d.s; if (d.y > 1) { d.y = -0.05; d.x = Math.random() } })
      }
      if (st.nr >= WATER_VANAF) {
        s.weer.water = Math.min(1, s.weer.water + dt / 45000)
      }
      const tempo = valTempo(s.stadium)
      while (s.val >= tempo) {
        s.val -= tempo
        if (!s.stuk) break
        const p = { ...s.stuk, y: s.stuk.y + 1 }
        if (!bots(s.bord, p)) { s.stuk = p; vuil.current = true }
        else { vuil.current = true; vasmaak(); break }
      }
      // weer beweeg aanhoudend; andersins net wanneer iets verander het
      if (vuil.current || stadiumBy(s.stadium).nr >= REEN_VANAF) teken()
      id = requestAnimationFrame(raam)
    }
    id = requestAnimationFrame(raam)
    return () => { s.loop = false; cancelAnimationFrame(id) }
  }, [toestand, rondte, teken, vasmaak, voltooiStadium])

  /* ── Sleutelbord (vir toetsing op 'n rekenaar) ── */
  useEffect(() => {
    if (toestand !== 'speel') return
    function op(e) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); skuif(-1) }
      if (e.key === 'ArrowRight') { e.preventDefault(); skuif(1) }
      if (e.key === 'ArrowUp')    { e.preventDefault(); draai() }
      if (e.key === 'ArrowDown')  { e.preventDefault(); sagVal() }
      if (e.key === ' ')          { e.preventDefault(); hardVal() }
      if (e.key === 'Escape')     { e.preventDefault(); pouseer() }
    }
    window.addEventListener('keydown', op)
    return () => window.removeEventListener('keydown', op)
  }, [toestand, skuif, draai, sagVal, hardVal])

  /* ── Swiep ── */
  const raak = useRef(null)
  function raakBegin(e) {
    const t = e.touches[0]
    raak.current = { x: t.clientX, y: t.clientY, t: Date.now(), skuif: 0, beweeg: false }
  }
  function raakBeweeg(e) {
    const r = raak.current
    if (!r || toestand !== 'speel') return
    const t = e.touches[0]
    const dx = t.clientX - r.x, dy = t.clientY - r.y
    const stap = 26
    if (Math.abs(dx) > Math.abs(dy)) {
      const n = Math.trunc(dx / stap) - r.skuif
      if (n !== 0) { for (let i = 0; i < Math.abs(n); i++) skuif(Math.sign(n)); r.skuif += n; r.beweeg = true }
    } else if (dy > stap * 1.6) {
      sagVal()
      r.y = t.clientY
      r.beweeg = true
    }
  }
  function raakEinde(e) {
    const r = raak.current
    raak.current = null
    if (!r || toestand !== 'speel') return
    const t = e.changedTouches[0]
    const dx = t.clientX - r.x, dy = t.clientY - r.y
    const vinnig = Date.now() - r.t < 260
    if (!r.beweeg && Math.abs(dx) < 14 && Math.abs(dy) < 14) { draai(); return }
    if (vinnig && dy < -52 && Math.abs(dx) < 44) hardVal()
  }

  /* ── Stoor en hervat ── */
  const stoorSpel = useCallback(() => {
    const s = spel.current
    if (!s.stuk) return
    try {
      localStorage.setItem(STOOR, JSON.stringify({
        bord: s.bord, stuk: s.stuk, sak: s.sak, volgende: s.volgende,
        telling: s.telling, lyne: s.lyne,
        stukke: s.stukke, speelMs: Math.round(s.speelMs),
        stadium: s.stadium, sLyne: s.sLyne, sPunte: s.sPunte,
        sBesteMulti: s.sBesteMulti, sKombo: s.sKombo, sTyd: s.sTyd,
      }))
      setBewaar({ telling: s.telling, lyne: s.lyne, stadium: s.stadium })
    } catch {}
  }, [])

  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(STOOR) || 'null')
      if (d) {
        setBewaar({ telling: d.telling || 0, lyne: d.lyne || 0, stadium: d.stadium || 1 })
        stoorVerste(d.stadium || 1)   // vir spelers wat reeds ver was
        // Sodat die "Volgende"-blokkie in die menu nie leeg staan nie
        if (d.volgende && STUKKE[d.volgende]) setVolgende(d.volgende)
      }
    } catch {}
  }, [])

  // Stoor ook as die blaaier of tabblad weggaan
  useEffect(() => {
    // Stoor sodra daar 'n spel is om te stoor — nie net wanneer die lus loop
    // nie. Terwyl die stadium-klaar kaart wys, staan die lus stil; as jy dan
    // die app toemaak sou niks gestoor het nie en jy sou daardie hele stadium
    // verloor het.
    function weg() {
      const s = spel.current
      if (!s.stuk) return
      stoorSpel()
      if (s.loop) setToestand('pouse')
    }
    // Android maak die app dood sonder om altyd pagehide te vuur, dus is
    // visibilitychange die betroubare een. Dit moet 'n benoemde funksie wees,
    // anders kan die opruiming dit nie verwyder nie en stapel dit op.
    function versteek() { if (document.hidden) weg() }
    document.addEventListener('visibilitychange', versteek)
    window.addEventListener('pagehide', weg)
    return () => {
      document.removeEventListener('visibilitychange', versteek)
      window.removeEventListener('pagehide', weg)
    }
  }, [stoorSpel])

  function begin() {
    const s = spel.current
    s.bord = leegBord(); s.sak = nuweSak(); s.volgende = null
    const beginBy = beginStadium()
    s.telling = 0; s.lyne = 0; s.val = 0
    s.stukke = 0; s.speelMs = 0
    s.stadium = beginBy; s.sLyne = 0; s.sPunte = 0; s.sBesteMulti = 0
    s.sKombo = 0; s.sTyd = 0
    s.weer = { druppels: [], water: 0 }
    vorderRef.current = 0
    setTelling(0); setLyne(0); setStadiumNr(beginBy); setVorder(0); setKlaar(null)
    try { localStorage.removeItem(STOOR) } catch {}
    setBewaar(null)
    // Gooi die vorige spel se stuk weg en sit dadelik 'n nuwe een neer.
    // Voorheen het 'n setTimeout dit gedoen, en tussenin kon die lus 'n raam
    // of twee met die ou spel se stuk teken.
    s.stuk = null
    plaasNuwe()
    vuil.current = true      // anders bly die vorige spel se prent staan
    setToestand('speel')
    setRondte(r => r + 1)
  }

  function hervat() {
    try {
      const d = JSON.parse(localStorage.getItem(STOOR) || 'null')
      if (!d) { begin(); return }
      const s = spel.current
      s.bord = d.bord; s.stuk = d.stuk; s.sak = d.sak || nuweSak()
      s.volgende = d.volgende
      s.telling = d.telling; s.lyne = d.lyne; s.val = 0
      s.stukke = d.stukke || 0; s.speelMs = d.speelMs || 0
      s.stadium = d.stadium || 1
      stoorVerste(s.stadium)
      s.sLyne = d.sLyne || 0; s.sPunte = d.sPunte || 0
      s.sBesteMulti = d.sBesteMulti || 0; s.sKombo = d.sKombo || 0
      s.sTyd = d.sTyd || 0
      s.weer = { druppels: [], water: 0 }

      // As die doelwit reeds behaal is, was die stadium klaar toe die spel
      // gestoor is — die dier is destyds toegeken. Skuif dadelik aan, anders
      // sit jy in 'n stadium wat klaar is en moet jy nog 'n lyn maak voordat
      // dieselfde kaart weer wys.
      if (doelVordering(s) >= 1) {
        s.stadium += 1
        stoorVerste(s.stadium)
        s.sLyne = 0; s.sPunte = 0; s.sBesteMulti = 0; s.sKombo = 0; s.sTyd = 0
      }

      const v = doelVordering(s)
      vorderRef.current = v
      setTelling(d.telling); setLyne(d.lyne); setVolgende(d.volgende)
      setStadiumNr(s.stadium); setVorder(v); setKlaar(null)
      vuil.current = true      // die herstelde bord moet dadelik teken
      setToestand('speel')
      setRondte(r => r + 1)
    } catch { begin() }
  }

  /* ── Ranglys laai ──
     Wys eers die kas sodat daar dadelik iets is, en merk dit as oud. Die
     vars antwoord vervang dit sodra dit kom. */
  const laaiRanglys = useCallback(async () => {
    const k = kasLys()
    if (k) { setRanglys({ lys: k.lys, totaal: k.totaal }); setRanglysOud(k.tyd) }
    setRanglysLaai(true)
    setRanglysFout(null)
    const uit = await haalRanglys()
    setRanglysLaai(false)
    if (uit.ok) {
      setRanglys({ lys: uit.lys, totaal: uit.totaal })
      setRanglysOud(null)
      setRanglysFout(null)
    } else {
      setRanglysFout({ boodskap: uit.fout, rede: uit.rede })
      // Ons hou die kas op die skerm, maar dit bly as oud gemerk.
    }
  }, [])

  // Wanneer die spel oopmaak: stuur enige punte wat vasgehaak het, en haal
  // die lys sodat die voorlopige rang iets het om teen te meet.
  useEffect(() => {
    let leef = true
    ;(async () => {
      try { await stuurWagry() } catch {}
      if (!leef) return
      const uit = await haalRanglys()
      if (!leef) return
      if (uit.ok) { setRanglys({ lys: uit.lys, totaal: uit.totaal }); setRanglysOud(null) }
    })()
    return () => { leef = false }
  }, [])

  const stuurLopie = useCallback(async (metNaam) => {
    const s = spel.current
    const lopie = {
      punte:   Math.max(0, Math.round(s.telling)),
      stadium: Math.max(1, s.stadium),
      lyne:    Math.max(0, Math.round(s.lyne)),
      stukke:  Math.max(0, Math.round(s.stukke)),
      speelMs: Math.max(0, Math.round(s.speelMs)),
    }
    setStuur({ besig: true })
    const uit = await stuurPunt(metNaam, lopie)
    if (uit.ok) {
      setStuur({ besig: false, rang: uit.rang, totaal: uit.totaal, beterAs: uit.beterAs })
      if (uit.lys) { setRanglys({ lys: uit.lys, totaal: uit.totaal }); setRanglysOud(null) }
    } else {
      setStuur({ besig: false, fout: uit.fout, rede: uit.rede, herprobeer: uit.herprobeer })
    }
  }, [])

  /* Wanneer word 'n lopie ingestuur?
     By ELKE voltooide stadium, en weer wanneer die ark volraak.

     Voorheen was dit net by die einde, en dit was verkeerd: 'n speler wat
     goed speel en sy spel aan die gang hou, sou nooit op die ranglys kom
     nie. Jy moes eers verloor. Nou tel jou vordering soos jy dit maak, en
     die stadium-klaar kaart is ook 'n beter oomblik om na 'n naam te vra as
     die skerm wat se jy is dood. */
  useEffect(() => {
    if (!klaar || !naam) return
    stuurLopie(naam)
  }, [klaar, naam, stuurLopie])

  useEffect(() => {
    if (toestand !== 'verloor') return
    if (!naam) return
    stuurLopie(naam)
  }, [toestand, naam, stuurLopie])

  function bevestigNaam() {
    const fout = keurNaam(naamInvoer)
    if (fout) { setNaamFout(fout); return }
    const skoon = naamInvoer.trim().replace(/\s+/g, ' ')
    stoorNaam(skoon)
    setNaam(skoon)
    setAfgewys(false)
    setNaamFout(null)
    setNaamInvoer('')
  }

  /* Een naamblok wat op meer as een plek gebruik word. Die vraag verskil,
     want die oomblik verskil: by 'n gewende dier is dit 'n beloning, by 'n
     vol ark is dit 'n laaste kans. */
  function naamBlok(vraag) {
    return (
      <div className="ark-naamvra">
        <p>{vraag}</p>
        <input
          className="ark-invoer"
          value={naamInvoer}
          onChange={e => { setNaamInvoer(e.target.value); setNaamFout(null) }}
          placeholder="Jou naam"
          maxLength={20}
          aria-label="Jou naam vir die ranglys"
        />
        {naamFout && <span className="ark-fout">{naamFout}</span>}
        <button className="ark-knop ark-knop-primer" onClick={bevestigNaam}>Sit my op die lys</button>
        <button className="ark-knop ark-knop-spook" onClick={() => { wysNaamAf(); setAfgewys(true) }}>
          Nie nou nie
        </button>
        <p className="ark-fyndruk">Jou naam is al wat ons wys. Jy hoef nie jou regte naam te gebruik nie.</p>
      </div>
    )
  }

  function pouseer() { stoorSpel(); setToestand('pouse') }

  function verlaat() {
    if (spel.current.stuk && toestand !== 'verloor') stoorSpel()
    onClose()
  }

  function klank() { const m = toggleMute(); setStil(m) }

  const volgendeVorm = volgende ? STUKKE[volgende].vorms[0] : null
  const stad = stadiumBy(stadiumNr)
  // In die menu wys die telbord die gestoorde spel, sodat dit nie lyk of
  // alles verlore is nie. Elders wys dit die lopende spel.
  const wysTel = (toestand === 'menu' && bewaar) ? bewaar : { telling, lyne, stadium: stadiumNr }
  // Waar 'n splinternuwe spel sal begin. Net wanneer die menu wys, anders
  // lees ons localStorage by elke raam van die spel.
  const nuweBy = useMemo(
    () => (toestand === 'menu' ? beginStadium() : 1),
    [toestand, bewaar]
  )

  /* Waar sou hierdie lopie NOU op die lys val? Dit is 'n skatting uit die
     lys wat ons gehaal het toe die spel oopgemaak het, dus noem ons dit
     voorlopig. Val die speler buite die stuk lys wat ons het, sê ons niks —
     'n raaiskoot wat soos 'n feit lyk, is erger as stilte. */
  const voorlopig = useMemo(() => {
    if (!ranglys || !ranglys.lys.length) return null
    const beter = ranglys.lys.filter(
      e => e.stadium > stadiumNr || (e.stadium === stadiumNr && e.punte > telling)
    ).length
    const buiteLys = beter >= ranglys.lys.length && ranglys.totaal > ranglys.lys.length
    if (buiteLys) return null
    // Jy staan nog nie op die lys nie, dus tel jy by die noemer. Sonder dit
    // kry 'n mens onsin soos "#5 van 4".
    const rang = beter + 1
    return { rang, uit: Math.max(ranglys.totaal || ranglys.lys.length, rang) }
  }, [ranglys, stadiumNr, telling])
  const ALLE_DIERE = ['duif','skaap','bok','olifant','kameel','perd','leeu','sebra','giraf','beer','haas','vos']

  return (
    <div className="ark-overlay">

      {/* ── Le die foon plat ──
          Word deur CSS gewys en versteek die res. Die bord is 10 breed en
          20 hoog; in landskap bly daar so min hoogte oor dat dit onspeelbaar
          word. Ons se dit eerder reguit. */}
      <div className="ark-draai">
        <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="7" y="2" width="10" height="20" rx="2"/>
          <path d="M12 18h.01"/>
        </svg>
        <h2>Draai jou foon regop</h2>
        <p>Die ark word van onder af gebou, dus het die bord hoogte nodig.</p>
      </div>

      {/* ── Kop ── */}
      <div className="ark-kop">
        <button className="ark-ikoon" onClick={verlaat} aria-label="Terug">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="ark-titel">Bou die Ark</span>
        <button className="ark-ikoon" onClick={klank} aria-label={stil ? 'Klank aan' : 'Klank af'}>
          {stil ? (
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H2v6h4l5 4z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>
            </svg>
          )}
        </button>
        {/* Nie terwyl die stadium-klaar kaart wys nie: pouse en dan "speel
            verder" sou die lus agter die kaart aan die gang sit. */}
        {toestand === 'speel' && !klaar && (
          <button className="ark-ikoon" onClick={pouseer} aria-label="Pouse">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="9" y1="5" x2="9" y2="19"/><line x1="15" y1="5" x2="15" y2="19"/>
            </svg>
          </button>
        )}
      </div>

      {/* ── Telbord ── */}
      {/* By die menu wys ons die gestoorde spel se syfers, nie nulle nie. */}
      <div className="ark-tel">
        <div className="ark-tel-item"><span>Punte</span><b>{wysTel.telling.toLocaleString('af')}</b></div>
        <div className="ark-tel-item"><span>Stadium</span><b>{wysTel.stadium}</b></div>
        <div className="ark-tel-item"><span>Lyne</span><b>{wysTel.lyne}</b></div>
        <div className="ark-volgende">
          <span>Volgende</span>
          <div className="ark-volgende-blok">
            {volgendeVorm && volgendeVorm.map(([x, y], i) => (
              <i key={i} style={{
                left: x * 11, top: y * 11,
                background: STUKKE[volgende].kleur,
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Stadium ── */}
      {toestand === 'speel' && (
        <div className="ark-stadium">
          <ArkBou vordering={vorder} />
          <div className="ark-stadium-info">
            <span className="ark-stadium-nr">Stadium {stadiumNr}</span>
            <span className="ark-stadium-naam">{stad.naam}</span>
            <span className="ark-stadium-doel">{doelTeks(stad.doel)}</span>
            <div className="ark-balk"><i style={{ width: `${Math.round(vorder * 100)}%` }} /></div>
            {voorlopig && (
              <span className="ark-voorlopig">
                Voorlopig #{voorlopig.rang} van {voorlopig.uit}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Bord ── */}
      <div
        className="ark-doek-wrap"
        ref={wrapRef}
        onTouchStart={raakBegin}
        onTouchMove={raakBeweeg}
        onTouchEnd={raakEinde}
      >
        <canvas ref={doekRef} className="ark-doek" />

        {toestand === 'menu' && (
          <div className="ark-blad">
            <h2 className="ark-blad-titel">Bou die Ark</h2>
            <p className="ark-blad-teks">
              Laat die planke sak en pak hulle netjies. Elke volle ry bou 'n stuk van die ark.
            </p>
            {bewaar && (
              <button className="ark-knop ark-knop-primer" onClick={hervat}>
                Gaan voort
                <small>Stadium {bewaar.stadium} · {bewaar.telling.toLocaleString('af')} punte</small>
              </button>
            )}
            <button className={`ark-knop ${bewaar ? 'ark-knop-spook' : 'ark-knop-primer'}`} onClick={begin}>
              {bewaar ? 'Nuwe spel' : 'Begin speel'}
              {nuweBy > 1 && <small>Begin by stadium {nuweBy}</small>}
            </button>
            <button className="ark-knop ark-knop-spook" onClick={() => setWysDiere(true)}>
              My diere ({diere.length} van {ALLE_DIERE.length})
            </button>
            <button className="ark-knop ark-knop-spook" onClick={() => { setWysRanglys(true); laaiRanglys() }}>
              Wêreldwye ranglys
            </button>
            <p className="ark-weergawe">weergawe {__BOU__}</p>
          </div>
        )}

        {toestand === 'pouse' && (
          <div className="ark-blad">
            <h2 className="ark-blad-titel">Gepouseer</h2>
            <p className="ark-blad-teks">Jou spel is gestoor. Jy kan later verder speel.</p>
            <button className="ark-knop ark-knop-primer" onClick={() => setToestand('speel')}>Speel verder</button>
            <button className="ark-knop ark-knop-spook" onClick={begin}>Begin van voor af</button>
            <button className="ark-knop ark-knop-spook" onClick={verlaat}>Verlaat</button>
          </div>
        )}

        {toestand === 'verloor' && (
          <div className="ark-blad">
            <h2 className="ark-blad-titel">Die ark is vol</h2>
            <div className="ark-uitslag">
              <div><span>Punte</span><b>{telling.toLocaleString('af')}</b></div>
              <div><span>Lyne</span><b>{lyne}</b></div>
              <div><span>Stadium</span><b>{stadiumNr}</b></div>
            </div>

            {/* Sonder 'n naam stuur ons niks in nie — die naam kom op 'n
                openbare lys, dus moet die speler dit self kies. */}
            {!naam && !afgewys && naamBlok('Wil jy op die wêreldwye ranglys wees? Kies \'n naam.')}

            {naam && stuur?.besig && <p className="ark-blad-teks">Besig om jou punt in te stuur…</p>}

            {naam && stuur && !stuur.besig && stuur.rang && (
              <p className="ark-rang-uitslag">
                {stuur.beterAs ? 'Jou beste tot nou toe.' : 'Jou beste bly staan.'}<br />
                <b>#{stuur.rang}</b> van {stuur.totaal} spelers wêreldwyd
              </p>
            )}

            {naam && stuur && !stuur.besig && stuur.fout && (
              <div className="ark-fout-blok">
                <span className="ark-fout">{stuur.fout}</span>
                {stuur.rede && <p className="ark-fyndruk">({stuur.rede})</p>}
                <button className="ark-knop ark-knop-spook" onClick={() => stuurLopie(naam)}>Probeer weer</button>
              </div>
            )}

            <button className="ark-knop ark-knop-primer" onClick={begin}>Speel weer</button>
            <button className="ark-knop ark-knop-spook" onClick={() => { setWysRanglys(true); laaiRanglys() }}>
              Wêreldwye ranglys
            </button>
            <button className="ark-knop ark-knop-spook" onClick={onClose}>Klaar</button>
          </div>
        )}
      </div>

      {/* ── Stadium voltooi ── */}
      {klaar && (
        <div className="ark-blad ark-blad-vol">
          <span className="ark-klaar-merk">Stadium {klaar.nr} voltooi</span>
          <h2 className="ark-blad-titel">{klaar.naam}</h2>

          <div className="ark-nuwe-dier">
            <Dier id={klaar.dier} grootte={104} paar />
            <span>
              {klaar.reeds
                ? `${dierNaam(klaar.dier)} — reeds aan boord`
                : `${dierNaam(klaar.dier)} — 'n paar aan boord`}
            </span>
          </div>

          <blockquote className="ark-vers">
            {klaar.vers}
            <cite>{klaar.ref}</cite>
          </blockquote>

          {!naam && !afgewys && naamBlok('Wil jy met jou diere op die wêreldwye ranglys wees?')}

          {naam && stuur && !stuur.besig && stuur.rang && (
            <p className="ark-kennis">Jy staan nou #{stuur.rang} van {stuur.totaal} wêreldwyd.</p>
          )}

          <button className="ark-knop ark-knop-primer" onClick={volgendeStadium}>Gaan voort</button>
          <button className="ark-knop ark-knop-spook" onClick={() => { stoorSpel(); setKlaar(null); setToestand('pouse') }}>
            Hou hier op
          </button>
        </div>
      )}

      {/* ── Versameling ── */}
      {wysDiere && (
        <div className="ark-blad ark-blad-vol">
          <h2 className="ark-blad-titel">My diere</h2>
          <p className="ark-blad-teks">Elke voltooide stadium bring 'n paar aan boord.</p>
          <div className="ark-diere-rooster">
            {ALLE_DIERE.map(id => {
              const het = diere.includes(id)
              return (
                <div key={id} className={`ark-dier-blok${het ? '' : ' dof'}`}>
                  <Dier id={id} grootte={56} paar dof={!het} />
                  <span>{het ? dierNaam(id) : '—'}</span>
                </div>
              )
            })}
          </div>
          <button className="ark-knop ark-knop-primer" onClick={() => setWysDiere(false)}>Terug</button>
        </div>
      )}

      {/* ── Wêreldwye ranglys ──
          Drie toestande wat ons uitmekaar hou, want hulle beteken nie
          dieselfde nie: 'n lys wat ons gehaal het, 'n lys wat ons nie kon
          haal nie, en 'n lys waarop nog niemand is nie. */}
      {wysRanglys && (
        <div className="ark-blad ark-blad-vol">
          <h2 className="ark-blad-titel">Wêreldwye ranglys</h2>
          <p className="ark-blad-teks">
            Gerangskik op hoe ver die ark gebou is, dan op punte.
          </p>

          {ranglysOud && ranglys && (
            <p className="ark-kennis">
              Dit is wat ons laas gesien het{ranglysLaai ? ' — besig om op te dateer' : ''}.
            </p>
          )}
          {ranglysLaai && !ranglys && <p className="ark-blad-teks">Besig om te laai…</p>}

          {ranglysFout && (
            <div className="ark-fout-blok">
              <span className="ark-fout">{ranglysFout.boodskap}</span>
              {ranglysFout.rede && <p className="ark-fyndruk">({ranglysFout.rede})</p>}
              <button className="ark-knop ark-knop-spook" onClick={laaiRanglys}>Probeer weer</button>
            </div>
          )}

          {ranglys && ranglys.lys.length > 0 && (
            <ol className="ark-ranglys">
              {ranglys.lys.map((e, i) => (
                <li key={e.uid} className={e.naam === naam ? 'ek' : undefined}>
                  <span className="ark-rang-nr">{i + 1}</span>
                  <span className="ark-rang-naam">{e.naam}</span>
                  <span className="ark-rang-syfers">
                    <b>Stadium {e.stadium}</b>
                    <i>{(e.punte || 0).toLocaleString('af')} punte</i>
                  </span>
                </li>
              ))}
            </ol>
          )}

          {ranglys && ranglys.lys.length === 0 && !ranglysFout && (
            <p className="ark-blad-teks">Nog niemand op die lys nie. Jy kan die eerste wees.</p>
          )}

          {ranglys && ranglys.totaal > ranglys.lys.length && (
            <p className="ark-fyndruk">Boonste {ranglys.lys.length} van {ranglys.totaal} spelers.</p>
          )}

          {/* Hier vra ons altyd, ook as die speler vroeer "nie nou nie" gese
              het — hy het self hierheen gekom, dus is dit nie neul nie. */}
          {!naam && naamBlok('Jy is nog nie op die lys nie. Kies \'n naam.')}

          <button className="ark-knop ark-knop-primer" onClick={() => setWysRanglys(false)}>Terug</button>
        </div>
      )}

      {/* ── Kontroles ── */}
      {toestand === 'speel' && (
        <div className="ark-beheer" ref={beheerRef}>
          <button className="ark-beheer-knop" onClick={() => skuif(-1)} aria-label="Links">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button className="ark-beheer-knop" onClick={draai} aria-label="Draai">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </button>
          <button className="ark-beheer-knop" onClick={sagVal} aria-label="Sak">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
            </svg>
          </button>
          <button className="ark-beheer-knop ark-beheer-val" onClick={hardVal} aria-label="Laat val">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="19 9 12 16 5 9"/><line x1="5" y1="19" x2="19" y2="19"/>
            </svg>
          </button>
          <button className="ark-beheer-knop" onClick={() => skuif(1)} aria-label="Regs">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
