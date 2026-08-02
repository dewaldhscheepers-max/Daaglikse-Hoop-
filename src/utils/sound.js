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

/* ── Vrugte ────────────────────────────────────────────────────
   Vir Vrugtefees. Die spel het tot nou Bou die Ark se planke geleen, en
   dit was verkeerd: hout is dof, droog en dood — presies wat 'n ark moet
   wees en presies wat 'n vrug nie is nie.

   'n Vrug wat pluk, is kort, sappig en rond. Drie dele: 'n vinnige
   toonhoogteval (die stingel wat breek), 'n baie kort gefiltreerde ruis
   (die skil), en 'n sagte lyf daaronder. Geen klokkie nie — Vredepad se
   klokkies bly Vredepad s'n, en 'n klokkie in 'n tuin klink na glas.

   Bou die Ark en Vredepad se klanke bly heeltemal onaangeraak.
   ────────────────────────────────────────────────────────────── */

// 'n Warm, laer toonleer as PENTA. Dieselfde note, 'n oktaaf sagter.
const TUIN = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]

function pluk(c, t, hz, krag = 1) {
  const v = Math.min(1, Math.max(0.2, krag))

  // Die stingel wat breek: 'n vinnige val in toonhoogte.
  const o = c.createOscillator(), g = c.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(hz * 1.6, t)
  o.frequency.exponentialRampToValueAtTime(hz, t + 0.045)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(0.30 * v, t + 0.006)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26)
  o.connect(g); g.connect(_master)
  o.start(t); o.stop(t + 0.3)

  // Die skil. Kort en sag, net genoeg om die aanslag lyf te gee.
  const src = ruisBron(c, 0.05)
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 1400 + Math.random() * 500
  bp.Q.value = 1.2
  const gr = c.createGain()
  gr.gain.setValueAtTime(0.0001, t)
  gr.gain.linearRampToValueAtTime(0.10 * v, t + 0.003)
  gr.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
  src.connect(bp); bp.connect(gr); gr.connect(_master)
  src.start(t); src.stop(t + 0.06)

  // Die lyf: 'n ronde onderteun sodat dit sappig eerder as dun klink.
  const o2 = c.createOscillator(), g2 = c.createGain()
  o2.type = 'triangle'
  o2.frequency.setValueAtTime(hz * 0.5, t)
  g2.gain.setValueAtTime(0.0001, t)
  g2.gain.linearRampToValueAtTime(0.12 * v, t + 0.012)
  g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.22)
  o2.connect(g2); g2.connect(_master)
  o2.start(t); o2.stop(t + 0.26)
}

/* 'n Pas. Die ketting stoot dit die toonleer op, sodat 'n lang
   kettingreaksie soos 'n stygende frase klink in plaas van herhaling. */
export function playVrugPas(ketting = 1, hoeveel = 3) {
  if (_muted) return
  try {
    const c = getCtx(), nou = c.currentTime
    const trap = Math.min(TUIN.length - 3, Math.max(0, ketting - 1))
    const n = Math.min(4, Math.max(1, hoeveel - 2))
    for (let i = 0; i < n; i++)
      pluk(c, nou + i * 0.042, TUIN[(trap + i) % TUIN.length], 0.9 - i * 0.08)
    if (navigator.vibrate) navigator.vibrate(ketting >= 3 ? 26 : 14)
  } catch {}
}

// Vrugte wat in die mandjie val: sag, laag, sonder rand.
export function playVrugVal(hoeveel = 1) {
  if (_muted) return
  try {
    const c = getCtx(), nou = c.currentTime
    const n = Math.min(3, Math.max(1, hoeveel))
    for (let i = 0; i < n; i++) {
      const o = c.createOscillator(), g = c.createGain()
      const t = nou + i * 0.035
      o.type = 'sine'
      o.frequency.setValueAtTime(150 + Math.random() * 40, t)
      o.frequency.exponentialRampToValueAtTime(96, t + 0.1)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.linearRampToValueAtTime(0.13, t + 0.008)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16)
      o.connect(g); g.connect(_master)
      o.start(t); o.stop(t + 0.2)
    }
  } catch {}
}

// 'n Spesiale vrug is gemaak: 'n kort stygende glans.
export function playSpesiaal() {
  if (_muted) return
  try {
    const c = getCtx(), nou = c.currentTime
    ;[0, 2, 4, 5].forEach((i, n) => pluk(c, nou + n * 0.05, TUIN[i] * 2, 0.75))
    if (navigator.vibrate) navigator.vibrate([14, 20, 22])
  } catch {}
}

// Twee spesiales saam. Die grootste oomblik in 'n skuif.
export function playKombinasie() {
  if (_muted) return
  try {
    const c = getCtx(), nou = c.currentTime
    ;[0, 2, 4, 5, 7].forEach((i, n) => {
      pluk(c, nou + n * 0.055, TUIN[i] * 2, 0.95)
      pluk(c, nou + n * 0.055 + 0.012, TUIN[i], 0.5)
    })
    // 'n Warm bas onder wat die ruimte vul.
    const o = c.createOscillator(), g = c.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(98, nou)
    o.frequency.exponentialRampToValueAtTime(65.41, nou + 0.6)
    g.gain.setValueAtTime(0.0001, nou)
    g.gain.linearRampToValueAtTime(0.20, nou + 0.04)
    g.gain.exponentialRampToValueAtTime(0.0001, nou + 0.7)
    o.connect(g); g.connect(_master)
    o.start(nou); o.stop(nou + 0.75)
    if (navigator.vibrate) navigator.vibrate([25, 25, 45])
  } catch {}
}

// 'n Ronde van die oes is binne.
export function playOesRonde() {
  if (_muted) return
  try {
    const c = getCtx(), nou = c.currentTime
    ;[TUIN[0], TUIN[2], TUIN[4], TUIN[5] * 2].forEach((hz, i) =>
      pluk(c, nou + i * 0.09, hz, 0.9))
    if (navigator.vibrate) navigator.vibrate([18, 24, 18, 24, 40])
  } catch {}
}

// Die lopie is klaar. Dalend — dit is 'n einde, nie 'n oorwinning nie.
export function playOesKlaar() {
  if (_muted) return
  try {
    const c = getCtx(), nou = c.currentTime
    ;[TUIN[5], TUIN[4], TUIN[2], TUIN[0]].forEach((hz, i) =>
      pluk(c, nou + i * 0.13, hz, 0.7 - i * 0.1))
    if (navigator.vibrate) navigator.vibrate([30, 40, 30])
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
