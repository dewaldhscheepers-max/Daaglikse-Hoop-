/* ────────────────────────────────────────────────────────────
   Watter kinderboeke in die app verskyn.

   Dit was 'n status-veld: 'draft' of 'published'. 'n Nuwe boek het op
   'draft' begin en die keuselys om dit te verander was maklik om te mis, dus
   het 'n mens die bladsye opgelaai, Stoor gedruk, en niks het gebeur.

   Nou is die reel eenvoudig: 'n boek wys as hy BLADSYE het. Dieselfde
   beskerming sonder 'n knoppie om te vergeet -- 'n halfklaar boek wys nie,
   want daar is niks om te wys nie, en dit word vanself reg sodra die bladsye
   daar is.

   ── Waarom dit hier woon en nie in die skerm nie ──

   Twee plekke gebruik hierdie reel: die biblioteek self, en die telling op
   die promo-kaart ("7 gratis kinderboeke beskikbaar"). Daardie telling het
   die INGEBOUDE lys getel en het dus vir altyd op sewe bly staan, ook nadat
   'n agtste boek opgelaai is. Twee plekke wat dieselfde vraag verskillend
   antwoord, is hoe 'n mens 'n banier kry wat lieg.

   Met die .js-uitbreiding, sodat plain `node` dit kan invoer -- die toetse
   loop sonder 'n toetsraamwerk en sonder Vite.
   ──────────────────────────────────────────────────────────── */

export function boekeWatWys(uitFirestore, statiese) {
  const lys = Array.isArray(uitFirestore) ? uitFirestore : []
  const metBladsye = lys.filter(b => b && (b.pages || []).length > 0)
  /* Is daar niks in Firestore nie -- 'n eerste besoek, 'n aflyn foon, of 'n
     lees wat misluk het -- wys ons die ingeboude lys eerder as 'n leë blad. */
  return metBladsye.length > 0 ? metBladsye : (statiese || [])
}
