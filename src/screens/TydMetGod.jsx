/* ────────────────────────────────────────────────────────────
   Vandag se Tyd met God.

   Luister → Lees die Woord → Vat dit saam → Dra iemand → Wat lê op jou hart
   → Klaar.

   ── Wat dit NIE is nie ──

   Dit is nie 'n nuwe afdeling van die app nie. Dit skep geen versameling, geen
   nuwe soort plasing en geen tweede telling nie. Elke aksie hierbinne gaan na
   presies dieselfde plek as die knoppie wat reeds daarvoor bestaan:

     · die stemboodskap is die nota op Luister, met dieselfde speler;
     · die Skrifgedeelte maak die app se eie Bybel op die regte vers oop;
     · die wallpaper is die een wat aan die nota hang;
     · "ek het vir hulle gebid" verhoog dieselfde `prayedCount` as die muur,
       deur dieselfde eindpunt, met dieselfde merkie in localStorage — wie op
       die muur reeds vir daardie versoek gebid het, word hier nie weer getel
       nie;
     · 'n gebedsversoek beland op die Bid Saam-muur, in dieselfde vorm en deur
       dieselfde keuring.

   Dewald: "een aksie, een databron, oral dieselfde resultaat."

   ── Waarom die skerms nie 'n teller dra nie ──

   Daar was 'n "STAP 3 VAN 5" bo-aan elke skerm. 'n Vorderingsbalk maak van
   tyd met God 'n vorm om te voltooi. Die skerms is stil; die knoppie onderaan
   sê waarheen dit gaan.

   ── Wat die res van die app hiervan moet weet ──

   Die vloei sit op z-index 238: BO die blad, maar ONDER die Bybel (250).
   VolgJesusLewe het presies hier geval — sy skerm het bo die Bybel gesit en
   die LEES-knoppie het niks gedoen nie.

   Terwyl dit oop is, word die donasie- en e-boekopspringers TERUGGEHOU (sien
   App.jsx). Hulle sou andersins tussen "luister" en "bid" inskuif.
   ──────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from 'react'
import { collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import Stemboodskap from '../components/Stemboodskap'
import EftBesonderhede from '../components/EftBesonderhede'
import { toestelId } from '../data/sorgStuur'
import { magDeel, saamSin } from '../data/gebedDeel'
import { ontleedSkrif, skrifOpskrif } from '../data/skrifVerwysing'
import { prentPad } from '../data/prentPad'
import {
  dagSleutel, bouStappe, slotVraag, opsomming, maandSin,
  merkGeluister, merkGelees, merkGebid, merkGetik, merkStap, merkKlaar,
} from '../data/tydMetGod'
import { leesStaat, skryfStaat } from '../data/tydMetGodBerging'
import './TydMetGod.css'

/* Hoeveel versoeke ons in een slag haal. Dit is EEN leesburst per mens per
   dag — nie 'n lewendige luisteraar nie. Om 06:30 maak duisende fone die app
   binne minute oop, en 'n `onSnapshot` per mens is presies hoe hierdie app
   verlede week teen sy Firestore-kwota vasgeloop het. */
const HAAL = 25
const SEWE_DAE = 7 * 24 * 60 * 60 * 1000

/* Die versoeke wat hierdie mens nog nie gedra het nie. Dieselfde merkies as
   die muur s'n — `prayedFor` en `reportedPrayers` — sodat 'n mens nooit twee
   keer vir dieselfde versoek tel bloot omdat hy langs 'n ander pad ingekom
   het nie. */
function leesStel(sleutel) {
  try { return new Set(JSON.parse(localStorage.getItem(sleutel) || '[]')) }
  catch { return new Set() }
}

export default function TydMetGod({
  nota, onSluit, onKlaarGemaak, onDeel, onDraMekaar, merkGevra = () => {},
  daeOop = 0, skenkDue = false, reedsGegee = false,
}) {
  const dag = dagSleutel()

  const [staat, setStaat] = useState(leesStaat)
  const [i, setI]         = useState(0)

  const stappe = bouStappe(nota)
  const stap   = stappe[Math.min(i, stappe.length - 1)]
  const lyfRef = useRef(null)

  /* Elke verandering aan die staat gaan dadelik na die foon. Daar is geen
     STOOR-knoppie nie en daar moet nie een wees nie: 'n mens wat vergeet druk,
     verloor sy dag. */
  function stel(fn) {
    setStaat(vorige => {
      const nuut = fn(vorige)
      skryfStaat(nuut)
      return nuut
    })
  }

  /* Waar hy is, word onthou sodat die kaart op Luister "GAAN VOORT" kan sê. */
  useEffect(() => { stel(s => merkStap(s, i)) }, [i])   // eslint-disable-line react-hooks/exhaustive-deps

  /* Elke skerm begin bo. Sonder dit land 'n mens halfpad af op die volgende
     skerm, presies waar sy duim die vorige knoppie gelos het. */
  useEffect(() => { if (lyfRef.current) lyfRef.current.scrollTop = 0 }, [i])

  function verder() {
    setI(n => Math.min(n + 1, stappe.length - 1))
  }

  const skrif   = ontleedSkrif(nota && nota.scripture)
  const opskrif = skrif ? skrifOpskrif(nota.scripture) : ''

  return (
    <div className="tmg">
      <header className="tmg-kop">
        {/* Die kop tree ná die eerste skerm terug. Op "dra iemand" dra 'n mens
            'n vreemdeling se seer; 'n handelsmerk hoort nie daar nie. */}
        <span className="tmg-kop-naam">
          {stap === 'luister' ? 'Vandag se tyd met God' : ''}
        </span>
        <button className="tmg-toe" onClick={onSluit} aria-label="Maak toe">✕</button>
      </header>

      <div className="tmg-lyf" ref={lyfRef}>
        {stap === 'luister' && (
          <Luister nota={nota} staat={staat} stel={stel} verder={verder} />
        )}
        {stap === 'woord' && (
          <Woord skrif={skrif} opskrif={opskrif} teks={nota.scriptureText}
                 staat={staat} stel={stel} verder={verder} />
        )}
        {stap === 'wallpaper' && (
          <Wallpaper nota={nota} verder={verder} />
        )}
        {stap === 'dra' && (
          <Dra staat={staat} stel={stel} verder={verder} />
        )}
        {stap === 'hart' && (
          <Hart staat={staat} stel={stel} verder={verder} onGeplaas={onDeel} />
        )}
        {stap === 'klaar' && (
          <Klaar nota={nota} staat={staat} stel={stel} dag={dag} opskrif={opskrif}
                 daeOop={daeOop} skenkDue={skenkDue} reedsGegee={reedsGegee}
                 onSluit={onSluit} onKlaarGemaak={onKlaarGemaak}
                 onDraMekaar={onDraMekaar} merkGevra={merkGevra} />
        )}
      </div>
    </div>
  )
}

/* ── 1 · Luister ────────────────────────────────────────────────────────── */

function Luister({ nota, staat, stel, verder }) {
  const reedsGeluister = staat.geluister === nota.id

  return (
    <section className="tmg-skerm">
      <h1 className="tmg-titel">Begin deur te luister</h1>
      <p className="tmg-lei">Sit vir 'n paar minute alles neer.</p>

      {/* Het hy vandag reeds bo-aan Luister gespeel, sê ons dit en vra dit nie
          weer nie. Iemand twee keer dieselfde boodskap laat speel, is die
          eerste oomblik waarop dit soos huiswerk voel. Die speler bly staan —
          hy mag dit weer wil hoor. */}
      {reedsGeluister && (
        <p className="tmg-merk">✓ Jy het vandag reeds geluister</p>
      )}

      <Stemboodskap
        bron={nota.audioUrl}
        titel={nota.title}
        sleutel={`tmg_${nota.id}`}
        kop="VANDAG SE BOODSKAP"
        opSpeel={() => stel(s => merkGeluister(s, nota.id))}
      />

      {/* Nooit gesper nie. Val die klank om op iemand se eerste dag, kom hy
          nooit weer nie — en die res van die ritueel werk sonder klank. */}
      <button className="tmg-knop" onClick={verder}>Gaan verder</button>
    </section>
  )
}

/* ── 2 · Lees die Woord ─────────────────────────────────────────────────── */

function Woord({ skrif, opskrif, teks, staat, stel, verder }) {
  function maakOop() {
    stel(merkGelees)
    window.dispatchEvent(new CustomEvent('open-bybel', {
      detail: { boek: skrif.boek, hoofstuk: skrif.hoofstuk, vers: skrif.vers, versTot: skrif.versTot },
    }))
  }

  return (
    <section className="tmg-skerm">
      <h1 className="tmg-titel">Lees vandag self die Woord</h1>
      <p className="tmg-lei">
        Vandag se boodskap kom uit hierdie gedeelte. Neem 'n oomblik en lees dit self.
      </p>

      <div className="tmg-skrif">
        <div className="tmg-skrif-ref">{opskrif}</div>
        {/* Die teksvers self, as Dewald hom by die nota ingevul het. Dit is nie
            'n plaasvervanger vir die Bybel nie — dit is die rede om hom oop te
            maak. */}
        {teks && <p className="tmg-skrif-teks">{teks}</p>}
      </div>

      <button className="tmg-knop" onClick={maakOop}>📖 Maak in die Bybel oop</button>

      {/* Ná die Bybel kom 'n mens hierheen terug. Die knoppie moet dan die
          natuurlike volgende ding wees, nie 'n tweede uitnodiging nie. */}
      <button className="tmg-knop tmg-knop-stil" onClick={verder}>
        {staat.gelees ? 'Gaan verder' : 'Later — gaan verder'}
      </button>
    </section>
  )
}

/* ── 3 · Vat dit saam ───────────────────────────────────────────────────── */

function Wallpaper({ nota, verder }) {
  const [besig, setBesig] = useState(false)

  /* Dieselfde pad as Luister se wallpaper-deel: die prent kom deur
     /api/wallpaper sodat 'n vreemde domein nie 'n gebreekte prentjie word nie.
     Sien prentPad.js. */
  async function stoor() {
    if (besig) return
    setBesig(true)
    try {
      const r = await fetch(prentPad(nota.wallpaperUrl))
      const blob = await r.blob()
      const lêer = new File([blob], 'daaglikse-hoop.jpg', { type: blob.type || 'image/jpeg' })
      if (navigator.canShare && navigator.canShare({ files: [lêer] })) {
        await navigator.share({ files: [lêer] })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'daaglikse-hoop.jpg'
        document.body.appendChild(a); a.click(); a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 4000)
      }
    } catch { /* die prent wys nog steeds; hy kan dit vashou en stoor */ }
    setBesig(false)
  }

  return (
    <section className="tmg-skerm">
      <h1 className="tmg-titel">Vat vandag se Woord saam</h1>
      <p className="tmg-lei">Hou dit vandag waar jy dit weer sal sien.</p>

      {/* Die prent sit BINNE 'n ondeursigtige houer, en dit word nooit gesny
          nie — 'n mens moet sien wat hy op die punt is om te stoor.

          Dieselfde vorm as Luister se wallpaper-kaart. Die houer se kleur
          is die vangnet uit CLAUDE.md: word 'n teel nie betyds geverf nie,
          wys dit hierdie kleur en nie rou GPU-geheue nie. */}
      <div className="tmg-wp">
        <img src={prentPad(nota.wallpaperUrl)} alt="Vandag se wallpaper"
             loading="lazy" decoding="async" />
      </div>

      <button className="tmg-knop" onClick={stoor} disabled={besig}>
        {besig ? 'Besig…' : '⬇ Stoor op my foon'}
      </button>
      <button className="tmg-knop tmg-knop-stil" onClick={verder}>Gaan verder</button>
    </section>
  )
}

/* ── 4 · Dra iemand ─────────────────────────────────────────────────────── */

/* Dit staan VOOR "wat lê op jou hart", en dit is die belangrikste besluit in
   die hele vloei.
 *
 * 'n Nuwe mens het op dag 1 nog niks om te vra nie, maar kan altyd iemand dra.
 * En só het elke mens wat op die muur plaas, eers iemand anders s'n gelees —
 * dít is wat keer dat die muur net nood word. */
function Dra({ staat, stel, verder }) {
  const [ry, setRy]       = useState(null)   // null = nog besig
  const [k, setK]         = useState(0)
  const [gebid, setGebid] = useState(false)

  useEffect(() => {
    let dood = false
    const gedra    = leesStel('prayedFor')
    const gerapporteer = leesStel('reportedPrayers')

    function skoon(lys) {
      return lys
        .filter(p => p && p.id && p.text && !p.reported)
        .filter(p => !gedra.has(p.id) && !gerapporteer.has(p.id))
    }

    /* Eers wat die muur reeds op hierdie foon gelaat het. Dit verf dadelik en
       kos niks. */
    let uitKas = []
    try { uitKas = skoon(JSON.parse(localStorage.getItem('cachedPrayers') || '[]')) } catch {}
    if (uitKas.length) setRy(uitKas)

    const grens = Timestamp.fromDate(new Date(Date.now() - SEWE_DAE))
    getDocs(query(
      collection(db, 'prayers'),
      where('createdAt', '>=', grens),
      orderBy('createdAt', 'desc'),
      limit(HAAL),
    ))
      .then(snap => {
        if (dood) return
        const vars = skoon(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        /* Aanvaar nooit 'n antwoord wat KLEINER is as wat ons reeds het nie —
           dieselfde les as Luister se notas. Vanlyn bedien die SDK uit sy eie
           kas en dit kan 'n halwe antwoord wees. */
        setRy(vars.length >= uitKas.length ? vars : uitKas)
      })
      .catch(() => { if (!dood && !uitKas.length) setRy([]) })

    return () => { dood = true }
  }, [])

  const versoek = ry && ry[k]

  async function ekHetGebid() {
    if (!versoek || gebid) return
    setGebid(true)
    stel(merkGebid)

    /* Presies dieselfde pad as die muur se knoppie: die merkie eers (sodat 'n
       swak lyn nie dubbel tel nie), dan die eindpunt met die diensrekening —
       `prayers` is `allow update: if false` en 'n kliënt kan dit nie self
       verhoog nie. */
    const gedra = leesStel('prayedFor')
    gedra.add(versoek.id)
    try { localStorage.setItem('prayedFor', JSON.stringify([...gedra])) } catch {}

    try {
      await fetch('/api/gebed-deel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: versoek.id, toestel: toestelId() }),
      })
    } catch { /* die gebed het gebeur, ook al het die telling nie */ }
  }

  function nogIemand() {
    setGebid(false)
    setK(n => n + 1)
  }

  if (ry === null) {
    return (
      <section className="tmg-skerm">
        <h1 className="tmg-titel">Bid vandag vir iemand</h1>
        <p className="tmg-lei">Een oomblik…</p>
      </section>
    )
  }

  /* Niemand oor om te dra nie — omdat die muur stil is, of omdat hy vandag
     almal gedra het. Dit is 'n goeie ding en dit moet so klink. */
  if (!versoek) {
    return (
      <section className="tmg-skerm">
        <h1 className="tmg-titel">Bid vandag vir iemand</h1>
        <p className="tmg-lei">
          {staat.gebid > 0
            ? 'Jy het almal gedra wat vandag om gebed gevra het. Dankie.'
            : 'Niemand het die afgelope dae om gebed gevra nie. Dalk is jy vandag die een wat kan vra.'}
        </p>
        <button className="tmg-knop" onClick={verder}>Gaan verder</button>
      </section>
    )
  }

  return (
    <section className="tmg-skerm">
      <h1 className="tmg-titel">Bid vandag vir iemand</h1>
      <p className="tmg-lei">Neem 'n oomblik en bid vir iemand anders se behoefte.</p>

      <figure className="tmg-versoek">
        <div className="tmg-versoek-kop">Anonieme versoek</div>
        <blockquote className="tmg-versoek-teks">{versoek.text}</blockquote>
        {versoek.prayedCount > 0 && (
          <figcaption className="tmg-versoek-saam">{saamSin(versoek.prayedCount)}</figcaption>
        )}
      </figure>

      {/* Die dankie verskyn EERS ná die daad. Staan dit reeds op die skerm
          saam met die versoek, is die beloning daar voor die ding gedoen is,
          en dan is die daad niks werd nie. */}
      {!gebid ? (
        <button className="tmg-knop" onClick={ekHetGebid}>🙏 Ek het vir hulle gebid</button>
      ) : (
        <div className="tmg-dankie">
          <div className="tmg-dankie-merk">✓</div>
          <p className="tmg-dankie-teks">Dankie. Jy het vandag iemand in gebed gedra.</p>
          <button className="tmg-knop" onClick={nogIemand}>Bid vir nog iemand</button>
          <button className="tmg-knop tmg-knop-stil" onClick={verder}>Gaan verder</button>
        </div>
      )}
    </section>
  )
}

/* ── 5 · Wat lê op jou hart ─────────────────────────────────────────────── */

function Hart({ staat, stel, verder, onGeplaas }) {
  const [teks, setTeks]   = useState('')
  const [besig, setBesig] = useState(false)
  const [klaar, setKlaar] = useState(false)
  const [fout, setFout]   = useState('')
  const [krisis, setKrisis] = useState(false)

  async function deel() {
    if (besig || !teks.trim()) return
    setFout('')

    /* Dieselfde keuring as die muur s'n, in dieselfde volgorde. Die krisis-
       nommers wys ook wanneer die versoek NIE gedeel word nie — die hulp hang
       nie van 'n blokkie af nie. */
    const keuring = magDeel({ teks })
    if (keuring.rede === 'te-kort') {
      setFout('Skryf asseblief net ’n bietjie meer, sodat iemand werklik kan saambid.')
      return
    }
    if (keuring.rede === 'kontak') {
      setFout('Haal asseblief jou nommer of e-posadres uit — die muur is anoniem.')
      return
    }

    setBesig(true)
    try {
      await addDoc(collection(db, 'prayers'), {
        text: teks.trim(),
        prayedCount: 0,
        createdAt: serverTimestamp(),
        reported: false,
        deelbaar: keuring.mag,
      })
      stel(merkGetik)
      setKrisis(keuring.rede === 'krisis')
      setKlaar(true)
      if (onGeplaas) { try { onGeplaas() } catch {} }
    } catch {
      setFout('Kon nie stuur nie. Probeer asseblief weer.')
    }
    setBesig(false)
  }

  /* Hy hou dit vir homself. Dit tel STEEDS as "hy het sy hart voor God
     gebring" — die stelsel weet nie wat hy gebid het nie, en dit hoef nie. En
     dit keer die geldvraag aan die einde net so. */
  function privaat() {
    stel(merkGetik)
    verder()
  }

  if (klaar) {
    return (
      <section className="tmg-skerm">
        <h1 className="tmg-titel">Jy is nie alleen nie</h1>
        <p className="tmg-lei">
          Jou versoek staan nou op die Bid Saam-muur. Iemand anders gaan vandag
          vir jou bid, net soos jy vir iemand gebid het.
        </p>
        {krisis && (
          <div className="tmg-krisis">
            <p><strong>As jy vandag in gevaar is, praat asseblief met iemand.</strong></p>
            <p>SADAG 0800 567 567 · Lifeline 0861 322 322 · Noodgeval 112</p>
          </div>
        )}
        <button className="tmg-knop" onClick={verder}>Gaan verder</button>
      </section>
    )
  }

  return (
    <section className="tmg-skerm">
      <h1 className="tmg-titel">Wat lê vandag op jou hart?</h1>
      <p className="tmg-lei">Waarvoor kan ons saam met jou bid?</p>

      <textarea
        className="tmg-kassie"
        value={teks}
        onChange={e => { setTeks(e.target.value); setFout('') }}
        placeholder="Skryf dit hier neer…"
        maxLength={500}
        rows={6}
      />
      <div className="tmg-tel">{teks.length}/500</div>
      <p className="tmg-fyn">Anoniem — geen name word gestoor nie.</p>

      {fout && <p className="tmg-fout">{fout}</p>}

      <button className="tmg-knop" onClick={deel} disabled={besig || !teks.trim()}>
        {besig ? 'Besig…' : 'Deel my gebedsversoek'}
      </button>
      {/* 'n EGTE uitgang, nie 'n skuldsin nie. Niemand moet voel hy moet iets
          publiek indien om die dag klaar te maak nie. */}
      <button className="tmg-knop tmg-knop-stil" onClick={privaat}>
        Ek hou dit vandag tussen my en God
      </button>
    </section>
  )
}

/* ── 6 · Klaar ──────────────────────────────────────────────────────────── */

function Klaar({ nota, staat, stel, dag, opskrif, daeOop, skenkDue, reedsGegee, onSluit, onKlaarGemaak, onDraMekaar, merkGevra }) {
  const gemerk = useRef(false)

  useEffect(() => {
    if (gemerk.current) return
    gemerk.current = true
    stel(s => merkKlaar(s, dag))
    if (onKlaarGemaak) { try { onKlaarGemaak() } catch {} }
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  const reels  = opsomming({ staat, nota, skrifOpskrif: opskrif })
  const vraag  = slotVraag({ staat, skenkDue, reedsGegee, daeOop })
  const maandR = maandSin(staat)

  async function stuurVirIemand() {
    const teks = 'Ek het vandag hierdie geluister en aan jou gedink. ❤️ Dalk het jy dit vandag ook nodig.\n\nhttps://dewaldscheepers.com/'
    if (navigator.share) {
      try { await navigator.share({ text: teks }) } catch {}
      return
    }
    try {
      await navigator.clipboard.writeText(teks)
      alert('Die boodskap is gekopieer. Plak dit in WhatsApp.')
    } catch { window.prompt('Kopieer hierdie boodskap:', teks) }
  }

  return (
    <section className="tmg-skerm tmg-slot">
      <div className="tmg-slot-merk">❤️</div>
      <h1 className="tmg-titel">Jy het vandag tyd met God gemaak</h1>

      {/* Eers die kwitansie, dan eers 'n vraag. 'n Eindskerm wat met 'n vraag
          begin, is 'n tolhek. Elke reël is iets wat WERKLIK gebeur het. */}
      {reels.length > 0 && (
        <ul className="tmg-lys">
          {reels.map((r, n) => <li key={n}>{r}</li>)}
        </ul>
      )}
      {maandR && <p className="tmg-maand">{maandR}</p>}

      <div className="tmg-vraag">
        {vraag === 'deel' && (
          <>
            <h2 className="tmg-vraag-kop">Wie het vandag hierdie nodig?</h2>
            <p className="tmg-lei">
              Dalk is daar iemand op jou WhatsApp wat vandag ook 'n paar minute
              saam met God nodig het.
            </p>
            <button className="tmg-knop" onClick={stuurVirIemand}>
              Stuur vandag se hoop vir iemand
            </button>
          </>
        )}

        {vraag === 'skenk' && (
          <>
            <h2 className="tmg-vraag-kop">Help my om dit gratis te hou</h2>
            <p className="tmg-lei">
              Alles wat jy vandag gebruik het, is gratis. Ek wil hê Daaglikse
              Hoop moet gratis bly vir die persoon wat dit môre die nodigste het.
            </p>
            {/* Dieselfde twee gebeurtenisse as elke ander skenk-knoppie in
                die app. Geen tweede betaalpad nie. */}
            <button className="tmg-knop"
                    onClick={() => { merkGevra(); window.dispatchEvent(new CustomEvent('open-hoop-vennoot')) }}>
              Word 'n maandelikse Hoop-Vennoot
            </button>
            <button className="tmg-knop tmg-knop-stil"
                    onClick={() => { merkGevra(); window.dispatchEvent(new CustomEvent('open-donation')) }}>
              Gee 'n eenmalige bydrae
            </button>
            <EftBesonderhede />
          </>
        )}

        {vraag === 'dankie' && (
          <>
            <h2 className="tmg-vraag-kop">Dankie</h2>
            <p className="tmg-lei">
              Jy help reeds om Daaglikse Hoop moontlik te maak vir mense wat dit
              nie kan bekostig nie.
            </p>
            <button className="tmg-knop" onClick={stuurVirIemand}>
              Stuur vandag se hoop vir iemand
            </button>
          </>
        )}
      </div>

      {/* Dra Mekaar is 'n uitgang, nie 'n stasie nie. Iemand met niks swaars
          nie moet nie 'n skerm wegklik nie. */}
      <button className="tmg-uit" onClick={() => onDraMekaar && onDraMekaar()}>
        Iets wat swaarder is as een dag? Daar is plek vir jou op Dra Mekaar →
      </button>

      <button className="tmg-knop tmg-knop-stil" onClick={onSluit}>Gaan my dag binne</button>
    </section>
  )
}
