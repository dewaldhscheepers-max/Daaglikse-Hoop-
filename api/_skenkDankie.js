/* ── Die DANKIE-e-pos ná 'n skenking — EEN plek, EEN keer ──
 *
 * Twee paaie roep dit, en albei MOET kan:
 *
 *   1. PayFast se ITN (`payfast-itn.js`) — die bediener-tot-bediener-boodskap.
 *   2. Die app self, op die oomblik dat die dankie-opspringer wys
 *      (`api/skenk-dankie.js`, geroep uit App.jsx se `payment=success`).
 *
 * Dewald, 10 Oktober 2026, ná drie skenkings sonder 'n dankie-e-pos: *"Sodra
 * hulle terug kom... en die thankyou message wys... kan die epos mos ook
 * gestuur word."* Hy is reg. Die ITN is die pad wat ons NIE kan sien nie — as
 * PayFast ons nie bereik nie (die notify_url-fout), is daar stilte. Die
 * terugkeer is die pad wat ons WEL sien: die mens staan voor die dankie.
 *
 * ── Nooit twee nie ──
 *
 * Kom albei aan, mag die mens net EEN e-pos kry. `skenk_dankie/<e-pos>_<tipe>`
 * hou wanneer laas gestuur is; binne `VENSTER_MS` (30 min) stuur ons nie weer
 * nie. Dertig minute, nie 'n dag nie: "Skenk weer" bestaan, en wie môre weer
 * gee, verdien weer 'n dankie.
 *
 * Die terugkeer-eindpunt is oop (die app roep dit sonder geheim), en ons kan
 * nie bewys dat 'n betaling agter die versoek sit nie. Die skade is begrens:
 * 'n dankie-e-pos, hoogstens een per adres per 30 minute, met vaste woorde.
 *
 * Die Afrikaanse woorde is WOORD VIR WOORD wat in payfast-itn.js gestaan het. */
const crypto = require('crypto')
const engels = require('./_eposEngels.js')

const VENSTER_MS = 30 * 60 * 1000
const TIPES = ['donation', 'subscription']

async function kryToken() {
  const now    = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const claim  = Buffer.from(JSON.stringify({
    iss:   process.env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud:   'https://oauth2.googleapis.com/token',
    iat:   now,
    exp:   now + 3600,
  })).toString('base64url')
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(`${header}.${claim}`)
  const sig = sign.sign(privateKey, 'base64url')
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${header}.${claim}.${sig}`,
  })
  const d = await r.json()
  if (!d.access_token) throw new Error('Geen toegangsteken nie')
  return d.access_token
}

function fsUrl(projectId, pad) {
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${pad}`
}

async function fsSkryf(projectId, token, pad, fields) {
  try {
    await fetch(fsUrl(projectId, pad), {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    })
  } catch {}
}

function geldigeEpos(e) {
  return typeof e === 'string' && e.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

const AF_SKENKING = `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#2d2d2d;">
        <div style="background:#5C4E8E;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:28px;">Daaglikse Hoop</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">met Dewald Scheepers</p>
        </div>
        <div style="padding:32px 24px;background:white;border-radius:0 0 12px 12px;border:1px solid #e8e4f0;">
          <p style="font-size:17px;line-height:1.8;margin:0 0 16px;">Goeiedag,</p>
          <p style="font-size:16px;line-height:1.8;margin:0 0 14px;">Baie baie dankie vir die ondersteuning. Ek waardeer dit regtig uit my hart uit.</p>
          <p style="font-size:16px;line-height:1.8;margin:0 0 24px;">Jou ondersteuning help ons om aan te hou om hoop, gebed en God se Woord by mense uit te kry.</p>
          <p style="font-size:16px;line-height:1.8;margin:0 0 28px;">Mag die Here u ryklik seën. 🙏🏻</p>
          <hr style="border:none;border-top:1px solid #e8e4f0;margin:0 0 24px;">
          <p style="margin:0;font-size:15px;line-height:1.6;color:#2d2d2d;">Seënwense</p>
          <p style="margin:4px 0 24px;font-size:15px;font-weight:700;color:#2d2d2d;">Dewald Scheepers</p>
          <p style="color:#aaa;font-size:12px;line-height:1.6;margin:0;">
            Vrae? Kontak ons by
            <a href="mailto:info@dewaldscheepers.com" style="color:#5C4E8E;">info@dewaldscheepers.com</a>
          </p>
        </div>
      </div>
    `
const AF_VENNOOT = `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#2d2d2d;">
          <div style="background:#5C4E8E;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;font-size:28px;">Daaglikse Hoop</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">met Dewald Scheepers</p>
          </div>
          <div style="padding:32px 24px;background:white;border-radius:0 0 12px 12px;border:1px solid #e8e4f0;">
            <p style="font-size:17px;line-height:1.8;margin:0 0 16px;">Goeiedag,</p>
            <p style="font-size:16px;line-height:1.8;margin:0 0 14px;">Dankie dat jy 'n Maandelikse Hoop-Vennoot geword het! Baie baie dankie vir die ondersteuning.</p>
            <p style="font-size:16px;line-height:1.8;margin:0 0 24px;">Ek waardeer dit regtig uit my hart uit. Jou maandelikse bydrae help ons om aan te hou om hoop, gebed en God se Woord by mense uit te kry wat dit elke dag nodig het.</p>
            <p style="font-size:16px;line-height:1.8;margin:0 0 28px;">Mag die Here u ryklik seën. 🙏🏻</p>
            <hr style="border:none;border-top:1px solid #e8e4f0;margin:0 0 24px;">
            <p style="margin:0;font-size:15px;line-height:1.6;color:#2d2d2d;">Seënwense</p>
            <p style="margin:4px 0 24px;font-size:15px;font-weight:700;color:#2d2d2d;">Dewald Scheepers</p>
            <p style="color:#aaa;font-size:12px;line-height:1.6;margin:0;">
              Vrae? Kontak ons by
              <a href="mailto:info@dewaldscheepers.com" style="color:#5C4E8E;">info@dewaldscheepers.com</a>
            </p>
          </div>
        </div>
      `

function inhoud(tipe, isEngels) {
  if (tipe === 'subscription') {
    return isEngels
      ? { onderwerp: engels.vennootDankie().onderwerp, html: engels.vennootDankie().html }
      : { onderwerp: "Dankie dat jy 'n Hoop-Vennoot geword het 🙏", html: AF_VENNOOT }
  }
  return isEngels
    ? { onderwerp: engels.skenkDankie().onderwerp, html: engels.skenkDankie().html }
    : { onderwerp: 'Dankie vir jou ondersteuning 🙏', html: AF_SKENKING }
}

/* Gee { gestuur, rede }. Gooi nooit. */
async function stuurSkenkDankie({ email, isEngels = false, tipe = 'donation', bron = 'itn', pfId = '', bedrag = '', nou = Date.now() }) {
  const adres = String(email || '').toLowerCase().trim()
  if (!geldigeEpos(adres)) return { gestuur: false, rede: 'ongeldige-epos' }
  if (!TIPES.includes(tipe)) return { gestuur: false, rede: 'ongeldige-tipe' }

  const projectId = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
  let token = null
  try { token = await kryToken() } catch (e) { console.error('skenk-dankie auth:', e.message) }

  const slotPad = `skenk_dankie/${Buffer.from(adres).toString('base64').replace(/[^a-zA-Z0-9]/g, '_')}_${tipe}`
  if (token) {
    try {
      const r = await fetch(fsUrl(projectId, slotPad), { headers: { Authorization: `Bearer ${token}` } })
      if (r.ok) {
        const d = await r.json()
        const laas = Date.parse(d.fields?.laas?.timestampValue || '')
        if (Number.isFinite(laas) && nou - laas < VENSTER_MS) return { gestuur: false, rede: 'reeds-gestuur' }
      }
    } catch {}
    /* Die slot gaan VOOR die stuur, sodat twee byna-gelyktydige versoeke
       (ITN + terugkeer) nie albei deur die kyk glip nie. */
    await fsSkryf(projectId, token, slotPad, {
      laas: { timestampValue: new Date(nou).toISOString() },
      bron: { stringValue: bron },
    })
  }

  const { onderwerp, html } = inhoud(tipe, isEngels)
  let gestuur = false, antwoord = ''
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:     'Dewald Scheepers <noreply@dewaldscheepers.com>',
        to:       adres,
        reply_to: 'info@dewaldscheepers.com',
        subject:  onderwerp,
        html,
      }),
    })
    gestuur = r.ok
    antwoord = await r.text().catch(() => '')
    if (!r.ok) console.error('skenk-dankie verwerp:', antwoord)
  } catch (e) {
    antwoord = e.message
    console.error('skenk-dankie fout:', e.message)
  }

  if (token) {
    await fsSkryf(projectId, token, `skenkings/${nou}_${String(pfId || bron).replace(/\W/g, '')}`, {
      email:          { stringValue: adres },
      tipe:           { stringValue: tipe },
      taal:           { stringValue: isEngels ? 'en' : 'af' },
      bron:           { stringValue: bron },
      amount:         { stringValue: String(bedrag || '') },
      paymentId:      { stringValue: String(pfId || '') },
      emailSent:      { booleanValue: gestuur },
      resendResponse: { stringValue: String(antwoord).slice(0, 500) },
      timestamp:      { timestampValue: new Date(nou).toISOString() },
    })
  }
  return { gestuur, rede: gestuur ? 'ok' : 'stuur-fout' }
}

module.exports = { stuurSkenkDankie, geldigeEpos, VENSTER_MS, TIPES }
