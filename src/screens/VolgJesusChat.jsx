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
  reageer, luisterReaksies, speldVas, rapporteer, REAKSIES,
} from '../data/volgJesusChat'
import {
  keurBoodskap, MAKS_BOODSKAP, magUitvee, magVasspeld, magChatVerwyder,
  ongeleesTel, wysNaam,
} from '../data/volgJesusGroep'
import { stelChat } from '../data/volgJesusGroepApi'
import { haalAgtergrond, leesKas } from '../data/vjChatAgtergrond'
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

/* ── Hoeveel boodskappe se reaksies ons lewendig volg ──
 *
 * Elke boodskap se reaksies is 'n eie subversameling, en dus 'n eie
 * luisteraar. Twee honderd luisteraars op een foon is twee honderd oop
 * strome — dit is presies hoe 'n chat 'n battery opeet.
 *
 * Reaksies leef in die HEDE: 'n mens druk 'n hartjie op wat pas gesê is.
 * Ons volg dus die laaste vyftig, en dit is 'n grens wat 'n mens in die
 * praktyk nooit raakloop nie. */
export const REAKSIE_VENSTER = 50

/* Een haak vir al die reaksies, sodat die skerm nie 'n luisteraar per
   boodskap-komponent hoef te bestuur nie. Gee 'n voorwerp terug:
   { boodskapId: [{ uid, soort }] }. */
function useReaksies(groepId, ids) {
  const [kaart, setKaart] = useState({})
  const afRef = useRef(new Map())
  const sleutel = ids.join(',')

  useEffect(() => {
    if (!groepId) return
    const wil = new Set(sleutel ? sleutel.split(',') : [])
    /* Wat nie meer op die lys is nie, se luisteraar gaan af. */
    for (const [id, af] of afRef.current) {
      if (!wil.has(id)) { af(); afRef.current.delete(id) }
    }
    for (const id of wil) {
      if (afRef.current.has(id)) continue
      afRef.current.set(id, luisterReaksies(groepId, id, lys => {
        setKaart(k => ({ ...k, [id]: lys }))
      }))
    }
  }, [groepId, sleutel])

  /* Die skerm gaan toe: alles af. */
  useEffect(() => () => {
    for (const af of afRef.current.values()) af()
    afRef.current.clear()
  }, [])

  return kaart
}

/* Tel per soort, en onthou wat EK gedruk het — die knoppie moet wys dat dit
   myne is, anders druk 'n mens dit twee keer. */
export function telReaksies(lys, myUid) {
  const uit = {}
  for (const r of REAKSIES) uit[r.soort] = { n: 0, myne: false }
  if (!Array.isArray(lys)) return uit
  for (const r of lys) {
    if (!uit[r.soort]) continue
    uit[r.soort].n += 1
    if (r.uid === myUid) uit[r.soort].myne = true
  }
  return uit
}

export default function VolgJesusChat({ groep, myLid, opSluit, opInstellings, aanset = '' }) {
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
  /* Waarop 'n mens besig is om te antwoord. Die aanhaling staan bo die
     skryfkassie sodat hy kan sien waarop hy praat. */
  const [antwoordOp, setAntwoordOp] = useState(null)
  /* Watter boodskap gerapporteer word. Die bevestiging is 'n aparte tree,
     want 'n rapport per ongeluk is 'n mens wat 'n ander mens aankla. */
  const [rapporteerB, setRapporteerB] = useState(null)
  const [rapportKlaar, setRapportKlaar] = useState(false)
  /* Wie uit die groepchat gehaal word. Dit is 'n aparte tree, want dit maak 'n
     mens se gesprek toe — en dit is nie dieselfde as 'n boodskap uitvee nie. */
  const [chatUit, setChatUit] = useState(null)
  const [chatNota, setChatNota] = useState('')
  /* Die wenk by die eerste boodskap. Een keer per toestel, en dan nooit weer. */
  const [wysWenk, setWysWenk] = useState(() => {
    try { return !localStorage.getItem('vj_chat_wenk_gesien') } catch { return true }
  })

  /* Die agtergrond agter die boodskappe. Die gekasde adres is DADELIK daar,
     sodat die patroon nie inskuif nadat die gesprek al staan nie. */
  const [agtergrond, setAgtergrond] = useState(leesKas)

  const onderRef = useRef(null)
  const lysRef   = useRef(null)

  useEffect(() => { haalAgtergrond(setAgtergrond) }, [])

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
    /* Die aanhaling word HIER gemaak en saam met die hangende boodskap gehou.
       Sou ons hom uit `antwoordOp` lees wanneer die bediener antwoord, is hy
       reeds skoongevee en dan verloor 'n mislukte boodskap sy antwoord. */
    const verwys = antwoordOp
      ? { id: antwoordOp.id, naam: antwoordOp.naam || '', teks: String(antwoordOp.teks || '').slice(0, 120) }
      : null
    const nou = {
      id, uid: myUid, naam: myLid.naam, teks: gekeur.waarde,
      antwoordOp: verwys, geskep: new Date(), hangend: true,
    }
    setHangend(h => [...h, nou])
    setTeks('')
    setFout('')
    setAntwoordOp(null)
    setBesig(true)

    const r = await stuur(groepId, {
      uid: myUid, naam: myLid.naam, teks: gekeur.waarde, kliëntId: id,
      antwoordOp: verwys,
    })
    setBesig(false)
    if (!r.ok) {
      if (r.fout) setFout(r.fout)
      /* Dit bly staan, met 'n knoppie. Die teks is nie weg nie. */
      setHangend(h => h.map(x => x.id === id ? { ...x, misluk: true } : x))
    }
  }, [groepId, myUid, myLid, antwoordOp])

  async function probeerWeer(item) {
    setHangend(h => h.map(x => x.id === item.id ? { ...x, misluk: false } : x))
    const r = await stuur(groepId, {
      uid: myUid, naam: myLid.naam, teks: item.teks, kliëntId: item.id,
      antwoordOp: item.antwoordOp || null,
    })
    if (!r.ok) setHangend(h => h.map(x => x.id === item.id ? { ...x, misluk: true } : x))
  }

  const alles = [...boodskappe, ...hangend]
  const telling = keurBoodskap(teks).telling || 0
  const naByPerk = telling > MAKS_BOODSKAP - 300

  /* Die vasgespelde boodskap staan bo die gesprek. Is daar meer as een — twee
     fasiliteerders, of een wat vergeet het — wys ons die LAASTE. 'n Ry banier-
     tjies bo-aan maak die gesprek toe. */
  const vasgespeld = boodskappe.filter(b => b.vasgespeld && !b.uitgevee).slice(-1)[0] || null

  /* Net die laaste klompie se reaksies word gevolg. Sien REAKSIE_VENSTER. */
  const reaksieIds = boodskappe.filter(b => !b.uitgevee).slice(-REAKSIE_VENSTER).map(b => b.id)
  const reaksies = useReaksies(groepId, reaksieIds)

  function doenReageer(b, soort) {
    const my = telReaksies(reaksies[b.id], myUid)[soort]
    /* Dieselfde teken weer beteken "haal dit af". */
    reageer(groepId, b.id, myUid, my && my.myne ? null : soort)
    /* En die knoppie-ry gaan toe. Dewald: "as ek reaksie soos hartjie druk moet
       daardie popup thing weer weggaan." Hy is reg — 'n mens het klaar gese wat
       hy wou se, en 'n ry knoppies wat bly staan, maak die gesprek toe. */
    setOopBoodskap(null)
  }

  function beginAntwoord(b) {
    setAntwoordOp({ id: b.id, naam: b.naam || 'Iemand', teks: b.teks || '' })
    setOopBoodskap(null)
  }

  async function doenChatUit(b) {
    setChatUit(null)
    const r = await stelChat(groepId, b.uid, false)
    setChatNota(r && r.ok
      ? `${b.naam || 'Die persoon'} is uit die groepchat. Hy kan die program klaarmaak.`
      : (r && r.fout) || 'Kon nie nou nie. Probeer weer.')
    setTimeout(() => setChatNota(''), 5000)
  }

  async function stuurRapport(rede) {
    const b = rapporteerB
    setRapporteerB(null)
    if (!b) return
    await rapporteer(groepId, b, myUid, rede)
    /* Ons sê altyd dankie, ook as die skryf misluk het. 'n Mens wat pas iets
       gerapporteer het, moet nie 'n foutboodskap kry nie — dan lyk dit of hy
       weer moet, en dan kla hy 'n mens twee keer aan. */
    setRapportKlaar(true)
    setTimeout(() => setRapportKlaar(false), 3200)
  }

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
        {/* Die spyskaart. Alles wat 'n mens met die GROEP doen — nooi, die
            groepsessie, wie uit die chat is, verlaat — staan op een plek, en dit
            is bereikbaar van BINNE die gesprek af. Dit was net bo op die
            VOLG JESUS-skerm, en 'n fasiliteerder wat in die chat sit, moes eers
            uitklim om by die instellings te kom. */}
        {opInstellings && (
          <button className="vc-menu" onClick={opInstellings} aria-label="Groep-instellings">
            <span /><span /><span />
          </button>
        )}
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

      {/* Wat vasgespeld is, staan bo die gesprek en skuif nie weg nie (§38). */}
      {vasgespeld && (
        <div className="vc-vasgespeld">
          <span className="vc-speld-ikoon" aria-hidden="true">📌</span>
          <div className="vc-speld-teks">
            <span className="vc-speld-naam">{vasgespeld.naam || 'Iemand'}</span>
            <p>{vasgespeld.teks}</p>
          </div>
          {magVasspeld(myLid) && (
            <button
              className="vc-speld-af"
              onClick={() => speldVas(groepId, vasgespeld.id, false)}
              aria-label="Haal af"
            >×</button>
          )}
        </div>
      )}

      {/* 'n CSS-agtergrond op 'n ONDEURSIGTIGE houer, nooit 'n <img> nie — sien
          CLAUDE.md se "Android, Chrome, en gekleurde strepe". Die adres word
          AANGEHAAL: 'n Firebase-aflaai-URL dra `?alt=media&token=...` en 'n
          ongehaalde url() in CSS is presies hoe 'n prent stil verdwyn. */}
      <div
        className={`vc-lys${agtergrond ? ' met-prent' : ''}`}
        ref={lysRef}
        style={agtergrond ? { backgroundImage: `url("${agtergrond}")` } : undefined}
      >
        {alles.length === 0 && !fout && (
          <div className="vc-leeg">
            <p>Nog niks hier nie.</p>
            <p className="vc-leeg-fyn">
              Sê gerus hallo, of vertel wat jou vandag getref het.
            </p>
          </div>
        )}

        {/* Die eerste keer dat daar iets in die gesprek is, se ons wat 'n mens
            hier kan doen. Sonder dit is die knoppies onvindbaar: niks op die
            skerm wys dat 'n boodskap getik kan word nie. Dit verdwyn sodra hy
            een keer 'n boodskap oopgemaak het, en kom nooit weer nie. */}
        {alles.length > 0 && wysWenk && (
          <div className="vc-wenk">Tik op 'n boodskap om te reageer of te antwoord.</div>
        )}

        {alles.map((b, i) => {
          const myne = b.uid === myUid
          const vorige = alles[i - 1]
          /* 'n Uitgeveede boodskap breek die ry — sien wysNaam(). */
          const nuweSpreker = wysNaam(vorige, b)
          if (b.uitgevee) {
            return <div key={b.id} className="vc-uitgevee">Hierdie boodskap is verwyder.</div>
          }
          const tel = telReaksies(reaksies[b.id], myUid)
          const enigeReaksie = REAKSIES.some(r => tel[r.soort].n > 0)
          const oop = !b.hangend && oopBoodskap === b.id
          return (
            <div key={b.id} className={`vc-ry${myne ? ' myne' : ''}`}>
              {!myne && nuweSpreker && <div className="vc-naam">{b.naam || 'Iemand'}</div>}
              <div
                className={`vc-bel${b.hangend ? ' hangend' : ''}${b.misluk ? ' misluk' : ''}${b.vasgespeld ? ' vasgespeld' : ''}`}
                onClick={() => {
                  setOopBoodskap(o => (o === b.id ? null : b.id))
                  if (wysWenk) {
                    setWysWenk(false)
                    try { localStorage.setItem('vj_chat_wenk_gesien', '1') } catch {}
                  }
                }}
              >
                {/* Waarop hierdie boodskap antwoord. Die aanhaling is 'n
                    afskrif — die oorspronklike kan intussen uitgevee wees, en
                    dan moet die gesprek steeds leesbaar bly. */}
                {b.antwoordOp && (
                  <div className="vc-aanhaal">
                    <span className="vc-aanhaal-naam">{b.antwoordOp.naam || 'Iemand'}</span>
                    <span className="vc-aanhaal-teks">{b.antwoordOp.teks}</span>
                  </div>
                )}
                <p>{b.teks}</p>
                <span className="vc-tyd">
                  {b.vasgespeld && <span className="vc-tyd-speld" aria-label="Vasgespeld">📌 </span>}
                  {b.misluk ? 'Nie gestuur nie' : b.hangend ? 'Stuur…' : tydWoorde(b.geskep)}
                </span>
              </div>

              {/* Die reaksies wat REEDS daar is. Hulle wys altyd — 'n mens
                  moet nie eers op 'n boodskap tik om te sien iemand het
                  saamgebid nie. */}
              {enigeReaksie && (
                <div className="vc-reaksies">
                  {REAKSIES.filter(r => tel[r.soort].n > 0).map(r => (
                    <button
                      key={r.soort}
                      className={`vc-reaksie${tel[r.soort].myne ? ' myne' : ''}`}
                      onClick={() => doenReageer(b, r.soort)}
                      aria-label={r.soort === 'hart' ? 'Hartjie' : 'Bid saam'}
                    >
                      <span>{r.teken}</span><span className="vc-reaksie-n">{tel[r.soort].n}</span>
                    </button>
                  ))}
                </div>
              )}

              {b.misluk && (
                <button className="vc-weer" onClick={() => probeerWeer(b)}>Probeer weer</button>
              )}

              {/* Die knoppies kom op 'n tik. 'n Ry knoppies onder ELKE
                  boodskap is visuele geraas, en 'n fasiliteerder sien hulle
                  onder die hele gesprek. */}
              {oop && (
                <div className="vc-doen">
                  {REAKSIES.map(r => (
                    <button
                      key={r.soort}
                      className={`vc-doen-knop${tel[r.soort].myne ? ' aan' : ''}`}
                      onClick={() => doenReageer(b, r.soort)}
                    >{r.teken}</button>
                  ))}
                  <button className="vc-doen-knop" onClick={() => beginAntwoord(b)}>Antwoord</button>
                  {magVasspeld(myLid) && (
                    <button
                      className="vc-doen-knop"
                      onClick={() => { speldVas(groepId, b.id, !b.vasgespeld); setOopBoodskap(null) }}
                    >{b.vasgespeld ? 'Haal af' : 'Speld vas'}</button>
                  )}
                  {magUitvee(myLid, b) && (
                    <button
                      className="vc-doen-knop weg"
                      onClick={() => { veeUit(groepId, b.id); setOopBoodskap(null) }}
                    >Verwyder</button>
                  )}
                  {!myne && (
                    <button
                      className="vc-doen-knop weg"
                      onClick={() => { setRapporteerB(b); setOopBoodskap(null) }}
                    >Rapporteer</button>
                  )}
                  {/* Uit die GROEPCHAT — nie uit die groep nie. Die mens loop
                      die program klaar; net die gesprek gaan toe. */}
                  {magChatVerwyder(myLid, b, groep) && (
                    <button
                      className="vc-doen-knop weg"
                      onClick={() => { setChatUit(b); setOopBoodskap(null) }}
                    >Verwyder van groepchat</button>
                  )}
                </div>
              )}
            </div>
          )
        })}
        <div ref={onderRef} />
      </div>

      {fout && <div className="vc-fout">{fout}</div>}
      {chatNota && <div className="vc-dankie">{chatNota}</div>}
      {rapportKlaar && (
        <div className="vc-dankie">
          Dankie. Ons kyk daarna. Die groep sien nie hierdie rapport nie.
        </div>
      )}

      {/* Waarop ek besig is om te antwoord. Dit staan BO die kassie sodat 'n
          mens sien waarop hy praat voordat hy tik. */}
      {antwoordOp && (
        <div className="vc-antwoord-op">
          <div className="vc-antwoord-teks">
            <span className="vc-antwoord-naam">Antwoord vir {antwoordOp.naam}</span>
            <span className="vc-antwoord-fyn">{antwoordOp.teks}</span>
          </div>
          <button className="vc-antwoord-af" onClick={() => setAntwoordOp(null)} aria-label="Los">×</button>
        </div>
      )}

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

      {/* Rapporteer. 'n Aparte tree, want 'n rapport per ongeluk is een mens
          wat 'n ander aankla. Die rede is OPSIONEEL — 'n verpligte veld is
          hoe 'n mens ophou rapporteer. */}
      {chatUit && (
        <div className="vc-blad" role="dialog" aria-label="Verwyder van groepchat">
          <div className="vc-blad-binne">
            <h3>Verwyder {chatUit.naam || 'hierdie persoon'} van die groepchat?</h3>
            <p className="vc-blad-fyn">
              Hy bly in die groep en kan die program klaarmaak — sy week, sy
              antwoorde en sy plek bly net soos hulle is. Net die gesprek gaan
              toe: hy sien niks nuuts nie en kan niks meer stuur nie.
            </p>
            <p className="vc-blad-fyn">
              Jy kan dit later terugdraai onder die groep se instellings.
            </p>
            <div className="vc-blad-knoppe">
              <button className="vc-blad-los" onClick={() => setChatUit(null)}>Los maar</button>
              <button className="vc-blad-stuur" onClick={() => doenChatUit(chatUit)}>
                Verwyder van groepchat
              </button>
            </div>
          </div>
        </div>
      )}

      {rapporteerB && (
        <RapporteerBlad
          boodskap={rapporteerB}
          opKanselleer={() => setRapporteerB(null)}
          opStuur={stuurRapport}
        />
      )}
    </div>
  )
}

function RapporteerBlad({ boodskap, opKanselleer, opStuur }) {
  const [rede, setRede] = useState('')
  const [besig, setBesig] = useState(false)
  return (
    <div className="vc-blad" role="dialog" aria-label="Rapporteer hierdie boodskap">
      <div className="vc-blad-binne">
        <h3>Rapporteer hierdie boodskap</h3>
        <p className="vc-blad-fyn">
          Dit gaan net na ons toe. Die groep en die persoon self sien dit nie.
        </p>
        <div className="vc-blad-aanhaal">{String(boodskap.teks || '').slice(0, 200)}</div>
        <textarea
          value={rede}
          onChange={e => setRede(e.target.value.slice(0, 200))}
          placeholder="Wil jy vertel wat fout is? (opsioneel)"
          rows={3}
        />
        <div className="vc-blad-knoppe">
          <button className="vc-blad-los" onClick={opKanselleer} disabled={besig}>Los maar</button>
          <button
            className="vc-blad-stuur"
            disabled={besig}
            onClick={() => { setBesig(true); opStuur(rede) }}
          >{besig ? 'Besig…' : 'Rapporteer'}</button>
        </div>
      </div>
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
