/* Tel wat in VOLG JESUS gebeur — een keer per TOESTEL, nie een keer per tik.
 *
 * Dewald wil in die admin sien hoeveel mense begin het. "Hoeveel mense" en
 * "hoeveel keer op 'n knoppie gedruk is" is nie dieselfde getal nie, en die
 * verkeerde een lyk presies soos die regte een — net groter. Iemand wat die
 * app vyf keer oopmaak en elke keer by die week ingaan, is EEN mens.
 *
 * Ons het geen rekeninge nie, en ons wil ook nie een hê nie: 'n toestel-id na
 * die bediener toe stuur is presies wat hierdie projek nêrens doen nie. Die
 * merkie bly dus op die TOESTEL. Die bediener kry 'n optel-met-een en weet
 * niks; die toestel onthou dat hy klaar getel is.
 *
 * Dit oortel nie, en dit ondertel effens: dieselfde mens op twee fone tel
 * twee keer, en 'n mens wat die app afhaal en weer installeer, tel weer. Dit
 * is die regte kant om op te fouteer — 'n getal wat 'n bietjie te laag is,
 * verlei niemand nie.
 *
 * Die suiwer helfte is `sleutelVir` en `magTel`; die res raak aan
 * localStorage en die netwerk.
 */

const VOOR = 'vj_getel_'

/* Die sleutel waaronder hierdie toestel onthou dat hy 'n ding getel het.
   Gee 'n leë string vir enigiets wat ons nie moet tel nie — dan is daar geen
   pad na die bediener nie. */
export function sleutelVir(ding, week, dag) {
  const w = Number(week)
  const d = Number(dag)
  const okWeek = Number.isInteger(w) && w >= 1 && w <= 52

  if (ding === 'oop') return `${VOOR}oop`
  if (ding === 'begin') return okWeek ? `${VOOR}begin_${w}` : ''
  if (ding === 'weekKlaar') return okWeek ? `${VOOR}klaar_${w}` : ''
  if (ding === 'dag') {
    if (!okWeek) return ''
    if (!Number.isInteger(d) || d < 1 || d > 5) return ''
    return `${VOOR}dag_${w}_${d}`
  }
  return ''
}

/* `reeds` is wat hierdie toestel al getel het. Suiwer sodat die reël getoets
   kan word sonder 'n blaaier. */
export function magTel(reeds, ding, week, dag) {
  const s = sleutelVir(ding, week, dag)
  if (!s) return false
  if (!reeds) return true
  const het = typeof reeds.has === 'function'
    ? reeds.has(s)
    : (Array.isArray(reeds) ? reeds.includes(s) : false)
  return !het
}

/* ── Die onsuiwer helfte ──
 *
 * Dit gooi nooit en dit wag nooit. 'n Teller wat die skerm laat wag of 'n
 * fout gooi, is 'n teller wat die program breek om homself te tel — en dan
 * het ons 'n mooi getal en 'n stukkende program.
 *
 * Die merkie word GESKRYF VOORDAT ons stuur. Skryf 'n mens hom eers ná 'n
 * geslaagde antwoord, tel 'n foon op 'n swak lyn elke keer weer wanneer die
 * versoek misluk het — en dan is die getal 'n mengsel van mense en swak
 * netwerke. */
export function tel(ding, week, dag) {
  let sleutel = ''
  try {
    sleutel = sleutelVir(ding, week, dag)
    if (!sleutel) return false
    if (localStorage.getItem(sleutel)) return false
    localStorage.setItem(sleutel, '1')
  } catch { return false }

  try {
    const lyf = { ding }
    if (ding !== 'oop') lyf.week = Number(week)
    if (ding === 'dag') lyf.dag = Number(dag)
    fetch('/api/volg-jesus-telling', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lyf),
      keepalive: true,
    }).catch(() => {})
  } catch {}
  return true
}
