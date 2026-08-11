/* ────────────────────────────────────────────────────────────
   "Bid vir my" — die bediener se kant.

       GET  /api/gebed-deel?id=<id>   wat die ontvanger van 'n skakel sien
       POST /api/gebed-deel { id }    "Ek bid saam"

   ── Waarom hierdie eindpunt moet bestaan ──

   Twee redes, en albei is hekke wat 'n kliënt nie self kan wees nie.

   Die EERSTE is veiligheid. `prayers` het `allow read: if true`, dus kan
   enigiemand met 'n id enige gebed lees -- ook een wat oor selfmoord of
   mishandeling gaan en wat nooit veronderstel is om te versprei nie. Sou die
   deel-blad self uit Firestore lees, sou daardie hek in die blaaier gestaan
   het, waar 'n mens dit met die ontwikkelaarsgereedskap omseil. Hier staan
   dit op die bediener en die krisistoets word OORGEDOEN -- ons vertrou nie
   die `deelbaar`-vlag wat by die skryf ingesit is nie, want daardie skryf
   kom van 'n kliënt af.

   Die TWEEDE is die teller. `prayers` het `allow update: if false`, dus kan
   die blaaier glad nie `prayedCount` ophoog nie. Die bestaande `togglePrayed`
   in BidSaam doen 'n updateDoc wat STIL misluk in 'n catch -- die getal loop
   plaaslik op en het nog nooit in die databasis opgegaan nie. Die hele
   funksie hang van daardie getal af, dus doen die diensrekening dit hier.

   ── Wat hier NIE gebeur nie ──

   Geen lys van gebede. Geen "meeste gebede". Geen soek. 'n Mens kan net die
   EEN gebed sien waarvan hy die skakel het. Daar is geen pad van hierdie
   eindpunt na 'n bladsy met almal s'n nie, en dit is opsetlik.
   ──────────────────────────────────────────────────────────── */

import { leesDok, skryfDok, uitVeld, PROJEK, kryToken } from './_sorgFirestore.mjs'
import { krisisTreffers, kontakTreffers } from '../src/data/sorgKrisis.js'
import crypto from 'node:crypto'

const VERSAMELING = 'prayers'

/* Hoe lank 'n versoek deelbaar bly. Ná dit gee die skakel niks meer -- 'n
   mens se swaarste week moet nie oor 'n jaar nog op iemand se WhatsApp
   rondlê nie. */
const DAE_GELDIG = 30

/* ── Twee hekke, nie een nie ──

   WYS en TEL is nie dieselfde vraag nie, en dit was 'n fout om hulle saam te
   hanteer.

   Om 'n gebed te WYS aan 'n vreemdeling wat 'n skakel gekry het, is streng:
   dit moet 'n nie-krisis wees, sonder kontakbesonderhede, met toestemming en
   nog nie verval nie.

   Om te TEL dat iemand gebid het, is nie streng nie. Elke gebed op die muur
   mag getel word -- dit is presies wat die "Gebid"-knoppie daar doen. Het ons
   die streng hek ook hier gebruik, sou die muur se knoppie stilweg niks doen
   nie, want die meeste versoeke daar het geen `deelbaar` nie.

   Die krisistoets loop op die TEKS, nie op 'n vlag nie. 'n Klient wat
   `deelbaar: true` skryf op 'n boodskap oor selfmoord, kom nie hier verby nie. */
export function magWys(gebed, { nou = Date.now() } = {}) {
  const basis = magBid(gebed)
  if (!basis.mag) return basis

  const teks = String(gebed.text || '')
  if (krisisTreffers(teks).length) return { mag: false, rede: 'krisis' }
  if (kontakTreffers(teks).length) return { mag: false, rede: 'kontak' }
  if (gebed.deelbaar !== true)     return { mag: false, rede: 'geen-toestemming' }

  /* Die mens het self gese hy is klaar. Dan is die skakel dood, ook al le hy
     nog op iemand se WhatsApp. Dit is die hele punt daarvan. */
  if (gebed.gesluit === true)      return { mag: false, rede: 'gesluit' }

  const geskep = gebed.createdAt ? new Date(gebed.createdAt).getTime() : NaN
  if (isFinite(geskep) && (nou - geskep) > DAE_GELDIG * 86400000) {
    return { mag: false, rede: 'verval' }
  }

  return { mag: true, rede: null }
}

/* Mag iemand aanteken dat hy vir hierdie gebed gebid het? */
export function magBid(gebed) {
  if (!gebed) return { mag: false, rede: 'bestaan-nie' }
  if (!String(gebed.text || '').trim()) return { mag: false, rede: 'leeg' }
  if (gebed.reported) return { mag: false, rede: 'gerapporteer' }
  return { mag: true, rede: null }
}

/* Wie het reeds gebid? Ons hou 'n has van die toestel, nie die toestel self
   nie -- dieselfde patroon as die Sorg-vorm se dagperk. Dit doen EEN ding:
   keer dat een mens die teller tienduisend maak. */
function hasToestel(t) {
  const s = String(t || '').trim()
  if (!s) return ''
  const sout = process.env.SORG_SOUT || 'daaglikse-hoop-sorg'
  return crypto.createHash('sha256').update(sout + ':gebed:' + s).digest('hex').slice(0, 24)
}

/* ── Een atomiese skryf ──

   Die ophoging EN die toestel-lys gaan saam in een commit.

   Dit was twee stappe: lees die dokument, tel op, skryf die lys terug. Bid twee
   mense op dieselfde oomblik, lees albei dieselfde lys, en die tweede skryf oor
   die eerste -- dan kan een van hulle weer bid. By 'n funksie waarvan die hele
   punt is dat baie mense gelyk bid, is dit nie 'n randgeval nie.

   `appendMissingElements` is Firestore se arrayUnion: dit voeg by sonder om te
   lees, en 'n has wat reeds daar is, word nie 'n tweede keer bygesit nie.

   Die commit gee ook die NUWE telling terug, sodat ons nie 'n ou getal plus een
   hoef te raai nie. */
async function telOp(id, toestel) {
  const token = await kryToken()
  const dok = `projects/${PROJEK}/databases/(default)/documents/${VERSAMELING}/${id}`

  const transforms = [{ fieldPath: 'prayedCount', increment: { integerValue: '1' } }]
  if (toestel) {
    transforms.push({
      fieldPath: 'gebidToestelle',
      appendMissingElements: { values: [{ stringValue: toestel }] },
    })
  }

  const r = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJEK}/databases/(default)/documents:commit`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ writes: [{ transform: { document: dok, fieldTransforms: transforms } }] }),
    }
  )
  if (!r.ok) throw new Error('Tel misluk: ' + (await r.text()).slice(0, 200))

  const uit = await r.json().catch(() => ({}))
  const eerste = uit?.writeResults?.[0]?.transformResults?.[0]
  const nuut = eerste && eerste.integerValue !== undefined ? Number(eerste.integerValue) : null
  return nuut
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const id = String(
    (req.query && req.query.id) || (req.body && req.body.id) || ''
  ).trim()

  /* Firestore se outo-ids is 20 karakters. Ons aanvaar 'n ruim venster maar
     niks met 'n skuinsstreep of 'n punt in nie -- daardie karakters is hoe 'n
     mens uit die versameling uitklim. */
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(id)) {
    return res.status(400).json({ fout: 'Ongeldige id' })
  }

  let gebed
  try {
    gebed = await leesDok(VERSAMELING, id)
  } catch {
    return res.status(500).json({ fout: 'Kon nie lees nie' })
  }

  if (req.method === 'GET') {
    /* Die strengste hek: dit gaan aan 'n vreemdeling gewys word. */
    if (!magWys(gebed).mag) {
      /* Altyd 404, nooit die rede. Se ons "hierdie een is 'n krisis", het ons
         pas vir 'n vreemdeling iets oor daardie mens vertel. */
      return res.status(404).json({ fout: 'Nie gevind nie' })
    }
    return res.status(200).json({
      ok: true,
      gebed: {
        id,
        teks: String(gebed.text || '').slice(0, 600),
        saam: Number(gebed.prayedCount) || 0,
      },
    })
  }

  /* ── Sluit my versoek af ──

     Op die oomblik bly 'n versoek 30 dae deelbaar. 'n Mens wat more spyt is,
     kan niks doen nie -- die skakel le op iemand anders se foon en werk nog.
     Dit is nie 'n kenmerk nie; dit is 'n mens se reg om sy eie woorde terug te
     trek.

     Wat dit doen: die skakel gee van nou af 404, en die versoek verdwyn uit
     die deel-vloei. Die TEKS bly staan -- dit is nie 'n uitvee-knoppie nie, en
     ons se dit ook so op die skerm. Wie dit heeltemal uitgevee wil he, vra dit
     per e-pos; sien /vee-my-data-uit.

     Wie mag dit doen? Die mens wat die versoek geplaas het. Ons het geen
     rekeninge nie, dus is die bewys dat hy die id in sy eie localStorage het.
     Dit is swak bewys -- iemand met 'n gedeelde skakel het ook die id. Maar
     die ERGSTE wat 'n vreemdeling daarmee kan doen, is iemand se versoek stil
     maak. Hy kan niks lees, niks verander en niks stuur nie. 'n Aanmeldstelsel
     bou om dit te keer, kos meer as wat dit werd is. */
  if (req.method === 'PATCH' || (req.method === 'POST' && req.body && req.body.sluit === true)) {
    if (!magBid(gebed).mag) return res.status(404).json({ fout: 'Nie gevind nie' })
    try {
      await skryfDok(VERSAMELING, id, { gesluit: true, gesluitOp: new Date() })
    } catch (e) {
      return res.status(500).json({ fout: String(e.message || e).slice(0, 200) })
    }
    return res.status(200).json({ ok: true, gesluit: true })
  }

  if (req.method === 'POST') {
    /* Die losser hek: enige gebed op die muur mag getel word. */
    if (!magBid(gebed).mag) return res.status(404).json({ fout: 'Nie gevind nie' })

    const toestel = hasToestel((req.body && req.body.toestel) || '')

    /* Een keer per toestel per gebed. Die kontrole is 'n LEES, dus kan twee
       versoeke op dieselfde oomblik albei deurkom -- maar die skryf self is
       atomies, en 'n has wat reeds in die lys is, word nie herhaal nie. Die
       ergste geval is dus een ekstra telling, nie 'n stukkende lys nie.

       Sonder 'n toestel-id -- privaat modus, of localStorage af -- laat ons dit
       deur. Ons mag nie almal sonder 'n id in een mandjie gooi nie: dan sluit
       die eerste een al die ander uit. */
    const albei = Array.isArray(gebed.gebidToestelle) ? gebed.gebidToestelle : []
    if (toestel && albei.includes(toestel)) {
      return res.status(200).json({ ok: true, alGebid: true, saam: Number(gebed.prayedCount) || 0 })
    }

    let saam
    try {
      saam = await telOp(id, toestel)
    } catch (e) {
      return res.status(500).json({ fout: String(e.message || e).slice(0, 200) })
    }

    return res.status(200).json({
      ok: true,
      saam: saam !== null ? saam : (Number(gebed.prayedCount) || 0) + 1,
    })
  }

  return res.status(405).json({ fout: 'Method Not Allowed' })
}
