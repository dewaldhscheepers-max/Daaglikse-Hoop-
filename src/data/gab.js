/* ────────────────────────────────────────────────────────────
   Die Getroue Afrikaanse Bybel (GAB) — die Afrikaanse Bybel in die app.

   Hoekom hierdie een en nie die 1953 of 1983 nie:

   Die Bybelgenootskap van SA het skriftelik geweier dat hul teks in 'n
   ander app kom, en oorweeg glad nie digitale versoeke nie. Die GAB is 'n
   onafhanklike 2026-vertaling wat uit die 1769 Cambridge King James gemaak
   is, en die projek stel dit self onder 'n CC BY-NC-ND 4.0-lisensie
   beskikbaar. Daardie lisensie IS die skriftelike toestemming.

     https://getroueafrikaansebybel.com

   Drie dinge wat daardie lisensie van ons eis, en wat nooit hier mag
   uitval nie:

   1. ERKENNING. Naam, kopiereg, lisensie en 'n skakel na die bron, orals
      waar die teks wys. Sien GAB_ERKENNING hieronder.
   2. ONVERANDERD. ND beteken GeenAfgeleides. Ons wys die teks presies soos
      ons dit kry. Sien jy 'n fout, rapporteer dit aan die projek — moet dit
      NIE hier regmaak nie. 'n Reggemaakte weergawe is 'n afgeleide werk en
      mag nie versprei word nie.
   3. NIE-KOMMERSIEEL. Geen betaalmuur, geen advertensie en geen versoek om
      geld op enige skerm waar hierdie teks wys nie. Daarom is die
      Steun-blok van die Bybelskerm af weg.

   ── Waar die teks vandaan kom ──

   Nie uit 'n API nie. Die teks is 66 statiese lêers onder /gab/, een per
   boek, wat gehaal word wanneer 'n mens die boek oopmaak. Dit hou die app
   se installasie klein en dit beteken 'n boek wat jy een keer gelees het,
   werk daarna aflyn — iets wat die Engelse vertalings nie kan doen nie,
   want hulle hang aan YouVersion se bediener.

   ── Die lêerformaat ──

   /gab/indeks.json
     {
       "weergawe": "2026-02-11",           // die GAB se eie datum/weergawe
       "boeke": ["GEN", "EXO", ...]        // USFM-kodes, in volgorde
     }

   /gab/GEN.json
     {
       "boek": "GEN",
       "weergawe": "2026-02-11",
       "hoofstukke": [
         ["In die begin het God ...", "En die aarde was ...", ...],
         [...]
       ]
     }

   Hoofstuk 1 is indeks 0. Vers 1 is indeks 0. Plat teks, geen opmaak nie.

   ── Wat gebeur as die lêers nie daar is nie ──

   Niks. indeks.json misluk stil, die GAB verskyn nie in die vertalinglys
   nie, en die app is presies soos hy was. Dit is doelbewus: die kode kan
   gestoot word voordat die teks daar is.
   ──────────────────────────────────────────────────────────── */

import { BOEKE } from './bybelBoeke'

export const GAB_ID  = 'gab'
export const GAB_AFK = 'GAB'

export const GAB_ERKENNING = {
  naam: 'Getroue Afrikaanse Bybel',
  kopiereg: 'Getroue Afrikaanse Bybel 2026',
  lisensie: 'CC BY-NC-ND 4.0',
  lisensieSkakel: 'https://creativecommons.org/licenses/by-nc-nd/4.0/deed.af',
  bron: 'https://getroueafrikaansebybel.com',
}

const BASIS = '/gab'

/* Een keer per sessie gehaal, en dan gehou. */
let indeksBelofte = null
const boekKas = {}

async function haalJson(pad) {
  const r = await fetch(pad, { headers: { accept: 'application/json' } })
  if (!r.ok) throw new Error('HTTP ' + r.status)
  return r.json()
}

/* Is die GAB in hierdie ontplooiing beskikbaar?

   Gee die indeks terug, of null. Nooit 'n uitsondering nie — 'n app sonder
   die lêers moet net stil aangaan asof die GAB nie bestaan nie. */
export function gabIndeks() {
  if (!indeksBelofte) {
    indeksBelofte = haalJson(`${BASIS}/indeks.json`)
      .then(d => {
        if (!d || !Array.isArray(d.boeke) || !d.boeke.length) {
          /* Nie 'n netwerkfout nie — die lêer is daar maar leeg of stukkend.
             Dit gaan nie vanself regkom nie, dus onthou ons dit. */
          return null
        }
        return d
      })
      .catch(() => {
        /* Dit MISLUK, en dit kan later slaag: die foon was aflyn, die
           ontplooiing was halfpad, die netwerk het gehak.

           Vroeer het ons die mislukking onthou, en dan het die Afrikaanse
           Bybel weggebly tot die app heeltemal herbegin is — selfs nadat die
           netwerk teruggekom het. Nou vergeet ons dit, sodat die volgende
           poging weer probeer. */
        indeksBelofte = null
        return null
      })
  }
  return indeksBelofte
}

/* Die GAB as 'n "weergawe", presies dieselfde vorm as wat YouVersion se API
   teruggee. So hoef die skerm nie te weet waar 'n vertaling vandaan kom
   nie — die boekelys, die hoofstukke en die teks lyk eenders. */
export function gabWeergawe(indeks) {
  const boeke = indeks.boeke.filter(k => BOEKE[k])
  return {
    id: GAB_ID,
    abbreviation: GAB_AFK,
    title: GAB_ERKENNING.naam,
    books: boeke,
    bron: 'gab',
    weergawe: indeks.weergawe || null,
    /* Die GAB word nog hersien — hul werf het 'n "Voorstelle"-knoppie met 'n
       teller. Wat ons gehaal het, is 'n momentopname van werk-in-wording, en
       die skerm moet dit se. 'n Mens gee nie vir iemand 'n konsep-Bybel
       sonder om te se dis 'n konsep nie. */
    konsep: indeks.konsep !== false,
  }
}

async function haalBoek(kode) {
  if (boekKas[kode]) return boekKas[kode]
  const d = await haalJson(`${BASIS}/${kode}.json`)
  if (!d || !Array.isArray(d.hoofstukke)) throw new Error('leë boek')
  boekKas[kode] = d
  return d
}

/* Die hoofstuklys, in dieselfde vorm as die API s'n: 'n lys objekte met 'n
   title. Die skerm tel hulle en wys nommers. */
export async function gabHoofstukke(kode) {
  const d = await haalBoek(kode)
  return d.hoofstukke.map((_, i) => ({ id: `${kode}.${i + 1}`, title: String(i + 1) }))
}

/* HTML-ontsnapping. Die teks kom uit 'n lêer en gaan in die DOM in; dit
   moet nooit as opmaak gelees kan word nie. */
function veilig(t) {
  return String(t)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/* Een hoofstuk, in dieselfde vorm as wat die API teruggee: { content }.

   Die versmerkers is <span class="yv-v" v="3">, want dit is presies wat
   omhulVerse() in Bybel.jsx soek. Die aantik-'n-vers-blad, die deel-knoppie
   en die spring-na-'n-vers werk daarmee sonder 'n enkele verandering. */
export async function gabTeks(kode, nr) {
  const d = await haalBoek(kode)
  const verse = d.hoofstukke[nr - 1]
  if (!Array.isArray(verse)) throw new Error('onbekende hoofstuk')

  const dele = verse.map((teks, i) =>
    `<p class="gab-vers"><span class="yv-v" v="${i + 1}">${i + 1}</span> ${veilig(teks)}</p>`
  )

  return { content: dele.join('\n'), gab: true, weergawe: d.weergawe || null }
}

/* Hoeveel hoofstukke het hierdie boek? Word gebruik om 'n verwysing te
   keur voordat ons daarheen spring. */
export async function gabHoofstukAantal(kode) {
  try { return (await haalBoek(kode)).hoofstukke.length } catch { return 0 }
}

/* ────────────────────────────────────────────────────────────
   Soek deur die hele Bybel, aflyn.

   Die 66 lêers le op die toestel, dus kan 'n mens vir 'n WOORD soek en nie
   net vir 'n verwysing nie — "vergifnis", "moeg", "vrede". Dit is waarvoor
   mense 'n Bybel oopmaak wanneer hulle swaarkry, en dit is presies wat die
   gratis Afrikaanse opsies nie kan doen nie.

   Die koste: die eerste soektog moet al 66 lêers inlees. Daarna is dit in die
   geheue en oombliklik, en die diensketter hou hulle op skyf. GEWONE LEES
   WORD NOOIT GERAAK NIE — hierdie kode loop net wanneer iemand tik.
   ──────────────────────────────────────────────────────────── */

/* Sonder aksente en sonder hoofletters, sodat "Jesaja" en "jesaja" en
   "moeg" en "Moeg" dieselfde is. Dit raak nooit die teks wat gewys word
   nie — net die kopie waarin ons soek. */
function platteland(t) {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

let soekBelofte = null

/* Laai die hele Bybel in die geheue, een keer. Die roeper kan 'n
   vordering-funksie gee sodat die skerm iets kan wys. */
export function laaiAllesVirSoek(opVordering) {
  if (soekBelofte) return soekBelofte
  soekBelofte = (async () => {
    const ind = await gabIndeks()
    if (!ind) { soekBelofte = null; return null }
    const boeke = ind.boeke.filter(k => BOEKE[k])
    let klaar = 0
    const uit = []
    /* Ses op 'n slag: vinnig genoeg, en dit versmoor nie 'n stadige foon nie. */
    for (let i = 0; i < boeke.length; i += 6) {
      const stuk = boeke.slice(i, i + 6)
      const data = await Promise.all(stuk.map(async kode => {
        try { return { kode, d: await haalBoek(kode) } } catch { return null }
      }))
      for (const x of data) {
        klaar++
        if (!x) continue
        uit.push({ kode: x.kode, hoofstukke: x.d.hoofstukke })
      }
      if (opVordering) opVordering(klaar, boeke.length)
    }
    return uit
  })().catch(() => { soekBelofte = null; return null })
  return soekBelofte
}

/* Soek 'n frase. Gee 'n lys treffers terug, in Bybelvolgorde.

   `maks` hou die lys hanteerbaar; die teller se hoeveel daar in werklikheid
   is, sodat 'n mens weet of jy jou soektog moet vernou. */
export async function soekTeks(vraag, { maks = 60 } = {}) {
  const naald = platteland(String(vraag || '').trim())
  if (naald.length < 3) return { treffers: [], totaal: 0, kort: true }

  const alles = await laaiAllesVirSoek()
  if (!alles) return { treffers: [], totaal: 0, fout: true }

  const treffers = []
  let totaal = 0
  for (const { kode, hoofstukke } of alles) {
    for (let h = 0; h < hoofstukke.length; h++) {
      const verse = hoofstukke[h]
      for (let v = 0; v < verse.length; v++) {
        const teks = verse[v]
        if (!teks) continue
        if (platteland(teks).includes(naald)) {
          totaal++
          if (treffers.length < maks) treffers.push({ kode, hoofstuk: h + 1, vers: v + 1, teks })
        }
      }
    }
  }
  return { treffers, totaal }
}

/* ── Kruisverwysings ──

   Aparte lêers onder /gab/x/, sodat gewone lees hulle nooit laai nie. Net
   wie 'n vers aantik, trek daardie een boek se lys.

   'n Verwysing is [kode, hoofstuk, vers, totVers] — die afkortings is by die
   invoer opgelos, dus hoef die app niks te ontleed nie. */
const xKas = {}

export async function gabVerwysings(kode, hoofstuk, vers) {
  try {
    if (!xKas[kode]) xKas[kode] = await haalJson(`${BASIS}/x/${kode}.json`)
    const h = xKas[kode] && xKas[kode].verwysings && xKas[kode].verwysings[String(hoofstuk)]
    const lys = h && h[String(vers)]
    return Array.isArray(lys) ? lys : []
  } catch {
    /* Geen kruisverwysings is nie 'n fout wat 'n mens moet sien nie — die
       vers-blad wys dan bloot niks ekstra nie. */
    return []
  }
}
