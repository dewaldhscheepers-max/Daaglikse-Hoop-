/* ── HET HIERDIE NOTA KLANK? ──
 *
 * Dewald, 24 September 2026: *"hoekom play vandag se stemnota nou nie... ek app
 * oop en toe gmaak dit speel nogsteeds nie."*
 *
 * "Oorleef 'n herlaai" is die belangrikste woord in daardie sin. 'n Fout in die
 * SKERM se toestand oorleef nie 'n herlaai nie. Wat wel oorleef, is 'n nota wat
 * GEEN klanklêer het nie — die oplaai het gemis, of die dokument is geskep
 * voordat die lêer klaar opgelaai is.
 *
 * 'n Blaaierlopie het gewys wat toe gebeur: die groot speelknoppie staan daar,
 * die mens tik, `toggle()` stel `playing = true`, die knoppie draai om na 'n
 * POUSE-ikoon — en niks speel. Vir ewig, elke keer.
 *
 * Dit is die ding wat CLAUDE.md verbied: *'n speler wat lieg is erger as een
 * wat stukkend is.* Die app het presies twee ander gevalle reeds reg gehad —
 * 'n lêer wat 404 gee en 'n lêer wat nie klank is nie word albei GESÊ — en
 * hierdie een, die stilste van die drie, het niks gesê nie.
 *
 * Hierdie lêer is SUIWER: 'n nota in, 'n antwoord uit.
 */

/* Die woorde wat die skerm wys. Hulle staan hier sodat die toets hulle kan
   vashou en sodat daar EEN weergawe is. */
export const GEEN_KLANK = 'Hierdie boodskap se klank is nog nie gereed nie. Kyk asseblief netnou weer.'

/* Kan hierdie nota GESPEEL word?
 *
 * Net 'n adres tel. 'n Spasie is nie 'n adres nie, en `undefined` wat as die
 * string "undefined" geskryf is — wat gebeur wanneer 'n mens 'n leë veld deur
 * `String()` stuur — ook nie. */
export function hetKlank(nota) {
  if (!nota || typeof nota !== 'object') return false
  const u = String(nota.audioUrl || '').trim()
  if (!u) return false
  if (u === 'undefined' || u === 'null') return false
  return true
}
