/* ────────────────────────────────────────────────────────────
   Wat gemeet word — en wat NOOIT.

   Dewald se punt 18. Die laaste sin daarin dra die hele ontwerp:

     "Moenie hierdie statistiek publiek op die Sorg-blad wys nie."

   Dit is die regte reël, en dit gaan verder as smaak. Op 'n blad waar mense
   oor hul huwelike skryf, is 'n publieke teller 'n wedstryd — en 'n muur wat
   soos 'n wedstryd voel, is nie 'n plek waar iemand sy swaarste sin neersit
   nie. Dewald het reeds "20 mense het vandag saamgedra" laat verwyder om
   presies daardie rede.

   ── Wat 'n gebeurtenis IS ──

   'n Naam en 'n dag. Meer nie.

   Geen toestel-id, geen sessie-id, geen tydstempel per mens, geen pad, geen
   verwysing na 'n spesifieke plasing. Dit beteken 'n mens kan NIE agterna
   uitwerk wie wat gedoen het nie — en dit is 'n eienskap, nie 'n beperking
   nie. Presies dieselfde reël as `tellers/toestemming` en
   `tellers/volgJesus`: heelgetalle, en niks anders.

   Wat 'n mens daaruit LEES is steeds alles wat punt 18 vra: hoeveel besoeke,
   watter bron, hoeveel klikke, hoeveel voltooide stories, hoeveel antwoorde.
   Wat 'n mens NIE daaruit kan lees nie, is wie.

   ── Die trechter ──

   Dit is die hele punt van meet: nie 'n getal nie, maar waar mense VAL.

     besoek → klik → begin → voltooi

   Val negentig persent tussen "klik op Deel wat swaar is" en "voltooide
   storie", is die VORM die probleem en niks anders help nie.
   ──────────────────────────────────────────────────────────── */

/* Elke gebeurtenis wat getel word. 'n WITLYS: 'n naam wat nie hier staan nie,
   word stilweg weggegooi. Sonder dit skryf 'n tikfout 'n nuwe veld op die
   dokument en dan is die telling vir altyd in twee stukke. */
export const GEBEURE = [
  /* Waar mense inkom */
  'besoek',            // die blad is oopgemaak
  'diep',              // hulle het op 'n diep skakel geland, nie op die tuisblad nie

  /* Die twee hoofkeuses */
  'klikDeel',          // "Deel wat swaar is"
  'klikLuister',       // "Luister na iemand"
  'klikBidSaam',       // deur na Bid Saam

  /* Wat werklik klaargemaak is */
  'storieBegin',       // die vorm is oopgemaak
  'storieKlaar',       // 'n storie is gestuur
  'antwoordBegin',     // die opmerkings is oopgemaak
  'antwoordKlaar',     // 'n antwoord is geplaas

  /* Die terugkeerkring */
  'saamDraOop',        // die Saam dra-oortjie
  'saamDraTerug',      // terug in 'n gesprek waarby jy reeds was
  'uitnodigingGedeel', // die algemene uitnodiging is gedeel

  /* Kennisgewings */
  'kennisOop',         // die app is uit 'n kennisgewing oopgemaak
]

export function keurGebeurtenis(naam) {
  const n = String(naam || '').trim()
  return GEBEURE.includes(n) ? n : ''
}

/* ── Die bron ──

   Ook 'n witlys, en om dieselfde rede: "facebook", "Facebook" en "fb" sou
   drie verskillende velde word en dan tel niks.

   Alles wat nie herken word nie, is `ander`. Dit is nie 'n verlies nie — die
   volle UTM staan in elk geval op die foon (sien src/data/sorgSkakels.js) en
   hierdie teller is 'n GROF beeld, nie 'n verslag nie. */
export const BRONNE = ['facebook', 'tiktok', 'whatsapp', 'kennisgewing', 'webwerf', 'uitnodiging', 'direk', 'ander']

export function keurBron(b) {
  const s = String(b || '').trim().toLowerCase()
  if (!s) return 'direk'
  if (BRONNE.includes(s)) return s
  /* 'n Paar gewone skryfwyses wat andersins in "ander" sou verdwyn. */
  if (/^fb$|facebook/.test(s)) return 'facebook'
  if (/tiktok|^tt$/.test(s)) return 'tiktok'
  if (/whats/.test(s)) return 'whatsapp'
  if (/push|kennis|notif/.test(s)) return 'kennisgewing'
  return 'ander'
}

/* ── Die veldnaam op die tellerdokument ──
 *
 * Die kliënt stuur 'n GEBEURTENIS en 'n BRON, nooit 'n veldnaam nie. Dieselfde
 * reël as `api/_volgJesusTelVelde.js`, en om dieselfde rede: die POST is oop,
 * en wie 'n veldnaam mag kies, mag enige veld op daardie dokument skryf.
 *
 * Die naam word HIER gebou, uit twee witlyste.
 */
export function veldVir(gebeurtenis, bron) {
  const g = keurGebeurtenis(gebeurtenis)
  if (!g) return ''
  return 'g_' + g
}

export function bronVeld(bron) {
  return 'b_' + keurBron(bron)
}

/* ── Die trechter ──
 *
 * Suiwer: 'n dokument met heelgetalle in, 'n leesbare beeld uit.
 *
 * Persentasies word HIER uitgewerk en nie op die skerm nie, sodat "0 uit 0"
 * op een plek beslis word. 'n Deling deur nul het al 'n admin-blad met "NaN%"
 * gevul, en dan lyk elke getal daarop verdag.
 */
function pct(deel, geheel) {
  const d = Number(deel) || 0
  const g = Number(geheel) || 0
  if (g <= 0) return 0
  return Math.round((d / g) * 1000) / 10
}

export function trechter(dok) {
  const d = dok || {}
  const g = n => Number(d['g_' + n]) || 0

  const besoek = g('besoek')
  const storieKlaar = g('storieKlaar')
  const antwoordKlaar = g('antwoordKlaar')

  return {
    besoek,
    /* Waar mense inkom. Die grootste enkele bron in hierdie app is die
       oggendkennisgewing; sonder hierdie opsplitsing lyk dit soos "direk". */
    bronne: BRONNE.map(b => ({ bron: b, tel: Number(d['b_' + b]) || 0 }))
      .filter(x => x.tel > 0)
      .sort((a, b) => b.tel - a.tel),

    /* Die twee hoofkeuses, en wat daarvan geword het. */
    vra: {
      klik: g('klikDeel'),
      begin: g('storieBegin'),
      klaar: storieKlaar,
      /* Val negentig persent hier, is die VORM die probleem. */
      voltooiPct: pct(storieKlaar, g('storieBegin')),
    },
    gee: {
      klik: g('klikLuister'),
      begin: g('antwoordBegin'),
      klaar: antwoordKlaar,
      voltooiPct: pct(antwoordKlaar, g('antwoordBegin')),
    },

    bidSaam: g('klikBidSaam'),

    /* Die terugkeerkring. Dit is die getal wat sê of hierdie 'n GEMEENSKAP is
       of 'n muur: kom mense terug na 'n gesprek waarby hulle reeds was? */
    terug: {
      saamDraOop: g('saamDraOop'),
      saamDraTerug: g('saamDraTerug'),
      uitnodiging: g('uitnodigingGedeel'),
      kennisOop: g('kennisOop'),
    },

    /* Diep skakels: hoeveel mense land op die REGTE skerm in plaas van op die
       tuisblad. Sien src/data/sorgSkakels.js. */
    diep: g('diep'),
    diepPct: pct(g('diep'), besoek),
  }
}

/* Hoeveel van die stories 'n antwoord gekry het. Dit kom NIE uit die tellers
   nie — dit kom uit die muur self, want dit is 'n toestand en nie 'n
   gebeurtenis nie. 'n Teller sou verkeerd raak sodra 'n opmerking verwyder
   word. */
export function antwoordKoers(plasings) {
  const lys = plasings || []
  const met = lys.filter(p => (Number(p.woordeTotaal) || 0) > 0).length
  return { stories: lys.length, metAntwoord: met, pct: pct(met, lys.length) }
}
