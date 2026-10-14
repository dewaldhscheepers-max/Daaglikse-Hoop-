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
import { meet } from '../data/sorgMeetStuur'
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
   * PER PLASING. Die verstek hang af van of die mens 'n PROFIEL het:
   *
   *   geen profiel → anoniem. Hy het nooit 'n naam gekies nie, en 'n naam wat
   *                  hy nie gekies het nie, mag nooit verskyn nie.
   *   wél 'n profiel → sy naam. Hy HET gekies, en dit was die hele punt van
   *                  daardie keuse.
   *
   * Dit was eers altyd anoniem, ook vir iemand met 'n profiel. Dewald het sy
   * naam en foto opgestel, 'n storie gedeel, en dit het as "Anoniem" verskyn:
   * "Dit moet die mense se name wys as hulle dit so verkies."
   *
   * Anoniem bly een druk weg, en dit staan EERSTE in die lys — wie dit nodig
   * het, sien dit voor hy iets anders sien. */
  const [profiel, setProfiel] = useState(() => myProfiel())
  const [anoniem, setAnoniem] = useState(() => !myProfiel())
  const [profielOop, setProfielOop] = useState(false)
  const [toestem, setToestem] = useState(false)
  const [hulpOop, setHulpOop] = useState(false)
  const [alleOnderwerpe, setAlleOnderwerpe] = useState(false)
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
      /* ── Hier het `naam` en `anoniem` TWEE KEER gestaan ──
       *
       * Onder die nuwe velde het die ou "ALTYD anoniem"-paar bly staan:
       * `naam: ''` en `anoniem: true`. In JavaScript wen die LAASTE sleutel in
       * 'n voorwerp-letterlik, stil-stil, sonder 'n waarskuwing. Elke storie
       * het dus anoniem gegaan — ook wanneer die kaart "Gebruik my naam" gewys
       * het en die mens sy profiel opgestel het.
       *
       * Dewald het dit drie keer gerapporteer voordat ek dit gevind het, en
       * elke keer het ek na die bediener gekyk. Die skerm het van die begin af
       * die verkeerde ding gestuur.
       *
       * Anoniem wen steeds wanneer daar GEEN profiel is nie: 'n naam wat 'n
       * mens nooit gekies het nie, mag nooit verskyn nie. */
      anoniem: anoniem || !profiel,
      naam: !anoniem && profiel ? profiel.naam : '',
      foto: !anoniem && profiel ? (profiel.foto || '') : '',
      onderwerp: onderwerp || 'ander',
      toestemmings: { openbaar: true, redigeer: true, geenWaarborg: true },
    })
    setBesig(false)

    if (d.ok) {
      /* Die laaste sport van die trechter, en die enigste een wat werklik
         tel. Sien api/tel-sorg.js. */
      telSorg('gestuur')
      meet('storieKlaar')
      setTeks('')          // uit die geheue uit; ons het dit nie meer nodig nie
      setUitslag(d)
      if (bo.current) bo.current.scrollTop = 0
      return
    }
    setFout(d.boodskap || d.fout || 'Ons kon dit nie stuur nie. Probeer asseblief weer.')
  }

  return (
    <div className="sv-oor" role="dialog" aria-label="Dra Mekaar">
      <div className="sv-kop">
        <button className="sv-terug" onClick={onSluit} aria-label="Maak toe">
          {uitslag ? 'Klaar' : 'Terug'}
        </button>
        <span className="sv-kop-titel">{uitslag ? 'Dankie' : 'Dra Mekaar'}</span>
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

            {/* ── Dra Mekaar is vir RAAD, nie vir gebedsversoeke nie ──
             *
             * Dewald, 14 Oktober 2026, met twee skermkiekies van hierdie vorm:
             * *"almal deel gebede daar... Hulle moet gebede op Bid Saam plaas
             * nie op Dra Mekaar nie."* En: *"dit moet baie korter wees."*
             *
             * "Ek luister. Jy hoef nie die regte woorde te hê nie. Vertel my net
             * wat gebeur het" het soos 'n plek gelees waar 'n mens enige nood
             * uitstort — en vir hierdie gehoor is 'n nood 'n GEBEDSVERSOEK. Die
             * woorde sê nou waarvoor die blad is: raad en bemoediging van mense
             * wat deur dieselfde gegaan het. Dit is Dewald se eie teks, woord
             * vir woord. */}
            <h2 className="sv-vraag">Dra Mekaar</h2>
            <p className="sv-fyn">
              Gaan jy deur iets moeiliks en soek jy raad of bemoediging?
            </p>
            <p className="sv-fyn">
              Deel kortliks wat gebeur. Ander wat deur iets soortgelyks gegaan
              het, kan vertel wat hulle gehelp het, en Dewald kan waar moontlik
              pastorale leiding gee.
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
                Bo die kassie, nie onder nie: 'n mens moet dit sien VOORDAT hy
                tik. Die ses paragrawe reëls wat hier gestaan het, is weg —
                Dewald: "Gebruik baie minder teks as tans." Wat oorbly, is die
                twee dinge wat 'n mens MOET weet: dit is anoniem, en moenie
                iemand anders se naam gebruik nie (die plasing gaan dadelik
                op, dus is daar niemand wat dit vooraf uithaal nie). */}
            <div className="sv-openbaar">
              <p>Jou boodskap verskyn anoniem.</p>
              <p>Moenie name of kontakbesonderhede deel nie.</p>
            </div>

            {/* ── Soek jy net gebed? ──
                Dit staan nou BO die kassie, in Dewald se volgorde. Dit het onder
                gestaan sodat dit nie 'n "afrit voor die oprit" is nie — maar die
                mense wat hier aankom, kom juis met 'n gebedsversoek, en hulle
                moet die afrit sien VOORDAT hulle begin tik. Die knoppie vat hulle
                reguit tot in Bid Saam se kassie. */}
            <button className="sv-gebed" onClick={naBidSaam}>
              <span className="sv-gebed-hoof">Soek jy net gebed?</span>
              <span className="sv-gebed-fyn">Plaas dit asseblief op Bid Saam →</span>
            </button>

            <textarea
              id="sv-teks"
              className="sv-teks"
              value={teks}
              maxLength={MAKS_LENGTE}
              /* Dewald se woorde: dit vra vir 'n situasie en 'n raadsvraag,
                 nie vir 'n versoek nie. */
              placeholder="Vertel kortliks waardeur jy gaan en waarmee jy raad nodig het…"
              onChange={e => setTeks(e.target.value)}
            />
            <div className="sv-teller">
              {teks.length > MAKS_LENGTE - 300
                ? `${MAKS_LENGTE - teks.length} karakters oor`
                : !langGenoeg && teks.length > 0
                  ? 'Skryf net \'n bietjie meer, sodat ons kan verstaan.'
                  : ' '}
            </div>


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
