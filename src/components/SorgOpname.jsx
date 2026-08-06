/* ────────────────────────────────────────────────────────────
   Dewald se stemantwoord — kies 'n lêer, of neem dit hier op.

   Dit werk presies soos die stemnotas op Luister, want dit is wat hy gevra
   het: "dit werk soos die voicenotes wat ek op Luister nou oplaai". Voorheen
   kon 'n mens hier net 'n SKAKEL plak, en dan moes hy die klanklêer eers
   iewers anders gaan oplaai. Dit is 'n omweg wat niemand elke dag gaan loop
   nie.

   Twee paaie, en albei eindig in dieselfde plek:

     Kies 'n lêer   → Firebase Storage → 'n skakel
     Neem nou op    → Firebase Storage → 'n skakel

   Die opname gebeur in die blaaier met MediaRecorder, dieselfde as op
   Luister. Op 'n foon is dit die vinnigste pad: hy lees die boodskap, druk
   Opneem, praat, en dis klaar.

   Die klanklêers le onder `audio/`, saam met die Luister-notas, met 'n
   `sorg-antwoord_`-voorvoegsel sodat 'n mens hulle uitken.

   Hulle het eers onder `sorg-antwoorde/` gegaan, wat netjieser was — maar
   Firebase Storage se reels laat net sekere paaie toe, en daardie reels
   staan in die Firebase-konsole en NIE in hierdie kodebasis nie. Die eerste
   oplaai het met 'storage/unauthorized' gedruip. `audio/` werk klaar, want
   die stemnotas gaan al jare daarheen.

   Wil 'n mens hulle later apart he, moet die reel eers in die konsole
   bygesit word — daarna is dit een reel hier.
   ──────────────────────────────────────────────────────────── */

import { useState, useRef, useEffect } from 'react'
import { storage } from '../firebase'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'

/* Vyf-en-twintig megagreep. 'n Stemantwoord van tien minute is sowat 10 MB;
   verby hierdie punt is dit 'n verkeerde lêer, en 'n mens moet dit weet
   VOORDAT hy vyf minute lank op 'n swak lyn wag. */
const MAKS_GREPE = 25 * 1024 * 1024

function megagrepe(n) {
  return (n / (1024 * 1024)).toFixed(1).replace('.', ',') + ' MB'
}

function tyd(s) {
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export default function SorgOpname({ bron, onBron }) {
  const [lêer, setLêer] = useState(null)
  const [voorskou, setVoorskou] = useState(null)
  const [besigOpneem, setBesigOpneem] = useState(false)
  const [sekondes, setSekondes] = useState(0)
  const [vordering, setVordering] = useState(null)   // null = nie besig nie
  const [fout, setFout] = useState('')

  const opnemerRef = useRef(null)
  const stukkeRef = useRef([])
  const tellerRef = useRef(null)
  const kiesRef = useRef(null)

  useEffect(() => () => {
    clearInterval(tellerRef.current)
    if (voorskou) URL.revokeObjectURL(voorskou)
  }, [voorskou])

  function maakSkoon() {
    if (voorskou) URL.revokeObjectURL(voorskou)
    setVoorskou(null)
    setLêer(null)
    setSekondes(0)
    setFout('')
  }

  function kiesLêer(e) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    maakSkoon()
    if (f.size > MAKS_GREPE) {
      setFout(`Daardie lêer is ${megagrepe(f.size)}. Die perk is ${megagrepe(MAKS_GREPE)} — kies 'n korter opname.`)
      return
    }
    setLêer(f)
    setVoorskou(URL.createObjectURL(f))
  }

  async function beginOpneem() {
    maakSkoon()
    stukkeRef.current = []
    try {
      const stroom = await navigator.mediaDevices.getUserMedia({ audio: true })
      const tipe = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', '']
        .find(t => !t || MediaRecorder.isTypeSupported(t))
      const mr = new MediaRecorder(stroom, tipe ? { mimeType: tipe } : {})
      opnemerRef.current = mr
      mr.ondataavailable = e => { if (e.data.size > 0) stukkeRef.current.push(e.data) }
      mr.onstop = () => {
        stroom.getTracks().forEach(t => t.stop())
        const mime = mr.mimeType || 'audio/webm'
        const blob = new Blob(stukkeRef.current, { type: mime })
        const ext = mime.includes('mp4') ? 'm4a' : 'webm'
        const f = new File([blob], `antwoord_${Date.now()}.${ext}`, { type: mime })
        setLêer(f)
        setVoorskou(URL.createObjectURL(blob))
      }
      mr.start()
      setBesigOpneem(true)
      /* Vyftien minute, en dan stop dit self. 'n Opnemer wat aanhou loop omdat
         iemand vergeet het om Stop te druk, vreet die foon se batery en maak
         'n lêer wat nooit gaan oplaai nie. */
      tellerRef.current = setInterval(() => setSekondes(s => {
        if (s + 1 >= 15 * 60) stopOpneem()
        return s + 1
      }), 1000)
    } catch {
      setFout('Die mikrofoon is geweier. Gaan na jou foon se instellings om dit toe te laat.')
    }
  }

  function stopOpneem() {
    if (opnemerRef.current && opnemerRef.current.state === 'recording') opnemerRef.current.stop()
    clearInterval(tellerRef.current)
    setBesigOpneem(false)
  }

  async function laaiOp() {
    if (!lêer) return
    setFout('')
    setVordering(0)
    try {
      const ext = (lêer.name.split('.').pop() || 'webm').toLowerCase()
      const id = `sorg-antwoord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      const sRef = ref(storage, `audio/${id}.${ext}`)
      const url = await new Promise((klaar, breek) => {
        const taak = uploadBytesResumable(sRef, lêer)
        taak.on('state_changed',
          s => setVordering(Math.round(s.bytesTransferred / s.totalBytes * 100)),
          breek,
          async () => klaar(await getDownloadURL(taak.snapshot.ref)))
      })
      setVordering(null)
      onBron(url)
      maakSkoon()
    } catch (e) {
      setVordering(null)
      setFout('Oplaai het misluk: ' + (e && e.message))
    }
  }

  /* Klaar opgelaai — wys wat daar is, met 'n pad terug. */
  if (bron) {
    return (
      <div className="so">
        <div className="so-klaar">✅ Die stemboodskap is opgelaai</div>
        <audio className="so-speler" controls preload="metadata" src={bron} />
        <button className="sk-knop" onClick={() => onBron('')}>Kies 'n ander een</button>
      </div>
    )
  }

  return (
    <div className="so">
      {!lêer && !besigOpneem && (
        <div className="so-knoppe">
          <button className="sk-knop" onClick={() => kiesRef.current && kiesRef.current.click()}>
            Kies 'n klanklêer
          </button>
          <button className="sk-knop so-opneem" onClick={beginOpneem}>
            Neem nou op
          </button>
        </div>
      )}

      <input
        ref={kiesRef}
        type="file"
        accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac,.webm"
        style={{ display: 'none' }}
        onChange={kiesLêer}
      />

      {besigOpneem && (
        <div className="so-besig">
          <span className="so-kol" aria-hidden="true" />
          Besig om op te neem · {tyd(sekondes)}
          <button className="sk-knop sk-plaas" onClick={stopOpneem}>Stop</button>
        </div>
      )}

      {lêer && !besigOpneem && (
        <>
          <div className="so-naam">{lêer.name} · {megagrepe(lêer.size)}</div>
          {voorskou && <audio className="so-speler" controls preload="metadata" src={voorskou} />}
          <div className="so-knoppe">
            <button className="sk-knop sk-plaas" disabled={vordering !== null} onClick={laaiOp}>
              {vordering === null ? 'Laai op' : `Besig… ${vordering}%`}
            </button>
            <button className="sk-knop" disabled={vordering !== null} onClick={maakSkoon}>Los</button>
          </div>
        </>
      )}

      {fout && <div className="admin-error">{fout}</div>}
    </div>
  )
}
