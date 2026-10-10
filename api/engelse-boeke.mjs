/* ── GET /api/engelse-boeke ── die Engelse e-boeke vir /english
 *
 * Dewald, 10 Oktober 2026: *"Why does the browser take so long to load the
 * english ebooks?"* Die blad het op 'n regstreekse Firestore-`onSnapshot`
 * gewag, en die SDK se verbinding opbou kos op 'n foon (veral in Facebook se
 * ingeboude blaaier, wat na lang-peiling terugval) maklik etlike sekondes. Die
 * Afrikaanse blad voel vinnig omdat sy boeke se name in die KODE staan; die
 * Engelse een het niks gehad om te wys voordat Firestore antwoord nie.
 *
 * Hierdie eindpunt is dieselfde vorm as `reels-lys.mjs`: een gewone GET, die
 * diensrekening lees, 'n WITLYS (src/data/engelseBoekeOpenbaar.js), en die rand
 * kas dit vyf minute — EEN lees vir die hele wêreld in plaas van een per foon.
 * Die blad se lewendige luisteraar bly staan vir as die admin iets verander. */
import { lysDokke, leesDok } from './_sorgFirestore.mjs'
import { openbareEngelseBoeke } from '../src/data/engelseBoekeOpenbaar.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ fout: 'Net GET' })
  }
  try {
    /* Die TELLER kom saam (Dewald: *"Now the counter takes longer"*). Dit is
       dieselfde `stats/ebooks_given` as die Afrikaanse blad s'n — net twee
       heelgetalle, geen naam nie. Misluk dit, kom die boeke steeds. */
    const [rou, stats, campagne] = await Promise.all([
      lysDokke('books', { grootte: 300, maks: 600 }),
      leesDok('stats', 'ebooks_given').catch(() => null),
      /* Dieselfde dokument as api/campaign-count.js — die derde bron van die
         teller, sodat die Engelse blad alles in EEN gekasde versoek kry. */
      leesDok('counters', 'campaign_huise').catch(() => null),
    ])
    const boeke = openbareEngelseBoeke(rou)
    const getal = v => (Number.isFinite(Number(v)) && Number(v) >= 0 ? Math.floor(Number(v)) : null)
    const teller = stats ? { count: getal(stats.count) ?? 0, value: getal(stats.value) ?? 0 } : null
    const campagneTotaal = campagne ? (getal(campagne.total) ?? 0) : null
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return res.status(200).json({ boeke, teller, campagne: campagneTotaal })
  } catch (e) {
    console.warn('[engelse-boeke] kon nie lees nie:', e.message)
    res.setHeader('Cache-Control', 'no-store')
    return res.status(500).json({ fout: e.message, boeke: [] })
  }
}
