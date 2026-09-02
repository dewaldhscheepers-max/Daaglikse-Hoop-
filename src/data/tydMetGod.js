/* ────────────────────────────────────────────────────────────
   Vandag se Tyd met God — al die besluite, sonder 'n skerm.

   Die vloei verbind wat reeds in die app bestaan: die stemboodskap, die
   Skrifverwysing op die nota, die wallpaper, die gebedsmuur. Dit skep GEEN
   nuwe versameling nie en dit is met opset — 'n aparte mini-app binne die
   app is presies wat dit nie moet wees nie.

   Hierdie lêer is suiwer. Alles wat kan wissel — die tyd, die nota, wat op
   die foon gestoor is — kom van buite af in. Dit is hoe die reëls getoets
   kan word sonder 'n blaaier, en dit is hoe hulle oor ses maande nog geld.

   ── Die reëls wat nie mag verval nie ──

   1. 'n Skerm wat niks het om te wys nie, BESTAAN nie. Geen Skrifverwysing
      op vandag se nota → geen "Lees die Woord". Geen wallpaper → geen "Vat
      dit saam". 'n Leë skerm is 'n mens wat wonder of iets stukkend is.

   2. Die opsomming aan die einde lieg nooit. Dit vink net af wat die mens
      WERKLIK gedoen het. "Jy het jou hart voor God gebring" onder iemand wat
      niks getik het nie, maak die hele skerm 'n leuen.

   3. Het iemand vandag iets in die gebedskassie getik, word daar VANDAG nie
      vir geld gevra nie. Nie donasie nie, nie e-boek nie. Iemand wat pas
      geskryf het dat sy huwelik in stukke lê, is nie die mens vir 'n
      R50-vraag drie skerms later nie. Sien `slotVraag`.

   4. Een vraag aan die einde, nooit twee. Die donasiekaart staan reeds heel
      onder op Luister; die vloei se vraag is die tweede op daardie blad en
      moet die laaste wees.
   ──────────────────────────────────────────────────────────── */

import { kanOopmaak } from './skrifVerwysing.js'

/* Waar die hele toestand op die foon lê. Een sleutel, een voorwerp —
   makliker om te lees, en 'n mens kan dit in een keer skoonmaak. */
export const SLEUTEL = 'tmg_staat'

/* ── Wanneer 'n nuwe dag BEGIN ──
 *
 * Nie middernag nie. Dewald, 2 September 2026: *"ek sien dis al reg van
 * middernag al het ek nog nie die nuwe boodskap opgelaai nie."*
 *
 * Hy is reg, en dit was 'n egte fout. Om middernag het die vloei teruggestel
 * en die kaart het gese "Jou tyd met God is gereed" — terwyl die nuutste nota
 * nog GISTER s'n was. 'n Mens wat toe begin, het gister se boodskap gekry met
 * vandag se etiket daarop.
 *
 * Die dag begin dus VYFUUR. Dit is:
 *
 *   · ná die nag, sodat niemand 'n vals "gereed" om half een sien nie;
 *   · VOOR die oggendkennisgewing van 06:30, en dit is die belangrike helfte.
 *     Dewald het 07:30 gevra, maar dan sou elkeen wat die kennisgewing om
 *     06:30 druk 'n uur lank GISTER se toestand sien — wie gister klaar
 *     gemaak het, sou "Jy het vandag tyd met God gemaak" lees terwyl hy nog
 *     nie begin het nie. Vyf is die laaste uur wat albei kante red.
 *
 * Dit is EEN getal. Wil hy dit skuif, skuif dit hier, en die toetse hou vas
 * dat dit voor 06:30 bly.
 */
export const DAG_BEGIN_UUR = 5

/* Plaaslike tyd, nie UTC nie. `new Date().toISOString()` gee die UTC-datum,
   en Suid-Afrika is UTC+2: van middernag tot tweeuur die oggend sou die app
   dan die verkeerde dag wys. */
export function dagSleutel(nou = Date.now()) {
  const d = new Date(nou)
  /* Voor die begin-uur hoort hierdie oomblik nog by GISTER. Ons skuif die
     klok terug en lees dan die datum af — dit hanteer maandeinde, skrikkeljaar
     en somertyd sonder dat ons self aan hulle hoef te dink. */
  d.setHours(d.getHours() - DAG_BEGIN_UUR)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const g = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${g}`
}

export function maandSleutel(nou = Date.now()) {
  return dagSleutel(nou).slice(0, 7)
}

export function leegStaat() {
  return {
    dag:        '',    // die dag waarvoor die onderstaande tellings geld
    stap:       0,     // hoe ver hy vandag is; 0 = nog nie begin nie
    klaarOp:    '',    // die dag waarop hy laas heeltemal klaar gemaak het
    geluister:  '',    // die nota-id waarna hy vandag geluister het
    gelees:     false, // het hy vandag die Skrifgedeelte oopgemaak
    gebid:      0,     // hoeveel mense hy vandag gedra het
    getik:      false, // het hy vandag WOORDE in die gebedskassie getik
    hart:       false, // het hy sy hart voor God gebring (getik OF privaat)
    maand:      '',    // die maand waarvoor die onderstaande tellings geld
    gebidMaand: 0,
    daeMaand:   0,
  }
}

/* ── 'n Nuwe dag maak die dag skoon, nie die maand nie ──
 *
 * Dit is suiwer: dit verander niks, dit gee 'n nuwe voorwerp terug. Elke
 * skerm roep dit voordat hy iets lees, sodat gister se getalle nooit as
 * vandag s'n wys nie.
 *
 * `klaarOp` word NOOIT hier gewis nie. Dit is die enigste veld wat oor 'n
 * dag heen moet oorleef — daaraan hang die vraag "het hy vandag reeds
 * klaargemaak", en 'n mens wat dit verloor, sien "BEGIN" op 'n dag wat hy
 * reeds gedoen het.
 */
export function rolDag(staat, dag, maand = String(dag || '').slice(0, 7)) {
  const s = { ...leegStaat(), ...(staat || {}) }

  if (s.maand !== maand) {
    s.maand      = maand
    s.gebidMaand = 0
    s.daeMaand   = 0
  }
  if (s.dag !== dag) {
    s.dag       = dag
    s.stap      = 0
    s.geluister = ''
    s.gelees    = false
    s.gebid     = 0
    s.getik     = false
    s.hart      = false
  }
  return s
}

/* ── Watter skerms bestaan vandag ──
 *
 * Nooit 'n vaste lys nie. Twee van die ses hang aan wat Dewald by die nota
 * opgelaai het, en op 'n dag sonder een van hulle moet die vloei eenvoudig
 * korter wees — nie 'n skerm wat verskoning maak nie.
 *
 * `luister` staan ALTYD daar, ook wanneer hy reeds geluister het. Om dit oor
 * te slaan sou beteken die vloei maak op "Lees die Woord" oop, en dan weet
 * niemand waar hy is nie. Die skerm wys dan 'n merkie in plaas van 'n vraag.
 */
export const STAPPE = ['luister', 'woord', 'wallpaper', 'dra', 'hart', 'klaar']

export function bouStappe(nota) {
  const n = nota || {}
  const uit = ['luister']
  if (kanOopmaak(n.scripture)) uit.push('woord')
  if (n.wallpaperUrl)          uit.push('wallpaper')
  uit.push('dra', 'hart', 'klaar')
  return uit
}

/* ── Wat die kaart op Luister sê ──
 *
 * Vier toestande, en die derde is die een wat 'n mens vergeet. VOLG JESUS
 * het presies hier geval: iemand op Dag 3 het steeds "BEGIN HIER" gesien,
 * en die app het gemaak of hy nooit begin het nie. Sien volgJesusBegin.js —
 * daardie lêer bestaan net vir hierdie fout.
 *
 *   'geen'  → daar is niks om te doen nie; die kaart wys glad nie
 *   'begin' → hy het vandag nog nie begin nie
 *   'voort' → hy is halfpad
 *   'klaar' → klaar vandag; geen knoppie, net 'n stil reël
 */
export function kaartToestand({ nota, staat, dag }) {
  if (!nota || !nota.id) return 'geen'
  const s = rolDag(staat, dag)
  if (s.klaarOp === dag) return 'klaar'
  return s.stap > 0 ? 'voort' : 'begin'
}

/* ── Die een vraag aan die einde ──
 *
 * TWEE antwoorde, en dit was drie.
 *
 *   'deel'   → stuur vandag se hoop vir iemand
 *   'dankie' → hy gee reeds; hy word bedank en nooit gevra nie
 *
 * Die derde was 'skenk': 'n volskerm-geldvraag ("Help my om dit gratis te
 * hou") met 'n groot goue knoppie, op die 2de, 3de en van die 25ste af.
 *
 * Dit is weg, en Dewald se eie woorde is die rede: die skenk-knoppies moet
 * *"nie soos harde donation CTA's voel nie — net 'n sagte uitnodiging heel
 * onder."* 'n Volskerm-vraag met 'n goue knoppie IS 'n harde CTA, en dit het
 * die klein ry boonop verdring: op presies daardie dae kon sy nie wys nie,
 * want twee geldvrae op een skerm mag nooit.
 *
 * Nou het die klaar-skerm elke dag dieselfde gesig, en die geld staan altyd
 * klein en stil heel onder. Daar is nooit 'n dag waarop die app skielik oor
 * geld praat nie.
 */
export function slotVraag({ staat, reedsGegee = false }) {
  const s = { ...leegStaat(), ...(staat || {}) }
  /* Wie reeds gee, word BEDANK. Nie gevra nie — hy is 'n vennoot, nie 'n
     beursie nie. Dit geld ook wanneer hy vandag iets getik het. */
  if (reedsGegee && !s.getik) return 'dankie'
  return 'deel'
}

/* Mag daar vandag hoegenaamd oor geld gepraat word? Die App se popup vra dit
   ook, want die popup wat teruggehou is, mag nie ná die vloei alsnog opduik
   op 'n dag wat iemand sy hart oopgemaak het nie. */
export function magVraGeld(staat) {
  return !(staat && staat.getik)
}

/* ── Die kwitansie ──
 *
 * Eers wat hy gedoen het, dan eers 'n vraag. 'n Eindskerm wat met 'n vraag
 * begin, is 'n tolhek.
 *
 * Elke reël is 'n ding wat WERKLIK gebeur het. Daar is geen reël vir iets wat
 * oorgeslaan is nie — nie 'n grys een, nie 'n kruisie nie. Die skerm is 'n
 * dankie, nie 'n rapport nie.
 */
export function opsomming({ staat, nota, skrifOpskrif = '' }) {
  const s = { ...leegStaat(), ...(staat || {}) }
  const uit = []

  if (s.geluister && (!nota || s.geluister === nota.id)) {
    uit.push('Jy het na vandag se boodskap geluister')
  }
  if (s.gelees && skrifOpskrif) {
    uit.push(`Jy het ${skrifOpskrif} gelees`)
  }
  if (s.gebid === 1) uit.push('Jy het vir iemand anders gebid')
  if (s.gebid > 1)   uit.push(`Jy het vir ${s.gebid} mense gebid`)
  /* `hart`, nie `getik` nie. Wie sê "ek hou dit tussen my en God" het sy hart
     voor God gebring — die stelsel weet nie wat hy gebid het nie en hoef nie.
     `getik` is 'n enger ding en dien 'n ander doel; sien hieronder. */
  if (s.hart)        uit.push('Jy het jou hart voor God gebring')

  return uit
}

/* Die reël onder die kwitansie. Dit noem die MAAND, want 'n mens wat sien dat
   hy hierdie maand vir sestien mense gebid het, sien iets wat hy nie van
   homself geweet het nie.

   Nul word nooit gewys nie. "Jy het hierdie maand vir 0 mense gebid" is die
   teenoorgestelde van wat hierdie skerm moet doen. */
export function maandSin(staat) {
  const s = { ...leegStaat(), ...(staat || {}) }
  if (s.gebidMaand > 1) return `Hierdie maand het jy vir ${s.gebidMaand} mense gebid.`
  if (s.gebidMaand === 1) return 'Hierdie maand het jy vir iemand gebid.'
  return ''
}

/* ── Die merke ──
 *
 * Almal suiwer: staat in, nuwe staat uit. Die skerm skryf die uitslag na
 * localStorage; hierdie lêer raak nooit aan die foon nie.
 */
export function merkGeluister(staat, notaId) {
  const s = { ...leegStaat(), ...(staat || {}) }
  if (!notaId || s.geluister === notaId) return s
  return { ...s, geluister: notaId }
}

export function merkGelees(staat) {
  return { ...leegStaat(), ...(staat || {}), gelees: true }
}

/* Elke gebed tel een keer — die dag s'n en die maand s'n saam, sodat hulle
   nooit uitmekaar kan dryf nie. */
export function merkGebid(staat) {
  const s = { ...leegStaat(), ...(staat || {}) }
  return { ...s, gebid: s.gebid + 1, gebidMaand: s.gebidMaand + 1 }
}

/* ── Twee dinge wat maklik EEN ding lyk ──
 *
 * `hart`  — hy het sy hart voor God gebring. Dit geld ook wanneer hy sê "ek
 *           hou dit tussen my en God", want dan hét hy. Dit voed die
 *           kwitansie.
 * `getik` — hy het WOORDE in die kassie geskryf. Dit is die enigste ding wat
 *           die geldvraag afskakel.
 *
 * Hulle was een veld, en dit was 'n fout wat ek amper gestuur het: elke pad
 * deur skerm 5 het `getik` gemerk, ook 'n mens wat niks getik het nie en net
 * "nie vandag nie" gedruk het. Die klein skenk-knoppies op die klaar-skerm
 * sou dus NOOIT gewys het nie — nie een dag nie.
 *
 * Die reël wat hulle skei is presies die regte een: die geldvraag word gekeer
 * deur WOORDE, want dit is die woorde wat sê dat iemand swaarkry. */
export function merkHart(staat) {
  return { ...leegStaat(), ...(staat || {}), hart: true }
}

export function merkGetik(staat) {
  return { ...leegStaat(), ...(staat || {}), getik: true, hart: true }
}

/* Hoe ver hy is. Dit gaan net vorentoe: gaan iemand terug na 'n vorige skerm,
   moet die kaart op Luister nie skielik weer "BEGIN" sê nie. */
export function merkStap(staat, stap) {
  const s = { ...leegStaat(), ...(staat || {}) }
  const n = Number(stap)
  if (!Number.isFinite(n) || n <= s.stap) return s
  return { ...s, stap: n }
}

/* Klaar. `daeMaand` tel net EEN keer per dag op, ook al maak hy die vloei
   weer oop en weer klaar — anders tel 'n mens wat drie keer deurgaan as drie
   dae, en dan is die getal 'n leuen. */
export function merkKlaar(staat, dag) {
  const s = { ...leegStaat(), ...(staat || {}) }
  if (s.klaarOp === dag) return s
  return { ...s, klaarOp: dag, daeMaand: s.daeMaand + 1 }
}
