/* ────────────────────────────────────────────────────────────
   Wie praat hier?

   Sorg was tot nou HEELTEMAL anoniem — elke storie en elke opmerking het as
   "Anoniem" verskyn, en die woorde "Gebruik my voornaam" is doelbewus van
   die vorm af weggevat.

   Dewald, 23 Augustus 2026, het dit omgedraai:

     "Wanneer iemand 'n storie plaas, moet hulle duidelik kies: Gebruik my
      naam en foto · Plaas anoniem."
     "Wanneer iemand die eerste keer antwoord, laat hulle 'n eenvoudige
      profiel opstel."

   Dit is die regte draai. 'n Muur waar ELKE stem "Anoniem" heet, is nie 'n
   gemeenskap nie — dit is 'n klagteboek. 'n Mens keer terug na 'n plek waar
   hy weet wie met hom gepraat het.

   Maar die anonimiteit mag nie verdwyn nie, want dit is die enigste rede
   waarom party mense ooit skryf. Vandaar die vorm van hierdie leer:

     · die keuse is PER PLASING, nie per mens nie. Dieselfde vrou kan haar
       naam by 'n gebed sit en anoniem oor haar huwelik skryf;
     · "anoniem" beteken die naam gaan NIE oor die draad nie. Dit is nie
       "die skerm wys dit nie" — die bediener bou 'n nuwe voorwerp en die
       naam is eenvoudig nie daarin nie;
     · die profiel self is 'n VERTOONNAAM en 'n foto. Geen e-pos, geen
       nommer, geen van, niks wat 'n mens buite hierdie app kan opspoor nie.

   ── Die beskermde naam ──

   Dewald se antwoord dra gewig. 'n Mens in 'n donker plek wat lees "Dewald
   Scheepers sê jy moet ophou kla", en dit was 'n vreemdeling met 'n
   vertoonnaam — dit is die ergste ding wat op hierdie blad kan gebeur.

   Die naam word dus GEWEIER, en nie net die presiese string nie: aksente,
   spasies, punte, nulle vir o's, en die van op sy eie. Die verifikasie-merk
   kom NOOIT uit 'n naam nie — hy kom uit die rekening se rol op die
   bediener. 'n Naam is 'n string; 'n rol is 'n hek.
   ──────────────────────────────────────────────────────────── */

export const MAKS_NAAM = 24
export const MIN_NAAM = 2

/* ── Plat slaan ──
   Aksente weg, dubbele letters se spasies weg, alles klein. Dieselfde idee
   as `plat()` in sorg.js, maar hier vou ons ook syfers wat soos letters lyk
   in — "Dewa1d Sch33pers" moet dieselfde ding wees. */
export function plat(s) {
  return String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/0/g, 'o').replace(/1/g, 'l').replace(/3/g, 'e')
    .replace(/5/g, 's').replace(/4/g, 'a').replace(/7/g, 't')
    .replace(/[^a-z]/g, '')
}

/* Die name wat niemand mag vat nie.

   Die van op sy eie tel ook: "Scheepers" onder 'n pastorale antwoord lees
   soos hy. En die bediening self — "Daaglikse Hoop" is die geverifieerde
   stem op die muur. */
export const BESKERM = [
  'dewald', 'dewaldscheepers', 'scheepers', 'dewalds', 'nadiascheepers', 'nadias',
  'daaglikshoop', 'daaglikschoop', 'daaglikseehoop', 'daagliksehoop',
  'pastoordewald', 'psdewald', 'dsdewald',
  'admin', 'moderator', 'bediening',
]

/* ── Die twee name wat MET 'n kode gebruik mag word ──
 *
 * Dewald: "As ek Dewald Scheepers intik moet dit vra vir kode. net met my
 * naam... en gee haar verified merk ook."
 *
 * Dit is 'n ANDER ding as die res van die beskermde lys. "admin",
 * "moderator" en 'n kaal "Dewald" mag niemand ooit vat nie. Hierdie twee is
 * regte mense wat hul eie naam moet kan gebruik, en die kode is die bewys.
 *
 * Dit is PRESIES die volle naam. "Dewald" alleen, "Scheepers" alleen en
 * "Dewald Scheepers Bediening" bly geweier — daardie name is naboots, en 'n
 * kode maak hulle nie reg nie.
 */
export const KODE_NAME = ['dewaldscheepers', 'nadiascheepers']

export function vraKode(naam) {
  return KODE_NAME.includes(plat(naam))
}

export function isBeskerm(naam) {
  const p = plat(naam)
  if (!p) return false
  /* 'n Naam wat 'n KODE kan oopsluit, is nie hier geblokkeer nie — daardie
     hek staan op die bediener, waar die kode vergelyk word. */
  if (KODE_NAME.includes(p)) return false
  /* `includes`, nie `===` nie. "Dewald Scheepers Bediening" en
     "die egte dewald" moet albei val — 'n naam wat sy naam BEVAT, word
     gelees as hy. */
  return BESKERM.some(b => p.includes(b))
}

/* ── Keur 'n vertoonnaam ──

   Gee `{ naam, fout }`. `naam` is die skoongemaakte weergawe wat gestoor
   word; `fout` is 'n sin vir die mens, of ''. */
export function keurNaam(rou) {
  const skoon = String(rou || '')
    /* Uitgeskryf as \u-ontsnappings. `[ -<>&"]` lyk soos vier karakters
       en is 'n REEKS van spasie (0x20) tot '<' (0x3C) — dit verwerp syfers
       en spasies. Sien CLAUDE.md. */
    .replace(/[\u0000-\u001f\u007f\u200b-\u200f\u2028\u2029\u202a-\u202e\ufeff]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAKS_NAAM)

  if (!skoon) return { naam: '', fout: 'Skryf asseblief ’n naam.' }
  if (skoon.length < MIN_NAAM) return { naam: '', fout: 'Die naam is te kort.' }
  /* Geen skakels, geen adresse. 'n Vertoonnaam is nie 'n plek om iets te
     adverteer nie, en 'n naam wat soos 'n URL lyk, is altyd advertensie. */
  if (/https?:|www\.|\.(com|co\.za|net|org)\b|@/i.test(skoon)) {
    return { naam: '', fout: 'Los asseblief skakels en adresse uit ’n naam.' }
  }
  if (/\d{5,}/.test(skoon)) {
    return { naam: '', fout: 'Los asseblief nommers uit ’n naam.' }
  }
  if (vraKode(skoon)) {
    /* Die naam is geldig, MAAR daar moet 'n kode by. Die kode word NOOIT hier
       vergelyk nie — hierdie lêer ship in 'n openbare JavaScript-lêer wat
       enigiemand kan oopmaak. Sien CLAUDE.md: daar is geen geheim in die app
       se kode nie. Die vergelyking staan op die bediener. */
    return { naam: skoon, fout: '', vraKode: true }
  }
  if (isBeskerm(skoon)) {
    return {
      naam: '',
      fout: 'Daardie naam is gereserveer. Kies asseblief ’n ander een.',
    }
  }
  return { naam: skoon, fout: '', vraKode: false }
}

/* ── Die voorletters ──

   Wat in die kring staan wanneer daar geen foto is nie. Hoogstens twee —
   drie letters in 'n kring van 32px is 'n vlek, nie 'n merkie nie. */
export function voorletters(naam) {
  const dele = String(naam || '').trim().split(/\s+/).filter(Boolean)
  if (!dele.length) return ''
  if (dele.length === 1) return dele[0][0].toUpperCase()
  return (dele[0][0] + dele[dele.length - 1][0]).toUpperCase()
}

/* ── Wat 'n plasing se skrywer op die SKERM wys ──

   Dit is 'n WITLYS, nie 'n swartlys nie: daar word 'n nuwe voorwerp gebou.
   Voeg iemand more 'n veld by die profiel, kom dit eers uit wanneer dit hier
   bygesit word. Dieselfde reël as VOLG JESUS se openbare eindpunt, en om
   dieselfde rede — 'n vergete veld is hoe 'n anonieme mens per ongeluk 'n
   naam kry.

   `anoniem` wen ALTYD. Kom daar 'n naam saam met `anoniem: true` deur — 'n
   ou rekord, 'n fout, 'n gereedskapstuk — val die naam uit. */
export function wieWys(bron) {
  const b = bron || {}
  if (b.anoniem !== false) {
    return { naam: 'Anoniem', foto: '', letters: '', anoniem: true, geverifieer: false }
  }
  const naam = String(b.naam || '').trim().slice(0, MAKS_NAAM)
  if (!naam) {
    return { naam: 'Anoniem', foto: '', letters: '', anoniem: true, geverifieer: false }
  }
  const foto = String(b.foto || '').trim()
  return {
    naam,
    /* Net http en https, nooit iets anders nie. Hierdie adres word 'n
       `<img src>` op 'n openbare bladsy. */
    foto: /^https?:\/\//i.test(foto) ? foto : '',
    letters: voorletters(naam),
    anoniem: false,
    /* DIE reël: die merk kom uit die BEDIENER se rol, nooit uit die naam
       nie. 'n Naam is 'n string wat enigiemand kan tik; 'n rol is 'n hek. */
    geverifieer: b.rol === 'dewald' || b.rol === 'bediening',
  }
}

/* ── Die profiel wat op die foon le ──

   Vertoonnaam en foto, meer nie. Dit word by elke antwoord saamgestuur sodat
   'n mens dit nie elke keer weer tik nie. */
export const PROFIEL_SLEUTEL = 'sorg_profiel'

export function leesProfiel(rou) {
  let x
  try { x = JSON.parse(rou || 'null') } catch { return null }
  if (!x || typeof x !== 'object') return null
  const { naam } = keurNaam(x.naam)
  if (!naam) return null
  const foto = String(x.foto || '')
  return {
    naam,
    /* 'n data:-URI is reg — die foto word op die foon gekrop en as 'n
       data-URI gestoor. 'n http-adres is ook reg. Enigiets anders nie. */
    foto: /^data:image\/(jpeg|png|webp);base64,/.test(foto) || /^https?:\/\//i.test(foto)
      ? foto : '',
    /* Die kode vir 'n beskermde naam, sodat 'n mens dit nie by elke opmerking
       weer hoef te tik nie. Dit is nie 'n geheim wat hier beskerm word nie —
       dit le op sy EIE foon, en die vergelyking staan op die bediener. */
    kode: String(x.kode || '').slice(0, 12),
  }
}

/* ── Die foto ──

   Hoeveel pixels 'n profielfoto mag wees. Dit word op die FOON gekrop en
   verklein voor dit ooit oor die draad gaan: 'n foto uit 'n moderne kamera
   is agt megagreep, en 'n muur met dertig sulke foto's laai nooit klaar op
   'n Suid-Afrikaanse lyn nie.

   256 is ruim: die kring is 32px, en op 'n foon met drie keer die digtheid
   is dit 96. */
export const FOTO_PX = 256
export const FOTO_KWALITEIT = 0.82

/* Die vierkant uit die middel van 'n prent — die krop wat 'n ronde kring
   nodig het. Suiwer: breedte en hoogte in, 'n reghoek uit. */
export function middelKrop(w, h) {
  const kant = Math.min(w, h)
  return {
    x: Math.round((w - kant) / 2),
    y: Math.round((h - kant) / 2),
    kant: Math.round(kant),
  }
}
