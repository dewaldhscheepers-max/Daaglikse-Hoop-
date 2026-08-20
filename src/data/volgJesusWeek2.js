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
    lyf: 'Lees stadig en let op hoe Jakobus beskryf dat begeerte ’n mens kan wegtrek en verlei.',
  },
  {
    soort: 'teks',
    kop: '’N STERK BEGEERTE IS NIE GOD SE TOESTEMMING NIE',
    lyf: 'Versoeking kom nie altyd op dieselfde manier nie. Jakobus wys dat dit '
       + 'by ons begeertes kan aanknoop en ons kan probeer wegtrek. Daarom is '
       + 'dit belangrik om te weet wanneer jy die kwesbaarste is.\n\n'
       + 'Vir die een is dit wanneer hy eensaam voel. Vir iemand anders is dit '
       + 'wanneer hy kwaad, moeg, bang, verwerp of onder geweldige druk is.\n\n'
       + 'Jesus was honger toe die versoeker Hom uitdaag om klippe in brood te '
       + 'verander. Die honger was werklik. Maar Sy behoefte het nie bepaal wat reg is nie.',
  },
  {
    soort: 'kies',
    kop: 'WANNEER IS JY DIE KWESBAARSTE?',
    id: 'kwesbaar2',
    opsies: [
      { waarde: 'eensaam',  woorde: 'Wanneer ek eensaam voel' },
      { waarde: 'kwaad',    woorde: 'Wanneer ek kwaad of seergemaak is' },
      { waarde: 'moeg',     woorde: 'Wanneer ek moeg of gestres is' },
      { waarde: 'bang',     woorde: 'Wanneer ek bang is' },
      { waarde: 'verwerp',  woorde: 'Wanneer ek verwerp voel' },
      { waarde: 'geld',     woorde: 'Wanneer ek geld of sekuriteit nodig het' },
      { waarde: 'anders',   woorde: 'Iets anders' },
    ],
    vraag: {
      id: 'kwesbaar2_hoekom',
      kop: 'WAT PROBEER JY IN DAARDIE OOMBLIK KRY, BEWYS OF LAAT OPHOU VOEL?',
      prompt: 'Skryf dit hier neer…',
    },
  },
  {
    soort: 'gebed',
    lyf: 'Vader, wys my waar ek maklik getrek word. Gee my die eerlikheid om my '
       + 'swak plekke raak te sien sonder om dit weg te steek of te verskoon. '
       + 'Help my om nie ’n verkeerde antwoord te kies net omdat die behoefte '
       + 'sterk voel nie. Amen.',
  },
  { soort: 'wallpaper', bronVeld: 'wallpaperDag1', kop: 'HOU DIT VOOR JOU' },
]

const DAG3 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Psalm 119:9–11',
    lyf: 'Let op hoe die psalmdigter God se Woord in sy hart bêre.',
  },
  {
    soort: 'teks',
    kop: 'BESLUIT VOORAF',
    lyf: 'Toe Jesus versoek word, antwoord Hy: “Daar staan geskrywe.” Hy begin '
       + 'nie eers in die oomblik van versoeking uitwerk wat reg en waar is '
       + 'nie. Hy antwoord vanuit wat God reeds gesê het.\n\n'
       + 'Dit is waarom voorbereiding belangrik is. As jy weet waar jy maklik '
       + 'struikel, moet jy vooraf weet wat God se Woord daaroor sê.\n\n'
       + 'Wanneer die druk kom, is dit baie moeiliker om helder te dink.',
  },
  {
    soort: 'vraag',
    kop: 'WAT IS DIE WAARHEID?',
    id: 'waarheid3',
    lyf: 'Dink aan die versoeking wat jy hierdie week geïdentifiseer het.',
    prompt: 'Watter waarheid uit God se Woord moet reeds in jou hart wees wanneer dit weer kom?',
  },
  {
    soort: 'groot',
    lyf: 'MOENIE WAG TOTDAT DIE LEUEN PRAAT\nOM TE BESLUIT WAT WAAR IS NIE.',
  },
  {
    soort: 'gebed',
    lyf: 'Here, bêre U Woord diep in my hart. Help my om nie net die waarheid te '
       + 'ken wanneer alles rustig is nie, maar daarop te staan wanneer die druk '
       + 'kom. Help my om vooraf te besluit: ek wil U gehoorsaam. Amen.',
  },
]

const DAG4 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: '1 Korintiërs 10:12–13',
    lyf: 'Lees stadig wat Paulus oor versoeking en die uitkoms sê.',
  },
  {
    soort: 'teks',
    kop: 'SOMS LYK WEERSTAND SOOS WEGSTAP',
    lyf: 'Ons dink soms geestelike krag beteken dat jy naby versoeking kan bly '
       + 'en dit net harder moet probeer weerstaan. Maar die Bybel sê dat God '
       + 'saam met die versoeking ook ’n uitkoms gee.\n\n'
       + 'Daardie uitweg kan baie prakties wees. Maak dit toe. Stap weg. Verlaat '
       + 'die gesprek. Blokkeer die nommer. Moenie weer alleen na daardie plek '
       + 'gaan nie. Bel iemand voordat jy toegee. Verwyder toegang tot dit '
       + 'waarmee jy gereeld struikel.\n\n'
       + 'Jy hoef nie te bewys hoe sterk jy is deur so naby moontlik aan '
       + 'versoeking te bly nie. God se uitweg help jou nie as jy aanhou staan '
       + 'waar jy versoek word nie.',
  },
  {
    soort: 'vraag',
    kop: 'WAT GAAN JY VERANDER?',
    id: 'verander4',
    prompt: 'Een praktiese ding wat jy vandag kan verander…',
  },
  {
    soort: 'gebed',
    lyf: 'Here, gee my die nederigheid om nie met versoeking te speel nie. Help '
       + 'my om die uitweg raak te sien en die moed te hê om dit te neem. '
       + 'Wanneer wegstap gehoorsaamheid is, help my om weg te stap. Amen.',
  },
  { soort: 'groepbrug', netGroep: true },
]

const DAG5 = [
  {
    soort: 'teks',
    kop: 'JAKOBUS 4:7–8',
    lyf: 'Jakobus sê nie net “weerstaan die duiwel” nie. Hy begin met: '
       + '“Onderwerp julle aan God.” Dit verander die hele prentjie.\n\n'
       + 'Die Christelike lewe gaan nie net oor alles waarvoor jy “nee” moet sê '
       + 'nie. Dit gaan eerstens oor die Een vir Wie jy “ja” gesê het. Jy sê nee '
       + 'vir die kortpad omdat jy ja gesê het vir Jesus. Jy sê nee vir die leuen '
       + 'omdat jy ja gesê het vir Sy waarheid.\n\n'
       + 'Versoeking bring jou uiteindelik voor hierdie vraag: wie gaan jy volg?',
  },
  {
    soort: 'terugblik',
    bronId: 'stem1',
    kop: 'DIE STEM MAG WEER PRAAT',
    lyf: 'Daardie stem mag weer praat. Maar nou weet jy: jy hoef dit nie te glo '
       + 'nie. Jy kan jou swak plek herken. Jy kan vooraf besluit wat waar is. '
       + 'Jy kan die uitweg neem. En jy kan kies om Jesus te volg.',
  },
  {
    soort: 'vraag',
    kop: 'JOU BESLUIT',
    id: 'besluit5',
    lyf: 'Voltooi hierdie sin:',
    prompt: 'Wanneer hierdie versoeking weer kom, gaan ek… omdat my “ja” aan Jesus behoort.',
  },
  {
    soort: 'gebed',
    lyf: 'Here Jesus, ek wil U nie net volg wanneer dit maklik is nie. Ek wil U '
       + 'volg wanneer iets anders hard aan my trek. Leer my om die leuen te '
       + 'herken, U waarheid te onthou en die uitweg te neem. Maar meer as '
       + 'enigiets anders: laat my liefde vir U groter word as my begeerte om '
       + 'met sonde te onderhandel. My diepste “ja” behoort aan U. Amen.',
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
    n: 3, titel: 'Besluit vooraf wat waar is', merk: 'VOORAF',
    knop: 'EK BESLUIT VOORAF',
    klaarKop: 'DAG 3 KLAAR.',
    klaarLyf: 'Moenie eers onder druk besluit wat jy glo nie.',
    blokke: DAG3,
  },
  {
    n: 4, titel: 'Maak afstand', merk: 'DIE UITWEG',
    knop: 'EK VAT DIE UITWEG',
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
