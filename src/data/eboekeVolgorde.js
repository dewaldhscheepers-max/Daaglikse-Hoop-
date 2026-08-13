/* ────────────────────────────────────────────────────────────
   In watter volgorde die e-boeke wys.

   ── Waarom dit bestaan ──

   Dewald laai 'n boek op en dit verskyn iewers in die middel van die lys.
   Dit het al met die kinderboeke gebeur en toe weer hier. Sy reel is
   eenvoudig: WAT NUUT IS, IS BO.

   Wat vantevore gestaan het, was dit:

       .sort((a, b) => { if (a.badge === 'NUUT') return -1
                         if (b.badge === 'NUUT') return 1
                         return 0 })

   Dit laat presies EEN boek dryf — die een met die NUUT-baadjie — en al die
   ander bly in die volgorde waarin Firestore hulle gee, wat alfabeties op
   die dokument se id neerkom. 'n Nuwe boek land dus waar sy naam toevallig
   sorteer.

   (Daardie vergelyker is boonop stukkend: is albei NUUT, gee dit -1 vir
   (a,b) EN -1 vir (b,a). 'n Sorteerder wat dit glo, kan enigiets doen.)

   ── Waar die tyd vandaan kom ──

   Die boeke se dokumente het geen `createdAt` nie. Maar die admin bou die id
   as `slug-<Date.now()>` — sien handleAddBook — dus DRA die id self die
   oomblik waarop die boek opgelaai is. Ons lees dit daaruit.

   Nuwe boeke kry nou ook 'n regte `createdAt`, en dit wen bo die id. Die
   id-pad bly vir alles wat reeds daar is; hy mag nooit weggegooi word nie.

   ── Uitgelig ──

   Die admin het 'n "★ Uitgelig"-knoppie wat `featured: true` skryf, en NIKS
   het ooit daardie veld gelees nie — die knoppie het al die tyd niks gedoen
   nie. Nou beteken dit iets: uitgeligte boeke staan bo-aan, en die res is
   nuutste eerste. So kan 'n boek vasgespeld word sonder om die reel te breek.
   ──────────────────────────────────────────────────────────── */

/* 1 Januarie 2000. 'n Getal kleiner as dit is nie 'n tydstempel nie — dit
   is 'n bladsynommer of 'n weergawe wat toevallig agteraan 'n id sit. */
const VROEGSTE = 946684800000

/* Wanneer hierdie boek bygekom het, in millisekondes. 0 as ons nie weet nie.

   Suiwer: geen Date.now(), geen window. Daarom kan dit getoets word. */
export function boekTyd(boek) {
  if (!boek || typeof boek !== 'object') return 0

  for (const veld of ['createdAt', 'updatedAt']) {
    const w = boek[veld]
    if (typeof w === 'number' && w >= VROEGSTE) return w
    if (typeof w === 'string' && w) {
      const t = Date.parse(w)
      if (!isNaN(t) && t >= VROEGSTE) return t
    }
    /* Firestore se Timestamp, as dit ooit so aankom. */
    if (w && typeof w.seconds === 'number') {
      const t = w.seconds * 1000
      if (t >= VROEGSTE) return t
    }
  }

  /* Die id se stert: `wat-is-myne-om-te-dra-1755000000000`. */
  const m = String(boek.id || '').match(/-(\d{13})$/)
  if (m) {
    const t = Number(m[1])
    if (t >= VROEGSTE) return t
  }
  return 0
}

/* Nuutste bo. Uitgeligte boeke eerste, en gelykes bly in hul oorspronklike
   volgorde — `sort` is stabiel, en ons breek gelykspel op die indeks sodat
   dit ook so bly waar dit nie is nie. */
export function sorteerNuutsteBo(boeke) {
  if (!Array.isArray(boeke)) return []
  return boeke
    .map((b, i) => ({ b, i, tyd: boekTyd(b), ster: b && b.featured === true ? 1 : 0 }))
    .sort((x, y) => (y.ster - x.ster) || (y.tyd - x.tyd) || (x.i - y.i))
    .map(r => r.b)
}
