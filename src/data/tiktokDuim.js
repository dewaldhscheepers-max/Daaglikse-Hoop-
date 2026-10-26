/* ────────────────────────────────────────────────────────────
   'n Voorskouprent vir 'n TikTok-video (die videogebed op Bid Saam)

   Dewald, 26 Oktober 2026, met 'n skermkiekie van die pers blok: *"Dit kan
   seker nie 'n preview wys nie???"* YouTube het 'n duimnael by 'n VASTE adres
   (i.ytimg.com/vi/<id>/hqdefault.jpg); TikTok nie.

   TikTok se amptelike, gedokumenteerde oEmbed-diens gee wel een:

       GET https://www.tiktok.com/oembed?url=<die video se adres>
         → { thumbnail_url: "https://p16-sign….tiktokcdn.com/…", … }

   Daardie prent-adres is GETEKEN en verval ná 'n tyd. Daarom word dit nooit in
   Firestore gestoor nie: die bediener (`api/tiktok-duim.mjs`) vra dit vars en
   die rand kas dit net ses uur.

   Dit kan in hierdie houer NIE getoets word nie — www.tiktok.com is geblokkeer.
   Daarom is elke mislukking stil: geen prent nie, dan bly die pers grond en die
   speelknoppie presies soos vroeër. Niks hier kan die kaart breek nie.

   Suiwer. Toetse in tiktokDuim.toets.mjs.
   ──────────────────────────────────────────────────────────── */

const ID = /^[0-9]{17,21}$/
const HANDVATSEL = /^@[A-Za-z0-9._-]{1,60}$/

/* Die video se adres vir oEmbed. Die handvatsel hoort daarin; is daar geen
   (`'n video wat gestoor is voordat ons dit onthou het), gaan 'n plekhouer —
   TikTok vind 'n video op sy ID. */
export function oembedAdres(id, handvatsel) {
  const i = String(id == null ? '' : id).trim()
  if (!ID.test(i)) return ''
  const h = HANDVATSEL.test(String(handvatsel || '')) ? handvatsel : '@tiktok'
  const video = `https://www.tiktok.com/${h}/video/${i}`
  return `https://www.tiktok.com/oembed?url=${encodeURIComponent(video)}`
}

/* Haal die prent uit oEmbed se antwoord. Net 'n https-adres; enigiets anders
   gee 'n leë string, en dan bly die kaart soos hy is. */
export function duimUit(antwoord) {
  const a = antwoord && typeof antwoord === 'object' ? antwoord : null
  if (!a) return ''
  const u = String(a.thumbnail_url || '').trim()
  if (!/^https:\/\/[^\s"'()<>\\]+$/.test(u)) return ''
  return u
}

export function geldigeHandvatsel(h) {
  return HANDVATSEL.test(String(h || '')) ? h : ''
}
