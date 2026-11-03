/* ────────────────────────────────────────────────────────────
   /api/afmeld — die bladsy agter die afmeld-skakel onder die weeklikse
   e-pos. Die hele ontwerp staan bo-aan `_eposAfmeld.js`; kortliks:

     GET  ?e&t          → 'n bladsy met EEN knoppie ("Ja, meld my af").
                          Meld NIEMAND af nie — skanderders maak skakels oop.
     POST ?e&t          → meld af. Dit is ook wat Gmail se eie
                          "Unsubscribe"-knoppie stuur (RFC 8058).
     POST ?e&t&aksie=weer → teken weer in ("ek het per ongeluk gedruk").

   Die aksie staan in die ADRES en nie in die liggaam nie: Gmail se POST dra
   'n liggaam (`List-Unsubscribe=One-Click`) in 'n vorm wat ons nie hoef te
   ontleed nie, en dan kan niks in die liggaam die uitslag verander nie.

   Elke uitslag is 'n bladsy wat die WAARHEID sê. Kon die afmelding nie
   gestoor word nie, sê die bladsy dit en gee die e-posadres — nooit 'n
   "Jy is afgemeld" wat nie waar is nie.
   ──────────────────────────────────────────────────────────── */

const crypto = require('crypto')
const af = require('./_eposAfmeld')

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

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

function blad(titel, lyf) {
  return `<!doctype html>
<html lang="af"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Daaglikse Hoop · E-posse</title>
<style>
  body { margin:0; background:#FAF8F5; color:#2d2d2d; font:17px/1.6 Georgia, serif;
         display:flex; align-items:center; justify-content:center; min-height:100svh; padding:24px; box-sizing:border-box; }
  .k { max-width:420px; width:100%; background:#fff; border:1px solid #e8e4f0; border-radius:14px; padding:28px 24px; text-align:center; }
  .kop { color:#5C4E8E; font-size:14px; letter-spacing:.06em; margin:0 0 14px; }
  h1 { font-size:23px; margin:0 0 12px; }
  p { margin:0 0 12px; color:#555; }
  .adres { font-family:system-ui, sans-serif; font-size:15px; color:#2d2d2d; word-break:break-all; }
  button { display:block; width:100%; margin:18px 0 0; padding:15px 12px; border:0; border-radius:10px;
           background:#5C4E8E; color:#fff; font:700 16px Georgia, serif; cursor:pointer; }
  button:active { background:#463a72; }
  .stil { background:#f5f3ff; color:#5C4E8E; border:1px solid #ddd6f5; font-weight:400; font-size:15px; }
  .stil:active { background:#ebe6fb; }
  a { color:#5C4E8E; }
</style></head>
<body><div class="k"><p class="kop">DAAGLIKSE HOOP</p><h1>${titel}</h1>${lyf}</div></body></html>`
}

const vorm = (aksieUrl, knop, klas = '') =>
  `<form method="post" action="${esc(aksieUrl)}"><button type="submit"${klas ? ` class="${klas}"` : ''}>${knop}</button></form>`

const KONTAK = `<p>Stuur asseblief 'n e-pos na <a href="mailto:info@dewaldscheepers.com?subject=Meld%20my%20af">info@dewaldscheepers.com</a>, dan haal ons jou self af.</p>`

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  const stuur = (status, html) => res.status(status).send(html)

  if (req.method !== 'GET' && req.method !== 'POST') return stuur(405, blad('Nie toegelaat nie', ''))

  const q = req.query || {}
  const adres = af.adresUit(q.e)
  let geldig = false
  try { geldig = !!adres && af.isRegteTeken(adres, q.t) } catch { geldig = false }
  if (!geldig) {
    return stuur(400, blad('Hierdie skakel werk nie',
      `<p>Die skakel is dalk net half gekopieer.</p>${KONTAK}`))
  }

  const hier = `/api/afmeld?e=${encodeURIComponent(q.e)}&t=${encodeURIComponent(q.t)}`
  const projectId = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
  const adresHtml = `<p class="adres">${esc(adres)}</p>`

  let token
  try { token = await getAccessToken() } catch {
    return stuur(503, blad('Iets het fout gegaan', `<p>Ons kon nie nou by die lys uitkom nie.</p>${KONTAK}`))
  }

  if (req.method === 'GET') {
    let reeds = false
    try { reeds = await af.isAfgemeld(projectId, token, adres) } catch { reeds = false }
    if (reeds) {
      return stuur(200, blad('Jy is reeds afgemeld',
        `${adresHtml}<p>Jy kry nie meer die weeklikse e-posse nie.</p>
         ${vorm(hier + '&aksie=weer', 'Teken my weer in', 'stil')}`))
    }
    return stuur(200, blad('Wil jy afmeld?',
      `${adresHtml}<p>Dan kry jy nie meer die weeklikse e-posse van Daaglikse Hoop nie.</p>
       ${vorm(hier, 'Ja, meld my af')}`))
  }

  /* POST */
  if (q.aksie === 'weer') {
    try { await af.tekenWeer(projectId, token, adres) } catch {
      return stuur(503, blad('Iets het fout gegaan', `<p>Ons kon jou nie weer inteken nie. Probeer asseblief weer.</p>`))
    }
    return stuur(200, blad('Welkom terug',
      `${adresHtml}<p>Jy kry weer die weeklikse e-posse. Dankie!</p>`))
  }

  /* Net vir die admin se getal: kom dit van Gmail se knoppie of van ons blad. */
  let lyf = ''
  try { lyf = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}) } catch {}
  const bron = /One-Click/i.test(lyf) ? 'een-klik' : 'blad'
  try { await af.meldAf(projectId, token, adres, bron) } catch {
    return stuur(503, blad('Dit het nie gewerk nie',
      `${adresHtml}<p>Ons kon jou afmelding nie stoor nie — jy is NOG NIE afgemeld nie.</p>
       ${vorm(hier, 'Probeer weer')}${KONTAK}`))
  }
  return stuur(200, blad('Jy is afgemeld',
    `${adresHtml}<p>Jy sal nie weer die weeklikse e-posse kry nie. Dankie dat jy saam met ons was.</p>
     <p>Die app en die stemboodskappe bly vir jou daar.</p>
     ${vorm(hier + '&aksie=weer', 'Ek het per ongeluk gedruk — teken my weer in', 'stil')}`))
}
