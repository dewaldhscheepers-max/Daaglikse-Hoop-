/* ────────────────────────────────────────────────────────────
   Wanneer mag die app vra of iemand kennisgewings wil hê?

   ── Waarom hierdie lêer bestaan ──

   Die ou reël was: is die toestemming `default`, wys die balkie drie sekondes
   ná die app oopmaak. Daar was geen geheue nie. Elke keer as die app oopgaan,
   kom hy weer.

   Dit klink onskuldig en dit is die duurste ding in hierdie hele stelsel,
   want dit werk teen homself:

     iemand druk die balkie weg
     → hy kom môre weer, en oormôre
     → op 'n dag druk die mens die BLAAIER se "Block" om daarvan ontslae
       te raak
     → en daardie besluit is PERMANENT. `Notification.requestPermission()`
       gee van toe af dadelik 'denied' terug sonder om enigiets te wys. Die
       app kan hom nooit weer vra nie. Net hy self kan dit in sy blaaier se
       instellings omkeer.

   Ons het dus met 'n balkie mense in 'n hoek gejaag waaruit die app hulle
   nie kan haal nie. 'n Vraag wat te dikwels gevra word, is nie 'n vraag nie —
   dit is 'n manier om 'n permanente "nee" te oes.

   ── Die nuwe reël ──

   Vra NÁ iemand 'n nota klaar geluister het. Op daardie oomblik het hy pas
   iets gekry wat hy wou hê, en "wil jy môre weer hoor?" is 'n redelike vraag
   in plaas van 'n onderbreking. Druk hy dit weg, wag 'n week. Ná drie keer
   vra ons nooit weer nie.

   Alles hier is suiwer: geen `window`, geen `Date.now()` binne-in. Die tyd
   kom altyd van buite af, sodat dit getoets kan word.
   ──────────────────────────────────────────────────────────── */

/* Hoeveel keer 'n mens in sy LEWE gevra word. Drie, en dan hou dit op.
   Iemand wat drie keer nee gesê het, het geantwoord. */
export const MAKS_KERE = 3

/* Hoe lank tussen vrae. 'n Week is lank genoeg dat dit nie soos gepla voel
   nie, en kort genoeg dat iemand wat die eerste keer haastig was, nog 'n
   kans kry. */
export const DAE_TUSSENIN = 7

const DAG = 24 * 60 * 60 * 1000

/* ── Mag ons vra? ──

   `toestemming` is presies wat `Notification.permission` gee:
   'granted' | 'denied' | 'default'. Enigiets anders (die blaaier ken dit
   nie) behandel ons as "moenie vra nie" — dan gebeur daar niks eerder as
   iets onverwags. */
export function magVra({ toestemming, kere = 0, laas = 0, nou = 0 }) {
  /* Reeds ja gesê: niks om te vra nie. */
  if (toestemming === 'granted') return false

  /* Reeds geblokkeer: die blaaier gaan NIKS wys nie. 'n Vraag hier is 'n
     knoppie wat niks doen — erger as om stil te bly, want dan lyk die app
     stukkend. Vir hierdie mense is daar 'n aparte pad; sien `wysPadTerug`. */
  if (toestemming === 'denied') return false

  if (toestemming !== 'default') return false

  if (kere >= MAKS_KERE) return false

  /* Nog nooit gevra nie — vra. */
  if (!laas) return true

  return nou - laas >= DAE_TUSSENIN * DAG
}

/* ── Wys ons die pad terug? ──

   Net vir wie geblokkeer het. Dit is nie 'n popup nie en dit vra niks — dit
   is 'n stil reël wat sê "kennisgewings is af" met die stappe om dit self
   aan te sit. Dit mag altyd wys, want dit onderbreek niks. */
export function wysPadTerug(toestemming) {
  return toestemming === 'denied'
}

/* ── Watter blaaier se stappe wys ons? ──

   Die stappe verskil werklik, en verkeerde stappe is erger as geen stappe
   nie: 'n mens soek 'n slotjie wat nie daar is nie en gee op. */
export function blaaierSoort(ua = '') {
  if (/SamsungBrowser/i.test(ua))                 return 'samsung'
  if (/FBAN|FBAV|FBIOS|FB_IAB/.test(ua))          return 'facebook'
  if (/iPhone|iPad|iPod/i.test(ua))               return 'ios'
  return 'chrome'
}

/* ── Wat moet die anonieme teller kry? ──

   Ons tel drie getalle en niks anders nie: hoeveel toestelle het ja gesê,
   hoeveel het nee gesê, hoeveel het nog nie geantwoord nie. Geen naam, geen
   toestel-id, niks wat na 'n mens teruglei nie.

   Die punt is om te stop met raai. Sonder dit was die beste antwoord op
   "hoeveel mense kan ek nog bereik" 'n aftreksom tussen twee getalle wat nie
   dieselfde ding meet nie — en dit was verkeerd.

   Gee die vorige waarde terug as daar niks te doen is nie, sodat dieselfde
   toestel nie elke oggend weer getel word nie. Verander die toestemming
   later, word die nuwe een getel en die ou een afgetrek. */
export function telVerandering({ toestemming, laasGetel = '' }) {
  const geldig = ['granted', 'denied', 'default']
  if (!geldig.includes(toestemming)) return null
  if (toestemming === laasGetel) return null
  return { nuwe: toestemming, oue: geldig.includes(laasGetel) ? laasGetel : '' }
}
