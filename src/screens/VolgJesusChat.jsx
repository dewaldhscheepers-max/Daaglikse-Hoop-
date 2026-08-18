/* ── Die groepchat ──
 *
 * Dewald: "dit kan werk soos die messages in sorg page ... en net refresh fast
 * live ... met hulle naam."
 *
 * Dit is 'n klein private WhatsApp-groep, nie 'n sosiale muur nie (§38). Net
 * die mense wat hierdie reis saam doen.
 *
 * ── Wat "lewendig" hier beteken ──
 *
 * Firestore se `onSnapshot`. 'n Boodskap verskyn by almal wat die chat oop het
 * binne 'n oomblik, sonder dat iets pols. Geen polling beteken ook geen
 * funksie-aanroep per sekonde maal ses duisend fone.
 *
 * ── Die drie dinge wat 'n chat stukkend laat voel ──
 *
 * 1. 'n Boodskap wat "verdwyn" terwyl dit stuur. Hier verskyn hy DADELIK,
 *    dof, met sy eie kliëntId — en wanneer die bediener hom terugstuur, is dit
 *    dieselfde dokument. Geen dubbele boodskap nie (§49).
 * 2. 'n Mislukte stuur wat stilbly. Hier bly die boodskap staan met 'n
 *    knoppie om weer te probeer, en die teks is NIE weg nie.
 * 3. Die klawerbord wat die laaste boodskap toemaak. Die lys skuif onder toe
 *    by elke nuwe boodskap en wanneer die klawerbord oopgaan.
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import {
  luister, stuur, veeUit, merkGelees, luisterLeesmerk, nuweKliëntId,
} from '../data/volgJesusChat'
import { keurBoodskap, MAKS_BOODSKAP, magUitvee, ongeleesTel } from '../data/volgJesusGroep'
import './VolgJesusChat.css'

/* Die vier vinnige aansette ná die stemboodskap (§40). Hulle vul die kassie —
   hulle STUUR nie. Die mens tik self en druk self. */
export const AANSETTE = [
  'Iets het my getref',
  'Ek het ’n vraag',
  'Ek sukkel hiermee',
  'Bid asseblief saam met my',
]

const tydWoorde = d => {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('af-ZA', { hour: '2-digit', minute: '2-digit' })
}

export default function VolgJesusChat({ groep, myLid, opSluit, aanset = '' }) {
  const groepId = groep && groep.id
  const myUid = myLid && myLid.uid

  const [boodskappe, setBoodskappe] = useState([])
  const [teks, setTeks]     = useState(aanset)
  const [besig, setBesig]   = useState(false)
  const [fout, setFout]     = useState('')
  /* Wat nog nie deur is nie. Elkeen hou sy eie kliëntId, sodat 'n herprobeer
     dieselfde dokument skryf. */
  const [hangend, setHangend] = useState([])
  const [wysPrivaat, setWysPrivaat] = useState(false)
  /* Watter boodskap se knoppies oop is. 'n "Verwyder" onder ELKE boodskap is
     visuele geraas — 'n fasiliteerder mag almal s'n modereer, en dan staan dit
     onder die hele gesprek. Nou kom dit op 'n tik. */
  const [oopBoodskap, setOopBoodskap] = useState(null)

  const onderRef = useRef(null)
  const lysRef   = useRef(null)

  /* Die privaatheidsreël wys EEN keer per toestel (§42). */
  useEffect(() => {
    try {
      if (!localStorage.getItem('vj_chat_privaat_gesien')) setWysPrivaat(true)
    } catch {}
  }, [])
  function verstaanPrivaat() {
    setWysPrivaat(false)
    try { localStorage.setItem('vj_chat_privaat_gesien', '1') } catch {}
  }

  /* Luister. Die afskakelaar loop wanneer die skerm toegaan — 'n luisteraar
     wat aanbly, hou 'n verbinding oop en werk teen die battery. */
  useEffect(() => {
    if (!groepId) return
    const af = luister(
      groepId,
      lys => {
        setBoodskappe(lys)
        /* Wat die bediener nou teruggee, is nie meer hangend nie. */
        setHangend(h => h.filter(x => !lys.some(b => b.id === x.id)))
      },
      f => {
        setFout(f && f.code === 'permission-denied'
          ? 'Jy is nie meer in hierdie groep nie.'
          : 'Die gesprek kon nie laai nie. Kyk of jy aanlyn is.')
      },
    )
    return af
  }, [groepId])

  /* Onder toe by elke nuwe boodskap. */
  useEffect(() => {
    if (onderRef.current) onderRef.current.scrollIntoView({ block: 'end' })
  }, [boodskappe.length, hangend.length])

  /* Alles wat op die skerm is, is gelees. Ons skryf die merk vir die LAASTE
     boodskap — nie vir elke een nie. */
  useEffect(() => {
    const laaste = boodskappe[boodskappe.length - 1]
    if (laaste && myUid) merkGelees(groepId, myUid, laaste.id)
  }, [boodskappe, groepId, myUid])

  const doenStuur = useCallback(async (rou) => {
    const gekeur = keurBoodskap(rou)
    if (!gekeur.ok) { if (gekeur.fout) setFout(gekeur.fout); return }

    const id = nuweKliëntId()
    const nou = { id, uid: myUid, naam: myLid.naam, teks: gekeur.waarde, geskep: new Date(), hangend: true }
    setHangend(h => [...h, nou])
    setTeks('')
    setFout('')
    setBesig(true)

    const r = await stuur(groepId, {
      uid: myUid, naam: myLid.naam, teks: gekeur.waarde, kliëntId: id,
    })
    setBesig(false)
    if (!r.ok) {
      if (r.fout) setFout(r.fout)
      /* Dit bly staan, met 'n knoppie. Die teks is nie weg nie. */
      setHangend(h => h.map(x => x.id === id ? { ...x, misluk: true } : x))
    }
  }, [groepId, myUid, myLid])

  async function probeerWeer(item) {
    setHangend(h => h.map(x => x.id === item.id ? { ...x, misluk: false } : x))
    const r = await stuur(groepId, {
      uid: myUid, naam: myLid.naam, teks: item.teks, kliëntId: item.id,
    })
    if (!r.ok) setHangend(h => h.map(x => x.id === item.id ? { ...x, misluk: true } : x))
  }

  const alles = [...boodskappe, ...hangend]
  const telling = keurBoodskap(teks).telling || 0
  const naByPerk = telling > MAKS_BOODSKAP - 300

  return (
    <div className="vc">
      <div className="vc-balk">
        <button className="vc-terug" onClick={opSluit} aria-label="Terug">‹</button>
        <div className="vc-balk-naam">
          <span className="vc-balk-groep">{groep.naam}</span>
          <span className="vc-balk-fyn">
            {groep.aantalLede || 0} {(groep.aantalLede || 0) === 1 ? 'lid' : 'lede'}
          </span>
        </div>
      </div>

      {/* §42. Een keer, en dan nooit weer nie. */}
      {wysPrivaat && (
        <div className="vc-privaat">
          <p>
            Alles wat jy hier plaas, kan deur almal in hierdie groep gesien word.
            <strong> Jou persoonlike VOLG JESUS-antwoorde bly privaat</strong> —
            hulle verlaat nooit jou foon nie.
          </p>
          <button onClick={verstaanPrivaat}>EK VERSTAAN</button>
        </div>
      )}

      <div className="vc-lys" ref={lysRef}>
        {alles.length === 0 && !fout && (
          <div className="vc-leeg">
            <p>Nog niks hier nie.</p>
            <p className="vc-leeg-fyn">
              Sê gerus hallo, of vertel wat jou vandag getref het.
            </p>
          </div>
        )}

        {alles.map((b, i) => {
          const myne = b.uid === myUid
          const vorige = alles[i - 1]
          const nuweSpreker = !vorige || vorige.uid !== b.uid
          if (b.uitgevee) {
            return <div key={b.id} className="vc-uitgevee">Hierdie boodskap is verwyder.</div>
          }
          return (
            <div key={b.id} className={`vc-ry${myne ? ' myne' : ''}`}>
              {!myne && nuweSpreker && <div className="vc-naam">{b.naam || 'Iemand'}</div>}
              <div
                className={`vc-bel${b.hangend ? ' hangend' : ''}${b.misluk ? ' misluk' : ''}`}
                onClick={() => setOopBoodskap(o => (o === b.id ? null : b.id))}
              >
                <p>{b.teks}</p>
                <span className="vc-tyd">
                  {b.misluk ? 'Nie gestuur nie' : b.hangend ? 'Stuur…' : tydWoorde(b.geskep)}
                </span>
              </div>
              {b.misluk && (
                <button className="vc-weer" onClick={() => probeerWeer(b)}>Probeer weer</button>
              )}
              {!b.hangend && oopBoodskap === b.id && magUitvee(myLid, b) && (
                <button className="vc-vee" onClick={() => { veeUit(groepId, b.id); setOopBoodskap(null) }}>
                  Verwyder hierdie boodskap
                </button>
              )}
            </div>
          )
        })}
        <div ref={onderRef} />
      </div>

      {fout && <div className="vc-fout">{fout}</div>}

      <div className="vc-skryf">
        <textarea
          value={teks}
          onChange={e => setTeks(e.target.value)}
          placeholder="Skryf iets…"
          rows={1}
          onInput={e => {
            /* Groei saam met die teks, tot 'n punt. 'n Kassie wat die halwe
               skerm vat, maak die gesprek toe. */
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'
          }}
        />
        <button
          className="vc-stuur"
          onClick={() => doenStuur(teks)}
          disabled={besig || !keurBoodskap(teks).ok}
          aria-label="Stuur"
        >➤</button>
      </div>
      {naByPerk && (
        <div className="vc-telling">{telling} / {MAKS_BOODSKAP}</div>
      )}
    </div>
  )
}

/* Die permanente knoppie. §39: dit moet altyd bereikbaar wees, dit mag niks
   toemaak nie, en die ongeleesde telling moet OPVALLEND wees. */
export function GroepKnoppie({ groep, boodskappe, laasGeleesId, myUid, opKlik }) {
  if (!groep) return null
  const n = ongeleesTel(boodskappe, laasGeleesId, myUid)
  return (
    <button className={`vc-knop${n ? ' nuut' : ''}`} onClick={opKlik}>
      <span className="vc-knop-ikoon">💬</span>
      <span className="vc-knop-woorde">
        {n === 0 ? 'GROEP' : n === 1 ? '1 NUWE BOODSKAP' : `${n > 99 ? '99+' : n} NUWE BOODSKAPPE`}
      </span>
    </button>
  )
}

/* 'n Klein haak wat die groep se boodskappe en die leesmerk in die agtergrond
   volg, sodat die knoppie sy telling ken sonder dat die chat oop is. */
export function useOngelees(groepId, myUid) {
  const [boodskappe, setBoodskappe] = useState([])
  const [laasGelees, setLaasGelees] = useState(null)

  useEffect(() => {
    if (!groepId) return
    const af = luister(groepId, setBoodskappe, () => {})
    return af
  }, [groepId])

  useEffect(() => {
    if (!groepId || !myUid) return
    return luisterLeesmerk(groepId, myUid, setLaasGelees)
  }, [groepId, myUid])

  return { boodskappe, laasGelees }
}
