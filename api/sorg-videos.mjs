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
import { keurOnderwerp } from '../src/data/sorgOnderwerpe.js'

const VERSAMELING = 'sorg_videos'

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
        .sort((a, b) => String(b.datum || '').localeCompare(String(a.datum || '')))

      /* Die week se video: die een wat gemerk is, anders die nuutste. Daar
         moet ALTYD een wees as daar enige video is — 'n leë held bo-aan die
         blad laat die hele bladsy dood lyk. */
      const week = lys.find(v => v.weekVideo && v.gepubliseer) || lys.find(v => v.gepubliseer) || null

      res.setHeader('Cache-Control', admin ? 'no-store' : 'public, max-age=60, s-maxage=300')
      return res.status(200).json({ videos: lys, week: week ? week.id : null })
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
