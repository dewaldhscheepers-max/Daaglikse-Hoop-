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

export function playCollect(idx = 0) {
  if (_muted) return
  try {
    const c = getCtx(), now = c.currentTime
    const freq = PENTA[idx % PENTA.length]
    // Fundamental + two bell harmonics = rich, warm, addictive chime
    bell(c, freq,         0.36, 1.4, now)
    bell(c, freq * 2.756, 0.10, 0.7, now + 0.003)
    bell(c, freq * 2,     0.05, 0.5, now + 0.005)
    if (navigator.vibrate) navigator.vibrate(28)
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
