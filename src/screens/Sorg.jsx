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

import { useState, useEffect } from 'react'
import SorgVideo from '../components/SorgVideo'
import SorgNommers from '../components/SorgNommers'
import SorgVorm from '../components/SorgVorm'
import SorgPlasing from '../components/SorgPlasing'
import SorgDeelSteun from '../components/SorgDeelSteun'
import {
  haalVideos, weekVideo, vandagSeWoord, merkWoordGesien, volgensBehoefte,
} from '../data/sorgVideos'
import { haalMuur } from '../data/sorgMuur'
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
     Kom hy nie van 'n skakel af nie, gebeur hier niks. */
  useEffect(() => {
    const s = leesSorgSkakel()
    if (!s) return
    setAfdeling(s.soort === 'video' ? 'videos' : 'muur')
    if (muur === null && s.soort !== 'video') return
    const el = document.getElementById(`sorg-${s.soort}-${s.id}`)
    if (el) el.scrollIntoView({ block: 'center' })
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
            Vertel my wat swaar is, vra jou vraag of deel jou storie. Jou
            boodskap verskyn ná goedkeuring openbaar op die Pastorale
            Sorg-muur. Ek antwoord met 'n stemboodskap waar ek kan.
          </p>

          <button className="sorg-vertel" onClick={() => setVormOop(true)}>
            Vertel my wat swaar is
          </button>
          <p className="sorg-uitnodig-fyn">Jy kan anoniem bly.</p>
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
              {plasings.map(p => <SorgPlasing key={p.id} plasing={p} videos={videos} />)}
            </>
          )
        )}

        {/* ── Die groot steunblok ──

            EEN keer, en heel onder — na die muur, na die video's, na alles.

            Dit was 'n rukkie voorwaardelik: dit sou net wys as daar 'n video
            of 'n antwoord was. Die bedoeling was reg (geen versoek om geld
            voordat iemand iets ontvang het nie), maar die uitvoering was
            verkeerd: met nul video's en 'n lee muur het die HELE blok
            verdwyn, en dit lyk of die knoppies weg is in plaas van dat hulle
            wag.

            Die reel wat werklik saak maak, word in elk geval nagekom deur
            SorgDeelSteun: daardie klein rytjies bestaan net waar daar 'n
            video of 'n antwoord IS, want hulle hang aan die ding self. Die
            een blok heel onderaan hoort altyd daar. */}
        <div className="sorg-steun">
          <p className="sorg-steun-kop">Help om Daaglikse Hoop gratis te hou</p>
          <p className="sorg-steun-teks">
            Alles hier is gratis en bly gratis. As dit vir jou iets beteken,
            help dit ons om dit vir iemand anders oop te hou.
          </p>
          <div className="sorg-steun-knoppe">
            <button
              className="sorg-steun-knop primer"
              onClick={() => window.dispatchEvent(new CustomEvent('open-hoop-vennoot'))}
            >
              Ondersteun maandeliks
            </button>
            <button
              className="sorg-steun-knop"
              onClick={() => window.dispatchEvent(new CustomEvent('open-donation'))}
            >
              Gee eenmalig
            </button>
          </div>
        </div>

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
