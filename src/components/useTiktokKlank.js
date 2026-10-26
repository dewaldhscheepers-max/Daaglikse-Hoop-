/* ── TikTok se klank in 'n ingebedde speler ──
 *
 * Gedeel deur Bid Saam se videogebed (SaturdayVideoCard) en Dra Mekaar se
 * video's (SorgVideo). Een plek, sodat die twee blaaie nooit uitmekaar dryf.
 *
 * Hulle speler begin ALTYD gedemp (src/data/tiktokKlank.js). Die mens druk
 * hulle EIE speelknoppie, BINNE hulle raam, en daardie druk sien ons nie —
 * behalwe dat die venster sy fokus aan die raam afgee (`blur`, met DIE raam as
 * `document.activeElement`). Dan stuur ons die ontdemp-boodskappe op 'n kort,
 * begrensde ry tydhouers, en een keer weer by daardie raam se eerste antwoord
 * daarna. Nooit 'n interval nie, en nooit 'n antwoord op elke boodskap nie —
 * hulle speler antwoord op 'n opdrag, en dit sou 'n eindelose pingpong wees.
 *
 * Staan daar meer as een TikTok-raam op 'n blad (Dra Mekaar se lys), kyk elke
 * raam net na sy EIE fokus en sy EIE boodskappe (`e.source`).
 */
import { useEffect } from 'react'
import { stelKlank, isTiktokBoodskap } from '../data/tiktokKlank'

export default function useTiktokKlank(raamRef, aan, sleutel) {
  useEffect(() => {
    if (!aan) return
    const raam = raamRef.current
    if (!raam) return
    let ts = []
    let wagVirAntwoord = false
    const stuur = () => stelKlank(raam.contentWindow, true)
    function opBlur() {
      if (document.activeElement !== raam) return
      ts.forEach(clearTimeout)
      ts = [0, 200, 600, 1200, 2000, 3500].map(ms => setTimeout(stuur, ms))
      wagVirAntwoord = true
    }
    function opBoodskap(e) {
      if (!wagVirAntwoord || !isTiktokBoodskap(e)) return
      if (e.source && e.source !== raam.contentWindow) return
      wagVirAntwoord = false
      stuur()
    }
    window.addEventListener('blur', opBlur)
    window.addEventListener('message', opBoodskap)
    return () => {
      window.removeEventListener('blur', opBlur)
      window.removeEventListener('message', opBoodskap)
      ts.forEach(clearTimeout)
    }
  }, [raamRef, aan, sleutel])
}
