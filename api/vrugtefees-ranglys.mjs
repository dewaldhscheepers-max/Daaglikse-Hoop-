/* ────────────────────────────────────────────────────────────
   Vrugtefees — die Oesmeesters se ranglys.

   Die verskil tussen hierdie lêer en Bou die Ark se ranglys is die hele
   punt van fase 3.

   Die Ark se bediener moes RAAI. Dit kon net vra "is veertig lyne met
   twaalf stukke fisies moontlik?" — 'n heuristiek. 'n Mens wat mooi lieg,
   kom deur.

   Hier raai ons nie. Die match-3-enjin is deterministies: dieselfde saad
   en dieselfde skuiwe gee altyd dieselfde bord en dieselfde punte. Die
   kliënt stuur die saad en sy lys skuiwe — en NIE sy puntetelling nie. Ons
   speel die lopie oor met presies dieselfde kode wat die speler gespeel
   het, en tel die punte self. Wat ons kry, is wat tel.

   Om te bedrieg moet jy dus 'n bot skryf wat werklik goed match-3 speel.
   Op daardie punt het jy die spel eerliker gewen as die meeste mense.

   Twee borde:

     · Oesmeesters — die beste lopie ooit. Die speler kies sy eie saad,
       dus kan iemand met 'n bot sade sit en soek tot 'n gunstige een kom.
       Ons wil dit nie wegsteek nie: hierdie bord is 'n persoonlike beste.

     · Vandag se Oes — die saad kom uit die datum in UTC. Almal ter wereld
       speel presies dieselfde bord, en die bediener bereken die saad self
       uit die dag, dus kan niemand 'n gunstige een kies nie. Dit is die
       eerlike geveg.

   Firestore weier kliënte om aan albei versamelings te raak. Die enigste
   pad in en uit is hierdie lêer.
   ──────────────────────────────────────────────────────────── */

import crypto from 'node:crypto'
import { herspeel, dagSleutel, dagSaad, isDagSleutel } from '../src/game/vrugtefees/oes.js'
import { herspeelVlak, AANTAL_VLAKKE } from '../src/game/vrugtefees/reis.js'

const MEESTERS = 'vfOesmeesters'
const DAGOES   = 'vfDagoes'
const TUINREIS = 'vfTuinreis'
const TOP_N    = 20

/* ── Firestore-toegang met die diensrekening ── */
async function kryToken() {
  const nou = Math.floor(Date.now() / 1000)
  const kop = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const eis = Buffer.from(JSON.stringify({
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
   Presies soos by die Ark: die uid kom UIT die token, nooit uit die
   versoek se liggaam nie, sodat niemand as iemand anders kan instuur nie. */
let _serts = { tot: 0, data: null }

async function haalSerts() {
  if (_serts.data && Date.now() < _serts.tot) return _serts.data
  const r = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com')
  if (!r.ok) throw new Error('kon nie sertifikate haal nie')
  const data = await r.json()
  const m = (r.headers.get('cache-control') || '').match(/max-age=(\d+)/)
  _serts = { tot: Date.now() + (m ? Number(m[1]) : 3600) * 1000, data }
  return data
}

export async function verifieerIdToken(token, projekId) {
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
  if (!(eis.iat <= nou + 300)) return null

  const serts = await haalSerts()
  const sert = serts[kop.kid]
  if (!sert) return null

  const nagaan = crypto.createVerify('RSA-SHA256')
  nagaan.update(`${kopB64}.${eisB64}`)
  try {
    if (!nagaan.verify(sert, Buffer.from(handtekening, 'base64url'))) return null
  } catch { return null }

  return eis.sub
}

/* ── Naam ──
   Dieselfde reëls as die Ark s'n. Spasies, syfers en Afrikaanse leestekens
   bly toegelaat; beheerkarakters en enigiets wat na merktaal lyk, nie. */
export function skoonNaam(n) {
  if (typeof n !== 'string') return null
  const s = n.trim().replace(/\s+/g, ' ')
  if (s.length < 1 || s.length > 20) return null
  if (/[\u0000-\u001f\u007f<>&"`\\]/.test(s)) return null
  return s
}

/* ── Keur 'n ingestuurde lopie ──
   Hier is niks heuristies aan nie: ons speel dit oor. Die enigste ding wat
   ons vooraf keer, is 'n versoek wat so groot is dat dit die bediener sou
   laat sit. */
export const MAKS_SKUIWE = 3000

export function keurLopie(lyf, nouDatum) {
  if (!lyf || typeof lyf !== 'object') return { fout: 'geen lopie' }

  const soort = lyf.soort
  if (soort !== 'oneindig' && soort !== 'daagliks' && soort !== 'tuinreis')
    return { fout: 'onbekende soort' }

  if (!Array.isArray(lyf.skuiwe)) return { fout: 'geen skuiwe' }
  if (lyf.skuiwe.length < 1) return { fout: 'geen skuiwe' }
  if (lyf.skuiwe.length > MAKS_SKUIWE) return { fout: 'te veel skuiwe' }

  /* ── Die Tuinreis ──
     Die fase se saad staan in die data wat die bediener SELF het. Die kliënt
     stuur net die fasenommer en sy skuiwe; ons bou daardie presiese bord en
     speel dit oor. 'n Lys skuiwe wat die fase nie klaarmaak nie, tel nie —
     hoeveel punte dit ook al opgetel het. */
  if (soort === 'tuinreis') {
    const uit = herspeelVlak(lyf.vlak, lyf.skuiwe)
    if (!uit.ok) return { fout: uit.fout }
    return { soort, vlak: uit.vlak, punte: uit.punte, skuiwe: uit.skuiwe, rondes: 0 }
  }

  let saad, dag = null

  if (soort === 'daagliks') {
    /* Die kliënt sê vir watter dag dit is, maar ons bereken die saad self
       uit daardie dag. So kan niemand 'n gunstige bord kies nie. En dit
       moet vandag wees: gister se bord is verby. */
    dag = lyf.dag
    if (!isDagSleutel(dag)) return { fout: 'ongeldige dag' }
    const vandag = dagSleutel(nouDatum)
    if (dag !== vandag) return { fout: 'daardie dag se oes is verby' }
    saad = dagSaad(dag)
  } else {
    saad = lyf.saad
    if (!Number.isInteger(saad) || saad < 0 || saad > 2147483647)
      return { fout: 'ongeldige saad' }
  }

  const uit = herspeel(saad, lyf.skuiwe, { maksSkuiwe: MAKS_SKUIWE })
  if (!uit.ok) return { fout: uit.fout }

  /* Die punte kom uit die herspeel, nooit uit die versoek nie. Al stuur
     die kliënt 'n puntetelling saam, kyk ons nie daarna nie. */
  return { soort, dag, saad, punte: uit.punte, rondes: uit.rondes, skuiwe: uit.skuiwe }
}

/* ── Firestore se REST-vorm ── */
const uitVeld = v => {
  if (!v) return null
  if ('integerValue' in v) return Number(v.integerValue)
  if ('doubleValue' in v) return Number(v.doubleValue)
  if ('stringValue' in v) return v.stringValue
  if ('timestampValue' in v) return v.timestampValue
  // Die Tuinreis hou 'n beste punt per fase in 'n kaart.
  if ('mapValue' in v) {
    const uit = {}
    for (const [k, x] of Object.entries((v.mapValue && v.mapValue.fields) || {})) uit[k] = uitVeld(x)
    return uit
  }
  return null
}

function uitDok(d) {
  const f = d.fields || {}
  return {
    uid:    (d.name || '').split('/').pop(),
    naam:   uitVeld(f.naam) || 'Anoniem',
    punte:  uitVeld(f.punte) || 0,
    rondes: uitVeld(f.rondes) || 0,
    dag:    uitVeld(f.dag) || null,
    hoogste: uitVeld(f.hoogste) || 0,
    vlakke: uitVeld(f.vlakke) || {},
    opgedateer: uitVeld(f.opgedateer) || null,
  }
}

/* Die Tuinreis word anders gerangskik: hoe VER jy is tel eerste, en punte
   skei net gelykes. Dit is wat 'n mens van 'n reis wil weet. */
export function rangordeReis(a, b) {
  if ((b.hoogste || 0) !== (a.hoogste || 0)) return (b.hoogste || 0) - (a.hoogste || 0)
  return (b.punte || 0) - (a.punte || 0)
}

// Punte eerste — die oes gaan oor hoeveel jy ingebring het.
export function rangorde(a, b) {
  if (b.punte !== a.punte) return b.punte - a.punte
  return (b.rondes || 0) - (a.rondes || 0)
}

async function haalLys(projekId, token, versameling, dag = null) {
  const r = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projekId}/databases/(default)/documents/${versameling}?pageSize=1000`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!r.ok) throw new Error('kon nie die lys lees nie')
  const d = await r.json()
  let lys = (d.documents || []).map(uitDok)
  /* Vandag se bord hou net vandag se lopies. Gister se rye bly staan maar
     pas nie meer nie, dus maak die bord homself skoon sonder dat ons rye
     hoef uit te vee. */
  if (dag) lys = lys.filter(e => e.dag === dag)
  return lys.sort(versameling === TUINREIS ? rangordeReis : rangorde)
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(204).end()

  const projekId = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
  const vandag = dagSleutel(new Date())

  /* ── Lees ── */
  if (req.method === 'GET') {
    try {
      const token = await kryToken()
      const [meesters, dagLys, reisLys] = await Promise.all([
        haalLys(projekId, token, MEESTERS),
        haalLys(projekId, token, DAGOES, vandag),
        haalLys(projekId, token, TUINREIS),
      ])
      res.setHeader('Cache-Control', 'public, max-age=20')
      return res.status(200).json({
        ok: true,
        dag: vandag,
        dagSaad: dagSaad(vandag),
        meesters: meesters.slice(0, TOP_N),
        meestersTotaal: meesters.length,
        daagliks: dagLys.slice(0, TOP_N),
        daagliksTotaal: dagLys.length,
        tuinreis: reisLys.slice(0, TOP_N),
        tuinreisTotaal: reisLys.length,
        aantalVlakke: AANTAL_VLAKKE,
      })
    } catch {
      /* Nooit 'n leë lys as die waarheid aanbied nie. Die app moet weet dit
         was 'n fout, sodat dit dit so kan wys eerder as "niemand speel nie". */
      return res.status(503).json({ ok: false, fout: 'ranglys onbeskikbaar' })
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ ok: false, fout: 'metode nie toegelaat' })

  let lyf = req.body
  if (typeof lyf === 'string') { try { lyf = JSON.parse(lyf) } catch { lyf = null } }
  if (!lyf) return res.status(400).json({ ok: false, fout: 'geen data' })

  const naam = skoonNaam(lyf.naam)
  if (!naam) return res.status(400).json({ ok: false, fout: 'naam moet 1 tot 20 karakters wees' })

  // Speel die lopie oor voordat ons enigiets anders doen.
  const keur = keurLopie(lyf, new Date())
  if (keur.fout) return res.status(400).json({ ok: false, fout: keur.fout })

  let uid
  try {
    uid = await verifieerIdToken(lyf.idToken, projekId)
  } catch {
    return res.status(503).json({ ok: false, fout: 'kon nie die aanmelding nagaan nie' })
  }
  if (!uid) return res.status(401).json({ ok: false, fout: 'aanmelding nie geldig nie' })

  const versameling = keur.soort === 'daagliks' ? DAGOES
                    : keur.soort === 'tuinreis' ? TUINREIS
                    : MEESTERS

  try {
    const token = await kryToken()
    const basis = `https://firestore.googleapis.com/v1/projects/${projekId}/databases/(default)/documents/${versameling}`

    // Ons oorskryf net as dit werklik beter is.
    const bestaandeR = await fetch(`${basis}/${uid}`, { headers: { Authorization: `Bearer ${token}` } })
    let beterAs = true
    if (bestaandeR.ok && keur.soort !== 'tuinreis') {
      const oud = uitDok(await bestaandeR.clone().json())
      // By die daaglikse bord tel gister se punt nie as 'n rekord nie.
      if (keur.soort === 'daagliks' && oud.dag !== keur.dag) beterAs = true
      else beterAs = rangorde({ punte: keur.punte, rondes: keur.rondes }, oud) < 0
    }

    /* Die Tuinreis werk anders as die twee oes-borde. Daar is nie EEN lopie
       nie: elke fase is sy eie bewys. Ons hou dus 'n beste punt per fase, en
       lei 'hoogste' en die totaal daaruit af. So kan 'n mens 'n ou fase weer
       beter speel sonder om sy vordering te verloor, en kan niemand punte
       opblaas deur fase 1 honderd keer in te stuur nie — net sy BESTE tel. */
    if (keur.soort === 'tuinreis') {
      const oud = bestaandeR.ok ? uitDok(await bestaandeR.clone().json()) : { vlakke: {} }
      const vlakke = { ...(oud.vlakke || {}) }
      const sleutel = String(keur.vlak)
      const vorige = vlakke[sleutel] || 0
      beterAs = keur.punte > vorige
      vlakke[sleutel] = Math.max(vorige, keur.punte)

      const hoogste = Object.keys(vlakke).reduce((a, k) => Math.max(a, Number(k) || 0), 0)
      const totaal  = Object.values(vlakke).reduce((a, n) => a + (Number(n) || 0), 0)

      const kaart = {}
      for (const [k, n] of Object.entries(vlakke)) kaart[k] = { integerValue: String(n) }

      const skryf = await fetch(`${basis}/${uid}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: {
          naam:       { stringValue: naam },
          hoogste:    { integerValue: String(hoogste) },
          punte:      { integerValue: String(totaal) },
          vlakke:     { mapValue: { fields: kaart } },
          opgedateer: { timestampValue: new Date().toISOString() },
        } }),
      })
      if (!skryf.ok) throw new Error('skryf het misluk')
    } else if (beterAs) {
      const velde = {
        naam:       { stringValue: naam },
        punte:      { integerValue: String(keur.punte) },
        rondes:     { integerValue: String(keur.rondes) },
        skuiwe:     { integerValue: String(keur.skuiwe) },
        opgedateer: { timestampValue: new Date().toISOString() },
      }
      if (keur.soort === 'daagliks') velde.dag = { stringValue: keur.dag }
      else velde.saad = { integerValue: String(keur.saad) }

      const skryf = await fetch(`${basis}/${uid}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: velde }),
      })
      if (!skryf.ok) throw new Error('skryf het misluk')
    }

    const lys = await haalLys(projekId, token, versameling, keur.soort === 'daagliks' ? keur.dag : null)
    const rang = lys.findIndex(e => e.uid === uid) + 1
    return res.status(200).json({
      ok: true,
      beterAs,
      soort: keur.soort,
      punte: keur.punte,
      rondes: keur.rondes,
      vlak: keur.vlak || null,
      rang: rang || null,
      totaal: lys.length,
      lys: lys.slice(0, TOP_N),
    })
  } catch {
    return res.status(503).json({ ok: false, fout: 'kon nie stoor nie' })
  }
}
