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
  WEEK1_TRANSKRIPSIE,
} from './volgJesusWeek1.js'
import {
  WEEK2_DAE, WEEK2_REIS, WEEK2_OPENING, WEEK2_DEELSIN, WEEK2_VOLGENDE,
  WEEK2_TRANSKRIPSIE,
} from './volgJesusWeek2.js'

const WEKE = {
  1: {
    dae: WEEK1_DAE,
    reis: WEEK1_REIS,
    opening: WEEK1_OPENING,
    deelsin: WEEK1_DEELSIN,
    volgende: WEEK1_VOLGENDE,
    transkripsie: WEEK1_TRANSKRIPSIE,
  },
  2: {
    dae: WEEK2_DAE,
    reis: WEEK2_REIS,
    opening: WEEK2_OPENING,
    deelsin: WEEK2_DEELSIN,
    volgende: WEEK2_VOLGENDE,
    transkripsie: WEEK2_TRANSKRIPSIE,
  },
}

/* Het hierdie week 'n dag-pad? VolgJesusLewe vra dit voordat dit kies watter
   skerm om te wys. */
export function hetDae(w) {
  return !!WEKE[Number(w)]
}

/* Alles vir een week. Gee 'n LEË week terug vir 'n nommer wat ons nie ken nie —
   die skerm wys dan niks eerder as om om te val. */
const LEEG = { dae: [], reis: [], opening: '', deelsin: '', volgende: null, transkripsie: '' }

export function weekDae(w)         { return (WEKE[Number(w)] || LEEG).dae }
export function weekReis(w)        { return (WEKE[Number(w)] || LEEG).reis }
export function weekOpening(w)     { return (WEKE[Number(w)] || LEEG).opening }
export function weekDeelsin(w)     { return (WEKE[Number(w)] || LEEG).deelsin }
export function weekVolgende(w)    { return (WEKE[Number(w)] || LEEG).volgende }
export function weekTranskripsie(w){ return (WEKE[Number(w)] || LEEG).transkripsie }

/* Die blokke vir een dag van een week. */
export function blokkeVir(w, n) {
  const dag = weekDae(w).find(d => d.n === Number(n))
  return dag ? dag.blokke : []
}

export function dagVir(w, n) {
  return weekDae(w).find(d => d.n === Number(n)) || null
}
