/* ── WORD DIE VOER WERKLIK GEKYK? ──
 *
 * Dewald, 15 September 2026: *"i want to make sure this page is actually
 * working. so i need you to count how many people click on reels and how many
 * videos each person watched."*
 *
 * Twee vrae, en die tweede is die interessante een.
 *
 * ── Hoekom dit nie PER MENS gestoor word nie ──
 *
 * 'n Lys van driehonderd mense se kyke beantwoord sy vraag nie — hy sou dit
 * nooit lees nie. Wat hy wil weet, is of die blad WERK: maak mense dit oop, en
 * bly hulle? Daardie vraag word presies beantwoord deur 'n VERSPREIDING, en 'n
 * verspreiding is 'n handvol heelgetalle.
 *
 * Dit hou ook die app se eie grens heel — 'n aggregaat mag; enigiets per MENS
 * nooit. Geen naam, geen e-pos, geen toestel-id, geen IP, geen tydstempel per
 * mens. Sien die kop van `api/reels-tel.mjs`.
 *
 * ── Hoekom DREMPELS en nie 'n totaal aan die einde nie ──
 *
 * Die voor-die-hand-liggende ontwerp is om aan die einde van 'n sessie te sê
 * "sy het 7 clips gekyk". Dit werk nie op 'n foon nie: daar is geen betroubare
 * "einde" nie. `beforeunload` vuur nie op iOS wanneer 'n mens die app wegvee
 * nie, en `visibilitychange` vuur ook wanneer sy net 'n oproep antwoord.
 * Daardie ontwerp verloor stil 'n deel van sy tellings, en 'n teller wat stil
 * verloor, is erger as geen teller nie — hy lyk soos 'n feit.
 *
 * Hier word 'n drempel getel op die OOMBLIK dat sy hom oorsteek. Niks hoef aan
 * die einde te gebeur nie; maak sy die app middel-in toe, is alles wat sy wel
 * gekyk het, reeds getel.
 *
 * Die tellers is dus KUMULATIEF — `bereik5` is "hoeveel sessies het minstens
 * vyf clips gekyk". Die verspreiding kom daaruit deur af te trek, en dit is
 * altyd konsekwent: `bereik1` kan nooit kleiner wees as `bereik3` nie, want 'n
 * sessie wat drie gekyk het, het een gekyk.
 *
 * ── 'n SESSIE, nie 'n mens nie ──
 *
 * Een oopmaak van die voer. Dieselfde mens wat drie keer op 'n dag oopmaak, is
 * drie sessies; twee mense op een foon is twee sessies. Dit is die eerlike
 * eenheid en dit is die enigste een wat sonder 'n identiteit bestaan.
 */

/* Waar die drempels lê. Vyf getalle, en hulle is gekies om 'n MENS te wys waar
   dit afval: die meeste voere verloor hul mense tussen 1 en 5. Meer drempels
   gee meer skrywes en nie meer insig nie. */
export const DREMPELS = [1, 3, 5, 10, 25]

/* Die gebeurtenis wat die kliënt stuur wanneer die voer oopgemaak word. */
export const OOP = 'oop'

/* Die kliënt stuur 'n GEBEURTENIS, nooit 'n veldnaam nie — dieselfde reël as
   `api/_volgJesusTelVelde.js`. Wie 'n veldnaam mag kies, mag enige veld op
   daardie dokument skryf, en die eindpunt is oop. */
export const MEET_GEBEURE = [OOP, ...DREMPELS.map(n => `bereik${n}`)]

/* ── Watter drempel hierdie clip-telling oorsteek ──
 *
 * `null` vir elke telling wat NIE presies 'n drempel is nie. Dit is wat maak
 * dat elke drempel presies EEN keer per sessie gestuur word: die telling gaan
 * 1, 2, 3, … en tref elke drempel een keer.
 *
 * Die telling is die aantal clips wat sy in HIERDIE sessie gesien het, en dit
 * kom uit `getelPlekRef` in Reels.jsx — die stel plekke wat reeds getel is.
 */
export function drempelVir(telling) {
  const n = Math.floor(Number(telling))
  if (!Number.isFinite(n)) return null
  return DREMPELS.includes(n) ? `bereik${n}` : null
}

/* Is dit 'n gebeurtenis wat ons ken? 'n WITLYS. */
export function isMeetGebeurtenis(wat) {
  return MEET_GEBEURE.includes(String(wat || ''))
}

/* ── Die verspreiding, vir die admin se skerm ──
 *
 * Kumulatiewe tellers in, leesbare rye uit. Dit is suiwer sodat die woorde wat
 * Dewald sien, getoets kan word — 'n ry wat "-4 mense" sê, is 'n skerm wat
 * niemand weer vertrou nie.
 *
 * Negatiewe getalle word teen nul afgekap. Hulle KAN voorkom: 'n skryf wat
 * misluk het, 'n foon wat 'n ou weergawe loop, 'n drempel wat aankom nadat 'n
 * vroeëre een verlore gegaan het. Die getalle is 'n aanduiding, nie 'n
 * grootboek nie.
 */
function heel(n) {
  const g = Math.floor(Number(n))
  return Number.isFinite(g) && g > 0 ? g : 0
}

export function verspreiding(tellers) {
  const t = tellers && typeof tellers === 'object' ? tellers : {}
  const oop = heel(t.oop)
  const by = n => heel(t[`bereik${n}`])

  const rye = []
  /* Wie oopgemaak het en NIKS gekyk het nie. Dit is die belangrikste ry op die
     hele skerm: 'n groot getal hier beteken die voer laai te stadig of die
     eerste clip speel nie. */
  rye.push({ merk: 'niks', woorde: 'Het oopgemaak, niks gekyk', aantal: Math.max(0, oop - by(1)) })

  for (let i = 0; i < DREMPELS.length; i++) {
    const van = DREMPELS[i]
    const tot = DREMPELS[i + 1]
    const aantal = tot ? Math.max(0, by(van) - by(tot)) : by(van)
    rye.push({
      merk: `d${van}`,
      woorde: tot ? `${van}–${tot - 1} clips` : `${van}+ clips`,
      aantal,
    })
  }
  return rye
}

/* Hoeveel sessies het die voer oopgemaak, en hoeveel het werklik gekyk. */
export function opsomming(tellers) {
  const t = tellers && typeof tellers === 'object' ? tellers : {}
  const oop = heel(t.oop)
  const gekyk = heel(t.bereik1)
  return {
    oop,
    gekyk,
    /* Die persentasie wat werklik begin kyk het. Geen oopmaak, geen
       persentasie — `0/0` is nie 0% nie, dit is "ons weet nie". */
    persent: oop > 0 ? Math.round((gekyk / oop) * 100) : null,
    /* Hoeveel het verby die EERSTE clip gekom? Dit is die getal wat sê of die
       voer sy werk doen: een clip kan nuuskierigheid wees, drie is 'n keuse. */
    bleef: heel(t.bereik3),
  }
}
