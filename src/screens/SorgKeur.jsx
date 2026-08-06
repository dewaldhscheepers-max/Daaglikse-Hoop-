/* ────────────────────────────────────────────────────────────
   Die keurpaneel — Dewald se inbak.

   Dit is die enigste skerm in die app waar mense se rou boodskappe wys. Dit
   sit agter dieselfde geheim as die video-admin (SORG_ADMIN_GEHEIM), nie
   agter die PIN nie: die PIN staan in die bondel wat elke besoeker aflaai.

   Die werkvloei is met opset klein — vier knoppies en 'n teksblok:

     lees → redigeer → Plaas op die muur
                    of  Gelees, nie geplaas nie

   Wat op die muur beland, is die GEREDIGEERDE teks. 'n Naam, 'n dorp, 'n
   nommer mag uit. Die persoon het daarvoor toestemming gegee, en dit is hoe
   'n mens hom beskerm.

   Die Gevaar-hopie staan eerste en wys WATTER woorde getref het, sodat
   Dewald dadelik sien hoekom.

   Geen transform of opacity op :active nie — net kleur. Sien CLAUDE.md.
   ──────────────────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from 'react'
import { onderwerpNaam } from '../data/sorgOnderwerpe'
import { vergeetMuur } from '../data/sorgMuur'
import SorgOpname from '../components/SorgOpname'
import './SorgKeur.css'

const HOPIES = [
  { sleutel: 'gevaar', naam: 'Gevaar' },
  { sleutel: 'nuut',   naam: 'Nuut' },
  { sleutel: 'gekeur', naam: 'Op die muur' },
  { sleutel: 'weg',    naam: 'Gelees' },
]

export default function SorgKeur({ geheim }) {
  const [data, setData] = useState(null)
  /* `null` beteken: nog nie gekies nie. Ons kies self sodra die data daar is.

     Dit het op 'gevaar' begin. Gevaar is meestal leeg — dit is die punt — dus
     het Dewald die admin oopgemaak en "Niks in hierdie hopie nie" gesien
     terwyl daar nuwe boodskappe gewag het. */
  const [hopie, setHopie] = useState(null)
  const [oop, setOop] = useState(null)        // die id wat oop is
  const [teks, setTeks] = useState('')
  const [titel, setTitel] = useState('')
  const [besig, setBesig] = useState(false)
  const [boodskap, setBoodskap] = useState(null)

  const haal = useCallback(async () => {
    if (!geheim) return
    try {
      const r = await fetch('/api/sorg-keur', { headers: { 'x-sorg-geheim': geheim } })
      const d = await r.json()
      if (r.ok) setData(d)
      else setBoodskap({ fout: d.fout || ('HTTP ' + r.status) })
    } catch (e) {
      setBoodskap({ fout: String(e && e.message) })
    }
  }, [geheim])

  useEffect(() => { haal() }, [haal])

  /* Gevaar eerste as daar iets in is — dit is die enigste hopie wat nie kan
     wag nie. Anders die eerste hopie waarin daar werk is. */
  useEffect(() => {
    if (hopie !== null || !data) return
    const inkom = data.inkomend || []
    const tel = k => inkom.filter(b => (b.status || 'nuut') === k).length
    const eerste = HOPIES.map(h => h.sleutel).find(k => tel(k) > 0)
    setHopie(eerste || 'nuut')
  }, [data, hopie])

  async function doen(lyf) {
    setBesig(true)
    setBoodskap(null)
    try {
      const r = await fetch('/api/sorg-keur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sorg-geheim': geheim },
        body: JSON.stringify(lyf),
      })
      const d = await r.json()
      if (!r.ok) { setBoodskap({ fout: d.fout || ('HTTP ' + r.status) }); return null }
      if (d.waarsku) { setBoodskap({ waarsku: d.waarsku, herhaalId: lyf.id }); return null }
      vergeetMuur()
      await haal()
      return d
    } catch (e) {
      setBoodskap({ fout: String(e && e.message) })
      return null
    } finally { setBesig(false) }
  }

  function maakOop(b) {
    setOop(b.id)
    setTeks(b.teks || '')
    setTitel('')
    setBoodskap(null)
  }

  /* Die teks kom ALTYD uit die toestand, nooit uit 'n gestoorde kopie nie.

     "Plaas tog so" het vroeer die oorspronklike versoek herhaal. Sien Dewald
     dus die waarskuwing "daar is nog 'n telefoonnommer in", haal die nommer
     uit, en druk dan "Plaas tog so", het die OU teks — met die nommer — op
     die muur beland. Dit is die teenoorgestelde van wat die waarskuwing
     veronderstel is om te doen. */
  async function plaas(id, tochPlaas = false) {
    const b = (data.inkomend || []).find(x => x.id === id)
    if (!b) return
    const d = await doen({
      aksie: 'keur',
      id: b.id,
      titel,
      teks,
      onderwerp: b.onderwerp,
      anoniem: !b.naam,
      naam: b.naam,
      tochPlaas,
    })
    if (d && d.ok) { setOop(null); setBoodskap({ goed: 'Op die muur.' }) }
  }

  /* 'n Mislukte haal het vroeer "Besig om te laai…" vir ALTYD gewys, want die
     foutboodskap is eers laer af geteken en hierdie reel het voor hom
     teruggekeer. Dewald sou 'n dooie skerm sien met geen idee hoekom nie. */
  if (!data) {
    return (
      <div className="sk">
        <div className="admin-section-title">🤍 Pastorale Sorg — Boodskappe</div>
        {boodskap && boodskap.fout ? (
          <>
            <div className="admin-error">{boodskap.fout}</div>
            <button className="sk-knop sk-plaas" onClick={haal}>Probeer weer</button>
          </>
        ) : (
          <p className="sk-leeg">Besig om te laai…</p>
        )}
      </div>
    )
  }

  const inkomend = data.inkomend || []
  const lys = inkomend.filter(b => (b.status || 'nuut') === hopie)

  return (
    <div className="sk">
      <div className="admin-section-title">🤍 Pastorale Sorg — Boodskappe</div>

      <div className="sk-hopies">
        {HOPIES.map(h => {
          const n = inkomend.filter(b => (b.status || 'nuut') === h.sleutel).length
          return (
            <button
              key={h.sleutel}
              className={`sk-hopie${hopie === h.sleutel ? ' aktief' : ''}${h.sleutel === 'gevaar' && n ? ' gevaar' : ''}`}
              onClick={() => { setHopie(h.sleutel); setOop(null) }}
            >
              {h.naam} {n > 0 && <b>{n}</b>}
            </button>
          )
        })}
      </div>

      {boodskap && boodskap.fout && <div className="admin-error">{boodskap.fout}</div>}
      {boodskap && boodskap.goed && <div className="admin-success">✅ {boodskap.goed}</div>}
      {boodskap && boodskap.waarsku && (
        <div className="sk-waarsku">
          <p>{boodskap.waarsku}</p>
          <button
            className="sk-knop"
            disabled={besig}
            onClick={() => plaas(boodskap.herhaalId, true)}
          >
            Plaas tog so
          </button>
        </div>
      )}

      {!lys.length && <p className="sk-leeg">Niks in hierdie hopie nie.</p>}

      {lys.map(b => (
        <div key={b.id} className={`sk-ry${b.status === 'gevaar' ? ' gevaar' : ''}`}>
          <div className="sk-ry-fyn">
            {b.dag} · {b.naam ? b.naam : 'Anoniem'} · {onderwerpNaam(b.onderwerp) || 'geen onderwerp'}
            {b.kode ? ` · ${b.kode}` : ''}
          </div>

          {/* Hoekom dit in die Gevaar-hopie is. Dewald moet dit kan sien
              sonder om die hele boodskap eers te lees. */}
          {(b.krisisWoorde || []).length > 0 && (
            <div className="sk-krisis">Getref: {(b.krisisWoorde || []).join(', ')}</div>
          )}
          {(b.kontakWaarskuwing || []).length > 0 && (
            <div className="sk-kontak">Bevat {(b.kontakWaarskuwing || []).join(' en ')}</div>
          )}
          {/* Vra om geld of goed. Dit keer niks — Dewald besluit. Dit spaar
              hom net die sorteer. */}
          {(b.hulpversoek || []).length > 0 && (
            <div className="sk-hulpversoek">Vra om hulp met geld of goed</div>
          )}

          {oop === b.id ? (
            <>
              <input
                className="sk-video"
                value={titel}
                onChange={e => setTitel(e.target.value)}
                maxLength={110}
                placeholder="Die vraag in een reel — bv. Moet ek die tablet koop?"
              />
              <div className="admin-books-note">
                Dit staan BO die storie op die muur. Sonder dit begin die kaart
                as 'n blok teks en niemand weet waaroor dit gaan nie.
              </div>

              <textarea
                className="sk-teks"
                value={teks}
                onChange={e => setTeks(e.target.value)}
                rows={9}
              />
              <div className="admin-books-note">
                Dít is wat op die muur gaan wys. Haal name, dorpe en nommers
                uit. Die rou weergawe bly hier en gaan nêrens heen nie.
              </div>

              <div className="sk-knoppe">
                <button className="sk-knop sk-plaas" disabled={besig || teks.trim().length < 10} onClick={() => plaas(b.id)}>
                  Plaas op die muur
                </button>
                <button className="sk-knop" disabled={besig} onClick={() => doen({ aksie: 'weg', id: b.id })}>
                  Gelees, nie geplaas
                </button>
                <button className="sk-knop" onClick={() => setOop(null)}>Los</button>
              </div>
            </>
          ) : (
            <>
              <p className="sk-voorskou">{b.teks}</p>
              <div className="sk-knoppe">
                {b.status !== 'gekeur' && (
                  /* In die Gevaar-hopie staan daar NIE "Lees en keur" nie.
                     'n Boodskap waarin iemand van selfmoord skryf, mag nooit
                     met een verkeerde druk openbaar gaan nie. Daar is "Lees
                     nou" — wat oopmaak sonder om iets te belowe — en "Hou
                     terug", wat dit uit die pad haal sonder om dit te
                     verloor. */
                  <button className="sk-knop sk-plaas" onClick={() => maakOop(b)}>
                    {b.status === 'gevaar' ? 'Lees nou' : 'Lees en keur'}
                  </button>
                )}
                {b.status === 'gevaar' && (
                  <button className="sk-knop" disabled={besig} onClick={() => doen({ aksie: 'weg', id: b.id })}>
                    Hou terug
                  </button>
                )}
                {/* Geen "Vee uit" op 'n noodboodskap nie. Een verkeerde druk
                    en dit is permanent weg — insluitend die enigste rekord
                    dat iemand om hulp geroep het. */}
                {b.status !== 'gevaar' && <button className="sk-knop sk-vee" onClick={() => {
                  if (window.confirm("Vee hierdie boodskap heeltemal uit?\n\nDit gaan van die muur EN uit die inbak weg. Dit is wat \u0027n mens doen wanneer die persoon self vra dat dit weggaan.")) {
                    doen({ aksie: 'vee', id: b.id, muurId: b.muurId })
                  }
                }}>Vee uit</button>}
              </div>
            </>
          )}
        </div>
      ))}

      <Muur data={data} doen={doen} besig={besig} />
    </div>
  )
}

/* ── Wat reeds op die muur is, en Dewald se antwoord daaronder ── */
function Muur({ data, doen, besig }) {
  const [oop, setOop] = useState(null)
  const [tipe, setTipe] = useState('oudio')
  const [bron, setBron] = useState('')
  const [teks, setTeks] = useState('')
  const [titel, setTitel] = useState('')

  /* Redigeer wat REEDS op die muur staan.

     Die opskrifte is later bygekom, dus het die eerste plasings nie een nie.
     Sonder hierdie knoppie sou 'n mens die plasing moes uitvee en die hele
     boodskap oordoen — en dan verloor jy die saamdra-telling en die
     antwoord. */
  const [wysigOop, setWysigOop] = useState(null)
  const [wTitel, setWTitel] = useState('')
  const [wTeks, setWTeks] = useState('')

  const muur = data.muur || []
  if (!muur.length) return null

  async function stuur(m) {
    const d = await doen({ aksie: 'antwoord', muurId: m.id, antwoord: { tipe, titel, bron, teks } })
    if (d && d.ok) { setOop(null); setBron(''); setTeks(''); setTitel('') }
  }

  async function stoorWysig(m) {
    const d = await doen({ aksie: 'wysig', muurId: m.id, titel: wTitel, teks: wTeks })
    if (d && d.ok) setWysigOop(null)
  }

  return (
    <>
      <div className="admin-section-title" style={{ marginTop: 26 }}>
        Op die muur ({muur.length})
      </div>

      {muur.map(m => (
        <div key={m.id} className="sk-ry">
          <div className="sk-ry-fyn">
            {m.datum} · {m.naam || 'Anoniem'}
            {m.antwoord ? ' · beantwoord' : ' · nog geen antwoord'}
            {m.saam ? ` · ${m.saam} dra dit saam` : ''}
          </div>
          {/* Sonder hierdie merkie lyk 'n afgehaalde plasing presies soos een
              wat op die muur staan, en dan haal 'n mens dieselfde een twee
              keer af en wonder hoekom niks gebeur nie. */}
          {m.gepubliseer === false && <div className="sk-kontak">Van die muur af</div>}
          <p className="sk-voorskou">{m.teks}</p>

          {wysigOop === m.id && (
            <>
              <input
                className="sk-video"
                value={wTitel}
                onChange={e => setWTitel(e.target.value)}
                maxLength={110}
                placeholder="Die vraag in een reel"
              />
              <div className="admin-books-note">
                Dit staan BO die storie op die muur.
              </div>
              <textarea
                className="sk-teks"
                rows={7}
                value={wTeks}
                onChange={e => setWTeks(e.target.value)}
              />
              <div className="sk-knoppe">
                <button className="sk-knop sk-plaas" disabled={besig || wTeks.trim().length < 10} onClick={() => stoorWysig(m)}>
                  Stoor
                </button>
                <button className="sk-knop" onClick={() => setWysigOop(null)}>Los</button>
              </div>
            </>
          )}

          {oop === m.id ? (
            <>
              <input
                className="sk-video"
                value={titel}
                onChange={e => setTitel(e.target.value)}
                maxLength={110}
                placeholder="Waarop antwoord jy? — bv. Wanneer is 'n groot uitgawe wysheid?"
              />
              <div className="admin-books-note">
                Dit staan bo die klankgreep. "Dewald antwoord" se nie waaroor
                dit gaan nie; hierdie reel wel, en dis wat mense laat druk.
              </div>

              <div className="sk-tipes">
                {[['oudio', 'Stemnota'], ['video', 'Video'], ['teks', 'Geskrewe']].map(([k, n]) => (
                  <button key={k} className={`sk-tipe${tipe === k ? ' aktief' : ''}`} onClick={() => setTipe(k)}>
                    {n}
                  </button>
                ))}
              </div>
              {/* 'n Stemnota word HIER opgeneem of gekies, nie iewers anders
                  opgelaai en dan geplak nie. Dieselfde as die stemnotas op
                  Luister. Vir 'n video bly dit 'n YouTube-skakel — daardie
                  bandwydte hoort nie by ons nie. */}
              {tipe === 'oudio' && <SorgOpname bron={bron} onBron={setBron} />}

              {tipe === 'video' && (
                <input
                  className="sk-video"
                  value={bron}
                  onChange={e => setBron(e.target.value)}
                  placeholder="YouTube-skakel"
                />
              )}
              <textarea
                className="sk-teks"
                rows={4}
                value={teks}
                onChange={e => setTeks(e.target.value)}
                placeholder={tipe === 'teks' ? 'Jou antwoord' : 'Iets daarby, as jy wil (opsioneel)'}
              />
              <div className="sk-knoppe">
                <button
                  className="sk-knop sk-plaas"
                  disabled={besig || (tipe === 'teks' ? !teks.trim() : !bron.trim())}
                  onClick={() => stuur(m)}
                >
                  Plaas die antwoord
                </button>
                <button className="sk-knop" onClick={() => setOop(null)}>Los</button>
              </div>
            </>
          ) : (
            <div className="sk-knoppe">
              <button className="sk-knop" onClick={() => {
                setWysigOop(m.id)
                setWTitel(m.titel || '')
                setWTeks(m.teks || '')
              }}>
                Redigeer
              </button>
              <button className="sk-knop sk-plaas" onClick={() => {
                setOop(m.id)
                setTipe((m.antwoord && m.antwoord.tipe) || 'oudio')
                setTitel((m.antwoord && m.antwoord.titel) || '')
                setBron((m.antwoord && m.antwoord.bron) || '')
                setTeks((m.antwoord && m.antwoord.teks) || '')
              }}>
                {m.antwoord ? 'Verander die antwoord' : 'Antwoord'}
              </button>
              {/* Afhaal moet omkeerbaar wees. Dit was dit nie: 'n mens kon
                  'n plasing afhaal en dan was daar geen knoppie om hom terug
                  te sit nie. Die enigste pad terug sou deur die Firebase-
                  konsole gewees het. */}
              <button
                className="sk-knop"
                disabled={besig}
                onClick={() => doen({ aksie: 'wysig', muurId: m.id, gepubliseer: m.gepubliseer === false })}
              >
                {m.gepubliseer === false ? 'Sit terug op die muur' : 'Haal van die muur af'}
              </button>
            </div>
          )}
        </div>
      ))}
    </>
  )
}
