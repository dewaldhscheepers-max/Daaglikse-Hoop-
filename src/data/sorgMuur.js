/* ────────────────────────────────────────────────────────────
   Die muur, van die kliënt se kant.

   Wat hier terugkom, is NET wat 'n mens gelees en goedgekeur het. Die rou
   boodskappe is 'n ander versameling waarby geen kliënt kom nie.

   Die "dra dit saam met jou" word plaaslik onthou sodat die knoppie nie ná
   'n herlaai weer oop staan nie. Die bediener hou sy eie merk — hierdie een
   is bloot vir die oog.
   ──────────────────────────────────────────────────────────── */

import { toestelId } from './sorgStuur'

const PAD = '/api/sorg-muur'
const SAAM_PAD = '/api/sorg-saamstaan'
const SAAM_SLEUTEL = 'sorg_saam'
const REAKSIE_SLEUTEL = 'sorg_reaksies'
const GELEES_SLEUTEL = 'sorg_gelees'

let belofte = null
let gehaalOp = 0

/* Twintig sekondes, nie 'n hele sessie nie.

   Dit was een keer per sessie. Die gevolg: Dewald druk "Ek dra dit saam met
   jou", sy vrou druk ook, hy kom terug na die muur — en die telling staan
   nog op nul. Die skerm het dit eenvoudig nooit weer gaan haal nie.

   Twintig sekondes is kort genoeg dat 'n mens wat wegstap en terugkom die
   nuwe telling sien, en lank genoeg dat 'n paar vinnige oortjie-drukke nie
   elke keer 'n oproep maak nie.

   'n Mislukking word NIE onthou nie — die foon was dalk net 'n oomblik
   aflyn. Dieselfde fout het die Afrikaanse Bybel 'n dag lank laat wegbly. */
const VARS_MS = 20 * 1000

/* Hoe gereeld die muur self weer gaan kyk terwyl iemand daarna staar.

   Dertig sekondes. Kort genoeg dat 'n mens wat 'n rukkie lees, ander se
   reaksies sien inkom; lank genoeg dat 'n foon wat 'n uur oop le nie 'n
   honderd oproepe maak nie. Die muur is klein en die antwoord is 'n paar
   kilogreep. */
export const POLS_MS = 30 * 1000

let laasteSaamtel = null

export function haalMuur() {
  if (!belofte || Date.now() - gehaalOp > VARS_MS) {
    gehaalOp = Date.now()
    belofte = fetch(PAD, { headers: { accept: 'application/json' }, cache: 'no-store' })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then(d => {
        laasteSaamtel = d && d.saamtel ? d.saamtel : null
        return Array.isArray(d.plasings) ? d.plasings : []
      })
      .catch(() => { belofte = null; return [] })
  }
  return belofte
}

/* Die getalle vir die gemeenskapstrook, uit dieselfde oproep. */
export function saamtel() { return laasteSaamtel }

export function vergeetMuur() { belofte = null; gehaalOp = 0 }

/* ── Wat hierdie foon reeds saamdra ── */
export function saamLys() {
  try { return JSON.parse(localStorage.getItem(SAAM_SLEUTEL) || '[]') } catch { return [] }
}

export function draSaamReeds(id) {
  return saamLys().includes(id)
}

function onthouSaam(id) {
  try {
    const lys = [...new Set([id, ...saamLys()])].slice(0, 500)
    localStorage.setItem(SAAM_SLEUTEL, JSON.stringify(lys))
  } catch { /* privaat modus */ }
}

/* "Ek dra dit saam met jou."

   Gee die nuwe telling terug, of null as dit misluk het. Die skerm tel in
   elk geval self een by — 'n mens wat druk, moet dadelik sien dit het
   gewerk, ook op 'n stadige lyn. */
export async function draSaam(muurId) {
  if (draSaamReeds(muurId)) return null

  /* Ons onthou dit eers NADAT die bediener dit bevestig het.

     Voorheen het ons dit vooraf onthou. Iemand op 'n swak lyn — en 'n swak
     lyn is in Suid-Afrika die gewone geval — het dan gedruk, die versoek het
     misluk, en die telling het nooit getel nie. Maar die foon het onthou dat
     hy dit "gedoen" het, dus kon hy dit ook nooit weer probeer nie.

     Die skerm tel in elk geval self dadelik een by, sodat dit oombliklik
     voel. Dit is net wat ONTHOU word wat op die bediener wag. */
  try {
    const r = await fetch(PAD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ muurId, toestel: toestelId() }),
    })
    const d = await r.json()
    if (d && (d.ok || d.reeds)) onthouSaam(muurId)
    return typeof d.saam === 'number' ? d.saam : null
  } catch {
    return null
  }
}

/* ── Watter reaksie hierdie foon op watter plasing gestuur het ──

   Plaaslik onthou sodat die knoppie ná 'n herlaai reeds gemerk staan. Die
   bediener hou sy eie merk; hierdie een is vir die oog. */
function reaksieKaart() {
  try { return JSON.parse(localStorage.getItem(REAKSIE_SLEUTEL) || '{}') } catch { return {} }
}

export function myReaksie(muurId) {
  const k = reaksieKaart()
  /* Wie voor die reaksies "Ek dra dit saam met jou" gedruk het, het reeds
     gedra. Dit tel as 'n hart, sodat sy knoppie gemerk bly. */
  return k[muurId] || (draSaamReeds(muurId) ? 'hoor' : '')
}

function onthouReaksie(muurId, soort) {
  try {
    const k = reaksieKaart()
    k[muurId] = soort
    localStorage.setItem(REAKSIE_SLEUTEL, JSON.stringify(k))
  } catch { /* privaat modus */ }
}

/* Stuur 'n reaksie. Gee die nuwe tellings terug, of null.

   Soos by draSaam word dit eers ONTHOU nadat die bediener bevestig het. 'n
   Swak lyn is in Suid-Afrika die gewone geval, en 'n mens wat gedruk het
   terwyl die versoek misluk, moet weer kan probeer. */
export async function stuurReaksie(muurId, soort) {
  try {
    const r = await fetch(SAAM_PAD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ muurId, toestel: toestelId(), reaksie: soort }),
    })
    const d = await r.json()
    if (d && (d.ok || d.reeds)) {
      onthouReaksie(muurId, d.myne || soort)
      onthouSaam(muurId)
      return d.reaksies || null
    }
    return null
  } catch {
    return null
  }
}

/* ── 'n Woord van ondersteuning ──

   `woord` is 'n SLEUTEL uit Dewald se klaargemaakte lys; `teks` is iemand se
   eie woorde. Nooit albei nie. */
export async function stuurWoord(muurId, { woord = '', teks = '' } = {}) {
  try {
    const r = await fetch(SAAM_PAD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ muurId, toestel: toestelId(), ...(woord ? { woord } : { teks }) }),
    })
    return await r.json()
  } catch {
    return { fout: 'Ons kon nie deurkom nie. Probeer asseblief weer.' }
  }
}

/* ── Die leestelling ──

   Elke plasing tel EEN keer per toestel. Die foon onthou wat hy al gesien
   het; die bediener tel net op. Dit is nie waterdig nie, maar dit is 'n
   leestelling en nie 'n ranglys nie.

   Dit loop een keer per bladlaai met 'n lys, nie een oproep per kaart nie. */
function geleesLys() {
  try { return JSON.parse(localStorage.getItem(GELEES_SLEUTEL) || '[]') } catch { return [] }
}

export function meldGelees(ids) {
  const gesien = new Set(geleesLys())
  const nuut = [...new Set(ids)].filter(id => id && !gesien.has(id)).slice(0, 20)
  if (!nuut.length) return
  try {
    localStorage.setItem(GELEES_SLEUTEL, JSON.stringify([...nuut, ...gesien].slice(0, 800)))
  } catch { /* privaat modus */ }
  /* Ons wag nie hierop nie en ons wys nooit 'n fout nie. Misluk dit, is die
     enigste gevolg dat een lees nie getel is nie. */
  fetch(SAAM_PAD, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gelees: nuut }),
  }).catch(() => {})
}

/* ── Rapporteer 'n woord ──

   Dit haal die woord dadelik van die muur af en sit dit in Dewald se hopie.
   Die skerm verwyder dit ook plaaslik, sodat die mens wat gedruk het, sien
   dat iets gebeur het. */
export async function rapporteerWoord(woordId) {
  try {
    const r = await fetch(SAAM_PAD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rapporteer: woordId }),
    })
    const d = await r.json()
    return !!(d && d.ok)
  } catch {
    return false
  }
}

/* ── "Jou storie" ──

   Die mens wat geskryf het, sien nooit dat ander haar dra nie. Sy plaas, sy
   verdwyn. Die private kode is doelbewus van die skerm af weg — niemand wil
   'n kode onthou nie — maar hy bestaan nog, want Dewald het hom nodig.

   Die foon hou hom stil, en die bediener ruil hom om vir die muur-id. Geen
   rekening, geen kode om te onthou, en niks wat lek nie: 'n mens moet die
   kode besit, en net wie geskryf het, het hom. */
const MYNE_SLEUTEL = 'sorg_my_kodes'

export function onthouMyKode(kode) {
  if (!kode) return
  try {
    const lys = JSON.parse(localStorage.getItem(MYNE_SLEUTEL) || '[]')
    localStorage.setItem(MYNE_SLEUTEL, JSON.stringify([...new Set([kode, ...lys])].slice(0, 40)))
  } catch { /* privaat modus */ }
}

export function myKodes() {
  try { return JSON.parse(localStorage.getItem(MYNE_SLEUTEL) || '[]') } catch { return [] }
}

export async function haalMyPlasings() {
  const kodes = myKodes()
  if (!kodes.length) return []
  try {
    const r = await fetch(PAD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kodes }),
    })
    const d = await r.json()
    return Array.isArray(d.myne) ? d.myne : []
  } catch {
    return []
  }
}
