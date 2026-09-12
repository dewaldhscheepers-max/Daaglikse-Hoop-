/* ── Maak 'n kort TikTok-skakel oop ──
 *
 * Een kopie, gebruik deur `api/reels-skakel.mjs` (een skakel) en
 * `api/reels-voeg-by.mjs` (die klomp). Twee kopieë van hierdie keuring is een
 * kopie wat gaan agterbly, en dit is nie 'n keuring wat 'n mens wil laat
 * agterbly nie.
 *
 * ── Dit HAAL 'n ADRES op, en dit is die gevaarlike soort ──
 *
 * 'n Funksie wat gaan haal wat 'n mens vir hom gee, is 'n oop deur na alles wat
 * die bediener kan bereik — Vercel se eie metadata inbegrepe. Drie slotte, en
 * al drie is nodig:
 *
 *   1. **Net TikTok se gashere.** 'n Suffiks-toets, nooit `includes` —
 *      "tiktok.com.boos.net" bevat "tiktok.com".
 *   2. **Net https.** 'n http-sprong sou die versoek in die oop stuur, en
 *      `file:` of `data:` is glad nie 'n webadres nie.
 *   3. **Elke SPRONG word weer gekeur.** 'n Herlei kan enige plek heen wys.
 *      `redirect: 'follow'` sou hierdie hele keuring oorslaan.
 *
 * Die liggaam word nooit gelees nie. Ons wil net die adres hê.
 */
import { tiktokIdUit, isKortSkakel, handvatselUit } from '../src/data/tiktokId.js'

/* Vier is ruim. TikTok se kort skakel spring een of twee keer; 'n ketting wat
   langer word, is nie 'n skakel nie, dit is 'n lus. */
export const MAKS_SPRONGE = 4

/* ── Elke versoek het 'n BEGROTING ──
 *
 * 'n Vercel-funksie sterf by tien sekondes as niks anders gesê word nie. Vier
 * spronge maal agt sekondes is twee-en-dertig, dus sou 'n stadige ketting die
 * funksie laat doodmaak — en dan sien 'n mens "Failed to fetch" sonder enige
 * rede. Dit is woord vir woord die fout wat die oggendkennisgewing gebreek het
 * (sien CLAUDE.md: 'n `for`-lus met 'n `await` in, en geen `maxDuration`). */
export const BEGROTING_MS = 8000
const MIN_SPRONG_MS = 1200

function isTiktokGasheer(u) {
  const g = String(u.hostname || '').toLowerCase()
  return g === 'tiktok.com' || g.endsWith('.tiktok.com')
}

export function ontleed(adres) {
  let u
  try { u = new URL(String(adres || '').trim()) } catch { return null }
  if (u.protocol !== 'https:') return null
  if (!isTiktokGasheer(u)) return null
  return u
}

/* ── Volg een skakel ──
 *
 * Gee altyd 'n voorwerp, nooit 'n uitsondering: die klomp-oplosser loop oor 124
 * skakels en een stukkende een mag nie die res kos nie.
 *
 *   { ok: true,  id, handvatsel, adres, spronge }
 *   { ok: false, fout: 'n boodskap, kode: 400 | 404 | 502 | 504 }
 */
export async function volgSkakel(inset, opsies) {
  const o = opsies || {}
  const begroting = Number(o.begroting) || BEGROTING_MS
  const s = String(inset || '').trim()
  if (!s) return { ok: false, kode: 400, fout: 'Geen skakel' }

  /* Dalk is dit reeds 'n volle adres — dan is daar niks om te gaan haal nie.
     Dit is die goedkoopste pad en dit raak nooit die netwerk nie. */
  const dadelik = tiktokIdUit(s)
  if (dadelik) {
    return { ok: true, id: dadelik, handvatsel: handvatselUit(s), adres: s, spronge: 0 }
  }

  if (!isKortSkakel(s)) {
    return { ok: false, kode: 400, fout: 'Dit lyk nie soos n TikTok-skakel nie' }
  }

  /* Sonder 'n skema is `new URL` ongelukkig; `isKortSkakel` laat dit toe omdat
     'n mens dit so plak. */
  let huidig = ontleed(/^https?:\/\//i.test(s) ? s : `https://${s}`)
  if (!huidig) return { ok: false, kode: 400, fout: 'Dit lyk nie soos n TikTok-skakel nie' }

  const sluitTyd = Date.now() + begroting

  for (let sprong = 1; sprong <= MAKS_SPRONGE; sprong++) {
    const oor = sluitTyd - Date.now()
    if (oor < MIN_SPRONG_MS) {
      return { ok: false, kode: 504, fout: 'TikTok antwoord te stadig' }
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
      return { ok: false, kode: 502, fout: 'Kon nie by TikTok uitkom nie' }
    }

    const na = antwoord.headers.get('location')
    if (!na) {
      /* Geen herlei meer. Is die ID in die adres waar ons nou staan, is ons
         klaar; anders het die skakel nêrens heen gewys nie. */
      const adres = huidig.toString()
      const id = tiktokIdUit(adres)
      if (id) return { ok: true, id, handvatsel: handvatselUit(adres), adres, spronge: sprong - 1 }
      return { ok: false, kode: 404, fout: 'Die skakel wys nie na n video nie' }
    }

    let volgende
    try { volgende = ontleed(new URL(na, huidig).toString()) } catch { volgende = null }
    if (!volgende) return { ok: false, kode: 400, fout: 'Die skakel wys weg van TikTok af' }

    const adres = volgende.toString()
    const id = tiktokIdUit(adres)
    if (id) return { ok: true, id, handvatsel: handvatselUit(adres), adres, spronge: sprong }
    huidig = volgende
  }

  return { ok: false, kode: 504, fout: 'Die skakel spring te veel keer' }
}
