/* Die VOLG JESUS-tellers, oor 'n paar dokumente versprei.
 *
 * ── Waarom ──
 *
 * Alles het op EEN dokument gestaan: `tellers/volgJesus`. Firestore hou sowat
 * EEN skryf per sekonde op een dokument vol. Bo daardie tempo begin skrywes
 * teen mekaar stamp: sommige misluk met 'n konflik, en die getal wat oorbly is
 * te laag.
 *
 * Met 'n paar honderd mense is dit onsigbaar. Die 06:30-kennisgewing gaan
 * egter na duisende fone tegelyk, en 'n groot deel maak binne minute oop. By
 * 10 000 mense is dit maklik vyf tot twintig skrywes per sekonde op daardie
 * een dokument.
 *
 * Die mens sien niks daarvan nie — hy tel homself en loop verder. Wat breek,
 * is die getalle in die admin en die getal op die e-boekblad, en dit is juis
 * op die dag van 'n groot uitnodiging dat 'n mens hulle wil vertrou.
 *
 * ── Hoe ──
 *
 * Die skryf land op 'n TOEVALLIGE skerf. Tien skerwe deel die las deur tien.
 * Lees tel almal op. 'n Leser doen tien dokument-lesings in plaas van een, en
 * die admin lees dit 'n paar keer per dag — dit is niks.
 *
 * ── Waarom skerf 0 die OU dokument is ──
 *
 * `tellers/volgJesus` bly presies waar hy is en dra sy bestaande getalle. Daar
 * is dus geen trek nie: niks gaan verlore nie, en 'n ou weergawe van die app
 * wat nog net na daardie een dokument skryf, tel steeds korrek saam.
 *
 * Suiwer, sodat plain node dit kan toets sonder om aan Firestore te raak.
 */

/* Tien. By 10 000 mense wat oor 'n halfuur oopmaak is dit sowat 0,5 skrywes
   per sekonde per skerf — ver onder die grens, met plek vir 'n dag wat tien
   keer groter is as wat ons verwag. */
const SKERWE = 10

const BASIS = 'tellers/volgJesus'

/* Skerf 0 IS die ou dokument. Sien hierbo. */
function skerfPad(i) {
  const n = Number(i)
  if (!Number.isInteger(n) || n <= 0) return BASIS
  return `${BASIS}_s${Math.min(n, SKERWE - 1)}`
}

function alleSkerfPaaie() {
  const uit = []
  for (let i = 0; i < SKERWE; i++) uit.push(skerfPad(i))
  return uit
}

/* `r` is 'n getal in [0, 1) — Math.random() se antwoord. Dit kom van BUITE af
   sodat hierdie leer suiwer bly en 'n toets elke skerf kan tref. Rommel land
   op skerf 0; dit tel steeds reg, dit deel net niks. */
function kiesSkerf(r) {
  const g = Number(r)
  if (!Number.isFinite(g) || g < 0 || g >= 1) return 0
  return Math.floor(g * SKERWE)
}

/* Tel die skerwe op.
 *
 * `dokke` is wat Firestore teruggee: 'n lys van voorwerpe met `fields`, waar
 * elke veld soos `{ integerValue: '42' }` lyk. 'n Skerf wat nog nooit geskryf
 * is nie, bestaan nie — dan is daar niks, en niks is nul.
 *
 * Alles wat nie 'n heelgetal is nie, word oorgeslaan. 'n Veld wat op een skerf
 * 'n string is (iemand het met die hand geredigeer) mag nie die hele som
 * `NaN` maak nie — dan wys die admin 'n leë blok in plaas van 'n getal. */
function telOp(dokke) {
  const uit = {}
  for (const d of Array.isArray(dokke) ? dokke : []) {
    const velde = (d && d.fields) || {}
    for (const [naam, waarde] of Object.entries(velde)) {
      const n = Number(waarde && waarde.integerValue)
      if (!Number.isFinite(n)) continue
      uit[naam] = (uit[naam] || 0) + n
    }
  }
  return uit
}

/* Een veld oor al die skerwe — vir die e-boekblad se `doen`. */
function telVeld(dokke, naam) {
  const n = telOp(dokke)[naam]
  return Number.isInteger(n) && n >= 0 ? n : 0
}

module.exports = { SKERWE, BASIS, skerfPad, alleSkerfPaaie, kiesSkerf, telOp, telVeld }
