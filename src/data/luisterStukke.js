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

/* ── Kies 'n Engelse MANSTEM, so natuurlik as moontlik ──
 *
 * Dewald, 10 Oktober 2026: *"change it to a normal man voice not woman. As
 * normal as possible."*
 *
 * Die blaaier sê NIE of 'n stem 'n man of 'n vrou is nie — `SpeechSynthesisVoice`
 * het geen geslag-veld nie. Die enigste eerlike teken is die NAAM (en op Android
 * die stemkode in `voiceURI`). Daarom twee lyste van bekende name:
 *
 *   MANS    — Apple (Daniel, Aaron, Arthur, Gordon, Rishi, Alex, Fred, Oliver,
 *             Tom), Microsoft (Guy, Ryan, Christopher, Eric, Andrew, Brian,
 *             William, Liam, David, Mark, George, James, Thomas, Luke), Google
 *             ("… Male"), en Android se kodes (iol, iom, tpd, gbb, gbd, rjs, aub,
 *             aud).
 *   VROUE   — sodat 'n naam wat met "female" eindig of 'n bekende vrouenaam
 *             nooit as man deurgaan nie ("Female" bevat "male").
 *
 * Volgorde van belang: MAN, dan NATUURLIK (Natural/Neural/Enhanced/Premium —
 * dit is die stemme wat nie soos 'n robot klink nie), dan die taal (SA, Brits,
 * Australies, Amerikaans), dan plaaslik. Ons verlaag NIE die toonhoogte van 'n
 * vrouestem om 'n man na te maak nie — dit klink soos 'n vervormde stem, die
 * teenoorgestelde van "so normaal as moontlik".
 *
 * Is daar geen manstem op die foon nie (Chrome op Android wys dikwels net EEN
 * stem per taal, sonder naam), kies ons die beste wat daar is. Dan besluit die
 * foon se eie spraak-instelling. Gee `null` as daar geen Engelse stem is nie. */
const MANS = /\b(daniel|aaron|arthur|gordon|rishi|alex|fred|oliver|tom|guy|ryan|christopher|eric|andrew|brian|william|liam|david|mark|george|james|thomas|luke|lee|male)\b|x-(iol|iom|tpd|gbb|gbd|rjs|aub|aud)\b/i
const VROUE = /female|\b(samantha|karen|moira|tessa|victoria|zira|hazel|susan|libby|sonia|jenny|aria|natasha|catherine|serena|kate|fiona|veena|emma|ava|allison|leah|clara|michelle|sara|nicky|martha|joanna|salli|kimberly|ivy|amy|olivia)\b|x-(sfg|iob|iog|tpc|tpf|gba|gbc|gbg|aua|auc)\b/i
const NATUURLIK = /natural|neural|enhanced|premium|online/i

function etiket(s) { return `${s.name || ''} ${s.voiceURI || ''}` }
export function isManstem(s) { const e = etiket(s); return MANS.test(e) && !VROUE.test(e) }

export function kiesStem(stemme, voorkeur = ['en-za', 'en-gb', 'en-au', 'en-us', 'en']) {
  const lys = Array.isArray(stemme) ? stemme.filter(s => s && typeof s.lang === 'string') : []
  const engels = lys.filter(s => s.lang.toLowerCase().startsWith('en'))
  if (!engels.length) return null

  const taalRang = s => {
    const l = s.lang.toLowerCase().replace('_', '-')
    const i = voorkeur.findIndex(pre => l.startsWith(pre))
    return i < 0 ? voorkeur.length : i
  }
  /* Laer is beter, in hierdie volgorde. */
  const sleutel = s => [isManstem(s) ? 0 : 1, NATUURLIK.test(etiket(s)) ? 0 : 1, taalRang(s), s.localService ? 0 : 1]
  return engels.slice().sort((a, b) => {
    const x = sleutel(a), y = sleutel(b)
    for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] - y[i]
    return 0
  })[0]
}
