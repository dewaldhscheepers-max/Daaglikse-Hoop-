/* ── Die groot gehoorsaamheidsmylpale ──
 *
 * Week 6 vra: wil jy Jesus volg?
 * Week 7 vra: waar staan jy met doop?
 *
 * Suiwer. Die reels wat hier staan is die duurste in die hele program, want
 * hulle raak mense se gewete en hulle privaatheid.
 *
 * ── Vier reels wat nooit gebreek mag word nie ──
 *
 * 1. 'N MYLPAAL IS NIE 'N TRONK NIE.
 *    Punt 1 §12: se iemand by Week 7 "ek is nog nie gedoop nie", word Week 8
 *    NIE toegesluit nie. Die app ken nie sy gewete, sy omstandighede of sy
 *    plaaslike kerk nie. `blokkeerVolgendeWeek()` gee ALTYD false, en daar is
 *    'n toets wat dit oor elke keuse afdwing.
 *
 * 2. DIT VERDWYN NIE.
 *    Dit is nie 'n uitklap wat een keer kom en weg is nie. Mense groei, leer,
 *    en kry hulle vrae beantwoord. Wanneer iemand later gereed is, moet hy
 *    kan terugkom en die volgende tree gee.
 *
 * 3. DIE KERK SIEN NIKS SONDER TOESTEMMING NIE.
 *    'n Mens se antwoord is syne. Die kerk sien eers iets wanneer hy
 *    UITDRUKLIK vra dat hulle hom kontak — sien `magKerkSien()`.
 *
 * 4. GEEN KNOPPIE METE IEMAND SE GEESTELIKE TOESTAND NIE.
 *    Die app mag nooit se "jy het nie die doop-knoppie gekies nie, daarom is
 *    jy nie gered nie". Dit is nie 'n keuseveld se werk om iemand se
 *    verhouding met God te verklaar nie.
 */

export const MYLPALE = {
  /* Week 6 — Mylpaal 1 */
  volg: {
    sleutel: 'volg',
    week: 6,
    titel: 'Wil jy Jesus volg?',
    lyf:
      'Nie "sal jy van nou af alles perfek doen?" nie. Nie "het jy reeds alles verstaan?" nie. ' +
      'Die vraag is: wil jy jou lewe in Jesus se rigting begin en aanhou rig?',
    keuses: [
      { waarde: 'ja',        woorde: 'Ja — ek wil Jesus volg' },
      { waarde: 'reeds',     woorde: 'Ek volg Jesus reeds en wil aanhou groei' },
      { waarde: 'ondersoek', woorde: 'Ek ondersoek nog en wil verder leer' },
      { waarde: 'nieGereed', woorde: 'Ek is nog nie gereed om dit te sê nie' },
    ],
    antwoorde: {
      ja:
        'Dit is die begin, nie die eindpunt nie. Soms gaan jy sterk staan. Soms gaan jy struikel. ' +
        'Soms gaan jy moet terugdraai. Maar jou rigting is: agter Jesus aan.',
      reeds:
        'Dan is die vraag nie of jy begin nie, maar waar Hy jou volgende wil vorm.',
      ondersoek:
        'Jy hoef nie iets te sê wat jy nie werklik bedoel nie. Hou aan kyk. Hou aan lees. Hou aan vra. ' +
        'Jy hoef nie bang te wees vir eerlike vrae nie.',
      nieGereed:
        'Jy hoef nie iets te sê wat jy nie werklik bedoel nie. Die uitnodiging bly oop.',
    },
    /* Wie "ja" se, kan met sy kerk wil praat oor sy volgende tree. Niemand
       anders word gevra nie — 'n mens wat nog ondersoek, moet nie 'n
       telefoonoproep as gevolg van 'n knoppie kry nie. */
    kontakBy: ['ja'],
    kontakVraag: 'Wil jy hê iemand van jou gemeente moet met jou praat oor jou volgende tree?',
  },

  /* Week 7 — Mylpaal 2 */
  doop: {
    sleutel: 'doop',
    week: 7,
    titel: 'Waar staan jy met doop?',
    lyf:
      'Geen antwoord sluit jou uit om verder te leer nie. Geen knoppie meet jou geestelike waarde nie. ' +
      'Die doel is eenvoudig: weet waar jy staan en wat jou volgende tree is.',
    keuses: [
      { waarde: 'reeds',     woorde: 'Ek is reeds gedoop' },
      { waarde: 'wil',       woorde: 'Ek wil gedoop word' },
      { waarde: 'vrae',      woorde: 'Ek het vrae oor doop' },
      { waarde: 'nieGereed', woorde: 'Ek is nog nie gereed nie' },
    ],
    antwoorde: {
      reeds:
        'Onthou aan Wie jy behoort. Die groter vraag is: leef ek vandag as iemand wat Jesus volg en wil gehoorsaam?',
      wil:
        'Dit is ’n belangrike volgende tree. Die app doen nie die doop nie — die plaaslike geloofsgemeenskap stap hierdie tree saam met jou.',
      vrae:
        'Dit is reg om vrae te hê. Hierdie vrae verdien meer as ’n vinnige antwoord net sodat jy die week kan klaarmaak. ' +
        'Gaan terug na die Skrif en praat met ’n betroubare plaaslike pastor of geestelike leier.',
      nieGereed:
        'Jy hoef nie ’n geloofstap voor te gee wat jy nie werklik bedoel nie. Wanneer jy gereed is, moenie hierdie vraag eenvoudig ignoreer nie.',
    },
    kontakBy: ['wil', 'vrae'],
    kontakVraag: 'Wil jy hê ’n verantwoordelike persoon by jou gemeente moet jou hieroor kontak?',
  },
}

export function mylpaalVir(weeknommer) {
  return Object.values(MYLPALE).find(m => m.week === Number(weeknommer)) || null
}

/* ── Reel 1 ──
 *
 * Dit gee ALTYD false. Die funksie bestaan sodat dit 'n naam het en 'n toets
 * kan he: die volgende keer wat iemand dink dit is 'n goeie idee om Week 8
 * toe te sluit tot die doop-vraag beantwoord is, staan die antwoord hier. */
export function blokkeerVolgendeWeek() {
  return false
}

/* Mag die keuse 'n kontakversoek aanbied? */
export function biedKontak(mylpaal, waarde) {
  if (!mylpaal || !waarde) return false
  return (mylpaal.kontakBy || []).includes(waarde)
}

/* ── Reel 3 ──
 *
 * Wat die KERK mag sien. Dit is die belangrikste funksie in hierdie leer.
 *
 * `staat` is wat op die toestel gestoor is:
 *   { waarde, toestemming: true|false }
 *
 * Sonder `toestemming === true` gee dit null — en null beteken die kerk kry
 * NIKS. Nie die keuse nie, nie 'n telling nie, niks. */
export function magKerkSien(mylpaal, staat) {
  if (!mylpaal || !staat) return null
  if (staat.toestemming !== true) return null
  if (!biedKontak(mylpaal, staat.waarde)) return null
  return {
    mylpaal: mylpaal.sleutel,
    waarde:  staat.waarde,
    versoek: mylpaal.sleutel === 'doop' ? 'Doopgesprek versoek' : 'Wil oor sy volgende tree praat',
  }
}

/* Die woorde wat 'n mens sien nadat hy gekies het. */
export function antwoordVir(mylpaal, waarde) {
  if (!mylpaal) return ''
  return (mylpaal.antwoorde || {})[waarde] || ''
}
