/* ── Een clip uit die voer haal ──
 *
 *   POST /api/reels-verwyder   { inset }                → KYK: wie is dit?
 *   POST /api/reels-verwyder   { inset, verwyder: true } → VEE dit uit
 *
 * Admin-alleen. Dit vee data uit, en dit is die soort eindpunt wat 'n mens
 * nooit oop laat nie.
 *
 * ── Hoekom dit bestaan ──
 *
 * Dewald, 14 September 2026, met 'n skermkiekie van *"Video currently
 * unavailable"* in die voer: *"how to remove only this one that isn't playing
 * how will i know what link it is."*
 *
 * 'n Clip kan enige dag doodgaan sonder dat ons dit weet: die maker vee hom
 * uit, maak hom privaat, of TikTok haal hom af. Die app het toe geen manier
 * gehad om EEN clip uit te haal nie — net 'n knoppie wat 210 skakels INSIT.
 *
 * ── Die TWEE stappe, en hoekom dit nie een is nie ──
 *
 * Sonder `verwyder` kyk dit net en gee terug WIE die clip is. Die admin wys
 * daardie naam, en dan eers is daar 'n rooi knoppie.
 *
 * Dit is nie oorversigtigheid nie. Die enigste ding wat 'n mens van die skerm
 * af in die hand het, is 'n id van negentien syfers — 'n mens kan dit nie lees
 * en nie nagaan nie. Vee ons dadelik uit, is die eerste keer dat hy die maker
 * se naam sien, NÁ die clip weg is.
 *
 * ── Wat 'n mens mag inplak ──
 *
 * Die vorms staan in `src/data/reelsVerwyder.js` en dit is suiwer. Een daarvan
 * — TikTok se KORT skakel — dra die id nie, en word hier met `volgSkakel()`
 * oopgemaak. Dit is dieselfde begroting-en-suffiks-keuring as die invoerder;
 * 'n eindpunt wat 'n adres gaan haal, is die gevaarlike soort.
 *
 * ── Die leer in Storage ──
 *
 * Daar is nie een. 'n Clip is 'n paar velde wat na TikTok wys, dus is die
 * dokument ALLES. Dit is anders as 'n e-boek, waar die PDF bly staan.
 *
 * ── Dit is omkeerbaar ──
 *
 * Word die verkeerde een uitgevee, plak die skakel weer in die invoer-kassie en
 * hy kom terug. Wat NIE terugkom nie, is sy `gedeel`-telling — dit is die enigste
 * ding wat by 'n verwydering verlore gaan, en dit is die moeite werd om te weet
 * voor 'n mens druk.
 */
import geheim from './_geheim.js'
import { leesDok, veeDok } from './_sorgFirestore.mjs'
import { volgSkakel } from './_tiktokVolg.mjs'
import { leesInset } from '../src/data/reelsVerwyder.js'

const { wieMag } = geheim

export const config = { maxDuration: 20 }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ fout: 'Net POST' })
  }
  if (!wieMag(req)) return res.status(401).json({ fout: 'Nee' })

  const lyf = req.body && typeof req.body === 'object' ? req.body : {}
  const gelees = leesInset(lyf.inset)

  let id = ''
  if (gelees.soort === 'id') {
    id = gelees.id
  } else if (gelees.soort === 'kort') {
    /* 'n Kort skakel dra die id nie — hy moet oopgemaak word. Dieselfde
       oplosser, dieselfde begroting, dieselfde gasheer-keuring as die invoer. */
    const uit = await volgSkakel(gelees.skakel, {})
    if (!uit.ok) return res.status(400).json({ fout: uit.fout || 'Kon nie die skakel oopmaak nie' })
    id = uit.id
  } else {
    return res.status(400).json({ fout: gelees.fout || 'Kon nie die clip kry nie' })
  }

  /* KYK altyd eers. 'n Clip wat nie bestaan nie, is nie 'n fout wat 'n mens moet
     oplos nie — dit beteken net hy is reeds weg, en dit moet so gesê word. */
  let dok
  try {
    dok = await leesDok('reels', id)
  } catch (e) {
    console.warn('[reels-verwyder] kon nie lees nie:', e.message)
    return res.status(500).json({ fout: e.message })
  }

  if (!dok) {
    return res.status(200).json({ id, gevind: false, verwyder: false })
  }

  const klip = {
    id,
    naam: String(dok.naam || ''),
    handvatsel: String(dok.handvatsel || ''),
    gedeel: Number(dok.gedeel || 0) || 0,
  }

  if (!lyf.verwyder) return res.status(200).json({ ...klip, gevind: true, verwyder: false })

  try {
    await veeDok('reels', id)
  } catch (e) {
    console.warn('[reels-verwyder] kon nie uitvee nie:', e.message)
    return res.status(500).json({ fout: e.message, ...klip, gevind: true, verwyder: false })
  }

  return res.status(200).json({ ...klip, gevind: true, verwyder: true })
}
