# VOLG JESUS · groepe en groepchat

Fase 0 se oudit, en die plan wat daaruit kom. Dewald se §60 eis dit voordat
enige lidmaatskap, private antwoord of chat gebou word.

Lees dit voordat jy aan `vjGroepe` raak.

---

## Wat REEDS bestaan en hergebruik word

**Geverifieerde identiteit — dit is klaar gebou en werk al 'n jaar.**

`signInAnonymously` in `src/firebase.js` gee elke toestel 'n regte Firebase-uid.
Die bediener verifieer daardie ID-token behoorlik in `api/ark-ranglys.js`:
uitreiker, gehoor, verval, en die handtekening teen Google se roterende x509-
sertifikate. Die uid kom uit `eis.sub` — **nooit uit die versoek se liggaam
nie**.

Dit is presies wat §15 vra. Ons hoef dit nie te bou nie; dit word uitgetrek na
`api/_vjToken.js` sodat een kopie bestaan.

**Die diensrekening-patroon.** `api/*.mjs` met `FIREBASE_CLIENT_EMAIL` en
`FIREBASE_PRIVATE_KEY` doen reeds Firestore-skryfwerk wat 'n kliënt nie mag doen
nie (die ranglyste, Sorg, VOLG JESUS se weke).

**Die admin-geheim.** `api/_geheim.js` se `wieMag()` vir enigiets wat aan Dewald
alleen behoort.

---

## Wat NIE bestaan nie

**Geen `request.auth` in `firestore.rules`.** Die reëls is tot dusver of heeltemal
oop (`prayers`, `notes`) of heeltemal toe (`sorg_*`). Daar was nog nooit 'n reël
wat vra *wie* die leser is nie. Die groepchat is die eerste.

**Geen duursame identiteit.** 'n Anonieme uid hoort aan die INSTALLASIE. Vee
iemand die app se data uit, kry hy 'n nuwe uid. Vir 'n ranglys is dit niks; vir
"my groep" beteken dit sy groep is weg en sy ou boodskappe wys as iemand anders.

Dewald se keuse: **anoniem bly die verstek, en wie by 'n GROEP aansluit, koppel
sy rekening.** Solo verander niks — die 6 800 mense wat die app reeds het, sien
nooit 'n aanmeldskerm nie.

**Geen groepe, lidmaatskap of chat.** Alles hieronder is nuut.

---

## Waarom die chat NIE soos Sorg werk nie

Sorg lyk na die naaste ding, en dit is die verkeerde model.

Elke `sorg_*`-versameling is `read: false, write: false`. Die kliënt raak nooit
aan die data nie; alles loop deur `/api/sorg-*` met die diensrekening, en **'n
mens keur elke plasing goed** voordat dit op die muur verskyn.

Dit werk vir 'n muur. Dit werk nie vir 'n gesprek nie: 'n chat kan nie wag vir
goedkeuring nie, en 'n bediener-eindpunt wat elke paar sekondes gepols word, is
ses duisend fone maal 'n funksie-aanroep.

**Die chat gebruik dus Firestore se `onSnapshot` direk vanaf die kliënt.**
Werklik lewendig, geen polling, en die sekuriteit staan in die REËLS — op die
databasis-laag, soos §50 eis, nie in die UI nie.

Wat WEL deur die bediener loop, is alles wat 'n geheim of 'n soektog verg:
'n groep skep, met 'n kode aansluit, verlaat, verwyder, die kode roteer.
'n Kliënt mag nooit groepe deur 'n kode kan soek nie — dan is 'n kode 'n
lekkende sleutel.

---

## Die vorm in Firestore

Subversamelings, want dan kan 'n reël met een `exists()` vra of jy 'n lid is.

    vjGroepe/{groepId}
      naam, gemeente, kode, kodeAan, eienaar, ledeMagNooi,
      week, geargiveer, geskep

    vjGroepe/{groepId}/lede/{uid}          ← dok-id IS die uid
      naam, rol: deelnemer|fasiliteerder, status: aktief|weg|verwyder,
      aangesluit

    vjGroepe/{groepId}/boodskappe/{id}
      uid, naam, teks, antwoordOp, vasgespeld, kliëntId, geskep, uitgevee

    vjGroepe/{groepId}/lees/{uid}
      laasGeleesId, laasGelees

Die uid as dokumentnaam is die hele truuk: `exists(.../lede/$(request.auth.uid))`
is een goedkoop leesbewerking, en dit kan nie omseil word deur 'n id in 'n URL
te verander nie.

**Private antwoorde kom NIE hierheen nie.** Hulle bly in localStorage op die
foon, waar geen groepslid, fasiliteerder of kerk-admin daaraan kan raak nie —
sterker as wat §43 vra, want daar is niks om te beskerm nie.

---

## Wat die reëls afdwing

* lees enigiets van 'n groep: net 'n **aktiewe lid**;
* 'n boodskap skryf: net 'n aktiewe lid, en `uid` moet `request.auth.uid` wees.
  'n Mens kan dus nie namens iemand anders praat nie;
* 'n boodskap verander: net jou eie, en net om hom uit te vee;
* die groep se eie dokument, en lidmaatskap: **net die bediener**. Niemand maak
  homself 'n fasiliteerder deur 'n dokument te skryf nie;
* jou leesmerk: net joune.

Verlaat iemand die groep of word hy verwyder, word sy `lede`-dokument se status
verander en Firestore sny sy `onSnapshot` onmiddellik af. Dit is nie 'n UI-slot
nie.

---

## Die volgorde waarin dit gebou word

Elke stap is op sy eie bruikbaar en word getoets voordat die volgende begin.

1. **Suiwer logika + toetse** — kodes, name, boodskapkeuring, ongeleesde telling.
   Geen netwerk, geen Firestore. Dit is waar die meeste foute lê.
2. **Die reëls**, met 'n toets wat probeer inbreek.
3. **`api/vj-groep.mjs`** — skep, aansluit, verlaat, verwyder, kode roteer.
4. **Die kliënt se identiteit** — anoniem, en koppel by 'n groep.
5. **Onboarding** — groep-eerste, met solo volledig behoue.
6. **Die chat** — lewendig, met die permanente knoppie en die ongeleesde telling.
7. **Die brug ná die stemboodskap.**

---

## Wat NIE in V1 kom nie

§62 se lys, en dit staan hier sodat niemand dit later "net gou" byvoeg nie:
geen privaat boodskappe tussen twee mense, geen foto's, video's of stemnotas in
die chat, geen oproepe, geen openbare profiele of groepe, geen aanlyn-status,
geen ranglys.


## Uit die groepchat, maar nie uit die groep nie

Dewald: *"if someone makes nonsense on the group chat the fasiliteerder must be
able to remove that person from the group's chat. They should still do the
program and go on like normal."*

Dit is 'n APARTE ding van lidmaatskap. `status` bly `'aktief'` — die mens loop
die program klaar, hou sy week, sy antwoorde en sy plek. Net `chatAf: true` kom
by op sy lid-dokument.

**Die reels doen die werk, nie die skerm nie.** `magChat()` in `firestore.rules`
is `isLid() && myLid().chatAf != true`, en dit sit op lees, skryf, reaksies en
rapporte. 'n Skerm wat 'n gesprek wegsteek, is 'n gesprek wat enigiemand met die
SDK steeds kan lees.

`chatAf != true` en nie `== false` nie: die veld bestaan nie op lede wat voor
hierdie dag aangesluit het nie, en 'n ontbrekende veld moet BINNE beteken.

Twee dinge mag nooit: die **eienaar** kan nie stilgemaak word nie (dan kan
niemand die groep meer modereer nie), en 'n mens kan dit nie op homself doen nie.

Die mens SIEN dat dit gebeur het — `myChatAf` kom saam met `myne`, en die skerm
se dit met 'n stil reel waar die chat-knoppie sou gestaan het. 'n Knoppie wat
stilweg verdwyn, laat 'n mens dink die app is stukkend, en 'n gesprek waarin hy
praat terwyl niemand hom hoor nie, is erger as om dit te weet.

Die pad TERUG staan in die groep se instellings, en dit is die helfte wat 'n
mens vergeet om te bou.
