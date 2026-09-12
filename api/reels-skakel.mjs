/* ── Maak EEN kort TikTok-skakel oop en gee die post-ID terug ──
 *
 *   POST /api/reels-skakel   { skakel: "https://vt.tiktok.com/ZSqa9Knhv/" }
 *     → { id: "7412345678901234567", handvatsel: "@iemand", spronge: 1 }
 *
 * Dewald deel van sy foon af, en die TikTok-app gee dan 'n KORT skakel. Daardie
 * string dra die ID nie — 'n mens moet hom oopmaak om te sien waarheen hy wys.
 * Dit is 'n netwerk-versoek, en dus kan die app dit nie self doen nie.
 *
 * Dewald: *"dit sou eintlik makliker wees as ek net al die skakels so kon kopie
 * en past in admin."* Hy is reg, en die alternatief — dat hy elke skakel met die
 * hand in 'n blaaier oopmaak en die lang adres terugplak — is 'n taak wat 'n
 * bediener in 'n halwe sekonde doen.
 *
 * Die volg self staan in `api/_tiktokVolg.mjs`, saam met die drie slotte wat 'n
 * eindpunt nodig het wat 'n ADRES gaan haal. Lees daardie kop.
 *
 * Vir die KLOMP is daar `api/reels-voeg-by.mjs`. Hierdie een bly bestaan vir die
 * enkel-geval en omdat hy niks skryf nie: 'n mens kan hom gebruik om te KYK wat
 * 'n skakel is sonder om iets te verander.
 */
import { volgSkakel } from './_tiktokVolg.mjs'
import geheim from './_geheim.js'
const { wieMag } = geheim

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ fout: 'Net POST' })
  }
  /* Admin-alleen. Net Dewald plak skakels, en 'n oop eindpunt wat 'n adres gaan
     haal, is 'n oop deur. */
  if (!wieMag(req)) return res.status(401).json({ fout: 'Nee' })

  const lyf = req.body && typeof req.body === 'object' ? req.body : {}
  const inset = String(lyf.skakel || '').trim()
  if (!inset) return res.status(400).json({ fout: 'Geen skakel' })

  const uit = await volgSkakel(inset)
  if (!uit.ok) {
    /* Die helper gee die FEIT; hierdie skerm gee die RAAD. 'n Mens staar hier
       na EEN antwoord, en "probeer weer" is wat hy moet weet — dit was nie sy
       skuld nie. In die klomp-eindpunt sou daardie raad by 124 reëls net geraas
       wees, en daarom staan dit hier en nie in `_tiktokVolg.mjs` nie. */
    const raad = (uit.kode === 502 || uit.kode === 504) ? ' Probeer weer.' : ''
    return res.status(uit.kode || 400).json({ fout: `${uit.fout}.${raad}`.replace('..', '.') })
  }

  return res.status(200).json({
    id: uit.id,
    handvatsel: uit.handvatsel || '',
    spronge: uit.spronge,
  })
}
