/* ────────────────────────────────────────────────────────────
   Die gedeelde skakel: /boek/<boek-id>

   Dewald, 1 Oktober 2026: *"voeg knoppie by al die eboeke op die blad wat sê
   share of deel..... daar is geen deel knoppie op enige eboek. En dis juis hoe
   die app groei."*

   Hy is reg, en dit was 'n gat: 21 gratis boeke, 11 941 aflaaie, en geen
   enkele manier om een aan iemand te stuur nie.

   ── Waarom dit die BOEK dra en nie die app nie ──

   Dieselfde reël as `/hoop/<nota-id>`, en om dieselfde rede. 'n Mens stuur nie
   "laai hierdie app af" aan 'n vriendin nie — sy stuur 'n BOEK, want sy ken
   die vriendin en sy weet waarmee sy sukkel:

       "Hierdie boek het my gehelp. Dit is gratis."

   "Hierdie" is 'n spesifieke boek. Land die skakel op die tuisblad, moet die
   ontvanger self deur 'n biblioteek van 21 soek — en die sin daarby word 'n
   leuen. Die skakel dra dus die boek se id, en die blad rol na presies daardie
   kaart.

   ── Wat hier NIE inkom nie ──

   Geen sender-id, geen naam, geen merker wat twee mense aan mekaar koppel.
   Dieselfde grens as elke ander deel-skakel in hierdie app: dit sê WAT gedeel
   is, nooit deur wie nie.

   Hierdie lêer is SUIWER: 'n id in, 'n string uit. Geen window, geen fetch.
   ──────────────────────────────────────────────────────────── */

export const BASIS = 'https://dewaldscheepers.com'

/* Boek-id's is slakvorm: `bid-nou`, `toksies`, of 'n opgelaaide een met 'n
   tydstempel agteraan — `skinderstories-1758500000000`. Ons aanvaar ruim, maar
   nooit 'n skuinsstreep nie (dit sou 'n ander pad word) en nooit iets absurd
   lank nie. */
const MAKS = 120

export function geldigeId(id) {
  const s = String(id || '').trim()
  if (!s || s.length > MAKS) return false
  if (s.includes('/')) return false
  /* Beheerkarakters, UITGESKRYF as \u-ontsnappings en nooit as 'n
     karakterreeks nie. `[ -<]` LYK soos vier karakters en is 'n reeks van
     spasie tot `<`. Sien CLAUDE.md. */
  if (/[\u0000-\u001f\u007f]/.test(s)) return false
  return true
}

/* Die skakel wat in WhatsApp beland. */
export function boekSkakel(boekId, basis = BASIS) {
  if (!geldigeId(boekId)) return null
  const skoon = String(basis || BASIS).replace(/\/+$/, '')
  return `${skoon}/boek/${encodeURIComponent(String(boekId).trim())}`
}

/* Lees die id uit 'n pad. Gee `null` vir enigiets anders — dan gaan die app
   eenvoudig sy gewone gang. */
export function idUitPad(pad) {
  const s = String(pad || '')
  const m = s.match(/^\/boek\/([^/?#]+)\/?$/i)
  if (!m) return null
  let id
  try { id = decodeURIComponent(m[1]) } catch { id = m[1] }
  id = id.trim()
  return geldigeId(id) ? id : null
}

/* ── Die woorde ──
 *
 * Dit is die belangrikste string in hierdie lêer, en dit is met opset NIE
 * "Laai Daaglikse Hoop af" nie. Daardie sin is advertensietaal, en 'n mens
 * stuur dit nie aan 'n vriendin nie.
 *
 * Die sin wat WEL gestuur word, is 'n mens wat aan 'n ander mens dink, en
 * "gratis" staan daarin omdat dit die ding is wat die ontvanger laat kliek:
 * sonder dit lyk dit soos nog 'n ding wat geld gaan vra.
 *
 * Die TITEL kom saam, want 'n kaal skakel sê niks. "Grense" vertel die
 * ontvanger binne een woord of dit vir haar is.
 */
export function deelBoodskap(titel, skakel) {
  const t = String(titel || '').trim()
  const s = String(skakel || '').trim()
  const sin = t
    ? `Hierdie e-boek het my gehelp: "${t}". Dit is heeltemal gratis.`
    : 'Hierdie e-boek het my gehelp, en dit is heeltemal gratis.'
  return s ? `${sin}\n\n${s}` : sin
}
