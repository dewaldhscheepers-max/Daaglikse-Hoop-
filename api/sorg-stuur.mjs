/* ────────────────────────────────────────────────────────────
   Iemand stuur 'n boodskap na Pastorale Sorg.

     POST /api/sorg-stuur   { teks, onderwerp, naam, toestemmings, toestel }

   Dit is die gevoeligste eindpunt in die hele app. Wat hier inkom, is mense
   se mishandeling, hul selfmoordgedagtes, hul huwelike. Daarom:

   · Die rou teks gaan in `sorg_inkomend`, wat GEEN kliënt mag lees nie. Die
     enigste pad daarheen is die diensrekening.
   · Niks gaan ooit outomaties openbaar nie. Die openbare muur is 'n APARTE
     versameling, en 'n mens moet elke boodskap eers goedkeur en redigeer.
   · Tref die krisiswoorde, gee ons dit dadelik terug sodat die skerm die
     hulpnommers kan wys. Sy hulp kan nie wag tot Dewald môre lees nie.

   Wat ons terugstuur, dra NOOIT die teks nie — net 'n bestuurskode en of dit
   'n krisis is.
   ──────────────────────────────────────────────────────────── */

import crypto from 'node:crypto'
import { leesDok, skryfDok } from './_sorgFirestore.mjs'
import { keurOnderwerp } from '../src/data/sorgOnderwerpe.js'
import { krisisTreffers, kontakTreffers, hulpversoekTreffers } from '../src/data/sorgKrisis.js'

const INKOMEND = 'sorg_inkomend'
const CONFIG   = 'sorg_config'
const TELLERS  = 'sorg_tellers'

const MIN_LENGTE = 15
/* Die muur laat 8000 toe; hier het 2000 gestaan. Twee getalle wat nie
   ooreenstem nie, is presies hoe die vorige fout begin het. Vierduisend is
   'n lang storie en steeds begrens. */
const MAKS_LENGTE = 4000
const PER_TOESTEL_PER_DAG = 3

/* Die plafon is verstelbaar uit die admin, nie hard gekodeer nie. Twintig is
   waar ons begin: 'n mens lees een tot drie minute per boodskap, en 'n ry wat
   die leser verbyhardloop, is erger as geen muur nie. */
const VERSTEK_PLAFON = 20

function vandagSAST() {
  return new Date(Date.now() + 2 * 3600000).toISOString().slice(0, 10)
}

/* Beheerkarakters uit, as KODEPUNTE geskryf. '[ -<>]' lyk soos vier
   karakters maar is 'n reeks van spasie tot < — sien CLAUDE.md. */
function skoonTeks(t, maks) {
  return String(t || '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maks)
}

/* Die toestel word gehas, nooit rou gestoor nie. Dit doen EEN ding — die
   perk van drie boodskappe per dag — en daarvoor is 'n has genoeg. */
function hasToestel(t) {
  const s = String(t || '').trim()
  /* Geen toestel nie — privaat modus, of localStorage is af. Dan is daar
     eenvoudig geen perk per toestel nie. Ons mag hulle NIE almal in een
     mandjie gooi nie: dan sluit die eerste drie sulke mense al die ander
     uit. Die daaglikse plafon staan in elk geval nog. */
  if (!s) return ''
  const sout = process.env.SORG_SOUT || 'daaglikse-hoop-sorg'
  return crypto.createHash('sha256').update(sout + ':' + s).digest('hex').slice(0, 32)
}

/* 'n Verwysing wat by die plasing bly.

   Dit was 'n "private kode" wat op die skerm gewys en gekopieer moes word.
   Dewald was reg dat dit onnodig was: niemand wil 'n kode verstaan, kopieer
   en bere nie, en die plasing is in elk geval aan die toestel gekoppel.

   Die kode bly bestaan omdat DEWALD hom nodig het — dit is hoe hy 'n
   spesifieke boodskap in die keurpaneel uitwys wanneer iemand vra dat sy
   plasing weggaan. Die mens sien hom nooit.

   Leesbaar hardop: geen 0/O/1/I, en in blokke van vier. */
function maakKode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const b = crypto.randomBytes(12)
  let uit = ''
  for (let i = 0; i < 12; i++) {
    if (i && i % 4 === 0) uit += '-'
    uit += letters[b[i] % letters.length]
  }
  return uit
}

async function haalInstellings() {
  try {
    const d = await leesDok(CONFIG, 'instellings')
    const p = d && Number(d.plafon)
    return {
      plafon: Number.isFinite(p) && p > 0 ? Math.floor(p) : VERSTEK_PLAFON,
      oop: !d || d.oop !== false,
    }
  } catch {
    return { plafon: VERSTEK_PLAFON, oop: true }
  }
}

/* ── Die daaglikse teller ──

   Een klein dokument per dag: hoeveel boodskappe daar vandag was, en hoeveel
   elke toestel gestuur het. Nie 'n telling oor die hele versameling nie —
   daardie lys sou saam met die muur groei, en dan word elke indiening
   stadiger namate meer mense skryf.

   Dit is 'n TELLER en nie 'n boekhouding nie. Twee mense wat op dieselfde
   millisekonde stuur, kan albei deurkom en die plafon met een oorskry. Dit
   is heeltemal aanvaarbaar: die plafon bestaan sodat 'n mens alles kan lees,
   nie omdat die 21ste boodskap 'n oortreding is nie. */
async function haalTeller(dag) {
  try {
    const d = await leesDok(TELLERS, dag)
    return {
      totaal: Number(d && d.totaal) || 0,
      toestelle: (d && d.toestelle) || {},
    }
  } catch {
    return { totaal: 0, toestelle: {} }
  }
}

async function telOp(dag, teller, toestel) {
  const toestelle = { ...teller.toestelle }
  if (toestel) toestelle[toestel] = (Number(toestelle[toestel]) || 0) + 1
  try {
    await skryfDok(TELLERS, dag, { totaal: teller.totaal + 1, toestelle, dag })
  } catch {
    /* Die boodskap is reeds gestoor. 'n Teller wat nie opgetel het nie, is
       nie 'n rede om vir die mens te sê dit het misluk nie. */
  }
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

  /* ── Nooit stil afkap nie ──

     Dit was `skoonTeks(lyf.teks, MAKS_LENGTE)` — 'n stil `.slice()`. Die
     vorm keer wel by 2000 karakters, dus kon dit deur die skerm nie gebeur
     nie; maar die reel wat op die MUUR stilweg afgekap het, was presies
     hierdie vorm, en 'n vrou se boodskap het middel in 'n sin opgehou. Die
     swaarste deel van haar storie was eenvoudig weg.

     Waar iemand se eie woorde deur hierdie kode gaan, kap ons nooit weer af
     nie. Ons se dit, en dan besluit sy self wat uitgaan. */
  const rouTeks = String(lyf.teks || '').trim()
  if (rouTeks.length > MAKS_LENGTE) {
    return res.status(400).json({
      fout: `Jou boodskap is ${rouTeks.length - MAKS_LENGTE} karakters te lank ` +
            `(${rouTeks.length} van ${MAKS_LENGTE}). Kort dit asseblief 'n bietjie in — ` +
            'dan gaan niks van wat jy geskryf het verlore nie.',
    })
  }
  const teks = skoonTeks(lyf.teks, MAKS_LENGTE)
  if (teks.length < MIN_LENGTE) {
    return res.status(400).json({ fout: 'Skryf asseblief net \'n bietjie meer, sodat ons kan verstaan.' })
  }

  /* EEN toestemming, en dit sê alles wat gesê moet word: die boodskap gaan
     openbaar, en dit mag verkort of aangepas word om mense te beskerm.

     Dit was drie blokkies. Dewald was reg dat dit die indiening in 'n
     aansoekproses verander het — en drie blokkies wat almal net gemerk word
     om verby te kom, beskerm niemand meer as een wat gelees word nie. */
  const t = lyf.toestemmings || {}
  if (!t.openbaar) {
    return res.status(400).json({ fout: 'Merk asseblief die blokkie voordat jy stuur.' })
  }

  const onderwerp = keurOnderwerp(lyf.onderwerp)

  /* ALTYD anoniem.

     Daar was 'n keuse tussen anoniem en 'n voornaam. Die kaart op die
     Sorg-blad se nou twee keer dat dit anoniem is, en 'n stelsel wat dan
     tog 'n naam stoor, breek daardie belofte — ook al het net EEN mens die
     ander knoppie gedruk.

     Daar was 'n `skoonNaam` wat 'n voornaam skoongemaak het. Dit is weg —
     nie een plek roep dit meer nie. Die kommentaar het gese die keurpaneel
     gebruik dit; dit was nie waar nie, en 'n kommentaar wat lieg, hou dooie
     kode vir jare aan die lewe. */
  const naam = ''
  const toestel = hasToestel(lyf.toestel)
  const dag = vandagSAST()

  /* Die krisis-toets loop HIER, nie net op die skerm nie. 'n Mens kan die
     JavaScript verander; hierdie kant nie. */
  const krisis = krisisTreffers(teks)
  const kontak = kontakTreffers(teks)
  /* Vra hy om geld of goed? Dit keer niks — dit wys net vir Dewald waaroor
     die boodskap gaan sodat hy nie hoef te sorteer nie. */
  const hulpversoek = hulpversoekTreffers(teks)

  try {
    const { plafon, oop } = await haalInstellings()
    const teller = await haalTeller(dag)

    /* 'n Krisisboodskap gaan ALTYD deur, ook wanneer die dag vol is. Iemand
       wat vanaand skryf dat hy nie meer wil lewe nie, mag nie 'n plafon in
       die gesig kry nie. */
    if (!krisis.length) {
      if (!oop) {
        return res.status(200).json({
          ok: false, vol: true,
          boodskap: 'Die muur is vir \'n rukkie toe. Kom asseblief later terug.',
        })
      }

      if (teller.totaal >= plafon) {
        return res.status(200).json({
          ok: false, vol: true,
          boodskap: 'Vandag se boodskappe is vol. Kom asseblief môre terug. Ons wil elke boodskap behoorlik en met sorg lees.',
        })
      }

      const synes = Number(teller.toestelle[toestel]) || 0
      if (toestel && synes >= PER_TOESTEL_PER_DAG) {
        return res.status(200).json({
          ok: false, vol: true,
          boodskap: 'Jy het vandag al \'n paar keer geskryf. Kom asseblief môre weer — ons lees wat jy gestuur het.',
        })
      }
    }

    const kode = maakKode()
    const id = 'b' + Date.now().toString(36) + crypto.randomBytes(4).toString('hex')

    await skryfDok(INKOMEND, id, {
      teks,                       // die rou teks — geen kliënt lees ooit hierdie versameling
      onderwerp,
      naam,                       // altyd leeg — sien hierbo
      anoniem: true,
      toestel,
      dag,
      kode,
      status: krisis.length ? 'gevaar' : 'nuut',
      krisisWoorde: krisis.slice(0, 10),
      kontakWaarskuwing: kontak,
      hulpversoek: hulpversoek.slice(0, 6),
      toestemmings: { openbaar: true, redigeer: true, geenWaarborg: true },
      /* Waar en wanneer die toestemming gegee is. POPIA vra dat 'n mens kan
         wys dat daar toestemming was, nie net dat dit gevra is nie. */
      toestemDatum: new Date(),
      geskep: new Date(),
    })

    await telOp(dag, teller, toestel)

    return res.status(200).json({
      ok: true,
      kode,
      onderwerp,
      krisis: krisis.length > 0,
    })
  } catch (e) {
    return res.status(500).json({ fout: 'Ons kon dit nie stoor nie. Probeer asseblief weer.', detail: String(e && e.message) })
  }
}
