/* ────────────────────────────────────────────────────────────
   Pastorale Sorg se instellings.

     GET  /api/sorg-instellings   → die plafon, of dit oop is, en vandag se telling
     POST /api/sorg-instellings   → verstel dit (admin)

   Die GET is OOP; die POST vra die admin-geheim.

   Dit was albei agter die geheim, met die redenasie dat vandag se telling
   niemand anders se saak is nie. Dewald wou dit anders he, en hy is reg:
   "Vandag maak ek plek vir 20 mense · 8 van 20 reeds ingestuur" bo-aan die
   blad is nie 'n lek nie — dit is 'n BELOFTE. Dit se vir iemand dat daar
   werklik na sy boodskap gekyk gaan word, en dat die plek nie oneindig is
   nie. Wat oor die draad gaan, is 'n plafon en 'n telling; niks wys na 'n
   mens nie en niks van enige boodskap kom naby hier nie.

   Hoekom die plafon verstelbaar is en nie in die kode staan nie:

   Dit is nie 'n tegniese perk nie — dit is hoeveel boodskappe EEN MENS in
   'n dag behoorlik kan lees. Twintig is waar ons begin. Wanneer Dewald 'n
   week weg is, moet hy dit op nul kan sit sonder om 'n ontplooiing te wag;
   wanneer 'n helper hom help, moet hy dit kan optel. 'n Getal in die kode
   sou beteken elke verandering wag vir 'n bou.
   ──────────────────────────────────────────────────────────── */

import { leesDok, skryfDok, magSkryf } from './_sorgFirestore.mjs'

const CONFIG  = 'sorg_config'
const TELLERS = 'sorg_tellers'

const VERSTEK_PLAFON = 20
const MAKS_PLAFON = 500

function vandagSAST() {
  return new Date(Date.now() + 2 * 3600000).toISOString().slice(0, 10)
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Sorg-Geheim')
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const dag = vandagSAST()

  /* Die GET is oop. Alles anders vra die geheim. */
  if (req.method !== 'GET') {
    const mag = magSkryf(req)
    if (!mag.ok) return res.status(401).json({ fout: mag.rede })
  }

  if (req.method === 'GET') {
    try {
      const d = await leesDok(CONFIG, 'instellings')
      const t = await leesDok(TELLERS, dag)
      const p = d && Number(d.plafon)
      const plafon = Number.isFinite(p) && p > 0 ? Math.floor(p) : VERSTEK_PLAFON
      const oop = !d || d.oop !== false
      const vandag = Number(t && t.totaal) || 0
      return res.status(200).json({
        plafon,
        oop,
        dag,
        vandag,
        /* Die skerm moet nie self hoef te reken nie. Word die reel ooit
           verander, verander dit op EEN plek. */
        vol: !oop || vandag >= plafon,
        oor: Math.max(0, plafon - vandag),
      })
    } catch (e) {
      return res.status(500).json({ fout: String(e && e.message) })
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ fout: 'Method Not Allowed' })

  let lyf = req.body
  if (typeof lyf === 'string') { try { lyf = JSON.parse(lyf) } catch { lyf = null } }
  if (!lyf || typeof lyf !== 'object') return res.status(400).json({ fout: 'geen data nie' })

  const rou = Number(lyf.plafon)
  if (!Number.isFinite(rou) || rou < 0 || rou > MAKS_PLAFON) {
    return res.status(400).json({ fout: `die plafon moet tussen 0 en ${MAKS_PLAFON} wees` })
  }

  try {
    await skryfDok(CONFIG, 'instellings', {
      plafon: Math.floor(rou),
      oop: lyf.oop !== false,
      verander: new Date(),
    })
    return res.status(200).json({ ok: true, plafon: Math.floor(rou), oop: lyf.oop !== false })
  } catch (e) {
    return res.status(500).json({ fout: String(e && e.message) })
  }
}
