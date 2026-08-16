/* Die weke soos Dewald hulle geskryf het.
 *
 * Dit is nie die lewende data nie — die lewende data staan in Firestore en
 * word deur die admin geredigeer. Hierdie is die BRON: die teks wat Dewald
 * geskryf het, sodat hy dit met een knoppie in die vorm kan laai in plaas van
 * dit oor te tik.
 *
 * ── Week 1 tot 24 is op 16 Augustus 2026 UITGEHAAL ──
 *
 * Dewald skryf die hele program oor. Die ou weke was nie verkeerd nie, maar
 * die stem was nog nie reg nie: te veel verduideliking, te min dringendheid,
 * en die oproep om Jesus te VOLG het te sag geword. Hy begin weer by Week 1.
 *
 * Hulle is nie hier begrawe nie — hulle staan in die geskiedenis by commit
 * d2321d0. Wil 'n mens ooit 'n ou week se formulering terugsien:
 *
 *     git show d2321d0:src/data/volgJesusWeke.js
 *
 * MOENIE hulle terugplak sonder dat Dewald vra nie. Die punt van die oorskryf
 * is juis dat die ou weergawes weg is.
 *
 * Die videoId's is leeg. Hulle word in die admin geplak sodra die video op
 * YouTube is — presies soos Sorg s'n.
 *
 * Elke Skrifverwysing hierin is teen die GAB in public/gab/ gekeur; sien
 * volgJesus.toets.mjs. Die keuses bly Dewald s'n om na te gaan.
 */

export const WEKE = {
  1: {
    weeknommer: 1,
    moreTeaser:
      'Môre: Johannes begin nie by Betlehem nie — hy begin vóór Betlehem.',
    titel: 'Wie is Jesus?',
    doel: 'Om nie by ’n vae of selfgemaakte idee van Jesus te begin nie, maar by Wie die Evangelies Hom openbaar. Jesus is die ewige Woord wat mens geword het, die Seun van God, Immanuel en die Een wat gekom het om van sonde te verlos. Voordat ons vra hoe om Jesus te volg, moet ons eers sien Wie dit is wat ons roep.',
    openingskerm:
      'Jy kan die Naam Jesus jou hele lewe lank ken... en Hom steeds nooit werklik ken nie.\n\n' +
      'Jy kan in die kerk grootword. Jy kan Bybelverse ken. Jy kan bid wanneer jy bang is. ' +
      'Jy kan selfs sê: "Ek glo in Jesus."\n\n' +
      'Maar hierdie hele reis staan of val by een vraag: Wie is Jesus?\n\n' +
      'Want as Jesus net ’n goeie leermeester is, kan jy Sy raad vat of los. ' +
      'As Hy net ’n inspirerende mens is, kan jy Hom bewonder en steeds jou eie pad loop.\n\n' +
      'Maar as Jesus werklik is Wie die Bybel sê Hy is... kan jy Hom nie net bewonder nie. ' +
      'Jy moet besluit wat jy met Hom gaan doen.\n\n' +
      'Hierdie week begin ons dus nie by "wat moet ek doen?" nie. Ons begin by: "Wie is Hy?"',
    primereSkrif: 'Johannes 1:1–18',
    ondersteunendeSkrif: 'Matteus 1:18–25; Markus 1:1–11; Jakobus 2:19',
    videoId: '',
    kernwaarheid:
      'Dissipelskap begin nie by wat ek vir Jesus doen nie. Dit begin by Wie Jesus is.',
    eenSin:
      'Die grootste vraag is nie net wat jy oor Jesus glo nie. Die vraag is: as Hy werklik Here is — gaan jy Hom volg?',
    wallpaper: '/beelde/vj-w1-wallpaper.webp',
    privaatRefleksie:
      'Wie is Jesus vir jou op hierdie stadium? Nie die antwoord wat jy dink ’n Christen behoort te gee nie — jou eerlike antwoord.\n\n' +
      'Dalk: "Ek glo Hy is die Seun van God." "Ek weet baie van Hom, maar ek ken Hom nie goed nie." ' +
      '"Ek is nog onseker." "Ek het Hom hoofsaaklik gesoek wanneer ek iets nodig het." ' +
      '"Ek glo Hy is my Redder, maar ek sukkel om Hom as Here te volg."\n\n' +
      'Jy hoef niks voor te gee nie. Begin eerlik.',
    gehoorsaamheidStap:
      'KYK WEER NA JESUS\n\n' +
      'Vandag is jou volgende tree eenvoudig. Lees Johannes 1:1–18 weer.\n\n' +
      'Nie om ’n blokkie af te merk nie. Nie om ’n preek te soek nie. Nie om iets vir iemand anders te kry nie. ' +
      'Lees dit om Jesus te sien.\n\n' +
      'Elke keer wanneer die gedeelte iets oor Hom sê, stop en vra: "wat leer ek hier oor Jesus?" ' +
      'Skryf een waarheid neer. Net een. En dra dit vandag saam met jou.',
    gebed:
      'Here Jesus, maak my oë oop. Ek wil U nie net by naam ken nie — ek wil U werklik ken.\n\n' +
      'U is die ewige Seun van God. Die Woord wat mens geword het. Immanuel — God met ons. ' +
      'Die Een wat gekom het om van sonde te verlos. My Redder. My Here.\n\n' +
      'Vergewe my waar ek U net gesoek het vir wat U vir my kan doen, terwyl ek steeds my lewe vir myself wou hou.\n\n' +
      'Ek wil nie net weet dat U bestaan nie. Ek wil U ken. Ek wil U vertrou. Ek wil U gehoorsaam. En ek wil U volg. Amen.',
    dag2Skrif: 'Johannes 1:1–5',
    dag2Prompt:
      'Johannes begin: "In die begin..." Nog voordat hy iets van Jesus se aardse lewe vertel, neem hy jou terug — ' +
      'voor Betlehem, voor die krip, voor Sy bediening. Die Woord was reeds daar. ' +
      'En Johannes sê: die Woord was God. Alles het deur Hom ontstaan.\n\n' +
      'Het jy Jesus hoofsaaklik gesien as Iemand Wie se verhaal by Betlehem begin — of sien jy Hom as die Een wat reeds "in die begin" daar was?\n\n' +
      'Dit verander die manier waarop ons na Jesus luister. Hy is nie net een stem tussen baie ander stemme nie. ' +
      'Lees Johannes 1:1–5 weer en hou hierdie waarheid vas: Jesus se verhaal begin nie by Betlehem nie.',
    dag3Prompt:
      'Lees Johannes 1:14–18. Johannes sê: "Die Woord het mens geword en onder ons kom woon." Dink oor die gewig daarvan. ' +
      'Die Een deur Wie alles ontstaan het, het mens geword. Hy het nie van ver af gebly nie. ' +
      'Hy het tussen mense geleef. Hy het moeg geword. Hy het gehuil. Hy het mense aangeraak. Hy het saam met mense geëet. ' +
      'Hy het verwerping beleef. Hy het uiteindelik gely en gesterf.\n\n' +
      'Wat wys dit vir jou van God dat die Woord mens geword en onder ons kom woon het?\n\n' +
      'Johannes beskryf Jesus as vol genade en waarheid. Nie genade sonder waarheid nie. Nie waarheid sonder genade nie. ' +
      'Vra: "leer ek Jesus ken soos Hy Homself openbaar — of verkies ek ’n weergawe van Hom wat altyd by my voorkeure pas?"',
    dag4Vraag:
      'Lees Matteus 1:18–25. Die engel sê vir Josef dat Maria se Seun Jesus genoem moet word omdat Hy Sy volk van hulle sondes sal verlos. ' +
      'Matteus verbind hierdie geboorte ook met Immanuel — God met ons. ' +
      'Twee groot waarhede staan langs mekaar: God met ons. En: Hy kom om te verlos.\n\n' +
      'Waarvoor soek jy Jesus die meeste? Is dit hoofsaaklik vir hulp, beskerming, genesing, antwoorde, vrede, voorsiening of ’n uitweg?\n\n' +
      'Dit is nie verkeerd om met jou nood na Jesus toe te kom nie. Maar Jesus is groter as wat jy hoop Hy vir jou sal doen. ' +
      'Vra vandag: "wil ek Jesus self ken — of wil ek hoofsaaklik hê Hy moet my lewe regmaak?"',
    dag5Prompt:
      'Lees Markus 1:9–11. Jesus kom na Johannes en word gedoop. Markus beskryf Jesus in die water, ' +
      'die Gees wat op Hom neerdaal, en die stem uit die hemel. En die Vader sê: "Jy is my geliefde Seun."\n\n' +
      'Voordat Jesus se openbare bediening ontvou, laat Markus jou hoor Wie Hy is.\n\n' +
      'Waarom maak Jesus se identiteit saak voordat ons begin vra wat Hy van ons verwag? ' +
      'Omdat die Christelike geloof nie eerste begin by "wat kan Jesus vir my doen?" nie. Dit begin by: "Wie is Jesus?"\n\n' +
      'Bid eenvoudig: "Jesus, ek wil U leer ken soos U werklik is."',
    groepVraag1:
      'Wat het hierdie tekste oor Jesus gesê wat jy maklik vergeet of miskyk?',
    groepVraag2:
      'Waarom maak dit saak Wie Jesus is voordat ons begin praat oor wat Hy van ons vra?',
    groepVraag3:
      'Wat is die gevaar daarvan om vir onsself ’n weergawe van Jesus te maak wat altyd met ons saamstem?',
    groepVraag4:
      'Wat sou dit beteken om vir die volgende 52 weke die Evangelies toe te laat om ons beeld van Jesus te vorm?',
    fasiliteerderHoofpunt:
      'Week 1 moet nie in ’n algemene inleiding tot Christenskap verander nie. Die fokus is smaller en sterker: WIE IS JESUS? ' +
      'Voordat deelnemers leer oor gebed, geld, vergifnis, verhoudings, sending of gehoorsaamheid, ' +
      'moet die program hulle eers na Jesus self bring.\n\n' +
      'Hou Jesus, nie die deelnemer, in die middelpunt. Die versoeking is om te vinnig te vra "wat beteken dit vir my?". ' +
      'Week 1 vra eers: "wat sê die teks oor Hom?" Die orde is openbaring → reaksie. ' +
      'Ons begin nie by ons eie voorkeurbeeld van Jesus en laat tekste dan daarby pas nie — ons laat die Evangelies ons beeld van Jesus vorm.',
    fasiliteerderGrens:
      'Moenie Johannes se taal versag nie. Hy sê "die Woord was God" en "die Woord het mens geword" — ' +
      'moenie Week 1 reduseer tot "Jesus was ’n besonder goeie mens" nie; dit is minder as wat Johannes sê. ' +
      'Die uitdrukking "God die Seun" staan nie woordeliks in Johannes 1 nie; gebruik dit verantwoordelik en hou die Bybelteks self voor. ' +
      'Moenie die Seun en die Vader verwar nie: Johannes sê tegelyk dat die Woord BY God was én God was, ' +
      'en Markus 1 onderskei duidelik tussen Jesus in die water, die Gees wat neerdaal en die Vader wat spreek. ' +
      'Moenie Week 1 in ’n volledige tegniese les oor die Drie-eenheid verander nie, maar moet ook nie die onderskeid uitvee nie. ' +
      'Vermy taal soos "hier word Jesus die Seun van God" — die doop skep nie Sy Seunskap nie, dit openbaar Wie Hy is. ' +
      'By Matteus 1: hou die teks se eie fokus op sonde en verlossing; Jesus kom nie bloot om mense meer suksesvol, ' +
      'gemaklik of gemotiveerd te maak nie. Moenie "Immanuel" reduseer tot "God is by jou wanneer jy ’n moeilike dag het" nie. ' +
      'Jakobus 2:19 is ’n ONDERSTEUNENDE teks: moenie sê "die demone het dieselfde geloof as ’n Christen" nie — ' +
      'die veilige toepassing is dat blote erkenning van ware dinge oor God nie dieselfde is as die lewe van ’n dissipel nie. ' +
      'Moenie "glo" en "volg" as vyande teenoor mekaar stel nie: ons red onsself nie deur meer dissipline, ' +
      'Bybellees of goeie werke nie — maar dieselfde Jesus wat red, roep mense om Hom te volg. ' +
      'Moenie "Redder en Here" in ’n formule verander waarmee mense moet bewys dat Jesus "genoeg Here" van elke terrein is ' +
      'voordat genade vir hulle beskikbaar is nie. ' +
      'Moenie Week 1 in ’n skuldveldtog verander nie — die doel is nie dat iemand ná Dag 1 paniekerig dink "miskien is ek glad nie gered nie" ' +
      'omdat hy nog groei, sukkel of vrae het nie. Geen manipulerende onsekerheid en geen gedwonge emosionele besluit nie. ' +
      'Moenie deelnemers dwing om voor die groep te verklaar "ek is gered" of "ek is nie gered nie" nie — ' +
      'mense kan gelowig, soekend, onseker, nuut of jare in die kerk wees.',
    pastoraleRisiko: 'medium',
  },
}
