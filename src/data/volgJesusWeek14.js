/* ────────────────────────────────────────────────────────────
   VOLG JESUS — WEEK 14: "EK IS DIE GOEIE HERDER"

   Dewald het die week op 13 November 2026 voluit gestuur. Dit is 'n NUWE week:
   daar was geen Week 14 voor hierdie een nie (die les van Week 8: kyk eers —
   sien CLAUDE.md).

   Dag 1 se boodskap staan hier PRESIES soos hy dit gegee het: *"Gebruik
   Dewald se Dag 1-boodskap presies soos dit hierbo staan. Moenie enige woord
   verander nie… of taalversorging daarop doen nie."* Sy woorde op Dag 2 tot 5
   staan ook so.

   ── GEEN STEMBOODSKAP ──

   *"Daar is GEEN stemnota, audio of klankspeler in Week 14 nie."* Dag 1 se
   hoofboodskap is dus 'n `boodskap`-blok, oop en nie toegevou nie, en
   `geskreweBoodskap: true` op die plat rekord.

   ── DAG 1 ──

   Die gedeelte (Johannes 10:1–18) staan direk onder die titel, sonder 'n
   leesreël; die LEES-blok dra net die verwysing. Die boodskap EINDIG met die
   gebed ("Vader, dankie dat Jesus die Goeie Herder is… Amen."), soos Week 10
   tot 13 s'n; daar is dus geen aparte gebed-blok op Dag 1 nie.

   ── DIE PERKE ──

   Vyf inhoudsblokke per dag en hoogstens twee skryfkassies:

     · Dag 1: LEES, die boodskap, die vraag;
     · Dag 2–4: LEES, die teks, die vraag, die gebed;
     · Dag 5: LEES, die teks, KYK TERUG, JOU VOLGENDE STAP, die gebed.

   Soos Week 12: "KYK TERUG" eindig met 'n VRAAG ("Vertrou ek die Herder genoeg
   om Hom te volg?") en is dus die skryfkassie; "JOU VOLGENDE STAP" is 'n
   opdrag ("Kies… Bid daaroor… En volg…") en dus 'n teksblok.

   ── DIE AANHALINGS ──

   Al die gedeeltes is teen die egte public/gab/ nagegaan en bestaan. Dewald se
   aanhalings is sy EIE bewoording en nie die GAB s'n nie — bv. Johannes 10:14
   (GAB: "Ek is die goeie herder, en ken my skape, en word geken deur die
   myne") en 10:11 (GAB: "die goeie herder gee sy lewe vir die skape"). Sy
   woorde staan onveranderd; hy is daarop gewys.

   ── DIE TWEE WALLPAPERS ──

   Dewald laai hulle self op. `wallpaperDag1` sluit Dag 1 af, `wallpaper` sluit
   die week af op Dag 5.
   ──────────────────────────────────────────────────────────── */

/* ── Die openingsblad — Dewald se "BEGIN VAN DIE WEEK" ── */
export const WEEK14_OPENING =
  'Jesus beskryf Homself as die Goeie Herder.\n\n'
  + 'Hy ken Sy skape.\n\n'
  + 'Hy gaan voor hulle uit.\n\n'
  + 'Hy loop nie weg wanneer gevaar kom nie.\n\n'
  + 'En Hy lê Sy lewe vir hulle af.'

/* ── Dag 1 se hoofboodskap ──
 *
 * Dewald: "Gebruik Dewald se Dag 1-boodskap presies soos dit hierbo staan." */
const DAG1_BOODSKAP = `Jesus sê:

“Ek is die Goeie Herder.”

Dit beteken Hy staan nie net op ’n afstand en wys vir jou waarheen jy moet gaan nie.

Hy ken Sy skape, Hy roep hulle, en hulle leer om Sy stem te herken.

Jesus sê:

“Ek ken my skape en my skape ken My.”

Dit is meer as net kennis van God.

Dit is verhouding.

Die Goeie Herder ken jou nie net wanneer jy sterk is nie. Hy ken jou ook wanneer jy bang, onseker of moeg is.

Hy ken jou, en Hy roep jou om Hom te volg.

JESUS WIL NIE NET VIR JOU DIE PAD WYS NIE. HY WIL JOU LEI.

Dan vergelyk Jesus Homself met iemand wat net betaal word om na die skape te kyk.

Wanneer die wolf kom, hardloop daardie persoon weg, omdat die skape nie aan hom behoort nie.

Maar Jesus sê:

“Ek is die Goeie Herder.”

Hy loop nie weg wanneer dit gevaarlik raak nie.

Hy verlaat jou nie wanneer die lewe moeilik word nie.

Die gevaar verdwyn nie altyd nie, maar die Herder verdwyn ook nie.

En dan sê Jesus iets wat hierdie hele gedeelte verander:

“Die goeie herder lê sy lewe af vir die skape.”

’n Herder beskerm gewoonlik die skape.

Maar Jesus gaan verder.

Hy gee Sy eie lewe vir hulle.

In vers 18 maak Hy dit baie duidelik:

Niemand neem Sy lewe van Hom af nie.

Hy lê dit self af.

Die kruis was dus nie iets wat Jesus onverwags oorgekom het nie.

Hy het Sy lewe gewillig gegee.

Dít wys hoe ver die Goeie Herder bereid was om vir Sy skape te gaan.

Jesus sê ook:

“Ek het gekom sodat hulle lewe kan hê, en dit in oorvloed.”

Die dief kom om te steel, te slag en te vernietig.

Jesus kom om lewe te gee.

En dan sê Jesus iets belangriks oor leiding:

Die Herder gaan voor die skape uit, en hulle volg Hom omdat hulle Sy stem ken.

Jy hoef dus nie die hele pad vooruit te kan sien nie.

Jy moet die Herder ken.

So vra jouself vandag:

“Volg ek Jesus, of probeer ek nog alles self beheer?”

DIE GOEIE HERDER GEE JOU NIE NET RIGTING NIE. HY GAAN VOOR JOU UIT.

Vader, dankie dat Jesus die Goeie Herder is. Help my om Sy stem te leer ken, Hom te vertrou wanneer ek nie die hele pad kan sien nie, en Hom te volg waar Hy my lei. Dankie dat Hy nie wegloop wanneer dit moeilik raak nie en dat Hy Sy lewe vir my gegee het. Amen.`

/* ── Die vyf dae ── */

const DAG1 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Johannes 10:1–18',
  },
  {
    soort: 'boodskap',
    kop: 'LEES VANDAG SE BOODSKAP',
    lyf: DAG1_BOODSKAP,
  },
  {
    soort: 'vraag',
    id: 'beheer1',
    kop: 'VRAAG',
    lyf: 'Waar probeer jy nog self beheer neem in plaas daarvan om Jesus te volg?',
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
    skrif: 'Johannes 10:14',
    lyf: 'Jesus sê:\n\n“Ek ken my skape en my skape ken My.”',
  },
  {
    soort: 'teks',
    kop: 'JY IS NIE ONBEKEND AAN HOM NIE',
    lyf: 'Jesus praat nie van ’n ver verhouding nie.\n\n'
       + 'Hy ken Sy skape.\n\n'
       + 'En Sy skape leer Hom ken.\n\n'
       + 'Die Christelike lewe gaan dus nie net oor hoeveel jy van Jesus weet nie.\n\n'
       + 'Dit gaan daaroor dat jy Hom volg.\n\n'
       + 'JESUS KEN JOU EN HY ROEP JOU OM HOM TE VOLG.',
  },
  {
    soort: 'vraag',
    id: 'ken2',
    kop: 'VRAAG',
    lyf: 'Ken jy Jesus net deur wat jy van Hom gehoor het, of groei jy werklik in jou '
       + 'verhouding met Hom?',
    prompt: 'Skryf dit hier neer…',
  },
  {
    soort: 'gebed',
    lyf: 'Vader, help my om Jesus beter te leer ken en Hom elke dag te volg. Amen.',
  },
]

const DAG3 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Johannes 10:3–4',
    lyf: 'Jesus sê die skape volg die herder omdat hulle sy stem ken.',
  },
  {
    soort: 'teks',
    kop: 'VOLG DIE STEM WAT JY KEN',
    lyf: 'Daar is baie stemme wat jou aandag wil hê.\n\n'
       + 'Vrees.\n\n'
       + 'Mense se opinies.\n\n'
       + 'Jou eie onsekerheid.\n\n'
       + 'Maar Jesus sê Sy skape ken Sy stem en volg Hom.\n\n'
       + 'Hoe beter jy Jesus se woorde ken, hoe beter leer jy wat by Sy stem pas.\n\n'
       + 'JY KAN NIE ’N STEM VOLG WAT JY NOOIT LEER KEN NIE.',
  },
  {
    soort: 'vraag',
    id: 'stem3',
    kop: 'VRAAG',
    lyf: 'Watter stem kry tans die meeste invloed in jou lewe?',
    prompt: 'Skryf dit hier neer…',
  },
  {
    soort: 'gebed',
    lyf: 'Vader, help my om Jesus se woorde te ken en Hom bo ander stemme te volg. Amen.',
  },
]

const DAG4 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Johannes 10:11–13',
    lyf: 'Wanneer die wolf kom, hardloop die persoon wat net betaal word om na die '
       + 'skape te kyk weg.\n\n'
       + 'Jesus doen nie.',
  },
  {
    soort: 'teks',
    kop: 'DIE HERDER BLY',
    lyf: 'Jesus sê:\n\n'
       + '“Ek is die Goeie Herder.”\n\n'
       + 'Hy beskryf Homself as die Een wat Sy skape nie verlaat wanneer gevaar kom '
       + 'nie.\n\n'
       + 'Die lewe raak nie altyd maklik nie.\n\n'
       + 'Maar Jesus verander nie wanneer die omstandighede verander nie.\n\n'
       + 'DIE GEVAAR KAN KOM. DIE GOEIE HERDER LOOP NIE WEG NIE.',
  },
  {
    soort: 'vraag',
    id: 'verlaat4',
    kop: 'VRAAG',
    lyf: 'Waar moet jy vandag onthou dat Jesus jou nie verlaat het nie?',
    prompt: 'Skryf dit hier neer…',
  },
  {
    soort: 'gebed',
    lyf: 'Vader, dankie dat Jesus die Goeie Herder is. Help my om Hom te vertrou '
       + 'wanneer ek bang of onseker is. Amen.',
  },
]

const DAG5 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Johannes 10:11, 17–18',
    lyf: 'Jesus sê:\n\n“Die goeie herder lê sy lewe af vir die skape.”',
  },
  {
    soort: 'teks',
    kop: 'DIE HERDER GEE HOMSELF',
    lyf: 'Jesus sê niemand neem Sy lewe van Hom af nie.\n\n'
       + 'Hy lê dit self af.\n\n'
       + 'Die kruis was ’n vrywillige daad van liefde.\n\n'
       + 'Die Herder wat jou lei, is dieselfde Herder wat Sy lewe vir jou gegee het.\n\n'
       + 'DIE GOEIE HERDER HET NIE NET GESÊ HY HET JOU LIEF NIE. HY HET SY LEWE GEGEE.',
  },
  {
    soort: 'vraag',
    id: 'vertrou5',
    kop: 'KYK TERUG',
    lyf: 'Hierdie week het jy gesien:\n\n'
       + 'Jesus ken jou.\n\n'
       + 'Hy gaan voor jou uit.\n\n'
       + 'Hy loop nie weg wanneer gevaar kom nie.\n\n'
       + 'Hy het Sy lewe vir jou gegee.\n\n'
       + 'Vra nou:\n\n'
       + 'Vertrou ek die Herder genoeg om Hom te volg?',
    prompt: 'Skryf dit hier neer…',
  },
  {
    /* 'n Opdrag, nie 'n vraag nie — daar is niks om te skryf nie. */
    soort: 'teks',
    kop: 'JOU VOLGENDE STAP',
    lyf: 'Kies een area waarin jy ophou om alles self te probeer beheer.\n\n'
       + 'Bid daaroor.\n\n'
       + 'En volg wat Jesus reeds vir jou duidelik gemaak het.',
  },
  {
    soort: 'gebed',
    lyf: 'Vader, dankie vir die Goeie Herder wat Sy lewe vir my gegee het. Help my om '
       + 'Jesus te vertrou en Hom te volg, selfs wanneer ek nie die hele pad kan sien '
       + 'nie. Amen.',
  },
  { soort: 'wallpaper', bronVeld: 'wallpaper', kop: 'HOU DIT VOOR JOU' },
]

export const WEEK14_DAE = [
  {
    n: 1, titel: 'Ek is die Goeie Herder', merk: 'DIE GOEIE HERDER',
    knop: 'KLAAR VIR VANDAG',
    klaarKop: 'DAG 1 KLAAR.',
    klaarLyf: 'Jesus wil nie net vir jou die pad wys nie. Hy wil jou lei.',
    blokke: DAG1,
  },
  {
    n: 2, titel: 'Hy ken jou', merk: 'HY KEN JOU',
    knop: 'KLAAR VIR VANDAG',
    klaarKop: 'DAG 2 KLAAR.',
    klaarLyf: 'Jesus ken jou en Hy roep jou om Hom te volg.',
    blokke: DAG2,
  },
  {
    n: 3, titel: 'Leer Sy stem ken', merk: 'SY STEM',
    knop: 'KLAAR VIR VANDAG',
    klaarKop: 'DAG 3 KLAAR.',
    klaarLyf: 'Jy kan nie ’n stem volg wat jy nooit leer ken nie.',
    blokke: DAG3,
  },
  {
    n: 4, titel: 'Hy loop nie weg nie', merk: 'DIE HERDER BLY',
    knop: 'KLAAR VIR VANDAG',
    klaarKop: 'DAG 4 KLAAR.',
    klaarLyf: 'Die gevaar kan kom. Die Goeie Herder loop nie weg nie.',
    blokke: DAG4,
  },
  {
    n: 5, titel: 'Hy het Sy lewe gegee', merk: 'SY LEWE GEGEE',
    knop: 'VOLTOOI WEEK 14',
    klaarKop: 'WEEK 14 KLAAR.',
    klaarLyf: 'Die Goeie Herder het nie net gesê Hy het jou lief nie. Hy het Sy lewe '
            + 'gegee.',
    blokke: DAG5,
  },
]

/* Wat aan die einde van die week teruggewys word. Net wat werklik geskryf is:
   waar sy nog self wil beheer, hoe sy Jesus ken, en of sy Hom vertrou. */
export const WEEK14_REIS = [
  { id: 'beheer1',  kop: 'Aan die begin van hierdie week het jy geskryf waar jy nog self beheer probeer neem:' },
  { id: 'stem3',    kop: 'Daarna het jy geskryf watter stem die meeste invloed in jou lewe kry:' },
  { id: 'vertrou5', kop: 'En vandag het jy geantwoord of jy die Herder genoeg vertrou om Hom te volg:' },
]

/* Die klaar-skerm se eie woorde — Dewald se "EINDE VAN WEEK 14". */
export const WEEK14_KLAAR = {
  kop: 'VOLG DIE HERDER',
  lyf: 'Hierdie week het Jesus Homself aan ons gewys as die Goeie Herder.\n\n'
     + 'Hy ken Sy skape.\n\n'
     + 'Hulle leer Sy stem ken.\n\n'
     + 'Hy gaan voor hulle uit.\n\n'
     + 'Hy loop nie weg wanneer gevaar kom nie.\n\n'
     + 'En Hy lê Sy lewe vir hulle af.\n\n'
     + 'Die vraag is dus nie net:\n\n'
     + '“Ken Jesus my?”\n\n'
     + 'nie.\n\n'
     + 'Die vraag is:\n\n'
     + '“VOLG EK HOM?”',
}

/* Die deelbare kaart aan die einde — Dewald se "DIE EEN SIN OM SAAM TE DRA",
   in die gewone skryfwyse van die ander weke se deelsinne. Dieselfde woorde. */
export const WEEK14_DEELSIN =
  'Jy hoef nie die hele pad te sien nie. Jy moet die Herder volg.'

/* ── Die brug na Week 15 ──
 *
 * `null` totdat Dewald Week 15 stuur. 'n Brug wat 'n titel VOORSPEL, is 'n
 * belofte wat ons nie kan hou nie. Sien CLAUDE.md se "Om 'n WEEK by te voeg". */
export const WEEK14_VOLGENDE = null

export function blokkeVirDag14(n) {
  const dag = WEEK14_DAE.find(d => d.n === n)
  return dag ? dag.blokke : []
}

/* Geen opname hierdie week, dus geen transkripsie nie. */
export const WEEK14_TRANSKRIPSIE = ''

/* ── Die groepsessie — Dewald se "VIR DIE GROEP" ── */
export const WEEK14_SESSIE = {
  titel: 'Ek is die Goeie Herder',
  skrifte: ['Johannes 10:1–18'],
  vrae: [
    'Wat beteken dit vir jou dat Jesus sê Hy ken Sy skape?',
    'Hoe leer ons Jesus se stem beter ken?',
    'Wat leer die verskil tussen Jesus en die persoon wat wegloop wanneer die wolf kom vir ons?',
    'Waar vind jy dit tans moeilik om Jesus te vertrou en te volg?',
  ],
  gebed:
    'Vader, dankie dat Jesus die Goeie Herder is. Help ons om Sy stem te leer ken, Hom '
    + 'te vertrou en Hom te volg. Dankie dat Hy nie wegloop wanneer dinge moeilik raak '
    + 'nie en dat Hy Sy lewe vir ons gegee het. Amen.',
}
