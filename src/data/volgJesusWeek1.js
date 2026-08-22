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
  'Voordat ons vra hoe om Jesus te volg, moet ons eers vra Wie Hy is.\n\n' +
  'Hierdie week gaan ons na Jesus self kyk en eerlik vra:\n\n' +
  'As Jesus werklik Here is, wat beteken dit vir my lewe?'

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
 *
 * ── Die id's ──
 *
 * Elke `id` hieronder is 'n private antwoord in localStorage, onder
 * `vj_a_w1_<id>`. Verander 'n id, en elke mens wat daardie dag reeds gedoen
 * het, verloor sy woorde — hulle lê op sy eie foon en niemand kan hulle vir
 * hom terugsit nie. Hulle bly dus presies soos hulle was toe die week die
 * eerste keer gelewe het.
 */

const DAG1 = [
  {
    soort: 'lees',
    merk: 'LEES',
    skrif: 'Matteus 16:13–17',
    lyf: 'Lees dit stadig in die app se Bybel of in jou eie Bybel. Let veral op '
       + 'hoe Jesus die vraag persoonlik maak:\n\n'
       + '“Maar julle, wie sê julle is Ek?”',
  },
  {
    soort: 'stem',
    titel: 'Jesus pas nie by jou lewe aan nie. Jou lewe verander rondom Hom.',
    duur: '±5 minute',
  },
  {
    soort: 'vraag',
    id: 'getref',
    kop: 'WAT HET JOU DIE MEESTE GETREF?',
    lyf: 'Watter deel van vandag se boodskap het jou laat stilstaan of anders laat dink?',
    prompt: 'Skryf dit hier neer…',
    /* Die knoppie wat die stemboodskap deel. Dit staan NA die private antwoord,
       want 'n mens deel iets nadat dit hom getref het — nie voor hy dit gehoor
       het nie. Dit deel die WEEK se adres, nie die rou klanklêer nie; sien
       volgJesusNooi.js. */
    deelStem: true,
  },
  {
    soort: 'gebed',
    lyf: 'Jesus, wys my Wie U werklik is. Wys my waar ek U probeer laat inpas by '
       + 'wat ek self wil hê. Help my om U nie net te ken of te bewonder nie, '
       + 'maar om U werklik te vertrou en te volg. Amen.',
  },
  /* §40: die brug na die groep kom NA die stemboodskap. */
  { soort: 'groepbrug', netGroep: true },
  { soort: 'wallpaper', bronVeld: 'wallpaperDag1', kop: 'HOU DIT VOOR JOU' },
]

const DAG2 = [
  {
    soort: 'lees',
    merk: 'LEES',
    skrif: 'Johannes 1:1–18',
    lyf: 'Lees dit stadig. Moenie probeer om alles op een slag te verstaan nie. '
       + 'Let net op wat hierdie gedeelte vir jou oor Jesus wys.',
  },
  {
    soort: 'teks',
    lyf: 'Johannes begin nie by Jesus se geboorte nie. Hy neem ons terug na die '
       + 'begin.\n\n'
       + 'Jesus was reeds daar.\n\n'
       + 'Alles het deur Hom ontstaan, en tog het Hy mens geword en tussen '
       + 'gewone mense kom woon.\n\n'
       + 'Die Jesus wat ons volg, is dus nie net ’n goeie leermeester of Iemand '
       + 'na Wie ons gaan wanneer ons hulp nodig het nie.\n\n'
       + 'Hy is soveel meer.',
  },
  {
    soort: 'vraag',
    id: 'sien2',
    kop: 'WAT SIEN JY VAN JESUS?',
    lyf: 'Wat is een ding wat Johannes 1 jou vandag oor Jesus wys?',
    prompt: 'Vandag sien ek dat Jesus…',
  },
  {
    soort: 'groot',
    lyf: 'MOENIE NET VRA WAT JESUS VIR JOU KAN DOEN NIE.\nKYK EERS WIE HY IS.',
  },
  {
    soort: 'gebed',
    lyf: 'Jesus, help my om U te sien soos U werklik is. Maak my hart en my '
       + 'gedagtes oop vir wat U Woord oor U wys. Ek wil U beter leer ken. Amen.',
  },
]

const DAG3 = [
  {
    soort: 'lees',
    merk: 'LEES',
    skrif: 'Lukas 6:46–49',
    lyf: 'Lees dit stadig en let op die verskil tussen iemand wat Jesus se '
       + 'woorde hoor en iemand wat dit ook doen.',
  },
  {
    soort: 'teks',
    lyf: 'Dit is maklik om te sê:\n\n'
       + '“Jesus is Here.”\n\n'
       + 'Maar die moeiliker vraag is wat gebeur wanneer Sy woorde bots met wat '
       + 'ons self wil hê.\n\n'
       + 'Om Jesus te volg raak ons gewone lewe.\n\n'
       + 'Ons geld.\nOns verhoudings.\nOns besluite.\nOns vrese.\n'
       + 'En die dinge wat ons doen wanneer niemand kyk nie.',
  },
  {
    soort: 'kies',
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
      kop: 'AS JESUS WERKLIK HERE IS…',
      lyf: 'Wat sou dit beteken om Hom juis in hierdie deel van jou lewe te '
         + 'vertrou en te volg?',
      prompt: 'Skryf dit hier neer…',
    },
  },
  {
    soort: 'groot',
    lyf: '“HERE” BETEKEN:\nJESUS KRY DIE LAASTE SÊ.',
  },
  {
    soort: 'gebed',
    lyf: 'Jesus, U weet waar ek die meeste sukkel om U te vertrou. Help my om U '
       + 'nie net met my mond Here te noem nie, maar om U ook in hierdie deel '
       + 'van my lewe te volg. Wys my wat my volgende tree van vertroue en '
       + 'gehoorsaamheid is. Amen.',
  },
]

const DAG4 = [
  {
    soort: 'lees',
    merk: 'LEES',
    skrif: 'Lukas 9:23–25',
    lyf: 'Lees dit stadig en let op wat Jesus sê van iemand wat Hom wil volg.',
  },
  {
    soort: 'teks',
    lyf: 'Dit is maklik om Jesus te volg wanneer Sy woorde ons troos, hoop gee '
       + 'en moed gee.\n\n'
       + 'Maar Jesus doen meer as dit.\n\n'
       + 'Hy lei ons.\n'
       + 'Hy wys vir ons waar ons verkeerd loop.\n'
       + 'Hy wys vir ons wat in ons lewe moet verander.\n'
       + 'En soms vra gehoorsaamheid dat ons iets moet doen wat nie maklik is nie.\n\n'
       + 'Daarom moet ons eerlik vra:\n\n'
       + 'Volg ek Jesus soos Hy werklik is — of net wanneer dit wat Hy sê, by my '
       + 'eie wil pas?',
  },
  {
    soort: 'groot',
    lyf: '’N JESUS WAT JY SELF KAN VORM,\nKAN JOU NOOIT VORM NIE.',
  },
  {
    soort: 'kies',
    id: 'moeilikste',
    kop: 'WAAR SUKKEL JY DIE MEESTE?',
    opsies: [
      { waarde: 'lei',       woorde: 'Wanneer Jesus my lei in ’n rigting wat ek nie self sou kies nie' },
      { waarde: 'korrigeer', woorde: 'Wanneer Sy Woord vir my wys dat iets in my lewe moet verander' },
      { waarde: 'verander',  woorde: 'Wanneer dit moeilik is om Jesus te gehoorsaam' },
      { waarde: 'anders',    woorde: 'Iets anders' },
    ],
    vraag: {
      id: 'waarom4',
      kop: 'DINK EERLIK HIEROOR',
      lyf: 'Is daar iets in jou lewe waarvan jy reeds weet Jesus wil hê jy moet '
         + 'dit anders doen, maar waarmee jy nog sukkel?',
      prompt: 'Skryf dit hier neer…',
    },
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
  {
    soort: 'lees',
    merk: 'LEES',
    skrif: 'Matteus 16:15–17',
    lyf: 'Lees weer die vraag waarmee Jesus hierdie week begin het:\n\n'
       + '“Maar julle, wie sê julle is Ek?”',
  },
  /* Die ding wat 'n boek of 'n preek nie kan doen nie: die app gee 'n mens sy
     eie woorde terug. Is daar niks gestoor nie, verdwyn hierdie blok — nooit
     `undefined`, nooit 'n leë aanhaling. */
  { soort: 'terugblik', bronId: 'getref', kop: 'OP DAG 1 HET JY GESKRYF:' },
  {
    soort: 'vraag',
    id: 'glo5',
    kop: 'KYK NOU WEER',
    lyf: 'Vier dae later kom dieselfde vraag weer na jou toe:\n\n'
       + 'Wie sê jý is Jesus — en wat beteken dit vir hoe jy Hom van hier af '
       + 'wil volg?',
    prompt: 'Skryf dit hier neer…',
  },
  {
    soort: 'gebed',
    lyf: 'Jesus, dankie dat ek hierdie week weer na U kon kyk. Help my om U nie '
       + 'net beter te ken nie, maar om U ook meer te vertrou en te volg. Wys my '
       + 'waar ek nog self die laaste sê wil hê. Ek gee daardie deel van my lewe '
       + 'aan U. Amen.',
  },
  /* Die WEEK se wallpaper, aan die einde van Dag 5. Elke wallpaper staan op
     die DAG waar hy hoort: Dag 1 s'n op Dag 1, die week s'n op Dag 5. */
  { soort: 'wallpaper', bronVeld: 'wallpaper', kop: 'HOU DIT VOOR JOU' },
]

export const WEEK1_DAE = [
  {
    n: 1, titel: 'Wie sê jý is Jesus?', merk: 'DIE VRAAG',
    knop: 'KLAAR VIR VANDAG',
    klaarKop: 'DAG 1 KLAAR.',
    klaarLyf: 'Hou vandag hierdie vraag by jou: Wie sê jý is Jesus?',
    blokke: DAG1,
  },
  {
    n: 2, titel: 'Kyk self na Jesus', merk: 'KYK SELF',
    knop: 'KLAAR VIR VANDAG',
    klaarKop: 'DAG 2 KLAAR.',
    klaarLyf: 'Vandag het jy nie net oor Jesus gehoor nie. Jy het self gaan kyk.',
    blokke: DAG2,
  },
  {
    n: 3, titel: 'Waar raak dit jou lewe?', merk: 'MY WERKLIKE LEWE',
    knop: 'KLAAR VIR VANDAG',
    klaarKop: 'DAG 3 KLAAR.',
    klaarLyf: 'Jesus wil nie net deel van jou geloof wees nie. Hy wil Here oor '
            + 'jou hele lewe wees.',
    blokke: DAG3,
  },
  {
    n: 4, titel: 'Volg ek Jesus soos Hy werklik is?', merk: 'DIE SNY',
    knop: 'EK WIL HOM VOLG',
    klaarKop: 'DAG 4 KLAAR.',
    klaarLyf: 'Moenie Jesus probeer verander om by jou lewe te pas nie. Laat Hom '
            + 'jou verander.',
    blokke: DAG4,
  },
  {
    n: 5, titel: 'Wie sê jý nou is Jesus?', merk: 'KYK TERUG',
    knop: 'VOLTOOI WEEK 1',
    klaarKop: 'WEEK 1 KLAAR.',
    klaarLyf: 'Jou lewe wys wie jy glo Jesus is.',
    blokke: DAG5,
  },
]

/* Wat aan die einde van die week teruggewys word. Net wat werklik geskryf is;
   'n leë een word oorgeslaan. */
export const WEEK1_REIS = [
  { id: 'getref', kop: 'Jy het op Dag 1 geskryf:' },
  { id: 'volg3',  kop: 'Waar jy Hom wil vertrou:' },
  { id: 'glo5',   kop: 'En vandag het jy geskryf:' },
]

/* Die deelbare kaart aan die einde. Die kernlyn van die week. */
export const WEEK1_DEELSIN =
  'Jy kan Jesus met jou mond Here noem, maar jou lewe wys uiteindelik wie die '
  + 'laaste sê kry.'

/* Wat volgende week wag. Dit staan hier sodat die einde van Week 1 'n rede gee
   om terug te kom, sonder dat iemand dit moet onthou om by te werk. */
export const WEEK1_VOLGENDE = {
  nommer: 2,
  titel: 'Wanneer versoeking kom',
  lyf: 'Volgende week kyk ons na Jesus in die woestyn. Ons gaan leer hoe om '
     + 'versoeking vroeër raak te sien, die leuen te herken, die uitweg te kies '
     + 'en vas te staan in wat God gesê het.',
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
 * wie liewer lees of iets wil teruglees.
 *
 * Die sinne wat moet bly brand nadat die klank klaar is:
 *
 *     Jesus pas nie by jou lewe aan nie. Jou lewe verander rondom Hom.
 *     “Here” beteken: Jesus kry die laaste sê.
 *
 * Die eerste een is ook Dag 1 se stemblok se titel. Hulle moet dieselfde bly:
 * die sin wat 'n mens hoor, is die sin wat op die skerm staan.
 */
export const WEEK1_TRANSKRIPSIE = `Ek moet vandag iets eerlik sê.

Ek het vir meer as ’n week met God oor hierdie reeks geworstel, want ek wou dit nie doen nie.

Dis makliker om oor bekommernis, seer en moeilike tye te praat.

Maar hierdie reeks gaan anders wees.

Ons gaan vra: wat beteken dit regtig om Jesus te volg?

En voordat ons enigiets anders kan doen, moet ons begin by die vraag wat Jesus self in Matteus 16 vra:

“Maar julle,” het Hy gevra, “wie, sê julle, is Ek?”

Nie: wat sê jou kerk nie.

Nie: wat sê jou ouers nie.

Nie: wat sê ander mense nie.

Wie sê jý is Ek?

Want jy kan jou hele lewe sê: “Ek glo in Jesus.” En steeds eintlik net jouself volg.

Ons kan maklik vir onsself ’n Jesus in ons gedagtes skep wat ons troos wanneer ons seerkry, maar ons nooit mag teregwys nie.

’n Jesus wat ons moet help met ons planne, maar nooit ons planne mag verander nie.

Maar luister mooi:

Jesus pas nie by jou lewe aan nie. Jou lewe verander rondom Hom.

As Jesus regtig Here is, kan Hy nie net ’n deel van jou lewe wees nie.

Daarom wil ek jou vandag vra: wat jaag jy harder as wat jy Jesus jaag?

Die verhouding? Die geld? Mense se goedkeuring? Wat mense van jou sê, wat mense van jou dink?

Jy moet God harder jaag as die dinge wat jy dink jy nodig het.

Want as Jesus al is wat jy het, het jy steeds alles wat jy nodig het.

Jesus vra in Lukas 6: “Watter sin het dit dat julle My aanspreek met ‘Here, Here!’ en nie doen wat Ek sê nie?”

Daardie vraag maak my ongemaklik.

Want “Here” beteken nie: “Jesus, gee asseblief vir my U opinie” nie.

Dit beteken: “Jesus, U kry die laaste sê.”

Wanneer Hy sê vergewe — U kry die laaste sê.

Wanneer Hy sê los dit — U kry die laaste sê.

Wanneer Hy sê vertrou My — U kry die laaste sê.

Jy ontdek nie wie jou Here is wanneer gehoorsaamheid maklik is nie. Jy ontdek dit wanneer gehoorsaamheid jou iets kos.

Maar dit gaan nie net oor sonde nie.

Jesus sê ons moenie oor môre bekommerd wees nie, en Filippense 4 sê ons moet oor alles bid.

Bekommernis is ’n gesprek wat jy met jouself voer oor dinge wat jy nie kan beheer nie. Gebed is ’n gesprek met God oor dit wat Hy kan beheer.

Alles wat buite jou beheer is, is steeds binne God se beheer.

Jesus sê in Lukas 9 dat iemand wat Hom wil volg, homself moet verloën, elke dag sy kruis moet opneem en Hom moet volg.

’n Kruis was nie ’n versiering nie. Dit was ’n plek waar iets sterf.

Ja, sonde moet sterf.

Maar ook my trots. My eie wil. My behoefte aan beheer en mense se goedkeuring.

God se goedkeuring is meer werd as die hele wêreld se applous.

Jesus het jou nie geroep om half-in en half-uit met Hom te leef nie.

Hy roep jou om jou hele lewe neer te lê.

En genade beteken nie Jesus vergewe jou sodat jy dieselfde kan bly nie.

Sy genade vergewe jou én verander jou.

Daarom: hou op om alles self vas te hou en laat God jou vashou.

Jy hoef nie altyd sterk te wees vir almal nie. Laat God sterk wees vir jou.

Dít is wat VOLG JESUS gaan wees: 52 weke waarin ons leer om Hom met ons hele lewe te volg.

Kom ons bid.

Here Jesus, help hierdie persoon om U harder te jaag as die dinge wat hulle dink hulle nodig het.

Help hulle om op te hou om alles self vas te hou en U toe te laat om hulle vas te hou.

Wys hulle waar hulle nog self die laaste sê wil hê.

Laat U stem harder wees as mense se opinies.

Gee hulle moed om hulle planne, bekommernisse en hele lewe vir U te gee.

Dankie vir genade wat vergewe én verander.

Help hulle om U nie net te ken nie, maar U regtig te volg.

Amen.`

/* ── Die groepsessie ──
 *
 * Dieselfde vrae wat die groepchat se onderwerp-kaart gebruik — sien
 * vjChatOnderwerp.js. Daar is dus niks aparts om te skryf nie. */
export const WEEK1_SESSIE = {
  titel: 'Kyk saam na Jesus',
  skrifte: ['Matteus 16:13–17', 'Lukas 6:46–49'],
  vrae: [
    'Wat het jou hierdie week die meeste van Jesus laat raaksien?',
    'Waarom dink julle maak Jesus die vraag so persoonlik: “Wie sê júlle is Ek?”',
    'In watter dele van ons lewe is dit maklik om Jesus se hulp te wil hê, maar moeiliker om Hom die laaste sê te gee?',
    'Wat is een praktiese manier waarop ons hierdie week kan wys dat ons Jesus werklik wil volg?',
  ],
  gebed:
    'Jesus, help ons om U te sien soos U werklik is. Wys ons waar ons U probeer '
    + 'laat inpas by ons eie planne, begeertes en voorkeure. Gee ons die '
    + 'nederigheid om te luister wanneer U lei en die moed om U te gehoorsaam '
    + 'wanneer dit moeilik is. Help ons om U nie net te ken nie, maar om U met '
    + 'ons hele lewe te volg. Amen.',
}
