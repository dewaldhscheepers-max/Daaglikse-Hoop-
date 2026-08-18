/* ── Wie is hierdie mens, en wat oorleef 'n herinstallasie ──
 *
 * Dewald se keuse: anoniem bly die verstek, en wie by 'n GROEP aansluit,
 * koppel sy rekening.
 *
 * ── Wat "anoniem" hier beteken ──
 *
 * NIE "onveilig" nie. `signInAnonymously` gee 'n egte Firebase-uid, en die
 * bediener verifieer daardie ID-token teen Google se sertifikate voordat hy
 * enigiets glo (`api/_vjToken.js`). Dit is presies wat §15 vra: die uid kom
 * uit 'n geverifieerde sessie, nooit uit die versoek se liggaam nie.
 *
 * Wat anoniem NIE gee nie, is DUURSAAMHEID. Die uid hoort aan die installasie.
 * Vee 'n mens die app se data uit, kry hy 'n nuwe uid — en dan is sy groep weg
 * en sy ou boodskappe wys as iemand anders.
 *
 * Daarom kan 'n mens sy rekening KOPPEL. Firebase se `linkWithCredential` hou
 * DIESELFDE uid en heg net 'n aanmelding daaraan; niks gaan verlore nie.
 *
 * ── Waarom dit nooit 'n muur is nie ──
 *
 * Die hele app se trekpleister is dat 'n mens niks hoef te registreer nie, en
 * 'n aanmelding kan om redes buite ons beheer misluk: Google-aanmelding is
 * dalk nie in die Firebase-projek aangeskakel nie, 'n uitklap word geblokkeer,
 * of 'n ingeboude blaaier laat dit nie toe nie.
 *
 * 'n Groep werk dus met of sonder die koppeling. Wat 'n mens verloor sonder
 * dit, is herstel ná 'n herinstallasie — en dit sê ons vir hom, in plaas van
 * om hom 'n knoppie te gee wat niks doen nie.
 */
import {
  signInAnonymously, onAuthStateChanged,
  GoogleAuthProvider, linkWithPopup, signInWithPopup,
} from 'firebase/auth'
import { auth } from '../firebase'

/* Wag totdat Firebase weet wie ons is. Die eerste laai van 'n blad het 'n
   oomblik waar `auth.currentUser` nog null is al is die mens aangemeld — 'n
   oproep in daardie oomblik lyk soos 'n uitgetekende mens. */
export function wagVirAuth() {
  return new Promise(op => {
    if (auth.currentUser) return op(auth.currentUser)
    const af = onAuthStateChanged(auth, u => { af(); op(u) })
  })
}

/* Verseker dat daar 'n gebruiker is. Gee null as Firebase self nie werk nie —
   dan is daar geen groep nie, en die skerm moet dit sê.

   Let op: `getOrCreateAnonUid()` in firebase.js het 'n terugval wat 'n
   PLAASLIKE id maak wanneer aanmelding misluk. Daardie id is nie geverifieer
   nie en die bediener sal hom weier. Ons gebruik hom dus nie hier nie — 'n
   groep sonder 'n egte uid is 'n groep wat nie kan bestaan nie. */
export async function versekerAanmelding() {
  try {
    const bestaande = await wagVirAuth()
    if (bestaande) return bestaande
    const { user } = await signInAnonymously(auth)
    return user
  } catch {
    return null
  }
}

export async function myUid() {
  const u = await versekerAanmelding()
  return u ? u.uid : ''
}

/* Die token vir 'n oproep na /api/vj-groep. Firebase vernuwe dit self wanneer
   dit verval; ons vra dit elke keer eerder as om dit te hou. */
export async function idToken() {
  const u = await versekerAanmelding()
  if (!u) return ''
  try { return await u.getIdToken() } catch { return '' }
}

/* Is hierdie rekening gekoppel — oorleef dit 'n herinstallasie? */
export function isGekoppel(gebruiker = auth.currentUser) {
  if (!gebruiker) return false
  if (gebruiker.isAnonymous === false) return true
  return Array.isArray(gebruiker.providerData) && gebruiker.providerData.length > 0
}

/* ── Koppel 'n Google-rekening ──
 *
 * Drie uitkomste, en al drie moet hanteer word:
 *
 *   1. dit koppel — die uid BLY dieselfde en alles bly staan;
 *   2. daardie Google-rekening is reeds aan 'n ANDER uid gekoppel (die mens het
 *      dit op 'n vorige foon gedoen). Dan meld ons met daardie rekening aan; die
 *      uid verander na sy OU een, en sy vorige groepe kom terug. Dit is presies
 *      die geval waarvoor koppeling bestaan;
 *   3. dit misluk — geblokkeerde uitklap, nie aangeskakel in die
 *      Firebase-projek nie, of die mens sluit die venster. Dan gebeur daar
 *      niks en die groep werk steeds.
 */
export async function koppelGoogle() {
  const gebruiker = await versekerAanmelding()
  if (!gebruiker) return { ok: false, fout: 'Ons kon nie by die aanmelding kom nie.' }

  const verskaffer = new GoogleAuthProvider()
  verskaffer.setCustomParameters({ prompt: 'select_account' })

  try {
    const r = await linkWithPopup(gebruiker, verskaffer)
    return { ok: true, uid: r.user.uid, gewissel: false }
  } catch (e) {
    const kode = (e && e.code) || ''

    /* Hierdie Google-rekening behoort reeds aan 'n ander uid. Meld daarmee aan
       — dit is hoe 'n mens sy ou groepe terugkry. */
    if (kode === 'auth/credential-already-in-use' || kode === 'auth/email-already-in-use') {
      try {
        const r = await signInWithPopup(auth, verskaffer)
        return { ok: true, uid: r.user.uid, gewissel: true }
      } catch { return { ok: false, fout: 'Ons kon nie aanmeld nie. Probeer asseblief weer.' } }
    }

    if (kode === 'auth/popup-closed-by-user' || kode === 'auth/cancelled-popup-request') {
      return { ok: false, gekanselleer: true, fout: '' }
    }
    if (kode === 'auth/operation-not-allowed') {
      /* Google-aanmelding is nie in die Firebase-projek aangeskakel nie. Dit is
         'n opstelling-ding, nie die mens se skuld nie — en dit mag hom nie keer
         om sy groep te gebruik nie. */
      return { ok: false, fout: 'Aanmelding is nog nie beskikbaar nie. Jou groep werk intussen net so.' }
    }
    return { ok: false, fout: 'Ons kon nie aanmeld nie. Jou groep werk intussen net so.' }
  }
}

/* Wat 'n mens verloor as hy nie koppel nie. Dit staan hier sodat die woorde
   een keer bestaan en nie op drie skerms uitmekaar dryf nie. */
export const KOPPEL_REDE =
  'Sonder dit hoort jou groep aan hierdie foon. Vee jy die app se data uit of ' +
  'installeer jy hom oor, moet jy weer met die groepkode aansluit.'
