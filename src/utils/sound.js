// Procedural sound engine — no external files, pure Web Audio API
let _ctx    = null
let _master = null
let _ambient = []
let _muted  = JSON.parse(localStorage.getItem('vp_muted') || 'false')

function getCtx() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)()
    _master = _ctx.createGain()
    _master.gain.value = _muted ? 0 : 0.38
    _master.connect(_ctx.destination)
  }
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

function bell(c, freq, vol, decay, t) {
  const osc = c.createOscillator()
  const g   = c.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(vol, t + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay)
  osc.connect(g)
  g.connect(_master)
  osc.start(t)
  osc.stop(t + decay + 0.05)
}

// C major pentatonic — always consonant, always pleasant
const PENTA = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51]

export function playCollect(idx = 0, combo = 1) {
  if (_muted) return
  try {
    const c   = getCtx(), now = c.currentTime
    const freq = PENTA[idx % PENTA.length]
    const vol  = Math.min(0.36 + (combo - 1) * 0.03, 0.55)
    bell(c, freq,         vol,       1.4, now)
    bell(c, freq * 2.756, vol * 0.28, 0.7, now + 0.003)
    bell(c, freq * 2,     vol * 0.14, 0.5, now + 0.005)
    if (combo >= 5) bell(c, freq * 4, vol * 0.07, 0.35, now + 0.07)
    if (navigator.vibrate) navigator.vibrate(combo >= 5 ? 45 : 28)
  } catch {}
}

/* ── Hout ──────────────────────────────────────────────────────
   Vir Bou die Ark. Geen klokkies, geen helder rand: 'n plank wat op 'n
   plank val. Twee dele — 'n kort growwe ruisstoot deur 'n laagdeurlaat-
   filter vir die aanslag, en 'n paar lae resonansies wat vinnig doodgaan.
   Hout ring nie na nie, dus is die verval kort. Elke slag word effens
   anders gestem sodat 'n ry plante nie soos 'n masjien klink nie.
   Vredepad se klanke bly onaangeraak.
   ────────────────────────────────────────────────────────────── */
function ruisBron(c, duur) {
  const n   = Math.max(1, Math.floor(c.sampleRate * duur))
  const buf = c.createBuffer(1, n, c.sampleRate)
  const d   = buf.getChannelData(0)
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buf
  return src
}

function hout(c, t, krag = 1) {
  const v = Math.min(1, Math.max(0.25, krag))

  // Die aanslag. Die kort optrek keer 'n digitale klap, wat skerp klink.
  const src = ruisBron(c, 0.1)
  const lp  = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 720 + Math.random() * 240
  lp.Q.value = 0.8
  const gr = c.createGain()
  gr.gain.setValueAtTime(0.0001, t)
  gr.gain.linearRampToValueAtTime(0.42 * v, t + 0.002)
  gr.gain.exponentialRampToValueAtTime(0.0001, t + 0.08)
  src.connect(lp); lp.connect(gr); gr.connect(_master)
  src.start(t); src.stop(t + 0.11)

  // Die lyf van die plank.
  const basis = 166 + Math.random() * 28
  ;[[1, 0.30, 0.17], [1.47, 0.14, 0.12], [2.31, 0.06, 0.08]].forEach(([m, vol, verval]) => {
    const o = c.createOscillator(), g = c.createGain()
    o.type = 'triangle'
    o.frequency.setValueAtTime(basis * m, t)
    o.frequency.exponentialRampToValueAtTime(basis * m * 0.84, t + verval)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.linearRampToValueAtTime(vol * v, t + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, t + verval)
    o.connect(g); g.connect(_master)
    o.start(t); o.stop(t + verval + 0.04)
  })
}

// 'n Stuk kom tot rus.
export function playHout(krag = 1) {
  if (_muted) return
  try {
    const c = getCtx()
    hout(c, c.currentTime, krag)
    if (navigator.vibrate) navigator.vibrate(9)
  } catch {}
}

// 'n Ry is klaar en word deel van die ark: 'n paar planke wat kort na
// mekaar neersak, met 'n warm lae toon onder wat die ruimte vul.
export function playPlanke(rye = 1) {
  if (_muted) return
  try {
    const c = getCtx(), nou = c.currentTime
    const n = Math.min(4, Math.max(1, rye))
    for (let i = 0; i <= n; i++) hout(c, nou + i * 0.055, 0.85 + i * 0.05)

    const o = c.createOscillator(), g = c.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(88, nou)
    o.frequency.exponentialRampToValueAtTime(66, nou + 0.5)
    g.gain.setValueAtTime(0.0001, nou)
    g.gain.linearRampToValueAtTime(0.16 + n * 0.03, nou + 0.03)
    g.gain.exponentialRampToValueAtTime(0.0001, nou + 0.55)
    o.connect(g); g.connect(_master)
    o.start(nou); o.stop(nou + 0.6)

    if (navigator.vibrate) navigator.vibrate(n >= 3 ? 40 : 22)
  } catch {}
}

export function playHit() {
  if (_muted) return
  try {
    const c = getCtx(), now = c.currentTime
    const osc = c.createOscillator()
    const g   = c.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(110, now)
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.2)
    g.gain.setValueAtTime(0.22, now)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)
    osc.connect(g)
    g.connect(_master)
    osc.start(now)
    osc.stop(now + 0.35)
    if (navigator.vibrate) navigator.vibrate([12, 8, 12])
  } catch {}
}

export function playLevelComplete() {
  if (_muted) return
  try {
    const c = getCtx()
    // Ascending pentatonic arpeggio — deeply satisfying resolution
    ;[523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98].forEach((freq, i) => {
      bell(c, freq, 0.28, 2.0, c.currentTime + i * 0.13)
    })
    if (navigator.vibrate) navigator.vibrate([20, 30, 20, 30, 60])
  } catch {}
}

export function startAmbient() {
  stopAmbient()
  if (_muted) return
  try {
    const c = getCtx()
    // C2 + G2 + C3 perfect fifth drone — grounding and meditative
    ;[[65.41, 0.018], [98.00, 0.014], [130.81, 0.009]].forEach(([freq, vol]) => {
      const osc = c.createOscillator()
      const g   = c.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      g.gain.setValueAtTime(0, c.currentTime)
      g.gain.linearRampToValueAtTime(vol, c.currentTime + 3)
      osc.connect(g)
      g.connect(_master)
      osc.start()
      _ambient.push(osc, g)
    })
  } catch {}
}

export function stopAmbient() {
  _ambient.forEach(n => { try { n.stop?.(); n.disconnect?.() } catch {} })
  _ambient = []
}

export function toggleMute() {
  _muted = !_muted
  try { localStorage.setItem('vp_muted', JSON.stringify(_muted)) } catch {}
  if (_master) _master.gain.value = _muted ? 0 : 0.38
  if (_muted) stopAmbient()
  return _muted
}

export function isMuted() { return _muted }
