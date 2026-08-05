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
        if (!d || !Array.isArray(d.boeke) || !d.boeke.length) return null
        return d
      })
      .catch(() => null)
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
