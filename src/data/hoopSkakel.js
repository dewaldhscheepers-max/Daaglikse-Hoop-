/* ────────────────────────────────────────────────────────────
   Die gedeelde skakel: /hoop/<nota-id>

   ── Waarom dit die NOTA dra en nie die app nie ──

   Die knoppie aan die einde van Vandag se Tyd met God stuur woorde wat 'n
   belofte maak:

       "Ek het vandag hierdie geluister en aan jou gedink."

   "Hierdie" is 'n spesifieke boodskap. Stuur die skakel 'n mens na die
   tuisblad, is dit nie meer 'n geskenk nie — dit is 'n advertensie, en die
   woorde daarby word 'n leuen. Die skakel dra dus die nota se id, en die
   ontvanger hoor PRESIES wat sy vriendin gehoor het.

   ── En hy word nie gedwing om te installeer nie ──

   Die ontvanger land op die boodskap, in sy blaaier, sonder om iets af te
   laai en sonder om te registreer. Eers NA die ervaring vra ons of hy dit
   more weer wil hê. Dieselfde besluit as `/bid/<id>`, en om dieselfde rede:
   'n installasiemuur voor die waarde is hoe 'n mens 'n vreemdeling verloor.

   ── Wat hier NIE inkom nie ──

   Geen sender-id, geen naam, geen merker wat twee mense aan mekaar koppel.
   Die skakel sê wát gedeel is, nooit deur wie nie. 'n Skakel wat 'n mens kan
   terugvolg na die persoon wat hom gestuur het, is 'n ding wat hierdie app
   nie oor homself wil kan sê nie.
   ──────────────────────────────────────────────────────────── */

export const BASIS = 'https://dewaldscheepers.com'

/* Nota-id's in hierdie app lyk soos `Nie_my_wil_nie_1788231738800` — die
   titel, skoongemaak, plus 'n tydstempel. Ons aanvaar ruim, maar nooit 'n
   skuinsstreep nie (dit sou 'n ander pad word) en nooit iets absurd lank nie. */
const MAKS = 300

export function geldigeId(id) {
  const s = String(id || '').trim()
  if (!s || s.length > MAKS) return false
  if (s.includes('/')) return false
  /* Beheerkarakters, UITGESKRYF as \u-ontsnappings en nooit as 'n
     karakterreeks nie. `[ -<]` LYK soos vier karakters en is 'n reeks van
     spasie tot < — dit sou elke gewone id verwerp.

     Hierdie reel is met python geskryf. 'n Redigeerder skryf sulke
     ontsnappings maklik as ROU grepe, en dan is die bronleer 'n binere
     leer wat grep nie meer kan lees nie. Albei foute staan in CLAUDE.md
     en ek het albei hier gemaak voor ek dit reggemaak het. */
  if (/[\u0000-\u001f\u007f]/.test(s)) return false
  return true
}

/* Die skakel wat in WhatsApp beland. */
export function hoopSkakel(notaId, basis = BASIS) {
  if (!geldigeId(notaId)) return null
  const skoon = String(basis || BASIS).replace(/\/+$/, '')
  return `${skoon}/hoop/${encodeURIComponent(String(notaId).trim())}`
}

/* Lees die id uit 'n pad. Gee null vir enigiets anders — dan gaan die app
   eenvoudig sy gewone gang. */
export function idUitPad(pad) {
  const s = String(pad || '')
  const m = s.match(/^\/hoop\/([^/?#]+)\/?$/i)
  if (!m) return null
  let id
  try { id = decodeURIComponent(m[1]) } catch { id = m[1] }
  id = id.trim()
  return geldigeId(id) ? id : null
}

/* ── Die woorde ──
 *
 * Dit is die belangrikste string in hierdie lêer, en dit is met opset NIE
 * "Laai Daaglikse Hoop af" nie. Daardie sin is advertensietaal en 'n mens
 * stuur dit nie aan 'n vriendin wat swaarkry nie.
 *
 * Hierdie een klink soos een mens wat aan 'n ander mens dink, want dit is wat
 * werklik gebeur het. Dit is die enigste rede waarom iemand dit sal stuur.
 */
export function deelBoodskap(skakel) {
  const s = String(skakel || '').trim()
  const sin = 'Ek het vandag hierdie geluister en aan jou gedink. Dalk het jy dit vandag ook nodig.'
  return s ? `${sin}\n\n${s}` : sin
}

/* Wat die ontvanger bo-aan sy skerm sien. Nooit 'n naam nie — ons weet nie
   wie gestuur het nie en wil dit ook nie weet nie. */
export const ONTVANG_TITEL = 'Iemand het vandag se hoop met jou gedeel'
