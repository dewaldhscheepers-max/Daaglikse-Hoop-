/* ── Hou die Vlam ──
 *
 * Klein, vinnig gebou, en gemaak om net-nog-een-keer te voel: 'n vlammetjie
 * beweeg heen en weer oor 'n kers se pit. Tik wanneer dit in die goue sone
 * is. Elke tik maak die sone kleiner en die vlam vinniger — geen vlakke om
 * te ontwerp nie, net een kurwe wat opgaan.
 *
 * Dewald: "die feel: hoe vinnig die vlam beweeg, die perfekte-hit feedback,
 * klank/haptics, en hoe naby die speler voel hy was toe hy verloor."
 *
 * ── Waarom "verloor" nooit "jou geloof het gefaal" sê nie ──
 *
 * Die BEELD dra die Bybelse gewig (Levitikus 6:12 se altaarvuur wat nooit
 * mag doodgaan nie, die tien maagde se lampe in Matteus 25, "blus die Gees
 * nie uit nie" in 1 Tess. 5:19) — maar die VERLIES-skerm bly net arcade-
 * taal: "So naby!" en 'n telling, soos Bou die Ark s'n. Nooit "jy het
 * gefaal" of enige woord wat 'n tik-fout soos 'n geestelike oordeel laat
 * lyk nie. Sien CLAUDE.md: hierdie app se hele geskiedenis gaan oor
 * presies hierdie grens.
 *
 * ── Die vier canvas-reëls (CLAUDE.md se "Android, Chrome, en gekleurde
 *    strepe") ──
 *   1. getContext('2d', { willReadFrequently: true })
 *   2. geen border-radius op die doek nie — die afronding word BINNE geteken
 *   3. geen transform of opacity op :active nie — net kleur
 *   4. die doek se buffer kom net uit sy BREEDTE, nooit sy hoogte nie
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import DonationCard from '../components/DonationCard'
import './HouDieVlam.css'

const SLEUTEL = 'hdv_beste'
const BEGIN_SPOED   = 1.6   // radiale per sekonde
const SPOED_OP      = 0.11  // hoeveel vinniger per tik
const MAKS_SPOED    = 5.2
const BEGIN_SONE    = 0.34  // fraksie van die volle baan (0–1)
const SONE_KRIMP    = 0.965 // hoeveel die sone elke tik krimp
const MIN_SONE      = 0.085 // sone kan nie kleiner as dit word nie

function leesBeste() {
  try { return Number(localStorage.getItem(SLEUTEL)) || 0 } catch { return 0 }
}
function skryfBeste(n) {
  try { localStorage.setItem(SLEUTEL, String(n)) } catch { /* privaat venster */ }
}

/* 'n Kort, sagte "tik"-toon — geen klanklêer nodig nie, dus niks om ooit
   verkeerd te kas nie (sien CLAUDE.md se stemboodskap-les: hierdie is
   sintetiese klank, nie 'n netwerk-lêer nie, dus geld daardie les nie hier
   nie). */
let AudioCtx = null
function speelToon(frek, duur = 0.09, tipe = 'sine', volume = 0.14) {
  try {
    AudioCtx = AudioCtx || new (window.AudioContext || window.webkitAudioContext)()
    if (AudioCtx.state === 'suspended') AudioCtx.resume()
    const t = AudioCtx.currentTime
    const osc = AudioCtx.createOscillator()
    const gain = AudioCtx.createGain()
    osc.type = tipe
    osc.frequency.setValueAtTime(frek, t)
    gain.gain.setValueAtTime(volume, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + duur)
    osc.connect(gain); gain.connect(AudioCtx.destination)
    osc.start(t); osc.stop(t + duur)
  } catch { /* geen Web Audio nie — die spel werk steeds sonder klank */ }
}
function tril(patroon) {
  try { navigator.vibrate && navigator.vibrate(patroon) } catch {}
}

export default function HouDieVlam({ onClose }) {
  const [beste, setBeste]   = useState(() => leesBeste())
  const [staat, setStaat]   = useState('gereed')   // gereed | speel | klaar
  const [telling, setTelling] = useState(0)
  const [naSone, setNaSone] = useState(null)        // hoe ver van die middel toe verloor is
  const [nuweBeste, setNuweBeste] = useState(false)

  const doekRef = useRef(null)
  const wrapRef = useRef(null)
  const raamRef = useRef(null)

  /* Speeltoestand in 'n ref — die animasielus loop buite React se
     hertekenkringloop, presies soos Bou die Ark s'n. */
  const s = useRef({
    hoek: 0, spoed: BEGIN_SPOED, sone: BEGIN_SONE, tel: 0, laasT: 0,
  })

  const teken = useCallback(() => {
    const doek = doekRef.current
    if (!doek) return
    const g = doek.getContext('2d', { willReadFrequently: true })
    const w = doek.width, h = doek.height
    g.clearRect(0, 0, w, h)

    // agtergrond — warm, effens donker, soos 'n kers in 'n donker kamer
    const bg = g.createLinearGradient(0, 0, 0, h)
    bg.addColorStop(0, '#2A2140')
    bg.addColorStop(1, '#1B1530')
    g.fillStyle = bg
    g.fillRect(0, 0, w, h)

    const midY = h * 0.62
    const baanX0 = w * 0.1, baanX1 = w * 0.9
    const baanLen = baanX1 - baanX0

    // die "kers se pit" — 'n horisontale baan
    g.strokeStyle = 'rgba(255,255,255,0.14)'
    g.lineWidth = Math.max(2, h * 0.02)
    g.lineCap = 'round'
    g.beginPath()
    g.moveTo(baanX0, midY)
    g.lineTo(baanX1, midY)
    g.stroke()

    // die goue sone — die middel van die baan
    const soneHalf = (baanLen * s.current.sone) / 2
    const midX = (baanX0 + baanX1) / 2
    const soneGrad = g.createLinearGradient(midX - soneHalf, 0, midX + soneHalf, 0)
    soneGrad.addColorStop(0, 'rgba(224,184,114,0.15)')
    soneGrad.addColorStop(0.5, 'rgba(224,184,114,0.85)')
    soneGrad.addColorStop(1, 'rgba(224,184,114,0.15)')
    g.strokeStyle = soneGrad
    g.lineWidth = Math.max(3, h * 0.028)
    g.beginPath()
    g.moveTo(midX - soneHalf, midY)
    g.lineTo(midX + soneHalf, midY)
    g.stroke()

    // die vlam se posisie: 'n sinus oor die baan
    const frac = (Math.sin(s.current.hoek) + 1) / 2   // 0..1
    const vx = baanX0 + frac * baanLen
    const vy = midY - h * 0.02

    // flikker: 'n klein ewekansige jitter, onafhanklik van die tydsberekening
    const flik = 1 + Math.sin(s.current.hoek * 11) * 0.06

    const vlamH = h * 0.16 * flik
    const vlamW = vlamH * 0.62
    g.save()
    g.translate(vx, vy)
    const vg = g.createLinearGradient(0, -vlamH, 0, vlamH * 0.15)
    vg.addColorStop(0, '#FFF6D8')
    vg.addColorStop(0.35, '#FFC94D')
    vg.addColorStop(0.75, '#E0622C')
    vg.addColorStop(1, 'rgba(224,98,44,0)')
    g.fillStyle = vg
    g.beginPath()
    g.moveTo(0, vlamH * 0.15)
    g.bezierCurveTo(vlamW, -vlamH * 0.1, vlamW * 0.55, -vlamH * 0.85, 0, -vlamH)
    g.bezierCurveTo(-vlamW * 0.55, -vlamH * 0.85, -vlamW, -vlamH * 0.1, 0, vlamH * 0.15)
    g.fill()
    // 'n sagte gloed rondom die vlam
    g.shadowColor = 'rgba(255,201,77,0.9)'
    g.shadowBlur = vlamH * 0.9
    g.fill()
    g.restore()

    // die "kers" self — 'n klein reguit lyfie onder die baan
    g.fillStyle = 'rgba(255,255,255,0.22)'
    const kersW = Math.max(6, h * 0.05)
    g.fillRect(vx - kersW / 2, midY, kersW, h * 0.16)
  }, [])

  const stap = useCallback((nou) => {
    const st = s.current
    const dt = st.laasT ? Math.min(0.05, (nou - st.laasT) / 1000) : 0
    st.laasT = nou
    st.hoek += st.spoed * dt
    teken()
    raamRef.current = requestAnimationFrame(stap)
  }, [teken])

  /* ── Grootte: net uit die BREEDTE, nooit die hoogte nie — reël 4. ── */
  useEffect(() => {
    function pas() {
      const doek = doekRef.current, wrap = wrapRef.current
      if (!doek || !wrap) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const ruimte = wrap.clientWidth > 60 ? wrap.clientWidth - 24 : window.innerWidth - 24
      const breed = Math.max(160, ruimte)
      const nw = Math.floor(breed * dpr)
      const nh = Math.floor(breed * 0.62 * dpr)
      if (doek.width === nw && doek.height === nh) return
      doek.width = nw
      doek.height = nh
      teken()
    }
    pas()
    const t1 = setTimeout(pas, 60)
    window.addEventListener('resize', pas)
    window.addEventListener('orientationchange', pas)
    return () => {
      clearTimeout(t1)
      window.removeEventListener('resize', pas)
      window.removeEventListener('orientationchange', pas)
    }
  }, [teken])

  useEffect(() => {
    if (staat !== 'speel') return
    raamRef.current = requestAnimationFrame(stap)
    return () => { if (raamRef.current) cancelAnimationFrame(raamRef.current) }
  }, [staat, stap])

  function begin() {
    s.current = { hoek: -Math.PI / 2, spoed: BEGIN_SPOED, sone: BEGIN_SONE, tel: 0, laasT: 0 }
    setTelling(0)
    setNaSone(null)
    setNuweBeste(false)
    setStaat('speel')
  }

  function tik() {
    if (staat === 'gereed') { begin(); return }
    if (staat !== 'speel') return

    const st = s.current
    const frac = (Math.sin(st.hoek) + 1) / 2
    const afstandVanMiddel = Math.abs(frac - 0.5) * 2   // 0 = perfek, 1 = kant toe
    const soneHalf = st.sone / 2

    if (afstandVanMiddel <= soneHalf) {
      // TREFFER
      st.tel += 1
      st.spoed = Math.min(MAKS_SPOED, st.spoed + SPOED_OP)
      st.sone = Math.max(MIN_SONE, st.sone * SONE_KRIMP)
      setTelling(st.tel)
      const perfek = afstandVanMiddel <= soneHalf * 0.35
      speelToon(perfek ? 880 : 660, perfek ? 0.11 : 0.08, 'sine', perfek ? 0.16 : 0.12)
      tril(perfek ? [16] : [10])
    } else {
      // GEMIS — die spel is klaar, maar die TAAL bly liggies
      cancelAnimationFrame(raamRef.current)
      setNaSone(afstandVanMiddel - soneHalf)
      speelToon(220, 0.18, 'triangle', 0.13)
      tril([12, 40, 12])
      if (st.tel > beste) {
        setBeste(st.tel)
        skryfBeste(st.tel)
        setNuweBeste(true)
      }
      setStaat('klaar')
    }
  }

  return (
    <div className="hdv-oorlay">
      <div className="hdv-kop">
        <button className="hdv-ikoon" onClick={onClose} aria-label="Terug">✕</button>
        <span className="hdv-titel">Hou die Vlam</span>
        <span className="hdv-beste">Beste: {beste}</span>
      </div>

      <div className="hdv-tel-groot">{telling}</div>

      <div className="hdv-doek-wrap" ref={wrapRef} onClick={tik}>
        <canvas ref={doekRef} className="hdv-doek" />

        {staat === 'gereed' && (
          <div className="hdv-oorlegskerm">
            <p className="hdv-oorleg-lyf">
              Tik wanneer die vlam in die goue sone is. Hoe langer jy hou,
              hoe vinniger word dit.
            </p>
            <button className="hdv-knop" onClick={begin}>Begin</button>
          </div>
        )}

        {staat === 'klaar' && (
          <div className="hdv-oorlegskerm">
            <p className="hdv-oorleg-kop">
              {naSone < 0.04 ? 'So naby!' : 'Amper!'}
            </p>
            {nuweBeste && <p className="hdv-oorleg-nuut">🏅 Nuwe beste: {telling}</p>}
            <p className="hdv-oorleg-lyf">Jy het {telling} keer die vlam gehou.</p>
            <button className="hdv-knop" onClick={begin}>Probeer weer</button>
          </div>
        )}
      </div>

      <p className="hdv-fyn">Tik enige plek op die doek — geen presiese teiken nodig nie.</p>

      <DonationCard
        titel="Hou Daaglikse Hoop gratis"
        teks="Speletjies soos hierdie een bly altyd gratis. Jou bydrae help ons om dit so te hou."
        klas="hdv-steun"
      />
    </div>
  )
}
