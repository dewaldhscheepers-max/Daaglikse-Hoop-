import { useState, useEffect, useRef, useCallback } from 'react'
import './Bybel.css'
import { BOEKE, boekNaam, NT_EERSTE } from '../data/bybelBoeke'
import { bibleSaSkakel } from '../data/bibleSa'
import {
  GAB_ID, GAB_AFK, GAB_ERKENNING,
  gabIndeks, gabWeergawe, gabHoofstukke, gabTeks,
  soekTeks, gabVerwysings,
} from '../data/gab'

const API = '/api/bible?path='

// Goedgekeurde vertalings. Slegs hierdie word gewys, en dan net dié wat die
// API werklik vir hierdie toepassing beskikbaar stel.
//
// Die Afrikaanse een staan apart, want hy kom nie van YouVersion af nie —
// sien src/data/gab.js. Hy verskyn heel bo, want dit is 'n Afrikaanse app.
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
  [GAB_AFK]: GAB_ERKENNING.naam,
}

/* Net die ENGELSE lys word gekas.

   Voorheen is die saamgevoegde lys gekas, en die effek het by elke oopmaak
   dadelik teruggekeer as daar 'n kas was. Was die GAB op daardie oomblik nie
   bereikbaar nie — die foon aflyn, die ontplooiing halfpad — het die
   Afrikaans-afdeling weggebly tot die hele bladsy herlaai is. Toemaak en
   weer oopmaak het niks gehelp nie.

   Nou vra ons die GAB by elke oopmaak (gabIndeks() onthou 'n sukses en
   herprobeer 'n mislukking), en net die Engelse lys — die duur netwerkoproep
   — word gehou. */
let engelsKas = null
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
  if (afk === GAB_AFK) return GAB_AFK
  if (KJV_ALIASE.includes(afk)) return 'KJV'
  if (AANBEVEEL.includes(afk) || MEER.includes(afk)) return afk
  return null
}

// "Joh 3:16", "genesis 1", "1 kor 13" → { kode, hoofstuk, vers }
function ontleedVerwysing(vraag, beskikbaar) {
  const skoon = vraag.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!skoon) return null
  const m = skoon.match(/^(.+?)\s*(\d+)?\s*[:.]?\s*(\d+)?$/)
  if (!m) return null
  const naamDeel = (m[1] || '').trim()
  if (!naamDeel) return null

  let beste = null
  for (const kode of beskikbaar) {
    const naam = (BOEKE[kode] || kode).toLowerCase()
    const kort = kode.toLowerCase()
    if (naam === naamDeel || kort === naamDeel) { beste = kode; break }
    if (naam.startsWith(naamDeel) || kort.startsWith(naamDeel)) {
      if (!beste) beste = kode
    }
  }
  if (!beste) return null
  return { kode: beste, hoofstuk: m[2] ? parseInt(m[2]) : 1, vers: m[3] ? parseInt(m[3]) : null }
}

// Die API gee los teks ná elke versmerker. Draai elke vers in 'n tikbare blok.
function omhulVerse(root) {
  if (!root || root.dataset.omhul === '1') return
  const merkers = Array.from(root.querySelectorAll('.yv-v'))
  if (!merkers.length) return
  const ouers = new Set(merkers.map(m => m.parentNode).filter(Boolean))

  ouers.forEach(ouer => {
    const kinders = Array.from(ouer.childNodes)
    const groepe = []
    let huidige = null
    kinders.forEach(node => {
      const isMerker = node.nodeType === 1 && node.classList && node.classList.contains('yv-v')
      if (isMerker) { huidige = { v: node.getAttribute('v'), nodes: [node] }; groepe.push(huidige) }
      else if (huidige) { huidige.nodes.push(node) }
      else { groepe.push({ v: null, nodes: [node] }) }
    })
    const frag = document.createDocumentFragment()
    groepe.forEach(g => {
      if (g.v == null) { g.nodes.forEach(n => frag.appendChild(n)); return }
      const sp = document.createElement('span')
      sp.className = 'byb-vers'
      sp.setAttribute('data-v', g.v)
      g.nodes.forEach(n => sp.appendChild(n))
      frag.appendChild(sp)
    })
    ouer.appendChild(frag)
  })
  root.dataset.omhul = '1'
}

/* Merk die gedeelte wat gelees moet word.
 *
 * Dit is 'n KLAS op verse wat reeds bestaan — die GAB se teks word met geen
 * karakter verander nie, en die erkenning bly onaangeraak. Dit is presies soos
 * 'n merkpen: dieselfde bladsy, net sigbaar waar 'n mens moet lees. */
/* `spanne` is 'n lys { van, tot } — meer as een wanneer 'n gedeelte soos
   "Johannes 6:26–27, 66–69" twee los stukke in DIESELFDE hoofstuk is. Elke
   stuk kry sy eie "gemerk-eerste"/"gemerk-laaste", anders lyk dit of hulle
   een deurlopende gedeelte is. */
function merkGedeelte(root, spanne) {
  if (!root) return
  root.querySelectorAll('.byb-vers.gemerk, .byb-vers.gemerk-eerste, .byb-vers.gemerk-laaste')
      .forEach(el => el.classList.remove('gemerk', 'gemerk-eerste', 'gemerk-laaste'))
  for (const { van, tot } of spanne || []) {
    const a = Number(van)
    if (!Number.isInteger(a) || a < 1) continue
    const b = Number.isInteger(Number(tot)) && Number(tot) >= a ? Number(tot) : a
    for (let v = a; v <= b; v++) {
      const el = root.querySelector(`.byb-vers[data-v="${v}"]`)
      if (!el) continue
      el.classList.add('gemerk')
      if (v === a) el.classList.add('gemerk-eerste')
      if (v === b) el.classList.add('gemerk-laaste')
    }
  }
}

/* ── Ondersteun Daaglikse Hoop ──

   Hierdie blok was 'n ruk lank heeltemal van die Bybelskerm af weg, want die
   GAB se lisensie is NIE-KOMMERSIEEL en twee geldknoppies onder Bybelteks is
   die prentjie wat dit ondermyn.

   Dewald wou dit terug he, en na sy bewoording is dit verdedigbaar. CC se eie
   uitleg is dat "nie-kommersieel" gaan oor gebruik wat HOOFSAAKLIK op
   kommersiele voordeel gerig is — nie oor elke sent wat 'n bediening ooit
   hanteer nie. Wat die saak maak of breek, is die konteks, en die konteks is
   hier reg:

     · die Bybel is gratis en toegang hang van geen betaling af nie;
     · daar is geen betaalmuur en geen advertensie nie;
     · dit is 'n bediening wat om ondersteuning vra, nie 'n winkel nie;
     · en die eerste sin se dit hardop: "Die Bybel sal altyd gratis bly."

   Daardie eerste sin is nie versiering nie. Dit is die ding wat die
   nie-kommersiele posisie STERKER maak, en dit mag nie uitval nie.

   Waar dit staan, maak ook saak. Dit is op die BOEKELYS, nie onder die
   Skrifteks self nie. Die skerm waar 'n mens werklik lees, bly die een plek
   in die app waar niemand ooit om geld gevra word nie. */
function Steun() {
  return (
    <div className="byb-steun">
      <p className="byb-steun-teks">
        Die Bybel sal altyd gratis bly. As Daaglikse Hoop jou al bemoedig,
        gehelp of nader aan God gebring het, kan jy help om hierdie bediening
        gratis vir ander aan die gang te hou.
      </p>
      <button
        className="byb-steun-knop byb-steun-primer"
        onClick={() => window.dispatchEvent(new CustomEvent('open-hoop-vennoot'))}
      >
        Ondersteun Daaglikse Hoop — maandeliks
      </button>
      <button
        className="byb-steun-knop byb-steun-spook"
        onClick={() => window.dispatchEvent(new CustomEvent('open-donation'))}
      >
        Eenmalige bydrae
      </button>
    </div>
  )
}

export default function Bybel({ onClose, beginBy = null }) {
  const [view, setView]             = useState('boeke')
  const [weergawes, setWeergawes]   = useState([])
  const [weergaweId, setWeergaweId] = useState(() => lees('byb_weergawe', null))
  const [boek, setBoek]             = useState(null)
  const [hoofstukke, setHoofstukke] = useState([])
  const [hoofstuk, setHoofstuk]     = useState(null)
  const [inhoud, setInhoud]         = useState(null)
  const [laai, setLaai]             = useState(false)
  const [fout, setFout]             = useState(null)
  const [blad, setBlad]             = useState(false)   // vertaling-blad
  const [soek, setSoek]             = useState('')
  const [laaste, setLaaste]         = useState(() => lees('byb_laaste', null))
  /* Waarheen ons wil spring, en watter gedeelte gemerk moet word. Dit bly
     staan totdat die teks werklik in die bladsy is — sien springNa(). */
  const [doel, setDoel]             = useState(null)
  const doelRef                     = useRef(null)
  const [gekose, setGekose]         = useState(null)     // aangetikte vers
  const [oorVertaling, setOorVertaling] = useState(false)  // GAB se erkenningsblad
  const [teksSoek, setTeksSoek]     = useState(null)     // { besig, treffers, totaal }
  const [verwysings, setVerwysings] = useState([])       // vir die aangetikte vers
  const [wysAlleKruis, setWysAlleKruis] = useState(false)
  const bodyRef = useRef(null)
  const teksRef = useRef(null)

  const weergawe = weergawes.find(w => w.id === weergaweId) || null
  const sleutel  = weergawe ? goedgekeurdeSleutel(weergawe.abbreviation) : null

  useEffect(() => { if (weergaweId) stoor('byb_weergawe', weergaweId) }, [weergaweId])
  /* Bo-toe by 'n nuwe hoofstuk — MAAR nie wanneer ons juis na 'n gedeelte op
     pad is nie.
   *
   * Die hek is 'n VERWYSING, nie die toestand nie. Met `doel` in die
   * afhanklikhede het hierdie effek weer gevuur op die oomblik dat die
   * spring-effek `setDoel(null)` doen — en toe rol dit die bladsy terug
   * boontoe, net nadat ons by die regte vers gestop het. Die vers was reg;
   * die skerm het by vers 1 gestaan. */
  useEffect(() => {
    if (doelRef.current) return
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }, [view, boek, hoofstuk])

  /* ── Weergawes laai ──

     Twee bronne, en hulle moet mekaar nie kan doodmaak nie:

     · die GAB uit ons eie lêers, wat aflyn werk en altyd daar is;
     · die Engelses van YouVersion, wat 'n bediener en 'n netwerk verg.

     Daarom loop hulle langs mekaar en word albei se mislukking apart
     hanteer. Is die netwerk weg, bly die Afrikaanse Bybel staan. Is die
     GAB-lêers nog nie ontplooi nie, is die app presies soos hy was. */
  useEffect(() => {
    let lewendig = true
    setLaai(true)

    const engels = engelsKas
      ? Promise.resolve(engelsKas)
      : haal('/v1/bibles', { 'language_ranges[]': 'eng' })
          .then(d => {
            const rou = (d && (d.data || d.bibles)) || []
            const lys = rou.filter(w => goedgekeurdeSleutel(w.abbreviation))
            engelsKas = lys
            return lys
          })
          .catch(() => null)   // null beteken "kon nie", [] beteken "niks gekry"

    Promise.all([gabIndeks(), engels]).then(([ind, eng]) => {
      if (!lewendig) return
      const afr = ind ? [gabWeergawe(ind)] : []
      const lys = [...afr, ...(eng || [])]

      if (!lys.length) {
        setFout('Kon nie die Bybels laai nie. Kyk of jy aanlyn is.')
        return
      }
      /* Is net die Engelses weg, is dit nie 'n fout wat die skerm moet oorneem
         nie — die Afrikaanse Bybel werk nog. Die vertalingblad wys dan bloot
         een vertaling. */
      setWeergawes(lys)

      const kies = k => lys.find(w => goedgekeurdeSleutel(w.abbreviation) === k)
      const gestoor = lees('byb_weergawe', null)
      const selfGekies = lees('byb_self_gekies', false)

      if (gestoor && lys.some(w => w.id === gestoor)) {
        /* Het die mens self gekies, bly ons daarby. Punt.

           Het HY NIE gekies nie, is die gestoorde een net wat destyds
           beskikbaar was — en toe was die GAB nog nie ontplooi nie, dus staan
           die hele bestaande gebruikersbasis op 'n Engelse vertaling wat
           niemand gevra het nie. Is die Afrikaanse een nou daar, skuif ons
           hulle oor. Dit is 'n Afrikaanse app. */
        const gab = kies(GAB_AFK)
        if (!selfGekies && gab && gestoor !== gab.id) setWeergaweId(gab.id)
        return
      }

      /* Die Afrikaanse een is die verstek in 'n Afrikaanse app. */
      const verstek = kies(GAB_AFK) || kies('KJV') || kies('NIV11') || lys[0]
      if (verstek) setWeergaweId(verstek.id)
    }).finally(() => { if (lewendig) setLaai(false) })

    return () => { lewendig = false }
  }, [])

  const laaiHoofstukke = useCallback(async (kode, wId) => {
    const s = wId + ':' + kode
    if (hoofstukKas[s]) { setHoofstukke(hoofstukKas[s]); return }
    setLaai(true); setFout(null)
    try {
      let lys
      if (wId === GAB_ID) lys = await gabHoofstukke(kode)
      else {
        const d = await haal(`/v1/bibles/${wId}/books/${kode}/chapters`)
        lys = (d && (d.data || d.chapters)) || []
      }
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
      const d = wId === GAB_ID
        ? await gabTeks(kode, nr)
        : await haal(`/v1/bibles/${wId}/passages/${usfm}`, { format: 'html' })
      teksKas[s] = d
      setInhoud(d)
    } catch (e) { setFout('Kon nie die teks laai nie (' + e.message + ')') }
    finally { setLaai(false) }
  }, [])

  function openBoek(kode) {
    setBoek(kode); setHoofstukke([]); setView('hoofstukke')
    laaiHoofstukke(kode, weergaweId)
  }

  function onthou(kode, nr) {
    const pos = { boek: kode, hoofstuk: nr }
    setLaaste(pos)
    stoor('byb_laaste', pos)
  }

  function openHoofstuk(nr) {
    setHoofstuk(nr); setView('lees')
    laaiTeks(boek, nr, weergaweId)
    onthou(boek, nr)
  }

  /* Spring direk na 'n boek en hoofstuk (vanaf soek, "gaan voort", of VOLG
     JESUS se LEES-knoppie).
   *
   * ── Hoekom hier GEEN tydhouer meer is ──
   *
   * Dit het `setTimeout(..., 400)` gedoen en dan die vers in die bladsy gesoek.
   * Die eerste keer moet die hoofstuk egter oor die netwerk kom, en die verse
   * word eers DAARNA omhul. Ná 400ms bestaan die vers nog nie, `if (el)` doen
   * stilweg niks, en 'n mens bly bo aan die hoofstuk staan.
   *
   * Dewald: "die bybel maak nooit presies oop nie. eerste keer as mens oopmaak
   * gooi dit altyd vers 1 uit."
   *
   * Die tweede keer is die hoofstuk gekas en dan haal dit die 400ms — daarom
   * het dit soms gewerk en soms nie. Ons onthou nou net WAARHEEN, en die
   * effek wat die verse omhul, spring soontoe sodra hulle werklik daar is. */
  /* `ekstraSpanne` is bykomende { van, tot }-stukke in DIESELFDE hoofstuk —
     "Johannes 6:26–27, 66–69" gee die eerste stuk as versNr/tot en die
     tweede hier. Sonder dit het die knoppie net die eerste stuk gemerk en
     die tweede het nooit oopgemaak of gemerk nie. */
  function springNa(kode, nr, versNr, tot, ekstraSpanne) {
    setBoek(kode); setHoofstuk(nr); setView('lees'); setSoek('')
    laaiHoofstukke(kode, weergaweId)
    laaiTeks(kode, nr, weergaweId)
    onthou(kode, nr)
    const d = versNr
      ? { spanne: [{ van: versNr, tot: tot || versNr }, ...(ekstraSpanne || [])] }
      : null
    doelRef.current = d
    setDoel(d)
  }

  function blaaiNa(nr) {
    if (nr < 1 || nr > hoofstukke.length) return
    /* 'n Ander hoofstuk is 'n ander gedeelte. Die merk hoort nie saam nie. */
    doelRef.current = null
    setDoel(null)
    setHoofstuk(nr)
    laaiTeks(boek, nr, weergaweId)
    onthou(boek, nr)
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }

  // Een druk kies, maak toe, hou boek en hoofstuk
  function kiesWeergawe(id) {
    setWeergaweId(id)
    /* Van nou af is dit die mens se eie keuse, en niks skuif dit weer nie. */
    stoor('byb_self_gekies', true)
    setBlad(false)
    if (boek) laaiHoofstukke(boek, id)
    if (view === 'lees' && boek && hoofstuk) laaiTeks(boek, hoofstuk, id)
  }

  useEffect(() => {
    if (view !== 'lees' || !inhoud || !teksRef.current) return
    omhulVerse(teksRef.current)

    /* Nou — en eers nou — bestaan die verse. Spring en merk. */
    if (!doel) return
    const wortel = teksRef.current
    merkGedeelte(wortel, doel.spanne)
    /* Bo, na die EERSTE stuk se begin-vers — 'n mens lees van bo af. */
    const eersteVan = doel.spanne[0] && doel.spanne[0].van
    const el = wortel.querySelector(`.byb-vers[data-v="${eersteVan}"]`)
    if (!el) return
    /* BO, nie in die middel nie. Dewald: "die eerste reel wat gelees moet word
       moet bo wys." `block: 'center'` het die vers in die middel gesit met
       teks bokant hom, en dan weet 'n mens nie waar om te begin nie.

       Ons rol die HOUER self in plaas van scrollIntoView, want 'n mens het 'n
       bietjie lug bo die vers nodig — anders druk hy teen die kopbalk vas. */
    const houer = bodyRef.current
    if (houer) {
      const bo = el.getBoundingClientRect().top - houer.getBoundingClientRect().top
      houer.scrollTop = Math.max(0, houer.scrollTop + bo - 14)
    } else {
      el.scrollIntoView({ block: 'start' })
    }
    /* Een keer. Blaai 'n mens dan self weg, moet dit hom nie terugpluk nie. */
    doelRef.current = null
    setDoel(null)
  }, [view, inhoud, doel])

  /* ── Maak direk by 'n gedeelte oop ──
   *
   * VOLG JESUS stuur mense hierheen om die week se Skrif te gaan lees. As die
   * Bybel by die boekelys oopmaak, moet 'n mens Johannes soek, dan hoofstuk 1
   * soek, en teen daardie tyd het die helfte opgegee. Die punt van daardie
   * knoppie is juis dat hulle die teks LEES.
   *
   * Dit gebruik `springNa`, dieselfde pad as die soekresultate en "gaan
   * voort" — geen nuwe laai-logika nie. Dit wag vir 'n weergawe, want
   * `laaiTeks` het een nodig, en dit loop net EEN keer. */
  const begonRef = useRef(false)
  useEffect(() => {
    if (begonRef.current || !beginBy || !weergaweId) return
    const { boek: b, hoofstuk: h, vers, versTot, ekstraSpanne } = beginBy
    if (!b || !h) return
    begonRef.current = true
    springNa(b, h, vers || null, versTot || vers || null, ekstraSpanne)
  }, [beginBy, weergaweId])   // eslint-disable-line react-hooks/exhaustive-deps

  function tikVers(e) {
    const el = e.target.closest && e.target.closest('.byb-vers')
    if (!el || !teksRef.current || !teksRef.current.contains(el)) return
    const v = el.getAttribute('data-v')
    const teks = (el.textContent || '').replace(/^\s*\d+\s*/, '').trim()
    if (!teks) return
    setGekose({ v, teks })
  }

  function versVerwysing() {
    return gekose ? `${boekNaam(boek)} ${hoofstuk}:${gekose.v}` : ''
  }

  async function kopieerVers() {
    const t = `"${gekose.teks}"\n\n— ${versVerwysing()} (${sleutel})`
    try { await navigator.clipboard.writeText(t) } catch {}
    setGekose(null)
  }

  async function deelVers() {
    const APP = 'https://dewaldscheepers.com/go'
    const teks = `"${gekose.teks}"\n\n— ${versVerwysing()} (${sleutel})\n\nGelees in Daaglikse Hoop — 'n gratis Afrikaanse app met daaglikse oordenkings, gebed, leesplanne en die Bybel.`
    try {
      if (navigator.share) await navigator.share({ title: versVerwysing(), text: teks, url: APP })
      else await navigator.clipboard.writeText(teks + '\n' + APP)
    } catch (err) {
      if (err && err.name !== 'AbortError') {
        try { await navigator.clipboard.writeText(teks + '\n' + APP) } catch {}
      }
    }
    setGekose(null)
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
  const soekTreffer = soek.trim() ? ontleedVerwysing(soek, boeke) : null

  /* ── Soek deur die teks ──

     Net vir die GAB, want net sy teks le op die toestel. Die eerste soektog
     laai die 66 lêers in; daarna is dit oombliklik. Ons wag 'n oomblik nadat
     iemand ophou tik het, sodat elke letter nie 'n soektog afskop nie. */
  useEffect(() => {
    const vraag = soek.trim()
    if (sleutel !== GAB_AFK || vraag.length < 3) { setTeksSoek(null); return }
    let lewendig = true
    setTeksSoek({ besig: true, treffers: [], totaal: 0 })
    const t = setTimeout(async () => {
      const uit = await soekTeks(vraag)
      if (lewendig) setTeksSoek({ besig: false, ...uit })
    }, 260)
    return () => { lewendig = false; clearTimeout(t) }
  }, [soek, sleutel])

  /* Die aangetikte vers se kruisverwysings. Dit trek een boek se lêer, en
     net wanneer iemand werklik 'n vers aantik.

     Dit werk vir ELKE vertaling, nie net die GAB nie. 'n Kruisverwysing is
     bloot 'n plek — boek, hoofstuk, vers — en daardie plek is dieselfde in
     enige Bybel. Ons stoor geen teks nie, dus is daar niks wat aan 'n
     vertaling se lisensie raak nie. Tik jy een aan, spring jy soontoe in die
     vertaling wat jy nou lees.

     Ons wys net verwysings na boeke wat die huidige vertaling werklik het,
     sodat 'n mens nooit 'n knoppie druk wat nêrens heen gaan nie. */
  useEffect(() => {
    if (!gekose || !boek || !hoofstuk) { setVerwysings([]); return }
    let lewendig = true
    setWysAlleKruis(false)
    gabVerwysings(boek, hoofstuk, Number(gekose.v)).then(v => {
      if (!lewendig) return
      const het = new Set(boeke)
      setVerwysings(het.size ? v.filter(([k]) => het.has(k)) : v)
    })
    return () => { lewendig = false }
  }, [gekose, boek, hoofstuk, weergaweId])

  const aanbeveel = groep(AANBEVEEL)
  const meer      = groep(MEER)
  /* Die GAB kom nie van YouVersion af nie, dus staan hy in sy eie groep en
     heel bo. Is die lêers nie ontplooi nie, is hierdie lys leeg en verander
     niks aan die skerm nie. */
  const afrikaans = weergawes.filter(w => w.bron === 'gab')

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
              <div className="byb-soek-wrap">
                <svg className="byb-soek-ikoon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className="byb-soek"
                  value={soek}
                  onChange={e => setSoek(e.target.value)}
                  placeholder={sleutel === GAB_AFK ? "Soek 'n woord of vers — bv. vergifnis" : "Soek 'n vers — bv. Joh 3:16"}
                  autoComplete="off"
                  spellCheck="false"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && soekTreffer) springNa(soekTreffer.kode, soekTreffer.hoofstuk, soekTreffer.vers)
                  }}
                />
                {soek && (
                  <button className="byb-soek-vee" onClick={() => setSoek('')} aria-label="Vee uit">✕</button>
                )}
              </div>

              {soek.trim() && (
                soekTreffer ? (
                  <button className="byb-treffer" onClick={() => springNa(soekTreffer.kode, soekTreffer.hoofstuk, soekTreffer.vers)}>
                    <span className="byb-treffer-naam">
                      {boekNaam(soekTreffer.kode)} {soekTreffer.hoofstuk}{soekTreffer.vers ? ':' + soekTreffer.vers : ''}
                    </span>
                    <span className="byb-treffer-gaan">Gaan soontoe →</span>
                  </button>
                ) : !teksSoek ? (
                  <p className="byb-geen-treffer">Geen boek gevind nie. Probeer bv. <b>Joh 3:16</b> of <b>Psalms 23</b>.</p>
                ) : null
              )}

              {/* ── Woorde, nie net verwysings nie ──
                  Die hele Afrikaanse Bybel le op die toestel, dus kan 'n mens
                  vir 'n woord soek sonder sein. Dit loop net wanneer iemand
                  tik; gewone lees raak dit nooit aan. */}
              {teksSoek && (
                teksSoek.besig ? (
                  <p className="byb-geen-treffer">Besig om die Bybel te deursoek…</p>
                ) : teksSoek.fout ? null : teksSoek.totaal === 0 ? (
                  <p className="byb-geen-treffer">Niks gevind vir <b>{soek.trim()}</b> nie.</p>
                ) : (
                  <>
                    <div className="byb-afdeling">
                      {teksSoek.totaal.toLocaleString('af-ZA')} {teksSoek.totaal === 1 ? 'vers' : 'verse'}
                      {teksSoek.totaal > teksSoek.treffers.length && ` · eerste ${teksSoek.treffers.length}`}
                    </div>
                    {teksSoek.treffers.map(t => (
                      <button
                        key={`${t.kode}.${t.hoofstuk}.${t.vers}`}
                        className="byb-soek-vers"
                        onClick={() => springNa(t.kode, t.hoofstuk, t.vers)}
                      >
                        <span className="byb-soek-vers-ref">{boekNaam(t.kode)} {t.hoofstuk}:{t.vers}</span>
                        <span className="byb-soek-vers-teks">{t.teks}</span>
                      </button>
                    ))}
                  </>
                )
              )}

              {!soek.trim() && laaste && BOEKE[laaste.boek] && (
                <button className="byb-voort" onClick={() => springNa(laaste.boek, laaste.hoofstuk)}>
                  <span className="byb-voort-label">Gaan voort waar jy was</span>
                  <span className="byb-voort-plek">{boekNaam(laaste.boek)} {laaste.hoofstuk} →</span>
                </button>
              )}

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
              <Steun />
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
              <div
                className="byb-teks"
                ref={teksRef}
                onClick={tikVers}
                dangerouslySetInnerHTML={{ __html: inhoud.content || '' }}
              />
              <div className="byb-blaai">
                <button className="byb-blaai-knop" disabled={hoofstuk <= 1} onClick={() => blaaiNa(hoofstuk - 1)}>← Vorige</button>
                <button className="byb-blaai-knop" disabled={hoofstuk >= hoofstukke.length} onClick={() => blaaiNa(hoofstuk + 1)}>Volgende →</button>
              </div>
              {/* Die Afrikaanse Bybel.

                  Die Bybelgenootskap van Suid-Afrika het skriftelik geweier
                  dat hul teks in 'n ander app ingesluit word, en het hierdie
                  pad self voorgestel: skakel na die vers op BibleSA.

                  Die GAB het hierdie knoppie nie oorbodig gemaak nie — baie
                  mense het by die 1953 of die 1983 grootgeword en soek juis
                  daardie bewoording. Dit is nou 'n tweede pad, nie die enigste
                  een nie. */}
              <a
                className="byb-afr-knop"
                href={bibleSaSkakel(boek, hoofstuk)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="byb-afr-hoof">Lees dit in die 1953 of 1983</span>
                <span className="byb-afr-fyn">{boekNaam(boek)} {hoofstuk} op BibleSA · Bybelgenootskap van SA</span>
              </a>

              {/* Erkenning. Vir die GAB is dit nie hoflikheid nie — die
                  CC BY-NC-ND-lisensie vereis die naam, die kopiereg, die
                  lisensie en 'n skakel na die bron oral waar die teks wys.
                  Haal dit nooit hier uit nie.

                  En let op wat NIE meer hier is nie: die Steun-blok met sy
                  twee geldknoppies. 'Nie-kommersieel' is 'n voorwaarde van
                  daardie lisensie, en twee betaalknoppies direk onder die
                  Bybelteks is presies die prentjie wat dit ondermyn. Die
                  Bybel is nou die een skerm in die app waar niemand ooit om
                  geld gevra word nie. */}
              {sleutel === GAB_AFK ? (
                <button className="byb-erkenning byb-erkenning-knop" onClick={() => setOorVertaling(true)}>
                  {GAB_ERKENNING.naam}{weergawe && weergawe.konsep ? ' · konsep' : ''} · &copy; {GAB_ERKENNING.kopiereg}<br />
                  {GAB_ERKENNING.lisensie} · onveranderd weergegee<br />
                  <u>Oor hierdie vertaling</u>
                </button>
              ) : (
                <p className="byb-erkenning">{NAME[sleutel] || ''} · verskaf deur YouVersion</p>
              )}
            </>
          )}

          <div style={{ height: 44 }} />
        </div>
      </div>

      {/* ── Vers-aksies ── */}
      {gekose && (
        <>
          <div className="byb-blad-agter" onClick={() => setGekose(null)} />
          <div className="byb-blad byb-vers-blad" role="dialog" aria-label="Vers">
            <div className="byb-blad-gryp" />
            <div className="byb-vers-kop">{versVerwysing()}</div>
            <p className="byb-vers-teks">{gekose.teks}</p>
            <div className="byb-vers-knoppe">
              <button className="byb-steun-knop byb-steun-primer" onClick={deelVers}>
                Deel hierdie vers
              </button>
              <button className="byb-steun-knop byb-steun-spook" onClick={kopieerVers}>
                Kopieer
              </button>
            </div>
            <p className="byb-vers-nota">Deel stuur ook 'n skakel na die app saam.</p>

            {/* ── Waar praat die Bybel nog hieroor? ──
                Die Treasury of Scripture Knowledge, met OpenBible.info se
                rangorde, dus staan die sterkste verwysings eerste. Dit is die
                soort ding wat 'n mens in 'n studeerbybel kry, en geen gratis
                Afrikaanse app het dit.

                Die lêer word eers gehaal wanneer iemand 'n vers aantik —
                gewone lees raak dit nooit aan. */}
            {verwysings.length > 0 && (
              <div className="byb-kruis">
                <div className="byb-kruis-kop">Waar praat die Bybel nog hieroor?</div>
                <div className="byb-kruis-lys">
                  {verwysings.slice(0, wysAlleKruis ? verwysings.length : 8).map(([k, h, v, tot], i) => (
                    <button
                      key={`${k}.${h}.${v}.${i}`}
                      className="byb-kruis-een"
                      onClick={() => { setGekose(null); springNa(k, h, v) }}
                    >
                      {boekNaam(k)} {h}:{v}{tot ? '-' + tot : ''}
                    </button>
                  ))}
                </div>
                {verwysings.length > 8 && !wysAlleKruis && (
                  <button className="byb-kruis-meer" onClick={() => setWysAlleKruis(true)}>
                    Wys al {verwysings.length}
                  </button>
                )}
                {/* CC BY eis erkenning oral waar die materiaal wys. Die
                    verwysings wys nou ook onder die Engelse vertalings, waar
                    die GAB se "Oor hierdie vertaling"-blad nie bestaan nie —
                    dus hoort die erkenning hier, by hulle. */}
                <p className="byb-kruis-bron">
                  Treasury of Scripture Knowledge · OpenBible.info (CC BY 4.0)
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Bottom sheet ── */}
      {blad && (
        <>
          <div className="byb-blad-agter" onClick={() => setBlad(false)} />
          <div className="byb-blad" role="dialog" aria-label="Kies jou Bybelvertaling">
            <div className="byb-blad-gryp" />
            <h2 className="byb-blad-titel">Kies</h2>
            <div className="byb-blad-lys">
              {/* Een reel, onder die opskrif. Die lang verduideliking oor die
                  1953 en die 1983 was te veel vir 'n keuseblad; wie meer wil
                  weet, kry dit op "Oor hierdie vertaling". */}
              {afrikaans.length > 0 && <>
                <div className="byb-blad-afdeling">Afrikaans</div>
                <p className="byb-blad-fyn">
                  Die Getroue Afrikaanse Bybel is 'n onafhanklike vertaling uit
                  die King James.
                </p>
              </>}
              {afrikaans.map(w => {
                const k = goedgekeurdeSleutel(w.abbreviation)
                return (
                  <button key={w.id} className={`byb-blad-item${w.id === weergaweId ? ' aktief' : ''}`} onClick={() => kiesWeergawe(w.id)}>
                    <span className="byb-blad-afk">{k}</span>
                    <span className="byb-blad-naam">{NAME[k] || w.title}</span>
                    {w.id === weergaweId && (
                      <svg className="byb-blad-vink" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                )
              })}

              {aanbeveel.length > 0 && <div className="byb-blad-afdeling">Engels — aanbeveel</div>}
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

              {meer.length > 0 && <div className="byb-blad-afdeling">Engels — meer</div>}
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
            {/* Die bouweergawe. Dit lyk na niks, maar dit is die enigste manier
                om op 'n skermkiekie te sien of iemand se app werklik die nuwe
                kode het — 'n geinstalleerde PWA kan dae lank op ou kode sit. */}
            <p className="byb-bou">weergawe {__BOU__}</p>
          </div>
        </>
      )}

      {/* ── Oor hierdie vertaling ──
          Die CC BY-NC-ND-lisensie vereis erkenning, die kopieregkennisgewing,
          die naam van die lisensie met 'n skakel, en 'n skakel na die
          oorspronklike materiaal. Dit is daardie blad. Moenie dit uithaal of
          agter 'n instelling wegsteek nie. */}
      {oorVertaling && (
        <>
          <div className="byb-blad-agter" onClick={() => setOorVertaling(false)} />
          <div className="byb-blad" role="dialog" aria-label="Oor hierdie vertaling">
            <div className="byb-blad-gryp" />
            <h2 className="byb-blad-titel">Oor hierdie vertaling</h2>

            {/* Die blad is hoer as 'n foonskerm. Sonder hierdie roller val die
                Maak toe-knoppie onderkant af — die blaaiertoets het dit gevang
                op 390x830. */}
            <div className="byb-oor-rol">
            <p className="byb-oor-teks">
              Die <b>{GAB_ERKENNING.naam}</b> is 'n onafhanklike Afrikaanse
              vertaling wat direk uit die 1769 Cambridge King James Bible
              gemaak is, met verwysing na die oorspronklike Hebreeus en Grieks
              waar nodig vir woordkeuse. Dit is <b>nie</b> 'n hersiening van
              die 1933/1953 Afrikaanse Bybel of enige ander bestaande
              vertaling nie.
            </p>

            <p className="byb-oor-teks">
              Die teks word hier <b>heeltemal onveranderd</b> weergegee. Sien
              jy 'n fout, rapporteer dit asseblief by die projek self — ons mag
              dit nie hier regmaak nie.
            </p>

            {weergawe && weergawe.konsep && (
              <p className="byb-oor-teks byb-oor-konsep">
                <b>Let wel:</b> hierdie vertaling word nog hersien. Wat jy hier
                lees, is die weergawe soos dit op {weergawe.weergawe} was.
                Van tyd tot tyd werk ons dit by.
              </p>
            )}

            <p className="byb-oor-teks byb-oor-fyn">
              &copy; {GAB_ERKENNING.kopiereg}. Beskikbaar onder die Creative
              Commons Erkenning&ndash;NieKommersieel&ndash;GeenAfgeleides 4.0
              Internasionaal-lisensie ({GAB_ERKENNING.lisensie}).
            </p>

            <p className="byb-oor-teks byb-oor-fyn">
              Die kruisverwysings kom uit die <i>Treasury of Scripture
              Knowledge</i> (publieke domein) saam met OpenBible.info se
              rangorde, gebruik onder die Creative Commons
              Erkenning 4.0-lisensie.
            </p>

            <p className="byb-oor-teks byb-oor-fyn">
              Daaglikse Hoop word nie deur die {GAB_ERKENNING.naam}-projek
              geborg of onderskryf nie.
            </p>

            <a className="byb-oor-skakel" href={GAB_ERKENNING.bron} target="_blank" rel="noopener noreferrer">
              Die vertaling se eie werf
              <small>{GAB_ERKENNING.bron.replace('https://', '')}</small>
            </a>
            <a className="byb-oor-skakel" href={GAB_ERKENNING.lisensieSkakel} target="_blank" rel="noopener noreferrer">
              Lees die lisensie
              <small>{GAB_ERKENNING.lisensie}</small>
            </a>
            </div>

            <button className="byb-oor-toe" onClick={() => setOorVertaling(false)}>Maak toe</button>
          </div>
        </>
      )}
    </div>
  )
}
