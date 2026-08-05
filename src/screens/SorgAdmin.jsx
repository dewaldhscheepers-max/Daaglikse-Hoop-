/* ────────────────────────────────────────────────────────────
   Pastorale Sorg se admin — die video's.

   ── Een wagwoord ──

   Hierdie skerm het sy eie tweede wagwoordskerm gehad. Dit is weg: die hele
   admin loop nou op EEN wagwoord, wat Dewald een keer tik en wat die
   BEDIENER nagaan teen SORG_ADMIN_GEHEIM op Vercel.

   Dieselfde wagwoord ontsluit die boodskappe, en daardie boodskappe is
   mense se mishandeling en hul selfmoordgedagtes. Daarom staan hy nooit in
   hierdie kode nie — 'n wagwoord in die app se lêers is nie 'n wagwoord
   nie, want enigiemand kan daardie lêers oopmaak.
   ──────────────────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from 'react'
import { ONDERWERPE } from '../data/sorgOnderwerpe'
import { vergeetVideos } from '../data/sorgVideos'
import SorgKeur from './SorgKeur'
import './SorgAdmin.css'

const LEEG = {
  id: null, videoId: '', titel: '', beskrywing: '',
  onderwerpe: [], datum: new Date().toISOString().slice(0, 10),
  weekVideo: false, gepubliseer: true, uitPlasing: '',
}

export default function SorgAdmin({ geheim = '' }) {
  const [videos, setVideos] = useState([])
  const [vorm, setVorm] = useState(LEEG)
  const [besig, setBesig] = useState(false)
  const [boodskap, setBoodskap] = useState(null)
  const [inst, setInst] = useState(null)
  const [tikPlafon, setTikPlafon] = useState('')

  const haal = useCallback(async (g) => {
    try {
      const r = await fetch('/api/sorg-videos', { headers: g ? { 'x-sorg-geheim': g } : {} })
      const d = await r.json()
      setVideos(Array.isArray(d.videos) ? d.videos : [])
    } catch { setVideos([]) }
  }, [])

  const haalInst = useCallback(async (g) => {
    if (!g) return
    try {
      const r = await fetch('/api/sorg-instellings', { headers: { 'x-sorg-geheim': g } })
      const d = await r.json()
      if (r.ok) { setInst(d); setTikPlafon(String(d.plafon)) }
    } catch { /* dan wys die blok net nie */ }
  }, [])

  useEffect(() => { haal(geheim) }, [geheim, haal])
  useEffect(() => { haalInst(geheim) }, [geheim, haalInst])

  async function stoorInst(volgende) {
    setBesig(true)
    setBoodskap(null)
    try {
      const r = await fetch('/api/sorg-instellings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sorg-geheim': geheim },
        body: JSON.stringify(volgende),
      })
      const d = await r.json()
      if (!r.ok) { setBoodskap({ fout: d.fout || ('HTTP ' + r.status) }); return }
      await haalInst(geheim)
      setBoodskap({ goed: 'Gestoor.' })
    } catch (e) {
      setBoodskap({ fout: String(e && e.message) })
    } finally { setBesig(false) }
  }

  async function stuur(lyf) {
    setBesig(true)
    setBoodskap(null)
    try {
      const r = await fetch('/api/sorg-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sorg-geheim': geheim },
        body: JSON.stringify(lyf),
      })
      const d = await r.json()
      if (!r.ok) { setBoodskap({ fout: d.fout || ('HTTP ' + r.status) }); return false }
      vergeetVideos()
      await haal(geheim)
      return true
    } catch (e) {
      setBoodskap({ fout: String(e && e.message) })
      return false
    } finally { setBesig(false) }
  }

  async function stoor() {
    const ok = await stuur({ ...vorm, uitPlasing: vorm.uitPlasing || null })
    if (ok) {
      setBoodskap({ goed: vorm.id ? 'Bygewerk.' : 'Video bygevoeg.' })
      setVorm(LEEG)
    }
  }

  async function vee(v) {
    /* 'n Video wat uitgevee is, is weg. Dewald het gesê sy video's mag nooit
       verwyder word nie, dus vra ons eers — en "versteek" is in byna elke
       geval die regte knoppie. */
    if (!window.confirm(`Vee "${v.titel}" heeltemal uit?\n\nVersteek is amper altyd beter — dan bly die video behoue.`)) return
    const ok = await stuur({ aksie: 'vee', id: v.id })
    if (ok) setBoodskap({ goed: 'Uitgevee.' })
  }

  function wissel(sleutel) {
    setVorm(v => ({
      ...v,
      onderwerpe: v.onderwerpe.includes(sleutel)
        ? v.onderwerpe.filter(x => x !== sleutel)
        : [...v.onderwerpe, sleutel],
    }))
  }

  return (
    <div className="admin-section">

      {/* ── Die inbak ──
          Eerste, want dít is die werk. Die video's en die plafon is
          onderhoud; die boodskappe is mense wat wag. */}
      <SorgKeur geheim={geheim} />

      {/* ── Hoeveel boodskappe 'n dag ──
          Nie 'n tegniese perk nie: dit is hoeveel EEN MENS in 'n dag
          behoorlik kan lees. Krisisboodskappe kom altyd deur, ook wanneer
          die dag vol is. */}
      {inst && (
        <div className="sa-instellings">
          <div className="admin-section-title">🤍 Pastorale Sorg — Boodskappe</div>
          <p className="admin-books-note">
            Vandag ({inst.dag}) het <b>{inst.vandag}</b> van <b>{inst.plafon}</b> mense
            geskryf. Boodskappe waarin die krisiswoorde tref, kom altyd deur —
            ook wanneer die dag vol is.
          </p>

          <div className="admin-field">
            <label>Hoeveel boodskappe per dag</label>
            <input
              type="number"
              min="0"
              max="500"
              value={tikPlafon}
              onChange={e => setTikPlafon(e.target.value)}
            />
            <div className="admin-books-note" style={{ marginTop: 6 }}>
              Sit dit op 0 wanneer jy weg is. Dan sien mense 'n vriendelike
              boodskap in plaas van 'n ry wat niemand lees nie.
            </div>
          </div>

          <label className="sa-wissel">
            <input
              type="checkbox"
              checked={inst.oop}
              onChange={e => stoorInst({ plafon: inst.plafon, oop: e.target.checked })}
            />
            <span>{inst.oop ? '✅ Mense kan skryf' : '⬜ Toe — niemand kan nou skryf nie'}</span>
          </label>

          <button
            className="admin-save-btn"
            disabled={besig || tikPlafon === '' || Number(tikPlafon) === inst.plafon}
            onClick={() => stoorInst({ plafon: Number(tikPlafon), oop: inst.oop })}
          >
            {besig ? 'Besig…' : 'Stoor die plafon'}
          </button>
        </div>
      )}

      <div className="admin-section-title" style={{ marginTop: 26 }}>
        🤍 Pastorale Sorg — Video's
      </div>
      <p className="admin-books-note">
        'n Video is 'n YouTube-skakel, nie 'n lêer nie. Plak die skakel; ons
        haal die ID self daaruit. Die oorspronklike lêer hou jy self.
      </p>

      <div className="admin-field">
        <label>YouTube-skakel of ID *</label>
        <input
          value={vorm.videoId}
          onChange={e => setVorm(v => ({ ...v, videoId: e.target.value }))}
          placeholder="https://youtu.be/… of net die ID"
        />
      </div>

      <div className="admin-field">
        <label>Titel *</label>
        <input
          value={vorm.titel}
          onChange={e => setVorm(v => ({ ...v, titel: e.target.value }))}
          placeholder="bv. Wanneer jy moeg geword het om sterk te wees"
        />
        <div className="admin-books-note" style={{ marginTop: 6 }}>
          Skryf die sin wat 'n mens oor homself sou sê, nie 'n onderwerp nie.
        </div>
      </div>

      <div className="admin-field">
        <label>Kort beskrywing</label>
        <textarea
          rows={2}
          value={vorm.beskrywing}
          onChange={e => setVorm(v => ({ ...v, beskrywing: e.target.value }))}
        />
      </div>

      <div className="admin-field">
        <label>Onderwerpe</label>
        <div className="sa-onderwerpe">
          {ONDERWERPE.map(o => (
            <button
              key={o.sleutel}
              className={`sa-onderwerp${vorm.onderwerpe.includes(o.sleutel) ? ' gekies' : ''}`}
              onClick={() => wissel(o.sleutel)}
            >
              {o.naam}
            </button>
          ))}
        </div>
        <div className="admin-books-note" style={{ marginTop: 6 }}>
          Dít bepaal watter video iemand DADELIK kry wanneer hy sy boodskap
          stuur. 'n Video sonder 'n onderwerp help niemand op daardie oomblik
          nie.
        </div>
      </div>

      <div className="admin-field">
        <label>Datum</label>
        <input type="date" value={vorm.datum} onChange={e => setVorm(v => ({ ...v, datum: e.target.value }))} />
      </div>

      <div className="admin-field">
        <label className="sa-wissel">
          <input type="checkbox" checked={vorm.weekVideo} onChange={e => setVorm(v => ({ ...v, weekVideo: e.target.checked }))} />
          <span>Wys as <b>Die week se video</b> (bo-aan die blad)</span>
        </label>
        <label className="sa-wissel">
          <input type="checkbox" checked={vorm.gepubliseer} onChange={e => setVorm(v => ({ ...v, gepubliseer: e.target.checked }))} />
          <span>{vorm.gepubliseer ? '✅ Gepubliseer' : '⬜ Versteek'}</span>
        </label>
      </div>

      {boodskap && boodskap.fout && <div className="admin-error">{boodskap.fout}</div>}
      {boodskap && boodskap.goed && <div className="admin-success">✅ {boodskap.goed}</div>}

      <button className="admin-save-btn" onClick={stoor} disabled={besig || !vorm.videoId.trim() || !vorm.titel.trim()}>
        {besig ? 'Besig…' : vorm.id ? 'Werk by' : 'Voeg video by'}
      </button>
      {vorm.id && (
        <button className="sa-kanselleer" onClick={() => setVorm(LEEG)}>Los</button>
      )}

      <div className="admin-section-title" style={{ marginTop: 26 }}>
        {videos.length} video{videos.length === 1 ? '' : '\'s'}
      </div>

      {videos.map(v => (
        <div key={v.id} className={`sa-ry${v.gepubliseer ? '' : ' versteek'}`}>
          <div className="sa-ry-kop">
            {v.weekVideo && <span className="sa-merk">Die week</span>}
            {!v.gepubliseer && <span className="sa-merk sa-merk-af">Versteek</span>}
            <span className="sa-ry-titel">{v.titel}</span>
          </div>
          <div className="sa-ry-fyn">
            {v.datum} · {(v.onderwerpe || []).length
              ? (v.onderwerpe || []).map(s => (ONDERWERPE.find(o => o.sleutel === s) || {}).naam).filter(Boolean).join(', ')
              : 'geen onderwerp'}
          </div>
          <div className="sa-ry-knoppe">
            <button onClick={() => setVorm({ ...LEEG, ...v, uitPlasing: v.uitPlasing || '' })}>Redigeer</button>
            <button onClick={() => stuur({ ...v, gepubliseer: !v.gepubliseer })}>
              {v.gepubliseer ? 'Versteek' : 'Publiseer'}
            </button>
            <button className="sa-vee" onClick={() => vee(v)}>Vee uit</button>
          </div>
        </div>
      ))}
    </div>
  )
}
