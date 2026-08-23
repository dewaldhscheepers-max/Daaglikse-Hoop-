/* Die onsuiwer helfte van `sorgMeet.js`: die versoek en die veldtog op die
   foon. Die reëls self is suiwer en word met plain `node` getoets.

   Drie reëls geld hier, dieselfde as `telSorg.js`:

     1. Dit mag NOOIT die skerm ophou nie. Geen `await` waar 'n mens op wag,
        geen fout wat opborrel. 'n Teller wat iemand se gebedsversoek keer, is
        erger as geen teller nie.
     2. Dit mag nie twee keer tel nie. React se ontwikkelingsmodus roep effekte
        twee keer.
     3. `keepalive`, sodat 'n telling nie verlore gaan wanneer die blad op
        daardie oomblik toegemaak word nie. */

import { keurGebeurtenis } from './sorgMeet'
import { UTM_SLEUTEL, leesUtm, saamvoegVeldtog, uitPad } from './sorgSkakels'

const PAD = '/api/sorg-meet'
const EENMALIG = new Set()

export function meet(gebeurtenis, { eenmalig = false, bron = '' } = {}) {
  try {
    if (!keurGebeurtenis(gebeurtenis)) return
    if (eenmalig) {
      if (EENMALIG.has(gebeurtenis)) return
      EENMALIG.add(gebeurtenis)
    }
    fetch(PAD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gebeurtenis, bron }),
      keepalive: true,
    }).catch(() => {})
  } catch { /* 'n teller mag nooit 'n skerm breek nie */ }
}

/* ── Die veldtog ──

   Dit word by die EERSTE besoek gestoor en oorleef die installasie. 'n Mens
   kom van Facebook af, installeer die app 'n week later, en sonder hierdie
   stuk weet niemand meer waar hy vandaan kom nie. */
export function leesVeldtog() {
  try { return JSON.parse(localStorage.getItem(UTM_SLEUTEL) || 'null') } catch { return null }
}

export function onthouVeldtog(soek) {
  const nuut = leesUtm(soek)
  const saam = saamvoegVeldtog(leesVeldtog(), nuut)
  if (saam) {
    try { localStorage.setItem(UTM_SLEUTEL, JSON.stringify(saam)) } catch { /* privaat venster */ }
  }
  return saam
}

/* ── Wat by 'n oopmaak getel word ──
 *
 * Een oproep, en dit dra die bron saam. Dit loop EEN keer per bladlaai.
 *
 * `diep` is apart: dit sê hoeveel mense op die REGTE skerm land in plaas van
 * op die tuisblad. Dit is die getal wat sê of punt 15 werk. */
export function meetOopmaak(soek = '', pad = '') {
  const veldtog = onthouVeldtog(soek)
  meet('besoek', { eenmalig: true, bron: (veldtog && veldtog.bron) || '' })

  const doel = uitPad(pad)
  if (doel && doel.skerm !== 'sorg') meet('diep', { eenmalig: true })
  if (/[?&]k=1\b/.test(String(soek || ''))) meet('kennisOop', { eenmalig: true })
  return veldtog
}
