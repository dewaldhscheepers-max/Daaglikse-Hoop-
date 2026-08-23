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

/* Die uitnodiging se veldtog. Sonder dit lyk elke mens wat deur 'n gedeelde
   skakel kom, soos "direk", en dan lyk dit of deel niemand bring nie. Sien
   src/data/sorgMeet.js. */
const UITNODIGING_UTM = '?utm_source=uitnodiging&utm_medium=deel'

export function sorgSkakel(soort, id, { veldtog = true } = {}) {
  const skoon = encodeURIComponent(String(id || ''))
  const pad = soort === 'video'
    ? `${DEEL_WORTEL}/sorg/video/${skoon}`
    : `${DEEL_WORTEL}/sorg/${skoon}`
  return veldtog ? pad + UITNODIGING_UTM : pad
}

/* Lees 'n plasing- of video-id uit 'n PAD. Gee { soort, id } of null. */
export function uitSorgPad(pad) {
  /* Die navraagstring en die hash val eers weg. 'n Gedeelde skakel dra nou 'n
     veldtog (?utm_source=uitnodiging), en sonder hierdie reël sou daardie
     skakel niks lees nie en die mens op die tuisblad land. */
  const p = String(pad || '').split('?')[0].split('#')[0]
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

/* ── Stuur, presies soos Bid Nou stuur ──
 *
 * Dewald: "maak seker dit werk reg soos bid nou se share knopie dat dit die
 * selfde stappe vat."
 *
 * Die verskil was een veld, en dit was sigbaar: ons het `{ text, url }` aan
 * `navigator.share` gegee terwyl die adres AL in die teks was. WhatsApp plak
 * dan albei aan mekaar, en die boodskap het die skakel TWEE KEER gedra.
 *
 * Bid Nou doen dit reg: die adres staan IN die teks, en `url` word nooit
 * saamgestuur nie. Sien `stuurMyVersoek()` in BidSaam.jsx.
 *
 * Die terugval is ook syne: knipbord, en dan 'n prompt vir 'n blaaier waar
 * die knipbord toe is. Dit is die enigste pad wat op elke foon werk.
 */
async function stuurDeel(teks) {
  if (navigator.share) {
    try { await navigator.share({ text: teks }); return true } catch (e) {
      if (e && e.name === 'AbortError') return false
    }
  }
  try {
    await navigator.clipboard.writeText(teks)
    return true
  } catch {
    try { window.prompt('Kopieer hierdie boodskap:', teks) } catch { /* geen venster */ }
    return false
  }
}

export async function deelSorg(soort, id, titel) {
  return stuurDeel(nooiWoorde(sorgSkakel(soort, id)))
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
export function nooiWoorde(skakel) {
  /* Dewald se eie woorde, 24 Augustus 2026. Hy het die vorige weergawe gelees
     en gesê: "dit klink fokken dom."
     
     Wat sy weergawe reg doen en myne verkeerd gedoen het: dit praat met die
     MENS wat dit kry, nie oor die blad nie. "Ek het gedink jy het dalk iets"
     is 'n rede om te kom; "daar is mense wat wag" is 'n advertensie.
     
     Dit verklap NIKS: geen naam, geen sin uit die storie, geen onderwerp. Wie
     dit kry, moet dit oopmaak om te sien waaroor dit gaan — en dan is hy op
     die blad. */
  return [
    'Ek het hierdie storie op Daaglikse Hoop se Dra Mekaar gesien en gedink jy '
      + 'het dalk iets wat hierdie persoon kan bemoedig.',
    'As jy wil, lees hulle storie en deel ’n paar woorde van hoop.',
    '',
    String(skakel || ''),
  ].join('\n')
}

export async function nooiOmTeAntwoord(soort, id) {
  return stuurDeel(nooiWoorde(sorgSkakel(soort, id)))
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
export function algemeneWoorde(skakel = WORTEL_UITNODIGING) {
  /* Dieselfde stem as `nooiWoorde`, net sonder 'n spesifieke storie. Dit word
     gebruik wanneer daar niks is om na te wys nie. */
  return [
    'Ek het op Daaglikse Hoop se Dra Mekaar gesien daar is mense wat vandag '
      + 'geskryf het en nog vir iemand wag.',
    'As jy wil, gaan lees een van hulle stories en deel ’n paar woorde van hoop.',
    '',
    String(skakel || ''),
  ].join('\n')
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
