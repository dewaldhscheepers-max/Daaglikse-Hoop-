/* ── VOLG JESUS — die admin ──
 *
 * Die 52-week dissipelskapprogram word HIER gebou, en dit staan doelbewus
 * buite die app tot dit klaar is.
 *
 * Dewald: "moenie dit in die app sit tot dit heeltemal klaar is tot by dag 52
 * nie. so dalk moet ons dit in admin bou met knoppie waar ek dit elke keer kan
 * gaan toets."
 *
 * Daarom:
 *
 *   · daar is GEEN openbare eindpunt nie — net /api/volg-jesus-week, en dit
 *     eis die admin-geheim;
 *   · elke week begin met `gepubliseer: false`, en die bediener stel daardie
 *     veld apart van die JSON sodat 'n mens dit nie per ongeluk deur die
 *     inhoud kan aanskakel nie;
 *   · VOORSKOU wys die week presies soos 'n gebruiker dit sal sien, sonder
 *     dat iemand anders daarby kan kom.
 *
 * Die video kom van YouTube af, net soos Sorg s'n. Geen audio — dit was
 * Dewald se besluit, en YouTube laat 'n mens self 144p kies, wat minder data
 * gebruik as die app se eie stemnotas.
 */
import { useState, useEffect, useCallback } from 'react'
import {
  BEWEGINGS, bewegingVir, KONTROLES, RISIKO_VLAKKE,
  publiseerFoute, geldigeVideoId, ontleedVerwysing,
} from '../data/volgJesus'
import { WEKE_1_TOT_5 } from '../data/volgJesusWeke'
import './VolgJesusAdmin.css'

const LEEG = (n) => ({
  weeknommer: n,
  titel: '', doel: '', openingskerm: '',
  primereSkrif: '', ondersteunendeSkrif: '',
  videoId: '',
  kernwaarheid: '', privaatRefleksie: '', gehoorsaamheidStap: '', gebed: '',
  dag2Skrif: '', dag2Prompt: '', dag3Prompt: '', dag4Vraag: '', dag5Prompt: '',
  groepVraag1: '', groepVraag2: '', groepVraag3: '',
  fasiliteerderHoofpunt: '', fasiliteerderGrens: '', fasiliteerderWaarskuwing: '',
  pastoraleRisiko: 'laag',
  kontroles: { teks: false, konteks: false, jesus: false, toepassing: false, grens: false },
  hersieningStatus: 'wag',
  gepubliseer: false,
})

export default function VolgJesusAdmin({ geheim = '' }) {
  const [lys, setLys]         = useState([])
  const [week, setWeek]       = useState(null)
  const [besig, setBesig]     = useState(false)
  const [boodskap, setBoodskap] = useState(null)
  const [voorskou, setVoorskou] = useState(false)

  const kop = useCallback(() => ({ 'Content-Type': 'application/json', 'x-sorg-geheim': geheim }), [geheim])

  const laaiLys = useCallback(async () => {
    try {
      const r = await fetch('/api/volg-jesus-week', { headers: { 'x-sorg-geheim': geheim } })
      const j = await r.json()
      setLys(Array.isArray(j.weke) ? j.weke : [])
    } catch { setLys([]) }
  }, [geheim])

  useEffect(() => { laaiLys() }, [laaiLys])

  async function maakOop(n) {
    setBesig(true); setBoodskap(null); setVoorskou(false)
    try {
      const r = await fetch(`/api/volg-jesus-week?week=${n}`, { headers: { 'x-sorg-geheim': geheim } })
      const j = await r.json()
      setWeek(j.week || LEEG(n))
    } catch { setWeek(LEEG(n)) }
    finally { setBesig(false) }
  }

  async function stoor() {
    if (!week) return
    setBesig(true); setBoodskap(null)
    try {
      const r = await fetch('/api/volg-jesus-week', {
        method: 'PUT', headers: kop(), body: JSON.stringify({ week }),
      })
      const j = await r.json()
      if (j.ok) { setBoodskap({ goed: true, teks: 'Gestoor.' }); laaiLys() }
      else setBoodskap({ goed: false, teks: j.fout || 'Kon nie stoor nie' })
    } catch { setBoodskap({ goed: false, teks: 'Kon nie stoor nie' }) }
    finally { setBesig(false) }
  }

  /* Laai Dewald se geskrewe Week 1–5 in die vorm. Dit STOOR nie — hy kyk
     eers, verander wat hy wil, en druk dan self Stoor. */
  function laaiGeskrewe(n) {
    const bron = WEKE_1_TOT_5[n]
    if (!bron) return
    setWeek(w => ({ ...LEEG(n), ...bron, ...(w && w.opgedateer ? { gepubliseer: w.gepubliseer } : {}) }))
    setBoodskap({ goed: true, teks: `Week ${n} se geskrewe teks is gelaai. Nog nie gestoor nie.` })
  }

  const stel = (veld, waarde) => setWeek(w => ({ ...w, [veld]: waarde }))
  const stelKontrole = (s, v) =>
    setWeek(w => ({ ...w, kontroles: { ...(w.kontroles || {}), [s]: v } }))

  const foute = week ? publiseerFoute(week) : []

  /* ── Die lys ───────────────────────────────────────────────────────── */
  if (!week) {
    return (
      <div className="vj">
        <div className="vj-kop">
          <h3>VOLG JESUS</h3>
          <p className="vj-sub">
            52 weke. Niks hiervan is in die app nie — dit word hier gebou en hier getoets.
          </p>
        </div>
        {BEWEGINGS.map(b => (
          <div key={b.nommer} className="vj-beweging">
            <div className="vj-beweging-kop">
              {b.nommer}. {b.naam} <span>Week {b.van}–{b.tot}</span>
            </div>
            <div className="vj-rooster">
              {Array.from({ length: b.tot - b.van + 1 }, (_, i) => b.van + i).map(n => {
                const ry = lys.find(x => x.weeknommer === n)
                const klas = ry ? (ry.gepubliseer ? 'lewe' : 'geskryf') : 'leeg'
                return (
                  <button key={n} className={`vj-blok ${klas}`} onClick={() => maakOop(n)}>
                    <span className="vj-blok-n">{n}</span>
                    <span className="vj-blok-t">{ry ? ry.titel : '—'}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    )
  }

  /* ── Die voorskou ──────────────────────────────────────────────────── */
  if (voorskou) {
    return (
      <div className="vj">
        <div className="vj-balk">
          <button className="vj-terug" onClick={() => setVoorskou(false)}>← Terug na redigeer</button>
          <span className="vj-balk-nota">Dit is hoe die gebruiker dit sal sien</span>
        </div>
        <WeekVoorskou week={week} />
      </div>
    )
  }

  /* ── Redigeer ──────────────────────────────────────────────────────── */
  const bew = bewegingVir(week.weeknommer)
  return (
    <div className="vj">
      <div className="vj-balk">
        <button className="vj-terug" onClick={() => { setWeek(null); setBoodskap(null) }}>← Al 52 weke</button>
        <div className="vj-balk-knoppe">
          <button className="vj-knop-2" onClick={() => setVoorskou(true)}>👁 Voorskou</button>
          <button className="vj-knop" onClick={stoor} disabled={besig}>
            {besig ? 'Besig…' : 'Stoor'}
          </button>
        </div>
      </div>

      <h3 className="vj-titel">Week {week.weeknommer} — {week.titel || 'sonder titel'}</h3>
      {bew && <p className="vj-sub">Beweging {bew.nommer}: {bew.naam}</p>}

      {boodskap && (
        <p className={`vj-boodskap ${boodskap.goed ? 'goed' : 'sleg'}`}>{boodskap.teks}</p>
      )}

      {WEKE_1_TOT_5[week.weeknommer] && (
        <button className="vj-laai" onClick={() => laaiGeskrewe(week.weeknommer)}>
          ↓ Laai die geskrewe teks vir Week {week.weeknommer}
        </button>
      )}

      <Veld l="Titel"        v={week.titel}        op={v => stel('titel', v)} />
      <Veld l="Doel van die week" v={week.doel}    op={v => stel('doel', v)} lank />
      <Veld l="Openingskerm" v={week.openingskerm} op={v => stel('openingskerm', v)} lank />

      <SkrifVeld l="Primêre Skrif"       v={week.primereSkrif}        op={v => stel('primereSkrif', v)} />
      <SkrifVeld l="Ondersteunende Skrif" v={week.ondersteunendeSkrif} op={v => stel('ondersteunendeSkrif', v)} />

      <div className="vj-veld">
        <label>YouTube-video-ID</label>
        <input value={week.videoId || ''} onChange={e => stel('videoId', e.target.value.trim())}
               placeholder="dQw4w9WgXcQ" />
        {week.videoId && !geldigeVideoId(week.videoId) && (
          <span className="vj-fout">Dit lyk nie soos 'n video-ID nie — net die 11 karakters, nie die hele skakel nie.</span>
        )}
      </div>

      <Veld l="Kernwaarheid (een sin)" v={week.kernwaarheid} op={v => stel('kernwaarheid', v)} lank />
      <Veld l="Privaat refleksie"      v={week.privaatRefleksie} op={v => stel('privaatRefleksie', v)} lank />
      <Veld l="Gehoorsaamheidstap"     v={week.gehoorsaamheidStap} op={v => stel('gehoorsaamheidStap', v)} lank />
      <Veld l="Gebed"                  v={week.gebed} op={v => stel('gebed', v)} lank />

      <h4 className="vj-afdeling">Dag 2 tot 5</h4>
      <SkrifVeld l="Dag 2 — Skrif" v={week.dag2Skrif} op={v => stel('dag2Skrif', v)} />
      <Veld l="Dag 2 — vraag"  v={week.dag2Prompt} op={v => stel('dag2Prompt', v)} lank />
      <Veld l="Dag 3 — vraag"  v={week.dag3Prompt} op={v => stel('dag3Prompt', v)} lank />
      <Veld l="Dag 4 — hartsvraag" v={week.dag4Vraag} op={v => stel('dag4Vraag', v)} lank />
      <Veld l="Dag 5 — leef dit"   v={week.dag5Prompt} op={v => stel('dag5Prompt', v)} lank />

      <h4 className="vj-afdeling">Die groep</h4>
      <Veld l="Groepvraag 1" v={week.groepVraag1} op={v => stel('groepVraag1', v)} lank />
      <Veld l="Groepvraag 2" v={week.groepVraag2} op={v => stel('groepVraag2', v)} lank />
      <Veld l="Groepvraag 3" v={week.groepVraag3} op={v => stel('groepVraag3', v)} lank />

      <h4 className="vj-afdeling">Die fasiliteerder</h4>
      <Veld l="Hoofpunt" v={week.fasiliteerderHoofpunt} op={v => stel('fasiliteerderHoofpunt', v)} lank />
      <Veld l="Wat ons NIE uit die teks moet aflei nie" v={week.fasiliteerderGrens}
            op={v => stel('fasiliteerderGrens', v)} lank />

      <div className="vj-veld">
        <label>Pastorale risiko</label>
        <div className="vj-radio">
          {RISIKO_VLAKKE.map(r => (
            <button key={r} className={week.pastoraleRisiko === r ? 'aan' : ''}
                    onClick={() => stel('pastoraleRisiko', r)}>{r}</button>
          ))}
        </div>
      </div>

      {/* Punt 3 §36: hierdie blok verskyn NET waar nodig — en waar dit nodig
          is, is dit verpligtend. Week 22 (huwelik) en Week 30 (vergifnis) kan
          mishandeling oopmaak. */}
      {week.pastoraleRisiko === 'hoog' && (
        <Veld l="⚠ Fasiliteerderwaarskuwing (verpligtend by hoë risiko)"
              v={week.fasiliteerderWaarskuwing}
              op={v => stel('fasiliteerderWaarskuwing', v)} lank />
      )}

      <h4 className="vj-afdeling">Die vyf kontroles</h4>
      <p className="vj-sub">Geen week publiseer voordat al vyf groen is nie.</p>
      {KONTROLES.map(k => (
        <label key={k.sleutel} className="vj-kontrole">
          <input type="checkbox" checked={(week.kontroles || {})[k.sleutel] === true}
                 onChange={e => stelKontrole(k.sleutel, e.target.checked)} />
          <span><strong>{k.sleutel}</strong> — {k.vraag}</span>
        </label>
      ))}

      <div className="vj-veld">
        <label>Teologiese hersiening</label>
        <div className="vj-radio">
          {['wag', 'goedgekeur'].map(s => (
            <button key={s} className={week.hersieningStatus === s ? 'aan' : ''}
                    onClick={() => stel('hersieningStatus', s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className={`vj-status ${foute.length ? 'sleg' : 'goed'}`}>
        {foute.length === 0
          ? '✓ Hierdie week is gereed om te publiseer.'
          : <>
              <strong>Nog nie gereed nie — {foute.length} ding{foute.length === 1 ? '' : 'e'}:</strong>
              <ul>{foute.map((f, i) => <li key={i}>{f}</li>)}</ul>
            </>}
      </div>

      <div className="vj-onder">
        <button className="vj-knop-2" onClick={() => setVoorskou(true)}>👁 Voorskou</button>
        <button className="vj-knop" onClick={stoor} disabled={besig}>
          {besig ? 'Besig…' : 'Stoor'}
        </button>
      </div>
    </div>
  )
}

/* ── Die voorskou: presies wat 'n gebruiker sal sien ───────────────────── */
function WeekVoorskou({ week }) {
  return (
    <div className="vjv">
      <div className="vjv-open">
        <div className="vjv-week">WEEK {week.weeknommer} VAN 52</div>
        <h2>{week.titel}</h2>
        <p className="vjv-open-teks">{week.openingskerm}</p>
        <button className="vjv-knop">BEGIN WEEK {week.weeknommer}</button>
      </div>

      <VStap n="DAG 1" t="LEES">
        <p className="vjv-skrif">{week.primereSkrif}</p>
        <p className="vjv-klein">Lees die gedeelte stadig.</p>
        <button className="vjv-knop-2">EK HET GELEES</button>
      </VStap>

      <VStap n="" t="VERSTAAN">
        {geldigeVideoId(week.videoId)
          ? <img className="vjv-duim" alt="Video"
                 src={`https://i.ytimg.com/vi/${week.videoId}/hqdefault.jpg`} />
          : <div className="vjv-geenvideo">Nog geen video nie</div>}
      </VStap>

      <VStap n="" t="HOU DIT VAS">
        <p className="vjv-kern">{week.kernwaarheid}</p>
      </VStap>

      <VStap n="" t="WEES EERLIK">
        <p>{week.privaatRefleksie}</p>
        <div className="vjv-kassie">Skryf vir jouself…</div>
        <p className="vjv-slot">🔒 Net jy kan hierdie lees.</p>
      </VStap>

      <VStap n="" t="GEHOORSAAM">
        <p>{week.gehoorsaamheidStap}</p>
        <button className="vjv-knop-2">EK WEET WAT MY VOLGENDE STAP IS</button>
      </VStap>

      <VStap n="" t="BID">
        <p className="vjv-gebed">{week.gebed}</p>
      </VStap>

      {week.dag2Prompt && <VStap n="DAG 2" t="KYK WEER">
        {week.dag2Skrif && <p className="vjv-skrif">{week.dag2Skrif}</p>}
        <p>{week.dag2Prompt}</p>
      </VStap>}
      {week.dag3Prompt && <VStap n="DAG 3" t="DOEN"><p>{week.dag3Prompt}</p></VStap>}
      {week.dag4Vraag  && <VStap n="DAG 4" t="HART"><p>{week.dag4Vraag}</p></VStap>}
      {week.dag5Prompt && <VStap n="DAG 5" t="LEEF DIT"><p>{week.dag5Prompt}</p></VStap>}

      <VStap n="GROEP" t="PRAAT SAAM">
        <ol className="vjv-vrae">
          <li>{week.groepVraag1}</li>
          <li>{week.groepVraag2}</li>
          <li>{week.groepVraag3}</li>
        </ol>
      </VStap>

      <div className="vjv-fas">
        <h4>Net die fasiliteerder sien hierdie</h4>
        <p><strong>Hoofpunt:</strong> {week.fasiliteerderHoofpunt}</p>
        <p><strong>Moenie aflei nie:</strong> {week.fasiliteerderGrens}</p>
        {week.pastoraleRisiko === 'hoog' && week.fasiliteerderWaarskuwing && (
          <p className="vjv-waarsku">⚠ {week.fasiliteerderWaarskuwing}</p>
        )}
      </div>
    </div>
  )
}

function VStap({ n, t, children }) {
  return (
    <div className="vjv-stap">
      {n && <div className="vjv-dag">{n}</div>}
      <div className="vjv-stap-t">{t}</div>
      {children}
    </div>
  )
}

function Veld({ l, v, op, lank }) {
  return (
    <div className="vj-veld">
      <label>{l}</label>
      {lank
        ? <textarea rows={3} value={v || ''} onChange={e => op(e.target.value)} />
        : <input value={v || ''} onChange={e => op(e.target.value)} />}
    </div>
  )
}

/* 'n Skrifveld wys dadelik wat dit ontleed het. 'n Verwysing wat ons nie kan
   lees nie, is 'n verwysing wat die app nie sal kan wys nie. */
function SkrifVeld({ l, v, op }) {
  const spanne = ontleedVerwysing(v || '')
  return (
    <div className="vj-veld">
      <label>{l}</label>
      <input value={v || ''} onChange={e => op(e.target.value)} placeholder="Johannes 1:1–18" />
      {v && (spanne.length
        ? <span className="vj-ok">
            {spanne.map(s => `${s.boek} ${s.hoofstuk ?? ''}${s.van ? ':' + s.van + '-' + s.tot : ''}`).join(' · ')}
          </span>
        : <span className="vj-fout">Kan hierdie verwysing nie lees nie</span>)}
    </div>
  )
}
