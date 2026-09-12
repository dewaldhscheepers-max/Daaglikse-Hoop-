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

   Twee dinge volg daaruit, en albei staan in `eenPas()`: die NUUTSTE clips
   staan bo (geskommel onder mekaar), en geen twee clips van dieselfde mens volg
   op mekaar nie. Sonder die tweede reël lyk 'n voer soos 'n kanaal.

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

/* Die nuutste eerste. `datum` is opsioneel; is dit nêrens nie, is die LAASTE
   inskrywing in die lys die nuutste, want dit is hoe 'n mens byvoeg. */
export function nuutsteEerste(klips) {
  const lys = Array.isArray(klips) ? [...klips] : []
  const hetDatum = lys.some(k => k && k.datum)
  if (!hetDatum) return lys.reverse()
  return lys.sort((a, b) => String((b && b.datum) || '').localeCompare(String((a && a.datum) || '')))
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
      return ontklont([...meng(bo, rnd), ...meng(res, rnd)], vorigeNaam)
    }
  }

  /* Die gewone orde: die nuutstes bo. */
  const gesorteer = nuutsteEerste(lys)
  const bo  = gesorteer.slice(0, NUUT_BO)
  const res = gesorteer.slice(NUUT_BO)
  return ontklont([...meng(bo, rnd), ...meng(res, rnd)], vorigeNaam)
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
export function bouVoer(klips, opsies) {
  const o = opsies || {}
  const alles = skoonLys(klips)
  if (!alles.length) return []

  const passe = Math.max(1, Number(o.passe) || 1)
  const rnd = saaiRnd(o.saad || 1)

  const deep = o.deepId ? alles.find(k => k.id === o.deepId) : null
  const res = deep ? alles.filter(k => k.id !== deep.id) : alles

  const items = []
  if (deep) items.push({ tipe: 'klip', klip: deep })

  /* Die laaste EGTE clip, nie die laaste item nie: die mylpaal staan tussen twee
     passe, en 'n naat-toets wat op `items[items.length - 1]` kyk, sien dan die
     kaart en slaan die hele toets oor. Die gevolg was dieselfde clip twee keer
     agter mekaar met 'n kaart tussenin. */
  let laaste = deep || null

  for (let p = 0; p < passe; p++) {
    /* Die eerste pas laat die gedeelde clip uit; daarna is alles weer in.
       Die naat word IN die skikking hanteer, nie met 'n ruil agterna nie. */
    /* Net die EERSTE pas kry die nuwe-kyker-orde. Het sy alles een keer gesien,
       is sy nie meer nuut nie, en dan is "wat is nuut" die nuttiger vraag. */
    const pas = eenPas(p === 0 ? res : alles, rnd, laaste ? naamVanKlip(laaste) : '',
                       { nuut: !!o.nuut && p === 0 })
    if (!pas.length) continue
    /* Dieselfde CLIP twee keer agter mekaar bly moontlik wanneer daar net een
       mens is; dan help niks. Is daar meer, skuif hy een plek af. */
    if (laaste && pas.length > 1 && pas[0].id === laaste.id) {
      const j = pas.findIndex((k, x) => x > 0 && k.id !== laaste.id && naamVanKlip(k) !== naamVanKlip(laaste))
      if (j > 0) { const t = pas[0]; pas[0] = pas[j]; pas[j] = t }
    }
    for (const k of pas) items.push({ tipe: 'klip', klip: k })
    laaste = pas[pas.length - 1]
    /* Die mylpaal, een keer, ná die eerste volle pas. */
    if (p === 0 && passe > 1) items.push({ tipe: 'mylpaal' })
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

export function magVraInstalleer(f) {
  const d = f || {}
  if (d.geinstalleer) return false      /* dit is reeds op haar foon */
  if (d.reedsGevra) return false        /* een keer per besoek, nie by elke clip */
  if (d.ietsOop) return false           /* nooit bo-op iets anders nie */
  return Number(d.gesien || 0) > SWIEPE_VOOR_VRA
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
