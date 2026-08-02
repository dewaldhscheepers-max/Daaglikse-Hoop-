/* ────────────────────────────────────────────────────────────
   Vrugtefees — die kliënt se kant van die Oesmeesters.

   Alles gaan deur /api/vrugtefees-ranglys. Die kliënt kan nie direk na
   Firestore skryf nie; die reëls verbied dit.

   Wat ons instuur is die SAAD en die LYS SKUIWE — nie die puntetelling
   nie. Die bediener speel die lopie oor met dieselfde enjin en tel self.
   Ons stuur dus geen aanspraak in wat 'n mens kan opblaas nie.

   Twee dinge waaroor ons hier eerlik moet wees, presies soos by die Ark:

     · 'n Leë lys is nie dieselfde as 'n lys wat ons nie kon haal nie.
       Elke funksie sê watter van die twee dit is, sodat die skerm nooit
       'n netwerkfout as "niemand speel nie" aanbied nie.

     · As instuur misluk, gooi ons dit nie weg nie. Die lopie gaan in 'n
       wagry in localStorage en probeer weer wanneer die spel oopmaak.
       Vandag se Oes verval wel: gister se bord tel nie meer nie, dus laat
       ons daardie inskrywings stil val eerder as om die bediener te pla
       met iets wat hy moet weier.
   ──────────────────────────────────────────────────────────── */

import { auth, getOrCreateAnonUid } from '../firebase'
import { dagSleutel } from '../game/vrugtefees/oes'

const PAD     = '/api/vrugtefees-ranglys'
const NAAM    = 'vf_naam'
const AFGEWYS = 'vf_naam_afgewys'
const WAGRY   = 'vf_wagry'
const LAASTE  = 'vf_laaste_lopie'
const KAS     = 'vf_ranglys_kas'
const KAS_MS  = 5 * 60 * 1000

/* ── Naam ──
   Ons hou dit apart van die Ark se naam. Iemand kan met 'n ander naam op
   die tuin-ranglys wil wees as op die ark s'n, en om die keuse te deel sou
   beteken dat 'n verandering op die een plek die ander stilweg verander. */
export function leesNaam() {
  try { return localStorage.getItem(NAAM) || '' } catch { return '' }
}
export function stoorNaam(n) {
  try { localStorage.setItem(NAAM, n); localStorage.removeItem(AFGEWYS) } catch {}
}
export function naamAfgewys() {
  try { return localStorage.getItem(AFGEWYS) === '1' } catch { return false }
}
export function wysNaamAf() {
  try { localStorage.setItem(AFGEWYS, '1') } catch {}
}

/* Dieselfde reëls as die bediener s'n, sodat die speler 'n Afrikaanse
   boodskap kry voordat ons die netwerk pla. */
export function keurNaam(rou) {
  if (typeof rou !== 'string') return 'Tik asseblief \'n naam.'
  const n = rou.trim().replace(/\s+/g, ' ')
  if (n.length < 1)  return 'Tik asseblief \'n naam.'
  if (n.length > 20) return 'Hoogstens 20 karakters.'
  if (/[\u0000-\u001f\u007f<>&"`\\]/.test(n)) return 'Van hierdie karakters kan ons nie gebruik nie.'
  return null
}

/* ── Wagry ──
   Ons hou hoogstens drie. 'n Lopie dra sy hele lys skuiwe saam, dus is dit
   heelwat groter as die Ark se inskrywings, en localStorage is nie groot
   nie. Die nuutstes is die belangrikstes. */
function leesWagry() {
  try {
    const w = JSON.parse(localStorage.getItem(WAGRY) || '[]')
    return Array.isArray(w) ? w : []
  } catch { return [] }
}
function stoorWagry(w) {
  try { localStorage.setItem(WAGRY, JSON.stringify(w.slice(-3))) } catch {}
}
export function wagryLengte() { return leesWagry().length }

/* ── Die laaste lopie wat klaargespeel is ──
   Sonder dit was daar 'n stil doodloopstraat: as jy 'n lopie klaarmaak
   VOORDAT jy 'n naam gekies het, is niks ingestuur nie. Kies jy dan later 'n
   naam op die ranglysskerm, was daar niks meer om in te stuur nie — die
   lopie het net in die geheue geleef en is weg toe die skerm toemaak.

   Dewald se vrou het presies dit gedoen: haar naam ingetik en toe nooit op
   die lys verskyn nie.

   Nou bly die laaste klaargespeelde lopie hier lê tot dit deurgekom het. */
function stoorLaaste(lopie) {
  try { localStorage.setItem(LAASTE, JSON.stringify(lopie)) } catch {}
}
export function leesLaaste() {
  try {
    const d = JSON.parse(localStorage.getItem(LAASTE) || 'null')
    if (!d || !Array.isArray(d.skuiwe) || !d.skuiwe.length) return null
    // 'n Daaglikse lopie van gister kan nooit meer tel nie.
    if (d.soort === 'daagliks' && d.dag !== dagSleutel(new Date())) return null
    return d
  } catch { return null }
}
export function vergeetLaaste() {
  try { localStorage.removeItem(LAASTE) } catch {}
}
export function onthouLopie(lopie) { stoorLaaste(lopie) }

/* ── Kas ── */
function leesKas() {
  try {
    const k = JSON.parse(localStorage.getItem(KAS) || 'null')
    if (!k || !Array.isArray(k.meesters)) return null
    return k
  } catch { return null }
}
function stoorKas(d) {
  try {
    localStorage.setItem(KAS, JSON.stringify({
      meesters: d.meesters || [], daagliks: d.daagliks || [],
      dag: d.dag || null, meestersTotaal: d.meestersTotaal || 0,
      daagliksTotaal: d.daagliksTotaal || 0, tyd: Date.now(),
    }))
  } catch {}
}

/* Die kas is 'n gerief, nie die waarheid nie. Dit sê altyd hoe oud dit is
   sodat die skerm dit so kan merk. Vandag se lys word weggegooi as die kas
   van gister af kom — 'n ou daaglikse bord is nie stale nie, dit is verkeerd. */
export function kasLys() {
  const k = leesKas()
  if (!k) return null
  const vandag = dagSleutel(new Date())
  return {
    meesters: k.meesters,
    daagliks: k.dag === vandag ? k.daagliks : null,
    dag: k.dag,
    meestersTotaal: k.meestersTotaal,
    daagliksTotaal: k.daagliksTotaal,
    oud: Date.now() - k.tyd > KAS_MS,
    tyd: k.tyd,
  }
}

/* ── Haal die lyste ──
   Gee altyd { ok, meesters, daagliks, fout }. By 'n fout is die lyste null,
   nooit [] — sodat die skerm nie 'n netwerkfout as 'n leë ranglys wys nie. */
export async function haalRanglys() {
  try {
    const r = await fetch(PAD, { headers: { Accept: 'application/json' } })
    const d = await r.json().catch(() => null)
    if (!r.ok || !d || !d.ok) {
      return {
        ok: false, meesters: null, daagliks: null,
        fout: 'Die ranglys is nou nie beskikbaar nie. Probeer netnou weer.',
        rede: d && d.fout ? String(d.fout) : null,
      }
    }
    stoorKas(d)
    return {
      ok: true, fout: null,
      meesters: d.meesters, daagliks: d.daagliks, dag: d.dag,
      meestersTotaal: d.meestersTotaal, daagliksTotaal: d.daagliksTotaal,
    }
  } catch {
    return {
      ok: false, meesters: null, daagliks: null,
      fout: 'Ons kon nie die ranglys bereik nie. Kyk of jy aanlyn is.',
    }
  }
}

/* ── Stuur 'n lopie in ── */
async function stuurEen(inskrywing) {
  try { await getOrCreateAnonUid() } catch {}
  const gebruiker = auth.currentUser
  if (!gebruiker) {
    return { ok: false, herprobeer: true,
      fout: 'Ons kon nie by die ranglys uitkom nie. Kyk of jy aanlyn is — jou oes wag solank.' }
  }

  let idToken
  try { idToken = await gebruiker.getIdToken() } catch {
    return { ok: false, herprobeer: true,
      fout: 'Ons kon nie by die ranglys uitkom nie. Jou oes wag en probeer weer.' }
  }

  const r = await fetch(PAD, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...inskrywing, idToken }),
  })
  const d = await r.json().catch(() => null)

  if (r.ok && d && d.ok) {
    return { ok: true, rang: d.rang, totaal: d.totaal, beterAs: d.beterAs,
             punte: d.punte, rondes: d.rondes, lys: d.lys, soort: d.soort }
  }
  // 4xx beteken die bediener het die lopie oorgespeel en afgekeur. Dit gaan
  // nooit slaag nie, dus hou ons dit nie in die wagry nie.
  const herprobeer = !(r.status >= 400 && r.status < 500)
  return {
    ok: false,
    herprobeer,
    fout: herprobeer
      ? 'Die ranglys is nou nie bereikbaar nie. Jou oes wag en probeer weer.'
      : 'Ons kon hierdie lopie nie nagaan nie, dus tel dit nie op die ranglys nie.',
    rede: d && d.fout ? String(d.fout) : null,
  }
}

/* `lopie` is { soort, saad?, dag?, skuiwe }. Geen puntetelling — die
   bediener bereken dit. */
export async function stuurOes(naam, lopie) {
  const inskrywing = { naam, ...lopie }
  try {
    const uit = await stuurEen(inskrywing)
    // Deur of finaal afgekeur: in albei gevalle hoef ons dit nie te onthou nie.
    if (uit.ok || !uit.herprobeer) vergeetLaaste()
    if (!uit.ok && uit.herprobeer) stoorWagry([...leesWagry(), inskrywing])
    return uit
  } catch {
    stoorWagry([...leesWagry(), inskrywing])
    return { ok: false, herprobeer: true,
      fout: 'Ons kon die bediener nie bereik nie. Jou oes wag en probeer weer.' }
  }
}

/* Roep dit wanneer die spel oopmaak. Stil: as dit weer misluk, bly dit wag. */
export async function stuurWagry() {
  const wag = leesWagry()
  if (!wag.length) return 0
  const vandag = dagSleutel(new Date())
  const oor = []
  let deur = 0
  for (const inskrywing of wag) {
    // Gister se daaglikse lopie kan nooit meer tel nie. Ons stuur dit nie
    // in om geweier te word nie; ons laat dit stil val.
    if (inskrywing.soort === 'daagliks' && inskrywing.dag !== vandag) continue
    try {
      const uit = await stuurEen(inskrywing)
      if (uit.ok) deur++
      else if (uit.herprobeer) oor.push(inskrywing)
    } catch {
      oor.push(inskrywing)
    }
  }
  stoorWagry(oor)
  return deur
}
