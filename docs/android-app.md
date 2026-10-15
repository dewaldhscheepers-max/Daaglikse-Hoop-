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
npm run build
npx cap sync android
```

`cap sync` kopieer `capacitor.config.json` (met die PayFast-reël, sien
hieronder) na die Android-projek. Vergeet dit en die app bou met die OU
instellings.

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

## Twee foute wat die app op 15 Oktober 2026 nog gehad het

**Die app het homself nie herken nie.** `isInApp` in `src/firebase.js` het net
die TWA se merke geken (`android-app://`-verwyser, standalone-vertoonmodus).
'n Capacitor-WebView het nie een nie. Binne die app sou daar dus
*"Sit Daaglikse Hoop op jou foon"* en *"Wys my hoe"* gestaan het, en die
e-boek- en skenk-opspringers sou NOOIT gekom het nie (hulle wag op
`isInstalled`). Dit is presies die *"fout met die popups"* wat Dewald in die
TWA gesien het. Nou kyk `isInApp` eerste na `window.Capacitor`, en
`isInstalled` begin uit `isInApp`. Blaaiertoets: `kykInheems.mjs` (nagebootste
`window.Capacitor` met die WebView se `; wv)`-user-agent, en dieselfde UA
SONDER Capacitor moet steeds die uitklap kry).

**PayFast sou die skenking breek.** Die skenkvorm is 'n POST na
`www.payfast.co.za`. Capacitor stuur enige ander gasheer na die foon se
blaaier — as 'n GET, sonder die vorm se data — en PayFast sou 'n fout wys.
`server.allowNavigation` in `capacitor.config.json` hou PayFast en ons eie
twee gashere BINNE die app, sodat die terugkeer-adres ook in die app land.
Firebase Storage (die PDF's) staan doelbewus NIE in daardie lys nie: 'n
WebView kan nie aflaai nie, Chrome kan.

Bly 'n bank se 3-D Secure-blad by 'n ander gasheer uit, gaan dit na die
blaaier; dit is wat stap 6 hierbo moet uitwys.

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
