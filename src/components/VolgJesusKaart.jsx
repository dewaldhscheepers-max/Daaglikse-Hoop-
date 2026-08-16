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
import { kiesWeek } from '../data/volgJesusOpenbaar'

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

  let myne = 1
  try {
    const n = Number(localStorage.getItem('vj_my_week'))
    if (Number.isInteger(n) && n >= 1) myne = n
  } catch {}

  const nommers = weke.map(w => w.weeknommer)
  const keuse = kiesWeek(myne, nommers)

  /* Wie reeds begin het, sien sy eie week en "GAAN VOORT". Wie verby die
     laaste lewende week is, sien ook sy laaste week — nie 'n leë kaart nie;
     die skerm daarbinne verduidelik dat die volgende een kom. */
  const wys = keuse.nommer || keuse.klaar
  const inligting = weke.find(w => w.weeknommer === wys)
  const begin = myne <= 1

  return (
    <VolgJesusKnoppie
      week={begin ? null : { nommer: wys, titel: (inligting && inligting.titel) || '' }}
      opKlik={() => window.dispatchEvent(new CustomEvent('open-volg-jesus'))}
    />
  )
}
