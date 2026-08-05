/* ────────────────────────────────────────────────────────────
   Die admin se slot.

     POST /api/sorg-sluit   met die wagwoord in die X-Sorg-Geheim-kop
       → { ok: true }                    dit is reg
       → { ok: false, opgestel: false }  daar is nog geen wagwoord op Vercel

   Hoekom hierdie lêer bestaan:

   Die admin het 'n PIN gehad wat IN DIE KODE gestaan het ('2025'). Dit
   beskerm niks. Die app se lêers is openbaar — enigiemand kan hulle oopmaak
   en die PIN lees, en dit vat sowat dertig sekondes. 'n Langer wagwoord in
   dieselfde plek is presies net so oop; hy lyk net sterker.

   Nou werk dit soos 'n wagwoord hoort te werk: die app weet dit NIE. Dewald
   tik dit, ons stuur dit hierheen, en die bediener vergelyk dit met
   SORG_ADMIN_GEHEIM wat net op Vercel bestaan. Wie die app se kode lees, kry
   niks.

   Die vergelyking loop in konstante tyd (`magSkryf`), sodat 'n mens dit nie
   letter vir letter kan raai deur te meet hoe lank die antwoord vat nie.

   Daar is met opset GEEN pad in hierdie lêer wat 'ja' antwoord sonder die
   regte wagwoord nie. Is die veranderlike nie opgestel nie, sê ons dit
   reguit — dan weet Dewald wat om te doen — maar ons maak niks oop nie.
   ──────────────────────────────────────────────────────────── */

import crypto from 'node:crypto'
import { magSkryf, MIN_WAGWOORD, leesDok, skryfDok } from './_sorgFirestore.mjs'

const SLOT = 'sorg_slot'
const MAKS_POGINGS = 8
const VENSTER_MS = 15 * 60 * 1000

/* 'n Stadige antwoord maak raai duur. Dit is nie 'n groot beskerming nie,
   maar dit kos niks en dit maak duisende pogings per minuut onprakties. */
function wag(ms) {
  return new Promise(r => setTimeout(r, ms))
}

/* ── Die perk op raaipogings ──

   Die wagwoord staan nou nerens in die app nie, en dit is die belangrikste
   ding. Maar 'n mens kan steeds RAAI, en agter hierdie deur le mense se
   mishandeling en hul selfmoordgedagtes.

   Agt pogings per kwartier per adres. Daarna is dit toe, ook al is die
   wagwoord reg — anders sou 'n aanvaller wat op poging 4000 die regte een
   raai, net deurgaan.

   Die telling le in Firestore en nie in die geheue nie: Vercel se funksies
   leef 'n paar minute en dan is 'n telling in die geheue weg. Dit is presies
   wat 'n mens NIE wil he by 'n slot nie. */
function hasAdres(req) {
  const rou = String(
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    (req.socket && req.socket.remoteAddress) || ''
  ).split(',')[0].trim()
  if (!rou) return 'onbekend'
  const sout = process.env.SORG_SOUT || 'daaglikse-hoop-sorg'
  return crypto.createHash('sha256').update(sout + ':slot:' + rou).digest('hex').slice(0, 24)
}

async function isToe(id) {
  try {
    const d = await leesDok(SLOT, id)
    if (!d) return false
    const tot = Number(d.tot) || 0
    /* Die venster is verby — begin skoon. */
    if (Date.now() > tot) return false
    return (Number(d.pogings) || 0) >= MAKS_POGINGS
  } catch {
    /* Kan ons nie by die telling kom nie, sluit ons NIE toe nie. 'n Stukkende
       databasis mag nie Dewald uit sy eie admin hou nie; die stadige antwoord
       en die wagwoord self staan nog. */
    return false
  }
}

async function telMis(id) {
  try {
    const d = await leesDok(SLOT, id)
    const tot = Number(d && d.tot) || 0
    const vars = !d || Date.now() > tot
    await skryfDok(SLOT, id, {
      pogings: vars ? 1 : (Number(d.pogings) || 0) + 1,
      tot: vars ? Date.now() + VENSTER_MS : tot,
    })
  } catch { /* sien hierbo */ }
}

async function maakSkoon(id) {
  try { await skryfDok(SLOT, id, { pogings: 0, tot: 0 }) } catch {}
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Sorg-Geheim')
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ fout: 'Method Not Allowed' })

  const adres = hasAdres(req)

  /* Eers die slot, DAN die wagwoord. Andersom sou 'n aanvaller wat die regte
     een raai, deurkom ondanks die perk. */
  if (await isToe(adres)) {
    await wag(700)
    return res.status(429).json({
      ok: false,
      toe: true,
      fout: 'Te veel pogings. Wag asseblief \'n kwartier en probeer weer.',
    })
  }

  const mag = magSkryf(req)
  if (mag.ok) {
    await maakSkoon(adres)
    return res.status(200).json({ ok: true })
  }

  await wag(700)
  await telMis(adres)

  /* Ons sê WEL of die veranderlike ontbreek. Dit is nie 'n lek nie — dit lyk
     presies dieselfde vir 'n vreemdeling as vir Dewald — en sonder dit sou
     hy nie weet hoekom die regte wagwoord nie werk nie. */
  const opgestel = !!(process.env.SORG_ADMIN_GEHEIM && process.env.SORG_ADMIN_GEHEIM.length >= MIN_WAGWOORD)
  return res.status(401).json({
    ok: false,
    opgestel,
    fout: opgestel
      ? 'Verkeerde wagwoord.'
      : `Daar is nog geen wagwoord opgestel nie. Stel SORG_ADMIN_GEHEIM op Vercel (minstens ${MIN_WAGWOORD} karakters) en ontplooi weer.`,
  })
}
