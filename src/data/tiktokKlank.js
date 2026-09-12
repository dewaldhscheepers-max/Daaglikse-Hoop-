/* ── Die klank binne TikTok se speler ──
 *
 * Dewald, vier keer, en die laaste een met agt uitroeptekens: *"we need
 * sound!!!!!!!!!!!!"*
 *
 * Die video speel binne TikTok se iframe. Ons kan nie aan sy volume vat nie —
 * maar hulle speler HET 'n boodskap-kanaal, en dit is gedokumenteer.
 *
 * ── Hoekom die eerste poging niks gedoen het ──
 *
 * Dit het dit gestuur:
 *
 *     raam.contentWindow.postMessage(JSON.stringify({ type: 'unMute' }), '…')
 *
 * Dit is op TWEE maniere verkeerd, en albei is genoeg om die boodskap in die
 * niet te laat verdwyn:
 *
 *   1. dit is 'n STRING. Hulle speler verwag 'n voorwerp en lees `data.type`;
 *      op 'n string is dit `undefined`.
 *   2. dit dra nie `'x-tiktok-player': true` nie. Dít is die merker waarmee
 *      hulle 'n boodskap van hulle eie uitken. Sonder hom word dit weggegooi
 *      voordat iets na die tipe kyk.
 *
 * Die gedokumenteerde vorm (TikTok se "Embed Player"-blad) is:
 *
 *     interface EmbeddedPlayerMessage<T> {
 *       'x-tiktok-player': boolean
 *       value: T
 *       type: string
 *     }
 *
 * ── Wat hier NOG 'n aanname is, en hoe dit hanteer word ──
 *
 * Die OMHULSEL is gedokumenteer. Die presiese SPELLING van die werkwoord is
 * nie — hulle blad self is in hierdie houer geblokkeer (`www.tiktok.com` gee
 * 'n 403 op die CONNECT), dus kon ek net die vorm en 'n voorbeeld kry.
 *
 * Daarom word 'n paar spellings gestuur. Dit is nie skrootskoot nie, dit is die
 * goedkoopste moontlike verskansing: 'n boodskap met 'n tipe wat hulle nie ken
 * nie, word stilweg geïgnoreer, en die koste is 'n paar mikrosekondes. Die
 * alternatief is een spelling raai en weer op sy foon uitkom.
 *
 * ── Die knoppie kom NET as hulle antwoord ──
 *
 * `isTiktokBoodskap()` sê of 'n `message`-gebeurtenis van hulle speler kom.
 * Antwoord hy ooit, weet ons die kanaal LEEF, en dan — en net dan — wys die
 * klank-knoppie. Dit is die les van `volume_control=1`: 'n knoppie wat na 'n
 * vermoë wys wat nie bestaan nie, is erger as stilte. Hier kan dit nie gebeur
 * nie, want die knoppie hang aan 'n antwoord wat ons werklik ontvang het.
 */

/* Hulle speler leef hier. Dieselfde gasheer as `spelerAdres()` bou. */
export const TIKTOK_OORSPRONG = 'https://www.tiktok.com'

/* Die merker wat 'n boodskap as hulle s'n uitken. Dit is nie 'n gerief nie —
   sonder hierdie sleutel word die boodskap weggegooi. */
export const MERKER = 'x-tiktok-player'

/* ── Die volume se SKAAL, en die duurste klein fout hierin ──
 *
 * Dit het `['setVolume', 1]` gestuur, en toe was Dewald se antwoord: *"dis baie
 * sag."* Die klank was AAN — die ontdemping het gewerk — en toe het die volgende
 * boodskap hom op **een persent** gesit.
 *
 * 'n `<video>` se `volume` loop van 0 tot 1. Baie spelers stel hulle eie API op
 * 0 tot 100, soos 'n mens dit aan 'n mens sou wys. Ons weet nie watter een hulle
 * gebruik nie en ons kan dit nie hier gaan kyk nie.
 *
 * Dus word ALBEI gestuur, en die ORDE is die hele truuk:
 *
 *   · eers `1` — vol op 'n 0-1-skaal;
 *   · dan `100` — vol op 'n 0-100-skaal.
 *
 * Is die skaal 0-100, land die tweede een en dit is vol. Is die skaal 0-1, dan
 * kap 'n speler wat afkap dit na 1 (steeds vol), en 'n speler wat NIE afkap nie
 * gooi 'n fout by `video.volume = 100` en laat die vorige waarde staan — wat 1
 * is, dus steeds vol.
 *
 * Andersom om sou albei gevalle verkeerd wees: op 'n 0-100-skaal sou die laaste
 * boodskap die volume op 1% sit, en dit is presies die fout wat ons pas gehad
 * het. **Moet nooit hierdie twee omruil nie.**
 */
const VOL_KLEIN = 1
const VOL_GROOT = 100

/* Die werkwoorde, in die orde waarin hulle gestuur word. `unMute` staan eerste
   omdat dit die een is wat die voorbeeld in hulle dokumentasie gebruik; die res
   is spellings van dieselfde bedoeling. Die volume kom LAAS, want 'n speler wat
   ontdemp het maar op nul staan, is steeds stil. */
const AAN = [
  ['unMute',    {}],
  ['unmute',    {}],
  ['mute',      false],
  ['setVolume', VOL_KLEIN],
  ['setVolume', VOL_GROOT],
]

const AF = [
  ['mute',      {}],
  ['setVolume', 0],
]

/* Die boodskappe wat gestuur word om die klank AAN (of AF) te sit.
   Suiwer: 'n boolean in, 'n ry gewone voorwerpe uit. */
export function klankBoodskappe(aan) {
  return (aan ? AAN : AF).map(([type, value]) => ({
    [MERKER]: true,
    type,
    value,
  }))
}

/* Kom hierdie `message`-gebeurtenis van TikTok se speler?
 *
 * Die OORSPRONG word getoets en nie net die merker nie: enige bladsy in enige
 * raam kan 'n boodskap met daardie sleutel stuur, en dan sou 'n vreemde raam
 * ons klank-knoppie kon laat verskyn. Die gasheer word met 'n suffiks getoets
 * en nooit met `includes` — dieselfde reël as die kort-skakel-oplosser, want
 * "tiktok.com.boos.net" bevat "tiktok.com". */
export function isTiktokBoodskap(gebeurtenis) {
  const g = gebeurtenis && typeof gebeurtenis === 'object' ? gebeurtenis : null
  if (!g) return false

  const oorsprong = String(g.origin || '')
  if (!oorsprong.startsWith('https://')) return false
  let gasheer = ''
  try { gasheer = new URL(oorsprong).hostname.toLowerCase() }
  catch { return false }
  if (gasheer !== 'tiktok.com' && !gasheer.endsWith('.tiktok.com')) return false

  const d = g.data
  if (!d || typeof d !== 'object') return false
  return d[MERKER] === true
}

/* ── Die VOORUIT-raam: stil en gepouseer ──
 *
 * Die volgende clip se raam is gemonteer voordat sy swiep, sodat hy nie eers
 * dan begin laai nie. Hy het PRESIES dieselfde adres as wanneer hy aktief is —
 * anders herlaai die raam op die oomblik dat sy swiep, en dan is die hele
 * vooruit-laai weg. Dewald: *"dit vat nou nog langer om te laai.... dit wys nou
 * eers i play button en dan laai dit."*
 *
 * Daardie adres dra `autoplay=1`, dus speel hy. Twee boodskappe hou hom stil:
 *
 *   · `mute` — verpligtend. Twee klanke tegelyk is 'n stukkende app.
 *   · `pause` — spaar data. Werk dit nie, speel hy stil aan en die enigste
 *     koste is data; `beginVanVoor()` maak die posisie in elk geval reg.
 *
 * Dit is waarom dit veilig is: werk `pause` nie, is niks stukkend nie. */
export function wagBoodskappe() {
  return [
    { [MERKER]: true, type: 'mute',  value: {} },
    { [MERKER]: true, type: 'pause', value: {} },
  ]
}

/* ── Die aktiewe raam: speel, van VOOR af ──
 *
 * Die vooruit-raam kon stil aangespeel het (as `pause` geïgnoreer is), en dan
 * is hy halfpad wanneer sy daar aankom. `seekTo 0` maak dit reg, en dit is die
 * werkwoord wat WOORD VIR WOORD in hulle dokumentasie se voorbeeld staan —
 * `{ type: 'seekTo', value: Number(...), 'x-tiktok-player': true }`.
 *
 * `play` gaan saam en is onskadelik op 'n raam wat reeds speel. Die kombinasie
 * is met opset veilig: ken hulle speler nie `pause`/`play` nie, dan het die
 * vooruit-een stil aangespeel en `play` is 'n niks-doener — en `seekTo` sit hom
 * steeds aan die begin. */
export function beginBoodskappe() {
  return [
    { [MERKER]: true, type: 'play',   value: {} },
    { [MERKER]: true, type: 'seekTo', value: 0 },
  ]
}

/* Stuur 'n ry boodskappe na een raam. Onsuiwer, en daarom klein: die `try` is
   nie luiheid nie — 'n raam wat besig is om te ontlaai, gooi by `postMessage`,
   en dit mag nooit die voer omkantel nie. */
export function stuurAlles(raam, boodskappe) {
  if (!raam || typeof raam.postMessage !== 'function') return false
  let een = false
  for (const boodskap of boodskappe) {
    try { raam.postMessage(boodskap, TIKTOK_OORSPRONG); een = true }
    catch { /* hulle raam antwoord nie; dan bly dit soos dit is */ }
  }
  return een
}

export function stelKlank(raam, aan) {
  return stuurAlles(raam, klankBoodskappe(aan))
}

/* Die vooruit-raam: stil en gepouseer. */
export function stelWag(raam) {
  return stuurAlles(raam, wagBoodskappe())
}

/* Die aktiewe raam: speel, van voor af. */
export function beginVanVoor(raam) {
  return stuurAlles(raam, beginBoodskappe())
}
