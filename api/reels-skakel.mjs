/* ── Maak 'n kort TikTok-skakel oop en gee die post-ID terug ──
 *
 *   POST /api/reels-skakel   { skakel: "https://vt.tiktok.com/ZSqa9Knhv/" }
 *     → { id: "7412345678901234567" }
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
 * ── Hierdie eindpunt haal 'n ADRES op, en dit is die gevaarlike soort ──
 *
 * 'n Eindpunt wat gaan haal wat 'n mens vir hom gee, is 'n oop deur na alles wat
 * die bediener kan bereik — Vercel se eie metadata inbegrepe. Drie slotte, en
 * al drie is nodig:
 *
 *   1. **Dit is admin-alleen.** `wieMag()`, dieselfde slot as elke ander
 *      admin-ding. Net Dewald plak skakels.
 *   2. **Net TikTok se kort gasheer.** `isKortSkakel()` uit `src/data/tiktokId.js`
 *      — dieselfde suiwer funksie wat die vorm gebruik, sodat die vorm en die
 *      bediener nooit oor "wat is 'n kort skakel" kan verskil nie.
 *   3. **Elke SPRONG word weer gekeur.** 'n Herlei kan enige plek heen wys. Ons
 *      volg met die hand, hoogstens vier spronge, en elke keer moet die nuwe
 *      adres weer op tiktok.com wees. `redirect: 'follow'` sou hierdie hele
 *      keuring oorslaan.
 *
 * Die liggaam word nooit gelees nie. Ons wil net die adres hê.
 */
import { tiktokIdUit, isKortSkakel } from '../src/data/tiktokId.js'
import geheim from './_geheim.js'
const { wieMag } = geheim

/* Vier is ruim. TikTok se kort skakel spring een of twee keer; 'n ketting wat
   langer word, is nie 'n skakel nie, dit is 'n lus. */
const MAKS_SPRONGE = 4

/* ── Die hele versoek het 'n BEGROTING, nie net elke sprong nie ──
 *
 * 'n Vercel-funksie sterf by tien sekondes as niks anders gesê word nie. Vier
 * spronge maal agt sekondes is twee-en-dertig, dus sou 'n stadige ketting die
 * funksie laat doodmaak — en dan sien Dewald "Failed to fetch" sonder enige
 * rede. Dit is woord vir woord die fout wat die oggendkennisgewing gebreek het
 * (sien CLAUDE.md: 'n `for`-lus met 'n `await` in, en geen `maxDuration`).
 *
 * Agt sekondes vir die HELE ketting, en elke sprong kry net wat oorbly. Loop
 * die tyd uit, sê ons dit eerlik in plaas van om stil te sterf. */
const BEGROTING_MS = 8000
const MIN_SPRONG_MS = 1200

/* Elke adres in die ketting moet HIER wees. 'n Suffiks-toets op die gasheer,
   nooit `includes` — "tiktok.com.boos.net" bevat "tiktok.com". */
function isTiktokGasheer(u) {
  const g = String(u.hostname || '').toLowerCase()
  return g === 'tiktok.com' || g.endsWith('.tiktok.com')
}

function ontleed(adres) {
  let u
  try { u = new URL(String(adres || '').trim()) } catch { return null }
  /* Net https. 'n http-sprong sou die versoek in die oop stuur, en `file:` of
     `data:` is glad nie 'n webadres nie. */
  if (u.protocol !== 'https:') return null
  if (!isTiktokGasheer(u)) return null
  return u
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ fout: 'Net POST' })
  }
  if (!wieMag(req)) return res.status(401).json({ fout: 'Nee' })

  const lyf = req.body && typeof req.body === 'object' ? req.body : {}
  const inset = String(lyf.skakel || '').trim()
  if (!inset) return res.status(400).json({ fout: 'Geen skakel' })

  /* Dalk is dit reeds 'n volle adres — dan is daar niks om te gaan haal nie.
     Dit is die goedkoopste pad en dit raak nooit die netwerk nie. */
  const dadelik = tiktokIdUit(inset)
  if (dadelik) return res.status(200).json({ id: dadelik, spronge: 0 })

  if (!isKortSkakel(inset)) {
    return res.status(400).json({ fout: 'Dit lyk nie soos n TikTok-skakel nie' })
  }

  /* Sonder 'n skema is `new URL` ongelukkig; `isKortSkakel` laat dit toe omdat
     'n mens dit so plak. */
  let huidig = ontleed(/^https?:\/\//i.test(inset) ? inset : `https://${inset}`)
  if (!huidig) return res.status(400).json({ fout: 'Dit lyk nie soos n TikTok-skakel nie' })

  const sluitTyd = Date.now() + BEGROTING_MS

  for (let sprong = 1; sprong <= MAKS_SPRONGE; sprong++) {
    const oor = sluitTyd - Date.now()
    if (oor < MIN_SPRONG_MS) {
      return res.status(504).json({ fout: 'TikTok antwoord te stadig. Probeer weer.' })
    }
    let antwoord
    try {
      antwoord = await fetch(huidig.toString(), {
        method: 'HEAD',
        redirect: 'manual',
        /* TikTok gee 'n kaal bediener soms niks. 'n Gewone blaaier-agent is nie
           'n truuk nie — dit is wat die skakel verwag. */
        headers: { 'user-agent': 'Mozilla/5.0 (compatible; DaaglikseHoop/1.0)' },
        signal: AbortSignal.timeout(oor),
      })
    } catch {
      /* 'n Tydgrens of 'n netwerkfout. Dit is nie Dewald se skuld nie en die
         boodskap moet dit sê. */
      return res.status(502).json({ fout: 'Kon nie by TikTok uitkom nie. Probeer weer.' })
    }

    const na = antwoord.headers.get('location')
    if (!na) {
      /* Geen herlei meer. Is die ID in die adres waar ons nou staan, is ons
         klaar; anders het die skakel nêrens heen gewys nie. */
      const id = tiktokIdUit(huidig.toString())
      if (id) return res.status(200).json({ id, spronge: sprong - 1 })
      return res.status(404).json({ fout: 'Die skakel wys nie na n video nie' })
    }

    /* Die nuwe adres, teen dieselfde keuring as die eerste. 'n Relatiewe
       herlei word teen die huidige adres opgelos. */
    let volgende
    try { volgende = ontleed(new URL(na, huidig).toString()) } catch { volgende = null }
    if (!volgende) return res.status(400).json({ fout: 'Die skakel wys weg van TikTok af' })

    const id = tiktokIdUit(volgende.toString())
    if (id) return res.status(200).json({ id, spronge: sprong })
    huidig = volgende
  }

  return res.status(504).json({ fout: 'Die skakel spring te veel keer' })
}
