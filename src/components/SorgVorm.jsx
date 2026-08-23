/* ────────────────────────────────────────────────────────────
   "Deel jou storie of vraag" — die vorm.

   Dit was een keer 'n vyf-skerm-proses met 'n aparte gevaarvraag, drie
   toestemmings, 'n private kode en 'n bevestigingsblad so lank soos 'n
   kontrak. Dewald het dit reguit gestel: net om 'n boodskap te tik was 'n
   moerse proses.

   Nou is dit EEN bladsy en ongeveer dertig sekondes:

     tik → (onderwerp, as jy wil) → een blokkie → stuur

   Wat opsetlik WEG is, en hoekom:

   · Die aparte gevaarskerm. Dit het elke mens deur 'n nooddeur laat loop om
     by 'n teksblok te kom. Nou is dit 'n klein balk bo-aan, altyd daar, en
     die krisisband verskyn vanself as die woorde tref.
   · Die private kode. Niemand wil 'n kode verstaan, kopieer en bêre nie.
     Die bediener hou hom steeds — dit is hoe 'n plasing aan 'n toestel
     gekoppel bly — maar die mens sien hom nooit.
   · Twee van die drie toestemmings. Een blokkie sê alles wat gesê moet word.
   · Die keuse tussen anoniem en 'n voornaam. Die kaart op die Sorg-blad sê
     twee keer dat dit anoniem is; 'n vorm wat dan tog 'n naam vra, maak van
     daardie belofte 'n leuen. Dit is nou altyd anoniem, van die skerm af tot
     in die databasis.

   En die belangrikste verandering is nie 'n verwydering nie: dit staan nou
   BO die tekskassie dat die boodskap OPENBAAR gaan wees. Niemand mag later
   dink dit was 'n privaat briefie aan Dewald nie.

   Geen transform of opacity op :active nie — net kleur. Sien CLAUDE.md.
   ──────────────────────────────────────────────────────────── */

import { useState, useEffect, useRef } from 'react'
import { ONDERWERPE } from '../data/sorgOnderwerpe'
import { krisisTreffers } from '../data/sorgKrisis'
import { voorletters } from '../data/sorgProfiel'
import { myProfiel } from '../data/sorgProfielBerging'
import SorgProfiel from './SorgProfiel'
import { stuurBoodskap } from '../data/sorgStuur'
import { telSorg } from '../data/telSorg'
import SorgNommers from './SorgNommers'
import SorgKlaar from './SorgKlaar'
import './SorgVorm.css'

const MIN_LENGTE = 15
/* Dieselfde getal as die bediener s'n. Loop hulle uitmekaar, kap die een
   af wat die ander toelaat — dit is presies hoe die muur 'n vrou se
   boodskap by 1188 karakters laat ophou het. */
const MAKS_LENGTE = 4000

/* Hoeveel onderwerpe dadelik wys.

   Daar is twee-en-twintig sodat die eerste keuse reeds die regte een kan
   wees — niemand gaan dit agterna regmaak nie. Maar almal saam is 'n blok
   van sowat 680px reg bo die toestemming en die stuurknoppie, en die veld
   is OPSIONEEL. Die eerste tien dek die meeste; die res is een druk weg. */
const WYS_EERS = 10

export default function SorgVorm({ oop, onSluit, videoData }) {
  const [teks, setTeks] = useState('')
  const [onderwerp, setOnderwerp] = useState('')
  /* ── Hoe wil jy verskyn? ──
   *
   * Dewald: "Wanneer iemand 'n storie plaas, moet hulle duidelik kies:
   * Gebruik my naam en foto · Plaas anoniem... Die anonimiteitskeuse geld
   * per plasing."
   *
   * PER PLASING, en die verstek is ANONIEM. Dieselfde vrou kan haar naam by
   * 'n gebed sit en anoniem oor haar huwelik skryf, en sy moet nooit per
   * ongeluk die verkeerde een kry nie. Die veilige kant is die verstek. */
  const [anoniem, setAnoniem] = useState(true)
  const [profiel, setProfiel] = useState(() => myProfiel())
  const [profielOop, setProfielOop] = useState(false)
  const [toestem, setToestem] = useState(false)
  const [hulpOop, setHulpOop] = useState(false)
  const [alleOnderwerpe, setAlleOnderwerpe] = useState(false)
  const [reelsOop, setReelsOop] = useState(false)
  const [besig, setBesig] = useState(false)
  const [fout, setFout] = useState('')
  const [uitslag, setUitslag] = useState(null)
  const bo = useRef(null)

  /* Elke keer wat die vorm oopmaak, begin dit skoon. Niks van die vorige
     mens se boodskap mag oorbly nie — in baie huise is die foon gedeel. */
  useEffect(() => {
    if (!oop) return
    setTeks('')
    setOnderwerp('')
    setAlleOnderwerpe(false)
    setReelsOop(false)
    setToestem(false)
    setHulpOop(false)
    setBesig(false)
    setFout('')
    setUitslag(null)
    if (bo.current) bo.current.scrollTop = 0
  }, [oop])

  if (!oop) return null

  const treffers = krisisTreffers(teks)
  const langGenoeg = teks.trim().length >= MIN_LENGTE
  const magStuur = langGenoeg && toestem && !besig

  /* Vat hom na Bid Saam toe, tot IN die kassie.

     `bidsaam_fokus` is dieselfde vlag wat Bid Saam self al lees — hy rol na
     die versoek-kaart en sit die wyser in die teksblok. Ons maak die vorm
     toe voordat ons navigeer, anders bly hy oor die blad staan. */
  function naBidSaam() {
    /* Het hy al iets getik, vra ons eers. Die knoppie staan nou ONDER die
       kassie, dus is dit nog waarskynliker dat daar reeds woorde is wanneer
       iemand dit druk. Wie 'n paar honderd woorde neergesit het en dit dan
       per ongeluk druk, verloor alles sonder 'n woord, en dit is nie 'n plek
       waar 'n mens iemand se woorde mag weggooi nie. */
    /* ── Sy woorde gaan SAAM ──
     *
     * Dewald: "Indien die persoon reeds teks ingetik het, dra die teks waar
     * moontlik na Bid Saam se gebedsversoekveld oor."
     *
     * Hier het 'n waarskuwing gestaan wat gesê het die woorde gaan verlore,
     * en dan moes 'n mens kies tussen sy woorde en die regte plek. Dit is 'n
     * keuse wat niemand moet maak nie: die kassie aan die ander kant is
     * dieselfde soort kassie.
     *
     * Bid Saam se veld vat 500 karakters. Wat langer is, word afgekap — die
     * res sou in elk geval nie ingaan nie. */
    try {
      const dra = teks.trim().slice(0, 500)
      if (dra) sessionStorage.setItem('bidsaam_teks', dra)
      sessionStorage.setItem('bidsaam_fokus', 'versoek')
    } catch { /* privaat modus */ }
    onSluit()
    window.dispatchEvent(new CustomEvent('bidnou-navigate', { detail: 'bidsaam' }))
  }

  async function stuur() {
    if (magStuur === false) return
    setBesig(true)
    setFout('')
    const d = await stuurBoodskap({
      teks,
      /* Anoniem wen altyd: sonder 'n profiel gaan daar niks saam nie, ook al
         het iemand op "gebruik my naam" gedruk. */
      anoniem: anoniem || !profiel,
      naam: !anoniem && profiel ? profiel.naam : '',
      foto: !anoniem && profiel ? (profiel.foto || '') : '',
      onderwerp: onderwerp || 'ander',
      /* ALTYD anoniem. Die kaart se dit twee keer, en 'n vorm wat dan
         "Gebruik my voornaam" aanbied, maak van daardie belofte 'n leuen.
         Die bediener stoor in elk geval geen naam meer nie. */
      naam: '',
      anoniem: true,
      toestemmings: { openbaar: true, redigeer: true, geenWaarborg: true },
    })
    setBesig(false)

    if (d.ok) {
      /* Die laaste sport van die trechter, en die enigste een wat werklik
         tel. Sien api/tel-sorg.js. */
      telSorg('gestuur')
      setTeks('')          // uit die geheue uit; ons het dit nie meer nodig nie
      setUitslag(d)
      if (bo.current) bo.current.scrollTop = 0
      return
    }
    setFout(d.boodskap || d.fout || 'Ons kon dit nie stuur nie. Probeer asseblief weer.')
  }

  return (
    <div className="sv-oor" role="dialog" aria-label="Deel jou storie of vraag">
      <div className="sv-kop">
        <button className="sv-terug" onClick={onSluit} aria-label="Maak toe">
          {uitslag ? 'Klaar' : 'Terug'}
        </button>
        <span className="sv-kop-titel">{uitslag ? 'Dankie' : 'Ek luister'}</span>
      </div>

      <div className="sv-rol" ref={bo}>
        {uitslag ? (
          <SorgKlaar uitslag={uitslag} videoData={videoData} onSluit={onSluit} />
        ) : (
          <div className="sv-blok">

            {/* ── Die noodbalk ──
                Klein, altyd daar, en dit dwing niemand deur 'n skerm nie. */}
            <button className="sv-nood" onClick={() => setHulpOop(o => !o)}>
              Is jy of iemand anders nou in onmiddellike gevaar?
              <b>Kry hulp nou</b>
            </button>
            {hulpOop && (
              <div className="sv-nood-oop">
                <SorgNommers wys="alles" />
              </div>
            )}

            <h2 className="sv-vraag">Ek luister.</h2>
            <p className="sv-fyn">
              Jy hoef nie die regte woorde te hê nie. Vertel my net wat gebeur
              het, hoe jy voel en waarmee jy hulp nodig het.
            </p>

            {/* ── Die krisisband ──
                Dit keer niks. Dit sê net: moenie hier wag nie. */}
            {treffers.length > 0 && (
              <div className="sv-krisis">
                <p className="sv-krisis-kop">Wat jy tik, klink dringend.</p>
                <p className="sv-krisis-teks">
                  Moenie vir 'n antwoord hier wag nie. Jou boodskap gaan deur —
                  moet dit asseblief nie uitvee nie — maar bel asseblief nou.
                </p>
                <SorgNommers wys="dringend" />
              </div>
            )}

            {/* ── Dit gaan openbaar wees ──

                Bo die kassie, nie onder nie, en nie in fyn druk nie. 'n
                Uitnodiging hoort waar iemand besluit OF hy wil; 'n kontrak
                hoort op die oomblik van verbintenis, en dit is hier. Iemand
                wat via 'n kennisgewing of 'n gedeelde skakel reguit hierheen
                kom, sien niks anders nie — hy moet dit HIER sien.

                ── Waarom dit ingevou is ──

                Dit was ses paragrawe, en dit was die eerste ding tussen "Ek
                luister" en die kassie. Iemand wat gekom het om sy swaarste
                ding te tik, het eers 'n muur van reels gekry. Elke woord was
                waar en nie een was oorbodig nie — maar 'n mens LEES nie ses
                paragrawe reels nie, hy sien 'n muur en gaan terug.

                Die twee dinge wat 'n mens MOET weet voordat hy tik, staan nou
                oop: dit word openbaar, en moenie name gebruik nie. Die res is
                een druk weg en dit bly volledig — niks is weggegooi nie. */}
            <div className="sv-openbaar">
              <p className="sv-openbaar-kop">Voor jy jou boodskap deel</p>
              {/* Dit het gesê "nadat dit nagegaan is". 'n Plasing gaan nou
                  DADELIK op (sien api/sorg-stuur.mjs), en 'n vorm wat oor sy
                  eie moderasie lieg, is die ergste plek om te lieg — 'n mens
                  gee juis hier toestemming. */}
              <p>
                Jou boodskap verskyn <b>dadelik en anoniem op die Sorg &amp;
                Ondersteuning-muur</b>, sodat die gemeenskap saam met jou kan
                dra en ander wat deur dieselfde dinge gaan, daaruit kan leer.
              </p>
              <p>
                Jou naam wys nooit. Moenie name, kontakbesonderhede of
                inligting deel wat iemand kan identifiseer nie.
              </p>
              {reelsOop ? (
                <>
                  <p>
                    Dewald lees gereeld saam en gee waar hy kan pastorale
                    begeleiding. Hy kan jou boodskap ook verkort of liggies
                    aanpas om jou en ander mense se privaatheid te beskerm.
                  </p>
                  {/* Dit is 'n TOESTEMMINGSITEM, nie 'n kenmerk nie. Iemand wat
                      sy hart uitstort en dan vreemdelinge onder sy storie sien
                      skryf, skrik — en dit is presies die verrassing wat 'n mens
                      op hierdie blad nie wil he nie. */}
                  {/* Ook 'n leuen geword: mense KAN nou skryf. Dewald: "hoe de
                      fok moet hulle mekaar bemoedig as hul nie kan komment
                      nie." */}
                  <p>
                    Ander wat op die muur lees, kan saam met jou staan en jou
                    bemoedig — met 'n kort woord, hul eie ervaring, of iets wat
                    hulle gehelp het. Enigiets wat nie hier hoort nie, kan
                    gerapporteer word.
                  </p>
                  <p>
                    Hierdie afdeling is vir pastorale begeleiding — nie vir
                    geldelike of materiële hulpversoeke nie.
                  </p>
                </>
              ) : (
                <button className="sv-openbaar-meer" onClick={() => setReelsOop(true)}>
                  Lees die res van die reels
                </button>
              )}
            </div>

            <textarea
              id="sv-teks"
              className="sv-teks"
              value={teks}
              maxLength={MAKS_LENGTE}
              placeholder="Tik jou vraag of vertel jou storie hier…"
              onChange={e => setTeks(e.target.value)}
            />
            <div className="sv-teller">
              {teks.length > MAKS_LENGTE - 300
                ? `${MAKS_LENGTE - teks.length} karakters oor`
                : !langGenoeg && teks.length > 0
                  ? 'Skryf net \'n bietjie meer, sodat ons kan verstaan.'
                  : ' '}
            </div>

            {/* ── Soek jy net gebed? ──

                Van die eerste boodskappe was gebedsversoeke: "bid asb vir
                ons", "ek vra gebed vir genesing". Dit is nie verkeerd nie —
                dit is net op die verkeerde blad. Daar is niks om te ANTWOORD
                nie, en die mens wag dan vir 'n antwoord wat nooit kom nie.

                Bid Saam bestaan presies daarvoor, en dit is vinniger: sy
                versoek is dadelik daar en ander bid dadelik saam. Hierdie
                knoppie vat hom reguit tot in die kassie — nie net na die
                blad toe nie.

                Dit het BO die kassie gestaan, en dit was verkeerd: dit is
                'n afrit wat voor die oprit staan. Die eerste ding wat 'n
                mens sien wanneer hy kom skryf het, was 'n makliker uitweg.
                Nou staan dit onder die kassie, waar dit help vir wie dit
                nodig het en niemand anders keer nie. */}
            <button className="sv-gebed" onClick={naBidSaam}>
              <span className="sv-gebed-hoof">Soek jy net gebed?</span>
              <span className="sv-gebed-fyn">
                Plaas dit op Bid Saam — dan bid ander dadelik saam met jou →
              </span>
            </button>

            <label className="sv-etiket">Waaroor gaan dit? <span>Opsioneel</span></label>
            <div className="sv-onderwerpe">
              {(alleOnderwerpe ? ONDERWERPE : ONDERWERPE.slice(0, WYS_EERS)).map(o => (
                <button
                  key={o.sleutel}
                  className={`sv-onderwerp${onderwerp === o.sleutel ? ' gekies' : ''}`}
                  onClick={() => setOnderwerp(onderwerp === o.sleutel ? '' : o.sleutel)}
                >
                  {o.naam}
                </button>
              ))}
              {!alleOnderwerpe && (
                <button className="sv-meer-onderwerpe" onClick={() => setAlleOnderwerpe(true)}>
                  Nog {ONDERWERPE.length - WYS_EERS} onderwerpe
                </button>
              )}
            </div>

            {/* ── Hoe wil jy verskyn? ──
             *
             * Dewald: "Jy beheer of mense jou naam en foto sien. Hierdie
             * keuse geld net vir hierdie plasing."
             *
             * Twee keuses, en ANONIEM is die verstek — dit is die veilige
             * kant om op te fouteer. Iemand wat per ongeluk sy naam by 'n
             * storie oor sy huwelik kry, kan dit nie ongedaan maak nie. */}
            <label className="sv-etiket">Hoe wil jy verskyn?</label>
            <div className="sv-wie">
              <button
                className={`sv-wie-kaart${anoniem ? ' gekies' : ''}`}
                onClick={() => setAnoniem(true)}
              >
                <span className="sv-wie-kring" aria-hidden="true">·</span>
                <span className="sv-wie-teks">
                  <b>Plaas anoniem</b>
                  <span>Geen naam of foto word gewys nie</span>
                </span>
              </button>

              <button
                className={`sv-wie-kaart${!anoniem ? ' gekies' : ''}`}
                onClick={() => {
                  /* Sonder 'n profiel kan hierdie keuse niks doen nie, dus
                     maak dit die opstel-blokkie oop in plaas van om 'n
                     knoppie te wees wat niks doen nie. */
                  if (!profiel) { setProfielOop(true); return }
                  setAnoniem(false)
                }}
              >
                <span className="sv-wie-kring" aria-hidden="true">
                  {profiel && profiel.foto
                    ? <img src={profiel.foto} alt="" width="34" height="34" />
                    : (profiel ? voorletters(profiel.naam) : '+')}
                </span>
                <span className="sv-wie-teks">
                  <b>Gebruik my naam</b>
                  <span>
                    {profiel
                      ? `${profiel.naam}${profiel.foto ? ' · wys my profielfoto' : ' · wys my voorletters'}`
                      : 'Kies ’n vertoonnaam en foto'}
                  </span>
                </span>
              </button>
            </div>

            {profielOop && (
              <div className="sv-profiel-blok">
                <SorgProfiel
                  profiel={profiel}
                  kop="Kies hoe jy verskyn"
                  fyn="Jou naam en foto bly dieselfde in elke gesprek. Jy kan dit later verander."
                  onKlaar={p => { setProfiel(p); setAnoniem(false); setProfielOop(false) }}
                  onSluit={() => { setProfielOop(false); setAnoniem(true) }}
                />
              </div>
            )}

            {/* ── Een blokkie ── */}
            <label className="sv-blok-merk">
              <input type="checkbox" checked={toestem} onChange={() => setToestem(t => !t)} />
              <span>
                {/* Dit het ALTYD "anoniem" gesê. Noudat 'n mens sy naam kan
                    kies, sou daardie woord 'n leuen wees op presies die
                    plasing waar dit die duurste is. */}
                Ek verstaan dat my boodskap {anoniem ? 'anoniem ' : ''}
                openbaar op Sorg geplaas word, dat ander daarop kan reageer, en
                dat dit verkort of aangepas mag word om mense se privaatheid te
                beskerm.
              </span>
            </label>

            {fout && <p className="sv-fout">{fout}</p>}

            <button className="sv-groot-knop sv-stuur" disabled={!magStuur} onClick={stuur}>
              {besig ? 'Besig om te stuur…' : 'Deel my boodskap'}
            </button>

            <p className="sv-onder-fyn">
              Die gemeenskap dra saam. Dewald lees gereeld saam en antwoord
              hier en daar, maar 'n persoonlike antwoord kan nie gewaarborg
              word nie.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
