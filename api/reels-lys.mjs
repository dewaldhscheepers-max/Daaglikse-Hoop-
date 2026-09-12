/* ── Die voer se clips, soos die publiek dit sien ──
 *
 *   GET /api/reels-lys  →  { klips: [...] }
 *
 * Geen geheim. Dit is die eindpunt wat 'n gewone foon roep.
 *
 * ── Hoekom dit bestaan ──
 *
 * Die voer het Firestore DIREK gelees (`getDocs(collection(db, 'reels'))`), en
 * dan moet daar 'n `allow read` in `firestore.rules` staan — en daardie reël
 * moet GEPUBLISEER word. Dewald het dit twee keer op 'n foon probeer; die
 * Firebase-konsole se reëls-redigeerder is op 'n foon onbruikbaar, en ek kan dit
 * nie van hier doen nie (geen CLI, geen aanmelding, geen diensrekening-sleutel
 * in hierdie houer).
 *
 * Dit lees nou met die diensrekening, wat die reëls omseil. Drie dinge word
 * daarmee beter, nie net een:
 *
 *   1. `reels` bly heeltemal TOE vir kliënte. Niks hoef gepubliseer te word nie.
 *   2. Die WITLYS kom gratis saam — sien `src/data/reelsOpenbaar.js`. Voeg
 *      iemand môre 'n veld by 'n clip, kom dit nie oor die draad nie.
 *   3. Een lees vir die hele wêreld in plaas van een per foon, want die rand
 *      kas dit. Dit is dieselfde besluit as `api/volg-jesus-openbaar.mjs`.
 *
 * ── Die kas ──
 *
 * Die clips verander wanneer Dewald 'n klomp skakels inplak — 'n paar keer per
 * week, nie elke minuut nie. `s-maxage=300` laat Vercel se rand dit vyf minute
 * hou, en `stale-while-revalidate` beteken 'n stadige Firestore laat niemand
 * wag nie. Om 06:30 maak duisende fone die app oop; hulle tref die kas, nie
 * hierdie funksie nie.
 *
 * Vyf minute en nie 'n dag nie: plak hy nuwe clips in, moet hulle binne 'n paar
 * minute op die fone wees. Die voer se EIE kas op die foon hou ses uur, dus is
 * die kliënt in elk geval die stadiger van die twee.
 */
import { lysDokke } from './_sorgFirestore.mjs'
import { openbareLys } from '../src/data/reelsOpenbaar.js'
import { skoonLys } from '../src/data/reels.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ fout: 'Net GET' })
  }

  try {
    const rou = await lysDokke('reels', { grootte: 300, maks: 600 })
    /* Eers die witlys, dan `magWys()`. Die orde maak saak: `magWys` vra of daar
       'n naam is, en dit is die witlys wat besluit of daardie veld bestaan. */
    const klips = skoonLys(openbareLys(rou))

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return res.status(200).json({ klips })
  } catch (e) {
    /* 'n Voer wat nie laai nie, mag nie 'n foutskerm wees nie — die app se eie
       kas en die saai in die kode dra die skerm. Ons sê net wat gebeur het, en
       met `no-store` sodat 'n mislukking nie vyf minute lank gekas word nie. */
    console.warn('[reels-lys] kon nie lees nie:', e.message)
    res.setHeader('Cache-Control', 'no-store')
    return res.status(500).json({ fout: e.message, klips: [] })
  }
}
