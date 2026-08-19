/* ── Waar 'n mens 'n prent GAAN HAAL om hom te deel ──
 *
 * Nie waar hy WYS nie. Dit is die hele fyn punt, en dit het hierdie kodebasis
 * nou twee keer gekos.
 *
 * Die wallpapers lê op `firebasestorage.googleapis.com`, en daardie emmer het
 * geen CORS-opstelling nie. 'n `<img src>` of 'n CSS-`background-image` wys hom
 * sonder moeite — die blaaier vra nooit toestemming om net te WYS nie. Maar
 *
 *     await fetch(prentUrl)
 *
 * van 'n ander domein af word geblokkeer, en dít is wat 'n mens moet doen om
 * 'n LÊER te deel. Die prent wys dus mooi op die skerm en die deelknoppie doen
 * niks. Dewald, oor Dag 1 se wallpaper: "hierdie wallpaper wil nie deel nie."
 *
 * `api/wallpaper.js` bestaan presies hiervoor: die bediener haal die prent en
 * gee hom terug vanaf ONS domein, waar daar geen CORS-vraag is nie. Daardie
 * eindpunt het sy eie hekke (net https, net ons emmer, net 'n prent, en klein
 * genoeg) sodat dit nie 'n oop deurgang word nie.
 *
 * Hierdie funksie staan hier — en nie in 'n skerm nie — omdat Luister dit
 * gehad het en VOLG JESUS nie. Een kopie het gewerk, die ander een het stil
 * misluk. 'n Reël wat op twee plekke geskryf word, is 'n reël wat op een plek
 * gaan agterbly.
 */
/* Iets met 'n skema voor: `https:`, `data:`, `blob:`. Alles anders is 'n pad op
   ons eie bediener, en daar is niks om te proxy nie. */
const HET_SKEMA = /^[a-z][a-z0-9+.-]*:/i

export function prentPad(url) {
  if (!url || typeof url !== 'string') return url
  /* 'n Relatiewe pad — '/beelde/x.jpg' — is reeds ons eie domein. Dit moet hier
     uitkom SONDER 'n blaaier ook, anders proxy die toets iets wat 'n foon nooit
     sou proxy nie, en dan meet die toets die verkeerde ding. */
  if (!HET_SKEMA.test(url) && !url.startsWith('//')) return url
  try {
    const basis = typeof window !== 'undefined' ? window.location.href : 'https://dewaldscheepers.com'
    const u = new URL(url, basis)
    /* `data:` en `blob:` dra die grepe self — daar is niks om te gaan haal nie. */
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return url
    /* Ons eie domein: haal dit net so. */
    if (typeof window !== 'undefined' && u.origin === window.location.origin) {
      return u.toString()
    }
    return `/api/wallpaper?u=${encodeURIComponent(u.toString())}`
  } catch {
    return url
  }
}
