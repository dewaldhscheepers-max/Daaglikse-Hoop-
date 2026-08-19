/* ── Die groepchat se data-kant ──
 *
 * Lewendig, met Firestore se `onSnapshot`. 'n Boodskap verskyn by almal wat die
 * chat oop het sonder dat enigiets pols.
 *
 * ── Waarom die kliënt direk skryf ──
 *
 * Omdat die sekuriteit in die REËLS staan, nie in 'n eindpunt nie. Firestore
 * keur elke skryf: net 'n aktiewe lid, en `uid` moet `request.auth.uid` wees.
 * 'n Bediener-eindpunt sou niks byvoeg nie behalwe 'n funksie-aanroep per
 * boodskap en 'n halwe sekonde vertraging.
 *
 * Wat WEL deur die bediener loop, is alles wat 'n soektog of 'n geheim verg —
 * groepe skep, met 'n kode aansluit, lidmaatskap. Sien api/vj-groep.mjs.
 *
 * ── Die herprobeer mag nooit twee boodskappe maak nie ──
 *
 * §49: `kliëntId` is die idempotensie-sleutel. Die kliënt kies die dokument se
 * NAAM voordat hy stuur; misluk die netwerk en probeer hy weer, skryf hy na
 * dieselfde naam. Twee pogings, een boodskap.
 */
import {
  collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot,
  query, orderBy, limit, serverTimestamp, getDocs, addDoc,
} from 'firebase/firestore'
import { db } from '../firebase'
import { keurBoodskap } from './volgJesusGroep'

/* Hoeveel boodskappe ons hou. 'n Groepchat is nie 'n argief nie; wie verder
   terug wil lees, kan later blaai. */
export const VENSTER = 200

const boodskapPad = groepId => collection(db, 'vjGroepe', groepId, 'boodskappe')

/* ── Luister ──
 *
 * Gee 'n funksie terug wat die luisteraar afskakel. Dit MOET geroep word
 * wanneer die chat toegaan: 'n luisteraar wat aanbly, hou 'n verbinding oop en
 * werk op 'n foon teen die battery.
 *
 * Verloor 'n mens sy lidmaatskap terwyl hy kyk (hy word verwyder), gee
 * Firestore 'n toestemmingsfout en die luisteraar val om. Dit is nie 'n fout
 * nie — dit is die reëls wat werk — en `opFout` sê dit vir die skerm. */
export function luister(groepId, opNuut, opFout) {
  if (!groepId) return () => {}
  const v = query(boodskapPad(groepId), orderBy('geskep', 'asc'), limit(VENSTER))
  return onSnapshot(
    v,
    kiek => {
      const uit = []
      kiek.forEach(d => {
        const data = d.data() || {}
        uit.push({
          id: d.id,
          uid: data.uid || '',
          naam: data.naam || '',
          teks: data.teks || '',
          uitgevee: data.uitgevee === true,
          vasgespeld: data.vasgespeld === true,
          antwoordOp: data.antwoordOp || null,
          /* 'n Boodskap wat pas gestuur is, het nog nie die bediener se tyd
             nie. Dan is dit NOU — anders spring hy na die bokant van die lys
             en dan terug. */
          geskep: data.geskep && data.geskep.toDate ? data.geskep.toDate() : new Date(),
          plaaslik: !data.geskep,
        })
      })
      opNuut(uit)
    },
    fout => { if (opFout) opFout(fout) },
  )
}

/* ── Stuur ──
 *
 * `kliëntId` word BUITE gemaak en saam ingegee, sodat 'n herprobeer dieselfde
 * dokument skryf. Gee die aanroeper niks, maak ons een — dan is 'n herprobeer
 * 'n nuwe boodskap, en dit is presies wat §49 verbied. */
export function nuweKliëntId() {
  try {
    if (crypto && crypto.randomUUID) return crypto.randomUUID()
  } catch {}
  return `k${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

export async function stuur(groepId, { uid, naam, teks, kliëntId, antwoordOp = null }) {
  const gekeur = keurBoodskap(teks)
  if (!gekeur.ok) return { ok: false, fout: gekeur.fout }
  if (!groepId || !uid) return { ok: false, fout: 'Jy is nie in n groep nie.' }

  const id = kliëntId || nuweKliëntId()
  try {
    await setDoc(doc(db, 'vjGroepe', groepId, 'boodskappe', id), {
      uid,
      naam: String(naam || '').slice(0, 30),
      teks: gekeur.waarde,
      antwoordOp: antwoordOp || null,
      uitgevee: false,
      /* Die BEDIENER se tyd. 'n Kliënt wat sy eie tyd kies, kan 'n boodskap
         bo-aan die gesprek vasspeld of hom in die verlede versteek — en die
         reël in firestore.rules eis dit ook. */
      geskep: serverTimestamp(),
    })
    return { ok: true, id }
  } catch (e) {
    const kode = (e && e.code) || ''
    if (kode === 'permission-denied') {
      return { ok: false, fout: 'Jy is nie meer in hierdie groep nie.' }
    }
    /* Enigiets anders is 'n netwerk. Die boodskap is NIE weg nie — die
       aanroeper hou die teks en die kliëntId, en 'n herprobeer skryf na
       dieselfde plek. */
    return { ok: false, herprobeer: true, id, fout: '' }
  }
}

/* ── Uitvee ──
 *
 * Sag: die dokument bly, want 'n fasiliteerder moet kan modereer en 'n
 * gesprek waarin dokumente verdwyn, laat gate. Die reëls laat net `uitgevee`
 * verander — die teks self kan nooit herskryf word nie. */
export async function veeUit(groepId, boodskapId) {
  try {
    await updateDoc(doc(db, 'vjGroepe', groepId, 'boodskappe', boodskapId), {
      uitgevee: true,
      uitgeveeOp: serverTimestamp(),
    })
    return { ok: true }
  } catch {
    return { ok: false, fout: 'Kon nie uitvee nie.' }
  }
}

/* ── Reaksies ──
 *
 * §38 laat net twee toe: ❤️ en 🙏. Nie ses nie — 'n ry emoji is 'n sosiale
 * meganisme, en hierdie is 'n gesprek tussen mense wat saam bid.
 *
 * Elke mens kry EEN dokument per boodskap, en die dokument se NAAM is sy uid.
 * Dan kan niemand twee keer tel nie en niemand kan namens iemand anders
 * reageer nie — die struktuur maak dit onmoontlik, nie 'n telling nie.
 */
export const REAKSIES = [
  { soort: 'hart', teken: '❤️' },
  { soort: 'bid',  teken: '🙏' },
]

export async function reageer(groepId, boodskapId, uid, soort) {
  const pad = doc(db, 'vjGroepe', groepId, 'boodskappe', boodskapId, 'reaksies', uid)
  try {
    /* Dieselfde reaksie weer beteken "haal dit af". */
    if (!soort) { await deleteDoc(pad); return { ok: true } }
    await setDoc(pad, { soort, geskep: serverTimestamp() })
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

/* Al die reaksies vir 'n groep se boodskappe. Dit loop as EEN luisteraar per
   boodskap sou te veel wees; ons luister eerder op elke boodskap wat op die
   skerm is. */
export function luisterReaksies(groepId, boodskapId, op) {
  if (!groepId || !boodskapId) return () => {}
  return onSnapshot(
    collection(db, 'vjGroepe', groepId, 'boodskappe', boodskapId, 'reaksies'),
    kiek => {
      const uit = []
      kiek.forEach(d => uit.push({ uid: d.id, ...(d.data() || {}) }))
      op(uit)
    },
    () => op([]),
  )
}

/* ── Vasspeld ──
 *
 * Net 'n fasiliteerder, en die reels dwing dit af. 'n Vasgespelde boodskap
 * staan bo die gesprek — §38 gebruik dit vir die week se kaart. */
export async function speldVas(groepId, boodskapId, aan) {
  try {
    await updateDoc(doc(db, 'vjGroepe', groepId, 'boodskappe', boodskapId), {
      vasgespeld: !!aan,
    })
    return { ok: true }
  } catch {
    return { ok: false, fout: 'Kon nie vasspeld nie.' }
  }
}

/* ── Rapporteer ──
 *
 * Dit gaan NIE na die groep nie. Niemand lees dit terug nie — ook nie die
 * fasiliteerder nie — want 'n rapport wat die groep kan sien, is 'n rapport
 * wat niemand gaan indien nie. */
export async function rapporteer(groepId, boodskap, deur, rede) {
  try {
    await addDoc(collection(db, 'vjGroepe', groepId, 'rapporte'), {
      boodskapId: boodskap.id,
      boodskapUid: boodskap.uid,
      boodskapTeks: String(boodskap.teks || '').slice(0, 500),
      deur,
      rede: String(rede || '').slice(0, 200),
      geskep: serverTimestamp(),
    })
    return { ok: true }
  } catch {
    return { ok: false, fout: 'Kon nie rapporteer nie.' }
  }
}

/* ── Die leesmerk ──
 *
 * Net joune, en dit is die enigste ding wat 'n mens oor homself skryf. */
export async function merkGelees(groepId, uid, laasteId) {
  if (!groepId || !uid || !laasteId) return
  try {
    await setDoc(doc(db, 'vjGroepe', groepId, 'lees', uid), {
      laasGeleesId: laasteId,
      laasGelees: serverTimestamp(),
    })
  } catch {}
}

export function luisterLeesmerk(groepId, uid, op) {
  if (!groepId || !uid) return () => {}
  return onSnapshot(
    doc(db, 'vjGroepe', groepId, 'lees', uid),
    d => op((d.data() || {}).laasGeleesId || null),
    () => op(null),
  )
}

/* Die groep se eie dokument en sy lede, lewendig. Die ledetal en die
   fasiliteerder se naam verander wanneer iemand aansluit. */
export function luisterGroep(groepId, op, opFout) {
  if (!groepId) return () => {}
  return onSnapshot(
    doc(db, 'vjGroepe', groepId),
    d => op(d.exists() ? { id: d.id, ...d.data() } : null),
    fout => { if (opFout) opFout(fout) },
  )
}

export async function haalLede(groepId) {
  try {
    const kiek = await getDocs(collection(db, 'vjGroepe', groepId, 'lede'))
    const uit = []
    kiek.forEach(d => uit.push({ uid: d.id, ...(d.data() || {}) }))
    return uit.filter(l => l.status === 'aktief')
  } catch {
    return []
  }
}
