/* ────────────────────────────────────────────────────────────
   Skakels wat op die REGTE skerm land — en die veldtog wat saamkom.

   Dewald se punt 15. Die belangrikste sin daarin is die laaste een:

     "Moenie die gebruiker eers na die algemene app-tuisblad stuur nie."

   Dit is presies die fout wat installasie in hierdie projek maande lank
   stukkend gehou het: elke skakel het op `/` geland, waar daar niks van die
   ding is waarvoor die mens gekom het nie. Sien CLAUDE.md se `kiesPad()`.

   ── Die vorm ──

   Paaie, nie hashes nie. 'n Hash oorleef nie altyd 'n plak nie, en WhatsApp
   wys niks van hom nie.

       /sorg                    die blad
       /sorg/deel               Deel wat swaar is — die vorm gaan dadelik oop
       /sorg/wag                Wag nog vir iemand
       /sorg/saam               Saam dra
       /sorg/videos             Video's
       /sorg/<id>               een gesprek

   ── Die veldtog ──

   'n Mens kom van Facebook af, installeer die app 'n week later, en dan weet
   niemand meer waar hy vandaan kom nie. Die UTM-parameters word dus by die
   EERSTE besoek gestoor en oorleef die installasie — dit is die enigste
   manier om te weet watter veldtog werklik mense bring.

   Dit is 'n VELDTOG, nie 'n mens nie: `bron`, `medium`, `veldtog`, `inhoud`.
   Geen id, geen adres, niks wat 'n mens identifiseer nie.
   ──────────────────────────────────────────────────────────── */

export const WORTEL = 'https://dewaldscheepers.com'

/* Die skerms wat 'n eie skakel het. Die sleutel is wat in die pad staan; die
   `afdeling` is wat die Sorg-blad se oortjie-toestand moet wees. */
export const SKERMS = [
  { sleutel: 'deel',   pad: '/sorg/deel',   afdeling: 'muur',   vorm: true },
  { sleutel: 'wag',    pad: '/sorg/wag',    afdeling: 'muur',   wag: true },
  { sleutel: 'saam',   pad: '/sorg/saam',   afdeling: 'saam' },
  { sleutel: 'videos', pad: '/sorg/videos', afdeling: 'videos' },
  { sleutel: 'sorg',   pad: '/sorg',        afdeling: 'muur' },
]

/* Die woorde wat NIE 'n plasing-id kan wees nie. Sonder hierdie lys sou
   `/sorg/wag` as 'n gesprek met die id "wag" gelees word, en dan land 'n mens
   op 'n leë skerm. */
const GERESERVEER = new Set(['deel', 'wag', 'saam', 'videos', 'video', 'sorg'])

/* ── Bou 'n skakel ──
 *
 * `veldtog` is opsioneel en word as UTM aangeplak. Ons stuur dit self saam
 * wanneer ons 'n skakel maak — 'n deel-knoppie in die app weet waar hy staan,
 * en dit is die enigste manier om later te sien of Deel of Nooi mense bring.
 */
export function skakel(sleutel, { id = '', veldtog = null } = {}) {
  let pad
  if (sleutel === 'gesprek') {
    const skoon = String(id || '').trim()
    if (!skoon) return WORTEL + '/sorg'
    pad = '/sorg/' + encodeURIComponent(skoon)
  } else if (sleutel === 'video') {
    const skoon = String(id || '').trim()
    pad = skoon ? '/sorg/video/' + encodeURIComponent(skoon) : '/sorg/videos'
  } else {
    const s = SKERMS.find(x => x.sleutel === sleutel)
    pad = s ? s.pad : '/sorg'
  }
  return WORTEL + pad + utmSnaar(veldtog)
}

/* ── Lees 'n pad terug ──
 *
 * Gee `{ skerm, id }`, of null. Dit loop op ELKE oopmaak, ook wanneer die
 * diensketter die blad herlaai het, dus mag dit nooit omval nie.
 */
export function uitPad(pad) {
  const p = String(pad || '').split('?')[0].split('#')[0].replace(/\/+$/, '')
  /* `startsWith('/sorg')` is NIE genoeg nie: "/sorgeloos" begin ook so, en dan
     word "eloos" 'n gesprek-id en die mens land op 'n leë skerm. Die pad moet
     PRESIES /sorg wees, of /sorg gevolg deur 'n skuinsstreep. */
  if (p !== '/sorg' && !p.startsWith('/sorg/')) return null
  const res = p.slice('/sorg'.length)

  if (!res) return { skerm: 'sorg', id: '' }

  const dele = res.split('/').filter(Boolean)
  if (!dele.length) return { skerm: 'sorg', id: '' }

  const eerste = decodeURIComponent(dele[0])

  if (eerste === 'video') {
    const id = dele[1] ? decodeURIComponent(dele[1]) : ''
    return id ? { skerm: 'video', id } : { skerm: 'videos', id: '' }
  }

  if (GERESERVEER.has(eerste)) {
    /* "sorg" as 'n tweede deel — /sorg/sorg — is niks. */
    return eerste === 'sorg' ? null : { skerm: eerste, id: '' }
  }

  return { skerm: 'gesprek', id: eerste }
}

/* ══════════════════════════════════════════════════════════════
   Die veldtog
   ══════════════════════════════════════════════════════════════ */

export const UTM_SLEUTEL = 'sorg_veldtog'

/* Wat ons hou. NIKS anders nie — 'n witlys, sodat 'n skakel met dertig
   parameters nie dertig velde in localStorage sit nie. */
const VELDE = {
  utm_source: 'bron',
  utm_medium: 'medium',
  utm_campaign: 'veldtog',
  utm_content: 'inhoud',
  /* Facebook en TikTok plak hul eie klik-id aan. Dit IDENTIFISEER 'n mens, en
     ons hou dit nie. Dit is met opset nie in hierdie lys nie. */
}

function skoon(w) {
  return String(w || '')
    .replace(/[^A-Za-z0-9_.\- ]/g, '')
    .trim()
    .slice(0, 40)
}

/* Lees die UTM uit 'n navraagstring. Gee null as daar niks is nie — dan mag
   dit nooit 'n gestoorde veldtog oorskryf nie. */
export function leesUtm(soek) {
  const s = String(soek || '')
  if (!s) return null
  const q = new URLSearchParams(s.startsWith('?') ? s.slice(1) : s)
  const uit = {}
  for (const [param, naam] of Object.entries(VELDE)) {
    const w = skoon(q.get(param))
    if (w) uit[naam] = w
  }
  /* 'n Skakel uit die oggendkennisgewing dra nie UTM nie — hy dra `?k=1`.
     Dit is die grootste enkele bron in hierdie app en dit mag nie as
     "direk" tel nie. */
  if (!uit.bron && q.get('k')) uit.bron = 'kennisgewing'
  return Object.keys(uit).length ? uit : null
}

export function utmSnaar(veldtog) {
  if (!veldtog) return ''
  const q = new URLSearchParams()
  for (const [param, naam] of Object.entries(VELDE)) {
    const w = skoon(veldtog[naam])
    if (w) q.set(param, w)
  }
  const s = q.toString()
  return s ? '?' + s : ''
}

/* ── Wat ONTHOU word ──
 *
 * Die EERSTE veldtog wen. 'n Mens kom van Facebook af, kom 'n week later
 * direk terug, en dan sou die tweede besoek sy herkoms uitvee — en dan lyk
 * dit of Facebook niemand gebring het nie.
 *
 * Suiwer: wat gestoor is en wat nou inkom, gee wat gestoor moet word.
 */
export function saamvoegVeldtog(gestoor, nuut) {
  if (!nuut) return gestoor || null
  if (!gestoor) return { ...nuut, eerste: true }
  /* Reeds 'n veldtog. Die eerste bly, maar ons hou die LAASTE ook by — dit is
     hoe 'n mens sien watter veldtog iemand teruggebring het. */
  return { ...gestoor, laasteBron: nuut.bron || gestoor.laasteBron || '' }
}

/* ── Wat 'n mens sien wanneer die app NIE geïnstalleer is nie ──
 *
 * Dewald: "Maak 'n mobiele webweergawe van die korrekte skerm oop. Wys 'n
 * duidelike maar nie-aggressiewe installeerknoppie."
 *
 * Dit is 'n BESLUIT, nie 'n skerm nie: die webblad wys altyd die regte
 * inhoud, en die knoppie kom net by wanneer daar iets is om te installeer.
 * 'n Skerm wat eers 'n installasie vra en die inhoud daaragter wegsteek, is
 * presies waarom mense wegloop.
 */
export function wysInstalleer({ geinstalleer = false, pad = '' } = {}) {
  if (geinstalleer) return false
  /* Op die vorm nie. Iemand wat sy swaarste ding tik, moet niks anders sien
     nie — dieselfde reël as die res van hierdie blad. */
  const d = uitPad(pad)
  if (d && d.skerm === 'deel') return false
  return true
}
