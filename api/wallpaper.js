/* ────────────────────────────────────────────────────────────
   Vandag se wallpaper, deur ONS eie domein.

   ── Waarom dit bestaan ──

   Die deelknoppie op Luister moet die prent as 'n LÊER deel, want dit is wat
   'n mens op sy WhatsApp-status sit. Om 'n lêer te deel moet die blaaier die
   grepe eers self kry:

       const blob = await (await fetch(prentUrl)).blob()

   Die prent le op `firebasestorage.googleapis.com`, en daardie emmer het geen
   CORS-opstelling nie. 'n <img src="..."> werk (die blaaier vra nooit vir
   toestemming om net te WYS nie), maar 'n `fetch` van 'n ander domein af word
   geblokkeer. Die eerste weergawe het dus stil na teks-alleen teruggeval en
   die prent is nooit gedeel nie — dit lyk of dit werk, en dit werk nie.

   Die ander pad was om die emmer se CORS op Google Cloud oop te maak. Dit is
   'n handjievol regte data-instellings op die lewende projek, buite hierdie
   kodebasis, wat niemand oor 'n jaar gaan onthou nie. Hierdie lêer is die
   hele oplossing op een plek: die bediener haal die prent en gee dit terug
   vanaf ons eie domein, waar daar geen CORS-vraag is nie.

   ── Wat hier NIE mag gebeur nie ──

   'n Eindpunt wat 'n URL vat en dit gaan haal, is 'n oop deurgang: iemand
   stuur `?u=http://169.254.169.254/...` en die bediener gaan haal vir hom
   goed uit die binnenet uit wat hy nooit self kon bereik nie.

   Daarom drie hekke, en al drie moet slaag:
     1. Net https.
     2. Net ons twee bekende gasheernane, en die pad moet ONS emmer noem.
     3. Wat terugkom moet 'n prent wees, en klein genoeg.

   Geen wagwoord. Die prent is in elk geval reeds openbaar — dieselfde URL sit
   in `notes` en elke foon wat die app oopmaak, kry dit. Hier word niks gestoor
   nie en niks geskryf nie.
   ──────────────────────────────────────────────────────────── */

const EMMER = 'daaglikse-hoop'

const GASHERE = new Set([
  'firebasestorage.googleapis.com',
  'storage.googleapis.com',
])

const MAX_GREPE = 12 * 1024 * 1024   /* 12 MB. 'n Wallpaper is sowat 'n halwe. */

/* Gee die URL terug as dit veilig is om te gaan haal, anders null.

   Aparte funksie sodat dit sonder 'n bediener getoets kan word. */
function veiligeUrl(rou) {
  if (typeof rou !== 'string' || !rou || rou.length > 2000) return null
  let u
  try { u = new URL(rou) } catch { return null }
  if (u.protocol !== 'https:') return null
  if (!GASHERE.has(u.hostname)) return null
  /* Die emmer se naam staan in die pad by albei gasheername:
       /v0/b/daaglikse-hoop.firebasestorage.app/o/...
       /daaglikse-hoop.firebasestorage.app/...
     Sonder hierdie toets kon iemand enige openbare Google-emmer deur ons
     bediener trek. */
  if (!u.pathname.includes(EMMER)) return null
  return u.toString()
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    return res.status(405).json({ fout: 'Net GET.' })
  }

  const url = veiligeUrl(req.query && req.query.u)
  if (!url) return res.status(400).json({ fout: 'Onbekende prent.' })

  try {
    const r = await fetch(url)
    if (!r.ok) return res.status(502).json({ fout: `Die prent gee ${r.status}.` })

    const soort = String(r.headers.get('content-type') || '').split(';')[0].trim()
    if (!/^image\//.test(soort)) return res.status(415).json({ fout: 'Dis nie \'n prent nie.' })

    const grepe = Buffer.from(await r.arrayBuffer())
    if (grepe.length > MAX_GREPE) return res.status(413).json({ fout: 'Die prent is te groot.' })

    res.setHeader('Content-Type', soort)
    res.setHeader('Content-Length', String(grepe.length))
    res.setHeader('Content-Disposition', 'inline; filename="daaglikse-hoop.jpg"')
    /* Die prent verander een keer per dag en die URL dra 'n teken wat saam
       met hom verander, so dit mag lank gekas word. */
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400')
    if (req.method === 'HEAD') return res.status(200).end()
    return res.status(200).send(grepe)
  } catch (e) {
    return res.status(502).json({ fout: 'Kon nie die prent haal nie.' })
  }
}

module.exports.veiligeUrl = veiligeUrl
