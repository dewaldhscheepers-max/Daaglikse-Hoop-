/* ────────────────────────────────────────────────────────────
   Watter soort skakel is in die Bid Saam-videogebed se veld geplak?

   Dewald, 26 Oktober 2026: *"YouTube blocked the sound and said it's copyright
   protect, but it isn't. Is there no way I can just use the TikTok link?"* Die
   veld het net 'n YouTube-ID geken. Nou neem dit enige van die twee:

     · 'n YouTube-skakel of -ID              → { bron: 'youtube', id }
     · 'n volle TikTok-skakel of kaal post-ID → { bron: 'tiktok',  id }
     · 'n KORT TikTok-skakel (vt.tiktok.com)  → { bron: 'tiktok',  kort: true }
       — die ID sit nie in die string nie; die admin laat die BEDIENER hom
       oopmaak (api/reels-skakel.mjs, dieselfde as die Reels-invoer).
     · enigiets anders                       → { bron: '', id: '' }

   TikTok word EERSTE getoets. 'n Kaal TikTok-ID is 19 syfers, en YouTube se
   keuring sou dalk sy eie 11 karakters daaruit probeer sny.

   Die dokument in Firestore het tot vandag geen `bron` gedra nie. Daarom lees
   `bronVan()` 'n ontbrekende veld as YouTube: elke video wat reeds gestoor is,
   wys presies soos altyd.

   Suiwer. Toetse in videoBron.toets.mjs.
   ──────────────────────────────────────────────────────────── */
import { tiktokIdUit, isKortSkakel } from './tiktokId.js'
import { videoIdUit } from './youtubeId.js'

export function videoBronUit(inset) {
  const s = String(inset == null ? '' : inset).trim()
  if (!s) return { bron: '', id: '', kort: false }

  const tt = tiktokIdUit(s)
  if (tt) return { bron: 'tiktok', id: tt, kort: false }
  if (isKortSkakel(s)) return { bron: 'tiktok', id: '', kort: true }

  /* 'n Ander TikTok-adres wat ons nie kan lees nie, mag nooit as 'n YouTube-ID
     deurglip nie. */
  if (/tiktok\.com/i.test(s)) return { bron: '', id: '', kort: false }

  const yt = videoIdUit(s)
  if (yt) return { bron: 'youtube', id: yt, kort: false }
  return { bron: '', id: '', kort: false }
}

/* Die dokument se bron. Geen veld (elke ou video) is YouTube. */
export function bronVan(dok) {
  return dok && dok.bron === 'tiktok' ? 'tiktok' : 'youtube'
}
