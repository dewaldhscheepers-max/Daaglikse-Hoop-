# Pastorale Sorg

Wat hier gebou is, en — belangriker — hoekom dit so gebou is. Lees dit voor
jy aan Sorg raak. Die meeste besluite hier is nie smaak nie; hulle kom uit
wat met 'n mens gebeur wat sy swaarste ding in 'n app tik.

---

## Die een reel wat alles bepaal

**Hoop kom voor pyn.**

Iemand wat in krisis by hierdie blad aankom en veertig plasings van ander se
lyding lees, gaan slegter weg as wat hy gekom het. Daarom:

* die video staan **bo**, die muur **onder**;
* elke plasing op die muur dra iets by wat help — 'n antwoord of 'n video;
* die skryfknoppie sit binne die **eerste** skerm. Wie huil, moet nie eers
  verby twee video's blaai nie.

En: **geen versoek om geld op die skryfkant nie.** Nooit waar iemand sy seer
tik nie.

---

## Die vloei

```
Sorg-blad
  └─ "Deel jou storie of vraag →"
       └─ EEN bladsy
            [klein noodbalk: is jy nou in gevaar? Kry hulp nou]
            · tik jou vraag of vertel jou storie
            · waaroor gaan dit (OPSIONEEL)
            · anoniem of jou voornaam
            · EEN blokkie
            · [krisisband verskyn as die woordlys tref]
            └─ Deel my boodskap
                 └─ Dankie. Jou boodskap is ontvang.
                      1. die nommers (as dit dringend klink)
                      2. twee sinne oor wat nou gaan gebeur
                      3. 'n video om NOU te kyk
```

Dit was 'n vyf-skerm-proses met 'n aparte gevaarvraag, drie toestemmings, 'n
private kode en 'n bevestigingsblad so lank soos 'n kontrak. Dewald het dit
reguit gestel: **net om 'n boodskap te tik was 'n moerse proses.** Hy was
reg. Nou is dit ongeveer dertig sekondes.

### Wat opsetlik WEG is

| Wat | Hoekom |
|---|---|
| Die aparte "is jy in gevaar"-skerm | Dit het elke mens deur 'n nooddeur laat loop om by 'n teksblok te kom. Nou is dit 'n klein balk bo-aan, altyd daar. |
| Die sigbare private kode en "Kopieer die kode" | Niemand wil 'n kode verstaan, kopieer en bêre nie. Die kode BESTAAN nog op die bediener — Dewald het hom nodig om 'n boodskap uit te wys — maar die mens sien hom nooit. |
| Twee van die drie toestemmings | Drie blokkies wat almal net gemerk word om verby te kom, beskerm niemand meer as een wat gelees word nie. |
| Die vers en die gebed op die bevestigingsblad | Iemand wat pas sy hart neergesit het, wil nie 'n bladsy lees nie. Die video was die deel wat werk. |
| Die selfdiens-uitvee | Mense gee toestemming dat dit openbaar gaan. Hulle kan nie plaas en dan weer uitvee nie. |

### Dit moet OPENBAAR wees, en dit moet BO staan

Direk bo die tekskassie, nie in fyn druk onder nie:

> Jou boodskap sal, nadat dit nagegaan is, **openbaar op die Pastorale
> Sorg-muur** verskyn, waar ander mense dit kan lees en saam met jou kan bid.
>
> Dit is nie 'n private boodskap net aan Dewald nie. Moenie name,
> kontakbesonderhede of inligting deel wat iemand kan identifiseer nie.

Niemand mag later kan sê hulle het gedink dit gaan privaat net na Dewald toe.

**POPIA bly egter geld.** Die blokkie beteken nie dat iemand nooit weer
verwydering mag versoek nie — die Inligtingsreguleerder het 'n amptelike
vorm daarvoor. Die praktiese oplossing is: geen maklike
"vee my plasing uit"-knoppie nie, en geen kode wat die gebruiker moet
bestuur nie, maar Dewald kan enige plasing in die keurpaneel verwyder
wanneer iemand vra.

---

## Die krisis-vangnet

`src/data/sorgKrisis.js` hou die woordlys. Twee dinge wat nie verwar moet
word nie:

1. Dit is 'n **vangnet**, nie 'n hek nie. Die hek is 'n mens wat elke
   boodskap lees. 'n Woordlys vang "ek wil myself doodmaak"; net 'n mens vang
   "ek dink nie ek gaan hier uitkom nie".
2. Wanneer dit tref, is die doel **nie om die boodskap te keer nie**. Die doel
   is om die nommers te wys. Die boodskap gaan altyd deur — ook wanneer die
   dag se plafon vol is.

Die lys loop op die **skerm** (sodat die nommers dadelik wys) én op die
**bediener** (sodat 'n mens dit nie omseil deur die JavaScript te verander
nie).

Die band wat tydens tik verskyn, wys **SADAG en 112** met "Wys al die
noodnommers" daaronder. Al vyf is 'n hele skerm hoog, en as hulle bo inskuif
verdwyn die woorde wat die mens op daardie oomblik tik.

Die woorde saak ook. Dit is nie *"Ons het gelees wat jy skryf"* nie — dit laat
klink of iemand persoonlik op daardie oomblik aanlyn sit en lees. Dit is:

> **Wat jy tik, klink dringend.**
> Moenie vir 'n antwoord hier wag nie. Jou boodskap gaan deur — moet dit
> asseblief nie uitvee nie — maar bel asseblief nou.

---

## Wat waar gestoor word

| Versameling | Wat | Wie mag |
|---|---|---|
| `sorg_inkomend` | die **rou** boodskap | net die diensrekening |
| `sorg_muur` | wat 'n mens goedgekeur en geredigeer het | net die diensrekening |
| `sorg_videos` | die videobiblioteek | net die diensrekening |
| `sorg_config/instellings` | die daaglikse plafon, oop/toe | net die diensrekening |
| `sorg_tellers/<dag>` | vandag se telling per dag en per toestel | net die diensrekening |
| `sorg_saam` | wie watter plasing saamdra | net die diensrekening |

`firestore.rules` sit **alles** hier op `read: false, write: false`. Firestore
weier klaar waar geen reel pas nie; die blokke staan daar sodat niemand dit
later per ongeluk oopmaak nie. As iemand ooit `allow read: if true` daar
bo-op sit, lees die hele internet 'n vrou se beskrywing van haar
mishandeling.

Op die **foon** word die teks **nêrens** gestoor nie — ook nie as 'n konsep
nie. In baie huise is die foon gedeel. Wat wel plaaslik bly, is die
bestuurskode, die onderwerp en die datum (`sorg_myne`).

---

## Die private kode

Elke boodskap kry 'n kode soos `HKMT-9RQP-24VX`. Dit is die **enigste** bewys
dat 'n anonieme plasing syne is, en POPIA gee hom die reg om dit te laat
verwyder. Vorm: geen `0`, `O`, `1` of `I`, in blokke van vier, sodat 'n mens
dit hardop kan lees.

---

## Die daaglikse plafon

Verstek 20, verstelbaar uit die admin (`/api/sorg-instellings`).

Dit is nie 'n tegniese perk nie — dit is **hoeveel een mens in 'n dag
behoorlik kan lees**. 'n Ry wat die leser verbyhardloop, is erger as geen
muur nie. Sit dit op 0 wanneer Dewald weg is; dan sien mense 'n vriendelike
boodskap in plaas van 'n stilte.

Drie per toestel per dag. Krisisboodskappe kom **altyd** deur.

Die telling loop deur `sorg_tellers/<dag>` — een klein dokument, nie 'n
telling oor die hele versameling nie, want daardie lys groei saam met die
muur en dan word elke indiening stadiger namate meer mense skryf.

---

## Die vers ná die indiening

`src/data/sorgVerse.js` hou net **verwysings**, nooit versteks nie. Die
woorde kom uit die Getroue Afrikaanse Bybel wat reeds in die app is
(`gabVers`). Twee redes, albei hard:

1. 'n Afrikaanse vers wat 'n mens uit die geheue tik, is verkeerd.
2. Die GAB is CC BY-NC-ND — die teks mag nooit verander word nie, ook nie per
   ongeluk deur oortik nie, en die erkenning wys saam.

Die toets keur dit: `sorgVerse.js` mag geen `teks:`-veld hê nie, en elke
boekkode moet in `bybelBoeke.js` bestaan.

---

## Die noodnommers

**Een plek:** `src/data/sorgNommers.js`. 'n Dooie noodnommer is die enigste
ding hier wat regtig verkeerd kan loop. Die toets keur dat geen skerm 'n
nommer in sy eie kode het nie.

> **Hulle moet voor bekendstelling nagegaan word — elke nommer geskakel.**

---

## Die wagwoord — EEN, en die bediener keur hom

Die admin het 'n PIN gehad wat **in die kode** gestaan het (`ADMIN_PIN =
'2025'`). So 'n string beskerm niks: die app se lêers is openbaar, enigiemand
kan hulle oopmaak en dit lees, en dit vat sowat dertig sekondes. 'n Langer
wagwoord op dieselfde plek sou presies net so oop wees — hy sou net sterker
gelyk het.

Nou weet die app die wagwoord **nie**. Wat getik word, gaan na
`/api/sorg-sluit`, en die bediener vergelyk dit in konstante tyd met
`SORG_ADMIN_GEHEIM` wat net op Vercel bestaan.

**Agt raaipogings per kwartier per adres.** Die telling le in Firestore
(`sorg_slot`) en nie in die geheue nie — Vercel se funksies leef 'n paar
minute en dan sou 'n telling in die geheue weg wees, wat presies is wat 'n
mens NIE by 'n slot wil he nie. Die slot word EERSTE getoets, voor die
wagwoord: andersom sou iemand wat op poging 4000 die regte een raai, net
deurgaan.

Minimum twaalf karakters. Sestien was my eie getal, nie 'n vereiste nie.

Een wagwoord ontsluit **alles** — die notas, die boeke, die video's, én
Pastorale Sorg se boodskappe. Die tweede wagwoordskerm wat Sorg gehad het, is
weg.

Is die veranderlike nie opgestel nie, sê die skerm dit reguit en niks gaan
oop nie. 'n Stelsel wat oopgaan omdat iemand vergeet het om 'n veranderlike
te stel, is erger as een wat glad nie werk nie.

> **Wat nog nie beskerm is nie:** die ander versamelings in `firestore.rules`
> (`notes`, `books`, `config`, `prayers`…) het `allow write: if true`.
> Enigiemand kan hulle direk skryf, met of sonder die adminwagwoord — die PIN
> het hulle nooit beskerm nie, ook nie voorheen nie. Dit is 'n aparte stuk
> werk en dit raak die lewende app, dus is dit nie saam met hierdie
> verandering gedoen nie.

---

## Toetse

```
node src/data/sorg.toets.mjs        # die indiening en die krisisvloei
node api/_sorgFirestore.toets.mjs   # die Firestore-laag en die blaai
node api/_sorg-videos.toets.mjs     # die videologika
```

### Die stil fout wat `_sorgFirestore.toets.mjs` vashou

Firestore se REST-API gee dokumente terug in volgorde van hul **naam**, een
bladsy op 'n slag, met 'n `nextPageToken` vir die res. Ons het daardie teken
geignoreer.

Ons id's begin met die tyd (`b` + `Date.now()` in basis 36), dus is
alfabetiese volgorde **tydvolgorde**, en die eerste bladsy is die **oudste**
driehonderd. Sodra daar een dokument meer as driehonderd was, sou elke NUWE
boodskap agter die teken le en nooit verskyn nie — nie in die inbak nie en
nie op die muur nie. Niks sou breek nie. Dit sou net stil ophou.

Die eerste toets kyk spesifiek na die **karakterreeks-fout** — `[ -<>]` lyk
soos vier karakters maar is 'n reeks van spasie tot `<`, en dit gooi
stil-stil syfers en spasies uit iemand se boodskap. Dit het al twee keer in
hierdie projek gebeur. Sien CLAUDE.md.

---

## Die muur en die antwoorde

Die drie oortjies is drie **uitsigte** op dieselfde plasings, nie drie plekke
nie:

| Oortjie | Wat dit wys |
|---|---|
| Die Muur | almal, nuutste eerste |
| Die Video's | die biblioteek volgens behoefte |

Bo-aan Die Video's staan **"Een video. Elke week."** met die verduideliking
dat die video's uit die onderwerpe op die muur ontstaan. Sonder dit lyk die
afdeling soos enige videobiblioteek; met dit sien 'n mens die kring:

```
mense deel  →  hy luister  →  een video  →  baie word gehelp
```

Die week se video dra dieselfde boodskap in een reel: *"Gebaseer op wat mense
hierdie week op die muur gedeel het."*

"Dewald antwoord" was 'n derde oortjie wat dieselfde plasings gewys het, net
gefiltreer. Dit het die blad ingewikkeld laat lyk sonder om iets by te voeg —
die antwoord sit in elk geval BINNE die plasing.

Dewald se antwoord sit **binne dieselfde kaart**, direk onder die persoon se
woorde. Nie 'n aparte blad nie en nie 'n draad nie — dit is die enigste
manier waarop iemand sien dat daar op SY ding geantwoord is.

Is daar nog nie 'n antwoord nie, dra die plasing 'n **video**. Nooit net
iemand se pyn alleen op 'n skerm nie.

Die antwoord kom in drie vorme, en die stemnota word **in die keurpaneel
self** gemaak — presies soos die stemnotas op Luister:

| Vorm | Hoe |
|---|---|
| **Stemnota** | Kies 'n klanklêer, of **neem dit daar en dan op**. Dit gaan na Firebase Storage onder `sorg-antwoorde/`. |
| **Video** | 'n YouTube-skakel. Daardie bandwydte hoort nie by ons nie. |
| **Geskrewe** | Net woorde. |

Dit was eers net 'n plek om 'n *skakel* te plak, wat beteken het hy moes die
klanklêer eers iewers anders oplaai. Dit is 'n omweg wat niemand elke dag
gaan loop nie.

### Die reaksie

Daar is **een**, en dit is nie 'n punt nie. "37 mense dra dit saam met jou"
is geselskap; 'n telling wat plasings teen mekaar rangskik, maak van iemand
se pyn 'n wedstryd. Daarom:

* net een soort reaksie, en dit is 'n saamdra en nie 'n "hou van" nie;
* **geen rangskikking volgens die telling nie** — die muur is altyd nuutste
  eerste;
* **geen kommentaar nie.** Geen vreemdeling se raad onder 'n vrou se
  beskrywing van haar huwelik nie.

### Deel · Ondersteun

Die klein rytjies hang aan die ding self, dus bestaan hulle vanself net waar
daar 'n video of 'n antwoord IS. Dit is die reel wat saak maak, en dit word
outomaties nagekom.

Heel onderaan staan die gewone **`<DonationCard />`** — dieselfde komponent
as op E-boeke, Bybel, Leesplanne en die kinderboeke. Nie 'n eie weergawe nie.

Ek het eers 'n eie blok hier gebou met eie woorde en eie knoppies. Dit was
verkeerd op twee maniere: dieselfde versoek moet oral dieselfde LYK (iemand
wat die groen "Word 'n Maandelikse Hoop-Vennoot" elders leer ken het, moet
hom hier herken sonder om te lees), en wanneer die woorde eendag verander,
moet hulle op EEN plek verander.

Hy was ook 'n rukkie voorwaardelik — net as daar 'n video of 'n antwoord was.
Met nul video's en 'n lee muur het die hele blok toe verdwyn, en dan lyk dit
of die knoppies weggevat is in plaas van dat hulle wag. Hy staan nou altyd
daar.

Onder elke antwoord en elke video staan een klein rustige ry: **Deel** eerste
en prominenter (groei is die prioriteit), dan **Ondersteun**. Nie "Maak 'n
donasie" nie — sagter, minder geldgedrewe, en dit maak dieselfde blad oop wat
reeds bestaan.

Elke gedeelde skakel gaan **direk na daardie spesifieke antwoord of video**
(`#sorg-plasing-<id>` / `#sorg-video-<id>`). Iemand wat 'n skakel op WhatsApp
kry, moet die ding sien waaroor die persoon gepraat het, nie 'n vreemde
tuisblad nie.

Die GROOT steunblok staan **een keer**, heel onderaan die blad. 'n Klein
teksry raak nooit te veel nie; groot donasieblokke oral wel. En op die
skryfkant is daar niks — nooit waar iemand sy seer tik nie.

### Die keurpaneel

`SorgKeur.jsx`, binne die Sorg-admin, agter `SORG_ADMIN_GEHEIM`. Vier hopies:

```
Gevaar → Nuut → Op die muur → Gelees
```

Gevaar staan eerste en wys **watter woorde getref het**, sodat Dewald sien
hoekom sonder om eers alles te lees.

In die Gevaar-hopie staan daar **nie** "Lees en keur" nie, en daar is **geen
"Vee uit"** nie. 'n Boodskap waarin iemand van selfmoord skryf, mag nie met
een verkeerde druk openbaar gaan nie, en mag nie met een verkeerde druk
permanent verdwyn nie. Daar is **Lees nou** en **Hou terug**. Die keurblok wys die rou teks in 'n
redigeerbare blok; wat hy stoor, is wat op die muur beland. Bly daar 'n
nommer of e-posadres in, waarsku die bediener voordat dit deurgaan.

Die muur is 'n **aparte versameling**, nie 'n vlaggie op die inkomende
dokument nie. Was dit 'n vlaggie, sou die rou teks en die goedgekeurde teks
in dieselfde dokument sit, en dan is een verkeerde lees genoeg.

---

## Wat nog nie gebou is nie

* Die bestaande Luister-stemnotas moet met die Sorg-onderwerpe gemerk word,
  sodat die biblioteek op dag een vol is.
* Die persoon se **bestuurskode** kan nog nie deur homself gebruik word om
  sy plasing te laat verwyder nie — Dewald doen dit vir hom in die
  keurpaneel.
* Kennisgewing wanneer daar op JOU plasing geantwoord is. Die toestemming
  word reeds gevra; die stuurkant is nog nie gebou nie. Wanneer dit kom:
  **nooit die teks in die kennisgewing nie.**

Voordat die eerste boodskap gestoor word, moet die regswerk klaar wees:
POPIA se "spesiale persoonlike inligting", die Children's Act a110
(verpligte aanmelding van 'n kind in gevaar), die Sexual Offences Act a54, en
laster. Dit is nie 'n tegniese punt nie.
