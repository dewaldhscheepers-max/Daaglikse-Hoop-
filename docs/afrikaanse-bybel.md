# Die Afrikaanse Bybel in Daaglikse Hoop

## Hoekom die GAB en nie die 1953 of 1983 nie

Die Bybelgenootskap van Suid-Afrika het die versoek skriftelik geweier.
Hulle woorde: *"we are unable to grant permission for the direct inclusion of
our Bible texts within third-party applications"* en *"no digital copyright
permissions are currently being considered or granted"*. Dit is nie 'n
onderhandeling wat sleg geloop het nie — hulle oorweeg die soort versoek glad
nie.

Die **Getroue Afrikaanse Bybel** is 'n onafhanklike 2026-vertaling wat direk
uit die 1769 Cambridge King James gemaak is, en die projek stel dit self onder
'n **CC BY-NC-ND 4.0**-lisensie beskikbaar. Daardie lisensie is 'n openbare,
skriftelike toestemming, en dit is hoekom hierdie een wél hier kan wees.

<https://getroueafrikaansebybel.com>

Daar dryf ook 'n "publieke domein" 1953-teks op eBible.org en in die
SWORD-projek rond. **Moenie daaraan raak nie.** Dit is presies dieselfde teks
wat BSA geweier het, en die weiering staan op skrif.

---

## Die drie voorwaardes wat nooit mag uitval nie

**1. Erkenning.** Naam, kopiereg, lisensie en 'n skakel na die bron, oral waar
die teks wys. Dit sit in `GAB_ERKENNING` (`src/data/gab.js`), word onderaan
elke hoofstuk gewys, en die volledige weergawe staan op die "Oor hierdie
vertaling"-blad.

**2. Onveranderd.** ND beteken GeenAfgeleides. Sien jy 'n drukfout of 'n
vertaalfout, **rapporteer dit by die projek** — moet dit nie hier regmaak nie.
'n Reggemaakte teks is 'n afgeleide werk en mag nie versprei word nie.
`skrifte/bou-gab.mjs` verander doelbewus niks behalwe wit spasie aan die punte.

**3. Nie-kommersieel.** Geen betaalmuur, geen advertensie, en **niks wat om
geld vra op die skerm waar die Skrifteks self wys nie.**

Daar is wel 'n `Steun`-blok, maar hy staan op die **boekelys**, nooit onder 'n
hoofstuk se teks nie. CC se eie uitleg is dat "nie-kommersieel" gaan oor
gebruik wat hoofsaaklik op kommersiele voordeel gerig is — nie oor elke sent
wat 'n bediening ooit hanteer nie. Wat die saak maak of breek, is die konteks:

* die Bybel is gratis en toegang hang van geen betaling af nie;
* geen betaalmuur, geen advertensie;
* dit is 'n bediening wat om ondersteuning vra, nie 'n winkel nie;
* en die eerste sin se dit hardop: *"Die Bybel sal altyd gratis bly."*

Daardie eerste sin is nie versiering nie — dit is die ding wat die
nie-kommersiele posisie sterker maak. **Dit mag nie uitval nie, en die blok
mag nie na die leesskerm skuif nie.** 'n Blaaiertoets hou albei vas.

Ter ondersteuning: elke e-boek in die app is gratis (`Meer.jsx` — "Elke e-boek
is gratis"). Die `price`-velde in `src/data/books.js` is dooie data wat nie meer
gebruik word nie.

---

## Waar die teks vandaan kom

Die GAB-projek publiseer geen aflaaibare lêer nie en het geen kontakadres nie.
Ons het dit uitgevind met verkenningslopies vanaf 'n GitHub-werkstroom (die
gewone HAR-metode was toe, want daar is nie 'n rekenaar nie).

Wat die verkenning gewys het, in volgorde:

1. Die werf is **Astro**. `config.js` gee 'n Supabase-adres en 'n
   `sb_publishable_`-sleutel, met hul eie kommentaar: *"the publishable key is
   browser-safe by design. (The secret key is NOT here; it lives only in the
   server .env.)"*
2. Die eerste versoek na Supabase het 401 gegee. Dit was **ons fout**: die
   sleutel is nie 'n JWT nie en hoort net in die `apikey`-kopteks, nie ook in
   `Authorization: Bearer` nie.
3. Reggestel werk dit — maar die enigste tabel wat hul kliëntkode aanraak is
   `suggestions`. Die Bybelteks is nie in Supabase nie.
4. Hul bondel se fetch-oproepe is `Ye+"index.json"` en
   `Ye+"books/"+e+".json"`, en `Ye` is **`/data/`**.

**Die Bybel is dus gewone statiese JSON-lêers op hul webbediener.** Geen
sleutel, geen databasis, geen RLS. Om hulle te lees is presies dieselfde as om
hul bladsy oop te maak.

### Hul formaat

```json
{ "id": "gen", "name": "Génesis", "chapters": {
    "1": { "1": { "a": "In die begin het God ...",
                  "e": "In the beginning God ...",
                  "x": [...], "xi": [...] } } } }
```

Ons vat **net `a`**.

`e` is die King James. Die regte daarop berus by die Kroon, gepubliseer met
toestemming van Cambridge University Press — dit is nie ons s'n om te versprei
nie, en dit hoort ook nie in 'n Afrikaanse Bybel nie. `x` en `xi` is
kruisverwysings (TSK plus OpenBible.info onder CC BY 4.0); hulle sou 'n eie
erkenning verg en maak die lêers baie groter.

### Die invoer, en hoe om dit weer te doen

`skrifte/haal-gab.mjs`, wat loop as die **GAB**-werkstroom met stap `haal`
(Actions → GAB → Run workflow). Dit:

* lees die basispad uit hul eie kode, raai dit nooit;
* haal een boek elke twee sekondes, nooit parallel;
* hou 'n kontrolepunt sodat 'n onderbroke lopie hervat;
* hou dadelik op by 401 of 403; eer `Retry-After` by 429 en hou op na drie;
  hou op by 404, want dan is die kartering verkeerd;
* stoor die **rou** antwoord met 'n SHA-256 voordat een karakter aangeraak
  word (`data/gab-rou/`, buite git);
* keur teen al 66 boeke se hoofstuktellings, vier bekende versreekse en die
  31 102-totaal — en **publiseer niks** as dit druip.

Die lopie van 5 Augustus 2026: 69 versoeke, 66 boeke, 1 189 hoofstukke,
**31 102 verse**, geen leë vers, geen Engels wat deurgeglip het. Die volledige
herkoms staan in `docs/gab-herkoms.json`, met 'n hash per boek.

**Ná die invoer praat die app nooit weer met hulle nie.** Sy lees net
`public/gab/`. Dit is in die blaaier bevestig.

### Konsep

Die GAB word nog hersien — hul werf het 'n "Voorstelle"-knoppie met 'n teller.
Wat ons het, is 'n momentopname. `indeks.json` dra `konsep: true`, die
erkenning sê "konsep", en die "Oor hierdie vertaling"-blad sê dit uitdruklik.
Moenie daardie etiket afhaal nie.

---

## Hoe die teks in die app leef

Die teks sit **nie** in die kode nie. Dit is 66 statiese lêers onder
`public/gab/` (4,3 MB), wat gehaal word wanneer 'n mens 'n boek oopmaak.

Kry jy ooit 'n behoorlike uitvoerlêer van die projek self, sit
`skrifte/bou-gab.mjs` dit om:

```
node skrifte/bou-gab.mjs <bronlêer>          # skryf public/gab/
npm run build
```

Dit aanvaar drie vorms:

| Vorm | Voorbeeld |
|---|---|
| Genes | `{ "GEN": { "1": { "1": "teks" } } }` |
| Rye | `[ { "boek": "GEN", "hoofstuk": 1, "vers": 1, "teks": "..." } ]` |
| CSV | `boek,hoofstuk,vers,teks` |

Rye aanvaar ook `book/chapter/verse/text` en `b/c/v/t`, en die boek mag 'n
USFM-kode of die Afrikaanse naam wees.

Die skrif stop met 'n fout as 'n hoofstuk of vers in die ry ontbreek, en waarsku
as die totaal nie 31 102 verse is nie.

### Die formaat wat dit skryf

```
public/gab/indeks.json
  { "weergawe": "2026-02-11", "boeke": ["GEN", "EXO", ...] }

public/gab/GEN.json
  { "boek": "GEN", "weergawe": "2026-02-11",
    "hoofstukke": [ ["vers 1", "vers 2", ...], ... ] }
```

Hoofstuk 1 is indeks 0. Vers 1 is indeks 0. Plat teks, geen opmaak.

---

## Wat die app hiermee doen

### Kruisverwysings

Tik 'n vers aan en die blad wys **"Waar praat die Bybel nog hieroor?"** — die
sterkste ander plekke wat oor dieselfde ding praat. Johannes 3:16 gee jou
Romeine 5:8, 1 Johannes 4:9-10, Romeine 8:32. Tik een en jy is daar.

309 310 verwysings, 5,6 MB, in `public/gab/x/` — **aparte lêers**. Gewone lees
raak hulle nooit aan; net wie 'n vers aantik, trek daardie een boek s'n. Dit is
in die blaaier bevestig.

**Hulle werk vir elke vertaling, nie net die GAB nie.** 'n Kruisverwysing is
bloot 'n plek — boek, hoofstuk, vers — en daardie plek is dieselfde in enige
Bybel. Ons stoor geen teks nie, dus raak dit aan geen ander vertaling se
lisensie nie. Tik een aan en jy spring soontoe in die vertaling wat jy nou
lees. Verwysings na 'n boek wat die huidige vertaling nie het nie, word
weggelaat, sodat 'n knoppie nooit nêrens heen gaan nie.

Bron: *Treasury of Scripture Knowledge* (publieke domein) plus OpenBible.info
se rangorde (CC BY 4.0). Die erkenning staan **by die verwysings self**, want
hulle wys ook onder die Engelse vertalings waar die GAB se "Oor hierdie
vertaling"-blad nie bestaan nie. CC BY vereis erkenning oral waar die
materiaal wys — **dit mag nie uitval nie.**

Die afkortings ("Joh 1:1-3") word by die INVOER opgelos, uit hul eie indeks se
`abbr`- en `name`-velde, en as kodes gestoor. Die app ontleed dus niks. 'n
Afkorting wat ons nie ken nie word getel en gerapporteer, nie stil laat val nie.

Hoogstens 20 per vers, in hul rangorde. Genesis 1:1 alleen het 61; die
sterkstes staan eerste. Die blad wys agt, met "Wys al 20".

### Soek — enige woord, aflyn

Tik "vergifnis" of "moeg" of "vrede" en die app soek deur al 31 102 verse,
sonder sein. Dit is waarvoor mense 'n Bybel oopmaak wanneer hulle swaarkry, en
dit is presies wat die ander gratis Afrikaanse opsies nie kan doen nie.

Die eerste soektog laai die 66 lêers in die geheue (die diensketter het hulle
meestal reeds op skyf). Daarna is dit oombliklik — gemeet op 811 ms vir "moeg"
met 31 treffers. **Gewone lees word nooit geraak nie**; die kode loop net
wanneer iemand tik.

Aksente en hoofletters maak nie saak nie. 'n Verwysing ("Joh 3:16") werk nog
soos altyd; die twee staan langs mekaar.

Dit werk net vir die GAB, want net sy teks le op die toestel.

---

## Wat gebeur as die lêers nie daar is nie

**Niks.** `indeks.json` misluk stil, die GAB verskyn nie in die vertalinglys nie,
en die app is presies soos hy was. Die kode is dus gestoot voordat die teks daar
was, en niemand het iets gemerk nie.

---

## Waar dit in die kode leef

| Lêer | Wat dit doen |
|---|---|
| `src/data/gab.js` | Haal die lêers, bou die HTML, dra die erkenning |
| `src/screens/Bybel.jsx` | Kies tussen die GAB en YouVersion per vertaling |
| `skrifte/haal-gab.mjs` | Haal die teks by die bron af (die GAB-werkstroom) |
| `skrifte/bou-gab.mjs` | Sit 'n gegewe uitvoerlêer om na `public/gab/` |
| `src/sw.js` | Kas 'n boek wat een keer gelees is |

Die skerm weet nie waar 'n vertaling vandaan kom nie. `gabHoofstukke()` en
`gabTeks()` gee presies dieselfde vorm terug as YouVersion se API, met dieselfde
`.yv-v`-versmerkers, sodat die boekelys, die aantik-'n-vers-blad, deel, kopieer
en spring-na-'n-vers werk sonder 'n enkele verandering.

### Twee dinge wat maklik stukkend gaan

**Die precache.** `globPatterns` in `vite.config.js` sluit `json` doelbewus uit.
Sit dit in en die app se installasie groei met sowat 4 MB, ook vir mense wat die
Bybel nooit oopmaak nie. Die diensketter kas 'n boek eers wanneer 'n mens hom
werklik lees (`gab-bybel`-kas).

**Die twee bronne mag mekaar nie doodmaak nie.** Die GAB werk sonder 'n netwerk;
die Engelses het YouVersion nodig. Hulle laai langs mekaar en hul mislukkings
word apart hanteer. Val die netwerk weg, bly die Afrikaanse Bybel staan — dit is
getoets.

---

## Die BibleSA-skakel bly

Onderaan elke hoofstuk staan nog 'n knoppie na BibleSA vir die 1953 en 1983.
Baie mense het by daardie bewoording grootgeword en soek juis dit. Dit is nou
'n tweede pad, nie die enigste een nie.
