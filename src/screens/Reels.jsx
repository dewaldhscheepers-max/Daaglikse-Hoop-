/* ── REELS ──
 *
 * 'n Volskerm vertikale voer. Een clip op 'n slag, hy klik vas, en hy HOU AAN.
 *
 * Die reëls staan in `src/data/reels.js` en is suiwer; hierdie lêer is die
 * skerm. Lees daardie kop eerste — veral waarom die voer bestaan (die skakel
 * wat uitgaan, nie die tyd in die app nie), waarom die volgorde toevallig is,
 * en waarom 'n clip sonder 'n naam glad nie wys nie.
 *
 * ── Vier dinge wat 'n mens nie uit die kode aflei nie ──
 *
 * **Die voer eindig nie.** Dit het, en Dewald het dit op 12 September 2026
 * gesien: *"nee man fok haal dit af... dis onvriendelik... wys alles wat daar is
 * om te wys... dit moet aangaan."* Hy was reg. Elke pas is 'n nuwe skommeling,
 * en sodra 'n mens naby die einde van wat gebou is kom, word die volgende pas
 * bygesit. Die "jy het alles gesien"-kaart kom EEN keer, ná die eerste volle
 * pas, en 'n mens swiep daaraan verby.
 *
 * **Die volgorde word uit 'n SAAD gebou, nie uit `Math.random()` nie.** Die voer
 * word herbou elke keer as 'n pas bykom. Met 'n saad bly die stuk wat sy reeds
 * gesien het presies dieselfde en kom daar net iets by; met `Math.random()` sou
 * die voer onder haar vingers herskommel. Die saad word EEN keer per oopmaak
 * gekies, dus is elke besoek se volgorde anders.
 *
 * **Net die AKTIEWE clip se speler is gemonteer.** Dit is nie 'n optimalisasie
 * nie, dit is die hele datarekening: drie ingebedde spelers langs mekaar laai
 * drie videos, en op 'n foon met 'n data-bundel is dit die verskil tussen 'n
 * voer wat 'n mens gebruik en een wat sy toemaak. Dit doen ook die werk van 'n
 * pouse-knoppie — swiep sy weg, word die speler afgehaal en die klank hou op.
 * Daar is niks om te onthou om te stop nie, en dit is ook waarom niks agter die
 * mylpaal-kaart aanspeel nie: daardie kaart is nie 'n clip nie.
 *
 * **Die klank begin STIL, en die "Tik vir klank" herbou die speler.** 'n Foon
 * weier om klank te speel voordat 'n mens getik het — "hardop" is nie 'n keuse
 * wat bestaan nie, dit is net 'n speler wat stilweg misluk. Tik sy, verander die
 * `key` van die raam (`mute=0`) en die raam word herbou. Dit is 'n tik van 'n
 * MENS, dus laat die blaaier die klank deur. Een reël in plaas van YouTube se
 * eie JS-API.
 *
 * ── Waar die clips vandaan kom ──
 *
 * Deur `api/reels-lys.mjs`, nie deur Firestore direk nie. Dit was 'n
 * `getDocs(collection(db, 'reels'))`, en dan moet daar 'n `allow read` in
 * `firestore.rules` staan — en daardie reël moet GEPUBLISEER word. Dewald het
 * dit twee keer op 'n foon probeer; die Firebase-konsole se reëls-redigeerder is
 * op 'n foon onbruikbaar, en ek kan dit nie van hier doen nie.
 *
 * Die eindpunt lees met die diensrekening, wat die reëls omseil. `reels` bly dus
 * heeltemal TOE vir kliënte, niks hoef gepubliseer te word nie, en die WITLYS in
 * `reelsOpenbaar.js` kom gratis saam. Dieselfde besluit as VOLG JESUS s'n.
 *
 * EEN lees per foon, met 'n tydgrens — en die rand kas die eindpunt vyf minute,
 * dus tref duisende fone om 06:30 die kas en nie die funksie nie.
 *
 * En dit **aanvaar nooit 'n antwoord wat kleiner is as wat dit reeds het nie**.
 * 'n Halwe antwoord — 'n eindpunt wat 'n leë lys gee omdat Firestore net nie
 * opgekom het nie — mag nie twintig clips met nul vervang nie, want daardie
 * skryf oorleef 'n herlaai.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { REELS_SAAI } from '../data/reelsLys'
import {
  skoonLys, bouVoer, reelSkakel, deelBoodskap, magVraInstalleer, brugVir,
} from '../data/reels'
import { spelerAdres } from '../data/tiktokId'
import './Reels.css'

/* 'n Haal sonder tydgrens bly vir altyd staan wanneer Android die oortjie
   opgeskort het, en dan sit "Een oomblik..." daar tot die mens die app toemaak.
   Dieselfde les as Luister se `getDocs`. */
const HAAL_TYDGRENS = 10000

const KAS = 'cachedReels'
const KAS_TYD = 'cachedReelsTime'
const KAS_OUD = 6 * 60 * 60 * 1000

/* Het hierdie foon al ALLES gesien? Dit is die enigste ding wat 'n "nuwe kyker"
   van 'n bekende een skei. Sien `eenPas()` in reels.js: 'n nuwe kyker kry die
   MEES GEDEELDE clips bo, 'n bekende een die NUUTSTE. */
const ALLES = 'reels_alles_gesien'

/* Hoeveel passe vooruit gebou word, en hoeveel clips voor die einde 'n nuwe pas
   bygesit word. Drie is genoeg dat 'n mens nooit die onderkant sien nie. */
const PASSE_BEGIN = 3
const BOU_VOORUIT = 4

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

function isAllesGesien() {
  try { return localStorage.getItem(ALLES) === '1' } catch { return false }
}

function merkAllesGesien() {
  try { localStorage.setItem(ALLES, '1') } catch { /* privaat modus */ }
}

/* ── Een deel per clip per TOESTEL ──
 *
 * Die clip se eie `gedeel` rangskik 'n nuwe kyker se voer, en dan is die
 * nuttige getal hoeveel VERSKILLENDE mense dit gestuur het — nie hoeveel keer
 * een mens die knoppie gedruk het nie. Stuur sy dieselfde clip aan vyf
 * vriendinne, is dit steeds een mens wat gesê het "hierdie een is goed".
 *
 * Die merkie word geskryf VOOR ons stuur — anders tel 'n swak lyn elke mislukte
 * versoek weer. Dieselfde besluit as `volgJesusTel.js` s'n.
 *
 * Die TOTAAL op `tellers/reels` tel wél elke druk: dit meet aktiwiteit, nie
 * gehalte nie. Daarom gaan albei in EEN versoek. */
function eersteDeelVan(id) {
  const sleutel = `reels_d_${id}`
  try {
    if (localStorage.getItem(sleutel) === '1') return false
    localStorage.setItem(sleutel, '1')
    return true
  } catch { return false }
}

/* 'n Telling wat misluk, mag NIKS vir die mens breek nie. */
function tel(wat, klip) {
  try {
    fetch('/api/reels-tel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(klip ? { wat, klip } : { wat }),
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

export default function Reels({ deepId, onInstalleer, onNavigate, isInstalled, klankSpeelNou }) {
  const [rou, setRou]       = useState(() => leesKas().lys)
  const [aktief, setAktief] = useState(0)
  const [stil, setStil]     = useState(true)
  const [passe, setPasse]   = useState(PASSE_BEGIN)
  /* ── Die klank-wenk kom NIE terwyl 'n stemboodskap speel nie ──
   *
   * Luister bly gemonteer wanneer 'n mens na 'n ander oortjie gaan — iemand kan
   * dus na vandag se boodskap luister en intussen deur die voer rol. Die video
   * begin stil, dus is dit reg. Maar "Tik vir klank" is 'n UITNODIGING om 'n
   * tweede klank aan te sit oor die een wat sy klaar hoor, en dit is die soort
   * ding wat soos 'n fout voel.
   *
   * 'n Getter en nie 'n prop-waarde nie: 'n toestand hiervoor sou App by elke
   * speel en pouse laat hervorm, en dit is die app se warmste pad. */
  const [wenk, setWenk]     = useState(() => !(klankSpeelNou && klankSpeelNou()))
  const [laai, setLaai]     = useState(true)

  const voerRef    = useRef(null)
  const gesienRef  = useRef(1)
  const gevraRef   = useRef(false)
  const getelRef   = useRef(false)
  /* Die saad word EEN keer per oopmaak gekies. Sien die kop. */
  const saadRef    = useRef(0)
  if (!saadRef.current) saadRef.current = Math.floor(Math.random() * 2147483647) + 1
  /* Nuwe kyker of nie — EEN keer gelees, by die eerste render. Dit mag nie
     midde-in 'n sessie verander nie: die voer sou onder haar vingers herskommel
     op die oomblik dat sy die mylpaal bereik. */
  const nuutRef    = useRef(null)
  if (nuutRef.current === null) nuutRef.current = !isAllesGesien()
  /* Die laaste EGTE clip wat sy gesien het — die mylpaal-kaart is nie een nie. */
  const laasteRef  = useRef(null)

  /* ── Die voer ──
     Die saai staan onder die gehaalde lys, nie in die plek daarvan nie: is daar
     iets in Firestore, wen dit; is daar niks, is die oortjie steeds nie leeg
     nie. */
  const items = useMemo(() => {
    const gehaal = skoonLys(rou)
    const lys = gehaal.length ? gehaal : skoonLys(REELS_SAAI)
    return bouVoer(lys, {
      deepId: deepId || null,
      saad: saadRef.current,
      passe,
      /* 'n Vreemdeling sien die BESTE eerste, nie die nuutste nie. Dewald:
         "die wat die meeste ge deel is kry voorkeer by nuwe kykers." */
      nuut: nuutRef.current,
    })
  }, [rou, deepId, passe])

  /* ── Is die belowede clip werklik hier? ──
   *
   * Sy het 'n boodskap gekry wat 'n BELOFTE maak: "Ek het hierdie gesien en aan
   * jou gedink." Is daardie clip weg — uitgevee, of hy haal nie deur nie — en
   * ons wys stilweg 'n ander een, dan is die eerste ding wat hierdie app aan 'n
   * vreemdeling doen, om 'n leuen te vertel. Sy weet nie wat sy sien nie.
   *
   * Dieselfde besluit as `HoopOntvang.jsx`: ons wys wél iets (want 'n
   * doodloopstraat is die ergste ding wat daardie skerm kan wees — dit is haar
   * eerste en dalk enigste oomblik hier), maar ons SÊ dit.
   *
   * Net ná die laai klaar is: voor dit is "nie hier nie" bloot "nog nie hier
   * nie", en 'n boodskap wat 'n halwe sekonde flits, is erger as geen. */
  const klipWeg = !!deepId && !laai &&
    !items.some(it => it.tipe === 'klip' && it.klip.id === deepId)

  /* ── Een lees, met 'n tydgrens ── */
  useEffect(() => {
    let lewendig = true
    const kas = leesKas()
    if (kas.lys.length && Date.now() - kas.tyd < KAS_OUD) setLaai(false)

    ;(async () => {
      try {
        const beheer = new AbortController()
        const klok = setTimeout(() => beheer.abort(), HAAL_TYDGRENS)
        let lys = []
        try {
          const r = await fetch('/api/reels-lys', {
            headers: { accept: 'application/json' },
            signal: beheer.signal,
          })
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          const d = await r.json()
          lys = Array.isArray(d.klips) ? d.klips : []
        } finally {
          clearTimeout(klok)
        }
        if (!lewendig) return

        /* NOOIT 'n antwoord aanvaar wat kleiner is as wat ons reeds het nie. 'n
           Eindpunt wat 'n leë lys gee omdat Firestore net nie opgekom het nie,
           mag nie twintig clips met nul vervang nie — daardie skryf oorleef 'n
           herlaai. */
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

        const it = items[i]
        if (it && it.tipe === 'klip') laasteRef.current = it.klip
        /* Sy is by die mylpaal — sy het ALLES gesien. Van die volgende oopmaak
           af is sy nie meer 'n nuwe kyker nie, en dan is "wat is nuut" die
           nuttiger vraag as "wat is die beste". */
        if (it && it.tipe === 'mylpaal') merkAllesGesien()

        /* Die voer HOU AAN: kom sy naby die onderkant van wat gebou is, word die
           volgende pas bygesit. Omdat die volgorde uit 'n saad kom, bly alles
           wat sy reeds gesien het presies waar dit was. */
        if (i >= items.length - BOU_VOORUIT) setPasse(p => p + 2)

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
  }, [items, isInstalled, onInstalleer])

  /* Die wenk gaan vanself weg. */
  useEffect(() => {
    if (!wenk) return
    const t = setTimeout(() => setWenk(false), 4000)
    return () => clearTimeout(t)
  }, [wenk])

  const deel = useCallback(async (klip) => {
    if (!klip) return
    const skakel = reelSkakel(klip.id)
    if (!skakel) return
    const teks = deelBoodskap(klip, skakel)
    /* Die TOTAAL tel elke druk; die CLIP tel een keer per toestel. Sien
       `eersteDeelVan()`. */
    tel('gedeel', eersteDeelVan(klip.id) ? klip.id : '')
    try {
      if (navigator.share) { await navigator.share({ text: teks }); return }
      await navigator.clipboard.writeText(teks)
      window.dispatchEvent(new CustomEvent('wys-kennis', { detail: 'Skakel gekopieer' }))
    } catch { /* sy het gekanselleer; dis nie 'n fout nie */ }
  }, [])

  if (laai && !items.length) {
    return (
      <div className="reels reels-leeg">
        <p>Een oomblik…</p>
      </div>
    )
  }

  return (
    <div className="reels">
      {klipWeg && (
        <p className="reels-weg" role="status">
          Daardie een is nie meer hier nie — maar hier is wat vandag wel is.
        </p>
      )}

      <div className="reels-voer" ref={voerRef}>
        {items.map((it, i) => {
          /* ── Die mylpaal ──
             EEN keer, ná die eerste volle pas, en 'n mens swiep daaraan verby.
             Dit is die plek waar die deel-vraag hoort: sy het pas alles gesien,
             sy is tevrede, en daar is nie 'n video wat om haar aandag meeding
             nie. 'n Deel-knoppie op die rail langs 'n lopende video word
             raakgevat deur wie al besluit het; hierdie een VRA. */
          if (it.tipe === 'mylpaal') {
            return (
              <section className="reel-mylpaal" key={`m${i}`} data-reel={i}>
                <span className="reel-mylpaal-merk">Jy het alles gesien</span>
                <p className="reel-mylpaal-lyn">Dankie dat jy gekyk het.</p>
                <p className="reel-mylpaal-sub">
                  Iemand anders het vandag een van hierdie nodig.
                </p>
                {laasteRef.current && (
                  <button className="reel-mylpaal-knop" onClick={() => deel(laasteRef.current)}>
                    Stuur dit aan iemand
                  </button>
                )}
                {/* Dit is die reël wat sê dit is nie 'n einde nie. Dewald: "dit
                    moet aangaan... dit moet verkieslik nooit stop nie" en
                    "wanneer iemand al die videos gekyk het moet dit oor begin."
                    Dit begin oor — in 'n NUWE orde, nie dieselfde ry nie. */}
                <p className="reel-mylpaal-aan">Swiep aan — dit begin weer, in 'n nuwe orde.</p>
              </section>
            )
          }

          const klip = it.klip
          const brug = brugVir(klip)
          return (
            <section className="reel" key={`${klip.id}-${i}`} data-reel={i}>
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
      </div>
    </div>
  )
}
