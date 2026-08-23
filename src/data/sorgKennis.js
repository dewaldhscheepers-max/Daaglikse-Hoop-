/* ────────────────────────────────────────────────────────────
   Die terugkeerkring.

   Dewald se punte 12 en 13:

     "Iemand deel → die storie verskyn → iemand antwoord → die skrywer kry 'n
      kennisgewing → die skrywer keer terug → die gesprek gaan voort."

     "Moenie 'n gebruiker verskeie kere vir dieselfde gebeurtenis in kennis
      stel nie."

   Dit is die enigste ding wat van hierdie blad 'n gemeenskap maak in plaas van
   'n muur. Sonder dit skryf 'n vrou haar storie, gaan weg, en kom nooit weer
   terug om te sien dat drie mense langs haar kom staan het nie.

   ── Waarom hierdie leer SUIWER is ──

   Ses duisend fone hang aan hierdie app se kennisgewings, en dit is al twee
   keer stil gebreek (sien CLAUDE.md). Die BESLUIT — wie kry wat, en wanneer
   nie — moet in 'n millisekonde getoets kan word, met dertig gevalle, sonder
   om een boodskap te stuur.

   ── Die drie reëls wat alles dra ──

   1. EEN keer per gebeurtenis. 'n Mens wat vyf antwoorde binne 'n uur kry, kry
      EEN kennisgewing. Vyf trillings vir een gesprek is hoe 'n mens leer om
      die app se kennisgewings af te skakel — en dan is hy vir altyd weg.

   2. NOOIT vir jou eie doen nie. Jy antwoord op jou eie storie, en die foon
      trill in jou hand. Dit lyk stukkend.

   3. Die luisteraars word nie GESPAM nie. Wie sê "laat weet my wanneer iemand
      nog wag", bedoel nie "stuur vir my elke nuwe storie" nie. Hoogstens een
      per dag, en NOOIT oor 'n storie wat intussen 'n antwoord gekry het nie.
   ──────────────────────────────────────────────────────────── */

/* Wat 'n mens in kennis gestel word van. Elke soort dra sy eie woorde en sy
   eie afkoeltyd — 'n antwoord op jou storie is dringend, 'n herinnering om
   weer te vra is dit nie. */
export const SOORTE = {
  antwoord: {
    /* Iemand het op JOU storie geantwoord. */
    titel: 'Iemand het by jou kom sit',
    afkoelUur: 6,
  },
  dewald: {
    /* Dewald het geantwoord. Dit is 'n aparte soort, en dit is met opset: dit
       moet deurkom ook al het iemand 'n uur gelede 'n gewone antwoord gekry. */
    titel: 'Dewald het op jou storie geantwoord',
    afkoelUur: 0,
  },
  reaksie: {
    /* Iemand het op JOU antwoord gereageer. */
    titel: 'Iemand is bemoedig deur wat jy geskryf het',
    afkoelUur: 24,
  },
  opdatering: {
    /* Iemand wat jy ondersteun het, het weer geskryf. */
    titel: 'Iemand wat jy gedra het, het weer geskryf',
    afkoelUur: 12,
  },
  vraWeer: {
    /* 'n Gesprek waarin jy saamgedra het, is stil geword. */
    titel: 'Gaan vra weer hoe dit gaan',
    afkoelUur: 48,
  },
  luisteraar: {
    /* Vir wie gesê het "laat weet my wanneer iemand nog wag". */
    titel: 'Iemand wag nog vir ’n woord',
    afkoelUur: 24,
  },
}

export function keurSoort(s) {
  const k = String(s || '').trim()
  return Object.prototype.hasOwnProperty.call(SOORTE, k) ? k : ''
}

const UUR = 3600 * 1000

/* ── Die sleutel wat 'n herhaling keer ──
 *
 * Soort + wie + waaroor. Dieselfde gebeurtenis op dieselfde gesprek gee
 * dieselfde sleutel, en dan stuur ons dit nie weer nie.
 *
 * Die `wie` is 'n toestel-has wat die BEDIENER reeds hou; dit kom nooit oor
 * die draad na 'n kliënt nie.
 */
export function sleutel(soort, wie, waaroor) {
  return `${keurSoort(soort)}|${String(wie || '')}|${String(waaroor || '')}`
}

/* ── Mag hierdie een uitgaan? ──
 *
 * Suiwer: die gebeurtenis, wat reeds gestuur is, en die tyd. 'n Rede uit
 * wanneer dit NIE mag nie — 'n stelsel wat stil niks doen nie, is 'n stelsel
 * wat 'n mens nooit kan regmaak nie.
 */
export function magStuur(gebeurtenis, { gestuur = {}, nou = Date.now(), aan = true } = {}) {
  const g = gebeurtenis || {}
  const soort = keurSoort(g.soort)
  if (!soort) return { stuur: false, rede: 'onbekende soort' }
  if (!g.wie) return { stuur: false, rede: 'niemand om te stuur nie' }

  /* Wie kennisgewings afgeskakel het, kry niks. Dit is nie 'n instelling wat
     ons kan omseil nie — dit is die stelsel se toestemming. */
  if (!aan) return { stuur: false, rede: 'kennisgewings is af' }

  /* NOOIT vir jou eie doen nie. Jy antwoord op jou eie storie en die foon
     trill in jou hand; dit lyk stukkend. */
  if (g.wie === g.deur) return { stuur: false, rede: 'dit is sy eie doen' }

  const s = sleutel(soort, g.wie, g.waaroor)
  const laas = Number(gestuur[s]) || 0
  const afkoel = (SOORTE[soort].afkoelUur || 0) * UUR

  if (laas && afkoel === 0) return { stuur: false, rede: 'reeds gestuur' }
  if (laas && nou - laas < afkoel) {
    return { stuur: false, rede: 'te gou — nog binne die afkoeltyd' }
  }

  return { stuur: true, rede: '', sleutel: s, titel: SOORTE[soort].titel }
}

/* ── Waarheen dit oopmaak ──
 *
 * "Elke kennisgewing moet direk na die korrekte gesprek oopmaak." 'n
 * Kennisgewing wat op die tuisblad land, is 'n kennisgewing wat 'n mens leer
 * om te ignoreer.
 *
 * `?k=1` sodat die groei-oorsig kan sien dat dit uit 'n kennisgewing kom —
 * sien src/data/sorgMeet.js. Dit is 'n VELDTOG, nie 'n mens nie.
 */
export function pad(gebeurtenis) {
  const g = gebeurtenis || {}
  const soort = keurSoort(g.soort)
  if (soort === 'luisteraar' && !g.waaroor) return '/sorg/wag?k=1'
  if (!g.waaroor) return '/sorg?k=1'
  return `/sorg/${encodeURIComponent(g.waaroor)}?k=1`
}

/* ── Die luisteraars ──
 *
 * Dewald: "Laat weet my wanneer iemand nog vir 'n eerste antwoord wag...
 * Moenie elke luisteraar oor elke nuwe storie spam nie. Stop die kennisgewing
 * sodra die storie reeds 'n betekenisvolle antwoord ontvang het."
 *
 * Dus: EEN storie per lopie, en dit moet werklik nog wag. Nie 'n lys nie —
 * een mens, sodat die kennisgewing "iemand wag" kan sê en waar wees.
 *
 * Hoe lank 'n storie moet wag voordat ons iemand roep. Te gou, en die
 * gemeenskap kry nooit die kans om self te antwoord nie; te laat, en die mens
 * wat geskryf het, het reeds opgegee.
 */
export const WAG_UUR = 4

export function kiesVirLuisteraars(plasings, { nou = Date.now() } = {}) {
  const lys = (plasings || []).filter(p => {
    if (!p || !p.id) return false
    /* 'n Betekenisvolle antwoord stop dit. 'n Hartjie is nie 'n antwoord nie. */
    const woorde = Number(p.woordeTotaal) || (Array.isArray(p.woorde) ? p.woorde.length : 0)
    if (woorde > 0) return false
    const ms = Date.parse(p.geskep || p.datum || '')
    if (!Number.isFinite(ms)) return false
    return nou - ms >= WAG_UUR * UUR
  })
  if (!lys.length) return null
  /* Die OUDSTE. Dit is die mens wat die langste gewag het, en dit is die een
     wat iemand nodig het — nie die nuutste storie nie. */
  return lys.sort((a, b) =>
    Date.parse(a.geskep || a.datum || 0) - Date.parse(b.geskep || b.datum || 0))[0]
}

/* ── Die boodskap ──
 *
 * Dit dra NIKS van die storie nie. Geen naam, geen sin, geen onderwerp.
 *
 * 'n Kennisgewing verskyn op 'n toe skerm, waar enigiemand dit kan sien — 'n
 * man se vrou, 'n kind se ouer. Die inhoud van iemand se storie hoort nie
 * daar nie, en die inhoud van JOU storie hoort nie op JOU toe skerm waar
 * iemand anders dit lees nie.
 */
export function boodskap(gebeurtenis) {
  const soort = keurSoort((gebeurtenis || {}).soort)
  if (!soort) return null
  return {
    titel: SOORTE[soort].titel,
    lyf: soort === 'luisteraar'
      ? 'Iemand het gedeel en niemand het nog geantwoord nie. Tik om te gaan luister.'
      : 'Tik om die gesprek oop te maak.',
    pad: pad(gebeurtenis),
  }
}
