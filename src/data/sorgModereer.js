/* ────────────────────────────────────────────────────────────
   Rapporteer, blokkeer, en wat 'n mens daarna doen.

   Dewald se punte 9 en 10. Drie besluite dra hierdie hele lêer:

   ── 1. EEN rapport verwyder NIKS ──

   Dit was nie so nie. 'n Enkele druk het 'n opmerking DADELIK van die muur
   afgehaal en in Dewald se hopie gesit. Die redenasie was dat 'n woord wat
   verkeerdelik weg is, teruggesit kan word, en 'n woord wat iemand seermaak
   nie moet staan en wag nie.

   Dit is 'n regverdige ruil op 'n klein muur. Op 'n groot een is dit 'n
   knoppie waarmee enige mens enige ander mens se woorde kan laat verdwyn —
   en op 'n blad waar mense oor hul huwelike en hul kinders skryf, is dit
   presies die soort mag wat iemand gaan misbruik teen die mens wat hy wil
   stilmaak.

   Dewald: "Een report moet nie gewone veilige inhoud outomaties permanent
   verwyder nie. Ernstige outomatiese veiligheidsmerke mag inhoud tydelik
   versteek totdat dit nagegaan is."

   Dus: 'n rapport TEL. By 'n DREMPEL word dit tydelik versteek. Wat
   outomaties as onveilig gemerk is, word dadelik versteek — dit is nie 'n
   mens se stem teen 'n ander nie, dit is 'n patroon.

   ── 2. Blokkeer is PLAASLIK ──

   Wie iemand blokkeer, sien hom nie meer nie. Dit skryf niks na 'n bediener
   nie, en dit is met opset: 'n opvraagbare lys van "wie blokkeer wie" op 'n
   anonieme muur is presies die soort rekord wat hierdie blad nie mag hê nie.
   Dit beskerm die mens wat blokkeer, en dit gee niemand mag oor iemand
   anders se sigbaarheid nie.

   ── 3. Elke aksie dra 'n REDE en 'n DATUM ──

   "Versteek" op sy eie is geen rekord nie. Ses maande later moet 'n mens kan
   sien waarom iets weg is, anders word elke ou besluit weer 'n raaiskoot.
   ──────────────────────────────────────────────────────────── */

/* ── Waarom iemand rapporteer ──

   Kort, en in gewone Afrikaans. 'n Lys van tien juridiese kategorieë beteken
   niemand kies een nie, en dan is die rapport net "iets is fout" — wat die
   admin niks sê nie.

   "Iets anders" bly laaste, want dit is die een wat alles vang wat ons nie
   voorsien het nie. */
export const REDES = [
  { sleutel: 'onvriendelik', naam: 'Onvriendelik of veroordelend' },
  { sleutel: 'gevaarlik',    naam: 'Dit klink of iemand in gevaar is' },
  { sleutel: 'raad',         naam: 'Verkeerde raad (medisyne, geld, geloof)' },
  { sleutel: 'privaat',      naam: 'Dit deel iemand se private besonderhede' },
  { sleutel: 'spam',         naam: 'Advertensie of spam' },
  { sleutel: 'anders',       naam: 'Iets anders' },
]

export function keurRede(s) {
  const k = String(s || '').trim()
  return REDES.some(r => r.sleutel === k) ? k : ''
}

export function redeNaam(sleutel) {
  const r = REDES.find(x => x.sleutel === sleutel)
  return r ? r.naam : ''
}

/* ── Wanneer 'n rapport iets versteek ──

   DRIE, nie een nie. Een mens se druk is 'n mening; drie verskillende
   toestelle is 'n patroon.

   Dit is met opset laag genoeg dat iets werklik sleg binne 'n uur weg is, en
   hoog genoeg dat een kwaad mens niks kan doen nie. */
export const DREMPEL = 3

/* Watter rapport-redes ONMIDDELLIK versteek, ongeag die telling.

   "Dit klink of iemand in gevaar is" is nie moderering nie — dit is 'n mens
   wat sê daar is iemand in nood. Dit versteek NIKS; dit maak die ding
   dringend sodat Dewald dit nou sien. Dit is die belangrikste onderskeid in
   hierdie hele lêer, en dieselfde een as in sorgVeilig.js: nood is nie
   oortreding nie. */
export const DRINGEND = ['gevaarlik']

/* ── Die besluit oor een ding wat gerapporteer is ──
 *
 * Suiwer: 'n telling en 'n stel redes in, 'n toestand uit.
 *
 * `outoOnveilig` is die outomatiese merk uit sorgVeilig.js. DIT versteek wel
 * dadelik — dit is 'n patroon in die teks self, nie een mens se stem teen 'n
 * ander nie.
 */
export function naRapport({ rapporte = 0, redes = [], outoOnveilig = false } = {}) {
  const lys = (redes || []).map(keurRede).filter(Boolean)
  const dringend = lys.some(r => DRINGEND.includes(r))
  const tel = Number(rapporte) || 0

  return {
    /* Wys dit nog op die muur? */
    wys: !outoOnveilig && tel < DREMPEL,
    /* Staan dit bo in die admin? */
    dringend: dringend || outoOnveilig || tel >= DREMPEL,
    rapporte: tel,
    redes: [...new Set(lys)],
    /* Hoekom dit weg is, as dit weg is. Die admin moet dit kan lees sonder
       om te raai. */
    rede: outoOnveilig ? 'outomaties gemerk'
      : (tel >= DREMPEL ? `${tel} mense het dit gerapporteer` : ''),
  }
}

/* ── Wat 'n mens in die admin kan doen ──

   Ses aksies, en elkeen is omkeerbaar behalwe die laaste. Dewald: "Admin moet
   kan: Behou · Versteek · Verwyder · Herstel · As spam merk · 'n Gebruiker
   waarsku · 'n Gebruiker blokkeer." */
export const AKSIES = [
  { sleutel: 'behou',    naam: 'Behou',        fyn: 'Niks fout nie — sit die rapporte terug op nul' },
  { sleutel: 'versteek', naam: 'Versteek',     fyn: 'Van die muur af, maar dit bly bestaan' },
  { sleutel: 'herstel',  naam: 'Herstel',      fyn: 'Sit dit terug op die muur' },
  { sleutel: 'spam',     naam: 'Merk as spam', fyn: 'Weg, en die toestel word gemerk' },
  { sleutel: 'waarsku',  naam: 'Waarsku',      fyn: 'Die mens sien ’n nota wanneer hy weer skryf' },
  { sleutel: 'blokkeer', naam: 'Blokkeer',     fyn: 'Hierdie toestel kan nie meer skryf nie' },
  { sleutel: 'verwyder', naam: 'Verwyder',     fyn: 'Permanent weg' },
]

export function keurAksie(s) {
  const k = String(s || '').trim()
  return AKSIES.some(a => a.sleutel === k) ? k : ''
}

/* Wat 'n aksie aan 'n dokument doen. Suiwer, sodat die bediener niks hoef te
   besluit nie — en sodat elke aksie 'n rede en 'n datum dra. */
export function pasAksieToe(aksie, { rede = '', wanneer = '' } = {}) {
  const a = keurAksie(aksie)
  if (!a) return null
  const merk = {
    modAksie: a,
    /* 'n Aksie sonder 'n rede is oor ses maande 'n raaiskoot. */
    modRede: String(rede || '').slice(0, 200),
    modDatum: String(wanneer || ''),
  }
  switch (a) {
    case 'behou':    return { ...merk, status: 'wys', rapporte: 0, redes: [], versteek: false }
    case 'versteek': return { ...merk, status: 'weg', versteek: true }
    case 'herstel':  return { ...merk, status: 'wys', rapporte: 0, redes: [], versteek: false }
    case 'spam':     return { ...merk, status: 'spam', versteek: true }
    case 'waarsku':  return { ...merk, gewaarsku: true }
    case 'blokkeer': return { ...merk, status: 'weg', versteek: true, geblokkeer: true }
    case 'verwyder': return { ...merk, status: 'verwyder', versteek: true }
    default:         return null
  }
}

/* ══════════════════════════════════════════════════════════════
   Blokkeer — PLAASLIK, op die foon
   ══════════════════════════════════════════════════════════════ */

export const BLOK_SLEUTEL = 'sorg_geblok'

/* Wie geblokkeer is, is 'n lys van skrywer-merke — sien `blokMerk()`
   hieronder. Dit is 'n VERTOONNAAM, nie 'n toestel-id nie, en dus kan net
   iemand wat sy naam gekies het, geblokkeer word. */
export function leesBlok(rou) {
  let x
  try { x = JSON.parse(rou || '[]') } catch { return [] }
  if (!Array.isArray(x)) return []
  return [...new Set(x.filter(s => typeof s === 'string' && s.trim()))].slice(0, 500)
}

export function blokBy(lys, merk) {
  const m = String(merk || '').trim()
  if (!m || lys.includes(m)) return lys
  return [...lys, m].slice(-500)
}

export function blokWeg(lys, merk) {
  const m = String(merk || '').trim()
  return lys.filter(x => x !== m)
}

/* ── Wie KAN geblokkeer word ──
 *
 * Net iemand wat sy naam gekies het.
 *
 * Dit klink na 'n beperking en dit is 'n beskerming. Om 'n ANONIEME mens te
 * kan blokkeer, sou beteken die skerm moet 'n stabiele merk vir hom kry — en
 * daardie merk laat enigiemand sien watter "Anoniem"-plasings van dieselfde
 * mens af kom, oor onderwerpe heen. Op 'n muur waar mense oor hul huwelike en
 * hul selfmoordgedagtes skryf, is dit presies die lek wat die anonimiteit
 * waardeloos maak.
 *
 * Vir 'n anonieme mens is die gereedskap RAPPORTEER, wat niks oor hom
 * verklap nie. Vir 'n mens met 'n naam is dit blokkeer — en dit is in elk
 * geval die geval wat saak maak, want herhaalde teistering kom van iemand met
 * 'n stem, nie van 'n string anonieme drukke nie.
 */
export function blokMerk(item) {
  const i = item || {}
  if (i.anoniem === true) return ''
  const naam = String(i.naam || '').trim()
  return naam ? 'naam:' + naam.toLowerCase() : ''
}

export function kanBlok(item) {
  return !!blokMerk(item)
}

/* ── Wat 'n geblokte mens se goed doen ──
 *
 * Dit VERDWYN vir die mens wat geblokkeer het, en vir niemand anders nie.
 *
 * Dit werk op enige lys met 'n `skrywer`-merk: plasings sowel as opmerkings.
 * Wat GEEN merk dra nie — 'n ou rekord, 'n gesaaide woord — bly staan. 'n
 * Filter wat op 'n ontbrekende veld tref, sou die hele muur laat verdwyn
 * sodra iemand een mens blokkeer.
 */
export function sonderGeblok(items, blok) {
  const stel = new Set(blok || [])
  if (!stel.size) return items || []
  return (items || []).filter(x => {
    const m = blokMerk(x)
    return !m || !stel.has(m)
  })
}
