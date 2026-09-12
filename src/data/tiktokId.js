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

/* ── Die HANDVATSEL uit 'n volle adres ──
 *
 * Dit is nie 'n ekstra nie — dit is die ERKENNING. `magWys()` in reels.js laat
 * 'n clip sonder 'n naam glad nie wys nie, en by 'n clip wat uit 'n geplakte
 * skakel kom, is die enigste naam wat ons het, die maker se handvatsel:
 *
 *     https://www.tiktok.com/@iemand/video/7412345678901234567
 *                             ▲▲▲▲▲▲▲
 *
 * Dit is presies waarom die oplosser die VOLLE adres teruggee en nie net die
 * id nie: die id maak die speler, die handvatsel maak die erkenning, en 'n clip
 * sonder die tweede mag nie bestaan nie.
 *
 * Gee 'n LEË string as daar niks is nie. 'n Clip sonder 'n naam word dan deur
 * `magWys()` gekeer in plaas van om met 'n leë naam te wys.
 */
export function handvatselUit(inset) {
  const s = String(inset == null ? '' : inset).trim()
  if (!s) return ''
  const m = s.match(/tiktok\.com\/@([A-Za-z0-9._-]{1,60})(?:[/?#]|$)/)
  if (!m) return ''
  const h = m[1].replace(/\.+$/, '')   /* 'n punt aan die einde is nie deel van 'n naam nie */
  return h ? `@${h}` : ''
}

/* ── TikTok se amptelike speler ──
 *
 * ── Die klank is HULLE s'n, nie ons s'n nie ──
 *
 * Hier het `music_info=0&description=0` gestaan en niks oor klank. Die voer se
 * eie "Tik vir klank" het die raam herbou — en omdat hierdie adres nie verander
 * het nie, het dit PRESIES dieselfde bladsy weer gelaai. Dewald op 'n regte
 * foon: *"geen klank nie."* 'n Knoppie wat niks doen nie is erger as stilte, en
 * dit was 'n knoppie wat niks doen nie.
 *
 * Ons kan nie van buite in 'n ander party se iframe ontdemp nie. Wat ons WEL
 * kan, is hulle eie klankknoppie sigbaar maak: `volume_control=1`. Dan is daar
 * 'n egte kontrole wat werk, in plaas van ons eie een wat lieg.
 *
 * `music_info` en `description` bly af — dit is TikTok se eie oorleg met die
 * liedjie en die beskrywing, en die voer dra sy eie woorde. */
export function spelerAdres(id, opsies) {
  if (!ID.test(String(id || ''))) return ''
  const o = opsies || {}
  const v = new URLSearchParams({
    music_info: '0',
    description: '0',
    rel: '0',
    native_context_menu: '0',
    closed_caption: '0',
    /* `volume_control=1` het HIER gestaan. Dit doen niks — TikTok ignoreer dit,
       en op 'n regte foon was daar geen klankknoppie nie. Dewald: *"dit sê klik
       die klank knoppie maar daar is geen klank knoppie nie."* 'n Wenk wat na 'n
       knoppie wys wat nie bestaan nie, is erger as stilte.

       Moenie weer parameters byvoeg wat nie hier getoets kan word nie. TikTok
       is in hierdie houer geblokkeer; elke param wat nie in hulle dokumentasie
       staan nie, is 'n raaiskoot wat op Dewald se foon uitkom. */
    autoplay: o.speel ? '1' : '0',
    loop: '1',
  })
  return `https://www.tiktok.com/player/v1/${id}?${v.toString()}`
}
