/* ────────────────────────────────────────────────────────────
   Vandag se Tyd met God.

   Luister → Lees die Woord → Vat dit saam → Dra iemand → Wat lê op jou hart
   → Klaar.

   ── Wat dit NIE is nie ──

   Dit is nie 'n nuwe afdeling van die app nie. Dit skep geen versameling, geen
   nuwe soort plasing en geen tweede telling nie. Elke aksie hierbinne gaan na
   presies dieselfde plek as die knoppie wat reeds daarvoor bestaan:

     · die stemboodskap is die nota op Luister, met dieselfde speler;
     · die Skrifgedeelte maak die app se eie Bybel op die regte vers oop;
     · die wallpaper is die een wat aan die nota hang;
     · "ek het vir hulle gebid" verhoog dieselfde `prayedCount` as die muur,
       deur dieselfde eindpunt, met dieselfde merkie in localStorage — wie op
       die muur reeds vir daardie versoek gebid het, word hier nie weer getel
       nie;
     · 'n gebedsversoek beland op die Bid Saam-muur, in dieselfde vorm en deur
       dieselfde keuring.

   Dewald: "een aksie, een databron, oral dieselfde resultaat."

   ── Waarom die skerms nie 'n teller dra nie ──

   Daar was 'n "STAP 3 VAN 5" bo-aan elke skerm. 'n Vorderingsbalk maak van
   tyd met God 'n vorm om te voltooi. Die skerms is stil; die knoppie onderaan
   sê waarheen dit gaan.

   ── Wat die res van die app hiervan moet weet ──

   Die vloei sit op z-index 238: BO die blad, maar ONDER die Bybel (250).
   VolgJesusLewe het presies hier geval — sy skerm het bo die Bybel gesit en
   die LEES-knoppie het niks gedoen nie.

   Terwyl dit oop is, word die donasie- en e-boekopspringers TERUGGEHOU (sien
   App.jsx). Hulle sou andersins tussen "luister" en "bid" inskuif.
   ──────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from 'react'
import { collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import Stemboodskap from '../components/Stemboodskap'
import { toestelId } from '../data/sorgStuur'
import { magDeel, saamSinVirOntvanger } from '../data/gebedDeel'
import { ontleedSkrif, skrifOpskrif } from '../data/skrifVerwysing'
import { prentPad } from '../data/prentPad'
import { hoopSkakel, deelBoodskap } from '../data/hoopSkakel'
import { like as likeNota, hetGelike, telling as likeTelling, GEBEURTENIS as LIKE_GEBEURTENIS } from '../data/notaLike'
import {
  dagSleutel, bouStappe, slotVraag, opsomming, maandSin,
  merkGeluister, merkGelees, merkGebid, merkGetik, merkHart, merkStap, merkKlaar,
} from '../data/tydMetGod'
import { leesStaat, skryfStaat } from '../data/tydMetGodBerging'
import './TydMetGod.css'

/* Hoeveel versoeke ons in een slag haal. Dit is EEN leesburst per mens per
   dag — nie 'n lewendige luisteraar nie. Om 06:30 maak duisende fone die app
   binne minute oop, en 'n `onSnapshot` per mens is presies hoe hierdie app
   verlede week teen sy Firestore-kwota vasgeloop het. */
const HAAL = 25
const SEWE_DAE = 7 * 24 * 60 * 60 * 1000

/* Firestore se `getDocs` het geen eie tydgrens nie en kan VIR ALTYD hang —
   sien CLAUDE.md. Tien sekondes is ruim vir 'n slegte lyn en kort genoeg dat
   niemand dink die app is dood nie. */
const HAAL_TYDGRENS = 10000

/* Wat elke stap in die vordering-byskrif heet. Kort, want dit staan langs
   "2 van 5" in 'n reël wat nie mag oorloop nie. */
const STAP_NAAM = {
  luister:   'Luister',
  woord:     'Lees die Woord',
  wallpaper: 'Vat dit saam',
  dra:       'Bid vir iemand',
  hart:      'Wat lê op jou hart',
  klaar:     '',
}

/* Die versoeke wat hierdie mens nog nie gedra het nie. Dieselfde merkies as
   die muur s'n — `prayedFor` en `reportedPrayers` — sodat 'n mens nooit twee
   keer vir dieselfde versoek tel bloot omdat hy langs 'n ander pad ingekom
   het nie. */
function leesStel(sleutel) {
  try { return new Set(JSON.parse(localStorage.getItem(sleutel) || '[]')) }
  catch { return new Set() }
}

/* ── Die merke ──
 *
 * Daar was ❤️ en 🙏 op die twee belangrikste oomblikke van die vloei. 'n
 * Emoji is die FOON se lettertipe: dit lyk anders op elke toestel, dit is
 * niemand se ontwerp nie, en op die kroon van 'n daaglikse ritueel lees dit
 * soos 'n plakker.
 *
 * Almal dieselfde dun lyn, dieselfde vierkant, en almal erf `currentColor`
 * sodat hulle op die nagskerm en op papier ewe reg lyk. */

function TekenDagbreek({ klas = 'tmg-teken tmg-teken-groot' }) {
  /* Die son wat oor die rand kom. Die vloei se hele vorm in een merk. */
  return (
    <svg className={klas} viewBox="0 0 40 40" fill="none" stroke="currentColor"
         strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
      <path d="M4 29h32" />
      <path d="M11 29a9 9 0 0 1 18 0" />
      <path d="M20 8v4M8.6 12.6l2.5 2.5M31.4 12.6l-2.5 2.5" />
    </svg>
  )
}

function TekenMens({ klas = 'tmg-teken tmg-teken-klein' }) {
  /* Vir "Iemand het gevra". Stil en neutraal — dit is 'n mens, nie 'n
     kategorie nie. */
  return (
    <svg className={klas} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="8.4" r="3.1" />
      <path d="M5.6 19.4a6.4 6.4 0 0 1 12.8 0" />
    </svg>
  )
}

function TekenHande({ klas = 'tmg-teken tmg-teken-klein' }) {
  /* Twee hande wat 'n vlam DRA. Die eerste weergawe het soos 'n beker gelyk;
     die kom uit die skermkiekie. Nou is die bak duidelik twee hande — die
     duime staan op — en die vlam sit bo-op. */
  return (
    <svg className={klas} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3.4c1.7 2 2.6 3.5 2.6 4.8a2.6 2.6 0 1 1-5.2 0c0-1.3.9-2.8 2.6-4.8Z" />
      <path d="M3.6 13.4c0 4.1 3.8 7.2 8.4 7.2s8.4-3.1 8.4-7.2" />
      <path d="M3.6 13.4v-1.9a1.7 1.7 0 0 1 3.4 0v1.6M20.4 13.4v-1.9a1.7 1.7 0 0 0-3.4 0v1.6" />
    </svg>
  )
}

function TekenBoek({ klas = 'tmg-teken tmg-teken-klein' }) {
  return (
    <svg className={klas} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 6.4C10.4 5.2 8.4 4.6 6 4.6H3.5v13H6c2.4 0 4.4.6 6 1.8 1.6-1.2 3.6-1.8 6-1.8h2.5v-13H18c-2.4 0-4.4.6-6 1.8Z" />
      <path d="M12 6.4v13" />
    </svg>
  )
}

function TekenAf({ klas = 'tmg-teken tmg-teken-klein' }) {
  return (
    <svg className={klas} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4v11M7.6 10.8 12 15.2l4.4-4.4" />
      <path d="M4.5 18.5h15" />
    </svg>
  )
}

function TekenHart({ vol = false, klas = 'tmg-teken tmg-teken-klein' }) {
  /* Geteken, nie 'n emoji. Dieselfde vorm as die HeartIcon op Luister se
     hero, sodat die twee harte soos EEN hart lyk. */
  return (
    <svg className={klas} viewBox="0 0 24 24"
         fill={vol ? 'currentColor' : 'none'} stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20.4s-7.6-4.8-7.6-10a4.4 4.4 0 0 1 7.6-3 4.4 4.4 0 0 1 7.6 3c0 5.2-7.6 10-7.6 10Z" />
    </svg>
  )
}

function TekenMense({ klas = 'tmg-teken tmg-teken-klein' }) {
  /* Twee mense — vir die maandreël, wat oor ander gaan. */
  return (
    <svg className={klas} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9.2" cy="8.6" r="2.9" />
      <path d="M3.8 19a5.4 5.4 0 0 1 10.8 0" />
      <path d="M16 6.1a2.9 2.9 0 0 1 0 5.6M17.2 14.3a5.4 5.4 0 0 1 3 4.7" />
    </svg>
  )
}

function TekenMerk({ klas = 'tmg-teken tmg-teken-klein' }) {
  return (
    <svg className={klas} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.5 12.6 9.4 17.5 19.5 6.9" />
    </svg>
  )
}

function TekenSlot({ klas = 'tmg-teken tmg-teken-groot' }) {
  /* Dieselfde son, nou heel bo. Die dag het gebreek. */
  return (
    <svg className={klas} viewBox="0 0 40 40" fill="none" stroke="currentColor"
         strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
      <circle cx="20" cy="20" r="7.5" />
      <path d="M20 4.5v3.6M20 31.9v3.6M4.5 20h3.6M31.9 20h3.6M9.1 9.1l2.6 2.6M28.3 28.3l2.6 2.6M30.9 9.1l-2.6 2.6M11.7 28.3l-2.6 2.6" />
    </svg>
  )
}

export default function TydMetGod({
  nota, onSluit, onKlaarGemaak, onDraMekaar,
  terugRef = null, reedsGegee = false,
}) {
  const dag = dagSleutel()

  const [staat, setStaat] = useState(leesStaat)
  const [i, setI]         = useState(0)

  const stappe = bouStappe(nota)
  const stap   = stappe[Math.min(i, stappe.length - 1)]
  const lyfRef = useRef(null)

  /* Elke verandering aan die staat gaan dadelik na die foon. Daar is geen
     STOOR-knoppie nie en daar moet nie een wees nie: 'n mens wat vergeet druk,
     verloor sy dag. */
  function stel(fn) {
    setStaat(vorige => {
      const nuut = fn(vorige)
      /* Die merk-funksies gee DIESELFDE voorwerp terug wanneer niks verander
         nie (merkStap doen dit by elke skerm). Dan skryf ons nie na die foon
         nie en waai ook nie 'n gebeurtenis wat die kaart op Luister laat
         herteken nie. */
      if (nuut === vorige) return vorige
      skryfStaat(nuut)
      return nuut
    })
  }

  /* Waar hy is, word onthou sodat die kaart op Luister "GAAN VOORT" kan sê. */
  useEffect(() => { stel(s => merkStap(s, i)) }, [i])   // eslint-disable-line react-hooks/exhaustive-deps

  /* Elke skerm begin bo. Sonder dit land 'n mens halfpad af op die volgende
     skerm, presies waar sy duim die vorige knoppie gelos het. */
  useEffect(() => { if (lyfRef.current) lyfRef.current.scrollTop = 0 }, [i])

  function verder() {
    setI(n => Math.min(n + 1, stappe.length - 1))
  }

  /* ── 'n Pad terug ──
   *
   * Iemand wat per ongeluk "Gaan verder" druk, moes die hele vloei toemaak en
   * weer begin. Die terug-pyl staan links in die kop en verskyn eers ná die
   * eerste skerm — op skerm 1 is die uitgang die ✕, nie 'n pyl nie.
   *
   * Nie op die KLAAR-skerm nie. Die dag is dan afgehandel en getel; om terug
   * te stap sou beteken die kwitansie kan twee keer verskyn.
   */
  const kanTerug = i > 0 && stap !== 'klaar'
  function terug() { setI(n => Math.max(0, n - 1)) }

  /* Die foon se eie terug-knoppie stap BINNE die vloei, en maak eers toe as
     'n mens by die eerste skerm is. App.jsx roep dit deur `terugRef`; gee dit
     `false` terug, pel App die hele laag af. */
  useEffect(() => {
    if (!terugRef) return
    terugRef.current = () => {
      if (!kanTerug) return false
      terug()
      return true
    }
    return () => { if (terugRef) terugRef.current = null }
  }, [terugRef, kanTerug])   // eslint-disable-line react-hooks/exhaustive-deps

  const skrif   = ontleedSkrif(nota && nota.scripture)
  const opskrif = skrif ? skrifOpskrif(nota.scripture) : ''

  /* ── Die son wat deurbreek ──
   *
   * EEN grond deur die hele vloei — houtskool — en die beweging kom uit die
   * LIG. Skerm 1 is 'n dun gloed; met elke skerm breek dit verder deur; die
   * klaar-skerm is warm. Sien die kop van TydMetGod.css.
   *
   * Die vlak kom uit die STAP se plek en nie uit sy naam nie: 'n dag sonder
   * wallpaper het vier skerms, en die lig moet steeds vol uitkom. */
  const ligVlak = Math.min(6, Math.round(1 + (i / Math.max(1, stappe.length - 1)) * 5))

  /* Die klaar-skerm tel nie in die vordering nie — die dag is dan klaar, en
     'n teller daar sou van 'n dankie 'n vorm maak. */
  const totaal = stappe.length - 1
  const wysVorder = stap !== 'klaar' && totaal > 1

  return (
    <div className="tmg" data-lig={String(ligVlak)}>
      {/* EEN grond deur die hele vloei. Die klaar-skerm het 'n tyd lank
          vandag se wallpaper agter hom gedra, en dit het NIE gewerk nie:
          Dewald se wallpapers dra groot woorde ("JOU DAAGLIKSE HOOP IS
          GEREED") en daardie letters het deur elke sluier geskyn en met die
          teks bo-op geveg. Dit was dadelik op 'n skermkiekie sigbaar.

          Nou is dit dieselfde houtskool as elke ander skerm, met die son wat
          heeltemal deurgebreek het. Dit werk met ELKE wallpaper wat hy ooit
          gaan oplaai, want daar is nie een agter nie. */}
      <div className="tmg-lig" />

      <header className="tmg-kop">
        {kanTerug ? (
          <button className="tmg-rond" onClick={terug} aria-label="Een skerm terug">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
                 strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        ) : <span className="tmg-kop-leeg" />}

        {wysVorder ? (
          <div className="tmg-vorder">
            <div className="tmg-vorder-balk">
              {stappe.slice(0, totaal).map((_, n) => (
                <span key={n} className={`tmg-vorder-seg${n <= i ? ' tmg-vorder-seg-aan' : ''}`} />
              ))}
            </div>
            <div className="tmg-vorder-teks">
              <b>{i + 1} van {totaal}</b> &middot; {STAP_NAAM[stap]}
            </div>
          </div>
        ) : <span />}

        <button className="tmg-rond" onClick={onSluit} aria-label="Maak toe">&#10005;</button>
      </header>

      <div className="tmg-lyf" ref={lyfRef}>
        <div key={stap} className="tmg-skerm-omhulsel">
        {stap === 'luister' && (
          <Luister nota={nota} staat={staat} stel={stel} verder={verder} />
        )}
        {stap === 'woord' && (
          <Woord skrif={skrif} opskrif={opskrif} teks={nota.scriptureText}
                 staat={staat} stel={stel} verder={verder} />
        )}
        {stap === 'wallpaper' && (
          <Wallpaper nota={nota} verder={verder} />
        )}
        {stap === 'dra' && (
          <Dra staat={staat} stel={stel} verder={verder} />
        )}
        {stap === 'hart' && (
          <Hart staat={staat} stel={stel} verder={verder} />
        )}
        {stap === 'klaar' && (
          <Klaar nota={nota} staat={staat} stel={stel} dag={dag} opskrif={opskrif}
                 reedsGegee={reedsGegee}
                 onSluit={onSluit} onKlaarGemaak={onKlaarGemaak}
                 onDraMekaar={onDraMekaar} />
        )}
        </div>
      </div>
    </div>
  )
}

/* ── 1 · Luister ────────────────────────────────────────────────────────── */

function Luister({ nota, staat, stel, verder }) {
  const reedsGeluister = staat.geluister === nota.id

  /* ── Die hart ──
   *
   * Dieselfde hart as die een op Luister se hero, nie 'n tweede een nie.
   * `notaLike.js` skryf `likedNotes` en `likes/<id>` en waai 'n sein; die
   * hero luister daarna en maak dadelik vol. Een aksie, een databron.
   *
   * Dit kan nie afgehaal word nie — 'n hart op 'n boodskap wat gehelp het, is
   * nie 'n skakelaar nie. Daardie besluit staan in notaLike.js. */
  const [gelike, setGelike] = useState(() => hetGelike(nota.id))
  const [tel, setTel]       = useState(() => likeTelling(nota.id))

  useEffect(() => {
    function opGelike(e) {
      const d = e && e.detail
      if (!d || d.notaId !== nota.id) return
      setGelike(true)
      setTel(t => Math.max(t, d.telling || 0))
    }
    window.addEventListener(LIKE_GEBEURTENIS, opGelike)
    return () => window.removeEventListener(LIKE_GEBEURTENIS, opGelike)
  }, [nota.id])

  function druk() {
    /* Die NUWE telling kom uit `like()` self en word absoluut gestel. Tel ons
       hier plaaslik op, tel die sein hierbo dieselfde druk 'n tweede keer en
       die hart wys 2 waar die berging 1 sê. Sien notaLike.js. */
    const nuut = likeNota(nota.id)
    if (!nuut) return
    setGelike(true)
    setTel(nuut)
  }

  return (
    <section className="tmg-skerm">
      <TekenDagbreek />
      <h1 className="tmg-titel">Begin deur te luister</h1>
      <p className="tmg-lei tmg-nag-lei">Sit vir 'n paar minute alles neer.</p>

      {/* Het hy vandag reeds bo-aan Luister gespeel, sê ons dit en vra dit nie
          weer nie. Iemand twee keer dieselfde boodskap laat speel, is die
          eerste oomblik waarop dit soos huiswerk voel. Die speler bly staan —
          hy mag dit weer wil hoor. */}
      {reedsGeluister && (
        <p className="tmg-merk"><TekenMerk /><span>Jy het vandag reeds geluister</span></p>
      )}

      <div className="tmg-speler">
        <Stemboodskap
          bron={nota.audioUrl}
          titel={nota.title}
          sleutel={`tmg_${nota.id}`}
          kop="VANDAG SE BOODSKAP"
          opSpeel={() => stel(s => merkGeluister(s, nota.id))}
        />
      </div>

      <button
        className={`tmg-hart${gelike ? ' tmg-hart-aan' : ''}`}
        onClick={druk}
        disabled={gelike}
        aria-label={gelike ? 'Jy het hierdie boodskap gelike' : 'Like hierdie boodskap'}
      >
        <TekenHart vol={gelike} />
        <span>{gelike ? 'Jy het dit gelike' : 'Hierdie het my gehelp'}</span>
        {tel > 0 && <span className="tmg-hart-tel">{tel}</span>}
      </button>

      {/* Nooit gesper nie. Val die klank om op iemand se eerste dag, kom hy
          nooit weer nie — en die res van die ritueel werk sonder klank. */}
      <button className="tmg-knop" onClick={verder}>Gaan verder</button>
    </section>
  )
}

/* ── 2 · Lees die Woord ─────────────────────────────────────────────────── */

function Woord({ skrif, opskrif, teks, staat, stel, verder }) {
  function maakOop() {
    stel(merkGelees)
    window.dispatchEvent(new CustomEvent('open-bybel', {
      detail: { boek: skrif.boek, hoofstuk: skrif.hoofstuk, vers: skrif.vers, versTot: skrif.versTot },
    }))
  }

  return (
    <section className="tmg-skerm">
      <h1 className="tmg-titel">Lees vandag self die Woord</h1>
      <p className="tmg-lei">
        Vandag se boodskap kom uit hierdie gedeelte. Neem 'n oomblik en lees dit self.
      </p>

      {/* Die VERS is die held van hierdie skerm. Dit was 18px kursief onder 'n
          opskrif van 30px — die mooiste sin op die bladsy was die kleinste
          ding daarop. Nou staan die verwysing klein bo-aan en die vers groot
          daaronder.

          Het die nota geen teksvers nie, dra die verwysing die skerm alleen
          en word sy dus groot — nooit 'n etiket bo niks nie. */}
      <div className={`tmg-skrif${teks ? '' : ' tmg-skrif-alleen'}`}>
        <div className="tmg-skrif-ref">{opskrif}</div>
        {teks && <>
          <div className="tmg-skrif-streep" />
          <p className="tmg-skrif-vers">{teks}</p>
          <div className="tmg-skrif-slot">
            <span /><TekenDagbreek klas="tmg-teken" /><span />
          </div>
        </>}
      </div>

      <button className="tmg-knop tmg-knop-met-teken" onClick={maakOop}>
        <TekenBoek />
        <span>Maak in die Bybel oop</span>
      </button>

      {/* Ná die Bybel kom 'n mens hierheen terug. Die knoppie moet dan die
          natuurlike volgende ding wees, nie 'n tweede uitnodiging nie. */}
      <button className="tmg-knop tmg-knop-stil" onClick={verder}>
        {staat.gelees ? 'Gaan verder' : 'Later — gaan verder'}
      </button>
    </section>
  )
}

/* ── 3 · Vat dit saam ───────────────────────────────────────────────────── */

function Wallpaper({ nota, verder }) {
  const [besig, setBesig] = useState(false)
  const [nota2, setNota2] = useState('')   // wat gebeur het, in woorde

  /* ── Stoor, met Luister se beproefde meganika ──
   *
   * Die eerste weergawe hiervan was naïef en sou op 'n foon gelieg het. Drie
   * dinge kom uit `deelWallpaper` in Luister.jsx en elkeen het 'n rede:
   *
   *   · 'n antwoord van die bediener is nie noodwendig 'n PRENT nie. 'n
   *     Foutbladsy kom ook met status 200 terug. Ons keur die tipe en die
   *     grootte;
   *   · `navigator.share` bestaan op baie blaaiers wat NIE lêers kan deel nie
   *     en gooi eers wanneer 'n mens dit roep. `canShare({ files })` is die
   *     enigste eerlike toets;
   *   · 'n mens wat die deelvenster toemaak, gee 'n `AbortError`. Dit is nie
   *     'n fout nie en mag nie soos een lyk nie.
   *
   * En as niks werk nie, sê ons wat hy self kan doen. 'n Knoppie wat stilweg
   * niks doen nie, is die ergste van die drie uitkomste. */
  async function stoor() {
    if (besig) return
    setBesig(true)
    setNota2('')

    let blob = null
    try {
      const r = await fetch(prentPad(nota.wallpaperUrl))
      if (r.ok) {
        const b = await r.blob()
        if (/^image\//.test(b.type) && b.size > 1024) blob = b
      }
    } catch {}

    if (blob) {
      const lêer = new File([blob], 'daaglikse-hoop.jpg', { type: blob.type })
      try {
        if (navigator.canShare && navigator.canShare({ files: [lêer] })) {
          await navigator.share({ files: [lêer] })
          setBesig(false)
          return
        }
      } catch (e) {
        if (e && e.name === 'AbortError') { setBesig(false); return }
      }
      try {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'daaglikse-hoop.jpg'
        document.body.appendChild(a)
        a.click()
        a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 4000)
        setNota2('Die prent is na jou Aflaaie toe.')
        setBesig(false)
        return
      } catch {}
    }

    setNota2('Die prent kon nie gestoor word nie. Hou jou vinger op die foto en kies "Save image".')
    setBesig(false)
  }

  return (
    <section className="tmg-skerm">
      <h1 className="tmg-titel">Vat vandag se Woord saam</h1>
      <p className="tmg-lei">Hou dit vandag waar jy dit weer sal sien.</p>

      {/* Die prent sit BINNE 'n ondeursigtige houer, en dit word nooit gesny
          nie — 'n mens moet sien wat hy op die punt is om te stoor.

          Dieselfde vorm as Luister se wallpaper-kaart. Die houer se kleur
          is die vangnet uit CLAUDE.md: word 'n teel nie betyds geverf nie,
          wys dit hierdie kleur en nie rou GPU-geheue nie. */}
      <div className="tmg-wp">
        <img src={prentPad(nota.wallpaperUrl)} alt="Vandag se wallpaper"
             loading="lazy" decoding="async" />
      </div>

      <button className="tmg-knop tmg-knop-met-teken" onClick={stoor} disabled={besig}>
        <TekenAf />
        <span>{besig ? 'Besig…' : 'Stoor op my foon'}</span>
      </button>
      {nota2 && <p className="tmg-fyn tmg-fyn-alleen">{nota2}</p>}
      <button className="tmg-knop tmg-knop-stil" onClick={verder}>Gaan verder</button>
    </section>
  )
}

/* ── 4 · Dra iemand ─────────────────────────────────────────────────────── */

/* Dit staan VOOR "wat lê op jou hart", en dit is die belangrikste besluit in
   die hele vloei.
 *
 * 'n Nuwe mens het op dag 1 nog niks om te vra nie, maar kan altyd iemand dra.
 * En só het elke mens wat op die muur plaas, eers iemand anders s'n gelees —
 * dít is wat keer dat die muur net nood word. */
function Dra({ staat, stel, verder }) {
  const [ry, setRy]       = useState(null)   // null = nog besig
  const [k, setK]         = useState(0)
  const [gebid, setGebid] = useState(false)
  const klokRef = useRef(null)

  useEffect(() => {
    let dood = false
    const gedra    = leesStel('prayedFor')
    const gerapporteer = leesStel('reportedPrayers')

    function skoon(lys) {
      return lys
        .filter(p => p && p.id && p.text && !p.reported)
        .filter(p => !gedra.has(p.id) && !gerapporteer.has(p.id))
    }

    /* Eers wat die muur reeds op hierdie foon gelaat het. Dit verf dadelik en
       kos niks. */
    let uitKas = []
    try { uitKas = skoon(JSON.parse(localStorage.getItem('cachedPrayers') || '[]')) } catch {}
    if (uitKas.length) setRy(uitKas)

    const grens = Timestamp.fromDate(new Date(Date.now() - SEWE_DAE))

    /* ── 'n Tydgrens, want `getDocs` het nie een nie ──
     *
     * Dit is die fout wat Luister twee keer stilweg gebreek het. Wanneer
     * Android die oortjie opskort, sterf die SDK se verbinding, en op 'n slegte
     * terugkeer los die belofte NIE op en verwerp dit ook nie. Sonder hierdie
     * wedloop bly `ry === null` vir altyd en die mens sit met "Een oomblik…"
     * op die skerm, sonder pad vorentoe. Sien CLAUDE.md.
     *
     * Val dit uit, wys ons wat op die foon is — dit is beter as 'n skerm wat
     * hang. */
    const haal = getDocs(query(
      collection(db, 'prayers'),
      where('createdAt', '>=', grens),
      orderBy('createdAt', 'desc'),
      limit(HAAL),
    ))
    const tyd = new Promise((_, weier) => {
      klokRef.current = setTimeout(() => weier(new Error('tydgrens')), HAAL_TYDGRENS)
    })

    Promise.race([haal, tyd])
      .then(snap => {
        if (dood) return
        const vars = skoon(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        /* Aanvaar nooit 'n antwoord wat KLEINER is as wat ons reeds het nie —
           dieselfde les as Luister se notas. Vanlyn bedien die SDK uit sy eie
           kas en dit kan 'n halwe antwoord wees. */
        setRy(vars.length >= uitKas.length ? vars : uitKas)
      })
      .catch(() => { if (!dood) setRy(uitKas) })
      .finally(() => { if (klokRef.current) clearTimeout(klokRef.current) })

    return () => { dood = true; if (klokRef.current) clearTimeout(klokRef.current) }
  }, [])

  const versoek = ry && ry[k]

  async function ekHetGebid() {
    if (!versoek || gebid) return
    setGebid(true)
    stel(merkGebid)

    /* Presies dieselfde pad as die muur se knoppie: die merkie eers (sodat 'n
       swak lyn nie dubbel tel nie), dan die eindpunt met die diensrekening —
       `prayers` is `allow update: if false` en 'n kliënt kan dit nie self
       verhoog nie. */
    const gedra = leesStel('prayedFor')
    gedra.add(versoek.id)
    try { localStorage.setItem('prayedFor', JSON.stringify([...gedra])) } catch {}

    try {
      await fetch('/api/gebed-deel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: versoek.id, toestel: toestelId() }),
      })
    } catch { /* die gebed het gebeur, ook al het die telling nie */ }
  }

  function nogIemand() {
    setGebid(false)
    setK(n => n + 1)
  }

  if (ry === null) {
    return (
      <section className="tmg-skerm">
        <h1 className="tmg-titel">Bid vandag vir iemand</h1>
        <p className="tmg-lei">Een oomblik…</p>
      </section>
    )
  }

  /* Niemand oor om te dra nie — omdat die muur stil is, of omdat hy vandag
     almal gedra het. Dit is 'n goeie ding en dit moet so klink. */
  if (!versoek) {
    return (
      <section className="tmg-skerm">
        <h1 className="tmg-titel">Bid vandag vir iemand</h1>
        <p className="tmg-lei">
          {staat.gebid > 0
            ? 'Jy het almal gedra wat vandag om gebed gevra het. Dankie.'
            : 'Niemand het die afgelope dae om gebed gevra nie. Dalk is jy vandag die een wat kan vra.'}
        </p>
        <button className="tmg-knop" onClick={verder}>Gaan verder</button>
      </section>
    )
  }

  return (
    <section className="tmg-skerm">
      <h1 className="tmg-titel">Bid vandag vir iemand</h1>
      <p className="tmg-lei">Neem 'n oomblik en bid vir iemand anders se behoefte.</p>

      <figure className="tmg-versoek">
        {/* Dit was "ANONIEME VERSOEK" — administratiewe taal bo 'n mens se
            nood. */}
        <div className="tmg-versoek-kop">
          <span className="tmg-teken-rond"><TekenMens /></span>
          <span>Iemand het gevra</span>
        </div>
        <blockquote className="tmg-versoek-teks">{versoek.text}</blockquote>
        {/* `saamSinVirOntvanger`, NIE `saamSin` nie. Die eerste sê "7 mense
            bid reeds saam"; die tweede sê "…saam met JOU" en is geskryf vir
            die mens wat gevra het. Hier lees 'n vreemdeling dit. */}
        {saamSinVirOntvanger(versoek.prayedCount) && (
          <figcaption className="tmg-versoek-saam">
            {saamSinVirOntvanger(versoek.prayedCount)}
          </figcaption>
        )}
      </figure>

      {/* Die dankie verskyn EERS ná die daad. Staan dit reeds op die skerm
          saam met die versoek, is die beloning daar voor die ding gedoen is,
          en dan is die daad niks werd nie. */}
      {!gebid ? (
        <>
          <button className="tmg-knop tmg-knop-met-teken" onClick={ekHetGebid}>
            <TekenHande />
            <span>Ek het vir hulle gebid</span>
          </button>
          {/* 'n EGTE pad verby. Sonder dit is die enigste knoppie op hierdie
              skerm "ek het gebid", en dan moet iemand wat nie wil of kan nie,
              óf lieg óf die hele vloei toemaak. Die opsomming vink net af wat
              werklik gebeur het — dus mag dit ook niks wees nie. */}
          <button className="tmg-knop tmg-knop-stil" onClick={verder}>Nie vandag nie</button>
        </>
      ) : (
        <div className="tmg-dankie">
          <TekenHande klas="tmg-teken tmg-teken-groot" />
          <p className="tmg-dankie-teks">Dankie. Jy het vandag iemand in gebed gedra.</p>
          <button className="tmg-knop" onClick={nogIemand}>Bid vir nog iemand</button>
          <button className="tmg-knop tmg-knop-stil" onClick={verder}>Gaan verder</button>
        </div>
      )}
    </section>
  )
}

/* ── 5 · Wat lê op jou hart ─────────────────────────────────────────────── */

function Hart({ staat, stel, verder }) {
  const [teks, setTeks]   = useState('')
  const [besig, setBesig] = useState(false)
  const [klaar, setKlaar] = useState(false)
  const [fout, setFout]   = useState('')
  const [krisis, setKrisis] = useState(false)

  async function deel() {
    if (besig || !teks.trim()) return
    setFout('')

    /* Dieselfde keuring as die muur s'n, in dieselfde volgorde. Die krisis-
       nommers wys ook wanneer die versoek NIE gedeel word nie — die hulp hang
       nie van 'n blokkie af nie. */
    const keuring = magDeel({ teks })
    if (keuring.rede === 'te-kort') {
      setFout('Skryf asseblief net ’n bietjie meer, sodat iemand werklik kan saambid.')
      return
    }
    if (keuring.rede === 'kontak') {
      setFout('Haal asseblief jou nommer of e-posadres uit — die muur is anoniem.')
      return
    }

    setBesig(true)
    try {
      await addDoc(collection(db, 'prayers'), {
        text: teks.trim(),
        prayedCount: 0,
        createdAt: serverTimestamp(),
        reported: false,
        deelbaar: keuring.mag,
      })
      stel(merkGetik)
      setKrisis(keuring.rede === 'krisis')
      setKlaar(true)
    } catch {
      setFout('Kon nie stuur nie. Probeer asseblief weer.')
    }
    setBesig(false)
  }

  /* Hy hou dit vir homself. Dit tel STEEDS as "hy het sy hart voor God
     gebring" — die stelsel weet nie wat hy gebid het nie en hoef nie.
     
     Maar dit merk `getik` NET as hy werklik woorde geskryf het. Die
     geldvraag word deur WOORDE gekeer, want dit is die woorde wat sê dat
     iemand swaarkry; 'n mens wat die kassie leeg los en aanstap, het niks
     oopgemaak nie. Sien merkHart/merkGetik in tydMetGod.js. */
  function privaat() {
    stel(teks.trim() ? merkGetik : merkHart)
    verder()
  }

  if (klaar) {
    return (
      <section className="tmg-skerm">
        <h1 className="tmg-titel">Jy is nie alleen nie</h1>
        <p className="tmg-lei">
          Jou versoek staan nou op die Bid Saam-muur. Iemand anders gaan vandag
          vir jou bid, net soos jy vir iemand gebid het.
        </p>
        {krisis && (
          <div className="tmg-krisis">
            <p><strong>As jy vandag in gevaar is, praat asseblief met iemand.</strong></p>
            <p>SADAG 0800 567 567 · Lifeline 0861 322 322 · Noodgeval 112</p>
          </div>
        )}
        <button className="tmg-knop" onClick={verder}>Gaan verder</button>
      </section>
    )
  }

  return (
    <section className="tmg-skerm">
      <h1 className="tmg-titel">Wat lê vandag op jou hart?</h1>
      <p className="tmg-lei">Waarvoor kan ons saam met jou bid?</p>

      <textarea
        className="tmg-kassie"
        value={teks}
        onChange={e => { setTeks(e.target.value); setFout('') }}
        placeholder="Skryf dit hier neer…"
        maxLength={500}
        rows={6}
      />
      <div className="tmg-tel">{teks.length}/500</div>
      <p className="tmg-fyn">
        <TekenMerk />
        <span>Anoniem — geen name word gestoor nie.</span>
      </p>

      {fout && <p className="tmg-fout">{fout}</p>}

      <button className="tmg-knop" onClick={deel} disabled={besig || !teks.trim()}>
        {besig ? 'Besig…' : 'Deel my gebedsversoek'}
      </button>
      {/* 'n EGTE uitgang, nie 'n skuldsin nie. Niemand moet voel hy moet iets
          publiek indien om die dag klaar te maak nie. */}
      <button className="tmg-knop tmg-knop-stil" onClick={privaat}>
        Ek hou dit vandag tussen my en God
      </button>
    </section>
  )
}

/* ── 6 · Klaar ──────────────────────────────────────────────────────────── */

function Klaar({ nota, staat, stel, dag, opskrif, reedsGegee, onSluit, onKlaarGemaak, onDraMekaar }) {
  const gemerk = useRef(false)

  useEffect(() => {
    if (gemerk.current) return
    gemerk.current = true
    stel(s => merkKlaar(s, dag))
    /* ── Die dag is GEVRA ──
     *
     * Hier was 'n fout. Die dag is net gemerk as die mens die skenk-knoppie
     * gedruk het. Wie die vraag gesien en verbygegaan het, het die
     * teruggehoue opspringer alsnog gekry sodra hy die vloei toemaak — twee
     * geldvrae op een dag, wat presies die reël is wat hierdie hele skerm
     * moet beskerm.
     *
     * Die vraag is GEVRA op die oomblik dat sy skerm wys. Of hy hom gedruk
     * het, is 'n ander ding. */
    if (onKlaarGemaak) { try { onKlaarGemaak() } catch {} }
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  const reels  = opsomming({ staat, nota, skrifOpskrif: opskrif })
  const vraag  = slotVraag({ staat, reedsGegee })
  const maandR = maandSin(staat)


  /* ── Stuur die BOODSKAP, nie die app nie ──
   *
   * Die skakel dra vandag se nota-id. Die ontvanger hoor PRESIES wat hy
   * gehoor het, dadelik, in haar blaaier — sien hoopSkakel.js en
   * HoopOntvang.jsx. Hier het 'n gewone skakel na die tuisblad gestaan, en
   * dan was die woorde daarby 'n leuen. */
  async function stuurVirIemand() {
    const skakel = hoopSkakel(nota && nota.id, window.location.origin)
    const teks   = deelBoodskap(skakel)

    /* Tel dit VOOR die deelvenster oopmaak: `navigator.share` los eers op
       wanneer die mens klaar gekies het, en op iOS kom dit soms glad nie
       terug nie. */
    try {
      fetch('/api/hoop-tel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wat: 'gedeel' }),
      }).catch(() => {})
    } catch {}

    if (navigator.share) {
      try { await navigator.share({ text: teks }) } catch {}
      return
    }
    try {
      await navigator.clipboard.writeText(teks)
      alert('Die boodskap is gekopieer. Plak dit in WhatsApp.')
    } catch { window.prompt('Kopieer hierdie boodskap:', teks) }
  }

  return (
    <section className="tmg-skerm tmg-slot">
      <TekenSlot />
      <h1 className="tmg-titel">Jy het vandag tyd met God gemaak</h1>

      {/* Eers die kwitansie, dan eers 'n vraag. 'n Eindskerm wat met 'n vraag
          begin, is 'n tolhek. Elke reël is iets wat WERKLIK gebeur het. */}
      {reels.length > 0 && (
        <ul className="tmg-lys">
          {reels.map((r, n) => (
            <li key={n}><span className="tmg-teken-rond"><TekenMerk /></span><span>{r}</span></li>
          ))}
        </ul>
      )}
      {maandR && (
        <p className="tmg-maand">
          <span className="tmg-teken-rond"><TekenMense /></span>
          <span>{maandR}</span>
        </p>
      )}
      <div className="tmg-skei"><i /></div>

      <div className="tmg-vraag">
        {vraag === 'deel' && (
          <>
            <h2 className="tmg-vraag-kop">Wie het vandag hierdie nodig?</h2>
            <p className="tmg-lei">
              Dalk is daar iemand op jou WhatsApp wat vandag ook 'n paar minute
              saam met God nodig het.
            </p>
            <button className="tmg-knop" onClick={stuurVirIemand}>
              Stuur vandag se hoop vir iemand
            </button>
          </>
        )}

        {vraag === 'dankie' && (
          <>
            <h2 className="tmg-vraag-kop">Dankie</h2>
            <p className="tmg-lei">
              Jy help reeds om Daaglikse Hoop moontlik te maak vir mense wat dit
              nie kan bekostig nie.
            </p>
            <button className="tmg-knop" onClick={stuurVirIemand}>
              Stuur vandag se hoop vir iemand
            </button>
          </>
        )}
      </div>

      {/* Dra Mekaar is 'n uitgang, nie 'n stasie nie. Iemand met niks swaars
          nie moet nie 'n skerm wegklik nie. */}
      <button className="tmg-uit" onClick={() => onDraMekaar && onDraMekaar()}>
        Is wat jy dra swaarder as een dag?<br />
        Daar is plek vir jou op <b>Dra Mekaar →</b>
      </button>

      {/* ── Die skenk-knoppies ──
       *
       * Dewald: "on the last screen, the donation button should always show
       * very small at the bottom... this is not part of the pop up donations.
       * This is not the same thing."
       *
       * Hulle staan ALTYD hier. Hulle het niks met die maandelikse
       * opspringer-stelsel te doen nie: geen venster, geen dag-merk, geen
       * hek. Twee knoppies op 'n skerm wat die bestaande skenk-vorms
       * oopmaak, meer niks.
       *
       * Klein en stil bly die punt: die deel-knoppie hierbo is die enigste
       * ding op die skerm wat soos 'n knoppie skree. */}
      <div className="tmg-steun">
        <p className="tmg-steun-lei">
          As vandag se boodskap jou gehelp het en jy my wil help om meer
          mense met hoop te bereik:
        </p>
        <div className="tmg-steun-ry">
          <button className="tmg-steun-knop"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-donation'))}>
            Eenmalige skenking
          </button>
          <button className="tmg-steun-knop"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-hoop-vennoot'))}>
            Maandelikse skenking
          </button>
        </div>
      </div>

      <button className="tmg-knop tmg-knop-stil" onClick={onSluit}>Gaan my dag binne</button>
    </section>
  )
}
