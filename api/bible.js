// Proxy na YouVersion Platform.
//
// Die inhoud-endpunte laat nie kruis-oorsprong versoeke vanaf 'n blaaier toe nie,
// so ons roep hulle bediener-kant aan. Dit los twee dinge gelyk op: geen CORS,
// en die App Key bly heeltemal uit die blaaier uit.
//
// Gebruik:
//   /api/bible?path=/v1/bibles&language_ranges[]=eng
//   /api/bible?path=/v1/bibles/3034/passages/JHN.3.16&format=html
//   /api/bible?path=/v1/bibles/3034/index

const HOST = 'https://api.youversion.com'

// YouVersion se App Key is 'n publieke identifiseerder ("public app key used to
// resolve the app for direct browser flows") — nie 'n geheim nie. Die
// omgewingsveranderlike kry voorkeur; hierdie terugval is sodat dit werk sonder
// dat Vercel eers opgestel hoef te word. Kan enige tyd in die portaal vervang word.
const FALLBACK_KEY = 'warTP8MO99PXNasg3UyTD89hLqubRpSr4GGDS27kin0AdrTn'

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' })

  const appKey = process.env.YOUVERSION_APP_KEY || FALLBACK_KEY

  const { path, ...rest } = req.query || {}
  if (!path) return res.status(400).json({ error: 'path parameter vereis' })

  // Beperk tot YouVersion se v1 API — moet nie 'n oop proxy word nie
  if (typeof path !== 'string' || !path.startsWith('/v1/')) {
    return res.status(400).json({ error: 'path moet met /v1/ begin' })
  }

  const qs = new URLSearchParams()
  Object.entries(rest).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach(x => qs.append(k, x))
    else if (v != null) qs.append(k, v)
  })

  const url = HOST + path + (qs.toString() ? '?' + qs.toString() : '')

  try {
    const r = await fetch(url, {
      headers: {
        'X-YVP-App-Key': appKey,
        'X-YVP-Installation-Id': 'daaglikse-hoop-web',
        'Accept': 'application/json',
      },
    })

    const body = await r.text()
    res.status(r.status)
    res.setHeader('Content-Type', r.headers.get('content-type') || 'application/json')
    // Hoofstukke verander nie — laat die rand dit 'n uur lank hou
    if (r.ok) res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400')
    return res.send(body)
  } catch (err) {
    return res.status(502).json({ error: 'Kon nie YouVersion bereik nie', detail: String(err && err.message) })
  }
}
