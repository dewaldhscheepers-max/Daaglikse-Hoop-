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
const WOORDE = 'sorg_woorde'
const INKOMEND = 'sorg_inkomend'

function hasToestel(t) {
  const s = String(t || '').trim()
  if (!s) return ''
  const sout = process.env.SORG_SOUT || 'daaglikse-hoop-sorg'
  return crypto.createHash('sha256').update(sout + ':' + s).digest('hex').slice(0, 24)
}

/* Nuutste eerste, tot op die sekonde. */
function volgorde(a, b) {
  const t = x => String(x.geskep || x.datum || '') + '|' + String(x.id || '')
  return t(b).localeCompare(t(a))
}

/* Wat na die kliënt gaan. Nooit die bronId nie — dit wys na die rou
   boodskap, en niemand buite die admin het daarmee te doen nie. */
function virDieSkerm(m, woorde) {
  const myne = (woorde || []).filter(w => w.muurId === m.id)
  return {
    id: m.id,
    titel: m.titel || '',
    teks: m.teks,
    naam: m.naam || '',
    onderwerp: m.onderwerp || 'ander',
    datum: m.datum || '',
    antwoord: m.antwoord || null,
    saam: Number(m.saam) || 0,
    reaksies: m.reaksies || {},
    /* Onder die vloer wys die skerm niks; ons stuur die rou getal en laat
       `wysGelees` daar besluit, sodat die reel op EEN plek staan. */
    gelees: Number(m.gelees) || 0,
    /* Die skerm moet dit weet om die skryfblok weg te laat. Dit is 'n
       vlaggie, nie inligting oor die mens nie — dit se net dat hierdie
       storie te swaar is vir 'n vreemdeling se raad. */
    sensitief: m.sensitief === true,
    /* Die eerste twee woorde, en hoeveel daar in totaal is. */
    woorde: myne.slice(0, 3).map(w => ({ id: w.id, teks: w.teks })),
    woordeTotaal: myne.length,
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

      /* Net wat WYS. Wat vir Dewald se oog wag, en wat hy weggesteek het,
         kom nooit hier uit nie. Oudste eerste binne 'n plasing — 'n gesprek
         lees van bo af, nie andersom nie. */
      const woorde = (await lysDokke(WOORDE, { grootte: 300 }))
        .filter(w => w.status === 'wys' && w.teks)
        .sort((a, b) => String(a.id).localeCompare(String(b.id)))

      const lys = alles
        .filter(m => m.gepubliseer !== false && m.teks)
        /* Nuutste eerste. GEEN rangskikking volgens die telling nie.

           Dit het op `datum` gesorteer, en `datum` is net 'n DAG. Alles wat
           op dieselfde dag geplaas is, was dus gelyk, en dan het Firestore se
           eie volgorde beslis — wat volgens die dokument se naam is, en ons
           name begin met die tyd. Die gevolg: die dag se plasings het van
           OUDSTE na nuutste gele, presies andersom as wat dit moet.

           `geskep` is 'n regte tydstempel in ISO-vorm, en ISO-teks sorteer
           korrek as teks. Ontbreek dit op 'n ou plasing, val ons terug op die
           dag en dan op die id (wat ook met die tyd begin). */
        .sort(volgorde)
        .map(m => virDieSkerm(m, woorde))

      /* GEEN kas nie.

         Dit was `public, max-age=30, s-maxage=120`. Dit het gelyk soos 'n
         goedkoop wins — die muur verander mos nie elke sekonde nie. Maar die
         TELLING verander wel: Dewald het "Ek dra dit saam met jou" gedruk, sy
         vrou ook, en toe hulle terugkom was die telling nog nul. Vercel se
         rand het twee minute lank 'n ou kopie bedien.

         'n Telling wat lieg, is erger as geen telling nie: die hele punt van
         daardie knoppie is om iemand te wys dat ander mense sy ding saamdra.
         Die muur is klein; hom elke keer vars haal kos niks. */
      /* ── Die gemeenskapstrook ──

         Dit tel wat AL OOIT gedra is, nie wat vandag gedra is nie. 'n Blad
         wat "3 mense het vandag saamgebid" sê, laat die plek eensamer lyk
         as stilte, en op 'n jong muur is dit wat 'n dagtelling gaan sê. 'n
         Lopende totaal groei net, en dit is ewe waar.

         Dit kos ook niks ekstra nie: die getalle sit reeds in wat ons pas
         gelees het. */
      const saamTotaal = lys.reduce((n, m) => {
        const r = m.reaksies || {}
        return n + Object.values(r).reduce((a, b) => a + (Number(b) || 0), 0) + (Number(m.saam) || 0)
      }, 0)
      const woordeTotaal = lys.reduce((n, m) => n + (Number(m.woordeTotaal) || 0), 0)

      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).json({
        plasings: lys,
        saamtel: { saam: saamTotaal, woorde: woordeTotaal, stories: lys.length },
      })
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

  /* ── Watter van hierdie plasings is MYNE? ──

     Die mens wat geskryf het, het nooit gesien dat mense haar dra nie. Sy
     plaas, sy verdwyn, en daar is geen pad terug nie — die private kode is
     doelbewus van die skerm af weg, want niemand wil 'n kode onthou nie.

     Die kode BESTAAN egter nog, want Dewald het hom nodig. Die foon hou hom
     stil, en hier ruil ons hom om vir die muur-id. Dit lek niks: 'n mens
     moet die kode besit, en net wie geskryf het, het hom.

     Ons stuur NIE die inkomende id terug nie — net die muur-id, wat in elk
     geval al openbaar is. */
  if (Array.isArray(lyf.kodes)) {
    try {
      const kodes = new Set(lyf.kodes.map(k => String(k || '').slice(0, 60)).filter(Boolean).slice(0, 40))
      if (!kodes.size) return res.status(200).json({ myne: [] })
      const inkomend = await lysDokke(INKOMEND, { grootte: 300 })
      const myne = inkomend
        .filter(b => kodes.has(b.kode) && b.muurId)
        .map(b => b.muurId)
      return res.status(200).json({ myne })
    } catch (e) {
      return res.status(200).json({ myne: [], fout: String(e && e.message) })
    }
  }

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
