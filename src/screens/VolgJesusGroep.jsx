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
  skepGroep, kykGroep, sluitAan, verlaatGroep, roteerKode, stelChat,
} from '../data/volgJesusGroepApi'
import { koppelGoogle, isGekoppel, KOPPEL_REDE } from '../data/volgJesusIdentiteit'
import { keurGroepkode, uitnodiging, nooiNudge } from '../data/volgJesusGroep'
import { haalLede } from '../data/volgJesusChat'
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
export function Groepsessie({ opTerug }) {
  return (
    <div className="vg">
      <div className="vg-kop">
        <button className="vg-terug" onClick={opTerug}>‹ Terug</button>
        <div className="vg-merk">GROEPSESSIE · 30–40 MINUTE</div>
        <h1>Kyk saam na Jesus</h1>
      </div>

      <div className="vg-kaart">
        <p className="vg-fyn">
          Hierdie is nie ’n toets van wie die meeste weet nie. Niemand word
          gedwing om iets persoonliks te deel nie.
        </p>
      </div>

      <div className="vg-kaart">
        <div className="vg-kop2">LEES SAAM</div>
        <p className="vg-skrifreel">Matteus 16:13–17</p>
        <p className="vg-skrifreel">Johannes 1:1–18</p>
      </div>

      <div className="vg-kaart">
        <div className="vg-kop2">PRAAT SAAM</div>
        <ol className="vg-vrae">
          <li>Wat het jou hierdie week die meeste van Jesus getref?</li>
          <li>Waarom dink jy maak Jesus die vraag persoonlik: “Wie sê júlle is Ek?”</li>
          <li>Waar vorm ons maklik ’n Jesus wat by ons eie voorkeure pas?</li>
          <li>Wat beteken dit prakties om Jesus nie net as Helper te wil hê nie, maar Hom as Here te volg?</li>
        </ol>
      </div>

      <div className="vg-kaart">
        <div className="vg-kop2">STIL OOMBLIK</div>
        <p>Gee die groep ’n paar minute stilte. Moenie dit te vinnig probeer vul nie.</p>
      </div>

      <div className="vg-kaart vg-gebed">
        <div className="vg-kop2">BID SAAM</div>
        <p>
          Here Jesus, help ons om U te sien soos U werklik is. Waar ons U kleiner
          gemaak het, korrigeer ons. Waar ons nog self die laaste sê wil hê, leer
          ons om U te vertrou. Leer ons om U saam te volg. Amen.
        </p>
      </div>
    </div>
  )
}

/* ── Die fasiliteerder-gids (§45) ──
 *
 * "Die fasiliteerder moet nie 'n tweede kursus moet studeer nie. Maksimum
 * ongeveer 3 minute voorbereiding."
 *
 * Dit wys NET vir 'n fasiliteerder. 'n Gewone deelnemer sien dit nooit.
 */
export function FasiliteerderGids({ opTerug }) {
  return (
    <div className="vg">
      <div className="vg-kop">
        <button className="vg-terug" onClick={opTerug}>‹ Terug</button>
        <div className="vg-merk">FASILITEERDER · ±3 MINUTE OM TE LEES</div>
        <h1>Jou doel</h1>
        <p className="vg-groot">Help mense om na Jesus te kyk.</p>
      </div>

      <div className="vg-kaart">
        <div className="vg-kop2">DIE KERNWAARHEID</div>
        <p>
          Die vraag is persoonlik, maar die Evangelies bepaal die inhoud van die
          antwoord. Ons antwoord op Jesus — ons skep Hom nie.
        </p>
        <p>Hou aan vra: <strong>“Wat wys die teks vir ons oor Jesus?”</strong></p>
      </div>

      <div className="vg-kaart">
        <div className="vg-kop2">MOENIE</div>
        <ul className="vg-lys">
          <li>private dinge uit mense probeer trek nie</li>
          <li>twyfel verneder nie</li>
          <li>elke antwoord met ’n mini-preek opvolg nie</li>
          <li>teologiese antwoorde uitdink nie</li>
          <li>stilte vrees nie</li>
        </ul>
      </div>

      <div className="vg-kaart">
        <div className="vg-kop2">AS IEMAND SÊ: “EK WEET NIE OF EK GLO NIE”</div>
        <p className="vg-aanhaling">
          Dankie dat jy eerlik is. Hou saam met ons aan om na Jesus te kyk.
        </p>
      </div>

      <div className="vg-kaart">
        <div className="vg-kop2">AS DIE GROEP STIL RAAK</div>
        <p className="vg-aanhaling">
          As Johannes 1 al was wat ons oor Jesus gehad het, wat sou ons vandag
          van Hom weet?
        </p>
      </div>

      <div className="vg-kaart vg-veilig">
        <div className="vg-kop2">VEILIGHEID</div>
        <p>
          Beskryf iemand onmiddellike gevaar, mishandeling of selfbesering,
          hanteer dit NIE as gewone groepsgesprek nie. Gebruik die app se
          Hulp&nbsp;Nou.
        </p>
      </div>
    </div>
  )
}

/* ── Wie uit die groepchat is ────────────────────────────────────────
 *
 * Die fasiliteerder haal iemand uit die gesprek by die boodskap self. Hier is
 * die pad TERUG, en dit is die helfte wat 'n mens vergeet om te bou: 'n knoppie
 * wat 'n mens per ongeluk druk, moet 'n weg terug hê.
 *
 * Die lede kom direk uit Firestore — 'n lid mag sy eie groep se lede lees. */
function UitDieChat({ groep }) {
  const [uit, setUit]   = useState(null)   /* null = nog nie gekyk nie */
  const [besig, setBesig] = useState('')

  useEffect(() => {
    let dood = false
    if (!groep || !groep.id) return
    haalLede(groep.id)
      .then(l => { if (!dood) setUit(l.filter(x => x.chatAf === true)) })
      .catch(() => { if (!dood) setUit([]) })
    return () => { dood = true }
  }, [groep && groep.id])

  async function terug(lid) {
    setBesig(lid.uid)
    const r = await stelChat(groep.id, lid.uid, true)
    setBesig('')
    if (r && r.ok) setUit(v => v.filter(x => x.uid !== lid.uid))
  }

  if (!uit || !uit.length) return null

  return (
    <div className="vg-kaart vg-uitchat">
      <div className="vg-kop2">UIT DIE GROEPCHAT</div>
      <p className="vg-fyn">
        Hulle doen die program soos altyd — net die gesprek is toe.
      </p>
      {uit.map(l => (
        <div key={l.uid} className="vg-uitchat-ry">
          <span>{l.naam || 'Iemand'}</span>
          <button disabled={besig === l.uid} onClick={() => terug(l)}>
            {besig === l.uid ? 'Besig…' : 'Sit terug'}
          </button>
        </div>
      ))}
    </div>
  )
}

/* ── Die groep se instellings ───────────────────────────────────────── */
export function GroepInstellings({ groep, myLid, opTerug, opUit, opBlad }) {
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

      {/* Wie uit die groepchat is. Dit wys NET as daar iemand is — 'n leë blok
          met 'n opskrif is 'n blok wat 'n mens leer om te ignoreer.
          Die bevestiging in die chat belowe hierdie pad terug; sonder dit is
          'n mens wat per ongeluk gedruk het, vas. */}
      {myLid && myLid.rol === 'fasiliteerder' && <UitDieChat groep={groep} />}

      <button className="vg-tweede" onClick={() => opBlad && opBlad('sessie')}>
        DIE GROEPSESSIE
      </button>
      {myLid && myLid.rol === 'fasiliteerder' && (
        <button className="vg-tweede" onClick={() => opBlad && opBlad('gids')}>
          FASILITEERDER-GIDS
        </button>
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
