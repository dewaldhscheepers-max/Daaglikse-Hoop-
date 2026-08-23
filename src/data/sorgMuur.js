/* ────────────────────────────────────────────────────────────
   Die muur, van die kliënt se kant.

   Wat hier terugkom, is NET wat 'n mens gelees en goedgekeur het. Die rou
   boodskappe is 'n ander versameling waarby geen kliënt kom nie.

   Die "dra dit saam met jou" word plaaslik onthou sodat die knoppie nie ná
   'n herlaai weer oop staan nie. Die bediener hou sy eie merk — hierdie een
   is bloot vir die oog.
   ──────────────────────────────────────────────────────────── */

import { toestelId } from './sorgStuur'
import { SLEUTEL as SAAMDRA_SLEUTEL, lees as leesSaamDraRou, voegBy, merkGesien } from './sorgSaamDra'
import { BLOK_SLEUTEL, leesBlok, blokBy, blokWeg } from './sorgModereer'

const PAD = '/api/sorg-muur'
const SAAM_PAD = '/api/sorg-saamstaan'
const SAAM_SLEUTEL = 'sorg_saam'
const REAKSIE_SLEUTEL = 'sorg_reaksies'

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

   Vyftien sekondes. Dit was dertig, en op 'n muur waar twee mense saam kyk,
   voel dertig sekondes soos "dit werk nie". Die antwoord is 'n paar
   kilogreep en die muur is klein; vyftien kos niks en dit voel lewendig.

   Dit staan in elk geval stil sodra die blad weggesteek is, dus maak 'n
   foon in iemand se sak geen oproepe nie. */
export const POLS_MS = 15 * 1000

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
export async function stuurReaksie(muurId, reaksie, soort = 'muur') {
  try {
    const r = await fetch(SAAM_PAD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ muurId, toestel: toestelId(), reaksie, soort }),
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
export async function stuurWoord(muurId, { woord = '', teks = '' } = {}, soort = 'muur', profiel = null) {
  try {
    const r = await fetch(SAAM_PAD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        muurId, toestel: toestelId(), soort,
        ...(woord ? { woord } : { teks }),
        /* Die profiel gaan SAAM, of glad nie. Sonder een bly die opmerking
           anoniem, presies soos die hele muur voorheen was. Die bediener
           keur die naam weer — 'n kliënt se woord oor sy eie naam is nooit
           genoeg nie, want dit is presies hoe iemand "Dewald Scheepers"
           word. */
        ...(profiel && profiel.naam ? { naam: profiel.naam, foto: profiel.foto || '' } : {}),
      }),
    })
    return await r.json()
  } catch {
    return { fout: 'Ons kon nie deurkom nie. Probeer asseblief weer.' }
  }
}

/* ── Bemoedig 'n OPMERKING ──

   Facebook wys 'n telling op elke opmerking. Dit lyk soos versiering en dit
   is dit nie: 'n mens wat vir 'n vreemdeling geskryf het "ek bid vanaand vir
   jou", kry vandag NIKS terug nie en weet nie eens of iemand dit gelees het
   nie. Dit is presies hoekom mense ophou skryf.

   Die merkie word plaaslik gehou sodat die hartjie ná 'n herlaai gevul bly.
   Die bediener hou sy eie merk; hierdie een is vir die oog. */
const BEMOEDIG_SLEUTEL = 'sorg_bemoedig'

/* 'n KAART, nie 'n lys nie: die id wys na die TEKEN wat gedruk is, sodat die
   regte een gevul bly staan ná 'n herlaai. Die ou vorm was 'n lys van id's;
   'n mens wat toe reeds gedruk het, se merkie bly werk — sien hieronder. */
function leesMerkies() {
  try {
    const x = JSON.parse(localStorage.getItem(BEMOEDIG_SLEUTEL) || '{}')
    if (Array.isArray(x)) {
      /* Die ou vorm. Ons weet nie watter teken dit was nie, dus word dit 'n
         duim — dit is wat "Bemoedig" beteken het. */
      const uit = {}
      for (const id of x) if (typeof id === 'string') uit[id] = '\u{1F44D}\u{1F3FB}'
      return uit
    }
    return x && typeof x === 'object' ? x : {}
  } catch { return {} }
}

export function bemoedigdes() {
  return leesMerkies()
}

export async function bemoedigWoord(woordId, teken = '\u{1F44D}\u{1F3FB}') {
  const id = String(woordId || '').trim()
  if (!id) return null
  /* Die merkie word GESKRYF VOOR ons stuur. 'n Swak lyn mag nie elke
     mislukte versoek weer laat tel nie — dieselfde reël as die tellers. */
  try {
    const kaart = leesMerkies()
    if (!kaart[id]) {
      kaart[id] = teken
      localStorage.setItem(BEMOEDIG_SLEUTEL, JSON.stringify(kaart))
    }
  } catch { /* privaat venster; die knoppie werk steeds */ }

  try {
    const r = await fetch(SAAM_PAD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aksie: 'bemoedig', woordId: id, teken, toestel: toestelId() }),
    })
    return await r.json()
  } catch {
    return null
  }
}

/* ── Saam dra: watter gesprekke dra hierdie foon ──

   Die reëls is suiwer en staan in `src/data/sorgSaamDra.js`. Hier is net
   die berging. */

function skryfSaamDra(lys) {
  try { localStorage.setItem(SAAMDRA_SLEUTEL, JSON.stringify(lys)) } catch { /* privaat venster */ }
}

export function leesSaamDra() {
  try { return leesSaamDraRou(localStorage.getItem(SAAMDRA_SLEUTEL)) } catch { return [] }
}

/* Jy het by hierdie mens gaan sit. */
export function onthouSaamDra(muurId, woorde = 0) {
  const lys = voegBy(leesSaamDra(), muurId, { wanneer: new Date().toISOString(), woorde })
  skryfSaamDra(lys)
  return lys
}

/* Jy het nou daar gekyk — die "Nuwe antwoord"-merkie mag weg. */
export function merkSaamDraGesien(muurId, woorde) {
  const lys = merkGesien(leesSaamDra(), muurId, woorde)
  skryfSaamDra(lys)
  return lys
}

/* ── Rapporteer 'n woord ──

   Dit haal die woord dadelik van die muur af en sit dit in Dewald se hopie.
   Die skerm verwyder dit ook plaaslik, sodat die mens wat gedruk het, sien
   dat iets gebeur het. */
export async function rapporteerWoord(woordId, rede = '') {
  try {
    const r = await fetch(SAAM_PAD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rapporteer: woordId, rede, toestel: toestelId() }),
    })
    const d = await r.json()
    /* `weg` sê of dit WERKLIK van die muur af is. Een rapport haal niks meer
       af nie — sien src/data/sorgModereer.js — dus mag die skerm nie meer
       aanvaar dat 'n druk beteken dit is weg nie. */
    return d && d.ok ? { ok: true, weg: !!d.weg } : { ok: false }
  } catch {
    return { ok: false }
  }
}

/* ── Wie hierdie foon geblokkeer het ──

   Dit le PLAASLIK en gaan nooit na 'n bediener nie: 'n opvraagbare lys van
   "wie blokkeer wie" op 'n anonieme muur is presies die rekord wat hierdie
   blad nie mag hê nie. */
export function leesGeblok() {
  try { return leesBlok(localStorage.getItem(BLOK_SLEUTEL)) } catch { return [] }
}

export function blokkeer(merk) {
  const lys = blokBy(leesGeblok(), merk)
  try { localStorage.setItem(BLOK_SLEUTEL, JSON.stringify(lys)) } catch { /* privaat venster */ }
  return lys
}

export function deblokkeer(merk) {
  const lys = blokWeg(leesGeblok(), merk)
  try { localStorage.setItem(BLOK_SLEUTEL, JSON.stringify(lys)) } catch { /* privaat venster */ }
  return lys
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

/* ── Rapporteer 'n plasing ──
 *
 * Plasings gaan nou DADELIK op die muur. Dewald: "ek wil nie alles heeltyd na
 * gaan nie... mense moet kan report."
 *
 * Dit gaan na `/api/sorg-muur`, nie na die saamstaan-pad nie — dieselfde
 * eindpunt as die plasing self, met `aksie: 'rapporteer'`.
 *
 * Die merkie word op HIERDIE foon gestoor voordat ons stuur, sodat 'n swak
 * lyn nie 'n mens vyf keer laat rapporteer nie. Dieselfde reel as die tellers
 * in VOLG JESUS: eerder een keer te min as vyf keer te veel.
 *
 * Die plasing verdwyn nie vanself nie. Dit gaan boontoe in die admin. */
const RAPPORT_SLEUTEL = 'sorg_gerapporteer'

function gerapporteerdes() {
  try {
    const rou = JSON.parse(localStorage.getItem(RAPPORT_SLEUTEL) || '[]')
    return Array.isArray(rou) ? rou : []
  } catch { return [] }
}

export function reedsGerapporteer(muurId) {
  return gerapporteerdes().includes(String(muurId))
}

export async function rapporteerPlasing(muurId, rede = '') {
  const id = String(muurId || '')
  if (!id) return false
  if (reedsGerapporteer(id)) return true
  try {
    const lys = gerapporteerdes()
    lys.push(id)
    localStorage.setItem(RAPPORT_SLEUTEL, JSON.stringify(lys.slice(-200)))
  } catch { /* privaat venster */ }
  try {
    await fetch(PAD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aksie: 'rapporteer', muurId: id, toestel: toestelId(), rede }),
    })
    return true
  } catch {
    return true
  }
}
