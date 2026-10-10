/* ────────────────────────────────────────────────────────────
   Die LUISTER-speler se suiwer helfte: 'n hoofstuk se teks in klein
   SPREEK-stukke, en die keuse van 'n Engelse stem.

   Dewald, 9 Oktober 2026: die foon se eie text-to-speech lees die onttrekte
   teks voor (browser TTS, soos die MVP). Twee dinge moet suiwer en getoets
   wees, want 'n blaaier kan hulle nie self regkry nie:

   ── Hoekom STUKKE ──

   'n Blaaier se `speechSynthesis` kap 'n lang uiting af — op party toestelle ná
   sowat 15 sekondes, op ander by 'n paar duisend karakters. 'n Mens gee dit dus
   nie 'n hele hoofstuk nie; 'n mens gee dit sin vir sin en ry hulle agtermekaar.
   Klein stukke het nog 'n voordeel: "pouse" op 'n foon is onbetroubaar, dus
   KANSELLEER die speler en begin die HUIDIGE stuk oor by "speel weer" — en as
   die stuk een sin is, is dit skaars hoorbaar.

   ── Hoekom 'n STEM gekies word ──

   `getVoices()` gee 'n lys in die toestel se eie volgorde, en die eerste een is
   dikwels nie Engels nie. Ons kies 'n Engelse stem as daar een is; is daar geen,
   los ons dit aan die blaaier oor (`null`) — 'n verkeerde stem is beter as geen
   klank.

   Suiwer: teks/lys in, 'n antwoord uit. Geen window, geen speechSynthesis.
   ──────────────────────────────────────────────────────────── */

/* Hoogstens soveel karakters per stuk. Kort genoeg om onder elke blaaier se
   afkap-grens te bly, lank genoeg dat die stem natuurlik vloei. */
export const MAKS_STUK = 220

/* Breek teks in sinne, en pak kort sinne saam tot MAKS_STUK. 'n Enkele sin wat
   langer as MAKS_STUK is, word by 'n spasie hard gebreek. */
export function maakStukke(teks) {
  const skoon = String(teks || '').replace(/\s+/g, ' ').trim()
  if (!skoon) return []

  /* Sinne: ná . ! ? (en hul aanhalings) wat 'n spasie volg. Nuwe reels is reeds
     tot spasies gemaak, dus is paragraaf-grense weg — die onttrekker het hulle
     klaar in afdelings verdeel. */
  const rou = skoon.match(/[^.!?]+[.!?]+(?:["'”’)]+)?|\S[^.!?]*$/g) || [skoon]
  const sinne = rou.map(s => s.trim()).filter(Boolean)

  const stukke = []
  let buffer = ''
  for (const sin of sinne) {
    /* 'n Sin wat op sy eie te lank is: breek hom hard op spasies. */
    if (sin.length > MAKS_STUK) {
      if (buffer) { stukke.push(buffer); buffer = '' }
      stukke.push(...hardBreek(sin))
      continue
    }
    if (!buffer) { buffer = sin; continue }
    if (buffer.length + 1 + sin.length <= MAKS_STUK) buffer += ' ' + sin
    else { stukke.push(buffer); buffer = sin }
  }
  if (buffer) stukke.push(buffer)
  return stukke
}

function hardBreek(sin) {
  const woorde = sin.split(' ')
  const uit = []
  let r = ''
  for (const w of woorde) {
    if (!r) { r = w; continue }
    if (r.length + 1 + w.length <= MAKS_STUK) r += ' ' + w
    else { uit.push(r); r = w }
  }
  if (r) uit.push(r)
  return uit
}

/* Hoeveel stukke 'n hele boek het — 'n mens se vordering word hierteen gemeet. */
export function totaleStukke(afdelings) {
  return (Array.isArray(afdelings) ? afdelings : [])
    .reduce((n, a) => n + maakStukke(a && a.teks).length, 0)
}

/* ── Kies 'n Engelse stem ──
 *
 * Voorkeur: 'n plaaslike (op die toestel geïnstalleerde) Engelse stem, en onder
 * die Engelses 'n Suid-Afrikaanse/Britse voor 'n Amerikaanse — nader aan hoe die
 * meeste van hierdie mense Engels hoor. Gee `null` as daar geen Engelse stem is;
 * dan kies die blaaier self. */
export function kiesStem(stemme, voorkeur = ['en-za', 'en-gb', 'en-au', 'en-us', 'en']) {
  const lys = Array.isArray(stemme) ? stemme.filter(s => s && typeof s.lang === 'string') : []
  if (!lys.length) return null
  const engels = lys.filter(s => s.lang.toLowerCase().startsWith('en'))
  if (!engels.length) return null

  for (const pre of voorkeur) {
    /* Eers 'n plaaslike stem wat pas, dan enige wat pas. */
    const plaaslik = engels.find(s => s.lang.toLowerCase().startsWith(pre) && s.localService)
    if (plaaslik) return plaaslik
    const enige = engels.find(s => s.lang.toLowerCase().startsWith(pre))
    if (enige) return enige
  }
  return engels[0]
}
