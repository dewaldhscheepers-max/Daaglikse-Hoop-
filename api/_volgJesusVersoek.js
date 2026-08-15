/* Wanneer iemand vra dat sy gemeente hom kontak.
 *
 * ── Die eerlike spanning in hierdie leer ──
 *
 * Ons het deurgaans gesê die kerk sien niks persoonliks nie. Maar 'n mens kan
 * nie "kontak my" hê sonder iets om mee te kontak nie.
 *
 * Die antwoord is nie om die reel te breek nie — dit is om die reel PRESIES te
 * stel:
 *
 *   Die kerk kry 'n NAAM en EEN kontakbesonderheid, wat die mens self op
 *   daardie oomblik en vir daardie doel ingetik het.
 *
 *   Die kerk kry NOOIT sy privaat refleksies, sy joernaal, sy antwoorde op
 *   die hartsvrae, of enigiets wat hy vir homself geskryf het nie.
 *
 * Daarom aanvaar hierdie leer PRESIES vier velde en gooi al die res weg. 'n
 * Eindpunt wat alles vat wat gestuur word, is 'n eindpunt wat eendag 'n
 * refleksie sal stoor omdat iemand 'n veld bygevoeg het.
 */

/* Beheerkarakters uitgeskryf. `[ -<>&"]` lyk soos "hierdie vier karakters"
   maar is 'n REEKS van spasie (0x20) tot < (0x3C) — dit verwerp syfers en
   spasies. Sien CLAUDE.md. */
const BEHEER = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/

const MYLPALE = {
  volg: ['ja'],
  doop: ['wil', 'vrae'],
}

function skoonTeks(rou, maks) {
  if (typeof rou !== 'string') return null
  const t = rou.trim().replace(/\s+/g, ' ')
  if (!t || t.length > maks) return null
  if (BEHEER.test(t)) return null
  return t
}

/* 'n Kontakbesonderheid is 'n e-pos OF 'n telefoonnommer. Ons keur dit lig —
   die doel is om gemors te keer, nie om 'n mens te leer hoe om sy nommer te
   skryf nie. 'n Pastor wat 'n effens vreemde nommer sien, bel dit; 'n mens
   wat afgewys word omdat sy nommer 'n spasie het, gee op. */
function skoonKontak(rou) {
  const t = skoonTeks(rou, 120)
  if (!t || t.length < 5) return null
  const epos    = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)
  const nommer  = /^[+()\d][\d\s()+-]{4,}$/.test(t)
  return (epos || nommer) ? t : null
}

/* Vorm die versoek. Gee 'n { versoek } of 'n { fout } — nooit 'n halwe
   voorwerp nie. */
function maakVersoek(lyf, nou) {
  if (!lyf || typeof lyf !== 'object') return { fout: 'Geen versoek' }

  const mylpaal = typeof lyf.mylpaal === 'string' ? lyf.mylpaal : null
  if (!mylpaal || !MYLPALE[mylpaal]) return { fout: 'Onbekende mylpaal' }

  const waarde = typeof lyf.waarde === 'string' ? lyf.waarde : null
  /* Dit is die hek wat keer dat 'n versoek geskep word vir 'n keuse wat NIE
     kontak aanbied nie. Iemand wat "ek is reeds gedoop" gekies het, moet
     nooit in 'n pastor se lys beland nie. */
  if (!waarde || !MYLPALE[mylpaal].includes(waarde)) {
    return { fout: 'Hierdie keuse vra nie vir kontak nie' }
  }

  const naam = skoonTeks(lyf.naam, 80)
  if (!naam) return { fout: 'Ons het jou naam nodig' }

  const kontak = skoonKontak(lyf.kontak)
  if (!kontak) return { fout: 'Ons het ’n e-posadres of selnommer nodig' }

  /* Die gemeentekode is opsioneel: iemand kan alleen stap. Dan gaan die
     versoek na Dewald se admin in plaas van na 'n gemeente. */
  const gemeente = lyf.gemeente ? skoonTeks(lyf.gemeente, 24) : null

  return {
    versoek: {
      mylpaal,
      waarde,
      naam,
      kontak,
      gemeente,
      /* Wat die pastor as die opskrif sien. */
      opskrif: mylpaal === 'doop'
        ? (waarde === 'wil' ? 'Doopgesprek versoek' : 'Vrae oor doop')
        : 'Wil oor sy volgende tree praat',
      geskep: nou,
      hanteer: false,
    },
  }
}

/* Wat 'n pastor in sy lys sien. Hierdie funksie bestaan sodat daar EEN plek
   is wat bepaal wat uitgaan — nie 'n `...versoek` iewers in 'n roete nie. */
function virDieKerk(v) {
  if (!v) return null
  return {
    id:      v.id || null,
    opskrif: v.opskrif,
    naam:    v.naam,
    kontak:  v.kontak,
    geskep:  v.geskep,
    hanteer: v.hanteer === true,
  }
}

module.exports = { maakVersoek, virDieKerk, skoonTeks, skoonKontak }
