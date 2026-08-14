/* Die logika agter "Stuur vir my 'n toetsboodskap", los van die netwerk.
 *
 * Waarom hierdie ding bestaan
 * ───────────────────────────
 * 'n Groen merkie op 'n skerm bewys niks. Dewald en sy vrou het albei
 * toestemming gehad, albei 'n token gehad, FCM het die boodskap aanvaar met 'n
 * boodskap-id — en niks het op die foon verskyn nie.
 *
 * Die ENIGSTE eerlike toets is om werklik een boodskap te stuur en te kyk wat
 * FCM sê. Daar is geen "is hierdie token lewendig"-navraag by Google nie; 'n
 * mens leer dit eers wanneer 'n stuur `UNREGISTERED` teruggee.
 *
 * Wat hier getoets word, is die BESLUITE. Die netwerk sit in
 * api/toets-kennisgewing.js.
 */

/* 'n Token is 'n lang ondeursigtige string van Google. Ons aanvaar niks
 * anders nie — hierdie eindpunt praat met FCM en 'n rou string uit 'n versoek
 * se liggaam mag nooit ongekeur daarheen gaan nie. */
function geldigeToken(rou) {
  if (typeof rou !== 'string') return null
  const t = rou.trim()
  if (t.length < 20 || t.length > 4096) return null
  /* FCM se registrasietokens is base64url met kolons en strepies. Enigiets
     buite hierdie stel is nie 'n token nie.

     Skryf die stel UIT. `[A-Za-z0-9:_-]` lyk onskuldig, maar 'n reeks soos
     ` -:` in 'n karakterklas is 'n REEKS van spasie tot dubbelpunt en laat
     stilweg goed deur wat 'n mens nooit bedoel het nie. */
  if (!/^[A-Za-z0-9:_-]+$/.test(t)) return null
  return t
}

/* Wat sê FCM se antwoord vir 'n MENS?
 *
 * Die kodes is die deel wat saak maak:
 *   UNREGISTERED / NOT_FOUND  die token is dood — die app is herinstalleer,
 *                             of die berging is skoongemaak. Ons moet 'n
 *                             nuwe een kry.
 *   INVALID_ARGUMENT          die token behoort nie aan hierdie projek nie
 *   429 / 503                 Google is besig; dit sê NIKS oor die foon nie
 */
function lesUitslag({ ok, status, foutKode }) {
  if (ok) return { ok: true, staat: 'gestuur' }

  if (foutKode === 'UNREGISTERED' || foutKode === 'NOT_FOUND') {
    return { ok: false, staat: 'dood' }
  }
  if (foutKode === 'INVALID_ARGUMENT') {
    return { ok: false, staat: 'ongeldig' }
  }
  if (status === 429 || status === 503 || status === 500) {
    return { ok: false, staat: 'probeer_weer' }
  }
  return { ok: false, staat: 'fout' }
}

/* Die woorde wat die mens sien. Hulle staan hier, by die besluit, sodat 'n
 * toets kan eis dat elke staat woorde het — 'n stil mislukking is presies
 * die ding wat ons probeer uitroei. */
const UITSLAG_WOORDE = {
  gestuur:      'Gestuur! Kyk na jou foon se kennisgewings.',
  dood:         'Hierdie foon was nie meer ingeteken nie. Ons het dit reggestel — probeer weer.',
  ongeldig:     'Hierdie foon was nie meer ingeteken nie. Ons het dit reggestel — probeer weer.',
  probeer_weer: 'Google is nou besig. Probeer oor ’n oomblik weer.',
  fout:         'Iets het verkeerd geloop. Probeer asseblief weer.',
}

/* Wanneer die token dood is, moet die dokument weg. Anders probeer die
 * oggendlopie dit elke dag weer — dit is presies hoe daar 2 170 dooies in
 * die versameling beland het. */
function moetUitvee(staat) {
  return staat === 'dood' || staat === 'ongeldig'
}

module.exports = { geldigeToken, lesUitslag, UITSLAG_WOORDE, moetUitvee }
