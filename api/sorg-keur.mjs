/* ────────────────────────────────────────────────────────────
   Die keurpaneel — waar 'n MENS elke boodskap lees voordat iets openbaar
   gaan.

     GET  /api/sorg-keur              → die inbak (net admin)
     POST /api/sorg-keur { aksie }    → keur, antwoord, versteek, vee uit

   Dit is die enigste plek in die hele app waar 'n mens by `sorg_inkomend`
   kan kom. Alles hier vra die admin-geheim, ook die lees — die inbak dra
   mense se mishandeling en hul selfmoordgedagtes.

   ── Hoekom die muur 'n APARTE versameling is ──

   Nie 'n vlaggie op die inkomende dokument nie. As dit 'n vlaggie was, sou
   die rou teks en die goedgekeurde teks in dieselfde dokument sit, en dan is
   een verkeerde lees of een oop reel genoeg om die rou weergawe te wys. Nou
   is die rou teks nooit in dieselfde plek as wat openbaar mag word nie.

   Wat na die muur toe gaan, is die GEREDIGEERDE teks. Dewald mag 'n naam
   uithaal, 'n dorp uithaal, 'n nommer uithaal. Die persoon het daarvoor
   toestemming gegee, en dit is hoe 'n mens hom beskerm.

   ── Die statusse ──

     nuut      nog nie gelees nie
     gevaar    die krisiswoorde het getref — hierdie hopie eerste
     gekeur    dit is op die muur
     weg       gelees en nie geplaas nie (die persoon is nie afgejak nie;
               ons het net nie alles geplaas nie)
   ──────────────────────────────────────────────────────────── */

import crypto from 'node:crypto'
import { lysDokke, leesDok, skryfDok, veeDok, magSkryf } from './_sorgFirestore.mjs'
import { keurOnderwerp } from '../src/data/sorgOnderwerpe.js'
import { kontakTreffers, krisisTreffers } from '../src/data/sorgKrisis.js'

const INKOMEND = 'sorg_inkomend'
const MUUR = 'sorg_muur'
const WOORDE = 'sorg_woorde'

const MAKS_MUUR_TEKS = 1200

/* 'n Opskrif moet in EEN oogopslag lees. Word dit langer as dit, is dit nie
   meer 'n opskrif nie — dan is dit 'n opsomming, en die storie self doen
   daardie werk klaar. */
const MAKS_TITEL = 110

/* ── Dewald se antwoord het GEEN praktiese perk nie ──

   Dit was 1500 karakters, en dit is sowat 'n halwe bladsy. Party antwoorde
   is 'n halwe bladsy; party is 'n brief. Die perk het stilweg afgekap — die
   res van sy woorde het eenvoudig verdwyn sonder om hom iets te se, wat die
   slegste soort perk is.

   Twintigduisend is nie 'n redaksionele besluit nie; dit is 'n vangnet teen
   'n dokument wat per ongeluk 'n megagreep word. Die kaart kap in elk geval
   op ag reels af met 'Lees meer' daaronder, dus maak 'n lang antwoord nie
   die muur onleesbaar nie. */
const MAKS_ANTWOORD = 20000

function skoonTeks(t, maks) {
  return String(t || '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maks)
}

/* 'n Antwoord is 'n SKAKEL na Dewald se eie stem, of 'n video, of geskrewe
   woorde. Geen opname vanuit die app nie — hy maak dit soos hy altyd doen en
   plak die skakel hier. */
function skoonAntwoord(a) {
  if (!a || typeof a !== 'object') return { fout: 'geen antwoord nie' }
  const tipe = ['oudio', 'video', 'teks'].includes(a.tipe) ? a.tipe : 'teks'
  const teks = skoonTeks(a.teks, MAKS_ANTWOORD)
  const bron = skoonTeks(a.bron, 400)
  /* Die vraag wat die antwoord beantwoord. Dit is die ding wat 'n mens laat
     druk op 'n klankgreep: nie "Dewald antwoord" nie, maar WAAROP. */
  const titel = skoonTeks(a.titel, MAKS_TITEL)
  const dat = new Date().toISOString().slice(0, 10)

  if (tipe === 'teks') {
    if (!teks) return { fout: 'die antwoord het woorde nodig' }
    return { antwoord: { tipe, titel, teks, bron: '', datum: dat } }
  }
  if (!/^https?:\/\//i.test(bron)) {
    return { fout: 'die antwoord het \'n geldige skakel nodig' }
  }
  return { antwoord: { tipe, titel, teks, bron, datum: dat } }
}

/* Nuutste eerste, tot op die sekonde. `geskep` is 'n ISO-tydstempel en ISO
   sorteer korrek as teks; ontbreek dit op 'n ou dokument, val ons terug op die
   dag en dan op die id, wat ook met die tyd begin. */
function nuutsteEerste(a, b) {
  const t = x => String(x.geskep || x.datum || x.dag || '') + '|' + String(x.id || '')
  return t(b).localeCompare(t(a))
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Sorg-Geheim')
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'OPTIONS') return res.status(200).end()

  /* Ook die LEES vra die geheim. Dit is die punt van hierdie hele lêer. */
  const mag = magSkryf(req)
  if (!mag.ok) return res.status(401).json({ fout: mag.rede })

  if (req.method === 'GET') {
    try {
      const inkomend = await lysDokke(INKOMEND, { grootte: 300 })
      const muur = await lysDokke(MUUR, { grootte: 300 })
      const woorde = await lysDokke(WOORDE, { grootte: 300 })

      /* Wat op Dewald se oog wag: die gevlagdes, en wat iemand
         gerapporteer het. Wat reeds wys en niemand gepla het nie, hoef hy
         nooit te sien nie — dit is die hele punt van hierdie ontwerp. */
      const wagWoorde = woorde
        .filter(w => w.status === 'wag' || (Number(w.gerapporteer) || 0) > 0)
        .sort(nuutsteEerste)

      /* Gevaar heel bo, dan die nuutstes. Iemand wat vanaand geskryf het dat
         hy nie meer wil lewe nie, mag nie onder 'n week se gewone boodskappe
         le nie.

         Binne 'n hopie op TYD, nie op dag nie: `dag` is net 'n datum, dus was
         alles wat vandag ingekom het gelyk en het Firestore se eie volgorde
         beslis — wat oudste-eerste is. Dewald het dus vanoggend se eerste
         boodskap bo gesien in plaas van die nuutste. */
      const rang = s => (s === 'gevaar' ? 0 : s === 'nuut' ? 1 : 2)
      inkomend.sort((a, b) =>
        rang(a.status) - rang(b.status) || nuutsteEerste(a, b))

      return res.status(200).json({
        inkomend,
        muur: muur.sort(nuutsteEerste),
        woorde: wagWoorde,
        tellings: {
          gevaar: inkomend.filter(x => x.status === 'gevaar').length,
          nuut: inkomend.filter(x => x.status === 'nuut').length,
          opMuur: muur.length,
          woorde: wagWoorde.length,
        },
      })
    } catch (e) {
      return res.status(500).json({ fout: String(e && e.message) })
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ fout: 'Method Not Allowed' })

  let lyf = req.body
  if (typeof lyf === 'string') { try { lyf = JSON.parse(lyf) } catch { lyf = null } }
  if (!lyf || typeof lyf !== 'object') return res.status(400).json({ fout: 'geen data nie' })

  try {
    /* ── Merk as gelees, sonder om te plaas ── */
    if (lyf.aksie === 'weg') {
      if (!lyf.id) return res.status(400).json({ fout: 'geen id nie' })
      await skryfDok(INKOMEND, lyf.id, { status: 'weg' }, { velde: ['status'] })
      return res.status(200).json({ ok: true })
    }

    /* ── Plaas op die muur ──
       Die teks wat hier ingestuur word, is die GEREDIGEERDE teks. */
    if (lyf.aksie === 'keur') {
      const bron = await leesDok(INKOMEND, String(lyf.id || ''))
      if (!bron) return res.status(404).json({ fout: 'daardie boodskap bestaan nie' })

      const teks = skoonTeks(lyf.teks, MAKS_MUUR_TEKS)
      if (teks.length < 10) return res.status(400).json({ fout: 'die teks is te kort' })

      /* Laaste vangnet: 'n nommer of e-posadres wat bly staan het. Ons keer
         dit nie — Dewald besluit — maar hy moet dit sien voordat dit
         openbaar gaan. */
      const oorblyfsels = kontakTreffers(teks)
      if (oorblyfsels.length && !lyf.tochPlaas) {
        return res.status(200).json({
          ok: false,
          waarsku: `Daar is nog ${oorblyfsels.join(' en ')} in die teks. Haal dit uit, of stuur weer met "plaas tog".`,
        })
      }

      const muurId = 'm' + Date.now().toString(36) + crypto.randomBytes(3).toString('hex')
      const doc = {
        bronId: bron.id,
        /* Die vraag in een reel, soos Dewald dit skryf. Sonder dit begin die
           kaart as 'n blok teks en niemand weet waaroor dit gaan nie. */
        titel: skoonTeks(lyf.titel, MAKS_TITEL),
        teks,
        naam: '',                 // die muur is anoniem, altyd
        onderwerp: keurOnderwerp(lyf.onderwerp || bron.onderwerp),
        datum: new Date().toISOString().slice(0, 10),
        geskep: new Date(),
        gepubliseer: true,
        /* OP DIE MUUR KOM NET DEWALD SE ANTWOORDE. Daar was hier 'n
           `videoId` sodat 'n plasing sonder antwoord tog iets kon dra; dit
           is weg. Die muur is sy stem, nie 'n plek waar die res van die app
           ingedra word nie. */
        antwoord: null,
        saam: 0,
        reaksies: {},
        gelees: 0,
        /* ── Die vlag wat vrye teks toemaak ──

           Op 'n storie oor selfmoordgedagtes, of oor iemand wat weier om
           hospitaal toe te gaan, mag 'n vreemdeling nie skryf nie. Nie omdat
           mense sleg is nie, maar omdat verkeerde raad in mooi Afrikaans kom
           en geen filter dit vang. "Hospitale het my ma doodgemaak" is 'n
           sin waarop iemand kan handel.

           Op sulke plasings bly net Dewald se klaargemaakte woorde oor.

           Dit word HIER besluit, uit die rou boodskap se krisiswoorde en uit
           die geredigeerde teks, en dit word op die plasing gestoor. Die
           kliënt sê nooit vir die bediener of iets sensitief is nie — dan
           sou 'n aanvaller eenvoudig "nee" sê. Dewald kan dit met 'wysig'
           verander as hy anders besluit. */
        sensitief:
          bron.status === 'gevaar' ||
          (bron.krisisWoorde || []).length > 0 ||
          krisisTreffers(teks).length > 0,
      }
      await skryfDok(MUUR, muurId, doc)
      await skryfDok(INKOMEND, bron.id, { status: 'gekeur', muurId }, { velde: ['status', 'muurId'] })
      return res.status(200).json({ ok: true, muurId })
    }

    /* ── Dewald se antwoord, ONDER die plasing ── */
    if (lyf.aksie === 'antwoord') {
      if (!lyf.muurId) return res.status(400).json({ fout: 'geen muurId nie' })
      const { antwoord, fout } = skoonAntwoord(lyf.antwoord)
      if (fout) return res.status(400).json({ fout })
      await skryfDok(MUUR, String(lyf.muurId), { antwoord }, { velde: ['antwoord'] })
      return res.status(200).json({ ok: true, antwoord })
    }

    /* ── Redigeer wat reeds op die muur is ── */
    if (lyf.aksie === 'wysig') {
      if (!lyf.muurId) return res.status(400).json({ fout: 'geen muurId nie' })
      const velde = {}
      if (typeof lyf.teks === 'string') velde.teks = skoonTeks(lyf.teks, MAKS_MUUR_TEKS)
      if (typeof lyf.titel === 'string') velde.titel = skoonTeks(lyf.titel, MAKS_TITEL)
      if (typeof lyf.gepubliseer === 'boolean') velde.gepubliseer = lyf.gepubliseer
      if (typeof lyf.sensitief === 'boolean') velde.sensitief = lyf.sensitief
      if (!Object.keys(velde).length) return res.status(400).json({ fout: 'niks om te verander nie' })
      await skryfDok(MUUR, String(lyf.muurId), velde, { velde: Object.keys(velde) })
      return res.status(200).json({ ok: true })
    }

    /* ── 'n Woord van ondersteuning: laat wys, of haal weg ──

       Net die gevlagdes kom ooit hier. Wat reeds wys, wys. */
    if (lyf.aksie === 'woord') {
      if (!lyf.woordId) return res.status(400).json({ fout: 'geen woordId nie' })
      const id = String(lyf.woordId)
      if (lyf.vee) {
        await veeDok(WOORDE, id)
        return res.status(200).json({ ok: true, gevee: true })
      }
      const status = lyf.wys ? 'wys' : 'weg'
      await skryfDok(WOORDE, id, { status, gerapporteer: 0 }, { velde: ['status', 'gerapporteer'] })
      return res.status(200).json({ ok: true, status })
    }

    /* ── Verwyder ──
       Vra iemand dat sy plasing weggaan (POPIA gee hom daardie reg), gaan
       ALBEI kante weg: die muur en die inbak. */
    if (lyf.aksie === 'vee') {
      if (lyf.muurId) await veeDok(MUUR, String(lyf.muurId))
      if (lyf.id) await veeDok(INKOMEND, String(lyf.id))
      return res.status(200).json({ ok: true })
    }

    return res.status(400).json({ fout: 'onbekende aksie' })
  } catch (e) {
    return res.status(500).json({ fout: String(e && e.message) })
  }
}
