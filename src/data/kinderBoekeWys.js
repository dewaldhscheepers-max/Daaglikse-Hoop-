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
function datumVan(b) {
  /* createdAt is die regte antwoord, maar boeke wat voor hierdie veld
     opgelaai is, het net 'n updatedAt. Sonder die terugval sou hulle saam met
     die ingeboude sewe onder val, en dan moet 'n mens elkeen gaan oopmaak en
     Stoor druk net om die volgorde reg te kry.

     Die terugval is veilig omdat createdAt wen sodra dit daar is, en
     kinder-boek-save vul dit by die volgende stoor met die dokument se BESTAANDE
     updatedAt in -- nie met vandag se datum nie. Die geskiedenis bly dus staan. */
  return (b && (b.createdAt || b.updatedAt)) || ''
}

function nuutsteEerste(a, b) {
  const da = datumVan(a)
  const db = datumVan(b)
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
