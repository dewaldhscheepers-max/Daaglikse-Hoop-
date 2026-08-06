/* ────────────────────────────────────────────────────────────
   Die muur — wat almal sien.

     GET  /api/sorg-muur                → die goedgekeurde plasings
     POST /api/sorg-muur { muurId }     → "ek dra dit saam met jou"

   Dit lees uit `sorg_muur`, wat NET dra wat 'n mens gelees, geredigeer en
   goedgekeur het. Die rou boodskappe le in 'n ander versameling waarby
   hierdie lêer nie eens kom nie.

   ── Die reaksie ──

   Daar is EEN, en dit is nie 'n punt nie. "37 mense dra dit vandag saam met
   jou" is geselskap; 'n telling wat plasings teen mekaar rangskik, maak van
   iemand se pyn 'n wedstryd. Daarom:

   · net een soort reaksie, en dit is 'n saamdra en nie 'n "hou van" nie;
   · geen rangskikking volgens die telling nie — die muur is altyd nuutste
     eerste;
   · geen kommentaar nie. Geen vreemdeling se raad onder 'n vrou se
     beskrywing van haar huwelik nie.

   Een toestel tel een keer per plasing. Dit loop deur klein dokumente in
   `sorg_saam` — een per toestel per plasing — sodat die telling nie 'n lys
   op die plasing self hoef te dra nie.
   ──────────────────────────────────────────────────────────── */

import crypto from 'node:crypto'
import { lysDokke, leesDok, skryfDok } from './_sorgFirestore.mjs'

const MUUR = 'sorg_muur'
const SAAM = 'sorg_saam'

function hasToestel(t) {
  const s = String(t || '').trim()
  if (!s) return ''
  const sout = process.env.SORG_SOUT || 'daaglikse-hoop-sorg'
  return crypto.createHash('sha256').update(sout + ':' + s).digest('hex').slice(0, 24)
}

/* Wat na die kliënt gaan. Nooit die bronId nie — dit wys na die rou
   boodskap, en niemand buite die admin het daarmee te doen nie. */
function virDieSkerm(m) {
  return {
    id: m.id,
    titel: m.titel || '',
    teks: m.teks,
    naam: m.naam || '',
    onderwerp: m.onderwerp || 'ander',
    datum: m.datum || '',
    antwoord: m.antwoord || null,
    saam: Number(m.saam) || 0,
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    try {
      const alles = await lysDokke(MUUR, { grootte: 300 })
      const lys = alles
        .filter(m => m.gepubliseer !== false && m.teks)
        /* Nuutste eerste. GEEN rangskikking volgens die telling nie. */
        .sort((a, b) => String(b.datum || '').localeCompare(String(a.datum || '')))
        .map(virDieSkerm)

      /* GEEN kas nie.

         Dit was `public, max-age=30, s-maxage=120`. Dit het gelyk soos 'n
         goedkoop wins — die muur verander mos nie elke sekonde nie. Maar die
         TELLING verander wel: Dewald het "Ek dra dit saam met jou" gedruk, sy
         vrou ook, en toe hulle terugkom was die telling nog nul. Vercel se
         rand het twee minute lank 'n ou kopie bedien.

         'n Telling wat lieg, is erger as geen telling nie: die hele punt van
         daardie knoppie is om iemand te wys dat ander mense sy ding saamdra.
         Die muur is klein; hom elke keer vars haal kos niks. */
      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).json({ plasings: lys })
    } catch (e) {
      /* 'n Stukkende muur mag nie die blad doodmaak nie. */
      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).json({ plasings: [], fout: String(e && e.message) })
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ fout: 'Method Not Allowed' })
  res.setHeader('Cache-Control', 'no-store')

  let lyf = req.body
  if (typeof lyf === 'string') { try { lyf = JSON.parse(lyf) } catch { lyf = null } }
  if (!lyf || typeof lyf !== 'object') return res.status(400).json({ fout: 'geen data nie' })

  const muurId = String(lyf.muurId || '').slice(0, 40)
  if (!/^[a-zA-Z0-9]+$/.test(muurId)) return res.status(400).json({ fout: 'geen plasing nie' })

  const toestel = hasToestel(lyf.toestel)
  if (!toestel) return res.status(200).json({ ok: true, reeds: true })

  try {
    const plasing = await leesDok(MUUR, muurId)
    if (!plasing || plasing.gepubliseer === false) {
      return res.status(404).json({ fout: 'daardie plasing bestaan nie' })
    }

    const merkId = `${muurId}_${toestel}`
    const reeds = await leesDok(SAAM, merkId)
    if (reeds) return res.status(200).json({ ok: true, reeds: true, saam: Number(plasing.saam) || 0 })

    await skryfDok(SAAM, merkId, { muurId, toestel, dag: new Date().toISOString().slice(0, 10) })
    const saam = (Number(plasing.saam) || 0) + 1
    await skryfDok(MUUR, muurId, { saam }, { velde: ['saam'] })

    return res.status(200).json({ ok: true, saam })
  } catch (e) {
    return res.status(500).json({ fout: String(e && e.message) })
  }
}
