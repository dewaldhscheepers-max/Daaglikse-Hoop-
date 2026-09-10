/* Die VOLG JESUS-kaart op die tuisblad, direk onder die speler.
 *
 * Dewald: "remember die picture button wat ek gestuur het vir homepage
 * directly under die luister nou screen."
 *
 * Hierdie lêer bestaan sodat Luister.jsx EEN reël bykry. Luister is die
 * belangrikste skerm in die app en sy navigasie mag nie aangeraak word nie
 * (CLAUDE.md); die haal-werk, die toestand en die besluit oor of die kaart
 * hoegenaamd wys, staan dus hier.
 *
 * ── Die kaart wys nie altyd nie ──
 *
 * Is niks gepubliseer nie — of val die eindpunt om — dan is daar niks. 'n
 * Knoppie wat op 'n leë skerm uitkom, is erger as geen knoppie nie, en hierdie
 * blad is die plek waar die oggendkennisgewing elke dag duisende mense laat
 * land.
 *
 * Terwyl dit laai, wys ook niks. 'n Kaart wat 'n halwe sekonde ná die res
 * inspring, stamp die blad onder iemand se duim uit.
 */
import { useEffect, useState } from 'react'
import VolgJesusKnoppie from './VolgJesusKnoppie'
import { kaartKeuse } from '../data/volgJesusBegin'

export default function VolgJesusKaart() {
  const [weke, setWeke] = useState(null)

  useEffect(() => {
    let dood = false
    fetch('/api/volg-jesus-openbaar')
      .then(r => r.json())
      .then(j => { if (!dood) setWeke(Array.isArray(j && j.weke) ? j.weke : []) })
      .catch(() => { if (!dood) setWeke([]) })
    return () => { dood = true }
  }, [])

  if (!weke || !weke.length) return null

  const nommers = weke.map(w => w.weeknommer)

  let myne = 1
  let modus = ''
  try {
    const n = Number(localStorage.getItem('vj_my_week'))
    if (Number.isInteger(n) && n >= 1) myne = n
    modus = localStorage.getItem('vj_modus') || ''
  } catch {}

  /* Die merkies per week — DIT is die waarheid oor waar hierdie mens is, nie
     `vj_my_week` nie. Daardie teller skuif net wanneer Dag 5 in die app
     klaargemaak word, en 10 September 2026 het die kaart "WEEK 4 — GAAN VOORT"
     gewys aan iemand wat Week 4 klaar gehad het. Sien kaartKeuse(). */
  const klaarPerWeek = {}
  for (const n of nommers) {
    try { klaarPerWeek[n] = JSON.parse(localStorage.getItem(`vj_klaar_w${n}`) || '[]') }
    catch { klaarPerWeek[n] = [] }
  }

  const keuse = kaartKeuse({ myne, nommers, klaarPerWeek, modus })
  if (!keuse) return null

  const inligting = weke.find(w => w.weeknommer === keuse.nommer)

  return (
    <VolgJesusKnoppie
      week={keuse.begin ? {
        nommer: keuse.nommer,
        titel: (inligting && inligting.titel) || '',
        wag: keuse.wag,
        volgende: keuse.volgende,
      } : null}
      opKlik={() => window.dispatchEvent(new CustomEvent('open-volg-jesus'))}
    />
  )
}
