/* ────────────────────────────────────────────────────────────
   Bou die Ark — die kliënt se kant van die wêreldwye ranglys.

   Alles gaan deur /api/ark-ranglys. Die kliënt kan nie direk na Firestore
   skryf nie; die reëls verbied dit. Die bediener verifieer die speler se
   ID-token en toets of die lopie moontlik is voordat 'n punt tel.

   Twee dinge waaroor ons hier eerlik moet wees:

     · 'n Leë lys is nie dieselfde as 'n lys wat ons nie kon haal nie.
       Elke funksie sê watter van die twee dit is, sodat die skerm nooit
       'n netwerkfout as "niemand speel nie" aanbied nie.

     · As instuur misluk, gooi ons dit nie weg nie. Die punt gaan in 'n
       wagry in localStorage en probeer weer wanneer die spel volgende
       oopmaak.
   ──────────────────────────────────────────────────────────── */

import { auth, getOrCreateAnonUid } from '../firebase'

const PAD    = '/api/ark-ranglys'
const NAAM   = 'ark_naam'
const WAGRY  = 'ark_wagry'
const KAS    = 'ark_ranglys_kas'
const KAS_MS = 5 * 60 * 1000

/* ── Naam ── */
export function leesNaam() {
  try { return localStorage.getItem(NAAM) || '' } catch { return '' }
}
export function stoorNaam(n) {
  try { localStorage.setItem(NAAM, n) } catch {}
}

/* Dieselfde reëls as die bediener s'n. Ons keur hier eers sodat die speler
   'n boodskap in Afrikaans kry voordat ons die netwerk pla. */
export function keurNaam(rou) {
  if (typeof rou !== 'string') return 'Tik asseblief \'n naam.'
  const n = rou.trim().replace(/\s+/g, ' ')
  if (n.length < 1)  return 'Tik asseblief \'n naam.'
  if (n.length > 20) return 'Hoogstens 20 karakters.'
  if (/[\u0000-\u001f\u007f<>&"`\\]/.test(n)) return 'Van hierdie karakters kan ons nie gebruik nie.'
  return null
}

/* ── Wagry vir punte wat nie deurgekom het nie ── */
function leesWagry() {
  try { return JSON.parse(localStorage.getItem(WAGRY) || '[]') } catch { return [] }
}
function stoorWagry(w) {
  try { localStorage.setItem(WAGRY, JSON.stringify(w.slice(-5))) } catch {}
}
export function wagryLengte() { return leesWagry().length }

/* ── Kas sodat die menu dadelik iets kan wys ── */
function leesKas() {
  try {
    const k = JSON.parse(localStorage.getItem(KAS) || 'null')
    if (!k || !Array.isArray(k.lys)) return null
    return k
  } catch { return null }
}
function stoorKas(lys, totaal) {
  try { localStorage.setItem(KAS, JSON.stringify({ lys, totaal, tyd: Date.now() })) } catch {}
}

/* Die kas is 'n gerief, nie die waarheid nie. Dit sê altyd hoe oud dit is
   sodat die skerm dit so kan merk. */
export function kasLys() {
  const k = leesKas()
  if (!k) return null
  return { lys: k.lys, totaal: k.totaal, oud: Date.now() - k.tyd > KAS_MS, tyd: k.tyd }
}

/* ── Haal die lys ──
   Gee altyd { ok, lys, totaal, fout }. By 'n fout is lys null, nooit [] —
   sodat die skerm nie 'n netwerkfout as 'n leë ranglys wys nie. */
export async function haalRanglys() {
  try {
    const r = await fetch(PAD, { headers: { Accept: 'application/json' } })
    const d = await r.json().catch(() => null)
    if (!r.ok || !d || !d.ok) {
      // Die bediener se teks is vir ons, nie vir die speler nie. Ons wys 'n
      // sin wat 'n mens kan lees, en hou die tegniese rede as fyndruk.
      return {
        ok: false, lys: null, totaal: 0,
        fout: 'Die ranglys is nou nie beskikbaar nie. Probeer netnou weer.',
        rede: d && d.fout ? String(d.fout) : null,
      }
    }
    stoorKas(d.lys, d.totaal)
    return { ok: true, lys: d.lys, totaal: d.totaal, fout: null }
  } catch {
    return { ok: false, lys: null, totaal: 0, fout: 'Ons kon nie die ranglys bereik nie. Kyk of jy aanlyn is.' }
  }
}

/* ── Stuur 'n lopie in ── */
async function stuurEen(inskrywing) {
  /* Die bediener aanvaar net 'n geverifieerde Firebase-token. Kry ons nie
     een nie — geen netwerk, of die blaaier blokkeer dit — kan ons niks
     instuur nie, en dan moet ons dit reguit se in plaas van 'n tegniese
     boodskap te wys. */
  try { await getOrCreateAnonUid() } catch {}
  const gebruiker = auth.currentUser
  if (!gebruiker) {
    return { ok: false, herprobeer: true,
      fout: 'Ons kon nie by die ranglys uitkom nie. Kyk of jy aanlyn is — jou punt wag solank.' }
  }

  let idToken
  try { idToken = await gebruiker.getIdToken() } catch {
    return { ok: false, herprobeer: true,
      fout: 'Ons kon nie by die ranglys uitkom nie. Jou punt wag en probeer weer.' }
  }

  const r = await fetch(PAD, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...inskrywing, idToken }),
  })
  const d = await r.json().catch(() => null)

  if (r.ok && d && d.ok) {
    if (d.lys) stoorKas(d.lys, d.totaal)
    return { ok: true, rang: d.rang, totaal: d.totaal, beterAs: d.beterAs, lys: d.lys }
  }
  // 4xx beteken die bediener het die lopie nagegaan en afgekeur. Dit gaan
  // nooit slaag nie, dus hou ons dit nie in die wagry nie.
  const herprobeer = !(r.status >= 400 && r.status < 500)
  return {
    ok: false,
    herprobeer,
    fout: herprobeer
      ? 'Die ranglys is nou nie bereikbaar nie. Jou punt wag en probeer weer.'
      : 'Ons kon hierdie spel nie nagaan nie, dus tel dit nie op die ranglys nie.',
    rede: d && d.fout ? String(d.fout) : null,
  }
}

export async function stuurPunt(naam, lopie) {
  const inskrywing = { naam, lopie }
  try {
    const uit = await stuurEen(inskrywing)
    if (!uit.ok && uit.herprobeer) stoorWagry([...leesWagry(), inskrywing])
    return uit
  } catch {
    stoorWagry([...leesWagry(), inskrywing])
    return { ok: false, herprobeer: true, fout: 'Ons kon die bediener nie bereik nie. Jou punt wag en probeer weer.' }
  }
}

/* Roep dit wanneer die spel oopmaak. Stil: as dit weer misluk, bly dit
   wag. Gee terug hoeveel suksesvol deurgekom het. */
export async function stuurWagry() {
  const wag = leesWagry()
  if (!wag.length) return 0
  const oor = []
  let deur = 0
  for (const inskrywing of wag) {
    try {
      const uit = await stuurEen(inskrywing)
      if (uit.ok) deur++
      else if (uit.herprobeer) oor.push(inskrywing)
      // afgekeurde inskrywings word stil laat val
    } catch {
      oor.push(inskrywing)
    }
  }
  stoorWagry(oor)
  return deur
}
