/* ────────────────────────────────────────────────────────────
   Saamstaan — die gemeenskap onder 'n storie.

     POST /api/sorg-saamstaan { muurId, toestel, reaksie }   → 'n reaksie
     POST /api/sorg-saamstaan { muurId, toestel, woord }     → 'n klaar woord
     POST /api/sorg-saamstaan { muurId, toestel, teks }      → 'n eie woord
     POST /api/sorg-saamstaan { gelees: [muurId, ...] }      → leestellings

   Die reels self staan in `src/data/sorgSaamstaan.js`, wat suiwer is en met
   plain `node` getoets word. Hierdie lêer doen die Firestore-werk.

   ── Wat 'n mens NIE hier mag doen nie ──

   Die kliënt stuur 'n SLEUTEL vir 'n klaargemaakte woord, nooit die teks
   nie. Sou hy die teks stuur, kon iemand met 'n gereedskapstuk enigiets in
   daardie veld sit, en dit sou as 'n klaargemaakte woord verskyn — sonder
   hersiening, want klaargemaakte woorde word mos vertrou. Ons soek die teks
   hier op uit die lys.

   Dieselfde met `sensitief`: dit kom uit die PLASING soos dit in Firestore
   staan, nooit uit die versoek nie. Anders sê 'n aanvaller eenvoudig
   `sensitief: false` en skryf wat hy wil onder 'n selfmoordboodskap.

   ── Die toestel ──

   Nooit rou gestoor nie. Dieselfde has as die res van Sorg, met dieselfde
   sout. Dit is genoeg om 'n dubbele druk te keer en niks meer nie.
   ──────────────────────────────────────────────────────────── */

import crypto from 'node:crypto'
import { lysDokke, leesDok, skryfDok } from './_sorgFirestore.mjs'
import {
  keurReaksie, klaarWoordTeks, woordStatus, REAKSIES,
} from '../src/data/sorgSaamstaan.js'

const MUUR = 'sorg_muur'
const SAAM = 'sorg_saam'
const WOORDE = 'sorg_woorde'

/* Hoeveel woorde 'n toestel per dag mag stuur. Dit is nie 'n straf nie — dit
   keer dat een mens met 'n script die muur volskryf terwyl Dewald slaap. */
const WOORDE_PER_DAG = 20

function hasToestel(t) {
  const s = String(t || '').trim()
  if (!s) return ''
  const sout = process.env.SORG_SOUT || 'daaglikse-hoop-sorg'
  return crypto.createHash('sha256').update(sout + ':' + s).digest('hex').slice(0, 24)
}

function skoonId(x) {
  const s = String(x || '').slice(0, 40)
  return /^[a-zA-Z0-9]+$/.test(s) ? s : ''
}

/* ── 'n Reaksie ──

   Een per toestel per plasing. Die merk le in `sorg_saam` onder dieselfde
   id-vorm as voorheen, sodat wie reeds gedra het, nie weer kan nie — en
   sodat die ou drukke bly staan.

   Wat NIE gebeur nie: 'n mens kan nie sy reaksie verander nie. Dit sou 'n
   aftrek verg, en 'n aftrek op 'n telling wat deur 'n paar toestelle
   gelyktydig verhoog word, is presies waar tellings verkeerd raak. Een
   druk, klaar. */
async function doenReaksie(res, { muurId, toestel, reaksie }) {
  const soort = keurReaksie(reaksie)
  if (!soort) return res.status(400).json({ fout: 'onbekende reaksie' })

  const plasing = await leesDok(MUUR, muurId)
  if (!plasing || plasing.gepubliseer === false) {
    return res.status(404).json({ fout: 'daardie plasing bestaan nie' })
  }

  const merkId = `${muurId}_${toestel}`
  const reeds = await leesDok(SAAM, merkId)
  if (reeds) {
    return res.status(200).json({
      ok: true, reeds: true,
      reaksies: plasing.reaksies || {},
      saam: Number(plasing.saam) || 0,
      myne: reeds.reaksie || '',
    })
  }

  await skryfDok(SAAM, merkId, {
    muurId, toestel, reaksie: soort,
    dag: new Date().toISOString().slice(0, 10),
  })

  const tellings = { ...(plasing.reaksies || {}) }
  tellings[soort] = (Number(tellings[soort]) || 0) + 1
  await skryfDok(MUUR, muurId, { reaksies: tellings }, { velde: ['reaksies'] })

  return res.status(200).json({
    ok: true,
    reaksies: tellings,
    saam: Number(plasing.saam) || 0,
    myne: soort,
  })
}

/* ── 'n Woord van ondersteuning ── */
async function doenWoord(res, { muurId, toestel, woordSleutel, teks }) {
  const plasing = await leesDok(MUUR, muurId)
  if (!plasing || plasing.gepubliseer === false) {
    return res.status(404).json({ fout: 'daardie plasing bestaan nie' })
  }

  /* Uit die PLASING, nooit uit die versoek nie. */
  const sensitief = plasing.sensitief === true

  const almal = await lysDokke(WOORDE, { grootte: 300 })
  const vandag = new Date().toISOString().slice(0, 10)
  const myne = almal.filter(w => w.toestel === toestel)

  if (myne.filter(w => w.dag === vandag).length >= WOORDE_PER_DAG) {
    return res.status(429).json({ fout: 'Jy het vandag genoeg woorde gestuur. Môre is daar weer.' })
  }

  /* ── EEN mens mag meer as een keer praat ──

     Hier het gestaan: het hierdie toestel al 'n woord op hierdie plasing,
     gee `reeds: true` terug en doen niks. Dit het bedoel om spam te keer, en
     dit het iets heeltemal anders gedoen.

     Dewald het 'n tweede opmerking geskryf. Die bediener het `reeds: true`
     gestuur — nie 'n fout nie, nie 'n woord nie, NIKS — en die skerm het 'n
     dankie gewys terwyl daar niks verskyn het nie. Dit was ook nerens om
     goed te keur nie, want dit is nooit gestoor nie. Stil weggegooi.

     'n Gesprek is 'n gesprek: 'n mens kan twee keer iets sê. Die daaglikse
     perk hierbo is die ding wat spam keer, en dit doen dit sonder om iemand
     se woorde te laat verdwyn. */

  let doc

  if (woordSleutel) {
    /* Die teks kom uit die LYS, nooit uit die versoek nie. */
    const klaar = klaarWoordTeks(woordSleutel)
    if (!klaar) return res.status(400).json({ fout: 'onbekende woord' })
    doc = { muurId, toestel, teks: klaar, sleutel: woordSleutel, bron: 'klaar', status: 'wys' }
  } else {
    const uitslag = woordStatus({ teks, sensitief })
    if (uitslag.status === 'weier') {
      const rede = uitslag.rede === 'sensitiewe plasing'
        ? 'Op hierdie storie kan jy een van die woorde hier onder stuur.'
        : 'Skryf net ’n bietjie meer.'
      return res.status(400).json({ fout: rede })
    }
    doc = {
      muurId, toestel, teks: uitslag.teks, sleutel: '', bron: 'eie',
      status: uitslag.status,
      ...(uitslag.rede ? { rede: uitslag.rede } : {}),
    }
  }

  const id = 'w' + Date.now().toString(36) + crypto.randomBytes(3).toString('hex')
  await skryfDok(WOORDE, id, { ...doc, dag: vandag, geskep: new Date(), gerapporteer: 0 })

  return res.status(200).json({
    ok: true,
    wag: doc.status === 'wag',
    woord: doc.status === 'wys' ? { id, teks: doc.teks, bron: doc.bron } : null,
  })
}

/* ── Hoeveel mense het gelees ──

   Die kliënt onthou self watter plasings hierdie toestel al gesien het en
   stuur elkeen net EEN keer. Dit is nie waterdig nie — wie sy berging
   uitvee, tel weer — maar dit is 'n leestelling, nie 'n ranglys nie, en die
   koste van 'n dokument per toestel per plasing is dit nie werd nie.

   Wat wel waterdig moet wees, is die perk: 'n lys van duisend id's mag nie
   duisend skryfwerke maak nie. */
const MAKS_GELEES = 20

async function doenGelees(res, lys) {
  const ids = [...new Set(lys.map(skoonId).filter(Boolean))].slice(0, MAKS_GELEES)
  if (!ids.length) return res.status(200).json({ ok: true, getel: 0 })

  let getel = 0
  for (const id of ids) {
    const p = await leesDok(MUUR, id)
    if (!p || p.gepubliseer === false) continue
    await skryfDok(MUUR, id, { gelees: (Number(p.gelees) || 0) + 1 }, { velde: ['gelees'] })
    getel++
  }
  return res.status(200).json({ ok: true, getel })
}

/* ── Rapporteer ──

   Een druk haal die woord DADELIK van die muur af en sit dit in Dewald se
   hopie. Dit is met opset ongebalanseerd: 'n woord wat verkeerdelik weg is,
   kan hy terugsit, maar 'n woord wat iemand seermaak, mag nie staan en wag
   nie.

   Dit kan misbruik word — iemand kan elke woord rapporteer. Dan sien Dewald
   'n hopie vol goeie woorde en sit hulle terug. Dit is die goedkoopste
   moontlike skade, en die alternatief is dat 'n slegte sin uur na uur onder
   iemand se storie bly staan. */
async function doenRapport(res, woordId) {
  const w = await leesDok(WOORDE, woordId)
  if (!w) return res.status(404).json({ fout: 'daardie woord bestaan nie' })
  await skryfDok(WOORDE, woordId, {
    status: 'wag',
    gerapporteer: (Number(w.gerapporteer) || 0) + 1,
    rede: 'gerapporteer',
  }, { velde: ['status', 'gerapporteer', 'rede'] })
  return res.status(200).json({ ok: true })
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ fout: 'Method Not Allowed' })

  let lyf = req.body
  if (typeof lyf === 'string') { try { lyf = JSON.parse(lyf) } catch { lyf = null } }
  if (!lyf || typeof lyf !== 'object') return res.status(400).json({ fout: 'geen data nie' })

  try {
    if (Array.isArray(lyf.gelees)) return await doenGelees(res, lyf.gelees)

    if (lyf.rapporteer) return await doenRapport(res, String(lyf.rapporteer).slice(0, 40))

    const muurId = skoonId(lyf.muurId)
    if (!muurId) return res.status(400).json({ fout: 'geen plasing nie' })

    const toestel = hasToestel(lyf.toestel)
    /* Sonder 'n toestel-id kan ons nie 'n dubbele druk keer nie, en dan tel
       ons liewer niks as om 'n telling te laat lieg. */
    if (!toestel) return res.status(200).json({ ok: true, reeds: true })

    if (lyf.reaksie) return await doenReaksie(res, { muurId, toestel, reaksie: lyf.reaksie })
    if (lyf.woord || typeof lyf.teks === 'string') {
      return await doenWoord(res, {
        muurId, toestel,
        woordSleutel: lyf.woord ? String(lyf.woord).slice(0, 40) : '',
        teks: lyf.teks,
      })
    }
    return res.status(400).json({ fout: 'niks om te doen nie' })
  } catch (e) {
    return res.status(500).json({ fout: String(e && e.message) })
  }
}

export { REAKSIES }
