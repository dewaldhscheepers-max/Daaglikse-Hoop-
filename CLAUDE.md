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
node api/_sorg-videos.toets.mjs               # Sorg se video-logika, 22 toetse
node src/data/sorgVideos.toets.mjs            # die geplakte video-lys, 17 toetse
node src/data/sorgOnderwerpe.toets.mjs        # raai die onderwerp uit 'n titel, 23 toetse
node src/data/sorgSaai.toets.mjs              # die eerste reaksies en opmerkings, 63 toetse
node src/data/sorg.toets.mjs                  # Sorg se indiening en krisisvloei, 88 toetse
node api/_sorgFirestore.toets.mjs             # blaai deur al die bladsye, 41 toetse
node api/_kennisgewings.toets.mjs             # die oggend-kennisgewing, 74 toetse
node src/data/volgJesus.toets.mjs             # VOLG JESUS se hekke + elke vers teen die GAB, 70 toetse
node api/_volgJesusBerging.toets.mjs          # hoe 'n week gestoor word, 42 toetse
node src/data/volgJesusMylpale.toets.mjs      # die mylpale + wat die kerk mag sien, 42 toetse
node api/_volgJesusVersoek.toets.mjs          # "kontak my" — net vier velde oorleef, 53 toetse
node src/data/kennisgewingVra.toets.mjs       # wie gevra word en wanneer, 23 toetse
node src/data/kennisgewingStaat.toets.mjs     # kry hierdie foon werklik iets, 24 toetse
node api/_toetsStuur.toets.mjs                # die toetsboodskap se besluite, 32 toetse
node src/data/installeerPad.toets.mjs         # wie kan installeer, en hoe, 32 toetse
node src/data/installTelling.toets.mjs        # die installasie-telling se afronding, 15 toetse
node src/data/gebedDeel.toets.mjs             # "Bid vir my" se hekke en woorde, 55 toetse
node src/data/kinderBoekeWys.toets.mjs        # watter kinderboeke wys, en in watter volgorde
node src/data/eboekeVolgorde.toets.mjs        # nuwe e-boeke staan bo, 28 toetse
node api/_eposStuur.toets.mjs                 # een slegte adres mag nie 99 mense kos nie, 38 toetse
node api/_adminSlot.toets.mjs                 # die admin-geheim, en wie mag uitvee, 20 toetse
node api/_kinderOplaai.toets.mjs              # die kinderboek-oplaai se aflaai-teken, 12 toetse
node api/_wallpaper.toets.mjs                 # die wallpaper-proxy se hekke, 34 toetse
node api/_telSorg.toets.mjs                   # die Sorg-trechter se drie getalle, 29 toetse
node src/data/kasBesluit.toets.mjs            # wat die diensketter mag kas, 49 toetse
node src/data/youtubeId.toets.mjs             # die video-skakel wat geplak word, 39 toetse
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

**Die reels geld vir die HELE app, nie net die speletjies nie.** Die strepe
het in Vrugtefees teruggekom nadat albei speletjies self skoon was, en die
oorsake het buite hulle gele:

* `.app` in `index.css` was `100dvh`. Die hele omhulsel is by elke raam van
  die adresbalk se animasie hervorm, en die omhulsel dra elke skerm.
* `.nav-bybel:active` het nog `transform: scale(0.93)` gehad — presies die
  Ark se oorspronklike oorsaak, in die globale nav wat onder elke skerm sit.
* `.bottom-nav` was met `transform: translateX(-50%)` gesentreer, wat dit vir
  altyd 'n eie saamgestelde laag maak. Sentreer met marges.

**'n Volskerm `<img>` is die grootste tekstuur in die app** en Chrome gee dit
maklik sy eie laag. Vrugtefees se geskilderde tuin was so 'n `<img>`; die
strepe het gelyk soos 'n horisontaal gesmeerde foto, wat is wat 'n mens sien
as 'n beeldtekstuur met die verkeerde stride gelees word. Dit is nou 'n
CSS-`background-image` op 'n ONDEURSIGTIGE houer: dit word in die ouer se
laag geverf, en 'n ongeverfde teel wys die agtergrondkleur in plaas van
gemors.

Daar is nog `transform: scale()` op `:active` in Luister, BidSaam, BidNou,
Bybel, Vredepad en ander. Hulle is nog nie aangeraak nie omdat daardie
skerms nie die fout gewys het nie — maar as strepe daar opduik, kyk eerste
daarna.

---

## Die wit skerm

'n Geïnstalleerde PWA laai sy HTML uit die diensketter se vooraf-kas. Word
daar 'n paar keer op een dag ontplooi, kan daardie ou HTML na
`/assets/index-OUHASH.js` wys — 'n lêer wat nie meer op die bediener is nie.
Die skrip gee 'n 404, React begin nooit, en die mens sien 'n **wit skerm**.
Toemaak help nie; dieselfde ou HTML kom weer uit die kas.

Daar is 'n vangnet **inlyn in `index.html` se kop**. Dit moet daar bly en dit
moet ES5 bly: dit is die enigste kode wat nog loop wanneer die bundel nie
laai nie. Ná agt sekondes kyk dit of React iets in `#root` gesit het; is dit
leeg, skryf dit elke diensketter af, vee elke kas uit en herlaai een keer.
Slaag dit nie, wag dit ses uur en wys intussen woorde en 'n knoppie — nooit
'n leë wit skerm nie.

Toets dit met `kykWitSkerm.mjs` in die scratchpad: dit gee die bundel 'n 404
en eis dat die app homself regmaak, dat dit nie in 'n lus beland nie, en dat
'n **gesonde** app nooit geraak word nie.

---

## Die stemboodskap-speler

Dit is die app. Alles anders is by. Twee reels geld hier bo alles:

**Moenie klank in die diensketter kas nie.** Dit was 'n `CacheFirst` op alles
by `firebasestorage.googleapis.com`, en dit het die speler stukkend gemaak op
'n manier wat maande lank onsigbaar gebly het. 'n `<audio>` vra nooit 'n leer
in een stuk nie — dit stuur 'n `Range`-kop en vra grepe. 'n Kas antwoord op
die URL en weet niks van Ranges nie, en dan kry die speler die verkeerde
liggaam met die verkeerde status. Erger: `CacheFirst` met 30 dae beteken die
stukkende inskrywing kom **more weer**. Die klag was presies dit — *"die
stemboodskap speel nou al vir 3 dae nie deur tot die einde nie."*

Die besluit staan op een plek en is suiwer: `magKas()` in
`src/data/kasBesluit.js`. Prente uit Storage word gekas; klank nooit. Drie
hekke hou klank uit, want een is te min: `request.destination`, die vouer
(`audio/`, wat elke oplaai in hierdie app gebruik), en die uitbreiding.
Moenie daardie voorwaarde in `sw.js` inlyn herskryf nie.

Verander jy iets aan wat gekas word, **verhoog `SPOEL` in `src/sw.js`**. Dit
is die enigste hefboom wat 'n foon bereik wat ons nie kan raak nie; sonder dit
bly 'n stukkende kas vir altyd op daardie toestel staan.

**'n Speler wat lieg is erger as een wat stukkend is.** Hier was net
`timeupdate`, `ended` en `loadedmetadata` — geen `error`. Gaan die pyplyn
dood, bly `playing` waar, wys die knoppie 'n pouse-ikoon, vries die balkie, en
niks probeer ooit weer nie. Die enigste pad uit was om die skerm te verlaat en
terug te kom. Vandaar "ek moet in en uit gaan".

`Luister.jsx` moet dus altyd:

* op `error` dadelik herstel, by dieselfde sekonde;
* op `stalled`/`waiting` 'n waghond loop — maar **nie** herlaai as die buffer
  nog groei nie, anders straf ons iemand op 'n swak lyn;
* 'n `ended` wat te vroeg kom teen die nota se `lengthSeconds` toets, en
  PRESIES een keer weer probeer (verkeerde data mag nooit 'n lus word);
* nooit herstel terwyl die mens gepouseer het nie — sien `speelRef`;
* ná vier mislukte pogings ophou en dit vir die mens **se**;
* `duration` keur met `Number.isFinite` voor dit erens beland. NaN en Infinity
  het albei in `lengthSeconds` beland en die balkie vir altyd stukkend gemaak.

Met `preload="auto"` kan die leer misluk **voor** die mens ooit tik. Dan sit
daar 'n `MediaError`, `play()` doen niks, en `canplay` vuur nooit. Laai eers
weer as `audio.error` gestel is — anders is die eerste tik 'n dooie tik.

Twee toetse in die scratchpad: `kykKlank.mjs` (begin dit met EEN tik) en
`kykKlankHard.mjs` (die verbinding val, die stroom hang, dit is werklik
stukkend, die leer is afgekap, spring verby die einde, en die knoppie mag
nooit lieg nie). Loop albei voor jy aan die speler raak. Meet die APP, nie die
bediener nie: Chromium hergebruik sy eie buffer by `load()`, ook met
`Cache-Control: no-store`, dus is 'n bedienerteller 'n vals maatstaf.

---

## Firestore se `getDocs` het geen tydgrens nie

Dit het Luister twee keer stilweg gebreek, en albei kere lyk dieselfde vir
die mens: *"dit sê Besig om boodskappe te laai en dan is daar niks."*

**Dit kan vir altyd hang.** Wanneer Android die oortjie opskort, sterf die
SDK se verbinding, en op 'n slegte terugkeer los die belofte nie op EN
verwerp dit nie. Enige `if (besigRef.current) return`-slot bly dan vir altyd
toe, en elke latere probeerslag — ook die een by `visibilitychange` wat juis
moes red — loop teen die hek vas. Die app kan homself nie herstel nie.
Wikkel dit dus in 'n `Promise.race` met 'n tydgrens en laat die slot in 'n
`finally` los.

**Dit kan 'n halwe antwoord gee.** Is die SDK vanlyn, bedien `getDocs` uit sy
eie kas, en daardie kas hou net wat die SDK al gesien het. Met 'n
`limit(1)`-luisteraar iewers is die antwoord soms EEN dokument. Skryf dit
sonder om te kyk na die skerm en na localStorage, en twintig notas is met een
vervang — wat 'n herlaai oorleef. **Aanvaar nooit 'n antwoord wat kleiner is
as wat jy reeds het nie.**

---

## Die Afrikaanse Bybel

Die Bybelgenootskap van SA het skriftelik geweier dat hul teks (1953, 1983,
2020) in hierdie app kom, en oorweeg die soort versoek glad nie. Die app
gebruik dus die **Getroue Afrikaanse Bybel** — 'n onafhanklike 2026-vertaling
uit die King James, wat self onder CC BY-NC-ND 4.0 beskikbaar gestel word.

Drie dinge mag nooit uitval nie: die **erkenning** onderaan elke hoofstuk, die
teks **onveranderd** (moenie eens 'n drukfout regmaak nie — dit is 'n
afgeleide werk), en **niks kommersieel** op 'n skerm waar die teks wys.
Daarom is die `Steun`-blok van `Bybel.jsx` af weg. Moet dit nie terugsit nie.

Die teks sit nie in die kode nie — dit is 66 lêers onder `public/gab/`
(31 102 verse, 4,3 MB), gehaal deur die **GAB**-werkstroom
(`skrifte/haal-gab.mjs`). Is hulle nie daar nie, verskyn die GAB eenvoudig nie
in die vertalinglys nie en is die app presies soos hy was.

Dit is 'n **konsep** — die vertaling word nog hersien. Die etiket wys op die
erkenning en op die "Oor hierdie vertaling"-blad. Moenie dit afhaal nie.

Twee dinge maak hierdie Bybel anders as die res: **309 310 kruisverwysings**
(TSK + OpenBible.info, CC BY 4.0 — daardie erkenning mag ook nie uitval nie) en
**soek deur die hele teks, aflyn**. Albei is so gebou dat gewone lees hulle
nooit laai nie.

Volledig in `docs/afrikaanse-bybel.md`. Lees dit voor jy aan die Bybel raak.

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

## Wie kan die app op sy foon sit, en hoe

Die hele webwerf bestaan om op 'n foon te beland. Elke besoeker moet 'n pad
he wat WERK op sy foon — en 'n knoppie wat niks doen nie is erger as stilte.

Die besluit staan op **een plek**: `kiesPad()` in `src/data/installeerPad.js`.
Dit is suiwer (user-agent in, 'n string uit) en gee een van sewe paaie:
`geinstalleer`, `prompt`, `chrome`, `safari`, `ios`, `stappe`, `rekenaar`.

Die duur lesse wat daarin vassit:

* **Samsung Internet word Chrome toe gestuur, ook al KAN dit installeer.**
  Dit vuur wel `beforeinstallprompt`, maar dan loop die app op Samsung se
  enjin en dit is presies waar die oggendkennisgewing verdwyn. Een tik meer,
  maar dit werk.
* **Op 'n iPhone kan net Safari dit doen.** Chrome, Firefox en Edge op 'n
  iPhone is Safari se enjin sonder daardie een vermoe. Hulle het die
  Deel-stappe gekry en die "Voeg by tuisskerm"-item was eenvoudig nie daar
  nie. Nou kry hulle die adres na die knipbord toe — 'n mens kan 'n iPhone
  nie na Safari dwing nie, iOS het niks soos Android se intent nie.
* **Facebook, Instagram, TikTok se ingeboude blaaiers kan glad niks.** Daar
  IS geen drie kolletjies nie. Chrome toe.
* **Elke skakel Chrome toe gaan na `/go`, nooit na `/` nie.** Dit was die
  fout wat installasie maande lank stukkend gehou het: Chrome het oopgemaak
  op die APP, waar daar geen installeerknoppie is nie, en die mens se enigste
  pad was daarna die spyskaart.

`public/go.html` kan nie invoer nie (dit moet sonder die bundel werk) en dra
'n kopie tussen `KIESPAD-BEGIN` en `KIESPAD-EINDE`.
`installeerPad.toets.mjs` voer ALBEI uit en eis dieselfde antwoord oor elke
blaaier. Moenie die merkers wegvat nie.

`oudit.mjs` in die scratchpad loop elke blaaier teen `/` en `/go` en val om
as enigiemand niks kry nie.

## Die Android-app is nie die webwerf nie

Op Google Play staan 'n **regte app**, gebou met Capacitor, in `android/`.
Dit was 'n TWA — 'n houer wat die webwerf in die foon se verstek-blaaier
oopmaak — en op 'n Samsung beteken dit Samsung Internet besit alles wat saak
maak: die kennisgewing is syne om oor te handig (hy doen dit nie), en die
kleure is syne om om te keer (hy doen dit wel).

Drie dinge om te weet voor jy hieraan raak:

* **Die app laai die LEWENDE webwerf.** Dieselfde bundel loop in Chrome, in
  Samsung Internet en in die app. `isInheems` in
  `src/data/inheemseKennisgewings.js` is die skakelaar wat keer dat push
  **twee keer** registreer en een mens die oggendboodskap dubbel kry.
* **`Notification.permission` lieg binne die app.** Dit is die WEBVIEW se
  toestemming; die een wat tel is `POST_NOTIFICATIONS`, wat aan die app
  behoort. 'n WebView wat nooit gevra is nie gee dikwels `denied`. `App.jsx`
  lees die inheemse staat in `inheemsePermRef` en gebruik dít — vir die vraag
  én vir die drie tellers op `tellers/toestemming`.
* **Die web en die PWA verander niks.** iPhone, bestaande PWA-installasies en
  gewone webbesoekers loop presies soos altyd. Die bediener het niks nodig
  gehad nie: die inheemse token gaan na dieselfde `fcm_tokens`-versameling.

Die `.aab` kan **nie hier gebou word nie** — `dl.google.com` word deur die
uitgangsbeleid geblokkeer, en dit is waar die Android-SDK én die hele
Google-Maven sit. Dit word in Android Studio gebou.

Volledig in `docs/android-app.md`. Lees dit voor jy aan `android/` raak.

## Kennisgewings

Ses duisend fone hang hieraan. Dit is die ding wat die app laat groei, en dit
is al twee keer stil gebreek.

**Die oggend-kennisgewing loop om 06:30 SA-tyd** as 'n Vercel-cron in
`vercel.json` — `"30 4 * * *"`, want Vercel loop op UTC en SA is UTC+2 sonder
somertyd. Vroeer is dit deur 'n diens BUITE die projek afgeskop; niemand weet
meer watter een nie, en toe die geheim verander het, was daar niemand om dit
te gaan verander nie. Hou dit binne.

**Die boodskap** is nie in die kode nie: die opskrif is die titel van die
nuutste `notes`-dokument en die teks is *"Jou Daaglikse Hoop vir vandag is
gereed. Tik om te luister."* Verander die kode dus nie om 'n boodskap te
verander nie — laai 'n nota.

**Die dag-slot.** `api/_dagslot.js` skep `kennisgewing_dae/<SA-datum>` met
Firestore se skep-met-'n-naam, wat 'n **409** gee as die naam bestaan. Dit is
'n atomiese eis, nie 'n lees-dan-skryf nie: vuur twee dinge gelyktydig, wen
presies een. Dit is die enigste ding wat keer dat ses duisend mense twee
kennisgewings kry as daardie ou buite-diens ooit weer opduik.

'n Mens in die admin gaan **altyd** deur — die slot geld net vir die
outomatiese lopie. Daarom gee `wieMag()` in `_geheim.js` terug WIE ingekom
het: `'admin'` (die wagwoord in `x-sorg-geheim`) of `'cron'` (CRON_SECRET).
Enigiets wat met CRON_SECRET inkom, tel as die oggendlopie, ook al val die
`?outo=1` weg.

**Val dit om voor die eerste boodskap uit is, word die dag teruggegee** en 'n
tweede probeerslag is skoon. Val dit halfpad om, bly die slot staan — die
helfte wat reeds gekry het, moet dit nie weer kry nie.

**Die droëloop.** `POST /api/send-notifications?kyk=1` gaan die hele pad na —
diensrekening, albei lyste, die opskrif, of vanoggend s'n geloop het — en
stuur vir **niemand**. Dit is die knoppie "🔍 Gaan die opstelling na" in die
admin. Gebruik dit; die enigste ander manier om te toets is om ses duisend
mense iets te stuur.

**Waarom dit die vorige keer gebreek het** en wat 'n mens dus nie moet
terugdraai nie:

* Die stuur was 'n `for`-lus met 'n `await` in — een token op 'n slag, sowat
  'n vyfde sekonde elk. Met geen `maxDuration` het Vercel hom na tien
  sekondes doodgemaak, en die admin het "Failed to fetch" gewys. Die kode het
  nie verander nie; die LYS het gegroei. Nou 50 gelyk, en `maxDuration: 300`.
* `webpush.setVapidDetails(..., '')` op module-vlak **gooi by invoer**. Sonder
  `VAPID_PRIVATE_KEY` het die HELE eindpunt 'n 500 gegee en niemand het iets
  gekry nie — terwyl FCM, waarmee elke Android- en Chrome-foon werk, glad nie
  VAPID nodig het nie. Dit is nou lui; 'n ontbrekende sleutel raak net Firefox.
* 'n Dooie Samsung-intekening is by ELKE stuur weer geprobeer, want `dooies`
  het die FCM-token gehou en `isDood` het die volle endpoint opgesoek. Sien
  `sleutelVir()`.

`api/_kennisgewings.toets.mjs` sit 'n vals Google agter die funksie en toets al
hierdie dinge met 6000 tokens. Loop dit voor jy aan kennisgewings raak.

### "Kennisgewings af" — die merkie regs bo op Luister

Daar is mense wat die app op hulle foon het en al maande niks kry nie. Hulle
weet dit nie — hulle dink die app is stil. Ons het **geen kanaal** na daardie
foon nie; die enigste oomblik waarop ons iets kan doen, is wanneer hulle die
app oopmaak.

Daarom is dit nie 'n uitklap nie. 'n Uitklap kom een keer en gaan weg. Dit is
'n klein merkie wat ELKE KEER daar is totdat dit reg is, en dan verdwyn dit.

**`Notification.permission === 'granted'` is NIE genoeg nie.** Dewald en sy
vrou het albei "Toelaat" gedruk, die stelsel het "Managed by Daaglikse Hoop"
gewys, FCM het die boodskap aanvaar — en niks het verskyn nie. Toestemming se
net dat 'n mens ja gese het.

`kennisgewingStaat()` in `src/data/kennisgewingStaat.js` is suiwer en gee ses
state. Die onsuiwer helfte — wat die blaaier en die foon vertel — staan in
`kennisgewingLees.js`.

* **`herstel`** is die duurste geval: toestemming is daar, die intekening is
  weg. Dit gebeur by 'n herinstallasie. Sonder hierdie staat lyk daardie foon
  gesond en bly hy vir altyd stil.
* **`geblokkeer` vra NOOIT weer nie.** Die stelsel gee dadelik `denied`
  sonder om iets te wys, en dan het ons 'n knoppie wat niks doen. Die stappe
  is die enigste pad terug. Daar is 'n toets wat dit oor elke kombinasie
  afdwing.
* **`installeer-eers`** is die iPhone: Apple gee web push NET aan 'n webapp
  wat op die TUISSKERM staan. In Safari self kom die vraag glad nie op nie.

**Die toetsboodskap is die enigste eerlike bewys.** Daar is geen "is hierdie
token lewendig"-navraag by Google nie — 'n mens leer dit eers wanneer 'n
stuur `UNREGISTERED` teruggee. `POST /api/toets-kennisgewing` stuur EEN egte
boodskap met presies dieselfde vorm as die oggend s'n, en vee die dokument
uit as die token dood is. Dit staan in `Meer` omdat die mense wat dit die
nodigste het, geen merkie sien nie: by hulle is alles reg en die token is by
FCM dood.

Die eindpunt dra geen geheim nie — dit word deur die app self geroep. Die hek
is dat die token reeds in `fcm_tokens` moet staan, en die woorde staan vas in
die kode. 'n 429 of 'n 503 mag NOOIT 'n token uitvee nie; dit se niks oor die
foon nie.

### Wie gevra word, en hoe

Die reels staan in `src/data/kennisgewingVra.js` en is suiwer — die tyd kom
altyd van buite af.

**Vra NÁ 'n nota klaar gespeel het**, nooit op 'n tydhouer ná die app oopmaak
nie. Hier het 'n balkie gestaan wat drie sekondes ná ELKE oopmaak gewys het,
sonder enige geheue, en dit het teen homself gewerk: iemand druk dit weg, dit
kom môre weer, en op 'n dag druk hy die BLAAIER se "Block" om daarvan ontslae
te raak. Daardie besluit is **permanent** — `requestPermission()` gee van toe
af dadelik `denied` sonder om iets te wys. Ons het mense met 'n balkie in 'n
hoek gejaag waaruit die app hulle nie kan haal nie.

Nou: hoogstens **drie keer in 'n leeftyd**, minstens **sewe dae** uitmekaar.

**Samsung Internet.** `App.jsx` het `if (isSamsungBrowser) return` gehad —
Samsung-gebruikers is nooit gevra nie. Die bewys was dat
`webPushSubscriptions` presies EEN inskrywing gehad het. Samsung doen nie
Firebase se `getToken()` nie maar wel die gewone `pushManager`, en sy eindpunt
is Google s'n, wat beteken die bediener stuur dit deur FCM. Sien
`subscribeSamsung()` in `src/firebase.js`. **Dit kan nie hier getoets word
nie** — daar is geen egte pushdiens in 'n houer nie. Toets dit op 'n regte
Samsung-foon.

**Wie geblokkeer het, kry `KennisgewingAf`** — 'n stil reël met die stappe vir
sy blaaier. Dit is die enigste pad terug wat bestaan. Die stappe verskil
werklik per blaaier; Facebook se ingeboude blaaier kan dit glad nie doen nie
en die enigste eerlike antwoord daar is "maak dit in 'n regte blaaier oop".

**Moenie installasies van tokens aftrek om te raai hoeveel mense bereik word
nie.** Die installasie-teller tel toestelle wat OOIT geïnstalleer het; die
token-versameling is opgeblaas omdat 'n token gereeld verander en die ou
dokument nooit uitgevee word nie. Daardie aftreksom lyk soos 'n feit en is
dit nie. `api/tel-toestemming.js` tel die ding self: drie heelgetalle op
`tellers/toestemming`, geen naam en geen toestel-id.

---

## Geheime

Daar is **geen geheim in die app se kode** nie. Wat in `src/` staan, ship in
'n openbare JavaScript-lêer wat enigiemand kan oopmaak.

Hierdie projek het daardie fout vyf keer gemaak: `ADMIN_PIN = '2025'`,
`?pin=2025` op ses eindpunte, `?secret=DaaglikseHoop2025Cron` op die stuur-aan-
almal en op die e-poswerkry, dieselfde string as 'n TERUGVAL in twee lêers wat
aflaaiskakels teken, en weer in `vercel.json` se cron-pad. Elke keer het dit
soos 'n slot gelyk.

Twee paaie in, en albei se waarde bestaan **net op Vercel**:

| Wie | Hoe |
|---|---|
| 'n mens | `SORG_ADMIN_GEHEIM` in 'n `x-sorg-geheim`-kopstuk (minstens 12 karakters) |
| 'n cron | `CRON_SECRET`, wat Vercel self as `Authorization: Bearer …` stuur |

Die vergelyking staan **een keer**, in `api/_geheim.js` (`wieMag`,
`magAdminDing`, `tekenSleutel`), deur `timingSafeEqual`. 'n Geheim wat op
sewe plekke vergelyk word, is 'n geheim wat op ses plekke agterbly wanneer dit
verander.

Moet **nooit** 'n geheim in `vercel.json` se cron-pad sit nie. Vercel stuur sy
crons se geheim self in 'n kopstuk, en 'n geheim in daardie lêer breek stil
die dag wanneer die veranderlike geroteer word.

Gaan dit na na elke bou:

```
grep -c DaaglikseHoop2025Cron dist/assets/*.js     # moet 0 wees
```

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
