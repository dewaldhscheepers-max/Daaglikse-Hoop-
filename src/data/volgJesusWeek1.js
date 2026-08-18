/* ── VOLG JESUS · WEEK 1 — "Wie sê jý is Jesus?" ──
 *
 * Dit vervang die vorige Week 1 VOLLEDIG. Dewald: "Hierdie dokument vervang
 * die vorige Week 1 volledig. Moenie enige ou Week 1-inhoud, ou stemboodskap,
 * YouTube-video of vorige transkripsie met hierdie weergawe meng nie."
 *
 * ── Waarom die week hier staan en nie net in Firestore nie ──
 *
 * Die ou weke was 'n handjievol plat velde — `dag2Prompt`, `dag4Vraag` — en
 * die skerm het hulle in 'n vaste uitleg gegiet. Hierdie week is nie so 'n
 * ding nie. Dit is 'n PAD: lees → luister → reageer → bid → voltooi, een
 * skerm op 'n slag, met takke (Dag 3 wys net die area wat 'n mens kies) en met
 * 'n oomblik waar die app 'n mens sy eie woorde van Dag 1 teruggee.
 *
 * Daardie vorm pas nie in plat velde nie. Dit is 'n LYS STAPPE, en dit staan
 * in kode omdat Dewald die teks skryf en ek dit inbou — presies soos die res
 * van die bron in volgJesusWeke.js.
 *
 * Die admin bly werk: die week se plat rekord (titel, skrif, kontroles,
 * `gepubliseer`) staan steeds in Firestore en die publiseer-hek is onaangeraak.
 * Wat verander is wat die GEBRUIKER sien.
 *
 * ── Geen video ──
 *
 * Daar is geen YouTube vir hierdie week nie. Die hoofboodskap is 'n
 * STEMBOODSKAP wat in die app self speel, met die transkripsie toegevou.
 * `stemboodskapUrl` kom uit die admin; is dit leeg, sê die skerm dit eerlik in
 * plaas daarvan om 'n dooie speler te wys.
 *
 * ── Wat 'n mens hier skryf, bly op sy foon ──
 *
 * Elke `id` hieronder is 'n private antwoord. Dit word outomaties gestoor, dit
 * gaan nooit oor die netwerk nie, en geen groep, fasiliteerder of kerk-admin
 * kan daaraan kom nie — daar is niks om aan te kom nie. Sien
 * `antwoordSleutel` in VolgJesusStap.jsx.
 *
 * Suiwer data. Geen `window`, geen netwerk.
 */

/* ── Die stappe ──
 *
 * Elke stap is EEN skerm met EEN primêre knoppie. Dewald: "Moenie 'n hele dag
 * as een lang dokument op een skerm wys nie."
 *
 * soort:
 *   teks       — woorde en 'n knoppie
 *   lees       — 'n Skrifgedeelte, met 'n knoppie na die app se Bybel
 *   stem       — die week se stemboodskap, met die transkripsie toegevou
 *   hou        — HOU DIT VAS: die een sin wat moet bly
 *   vraag      — 'n private antwoord (een of meer velde)
 *   keuse      — 'n keuse wat gestoor word en later die taal aanpas
 *   spieel     — Dag 3: kies EEN area, en dan wys ons net daardie een
 *   bid        — 'n gebed, met 'n knoppie wat niks meet nie
 *   terugblik  — wys 'n mens sy EIE vroeëre antwoord terug
 *   reis       — die week se antwoorde langs mekaar
 */

export const WEEK1_TITEL = 'Wie sê jý is Jesus?'

/* Die eerste skerm, voor Dag 1. Dit vra waar iemand vandag staan, en daardie
   keuse pas Dag 5 se taal aan. Dit blokkeer niks en dit word nêrens gestuur
   nie. */
export const BEGINPUNT = {
  id: 'beginpunt',
  kop: 'WAAR BEGIN JY VANDAG?',
  lyf: 'Kies die antwoord wat die naaste aan jou werklikheid is. Daar is nie ’n verkeerde antwoord nie.',
  keuses: [
    {
      waarde: 'lank',
      woorde: 'Ek volg Jesus al lank',
      antwoord: 'Geen dissipel groei ooit verby die behoefte om weer na Jesus te kyk nie. Hierdie week vra nie dat jy moet vergeet wat jy reeds weet nie. Dit nooi jou om Hom weer met oop oë te sien.',
    },
    {
      waarde: 'leer',
      woorde: 'Ek leer Jesus nog ken',
      antwoord: 'Jy hoef nie alles reeds te verstaan nie. Begin net by die Evangelies en kyk eerlik na Wie Jesus is.',
    },
    {
      waarde: 'onseker',
      woorde: 'Ek weet nog nie of ek glo nie',
      antwoord: 'Dankie dat jy eerlik is. Jy hoef nie geestelik te klink of ’n antwoord voor te gee nie. Hou net aan om saam met ons na Jesus te kyk.',
    },
  ],
  knop: 'BEGIN DAG 1',
}

const DAG1 = [
  {
    soort: 'lees',
    kop: 'LEES EERS',
    skrif: 'Matteus 16:13–17',
    lyf: 'Moenie haastig lees nie. Let op hoe Jesus die vraag persoonlik maak.\n\nEers vra Hy: “Wie sê die mense is die Seun van die mens?”\n\nDaarna: “Maar julle, wie sê julle is Ek?”\n\nHou daardie vraag in jou gedagtes terwyl jy luister.',
    knop: 'EK HET GELEES',
  },
  {
    soort: 'stem',
    kop: 'DIE WEEK SE STEMBOODSKAP',
    titel: 'Wie sê jý is Jesus?',
    knop: 'GAAN AAN MET DAG 1',
  },
  {
    soort: 'vraag',
    kop: 'WAT HET JOU GETREF?',
    lyf: 'Was daar iets wat jy vandag anders raakgesien het? Het jy ’n vraag? Of het iets jou uitgedaag?',
    velde: [{ id: 'getref', prompt: 'Skryf dit hier neer…' }],
    knop: 'GAAN AAN MET DAG 1',
    /* Hierdie een mag leeg bly. Dit is 'n uitnodiging, nie 'n hek nie —
       iemand wat vandag niks wil skryf nie, moet steeds kan aangaan. */
    magOorslaan: true,
    /* En hy kan die boodskap vir iemand aanstuur. Dit is die enigste deel van
       die week wat BUITE die app gaan. */
    deelStem: true,
  },
  {
    soort: 'hou',
    lyf: 'Iemand anders kan jou van Jesus vertel.\nNiemand anders kan Hom namens jou volg nie.',
    knop: 'GAAN AAN',
  },
  {
    soort: 'vraag',
    kop: 'WEES EERLIK',
    lyf: 'Hierdie antwoord is privaat. Jy hoef nie geestelik te klink nie. Skryf net wat waar is.',
    velde: [{ id: 'dink', prompt: 'As ek heeltemal eerlik is, dink ek meestal aan Jesus as…' }],
    knop: 'STOOR MY ANTWOORD',
  },
  {
    soort: 'vraag',
    velde: [{ id: 'ontdek', prompt: 'Die ding wat ek die graagste oor Jesus wil ontdek, is…' }],
    knop: 'STOOR EN GAAN AAN',
  },
  {
    soort: 'lees',
    kop: 'VANDAG',
    skrif: 'Johannes 1:1–18',
    lyf: 'Vra: “Wat wys hierdie gedeelte vir my oor Jesus?”\n\nMoenie probeer om alles te verstaan nie. Soek net een ding.',
    knop: 'EK HET GELEES',
  },
  {
    soort: 'vraag',
    velde: [{ id: 'raakgesien1', prompt: 'Vandag het ek raakgesien dat Jesus…' }],
    knop: 'STOOR MY ANTWOORD',
  },
]

const DAG2 = [
  {
    soort: 'teks',
    kop: 'VANDAG SE BEGIN',
    lyf: 'Ons kom maklik na Jesus toe met wat ons nodig het. En ons mág.\n\nMaar vandag gaan jy vir ’n paar minute nie eerste vra: “Wat beteken dit vir my?” nie.\n\nJy gaan vra: wat sê Johannes vir my oor Jesus?',
    knop: 'BEGIN DAG 2',
  },
  {
    soort: 'lees',
    kop: 'LEES',
    skrif: 'Johannes 1:1–18',
    lyf: 'Lees stadig genoeg om die beskrywings van Jesus raak te sien.\n\nJohannes sê: “In die begin was die Woord.”\n\nHy sê: “Alles het deur Hom ontstaan.”\n\nHy praat van lewe, lig, genade en waarheid.\n\nEn dan: “Die Woord het mens geword en onder ons kom woon.”',
    knop: 'EK HET GELEES',
  },
  {
    soort: 'teks',
    kop: 'DINK HIERAAN',
    lyf: 'Ons kan so gewoond raak aan die Naam Jesus dat hierdie woorde gewoon begin klink. Maar dit is allesbehalwe gewoon.\n\nDie Een deur Wie alles ontstaan het, het nader gekom. Hy het mens geword. Hy het ons wêreld binnegekom.\n\nEn hier is iets om die hele program lank te onthou: moenie altyd eerste vra wat Jesus vir jou kan doen nie. Leer ook om net na Jesus te kyk.\n\nWant as jou verhouding met Jesus net bestaan uit “help my”, “gee my”, “maak dit reg”, “vat dit weg” — dan kan jy baie van Sy hand wil hê sonder om ooit Sy hart te leer ken.',
    knop: 'GAAN AAN',
  },
  {
    soort: 'hou',
    lyf: 'Voordat ek vra wat Jesus vir my kan doen,\nwil ek weer kyk na Wie Hy is.',
    knop: 'GAAN AAN',
  },
  {
    soort: 'vraag',
    kop: 'KYK NOU WEER',
    lyf: 'Gaan terug deur Johannes 1:1–18. Soek die beskrywings van Jesus wat jou aandag trek. Kies net een.',
    velde: [
      { id: 'sien2', prompt: 'Vandag sien ek dat Jesus…' },
      { id: 'hoekom2', prompt: 'Waarom trek dit my aandag?' },
    ],
    knop: 'STOOR MY ANTWOORD',
  },
  {
    soort: 'bid',
    kop: 'BID',
    gebed: 'Jesus,\n\nek kom so maklik na U toe met alles wat ek nodig het. En ek mag.\n\nMaar vandag wil ek net weer na U kyk.\n\nHelp my om U te leer ken vir Wie U is.\n\nAmen.',
    knop: 'EK HET GEBID',
  },
]

const DAG3_BASIS = [
  {
    soort: 'teks',
    kop: 'VANDAG SE BEGIN',
    lyf: 'Jy kan met jou mond sê: “Jesus is Here.” Maar soms vertel ons gewone lewe ’n ander storie.\n\nNie omdat ons doelbewus vals is nie. Ons almal het areas waarin ons nog moet groei.\n\nDaarom is vandag nie ’n dag vir skuld nie. Dit is ’n dag vir eerlikheid.\n\nJy kan nie groei vanuit die persoon wat jy voorgee om te wees nie. Jy kan net groei vanuit die plek waar jy werklik is.',
    fyn: 'Alles wat jy vandag skryf, bly privaat.',
    knop: 'BEGIN DIE SPIEËL',
  },
  {
    soort: 'spieel',
    id: 'area',
    kop: 'WAAR WIL JY VANDAG EERLIK KYK?',
    lyf: 'Moenie vyf dinge probeer regmaak nie. Kies net die area wat vandag die naaste aan jou werklike lewe is.',
    areas: [
      {
        waarde: 'bang', woorde: 'Wanneer ek bang is',
        vrae: [
          { id: 'a_bang1', prompt: 'My eerste reaksie is gewoonlik…' },
          { id: 'a_bang2', prompt: 'Hoe sou dit prakties lyk om Jesus juis hier te vertrou?' },
        ],
      },
      {
        waarde: 'geld', woorde: 'Wanneer ek oor geld stres',
        vrae: [
          { id: 'a_geld1', prompt: 'Ek begin gewoonlik…' },
          { id: 'a_geld2', prompt: 'Hoe sou dit prakties lyk om Jesus juis hier te volg?' },
        ],
      },
      {
        waarde: 'seer', woorde: 'Wanneer iemand my seermaak',
        vrae: [
          { id: 'a_seer1', prompt: 'My natuurlike reaksie is…' },
          { id: 'a_seer2', prompt: 'Wat sou dit beteken om Jesus in hierdie reaksie ernstig op te neem?' },
        ],
      },
      {
        waarde: 'besluit', woorde: 'Wanneer ek ’n groot besluit moet neem',
        vrae: [
          { id: 'a_besluit1', prompt: 'Na wie of wat luister ek eerste?' },
          { id: 'a_besluit2', prompt: 'Waar pas Jesus en Sy woorde werklik in my besluit?' },
        ],
      },
      {
        waarde: 'niemand', woorde: 'Wanneer niemand kyk nie',
        vrae: [
          { id: 'a_niemand1', prompt: 'Die area wat ek die maklikste vir Jesus probeer wegsteek, is…' },
          { id: 'a_niemand2', prompt: 'Hoe sou eerlikheid en gehoorsaamheid juis hier lyk?' },
        ],
      },
    ],
  },
]

const DAG3_SLOT = [
  {
    soort: 'nogArea',
    lyf: 'Jy kan nog ’n area ondersoek as jy wil. Dit is nooit nodig om Dag 3 te voltooi nie.',
    knop: 'GAAN AAN',
  },
  {
    soort: 'vraag',
    kop: 'DIE GROOT VRAAG',
    velde: [{ id: 'sigbaar', prompt: 'As Jesus werklik is Wie ek sê Hy is, waar behoort dit meer sigbaar in my lewe te word?' }],
    knop: 'STOOR EN GAAN AAN',
  },
  {
    soort: 'hou',
    lyf: 'Die vraag is nie net wat my mond oor Jesus sê nie.\nMy lewe wys ook wat ek werklik van Hom vertrou.',
    knop: 'GAAN AAN',
  },
  {
    soort: 'vraag',
    kop: 'VANDAG',
    lyf: 'Moenie vyf dinge probeer regmaak nie. Kies een volgende tree.',
    velde: [{ id: 'tree', prompt: 'My een volgende tree is…' }],
    knop: 'STOOR MY ANTWOORD',
  },
  {
    soort: 'bid',
    gebed: 'Jesus, leer my om U juis hier te vertrou en te volg. Amen.',
    knop: 'EK HET GEBID',
  },
]

const DAG4 = [
  {
    soort: 'lees',
    kop: 'LEES',
    skrif: 'Johannes 1:14–18',
    lyf: 'Let veral op: “vol genade en waarheid”.',
    knop: 'EK HET GELEES',
  },
  {
    soort: 'teks',
    kop: 'DINK HIERAAN',
    lyf: 'Daar is dele van Jesus waarvan ons maklik hou. Jesus wat troos. Jesus wat vergewe. Jesus wat help. Jesus wat sê: “Kom na My toe.”\n\nMaar dan lees jy verder, en dieselfde Jesus sê: “Volg My.”\n\nHy praat waarheid. Hy korrigeer. Hy konfronteer. Hy vra vrae wat mense ongemaklik maak.\n\nEn hier is die gevaar vir elkeen van ons: ons kan begin om ’n Jesus te vorm wat baie soos óns dink. Nie doelbewus nie. Maar stadig.\n\nEk hou van die dele waarmee ek saamstem. Ek ignoreer die dele wat my uitdaag. Ek wil hê Jesus moet my troos, maar miskien nie aan my humeur raak nie. My geld. My verhoudings. My trots. My gewoontes. Die manier waarop ek oor ander mense praat. Of die dinge wat ek doen wanneer niemand kyk nie.\n\nDaarom moet ons bereid wees om te vra: volg ek Jesus, of volg ek die weergawe van Jesus wat vir my die gemaklikste is?\n\nJohannes sê Jesus is vol genade én waarheid. Ons het albei nodig. Genade wanneer ons val. Waarheid wanneer ons verdwaal. Genade wat ons nader trek. Waarheid wat ons leer hoe om te leef.',
    knop: 'GAAN AAN',
  },
  {
    soort: 'hou',
    lyf: '’n Jesus wat jy self kan vorm,\nkan jou nooit vorm nie.',
    knop: 'GAAN AAN',
  },
  {
    soort: 'keuse',
    id: 'maklikste',
    kop: 'DIE SPIEËL',
    lyf: 'Wat is vir jou die maklikste om van Jesus te ontvang?',
    keuses: [
      { waarde: 'troos', woorde: 'Jesus wat my troos' },
      { waarde: 'help', woorde: 'Jesus wat my help' },
      { waarde: 'vergewe', woorde: 'Jesus wat my vergewe' },
      { waarde: 'lei', woorde: 'Jesus wat my lei' },
      { waarde: 'korrigeer', woorde: 'Jesus wat my korrigeer' },
      { waarde: 'roep', woorde: 'Jesus wat my roep om te verander' },
    ],
    knop: 'GAAN AAN',
  },
  {
    soort: 'keuse',
    id: 'moeilikste',
    lyf: 'En wat is vir jou die moeilikste om te ontvang?',
    keuses: [
      { waarde: 'troos', woorde: 'Jesus wat my troos' },
      { waarde: 'help', woorde: 'Jesus wat my help' },
      { waarde: 'vergewe', woorde: 'Jesus wat my vergewe' },
      { waarde: 'lei', woorde: 'Jesus wat my lei' },
      { waarde: 'korrigeer', woorde: 'Jesus wat my korrigeer' },
      { waarde: 'roep', woorde: 'Jesus wat my roep om te verander' },
    ],
    knop: 'GAAN AAN',
  },
  {
    soort: 'vraag',
    velde: [{ id: 'moeiliker', prompt: 'Waarom dink jy is dit moeiliker?' }],
    knop: 'STOOR MY ANTWOORD',
  },
  {
    soort: 'teks',
    kop: 'VANDAG',
    lyf: 'Wanneer iets uit Jesus se woorde jou ongemaklik maak, moenie onmiddellik vra: “Hoe kan ek dit laat pas by wat ek reeds dink?” nie.\n\nVra: is daar iets wat Jesus in mý denke wil verander?\n\nSit vir ’n oomblik stil.',
    knop: 'EK HET STILGERAAK',
  },
  {
    soort: 'bid',
    kop: 'BID',
    gebed: 'Jesus,\n\nek wil U nie vorm volgens wat vir my gemaklik is nie. Ek wil U leer ken soos U is.\n\nGee my nederigheid wanneer U my troos — en ook wanneer U my korrigeer.\n\nAmen.',
    knop: 'EK HET GEBID',
  },
]

/* Dag 5 se woorde hang af van waar iemand op die eerste skerm gesê het hy
   staan. Dit is die enigste plek waar daardie keuse gebruik word. */
const DAG5_INLEI = {
  lank: 'Jy volg Jesus al lank. Hierdie week het nie probeer om jou iets nuuts te leer wat jy nie geweet het nie — dit het jou gevra om weer te kyk.',
  leer: 'Jy is nog besig om Jesus te leer ken. Dit is nie ’n agterstand nie. Dit is presies waar elke dissipel begin.',
  onseker: 'Jy het aan die begin gesê jy weet nog nie of jy glo nie. Jy hoef vandag steeds nie voor te gee nie.',
}

const DAG5 = [
  {
    soort: 'teks',
    kop: 'VANDAG SE BEGIN',
    inleiVan: 'beginpunt',
    lyf: 'Toe ons op Dag 1 begin het, het Jesus se vraag voor jou kom staan: “Wie sê jý is Ek?”\n\nMiskien is jou antwoord vandag presies dieselfde as op Dag 1. Maar miskien het iets begin verander.\n\nJy het weer na Jesus gekyk. Jy het Matteus 16 gelees. Jy het Johannes 1 gelees. Jy het gekyk na wat jou gewone lewe wys oor wat jy werklik glo. Jy het gevra of daar dele van Jesus is wat jy maklik ontvang — en ander dele wat jy eerder wil vermy.\n\nNou kom ons terug na dieselfde vraag. Nie omdat Jesus vir jou ’n teologie-eksamen gee nie, maar omdat niemand anders hierdie antwoord namens jou kan leef nie.\n\nPetrus sê: “U is die Christus, die Seun van die lewende God.”\n\nMiskien kan jy vandag sonder huiwering saam met hom sê: “Ja. Ek glo dit.” Of miskien is jy nog besig om uit te vind. As jy nog vrae het, moenie voorgee om geestelik te klink nie. Jy kan eenvoudig sê: “Ek weet nog nie alles nie. Maar ek wil aanhou kyk.”',
    knop: 'EK IS GEREED OM TE ANTWOORD',
  },
  {
    soort: 'terugblik',
    kop: 'KYK TERUG',
    bronId: 'dink',
    bronKop: 'OP DAG 1 HET JY GESKRYF:',
    knop: 'GAAN AAN',
  },
  {
    soort: 'keuse',
    id: 'verander',
    lyf: 'Nadat jy hierdie week weer na Jesus gekyk het, hoe sou jy vandag antwoord?',
    keuses: [
      { waarde: 'verander', woorde: 'My antwoord het verander',
        antwoord: 'Neem ’n oomblik en skryf wat jy nou anders sien. Jy hoef dit nie indrukwekkend te verwoord nie. Skryf net wat waar is.' },
      { waarde: 'duideliker', woorde: 'Ek sien dit nou duideliker',
        antwoord: 'Soms begin groei nie met ’n heeltemal nuwe antwoord nie, maar met ’n duideliker blik op Jesus. Skryf wat vir jou duideliker geword het.' },
      { waarde: 'vrae', woorde: 'Ek het steeds vrae',
        antwoord: 'Vrae beteken nie hierdie week het misluk nie. Wees eerlik en skryf wat jy nog wil verstaan.' },
      { waarde: 'dieselfde', woorde: 'My antwoord is nog dieselfde',
        antwoord: 'Dieselfde antwoord kan steeds dieper word. Skryf wat jou hierdie week weer oor daardie antwoord laat dink het.' },
    ],
    knop: 'GAAN AAN NA MY ANTWOORD',
  },
  {
    soort: 'vraag',
    kop: 'MY ANTWOORD',
    velde: [{ id: 'glo5', prompt: 'Vandag glo ek Jesus is…' }],
    knop: 'STOOR EN GAAN AAN',
  },
  {
    soort: 'vraag',
    velde: [{ id: 'raakgesien5', prompt: 'Hierdie week het ek van Jesus raakgesien…' }],
    knop: 'STOOR EN GAAN AAN',
  },
  {
    soort: 'vraag',
    velde: [{ id: 'area5', prompt: 'Die area van my lewe waarin ek wil leer om Hom meer te vertrou en te volg, is…' }],
    knop: 'STOOR MY ANTWOORD',
  },
  {
    soort: 'bid',
    kop: 'WEEK 1 SE GEBED',
    gebed: 'Here Jesus,\n\nek wil U nie net ken uit wat ander mense oor U sê nie. Ek wil U self beter leer ken.\n\nDankie vir wat ek hierdie week reeds in U Woord gesien het.\n\nWaar ek U te klein gemaak het, wys my. Waar ek ’n Jesus gevorm het wat net by my eie voorkeure pas, korrigeer my. Waar ek net na U toe kom wanneer ek iets nodig het, leer my om ook by U te bly.\n\nMaak my oë oop wanneer ek die Evangelies lees. Help my om U hart te sien. U genade. U waarheid. U liefde.\n\nEn wanneer U woorde my uitdaag, gee my die nederigheid om te luister.\n\nEk wil U ken. Ek wil U vertrou. En stap vir stap wil ek leer om U te volg.\n\nAmen.',
    knop: 'EK HET GEBID',
  },
  {
    /* Net vir wie aan die begin gesê het hy weet nog nie of hy glo nie. Vir
       almal anders bestaan hierdie skerm nie — sien `netAs` in
       VolgJesusStap.jsx. */
    soort: 'teks',
    netAs: { id: 'beginpunt', waarde: 'onseker' },
    kop: 'AS JY NOG NIE SEKER IS NIE',
    lyf: 'Jy hoef nie ’n antwoord voor te gee om hierdie week te voltooi nie.\n\nJy kan eenvoudig skryf: “Ek weet nog nie. Maar ek wil aanhou kyk.”\n\nDis nie ’n mislukking nie. Dis eerlikheid. En eerlikheid is ’n beter plek om ’n reis te begin as voorgee.',
    knop: 'DIT IS MY EERLIKE ANTWOORD',
  },
  {
    soort: 'wallpaper',
    kop: 'HOU DIT VAS',
    sin: 'WIE SÊ JÝ IS JESUS?',
    knop: 'GAAN AAN',
  },
  {
    soort: 'deelkaart',
    kop: 'DEEL DIT MET IEMAND',
    sin: 'Iemand anders kan jou van Jesus vertel.\nNiemand anders kan Hom namens jou volg nie.',
    knop: 'GAAN AAN',
  },
  { soort: 'reis', kop: 'JOU WEEK 1-REIS', knop: 'GAAN AAN' },
]

/* Die vyf dae. Elke dag dra sy eie naam — die lys op die openingskerm wys
   "DAG 1" plus hierdie titel. */
export const WEEK1_DAE = [
  { n: 1, titel: 'Wie sê jý is Jesus?',
    klaarKop: 'JY HET BEGIN KYK.',
    klaarLyf: 'Jy hoef nie vandag alles te verstaan nie. Jy het net begin doen wat elke dissipel moet aanhou doen: weer na Jesus kyk.',
    more: 'Op Dag 2 gaan ons Johannes 1 weer oopmaak — maar hierdie keer gaan ons vir ’n paar minute ophou vra wat Jesus vir ons kan doen, en net kyk na Wie Hy is.',
    stappe: DAG1 },
  { n: 2, titel: 'Kyk weer na Jesus',
    klaarKop: 'VANDAG HET JY NIE NET NA JESUS SE HAND GEKYK NIE. JY HET WEER NA HOM GEKYK.',
    more: 'Op Dag 3 gaan jy nie nog ’n klomp inligting kry nie. Jy gaan eerlik kyk na wat jou gewone lewe wys oor wat jy werklik glo.',
    stappe: DAG2 },
  { n: 3, titel: 'Wat wys my lewe eintlik oor wat ek glo?',
    klaarKop: 'EERLIKHEID IS NIE MISLUKKING NIE. DIT IS WAAR WARE GROEI BEGIN.',
    more: 'Op Dag 4 gaan ons vra of ons soms ’n Jesus gevorm het wat vir ons gemaklik is — maar wat te klein is om ons werklik te vorm.',
    stappe: DAG3_BASIS, slot: DAG3_SLOT },
  { n: 4, titel: 'Het ek Jesus kleiner gemaak?',
    klaarKop: 'JESUS IS NIE NET VOL GENADE NIE. HY IS VOL GENADE ÉN WAARHEID.',
    more: 'Op Dag 5 kom ons terug na die vraag waarmee alles begin het. Maar hierdie keer gaan die app jou herinner aan wat jy op Dag 1 geskryf het.',
    stappe: DAG4 },
  { n: 5, titel: 'Nou antwoord jy',
    klaarKop: 'JY HET BEGIN KYK.',
    klaarLyf: 'Geen punte. Geen geestelike telling. Geen boodskap dat jy nou ’n beter Christen is nie. Net: jy het begin kyk. En miskien is dit presies waar ware dissipelskap moet begin — nie by “ek weet alles” nie, maar by: Jesus, ek wil U beter leer ken.',
    stappe: DAG5 },
]

/* Die drie antwoorde wat aan die einde van die week teruggewys word. 'n Leë
   een word oorgeslaan — nooit `undefined`, nooit 'n leë kaart. */
export const WEEK1_REIS = [
  { id: 'ontdek',      kop: 'Op Dag 1 wou jy graag ontdek:' },
  { id: 'raakgesien5', kop: 'Hierdie week het jy van Jesus raakgesien:' },
  { id: 'tree',        kop: 'Jou volgende tree is:' },
]

export { DAG5_INLEI }

/* Bou die stappe vir 'n dag. Dag 3 het 'n TAK: 'n mens kies een area en sien
   dan net daardie een se twee vrae. Die res van die dag volg daarna.

   Dit is 'n funksie en nie 'n vaste lys nie, want die pad hang af van wat die
   mens gekies het — en daardie keuse lê in sy eie antwoorde. */
export function stappeVirDag(n, antwoorde = {}) {
  const dag = WEEK1_DAE.find(d => d.n === n)
  if (!dag) return []
  if (!dag.slot) return dag.stappe

  const uit = [...dag.stappe]
  const spieel = dag.stappe.find(s => s.soort === 'spieel')
  const gekies = spieel && antwoorde[spieel.id]
  const area = spieel && spieel.areas.find(a => a.waarde === gekies)
  if (area) {
    uit.push({
      soort: 'vraag',
      kop: area.woorde.toUpperCase(),
      velde: area.vrae,
      knop: 'STOOR MY ANTWOORD',
    })
  }
  return uit.concat(dag.slot)
}

/* Die transkripsie van Week 1 se stemboodskap.
 *
 * Dit staan by VERSTEK TOEGEVOU. Dewald: "Die gebruiker sien dit net wanneer
 * hulle self kies om dit oop te maak." 'n Mens moet die boodskap HOOR; die
 * transkripsie is daar vir wie liewer lees, of wat iets wil teruglees. */
export const WEEK1_TRANSKRIPSIE = `As Jesus vandag niks vir jou regmaak nie — die geld bly min, die antwoord kom nie, die storm bedaar nie — sal jy Hom steeds wil hê?

Nie net Sy hulp nie. Nie net Sy gawes nie. Hom.

Want ons volg Jesus nie omdat Hy die lewe altyd makliker maak nie. Ons volg Hom omdat Hy beter as die lewe is.

En dalk is een van die gevaarlikste dinge wat ons kan doen om vir onsself ’n Jesus te vorm wat gemaklik by ons lewe inpas. ’n Jesus wat altyd met my saamstem. Wat my troos, maar my nooit uitdaag nie. Wat my vergewe, maar nooit iets van my vra nie. Wat my help… maar nooit Here oor my lewe mag wees nie.

Dis ’n veilige Jesus. Maar dis nie die Jesus van die Bybel nie.

’n Jesus wat jy self kan vorm, kan jou nooit vorm nie.

Jesus het nie net mooi raad gegee nie. Hy het aansprake gemaak wat mense gedwing het om te besluit wat hulle met Hom gaan doen.

En in Matteus 16 vra Hy vir Sy dissipels: “Wie sê die mense is die Seun van die mens?”

Party sê Johannes die Doper. Ander Elia. Ander Jeremia.

Met ander woorde: almal het ’n opinie oor Jesus.

Toe maak Hy dit persoonlik: “Maar julle, wie sê julle is Ek?”

Nie: wat sê jou kerk? Nie: wat glo jou ouers? Nie: wat sê almal rondom jou?

Jý. Wie sê jý is Jesus?

Petrus antwoord: “U is die Christus, die Seun van die lewende God.”

En Johannes 1 maak daardie antwoord nog groter: “In die begin was die Woord… en die Woord was God.”

Jesus is nie ’n mens wat later God geword het nie. Hy is God wat mens geword het.

Die Een deur Wie alles ontstaan het, het ons wêreld binnegestap. Die Een deur Wie lewe gekom het, het uiteindelik aan ’n kruis na asem gehyg.

En Hy het nie gekom omdat jy net ’n bietjie beter raad nodig gehad het nie.

Jy het ’n Redder nodig gehad.

Jesus het nie net vir jou gesterf nie. Hy het in jou plek gesterf.

Die kruis wys hoe ernstig sonde is — en hoe ver God bereid was om te gaan om sondaars te red.

Jy kon jouself nie red nie. Jy kon jou skuld nie wegwerk nie. Jy kon nie genoeg goeie dinge doen om die kruis onnodig te maak nie.

Jou hoop rus nie op wat jý vir God gedoen het nie, maar op wat Christus vir jou gedoen het.

Maar Jesus het nie in die graf gebly nie. Hy het opgestaan. Die graf is leeg. Jesus leef. Jesus regeer.

Hy is nie net die Lam wat Homself gegee het nie. Hy is die Koning.

En dit beteken hierdie vraag is baie groter as: “Glo jy Jesus bestaan?”

Die vraag is: wie sit op die troon van jou lewe?

Want jy kan sê: “Jesus is Here.” Maar wie neem jou besluite? Wie bepaal jou rigting? Wie kry die laaste sê wanneer Jesus se woorde bots met wat jy wil hê?

Wie regeer jou geld? Jou verhoudings? Jou woorde? Jou geheime lewe? Jou toekoms?

Want as Jesus net Here is wanneer jy met Hom saamstem, dan sit jy nog steeds self op die troon.

As Jesus werklik Here is, kan ek nie dele van my lewe merk: “Hier mag U nie regeer nie.”

Jy kan nie die kruis vir jou skuld vat en die troon vir jouself hou nie.

So ek vra jou weer: wil jy Jesus hê… of net wat jy hoop Hy vir jou sal gee?

Jesus het nie gesê: “Bewonder My.” Hy het gesê: “Volg My.”

En dít is waar hierdie reis begin. Nie by voorgee jy het alles uitgesorteer nie. Nie by probeer om vandag jou hele lewe reg te maak nie. By Jesus.

Lees vandag Johannes 1:1–18 stadig. En vra: “Wat wys hierdie gedeelte vir my oor Jesus?”

En daarna: “As Jesus werklik Here is… waar leef ek nog asof ék die laaste sê het?”

En as hierdie vandag werklik jou gebed is, bid saam met my:

“Jesus, ek glo U is die Christus, die Seun van die lewende God. Ek het gesondig en ek kan myself nie red nie. Dankie dat U vir my gesterf het en opgestaan het. Vergewe my. Ek wil U hê — nie net U hulp nie. Wys my waar ek nog self op die troon sit. Leer my om U te vertrou, aan U gehoorsaam te wees en U te volg. Amen.”

Jy kan Jesus se vraag uitstel… maar jy kan dit nie vir altyd vermy nie.

So vandag begin ons hier: “Maar jý… wie sê jý is Ek?”

En uiteindelik gaan jou lewe wys wie werklik op die troon sit.`
