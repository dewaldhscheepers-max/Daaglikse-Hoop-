/* ── "GLY JOU VINGER BOONTOE" ──
 *
 * Dewald, 16 September 2026: *"Wys op die eerste Reel vir die gebruiker hierdie
 * boodskap: Gly jou vinger boontoe om die volgende video te sien. wys hulle
 * hoe."*
 *
 * Dit is die een ding wat 'n voer aanvaar as vanselfsprekend en wat dit nie is.
 * Wie TikTok gebruik, weet dit sonder om te dink; die mens vir wie hierdie app
 * gebou is, het dalk nog nooit 'n vertikale voer gesien nie. Sy sien EEN video,
 * dit loop klaar, dit begin weer — en sy gaan weg, want sy dink dis al.
 *
 * ── Dit moet VERDWYN, en dit moet nie terugkom nie ──
 *
 * 'n Wenk wat bly staan, is 'n merk op elke video. Twee dinge sorg daarvoor:
 *
 *   · hy wys NET op die eerste clip. Swiep sy, is sy by clip twee en is hy weg;
 *   · en hy kom NOOIT weer nie. Sodra sy een keer geswiep het, weet sy hoe, en
 *     `reels_geswiep` onthou dit vir altyd.
 *
 * Die tweede is nie oorbodig nie, en dit was 'n egte fout: met net die eerste
 * reël kom die wenk TERUG sodra sy weer boontoe rol na clip een — 'n
 * beginnerswenk aan iemand wat pas gewys het sy weet hoe. `geswiep` moet dus
 * ook BINNE 'n sessie skuif, nie net tussen oopmaak en oopmaak nie.
 *
 * ── Wie hom NOOIT sien nie ──
 *
 * Iemand wat die voer al gebruik het. Sit `reels_gesien` reeds vol clips, is sy
 * 'n gewone kyker en 'n beginnerswenk is 'n belediging. Dit is dieselfde toets
 * as `nuut` in `reels.js` — sy het nog NIKS gesien nie.
 *
 * Dit is die belangrike helfte: sonder dit sou elke bestaande kyker môre 'n
 * wenk kry oor iets wat sy 'n week laas gedoen het.
 *
 * ── Nooit twee wenke tegelyk nie ──
 *
 * "Tik vir klank" staan in die middel van dieselfde skerm. Twee boodskappe oor
 * een video is nie 'n wenk nie, dit is gemors. Die klank-wenk gaan self ná 'n
 * paar sekondes weg, en dan kom hierdie een.
 */

/* Sy het al geswiep. Een keer is genoeg — 'n mens leer dit nie twee keer nie. */
export const GESWIEP = 'reels_geswiep'

/* Dewald se woorde, presies soos hy hulle gestuur het. */
export const SWIEP_WOORDE = 'Gly jou vinger boontoe om die volgende video te sien.'

/* Mag die swiep-wenk NOU wys?
 *
 *   gesienNiks  — sy het nog geen enkele clip gekyk nie (die `nuut`-toets)
 *   geswiep     — het sy al ooit in hierdie voer geswiep?
 *   aktief      — op watter plek in die voer staan sy
 *   anderWenk   — staan daar reeds 'n wenk op die skerm?
 */
export function magWysSwiep(f) {
  const d = f || {}
  if (d.geswiep) return false        /* sy weet klaar hoe */
  if (!d.gesienNiks) return false    /* 'n gewone kyker het dit nie nodig nie */
  if (d.anderWenk) return false      /* nooit twee boodskappe oor een video nie */
  return Number(d.aktief || 0) === 0 /* net op die EERSTE clip */
}
