/* ── Plak 'n klomp TikTok-skakels en maak clips daarvan ──
 *
 *   POST /api/reels-voeg-by   { skakels: [...] }   of   { plaksel: "…" }
 *     → { gedoen: [...], misluk: [...], oorgeslaan: [...], oor: n }
 *
 * Dewald, 12 September 2026: *"hier is die eerste klomp videos add hulle
 * solank."* — 124 kort skakels, aanmekaar geplak.
 *
 * ── Waarom dit in STUKKE werk ──
 *
 * Elke kort skakel moet OOPGEMAAK word om sy post-ID te wys, en dit is 'n
 * netwerk-versoek van sowat 'n halwe sekonde. Honderd-vier-en-twintig daarvan
 * is 'n minuut, en 'n Vercel-funksie sterf lank voor dit. Dieselfde fout as die
 * oggendkennisgewing se `for`-lus (sien CLAUDE.md).
 *
 * Hierdie eindpunt vat dus 'n HAP: hoogstens `MAKS_PER_HAP` skakels, 'n paar
 * gelyktydig, met 'n begroting oor die hele versoek. Hy sê hoeveel oorbly, en
 * die admin roep hom weer. 'n Mens sien 'n balkie loop in plaas van 'n
 * tydgrens.
 *
 * ── Wat 'n clip word ──
 *
 * `reels/<post-id>` met die post-ID, die bron, en die maker se HANDVATSEL as
 * naam. Daardie naam is nie 'n gerief nie: `magWys()` in reels.js laat 'n clip
 * sonder 'n naam glad nie wys nie — erkenning is 'n hek. Kry ons die handvatsel
 * nie uit die opgeloste adres nie, word die clip NIE geskryf nie, en dit word as
 * 'n mislukking gerapporteer sodat 'n mens dit kan sien.
 *
 * ── Wat dit NIE oorskryf nie ──
 *
 * Die skryf is 'n `update` met 'n `updateMask`, nie 'n vervanging nie. 'n Clip
 * wat reeds bestaan, hou sy `gedeel`-telling, sy `woorde` en enigiets wat 'n
 * mens later byvoeg. Sonder die masker sou 'n tweede lopie elke telling op nul
 * sit, en dan is die "mees gedeelde bo"-rangorde stil weg.
 *
 * Die `datum` word net by 'n NUWE clip geskryf — dit is wat "nuutste bo"
 * beteken, en 'n herhaalde lopie moet nie die hele voer se orde omkeer nie.
 */
import crypto from 'node:crypto'
import { volgSkakel } from './_tiktokVolg.mjs'
import { splitsSkakels } from '../src/data/reelsPlak.js'
import { geldigeId } from '../src/data/reels.js'
import geheim from './_geheim.js'
const { wieMag } = geheim

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'

/* Hoeveel skakels een versoek aanpak, en hoeveel gelyk. Agt gelyk is vriendelik
   teenoor TikTok en klaar 'n hap in sowat 'n sekonde; twintig gelyk laat hulle
   ons begin weier. */
export const MAKS_PER_HAP = 24
const GELYK = 8

/* Die hele versoek se begroting. `maxDuration` in vercel.json is 60; ons hou
   ruim daaronder sodat die antwoord altyd uitkom. */
const BEGROTING_MS = 35000
/* Elke enkele skakel kry minder as die enkel-eindpunt: in 'n klomp is 'n
   stadige skakel se prys dat die ander wag. */
const PER_SKAKEL_MS = 6000

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
  const sig = teken.sign(sleutel, 'base64url')
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${kop}.${eis}.${sig}`,
  })
  const data = await r.json()
  if (!data.access_token) throw new Error('No access token')
  return data.access_token
}

/* Watter van hierdie id's al bestaan. Een lees vir die hele hap, want 124
   enkel-lesings is 124 rondtes. */
async function bestaanAl(token, ids) {
  if (!ids.length) return new Set()
  const wortel = `projects/${PROJECT_ID}/databases/(default)/documents`
  const r = await fetch(
    `https://firestore.googleapis.com/v1/${wortel}:batchGet`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documents: ids.map(id => `${wortel}/reels/${encodeURIComponent(id)}`),
        mask: { fieldPaths: ['bronId'] },
      }),
    }
  )
  if (!r.ok) throw new Error('batchGet ' + r.status)
  const uit = await r.json()
  const daar = new Set()
  for (const ry of Array.isArray(uit) ? uit : []) {
    if (ry && ry.found && ry.found.name) daar.add(ry.found.name.split('/').pop())
  }
  return daar
}

/* Skryf die clips. 'n `update` met 'n `updateMask` — sien die kop. */
async function skryfClips(token, clips) {
  if (!clips.length) return
  const wortel = `projects/${PROJECT_ID}/databases/(default)/documents`
  const skrywes = clips.map(c => {
    const velde = {
      bron:       { stringValue: 'tiktok' },
      bronId:     { stringValue: c.id },
      naam:       { stringValue: c.naam },
      handvatsel: { stringValue: c.handvatsel },
    }
    /* Net by 'n NUWE clip. 'n Herhaalde lopie mag nie die voer se orde omkeer
       nie. */
    if (c.nuut) velde.datum = { timestampValue: new Date().toISOString() }
    return {
      update: { name: `${wortel}/reels/${encodeURIComponent(c.id)}`, fields: velde },
      updateMask: { fieldPaths: Object.keys(velde) },
    }
  })
  const r = await fetch(
    `https://firestore.googleapis.com/v1/${wortel}:commit`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ writes: skrywes }),
    }
  )
  if (!r.ok) throw new Error('commit ' + r.status)
}

/* Loop 'n lys met hoogstens `gelyk` op 'n slag. Nie `Promise.all` oor 124 nie —
   dit is 124 gelyktydige versoeke na TikTok en die eerste ding wat gebeur, is
   dat hulle ons weier. */
async function inGroepe(lys, gelyk, doen) {
  const uit = []
  for (let i = 0; i < lys.length; i += gelyk) {
    const stuk = lys.slice(i, i + gelyk)
    uit.push(...await Promise.all(stuk.map(doen)))
  }
  return uit
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ fout: 'Net POST' })
  }
  if (!wieMag(req)) return res.status(401).json({ fout: 'Nee' })

  let lyf = req.body
  if (typeof lyf === 'string') { try { lyf = JSON.parse(lyf) } catch { lyf = null } }
  if (!lyf || typeof lyf !== 'object') return res.status(400).json({ fout: 'geen data nie' })

  /* Albei vorme: 'n klaar-gesplitste lys, of die rou plaksel. Die SPLITSER is
     dieselfde een as die admin se — twee splitsers en die admin wys 124 waar
     die bediener 1 sien. */
  const rou = Array.isArray(lyf.skakels)
    ? lyf.skakels.map(s => String(s || ''))
    : splitsSkakels(lyf.plaksel)
  const alles = splitsSkakels(rou.join('\n'))
  if (!alles.length) return res.status(400).json({ fout: 'Geen TikTok-skakels gevind' })

  const hap = alles.slice(0, MAKS_PER_HAP)
  const oor = alles.length - hap.length

  if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    return res.status(500).json({ fout: 'diensrekening ontbreek' })
  }

  const sluitTyd = Date.now() + BEGROTING_MS
  const misluk = []
  const opgelos = []

  await inGroepe(hap, GELYK, async (skakel) => {
    if (Date.now() > sluitTyd) { misluk.push({ skakel, fout: 'Tyd het uitgeloop' }); return }
    const uit = await volgSkakel(skakel, { begroting: PER_SKAKEL_MS })
    if (!uit.ok) { misluk.push({ skakel, fout: uit.fout }); return }
    if (!geldigeId(uit.id)) { misluk.push({ skakel, fout: 'Onbruikbare id' }); return }
    /* Geen handvatsel, geen clip. Erkenning is 'n hek, nie 'n versiering nie —
       sien `magWys()` in reels.js. */
    if (!uit.handvatsel) { misluk.push({ skakel, fout: 'Kon nie die maker se naam kry nie' }); return }
    opgelos.push({ skakel, id: uit.id, handvatsel: uit.handvatsel })
  })

  let gedoen = []
  const oorgeslaan = []
  try {
    const token = await kryToken()
    /* Dieselfde video kan twee keer in een plaksel wees onder twee kort
       skakels; ontdubbel op die ID en nie op die skakel nie. */
    const perId = new Map()
    for (const o of opgelos) if (!perId.has(o.id)) perId.set(o.id, o)

    const ids = [...perId.keys()]
    const daar = await bestaanAl(token, ids)

    const clips = []
    for (const o of perId.values()) {
      const nuut = !daar.has(o.id)
      if (!nuut) oorgeslaan.push({ skakel: o.skakel, id: o.id })
      clips.push({ id: o.id, naam: o.handvatsel, handvatsel: o.handvatsel, nuut })
    }
    await skryfClips(token, clips)
    gedoen = clips.filter(c => c.nuut).map(c => ({ id: c.id, naam: c.naam }))
  } catch (e) {
    console.warn('[reels-voeg-by] kon nie skryf nie:', e.message)
    return res.status(500).json({ fout: e.message, opgelos: opgelos.length, misluk })
  }

  return res.status(200).json({
    gedoen,
    oorgeslaan,
    misluk,
    /* Wat die admin nog moet stuur. Hy stuur die res weer en ons hou aan. */
    oor,
    volgende: alles.slice(hap.length),
  })
}
