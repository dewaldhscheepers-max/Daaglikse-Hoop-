/* ── DIE OPGELAAIDE BOEKE HAAL ──
 *
 * Die onsuiwer helfte van `eboekPopup.js`. Die BESLUIT staan daar; hier staan
 * net die Firestore-werk.
 *
 * ── Waarom dit nie 'n `onSnapshot` is nie ──
 *
 * `Meer.jsx` gebruik 'n lewende luisteraar, en daar is dit reg: die blad is
 * oop, 'n mens kyk daarna, en die luisteraar sterf saam met die blad.
 *
 * Hier is dit 'n ander saak. Dit loop by ELKE oopmaak van die app, en om 06:30
 * maak duisende fone binne minute oop. 'n Lewende luisteraar per mens is
 * presies hoe die kwota verlede week opgeraak het — sien Vandag se Tyd met God
 * in CLAUDE.md, wat om dieselfde rede een `getDocs` doen.
 *
 * ── En waarom dit nie by elke oopmaak haal nie ──
 *
 * Die opspringer-bestuurder roep dit EERS nadat sy goedkoop hekke geslaag het
 * (geïnstalleer, nog nie vandag gevra nie, twee dae oop, geen donasie
 * verskuldig nie). Op die oorgrote meerderheid oopmaak gebeur hier dus niks.
 *
 * Daarby hou ons dit ses uur lank. Boeke verander 'n paar keer per maand; 'n
 * mens wat vyf keer op 'n dag oopmaak, hoef dit nie vyf keer te haal nie.
 *
 * ── Twee reëls wat uit foute kom ──
 *
 * `getDocs` het GEEN tydgrens nie. Word die oortjie opgeskort, los die belofte
 * nie op EN verwerp dit nie, en dan hang dit vir altyd. Dit het Luister twee
 * keer stilweg gebreek. Daarom 'n `Promise.race`.
 *
 * En ons aanvaar NOOIT 'n leë antwoord bo 'n gevulde kas nie. Is die SDK
 * vanlyn, bedien `getDocs` uit sy eie kas, en daardie kas hou net wat die SDK
 * al gesien het — dit kan 'n leë lys wees. Skryf ons dit oor 21 boeke, is
 * hulle weg tot die volgende suksesvolle haal. Dieselfde les as Luister s'n.
 */

import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

const KAS = 'cachedBooks'
const KAS_TYD = 'cachedBooksTime'
const VARS_MS = 6 * 60 * 60 * 1000
const TYDGRENS_MS = 10 * 1000

function leesKas() {
  try {
    const rou = JSON.parse(localStorage.getItem(KAS) || '[]')
    return Array.isArray(rou) ? rou : []
  } catch { return [] }
}

function skryfKas(boeke) {
  try {
    localStorage.setItem(KAS, JSON.stringify(boeke))
    localStorage.setItem(KAS_TYD, String(Date.now()))
  } catch { /* privaat modus, vol skyf — dit mag niks breek nie */ }
}

function kasIsVars() {
  try {
    const t = Number(localStorage.getItem(KAS_TYD) || 0)
    return t > 0 && Date.now() - t < VARS_MS
  } catch { return false }
}

/* Die opgelaaide boeke, of wat ons laas gesien het. Gooi nooit. */
export async function haalOpgelaaideBoeke() {
  const kas = leesKas()
  if (kas.length && kasIsVars()) return kas

  try {
    const snap = await Promise.race([
      getDocs(collection(db, 'books')),
      new Promise((_, weier) => setTimeout(() => weier(new Error('tydgrens')), TYDGRENS_MS)),
    ])
    const boeke = snap.docs.map(d => ({ id: d.id, ...d.data() }))

    /* 'n Leë antwoord vervang nooit 'n gevulde kas nie. */
    if (!boeke.length && kas.length) return kas

    skryfKas(boeke)
    return boeke
  } catch {
    return kas
  }
}

/* Die admin skryf 'n boek en moet dit nie ses uur later eers sien nie. */
export function vergeetBoeke() {
  try {
    localStorage.removeItem(KAS)
    localStorage.removeItem(KAS_TYD)
  } catch { /* stil */ }
}
