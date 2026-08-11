/* ────────────────────────────────────────────────────────────
   Wat die ontvanger van 'n gebedskakel sien.

   Iemand het vir 'n vriend gestuur: "Sal jy asseblief saam met my bid?" Die
   vriend druk die skakel en land hier.

   ── Die drie reels van hierdie skerm ──

   1. GEEN INSTALLASIE, GEEN REGISTRASIE. Sy moet kan bid voordat die app
      enigiets van haar vra. Vra ons voor sy waarde gekry het, is sy weg — en
      dan het die mens wat gevra het, ook niemand gekry wat bid nie.

   2. DIE VRA KOM LAASTE. Eers die versoek, dan die gebed, dan die dankie, en
      EERS DAARNA die uitnodiging. Die volgorde is die hele ontwerp.

   3. NIKS WAT SOOS SOSIALE MEDIA LYK NIE. Geen hartjie, geen "like", geen
      lys van ander gebede, geen pad na 'n muur met almal s'n. 'n Mens sien
      die EEN gebed waarvan hy die skakel het. Dit is 'n mens se swaarste
      week, nie inhoud nie.

   Die bediener besluit of hierdie gebed gewys mag word — sien
   api/gebed-deel.mjs. 'n Krisisversoek kom nooit hier uit nie.
   ──────────────────────────────────────────────────────────── */

import { useState, useEffect } from 'react'
import { toestelId } from '../data/sorgStuur'
import { saamSinVirOntvanger } from '../data/gebedDeel'
import './BidVirMy.css'

export default function BidVirMy({ id, onKlaar, onGebid }) {
  const [gebed,  setGebed]  = useState(null)
  const [laai,   setLaai]   = useState(true)
  const [weg,    setWeg]    = useState(false)
  const [gebid,  setGebid]  = useState(false)
  const [besig,  setBesig]  = useState(false)

  /* Terwyl hierdie blad oop is, wys die app niks anders nie — geen
     installasie-balk, geen uitklap, geen onderste navigasie. Sien die
     .gebed-oop-reels in BidVirMy.css. */
  /* ── Wanneer die app weer mag praat ──

     Terwyl sy die versoek lees en bid, wys die app niks anders nie: geen
     installasie-uitklap, geen kennisgewing-balk, geen navigasie. Sy het gekom
     om vir iemand te bid.

     Sodra sy gebid het, val daardie stilte weg. Dan is dit presies die oomblik
     waarop die app normaalweg vra — sy het pas iets gekry en gegee, en "wil jy
     dit op jou foon hê?" is 'n redelike vraag eerder as 'n onderbreking. Dit
     is dieselfde vloei wat 'n nuwe mens kry wat die app in 'n blaaier oopmaak;
     ons doen niks nuuts nie, ons stel dit net uit tot ná die gebed. */
  useEffect(() => {
    if (gebid) {
      document.body.classList.remove('gebed-oop')
      return
    }
    document.body.classList.add('gebed-oop')
    return () => document.body.classList.remove('gebed-oop')
  }, [gebid])

  useEffect(() => {
    let lewendig = true
    fetch(`/api/gebed-deel?id=${encodeURIComponent(id)}`, { headers: { accept: 'application/json' } })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(d => { if (lewendig) { setGebed(d.gebed); setLaai(false) } })
      .catch(() => { if (lewendig) { setWeg(true); setLaai(false) } })
    return () => { lewendig = false }
  }, [id])

  async function bidSaam() {
    if (gebid || besig) return
    setBesig(true)
    /* Die skerm skuif DADELIK. Die bediener se antwoord is nie waarvoor 'n
       mens wag wanneer hy pas gebid het nie. */
    setGebid(true)
    try {
      const r = await fetch('/api/gebed-deel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, toestel: toestelId() }),
      })
      const d = await r.json().catch(() => ({}))
      if (d && typeof d.saam === 'number') setGebed(g => (g ? { ...g, saam: d.saam } : g))
    } catch { /* die gebed het gebeur, ook al het die telling nie */ }
    setBesig(false)
    /* App vat dit oor: die installasie-uitklap, en daarna die kennisgewings. */
    if (onGebid) onGebid()
  }

  if (laai) {
    return <div className="bvm"><div className="bvm-kaart"><p className="bvm-laai">Een oomblik…</p></div></div>
  }

  /* Weg, verval, gerapporteer of nooit deelbaar nie — die bediener gee vir al
     daardie gevalle dieselfde antwoord, en ons wys ook een ding. 'n Rede sou
     iets oor daardie mens verklap. */
  if (weg || !gebed) {
    return (
      <div className="bvm">
        <div className="bvm-kaart">
          <div className="bvm-hande" aria-hidden="true">🙏🏻</div>
          <h1 className="bvm-kop">Hierdie gebedsversoek is nie meer beskikbaar nie</h1>
          <p className="bvm-sag">Dit gebeur nie omdat iets fout is nie. Versoeke bly 'n tyd lank oop en gaan dan stil weg.</p>
          <button className="bvm-knop bvm-knop-lig" onClick={onKlaar}>Gaan na Daaglikse Hoop</button>
        </div>
      </div>
    )
  }

  const reeds = saamSinVirOntvanger(gebed.saam)

  return (
    <div className={`bvm${gebid ? ' bvm-gebid' : ''}`}>
      <div className="bvm-kaart">

        {!gebid ? (
          <>
            <div className="bvm-hande" aria-hidden="true">🙏🏻</div>
            <p className="bvm-inlei">Iemand het gevra dat jy saam met hom of haar bid.</p>

            <blockquote className="bvm-teks">{gebed.teks}</blockquote>

            {/* Die naam is nêrens nie, en daar is niks om op te tik wat sê wie
                dit is. Dit is nie 'n oorsig nie — dit is opsetlik. */}
            <p className="bvm-anoniem">Hierdie versoek is anoniem gedeel.</p>

            <button className="bvm-knop" onClick={bidSaam} disabled={besig}>
              🙏🏻 Ek bid saam
            </button>

            {reeds && <p className="bvm-reeds">{reeds}</p>}
          </>
        ) : (
          <>
            <div className="bvm-hande" aria-hidden="true">🙏🏻</div>
            <h1 className="bvm-kop">Dankie dat jy saamgebid het.</h1>
            <p className="bvm-sag">
              Iemand het vandag jou gebed nodig gehad. Dankie dat jy saamgedra het.
            </p>

            {/* EERS hier, nadat sy iets gegee het, vra ons iets. */}
            <div className="bvm-nooi">
              <p className="bvm-nooi-vra">Het jy iets waarvoor ons saam met jóú kan bid?</p>
              <button className="bvm-knop" onClick={() => onKlaar('bidsaam')}>
                Plaas 'n gebedsversoek
              </button>
              <button className="bvm-knop bvm-knop-lig" onClick={() => onKlaar()}>
                Kyk wat Daaglikse Hoop is
              </button>
            </div>

          </>
        )}

      </div>
    </div>
  )
}
