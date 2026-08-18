/* Wie is hierdie mens? — die een plek waar dit besluit word.
 *
 * Dewald se §15: "Alle user_id-waardes kom uit die geverifieerde server-side
 * auth session. Die client mag nie self 'n user_id verskaf of bepaal nie.
 * Moenie identiteit baseer op localStorage, device ID, display name,
 * groepkode of 'n URL-parameter nie."
 *
 * Hierdie leer is daardie reël. Die uid kom uit `eis.sub` van 'n Firebase
 * ID-token wat teen Google se publieke sertifikate geverifieer is — nooit uit
 * die versoek se liggaam nie.
 *
 * Die kode is nie nuut nie: dit loop al 'n jaar in `api/ark-ranglys.js` vir
 * die ranglyste. Dit staan nou een keer, want 'n verifikasie wat op twee
 * plekke staan, is een plek wat gaan agterbly.
 */
const crypto = require('crypto')

/* Google se sertifikate roteer. Ons hou hulle solank die kop se max-age
   toelaat — nie langer nie. */
let _serts = { tot: 0, data: null }

async function haalSerts() {
  if (_serts.data && Date.now() < _serts.tot) return _serts.data
  const r = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com')
  if (!r.ok) throw new Error('kon nie sertifikate haal nie')
  const data = await r.json()
  const beheer = r.headers.get('cache-control') || ''
  const m = beheer.match(/max-age=(\d+)/)
  _serts = { tot: Date.now() + (m ? Number(m[1]) : 3600) * 1000, data }
  return data
}

/* Gee die uid, of null. Nooit 'n uitsondering wat 'n eindpunt laat val nie —
   'n mislukte verifikasie is 'n 401, nie 'n 500. */
async function uidUitToken(token, projekId) {
  if (typeof token !== 'string' || token.split('.').length !== 3) return null
  const [kopB64, eisB64, handtekening] = token.split('.')

  let kop, eis
  try {
    kop = JSON.parse(Buffer.from(kopB64, 'base64url').toString())
    eis = JSON.parse(Buffer.from(eisB64, 'base64url').toString())
  } catch { return null }

  if (kop.alg !== 'RS256' || !kop.kid) return null

  const nou = Math.floor(Date.now() / 1000)
  if (eis.aud !== projekId) return null
  if (eis.iss !== `https://securetoken.google.com/${projekId}`) return null
  if (!eis.sub || typeof eis.sub !== 'string' || eis.sub.length > 128) return null
  if (!(eis.exp > nou)) return null
  if (!(eis.iat <= nou + 300)) return null       /* klein toegewing vir horlosies */

  let serts
  try { serts = await haalSerts() } catch { return null }
  const sert = serts[kop.kid]
  if (!sert) return null

  const nagaan = crypto.createVerify('RSA-SHA256')
  nagaan.update(`${kopB64}.${eisB64}`)
  try {
    if (!nagaan.verify(sert, Buffer.from(handtekening, 'base64url'))) return null
  } catch { return null }

  return eis.sub
}

/* Uit die Authorization-kopstuk. Die token gaan NOOIT in 'n URL nie — 'n URL
   beland in logs, in die geskiedenis en in verwysings. */
function tokenUitVersoek(req) {
  const kop = (req && req.headers && (req.headers.authorization || req.headers.Authorization)) || ''
  const m = String(kop).match(/^Bearer\s+(.+)$/i)
  return m ? m[1].trim() : ''
}

async function wieIsDit(req, projekId) {
  return uidUitToken(tokenUitVersoek(req), projekId)
}

module.exports = { uidUitToken, tokenUitVersoek, wieIsDit }
