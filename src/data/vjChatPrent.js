/* ── Watter adres agter die groepchat mag staan ──
 *
 * Die suiwer helfte. Dit ken geen Firebase nie, sodat dit met plain `node`
 * getoets kan word — en dit MOET getoets word: hierdie string word in 'n CSS
 * `url("...")` gesit, en 'n aanhaling of 'n hakie daarin is hoe 'n prent stil
 * verdwyn, of erger, hoe iemand iets anders in die styl inspuit.
 *
 * Die onsuiwer helfte — haal, kas en stoor — staan in vjChatAgtergrond.js.
 */
/* Wat 'n bruikbare adres is. 'n Leë string beteken "geen agtergrond" en dit is
   'n geldige antwoord — die chat werk sonder een. */
/* Die verstek-patroon. Dit lê in `public/` en word saam met die app gestuur —
   dit weeg 'n paar kilogreep, bly skerp op elke skerm, en is daar voordat die
   eerste boodskap staan.

   Laai Dewald 'n eie prent op, wen syne. Hierdie een is die vloer, nie 'n
   plekhouer nie: die chat lyk klaar reg sonder dat iemand iets doen. */
export const VERSTEK = '/beelde/vj-chat-patroon.svg'

export function keurAdres(rou) {
  const s = String(rou == null ? '' : rou).trim()
  if (!s) return ''
  /* Ons eie verstek is 'n relatiewe pad; alles anders moet https wees. */
  if (s !== VERSTEK && !/^https:\/\//i.test(s)) return ''
  /* Aanhalings en hakies in 'n CSS `url()` is hoe 'n prent stil verdwyn — of
     erger, hoe iemand iets anders in die styl inspuit. Hierdie adres word
     aangehaal wanneer dit gebruik word, maar ons laat die karakters wat daardie
     aanhaling kan breek, glad nie deur nie. */
  if (/["'()\\\s;{}<>]/.test(s)) return ''
  return s
}

