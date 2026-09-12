/* ── REELS ──
 *
 * 'n Volskerm vertikale voer. Een clip op 'n slag, hy klik vas, en hy EINDIG.
 *
 * Die reëls staan in `src/data/reels.js` en is suiwer; hierdie lêer is die
 * skerm. Lees daardie kop eerste — veral waarom die voer bestaan (die skakel
 * wat uitgaan, nie die tyd in die app nie) en waarom 'n clip sonder 'n naam
 * glad nie wys nie.
 *
 * ── Drie dinge wat 'n mens nie uit die kode aflei nie ──
 *
 * **Net die AKTIEWE clip se speler is gemonteer.** Dit is nie 'n optimalisasie
 * nie, dit is die hele datarekening. Drie ingebedde spelers langs mekaar laai
 * drie videos, en op 'n foon met 'n data-bundel is dit die verskil tussen 'n
 * voer wat 'n mens gebruik en een wat sy toemaak. Dit doen ook die werk van 'n
 * pouse-knoppie: swiep sy weg, word die speler afgehaal en die klank hou op.
 * Daar is niks om te onthou om te stop nie.
 *
 * **Die klank begin STIL, en die "Tik vir klank" herbou die speler.** 'n Foon
 * weier om klank te speel voordat 'n mens getik het — "hardop" is nie 'n keuse
 * wat bestaan nie, dit is net 'n speler wat stilweg misluk. Tik sy, verander
 * die adres (`mute=0`) en die raam word herbou. Dit is 'n tik van 'n MENS, dus
 * laat die blaaier die klank deur. Dit is die enigste manier om dit sonder
 * YouTube se eie JS-API te doen, en dit is een reël in plaas van 'n biblioteek.
 *
 * **Die voer lees Firestore EEN keer** (`getDocs`, `limit(25)`), nooit 'n
 * `onSnapshot` nie. Om 06:30 maak duisende fone binne minute oop; 'n lewendige
 * luisteraar per mens is presies hoe die kwota verlede week opgeraak het.
 * Dieselfde besluit as Vandag se Tyd met God s'n, en dieselfde tydgrens:
 * `getDocs` het self GEEN tydgrens nie en kan vir altyd hang wanneer Android
 * die oortjie opgeskort het.
 *
 * En dit **aanvaar nooit 'n antwoord wat kleiner is as wat dit reeds het nie**.
 * Is die SDK vanlyn, bedien `getDocs` uit sy eie kas, en daardie kas hou net
 * wat die SDK al gesien het — een dokument, soms. Skryf ons dit sonder om te
 * kyk, is twintig clips met een vervang, en dit oorleef 'n herlaai.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { collection, query, limit, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { REELS_SAAI } from '../data/reelsLys'
import {
  skoonLys, volgordeVanaf, reelSkakel, deelBoodskap, magVraInstalleer, brugVir,
} from '../data/reels'
import { spelerAdres } from '../data/tiktokId'
import './Reels.css'

/* `getDocs` het self geen tydgrens nie. Sonder hierdie getal bly "Een
   oomblik..." vir altyd staan wanneer Android die oortjie opgeskort het. */
const HAAL_TYDGRENS = 10000

const KAS = 'cachedReels'
const KAS_TYD = 'cachedReelsTime'
const KAS_OUD = 6 * 60 * 60 * 1000

function leesKas() {
  try {
    const lys = JSON.parse(localStorage.getItem(KAS) || '[]')
    const tyd = parseInt(localStorage.getItem(KAS_TYD) || '0', 10)
    if (!Array.isArray(lys)) return { lys: [], tyd: 0 }
    return { lys, tyd }
  } catch { return { lys: [], tyd: 0 } }
}

function skryfKas(lys) {
  try {
    localStorage.setItem(KAS, JSON.stringify(lys))
    localStorage.setItem(KAS_TYD, String(Date.now()))
  } catch { /* privaat modus, of die berging is vol */ }
}

/* 'n Telling wat misluk, mag NIKS vir die mens breek nie. */
function tel(wat) {
  try {
    fetch('/api/reels-tel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wat }),
      keepalive: true,
    }).catch(() => {})
  } catch { /* niks */ }
}

/* ── Die speler se adres, per bron ──
 *
 * Die enigste plek waar 'n bron 'n URL word. Dit is met opset inprop-baar:
 * TikTok se speler is nie 'n ding waarop hierdie app sy hele voer moet bou nie,
 * en die dag wanneer dit verander, verander dit HIER. */
function spelerVir(klip, stil) {
  if (!klip) return ''
  if (klip.bron === 'youtube') {
    const v = new URLSearchParams({
      autoplay: '1',
      mute: stil ? '1' : '0',
      playsinline: '1',
      rel: '0',
      modestbranding: '1',
      loop: '1',
      playlist: klip.bronId,   /* loop=1 doen niks sonder hierdie veld */
    })
    return `https://www.youtube.com/embed/${klip.bronId}?${v.toString()}`
  }
  if (klip.bron === 'tiktok') return spelerAdres(klip.bronId, { speel: true })
  /* 'eie' — 'n lêer wat ons self bedien. */
  return String(klip.bronId || '')
}

export default function Reels({ deepId, onInstalleer, onNavigate, isInstalled }) {
  const [rou, setRou]       = useState(() => leesKas().lys)
  const [aktief, setAktief] = useState(0)
  const [stil, setStil]     = useState(true)
  const [wenk, setWenk]     = useState(true)
  const [laai, setLaai]     = useState(true)

  const voerRef    = useRef(null)
  const gesienRef  = useRef(1)
  const gevraRef   = useRef(false)
  const getelRef   = useRef(false)

  /* ── Die clips ──
     Die saai staan onder die gehaalde lys, nie in die plek daarvan nie: is daar
     iets in Firestore, wen dit; is daar niks, is die oortjie steeds nie leeg
     nie. */
  const klips = useMemo(() => {
    const gehaal = skoonLys(rou)
    const lys = gehaal.length ? gehaal : skoonLys(REELS_SAAI)
    return volgordeVanaf(lys, deepId || null)
  }, [rou, deepId])

  /* ── Een lees, met 'n tydgrens ── */
  useEffect(() => {
    let lewendig = true
    const kas = leesKas()
    if (kas.lys.length && Date.now() - kas.tyd < KAS_OUD) setLaai(false)

    ;(async () => {
      try {
        const q = query(collection(db, 'reels'), limit(25))
        const snap = await Promise.race([
          getDocs(q),
          new Promise((_, nee) => setTimeout(() => nee(new Error('te lank')), HAAL_TYDGRENS)),
        ])
        if (!lewendig) return
        const lys = snap.docs.map(d => ({ id: d.id, ...d.data() }))

        /* NOOIT 'n antwoord aanvaar wat kleiner is as wat ons reeds het nie.
           'n Vanlyn SDK bedien uit sy eie kas en gee soms EEN dokument. */
        const skoon = skoonLys(lys)
        if (skoon.length && skoon.length >= skoonLys(kas.lys).length) {
          setRou(lys)
          skryfKas(lys)
        }
      } catch {
        /* Die kas of die saai dra die skerm. Dit is nie 'n foutskerm werd nie. */
      } finally {
        if (lewendig) setLaai(false)
      }
    })()

    return () => { lewendig = false }
  }, [])

  /* 'n Gedeelde skakel is oopgemaak. Een keer per oopmaak, nooit per clip. */
  useEffect(() => {
    if (!deepId || getelRef.current) return
    getelRef.current = true
    tel('oopgemaak')
  }, [deepId])

  /* ── Watter clip is op die skerm ── */
  useEffect(() => {
    const voer = voerRef.current
    if (!voer) return
    const dele = Array.from(voer.querySelectorAll('[data-reel]'))
    if (!dele.length) return

    const kyker = new IntersectionObserver(inskrywings => {
      for (const e of inskrywings) {
        if (!e.isIntersecting) continue
        const i = Number(e.target.getAttribute('data-reel'))
        if (!Number.isFinite(i)) continue
        setAktief(i)
        gesienRef.current = Math.max(gesienRef.current, i + 1)
        if (i > 0) setWenk(false)

        /* Ná die TWEEDE swiep, en nie 'n oomblik vroeër nie. Die hele besluit
           staan in `magVraInstalleer()`. */
        if (magVraInstalleer({
          gesien: gesienRef.current,
          reedsGevra: gevraRef.current,
          geinstalleer: isInstalled,
        })) {
          gevraRef.current = true
          if (onInstalleer) onInstalleer()
        }
      }
    }, { root: voer, threshold: 0.6 })

    dele.forEach(d => kyker.observe(d))
    return () => kyker.disconnect()
  }, [klips.length, isInstalled, onInstalleer])

  /* Die wenk gaan vanself weg. */
  useEffect(() => {
    if (!wenk) return
    const t = setTimeout(() => setWenk(false), 4000)
    return () => clearTimeout(t)
  }, [wenk])

  const deel = useCallback(async (klip) => {
    const skakel = reelSkakel(klip.id)
    if (!skakel) return
    const teks = deelBoodskap(klip, skakel)
    tel('gedeel')
    try {
      if (navigator.share) { await navigator.share({ text: teks }); return }
      await navigator.clipboard.writeText(teks)
      window.dispatchEvent(new CustomEvent('wys-kennis', { detail: 'Skakel gekopieer' }))
    } catch { /* sy het gekanselleer; dis nie 'n fout nie */ }
  }, [])

  if (laai && !klips.length) {
    return (
      <div className="reels reels-leeg">
        <p>Een oomblik…</p>
      </div>
    )
  }

  return (
    <div className="reels">
      <div className="reels-voer" ref={voerRef}>
        {klips.map((klip, i) => {
          const brug = brugVir(klip)
          return (
            <section className="reel" key={klip.id} data-reel={i}>
              {/* Net die AKTIEWE speler is gemonteer. Sien die kop. */}
              {i === aktief ? (
                <iframe
                  className="reel-speler"
                  /* Die sleutel dra `stil` sodat "Tik vir klank" die raam
                     HERBOU. 'n Blote src-verandering laat YouTube se speler
                     soms stil bly. */
                  key={`${klip.id}-${stil ? 'stil' : 'klank'}`}
                  src={spelerVir(klip, stil)}
                  title={klip.naam}
                  allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
                  allowFullScreen
                  loading="eager"
                />
              ) : (
                <div className="reel-wag" aria-hidden="true" />
              )}

              {wenk && i === aktief && stil && (
                <button className="reel-wenk" onClick={() => { setStil(false); setWenk(false) }}>
                  Tik vir klank
                </button>
              )}

              <div className="reel-rail">
                <button className="reel-knop" onClick={() => deel(klip)} aria-label={`Deel ${klip.naam} se boodskap`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v13" /><path d="m7.5 7.5 4.5-4.5 4.5 4.5" />
                    <path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
                  </svg>
                  <span>Deel</span>
                </button>
              </div>

              <div className="reel-onder">
                <div className="reel-maker">
                  <b>{klip.naam}</b>
                  {klip.handvatsel && <small>{klip.handvatsel}</small>}
                </div>
                {klip.woorde && <p className="reel-woorde">{klip.woorde}</p>}
                {brug && (
                  <button
                    className="reel-brug"
                    onClick={() => {
                      if (brug.gebeurtenis === 'gaan-luister') { if (onNavigate) onNavigate('luister'); return }
                      window.dispatchEvent(new CustomEvent(brug.gebeurtenis))
                    }}
                  >
                    {brug.woorde}
                  </button>
                )}
              </div>
            </section>
          )
        })}

        {/* ── Die einde ──
            Die voer rol nie vir ewig nie. 'n Voer sonder 'n einde is een
            waarvan 'n mens skuldig opstaan. */}
        {/* `data-reel="-1"` is nie 'n truuk nie — dit is die rede waarom niks
            meer speel wanneer 'n mens hier kom nie. Sonder dit word die
            einde-blad nie dopgehou, bly `aktief` op die laaste clip staan, en
            speel daardie video agter hierdie skerm aan: klank uit 'n toe skerm,
            en data wat aanhou loop. Die blaaierlopie het dit gevang. */}
        <section className="reel-einde" data-reel="-1">
          <span className="reel-einde-merk">Dis al vir vandag</span>
          <p className="reel-einde-lyn">Jy het by die einde gekom.</p>
          <p className="reel-einde-sub">
            Nuwe oomblikke elke week. Dit rol nie vir ewig nie — en dit is die punt.
          </p>
          <button
            className="reel-einde-knop"
            onClick={() => { const v = voerRef.current; if (v) v.scrollTo({ top: 0, behavior: 'smooth' }) }}
          >
            Terug na bo
          </button>
          <button className="reel-einde-stil" onClick={() => onNavigate && onNavigate('luister')}>
            Gaan na vandag se boodskap
          </button>
        </section>
      </div>
    </div>
  )
}
