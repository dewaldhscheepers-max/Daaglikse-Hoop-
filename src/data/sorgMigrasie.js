/* ────────────────────────────────────────────────────────────
   Die plasings wat nog wag omdat die ou goedkeuringsproses nooit by hulle
   uitgekom het nie.

   Dewald: "Vind alle bestaande Sorg-plasings wat tans net weens die
   admin-goedkeuringsproses wag. Publiseer hulle sonder om duplikate te skep."

   Dit is 'n eenmalige lopie oor lewende data, en daar is presies twee maniere
   om dit te verongeluk:

     1. DUPLIKATE. Loop dit twee keer — 'n mens druk die knoppie weer, die
        eerste lopie het halfpad 'n tydgrens getref — en elke storie staan
        twee keer op die muur. Vir die mens wat geskryf het, lyk dit of sy
        boodskap uitgelek het.

     2. IETS WAT NIE OPENBAAR MAG GAAN NIE. 'n Gerapporteerde plasing, een wat
        Dewald weggesteek het, of een waar die mens nooit die blokkie gemerk
        het nie. Daardie laaste een is die ergste: dit is iemand se woorde wat
        openbaar gaan sonder toestemming.

   Albei word HIER besluit, suiwer, sodat hulle getoets kan word sonder om aan
   Firestore te raak. Die eindpunt doen niks anders as om hierdie antwoord uit
   te voer nie.

   Die datum, die tyd, die onderwerp, die inhoud, die skrywer en die
   anonimiteitskeuse gaan ONVERANDERD oor. 'n Migrasie wat 'n plasing van
   Junie vandag se datum gee, laat elke ou storie soos vandag se nuus lyk en
   die egte volgorde is vir altyd weg.
   ──────────────────────────────────────────────────────────── */

/* Wat 'n plasing kan word. Een woord per uitkoms, want die admin moet die
   getalle kan lees sonder om te raai. */
export const UITKOMSTE = ['publiseer', 'bestaan', 'uitgesluit']

/* ── Waarom iets uitgesluit word ──

   Elke rede is 'n string wat in die verslag beland. "Uitgesluit: 12" op sy
   eie is geen inligting nie — 'n mens moet kan sien of dit twaalf spam-
   plasings of twaalf mense sonder toestemming is. */
export const REDES = {
  gerapporteer: 'gerapporteer',
  verwyder: 'verwyder',
  spam: 'spam',
  geenToestemming: 'geen toestemming',
  gevaar: 'krisis — n mens moet self kyk',
  onveilig: 'outomaties gemerk as onveilig',
  leeg: 'geen teks',
}

/* ── Die besluit oor EEN plasing ──
 *
 * `bestaandeBronne` is die versameling `bronId`-waardes wat reeds op die muur
 * staan. Dit is die duplikaat-hek, en dit is 'n STEL en nie 'n vlaggie op die
 * plasing nie: die vlaggie kan verlore gaan wanneer 'n lopie halfpad omval,
 * maar die muur self lieg nooit oor wat daarop staan nie.
 */
export function besluitOor(p, bestaandeBronne) {
  const id = String((p && p.id) || '')
  if (!id) return { id: '', uitkoms: 'uitgesluit', rede: REDES.leeg }

  const teks = String((p && p.teks) || '').trim()
  if (!teks) return { id, uitkoms: 'uitgesluit', rede: REDES.leeg }

  /* ── Die duplikaat-hek, EERSTE ──
     Voor enige ander vraag. 'n Plasing wat reeds op die muur is, mag nooit 'n
     tweede keer gaan nie — ook nie wanneer sy status intussen verander het
     nie. */
  const bronne = bestaandeBronne || new Set()
  if (p.muurId || bronne.has(id)) return { id, uitkoms: 'bestaan', rede: '' }

  /* ── Toestemming ──
     Die duurste hek. Sonder 'n gemerkte blokkie is dit iemand se woorde wat
     openbaar gaan sonder dat hy ja gesê het. 'n Ontbrekende veld tel as GEEN
     toestemming — die veilige kant. */
  const t = p.toestemmings
  if (!t || t.openbaar !== true) {
    return { id, uitkoms: 'uitgesluit', rede: REDES.geenToestemming }
  }

  /* ── Wat 'n mens reeds oor hierdie plasing besluit het ──
     'n Status wat NIE 'nuut' is nie, beteken iemand het reeds gekyk. Ons draai
     daardie besluit nie om nie. */
  const status = String(p.status || 'nuut')
  if (status === 'gevaar')   return { id, uitkoms: 'uitgesluit', rede: REDES.gevaar }
  if (status === 'onveilig') return { id, uitkoms: 'uitgesluit', rede: REDES.onveilig }
  if (status === 'weg' || status === 'verwyder') {
    return { id, uitkoms: 'uitgesluit', rede: REDES.verwyder }
  }
  if (status === 'spam') return { id, uitkoms: 'uitgesluit', rede: REDES.spam }

  if (Number(p.gerapporteer) > 0 || p.gerapporteer === true) {
    return { id, uitkoms: 'uitgesluit', rede: REDES.gerapporteer }
  }
  if (p.verwyder === true || p.weg === true) {
    return { id, uitkoms: 'uitgesluit', rede: REDES.verwyder }
  }
  if (p.spam === true) return { id, uitkoms: 'uitgesluit', rede: REDES.spam }

  return { id, uitkoms: 'publiseer', rede: '' }
}

/* ── Wat op die muur geskryf word ──
 *
 * Alles kom uit die BRON. Niks word vandag se datum gegee nie, niks word
 * herskryf nie, en die anonimiteitskeuse gaan presies soos dit was.
 *
 * Dit is 'n WITLYS: 'n nuwe voorwerp word gebou. Die rou rekord dra 'n
 * toestel-has, 'n bestuurskode, krisiswoorde en 'n toestemmingsdatum, en nie
 * een van hulle hoort op 'n openbare muur nie. 'n Swartlys sou beteken dat
 * die volgende veld wat iemand byvoeg, vanself deurgaan.
 */
export function muurUit(p) {
  const anoniem = p.anoniem !== false
  return {
    bronId: String(p.id || ''),
    titel: String(p.titel || ''),
    teks: String(p.teks || ''),
    /* Anoniem wen altyd, en dit is die verstek — dieselfde reël as die res
       van die blad. Sien src/data/sorgProfiel.js. */
    naam: anoniem ? '' : String(p.naam || ''),
    foto: anoniem ? '' : String(p.foto || ''),
    anoniem,
    onderwerp: String(p.onderwerp || 'ander'),
    /* Die OORSPRONKLIKE datum en tyd. 'n Migrasie wat alles vandag se datum
       gee, laat elke ou storie soos vandag se nuus lyk. */
    datum: String(p.dag || p.datum || '').slice(0, 10),
    geskep: p.geskep || p.dag || '',
    gepubliseer: true,
    antwoord: p.antwoord || null,
    saam: Number(p.saam) || 0,
    reaksies: p.reaksies && typeof p.reaksies === 'object' ? p.reaksies : {},
    gelees: 0,
    sensitief: p.sensitief === true,
    rapporte: 0,
    /* Sodat 'n mens later kan sien waar hierdie plasing vandaan kom. Dit is
       nie inligting oor die MENS nie — dit is inligting oor die lopie. */
    gemigreer: true,
  }
}

/* ── Die hele lopie, as 'n antwoord ──
 *
 * Suiwer: plasings in, 'n plan uit. Die eindpunt skryf dit; hierdie funksie
 * besluit dit. Dit is hoe 'n droëloop presies dieselfde getalle kan gee as
 * die egte lopie — dieselfde kode, net sonder die skryf.
 */
export function beplan(inkomendes, bestaandeBronne) {
  const plan = { publiseer: [], bestaan: [], uitgesluit: [] }
  for (const p of inkomendes || []) {
    const b = besluitOor(p, bestaandeBronne)
    if (b.uitkoms === 'publiseer') plan.publiseer.push({ bron: p, muur: muurUit(p) })
    else if (b.uitkoms === 'bestaan') plan.bestaan.push(b)
    else plan.uitgesluit.push(b)
  }
  return plan
}

/* Die getalle vir die admin, plus 'n opsomming van die REDES — sodat
   "uitgesluit: 12" nie 'n raaisel is nie. */
export function verslag(plan, misluk = 0) {
  const redes = {}
  for (const u of plan.uitgesluit) redes[u.rede] = (redes[u.rede] || 0) + 1
  return {
    gepubliseer: plan.publiseer.length,
    uitgesluit: plan.uitgesluit.length,
    reedsDaar: plan.bestaan.length,
    misluk,
    redes,
  }
}
