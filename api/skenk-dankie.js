/* ── POST /api/skenk-dankie ── { email, tipe: 'donation'|'subscription', taal }
 *
 * Die app roep dit op die oomblik dat die dankie-opspringer wys, ná die
 * terugkeer van PayFast. Dit is die pad wat ons kan SIEN; PayFast se ITN is
 * die een wat stil kan misluk. Albei loop deur `stuurSkenkDankie`, wat seker
 * maak dat die mens net EEN e-pos kry. Sien die kop van _skenkDankie.js. */
const { stuurSkenkDankie } = require('./_skenkDankie.js')
const engels = require('./_eposEngels.js')

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ fout: 'Net POST' })
  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
  body = body || {}
  try {
    const uit = await stuurSkenkDankie({
      email:    body.email,
      tipe:     body.tipe,
      isEngels: engels.isEngelseTaal(body.taal),
      bron:     'terugkeer',
    })
    return res.status(200).json(uit)
  } catch (e) {
    return res.status(200).json({ gestuur: false, rede: 'fout' })
  }
}
