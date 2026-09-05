/* ── VOLG JESUS · Week 4 · Laat Jesus dit omkeer ──
 *
 * Dewald het die hele week self geskryf en gestuur — die Skrifte, elke dag se
 * teks, die groot lyne, die vrae en stappe, die gebede, die stemboodskap se
 * transkripsie, die groepsessie en die terugblik. Dit staan hier presies soos
 * hy dit gegee het, net gegiet in Week 1 tot 3 se blokke-vorm.
 *
 * Dieselfde perke as die vorige drie weke (`volgJesusWeek4.toets.mjs` dwing
 * hulle af): hoogstens vyf inhoudsblokke per dag, hoogstens twee private
 * antwoorde per dag, hoogstens 180 woorde per teksblok, en geen Skrifgedeelte
 * twee dae na mekaar nie.
 *
 * ── Die een plek waar ek van sy uitleg afgewyk het ──
 *
 * DAG 4 dra die STEMBOODSKAP, en hy het ook 'n teksblok vir daardie dag
 * geskryf. Albei saam is ses blokke, en die perk is vyf.
 *
 * Die teksblok is die een wat val, presies soos in Week 3. Sy geskrewe Dag 4
 * is 'n verkorting van dieselfde vier punte wat die opname voluit dra: Jesus
 * kyk eers en tree dan doelbewus op, die vyeboom se blare sonder vrug, "Here,
 * seën dit" teenoor "hierdie moet eers omgekeer word", en Jesus wat Here van
 * alles is. Niks gaan verlore nie — dit word gehoor in plaas van gelees, en
 * die opname sê dit voller as die verkorting.
 *
 * Die GROOT lyn bly staan. Dit is die week se eie sin ("Moenie net vir Jesus
 * vra om alles gemaklik te maak nie…") en dit is die belangrikste ding wat op
 * daardie skerm kan staan.
 *
 * ── Die res van sy uitleg, presies soos hy dit gegee het ──
 *
 * Sy "DIE STAP" by elke dag is nie 'n eie blok-soort in hierdie stelsel nie —
 * dit staan binne die dag se VRAAG-blok, as die stap wat by die vraag hoort.
 * Dieselfde as Week 3. Niks daarvan het geval nie.
 *
 * Die twee wallpapers staan waar hulle in Week 2 en 3 staan: `wallpaperDag1`
 * sluit Dag 2 af, `wallpaper` sluit die week af op Dag 5.
 *
 * Die twee groep-brûe: een op Dag 2, en een op Dag 4 NA die stemboodskap
 * (§40 — die brug na die groep kom altyd ná die opname).
 */

/* ── Die openingsblad ── */
export const WEEK4_OPENING =
  'Ons vra maklik vir Jesus om ons lewe te seën.\n\n'
  + 'Maar wat as iets eers moet verander?\n\n'
  + 'Hierdie week kyk ons na die Jesus wat vrug soek, verkeerde dinge '
  + 'konfronteer en plek maak vir wat God bedoel het.\n\n'
  + 'Om Hom te volg, beteken ook: “Here, U mag omkeer wat verkeerd staan.”'

const DAG1 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Lukas 6:43–46',
    lyf: 'Let op hoe Jesus die vrug van ’n lewe verbind met wat in die hart '
       + 'leef — en hoe Hy eindig met die vraag waarom mense Hom “Here” noem, '
       + 'maar nie doen wat Hy sê nie.',
  },
  {
    soort: 'teks',
    kop: 'NIE NET BLARE NIE',
    lyf: '’n Boom hoef nie vir jou te verduidelik wat dit is nie. Sy vrug wys '
       + 'dit.\n\n'
       + 'Jesus gebruik dieselfde beeld vir ons lewe. Geloof is nie net wat ek '
       + 'sê, weet of aan ander wys nie. Met verloop van tyd word dit sigbaar '
       + 'in wat uit my lewe voortkom.\n\n'
       + 'Jy kan baie “blare” hê: Bybelkennis, kerklike taal, gebede en selfs '
       + 'bediening. Nie een daarvan is verkeerd nie. Maar Jesus vra ’n dieper '
       + 'vraag: wat bring jou lewe voort? Word jy meer liefdevol? Meer '
       + 'gehoorsaam? Meer eerlik? Meer vergewensgesind? Meer nederig?\n\n'
       + 'Die doel is nie om jouself vandag te veroordeel nie. Dit is om eerlik '
       + 'genoeg te wees om na die vrug te kyk. Jesus wil nie net hê dat jou '
       + 'geloof reg moet lyk nie. Hy wil jou werklik verander.',
  },
  {
    soort: 'groot',
    lyf: 'JESUS KYK NIE NET NA DIE BLARE VAN JOU GELOOF NIE.\nHY KYK NA DIE VRUG VAN JOU LEWE.',
  },
  {
    soort: 'vraag',
    id: 'vrug1',
    kop: 'WAT WYS DIE VRUG?',
    lyf: 'Moenie vandag vra wat ander mense van jou geloof dink nie. Kyk na jou '
       + 'gewone lewe. Waar is daar tans meer blare as vrug?\n\n'
       + 'Kies een area uit jou antwoord en doen vandag een klein ding wat die '
       + 'vrug wys wat jy graag daar wil sien. Is dit vergifnis — neem ’n stap '
       + 'na vergifnis. Is dit gehoorsaamheid — doen wat jy reeds weet reg is. '
       + 'Is dit liefde — wys dit prakties.',
    prompt: 'Skryf dit hier neer…',
  },
  {
    soort: 'gebed',
    lyf: 'Here Jesus, wys my eerlik wat my lewe voortbring. Moenie dat ek '
       + 'tevrede raak met geloof wat net reg lyk nie. Laat my lewe die vrug '
       + 'dra van iemand wat U werklik volg. Amen.',
  },
]

const DAG2 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Matteus 6:19–24',
    lyf: 'Let op hoe Jesus praat oor jou skat, jou hart, en die onmoontlikheid '
       + 'daarvan om twee here te dien.',
  },
  {
    soort: 'teks',
    kop: 'WAT HET TE GROOT GEWORD?',
    lyf: 'Nie alles wat belangrik voel, behoort die belangrikste plek in jou '
       + 'lewe te hê nie.\n\n'
       + 'Jesus leer dat waar jou skat is, jou hart ook sal wees. Hy sê ook dat '
       + 'niemand twee here kan dien nie. Dit beteken dat selfs ’n goeie ding '
       + 'stadig ’n verkeerde plek kan inneem.\n\n'
       + 'Werk kan jou identiteit word. Geld kan jou veiligheid word. ’n '
       + 'Verhouding kan jou vrede beheer. Jou foon kan jou aandag besit. Selfs '
       + 'bediening kan belangriker word as die Een vir Wie jy bedien.\n\n'
       + 'Die vraag is dus nie net “is hierdie ding verkeerd?” nie. Die dieper '
       + 'vraag is: het hierdie ding ’n plek gekry wat net God behoort te hê? '
       + 'Om Jesus te volg, beteken nie dat Hy bloot deel van jou lewe is nie. '
       + 'Hy is Here daarvan.',
  },
  {
    soort: 'groot',
    lyf: '’N GOEIE DING WORD GEVAARLIK\nWANNEER DIT DIE PLEK INNEEM WAT NET GOD BEHOORT TE HÊ.',
  },
  {
    soort: 'vraag',
    id: 'groot2',
    kop: 'WAT HET TE GROOT GEWORD?',
    lyf: 'Dink aan jou tyd, geld, werk, verhouding, foon, ambisie, ontspanning '
       + 'of selfs bediening. Wat het in hierdie seisoen meer beheer oor jou '
       + 'hart gekry as wat dit behoort te hê?\n\n'
       + 'Moenie vandag ’n dramatiese besluit neem nie. Kies een konkrete, '
       + 'gesonde grens wat God weer eerste plek gee — sit jou foon vir ’n uur '
       + 'neer, beskerm tyd vir gebed, stel ’n aankoop uit, of beperk '
       + 'doelbewus iets wat jou dag oorheers.',
    prompt: 'Skryf dit hier neer…',
  },
  {
    soort: 'gebed',
    lyf: 'Here, wys my waar iets ’n plek ingeneem het wat nie daaraan behoort '
       + 'nie. Ek wil nie deur goeie dinge beheer word nie. Neem weer die '
       + 'eerste plek in my hart. Amen.',
  },
  { soort: 'groepbrug', netGroep: true },
  { soort: 'wallpaper', bronVeld: 'wallpaperDag1', kop: 'HOU DIT VOOR JOU' },
]

const DAG3 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Lukas 18:15–17',
    lyf: 'Kyk hoe Jesus reageer wanneer mense probeer keer dat ander na Hom toe '
       + 'kom.',
  },
  {
    soort: 'teks',
    kop: 'WAT STAAN IN DIE PAD?',
    lyf: 'In Lukas 18 bring mense kinders na Jesus toe, maar die dissipels '
       + 'probeer hulle wegkeer. Jesus doen die teenoorgestelde. Hy roep die '
       + 'kinders nader.\n\n'
       + 'Dit wys iets belangriks van Sy hart: Jesus wil nie hê dat mense '
       + 'onnodig van Hom weggehou word nie.\n\n'
       + 'Soms is die hindernis nie ’n tafel in ’n tempel nie. Dit kan ’n '
       + 'oorvol program wees wat gebed verdring. Dit kan bitterheid wees wat '
       + 'jou hart toesluit. Dit kan trots wees wat maak dat jy nie hulp vra '
       + 'nie. Dit kan ’n gewoonte wees wat jou aandag voortdurend opeis.\n\n'
       + 'Om Jesus te volg, beteken ook dat jy eerlik vra: wat staan in die pad '
       + 'daarvan dat ek nader aan Hom leef?',
  },
  {
    soort: 'groot',
    lyf: 'ALLES WAT TUSSEN JOU EN JESUS BEGIN STAAN,\nVERDIEN OM ONDERSOEK TE WORD.',
  },
  {
    soort: 'vraag',
    id: 'pad3',
    kop: 'WAT STAAN IN DIE PAD?',
    lyf: 'Kyk eerlik na jou gewone week. Wat maak dit tans moeiliker vir jou om '
       + 'naby Jesus te leef? Nie wat jy dink die regte antwoord behoort te '
       + 'wees nie — wat is die antwoord?\n\n'
       + 'Verwyder vandag een klein hindernis. Maak tien minute oop. Sit iets '
       + 'af. Skuif iets uit. Maak doelbewus ruimte om sonder haas by Jesus te '
       + 'wees.',
    prompt: 'Skryf dit hier neer…',
  },
  {
    soort: 'gebed',
    lyf: 'Here Jesus, wys my wat tussen my en U begin staan het. Gee my die moed '
       + 'om ruimte te maak vir wat werklik belangrik is. Trek my weer nader '
       + 'aan U. Amen.',
  },
]

const DAG4 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Markus 11:11–21',
    lyf: 'Jesus sien eers wat in die tempel gebeur. Hy kom later terug en tree '
       + 'op. Let ook op hoe Markus die verhaal van die vyeboom rondom die '
       + 'tempelgebeure plaas.',
  },
  {
    soort: 'stem',
    titel: 'Jesus het die tafels omgekeer.',
    duur: '±7 minute',
  },
  {
    soort: 'groot',
    lyf: 'MOENIE NET VIR JESUS VRA OM ALLES GEMAKLIK TE MAAK NIE.\nGEE HOM OOK TOESTEMMING OM OM TE KEER WAT VERKEERD STAAN.',
  },
  {
    soort: 'vraag',
    id: 'omkeer4',
    kop: 'WAT MOET OMGEKEER WORD?',
    lyf: 'Dink terug aan die eerste drie dae van hierdie week. As Jesus vandag '
       + 'een ding in jou lewe sou konfronteer eerder as om dit net te seën, '
       + 'wat dink jy sou dit wees?\n\n'
       + 'Noem dit eerlik voor God. Neem daarna die eerste gehoorsame stap wat '
       + 'jy reeds weet jy behoort te neem. Nie môre nie. Vandag.',
    prompt: 'Skryf dit hier neer…',
    deelStem: true,
  },
  {
    soort: 'gebed',
    lyf: 'Here Jesus, ek gee U toestemming om my nie net te troos nie, maar ook '
       + 'te verander. Wys my wat verkeerd staan en gee my die nederigheid om U '
       + 'te gehoorsaam. Keer om wat tussen my en U staan. Amen.',
  },
  /* §40: die brug na die groep kom NA die stemboodskap. */
  { soort: 'groepbrug', netGroep: true },
]

const DAG5 = [
  {
    soort: 'lees',
    merk: 'LEES EERS',
    skrif: 'Hebreërs 10:19–25',
    lyf: 'Kyk na die toegang wat ons deur Jesus tot God het — en hoe die '
       + 'skrywer sê ons behoort daarom te leef.',
  },
  {
    soort: 'teks',
    kop: 'WAT BLY NOU ANDERS?',
    lyf: 'Die verhaal eindig nie by tafels wat op die grond lê nie.\n\n'
       + 'In Johannes 2 wys Jesus vooruit na Sy dood en opstanding. Hy het '
       + 'gekom om veel meer te doen as om ’n gebou te reinig. Sy liggaam sou '
       + 'gebreek word. Hy sou sterf. En Hy sou opstaan. Deur Hom is die weg na '
       + 'die Vader oopgemaak, en Hebreërs 10 sê daarom dat ons met '
       + 'vrymoedigheid kan nader.\n\n'
       + 'Dít is die evangelie agter hierdie week: Jesus wys wat verkeerd is, '
       + 'maar Hy los jou nie daar nie. Hy roep jou nader. Hy vergewe. Hy gee ’n '
       + 'nuwe weg. En Hy leer jou om anders te leef.\n\n'
       + 'Die doel van hierdie week is dus nie net dat jy kan benoem wat '
       + 'verkeerd was nie. Die vraag is: wat gaan nou anders wees omdat Jesus '
       + 'Here is?',
  },
  {
    soort: 'groot',
    lyf: 'JESUS HET NIE NET GEKOM OM ’N TEMPEL TE REINIG NIE.\nHY HET GEKOM OM DIE WEG NA DIE VADER OOP TE MAAK.',
  },
  {
    soort: 'vraag',
    id: 'anders5',
    kop: 'WAT BLY NOU ANDERS?',
    lyf: 'Kyk terug na alles wat jy hierdie week raakgesien het. Wat is die een '
       + 'verandering waarop jy nie volgende week wil teruggaan nie?\n\n'
       + 'Kies een praktyk vir die volgende sewe dae wat hierdie verandering '
       + 'gaan beskerm. Maak dit eenvoudig genoeg dat jy dit werklik kan '
       + 'volhou. Skryf dit neer. Begin vandag.',
    prompt: 'Skryf dit hier neer…',
  },
  {
    soort: 'gebed',
    lyf: 'Here Jesus, dankie dat U nie net wys wat verkeerd is nie, maar ook vir '
       + 'my ’n nuwe weg gee. Help my om nie terug te gaan na dit wat U hierdie '
       + 'week in my aangespreek het nie. Laat my lewe anders wees omdat U Here '
       + 'is. Amen.',
  },
  { soort: 'wallpaper', bronVeld: 'wallpaper', kop: 'HOU DIT VOOR JOU' },
]

export const WEEK4_DAE = [
  {
    n: 1, titel: 'Nie net blare nie', merk: 'DIE VRUG',
    knop: 'EK KIES VRUG',
    klaarKop: 'DAG 1 KLAAR.',
    klaarLyf: 'Vandag het jy nie net gekyk hoe jou geloof lyk nie. Jy het gekyk wat dit voortbring.',
    blokke: DAG1,
  },
  {
    n: 2, titel: 'Wat het te groot geword?', merk: 'DIE PLEK',
    knop: 'GOD KOM EERSTE',
    klaarKop: 'DAG 2 KLAAR.',
    klaarLyf: 'Jy hoef nie alles weg te gooi nie. Jy moet net weer regmaak wat eerste kom.',
    blokke: DAG2,
  },
  {
    n: 3, titel: 'Wat staan in die pad?', merk: 'DIE RUIMTE',
    knop: 'EK MAAK RUIMTE',
    klaarKop: 'DAG 3 KLAAR.',
    klaarLyf: 'Jy het vandag nie probeer om nóg iets in jou lewe in te druk nie. Jy het ruimte gemaak om nader aan Jesus te kom.',
    blokke: DAG3,
  },
  {
    n: 4, titel: 'Jesus het die tafels omgekeer', merk: 'DIE KONFRONTASIE',
    knop: 'HERE, KEER DIT OM',
    klaarKop: 'DAG 4 KLAAR.',
    klaarLyf: 'Jy het Jesus vandag nie net gevra om jou lewe gemakliker te maak nie. Jy het Hom toegelaat om jou te verander.',
    blokke: DAG4,
  },
  {
    n: 5, titel: 'Wat bly nou anders?', merk: 'DIE NUWE WEG',
    knop: 'VOLTOOI WEEK 4',
    klaarKop: 'WEEK 4 KLAAR.',
    klaarLyf: 'Moenie môre weer terugsit wat Jesus jou vandag gewys het omgekeer moet bly nie.',
    blokke: DAG5,
  },
]

/* Wat aan die einde van die week teruggewys word. Net wat werklik geskryf is. */
export const WEEK4_REIS = [
  { id: 'vrug1',   kop: 'Vroeër hierdie week het jy jouself gevra waar daar meer blare as vrug is:' },
  { id: 'pad3',    kop: 'Daarna het jy gevra wat dit moeiliker maak om naby Jesus te leef:' },
  { id: 'anders5', kop: 'En vandag het jy geskryf wat nie weer moet terugval nie:' },
]

/* Die klaar-skerm se eie woorde. Dit was vir elke week Week 1 s'n ("JY HET
   BEGIN KYK") — sien VolgJesusStap.jsx, waar dit nou uit die week kom. */
export const WEEK4_KLAAR = {
  kop: 'JY HET WEEK 4 VOLTOOI.',
  lyf: 'Hierdie week het jy gekyk na die vrug van jou lewe, wat te groot '
     + 'geword het, wat tussen jou en Jesus staan, wat Hy wil omkeer, en wat '
     + 'nou anders moet bly. Jy hoef nie vandag alles reg te hê nie. Maar '
     + 'moenie weer gemaklik terugsit wat Jesus jou gewys het omgekeer moet '
     + 'bly nie.',
}

/* Die deelbare kaart aan die einde. */
export const WEEK4_DEELSIN =
  'Om Jesus te volg, beteken nie dat Hy bloot saamgaan waarheen jy klaar '
  + 'besluit het om te gaan nie. Dit beteken dat Hy Here genoeg is om jou '
  + 'rigting te verander.'

/* Nog geen Week 5 nie. `weekVolgende(4)` val terug op `null` en die skerm wys
   dan eenvoudig niks — 'n geraaide titel vir 'n week wat nog nie bestaan nie,
   is erger as stilte. */
export const WEEK4_VOLGENDE = null

export function blokkeVirDag4(n) {
  const dag = WEEK4_DAE.find(d => d.n === n)
  return dag ? dag.blokke : []
}

/* ── Die stemboodskap se transkripsie ──
 * Dewald se eie woorde, presies soos hy dit gegee het — niks hier verkort of
 * verander nie, ook nie die slotgebed nie. Dit hoort by Dag 4. */
export const WEEK4_TRANSKRIPSIE = `Markus 11:11 sê iets interessants.

Jesus stap die tempel binne.

Hy kyk na alles rondom Hom.

En toe gaan Hy weg.

Maar die volgende dag kom Hy terug.

En hierdie keer kyk Hy nie net nie.

Hy keer die tafels om.

Dit was nie omdat Jesus skielik Sy humeur verloor het nie.

Hy het reeds die vorige dag gesien wat daar aangaan.

Hy het gekyk.

Hy het geweet.

En toe het Hy opgetree.

EERSTENS: JESUS SOEK VRUG, NIE NET BLARE NIE.

Net voordat Jesus die tempel binnegaan, gebeur iets vreemd.

Hy sien ’n vyeboom met baie blare.

Van ver af lyk die boom gesond.

Dit lyk belowend.

Maar toe Jesus nader kom, is daar geen vrug nie.

Net blare.

Daarna gaan Jesus tempel toe en keer die tafels om.

En die volgende oggend sien die dissipels dat die vyeboom verdroog het.

Markus sit hierdie twee gebeurtenisse nie verniet langs mekaar nie.

Die vyeboom lyk goed van buite, maar daar is niks om te wys nie.

En dit is presies wat Jesus in die tempel sien.

Daar was baie godsdienstige bedrywigheid.

Mense.

Offers.

Priesters.

Gebede.

Alles het van buite reg gelyk.

Maar Jesus kyk nie net na wat van buite sigbaar is nie.

Hy soek vrug.

En dieselfde geld vir my en jou.

Jy kan kerk toe gaan.

Jy kan jou Bybel ken.

Jy kan bid.

Jy kan selfs vir God werk.

Maar die vraag is:

Wat bring jou lewe voort?

Is daar liefde?

Is daar gehoorsaamheid?

Is daar vergifnis?

Is daar nederigheid?

Is daar ’n lewe wat werklik verander omdat Jesus Here is?

Want Jesus soek nie net blare nie.

Hy soek vrug.

TWEEDENS: JESUS KEER OM WAT NIE MEER VIR GOD BEDOEL IS NIE.

Toe Jesus die tempel binnekom, begin Hy die tafels omkeer.

En Hy sê:

“My huis sal ’n huis van gebed genoem word, maar julle het dit ’n rowerspelonk gemaak.”

Die tempel was veronderstel om ’n plek te wees waar mense God ontmoet.

’n Plek van gebed.

’n Plek waar mense nader aan God kom.

Maar iets het skeefgeloop.

Dit wat vir God bedoel was, het oor mense se eie voordeel begin gaan.

En Jesus het dit nie net geïgnoreer nie.

Hy het die tafels omgekeer.

Daar is ’n belangrike vraag hierin:

Is daar iets in my lewe wat God vir een doel gegee het, maar wat ek vir iets anders begin gebruik het?

My tyd.

My geld.

My liggaam.

My gawes.

My verhouding.

My bediening.

Selfs my geloof.

Ons vra maklik:

“Here, seën wat ek doen.”

Maar soms sê Jesus:

“Nee. Hierdie moet eers omgekeer word.”

DERDENS: WANNEER JESUS DIE TAFELS OMKEER, MAAK HY PLEK VIR MENSE.

Matteus 21:14 sê dat nadat Jesus die tempel gereinig het:

“Blindes en kreupeles het daar na Hom gekom, en Hy het hulle gesond gemaak.”

Ek hou hiervan.

Die tafels word omgekeer...

en gebroke mense kom nader.

Jesus keer nie die tafels om omdat Hy mense wil wegjaag nie.

Hy keer dit om omdat dinge in die pad gekom het van dit waarvoor God se huis bedoel was.

En toe die verkeerde dinge uit die pad is, kom mense nader aan Jesus.

Dit wys vir ons iets van Sy hart.

Jesus is heilig.

Hy konfronteer wat verkeerd is.

Maar Hy is ook vol ontferming.

Die gebroke mens wat na Hom toe kom, word nie weggejaag nie.

Hy word ontvang.

VIERDENS: JESUS WIL NIE NET DIE TEMPEL VERANDER NIE — HY WIL JOU VERANDER.

In Johannes 2 sê Jesus:

“Breek hierdie tempel af, en in drie dae sal Ek dit oprig.”

Die mense dink Hy praat van die gebou.

Maar Johannes verduidelik dat Jesus van Sy eie liggaam gepraat het.

Jesus het gekom om iets baie groter te doen as om net tafels in ’n gebou om te keer.

Hy sou Sy lewe gee.

Sy liggaam sou gebreek word.

Hy sou sterf.

En op die derde dag sou Hy opstaan.

Sodat ons deur Hom na die Vader kan kom.

So vandag gaan die vraag nie eintlik oor wat Jesus daardie dag in die tempel omgekeer het nie.

Die vraag is:

Wat wil Jesus vandag in my lewe omkeer?

Waar het iets belangriker geword as God?

Waar lyk my lewe mooi van buite, maar is daar min vrug?

Waar het ek gewoond geraak aan iets wat Jesus nooit bedoel het ek moet aanvaar nie?

Moenie net vir Jesus vra om alles in jou lewe gemaklik te maak nie.

Gee Hom ook toestemming om dit wat verkeerd staan, om te keer.

Want soms is die grootste genade nie dat Jesus alles los soos dit is nie.

Soms is die grootste genade dat Hy die tafel omkeer.

Here Jesus, ek bid vir die persoon wat nou luister. Deursoek ons harte en wys ons wat nie reg is nie. Wys ons waar daar baie blare maar min vrug is, en waar dinge in ons lewe nie meer gebruik word soos U dit bedoel het nie. Gee ons die nederigheid om U toe te laat om dit wat verkeerd staan, om te keer. Verwyder wat tussen ons en U staan, en maak ons lewens vrugbaar. Dankie dat U U lewe vir ons gegee het en opgestaan het, sodat ons deur U na die Vader kan kom. In Jesus se Naam. Amen.`

/* ── Die groepsessie ── */
export const WEEK4_SESSIE = {
  titel: 'Wat moet omgekeer word?',
  skrifte: ['Markus 11:15–17', 'Hebreërs 10:19–22'],
  vrae: [
    'Jesus het reeds die vorige dag na die tempel gekyk voordat Hy teruggekom en opgetree het. Wat leer dit vir jou oor die verskil tussen impulsiewe woede en doelbewuste konfrontasie?',
    'Ons het hierdie week gepraat oor blare en vrug. Hoe kan iemand baie godsdienstige “blare” hê, maar min werklike vrug? En hoe kan ons dit in onsself raaksien sonder om ander mense te veroordeel?',
    'Nadat Jesus in die tempel opgetree het, sien ons hoe gebroke mense na Hom toe kom. Wat leer dit ons oor waarom Jesus soms dinge uit die pad verwyder?',
    'Daar is ’n groot verskil tussen “Here, seën wat ek doen” en “Here, wys my wat moet verander”. Wat verander wanneer ’n dissipel die tweede gebed ernstig begin bid?',
  ],
  gebed:
    'Here Jesus, dankie dat U ons lief genoeg het om ons nie altyd te los soos '
    + 'ons is nie. Wys ons wat ware vrug is, wat nie meer sy regte plek het nie '
    + 'en wat tussen ons en U staan. Gee ons die nederigheid om te verander '
    + 'waar U ons roep om te verander. Laat ons mense wees wat U nie net met '
    + 'ons woorde volg nie, maar met ons hele lewe. Amen.',
}
