/* ────────────────────────────────────────────────────────────
   Pastorale Sorg.

   Die volgorde op hierdie blad is 'n besluit, nie 'n toeval nie:

     Hulp nou             — altyd bo, altyd bereikbaar
     Waarmee kan ek jou help?  — die uitnodiging; dit is waarvoor die blad is
     Vandag se video      — EEN video, een keer
     Die Muur · Die Video's
     Help om Daaglikse Hoop gratis te hou

   HOOP KOM VOOR PYN. Iemand wat in krisis aankom en veertig plasings van
   ander se lyding lees, gaan slegter weg. Daarom staan die video bo en die
   muur onder, en daarom dra elke plasing op die muur iets by wat help.

   ── Twee oortjies, nie drie nie ──

   "Dewald antwoord" was 'n derde oortjie wat dieselfde plasings gewys het as
   die muur, net gefiltreer. Dit het die blad ingewikkeld laat lyk sonder om
   iets by te voeg — die antwoord sit in elk geval BINNE die plasing, direk
   onder die persoon se woorde. Nou is dit Die Muur en Die Video's.

   ── Die uitnodiging ──

   "Vertel my wat swaar is" het geklink of 'n mens net probleme mag plaas.
   Mense mag ook 'n vraag vra, hul hele storie vertel, of raad soek. Die
   uitnodiging sê dit nou, en Dewald se gesig is daarby — nie groot en
   bemarkingsagtig nie, net genoeg om te wys daar is 'n regte mens aan die
   ander kant.

   En: geen versoek om geld op die skryfkant nie. Nooit waar iemand sy seer
   tik nie.
   ──────────────────────────────────────────────────────────── */

import { useState, useEffect, useRef, useCallback } from 'react'
import SorgVideo from '../components/SorgVideo'
import SorgNommers from '../components/SorgNommers'
import SorgVorm from '../components/SorgVorm'
import SorgPlasing from '../components/SorgPlasing'
import SorgDeelSteun from '../components/SorgDeelSteun'
import SorgSteun from '../components/SorgSteun'
import DonationCard from '../components/DonationCard'
import {
  haalVideos, weekVideo,
} from '../data/sorgVideos'
import { haalMuur, haalMyPlasings, vergeetMuur, POLS_MS } from '../data/sorgMuur'
import { haalPlek, vergeetPlek } from '../data/sorgPlek'
import { leesSorgSkakel } from '../data/sorgDeel'
import { NOODNOMMERS, GRENSSIN } from '../data/sorgNommers'
import './Sorg.css'

/* Die noodnommers en die grenssin woon in `src/data/sorgNommers.js` — een
   plek, want 'n dooie noodnommer is die enigste ding hier wat regtig
   verkeerd kan loop. Hulle word hier weer uitgevoer sodat ouer invoere nie
   breek nie. */
export { NOODNOMMERS, GRENSSIN }

export function HulpNou({ oop, onSluit }) {
  if (!oop) return null
  return (
    <>
      <div className="sorg-blad-agter" onClick={onSluit} />
      <div className="sorg-blad" role="dialog" aria-label="Hulp nou">
        <div className="sorg-blad-gryp" />
        <h2 className="sorg-blad-titel">Hulp nou</h2>
        <p className="sorg-blad-teks">
          Is jy, 'n kind of iemand anders op hierdie oomblik in gevaar? Bel een
          van hierdie nommers. Moenie hier wag nie.
        </p>
        <SorgNommers wys="alles" />
        <button className="sorg-blad-toe" onClick={onSluit}>Maak toe</button>
      </div>
    </>
  )
}

const AFDELINGS = [
  { sleutel: 'muur',   naam: 'Die Muur' },
  /* "Video's", nie "Die Video's" nie. Met 'n ikoon, 'n naam en 'n telling
     langs mekaar het "Die Video's" op 'n 320px-skerm nie gepas nie. */
  { sleutel: 'videos', naam: 'Video\'s' },
]

/* ── Die twee ikone ──

   Lyntekeninge, nie emoji nie. 'n Emoji word deur die stelsel geteken: op
   een foon is dit plat, op 'n ander blink, en dit erf nooit die knoppie se
   kleur nie. Op 'n pers pil moet die ikoon wit word saam met die teks, en
   dit kan net gebeur as dit 'n SVG met `currentColor` is. */
function HartIkoon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  )
}

function SpeelIkoon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="3.5" />
      <path d="M10.4 9.1v5.8l4.8-2.9z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export default function Sorg() {
  const [hulpOop, setHulpOop] = useState(false)
  const [steunOop, setSteunOop] = useState(false)
  const [vormOop, setVormOop] = useState(false)
  const [afdeling, setAfdeling] = useState('muur')
  const [data, setData] = useState(null)      // null = besig
  const [muur, setMuur] = useState(null)      // null = besig

  /* Ses plasings, dan "Wys meer".

     Elke kaart dra 'n klankspeler en 'n hele storie. Dertig van hulle op een
     slag beteken dertig spelers wat metadata gaan haal en 'n bladsy wat op 'n
     swak sein nie klaar laai nie — en 'n swak sein is in Suid-Afrika die
     gewone geval, nie die uitsondering nie. */
  const [wysAantal, setWysAantal] = useState(6)

  /* ── Die muur bly lewendig ──

     Iemand druk 'n reaksie of skryf 'n opmerking; almal anders moet dit
     sien sonder om die app toe te maak en weer oop te maak. Ons gaan kyk
     elke dertig sekondes solank die muur op die skerm is.

     Twee reels hou dit goedkoop en stil:
       · dit loop NET op die muur-oortjie. Op Die Video's is daar niks om te
         verfris nie;
       · dit staan stil wanneer die blad weggesteek is — 'n foon in iemand se
         sak moet niks doen nie. */
  useEffect(() => {
    if (afdeling !== 'muur') return
    let lewendig = true

    const verfris = () => {
      if (!lewendig || document.hidden) return
      vergeetMuur()
      haalMuur().then(d => { if (lewendig) setMuur(d) })
    }

    const tik = setInterval(verfris, POLS_MS)
    /* Kom 'n mens terug na die app toe, wag ons nie eers dertig sekondes nie. */
    document.addEventListener('visibilitychange', verfris)
    return () => {
      lewendig = false
      clearInterval(tik)
      document.removeEventListener('visibilitychange', verfris)
    }
  }, [afdeling])

  /* ── Watter plasing op die muur is hierdie mens s'n ── */
  const [myPlasings, setMyPlasings] = useState([])
  useEffect(() => {
    if (!muur || !muur.length) return
    let lewendig = true
    haalMyPlasings().then(lys => { if (lewendig) setMyPlasings(lys) })
    return () => { lewendig = false }
  }, [muur])

  /* Hoeveel plek daar vandag is. Kom dit nie deur nie, wys ons eenvoudig
     niks — 'n blad sonder die reel is reg, een met 'n verkeerde getal nie. */
  const [plek, setPlek] = useState(null)

  /* ── Die telling moet DADELIK bykom ──

     Dit het een keer gelaai en dan 'n minuut lank gekas. Die bediener keer
     wel dat iemand oor die plafon skryf, maar die REEL OP DIE SKERM het
     gelieg: dit het "8 van 20" gewys terwyl daar twintig was, en dan skryf
     iemand 'n hele boodskap vol wat dan geweier word. Dit is die soort ding
     wat 'n mens laat ophou probeer.

     Nou kom dit by op drie oomblikke: elke vyftien sekondes soos die muur,
     die oomblik as 'n mens terugkeer na die app toe, en dadelik wanneer die
     vorm toemaak — want dan het HIERDIE mens pas 'n plek gevat. */
  const verfrisPlek = useCallback(() => {
    vergeetPlek()
    return haalPlek().then(setPlek)
  }, [])

  useEffect(() => {
    let lewendig = true
    const tik = () => {
      if (!lewendig || document.hidden) return
      vergeetPlek()
      haalPlek().then(p => { if (lewendig) setPlek(p) })
    }
    const id = setInterval(tik, POLS_MS)
    document.addEventListener('visibilitychange', tik)
    return () => {
      lewendig = false
      clearInterval(id)
      document.removeEventListener('visibilitychange', tik)
    }
  }, [])

  useEffect(() => {
    let lewendig = true
    haalVideos().then(d => {
      if (!lewendig) return
      setData(d)
    })
    haalMuur().then(p => { if (lewendig) setMuur(p) })
    haalPlek().then(p => { if (lewendig) setPlek(p) })
    return () => { lewendig = false }
  }, [])

  /* 'n Gedeelde skakel bring 'n mens direk by daardie plasing of video uit.
     Kom hy nie van 'n skakel af nie, gebeur hier niks.

     Die `gespring`-merker keer dat die effek by ELKE nuwe data weer spring —
     iemand wat die skakel oopmaak en dan op "Die Video's" druk voordat die
     muur klaar gelaai het, sou teruggeslinger word.

     Maar 'n merker alleen was nie genoeg nie. Sorg word AFGEBREEK wanneer 'n
     mens 'n ander oortjie kies (`{tab === 'sorg' && <Sorg />}`), dus begin
     die merker weer op false wanneer hy terugkom — en die hash staan nog in
     die adresbalk. Die gevolg: elke keer wat hy na Sorg terugkeer, spring dit
     weer na daardie een plasing. Die skakel het sy werk gedoen en bly toe
     aanhou werk.

     Ons vee die hash dus uit sodra ons gespring het. */
  const gespring = useRef(false)
  useEffect(() => {
    if (gespring.current) return
    const s = leesSorgSkakel()
    if (!s) return
    setAfdeling(s.soort === 'video' ? 'videos' : 'muur')

    /* Wag tot die ding waarheen ons spring, werklik daar is. */
    if (s.soort === 'video' ? data === null : muur === null) return

    gespring.current = true
    const el = document.getElementById(`sorg-${s.soort}-${s.id}`)
    if (el) el.scrollIntoView({ block: 'center' })
    try { window.history.replaceState({}, '', '/') } catch { /* ou blaaier */ }
  }, [muur, data])

  const videos = (data && data.videos) || []
  const held   = data ? weekVideo(data) : null

  /* ── Die held staan NIE ook in die biblioteek nie ──

     Hy wys reeds hier bo, op dieselfde skerm, met sy eie titel en sy eie
     hou-van-balk. Sou hy ook onder sy onderwerp verskyn, sien 'n mens
     dieselfde video twee keer as hy net 'n bietjie rol — en dit is presies
     die klagte.

     Die res van die biblioteek bly volledig. Niks gaan weg nie; die een wat
     uitgehaal word, is die een wat 'n handbreedte hoër staan. Wanneer hy
     more se video plaas, val hierdie een vanself terug in sy groep. */
  const biblioteek = held ? videos.filter(v => v.id !== held.id) : videos
  const plasings = muur || []


  return (
    <div className="sorg">
      <div className="sorg-header screen-header">
        {/* Twee knoppies, en albei moet gesien word. "Hulp nou" is die
            dringende een en bly eerste; "Ondersteun" staan langs hom in
            dieselfde vorm sodat dit soos 'n knoppie lyk en nie soos 'n
            etiket nie. */}
        <div className="sorg-hero-knoppe">
          <button className="sorg-hulp-knop" onClick={() => setHulpOop(true)}>Hulp nou</button>
          <button className="sorg-steun-knop" onClick={() => setSteunOop(true)}>
            <span aria-hidden="true">♡</span> Ondersteun
          </button>
        </div>
        <h1>Pastorale Sorg</h1>
        <p>Bring die swaar ding. Jy hoef dit nie alleen te dra nie.</p>
      </div>

      <div className="sorg-body">

        {/* ── Hoeveel plek daar vandag is ──

            Dit is 'n BELOFTE, nie 'n meter nie. Dit sê drie goed tegelyk vir
            iemand wat oorweeg om te skryf: daar gaan werklik na jou boodskap
            gekyk word, daar is 'n MENS aan die ander kant met 'n grens, en
            die plek is nie oneindig nie.

            Die getal kom uit dieselfde teller wat 'n indiening laat deurgaan
            of keer. Daar is nie 'n tweede som op die skerm nie — dan sou die
            blad plek kon belowe wat die vorm dan weier. */}
        {plek && (
          <div className={`sorg-plek${plek.vol ? ' vol' : ''}`}>
            {plek.vol ? (
              <>
                <p className="sorg-plek-kop">Vandag se plekke is vol</p>
                <p className="sorg-plek-fyn">
                  Dankie dat jy hier is. Ek kan vandag nie meer boodskappe
                  behoorlik lees nie, maar môre maak ek weer plek. Kom asseblief
                  terug — en as dit dringend is, is <b>Hulp nou</b> bo-aan die
                  blad daar, dag en nag.
                </p>
              </>
            ) : (
              <>
                <p className="sorg-plek-kop">
                  Vandag maak ek plek vir {plek.plafon} mense wat pastorale
                  begeleiding nodig het
                </p>
                <div className="sorg-plek-balk" aria-hidden="true">
                  <span style={{ width: `${Math.min(100, Math.round((plek.vandag / plek.plafon) * 100))}%` }} />
                </div>
                <p className="sorg-plek-fyn">
                  <b>{plek.vandag} van {plek.plafon}</b> reeds ingestuur
                  {plek.oor > 0 && <> · nog {plek.oor} {plek.oor === 1 ? 'plek' : 'plekke'} oop</>}
                </p>
              </>
            )}
          </div>
        )}

        {/* ── Die uitnodiging ──

            Die foto en die NAAM staan saam op een reel, en die opskrif kry
            sy eie spasie daaronder. Toe hulle langs mekaar was, het dit
            gelyk of "Waarmee kan ek jou help?" sy naam is, en 'n lang
            opskrif is in 'n handbreedte gedruk.

            "Ek lees dit self" is uit. 'n Helper gaan ook boodskappe nagaan,
            en dan sou dit nie meer waar wees nie. "Ek antwoord met 'n
            stemboodskap waar ek kan" hou die persoonlike gevoel en bly
            eerlik. */}
        <div className="sorg-uitnodig">
          <div className="sorg-uitnodig-wie">
            <img className="sorg-gesig" src="/beelde/dewald.jpg" alt="Dewald Scheepers" width="46" height="46" />
            <span className="sorg-uitnodig-naam">Dewald Scheepers</span>
          </div>

          <h2 className="sorg-uitnodig-titel">Waarmee kan ek jou help?</h2>

          {/* ── Net genoeg om die doel duidelik te maak ──

              Hier het vier paragrawe gestaan. Hulle was nie verkeerd nie —
              hulle het net twee verskillende werke gedoen op dieselfde plek:
              'n UITNODIGING (kom, vertel my) en 'n KONTRAK (dit is wat met
              jou woorde gaan gebeur).

              Die uitnodiging hoort waar iemand besluit of hy wil. Die kontrak
              hoort op die oomblik van verbintenis — reg voor hy stuur. Die
              reels oor die openbare muur, die privaatheid en die ander wat 'n
              woord kan laat, staan nou op die indieningskerm, waar ELKEEN wat
              stuur hulle sien. Vantevore het iemand wat via 'n kennisgewing
              reguit na die vorm gegaan het, hulle nooit gesien nie. */}
          <p className="sorg-uitnodig-teks">
            Vertel my wat in jou lewe gebeur. Hier kan jy anoniem jou hart
            uitpraat, jou storie deel en vra vir pastorale raad en praktiese
            Bybelse wysheid oor jou huwelik, verhoudings, grense, vergifnis,
            angs, geloof of 'n moeilike besluit.
          </p>

          <p className="sorg-uitnodig-teks">
            Ek lees die boodskappe en antwoord van hulle persoonlik met
            pastorale begeleiding. Die stories en antwoorde kan ook ander mense
            help wat deur dieselfde dinge gaan.
          </p>

          <p className="sorg-uitnodig-grens">
            Hierdie afdeling is vir pastorale begeleiding — nie vir geldelike
            of materiële hulpversoeke nie.
          </p>

          {/* Is die dag vol, sê die knoppie so eerder as om iemand 'n vorm
              te laat volskryf wat dan geweier word. */}
          <button
            className="sorg-vertel"
            onClick={() => setVormOop(true)}
            disabled={!!(plek && plek.vol)}
          >
            {plek && plek.vol ? 'Vandag se plekke is vol — môre weer' : 'Vertel my wat swaar is'}
          </button>
          <p className="sorg-uitnodig-fyn">Jou identiteit bly anoniem.</p>
        </div>

        {/* ── Die daaglikse video ──

            Dieselfde kaartjie as in die biblioteek, en dit SPEEL waar dit
            staan. Die eerste weergawe het na die Video's-oortjie genavigeer;
            'n mens druk 'n speel-driehoek en verwag dat dit speel, nie dat
            die blad onder hom uitskuif nie.

            Sonder die aksiebalk — die hoofblad se werk is die uitnodiging en
            die muur. Wie wil reageer of deel, kry dit op die Video's-oortjie
            waar dieselfde video met sy volle balk staan.

            Hy bly hier omdat die volgorde op hierdie blad HOOP VOOR PYN is:
            iemand wat in krisis aankom en dadelik veertig plasings van ander
            se lyding lees, gaan slegter weg.

            NET op die muur-oortjie. Die kaartjie sit bo die oortjies, dus sou
            hy andersins ook op die Video's-oortjie wys — en dan staan
            dieselfde video twee keer op een skerm. */}
        {held && afdeling === 'muur' && (
          <div className="sorg-vandag">
            <SorgVideo video={held} etiket="Vandag se video" wysBalk={false} />
          </div>
        )}

        {/* ── Twee afdelings ── */}
        {/* ── Twee duidelike afdelings ──

            Dit was twee klein pilletjies wat maklik gelyk het soos etikette
            eerder as knoppies, en 'n mens moes raai wat aan is. Nou is dit
            een balk wat die volle breedte vat, met 'n ikoon en 'n telling by
            elkeen — dan sien 'n mens sonder om te lees waar hy is en wat
            agter die ander een wag. */}
        <div className="sorg-oortjies" role="tablist">
          {AFDELINGS.map(a => (
            <button
              key={a.sleutel}
              role="tab"
              aria-selected={afdeling === a.sleutel}
              className={`sorg-oortjie${afdeling === a.sleutel ? ' aktief' : ''}`}
              onClick={() => setAfdeling(a.sleutel)}
            >
              <span className="sorg-oortjie-ikoon" aria-hidden="true">
                {a.sleutel === 'muur' ? <HartIkoon /> : <SpeelIkoon />}
              </span>
              <span className="sorg-oortjie-naam">{a.naam}</span>
              <span className="sorg-oortjie-tel">
                {/* Wat WERKLIK in die oortjie is. Vandag se video staan
                    hierbo en is uit die biblioteek gehaal, dus sou
                    `videos.length` een meer belowe as wat 'n mens daar kry. */}
                {a.sleutel === 'muur' ? plasings.length : biblioteek.length}
              </span>
            </button>
          ))}
        </div>

        {afdeling === 'videos' && (
          data === null ? (
            <p className="sorg-leeg">Besig om te laai…</p>
          ) : !videos.length ? (
            <p className="sorg-leeg">
              Die eerste video kom binnekort. Dit sal saamgestel word uit die
              vrae en onderwerpe wat mense hier op die Pastorale Sorg-muur
              deel.
            </p>
          ) : (
            /* Sonder hierdie kop lyk die afdeling soos enige ander
               videobiblioteek. Mense moet DADELIK verstaan dat die video's
               uit hul eie vrae en seer ontstaan:

                 mense deel  →  hy luister  →  een video  →  baie word gehelp */
            <>
              <div className="sorg-kring">
                <p className="sorg-kring-kop">Elke dag 'n nuwe video.</p>
                <p className="sorg-kring-teks">
                  Dewald maak elke dag 'n pastorale video oor die onderwerpe
                  en vrae wat die meeste hier gedeel word. So kan een persoon
                  se storie uiteindelik baie ander mense help.
                </p>
              </div>

              {/* ── Vandag se video, heel bo en groot ──

                  Hierdie oortjie was 'n herhaling van die hoofblad: dieselfde
                  video het op albei gespeel. Nou speel hy HIER, en die
                  hoofblad dra net 'n kaartjie wat hierheen wys. Dit maak van
                  die oortjie 'n bestemming in plaas van 'n tweede kopie.

                  Hy bly uit die lys hieronder uit — sien `biblioteek` —
                  sodat hy nooit twee keer op een skerm staan nie. */}
              {held && (
                <div className="sorg-nuut" id={`sorg-video-${held.videoId}`}>
                  <span className="sorg-nuut-merk">Nuut vandag</span>
                  <SorgVideo video={held} />
                  <SorgDeelSteun soort="video" id={held.videoId} titel={held.titel} wysDeel={false} />
                </div>
              )}

              {biblioteek.length > 0 && (
                <p className="sorg-meer-kop">Meer pastorale video's</p>
              )}

              {/* ── 'n Plat lys, nie groepe nie ──

                  Elke kaartjie het 'n pers opskrif bo hom gehad — die sin
                  waaronder hy gegroepeer is. Dit het gewerk toe elke video 'n
                  volle speler was en 'n mens een op 'n slag gesien het. Nou
                  dat hulle kaartjies is, staan daar 'n opskrif tussen elke
                  twee kaartjies en die lys word 'n trap in plaas van 'n lys.

                  Die onderwerpe verdwyn nie — hulle bepaal steeds watter video
                  iemand kry nadat hy sy boodskap gestuur het. Hulle word net
                  nie meer as koppe geteken nie. */}
              {biblioteek.map(v => (
                <div key={v.id} id={`sorg-video-${v.videoId}`}>
                  <SorgVideo video={v} />
                  <SorgDeelSteun soort="video" id={v.videoId} titel={v.titel} wysDeel={false} />
                </div>
              ))}
            </>
          )
        )}

        {afdeling === 'muur' && (
          muur === null ? (
            <p className="sorg-leeg">Besig om te laai…</p>
          ) : !plasings.length ? (
            <p className="sorg-leeg">
              Die muur is nog leeg. Wees die eerste — jou woorde kan die een
              wees wat iemand anders laat weet hy is nie alleen nie.
            </p>
          ) : (
            <>
              <p className="sorg-muur-fyn">
                Elke boodskap hier is deur 'n mens gelees en met toestemming
                geplaas. Niks kom outomaties op hierdie muur nie.
              </p>
              {plasings.slice(0, wysAantal).map(p => (
                <SorgPlasing key={p.id} plasing={p} myne={myPlasings.includes(p.id)} />
              ))}

              {plasings.length > wysAantal && (
                <button className="sorg-meer" onClick={() => setWysAantal(n => n + 6)}>
                  Wys meer
                  <span>{plasings.length - wysAantal} nog</span>
                </button>
              )}
            </>
          )
        )}

        {/* ── Die steunkaart ──

            Dieselfde komponent as op E-boeke, Bybel, Leesplanne en die
            kinderboeke — nie 'n eie weergawe nie.

            Ek het eers 'n eie blok hier gebou met eie woorde en eie
            knoppies. Dit was verkeerd: dieselfde versoek moet oral dieselfde
            lyk. 'n Mens wat die groen "Word 'n Maandelikse Hoop-Vennoot"
            elders leer ken het, moet hom hier herken sonder om te lees. En
            wanneer die woorde eendag verander, verander hulle op EEN plek.

            Dit staan heel onder, na die muur en na die video's. */}
        <DonationCard />

        <p className="sorg-grens">{GRENSSIN}</p>
      </div>

      <HulpNou oop={hulpOop} onSluit={() => setHulpOop(false)} />
      <SorgSteun oop={steunOop} onSluit={() => setSteunOop(false)} />

      {/* Die vorm dek die hele skerm. Iemand wat sy swaarste ding tik, moet
          niks anders sien nie — geen navigasie, geen ander video's, en geen
          versoek om geld nie. */}
      {/* Maak die vorm toe, het hierdie mens dalk pas 'n plek gevat. Ons vra
          die telling dadelik weer, sodat die reel bo nooit meer plek belowe
          as wat daar is nie. */}
      <SorgVorm
        oop={vormOop}
        onSluit={() => { setVormOop(false); verfrisPlek(); vergeetMuur() }}
        videoData={data}
      />
    </div>
  )
}
