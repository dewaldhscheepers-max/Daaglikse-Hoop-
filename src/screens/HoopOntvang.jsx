/* ────────────────────────────────────────────────────────────
   Waar 'n gedeelde skakel land.

   Iemand het aan die einde van Vandag se Tyd met God gedruk: "Stuur vandag se
   hoop vir iemand." Hierdie skerm is wat sy vriendin sien.

   ── Die twee reels wat alles bepaal ──

   1. Sy hoor DIE boodskap wat gedeel is, nie 'n landingsblad nie. Die woorde
      wat saam met die skakel gestuur is, maak 'n belofte — "ek het vandag
      hierdie geluister en aan jou gedink" — en 'n tuisblad maak daardie
      belofte 'n leuen.

   2. Geen installasiemuur nie. Sy luister DADELIK, in haar blaaier, sonder om
      iets af te laai en sonder om te registreer. Eers NA die ervaring vra ons
      of sy dit more weer wil he. 'n Muur voor die waarde is hoe 'n mens 'n
      vreemdeling verloor, en sy het nie gevra om hier te wees nie — iemand
      het aan haar gedink.

   ── Wat gebeur as die nota weg is ──

   'n Nota kan uitgevee word, en 'n skakel kan weke later oopgemaak word. Dan
   wys ons VANDAG se boodskap in plaas daarvan, met 'n eerlike sinnetjie. 'n
   Doodloopstraat is die ergste ding wat hierdie skerm kan wees.
   ──────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from 'react'
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import Stemboodskap from '../components/Stemboodskap'
import { ONTVANG_TITEL } from '../data/hoopSkakel'
import { ontleedSkrif, skrifOpskrif } from '../data/skrifVerwysing'
import './HoopOntvang.css'

/* Firestore se `getDoc` het geen eie tydgrens nie en kan VIR ALTYD hang —
   sien CLAUDE.md. Hier tel dit dubbel: dit is 'n vreemdeling se EERSTE
   oomblik met hierdie app, en 'n skerm wat hang, is 'n mens wat nooit
   terugkom nie. */
const TYDGRENS = 9000

function metTydgrens(belofte, ms = TYDGRENS) {
  let klok
  const tyd = new Promise((_, weier) => { klok = setTimeout(() => weier(new Error('tydgrens')), ms) })
  return Promise.race([belofte, tyd]).finally(() => clearTimeout(klok))
}

function uitKas() {
  try {
    const lys = JSON.parse(localStorage.getItem('cachedNotes') || '[]')
    return Array.isArray(lys) ? lys : []
  } catch { return [] }
}

export default function HoopOntvang({ notaId, onKlaar }) {
  const [nota, setNota]   = useState(null)
  const [staat, setStaat] = useState('laai')   // laai · reg · vandag · niks
  const [gehoor, setGehoor] = useState(false)
  const getelRef = useRef(false)

  /* Een keer per oopmaak, en die merkie word geskryf VOOR ons stuur — anders
     tel 'n swak lyn elke mislukte versoek weer. Dieselfde patroon as
     volgJesusTel.js. */
  useEffect(() => {
    if (getelRef.current) return
    getelRef.current = true
    try {
      const sleutel = `hoop_oop_${notaId}`
      if (!localStorage.getItem(sleutel)) {
        localStorage.setItem(sleutel, '1')
        fetch('/api/hoop-tel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wat: 'oopgemaak' }),
        }).catch(() => {})
      }
    } catch {}
  }, [notaId])

  useEffect(() => {
    let dood = false

    /* Eers wat op hierdie foon is. Meestal is dit niks — sy het die app nie —
       maar dit kos niks en dit verf dadelik as sy hom wel het. */
    const gekas = uitKas().find(n => n && n.id === notaId)
    if (gekas) { setNota(gekas); setStaat('reg') }

    metTydgrens(getDoc(doc(db, 'notes', notaId)))
      .then(d => {
        if (dood) return
        if (d.exists()) { setNota({ id: d.id, ...d.data() }); setStaat('reg'); return }
        /* Die nota is weg. Wys vandag s'n — nooit 'n doodloopstraat nie. */
        return metTydgrens(getDocs(query(collection(db, 'notes'), orderBy('publishedAt', 'desc'), limit(1))))
          .then(snap => {
            if (dood || snap.empty) { if (!dood && !gekas) setStaat('niks'); return }
            const eerste = snap.docs[0]
            setNota({ id: eerste.id, ...eerste.data() })
            setStaat('vandag')
          })
      })
      .catch(() => { if (!dood && !gekas) setStaat('niks') })

    return () => { dood = true }
  }, [notaId])

  const skrif   = nota ? ontleedSkrif(nota.scripture) : null
  const opskrif = skrif ? skrifOpskrif(nota.scripture) : ''

  return (
    <div className="ho">
      <div className="ho-lyf">
        <section className="ho-skerm">
          <TekenGee />
          <h1 className="ho-titel">{ONTVANG_TITEL}</h1>

          {staat === 'laai' && <p className="ho-lei">Een oomblik…</p>}

          {staat === 'niks' && (
            <>
              <p className="ho-lei">
                Ons kon die boodskap nie laai nie. Dit is dalk net die netwerk —
                probeer gerus weer.
              </p>
              <button className="ho-knop" onClick={() => window.location.reload()}>
                Probeer weer
              </button>
            </>
          )}

          {nota && (
            <>
              {staat === 'vandag' && (
                <p className="ho-lei">
                  Daardie boodskap is nie meer daar nie — maar hier is vandag s'n.
                </p>
              )}

              <Stemboodskap
                bron={nota.audioUrl}
                titel={nota.title}
                sleutel={`ho_${nota.id}`}
                kop="LUISTER"
                opSpeel={() => setGehoor(true)}
              />

              {/* Die Skrifgedeelte, as die nota een dra. Sy het nie die app
                  nie, dus is daar geen Bybel om oop te maak — die teksvers self
                  is wat sy kan lees. */}
              {opskrif && nota.scriptureText && (
                <div className="ho-skrif">
                  <div className="ho-skrif-ref">{opskrif}</div>
                  <div className="ho-skrif-streep" />
                  <p className="ho-skrif-vers">{nota.scriptureText}</p>
                </div>
              )}

              {/* ── Eers NA die ervaring ──
                  Dit verskyn wanneer sy begin luister het, nie voor nie. Vra
                  ons vooraf, is dit 'n muur; vra ons daarna, is dit 'n
                  uitnodiging. */}
              {gehoor && (
                <div className="ho-nooi">
                  <p className="ho-nooi-kop">
                    Wil jy môre weer 'n paar minute saam met God maak?
                  </p>
                  <p className="ho-lei">
                    Elke oggend 'n kort stemboodskap, 'n vers, en mense wat vir
                    mekaar bid. Alles gratis.
                  </p>
                  <a className="ho-knop" href="/go">Kry Daaglikse Hoop</a>
                  <button className="ho-knop ho-knop-stil" onClick={onKlaar}>
                    Nee dankie — wys my die app
                  </button>
                </div>
              )}
            </>
          )}

          {/* Altyd 'n stil pad in, ook vir wie nie luister nie. */}
          {!gehoor && staat !== 'laai' && (
            <button className="ho-knop ho-knop-stil" onClick={onKlaar}>
              Gaan na Daaglikse Hoop
            </button>
          )}
        </section>
      </div>
    </div>
  )
}

/* Twee hande wat iets aangee. Geen emoji — sien TydMetGod.jsx. */
function TekenGee() {
  return (
    <svg className="ho-teken" viewBox="0 0 40 40" fill="none" stroke="currentColor"
         strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10.5c2.6 3.1 4 5.4 4 7.4a4 4 0 1 1-8 0c0-2 1.4-4.3 4-7.4Z" />
      <path d="M7 24.5c0 6.3 5.8 11 13 11s13-4.7 13-11" />
      <path d="M7 24.5v-3a2.6 2.6 0 0 1 5.2 0v2.5M33 24.5v-3a2.6 2.6 0 0 0-5.2 0v2.5" />
    </svg>
  )
}
