# Die Android-app

Daaglikse Hoop is 'n regte Android-app in `android/`, gebou met Capacitor.
Hierdie lêer sê waarom, en wat 'n mens moet doen om 'n nuwe weergawe uit te
gee.

---

## Waarom dit nie meer 'n TWA is nie

Die eerste weergawe op Google Play was 'n **TWA**. Dit is nie 'n app nie —
dit is 'n houer wat vir die foon sê: *"maak my webwerf oop in die
verstek-blaaier, sonder die adresbalk."*

Op 'n Suid-Afrikaanse foon is daardie blaaier dikwels **Samsung Internet**, en
dan behoort alles wat saak maak aan Samsung:

* **Die kennisgewing is nie ons s'n nie.** Samsung Internet ontvang dit en
  moet dit dan aan ons ikoon *oorhandig*. Daardie oorhandiging is stukkend.
  Twee fone het "Toelaat" gedruk, die stelsel het "Managed by Daaglikse Hoop"
  gewys, FCM het die boodskap aanvaar met 'n boodskap-id — en niks het
  verskyn nie. Dit is die hele rede waarom hierdie app oorgeskryf is; die
  oggendkennisgewing is die ding wat mense terugbring.
* **Die kleure is nie ons s'n nie.** Samsung Internet keer elke kleur om
  sodra die foon of die kragbespaarder op donker modus is. Die app het swart
  en stukkend gelyk.
* **Die Android-weergawe is nie ons s'n nie.** PWABuilder gee geen keuse oor
  `targetSdk` nie, en Google se sperdatums kom elke jaar.

Nou dra die app sy eie WebView saam en praat self met Android. Samsung
Internet is heeltemal uit die prentjie. Dit is hoe elke ander app in die
winkel dit doen.

---

## Wat NIE verander het nie

Dit is die belangrikste deel van hierdie lêer.

**Die webwerf en die PWA bly presies soos hulle is.** Niemand hoef iets oor
te doen nie.

| Wie | Wat gebeur |
|---|---|
| iPhone, van die tuisskerm af | onaangeraak — web push soos altyd |
| Android, as PWA uit Chrome geïnstalleer | onaangeraak |
| Wie net die webwerf besoek | onaangeraak |
| Wie die app uit Google Play kry | die nuwe inheemse pad |

Die bediener het **niks** nodig gehad nie. Die inheemse token gaan na presies
dieselfde plek as die web s'n — `fcm_tokens/<token>` met 'n `token`-veld — en
`api/send-notifications.js` lees `fields.token.stringValue` sonder om te weet
waar dit vandaan kom. Dit stuur reeds na albei lyste (`fcm_tokens` én
`webPushSubscriptions`).

**Moenie vir bestaande mense sê hulle moet iets verwyder en herinstalleer
nie.** Wie die Play-app bo-op sy ou PWA installeer, sit 'n rukkie met twee
ikone en kan self die ou een verwyder.

---

## Die skakelaar wat verhoed dat een mens twee keer gewaarsku word

Die app laai die **lewende webwerf** (sien `capacitor.config.json` se
`server.url`). Dieselfde JavaScript-bundel loop dus in Chrome, in Samsung
Internet **en** in die app.

Sou die web-kant se push ook binne die app registreer, het een mens twee
tokens en kry hy die oggendboodskap twee keer.

`isInheems` in `src/data/inheemseKennisgewings.js` is die enigste skakelaar.
Drie paaie, presies een mag loop:

```
isInheems        → tekenInInheems()        die Play-app
isSamsungBrowser → subscribeSamsung()      Samsung Internet as blaaier
anders           → subscribeToNotifications()
```

Verander dit nooit na iets wat albei kan loop nie.

### En die WebView se `Notification.permission` lieg

In die app is `Notification.permission` die **WebView** se toestemming. Die
een wat saak maak is `POST_NOTIFICATIONS`, wat aan die **app** behoort. 'n
WebView wat nooit gevra is nie, gee dikwels `denied` terug — en dan sou
`magVra` vir altyd nee sê en die mens sou nooit die vraag sien nie, in
presies die app waar dit die meeste saak maak.

`App.jsx` lees daarom die inheemse staat by die oopmaak (`inheemsePermRef`)
en gebruik dít. Dieselfde geld vir die drie tellers op `tellers/toestemming`
— die WebView se antwoord sou hulle stilweg bederf.

---

## Die maklike pad: GitHub bou die app (sonder 'n rekenaar)

`.github/workflows/android.yml`. Actions → **Android-app** → *Run workflow*.
Die klaar `.aab` staan onderaan die lopie onder *Artifacts*.

Vyf geheime (Settings → Secrets and variables → Actions):
`DH_KEYSTORE_BASE64` (die PWABuilder-sleutel as base64), `DH_KEYSTORE_WAGWOORD`,
`DH_SLEUTEL_ALIAS` (`daaglikshoop`), `DH_SLEUTEL_WAGWOORD`, en
`DH_GOOGLE_SERVICES_JSON` (die lêer se inhoud).

Die bou KEUR homself en misluk eerder as om iets verkeerds te lewer:

* die bondel word oopgemaak en elke ding wat hierdie app nodig het, word
  nagegaan — pakketnaam, die toestemmings, die App Links, die
  kennisgewing-ikoon, die Capacitor-instellings, die vier inproppe, grootte;
* met 'n sleutel maar sonder `google-services.json` weier dit om te bou — 'n app
  sonder die oggendkennisgewing is presies die TWA se fout;
* die handtekening moet `72:37:D1:…:E0:E4:D9` wees: die ou TWA se sleutel (sy
  `.aab` is daarmee onderteken, weergawe 1) en die vierde vingerafdruk in
  `public/.well-known/assetlinks.json`. 'n Ander sleutel = Google Play weier
  die opdatering.

`versionCode` = 100 + die lopienommer, dus altyd hoër as die ou TWA se 1 en as
die vorige lopie.

Drie dinge wat die eerste lopies gevang het, en wat 'n rekenaar ook sou gehad
het: `android-actions/setup-android` installeer 'n `tools`-pakket wat nie meer
bestaan nie (die SDK is reeds op die masjien); en `colors.xml` het `--` binne
'n XML-kommentaar gehad, wat aapt weier.

## Om 'n weergawe uit te gee — stap vir stap

Die Android-SDK kan **nie** in die wolk-ontwikkelomgewing afgelaai word nie
(`dl.google.com` is geblokkeer). Die `.aab` word op 'n REKENAAR gebou —
Windows of Mac, dit maak nie saak nie.

### Een keer: die rekenaar opstel

1. Installeer **Node.js** (LTS) van nodejs.org.
2. Installeer **Android Studio** van developer.android.com/studio. Maak dit
   een keer oop en laat dit die SDK aflaai (volg net die "Standard"-opstelling).
3. Installeer **Git** en haal die kode af:
   `git clone https://github.com/dewaldhscheepers-max/Daaglikse-Hoop-.git`
   Of op GitHub: groen *Code*-knoppie → *Download ZIP* en pak dit uit.
4. Maak 'n terminaal in daardie vouer oop en loop: `npm install`

### Een keer: `google-services.json` (sonder dit GEEN kennisgewings nie)

Firebase-konsole → projek `daaglikse-hoop` → ⚙ *Project settings* → *Your
apps*. Is daar reeds 'n Android-app met `com.dewaldscheepers.daaglikshoop`,
laai sy `google-services.json` af. Andersins: **Add app** → Android →
package name `com.dewaldscheepers.daaglikshoop` → *Register* → laai af.

Sit die lêer in **`android/app/`**. Dit is nie in Git nie, en dit hoort nie
daar nie. Sonder hierdie lêer BOU die app wel, maar die oggendkennisgewing
kom nooit — die `try`-blok onderaan `android/app/build.gradle` slaan dit
stilweg oor.

### Een keer: die ondertekensleutel

Google Play aanvaar 'n opdatering net as dit met dieselfde **oplaaisleutel**
onderteken is as die vorige een. Die ou TWA is deur PWABuilder gemaak; sy
zip het `signing.keystore` en `signing-key-info.txt` (met die wagwoord en
alias) bevat. Soek daardie lêers.

**Is die sleutel weg, is dit nie die einde nie.** Play Console → die app →
*Test and release* → *App integrity* → *App signing*. Staan daar dat Google
die app onderteken (*Play App Signing*, die verstek sedert 2021), kan die
OPLAAIsleutel vervang word: *Request upload key reset*, met 'n nuwe sleutel
wat Android Studio vir jou maak. Dit vat 'n paar dae.

### Elke keer: bou

```
npm install
npx cap sync android
```

`cap sync` kopieer `capacitor.config.json` (die PayFast-reël, die
statusbalk se kleur) en die inproppe na die Android-projek. Vergeet dit en
die app bou met die OU instellings. `npm run build` is NIE nodig nie — die
app laai die lewendige webwerf; die webwerf word deur Vercel gebou.

Dan **Android Studio** → *Open* → kies die **`android`**-vouer (nie die hele
projek nie) → wag totdat Gradle klaar is (die balk onderaan) →
*Build* → *Generate Signed App Bundle or APK* → **Android App Bundle** →
kies die sleutel en tik die wagwoorde → *release* → *Create*.

Die lêer beland in `android/app/release/app-release.aab`.

### Elke keer: `versionCode`

In `android/app/build.gradle`. Google Play aanvaar net 'n **hoër** getal as
wat reeds daar is. Kyk in Play Console (*App bundle explorer*) wat die
hoogste is; staan daar 3 of hoër, sit dit een hoër. Verhoog ook
`versionName` ("2.0.1" ens.).

### Toets EERS op 'n regte foon

Android Studio kan die app direk op 'n foon met 'n USB-kabel sit (*Run* ▶,
met *USB debugging* aan op die foon). Doen dit op 'n **Samsung** — dit is
waar die TWA misluk het. Gaan na:

1. Die app maak oop, en daar is GEEN "Sit Daaglikse Hoop op jou foon"-balk
   of -uitklap nie (dit sou beteken die app herken homself nie).
2. Die kennisgewing-vraag kom, en Android se eie venster vra toestemming.
3. Admin → 🔍 *Gaan die opstelling na*, en dan die toetsboodskap uit
   *Meer* → dit verskyn op die foon, ook met die app TOE.
4. 'n Stemboodskap speel tot die einde.
5. 'n Gratis e-boek laai af (die PDF maak in Chrome oop — dit is reg).
6. 'n Klein skenking: PayFast moet BINNE die app oopmaak, en ná betaling
   kom die dankie-boodskap in die app.
7. Deel 'n boodskap — die deel-venster of WhatsApp kom op.
8. Die foon se terug-knoppie maak 'n oop skerm toe in plaas van om die app
   te verlaat.
9. Stuur vir jouself 'n `/hoop/…`-skakel op WhatsApp en tik daarop: die
   APP moet oopmaak, by daardie boodskap. Maak die app toe en doen dit weer
   (koue begin), en ook terwyl die app oop is.
10. Hou die app oop, gaan na die Wallpaper en druk Stoor: Android se
    deel-venster kom op met die prent.

### Laai op

Play Console → *Test and release* → **Closed testing** eers (voeg jouself
en jou vrou as toetsers by) → *Create new release* → laai die `.aab` op.
Werk alles op julle fone, *Promote release* → **Production**.

### Draai `/go` om

Sodra die app **in produksie** is en vir enigiemand sigbaar is, sit
`PLAY_LEWE = true` in `public/go.html`. Dan kry elke Android-mens een
knoppie — *Installeer van Google Play* — in plaas van 'n les oor Chrome se
drie kolletjies.

**Moenie dit vroeër aanskakel nie.** Solank die app net in geslote toetse is,
wys die Play-skakel vir enigiemand wat nie 'n toetser is nie *"item not
found"*.

---

## Wat die app op 15 Oktober 2026 nog verkeerd gehad het

Agt dinge, almal gevind deur Capacitor se EIE bronkode te lees
(`node_modules/@capacitor/android`) eerder as om te raai. Elkeen sou op
Dewald se foon uitgekom het.

1. **Die app het homself nie herken nie.** `isInApp` (`src/firebase.js`) het
   net die TWA se merke geken. 'n Capacitor-WebView het nie een nie — dus
   *"Sit Daaglikse Hoop op jou foon"* BINNE die app, en die e-boek- en
   skenk-opspringers het nooit gekom nie (hulle wag op `isInstalled`). Dit
   is die *"fout met die popups"* uit die TWA. Nou kyk dit eerste na
   `window.Capacitor.isNativePlatform()`, wat die egte `native-bridge.js`
   stel voordat enige skrip op die bladsy loop.
2. **PayFast sou na die blaaier gaan.** Capacitor stuur elke ander gasheer na
   die foon se blaaier (`Bridge.launchIntent`). `server.allowNavigation`
   hou PayFast en ons eie twee gashere in die app.
3. **Die app het onder die statusbalk en die gebaarbalk geteken.** Met
   `viewport-fit=cover` laat Capacitor se `SystemBars` die rande aan die
   bladsy oor, en hierdie app vul net op 'n paar skerms daarvoor op. 'n Kort
   ES5-skrip in `index.html` sit BINNE die app 'n tweede viewport-reël
   sonder `cover` (Capacitor lees die LAASTE een), dan sit die app tussen
   die balke. Die webwerf en iPhone het net die eerste reël.
4. **Die statusbalk se ikone sou wit word op 'n foon in donker modus** — wit
   op ons ligte grond, dus onsigbaar. `plugins.SystemBars.style = "LIGHT"`.
5. **Deel en Stoor het niks gedoen nie.** 'n WebView het geen
   `navigator.share` nie, en Capacitor gee hom geen aflaai-hanteerder nie —
   "Stoor die wallpaper" was 'n dooie knoppie. `src/data/inheemsBrug.js`
   maak `navigator.share` Android se eie deel-venster (ook met prente, deur
   `@capacitor/share` en `@capacitor/filesystem`), en 'n blob-aflaai gaan
   deur dieselfde venster (daar kies 'n mens Galery, Lêers of WhatsApp).
   Geen skerm hoef te weet of hy in 'n app is nie. In 'n blaaier doen die
   brug NIKS.
6. **`window.open` na 'n ander werf** (wa.me, 'n PDF) word nou 'n navigasie
   wat Capacitor vang en aan die regte app gee, terwyl die app se bladsy
   bly staan. 'n WebView kan nie 'n PDF wys nie.
7. **Die terug-knoppie was dood op die tuisblad.** Sonder 'n luisteraar gaan
   `@capacitor/app` net terug as daar geskiedenis is. Die brug gaan nou
   terug deur `history.back()` (dieselfde `popstate` as Chrome) en sit die
   app weg as daar niks is nie.
8. **Die mikrofoon**: `RECORD_AUDIO` en `MODIFY_AUDIO_SETTINGS` was nie in
   die manifes nie. Android weier dit dan stilweg, en Dra Mekaar se opname
   doen niks.

En een wat die OPLAAI sou laat misluk het: **`webDir` was `dist`** — 220 MB
se e-boeke en Bybel in die app, wat niemand gebruik nie (die app laai die
lewendige werf), en Google Play weier 'n bondel bo 200 MB. Dit is nou
`android-web/`, een klein `index.html`. Die app is 8 KB se bates.

Blaaiertoetse in die scratchpad, met Capacitor se EGTE `native-bridge.js`
en 'n vals Android agter `window.androidBridge` (dieselfde boodskappe as die
egte een; 'n luisteraar word NIE dadelik beantwoord nie, soos
`setKeepAlive`):

* `kykInheemsBrug.mjs` — die gebouide weergawe, met die diensketter: geen
  installasie-uitklap, viewport sonder cover, Deel (teks en prent), Stoor,
  kanselleer → AbortError, `window.open`, die terug-knoppie; en dat 'n
  BLAAIER met dieselfde UA niks hiervan kry nie.
* `kykInheemsToken.mjs` — dieselfde, plus die kennisgewing tot in
  `fcm_tokens/<token>` met `platform: android` (vals Firestore, `vals/`).

### Wat NIE hier getoets kan word nie

Wees eerlik hieroor, want dit is waar die vorige keer misluk het:

* **Die Gradle-bou self.** Die Android-SDK kan nie hier afgelaai word nie.
  Die kode is gelees, nie gekompileer nie. Gee Android Studio 'n fout, stuur
  die rooi teks.
* **Klank in die agtergrond.** Capacitor pouseer die WebView nie
  (`KeepRunning` is aan), dus behoort 'n nota voort te speel as die skerm
  afgaan. Maar daar is GEEN beheerknoppies op die sluitskerm nie (Chrome
  wys hulle; 'n WebView nie).
* **'n Bank se 3-D Secure-blad.** Is dit nie op `payfast.co.za` nie, gaan
  daardie blad na Chrome toe. Toets 'n klein skenking.
* **Die heel eerste oopmaak SONDER internet** wys "Daaglikse Hoop laai…"
  uit `android-web/`. Ná een oopmaak met internet laai die diensketter die
  app aflyn.

## Gedeelde skakels maak die APP oop

Wie die app het en op 'n gedeelde skakel tik (`/hoop/…`, `/bid/…`,
`/reels/…`, `/boek…`, `/english`, `/volg-jesus…`, `/go…`, `/sorg…`, `/`),
kom in die app uit en nie in Chrome nie. Wie die app NIE het nie, merk niks:
die skakel maak in die blaaier oop soos altyd. Dit begin dus eers werk die
dag wanneer die app op Google Play is.

Drie stukke:

1. **Die manifes** — 'n `intent-filter` met `autoVerify="true"` vir albei
   gashere en net die paaie hierbo. Geen `/api`, geen prente.
2. **`public/.well-known/assetlinks.json`** — bestaan reeds uit die TWA se
   tyd, met vier sleutel-vingerafdrukke vir hierdie pakketnaam. Android haal
   dit af en kyk of die app se sleutel daarin staan.
3. **Die brug** — Capacitor laai altyd die tuisblad. `appBestemming()` in
   `src/data/inheemsBrug.js` lees die skakel (`getLaunchUrl` by 'n koue
   begin, `appUrlOpen` as die app reeds oop is) en gaan daarheen. `/go` (die
   installeerblad) word die tuisblad. 'n Merkie in sessionStorage keer dat
   'n herlaai weer spring.

`HoopOntvang` wys nou "Kry Daaglikse Hoop" (na `/go`) NET vir wie die app
nie het nie — binne die app, en in 'n geïnstalleerde PWA, is dit net
"Gaan na Daaglikse Hoop".

**Een ding om in Play Console na te gaan** (stap "Toets EERS" hieronder):
*Test and release → App integrity → App signing*. Die **SHA-256** van die
*App signing key certificate* moet een van die vier in `assetlinks.json`
wees. Is dit nie daar nie, stuur dit vir my en ek sit dit by — anders maak
skakels steeds in Chrome oop (niks breek nie; dit is net nie die app nie).
*Grow users → Deep links* wys of Google dit kon verifieer.

Blaaiertoetse: `kykInheemsSkakel.mjs` (koue begin, geen lus by 'n herlaai,
warm `appUrlOpen`, `/go` → tuis, vreemde gasheer → niks) en `kykHoopApp.mjs`
(die vreemdeling kry steeds die uitnodiging, die app-eienaar nie).

---

## Die inheemse kant, en wat nie weggevat mag word nie

`android/app/src/main/java/.../MainActivity.java` doen **een** ding:
`setAlgorithmicDarkeningAllowed(false)`. Dit is die reël wat keer dat die
WebView die bladsy self donker maak. Die kontrole met `WebViewFeature` is
nodig omdat die WebView apart van Android opgedateer word en die reël op 'n
ou een nie bestaan nie.

`res/values/styles.xml` is oral **Light** met `forceDarkAllowed` af.
Capacitor se voorafskrif gebruik `DayNight` vir die hoofvenster, en dít was
die swart agter die WebView.

`res/drawable/ic_stat_hoop.xml` is die statusbalk-ikoon. Android teken dit as
'n **silhoeët** — net die alfa tel. 'n Vol prentjie word 'n grys blok.

Die lanceerikone kom uit `public/icons/icon-512.png`; die skrip staan in die
scratchpad (`maakIkone.py`). Die adaptiewe voorgrond is 88dp op 'n 108dp
doek, want die stelsel wys 'n sirkel van 72dp uit die middel en 'n kleiner
prent gee 'n wit ring.
