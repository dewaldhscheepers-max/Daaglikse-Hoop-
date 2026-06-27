import { useState, useEffect, useRef } from 'react'
import DonationCard from '../components/DonationCard'
import { playCollect, playHit, playLevelComplete, startAmbient, stopAmbient, toggleMute, isMuted } from '../utils/sound'
import { db, getOrCreateAnonUid } from '../firebase'
import { collection, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore'
import './Vredepad.css'

const FREE_REWARD_BOOKS = [
  { id: 'jesus-se-hart',  emoji: '❤️‍🔥', title: 'Jesus se Hart' },
  { id: '7-leuens',       emoji: '📘',    title: '7 Leuens van die Duiwel' },
  { id: 'bybel-hulpbron', emoji: '📗',    title: 'Die Bybel Maklik Gemaak' },
]

const PROMISE_PLANTS = ['🌱', '🌻', '🌾', '🌿', '🌸', '🍇']

// 9 glowing illustrated blooms (f0–f8.webp, transparent bg)
const flowerImages = Array.from({ length: 9 }, (_, i) => {
  const img = new Image()
  img.src = `/flowers/f${i}.webp?v=8`
  return img
})

const bgImages = Array.from({ length: 15 }, (_, i) => {
  const img = new Image()
  img.src = `/bg/bg${i}.webp?v=5`
  return img
})

// 2 spiky thorn sprites (w0–w1.webp, transparent bg)
const weedImages = Array.from({ length: 2 }, (_, i) => {
  const img = new Image()
  img.src = `/weeds/w${i}.webp?v=7`
  return img
})

// 8 heart-light player stages (p0–p7.webp, transparent bg)
const playerImages = Array.from({ length: 8 }, (_, i) => {
  const img = new Image()
  img.src = `/player/p${i}.webp?v=1`
  return img
})


const MILESTONE_BOOKS = [
  { id: 'wanneer-angs-toeslaan', emoji: '🌅', title: 'Wanneer Angs Toeslaan', level: 7   },
  { id: 'angs-detox',            emoji: '🕊️', title: 'Angs Detox',            level: 20  },
  { id: 'dink-nuut-leef-nuut',   emoji: '🌱', title: 'Dink Nuut, Leef Nuut',  level: 50  },
  { id: 'rustelose-gedagtes',    emoji: '🌙', title: 'Rustelose Gedagtes',    level: 120 },
]

const SHORT_TRUTHS = [
  'God is lief vir jou.', 'Jy is nie alleen nie.', 'God is naby.', 'God sien jou.',
  'Jy is geliefd.', 'Jy is waardevol.', 'Jy behoort aan Hom.', 'God hou jou vas.',
  'Jy is veilig by Hom.', 'Vrede is moontlik.', 'Hoop is nog hier.', 'Genade is hier.',
  'God werk nog.', 'Die Here is by jou.', 'Jy mag weer asemhaal.', "Een tree op 'n slag.",
  'Jy hoef nie bang te wees nie.', 'God verstaan jou pyn.', 'Jou storie is nie klaar nie.',
  'Jy kan weer opstaan.', 'God gee nuwe krag.', 'Die Here is jou vrede.',
  'Jy is in Sy hand.', 'Lig is sterker as donker.', 'Waarheid is sterker as vrees.',
  'Jy is nie jou gedagtes nie.', 'Laat gaan.', 'Haal asem.', 'God dra jou hart.',
  'Jy is nie vergete nie.', 'God is getrou.', 'Jy kan rus.', 'Sy vrede is hier.',
  'Jy is kosbaar.', 'God hoor jou.', 'God ken jou naam.', 'Hy is steeds goed.',
  'Jy hoef nie alles vandag te dra nie.', "Die Here maak 'n pad.", 'Jy is nie te ver nie.',
  'God gee wysheid.', 'Jy is onder genade.', 'Hou moed.', 'Jou hart mag stil word.',
  'God bring herstel.', 'Jy kan weer hoop.', 'God los jou nie.', 'Sy liefde bly.',
  'Jy is sterker as wat jy voel.', 'Die Here stap saam.',
]
const WEED_WORDS = [
  'Vrees', 'Oordink', 'Skuld', 'Skaamte', 'Verwerping', 'Paniek', 'Moegheid',
  'Bitterheid', 'Twyfel', 'Alleen', 'Wat as?', 'Ek kan nie', 'Geen hoop', 'Te veel',
  'Ek is moeg', 'Niemand sien nie', 'Ek is vas', 'Ek is bang',
  'Dit gaan nooit verander nie', 'Ek is nie genoeg nie', 'Alles is verkeerd',
  'Ek gaan breek', 'God hoor my nie', 'Ek is vergete', 'Dit is my skuld',
  'Ek kan nie rus nie', 'My gedagtes raas', 'Ek voel leeg', 'Ek is oorweldig', 'Ek verloor moed',
]
const RECOVERY_TRUTHS = [
  'Vrede herstel', 'God is naby', 'Haal asem', 'Jy is veilig', 'Laat gaan',
]
const STORM_DRIFT_WORDS = [
  'Wat as?', 'Ek kan nie', 'Te veel', 'Ek is bang', 'Geen hoop',
  'Ek is moeg', 'Ek is alleen', 'My gedagtes raas', 'Ek gaan breek', 'Niemand sien nie',
]
const STORM_TRUTHS = [
  'God is naby.', 'Jy is nie alleen nie.', 'Haal asem.', 'Vrede is moontlik.',
  'God hou jou vas.', 'Waarheid is sterker as vrees.', 'Die storm gaan verby.',
]

const STORM_BAR_DRAIN = 0.00145  // bar depletion per dt tick
const STORM_BAR_WEED  = 0.10     // extra drain when weed hit during storm
const STORM_BAR_TRUTH = 0.22     // bar refill when truth caught during storm

const COUNTDOWN_PHRASES = [
  'Haal diep asem. Jy is veilig hier.',
  'Laat jou gedagtes stil word.',
  'God is hier by jou.',
  'Bring net jouself. Dit is genoeg.',
  'Een oomblik op \'n slag.',
  'Jy is geliefd soos jy is.',
]

function haptic(ms) { try { navigator.vibrate?.(ms) } catch {} }

function minScoreForLevel(level) {
  if (level <= 5)  return 10
  if (level <= 15) return 15
  return 20
}

function sortLeaderboard(entries) {
  return [...entries]
    .sort((a, b) =>
      b.level - a.level ||
      b.score - a.score ||
      ((a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
    )
    .slice(0, 10)
}

const BLOCKED_NAMES = [
  'admin', 'daaglikse', 'daagliksehoop', 'pastoor', 'official', 'moderator',
  'fok', 'fokof', 'poef', 'kak', 'poes', 'moer', 'doos', 'bliksem', 'naai', 'slet', 'hoer', 'teef',
  'fuck', 'shit', 'bitch', 'cunt', 'dick', 'cock', 'pussy', 'asshole', 'bastard', 'whore', 'slut',
  'nigger', 'nigga', 'faggot',
]

function validateDisplayName(name) {
  const t = name.trim()
  if (!t) return 'Voer asseblief \'n naam in.'
  if (t.length > 20) return 'Naam moet korter as 21 karakters wees.'
  const lower = t.toLowerCase()
  if (BLOCKED_NAMES.some(b => lower.includes(b))) return 'Kies asseblief \'n ander naam.'
  return null
}

const ALL_TRUTHS = [
  'Psalm 23:1 — Die Here is jou Herder; Hy weet wat jy nodig het.',
  'Psalm 23:4 — Selfs in die donkerste vallei is God by jou.',
  'Psalm 27:1 — Die Here is jou lig en jou redding; jy hoef nie deur vrees beheer te word nie.',
  'Psalm 34:19 — Die Here is naby aan mense wie se harte gebreek is.',
  'Psalm 46:2 — God is jou toevlug en jou krag wanneer alles om jou skud.',
  'Psalm 55:23 — Gee jou bekommernis vir die Here; Hy sal jou nie laat val nie.',
  'Psalm 56:4 — Wanneer vrees opstaan, kan jy steeds op God vertrou.',
  'Psalm 62:6 — Jou siel kan stil word, want jou hoop kom van God af.',
  'Psalm 91:1–2 — By God is daar skuilplek, veiligheid en rus.',
  'Psalm 121:1–2 — Jou hulp kom van die Here, die Maker van hemel en aarde.',
  'Psalm 139:5 — God is voor jou, agter jou en Sy hand is oor jou.',
  'Psalm 147:3 — God genees gebroke harte en verbind wonde.',
  'Spreuke 3:5–6 — Vertrou op die Here; Hy sal jou pad wys.',
  'Spreuke 18:10 — Die Naam van die Here is \'n veilige plek vir jou hart.',
  'Jesaja 26:3 — God gee vrede aan die mens wat op Hom vertrou.',
  'Jesaja 40:31 — Dié wat op die Here wag, kry nuwe krag.',
  'Jesaja 41:10 — Moenie bang wees nie; God is by jou en Hy versterk jou.',
  'Jesaja 43:1 — Jy behoort aan God; Hy ken jou en roep jou Syne.',
  'Jesaja 43:2 — Wanneer jy deur diep waters gaan, is God saam met jou.',
  'Jesaja 54:10 — God se liefde en trou sal nie van jou wyk nie.',
  'Jeremia 29:11 — God se gedagtes oor jou is vol hoop en toekoms.',
  'Jeremia 31:3 — God het jou lief met \'n liefde wat nie ophou nie.',
  'Klaagliedere 3:22–23 — God se genade is elke oggend nuut.',
  'Sefanja 3:17 — Die Here is by jou; Hy red, Hy verheug Hom oor jou en Hy bring rus.',
  'Eksodus 14:14 — Die Here sal vir jou veg; jy mag stil word.',
  'Numeri 6:24–26 — Mag die Here jou seën, jou beskerm en vir jou vrede gee.',
  'Deuteronomium 31:8 — Die Here gaan voor jou uit; Hy sal jou nie los nie.',
  'Josua 1:9 — Wees sterk en moedig, want die Here is met jou waar jy ook al gaan.',
  'Nehemia 8:10 — Die blydskap wat die Here gee, is jou krag.',
  'Matteus 6:34 — Moenie môre se bekommernis vandag dra nie.',
  'Matteus 11:28 — Jesus nooi moedelose mense om by Hom rus te vind.',
  'Johannes 14:27 — Jesus gee \'n vrede wat die wêreld nie kan gee nie.',
  'Johannes 16:33 — In Jesus is daar vrede, selfs wanneer die lewe swaar is.',
  'Romeine 8:28 — God kan selfs moeilike dinge gebruik vir Sy goeie doel.',
  'Romeine 8:31 — As God vir jou is, hoef vrees nie die laaste sê te hê nie.',
  'Romeine 8:38–39 — Niks kan jou van God se liefde skei nie.',
  'Romeine 15:13 — God kan jou vul met blydskap, vrede en hoop.',
  '2 Korintiërs 1:3–4 — God troos jou, sodat jy later ook ander kan troos.',
  '2 Korintiërs 4:8–9 — Jy mag onder druk wees, maar jy is nie vernietig nie.',
  '2 Korintiërs 12:9 — God se genade is genoeg, selfs wanneer jy swak voel.',
  'Filippense 4:6–7 — Bring jou bekommernisse na God; Sy vrede sal jou hart beskerm.',
  'Filippense 4:13 — Christus gee krag vir wat jy vandag moet dra.',
  'Filippense 4:19 — God weet wat jy nodig het en Hy sorg volgens Sy rykdom.',
  'Kolossense 3:15 — Laat die vrede van Christus oor jou hart regeer.',
  '2 Timoteus 1:7 — God gee nie \'n gees van vrees nie, maar van krag, liefde en selfbeheersing.',
  'Hebreërs 4:16 — Jy mag met vrymoedigheid na God toe gaan en genade ontvang.',
  'Hebreërs 13:5 — God sal jou nooit begewe en jou nooit verlaat nie.',
  'Jakobus 1:5 — Wanneer jy wysheid kortkom, mag jy dit van God vra.',
  '1 Petrus 5:7 — Werp jou bekommernisse op God, want Hy sorg vir jou.',
  'Openbaring 21:4 — God sal eendag elke traan afvee en alles nuut maak.',
]

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
function drawVignette(ctx, W, H) {
  const cx = W / 2, cy = H / 2
  const r = Math.max(W, H) * 0.78
  const grad = ctx.createRadialGradient(cx, cy * 0.82, r * 0.18, cx, cy * 0.82, r)
  grad.addColorStop(0,    'rgba(0,0,0,0)')
  grad.addColorStop(0.52, 'rgba(18,9,2,0.07)')
  grad.addColorStop(0.76, 'rgba(22,10,2,0.26)')
  grad.addColorStop(1,    'rgba(28,12,2,0.52)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)
}

function drawBg(ctx, W, H, bgImg) {
  if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
    // Cover canvas — crop to fill while keeping aspect ratio, centred
    const iw = bgImg.naturalWidth, ih = bgImg.naturalHeight
    const scale = Math.max(W / iw, H / ih)
    const sw = W / scale, sh = H / scale
    const sx = (iw - sw) / 2, sy = (ih - sh) / 2
    ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, W, H)
  } else {
    // Fallback gradient while image loads
    ctx.fillStyle = '#829858'; ctx.fillRect(0, 0, W, H)
    const sun = ctx.createRadialGradient(W * 0.5, H * 0.1, 0, W * 0.5, H * 0.1, H * 0.82)
    sun.addColorStop(0, 'rgba(255,255,210,0.44)'); sun.addColorStop(1, 'rgba(80,120,40,0)')
    ctx.fillStyle = sun; ctx.fillRect(0, 0, W, H)
  }
}

function drawParticles(ctx, parts, t) {
  for (const p of parts) {
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fillStyle = t.particle; ctx.globalAlpha = p.alpha; ctx.fill(); ctx.globalAlpha = 1
  }
}

function drawFlower(ctx, x, y, r, alpha, t, tier, tick, flowerType) {
  if (tick) y = y + Math.sin(tick * 0.016 + x * 0.009) * r * 0.038
  const a = Math.min(alpha, 1)
  const img = flowerImages[(flowerType ?? 0) % flowerImages.length]
  if (!img.complete) return
  // Square top-down blooms — centred at (x, y)
  const iw = r * 2
  const ih = r * 2
  const iy = y - r
  // Warm glow halo around the flower head
  const haloR = r * 1.5
  const halo = ctx.createRadialGradient(x, y, r * 0.18, x, y, haloR)
  halo.addColorStop(0,    'rgba(255,255,215,0.42)')
  halo.addColorStop(0.45, 'rgba(255,248,185,0.18)')
  halo.addColorStop(1,    'rgba(255,240,160,0)')
  ctx.globalAlpha = a * 0.88
  ctx.fillStyle = halo
  ctx.beginPath(); ctx.arc(x, y, haloR, 0, Math.PI * 2); ctx.fill()
  ctx.globalAlpha = a
  ctx.drawImage(img, x - r, iy, iw, ih)
  ctx.globalAlpha = 1
}

function drawSeed(ctx, x, y, pulse, t, tier) {
  const tv = tier || 0
  const r = 9 + Math.sin(pulse) * 2 + tv * 1.2
  const glowR = r * 1.9
  const glow = ctx.createRadialGradient(x, y, 0, x, y, glowR)
  glow.addColorStop(0,   'rgba(255,235,0,0.75)')
  glow.addColorStop(0.45,'rgba(255,215,0,0.35)')
  glow.addColorStop(1,   'rgba(255,215,0,0)')
  ctx.beginPath(); ctx.arc(x, y, glowR, 0, Math.PI * 2)
  ctx.fillStyle = glow; ctx.globalAlpha = 0.55; ctx.fill(); ctx.globalAlpha = 1
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = '#FFE000'; ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.92)'; ctx.lineWidth = 2.5; ctx.stroke()
  ctx.beginPath(); ctx.arc(x - r * 0.28, y - r * 0.3, r * 0.32, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.82)'; ctx.fill()
}

function drawPromiseSeed(ctx, x, y, pulse, plant) {
  const r = 14 + Math.sin(pulse) * 2.5
  const halo = ctx.createRadialGradient(x, y, r, x, y, r * 5.5)
  halo.addColorStop(0, 'rgba(255,215,60,0.28)'); halo.addColorStop(1, 'rgba(255,215,60,0)')
  ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(x, y, r * 5.5, 0, Math.PI * 2); ctx.fill()
  const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 2.2)
  glow.addColorStop(0, 'rgba(255,240,120,0.55)'); glow.addColorStop(1, 'rgba(255,200,40,0)')
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, r * 2.2, 0, Math.PI * 2); ctx.fill()
  const body = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, r * 0.1, x, y, r)
  body.addColorStop(0, '#FFFDE0'); body.addColorStop(0.45, '#F8C832'); body.addColorStop(1, '#C88010')
  ctx.fillStyle = body; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  const ra = 0.55 + Math.sin(pulse * 1.8) * 0.35
  ctx.strokeStyle = `rgba(255,225,80,${ra})`; ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.arc(x, y, r + 5 + Math.sin(pulse) * 3, 0, Math.PI * 2); ctx.stroke()
  ctx.strokeStyle = `rgba(255,200,50,${ra * 0.4})`; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.arc(x, y, r + 12 + Math.sin(pulse * 0.7) * 4, 0, Math.PI * 2); ctx.stroke()
  if (plant) {
    ctx.font = `${Math.round(r * 1.25)}px serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(plant, x, y + 1)
  } else {
    ctx.beginPath(); ctx.arc(x - r * 0.28, y - r * 0.3, r * 0.3, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fill()
  }
}

function drawWeed(ctx, x, y, pulse, t, weedType) {
  const img = weedImages[(weedType ?? 0) % weedImages.length]
  const r = 46 + Math.sin(pulse * 0.7) * 2.5
  const iw = r * 2
  const ih = r * 2
  // Offset drop shadow for 3D depth
  const shadow = ctx.createRadialGradient(x + r * 0.18, y + r * 0.28, 0, x + r * 0.18, y + r * 0.28, r * 1.1)
  shadow.addColorStop(0,   'rgba(0,0,0,0.45)')
  shadow.addColorStop(0.5, 'rgba(0,0,0,0.15)')
  shadow.addColorStop(1,   'rgba(0,0,0,0)')
  ctx.fillStyle = shadow
  ctx.beginPath(); ctx.arc(x + r * 0.18, y + r * 0.28, r * 1.1, 0, Math.PI * 2); ctx.fill()
  // Subtle glow around spikes
  const glow = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 1.35)
  glow.addColorStop(0,   'rgba(180,160,120,0)')
  glow.addColorStop(0.7, 'rgba(160,140,100,0.12)')
  glow.addColorStop(1,   'rgba(120,100,60,0)')
  ctx.fillStyle = glow
  ctx.beginPath(); ctx.arc(x, y, r * 1.35, 0, Math.PI * 2); ctx.fill()
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.globalAlpha = 0.96
    ctx.drawImage(img, x - r, y - r, iw, ih)
    ctx.globalAlpha = 1
  }
}

function getPlayerStage(level) {
  if (level >= 80) return 7
  if (level >= 50) return 6
  if (level >= 35) return 5
  if (level >= 20) return 4
  if (level >= 15) return 3
  if (level >= 10) return 2
  if (level >= 5)  return 1
  return 0
}

function drawPlayer(ctx, p, tick, t, level) {
  const { x, y } = p
  const hitFrac = p.hitAnim || 0
  const r = 13 * (1 - hitFrac * 0.22)
  const stage = getPlayerStage(level || 1)
  const img = playerImages[stage]
  const spriteR = 30
  const pulse = Math.sin(tick * 0.05) * 2.5

  // Soft green trail
  for (let i = 0; i < p.trail.length; i++) {
    const tr = p.trail[i]
    const frac = (i + 1) / p.trail.length
    ctx.beginPath(); ctx.arc(tr.x, tr.y, r * 0.5 * frac, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(160,255,140,1)'; ctx.globalAlpha = 0.08 * frac; ctx.fill(); ctx.globalAlpha = 1
  }

  // Bright white outer glow
  const glowR = spriteR * 1.55 + pulse
  const glow = ctx.createRadialGradient(x, y, spriteR * 0.4, x, y, glowR)
  glow.addColorStop(0,    'rgba(255,255,255,0.65)')
  glow.addColorStop(0.38, 'rgba(220,255,200,0.28)')
  glow.addColorStop(1,    'rgba(255,255,255,0)')
  ctx.beginPath(); ctx.arc(x, y, glowR, 0, Math.PI * 2)
  ctx.fillStyle = glow; ctx.globalAlpha = 0.88; ctx.fill(); ctx.globalAlpha = 1

  // Heart sprite
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.globalAlpha = hitFrac > 0 ? 0.68 : 0.97
    ctx.drawImage(img, x - spriteR, y - spriteR, spriteR * 2, spriteR * 2)
    ctx.globalAlpha = 1
  } else {
    // Fallback circle while sprite loads
    const gw = ctx.createRadialGradient(x, y, 0, x, y, r * 2.8 + pulse)
    gw.addColorStop(0, t.playerWarm); gw.addColorStop(0.45, t.playerGlow); gw.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.beginPath(); ctx.arc(x, y, r * 2.8 + pulse, 0, Math.PI * 2)
    ctx.fillStyle = gw; ctx.globalAlpha = 0.72; ctx.fill(); ctx.globalAlpha = 1
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = t.player; ctx.fill()
  }

  // Red flash on hit
  if (hitFrac > 0) {
    ctx.beginPath(); ctx.arc(x, y, spriteR * 0.75, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(180,20,60,${hitFrac * 0.32})`; ctx.fill()
  }
}

function drawFloats(ctx, floats) {
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  for (const f of floats) {
    const prog = f.age / f.maxAge
    const alpha = f.startFull
      ? (prog > 0.72 ? Math.max(0, (1 - prog) / 0.28) : 1)
      : (prog < 0.2 ? prog / 0.2 : Math.max(0, (1 - prog) / 0.8))
    const y = f.y - prog * 52
    ctx.globalAlpha = alpha
    const fs = f.fontSize || (f.isWeed ? 16 : 15)
    ctx.font = `bold ${fs}px system-ui,sans-serif`
    const tw = ctx.measureText(f.text).width
    const pad = 10
    const cx = Math.min(Math.max(f.x, tw / 2 + pad), ctx.canvas.width - tw / 2 - pad)
    ctx.lineWidth = 5
    ctx.strokeStyle = f.isWeed ? 'rgba(0,0,0,0.58)' : 'rgba(0,0,0,0.52)'
    ctx.strokeText(f.text, cx, y)
    ctx.fillStyle = f.isWeed ? '#FF8FA8' : '#FFFFFF'
    ctx.fillText(f.text, cx, y)
  }
  ctx.restore()
}

function drawGenadeKruis(ctx, kruis, tick, playerX, playerY) {
  const { x, y, life, maxLife } = kruis
  const tier = kruis.tier || 0
  const fadeIn  = Math.min(life / 14, 1)
  const fadeOut = life > maxLife - 50 ? (maxLife - life) / 50 : 1
  const alpha   = fadeIn * fadeOut
  const pulse   = 1 + Math.sin(tick * 0.038) * 0.1
  const nearFrac = playerX != null ? Math.max(0, 1 - Math.sqrt((playerX - x) ** 2 + (playerY - y) ** 2) / 90) : 0

  ctx.save()

  // Rotating light rays at tier 2+ (L30+)
  if (tier >= 2) {
    const rayCount = 8
    const rayLen = 52 + tier * 16
    for (let i = 0; i < rayCount; i++) {
      const ang = (i / rayCount) * Math.PI * 2 + tick * 0.005
      ctx.globalAlpha = alpha * Math.min((tier - 1) * 0.22, 0.44)
      ctx.strokeStyle = 'rgba(255,248,185,0.92)'
      ctx.lineWidth = 1.5
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(x + Math.cos(ang) * 22, y + Math.sin(ang) * 22)
      ctx.lineTo(x + Math.cos(ang) * rayLen, y + Math.sin(ang) * rayLen)
      ctx.stroke()
    }
  }

  // Wide outer glow — grows with tier
  const glowR = (74 + tier * 18 + nearFrac * 26) * pulse
  const glow  = ctx.createRadialGradient(x, y, 0, x, y, glowR)
  glow.addColorStop(0,   `rgba(255,240,160,${alpha * (0.55 + tier * 0.1 + nearFrac * 0.25)})`)
  glow.addColorStop(0.45,`rgba(255,230,130,${alpha * (0.22 + tier * 0.06 + nearFrac * 0.12)})`)
  glow.addColorStop(1,   'rgba(255,230,130,0)')
  ctx.beginPath(); ctx.arc(x, y, glowR, 0, Math.PI * 2)
  ctx.fillStyle = glow; ctx.fill()

  // Bright junction glow
  const jr = 28 + nearFrac * 14 + tier * 5
  const jGlow = ctx.createRadialGradient(x, y - 10, 0, x, y - 10, jr)
  jGlow.addColorStop(0, `rgba(255,255,230,${alpha * 0.98})`)
  jGlow.addColorStop(1, 'rgba(255,255,230,0)')
  ctx.beginPath(); ctx.arc(x, y - 10, jr, 0, Math.PI * 2)
  ctx.fillStyle = jGlow; ctx.fill()

  // Cross arms — scale with tier
  const aw = 6 + tier * 1.5
  const ah = 82 + tier * 8
  const cw = 56 + tier * 7
  ctx.globalAlpha = alpha * (0.92 + nearFrac * 0.08)
  ctx.fillStyle   = `rgba(255,252,${Math.max(200, 210 - tier * 8)},0.97)`
  ctx.shadowColor = `rgba(255,240,120,${0.7 + tier * 0.06})`
  ctx.shadowBlur  = 12 + tier * 4
  ctx.fillRect(x - aw / 2, y - ah / 2 + 5, aw, ah)
  ctx.fillRect(x - cw / 2, y - aw / 2 - 9, cw, aw + 2)
  ctx.shadowBlur  = 0

  ctx.restore()
}

function drawVredekring(ctx, ring, tick) {
  const { x, y, life } = ring
  const expandDur = 90, holdDur = 30, fadeDur = 80
  const radius = Math.min(life / expandDur, 1) * 72
  let alpha
  if      (life < expandDur)                      alpha = life / expandDur
  else if (life < expandDur + holdDur)            alpha = 1
  else alpha = Math.max(0, 1 - (life - expandDur - holdDur) / fadeDur)

  ctx.save()
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius)
  grad.addColorStop(0,   `rgba(160,215,255,${alpha * 0.07})`)
  grad.addColorStop(0.7, `rgba(160,215,255,${alpha * 0.04})`)
  grad.addColorStop(1,   'rgba(160,215,255,0)')
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fillStyle = grad; ctx.fill()

  const pulse = 1 + Math.sin(tick * 0.04) * 0.04
  ctx.beginPath(); ctx.arc(x, y, radius * pulse, 0, Math.PI * 2)
  ctx.strokeStyle = `rgba(160,215,255,${alpha * 0.65})`
  ctx.lineWidth   = 2
  ctx.stroke()
  ctx.restore()
}

function drawStormOverlay(ctx, storm, W, H) {
  if (!storm || storm.overlay <= 0) return
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.08, W / 2, H / 2, H * 0.85)
  vg.addColorStop(0, `rgba(70, 95, 125, ${storm.overlay * 0.35})`)
  vg.addColorStop(1, `rgba(45, 65, 105, ${Math.min(storm.overlay * 1.35, 0.52)})`)
  ctx.fillStyle = vg
  ctx.fillRect(0, 0, W, H)
  if (storm.lightningFlash > 0) {
    const lf = Math.min(storm.lightningFlash / 22, 1)
    ctx.fillStyle = `rgba(215, 232, 255, ${lf * 0.28})`
    ctx.fillRect(0, 0, W, H)
  }
  if (storm.lightningFlash2 > 0) {
    const lf2 = Math.min(storm.lightningFlash2 / 18, 1)
    ctx.fillStyle = `rgba(200, 225, 255, ${lf2 * 0.18})`
    ctx.fillRect(0, 0, W, H)
  }
  ctx.save()
  for (const wl of storm.windLines) {
    const a = wl.alpha * Math.min(storm.overlay / 0.06, 1)
    if (a < 0.03) continue
    ctx.globalAlpha = a
    ctx.strokeStyle = 'rgba(215, 235, 255, 0.92)'
    ctx.lineWidth = wl.width
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(wl.x, wl.y)
    ctx.lineTo(wl.x + wl.len, wl.y + wl.lean)
    ctx.stroke()
  }
  if (storm.rainDrops) {
    for (const rd of storm.rainDrops) {
      const a = rd.alpha * Math.min(storm.overlay / 0.06, 1)
      if (a < 0.02) continue
      ctx.globalAlpha = a
      ctx.strokeStyle = 'rgba(190, 220, 255, 0.88)'
      ctx.lineWidth = rd.width
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(rd.x, rd.y)
      ctx.lineTo(rd.x + rd.dx * 3.5, rd.y + rd.dy * 3.5)
      ctx.stroke()
    }
  }
  ctx.restore()
}

function drawStormDrift(ctx, storm) {
  if (!storm || !storm.driftWords.length) return
  ctx.save()
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  for (const dw of storm.driftWords) {
    const prog = dw.age / dw.maxAge
    const a = prog < 0.1 ? prog / 0.1 : (prog > 0.72 ? Math.max(0, (1 - prog) / 0.28) : 1)
    ctx.globalAlpha = dw.baseAlpha * a
    ctx.font = `bold ${dw.fontSize || 19}px system-ui,sans-serif`
    ctx.lineWidth = 5
    ctx.strokeStyle = 'rgba(20, 40, 75, 0.55)'
    ctx.strokeText(dw.text, dw.x, dw.y)
    ctx.fillStyle = 'rgba(240, 245, 255, 0.97)'
    ctx.fillText(dw.text, dw.x, dw.y)
  }
  ctx.restore()
}

function fillRoundRect(ctx, x, y, w, h, r) {
  if (w <= 0) return
  const rx = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rx, y)
  ctx.arcTo(x + w, y, x + w, y + h, rx)
  ctx.arcTo(x + w, y + h, x, y + h, rx)
  ctx.arcTo(x, y + h, x, y, rx)
  ctx.arcTo(x, y, x + w, y, rx)
  ctx.closePath()
  ctx.fill()
}

function drawStormBar(ctx, storm, W, H) {
  if (!storm || storm.phase !== 'active') return
  const bar = storm.survivalBar ?? 1
  const bW = W * 0.60
  const bH = 9
  const bX = (W - bW) / 2
  const bY = H * 0.87

  ctx.save()
  // Label
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.font = 'bold 11px system-ui,sans-serif'
  ctx.shadowColor = 'rgba(0,0,0,0.55)'
  ctx.shadowBlur = 4
  ctx.fillStyle = 'rgba(255,255,255,0.88)'
  ctx.fillText('Staan vas in die waarheid', W / 2, bY - 5)
  ctx.shadowBlur = 0

  // Track
  ctx.fillStyle = 'rgba(0,0,0,0.40)'
  fillRoundRect(ctx, bX - 2, bY - 2, bW + 4, bH + 4, 6)

  // Bar — green when high, yellow→red when low
  const red   = Math.round(60 + 195 * (1 - bar))
  const green = Math.round(200 * bar + 25)
  ctx.fillStyle = `rgb(${red},${green},70)`
  fillRoundRect(ctx, bX, bY, bW * bar, bH, 5)

  // Shine stripe
  ctx.globalAlpha = 0.40
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  fillRoundRect(ctx, bX, bY, bW * bar, bH * 0.40, 5)
  ctx.globalAlpha = 1

  ctx.restore()
}

function findFloatY(floats, baseY, x) {
  let y = baseY
  for (let i = 0; i < 6; i++) {
    const clear = floats.every(ef => {
      const efCurY = ef.y - (ef.age / ef.maxAge) * 52
      return Math.abs(ef.x - x) > 92 || Math.abs(efCurY - y) > 26
    })
    if (clear) return y
    y -= 30
  }
  return y
}

function loadSave() { try { return JSON.parse(localStorage.getItem('vredepad_data') || '{}') } catch { return {} } }
function saveSave(d) { try { localStorage.setItem('vredepad_data', JSON.stringify(d)) } catch {} }

function updateStreak(save) {
  const today = new Date().toISOString().slice(0, 10)
  const days  = save.playedDays || []
  if (days[0] === today) return save
  const newDays = [today, ...days].slice(0, 60)
  let streak = 1
  for (let i = 1; i < newDays.length; i++) {
    const expected = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    if (newDays[i] === expected) streak++
    else break
  }
  return { ...save, playedDays: newDays, streak }
}

export default function Vredepad({ onClose }) {
  const canvasRef    = useRef(null)
  const gameRef      = useRef(null)
  const rafRef       = useRef(null)
  const touchRef     = useRef({ x: 0, y: 0 })
  const pendingLevel = useRef(1)
  const isReplayRef  = useRef(false)

  const [screen, setScreen]         = useState('intro')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [soundOn, setSoundOn]       = useState(() => !isMuted())
  const [combo, setCombo]           = useState(0)
  const [bonusFlash, setBonusFlash] = useState(false)
  const [countdown, setCountdown]   = useState(3)
  const [displayScore, setScore]    = useState(0)
  const [displayTime, setTime]      = useState(60)
  const [seedBubble, setSeedBubble] = useState(null)
  const [genadeFlash, setGenadeFlash] = useState('')
  const [stormAnnounce, setStormAnnounce] = useState(null)
  const [lastTruthText, setLastTruthText] = useState('')
  const [tutorialActive, setTutorialActive] = useState(false)
  const [promiseMoment, setPromiseMoment] = useState(null)
  const [gardenVerse, setGardenVerse] = useState(null)
  const [endData, setEndData]       = useState(null)
  const [bestScore, setBest]        = useState(() => loadSave().best || 0)
  const [bookPdfs, setBookPdfs]     = useState({})
  const [leaderboard, setLeaderboard]         = useState([])
  const [myUid, setMyUid]                     = useState(null)
  const [showNameConsent, setShowNameConsent] = useState(false)
  const [consentName, setConsentName]         = useState('')
  const [consentChecked, setConsentChecked]   = useState(false)
  const [consentError, setConsentError]       = useState('')
  const [lbCelebration, setLbCelebration]     = useState(null)
  const [weeklyLb, setWeeklyLb]               = useState([])
  const [lbTab, setLbTab]                     = useState('week')
  const [gameMinScore, setGameMinScore]        = useState(10)
  const anonUidRef = useRef(null)
  const pendingLbRef = useRef(null)

  useEffect(() => {
    getDocs(collection(db, 'books')).then(snap => {
      const pdfs = {}
      snap.docs.forEach(d => {
        const data = d.data()
        if (!data.pdfUrl) return
        pdfs[d.id] = data.pdfUrl
        if (data.title) {
          const slug = data.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
          if (!pdfs[slug]) pdfs[slug] = data.pdfUrl
        }
      })
      setBookPdfs(pdfs)
    }).catch(() => {})

    getDocs(collection(db, 'leaderboard')).then(snap => {
      const all = snap.docs.map(d => ({ userId: d.id, ...d.data() }))
      setLeaderboard(sortLeaderboard(all))
      const weekAgo = Date.now() / 1000 - 7 * 24 * 3600
      setWeeklyLb(sortLeaderboard(all.filter(e => (e.updatedAt?.seconds ?? e.createdAt?.seconds ?? 0) > weekAgo)))
    }).catch(() => {})

    getOrCreateAnonUid().then(uid => {
      anonUidRef.current = uid
      setMyUid(uid)
    }).catch(() => {})
  }, [])

  // ── Countdown ──
  useEffect(() => {
    if (screen !== 'countdown') return
    if (countdown <= 0) { setScreen('playing'); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [screen, countdown])

  // ── Stil Oomblik → Vers Oomblik ──
  useEffect(() => {
    if (screen !== 'stiloomblik') return
    const t = setTimeout(() => setScreen('versmoment'), 2800)
    return () => clearTimeout(t)
  }, [screen])

  // ── Tutorial auto-dismiss (fallback if Begin Speel not tapped) ──
  useEffect(() => {
    if (!tutorialActive) return
    const t = setTimeout(dismissTutorial, 14000)
    return () => clearTimeout(t)
  }, [tutorialActive])

  function buildGame(level, W, H) {
    const t  = THEMES[(level - 1) % THEMES.length]
    const bgIdx = Math.floor((loadSave().totalLevels || 0) / 5) % 15
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
        type: Math.floor(Math.random() * weedImages.length),
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
      })

    const lvlTierBuild = Math.floor((level - 1) / 10)
    const parts = Array.from({ length: Math.min(20 + lvlTierBuild * 8, 52) }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 2 + Math.random() * 3,
      dx: (Math.random() - 0.5) * 0.22,
      dy: -0.1 - Math.random() * 0.22,
      alpha: 0.07 + Math.random() * 0.18,
    }))

    gameRef.current = {
      W, H, t, level,
      player: { x: W / 2, y: H / 2, dx: 0, dy: 0, sp, trail: [], hitAnim: 0 },
      seeds, weeds, parts,
      flowers: [], floats: [],
      score: 0, timeLeft: 60,
      tick: 0, lastTime: null,
      hitCooldown: 0,
      truths, truthIdx: 0,
      collectedTruths: [],
      bgFlash: 0, hitFlash: 0,
      justHit: false,
      combo: 0, comboLastTick: 0,
      truthStreak: 0,
      genadeKruis: null, genadeUsed: false, genadeActive: 0,
      weedHitsRound: 0, vredekring: null, vredekringUsed: false,
      storm: null, stormUsed: false, stormBeaten: false,
      promiseSeed: null, promiseSeedSpawned: false, promisePause: 0,
      gardenMode: false, gardenTime: 0,
      bgIdx,
    }
    setGameMinScore(minScoreForLevel(level))
  }

  async function checkAndUpdateLeaderboard(lbLevel, lbScore) {
    if (!anonUidRef.current) return
    const uid = anonUidRef.current
    const alreadyAsked = localStorage.getItem('vp_lb_submitted') === '1'
    try {
      const snap = await getDocs(collection(db, 'leaderboard'))
      const all  = snap.docs.map(d => ({ userId: d.id, ...d.data() }))
      const sorted = sortLeaderboard(all)
      setLeaderboard(sorted)

      const existing = all.find(e => e.userId === uid)
      if (existing) {
        const improved = lbLevel > existing.level ||
          (lbLevel === existing.level && lbScore > existing.score)
        if (!improved) return
        await setDoc(doc(db, 'leaderboard', uid), {
          displayName: existing.displayName, level: lbLevel,
          score: lbScore, consent: true, updatedAt: serverTimestamp()
        }, { merge: true })
        const s2   = await getDocs(collection(db, 'leaderboard'))
        const all2 = s2.docs.map(d => ({ userId: d.id, ...d.data() }))
        const sorted2 = sortLeaderboard(all2)
        setLeaderboard(sorted2)
        const wa2 = Date.now() / 1000 - 7 * 24 * 3600
        setWeeklyLb(sortLeaderboard(all2.filter(e => (e.updatedAt?.seconds ?? e.createdAt?.seconds ?? 0) > wa2)))
        const rank = sorted2.findIndex(e => e.userId === uid) + 1
        if (rank > 0) setLbCelebration({ rank, isNew: false, level: lbLevel, score: lbScore })
        return
      }

      const last = sorted[sorted.length - 1]
      const qualifies = sorted.length < 10 ||
        lbLevel > last.level ||
        (lbLevel === last.level && lbScore > last.score)
      if (qualifies && !alreadyAsked) {
        pendingLbRef.current = { level: lbLevel, score: lbScore }
        setShowNameConsent(true)
      }
    } catch {
      if (!alreadyAsked) {
        pendingLbRef.current = { level: lbLevel, score: lbScore }
        setShowNameConsent(true)
      }
    }
  }

  async function submitLeaderboardEntry(isAnonymous) {
    if (!anonUidRef.current || !pendingLbRef.current) return
    if (!isAnonymous) {
      const err = validateDisplayName(consentName)
      if (err) { setConsentError(err); return }
      if (!consentChecked) { setConsentError('Merk asseblief die toestemmingsblokkie.'); return }
    }
    const displayName = isAnonymous ? 'Anonieme Speler' : consentName.trim()
    try {
      await setDoc(doc(db, 'leaderboard', anonUidRef.current), {
        displayName, level: pendingLbRef.current.level, score: pendingLbRef.current.score,
        consent: true, createdAt: serverTimestamp(), updatedAt: serverTimestamp()
      })
      localStorage.setItem('vp_lb_submitted', '1')
      const snap = await getDocs(collection(db, 'leaderboard'))
      const all  = snap.docs.map(d => ({ userId: d.id, ...d.data() }))
      const sorted = sortLeaderboard(all)
      setLeaderboard(sorted)
      const wa3 = Date.now() / 1000 - 7 * 24 * 3600
      setWeeklyLb(sortLeaderboard(all.filter(e => (e.updatedAt?.seconds ?? e.createdAt?.seconds ?? 0) > wa3)))
      const rank = sorted.findIndex(e => e.userId === anonUidRef.current) + 1
      setShowNameConsent(false)
      setConsentName(''); setConsentChecked(false); setConsentError('')
      setLbCelebration({ rank: rank > 0 ? rank : 10, isNew: true,
        level: pendingLbRef.current.level, score: pendingLbRef.current.score })
      pendingLbRef.current = null
    } catch {
      setConsentError('Iets het skeef gegaan. Probeer asseblief weer.')
    }
  }

  function endLevel(g, skipStiloomblik = false) {
    const save  = updateStreak(loadSave())
    const today = new Date().toISOString().slice(0, 10)
    const nb    = Math.max(save.best || 0, g.score)
    const lastTruth = g.collectedTruths.length > 0
      ? g.collectedTruths[Math.floor(Math.random() * g.collectedTruths.length)]
      : g.truths[0]
    const endTitle = g.stormBeaten
      ? 'Jy het die storm deurstaan.'
      : g.score >= 18
        ? 'Jy het diep in die waarheid gewandel.'
        : g.score >= 9
          ? 'Jy het plek gemaak vir vrede.'
          : 'Elke tree op die pad tel.'

    stopAmbient()
    playLevelComplete()
    haptic([50, 30, 80])

    const collected   = [...g.collectedTruths]
    const isNewRecord = g.score > (save.best || 0)
    const minScore    = minScoreForLevel(g.level)
    const attemptKey  = `vp_attempts_${g.level}`
    const attempts    = parseInt(localStorage.getItem(attemptKey) || '0')
    const passed      = g.score >= minScore || isReplayRef.current || attempts >= 2

    if (!isReplayRef.current) {
      if (passed) {
        localStorage.removeItem(attemptKey)
        const newLevel = (save.level || 1) + 1
        const oldTotal = save.totalLevels || 0
        const newTotal = oldTotal + 1
        let newUnlock = null
        if (oldTotal < 7   && newTotal >= 7)   newUnlock = MILESTONE_BOOKS[0]
        if (oldTotal < 20  && newTotal >= 20)  newUnlock = MILESTONE_BOOKS[1]
        if (oldTotal < 50  && newTotal >= 50)  newUnlock = MILESTONE_BOOKS[2]
        if (oldTotal < 120 && newTotal >= 120) newUnlock = MILESTONE_BOOKS[3]
        const newTotalScore = (save.totalScore || 0) + g.score
        saveSave({ ...save, level: newLevel, totalLevels: newTotal, totalScore: newTotalScore, lastDay: today, best: nb })
        setBest(nb)
        setEndData({ score: g.score, level: g.level, bestScore: nb, lastTruth, streak: save.streak || 1, collected, isNewRecord, newUnlock, totalScore: newTotalScore, endTitle, minScore, failed: false })
        checkAndUpdateLeaderboard(newTotal, newTotalScore).catch(() => {})
      } else {
        localStorage.setItem(attemptKey, String(attempts + 1))
        saveSave({ ...save, ...(nb > (save.best || 0) ? { best: nb } : {}) })
        if (nb > (save.best || 0)) setBest(nb)
        setEndData({ score: g.score, level: g.level, bestScore: nb, lastTruth, streak: save.streak || 1, collected, isNewRecord: false, newUnlock: null, totalScore: save.totalScore || 0, endTitle, minScore, failed: true, attemptsLeft: 2 - attempts })
      }
    } else {
      saveSave({ ...save, ...(nb > (save.best || 0) ? { best: nb } : {}) })
      if (nb > (save.best || 0)) setBest(nb)
      setEndData({ score: g.score, level: g.level, bestScore: nb, lastTruth, streak: save.streak || 1, collected, isNewRecord, newUnlock: null, totalScore: save.totalScore || 0, endTitle, minScore, failed: false })
    }
    setCombo(0)
    setLastTruthText('')
    setGardenVerse(null)
    setScreen(skipStiloomblik ? 'levelup' : 'stiloomblik')
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
      if (!localStorage.getItem('vp_tutorial_done')) {
        setTutorialActive(true)
      }
      startAmbient()

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

      // Belofte-saad pause countdown
      if (g.promisePause > 0) {
        g.promisePause -= dt
        if (g.promisePause <= 0) { g.promisePause = 0; setPromiseMoment(null) }
      }

      const p = g.player
      if (p.hitAnim > 0) p.hitAnim = Math.max(0, p.hitAnim - dt / 60)

      if (!g.promisePause) {

      if (!g.gardenMode) {
        g.timeLeft -= dt / 60
        if (g.timeLeft <= 0) {
          g.timeLeft = 0; g.gardenMode = true; g.gardenTime = 0
          g.seeds = []; g.weeds = []; g.storm = null; g.genadeKruis = null; g.promiseSeed = null
          p.trail = []; p.dx = 0; p.dy = 0
          g._gardenVerse = g.collectedTruths.length > 0
            ? g.collectedTruths[Math.floor(Math.random() * g.collectedTruths.length)]
            : g.truths[0]
          g._verseShown = false
        }
      }
      if (p.dx !== 0 || p.dy !== 0) {
        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > 14) p.trail.shift()
        const len = Math.sqrt(p.dx ** 2 + p.dy ** 2)
        const sp = g.justHit ? p.sp * 0.42 : p.sp * (1 - p.hitAnim * 0.3)
        p.x = wrapVal(p.x + (p.dx / len) * sp * dt, g.W)
        p.y = wrapVal(p.y + (p.dy / len) * sp * dt, g.H)
      } else {
        if (p.trail.length > 0) p.trail.shift()
      }

      for (const s of g.seeds) s.pulse += 0.05 * dt
      const weedSpd = g.genadeActive > 0 ? 0.22 : (g.storm?.phase === 'active' ? 1.38 + (g.storm.tier || 0) * 0.18 : 1)
      for (const w of g.weeds) {
        w.pulse += 0.04 * dt
        w.x = wrapVal(w.x + w.dx * dt * weedSpd, g.W)
        w.y = wrapVal(w.y + w.dy * dt * weedSpd, g.H)
      }

      // Genade-Kruis
      if (g.genadeActive > 0) {
        g.genadeActive -= dt
        if (g.genadeActive <= 0) {
          g.genadeActive = 0
          // Reset pushed weed velocities so they don't fly at full speed after grace expires
          for (const w of g.weeds) {
            w.dx = (Math.random() - 0.5) * 0.4
            w.dy = (Math.random() - 0.5) * 0.4
          }
        }
      }
      if (g.genadeKruis) {
        g.genadeKruis.life += dt
        if (g.genadeKruis.life > g.genadeKruis.maxLife) {
          g.genadeKruis = null
        } else if (d2(p, g.genadeKruis) < 42) {
          const kTier = g.genadeKruis.tier || 0
          g.genadeKruis = null
          g.justHit = false
          p.hitAnim = 0
          g.bgFlash = 20
          g.floats = []

          if (kTier === 0) {
            // L1-19: Teleport weeds far away, brief slow
            for (const w of g.weeds) {
              const pos = freePos(g.W, g.H, [p, ...g.seeds], 150)
              w.x = pos.x; w.y = pos.y
            }
            g.genadeActive = 300
          } else if (kTier === 1) {
            // L20-29: Push — weeds burst outward at high speed
            for (const w of g.weeds) {
              const ang = Math.atan2(w.y - p.y, w.x - p.x)
              const force = 2.8 + 110 / Math.max(18, d2(w, p))
              w.dx = Math.cos(ang) * force
              w.dy = Math.sin(ang) * force
            }
            g.genadeActive = 320
          } else if (kTier === 2) {
            // L30-39: Consume nearby (→ flowers), push distant weeds
            const consumeR = 195
            g.weeds = g.weeds.filter(w => {
              if (d2(w, p) <= consumeR) {
                g.flowers.push({ x: w.x, y: w.y, life: 0, r: 22, tier: Math.floor((g.level - 1) / 10), type: Math.floor(Math.random() * flowerImages.length) })
                return false
              }
              const ang = Math.atan2(w.y - p.y, w.x - p.x)
              const force = 1.8 + 70 / Math.max(18, d2(w, p))
              w.dx = Math.cos(ang) * force
              w.dy = Math.sin(ang) * force
              return true
            })
            g.genadeActive = 360
          } else {
            // L40+: Consume all within large radius, max slow
            g.weeds = g.weeds.filter(w => {
              if (d2(w, p) <= 270) {
                g.flowers.push({ x: w.x, y: w.y, life: 0, r: 26, tier: Math.floor((g.level - 1) / 10), type: Math.floor(Math.random() * flowerImages.length) })
                return false
              }
              return true
            })
            g.genadeActive = 460
          }

          const genadeTruths = ['God is naby.', 'Jy is veilig.', 'Vrede is moontlik.', 'Genade is hier.', 'Hy hou jou vas.']
          const gt = genadeTruths[Math.floor(Math.random() * genadeTruths.length)]
          g.floats.push({ id: g.tick + 200, x: g.W / 2, y: g.H * 0.42, text: gt, age: 0, maxAge: 260, isWeed: false, startFull: true, fontSize: 20 })
          g.score += 100; setScore(g.score)
          haptic([35, 25, 35, 25, 70])
          const flashMsgs = ['✦ Genade Oomblik ✦', '✦ Gedagtes Weggestoot ✦', '✦ Waarheid Verslind Twyfel ✦', '✦ Vrede Oorwin Alles ✦']
          setGenadeFlash(flashMsgs[Math.min(kTier, 3)])
          setTimeout(() => setGenadeFlash(''), 2600)
        }
      }

      // Vredekring
      if (g.vredekring) {
        g.vredekring.life += dt
        if (!g.vredekring.healed && g.vredekring.life >= 90) {
          g.vredekring.healed = true
          g.justHit = false
          p.hitAnim = 0
          g.floats.push({ id: g.tick + 300, x: g.vredekring.x, y: g.vredekring.y - 35,
            text: 'Haal asem. Kom terug na vrede.', age: 0, maxAge: 200, isWeed: false })
        }
        if (g.vredekring.life > 200) g.vredekring = null
      }

      // Storm van Gedagtes — level 10+, triggers at score 10 (and again at L30+ after first clears)
      const stormTriggerScore = g.storm2Trigger || 10
      if (!g.stormUsed && g.level >= 10 && g.score >= stormTriggerScore && !g.storm && !g.genadeKruis && g.genadeActive <= 0) {
        const extras = []
        for (let i = 0; i < 2; i++) {
          if (g.weeds.length + extras.length < 8) {
            extras.push({
              ...freePos(g.W, g.H, [...g.seeds, ...g.weeds, ...extras, p], 70),
              pulse: Math.random() * Math.PI * 2,
              dx: (Math.random() - 0.5) * 0.55,
              dy: (Math.random() - 0.5) * 0.55,
              isStorm: true,
            })
          }
        }
        g.weeds = [...g.weeds, ...extras]
        const stormTier = Math.max(0, Math.floor((g.level - 20) / 10))
        const stormLineCount = Math.min(55 + stormTier * 18, 110)
        g.storm = {
          phase: 'building', life: 0,
          tier: stormTier,
          overlay: 0, truthsThisStorm: 0, needed: 4 + stormTier,
          windLines: Array.from({ length: stormLineCount }, () => ({
            x: Math.random() * g.W,
            y: 20 + Math.random() * (g.H - 40),
            len: 55 + Math.random() * 90,
            lean: (Math.random() - 0.2) * 22,
            dx: (1.8 + stormTier * 0.4) + Math.random() * (1.5 + stormTier * 0.25),
            alpha: 0.38 + Math.random() * 0.42,
            width: 0.7 + Math.random() * 1.3,
          })),
          rainDrops: Array.from({ length: Math.min(90 + stormTier * 35, 180) }, () => ({
            x: Math.random() * g.W,
            y: Math.random() * g.H,
            dx: (2.4 + stormTier * 0.5) + Math.random() * 1.4,
            dy: 3.8 + Math.random() * 3.0,
            alpha: 0.10 + Math.random() * 0.22,
            width: 0.4 + Math.random() * 0.7,
          })),
          driftWords: [],
          nextDrift: g.tick + 30,
          lightningFlash: 0,
          lightningTimer: 50 + Math.random() * 55,
          lightningFlash2: 0,
          survivalBar: 1.0,
        }
        g.stormUsed = true
        setStormAnnounce("'n Storm van gedagtes kom…")
        setTimeout(() => setStormAnnounce(null), 4200)
      }

      if (g.storm) {
        const st = g.storm
        st.life += dt
        if (st.phase === 'building') {
          const maxOverlay = 0.38 + (st.tier || 0) * 0.07
          st.overlay = Math.min(st.life / 120, 1) * maxOverlay
          for (const wl of st.windLines) {
            wl.x += wl.dx * dt * Math.min(st.life / 60, 1)
            if (wl.x > g.W + 100) wl.x = -100 - wl.len
          }
          if (st.life >= 150) { st.phase = 'active'; st.life = 0 }
        } else if (st.phase === 'active') {
          const maxOv = 0.38 + (st.tier || 0) * 0.07
          const target = Math.max(0.08, maxOv - st.truthsThisStorm * 0.07)
          st.overlay += (target - st.overlay) * 0.035 * dt
          for (const wl of st.windLines) {
            wl.x += wl.dx * dt
            if (wl.x > g.W + 100) wl.x = -100 - wl.len
          }
          if (g.tick >= st.nextDrift && st.driftWords.length < 4) {
            st.driftWords.push({
              x: -30, y: 70 + Math.random() * (g.H - 140),
              text: STORM_DRIFT_WORDS[Math.floor(Math.random() * STORM_DRIFT_WORDS.length)],
              dx: 0.30 + Math.random() * 0.28, dy: -(0.04 + Math.random() * 0.10),
              age: 0, maxAge: 320 + Math.random() * 80,
              baseAlpha: 0.60 + Math.random() * 0.25,
              fontSize: 15 + Math.floor(Math.random() * 11),
            })
            st.nextDrift = g.tick + 38 + Math.random() * 45
          }
          for (const dw of st.driftWords) { dw.x += dw.dx * dt; dw.y += dw.dy * dt; dw.age += dt }
          st.driftWords = st.driftWords.filter(dw => dw.age < dw.maxAge && dw.x < g.W + 80)
          // Rain drops movement
          for (const rd of (st.rainDrops || [])) {
            rd.x += rd.dx * dt; rd.y += rd.dy * dt
            if (rd.x > g.W + 20 || rd.y > g.H + 20) { rd.x = Math.random() * g.W - 30; rd.y = -12 }
          }
          // Lightning — main flash + quick second flicker
          if (st.lightningFlash  > 0) st.lightningFlash  -= dt * 2.0
          if (st.lightningFlash2 > 0) st.lightningFlash2 -= dt * 3.5
          st.lightningTimer -= dt
          if (st.lightningTimer <= 0) {
            st.lightningFlash  = 30
            st.lightningFlash2 = 0
            st.lightningTimer  = 45 + Math.random() * 65
            // Schedule a second flicker ~12 ticks later
            setTimeout(() => { if (st.lightningFlash < 5) st.lightningFlash2 = 18 }, 200)
          }
          // Drain survival bar; weed hits also drain (handled in weed section below)
          st.survivalBar = Math.max(0, (st.survivalBar ?? 1) - STORM_BAR_DRAIN * dt)
          if (st.survivalBar <= 0) {
            st.phase = 'breaking'; st.life = 0; st.driftWords = []
            g.weeds = g.weeds.filter(w => !w.isStorm)
            g.bgFlash = 8
            g.timeLeft = Math.max(g.timeLeft - 5, 5)
            setStormAnnounce('Die storm het jou oorweldig.')
            setTimeout(() => setStormAnnounce(null), 4200)
          } else if (st.truthsThisStorm >= st.needed || st.life > 720 + (st.tier || 0) * 120) {
            st.phase = 'breaking'; st.life = 0; st.driftWords = []
            g.weeds = g.weeds.filter(w => !w.isStorm)
            g.justHit = false; p.hitAnim = 0
            g.bgFlash = 16
            g.timeLeft = Math.min(g.timeLeft + 8, 90)
            g.score += 150; setScore(g.score)
            g.stormBeaten = true
            haptic([20, 15, 20, 15, 60])
            setStormAnnounce('Die storm gaan verby.')
            setTimeout(() => setStormAnnounce(null), 4200)
          }
        } else if (st.phase === 'breaking') {
          st.overlay = Math.max(0, st.overlay - 0.004 * dt)
          for (const wl of st.windLines) wl.alpha = Math.max(0, wl.alpha - 0.01 * dt)
          if (st.life >= 260) {
            g.storm = null
            // Allow a second storm at L30+ — triggers 25 points after current score
            if (g.level >= 30 && !g.storm2Used) {
              g.stormUsed = false
              g.storm2Trigger = g.score + 25
              g.storm2Used = true
            }
          }
        }
      }

      for (const pt of g.parts) {
        pt.x = wrapVal(pt.x + pt.dx * dt, g.W)
        pt.y += pt.dy * dt
        if (pt.y < -10) { pt.y = g.H + 5; pt.x = Math.random() * g.W }
      }

      // Reset combo if no collection in ~3 seconds
      if (g.combo > 0 && (g.tick - g.comboLastTick) > 200) {
        g.combo = 0; setCombo(0)
      }

      g.seeds = g.seeds.filter(s => {
        if (d2(p, s) < 22) {
          g.score++
          g.flowers.push({ x: s.x, y: s.y, life: 0, r: 22, tier: Math.floor((g.level - 1) / 10), type: Math.floor(Math.random() * flowerImages.length) })
          const truth = g.truths[g.truthIdx % g.truths.length]
          g.collectedTruths.push(truth)
          g.truthIdx++

          const gap = g.tick - g.comboLastTick
          g.combo = gap < 200 ? g.combo + 1 : 1
          g.comboLastTick = g.tick
          setCombo(g.combo)

          if ([5, 10, 15, 20, 25].includes(g.combo)) {
            g.timeLeft = Math.min(g.timeLeft + 5, 90)
            setBonusFlash(true)
            setTimeout(() => setBonusFlash(false), 1800)
          }

          if (g.storm?.phase === 'active') {
            g.storm.truthsThisStorm++
            g.storm.survivalBar = Math.min(1, (g.storm.survivalBar ?? 1) + STORM_BAR_TRUTH)
          }
          const floatText = g.justHit
            ? RECOVERY_TRUTHS[Math.floor(Math.random() * RECOVERY_TRUTHS.length)]
            : g.storm?.phase === 'active'
              ? STORM_TRUTHS[Math.floor(Math.random() * STORM_TRUTHS.length)]
              : SHORT_TRUTHS[Math.floor(Math.random() * SHORT_TRUTHS.length)]
          g.justHit = false
          g.floats.push({ id: g.tick + g.score, x: s.x, y: findFloatY(g.floats, s.y - 8, s.x), text: floatText, age: 0, maxAge: 280, isWeed: false })
          g.bgFlash = 6
          setLastTruthText(floatText)
          haptic(35)
          g.truthStreak++
          if (g.truthStreak >= 7 && !g.genadeKruis && !g.genadeUsed && !g.storm) {
            const pos = freePos(g.W, g.H, [...g.seeds, ...g.weeds, p], 80)
            g.genadeKruis = { x: pos.x, y: pos.y, life: 0, maxLife: 360, tier: Math.max(0, Math.floor((g.level - 20) / 10)) }
            g.genadeUsed  = true
            g.truthStreak = 0
          }
          playCollect(g.score - 1, g.combo)
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
      if (g.hitFlash   > 0) g.hitFlash   -= dt

      if (g.hitCooldown <= 0) {
        for (const w of g.weeds) {
          if (d2(p, w) < 27) {
            g.combo = 0; setCombo(0)
            g.hitCooldown = 75
            g.hitFlash = 14
            p.hitAnim = 1.0
            g.justHit = true
            g.truthStreak = 0
            g.weedHitsRound++
            g.score = Math.max(0, g.score - 3); setScore(g.score)
            if (g.storm?.phase === 'active') g.storm.survivalBar = Math.max(0, (g.storm.survivalBar ?? 1) - STORM_BAR_WEED)
            const ww = WEED_WORDS[Math.floor(Math.random() * WEED_WORDS.length)]
            g.floats.push({ id: g.tick + Math.random(), x: w.x, y: findFloatY(g.floats, w.y - 10, w.x), text: ww, age: 0, maxAge: 190, isWeed: true })
            haptic([55, 20, 55])
            if (g.weedHitsRound >= 3 && !g.vredekring && !g.vredekringUsed) {
              g.vredekring     = { x: p.x, y: p.y, life: 0, healed: false }
              g.vredekringUsed = true
              g.weedHitsRound  = 0
            }
            playHit()
            break
          }
        }
      }

      // Belofte-saad: spawn once after 15s, outside storm
      if (!g.promiseSeedSpawned && g.timeLeft < 45 && !g.storm && g.genadeActive <= 0) {
        g.promiseSeedSpawned = true
        const bp = freePos(g.W, g.H, [...g.seeds, ...g.weeds, p], 70)
        const plant = PROMISE_PLANTS[Math.floor((g.level - 1) / 10) % PROMISE_PLANTS.length]
        g.promiseSeed = { x: bp.x, y: bp.y, dx: (Math.random() - 0.5) * 0.5, dy: (Math.random() - 0.5) * 0.5, pulse: 0, truth: g.truths[(g.truthIdx + 3) % g.truths.length], plant }
      }
      if (g.promiseSeed) {
        const ps = g.promiseSeed
        ps.x = wrapVal(ps.x + ps.dx * dt, g.W)
        ps.y = wrapVal(ps.y + ps.dy * dt, g.H)
        ps.pulse += 0.05 * dt
        if (d2(p, ps) < 28) {
          g.score++
          g.flowers.push({ x: ps.x, y: ps.y, life: 0, r: 28, tier: Math.floor((g.level - 1) / 10), type: Math.floor(Math.random() * flowerImages.length) })
          g.flowers.push({ x: ps.x, y: ps.y, life: 0, r: 32, tier: Math.floor((g.level - 1) / 10), type: Math.floor(Math.random() * flowerImages.length) })
          const bt = ps.truth
          g.promiseSeed = null
          g.promisePause = 330
          setPromiseMoment(bt)
          haptic([30, 20, 30, 20, 30, 20, 80])
        }
      }

      } // end if (!g.promisePause)

      // Garden moment — fill canvas with flowers, then end level
      if (g.gardenMode) {
        g.gardenTime += dt
        if (g.flowers.length < 55 && Math.random() < 0.38) {
          g.flowers.push({
            x: 14 + Math.random() * (g.W - 28),
            y: 14 + Math.random() * (g.H - 28),
            life: 0, r: 22 + Math.random() * 18,
            tier: Math.floor((g.level - 1) / 10),
            type: Math.floor(Math.random() * flowerImages.length)
          })
        }
        if (g.gardenTime >= 90 && !g._verseShown) {
          g._verseShown = true
          setGardenVerse(g._gardenVerse)
        }
        if (g.gardenTime >= 270) { endLevel(g, true); return }
      }

      g.floats = g.floats.filter(f => { f.age += dt; return f.age < f.maxAge })

      // Flowers grow to full size (60 frames) then stay permanently
      for (const f of g.flowers) {
        if (f.life < 60) f.life += dt
      }
      if (!g.gardenMode && g.flowers.length > 60) g.flowers.splice(0, g.flowers.length - 60)

      setScore(g.score)
      setTime(Math.ceil(g.timeLeft))

      const ctx = canvas.getContext('2d')
      drawBg(ctx, g.W, g.H, bgImages[g.bgIdx ?? 0])
      if (g.storm) drawStormOverlay(ctx, g.storm, g.W, g.H)
      if (g.hitFlash > 0) {
        ctx.fillStyle = 'rgba(50,15,70,0.22)'; ctx.globalAlpha = g.hitFlash / 14
        ctx.fillRect(0, 0, g.W, g.H); ctx.globalAlpha = 1
      }
      if (g.justHit) {
        ctx.fillStyle = 'rgba(30,10,55,0.30)'
        ctx.fillRect(0, 0, g.W, g.H)
      }
      if (g.bgFlash > 0) {
        ctx.fillStyle = 'rgba(255,220,80,0.12)'; ctx.globalAlpha = g.bgFlash / 6
        ctx.fillRect(0, 0, g.W, g.H); ctx.globalAlpha = 1
      }
      drawParticles(ctx, g.parts, g.t)
      if (g.vredekring) drawVredekring(ctx, g.vredekring, g.tick)
      const lvlTier = Math.floor((g.level - 1) / 10)
      for (const f of g.flowers) {
        const growFrac = Math.min(f.life / 60, 1)
        drawFlower(ctx, f.x, f.y, f.r * (1 + growFrac * 0.8), growFrac, g.t, f.tier || 0, !g.gardenMode && f.life >= 60 ? g.tick : 0, f.type)
        if (f.life < 28) {
          const bp = f.life / 28
          const bRing = 6 + bp * (36 + (f.tier || 0) * 12)
          ctx.beginPath()
          ctx.arc(f.x, f.y, bRing, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(255,215,0,${(1 - bp) * 0.9})`
          ctx.lineWidth = 3 - bp * 2
          ctx.stroke()
        }
      }
      if (!g.gardenMode) {
        if (g.genadeKruis) drawGenadeKruis(ctx, g.genadeKruis, g.tick, p.x, p.y)
        for (const s of g.seeds) drawSeed(ctx, s.x, s.y, s.pulse, g.t, lvlTier)
        if (g.promiseSeed) drawPromiseSeed(ctx, g.promiseSeed.x, g.promiseSeed.y, g.promiseSeed.pulse, g.promiseSeed.plant)
        for (const w of g.weeds) drawWeed(ctx, w.x, w.y, w.pulse, g.t, w.type)
        drawPlayer(ctx, p, g.tick, g.t, g.level)
        if (g.genadeActive > 0) {
          const gFrac = Math.min(g.genadeActive / 300, 1)
          const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 55)
          gr.addColorStop(0, `rgba(255,240,180,${gFrac * 0.45})`)
          gr.addColorStop(1, 'rgba(255,240,180,0)')
          ctx.beginPath(); ctx.arc(p.x, p.y, 55, 0, Math.PI * 2)
          ctx.fillStyle = gr; ctx.fill()
        }
        if (g.storm) {
          drawStormBar(ctx, g.storm, g.W, g.H)
          drawStormDrift(ctx, g.storm)
        }
      }
      drawFloats(ctx, g.floats)
      drawVignette(ctx, g.W, g.H)

      rafRef.current = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(initRafId)
      cancelAnimationFrame(rafRef.current)
      ro?.disconnect()
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup',   onKeyUp)
      stopAmbient()
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
    setShowNameConsent(false); setLbCelebration(null)
    pendingLevel.current = loadSave().level || 1
    isReplayRef.current  = false
    setCountdown(3)
    setScreen('countdown')
  }

  function replayLevel() {
    cancelAnimationFrame(rafRef.current)
    setShowNameConsent(false); setLbCelebration(null)
    pendingLevel.current = endData?.level || 1
    isReplayRef.current  = true
    setCountdown(3)
    setScreen('countdown')
  }

  function retryLevel() {
    cancelAnimationFrame(rafRef.current)
    setShowNameConsent(false); setLbCelebration(null)
    pendingLevel.current = endData?.level || 1
    isReplayRef.current  = false
    setCountdown(3)
    setScreen('countdown')
  }

  function buildShareCanvas(d) {
    const W = 420, H = 340, SC = 2
    const cv = document.createElement('canvas')
    cv.width = W * SC; cv.height = H * SC
    const ctx = cv.getContext('2d')
    ctx.scale(SC, SC)
    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0, '#162a1e'); bg.addColorStop(1, '#1f3d2a')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)
    // Centre glow behind verse
    const glow = ctx.createRadialGradient(W/2, H*0.45, 0, W/2, H*0.45, W*0.52)
    glow.addColorStop(0, 'rgba(255,220,80,0.12)'); glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H)
    // Top label
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,224,100,0.45)'
    ctx.font = '10px sans-serif'
    ctx.fillText('DAAGLIKSE HOOP', W/2, 26)
    // Divider
    ctx.strokeStyle = 'rgba(255,224,100,0.15)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(W/2 - 40, 34); ctx.lineTo(W/2 + 40, 34); ctx.stroke()
    // Verse — hero text
    const verse = d.lastTruth || 'Vrede van God wat alle verstand oortref.'
    const fontSize = verse.length > 80 ? 16 : verse.length > 50 ? 18 : 21
    ctx.fillStyle = '#FFFDE0'
    ctx.font = `italic ${fontSize}px Georgia, serif`
    const words = `"${verse}"`.split(' ')
    const maxW = W - 80
    let line = '', y = 80, lineH = fontSize + 9
    for (const w of words) {
      const test = line ? line + ' ' + w : w
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, W/2, y); line = w; y += lineH
      } else line = test
    }
    ctx.fillText(line, W/2, y)
    // Spacer line
    y += 32
    ctx.strokeStyle = 'rgba(255,224,100,0.12)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(W - 60, y); ctx.stroke()
    // Stats
    y += 22
    ctx.fillStyle = 'rgba(255,220,100,0.60)'; ctx.font = 'bold 13px sans-serif'
    ctx.fillText(`Vredepad ${d.level}  ·  ${d.score} waarhede`, W/2, y)
    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.font = '10px sans-serif'
    ctx.fillText('dewaldscheepers.com/go', W/2, H - 14)
    return cv
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x+r,y)
    ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r)
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h)
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r)
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath()
  }

  async function handleShare() {
    const d = endData
    try {
      const cv = buildShareCanvas(d)
      const blob = await new Promise(res => cv.toBlob(res, 'image/png'))
      const file = new File([blob], 'vredepad.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        const shareText = `Ek het ${d.score} waarhede ontvang op Vredepad ${d.level}! 🌿\n\nSpeel ook: https://dewaldscheepers.com/go`
        await navigator.share({ files: [file], title: 'Daaglikse Hoop', text: shareText })
        return
      }
    } catch {}
    const verse = d.lastTruth ? `\n\n"${d.lastTruth}"` : ''
    const msg = `Ek het ${d.score} waarhede ontvang op Vredepad ${d.level}! 🌿${verse}\n\nSpeel ook: https://dewaldscheepers.com/go`
    if (navigator.share) {
      try { await navigator.share({ title: 'Vredepad', text: msg }) } catch {}
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
    }
  }

  function getTouchDir(clientX, clientY) {
    if (!gameRef.current || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const tx = clientX - rect.left
    const ty = clientY - rect.top
    const p  = gameRef.current.player
    const vx = tx - p.x
    const vy = ty - p.y
    const dist = Math.sqrt(vx * vx + vy * vy)
    if (dist > 12) { p.dx = vx / dist; p.dy = vy / dist }
  }

  function dismissTutorial() {
    setTutorialActive(false)
    try { localStorage.setItem('vp_tutorial_done', '1') } catch {}
  }

  function onTouchStart(e) {
    e.preventDefault()
    getTouchDir(e.touches[0].clientX, e.touches[0].clientY)
  }

  function onTouchMove(e) {
    e.preventDefault()
    getTouchDir(e.touches[0].clientX, e.touches[0].clientY)
  }

  function onTouchEnd() {
    // keep last direction — player continues gliding until next touch
  }

  /* ── Intro ── */
  if (screen === 'intro') {
    const save        = loadSave()
    const level       = save.level || 1
    const totalLevels = save.totalLevels || 0
    const t           = THEMES[(level - 1) % THEMES.length]
    const streak      = save.streak || 0
    const hasDays = (save.playedDays?.length || 0) > 0
    const last7   = hasDays ? Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10)
      return { date, played: save.playedDays.includes(date), isToday: i === 6 }
    }) : []
    return (
      <div className="vp-overlay" style={{ background: t.bg0 }}>
        <button className="vp-close" onClick={onClose}>✕</button>
        <div className="vp-intro">
          <div className="vp-intro-icon">🌿</div>
          <h1 className="vp-intro-title">Vredepad</h1>
          <p className="vp-intro-verse">{t.verse}</p>
          <p className="vp-intro-desc">
            'n Stil oomblik om jou gedagtes tot rus te bring. Versamel God se <strong>waarhede</strong> en laat <strong>indringende gedagtes</strong> verbygaan.
          </p>
          {level > 1 && (
            <div className="vp-stats-row">
              <div className="vp-stat"><span className="vp-stat-val">{level}</span><span className="vp-stat-lbl">Vredepad</span></div>
              <div className="vp-stat"><span className="vp-stat-val">{bestScore}</span><span className="vp-stat-lbl">Beste</span></div>
            </div>
          )}
          {hasDays && (
            <div className="vp-streak-row">
              <span className="vp-streak-label" style={{ color: streak >= 2 ? '#E67E22' : 'var(--text-muted)' }}>
                {streak >= 2 ? `🔥 ${streak} dae op 'n ry` : streak === 1 ? '🌱 Kom môre terug' : '🌿 Jou pad wag'}
              </span>
              <div className="vp-streak-dots">
                {last7.map((d, i) => (
                  <div
                    key={i}
                    className={`vp-streak-dot${d.played ? ' played' : ''}${d.isToday ? ' today' : ''}`}
                    style={d.played ? {
                      background: t.player,
                      boxShadow: d.isToday ? `0 0 8px 2px ${t.player}` : 'none',
                    } : {}}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="vp-hint-row">
            <span>Tik waar jy wil hê die bal moet gaan</span>
            <span>Sleep jou vinger om die bal te lei</span>
          </div>
          <button className="vp-start-btn" style={{ background: t.player }} onClick={startGame}>
            {level > 1 ? `Begin Vredepad ${level}` : 'Begin my pad van vrede'}
          </button>
          <button className="vp-reset-link" onClick={() => setShowResetConfirm(true)}>
            Begin van voor af
          </button>
          <div className="vp-leaderboard">
            <p className="vp-lb-title">Vredepad Top 10</p>
            <div className="vp-lb-tabs">
              <button className={`vp-lb-tab${lbTab === 'week' ? ' active' : ''}`} onClick={() => setLbTab('week')}>Hierdie Week</button>
              <button className={`vp-lb-tab${lbTab === 'alltyd' ? ' active' : ''}`} onClick={() => setLbTab('alltyd')}>Aller-tye</button>
            </div>
            {(() => {
              const list = lbTab === 'week' ? weeklyLb : leaderboard
              if (list.length === 0) return (
                <p className="vp-lb-empty">{lbTab === 'week' ? 'Niemand het hierdie week gespeel nie. Jy kan eerste wees!' : 'Nog niemand op die Top 10 nie. Jy kan die eerste wees!'}</p>
              )
              return list.map((entry, i) => (
                <div key={entry.userId} className={`vp-lb-row${entry.userId === myUid ? ' mine' : ''}`}>
                  <span className="vp-lb-rank">{i + 1}</span>
                  <span className="vp-lb-name">{entry.displayName}</span>
                  <div className="vp-lb-stats">
                    <span className="vp-lb-level">Vlak {entry.level}</span>
                    <span className="vp-lb-score">{(entry.score || 0).toLocaleString('af')} pt</span>
                  </div>
                </div>
              ))
            })()}
            {(() => {
              const list = lbTab === 'week' ? weeklyLb : leaderboard
              const myRank = list.findIndex(e => e.userId === myUid)
              if (myRank >= 0) return <p className="vp-lb-my-rank">Jy is nommer {myRank + 1} op die {lbTab === 'week' ? 'weeklikse' : 'Vredepad'} Top 10. ✨</p>
              const last = list[list.length - 1]
              const gap = last ? last.level - totalLevels : 999
              const close = list.length >= 10 && gap <= 12
              return <p className="vp-lb-motivation">{close ? `Nog ${gap} ${gap === 1 ? 'vlak' : 'vlakke'} om ${last.displayName} te klop! 🏅` : 'Hou aan stap. Jou volgende tree kan jou nader bring aan die Top 10.'}</p>
            })()}
            <p className="vp-lb-120">🌙 Bereik Vlak 120 en ontsluit Rustelose Gedagtes gratis.</p>
          </div>

          <div className="vp-rewards">
            <p className="vp-rewards-title">📚 Gratis eBoeke</p>
            {FREE_REWARD_BOOKS.map(b => (
              <div key={b.id} className="vp-reward-row">
                <span className="vp-reward-emoji">{b.emoji}</span>
                <span className="vp-reward-name">{b.title}</span>
                <button
                  className="vp-reward-btn"
                  disabled={!bookPdfs[b.id]}
                  onClick={() => bookPdfs[b.id] && window.open(bookPdfs[b.id], '_blank')}
                >Aflaai</button>
              </div>
            ))}
            <div className="vp-reward-divider" />
            {MILESTONE_BOOKS.map(b => {
              const unlocked = totalLevels >= b.level
              return (
                <div key={b.id} className={`vp-reward-row${unlocked ? '' : ' locked'}`}>
                  <span className="vp-reward-emoji">{b.emoji}</span>
                  <span className="vp-reward-name">{b.title}</span>
                  {unlocked
                    ? <button
                        className="vp-reward-btn"
                        disabled={!bookPdfs[b.id]}
                        onClick={() => bookPdfs[b.id] && window.open(bookPdfs[b.id], '_blank')}
                      >Aflaai</button>
                    : <span className="vp-reward-lock">🔒 Vlak {b.level}</span>
                  }
                </div>
              )
            })}
          </div>

          <div className="vp-donation-wrap">
            <DonationCard />
          </div>
        </div>

        {showResetConfirm && (
          <div className="vp-confirm-backdrop" onClick={() => setShowResetConfirm(false)}>
            <div className="vp-confirm-modal" onClick={e => e.stopPropagation()}>
              <p className="vp-confirm-text">Begin weer van voor af? Jou vordering word uitgevee.</p>
              <div className="vp-confirm-btns">
                <button className="vp-confirm-cancel" onClick={() => setShowResetConfirm(false)}>Kanselleer</button>
                <button className="vp-confirm-ok" onClick={() => {
                  localStorage.removeItem('vredepad_data')
                  localStorage.removeItem('vp_tutorial_done')
                  localStorage.removeItem('vp_lb_submitted')
                  setBest(0)
                  pendingLevel.current = 1
                  setShowResetConfirm(false)
                }}>Ja, begin oor</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ── Stil Oomblik — brief pause before end screen ── */
  if (screen === 'stiloomblik' && endData) {
    const d = endData
    const t = THEMES[(d.level - 1) % THEMES.length]
    return (
      <div className="vp-stiloomblik" style={{ background: t.bg0 }}>
        <p className="vp-stilte-truth">{d.lastTruth}</p>
      </div>
    )
  }

  if (screen === 'versmoment' && endData) {
    const d = endData
    const t = THEMES[(d.level - 1) % THEMES.length]
    return (
      <div className="vp-overlay vp-versmoment" style={{ background: t.bg0 }}>
        <div className="vp-versmoment-body">
          <p className="vp-versmoment-label">Vredepad {d.level}</p>
          <p className="vp-versmoment-verse">"{d.lastTruth || 'Vrede van God wat alle verstand oortref.'}"</p>
          <div className="vp-versmoment-btns">
            <button className="vp-versmoment-share" onClick={handleShare}>
              Deel hierdie woord 🌿
            </button>
            <button className="vp-versmoment-skip" onClick={() => setScreen('levelup')}>
              Sien my telling →
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Countdown ── */
  if (screen === 'countdown') {
    const level  = pendingLevel.current
    const t      = THEMES[(level - 1) % THEMES.length]
    const phrase = COUNTDOWN_PHRASES[(level - 1) % COUNTDOWN_PHRASES.length]
    return (
      <div className="vp-overlay vp-countdown-screen" style={{ background: t.bg0 }}>
        <div className="vp-countdown-body">
          <p className="vp-countdown-prompt">{phrase}</p>
          <div className="vp-countdown-num" style={{ color: t.player }}>
            {countdown > 0 ? countdown : '🌿'}
          </div>
          <p className="vp-countdown-sub">Vredepad {level}</p>
          <p className="vp-countdown-goal">Versamel waarhede · Vermy swaar gedagtes</p>
        </div>
      </div>
    )
  }

  /* ── Playing ── */
  if (screen === 'playing') {
    return (
      <div className="vp-overlay vp-playing">
        <div className="vp-hud">
          <span className="vp-hud-score">
            <span className="vp-hud-score-num" style={{ color: displayScore >= gameMinScore ? '#4CAF50' : 'var(--text)' }}>{displayScore}</span>
            <span className="vp-hud-score-sep"> / </span>
            <span className="vp-hud-score-min">{gameMinScore}</span>
          </span>
          <span className="vp-hud-time" style={{ color: displayTime <= 10 ? '#C0392B' : 'var(--text)' }}>
            {displayTime}s
          </span>
          <button className="vp-hud-mute" onClick={() => { const m = toggleMute(); setSoundOn(!m) }}>
            {soundOn ? '🔊' : '🔇'}
          </button>
          <button className="vp-hud-close" onClick={() => { stopAmbient(); cancelAnimationFrame(rafRef.current); setScreen('intro') }}>
            ✕
          </button>
        </div>
        <div className="vp-truth-bar">
          <span key={lastTruthText} className="vp-truth-text vp-truth-fadein">
            {lastTruthText || 'Haal asem. Laat die gedagte gaan. Jy is veilig hier.'}
          </span>
        </div>
        <div className="vp-canvas-wrap" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <canvas ref={canvasRef} className="vp-canvas" />
          {promiseMoment && (
            <div className="vp-promise-overlay">
              <p className="vp-promise-truth">{promiseMoment}</p>
            </div>
          )}
          {gardenVerse && (
            <div className="vp-garden-verse">
              <p className="vp-garden-verse-text">{gardenVerse}</p>
            </div>
          )}
          {tutorialActive && (
            <div className="vp-tutorial-overlay">
              <div className="vp-tut-step vp-tut-s1">
                <div className="vp-tut-ring-wrap">
                  <div className="vp-tut-ring" />
                  <div className="vp-tut-dot" />
                </div>
                <span className="vp-tut-lbl">Tik hier...</span>
              </div>
              <div className="vp-tut-step vp-tut-s2">
                <div className="vp-tut-ring-wrap">
                  <div className="vp-tut-ring" />
                  <div className="vp-tut-dot" />
                </div>
                <span className="vp-tut-lbl">...of hier</span>
              </div>
              <div className="vp-tut-step vp-tut-s3">
                <span className="vp-tut-lbl">Sleep die bal met jou vinger</span>
                <div className="vp-tut-ball-demo">
                  <div className="vp-tut-demo-ball" />
                  <div className="vp-tut-demo-finger" />
                </div>
              </div>
              <div className="vp-tut-step vp-tut-s4">
                <div className="vp-tut-goals">
                  <span className="vp-tut-goal-catch">✦ Vang die goue sade</span>
                  <span className="vp-tut-goal-avoid">✦ Vermy die donker stekels</span>
                </div>
              </div>
              <p className="vp-tut-wait-lbl">Kyk hoe dit werk...</p>
              <button className="vp-tut-begin-btn" onClick={dismissTutorial}>
                Begin Speel →
              </button>
            </div>
          )}
          {combo >= 2 && (
            <div className={`vp-combo-badge${combo >= 5 ? ' vp-combo-hot' : ''}`}>
              {combo >= 5 ? `⚡ ${combo}×` : `${combo}×`}
            </div>
          )}
          {bonusFlash && (
            <div className="vp-bonus-flash">+5 sekondes ⚡</div>
          )}
          {genadeFlash && (
            <div className="vp-genade-flash">{genadeFlash}</div>
          )}
          {stormAnnounce && (
            <div key={stormAnnounce} className="vp-storm-announce">{stormAnnounce}</div>
          )}
        </div>
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
          <div className="vp-end-icon">{d.failed ? '🌱' : '🌿'}</div>
          <h2 className="vp-end-title">{d.failed ? 'Bly gefokus op die waarheid.' : (d.endTitle || 'Jy het plek gemaak vir vrede.')}</h2>
          <p className="vp-end-level">Vredepad {d.level} {d.failed ? '' : 'voltooi'}</p>

          {d.failed && (
            <div className="vp-end-retry-msg">
              <span className="vp-retry-score">{d.score}</span>
              <span className="vp-retry-sep"> van </span>
              <span className="vp-retry-min">{d.minScore}</span>
              <span className="vp-retry-lbl"> waarhede benodig</span>
              {d.attemptsLeft > 0 && <p className="vp-retry-hint">Nog {d.attemptsLeft} poging{d.attemptsLeft === 1 ? '' : 's'}. Vermy die donker onkruid!</p>}
            </div>
          )}

          {!d.failed && (
          <div className="vp-stats-row">
            <div className="vp-stat">
              <span className="vp-stat-val">{d.score}</span>
              <span className="vp-stat-lbl">Waarhede</span>
            </div>
            <div className="vp-stat">
              <span className="vp-stat-val">{d.bestScore}</span>
              <span className="vp-stat-lbl">Beste</span>
            </div>
          </div>
          )}

          {d.isNewRecord && (
            <div className="vp-new-record">🏆 Nuwe Rekord!</div>
          )}
          {lbCelebration && (
            <div className="vp-lb-cel">
              <p className="vp-lb-cel-title">
                {lbCelebration.isNew ? '🎖️ Jy het die Vredepad Top 10 bereik!' : '✨ Jy het jou rekord verbeter!'}
              </p>
              <p className="vp-lb-cel-rank">Jy is nommer {lbCelebration.rank} op die Top 10</p>
              <p className="vp-lb-cel-stats">Vlak {lbCelebration.level} · {(lbCelebration.score || 0).toLocaleString('af')} punte</p>
            </div>
          )}

          {!lbCelebration && leaderboard.length >= 10 && (() => {
            const myRank = leaderboard.findIndex(e => e.userId === myUid)
            if (myRank >= 0) return null
            const last = leaderboard[leaderboard.length - 1]
            const save = loadSave()
            const myLevels = save.totalLevels || 0
            const gap = (last.level || 0) - myLevels
            if (gap <= 0) return null
            return <p className="vp-end-lb-gap">Nog {gap} {gap === 1 ? 'vlak' : 'vlakke'} om {last.displayName} se plek te bereik 🏅</p>
          })()}
          {d.newUnlock && (
            <div className="vp-new-unlock">
              <p className="vp-unlock-label">🎁 Gratis eBoek verdien!</p>
              <p className="vp-unlock-title">{d.newUnlock.emoji} {d.newUnlock.title}</p>
              <button
                className="vp-unlock-btn"
                disabled={!bookPdfs[d.newUnlock.id]}
                onClick={() => bookPdfs[d.newUnlock.id] && window.open(bookPdfs[d.newUnlock.id], '_blank')}
              >Aflaai nou</button>
              <p className="vp-unlock-hint">Ook beskikbaar op die tuisskerm</p>
            </div>
          )}
          {d.streak >= 2 && (
            <div className="vp-end-streak">🔥 {d.streak} dae op 'n ry</div>
          )}

          {d.lastTruth && (
            <div className="vp-end-verse">
              <p className="vp-end-verse-text">{d.lastTruth}</p>
            </div>
          )}

          <div className="vp-end-prayer">
            <p>Here, maak my gedagtes stil en lei my in U vrede. Amen.</p>
          </div>

          {(() => {
            const save = loadSave()
            const total = save.totalLevels || 0
            const next = MILESTONE_BOOKS.find(b => total < b.level)
            if (!next) return null
            const prev = [...MILESTONE_BOOKS].reverse().find(b => b.level <= total)
            const from = prev ? prev.level : 0
            const pct = Math.min(98, Math.round(((total - from) / (next.level - from)) * 100))
            const remaining = next.level - total
            return (
              <div className="vp-book-teaser">
                <p className="vp-book-teaser-lbl">🎁 Volgende gratis eBoek</p>
                <div className="vp-book-teaser-book">{next.emoji} {next.title}</div>
                <div className="vp-book-teaser-bar-wrap">
                  <div className="vp-book-teaser-bar" style={{ width: `${pct}%` }} />
                </div>
                <p className="vp-book-teaser-cta">
                  Nog <strong>{remaining}</strong> {remaining === 1 ? 'vlak' : 'vlakke'} en jy kry dit gratis!
                </p>
              </div>
            )
          })()}

          {d.failed ? (
            <>
              <button className="vp-start-btn" style={{ background: t.player }} onClick={retryLevel}>
                Probeer weer →
              </button>
              <button className="vp-back-link" onClick={onClose}>Terug na tuis</button>
            </>
          ) : (
            <>
              <button className="vp-start-btn" style={{ background: t.player }} onClick={nextLevel}>
                Volgende Vredepad →
              </button>
              <button className="vp-secondary-btn" onClick={replayLevel}>Speel weer</button>
              <button className="vp-share-btn" onClick={handleShare}>Deel my vrede 🌿</button>
              <button className="vp-back-link" onClick={onClose}>Terug na tuis</button>
            </>
          )}
        </div>

        {showNameConsent && (
          <div className="vp-consent-backdrop">
            <div className="vp-consent-modal">
              <div className="vp-consent-icon">🎖️</div>
              <h3 className="vp-consent-title">Jy het die Vredepad Top 10 bereik!</h3>
              <p className="vp-consent-sub">Kies die naam wat jy op die lys wil wys.</p>
              <input
                className="vp-consent-input"
                placeholder="Byvoorbeeld: HoopSoeker, Maria K."
                maxLength={20}
                value={consentName}
                onChange={e => { setConsentName(e.target.value); setConsentError('') }}
              />
              <p className="vp-consent-privacy">Moenie jou volle naam gebruik as jy dit nie publiek wil wys nie.</p>
              <label className="vp-consent-check-row">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={e => { setConsentChecked(e.target.checked); setConsentError('') }}
                />
                <span>Ek verstaan dat hierdie naam, my vlak en my punte publiek op die Vredepad Top 10 gewys sal word totdat iemand my plek verbysteek.</span>
              </label>
              {consentError && <p className="vp-consent-error">{consentError}</p>}
              <button className="vp-consent-submit" onClick={() => submitLeaderboardEntry(false)}>
                Plaas my op die Top 10
              </button>
              <button className="vp-consent-anon" onClick={() => submitLeaderboardEntry(true)}>
                Bly anoniem
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}
