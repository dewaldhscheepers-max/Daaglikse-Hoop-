# Daaglikse Hoop

'n Afrikaanse Christelike PWA. Vite + React 18 + Firebase, ontplooi op Vercel
vanaf `main`.

Hierdie lêer is vir wie ook al volgende hieraan werk. Dit is nie 'n
inhoudsopgawe nie — dit is die goed wat 'n mens nie uit die kode aflei nie,
meestal omdat dit uit foute gekom het.

---

## Bou en toets

```
npm run dev              # ontwikkel
npm run build            # bou (en die diensketter)
npm run preview          # bekyk die gebouide weergawe
```

Toetse loop met plain `node` — daar is geen toetsraamwerk nie.

```
node src/game/vrugtefees/enjin.toets.mjs      # match-3-enjin, 133 toetse
node src/game/vrugtefees/oes.toets.mjs        # oes-lopie + herspeel, 252 toetse
node src/game/vrugtefees/ranglys.toets.mjs    # bediener se keuring, 58 toetse
node src/game/vrugtefees/vlakke.toets.mjs     # keur al 90 fases se moeilikheid
```

Blaaiertoetse loop met Playwright teen Chromium op
`/opt/pw-browsers/chromium`, met `args: ['--no-proxy-server']`. Moenie
`playwright install` loop nie.

---

## Die drie speletjies

| Speletjie | Waar | Toestand |
|---|---|---|
| **Vredepad** | `src/screens/Vredepad*` | Klaar. **Moenie aan raak nie.** |
| **Bou die Ark** | `src/screens/BouDieArk.jsx` | Klaar. 37 diere, wêreldwye ranglys. |
| **Vrugtefees** | `src/screens/Vrugtefees.jsx` | Klaar. Sien `docs/vrugtefees-implementation.md`. |

Elke speletjie maak oop met `window.dispatchEvent(new CustomEvent('open-x'))`
en 'n luisteraar in `App.jsx`.

---

## Reels vir hierdie kodebasis

**Moenie aan `Luister.jsx` se navigasie raak nie** (BidSaam, BidNou,
Vredepad). Dit werk, en dit is al 'n paar keer gebreek deur "verbeterings".

**Moenie aan die lewende Firebase-projek raak sonder om eers te vra nie.**
Nie lees nie en nie skryf nie. Die reels in `firestore.rules` mag gelees en
verander word; die data self nie.

**Moenie Vredepad of 'n bestaande speletjie se data terugstel nie.**

**Verifieer voordat jy stoot.** Bou dit, loop die toetse, en kyk werklik na 'n
skermkiekie. Meer as een keer in hierdie kodebasis se geskiedenis is iets
gestoot wat nooit gewerk het nie.

---

## Android, Chrome, en gekleurde strepe

Die duurste fout in hierdie projek se geskiedenis. Bou die Ark het op een
spesifieke Android-foon gekleurde strepe oor die bord gewys — rou GPU-geheue.
Dit het dae gekos om te vind, want dit gebeur nie op 'n rekenaar nie.

Die oorsaak was `transform: scale(0.94)` op `:active`. Dit maak en breek 'n
saamgestelde laag by elke druk, en op daardie SVE het die nuwe laag ongeïnisia-
liseerde geheue gewys.

Vier reels geld sedertdien oral waar daar 'n `<canvas>` is:

1. `getContext('2d', { willReadFrequently: true })` — dit laat Chrome kies om
   die doek op die SVE te hou in plaas van 'n eie GPU-laag.
2. **Geen `border-radius` op 'n doek nie.** Dit dwing 'n maskerlaag. Teken die
   afronding binne die doek.
3. **Geen `transform` of `opacity` op `:active` nie.** Verander net kleur.
4. **Die doek se buffer kom net uit sy BREEDTE, nooit uit sy hoogte nie.** Op
   Android skuif Chrome se adresbalk in en uit; elke skryf na `canvas.width`
   maak die doek skoon, en dan flikker dit heeltyd.

Verwant: gebruik `100svh`, nie `100dvh` nie. `dvh` verander saam met die
adresbalk. `inset: 0` word teen die *groot* uitkyk gemeet.

---

## Ranglyste

Albei speletjies se ranglyste loop deur 'n Vercel-funksie met die
diensrekening. Kliënte kan **nie** direk aan die versamelings raak nie —
`firestore.rules` verbied dit. Die uid kom altyd uit 'n geverifieerde Firebase
ID-token (`eis.sub`), nooit uit die versoek se liggaam nie.

Die twee ranglyste verskil in hoe streng hulle is, en dit is die moeite werd om
te verstaan:

* **`api/ark-ranglys.js`** *raai*. Dit kan net vra of 'n lopie fisies moontlik
  lyk. 'n Heuristiek; iemand wat mooi lieg, kom deur. Tetris se toestand is te
  groot om oor te speel.
* **`api/vrugtefees-ranglys.mjs`** *raai nie*. Die kliënt stuur die saad en sy
  lys skuiwe — **geen puntetelling** — en die bediener speel die lopie oor met
  `src/game/vrugtefees/oes.js`, dieselfde lêer wat die skerm gebruik, en tel
  self.

Die tweede werk net omdat `oes.js` en die enjin **suiwer en deterministies**
is: geen `window`, geen `Date.now()`, geen `Math.random()`. As dit ooit
verander, dryf kliënt en bediener uitmekaar en dan word **eerlike** spelers
verwerp. Daar is toetse wat dit vashou; moenie hulle omseil nie.

`api/*.js` is CommonJS (`api/package.json` sê so). `api/*.mjs` is ESM en kan
uit `src/` invoer.

---

## Twee foute wat oor en oor gebeur

**Karakterreekse in 'n regex.** `[ -<>&"]` lyk soos "hierdie vier karakters"
maar is 'n reeks van spasie (0x20) tot `<` (0x3C) — dit verwerp syfers en
spasies. Skryf beheerkarakters uit as `[\u0000-\u001f\u007f...]`.

**Skryfgereedskap wat `\u`-ontsnappings as rou grepe skryf.** As 'n lêer skielik
"binary file matches" is, is daar 'n NUL-greep in. Kontroleer met:

```
python3 -c "d=open('pad','rb').read(); print(sorted({b for b in d if b<9 or (10<b<32 and b!=13) or b==127}))"
```

Skryf sulke lêers met python eerder as met 'n redigeerder.

---

## Taal

Alles wat 'n mens sien, is Afrikaans. Kode, veranderlikes, kommentaar en
commit-boodskappe is ook Afrikaans — dit is konsekwent deur die hele kodebasis
en moet so bly.

Bybelverse moet deur Dewald teen sy Bybel nagegaan word. Moenie aanvaar 'n
Afrikaanse vers is korrek nie.
