/* ── Haal die post-ID uit enigiets wat TikTok 'n mens gee ──
 *
 * Dewald, 12 September 2026: *"dit sou eintlik makliker wees as ek net al die
 * skakels so kon kopie en past in admin in die toekoms dit sou dit vinniger vir
 * my maak."*
 *
 * Hy plak wat sy foon hom gee. Op 'n foon is dit NOOIT die lang adres nie — die
 * Deel-knoppie in die TikTok-app gee 'n kort skakel:
 *
 *     https://vt.tiktok.com/ZSqa9Knhv/
 *
 * Daardie string dra die ID nie. Hy is 'n aanwyser: 'n mens moet hom OOPMAAK om
 * te sien waarheen hy wys, en dit is 'n netwerk-versoek. Hierdie lêer is suiwer
 * en doen dus net die helfte wat sonder 'n netwerk moontlik is:
 *
 *   · uit 'n VOLLE adres haal dit die ID dadelik;
 *   · 'n KORT skakel word as kort herken, en die bediener
 *     (`api/reels-skakel.mjs`) volg hom.
 *
 * ── Hoekom dit 'n LEË string gee ──
 *
 * Dieselfde rede as `youtubeId.js` se kop: gee 'n mens die hele string terug
 * wanneer niks pas nie, word 'n Vimeo-skakel of 'n halwe adres as die "ID"
 * gestoor, en die speler wys 'n leë blok. Die fout daag dan weke later op, ver
 * van die plek waar dit gemaak is. Leeg beteken "ek weet nie", en die vorm kan
 * dit sê.
 *
 * ── Die ID self ──
 *
 * 'n TikTok-post-ID is 'n Snowflake: net syfers, en tans 19 lank. Ons aanvaar
 * 17 tot 21 sodat ouer en latere posts nie uitval nie, maar NOOIT iets met 'n
 * letter in nie — dan vang die patroon 'n gebruikersnaam of 'n deelmerker.
 */

const ID = /^[0-9]{17,21}$/

/* Elke vorm wat 'n VOLLE adres kan aanneem. Die grens ná die groep is nodig:
   sonder dit sny 'n gulsige patroon 'n langer syferstring in die middel deur en
   gee 'n ID terug wat nie bestaan nie. */
const PATRONE = [
  /\/video\/([0-9]{17,21})(?:[?&/#]|$)/,
  /\/photo\/([0-9]{17,21})(?:[?&/#]|$)/,
  /\/player\/v1\/([0-9]{17,21})(?:[?&/#]|$)/,
  /\/embed\/v2\/([0-9]{17,21})(?:[?&/#]|$)/,
  /\/embed\/([0-9]{17,21})(?:[?&/#]|$)/,
  /\/v\/([0-9]{17,21})\.html(?:[?&#]|$)/,
  /[?&]item_id=([0-9]{17,21})(?:[?&#]|$)/,
]

/* Die gasheer-name wat 'n KORT skakel uitdeel. `/t/` is die lang gasheer se eie
   kort vorm en dra net so min inligting. */
const KORT_GASHEER = /^(?:https?:\/\/)?(?:www\.)?(?:vt|vm)\.tiktok\.com\/[A-Za-z0-9]+\/?(?:[?#]|$)/i
const KORT_PAD     = /^(?:https?:\/\/)?(?:www\.)?tiktok\.com\/t\/[A-Za-z0-9]+\/?(?:[?#]|$)/i

export function tiktokIdUit(inset) {
  const s = String(inset == null ? '' : inset).trim()
  if (!s) return ''

  /* Reeds 'n kaal ID. Dit moet EERSTE wees — 'n kaal ID het geen skuinsstreep
     waarop die patrone kan anker. */
  if (ID.test(s)) return s

  for (const p of PATRONE) {
    const m = s.match(p)
    if (m && ID.test(m[1])) return m[1]
  }
  return ''
}

/* Is dit 'n skakel wat ons nie SELF kan lees nie? Dan moet die bediener hom
   volg. Dit is nie 'n fout nie — dit is die normale geval wanneer 'n mens van
   sy foon af plak. */
export function isKortSkakel(inset) {
  const s = String(inset == null ? '' : inset).trim()
  if (!s) return false
  if (tiktokIdUit(s)) return false
  return KORT_GASHEER.test(s) || KORT_PAD.test(s)
}

/* Vir die vorm, en vir die bediener se antwoord. Drie uitkomste, nie twee:
   klaar, moet-oopgemaak-word, en onbruikbaar. */
export function keurTiktokInset(inset) {
  const s = String(inset == null ? '' : inset).trim()
  if (!s) return { id: '', kort: false, leeg: true, geldig: true }
  const id = tiktokIdUit(s)
  if (id) return { id, kort: false, leeg: false, geldig: true, wasSkakel: id !== s }
  if (isKortSkakel(s)) return { id: '', kort: true, leeg: false, geldig: true }
  return { id: '', kort: false, leeg: false, geldig: false }
}

/* TikTok se amptelike speler. Hy dra sy eie kontroles; ons vra vir so min as
   moontlik chroom, want die voer se eie knoppies staan reeds daar. */
export function spelerAdres(id, opsies) {
  if (!ID.test(String(id || ''))) return ''
  const o = opsies || {}
  const v = new URLSearchParams({
    music_info: '0',
    description: '0',
    rel: '0',
    native_context_menu: '0',
    closed_caption: '0',
    /* Klank begin STIL. Fone weier in elk geval om klank te speel voordat 'n
       mens getik het, dus is "hardop" nie 'n keuse wat bestaan nie — dit is net
       'n speler wat stilweg misluk. */
    autoplay: o.speel ? '1' : '0',
    loop: '1',
  })
  return `https://www.tiktok.com/player/v1/${id}?${v.toString()}`
}
