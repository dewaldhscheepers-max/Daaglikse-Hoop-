/* ── Wat 'n mens werklik plak ──
 *
 * Op 12 September 2026 het Dewald 124 skakels gestuur. Nie een per reël nie —
 * AANMEKAAR, sonder 'n enkele spasie of nuwe reël tussen hulle:
 *
 *     https://vt.tiktok.com/ZSqmNv24S/https://vt.tiktok.com/ZSqmN3j62/https://…
 *
 * Dit is hoe 'n foon dit gee wanneer 'n mens die een ná die ander deel en die
 * boodskappe saamvoeg. 'n Splitser wat op `\n` of `,` staatmaak, kry EEN string
 * van 5 000 karakters en gooi die hele klomp weg.
 *
 * Daarom SOEK hierdie lêer die skakels in plaas daarvan om te SPLITS. Dit is
 * die hele verskil, en dit is die soort ding wat 'n mens net een keer verkeerd
 * doen.
 *
 * Suiwer, sodat die vorm en die bediener presies dieselfde lys uit dieselfde
 * plaksel kry. Twee splitsers en die admin sou 124 wys waar die bediener 1 sien.
 */

/* Elke vorm wat TikTok se deel-knoppie gee, plus die volle adres.
 *
 * Die `/` aan die einde is OPSIONEEL — 'n mens se foon laat dit soms val, en
 * die laaste skakel in 'n aanmekaar-geplakte string het dikwels nie een nie.
 * Die groep eindig by die volgende `h` van "https" of by die einde, want dit is
 * die enigste grens wat 'n aanmekaar-string het. */
const KORT  = /(?:https?:\/\/)?(?:www\.)?(?:vt|vm)\.tiktok\.com\/[A-Za-z0-9]+\/?/g
const KORT_T = /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/t\/[A-Za-z0-9]+\/?/g
const LANK  = /(?:https?:\/\/)?(?:www\.|m\.)?tiktok\.com\/@[A-Za-z0-9._-]+\/(?:video|photo)\/[0-9]{17,21}(?:\/|\?[^\s]*)?/g

/* Hoeveel skakels ons in een plaksel aanvaar. 'n Mens plak 'n paar honderd; 'n
   miljoen karakters is nie 'n plaksel nie, dit is 'n ongeluk. */
export const MAKS_SKAKELS = 500
const MAKS_TEKS = 200000

/* Maak 'n skakel gelyk sodat twee spellings van dieselfde ding een word: geen
   navraag, 'n skema, kleinletter-gasheer, en 'n skuinsstreep aan die einde.
   Dieselfde gedagte as `stelReeksGelyk()` — 'n verskil in kas of 'n ontbrekende
   `https://` mag nie 'n tweede inskrywing maak nie.

   ── Dit OPGRADEER `http://` na `https://`, met opset ──

   TikTok bedien niks oor http nie, dus is 'n geplakte `http://vt.tiktok.com/…`
   'n mens se kopie van 'n egte skakel en nie 'n poging nie. Om dit te weier sou
   beteken dat een skakel uit 'n plaksel van 124 stilweg wegval.

   Dit is ook nie 'n gaatjie nie: die GASHEER moet steeds tiktok.com wees (die
   patrone hierbo laat niks anders deur nie), en die versoek wat uitgaan, is dan
   https. Die enkel-eindpunt (`reels-skakel.mjs`) is strenger en weier http
   reguit — daar plak 'n mens EEN skakel en 'n duidelike "nee" is beter as 'n
   stille regmaak. */
export function gelykeSkakel(s) {
  let t = String(s == null ? '' : s).trim()
  if (!t) return ''
  t = t.split('?')[0].split('#')[0]
  if (!/^https?:\/\//i.test(t)) t = `https://${t}`
  try {
    const u = new URL(t)
    const pad = u.pathname.replace(/\/+$/, '')
    return `https://${u.hostname.toLowerCase()}${pad}/`
  } catch {
    return ''
  }
}

/* ── Soek elke skakel in 'n plaksel ──
 *
 * Die volgorde bly soos hy geplak is (die eerste voorkoms wen), en duplikate
 * val weg. Dewald stuur hulle in die orde waarin hy hulle gedeel het, en dit is
 * die naaste ding aan "nuutste laaste" wat ons het — `nuutsteEerste()` in
 * reels.js reken juis so.
 */
export function splitsSkakels(teks) {
  const t = String(teks == null ? '' : teks)
  if (!t.trim() || t.length > MAKS_TEKS) return []

  const gevind = []
  for (const patroon of [LANK, KORT_T, KORT]) {
    /* 'n Nuwe regex per lopie: 'n `g`-regex hou `lastIndex` by en 'n hergebruik
       mis die eerste helfte van die tweede string. */
    const p = new RegExp(patroon.source, 'g')
    let m
    while ((m = p.exec(t)) !== null) gevind.push(m[0])
  }

  /* LANK eerste, want 'n volle adres dra die id en die handvatsel al. Maar die
     ORDE moet die plak-orde wees, dus sorteer ons op waar hulle gestaan het. */
  gevind.sort((a, b) => t.indexOf(a) - t.indexOf(b))

  const gesien = new Set()
  const uit = []
  for (const s of gevind) {
    const sleutel = gelykeSkakel(s)
    if (!sleutel || gesien.has(sleutel)) continue
    gesien.add(sleutel)
    uit.push(sleutel)
    if (uit.length >= MAKS_SKAKELS) break
  }
  return uit
}

/* Vir die vorm: wat gaan gebeur as sy nou druk? */
export function keurPlaksel(teks) {
  const skakels = splitsSkakels(teks)
  const rou = String(teks == null ? '' : teks).trim()
  return {
    skakels,
    aantal: skakels.length,
    leeg: !rou,
    /* Sy het iets geplak, maar daar is niks in wat soos 'n TikTok-skakel lyk. */
    niksGevind: !!rou && skakels.length === 0,
    afgekap: skakels.length >= MAKS_SKAKELS,
  }
}
