/* ── WATTER E-BOEK DIE OPSPRINGER ADVERTEER ──
 *
 * Dewald, 23 September 2026: *"hoekom toe ek die eboek skinderstories oplaai
 * was daar geen popup nuwe eboek.....?"*
 *
 * Omdat daar TWEE lyste boeke in hierdie app was, en hulle was nie dieselfde
 * nie:
 *
 *   · die e-boekBLAD bou sy lys uit Firestore PLUS die ingeboude lys — 21;
 *   · die OPSPRINGER het net die ingeboude lys gelees (`src/data/books.js`,
 *     14 boeke wat in die kode vasgeskryf staan).
 *
 * Skinderstories is deur die admin opgelaai en leef net in Firestore. Die
 * opspringer het dus gevra "watter van hierdie 14 het sy nog nie gesien nie?"
 * en Skinderstories was nooit eens 'n kandidaat nie. Dieselfde geld vir GRENSE
 * en vir elke boek wat nog ooit opgelaai gaan word: die opspringer kon net
 * adverteer wat 'n ontwikkelaar in die kode gesit het.
 *
 * ── Die tweede helfte van dieselfde fout ──
 *
 * Vir iemand wat al 14 gesien het, was daar GEEN ongesiene boek nie — en dan
 * wys die e-boek-opspringer nooit weer nie. Nie daardie dag nie, nie volgende
 * jaar nie. Dit is presies die trouste mense, en dit is woord vir woord
 * dieselfde stil verlies as die Tyd met God-fout waar wie elke dag deurgegaan
 * het, nooit weer 'n nuwe e-boek gesien het nie.
 *
 * Met die opgelaaide boeke in die lys los dit homself op: elke oplaai maak
 * weer iets ongesien.
 *
 * ── Wat NIE geadverteer word nie ──
 *
 * 'n Boek sonder 'n PDF. Die oplaai is drie stappe (skep, PDF, omslag) en
 * tussenin bestaan die dokument reeds met 'n titel. Adverteer ons dit, is die
 * "Kyk na die e-boek"-knoppie 'n knoppie wat niks doen nie — en dit is die
 * ergste ding wat 'n opspringer kan wees, want 'n mens word hoogstens EEN keer
 * per dag gevra en daardie beurt is dan verbruik.
 *
 * Hierdie lêer is SUIWER: lyste in, een boek uit. Geen Firestore, geen
 * `Date.now()`. Die haal staan in `eboekLys.js`.
 */

import { sorteerNuutsteBo } from './eboekeVolgorde.js'

/* Dieselfde verstek as die e-boekblad s'n (sien `BOOKS` in Meer.jsx). Sonder
   hulle wys die opspringer 'n leë kring: `EbookPopup` teken `book.color` en
   `book.emoji`, en 'n opgelaaide boek se dokument dra nie een van hulle nie. */
export const VERSTEK_KLEUR = '#EDE8F8'
export const VERSTEK_EMOJI = '📚'

/* Kan hierdie boek werklik OOPGEMAAK word?
 *
 * 'n Titel om te wys, en 'n PDF om na toe te gaan. Dit is die hele toets, en
 * albei helftes is nodig: 'n boek sonder titel wys 'n leë opskrif, en een
 * sonder PDF is 'n knoppie wat niks doen nie. */
export function kanWys(boek) {
  if (!boek || typeof boek !== 'object') return false
  if (!String(boek.title || '').trim()) return false
  return !!String(boek.pdfUrl || '').trim()
}

/* ── Die een lys, soos die BLAD hom bou ──
 *
 * Opgelaaide boeke eerste (nuutste bo), dan die ingeboudes in hul eie
 * volgorde. Dit is dieselfde vorm as `BOOKS` in Meer.jsx, en dit is met opset:
 * twee lyste wat verskil, is presies die fout wat hier reggemaak word.
 *
 * Bots 'n id, WEN die opgelaaide een. 'n Ingeboude boek se Firestore-dokument
 * is sy byvoegsel — dit dra die egte `pdfUrl` — en die kode-inskrywing dra net
 * die kleur, die emoji en die beskrywing. Ons voeg dus saam eerder as om te
 * kies. */
export function heleLys({ ingebou, opgelaai } = {}) {
  const kode = Array.isArray(ingebou) ? ingebou.filter(Boolean) : []
  const wolk = Array.isArray(opgelaai) ? opgelaai.filter(Boolean) : []

  const kodeOpId = new Map(kode.map(b => [String(b.id), b]))
  const wolkOpId = new Map(wolk.map(b => [String(b.id), b]))

  /* Wat NET in Firestore leef — die opgelaaides. Die verstek-kleur en -emoji
     gaan VOOR die boek se eie velde in, sodat 'n dokument wat hulle wel dra,
     hulle behou. */
  const nuwes = sorteerNuutsteBo(wolk.filter(b => !kodeOpId.has(String(b.id))))
    .map(b => ({ color: VERSTEK_KLEUR, emoji: VERSTEK_EMOJI, ...b }))

  /* Die ingeboudes, met hul Firestore-byvoegsel oor hulle. */
  const oues = kode.map(b => ({ ...b, ...(wolkOpId.get(String(b.id)) || {}) }))

  return [...nuwes, ...oues]
}

/* Watter boek adverteer ons NOU? `null` as daar niks is nie.
 *
 * `gesien` is `seenEbooks` in localStorage — die id's wat hierdie toestel reeds
 * aangebied is. Dit werk ongewysig vir opgelaaide boeke, want hulle dra
 * dieselfde soort id. */
export function kiesBoek({ ingebou, opgelaai, gesien } = {}) {
  const reeds = new Set((Array.isArray(gesien) ? gesien : []).map(String))
  return heleLys({ ingebou, opgelaai })
    .find(b => kanWys(b) && !reeds.has(String(b.id))) || null
}
