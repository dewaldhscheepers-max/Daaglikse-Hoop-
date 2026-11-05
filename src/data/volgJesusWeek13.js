/* ────────────────────────────────────────────────────────────
   VOLG JESUS — WEEK 13: "TWEE HUISE. EEN STORM."

   Dewald het die week op 5 November 2026 voluit gestuur. Dit is 'n NUWE week:
   daar was geen Week 13 voor hierdie een nie (die les van Week 8: kyk eers —
   sien CLAUDE.md).

   Dag 1 se boodskap staan hier PRESIES soos hy dit gegee het: *"Gebruik
   Dewald se Dag 1-boodskap presies soos dit hierbo staan. Moenie enige woord
   verander nie… of taalversorging daarop doen nie."* Sy woorde op Dag 2 tot 5
   staan ook so.

   ── GEEN STEMBOODSKAP ──

   *"Daar is GEEN stemnota, audio of klankspeler in Week 13 nie."* Dag 1 se
   hoofboodskap is dus 'n `boodskap`-blok, oop en nie toegevou nie, en
   `geskreweBoodskap: true` op die plat rekord.

   ── DAG 1 ──

   Dewald het die gedeelte (Matteus 7:24–27) direk onder die titel gesit,
   sonder 'n leesreël. Die LEES-blok dra dus net die verwysing. Die boodskap
   EINDIG met die gebed ("Vader, wys my waar ek U Woord hoor… Amen."), soos
   Week 10 tot 12 s'n; daar is dus geen aparte gebed-blok op Dag 1 nie.

   ── DIE PERKE ──

   Vyf inhoudsblokke per dag en hoogstens twee skryfkassies:

     · Dag 1: LEES, die boodskap, die vraag;
     · Dag 2–4: LEES, die teks, die vraag, die gebed;
     · Dag 5: LEES, die teks, KYK TERUG, JOU VOLGENDE STAP, die gebed.

   Hier is dit ANDERSOM as Week 12: "KYK TERUG" is 'n TEKSBLOK (dit herinner en
   vra om te kies) en "JOU VOLGENDE STAP" is die SKRYFKASSIE — Dewald: "Skryf
   een eenvoudige stap neer." Twee kassies vir dieselfde een stap sou die dag
   huiswerk maak.

   ── DIE AANHALINGS ──

   Al die gedeeltes is teen die egte public/gab/ nagegaan en bestaan. Dag 5 se
   aanhaling is Dewald se EIE bewoording en nie die GAB s'n nie — GAB Lukas
   6:46: "En waarom noem julle My, Here, Here, en doen nie die dinge wat Ek sê
   nie?" Sy woorde staan onveranderd; hy is daarop gewys.

   ── DIE TWEE WALLPAPERS ──

   Dewald laai hulle self op. `wallpaperDag1` sluit Dag 1 af, `wallpaper` sluit
   die week af op Dag 5.
   ──────────────────────────────────────────────────────────── */

/* ── Die openingsblad — Dewald se "BEGIN VAN DIE WEEK" ── */
export const WEEK13_OPENING =
  'Jesus eindig die Bergrede met twee mense wat dieselfde woorde hoor.\n\n'
  + 'Albei bou.\n\n'
  + 'Albei kry ’n storm.\n\n'
  + 'Maar net een huis bly staan.\n\n'
  + 'Die groot verskil is eenvoudig:\n\n'
  + 'Die een hoor wat Jesus sê en doen dit.'

/* ── Dag 1 se hoofboodskap ──
 *
 * Dewald: "Gebruik Dewald se Dag 1-boodskap presies soos dit hierbo staan." */
const DAG1_BOODSKAP = `Jesus eindig die Bergrede met ’n eenvoudige beeld:

Twee mense bou elkeen ’n huis.

Die een bou op rots.

Die ander een bou op sand.

Dan kom die storm.

Die reën val.

Die water styg.

Die wind slaan teen albei huise.

En hier is wat maklik gemis word:

Albei het Jesus se woorde gehoor.

Die verskil was nie wie meer gehoor het nie.

Die verskil was wie gedoen het wat Jesus sê.

DIE VERSKIL TUSSEN DIE TWEE HUISE WAS NIE WIE JESUS GEHOOR HET NIE. DIT WAS WIE GEDOEN HET WAT HY SÊ.

Dit beteken jy kan baie Bybelkennis hê en steeds op sand bou.

Jy kan preke luister, verse ken en selfs saamstem met wat Jesus sê, maar as dit nooit begin verander hoe jy leef nie, bly dit net kennis.

Jesus noem die mens wat Sy woorde hoor en dit doen wys.

Hoekom?

Omdat gehoorsaamheid vandag bou aan die fondament waarop jy môre gaan staan.

Die huis op die rots het nie minder storms gekry nie.

Jesus belowe nie dat gehoorsaamheid jou van swaarkry sal spaar nie.

Die storm het albei getref.

Maar die storm het gewys waarop elke huis reeds gebou was.

JY BOU NIE JOU FONDAMENT WANNEER DIE STORM BEGIN NIE. JY ONTDEK IN DIE STORM WAAROP JY REEDS GEBOU HET.

Wanneer alles goed gaan, kan baie dinge sterk lyk.

Jou geld.

Jou werk.

Mense se goedkeuring.

Jou eie planne.

Selfs jou gevoelens.

Maar wanneer iets skielik wegval, begin jy sien waarop jou lewe werklik rus.

Daarom is die vraag nie net:

“Wat weet ek van Jesus?”

nie.

Die vraag is:

“Wat doen ek met wat Jesus reeds vir my gesê het?”

Wanneer Jesus jou leer om te vergewe, om Hom te vertrou in plaas van deur bekommernis beheer te word, en om God se Koninkryk eerste te stel, is die vraag nie net of jy daarmee saamstem nie.

Die vraag is of dit begin wys in hoe jy leef.

Want elke keer wat jy Jesus gehoorsaam, bou jy verder op die rots.

En wanneer die storm kom, sal dit nie jou fondament skep nie.

Dit sal openbaar waarop jy reeds gebou het.

OM JESUS TE HOOR GEE JOU DIE WAARHEID. OM HOM TE GEHOORSAAM BOU JOU LEWE DAAROP.

Vader, wys my waar ek U Woord hoor, maar dit nog nie uitleef nie. Help my om nie net te weet wat Jesus sê nie, maar dit te doen. Bou my lewe op ’n fondament wat sal bly staan wanneer die storms kom. Amen.`

/* ── Die vyf dae ── */

const DAG1 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Matteus 7:24–27',
  },
  {
    soort: 'boodskap',
    kop: 'LEES VANDAG SE BOODSKAP',
    lyf: DAG1_BOODSKAP,
  },
  {
    soort: 'vraag',
    id: 'doen1',
    kop: 'VRAAG',
    lyf: 'Wat het Jesus jou reeds geleer wat jy weet jy moet begin doen?',
    prompt: 'Skryf dit hier neer…',
  },
  /* §40: die brug na die groep kom NÁ die hoofboodskap. */
  { soort: 'groepbrug', netGroep: true },
  { soort: 'wallpaper', bronVeld: 'wallpaperDag1', kop: 'HOU DIT VOOR JOU' },
]

const DAG2 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Matteus 7:24',
    lyf: 'Jesus sê die wyse mens hoor Sy woorde en doen wat Hy sê.',
  },
  {
    soort: 'teks',
    kop: 'HOOR IS NIE GENOEG NIE',
    lyf: 'Jy kan weet wat Jesus sê en steeds kies om niks daarmee te doen nie.\n\n'
       + 'Jesus noem die mens wys wat luister en gehoorsaam.\n\n'
       + 'WYSHEID BEGIN WANNEER JESUS SE WOORDE BEGIN WYS IN HOE JY LEEF.',
  },
  {
    soort: 'vraag',
    id: 'uitstel2',
    kop: 'VRAAG',
    lyf: 'Wat weet jy is reg, maar stel jy nog uit om te doen?',
    prompt: 'Skryf dit hier neer…',
  },
  {
    soort: 'gebed',
    lyf: 'Vader, help my om nie net te hoor nie, maar om te doen wat Jesus sê. Amen.',
  },
]

const DAG3 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Matteus 7:26–27',
    lyf: 'Die tweede man hoor ook wat Jesus sê, maar hy doen dit nie.',
  },
  {
    soort: 'teks',
    kop: 'DIE STORM WYS DIE VERSKIL',
    lyf: 'Voor die storm was dit nog nie duidelik wat sou gebeur nie.\n\n'
       + 'Maar toe die storm kom, het die verskil gewys.\n\n'
       + 'Jesus sê iemand wat Sy woorde hoor maar dit nie doen nie, is soos iemand '
       + 'wat sy huis op sand bou.\n\n'
       + 'NIE ALLES WAAROP JY KAN BOU, SAL JOU DRA WANNEER DIE STORM KOM NIE.',
  },
  {
    soort: 'vraag',
    id: 'vertrou3',
    kop: 'VRAAG',
    lyf: 'Waarop vertrou jy soms meer as op wat Jesus sê?',
    prompt: 'Skryf dit hier neer…',
  },
  {
    soort: 'gebed',
    lyf: 'Vader, wys my waar ek op dinge vertrou wat nie kan hou nie. Help my om my '
       + 'lewe op Jesus se woorde te bou. Amen.',
  },
]

const DAG4 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Matteus 7:25, 27',
    lyf: 'Dieselfde storm tref albei huise.\n\n'
       + 'Die een bly staan.\n\n'
       + 'Die ander val.',
  },
  {
    soort: 'teks',
    kop: 'STORMS KOM',
    lyf: 'Jesus sê nie die huis op die rots kry geen storm nie.\n\n'
       + 'Albei huise word getref.\n\n'
       + 'Die verskil is waarop hulle gebou is.\n\n'
       + 'Moeilike tye wys dikwels waarop ons werklik vertrou.\n\n'
       + 'DIE STORM BOU NIE JOU FONDAMENT NIE. DIT WYS WAAROP JY REEDS STAAN.',
  },
  {
    soort: 'vraag',
    id: 'storm4',
    kop: 'VRAAG',
    lyf: 'Wat wys moeilike tye oor waarop jy vertrou?',
    prompt: 'Skryf dit hier neer…',
  },
  {
    soort: 'gebed',
    lyf: 'Vader, help my om nie my veiligheid te soek in dinge wat kan wegval nie. '
       + 'Leer my om op Jesus se woorde te bou. Amen.',
  },
]

const DAG5 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Lukas 6:46–49',
    lyf: 'Jesus vra:\n\n'
       + '“Waarom noem julle My ‘Here, Here!’ maar julle doen nie wat Ek sê nie?”',
  },
  {
    soort: 'teks',
    kop: 'GEHOORSAAMHEID WORD PRAKTIES',
    lyf: 'Jesus se woorde is nie net bedoel om te hoor en te bewonder nie.\n\n'
       + 'Hy roep ons om dit te doen.\n\n'
       + 'Begin met wat Hy reeds vir jou duidelik gemaak het.\n\n'
       + 'MOENIE NET VRA: “WAT HET EK GELEER?” NIE. VRA: “WAT GAAN EK NOU DOEN?”',
  },
  {
    /* 'n Herinnering en 'n keuse — die SKRYF kom in die volgende blok. */
    soort: 'teks',
    kop: 'KYK TERUG',
    lyf: 'Hierdie week het jy gevra:\n\n'
       + '“Wat doen ek met wat Jesus reeds vir my gesê het?”\n\n'
       + 'Kies nou een ding waarin jy Hom gaan gehoorsaam.',
  },
  {
    soort: 'vraag',
    id: 'stap5',
    kop: 'JOU VOLGENDE STAP',
    lyf: 'Skryf een eenvoudige stap neer.\n\n'
       + 'Wat gaan jy doen?\n\n'
       + 'Doen dit.',
    prompt: 'Skryf dit hier neer…',
  },
  {
    soort: 'gebed',
    lyf: 'Vader, gee my moed om te doen wat Jesus sê. Help my om my lewe op Sy '
       + 'woorde te bou en nie net ’n hoorder te wees nie. Amen.',
  },
  { soort: 'wallpaper', bronVeld: 'wallpaper', kop: 'HOU DIT VOOR JOU' },
]

export const WEEK13_DAE = [
  {
    n: 1, titel: 'Twee huise. Een storm.', merk: 'TWEE HUISE',
    knop: 'KLAAR VIR VANDAG',
    klaarKop: 'DAG 1 KLAAR.',
    klaarLyf: 'Die verskil tussen die twee huise was nie wie Jesus gehoor het nie. '
            + 'Dit was wie gedoen het wat Hy sê.',
    blokke: DAG1,
  },
  {
    n: 2, titel: 'Hoor én doen', merk: 'HOOR ÉN DOEN',
    knop: 'KLAAR VIR VANDAG',
    klaarKop: 'DAG 2 KLAAR.',
    klaarLyf: 'Wysheid begin wanneer Jesus se woorde begin wys in hoe jy leef.',
    blokke: DAG2,
  },
  {
    n: 3, titel: 'Bou jy op sand?', merk: 'OP SAND',
    knop: 'KLAAR VIR VANDAG',
    klaarKop: 'DAG 3 KLAAR.',
    klaarLyf: 'Nie alles waarop jy kan bou, sal jou dra wanneer die storm kom nie.',
    blokke: DAG3,
  },
  {
    n: 4, titel: 'Die storm wys waarop jy staan', merk: 'DIE STORM',
    knop: 'KLAAR VIR VANDAG',
    klaarKop: 'DAG 4 KLAAR.',
    klaarLyf: 'Die storm bou nie jou fondament nie. Dit wys waarop jy reeds staan.',
    blokke: DAG4,
  },
  {
    n: 5, titel: 'Doen wat Jesus sê', merk: 'DOEN WAT HY SÊ',
    knop: 'VOLTOOI WEEK 13',
    klaarKop: 'WEEK 13 KLAAR.',
    klaarLyf: 'Moenie net vra: “Wat het ek geleer?” nie. Vra: “Wat gaan ek nou '
            + 'doen?”',
    blokke: DAG5,
  },
]

/* Wat aan die einde van die week teruggewys word. Net wat werklik geskryf is:
   wat sy moet begin doen, wat sy uitstel, en die stap wat sy gekies het. */
export const WEEK13_REIS = [
  { id: 'doen1',    kop: 'Aan die begin van hierdie week het jy geskryf wat Jesus jou reeds geleer het wat jy moet begin doen:' },
  { id: 'uitstel2', kop: 'Daarna het jy geskryf wat jy weet reg is, maar nog uitstel:' },
  { id: 'stap5',    kop: 'En vandag het jy die een stap neergeskryf wat jy gaan doen:' },
]

/* Die klaar-skerm se eie woorde — Dewald se "EINDE VAN WEEK 13". */
export const WEEK13_KLAAR = {
  kop: 'WAAROP BOU JY?',
  lyf: 'Albei mense het Jesus gehoor.\n\n'
     + 'Albei het gebou.\n\n'
     + 'Albei het ’n storm gekry.\n\n'
     + 'Maar net een het gedoen wat Jesus sê.\n\n'
     + 'Die belangrikste vraag is dus nie hoeveel jy weet nie.\n\n'
     + 'Dit is:\n\n'
     + 'WAT DOEN JY MET WAT JESUS VIR JOU SÊ?',
}

/* Die deelbare kaart aan die einde — Dewald se "DIE EEN SIN OM SAAM TE DRA",
   in die gewone skryfwyse van die ander weke se deelsinne. Dieselfde woorde. */
export const WEEK13_DEELSIN =
  'Die verskil was nie wie Jesus gehoor het nie. Die verskil was wie gedoen het '
  + 'wat Hy sê.'

/* ── Die brug na Week 14 ──
 *
 * `null` totdat Dewald Week 14 stuur. 'n Brug wat 'n titel VOORSPEL, is 'n
 * belofte wat ons nie kan hou nie. Sien CLAUDE.md se "Om 'n WEEK by te voeg". */
export const WEEK13_VOLGENDE = null

export function blokkeVirDag13(n) {
  const dag = WEEK13_DAE.find(d => d.n === n)
  return dag ? dag.blokke : []
}

/* Geen opname hierdie week, dus geen transkripsie nie. */
export const WEEK13_TRANSKRIPSIE = ''

/* ── Die groepsessie — Dewald se "VIR DIE GROEP" ── */
export const WEEK13_SESSIE = {
  titel: 'Twee huise. Een storm.',
  skrifte: ['Matteus 7:24–27'],
  vrae: [
    'Waarom is dit moontlik om Jesus se woorde te hoor sonder om daarvolgens te leef?',
    'Wat is die verskil tussen om iets te weet en om dit te doen?',
    'Wat kan moeilike tye wys oor waarop ons vertrou?',
    'Wat is een ding wat Jesus jou reeds geleer het wat jy hierdie week kan begin doen?',
  ],
  gebed:
    'Vader, help ons om nie net te hoor wat Jesus sê nie, maar dit te doen. Wys ons '
    + 'waar ons op ander dinge vertrou. Leer ons om Jesus te gehoorsaam en ons lewe '
    + 'op Sy woorde te bou. Amen.',
}
