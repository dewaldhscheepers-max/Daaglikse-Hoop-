/* ────────────────────────────────────────────────────────────
   Hoe lank gelede, en watter kring.

   Dewald het Facebook se opmerkings langs ons s'n gesit en gevra hoekom
   hulle beter lyk en beter werk. Twee van die verskille is klein en
   meganies, en albei sit hier:

   ── 1. "6 Augustus" teenoor "3 u" ──

   'n Absolute datum laat 'n mens SOM. Hy sien "6 Augustus", moet onthou dis
   vandag die 23ste, en dan weet hy dit is oud. Facebook skryf nooit 'n datum
   op 'n vars opmerking nie — dit skryf "1h", "2h", "5d". Die getal SE hoe
   lewendig die gesprek is sonder dat 'n mens iets uitwerk.

   Op hierdie blad tel dit dubbel: 'n mens wat vandag geskryf het en drie
   opmerkings sien, moet kan sien dat mense NOU by hom is, nie in Augustus
   nie.

   Die leer is suiwer — die tyd kom altyd van buite af. Dit is die enigste
   manier om "gister" te toets sonder om te wag.

   ── 2. Elke kring dieselfde kleur ──

   Facebook wys regte gesigte, en dis hoekom 'n mens BO-AAN 'n draad kan
   sien dat daar vyf verskillende mense praat. Ons muur is anoniem: daar IS
   geen gesig nie, en 'n voorletter uit "Anoniem" sou 'n leuen wees — almal
   sou dieselfde "A" dra.

   Wat oorbly, is kleur. 'n Kring wat per opmerking verskil, se met een
   oogopslag "hier praat verskillende mense", sonder om iets oor iemand te
   beweer. Dewald se klag oor die vorige weergawe was presies dit: "Niks
   staan uit nie. Dis juis die probleem alles is selle kleur."

   Die kleur kom uit die opmerking se id, dus is dit stabiel: dieselfde
   opmerking kry more dieselfde kring.
   ──────────────────────────────────────────────────────────── */

const MAANDE_KORT = [
  'Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des',
]

const MINUUT = 60 * 1000
const UUR = 60 * MINUUT
const DAG = 24 * UUR

/* SA is UTC+2 sonder somertyd. Ons het die kalenderdag nodig — nie die
   blaaier se plaaslike dag nie, want 'n mens in Londen en 'n mens in
   Pretoria moet dieselfde "gister" sien op dieselfde plasing. */
const SA_SKUIF = 2 * UUR

function saDag(ms) {
  return Math.floor((ms + SA_SKUIF) / DAG)
}

/* Wat 'n mens ook al instuur, kom hier as millisekondes uit — of null.

   Drie vorme kom werklik voor:
     'n ISO-tydstempel  ("2026-08-23T06:12:00.000Z")  ← `geskep`
     'n dag             ("2026-08-23")                ← `dag`, die ou veld
     'n Date

   Die dag-vorm dra geen tyd nie. Ons neem middernag SAST, want dit is die
   enigste eerlike keuse: enige ander uur sou 'n uur uitdink wat ons nie
   weet nie. Daarom praat `gelede` op 'n dag-vorm nooit van ure nie. */
export function naMs(w) {
  if (w instanceof Date) {
    const t = w.getTime()
    return Number.isFinite(t) ? t : null
  }
  const s = String(w || '').trim()
  if (!s) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const t = Date.parse(s + 'T00:00:00Z')
    return Number.isFinite(t) ? t - SA_SKUIF : null
  }
  const t = Date.parse(s)
  return Number.isFinite(t) ? t : null
}

/* Dra hierdie waarde 'n UUR, of net 'n dag? 'n Dag-vorm mag nooit "3 u"
   sê nie — dit sou 'n presiesheid voorgee wat nie bestaan nie. */
function draTyd(w) {
  if (w instanceof Date) return true
  return !/^\d{4}-\d{2}-\d{2}$/.test(String(w || '').trim())
}

function kortDatum(ms, nouMs) {
  const d = new Date(ms + SA_SKUIF)
  const dag = d.getUTCDate()
  const maand = MAANDE_KORT[d.getUTCMonth()]
  const jaar = d.getUTCFullYear()
  const nouJaar = new Date(nouMs + SA_SKUIF).getUTCFullYear()
  return jaar === nouJaar ? `${dag} ${maand}` : `${dag} ${maand} ${jaar}`
}

/* ── Die leer ──

   nou · 5 min · 3 u · Gister · 3 d · 6 Aug · 6 Aug 2025

   Dit is Facebook se leer met Afrikaanse woorde. Die twee eindes is die
   belangrikes: onder 'n minuut is dit "nou" (nie "0 min" nie, wat soos
   stukkend lyk), en bo 'n week is dit weer 'n datum, want "63 d" beteken
   niks vir 'n mens nie.

   'n Tydstempel uit die TOEKOMS gee "nou". Bedienerhorlosies dryf 'n paar
   sekondes uitmekaar, en "-1 min" op jou eie splinternuwe opmerking lyk
   stukkend. */
export function gelede(wanneer, nou = Date.now()) {
  const ms = naMs(wanneer)
  if (ms === null) return ''
  const nouMs = nou instanceof Date ? nou.getTime() : Number(nou)
  if (!Number.isFinite(nouMs)) return ''

  const verskilDae = saDag(nouMs) - saDag(ms)

  if (!draTyd(wanneer)) {
    /* Net 'n dag: praat net in dae. */
    if (verskilDae <= 0) return 'Vandag'
    if (verskilDae === 1) return 'Gister'
    if (verskilDae < 7) return `${verskilDae} d`
    return kortDatum(ms, nouMs)
  }

  const verskil = nouMs - ms
  if (verskil < MINUUT) return 'nou'
  if (verskil < UUR) return `${Math.floor(verskil / MINUUT)} min`
  /* Ure, maar net solank dit nog dieselfde of gister se dag is. 'n Opmerking
     van 23 uur gelede wat "23 u" sê, is reg; een van 30 uur wat "30 u" sê,
     is 'n som wat 'n mens moet doen. */
  if (verskil < DAG) return `${Math.floor(verskil / UUR)} u`
  /* VERLOOPTE dae, nie kalenderdae nie. Ses-en-twintig uur gelede is
     "Gister", ook al is dit twee bladsye terug op 'n kalender — dit is wat
     Facebook doen en dit is die getal wat 'n mens self sou sê. Die
     kalenderdag geld net vir die dag-vorm hier bo, waar daar geen uur is om
     mee te tel nie. */
  const dae = Math.floor(verskil / DAG)
  if (dae === 1) return 'Gister'
  if (dae < 7) return `${dae} d`
  return kortDatum(ms, nouMs)
}

/* ── Die kring ──

   Sagte kleure, nie helder nie. Hierdie kringe staan langs mekaar op 'n
   blad waar iemand oor sy huwelik geskryf het; 'n ry helder kolle sou soos
   'n speletjie lyk. Elkeen moet donker genoeg wees om teen wit te lees en
   lig genoeg om nie die oog van die woorde af te trek nie.

   Agt is genoeg. Meer beteken twee kleure wat langs mekaar dieselfde lyk,
   en dan werk die hele ding nie meer nie. */
export const KRINGE = [
  '#8E7BB5', '#7BA3B5', '#B58E7B', '#7BB58E',
  '#B57B9E', '#9EB57B', '#7B8EB5', '#B5A57B',
]

/* 'n Klein, stabiele has. Niks kriptografies nie — dit kies net 'n kleur.
   Dit moet oor Node en oor elke blaaier dieselfde antwoord gee, want die
   toets loop in Node en die mens sien dit in Chrome. */
export function kringKleur(saad) {
  const s = String(saad || '')
  if (!s) return KRINGE[0]
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return KRINGE[h % KRINGE.length]
}
