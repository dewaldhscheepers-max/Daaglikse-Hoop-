import { useState, useEffect, useRef } from 'react'
import './Vredepad.css'

const MOOD_TRUTHS = {
  angs: [
    '"Moenie bang wees nie, want Ek is met jou." — Jes. 41:10',
    '"Gooi al jou kommer op Hom, want Hy sorg vir jou." — 1 Pet. 5:7',
    '"Vrede laat Ek julle na; my vrede gee Ek julle." — Joh. 14:27',
    '"Jy is veilig in Sy hande." — Ps. 91:4',
    '"Haal asem. Hy hou jou vas." — Ps. 46:10',
    '"Een oomblik op \'n slag." — Matt. 6:34',
    '"Hy is naby dié wat Hom roep." — Ps. 145:18',
    '"God is ons toevlug en sterkte." — Ps. 46:2',
  ],
  oordink: [
    '"Ek hoef nie alles vandag uit te werk nie." — Matt. 6:34',
    '"Vertrou op die Here met jou hele hart." — Spr. 3:5',
    '"God weet. Ek kan rus." — Ps. 23:2',
    '"Nie elke gedagte is die waarheid nie." — 2 Kor. 10:5',
    '"Jou verstand het rus nodig." — Ps. 127:2',
    '"Laat gaan. Laat God." — Ps. 37:5',
    '"Hy lei my, een stap op \'n slag." — Ps. 32:8',
    '"Dink aan dinge wat waar en rein is." — Fil. 4:8',
  ],
  moegheid: [
    '"Hy gee krag aan dié wat moeg is." — Jes. 40:29',
    '"Jy hoef nie alles vandag te dra nie." — Matt. 11:28',
    '"Een tree op \'n slag is genoeg." — Ps. 119:105',
    '"Jy het genoeg gedoen. Dit is goed." — Gen. 1:31',
    '"Lê jou las neer. Hy dra dit." — Ps. 55:22',
    '"Hy gee rus vir moë siele." — Matt. 11:29',
    '"Rus is ook \'n geestelike daad." — Mark. 6:31',
    '"Jou waarde lê nie in jou produktiwiteit nie." — Ps. 139:14',
  ],
  vrees: [
    '"God is groter as enige ding wat my bang maak." — 1 Joh. 4:4',
    '"Ek is nie alleen nie." — Heb. 13:5',
    '"Selfs in die donker is Hy hier." — Ps. 139:12',
    '"Hy lei my deur elke dal." — Ps. 23:4',
    '"Ek is in veilige hande." — Joh. 10:29',
    '"Hy is my lig in die duisternis." — Ps. 18:29',
    '"Ek kan vertrou, selfs as ek nie verstaan nie." — Spr. 3:5',
    '"Wees sterk en moedig. Moenie bang wees nie." — Jos. 1:9',
  ],
  alleenheid: [
    '"Ek is gesien en geken." — Ps. 139:1',
    '"Hy verlaat my nooit nie." — Heb. 13:5',
    '"God ken my naam." — Jes. 43:1',
    '"Ek is geliefd, ook as dit nie so voel nie." — Jer. 31:3',
    '"Jy is nie vergete nie." — Jes. 49:15',
    '"Hy dink aan my." — Ps. 40:17',
    '"Ek is nooit werklik alleen nie." — Ps. 23:4',
    '"Sy teenwoordigheid vul my leegheid." — Ps. 16:11',
  ],
  druk: [
    '"Ek doen wat ek kan. God doen die res." — Fil. 4:13',
    '"In stilte lê my krag." — Jes. 30:15',
    '"Ek is genoeg, net soos ek is." — Ps. 139:14',
    '"Gooi jou las op Hom." — Ps. 55:22',
    '"Hy dra saam met my." — Gal. 6:2',
    '"Volmaaktheid is nie die doel nie. Vrede is." — Fil. 4:7',
    '"Een prioriteit op \'n slag." — Matt. 6:33',
    '"Ek hoef nie alles te dra nie." — Matt. 11:28',
  ],
}

const ALL_TRUTHS = Object.values(MOOD_TRUTHS).flat()

const THEMES = [
  {
    name: 'Rus en Kalmte',
    verse: '"Die Here gee rus." — Eks. 33:14',
    bg0: '#E8F4F8', bg1: '#D0EAF0', bg2: '#B8E0E8',
    player: '#5B9BD5',
    playerGlow: 'rgba(91,155,213,0.45)',
    playerWarm: 'rgba(255,240,180,0.62)',
    seedGlow: 'rgba(255,215,0,0.5)',
    weed: '#3D6B72',
    petals: ['#87CEEB', '#ADD8E6', '#B0E0E6'],
    petal0: '#FFD700',
    particle: 'rgba(91,155,213,0.22)',
  },
  {
    name: 'Beskerming en Veiligheid',
    verse: '"Die Here is my skild." — Ps. 18:3',
    bg0: '#EDF7EE', bg1: '#C8E6C9', bg2: '#A5D6A7',
    player: '#388E3C',
    playerGlow: 'rgba(56,142,60,0.45)',
    playerWarm: 'rgba(255,240,180,0.62)',
    seedGlow: 'rgba(255,215,0,0.5)',
    weed: '#37474F',
    petals: ['#A5D6A7', '#C8E6C9', '#DCEDC8'],
    petal0: '#FF8F00',
    particle: 'rgba(56,142,60,0.22)',
  },
  {
    name: 'Identiteit en Liefde',
    verse: '"Jy is geliefd." — Jer. 31:3',
    bg0: '#F5F0FA', bg1: '#E1BEE7', bg2: '#CE93D8',
    player: '#8E44AD',
    playerGlow: 'rgba(142,68,173,0.45)',
    playerWarm: 'rgba(255,240,180,0.62)',
    seedGlow: 'rgba(255,215,0,0.5)',
    weed: '#4A235A',
    petals: ['#CE93D8', '#F48FB1', '#F8BBD0'],
    petal0: '#FFD700',
    particle: 'rgba(142,68,173,0.22)',
  },
  {
    name: 'Krag en Volharding',
    verse: '"Ek kan alles doen." — Fil. 4:13',
    bg0: '#FFF8F0', bg1: '#FFE0B2', bg2: '#FFCC80',
    player: '#E67E22',
    playerGlow: 'rgba(230,126,34,0.45)',
    playerWarm: 'rgba(255,240,180,0.62)',
    seedGlow: 'rgba(255,215,0,0.5)',
    weed: '#4E342E',
    petals: ['#FFCC80', '#FFAB40', '#FFA726'],
    petal0: '#E65100',
    particle: 'rgba(230,126,34,0.22)',
  },
]

function d2(a, b) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2) }
function wrapVal(v, max) { return ((v % max) + max) % max }

function freePos(W, H, avoid, minD) {
  for (let i = 0; i < 80; i++) {
    const x = 30 + Math.random() * (W - 60)
    const y = 30 + Math.random() * (H - 60)
    if (avoid.every(o => d2({ x, y }, o) > minD)) return { x, y }
  }
  return { x: 30 + Math.random() * (W - 60), y: 30 + Math.random() * (H - 60) }
}

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/* ── Canvas draw helpers ── */
function drawBg(ctx, W, H, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, t.bg0); g.addColorStop(0.55, t.bg1); g.addColorStop(1, t.bg2)
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
}

function drawParticles(ctx, parts, t) {
  for (const p of parts) {
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fillStyle = t.particle; ctx.globalAlpha = p.alpha; ctx.fill(); ctx.globalAlpha = 1
  }
}

function drawFlower(ctx, x, y, r, alpha, t) {
  ctx.globalAlpha = Math.min(alpha, 1)
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    ctx.save(); ctx.translate(x + Math.cos(a) * r * 1.3, y + Math.sin(a) * r * 1.3); ctx.rotate(a)
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.52, r * 0.82, 0, 0, Math.PI * 2)
    ctx.fillStyle = t.petals[i % t.petals.length]; ctx.fill(); ctx.restore()
  }
  ctx.beginPath(); ctx.arc(x, y, r * 0.48, 0, Math.PI * 2); ctx.fillStyle = t.petal0; ctx.fill()
  ctx.globalAlpha = 1
}

function drawSeed(ctx, x, y, pulse, t) {
  const r = 8 + Math.sin(pulse) * 1.5
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.4)
  g.addColorStop(0, t.seedGlow); g.addColorStop(1, 'rgba(255,215,0,0)')
  ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, Math.PI * 2)
  ctx.fillStyle = g; ctx.globalAlpha = 0.65; ctx.fill(); ctx.globalAlpha = 1
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = '#FFD700'; ctx.fill()
  ctx.beginPath(); ctx.arc(x - r * 0.28, y - r * 0.3, r * 0.3, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill()
}

function drawWeed(ctx, x, y, pulse, t) {
  const r = 13 + Math.sin(pulse * 0.7) * 1.5
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 1.6)
  g.addColorStop(0, t.weed); g.addColorStop(0.55, t.weed + 'BB'); g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, Math.PI * 2)
  ctx.fillStyle = g; ctx.globalAlpha = 0.7; ctx.fill(); ctx.globalAlpha = 1
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + pulse * 0.25
    ctx.beginPath()
    ctx.moveTo(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5)
    ctx.lineTo(x + Math.cos(a) * (r + 5), y + Math.sin(a) * (r + 5))
    ctx.strokeStyle = t.weed; ctx.lineWidth = 1.8; ctx.globalAlpha = 0.42; ctx.stroke(); ctx.globalAlpha = 1
  }
}

function drawPlayer(ctx, p, tick, t) {
  const { x, y } = p
  const r = 13

  // Soft trail
  for (let i = 0; i < p.trail.length; i++) {
    const tr = p.trail[i]
    const frac = (i + 1) / p.trail.length
    ctx.beginPath(); ctx.arc(tr.x, tr.y, r * 0.55 * frac, 0, Math.PI * 2)
    ctx.fillStyle = t.player; ctx.globalAlpha = 0.09 * frac; ctx.fill(); ctx.globalAlpha = 1
  }

  // Warm golden glow
  const pulse = Math.sin(tick * 0.05) * 3
  const gw = ctx.createRadialGradient(x, y, 0, x, y, r * 2.8 + pulse)
  gw.addColorStop(0, t.playerWarm)
  gw.addColorStop(0.45, t.playerGlow)
  gw.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.beginPath(); ctx.arc(x, y, r * 2.8 + pulse, 0, Math.PI * 2)
  ctx.fillStyle = gw; ctx.globalAlpha = 0.72; ctx.fill(); ctx.globalAlpha = 1

  // Main dot
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = t.player; ctx.fill()
  ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.33, r * 0.32, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill()
}

function loadSave() { try { return JSON.parse(localStorage.getItem('vredepad_data') || '{}') } catch { return {} } }
function saveSave(d) { try { localStorage.setItem('vredepad_data', JSON.stringify(d)) } catch {} }

export default function Vredepad({ onClose }) {
  const canvasRef    = useRef(null)
  const gameRef      = useRef(null)
  const rafRef       = useRef(null)
  const touchRef     = useRef({ x: 0, y: 0 })
  const pendingLevel = useRef(1)
  const isReplayRef  = useRef(false)

  const [screen, setScreen]         = useState('intro')
  const [countdown, setCountdown]   = useState(3)
  const [displayScore, setScore]    = useState(0)
  const [displayTime, setTime]      = useState(60)
  const [seedBubble, setSeedBubble] = useState(null)
  const [breathing, setBreathing]   = useState(false)
  const [breathPhase, setPhase]     = useState('inhale')
  const [endData, setEndData]       = useState(null)
  const [streak, setStreak]         = useState(() => loadSave().streak || 0)
  const [bestScore, setBest]        = useState(() => loadSave().best || 0)

  // ── Countdown ──
  useEffect(() => {
    if (screen !== 'countdown') return
    if (countdown <= 0) { setScreen('playing'); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [screen, countdown])

  function buildGame(level, W, H) {
    const t  = THEMES[(level - 1) % THEMES.length]
    const sc = 3 + Math.min(Math.floor((level - 1) / 5), 3)
    const wc = 2 + Math.min(Math.floor((level - 1) / 3), 6)
    const sp = 1.5 + Math.min((level - 1) * 0.08, 1.5)
    const mid = { x: W / 2, y: H / 2 }

    const truths = shuffleArray(ALL_TRUTHS)

    const seeds = []
    for (let i = 0; i < sc; i++)
      seeds.push({ ...freePos(W, H, [...seeds, mid], 60), pulse: Math.random() * Math.PI * 2 })

    const weeds = []
    for (let i = 0; i < wc; i++)
      weeds.push({
        ...freePos(W, H, [...seeds, ...weeds, mid], 65),
        pulse: Math.random() * Math.PI * 2,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
      })

    const parts = Array.from({ length: 20 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 2 + Math.random() * 3,
      dx: (Math.random() - 0.5) * 0.22,
      dy: -0.1 - Math.random() * 0.22,
      alpha: 0.07 + Math.random() * 0.18,
    }))

    gameRef.current = {
      W, H, t, level,
      player: { x: W / 2, y: H / 2, dx: 0, dy: 0, sp, trail: [] },
      seeds, weeds, parts,
      flowers: [],
      score: 0, timeLeft: 60,
      tick: 0, lastTime: null,
      hitCooldown: 0, breathingActive: false,
      truths, truthIdx: 0,
      collectedTruths: [],
      bgFlash: 0,
    }
  }

  function endLevel(g) {
    const save  = loadSave()
    const today = new Date().toISOString().slice(0, 10)
    const nb    = Math.max(save.best || 0, g.score)
    const lastTruth = g.collectedTruths.length > 0
      ? g.collectedTruths[Math.floor(Math.random() * g.collectedTruths.length)]
      : g.truths[0]

    if (!isReplayRef.current) {
      const newLevel = (save.level || 1) + 1
      const yday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      const last = save.lastDay || ''
      const ns   = last === yday ? (save.streak || 0) + 1 : last === today ? (save.streak || 0) : 1
      saveSave({ level: newLevel, totalScore: (save.totalScore || 0) + g.score, lastDay: today, streak: ns, best: nb })
      setStreak(ns); setBest(nb)
      setEndData({ score: g.score, level: g.level, streak: ns, bestScore: nb, lastTruth })
    } else {
      if (nb > (save.best || 0)) { saveSave({ ...save, best: nb }); setBest(nb) }
      setEndData({ score: g.score, level: g.level, streak: save.streak || 0, bestScore: nb, lastTruth })
    }
    setScreen('levelup')
  }

  function triggerBreathing() {
    setBreathing(true); setPhase('inhale')
    setTimeout(() => setPhase('exhale'), 2500)
    setTimeout(() => {
      setBreathing(false)
      if (gameRef.current) gameRef.current.breathingActive = false
    }, 5000)
  }

  useEffect(() => {
    if (screen !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return

    const canvasWrap = canvas.parentElement
    let ro, initRafId

    function onKey(e) {
      if (!gameRef.current) return
      const p = gameRef.current.player
      if (e.key === 'ArrowUp'    || e.key === 'w') { p.dx = 0;  p.dy = -1 }
      if (e.key === 'ArrowDown'  || e.key === 's') { p.dx = 0;  p.dy = 1  }
      if (e.key === 'ArrowLeft'  || e.key === 'a') { p.dx = -1; p.dy = 0  }
      if (e.key === 'ArrowRight' || e.key === 'd') { p.dx = 1;  p.dy = 0  }
    }
    function onKeyUp() {
      if (gameRef.current) { gameRef.current.player.dx = 0; gameRef.current.player.dy = 0 }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup',   onKeyUp)

    initRafId = requestAnimationFrame(() => {
      const rect    = canvasWrap.getBoundingClientRect()
      canvas.width  = rect.width  > 0 ? rect.width  : window.innerWidth
      canvas.height = rect.height > 0 ? rect.height : window.innerHeight - 100

      buildGame(pendingLevel.current, canvas.width, canvas.height)
      setScore(0); setTime(60)

      ro = new ResizeObserver(() => {
        const r = canvasWrap.getBoundingClientRect()
        if (r.width  > 0) canvas.width  = r.width
        if (r.height > 0) canvas.height = r.height
        if (gameRef.current) { gameRef.current.W = canvas.width; gameRef.current.H = canvas.height }
      })
      ro.observe(canvasWrap)

      rafRef.current = requestAnimationFrame(loop)
    })

    function loop(ts) {
      const g = gameRef.current
      if (!g) return

      if (!g.lastTime) g.lastTime = ts
      const dt = Math.min((ts - g.lastTime) / 16.67, 3)
      g.lastTime = ts
      g.tick += dt

      if (!g.breathingActive) {
        g.timeLeft -= dt / 60
        if (g.timeLeft <= 0) { g.timeLeft = 0; endLevel(g); return }
      }

      const p = g.player
      if (p.dx !== 0 || p.dy !== 0) {
        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > 10) p.trail.shift()
        const len = Math.sqrt(p.dx ** 2 + p.dy ** 2)
        p.x = wrapVal(p.x + (p.dx / len) * p.sp * dt, g.W)
        p.y = wrapVal(p.y + (p.dy / len) * p.sp * dt, g.H)
      } else {
        if (p.trail.length > 0) p.trail.shift()
      }

      for (const s of g.seeds) s.pulse += 0.05 * dt
      for (const w of g.weeds) {
        w.pulse += 0.04 * dt
        w.x = wrapVal(w.x + w.dx * dt, g.W)
        w.y = wrapVal(w.y + w.dy * dt, g.H)
      }
      for (const pt of g.parts) {
        pt.x = wrapVal(pt.x + pt.dx * dt, g.W)
        pt.y += pt.dy * dt
        if (pt.y < -10) { pt.y = g.H + 5; pt.x = Math.random() * g.W }
      }

      g.seeds = g.seeds.filter(s => {
        if (d2(p, s) < 22) {
          g.score++
          g.flowers.push({ x: s.x, y: s.y, life: 0, r: 10 })
          const truth = g.truths[g.truthIdx % g.truths.length]
          g.collectedTruths.push(truth)
          g.truthIdx++
          setSeedBubble({ text: truth, id: g.score })
          return false
        }
        return true
      })
      if (g.seeds.length === 0) {
        const sc = 3 + Math.min(Math.floor((g.level - 1) / 5), 3)
        // Avoid only sibling seeds + player (not weeds — they move, so any position is eventually reachable)
        for (let i = 0; i < sc; i++)
          g.seeds.push({ ...freePos(g.W, g.H, [...g.seeds, p], 50), pulse: Math.random() * Math.PI * 2 })
      }

      if (g.hitCooldown > 0) g.hitCooldown -= dt
      if (g.bgFlash    > 0) g.bgFlash    -= dt

      if (g.hitCooldown <= 0 && !g.breathingActive) {
        for (const w of g.weeds) {
          if (d2(p, w) < 27) {
            g.hitCooldown = 180; g.breathingActive = true; g.bgFlash = 14
            triggerBreathing(); break
          }
        }
      }

      // Flowers grow to full size (60 frames) then stay permanently
      for (const f of g.flowers) {
        if (f.life < 60) f.life += dt
      }

      setScore(g.score)
      setTime(Math.ceil(g.timeLeft))

      const ctx = canvas.getContext('2d')
      drawBg(ctx, g.W, g.H, g.t)
      if (g.bgFlash > 0) {
        ctx.fillStyle = 'rgba(255,180,100,0.25)'; ctx.globalAlpha = g.bgFlash / 14
        ctx.fillRect(0, 0, g.W, g.H); ctx.globalAlpha = 1
      }
      drawParticles(ctx, g.parts, g.t)
      for (const f of g.flowers) {
        const growFrac = Math.min(f.life / 60, 1)
        drawFlower(ctx, f.x, f.y, f.r * (1 + growFrac * 0.8), growFrac, g.t)
      }
      for (const s of g.seeds) drawSeed(ctx, s.x, s.y, s.pulse, g.t)
      for (const w of g.weeds) drawWeed(ctx, w.x, w.y, w.pulse, g.t)
      drawPlayer(ctx, p, g.tick, g.t)

      rafRef.current = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(initRafId)
      cancelAnimationFrame(rafRef.current)
      ro?.disconnect()
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup',   onKeyUp)
    }
  }, [screen])

  function startGame() {
    pendingLevel.current = loadSave().level || 1
    isReplayRef.current  = false
    setCountdown(3)
    setScreen('countdown')
  }

  function nextLevel() {
    cancelAnimationFrame(rafRef.current)
    pendingLevel.current = loadSave().level || 1
    isReplayRef.current  = false
    setCountdown(3)
    setScreen('countdown')
  }

  function replayLevel() {
    cancelAnimationFrame(rafRef.current)
    pendingLevel.current = endData?.level || 1
    isReplayRef.current  = true
    setCountdown(3)
    setScreen('countdown')
  }

  async function handleShare() {
    const d   = endData
    const msg = `Ek het ${d.score} waarhede ontvang op Vredepad ${d.level}! Vrede-reeks: ${d.streak} dag(e) 🌿\n\nSpeel ook: https://dewaldscheepers.com/go`
    if (navigator.share) {
      try { await navigator.share({ title: 'Vredepad', text: msg }) } catch {}
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
    }
  }

  function onTouchStart(e) {
    const t = e.touches[0]
    touchRef.current = { x: t.clientX, y: t.clientY }
  }

  function onTouchEnd(e) {
    if (!gameRef.current) return
    const t  = e.changedTouches[0]
    const dx = t.clientX - touchRef.current.x
    const dy = t.clientY - touchRef.current.y
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
    const p = gameRef.current.player
    if (Math.abs(dx) >= Math.abs(dy)) { p.dx = dx > 0 ? 1 : -1; p.dy = 0 }
    else                               { p.dx = 0; p.dy = dy > 0 ? 1 : -1 }
  }

  /* ── Intro ── */
  if (screen === 'intro') {
    const save  = loadSave()
    const level = save.level || 1
    const t     = THEMES[(level - 1) % THEMES.length]
    return (
      <div className="vp-overlay" style={{ background: t.bg0 }}>
        <button className="vp-close" onClick={onClose}>✕</button>
        <div className="vp-intro">
          <div className="vp-intro-icon">🌿</div>
          <h1 className="vp-intro-title">Vredepad</h1>
          <p className="vp-intro-verse">{t.verse}</p>
          <p className="vp-intro-desc">
            'n Stil oomblik om jou gedagtes te stilmaak. Versamel <strong>waarhede</strong>, laat <strong>intrinsieke gedagtes</strong> verbygaan.
          </p>
          {level > 1 && (
            <div className="vp-stats-row">
              <div className="vp-stat"><span className="vp-stat-val">{level}</span><span className="vp-stat-lbl">Vredepad</span></div>
              <div className="vp-stat"><span className="vp-stat-val">{streak}</span><span className="vp-stat-lbl">Vrede-reeks</span></div>
              <div className="vp-stat"><span className="vp-stat-val">{bestScore}</span><span className="vp-stat-lbl">Beste</span></div>
            </div>
          )}
          <div className="vp-hint-row">
            <span>📱 Swiep om te beweeg</span>
            <span>⌨️ WASD / Pyltjies</span>
          </div>
          <button className="vp-start-btn" style={{ background: t.player }} onClick={startGame}>
            {level > 1 ? `Begin Vredepad ${level}` : 'Begin my pad van vrede'}
          </button>
        </div>
      </div>
    )
  }

  /* ── Countdown ── */
  if (screen === 'countdown') {
    const level = pendingLevel.current
    const t     = THEMES[(level - 1) % THEMES.length]
    return (
      <div className="vp-overlay vp-countdown-screen" style={{ background: t.bg0 }}>
        <div className="vp-countdown-body">
          <p className="vp-countdown-prompt">Haal diep asem. Jy is veilig hier.</p>
          <div className="vp-countdown-num" style={{ color: t.player }}>
            {countdown > 0 ? countdown : '🌿'}
          </div>
          <p className="vp-countdown-sub">Vredepad {level}</p>
        </div>
      </div>
    )
  }

  /* ── Playing ── */
  if (screen === 'playing') {
    return (
      <div className="vp-overlay vp-playing">
        <div className="vp-hud">
          <span className="vp-hud-score">Waarhede: {displayScore}</span>
          <span className="vp-hud-time" style={{ color: displayTime <= 10 ? '#C0392B' : 'var(--text)' }}>
            {displayTime}s
          </span>
          <button className="vp-hud-close" onClick={() => { cancelAnimationFrame(rafRef.current); setScreen('intro') }}>
            ✕
          </button>
        </div>
        <div className="vp-truth-bar">
          <span className="vp-truth-text">Haal asem. Laat die gedagte gaan. Jy is veilig hier.</span>
        </div>
        <div className="vp-canvas-wrap" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <canvas ref={canvasRef} className="vp-canvas" />
          {seedBubble && (
            <div
              className="vp-seed-bubble"
              key={seedBubble.id}
              onAnimationEnd={() => setSeedBubble(null)}
            >
              <span className="vp-seed-bubble-icon">✦</span>
              <p className="vp-seed-bubble-text">{seedBubble.text}</p>
            </div>
          )}
        </div>
        {breathing && (
          <div className="vp-breathing-overlay">
            <div className={`vp-breath-circle vp-breath-${breathPhase}`} />
            <p className="vp-breath-prompt">Haal diep asem. Laat die gedagte gaan.</p>
            <p className="vp-breath-label">{breathPhase === 'inhale' ? 'Inasem...' : 'Uitasem...'}</p>
            <p className="vp-breath-verse">"Wees stil en weet dat Ek God is." — Ps. 46:11</p>
          </div>
        )}
      </div>
    )
  }

  /* ── End / Level up ── */
  if (screen === 'levelup' && endData) {
    const d    = endData
    const t    = THEMES[(d.level - 1) % THEMES.length]
    return (
      <div className="vp-overlay vp-end" style={{ background: t.bg0 }}>
        <div className="vp-end-body">
          <div className="vp-end-icon">🌿</div>
          <h2 className="vp-end-title">Jy het plek gemaak vir vrede.</h2>
          <p className="vp-end-level">Vredepad {d.level} voltooi</p>

          <div className="vp-stats-row">
            <div className="vp-stat">
              <span className="vp-stat-val">{d.score}</span>
              <span className="vp-stat-lbl">Waarhede</span>
            </div>
            <div className="vp-stat">
              <span className="vp-stat-val">{d.bestScore}</span>
              <span className="vp-stat-lbl">Beste</span>
            </div>
            <div className="vp-stat">
              <span className="vp-stat-val">{d.streak}</span>
              <span className="vp-stat-lbl">Vrede-reeks</span>
            </div>
          </div>

          {d.lastTruth && (
            <div className="vp-end-truth">
              <p className="vp-end-truth-label">Neem hierdie waarheid saam:</p>
              <p className="vp-end-truth-text">{d.lastTruth}</p>
            </div>
          )}

          <div className="vp-end-prayer">
            <p>Here, maak my gedagtes stil en lei my in U vrede. Amen.</p>
          </div>

          <button className="vp-start-btn" style={{ background: t.player }} onClick={nextLevel}>
            Volgende Vredepad →
          </button>
          <button className="vp-secondary-btn" onClick={replayLevel}>Speel weer</button>
          <button className="vp-share-btn" onClick={handleShare}>Deel my vrede 🌿</button>
          <button className="vp-back-link" onClick={onClose}>Terug na tuis</button>
        </div>
      </div>
    )
  }

  return null
}
