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
 * **Maar hoogstens TWEE keer dieselfde video** totdat sy alles gesien het
 * (`MAKS_PASSE_VOOR_ALLES`). Elke pas wys elke clip een keer, dus is twee passe
 * presies twee keer. Daarna lig die perk: dan is 'n derde keer nie 'n herhaling
 * nie, dit is 'n voer wat aangaan.
 *
 * **En sy gaan VOORT waar sy opgehou het.** `reels_laaste` word by ELKE clip
 * geskryf, nie by uitgang nie — 'n mens maak 'n app toe deur hom toe te maak,
 * nie deur 'n knoppie te druk nie, en dan loop daar geen opruiming nie. Die
 * volgende oopmaak begin by daardie clip.
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
 * **Die klank is AAN sodra die blaaier dit toelaat.** Dewald: *"hoekom hou jy
 * nie die klank aan nie... hoekom moet mens dit aansit."* Dit is nie 'n keuse
 * nie: 'n blaaier weier om klank te speel voordat die mens iets aangeraak het,
 * en speel ons hardop voordat dit gebeur, speel die video GLAD NIE.
 *
 * Maar sy het meestal wél al aangeraak — sy het die oortjie gedruk om hier te
 * kom. `navigator.userActivation.hasBeenActive` sê dit, en dan begin die klank
 * aan. Die enigste geval wat nog stil begin, is 'n vreemdeling op 'n gedeelde
 * skakel; daar is die eerste swiep genoeg (`pointerdown`).
 *
 * By YOUTUBE en by ons eie lêers sit die klank in ONS hande: die een in die
 * adres (`mute=0`), die ander op 'n regte `<video>` (`muted={stil}`).
 *
 * By TIKTOK loop dit deur hulle eie boodskap-kanaal — sien
 * `src/data/tiktokKlank.js`. `volume_control=1` was 'n raaiskoot en is weg; die
 * kanaal is nie. Die klank-knoppie op 'n TikTok-clip bestaan NET wanneer hulle
 * speler werklik met ons gepraat het, sodat daar nooit weer 'n knoppie is wat
 * na 'n vermoë wys wat nie bestaan nie.
 *
 * ── TikTok teken sy EIE oorleg, en ons moet plek maak ──
 *
 * Op 'n regte foon staan die handvatsel TWEE keer — hulle s'n en ons s'n — en
 * hulle hartjie met sy telling sit agter ons Deel-knoppie. Hulle speler is 'n
 * volwaardige TikTok-skerm: handvatsel links onder, 'n eie rail regs.
 *
 * Twee dinge volg daaruit:
 *
 *   · by 'n TikTok-clip wys ons NIE ons eie maker-lyn nie. Hulle s'n staan
 *     reeds daar, en twee name is 'n fout wat soos 'n fout lyk;
 *   · ons eie knoppies staan REGS, presies waar hulle rail is, en die ronde
 *     ONDEURSIGTIGE skyf (`.reel-knop-skyf`) dek hulle deel-ikoon. Hier het 'n
 *     swart STROOK oor die hele regterkant gestaan; Dewald: *"verwyder die swart
 *     streep dis lelik."* Hy was reg — 'n band oor 'n video word die ding wat 'n
 *     mens sien. Die knoppie doen nou self die werk.
 *
 *     Hulle hartjie en kommentaar bly dus sigbaar. Dit is die prys, en dit is 'n
 *     beter prys as 'n band oor elke video. Die rail sit ook hoog genoeg om die
 *     sweefende BYBEL-knoppie te mis — hy het die Deel-knoppie een keer
 *     letterlik doodgedruk.
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
  vraByEinde,
} from '../data/reels'
import { spelerAdres } from '../data/tiktokId'
import {
  stelKlank, stelWag, beginVanVoor, isTiktokBoodskap, tydUitBoodskap,
} from '../data/tiktokKlank'
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

/* Waar sy laas opgehou het. Dewald: *"onthou as iemand stop kyk moet dit
   volgende keer daar aangaan."* Sy kom terug en gaan VOORT in plaas van om weer
   van voor af te begin. */
/* ── WATTER clips sy gesien het, en hoeveel keer ──
 *
 * Dewald: *"as ek uit die app gaan en weer terug gaan wys dit dieselfde videos
 * alweer... moet nooit video 2 keer wys as daar ander videos is wat hul nog nie
 * gekyk het nie."*
 *
 * Hier het `reels_laaste` gestaan — die PLEK waar sy opgehou het. Dit kon nooit
 * werk nie: die ry word by elke oopmaak met 'n nuwe saad herskommel, dus is 'n
 * plek in daardie ry niks. Sy het dieselfde clips weer bo gekry.
 *
 * Dit is nou 'n LYS: `{ id: telling }`. Sien `gesienTel()` en die rondtes in
 * `reels.js` — daar staan die hele rede. */
const GESIEN = 'reels_gesien'

/* Hoeveel clips se tellings mag ons hou? 124 clips vandag, en die lys groei
   net met wat hy inplak. 'n Perk is nogtans nodig: localStorage is klein, en 'n
   voorwerp wat net groei, is 'n foon wat op 'n dag niks meer kan stoor nie.
   Word dit oorskry, val die OUDSTE inskrywings uit (die eerste sleutels), want
   die onlangse is dié wat die rondtes bepaal. */
const MAKS_GESIEN = 2000

/* ── Hoogstens TWEE keer dieselfde video ──
 *
 * Dewald: *"probeer om nie dieselfde video meer as 2 keer te wys nie tensy hulle
 * alles klaar gekyk het."*
 *
 * Elke pas wys elke clip een keer, dus is twee passe presies twee keer. Het sy
 * alles gesien (die mylpaal is bereik), lig die perk — dan is dit haar eie keuse
 * om aan te hou en 'n derde keer is nie 'n herhaling nie, dit is 'n voer wat
 * aangaan. */
const MAKS_PASSE_VOOR_ALLES = 2

/* Hoeveel passe vooruit gebou word, en hoeveel clips voor die einde 'n nuwe pas
   bygesit word. Drie is genoeg dat 'n mens nooit die onderkant sien nie. */
/* ── Wanneer die gedeelde-skakel-vraag kom as hulle speler stil bly ──
 *
 * 'n Vreemdeling op 'n gedeelde skakel word gevra 3s voor die video eindig
 * (sien `vraByEinde()`), en dit hang daarvan af dat TikTok se speler oor tyd
 * praat. Doen hy dit nie, is dit die terugval.
 *
 * Dertig sekondes is 'n GUESS met 'n rede: 'n prediker se clip loop sowat 'n
 * halfminuut tot 'n minuut, en teen dertig het sy of klaar gekyk of besluit om
 * aan te hou. Sonder hierdie getal sou 'n mens wat land, kyk en nooit swiep nie,
 * GLAD NIE gevra word nie — en dit is juis die pad wat die app laat groei.
 *
 * Dit is een getal en dit is maklik om te verander. */
const WAG_TERUGVAL = 30000

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

function leesGesien() {
  try {
    const w = JSON.parse(localStorage.getItem(GESIEN) || '{}')
    return w && typeof w === 'object' && !Array.isArray(w) ? w : {}
  } catch { return {} }
}

/* Merk een clip as gesien. Dit skryf DADELIK — 'n mens maak 'n app toe deur hom
   toe te maak, nie deur 'n knoppie te druk nie, en dan loop daar geen opruiming
   nie. Dieselfde les as `reels_laaste` s'n was. */
function merkGesien(id) {
  const sleutel = String(id || '')
  if (!sleutel) return {}
  try {
    const w = leesGesien()
    w[sleutel] = (Number(w[sleutel]) || 0) + 1
    const sleutels = Object.keys(w)
    if (sleutels.length > MAKS_GESIEN) {
      for (const oud of sleutels.slice(0, sleutels.length - MAKS_GESIEN)) delete w[oud]
    }
    localStorage.setItem(GESIEN, JSON.stringify(w))
    return w
  } catch { return {} }
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
function spelerVir(klip, stil, speel) {
  if (!klip) return ''
  if (klip.bron === 'youtube') {
    const v = new URLSearchParams({
      /* ── ALTYD autoplay=1, ook vir die vooruit-een ──
       *
       * Dit was `speel ? '1' : '0'`, en dit het die laai-tyd LANGER gemaak in
       * plaas van korter. Dewald: *"dit vat nou nog langer om te laai.... dit
       * wys nou eers i play button en dan laai dit."*
       *
       * Hy het presies die twee simptome beskryf. Met `autoplay=0` wys die
       * speler sy omslag met 'n SPEEL-KNOPPIE, en wanneer hy aktief word,
       * verander die adres na `autoplay=1` — 'n nuwe adres is 'n nuwe bladsy,
       * dus HERLAAI die raam van nuuts af. Die vooruit-laai het dus niks
       * gespaar nie en 'n ekstra stap bygesit.
       *
       * Die reël wat hieruit kom: **die vooruit-raam moet PRESIES dieselfde
       * adres hê as wanneer hy aktief is.** Verander een karakter en die hele
       * wins is weg. */
      autoplay: '1',
      mute: speel && !stil ? '0' : '1',
      playsinline: '1',
      rel: '0',
      modestbranding: '1',
      loop: '1',
      playlist: klip.bronId,   /* loop=1 doen niks sonder hierdie veld */
    })
    return `https://www.youtube.com/embed/${klip.bronId}?${v.toString()}`
  }
  /* TikTok se adres dra GEEN klank nie — dit loop deur hulle boodskap-kanaal —
     dus is die adres vir die vooruit-een en die aktiewe een identies. Dit is die
     enigste bron waar die raam NOOIT herlaai nie, en dit is ook die bron waarvan
     al 124 clips kom. Die vooruit-een word stilgemaak en gepouseer met 'n
     boodskap; sien die klank-effek. */
  if (klip.bron === 'tiktok') return spelerAdres(klip.bronId, { speel: true })
  /* 'eie' — 'n lêer wat ons self bedien. */
  return String(klip.bronId || '')
}

export default function Reels({ deepId, onInstalleer, onNavigate, isInstalled, klankSpeelNou }) {
  const [rou, setRou]       = useState(() => leesKas().lys)
  const [aktief, setAktief] = useState(0)
  /* ── Hoekom die klank nie net AAN is nie ──
   *
   * Dewald: *"hoekom hou jy nie die klank aan nie... hoekom moet mens dit
   * aansit."*
   *
   * Dit is nie 'n keuse nie: 'n blaaier WEIER om klank te speel voordat die mens
   * iets op die bladsy aangeraak het. Speel ons hardop voordat dit gebeur het,
   * speel die video glad nie — dan is daar nie klank nie EN nie 'n video nie.
   *
   * Maar sy het meestal wél al aangeraak: sy het die Reels-oortjie gedruk om
   * hier te kom. `navigator.userActivation.hasBeenActive` sê dit, en dan begin
   * die klank AAN — geen tik, geen wenk, niks.
   *
   * Die een geval waar dit nog stil begin, is 'n VREEMDELING op 'n gedeelde
   * skakel: sy land direk hier sonder om iets te druk. Dan is die eerste tik
   * genoeg, en die "Tik vir klank" staan daar.
   *
   * Dit geld net waar ONS die speler besit — YouTube en ons eie lêers. Binne
   * TikTok se iframe is die klank hulle s'n en ons kan dit nie raak nie. */
  const [stil, setStil]     = useState(() => {
    try {
      const a = navigator.userActivation
      if (a && typeof a.hasBeenActive === 'boolean') return !a.hasBeenActive
    } catch { /* ou blaaier */ }
    return true
  })
  const [passe, setPasse]   = useState(() => (
    isAllesGesien() ? PASSE_BEGIN : Math.min(PASSE_BEGIN, MAKS_PASSE_VOOR_ALLES)
  ))
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
  /* Het TikTok se speler ooit met ONS gepraat? Net dan mag daar 'n klank-knoppie
     op 'n TikTok-clip wees. Sien `src/data/tiktokKlank.js`. */
  const [kanaal, setKanaal] = useState(false)
  /* ── Waarom TikTok sy EIE klank-toestand het en nie `stil` gebruik nie ──
   *
   * Dewald: *"ek moet die knoppie inhou voor dit werk."*
   *
   * Die knoppie het `stil` gebruik, en `stil` is `false` sodra sy die oortjie
   * gedruk het — want by YouTube en by ons eie lêers is dit die waarheid: ons
   * stel die klank self en dit is aan.
   *
   * By TIKTOK is dit NIE die waarheid nie. Hulle speler begin altyd gedemp, wat
   * hulle keuse is en nie ons s'n. Die knoppie het dus "Stil" gewys — met ander
   * woorde "druk om af te sit" — terwyl dit reeds stil was. Haar eerste druk het
   * dit "afgesit" (niks verander), en net die TWEEDE het klank gegee. Dit voel
   * presies soos 'n knoppie wat 'n mens moet inhou.
   *
   * `tiktokStil` begin dus WAAR, want dit is wat hulle speler werklik doen. Een
   * druk, en die etiket is eerlik. */
  const [tiktokStil, setTiktokStil] = useState(true)
  const [laai, setLaai]     = useState(true)

  const voerRef    = useRef(null)
  /* Die AKTIEWE `<video>` (net vir ons eie lêers). Die vooruit-een is gemonteer
     maar speel nie, en `autoPlay` op 'n element wat al gemonteer is, doen niks —
     dus moet `play()` met die hand kom wanneer hy aktief word. */
  const videoRef   = useRef(null)
  const gesienRef  = useRef(1)
  const gevraRef   = useRef(false)
  const getelRef   = useRef(false)
  /* Die saad word EEN keer per oopmaak gekies. Sien die kop. */
  const saadRef    = useRef(0)
  if (!saadRef.current) saadRef.current = Math.floor(Math.random() * 2147483647) + 1
  /* ── Wat sy gesien het, EEN keer gelees ──
   *
   * Dit is die belangrikste `useRef` in hierdie lêer. Die tellings verander
   * terwyl sy kyk, en as die voer op die LEWENDE tellings gebou was, sou hy by
   * elke clip herbou en onder haar vingers herskommel — presies wat die saad
   * moes keer.
   *
   * Dus: 'n foto van die tellings by die eerste render. Die egte tellings skuif
   * in localStorage soos sy kyk, en die VOLGENDE oopmaak lees hulle. */
  const gesienRefLys = useRef(null)
  if (gesienRefLys.current === null) gesienRefLys.current = leesGesien()
  /* Nuwe kyker = sy het nog NIKS gesien nie. Dit was `!isAllesGesien()`, wat te
     breed was: iemand wat honderd clips gesien het maar nie almal nie, het die
     "mees gedeeldes bo"-orde gekry terwyl sy juis wou sien wat NUUT is. */
  const nuutRef    = useRef(null)
  if (nuutRef.current === null) nuutRef.current = !Object.keys(gesienRefLys.current).length
  /* Die laaste EGTE clip wat sy gesien het — die mylpaal-kaart is nie een nie. */
  const laasteRef  = useRef(null)
  /* ── Watter PLEKKE in hierdie voer al getel is ──
   *
   * Die blaaierlopie het dit gevang: een clip het op telling 2 gestaan ná een
   * enkele kyk. Die waarnemer vuur meer as een keer vir dieselfde plek — die rol
   * kom tot rus, en die waarnemer word oorgebou elke keer as 'n pas bygesit word
   * — en elke keer het dit weer getel.
   *
   * Dit is nie 'n skoonheidsfout nie: 'n clip wat op 2 staan sonder dat sy hom
   * twee keer gesien het, val uit die eerste rondte en sy sien hom NOOIT.
   *
   * Die PLEK en nie die id nie: dieselfde clip kan wettig twee keer in een voer
   * staan (rondte 0 en rondte 1), en dan is dit twee kyke. */
  const getelPlekRef = useRef(new Set())
  /* Mag die voer nog groei? Die perk lig sodra sy alles gesien het. */
  const maksRef    = useRef(0)
  maksRef.current = isAllesGesien() ? Infinity : MAKS_PASSE_VOOR_ALLES

  /* ── Die voer ──
     Die saai staan onder die gehaalde lys, nie in die plek daarvan nie: is daar
     iets in Firestore, wen dit; is daar niks, is die oortjie steeds nie leeg
     nie. */
  const items = useMemo(() => {
    const gehaal = skoonLys(rou)
    const lys = gehaal.length ? gehaal : skoonLys(REELS_SAAI)
    return bouVoer(lys, {
      deepId: deepId || null,
      /* Wat sy REEDS gesien het. Hieruit kom die rondtes: eers alles wat sy nog
         nie gesien het nie, en 'n tweede keer eers wanneer daar niks ongesien
         oor is nie. Sien `bouVoer` se kop. */
      gesien: gesienRefLys.current,
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
        if (it && it.tipe === 'klip') {
          laasteRef.current = it.klip
          /* By ELKE clip, nie net by uitgang nie: 'n mens maak 'n app toe deur
             hom toe te maak, nie deur 'n knoppie te druk nie, en dan loop daar
             geen opruiming nie.

             Dit skryf na localStorage maar NIE na `gesienRefLys` nie — die voer
             se orde mag nie onder haar vingers verander nie. Die volgende
             oopmaak lees hierdie tellings, en dan is die clips wat sy nou kyk,
             uit die eerste rondte.

             En PRESIES EEN keer per plek — sien `getelPlekRef`. */
          if (!getelPlekRef.current.has(i)) {
            getelPlekRef.current.add(i)
            merkGesien(it.klip.id)
          }
        }
        /* Sy is by die mylpaal — sy het ALLES gesien. Van die volgende oopmaak
           af is sy nie meer 'n nuwe kyker nie, en dan is "wat is nuut" die
           nuttiger vraag as "wat is die beste". */
        if (it && it.tipe === 'mylpaal') merkAllesGesien()

        /* Die voer HOU AAN: kom sy naby die onderkant van wat gebou is, word die
           volgende pas bygesit. Omdat die volgorde uit 'n saad kom, bly alles
           wat sy reeds gesien het presies waar dit was. */
        if (i >= items.length - BOU_VOORUIT) {
          setPasse(p => Math.min(p + 2, maksRef.current))
        }

        /* Ná die TWEEDE swiep — of ná die EERSTE, as sy op 'n gedeelde skakel
           gekom het. Die hele besluit staan in `magVraInstalleer()`; sien sy kop
           vir waarom 'n vreemdeling op 'n skakel 'n ander mens is. */
        if (magVraInstalleer({
          gesien: gesienRef.current,
          reedsGevra: gevraRef.current,
          geinstalleer: isInstalled,
          gedeel: !!deepId,
        })) {
          gevraRef.current = true
          if (onInstalleer) onInstalleer()
        }
      }
    }, { root: voer, threshold: 0.6 })

    dele.forEach(d => kyker.observe(d))
    return () => kyker.disconnect()
  }, [items, isInstalled, onInstalleer, deepId])

  /* ── Ons eie lêer: die vooruit-een word AANGESIT wanneer hy aktief word ──
   *
   * Die vooruit-`<video>` is gemonteer met `autoPlay={false}`: hy laai sy begin
   * en staan stil. Word hy aktief, verander daardie prop — en dit doen NIKS,
   * want `autoplay` geld net by die eerste laai van 'n element. Sonder hierdie
   * effek sou die tweede clip vir altyd op sy eerste raam staan.
   *
   * Dit is die hele wins van ons eie lêer: geen herlaai, geen adres wat
   * verander, net `play()` op 'n lêer wat reeds gebuffer is. Dit is die soort
   * "dadelik" wat 'n mens net kry as jy die speler besit. */
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    /* `catch` en nie 'n `if` nie: 'n blaaier mag `play()` weier (sy het nog niks
       aangeraak nie) en dan is dit 'n verwerping, nie 'n fout in die voer nie. */
    const p = v.play()
    if (p && typeof p.catch === 'function') p.catch(() => {})
  }, [items, aktief, stil])

  /* ── Die vraag DRIE SEKONDES voor die gedeelde video eindig ──
   *
   * Dewald: *"wanneer iemand die video share en hulle kyk moet die popup opkom
   * so 3 sekondes voor die video eindig...... nie na hul paar videos gekyk het
   * nie... of as hul op scroll die eerste keer moet popup dadelik wys."*
   *
   * Die swiep-helfte staan in `magVraInstalleer()` by die waarnemer hierbo. Dit
   * is die ANDER helfte: sy kyk die een video wat belowe is, klaar, en dan vra
   * ons — op die oomblik waar sy gekry het wat sy kom haal het en nog daar is.
   *
   * ── Hoe ons weet waar die video is ──
   *
   * `tydUitBoodskap()` SOEK die twee getalle in hulle gebeurtenisse. Dit raai
   * geen veldnaam nie: kry dit nie 'n posisie EN 'n lengte nie, gee dit `null`
   * en hierdie pad doen niks. Sien sy kop.
   *
   * ── En as hulle speler NOOIT oor tyd praat nie ──
   *
   * Dan bly `WAG_TERUGVAL`. Dit is 'n GUESS en dit staan hier as 'n getal wat 'n
   * mens kan verander: 'n TikTok-clip van 'n prediker loop sowat 'n halfminuut
   * tot 'n minuut, en dertig sekondes is die punt waar sy of klaar gekyk het of
   * besluit het om aan te hou. Albei is oomblikke waar die vraag eerlik is.
   *
   * Sonder hierdie terugval sou 'n mens wat op 'n skakel land, die video kyk en
   * NOOIT swiep nie, glad nie gevra word nie — en dít is juis die pad wat die
   * app moet laat groei. 'n Geraaide oomblik is hier beter as geen oomblik. */
  useEffect(() => {
    if (!deepId) return                 /* net die mens op 'n gedeelde skakel */
    if (isInstalled || gevraRef.current) return

    const vra = () => {
      if (gevraRef.current) return
      gevraRef.current = true
      if (onInstalleer) onInstalleer()
    }

    function opTyd(e) {
      if (gevraRef.current) return
      const t = tydUitBoodskap(e)
      if (!t) return
      if (vraByEinde(t)) vra()
    }

    window.addEventListener('message', opTyd)
    const terugval = setTimeout(vra, WAG_TERUGVAL)
    return () => {
      window.removeEventListener('message', opTyd)
      clearTimeout(terugval)
    }
  }, [deepId, isInstalled, onInstalleer])

  /* ── TikTok: die klank, deur hulle EIE kanaal ──
   *
   * Dewald, vier keer: *"we need sound!!!!!!!!!!!!"*
   *
   * Die eerste poging het 'n JSON-STRING gestuur sonder hulle merker, en so 'n
   * boodskap word weggegooi voordat iets na die tipe kyk. Die gedokumenteerde
   * vorm staan nou in `src/data/tiktokKlank.js`, met die hele rede daarby.
   *
   * ── Wanneer dit gestuur word ──
   *
   * MEER as een keer, want die oomblik waarop hulle speler gereed is, is nie
   * iets wat ons kan sien nie:
   *
   *   1. wanneer die raam klaar laai (`load`);
   *   2. wanneer hulle vir die EERSTE keer met ons praat — dít is die enigste
   *      eerlike "gereed", en dit is hoekom ons luister;
   *   3. en op 'n paar tydhouers, want 'n speler wat nooit praat nie, kan nog
   *      steeds luister.
   *
   * Die tydhouers is nie oorversigtigheid nie. Dewald: *"ek moet die knoppie
   * inhou voor dit werk."* 'n Speler wat op daardie oomblik besig is om te laai,
   * gooi die boodskap weg, en dan lyk 'n enkele druk soos 'n druk wat niks doen.
   * 'n Paar herhalings oor die eerste sekonde-en-'n-half maak van een druk een
   * druk.
   *
   * ── Die knoppie hang aan 'n ANTWOORD ──
   *
   * `kanaal` word net waar wanneer hulle speler werklik met ons gepraat het.
   * Dan — en net dan — wys die klank-knoppie. Dit is die les van
   * `volume_control=1`: 'n knoppie wat na 'n vermoë wys wat nie bestaan nie, is
   * erger as stilte. Hier kan dit nie gebeur nie. */
  useEffect(() => {
    const it = items[aktief]
    if (!it || it.tipe !== 'klip' || it.klip.bron !== 'tiktok') { setKanaal(false); return }

    /* Daar is nou TWEE rame gemonteer — die aktiewe een en die vooruit-een — dus
       moet dit die AKTIEWE een wees. `querySelector('iframe.reel-speler')` sou
       die eerste in die DOM gee, en dit is nie altyd hierdie een nie. */
    const raam = voerRef.current
      && voerRef.current.querySelector(`[data-reel="${aktief}"] iframe.reel-speler`)
    if (!raam) return

    /* ── Die VOORUIT-raam word stilgehou ──
     *
     * Hy dra PRESIES dieselfde adres as die aktiewe een — anders herlaai hy op
     * die oomblik dat sy swiep en is die hele vooruit-laai weg. Daardie adres
     * dra `autoplay=1`, dus moet 'n boodskap hom stil en gepouseer hou. `mute`
     * is verpligtend (twee klanke tegelyk is 'n stukkende app); `pause` spaar
     * data en is veilig as dit geïgnoreer word. */
    const wag = voerRef.current.querySelector(`[data-reel="${aktief + 1}"] iframe.reel-speler`)
    const stilWag = () => { if (wag) stelWag(wag.contentWindow) }
    stilWag()
    /* Die vooruit-raam is dalk nog nie gereed nie; 'n boodskap na 'n speler wat
       nog laai, is weg. Dit is nie ernstig nie — hulle speler begin in elk geval
       GEDEMP (dit is juis waarom `unMute` nodig is), dus kan daar nooit twee
       klanke wees nie. Die `pause` is wat hier wen of verloor, en dit kos net
       data. */
    if (wag) wag.addEventListener('load', stilWag)

    /* ── `seekTo 0` loop PRESIES EEN KEER ──
     *
     * Die vooruit-raam kon stil aangespeel het (as `pause` geïgnoreer is), en
     * dan is hy halfpad wanneer sy hier aankom. `seekTo 0` maak dit reg.
     *
     * Maar dit mag NIE op die herhaal-tydhouers loop nie. Die klank-boodskappe
     * is onskadelik om te herhaal — 'n raam wat al ontdemp is, word weer ontdemp
     * — maar 'n `seekTo 0` op 2 000ms SPOEL DIE VIDEO TERUG terwyl sy kyk. Dit
     * sou soos 'n haper lyk wat 'n mens nooit sou verklaar nie. */
    beginVanVoor(raam.contentWindow)

    /* `tiktokStil` en nie `stil` nie — sien die kop by die toestand. Hulle speler
       begin altyd gedemp, en `stil` weet niks daarvan nie. */
    const stuur = () => stelKlank(raam.contentWindow, !tiktokStil)

    /* ── Die PINGPONG, en hoekom hierdie vlaggie moet bly ──
     *
     * Die eerste weergawe het by ELKE boodskap van hulle weer gestuur. Hulle
     * speler antwoord op 'n opdrag, en toe was daar 'n lus: ons stuur vier,
     * hulle antwoord vier, ons stuur weer vier. Die blaaiertoets het gehang en
     * die stomp se lys het honderde inskrywings gehad.
     *
     * Op 'n regte foon sou dit nie gehang het nie — dit sou net vir altyd
     * boodskappe heen en weer gestuur het, en dit is 'n foon se battery.
     *
     * Ons stuur dus PRESIES EEN keer ná hulle eerste antwoord. Verander `stil`
     * of die aktiewe clip, loop hierdie effek van nuuts af en die vlaggie is
     * weer af — wat reg is, want dan is daar 'n nuwe opdrag om te stuur. */
    let geantwoord = false

    function opBoodskap(e) {
      if (!isTiktokBoodskap(e)) return
      /* Hulle praat met ons. Die kanaal leef, en die knoppie mag nou bestaan. */
      setKanaal(true)
      if (geantwoord) return
      geantwoord = true
      /* Hulle eerste woord is die enigste eerlike "ek is gereed" wat ons kan
         kry, dus is dit die beste oomblik om die opdrag te herhaal. */
      stuur()
    }

    window.addEventListener('message', opBoodskap)
    raam.addEventListener('load', stuur)
    stuur()
    /* 'n Kort ry herhalings. Bewus BEGRENS: vier tydhouers, nie 'n interval nie
       — 'n interval wat iemand vergeet skoon te maak, is 'n voer wat vir altyd
       boodskappe stuur. */
    const ts = [200, 600, 1200, 2000].map(ms => setTimeout(stuur, ms))

    return () => {
      window.removeEventListener('message', opBoodskap)
      raam.removeEventListener('load', stuur)
      if (wag) wag.removeEventListener('load', stilWag)
      for (const t of ts) clearTimeout(t)
    }
  }, [items, aktief, tiktokStil])

  /* ── Die eerste aanraking maak die klank oop ──
   *
   * Sodra sy iets aangeraak het, laat die blaaier klank deur, en dan hoef sy nie
   * 'n knoppie te soek nie. Dit vang die geval wat `hasBeenActive` nie kon sien
   * nie: 'n vreemdeling wat op 'n gedeelde skakel geland het en toe geswiep het.
   *
   * `pointerdown` en nie `click` nie — 'n swiep is nie 'n klik nie, en 'n swiep
   * is presies wat sy hier doen. */
  useEffect(() => {
    if (!stil) return
    const voer = voerRef.current
    if (!voer) return
    function opRaak() { setStil(false); setWenk(false) }
    voer.addEventListener('pointerdown', opRaak, { once: true, passive: true })
    return () => voer.removeEventListener('pointerdown', opRaak)
  }, [stil])

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
              {/* ── Die aktiewe speler EN die volgende een ──
                  Dewald: *"die volgende video laai telank.... dit moet basies
                  dadelik wys as ek opswipe."* Hy is reg, en die oorsaak was hier:
                  net die AKTIEWE speler was gemonteer, dus het die volgende een
                  van nuuts af begin laai op die oomblik dat hy geswiep het — die
                  raam, hulle speler se JS, die omslag, alles.

                  Nou word die VOLGENDE een ook gemonteer, maar hy SPEEL NIE
                  (`autoplay=0`, en by ons eie lêers `autoPlay={false}`). Dit is
                  die hele afweging: 'n speler wat laai maar nie speel nie, kos
                  die raam en sy omslag — nie 'n hele video nie.

                  EEN vooruit, nooit twee. Die oorspronklike reël staan nog: drie
                  ingebedde spelers langs mekaar is die hele datarekening, en dit
                  is nie 'n optimalisasie nie. Een vooruit is die prys vir 'n voer
                  wat nie hakkel nie; twee is 'n datarekening. */}
              {(i === aktief || i === aktief + 1) && klip.bron === 'eie' ? (
                /* ── ONS EIE lêer: 'n regte <video>, en dus ons eie klank ──
                 *
                 * Dit was 'n `<iframe src="…mp4">`, en dit is 'n stille fout:
                 * dan speel die BLAAIER se eie leser die lêer. Dit loop nie, dit
                 * begin nie vanself nie, en die klank is nie ons s'n nie — dit
                 * is presies dieselfde probleem as TikTok se speler, met ons eie
                 * lêer.
                 *
                 * Hier IS die klank ons s'n: `muted={stil}`, en `stil` is
                 * `false` sodra die mens iets aangeraak het. Geen raaiskoot,
                 * geen ander party.
                 *
                 * `playsInline` is nie 'n netjiese ekstra nie — sonder dit vat
                 * iOS die video volskerm oor en die voer is verby. */
                <video
                  className="reel-speler"
                  key={`${klip.id}-video`}
                  ref={el => { if (i === aktief) videoRef.current = el }}
                  src={spelerVir(klip, stil, true)}
                  muted={i !== aktief || stil}
                  /* Die VOORUIT-een speel nie. Hy laai net, en dit is presies
                     wat 'n mens wil: `preload="auto"` haal die begin van die
                     lêer sodat die eerste raam daar is voor sy swiep. Dit is
                     die pad waar hierdie heeltemal ons s'n is — geen herlaai,
                     geen ander party. */
                  autoPlay={i === aktief}
                  loop
                  playsInline
                  preload="auto"
                  disablePictureInPicture
                  controls={false}
                />
              ) : (i === aktief || i === aktief + 1) ? (
                <iframe
                  className="reel-speler"
                  /* Die sleutel dra `stil` sodat "Tik vir klank" die raam
                     HERBOU. 'n Blote src-verandering laat YouTube se speler
                     soms stil bly.

                     By TIKTOK mag dit NIE gebeur nie. Hulle adres dra geen
                     mute-param nie — die klank loop deur 'n boodskap — dus sou
                     'n herbou niks aan die klank verander en alles kos: die
                     video begin van voor af en word weer afgelaai. Dieselfde
                     rede as waarom net die aktiewe speler gemonteer is. */
                  key={klip.bron === 'tiktok' ? klip.id : `${klip.id}-${stil ? 'stil' : 'klank'}`}
                  src={spelerVir(klip, stil, i === aktief)}
                  title={klip.naam}
                  allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
                  allowFullScreen
                  loading="eager"
                />
              ) : (
                <div className="reel-wag" aria-hidden="true" />
              )}

              {/* Die wenk staan NET waar hy werk: by YouTube en by ons eie
                  lêers, waar ons die speler besit.

                  By TikTok het hier 'n wenk gestaan wat na hulle klankknoppie
                  gewys het — en daardie knoppie bestaan nie. Dewald: *"dit sê
                  klik die klank knoppie maar daar is geen klank knoppie nie."*
                  Liewer niks as 'n wenk wat 'n mens laat soek na iets wat nie
                  daar is nie. */}
              {wenk && i === aktief && stil && klip.bron !== 'tiktok' && (
                <button className="reel-wenk" onClick={() => { setStil(false); setWenk(false) }}>
                  Tik vir klank
                </button>
              )}

              {/* ── Die Deel-knoppie dek TikTok se eie deel-ikoon ──
                  Hier het 'n swart strook oor die hele regterkant gestaan om
                  hulle rail toe te maak. Dewald: *"verwyder die swart streep dis
                  lelik en sit net my deel icon groot oor dit. die bybel is klaar
                  oor een icon."*

                  Hy is reg — dit was 'n band oor 'n video, en 'n mens sien dit
                  eerder as die video. Die knoppie self doen nou die werk: 'n
                  ronde, ondeursigtige skyf presies waar hulle deel-ikoon sit.
                  Dit dek wat dit moet dek en dit lyk soos 'n knoppie, nie soos
                  'n fout nie. */}
              <div className="reel-rail">
                {/* ── Die klank-knoppie op 'n TikTok-clip ──
                    Hy bestaan NET wanneer `kanaal` waar is, en `kanaal` word
                    net waar wanneer hulle speler werklik met ons gepraat het.
                    Dit is die hek wat `volume_control=1` se fout onmoontlik
                    maak: daardie wenk het na 'n vermoë gewys wat nie bestaan
                    het nie. 'n Knoppie wat aan 'n ONTVANGDE antwoord hang, kan
                    nie so lieg nie. */}
                {klip.bron === 'tiktok' && i === aktief && kanaal && (
                  <button
                    className="reel-knop"
                    onClick={() => setTiktokStil(s => !s)}
                    aria-label={tiktokStil ? 'Sit die klank aan' : 'Sit die klank af'}
                  >
                    <span className="reel-knop-skyf">
                      {tiktokStil ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                          <path d="m16 9 5 6" /><path d="m21 9-5 6" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                          <path d="M16 8.5a5 5 0 0 1 0 7" /><path d="M19 6a9 9 0 0 1 0 12" />
                        </svg>
                      )}
                    </span>
                    <span className="reel-knop-woord">{tiktokStil ? 'Klank' : 'Stil'}</span>
                  </button>
                )}

                <button className="reel-knop" onClick={() => deel(klip)} aria-label={`Deel ${klip.naam} se boodskap`}>
                  <span className="reel-knop-skyf">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3v13" /><path d="m7.5 7.5 4.5-4.5 4.5 4.5" />
                      <path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
                    </svg>
                  </span>
                  <span className="reel-knop-woord">Deel</span>
                </button>
              </div>

              <div className="reel-onder">

                {/* TikTok se speler wys die handvatsel self — twee name lees
                    soos 'n fout. Sien die kop. */}
                {klip.bron !== 'tiktok' && (
                  <div className="reel-maker">
                    <b>{klip.naam}</b>
                    {klip.handvatsel && <small>{klip.handvatsel}</small>}
                  </div>
                )}
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
