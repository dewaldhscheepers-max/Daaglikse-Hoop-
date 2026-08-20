/* ── Groep-eerste onboarding, en die groep se eie skerms ──
 *
 * Dewald se §11: "Die eerste onboarding wys nie twee ewe groot koue knoppies
 * nie." Dissipelskap is bedoel om saam met mense geleef te word, en die skerm
 * sê dit — maar solo bly VOLLEDIG beskikbaar, en wie solo kies, word nie elke
 * week weer gevra nie (§13).
 *
 * ── Wat hier NIE gebeur nie ──
 *
 * Niemand se persoonlike vordering of private antwoorde word ooit geraak nie.
 * Hulle lê in localStorage op die foon; 'n groep is iets wat BYKOM.
 */
import { useState, useEffect } from 'react'
import {
  skepGroep, kykGroep, sluitAan, verlaatGroep, stelChat,
} from '../data/volgJesusGroepApi'
import { keurGroepkode, uitnodiging, nooiNudge } from '../data/volgJesusGroep'
import { haalLede } from '../data/volgJesusChat'
import { weekSessie } from '../data/volgJesusDae'
import './VolgJesusGroep.css'

const deel = async teks => {
  try {
    if (navigator.share) { await navigator.share({ text: teks }); return 'gedeel' }
  } catch { return '' }
  try { await navigator.clipboard.writeText(teks); return 'gekopieer' } catch { return '' }
}

/* ── Die keuse: saam of alleen ─────────────────────────────────────── */
export function GroepOfSolo({ opSaam, opSolo }) {
  return (
    <div className="vg">
      <div className="vg-kop">
        <div className="vg-merk">VOLG JESUS</div>
        <h1>Jy kan dit alleen doen.</h1>
        <p className="vg-groot">Maar ons beveel aan dat jy dit saam met mense doen.</p>
      </div>

      <div className="vg-kaart">
        <p>
          VOLG JESUS help jou persoonlik groei, maar dit is ook gebou sodat mense
          saam kan lees, vrae vra, bid, praat en leer om Jesus in hulle werklike
          lewe te volg.
        </p>
        <div className="vg-kop2">WANNEER JY DIT SAAM DOEN, KRY JY</div>
        <ul className="vg-lys">
          <li>jou eie groep</li>
          <li>’n private groepchat</li>
          <li>mense wat saam kan bid</li>
          <li>’n weeklikse groepsgesprek</li>
          <li>’n fasiliteerder wat die gesprek help lei</li>
        </ul>
      </div>

      <button className="vg-hoof" onClick={opSaam}>EK WIL DIT SAAM DOEN</button>
      <button className="vg-stil" onClick={opSolo}>Ek wil eerder alleen begin</button>
      <p className="vg-fyn">
        Jy kan later by ’n groep aansluit sonder om jou vordering te verloor.
      </p>
    </div>
  )
}

/* ── Kom ons kry jou by mense ───────────────────────────────────────── */
export function KryJouByMense({ opKode, opSkep, opPastoor, opSolo }) {
  return (
    <div className="vg">
      <div className="vg-kop">
        <h1>Kom ons kry jou by mense</h1>
      </div>
      <button className="vg-hoof" onClick={opKode}>EK HET REEDS ’N GROEPKODE</button>
      <button className="vg-tweede" onClick={opSkep}>EK WIL ’N GROEP BEGIN</button>
      <button className="vg-tweede" onClick={opPastoor}>EK WIL MY PASTOOR / KERKLEIER NOOI</button>
      <button className="vg-stil" onClick={opSolo}>Ek wil tog alleen begin</button>
    </div>
  )
}

/* ── Die sagte nudge voor iemand alleen begin (§13) ─────────────────── */
export function VoorJyAlleenBegin({ opGroep, opPastoor, opVoort }) {
  return (
    <div className="vg">
      <div className="vg-kop">
        <h1>Voordat jy alleen begin…</h1>
      </div>
      <div className="vg-kaart">
        <p>
          Jy hoef nie ’n bestaande Bybelstudiegroep te hê nie. Selfs twee of drie
          mense kan saam begin.
        </p>
        <div className="vg-kop2">DINK AAN</div>
        <ul className="vg-lys">
          <li>jou man of vrou</li>
          <li>’n vriend</li>
          <li>’n familielid</li>
          <li>’n kollega</li>
          <li>iemand uit jou gemeente</li>
        </ul>
      </div>
      <button className="vg-hoof" onClick={opGroep}>HELP MY OM ’N GROEP TE BEGIN</button>
      <button className="vg-tweede" onClick={opPastoor}>NOOI MY PASTOOR / KERKLEIER</button>
      <button className="vg-stil" onClick={opVoort}>Gaan voort alleen</button>
    </div>
  )
}

/* ── Sluit aan met 'n kode ──────────────────────────────────────────── */
export function SluitAan({ beginKode = '', opKlaar, opTerug }) {
  const [kode, setKode]   = useState(beginKode)
  const [naam, setNaam]   = useState('')
  const [groep, setGroep] = useState(null)
  const [besig, setBesig] = useState(false)
  const [fout, setFout]   = useState('')

  async function soek() {
    setBesig(true); setFout('')
    /* Stuur die kode SKOON. Die bediener normaliseer ook, maar 'n versoek met
       'n spasie in werk net omdat iemand anders dit opruim — en dan hang die
       hele ding aan 'n gewoonte in plaas van 'n reël. */
    const r = await kykGroep(keurGroepkode(kode))
    setBesig(false)
    if (!r.ok) { setFout(r.fout); return }
    setGroep(r.groep)
  }

  async function aansluit() {
    setBesig(true); setFout('')
    const r = await sluitAan(keurGroepkode(kode), naam)
    setBesig(false)
    if (!r.ok) { setFout(r.fout); return }
    opKlaar(r.groep)
  }

  return (
    <div className="vg">
      <div className="vg-kop">
        <button className="vg-terug" onClick={opTerug}>‹ Terug</button>
        <h1>Sluit by jou groep aan</h1>
      </div>

      {!groep ? (
        <>
          <label className="vg-label">Groepkode</label>
          <input
            className="vg-invoer vg-kode"
            value={kode}
            onChange={e => setKode(e.target.value.toUpperCase())}
            placeholder="FJ4827"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            maxLength={9}
          />
          {fout && <p className="vg-fout">{fout}</p>}
          <button className="vg-hoof" onClick={soek} disabled={besig || !keurGroepkode(kode)}>
            {besig ? 'Besig…' : 'SOEK GROEP'}
          </button>
        </>
      ) : (
        <>
          <div className="vg-kaart vg-voorskou">
            <div className="vg-voorskou-naam">{groep.naam}</div>
            {groep.fasiliteerder && <div className="vg-voorskou-ry">Fasiliteerder: {groep.fasiliteerder}</div>}
            {groep.gemeente && <div className="vg-voorskou-ry">Gemeente: {groep.gemeente}</div>}
            <div className="vg-voorskou-ry">
              Deelnemers: {groep.aantalLede}
            </div>
          </div>

          <label className="vg-label">Jou naam, soos die groep dit gaan sien</label>
          <input
            className="vg-invoer"
            value={naam}
            onChange={e => setNaam(e.target.value)}
            placeholder="Jou naam"
            autoComplete="given-name"
            maxLength={30}
          />
          {fout && <p className="vg-fout">{fout}</p>}
          <button className="vg-hoof" onClick={aansluit} disabled={besig || naam.trim().length < 2}>
            {besig ? 'Besig…' : 'SLUIT BY HIERDIE GROEP AAN'}
          </button>
          <button className="vg-stil" onClick={() => { setGroep(null); setFout('') }}>
            Dit is nie my groep nie
          </button>
        </>
      )}
    </div>
  )
}

/* ── Begin 'n groep ─────────────────────────────────────────────────── */
export function BeginGroep({ opKlaar, opTerug }) {
  const [naam, setNaam] = useState('')
  const [groepnaam, setGroepnaam] = useState('')
  const [gemeente, setGemeente] = useState('')
  const [besig, setBesig] = useState(false)
  const [fout, setFout]   = useState('')

  async function skep() {
    setBesig(true); setFout('')
    const r = await skepGroep(groepnaam, gemeente, naam)
    setBesig(false)
    if (!r.ok) { setFout(r.fout); return }
    opKlaar(r.groep)
  }

  return (
    <div className="vg">
      <div className="vg-kop">
        <button className="vg-terug" onClick={opTerug}>‹ Terug</button>
        <h1>Begin jou VOLG JESUS-groep</h1>
      </div>

      <label className="vg-label">Jou vertoonnaam</label>
      <input className="vg-invoer" value={naam} onChange={e => setNaam(e.target.value)}
             placeholder="Jou naam" maxLength={30} autoComplete="given-name" />

      <label className="vg-label">Groepnaam</label>
      <input className="vg-invoer" value={groepnaam} onChange={e => setGroepnaam(e.target.value)}
             placeholder="Bv. Fontana Jongmense" maxLength={50} />

      <label className="vg-label">Kerk / Gemeente <span className="vg-opsioneel">opsioneel</span></label>
      <input className="vg-invoer" value={gemeente} onChange={e => setGemeente(e.target.value)}
             placeholder="Bv. Fontana" maxLength={60} />

      {fout && <p className="vg-fout">{fout}</p>}
      <button className="vg-hoof" onClick={skep}
              disabled={besig || naam.trim().length < 2 || groepnaam.trim().length < 3}>
        {besig ? 'Besig…' : 'SKEP MY GROEP'}
      </button>
    </div>
  )
}

/* ── Die groep is gereed ────────────────────────────────────────────── */
export function GroepGereed({ groep, opKlaar }) {
  const [nota, setNota] = useState('')
  const teks = uitnodiging(groep)

  return (
    <div className="vg">
      <div className="vg-kop">
        <h1>Jou groep is gereed</h1>
        <p className="vg-groot">{groep.naam}</p>
      </div>

      <div className="vg-kaart vg-kodekaart">
        <div className="vg-kop2">GROEPKODE</div>
        <div className="vg-kodegroot">{groep.kode}</div>
      </div>

      <p className="vg-fyn">
        Begin klein. Nooi mense met wie jy hierdie reis wil stap.
      </p>

      <button className="vg-hoof" onClick={async () => setNota(await deel(teks) === 'gekopieer' ? 'Die uitnodiging is gekopieer.' : '')}>
        NOOI NOU MENSE
      </button>
      <button className="vg-tweede" onClick={async () => {
        const r = await deel(groep.kode)
        setNota(r === 'gekopieer' ? 'Die kode is gekopieer.' : '')
      }}>
        KOPIEER KODE
      </button>
      {nota && <p className="vg-nota">{nota}</p>}

      {/* Die pad vorentoe.
       *
       * Hier het "Ek sal later mense nooi" gestaan, en dit was die ENIGSTE
       * uitgang. Dewald het mense genooi en toe voor 'n skerm gesit met net
       * een deur wat sê hy het nog nie gedoen wat hy pas gedoen het nie:
       * "ek het mense genooi ... wat nou .... geen verdere instruksies."
       *
       * 'n Skerm moet altyd sê wat die volgende ding is. Hierdie sin geld of
       * hy genooi het of nie — die groep bly staan, en die kode werk môre nog
       * net so goed. */}
      <button className="vg-stil" onClick={opKlaar}>
        Gaan voort na die week →
      </button>
      <p className="vg-fyn vg-fyn-onder">
        Jou groep bly staan. Wie ook al later met <strong>{groep.kode}</strong>
        {' '}aansluit, kom by julle uit — jy hoef nie hier te wag nie.
      </p>
    </div>
  )
}

/* ── Nooi die pastoor (§23) ─────────────────────────────────────────── */
export function NooiPastoor({ opTerug }) {
  const [nota, setNota] = useState('')
  const teks = [
    'Hallo Pastoor 👋',
    '',
    'Ek het VOLG JESUS op Daaglikse Hoop ontdek.',
    '',
    'Dit is ’n 52-week-reis om Jesus beter te leer ken en Hom in die werklike lewe te volg. Daar is ’n persoonlike weekritme, ’n private groepchat, groepsessies en fasiliteerder-hulp.',
    '',
    'Ek sal graag wil hê ons gemeente of groep moet dit oorweeg.',
    '',
    'Kyk hier: https://dewaldscheepers.com/go',
  ].join('\n')

  return (
    <div className="vg">
      <div className="vg-kop">
        <button className="vg-terug" onClick={opTerug}>‹ Terug</button>
        <h1>Wil jy jou gemeente saambring?</h1>
      </div>
      <div className="vg-kaart">
        <p>VOLG JESUS kan deur individue, klein groepe en gemeentes gebruik word.</p>
        <p className="vg-voorbeeld">{teks}</p>
      </div>
      <button className="vg-hoof" onClick={async () => {
        const r = await deel(teks)
        setNota(r === 'gekopieer' ? 'Die boodskap is gekopieer.' : '')
      }}>
        NOOI MY PASTOOR
      </button>
      {nota && <p className="vg-nota">{nota}</p>}
    </div>
  )
}

/* ── Die groepsessie (§44) ──
 *
 * Dit staan APART van die vyf dae en dit blokkeer niks. 30–40 minute, en dit
 * word NIE met materiaal volgestop om 'n uur te vul nie.
 */
export function Groepsessie({ weeknommer = 1, opTerug }) {
  /* Die sessie volg die OOP week. Dit het hier hardgekodeer gestaan met Week 1
     se Skrif en Week 1 se vrae, en toe Week 2 lewendig gaan, het die groep
     steeds Week 1 gesien. Dewald: "die groep sessie is week 1 sin." */
  const s = weekSessie(weeknommer)

  return (
    <div className="vg">
      <div className="vg-kop">
        <button className="vg-terug" onClick={opTerug}>‹ Terug</button>
        <div className="vg-merk">GROEPSESSIE · WEEK {weeknommer} · 30–40 MINUTE</div>
        <h1>{s.titel || 'Kyk saam na Jesus'}</h1>
      </div>

      {/* HOE dit werk, voordat 'n mens hoor wat dit is. */}
      <div className="vg-kaart vg-sessie-hoe">
        <p>Kom een keer per week bymekaar — of gesels deur die groepchat.</p>
      </div>

      <div className="vg-kaart">
        <p className="vg-fyn">
          Hierdie is nie ’n toets van wie die meeste weet nie. Niemand word
          gedwing om iets persoonliks te deel nie.
        </p>
      </div>

      {s.skrifte.length > 0 && (
        <div className="vg-kaart">
          <div className="vg-kop2">LEES SAAM</div>
          {s.skrifte.map(sk => <p key={sk} className="vg-skrifreel">{sk}</p>)}
        </div>
      )}

      {s.vrae.length > 0 && (
        <div className="vg-kaart">
          <div className="vg-kop2">PRAAT SAAM</div>
          <ol className="vg-vrae">
            {s.vrae.map((v, i) => <li key={i}>{v}</li>)}
          </ol>
        </div>
      )}

      <div className="vg-kaart">
        <div className="vg-kop2">STIL OOMBLIK</div>
        <p>Gee die groep ’n paar minute stilte. Moenie dit te vinnig probeer vul nie.</p>
      </div>

      {s.gebed && (
        <div className="vg-kaart vg-gebed">
          <div className="vg-kop2">BID SAAM</div>
          <p>{s.gebed}</p>
        </div>
      )}
    </div>
  )
}
export function GroepInstellings({ groep, myLid, opTerug, opUit, opBlad }) {
  const [nota, setNota]   = useState('')
  const [kode, setKode]   = useState(groep.kode)
  const [besig, setBesig] = useState(false)
  const nudge = nooiNudge(groep.aantalLede)

  return (
    <div className="vg">
      <div className="vg-kop">
        <button className="vg-terug" onClick={opTerug}>‹ Terug</button>
        <h1>{groep.naam}</h1>
        <p className="vg-fyn">
          {groep.aantalLede} {groep.aantalLede === 1 ? 'lid' : 'lede'}
          {groep.gemeente ? ` · ${groep.gemeente}` : ''}
        </p>
      </div>

      {nudge && <div className="vg-kaart vg-nudge"><p>{nudge}</p></div>}

      <div className="vg-kaart vg-kodekaart">
        <div className="vg-kop2">GROEPKODE</div>
        <div className="vg-kodegroot">{kode}</div>
      </div>
      <button className="vg-hoof" onClick={async () => {
        const r = await deel(uitnodiging({ ...groep, kode }))
        setNota(r === 'gekopieer' ? 'Die uitnodiging is gekopieer.' : '')
      }}>
        + NOOI IEMAND
      </button>

      {/* ── Waarom "Meld aan met Google" weg is ──
       *
       * Dewald: "werk meld aan met google? is dit nie beter om dit af te haal
       * nie."
       *
       * Dit het NIE gewerk nie. Google-aanmelding moet in die Firebase-projek
       * aangeskakel wees, en net Anonymous is aan. Die knoppie sou dus misluk
       * het — en 'n knoppie wat niks doen nie, is erger as geen knoppie: die
       * mens dink die app is stukkend, en dit was sy enigste tree.
       *
       * Wat 'n mens daarsonder verloor, is herstel ná 'n herinstallasie. Dit is
       * regtig iets, maar dit is nie soveel werd soos 'n belofte wat breek nie.
       * Skakel Google eendag aan in die konsole, dan kom hierdie blok terug —
       * die kode daaragter (koppelGoogle in volgJesusIdentiteit.js) bly staan. */}

      <button className="vg-tweede" onClick={() => opBlad && opBlad('sessie')}>
        DIE GROEPSESSIE
      </button>

      {/* ── Waarom "Genereer 'n nuwe groepkode" weg is ──
       *
       * Dewald: "is die genereer nuwe groep kode nodig???"
       *
       * Nee. Dit is vir een geval — 'n kode wat uitgelek het — en dit is die
       * duurste knoppie op hierdie skerm: die oomblik wat 'n mens hom druk,
       * gaan ELKE uitnodiging dood wat hy al gestuur het. Iemand wat more eers
       * die WhatsApp oopmaak, kry 'n kode wat nie meer bestaan nie, en hy weet
       * nie hoekom nie.
       *
       * Vir 'n klein private groep is dit 'n knoppie wat 'n mens net per
       * ongeluk druk. Die bediener se `kode`-aksie bly staan en is getoets;
       * gebeur dit ooit werklik, kom die knoppie in 'n minuut terug. */}

      {nota && <p className="vg-nota">{nota}</p>}

      <button className="vg-gevaar" disabled={besig} onClick={async () => {
        setBesig(true)
        const r = await verlaatGroep(groep.id)
        setBesig(false)
        if (r.ok) opUit()
        else setNota(r.fout)
      }}>
        Verlaat hierdie groep
      </button>
    </div>
  )
}
