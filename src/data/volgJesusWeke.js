/* Die weke soos Dewald hulle geskryf het.
 *
 * Dit is nie die lewende data nie — die lewende data staan in Firestore en
 * word deur die admin geredigeer. Hierdie is die BRON: die teks wat Dewald
 * geskryf het, sodat hy dit met een knoppie in die vorm kan laai in plaas van
 * dit oor te tik.
 *
 * ── Week 1 tot 24 is op 16 Augustus 2026 UITGEHAAL ──
 *
 * Dewald skryf die hele program oor. Hulle is nie hier begrawe nie — hulle
 * staan in die geskiedenis by commit d2321d0:
 *
 *     git show d2321d0:src/data/volgJesusWeke.js
 *
 * MOENIE hulle terugplak sonder dat Dewald vra nie. Die punt van die oorskryf
 * is juis dat die ou weergawes weg is.
 *
 * Week 1 self is al 'n paar keer oorgeskryf. Hierdie is die weergawe waarin
 * die troon-vraag die punt word: nie hoeveel plek Jesus in jou lewe het nie,
 * maar wie op die troon sit.
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
      'Môre: Johannes begin nie by die krip nie — hy begin "in die begin".',
    titel: 'Wie is Jesus?',
    doel: 'Om nie met ’n vae of selfgemaakte idee van Jesus te begin nie, maar met Wie die Evangelies Hom openbaar. Jesus is die ewige Woord wat mens geword het, Immanuel, die Seun van God en die Redder wat gekom het om van sonde te verlos. Voordat ons vra hoe om Jesus te volg, moet ons eers sien Wie dit is wat ons roep.',
    weekKern:
      'Dissipelskap begin nie by wat ek vir Jesus doen nie. Dit begin by Wie Jesus is.',
    openingskerm:
      'Jy kan die Naam Jesus jou hele lewe lank ken... en Hom steeds nooit werklik ken nie.\n\n' +
      'Jy kan in die kerk grootword. Jy kan Bybelverse ken. Jy kan bid. Jy kan selfs sê: "Ek glo in Jesus."\n\n' +
      'Maar voordat jy leer hoe om Hom te volg, moet jy eers een vraag antwoord: Wie is Jesus?\n\n' +
      'Want as Jesus net ’n goeie leermeester is, kan jy Sy raad vat of los. ' +
      'Maar as Hy werklik is Wie die Evangelies sê Hy is... kan jy Hom nie net bewonder nie.\n\n' +
      'Hierdie reis begin dus nie by "wat kan Jesus vir my doen?" nie. Dit begin by: "Wie is Hy?"',
    primereSkrif: 'Johannes 1:1–18',
    ondersteunendeSkrif: 'Matteus 1:18–25; Markus 1:9–11; Jakobus 2:19',
    videoId: '',
    /* HOU DIT VAS op Dag 1 — en die sin op die wallpaper. */
    kernwaarheid:
      'As Jesus werklik Here is — gaan jy Hom volg?',
    /* DIE LAASTE HOU. Dit sluit die boodskap af. */
    eenSin:
      'Die grootste vraag is nie hoeveel plek Jesus in jou lewe het nie. Die vraag is: wie sit op die troon?',
    wallpaper: '/beelde/vj-w1-wallpaper.webp',
    privaatRefleksie:
      'Moenie die antwoord gee wat jy dink ’n Christen behoort te gee nie. Vra eerlik: wie is Jesus vir my?\n\n' +
      'Dalk: "Ek glo Hy is die Seun van God." "Ek weet baie van Hom, maar ek wil Hom beter leer ken." ' +
      '"Ek hardloop hoofsaaklik na Hom wanneer ek iets nodig het." ' +
      '"Ek wil hê Hy moet my help, maar ek hou steeds graag self beheer." ' +
      '"Ek is nog onseker oor Wie Hy is." ' +
      '"Ek glo Hy is my Redder en ek wil leer om Hom as Here te volg."\n\n' +
      'Jy hoef niks voor te gee nie. Begin eerlik.',
    gehoorsaamheidStap:
      'KYK NA JESUS\n\n' +
      'Jou eerste gehoorsaamheidstap is eenvoudig: lees Johannes 1:1–18 weer.\n\n' +
      'Nie om ’n blokkie af te merk nie. Nie om iets vir iemand anders te kry nie. Nie om vinnig klaar te wees nie. ' +
      'Lees dit om Jesus te sien.\n\n' +
      'Elke keer wanneer Johannes iets oor Hom sê, stop. Vra: "wat leer ek hier oor Jesus?"\n\n' +
      'Skryf een waarheid neer. Dra dit hierdie week saam met jou.',
    gebed:
      'Here Jesus, maak my oë oop. Ek wil U nie net by naam ken nie. Ek wil U werklik ken.\n\n' +
      'U is die ewige Seun van God. Die Woord wat mens geword het. Immanuel — God met ons. My Redder. My Here.\n\n' +
      'Vergewe my waar ek U net gesoek het vir wat U vir my kan doen, terwyl ek steeds self in beheer wou bly.\n\n' +
      'Wys my Wie U werklik is. Verander wat in my moet verander.\n\n' +
      'Ek wil U ken. Ek wil U vertrou. Ek wil U gehoorsaam. Ek wil U volg. In Jesus se Naam. Amen.',
    dag1Titel: 'Wie is Jesus?',
    dag2Titel: 'Voor Betlehem was Hy reeds daar',
    dag3Titel: 'God het nader gekom',
    dag4Titel: 'Hy het gekom om te verlos',
    dag5Titel: 'My geliefde Seun',
    dag2Skrif: 'Johannes 1:1–5',
    dag2Prompt:
      'Johannes begin: "In die begin..." Nie "by die krip" nie. Nie "toe Maria geboorte gee" nie. In die begin.\n\n' +
      'Die Woord was reeds daar. Die Woord was by God. Die Woord was God. Alles het deur Hom tot stand gekom.\n\n' +
      'Jesus is nie net een wyse stem tussen baie ander nie. Hy is nie net nog iemand met goeie raad oor die lewe nie.\n\n' +
      'Die vraag: as Jesus werklik is Wie Johannes sê Hy is, met hoeveel gewig behoort ek dan na Sy woorde te luister?\n\n' +
      'Lees Johannes 1:1–5 nog een keer en hou hierdie waarheid vas: die krip was nie Jesus se begin nie.',
    dag3Prompt:
      'Lees Johannes 1:14–18. Johannes sê: "Die Woord het mens geword en onder ons kom woon."\n\n' +
      'Die Een deur Wie alles ontstaan het, het mens geword. Hy het nie op ’n afstand gebly nie. ' +
      'Hy het tussen mense geleef. Hy het honger geken. Moegheid geken. Trane geken. Verwerping geken. Pyn geken.\n\n' +
      'God het nader gekom.\n\n' +
      'Johannes sê Jesus is vol genade en waarheid. Nie genade wat sonde eenvoudig goedpraat nie. ' +
      'Nie waarheid sonder genade nie. Genade én waarheid.\n\n' +
      'Het jy dalk vir jouself ’n weergawe van Jesus gevorm wat altyd saamstem met wat jy reeds wil hê? ' +
      'Onthou: ’n Jesus wat jy self kan vorm, kan jou nooit vorm nie.\n\n' +
      'Bid: "Jesus, wys my waar my beeld van U nie pas by wat U Woord openbaar nie."',
    dag4Vraag:
      'Lees Matteus 1:18–25. Die engel sê dat Hy Jesus genoem moet word. Waarom? Omdat Hy Sy volk van hulle sondes sal verlos. ' +
      'Matteus noem Hom ook Immanuel — God met ons.\n\n' +
      'Jesus het nie gekom bloot om jou dag ’n bietjie beter te maak nie. Hy het nie gekom net om jou te help om jou eie doelwitte te bereik nie. ' +
      'Hy het gekom omdat ons verlossing nodig het.\n\n' +
      'Wees eerlik: waarvoor soek jy Jesus gewoonlik eerste? Vir vrede? Voorsiening? Genesing? Beskerming? ’n Antwoord? ’n Uitweg?\n\n' +
      'Dit is nie verkeerd om jou nood na Jesus toe te bring nie. Maar daar is ’n groter vraag: ' +
      'wil ek Jesus hê — of hoofsaaklik wat ek hoop Hy vir my kan doen?',
    dag5Prompt:
      'Lees Markus 1:9–11. Jesus staan in die water. Die Gees daal op Hom neer. ' +
      'Die Vader se stem kom uit die hemel: "Jy is my geliefde Seun."\n\n' +
      'Voordat Markus begin wys wat Jesus alles doen, wys hy vir ons Wie Jesus is.\n\n' +
      'En dit is die orde van hierdie hele program. Ons gaan praat oor gehoorsaamheid, gebed, geld, verhoudings, ' +
      'vergifnis, reinheid, diens en sending. Maar dit alles maak net sin wanneer ons weet Wie ons volg.\n\n' +
      'Die vraag: as Jesus werklik die Seun van God is, kan ek Hom dan net volg wanneer Sy woorde vir my gemaklik is?\n\n' +
      'Bid eenvoudig: "Jesus, ek wil U nie net bewonder nie. Ek wil U volg."',
    groepVraag1:
      'Wat het hierdie week jou beeld van Jesus uitgedaag of verdiep?',
    groepVraag2:
      'Waarom maak dit saak Wie Jesus is voordat ons vra wat Hy van ons verwag?',
    groepVraag3:
      'Hoe vorm ons soms vir onsself ’n Jesus wat altyd met ons saamstem?',
    groepVraag4:
      'Wat sou dit beteken om vir die volgende 52 weke Jesus toe te laat om óns te vorm, eerder as dat ons Hom volgens ons voorkeure vorm?',
    fasiliteerderHoofpunt:
      'Moenie Week 1 verander in ’n algemene les oor "hoe om ’n goeie Christen te wees" nie. ' +
      'Die week moet by een vraag bly: WIE IS JESUS?\n\n' +
      'Die orde is Jesus → reaksie. Ons begin nie by ons behoeftes en maak Jesus daarna ’n hulpmiddel om ons bestaande lewe ' +
      'beter te laat werk nie. Ons begin by Hom.',
    fasiliteerderGrens:
      'Johannes 1 moet sy volle gewig dra: "die Woord was God" en "die Woord het mens geword". ' +
      'Moenie dit afwater tot "Jesus was ’n besondere geestelike mens" nie — dit sê minder as wat Johannes sê. ' +
      'Die krip was nie Jesus se begin nie: die menswording beteken nie dat Hy toe eers begin bestaan het nie. ' +
      'Moenie die Vader en die Seun verwar nie — Johannes sê die Woord was BY God én was God, en in Markus 1 sien ons Jesus, die Gees en die Vader se stem. ' +
      'Moenie Week 1 in ’n tegniese les oor die Drie-eenheid verander nie, maar moet ook nie die onderskeid uitvee nie. ' +
      'Markus 1 sê nie Jesus word by Sy doop vir die eerste keer die Seun nie — die toneel OPENBAAR Sy identiteit. ' +
      'By Matteus 1: moenie Jesus se sending reduseer tot meer sukses, meer geluk, meer selfvertroue of ’n makliker lewe nie. ' +
      'Die reël "agter sonde sien ons die neiging: God, ek wil my eie pad loop" is ’n teologiese opsomming en toepassing, ' +
      'nie ’n definisie wat Johannes 1 of Matteus 1 woordeliks gee nie — hou daardie onderskeid duidelik. ' +
      'Jakobus 2:19 is ONDERSTEUNEND: die punt is dat blote korrekte kennis oor God nie dieselfde is as ’n lewe van geloof en dissipelskap nie. ' +
      'Moenie geloof en gehoorsaamheid teen mekaar opstel asof geloof nie red nie maar goeie dissipelskap wel. ' +
      'Ons red onsself nie — maar die Jesus wat red, roep ook "Volg My". ' +
      'Moenie sê "jy word gered omdat jou lewe genoeg verander het" nie, maar moet ook nie uit vrees vir werke die oproep tot verandering verwyder nie. ' +
      'En moenie manipuleer nie: die boodskap mag dringend wees, maar moenie mense doelbewus onseker maak oor hulle verlossing, ' +
      '’n emosionele besluit afdwing, twyfel gelykstel aan verwerping, of mense onder groepsdruk plaas nie. ' +
      'Moenie in die groep vra wie eintlik nie gered is nie.',
    pastoraleRisiko: 'medium',
  },
}
