/* ────────────────────────────────────────────────────────────
   Hoe die installasie-telling op die skerm lyk.

   Suiwer, en met die .js-uitbreiding, sodat plain `node` dit kan invoer —
   die toetse loop sonder 'n raamwerk en sonder Vite.

   ── Waarom dit AF rond ──

   Die reel op die skerm sê "meer as 6 400". Rond 'n mens OP, sê 6 499 word
   6 500, dan is daardie sin onwaar — en dit is die een sin op die blad wat
   'n mens moet kan verdedig as iemand vra.

   ── Waarom niks onder 'n duisend nie ──

   Afronding maak 'n klein getal nog kleiner: 940 sou "meer as 900" word. 'n
   Swak getal oorreed niemand nie. Dan liewer stil bly.
   ──────────────────────────────────────────────────────────── */

export function rondAf(n) {
  if (!n || n < 1000) return 0
  return Math.floor(n / 100) * 100
}

/* 6400 → "6 400". 'n Getal sonder spasies lyk soos 'n rekenaar s'n. */
export function metSpasies(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
