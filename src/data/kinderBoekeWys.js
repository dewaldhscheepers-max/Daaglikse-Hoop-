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

/* ── Die volgorde: nuutste bo ──

   Dit sorteer op `createdAt`, nie op `updatedAt` nie. Wysig 'n mens 'n ou boek
   se beskrywing, moet hy nie boontoe spring asof hy nuut is nie.

   Die sewe ingeboude boeke het geen datum nie. Hulle val dus onder, in die
   volgorde waarin hulle altyd was — 'n leë string sorteer laaste, en
   `localeCompare` op die id hou hulle onderling stabiel sodat die lys nie by
   elke oopmaak skommel nie. */
function nuutsteEerste(a, b) {
  const da = (a && a.createdAt) || ''
  const db = (b && b.createdAt) || ''
  if (da !== db) return da < db ? 1 : -1
  return String((a && a.id) || '').localeCompare(String((b && b.id) || ''))
}

export function boekeWatWys(uitFirestore, statiese) {
  const lys = Array.isArray(uitFirestore) ? uitFirestore : []
  const metBladsye = lys.filter(b => b && (b.pages || []).length > 0)
  /* Is daar niks in Firestore nie -- 'n eerste besoek, 'n aflyn foon, of 'n
     lees wat misluk het -- wys ons die ingeboude lys eerder as 'n leë blad. */
  if (!metBladsye.length) return statiese || []
  return metBladsye.slice().sort(nuutsteEerste)
}
