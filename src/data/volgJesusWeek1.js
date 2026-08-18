/* ── VOLG JESUS · WEEK 1 — "Wie sê jý is Jesus?" ──
 *
 * Dewald: "Die probleem met die huidige implementasie is dat VOLG JESUS soos
 * 'n kursus begin voel: lees → klik → lees → klik → luister → klik → skryf →
 * klik → kaart → klik → nog 'n antwoord. Dit is nie die produk wat ek wil hê
 * nie. VOLG JESUS MAG NOOIT SOOS HUISWERK VOEL NIE."
 *
 * Hy is reg, en die fout was myne. Ek het "een stap op 'n slag" gelees as
 * "baie klein skermpies", en die gevolg was 'n ketting van knoppies. Die
 * gevoel wat hy wil hê is:
 *
 *     MAAK OOP → SIEN EEN DING → DOEN EEN DING → ANTWOORD EEN DING → KLAAR.
 *
 * ── Wat hierdie leer nou is ──
 *
 * Elke dag is EEN BLAD met 'n paar blokke en EEN knoppie onderaan. Nie agt
 * skerms nie. 'n Mens maak oop, skuif een keer, tik een antwoord, en is klaar.
 *
 * Die tydsbegroting is Dewald s'n:
 *   Dag 1  ±5–6 min (waarvan ±4 die stemboodskap is)
 *   Dag 2  ±2–3 min
 *   Dag 3  ±2–3 min
 *   Dag 4  ±2–3 min
 *   Dag 5  ±3–4 min
 *
 * En sy toets vir elke nuwe stuk teks: "Sal die gebruiker iets verloor as ons
 * hierdie verwyder?" Is die antwoord nee — verwyder dit. Daarom is die
 * openingsblad kort, is daar hoogstens twee private antwoorde per dag, en is
 * daar geen "DINK HIERAAN"-blok van ses paragrawe nie.
 *
 * Die STEMBOODSKAP dra die geestelike gewig. Die app moet nie daarna nog 'n
 * preek gee nie; dit help 'n mens net om te reageer.
 *
 * ── Wat 'n mens hier skryf, bly op sy foon ──
 *
 * Elke `id` hieronder is 'n private antwoord in localStorage. Dit gaan nooit
 * oor die netwerk nie. Sien `antwoordSleutel` in VolgJesusStap.jsx.
 *
 * Suiwer data. Geen `window`, geen netwerk.
 */

export const WEEK1_TITEL = 'Wie sê jý is Jesus?'

/* Die openingsblad. Kort. Dewald: "Moenie die huidige lang openingsblad
   gebruik nie ... Geen verdere intro." */
export const WEEK1_OPENING =
  'Jy hoef nie hierdie week alles uit te werk nie.\n\n' +
  'Ons begin net by Jesus.\n\n' +
  'Lees wat die Evangelies oor Hom sê. Luister. Wees eerlik.\n\n' +
  'En kyk waar hierdie vraag jou raak: Wie sê jý is Jesus?'

/* ── Die blokke ──
 *
 * 'n Dag is 'n LYS BLOKKE op EEN blad, nie 'n ketting skerms nie.
 *
 *   lees       — 'n klein reël plus 'n knoppie na die app se Bybel
 *   stem       — die week se stemboodskap, transkripsie toegevou
 *   teks       — 'n kort stuk prosa
 *   groot      — die een sin wat moet bly
 *   vraag      — EEN private tekskassie wat vanself stoor
 *   kies       — 'n keuse wat EEN opvolgvraag oopmaak
 *   gebed      — een reël, nie 'n lang gebed nie
 *   terugblik  — die mens se eie vroeëre woorde
 */

const DAG1 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Matteus 16:13–17',
    /* Geen "EK HET GELEES"-knoppie wat die pad blokkeer nie. 'n Mens skuif
       eenvoudig af na die stemboodskap. */
    lyf: 'Let net op hoe Jesus beweeg van “Wat sê die mense?” na: “Maar julle, wie sê julle is Ek?”',
  },
  { soort: 'stem', titel: 'Wie sê jý is Jesus?', duur: '±4 minute' },
  {
    soort: 'vraag',
    kop: 'WAT HET JOU GETREF?',
    id: 'getref',
    prompt: 'Skryf een ding neer…',
    deelStem: true,
  },
]

const DAG2 = [
  {
    soort: 'lees',
    merk: 'KYK SELF',
    skrif: 'Johannes 1:1–18',
    lyf: 'Lees dit stadig. Moenie vandag probeer om alles te verstaan nie. Soek net een ding wat hierdie gedeelte vir jou oor Jesus wys.',
  },
  { soort: 'vraag', id: 'sien2', prompt: 'Vandag sien ek dat Jesus…' },
  { soort: 'gebed', lyf: 'Jesus, help my om U te sien soos U werklik is. Amen.' },
]

const DAG3 = [
  {
    soort: 'kies',
    id: 'area',
    kop: 'KIES EEN.',
    lyf: 'Waar is dit vandag vir jou die moeilikste om Jesus te vertrou of te volg?',
    opsies: [
      { waarde: 'bang',    woorde: 'Ek is bang' },
      { waarde: 'geld',    woorde: 'Geld' },
      { waarde: 'seer',    woorde: 'Iemand het my seergemaak' },
      { waarde: 'besluit', woorde: 'Ek moet ’n besluit neem' },
      { waarde: 'privaat', woorde: 'My private lewe' },
    ],
    /* EEN opvolgvraag, en dieselfde een vir elke keuse. Vyf verskillende
       vraagpare was vyf keer soveel skerm vir dieselfde ding. */
    vraag: {
      id: 'volg3',
      kop: 'AS JESUS WERKLIK HERE IS, HOE SOU DIT LYK OM HOM JUIS HIER TE VERTROU EN TE VOLG?',
    },
  },
  { soort: 'gebed', lyf: 'Jesus, leer my om U juis hier te vertrou en te volg. Amen.' },
]

const DAG4 = [
  {
    soort: 'teks',
    lyf: 'Ons hou maklik van Jesus wat troos. Jesus wat help. Jesus wat vergewe.\n\n' +
         'Maar dieselfde Jesus lei. Hy korrigeer. Hy sê soms dinge wat teen my eie begeertes ingaan.\n\n' +
         'En daarom moet elke dissipel soms vra: volg ek Jesus soos Hy werklik is — of net die weergawe van Jesus wat vir my gemaklik is?',
  },
  { soort: 'groot', lyf: '’n Jesus wat jy self kan vorm,\nkan jou nooit vorm nie.' },
  {
    soort: 'kies',
    id: 'moeilikste',
    kop: 'WAT IS VIR JOU DIE MOEILIKSTE?',
    opsies: [
      { waarde: 'lei',       woorde: 'Wanneer Jesus my lei' },
      { waarde: 'korrigeer', woorde: 'Wanneer Jesus my korrigeer' },
      { waarde: 'verander',  woorde: 'Wanneer Jesus my roep om te verander' },
    ],
    vraag: { id: 'waarom4', kop: 'WAAROM?' },
  },
  { soort: 'gebed', lyf: 'Jesus, gee my die nederigheid om U te volg, ook wanneer U my uitdaag. Amen.' },
]

const DAG5 = [
  /* Die ding wat 'n boek of 'n preek nie kan doen nie: die app gee 'n mens sy
     eie woorde terug. Is daar niks gestoor nie, verdwyn hierdie blok — nooit
     `undefined`, nooit 'n leë aanhaling. */
  { soort: 'terugblik', bronId: 'getref', kop: 'OP DAG 1 HET JY GESKRYF:' },
  {
    soort: 'teks',
    lyf: 'Vier dae later het jy weer na Jesus gekyk. Jy het Sy woorde gelees. Jy het eerlik na jou eie lewe gekyk.\n\nNou kom dieselfde vraag terug.',
  },
  { soort: 'vraag', id: 'glo5', kop: 'WIE SÊ JÝ IS JESUS?', prompt: 'Skryf dit in jou eie woorde…' },
  { soort: 'vraag', id: 'area5', kop: 'WAT IS EEN AREA WAARIN JY HOM NOU MEER WIL VOLG?', prompt: 'Een area…' },
  {
    soort: 'gebed',
    kop: 'BID',
    lyf: 'Jesus, ek wil U nie net ken uit wat ander mense oor U sê nie. Ek wil U self beter leer ken.\n\n' +
         'Waar ek U te klein gemaak het, korrigeer my. Waar ek self die laaste sê wil hê, leer my om U te vertrou.\n\n' +
         'Ek wil U ken. Ek wil U volg. Amen.',
  },
]

export const WEEK1_DAE = [
  {
    n: 1, titel: 'Wie sê jý is Jesus?', merk: 'DIE VUUR',
    knop: 'KLAAR VIR VANDAG',
    klaarKop: 'DAG 1 KLAAR.',
    klaarLyf: 'Hou vandag hierdie vraag by jou: Wie sê jý is Jesus?',
    blokke: DAG1,
  },
  {
    n: 2, titel: 'Kyk self', merk: 'KYK SELF',
    knop: 'KLAAR VIR VANDAG',
    klaarKop: 'DAG 2 KLAAR.',
    blokke: DAG2,
  },
  {
    n: 3, titel: 'Waar raak dit my lewe?', merk: 'MY WERKLIKE LEWE',
    knop: 'KLAAR VIR VANDAG',
    klaarKop: 'DAG 3 KLAAR.',
    blokke: DAG3,
  },
  {
    n: 4, titel: 'Het ek ’n Jesus gevorm wat by mý pas?', merk: 'DIE SNY',
    knop: 'KLAAR VIR VANDAG',
    klaarKop: 'DAG 4 KLAAR.',
    blokke: DAG4,
  },
  {
    n: 5, titel: 'Kyk terug', merk: 'KYK TERUG',
    knop: 'VOLTOOI WEEK 1',
    blokke: DAG5,
  },
]

/* Wat aan die einde van die week teruggewys word. Net wat werklik geskryf is;
   'n leë een word oorgeslaan. */
export const WEEK1_REIS = [
  { id: 'getref', kop: 'Jy het op Dag 1 geskryf:' },
  { id: 'glo5',   kop: 'Vandag het jy geskryf:' },
  { id: 'area5',  kop: 'Die area waarin jy Hom meer wil volg:' },
]

/* Die deelbare kaart aan die einde. Die kernlyn van die week. */
export const WEEK1_DEELSIN =
  'Jy kan nie die kruis vir jou skuld vat en die troon vir jouself hou nie.'

/* Wat volgende week wag. Dit staan hier sodat die einde van Week 1 'n rede gee
   om terug te kom, sonder dat iemand dit moet onthou om by te werk. */
export const WEEK1_VOLGENDE = {
  nommer: 2,
  titel: 'Hoekom hou jy so styf aan beheer vas?',
  lyf: 'Ons bid maklik: “Here, help my.” Maar iets verander wanneer die gebed word: “Here, regeer oor my.”',
}

/* Die blokke vir 'n dag. Dag 3 en Dag 4 se opvolgvraag verskyn eers wanneer
   'n mens gekies het — op DIESELFDE blad, nie op 'n nuwe skerm nie. */
export function blokkeVirDag(n) {
  const dag = WEEK1_DAE.find(d => d.n === n)
  return dag ? dag.blokke : []
}

/* ── Die stemboodskap se transkripsie ──
 *
 * By verstek TOEGEVOU. 'n Mens moet die boodskap hoor; die teks is daar vir
 * wie liewer lees of iets wil teruglees. */
export const WEEK1_TRANSKRIPSIE = `As Jesus vandag niks vir jou regmaak nie — die geld bly min, die antwoord waarvoor jy bid kom nie, die situasie verander nie — sal jy Hom steeds wil hê?

Nie net Sy hulp nie. Nie net wat Hy vir jou kan gee nie. Hom.

Want dit is moontlik om Jesus te soek… sonder om eintlik Jesus te soek.

Ek kan Sy vrede wil hê. Sy beskerming. Sy voorsiening. Sy vergifnis. Ek kan wil hê Hy moet my lewe regmaak… maar steeds diep binne sê: “Here, help my met mý plan.”

En dalk is een van die gevaarlikste dinge wat ons kan doen om vir onsself ’n Jesus te vorm wat gemaklik by ons lewe inpas.

’n Jesus wat my troos… maar my nooit uitdaag nie. Wat my vergewe… maar nooit aan my keuses raak nie. Wat my help… maar nooit Here oor my lewe mag wees nie.

In Matteus 16 vra Jesus vir Sy dissipels: “Wie sê die mense is die Seun van die mens?”

En almal het ’n antwoord. Johannes die Doper. Elia. Jeremia.

Almal het ’n opinie oor Jesus gehad. Net soos vandag.

Maar toe maak Jesus dit persoonlik: “Maar julle, wie sê julle is Ek?”

Nie: wat sê jou kerk? Wat glo jou ouers? Wat het jy as kind geleer?

Jý. Wie sê jý is Jesus?

Petrus antwoord: “U is die Christus, die Seun van die lewende God.”

En Johannes 1 vat daardie antwoord nóg verder: “In die begin was die Woord… en die Woord was God.”

Jesus het nie by Betlehem begin nie. Voor die krip. Voor Maria. Voor die aarde. Hy was reeds daar.

Johannes sê alles het deur Hom ontstaan. En toe: “Die Woord het mens geword en onder ons kom woon.”

Die Een deur Wie alles ontstaan het… het nader gekom. God het nie op ’n afstand gebly nie.

En Jesus het nie gekom omdat jy net ’n bietjie beter raad nodig gehad het nie. Jy het ’n Redder nodig gehad. Ons almal het.

Sonde is nie iets wat ons net met beter gewoontes kon regmaak nie. Ons kon onsself nie red nie.

Daarom het Jesus gekom. Hy het gesterf. Hy het opgestaan.

En nou kom die vraag baie nader as: “Glo jy Jesus bestaan?”

Die vraag word: “As Jesus werklik Here is… wie kry die laaste sê in my lewe?”

Wanneer jy ’n groot besluit neem… wie kry die laaste sê?

Wanneer iemand jou seermaak… wie bepaal hoe jy reageer?

Wanneer geld min is… wie bepaal waar jou vertroue lê?

Wanneer Jesus se woorde bots met wat jy eintlik wil hê… wie wen?

Want jy kan sê: “Jesus is Here.” en steeds leef asof jy self op die troon sit.

En hier is ’n sin wat ek wil hê jy vandag moet onthou:

Jy kan nie die kruis vir jou skuld vat en die troon vir jouself hou nie.

Jesus het nie gesê: “Bewonder My.” Hy het gesê: “Volg My.”

En dis waar hierdie hele reis begin. Nie by probeer om vandag alles in jou lewe reg te maak nie. Nie by voorgee jy het al die antwoorde nie. By Jesus.

Lees vandag Johannes 1:1–18. En vra net: “Wat wys hierdie vir my oor Jesus?”

En vra daarna: “As Jesus werklik Here is… waar leef ek nog asof ék die laaste sê het?”

En as jy wil, bid: “Jesus, wys my Wie U werklik is. Wys my waar ek U net wil hê vir wat U vir my kan doen. Wys my waar ek nog self op die troon sit. Ek wil U leer ken, U vertrou en U volg. Amen.”

En dra vandag net hierdie vraag saam: Wie sê jý is Jesus?

Want jou antwoord word nie net in jou woorde gehoor nie. Dit word uiteindelik in jou lewe gesien.`
