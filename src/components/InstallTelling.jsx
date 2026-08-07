/* ────────────────────────────────────────────────────────────
   Hoeveel mense Daaglikse Hoop op hul foon gesit het.

   ── Waarom die woorde presies so is ──

   Die teller tel toestelle wat OOIT geïnstalleer het — ook mense wat dit
   sedertdien afgehaal het. Dit is dus nie "6 400 mense gebruik dit" nie.

   "Meer as 6 400 mense het Daaglikse Hoop op hul foon gesit" is presies wat
   die getal meet, dit is net so sterk, en niemand kan dit ooit teen hom
   gebruik nie. 'n Getal wat 'n mens nie kan verdedig wanneer iemand vra, is
   erger as geen getal nie.

   ── Waarom dit een getal bly ná die Play Store ──

   'n Play Store-weergawe is 'n TWA: dieselfde webwerf, dieselfde oorsprong.
   Die app sien `display-mode: standalone` presies soos by 'n PWA, dus tel
   albei paaie in HIERDIE getal. Play Console sal sy eie kleiner getal wys —
   net wat deur Play kom — en dit is die getal wat lieg, nie hierdie een nie.

   ── Wat dit NIE doen nie ──

   Dit wys niks totdat die getal daar is, en dit wys nooit 'n fout nie. 'n
   Reel wat "0 mense" of "kon nie laai nie" sê op 'n blad wat iemand oorreed
   om te installeer, doen die teenoorgestelde van sy werk.

   Die afronding self staan in `src/data/installTelling.js`, want plain node
   kan nie 'n .jsx invoer nie en daardie logika moet getoets word.
   ──────────────────────────────────────────────────────────── */

import { useState, useEffect } from 'react'
import { rondAf, metSpasies } from '../data/installTelling'

/* Een keer per sessie gehaal, en gedeel deur elke plek wat dit wys. Sonder
   dit sou die popup en die blad elk hul eie oproep doen. */
let belofte = null

function haalTelling() {
  if (!belofte) {
    belofte = fetch('/api/count-install', { headers: { accept: 'application/json' } })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then(d => Number(d.total) || 0)
      /* 'n Mislukking word NIE onthou nie — die foon was dalk 'n oomblik
         aflyn, en die volgende blad moet weer kan probeer. */
      .catch(() => { belofte = null; return 0 })
  }
  return belofte
}

export default function InstallTelling({ klas = 'itel' }) {
  const [telling, setTelling] = useState(0)

  useEffect(() => {
    let lewendig = true
    haalTelling().then(n => { if (lewendig) setTelling(rondAf(n)) })
    return () => { lewendig = false }
  }, [])

  if (!telling) return null

  return (
    <p className={klas}>
      Meer as <b>{metSpasies(telling)}</b> mense het Daaglikse Hoop op hul foon gesit.
    </p>
  )
}
