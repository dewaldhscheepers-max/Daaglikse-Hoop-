/* ────────────────────────────────────────────────────────────
   Die videobiblioteek van Pastorale Sorg.

   Die biblioteek is nie 'n argief nie. Dit is die EERSTE hulp wat iemand
   kry — die ding wat werk terwyl Dewald slaap, en die ding wat 'n mens
   binne tien sekondes iets gee in plaas van drie dae.

   Daarom is die rangskikking volgens BEHOEFTE en nie volgens datum nie.
   Mense soek nie "Week 14" nie; hulle soek die sin wat hulle oor hulself sou
   sê: "Wanneer jy moeg geword het om sterk te wees".
   ──────────────────────────────────────────────────────────── */

/* Met die .js-uitbreiding, sodat plain `node` hierdie lêer kan invoer — die
   toetse loop sonder 'n toetsraamwerk en sonder Vite. */
import { ONDERWERPE, onderwerpSin, BREE_ONDERWERP } from './sorgOnderwerpe.js'

const PAD = '/api/sorg-videos'

let belofte = null

/* Een keer per sessie gehaal. 'n Mislukking word NIE onthou nie — die foon
   was dalk net 'n oomblik aflyn, en dan moet die volgende poging weer
   probeer. Dieselfde fout het die Afrikaanse Bybel 'n dag lank laat wegbly. */
export function haalVideos() {
  if (!belofte) {
    belofte = fetch(PAD, { headers: { accept: 'application/json' } })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then(d => ({
        videos: Array.isArray(d.videos) ? d.videos : [],
        week: d.week || null,
      }))
      .catch(() => { belofte = null; return { videos: [], week: null } })
  }
  return belofte
}

/* Ná 'n admin-verandering moet die volgende oproep weer gaan haal. */
export function vergeetVideos() { belofte = null }

/* ── Die week se video ──
   Die een wat gemerk is; anders die nuutste. Daar moet altyd een wees as
   daar enige video is, want 'n leë held bo-aan die blad laat die hele
   bladsy dood lyk. */
export function weekVideo({ videos, week }) {
  if (!videos.length) return null
  return videos.find(v => v.id === week) || videos[0]
}

/* ── Vandag se woord ──

   Een bestaande video, elke dag 'n ander een. Dewald hoef niks nuuts te maak
   nie; sodra daar dertig video's is, is daar 'n maand se daaglikse inhoud.

   Twee reels:
   · dit mag nie die week se video wees nie — dan wys die blad dieselfde ding
     twee keer;
   · dit mag nie herhaal wat hierdie mens onlangs gesien het nie. 'n Vaste
     rooster beteken die man wat elke dag kom, sien dieselfde ding op
     dieselfde dag, en dan word dit meubels. */
const GESIEN_SLEUTEL = 'sorg_woord_gesien'
const ONTHOU = 14

function gesienLys() {
  try { return JSON.parse(localStorage.getItem(GESIEN_SLEUTEL) || '[]') } catch { return [] }
}
function onthouGesien(id) {
  try {
    const lys = [id, ...gesienLys().filter(x => x !== id)].slice(0, ONTHOU)
    localStorage.setItem(GESIEN_SLEUTEL, JSON.stringify(lys))
  } catch { /* privaat modus */ }
}

export function vandagSeWoord({ videos, week }, { dag = new Date() } = {}) {
  const held = weekVideo({ videos, week })
  const kandidate = videos.filter(v => !held || v.id !== held.id)
  if (!kandidate.length) return null

  const gesien = new Set(gesienLys())
  const vars = kandidate.filter(v => !gesien.has(v.id))
  const poel = vars.length ? vars : kandidate

  /* Dieselfde dag gee dieselfde video, sodat dit nie by elke oopmaak spring
     nie. Die dagtelling kom uit die datum self — geen ewekansigheid, geen
     verrassing wanneer 'n mens die blad twee keer oopmaak. */
  const dagNr = Math.floor((dag.getTime() + 2 * 3600000) / 86400000)
  const keuse = poel[dagNr % poel.length]
  return keuse || null
}

export function merkWoordGesien(id) { if (id) onthouGesien(id) }

/* ── Die biblioteek volgens behoefte ──

   Gee 'n lys groepe terug, elkeen met die SIN wat 'n mens oor homself sou
   sê. 'n Video wat aan twee onderwerpe gemerk is, verskyn by albei — 'n mens
   soek immers by die gevoel wat hy nou het, nie by 'n katalogusnommer nie.

   Onderwerpe sonder video's val weg. 'n Leë afdeling is 'n belofte wat nie
   nagekom word nie. */
export function volgensBehoefte(videos) {
  const groepe = []

  /* ── Elke video EEN keer ──

     Hier het gestaan: 'n video wat aan twee onderwerpe gemerk is, verskyn by
     albei, want 'n mens soek by die gevoel wat hy nou het.

     Dit klink reg en dit lees verkeerd. Die meeste titels dra twee
     onderwerpe — "geestelike aanvalle op jou huwelik en jou gesin" is huwelik
     EN kinders, "verwerping laat jou voel jy is nie goed genoeg nie" is
     eensaam EN waarde. Die helfte van die biblioteek het dus dubbel gewys, en
     op 'n foon, waar 'n mens net drie kaarte op 'n slag sien, lyk dit soos 'n
     fout eerder as 'n keuse.

     Nou staan elke video onder sy EERSTE onderwerp — die eerste in
     ONDERWERPE se volgorde, wat die sterkste een is. Niks gaan weg nie; niks
     wys twee keer nie. */
  const geplaas = new Set()

  for (const o of ONDERWERPE) {
    /* 'Ek is nie seker nie' en 'Iets anders' deel dieselfde sin; ons wys dit
       net een keer. */
    if (groepe.some(g => g.sin === o.sin)) continue
    const inGroep = videos.filter(v =>
      !geplaas.has(v.id) && (v.onderwerpe || []).includes(o.sleutel))
    if (!inGroep.length) continue
    inGroep.forEach(v => geplaas.add(v.id))
    groepe.push({ sleutel: o.sleutel, sin: o.sin, naam: o.naam, videos: inGroep })
  }

  /* Wat nêrens gemerk is nie, mag nie verdwyn nie. */
  const gemerk = new Set(groepe.flatMap(g => g.videos.map(v => v.id)))
  const res = videos.filter(v => !gemerk.has(v.id))
  if (res.length) groepe.push({ sleutel: '_res', sin: 'Nog boodskappe van hoop', naam: '', videos: res })

  return groepe
}

/* ── Die onmiddellike hoop ──

   Wanneer iemand sy boodskap gestuur het, mag hy NOOIT 'n koue "dankie" kry
   nie. Hierdie funksie kies wat hy dadelik sien.

   Die val-volgorde is die hele punt: daar mag nooit 'n leë hand wees nie.
     1. 'n video vir presies daardie onderwerp
     2. 'n video vir die breë onderwerp — "Wanneer alles net te veel geword het"
     3. die week se video
     4. enige video

   Wat hierna nog oorbly (as daar glad geen video is nie), hanteer die skerm
   met 'n vers en 'n gebed. */
export function hoopVir(onderwerp, { videos, week }) {
  if (!videos.length) return null
  const pas = videos.filter(v => (v.onderwerpe || []).includes(onderwerp))
  if (pas.length) return { video: pas[0], rede: onderwerpSin(onderwerp) }

  const bree = videos.filter(v => (v.onderwerpe || []).includes(BREE_ONDERWERP))
  if (bree.length) return { video: bree[0], rede: onderwerpSin(BREE_ONDERWERP) }

  const held = weekVideo({ videos, week })
  if (held) return { video: held, rede: null }
  return { video: videos[0], rede: null }
}

/* ────────────────────────────────────────────────────────────
   Ontleed 'n geplakte lys video's.

   Dewald stuur sy video's soos hy hulle in WhatsApp het: 'n titel op een
   reël, die skakel op die volgende, 'n oop reël tussenin.

       Slegte Geselskap Bederf Jou Stadig‼️
       https://youtube.com/shorts/zJFAjk0qIV8?si=81ys3radTZUBE49g

       4 Dinge wat vergifnis nie beteken nie🔥‼️
       https://youtu.be/yGDuxCjp3mo?si=pu6FhBXxsL7jVVUo

   Die ou invoerder het elke reël as 'n skakel probeer lees. Die titels het
   dus as "sleg" getel, en die name wat wél ingekom het, is by YouTube gaan
   haal — nie Dewald se eie name nie. Sy titels is beter: hulle is in sy
   stem, en die emoji is deel van hoe die blad lyk.

   ── Waarom 'n reël 'n SKAKEL moet wees, nie net 'n ID nie ──

   `haalVideoId` aanvaar ook 'n kaal id — enige string van 6 tot 20 letters,
   syfers, koppel- of onderstreep. Dit is reg vir die enkel-video-veld, waar
   'n mens net 'n id kan plak.

   Hier is dit 'n slaggat: 'n titel van EEN woord, soos "Vergifnis", pas
   presies daardie patroon. Sy sou dan as 'n video-id ingekom het en die
   egte skakel daaronder sou sy titel geword het. Nie een van vandag se
   veertien titels is een woord nie, dus sou dit vandag gewerk het en môre
   stilweg gebreek het.

   In 'n geplakte lys moet 'n skakel dus soos 'n skakel lyk.
   ──────────────────────────────────────────────────────────── */
const SKAKEL_LYK = /(?:youtu\.be\/|youtube\.com\/|youtube-nocookie\.com\/|^https?:\/\/)/i

export function isVideoSkakel(reel) {
  return SKAKEL_LYK.test(String(reel || '').trim())
}

export function ontleedPlak(teks) {
  const reels = String(teks || '').split(/\r?\n/)
  const uit = []
  let wagTitel = ''

  for (const rou of reels) {
    const reel = rou.trim()
    if (!reel) continue

    if (isVideoSkakel(reel)) {
      /* Party mense plak "Titel — https://…" op een reël. Dan is die titel
         wat vóór die skakel staan beter as niks. */
      const waar = reel.search(/https?:\/\//i)
      const voor = waar > 0 ? reel.slice(0, waar).replace(/[\s–—:-]+$/, '').trim() : ''
      uit.push({ skakel: waar > 0 ? reel.slice(waar) : reel, titel: wagTitel || voor })
      wagTitel = ''
      continue
    }

    /* Nog nie 'n skakel nie — dit is 'n titel wat op sy video wag. Staan daar
       twee titels agtermekaar, wen die naaste een; die ander was waarskynlik
       'n kopstuk of 'n los reël. */
    wagTitel = reel
  }

  return uit
}
