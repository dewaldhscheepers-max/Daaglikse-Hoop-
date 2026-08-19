/* ── Die uitnodigingskakel ──
 *
 * Dewald het die eerste uitnodiging op WhatsApp gestuur en gevra: "wat van die
 * mense wat reeds die app op hulle fone het ... nou maak dit die blaaier oop."
 *
 * Toe blyk 'n erger ding: NIKS in die app het die `?kode=` uit daardie adres
 * gelees nie. Wie ook al geklik het, het op die gewone tuisblad geland en niks
 * het gebeur nie. Die kode is gemaak, die skakel is gebou, die groep het bestaan
 * — en die enigste ding wat 'n mens moes doen, was die een ding wat nêrens
 * geskryf was nie.
 *
 * ── Wat hier suiwer is, en waarom ──
 *
 * `kodeUitAdres()` vat 'n pad en 'n navraagstring en gee 'n kode of niks. Geen
 * `window`, geen storting. Dan kan elke vorm van die skakel getoets word sonder
 * 'n blaaier, en dit is nodig: die skakel word in WhatsApp, e-pos en Facebook
 * geplak, en elkeen van hulle vat 'n adres anders vas.
 *
 * ── Hoekom sessionStorage ──
 *
 * Dieselfde les as die steunblad. Die diensketter herlaai die blad by 'n eerste
 * besoek wanneer daar 'n nuwe weergawe is. Skryf ons die pad dadelik na '/' en
 * hou die bedoeling net in React se toestand, dan is dit ná daardie herlaai weg
 * — presies wat 'n mens uit 'n WhatsApp-skakel sou doen.
 *
 * Dit is `session` en nie `local` nie: 'n uitnodiging geld vir HIERDIE besoek.
 * 'n Kode wat vir altyd bly staan, sou 'n mens weke later weer na 'n
 * aansluitskerm stuur.
 */

/* Die kode se vorm word deur keurGroepkode gekeur; hier keur ons net grof, want
   'n adres kan enigiets dra. */
const ROU_KODE = /^[A-Za-z0-9]{4,12}$/

/* Watter paaie 'n uitnodiging is.
 *
 * Die egte skakel is /go/volg-jesus/join. Die res is vorms wat 'n mens self
 * tik of wat 'n bediener herskryf — hulle kos niks, en 'n dooie skakel kos 'n
   lid. */
const PAAIE = [
  '/go/volg-jesus/join',
  '/volg-jesus/join',
  '/go/vj/join',
  '/vj/join',
]

/* Waar die kode in die navraag kan sit. `code` is daar omdat 'n mens dit self
   tik wanneer hy die skakel oortik. */
const SLEUTELS = ['kode', 'code', 'vjkode']

export function kodeUitAdres(pad = '', soek = '') {
  let skoonPad = ''
  try {
    skoonPad = String(pad || '').toLowerCase().replace(/\/+$/, '')
  } catch { return '' }

  let vraag
  try { vraag = new URLSearchParams(String(soek || '')) } catch { return '' }

  let rou = ''
  for (const s of SLEUTELS) {
    const w = vraag.get(s)
    if (w) { rou = w; break }
  }
  if (!rou) return ''

  /* `vjkode` mag op ENIGE pad staan. Dit is die ontsnaproete vir 'n plek wat
     die pad herskryf — party skakelverkorters en Facebook se voorskou doen
     dit — en dit kan nie met iets anders bots nie, want niks anders in hierdie
     app gebruik daardie naam nie. */
  const perNaam = !!vraag.get('vjkode')
  if (!perNaam && !PAAIE.includes(skoonPad)) return ''

  const skoon = String(rou).trim().toUpperCase()
  return ROU_KODE.test(skoon) ? skoon : ''
}

/* ── Die bedoeling, oor 'n herlaai heen ── */
export const NOOI_SLEUTEL = 'vj_nooi_kode'

export function stoorNooi(kode, berging) {
  const s = berging || (typeof sessionStorage !== 'undefined' ? sessionStorage : null)
  if (!s || !kode) return false
  try { s.setItem(NOOI_SLEUTEL, kode); return true } catch { return false }
}

export function leesNooi(berging) {
  const s = berging || (typeof sessionStorage !== 'undefined' ? sessionStorage : null)
  if (!s) return ''
  try {
    const w = s.getItem(NOOI_SLEUTEL) || ''
    return ROU_KODE.test(w) ? w : ''
  } catch { return '' }
}

/* Dit word gevee sodra die aansluitskerm dit GEBRUIK het, nie wanneer die mens
   aansluit nie. Anders staan iemand wat die skerm sluit sonder om aan te sluit,
   vas: elke keer as hy VOLG JESUS oopmaak, spring hy terug na die kode. */
export function veeNooi(berging) {
  const s = berging || (typeof sessionStorage !== 'undefined' ? sessionStorage : null)
  if (!s) return
  try { s.removeItem(NOOI_SLEUTEL) } catch {}
}
