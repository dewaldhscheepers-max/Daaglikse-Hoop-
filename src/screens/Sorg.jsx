/* ────────────────────────────────────────────────────────────
   Pastorale Sorg.

   Die volgorde op hierdie blad is 'n besluit, nie 'n toeval nie:

     Hulp nou             — altyd bo, altyd bereikbaar
     Die week se video    — een ding, die held
     Waarmee kan ek jou help?
     Vandag se woord
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

import { useState, useEffect, useRef } from 'react'
import SorgVideo from '../components/SorgVideo'
import SorgNommers from '../components/SorgNommers'
import SorgVorm from '../components/SorgVorm'
import SorgPlasing from '../components/SorgPlasing'
import SorgDeelSteun from '../components/SorgDeelSteun'
import DonationCard from '../components/DonationCard'
import {
  haalVideos, weekVideo, vandagSeWoord, merkWoordGesien, volgensBehoefte,
} from '../data/sorgVideos'
import { haalMuur, meldGelees, haalMyPlasings, vergeetMuur, POLS_MS } from '../data/sorgMuur'
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
  { sleutel: 'videos', naam: 'Die Video\'s' },
]

export default function Sorg() {
  const [hulpOop, setHulpOop] = useState(false)
  const [vormOop, setVormOop] = useState(false)
  const [afdeling, setAfdeling] = useState('muur')
  const [data, setData] = useState(null)      // null = besig
  const [woord, setWoord] = useState(null)
  const [muur, setMuur] = useState(null)      // null = besig

  /* Ses plasings, dan "Wys meer".

     Elke kaart dra 'n klankspeler en 'n hele storie. Dertig van hulle op een
     slag beteken dertig spelers wat metadata gaan haal en 'n bladsy wat op 'n
     swak sein nie klaar laai nie — en 'n swak sein is in Suid-Afrika die
     gewone geval, nie die uitsondering nie. */
  const [wysAantal, setWysAantal] = useState(6)

  /* ── Wie lees ──

     Dewald het gesê dit voel of niemand reageer nie. Maar die blad het nog
     nooit getel hoeveel mense LEES nie — net hoeveel druk. Op enige muur
     reageer sowat een uit vyftig, dus kon tweehonderd mense 'n storie gelees
     het terwyl die telling op 1 staan.

     Elke plasing tel EEN keer per toestel; die foon onthou wat hy gesien
     het. Ons meld net wat werklik op die skerm is, en een oproep vir almal
     saam — nie een per kaart nie. */
  useEffect(() => {
    if (afdeling !== 'muur' || !muur || !muur.length) return
    meldGelees(muur.slice(0, wysAantal).map(p => p.id))
  }, [muur, wysAantal, afdeling])

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

  useEffect(() => {
    let lewendig = true
    haalVideos().then(d => {
      if (!lewendig) return
      setData(d)
      setWoord(vandagSeWoord(d))
    })
    haalMuur().then(p => { if (lewendig) setMuur(p) })
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
  const groepe = volgensBehoefte(videos)
  const plasings = muur || []


  return (
    <div className="sorg">
      <div className="sorg-header screen-header">
        <button className="sorg-hulp-knop" onClick={() => setHulpOop(true)}>Hulp nou</button>
        <h1>Pastorale Sorg</h1>
        <p>Bring die swaar ding. Jy hoef dit nie alleen te dra nie.</p>
      </div>

      <div className="sorg-body">

        {/* ── Die held ── */}
        {held && (
          <>
            <SorgVideo
              video={held}
              groot
              etiket="Die week se video"
              etiketFyn="Gebaseer op wat mense hierdie week op die muur gedeel het."
            />
            <SorgDeelSteun soort="video" id={held.videoId} titel={held.titel} />
          </>
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

          <p className="sorg-uitnodig-teks">
            Vertel my wat in jou lewe gebeur. Hier kan jy anoniem jou hart
            uitpraat, jou storie deel en vra vir pastorale raad oor jou
            huwelik, verhoudings, grense, vergifnis, angs, geloof of 'n
            moeilike besluit.
          </p>

          <p className="sorg-uitnodig-teks">
            Jou boodskap word ná goedkeuring anoniem op die openbare Pastorale
            Sorg-muur geplaas, sodat ander wat deur dieselfde dinge gaan ook
            daaruit kan leer. Ek deel pastorale begeleiding en praktiese
            Bybelse wysheid, en antwoord van die boodskappe met 'n
            stemboodskap.
          </p>

          <p className="sorg-uitnodig-teks">
            Een keer per week deel ek ook 'n video waarin ek die belangrikste
            vrae, stories en onderwerpe van die week saamvat.
          </p>

          {/* Dit moet gesê word sodra vreemdelinge onder 'n storie kan skryf.
              Iemand wat dit nie verwag nie, skrik — en dit is presies die
              soort verrassing wat 'n mens nie op hierdie blad wil hê nie. */}
          <p className="sorg-uitnodig-teks">
            Ander wat op die muur lees, kan met 'n kort woord van ondersteuning
            saam met jou staan. Niemand gee raad nie en niemand kan jou
            antwoord nie — dit is net mense wat laat weet hulle dra dit saam.
          </p>

          {/* ── Wat hierdie plek NIE is nie ──

              Mense het begin vra vir beddens en vir geld. Dit is nie wat
              hierdie afdeling is nie, en dit is nie onvriendelik om dit te
              sê nie — dis onvriendelik om iemand te laat skryf en wag vir
              hulp wat nooit gaan kom nie. */}
          <p className="sorg-uitnodig-grens">
            Hierdie afdeling is vir pastorale begeleiding — nie vir geldelike
            of materiële hulpversoeke nie.
          </p>

          <button className="sorg-vertel" onClick={() => setVormOop(true)}>
            Vertel my wat swaar is
          </button>
          <p className="sorg-uitnodig-fyn">Jou identiteit bly anoniem.</p>
        </div>

        {/* ── Vandag se woord ── */}
        {woord && (
          <>
            <SorgVideo
              video={woord}
              etiket="Vandag se woord"
              onSpeel={v => merkWoordGesien(v.id)}
            />
            <SorgDeelSteun soort="video" id={woord.videoId} titel={woord.titel} />
          </>
        )}

        {/* ── Twee afdelings ── */}
        <div className="sorg-oortjies" role="tablist">
          {AFDELINGS.map(a => (
            <button
              key={a.sleutel}
              role="tab"
              aria-selected={afdeling === a.sleutel}
              className={`sorg-oortjie${afdeling === a.sleutel ? ' aktief' : ''}`}
              onClick={() => setAfdeling(a.sleutel)}
            >
              {a.naam}
            </button>
          ))}
        </div>

        {afdeling === 'videos' && (
          data === null ? (
            <p className="sorg-leeg">Besig om te laai…</p>
          ) : !videos.length ? (
            <p className="sorg-leeg">
              Die eerste weeklikse video kom binnekort. Dit sal saamgestel
              word uit die vrae en onderwerpe wat mense hier op die Pastorale
              Sorg-muur deel.
            </p>
          ) : (
            /* Sonder hierdie kop lyk die afdeling soos enige ander
               videobiblioteek. Mense moet DADELIK verstaan dat die video's
               uit hul eie vrae en seer ontstaan:

                 mense deel  →  hy luister  →  een video  →  baie word gehelp */
            <>
              <div className="sorg-kring">
                <p className="sorg-kring-kop">Een video. Elke week.</p>
                <p className="sorg-kring-teks">
                  Elke week maak Dewald 'n pastorale video oor die onderwerpe
                  en vrae wat die meeste op die muur gedeel word. So kan een
                  persoon se storie uiteindelik baie ander mense help.
                </p>
              </div>
              {groepe.map(g => (
              <div key={g.sleutel} className="sorg-groep">
                <h2 className="sorg-groep-sin">{g.sin}</h2>
                {g.videos.map(v => (
                  <div key={v.id} id={`sorg-video-${v.videoId}`}>
                    <SorgVideo video={v} />
                    <SorgDeelSteun soort="video" id={v.videoId} titel={v.titel} />
                  </div>
                ))}
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

      {/* Die vorm dek die hele skerm. Iemand wat sy swaarste ding tik, moet
          niks anders sien nie — geen navigasie, geen ander video's, en geen
          versoek om geld nie. */}
      <SorgVorm oop={vormOop} onSluit={() => setVormOop(false)} videoData={data} />
    </div>
  )
}
