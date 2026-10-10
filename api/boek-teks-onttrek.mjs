/* ── Trek 'n Engelse e-boek se teks uit sy PDF vir die LUISTER-knoppie ──
 *
 *   POST /api/boek-teks-onttrek   (x-sorg-geheim)
 *     { bookId: "restless-123" }   → een boek
 *     { backfill: true }           → al die Engelse boeke wat nog nie gedoen is
 *                                    nie, binne 'n tyd-begroting; gee `oor` terug
 *
 * Dewald, 9 Oktober 2026: *"PDF uploaded → automatically extract text → clean →
 * split into chapters → make it available to text-to-speech."* Geen handmatige
 * plak nie. Die admin roep dit NÁ 'n PDF-oplaai (outomaties) en kan dit ook oor
 * die reeds-opgelaaide boeke laat loop (die backfill-knoppie).
 *
 * ── Waarom die bediener en nie die foon nie ──
 *
 * Dit gebeur EEN keer per boek, nie op elke foon nie. Die skoon teks word op die
 * boek gestoor (`luisterTeks`, 'n JSON-string), en elke toestel kry presies
 * dieselfde — ongeag watter blaaier. Die PDF-biblioteek bly op die bediener.
 *
 * ── Waarom 'n JSON-string en nie 'n Firestore-skikking nie ──
 *
 * 'n Skikking van kaarte (titel + teks) in Firestore se REST-vorm is 'n klomp
 * geneste arrayValue/mapValue-struktuur, en die kliënt moet dit weer uitmekaar
 * haal. Een string wat die kliënt `JSON.parse`, is eenvoudiger en kan nie stil
 * 'n veld verloor nie. Dit bly onder Firestore se 1 MB-dokumentperk — sien
 * MAKS_TOTAAL in boekTeks.js.
 *
 * ── Die eerlike terugval ──
 *
 * 'n PDF wat eintlik 'n skandering is, het geen tekslaag nie. Dan stoor ons
 * `luisterStatus: 'geen-teks'` en die admin sien 'n waarskuwing — die LUISTER-
 * knoppie verskyn eenvoudig nie vir daardie boek nie (geen teks, geen knoppie). */

import crypto from 'node:crypto'
import { verwerkBoekTeks } from '../src/data/boekTeks.js'
import { isEngels } from '../src/data/engelsBoeke.js'
import { PDFParse } from 'pdf-parse'
import geheim from './_geheim.js'
const { wieMag } = geheim

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
const WORTEL = `projects/${PROJECT_ID}/databases/(default)/documents`

/* Die hele versoek se begroting. `maxDuration` in vercel.json is 60; ons hou
   ruim daaronder sodat die antwoord altyd uitkom en die admin weer kan roep. */
const BEGROTING_MS = 45000

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

async function haalBoek(token, id) {
  const r = await fetch(`https://firestore.googleapis.com/v1/${WORTEL}/books/${encodeURIComponent(id)}`,
    { headers: { Authorization: `Bearer ${token}` } })
  if (!r.ok) return null
  const d = await r.json()
  const f = d.fields || {}
  return {
    id,
    title:  f.title?.stringValue  || id,
    pdfUrl: f.pdfUrl?.stringValue || null,
    taal:   f.taal?.stringValue   || '',
    status: f.luisterStatus?.stringValue || '',
  }
}

/* Al die Engelse boeke (vir die backfill). */
async function engelseBoeke(token) {
  const r = await fetch(`https://firestore.googleapis.com/v1/${WORTEL}:runQuery`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery: {
      from: [{ collectionId: 'books' }],
      where: { fieldFilter: { field: { fieldPath: 'taal' }, op: 'EQUAL', value: { stringValue: 'en' } } },
    } }),
  })
  if (!r.ok) throw new Error('runQuery ' + r.status)
  const uit = await r.json()
  const boeke = []
  for (const ry of Array.isArray(uit) ? uit : []) {
    if (!ry.document) continue
    const id = ry.document.name.split('/').pop()
    const f = ry.document.fields || {}
    boeke.push({
      id,
      title:  f.title?.stringValue  || id,
      pdfUrl: f.pdfUrl?.stringValue || null,
      taal:   f.taal?.stringValue   || 'en',
      status: f.luisterStatus?.stringValue || '',
    })
  }
  return boeke
}

async function skryfBoek(token, id, velde) {
  const mask = Object.keys(velde).map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&')
  const r = await fetch(
    `https://firestore.googleapis.com/v1/${WORTEL}/books/${encodeURIComponent(id)}?${mask}`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: velde }),
    }
  )
  if (!r.ok) throw new Error('skryf ' + r.status)
}

/* Haal die PDF, trek die teks, en stoor die afdelings (of die geen-teks-vlag).
   Gee 'n kort opsomming terug. Gooi NOOIT — 'n enkele stukkende PDF mag nie 'n
   backfill-lopie omgooi nie. */
async function doenBoek(token, boek) {
  if (!boek || !boek.pdfUrl) {
    return { id: boek?.id, ok: false, rede: 'geen-pdf' }
  }
  let rou = ''
  try {
    const pr = await fetch(boek.pdfUrl)
    if (!pr.ok) return { id: boek.id, ok: false, rede: 'pdf-onbereikbaar' }
    const buf = Buffer.from(await pr.arrayBuffer())
    const parser = new PDFParse({ data: new Uint8Array(buf) })
    const res = await parser.getText()
    rou = res?.text || ''
    try { await parser.destroy?.() } catch {}
  } catch (e) {
    return { id: boek.id, ok: false, rede: 'pdf-fout' }
  }

  const r = verwerkBoekTeks(rou, { titel: boek.title })
  if (!r.ok) {
    await skryfBoek(token, boek.id, {
      luisterStatus: { stringValue: 'geen-teks' },
      luisterTyd:    { timestampValue: new Date().toISOString() },
    })
    return { id: boek.id, ok: false, rede: 'geen-teks' }
  }

  await skryfBoek(token, boek.id, {
    luisterStatus: { stringValue: 'gereed' },
    luisterStukke: { integerValue: String(r.afdelings.length) },
    luisterTeks:   { stringValue: JSON.stringify(r.afdelings) },
    luisterTyd:    { timestampValue: new Date().toISOString() },
  })
  return { id: boek.id, ok: true, stukke: r.afdelings.length }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ fout: 'Net POST' })
  if (!wieMag(req)) return res.status(401).json({ fout: 'Nie toegelaat nie' })

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
  body = body || {}

  let token
  try { token = await kryToken() } catch { return res.status(500).json({ fout: 'Auth' }) }

  // ── Een boek ──
  if (body.bookId) {
    const boek = await haalBoek(token, String(body.bookId))
    if (!boek) return res.status(404).json({ fout: 'Boek nie gevind' })
    /* Net Engelse boeke — die LUISTER-knoppie is net op /english. */
    if (!isEngels(boek)) return res.status(400).json({ fout: 'Nie n Engelse boek nie' })
    const uit = await doenBoek(token, boek)
    return res.status(200).json(uit)
  }

  // ── Backfill: al die Engelse boeke wat nog nie gedoen is nie ──
  if (body.backfill) {
    const begin = Date.now()
    let boeke
    try { boeke = await engelseBoeke(token) } catch { return res.status(500).json({ fout: 'Kon nie boeke lees nie' }) }
    const oorstaande = boeke.filter(b => b.pdfUrl && b.status !== 'gereed' && b.status !== 'geen-teks')
    const gedoen = []
    for (const b of oorstaande) {
      if (Date.now() - begin > BEGROTING_MS) break
      gedoen.push(await doenBoek(token, b))
    }
    const oor = oorstaande.length - gedoen.length
    return res.status(200).json({
      gedoen,
      oor,
      totaalEngels: boeke.length,
      sonderPdf: boeke.filter(b => !b.pdfUrl).length,
    })
  }

  return res.status(400).json({ fout: 'Gee bookId of backfill' })
}
