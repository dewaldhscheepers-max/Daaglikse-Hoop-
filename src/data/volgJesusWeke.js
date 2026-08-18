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
  /* ── Week 1, heeltemal oorgeskryf op 18 Augustus 2026 ──
   *
   * Dewald: "Hierdie dokument vervang die vorige Week 1 volledig. Moenie enige
   * ou Week 1-inhoud, ou stemboodskap, YouTube-video of vorige transkripsie
   * met hierdie weergawe meng nie."
   *
   * Die ou weergawe staan in die geskiedenis by commit 60682d3. MOENIE dit
   * terugplak nie.
   *
   * Wat die GEBRUIKER sien, staan nie meer in hierdie plat velde nie — dit is
   * 'n pad van stappe in src/data/volgJesusWeek1.js. Hierdie rekord bly bestaan
   * omdat die admin, die publiseer-hek en die openbare eindpunt daaraan hang:
   * die titel, die skrif, die vyf kontroles en `gepubliseer` loop steeds
   * hierdeur.
   *
   * `videoId` is opsetlik LEEG. Daar is geen video vir hierdie week nie; die
   * hoofboodskap is die stemboodskap, en sy adres word in die admin geplak. */
  1: {
    weeknommer: 1,
    titel: 'Wie sê jý is Jesus?',
    doel:
      'Nie om alles oor Jesus binne een week te verstaan nie, en nie om iemand skuldig genoeg te laat voel om groot beloftes te maak nie. Hierdie week het een doel: kyk weer na Jesus. Lees wat die Evangelies oor Hom sê, kyk eerlik na die beeld wat jy van Hom gevorm het, kyk na wat jou gewone lewe wys oor Wie werklik die laaste sê het — en begin self antwoord.',
    weekKern:
      'Jy kan Jesus se Naam ken, kerk toe gaan en Bybelverse ken — en steeds nog moet ontdek Wie Hy werklik is.',
    /* KORT. Dewald: "Moenie die huidige lang openingsblad gebruik nie ...
       Geen verdere intro." */
    openingskerm:
      'Jy hoef nie hierdie week alles uit te werk nie.\n\n' +
      'Ons begin net by Jesus.\n\n' +
      'Lees wat die Evangelies oor Hom s\u00ea. Luister. Wees eerlik.\n\n' +
      'En kyk waar hierdie vraag jou raak: Wie s\u00ea j\u00fd is Jesus?',
    primereSkrif: 'Matteus 16:13\u201317',
    ondersteunendeSkrif: 'Johannes 1:1\u201318',
    /* Geen video. Die hoofboodskap is die stemboodskap. */
    videoId: '',
    stemboodskapUrl: '',
    kernwaarheid:
      'Jy kan Jesus se Naam ken, kerk toe gaan en Bybelverse ken \u2014 en steeds nog moet ontdek Wie Hy werklik is.',
    eenSin:
      'Jy kan nie die kruis vir jou skuld vat en die troon vir jouself hou nie.',
    privaatRefleksie:
      'As ek heeltemal eerlik is, dink ek meestal aan Jesus as\u2026',
    gehoorsaamheidStap:
      'Kyk hierdie week een keer eerlik na een area van jou lewe \u2014 en vra wat dit wys oor wie werklik die laaste s\u00ea het.',
    gebed:
      'Here Jesus, ek wil U nie net ken uit wat ander mense oor U s\u00ea nie. Ek wil U self beter leer ken. Waar ek U te klein gemaak het, wys my. Waar ek net na U toe kom wanneer ek iets nodig het, leer my om ook by U te bly. Amen.',
    wallpaper: '/beelde/vj-w1-wallpaper.webp',
    moreTeaser:
      'M\u00f4re: ons hou vir \u2019n paar minute op vra wat Jesus vir ons kan doen, en kyk net na Wie Hy is.',
    dag1Titel: 'Wie s\u00ea j\u00fd is Jesus?',
    dag2Titel: 'Kyk weer na Jesus',
    dag3Titel: 'Wat wys my lewe eintlik oor wat ek glo?',
    dag4Titel: 'Het ek Jesus kleiner gemaak?',
    dag5Titel: 'Nou antwoord jy',
    groepVraag1:
      'Waarom is dit makliker om te vertel wat ander mense van Jesus glo as om self te antwoord?',
    groepVraag2:
      'Watter kleiner weergawes van Jesus vorm ons maklik \u2014 Jesus net as probleemoplosser, net as goeie leermeester, of \u2019n Jesus wat altyd met my saamstem?',
    groepVraag3:
      'Wat wys Johannes 1 wat enige t\u00e9 klein beeld van Jesus uitdaag?',
    groepVraag4:
      'Die stemboodskap vra: wie sit op die troon van jou lewe? Hoe kan iemand s\u00ea Jesus is Here, maar steeds in sekere dele van sy lewe self die laaste s\u00ea probeer h\u00ea?',
    fasiliteerderHoofpunt:
      'Jou een taak is om mense te help om na Jesus te kyk. Jy hoef nie elke vraag te kan antwoord of almal te oortuig nie. Wanneer die gesprek afdwaal: "Wat wys die teks vir ons oor Jesus?"',
    fasiliteerderGrens:
      'Die vraag "Wie s\u00ea j\u00fd is Jesus?" is persoonlik, maar dit beteken NIE dat elkeen self besluit Wie Jesus vir hulle is nie. Die Evangelies bepaal die inhoud van die antwoord; ons antwoord op Jesus, ons skep Hom nie. Moenie beweer dat Jesus Caesarea Filippi gekies het om Sy dissipels van openbare opinie te isoleer nie \u2014 Matteus gee nie daardie motief nie. Moenie maak asof Petrus reeds alles van Jesus se lyding en kruis verstaan het nie.',
    pastoraleRisiko: 'medium',
  },
}
