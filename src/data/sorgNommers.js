/* ────────────────────────────────────────────────────────────
   Die noodnommers en die grenssin — op EEN plek.

   'n Dooie noodnommer is die enigste ding in Pastorale Sorg wat regtig
   verkeerd kan loop. Daarom staan hulle hier en nêrens anders nie: die
   Hulp nou-blad, die krisisskerm in die vorm en die skerm ná 'n boodskap
   wys almal hierdie lys. Een regmaak, oral reg.

   HULLE MOET VOOR BEKENDSTELLING NAGEGAAN WORD — elke nommer geskakel.
   ──────────────────────────────────────────────────────────── */

export const NOODNOMMERS = [
  { naam: 'Selfmoord of selfskade', diens: 'SADAG', nommer: '0800 567 567', nota: '24 uur' },
  { naam: 'Polisie of noodgeval',   diens: 'SAPS',  nommer: '10111' },
  { naam: 'Noodoproep vanaf \'n selfoon', diens: '', nommer: '112' },
  { naam: 'Ambulans',               diens: '',      nommer: '10177' },
  { naam: '\'n Kind in gevaar',     diens: 'Childline', nommer: '116' },
]

/* Wat Pastorale Sorg is, en wat dit nie is nie. Dit moet daar wees en dit
   moet eerlik wees, maar dit moet nie skreeu nie. */
export const GRENSSIN =
  'Pastorale Sorg bied Bybelse hoop en bemoediging. Dit is nie \'n nooddiens, ' +
  'terapie of mediese sorg nie en waarborg nie \'n persoonlike antwoord nie. ' +
  'Hierdie muur word nie voortdurend gemonitor nie. Wanneer jy of iemand ' +
  'anders in onmiddellike gevaar is, gebruik die hulpnommers en moenie hier ' +
  'vir \'n antwoord wag nie.'

/* Een nommer as 'n skakel. 'n Noodnommer moet EEN druk wees. */
export function belSkakel(nommer) {
  return 'tel:' + String(nommer).replace(/\s/g, '')
}
