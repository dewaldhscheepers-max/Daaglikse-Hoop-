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

/* Een keer per sessie gehaal. 'n Mislukking word NIE onthou nie — die foon
   was dalk net 'n oomblik aflyn. Dieselfde fout het die Afrikaanse Bybel 'n
   dag lank laat wegbly. */
export function haalMuur() {
  if (!belofte) {
    belofte = fetch(PAD, { headers: { accept: 'application/json' } })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then(d => (Array.isArray(d.plasings) ? d.plasings : []))
      .catch(() => { belofte = null; return [] })
  }
  return belofte
}

export function vergeetMuur() { belofte = null }

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
  onthouSaam(muurId)
  try {
    const r = await fetch(PAD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ muurId, toestel: toestelId() }),
    })
    const d = await r.json()
    return typeof d.saam === 'number' ? d.saam : null
  } catch {
    return null
  }
}
