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
  └─ "Vertel my wat swaar is"
       └─ Is jy NOU in gevaar?   ── Ja ──▶  die nommers, dadelik
       │                                      └─ "Ek wil ook skryf"
       └─ Nee ──▶ die vorm
                    · wat is swaar (die teks)
                    · waaroor gaan dit (die onderwerp)
                    · anoniem of met 'n voornaam
                    · die drie toestemmings
                    · [krisisband verskyn as die woordlys tref]
                    └─ Stuur
                         └─ Ons het dit
                              1. die nommers (as dit 'n krisis is)
                              2. 'n video wat by sy onderwerp pas
                              3. 'n vers en 'n gebed
                              4. sy private kode
                              5. wil hy weet wanneer daar geantwoord word
```

Die gevaar-vraag kom **voor** die teksblok. 'n Mens wat nou in gevaar is, mag
nie eers 'n vorm invul om by 'n nommer te kom nie.

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

Die band wat tydens tik verskyn, wys **een** nommer met "Wys al die nommers"
daaronder. Al vyf is 'n hele skerm hoog, en as hulle bo inskuif verdwyn die
woorde wat die mens op daardie oomblik tik.

---

## Wat waar gestoor word

| Versameling | Wat | Wie mag |
|---|---|---|
| `sorg_inkomend` | die **rou** boodskap | net die diensrekening |
| `sorg_muur` | wat 'n mens goedgekeur en geredigeer het | net die diensrekening |
| `sorg_videos` | die videobiblioteek | net die diensrekening |
| `sorg_config/instellings` | die daaglikse plafon, oop/toe | net die diensrekening |
| `sorg_tellers/<dag>` | vandag se telling per dag en per toestel | net die diensrekening |

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

## Die admin-geheim

Nie die PIN nie. Daardie PIN (2025) staan in die bondel wat elke besoeker
aflaai; dit hou niemand uit nie. Dieselfde geheim gaan die boodskappe
ontsluit.

`SORG_ADMIN_GEHEIM` staan op Vercel, minstens 16 karakters, en **nooit** in
hierdie kode nie. Is dit nie opgestel nie, weier die bediener alles — 'n
stelsel wat oopgaan omdat iemand vergeet het om 'n veranderlike te stel, is
erger as een wat glad nie werk nie.

---

## Toetse

```
node src/data/sorg.toets.mjs      # 76 toetse
node api/_sorg-videos.toets.mjs   # 22 toetse
```

Die eerste toets kyk spesifiek na die **karakterreeks-fout** — `[ -<>]` lyk
soos vier karakters maar is 'n reeks van spasie tot `<`, en dit gooi
stil-stil syfers en spasies uit iemand se boodskap. Dit het al twee keer in
hierdie projek gebeur. Sien CLAUDE.md.

---

## Wat nog nie gebou is nie

* Die **muur** self, die reaksies en Dewald se antwoorde onder elke plasing.
* Die **keurpaneel** waar 'n mens `sorg_inkomend` lees, redigeer en na
  `sorg_muur` stoot.
* Die bestaande Luister-stemnotas moet met die Sorg-onderwerpe gemerk word,
  sodat die biblioteek op dag een vol is.

Voordat die eerste boodskap gestoor word, moet die regswerk klaar wees:
POPIA se "spesiale persoonlike inligting", die Children's Act a110
(verpligte aanmelding van 'n kind in gevaar), die Sexual Offences Act a54, en
laster. Dit is nie 'n tegniese punt nie.
