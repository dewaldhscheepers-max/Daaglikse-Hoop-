import { useState, useEffect, useRef, useCallback } from 'react'
import './Bybel.css'
import { boekNaam, NT_EERSTE } from '../data/bybelBoeke'

const API = '/api/bible?path='

// Goedgekeurde vertalings. Slegs hierdie word gewys, en dan net dié wat die
// API werklik vir hierdie toepassing beskikbaar stel.
const AANBEVEEL = ['NIV11', 'KJV', 'AMP', 'BSB', 'NIrV']
const MEER      = ['NASB2020', 'NASB1995', 'NIVUK11', 'FBV', 'LSV', 'EASY', 'engWEBUS']

// Die API se afkorting vir die King James kan verskil — aanvaar enige amptelike vorm
const KJV_ALIASE = ['KJV', 'KJV1769', 'AKJV']

const NAME = {
  NIV11:    'New International Version',
  KJV:      'King James Version',
  AMP:      'Amplified Bible',
  BSB:      'Berean Standard Bible',
  NIrV:     "New International Reader's Version",
  NASB2020: 'New American Standard Bible 2020',
  NASB1995: 'New American Standard Bible 1995',
  NIVUK11:  'New International Version, Anglicised',
  FBV:      'Free Bible Version',
  LSV:      'Literal Standard Version',
  EASY:     'EasyEnglish Bible 2024',
  engWEBUS: 'World English Bible',
}

let weergaweKas = null
const hoofstukKas = {}
const teksKas     = {}

function lees(k, verstek) {
  try { const v = localStorage.getItem(k); return v == null ? verstek : JSON.parse(v) } catch { return verstek }
}
function stoor(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

async function haal(pad, params = {}) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => qs.append(k, v))
  const url = API + encodeURIComponent(pad) + (qs.toString() ? '&' + qs.toString() : '')
  const r = await fetch(url, { headers: { accept: 'application/json' } })
  if (!r.ok) throw new Error('HTTP ' + r.status)
  return r.json()
}

// Gee die sleutel waaronder ons hierdie weergawe ken, of null as dit nie goedgekeur is nie
function goedgekeurdeSleutel(afk) {
  if (!afk) return null
  if (KJV_ALIASE.includes(afk)) return 'KJV'
  if (AANBEVEEL.includes(afk) || MEER.includes(afk)) return afk
  return null
}

export default function Bybel({ onClose }) {
  const [view, setView]             = useState('boeke')
  const [weergawes, setWeergawes]   = useState(weergaweKas || [])
  const [weergaweId, setWeergaweId] = useState(() => lees('byb_weergawe', null))
  const [boek, setBoek]             = useState(null)
  const [hoofstukke, setHoofstukke] = useState([])
  const [hoofstuk, setHoofstuk]     = useState(null)
  const [inhoud, setInhoud]         = useState(null)
  const [laai, setLaai]             = useState(false)
  const [fout, setFout]             = useState(null)
  const [blad, setBlad]             = useState(false)   // bottom sheet
  const bodyRef = useRef(null)

  const weergawe = weergawes.find(w => w.id === weergaweId) || null
  const sleutel  = weergawe ? goedgekeurdeSleutel(weergawe.abbreviation) : null

  useEffect(() => { if (weergaweId) stoor('byb_weergawe', weergaweId) }, [weergaweId])
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = 0 }, [view, boek, hoofstuk])

  // ── Weergawes laai en filtreer tot die goedgekeurde lys ──
  useEffect(() => {
    if (weergaweKas) return
    setLaai(true)
    haal('/v1/bibles', { 'language_ranges[]': 'eng' })
      .then(d => {
        const rou = (d && (d.data || d.bibles)) || []
        const lys = rou.filter(w => goedgekeurdeSleutel(w.abbreviation))
        weergaweKas = lys
        setWeergawes(lys)

        const gestoor = lees('byb_weergawe', null)
        if (gestoor && lys.some(w => w.id === gestoor)) return
        const kies = k => lys.find(w => goedgekeurdeSleutel(w.abbreviation) === k)
        const verstek = kies('KJV') || kies('NIV11') || lys[0]
        if (verstek) setWeergaweId(verstek.id)
      })
      .catch(e => setFout('Kon nie die Bybels laai nie (' + e.message + ')'))
      .finally(() => setLaai(false))
  }, [])

  const laaiHoofstukke = useCallback(async (kode, wId) => {
    const s = wId + ':' + kode
    if (hoofstukKas[s]) { setHoofstukke(hoofstukKas[s]); return }
    setLaai(true); setFout(null)
    try {
      const d = await haal(`/v1/bibles/${wId}/books/${kode}/chapters`)
      const lys = (d && (d.data || d.chapters)) || []
      hoofstukKas[s] = lys
      setHoofstukke(lys)
    } catch (e) { setFout('Kon nie die hoofstukke laai nie (' + e.message + ')') }
    finally { setLaai(false) }
  }, [])

  const laaiTeks = useCallback(async (kode, nr, wId) => {
    const usfm = `${kode}.${nr}`
    const s = wId + ':' + usfm
    if (teksKas[s]) { setInhoud(teksKas[s]); return }
    setLaai(true); setFout(null); setInhoud(null)
    try {
      const d = await haal(`/v1/bibles/${wId}/passages/${usfm}`, { format: 'html' })
      teksKas[s] = d
      setInhoud(d)
    } catch (e) { setFout('Kon nie die teks laai nie (' + e.message + ')') }
    finally { setLaai(false) }
  }, [])

  function openBoek(kode) {
    setBoek(kode); setHoofstukke([]); setView('hoofstukke')
    laaiHoofstukke(kode, weergaweId)
  }

  function openHoofstuk(nr) {
    setHoofstuk(nr); setView('lees')
    laaiTeks(boek, nr, weergaweId)
  }

  function blaaiNa(nr) {
    if (nr < 1 || nr > hoofstukke.length) return
    setHoofstuk(nr)
    laaiTeks(boek, nr, weergaweId)
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }

  // Een druk kies, maak toe, hou boek en hoofstuk
  function kiesWeergawe(id) {
    setWeergaweId(id)
    setBlad(false)
    if (boek) laaiHoofstukke(boek, id)
    if (view === 'lees' && boek && hoofstuk) laaiTeks(boek, hoofstuk, id)
  }

  const boeke   = (weergawe && weergawe.books) || []
  const ntIndex = boeke.indexOf(NT_EERSTE)
  const ot      = ntIndex >= 0 ? boeke.slice(0, ntIndex) : boeke
  const nt      = ntIndex >= 0 ? boeke.slice(ntIndex)    : []

  function groep(lys) {
    return lys
      .map(k => weergawes.find(w => goedgekeurdeSleutel(w.abbreviation) === k))
      .filter(Boolean)
  }
  const aanbeveel = groep(AANBEVEEL)
  const meer      = groep(MEER)

  const titel = view === 'lees' && boek ? `${boekNaam(boek)} ${hoofstuk}`
              : view === 'hoofstukke' && boek ? boekNaam(boek)
              : 'Bybel'

  return (
    <div className="byb-overlay">
      <div className="byb-screen">

        <div className="byb-header">
          <button
            className="byb-back"
            onClick={() => {
              if (view === 'lees') setView('hoofstukke')
              else if (view === 'hoofstukke') { setView('boeke'); setBoek(null) }
              else onClose()
            }}
            aria-label="Terug"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span className="byb-titel">{titel}</span>
          <button className="byb-sluit" onClick={onClose} aria-label="Sluit">✕</button>
        </div>

        <div className="byb-body" ref={bodyRef}>

          {/* Vertaling — altyd sigbaar */}
          {weergawe && (
            <button className="byb-vertaling-kaart" onClick={() => setBlad(true)}>
              <span className="byb-vertaling-afk">{sleutel}</span>
              <span className="byb-vertaling-naam">{NAME[sleutel] || weergawe.title}</span>
              <span className="byb-vertaling-wissel">
                Verander vertaling
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </span>
            </button>
          )}

          {fout && <div className="byb-fout">{fout}</div>}
          {laai && !inhoud && <div className="byb-laai">Laai…</div>}

          {view === 'boeke' && !laai && (
            <>
              {ot.length > 0 && <>
                <div className="byb-afdeling">Ou Testament</div>
                <div className="byb-rooster">
                  {ot.map(k => <button key={k} className="byb-boek" onClick={() => openBoek(k)}>{boekNaam(k)}</button>)}
                </div>
              </>}
              {nt.length > 0 && <>
                <div className="byb-afdeling">Nuwe Testament</div>
                <div className="byb-rooster">
                  {nt.map(k => <button key={k} className="byb-boek" onClick={() => openBoek(k)}>{boekNaam(k)}</button>)}
                </div>
              </>}
            </>
          )}

          {view === 'hoofstukke' && !laai && (
            <div className="byb-rooster byb-rooster-nommers">
              {hoofstukke.map((h, i) => {
                const nr = Number(h.title || h.id || i + 1) || i + 1
                return <button key={i} className="byb-nommer" onClick={() => openHoofstuk(nr)}>{nr}</button>
              })}
            </div>
          )}

          {view === 'lees' && inhoud && (
            <>
              <div className="byb-teks" dangerouslySetInnerHTML={{ __html: inhoud.content || '' }} />
              <div className="byb-blaai">
                <button className="byb-blaai-knop" disabled={hoofstuk <= 1} onClick={() => blaaiNa(hoofstuk - 1)}>← Vorige</button>
                <button className="byb-blaai-knop" disabled={hoofstuk >= hoofstukke.length} onClick={() => blaaiNa(hoofstuk + 1)}>Volgende →</button>
              </div>
              <p className="byb-erkenning">{NAME[sleutel] || ''} · verskaf deur YouVersion</p>
            </>
          )}

          <div style={{ height: 44 }} />
        </div>
      </div>

      {/* ── Bottom sheet ── */}
      {blad && (
        <>
          <div className="byb-blad-agter" onClick={() => setBlad(false)} />
          <div className="byb-blad" role="dialog" aria-label="Kies jou Bybelvertaling">
            <div className="byb-blad-gryp" />
            <h2 className="byb-blad-titel">Kies jou Bybelvertaling</h2>
            <div className="byb-blad-lys">
              {aanbeveel.length > 0 && <div className="byb-blad-afdeling">Aanbeveel</div>}
              {aanbeveel.map(w => {
                const s = goedgekeurdeSleutel(w.abbreviation)
                return (
                  <button key={w.id} className={`byb-blad-item${w.id === weergaweId ? ' aktief' : ''}`} onClick={() => kiesWeergawe(w.id)}>
                    <span className="byb-blad-afk">{s}</span>
                    <span className="byb-blad-naam">{NAME[s] || w.title}</span>
                    {w.id === weergaweId && (
                      <svg className="byb-blad-vink" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                )
              })}

              {meer.length > 0 && <div className="byb-blad-afdeling">Meer vertalings</div>}
              {meer.map(w => {
                const s = goedgekeurdeSleutel(w.abbreviation)
                return (
                  <button key={w.id} className={`byb-blad-item${w.id === weergaweId ? ' aktief' : ''}`} onClick={() => kiesWeergawe(w.id)}>
                    <span className="byb-blad-afk">{s}</span>
                    <span className="byb-blad-naam">{NAME[s] || w.title}</span>
                    {w.id === weergaweId && (
                      <svg className="byb-blad-vink" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
