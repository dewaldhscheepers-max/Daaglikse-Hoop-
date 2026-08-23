/* ────────────────────────────────────────────────────────────
   Die eenmalige lopie oor die plasings wat nog wag.

     POST /api/sorg-migreer?kyk=1    → DROELOOP: die getalle, en niks skryf
     POST /api/sorg-migreer          → die egte lopie

   Dewald: "Vind alle bestaande Sorg-plasings wat tans net weens die
   admin-goedkeuringsproses wag. Publiseer hulle sonder om duplikate te
   skep... Rapporteer ná die migrasie hoeveel plasings gepubliseer is,
   uitgesluit is, reeds bestaan het, misluk het."

   ── Waarom die DROELOOP eerste kom ──

   Daar is geen "probeer weer" ná 'n migrasie oor lewende data nie. 'n Storie
   wat verkeerdelik openbaar gaan, is openbaar — 'n mens kan hom afhaal, maar
   nie ONGESIEN maak nie.

   Die droëloop loop PRESIES dieselfde kode; hy skryf net nie. Dieselfde
   `beplan()`, dieselfde `verslag()`. Sou hulle uitmekaar dryf, sou die
   getalle wat 'n mens sien voordat hy druk, 'n raaiskoot wees.

   ── Die rugsteun ──

   Die droëloop gee ook 'n RUGSTEUN terug: die volledige inhoud van elke
   plasing wat gaan skuif, as JSON. Dewald het gevra vir 'n veilige rugsteun
   voor die migrasie, en dit is die eerlikste een wat hierdie kode kan gee —
   dit dwing niemand om 'n konsole oop te maak nie.

   ── Waarom die besluit NIE hier staan nie ──

   Elke reël oor wie mag gaan en wie nie, staan in `src/data/sorgMigrasie.js`,
   suiwer en met 79 toetse. Hierdie lêer doen Firestore-werk en niks anders
   nie. Die twee dinge wat onherstelbaar kan skeefloop — 'n duplikaat en
   iemand se woorde sonder toestemming — word daar besluit, waar 'n mens hulle
   in 'n millisekonde kan toets.

   ── Die geheim ──

   Dieselfde hek as die res van die admin: `SORG_ADMIN_GEHEIM` in
   `x-sorg-geheim`. Geen geheim in hierdie lêer nie, en geen `?pin=` nie.
   Sien CLAUDE.md.
   ──────────────────────────────────────────────────────────── */

import crypto from 'node:crypto'
import { lysDokke, skryfDok, magSkryf } from './_sorgFirestore.mjs'
import { beplan, verslag } from '../src/data/sorgMigrasie.js'

const INKOMEND = 'sorg_inkomend'
const MUUR = 'sorg_muur'

/* Hoeveel op EEN lopie skuif.

   Vercel maak 'n funksie ná sy tydgrens dood, en elke plasing is 'n skryf
   plus 'n skryf terug na die bron. Loop dit in hoppe, en die volgende druk
   vat waar die vorige opgehou het — die duplikaat-hek maak dit veilig om die
   knoppie sommer weer te druk. */
const PER_LOPIE = 60

export const config = { maxDuration: 300 }

function nuweMuurId() {
  return 'm' + Date.now().toString(36) + crypto.randomBytes(3).toString('hex')
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Sorg-Geheim')
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ fout: 'Method Not Allowed' })

  const mag = magSkryf(req)
  if (!mag.ok) return res.status(401).json({ fout: mag.rede })

  /* 'n Droëloop is die VERSTEK-veilige kant nie — die knoppie is eksplisiet.
     Maar 'n mens wat `?kyk=1` tik, moet nooit per ongeluk skryf nie. */
  const droog = String((req.query && req.query.kyk) || '') === '1'

  try {
    const inkomend = await lysDokke(INKOMEND, { grootte: 1000 })
    const muur = await lysDokke(MUUR, { grootte: 1000 })

    /* Die duplikaat-hek. 'n STEL van wat reeds op die muur staan, en nie 'n
       vlaggie op die inkomende dokument nie: die vlaggie kan verlore gaan
       wanneer 'n lopie halfpad omval, maar die muur self lieg nooit oor wat
       daarop staan nie. */
    const bestaandeBronne = new Set(muur.map(m => String(m.bronId || '')).filter(Boolean))

    const plan = beplan(inkomend, bestaandeBronne)

    if (droog) {
      return res.status(200).json({
        ok: true,
        droog: true,
        ...verslag(plan),
        /* Die rugsteun: alles wat gaan skuif, presies soos dit gaan lyk. 'n
           Mens kan dit stoor voordat hy die egte knoppie druk. */
        rugsteun: plan.publiseer.map(x => ({ bronId: x.muur.bronId, muur: x.muur })),
        /* Wat oorbly ná hierdie lopie, sodat 'n mens weet of hy weer moet
           druk. */
        inHierdieLopie: Math.min(plan.publiseer.length, PER_LOPIE),
        nogOor: Math.max(0, plan.publiseer.length - PER_LOPIE),
      })
    }

    let misluk = 0
    let gedoen = 0
    for (const x of plan.publiseer.slice(0, PER_LOPIE)) {
      try {
        const muurId = nuweMuurId()
        await skryfDok(MUUR, muurId, x.muur)
        /* Die bron kry die muur-id sodat 'n tweede lopie hom dadelik as
           "bestaan" sien, ook voordat die muur weer gelees word. */
        await skryfDok(INKOMEND, x.muur.bronId, { status: 'gemigreer', muurId },
                       { velde: ['status', 'muurId'] })
        gedoen++
      } catch {
        /* Een mislukking mag nie die res kos nie — dieselfde reël as die
           e-poswerkry: een slegte adres mag nie 99 mense kos nie. Die
           duplikaat-hek maak 'n tweede druk veilig. */
        misluk++
      }
    }

    const v = verslag(plan, misluk)
    return res.status(200).json({
      ok: true,
      droog: false,
      ...v,
      /* Wat WERKLIK geskryf is, nie wat beplan is nie. */
      gepubliseer: gedoen,
      nogOor: Math.max(0, plan.publiseer.length - PER_LOPIE),
    })
  } catch (e) {
    return res.status(500).json({ fout: String(e && e.message) })
  }
}
