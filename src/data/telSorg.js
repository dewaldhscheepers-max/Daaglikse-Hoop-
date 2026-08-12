/* ────────────────────────────────────────────────────────────
   Tel drie oomblikke op die Sorg-blad.

   Sien `api/tel-sorg.js` vir waarom dit bestaan en wat NIE gestoor word
   nie. Kortweg: die app het niks getel nie, dus het "gister het 3 mense
   gedeel" geen noemer gehad, en sonder 'n noemer is elke herontwerp van
   daardie blad 'n raaiskoot.

   Drie reels geld hier:

   1. Dit mag NOOIT die skerm ophou nie. Geen `await` waar 'n mens op wag,
      geen fout wat opborrel, geen boodskap as dit misluk. 'n Teller wat
      iemand se gebedsversoek keer, is erger as geen teller nie.

   2. Dit mag nie twee keer tel nie. React se ontwikkelingsmodus roep
      effekte twee keer, en 'n mens wat vinnig tussen oortjies spring, sou
      elke keer weer tel. `EENMALIG` hou vas wat hierdie bladlaai reeds
      getel het.

      `vorm` en `gestuur` word NIE eenmalig gehou nie: iemand wat die vorm
      oopmaak, dit toemaak en weer oopmaak, het dit werklik twee keer
      oopgemaak, en iemand wat twee boodskappe stuur, het twee gestuur.

   3. `keepalive` sodat 'n telling nie verlore gaan wanneer die blad op
      daardie oomblik toegemaak word nie.
   ──────────────────────────────────────────────────────────── */

const PAD = '/api/tel-sorg'

/* Wat reeds op HIERDIE bladlaai getel is. */
const EENMALIG = new Set()

export function telSorg(wat, { eenmalig = false } = {}) {
  try {
    if (eenmalig) {
      if (EENMALIG.has(wat)) return
      EENMALIG.add(wat)
    }
    fetch(PAD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wat }),
      keepalive: true,
    }).catch(() => {})
  } catch {}
}
