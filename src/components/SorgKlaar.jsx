/* ────────────────────────────────────────────────────────────
   Wat iemand DADELIK sien nadat hy sy boodskap gestuur het.

   Hierdie skerm is die belangrikste een in Pastorale Sorg, en die maklikste
   een om te bederf. 'n Mens het pas sy swaarste ding neergetik. Wat hy nou
   kry, bepaal of hy oor 'n week nog hier is.

   Wat hy NIE kry nie: 'n koue "dankie, ons sal in aanraking wees". Dit is
   wat elke ander app doen, en dit voel soos 'n vorm wat in 'n laai verdwyn.

   Wat hy WEL kry, in hierdie volgorde:

     1. Is dit 'n krisis — die nommers, eerste, groot.
     2. Iets om NOU te kyk. 'n Video wat by sy onderwerp pas; is daar nie
        een nie, dan die breë een; is daar niks nie, dan die week se video.
        Daar is altyd iets, want `hoopVir` het 'n valpad.
     3. 'n Vers en 'n gebed. Die vers kom UIT die Bybel in die app — nooit
        uit die kode nie — en dra sy erkenning saam.
     4. Sy bestuurskode, sodat sy plasing syne bly.
     5. Eers heel onderaan: wil hy weet wanneer daar geantwoord word.

   Geen versoek om geld op hierdie skerm nie. En die vers wys hier saam met
   sy erkenning; die GAB is CC BY-NC-ND en dit is nie onderhandelbaar nie.
   ──────────────────────────────────────────────────────────── */

import { useState, useEffect } from 'react'
import { hoopVir } from '../data/sorgVideos'
import { versVir } from '../data/sorgVerse'
import { gabVers, GAB_ERKENNING } from '../data/gab'
import { onderwerpNaam } from '../data/sorgOnderwerpe'
import { subscribeToNotifications } from '../firebase'
import SorgVideo from './SorgVideo'
import SorgNommers from './SorgNommers'

export default function SorgKlaar({ uitslag, videoData, onSluit }) {
  const [versTeks, setVersTeks] = useState(null)
  const [kopieer, setKopieer] = useState(false)
  const [kennis, setKennis] = useState('vra')   // vra · besig · aan · af

  const onderwerp = uitslag.onderwerp || 'ander'
  const keuse = versVir(onderwerp)
  const hoop = videoData ? hoopVir(onderwerp, videoData) : null

  useEffect(() => {
    let lewendig = true
    const v = keuse.verwysing
    gabVers(v.kode, v.hoofstuk, v.vers).then(t => { if (lewendig) setVersTeks(t) })
    return () => { lewendig = false }
  }, [onderwerp])

  async function kopieerKode() {
    try {
      await navigator.clipboard.writeText(uitslag.kode)
      setKopieer(true)
      setTimeout(() => setKopieer(false), 2000)
    } catch { /* dan lees hy dit net van die skerm af */ }
  }

  async function vraKennis() {
    setKennis('besig')
    try {
      const r = await subscribeToNotifications()
      setKennis(r && r.ok ? 'aan' : 'af')
    } catch {
      setKennis('af')
    }
  }

  return (
    <div className="sv-blok">

      {uitslag.krisis && (
        <div className="sv-krisis">
          <p className="sv-krisis-kop">Ons het jou boodskap, en ons het dit gelees.</p>
          <p className="sv-krisis-teks">
            Bel asseblief nou een van hierdie nommers. Hulle is gratis, hulle
            antwoord, en hulle is vinniger as ons.
          </p>
          <SorgNommers />
        </div>
      )}

      <h2 className="sv-klaar-kop">Ons het dit.</h2>
      <p className="sv-klaar-teks">
        Dewald lees elke boodskap self. Dit is nie 'n masjien wat dit sorteer
        nie. Jy hoef niks verder te doen nie.
      </p>

      {/* ── Iets om NOU te kyk ── */}
      {hoop && hoop.video && (
        <>
          <p className="sv-klaar-rede">
            {hoop.rede
              ? `Iets wat dalk nou kan help — ${hoop.rede.toLowerCase()}`
              : 'Iets wat dalk nou kan help'}
          </p>
          <SorgVideo video={hoop.video} />
        </>
      )}

      {/* ── Die vers en die gebed ── */}
      <div className="sv-vers-blok">
        {versTeks && (
          <>
            <p className="sv-vers">{versTeks}</p>
            <p className="sv-vers-bron">
              {keuse.verwysing.wys} · {GAB_ERKENNING.naam} (konsep)
            </p>
          </>
        )}
        <p className="sv-gebed">{keuse.gebed}</p>
      </div>

      {/* ── Sy kode ── */}
      <div className="sv-kode-blok">
        <p className="sv-kode-kop">Jou private kode</p>
        <p className="sv-kode">{uitslag.kode}</p>
        <p className="sv-fyn">
          Hou dit. Daarmee kan jy jou eie boodskap later terugkry, laat
          versteek of heeltemal laat verwyder — ook al het jy anoniem
          geskryf. Ons het dit ook op hierdie foon gestoor.
        </p>
        <button className="sv-klein-knop" onClick={kopieerKode}>
          {kopieer ? 'Gekopieer' : 'Kopieer die kode'}
        </button>
      </div>

      {/* ── Laat weet my ──
          Heel onder, en met die waarheid by: die boodskap self kom nooit in
          'n kennisgewing nie. Iemand anders kan die foon optel. */}
      {kennis === 'vra' && (
        <button className="sv-klein-knop sv-vol" onClick={vraKennis}>
          Laat weet my wanneer daar geantwoord word
        </button>
      )}
      {kennis === 'besig' && <p className="sv-fyn sv-fyn-mid">Besig…</p>}
      {kennis === 'aan' && (
        <p className="sv-fyn sv-fyn-mid">
          Ons laat weet jou. Die kennisgewing dra nooit jou woorde nie — net
          dat daar iets vir jou is.
        </p>
      )}
      {kennis === 'af' && (
        <p className="sv-fyn sv-fyn-mid">
          Geen kennisgewings nie — dit is heeltemal reg. Kom net weer kyk
          wanneer jy wil.
        </p>
      )}

      <p className="sv-klaar-onderwerp">
        {onderwerpNaam(onderwerp) && `Gemerk: ${onderwerpNaam(onderwerp)}`}
      </p>

      <button className="sv-groot-knop" onClick={onSluit}>Terug na Pastorale Sorg</button>
    </div>
  )
}
