/* POST /api/payfast-teken — die app stuur 'n betaling se velde; die bediener
 * sit die merchant-besonderhede by en teken dit met die wagwoordfrase wat net
 * op Vercel bestaan. Sien _payfast.js vir hoekom.
 *
 * Oop, met opset: die app roep dit vir elke skenking. Die ergste wat iemand
 * hiermee kan doen, is 'n geldige betaling AAN Daaglikse Hoop teken — die
 * notify-, return- en cancel-adresse moet ons s'n wees, en die wagwoordfrase
 * self verlaat nooit die bediener nie. */

const { bouBetaling } = require('./_payfast.js')

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).json({ fout: 'Net POST' })
  let lyf = req.body
  if (typeof lyf === 'string') { try { lyf = JSON.parse(lyf) } catch { lyf = null } }
  const uit = bouBetaling(lyf && lyf.velde)
  if (!uit.ok) {
    if (uit.kode === 503) console.error('payfast-teken:', uit.fout)
    return res.status(uit.kode).json({ fout: uit.fout })
  }
  return res.status(200).json({ velde: uit.velde, aksie: uit.aksie })
}
