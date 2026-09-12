/* ── Wat van 'n clip oor die draad gaan ──
 *
 * Dieselfde vorm en dieselfde rede as `volgJesusOpenbaar.js`: 'n **WITLYS**,
 * nie 'n swartlys nie. Die dokument wat uit Firestore kom, word NOOIT
 * deurgestuur nie — daar word 'n nuwe voorwerp gebou.
 *
 * Voeg iemand môre 'n veld by 'n clip (Dewald se eie nota oor hoekom hy dit
 * gekies het, 'n merkie dat dit nog gekeur moet word, wie dit gestuur het),
 * dan kom dit eers uit wanneer dit HIER bygesit word. En dit is nie "die skerm
 * wys dit nie" nie — dit is die netwerk-oortjie.
 *
 * ── Hoekom die kliënt dit nie meer self lees nie ──
 *
 * Die voer het `getDocs(collection(db, 'reels'))` gedoen, en dan moet daar 'n
 * `allow read` in `firestore.rules` staan — en daardie reël moet GEPUBLISEER
 * word. Dewald het dit twee keer op 'n foon probeer en die Firebase-konsole se
 * reëls-redigeerder is op 'n foon onbruikbaar.
 *
 * Dit lees nou deur `api/reels-lys.mjs` met die diensrekening, wat die reëls
 * omseil. Gevolg: `reels` bly heeltemal TOE vir kliënte, niks hoef gepubliseer
 * te word nie, en die witlys hierbo kom gratis saam. Dieselfde besluit as
 * VOLG JESUS, en om dieselfde rede.
 */

/* Net hierdie velde gaan oor die draad. Niks anders nie. */
export const VELDE = [
  'id',          /* die dokumentnaam — die post-id */
  'bron',        /* 'tiktok' | 'youtube' | 'eie' */
  'bronId',
  'naam',        /* die maker. Sonder hierdie een wys die clip glad nie */
  'handvatsel',
  'woorde',
  'eie',         /* is dit Daaglikse Hoop se eie? */
  'gebeurtenis', /* die brug se gebeurtenis — net vir ons eie clips */
  'brug',
  'gedeel',      /* die aggregaat wat 'n nuwe kyker se voer rangskik */
  'datum',
]

/* 'n Clip se `datum` kom as 'n Firestore-tydstempel of as 'n string. Die voer
   vergelyk hom met `localeCompare`, dus moet dit 'n string wees. */
function datumUit(w) {
  if (!w) return ''
  if (typeof w === 'string') return w
  if (w instanceof Date) return w.toISOString()
  /* Firestore se REST gee `{ timestampValue: '…' }`; die helper maak dit klaar
     'n string, maar 'n ou dokument kan 'n voorwerp dra. */
  if (typeof w === 'object' && typeof w.toISOString === 'function') return w.toISOString()
  return ''
}

export function openbareKlip(rou) {
  const d = rou && typeof rou === 'object' ? rou : null
  if (!d) return null

  const uit = {
    id:     String(d.id || '').trim(),
    bron:   String(d.bron || '').trim(),
    bronId: String(d.bronId || '').trim(),
    naam:   String(d.naam || '').trim(),
  }
  /* Die res is opsioneel en kom net saam as dit werklik daar is — 'n leë string
     op elke clip is bandwydte vir niks. */
  const handvatsel = String(d.handvatsel || '').trim()
  if (handvatsel) uit.handvatsel = handvatsel
  const woorde = String(d.woorde || '').trim()
  if (woorde) uit.woorde = woorde
  if (d.eie === true) uit.eie = true
  const gebeurtenis = String(d.gebeurtenis || '').trim()
  if (gebeurtenis) uit.gebeurtenis = gebeurtenis
  const brug = String(d.brug || '').trim()
  if (brug) uit.brug = brug
  const gedeel = Number(d.gedeel || 0)
  if (Number.isFinite(gedeel) && gedeel > 0) uit.gedeel = Math.floor(gedeel)
  const datum = datumUit(d.datum)
  if (datum) uit.datum = datum

  return uit
}

export function openbareLys(rou) {
  return (Array.isArray(rou) ? rou : []).map(openbareKlip).filter(Boolean)
}
