/* ── WIE REEDS GEE, WORD NIE WEER GEVRA NIE ──
 *
 * Dewald, 23 September 2026, oor die donasie-opspringer: *"hoe kry ek meer
 * donasies as nou maar pla nie die mense nie."*
 *
 * Twee foute het daardie vraag beantwoord, en albei het presies die verkeerde
 * mens gepla.
 *
 * ── Fout 1: 'n MAANDELIKSE VENNOOT is nêrens onthou nie ──
 *
 * By 'n suksesvolle betaling het daar gestaan:
 *
 *     if (type === 'donation') { ... }
 *
 * `type === 'subscription'` het 'n dankie-skerm gewys en NIKS geskryf nie. Die
 * mens wat R50 elke maand gee — die kosbaarste ondersteuner wat hierdie app
 * het — het dus elke maand die opspringer gekry wat vra of Daaglikse Hoop haar
 * gehelp het, met 'n knoppie om 'n vennoot te word. Sy IS een.
 *
 * ── Fout 2: 'n skenking BUITE die venster het nie getel nie ──
 *
 * `skenkPaid` is net geskryf as `getSkenkWindow()` op daardie oomblik 'n
 * venster teruggegee het — dus net op die 25ste tot maandeinde en die 2de/3de.
 * Gee iemand op die 10de, is dit vergeet, en op die 25ste word sy weer gevra.
 * Dit is sowat 21 van elke 31 dae waarop 'n skenking verdwyn het.
 *
 * Die oorsaak is dat die VENSTER en die SIKLUS deurmekaar geraak het. Die
 * venster is wanneer ons VRA; die siklus is waarvoor betaal is. Hulle is nie
 * dieselfde ding nie, en 'n betaling val altyd in 'n siklus — ook op 'n dag
 * wanneer ons niks vra nie.
 *
 * ── Die siklus ──
 *
 * 'n Siklus loop van die 25ste van een maand tot die 3de van die volgende, en
 * hy dra die naam van die EERSTE maand. Die twee kanse (25ste+ en 2de/3de) is
 * dus twee vrae oor dieselfde siklus, en een betaling maak albei stil.
 *
 * Die 4de tot die 24ste hoort by die siklus wat KOM, want die eersvolgende
 * vraag is die 25ste van daardie maand.
 *
 * ── Waarom 'n vennoot NOOIT weer gevra word ──
 *
 * 'n Kansellasie gebeur by PayFast en die foon hoor daar niks van. Ons kan dus
 * nie weet wanneer iemand ophou nie.
 *
 * Dit is 'n bewuste ruil, en dit is veilig om EEN rede: ons haal die
 * ONDERBREKING weg, nie die GELEENTHEID nie. Die donasie-kaart staan steeds op
 * agt skerms. Wie kanselleer en later weer wil gee, het 'n duidelike pad — hy
 * word net nie meer in sy pad voorgekeer nie.
 *
 * Die alternatief is om die mens wat R600 per jaar gee, twaalf keer te vra of
 * sy nie wil begin gee nie. Dit is hoe 'n mens 'n vennoot verloor.
 *
 * Hierdie lêer is SUIWER: 'n datum en wat in die berging staan, in; 'n antwoord
 * uit. Geen `Date.now()`, geen localStorage, geen window.
 */

/* Die twee sleutels in localStorage. Hulle staan HIER sodat 'n tikfout in een
   van die vyf plekke wat hulle lees, nie 'n stil "nooit gegee nie" word. */
export const SIKLUS_SLEUTEL  = 'skenkPaid'
export const VENNOOT_SLEUTEL = 'skenkVennoot'

/* Die eerste dag van 'n siklus, en die laaste. */
export const SIKLUS_BEGIN = 25
export const SIKLUS_EINDE = 3

function maandNaam(jaar, maand0) {
  return `${jaar}-${String(maand0 + 1).padStart(2, '0')}`
}

/* In WATTER siklus val hierdie oomblik?
 *
 * Altyd 'n antwoord — ook op die 12de, wanneer ons niks vra nie. Dit is die
 * hele regstelling van fout 2: 'n betaling val in 'n siklus, of ons op daardie
 * dag vra of nie. */
export function siklusVir(nou) {
  const d = nou instanceof Date ? nou : new Date(nou)
  if (isNaN(d.getTime())) return ''
  const dag = d.getDate()
  const jaar = d.getFullYear()
  const maand = d.getMonth()

  /* Die 1ste tot die 3de hoort nog by die VORIGE maand se siklus — dit is die
     stert van die venster wat op die 25ste begin het. */
  if (dag <= SIKLUS_EINDE) {
    return maand === 0 ? maandNaam(jaar - 1, 11) : maandNaam(jaar, maand - 1)
  }
  /* Die 4de tot die 24ste hoort by die siklus wat KOM: die eersvolgende vraag
     is die 25ste van hierdie maand. En die 25ste tot maandeinde is daardie
     siklus self. */
  return maandNaam(jaar, maand)
}

/* Vra ons NOU? `null` op elke ander dag.
 *
 * Twee kanse per siklus: een op die 25ste of later (betaaldag), en een op die
 * 2de of 3de vir wie toe nie oopgemaak het nie. */
export function vensterVir(nou) {
  const d = nou instanceof Date ? nou : new Date(nou)
  if (isNaN(d.getTime())) return null
  const dag = d.getDate()
  if (dag >= SIKLUS_BEGIN) return { cycleId: siklusVir(d), chance: 1 }
  if (dag === 2 || dag === 3) return { cycleId: siklusVir(d), chance: 2 }
  return null
}

/* Is hierdie mens 'n maandelikse vennoot? */
export function isVennoot(gestoor) {
  return !!String(gestoor || '').trim()
}

/* Gee hierdie mens REEDS — en moet sy dus nie gevra word nie?
 *
 * Dit is die een vraag wat elke skerm vra, en dit staan op EEN plek. Dit was
 * op drie plekke met drie effens verskillende toetse, en die vennoot het in al
 * drie deurgeval. */
export function reedsGegee({ siklus, gestoorSiklus, gestoorVennoot } = {}) {
  if (isVennoot(gestoorVennoot)) return true
  const s = String(siklus || '')
  return !!s && String(gestoorSiklus || '') === s
}

/* ── WATTER GESIG DIE STEUN-KAART WYS ──
 *
 * Die kaart het drie gesigte, nie een nie. Dieselfde fout as die
 * VOLG JESUS-kaart wat "GAAN VOORT" gewys het aan iemand wat klaar was: 'n
 * kaart wat vir almal dieselfde sê, lieg vir twee uit die drie.
 *
 *   'vennoot' — sy gee ELKE MAAND. Sy word BEDANK en niks word gevra nie.
 *               Geen knoppie nie: die enigste ding wat sy sou wou doen — haar
 *               bydrae verander — gebeur by PayFast, nie hier nie, en 'n
 *               knoppie wat niks doen nie, is erger as geen knoppie.
 *
 *   'gewer'   — sy het HIERDIE siklus eenmalig gegee. Sy word bedank, en die
 *               enigste uitnodiging is om 'n vennoot te word. Dit is die
 *               regte oomblik daarvoor en dit is die waardevolste tree in die
 *               hele app — maar dit staan stil, nie in die groen knoppie nie.
 *
 *   'vra'     — die gewone kaart.
 *
 * Dit is suiwer sodat die drie gevalle getoets kan word. Die WOORDE staan in
 * die komponent; hierdie funksie sê net wie kyk. */
export function kaartGesig({ siklus, gestoorSiklus, gestoorVennoot } = {}) {
  if (isVennoot(gestoorVennoot)) return 'vennoot'
  const s = String(siklus || '')
  if (s && String(gestoorSiklus || '') === s) return 'gewer'
  return 'vra'
}
