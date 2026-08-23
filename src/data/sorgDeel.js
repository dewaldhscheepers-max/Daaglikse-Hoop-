/* ────────────────────────────────────────────────────────────
   Deel 'n antwoord of 'n video.

   Elke gedeelde skakel moet DIREK na daardie spesifieke stemantwoord of
   video in die app gaan, nie net na die tuisblad nie. Iemand wat 'n skakel
   op WhatsApp kry, moet die ding sien waaroor die persoon gepraat het —
   anders land hy op 'n vreemde blad en gaan weg.

   Die app vang die #-deel op wanneer hy laai (sien App.jsx se
   sorg-luisteraar) en maak Sorg by daardie plasing oop.
   ──────────────────────────────────────────────────────────── */

/* ── Die skakel ──
 *
 * Dewald: "dit moet soos bid nou se deel links werk."
 *
 * Bid Nou deel `https://dewaldscheepers.com/bid/<id>` — 'n gewone PAD. Sorg
 * het 'n HASH gedeel (`…/#sorg-plasing-<id>`) op wat ook al die blaaier se
 * eie gasheer was. Twee dinge daaraan is stukkend:
 *
 *   'n hash oorleef nie altyd wanneer 'n mens 'n skakel plak nie, en WhatsApp
 *   wys niks van hom nie;
 *   binne die geïnstalleerde app is `location.origin` daagliksehoop.co.za,
 *   dus het dieselfde app twee verskillende adresse gedeel.
 *
 * Nou is dit dieselfde vorm as Bid Nou: /sorg/<id>. Die ou hash word STEEDS
 * gelees (sien leesSorgSkakel), want daar loop skakels in mense se gesprekke
 * rond wat moet bly werk. */
export const DEEL_WORTEL = 'https://dewaldscheepers.com'

export function sorgSkakel(soort, id) {
  const skoon = encodeURIComponent(String(id || ''))
  return soort === 'video'
    ? `${DEEL_WORTEL}/sorg/video/${skoon}`
    : `${DEEL_WORTEL}/sorg/${skoon}`
}

/* Lees 'n plasing- of video-id uit 'n PAD. Gee { soort, id } of null. */
export function uitSorgPad(pad) {
  const p = String(pad || '')
  let m = p.match(/^\/sorg\/video\/([^/?#]+)\/?$/)
  if (m) return { soort: 'video', id: decodeURIComponent(m[1]) }
  m = p.match(/^\/sorg\/([^/?#]+)\/?$/)
  if (m && m[1] !== 'video') return { soort: 'plasing', id: decodeURIComponent(m[1]) }
  return null
}

/* Lees 'n skakel wat pas oopgemaak is. Gee { soort, id } of null. */
/* Wat pas oopgemaak is — 'n PAD (/sorg/<id>, nuut) of 'n HASH (#sorg-…, oud).
 *
 * Die pad word onthou in sessionStorage voordat ons dit uit die adresbalk vee,
 * want die diensketter herlaai die bladsy by 'n eerste besoek wanneer daar 'n
 * nuwe weergawe is — en dan is die pad weg. Dieselfde patroon as /bid/<id>. */
export function leesSorgSkakel(hash) {
  if (typeof window !== 'undefined' && hash === undefined) {
    try {
      const uitPad = uitSorgPad(window.location.pathname)
      if (uitPad) {
        sessionStorage.setItem('sorg_skakel', JSON.stringify(uitPad))
        window.history.replaceState({}, '', '/')
        return uitPad
      }
      const onthou = sessionStorage.getItem('sorg_skakel')
      if (onthou) return JSON.parse(onthou)
    } catch { /* privaat venster */ }
  }
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


/* ══════════════════════════════════════════════════════════════
   Die veilige uitnodigingslus
   ══════════════════════════════════════════════════════════════ */

/* Dewald, punt 16:
 *
 *   "Nadat iemand 'n ondersteuningantwoord geplaas het, wys: Jy het vandag by
 *    iemand gaan sit. Nooi iemand anders om ook saam te dra."
 *
 *   "Die algemene uitnodiging mag nie die skrywer se naam wys nie. Mag nie hul
 *    storie of sensitiewe besonderhede wys nie. Moet direk na Wag nog vir
 *    iemand lei."
 *
 * Die verskil tussen hierdie een en `nooiWoorde()` is die hele punt:
 *
 *   nooiOmTeAntwoord  → "hierdie MENS wag" — na een mens, oor een storie.
 *   algemeneWoorde    → "daar wag MENSE"  — na almal, oor niemand.
 *
 * Die tweede dra NIKS van 'n storie nie. Dit is die een wat 'n mens op
 * Facebook kan plak sonder om iemand se seer in 'n openbare tydlyn te sit.
 */
export function algemeneWoorde() {
  return 'Daar is mense op Daaglikse Hoop se Dra Mekaar se Laste wat vandag ' +
    'geskryf het en nog niemand het geantwoord nie. Jy hoef niks te weet nie — ' +
    'net te luister. ' + WORTEL_UITNODIGING
}

/* Dit lei DIREK na "Wag nog vir iemand", nooit na die tuisblad nie. Sien
   src/data/sorgSkakels.js. */
export const WORTEL_UITNODIGING = DEEL_WORTEL + '/sorg/wag?utm_source=uitnodiging&utm_medium=deel'

/* ── Mag hierdie storie BUITE Sorg gedeel word? ──
 *
 * Dewald: "'n Spesifieke storie mag slegs buite Sorg gedeel word indien die
 * skrywer afsonderlik toestemming gee. Hierdie toestemming is standaard
 * afgeskakel. Is apart van toestemming om die storie binne Sorg te plaas."
 *
 * Twee toestemmings, en hulle is nie dieselfde ding nie: "plaas my storie op
 * die muur" en "sit my storie op Facebook" is vir die mens wat dit geskryf
 * het, twee heeltemal verskillende dinge.
 *
 * Die verstek is AF, en 'n ontbrekende veld is af. Elke ou plasing — en elke
 * plasing wat vandag geskryf word sonder om die blokkie te merk — kan dus net
 * BINNE die app gedeel word, en 'n mens wat "Deel" druk, kry die algemene
 * uitnodiging in plaas daarvan.
 */
export function magBuiteDeel(plasing) {
  return !!(plasing && plasing.deelBuite === true)
}
