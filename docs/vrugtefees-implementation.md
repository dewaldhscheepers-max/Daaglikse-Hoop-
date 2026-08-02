# Vrugtefees — hoe dit gebou is

'n Match-3-spel in Daaglikse Hoop. Nege hoofstukke, negentig fases, en twee
oes-wyses met 'n wêreldwye ranglys.

Hierdie dokument verduidelik die besluite wat nie uit die kode alleen blyk
nie — veral dié wat uit foute gekom het.

---

## Die lêers

| Lêer | Wat dit doen |
|---|---|
| `src/game/vrugtefees/enjin.js` | Die match-3-logika. Suiwer, deterministies, geen DOM. |
| `src/game/vrugtefees/oes.js` | Die reels van 'n oes-lopie. **Gedeel met die bediener.** |
| `src/game/vrugtefees/teken.js` | Die canvas-tekenaar. |
| `src/data/vrugtefeesVlakke.js` | Die 90 fases en die doelwit-tipes. |
| `src/data/vrugte.jsx` | Nege vrugte as SVG. |
| `src/data/vrugtefeesRanglys.js` | Die kliënt se kant van die ranglys. |
| `src/data/vrugtefeesPrestasies.js` | Prestasies (net plaaslik). |
| `src/screens/Vrugtefees.jsx` | Die skerm — al drie speelwyses. |
| `src/components/Oesmeesters.jsx` | Die ranglysskerm. |
| `src/components/TuinAgtergrond.jsx` | Die agtergrond: 'n getekende tuin plus 'n geskilderde prent. |
| `api/vrugtefees-ranglys.mjs` | Die bediener. Speel elke lopie oor. |

### Toetse

```
node src/game/vrugtefees/enjin.toets.mjs      # 133 toetse
node src/game/vrugtefees/oes.toets.mjs        # 252 toetse
node src/game/vrugtefees/ranglys.toets.mjs    #  58 toetse
node src/game/vrugtefees/vlakke.toets.mjs     # keur al 90 fases
node src/game/vrugtefees/balanseer.mjs        # stel onhaalbare fases outomaties
```

---

## Die drie speelwyses

**Die Tuinreis** — 90 fases met doelwitte, in nege hoofstukke van tien. Elke
hoofstuk het 'n naam uit die vrug van die Gees en 'n eie agtergrond.

**Die Oneindige Oes** — jy begin met 25 skuiwe. Elke ronde vra 'n hoeveelheid
van een vrug; klaarmaak gee 9 skuiwe by en die volgende ronde vra meer. Dit
eindig wanneer die skuiwe op is.

**Vandag se Oes** — dieselfde reels, maar die saad kom uit die datum in UTC.
Almal ter wêreld speel presies dieselfde bord, en dit begin elke middernag oor.

---

## Die bediener speel elke lopie oor

Dit is die belangrikste ding aan fase 3, en dit is die punt waar hierdie spel
van Bou die Ark verskil.

Bou die Ark se ranglys moes **raai**. Sy bediener kon net vra of 'n lopie
fisies moontlik lyk — "is veertig lyne met twaalf stukke haalbaar?" Dit is 'n
heuristiek, en 'n mens wat mooi lieg, kom deur.

Vrugtefees se enjin is deterministies. Dieselfde saad en dieselfde skuiwe gee
altyd dieselfde bord en dieselfde punte. Daarom stuur die kliënt:

```json
{ "naam": "...", "soort": "oneindig", "saad": 1124177359,
  "skuiwe": [[2,5,2,6], [7,2,7,3], ...], "idToken": "..." }
```

**Geen puntetelling nie.** Die bediener bou die bord uit die saad, speel elke
skuif deur `oes.js` — dieselfde lêer wat die skerm gebruik — en tel self. Wat
hy kry, is wat tel. Om te bedrieg moet jy 'n bot skryf wat werklik goed
match-3 speel; op daardie punt het jy die spel eerliker gewen as die meeste
mense.

Dat die twee kante werklik ooreenstem, is nie 'n aanname nie. Dit word getoets:

* `oes.toets.mjs` speel 40 lopies en eis dat `herspeel()` presies dieselfde
  punte, rondes en skuiwe gee as die gespeelde lopie.
* 'n Blaaiertoets bereken vandag se lopie in Node, speel presies daardie
  skuiwe in Chromium deur die regte doek, en vergelyk. Al 88 skuiwe geldig,
  47 524 punte aan albei kante.

### Waarom `oes.js` niks van die blaaier mag weet nie

Geen `window`, geen `Date.now()`, geen `Math.random()`. Alles wat 'n
toevalsgetal nodig het, kom uit 'n saad, en `dagSleutel()` neem 'n `Date` in
plaas van self een te maak. As dit ooit verander, dryf die twee kante
uitmekaar en dan verwerp die bediener **eerlike** spelers — 'n fout wat
niemand sou kon debug nie.

Om dieselfde rede kom die ronde se gevraagde vrug uit sy **eie** saad
(`rondeVrug(saad, ronde)`) en nie uit die lopie se lopende rng nie. Anders sou
die volgorde van rng-oproepe tussen skerm en bediener presies moes klop, en
een verdwaalde oproep is genoeg om alles te breek.

### Die twee borde is nie ewe streng nie

* **Oesmeesters** (beste ooit): die speler kies sy eie saad. Iemand met 'n bot
  kan dus sade sit en soek tot 'n gunstige een kom. Dit word nie weggesteek
  nie — hierdie bord is 'n persoonlike beste.
* **Vandag se Oes**: die bediener bereken die saad **self** uit die dag en
  ignoreer wat die kliënt stuur. Niemand kan 'n gunstige bord kies nie. Dit is
  die eerlike geveg, en dit is die bord wat eerste wys.

Gister se lopie word geweier: `dag !== vandag` → 400.

---

## Die moeilikheidskurwe

Dewald het op fase 7 vasgesit, en toe weer op fase 11. Albei kere het my
keurder dit deurgelaat, want ek het een vaste drempel gebruik (70% vir 'n bot
wat elke keer die beste skuif speel). Dit klink redelik — maar fase 11 kom net
ná 'n hoofstuk waar elke fase 100% is. Die skok was die probleem, nie die fase
nie.

Die drempel is nou 'n helling:

| Fases | Bot moet wen |
|---|---|
| 1–10 | 95% |
| 11–20 | 88% |
| 21–40 | 80% |
| 41–90 | 72% |

Fases 1–10 mag maklik wees: hulle leer die speler. Van fase 11 af moet slordige
spel wel kan misluk, anders is dit nie 'n spel nie.

`vlakke.toets.mjs` keur ook of 'n doelwit **hoegenaamd kan bestaan** — ek het
drie fases gebou wat vra vir 'n vrug wat nie op daardie bord verskyn nie, en
die bot het dit as "0% haalbaar" gerapporteer sonder om te sê hoekom.

Die Oneindige Oes se getalle is ook gemeet, nie geraai nie. My eerste
raaiskoot (18 met 4 by elke ronde) het beteken die gemiddelde speler haal
**nul** rondes — 'n modus wat "oneindig" heet en by die eerste hek toemaak.
Agt met drie by gee 'n goeie speler omtrent sewe rondes, 'n gemiddelde een
drie, en niemand kry nul nie.

Let op dat die teiken lineêr groei terwyl elke ronde 'n **vaste** aantal
skuiwe teruggee. Elke lopie eindig dus noodwendig, hoe goed 'n mens ook al
speel — daarom kan die bediener se perk van 3000 skuiwe nooit 'n eerlike
speler afsny nie.

---

## Die bord is 'n canvas, en hoekom

My eerste poging was DOM. Dit was verkeerd: die selle was aan hul
roosterposisie vasgemaak, dus het niks ooit beweeg nie — vrugte het net
verdwyn en verskyn. Dewald se woorde was "dit wys nie regtig hoe dit beweeg
nie". 'n Mens moet SIEN hoe hulle gly en val.

### Die reels wat uit Bou die Ark se strepe kom

Op Dewald se vrou se Android-foon het Bou die Ark gekleurde strepe gewys —
rou GPU-geheue. Die oorsaak was uiteindelik `transform: scale(0.94)` op
`:active`, wat by elke druk 'n saamgestelde laag maak en breek. Vier reels
geld sedertdien oral in hierdie spel:

1. Die doek loop met `getContext('2d', { willReadFrequently: true })`, wat
   Chrome laat kies om dit op die SVE te hou in plaas van 'n eie GPU-laag.
2. **Geen `border-radius` op die doek nie.** 'n Afgeronde rand op 'n
   saamgestelde element dwing 'n maskerlaag. Die afronding word binne die doek
   geteken.
3. **Geen `transform` of `opacity` op `:active` nie.** Net kleur verander.
4. Die doek se buffer kom **net uit sy breedte**, nooit uit sy hoogte nie. Op
   Android skuif Chrome se adresbalk in en uit, en elke skryf na
   `canvas.width` maak die doek skoon.

---

## Klein besluite wat maklik verkeerd gaan

**'n Leë lys is nie 'n fout nie.** `haalRanglys()` gee `null` terug wanneer dit
misluk, nooit `[]`. Anders wys die skerm 'n netwerkfout as "niemand speel nie".
Dieselfde reel geld in `Oesmeesters.jsx`.

**'n Punt wat nie deurgekom het nie, word nie weggegooi nie.** Dit gaan in 'n
wagry in localStorage. 'n 4xx beteken die bediener het dit oorgespeel en
afgekeur — dit gaan nooit slaag nie, dus bly dit nie in die wagry nie. Gister
se daaglikse lopie word stil laat val eerder as om ingestuur te word om
geweier te word.

**Die naam word ná die lopie gevra, nie voor nie.** Dewald het dit by Bou die
Ark uitgewys: moenie iets vra voordat 'n mens weet of jy wil nie.

**Prestasies is net plaaslik.** Dit is met opset. 'n Prestasie is vir jouself;
om dit te laat tel sou beteken ons moet dit ook kan bewys. Die ranglys is waar
bewys saak maak.

**Die naam word apart van Bou die Ark s'n gehou** (`vf_naam`, nie `ark_naam`
nie). Iemand kan met 'n ander naam op die tuin-ranglys wil wees, en om die
keuse te deel sou beteken 'n verandering op die een plek verander stilweg die
ander.

**Karakterreekse in 'n regex.** `skoonNaam` gebruik `[\u0000-\u001f\u007f...]`,
met eksplisiete kodepunte. 'n Reeks soos `[ -<]` lyk onskuldig maar loop van
spasie tot `<` en verwerp dus syfers en spasies. Daardie fout was al twee keer
in hierdie kodebasis.

**'n Gesentreerde flex-houer wat oorloop, sny die bokant af** en daardie deel
is onbereikbaar — 'n mens kan net na onder rol. `.vf-blad` gebruik dus
`justify-content: flex-start` met `margin-top: auto` op die eerste kind en
`margin-bottom: auto` op die laaste: dit sentreer wanneer daar plek is en gee
pad wanneer daar nie is nie.

---

## Klank

Vrugtefees het tot fase 2 Bou die Ark se houtplanke geleen, en dit was
verkeerd: hout is dof, droog en dood — presies wat 'n ark moet wees en presies
wat 'n vrug nie is nie.

Die vrugte-klanke in `src/utils/sound.js` (`playVrugPas`, `playSpesiaal`,
`playKombinasie`, `playOesRonde`, `playOesKlaar`) is kort en sappig: 'n
vinnige toonhoogteval vir die stingel wat breek, 'n baie kort gefiltreerde
ruis vir die skil, en 'n sagte lyf daaronder. Geen klokkie nie — Vredepad se
klokkies bly Vredepad s'n, en 'n klokkie in 'n tuin klink na glas.

Bou die Ark en Vredepad se klanke is heeltemal onaangeraak.

---

## Die agtergronde

Sewe is uit Dewald se eie prente gemaak: 720px breed, effens vervaag en
verdonker, as WebP van omtrent 45 KB elk. Die bronne was PNG's van 2,5 MB en
'n mens sien geen verskil agter 'n bord nie.

Daar is nege hoofstukke en sewe prente, dus is `sagmoedigheid.webp` en
`selfbeheersing.webp` uit `vrede` en `getrouheid` hergradeer — die een stiller
en mistig, die ander koeler en donkerder. As daar ooit twee regte prente is,
vervang net die lêers.

`Vrugtefees.jsx` het lank net 0 of 1 as hoofstuknommer deurgegee, wat beteken
al nege hoofstukke het twee agtergronde gedeel. Sewe geskilderde tuine wat
niemand ooit gesien het nie.

---

## Firestore

Twee versamelings, albei heeltemal toe vir kliënte:

```
match /vfOesmeesters/{userId} { allow read: if false; allow write: if false; }
match /vfDagoes/{userId}      { allow read: if false; allow write: if false; }
```

Firestore weier klaar waar geen reel pas nie, dus is hierdie blokke nie wat die
versamelings toemaak nie — hulle staan daar sodat die bedoeling swart op wit is
en niemand dit later per ongeluk oopmaak nie.

Die daaglikse bord dra 'n `dag`-veld en word op lees gefiltreer. Gister se rye
bly staan maar pas nie meer nie, dus maak die bord homself skoon sonder dat ons
rye hoef uit te vee.

Die uid kom altyd uit die geverifieerde Firebase ID-token (`eis.sub`), nooit
uit die versoek se liggaam nie.

---

## Wat nog nie gedoen is nie

* Die twee laaste agtergronde is hergradeerde weergawes, nie eie prente nie.
* Daar is geen bediener-kant beperking op hoe dikwels 'n mens kan instuur nie.
  Elke instuur speel 'n lopie oor, wat SVE kos; as dit ooit misbruik word, is
  'n tempo-perk per uid die regte plek om te begin.
