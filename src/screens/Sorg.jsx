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
import DonationCard from '../components/DonationCard'
import {
  haalVideos, weekVideo,
} from '../data/sorgVideos'
import { haalMuur, haalMyPlasings, vergeetMuur, leesSaamDra, POLS_MS } from '../data/sorgMuur'
import { saamDraLys } from '../data/sorgSaamDra'
import { haalPlek, vergeetPlek } from '../data/sorgPlek'
import { leesSorgSkakel } from '../data/sorgDeel'
import { telSorg } from '../data/telSorg'
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

/* ── Drie oortjies ──
 *
 * Dewald: "Die drie hoof-oortjies bly: Gesprekke · Saam dra · Video's."
 *
 * "Gesprekke", nie "Gemeenskap" en nie "Die Muur" nie. 'n Muur is 'n ding
 * waarop iets geplak word; 'n gesprek is twee mense. Die woord doen werk:
 * dit sê vir iemand wat lees dat daar geantwoord word.
 *
 * "Saam dra" is die PAD TERUG. Sonder dit skryf 'n mens een sin onder 'n
 * vreemdeling se storie en kry daardie storie nooit weer nie. */
const AFDELINGS = [
  { sleutel: 'muur',   naam: 'Gesprekke' },
  { sleutel: 'saam',   naam: 'Saam dra' },
  { sleutel: 'videos', naam: 'Video\'s' },
]

export default function Sorg({ onNavigate }) {
  const [hulpOop, setHulpOop] = useState(false)
  const [vormOop, setVormOop] = useState(false)
  const [afdeling, setAfdeling] = useState('muur')
  /* Wat hierdie foon saamdra. Dit kom uit localStorage en word by elke
     oopmaak weer gelees — 'n mens wat in 'n ander oortjie geskryf het, moet
     dit hier sien sonder om die app toe te maak. */
  const [saamDra, setSaamDra] = useState(() => leesSaamDra())
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

  /* ── Die blad is oopgemaak ──

     Die eerste sport van die trechter. Sien src/data/telSorg.js en
     api/tel-sorg.js: drie heelgetalle, geen naam en geen toestel-id.
     Eenmalig, want React se ontwikkelingsmodus roep effekte twee keer. */
  useEffect(() => { telSorg('oop', { eenmalig: true }) }, [])

  /* Die Saam dra-lys weer lees sodra 'n mens na daardie oortjie gaan. Sonder
     dit wys 'n gesprek waarby hy pas gaan sit het, eers ná 'n herlaai. */
  useEffect(() => { if (afdeling === 'saam') setSaamDra(leesSaamDra()) }, [afdeling])

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

  /* Die deur op Luister het eers reguit hierdie vorm oopgemaak. Dit was te
     vinnig: iemand wat daar druk, is nuuskierig — hy het nog nie besluit om
     sy swaarste ding te tik nie, en 'n vorm wat oor sy skerm oopklap, vra
     dit voordat hy weet wat hierdie plek is. Nou land hy op die blad. */

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
    try {
      window.history.replaceState({}, '', '/')
      sessionStorage.removeItem('sorg_skakel')
    } catch { /* ou blaaier */ }
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

  /* Wie nog min ondersteuning gekry het. Dit kom uit die muur wat reeds
     gelaai is — geen tweede versoek, geen nuwe eindpunt.
     MIN, nie NUL nie: 'n plasing met een reaksie is steeds byna alleen. */
  const alleen = plasings.filter(p => Number(p.saam || 0) < 3)


  /* ── Wie WAG nog vir iemand ──
   *
   * Dewald: "Wys onbeantwoorde stories eerste onder: Wag nog vir iemand."
   *
   * Dit is die belangrikste sortering op die hele blad. 'n Voer op datum wys
   * die nuutste eerste, en dan bly die mens wat drie dae gelede geskryf het
   * en wie NIEMAND geantwoord het nie, vir altyd onder — presies die een wat
   * iemand nodig het.
   *
   * WAG = geen opmerking nie. Nie "min reaksies" nie: 'n hartjie is nie 'n
   * antwoord nie, en 'n mens wat vyf hartjies en geen woord gekry het, wag
   * steeds. */
  const woordeVan = p => Number(p.woordeTotaal) || (Array.isArray(p.woorde) ? p.woorde.length : 0)
  const wag = plasings.filter(p => woordeVan(p) === 0)
  const beantwoord = plasings.filter(p => woordeVan(p) > 0)

  /* Hoeveel keer daar vandag saamgedra is. Een reël, geen kaart — dit is die
     verskil tussen 'n statiese blad en 'n plek waar iets gebeur. */
  const saamVandag = plasings.reduce((n, p) => n + (Number(p.saam) || 0), 0)

  /* ── Saam dra ──
   *
   * Die gesprekke waarby HIERDIE foon gaan sit het. Die lys lê in
   * localStorage (sien src/data/sorgSaamDra.js) en die woorde kom uit die
   * muur wat reeds gelaai is — geen tweede oproep, en niks wat 'n bediener
   * oor wie-wie-ondersteun kan verklap nie. */
  const myGesprekke = saamDraLys(saamDra, plasings)

  /* Vat die mens na EEN mens toe, nie na 'n voer van dertig se trauma nie.
     Dewald: "moenie hulle dadelik in 'n lang lys swaar stories gooi nie."
     Is daar niemand met min ondersteuning nie, gaan ons na die voer se bokant
     — daar is altyd iemand om te lees. */
  function naEenAlleen() {
    setAfdeling('muur')
    /* Na die mens wat WAG, nie na die een met min hartjies. 'n Hartjie is
       nie 'n antwoord nie, en die hele blad sorteer nou so. */
    const eerste = wag[0] || alleen[0] || plasings[0]
    if (!eerste) return
    /* Die muur is dalk pas eers gewys; gee die blad 'n raam om te teken. */
    requestAnimationFrame(() => {
      try {
        const el = document.getElementById(`sorg-plasing-${eerste.id}`)
        if (el) el.scrollIntoView({ block: 'center' })
      } catch {}
    })
  }


  return (
    <div className="sorg">
      <div className="sorg-header screen-header">
        {/* ── Een knoppie, en dit gaan oor hulp ──

            Hier het 'n groen "♡ Ondersteun" langs "Hulp nou" gestaan. Dit
            was die TWEEDE ding wat 'n mens op hierdie blad gesien het.

            Iemand wie se kind pas alle kontak verbreek het, maak hierdie
            blad oop en die eerste twee dinge is 'n noodnommer en 'n versoek
            om geld. Hierdie lêer se eie kop sê dit al: "geen versoek om
            geld op die skryfkant nie. Nooit waar iemand sy seer tik nie."
            Die kop het daardie reel gebreek.

            Die versoek is nie weg nie — dit staan heel onder, ná die muur
            en ná die video's, in dieselfde DonationCard as oral elders. Dit
            is die plek daarvoor: ná die hulp, nie voor nie. */}
        <div className="sorg-hero-knoppe">
          <button className="sorg-hulp-knop" onClick={() => setHulpOop(true)}>Hulp nou</button>
        </div>
        {/* ── Kort ──
         *
         * Hier het drie Skrifreëls en twee paragrawe gestaan. Dewald: "die
         * bokant moet baie korter en moderner wees... geen lang teksblok wat
         * die helfte van die skerm vul nie."
         *
         * Een reël wat sê wat hierdie plek is, en EEN vers. Die res van die
         * Skrif leef in die blad se werkwoorde, nie in 'n blok bo-aan nie. */}
        <h1>Sorg</h1>

        {/* ── Die kampvuur ──
         *
         * Mense om 'n vuur, onder sterre, met 'n kruis op die rand. Dit is
         * die hele blad in een prent: niemand sit alleen nie.
         *
         * Drie reëls hou dit heel:
         *
         *   · Dit is 'n CSS-`background-image` op 'n ONDEURSIGTIGE houer, nie
         *     'n `<img>` nie. 'n Volskerm-`<img>` is die grootste tekstuur in
         *     die app en Chrome gee dit maklik sy eie laag — dit is presies
         *     waar Vrugtefees se gekleurde strepe vandaan gekom het. Sien
         *     CLAUDE.md.
         *   · 16:9, dieselfde verhouding as die foto. Op ELKE skermwydte wys
         *     dus die volle breedte: al agt mense EN die kruis bly in. 'n
         *     Vaste hoogte sou op 'n smal foon links en regs afsny, en dan is
         *     die kruis weg.
         *   · Die woorde staan heel ONDER, oor die klippe en die vuur — nooit
         *     oor 'n gesig nie. Die gesigte lê in die middelband. */}
        <div className="sorg-vuur">
          <div className="sorg-vuur-woorde">
            <p className="sorg-vuur-vers">“Dra mekaar se laste.”</p>
            <p className="sorg-vuur-bron">Galasiërs 6:2</p>
          </div>
        </div>

        <p className="sorg-inlei">
          Hier luister ons, hier bid ons, en hier dra ons saam. Bring wat op jou
          hart is — sonder oordeel, en sonder om dit alleen te dra.
        </p>
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
        {/* ── Net wanneer die dag VOL is ──
         *
         * Hier het altyd 'n blokkie gestaan, ook wanneer daar plek was: eers
         * "Ek neem elke dag 'n beperkte aantal boodskappe aan", daarna "Jy
         * skryf nie in 'n leë kamer nie". Dewald oor die tweede: "maak glad
         * nie sin in afrikaans nie dit kan netsowel uit."
         *
         * Albei was gerusstelling voor die knoppies, en gerusstelling wat
         * niemand gevra het nie, lees soos verskoning. Die blad se kop, sy
         * twee Skrifpilare en sy twee ingange sê reeds wat hierdie plek is.
         *
         * Wat oorbly is die enigste geval waar 'n mens iets MOET weet: die
         * dag is vol en die knoppie gaan hom weier. */}
        {plek && plek.vol && (
          <div className="sorg-plek vol">
            <p className="sorg-plek-kop">Vandag se plekke is vol</p>
            <p className="sorg-plek-fyn">
              Dankie dat jy hier is. Ons neem vandag nie meer nuwe boodskappe
              aan nie, maar môre is daar weer plek. Kom asseblief terug — en as
              dit dringend is, is <b>Hulp nou</b> bo-aan die blad daar, dag en
              nag. Jy kan intussen gerus die stories hieronder lees en iemand
              anders bemoedig.
            </p>
          </div>
        )}

        {/* ── TWEE aksies, en net twee ──
         *
         * Dewald: "Remove 'DEEL WAT JOU GEHELP HET' completely. There must
         * only be TWO primary actions... Do not add a third primary action."
         *
         * Die derde knoppie het die blad ingewikkeld gemaak sonder om iets by
         * te voeg: "deel wat jou gehelp het" is nie 'n aparte pad nie, dit is
         * wat 'n mens SÊ wanneer hy iemand bemoedig. Dit leef nou binne
         * Bemoedig.
         *
         * Die hele blad se logika is dus twee vrae:
         *
         *     HET JY IEMAND NODIG?   ↔   KAN JY VANDAG IEMAND DRA?
         *
         * Die tweede moet visueel net so sterk wees as die eerste. Dit is die
         * een wat van 'n "help my"-muur 'n gemeenskap maak. */}
        {/* ── EEN kaart, TWEE knoppies ──
         *
         * Dewald se goedgekeurde uitleg: "Op die Sorg-tuisblad moet die twee
         * hoofkeuses duidelik wees: Deel wat swaar is · Luister na iemand."
         *
         * Dit was twee groot kaarte onder mekaar. Hulle het saam sowat 'n
         * halwe skerm gevat, en die gevolg was meetbaar: die eerste GESPREK
         * het eers 1 049px van bo af begin — 'n mens moes verby 'n hele
         * skerm van knoppies rol voordat hy 'n enkele mens sien.
         *
         * Een kaart met twee knoppies langs mekaar sê presies dieselfde ding
         * en die mense begin binne een skerm. */}
        <div className="sorg-doen">
          <h2>Wat is vandag op jou hart?</h2>
          <p>Jy kan iets deel, na iemand luister, of later terugkom na 'n gesprek.</p>
          <div className="sorg-doen-knoppe">
            <button
              className="sorg-knop"
              onClick={() => { telSorg('vorm'); setVormOop(true) }}
              disabled={!!(plek && plek.vol)}
            >
              {plek && plek.vol ? 'Vandag is vol' : 'Deel wat swaar is'}
            </button>
            <button className="sorg-knop uit" onClick={naEenAlleen}>
              Luister na iemand
            </button>
          </div>
        </div>

        {/* ── Hier is regte mense ──
         *
         * Een reël, geen kaart. Dit is die verskil tussen 'n statiese blad en
         * 'n plek waar iets gebeur. Dit wys NET wanneer daar werklik iets is
         * om te wys — 'n "0 mense" is erger as stilte. */}
        {saamVandag > 0 && (
          <p className="sorg-leef">
            <b>{saamVandag}</b> {saamVandag === 1 ? 'mens het' : 'mense het'} vandag saamgedra.
          </p>
        )}

        {/* ── Bid Saam bly APART, maar klein ──
         *
         * Dit was 'n kaart met 'n eie knoppie, en dit het soos 'n derde aksie
         * gelees. Dewald: "moenie nog 'n groot kaart bou nie... gebruik eerder
         * 'n eenvoudige, dun skakelbalk."
         *
         * Bid Saam bly die plek vir gebedsversoeke; hier word gedra, geluister
         * en ervaring gedeel. */}
        <button className="sorg-bidsaam" onClick={() => onNavigate && onNavigate('bidsaam')}>
          <span>Soek jy spesifiek gebed?</span>
          <b>Gaan na Bid Saam →</b>
        </button>

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
              {/* Die ikoon is weg. Met DRIE oortjies naas mekaar het 'n
                  ikoon, 'n naam en 'n telling nie op 'n 390px-skerm gepas
                  nie, en "Gesprekke" is as "Gespre…" afgekap. 'n Afgekapte
                  woord is erger as geen ikoon. */}
              <span className="sorg-oortjie-naam">{a.naam}</span>
              <span className="sorg-oortjie-tel">
                {/* Wat WERKLIK in die oortjie is. Vandag se video staan
                    hierbo en is uit die biblioteek gehaal, dus sou
                    `videos.length` een meer belowe as wat 'n mens daar kry. */}
                {a.sleutel === 'muur' ? plasings.length
                  : a.sleutel === 'saam' ? myGesprekke.length
                  : biblioteek.length}
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
                  {/* Die videokaart dra sy EIE Deel-knoppie; hier het net die
                      "dankie" gestaan en dit is weg. */}
                  <SorgVideo video={held} />
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
              {/* ── Dit was 'n LEUEN geword ──
               *
               * Hier het gestaan: "Elke boodskap hier is deur 'n mens gelees
               * en met toestemming geplaas. Niks kom outomaties op hierdie
               * muur nie."
               *
               * Plasings gaan nou dadelik op (sien api/sorg-stuur.mjs), dus
               * was daardie sin vals op die oomblik dat dit ontplooi het. 'n
               * Blad wat oor sy eie moderasie lieg, is erger as een sonder 'n
               * nota.
               *
               * Wat WEL waar bly: elke mens gee toestemming voordat hy stuur,
               * krisis-plasings wag steeds vir 'n mens, en enigiemand kan
               * rapporteer. */}
              {/* ── Bemoedig, WEER, bo die voer ──
               *
               * Dewald: "BEMOEDIG IEMAND VANDAG MOET ORAL SIGBAAR WEES.
               * Bo-aan. Bo die gemeenskapsvoer. En op elke individuele
               * plasing."
               *
               * Dit is die ding wat van 'n "help-my"-muur 'n gemeenskap maak,
               * en 'n mens wat tot hier gerol het, is presies die een wat dit
               * kan doen. */}
              {/* ── Die "Bemoedig iemand →"-strook is WEG ──
               *
               * Sy werk word nou deur die "Wag nog vir iemand"-kop hieronder
               * gedoen, en beter: die strook het net GESE dat iemand wag en
               * dan na 'n plasing gespring; die kop wys die mense self.
               *
               * Twee dinge wat dieselfde sê, direk onder mekaar, lees soos 'n
               * blad wat homself herhaal. */}
              <p className="sorg-muur-fyn">
                Elke storie hier is met die skrywer se toestemming geplaas.
                Sien jy iets wat nie hier hoort nie, druk <b>Rapporteer</b> —
                ons kyk daarna.
              </p>

              {/* ── WAG NOG VIR IEMAND, eerste ──
               *
               * Dewald: "Wys onbeantwoorde stories eerste onder: Wag nog vir
               * iemand."
               *
               * 'n Voer op datum stoot die mens wat drie dae gelede geskryf
               * het en wie niemand geantwoord het nie, vir altyd onder toe —
               * presies die een wat iemand nodig het. Hierdie kop draai dit
               * om, en dit is die enigste sortering op die blad wat werklik
               * iets vir iemand verander. */}
              {wag.length > 0 && (
                <>
                  <div className="sorg-groepkop">
                    <h2>Wag nog vir iemand</h2>
                    <p>
                      {wag.length === 1
                        ? 'Een mens het nog geen woord gekry nie.'
                        : `${wag.length} mense het nog geen woord gekry nie.`}
                    </p>
                  </div>
                  {wag.slice(0, wysAantal).map(p => (
                    <SorgPlasing key={p.id} plasing={p} myne={myPlasings.includes(p.id)} wag />
                  ))}
                  {wag.length > wysAantal && (
                    <button className="sorg-meer" onClick={() => setWysAantal(n => n + 6)}>
                      Wys meer wat wag
                      <span>{wag.length - wysAantal} nog</span>
                    </button>
                  )}
                </>
              )}

              {beantwoord.length > 0 && (
                <>
                  <div className="sorg-groepkop">
                    <h2>Gesprekke wat loop</h2>
                    <p>Hier is mense reeds by mekaar. Jy kan gerus aansluit.</p>
                  </div>
                  {beantwoord.slice(0, wysAantal).map(p => (
                    <SorgPlasing key={p.id} plasing={p} myne={myPlasings.includes(p.id)} />
                  ))}
                  {beantwoord.length > wysAantal && (
                    <button className="sorg-meer" onClick={() => setWysAantal(n => n + 6)}>
                      Wys meer
                      <span>{beantwoord.length - wysAantal} nog</span>
                    </button>
                  )}
                </>
              )}
            </>
          )
        )}

        {/* ── Saam dra ──
         *
         * Dewald: "Die doel is dat ondersteuning 'n voortdurende gesprek word
         * en nie net een los opmerking nie."
         *
         * Dit is die pad terug. Iemand skryf een sin onder 'n vreemdeling se
         * storie, gaan weg, en kry daardie storie nooit weer op 'n muur van
         * veertig plasings nie — nie omdat hy nie omgee nie, maar omdat daar
         * niks was wat hom teruggevat het nie. */}
        {afdeling === 'saam' && (
          muur === null ? (
            <p className="sorg-leeg">Besig om te laai…</p>
          ) : !myGesprekke.length ? (
            <div className="sorg-groepkop">
              <h2>Waar ek saam dra</h2>
              <p>
                Sodra jy onder iemand se storie skryf, kom daardie gesprek
                hierheen — sodat jy weet waar om terug te gaan en weer te vra
                hoe dit gaan.
              </p>
              <button className="sorg-knop gee" onClick={naEenAlleen}>
                Bemoedig iemand
              </button>
            </div>
          ) : (
            <>
              <div className="sorg-groepkop">
                <h2>Waar ek saam dra</h2>
                <p>'n Las word nie met een opmerking gedra nie. Kom terug. Vra weer.</p>
              </div>
              {myGesprekke.map(g => (
                <div key={g.plasing.id} className="sorg-saamdra">
                  {g.nuut && (
                    <p className="sorg-saamdra-merk nuut">
                      {g.nuweWoorde === 1 ? 'Nuwe antwoord' : `${g.nuweWoorde} nuwe antwoorde`}
                    </p>
                  )}
                  {!g.nuut && g.vraWeer && (
                    <p className="sorg-saamdra-merk">Vra weer hoe dit gaan</p>
                  )}
                  <SorgPlasing plasing={g.plasing} myne={myPlasings.includes(g.plasing.id)} />
                </div>
              ))}
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
