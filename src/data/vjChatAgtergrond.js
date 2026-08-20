/* ── Die groepchat se agtergrond ──
 *
 * Dewald het 'n liggeel patroon gestuur — kruisies, duiwe, blare, versverwysings
 * — en gevra of dit agter die boodskappe kan staan. "net op die group chat."
 *
 * ── Waarom dit uit Firestore kom en nie uit die kode nie ──
 *
 * Ek kan nie 'n prent uit 'n gesprek aflaai nie. Hy laai dit dus self op in die
 * admin, net soos die wallpapers, en die adres kom hierheen. Dit is boonop
 * beter: hy kan dit môre verander sonder om iemand te vra.
 *
 * ── Waarom dit in localStorage gekas word ──
 *
 * Die chat is 'n skerm wat 'n mens tien keer per dag oopmaak. Sou ons elke keer
 * op Firestore wag voordat die agtergrond verskyn, sien 'n mens die patroon
 * elke keer INSKUIF nadat die boodskappe al staan. Die gekasde adres is dadelik
 * daar; die vars een kom stil agterna.
 *
 * ── Wat hier NIE gebeur nie ──
 *
 * Geen `<img>`. Dit word 'n CSS-agtergrond op 'n ONDEURSIGTIGE houer. 'n
 * Volskerm-`<img>` is die grootste tekstuur in die app en Chrome gee dit maklik
 * sy eie saamgestelde laag — presies wat die gekleurde strepe veroorsaak het.
 * Sien CLAUDE.md.
 */
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

export const DOK = 'vjChatAgtergrond'
const KAS = 'vj_chat_agtergrond'

export { keurAdres } from './vjChatPrent.js'
import { keurAdres } from './vjChatPrent.js'

export function leesKas() {
  try { return keurAdres(localStorage.getItem(KAS)) } catch { return '' }
}

function skryfKas(url) {
  try {
    if (url) localStorage.setItem(KAS, url)
    else localStorage.removeItem(KAS)
  } catch {}
}

/* Haal die vars adres. Gee die gekasde een dadelik terug deur `op`, en dan die
   nuwe een sodra Firestore antwoord. Val dit om, bly die gekasde een staan —
   'n agtergrond is nooit 'n rede om 'n gesprek te laat wag nie. */
export async function haalAgtergrond(op) {
  const gekas = leesKas()
  if (gekas && op) { try { op(gekas) } catch {} }
  try {
    const d = await getDoc(doc(db, 'config', DOK))
    const url = keurAdres(d.exists() ? (d.data() || {}).url : '')
    if (url !== gekas) {
      skryfKas(url)
      if (op) { try { op(url) } catch {} }
    }
    return url
  } catch {
    return gekas
  }
}

/* Die admin skryf dit. `config` is klient-leesbaar en admin-skryfbaar — sien
   firestore.rules. */
export async function stelAgtergrond(url) {
  const skoon = keurAdres(url)
  await setDoc(doc(db, 'config', DOK), { url: skoon }, { merge: true })
  skryfKas(skoon)
  return skoon
}
