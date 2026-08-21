/* ── VOLG JESUS · Week 2 · Wanneer versoeking kom ──
 *
 * Dieselfde vorm as Week 1: EEN BLAD PER DAG, 'n paar blokke, een knoppie
 * onderaan. Dewald se reel bly staan: VOLG JESUS MAG NOOIT SOOS HUISWERK VOEL
 * NIE.
 *
 * Die perke word deur volgJesusWeek2.toets.mjs afgedwing, en hulle is dieselfde
 * as Week 1 s'n: hoogstens vyf blokke per dag, hoogstens twee private antwoorde
 * per dag, geen teksblok van meer as drie paragrawe, en geen Skrifgedeelte twee
 * dae na mekaar.
 *
 * ── Twee plekke waar ek van Dewald se uitleg afgewyk het ──
 *
 * Sy Dag 1 was LEES · STEM · GROOT · VRAAG · GEBED — presies vyf. Die
 * wallpaper en die groepbrug moes dus erens anders land, anders is Dag 1 sewe
 * blokke lank en dit is die dag waarop die stemboodskap al die swaarste werk
 * doen. Wallpaper 1 sluit nou DAG 2 af; die groepbrug staan op Dag 4.
 *
 * Sy Dag 5 was LEES · TEKS · TERUGBLIK · VRAAG · GEBED, plus die week se
 * wallpaper — ses. Die LEES is die een wat weg is, want daardie teksblok haal
 * Jakobus 4:7–8 woordeliks aan en die verwysing staan daar. Niks gaan verlore
 * nie; die mens lees dieselfde woorde.
 */

/* ── Die openingsblad ── */
export const WEEK2_OPENING =
  'Jesus is versoek — maar Hy het nie toegegee nie.\n\n'
  + 'Hierdie week kyk ons hoe versoeking werk, waar dit ons probeer vasvang en '
  + 'hoe Jesus daarop reageer.\n\n'
  + 'Die doel is nie om nooit weer versoek te word nie, maar om te leer hoe om '
  + 'gehoorsaam te bly wanneer versoeking kom.'

const DAG1 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Matteus 4:1–11',
    lyf: 'Lees die hele gedeelte stadig. Let op wat die versoeker sê — en hoe Jesus elke keer antwoord.',
  },
  {
    soort: 'stem',
    titel: 'Nie elke stem wat met jou praat, verdien dat jy hom glo nie.',
    duur: '±5 minute',
  },
  {
    soort: 'groot',
    lyf: 'ONS TOETS NIE GOD SE WOORD AAN ’N STEM NIE.\nONS TOETS DIE STEM AAN GOD SE WOORD.',
  },
  {
    soort: 'vraag',
    kop: 'WAT SÊ DIE STEM?',
    id: 'stem1',
    lyf: 'Wanneer jy versoek word, watter sin gebruik jy gewoonlik om die '
       + 'verkeerde keuse vir jouself reg te praat?\n\n'
       + '“Net hierdie een keer.”\n'
       + '“Niemand sal weet nie.”\n'
       + '“Ek verdien dit.”\n'
       + '“Dit is seker nie so erg nie.”',
    prompt: 'Skryf joune eerlik neer…',
    deelStem: true,
  },
  {
    soort: 'gebed',
    lyf: 'Here Jesus, leer my om versoeking raak te sien voordat ek daarmee '
       + 'saamstem. Wanneer ’n leuen praat, herinner my aan U waarheid. Gee my '
       + 'onderskeiding om te herken wat my van gehoorsaamheid probeer wegtrek. Amen.',
  },
]

const DAG2 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Jakobus 1:13–16',
    lyf: 'Lees stadig en let op hoe Jakobus verduidelik dat versoeking dikwels '
       + 'by ons eie begeertes aanknoop en ons probeer wegtrek van wat reg is.',
  },
  {
    soort: 'teks',
    kop: '’N STERK BEHOEFTE MAAK ’N VERKEERDE KEUSE NIE REG NIE',
    lyf: 'Versoeking tref ons nie almal op dieselfde plek nie.\n\n'
       + 'Vir die een kom dit wanneer hy eensaam voel. Vir iemand anders wanneer '
       + 'hy kwaad, moeg, bang, verwerp of onder groot druk is.\n\n'
       + 'Daarom is dit belangrik om jou eie swak plekke te ken.\n\n'
       + 'Jesus was honger toe die duiwel Hom versoek het om klippe in brood te '
       + 'verander. Sy honger was werklik, maar dit het ’n verkeerde keuse nie '
       + 'reg gemaak nie.\n\n'
       + 'Dieselfde geld vir ons.\n\n'
       + 'Jy kan werklik eensaam wees, maar dit beteken nie enige verhouding is '
       + 'reg nie.\n\n'
       + 'Jy kan werklik geld nodig hê, maar dit beteken nie enige manier om dit '
       + 'te kry, is reg nie.\n\n'
       + 'Jy kan werklik seergekry het, maar dit maak wraak nie reg nie.\n\n'
       + 'Wanneer jy weet wanneer jy die kwesbaarste is, kan jy versoeking vroeër '
       + 'raaksien voordat dit jou wegtrek.',
  },
  {
    soort: 'kies',
    kop: 'WANNEER IS JY DIE KWESBAARSTE?',
    id: 'kwesbaar2',
    opsies: [
      { waarde: 'eensaam',  woorde: 'Wanneer ek eensaam voel' },
      { waarde: 'kwaad',    woorde: 'Wanneer ek kwaad of seergemaak is' },
      { waarde: 'moeg',     woorde: 'Wanneer ek moeg of onder groot druk is' },
      { waarde: 'bang',     woorde: 'Wanneer ek bang is' },
      { waarde: 'verwerp',  woorde: 'Wanneer ek verwerp voel' },
      { waarde: 'geld',     woorde: 'Wanneer ek geld of sekuriteit nodig het' },
    ],
  },
  {
    soort: 'gebed',
    lyf: 'Vader, wys my waar ek die maklikste versoek word. Help my om eerlik te '
       + 'wees oor my swak plekke en dit nie weg te steek of te verskoon nie. '
       + 'Gee my wysheid om versoeking vroeg raak te sien en krag om te kies wat '
       + 'reg is, selfs wanneer die behoefte sterk voel. Amen.',
  },
  { soort: 'wallpaper', bronVeld: 'wallpaperDag1', kop: 'HOU DIT VOOR JOU' },
]

const DAG3 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Psalm 119:9–11',
    lyf: 'Lees stadig en let op hoe die psalmdigter God se Woord in sy hart '
       + 'bewaar, sodat dit sy lewe kan rig.',
  },
  {
    soort: 'teks',
    kop: 'MOENIE WAG TOTDAT VERSOEKING KOM OM TE BESLUIT WAT REG IS NIE',
    lyf: 'Toe Jesus in die woestyn versoek is, het Hy telkens geantwoord:\n\n'
       + '“Daar staan geskrywe…”\n\n'
       + 'Jesus het geweet wat God gesê het, en Hy het daarby gebly.\n\n'
       + 'Dit leer ons iets belangriks:\n\n'
       + 'Moenie eers in die middel van versoeking probeer besluit wat reg en '
       + 'verkeerd is nie.\n\n'
       + 'As jy weet waar jy maklik struikel, vra vooraf: wat sê God se Woord '
       + 'hieroor?\n\n'
       + 'Wanneer jy eensaam, kwaad, bang of onder groot druk is, kan dit '
       + 'moeiliker wees om helder te dink. Daarom is dit belangrik om God se '
       + 'waarheid reeds te ken voordat daardie oomblik kom.\n\n'
       + 'As jy byvoorbeeld weet dat jy maklik teruggaan na iets wat jou van God '
       + 'af wegtrek, besluit vooraf:\n\n'
       + '“Wanneer hierdie versoeking weer kom, gaan ek nie my gevoelens laat '
       + 'bepaal wat reg is nie. Ek gaan kies wat God sê.”',
  },
  {
    soort: 'vraag',
    kop: 'WAT MOET JY ONTHOU WANNEER VERSOEKING WEER KOM?',
    id: 'waarheid3',
    lyf: 'Watter waarheid uit God se Woord moet reeds in jou hart wees wanneer '
       + 'jy weer versoek word?',
    prompt: 'Skryf dit hier neer…',
  },
  {
    soort: 'groot',
    lyf: 'MOENIE WAG TOTDAT DIE LEUEN PRAAT\nOM TE BESLUIT WAT WAAR IS NIE.',
  },
  {
    soort: 'gebed',
    lyf: 'Here, help my om U Woord te ken en in my hart te bewaar. Wanneer '
       + 'versoeking of druk kom, help my om nie deur my gevoelens of begeertes '
       + 'gelei te word nie, maar deur wat U reeds gesê het. Gee my die krag om '
       + 'vooraf te besluit dat ek U wil gehoorsaam. Amen.',
  },
]

const DAG4 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: '1 Korintiërs 10:12–13',
    lyf: 'Lees stadig en let op wat Paulus sê: wanneer versoeking kom, gee God '
       + 'ook ’n uitweg sodat jy kan staande bly.',
  },
  {
    soort: 'teks',
    kop: 'SOMS BETEKEN WEERSTAAN DAT JY MOET WEGSTAP',
    lyf: 'Ons dink soms ons moet bewys hoe sterk ons is deur naby versoeking te '
       + 'bly en net harder te probeer om nie toe te gee nie.\n\n'
       + 'Maar soms is die wysste ding wat jy kan doen, eenvoudig om afstand te '
       + 'maak.\n\n'
       + 'Maak dit toe.\n'
       + 'Stap weg.\n'
       + 'Verlaat die gesprek.\n'
       + 'Blokkeer die nommer.\n'
       + 'Moenie teruggaan na ’n plek waar jy weet jy maklik struikel nie.\n'
       + 'Bel iemand voordat jy toegee.\n'
       + 'Verwyder toegang tot iets wat jou telkens laat struikel.\n\n'
       + 'Jy hoef nie te bewys hoe sterk jy is deur te kyk hoe naby jy aan '
       + 'versoeking kan kom sonder om te val nie.\n\n'
       + 'As jy weet iets trek jou telkens weg van wat reg is, skep afstand '
       + 'tussen jou en daardie versoeking.\n\n'
       + 'Soms is dit presies hoe die uitweg lyk wat God vir jou gee.',
  },
  {
    soort: 'vraag',
    kop: 'WAT GAAN JY VERANDER?',
    id: 'verander4',
    lyf: 'Wat is een praktiese ding wat jy vandag kan verander om meer afstand '
       + 'tussen jou en die versoeking te skep?',
    prompt: 'Skryf dit hier neer…',
  },
  {
    soort: 'gebed',
    lyf: 'Here, help my om nie met versoeking te speel nie. Wys my die uitweg en '
       + 'gee my die moed om dit te kies. Wanneer ek moet wegstap, help my om '
       + 'weg te stap en gehoorsaam aan U te bly. Amen.',
  },
  { soort: 'groepbrug', netGroep: true },
]

const DAG5 = [
  /* Dag 5 het "JAKOBUS 4:7–8" as 'n blote opskrif gehad, sonder 'n knoppie.
     Dewald: "waar de vok staan daar maak die bybel ook". Dit is nou 'n regte
     LEES-kaart soos elke ander dag s'n, en volgJesusWeek2.toets.mjs dwing die
     reel af sodat dit nie weer kan gebeur nie. */
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Jakobus 4:7–8',
    lyf: 'Lees stadig en let op die volgorde: Jakobus sê eers “Onderwerp julle '
       + 'aan God” en daarna “weerstaan die duiwel.”',
  },
  {
    soort: 'teks',
    kop: 'JY SÊ NIE NET “NEE” VIR SONDE NIE — JY SÊ “JA” VIR JESUS',
    lyf: 'Die Christelike lewe gaan nie net oor alles waarvoor jy nee moet sê '
       + 'nie.\n\n'
       + 'Dit gaan eerstens oor Wie jy gekies het om te volg.\n\n'
       + 'Wanneer versoeking kom, gaan dit uiteindelik oor meer as net daardie '
       + 'een oomblik. Die vraag is: wie gaan die laaste sê hê?\n\n'
       + 'Jy sê nee vir die kortpad, omdat jy Jesus wil gehoorsaam.\n\n'
       + 'Jy sê nee vir die leuen, omdat jy kies om God se waarheid te glo.\n\n'
       + 'Jy stap weg van iets wat jou laat struikel, omdat jou verhouding met '
       + 'Jesus vir jou belangriker is as wat daardie versoeking jou belowe.\n\n'
       + 'Daarom begin Jakobus nie met “Probeer net harder” nie. Hy begin met: '
       + '“Onderwerp julle aan God.”\n\n'
       + 'Gee jouself eers weer aan God. Weerstaan dan dit wat jou van Hom '
       + 'probeer wegtrek.',
  },
  {
    soort: 'groot',
    lyf: 'VERSOEKING BRING JOU UITEINDELIK\nBY HIERDIE VRAAG:\nWIE GAAN JY VOLG?',
  },
  {
    soort: 'vraag',
    kop: 'JOU BESLUIT',
    id: 'besluit5',
    lyf: 'Voltooi hierdie sin:',
    prompt: 'Wanneer hierdie versoeking weer kom, gaan ek ____________, omdat ek gekies het om Jesus te volg.',
  },
  {
    soort: 'gebed',
    lyf: 'Here Jesus, ek wil U volg, ook wanneer dit moeilik is. Help my om die '
       + 'leuen raak te sien, U waarheid te onthou en die uitweg te kies. Leer '
       + 'my om nie met sonde te onderhandel nie, maar om gehoorsaam aan U te '
       + 'bly. My diepste “ja” behoort aan U. Amen.',
  },
  { soort: 'wallpaper', bronVeld: 'wallpaper', kop: 'HOU DIT VOOR JOU' },
]

export const WEEK2_DAE = [
  {
    n: 1, titel: 'Nie elke stem verdien dat jy dit glo nie', merk: 'DIE STEM',
    knop: 'EK GAAN DIE STEM TOETS',
    klaarKop: 'DAG 1 KLAAR.',
    klaarLyf: 'Nie elke stem verdien dat jy dit glo nie.',
    blokke: DAG1,
  },
  {
    n: 2, titel: 'Ken jou swak plek', merk: 'DIE SWAK PLEK',
    knop: 'EK GAAN EERLIK WEES',
    klaarKop: 'DAG 2 KLAAR.',
    klaarLyf: 'Ken die plek waar jy maklik getrek word.',
    blokke: DAG2,
  },
  {
    n: 3, titel: 'Weet vooraf wat waar is', merk: 'VOORAF',
    knop: 'EK BESLUIT VOORAF',
    klaarKop: 'DAG 3 KLAAR.',
    klaarLyf: 'Moenie eers onder druk besluit wat jy glo nie.',
    blokke: DAG3,
  },
  {
    n: 4, titel: 'Maak afstand', merk: 'DIE UITWEG',
    knop: 'EK KIES DIE UITWEG',
    klaarKop: 'DAG 4 KLAAR.',
    klaarLyf: 'Soms lyk weerstand soos wegstap.',
    blokke: DAG4,
  },
  {
    n: 5, titel: 'Kies wie jy volg', merk: 'JOU JA',
    knop: 'MY “JA” BEHOORT AAN JESUS',
    klaarKop: 'WEEK 2 KLAAR.',
    klaarLyf: 'Die diepste antwoord op versoeking is gehoorsaamheid aan Jesus.',
    blokke: DAG5,
  },
]

/* Wat aan die einde van die week teruggewys word. Net wat werklik geskryf is. */
export const WEEK2_REIS = [
  { id: 'stem1',     kop: 'Op Dag 1 het jy geskryf:' },
  { id: 'verander4', kop: 'Wat jy gaan verander:' },
  { id: 'besluit5',  kop: 'Jou besluit:' },
]

/* Die deelbare kaart aan die einde. Die kernlyn van die week. */
export const WEEK2_DEELSIN =
  'Die sterkste “nee” vir versoeking begin met ’n dieper “ja” vir Jesus.'

export const WEEK2_VOLGENDE = {
  nommer: 3,
  titel: 'Kom, volg My',
  lyf: 'Jesus roep ons nie net om van Hom te weet nie. Hy sê: “Volg My.” '
     + 'Volgende week kyk ons wat dit werklik beteken om jou lewe agter Jesus aan te rig.',
}

/* Die transkripsie van die stemboodskap, BY VERSTEK TOEGEVOU (Stemboodskap.jsx).
   Dewald: "hier is die transkripsie onder die stemnota soos met week 1 dag 1."

   Dit staan hier en nie in die admin nie, om dieselfde rede as die dae: dit is
   deel van die week se inhoud, nie 'n instelling nie. */
export const WEEK2_TRANSKRIPSIE = `Jesus is pas gedoop.

Die Vader verklaar: “Dit is my geliefde Seun.”

Daarna lei die Gees Jesus die woestyn in — maar dit is die duiwel wat Hom daar versoek.

Na veertig dae se vas is Jesus honger. En juis daar kom die versoeking.

Jesus was nie daar omdat Hy iets verkeerd gedoen het nie. Hy was presies waar die Gees Hom gelei het.

Hier is vier dinge wat Jesus ons leer wanneer versoeking kom.

Eerstens: moenie versoeking as bewys lees dat God ver is nie.

Hebreërs 4:15 sê Jesus is versoek soos ons, maar sonder sonde. Versoeking is dus nie dieselfde as sonde nie.

Moenie vir jouself sê: “As ek regtig naby aan God was, sou ek nie hiermee worstel nie.”

’n Versoeking kan by jou deur aanklop sonder dat jy die deur oopmaak. Moenie God se nabyheid meet aan die afwesigheid van versoeking nie.

Tweedens: toets die stem aan wat God reeds gesê het.

By Jesus se doop sê die Vader: “Dit is my geliefde Seun.”

Kort daarna sê die versoeker: “As U die Seun van God is…”

Sien dit raak. Die Vader maak ’n verklaring. Die versoeker probeer daarvan ’n vraag maak.

Moenie ’n vraagteken sit waar God reeds waarheid gespreek het nie.

God sê daar is vergifnis in Christus. Dan kom die stem: “Ja, maar nie ná wat jy gedoen het nie.”

God sê Hy sal jou nie verlaat nie. Dan kom: “Waar is Hy dan nou?”

En by die tempel haal die duiwel selfs Psalm 91 aan. ’n Vers kan korrek aangehaal word en steeds verkeerd toegepas word.

Daarom toets ons nie God se Woord aan ’n stem nie. Ons toets die stem aan God se Woord.

Derdens: net omdat jy iets nodig het, beteken dit nie enige manier om dit te kry is reg nie.

Jesus was werklik honger. Die duiwel sê: “Sê dat hierdie klippe brode word.”

Die behoefte was werklik. Maar nie elke manier om dit te bevredig was reg nie.

En versoeking klink vandag nog so: “Jy verdien dit.” “Jy het dit nodig.” “Net hierdie een keer.” “Niemand sal weet nie.”

Omdat jy eensaam is, beteken nie enige verhouding is reg nie. Omdat jy geld nodig het, beteken nie enige manier om dit te kry is reg nie. Omdat iemand jou seergemaak het, beteken nie wraak is reg nie.

Jesus laat nie Sy honger besluit wat reg is nie.

Vierdens: as die prys ongehoorsaamheid is, stap weg.

Die duiwel wys vir Jesus die koninkryke van die wêreld en sê: “Dit alles sal ek vir U gee as U neerval en my aanbid.”

Die aanbod lyk groot. Maar die prys is ongehoorsaamheid.

Dit is die versoeking van ’n kortpad: die kroon sonder die kruis.

Nie elke kortpad is God se voorsiening nie. As jy God moet ongehoorsaam om daar uit te kom, is dit nie God se pad nie.

Jakobus 4:7 sê: “Onderwerp julle dan aan God; weerstaan die duiwel, en hy sal van julle wegvlug.”

Nie onderhandel nie. Weerstaan.

Drie keer kom die versoeking. Drie keer antwoord Jesus: “Daar staan geskrywe.”

Jesus aanvaar nie ’n stem as waarheid net omdat dit dringend, slim of oortuigend klink nie. Hy meet dit aan wat God gesê het.

En as ons Jesus wil volg, moet ons dieselfde leer doen.

NIE ELKE STEM WAT MET JOU PRAAT, VERDIEN DAT JY HOM GLO NIE.

Toets die stem aan God se Woord. Weerstaan wat jou van gehoorsaamheid wegtrek. Moenie met die leuen onderhandel nie.

En wanneer dit weer praat — antwoord soos Jesus: “Daar staan geskrywe.”

Hemelse Vader, ek bid vir die persoon wat nou luister.

Wanneer versoeking kom, help hulle om nie uit skaamte van U af weg te kruip nie, maar nader aan U te beweeg.

Wanneer ’n leuen hard praat, help hulle om U waarheid te herken.

Wanneer ’n werklike behoefte hulle na ’n verkeerde antwoord probeer trek, gee hulle krag om gehoorsaam te bly.

En wanneer ’n kortpad goed lyk, gee hulle onderskeiding om die prys raak te sien.

Leer ons om vas te staan en soos Jesus te antwoord: “Daar staan geskrywe.”

In Jesus se Naam. Amen.`

export function blokkeVirDag2(n) {
  const dag = WEEK2_DAE.find(d => d.n === n)
  return dag ? dag.blokke : []
}

/* Die groepsessie vir hierdie week. Sien die nota by WEEK1_SESSIE. */
export const WEEK2_SESSIE = {
  titel: 'Staan saam vas',
  skrifte: ['Matteus 4:1\u201311', 'Jakobus 4:7\u20138'],
  vrae: [
    'Watter deel van Jesus se reaksie op versoeking in Matteus 4 het jou die meeste getref, en waarom?',
    'Waarom is dit belangrik om jou swak plekke te ken voordat versoeking kom?',
    'Wat is die verskil tussen om bloot teen versoeking te probeer veg en om vooraf \u2019n praktiese uitweg te beplan?',
    'Wat beteken hierdie sin vir jou: \u201cDie sterkste \u2018nee\u2019 vir versoeking begin met \u2019n dieper \u2018ja\u2019 vir Jesus\u201d?',
  ],
  gebed:
    'Hemelse Vader, dankie dat Jesus vir ons gewys het hoe gehoorsaamheid lyk '
    + 'wanneer versoeking kom. Leer ons om nie elke stem te glo wat met ons praat '
    + 'nie. Wys ons waar ons maklik getrek word. B\u00eare U Woord diep in ons harte. '
    + 'En laat ons liefde vir Jesus al hoe dieper word. Amen.',
}
