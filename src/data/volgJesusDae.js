/* ── Watter weke 'n DAG-PAD het ──
 *
 * Week 1 se vorm — een blad per dag, 'n paar blokke, een knoppie onderaan — was
 * vir week 1 alleen gebou. In VolgJesusLewe het letterlik gestaan:
 *
 *     week 1 → die nuwe skerm, alles anders → die ou skerm
 *
 * Die ou skerm is die een wat soos huiswerk gevoel het: lees → klik → lees →
 * klik. Week 2 sou dus heeltemal anders gelyk het as Week 1, en niemand sou
 * verstaan hoekom nie.
 *
 * Hierdie leer is die register. 'n Week kom hier by en kry dieselfde pad. Dit
 * is die enigste plek wat verander wanneer Week 3 kom.
 *
 * ── Waarom die inhoud in KODE staan en nie in die admin nie ──
 *
 * 'n Dag is nie 'n paar velde nie — dit is 'n RY BLOKKE met soorte: lees, stem,
 * teks, groot, vraag, kies, gebed, terugblik, wallpaper, groepbrug. 'n Admin
 * wat dit kan bou, is 'n bladsybouer, en 'n bladsybouer is 'n projek op sy eie.
 *
 * Wat die admin WEL doen, is die dinge wat per week verander en wat 'n mens
 * self moet kan oplaai: die stemboodskap, die twee wallpapers, en die week se
 * plat velde vir die publiseer-hek.
 */
import {
  WEEK1_DAE, WEEK1_REIS, WEEK1_OPENING, WEEK1_DEELSIN, WEEK1_VOLGENDE,
  WEEK1_TRANSKRIPSIE, WEEK1_SESSIE,
} from './volgJesusWeek1.js'
import {
  WEEK2_DAE, WEEK2_REIS, WEEK2_OPENING, WEEK2_DEELSIN, WEEK2_VOLGENDE,
  WEEK2_TRANSKRIPSIE, WEEK2_SESSIE,
} from './volgJesusWeek2.js'
import {
  WEEK3_DAE, WEEK3_REIS, WEEK3_OPENING, WEEK3_DEELSIN, WEEK3_VOLGENDE,
  WEEK3_TRANSKRIPSIE, WEEK3_SESSIE,
} from './volgJesusWeek3.js'
import {
  WEEK4_DAE, WEEK4_REIS, WEEK4_OPENING, WEEK4_DEELSIN, WEEK4_VOLGENDE,
  WEEK4_TRANSKRIPSIE, WEEK4_SESSIE, WEEK4_KLAAR,
} from './volgJesusWeek4.js'

const WEKE = {
  1: {
    dae: WEEK1_DAE,
    reis: WEEK1_REIS,
    opening: WEEK1_OPENING,
    deelsin: WEEK1_DEELSIN,
    volgende: WEEK1_VOLGENDE,
    transkripsie: WEEK1_TRANSKRIPSIE,
    sessie: WEEK1_SESSIE,
  },
  2: {
    dae: WEEK2_DAE,
    reis: WEEK2_REIS,
    opening: WEEK2_OPENING,
    deelsin: WEEK2_DEELSIN,
    volgende: WEEK2_VOLGENDE,
    transkripsie: WEEK2_TRANSKRIPSIE,
    sessie: WEEK2_SESSIE,
  },
  3: {
    dae: WEEK3_DAE,
    reis: WEEK3_REIS,
    opening: WEEK3_OPENING,
    deelsin: WEEK3_DEELSIN,
    volgende: WEEK3_VOLGENDE,
    transkripsie: WEEK3_TRANSKRIPSIE,
    sessie: WEEK3_SESSIE,
  },
  4: {
    dae: WEEK4_DAE,
    reis: WEEK4_REIS,
    opening: WEEK4_OPENING,
    deelsin: WEEK4_DEELSIN,
    volgende: WEEK4_VOLGENDE,
    transkripsie: WEEK4_TRANSKRIPSIE,
    sessie: WEEK4_SESSIE,
    klaar: WEEK4_KLAAR,
  },
}

/* Het hierdie week 'n dag-pad? VolgJesusLewe vra dit voordat dit kies watter
   skerm om te wys. */
export function hetDae(w) {
  return !!WEKE[Number(w)]
}

/* Alles vir een week. Gee 'n LEË week terug vir 'n nommer wat ons nie ken nie —
   die skerm wys dan niks eerder as om om te val. */
const LEEG = {
  dae: [], reis: [], opening: '', deelsin: '', volgende: null, transkripsie: '',
  klaar: null,
  /* 'n Sessie sonder inhoud, nie `null` nie: die skerm hoef nie te toets of dit
     bestaan voor dit kan teken nie. */
  sessie: { titel: '', skrifte: [], vrae: [], gebed: '' },
}

export function weekDae(w)         { return (WEKE[Number(w)] || LEEG).dae }
export function weekReis(w)        { return (WEKE[Number(w)] || LEEG).reis }
export function weekOpening(w)     { return (WEKE[Number(w)] || LEEG).opening }
export function weekDeelsin(w)     { return (WEKE[Number(w)] || LEEG).deelsin }
export function weekVolgende(w)    { return (WEKE[Number(w)] || LEEG).volgende }
export function weekTranskripsie(w){ return (WEKE[Number(w)] || LEEG).transkripsie }
/* Die groepsessie volg die OOP week. Dit het op die skerm hardgekodeer gestaan
   en het Week 1 se Skrif en vrae gewys nadat Week 2 lewendig geword het. */
export function weekSessie(w)      { return (WEKE[Number(w)] || LEEG).sessie }

/* Die klaar-skerm se eie woorde. Dit was vir ELKE week Week 1 s'n — "JY HET
   BEGIN KYK", hardgekodeer in VolgJesusStap.jsx — sodat iemand wat Week 4
   klaarmaak, Week 1 se sin gelees het. 'n Week wat niks gee nie, kry `null` en
   die skerm val terug op daardie ou woorde; weke 1 tot 3 lyk dus presies soos
   hulle altyd gelyk het. */
export function weekKlaar(w)       { return (WEKE[Number(w)] || LEEG).klaar || null }

/* Die blokke vir een dag van een week. */
export function blokkeVir(w, n) {
  const dag = weekDae(w).find(d => d.n === Number(n))
  return dag ? dag.blokke : []
}

export function dagVir(w, n) {
  return weekDae(w).find(d => d.n === Number(n)) || null
}
