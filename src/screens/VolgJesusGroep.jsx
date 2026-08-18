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
import { useState } from 'react'
import {
  skepGroep, kykGroep, sluitAan, verlaatGroep, roteerKode,
} from '../data/volgJesusGroepApi'
import { koppelGoogle, isGekoppel, KOPPEL_REDE } from '../data/volgJesusIdentiteit'
import { keurGroepkode, uitnodiging, nooiNudge } from '../data/volgJesusGroep'
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
    const r = await kykGroep(kode)
    setBesig(false)
    if (!r.ok) { setFout(r.fout); return }
    setGroep(r.groep)
  }

  async function aansluit() {
    setBesig(true); setFout('')
    const r = await sluitAan(kode, naam)
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
      <button className="vg-stil" onClick={opKlaar}>Ek sal later mense nooi</button>
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

/* ── Die groep se instellings ───────────────────────────────────────── */
export function GroepInstellings({ groep, myLid, opTerug, opUit }) {
  const [nota, setNota]   = useState('')
  const [kode, setKode]   = useState(groep.kode)
  const [besig, setBesig] = useState(false)
  const [gekoppel, setGekoppel] = useState(isGekoppel())
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

      {/* ── Beveilig die groep ──
          Nie 'n muur nie: die groep werk met of sonder dit. Wat 'n mens sonder
          dit verloor, is herstel ná 'n herinstallasie — en dit staan hier in
          soveel woorde. */}
      {!gekoppel && (
        <div className="vg-kaart vg-koppel">
          <div className="vg-kop2">BEVEILIG JOU GROEP</div>
          <p>{KOPPEL_REDE}</p>
          <button className="vg-tweede" disabled={besig} onClick={async () => {
            setBesig(true); setNota('')
            const r = await koppelGoogle()
            setBesig(false)
            if (r.ok) { setGekoppel(true); setNota('Jou groep is nou aan jou rekening gekoppel.') }
            else if (r.fout) setNota(r.fout)
          }}>
            {besig ? 'Besig…' : 'MELD AAN MET GOOGLE'}
          </button>
        </div>
      )}

      {myLid && myLid.rol === 'fasiliteerder' && groep.eienaar === myLid.uid && (
        <button className="vg-tweede" disabled={besig} onClick={async () => {
          setBesig(true)
          const r = await roteerKode(groep.id)
          setBesig(false)
          if (r.ok) { setKode(r.kode); setNota('Die ou kode werk nie meer nie.') }
          else setNota(r.fout)
        }}>
          GENEREER ’N NUWE GROEPKODE
        </button>
      )}

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
