/* ────────────────────────────────────────────────────────────
   Die deelskakel van 'n KINDERBOEK.

   Die deel-knoppie het `https://dewaldscheepers.com/go/boeke/kinders/<id>`
   gestuur, en daardie pad het niks beteken nie: `/go/...` is nie die
   installeerblad nie (net presies `/go` is dit), die app het die pad nooit
   gelees nie, en wie die skakel gedruk het, het op die tuisblad geland — nie by
   die boek nie. 'n Skakel wat 'n belofte maak ("lees dit saam met jou kind") en
   dan nie die boek wys nie, word nooit weer gestuur nie.

   Nou: `https://www.dewaldscheepers.com/boeke/kinders/<id>`.

   · `www`, want die kaal domein stuur deur na www, en Android kan 'n app nie
     aan 'n domein koppel wat deurstuur nie;
   · `/boeke/...`, want die Android-app se manifest maak reeds alles onder
     `/boek` in die app oop — 'n nuwe voorvoegsel sou 'n nuwe bou van die app
     kos;
   · die OU vorm (`/go/boeke/kinders/<id>`) word steeds gelees, want daardie
     skakels lê reeds in mense se WhatsApp-gesprekke.
   ──────────────────────────────────────────────────────────── */

export const BASIS = 'https://www.dewaldscheepers.com'

const ID = /^[A-Za-z0-9_-]{1,120}$/

export function kinderBoekSkakel(id, basis = BASIS) {
  const skoon = String(basis || BASIS).replace(/\/+$/, '')
  return `${skoon}/boeke/kinders/${encodeURIComponent(String(id || '').trim())}`
}

/* Lees die id uit 'n pad. `null` vir enigiets anders. */
export function kinderBoekUitPad(pad) {
  const m = String(pad || '').match(/^(?:\/go)?\/boeke\/kinders\/([^/?#]+)\/?$/i)
  if (!m) return null
  let id
  try { id = decodeURIComponent(m[1]) } catch { return null }
  id = id.trim()
  return ID.test(id) ? id : null
}
