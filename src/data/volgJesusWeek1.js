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
  { soort: 'stem', titel: 'Wie sê jý is Jesus?', duur: '±5 minute' },
  {
    soort: 'vraag',
    kop: 'WAT HET JOU GETREF?',
    id: 'getref',
    prompt: 'Skryf een ding neer…',
    deelStem: true,
  },
  /* ── Die brug na die groep (§40) ──
   *
   * Dit staan NA die stemboodskap en NA die private antwoord, want 'n mens
   * deel iets nadat dit hom getref het — nie voor hy dit gehoor het nie.
   *
   * 'n Solo-mens sien hierdie blok nooit. Dit is die enigste plek in die week
   * waar 'n groep 'n groot uitnodiging kry; die res van die dae het net die
   * permanente knoppie, want vyf "praat nou met jou groep"-skerms is
   * gemeganiseerde gemeenskap (§41). */
  /* Die dag se wallpaper. Dit sluit Dag 1 af — die dag waarop die
     stemboodskap land — en die sin op die prent IS die boodskap se punt.

     Dit het in die herbou verlore geraak: die wallpapers het net op die
     weekklaar-skerm oorgebly, en dan sien 'n mens die prent wat hy pas
     opgelaai het eers ná Dag 5. Is daar nog geen prent nie, verdwyn hierdie
     blok stil. */
  { soort: 'wallpaper', bronVeld: 'wallpaperDag1', kop: 'HOU DIT VOOR JOU' },
  /* §40: die brug na die groep kom NA die stemboodskap. */
  { soort: 'groepbrug', netGroep: true },
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
    soort: 'teks',
    kop: 'DINK EERLIK HIERAAN',
    lyf: 'Dit is maklik om te sê:\n\n'
       + '“Jesus is Here.”\n\n'
       + 'Maar daardie waarheid raak ons lewe juis op die plekke waar dit '
       + 'moeilik is om Hom te vertrou of te gehoorsaam.\n\n'
       + 'Miskien is daar vandag een area waar jy nog alles self probeer beheer.',
  },
  {
    soort: 'kies',
    /* Die id bly `area`. Verander dit, en elke mens wat hierdie dag reeds
       gedoen het, verloor sy antwoord — dit lê onder `vj_a_w1_area` op sy
       eie foon en niemand kan dit vir hom terugsit nie. */
    id: 'area',
    kop: 'WAAR IS DIT VIR JOU DIE MOEILIKSTE OM JESUS TE VERTROU OF TE VOLG?',
    opsies: [
      { waarde: 'vrees',   woorde: 'Vrees' },
      { waarde: 'geld',    woorde: 'Geld' },
      { waarde: 'seer',    woorde: 'Iemand het my seergemaak' },
      { waarde: 'besluit', woorde: 'Ek moet ’n belangrike besluit neem' },
      { waarde: 'privaat', woorde: 'My private lewe' },
      { waarde: 'anders',  woorde: 'Iets anders' },
    ],
    /* EEN opvolgvraag, en dieselfde een vir elke keuse. Vyf verskillende
       vraagpare was vyf keer soveel skerm vir dieselfde ding. */
    vraag: {
      id: 'volg3',
      kop: 'WAT SOU DIT BETEKEN OM JESUS JUIS HIER TE VOLG?',
      lyf: 'Dink aan die area wat jy gekies het.\n\n'
         + 'Vra jouself:\n\n'
         + 'As Jesus werklik Here is, wat sou dit vandag beteken om Hom juis '
         + 'hiermee te vertrou en te gehoorsaam?',
      prompt: 'Skryf dit hier neer…',
    },
  },
  {
    soort: 'gebed',
    lyf: 'Jesus, U weet presies waar ek sukkel om U te vertrou. Help my om nie '
       + 'net met my mond te sê dat U Here is nie, maar om U ook in hierdie deel '
       + 'van my lewe te volg. Wys my wat my volgende tree van vertroue en '
       + 'gehoorsaamheid is. Amen.',
  },
]

const DAG4 = [
  {
    soort: 'teks',
    lyf: 'Dit is maklik om Jesus te volg wanneer Sy woorde ons troos, hoop gee '
       + 'en moed gee.\n\n'
       + 'Maar Jesus doen meer as dit.\n\n'
       + 'Hy lei ons.\n'
       + 'Hy wys vir ons waar ons verkeerd loop.\n'
       + 'Hy wys vir ons wat in ons lewe moet verander.\n'
       + 'En soms vra gehoorsaamheid dat ons iets moet doen wat nie maklik is nie.\n\n'
       + 'Daarom moet ons onsself eerlik vra:\n\n'
       + 'Volg ek Jesus soos Hy werklik is — of net wanneer dit wat Hy sê, by my '
       + 'eie wil pas?\n\n'
       + 'As ek net die dele van Jesus aanvaar waarvan ek hou, volg ek '
       + 'uiteindelik ’n Jesus wat ek self gevorm het.',
  },
  { soort: 'groot', lyf: '’N JESUS WAT JY SELF KAN VORM,\nKAN JOU NOOIT VORM NIE.' },
  {
    soort: 'kies',
    id: 'moeilikste',
    kop: 'WAAR SUKKEL JY DIE MEESTE?',
    opsies: [
      { waarde: 'lei',       woorde: 'Wanneer Jesus my lei in ’n rigting wat ek nie self sou kies nie' },
      { waarde: 'korrigeer', woorde: 'Wanneer Sy Woord vir my wys dat iets in my lewe moet verander' },
      { waarde: 'verander',  woorde: 'Wanneer gehoorsaamheid aan Jesus vir my moeilik is' },
      { waarde: 'anders',    woorde: 'Iets anders' },
    ],
  },
  {
    soort: 'vraag',
    id: 'waarom4',
    kop: 'DINK EERLIK HIEROOR',
    lyf: 'Is daar iets in jou lewe waarvan jy reeds weet Jesus wil hê jy moet '
       + 'dit anders doen, maar waarmee jy steeds sukkel?',
    prompt: 'Skryf dit hier neer…',
  },
  {
    soort: 'gebed',
    lyf: 'Jesus, help my om U te volg soos U werklik is, ook wanneer dit wat U '
       + 'vra nie maklik is nie. Wys my waar ek moet verander en gee my die '
       + 'nederigheid en moed om U te gehoorsaam. Amen.',
  },
  /* Die tweede brug na die groep, laat in die week. */
  { soort: 'groepbrug', netGroep: true },
]

const DAG5 = [
  /* Die ding wat 'n boek of 'n preek nie kan doen nie: die app gee 'n mens sy
     eie woorde terug. Is daar niks gestoor nie, verdwyn hierdie blok — nooit
     `undefined`, nooit 'n leë aanhaling. */
  { soort: 'terugblik', bronId: 'getref', kop: 'OP DAG 1 HET JY GESKRYF:' },
  { soort: 'vraag', id: 'glo5', kop: 'WIE SÊ JÝ VANDAG IS JESUS?', prompt: 'Skryf dit in jou eie woorde…' },
  { soort: 'vraag', id: 'area5', kop: 'WAT IS EEN AREA WAARIN JY HOM NOU MEER WIL VOLG?', prompt: 'Een area…' },
  {
    soort: 'gebed',
    kop: 'BID',
    lyf: 'Jesus, ek wil U nie net ken uit wat ander mense oor U sê nie. Ek wil U self beter leer ken.\n\n' +
         'Waar ek U te klein gemaak het, korrigeer my. Waar ek self die laaste sê wil hê, leer my om U te vertrou.\n\n' +
         'Ek wil U ken. Ek wil U volg. Amen.',
  },
  /* Die WEEK se wallpaper, aan die einde van Dag 5.
     Dit het net op die weekklaar-skerm gestaan — die blad ná die knoppie —
     en dus het 'n mens dit op Dag 5 self nooit gesien nie. Elke wallpaper
     staan nou op die DAG waar hy hoort: Dag 1 s'n op Dag 1, die week s'n op
     Dag 5. Nie een word herhaal nie. */
  { soort: 'wallpaper', bronVeld: 'wallpaper', kop: 'HOU DIT VOOR JOU' },
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
    n: 3, titel: 'Waar raak dit jou lewe?', merk: 'MY WERKLIKE LEWE',
    knop: 'KLAAR VIR VANDAG',
    klaarKop: 'DAG 3 KLAAR.',
    blokke: DAG3,
  },
  {
    n: 4, titel: 'Volg ek Jesus soos Hy werklik is?', merk: 'DIE SNY',
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
/* ── Die stemboodskap se transkripsie ──
 *
 * By verstek TOEGEVOU. 'n Mens moet die boodskap hoor; die teks is daar vir
 * wie liewer lees of iets wil teruglees.
 *
 * Dewald oor hierdie weergawe: "Hierdie is die een. Ek sou hom nie langer maak
 * nie ... Jesus moet die enigste groot Naam wees wat die luisteraar onthou."
 * Daar word dus GEEN ander prediker in genoem nie, en die opname bly onder vyf
 * minute.
 *
 * Die twee sinne wat moet bly brand nadat die klank klaar is:
 *
 *     Wil ek Jesus hê — of net wat ek hoop Hy vir my sal doen?
 *     Jy kan nie die kruis vir jou skuld vat en die troon vir jouself hou nie.
 *
 * Die tweede een is ook die week se deelbare kaart (WEEK1_DEELSIN). Hulle moet
 * dieselfde bly: die sin wat 'n mens hoor, is die sin wat hy kan aanstuur.
 */
export const WEEK1_TRANSKRIPSIE = `As Jesus vandag niks vir jou regmaak nie — die geld bly min, die antwoord waarvoor jy bid kom nie, die storm bedaar nie — sal jy Hom steeds wil hê?

Nie net Sy hulp nie. Nie net Sy gawes nie. Hom.

Want dalk is die moeiliker vraag nie “Glo ek in Jesus?” nie. Dalk is dit: “Wil ek Jesus hê vir Wie Hy is… of net vir wat ek hoop Hy vir my sal doen?”

Want ons kan maklik vir onsself ’n Jesus vorm wat baie gemaklik by ons lewe inpas.

’n Jesus wat my troos… maar my nooit uitdaag nie. Wat my vergewe… maar nooit aan my keuses raak nie. Wat my help wanneer ek in die moeilikheid is… maar nooit Here oor my lewe mag wees nie.

Dis ’n veilige Jesus.

Maar ’n Jesus wat jy self kan vorm, kan jou nooit vorm nie.

In Matteus 16 vra Jesus vir Sy dissipels: “Wie sê die mense is die Seun van die mens?”

En almal het ’n antwoord. Johannes die Doper. Elia. Jeremia.

Met ander woorde: almal het ’n opinie oor Jesus.

Toe verander Hy die vraag.

“Maar julle, wie sê julle is Ek?”

Nie: wat sê jou kerk? Wat glo jou ouers? Wat het jy grootgeword om te glo?

Jý. Wie sê jý is Jesus?

Petrus antwoord: “U is die Christus, die Seun van die lewende God.”

En Johannes 1 maak daardie antwoord nog groter.

“In die begin was die Woord… en die Woord was God.”

Voor Betlehem. Voor die krip. Voor die aarde. Jesus was reeds daar.

Alles het deur Hom ontstaan.

En toe gebeur die ondenkbare: “Die Woord het mens geword en onder ons kom woon.”

God het nader gekom. Die Een deur Wie alles ontstaan het… het ons wêreld binnegestap.

En Hy het nie gekom omdat jy net beter raad nodig gehad het nie.

Jy het ’n Redder nodig gehad. Ek ook.

Ons sonde was nie iets wat ons met ’n paar beter gewoontes kon regmaak nie. Ons kon onsself nie red nie.

Daarom het Jesus gekom.

Hy het nie net vir jou gesterf nie. Hy het in jou plek gesterf.

Jou hoop rus nie op hoe goed jy dit regkry om vir God te leef nie. Jou hoop rus op wat Jesus vir jou gedoen het.

Maar Hy het nie in die graf gebly nie. Jesus het opgestaan. Die graf is leeg. Jesus leef.

En as Jesus leef… as Hy werklik die Christus is… as Hy werklik Here is… dan kan Hy nie net nog ’n deel van jou lewe wees nie.

En dis waar hierdie boodskap baie persoonlik raak.

Want jy kan met jou mond sê: “Jesus is Here.”

Maar wie kry die laaste sê?

Wanneer Jesus se woorde bots met wat jy wil hê — wie wen?

Wanneer jy moet besluit hoe jy iemand gaan behandel — wie regeer?

Wanneer niemand kyk nie — wie sit op die troon?

Want as Jesus net Here is wanneer jy met Hom saamstem… dan sit jy nog steeds self op die troon.

En ek dink hierdie is een van die belangrikste sinne wat ek vir jou vandag kan sê:

Jy kan nie die kruis vir jou skuld vat en die troon vir jouself hou nie.

Jesus het nie gesê: “Bewonder My.” Hy het gesê: “Volg My.”

En dít is waar hierdie reis begin.

Nie by probeer om vandag alles reg te kry nie. Nie by maak asof jy al die antwoorde het nie. Nie by nóg ’n godsdienstige lysie nie.

By Jesus.

Lees vandag Johannes 1:1–18. Lees dit stadig.

En vra nie eerste “Wat beteken dit vir my?” nie. Vra: “Wat wys hierdie vir my oor Jesus?”

En daarna: “As Jesus werklik Here is… waar leef ek nog asof ék die laaste sê het?”

En as hierdie werklik jou gebed is, bid saam met my:

“Jesus, ek het U nodig. Ek kan myself nie red nie. Dankie vir die kruis. Dankie dat U opgestaan het. Wys my Wie U werklik is. Wys my waar ek nog self op die troon sit. Ek wil U nie net hê vir wat U vir my kan doen nie. Ek wil U ken, U vertrou en U volg. Amen.”

En vandag wil ek jou met dieselfde vraag los waarmee Jesus Sy dissipels gekonfronteer het:

“Maar jý… wie sê jý is Ek?”

Want uiteindelik antwoord jy daardie vraag nie net met jou mond nie.

Jou lewe wys wie jy glo Jesus is.`

/* ── Die groepsessie ──
 *
 * Dit het op die SKERM hardgekodeer gestaan, en toe Week 2 lewendig gaan, het
 * die groep steeds Week 1 se Skrif en Week 1 se vrae gesien. Dewald: "die groep
 * sessie is week 1 sin." Nou woon dit by die week self.
 *
 * Dit staan hier en nie in die admin nie om dieselfde rede as die dae: dit is
 * inhoud. Die openbare eindpunt dra dit ook nie — dit is 'n witlys, en 'n week
 * wat nog geskryf word, moet nie sy vrae lek nie. */
export const WEEK1_SESSIE = {
  titel: 'Kyk saam na Jesus',
  skrifte: ['Matteus 16:13\u201317', 'Johannes 1:1\u201318'],
  vrae: [
    'Wat het jou hierdie week die meeste van Jesus getref?',
    'Waarom dink jy maak Jesus die vraag persoonlik: \u201cWie s\u00ea j\u00falle is Ek?\u201d',
    'Waar vorm ons maklik \u2019n Jesus wat by ons eie voorkeure pas?',
    'Wat beteken dit prakties om Jesus nie net as Helper te wil h\u00ea nie, maar Hom as Here te volg?',
  ],
  gebed:
    'Here Jesus, help ons om U te sien soos U werklik is. Waar ons U kleiner '
    + 'gemaak het, korrigeer ons. Waar ons nog self die laaste s\u00ea wil h\u00ea, leer '
    + 'ons om U te vertrou. Leer ons om U saam te volg. Amen.',
}
