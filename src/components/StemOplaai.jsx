/* ── Die week se stemboodskap OPLAAI ──
 *
 * Dewald: "waar is die voice note en alles. iets is fout."
 *
 * Hy was reg en dit was my fout. Ek het 'n TEKSVELDJIE gebou waarin 'n mens 'n
 * adres moes plak. Maar 'n adres bestaan nie voordat die lêer erens is nie, en
 * daar was nêrens om hom te sit nie. Ek het dus 'n veld gegee vir 'n ding wat
 * niemand kon maak — dieselfde soort gat as die dag toe die Publiseer-knoppie
 * ontbreek het.
 *
 * Dit is nou presies soos die daaglikse stemboodskap in Admin.jsx werk:
 *
 *   · KIES 'N LÊER van die foon af, of
 *   · NEEM DIT HIER OP met die foon se mikrofoon.
 *
 * Dit gaan na dieselfde `audio/`-vouer in Firebase Storage as elke ander
 * stemnota in hierdie app — en dit is nie toevallig nie. `magKas()` in
 * kasBesluit.js hou ALLES in daardie vouer uit die diensketter se kas uit,
 * want 'n <audio> vra grepe met 'n Range-kop en 'n kas weet niks daarvan nie.
 * Dit is die fout wat die speler drie dae lank stukkend gehad het. 'n
 * Stemboodskap wat elders beland, sou daardie beskerming verloor.
 */
import { useRef, useState } from 'react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'
import './StemOplaai.css'

const tyd = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function StemOplaai({ week, waarde, op }) {
  const leerRef = useRef(null)
  const mrRef   = useRef(null)
  const stukkeRef = useRef([])
  const tikRef  = useRef(null)

  const [besig, setBesig]   = useState(false)
  const [pers, setPers]     = useState(0)
  const [fout, setFout]     = useState(null)
  const [neem, setNeem]     = useState(false)
  const [sek, setSek]       = useState(0)

  async function stuurOp(leer) {
    if (!leer) return
    setBesig(true); setPers(0); setFout(null)
    try {
      const uit = (leer.name.split('.').pop() || 'webm').toLowerCase()
      /* Die naam dra die weeknommer sodat 'n mens in Storage kan sien wat wat
         is. Die tydstempel keer dat 'n nuwe opname deur die blaaier se kas
         agtergehou word wanneer hy 'n week s'n vervang. */
      const naam = `vj-week-${week}-${Date.now()}.${uit}`
      const plek = ref(storage, `audio/${naam}`)

      const url = await new Promise((klaar, val) => {
        const taak = uploadBytesResumable(plek, leer)
        taak.on('state_changed',
          s => setPers(Math.round(s.bytesTransferred / s.totalBytes * 100)),
          val,
          async () => klaar(await getDownloadURL(taak.snapshot.ref)),
        )
      })
      op(url)
    } catch (e) {
      setFout('Die oplaai het misluk: ' + (e && e.message))
    } finally {
      setBesig(false)
    }
  }

  async function beginNeem() {
    setFout(null)
    stukkeRef.current = []
    setSek(0)
    try {
      const stroom = await navigator.mediaDevices.getUserMedia({ audio: true })
      const soort = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', '']
        .find(t => !t || (window.MediaRecorder && MediaRecorder.isTypeSupported(t)))
      const mr = new MediaRecorder(stroom, soort ? { mimeType: soort } : {})
      mrRef.current = mr
      mr.ondataavailable = e => { if (e.data.size > 0) stukkeRef.current.push(e.data) }
      mr.onstop = () => {
        stroom.getTracks().forEach(t => t.stop())
        const mime = mr.mimeType || 'audio/webm'
        const uit = mime.includes('mp4') ? 'm4a' : 'webm'
        const blob = new Blob(stukkeRef.current, { type: mime })
        stuurOp(new File([blob], `opname.${uit}`, { type: mime }))
      }
      mr.start()
      setNeem(true)
      tikRef.current = setInterval(() => setSek(s => s + 1), 1000)
    } catch {
      setFout('Die mikrofoon is nie beskikbaar nie. Gaan na jou foon se instellings, of kies eerder ’n lêer.')
    }
  }

  function stopNeem() {
    if (mrRef.current && mrRef.current.state === 'recording') mrRef.current.stop()
    setNeem(false)
    clearInterval(tikRef.current)
  }

  return (
    <div className="so">
      <div className="so-kop">DIE WEEK SE STEMBOODSKAP</div>

      {/* Wat reeds daar is. 'n Mens moet dit KAN LUISTER voor hy publiseer —
          'n verkeerde lêer wat na ses duisend mense gaan, is nie iets wat 'n
          mens uit 'n adres kan sien nie. */}
      {waarde ? (
        <div className="so-daar">
          <div className="so-daar-kop">✓ Die stemboodskap is opgelaai</div>
          <audio controls src={waarde} preload="none" />
          <button className="so-vee" onClick={() => op('')}>Haal dit af</button>
        </div>
      ) : (
        <p className="so-leeg">
          Daar is nog geen stemboodskap vir hierdie week nie. Die skerm sê
          solank “Die stemboodskap kom binnekort” in plaas daarvan om ’n dooie
          speler te wys.
        </p>
      )}

      {besig ? (
        <div className="so-besig">
          <div className="so-balk"><div className="so-vul" style={{ width: `${pers}%` }} /></div>
          <span>Besig om op te laai… {pers}%</span>
        </div>
      ) : neem ? (
        <button className="so-stop" onClick={stopNeem}>
          ⏹  Stop die opname · {tyd(sek)}
        </button>
      ) : (
        <div className="so-knoppe">
          <button className="so-knop" onClick={() => leerRef.current && leerRef.current.click()}>
            📁  Kies ’n klanklêer
          </button>
          <button className="so-knop" onClick={beginNeem}>
            🎙  Neem dit hier op
          </button>
        </div>
      )}

      <input
        ref={leerRef} type="file" style={{ display: 'none' }}
        accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac,.webm"
        onChange={e => { const f = e.target.files && e.target.files[0]; e.target.value = ''; stuurOp(f) }}
      />

      {fout && <p className="so-fout">{fout}</p>}
    </div>
  )
}
