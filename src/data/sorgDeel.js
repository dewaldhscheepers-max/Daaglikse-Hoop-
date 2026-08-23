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
    ? `${titel || 'Iets van Daaglikse Hoop'} — Sorg & Ondersteuning`
    : 'Dit het my gehelp. Dalk help dit jou ook — Sorg & Ondersteuning op Daaglikse Hoop.'

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

/* ── Nooi iemand om te ANTWOORD ──
 *
 * Dit is nie dieselfde ding as Deel nie, en die verskil is die hele punt.
 *
 * `deelSorg` sê: kyk hierna. Dit gaan na almal.
 * `nooiOmTeAntwoord` sê: JY het iets om te sê vir hierdie mens. Dit gaan na
 * EEN mens, gekies omdat hy deur iets soortgelyks is.
 *
 * Dewald: "die app moet heavy fokken groei." Dit is die pad wat werk, want
 * die versoek is nie "laai my app af" nie — dit is "jou ervaring kan iemand
 * help". 'n Mens sê nie maklik nee daarvoor nie, en die persoon wat kom, kom
 * met 'n rede om iets te DOEN, nie net om te kyk nie.
 *
 * Die skakel is dieselfde diep skakel as Deel, dus land die mens BY daardie
 * plasing en nie op die tuisblad nie. */
export function nooiWoorde(titel) {
  const oor = String(titel || '').trim()
  return oor
    ? `Ek het hierdie storie op Daaglikse Hoop se Sorg & Ondersteuning gesien: `
      + `“${oor}”. Ek dink jy het dalk iets waardevols om vir hierdie persoon te sê.`
    : 'Ek het hierdie storie op Daaglikse Hoop se Sorg & Ondersteuning gesien. '
      + 'Ek dink jy het dalk iets waardevols om vir hierdie persoon te sê.'
}

export async function nooiOmTeAntwoord(soort, id, titel) {
  const url = sorgSkakel(soort, id)
  const teks = nooiWoorde(titel)
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
