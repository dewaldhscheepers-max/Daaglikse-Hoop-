/* ────────────────────────────────────────────────────────────
   Saamstaan — die gemeenskap onder 'n storie.

     POST /api/sorg-saamstaan { muurId, toestel, reaksie }   → 'n reaksie
     POST /api/sorg-saamstaan { muurId, toestel, woord }     → 'n klaar woord
     POST /api/sorg-saamstaan { muurId, toestel, teks }      → 'n eie woord

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
  keurReaksie, klaarWoordTeks, woordStatus, saamTelReaksies, REAKSIES,
} from '../src/data/sorgSaamstaan.js'
import { keurNaam } from '../src/data/sorgProfiel.js'
import { keurRede, naRapport } from '../src/data/sorgModereer.js'

const MUUR = 'sorg_muur'
const VIDEOS = 'sorg_videos'
const SAAM = 'sorg_saam'
const WOORDE = 'sorg_woorde'

/* ── Waaronder staan hierdie reaksie? ──

   'n Video kry presies dieselfde balk as 'n plasing — hou van, reageer,
   deel. Die tellings le op die video se eie dokument en die opmerkings in
   dieselfde versameling as die muur s'n.

   Dit werk sonder 'n tweede sleutelruimte omdat ons id's reeds geskei is:
   'n muur-plasing begin met 'm', 'n video met 'v'. Hulle kan nooit bots
   nie. Ons vra die klient tog EXPLISIET watter soort dit is en gaan dit na
   — 'n stille aanname oor 'n eerste letter is die soort ding wat oor 'n
   jaar breek wanneer iemand die id-vorm verander. */
function versamelingVir(soort) {
  return soort === 'video' ? VIDEOS : MUUR
}

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
async function doenReaksie(res, { muurId, toestel, reaksie, waar }) {
  const soort = keurReaksie(reaksie)
  if (!soort) return res.status(400).json({ fout: 'onbekende reaksie' })

  const vers = versamelingVir(waar)
  const plasing = await leesDok(vers, muurId)
  if (!plasing || plasing.gepubliseer === false) {
    return res.status(404).json({ fout: 'daardie plasing bestaan nie' })
  }

  /* ── Wat die skerm terugkry, moet dieselfde vorm he as wat hy gelaai het ──

     Die lees-pad gee `reaksies + saai` terug — die egte drukke plus die drie
     eerstes. Hier het net `reaksies` teruggegaan.

     Die gevolg was sigbaar en dit het soos 'n stukkende teller gelyk: 'n mens
     sien 3, hy druk een keer, en die getal SPRING NA 1 — sy eie druk, sonder
     die eerstes. Dit lyk of sy druk die ander drie doodgemaak het.

     'n Video wys `saam: 0` op die lees-pad (die ou los teller is daar in die
     reaksies gevou), 'n muur-plasing wys syne. Ons volg dieselfde reel. */
  const eerstes = plasing.saai
  const ouSaam = waar === 'video' ? 0 : (Number(plasing.saam) || 0)

  const merkId = `${muurId}_${toestel}`
  const reeds = await leesDok(SAAM, merkId)
  if (reeds) {
    return res.status(200).json({
      ok: true, reeds: true,
      reaksies: saamTelReaksies(plasing.reaksies, eerstes),
      saam: ouSaam,
      myne: reeds.reaksie || '',
    })
  }

  await skryfDok(SAAM, merkId, {
    muurId, toestel, reaksie: soort,
    dag: new Date().toISOString().slice(0, 10),
  })

  const tellings = { ...(plasing.reaksies || {}) }
  tellings[soort] = (Number(tellings[soort]) || 0) + 1
  await skryfDok(vers, muurId, { reaksies: tellings }, { velde: ['reaksies'] })

  return res.status(200).json({
    ok: true,
    reaksies: saamTelReaksies(tellings, eerstes),
    saam: ouSaam,
    myne: soort,
  })
}

/* ── 'n Woord van ondersteuning ── */
/* ── Die naam word HIER weer gekeur ──
 *
 * Die skerm keur dit ook, en dit maak nie saak nie: 'n kliënt se woord oor sy
 * eie naam is nooit genoeg nie. Wie die versoek met 'n gereedskapstuk stuur,
 * omseil elke veld op die skerm — en dit is presies hoe iemand "Dewald
 * Scheepers" word onder 'n pastorale antwoord.
 *
 * Dieselfde reëls, een lêer: src/data/sorgProfiel.js. 'n Geweierde naam maak
 * die opmerking ANONIEM in plaas van om dit te weier — die mens se woorde
 * hoort op die muur; sy gekose naam nie.
 *
 * `rol` word NOOIT uit die versoek gelees nie. Die verifikasie-merk hang aan
 * 'n veld wat net die bediener stel. */
function keurSkrywer({ naam, foto }) {
  const k = keurNaam(naam)
  if (k.fout || !k.naam) return { naam: '', foto: '', anoniem: true }
  const f = String(foto || '')
  return {
    naam: k.naam,
    /* 'n Gekropte data-URI (sien src/data/sorgProfielBerging.js) of 'n
       http-adres. Niks anders word 'n <img src> op 'n openbare blad nie. */
    foto: /^data:image\/(jpeg|png|webp);base64,/.test(f) && f.length < 200000 ? f : '',
    anoniem: false,
  }
}

async function doenWoord(res, { muurId, toestel, woordSleutel, teks, waar, skrywer }) {
  const plasing = await leesDok(versamelingVir(waar), muurId)
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
      /* Gevlag beteken NIE weggesteek nie. Dit wys saam met die res; die
         vlag sê net vir Dewald waarna om te kyk. */
      gevlag: (uitslag.vlae || []).length > 0,
      ...(uitslag.rede ? { rede: uitslag.rede } : {}),
    }
  }

  const id = 'w' + Date.now().toString(36) + crypto.randomBytes(3).toString('hex')
  await skryfDok(WOORDE, id, {
    ...doc,
    /* Wie praat. Sonder 'n profiel is dit leeg en die opmerking bly anoniem,
       presies soos die hele muur voorheen was. */
    skrywerNaam: skrywer.naam,
    skrywerFoto: skrywer.foto,
    anoniem: skrywer.anoniem,
    dag: vandag, geskep: new Date(), gerapporteer: 0, bemoedig: 0,
  })

  return res.status(200).json({
    ok: true,
    wag: doc.status === 'wag',
    woord: doc.status === 'wys' ? { id, teks: doc.teks, bron: doc.bron } : null,
  })
}

/* ── Rapporteer ──
 *
 * EEN rapport verwyder NIKS meer nie.
 *
 * Hier het een druk 'n opmerking DADELIK van die muur afgehaal. Die redenasie
 * was regverdig op 'n klein muur: 'n woord wat verkeerdelik weg is, kan Dewald
 * terugsit, en 'n woord wat iemand seermaak, moet nie staan en wag nie.
 *
 * Op 'n groot muur is dit iets anders: 'n knoppie waarmee enige mens enige
 * ander mens se woorde kan laat verdwyn. Op 'n blad waar mense oor hul
 * huwelike en hul kinders skryf, is dit presies die mag wat misbruik gaan word
 * teen die een wat iemand wil stilmaak.
 *
 * Dewald: "Een report moet nie gewone veilige inhoud outomaties permanent
 * verwyder nie. Ernstige outomatiese veiligheidsmerke mag inhoud tydelik
 * versteek totdat dit nagegaan is."
 *
 * Dus TEL dit, en by drie verskillende toestelle word dit versteek. Een druk
 * per toestel, met dieselfde merkie-truuk as saamstaan — anders is die drempel
 * betekenisloos.
 *
 * "Dit klink of iemand in gevaar is" versteek NIKS. Dit maak die ding dringend
 * sodat 'n mens NOU kyk. Nood is nie oortreding nie; sien
 * src/data/sorgModereer.js. */
async function doenRapport(res, { woordId, toestel, rede }) {
  const w = await leesDok(WOORDE, woordId)
  if (!w) return res.status(404).json({ fout: 'daardie woord bestaan nie' })

  /* Een per toestel. Sonder dit kan een mens die drempel op sy eie haal en dan
     is die hele verandering niks werd nie. */
  if (toestel) {
    const merkId = `wr_${woordId}_${toestel}`
    const reeds = await leesDok(SAAM, merkId)
    if (reeds) return res.status(200).json({ ok: true, reeds: true })
    await skryfDok(SAAM, merkId, {
      woordId, toestel, soort: 'rapport', rede,
      dag: new Date().toISOString().slice(0, 10),
    })
  }

  const rapporte = (Number(w.gerapporteer) || 0) + 1
  const redes = [...new Set([...(Array.isArray(w.redes) ? w.redes : []), rede].filter(Boolean))]
  const uit = naRapport({ rapporte, redes, outoOnveilig: w.outoOnveilig === true })

  await skryfDok(WOORDE, woordId, {
    /* Dit BLY wys tot by die drempel. Dit is die hele verandering. */
    status: uit.wys ? (w.status || 'wys') : 'wag',
    gerapporteer: rapporte,
    redes,
    dringend: uit.dringend,
    rede: uit.rede,
  }, { velde: ['status', 'gerapporteer', 'redes', 'dringend', 'rede'] })

  return res.status(200).json({
    ok: true,
    /* Die skerm moet WEET of dit weg is. 'n Bevestiging wat sê "dit is weg"
       terwyl dit nog staan, is 'n leuen; en een wat niks sê nie, laat 'n mens
       wonder of sy druk gewerk het. */
    weg: !uit.wys,
    rapporte,
  })
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
    if (lyf.rapporteer) {
      return await doenRapport(res, {
        woordId: String(lyf.rapporteer).slice(0, 40),
        toestel: hasToestel(lyf.toestel),
        rede: keurRede(lyf.rede),
      })
    }

    if (lyf.aksie === 'bemoedig') {
      const woordId = skoonId(lyf.woordId)
      if (!woordId) return res.status(400).json({ fout: 'geen opmerking nie' })
      const t = hasToestel(lyf.toestel)
      /* Sonder 'n toestel-id kan ons nie 'n dubbele druk keer nie, en dan tel
         ons liewer niks as om 'n telling te laat lieg. */
      if (!t) return res.status(200).json({ ok: true, reeds: true })
      const teken = TEKENS.includes(lyf.teken) ? lyf.teken : TEKENS[0]
      return await doenBemoedig(res, { woordId, toestel: t, teken })
    }

    const muurId = skoonId(lyf.muurId)
    if (!muurId) return res.status(400).json({ fout: 'geen plasing nie' })

    const toestel = hasToestel(lyf.toestel)
    /* Sonder 'n toestel-id kan ons nie 'n dubbele druk keer nie, en dan tel
       ons liewer niks as om 'n telling te laat lieg. */
    if (!toestel) return res.status(200).json({ ok: true, reeds: true })

    const waar = lyf.soort === 'video' ? 'video' : 'muur'

    if (lyf.reaksie) return await doenReaksie(res, { muurId, toestel, reaksie: lyf.reaksie, waar })
    if (lyf.woord || typeof lyf.teks === 'string') {
      return await doenWoord(res, {
        muurId, toestel, waar,
        woordSleutel: lyf.woord ? String(lyf.woord).slice(0, 40) : '',
        teks: lyf.teks,
        skrywer: keurSkrywer({ naam: lyf.naam, foto: lyf.foto }),
      })
    }
    return res.status(400).json({ fout: 'niks om te doen nie' })
  } catch (e) {
    return res.status(500).json({ fout: String(e && e.message) })
  }
}

export { REAKSIES }
