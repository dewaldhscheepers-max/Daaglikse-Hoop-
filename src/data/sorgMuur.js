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
const SAAM_SLEUTEL = 'sorg_saam'

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

export function haalMuur() {
  if (!belofte || Date.now() - gehaalOp > VARS_MS) {
    gehaalOp = Date.now()
    belofte = fetch(PAD, { headers: { accept: 'application/json' }, cache: 'no-store' })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then(d => (Array.isArray(d.plasings) ? d.plasings : []))
      .catch(() => { belofte = null; return [] })
  }
  return belofte
}

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
