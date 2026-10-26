/* ── Die voorskouprent van EEN TikTok-video ──
 *
 *   GET /api/tiktok-duim?id=7412345678901234567&h=@dewaldscheepers
 *     → { duim: "https://…tiktokcdn.com/…" }   of   { duim: "" }
 *
 * Vir die videogebed op Bid Saam. Sien src/data/tiktokDuim.js vir die hele
 * rede. Twee dinge is met opset:
 *
 *   · die adres wat ons gaan haal, word HIER gebou uit 'n ID wat net syfers is
 *     en 'n handvatsel uit 'n witlys van karakters — die versoek kies nooit 'n
 *     gasheer nie, dus kan hierdie eindpunt nie na 'n ander plek gestuur word
 *     nie;
 *   · 'n mislukking is nooit 'n fout vir die foon nie. Dan is `duim` leeg en die
 *     kaart wys sy pers grond soos voorheen. Met `no-store`, sodat 'n
 *     mislukking nie ure lank gekas word nie.
 */
import { oembedAdres, duimUit } from '../src/data/tiktokDuim.js'

const TYDGRENS_MS = 5000

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ fout: 'Net GET' })
  }
  const q = req.query || {}
  const adres = oembedAdres(q.id, q.h)
  if (!adres) {
    res.setHeader('Cache-Control', 'no-store')
    return res.status(400).json({ duim: '' })
  }

  const beheer = new AbortController()
  const t = setTimeout(() => beheer.abort(), TYDGRENS_MS)
  try {
    const r = await fetch(adres, { signal: beheer.signal, headers: { Accept: 'application/json' } })
    const d = r.ok ? await r.json().catch(() => null) : null
    const duim = duimUit(d)
    if (!duim) {
      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).json({ duim: '' })
    }
    /* Ses uur: die prent-adres is geteken en verval, dus nooit lank nie. */
    res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=3600')
    return res.status(200).json({ duim })
  } catch (e) {
    console.warn('[tiktok-duim] kon nie haal nie:', e && e.message)
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ duim: '' })
  } finally {
    clearTimeout(t)
  }
}
