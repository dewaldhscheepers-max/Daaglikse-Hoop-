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

**3. Nie-kommersieel.** Geen betaalmuur, geen advertensie en geen versoek om
geld op enige skerm waar hierdie teks wys nie. Daarom is die `Steun`-komponent
heeltemal van `Bybel.jsx` af weg. Die Bybel is die een skerm in die app waar
niemand ooit om geld gevra word nie. **Moet dit nie terugsit nie.**

Ter ondersteuning: elke e-boek in die app is gratis (`Meer.jsx` — "Elke e-boek
is gratis"). Die `price`-velde in `src/data/books.js` is dooie data wat nie meer
gebruik word nie.

---

## Hoe die teks in die app kom

Die teks sit **nie** in die kode nie. Dit is 66 statiese lêers onder
`public/gab/`, wat gehaal word wanneer 'n mens 'n boek oopmaak.

```
node skrifte/bou-gab.mjs <bronlêer>          # skryf public/gab/
npm run build
```

Die bronlêer is wat die GAB-projek gee. Die skrif aanvaar drie vorms:

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

## Wat gebeur as die lêers nie daar is nie

**Niks.** `indeks.json` misluk stil, die GAB verskyn nie in die vertalinglys nie,
en die app is presies soos hy was. Die kode kan dus gestoot word voordat die teks
daar is — en dit is presies wat gebeur het.

---

## Waar dit in die kode leef

| Lêer | Wat dit doen |
|---|---|
| `src/data/gab.js` | Haal die lêers, bou die HTML, dra die erkenning |
| `src/screens/Bybel.jsx` | Kies tussen die GAB en YouVersion per vertaling |
| `skrifte/bou-gab.mjs` | Sit die bron om na `public/gab/` |
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
