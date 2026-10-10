import { useState, useEffect, useRef, useMemo } from 'react'
import { maakStukke, totaleStukke, kiesStem } from '../data/luisterStukke'
import './LuisterSpeler.css'

/* ── DIE LUISTER-SPELER ──
 *
 * Lees 'n Engelse e-boek se onttrekte teks voor met die foon se eie
 * text-to-speech (`speechSynthesis`). Dewald se MVP: browser-TTS, gratis, op
 * elke toestel. Die stem verskil per toestel — dit is die bekende prys, en
 * later kan dieselfde teks AI-stem-oudio voed.
 *
 * ── Waarom 'n volgnommer (seqRef) ──
 *
 * `speechSynthesis.cancel()` laat die vorige uiting se `onend`/`onerror` ook
 * vuur. Sonder 'n wag sou 'n pouse of 'n hoofstuk-sprong die ou terugroep laat
 * "aangaan" en twee stemme aanmekaar ja. Elke speel kry 'n nommer; 'n terugroep
 * wat nie meer die huidige nommer dra nie, doen niks. Dit is die enigste
 * betroubare manier oor Chrome, Safari en Samsung Internet heen.
 *
 * ── Waarom KANSELLEER by pouse en nie `pause()` nie ──
 *
 * `speechSynthesis.pause()` is onbetroubaar op 'n foon (veral Android). Ons
 * kanselleer en onthou die STUK; "speel weer" begin die huidige stuk oor. Omdat
 * 'n stuk sowat een sin is (sien luisterStukke.js), hoor 'n mens skaars die
 * herhaling.
 *
 * ── Hervat ──
 *
 * Die posisie (hoofstuk + stuk) lê in localStorage per boek, en dit begin daar
 * wanneer 'n mens terugkom. Dit begin NIE vanself speel nie: 'n blaaier laat
 * klank net ná 'n tik toe, en die ▶-knoppie is daardie tik.
 */
export default function LuisterSpeler({ afdelings, titel, bookId }) {
  const steun = typeof window !== 'undefined' && 'speechSynthesis' in window
  const POS_SLEUTEL = `luister_pos_${bookId}`

  /* Die stukke per afdeling — een keer bereken. */
  const stukkePerAfd = useMemo(
    () => (Array.isArray(afdelings) ? afdelings : []).map(a => maakStukke(a && a.teks)),
    [afdelings]
  )
  const totaal = useMemo(() => totaleStukke(afdelings), [afdelings])

  const beginPos = (() => {
    try {
      const d = JSON.parse(localStorage.getItem(POS_SLEUTEL) || 'null')
      if (d && Number.isInteger(d.sek) && Number.isInteger(d.stuk)
          && d.sek < stukkePerAfd.length && d.stuk < (stukkePerAfd[d.sek]?.length ?? 0)) return d
    } catch {}
    return { sek: 0, stuk: 0 }
  })()

  const [sek, setSek]     = useState(beginPos.sek)
  const [stuk, setStuk]   = useState(beginPos.stuk)
  const [speel, setSpeel] = useState(false)
  const [spoed, setSpoed] = useState(1)

  const synth   = steun ? window.speechSynthesis : null
  const stemRef = useRef(null)
  const seqRef  = useRef(0)
  const posRef  = useRef({ sek: beginPos.sek, stuk: beginPos.stuk })
  const spoedRef = useRef(1)
  const speelRef = useRef(false)
  const uitingRef = useRef(null)

  /* ── Kies 'n Engelse stem ── */
  useEffect(() => {
    if (!synth) return
    function laai() {
      const v = synth.getVoices()
      if (v && v.length) stemRef.current = kiesStem(v)
    }
    laai()
    synth.onvoiceschanged = laai
    return () => { try { synth.onvoiceschanged = null } catch {} }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Stop alles by unmount ── */
  useEffect(() => {
    return () => { seqRef.current++; try { synth && synth.cancel() } catch {} }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function bewaarPos(s, t) {
    try { localStorage.setItem(POS_SLEUTEL, JSON.stringify({ sek: s, stuk: t })) } catch {}
  }

  function stel(s, t) {
    posRef.current = { sek: s, stuk: t }
    setSek(s); setStuk(t)
    bewaarPos(s, t)
  }

  /* hoe:
   *   'ketting'   — die vorige stuk is pas klaar; GEEN cancel nie (dit sou die
   *                 ry stukke self onderbreek);
   *   'tik'       — die ▶-druk. Spreek SINKROON, binne die tik: iOS laat die
   *                 eerste uiting net binne 'n gebruikersgebaar toe;
   *   'onderbreek'— hoofstuk-sprong of spoed terwyl dit praat. Cancel, en
   *                 spreek eers ná 'n kort wag: WebKit sluk 'n speak() wat
   *                 direk ná cancel() kom. */
  function spreek(s, t, hoe = 'ketting') {
    if (!synth) return
    const afdStukke = stukkePerAfd[s]
    if (!afdStukke) { klaar(); return }
    if (t >= afdStukke.length) { // volgende hoofstuk
      if (s + 1 < stukkePerAfd.length) return spreek(s + 1, 0, hoe)
      return klaar()
    }
    stel(s, t)
    const u = new SpeechSynthesisUtterance(afdStukke[t])
    u.rate = spoedRef.current
    if (stemRef.current) { u.voice = stemRef.current; u.lang = stemRef.current.lang }
    else u.lang = 'en-US'
    const mySeq = ++seqRef.current
    const gaanVoort = () => {
      if (mySeq !== seqRef.current) return       // 'n ou terugroep ná cancel — ignoreer
      const volgende = t + 1
      if (volgende < afdStukke.length) spreek(s, volgende)
      else if (s + 1 < stukkePerAfd.length) spreek(s + 1, 0)
      else klaar()
    }
    u.onend = gaanVoort
    u.onerror = gaanVoort                          // een slegte stuk mag nie die boek stop nie
    /* Hou die uiting vas: Chrome se vullisverwyderaar vat 'n uiting waarna
     * niemand meer verwys nie, en dan vuur `onend` nooit — die boek stop
     * stilweg ná een sin. */
    uitingRef.current = u
    const praat = () => {
      if (mySeq !== seqRef.current) return
      try { synth.resume() } catch {}              // Chrome kan in 'n "gepouseerde" toestand vassit
      try { synth.speak(u) } catch {}
    }
    if (hoe === 'onderbreek') {
      try { synth.cancel() } catch {}
      setTimeout(praat, 80)
    } else {
      if (hoe === 'tik' && (synth.speaking || synth.pending)) { try { synth.cancel() } catch {} }
      praat()
    }
  }

  function klaar() {
    speelRef.current = false
    setSpeel(false)
    stel(0, 0)                                     // volgende keer begin dit vooraan
  }

  function speelOfPouse() {
    if (!synth) return
    if (speelRef.current) {
      seqRef.current++                             // maak enige hangende terugroep ongeldig
      try { synth.cancel() } catch {}
      speelRef.current = false
      setSpeel(false)
    } else {
      speelRef.current = true
      setSpeel(true)
      spreek(posRef.current.sek, posRef.current.stuk, 'tik')
    }
  }

  function springHoofstuk(rigting) {
    const nuwe = Math.min(Math.max(posRef.current.sek + rigting, 0), stukkePerAfd.length - 1)
    stel(nuwe, 0)
    if (speelRef.current) spreek(nuwe, 0, 'onderbreek')
  }

  function stelSpoed(v) {
    setSpoed(v); spoedRef.current = v
    if (speelRef.current) spreek(posRef.current.sek, posRef.current.stuk, 'onderbreek')  // herbegin huidige stuk teen die nuwe spoed
  }

  if (!steun) {
    return (
      <div className="ls">
        <p className="ls-geen">This browser can't read aloud. Try Chrome or Safari, or read the PDF instead.</p>
      </div>
    )
  }

  /* Vordering: hoeveel stukke voor hierdie posisie, oor die totaal. */
  const gedaan = stukkePerAfd.slice(0, sek).reduce((n, a) => n + a.length, 0) + stuk
  const persent = totaal ? Math.min(100, Math.round((gedaan / totaal) * 100)) : 0
  const afdTitel = afdelings[sek]?.titel || ''

  return (
    <div className="ls">
      <div className="ls-top">
        <div className="ls-titel">{titel}</div>
        <div className="ls-hoofstuk">Chapter {sek + 1} of {stukkePerAfd.length}</div>
      </div>
      {afdTitel && <div className="ls-afd-titel">{afdTitel}</div>}

      <div className="ls-bar"><i style={{ width: `${persent}%` }} /></div>

      <div className="ls-ctrl">
        <button className="ls-knop" onClick={() => springHoofstuk(-1)} disabled={sek === 0} aria-label="Previous chapter">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h2v14H6zM20 5v14l-11-7z" /></svg>
        </button>
        <button className="ls-speel" onClick={speelOfPouse} aria-label={speel ? 'Pause' : 'Play'}>
          {speel
            ? <svg viewBox="0 0 24 24" fill="#201A2E"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
            : <svg viewBox="0 0 24 24" fill="#201A2E"><path d="M8 5v14l11-7z" /></svg>}
        </button>
        <button className="ls-knop" onClick={() => springHoofstuk(1)} disabled={sek >= stukkePerAfd.length - 1} aria-label="Next chapter">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 5h2v14h-2zM4 5l11 7-11 7z" /></svg>
        </button>
      </div>

      <div className="ls-spoed">
        {[1, 1.25, 1.5].map(v => (
          <button key={v} className={`ls-spoed-knop${spoed === v ? ' on' : ''}`} onClick={() => stelSpoed(v)}>
            {v}×
          </button>
        ))}
      </div>
    </div>
  )
}
