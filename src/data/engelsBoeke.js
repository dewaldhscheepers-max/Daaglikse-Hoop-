/* ────────────────────────────────────────────────────────────
   Watter boeke is ENGELS, en die Engelse deel-sin.

   Dewald, 9 Oktober 2026: 'n aparte Engelse e-boekblad (`/english`) wat hy met
   Engelssprekendes kan deel sonder dat hulle eers deur die Afrikaanse app hoef
   te gaan. Die Engelse boeke leef in dieselfde `books`-versameling en tel by
   PRESIES dieselfde teller — hulle dra net 'n `taal`-veld.

   ── Die verstek is Afrikaans, en dit is nie luiheid nie ──

   Elke boek wat vandag bestaan, dra geen `taal`-veld nie. `isEngels()` lees 'n
   ontbrekende veld as Afrikaans, dus bly die hele bestaande e-boekblad presies
   soos hy is en hoef geen ou dokument ooit aangeraak te word nie. Dieselfde
   besluit as `taalVan()` in reels.js.

   Dit is 'n WITLYS: net 'n duidelike Engelse merker tel as Engels. 'n Tikfout
   of 'n onbekende taal val na Afrikaans terug — dit is beter dat 'n boek op die
   gewone blad wys as dat hy in 'n leë Engelse hoek verdwyn waar niemand hom
   soek nie.

   Hierdie lêer is SUIWER: boeke in, 'n antwoord uit. Geen window, geen fetch.
   ──────────────────────────────────────────────────────────── */

/* Die merkers wat as Engels tel. 'en' is wat die admin skryf; 'english' is
   vergewe vir 'n mens wat die woord voluit tik. */
const ENGELS = new Set(['en', 'eng', 'english', 'engels'])

export function isEngels(boek) {
  if (!boek || typeof boek !== 'object') return false
  const t = String(boek.taal || '').toLowerCase().trim()
  return ENGELS.has(t)
}

/* Verdeel 'n lys boeke in twee hope. Die Afrikaanse blad wys `afrikaans`
   (alles wat NIE uitdruklik Engels is nie), en die Engelse blad wys `engels`.
   Een boek kan nooit op albei wees nie — dit sou dubbel tel in die oog van die
   leser, en 'n Engelse boek tussen die Afrikaanse boeke is presies wat hierdie
   blad moet vermy. */
export function verdeelPerTaal(boeke) {
  const engels = [], afrikaans = []
  for (const b of Array.isArray(boeke) ? boeke : []) {
    if (isEngels(b)) engels.push(b)
    else afrikaans.push(b)
  }
  return { engels, afrikaans }
}

/* ── Die Engelse deel-sin ──
 *
 * Woord vir woord die patroon van `deelBoodskap` in boekSkakel.js, net in
 * Engels. 'n Mens stuur nie "download this app" aan 'n vriend nie — sy stuur 'n
 * BOEK, en "free" staan daarin omdat dit die ding is wat die ontvanger laat
 * kliek. Die TITEL kom saam, want 'n kaal skakel sê niks.
 */
export function deelBoodskapEn(titel, skakel) {
  const t = String(titel || '').trim()
  const s = String(skakel || '').trim()
  const sin = t
    ? `This free e-book helped me: "${t}". It's completely free to read or listen to.`
    : "This free e-book helped me, and it's completely free to read or listen to."
  return s ? `${sin}\n\n${s}` : sin
}
