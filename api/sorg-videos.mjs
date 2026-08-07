/* ────────────────────────────────────────────────────────────
   Die video's van Pastorale Sorg.

     GET  /api/sorg-videos            → die gepubliseerde lys
     POST /api/sorg-videos            → stoor, versteek of vee uit (admin)

   Hoekom die lees deur die bediener loop en nie direk uit Firestore nie:
   die kliënt hoef dan niks van die versameling te weet nie, die rand kan die
   antwoord 'n paar minute hou, en dieselfde pad dra later die muur — waar 'n
   kliënt WEL nooit mag lees nie.

   'n Video is 'n YouTube-ID, nie 'n lêer nie. Dieselfde patroon as die
   Saterdagvideo wat reeds op Luister werk. Video-bandwydte uit ons eie
   berging sou duur wees en sleg stroom op 'n swak sein, en 'n swak sein is
   in Suid-Afrika die gewone geval.
   ──────────────────────────────────────────────────────────── */

import { lysDokke, skryfDok, veeDok, magSkryf } from './_sorgFirestore.mjs'
import { keurOnderwerp, raaiOnderwerpe } from '../src/data/sorgOnderwerpe.js'
import { ontleedPlak } from '../src/data/sorgVideos.js'
import { saaiReaksies, saaiWoorde } from '../src/data/sorgSaai.js'
import { saamTelReaksies } from '../src/data/sorgSaamstaan.js'

const VERSAMELING = 'sorg_videos'
const WOORDE = 'sorg_woorde'

/* 'n YouTube-ID is 11 karakters. Ons aanvaar ook 'n hele skakel en haal die
   ID daaruit — dieselfde as die Saterdagvideo se admin. */
function haalVideoId(inset) {
  const s = String(inset || '').trim()
  const shorts = s.match(/shorts\/([a-zA-Z0-9_-]{6,})/)
  if (shorts) return shorts[1]
  const watch = s.match(/[?&]v=([a-zA-Z0-9_-]{6,})/)
  if (watch) return watch[1]
  const kort = s.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/)
  if (kort) return kort[1]
  const bed = s.match(/embed\/([a-zA-Z0-9_-]{6,})/)
  if (bed) return bed[1]
  if (/^[a-zA-Z0-9_-]{6,20}$/.test(s)) return s
  return null
}

function skoonTeks(t, maks) {
  return String(t || '')
    /* Beheerkarakters uit, as KODEPUNTE geskryf.

       '[ -<>]' lyk soos vier karakters maar is 'n REEKS van spasie
       (0x20) tot < (0x3C) — dit gooi syfers en spasies weg. Ek het dit
       hier oorspronklik weer gedoen. Sien CLAUDE.md. */
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maks)
}

/* ── Die titel, van YouTube self ──

   oEmbed is 'n oop eindpunt: geen sleutel, geen kwota, een oproep. Dit is
   die verskil tussen veertig video's wat elkeen 'n titel moet kry en veertig
   wat sommer ingaan.

   Misluk dit — YouTube stadig, video privaat, verkeerde id — val ons terug
   op die id in plaas van om die hele invoer te laat val. 'n Video met 'n
   lelike naam is 'n naam wat Dewald kan regmaak; 'n video wat nie ingekom
   het nie, is werk wat hy weer moet doen. */
async function haalTitel(videoId) {
  try {
    const u = 'https://www.youtube.com/oembed?format=json&url=' +
      encodeURIComponent('https://www.youtube.com/watch?v=' + videoId)
    const r = await fetch(u, { headers: { accept: 'application/json' } })
    if (!r.ok) return videoId
    const d = await r.json()
    const t = skoonTeks(d && d.title, 120)
    return t || videoId
  } catch {
    return videoId
  }
}

function skoonVideo(lyf) {
  const videoId = haalVideoId(lyf.videoId || lyf.skakel)
  if (!videoId) return { fout: 'geen geldige YouTube-skakel of ID nie' }

  const titel = skoonTeks(lyf.titel, 120)
  if (!titel) return { fout: 'die video het \'n titel nodig' }

  const rou = Array.isArray(lyf.onderwerpe) ? lyf.onderwerpe : []
  const onderwerpe = [...new Set(rou.map(keurOnderwerp))].slice(0, 6)

  return {
    video: {
      videoId,
      titel,
      beskrywing: skoonTeks(lyf.beskrywing, 400),
      onderwerpe,
      datum: /^\d{4}-\d{2}-\d{2}$/.test(lyf.datum || '') ? lyf.datum : new Date().toISOString().slice(0, 10),
      /* Dewald neem met sy foon op, regop, en laai dit as 'n Short. In 'n
         16:9-raam is so 'n video 'n dun strokie met swart weerskante. Die
         speler draai saam sodra hierdie merkie aan is.

         Dit is 'n merkie en nie iets wat ons raai nie: YouTube se API sou
         vir ons kon sê hoe die video lyk, maar dan hang die blad van 'n
         tweede diens af om te weet hoe om 'n raam te teken. Een blokkie in
         die admin is goedkoper en dit breek nooit. */
      regop: !!lyf.regop,
      weekVideo: !!lyf.weekVideo,
      gepubliseer: lyf.gepubliseer !== false,
      /* Wanneer 'n video uit iemand se boodskap ontstaan het. Dit wys op die
         video as "Hierdie video het by iemand se boodskap begin" en dit is
         een van die sterkste dinge op die hele blad: mense sien dat plaas
         iets veroorsaak. */
      uitPlasing: skoonTeks(lyf.uitPlasing, 60) || null,
    },
  }
}

/* Die somtelling woon in `src/data/sorgSaamstaan.js`, saam met die druk-pad
   s'n. Hier het 'n eie kopie gestaan, en die druk-pad het glad nie saamgetel
   nie — 'n mens sien 3, druk een keer, en die getal spring na 1. Een funksie,
   een antwoord. */
const saamTel = saamTelReaksies

/* Presies dieselfde saai as op die muur, en net so idempotent: die reaksies
   le in 'n APARTE veld wat GESTEL word en nie opgetel nie, en die
   opmerkings kry vaste id's. Loop dit twee keer, is die antwoord dieselfde. */
const MAKS_SAAI = 8

/* ── Waarom hier 'n weergawe is ──

   Die saai loop EEN keer per video en slaan daarna oor. Dit is reg — anders
   sou elke oproep weer skryf.

   Maar toe die woorde verander (die muur se sinne het onder 'n video vals
   gelees), was die veertien video's reeds gesaai. Hulle sou vir altyd die ou
   sinne gedra het, en die enigste manier om dit reg te kry, sou wees om met
   die hand in Firestore te gaan krap.

   'n Weergawe-nommer los dit: hoog dit op, en elke video saai weer met die
   nuwe woorde. Die opmerkings behou dieselfde dokument-name (`saai_<id>_<i>`),
   dus word hulle OORGESKRYF en nie bygevoeg nie. Loop dit tien keer, is die
   antwoord dieselfde. */
const SAAI_WEERGAWE = 2

async function saaiVideos(lys) {
  const oor = lys.filter(v => Number(v.saaiWeergawe || 0) < SAAI_WEERGAWE).slice(0, MAKS_SAAI)
  for (const v of oor) {
    await skryfDok(VERSAMELING, v.id, { saai: saaiReaksies(v.id), gesaai: true, saaiWeergawe: SAAI_WEERGAWE },
      { velde: ['saai', 'gesaai', 'saaiWeergawe'] })
    v.saai = saaiReaksies(v.id)
    v.gesaai = true
    v.saaiWeergawe = SAAI_WEERGAWE

    const woorde = saaiWoorde(v.id, 'video')
    for (let i = 0; i < woorde.length; i++) {
      const w = woorde[i]
      await skryfDok(WOORDE, `saai_${v.id}_${i}`, {
        muurId: v.id,
        toestel: `saai:${i}`,
        teks: w.teks,
        naam: w.naam,
        bron: w.bron,
        status: 'wys',
        sleutel: '',
        rang: i,
        dag: String(v.datum || '').slice(0, 10),
        gerapporteer: 0,
      })
    }
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Sorg-Geheim')
  if (req.method === 'OPTIONS') return res.status(200).end()

  /* ── Lees ── */
  if (req.method === 'GET') {
    try {
      const alles = await lysDokke(VERSAMELING, { grootte: 500 })
      const admin = magSkryf(req).ok
      const lys = alles
        .filter(v => v.videoId && (admin || v.gepubliseer))
        /* Datum eerste, dan die id AFLOPEND.

           'n Hele invoer kry dieselfde datum, en sonder 'n tweede sleutel
           was die volgorde binne 'n dag wat ook al Firestore teruggegee het.
           Dewald plak van oudste na nuutste, en elke ingevoerde video kry 'n
           oplopende `volgorde`, dus sit die laaste een wat hy geplak het bo.
           Video's van voor hierdie verandering het geen volgorde en val op
           nul terug — wat reg is, want hulle is ouer. */
        .sort((a, b) => {
          const d = String(b.datum || '').localeCompare(String(a.datum || ''))
          if (d) return d
          const v = (Number(b.volgorde) || 0) - (Number(a.volgorde) || 0)
          if (v) return v
          return String(b.id || '').localeCompare(String(a.id || ''))
        })

      /* Die week se video: die een wat gemerk is, anders die nuutste. Daar
         moet ALTYD een wees as daar enige video is — 'n leë held bo-aan die
         blad laat die hele bladsy dood lyk. */
      const week = lys.find(v => v.weekVideo && v.gepubliseer) || lys.find(v => v.gepubliseer) || null

      /* ── Dieselfde balk as op die muur ──

         'n Video kry presies dieselfde: hou van, reageer, deel. Sonder dit
         is die Video's-oortjie 'n rak en die muur 'n plek — en dan gaan
         niemand na die rak toe nie.

         Die eerstes werk ook hier: drie reaksies en drie opmerkings, een
         van Daaglikse Hoop en twee anoniem. 'n Vars video met 'n nul onder
         hom lyk soos iets wat niemand gekyk het nie. */
      await saaiVideos(lys.filter(v => v.gepubliseer))

      const woorde = (await lysDokke(WOORDE, { grootte: 300 }))
        .filter(w => w.status === 'wys' && w.teks)
        .sort((a, b) => {
          const r = (b.rang !== undefined ? 1 : 0) - (a.rang !== undefined ? 1 : 0)
          if (r) return r
          if (a.rang !== undefined && b.rang !== undefined) return a.rang - b.rang
          return String(a.id).localeCompare(String(b.id))
        })

      const uit = lys.map(v => {
        const myne = woorde.filter(w => w.muurId === v.id)
        return {
          ...v,
          reaksies: saamTel(v.reaksies, v.saai),
          saam: 0,
          woorde: myne.slice(0, 50).map(w => ({
            id: w.id,
            teks: w.teks,
            wanneer: w.dag || '',
            naam: w.bron === 'hoop' ? (w.naam || '') : '',
            hoop: w.bron === 'hoop',
          })),
          woordeTotaal: myne.length,
        }
      })

      /* GEEN kas nie. Die tellings verander sodra iemand druk, en 'n
         telling wat lieg is erger as geen telling nie — dieselfde les as
         die muur s'n. */
      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).json({ videos: uit, week: week ? week.id : null })
    } catch (e) {
      /* 'n Stukkende biblioteek mag nie die blad doodmaak nie. Die skerm wys
         dan bloot geen video's nie. */
      return res.status(200).json({ videos: [], week: null, fout: String(e && e.message) })
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ fout: 'Method Not Allowed' })

  /* ── Skryf ── */
  const mag = magSkryf(req)
  if (!mag.ok) return res.status(401).json({ fout: mag.rede })

  let lyf = req.body
  if (typeof lyf === 'string') { try { lyf = JSON.parse(lyf) } catch { lyf = null } }
  if (!lyf || typeof lyf !== 'object') return res.status(400).json({ fout: 'geen data nie' })

  try {
    /* ── Plak baie skakels op 'n slag ──

       Dewald plaas elke dag op TikTok en Facebook. Daardie video's bestaan
       reeds; hulle moet net 'n permanente huis kry. Een vir een bytik is
       veertig keer dieselfde vyf velde, en dan gebeur dit nie.

       Hy plak dus 'n lys skakels en die bediener doen die res:

         · die video-id kom uit enige YouTube-vorm — /watch, youtu.be,
           /shorts, /embed;
         · 'n /shorts/-skakel is per definisie REGOP. Dit is die enigste
           betroubare manier om dit te weet sonder om YouTube se API te vra,
           en dit is presies hoe hy oplaai;
         · die TITEL kom van YouTube self, via oEmbed. Geen sleutel nodig,
           een oproep per video. Misluk dit, val ons terug op die id sodat
           die video steeds inkom en hy dit self kan hernoem.

       Wat NIE outomaties gebeur nie, is die ONDERWERP. Dit is die deel wat
       die biblioteek bruikbaar maak, en net 'n mens weet waaroor 'n video
       gaan. Hulle kom dus ONGEPUBLISEER in — dan kan hy hulle rustig merk
       sonder dat 'n onbenoemde video intussen op die blad wys. */
    if (lyf.aksie === 'invoer') {
      const items = ontleedPlak(lyf.skakels)
      if (!items.length) return res.status(400).json({ fout: 'geen skakels nie' })
      if (items.length > 100) return res.status(400).json({ fout: 'hoogstens 100 op ’n slag' })

      const bestaan = new Set((await lysDokke(VERSAMELING, { grootte: 500 })).map(v => v.videoId))
      const uit = { bygevoeg: 0, oorgeslaan: 0, sleg: 0, name: [], sonderOnderwerp: [] }

      /* ── Die VOLGORDE ──

         Dewald plak sy lys van oudste na nuutste — die eerste een moet
         onder wees en die laaste een bo. Die blad sorteer op datum, en 'n
         hele invoer kry dieselfde datum, dus sou hulle in 'n ewekansige
         volgorde beland het.

         Ons skryf hulle dus in die volgorde waarin hy hulle geplak het, en
         die id dra 'n oplopende toonbank. Die lys sorteer op datum en dan op
         id AFLOPEND, sodat die LAASTE een wat ingekom het, bo staan. Geen
         vals datums, en 'n tweede invoer more val natuurlik bo vandag s'n. */
      let toonbank = 0

      for (const item of items) {
        const videoId = haalVideoId(item.skakel)
        if (!videoId) { uit.sleg++; continue }
        if (bestaan.has(videoId)) { uit.oorgeslaan++; continue }
        bestaan.add(videoId)

        /* SY titel wen. Hy het dit self geskryf, dit is in sy stem, en die
           emoji is deel van hoe die blad lyk. Net as hy niks gegee het nie,
           gaan haal ons dit by YouTube. */
        const titel = skoonTeks(item.titel, 120) || await haalTitel(videoId)

        /* Die onderwerp uit die titel. Konserwatief — sien `raaiOnderwerpe`.
           Kry dit niks, kom die video steeds in, net onder "Nog boodskappe
           van hoop" waar hy niemand verkeerd bedien nie. */
        const onderwerpe = raaiOnderwerpe(titel)

        /* 'n EKSPLISIETE getal, nie die id se vorm nie.

           Ek het dit eers op die id gesorteer. Dit sou stil verkeerd gewees
           het: ou id's is base36 en begin met 'n LETTER, nuwes sou met 'n
           syfer begin het, en '0' sorteer voor 'm'. Elke ou video sou dus bo
           elke nuwe een gestaan het op dieselfde dag.

           'n Getal wat ek self skryf, kan nie so breek nie. Video's van voor
           hierdie verandering het niks, en `Number(undefined) || 0` maak
           hulle nul — wat reg is, want hulle is ouer. */
        const volgorde = Date.now() * 1000 + (toonbank++)
        const id = 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
        await skryfDok(VERSAMELING, id, {
          videoId,
          titel,
          volgorde,
          beskrywing: '',
          onderwerpe,
          datum: new Date().toISOString().slice(0, 10),
          regop: /\/shorts\//i.test(item.skakel),
          weekVideo: false,
          /* Hulle kom GEPUBLISEER in. Vroeer het hulle gewag totdat 'n mens
             die onderwerp gemerk het — maar die onderwerp word nou geraai,
             en 'n video wat in die admin le, help niemand nie. Wat sonder
             onderwerp deurkom, word hier onder gelys sodat hy dit kan
             regmaak. */
          gepubliseer: true,
          uitPlasing: null,
        })
        uit.bygevoeg++
        uit.name.push(titel)
        if (!onderwerpe.length) uit.sonderOnderwerp.push(titel)
      }
      return res.status(200).json({ ok: true, ...uit })
    }

    if (lyf.aksie === 'vee') {
      if (!lyf.id) return res.status(400).json({ fout: 'geen id nie' })
      await veeDok(VERSAMELING, lyf.id)
      return res.status(200).json({ ok: true })
    }

    const { video, fout } = skoonVideo(lyf)
    if (fout) return res.status(400).json({ fout })

    const id = lyf.id || ('v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7))

    /* Net EEN video mag die week se video wees. Merk 'n mens 'n nuwe een,
       gaan die vorige een af — anders is daar twee helde en die blad weet nie
       watter een om te wys nie. */
    if (video.weekVideo) {
      const alles = await lysDokke(VERSAMELING, { grootte: 500 })
      for (const v of alles) {
        if (v.id !== id && v.weekVideo) await skryfDok(VERSAMELING, v.id, { weekVideo: false }, { velde: ['weekVideo'] })
      }
    }

    const uit = await skryfDok(VERSAMELING, id, video)
    return res.status(200).json({ ok: true, video: uit })
  } catch (e) {
    return res.status(500).json({ fout: String(e && e.message) })
  }
}
