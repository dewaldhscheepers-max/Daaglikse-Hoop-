/* ── Wat VOLG JESUS op 'n TOESTEL los ──
 *
 * Die suiwer helfte van "begin heeltemal oor". Dit ken geen Firebase en geen
 * netwerk nie, en dit kan dus met plain `node` getoets word — wat nodig is,
 * want die duur fout hier is nie "dit vee te min uit" nie. Dit is "dit vee te
 * veel uit": 'n mens se Vredepad-naam, sy gunstelinge, sy anonieme uid.
 *
 * Die onsuiwer helfte — die groepe verlaat — staan in volgJesusTerugstel.js.
 */
/* Elke merkie wat VOLG JESUS op 'n toestel los. Dit is 'n VOORVOEGSEL-lys, want
   die antwoorde en die weke se sleutels dra nommers in. */
export const VOORVOEGSELS = [
  'vj_',        /* vj_modus, vj_my_week, vj_plek_w1, vj_klaar_w1, vj_a_w1_*, vj_chat_* */
]

/* Wat 'n mens NIE moet uitvee nie: die anonieme uid. Dit hoort aan die
   installasie en word deur ander dele van die app gebruik. Dit uitvee sou hier
   niks help nie — Firebase gee dieselfde uid terug totdat die app se data
   uitgevee word — en dit sou 'n mens se Vredepad-naam saamvat. */
export const HOU = ['vp_anon_uid']

export function skoonmaakSleutels(sleutels) {
  if (!Array.isArray(sleutels)) return []
  return sleutels.filter(k =>
    typeof k === 'string'
    && !HOU.includes(k)
    && VOORVOEGSELS.some(v => k.startsWith(v)),
  )
}

function vee(berging) {
  if (!berging) return 0
  let n = 0
  try {
    const alles = []
    for (let i = 0; i < berging.length; i++) alles.push(berging.key(i))
    for (const k of skoonmaakSleutels(alles)) { berging.removeItem(k); n++ }
  } catch {}
  return n
}

/* Maak HIERDIE foon skoon. Suiwer genoeg om te toets: gee 'n bergingspaar in,
   of niks vir die egte blaaier. */
export function skoonFoon(plaaslik, sessie) {
  const l = plaaslik || (typeof localStorage !== 'undefined' ? localStorage : null)
  const s = sessie || (typeof sessionStorage !== 'undefined' ? sessionStorage : null)
  return vee(l) + vee(s)
}

