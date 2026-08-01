import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { playCollect, playHit, playLevelComplete, toggleMute, isMuted } from '../utils/sound'
import { stadiumBy, doelTeks, WOLKE_VANAF, REEN_VANAF, WATER_VANAF } from '../data/arkStadiums'
import { Dier, dierNaam } from '../data/arkDiere'
import ArkBou from '../components/ArkBou'
import './BouDieArk.css'

/* ────────────────────────────────────────────────────────────
   Bou die Ark — Fase 1 en 2
   Kern-meganika, stadiums met doelwitte, die ark wat opbou,
   dierepare, versameling en weer.
   Die ranglys kom in Fase 3.
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
const LYNE_PER_VLAK = 10

function valTempo(vlak) {
  return Math.max(MIN_MS, BEGIN_MS - (vlak - 1) * STAP_MS)
}

const PUNTE = { 1: 100, 2: 300, 3: 500, 4: 800 }

const STOOR   = 'ark_stoor'
const VERSAMEL = 'ark_diere'

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

export default function BouDieArk({ onClose }) {
  const [toestand, setToestand] = useState('menu')  // menu · speel · pouse · verloor
  const [telling, setTelling]   = useState(0)
  const [lyne, setLyne]         = useState(0)
  const [vlak, setVlak]         = useState(1)
  const [volgende, setVolgende] = useState(null)
  const [stil, setStil]         = useState(isMuted())
  const [hetStoor, setHetStoor] = useState(false)
  const [stadiumNr, setStadiumNr] = useState(1)
  const [vorder, setVorder]     = useState(0)      // 0..1 na die doelwit toe
  const [klaar, setKlaar]       = useState(null)   // stadium-klaar oorlegblad
  const [diere, setDiere]       = useState(() => leesDiere())
  const [wysDiere, setWysDiere] = useState(false)

  // Terwyl die spel oop is, kry die bladsy self die spel se donker kleur.
  // Chrome se adresbalk gly in en uit en verander die sigbare hoogte; sonder
  // dit sou die app in daardie oomblik deurwys.
  useEffect(() => {
    const b = document.body, h = document.documentElement
    const bBg = b.style.background, hBg = h.style.background, bOv = b.style.overflow
    b.style.background = '#100D17'
    h.style.background = '#100D17'
    b.style.overflow = 'hidden'
    return () => {
      b.style.background = bBg
      h.style.background = hBg
      b.style.overflow = bOv
    }
  }, [])

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
    telling: 0, lyne: 0, vlak: 1,
    val: 0, laas: 0,
    loop: false,
    // stadium
    stadium: 1,
    sLyne: 0, sPunte: 0, sBesteMulti: 0, sKombo: 0, sBegin: 0, sTyd: 0,
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

  const voltooiStadium = useCallback(() => {
    const s = spel.current
    const st = stadiumBy(s.stadium)
    s.loop = false
    stoorDier(st.dier)
    setDiere(leesDiere())
    setKlaar(st)
    playLevelComplete()
  }, [])

  function volgendeStadium() {
    const s = spel.current
    s.stadium += 1
    s.sLyne = 0; s.sPunte = 0; s.sBesteMulti = 0; s.sKombo = 0
    s.sTyd = 0; s.sBegin = performance.now()
    s.weer.druppels = []; s.weer.water = 0
    setStadiumNr(s.stadium)
    setVorder(0)
    setKlaar(null)
    setToestand('speel')
  }

  /* ── Teken ── */
  // Merk dat daar iets nuuts is om te teken. Sonder dit herteken die lus
  // 60 keer per sekonde al staan alles stil, wat op swakker toestelle
  // flikker en strepe veroorsaak.
  const vuil = useRef(true)
  const merkVuil = useCallback(() => { vuil.current = true }, [])

  const teken = useCallback(() => {
    const doek = doekRef.current
    if (!doek) return
    vuil.current = false
    const ctx = doek.getContext('2d')
    const s   = spel.current
    const bg  = doek.width / KOL

    ctx.clearRect(0, 0, doek.width, doek.height)

    // agtergrond word donkerder soos die storm nader kom
    const st = stadiumBy(s.stadium)
    ctx.fillStyle = st.nr >= WOLKE_VANAF ? '#141020' : '#1B1626'
    ctx.fillRect(0, 0, doek.width, doek.height)

    if (st.nr >= WOLKE_VANAF) {
      // wolkbanke bo-aan
      ctx.fillStyle = 'rgba(120,110,150,0.10)'
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.ellipse(doek.width * (0.2 + i * 0.3), doek.height * 0.05,
                    doek.width * 0.3, doek.height * 0.035, 0, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.045)'
    ctx.lineWidth = 1
    for (let x = 1; x < KOL; x++) {
      ctx.beginPath(); ctx.moveTo(x * bg, 0); ctx.lineTo(x * bg, doek.height); ctx.stroke()
    }
    for (let y = 1; y < RY; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * bg); ctx.lineTo(doek.width, y * bg); ctx.stroke()
    }

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
  }, [])

  /* ── Grootte pas by die skerm ── */
  useEffect(() => {
    function pas() {
      const doek = doekRef.current, wrap = wrapRef.current
      if (!doek || !wrap) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      // Moenie op die flex-ketting staatmaak nie. As die houer se hoogte om
      // enige rede nog nul is, sou min() dit ignoreer en die bord uit die
      // skerm uit groei. Meet eerder die skerm self en trek die res af.
      const skerm  = window.innerHeight || document.documentElement.clientHeight
      const bo     = wrap.getBoundingClientRect().top
      const onder  = beheerRef.current ? beheerRef.current.offsetHeight : 0
      const beskik = Math.max(120, skerm - bo - onder - 12)

      const hoogte = wrap.clientHeight > 40 ? Math.min(wrap.clientHeight, beskik) : beskik
      const breed  = wrap.clientWidth > 40 ? wrap.clientWidth : (window.innerWidth - 28)

      const bg = Math.max(8, Math.floor(Math.min(breed / KOL, hoogte / RY)))
      const w = bg * KOL, h = bg * RY
      const nw = w * dpr, nh = h * dpr

      // Kritiek: canvas.width skryf maak die doek skoon en verander die
      // uitleg. Doen dit net wanneer die grootte werklik anders is, anders
      // vuur die uitleg-verandering hierdie funksie weer af en spring die
      // bord heen en weer tussen twee groottes.
      if (doek.width === nw && doek.height === nh) return
      // CSS-grootte bly w×h; die agtergrond is dpr keer groter vir skerp lyne.
      // teken() werk in toestel-pixels, dus bly die transform identiteit.
      doek.style.width  = w + 'px'
      doek.style.height = h + 'px'
      doek.width  = nw
      doek.height = nh
      vuil.current = true
      teken()
    }
    pas()
    // Chrome se adresbalk en die uitleg gaan eers ná 'n raam of twee sit.
    const t1 = setTimeout(pas, 60)
    const t2 = setTimeout(pas, 300)
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
      setHetStoor(false)
      setToestand('verloor')
      playHit()
      return false
    }
    return true
  }, [])

  /* ── Vasmaak en lyne skoonmaak ── */
  const vasmaak = useCallback(() => {
    const s = spel.current
    selle(s.stuk).forEach(([x, y]) => { if (y >= 0) s.bord[y][x] = STUKKE[s.stuk.tipe].kleur })
    vuil.current = true

    const oor = s.bord.filter(ry => ry.some(c => c === null))
    const skoon = RY - oor.length
    if (skoon > 0) {
      while (oor.length < RY) oor.unshift(Array(KOL).fill(null))
      s.bord = oor
      const wins = (PUNTE[skoon] || 0) * s.vlak
      s.lyne += skoon
      s.telling += wins
      s.sLyne += skoon
      s.sPunte += wins
      s.sBesteMulti = Math.max(s.sBesteMulti, skoon)
      s.sKombo += 1
      const nuweVlak = Math.floor(s.lyne / LYNE_PER_VLAK) + 1
      if (nuweVlak > s.vlak) s.vlak = nuweVlak
      playCollect(Math.min(skoon - 1, 3), Math.max(skoon, s.sKombo))
      setLyne(s.lyne); setVlak(s.vlak)
    } else {
      s.sKombo = 0          // kombo breek wanneer 'n stuk geen ry maak nie
      playHit()
    }
    setTelling(s.telling)

    const v = doelVordering(s)
    setVorder(v)
    if (v >= 1) { voltooiStadium(); return }

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
      const tempo = valTempo(s.vlak)
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
  }, [toestand, teken, vasmaak, voltooiStadium])

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
        telling: s.telling, lyne: s.lyne, vlak: s.vlak,
        stadium: s.stadium, sLyne: s.sLyne, sPunte: s.sPunte,
        sBesteMulti: s.sBesteMulti, sKombo: s.sKombo, sTyd: s.sTyd,
      }))
      setHetStoor(true)
    } catch {}
  }, [])

  useEffect(() => {
    try { setHetStoor(!!localStorage.getItem(STOOR)) } catch {}
  }, [])

  // Stoor ook as die blaaier of tabblad weggaan
  useEffect(() => {
    function weg() { if (spel.current.loop) { stoorSpel(); setToestand('pouse') } }
    document.addEventListener('visibilitychange', () => { if (document.hidden) weg() })
    window.addEventListener('pagehide', weg)
    return () => window.removeEventListener('pagehide', weg)
  }, [stoorSpel])

  function begin() {
    const s = spel.current
    s.bord = leegBord(); s.sak = nuweSak(); s.volgende = null
    s.telling = 0; s.lyne = 0; s.vlak = 1; s.val = 0
    s.stadium = 1; s.sLyne = 0; s.sPunte = 0; s.sBesteMulti = 0
    s.sKombo = 0; s.sTyd = 0; s.sBegin = performance.now()
    s.weer = { druppels: [], water: 0 }
    vorderRef.current = 0
    setTelling(0); setLyne(0); setVlak(1); setStadiumNr(1); setVorder(0); setKlaar(null)
    try { localStorage.removeItem(STOOR) } catch {}
    setHetStoor(false)
    setToestand('speel')
    setTimeout(() => plaasNuwe(), 0)
  }

  function hervat() {
    try {
      const d = JSON.parse(localStorage.getItem(STOOR) || 'null')
      if (!d) { begin(); return }
      const s = spel.current
      s.bord = d.bord; s.stuk = d.stuk; s.sak = d.sak || nuweSak()
      s.volgende = d.volgende
      s.telling = d.telling; s.lyne = d.lyne; s.vlak = d.vlak; s.val = 0
      s.stadium = d.stadium || 1
      s.sLyne = d.sLyne || 0; s.sPunte = d.sPunte || 0
      s.sBesteMulti = d.sBesteMulti || 0; s.sKombo = d.sKombo || 0
      s.sTyd = d.sTyd || 0; s.sBegin = performance.now()
      s.weer = { druppels: [], water: 0 }
      const v = doelVordering(s)
      vorderRef.current = v
      setTelling(d.telling); setLyne(d.lyne); setVlak(d.vlak); setVolgende(d.volgende)
      setStadiumNr(s.stadium); setVorder(v); setKlaar(null)
      setToestand('speel')
    } catch { begin() }
  }

  function pouseer() { stoorSpel(); setToestand('pouse') }

  function verlaat() {
    if (spel.current.stuk && toestand !== 'verloor') stoorSpel()
    onClose()
  }

  function klank() { const m = toggleMute(); setStil(m) }

  const volgendeVorm = volgende ? STUKKE[volgende].vorms[0] : null
  const stad = stadiumBy(stadiumNr)
  const ALLE_DIERE = ['duif','skaap','bok','olifant','kameel','perd','leeu','sebra','giraf','beer','haas','vos']

  return createPortal((
    <div className="ark-overlay">

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
        {toestand === 'speel' && (
          <button className="ark-ikoon" onClick={pouseer} aria-label="Pouse">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="9" y1="5" x2="9" y2="19"/><line x1="15" y1="5" x2="15" y2="19"/>
            </svg>
          </button>
        )}
      </div>

      {/* ── Telbord ── */}
      <div className="ark-tel">
        <div className="ark-tel-item"><span>Punte</span><b>{telling.toLocaleString('af')}</b></div>
        <div className="ark-tel-item"><span>Vlak</span><b>{vlak}</b></div>
        <div className="ark-tel-item"><span>Lyne</span><b>{lyne}</b></div>
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
            {hetStoor && <button className="ark-knop ark-knop-primer" onClick={hervat}>Gaan voort</button>}
            <button className={`ark-knop ${hetStoor ? 'ark-knop-spook' : 'ark-knop-primer'}`} onClick={begin}>
              {hetStoor ? 'Begin van voor af' : 'Begin speel'}
            </button>
            <button className="ark-knop ark-knop-spook" onClick={() => setWysDiere(true)}>
              My diere ({diere.length} van {ALLE_DIERE.length})
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
              <div><span>Vlak</span><b>{vlak}</b></div>
              <div><span>Lyne</span><b>{lyne}</b></div>
              <div><span>Stadium</span><b>{stadiumNr}</b></div>
            </div>
            <button className="ark-knop ark-knop-primer" onClick={begin}>Speel weer</button>
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
            <span>{dierNaam(klaar.dier)} — 'n paar aan boord</span>
          </div>

          <blockquote className="ark-vers">
            {klaar.vers}
            <cite>{klaar.ref}</cite>
          </blockquote>

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
          <button className="ark-beheer-knop" onClick={hardVal} aria-label="Laat val">
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
  ), document.body)
}
