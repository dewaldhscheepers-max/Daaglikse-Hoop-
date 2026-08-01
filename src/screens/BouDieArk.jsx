import { useState, useEffect, useRef, useCallback } from 'react'
import { playCollect, playHit, playLevelComplete, toggleMute, isMuted } from '../utils/sound'
import './BouDieArk.css'

/* ────────────────────────────────────────────────────────────
   Bou die Ark — Fase 1
   Kern-meganika, beweging, rotasie, botsing, lyne, telling,
   game-over, mobiele beheer, pouse en hervat.
   Ark-bou, diere en ranglys kom in Fase 2 en 3.
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

const STOOR = 'ark_stoor'

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

  const doekRef = useRef(null)
  const wrapRef = useRef(null)

  // Spel-toestand leef in 'n ref sodat die lus nie by elke raam herbou nie
  const spel = useRef({
    bord: leegBord(),
    stuk: null,
    sak: [],
    volgende: null,
    telling: 0, lyne: 0, vlak: 1,
    val: 0, laas: 0,
    loop: false,
  })

  /* ── Teken ── */
  const teken = useCallback(() => {
    const doek = doekRef.current
    if (!doek) return
    const ctx = doek.getContext('2d')
    const s   = spel.current
    const bg  = doek.width / KOL

    ctx.clearRect(0, 0, doek.width, doek.height)

    // agtergrond + rooster
    ctx.fillStyle = '#1B1626'
    ctx.fillRect(0, 0, doek.width, doek.height)
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
      ctx.roundRect(px + 1.5, py + 1.5, bg - 3, bg - 3, r)
      ctx.fill()
      if (!deurskyn) {
        // sagte hoogtepunt bo — gee die blok diepte sonder om luidrugtig te wees
        ctx.fillStyle = 'rgba(255,255,255,0.16)'
        ctx.beginPath()
        ctx.roundRect(px + 1.5, py + 1.5, bg - 3, (bg - 3) * 0.36, [r, r, 0, 0])
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    // reeds geplaas
    for (let y = 0; y < RY; y++) {
      for (let x = 0; x < KOL; x++) if (s.bord[y][x]) blok(x, y, s.bord[y][x], false)
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
      const bg  = Math.floor(Math.min(wrap.clientWidth / KOL, wrap.clientHeight / RY))
      const w = bg * KOL, h = bg * RY
      // CSS-grootte bly w×h; die agtergrond is dpr keer groter vir skerp lyne.
      // teken() werk in toestel-pixels, dus bly die transform identiteit.
      doek.style.width  = w + 'px'
      doek.style.height = h + 'px'
      doek.width  = w * dpr
      doek.height = h * dpr
      teken()
    }
    pas()
    window.addEventListener('resize', pas)
    return () => window.removeEventListener('resize', pas)
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

    const oor = s.bord.filter(ry => ry.some(c => c === null))
    const skoon = RY - oor.length
    if (skoon > 0) {
      while (oor.length < RY) oor.unshift(Array(KOL).fill(null))
      s.bord = oor
      s.lyne += skoon
      s.telling += (PUNTE[skoon] || 0) * s.vlak
      const nuweVlak = Math.floor(s.lyne / LYNE_PER_VLAK) + 1
      if (nuweVlak > s.vlak) { s.vlak = nuweVlak; playLevelComplete() }
      else playCollect(Math.min(skoon - 1, 3), skoon)
      setLyne(s.lyne); setVlak(s.vlak)
    } else {
      playHit()
    }
    setTelling(s.telling)
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
      if (!bots(s.bord, p)) { s.stuk = p; teken(); return }
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
      const tempo = valTempo(s.vlak)
      while (s.val >= tempo) {
        s.val -= tempo
        if (!s.stuk) break
        const p = { ...s.stuk, y: s.stuk.y + 1 }
        if (!bots(s.bord, p)) s.stuk = p
        else { vasmaak(); break }
      }
      teken()
      id = requestAnimationFrame(raam)
    }
    id = requestAnimationFrame(raam)
    return () => { s.loop = false; cancelAnimationFrame(id) }
  }, [toestand, teken, vasmaak])

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
    setTelling(0); setLyne(0); setVlak(1)
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
      setTelling(d.telling); setLyne(d.lyne); setVlak(d.vlak); setVolgende(d.volgende)
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

  return (
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
            </div>
            <button className="ark-knop ark-knop-primer" onClick={begin}>Speel weer</button>
            <button className="ark-knop ark-knop-spook" onClick={onClose}>Klaar</button>
          </div>
        )}
      </div>

      {/* ── Kontroles ── */}
      {toestand === 'speel' && (
        <div className="ark-beheer">
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
  )
}
