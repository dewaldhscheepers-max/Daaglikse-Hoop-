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
import { stuurBoodskap } from '../data/sorgStuur'
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
    /* Het hy al iets getik, vra ons eers. Die knoppie staan bo die kassie,
       dus druk die meeste mense dit voordat hulle tik — maar wie 'n paar
       honderd woorde neergesit het en dit dan per ongeluk druk, verloor
       alles sonder 'n woord. Dit is nie 'n plek waar 'n mens iemand se
       woorde mag weggooi nie. */
    if (teks.trim().length >= 40 &&
        !window.confirm('Jy het al iets getik. Gaan jy na Bid Saam toe, gaan hierdie woorde verlore.\n\nWil jy voortgaan?')) {
      return
    }
    try { sessionStorage.setItem('bidsaam_fokus', 'versoek') } catch { /* privaat modus */ }
    onSluit()
    window.dispatchEvent(new CustomEvent('bidnou-navigate', { detail: 'bidsaam' }))
  }

  async function stuur() {
    if (magStuur === false) return
    setBesig(true)
    setFout('')
    const d = await stuurBoodskap({
      teks,
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

                Bo die kassie, nie onder nie, en nie in fyn druk nie.

                Hierdie blok het gegroei omdat die hoofblad se lang
                verduideliking hierheen geskuif is. Dit hoort hier: 'n
                uitnodiging hoort waar iemand besluit OF hy wil, 'n kontrak
                hoort op die oomblik van verbintenis.

                Dit is ook sterker so. Toe die reels bo op die blad gestaan
                het, het iemand wat via 'n kennisgewing of 'n gedeelde skakel
                reguit hierheen kom, hulle NOOIT gesien nie. Nou sien elkeen
                wat stuur, hulle. */}
            <div className="sv-openbaar">
              <p className="sv-openbaar-kop">Voor jy jou boodskap deel</p>
              <p>
                Jou boodskap sal, nadat dit nagegaan is, <b>anoniem en openbaar
                op die Pastorale Sorg-muur</b> verskyn, sodat ander wat deur
                dieselfde dinge gaan ook daaruit kan leer.
              </p>
              <p>
                Jou naam wys nooit. Moenie name, kontakbesonderhede of
                inligting deel wat iemand kan identifiseer nie.
              </p>
              <p>
                Dewald kan jou boodskap verkort of liggies aanpas om jou en
                ander mense se privaatheid te beskerm.
              </p>
              {/* Dit is 'n TOESTEMMINGSITEM, nie 'n kenmerk nie. Iemand wat sy
                  hart uitstort en dan vreemdelinge onder sy storie sien skryf,
                  skrik — en dit is presies die verrassing wat 'n mens op
                  hierdie blad nie wil he nie. */}
              <p>
                Ander wat op die muur lees, kan met 'n kort woord van
                ondersteuning saam met jou staan. Niemand gee raad nie en
                niemand kan jou antwoord nie — dit is net mense wat laat weet
                hulle dra dit saam.
              </p>
              <p>
                Hierdie afdeling is vir pastorale begeleiding — nie vir
                geldelike of materiële hulpversoeke nie.
              </p>
            </div>

            {/* ── Soek jy net gebed? ──

                Van die eerste boodskappe was gebedsversoeke: "bid asb vir
                ons", "ek vra gebed vir genesing". Dit is nie verkeerd nie —
                dit is net op die verkeerde blad. Daar is niks om te ANTWOORD
                nie, en die mens wag dan vir 'n antwoord wat nooit kom nie.

                Bid Saam bestaan presies daarvoor, en dit is vinniger: sy
                versoek is dadelik daar en ander bid dadelik saam. Hierdie
                knoppie vat hom reguit tot in die kassie — nie net na die
                blad toe nie. Iemand wat op 'n blad afgelaai word en self
                moet soek, doen dit nie. */}
            <button className="sv-gebed" onClick={naBidSaam}>
              <span className="sv-gebed-hoof">Soek jy net gebed?</span>
              <span className="sv-gebed-fyn">
                Plaas dit op Bid Saam — dan bid ander dadelik saam met jou →
              </span>
            </button>

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

            {/* ── Een blokkie ── */}
            <label className="sv-blok-merk">
              <input type="checkbox" checked={toestem} onChange={() => setToestem(t => !t)} />
              <span>
                Ek verstaan dat my boodskap ná goedkeuring openbaar op die
                Pastorale Sorg-muur geplaas word en dat dit verkort of aangepas
                mag word om mense se privaatheid te beskerm.
              </span>
            </label>

            {fout && <p className="sv-fout">{fout}</p>}

            <button className="sv-groot-knop sv-stuur" disabled={!magStuur} onClick={stuur}>
              {besig ? 'Besig om te stuur…' : 'Deel my boodskap'}
            </button>

            <p className="sv-onder-fyn">
              Elke boodskap word eers nagegaan. Dewald antwoord gereeld, maar
              'n persoonlike antwoord kan nie gewaarborg word nie.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
