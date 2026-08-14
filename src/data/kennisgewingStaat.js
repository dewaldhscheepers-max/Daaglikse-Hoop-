/* ── Kry hierdie foon werklik die oggendboodskap? ──
 *
 * Ses duisend fone hang aan daardie kennisgewing, en 'n hele klomp van hulle
 * kry dit nie. Die mense weet dit nie eens nie — hulle dink die app is stil.
 * Ons kan hulle net bereik wanneer hulle die app oopmaak, en dan moet daar
 * iets op die skerm wees wat sê "hier is fout, tik hier".
 *
 * Hierdie leer besluit WATTER fout. Dit is suiwer — alles kom van buite af,
 * niks word hier gelees nie — sodat elke geval met plain node getoets kan
 * word, ook die gevalle wat 'n mens nie in 'n houer kan naboots nie.
 *
 * ── Die duur les wat hierin vassit ──
 *
 * `Notification.permission === 'granted'` is NIE genoeg nie.
 *
 * Dewald en sy vrou het albei "Toelaat" gedruk, die stelsel het "Managed by
 * Daaglikse Hoop" gewys, FCM het die boodskap aanvaar — en niks het op die
 * foon verskyn nie. Toestemming sê net dat 'n mens ja gesê het. Dit sê niks
 * oor of daar 'n lewende intekening is nie, en niks oor of die bediener
 * daardie intekening ken nie.
 *
 * Daarom drie dinge, nie een nie: toestemming, 'n intekening op HIERDIE
 * toestel, en 'n bediener wat dit kan bereik. Die derde een kan net die
 * bediener beantwoord — sien api/toets-kennisgewing.js.
 */

/* ── Die state ──
 *
 *   'reg'             alles werk — wys niks
 *   'vra'             nog nooit gevra nie — die knoppie vra
 *   'herstel'         toestemming is daar, die intekening is weg — teken
 *                     stilweg weer in, sonder om iets te wys
 *   'geblokkeer'      geweier — moenie weer vra nie, wys die stappe
 *   'installeer-eers' 'n iPhone in 'n blaaier: Apple gee push net aan 'n app
 *                     wat op die TUISSKERM staan
 *   'nie-ondersteun'  hierdie blaaier kan glad nie push doen nie
 */

export function kennisgewingStaat({
  kanPush        = true,        /* bestaan Notification/PushManager hier? */
  inheems        = false,       /* loop ons in die Play-app? */
  toestemming    = 'default',   /* 'default' | 'granted' | 'denied' */
  hetIntekening  = false,       /* 'n token of intekening op HIERDIE toestel */
  isIOS          = false,
  geinstalleer   = false,       /* op die tuisskerm */
} = {}) {
  /* In die Play-app bestaan die blaaier se push nie, maar die inheemse pad
     wel. Die volgorde moet dus die app EERSTE laat deurgaan. */
  if (!inheems && !kanPush) return 'nie-ondersteun'

  /* Apple gee web push NET aan 'n webapp wat op die tuisskerm staan. In
     Safari self kan ons nie eens vra nie — die vraag kom nie op. Dit help
     dus niks om 'n kennisgewing-knoppie te wys nie; die volgende stap is om
     dit te installeer. */
  if (isIOS && !inheems && !geinstalleer) return 'installeer-eers'

  /* Geweier is geweier. Vra 'n mens weer, gee die stelsel dadelik `denied`
     terug sonder om iets te wys, en dan het ons 'n knoppie wat niks doen —
     erger as stilte. Die stappe is die enigste pad terug. */
  if (toestemming === 'denied') return 'geblokkeer'

  if (toestemming === 'granted') return hetIntekening ? 'reg' : 'herstel'

  return 'vra'
}

/* Wys ons die knoppie? Net wanneer ons NIE met redelike sekerheid kan sê
   hierdie toestel is reg nie.

   'herstel' is doelbewus hier binne: die app maak dit self reg, sonder om
   iets te wys, en die knoppie is net daar as die herstel misluk. */
export function wysKnoppie(staat) {
  return staat !== 'reg'
}

/* Wat op die knoppie staan, en wat gebeur as 'n mens dit druk. Een plek,
   sodat die knoppie en die uitklap nooit verskillende dinge sê nie. */
export const STAAT_WOORDE = {
  vra: {
    knoppie: 'Kennisgewings af',
    titel:   'Kry elke oggend ’n boodskap',
    lyf:     'Ons stuur een boodskap per dag, om 06:30. Niks anders nie.',
    doen:    'vra',
    knop:    'Ja, stuur dit vir my',
  },
  herstel: {
    knoppie: 'Kennisgewings af',
    titel:   'Kom ons stel dit weer op',
    lyf:     'Jy het kennisgewings toegelaat, maar hierdie foon is nie ingeteken nie. Dit gebeur wanneer die app herinstalleer word.',
    doen:    'herstel',
    knop:    'Stel dit reg',
  },
  geblokkeer: {
    knoppie: 'Kennisgewings af',
    titel:   'Kennisgewings is op jou foon afgeskakel',
    lyf:     'Ons kan dit nie van hier af aanskakel nie — jou foon moet dit toelaat.',
    doen:    'stappe',
    knop:    'Wys my hoe',
  },
  'installeer-eers': {
    knoppie: 'Kennisgewings af',
    titel:   'Sit dit eers op jou tuisskerm',
    lyf:     'Op ’n iPhone stuur Apple net kennisgewings aan ’n app wat op die tuisskerm staan.',
    doen:    'installeer',
    knop:    'Wys my hoe',
  },
  'nie-ondersteun': {
    knoppie: 'Kennisgewings af',
    titel:   'Hierdie blaaier kan nie kennisgewings stuur nie',
    lyf:     'Maak Daaglikse Hoop in ’n gewone blaaier oop, dan kan ons jou elke oggend bereik.',
    doen:    'installeer',
    knop:    'Wys my hoe',
  },
}
