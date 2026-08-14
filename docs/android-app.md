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

## Om 'n weergawe uit te gee

Die Android-SDK kan **nie** in hierdie ontwikkelomgewing afgelaai word nie —
`dl.google.com` word deur die uitgangsbeleid geblokkeer. Die `.aab` word dus
op 'n rekenaar met Android Studio gebou.

**1. `google-services.json`** (net die eerste keer)

Firebase-konsole → projek `daaglikse-hoop` → ⚙ Project settings → *Your apps*
→ **Add app** → Android:

* Package name: `com.dewaldscheepers.daaglikshoop`
* Laai `google-services.json` af en sit dit in **`android/app/`**

Sonder hierdie lêer bou die app wel, maar kennisgewings werk nie — sien die
`try`-blok onderaan `android/app/build.gradle`, wat dit stilweg oorslaan.

**2. Bou**

Android Studio → *Open* → kies die **`android`**-vouer → wag vir Gradle →
*Build* → *Generate Signed App Bundle* → **Android App Bundle**.

Gebruik die **bestaande** sleutel (`signing.keystore`, alias
`daaglikshoop`). Word 'n nuwe sleutel gemaak, verwerp Google Play die
oplaai — dit is dieselfde app, nie 'n nuwe een nie.

**3. `versionCode`**

Staan in `android/app/build.gradle`. Google Play aanvaar net 'n **hoër** een
as wat reeds daar is. Die ou TWA was 1; hierdie is 3.

**4. Laai op** onder *Closed testing* eers, dan *Production*.

**5. Draai `/go` om**

Sodra die app **in produksie** is en vir enigiemand sigbaar is, sit
`PLAY_LEWE = true` in `public/go.html`. Dan kry elke Android-mens een
knoppie — *Installeer van Google Play* — in plaas van 'n les oor Chrome se
drie kolletjies.

**Moenie dit vroeër aanskakel nie.** Solank die app net in geslote toetse is,
wys die Play-skakel vir enigiemand wat nie 'n toetser is nie *"item not
found"*.

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
