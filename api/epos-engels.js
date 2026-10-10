/* ── Die ENGELSE e-poslys, vir die admin ──
 *
 *   GET /api/epos-engels   (x-sorg-geheim)
 *     → { totaal, aktief, duplikate, ongeldig, geblok, adresse: [...] }
 *
 * Dewald, 10 Oktober 2026: *"daar moet aparte plek in admin wees vir engelse
 * eposte."* Die mense wat 'n ENGELSE boek aflaai of vanaf die Engelse blad
 * skenk, staan in `emailListEn` — nie in `emailList` nie (sien _eposEngels.js).
 *
 * Dieselfde ontleding as die Afrikaanse lys (`haalEnOntleed`): ontdubbel, keur
 * die adres, en hou geblokte mense uit. Net die versameling verskil.
 *
 * Admin-alleen: dit is 'n lys mense se e-posadresse.
 */
const crypto = require('crypto')
const { magAdminDing } = require('./_geheim.js')
const { haalEnOntleed } = require('./_eposLys')
const { ENGELSE_LYS } = require('./_eposEngels.js')

async function getAccessToken() {
  const now    = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const claim  = Buffer.from(JSON.stringify({
    iss: process.env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  })).toString('base64url')
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(`${header}.${claim}`)
  const sig = sign.sign(privateKey, 'base64url')
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${header}.${claim}.${sig}`,
  })
  const data = await r.json()
  if (!data.access_token) throw new Error('No token')
  return data.access_token
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ fout: 'Net GET' })
  if (!magAdminDing(req)) return res.status(403).json({ fout: 'Nie toegelaat nie' })

  const projectId = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
  let token
  try { token = await getAccessToken() } catch { return res.status(500).json({ fout: 'Auth' }) }

  try {
    const lys = await haalEnOntleed(projectId, token, ENGELSE_LYS)
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({
      totaal:    lys.totaal,
      aktief:    lys.aktief,
      duplikate: lys.duplikate,
      ongeldig:  lys.ongeldig,
      geblok:    lys.geblok,
      adresse:   lys.adresse,
    })
  } catch {
    return res.status(500).json({ fout: 'Kon nie die lys lees nie' })
  }
}
