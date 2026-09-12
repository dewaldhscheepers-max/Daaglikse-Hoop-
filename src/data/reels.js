/* ────────────────────────────────────────────────────────────
   REELS — die reëls van die voer

   Dewald, 12 September 2026: *"mense kan die videos deel en dan bring dit nog
   mense na die app... hulle kyk die video en dan vra die app om te installeer.
   ons gebruik dit reeds by bidsaam as hulle iemand nooi om saam te bid."*

   Hierdie lêer is suiwer. Alles wat 'n netwerk, 'n klok of localStorage nodig
   het, staan buite; hier staan net die besluite, sodat hulle getoets kan word.

   ── Waarvoor die voer bestaan ──

   Nie vir tyd in die app nie. Tyd in die app is nie groei nie — dit is net
   dieselfde mense wat langer bly. Die voer bestaan vir die SKAKEL wat uitgaan:
   elke gedeelde clip is een vreemdeling wat binne twee sekondes 'n boodskap
   sien sonder 'n muur voor haar. Dieselfde masjien as `/bid/<id>` en
   `/hoop/<id>`, wat albei reeds werk.

   Die getal wat saak maak is dus hoeveel keer gedeel word, nie hoeveel gekyk
   word nie.

   ── Die voer HOU AAN ──

   Dit was anders: die voer het GEEINDIG met 'n klaar-skerm, want 'n voer sonder
   'n einde is een waarvan 'n mens skuldig opstaan. Dewald het dit op
   12 September 2026 gesien en dit was 'n reguit oordeel: *"nee man fok haal dit
   af... dis onvriendelik... wys alles wat daar is om te wys... dit moet aangaan
   en as hulle alles gekyk het kan jy daai sit. maar dit moet verkieslik nooit
   stop nie."*

   Hy was reg, en my weergawe was erger as wat ek gedink het: met 'n handjievol
   clips het daardie skerm na drie swiepe gekom. 'n Voer wat 'n mens uitgooi
   voordat hy behoorlik begin het, is nie 'n beskeie voer nie — dit is 'n deur
   wat in jou gesig toegaan.

   Die voer loop nou AAN: elke pas is 'n nuwe skommeling, en wanneer 'n mens by
   die einde van een kom, is die volgende al daar. Die "jy het alles gesien"-
   kaart kom EEN keer — ná die eerste volle pas, wanneer dit waar is — en 'n
   mens kan daaraan verby swiep. Dit is 'n mylpaal, nie 'n doodloopstraat nie,
   en dit is die plek waar die deel-vraag hoort.

   ── Die volgorde is TOEVALLIG, nie die plak-volgorde nie ──

   Dewald: *"die nuwe videos moet random bo speel.. nie in volgorde soos ek dit
   paste nie. want anders speel almal van dieselfde persoon na mekaar."*

   Drie dinge volg daaruit, en al drie staan in `eenPas()`: die NUUTSTE clips
   staan bo (geskommel onder mekaar), die res word EWEREDIG per maker versprei
   (`versprei()`), en geen twee clips van dieselfde mens volg op mekaar nie
   (`ontklont()`).

   Die tweede een het bygekom nadat Dewald dit op 'n regte foon gesien het:
   *"teveel van Johandre Potgieter se videos wys bo. elke 2de 3de video is van
   hom... daar is meer videos van my maar syne wys meer."* `ontklont` alleen keer
   net wat LANGS mekaar staan, en dit gee presies "elke tweede of derde".
   `versprei` deel die clips uit sodat elke maker 'n steek kry wat eweredig is
   aan hoeveel hy het.

   ── 'n NUWE kyker sien die BESTE eerste, nie die nuutste nie ──

   Dewald: *"die wat die meeste ge deel is kry voorkeer by nuwe kykers."*

   Dit is die regte onderskeid, en dit is nie dieselfde vraag nie. 'n Mens wat
   die app al ken, kom terug om te sien wat NUUT is — vir haar is die nuutste bo
   reg. 'n Vreemdeling wat vir die eerste keer hier land, het nog geen rede om te
   bly nie, en die eerlikste ding wat ons vir haar kan wys, is wat ander mense
   werklik goed genoeg gevind het om te STUUR.

   `nuut: true` skakel dus die boonste blok van "nuutste" na "meeste gedeel" om.
   Die res van die pas bly dieselfde, en die ontklonting geld steeds.

   ── Erkenning is 'n HEK, nie 'n versiering nie ──

   'n Clip sonder 'n naam wys glad nie. Ander bedienings se werk dra hul naam,
   of dit is nie hier nie. Sien `magWys()`.
   ──────────────────────────────────────────────────────────── */

/* Dieselfde basis as `hoopSkakel.js`. Twee basisse en die een sou stil verkeerd
   raak die dag wanneer die domein verander. */
export const BASIS = 'https://dewaldscheepers.com'

/* Waar 'n clip vandaan kom. Die speler word hierop gekies, en dit is met opset
   inprop-baar: TikTok se speler is nie 'n ding waarop hierdie app sy hele voer
   moet bou nie. */
export const BRONNE = ['tiktok', 'youtube', 'eie']

/* Wat gemeet word. Geen naam, geen e-pos, geen toestel-id, geen IP, en geen
   tydstempel per mens.

   ── Waarom daar NOU 'n telling per clip is ──

   Hier het gestaan: "NIE watter clip gedeel is nie — 'n telling per clip is die
   eerste tree na 'watter video het Sarel gedeel'." Dewald het daarna gevra dat
   die MEES GEDEELDE clips voorkeur kry by nuwe kykers, en dan moet daardie getal
   bestaan.

   Ek het die reël nagegaan en my eie formulering was te breed. Wat die vraag
   "wat het Sarel gedeel" moontlik maak, is 'n telling per clip PLUS 'n mens of
   'n tyd daarby. 'n Kaal heelgetal op die clip self sê net "hierdie een is 400
   keer gestuur" en kan aan niemand gekoppel word nie — presies dieselfde vorm as
   `likes/<id>` per nota en `prayedCount` per gebed, wat albei lankal in hierdie
   app staan.

   Die grens bly dus waar hy was, net skerper gestel: 'n AGGREGAAT per clip mag;
   enigiets per MENS nooit.

   `tellers/reels` hou steeds die twee totale (`gedeel`, `oopgemaak`), en die
   clip se eie dokument hou sy eie `gedeel`. */
export const GEBEURE = ['gedeel', 'oopgemaak']

/* ── Die id in die pad ──────────────────────────────────────
   Dieselfde vorm en dieselfde keuring as hoopSkakel.js s'n. */

const MAKS = 120

export function geldigeId(id) {
  const s = String(id == null ? '' : id).trim()
  if (!s || s.length > MAKS) return false
  if (s.includes('/')) return false
  /* Beheerkarakters, UITGESKRYF. `[ -<]` lyk soos vier karakters en is 'n reeks
     van spasie tot `<` — dit sou elke gewone id verwerp. Sien CLAUDE.md. */
  if (/[\u0000-\u001f\u007f]/.test(s)) return false
  return true
}

export function reelSkakel(id, basis = BASIS) {
  if (!geldigeId(id)) return null
  const skoon = String(basis || BASIS).replace(/\/+$/, '')
  return `${skoon}/reels/${encodeURIComponent(String(id).trim())}`
}

export function idUitPad(pad) {
  const s = String(pad == null ? '' : pad)
  const m = s.match(/^\/reels?\/([^/?#]+)\/?$/i)
  if (!m) return null
  let id
  try { id = decodeURIComponent(m[1]) } catch { id = m[1] }
  id = id.trim()
  return geldigeId(id) ? id : null
}

/* ── Wie mag wys ────────────────────────────────────────────
 *
 * 'n WITLYS, nie 'n swartlys nie — dieselfde vorm as
 * `volgJesusOpenbaar.js`. 'n Clip moet self sê wat hy is; ontbreek een van die
 * vier dinge, wys hy nie. Die belangrikste is `naam`: 'n ander bediening se
 * werk sonder sy naam is nie 'n voer nie, dit is 'n diefstal.
 */
export function magWys(klip) {
  const k = klip || {}
  if (!geldigeId(k.id)) return false
  if (!BRONNE.includes(k.bron)) return false
  if (!String(k.bronId || '').trim()) return false
  if (!String(k.naam || '').trim()) return false
  return true
}

export function skoonLys(klips) {
  return (Array.isArray(klips) ? klips : []).filter(magWys)
}

/* ── Die volgorde ───────────────────────────────────────────
 *
 * Maak iemand 'n GEDEELDE skakel oop, moet DAARDIE clip eerste wees. Sy is
 * belowe iets spesifieks; land sy op clip 1 van 'n voer, is die belofte 'n
 * leuen en sy gaan weg. Dieselfde rede as waarom `/hoop/<id>` die nota dra en
 * nie die tuisblad nie.
 *
 * Die res volg daarna, in hul gewone volgorde. Niks word weggegooi nie.
 */
export function volgordeVanaf(klips, id) {
  const lys = skoonLys(klips)
  if (!id) return lys
  const i = lys.findIndex(k => k.id === id)
  if (i <= 0) return lys
  return [lys[i], ...lys.slice(0, i), ...lys.slice(i + 1)]
}

/* ── Die skommeling ─────────────────────────────────────────
 *
 * Deterministies uit 'n SAAD, en dit is nie 'n toets-gerief nie: die voer groei
 * terwyl 'n mens rol, en dit word elke keer HERBOU met 'n groter aantal passe.
 * Met 'n saad bly die stuk wat sy reeds gesien het presies dieselfde en kom daar
 * net iets by. Met `Math.random()` sou die voer onder haar vingers herskommel.
 *
 * mulberry32 — klein, vinnig, en goed genoeg om 'n voer te meng.
 */
export function saaiRnd(saad) {
  let a = (Number(saad) || 1) >>> 0
  return function () {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* Fisher-Yates. Dit raak nie aan die inset-lys nie. */
export function meng(lys, rnd) {
  const uit = Array.isArray(lys) ? [...lys] : []
  const r = typeof rnd === 'function' ? rnd : saaiRnd(1)
  for (let i = uit.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[uit[i], uit[j]] = [uit[j], uit[i]]
  }
  return uit
}

/* ── Geen twee van dieselfde mens na mekaar nie ──
 *
 * Dit is die helfte wat Dewald werklik gevra het. Skommel alleen is nie genoeg
 * nie: met vyf clips van een bediening tussen twintig, sit twee van hulle
 * dikwels langs mekaar, en dan lyk die voer soos 'n kanaal in plaas van 'n plek
 * waar baie stemme is.
 *
 * ── Waarom dit nie 'n RUIL is nie ──
 *
 * Die eerste weergawe het een keer deurgeloop en elke klont met 'n later item
 * geruil. Dit lyk reg en dit is dit nie: 'n ruil kan 'n NUWE klont verder aan
 * maak, en teen die einde van die lys is daar niks meer om mee te ruil nie. Met
 * drie clips van een mens uit vyf het dit steeds twee langs mekaar gelaat.
 *
 * Dit bou nou die lys OP: neem elke keer die eerste clip wat toegelaat word.
 * Die "toegelaat" is wat dit laat werk, en die uitsondering is wat dit KLAAR
 * laat werk — 'n naam wat meer as die helfte van die orige plekke nodig het,
 * moet NOU kom, anders bly hy aan die einde oor en dan is 'n klont onvermydelik.
 *
 * Dit hou die volgorde so ver as moontlik (dus bly die nuutstes bo) en skuif
 * net waar dit moet.
 *
 * `vorigeNaam` is die naam van die clip wat DIREK hierbo staan — die naat
 * tussen twee passe. Sonder dit sou elke nuwe pas kon begin met dieselfde mens
 * wat die vorige een geeindig het.
 *
 * Is ALLES van een mens, kan dit nie slaag nie, en dan gee dit die lys terug.
 * Dit is die regte kant om op te fouteer: 'n voer wat aangaan is beter as een
 * wat leeg is.
 */
function naamVanKlip(k) {
  return String((k && k.naam) || '').trim().toLowerCase()
}

export function ontklont(lys, vorigeNaam) {
  const oor = Array.isArray(lys) ? [...lys] : []
  const uit = []
  let vorige = String(vorigeNaam == null ? '' : vorigeNaam).trim().toLowerCase()

  while (oor.length) {
    const tel = {}
    for (const k of oor) {
      const n = naamVanKlip(k)
      tel[n] = (tel[n] || 0) + 1
    }
    /* ── Wanneer 'n naam NOU moet kom ──
     *
     * 'n Mens met `t` clips oor en `n` plekke oor kan net sonder 'n klont pas as
     * hy die plekke 1, 3, 5 … kry — en dan het hy `2t - 1` plekke nodig. Is
     * `2t - 1 >= n`, moet hy dus NOU kom; wag ons een beurt, is 'n klont aan die
     * einde onvermydelik.
     *
     * Dit was `tel[n] > Math.ceil(oor.length / 2)`, een te laag, en die gevolg
     * was presies die fout wat dit moes keer: met drie clips van een mens uit
     * vyf het die laaste twee langs mekaar beland. Die toets moet `>=` wees op
     * die regte getal, nie `>` op 'n afgeronde helfte nie. */
    const dringend = Object.keys(tel).find(
      n => n !== vorige && (tel[n] * 2) - 1 >= oor.length
    )

    let i = dringend ? oor.findIndex(k => naamVanKlip(k) === dringend) : -1
    if (i === -1) i = oor.findIndex(k => naamVanKlip(k) !== vorige)
    if (i === -1) i = 0   /* almal van een mens — dit kan nie slaag nie */

    uit.push(oor[i])
    vorige = naamVanKlip(oor[i])
    oor.splice(i, 1)
  }
  return uit
}

/* Hoeveel clips bo staan — die nuutstes vir 'n bekende kyker, die mees gedeelde
   vir 'n nuwe een. */
export const NUUT_BO = 5
export const BESTE_BO = 5

/* ── Die nuutste van ELKE maker, nie die nuutste vyf nie ──
 *
 * Dit is die tweede helfte van Dewald se klag, en dit was die erger een. Die
 * boonste blok was die nuutste VYF clips — en as een mens die vyf nuutste
 * videos gepos het, was die hele bokant syne. `ontklont` het hom toe net tussen
 * ander ingevleg, en dit lees as "elke tweede video is van hom".
 *
 * Die blok is nou die nuutste EEN van elke maker, tot by die perk. Dit is nog
 * steeds "wat is nuut", maar dit is wat nuut is by tot vyf VERSKILLENDE mense —
 * en dit is wat 'n mens bedoel wanneer sy sê die voer moenie soos een kanaal
 * lyk nie.
 */
export function nuutsteVanElkeMaker(klips, hoeveel) {
  const lys = nuutsteEerste(Array.isArray(klips) ? klips : [])
  const perk = Math.max(1, Number(hoeveel) || NUUT_BO)
  const gesien = new Set()
  const uit = []
  for (const k of lys) {
    const n = naamVanKlip(k)
    if (gesien.has(n)) continue
    gesien.add(n)
    uit.push(k)
    if (uit.length >= perk) break
  }
  return uit
}

/* ── Wanneer 'n clip gepos is ──
 *
 * Die POST-ID is die waarheid, nie `datum` nie. 'n TikTok-post-id is 'n
 * Snowflake: die tyd sit in die nommer self, dus is 'n groter id 'n nuwer video.
 * Dit is per VIDEO en dit kan nie dryf nie.
 *
 * `datum` is die INVOERTYD — wanneer die oplosser die dokument geskryf het. Dit
 * lyk soos 'n publikasiedatum en dit is dit nie, en dit het 'n egte fout gemaak:
 * die invoer loop in happe van 24, dus kry vier-en-twintig clips presies
 * dieselfde "nuutste" tydstempel. Was een maker se clips laat in die plaklys,
 * het hulle die hele boonste blok gevul. Dewald op 'n regte foon: *"teveel van
 * Johandre Potgieter se videos wys bo... daar is meer videos van my maar syne
 * wys meer."*
 *
 * Die id kom dus eerste, en `datum` is net die terugval vir 'n bron sonder 'n
 * numeriese id (YouTube s'n is letters).
 */
export function tydVan(klip) {
  const k = klip || {}
  const id = String(k.bronId || '')
  if (/^[0-9]{10,21}$/.test(id)) {
    /* Die getal self, as 'n string van vaste lengte sodat 'n stringvergelyking
       reg sorteer — 'n Snowflake is groter as Number.MAX_SAFE_INTEGER. */
    return id.padStart(24, '0')
  }
  const d = String(k.datum || '')
  return d ? `D${d}` : ''
}

/* Die nuutste eerste. Is daar niks om op te gaan nie, is die LAASTE inskrywing
   in die lys die nuutste, want dit is hoe 'n mens byvoeg. */
export function nuutsteEerste(klips) {
  const lys = Array.isArray(klips) ? [...klips] : []
  const hetTyd = lys.some(k => tydVan(k))
  if (!hetTyd) return lys.reverse()
  return lys.sort((a, b) => tydVan(b).localeCompare(tydVan(a)))
}

/* ── Versprei die makers EWEREDIG ──
 *
 * `ontklont()` keer net dat twee van dieselfde mens LANGS mekaar staan. Dit is
 * nie genoeg nie: met 'n derde van die clips van een maker gee dit presies
 * "elke tweede of derde video is van hom" — wat is wat Dewald gesien het.
 *
 * Hierdie een deel die clips UIT. Elke maker kry 'n gelyke steek oor die hele
 * pas: 'n mens met 60 uit 124 kom elke tweede keer, een met 30 elke vierde, een
 * met 4 een keer elke een-en-dertig. Dit is eweredig aan hoeveel hy het, en dit
 * is presies wat 'n mens verwag — die een met die MEESTE clips moet die meeste
 * wys, nie die een wie se clips laas ingekom het nie.
 *
 * Die `skuif` is toevallig sodat nie elke maker se eerste clip bo-aan opstapel
 * nie.
 */
export function versprei(lys, rnd) {
  const alles = Array.isArray(lys) ? lys : []
  if (alles.length <= 2) return [...alles]
  const r = typeof rnd === 'function' ? rnd : saaiRnd(1)

  const groepe = new Map()
  for (const k of alles) {
    const n = naamVanKlip(k)
    if (!groepe.has(n)) groepe.set(n, [])
    groepe.get(n).push(k)
  }

  const n = alles.length
  const met = []
  for (const groep of groepe.values()) {
    const g = meng(groep, r)
    const stap = n / g.length
    const skuif = r() * stap
    g.forEach((k, i) => met.push({ k, plek: skuif + i * stap }))
  }
  met.sort((a, b) => a.plek - b.plek)
  return met.map(x => x.k)
}

/* ── Die mees gedeelde eerste ──
 *
 * `gedeel` is 'n kaal heelgetal op die clip — sien GEBEURE se kop. Ontbreek dit,
 * is dit nul; 'n nuwe clip is dus onder, en dit is reg: hy het nog niks bewys
 * nie. Gelykes hou hul plek (die sortering is stabiel), en die blok word in elk
 * geval geskommel.
 */
export function meesteGedeelEerste(klips) {
  const lys = Array.isArray(klips) ? [...klips] : []
  return lys.sort((a, b) => Number((b && b.gedeel) || 0) - Number((a && a.gedeel) || 0))
}

/* ── Een pas deur al die clips ──
 *
 * Die nuutstes bo, onder mekaar geskommel; die res daarna, ook geskommel; en
 * dan word dieselfde-naam-langs-mekaar uitgehaal.
 */
export function eenPas(klips, rnd, vorigeNaam, opsies) {
  const lys = skoonLys(klips)
  if (lys.length <= 1) return lys
  const o = opsies || {}

  /* ── 'n NUWE kyker sien die BEWESE clips eerste ──
   *
   * En net die BEWESE. Die blok was eers 'n vaste vyf, en dan is hy met clips
   * opgevul wat nog nooit gedeel is nie — presies die teenoorgestelde van wat
   * gevra is. 'n Clip met nul dele het niks bewys nie en hoort nie in die
   * voorkeur-blok nie.
   *
   * Is daar NIKS gedeel nie (dag een, of 'n vars versameling), val dit terug op
   * die nuutste bo. Daar is dan niks om voorkeur aan te gee. */
  if (o.nuut) {
    const bewys = meesteGedeelEerste(lys).filter(k => Number((k && k.gedeel) || 0) > 0)
    if (bewys.length) {
      const bo = bewys.slice(0, BESTE_BO)
      const boIds = new Set(bo.map(k => k.id))
      const res = lys.filter(k => !boIds.has(k.id))
      return ontklont([...meng(bo, rnd), ...versprei(res, rnd)], vorigeNaam)
    }
  }

  /* Die gewone orde: die nuutstes bo, en die res EWEREDIG versprei sodat geen
     maker elke tweede of derde plek vul nie. `ontklont` bly die laaste
     veiligheidsnet vir wat nog langs mekaar beland. */
  const bo = nuutsteVanElkeMaker(lys, NUUT_BO)
  const boIds = new Set(bo.map(k => k.id))
  const res = lys.filter(k => !boIds.has(k.id))
  return ontklont([...meng(bo, rnd), ...versprei(res, rnd)], vorigeNaam)
}

/* ── Die hele voer, as 'n lys ITEMS ──
 *
 * 'n Item is `{ tipe: 'klip', klip }` of `{ tipe: 'mylpaal' }`. Die mylpaal kom
 * EEN keer, ná die eerste volle pas — daar waar "jy het alles gesien" waar is —
 * en die voer loop daarna aan.
 *
 * `deepId` staan heel eerste en word uit die eerste pas gehaal, sodat 'n mens
 * nie dieselfde clip twee keer agter mekaar sien nie. Die belofte in die
 * gedeelde boodskap bly dus staan.
 */
/* ── Wat sy REEDS GESIEN het ──
 *
 * Dewald, 12 September 2026: *"as ek uit die app gaan en weer terug gaan wys
 * dit dieselfde videos alweer. die kyker mag dit net 2 keer sien as hulle deur
 * al die videos gegaan het en nuwe videos altyd eerste.... bo. moet nooit video
 * 2 keer wys as daar ander videos is wat hul nog nie gekyk het nie."*
 *
 * Hy is reg, en die ou ontwerp kon dit nie doen nie. Dit het onthou WAAR sy was
 * (`reels_laaste`, 'n plek in die ry) en die ry is by elke oopmaak met 'n nuwe
 * saad herskommel. 'n Plek in 'n ry wat verander, is niks — sy het dieselfde
 * clips weer bo gekry terwyl daar clips was wat sy nog nooit gesien het nie.
 *
 * Die waarheid is nie 'n PLEK nie, dit is 'n LYS: watter clips, en hoeveel keer.
 * `reels_gesien` in localStorage, `{ id: telling }`.
 *
 * Daaruit volg alles wat hy gevra het, sonder 'n enkele ekstra reël:
 *
 *   · die voer bou RONDES. Rondte 0 is elke clip met telling 0, rondte 1 elke
 *     clip met telling 1, en so aan. 'n Clip kan dus nooit 'n tweede keer wys
 *     terwyl daar een is wat sy nog nie gesien het nie — dit is nie 'n toets
 *     wat ons doen nie, dit is die vorm van die lys;
 *   · "hoogstens twee keer" is die perk op die aantal rondes;
 *   · en 'n NUWE clip wat hy vandag inplak, het telling 0 en staan dus in die
 *     eerste rondte — bo, saam met die ander wat sy nog nie gesien het nie.
 */

/* Hoeveel keer het sy hierdie clip gesien? 'n Onbekende id is 0.
   Dit aanvaar 'n gewone voorwerp, 'n Map, of niks — die berging kan enigiets
   teruggee en 'n stukkende sleutel mag nie die voer omkantel nie. */
export function gesienTel(gesien, id) {
  const sleutel = String((id === 0 ? '0' : id) || '')
  if (!sleutel || !gesien) return 0
  let rou
  if (typeof gesien.get === 'function') rou = gesien.get(sleutel)
  else if (typeof gesien === 'object') rou = gesien[sleutel]
  const n = Math.floor(Number(rou))
  return Number.isFinite(n) && n > 0 ? n : 0
}

/* Die LAAGSTE telling onder hierdie clips — die rondte waarin sy tans is.
   Is daar een wat sy nog nie gesien het nie, is dit 0, en dan bestaan die
   volgende rondte nie eers nie. */
export function laagsteTel(klips, gesien) {
  const lys = skoonLys(klips)
  if (!lys.length) return 0
  let min = Infinity
  for (const k of lys) min = Math.min(min, gesienTel(gesien, k.id))
  return Number.isFinite(min) ? min : 0
}

/* Die clips van die HUIDIGE rondte: dié met die laagste telling.
   Dit is die hele "moet nooit video 2 keer wys as daar ander videos is wat hul
   nog nie gekyk het nie" — en dit is 'n filter, nie 'n reël nie. */
export function huidigeRondte(klips, gesien) {
  const lys = skoonLys(klips)
  const min = laagsteTel(lys, gesien)
  return lys.filter(k => gesienTel(gesien, k.id) === min)
}

export function bouVoer(klips, opsies) {
  const o = opsies || {}
  const alles = skoonLys(klips)
  if (!alles.length) return []

  const passe = Math.max(1, Number(o.passe) || 1)
  const rnd = saaiRnd(o.saad || 1)

  /* ── Waar sy EERSTE moet land ──
   *
   * Net `deepId`: 'n GEDEELDE skakel. Sy is 'n spesifieke video belowe, en 'n
   * voer wat by clip 1 begin, maak van daardie belofte 'n leuen.
   *
   * Hier het OOK 'n `begin` gestaan — die clip waar sy laas opgehou het. Dit is
   * weg, en Dewald se klag is die rede: *"as ek uit die app gaan en weer terug
   * gaan wys dit dieselfde videos alweer."* Daardie clip is een wat sy KLAAR
   * gesien het, en om hom bo te sit was om haar dieselfde video weer te gee.
   *
   * "Gaan voort waar sy opgehou het" is nie weg nie — dit is BETER gedoen. Die
   * rondtes hieronder gee haar die clips wat sy nog NIE gesien het nie, en dit
   * is presies wat "voortgaan" beteken. */
  const deep = o.deepId ? alles.find(k => k.id === o.deepId) : null
  const res = deep ? alles.filter(k => k.id !== deep.id) : alles

  /* ── Die tellings, en hoekom hier 'n KOPIE gemaak word ──
   *
   * Elke rondte wat gebou word, laat die tellings een op skuif — anders sou
   * elke rondte dieselfde clips bevat. Dit is 'n plaaslike kopie: die egte
   * tellings in localStorage skuif wanneer sy WERKLIK kyk, nie wanneer ons die
   * lys bou nie.
   *
   * 'n Gedeelde clip tel dadelik saam. Sy is besig om hom te kyk, en sonder dit
   * sou hy 'n paar plekke later weer opkom. */
  const telle = Object.create(null)
  for (const k of alles) telle[k.id] = gesienTel(o.gesien, k.id)
  if (deep) telle[deep.id] += 1

  /* Was daar iets wat sy nog NIE gesien het nie toe ons begin het? Net dan is
     die mylpaal waar. Het sy alles klaar gesien, sê "jy het alles gesien" niks
     nuuts en dan is dit 'n kaart wat elke oopmaak in die pad staan. */
  const hetOngesien = alles.some(k => telle[k.id] === 0)

  const items = []
  if (deep) items.push({ tipe: 'klip', klip: deep })

  /* Die laaste EGTE clip, nie die laaste item nie: die mylpaal staan tussen twee
     passe, en 'n naat-toets wat op `items[items.length - 1]` kyk, sien dan die
     kaart en slaan die hele toets oor. Die gevolg was dieselfde clip twee keer
     agter mekaar met 'n kaart tussenin. */
  let laaste = deep || null

  for (let p = 0; p < passe; p++) {
    /* ── Elke pas is die RONDTE van die minste-gesien clips ──
       Dit is die hele antwoord op *"moet nooit video 2 keer wys as daar ander
       videos is wat hul nog nie gekyk het nie."* Rondte 0 is alles met telling
       0; is dit leeg, is alles een keer gesien en dan kom rondte 1. 'n Clip kan
       dus nie voorspring nie — die vorm van die lys keer dit, nie 'n toets.

       Die eerste pas laat die gedeelde clip uit; hy staan reeds bo. */
    const bron = (p === 0 ? res : alles)
    const min = bron.length ? Math.min(...bron.map(k => telle[k.id])) : 0
    const rondte = bron.filter(k => telle[k.id] === min)

    /* Net die EERSTE pas kry die nuwe-kyker-orde, en `nuut` beteken sy het nog
       NIKS gesien nie. Binne 'n rondte staan die nuutstes bo — dit is Dewald se
       *"nuwe videos altyd eerste.... bo"*, en 'n clip wat hy vandag inplak, het
       telling 0 en staan dus in hierdie rondte. */
    const pas = eenPas(rondte, rnd, laaste ? naamVanKlip(laaste) : '',
                       { nuut: !!o.nuut && p === 0 })
    if (!pas.length) continue
    /* Die rondte is nou gekyk, sover hierdie lys gaan. */
    for (const k of pas) telle[k.id] += 1
    /* Dieselfde CLIP twee keer agter mekaar bly moontlik wanneer daar net een
       mens is; dan help niks. Is daar meer, skuif hy een plek af. */
    if (laaste && pas.length > 1 && pas[0].id === laaste.id) {
      const j = pas.findIndex((k, x) => x > 0 && k.id !== laaste.id && naamVanKlip(k) !== naamVanKlip(laaste))
      if (j > 0) { const t = pas[0]; pas[0] = pas[j]; pas[j] = t }
    }
    for (const k of pas) items.push({ tipe: 'klip', klip: k })
    laaste = pas[pas.length - 1]
    /* Die mylpaal, een keer, ná die eerste volle pas — en NET as daar iets was
       wat sy nog nie gesien het nie. Anders sê "jy het alles gesien" niks nuuts
       en staan die kaart by elke oopmaak in die pad. */
    if (p === 0 && passe > 1 && hetOngesien) items.push({ tipe: 'mylpaal' })
  }

  return items
}

/* ── Die woorde wat gestuur word ────────────────────────────
 *
 * 'n KAAL skakel word nie oopgemaak nie. Wat oopgemaak word, is 'n sin wat 'n
 * belofte maak — en die sin moet waar wees, anders word hy een keer gestuur en
 * nooit weer nie.
 *
 * Is dit iemand anders se clip, staan sy naam IN die boodskap. Dit is nie
 * beleefdheid nie: dit is die rede waarom hy sy werk hier laat wees.
 */
export function deelBoodskap(klip, skakel) {
  const k = klip || {}
  const naam = String(k.naam || '').trim()
  const eie = !!k.eie

  const sin = eie || !naam
    ? 'Ek het hierdie vandag gesien en aan jou gedink.'
    : `Ek het hierdie van ${naam} gesien en aan jou gedink.`

  const s = String(skakel || '').trim()
  return s ? `${sin}\n\n${s}` : sin
}

/* ── Wanneer die installasievraag opkom ─────────────────────
 *
 * NÁ die tweede swiep, en nie 'n oomblik vroeër nie.
 *
 * Dit is die duurste reël in hierdie lêer en dit kom uit 'n fout wat hierdie
 * app reeds gemaak het: 'n installasiemuur VOOR die waarde is hoe 'n mens 'n
 * vreemdeling verloor. Sy het op 'n skakel gedruk om iets te SIEN. Vra ons
 * voordat sy iets gesien het, is die antwoord nee, en sy kom nie terug nie.
 *
 * Ná twee swiepe het sy drie oomblikke gesien en self besluit om aan te hou.
 * Dít is die mens wat ja sê.
 *
 * `gesien` is hoeveel clips al gewys is, nie hoeveel swiepe nie — 'n mens wat
 * die voer van voor af oopmaak, het by clip 1 nog nul keer geswiep.
 */
export const SWIEPE_VOOR_VRA = 2

/* ── Die mens op 'n GEDEELDE skakel is 'n ander mens ──
 *
 * Dewald, 12 September 2026: *"wanneer iemand die video share en hulle kyk moet
 * die popup opkom so 3 sekondes voor die video eindig...... nie na hul paar
 * videos gekyk het nie... of as hul op scroll die eerste keer moet popup dadelik
 * wys."*
 *
 * Hy is reg, en die twee gevalle is werklik verskillend:
 *
 *   · 'n mens IN die app rol deur 'n voer. Twee swiepe beteken sy het self
 *     besluit om aan te hou, en dít is die mens wat ja sê;
 *   · 'n VREEMDELING op 'n gedeelde skakel het op één ding gedruk om één video
 *     te sien. Sy gaan nie noodwendig 'n tweede en 'n derde kyk nie. Wag ons vir
 *     drie, is sy weg en die hele skakel was verniet.
 *
 * Vir haar is daar dus twee oomblikke, en die EERSTE wat kom, wen:
 *
 *   1. sy swiep — dan het sy meer gevra as die een video wat belowe is;
 *   2. of die video is byna klaar. Sy het gekry wat belowe is en sy kyk nog.
 *
 * Dit is die pad wat die app moet laat groei, en dit is hoekom die drempel hier
 * EEN swiep is en nie twee nie.
 *
 * Die getal is die aantal SWIEPE, net soos `SWIEPE_VOOR_VRA`. `gesien` tel die
 * clips wat sy gesien het en begin by 1, dus is "een swiep" `gesien > 1`. */
export const SWIEPE_VOOR_VRA_GEDEEL = 1

export function magVraInstalleer(f) {
  const d = f || {}
  if (d.geinstalleer) return false      /* dit is reeds op haar foon */
  if (d.reedsGevra) return false        /* een keer per besoek, nie by elke clip */
  if (d.ietsOop) return false           /* nooit bo-op iets anders nie */
  const drempel = d.gedeel ? SWIEPE_VOOR_VRA_GEDEEL : SWIEPE_VOOR_VRA
  return Number(d.gesien || 0) > drempel
}

/* ── Drie sekondes voor die einde ──
 *
 * Dewald se woorde presies. Die getal is klein met opset: vra te vroeg en jy
 * onderbreek die ding waarvoor sy gekom het; vra ná die einde en die video het
 * klaar weer begin (`loop=1`) en die oomblik is verby.
 *
 * Suiwer, want dit moet toetsbaar wees: twee getalle in, 'n boolean uit. */
export const SEKONDES_VOOR_EINDE = 3

export function vraByEinde(f) {
  const d = f || {}
  const nou = Number(d.nou)
  const duur = Number(d.duur)
  if (!Number.isFinite(nou) || !Number.isFinite(duur)) return false
  if (nou < 0 || duur <= 0) return false
  /* 'n Video wat KORTER is as die venster self: dan is daar geen "drie sekondes
     voor die einde" nie, en die veiligste oomblik is die einde toe. */
  if (duur <= SEKONDES_VOOR_EINDE) return nou > 0
  return duur - nou <= SEKONDES_VOOR_EINDE
}

/* ── Die brug terug na die app se eie inhoud ────────────────
 *
 * 'n Clip van Daaglikse Hoop self dra 'n knoppie na die ding waaroor hy gaan —
 * die volle stemboodskap, die leesplan, Dra Mekaar. Dit is hoe 'n kort oomblik
 * 'n lang een word.
 *
 * 'n ANDER bediening se clip kry daardie knoppie nie: dit sou lyk of ons hul
 * werk gebruik om ons eie bladsye te bemark. Hulle kry hul eie naam, en later
 * hul eie bladsy.
 */
export function brugVir(klip) {
  const k = klip || {}
  if (!k.eie) return null
  const gebeurtenis = String(k.gebeurtenis || '').trim()
  const woorde = String(k.brug || '').trim()
  if (!gebeurtenis || !woorde) return null
  return { gebeurtenis, woorde }
}
