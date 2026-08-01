/* ────────────────────────────────────────────────────────────
   Bou die Ark — die wêreldwye ranglys.

   Hierdie is die enigste plek waar 'n punt op die ranglys kan beland.
   Die Firestore-reëls verbied kliënte om na arkRanglys te skryf, dus
   moet alles hierdeur. Twee dinge gebeur hier voordat 'n punt tel:

     1. Ons verifieer die speler se Firebase ID-token teen Google se
        publieke sertifikate. Die uid kom UIT die token, nooit uit die
        versoek se liggaam nie, sodat niemand as iemand anders kan
        instuur nie.

     2. Ons kyk of die lopie fisies moontlik is. 'n Mens kan nie 40 lyne
        met 12 stukke maak nie, en nie 'n miljoen punte in tien sekondes
        verdien nie. Ons meet nie vaardigheid nie — ons weier net wat
        onmoontlik is.

   Ons kan nie bewys dat iemand werklik gespeel het nie. Wat ons wel kan
   doen, is die maklike bedrog duur maak.
   ──────────────────────────────────────────────────────────── */

const crypto = require('crypto')

const VERSAMELING = 'arkRanglys'
const TOP_N       = 50

/* ── Firestore-toegang met die diensrekening ── */
async function kryToken() {
  const nou    = Math.floor(Date.now() / 1000)
  const kop    = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const eis    = Buffer.from(JSON.stringify({
    iss:   process.env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud:   'https://oauth2.googleapis.com/token',
    iat:   nou,
    exp:   nou + 3600,
  })).toString('base64url')
  const sleutel = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  const teken = crypto.createSign('RSA-SHA256')
  teken.update(`${kop}.${eis}`)
  const jwt = `${kop}.${eis}.${teken.sign(sleutel, 'base64url')}`

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  })
  const d = await r.json()
  if (!d.access_token) throw new Error('geen toegangstoken')
  return d.access_token
}

/* ── Verifieer die speler se Firebase ID-token ──
   Google se publieke sertifikate roteer, dus haal ons hulle en hou hulle
   solank die kop se max-age dit toelaat. */
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

async function verifieerIdToken(token, projekId) {
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
  if (!(eis.iat <= nou + 300)) return null       // klein toegewing vir horlosies

  const serts = await haalSerts()
  const sert  = serts[kop.kid]
  if (!sert) return null

  const nagaan = crypto.createVerify('RSA-SHA256')
  nagaan.update(`${kopB64}.${eisB64}`)
  let geldig = false
  try {
    geldig = nagaan.verify(sert, Buffer.from(handtekening, 'base64url'))
  } catch { return null }
  if (!geldig) return null

  return eis.sub
}

/* ── Is hierdie lopie fisies moontlik? ──
   Die bord is 10 wyd, elke stuk het 4 blokkies, dus verg elke lyn ten
   minste 2.5 stukke. 'n Skoonmaak van vier rye gee 800 punte, dit is 200
   per lyn, maal die stadium. Sagte en harde val gee hoogstens 38 punte
   per stuk. Ons is oral ruim: die doel is om die onmoontlike te weier,
   nie om goeie spel te straf nie. */
const PERK = {
  punte:   50000000,
  stadium: 500,
  lyne:    100000,
  stukke:  500000,
  speelMs: 24 * 3600 * 1000,
}

function heelGetal(v, maks) {
  return Number.isInteger(v) && v >= 0 && v <= maks
}

function keurLopie(l) {
  if (!l || typeof l !== 'object') return 'geen lopie'
  if (!heelGetal(l.punte, PERK.punte))     return 'punte buite perke'
  if (!heelGetal(l.lyne, PERK.lyne))       return 'lyne buite perke'
  if (!heelGetal(l.stukke, PERK.stukke))   return 'stukke buite perke'
  if (!heelGetal(l.speelMs, PERK.speelMs)) return 'speeltyd buite perke'
  if (!Number.isInteger(l.stadium) || l.stadium < 1 || l.stadium > PERK.stadium) return 'stadium buite perke'

  if (l.stukke < Math.ceil(l.lyne * 2.5)) return 'te min stukke vir soveel lyne'

  /* Tempo. Die beste spelers ter wereld plaas omtrent drie stukke per
     sekonde in 'n uitbarsting en heelwat minder oor 'n hele spel. Ons laat
     agt per sekonde toe, met drie sekondes se speling sodat 'n kort vinnige
     lopie nie geraak word nie. Dieselfde vir lyne: 2.5 per sekonde is ver bo
     wat 'n mens volhou. Die doel bly om die onmoontlike te weier. */
  if (l.speelMs < Math.max(0, l.stukke * 120 - 3000)) return 'te vinnig vir soveel stukke'
  if (l.speelMs < l.lyne * 400)                       return 'te vinnig vir soveel lyne'

  const maksPunte = l.lyne * 200 * l.stadium + l.stukke * 38
  if (l.punte > maksPunte) return 'meer punte as moontlik'

  // Elke stadium verg werklike vordering: 'n lyn, of tyd vir die
  // oorleef-doelwitte. Ruim gestel op een stadium per 20 sekondes.
  if (l.stadium > 1 + l.lyne + Math.floor(l.speelMs / 20000)) return 'stadium te hoog vir die lopie'

  return null
}

/* ── Naam ── */
function skoonNaam(n) {
  if (typeof n !== 'string') return null
  const s = n.trim().replace(/\s+/g, ' ')
  if (s.length < 1 || s.length > 20) return null
  // Geen beheerkarakters nie, en niks wat na merktaal lyk nie. Spasies,
  // syfers en Afrikaanse leestekens bly toegelaat.
  if (/[\u0000-\u001f\u007f<>&"`\\]/.test(s)) return null
  return s
}

/* ── Firestore se REST-vorm ── */
const uitVeld = v => {
  if (!v) return null
  if ('integerValue' in v) return Number(v.integerValue)
  if ('doubleValue'  in v) return Number(v.doubleValue)
  if ('stringValue'  in v) return v.stringValue
  if ('timestampValue' in v) return v.timestampValue
  return null
}

function uitDok(d) {
  const f = d.fields || {}
  return {
    uid:     (d.name || '').split('/').pop(),
    naam:    uitVeld(f.naam) || 'Anoniem',
    punte:   uitVeld(f.punte) || 0,
    stadium: uitVeld(f.stadium) || 1,
    lyne:    uitVeld(f.lyne) || 0,
    opgedateer: uitVeld(f.opgedateer) || null,
  }
}

// Stadium eerste, dan punte — die spel gaan oor hoe ver die ark gebou is.
function rangorde(a, b) {
  if (b.stadium !== a.stadium) return b.stadium - a.stadium
  return b.punte - a.punte
}

async function haalLys(projekId, token) {
  const r = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projekId}/databases/(default)/documents/${VERSAMELING}?pageSize=1000`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!r.ok) throw new Error('kon nie die lys lees nie')
  const d = await r.json()
  return (d.documents || []).map(uitDok).sort(rangorde)
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(204).end()

  const projekId = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'

  /* ── Lees ── */
  if (req.method === 'GET') {
    try {
      const token = await kryToken()
      const lys   = await haalLys(projekId, token)
      res.setHeader('Cache-Control', 'public, max-age=20')
      return res.status(200).json({ ok: true, lys: lys.slice(0, TOP_N), totaal: lys.length })
    } catch (e) {
      // Nooit 'n leë lys as die waarheid aanbied nie — die app moet weet
      // dat dit 'n fout was, sodat dit dit so kan wys.
      return res.status(503).json({ ok: false, fout: 'ranglys onbeskikbaar' })
    }
  }

  /* ── Skryf ── */
  if (req.method !== 'POST') return res.status(405).json({ ok: false, fout: 'metode nie toegelaat' })

  let lyf = req.body
  if (typeof lyf === 'string') { try { lyf = JSON.parse(lyf) } catch { lyf = null } }
  if (!lyf) return res.status(400).json({ ok: false, fout: 'geen data' })

  const naam = skoonNaam(lyf.naam)
  if (!naam) return res.status(400).json({ ok: false, fout: 'naam moet 1 tot 20 karakters wees' })

  const rede = keurLopie(lyf.lopie)
  if (rede) return res.status(400).json({ ok: false, fout: rede })

  let uid
  try {
    uid = await verifieerIdToken(lyf.idToken, projekId)
  } catch {
    return res.status(503).json({ ok: false, fout: 'kon nie die aanmelding nagaan nie' })
  }
  if (!uid) return res.status(401).json({ ok: false, fout: 'aanmelding nie geldig nie' })

  const l = lyf.lopie

  try {
    const token = await kryToken()
    const basis = `https://firestore.googleapis.com/v1/projects/${projekId}/databases/(default)/documents/${VERSAMELING}`

    // Bestaande inskrywing — ons oorskryf net as dit werklik beter is.
    const bestaandeR = await fetch(`${basis}/${uid}`, { headers: { Authorization: `Bearer ${token}` } })
    let beterAs = true
    if (bestaandeR.ok) {
      const oud = uitDok(await bestaandeR.json())
      beterAs = rangorde({ stadium: l.stadium, punte: l.punte }, oud) < 0
    }

    if (beterAs) {
      const skryf = await fetch(`${basis}/${uid}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            naam:       { stringValue: naam },
            punte:      { integerValue: String(l.punte) },
            stadium:    { integerValue: String(l.stadium) },
            lyne:       { integerValue: String(l.lyne) },
            stukke:     { integerValue: String(l.stukke) },
            speelMs:    { integerValue: String(l.speelMs) },
            opgedateer: { timestampValue: new Date().toISOString() },
          },
        }),
      })
      if (!skryf.ok) throw new Error('skryf het misluk')
    }

    const lys  = await haalLys(projekId, token)
    const rang = lys.findIndex(e => e.uid === uid) + 1
    return res.status(200).json({
      ok: true,
      beterAs,
      rang: rang || null,
      totaal: lys.length,
      lys: lys.slice(0, TOP_N),
    })
  } catch (e) {
    return res.status(503).json({ ok: false, fout: 'kon nie stoor nie' })
  }
}

// Blootgestel sodat die toetse die reëls direk kan naloop. Vercel gebruik
// net die verstek-uitvoer hierbo.
module.exports.keurLopie = keurLopie
module.exports.skoonNaam = skoonNaam
module.exports.rangorde  = rangorde
