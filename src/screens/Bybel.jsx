import { useState, useEffect, useRef, useCallback } from 'react'
import './Bybel.css'
import { boekNaam, NT_EERSTE } from '../data/bybelBoeke'

const API = '/api/bible?path='

// Voorkeur-weergawes bo-aan die kieser
const VOORKEUR = ['NIV11', 'AMP', 'BSB', 'NASB2020', 'engWEBUS', 'ASV']

const GROOTTES = [15, 17, 19, 21, 24]
const TEMAS    = [
  { id: 'lig',   naam: 'Lig'   },
  { id: 'sepia', naam: 'Sepia' },
  { id: 'donker', naam: 'Donker' },
]

let weergaweKas = null
const hoofstukKas = {}
const teksKas     = {}

function lees(sleutel, verstek) {
  try { const v = localStorage.getItem(sleutel); return v == null ? verstek : JSON.parse(v) }
  catch { return verstek }
}
function stoor(sleutel, waarde) {
  try { localStorage.setItem(sleutel, JSON.stringify(waarde)) } catch {}
}

async function haal(pad, params = {}) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => qs.append(k, v))
  const url = API + encodeURIComponent(pad) + (qs.toString() ? '&' + qs.toString() : '')
  const r = await fetch(url, { headers: { accept: 'application/json' } })
  if (!r.ok) throw new Error('HTTP ' + r.status)
  return r.json()
}

export default function Bybel({ onClose }) {
  const [view, setView]           = useState('boeke')
  const [weergawes, setWeergawes] = useState(weergaweKas || [])
  const [weergaweId, setWeergaweId] = useState(() => lees('byb_weergawe', 3034))
  const [boek, setBoek]           = useState(null)
  const [hoofstukke, setHoofstukke] = useState([])
  const [hoofstuk, setHoofstuk]   = useState(null)
  const [inhoud, setInhoud]       = useState(null)
  const [laai, setLaai]           = useState(false)
  const [fout, setFout]           = useState(null)
  const [wysKieser, setWysKieser] = useState(false)
  const [wysInstel, setWysInstel] = useState(false)
  const [grootte, setGrootte]     = useState(() => lees('byb_grootte', 17))
  const [tema, setTema]           = useState(() => lees('byb_tema', 'lig'))
  const bodyRef = useRef(null)

  const weergawe = weergawes.find(w => w.id === weergaweId) || null

  useEffect(() => { stoor('byb_weergawe', weergaweId) }, [weergaweId])
  useEffect(() => { stoor('byb_grootte', grootte) }, [grootte])
  useEffect(() => { stoor('byb_tema', tema) }, [tema])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }, [view, boek, hoofstuk])

  // ── Weergawes laai ──
  useEffect(() => {
    if (weergaweKas) return
    setLaai(true)
    haal('/v1/bibles', { 'language_ranges[]': 'eng' })
      .then(d => {
        const lys = (d && (d.data || d.bibles)) || []
        weergaweKas = lys
        setWeergawes(lys)
        if (!lys.some(w => w.id === weergaweId) && lys.length) setWeergaweId(lys[0].id)
      })
      .catch(e => setFout('Kon nie die Bybels laai nie (' + e.message + ')'))
      .finally(() => setLaai(false))
  }, [])

  // ── Hoofstukke van 'n boek ──
  const laaiHoofstukke = useCallback(async (boekKode) => {
    const sleutel = weergaweId + ':' + boekKode
    if (hoofstukKas[sleutel]) { setHoofstukke(hoofstukKas[sleutel]); return }
    setLaai(true); setFout(null)
    try {
      const d = await haal(`/v1/bibles/${weergaweId}/books/${boekKode}/chapters`)
      const lys = (d && (d.data || d.chapters)) || []
      hoofstukKas[sleutel] = lys
      setHoofstukke(lys)
    } catch (e) {
      setFout('Kon nie die hoofstukke laai nie (' + e.message + ')')
    } finally { setLaai(false) }
  }, [weergaweId])

  // ── Teks van 'n hoofstuk ──
  const laaiTeks = useCallback(async (boekKode, nr) => {
    const usfm    = `${boekKode}.${nr}`
    const sleutel = weergaweId + ':' + usfm
    if (teksKas[sleutel]) { setInhoud(teksKas[sleutel]); return }
    setLaai(true); setFout(null); setInhoud(null)
    try {
      const d = await haal(`/v1/bibles/${weergaweId}/passages/${usfm}`, { format: 'html' })
      teksKas[sleutel] = d
      setInhoud(d)
    } catch (e) {
      setFout('Kon nie die teks laai nie (' + e.message + ')')
    } finally { setLaai(false) }
  }, [weergaweId])

  function openBoek(kode) {
    setBoek(kode); setHoofstukke([]); setView('hoofstukke')
    laaiHoofstukke(kode)
  }

  function openHoofstuk(nr) {
    setHoofstuk(nr); setView('lees')
    laaiTeks(boek, nr)
    stoor('byb_laaste', { boek, hoofstuk: nr })
  }

  function blaai(rigting) {
    const nr = hoofstuk + rigting
    if (nr < 1 || nr > hoofstukke.length) return
    setHoofstuk(nr)
    laaiTeks(boek, nr)
    stoor('byb_laaste', { boek, hoofstuk: nr })
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }

  function kiesWeergawe(id) {
    setWeergaweId(id)
    setWysKieser(false)
    if (view === 'lees' && boek && hoofstuk) {
      const usfm = `${boek}.${hoofstuk}`
      if (teksKas[id + ':' + usfm]) setInhoud(teksKas[id + ':' + usfm])
      else {
        setLaai(true); setInhoud(null)
        haal(`/v1/bibles/${id}/passages/${usfm}`, { format: 'html' })
          .then(d => { teksKas[id + ':' + usfm] = d; setInhoud(d) })
          .catch(e => setFout('Kon nie die teks laai nie (' + e.message + ')'))
          .finally(() => setLaai(false))
      }
    }
  }

  const boeke   = (weergawe && weergawe.books) || []
  const ntIndex = boeke.indexOf(NT_EERSTE)
  const ot      = ntIndex >= 0 ? boeke.slice(0, ntIndex) : boeke
  const nt      = ntIndex >= 0 ? boeke.slice(ntIndex)    : []

  const gesorteerdeWeergawes = [...weergawes].sort((a, b) => {
    const ia = VOORKEUR.indexOf(a.abbreviation), ib = VOORKEUR.indexOf(b.abbreviation)
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    return (a.abbreviation || '').localeCompare(b.abbreviation || '')
  })

  const titel = view === 'lees' && boek
    ? `${boekNaam(boek)} ${hoofstuk}`
    : view === 'hoofstukke' && boek
      ? boekNaam(boek)
      : 'Bybel'

  return (
    <div className={`byb-overlay byb-${tema}`}>
      <div className="byb-screen">

        {/* ── Kop ── */}
        <div className="byb-header">
          <button
            className="byb-back"
            onClick={() => {
              if (view === 'lees')            { setView('hoofstukke') }
              else if (view === 'hoofstukke') { setView('boeke'); setBoek(null) }
              else                            { onClose() }
            }}
            aria-label="Terug"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <button className="byb-titel" onClick={() => { setView('boeke'); setBoek(null) }}>
            {titel}
          </button>

          <button className="byb-weergawe-knop" onClick={() => setWysKieser(v => !v)}>
            {weergawe ? weergawe.abbreviation : '…'}
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          <button className="byb-ikoon" onClick={() => setWysInstel(v => !v)} aria-label="Instellings">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h10M18 7h2M4 17h4M12 17h8"/>
              <circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>
            </svg>
          </button>

          <button className="byb-ikoon" onClick={onClose} aria-label="Sluit">✕</button>
        </div>

        {/* ── Weergawe-kieser ── */}
        {wysKieser && (
          <div className="byb-paneel">
            <div className="byb-paneel-titel">Vertaling</div>
            <div className="byb-weergawe-lys">
              {gesorteerdeWeergawes.map(w => (
                <button
                  key={w.id}
                  className={`byb-weergawe-item${w.id === weergaweId ? ' aktief' : ''}`}
                  onClick={() => kiesWeergawe(w.id)}
                >
                  <b>{w.abbreviation}</b>
                  <span>{w.localized_title || w.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Instellings ── */}
        {wysInstel && (
          <div className="byb-paneel">
            <div className="byb-paneel-titel">Lettergrootte</div>
            <div className="byb-knoppe">
              {GROOTTES.map(g => (
                <button
                  key={g}
                  className={`byb-chip${g === grootte ? ' aktief' : ''}`}
                  onClick={() => setGrootte(g)}
                  style={{ fontSize: Math.round(g * 0.75) }}
                >
                  A
                </button>
              ))}
            </div>
            <div className="byb-paneel-titel" style={{ marginTop: 14 }}>Agtergrond</div>
            <div className="byb-knoppe">
              {TEMAS.map(t => (
                <button
                  key={t.id}
                  className={`byb-chip byb-tema-${t.id}${t.id === tema ? ' aktief' : ''}`}
                  onClick={() => setTema(t.id)}
                >
                  {t.naam}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Lyf ── */}
        <div className="byb-body" ref={bodyRef}>

          {fout && <div className="byb-fout">{fout}</div>}

          {laai && !inhoud && <div className="byb-laai">Laai…</div>}

          {view === 'boeke' && !laai && (
            <>
              {ot.length > 0 && (
                <>
                  <div className="byb-afdeling">Ou Testament</div>
                  <div className="byb-rooster">
                    {ot.map(k => (
                      <button key={k} className="byb-boek" onClick={() => openBoek(k)}>
                        {boekNaam(k)}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {nt.length > 0 && (
                <>
                  <div className="byb-afdeling">Nuwe Testament</div>
                  <div className="byb-rooster">
                    {nt.map(k => (
                      <button key={k} className="byb-boek" onClick={() => openBoek(k)}>
                        {boekNaam(k)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {view === 'hoofstukke' && !laai && (
            <div className="byb-rooster byb-rooster-nommers">
              {hoofstukke.map((h, i) => {
                const nr = h.title || h.id || (i + 1)
                return (
                  <button key={i} className="byb-nommer" onClick={() => openHoofstuk(Number(nr) || i + 1)}>
                    {nr}
                  </button>
                )
              })}
            </div>
          )}

          {view === 'lees' && inhoud && (
            <>
              <div
                className="byb-teks"
                style={{ fontSize: grootte }}
                dangerouslySetInnerHTML={{ __html: inhoud.content || '' }}
              />

              <div className="byb-blaai">
                <button
                  className="byb-blaai-knop"
                  disabled={hoofstuk <= 1}
                  onClick={() => blaai(-1)}
                >
                  ← Vorige
                </button>
                <button
                  className="byb-blaai-knop"
                  disabled={hoofstuk >= hoofstukke.length}
                  onClick={() => blaai(1)}
                >
                  Volgende →
                </button>
              </div>

              <p className="byb-erkenning">
                {weergawe ? (weergawe.localized_title || weergawe.title) : ''}
                {' · verskaf deur YouVersion'}
              </p>
            </>
          )}

          <div style={{ height: 40 }} />
        </div>
      </div>
    </div>
  )
}
