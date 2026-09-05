/* ── VOLG JESUS · Week 3 · Kom, volg My ──
 *
 * Dewald het die hele week self geskryf en aan my gegee — die Skrifte, elke
 * dag se teks, die kernlyne, die dieper vrae, die gehoorsaamheidstappe, die
 * groepsessie en die admin-velde. Dit staan hier presies soos hy dit gegee
 * het, net gegiet in Week 1 en Week 2 se blokke-vorm.
 *
 * Dieselfde perke as Week 1 en 2 (`volgJesusWeek3.toets.mjs` dwing hulle af):
 * hoogstens vyf inhoudsblokke per dag, hoogstens twee private antwoorde per
 * dag, hoogstens 180 woorde per teksblok, en geen Skrifgedeelte twee dae na
 * mekaar nie.
 *
 * ── Waar ek van sy uitleg afgewyk het, en hoekom ──
 *
 * Sy "Gehoorsaamheid"-reël by elke dag is nie 'n eie blok-soort in hierdie
 * stelsel nie — dit staan nou binne die dag se VRAAG-blok, as die stap wat by
 * die vraag hoort. Niks daarvan het geval nie.
 *
 * Geen dag in sy teks dra 'n eie "Gebed" nie (net die SLOTGEBED aan die einde
 * en die admin se een gebed-veld). Elke dag in Week 1 en 2 sluit egter af met
 * 'n kort gebed, en dié patroon moet bly — 'n dag wat skielik ophou by 'n
 * vraag, voel onklaar. Ek het vyf kort gebede geskryf wat elke dag se EIE
 * woorde na God toe draai; geen nuwe gedagte staan daarin wat nie reeds in
 * daardie dag se teks was nie.
 *
 * ── Regstelling: die stemboodskap is Dag 3 s'n, nie Dag 1 s'n nie ──
 *
 * Dewald: "die transkripsie van die voicenote is verkeerd... jy het dit
 * seker op verkeerde plek geplaas." Ek het eers Dag 1 se "Kom hier agter My
 * aan"-teks as die opname se woorde geraai. Dit was verkeerd — sy egte
 * stemboodskap IS "GEE VIR JESUS JOU LEË BOOT", woord vir woord soos hy dit
 * gegee het. Dit hoort by DAG 3, waar die leë-boot-verhaal (Lukas 5) staan,
 * nie by Dag 1 nie.
 *
 * Die STEM-blok het dus van Dag 1 na Dag 3 geskuif. Dag 3 s'n teks- en
 * groot-blok (my eie verkorting van dieselfde verhaal) is weg — die opname
 * dra nou daardie gewig, presies soos 'n Dag 1 in Week 1 en 2 nooit 'n eie
 * teksblok langs die stem het nie. Dag 1 kry in sy plek 'n geskrewe
 * teks-en-groot-blok van sy EIE oorspronklike inhoud ("Kom hier agter My
 * aan"), wat nou nie meer verlore is nie — dit staan steeds op die skerm,
 * net gelees eerder as gehoor. §40 se brug-na-die-groep-reël (kom NA die
 * stemboodskap) het saam met die stem na Dag 3 geskuif.
 *
 * WEEK3_TRANSKRIPSIE is nou Dewald se eie leë-boot-teks, woord vir woord —
 * ek het niks daaraan verander nie, ook nie die slotgebed nie.
 *
 * WEEK3_VOLGENDE was leeg totdat Week 4 bestaan het. Dit wys nou na Week 4,
 * met Dewald se eie woorde — sien onder aan hierdie leer.
 */

/* ── Die openingsblad ── */
export const WEEK3_OPENING =
  'Jesus roep jou nie net om in Hom te glo nie.\n\n'
  + 'Hy roep jou om Hom te volg.\n\n'
  + 'Om Jesus te volg beteken dat Hy die rigting van jou lewe bepaal — wanneer '
  + 'dit maklik is, wanneer dit jou iets kos, wanneer jy teleurgesteld is, '
  + 'wanneer dinge goed gaan en selfs wanneer jy misluk.'

const DAG1 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Matteus 4:18–22',
    lyf: 'Lees dit stadig. Let op hoe eenvoudig Jesus se uitnodiging aan Petrus '
       + 'en Andreas is — en hoe min Hy eers van hulle vra om te verstaan.',
  },
  {
    soort: 'teks',
    kop: 'KOM HIER AGTER MY AAN',
    lyf: 'Jesus vind Petrus en Andreas besig met hulle gewone werk. Hy sê nie: '
       + '“Maak eers jou lewe reg.” Hy sê nie: “Verstaan eers alles.” Hy sê nie: '
       + '“Bewys eers dat jy goed genoeg is.” Hy sê: “Volg My.”\n\n'
       + 'Dissipelskap begin nie wanneer jy al die antwoorde het nie. Dit begin '
       + 'wanneer Jesus jou roep en jy besluit om Hom te vertrou.\n\n'
       + 'Petrus het daardie dag nie geweet waarheen Jesus hom sou lei nie — nie '
       + 'van die storms wat voorlê, die wonderwerke wat hy sou sien, of sy eie '
       + 'mislukking nie. Hy het net geweet: Jesus roep my. En hy het gevolg.\n\n'
       + 'Daar gaan tye in jou lewe wees wanneer Jesus die volgende stap '
       + 'duidelik maak, maar nie die hele pad wys nie. Dan moet jy besluit: '
       + 'wag ek totdat ek alles verstaan, of vertrou ek die Een wat my roep?',
  },
  {
    soort: 'groot',
    lyf: 'JY HOEF NIE DIE HELE PAD TE SIEN\nOM DIE VOLGENDE STAP SAAM MET JESUS TE NEEM NIE.',
  },
  {
    soort: 'vraag',
    id: 'seker1',
    kop: 'WAAR WAG JY VIR SEKERHEID?',
    lyf: 'Waar wag jy tans vir meer sekerheid, terwyl Jesus se Woord reeds vir '
       + 'jou wys wat die volgende gehoorsame stap is?\n\n'
       + 'Identifiseer vandag een konkrete stap waarvan jy reeds weet dit is in '
       + 'lyn met Jesus se Woord — en neem dit.',
    prompt: 'Skryf dit hier neer…',
  },
  {
    soort: 'gebed',
    lyf: 'Here Jesus, ek sien nie altyd die hele pad nie. Help my om nie te wag '
       + 'totdat ek alles verstaan nie, maar om vandag die volgende stap saam '
       + 'met U te gee. Ek wil U vertrou, ook wanneer ek nie die hele pad sien '
       + 'nie. Amen.',
  },
]

const DAG2 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Lukas 9:23–25',
    lyf: 'Lees stadig en let op wat Jesus sê dit kos om agter Hom aan te kom.',
  },
  {
    soort: 'teks',
    kop: 'WANNEER DIT JOU IETS KOS OM JESUS TE VOLG',
    lyf: 'Jesus het nooit gemaak asof dissipelskap altyd maklik sou wees nie. '
       + 'Om Hom te volg beteken daar gaan tye wees wanneer Sy wil met jou eie '
       + 'wil bots.\n\n'
       + 'Jy wil terugbaklei — Hy leer jou om lief te hê en te vergewe. Jy wil '
       + 'jouself eerste stel — Hy leer jou om te dien. Jy wil beheer behou — '
       + 'Hy roep jou om Hom te vertrou.\n\n'
       + 'Om jouself te verloën beteken nie dat jy waardeloos is nie. Dit '
       + 'beteken jou eie wil is nie meer die hoogste gesag in jou lewe nie. '
       + 'Jesus is. Die vraag word dus nie meer “Wat wil ek hê?” nie. Dit word: '
       + '“Here, wat wil U hê?”',
  },
  {
    soort: 'groot',
    lyf: 'WANNEER JY JESUS VOLG, WORD HY NIE NET DEEL VAN JOU LEWE NIE —\nHY WORD HERE VAN JOU LEWE.',
  },
  {
    soort: 'vraag',
    id: 'bots2',
    kop: 'WAAR BOTS SY WIL MET JOUNE?',
    lyf: 'Waar bots Jesus se wil tans met iets waaraan jy nog vasklou?\n\n'
       + 'Noem daardie area vandag eerlik voor Jesus en bid: “Here, ek wil nie '
       + 'net my eie wil volg nie. Ek wil U volg.”',
    prompt: 'Skryf dit hier neer…',
  },
  {
    soort: 'gebed',
    lyf: 'Vader, waar my wil met Uwe bots, help my om te sê: “Here, wat wil U '
       + 'hê?” Ek gee my beheer, my planne en myself aan U. Amen.',
  },
  { soort: 'wallpaper', bronVeld: 'wallpaperDag1', kop: 'HOU DIT VOOR JOU' },
]

const DAG3 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Lukas 5:1–11',
    lyf: 'Lees stadig. Let op wat Petrus sê voordat hy gehoorsaam: sy nag het '
       + 'een ding gewys, maar Jesus het gepraat.',
  },
  {
    soort: 'stem',
    titel: 'Jou leë nette is nie die einde van jou verhaal nie.',
    duur: '±6 minute',
  },
  {
    soort: 'vraag',
    id: 'boot3',
    kop: 'IS JESUS IN JOU BOOT?',
    lyf: 'Waar in jou lewe voel dit of jy ’n leë boot vashou — iets wat nie '
       + 'uitgewerk het soos jy gehoop het nie?\n\n'
       + 'Wat sou dit beteken om dit vandag vir Jesus te gee?',
    prompt: 'Skryf dit hier neer…',
    deelStem: true,
  },
  {
    soort: 'gebed',
    lyf: 'Here Jesus, hier is my leë boot. Hier is my teleurstelling, my '
       + 'mislukking en die dele van my lewe wat nie uitgewerk het soos ek '
       + 'gehoop het nie. Help my om U Woord meer te vertrou as wat ek gister '
       + 'beleef het. En wanneer ek val, leer my om nie van U af weg te kruip '
       + 'nie, maar na U toe te hardloop. Dankie dat U genade groter is as my '
       + 'mislukking. Ek wil U volg. Amen.',
  },
  /* §40: die brug na die groep kom NA die stemboodskap — dié skuif saam met
     die stem-blok van Dag 1 na hier. */
  { soort: 'groepbrug', netGroep: true },
]

const DAG4 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Johannes 6:26–27, 66–69',
    lyf: 'Lees stadig en let op waarom die skare Jesus gesoek het — en waarom '
       + 'Petrus by Hom gebly het toe baie ander weggegaan het.',
  },
  {
    soort: 'teks',
    kop: 'VOLG JY JESUS VIR JESUS?',
    lyf: 'Jesus het duisende mense gevoed. Die volgende dag kom soek hulle Hom '
       + 'weer — nie omdat hulle verstaan wie Hy is nie, maar omdat hulle van '
       + 'die brood geëet het en versadig geword het.\n\n'
       + 'Later word Jesus se woorde vir baie moeilik om te aanvaar, en baie '
       + 'volgelinge gaan terug en volg Hom nie meer nie. Jesus vra die twaalf: '
       + '“Wil julle nie ook weggaan nie?” Petrus antwoord: “Here, na wie toe '
       + 'sal ons gaan? U het die woorde van die ewige lewe.”\n\n'
       + 'Hy sê nie: “Ons bly omdat alles maklik is,” of “Ons bly omdat U '
       + 'altyd gee wat ons wil hê.” God se seëninge is goed. Antwoorde op '
       + 'gebed is goed. Maar Jesus is groter as enige gawe wat Hy vir jou kan '
       + 'gee.',
  },
  {
    soort: 'groot',
    lyf: 'DIE TOETS IS NIE OF JY JESUS VOLG WANNEER DIT GOED GAAN NIE —\n'
       + 'DIT IS OF JY HOM KIES WANNEER JY NIE KRY WAAROP JY GEHOOP HET NIE.',
  },
  {
    soort: 'vraag',
    id: 'gawe4',
    kop: 'VOLG JY HOM VIR HOM?',
    lyf: 'As Jesus vandag nie verander wat ek wil hê Hy moet verander nie, sal '
       + 'ek Hom steeds vertrou en volg?\n\n'
       + 'Sê dit vandag doelbewus vir Hom: “Here Jesus, ek wil U hê — nie net '
       + 'wat U vir my kan gee nie.”',
    prompt: 'Skryf dit hier neer…',
  },
  {
    soort: 'gebed',
    lyf: 'Here Jesus, vergewe my waar ek U net soek vir wat U vir my kan gee. '
       + 'Ek wil U kies, ook wanneer ek nie kry waarop ek gehoop het nie. Na '
       + 'wie toe anders sal ek gaan? Amen.',
  },
  /* Die tweede brug na die groep, laat in die week — soos Week 1 en 2 s'n. */
  { soort: 'groepbrug', netGroep: true },
]

const DAG5 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Johannes 21:1–19',
    lyf: 'Lees stadig en let op hoe hierdie toneel eggo wat op Dag 3 gebeur '
       + 'het — en hoe verskillend Petrus hierdie keer reageer.',
  },
  {
    soort: 'teks',
    kop: 'WANNEER JY MISLUK, HARDLOOP NA JESUS',
    lyf: 'Petrus vis weer die hele nag. Weer vang hulle niks. Weer staan Jesus '
       + 'daar en sê waar om die net te gooi — en weer word dit vol.\n\n'
       + 'Maar Petrus se reaksie is nou anders. Toe hy hoor: “Dit is die Here!” '
       + 'sê hy nie “Gaan weg van my” nie — hy spring in die see om by Jesus '
       + 'uit te kom.\n\n'
       + 'Wat het verander? Nie Petrus se rekord nie — dit was intussen erger; '
       + 'hy het Jesus drie keer verloën. Petrus het genade leer ken. Die '
       + 'eerste keer het sy mislukking hom laat sê: “Jesus, gaan weg.” Die '
       + 'tweede keer laat sy mislukking hom na Jesus toe hardloop.\n\n'
       + 'Jesus jaag hom nie weg nie. Hy maak vir hom kos. Drie keer het Petrus '
       + 'Hom verloën; drie keer vra Jesus: “Het jy My lief?” En dan hoor '
       + 'Petrus weer: “Volg My.”',
  },
  {
    soort: 'groot',
    lyf: 'JOU GROOTSTE MISLUKKING\nIS NIE GROTER AS JESUS SE GENADE NIE.',
  },
  {
    soort: 'vraag',
    id: 'skaam5',
    kop: 'WEGKRUIP, OF TERUGGAAN?',
    lyf: 'Wanneer ek misluk, dryf skaamte my van Jesus af weg, of gaan ek na '
       + 'Hom toe?\n\n'
       + 'Moenie vandag iets vir Jesus wegsteek omdat jy skaam is nie. Bring '
       + 'dit na Hom toe en bely dit eerlik.',
    prompt: 'Skryf dit hier neer…',
  },
  {
    soort: 'gebed',
    lyf: 'Here Jesus, dankie dat U my nie wegjaag wanneer ek val nie. Leer my '
       + 'om nie van U af weg te kruip nie, maar na U toe te hardloop. Ek hoor '
       + 'U weer sê: “Volg My.” Hier is ek. Amen.',
  },
  { soort: 'wallpaper', bronVeld: 'wallpaper', kop: 'HOU DIT VOOR JOU' },
]

export const WEEK3_DAE = [
  {
    n: 1, titel: 'Kom, volg My', merk: 'DIE ROEPING',
    knop: 'EK NEEM DIE STAP',
    klaarKop: 'DAG 1 KLAAR.',
    klaarLyf: 'Jy hoef nie die hele pad te sien om die volgende stap te neem nie.',
    blokke: DAG1,
  },
  {
    n: 2, titel: 'Wanneer dit jou iets kos', merk: 'DIE PRYS',
    knop: 'EK KIES SY WIL',
    klaarKop: 'DAG 2 KLAAR.',
    klaarLyf: 'Wanneer Jesus se wil met joune bots, word Hy Here oor jou lewe.',
    blokke: DAG2,
  },
  {
    n: 3, titel: 'Gee vir Jesus jou leë boot', merk: 'DIE LEË BOOT',
    knop: 'OP U WOORD',
    klaarKop: 'DAG 3 KLAAR.',
    klaarLyf: 'Jou leë nette is nie die einde van jou verhaal nie.',
    blokke: DAG3,
  },
  {
    n: 4, titel: 'Volg jy Jesus vir Jesus?', merk: 'VIR WIE VOLG JY',
    knop: 'EK WIL U HÊ',
    klaarKop: 'DAG 4 KLAAR.',
    klaarLyf: 'Jesus is groter as enige gawe wat Hy vir jou kan gee.',
    blokke: DAG4,
  },
  {
    n: 5, titel: 'Wanneer jy misluk, hardloop na Jesus', merk: 'TERUG NA JESUS',
    knop: 'VOLTOOI WEEK 3',
    klaarKop: 'WEEK 3 KLAAR.',
    klaarLyf: 'Wanneer jy val, hoor jy Hom weer sê: “Volg My.”',
    blokke: DAG5,
  },
]

/* Wat aan die einde van die week teruggewys word. Net wat werklik geskryf is. */
export const WEEK3_REIS = [
  { id: 'seker1', kop: 'Op Dag 1 het jy geskryf:' },
  { id: 'boot3',  kop: 'Op Dag 3 het jy geskryf:' },
  { id: 'skaam5', kop: 'En vandag het jy geskryf:' },
]

/* Die deelbare kaart aan die einde. Die kernlyn van die week. */
export const WEEK3_DEELSIN =
  'Jesus roep jou nie net op die dag waarop jy begin nie. Hy roep jou elke dag '
  + 'weer: “Volg My.”'

/* Die brug na Week 4. Dit was `null` solank Week 4 nie bestaan het nie — 'n
   geraaide titel is erger as stilte. Dewald het Week 4 gestuur en hierdie
   woorde saam met dit gegee. */
export const WEEK3_VOLGENDE = {
  nommer: 4,
  titel: 'Laat Jesus dit omkeer',
  lyf: 'Om Jesus te volg, beteken nie net dat Hy jou troos en seën nie. Wat '
     + 'gebeur wanneer Hy begin wys wat in jou lewe moet verander?',
}

export function blokkeVirDag3(n) {
  const dag = WEEK3_DAE.find(d => d.n === n)
  return dag ? dag.blokke : []
}

/* ── Die stemboodskap se transkripsie ──
 * Dewald se eie woorde, presies soos hy dit gegee het — niks hier verkort of
 * verander nie, ook nie die slotgebed nie. Dit hoort by Dag 3 se stem-blok;
 * sien die nota bo-aan hierdie lêer. */
export const WEEK3_TRANSKRIPSIE = `Daar is iets ongeloofliks in Petrus se verhaal wat jy maklik kan miskyk.

Twee keer werk Petrus ’n hele nag en vang niks.

Twee keer staan hy met leë nette.

Twee keer kom Jesus.

Twee keer sê Jesus vir hom waar om die nette uit te gooi.

En twee keer word die nette skielik vol.

Maar Petrus se reaksie op Jesus is nie dieselfde nie.

En daarin lê vandag se boodskap.

In Lukas 5 het Petrus die hele nag gewerk en niks gevang nie.

Toe Jesus daar aankom, klim Hy in Petrus se boot.

Dink hieraan:

Jesus wag nie dat Petrus se boot vol is voordat Hy daarin klim nie.

Hy klim in terwyl die nette leeg is.

Daardie boot het daardie oggend een ding gesê:

“Ek het probeer. Ek het gewerk. Dit het nie gewerk nie.”

Maar Jesus sien nie net wat Petrus nié gevang het nie.

Hy sien wat Hy met Petrus se lewe gaan doen.

Jesus sê vir hom om weer die nette uit te gooi.

Petrus antwoord:

“Meester, ons het die hele nag deur hard gewerk en niks gevang nie. Maar op U woord sal ek die nette laat sak.”

Daardie een sin is geloof:

“Dit het voorheen nie gewerk nie … maar U het gepraat.”

Petrus moes besluit:

Gaan gisteraand se teleurstelling die laaste woord hê?

Of gaan Jesus se Woord die laaste woord hê?

Toe Petrus gehoorsaam, word die nette so vol dat hulle begin skeur.

Maar kyk wat gebeur daarna.

Petrus val voor Jesus neer en sê:

“Gaan weg van my, Here, want ek is ’n sondige mens.”

Hy sien Jesus se grootheid en sy eie gebrokenheid en dink:

“Jesus behoort nie naby iemand soos ek te wees nie.”

Maar Jesus gaan nie weg nie.

Hy sê:

“Moenie bang wees nie.”

En Hy roep Petrus om Hom te volg.

Nou spring ons vorentoe na Johannes 21.

Petrus het intussen iets baie erger as ’n onsuksesvolle nag op die water beleef.

Hy het Jesus drie keer verloën.

En raai waar kry ons hom weer?

In ’n boot.

Hy werk weer die hele nag.

Hy vang weer niks.

Weer leë nette.

En weer staan Jesus daar.

Maar hierdie keer gebeur iets merkwaardigs.

Toe Petrus hoor:

“Dit is die Here!”

sê hy nie:

“Gaan weg van my” nie.

Hy spring in die water om so vinnig moontlik by Jesus uit te kom.

Wat het verander?

Nie Petrus se rekord nie.

Sy rekord was eintlik erger.

Petrus het genade leer ken.

Die eerste keer het sy mislukking hom laat sê:

“Jesus, gaan weg.”

Die tweede keer laat sy mislukking hom na Jesus toe hardloop.

Dít is wat genade aan ’n mens doen.

Genade beteken nie dat jou mislukking nie saak maak nie.

Genade leer jou waarheen om te gaan wanneer jy misluk.

En daar op die strand verneder Jesus hom nie.

Jesus maak vir hom kos.

Jesus praat met hom.

Drie keer het Petrus Hom verloën.

Drie keer vra Jesus:

“Het jy My lief?”

En dan hoor Petrus weer die woorde:

“Volg My.”

Hoor dit vandag:

Jesus het nie gewag totdat Petrus se nette vol was voordat Hy in sy boot geklim het nie.

Hy het ingeklim terwyl hulle leeg was.

En ná Petrus se grootste mislukking het Jesus hom nie weggegooi nie.

Hy het hom gaan haal.

Miskien kyk jy vandag na iets in jou lewe en al wat jy sien, is:

“Ek het probeer.”

“Ek het gefaal.”

“Ek het niks om daarvoor te wys nie.”

Moenie wegkruip nie.

Gee vir Jesus die leë boot.

En as jy geval het, moenie van Hom af weghardloop nie.

Hardloop na Hom toe.

Want jou leë nette is nie die einde van jou verhaal nie.

En jou grootste mislukking is nie groter as Jesus se genade nie.

Die vraag vandag is nie:

“Hoe vol is my boot?”

Die vraag is:

“IS JESUS IN MY BOOT—EN SAL EK HOM VOLG?”

Here Jesus, hier is my leë boot. Hier is my teleurstelling, my mislukking en die dele van my lewe wat nie uitgewerk het soos ek gehoop het nie. Help my om U Woord meer te vertrou as wat ek gister beleef het. En wanneer ek val, leer my om nie van U af weg te kruip nie, maar na U toe te hardloop. Dankie dat U genade groter is as my mislukking. Ek wil U volg. Amen.`

/* ── Die groepsessie ── */
export const WEEK3_SESSIE = {
  titel: 'Saam agter Jesus aan',
  skrifte: ['Lukas 9:23', 'Johannes 21:19'],
  vrae: [
    'Wanneer Jesus sê "Volg My", wat beteken dit prakties vir die manier waarop ons leef?',
    'Waar in jou lewe vind jy dit tans moeilik om Jesus se Woord meer te vertrou as jou eie ervaring, gevoelens of teleurstelling?',
    'Johannes 6 wys dat mense Jesus soms gesoek het vir wat Hy vir hulle kon gee. Hoe kan ons onderskei tussen liefde vir Jesus en ’n begeerte na net Sy seëninge?',
    'Wat leer Petrus se verskillende reaksies in Lukas 5 en Johannes 21 jou oor sonde, genade en hoe ons na mislukking moet reageer?',
  ],
  gebed:
    'Here Jesus, dankie dat U ons roep om U te volg. Nie omdat ons alles '
    + 'verstaan nie. Nie omdat ons alles reggekry het nie. Maar omdat U genadig '
    + 'is. Leer ons om U te gehoorsaam wanneer ons nie die hele pad kan sien '
    + 'nie. Leer ons om U te kies wanneer gehoorsaamheid ons iets kos. Leer ons '
    + 'om U Woord meer te vertrou as ons teleurstelling. Help ons om nie net te '
    + 'soek na wat U vir ons kan gee nie, maar om U self lief te hê en te volg. '
    + 'En wanneer ons val, leer ons om nie van U af weg te kruip nie, maar na '
    + 'U toe terug te gaan. Here Jesus, ons wil U nie net ken nie. Ons wil U '
    + 'volg. Amen.',
}
