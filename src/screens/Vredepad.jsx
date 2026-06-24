import { useState, useEffect, useRef } from 'react'
import DonationCard from '../components/DonationCard'
import { playCollect, playHit, playLevelComplete, startAmbient, stopAmbient, toggleMute, isMuted } from '../utils/sound'
import './Vredepad.css'

const MOOD_TRUTHS = {
  angs: [
    '"Moenie bang wees nie, want Ek is met jou." — Jes. 41:10',
    '"Gooi al jou kommer op Hom, want Hy sorg vir jou." — 1 Pet. 5:7',
    '"Vrede laat Ek julle na; my vrede gee Ek julle." — Joh. 14:27',
    '"Jy is veilig in Sy hande." — Ps. 91:4',
    '"Haal asem. Hy hou jou vas." — Ps. 46:10',
    '"Een oomblik op \'n slag." — Matt. 6:34',
    '"Hy is naby dié wat Hom aanroep." — Ps. 145:18',
    '"God is ons toevlug en sterkte." — Ps. 46:2',
    '"Moet oor niks besorg wees nie." — Fil. 4:6',
    '"Die vrede van God sal jou hart bewaar." — Fil. 4:7',
    '"Hy bewaar hom in volkome vrede." — Jes. 26:3',
    '"As ek bang is, vertrou ek op U." — Ps. 56:4',
    '"God het my nie \'n gees van vrees gegee nie, maar van krag." — 2 Tim. 1:7',
    '"Laat jou hart nie ontsteld wees nie." — Joh. 14:1',
    '"My hulp kom van die Here." — Ps. 121:2',
    '"Die Here is naby." — Fil. 4:5',
    '"Ek sal jou help — Ek hou jou regterhand vas." — Jes. 41:13',
    '"Ek het jou by jou naam geroep — jy is Myne." — Jes. 43:1',
    '"Hy lei my na waters waar daar rus is." — Ps. 23:2',
    '"Die Here sal jou nie begeef of verlaat nie." — Deut. 31:6',
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
    '"Moenie aan hierdie wêreld gelykvormig word nie." — Rom. 12:2',
    '"Stel jou gedagtes op dinge hierbo." — Kol. 3:2',
    '"Hy het goeie planne vir my." — Jer. 29:11',
    '"God se gedagtes is hoër as my gedagtes." — Jes. 55:9',
    '"Bring elke gedagte gehoorsaam na Christus." — 2 Kor. 10:5',
    '"My Vader weet wat ek nodig het." — Matt. 6:8',
    '"Hy lei my op regte paaie." — Ps. 23:3',
    '"Vertrou Hom — Hy sal jou pad regmaak." — Spr. 3:6',
    '"Sy wysheid is beskikbaar vir dié wat vra." — Jak. 1:5',
    '"Kom na My — Ek sal rus gee." — Matt. 11:28',
    '"Wat ek nie weet nie — Hy weet." — Ps. 147:5',
    '"Laat die vrede van God in jou hart regeer." — Kol. 3:15',
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
    '"Dié wat op die Here wag, kry nuwe krag." — Jes. 40:31',
    '"Moenie moeg word om goed te doen nie." — Gal. 6:9',
    '"Sy genade is genoeg vir my." — 2 Kor. 12:9',
    '"My krag is in swakheid volmaak." — 2 Kor. 12:9',
    '"Die Here is my herder — ek het geen gebrek nie." — Ps. 23:1',
    '"Hy sorg vir my, selfs terwyl ek slaap." — Ps. 127:2',
    '"Ek kan alles doen deur Hom wat my krag gee." — Fil. 4:13',
    '"Hy dra my soos \'n herder sy lammers." — Jes. 40:11',
    '"Wag op die Here — wees sterk." — Ps. 27:14',
    '"Hy vul my met krag van binne." — Ef. 3:16',
    '"Sy juk is sag en sy las is lig." — Matt. 11:30',
    '"Gooi jou las op die Here — Hy sal jou onderhou." — Ps. 55:22',
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
    '"Die Here is my lig en my heil — vir wie sal ek vrees?" — Ps. 27:1',
    '"Sy volmaakte liefde verdryf alle vrees." — 1 Joh. 4:18',
    '"Ek soek die Here — Hy bevry my van my vrese." — Ps. 34:4',
    '"Die Here is vir my — ek sal nie vrees nie." — Ps. 118:6',
    '"Ek skuil onder die skaduwee van sy vlerke." — Ps. 91:4',
    '"Hy is my toevlug en my vesting." — Ps. 91:2',
    '"Moenie vrees nie — Ek het jou losgekoop." — Jes. 43:1',
    '"Die ewige arms is altyd onder my." — Deut. 33:27',
    '"Jy hoef nie bang te wees vir die nag nie." — Ps. 91:5',
    '"Hy is by my in die vuur en in die water." — Jes. 43:2',
    '"Die Here gee krag aan sy volk." — Ps. 29:11',
    '"Hy het gesê: Ek sal jou nooit verlaat nie." — Heb. 13:5',
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
    '"Die Here is naby die gebrokenes van hart." — Ps. 34:18',
    '"Hy tel my trane en bewaar dit." — Ps. 56:9',
    '"Jy is deur God gesien — hier en nou." — Gen. 16:13',
    '"Ek sal jou nie verlaat of agterlaat nie." — Jos. 1:5',
    '"Sy gunste is elke môre nuut." — Klaagl. 3:23',
    '"Hy is \'n Vader vir die vaderloses." — Ps. 68:6',
    '"Sy liefde is beter as die lewe." — Ps. 63:4',
    '"Jy is kosbaar en geliefd in Sy oë." — Jes. 43:4',
    '"Sy liefde duur tot in ewigheid." — Ps. 136:1',
    '"Hy woon by dié met \'n verbryselde gees." — Jes. 57:15',
    '"Jy is deel van sy ewige familie." — Ef. 2:19',
    '"Hy het jou in Sy handpalm gegraveer." — Jes. 49:16',
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
    '"Soek eerste die koninkryk — die res sal kom." — Matt. 6:33',
    '"Laat die vrede van Christus in jou hart regeer." — Kol. 3:15',
    '"Hy voltooi wat Hy in my begin het." — Fil. 1:6',
    '"Roep na My — Ek sal antwoord." — Jer. 33:3',
    '"Ken Hom in al jou weë — Hy maak jou pad reg." — Spr. 3:6',
    '"My krag word in swakheid volmaak." — 2 Kor. 12:9',
    '"Hy is my toevlug op die dag van nood." — Nah. 1:7',
    '"Hy bring dit tot stand." — Ps. 138:8',
    '"Soos jou dae is, so sal jou krag wees." — Deut. 33:25',
    '"Ek put krag uit Hom alleen." — Fil. 4:13',
    '"Hy ken my pad — dit is genoeg." — Job 23:10',
    '"Ek soek eers rus — dan kan ek dien." — Ps. 23:2',
  ],
  identiteit: [
    '"Ek is wonderbaarlik en vreeslik gemaak." — Ps. 139:14',
    '"Ek is God se meesterstuk." — Ef. 2:10',
    '"Ek is \'n kind van die lewende God." — Joh. 1:12',
    '"In Christus is ek \'n nuwe skepping." — 2 Kor. 5:17',
    '"Niks kan my skei van God se liefde nie." — Rom. 8:39',
    '"Ek is voor die grondlegging van die wêreld gekies." — Ef. 1:4',
    '"My naam is in Sy hande gegraveer." — Jes. 49:16',
    '"Geen veroordeling vir dié wat in Christus is nie." — Rom. 8:1',
    '"Hy het my eerste liefgehad." — 1 Joh. 4:19',
    '"Ek is \'n geliefde kind van God." — 1 Joh. 3:1',
    '"Hy roem oor my met blydskap." — Sof. 3:17',
    '"Voordat ek gebore is, het Hy my geken." — Jer. 1:5',
    '"Ek is voltooid in Hom." — Kol. 2:10',
    '"Ek is \'n uitverkore geslag, Sy eiendom." — 1 Pet. 2:9',
    '"Ek is Sy tempel — Hy woon in my." — 1 Kor. 3:16',
  ],
  hoop: [
    '"Ek ken die planne wat Ek vir jou het — planne van voorspoed." — Jer. 29:11',
    '"In die aand is geween, maar in die môre is gejuig." — Ps. 30:6',
    '"Kyk, Ek maak \'n weg in die woestyn." — Jes. 43:19',
    '"Net goedheid en guns sal my volg al my dae." — Ps. 23:6',
    '"My tye is in Sy hand." — Ps. 31:15',
    '"Hy sal die trane van elke gesig afvee." — Jes. 25:8',
    '"Mag die God van hoop jou vul met vreugde en vrede." — Rom. 15:13',
    '"Kyk, Ek maak alles nuut." — Open. 21:5',
    '"Die raad van die Here staan vas tot in ewigheid." — Ps. 33:11',
    '"Dié wat treur, sal getroos word." — Matt. 5:4',
    '"Die lig skyn in die duisternis — en dit oorwin." — Joh. 1:5',
    '"Sy gunste eindig nie — dit is elke môre nuut." — Klaagl. 3:22-23',
    '"Hierdie hoop is \'n anker vir die siel, vas en betroubaar." — Heb. 6:19',
    '"Dié wat op Hom wag, sal nie beskaamd staan nie." — Jes. 49:23',
    '"Hy is besig om iets nuuts te doen — sien jy dit?" — Jes. 43:19',
  ],
  vergifnis: [
    '"So ver as die ooste van die weste — so ver het Hy my sondes verwyder." — Ps. 103:12',
    '"Jou sondes sal Ek nie meer onthou nie." — Jer. 31:34',
    '"Deur sy wonde het genesing vir ons gekom." — Jes. 53:5',
    '"Geen veroordeling vir dié wat in Christus is nie." — Rom. 8:1',
    '"Sy bloed reinig my van alle sonde." — 1 Joh. 1:7',
    '"As ek bely — Hy vergewe en reinig my." — 1 Joh. 1:9',
    '"Hy het die skuldbrief teen my uitgewis." — Kol. 2:14',
    '"As die Seun jou vrygemaak het, is jy werklik vry." — Joh. 8:36',
    '"Vergeet die verlede — reik vorentoe." — Fil. 3:13',
    '"Sy genade is groter as my foute." — Rom. 5:20',
    '"Salig is hy wie se oortreding vergewe is." — Ps. 32:1',
    '"Vergeef mekaar soos God julle in Christus vergeef het." — Ef. 4:32',
    '"Al was jou sondes soos skarlaken — dit sal wit word soos sneeu." — Jes. 1:18',
    '"Gaan in vrede — jou geloof het jou gered." — Luk. 7:50',
    '"Sy genade bedek elke fout." — 1 Pet. 4:8',
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
  const [countdown, setCountdown]   = useState(3)
  const [displayScore, setScore]    = useState(0)
  const [displayTime, setTime]      = useState(60)
  const [seedBubble, setSeedBubble] = useState(null)
  const [breathing, setBreathing]   = useState(false)
  const [breathPhase, setPhase]     = useState('inhale')
  const [endData, setEndData]       = useState(null)
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
    const save  = updateStreak(loadSave())
    const today = new Date().toISOString().slice(0, 10)
    const nb    = Math.max(save.best || 0, g.score)
    const lastTruth = g.collectedTruths.length > 0
      ? g.collectedTruths[Math.floor(Math.random() * g.collectedTruths.length)]
      : g.truths[0]

    stopAmbient()
    playLevelComplete()

    const collected = [...g.collectedTruths]
    if (!isReplayRef.current) {
      const newLevel = (save.level || 1) + 1
      saveSave({ ...save, level: newLevel, totalScore: (save.totalScore || 0) + g.score, lastDay: today, best: nb })
      setBest(nb)
      setEndData({ score: g.score, level: g.level, bestScore: nb, lastTruth, streak: save.streak || 1, collected })
    } else {
      saveSave({ ...save, ...(nb > (save.best || 0) ? { best: nb } : {}) })
      if (nb > (save.best || 0)) setBest(nb)
      setEndData({ score: g.score, level: g.level, bestScore: nb, lastTruth, streak: save.streak || 1, collected })
    }
    setScreen('levelup')
  }

  function triggerBreathing() {
    playHit()
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
          playCollect(g.score - 1)
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
    const msg = `Ek het ${d.score} waarhede ontvang op Vredepad ${d.level}! 🌿\n\nSpeel ook: https://dewaldscheepers.com/go`
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
    const save    = loadSave()
    const level   = save.level || 1
    const t       = THEMES[(level - 1) % THEMES.length]
    const streak  = save.streak || 0
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
            <span>Gly jou vinger oor die skerm</span>
            <span>Lei die liggie na die waarhede</span>
          </div>
          <button className="vp-start-btn" style={{ background: t.player }} onClick={startGame}>
            {level > 1 ? `Begin Vredepad ${level}` : 'Begin my pad van vrede'}
          </button>
          {level > 1 && (
            <button className="vp-reset-link" onClick={() => setShowResetConfirm(true)}>
              Begin van voor af
            </button>
          )}
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
          <button className="vp-hud-mute" onClick={() => { const m = toggleMute(); setSoundOn(!m) }}>
            {soundOn ? '🔊' : '🔇'}
          </button>
          <button className="vp-hud-close" onClick={() => { stopAmbient(); cancelAnimationFrame(rafRef.current); setScreen('intro') }}>
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
          </div>

          {d.streak >= 2 && (
            <div className="vp-end-streak">🔥 {d.streak} dae op 'n ry</div>
          )}

          {d.collected?.length > 0 && (
            <div className="vp-end-collected">
              <p className="vp-end-truth-label">Waarhede wat jy ontvang het:</p>
              <div className="vp-end-collected-list">
                {d.collected.map((v, i) => (
                  <p key={i} className="vp-end-collected-item">✦ {v}</p>
                ))}
              </div>
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
