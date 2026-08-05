/* ────────────────────────────────────────────────────────────
   Deel 'n antwoord of 'n video.

   Elke gedeelde skakel moet DIREK na daardie spesifieke stemantwoord of
   video in die app gaan, nie net na die tuisblad nie. Iemand wat 'n skakel
   op WhatsApp kry, moet die ding sien waaroor die persoon gepraat het —
   anders land hy op 'n vreemde blad en gaan weg.

   Die app vang die #-deel op wanneer hy laai (sien App.jsx se
   sorg-luisteraar) en maak Sorg by daardie plasing oop.
   ──────────────────────────────────────────────────────────── */

export function sorgSkakel(soort, id) {
  const wortel = typeof window !== 'undefined' ? window.location.origin : ''
  return `${wortel}/#sorg-${soort}-${encodeURIComponent(id)}`
}

/* Lees 'n skakel wat pas oopgemaak is. Gee { soort, id } of null. */
export function leesSorgSkakel(hash) {
  const h = String(hash || (typeof window !== 'undefined' ? window.location.hash : ''))
  const m = /^#sorg-(plasing|video)-(.+)$/.exec(h)
  return m ? { soort: m[1], id: decodeURIComponent(m[2]) } : null
}

export async function deelSorg(soort, id, titel) {
  const url = sorgSkakel(soort, id)
  const teks = soort === 'video'
    ? `${titel || 'Iets van Daaglikse Hoop'} — Pastorale Sorg`
    : 'Dit het my gehelp. Dalk help dit jou ook — Pastorale Sorg op Daaglikse Hoop.'

  try {
    if (navigator.share) {
      await navigator.share({ title: 'Daaglikse Hoop', text: teks, url })
      return true
    }
    await navigator.clipboard.writeText(teks + '\n' + url)
    return true
  } catch (e) {
    if (e && e.name === 'AbortError') return false
    try { await navigator.clipboard.writeText(teks + '\n' + url); return true } catch { return false }
  }
}
